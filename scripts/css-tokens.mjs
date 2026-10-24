// Charte graphique BreathIQ — application et contrôle des tokens CSS.
//   node scripts/css-tokens.mjs --apply   remplace couleurs, tailles et rayons codés en dur par les tokens
//   node scripts/css-tokens.mjs           contrôle (CI) : échoue si une valeur hors charte réapparaît
// Les couleurs codées en dur sont ramenées à la teinte la plus proche d'une palette FIXE (non thémée) :
// le comportement clair / sombre reste identique ; seules les définitions de variables (:root, [data-theme])
// et les règles d'impression (@media print) conservent des valeurs littérales.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const file = join(new URL('..', import.meta.url).pathname, 'style.css');
const APPLY = process.argv.includes('--apply');

// Palette fixe : neutres, marque et états (variante foncée pour fond clair, claire pour fond sombre)
export const PALETTE = {
  '--p-black': '#000000', '--p-ink-950': '#0B1622', '--p-ink-900': '#0F1F35', '--p-ink-800': '#1A2B3C',
  '--p-ink-700': '#1A3C5E', '--p-ink-600': '#374151', '--p-ink-500': '#4A5568', '--p-ink-400': '#64748B',
  '--p-ink-300': '#94A3B8', '--p-ink-200': '#CBD5E1', '--p-ink-100': '#E2E8F0', '--p-ink-50': '#F1F5F9',
  '--p-white': '#FFFFFF',
  '--p-blue-700': '#1D4ED8', '--p-blue-600': '#2563EB', '--p-blue-400': '#60A5FA', '--p-blue-200': '#BFDBFE', '--p-blue-50': '#EFF6FF',
  '--p-teal-700': '#0E8C7A', '--p-teal-300': '#5EEAD4',
  '--p-green-700': '#15803D', '--p-green-500': '#10B981', '--p-green-200': '#BBF7D0', '--p-green-50': '#F0FDF4',
  '--p-amber-800': '#92400E', '--p-amber-600': '#D97706', '--p-amber-300': '#FCD34D', '--p-amber-50': '#FFFBEB',
  '--p-orange-600': '#EA580C', '--p-orange-400': '#FB923C',
  '--p-red-900': '#7F1D1D', '--p-red-700': '#B91C1C', '--p-red-500': '#EF4444', '--p-red-300': '#FCA5A5', '--p-red-50': '#FEF2F2',
};
// Échelle typographique : 14 · 16 · 18 · 22 · 28 · 36 px (aucun texte sous 14 px)
export const FONT = { '--fs-1': .875, '--fs-2': 1, '--fs-3': 1.125, '--fs-4': 1.375, '--fs-5': 1.75, '--fs-6': 2.25 };
// Rayons : champs 4 px · cartes 8 px · pastilles 999 px
export const RADIUS = { '--r-sm': '4px', '--r-md': '8px', '--r-full': '999px' };

const rgb = h => { h = h.replace('#', ''); if (h.length === 3 || h.length === 4) h = h.slice(0, 3).split('').map(c => c + c).join(''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); };
// Distance « redmean » (approximation perceptive simple)
const dist = (a, b) => { const r = (a[0] + b[0]) / 2, d = a.map((v, i) => v - b[i]); return Math.sqrt((2 + r / 256) * d[0] ** 2 + 4 * d[1] ** 2 + (2 + (255 - r) / 256) * d[2] ** 2); };
const PAL = Object.entries(PALETTE).map(([k, v]) => [k, rgb(v)]);
const nearestColor = hex => PAL.reduce((best, [k, c]) => { const d = dist(rgb(hex), c); return d < best[1] ? [k, d] : best; }, [null, Infinity])[0];

