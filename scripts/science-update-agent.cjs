#!/usr/bin/env node
/**
 * BreathIQ — Agent de veille scientifique automatique
 * Auteur : Dr. Clément Médeau · BreathIQ
 *
 * Sources interrogées (toutes publiques et gratuites) :
 *   - PubMed / NCBI E-utilities API (https://www.ncbi.nlm.nih.gov/home/develop/api/)
 *   - OMS Disease Outbreak News RSS (https://www.who.int/rss-feeds/news-releases.xml)
 *   - ECDC Communicable Disease Threats Report (flux public)
 *   - Santé publique France flux RSS
 *
 * Sortie : data/science-updates-pending.json (staging — validation humaine requise)
 * Email  : rapport à clement.medeau@gmail.com via SMTP (variable env SMTP_*)
 *
 * Usage :
 *   node scripts/science-update-agent.js
 *   SEND_EMAIL=1 node scripts/science-update-agent.js
 */

'use strict';

const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');

// ── Configuration ─────────────────────────────────────────────────
const ROOT       = path.join(__dirname, '..');
const PATHOGENS  = path.join(ROOT, 'data', 'pathogens.json');
const OUT_FILE   = path.join(ROOT, 'data', 'science-updates-pending.json');
const LOG_FILE   = path.join(ROOT, 'data', 'science-agent-log.json');

const PUBMED_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const WHO_RSS     = 'https://www.who.int/rss-feeds/news-releases.xml';
const ECDC_URL    = 'https://www.ecdc.europa.eu/en/news-events/feed';

// Termes de recherche PubMed par pathogène (ID → requête)
const PUBMED_QUERIES = {
  H5N1:         'H5N1[tiab] AND (outbreak OR human) AND 2025:2026[dp]',
  MPOX:         'mpox OR monkeypox[tiab] AND (clade Ib OR outbreak) AND 2025:2026[dp]',
  DENGUE:       'dengue[tiab] AND (outbreak OR severity OR treatment) AND 2025:2026[dp]',
  CHOLERA:      'cholera[tiab] AND (outbreak OR control) AND 2025:2026[dp]',
  EBOLA:        'Ebola[tiab] AND (Bundibugyo OR outbreak OR treatment) AND 2025:2026[dp]',
  MARBURG:      'Marburg[tiab] AND (outbreak OR case) AND 2025:2026[dp]',
  NIPAH:        'Nipah[tiab] AND (outbreak OR Kerala OR treatment) AND 2025:2026[dp]',
  OROPOUCHE:    'Oropouche[tiab] AND 2025:2026[dp]',
  PERTUSSIS:    'pertussis OR whooping cough[tiab] AND (resurgence OR outbreak) AND 2025:2026[dp]',
  YELLOW_FEVER: 'yellow fever[tiab] AND (outbreak OR vaccine) AND 2025:2026[dp]',
  MEASLES:      'measles[tiab] AND (outbreak OR elimination) AND 2025:2026[dp]',
  MERS:         'MERS-CoV[tiab] AND (case OR nosocomial) AND 2025:2026[dp]',
  CCHF:         'Crimean-Congo hemorrhagic fever[tiab] AND 2025:2026[dp]',
  LEPTOSPIROSIS:'leptospirosis[tiab] AND (outbreak OR epidemiology) AND 2025:2026[dp]',
};

