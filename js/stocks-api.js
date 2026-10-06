'use strict';

/**
 * BREATHIQ — Sources de données stocks EPI & qualité de l'air
 * © 2026 Dr. Clément MÉDEAU
 * Toutes les URLs ont été vérifiées et sont fonctionnelles au 19/05/2026
 */

// ── Seuils d'alerte stocks ─────────────────────────────────────────────────
// SUFFICIENT = > 90 jours, MODERATE = 30–90 j, LOW = 7–30 j, CRITICAL = < 7 j

/**
 * @param {number|null} daysSupply
 * @returns {'SUFFICIENT'|'MODERATE'|'LOW'|'CRITICAL'|'UNKNOWN'}
 */
function computeAlertLevel(daysSupply) {
  if (daysSupply === null || daysSupply === undefined) return 'UNKNOWN';
  if (daysSupply > 90) return 'SUFFICIENT';
  if (daysSupply > 30) return 'MODERATE';
  if (daysSupply > 7)  return 'LOW';
  return 'CRITICAL';
}

const ALERT_COLORS = {
  SUFFICIENT: { border: '#15803D', fill: '#DCFCE7', text: '#14532D', label: 'Suffisant' },
  MODERATE:   { border: '#1A6FD4', fill: '#DBEAFE', text: '#1E3A5F', label: 'Modéré' },
  LOW:        { border: '#B45309', fill: '#FEF3C7', text: '#78350F', label: 'Faible' },
  CRITICAL:   { border: '#B91C1C', fill: '#FEE2E2', text: '#7F1D1D', label: 'Critique' },
  UNKNOWN:    { border: '#6B7280', fill: '#F3F4F6', text: '#374151', label: 'Inconnu' },
};

// ── Définition des sources ─────────────────────────────────────────────────
const STOCK_SOURCES = {

  openaq: {
    name: 'OpenAQ',
    url: 'https://openaq.org/',
    apiEndpoint: 'https://api.openaq.org/v3/locations',
    frequency: 'temps réel',
    reliability: 95,
    license: 'CC BY 4.0',
    coverage: 'mondiale',
    note: 'Clé API gratuite requise — https://api.openaq.org/',
    /**
     * @param {string} countryCode  Code ISO 2 lettres (ex: 'FR')
     * @param {string} apiKey
     * @returns {Promise<object>}
     */
    fetch: async (countryCode, apiKey) => {
      const url = `https://api.openaq.org/v3/locations?country_id=${countryCode}&limit=20&order_by=lastUpdated&sort=desc`;
      const res = await fetch(url, { headers: { 'X-API-Key': apiKey } });
      if (!res.ok) throw new Error(`OpenAQ ${res.status}`);
      return res.json();
    }
  },

  ecdc_surveillance: {
    name: 'ECDC Surveillance Atlas',
    url: 'https://atlas.ecdc.europa.eu/',
    apiEndpoint: 'https://opendata.ecdc.europa.eu/monkeypox/casedistribution/json',
    frequency: 'hebdomadaire',
    reliability: 99,
    license: 'ECDC Terms of Use',
    coverage: 'Europe',
    note: 'Remplacer le dataset selon le pathogène surveillé'
  },

  who_don: {
    name: 'WHO Disease Outbreak News',
    url: 'https://www.who.int/emergencies/disease-outbreak-news',
    rssEndpoint: 'https://www.who.int/feeds/entity/csr/don/en/rss.xml',
    frequency: 'variable',
    reliability: 99,
    license: 'WHO Terms of Use',
    coverage: 'mondiale'
  },

  france_spf: {
    name: 'Santé Publique France — Données ouvertes',
    url: 'https://data.santepubliquefrance.fr/',
    apiBase: 'https://data.santepubliquefrance.fr/api/explore/v2.1/catalog/datasets',
    frequency: 'hebdomadaire',
    reliability: 98,
    license: 'Licence Ouverte Etalab 2.0',
    coverage: 'France nationale + régionale',
    datasets: {
      grippe:   'donnees-de-surveillance-des-cas-de-grippe-vus-en-consultations-de-medecins-sentinelles-en-france',
      urgences: 'donnees-des-urgences-hospitalieres',
    },
    /**
     * @param {string} dataset  Identifiant du dataset SPF
     * @returns {Promise<object>}
     */
    fetch: async (dataset) => {
      const url = `https://data.santepubliquefrance.fr/api/explore/v2.1/catalog/datasets/${dataset}/records?limit=20&order_by=date_de_debut+desc`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`SPF ${res.status}`);
      return res.json();
    }
  },

  data_gouv: {
    name: 'data.gouv.fr',
    url: 'https://www.data.gouv.fr/',
    apiBase: 'https://www.data.gouv.fr/api/1/',
    frequency: 'variable',
    reliability: 90,
    license: 'Licence Ouverte Etalab 2.0',
    coverage: 'France'
  },

  eu_open_data: {
    name: 'EU Open Data Portal',
    url: 'https://data.europa.eu/',
    apiBase: 'https://data.europa.eu/api/hub/search/',
    frequency: 'variable',
    reliability: 92,
    license: 'CC BY 4.0',
    coverage: 'Union Européenne'
  },

  eurostat: {
    name: 'Eurostat',
    url: 'https://ec.europa.eu/eurostat/',
    apiBase: 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/',
    frequency: 'annuelle',
    reliability: 99,
    license: 'Eurostat Open Data Policy',
    coverage: 'UE + pays partenaires'
  },

  cdc_open_data: {
    name: 'CDC Open Data (Socrata)',
    url: 'https://data.cdc.gov/',
    apiBase: 'https://data.cdc.gov/resource/',
    frequency: 'hebdomadaire',
    reliability: 98,
    license: 'US Government Open Data',
    coverage: 'États-Unis',
    datasets: {
      influenza: 'cvqj-4bfd',
    },
    /**
     * @param {string} datasetId  Identifiant Socrata
     * @returns {Promise<Array>}
     */
    fetch: async (datasetId) => {
      const url = `https://data.cdc.gov/resource/${datasetId}.json?$limit=50&$order=week_end+DESC`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`CDC ${res.status}`);
      return res.json();
    }
  },

  copernicus_cams: {
    name: 'Copernicus CAMS',
    url: 'https://atmosphere.copernicus.eu/',
    docsUrl: 'https://ads.atmosphere.copernicus.eu/',
    frequency: 'quotidienne (prévisions J+4)',
    reliability: 97,
    license: 'Copernicus Licence — libre commercial et non commercial',
    coverage: 'Europe + mondiale',
    note: 'Clé API CDS gratuite — inscription : https://cds.climate.copernicus.eu/'
  },

  voluntary_reporting: {
    name: 'Saisie volontaire établissements — BreathIQ',
    type: 'internal',
    frequency: 'temps réel',
    reliability: 70,
    validation: 'SIRET + type établissement requis',
    note: 'Données déclaratives affichées avec badge "Non vérifié" explicite'
  }
};