function toRem(v) {
  const m = /^(\d*\.?\d+)(rem|px)$/.exec(v.trim());
  if (!m) return null;
  return m[2] === 'px' ? Number(m[1]) / 16 : Number(m[1]);
}
function nearestFont(rem) {
  if (rem < .94) return '--fs-1';
  if (rem < 1.06) return '--fs-2';
  if (rem < 1.25) return '--fs-3';
  if (rem < 1.56) return '--fs-4';
  if (rem < 2) return '--fs-5';
  if (rem <= 2.4) return '--fs-6';
  return null; // grands titres d'affichage : conservés
}
function nearestRadius(v) {
  v = v.trim();
  if (/^var\(--r-(lg|xl)\)$/.test(v)) return 'var(--r-md)';
  if (v === '50%' || v.startsWith('var(') || v === 'inherit') return null;
  const rem = toRem(v);
  if (rem == null) return null;
  const px = rem * 16;
  if (px <= 5) return 'var(--r-sm)';
  if (px < 40) return 'var(--r-md)';
  return 'var(--r-full)';
}

// Découpe en zones : définitions de variables et @media print conservées telles quelles
function transform(css) {
  let out = '', i = 0, depth = 0, printDepth = -1, stats = { color: 0, font: 0, radius: 0 };
  const lines = css.split('\n');
  for (const line of lines) {
    const opens = (line.match(/{/g) || []).length, closes = (line.match(/}/g) || []).length;
    if (/@media\s+print/.test(line) && printDepth < 0) printDepth = depth;
    const inPrint = printDepth >= 0;
    const isVarDef = /^\s*--[\w-]+\s*:/.test(line) || /^\s*(:root|\[data-theme)/.test(line) && /--[\w-]+\s*:/.test(line);
    let l = line;
    if (!inPrint && !isVarDef) {
      l = l.replace(/#[0-9a-fA-F]{3,8}\b/g, h => { if (h.length === 5 || h.length === 9) return h; stats.color++; return `var(${nearestColor(h)})`; });
      l = l.replace(/(font-size\s*:\s*)([^;}!]+)/g, (m, p, v) => { const r = toRem(v); const t = r != null && nearestFont(r); if (!t) return m; stats.font++; return `${p}var(${t})`; });
      l = l.replace(/(border-radius\s*:\s*)([^;}!]+)/g, (m, p, v) => { const t = nearestRadius(v); if (!t) return m; stats.radius++; return `${p}${t}`; });
    }
    depth += opens - closes;
    if (printDepth >= 0 && depth <= printDepth) printDepth = -1;
    out += (i++ ? '\n' : '') + l;
  }
  return { css: out, stats };
}

let css = readFileSync(file, 'utf8');
if (APPLY) {
  const tokens = [
    '  /* Charte graphique (scripts/css-tokens.mjs) — palette fixe, échelle typographique, rayons */',
    ...Object.entries(PALETTE).map(([k, v]) => `  ${k}: ${v};`),
    ...Object.entries(FONT).map(([k, v]) => `  ${k}: ${v}rem;`),
  ].join('\n');
  if (!css.includes('--p-ink-950')) css = css.replace(/:root \{\n/, `:root {\n${tokens}\n`);
  css = css.replace(/--r-sm: 6px; --r-md: 12px; --r-lg: 20px; --r-xl: 28px; --r-full: 999px;/, '--r-sm: 4px; --r-md: 8px; --r-lg: 8px; --r-xl: 8px; --r-full: 999px;');
  const { css: next, stats } = transform(css);
  writeFileSync(file, next);
  console.log(`✅ style.css — couleurs ${stats.color}, tailles ${stats.font}, rayons ${stats.radius} remplacés`);
} else {
  const { stats } = transform(css);
  const total = stats.color + stats.font + stats.radius;
  console.log(total ? `❌ ${stats.color} couleur(s), ${stats.font} taille(s), ${stats.radius} rayon(s) hors charte dans style.css — lancer : node scripts/css-tokens.mjs --apply` : '✅ style.css conforme à la charte graphique');
  process.exit(total ? 1 : 0);
}
