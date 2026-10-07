#!/usr/bin/env node
/**
 * Outil de développement — externalise les textes codés en dur d'index.html.
 *
 * Passe 1 (--apply)  : éléments « feuille » (balise → texte → fermeture) → data-i18n sur l'élément.
 * Passe 2 (--wrap)   : tout autre nœud texte restant → enveloppé dans <span data-i18n="…">…</span>
 *                      (sûr même quand l'élément contient des enfants : svg, strong, br…).
 *                      Les textes « neutres » (normes, e-mails, marque) reçoivent translate="no".
 * Les paires clé → texte FR sont écrites dans --out (JSON).
 *
 * Usage : node scripts/i18n-extract.mjs --out=/chemin/fr.json [--apply|--wrap] [--listMixed]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const ROOT = new URL('..', import.meta.url).pathname;
const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const path = join(ROOT, 'index.html');
let html = readFileSync(path, 'utf8');

// Textes à ne pas traduire (marque, normes, e-mails, placeholders remplis par le JS)
const NEUTRAL = /^(Breath|IQ|BreathIQ|Dr\.? ?Clément M[ÉE]DEAU.*|contact@breathiq\.fr|coreb@aphp\.fr|sante\.gouv\.fr|signalement\.social-sante\.gouv\.fr|SPF( · ECDC( · OMS( · OSM)?)?)?|OMS|ECDC|OSM|EN 149.*|NIOSH.*|ASTM.*|BFE.*|EN 14683.*|Chargement…|Calcul…|—|·|, WHO 2021)$/;
const NO_WRAP_PARENTS = new Set(['option', 'title', 'script', 'style', 'textarea', 'code', 'pre', 'select', 'optgroup', 'ul', 'ol', 'table', 'tbody', 'thead', 'tr']);
const LEAF_TAGS = new Set(['span', 'strong', 'em', 'p', 'li', 'option', 'a', 'button', 'h1', 'h2', 'h3', 'h4', 'small', 'label', 'td', 'th', 'div', 'summary', 'title', 'time', 'b', 'legend', 'figcaption']);

const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').split('-').filter(Boolean).slice(0, 4).join('-');
const keyFor = text => `x-${slug(text) || 'txt'}-${createHash('md5').update(text).digest('hex').slice(0, 4)}`;
const decode = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ');
const meaningful = t => /[A-Za-zÀ-ÿ]{3,}/.test(t) && !/^[\d\s.,:%/€·—–-]+$/.test(t);

function protectedRanges(src) {
  const ranges = [];
  // Toutes les regex doivent être globales : un exec() non-global en boucle while ne termine jamais
  for (const re of [/<(script|style|template|noscript|svg|code|pre)\b[\s\S]*?<\/\1>/gi, /<select[^>]*id="langSelect"[\s\S]*?<\/select>/g, /<!--[\s\S]*?-->/g, /<!DOCTYPE[^>]*>/gi]) {
    let m; while ((m = re.exec(src))) ranges.push([m.index, m.index + m[0].length]);
  }
  return i => ranges.some(([a, b]) => i >= a && i < b);
}

const tagRe = /<(\/?)([a-zA-Z][\w-]*)([^>]*)>/g;
const VOID = new Set(['br', 'img', 'input', 'meta', 'link', 'hr', 'source', 'wbr']);

// Parcours : renvoie les nœuds texte candidats avec leur contexte
function scan(src) {
  const isProtected = protectedRanges(src);
  const stack = []; let translatedDepth = 0; let last = 0; let m;
  const texts = []; // {start,end,text,parent,parentOpen:{start,end,tag,attrs}}
  const emit = (start, end) => {
    const raw = src.slice(start, end);
    // Un commentaire précédé d'un espace commence hors de sa plage protégée : l'exclure explicitement
    if (raw.includes('<!--') || raw.includes('-->')) return;
    const clean = decode(raw).replace(/\s+/g, ' ').trim();
    if (!clean || translatedDepth || isProtected(start)) return;
    const parent = stack[stack.length - 1];
    texts.push({ start, end, raw, text: clean, parent: parent?.tag, parentOpen: parent });
  };
  tagRe.lastIndex = 0;
  while ((m = tagRe.exec(src))) {
    if (isProtected(m.index)) { last = tagRe.lastIndex; continue; }
    emit(last, m.index); last = tagRe.lastIndex;
    const [, close, tag, attrs] = m; const lower = tag.toLowerCase();
    if (VOID.has(lower) || /\/\s*$/.test(attrs)) continue;
    if (close) { const top = stack.pop(); if (top?.translated) translatedDepth--; continue; }
    const translated = /\bdata-i18n=/.test(attrs) || /\btranslate="no"/.test(attrs);
    if (translated) translatedDepth++;
    stack.push({ tag: lower, attrs, translated, start: m.index, end: tagRe.lastIndex });
  }
  emit(last, src.length);
  return texts;
}

const out = {};
let edits = []; // {start,end,replacement}

if (args.apply) {
  // Passe 1 : feuilles
  const texts = scan(html);
  for (const t of texts) {
    if (!meaningful(t.text) || NEUTRAL.test(t.text)) continue;
    const p = t.parentOpen; if (!p || !LEAF_TAGS.has(p.tag)) continue;
    const closeAt = html.indexOf('<', t.end);
    const isLeaf = p.end === t.start && html.slice(closeAt, closeAt + p.tag.length + 3).toLowerCase() === `</${p.tag}>`;
    if (!isLeaf) continue;
    const key = keyFor(t.text); out[key] = t.text;
    edits.push({ start: p.start, end: p.end, replacement: html.slice(p.start, p.end).replace(/^<([a-zA-Z][\w-]*)/, `<$1 data-i18n="${key}"`) });
  }
}

if (args.wrap) {
  // Passe 2 : nœuds texte restants → span ; neutres → translate="no" sur le parent
  const texts = scan(html);
  const neutralParents = new Set();
  for (const t of texts) {
    if (!meaningful(t.text)) continue;
    const p = t.parentOpen; if (!p) continue;
    if (NEUTRAL.test(t.text)) { if (!neutralParents.has(p.start)) { neutralParents.add(p.start); edits.push({ start: p.start, end: p.end, replacement: html.slice(p.start, p.end).replace(/^<([a-zA-Z][\w-]*)/, `<$1 translate="no"`) }); } continue; }
    if (NO_WRAP_PARENTS.has(p.tag)) continue;
    const key = keyFor(t.text); out[key] = t.text;
    // Conserver les espaces de bordure hors du span
    const lead = t.raw.match(/^\s*/)[0], trail = t.raw.match(/\s*$/)[0];
    const inner = t.raw.slice(lead.length, t.raw.length - trail.length);
    edits.push({ start: t.start, end: t.end, replacement: `${lead}<span data-i18n="${key}">${inner}</span>${trail}` });
  }
}

if (edits.length) {
  edits.sort((a, b) => b.start - a.start);
  for (const e of edits) html = html.slice(0, e.start) + e.replacement + html.slice(e.end);
  writeFileSync(path, html);
}
if (args.out) writeFileSync(String(args.out), JSON.stringify(out, null, 2) + '\n');
console.log(`${edits.length} modification(s) · ${Object.keys(out).length} clé(s) écrite(s)`);
