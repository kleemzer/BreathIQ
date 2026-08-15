#!/usr/bin/env node
/**
 * BreathIQ — Agent IA (Groq) : analyse science-updates-pending.json
 * et génère un patch suggéré pour diagnostic-engine.js.
 *
 * Nécessite : GROQ_API_KEY en variable d'environnement GitHub Actions
 * Modèle    : llama-3.3-70b-versatile (gratuit, contexte 128k)
 * Sortie    : data/ai-patch-suggestion.json (staging — jamais auto-appliqué)
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
const PENDING_FILE = join(ROOT, 'data', 'science-updates-pending.json');
const ENGINE_FILE  = join(ROOT, 'js', 'diagnostic-engine.js');
const OUT_FILE     = join(ROOT, 'data', 'ai-patch-suggestion.json');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
  console.error('❌ GROQ_API_KEY manquante — configurer le secret GitHub');
  process.exit(1);
}

if (!existsSync(PENDING_FILE)) {
  console.log('Aucun fichier science-updates-pending.json trouvé — rien à analyser.');
  process.exit(0);
}

const pending = JSON.parse(readFileSync(PENDING_FILE, 'utf8'));
const engine  = readFileSync(ENGINE_FILE, 'utf8');

if (!pending.updates?.length) {
  console.log('Aucune mise à jour en attente — agent non sollicité.');
  process.exit(0);
}

const warningUpdates = pending.updates.filter(u => u.severity === 'warning' || u.type === 'who_alert');
if (!warningUpdates.length) {
  console.log('Aucune alerte prioritaire — agent non sollicité.');
  process.exit(0);
}

console.log(`🤖 Interrogation Groq (llama-3.3-70b) pour ${warningUpdates.length} alerte(s) prioritaire(s)...`);

// Extraire uniquement la partie PATHOGENS du moteur pour limiter le contexte
const pathogensMatch = engine.match(/const PATHOGENS\s*=\s*\{[\s\S]*?^};/m);
const engineExcerpt = pathogensMatch
  ? pathogensMatch[0].slice(0, 6000)
  : engine.slice(0, 6000);

const systemPrompt = `Tu es un expert en infectiologie et épidémiologie clinique.
Tu analyses des alertes sanitaires récentes (WHO, ECDC, PubMed) et proposes des ajustements
aux poids bayésiens d'un moteur diagnostique de triage symptomatique.

RÈGLES ABSOLUES :
- Ne JAMAIS qualifier ce système de "dispositif médical" (Règlement UE 2017/745)
- Toute suggestion est purement indicative et requiert validation médicale humaine
- Les poids sont des scores relatifs (−50 à +50), pas des probabilités
- Proposer uniquement des changements scientifiquement justifiés par les sources citées
- Répondre UNIQUEMENT en JSON valide, aucune prose autour`;

const userPrompt = `Voici les alertes sanitaires prioritaires récentes :

${JSON.stringify(warningUpdates.slice(0, 10), null, 2)}

Voici l'extrait actuel du moteur diagnostique (PATHOGENS) :

${engineExcerpt}

Pour chaque alerte pertinente, propose des ajustements de poids bayésiens justifiés.
Si un nouveau pathogène est signalé et absent du moteur, propose son schéma complet.

Réponds UNIQUEMENT avec ce JSON (aucun texte avant ou après) :
{
  "analysisDate": "2026-08-15",
  "alertsAnalyzed": 0,
  "suggestions": [
    {
      "pathogenId": "ID_PATHOGÈNE",
      "action": "update_weights",
      "scientificJustification": "ref source",
      "changes": {
        "weights": { "symptom_key": 0 },
        "alarmSigns": [],
        "emergencyLevel": "ORANGE",
        "prior": 0.5
      },
      "confidence": "medium",
      "requiresMedicalReview": true
    }
  ],
  "disclaimer": "Suggestions à valider par Dr. Médeau avant intégration"
}`;

async function callGroq(system, user) {
  const body = JSON.stringify({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 3000,
    temperature: 0.2,
    messages: [
      { role: 'system', content: system },
      { role: 'user',   content: user },
    ],
  });

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body,
    signal: AbortSignal.timeout(45000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API ${res.status}: ${err}`);
  }
  return res.json();
}

try {
  const response = await callGroq(systemPrompt, userPrompt);
  const content = response.choices?.[0]?.message?.content || '';

  // Extraire le JSON (Groq peut ajouter du texte autour)
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Pas de JSON valide dans la réponse Groq:\n' + content.slice(0, 500));

  const suggestion = JSON.parse(jsonMatch[0]);
  suggestion.generatedAt    = new Date().toISOString();
  suggestion.model          = response.model || 'llama-3.3-70b-versatile';
  suggestion.provider       = 'Groq';
  suggestion.inputTokens    = response.usage?.prompt_tokens;
  suggestion.outputTokens   = response.usage?.completion_tokens;
  suggestion.status         = 'PENDING_MEDICAL_REVIEW';

  writeFileSync(OUT_FILE, JSON.stringify(suggestion, null, 2), 'utf8');
  console.log(`✅ Suggestions sauvegardées : ${OUT_FILE}`);
  console.log(`   ${suggestion.suggestions?.length || 0} suggestion(s) générée(s)`);
  console.log(`   Modèle : ${suggestion.model} (Groq)`);
  console.log(`   Tokens : ${suggestion.inputTokens} in / ${suggestion.outputTokens} out`);

} catch (e) {
  console.error('❌ Erreur agent Groq:', e.message);
  process.exit(1);
}
