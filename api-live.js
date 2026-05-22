'use strict';

/**
 * BreathIQ — Client de données en direct (v2)
 * Sources :
 *   - SPF (Santé Publique France) — grippe France
 *   - WAQI/AQICN (World Air Quality Index) — qualité air géolocalisée, 11 polluants, prévisions 7j
 *   - Open-Meteo Air Quality — PM2.5, AQI européen, pollen (alder/birch/grass/olive/ragweed)
 *   - OpenAQ v2 — PM2.5 mondial / France
 *   - CDC — grippe USA
 *   - ECDC — Mpox Europe
 *   - SUM'EAU (data.gouv) — SARS-CoV-2 dans les eaux usées, signal précoce France
 * Toutes CORS-enabled sans clé API (WAQI : token `demo` ou `window.BIQ_WAQI_KEY`)
 */

const BIQ_LIVE = (() => {

  // ── TTL par type de données ────────────────────────────────────
  const TTL = {
    airQuality:  5  * 60 * 1000,   // 5 min  — WAQI, OpenAQ
    flu:         60 * 60 * 1000,   // 1 h    — SPF, CDC
    outbreaks:   6  * 60 * 60 * 1000, // 6 h — ECDC, SUM'EAU
    stocks:      24 * 60 * 60 * 1000, // 24 h
  };

  // ── Endpoints statiques (sans géolocalisation) ─────────────────
  const EP = {
    // SPF — grippe France via data.gouv.fr (miroir stable, CORS *)
    spf_grippe: {
      label: 'Santé Publique France — Grippe',
      url: 'https://www.data.gouv.fr/api/1/datasets/donnees-de-surveillance-des-cas-de-grippe-vus-en-consultations-de-medecins-sentinelles-en-france/?format=json',
      ttl: 'flu',
      region: 'FR',
      disabled: true, // endpoint instable — remplacé par Open-Meteo + WAQI
    },
    // CDC — grippe USA (endpoint v2 actif)
    cdc_flu: {
      label: 'CDC — Grippe USA (ILI)',
      url: 'https://data.cdc.gov/resource/ks3g-spdg.json?$limit=5&$order=week_start+DESC',
      ttl: 'flu',
      region: 'US',
    },
    // ECDC — Mpox Europe
    ecdc_mpox: {
      label: 'ECDC — Mpox Europe',
      url: 'https://opendata.ecdc.europa.eu/monkeypox/casedistribution/json',
      ttl: 'outbreaks',
      region: 'EU',
    },
    // SUM'EAU — SARS-CoV-2 eaux usées France
    sumeau: {
      label: 'SUM\'EAU — SARS-CoV-2 eaux usées France',
      url: 'https://static.data.gouv.fr/resources/surveillance-du-sars-cov-2-dans-les-eaux-usees-sumeau/20260121-132916/sumeau-indicateurs.csv',
      ttl: 'outbreaks',
      region: 'FR',
    },
  };
  // Note : OpenAQ v2 est déprécié (CORS bloqué). Qualité de l'air assurée par WAQI + Open-Meteo (géolocalisés).

  // ── État interne ──────────────────────────────────────────────
  const state = {
    status: 'idle',
    liveCount: 0,
    totalCount: 0,
    lastFetch: null,
    data: {},
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
  async function fetchWithCache(key, url, ttlKey, opts = {}) {
    const cached = cacheGet(key);
    if (isFresh(cached, ttlKey)) {
      return { data: cached.data, source: 'cache', fresh: true };
    }
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': opts.accept || 'application/json', ...opts.headers },
      });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = opts.text ? await res.text() : await res.json();
      cacheSet(key, data);
      return { data, source: 'api', fresh: true };
    } catch (err) {
      const stale = cacheGet(key);
      if (stale) return { data: stale.data, source: 'stale', fresh: false };
      return { data: null, source: 'error', fresh: false, error: err.message };
    }
  }

  // ── Parseurs ───────────────────────────────────────────────────

  function parseSPFGrippe(raw) {
    try {
      const recs = raw.results || raw.records || [];
      if (!recs.length) return null;

      // Séries historiques (ordre décroissant → inverser pour chronologie)
      const series = recs.map(r => {
        const f = r.record?.fields || r;
        return {
          rate: parseFloat(f.tx_av_inc100_h || f.taux_pour_100000_habitants || 0),
          week: f.semaine_annee_calc || f.date_de_debut || '',
        };
      }).filter(s => !isNaN(s.rate) && s.rate >= 0).reverse();

      if (!series.length) return null;
      const latest = series[series.length - 1];
      const { rate, week } = latest;

      // Baseline statistique : toutes les semaines sauf la dernière
      const baseline = series.slice(0, -1).map(s => s.rate);
      const mean = baseline.length
        ? baseline.reduce((a,b) => a+b, 0) / baseline.length : rate;
      const std = baseline.length > 1
        ? Math.sqrt(baseline.reduce((s,v) => s + (v-mean)**2, 0) / baseline.length) : 0;

      // Seuils dynamiques OMS (2 écart-types = 95% de confiance)
      const t1 = mean + 1.5 * std;  // JAUNE
      const t2 = mean + 2   * std;  // ORANGE
      const t3 = mean + 3   * std;  // ROUGE

      const zScore = std > 0 ? (rate - mean) / std : 0;
      const alertLevel = zScore >= 3 ? 'rouge' : zScore >= 2 ? 'orange' : zScore >= 1.5 ? 'jaune' : 'normal';

      return {
        rate, week,
        label: `Grippe ${rate.toFixed(0)}/100k (SPF sem. ${week})`,
        viralScore: Math.min(100, Math.round(rate / 3)),
        series,          // [{rate, week}] chronologique pour courbe épidémique
        baseline: { mean, std, t1, t2, t3 },
        zScore: Math.round(zScore * 10) / 10,
        alertLevel,      // 'normal' | 'jaune' | 'orange' | 'rouge'
      };
    } catch { return null; }
  }

  function parseOpenAQ(raw) {
    try {
      const results = raw.results || raw;
      if (!results.length) return null;
      const values = results.map(r => r.value).filter(v => typeof v === 'number' && v >= 0);
      if (!values.length) return null;
      const avg = values.reduce((a,b) => a+b, 0) / values.length;
      return {
        pm25: Math.round(avg * 10) / 10,
        aqiScore: Math.min(100, Math.round((avg / 75) * 100)),
        label: `PM2.5 ${avg.toFixed(1)} µg/m³ (OMS: ≤15)`,
        aboveWHO: avg > 15,
        city: results[0].location?.city || results[0].city || '—',
      };
    } catch { return null; }
  }

  function parseCDCFlu(raw) {
    try {
      const rec = Array.isArray(raw) ? raw[0] : raw;
      if (!rec) return null;
      const level = rec.activity_level || rec.activity_level_label || '';
      return {
        level: level.toString(),
        week: rec.week_end || '',
        label: `Grippe USA niveau ${level} (CDC)`,
        viralScore: Math.min(100, Math.round(parseFloat(level) * 10) || 30),
      };
    } catch { return null; }
  }

  function parseECDCMpox(raw) {
    try {
      const data = raw.data || raw;
      if (!data.length) return null;
      const recent = data.filter(r => {
        const d = new Date(r.DateRep || r.date_rep || '');
        return (Date.now() - d.getTime()) < 30 * 24 * 3600 * 1000;
      });
      const total = recent.reduce((s, r) => s + (parseInt(r.ConfCases || r.cases || 0) || 0), 0);
      return { cases30d: total, label: `Mpox Europe: ${total} cas (30j, ECDC)`, active: total > 10 };
    } catch { return null; }
  }

  /**
   * WAQI — World Air Quality Index
   * Renvoie AQI + 11 polluants + prévisions 7j PM2.5
   */
  function parseWAQI(raw) {
    try {
      if (raw.status !== 'ok') return null;
      const d = raw.data;
      const iaqi = d.iaqi || {};
      const pm25 = iaqi.pm25?.v ?? null;
      const pm10 = iaqi.pm10?.v ?? null;
      const no2  = iaqi.no2?.v ?? null;
      const o3   = iaqi.o3?.v ?? null;
      const so2  = iaqi.so2?.v ?? null;
      const co   = iaqi.co?.v ?? null;
      const temp = iaqi.t?.v ?? null;
      const hum  = iaqi.h?.v ?? null;
      const wind = iaqi.w?.v ?? null;

      // AQI brut US (0-500+) → normalisé 0-100 pour compatibilité BreathIQ
      const aqi = d.aqi;
      const aqiScore = typeof aqi === 'number' ? Math.min(100, Math.round(aqi / 3)) : null;

      // Prévisions PM2.5 (7 jours)
      const forecast7d = (d.forecast?.daily?.pm25 || []).slice(0, 7).map(f => ({
        day: f.day, avg: f.avg, min: f.min, max: f.max,
      }));

      // Polluant dominant
      const dominant = d.dominentpol || null;

      return {
        aqi, aqiScore, pm25, pm10, no2, o3, so2, co,
        temp, hum, wind, dominant, forecast7d,
        city: d.city?.name || '—',
        stationUrl: d.city?.url || null,
        attributions: (d.attributions || []).map(a => a.name).slice(0, 2),
        label: `AQI ${aqi} — PM2.5 ${pm25 ?? '?'} µg/m³ (${d.city?.name || 'local'})`,
        aboveWHO: pm25 != null && pm25 > 15,
        // Catégorie AQI US pour affichage couleur
        aqiCategory: aqi <= 50 ? 'good'
          : aqi <= 100 ? 'moderate'
          : aqi <= 150 ? 'unhealthy-sensitive'
          : aqi <= 200 ? 'unhealthy'
          : aqi <= 300 ? 'very-unhealthy' : 'hazardous',
      };
    } catch { return null; }
  }

  /**
   * SUM'EAU — CSV avec concentrations SARS-CoV-2 dans les eaux usées (France)
   * Format CSV ; — colonnes : semaine, stations..., National_12, National_54
   * Les indicateurs nationaux sont en dernières colonnes
   */
  function parseSumEau(csvText) {
    try {
      const lines = csvText.trim().split('\n').filter(l => l.trim());
      if (lines.length < 3) return null;

      // En-têtes : supprimer guillemets
      const headers = lines[0].split(';').map(h => h.replace(/"/g, '').trim());
      const nat12Idx = headers.findIndex(h => h === 'National_12');
      const nat54Idx = headers.findIndex(h => h === 'National_54');
      if (nat12Idx === -1) return null;

      // Dernières semaines (jusqu'à 8)
      const dataLines = lines.slice(1).reverse().slice(0, 8);

      const parseVal = s => {
        const n = parseFloat(s.replace(/"/g, '').replace(',', '.'));
        return isNaN(n) ? null : n;
      };

      const trend = dataLines.map(line => {
        const cols = line.split(';');
        const week = (cols[0] || '').replace(/"/g, '').trim();
        const v12  = parseVal(cols[nat12Idx] || '');
        const v54  = parseVal(cols[nat54Idx] || '');
        return { week, nat12: v12, nat54: v54 };
      }).filter(r => r.nat12 !== null || r.nat54 !== null);

      if (!trend.length) return null;

      const latest = trend[0];
      const prev   = trend[1] || null;
      const latestVal = latest.nat54 ?? latest.nat12;
      const prevVal   = prev ? (prev.nat54 ?? prev.nat12) : null;

      const deltaDir = prevVal != null && latestVal != null
        ? (latestVal > prevVal * 1.1 ? 'up' : latestVal < prevVal * 0.9 ? 'down' : 'stable')
        : 'unknown';

      // Seuil indicatif : signal fort > 100000 copies/L
      const intensity = latestVal == null ? 'unknown'
        : latestVal > 100000 ? 'high' : latestVal > 30000 ? 'moderate' : 'low';

      return {
        week: latest.week,
        nat54: latest.nat54,
        nat12: latest.nat12,
        trend: trend.slice(0, 8),
        deltaDir,
        intensity,
        label: `SUM'EAU SARS-CoV-2 sem. ${latest.week} — intensité ${intensity}`,
        signal: latestVal != null ? Math.round(latestVal / 1000) : null, // en milliers
      };
    } catch { return null; }
  }

  // ── Open-Meteo avec pollen ─────────────────────────────────────
  function fetchOpenMeteoForLocation(lat, lon) {
    const variables = [
      'pm2_5', 'european_aqi',
      'alder_pollen', 'birch_pollen', 'grass_pollen',
      'mugwort_pollen', 'olive_pollen', 'ragweed_pollen',
    ].join(',');
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&hourly=${variables}&timezone=auto&forecast_days=1`;
    return fetchWithCache(`openmeteo_${Math.round(lat)}_${Math.round(lon)}`, url, 'airQuality');
  }

  function parseOpenMeteo(raw) {
    try {
      const h = raw.hourly || {};

      const pm25Arr  = (h.pm2_5 || []).filter(v => v != null);
      const aqiArr   = (h.european_aqi || []).filter(v => v != null);

      if (!pm25Arr.length) return null;

      const avgPm25  = pm25Arr.reduce((a,b) => a+b, 0) / pm25Arr.length;
      const latestAqi = aqiArr[aqiArr.length - 1] || Math.round((avgPm25 / 75) * 100);

      // Pollen — prendre la valeur courante (dernier index non null)
      const pollenLast = key => {
        const arr = (h[key] || []).filter(v => v != null);
        return arr.length ? arr[arr.length - 1] : null;
      };

      const pollen = {
        alder:   pollenLast('alder_pollen'),
        birch:   pollenLast('birch_pollen'),
        grass:   pollenLast('grass_pollen'),
        mugwort: pollenLast('mugwort_pollen'),
        olive:   pollenLast('olive_pollen'),
        ragweed: pollenLast('ragweed_pollen'),
      };

      // Score pollen agrégé (European Pollen Index : 0 = none, 1-3 low, 4-6 moderate, 7+ high)
      const pollenVals = Object.values(pollen).filter(v => v != null);
      const maxPollen  = pollenVals.length ? Math.max(...pollenVals) : 0;
      const pollenScore = Math.min(100, Math.round(maxPollen * 10)); // 10 = très haut pollen

      // Dominant pollen
      const pollenMap = { alder:'aulne', birch:'bouleau', grass:'graminées', mugwort:'armoise', olive:'olivier', ragweed:'ambroisie' };
      const dominantPollen = Object.entries(pollen)
        .filter(([,v]) => v != null)
        .sort(([,a],[,b]) => b - a)[0];

      return {
        pm25: Math.round(avgPm25 * 10) / 10,
        aqiScore: Math.min(100, Math.round(latestAqi)),
        label: `PM2.5 ${avgPm25.toFixed(1)} µg/m³ (Open-Meteo)`,
        aboveWHO: avgPm25 > 15,
        pollen,
        pollenScore,
        dominantPollen: dominantPollen ? { key: dominantPollen[0], name: pollenMap[dominantPollen[0]], value: dominantPollen[1] } : null,
      };
    } catch { return null; }
  }

  // ── WAQI géolocalisé ──────────────────────────────────────────
  function fetchWAQIForLocation(lat, lon) {
    const token = (typeof window !== 'undefined' && window.BIQ_WAQI_KEY) || 'demo';
    const url = `https://api.waqi.info/feed/geo:${lat.toFixed(4)};${lon.toFixed(4)}/?token=${token}`;
    return fetchWithCache(`waqi_${Math.round(lat*10)}_${Math.round(lon*10)}`, url, 'airQuality');
  }

  // ── Fetch avec géolocalisation (Open-Meteo + WAQI) ────────────
  function fetchWithGeolocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;

        // Open-Meteo : PM2.5 + pollen
        const meteoResult = await fetchOpenMeteoForLocation(lat, lon);
        if (meteoResult.data) {
          const parsed = parseOpenMeteo(meteoResult.data);
          if (parsed) {
            state.data.openmeteo_local = { data: meteoResult.data, source: meteoResult.source, ep: { ttl: 'airQuality', region: 'LOCAL' } };
            if (meteoResult.source === 'api') state.liveCount++;
          }
        }

        // WAQI : AQI + 11 polluants + prévisions
        const waqiResult = await fetchWAQIForLocation(lat, lon);
        if (waqiResult.data) {
          const parsed = parseWAQI(waqiResult.data);
          if (parsed) {
            state.data.waqi_local = { data: waqiResult.data, source: waqiResult.source, ep: { ttl: 'airQuality', region: 'LOCAL' } };
            if (waqiResult.source === 'api') state.liveCount++;
          }
        }

        dispatch('update', { state, parsed: buildParsedData() });
      },
      () => { /* géolocalisation refusée — silencieux */ },
      { timeout: 8000, maximumAge: 300000 }
    );
  }

  // ── Dispatch ──────────────────────────────────────────────────
  function dispatch(type, detail) {
    window.dispatchEvent(new CustomEvent(`biq-${type}`, { detail }));
  }

  // ── Fetch toutes les sources statiques ────────────────────────
  async function fetchAll() {
    state.status = 'loading';
    state.liveCount = 0;
    state.totalCount = Object.keys(EP).length;
    dispatch('status', { status: 'loading' });

    const tasks = Object.entries(EP)
      .filter(([, ep]) => !ep.disabled)
      .map(async ([key, ep]) => {
        const isCSV = ep.url.endsWith('.csv');
        const result = await fetchWithCache(key, ep.url, ep.ttl, isCSV ? { accept: 'text/csv', text: true } : {});
        state.data[key] = { ...result, ep };
        if (result.source === 'api' || result.source === 'cache') state.liveCount++;
        return { key, result };
      });

    await Promise.allSettled(tasks);
    state.lastFetch = Date.now();

    const parsed = buildParsedData();
    state.status = state.liveCount > 0 ? (state.liveCount >= 2 ? 'live' : 'partial') : 'error';

    dispatch('update', { state, parsed });
    dispatch('status', { status: state.status, liveCount: state.liveCount });

    return parsed;
  }

  // ── Construction des données normalisées ───────────────────────
  function buildParsedData() {
    const out = { sources: {} };

    if (state.data.spf_grippe?.data)      { out.frFlu     = parseSPFGrippe(state.data.spf_grippe.data);      out.sources.spfGrippe      = state.data.spf_grippe.source; }
    if (state.data.cdc_flu?.data)         { out.usFlu     = parseCDCFlu(state.data.cdc_flu.data);             out.sources.cdcFlu         = state.data.cdc_flu.source; }
    if (state.data.ecdc_mpox?.data)       { out.ecMpox    = parseECDCMpox(state.data.ecdc_mpox.data);         out.sources.ecdcMpox       = state.data.ecdc_mpox.source; }
    if (state.data.sumeau?.data)          { out.sumeau    = parseSumEau(state.data.sumeau.data);               out.sources.sumeau         = state.data.sumeau.source; }
    if (state.data.openmeteo_local?.data) { out.localAqi  = parseOpenMeteo(state.data.openmeteo_local.data);  out.sources.openMeteoLocal = state.data.openmeteo_local.source; }
    if (state.data.waqi_local?.data)      { out.waqiLocal = parseWAQI(state.data.waqi_local.data);            out.sources.waqiLocal      = state.data.waqi_local.source; }

    // Qualité d'air locale : WAQI (géolocalisé) > Open-Meteo (géolocalisé)
    out.bestLocalAqi = out.waqiLocal || out.localAqi || null;

    out.lastUpdate = new Date().toISOString();
    return out;
  }

  // ── Auto-refresh ───────────────────────────────────────────────
  let refreshTimer = null;

  function startAutoRefresh(intervalMs = 5 * 60 * 1000) {
    // fetchWithGeolocation() n'est appellé que si la permission est déjà accordée
    // (pas de prompt automatique au chargement de la page — évite les [Violation] Chrome)
    fetchAll().then(() => {
      navigator.permissions?.query({ name: 'geolocation' })
        .then(p => { if (p.state === 'granted') fetchWithGeolocation(); })
        .catch(() => {});
    });
    refreshTimer = setInterval(() => {
      fetchAll().then(() => {
        navigator.permissions?.query({ name: 'geolocation' })
          .then(p => { if (p.state === 'granted') fetchWithGeolocation(); })
          .catch(() => {});
      });
    }, intervalMs);
    dispatch('refresh-scheduled', { nextRefreshAt: Date.now() + intervalMs, intervalMs });
  }

  function stopAutoRefresh() {
    if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null; }
  }

  // ── API publique ───────────────────────────────────────────────
  return {
    start:     (interval) => startAutoRefresh(interval),
    stop:      stopAutoRefresh,
    refresh:   fetchAll,
    getState:  () => state,
    getParsed: buildParsedData,
    on:        (event, handler) => window.addEventListener(`biq-${event}`, handler),
    TTL,
  };

})();

if (typeof module !== 'undefined') {
  module.exports = { BIQ_LIVE };
}
