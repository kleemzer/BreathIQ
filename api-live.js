'use strict';

/**
 * BreathIQ — Client de données en direct
 * Sources : SPF, OpenAQ, CDC, ECDC, data.gouv.fr
 * Toutes CORS-enabled, sans clé API requise (sauf OpenAQ optionnel)
 * Cache localStorage avec TTL — fallback silencieux sur données démo
 */

const BIQ_LIVE = (() => {

  // ── TTL par type de données ────────────────────────────────────
  const TTL = {
    airQuality:  5  * 60 * 1000,   // 5 min  — OpenAQ
    flu:         60 * 60 * 1000,   // 1 h    — SPF, CDC
    outbreaks:   6  * 60 * 60 * 1000, // 6 h — ECDC
    stocks:      24 * 60 * 60 * 1000, // 24 h — données stocks
  };

  // ── Endpoints ─────────────────────────────────────────────────
  const EP = {
    // SPF — API Open Data avec CORS headers (URL v2.1 vérifiée 2026)
    spf_grippe: {
      label: 'Santé Publique France — Grippe',
      url: 'https://data.santepubliquefrance.fr/api/explore/v2.1/catalog/datasets/donnees-de-surveillance-des-cas-de-grippe-vus-en-consultations-de-medecins-sentinelles-en-france/records?limit=5&order_by=semaine_annee_calc+desc&select=tx_av_inc100_h,semaine_annee_calc',
      ttl: 'flu',
      region: 'FR',
    },
    // OpenAQ v3 nécessite une clé API pour CORS — utiliser v2 (public, sans clé)
    openaq_fr: {
      label: 'OpenAQ — PM2.5 France',
      url: 'https://api.openaq.org/v2/latest?country=FR&parameter=pm25&limit=10',
      ttl: 'airQuality',
      region: 'FR',
    },
    openaq_world: {
      label: 'OpenAQ — PM2.5 Mondial',
      url: 'https://api.openaq.org/v2/latest?parameter=pm25&limit=20&order_by=lastUpdated&sort=desc',
      ttl: 'airQuality',
      region: 'WORLD',
    },
    // CDC — endpoint Socrata actif en 2026
    cdc_flu: {
      label: 'CDC — Grippe USA',
      url: 'https://data.cdc.gov/resource/ph55-sci7.json?$limit=5&$order=weekend_date+DESC',
      ttl: 'flu',
      region: 'US',
    },
    // ECDC Mpox — endpoint actif
    ecdc_mpox: {
      label: 'ECDC — Mpox Europe',
      url: 'https://opendata.ecdc.europa.eu/monkeypox/casedistribution/json',
      ttl: 'outbreaks',
      region: 'EU',
    },
  };

  // ── État interne ──────────────────────────────────────────────
  const state = {
    status: 'idle',       // idle | loading | live | partial | error
    liveCount: 0,         // combien de sources sont en direct
    totalCount: 0,
    lastFetch: null,
    data: {},             // { spf_grippe: {...}, openaq_fr: {...}, ... }
    errors: {},
  };

  // ── Cache localStorage ─────────────────────────────────────────
  function cacheGet(key) {
    try {
      const raw = localStorage.getItem(`biq-live-${key}`);
      if (!raw) return null;
      const { data, ts } = JSON.parse(raw);
      return { data, ts };
    } catch { return null; }
  }

  function cacheSet(key, data) {
    try {
      localStorage.setItem(`biq-live-${key}`, JSON.stringify({ data, ts: Date.now() }));
    } catch { /* localStorage plein */ }
  }

  function isFresh(cached, ttlKey) {
    if (!cached) return false;
    return Date.now() - cached.ts < TTL[ttlKey];
  }

  // ── Fetch avec timeout et cache ────────────────────────────────
  async function fetchWithCache(key, url, ttlKey) {
    const cached = cacheGet(key);
    if (isFresh(cached, ttlKey)) {
      return { data: cached.data, source: 'cache', fresh: true };
    }
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      cacheSet(key, data);
      return { data, source: 'api', fresh: true };
    } catch (err) {
      const stale = cacheGet(key);
      if (stale) return { data: stale.data, source: 'stale', fresh: false };
      return { data: null, source: 'error', fresh: false, error: err.message };
    }
  }

  // ── Parseurs de données ────────────────────────────────────────

  /**
   * SPF Grippe → taux grippal actuel pour la France
   * @returns {{ rate: number|null, week: string, label: string }}
   */
  function parseSPFGrippe(raw) {
    try {
      const recs = raw.results || raw.records || [];
      if (!recs.length) return null;
      const latest = recs[0].record?.fields || recs[0];
      const rate = parseFloat(latest.taux_pour_100000_habitants || latest['taux_pour_100000_habitants']);
      const week = latest.date_de_debut || latest['date_de_debut'] || '';
      if (isNaN(rate)) return null;
      return {
        rate,      // incidence / 100k
        week,
        label: `Grippe ${rate.toFixed(0)}/100k (SPF semaine ${week.slice(0,10)})`,
        viralScore: Math.min(100, Math.round(rate / 3)), // normalise : seuil épidémique ~150/100k
      };
    } catch { return null; }
  }

  /**
   * OpenAQ PM2.5 → AQI score (0-100)
   * Seuil OMS 2021 : 15 µg/m³ journalier
   */
  function parseOpenAQ(raw) {
    try {
      const results = raw.results || raw;
      if (!results.length) return null;
      const values = results.map(r => r.value).filter(v => typeof v === 'number' && v >= 0);
      if (!values.length) return null;
      const avg = values.reduce((a,b) => a+b, 0) / values.length;
      const aqiScore = Math.min(100, Math.round((avg / 75) * 100)); // 75 µg/m³ = seuil critique
      return {
        pm25: Math.round(avg * 10) / 10,
        aqiScore,
        label: `PM2.5 ${avg.toFixed(1)} µg/m³ (OMS: ≤15)`,
        aboveWHO: avg > 15,
        city: results[0].location?.city || results[0].city || '—',
      };
    } catch { return null; }
  }

  /**
   * CDC Flu → activité grippale USA
   */
  function parseCDCFlu(raw) {
    try {
      const rec = Array.isArray(raw) ? raw[0] : raw;
      if (!rec) return null;
      const level = rec.activity_level || rec.activity_level_label || '';
      const week = rec.week_end || '';
      return {
        level: level.toString(),
        week,
        label: `Grippe USA niveau ${level} (CDC sem. ${week.slice(0,10)})`,
        viralScore: Math.min(100, Math.round(parseFloat(level) * 10) || 30),
      };
    } catch { return null; }
  }

  /**
   * ECDC Mpox → nombre de cas Europe (dernier mois)
   */
  function parseECDCMpox(raw) {
    try {
      const data = raw.data || raw;
      if (!data.length) return null;
      const recent = data.filter(r => {
        const d = new Date(r.DateRep || r.date_rep || '');
        return (Date.now() - d.getTime()) < 30 * 24 * 3600 * 1000;
      });
      const total = recent.reduce((s, r) => s + (parseInt(r.ConfCases || r.cases || 0) || 0), 0);
      return {
        cases30d: total,
        label: `Mpox Europe: ${total} cas (30 jours, ECDC)`,
        active: total > 10,
      };
    } catch { return null; }
  }

  // ── Open-Meteo air quality géolocalisée ───────────────────────
  function fetchOpenMeteoForLocation(lat, lon) {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&hourly=pm2_5,european_aqi&timezone=auto&forecast_days=1`;
    return fetchWithCache(`openmeteo_${Math.round(lat)}_${Math.round(lon)}`, url, 'airQuality');
  }

  function parseOpenMeteo(raw) {
    try {
      const hourly = raw.hourly || {};
      const pm25 = (hourly.pm2_5 || []).filter(v => v != null);
      const aqi  = (hourly.european_aqi || []).filter(v => v != null);
      if (!pm25.length) return null;
      const avgPm25 = pm25.reduce((a,b) => a+b, 0) / pm25.length;
      const latestAqi = aqi[aqi.length - 1] || Math.round((avgPm25 / 75) * 100);
      return {
        pm25: Math.round(avgPm25 * 10) / 10,
        aqiScore: Math.min(100, Math.round(latestAqi)),
        label: `PM2.5 ${avgPm25.toFixed(1)} µg/m³ (Open-Meteo)`,
        aboveWHO: avgPm25 > 15,
      };
    } catch { return null; }
  }

  // ── Fetch automatique avec géolocalisation ─────────────────────
  function fetchWithGeolocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const result = await fetchOpenMeteoForLocation(latitude, longitude);
        if (result.data) {
          const parsed = parseOpenMeteo(result.data);
          if (parsed) {
            state.data.openmeteo_local = { data: result.data, source: result.source, ep: { ttl: 'airQuality', region: 'LOCAL' } };
            if (state.liveCount === 0 && result.source === 'api') state.liveCount++;
            const fullParsed = buildParsedData();
            fullParsed.localAqi = parsed;
            dispatch('update', { state, parsed: fullParsed });
          }
        }
      },
      () => { /* géolocalisation refusée — silencieux */ },
      { timeout: 8000, maximumAge: 300000 }
    );
  }

  // ── Dispatch d'événement personnalisé ──────────────────────────
  function dispatch(type, detail) {
    window.dispatchEvent(new CustomEvent(`biq-${type}`, { detail }));
  }

  // ── Fetch toutes les sources ───────────────────────────────────
  async function fetchAll() {
    state.status = 'loading';
    state.totalCount = Object.keys(EP).length;
    dispatch('status', { status: 'loading' });

    const tasks = Object.entries(EP).map(async ([key, ep]) => {
      const result = await fetchWithCache(key, ep.url, ep.ttl);
      state.data[key] = { ...result, ep };
      if (result.source === 'api' || result.source === 'cache') state.liveCount++;
      return { key, result };
    });

    const results = await Promise.allSettled(tasks);
    state.lastFetch = Date.now();

    // Analyse des résultats
    const parsed = buildParsedData();
    state.status = state.liveCount > 0 ? (state.liveCount >= 2 ? 'live' : 'partial') : 'error';

    dispatch('update', { state, parsed });
    dispatch('status', { status: state.status, liveCount: state.liveCount });

    return parsed;
  }

  // ── Construction des données normalisées ───────────────────────
  function buildParsedData() {
    const out = { sources: {} };

    if (state.data.spf_grippe?.data) {
      out.frFlu = parseSPFGrippe(state.data.spf_grippe.data);
      out.sources.spfGrippe = state.data.spf_grippe.source;
    }
    if (state.data.openaq_fr?.data) {
      out.frAqi = parseOpenAQ(state.data.openaq_fr.data);
      out.sources.openaqFr = state.data.openaq_fr.source;
    }
    if (state.data.openaq_world?.data) {
      out.worldAqi = parseOpenAQ(state.data.openaq_world.data);
      out.sources.openaqWorld = state.data.openaq_world.source;
    }
    if (state.data.cdc_flu?.data) {
      out.usFlu = parseCDCFlu(state.data.cdc_flu.data);
      out.sources.cdcFlu = state.data.cdc_flu.source;
    }
    if (state.data.ecdc_mpox?.data) {
      out.ecMpox = parseECDCMpox(state.data.ecdc_mpox.data);
      out.sources.ecdcMpox = state.data.ecdc_mpox.source;
    }
    if (state.data.openmeteo_local?.data) {
      out.localAqi = parseOpenMeteo(state.data.openmeteo_local.data);
      out.sources.openMeteoLocal = state.data.openmeteo_local.source;
    }

    out.lastUpdate = new Date().toISOString();
    return out;
  }

  // ── Auto-refresh ───────────────────────────────────────────────
  let refreshTimer = null;
  let nextRefreshAt = null;

  function startAutoRefresh(intervalMs = 5 * 60 * 1000) {
    fetchAll().then(() => fetchWithGeolocation());
    refreshTimer = setInterval(() => {
      fetchAll().then(() => fetchWithGeolocation());
    }, intervalMs);
    nextRefreshAt = Date.now() + intervalMs;
    dispatch('refresh-scheduled', { nextRefreshAt, intervalMs });
  }

  function stopAutoRefresh() {
    if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null; }
  }

  // ── API publique ───────────────────────────────────────────────
  return {
    start: (interval) => startAutoRefresh(interval),
    stop: stopAutoRefresh,
    refresh: fetchAll,
    getState: () => state,
    getParsed: buildParsedData,
    on: (event, handler) => window.addEventListener(`biq-${event}`, handler),
    TTL,
  };

})();

// Export pour usage dans script.js (déjà dans le même scope navigateur)
if (typeof module !== 'undefined') {
  module.exports = { BIQ_LIVE };
}
