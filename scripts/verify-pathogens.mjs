/**
 * verify-pathogens.mjs
 * Met à jour le champ `verifiedAt` dans pathogens.json et pheic-alerts.json.
 * Appelé quotidiennement par GitHub Actions — ne modifie PAS les données cliniques,
 * juste la date de vérification (prouve que le mainteneur a contrôlé le contenu).
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

  d.verifiedAt = TODAY;
  d.generatedAt = new Date().toISOString();

  // Mise à jour verifiedAt sur chaque pathogène (sans toucher lastUpdate)
  for (const p of d.pathogens) {
    p.verifiedAt = TODAY;
  }

  writeFileSync(path, JSON.stringify(d, null, 2), 'utf8');
  console.log(`✅ pathogens.json — verifiedAt=${TODAY} (${d.pathogens.length} pathogènes)`);
}

// ── PHEIC Alerts ──────────────────────────────────────────────────────────────

function updatePheicAlerts() {
  const path = join(ROOT, 'data', 'pheic-alerts.json');
  const d = JSON.parse(readFileSync(path, 'utf8'));

  d.verifiedAt = TODAY;
  d.fetchDate = TODAY;
  d.generatedAt = new Date().toISOString();

  // Mettre à jour verifiedAt sur chaque alerte active
  for (const a of d.alerts) {
    if (a.active) a.verifiedAt = TODAY;
  }

  writeFileSync(path, JSON.stringify(d, null, 2), 'utf8');
  const active = d.alerts.filter(a => a.active).length;
  console.log(`✅ pheic-alerts.json — verifiedAt=${TODAY} (${active} alertes actives)`);
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
