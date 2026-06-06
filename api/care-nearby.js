// BreathIQ care-nearby API: local healthcare facility aggregator.
// Receives only location + care need. Symptoms are never sent to this API.
const https = require('https');
const http = require('http');
const { normalizeCareFacility, rankCareFacilities } = require('../js/care-facilities.js');

const CACHE = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000;
const MAX_RADIUS_KM = 25;

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
];

function send(res, status, payload) {
  res.status(status).json(payload);
}

function readCache(key) {
  const hit = CACHE.get(key);
  if (!hit) return null;
  if (Date.now() - hit.ts > CACHE_TTL_MS) {
    CACHE.delete(key);
    return null;
  }
  return hit.data;
}

function writeCache(key, data) {
  CACHE.set(key, { ts: Date.now(), data });
}

function validateQuery(query) {
  const lat = Number(query.lat);
  const lon = Number(query.lon);
  const radiusKm = Math.min(MAX_RADIUS_KM, Math.max(1, Number(query.radiusKm || query.radius || 10)));
  const need = String(query.need || query.careNeed || 'doctor');

  if (!Number.isFinite(lat) || lat < -90 || lat > 90) throw new Error('Invalid lat');
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) throw new Error('Invalid lon');
  if (!/^(emergency_department|medical_regulation|doctor|pharmacy|clinic|self_monitoring)$/.test(need)) {
    throw new Error('Invalid need');
  }

  return { lat, lon, radiusKm, need };
}

function overpassQuery({ lat, lon, radiusKm, need }) {
  const radius = Math.round(radiusKm * 1000);
  const amenity = need === 'pharmacy'
    ? 'pharmacy'
    : need === 'emergency_department' || need === 'medical_regulation'
      ? 'hospital|clinic'
      : 'hospital|clinic|doctors|pharmacy|health_post';
  const healthcare = need === 'pharmacy'
    ? 'pharmacy'
    : 'hospital|clinic|doctor|centre|health_post|pharmacy';

  return `[out:json][timeout:20];
(
  node[amenity~"${amenity}"](around:${radius},${lat},${lon});
  way[amenity~"${amenity}"](around:${radius},${lat},${lon});
  relation[amenity~"${amenity}"](around:${radius},${lat},${lon});
  node[healthcare~"${healthcare}"](around:${radius},${lat},${lon});
  way[healthcare~"${healthcare}"](around:${radius},${lat},${lon});
  relation[healthcare~"${healthcare}"](around:${radius},${lat},${lon});
  node[emergency="yes"](around:${radius},${lat},${lon});
  way[emergency="yes"](around:${radius},${lat},${lon});
);
out center 80;`;
}

function postOverpass(endpoint, query) {
  return new Promise((resolve, reject) => {
    const body = 'data=' + encodeURIComponent(query);
    const url = new URL(endpoint);
    const lib = url.protocol === 'https:' ? https : http;
    const req = lib.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
        'User-Agent': 'BreathIQ/1.0 care-nearby',
      },
      timeout: 18000,
    }, response => {
      if (response.statusCode < 200 || response.statusCode >= 300) {
        response.resume();
        reject(new Error(`HTTP ${response.statusCode} from ${endpoint}`));
        return;
      }
      let data = '';
      response.on('data', chunk => { data += chunk; });
      response.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error('Invalid Overpass JSON')); }
      });
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('Overpass timeout')); });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function fetchOSMCareFacilities(query) {
  const q = overpassQuery(query);
  let lastError;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const data = await postOverpass(endpoint, q);
      return (data.elements || [])
        .map(element => normalizeCareFacility(element, 'OSM', query))
        .filter(facility => facility.name && facility.type !== 'unknown');
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('Overpass unavailable');
}

async function fetchFranceOfficialCareFacilities() {
  // Extension point:
  // - API FHIR Annuaire Santé ANS
  // - FINESS public datasets
  // - RPPS / Santé.fr / regional open-data feeds
  // These adapters should return normalized facilities and must not require
  // user symptoms, only location + requested care type.
  return [];
}

async function fetchFallbackCareFacilities() {
  return [];
}

async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return send(res, 405, { error: 'Method Not Allowed' });
  }

  let query;
  try {
    query = validateQuery(req.query || {});
  } catch (error) {
    return send(res, 400, { error: error.message });
  }

  const cacheKey = `${Math.round(query.lat * 1000)}:${Math.round(query.lon * 1000)}:${query.radiusKm}:${query.need}`;
  const cached = readCache(cacheKey);
  if (cached) {
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=600');
    return send(res, 200, { ...cached, cache: 'memory' });
  }

  const providers = [
    { id: 'OSM', fetch: fetchOSMCareFacilities },
    { id: 'FR_OFFICIAL', fetch: fetchFranceOfficialCareFacilities },
    { id: 'FALLBACK', fetch: fetchFallbackCareFacilities },
  ];

  const diagnostics = [];
  let facilities = [];
  for (const provider of providers) {
    try {
      const next = await provider.fetch(query);
      diagnostics.push({ provider: provider.id, count: next.length, ok: true });
      facilities = facilities.concat(next);
    } catch (error) {
      diagnostics.push({ provider: provider.id, count: 0, ok: false, error: error.message });
    }
  }

  const ranked = rankCareFacilities(facilities, query).slice(0, 20);
  const payload = {
    query,
    results: ranked,
    providers: diagnostics,
    generatedAt: new Date().toISOString(),
    privacy: 'Only lat/lon/care need were processed. Symptoms are not sent to this endpoint.',
  };

  writeCache(cacheKey, payload);
  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=600');
  return send(res, ranked.length ? 200 : 200, payload);
}

module.exports = handler;
