import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { computeStale, isExpired } from './lib/freshness.mjs';

const root = new URL('..', import.meta.url).pathname;
const dataDir = join(root, 'data');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function validateWhoAlerts(data) {
  assert(typeof data.generatedAt === 'string', 'who-alerts.json: generatedAt manquant');
  assert(Array.isArray(data.alerts), 'who-alerts.json: alerts doit etre un tableau');
  for (const [index, alert] of data.alerts.entries()) {
    assert(typeof alert === 'object' && alert !== null, `who-alerts.json: alerte ${index} invalide`);
    assert(!alert.riskLevel || ['critical', 'high', 'moderate', 'low'].includes(alert.riskLevel), `who-alerts.json: riskLevel invalide a l'index ${index}`);
  }
}

function validateSpfLive(data) {
  const hasLegacyPatches = data.patches && typeof data.patches === 'object' && !Array.isArray(data.patches);
  const hasCompactSummary =
    typeof data.run_date === 'string' &&
    typeof data.overall_summary === 'string' &&
    Array.isArray(data.sources) &&
    Array.isArray(data.recommended_action);

  assert(hasLegacyPatches || hasCompactSummary, 'spf-live.json: format SPF non reconnu');

  if (hasLegacyPatches) {
    for (const [id, patch] of Object.entries(data.patches)) {
      assert(patch && typeof patch === 'object', `spf-live.json: patch ${id} invalide`);
      assert(!patch.riskLevel || ['critical', 'high', 'moderate', 'low'].includes(patch.riskLevel), `spf-live.json: riskLevel invalide pour ${id}`);
    }
  }

  if (hasCompactSummary) {
    for (const [index, source] of data.sources.entries()) {
      assert(source && typeof source === 'object', `spf-live.json: source ${index} invalide`);
      assert(typeof source.title === 'string', `spf-live.json: title manquant source ${index}`);
      assert(!source.risk_level || ['low', 'medium', 'high'].includes(source.risk_level), `spf-live.json: risk_level invalide source ${index}`);
    }
  }
}

// Toute alerte PHEIC publiée doit pointer vers une source officielle vérifiable.
// Refuse les alertes rédigées sans URL OMS/ECDC/SPF (incident alerte peste fictive, oct. 2026).
const OFFICIAL_SOURCE_RE = /^https:\/\/(www\.)?(who\.int|ecdc\.europa\.eu|santepubliquefrance\.fr)\//;

function validatePheicAlerts(data) {
  assert(Array.isArray(data.alerts), 'pheic-alerts.json: alerts doit etre un tableau');
  for (const alert of data.alerts) {
    assert(typeof alert.id === 'string' && alert.id, 'pheic-alerts.json: alerte sans id');
    assert(OFFICIAL_SOURCE_RE.test(alert.sourceUrl || ''),
      `pheic-alerts.json: ${alert.id} — sourceUrl officielle (who.int / ecdc.europa.eu / santepubliquefrance.fr) manquante ou invalide`);
    assert(typeof alert.lastUpdate === 'string', `pheic-alerts.json: ${alert.id} — lastUpdate manquant`);
  }
}

const validators = {
  'who-alerts.json': validateWhoAlerts,
  'spf-live.json': validateSpfLive,
  'pheic-alerts.json': validatePheicAlerts,
};

// Fraîcheur : tout fichier portant nextUpdateExpected est périmé au-delà de 48 h (affiché comme tel)
// et fait échouer la CI au-delà de 14 jours — une donnée de surveillance figée n'est plus une donnée.
function validateFreshness(file, data) {
  if (!data || typeof data !== 'object' || !('nextUpdateExpected' in data)) return;
  const stale = computeStale(data.nextUpdateExpected);
  if (stale) console.warn(`⚠️  ${file}: périmé (nextUpdateExpected=${data.nextUpdateExpected}) — doit être affiché « source en attente de mise à jour »`);
  assert(!isExpired(data.nextUpdateExpected),
    `${file}: source non mise à jour depuis plus de 14 jours après nextUpdateExpected=${data.nextUpdateExpected} — relancer la collecte`);
}

let checked = 0;
for (const file of readdirSync(dataDir).filter(name => name.endsWith('.json'))) {
  const path = join(dataDir, file);
  const data = readJson(path);
  validators[file]?.(data);
  validateFreshness(file, data);
  checked += 1;
}

// Alerte PHEIC en retard sur l'OMS : le collecteur (who-alerts.json) a-t-il un DON plus récent sur la
// même maladie que celui cité par pheic-alerts.json ? (avertissement : la mise à jour reste manuelle et relue)
{
  const pheic = readJson(join(dataDir, 'pheic-alerts.json'));
  const who = readJson(join(dataDir, 'who-alerts.json'));
  const donNum = id => Number(String(id || '').match(/DON(\d+)/)?.[1] || 0);
  for (const alert of (pheic.alerts || []).filter(a => a.active)) {
    const cited = donNum(alert.sourceUrl);
    const word = String(alert.disease || '').split(/[\s—-]+/)[0].toLowerCase();
    const newer = (who.alerts || []).filter(w => donNum(w.donId) > cited && String(w.title || '').toLowerCase().includes(word));
    if (newer.length) console.warn(`⚠️  pheic-alerts.json: ${alert.id} cite DON${cited}, mais l'OMS a publié ${newer.map(w => w.donId).join(', ')} — chiffres à mettre à jour (relecture humaine)`);
  }
}

console.log(`Validated ${checked} JSON data file(s).`);
