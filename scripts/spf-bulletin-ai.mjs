/**
 * SPF Bulletin Epidemiologique Hebdomadaire - compact AI extraction pipeline
 * Runs weekly via GitHub Actions -> writes data/spf-live.json
 *
 * Required env: GROQ_API_KEY
 */

import Groq from 'groq-sdk';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, '../data/spf-live.json');

const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const MAX_PROMPT_TOKENS = 8200;
const HARD_PROMPT_TOKENS = 9000;
const MAX_COMPLETION_TOKENS = 450;
const MAX_RETRIES = 3;

// SPF pages to monitor.
const SPF_SOURCES = [
  {
    id: 'covid',
    name: 'SPF COVID-19 - infection a coronavirus',
    url: 'https://www.santepubliquefrance.fr/maladies-et-traumatismes/maladies-et-infections-respiratoires/infection-a-coronavirus',
  },
  {
    id: 'beh',
    name: 'SPF Bulletin Epidemiologique Hebdomadaire',
    url: 'https://www.santepubliquefrance.fr/revues/beh/bulletin-epidemiologique-hebdomadaire',
  },
  {
    id: 'idf_latest',
    name: 'SPF IDF - Surveillance sanitaire',
    url: 'https://www.santepubliquefrance.fr/regions-et-territoires/ile-de-france/bulletin-regional/surveillance-sanitaire-en-ile-de-france-bulletin-du-27-mai-2026',
  },
  {
    id: 'grippe_surv',
    name: 'SPF Surveillance epidemiologique grippe',
    url: 'https://www.santepubliquefrance.fr/en/grippe/epidemiological-surveillance-influenza',
  },
  {
    id: 'mayotte',
    name: 'SPF Mayotte - Surveillance Ebola/maladies importees',
    url: 'https://www.santepubliquefrance.fr/regions-et-territoires/ocean-indien/bulletin-regional/surveillance-sanitaire-a-mayotte-bulletin-du-27-mars-2026',
  },
];

const DISEASE_PATTERNS = [
  ['COVID-19', /\b(covid|sars[-\s]?cov[-\s]?2|coronavirus)\b/i],
  ['grippe', /\b(grippe|influenza|ira|infection respiratoire aigue)\b/i],
  ['mpox', /\b(mpox|variole du singe)\b/i],
  ['Ebola', /\b(ebola|maladie a virus ebola)\b/i],
  ['H5N1', /\b(h5n1|grippe aviaire|avian influenza)\b/i],
  ['tuberculose', /\b(tuberculose|tuberculosis)\b/i],
  ['coqueluche', /\b(coqueluche|pertussis)\b/i],
  ['dengue', /\b(dengue)\b/i],
  ['rougeole', /\b(rougeole|measles)\b/i],
  ['chikungunya', /\b(chikungunya)\b/i],
  ['bronchiolite', /\b(bronchiolite|vrs|rsv)\b/i],
  ['MERS-CoV', /\b(mers|mers[-\s]?cov)\b/i],
];

const REGION_PATTERNS = [
  'Auvergne-Rhone-Alpes',
  'Bourgogne-Franche-Comte',
  'Bretagne',
  'Centre-Val de Loire',
  'Corse',
  'Grand Est',
  'Guadeloupe',
  'Guyane',
  'Hauts-de-France',
  'Ile-de-France',
  'La Reunion',
  'Martinique',
  'Mayotte',
  'Normandie',
  'Nouvelle-Aquitaine',
  'Occitanie',
  'Pays de la Loire',
  'Provence-Alpes-Cote d Azur',
  'France',
  'Ocean Indien',
];

const NOISE_PATTERNS = [
  /aller au contenu principal/gi,
  /sante publique france/gi,
  /rechercher/gi,
  /menu/gi,
  /partager/gi,
  /imprimer/gi,
  /abonnez-vous/gi,
  /newsletter/gi,
  /mentions legales/gi,
  /politique de confidentialite/gi,
  /cookies?/gi,
  /accessibilite/gi,
];

