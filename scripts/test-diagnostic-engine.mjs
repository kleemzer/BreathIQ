// ============================================================
// BreathIQ — Tests unitaires : moteur diagnostique + Z-score
// Exécution : node scripts/test-diagnostic-engine.mjs
// © 2026 Dr. Clément MÉDEAU
//
// Ces tests couvrent les chemins médico-légaux critiques :
//   - Orientations d'urgence absolue (ROUGE / ORANGE)
//   - Pathogènes à déclaration obligatoire
//   - Score Z-score épidémique (seuils OMS 7-1-7)
//   - Edge cases (no symptom, alarm only, comorbidités)
// ============================================================

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { runDiagnosticEngine, computeZScore, PATHOGENS, ALARM_RULES, ORIENTATION } = require('../js/diagnostic-engine.js');

// ── Utilitaires ───────────────────────────────────────────────
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    failed++;
    console.error(`  ❌ FAIL : ${message}`);
    // Ne pas lancer pour laisser tourner tous les tests
  } else {
    passed++;
  }
}

function group(name, fn) {
  console.log(`\n🧪 ${name}`);
  fn();
}

// ── Helpers ───────────────────────────────────────────────────
function mkState(overrides = {}) {
  return {
    symptoms: [],
    alarm:    [],
    ctx:      [],
    onset:    'unknown',
    fever:    'unknown',
    age:      'adult',
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────
// BLOC 1 — Structure et exports du module
// ─────────────────────────────────────────────────────────────
group('Module exports', () => {
  assert(typeof runDiagnosticEngine === 'function', 'runDiagnosticEngine doit être une fonction');
  assert(typeof computeZScore === 'function', 'computeZScore doit être une fonction');
  assert(typeof PATHOGENS === 'object' && Object.keys(PATHOGENS).length >= 9, 'PATHOGENS doit avoir ≥ 9 entrées');
  assert(Array.isArray(ALARM_RULES) && ALARM_RULES.length >= 10, 'ALARM_RULES doit avoir ≥ 10 règles');
  assert(typeof ORIENTATION === 'object' && 'ROUGE' in ORIENTATION && 'VERT' in ORIENTATION, 'ORIENTATION doit avoir ROUGE et VERT');
});

// ─────────────────────────────────────────────────────────────
// BLOC 2 — Règles d'alarme ROUGE (urgences vitales)
// Ces cas doivent TOUJOURS orienter vers ROUGE — zéro tolérance
// ─────────────────────────────────────────────────────────────
group('Alarmes ROUGE — urgences vitales', () => {
  // 2a. Purpura → méningococcémie
  {
    const r = runDiagnosticEngine(mkState({ alarm: ['purpura'] }));
    assert(r.orientLevel === 'ROUGE', 'Purpura seul doit orienter ROUGE (méningococcémie)');
    assert(r.alarmReason != null, 'Purpura doit avoir une raison d\'alarme');
  }

  // 2b. Saignements actifs → FHV (Ebola/Marburg)
  {
    const r = runDiagnosticEngine(mkState({ alarm: ['bleeding'] }));
    assert(r.orientLevel === 'ROUGE', 'Saignements actifs doivent orienter ROUGE (FHV possible)');
  }

  // 2c. Cyanose → hypoxémie sévère
  {
    const r = runDiagnosticEngine(mkState({ alarm: ['cyanosis'] }));
    assert(r.orientLevel === 'ROUGE', 'Cyanose doit orienter ROUGE (hypoxémie)');
  }

  // 2d. Convulsions
  {
    const r = runDiagnosticEngine(mkState({ alarm: ['seizures'] }));
    assert(r.orientLevel === 'ROUGE', 'Convulsions doivent orienter ROUGE');
  }

  // 2e. Apnées (nourrisson)
  {
    const r = runDiagnosticEngine(mkState({ alarm: ['apnea'] }));
    assert(r.orientLevel === 'ROUGE', 'Apnées doivent orienter ROUGE');
  }

  // 2f. Syndrome méningé : raideur nuque + fièvre haute
  {
    const r = runDiagnosticEngine(mkState({ alarm: ['neck_stiffness_alarm'], fever: 'fever_high' }));
    assert(r.orientLevel === 'ROUGE', 'Raideur nuque + fièvre haute → ROUGE (méningite)');
  }
});

// ─────────────────────────────────────────────────────────────
// BLOC 3 — Règles ORANGE (urgences médicales)
// ─────────────────────────────────────────────────────────────
group('Alarmes ORANGE — urgences médicales', () => {
  // 3a. Dyspnée au repos
  {
    const r = runDiagnosticEngine(mkState({ alarm: ['dyspnea_rest'] }));
    assert(r.orientLevel === 'ORANGE', 'Dyspnée au repos → ORANGE');
  }

  // 3b. Confusion isolée
  {
    const r = runDiagnosticEngine(mkState({ alarm: ['confusion'] }));
    assert(r.orientLevel === 'ORANGE', 'Confusion → ORANGE');
  }

  // 3c. Immunodéprimé + fièvre haute
  {
    const r = runDiagnosticEngine(mkState({ ctx: ['immunocompromised'], fever: 'fever_high' }));
    assert(r.orientLevel === 'ORANGE', 'Immunodéprimé + fièvre haute → ORANGE (neutropénie fébrile)');
  }

  // 3d. Retour zone Ebola + fièvre haute
  {
    const r = runDiagnosticEngine(mkState({ ctx: ['travel_africa_high_risk'], fever: 'fever_high' }));
    assert(r.orientLevel === 'ORANGE', 'Retour Afrique sub-saharienne + fièvre → ORANGE');
  }

  // 3e. Nourrisson + fièvre haute
  {
    const r = runDiagnosticEngine(mkState({ age: 'infant', fever: 'fever_high' }));
    assert(r.orientLevel === 'ORANGE', 'Nourrisson + fièvre haute → ORANGE');
  }

  // 3f. Hémoptysie (crachats sanglants)
  {
    const r = runDiagnosticEngine(mkState({ symptoms: ['hemoptysis'] }));
    assert(r.orientLevel === 'ORANGE', 'Hémoptysie → ORANGE (TBK/EP à explorer)');
  }

  // 3g. Senior + dyspnée repos
  {
    const r = runDiagnosticEngine(mkState({ age: 'senior', alarm: ['dyspnea_rest'] }));
    assert(r.orientLevel === 'ORANGE', 'Senior + dyspnée repos → ORANGE');
  }
});

// ─────────────────────────────────────────────────────────────
// BLOC 4 — Escalade de niveau (la règle la plus sévère gagne)
// ─────────────────────────────────────────────────────────────
group('Escalade — la règle la plus sévère gagne', () => {
  // ORANGE + ROUGE simultanés → doit retourner ROUGE
  {
    const r = runDiagnosticEngine(mkState({ alarm: ['confusion', 'purpura'] }));
    assert(r.orientLevel === 'ROUGE', 'Confusion (ORANGE) + Purpura (ROUGE) → ROUGE doit gagner');
  }

  // JAUNE par défaut + signe d'alarme ROUGE → ROUGE
  {
    const r = runDiagnosticEngine(mkState({
      symptoms: ['fever', 'dry_cough', 'headache', 'fatigue_severe'],
      fever: 'fever_high',
      alarm: ['bleeding'],
    }));
    assert(r.orientLevel === 'ROUGE', 'Grippe probable + saignements → ROUGE (FHV à exclure)');
  }
});

// ─────────────────────────────────────────────────────────────
// BLOC 5 — Orientation par défaut (sans alarme)
// ─────────────────────────────────────────────────────────────
group('Orientations par défaut (sans alarme)', () => {
  // Aucun symptôme → orientLevel null
  {
    const r = runDiagnosticEngine(mkState());
    assert(r.orientLevel === null, 'Aucun symptôme → orientLevel doit être null');
    assert(r.ranked.length === 0 || r.ranked[0].pct < 50, 'Aucun symptôme → pas de diagnostic dominant');
  }

  // Un seul symptôme léger → VERT
  {
    const r = runDiagnosticEngine(mkState({ symptoms: ['sore_throat'] }));
    assert(r.orientLevel === 'VERT', 'Mal de gorge seul → VERT (surveillance domicile)');
  }

  // Fièvre haute seule dans les contextes (sans symptôme coché) → null (info insuffisante)
  {
    const r = runDiagnosticEngine(mkState({ fever: 'fever_high' }));
    assert(r.orientLevel === null, 'Contexte fièvre seul sans symptôme coché → null (info insuffisante — comportement correct)');
  }

  // Fièvre haute cochée comme symptôme + contexte → BLEU ou JAUNE
  {
    const r = runDiagnosticEngine(mkState({ symptoms: ['fever'], fever: 'fever_high' }));
    assert(['BLEU', 'JAUNE'].includes(r.orientLevel), 'Fièvre symptôme + contexte fever_high → BLEU ou JAUNE');
  }

  // Tableau grippal complet → JAUNE (médecin de garde)
  {
    const r = runDiagnosticEngine(mkState({
      symptoms: ['fever', 'dry_cough', 'headache', 'myalgias', 'fatigue_severe'],
      onset: 'sudden',
      fever: 'fever_high',
    }));
    assert(['JAUNE', 'ORANGE'].includes(r.orientLevel), 'Grippe franche → JAUNE ou ORANGE');
  }
});

// ─────────────────────────────────────────────────────────────
// BLOC 6 — Moteur de scoring : pathogènes prioritaires
// ─────────────────────────────────────────────────────────────
group('Scoring — pathogènes prioritaires', () => {
  // Anosmie + toux sèche → COVID-19 en tête
  {
    const r = runDiagnosticEngine(mkState({ symptoms: ['smell_loss', 'taste_loss', 'dry_cough'] }));
    assert(r.ranked.length > 0, 'Anosmie + toux sèche → au moins un pathogène scoré');
    assert(r.ranked[0].pid === 'COVID19', `COVID-19 attendu en tête, got: ${r.ranked[0].pid}`);
  }

  // Toux 3 semaines + sueurs nocturnes + amaigrissement → tuberculose
  {
    const r = runDiagnosticEngine(mkState({
      symptoms: ['persistent_cough', 'night_sweats', 'weight_loss'],
      onset: 'weeks',
    }));
    const topThree = r.ranked.slice(0, 3).map(d => d.pid);
    assert(topThree.includes('TUBERCULOSIS'), `Tuberculose attendue dans le top 3, got: ${topThree.join(', ')}`);
  }

  // Fièvre brutale + myalgies + début brutal → grippe
  {
    const r = runDiagnosticEngine(mkState({
      symptoms: ['fever', 'myalgias', 'dry_cough', 'headache'],
      onset: 'sudden',
      fever: 'fever_very_high',
    }));
    const topTwo = r.ranked.slice(0, 2).map(d => d.pid);
    assert(topTwo.includes('INFLUENZA'), `Grippe attendue dans le top 2, got: ${topTwo.join(', ')}`);
  }

  // Contact volailles + fièvre très haute + dyspnée → H5N1
  {
    const r = runDiagnosticEngine(mkState({
      symptoms: ['dyspnea', 'fever', 'myalgias'],
      ctx: ['poultry_contact'],
      fever: 'fever_very_high',
    }));
    const topThree = r.ranked.slice(0, 3).map(d => d.pid);
    assert(topThree.includes('H5N1'), `H5N1 attendu dans le top 3 (contact volailles), got: ${topThree.join(', ')}`);
  }

  // Retour tropical + fièvre + arthralgies → Dengue
  {
    const r = runDiagnosticEngine(mkState({
      symptoms: ['fever', 'arthralgia', 'retrobulbar_pain'],
      ctx: ['travel_tropical'],
      fever: 'fever_high',
    }));
    const topTwo = r.ranked.slice(0, 2).map(d => d.pid);
    assert(topTwo.includes('DENGUE'), `Dengue attendue dans le top 2 (voyage tropical), got: ${topTwo.join(', ')}`);
  }
});

// ─────────────────────────────────────────────────────────────
// BLOC 7 — Propriétés de sécurité du moteur
// ─────────────────────────────────────────────────────────────
group('Propriétés de sécurité', () => {
  // Les scores ne doivent jamais être négatifs
  {
    const r = runDiagnosticEngine(mkState({ symptoms: ['smell_loss', 'bleeding', 'neck_stiffness'] }));
    const allPositive = Object.values(r.scores).every(s => s >= 0);
    assert(allPositive, 'Tous les scores pathogènes doivent être ≥ 0 (pas de valeur négative)');
  }

  // ranked doit être trié par score décroissant
  {
    const r = runDiagnosticEngine(mkState({ symptoms: ['fever', 'dry_cough', 'myalgias'] }));
    for (let i = 0; i < r.ranked.length - 1; i++) {
      assert(r.ranked[i].raw >= r.ranked[i+1].raw, `ranked[${i}] doit être ≥ ranked[${i+1}]`);
    }
  }

  // flags doit être un Set
  {
    const r = runDiagnosticEngine(mkState({ symptoms: ['fever'] }));
    assert(r.flags instanceof Set, 'flags doit être un Set');
  }

  // Entrée vide ne doit pas lever d'exception
  {
    let threw = false;
    try { runDiagnosticEngine({}); } catch { threw = true; }
    assert(!threw, 'runDiagnosticEngine({}) ne doit pas lever d\'exception');
  }

  // Entrée avec valeurs inconnues doit être tolérée
  {
    let threw = false;
    try {
      runDiagnosticEngine(mkState({ symptoms: ['unknown_symptom_xyz'], alarm: ['unknown_alarm_abc'] }));
    } catch { threw = true; }
    assert(!threw, 'Symptômes inconnus ne doivent pas lever d\'exception');
  }
});

// ─────────────────────────────────────────────────────────────
// BLOC 8 — Z-score épidémique (algorithme OMS 7-1-7)
// ─────────────────────────────────────────────────────────────
group('Z-score — seuils OMS 7-1-7', () => {
  // 8a. Pas d'épidémie : valeurs dans la norme
  {
    const r = computeZScore(5, [4, 5, 4, 6, 5, 4, 5, 5]);
    assert(r.level === 'NORMAL', `Valeurs normales → NORMAL, got ${r.level} (z=${r.zscore})`);
    assert(typeof r.zscore === 'number', 'zscore doit être un nombre');
    assert(typeof r.mean === 'number', 'mean doit être un nombre');
  }

  // 8b. Vigilance (z ≥ 1.5) — augmentation inhabituelle
  {
    const history = [2, 2, 3, 2, 2, 3, 2, 2]; // mean ≈ 2.25, std ≈ 0.43
    const current = 3; // z = (3-2.25)/0.43 ≈ 1.7
    const r = computeZScore(current, history);
    assert(['JAUNE', 'ORANGE', 'ROUGE'].includes(r.level), `z≥1.5 → JAUNE/ORANGE/ROUGE, got ${r.level} (z=${r.zscore})`);
  }

  // 8c. Signal épidémique (z ≥ 2.0)
  {
    const history = [1, 1, 2, 1, 1, 2, 1, 1]; // mean ≈ 1.25, std ≈ 0.43
    const current = 3; // z ≈ 4.1
    const r = computeZScore(current, history);
    assert(['ORANGE', 'ROUGE'].includes(r.level), `z≥2 → ORANGE ou ROUGE, got ${r.level} (z=${r.zscore})`);
  }

  // 8d. Épidémie confirmée (z ≥ 3.0)
  {
    const history = [2, 2, 2, 2, 2, 2, 2, 2]; // mean=2, std=0 → forced to 1
    const current = 10; // z = (10-2)/1 = 8.0
    const r = computeZScore(current, history);
    assert(r.level === 'ROUGE', `z≥3 → ROUGE, got ${r.level} (z=${r.zscore})`);
    assert(r.zscore >= 3.0, `zscore doit être ≥ 3.0, got ${r.zscore}`);
  }

  // 8e. Historique plat à zéro (cas extrême — std forcé à 1)
  {
    const history = [0, 0, 0, 0, 0, 0, 0, 0];
    const r = computeZScore(0, history);
    assert(r.level === 'NORMAL', `Historique plat + current=0 → NORMAL, got ${r.level}`);
    assert(!isNaN(r.zscore) && isFinite(r.zscore), 'zscore doit être fini (pas NaN/Infinity)');
  }

  // 8f. Historique vide
  {
    const r = computeZScore(5, []);
    assert(!isNaN(r.zscore), 'Historique vide → zscore ne doit pas être NaN');
    assert(r.level === 'NORMAL', 'Historique vide → NORMAL par défaut');
  }

  // 8g. Valeur négative impossible — zscore arrondi à 1 décimale
  {
    const r = computeZScore(3, [4, 5, 6, 5, 4, 5, 6, 5]);
    assert(typeof r.zscore === 'number', 'zscore type number');
    // Vérifier arrondi à 1 décimale
    const rounded = Math.round(r.zscore * 10) / 10;
    assert(r.zscore === rounded, `zscore doit être arrondi à 1 décimale, got ${r.zscore}`);
  }
});

// ─────────────────────────────────────────────────────────────
// BLOC 9 — Intégrité des données des pathogènes
// ─────────────────────────────────────────────────────────────
group('Intégrité des données — PATHOGENS', () => {
  for (const [pid, p] of Object.entries(PATHOGENS)) {
    assert(typeof p.nameFR === 'string' && p.nameFR.length > 3, `${pid}: nameFR manquant ou trop court`);
    assert(typeof p.nameEN === 'string' && p.nameEN.length > 3, `${pid}: nameEN manquant ou trop court`);
    assert(typeof p.prior === 'number' && p.prior >= 0, `${pid}: prior doit être un nombre ≥ 0`);
    assert(typeof p.weights === 'object', `${pid}: weights doit être un objet`);
    assert(typeof p.protection === 'string' && p.protection.length > 0, `${pid}: protection manquant`);
    assert(typeof p.mandatoryReport === 'boolean', `${pid}: mandatoryReport doit être boolean`);
    assert(typeof p.isolationFR === 'string' && p.isolationFR.length > 5, `${pid}: isolationFR manquant`);
    assert(Array.isArray(p.alarmSigns), `${pid}: alarmSigns doit être un tableau`);
  }
});

// ─────────────────────────────────────────────────────────────
// BLOC 10 — Intégrité des règles d'alarme
// ─────────────────────────────────────────────────────────────
group('Intégrité des règles d\'alarme — ALARM_RULES', () => {
  const validLevels = new Set(['VERT', 'BLEU', 'JAUNE', 'ORANGE', 'ROUGE']);
  for (const [i, rule] of ALARM_RULES.entries()) {
    assert(Array.isArray(rule.triggers) && rule.triggers.length > 0, `Règle ${i}: triggers doit être un tableau non vide`);
    assert(validLevels.has(rule.level), `Règle ${i}: niveau invalide "${rule.level}"`);
    assert(typeof rule.reason === 'string' && rule.reason.length > 10, `Règle ${i}: reason trop courte`);
  }

  // Vérifier que toutes les règles ROUGE ont bien des triggers médicalement justifiés
  const rougeRules = ALARM_RULES.filter(r => r.level === 'ROUGE');
  assert(rougeRules.length >= 4, `Doit y avoir ≥ 4 règles ROUGE, got ${rougeRules.length}`);
  const rougeTriggers = rougeRules.flatMap(r => r.triggers);
  assert(rougeTriggers.includes('purpura'), 'Purpura doit être un trigger ROUGE');
  assert(rougeTriggers.includes('bleeding'), 'Saignements doivent être un trigger ROUGE');
  assert(rougeTriggers.includes('cyanosis'), 'Cyanose doit être un trigger ROUGE');
});

// ─────────────────────────────────────────────────────────────
// Résumé final
// ─────────────────────────────────────────────────────────────
const total = passed + failed;
console.log(`\n${'─'.repeat(50)}`);
if (failed === 0) {
  console.log(`✅ ${passed}/${total} tests passés — Moteur diagnostique validé`);
  process.exit(0);
} else {
  console.log(`❌ ${failed}/${total} tests ÉCHOUÉS`);
  console.log(`   ${passed} passés · ${failed} échoués`);
  process.exit(1);
}
