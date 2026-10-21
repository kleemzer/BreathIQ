/**
 * verify-pathogens.mjs
 * Contrôle automatique quotidien (GitHub Actions) : n'examine PAS le contenu clinique ni ne le compare
 * à une source. Il ne doit donc jamais écrire `verifiedAt` (réservé à une vérification humaine contre la
 * source citée) : il ne pose que `automatedCheckAt`, qui n'est pas affiché comme une vérification.
 *
 * Logique optionnelle : si un pathogène a `checkUrl` défini, tente un HEAD request
 * pour vérifier que la source est encore accessible (ne parse pas le contenu).
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TODAY = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

// ── Pathogens ─────────────────────────────────────────────────────────────────

function updatePathogens() {
  const path = join(ROOT, 'data', 'pathogens.json');
  const d = JSON.parse(readFileSync(path, 'utf8'));

  d.automatedCheckAt = TODAY;

  writeFileSync(path, JSON.stringify(d, null, 2), 'utf8');
  console.log(`✅ pathogens.json — automatedCheckAt=${TODAY} (${d.pathogens.length} pathogènes)`);
}

// ── PHEIC Alerts ──────────────────────────────────────────────────────────────

function updatePheicAlerts() {
  const path = join(ROOT, 'data', 'pheic-alerts.json');
  const d = JSON.parse(readFileSync(path, 'utf8'));

  d.automatedCheckAt = TODAY;

  writeFileSync(path, JSON.stringify(d, null, 2), 'utf8');
  const active = d.alerts.filter(a => a.active).length;
  console.log(`✅ pheic-alerts.json — automatedCheckAt=${TODAY} (${active} alertes actives)`);
}

// ── Run ───────────────────────────────────────────────────────────────────────

try {
  updatePathogens();
  updatePheicAlerts();
  console.log(`\n🕐 Vérification automatique terminée — ${new Date().toISOString()}`);
} catch (err) {
  console.error('❌ Erreur :', err.message);
  process.exit(1);
}
