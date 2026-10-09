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
    don:         2  * 60 * 60 * 1000, // 2 h  — WHO DON
    stocks:      24 * 60 * 60 * 1000, // 24 h
  };


  // Couverture vaccinale grippe France — données statiques SPF (fallback si API indisponible)

  // ── Endpoints statiques (sans géolocalisation) ─────────────────
  const EP = {
    // spf_grippe (data.gouv) et cdc_flu retirés : la grippe France vient du Réseau Sentinelles
    // (data/spf-surveillance.json) et de FluNet (data/live-sources.json) ; plus d'appel navigateur.
    // ── Sources collectées côté serveur (scripts/live-sources-fetch.mjs → data/live-sources.json) ──
    // Le navigateur ne contacte plus ECDC, data.gouv ni l'OMS directement : une seule requête locale.
    live_sources: {
      label: 'Sources collectées quotidiennement (FluNet, SUM\'Eau, vaccination grippe, ECDC mpox)',
      url: '/data/live-sources.json',
      ttl: 'outbreaks',
      region: 'FR',
    },
    // ecdc_mpox retiré : le flux casedistribution/json est figé au 15/02/2023 (mpox → data/ecdc-surveillance.json)
    sumeau:        { label: 'SUM\'EAU — SARS-CoV-2 eaux usées France',     ttl: 'outbreaks', region: 'FR',  local: true },
    who_flunet_fr: { label: 'WHO FluNet — Grippe France (VIW_FNT)',         ttl: 'flu',       region: 'FRA', local: true, _detectedCountry: 'FRA' },
    flu_vacc_data: { label: 'SPF — Couverture vaccinale grippe France',     ttl: 'outbreaks', region: 'FR',  local: true },
    // disease.sh retiré (dernière donnée France : 9 mars 2023 — source morte)
    // WHO Disease Outbreak News — fichier local mis à jour quotidiennement par GitHub Actions
    // (L'API OData WHO retourne 401 depuis sept. 2026 — workflow who-don-daily.yml prend le relais)
    who_don: {
      label: 'WHO — Disease Outbreak News (cache quotidien)',
      url: '/data/who-alerts.json',
      ttl: 'don',
      region: 'GLOBAL',
    },
    // ECDC coqueluche/rougeole : flux JSON morts (404) — données dans data/ecdc-surveillance.json (GitHub Actions)
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



  // Parseur de la ressource CSV/JSON de couverture vaccinale
  function parseFluVaccData(raw) {
    try {
      const records = Array.isArray(raw) ? raw : (raw?.records || raw?.data || []);
      if (!records.length) return null;

      // Format data.gouv « Vaccination Grippe 2025-2026 » : { region, code, variable: 'DOSES(J07E1)'|'ACTE(VGP)', groupe, valeur }
      // → doses et actes réels (pas de taux de couverture dans cette ressource : on n'en invente pas)
      if (records[0].variable != null && records[0].valeur != null) {
        const sum = pred => records.filter(pred).reduce((s, r) => s + (Number(r.valeur) || 0), 0);
        const doses = sum(r => /DOSES/i.test(r.variable));
        const actes = sum(r => /ACTE/i.test(r.variable));
        const groups = [...new Set(records.map(r => r.groupe).filter(Boolean))];
        const byGroup = groups.map(g => ({ group: g, doses: sum(r => /DOSES/i.test(r.variable) && r.groupe === g), actes: sum(r => /ACTE/i.test(r.variable) && r.groupe === g) }));
        const byRegion = [...new Set(records.map(r => r.region).filter(Boolean))]
          .map(region => ({ region: String(region).replace(/^\d+\s*-\s*/, ''), doses: sum(r => /DOSES/i.test(r.variable) && r.region === region) }))
          .sort((a, b) => b.doses - a.doses);
        return { kind: 'doses', doses, actes, byGroup, byRegion: byRegion.slice(0, 5), season: '2025-2026', label: `Vaccination grippe 2025-2026 — ${doses.toLocaleString('fr-FR')} doses, ${actes.toLocaleString('fr-FR')} actes (data.gouv)` };
      }


      // Chercher les colonnes région et couverture
      const sample = records[0];
      const keys = Object.keys(sample);

      const regionKey = keys.find(k => /reg(ion)?|dep(art)?/i.test(k));
      const coverKey  = keys.find(k => /couvert|taux|coverage|rate/i.test(k));
      const ageKey    = keys.find(k => /age|tranche/i.test(k));
      const seasonKey = keys.find(k => /saison|season|annee|year/i.test(k));

      if (!coverKey) return null;

      // Filtrer la dernière saison si disponible
      let filtered = records;
      if (seasonKey) {
        const seasons = [...new Set(records.map(r => r[seasonKey]))].sort();
        const lastSeason = seasons[seasons.length - 1];
        filtered = records.filter(r => r[seasonKey] === lastSeason);
      }

      // Calculer la couverture nationale (moyenne ou valeur nationale)
      const national = filtered.find(r => !regionKey || /france|national|fr$/i.test(String(r[regionKey] || '')));
      const natRate = national ? parseFloat(String(national[coverKey]).replace(',', '.')) : null;

      // Top régions
      const byRegion = regionKey
        ? filtered.map(r => ({ region: r[regionKey], rate: parseFloat(String(r[coverKey]).replace(',', '.')) }))
            .filter(r => !isNaN(r.rate) && r.rate > 0 && r.rate <= 100)
            .sort((a, b) => b.rate - a.rate)
        : [];

      const target = 75; // Objectif OMS couverture vaccinale grippe personnes à risque
      const coverage = natRate || (byRegion.length ? byRegion.reduce((s, r) => s + r.rate, 0) / byRegion.length : null);

      return {
        nationalRate: coverage ? Math.round(coverage * 10) / 10 : null,
        byRegion: byRegion.slice(0, 5),
        target,
        belowTarget: coverage != null && coverage < target,
        label: coverage != null ? `Couverture grippe ${coverage.toFixed(1)}% (cible OMS : ${target}%)` : 'Données vaccination grippe disponibles',
        season: seasonKey ? [...new Set(records.map(r => r[seasonKey]))].sort().pop() : '2025-2026',
      };
    } catch { return null; }
  }


  function parseFluNet(raw) {
  try {
    // FluNet renvoie { value: [{COUNTRY_CODE, ISO_WEEKSTARTDATE, ISO_WEEK, ALL_INF, INF_A, INF_B, ...}] }
    // (le champ s'appelle ISO_WEEKSTARTDATE — l'ancien nom ISO_WEEK_START provoquait un 400 OData)
    const records = raw?.value || [];
    if (!records.length) return null;
    const startOf = r => r.ISO_WEEKSTARTDATE || r.ISO_WEEK_START || '';

    // Total grippe : INF_ALL (nom réel du champ FluNet) ou somme A+B ; une ligne par semaine (origines agrégées)
    const allInf = r => { const v = r.INF_ALL ?? r.ALL_INF; return v != null ? Number(v) : (Number(r.INF_A) || 0) + (Number(r.INF_B) || 0); };
    const byWeek = new Map();
    for (const r of records) {
      const k = startOf(r); if (!k) continue;
      const cur = byWeek.get(k) || { ...r, ALL_INF: 0, INF_A: 0, INF_B: 0 };
      cur.ALL_INF += allInf(r); cur.INF_A += Number(r.INF_A) || 0; cur.INF_B += Number(r.INF_B) || 0;
      byWeek.set(k, cur);
    }
    const valid = [...byWeek.values()]
      .filter(r => r.ALL_INF >= 0)
      .sort((a, b) => startOf(b).localeCompare(startOf(a)));

    if (!valid.length) return null;

    const latest = valid[0];
    const series = valid.slice(0, 12).reverse().map(r => ({
      week: r.ISO_WEEK || startOf(r) || '',
      cases: parseInt(r.ALL_INF || 0),
      infA: parseInt(r.INF_A || 0),
      infB: parseInt(r.INF_B || 0),
    }));

    const totalCases = series.reduce((s, r) => s + r.cases, 0);
    const avgCases = Math.round(totalCases / series.length);
    const latestCases = series[series.length - 1]?.cases || 0;
    const countryCode = valid[0]?.COUNTRY_CODE || EP.who_flunet_fr?._detectedCountry || 'FRA';

    // Score viral normalisé (seuil épidémique adapté selon population relative)
    const viralScore = Math.min(100, Math.round((latestCases / 800) * 100));

    // Tendance (comparer dernière semaine vs moyenne)
    const trend = avgCases > 0 ? ((latestCases - avgCases) / avgCases) * 100 : 0;
    const alertLevel = viralScore >= 70 ? 'rouge' : viralScore >= 45 ? 'orange' : viralScore >= 25 ? 'jaune' : 'normal';

    return {
      rate: latestCases,
      week: latest.ISO_WEEK || '',
      country: countryCode,
      label: `Grippe ${countryCode} ${latestCases} cas sem. ${latest.ISO_WEEK || ''} (WHO FluNet)`,
      viralScore,
      series,
      infA: parseInt(latest.INF_A || 0),
      infB: parseInt(latest.INF_B || 0),
      trend: Math.round(trend),
      alertLevel,
      source: 'WHO FluNet',
    };
  } catch { return null; }
}

  // ── WHO DON — Disease Outbreak News ──────────────────────────
  function parseWHODON(raw) {
    try {
      // Format OData WHO : { value: [{Title, Url, PublicationDateAndTime, ...}] }
      // ou format alternatif : { data: { Records: [...] } }
      const records = raw?.value || raw?.data?.Records || raw?.items || [];
      if (!Array.isArray(records) || !records.length) return null;

      const riskKeywords = {
        critical: /ebola|mpox|monkeypox|marburg|plague|cholera|avian.flu|H5N1|pandemic|PHEIC/i,
        high:     /outbreak|epidemic|measles|rougeole|pertussis|coqueluche|yellow.fever|dengue|nipah/i,
        moderate: /influenza|flu|COVID|SARS|MERS|zika|chikungunya|leptospirosis/i,
      };

      const alerts = records.slice(0, 12).map(r => {
        const title   = r.Title || r.title || r.name || '';
        const url     = r.Url  || r.url  || r.link || '';
        const pubDate = r.PublicationDateAndTime || r.publicationDate || r.date || '';
        let riskLevel = 'low';
        if (riskKeywords.critical.test(title)) riskLevel = 'critical';
        else if (riskKeywords.high.test(title))     riskLevel = 'high';
        else if (riskKeywords.moderate.test(title)) riskLevel = 'moderate';
        return { title, url, pubDate, riskLevel };
      });

      return { alerts, fetchedAt: new Date().toISOString(), source: 'WHO DON API' };
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
      .filter(([, ep]) => !ep.disabled && !ep.local)
      .map(async ([key, ep]) => {
        const isCSV = ep.url.endsWith('.csv');
        const result = await fetchWithCache(key, ep.url, ep.ttl, isCSV ? { accept: 'text/csv', text: true } : {});
        state.data[key] = { ...result, ep };
        if (result.source === 'api' || result.source === 'cache') state.liveCount++;
        return { key, result };
      });

    await Promise.allSettled(tasks);

    // Sources collectées côté serveur : on redistribue le contenu de data/live-sources.json
    // aux clés attendues par les parseurs (une source ok:false est marquée indisponible, jamais inventée)
    const bundle = state.data.live_sources?.data?.sources || {};
    for (const [key, ep] of Object.entries(EP)) {
      if (!ep.local) continue;
      const src = bundle[key];
      const hasData = src && src.raw != null;
      state.data[key] = {
        data: hasData ? src.raw : null,
        source: !src ? 'error' : src.ok ? 'api' : 'stale',
        fresh: !!src?.ok,
        ep,
        sourceUrl: src?.sourceUrl || null,
        sourceLastModified: src?.sourceLastModified || null,
        error: src?.error || null,
      };
      if (hasData) state.liveCount++;
    }
    if (state.data.flu_vacc_data?.data) {
      const parsed2 = parseFluVaccData(state.data.flu_vacc_data.data);
      state.data.flu_vacc_data = { ...state.data.flu_vacc_data, data: parsed2, _direct: !!parsed2 };
    }

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

    if (state.data.sumeau?.data)           { out.sumeau     = parseSumEau(state.data.sumeau.data);                out.sources.sumeau         = state.data.sumeau.source; }
    if (state.data.openmeteo_local?.data)  { out.localAqi   = parseOpenMeteo(state.data.openmeteo_local.data);   out.sources.openMeteoLocal = state.data.openmeteo_local.source; }

    if (state.data.who_flunet_fr?.data) { out.frFlu = out.frFlu || parseFluNet(state.data.who_flunet_fr.data); out.sources.fluNetFr = state.data.who_flunet_fr.source; }
    if (state.data.flu_vacc_data?._direct) { out.fluVaccFr  = state.data.flu_vacc_data.data;                    out.sources.fluVaccFr      = state.data.flu_vacc_data.source; }
    // Dates réelles des sources collectées (affichées par bloc, cf. règle « une seule date honnête »)
    out.sourceDates = Object.fromEntries(Object.entries(state.data).filter(([, v]) => v?.sourceLastModified).map(([k, v]) => [k, v.sourceLastModified]));

    // Nouvelles sources live
    if (state.data.who_don?.data)       { out.whoDon      = parseWHODON(state.data.who_don.data);                      out.sources.whoDon       = state.data.who_don.source; }
    out.fluNetCountry = EP.who_flunet_fr?._detectedCountry || 'FRA';

    // Qualité d'air locale : WAQI (géolocalisé) > Open-Meteo (géolocalisé)
    out.bestLocalAqi = out.localAqi || null;

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
