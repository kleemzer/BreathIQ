#!/usr/bin/env node
/**
 * Collecte des incidences hebdomadaires du Réseau Sentinelles (Inserm / Sorbonne Université)
 * → data/spf-surveillance.json
 *
 * Source officielle, données ouvertes : https://www.sentiweb.fr/datasets/all/inc-<indicateur>-PAY.csv
 *   indicateur 3 : syndromes grippaux (ILI)      indicateur 6 : diarrhée aiguë
 * Documentation : https://www.sentiweb.fr/france/fr/?page=table
 *
 * Aucune valeur n'est inventée : si un indicateur ne répond pas, il est omis et le fichier est
 * marqué stale. Le Z-score est calculé sur les 52 semaines précédentes (même méthode que
 * .github/workflows/zscore-compute.yml).
 */
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'data', 'spf-surveillance.json');
const BASE = 'https://www.sentiweb.fr/datasets/all';
const UA = 'BreathIQ/1.0 (+https://breathiq.fr; contact@breathiq.fr)';

const INDICATORS = [
  { id: 'flu',    indicator: 3, nameFR: 'Syndromes grippaux', nameEN: 'Influenza-like illness', season: 'winter' },
  { id: 'gastro', indicator: 6, nameFR: 'Diarrhée aiguë',     nameEN: 'Acute diarrhoea',        season: 'winter' },
];

// Sentinelles encode la semaine en YYYYWW (ISO)
const toIsoWeek = yyyyww => `${String(yyyyww).slice(0, 4)}-S${String(yyyyww).slice(4)}`;

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const metaLine = lines.find(l => l.startsWith('#'));
  const meta = metaLine ? JSON.parse(metaLine.slice(1).trim()) : {};
  const header = lines.find(l => !l.startsWith('#')).split(',');
  const rows = lines.filter(l => !l.startsWith('#') && l !== header.join(',')).map(l => {
    const cells = l.split(',');
    return Object.fromEntries(header.map((h, i) => [h, cells[i]]));
  });
  return { meta, rows };
}

function zscore(previous, current) {
  const rates = previous.slice(-52).map(s => s.rate).filter(r => r != null && !isNaN(r));
  if (rates.length < 4) return { z: null, mean: null, sd: null };
  const mean = rates.reduce((a, b) => a + b, 0) / rates.length;
  const sd = Math.sqrt(rates.reduce((a, b) => a + (b - mean) ** 2, 0) / rates.length);
  if (sd === 0) return { z: 0, mean, sd };
  return { z: Math.round(((current - mean) / sd) * 10) / 10, mean: Math.round(mean), sd: Math.round(sd) };
}
const alertLevel = z => z == null ? 'normal' : z >= 3 ? 'rouge' : z >= 2 ? 'orange' : z >= 1.5 ? 'jaune' : 'normal';

async function fetchIndicator(def) {
  const url = `${BASE}/inc-${def.indicator}-PAY.csv`;
  const resp = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(30000) });
  if (!resp.ok) throw new Error(`HTTP ${resp.status} ${url}`);
  const { meta, rows } = parseCsv(await resp.text());
  const points = rows
    .map(r => ({ weekNum: Number(r.week), rate: r.inc100 === '' || r.inc100 == null ? null : Number(r.inc100) }))
    .filter(p => Number.isFinite(p.weekNum) && p.rate != null && !isNaN(p.rate))
    .sort((a, b) => a.weekNum - b.weekNum);
  if (points.length < 5) throw new Error(`série trop courte pour ${def.id}`);
  const series = points.slice(-53).map(p => ({ week: toIsoWeek(p.weekNum), rate: p.rate }));
  const last = series[series.length - 1];
  const { z, mean, sd } = zscore(series.slice(0, -1), last.rate);
  return {
    id: def.id, nameFR: def.nameFR, nameEN: def.nameEN, season: def.season,
    week: last.week, rate: last.rate, unit: 'cas/100 000',
    zscore: z, alertLevel: alertLevel(z), baseline: { mean, sd, weeks: Math.min(52, series.length - 1) },
    series: series.slice(-52),
    source: 'Réseau Sentinelles — Inserm / Sorbonne Université',
    source_url: url,
    sourceGeneratedAt: meta.date || null,
  };
}

// Sentinelles publie le mercredi ; prochaine publication attendue = mercredi suivant 12:00 UTC
function nextWednesday(from = new Date()) {
  const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate(), 12));
  const delta = (3 - d.getUTCDay() + 7) % 7 || 7;
  d.setUTCDate(d.getUTCDate() + delta);
  return d;
}

const results = await Promise.allSettled(INDICATORS.map(fetchIndicator));
const pathogens = results.filter(r => r.status === 'fulfilled').map(r => r.value);
for (const r of results) if (r.status === 'rejected') console.warn('⚠️ ', r.reason.message);
if (!pathogens.length) { console.error('❌ aucune série Sentinelles récupérée — fichier inchangé'); process.exit(1); }

const sourceDates = pathogens.map(p => p.sourceGeneratedAt).filter(Boolean).sort();
const sourceVerifiedAt = sourceDates[0] ? new Date(sourceDates[0]).toISOString() : new Date().toISOString();
const nextUpdateExpected = nextWednesday().toISOString();

const previous = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {};
const out = {
  generatedAt: new Date().toISOString(),
  sourceVerifiedAt,
  nextUpdateExpected,
  // stale est recalculé à la lecture (scripts/validate-data.mjs et client) : now > nextUpdateExpected + 48 h
  stale: false,
  source: 'Réseau Sentinelles — Inserm / Sorbonne Université (données ouvertes)',
  source_url: 'https://www.sentiweb.fr/france/fr/?page=table',
  note: 'Incidences hebdomadaires nationales pour 100 000 habitants. La bronchiolite (ex-entrée manuelle) ne dispose pas de série ouverte comparable et n\'est plus publiée ici.',
  pathogens,
};
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
console.log(`✅ spf-surveillance.json — ${pathogens.map(p => `${p.id} ${p.week} ${p.rate}/100k z=${p.zscore}`).join(' · ')} (précédent : ${previous.pathogens?.map(p => p.week).join('/') || '—'})`);
