#!/usr/bin/env node
/**
 * Collecte côté serveur des sources « live » autrefois appelées depuis le navigateur du visiteur
 * → data/live-sources.json (lu par api-live.js). Le visiteur ne contacte plus que breathiq.fr,
 * Open-Meteo et Nominatim (liés à sa position).
 *
 * Sources :
 *  - who_flunet_fr : WHO FluNet VIW_FNT (OData) — 12 dernières semaines France
 *  - sumeau        : SUM'Eau SARS-CoV-2 eaux usées — dernière ressource CSV résolue via l'API data.gouv
 *  - flu_vacc_data : Vaccination grippe (SPF / data.gouv) — ressource « couverture » la plus récente
 *  - ecdc_mpox     : ECDC mpox case distribution — 60 derniers jours
 * Chaque entrée porte ok/error, fetchedAt, sourceUrl, sourceLastModified. Rien n'est inventé :
 * une source en échec est marquée ok:false et le client affiche l'indisponibilité.
 */
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'data', 'live-sources.json');
const UA = 'BreathIQ/1.0 (+https://breathiq.fr; contact@breathiq.fr)';
const get = async (url, accept = 'application/json') => {
  const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: accept }, redirect: 'follow', signal: AbortSignal.timeout(45000) });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
  return r;
};

async function flunet() {
  const u = new URL('https://xmart-api-public.who.int/FLUMART/VIW_FNT');
  // Deux lignes par semaine (ORIGIN_SOURCE : sentinelle / non sentinelle) → top 30 ≈ 15 semaines ; agrégé côté client
  u.search = `$format=json&$filter=${encodeURIComponent("COUNTRY_CODE eq 'FRA'")}&$orderby=ISO_WEEKSTARTDATE%20desc&$top=30`;
  const j = await (await get(u.toString())).json();
  const value = (j.value || []).map(r => ({
    COUNTRY_CODE: r.COUNTRY_CODE, ISO_WEEKSTARTDATE: r.ISO_WEEKSTARTDATE, ISO_YEAR: r.ISO_YEAR, ISO_WEEK: r.ISO_WEEK, ORIGIN_SOURCE: r.ORIGIN_SOURCE,
    INF_ALL: r.INF_ALL, INF_A: r.INF_A, INF_B: r.INF_B, RSV: r.RSV, SPEC_PROCESSED_NB: r.SPEC_PROCESSED_NB, ILI_ACTIVITY: r.ILI_ACTIVITY,
  }));
  return { raw: { value }, sourceUrl: u.toString(), sourceLastModified: value[0]?.ISO_WEEKSTARTDATE || null };
}

async function sumeau() {
  const meta = await (await get('https://www.data.gouv.fr/api/1/datasets/surveillance-du-sars-cov-2-dans-les-eaux-usees-sumeau/')).json();
  const res = (meta.resources || []).filter(r => /indicateur/i.test(r.title || r.url || '') && /csv/i.test(r.format || r.url || ''))
    .sort((a, b) => String(b.last_modified).localeCompare(String(a.last_modified)))[0];
  if (!res) throw new Error('aucune ressource indicateurs CSV');
  const csv = await (await get(res.url, 'text/csv')).text();
  const lines = csv.trim().split('\n');
  return { raw: [lines[0], ...lines.slice(-12)].join('\n'), sourceUrl: res.url, sourceLastModified: res.last_modified || meta.last_modified || null };
}

async function fluVacc() {
  const meta = await (await get('https://www.data.gouv.fr/api/1/datasets/68f1ff3cda987ca867e6ba7e/')).json();
  const res = (meta.resources || []).filter(r => /couverture/i.test(r.title || r.url || '') && /json/i.test(r.format || r.url || ''))
    .sort((a, b) => String(b.last_modified).localeCompare(String(a.last_modified)))[0];
  if (!res) throw new Error('aucune ressource couverture JSON');
  let raw = await (await get(res.url)).json();
  // Export pandas orient="columns" ({ colonne: { "0": v, "1": v … } }) → tableau d'enregistrements
  if (raw && !Array.isArray(raw) && typeof raw === 'object' && Object.values(raw).every(v => v && typeof v === 'object' && !Array.isArray(v))) {
    const cols = Object.keys(raw);
    const idx = Object.keys(raw[cols[0]]);
    raw = idx.map(i => Object.fromEntries(cols.map(c => [c, raw[c][i]])));
  }
  return { raw, sourceUrl: res.url, sourceLastModified: res.last_modified || meta.last_modified || null, datasetTitle: meta.title };
}

// ECDC mpox « casedistribution/json » : fichier figé au 15/02/2023 (vérifié le 2026-10-09) — source morte,
// retirée. Les données mpox proviennent de data/ecdc-surveillance.json (ECDC Atlas, hebdomadaire).

const jobs = { who_flunet_fr: flunet, sumeau, flu_vacc_data: fluVacc };
const previous = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : { sources: {} };
const sources = {};
for (const [key, fn] of Object.entries(jobs)) {
  try {
    const r = await fn();
    sources[key] = { ok: true, fetchedAt: new Date().toISOString(), ...r };
    console.log(`✅ ${key} — source du ${r.sourceLastModified || '?'}`);
  } catch (e) {
    const prev = previous.sources?.[key];
    sources[key] = prev ? { ...prev, ok: false, error: e.message, failedAt: new Date().toISOString() } : { ok: false, error: e.message, failedAt: new Date().toISOString() };
    console.warn(`⚠️  ${key} — ${e.message}${prev ? ' (dernière collecte conservée, marquée ok:false)' : ''}`);
  }
}
writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), sources }, null, 2) + '\n');
console.log(`→ ${OUT}`);
process.exit(Object.values(sources).every(s => !s.ok) ? 1 : 0);
