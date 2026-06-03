/**
 * WHO Disease Outbreak News — daily fetch pipeline
 * Fetches WHO DON RSS + page, extracts structured alerts
 * Writes to data/who-alerts.json
 *
 * No AI required — pure RSS/HTML parsing
 */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, '../data/who-alerts.json');

// WHO Disease Outbreak News sources
const WHO_SOURCES = [
  {
    name: 'WHO Disease Outbreak News',
    url: 'https://www.who.int/feeds/entity/csr/don/en/rss.xml',
    type: 'rss',
  },
  {
    name: 'WHO Health Emergencies',
    url: 'https://www.who.int/emergencies/disease-outbreak-news',
    type: 'html',
  },
];

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

function parseRSSItems(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title   = stripHtml(block.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '');
    const link    = (block.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1] || '').trim();
    const pubDate = (block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1] || '').trim();
    const desc    = stripHtml(block.match(/<description[^>]*>([\s\S]*?)<\/description>/i)?.[1] || '').slice(0, 300);
    if (title) items.push({ title, link, pubDate, description: desc });
  }
  return items.slice(0, 20); // Last 20 DONs
}

function classifyRiskLevel(title) {
  const t = title.toLowerCase();
  if (t.includes('pheic') || t.includes('emergency of international')) return 'critical';
  if (t.includes('ebola') || t.includes('marburg') || t.includes('nipah')) return 'critical';
  if (t.includes('outbreak') || t.includes('flambée')) return 'high';
  if (t.includes('cluster') || t.includes('cases')) return 'moderate';
  return 'low';
}

async function fetchSource(source) {
  try {
    const resp = await fetch(source.url, {
      headers: {
        'User-Agent': 'BreathIQ-Bot/1.0 (https://breathiq.fr; public health monitoring)',
        'Accept': source.type === 'rss' ? 'application/rss+xml, application/xml, text/xml' : 'text/html',
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!resp.ok) {
      console.warn(`⚠️  ${source.name} → HTTP ${resp.status}`);
      return null;
    }
    const text = await resp.text();
    console.log(`✅  ${source.name} (${text.length} chars)`);
    return text;
  } catch (e) {
    console.warn(`⚠️  ${source.name} → ${e.message}`);
    return null;
  }
}

async function main() {
  const today = new Date().toISOString().slice(0, 10);
  console.log(`\n🔄  WHO DON Fetch — ${today}\n`);

  const alerts = [];

  // 1. Fetch WHO RSS
  const rssSource = WHO_SOURCES.find(s => s.type === 'rss');
  const rssText = await fetchSource(rssSource);

  if (rssText) {
    const items = parseRSSItems(rssText);
    console.log(`📋  ${items.length} alertes WHO DON trouvées`);

    for (const item of items) {
      alerts.push({
        title: item.title,
        url: item.link,
        pubDate: item.pubDate,
        description: item.description,
        riskLevel: classifyRiskLevel(item.title),
        source: 'WHO DON',
      });
    }
  } else {
    console.warn('⚠️  Flux WHO RSS indisponible — utilisation du fallback vide');
  }

  // 2. Write output
  const output = {
    generatedAt: new Date().toISOString(),
    fetchDate: today,
    alertCount: alerts.length,
    alerts,
  };

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf8');
  console.log(`\n💾  ${alerts.length} alertes écrites dans ${OUTPUT_PATH}`);
}

main().catch(e => {
  console.error('❌  Erreur:', e.message);
  process.exit(1);
});
