'use strict';

/**
 * BreathIQ — stocks-api.js
 * Stocks FFP2/N95/KN95 — derniers chiffres officiels connus par pays
 * Sources : rapports parlementaires, audits gouvernementaux, communications officielles
 * IMPORTANT : aucune API temps réel n'existe pour les stocks stratégiques (données classifiées)
 */

// ── Couleurs par niveau d'alerte ──────────────────────────────────────────────
const ALERT_COLORS = {
  SUFFICIENT: { fill: '#DCFCE7', border: '#15803D', text: '#14532D', label: 'Suffisant' },
  MODERATE:   { fill: '#DBEAFE', border: '#1A6FD4', text: '#1E3A5F', label: 'Modéré'   },
  LOW:        { fill: '#FEF3C7', border: '#B45309', text: '#78350F', label: 'Faible'    },
  CRITICAL:   { fill: '#FEE2E2', border: '#B91C1C', text: '#7F1D1D', label: 'Critique'  },
  UNKNOWN:    { fill: '#F3F4F6', border: '#9CA3AF', text: '#374151', label: 'Inconnu'   },
};

// ── Calcul du niveau d'alerte ─────────────────────────────────────────────────
function computeAlertLevel(daysSupply) {
  if (daysSupply == null || isNaN(daysSupply)) return 'UNKNOWN';
  if (daysSupply > 90)  return 'SUFFICIENT';
  if (daysSupply >= 30) return 'MODERATE';
  if (daysSupply >= 7)  return 'LOW';
  return 'CRITICAL';
}

// ── Formatage des unités ──────────────────────────────────────────────────────
function formatStockUnits(n) {
  if (n == null) return '—';
  if (n >= 1e9)  return (n / 1e9).toFixed(1) + ' Md';
  if (n >= 1e6)  return (n / 1e6).toFixed(0) + ' M';
  if (n >= 1e3)  return (n / 1e3).toFixed(0) + ' k';
  return n.toString();
}

