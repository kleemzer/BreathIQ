// Rejoue les 90 vignettes du relecteur indépendant (docs/triage/E-vignettes-arbitrage.json) dans le
// moteur du site (js/triage-engine.js + data/triage.json) et vérifie :
//   1. aucun faux négatif grave par rapport à l'attendu (arbitré s'il existe) ;
//   2. le même niveau que la simulation indépendante du relecteur ;
//   3. la structure : toutes les cibles existent, aucun résultat sans texte patient/soignant fr/en.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const root = join(new URL('..', import.meta.url).pathname);
const require = createRequire(import.meta.url);
const { createEngine, evalCondition } = require(join(root, 'js/triage-engine.js'));
const data = JSON.parse(readFileSync(join(root, 'data/triage.json'), 'utf8'));
const vignettes = JSON.parse(readFileSync(join(root, 'docs/triage/E-vignettes-arbitrage.json'), 'utf8'));
const eng = createEngine(data);
const LV = data.niveaux_ordre;

let failures = 0;
const check = (label, cond, detail = '') => { if (!cond) failures++; if (!cond || process.env.VERBOSE) console.log(`${cond ? '✅' : '❌'} ${label}${detail ? ' — ' + detail : ''}`); };

// ── Structure ──
for (const n of data.noeuds) for (const c of n.choix) check(`${n.id} → ${c.vers} existe`, eng.nodes.has(c.vers));
for (const n of data.noeuds.filter(n => n.type !== 'question'))
  for (const who of ['patient', 'soignant']) for (const lang of ['fr', 'en'])
    check(`${n.id} ${who}.${lang} : texte et rappel`, !!(n.t[who][lang].texte && n.t[who][lang].rappel));

// ── Évaluateur d'expressions ──
const has = s => t => s.includes(t);
check('expr &&/||/!', evalCondition('a && (b || !c)', has(['a'])) === true && evalCondition('a && b', has(['a'])) === false);
check('texte libre → null', evalCondition("Toujours, après le filtre d'urgence", has([])) === null);

// ── Vignettes ──
let replayed = 0, fng = 0, same = 0;
for (const v of vignettes) {
  const steps = v.chemin.filter(x => /^[A-Z][A-Z0-9_]*=/.test(x));
  const s = eng.start();
  let ok = true;
  for (const st of steps) {
    const [id, lbl] = [st.slice(0, st.indexOf('=')), st.slice(st.indexOf('=') + 1)];
    if (s.result) break;
    if (s.current !== id) {
      // Nœud franchi par le moteur (inactif) ou chemin du relecteur différent : on s'aligne si possible
      if (!s.history.some(h => h.node === id)) { ok = false; break; }
      continue;
    }
    const vis = eng.visibleChoices(eng.nodes.get(id), s.tokens);
    const idx = vis.findIndex(c => c.libelle.startsWith(lbl) || c.libelle.slice(0, 30) === lbl);
    if (idx < 0) { ok = false; break; }
    eng.answer(s, idx);
    // Le relecteur ne consigne qu'une réponse de POP01 (sélection multiple) : on restitue les autres
    // situations à partir des règles de modulation qu'il a vu s'appliquer
    if (id === 'POP01') for (const m of v.chemin.filter(x => x.startsWith('mod:'))) {
      const r = data.regles_modulation.find(r => r.id === m.slice(4));
      for (const t of (r?.condition || '').match(/(?<!!)\bpop_[a-z0-9_]+/g) || []) s.tokens.add(t);
    }
  }
  if (!ok || !s.result) { check(`${v.id} rejouable`, false, `bloqué à ${s.current}`); continue; }
  replayed++;
  const expected = v.attendu_arbitre || v.attendu;
  const got = s.result.level;
  const under = LV.indexOf(got) < LV.indexOf(expected);
  if (v.grave && under) fng++;
  check(`${v.id} pas de faux négatif grave`, !(v.grave && under), `attendu ${expected}, obtenu ${got}`);
  // Les vignettes à plusieurs situations (POP01) ne sont rejouées qu'avec la première : on n'exige alors que l'absence de faux négatif
  const multi = (v.chemin.find(x => x.startsWith('POP01=')) || '').length && v.chemin.some(x => x.startsWith('mod:'));
  if (got === v.obtenu) same++;
  else if (!multi) check(`${v.id} même niveau que le relecteur`, false, `relecteur ${v.obtenu}, moteur ${got}`);
}
console.log(`\nVignettes rejouées : ${replayed}/${vignettes.length} · faux négatifs graves : ${fng} · identiques au relecteur : ${same}`);
console.log(failures ? `\n${failures} échec(s)` : 'Tous les tests du triage passent');
process.exit(failures ? 1 : 0);
