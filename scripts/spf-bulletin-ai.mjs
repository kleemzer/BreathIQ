/**
 * SPF Bulletin Épidémiologique Hebdomadaire — AI extraction pipeline
 * Runs weekly via GitHub Actions → writes data/spf-live.json
 *
 * Required env: GROQ_API_KEY
 */

import Groq from 'groq-sdk';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, '../data/spf-live.json');

// ── SPF pages to monitor ────────────────────────────────────────────────────
const SPF_SOURCES = [
  {
    id: 'grippe',
    name: 'SPF Grippe/IRA — surveillance',
    url: 'https://www.santepubliquefrance.fr/maladies-et-traumatismes/maladies-et-infections-respiratoires/grippe',
  },
  {
    id: 'covid',
    name: 'SPF COVID-19 — bulletin de santé publique',
    url: 'https://www.santepubliquefrance.fr/maladies-et-traumatismes/maladies-et-infections-respiratoires/infection-a-coronavirus',
  },
  {
    id: 'mpox',
    name: 'SPF Mpox — surveillance',
    url: 'https://www.santepubliquefrance.fr/maladies-et-traumatismes/maladies-a-potentiel-epidemique-et-a-declaration-obligatoire/mpox',
  },
  {
    id: 'ebola',
    name: 'SPF Maladie à virus Ebola',
    url: 'https://www.santepubliquefrance.fr/maladies-et-traumatismes/maladies-a-potentiel-epidemique-et-a-declaration-obligatoire/maladie-a-virus-ebola',
  },
  {
    id: 'beh',
    name: 'SPF Bulletin Épidémiologique Hebdomadaire',
    url: 'https://www.santepubliquefrance.fr/revues/beh/bulletin-epidemiologique-hebdomadaire',
  },
];

// ── HTML → clean text ───────────────────────────────────────────────────────
function htmlToText(html) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── Fetch one SPF page (with timeout + graceful failure) ────────────────────
async function fetchPage(source) {
  try {
    const resp = await fetch(source.url, {
      headers: {
        'User-Agent': 'BreathIQ-Bot/1.0 (https://breathiq.fr; surveillance santé publique automatisée)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'fr-FR,fr;q=0.9',
      },
      signal: AbortSignal.timeout(20000),
    });
    if (!resp.ok) {
      console.warn(`⚠️  ${source.name} → HTTP ${resp.status}`);
      return null;
    }
    const html = await resp.text();
    const text = htmlToText(html).slice(0, 9000); // max ~2 250 tokens per source
    console.log(`✅  ${source.name} (${text.length} chars)`);
    return { id: source.id, name: source.name, url: source.url, text };
  } catch (e) {
    console.warn(`⚠️  ${source.name} → ${e.message}`);
    return null;
  }
}