// HTML -> clean text.
function htmlToText(html) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#\d+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeText(text) {
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\S\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function smartTruncate(text, maxChars) {
  if (!text || text.length <= maxChars) return text || '';
  const slice = text.slice(0, maxChars);
  const boundary = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('; '), slice.lastIndexOf('\n'));
  return `${slice.slice(0, boundary > maxChars * 0.65 ? boundary + 1 : maxChars).trim()}...`;
}

function splitSentences(text) {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+(?=[A-ZÀ-ÖØ-Þ0-9])/)
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length >= 35 && sentence.length <= 320);
}

function scoreSentence(sentence) {
  const normalized = normalizeText(sentence);
  let score = 0;
  if (DISEASE_PATTERNS.some(([, pattern]) => pattern.test(normalized))) score += 4;
  if (/\d/.test(sentence)) score += 3;
  if (/\b(cas|deces|hospital|urgence|incidence|taux|positiv|alerte|hausse|baisse|recrudescence|cluster|foyer|signal|epidem|surveillance)\b/i.test(normalized)) score += 3;
  if (/\b(S\d{1,2}|semaine|202\d|[0-9]+ ?%|[0-9]+ ?cas)\b/i.test(sentence)) score += 2;
  if (score > 0 && sentence.length < 220) score += 1;
  return score;
}

function extractTitle(text) {
  const sentences = splitSentences(text);
  const title = sentences.find(sentence =>
    /\b(bulletin|surveillance|point|infection|epidemiologique|sanitaire)\b/i.test(normalizeText(sentence))
  );
  return smartTruncate(title || sentences[0] || 'Bulletin SPF', 120);
}

function extractDate(text) {
  const match = text.match(/\b(?:du\s+)?(\d{1,2}\s+(?:janvier|fevrier|mars|avril|mai|juin|juillet|aout|septembre|octobre|novembre|decembre)\s+20\d{2}|20\d{2}[-/]\d{1,2}[-/]\d{1,2}|S\d{1,2}[-\s]?20\d{2}|20\d{2}\s*S\d{1,2})\b/i);
  return match?.[1] || '';
}

function extractRegions(text) {
  const normalized = normalizeText(text).replace(/-/g, ' ');
  return REGION_PATTERNS.filter(region => normalized.includes(normalizeText(region).replace(/-/g, ' '))).slice(0, 4);
}

function extractDiseases(text) {
  const normalized = normalizeText(text);
  return DISEASE_PATTERNS.filter(([, pattern]) => pattern.test(normalized)).map(([name]) => name);
}

function extractNumbers(text) {
  const matches = text.match(/\b(?:S\d{1,2}|20\d{2}|(?:\d{1,3}(?:[ .]\d{3})*|\d+)(?:[,.]\d+)?\s?(?:%|cas|deces|hospitalisations?|passages?|consultations?|semaines?|foyers?|clusters?|incidence|tests?|ans)?)\b/gi) || [];
  return unique(matches.map(item => item.trim())).slice(0, 16);
}

