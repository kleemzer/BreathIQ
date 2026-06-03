/**
 * WHO Disease Outbreak News — daily fetch pipeline
 * Scrapes WHO DON page (RSS is unreliable) → structured JSON
 * Writes to data/who-alerts.json
 */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, '../data/who-alerts.json');

const WHO_DON_URL = 'https://www.who.int/emergencies/disease-outbreak-news';

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&apos;/g, "'").replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

function classifyRiskLevel(title) {
  const t = title.toLowerCase();
  if (t.includes('pheic') || t.includes('emergency of international concern')) return 'critical';
  if (t.includes('ebola') || t.includes('marburg') || t.includes('nipah') || t.includes('bundibugyo')) return 'critical';
  if (t.includes('outbreak') || t.includes('flambée') || t.includes('hantavirus')) return 'high';
  if (t.includes('cluster') || t.includes('cases') || t.includes('infection')) return 'moderate';
  return 'low';
}

// Extract DON items from WHO HTML page
function parseDONPage(html) {
  const alerts = [];

  // Pattern: links to /emergencies/disease-outbreak-news/item/YEAR-DONxxx
  const donLinkRegex = /href="(\/emergencies\/disease-outbreak-news\/item\/[\w-]+)"/gi;
  const seen = new Set();
  let match;

  while ((match = donLinkRegex.exec(html)) !== null) {
    const path = match[1];
    if (seen.has(path)) continue;
    seen.add(path);

    // Extract DON ID from path
    const donId = path.split('/').pop();

    // Try to find the title near this link
    const linkIdx = html.indexOf(match[0]);
    const surrounding = html.slice(Math.max(0, linkIdx - 50), linkIdx + 400);

    // Look for title in various tag patterns
    const titleMatch =
      surrounding.match(/<h4[^>]*>([\s\S]*?)<\/h4>/i) ||
      surrounding.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i) ||
      surrounding.match(/<a[^>]*href="[^"]*don[^"]*"[^>]*>([\s\S]*?)<\/a>/i);

    const title = titleMatch ? stripHtml(titleMatch[1]).slice(0, 200) : donId;
    if (!title || title.length < 5) continue;

    // Extract year from DON ID (e.g. 2026-DON600 → 2026)
    const yearMatch = donId.match(/^(\d{4})-/);
    const year = yearMatch ? yearMatch[1] : '2026';

    alerts.push({
      title,
      url: `https://www.who.int${path}`,
      donId,
      pubDate: `${year}`,
      riskLevel: classifyRiskLevel(title),
      source: 'WHO DON',
    });

    if (alerts.length >= 20) break;
  }

  return alerts;
}

async function fetchWHODONPage() {
  try {
    const resp = await fetch(WHO_DON_URL, {
      headers: {
        'User-Agent': 'BreathIQ-Bot/1.0 (https://breathiq.fr; public health monitoring)',
        'Accept': 'text/html',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(20000),
    });
    if (!resp.ok) {
      console.warn(`⚠️  WHO DON page → HTTP ${resp.status}`);
      return null;
    }
    const html = await resp.text();
    console.log(`✅  WHO DON page récupérée (${html.length} chars)`);
    return html;
  } catch (e) {
    console.warn(`⚠️  WHO DON page → ${e.message}`);
    return null;
  }
}

async function main() {
  const today = new Date().toISOString().slice(0, 10);
  console.log(`\n🔄  WHO DON Fetch — ${today}\n`);

  const html = await fetchWHODONPage();

  let alerts = [];

  if (html) {
    alerts = parseDONPage(html);
    console.log(`📋  ${alerts.length} alertes WHO DON extraites`);

    if (alerts.length === 0) {
      console.warn('⚠️  Aucun lien DON trouvé — HTML structure peut-être changée');
      console.log('--- Début HTML (debug) ---');
      console.log(html.slice(0, 500));
    } else {
      alerts.forEach(a => console.log(`  · [${a.riskLevel.toUpperCase()}] ${a.title.slice(0, 80)}`));
    }
  }

  // Fallback: known recent DONs hardcodés (si scraping échoue)
  if (alerts.length === 0) {
    console.log('📌  Utilisation du fallback DONs récents connus...');
    alerts = [
      { title: 'Ebola disease caused by Bundibugyo virus — DRC & Uganda (PHEIC)', url: 'https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON605', donId: '2026-DON605', pubDate: '2026-06', riskLevel: 'critical', source: 'WHO DON (fallback)' },
      { title: 'Hantavirus cluster linked to cruise ship travel — Multi-country (Andes virus)', url: 'https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON604', donId: '2026-DON604', pubDate: '2026-05', riskLevel: 'high', source: 'WHO DON (fallback)' },
      { title: 'Hantavirus cluster linked to cruise ship travel — Multi-country', url: 'https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON600', donId: '2026-DON600', pubDate: '2026-05', riskLevel: 'high', source: 'WHO DON (fallback)' },
      { title: 'Nipah virus infection — Bangladesh', url: 'https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON594', donId: '2026-DON594', pubDate: '2026-02', riskLevel: 'critical', source: 'WHO DON (fallback)' },
      { title: 'Nipah virus disease — India (West Bengal)', url: 'https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON593', donId: '2026-DON593', pubDate: '2026-02', riskLevel: 'critical', source: 'WHO DON (fallback)' },
      { title: 'Marburg virus disease — Ethiopia (outbreak ended Jan 2026)', url: 'https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON592', donId: '2026-DON592', pubDate: '2026-01', riskLevel: 'high', source: 'WHO DON (fallback)' },
    ];
    console.log(`📌  ${alerts.length} alertes fallback utilisées`);
  }

  const output = {
    generatedAt: new Date().toISOString(),
    fetchDate: today,
    alertCount: alerts.length,
    source: html ? 'scraping' : 'fallback',
    alerts,
  };

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf8');
  console.log(`\n💾  ${alerts.length} alertes écrites dans ${OUTPUT_PATH}`);
}

main().catch(e => {
  console.error('❌  Erreur:', e.message);
  process.exit(1);
});