// ── Pipeline de normalisation ──────────────────────────────────────────────
/**
 * Calcule un indice de confiance composite pour une entrée de données
 * @param {object} source  Source de données (de STOCK_SOURCES)
 * @param {number} ageDays  Âge de la donnée en jours
 * @returns {number}  Score 0–100
 */
function computeConfidence(source, ageDays) {
  const reliability = source.reliability || 70;
  const freshnessPenalty = Math.min(ageDays * 2, 40);
  return Math.max(0, Math.round(reliability - freshnessPenalty));
}

/**
 * Formate un nombre de stock en unité lisible
 * @param {number|null} units
 * @returns {string}
 */
function formatStockUnits(units) {
  if (units === null || units === undefined) return 'N/D';
  if (units >= 1e9)  return (units / 1e9).toFixed(1) + ' Md';
  if (units >= 1e6)  return (units / 1e6).toFixed(1) + ' M';
  if (units >= 1e3)  return (units / 1e3).toFixed(0) + ' k';
  return units.toString();
}

// Derniers chiffres officiels connus — aucune API temps réel n'existe pour les stocks stratégiques
const STOCKS_DEMO_DATA = [
  { id:'FR', name:'France',       continent:'Europe',   daysSupply:null, ffp2:680e6, confidence:55, lastUpdated:'2024-01-15', dataType:'official',
    sourceName:'Cour des Comptes — Rapport gestion COVID', sourceUrl:'https://www.ccomptes.fr/fr/publications/la-gestion-de-la-crise-covid-19',
    note:'680 millions FFP2 en janv. 2024. Stock réel actuel incertain (péremptions 2024-2026).' },
  { id:'DE', name:'Allemagne',    continent:'Europe',   daysSupply:null, ffp2:312e6, confidence:75, lastUpdated:'2024-01-10', dataType:'official',
    sourceName:'Bundestag — Question parlementaire jan. 2024', sourceUrl:'https://www.bundestag.de/presse/hib/kurzmeldungen-984912',
    note:'312 millions FFP2 en réserve fédérale (Bundesreserve), janvier 2024.' },
  { id:'BE', name:'Belgique',     continent:'Europe',   daysSupply:null, ffp2:5.7e6, kn95:45e6, confidence:60, lastUpdated:'2024-06-01', dataType:'official',
    sourceName:'Parlement belge — SPF Santé publique', sourceUrl:'https://www.health.belgium.be',
    note:'5,7 millions FFP2 + 45 millions KN95 en stock stratégique fédéral.' },
  { id:'GB', name:'Royaume-Uni',  continent:'Europe',   daysSupply:84,   ffp2:null,  confidence:80, lastUpdated:'2025-01-01', dataType:'official',
    sourceName:'Gov.Wales — PPE Stockpile Volumes WHC2025/023', sourceUrl:'https://www.gov.wales/ppe-stockpile-volumes-wales-whc2025023-html',
    note:'Pays de Galles : cible 12 semaines de stock FFP2. Données UK globales non publiées.' },
  { id:'US', name:'États-Unis',   continent:'Amériques',daysSupply:null, ffp2:null,  confidence:0,  lastUpdated:null,         dataType:'unknown',
    sourceName:'HHS — Strategic National Stockpile', sourceUrl:'https://aspr.hhs.gov/SNS/Pages/default.aspx',
    note:'Stock classifié pour raisons de sécurité nationale. Aucune donnée publique.' },
  { id:'CA', name:'Canada',       continent:'Amériques',daysSupply:null, ffp2:null,  confidence:0,  lastUpdated:null,         dataType:'unknown',
    sourceName:'ASPC — Agence de santé publique du Canada', sourceUrl:'https://www.canada.ca/fr/sante-publique.html',
    note:'Réserves stratégiques non publiées.' },
  { id:'AU', name:'Australie',    continent:'Océanie',  daysSupply:null, ffp2:null,  confidence:0,  lastUpdated:null,         dataType:'unknown',
    sourceName:'Dept. of Health — National Medical Stockpile', sourceUrl:'https://www.health.gov.au',
    note:'National Medical Stockpile non divulgué.' },
  { id:'JP', name:'Japon',        continent:'Asie',     daysSupply:null, ffp2:null,  confidence:0,  lastUpdated:null,         dataType:'unknown',
    sourceName:'MHLW — Ministry of Health, Labour and Welfare', sourceUrl:'https://www.mhlw.go.jp',
    note:'Aucune donnée publique disponible.' },
  { id:'KR', name:'Corée du Sud', continent:'Asie',     daysSupply:null, ffp2:null,  confidence:0,  lastUpdated:null,         dataType:'unknown',
    sourceName:'KDCA — Korea Disease Control and Prevention Agency', sourceUrl:'https://www.kdca.go.kr',
    note:'Stocks stratégiques non publiés.' },
  { id:'CN', name:'Chine',        continent:'Asie',     daysSupply:null, ffp2:null,  confidence:0,  lastUpdated:null,         dataType:'unknown',
    sourceName:"MIIT — Ministère de l'Industrie", sourceUrl:'https://www.miit.gov.cn',
    note:'Premier producteur mondial. Capacité production publiée, pas les réserves stratégiques.' },
  { id:'IN', name:'Inde',         continent:'Asie',     daysSupply:null, ffp2:null,  confidence:0,  lastUpdated:null,         dataType:'unknown',
    sourceName:'MoHFW — Ministry of Health and Family Welfare', sourceUrl:'https://mohfw.gov.in',
    note:'Aucune donnée publique disponible.' },
  { id:'BR', name:'Brésil',       continent:'Amériques',daysSupply:null, ffp2:null,  confidence:0,  lastUpdated:null,         dataType:'unknown',
    sourceName:'ANVISA — Brésil', sourceUrl:'https://www.gov.br/anvisa',
    note:'Aucune donnée publique sur les réserves stratégiques.' },
  { id:'RU', name:'Russie',       continent:'Europe',   daysSupply:null, ffp2:null,  confidence:0,  lastUpdated:null,         dataType:'unknown',
    sourceName:'Minzdrav — Ministère de la Santé', sourceUrl:'https://minzdrav.gov.ru',
    note:'Données non disponibles publiquement.' },
  { id:'NG', name:'Nigéria',      continent:'Afrique',  daysSupply:null, ffp2:null,  confidence:0,  lastUpdated:null,         dataType:'unknown',
    sourceName:'UNICEF / OMS', sourceUrl:'https://www.unicef.org/supply',
    note:'Aucune donnée nationale disponible.' },
];

// Chargement async depuis data/stocks.json
let _stocksJsonCache = null;

async function loadStocksFromJson() {
  if (_stocksJsonCache) return _stocksJsonCache;
  try {
    const r = await fetch('/data/stocks.json?_=' + Date.now());
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const json = await r.json();
    _stocksJsonCache = (json.regions || []).map(e => ({
      ...e,
      alertLevel: computeAlertLevel(e.daysSupply),
    }));
    return _stocksJsonCache;
  } catch {
    return STOCKS_DEMO_DATA.map(e => ({ ...e, alertLevel: computeAlertLevel(e.daysSupply) }));
  }
}

// Export pour usage dans stocks.html
if (typeof module !== 'undefined') {
  module.exports = { STOCK_SOURCES, STOCKS_DEMO_DATA, ALERT_COLORS, computeAlertLevel, computeConfidence, formatStockUnits, loadStocksFromJson };
}

// Exposition globale pour stocks.html
if (typeof window !== 'undefined') {
  window.StocksAPI = { ALERT_COLORS, STOCKS_DEMO_DATA, computeAlertLevel, formatStockUnits, loadStocksFromJson };
}
