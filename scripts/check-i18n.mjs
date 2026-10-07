#!/usr/bin/env node
/**
 * check-i18n — sans dépendance.
 * 1) Chaque clé data-i18n / data-i18n-aria de index.html doit exister dans I18N pour chaque langue proposée.
 * 2) Tout nœud texte visible de index.html hors élément traduit (data-i18n) est « codé en dur » :
 *    il s'affichera en français quelle que soit la langue.
 *
 * Usage : node scripts/check-i18n.mjs [--langs=fr,en] [--max-hardcoded=N] [--list]
 * Sort avec 1 si une clé manque ou si le nombre de textes codés en dur dépasse --max-hardcoded.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
const script = readFileSync(join(ROOT, 'script.js'), 'utf8');

// Table I18N extraite de script.js (littéral objet autonome)
const m = script.match(/var I18N = (\{[\s\S]*?\n\});/);
if (!m) { console.error('I18N introuvable dans script.js'); process.exit(2); }
const I18N = new Function(`return ${m[1]}`)();

// Langues proposées dans le sélecteur de langue uniquement
const langSelect = html.match(/<select[^>]*id="langSelect"[\s\S]*?<\/select>/)?.[0] || '';
const offered = [...langSelect.matchAll(/<option value="([a-z]{2})"/g)].map(x => x[1]);
const langs = args.langs ? String(args.langs).split(',') : offered;

// ── 1) Couverture des clés ──
const keys = [...html.matchAll(/data-i18n(?:-aria)?="([^"]+)"/g)].map(x => x[1]);
const missing = {};
for (const lang of langs) {
  const table = I18N[lang] || {};
  missing[lang] = [...new Set(keys.filter(k => !(k in table)))];
}

// ── 2) Textes codés en dur (hors éléments traduits) ──
// Tokeniseur minimal : on retire script/style/template/noscript/svg, puis on parcourt les balises
let body = html
  .replace(/<(script|style|template|noscript|svg)\b[\s\S]*?<\/\1>/gi, '')
  .replace(/<select[^>]*id="langSelect"[\s\S]*?<\/select>/, '') // noms de langues : volontairement natifs
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<!DOCTYPE[^>]*>/i, '');
const tagRe = /<(\/?)([a-zA-Z][\w-]*)([^>]*)>/g;
const VOID = new Set(['br', 'img', 'input', 'meta', 'link', 'hr', 'source', 'wbr']);
const stack = []; // {tag, translated}
const hardcoded = [];
let last = 0, mm;
const push = (text, translatedDepth) => {
  const t = text.replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();
  if (translatedDepth) return;
  if (!/[A-Za-zÀ-ÿ]{3,}/.test(t)) return;            // pas de lettres significatives
  if (/^[\d\s.,:%/€·—–-]+$/.test(t)) return;          // nombres / ponctuation
  const ctx = stack.map(s => s.tag + (s.id ? '#' + s.id : '')).slice(-3).join('>');
  hardcoded.push({ text: t.slice(0, 90), ctx });
};
let translatedDepth = 0;
while ((mm = tagRe.exec(body))) {
  push(body.slice(last, mm.index), translatedDepth);
  last = tagRe.lastIndex;
  const [, close, tag, attrs] = mm;
  if (VOID.has(tag.toLowerCase()) || /\/\s*$/.test(attrs)) continue;
  if (close) {
    const top = stack.pop();
    if (top?.translated) translatedDepth--;
  } else {
    const translated = /\bdata-i18n=/.test(attrs) || /\btranslate="no"/.test(attrs);
    if (translated) translatedDepth++;
    stack.push({ tag, translated, id: attrs.match(/\bid="([^"]+)"/)?.[1] });
  }
}
push(body.slice(last), translatedDepth);

// ── Rapport ──
const maxHard = args['max-hardcoded'] != null ? Number(args['max-hardcoded']) : Infinity;
let fail = false;
console.log(`Langues proposées : ${offered.join(', ')} — vérifiées : ${langs.join(', ')}`);
console.log(`Clés data-i18n dans index.html : ${new Set(keys).size}`);
for (const lang of langs) {
  const n = missing[lang].length;
  console.log(`  ${lang}: ${n ? `❌ ${n} clé(s) manquante(s)` : '✅ toutes les clés présentes'}${n && args.list ? ' → ' + missing[lang].join(', ') : ''}`);
  if (n) fail = true;
}
console.log(`Textes codés en dur (affichés en français dans toutes les langues) : ${hardcoded.length}`);
if (args.json) console.log(JSON.stringify(hardcoded, null, 1));
else if (args.list) hardcoded.forEach(h => console.log(`   · [${h.ctx}] ${h.text}`));
if (hardcoded.length > maxHard) { console.log(`❌ dépasse --max-hardcoded=${maxHard}`); fail = true; }
process.exit(fail ? 1 : 0);
