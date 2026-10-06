/**
 * medico-legal-audit.mjs
 * Audit automatique hebdomadaire : vérifie que le contenu clinique de BreathIQ
 * ne contredit pas les déclarations juridiques du site (R4127-19, MDR EU 2017/745).
 *
 * Sorties :
 *   - Exit 0 + rapport OK si aucune contradiction
 *   - Exit 1 + rapport détaillé si contradiction détectée (GitHub Actions crée une Issue)
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── Lecture des fichiers à auditer ────────────────────────────────────────────

function readFile(rel) {
  try { return readFileSync(join(ROOT, rel), 'utf8'); }
  catch { return null; }
}

const pathogens   = readFile('data/pathogens.json');
const pheic       = readFile('data/pheic-alerts.json');
const scriptJs    = readFile('script.js');
const indexHtml   = readFile('index.html');

// Extraire uniquement les sections pertinentes de script.js (trop grand sinon)
const scriptExcerpt = scriptJs
  ? scriptJs.split('\n')
      .filter((_, i) => {
        const chunk = scriptJs.split('\n').slice(Math.max(0, i-2), i+3).join('\n');
        return /aiMessage|conseil|recommend|limitez|portez|sortez|vous pouvez|votre traitement/i.test(chunk);
      })
      .slice(0, 80)
      .join('\n')
  : '(non disponible)';

// Extraire les disclaimers de index.html
const disclaimerMatch = indexHtml?.match(/disclaimer-box[\s\S]{0,3000}/);
const disclaimerExcerpt = disclaimerMatch ? disclaimerMatch[0].slice(0, 2000) : '(non trouvé)';

// ── Appel Claude API ──────────────────────────────────────────────────────────

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY manquant');
  process.exit(1);
}

const auditPrompt = `Tu es un auditeur médico-légal spécialisé en droit de la santé français.

Analyse le contenu ci-dessous du site BreathIQ (outil d'information respiratoire) et vérifie qu'il ne contredit pas les 5 déclarations juridiques suivantes que le site affiche publiquement :

**DÉCLARATIONS JURIDIQUES DU SITE :**
1. "outil de vulgarisation scientifique bénévole" — pas de but commercial
2. "en dehors de tout cadre d'exercice professionnel" — pas de conseils médicaux individuels
3. "sans lien avec un établissement, laboratoire ou industrie pharmaceutique" — pas de conflit d'intérêts
4. "ne constitue pas un dispositif médical (Règlement UE 2017/745)" — pas de diagnostic ni de traitement
5. "ne constitue pas de la publicité médicale (R4127-19 CDM)" — pas de promotion d'une activité de soins

**CONTENU À AUDITER :**

--- MESSAGES CONTEXTUELS (script.js) ---
${scriptExcerpt}

--- FICHES PATHOGÈNES (pathogens.json, extrait) ---
${pathogens ? pathogens.slice(0, 4000) : '(non disponible)'}

--- ALERTES PHEIC (pheic-alerts.json, extrait) ---
${pheic ? pheic.slice(0, 3000) : '(non disponible)'}

--- DISCLAIMERS (index.html, extrait) ---
${disclaimerExcerpt}

**INSTRUCTIONS :**
Réponds UNIQUEMENT en JSON valide avec ce schéma :
{
  "verdict": "OK" | "ALERTE",
  "contradictions": [
    {
      "declaration": "numéro 1-5",
      "probleme": "description précise de la contradiction",
      "extrait": "texte exact problématique",
      "severite": "BLOQUANT" | "AVERTISSEMENT",
      "correction": "suggestion de correction"
    }
  ],
  "resume": "une phrase résumant l'état général"
}

Si aucune contradiction : verdict "OK", contradictions [], resume positif.
Ne signale que des contradictions réelles et vérifiables dans le texte fourni — pas d'hypothèses.`;

console.log('🔍 Envoi au modèle Claude pour audit médico-légal...');

const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
  },
  body: JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [{ role: 'user', content: auditPrompt }],
  }),
});

if (!response.ok) {
  const err = await response.text();
  console.error('❌ Erreur API Anthropic :', err);
  process.exit(1);
}

const data = await response.json();
const raw = data.content?.[0]?.text || '';

// ── Parse et affichage du résultat ────────────────────────────────────────────

let audit;
try {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  audit = JSON.parse(jsonMatch?.[0] || raw);
} catch {
  console.error('❌ Réponse non parseable :', raw);
  process.exit(1);
}

console.log('\n══════════════════════════════════════════');
console.log('  AUDIT MÉDICO-LÉGAL BREATHIQ');
console.log(`  Date : ${new Date().toISOString().split('T')[0]}`);
console.log('══════════════════════════════════════════');
console.log(`  Verdict : ${audit.verdict}`);
console.log(`  Résumé  : ${audit.resume}`);

if (audit.contradictions?.length > 0) {
  console.log('\n⚠️  CONTRADICTIONS DÉTECTÉES :');
  for (const c of audit.contradictions) {
    console.log(`\n  [${c.severite}] Déclaration n°${c.declaration}`);
    console.log(`  Problème   : ${c.probleme}`);
    console.log(`  Extrait    : "${c.extrait}"`);
    console.log(`  Correction : ${c.correction}`);
  }
}

console.log('\n══════════════════════════════════════════\n');

// Exporter pour GitHub Actions (création d'issue si ALERTE)
if (process.env.GITHUB_OUTPUT) {
  const output = [
    `verdict=${audit.verdict}`,
    `resume=${audit.resume.replace(/\n/g, ' ')}`,
    `contradictions_count=${audit.contradictions?.length ?? 0}`,
  ].join('\n');
  import('fs').then(({ appendFileSync }) => {
    appendFileSync(process.env.GITHUB_OUTPUT, output + '\n');
  });
}

// Sortie détaillée pour la création d'issue
if (audit.verdict === 'ALERTE') {
  const lines = [`## ⚠️ Audit médico-légal BreathIQ — ${new Date().toISOString().split('T')[0]}`, '', `**Résumé :** ${audit.resume}`, ''];
  for (const c of audit.contradictions) {
    lines.push(`### [${c.severite}] Déclaration n°${c.declaration}`);
    lines.push(`**Problème :** ${c.probleme}`);
    lines.push(`**Extrait concerné :** \`${c.extrait}\``);
    lines.push(`**Correction suggérée :** ${c.correction}`);
    lines.push('');
  }
  lines.push('---');
  lines.push('*Audit automatique — vérifier et corriger avant la prochaine publication.*');
  import('fs').then(({ writeFileSync }) => {
    writeFileSync('/tmp/audit-report.md', lines.join('\n'));
  });
  process.exit(1);
}

process.exit(0);