// ── Utilitaires HTTP ──────────────────────────────────────────────
function fetchUrl(url, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { timeout: timeoutMs }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── PubMed : récupérer les N dernières publications ───────────────
async function pubmedSearch(query, maxResults = 5) {
  const q = encodeURIComponent(query);
  const searchUrl = `${PUBMED_BASE}/esearch.fcgi?db=pubmed&term=${q}&retmax=${maxResults}&retmode=json&sort=relevance`;
  try {
    const { body } = await fetchUrl(searchUrl);
    const data = JSON.parse(body);
    const ids = data?.esearchresult?.idlist || [];
    if (!ids.length) return [];

    await sleep(400); // Respecter rate limit NCBI (3 req/s sans clé)

    const summaryUrl = `${PUBMED_BASE}/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
    const { body: sb } = await fetchUrl(summaryUrl);
    const sum = JSON.parse(sb);
    const result = ids.map(id => {
      const art = sum?.result?.[id];
      if (!art) return null;
      const authors = (art.authors || []).slice(0, 3).map(a => a.name).join(', ');
      const year = art.pubdate?.slice(0, 4) || '?';
      return {
        pmid: id,
        title: art.title || '',
        authors,
        source: art.source || '',
        year,
        doi: art.elocationid || '',
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
      };
    }).filter(Boolean);

    return result;
  } catch (e) {
    console.warn(`PubMed error for query "${query}": ${e.message}`);
    return [];
  }
}

// ── OMS RSS : extraire les alertes récentes ───────────────────────
async function fetchWHOAlerts() {
  try {
    const { body } = await fetchUrl(WHO_RSS);
    const items = [];
    const itemRx = /<item>([\s\S]*?)<\/item>/g;
    let m;
    while ((m = itemRx.exec(body)) !== null) {
      const item = m[1];
      const title   = (/<title><!\[CDATA\[(.*?)\]\]>/i.exec(item) || [])[1]
                   || (/<title>(.*?)<\/title>/i.exec(item) || [])[1] || '';
      const link    = (/<link>(.*?)<\/link>/i.exec(item) || [])[1] || '';
      const pubDate = (/<pubDate>(.*?)<\/pubDate>/i.exec(item) || [])[1] || '';
      if (title) items.push({ title: title.trim(), link: link.trim(), pubDate: pubDate.trim() });
    }
    // Filtrer sur mots-clés épidémiques
    const KEYWORDS = ['outbreak', 'disease', 'alert', 'ebola', 'mpox', 'cholera', 'dengue',
                      'influenza', 'h5n1', 'measles', 'marburg', 'nipah', 'oropouche', 'PHEIC'];
    return items.filter(i => KEYWORDS.some(k => i.title.toLowerCase().includes(k.toLowerCase())));
  } catch (e) {
    console.warn(`WHO RSS error: ${e.message}`);
    return [];
  }
}

// ── ECDC feed ────────────────────────────────────────────────────
async function fetchECDCAlerts() {
  try {
    const { body } = await fetchUrl(ECDC_URL);
    const items = [];
    const itemRx = /<item>([\s\S]*?)<\/item>/g;
    let m;
    while ((m = itemRx.exec(body)) !== null) {
      const item = m[1];
      const title = (/<title>(.*?)<\/title>/i.exec(item) || [])[1] || '';
      const link  = (/<link>(.*?)<\/link>/i.exec(item) || [])[1] || '';
      const date  = (/<pubDate>(.*?)<\/pubDate>/i.exec(item) || [])[1] || '';
      if (title) items.push({ title: title.trim(), link, date });
    }
    return items.slice(0, 20);
  } catch (e) {
    console.warn(`ECDC feed error: ${e.message}`);
    return [];
  }
}

// ── Analyse des mises à jour détectées ────────────────────────────
function analyzeUpdates(pathogenData, pubmedResults, whoAlerts, ecdcAlerts) {
  const updates = [];
  const now = new Date().toISOString().slice(0, 10);

  // 1. Pour chaque pathogène : nouveaux articles PubMed significatifs
  for (const [pid, articles] of Object.entries(pubmedResults)) {
    if (!articles.length) continue;
    const pathogen = pathogenData.find(p => p.id === pid);
    if (!pathogen) continue;

    // Articles récents publiés après le lastUpdate du pathogène
    const lastUpdate = pathogen.lastUpdate || '2024-01-01';
    const newArticles = articles.filter(a => (a.year || '0') >= lastUpdate.slice(0, 4));

    if (newArticles.length > 0) {
      updates.push({
        type: 'new_literature',
        pathogenId: pid,
        pathogenName: pathogen.nameFR,
        severity: 'info',
        message: `${newArticles.length} article(s) PubMed récent(s) détecté(s) pour ${pid}`,
        articles: newArticles.map(a => ({
          pmid: a.pmid,
          title: a.title,
          authors: a.authors,
          year: a.year,
          journal: a.source,
          url: a.url,
        })),
        suggestedAction: 'Vérifier si CFR/R0/protectionRequired nécessite mise à jour',
        detectedAt: now,
        humanValidationRequired: true,
      });
    }
  }

  // 2. Alertes OMS correspondant à des pathogènes trackés
  const trackedIds = pathogenData.map(p => p.id.toLowerCase());
  for (const alert of whoAlerts) {
    const matched = trackedIds.find(id => alert.title.toLowerCase().includes(id.replace('_', ' ')));
    if (matched) {
      updates.push({
        type: 'who_alert',
        pathogenId: matched.toUpperCase(),
        severity: 'warning',
        message: alert.title,
        source: 'WHO Disease Outbreak News',
        url: alert.link,
        pubDate: alert.pubDate,
        suggestedAction: 'Vérifier statut currentStatus et foci dans pathogens.json',
        detectedAt: now,
        humanValidationRequired: true,
      });
    }
  }

  // 3. Alertes ECDC
  for (const alert of ecdcAlerts.slice(0, 10)) {
    updates.push({
      type: 'ecdc_alert',
      severity: 'info',
      message: alert.title,
      source: 'ECDC',
      url: alert.link,
      date: alert.date,
      detectedAt: now,
      humanValidationRequired: true,
    });
  }

  return updates;
}

// ── Génération du rapport email ───────────────────────────────────
function buildEmailReport(updates) {
  const warnings = updates.filter(u => u.severity === 'warning');
  const infos    = updates.filter(u => u.severity === 'info');

  let html = `
<h2>🔬 BreathIQ — Rapport de veille scientifique</h2>
<p>Date : ${new Date().toLocaleDateString('fr-FR', { dateStyle: 'full' })}</p>
<p>Mises à jour détectées : <strong>${updates.length}</strong> (${warnings.length} alertes · ${infos.length} informations)</p>
<hr>`;

  if (warnings.length) {
    html += '<h3>⚠️ Alertes (action recommandée)</h3><ul>';
    for (const u of warnings) {
      html += `<li><strong>${u.pathogenId || ''}</strong> — ${u.message}<br>
        Source : <a href="${u.url}">${u.source}</a><br>
        Action : ${u.suggestedAction || '—'}</li>`;
    }
    html += '</ul>';
  }

  if (infos.length) {
    html += '<h3>📚 Nouvelles publications PubMed</h3><ul>';
    for (const u of infos.filter(u => u.type === 'new_literature')) {
      html += `<li><strong>${u.pathogenName || u.pathogenId}</strong> — ${u.articles?.length} article(s)<br>`;
      for (const a of (u.articles || []).slice(0, 3)) {
        html += `&nbsp;&nbsp;• ${a.authors} (${a.year}) — <a href="${a.url}">${a.title.slice(0, 80)}…</a><br>`;
      }
      html += '</li>';
    }
    html += '</ul>';
  }

  html += `<hr><p style="font-size:12px;color:#888">
    Cet email est généré automatiquement par l'agent de veille BreathIQ.<br>
    Toutes les mises à jour nécessitent une validation humaine avant intégration.<br>
    Fichier staging : <code>data/science-updates-pending.json</code>
  </p>`;

  return html;
}

// ── Envoi email (nodemailer optionnel) ───────────────────────────
async function sendEmail(subject, html) {
  if (process.env.SEND_EMAIL !== '1') {
    console.log('Email non envoyé (SEND_EMAIL!=1). Rapport :\n', subject);
    return;
  }
  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    });
    await transporter.sendMail({
      from: `"BreathIQ Agent" <${process.env.SMTP_USER}>`,
      to: 'clement.medeau@gmail.com',
      subject,
      html,
    });
    console.log('Email envoyé à clement.medeau@gmail.com');
  } catch (e) {
    console.error('Erreur envoi email:', e.message);
    console.log('Pour activer : npm install nodemailer && SMTP_USER=xxx SMTP_PASS=xxx SEND_EMAIL=1 node scripts/science-update-agent.js');
  }
}

// ── Point d'entrée ────────────────────────────────────────────────
async function main() {
  console.log(`\n🔬 BreathIQ Science Update Agent — ${new Date().toISOString()}`);
  console.log('━'.repeat(60));

  // Charger les données actuelles
  const pathogens = JSON.parse(fs.readFileSync(PATHOGENS)).pathogens;
  console.log(`Pathogènes chargés : ${pathogens.length}`);

  // 1. PubMed — recherches par pathogène
  console.log('\n📚 Interrogation PubMed...');
  const pubmedResults = {};
  const queryEntries = Object.entries(PUBMED_QUERIES);
  for (let i = 0; i < queryEntries.length; i++) {
    const [pid, query] = queryEntries[i];
    process.stdout.write(`  [${i+1}/${queryEntries.length}] ${pid}... `);
    pubmedResults[pid] = await pubmedSearch(query, 3);
    console.log(`${pubmedResults[pid].length} article(s)`);
    await sleep(350); // Respecter rate limit NCBI
  }

  // 2. OMS RSS
  console.log('\n🌍 Interrogation OMS Disease Outbreak News...');
  const whoAlerts = await fetchWHOAlerts();
  console.log(`  ${whoAlerts.length} alerte(s) OMS pertinente(s)`);

  // 3. ECDC
  console.log('\n🇪🇺 Interrogation ECDC feed...');
  const ecdcAlerts = await fetchECDCAlerts();
  console.log(`  ${ecdcAlerts.length} alerte(s) ECDC`);

  // 4. Analyse
  console.log('\n🔍 Analyse des mises à jour...');
  const updates = analyzeUpdates(pathogens, pubmedResults, whoAlerts, ecdcAlerts);
  console.log(`  ${updates.length} mise(s) à jour détectée(s)`);

  // 5. Sauvegarder le fichier staging
  const output = {
    generatedAt: new Date().toISOString(),
    agentVersion: '1.0.0',
    note: 'STAGING — validation humaine requise avant intégration dans pathogens.json',
    disclaimer: 'Ces données sont issues de sources publiques (PubMed, OMS, ECDC). Elles ne constituent pas un avis médical et doivent être validées par un professionnel de santé avant publication.',
    summary: {
      totalUpdates: updates.length,
      warnings: updates.filter(u => u.severity === 'warning').length,
      newLiterature: updates.filter(u => u.type === 'new_literature').length,
      whoAlerts: updates.filter(u => u.type === 'who_alert').length,
    },
    updates,
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2), 'utf8');
  console.log(`\n✅ Rapport staging : ${OUT_FILE}`);

  // 6. Logger
  const log = {
    timestamp: new Date().toISOString(),
    updatesFound: updates.length,
    pubmedQueriesRun: Object.keys(pubmedResults).length,
    whoAlertsFound: whoAlerts.length,
    ecdcAlertsFound: ecdcAlerts.length,
  };
  let logs = [];
  try { logs = JSON.parse(fs.readFileSync(LOG_FILE)); } catch {}
  logs.unshift(log);
  if (logs.length > 90) logs = logs.slice(0, 90); // Garder 90 jours
  fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));

  // 7. Email
  if (updates.length > 0) {
    const subject = `BreathIQ Veille Scientifique — ${updates.length} mise(s) à jour détectée(s) — ${new Date().toLocaleDateString('fr-FR')}`;
    const html = buildEmailReport(updates);
    await sendEmail(subject, html);
  } else {
    console.log('\nAucune mise à jour significative — pas d\'email envoyé.');
  }

  console.log('\n✅ Agent terminé.\n');
}

main().catch(e => {
  console.error('Erreur agent:', e);
  process.exit(1);
});
