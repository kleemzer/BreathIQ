import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

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

const validators = {
  'who-alerts.json': validateWhoAlerts,
  'spf-live.json': validateSpfLive,
};

let checked = 0;
for (const file of readdirSync(dataDir).filter(name => name.endsWith('.json'))) {
  const path = join(dataDir, file);
  const data = readJson(path);
  validators[file]?.(data);
  checked += 1;
}

console.log(`Validated ${checked} JSON data file(s).`);
