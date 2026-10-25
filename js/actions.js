// ============================================================
// BreathIQ — Gestionnaires d'événements sans code en ligne (compatible CSP sans 'unsafe-inline')
// Les anciens attributs onclick="…" sont devenus data-onclick="…" (idem change, input, submit, keydown…).
// Leur contenu est ANALYSÉ, jamais évalué : seuls sont acceptés des appels de fonctions globales
// existantes, séparés par « ; », éventuellement précédés de « return », avec des arguments littéraux
// ('texte', nombres, true/false/null) ou les jetons event, this, this.value, this.checked.
// Un appel qui renvoie false annule l'action par défaut (comme « return false » en ligne).
// ============================================================
(function () {
  'use strict';

  const EVENTS = ['click', 'change', 'input', 'submit', 'keydown', 'error', 'load'];
  const cache = new Map();

  function parse(src) {
    if (cache.has(src)) return cache.get(src);
    const calls = [];
    let i = 0;
    const s = src;
    const ws = () => { while (i < s.length && /\s/.test(s[i])) i++; };
    const ident = () => { const m = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*/.exec(s.slice(i)); if (!m) throw new Error('nom attendu'); i += m[0].length; return m[0]; };
    function arg() {
      ws();
      if (s[i] === "'" || s[i] === '"') {
        const q = s[i++]; let out = '';
        while (i < s.length && s[i] !== q) { if (s[i] === '\\' && i + 1 < s.length) { out += s[i + 1]; i += 2; } else out += s[i++]; }
        if (s[i++] !== q) throw new Error('chaîne non fermée');
        return { lit: out };
      }
      const num = /^-?\d+(?:\.\d+)?/.exec(s.slice(i));
      if (num) { i += num[0].length; return { lit: Number(num[0]) }; }
      const id = ident();
      if (id === 'true' || id === 'false') return { lit: id === 'true' };
      if (id === 'null') return { lit: null };
      if (['event', 'this', 'this.value', 'this.checked'].includes(id)) return { tok: id };
      throw new Error(`argument non autorisé : ${id}`);
    }
    while (true) {
      ws();
      if (i >= s.length) break;
      if (s.startsWith('return', i) && /\s/.test(s[i + 6] || '')) { i += 6; ws(); }
      if (s.startsWith('false', i)) { i += 5; calls.push({ returnFalse: true }); }
      else {
        const fn = ident(); ws();
        if (s[i++] !== '(') throw new Error('« ( » attendue');
        const args = []; ws();
        if (s[i] !== ')') { args.push(arg()); ws(); while (s[i] === ',') { i++; args.push(arg()); ws(); } }
        if (s[i++] !== ')') throw new Error('« ) » attendue');
        calls.push({ fn, args });
      }
      ws();
      if (s[i] === ';') i++;
    }
    cache.set(src, calls);
    return calls;
  }

  function resolve(path) {
    let ctx = window, fn = window;
    for (const part of path.split('.')) { ctx = fn; fn = fn?.[part]; }
    return typeof fn === 'function' ? { fn, ctx } : null;
  }

  function run(el, type, e) {
    const src = el.getAttribute(`data-on${type}`);
    let calls;
    try { calls = parse(src); } catch (err) { console.warn('[BreathIQ] action ignorée', src, err.message); return; }
    for (const c of calls) {
      if (c.returnFalse) { e.preventDefault(); continue; }
      const r = resolve(c.fn);
      if (!r) { console.warn('[BreathIQ] fonction inconnue', c.fn); continue; }
      const args = c.args.map(a => 'lit' in a ? a.lit
        : a.tok === 'event' ? e : a.tok === 'this' ? el : a.tok === 'this.value' ? el.value : el.checked);
      if (r.fn.apply(r.ctx, args) === false) e.preventDefault();
    }
  }

  for (const type of EVENTS) {
    document.addEventListener(type, e => {
      const el = e.target.closest?.(`[data-on${type}]`);
      if (el) run(el, type, e);
    }, type === 'submit' || type === 'error' || type === 'load'); // submit et error (images) ne remontent pas : phase de capture
  }

  // Petites fonctions remplaçant les cas en ligne non triviaux
  window.BIQ_ACT = {
    clickById: id => { document.getElementById(id)?.click(); },
    scrollToId: id => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
    removeById: id => { document.getElementById(id)?.remove(); },
    showById: id => { document.getElementById(id)?.removeAttribute('hidden'); },
    hideById: id => { document.getElementById(id)?.setAttribute('hidden', ''); },
    hide: el => { el.style.display = 'none'; },
    // Entrée ou Espace sur un élément role="button" : appelle la fonction indiquée
    activate: (e, fnName, ...args) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const r = resolve(fnName); r?.fn.apply(r.ctx, args); } },
    setMediaAll: el => { el.media = 'all'; },
    scrollTop: () => { window.scrollTo({ top: 0, behavior: 'smooth' }); },
    onEnter: (e, fnName) => { if (e.key === 'Enter') { e.preventDefault(); const r = resolve(fnName); r?.fn.apply(r.ctx); } },
    digitsOnly: (el, max) => { el.value = el.value.replace(/\D/g, '').slice(0, max); },
  };
  window.BIQ_ACTIONS = { parse };
  // Feuilles de style chargées en différé (media="print" → "all") : appliquées même si leur événement
  // « load » a eu lieu avant ce script
  document.querySelectorAll('link[data-onload][media="print"]').forEach(l => { l.media = 'all'; });
})();