// ── Données de fallback (si data/stocks.json indisponible) ────────────────────
// Seules les données officiellement publiées sont incluses.
const STOCKS_DEMO_DATA = [
  {
    id: 'FR', name: 'France', continent: 'Europe',
    daysSupply: null, ffp2: 680_000_000,
    confidence: 55, lastUpdated: '2024-01-15',
    dataType: 'official',
    sourceName: 'Cour des Comptes — Rapport gestion COVID',
    sourceUrl: 'https://www.ccomptes.fr/fr/publications/la-gestion-de-la-crise-covid-19',
    note: '680 millions FFP2 en janvier 2024. Stock réel actuel incertain (péremptions 2024-2026).',
  },
  {
    id: 'DE', name: 'Allemagne', continent: 'Europe',
    daysSupply: null, ffp2: 312_000_000,
    confidence: 75, lastUpdated: '2024-01-10',
    dataType: 'official',
    sourceName: 'Bundestag — Question parlementaire jan. 2024',
    sourceUrl: 'https://www.bundestag.de/presse/hib/kurzmeldungen-984912',
    note: '312 millions FFP2 en réserve fédérale (Bundesreserve), janvier 2024.',
  },
  {
    id: 'BE', name: 'Belgique', continent: 'Europe',
    daysSupply: null, ffp2: 5_700_000, kn95: 45_000_000,
    confidence: 60, lastUpdated: '2024-06-01',
    dataType: 'official',
    sourceName: 'Parlement belge — SPF Santé publique',
    sourceUrl: 'https://www.health.belgium.be',
    note: '5,7 millions FFP2 + 45 millions KN95 en stock stratégique fédéral.',
  },
  {
    id: 'GB', name: 'Royaume-Uni', continent: 'Europe',
    daysSupply: 84, ffp2: null,
    confidence: 80, lastUpdated: '2025-01-01',
    dataType: 'official',
    sourceName: 'Gov.Wales — PPE Stockpile Volumes WHC2025/023',
    sourceUrl: 'https://www.gov.wales/ppe-stockpile-volumes-wales-whc2025023-html',
    note: 'Pays de Galles : 12 semaines de stock FFP2 (cible). Données UK globales non publiées.',
  },
  {
    id: 'US', name: 'États-Unis', continent: 'Amériques',
    daysSupply: null, ffp2: null,
    confidence: 0, lastUpdated: null,
    dataType: 'unknown',
    sourceName: 'HHS — Strategic National Stockpile',
    sourceUrl: 'https://aspr.hhs.gov/SNS/Pages/default.aspx',
    note: 'Stock classifié pour des raisons de sécurité nationale. Aucune donnée publique.',
  },
  {
    id: 'CA', name: 'Canada', continent: 'Amériques',
    daysSupply: null, ffp2: null,
    confidence: 0, lastUpdated: null,
    dataType: 'unknown',
    sourceName: 'ASPC — Agence de santé publique du Canada',
    sourceUrl: 'https://www.canada.ca/fr/sante-publique.html',
    note: 'Réserves stratégiques non publiées.',
  },
  {
    id: 'AU', name: 'Australie', continent: 'Océanie',
    daysSupply: null, ffp2: null,
    confidence: 0, lastUpdated: null,
    dataType: 'unknown',
    sourceName: 'Dept. of Health — National Medical Stockpile',
    sourceUrl: 'https://www.health.gov.au',
    note: 'National Medical Stockpile non divulgué.',
  },
  {
    id: 'JP', name: 'Japon', continent: 'Asie',
    daysSupply: null, ffp2: null,
    confidence: 0, lastUpdated: null,
    dataType: 'unknown',
    sourceName: 'MHLW — Ministry of Health, Labour and Welfare',
    sourceUrl: 'https://www.mhlw.go.jp',
    note: 'Aucune donnée publique disponible.',
  },
  {
    id: 'KR', name: 'Corée du Sud', continent: 'Asie',
    daysSupply: null, ffp2: null,
    confidence: 0, lastUpdated: null,
    dataType: 'unknown',
    sourceName: 'KDCA — Korea Disease Control and Prevention Agency',
    sourceUrl: 'https://www.kdca.go.kr',
    note: 'Stocks stratégiques non publiés.',
  },
  {
    id: 'CN', name: 'Chine', continent: 'Asie',
    daysSupply: null, ffp2: null,
    confidence: 0, lastUpdated: null,
    dataType: 'unknown',
    sourceName: 'MIIT — Ministère de l\'Industrie et des Technologies',
    sourceUrl: 'https://www.miit.gov.cn',
    note: 'Premier producteur mondial. Capacité production publiée, pas les réserves stratégiques.',
  },
  {
    id: 'IN', name: 'Inde', continent: 'Asie',
    daysSupply: null, ffp2: null,
    confidence: 0, lastUpdated: null,
    dataType: 'unknown',
    sourceName: 'MoHFW — Ministry of Health and Family Welfare',
    sourceUrl: 'https://mohfw.gov.in',
    note: 'Aucune donnée publique disponible.',
  },
  {
    id: 'BR', name: 'Brésil', continent: 'Amériques',
    daysSupply: null, ffp2: null,
    confidence: 0, lastUpdated: null,
    dataType: 'unknown',
    sourceName: 'ANVISA — Brésil',
    sourceUrl: 'https://www.gov.br/anvisa',
    note: 'Aucune donnée publique sur les réserves stratégiques.',
  },
  {
    id: 'RU', name: 'Russie', continent: 'Europe',
    daysSupply: null, ffp2: null,
    confidence: 0, lastUpdated: null,
    dataType: 'unknown',
    sourceName: 'Minzdrav — Ministère de la Santé russe',
    sourceUrl: 'https://minzdrav.gov.ru',
    note: 'Données non disponibles publiquement.',
  },
  {
    id: 'NG', name: 'Nigéria', continent: 'Afrique',
    daysSupply: null, ffp2: null,
    confidence: 0, lastUpdated: null,
    dataType: 'unknown',
    sourceName: 'UNICEF / OMS',
    sourceUrl: 'https://www.unicef.org/supply',
    note: 'Aucune donnée nationale disponible.',
  },
];

// ── Chargement depuis data/stocks.json ────────────────────────────────────────
let _stocksJsonData = null;
let _stocksJsonLoading = false;
const _stocksCallbacks = [];

async function loadStocksJson() {
  if (_stocksJsonData) return _stocksJsonData;
  if (_stocksJsonLoading) {
    return new Promise(resolve => _stocksCallbacks.push(resolve));
  }
  _stocksJsonLoading = true;
  try {
    const r = await fetch('/data/stocks.json?_=' + Date.now());
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const json = await r.json();
    _stocksJsonData = (json.regions || []).map(r => ({
      ...r,
      alertLevel: computeAlertLevel(r.daysSupply),
    }));
    _stocksCallbacks.forEach(cb => cb(_stocksJsonData));
    return _stocksJsonData;
  } catch (err) {
    console.warn('[stocks] Impossible de charger data/stocks.json, fallback local', err);
    _stocksJsonData = STOCKS_DEMO_DATA.map(r => ({
      ...r,
      alertLevel: computeAlertLevel(r.daysSupply),
    }));
    _stocksCallbacks.forEach(cb => cb(_stocksJsonData));
    return _stocksJsonData;
  } finally {
    _stocksJsonLoading = false;
  }
}

// ── API publique exposée à stocks.html ────────────────────────────────────────
window.StocksAPI = {
  ALERT_COLORS,
  computeAlertLevel,
  formatStockUnits,

  // Retourne une promesse résolue avec les données stocks
  getStocksData: () => loadStocksJson(),

  // Données synchrones (fallback si JSON pas encore chargé)
  getFallbackData: () => STOCKS_DEMO_DATA.map(r => ({
    ...r,
    alertLevel: computeAlertLevel(r.daysSupply),
  })),
};
