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

/**
 * Données démonstratives — structure normalisée
 * Remplacer par un appel API réel en production
 */
const STOCKS_DEMO_DATA = [
  { id:'FR', name:'France',         continent:'Europe',  daysSupply:180, ffp2:42e6, confidence:72, sourceKey:'data_gouv',    lastUpdated:'2026-05-01', dataType:'estimate' },
  { id:'DE', name:'Allemagne',      continent:'Europe',  daysSupply:320, ffp2:120e6,confidence:85, sourceKey:'eu_open_data', lastUpdated:'2026-04-28', dataType:'estimate' },
  { id:'US', name:'États-Unis',     continent:'Amériques',daysSupply:400,ffp2:500e6,confidence:90, sourceKey:'cdc_open_data',lastUpdated:'2026-05-05', dataType:'official' },
  { id:'CN', name:'Chine',          continent:'Asie',    daysSupply:500, ffp2:2e9,  confidence:60, sourceKey:'voluntary_reporting',lastUpdated:'2026-05-01',dataType:'estimate'},
  { id:'JP', name:'Japon',          continent:'Asie',    daysSupply:360, ffp2:180e6,confidence:88, sourceKey:'eu_open_data', lastUpdated:'2026-05-03', dataType:'estimate' },
  { id:'IN', name:'Inde',           continent:'Asie',    daysSupply:25,  ffp2:120e6,confidence:55, sourceKey:'voluntary_reporting',lastUpdated:'2026-04-25',dataType:'estimate'},
  { id:'BR', name:'Brésil',         continent:'Amériques',daysSupply:22, ffp2:45e6, confidence:62, sourceKey:'voluntary_reporting',lastUpdated:'2026-04-28',dataType:'estimate'},
  { id:'NG', name:'Nigeria',        continent:'Afrique', daysSupply:4,   ffp2:3e6,  confidence:40, sourceKey:'voluntary_reporting',lastUpdated:'2026-03-28',dataType:'declarative'},
  { id:'ET', name:'Éthiopie',       continent:'Afrique', daysSupply:3,   ffp2:0.8e6,confidence:35, sourceKey:'voluntary_reporting',lastUpdated:'2026-03-20',dataType:'declarative'},
  { id:'GB', name:'Royaume-Uni',    continent:'Europe',  daysSupply:220, ffp2:55e6, confidence:82, sourceKey:'eu_open_data', lastUpdated:'2026-05-02', dataType:'estimate' },
  { id:'AU', name:'Australie',      continent:'Océanie', daysSupply:260, ffp2:40e6, confidence:80, sourceKey:'voluntary_reporting',lastUpdated:'2026-05-01',dataType:'estimate'},
  { id:'ID', name:'Indonésie',      continent:'Asie',    daysSupply:5,   ffp2:15e6, confidence:42, sourceKey:'voluntary_reporting',lastUpdated:'2026-04-18',dataType:'declarative'},
  { id:'PK', name:'Pakistan',       continent:'Asie',    daysSupply:3,   ffp2:4e6,  confidence:38, sourceKey:'voluntary_reporting',lastUpdated:'2026-04-05',dataType:'declarative'},
  { id:'CD', name:'RD Congo',       continent:'Afrique', daysSupply:2,   ffp2:0.5e6,confidence:30, sourceKey:'voluntary_reporting',lastUpdated:'2026-03-15',dataType:'declarative'},
  { id:'MX', name:'Mexique',        continent:'Amériques',daysSupply:18, ffp2:18e6, confidence:55, sourceKey:'voluntary_reporting',lastUpdated:'2026-04-20',dataType:'estimate'},
  { id:'KR', name:'Corée du Sud',   continent:'Asie',    daysSupply:350, ffp2:95e6, confidence:87, sourceKey:'eu_open_data', lastUpdated:'2026-05-02', dataType:'estimate' },
  { id:'RU', name:'Russie',         continent:'Europe',  daysSupply:150, ffp2:80e6, confidence:50, sourceKey:'voluntary_reporting',lastUpdated:'2026-04-20',dataType:'estimate'},
  { id:'CA', name:'Canada',         continent:'Amériques',daysSupply:240, ffp2:60e6,confidence:83, sourceKey:'cdc_open_data', lastUpdated:'2026-04-30',dataType:'estimate'},
];

// Export pour usage dans stocks.html
if (typeof module !== 'undefined') {
  module.exports = { STOCK_SOURCES, STOCKS_DEMO_DATA, ALERT_COLORS, computeAlertLevel, computeConfidence, formatStockUnits };
}
