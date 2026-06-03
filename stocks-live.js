'use strict';

/**
 * stocks-live.js — BreathIQ
 * Couche fetch + cache + scoring pour la carte FFP2 mondiale.
 * Pas de backend requis : tout en localStorage + API publiques.
 */

// ── Clés API (null = fallback gratuit activé) ─────────────────────────────────
const API_KEYS = {
  waqi:         null,   // https://aqicn.org/api/
  googlePlaces: null,   // fallback premium pharmacies
  synapse:      null,   // https://www.synapse-medicine.com/fr/api-rupture-stock-medicaments
};

// ── TTL Cache ────────────────────────────────────────────────────────────────
const CACHE_TTL = {
  pharmacies: 24 * 60 * 60 * 1000,
  shortages:   4 * 60 * 60 * 1000,
  aqi:        30 * 60 * 1000,
  epi:        12 * 60 * 60 * 1000,
  korean:      1 * 60 * 60 * 1000,
};

// ── Helpers cache localStorage ────────────────────────────────────────────────
function cacheGet(key) {
  try {
    const raw = localStorage.getItem('biq-live-' + key);
    if (!raw) return null;
    const { data, ts, ttl } = JSON.parse(raw);
    if (Date.now() - ts > ttl) return null;
    return data;
  } catch { return null; }
}

function cacheSet(key, data, ttl) {
  try {
    localStorage.setItem('biq-live-' + key, JSON.stringify({ data, ts: Date.now(), ttl }));
  } catch { /* localStorage plein */ }
}

function cachePeek(key) {
  try {
    const raw = localStorage.getItem('biq-live-' + key);
    if (!raw) return null;
    const { data, ts, ttl } = JSON.parse(raw);
    return { data, age: Date.now() - ts, ttl, fresh: Date.now() - ts <= ttl };
  } catch { return null; }
}

// ── Fetch générique avec cache + fallback sur données périmées ─────────────────
async function fetchWithCache(url, cacheKey, ttl, options = {}) {
  const cached = cacheGet(cacheKey);
  if (cached) return { data: cached, fromCache: true, stale: false };

  try {
    const resp = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(8000),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    cacheSet(cacheKey, data, ttl);
    return { data, fromCache: false, stale: false };
  } catch (err) {
    const stale = cachePeek(cacheKey);
    if (stale) return { data: stale.data, fromCache: true, stale: true };
    throw err;
  }
}

// ── Overpass API — proxy local d'abord, fallback direct multi-endpoint ────────
const OVERPASS_DIRECT = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
];
let _lastOverpassCall = 0;
const OVERPASS_MIN_INTERVAL = 2000;

async function _overpassQuery(query) {
  // 1. Proxy local Vercel (/api/overpass) — fonctionne si disponible
  try {
    const resp = await fetch('/api/overpass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: query }),
      signal: AbortSignal.timeout(22000),
    });
    if (resp.ok) return await resp.json();
  } catch { /* proxy absent (Netlify) — fallback direct */ }

  // 2. Endpoints Overpass directs — throttle pour éviter ban IP
  const wait = OVERPASS_MIN_INTERVAL - (Date.now() - _lastOverpassCall);
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  _lastOverpassCall = Date.now();

  for (const endpoint of OVERPASS_DIRECT) {
    try {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(query),
        signal: AbortSignal.timeout(22000),
      });
      if (resp.ok) return await resp.json();
    } catch { /* essayer endpoint suivant */ }
  }
  throw new Error('Tous les endpoints Overpass sont indisponibles');
}

