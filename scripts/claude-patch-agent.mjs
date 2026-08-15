#!/usr/bin/env node
/**
 * BreathIQ — Agent Claude API : analyse science-updates-pending.json
 * et génère un patch suggéré pour diagnostic-engine.js.
 *
 * Nécessite : ANTHROPIC_API_KEY en variable d'environnement GitHub Actions
 * Sortie : data/claude-patch-suggestion.json (staging — jamais auto-appliqué)
 *
 * Règle absolue : ne JAMAIS qualifier le site de "dispositif médical"
 * (Règlement UE 2017/745). Ce script génère des SUGGESTIONS à valider par
 * Dr. Médeau avant toute intégration dans le moteur diagnostique.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PENDING_FILE  = join(ROOT, 'data', 'science-updates-pending.json');
const ENGINE_FILE   = join(ROOT, 'js', 'diagnostic-engine.js');
const OUT_FILE      = join(ROOT, 'data', 'claude-patch-suggestion.json');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY manquante — configurer le secret GitHub');
  process.exit(1);
}

if (!existsSync(PENDING_FILE)) {
  console.log('Aucun fichier science-updates-pending.json trouvé — rien à analyser.');
  process.exit(0);
}

const pending = JSON.parse(readFileSync(PENDING_FILE, 'utf8'));
const engine  = readFileSync(ENGINE_FILE, 'utf8');

// Ne traiter que si des mises à jour significatives existent
if (!pending.updates?.length) {
  console.log('Aucune mise à jour en attente — agent Claude non sollicité.');
  process.exit(0);
}

const warningUpdates = pending.updates.filter(u => u.severity === 'warning' || u.type === 'who_alert');
if (!warningUpdates.length) {
  console.log('Aucune alerte prioritaire — agent Claude non sollicité.');
  process.exit(0);
}

console.log(`🤖 Interrogation Claude API pour ${warningUpdates.length} alerte(s) prioritaire(s)...`);

// Extraire uniquement la partie PATHOGENS du moteur (premier objet JSON-like)
const pathogensMatch = engine.match(/const PATHOGENS\s*=\s*\{[\s\S]*?^};/m);
const engineExcerpt = pathogensMatch
  ? pathogensMatch[0].slice(0, 8000) // Limite contexte
  : engine.slice(0, 8000);

const systemPrompt = `Tu es un expert en infectiologie et épidémiologie clinique.
Tu analyses des alertes sanitaires récentes (WHO, ECDC, PubMed) et proposes des ajustements
aux poids bayésiens d'un moteur diagnostique de triage symptomatique.

RÈGLES ABSOLUES :
- Ne JAMAIS qualifier ce système de "dispositif médical" (Règlement UE 2017/745)
- Toute suggestion est purement indicative et requiert validation médicale humaine
- Les poids sont des scores relatifs (−50 à +50), pas des probabilités
- Proposer uniquement des changements scientifiquement justifiés par les sources citées
- Format de sortie : JSON structuré uniquement, pas de prose`;

const userPrompt = `Voici les alertes sanitaires récentes détectées :

${JSON.stringify(warningUpdates, null, 2)}

Voici l'extrait actuel du moteur diagnostique (PATHOGENS) :

${engineExcerpt}

Pour chaque alerte pertinente, propose :
1. Les ajustements de poids bayésiens justifiés par la littérature citée
2. Si un nouveau pathogène doit être ajouté, son schéma complet
3. La justification épidémiologique pour chaque changement

Réponds en JSON avec ce schéma :
{
  "analysisDate": "ISO date",
  "alertsAnalyzed": number,
  "suggestions": [
    {
      "pathogenId": "ID_PATHOGÈNE",
      "action": "update_weights" | "add_pathogen" | "update_alarm_signs" | "no_change",
      "scientificJustification": "ref PubMed/WHO/ECDC",
      "changes": {
        "weights": { "symptom_key": new_value },
        "alarmSigns": ["..."],
        "emergencyLevel": "VERT|BLEU|JAUNE|ORANGE|ROUGE",
        "prior": 0.0
      },
      "confidence": "high|medium|low",
      "requiresMedicalReview": true
    }
  ],
  "disclaimer": "Ces suggestions nécessitent validation par Dr. Médeau avant toute intégration"
}`;

async function callClaude(system, user) {
  const body = JSON.stringify({
    model: 'claude-sonnet-5',
    max_tokens: 4096,
    system,
    messages: [{ role: 'user', content: user }],
  });

  const url = 'https://api.anthropic.com/v1/messages';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body,
    signal: AbortSignal.timeout(60000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API ${res.status}: ${err}`);
  }
  return res.json();
}

try {
  const response = await callClaude(systemPrompt, userPrompt);
  const content = response.content?.[0]?.text || '';

  // Extraire le JSON de la réponse
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Pas de JSON valide dans la réponse Claude');

  const suggestion = JSON.parse(jsonMatch[0]);
  suggestion.generatedAt = new Date().toISOString();
  suggestion.claudeModel = response.model;
  suggestion.inputTokens = response.usage?.input_tokens;
  suggestion.outputTokens = response.usage?.output_tokens;
  suggestion.status = 'PENDING_MEDICAL_REVIEW';

  writeFileSync(OUT_FILE, JSON.stringify(suggestion, null, 2), 'utf8');
  console.log(`✅ Suggestions Claude sauvegardées : ${OUT_FILE}`);
  console.log(`   ${suggestion.suggestions?.length || 0} suggestion(s) générée(s)`);
  console.log(`   Tokens : ${suggestion.inputTokens} in / ${suggestion.outputTokens} out`);

} catch (e) {
  console.error('❌ Erreur agent Claude:', e.message);
  process.exit(1);
}