function cleanBulletinText(text) {
  let cleaned = normalizeText(text);
  for (const pattern of NOISE_PATTERNS) cleaned = cleaned.replace(pattern, ' ');
  return cleaned
    .replace(/\b(Accueil|Actualites|Dossiers|Presse|Publications|Regions et territoires)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Pass 1: local compression. Keeps only title, date, region, diseases, numbers
 * and high-signal sentences before any model call.
 */
function compressBulletin(text) {
  const cleaned = cleanBulletinText(text);
  const title = extractTitle(cleaned);
  const date = extractDate(cleaned);
  const regions = extractRegions(cleaned);
  const diseases = extractDiseases(cleaned);
  const numbers = extractNumbers(cleaned);
  const signals = splitSentences(cleaned)
    .map(sentence => ({ sentence, score: scoreSentence(sentence) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => smartTruncate(item.sentence, 240));

  return {
    title,
    date,
    region: regions[0] || 'France',
    diseases: unique(diseases).slice(0, 8),
    numbers,
    signals: unique(signals).slice(0, 8),
  };
}

function estimateTokens(text) {
  if (!text) return 0;
  const words = String(text).trim().split(/\s+/).filter(Boolean).length;
  const chars = String(text).length;
  return Math.ceil(Math.max(words * 1.35, chars / 3.6));
}

function buildCompactSource(source) {
  const compressed = compressBulletin(source.text || '');
  const compact = {
    id: source.id,
    url: source.url,
    title: compressed.title || source.name,
    date: compressed.date,
    region: compressed.region,
    diseases: compressed.diseases,
    numbers: compressed.numbers,
    signals: compressed.signals,
  };

  return shrinkCompactSource(compact, 1150);
}

function buildFinalPrompt(compactedSources) {
  const today = new Date().toISOString().slice(0, 10);
  const compactJson = JSON.stringify(compactedSources, null, 2);

  return `Tu es un medecin epidemiologiste. Analyse uniquement ces extraits compacts SPF.
Date: ${today}
Donnees compactees:
${compactJson}

Retourne UNIQUEMENT un JSON valide, sans markdown, selon ce schema exact:
{
  "run_date": "${today}",
  "overall_summary": "1 phrase courte en francais",
  "sources": [
    {
      "title": "...",
      "region": "...",
      "signals": ["max 3 signaux courts"],
      "risk_level": "low|medium|high",
      "key_points": ["max 3 points courts"]
    }
  ],
  "recommended_action": ["max 4 actions courtes"]
}
Contraintes: pas de cle supplementaire, pas d'invention, si donnees faibles risk_level="low".`;
}

async function safeGroqCall(prompt, options = {}) {
  const promptTokens = estimateTokens(prompt);
  if (promptTokens > HARD_PROMPT_TOKENS) {
    throw new Error(`Prompt too large before Groq call (${promptTokens} estimated tokens)`);
  }

  const {
    client,
    model = GROQ_MODEL,
    maxTokens = MAX_COMPLETION_TOKENS,
    temperature = 0.1,
    retries = MAX_RETRIES,
  } = options;

  if (!client) throw new Error('Groq client is required');

  let lastError;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      console.log(`🤖  Groq call attempt ${attempt}/${retries} (${promptTokens} prompt tokens est., ${maxTokens} max output)`);
      const completion = await client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature,
        response_format: { type: 'json_object' },
      }, {
        timeout: 30000,
      });

      const content = completion?.choices?.[0]?.message?.content?.trim();
      if (!content) throw new Error('Empty Groq response');
      return content;
    } catch (error) {
      lastError = error;
      const status = error?.status || error?.response?.status;
      const message = error?.message || String(error);
      const retryable = status === 413 || status === 429 || /rate_limit|rate limit|timeout|timed out|413|429/i.test(message);

      console.warn(`⚠️  Groq error attempt ${attempt}: ${status || 'no-status'} ${message}`);
      if (!retryable || attempt === retries) break;

      const baseDelay = status === 429 || /rate/i.test(message) ? 2500 : 900;
      await sleep(baseDelay * 2 ** (attempt - 1));
    }
  }

  throw lastError;
}

