#!/usr/bin/env node
/**
 * Outil de développement — injecte des paires clé → texte dans la table I18N de script.js.
 * Usage : node scripts/i18n-merge.mjs --lang=fr --file=/chemin/fr.json
 * Insère après l'ancre 'nav-tool-theme' du bloc de la langue ; ignore les clés déjà présentes.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
if (!args.lang || !args.file) { console.error('--lang et --file requis'); process.exit(2); }

const path = join(ROOT, 'script.js');
let src = readFileSync(path, 'utf8');
const entries = JSON.parse(readFileSync(String(args.file), 'utf8'));

const anchorRe = new RegExp(`(\\n  ${args.lang}: \\{[\\s\\S]*?'nav-tool-theme': '[^']*',\\n)`);
const m = src.match(anchorRe);
if (!m) { console.error(`ancre 'nav-tool-theme' introuvable dans le bloc ${args.lang}`); process.exit(2); }

const esc = s => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, ' ');
const existing = new Set([...m[1].matchAll(/'([^']+)':/g)].map(x => x[1]));
const lines = Object.entries(entries).filter(([k]) => !existing.has(k)).map(([k, v]) => `    '${k}': '${esc(v)}',`);
src = src.replace(anchorRe, `$1${lines.join('\n')}\n`);
writeFileSync(path, src);
console.log(`${args.lang}: ${lines.length} clé(s) injectée(s)`);