// ── Pharmacies OSM — node + way + relation (nwr) ──────────────────────────────
async function fetchPharmaciesOSM(bounds) {
  const { south, west, north, east } = bounds;
  const latSpan = north - south;
  const lngSpan = east - west;
  if (latSpan > 5 || lngSpan > 8) return { pharmacies: [], limited: true };

  const bbox = `${south.toFixed(4)},${west.toFixed(4)},${north.toFixed(4)},${east.toFixed(4)}`;
  const cacheKey = `osm-ph2-${bbox.replace(/[.,\-]/g, '_')}`;

  const cached = cacheGet(cacheKey);
  if (cached) return { pharmacies: cached, fromCache: true };

  // nwr = node + way + relation — capture toutes les pharmacies OSM
  // out center = renvoie les coordonnées du centroïde pour ways/relations
  const query = `[out:json][timeout:25];nwr["amenity"="pharmacy"](${bbox});out center body;`;

  try {
    const json = await _overpassQuery(query);

    const pharmacies = (json.elements || []).map(el => {
      // ways/relations ont leurs coords dans el.center, nodes directement dans el
      const lat = el.lat ?? el.center?.lat;
      const lng = el.lon ?? el.center?.lon;
      if (!lat || !lng) return null;
      return {
        id: el.id,
        lat, lng,
        name: el.tags?.name || el.tags?.['name:fr'] || el.tags?.['name:en'] || 'Pharmacie',
        opening_hours: el.tags?.opening_hours || null,
        phone: el.tags?.phone || el.tags?.['contact:phone'] || null,
        website: el.tags?.website || el.tags?.['contact:website'] || null,
        addr: [
          el.tags?.['addr:housenumber'],
          el.tags?.['addr:street'],
          el.tags?.['addr:postcode'],
          el.tags?.['addr:city'],
        ].filter(Boolean).join(' '),
        dispensing: el.tags?.dispensing !== 'no',
        wheelchair: el.tags?.wheelchair || null,
      };
    }).filter(Boolean);

    cacheSet(cacheKey, pharmacies, CACHE_TTL.pharmacies);
    return { pharmacies, fromCache: false };
  } catch (err) {
    console.warn('[stocks-live] fetchPharmaciesOSM error:', err.message);
    return { pharmacies: [], error: err.message };
  }
}

// Korean mask API (HIRA/NIA) — DÉSACTIVÉE : endpoint inactif depuis 2023
// function fetchKoreanMaskStock() { return null; }

// ── AQI — Open-Meteo (gratuit) + WAQI fallback ────────────────────────────────
async function fetchAQI(lat, lng) {
  const cacheKey = `aqi-${Math.round(lat * 10)}-${Math.round(lng * 10)}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  // Priorité : Open-Meteo (gratuit, pas de clé)
  const omUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}&current=pm10,pm2_5,european_aqi&timezone=auto`;
  try {
    const resp = await fetch(omUrl, { signal: AbortSignal.timeout(8000) });
    if (!resp.ok) throw new Error(`Open-Meteo ${resp.status}`);
    const json = await resp.json();
    const result = {
      aqi: json.current?.european_aqi ?? null,
      pm25: json.current?.pm2_5 ?? null,
      pm10: json.current?.pm10 ?? null,
      source: 'open-meteo',
    };
    cacheSet(cacheKey, result, CACHE_TTL.aqi);
    return result;
  } catch {}

  // Fallback : WAQI (si clé présente)
  if (API_KEYS.waqi) {
    try {
      const wUrl = `https://api.waqi.info/feed/geo:${lat};${lng}/?token=${API_KEYS.waqi}`;
      const wr = await fetch(wUrl, { signal: AbortSignal.timeout(8000) });
      const wj = await wr.json();
      if (wj.status === 'ok') {
        const result = { aqi: wj.data?.aqi ?? null, source: 'waqi' };
        cacheSet(cacheKey, result, CACHE_TTL.aqi);
        return result;
      }
    } catch {}
  }

  return null;
}

// ANSM ruptures (data.gouv) — DÉSACTIVÉE : endpoint retourne HTTP 405
// Sera remplacée en V1 par une Netlify Function avec scraping du nouveau portail ANSM
async function fetchShortagesFR() {
  return { count: 0, source: 'disabled' };
}