function heuristicFallback(compactedSources) {
  const today = new Date().toISOString().slice(0, 10);
  const sources = compactedSources.map(source => {
    const joined = `${source.diseases.join(' ')} ${source.signals.join(' ')}`;
    return {
      title: source.title || 'Bulletin SPF',
      region: source.region || 'France',
      signals: source.signals.slice(0, 3),
      risk_level: inferRiskLevel(joined),
      key_points: buildLocalKeyPoints(source),
    };
  });

  const riskRank = { low: 1, medium: 2, high: 3 };
  const highestRisk = sources.reduce((max, source) => riskRank[source.risk_level] > riskRank[max] ? source.risk_level : max, 'low');

  return {
    run_date: today,
    overall_summary: highestRisk === 'high'
      ? 'Des signaux epidemiologiques importants sont rapportes dans les bulletins SPF surveilles.'
      : highestRisk === 'medium'
        ? 'Les bulletins SPF rapportent plusieurs signaux sous surveillance, sans alerte majeure consolidee.'
        : 'Les bulletins SPF recuperes ne suggerent pas de signal majeur consolide.',
    sources,
    recommended_action: [
      'Verifier les bulletins SPF originaux pour les chiffres detailles.',
      'Surveiller les tendances respiratoires et les signaux regionaux.',
      'Mettre a jour cette synthese lors du prochain bulletin.',
    ],
  };
}

function shrinkCompactSource(source, maxChars) {
  let next = { ...source };
  next.signals = (next.signals || []).map(signal => smartTruncate(signal, 220)).slice(0, 6);
  next.numbers = (next.numbers || []).slice(0, 12);
  next.diseases = (next.diseases || []).slice(0, 8);

  while (JSON.stringify(next).length > maxChars && next.signals.length > 3) next.signals.pop();
  while (JSON.stringify(next).length > maxChars && next.numbers.length > 6) next.numbers.pop();

  if (JSON.stringify(next).length > maxChars) {
    next.signals = next.signals.slice(0, 3).map(signal => smartTruncate(signal, 150));
    next.title = smartTruncate(next.title, 90);
  }

  return next;
}

function shrinkForPrompt(compactedSources) {
  let sources = compactedSources.map(source => ({ ...source }));
  let prompt = buildFinalPrompt(sources);

  if (estimateTokens(prompt) <= MAX_PROMPT_TOKENS) return { sources, prompt };

  console.warn('⚠️  Prompt above soft budget, reducing compacted sources further');
  sources = sources.map(source => ({
    id: source.id,
    url: source.url,
    title: smartTruncate(source.title, 80),
    date: source.date,
    region: source.region,
    diseases: source.diseases.slice(0, 5),
    numbers: source.numbers.slice(0, 6),
    signals: source.signals.slice(0, 3).map(signal => smartTruncate(signal, 140)),
  }));
  prompt = buildFinalPrompt(sources);

  if (estimateTokens(prompt) <= MAX_PROMPT_TOKENS) return { sources, prompt };

  console.warn('⚠️  Prompt still high, keeping only strongest compact signals');
  sources = sources.map(source => ({
    title: smartTruncate(source.title, 70),
    region: source.region,
    diseases: source.diseases.slice(0, 3),
    signals: source.signals.slice(0, 2).map(signal => smartTruncate(signal, 110)),
  }));
  prompt = buildFinalPrompt(sources);

  return { sources, prompt };
}

function inferRiskLevel(text) {
  const normalized = normalizeText(text);
  if (/\b(deces|hospitalisations?|alerte|epidemie|foyer|cluster|hausse forte|recrudescence|critique|urgence)\b/i.test(normalized)) return 'high';
  if (/\b(hausse|augmentation|circulation|actif|surveillance|signal|cas groupes|positivite)\b/i.test(normalized)) return 'medium';
  return 'low';
}

function buildLocalKeyPoints(source) {
  const points = [];
  if (source.diseases?.length) points.push(`Maladies citees: ${source.diseases.slice(0, 5).join(', ')}`);
  if (source.numbers?.length) points.push(`Chiffres reperes: ${source.numbers.slice(0, 5).join(', ')}`);
  points.push(...(source.signals || []).slice(0, 2));
  return points.slice(0, 3).map(point => smartTruncate(point, 180));
}

function parseJsonObject(rawResponse) {
  const start = rawResponse.indexOf('{');
  const end = rawResponse.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) throw new Error('No JSON object found');
  return JSON.parse(rawResponse.slice(start, end + 1));
}

