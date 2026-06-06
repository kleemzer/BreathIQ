(function initCareFacilities(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.BIQ_CARE = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, function careFacilitiesFactory() {
  'use strict';

  const TYPE_WEIGHTS = {
    emergency_department: { emergency: 1, hospital: 0.9, clinic: 0.35, doctor: 0.2, pharmacy: 0.05 },
    medical_regulation: { emergency: 1, hospital: 0.85, clinic: 0.25, doctor: 0.15, pharmacy: 0.02 },
    doctor: { doctor: 1, health_center: 0.9, clinic: 0.85, hospital: 0.55, dispensary: 0.7, pharmacy: 0.25 },
    pharmacy: { pharmacy: 1, doctor: 0.25, clinic: 0.2, hospital: 0.1 },
    clinic: { clinic: 1, health_center: 0.85, doctor: 0.75, hospital: 0.55, dispensary: 0.65 },
    self_monitoring: { pharmacy: 0.65, doctor: 0.4, clinic: 0.35, hospital: 0.15 },
  };

  function haversineKm(a, b) {
    if (!Number.isFinite(a.lat) || !Number.isFinite(a.lon) || !Number.isFinite(b.lat) || !Number.isFinite(b.lon)) return null;
    const r = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lon - a.lon);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return r * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }

  function toRad(value) {
    return value * Math.PI / 180;
  }

  function classifyOSM(tags = {}) {
    const amenity = tags.amenity;
    const healthcare = tags.healthcare;
    const emergency = tags.emergency;
    if (emergency === 'yes' || emergency === 'designated' || amenity === 'emergency_service') return 'emergency';
    if (amenity === 'hospital' || healthcare === 'hospital') return 'hospital';
    if (amenity === 'pharmacy' || healthcare === 'pharmacy') return 'pharmacy';
    if (amenity === 'doctors' || healthcare === 'doctor') return 'doctor';
    if (amenity === 'clinic' || healthcare === 'clinic') return 'clinic';
    if (amenity === 'health_post' || healthcare === 'health_post') return 'dispensary';
    if (healthcare === 'centre' || amenity === 'social_facility') return 'health_center';
    return 'unknown';
  }

  function normalizeCareFacility(raw, source = 'OSM', query = {}) {
    const tags = raw.tags || raw;
    const lat = Number(raw.lat ?? raw.center?.lat ?? raw.latitude);
    const lon = Number(raw.lon ?? raw.center?.lon ?? raw.longitude);
    const type = source === 'OSM' ? classifyOSM(tags) : normalizeType(raw.type || tags.type);
    const origin = { lat: Number(query.lat), lon: Number(query.lon) };
    const distance = haversineKm(origin, { lat, lon });
    const name = tags.name || raw.name || tags['official_name'] || '';
    const phone = tags.phone || tags['contact:phone'] || raw.phone || '';
    const website = tags.website || tags['contact:website'] || raw.website || '';
    const address = buildAddress(tags, raw.address);

    return {
      id: `${source}:${raw.id || `${lat},${lon},${name}`}`,
      name,
      type,
      lat,
      lon,
      address,
      phone,
      website,
      opening_status: tags.opening_hours ? 'unknown' : 'unknown',
      opening_hours: tags.opening_hours || '',
      emergency_capable: type === 'emergency' || type === 'hospital' || tags.emergency === 'yes' || tags.emergency === 'designated',
      source,
      confidence: initialConfidence(source, type, { phone, address, name }),
      distance_km: distance === null ? null : Math.round(distance * 10) / 10,
      last_verified: new Date().toISOString().slice(0, 10),
    };
  }

  function normalizeType(type) {
    return ['hospital', 'emergency', 'pharmacy', 'doctor', 'clinic', 'dispensary', 'health_center'].includes(type) ? type : 'unknown';
  }

  function buildAddress(tags, fallback) {
    if (fallback) return fallback;
    const parts = [
      tags['addr:housenumber'],
      tags['addr:street'],
      tags['addr:postcode'],
      tags['addr:city'],
    ].filter(Boolean);
    return parts.join(' ').trim();
  }

  function initialConfidence(source, type, details) {
    let confidence = source === 'FINESS' || source === 'RPPS' || source === 'ANS' ? 0.82 : source === 'OSM' ? 0.62 : 0.45;
    if (type !== 'unknown') confidence += 0.08;
    if (details.name) confidence += 0.08;
    if (details.phone) confidence += 0.06;
    if (details.address) confidence += 0.04;
    return Math.min(0.98, Math.round(confidence * 100) / 100);
  }

  function dedupeFacilities(facilities) {
    const seen = new Map();
    for (const facility of facilities) {
      if (!facility.name || !Number.isFinite(facility.lat) || !Number.isFinite(facility.lon)) continue;
      const key = `${facility.name.toLowerCase().replace(/\W+/g, '')}:${Math.round(facility.lat * 10000)}:${Math.round(facility.lon * 10000)}`;
      const existing = seen.get(key);
      if (!existing || facility.confidence > existing.confidence) seen.set(key, facility);
    }
    return [...seen.values()];
  }

  function rankCareFacilities(facilities, query = {}) {
    const need = query.need || query.careNeed || 'doctor';
    const weights = TYPE_WEIGHTS[need] || TYPE_WEIGHTS.doctor;
    const maxDistance = Math.max(1, Number(query.radiusKm) || 10);

    return dedupeFacilities(facilities).map(facility => {
      const distanceScore = facility.distance_km === null ? 0.15 : Math.max(0, 1 - facility.distance_km / maxDistance);
      const typeScore = weights[facility.type] ?? 0.1;
      const sourceScore = ['FINESS', 'RPPS', 'ANS'].includes(facility.source) ? 1 : facility.source === 'OSM' ? 0.65 : 0.4;
      const detailsScore = (facility.phone ? 0.5 : 0) + (facility.opening_hours ? 0.25 : 0) + (facility.address ? 0.25 : 0);
      const freshnessScore = facility.last_verified ? 0.8 : 0.4;
      const score = 0.30 * distanceScore + 0.30 * typeScore + 0.20 * sourceScore + 0.10 * detailsScore + 0.10 * freshnessScore;
      return {
        ...facility,
        relevance_score: Math.round(score * 100),
        confidence: Math.max(facility.confidence, Math.round((score * 0.7 + facility.confidence * 0.3) * 100) / 100),
      };
    }).sort((a, b) => b.relevance_score - a.relevance_score || (a.distance_km ?? 99) - (b.distance_km ?? 99));
  }

  return { normalizeCareFacility, rankCareFacilities, dedupeFacilities, haversineKm, classifyOSM };
});
