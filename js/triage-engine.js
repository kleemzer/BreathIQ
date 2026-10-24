// ============================================================
// BreathIQ — Moteur de l'arbre de triage infectieux (data/triage.json)
// Logique pure, sans DOM : testée par scripts/test-triage.mjs.
// Source clinique : docs/triage/arbre-fusion.json + ARBITRAGES.md (brouillon à valider par un médecin).
// Règle de fusion : niveau final = max(niveau du résultat, planchers applicables) ; un relèvement
// ajoute au plus +1 et ne dépasse jamais consultation_urgente ; le niveau ne descend jamais.
// Outil d'information et d'orientation — non dispositif médical, ne remplace pas un avis médical.
// ============================================================
(function initTriage(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.BIQ_TRIAGE = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, function triageFactory() {
  'use strict';

  // Groupes de fragilité dédoublonnés pour le token calculé « cumul_2_groupes »
  const GROUPES = [
    ['pop_chimio', 'pop_immunodeprime'], ['pop_asplenie'], ['pop_grossesse', 'pop_post_partum'],
    ['pop_65_plus'], ['pop_diabete', 'pop_diabete_desequilibre'], ['pop_insuffisance_organe'],
    ['pop_nourrisson_moins_3m'],
  ];

  // Évaluateur d'expressions booléennes sur des tokens : identifiants, !, &&, ||, parenthèses.
  // Aucune évaluation de code (pas de Function/eval). Renvoie null si l'expression n'est pas
  // une expression de tokens (ex. « Toujours, après le filtre d'urgence »).
  // known (facultatif) : ensemble des tokens existants ; un identifiant inconnu (« toujours »…) → null
  function evalCondition(expr, has, known) {
    if (expr == null || expr === '' || expr === true) return true;
    const src = String(expr).trim();
    if (!/^[A-Za-z0-9_\s!&|()]+$/.test(src)) return null;
    const toks = src.match(/&&|\|\||!|\(|\)|[A-Za-z_][A-Za-z0-9_]*/g) || [];
    if (known && toks.some(t => /^[A-Za-z_]/.test(t) && !['true', 'false', 'cumul_2_groupes'].includes(t) && !known.has(t))) return null;
    let i = 0;
    const peek = () => toks[i];
    const take = () => toks[i++];
    function primary() {
      const t = take();
      if (t === '!') return !primary();
      if (t === '(') { const v = or(); if (take() !== ')') throw new Error('parenthèse'); return v; }
      if (t === 'true') return true;
      if (t === 'false') return false;
      if (t === 'cumul_2_groupes') return GROUPES.filter(g => g.some(has)).length >= 2;
      if (!t || !/^[A-Za-z_]/.test(t)) throw new Error('jeton inattendu');
      return has(t);
    }
    function and() { let v = primary(); while (peek() === '&&') { take(); const r = primary(); v = v && r; } return v; }
    function or() { let v = and(); while (peek() === '||') { take(); const r = and(); v = v || r; } return v; }
    try { const v = or(); return i === toks.length ? v : null; } catch { return null; }
  }

  function createEngine(data) {
    const nodes = new Map(data.noeuds.map(n => [n.id, n]));
    const LV = data.niveaux_ordre;
    const rank = lvl => LV.indexOf(lvl);
    const capRaise = rank('consultation_urgente');
    // Tous les tokens qu'une réponse peut poser : seules les conditions qui les citent sont évaluées
    const known = new Set();
    for (const n of data.noeuds) for (const c of n.choix || []) for (const t of [].concat(c.pose || [])) if (t) known.add(t);
    const cond = (expr, tokens) => evalCondition(expr, t => tokens.has(t), known);

    function isActive(node, tokens) {
      if (!node.condition_activation) return true;
      const v = cond(node.condition_activation, tokens);
      return v === null ? true : v;
    }
    function visibleChoices(node, tokens) {
      return (node.choix || []).filter(c => {
        if (!c.condition_activation) return true;
        const v = cond(c.condition_activation, tokens);
        return v === null ? true : v;
      });
    }
    // Un nœud inactif est franchi par sa réponse « Non » (sinon la première réponse)
    function skipTarget(node) {
      const no = (node.choix || []).find(c => /^non\b/i.test(c.libelle));
      return (no || node.choix[0]).vers;
    }

    // Résout le prochain nœud à afficher en franchissant les nœuds inactifs
    function resolve(id, tokens) {
      let cur = id, guard = 0;
      while (guard++ < 50) {
        const n = nodes.get(cur);
        if (!n) throw new Error(`Nœud introuvable : ${cur}`);
        if (n.type === 'question' && !isActive(n, tokens)) { cur = skipTarget(n); continue; }
        return n;
      }
      throw new Error('Boucle de nœuds inactifs');
    }

    function finalLevel(resultNode, tokens) {
      const base = resultNode.type === 'urgence' ? rank('urgence_vitale') : rank(resultNode.niveau_orientation);
      let floor = base, raise = false, redirect = null;
      const applied = [];
      for (const r of data.regles_modulation || []) {
        if (r.id === 'MODG' || !r.condition) continue;
        if (!evalCondition(r.condition, t => tokens.has(t))) continue;
        if (r.effet === 'plancher' && rank(r.valeur) >= 0) {
          if (rank(r.valeur) > floor) { floor = rank(r.valeur); if (r.resultat && nodes.has(r.resultat)) redirect = r.resultat; }
          applied.push(r.id);
        } else if (r.effet === 'relever') { raise = true; applied.push(r.id); }
      }
      const raised = raise ? Math.min(capRaise, base + 1) : base;
      const lvl = Math.max(floor, raised, base);
      return { level: LV[lvl], rank: lvl, baseLevel: LV[base], applied, redirect: redirect && rank(nodes.get(redirect).niveau_orientation) === lvl ? redirect : null };
    }

    // Session : historique des réponses, retour arrière exact
    function start() {
      const s = { history: [], tokens: new Set(), current: null, result: null };
      s.current = resolve(data.racine, s.tokens).id;
      return s;
    }
    function current(s) { return nodes.get(s.current); }
    // indices : indices des choix VISIBLES sélectionnés (plusieurs si sélection multiple)
    function answer(s, indices) {
      const node = nodes.get(s.current);
      const vis = visibleChoices(node, s.tokens);
      const sel = [].concat(indices).map(i => vis[i]).filter(Boolean);
      if (!sel.length) throw new Error('Aucune réponse');
      const added = [];
      for (const c of sel) for (const t of [].concat(c.pose || [])) if (t && !s.tokens.has(t)) { s.tokens.add(t); added.push(t); }
      // Sélection multiple : la suite commune est celle de la majorité des réponses ; un choix qui mène
      // ailleurs (ex. grossesse → questions obstétricales) est prioritaire
      const counts = {};
      for (const c of vis) counts[c.vers] = (counts[c.vers] || 0) + 1;
      const common = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
      const next = (sel.find(c => c.vers !== common) || sel[0]).vers;
      s.history.push({ node: node.id, labels: sel.map(c => c.libelle), added });
      const n = resolve(next, s.tokens);
      s.current = n.id;
      s.result = n.type === 'question' ? null : { node: n.id, ...finalLevel(n, s.tokens) };
      return s;
    }
    function back(s) {
      const h = s.history.pop();
      if (!h) return s;
      h.added.forEach(t => s.tokens.delete(t));
      s.current = h.node;
      s.result = null;
      return s;
    }

    return { nodes, levels: LV, start, current, answer, back, visibleChoices, finalLevel, resolve, evalCondition };
  }

  return { createEngine, evalCondition, GROUPES };
});