function validateFinalJson(output) {
  if (!output || typeof output !== 'object') throw new Error('Output is not an object');
  if (typeof output.run_date !== 'string') throw new Error('Missing run_date');
  if (typeof output.overall_summary !== 'string') throw new Error('Missing overall_summary');
  if (!Array.isArray(output.sources)) throw new Error('Missing sources array');
  if (!Array.isArray(output.recommended_action)) throw new Error('Missing recommended_action array');

  output.sources = output.sources.map(source => ({
    title: String(source.title || 'Bulletin SPF'),
    region: String(source.region || 'France'),
    signals: Array.isArray(source.signals) ? source.signals.slice(0, 3).map(String) : [],
    risk_level: ['low', 'medium', 'high'].includes(source.risk_level) ? source.risk_level : 'low',
    key_points: Array.isArray(source.key_points) ? source.key_points.slice(0, 3).map(String) : [],
  }));
  output.recommended_action = output.recommended_action.slice(0, 4).map(String);

  return output;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchPage(source) {
  try {
    const resp = await fetch(source.url, {
      headers: {
        'User-Agent': 'BreathIQ-Bot/1.0 (https://breathiq.fr; surveillance sante publique automatisee)',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'fr-FR,fr;q=0.9',
      },
      signal: AbortSignal.timeout(20000),
    });

    if (!resp.ok) {
      console.warn(`⚠️  ${source.name} -> HTTP ${resp.status}`);
      return null;
    }

    const html = await resp.text();
    const text = htmlToText(html);
    console.log(`✅  ${source.name} (${text.length} chars raw text)`);
    return { id: source.id, name: source.name, url: source.url, text };
  } catch (error) {
    console.warn(`⚠️  ${source.name} -> ${error.message}`);
    return null;
  }
}

async function main() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn('⚠️  GROQ_API_KEY manquante, utilisation du fallback heuristique');
  }

  const today = new Date().toISOString().slice(0, 10);
  console.log(`\n🔄  SPF Bulletin AI Update - ${today}\n`);

  const results = await Promise.all(SPF_SOURCES.map(fetchPage));
  const pages = results.filter(Boolean);

  if (pages.length === 0) {
    console.error('❌  Aucune source SPF recuperee');
    process.exit(1);
  }

  console.log(`\n📡  ${pages.length}/${SPF_SOURCES.length} sources recuperees`);

  const initialCompactedSources = pages.map(buildCompactSource);
  const { sources: compactedSources, prompt } = shrinkForPrompt(initialCompactedSources);
  const promptTokens = estimateTokens(prompt);

  console.log(`🧩  Compression locale: ${estimateTokens(JSON.stringify(compactedSources))} tokens est.`);
  console.log(`📏  Prompt final: ${promptTokens} tokens est. (${prompt.length} chars)`);

  let output;
  let mode = 'groq';

  if (promptTokens > HARD_PROMPT_TOKENS) {
    console.warn(`⚠️  Prompt trop grand (${promptTokens}), utilisation du fallback heuristique`);
    output = heuristicFallback(compactedSources);
    mode = 'heuristic';
  } else if (apiKey) {
    const groq = new Groq({ apiKey });
    try {
      const rawResponse = await safeGroqCall(prompt, { client: groq });
      output = validateFinalJson(parseJsonObject(rawResponse));
    } catch (error) {
      console.warn(`⚠️  LLM indisponible ou JSON invalide, fallback heuristique: ${error.message}`);
      output = heuristicFallback(compactedSources);
      mode = 'heuristic';
    }
  } else {
    output = heuristicFallback(compactedSources);
    mode = 'heuristic';
  }

  output.run_date = today;

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf8');
  console.log(`✅  Mode utilise: ${mode}`);
  console.log(`💾  Ecrit dans ${OUTPUT_PATH}`);
}

main().catch(error => {
  console.error('❌  Erreur inattendue:', error);
  process.exit(1);
});
