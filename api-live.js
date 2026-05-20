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
    spf_grippe: {
      label: 'Santé Publique France — Grippe',
      url: 'https://data.santepubliquefrance.fr/api/explore/v2.1/catalog/datasets/donnees-de-surveillance-des-cas-de-grippe-vus-en-consultations-de-medecins-sentinelles-en-france/records?limit=5&order_by=date_de_debut+desc&select=taux_pour_100000_habitants,date_de_debut,region',
      ttl: 'flu',
      region: 'FR',
    },
    spf_urgences: {
      label: 'SPF — Urgences hospitalières',
      url: 'https://data.santepubliquefrance.fr/api/explore/v2.1/catalog/datasets/donnees-des-urgences-hospitalieres/records?limit=5&order_by=date_de_passage+desc&select=date_de_passage,nbre_pass_corona,dep',
      ttl: 'flu',
      region: 'FR',
    },
    openaq_fr: {
      label: 'OpenAQ — PM2.5 France',
      url: 'https://api.openaq.org/v3/measurements?country_id=FR&parameter=pm25&limit=10&sort=desc&order_by=datetime',
      ttl: 'airQuality',
      region: 'FR',
    },
    openaq_world: {
      label: 'OpenAQ — PM2.5 Mondial',
      url: 'https://api.openaq.org/v3/measurements?parameter=pm25&limit=20&sort=desc&order_by=datetime',
      ttl: 'airQuality',
      region: 'WORLD',
    },
    cdc_flu: {
      label: 'CDC — Grippe USA',
      url: 'https://data.cdc.gov/resource/cvqj-4bfd.json?$limit=5&$order=week_end+DESC',
      ttl: 'flu',
      region: 'US',
    },
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

    return out;
  }

  // ── Auto-refresh ───────────────────────────────────────────────
  let refreshTimer = null;
  let nextRefreshAt = null;

  function startAutoRefresh(intervalMs = 5 * 60 * 1000) {
    fetchAll();
    refreshTimer = setInterval(() => {
      fetchAll();
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