// ── Claude prompt ───────────────────────────────────────────────────────────
function buildPrompt(pages, today) {
  const context = pages
    .map(p => `=== SOURCE: ${p.name} ===\nURL: ${p.url}\n\n${p.text}`)
    .join('\n\n');

  return `Tu es un épidémiologiste expert analysant les bulletins de surveillance de Santé Publique France.
Date d'aujourd'hui : ${today}

## Contenu des bulletins SPF récupérés
${context}

## Ta mission
Extrais les informations épidémiologiques clés et retourne un JSON structuré UNIQUEMENT, sans aucun texte avant ou après.

## Format JSON attendu
{
  "generatedAt": "<ISO 8601 datetime>",
  "bulletinDate": "<ex: 2026 S18 ou 2026-05-06>",
  "sources": ["<url1>", "<url2>"],
  "patches": {
    "<PATHOGEN_ID>": {
      "currentStatus": "<outbreak|active|endemic|monitoring|resolved>",
      "riskLevel": "<critical|high|moderate|low>",
      "activeRegions": ["<région1>", "<région2>"],
      "descFR": "<description factuelle courte en français, 2-4 phrases, ton médical simplifié, données chiffrées si disponibles>",
      "descEN": "<same in English>",
      "lastUpdate": "<YYYY-MM>"
    }
  },
  "globalAlertLevel": "<critical|high|moderate|low|normal>",
  "alertSummaryFR": "<résumé global 1 phrase, situation épidémique de la semaine>",
  "alertSummaryEN": "<same in English>",
  "newOutbreaks": [
    {
      "nameFR": "<nom>",
      "pathogen": "<agent pathogène>",
      "activeRegions": ["<régions>"],
      "riskLevel": "<level>",
      "descFR": "<description>",
      "descEN": "<description>"
    }
  ]
}

## IDs de pathogènes à surveiller en priorité
- INFLUENZA : grippe saisonnière / IRA
- COVID19VAR : COVID-19 / SARS-CoV-2
- MPOX : Mpox / variole du singe
- EBOLA : Maladie à virus Ebola
- H5N1 : Grippe aviaire H5N1
- TB : Tuberculose
- PERTUSSIS : Coqueluche
- DENGUE : Dengue

## Règles importantes
1. N'inclure dans "patches" QUE les pathogènes dont tu trouves des données actualisées dans les sources.
2. "descFR"/"descEN" : langage simple, accessible au grand public mondial. Inclure les chiffres clés (cas, semaine épidémique). Éviter le jargon médical.
3. "newOutbreaks" : uniquement si tu identifies une menace émergente NON listée ci-dessus.
4. Si les sources ne contiennent pas assez d'information, indique "patches": {} et explique dans "alertSummaryFR".
5. Retourne UNIQUEMENT le JSON, sans markdown, sans explication.`;
}

// ── Main pipeline ───────────────────────────────────────────────────────────
async function main() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('❌  GROQ_API_KEY manquante');
    process.exit(1);
  }

  const today = new Date().toISOString().slice(0, 10);
  console.log(`\n🔄  SPF Bulletin AI Update — ${today}\n`);

  // 1. Fetch all SPF pages in parallel
  const results = await Promise.all(SPF_SOURCES.map(fetchPage));
  const pages = results.filter(Boolean);

  if (pages.length === 0) {
    console.error('❌  Aucune source SPF récupérée');
    process.exit(1);
  }

  console.log(`\n📡  ${pages.length}/${SPF_SOURCES.length} sources récupérées\n`);

  // 2. Call Groq API (free tier — Llama 3.3 70B)
  const groq = new Groq({ apiKey });
  const prompt = buildPrompt(pages, today);

  console.log('🤖  Analyse Groq/Llama en cours...');
  let rawResponse;
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4096,
      temperature: 0.1,
    });
    rawResponse = completion.choices[0].message.content;
  } catch (e) {
    console.error(`❌  Erreur API Groq: ${e.message}`);
    process.exit(1);
  }

  // 3. Parse JSON output
  let output;
  try {
    // Claude sometimes wraps in ```json ... ```
    const cleaned = rawResponse.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
    output = JSON.parse(cleaned);
  } catch (e) {
    console.error('❌  JSON invalide retourné par Claude:');
    console.error(rawResponse.slice(0, 500));
    process.exit(1);
  }

  // 4. Validate minimal structure
  if (typeof output !== 'object' || !output.patches) {
    console.error('❌  Structure JSON incorrecte (champ "patches" manquant)');
    process.exit(1);
  }

  // 5. Enrich with metadata
  output.generatedAt = new Date().toISOString();
  output.sources = pages.map(p => p.url);

  const patchCount = Object.keys(output.patches).length;
  const newCount = (output.newOutbreaks || []).length;
  console.log(`✅  ${patchCount} pathogènes mis à jour, ${newCount} nouvelle(s) menace(s) détectée(s)`);
  console.log(`📊  Niveau alerte global : ${output.globalAlertLevel || 'non renseigné'}`);
  if (output.alertSummaryFR) console.log(`📋  ${output.alertSummaryFR}`);

  // 6. Write output
  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf8');
  console.log(`\n💾  Écrit dans ${OUTPUT_PATH}`);
}

main().catch(e => {
  console.error('❌  Erreur inattendue:', e);
  process.exit(1);
});
