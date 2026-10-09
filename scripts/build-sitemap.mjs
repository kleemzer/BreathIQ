#!/usr/bin/env node
// Génère sitemap.xml avec, pour chaque page HTML publique, la date du dernier commit (lastmod réel).
import { readdirSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const BASE = 'https://breathiq.fr';
const EXCLUDE = new Set(['404.html', 'offline.html', 'psc-callback.html']);

const pages = readdirSync(ROOT).filter(f => f.endsWith('.html') && !EXCLUDE.has(f)).sort();
const lastmod = f => {
  try { return execSync(`git log -1 --format=%cI -- "${f}"`, { cwd: ROOT }).toString().trim().slice(0, 10) || new Date().toISOString().slice(0, 10); }
  catch { return new Date().toISOString().slice(0, 10); }
};
const priority = f => f === 'index.html' ? '1.0' : /^(ebola|stocks|methodologie|bilan)/.test(f) ? '0.8' : '0.6';
const loc = f => f === 'index.html' ? `${BASE}/` : `${BASE}/${f}`;

// Alternates linguistiques uniquement pour les langues complètes (fr, en)
const alt = f => f === 'index.html'
  ? `\n    <xhtml:link rel="alternate" hreflang="fr" href="${BASE}/" />\n    <xhtml:link rel="alternate" hreflang="en" href="${BASE}/?lang=en" />\n    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/" />`
  : '';

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pages.map(f => `  <url>\n    <loc>${loc(f)}</loc>\n    <lastmod>${lastmod(f)}</lastmod>\n    <priority>${priority(f)}</priority>${alt(f)}\n  </url>`).join('\n')}
</urlset>
`;
writeFileSync(join(ROOT, 'sitemap.xml'), xml);
console.log(`sitemap.xml : ${pages.length} pages (${pages.includes('presse.html') ? 'presse.html incluse' : 'presse.html absente'})`);
