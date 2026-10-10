#!/usr/bin/env node
/**
 * Collecte du bulletin national SPF « Chikungunya, dengue, Zika et West Nile en France hexagonale »
 * (surveillance renforcée, hebdomadaire de mai à novembre) → data/spf-arbo.json
 *
 * 1. page dossier West Nile de SPF → lien du dernier bulletin national
 * 2. page du bulletin → lien du PDF
 * 3. PDF → texte (pdftotext, paquet poppler-utils) → parseArboBulletin (aucune valeur estimée)
 * Si une étape échoue, le fichier précédent est conservé et marqué ok:false.
 */
import { writeFileSync, readFileSync, existsSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { parseArboBulletin } from './lib/spf-arbo-parse.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'data', 'spf-arbo.json');
const BASE = 'https://www.santepubliquefrance.fr';
const TOPIC = `${BASE}/maladies-a-transmission-vectorielle/west-nile-virus`;
const UA = 'Mozilla/5.0 (compatible; BreathIQ/1.0; +https://breathiq.fr; contact@breathiq.fr)';

const get = async url => {
  const r = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(45000) });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
  return r;
};

// SPF publie le mardi ou le mercredi ; prochaine publication attendue = mercredi suivant 18:00 UTC
function nextWednesday(from = new Date()) {
  const days = (3 - from.getUTCDay() + 7) % 7 || 7;
  return new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate() + days, 18));
}

async function main() {
  const topic = await (await get(TOPIC)).text();
  const bulletinPath = topic.match(/href="([^"]*\/bulletin-national\/chikungunya-dengue-zika-et-west-nile[^"]*)"/i)?.[1];
  if (!bulletinPath) throw new Error('lien du bulletin national introuvable sur la page dossier West Nile');
  const bulletinUrl = new URL(bulletinPath, BASE).toString();

  const page = await (await get(bulletinUrl)).text();
  const pdfPath = page.match(/href="([^"]*bullnat_arboviroses[^"]*\.pdf)"/i)?.[1] || page.match(/href="([^"]*\.pdf)"/i)?.[1];
  if (!pdfPath) throw new Error('PDF du bulletin introuvable');
  const pdfUrl = new URL(pdfPath, BASE).toString();

  const dir = mkdtempSync(join(tmpdir(), 'spf-arbo-'));
  const pdfFile = join(dir, 'bulletin.pdf');
  writeFileSync(pdfFile, Buffer.from(await (await get(pdfUrl)).arrayBuffer()));
  const text = execFileSync('pdftotext', ['-layout', pdfFile, '-'], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });

  const parsed = parseArboBulletin(text);
  if (parsed.westNile.autochthonousCases == null && parsed.chikungunya.autochthonousEpisodes == null) {
    throw new Error('aucun chiffre reconnu dans le bulletin (format modifié ?)');
  }
  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    sourceVerifiedAt: parsed.publicationDate ? `${parsed.publicationDate}T00:00:00.000Z` : new Date().toISOString(),
    nextUpdateExpected: nextWednesday().toISOString(),
    stale: false,
    source: 'Santé publique France — bulletin national de surveillance renforcée des arboviroses (France hexagonale)',
    source_url: bulletinUrl,
    pdf_url: pdfUrl,
    regionalNote: 'Le bulletin national ne détaille pas les cas par région ; consulter le bulletin régional SPF ou le site de l\'ARS concernée.',
    ...parsed,
  };
}

const previous = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : null;
try {
  const out = await main();
  writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
  console.log(`✅ spf-arbo.json — bulletin du ${out.publicationDate} (${out.epiWeek}) : West Nile ${out.westNile.autochthonousCases} cas autochtones, ${out.westNile.neuroinvasive} neuro-invasifs, ${out.westNile.deaths} décès`);
} catch (e) {
  console.error(`⚠️  ${e.message}`);
  if (previous) {
    writeFileSync(OUT, JSON.stringify({ ...previous, ok: false, error: e.message, failedAt: new Date().toISOString() }, null, 2) + '\n');
    console.error('Dernière collecte conservée, marquée ok:false');
  }
  process.exit(1);
}
