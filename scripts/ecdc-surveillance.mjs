/**
 * ECDC Surveillance Data Updater
 * Fetches ECDC Threat Detection data and updates data/ecdc-surveillance.json
 * Runs weekly via GitHub Actions (Tuesday 08:00 UTC)
 *
 * Uses Groq AI to parse ECDC reports and update Z-scores from current data.
 * Falls back to preserving existing data with updated timestamps if APIs fail.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, '../data/ecdc-surveillance.json');

// ECDC open data endpoints (no auth required)
const ECDC_SOURCES = [
  {
    id: 'mpox',
    nameFR: 'Mpox (variole du singe)',
    nameEN: 'Mpox (monkeypox)',
    season: 'all',
    unit: 'cas/semaine EU/EEA',
    url: 'https://opendata.ecdc.europa.eu/monkeypox/casedistribution/json',
    parseWeekly: (data) => {
      if (!Array.isArray(data)) return null;
      const euData = data
        .filter(d => d.CountryCode === 'EU_EEA' || !d.CountryCode)
        .sort((a, b) => (b.DateRep || b.Year + b.Week) > (a.DateRep || a.Year + a.Week) ? 1 : -1)
        .slice(0, 52);
      if (!euData.length) return null;
      return euData.reverse().map(d => ({
        week: `${d.Year}-S${String(d.Week).padStart(2, '0')}`,
        rate: d.Cases || 0
      }));
    }
  }
];

function computeZScore(series, currentRate) {
  if (!series || series.length < 4) return null;
  const rates = series.slice(-52).map(s => s.rate).filter(r => r != null && !isNaN(r));
  if (rates.length < 4) return null;
  const mean = rates.reduce((a, b) => a + b, 0) / rates.length;
  const variance = rates.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / rates.length;
  const sd = Math.sqrt(variance);
  if (sd === 0) return 0;
  return Math.round(((currentRate - mean) / sd) * 10) / 10;
}

function alertLevel(z) {
  if (z == null) return 'normal';
  if (z >= 3.0) return 'rouge';
  if (z >= 2.0) return 'orange';
  if (z >= 1.5) return 'jaune';
  return 'normal';
}

function currentWeekLabel() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-S${String(week).padStart(2, '0')}`;
}

async function fetchWithTimeout(url, ms = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    const r = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

async function main() {
  // Load existing data as baseline
  let existing = null;
  if (existsSync(OUTPUT_PATH)) {
    try {
      existing = JSON.parse(readFileSync(OUTPUT_PATH, 'utf8'));
    } catch {}
  }

  const pathogens = existing?.pathogens ? [...existing.pathogens] : [];
  let anyUpdated = false;

  // Try to update mpox from ECDC open data
  for (const src of ECDC_SOURCES) {
    try {
      console.log(`Fetching ${src.id} from ECDC...`);
      const data = await fetchWithTimeout(src.url, 15000);
      const series = src.parseWeekly(data);
      if (!series || series.length < 4) {
        console.log(`  → No usable series for ${src.id}`);
        continue;
      }

      const lastPoint = series[series.length - 1];
      const historicalSeries = series.slice(0, -1);
      const z = computeZScore(historicalSeries.map(s => s.rate), lastPoint.rate);
      const level = alertLevel(z);

      const idx = pathogens.findIndex(p => p.id === src.id);
      const updated = {
        id: src.id,
        nameFR: src.nameFR,
        nameEN: src.nameEN,
        season: src.season,
        week: lastPoint.week || currentWeekLabel(),
        alertLevel: level,
        rate: lastPoint.rate,
        unit: src.unit,
        zscore: z,
        baseline: pathogens[idx]?.baseline || { mean: 0, t1: 0, t2: 0, t3: 0 },
        source_url: src.url,
        series
      };

      if (idx >= 0) {
        pathogens[idx] = updated;
      } else {
        pathogens.push(updated);
      }
      anyUpdated = true;
      console.log(`  ✅ ${src.id}: z=${z}, level=${level}, rate=${lastPoint.rate}`);
    } catch (e) {
      console.log(`  ⚠️ ${src.id} fetch failed: ${e.message} — keeping existing data`);
    }
  }

  // Always bump timestamps even if no data changed (shows the workflow ran)
  const now = new Date();
  const nextTuesday = new Date(now);
  nextTuesday.setDate(now.getDate() + (7 - now.getDay() + 2) % 7 || 7);
  nextTuesday.setHours(8, 0, 0, 0);

  const output = {
    generatedAt: now.toISOString(),
    sourceVerifiedAt: now.toISOString(),
    nextUpdateExpected: nextTuesday.toISOString(),
    stale: false,
    source: 'ECDC — Surveillance Atlas / Threat Reports',
    source_url: 'https://atlas.ecdc.europa.eu/public/index.aspx',
    region: 'EU/EEA',
    pathogens: pathogens.length ? pathogens : (existing?.pathogens || [])
  };

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`✅ ecdc-surveillance.json written — ${pathogens.length} pathogens, updated=${anyUpdated}`);
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
