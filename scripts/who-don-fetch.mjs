/**
 * WHO Disease Outbreak News — daily fetch pipeline
 * Source : WHO OData API (JSON natif, plus fiable que le scraping HTML)
 * Endpoint découvert le 2026-06-06 après migration du site WHO vers Sitefinity CMS
 * Writes to data/who-alerts.json
 */

import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, '../data/who-alerts.json');

// API OData JSON — retourne directement les DON structurés
const WHO_API_URL = 'https://www.who.int/api/emergencies/diseaseoutbreaknews'
  + '?sf_provider=dynamicProvider372'
  + '&sf_culture=en'
  + '&$orderby=PublicationDateAndTime%20desc'
  + '&$expand=EmergencyEvent'
  + '&$select=Title,TitleSuffix,ItemDefaultUrl,PublicationDateAndTime'
  + '&$top=20';

// Fallback : API archive RSS (si OData indisponible)
const WHO_RSS_URL = 'https://www.who.int/rss-feeds/news-english.xml';

const HEADERS = {
  'User-Agent': 'BreathIQ-Bot/1.0 (https://breathiq.fr; contact@breathiq.fr; public health monitoring)',
  'Accept': 'application/json, text/html;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.who.int/emergencies/disease-outbreak-news',
};

function classifyRiskLevel(title) {
  const t = (title || '').toLowerCase();
  if (t.includes('pheic') || t.includes('emergency of international concern')) return 'critical';
  if (t.includes('ebola') || t.includes('marburg') || t.includes('nipah') || t.includes('bundibugyo')) return 'critical';
  if (t.includes('hantavirus') || t.includes('lassa') || t.includes('rift valley') || t.includes('yellow fever')) return 'high';
  if (t.includes('outbreak') || t.includes('flambée') || t.includes('h5n1') || t.includes('avian influenza')) return 'high';
  if (t.includes('cluster') || t.includes('cases') || t.includes('cholera') || t.includes('mpox')) return 'moderate';
  return 'low';
}

/**
 * Tente de récupérer les DON via l'API OData JSON (source primaire)
 */
async function fetchViaODataAPI() {
  const resp = await fetch(WHO_API_URL, {
    headers: HEADERS,
    signal: AbortSignal.timeout(20000),
  });

  if (!resp.ok) throw new Error(`HTTP ${resp.status} sur l'API OData`);

  const data = await resp.json();
  const items = data?.value;
  if (!Array.isArray(items) || items.length === 0) throw new Error('API OData : tableau value vide ou manquant');

  return items.map(item => {
    const donPath = item.ItemDefaultUrl || '';
    // ItemDefaultUrl peut être "/2026-DON605" → on construit l'URL complète
    const donId = donPath.replace(/^\//, '').trim() || 'unknown';
    const url = donPath.startsWith('http')
      ? donPath
      : `https://www.who.int/emergencies/disease-outbreak-news/item${donPath}`;

    const pubDate = item.PublicationDateAndTime
      ? item.PublicationDateAndTime.slice(0, 7)  // "2026-05"
      : new Date().toISOString().slice(0, 7);

    const title = [item.Title, item.TitleSuffix]
      .filter(Boolean)
      .join(' — ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 200);

    return {
      title: title || donId,
      url,
      donId,
      pubDate,
      riskLevel: classifyRiskLevel(title),
      source: 'WHO OData API',
    };
  });
}

/**
 * Fallback : alertes récentes hardcodées (si toutes les sources réseau échouent)
 * Mis à jour lors de chaque révision du script.
 */
function getFallbackAlerts() {
  return [
    { title: 'Ebola disease caused by Bundibugyo virus — DRC & Uganda (PHEIC)', url: 'https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON605', donId: '2026-DON605', pubDate: '2026-05', riskLevel: 'critical', source: 'fallback' },
    { title: 'Hantavirus Andes — Multi-country cruise ship cluster', url: 'https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON604', donId: '2026-DON604', pubDate: '2026-05', riskLevel: 'high', source: 'fallback' },
    { title: 'Hantavirus cluster linked to cruise ship travel — Multi-country', url: 'https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON600', donId: '2026-DON600', pubDate: '2026-05', riskLevel: 'high', source: 'fallback' },
    { title: 'Nipah virus infection — Bangladesh', url: 'https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON594', donId: '2026-DON594', pubDate: '2026-02', riskLevel: 'critical', source: 'fallback' },
    { title: 'Nipah virus disease — India (West Bengal)', url: 'https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON593', donId: '2026-DON593', pubDate: '2026-02', riskLevel: 'critical', source: 'fallback' },
    { title: 'Marburg virus disease — Ethiopia (outbreak ended Jan 2026)', url: 'https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON592', donId: '2026-DON592', pubDate: '2026-01', riskLevel: 'high', source: 'fallback' },
  ];
}

async function main() {
  const today = new Date().toISOString().slice(0, 10);
  console.log(`\n🔄  WHO DON Fetch — ${today}\n`);

  let alerts = [];
  let fetchSource = 'unknown';

  // Tentative 1 : API OData JSON (source primaire, la plus fiable)
  try {
    console.log('📡  Tentative API OData JSON...');
    alerts = await fetchViaODataAPI();
    fetchSource = 'WHO OData API';
    console.log(`✅  ${alerts.length} alertes récupérées via API OData`);
    alerts.forEach(a => console.log(`  · [${a.riskLevel.toUpperCase()}] ${a.title.slice(0, 80)}`));
  } catch (e) {
    console.warn(`⚠️  API OData échouée : ${e.message}`);
  }

  // Fallback : alertes connues si toutes les sources réseau ont échoué
  if (alerts.length === 0) {
    console.log('📌  Utilisation du fallback (alertes récentes connues)...');
    alerts = getFallbackAlerts();
    fetchSource = 'fallback';
    console.log(`📌  ${alerts.length} alertes fallback utilisées`);
  }

  const output = {
    generatedAt: new Date().toISOString(),
    fetchDate: today,
    alertCount: alerts.length,
    source: fetchSource,
    alerts,
  };

  // S'assurer que le dossier data/ existe (protection contre checkout partiel en CI)
  mkdirSync(join(__dirname, '../data'), { recursive: true });

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf8');
  console.log(`\n💾  ${alerts.length} alertes écrites dans data/who-alerts.json`);
  console.log(`📊  Source : ${fetchSource}`);
}

main().catch(e => {
  console.error('❌  Erreur fatale :', e.message);
  console.error(e.stack);
  process.exit(1);
});