// ── Score de disponibilité composite ─────────────────────────────────────────
function computeAvailabilityScore(countryId, signals = {}) {
  const {
    shortageReports = 0,
    pharmacyDensity = 50,
    aqiLevel = null,
    epiZscore = 0,
    directStock = null,
  } = signals;

  if (directStock != null) {
    if (typeof directStock === 'string') return koreanStatToScore(directStock);
    return Math.max(0, Math.min(100, directStock));
  }

  const shortageBase  = shortageReports > 0 ? Math.max(0, 50 - shortageReports * 8) : 50;
  const densityBonus  = Math.min(25, (pharmacyDensity / 100) * 25);
  const epiPenalty    = epiZscore > 2.0 ? -15 : epiZscore > 1.5 ? -8 : 0;
  const aqiPenalty    = aqiLevel != null && aqiLevel > 150 ? -5 : 0;

  return Math.max(0, Math.min(100, shortageBase + densityBonus + epiPenalty + aqiPenalty));
}

function scoreToAlertLevel(score) {
  if (score >= 76) return 'SUFFICIENT';
  if (score >= 51) return 'MODERATE';
  if (score >= 26) return 'LOW';
  return 'CRITICAL';
}

// ── Enrichissement asynchrone de STOCKS_DEMO_DATA ────────────────────────────
async function enrichStocksData() {
  if (typeof STOCKS_DEMO_DATA === 'undefined') return [];
  const enriched = STOCKS_DEMO_DATA.map(d => ({
    ...d,
    liveScore: null,
    liveSource: 'static',
  }));

  // Korean API + ANSM désactivées (endpoints inactifs)
  // Les scores KR et FR utilisent les données statiques STOCKS_DEMO_DATA

  return enriched;
}

// ── Countdown et auto-refresh ─────────────────────────────────────────────────
const REFRESH_INTERVAL = 4 * 60 * 60 * 1000;
const REFRESH_KEY = 'biq-stocks-last-refresh';

function getNextRefreshMs() {
  const last = parseInt(localStorage.getItem(REFRESH_KEY) || '0', 10);
  return Math.max(0, last + REFRESH_INTERVAL - Date.now());
}

function markRefreshed() {
  localStorage.setItem(REFRESH_KEY, String(Date.now()));
}

function formatCountdown(ms) {
  if (ms <= 0) return 'Mise à jour disponible';
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return h > 0
    ? `MAJ dans ${h}h ${String(m).padStart(2, '0')}min`
    : `MAJ dans ${m}min`;
}

function scheduleAutoRefresh(onRefresh) {
  markRefreshed();
  const badge = document.getElementById('refreshCountdown');
  let iv;

  function tick() {
    const ms = getNextRefreshMs();
    if (badge) badge.textContent = formatCountdown(ms);
    if (ms <= 0) {
      clearInterval(iv);
      onRefresh().then(() => scheduleAutoRefresh(onRefresh));
    }
  }

  iv = setInterval(tick, 30_000);
  tick();
  return () => clearInterval(iv);
}

// ── AQI → couleur CSS ─────────────────────────────────────────────────────────
function aqiToColor(aqi) {
  if (aqi == null) return '#9CA3AF';
  if (aqi > 200) return '#DC2626';
  if (aqi > 150) return '#EA580C';
  if (aqi > 100) return '#CA8A04';
  if (aqi > 50)  return '#65A30D';
  return '#16A34A';
}

function aqiToLabel(aqi) {
  if (aqi == null) return 'Inconnu';
  if (aqi > 200) return 'Très mauvais';
  if (aqi > 150) return 'Mauvais';
  if (aqi > 100) return 'Médiocre';
  if (aqi > 50)  return 'Moyen';
  return 'Bon';
}

// ── Exposition publique ───────────────────────────────────────────────────────
window.StocksLive = {
  fetchPharmaciesOSM,
  fetchKoreanMaskStock,
  fetchAQI,
  fetchShortagesFR,
  computeAvailabilityScore,
  scoreToAlertLevel,
  enrichStocksData,
  scheduleAutoRefresh,
  formatCountdown,
  getNextRefreshMs,
  aqiToColor,
  aqiToLabel,
  koreanStatToScore,
  cacheGet,
  cacheSet,
  cachePeek,
};
