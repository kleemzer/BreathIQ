'use strict';

/**
 * BreathIQ — stocks-api.js
 * Données indicatives des stocks FFP2/N95 mondiaux
 * Sources : OMS, UNICEF, OCDE, rapports nationaux, estimations
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

// ── Sources ───────────────────────────────────────────────────────────────────
const STOCK_SOURCES = {
  who:       { name: 'OMS — Rapport EPI mondial',       url: 'https://www.who.int/emergencies/diseases/novel-coronavirus-2019/technical-guidance/infection-prevention-and-control/mask-use',        coverage: 'Mondial',   frequency: 'Annuelle',    reliability: 72, license: 'CC BY-NC-SA 3.0 IGO' },
  unicef:    { name: 'UNICEF Supply Division',          url: 'https://supply.unicef.org/all-materials/respiratory-protection.html',                                                               coverage: 'Mondial',   frequency: 'Mensuelle',   reliability: 80, license: 'Données publiques' },
  ecdc:      { name: 'ECDC — Capacités EU',             url: 'https://www.ecdc.europa.eu/en/publications-data/technical-guidance-healthcare-workers',                                            coverage: 'Europe',    frequency: 'Trimestrielle',reliability: 85, license: 'CC BY 4.0' },
  sns_fr:    { name: 'SNS France — EPRUS/ANS',          url: 'https://www.anrs.fr/',                                                                                                             coverage: 'France',    frequency: 'Confidentielle', reliability: 90, note: 'Stock stratégique — données partielles publiques' },
  fda:       { name: 'FDA / ASPR — Strategic Stockpile', url: 'https://medicalcountermeasures.gov/barda/diagnostics-ppe/',                                                                       coverage: 'États-Unis',frequency: 'Annuelle',    reliability: 82 },
  nhs:       { name: 'NHS — UK PPE Stockpile Report',   url: 'https://www.gov.uk/government/collections/coronavirus-covid-19-ppe',                                                              coverage: 'Royaume-Uni',frequency: 'Trimestrielle',reliability: 88 },
  estim:     { name: 'Estimation BreathIQ',             url: '#',                                                                                                                                coverage: 'Varies',    frequency: 'Calculée',    reliability: 45, note: 'Basée sur capacité de production × 3 mois + importations déclarées' },
  rivm:      { name: 'RIVM — Pays-Bas',                 url: 'https://www.rivm.nl/',                                                                                                             coverage: 'Pays-Bas',  frequency: 'Mensuelle',   reliability: 87 },
  phac:      { name: 'ASPC — Canada',                   url: 'https://www.canada.ca/en/public-health.html',                                                                                     coverage: 'Canada',    frequency: 'Trimestrielle',reliability: 84 },
  kirby:     { name: 'Kirby Institute — Australie',     url: 'https://www.kirby.unsw.edu.au/',                                                                                                  coverage: 'Australie', frequency: 'Annuelle',    reliability: 79 },
};

// ── Données stocks (indicatives) ─────────────────────────────────────────────
const STOCKS_DEMO_DATA = [
  {
    id: 'FR', name: 'France', continent: 'Europe',
    daysSupply: 68, ffp2: 285_000_000,
    confidence: 62, lastUpdated: '2026-03-15',
    dataType: 'official', sourceKey: 'sns_fr',
    note: 'Stock SNS + stocks hospitaliers déclarés. Stock stratégique non communiqué.',
  },
  {
    id: 'DE', name: 'Allemagne', continent: 'Europe',
    daysSupply: 95, ffp2: 520_000_000,
    confidence: 74, lastUpdated: '2026-02-28',
    dataType: 'official', sourceKey: 'ecdc',
    note: 'Bundesreserve + Länder. Reconstitution post-COVID complète.',
  },
  {
    id: 'GB', name: 'Royaume-Uni', continent: 'Europe',
    daysSupply: 112, ffp2: 680_000_000,
    confidence: 88, lastUpdated: '2026-04-01',
    dataType: 'official', sourceKey: 'nhs',
    note: 'NHS PPE Stockpile Report Q1-2026. Stock central + NHS trusts.',
  },
  {
    id: 'US', name: 'États-Unis', continent: 'Amériques',
    daysSupply: 142, ffp2: 3_200_000_000,
    confidence: 76, lastUpdated: '2026-01-20',
    dataType: 'official', sourceKey: 'fda',
    note: 'Strategic National Stockpile + production domestique 3M, Honeywell.',
  },
  {
    id: 'CA', name: 'Canada', continent: 'Amériques',
    daysSupply: 88, ffp2: 420_000_000,
    confidence: 78, lastUpdated: '2026-02-14',
    dataType: 'official', sourceKey: 'phac',
  },
  {
    id: 'BR', name: 'Brésil', continent: 'Amériques',
    daysSupply: 22, ffp2: 95_000_000,
    confidence: 42, lastUpdated: '2026-01-10',
    dataType: 'estimate', sourceKey: 'estim',
    note: 'Estimé — production nationale + importations déclarées à l\'ANVISA.',
  },
  {
    id: 'MX', name: 'Mexique', continent: 'Amériques',
    daysSupply: 14, ffp2: 48_000_000,
    confidence: 35, lastUpdated: '2025-11-30',
    dataType: 'estimate', sourceKey: 'estim',
  },
  {
    id: 'CN', name: 'Chine', continent: 'Asie',
    daysSupply: 180, ffp2: 12_000_000_000,
    confidence: 55, lastUpdated: '2026-03-01',
    dataType: 'declarative', sourceKey: 'who',
    note: 'Premier producteur mondial. Chiffres déclaratifs MIIT. Données partielles.',
  },
  {
    id: 'JP', name: 'Japon', continent: 'Asie',
    daysSupply: 105, ffp2: 890_000_000,
    confidence: 82, lastUpdated: '2026-02-20',
    dataType: 'official', sourceKey: 'who',
    note: 'Ministry of Health, Labour and Welfare. Reconstitution complète.',
  },
  {
    id: 'KR', name: 'Corée du Sud', continent: 'Asie',
    daysSupply: 130, ffp2: 740_000_000,
    confidence: 85, lastUpdated: '2026-03-10',
    dataType: 'official', sourceKey: 'who',
    note: 'KDCA + production nationale (fabricant KF94). Système de distribution centralisé.',
  },
  {
    id: 'IN', name: 'Inde', continent: 'Asie',
    daysSupply: 18, ffp2: 320_000_000,
    confidence: 38, lastUpdated: '2025-12-15',
    dataType: 'estimate', sourceKey: 'estim',
    note: 'Estimé — rapport CPCB + MoHFW. Forte disparité régionale.',
  },
  {
    id: 'ID', name: 'Indonésie', continent: 'Asie',
    daysSupply: 9, ffp2: 62_000_000,
    confidence: 30, lastUpdated: '2025-10-01',
    dataType: 'estimate', sourceKey: 'estim',
  },
  {
    id: 'PK', name: 'Pakistan', continent: 'Asie',
    daysSupply: 5, ffp2: 18_000_000,
    confidence: 25, lastUpdated: '2025-09-01',
    dataType: 'estimate', sourceKey: 'estim',
  },
  {
    id: 'AU', name: 'Australie', continent: 'Océanie',
    daysSupply: 97, ffp2: 310_000_000,
    confidence: 79, lastUpdated: '2026-02-01',
    dataType: 'official', sourceKey: 'kirby',
    note: 'National Medical Stockpile + état-fédéral. Post-COVID stockpile reform.',
  },
  {
    id: 'NG', name: 'Nigéria', continent: 'Afrique',
    daysSupply: 6, ffp2: 14_000_000,
    confidence: 28, lastUpdated: '2025-08-15',
    dataType: 'estimate', sourceKey: 'unicef',
    note: 'Estimé via UNICEF/OMS. Forte dépendance aux importations.',
  },
  {
    id: 'ET', name: 'Éthiopie', continent: 'Afrique',
    daysSupply: 4, ffp2: 8_000_000,
    confidence: 22, lastUpdated: '2025-07-01',
    dataType: 'estimate', sourceKey: 'unicef',
  },
  {
    id: 'CD', name: 'RD Congo', continent: 'Afrique',
    daysSupply: 3, ffp2: 4_500_000,
    confidence: 20, lastUpdated: '2025-06-01',
    dataType: 'estimate', sourceKey: 'unicef',
    note: 'Données OMS/UNICEF. Contexte de fragilité sanitaire.',
  },
  {
    id: 'RU', name: 'Russie', continent: 'Europe',
    daysSupply: 45, ffp2: 380_000_000,
    confidence: 32, lastUpdated: '2025-11-01',
    dataType: 'declarative', sourceKey: 'estim',
    note: 'Données incomplètes depuis 2022. Estimation conservative.',
  },
];
