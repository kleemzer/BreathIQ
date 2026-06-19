// ============================================================
// BreathIQ — Netlify Function : Proxy Annuaire Santé ANS
// Proxifie l'API FHIR R4 ANS (gateway.api.esante.gouv.fr)
// pour éviter d'exposer la clé API côté client.
//
// Usage : GET /.netlify/functions/annuaire-sante?lat=46.16&lon=-1.15&rayon=10&type=doctor
//
// Variables d'environnement requises (Netlify → Site settings → Env vars) :
//   ESANTE_API_KEY  : clé obtenue sur gateway.api.esante.gouv.fr
//
// Sans clé → renvoie tableau vide (fallback OSM dans care-facilities.js)
// ============================================================
'use strict';

const ANS_BASE = 'https://gateway.api.esante.gouv.fr/fhir/v1';

// Mapping type BreathIQ → profession FHIR ANS (code SNOMED / ANS)
const TYPE_TO_PROFESSION = {
  doctor:       '10', // Médecin
  pharmacy:     '21', // Pharmacien
  nurse:        '60', // Infirmier
  clinic:       '10',
  hospital:     '10',
  emergency:    '10',
};

// Mapping FHIR PractitionerRole.code → type BreathIQ
const PROFESSION_TO_TYPE = {
  '10': 'doctor',
  '21': 'pharmacy',
  '60': 'nurse',
  '40': 'doctor', // Chirurgien-dentiste (fallback)
  '50': 'doctor', // Sage-femme (fallback)
};

exports.handler = async function (event) {
  const headers = {
    'Access-Control-Allow-Origin': 'https://breathiq.fr',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  const apiKey = process.env.ESANTE_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ source: 'ANS', practitioners: [], fallback: true, reason: 'no_api_key' }),
    };
  }

  const params = event.queryStringParameters || {};
  const lat    = parseFloat(params.lat);
  const lon    = parseFloat(params.lon);
  const rayon  = Math.min(50, Math.max(1, parseFloat(params.rayon) || 10));
  const type   = params.type || 'doctor';
  const count  = Math.min(20, parseInt(params.count) || 10);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'lat/lon invalides' }) };
  }

  const profCode = TYPE_TO_PROFESSION[type] || '10';

  // Requête FHIR : PractitionerRole avec localisation + profession
  // _include : récupérer Practitioner (nom) et Location (adresse)
  const fhirParams = new URLSearchParams({
    'location.near':           `${lat}|${lon}|${rayon * 1000}|m`, // ANS attend des mètres
    'practitioner.active':     'true',
    '_include':                'PractitionerRole:practitioner',
    '_include:iterate':        'PractitionerRole:location',
    '_count':                  String(count),
    '_format':                 'json',
  });
  // Filtre profession si pas "tous"
  if (type !== 'all') {
    fhirParams.set('role', profCode);
  }

  const url = `${ANS_BASE}/PractitionerRole?${fhirParams.toString()}`;

  let fhirData;
  try {
    const resp = await fetch(url, {
      headers: {
        'ESANTE-API-KEY': apiKey,
        'Accept': 'application/fhir+json',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => '');
      console.error(`ANS FHIR error ${resp.status}:`, errText.slice(0, 200));
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ source: 'ANS', practitioners: [], fallback: true, reason: `http_${resp.status}` }),
      };
    }

    fhirData = await resp.json();
  } catch (err) {
    console.error('ANS fetch error:', err.message);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ source: 'ANS', practitioners: [], fallback: true, reason: 'network_error' }),
    };
  }

  // Parser le Bundle FHIR
  const entries = fhirData.entry || [];

  // Indexer les ressources incluses
  const practitioners = {};
  const locations = {};
  const roles = [];

  for (const entry of entries) {
    const res = entry.resource;
    if (!res) continue;
    if (res.resourceType === 'Practitioner') {
      practitioners[res.id] = res;
    } else if (res.resourceType === 'Location') {
      locations[res.id] = res;
    } else if (res.resourceType === 'PractitionerRole') {
      roles.push(res);
    }
  }

  const results = roles.map(role => {
    const practId = role.practitioner?.reference?.split('/')[1];
    const locId   = role.location?.[0]?.reference?.split('/')[1];
    const pract   = practitioners[practId] || {};
    const loc     = locations[locId] || {};

    // Nom
    const nameObj = pract.name?.[0] || {};
    const firstName = (nameObj.given || []).join(' ');
    const lastName  = nameObj.family || '';
    const prefix    = (nameObj.prefix || []).join(' ');
    const fullName  = [prefix, firstName, lastName].filter(Boolean).join(' ').trim() || 'Professionnel de santé';

    // Spécialité
    const specCode = role.code?.[0]?.coding?.[0]?.code || '';
    const specLabel = role.code?.[0]?.coding?.[0]?.display || role.code?.[0]?.text || '';
    const facilityType = PROFESSION_TO_TYPE[specCode] || type;

    // Adresse
    const address = loc.address || {};
    const addressStr = [
      address.line?.join(', '),
      address.postalCode,
      address.city,
    ].filter(Boolean).join(' ').trim();

    // Coordonnées
    const pos = loc.position || {};
    const resLat = Number(pos.latitude);
    const resLon = Number(pos.longitude);

    // Téléphone
    const phone = role.telecom?.find(t => t.system === 'phone')?.value
               || loc.telecom?.find(t => t.system === 'phone')?.value
               || '';

    // Distance (haversine rapide)
    const dist = haversineKm(lat, lon, resLat, resLon);

    return {
      id: `ANS:${role.id}`,
      name: fullName,
      specialty: specLabel,
      type: facilityType,
      lat: resLat || null,
      lon: resLon || null,
      address: addressStr,
      phone,
      website: '',
      source: 'ANS_RPPS',
      confidence: 0.92,
      distance_km: dist !== null ? Math.round(dist * 10) / 10 : null,
      rpps: pract.identifier?.find(i => i.system?.includes('rpps'))?.value || '',
      last_verified: new Date().toISOString().slice(0, 10),
    };
  }).filter(r => r.lat && r.lon);

  results.sort((a, b) => (a.distance_km ?? 99) - (b.distance_km ?? 99));

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      source: 'ANS_RPPS',
      count: results.length,
      practitioners: results,
      fallback: false,
    }),
  };
};

function haversineKm(lat1, lon1, lat2, lon2) {
  if (!Number.isFinite(lat2) || !Number.isFinite(lon2)) return null;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) { return deg * Math.PI / 180; }
