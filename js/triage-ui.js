// ============================================================
// BreathIQ — Interface du questionnaire de triage (une question à la fois)
// Moteur : js/triage-engine.js · Données : data/triage.json (chargées à la première utilisation)
// Deux versions de texte strictement séparées : patient (langage simple, tout public, tous pays)
// et soignant (terminologie clinique, seuils, sources). Aucune réponse n'est transmise ni enregistrée.
// ============================================================
(function () {
  'use strict';

  // Numéros par pays : uniquement ceux marqués « certain » dans docs/triage/D-textes.json
  const COUNTRIES = {
    FR: { fr: 'France', en: 'France', urgence: '15', alt: '112', garde: { fr: 'le 116 117 (médecin de garde)', en: '116 117 (out-of-hours doctor)' } },
    BE: { fr: 'Belgique', en: 'Belgium', urgence: '112', garde: null },
    CH: { fr: 'Suisse', en: 'Switzerland', urgence: '144', alt: '112', garde: null },
    DE: { fr: 'Allemagne', en: 'Germany', urgence: '112', garde: { fr: 'le 116 117 (médecin de garde)', en: '116 117 (out-of-hours doctor)' } },
    EU: { fr: 'Autre pays de l\'Union européenne', en: 'Other EU country', urgence: '112', garde: null },
    GB: { fr: 'Royaume-Uni', en: 'United Kingdom', urgence: '999', alt: '112', garde: { fr: 'le 111 (NHS 111)', en: 'NHS 111' } },
    US: { fr: 'États-Unis', en: 'United States', urgence: '911', garde: null },
    CA: { fr: 'Canada', en: 'Canada', urgence: '911', garde: null },
    AU: { fr: 'Australie', en: 'Australia', urgence: '000', garde: null },
    NZ: { fr: 'Nouvelle-Zélande', en: 'New Zealand', urgence: '111', garde: null },
    XX: { fr: 'Autre pays', en: 'Other country', urgence: null, garde: null },
  };
  const EU_CODES = ['AT', 'BG', 'CY', 'CZ', 'DK', 'EE', 'ES', 'FI', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK'];

  const LEVELS = {
    urgence_vitale:          { icon: '🚨', cls: 'tri-lv-red',    fr: 'Urgence : appelez maintenant',              en: 'Emergency: call now',                     pfr: 'Urgence vitale — appel immédiat',        pen: 'Life-threatening — call now' },
    urgence_sans_delai:      { icon: '🚑', cls: 'tri-lv-red',    fr: 'Allez aux urgences tout de suite',          en: 'Go to the emergency department now',      pfr: 'Urgences sans délai (< 2 h)',             pen: 'Emergency department without delay (< 2 h)' },
    consultation_urgente:    { icon: '⏱',  cls: 'tri-lv-orange', fr: 'Voyez un médecin dans les 6 heures',        en: 'See a doctor within 6 hours',             pfr: 'Consultation urgente (< 6 h)',            pen: 'Urgent consultation (< 6 h)' },
    consultation_rapide:     { icon: '📅', cls: 'tri-lv-amber',  fr: 'Voyez un médecin dans les 24 heures',       en: 'See a doctor within 24 hours',            pfr: 'Consultation rapide (< 24 h)',            pen: 'Prompt consultation (< 24 h)' },
    consultation_programmee: { icon: '🗓', cls: 'tri-lv-blue',   fr: 'Voyez un médecin dans les 2 jours',         en: 'See a doctor within 2 days',              pfr: 'Consultation programmée (< 48 h)',        pen: 'Scheduled consultation (< 48 h)' },
    autosoins_surveillance:  { icon: '🏠', cls: 'tri-lv-green',  fr: 'Restez chez vous et surveillez',            en: 'Stay at home and keep watch',             pfr: 'Autosoins et surveillance',               pen: 'Self-care and monitoring' },
  };

  const UI = {
    fr: { start: 'Commencer', back: '← Question précédente', restart: 'Recommencer', next: 'Continuer', country: 'Pays où vous êtes', q: 'Question', loading: 'Chargement du questionnaire…', error: 'Le questionnaire n\'a pas pu se charger. En cas de doute, appelez le {URGENCE}.', watch: 'Reconsultez ou appelez si :', raised: 'Votre situation (âge, grossesse, maladie ou traitement) rend ce délai plus court.', call: 'Appeler le', findCare: 'Trouver un médecin ou un centre de santé près de moi', multi: 'Plusieurs réponses possibles.', result: 'Résultat', batchQ: 'En ce moment, la personne a-t-elle un ou plusieurs de ces signes ?', batchHint: 'Cochez tout ce qui s\'applique.', none: 'Aucun de ces signes', unsure: 'Je ne sais pas', noNumber: 'le numéro d\'urgence de votre pays', noGarde: 'un médecin de garde', draft: 'Arbre en cours de validation médicale (version {V}).', rules: 'Règles appliquées', source: 'Source', node: 'Nœud' },
    en: { start: 'Start', back: '← Previous question', restart: 'Start again', next: 'Continue', country: 'Country you are in', q: 'Question', loading: 'Loading the questionnaire…', error: 'The questionnaire could not load. If in doubt, call {URGENCE}.', watch: 'See a doctor again or call if:', raised: 'Your situation (age, pregnancy, illness or treatment) makes this delay shorter.', call: 'Call', findCare: 'Find a doctor or health centre near me', multi: 'You can choose more than one answer.', result: 'Result', batchQ: 'Right now, does the person have one or more of these signs?', batchHint: 'Tick everything that applies.', none: 'None of these signs', unsure: 'I don\'t know', noNumber: 'your country\'s emergency number', noGarde: 'an out-of-hours doctor', draft: 'Tree under medical validation (version {V}).', rules: 'Rules applied', source: 'Source', node: 'Node' },
  };

  let data = null, engine = null, session = null, country = null, loading = null;
  const root = () => document.getElementById('triageApp');
  const lang = () => (typeof currentLang !== 'undefined' && currentLang === 'en') ? 'en' : 'fr';
  const audience = () => (typeof currentMode !== 'undefined' && currentMode === 'expert') ? 'soignant' : 'patient';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function detectCountry() {
    try { const saved = localStorage.getItem('biq-triage-country'); if (saved && COUNTRIES[saved]) return saved; } catch { /* stockage indisponible */ }
    const region = (navigator.language || '').split('-')[1]?.toUpperCase();
    if (region && COUNTRIES[region]) return region;
    if (region && EU_CODES.includes(region)) return 'EU';
    return 'FR';
  }
  function tokens(s) {
    const c = COUNTRIES[country] || COUNTRIES.XX, L = lang();
    const urg = c.urgence ? (c.alt ? `${c.urgence} (${L === 'fr' ? 'ou' : 'or'} ${c.alt})` : c.urgence) : UI[L].noNumber;
    return String(s || '').replace(/\{URGENCE\}/g, urg).replace(/\{GARDE\}/g, c.garde ? c.garde[L] : UI[L].noGarde);
  }
  const T = n => n.t[audience()][lang()];

  async function load() {
    if (data) return;
    if (!loading) loading = fetch('/data/triage.json').then(r => { if (!r.ok) throw new Error(r.status); return r.json(); });
    data = await loading;
    engine = window.BIQ_TRIAGE.createEngine(data);
  }

  function countrySelect() {
    const L = lang();
    return `<label class="tri-country">${esc(UI[L].country)}
      <select id="triCountry">${Object.entries(COUNTRIES).map(([k, c]) => `<option value="${k}"${k === country ? ' selected' : ''}>${esc(c[L])}</option>`).join('')}</select></label>`;
  }

  function render() {
    const el = root();
    if (!el) return;
    const L = lang(), pro = audience() === 'soignant';
    if (!session) {
      el.innerHTML = `<div class="tri-card"><div class="tri-head">${countrySelect()}</div>
        <button type="button" class="tri-btn tri-btn-primary" id="triStart">${esc(UI[L].start)}</button></div>`;
      bind();
      return;
    }
    const node = engine.current(session);
    const draft = pro ? `<p class="tri-draft">${esc(UI[L].draft.replace('{V}', data.version))}</p>` : '';

    if (session.result) {
      const res = engine.nodes.get(session.result.redirect || session.result.node);
      const lv = LEVELS[session.result.level];
      const t = T(res);
      const c = COUNTRIES[country] || COUNTRIES.XX;
      const urgent = ['urgence_vitale', 'urgence_sans_delai'].includes(session.result.level);
      const raised = session.result.level !== session.result.baseLevel && !session.result.redirect;
      el.innerHTML = `<div class="tri-card tri-result ${lv.cls}">
        <p class="tri-level" tabindex="-1"><span aria-hidden="true">${lv.icon}</span> <span class="sr-only">${esc(UI[L].result)} : </span>${esc(pro ? lv['p' + L] : lv[L])}</p>
        ${raised ? `<p class="tri-raised">${esc(UI[L].raised)}</p>` : ''}
        <p class="tri-text">${esc(tokens(t.texte))}</p>
        ${t.aide ? `<p class="tri-help">${esc(tokens(t.aide))}</p>` : ''}
        ${urgent && c.urgence ? `<a class="tri-btn tri-btn-call" href="tel:${c.urgence}"><span aria-hidden="true">📞</span> ${esc(UI[L].call)} ${esc(c.urgence)}</a>` : ''}
        ${t.signes.length ? `<div class="tri-watch"><p><strong>${esc(UI[L].watch)}</strong></p><ul>${t.signes.map(s => `<li>${esc(tokens(s))}</li>`).join('')}</ul></div>` : ''}
        <p class="tri-disclaimer">${esc(t.rappel)}</p>
        ${pro ? `<p class="tri-meta">${esc(UI[L].node)} ${esc(res.id)} · ${esc(UI[L].rules)} : ${esc(session.result.applied.join(', ') || '—')} · ${esc(UI[L].source)} : ${esc(res.source)}</p>` : ''}
        ${draft}
        <div class="tri-nav">
          <button type="button" class="tri-btn tri-btn-ghost" id="triBack">${esc(UI[L].back)}</button>
          <button type="button" class="tri-btn tri-btn-ghost" id="triRestart">${esc(UI[L].restart)}</button>
          <a class="tri-btn tri-btn-ghost" href="#careFinder" data-onclick="return navTo(event,'#careFinder')"><span aria-hidden="true">📍</span> ${esc(UI[L].findCare)}</a>
        </div></div>`;
      bind();
      el.querySelector('.tri-level')?.focus?.();
      return;
    }

    // Signes d'urgence oui/non consécutifs : un seul écran de cases à cocher
    const run = engine.batchAt(session);
    if (run) {
      const n = session.history.length + 1;
      el.innerHTML = `<div class="tri-card">
        <p class="tri-step">${esc(UI[L].q)} ${n}</p>
        <h3 class="tri-question" id="triQ" tabindex="-1">${esc(UI[L].batchQ)}</h3>
        <fieldset class="tri-choices" aria-labelledby="triQ triMultiHint"><legend class="tri-help" id="triMultiHint">${esc(UI[L].batchHint)}</legend>
          ${run.map(id => { const tt = T(engine.nodes.get(id)); return `<label class="tri-check"><input type="checkbox" value="${id}"> <span>${esc(tokens(tt.texte))}${tt.aide ? `<br><small class="tri-help">${esc(tokens(tt.aide))}</small>` : ''}</span></label>`; }).join('')}
        </fieldset>
        <div class="tri-nav">
          <button type="button" class="tri-btn tri-btn-primary" id="triBatchYes" disabled>${esc(UI[L].next)}</button>
          <button type="button" class="tri-btn" id="triBatchNone">${esc(UI[L].none)}</button>
          <button type="button" class="tri-btn tri-btn-ghost" id="triBatchUnsure">${esc(UI[L].unsure)}</button>
        </div>
        ${pro ? `<p class="tri-meta">${esc(UI[L].node)} ${esc(run.join(', '))}</p>` : ''}
        ${draft}
        <div class="tri-nav">
          ${session.history.length ? `<button type="button" class="tri-btn tri-btn-ghost" id="triBack">${esc(UI[L].back)}</button>` : ''}
          ${session.history.length ? `<button type="button" class="tri-btn tri-btn-ghost" id="triRestart">${esc(UI[L].restart)}</button>` : ''}
        </div></div>`;
      bind();
      const boxes = [...el.querySelectorAll('.tri-check input')];
      const yes = el.querySelector('#triBatchYes');
      boxes.forEach(b => b.addEventListener('change', () => { yes.disabled = !boxes.some(x => x.checked); }));
      yes.addEventListener('click', () => { engine.answerBatch(session, run, boxes.find(b => b.checked).value); render(); });
      el.querySelector('#triBatchNone').addEventListener('click', () => { engine.answerBatch(session, run, null); render(); });
      el.querySelector('#triBatchUnsure').addEventListener('click', () => { engine.answerBatch(session, run, true); render(); });
      document.getElementById('triQ')?.focus({ preventScroll: true });
      return;
    }

    const t = T(node);
    const vis = engine.visibleChoices(node, session.tokens);
    // Libellés : on retrouve l'index du choix visible dans la liste complète pour prendre le bon texte traduit
    const label = c => t.choix[node.choix.indexOf(c)] || c.libelle;
    const multi = node.selection === 'multiple';
    const n = session.history.length + 1;
    el.innerHTML = `<div class="tri-card">
      <p class="tri-step">${esc(UI[L].q)} ${n}</p>
      <h3 class="tri-question" id="triQ" tabindex="-1">${esc(tokens(t.texte))}</h3>
      ${t.aide ? `<p class="tri-help">${esc(tokens(t.aide))}</p>` : ''}
      ${multi ? `<fieldset class="tri-choices" aria-labelledby="triQ triMultiHint"><legend class="tri-help" id="triMultiHint">${esc(UI[L].multi)}</legend>
          ${vis.map((c, i) => `<label class="tri-check"><input type="checkbox" value="${i}"> <span>${esc(tokens(label(c)))}</span></label>`).join('')}
        </fieldset><button type="button" class="tri-btn tri-btn-primary" id="triMultiNext" disabled>${esc(UI[L].next)}</button>`
      : `<div class="tri-choices" role="group" aria-labelledby="triQ">${vis.map((c, i) => `<button type="button" class="tri-btn tri-choice" data-i="${i}">${esc(tokens(label(c)))}</button>`).join('')}</div>`}
      ${pro ? `<p class="tri-meta">${esc(UI[L].node)} ${esc(node.id)} · ${esc(UI[L].source)} : ${esc(node.source)}</p>` : ''}
      ${draft}
      <div class="tri-nav">
        ${session.history.length ? `<button type="button" class="tri-btn tri-btn-ghost" id="triBack">${esc(UI[L].back)}</button>` : ''}
        ${session.history.length ? `<button type="button" class="tri-btn tri-btn-ghost" id="triRestart">${esc(UI[L].restart)}</button>` : ''}
      </div></div>`;
    bind();
    document.getElementById('triQ')?.focus({ preventScroll: true });
  }

  function bind() {
    const el = root();
    el.querySelector('#triCountry')?.addEventListener('change', e => {
      country = e.target.value;
      try { localStorage.setItem('biq-triage-country', country); } catch { /* stockage indisponible */ }
    });
    el.querySelector('#triStart')?.addEventListener('click', async () => {
      // Données chargées à la première utilisation seulement (≈ 350 Ko)
      const L = lang();
      el.querySelector('#triStart').disabled = true;
      try { await load(); session = engine.start(); render(); }
      catch { el.innerHTML = `<p class="tri-error" role="alert">${esc(tokens(UI[L].error))}</p>`; }
    });
    el.querySelector('#triBack')?.addEventListener('click', () => {
      engine.back(session);
      // Revenir au début d'un groupe de signes d'urgence plutôt qu'à son dernier élément
      while (session.history.length && engine.batchable(engine.current(session)) && engine.batchable(engine.nodes.get(session.history[session.history.length - 1].node))) engine.back(session);
      render();
    });
    el.querySelector('#triRestart')?.addEventListener('click', () => { session = engine.start(); render(); });
    el.querySelectorAll('.tri-choice').forEach(b => b.addEventListener('click', () => { engine.answer(session, Number(b.dataset.i)); render(); }));
    const boxes = [...el.querySelectorAll('.tri-check input')];
    const nextBtn = el.querySelector('#triMultiNext');
    boxes.forEach(b => b.addEventListener('change', () => { nextBtn.disabled = !boxes.some(x => x.checked); }));
    nextBtn?.addEventListener('click', () => { engine.answer(session, boxes.filter(b => b.checked).map(b => Number(b.value))); render(); });
  }

  async function init() {
    const el = root();
    if (!el || !window.BIQ_TRIAGE) return;
    country = detectCountry();
    render();
  }

  // Re-rendu au changement de langue ou de mode (textes patient ↔ soignant)
  window.BIQ_TRIAGE_UI = { init, render: () => { if (root()) render(); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
