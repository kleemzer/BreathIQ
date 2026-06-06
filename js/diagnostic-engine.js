// ============================================================
// BreathIQ — Diagnostic Engine (module testable)
// Moteur d'orientation symptomatique — logique pure, sans DOM.
// © 2026 Dr. Clément MÉDEAU — Non dispositif médical (UE 2017/745)
//
// Pattern UMD identique à clinical-orientation.js :
//   - Browser : window.BIQ_DIAG
//   - Node.js  : module.exports
// ============================================================
(function initDiagnosticEngine(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.BIQ_DIAG = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, function diagnosticEngineFactory() {
  'use strict';

  // ── Pathogens ──────────────────────────────────────────────
  // Chaque pathogène a :
  //   prior     : probabilité a priori (0–100)
  //   weights   : { flag: delta_score } — positif = évoque, négatif = écarte
  //   alarmSigns: si présents → escalade systématique
  //   protection: EPI recommandé
  //   mandatoryReport: déclaration obligatoire ARS/DSP
  const PATHOGENS = {
    INFLUENZA: {
      nameFR: 'Grippe (Influenza A/B)',       nameEN: 'Influenza A/B',         icon: '🤒',
      prior: 22,
      weights: {
        onset_sudden:20, fever_high:20, fever_very_high:25, myalgias:22,
        fatigue_severe:18, dry_cough:15, headache:10, sore_throat:8, shivering:12,
        smell_loss:-15, cough_3w:-25, night_sweats:-10, weight_loss:-20,
        rash:-15, bleeding:-30, neck_stiffness:-20, duration_weeks:-25,
      },
      alarmSigns:['dyspnea_rest','confusion','chest_pain'],
      protection:'FFP2', mandatoryReport:false,
      isolationFR:'5 à 7 jours dès le début des symptômes',
      criterionFR:'Critère OMS ILI : fièvre brutale ≥ 38°C + toux/maux de gorge',
    },
    COVID19: {
      nameFR: 'COVID-19 (SARS-CoV-2)',        nameEN: 'COVID-19 (SARS-CoV-2)',  icon: '🦠',
      prior: 18,
      weights: {
        smell_loss:35, taste_loss:30, dry_cough:15, fatigue_severe:14,
        fever:12, headache:10, sore_throat:8, onset_gradual:8,
        dyspnea:15, myalgias:8,
        cough_3w:-20, night_sweats:-12, weight_loss:-18, bleeding:-25,
        neck_stiffness:-20, rash_pustular:-20,
      },
      alarmSigns:['dyspnea_rest','confusion','chest_pain','cyanosis'],
      protection:'FFP2', mandatoryReport:false,
      isolationFR:'5 à 7 jours + masque si contact avec personnes vulnérables',
      criterionFR:'Anosmie/agueusie : spécificité 97% pour SARS-CoV-2',
    },
    TUBERCULOSIS: {
      nameFR: 'Tuberculose pulmonaire',        nameEN: 'Pulmonary Tuberculosis',  icon: '🫁',
      prior: 3,
      weights: {
        cough_3w:40, night_sweats:28, weight_loss:28, hemoptysis:32,
        fever_low:22, fatigue_chronic:18, duration_weeks:25,
        onset_sudden:-20, smell_loss:-20, rash:-15,
      },
      alarmSigns:['hemoptysis','dyspnea_rest'],
      protection:'FFP2 obligatoire', mandatoryReport:true,
      isolationFR:'Isolement respiratoire — déclaration DSP < 24h obligatoire',
      criterionFR:'Critère OMS : toux > 2 semaines + signes constitutionnels',
    },
    MPOX: {
      nameFR: 'Mpox (variole du singe)',       nameEN: 'Mpox (Monkeypox)',        icon: '🔴',
      prior: 2,
      weights: {
        rash:25, rash_pustular:35, lymph_nodes:28, fever:15,
        myalgias:10, exposure_msm:30, travel_africa:20,
        dry_cough:-10, cough_3w:-20, smell_loss:-15,
      },
      alarmSigns:['lesions_extensive','dyspnea_rest'],
      protection:'Contact + FFP2', mandatoryReport:true,
      isolationFR:'Isolement jusqu\'à cicatrisation complète de toutes les lésions',
      criterionFR:'Adénopathies + éruption pustuleuse = tableau hautement évocateur',
    },
    MENINGITIS: {
      nameFR: 'Méningite bactérienne',         nameEN: 'Bacterial Meningitis',    icon: '🧠',
      prior: 0.5,
      weights: {
        neck_stiffness:45, headache:30, photophobia:28, fever_high:22,
        vomiting:15, confusion:25, purpura:45, onset_sudden:20,
      },
      alarmSigns:['purpura','confusion','neck_stiffness'],
      emergencyLevel:'ROUGE',
      protection:'FFP2 + contact', mandatoryReport:true,
      isolationFR:'URGENCE VITALE — Appelez le 15 immédiatement',
      criterionFR:'Triade méningée : céphalées + raideur nuque + fièvre',
    },
    DENGUE: {
      nameFR: 'Dengue (arbovirose)',            nameEN: 'Dengue Fever',            icon: '🦟',
      prior: 1,
      weights: {
        travel_tropical:35, fever_high:22, arthralgia:28,
        retrobulbar_pain:25, rash_maculopapular:20, myalgias:15, fever:12,
        cough_3w:-20, smell_loss:-15, neck_stiffness:-10,
      },
      alarmSigns:['bleeding','abdominal_pain','lethargy'],
      protection:'Prévention moustiques', mandatoryReport:true,
      isolationFR:'Pas d\'isolement — éviter contact moustiques (transmission vectorielle)',
      criterionFR:'Arthralgies + fièvre + voyage tropical = dengue jusqu\'à preuve du contraire',
    },
    RSV: {
      nameFR: 'VRS / Bronchiolite',             nameEN: 'RSV / Bronchiolitis',     icon: '🌬️',
      prior: 8,
      weights: {
        wheezing:30, wet_cough:20, rhinorrhea:15, fever_low:12,
        feeding_difficulty:25, age_infant:30, onset_gradual:10,
        smell_loss:-20, myalgias:-10, bleeding:-25,
      },
      alarmSigns:['apnea','cyanosis','dyspnea_rest'],
      protection:'Contact + gouttelettes', mandatoryReport:false,
      isolationFR:'7 jours — précautions renforcées autour des prématurés',
      criterionFR:'Sibilances + rhinorrhée + nourrisson < 2 ans = bronchiolite probable',
    },
    LEGIONELLA: {
      nameFR: 'Légionellose (pneumonie atypique)', nameEN: 'Legionella pneumonia', icon: '🏨',
      prior: 1,
      weights: {
        fever_high:22, wet_cough:18, dyspnea:20, myalgias:15, confusion:20,
        diarrhea:15, water_exposure:30, fever_resistant:20,
        smell_loss:-15, cough_3w:-15, bleeding:-25,
      },
      alarmSigns:['confusion','dyspnea_rest'],
      protection:'FFP2', mandatoryReport:true,
      isolationFR:'Non contagieux inter-humain — signaler exposition eau stagnante',
      criterionFR:'Pneumonie + hyponatrémie + confusion = Legionella (score de Winthrop)',
    },
    H5N1: {
      nameFR: 'Grippe aviaire (H5N1/H7N9)',    nameEN: 'Avian Influenza H5N1',    icon: '🐦',
      prior: 0.2,
      weights: {
        poultry_contact:45, fever_very_high:25, dyspnea:28,
        conjunctivitis:22, myalgias:15, rapid_deterioration:30,
        travel_asia:20, smell_loss:-15, cough_3w:-20,
      },
      alarmSigns:['dyspnea_rest','rapid_deterioration','cyanosis'],
      emergencyLevel:'ORANGE',
      protection:'FFP2 + lunettes/visière', mandatoryReport:true,
      isolationFR:'Isolement 7j — déclaration ARS immédiate — cas ultra-rare',
      criterionFR:'Contact volailles mortes/malades OBLIGATOIRE dans les 10j précédents',
    },
    HEMORRHAGIC_FEVER: {
      nameFR: 'Fièvre hémorragique virale (Ebola/Marburg/Lassa)', nameEN: 'Viral Haemorrhagic Fever', icon: '🩸',
      prior: 0.01,
      weights: {
        bleeding:50, travel_africa_high_risk:50, fever_high:20,
        vomiting_diarrhea:25, myalgias:15, rash:12,
      },
      alarmSigns:['bleeding'],
      emergencyLevel:'ROUGE',
      protection:'BSL-4 (hôpital spécialisé)', mandatoryReport:true,
      isolationFR:'URGENCE NATIONALE — SAMU 15 immédiat — isolement haute sécurité',
      criterionFR:'Voyage Afrique sub-saharienne < 21j + saignements = SAMU 15 immédiat',
    },
  };

  // ── Niveaux d'orientation ──────────────────────────────────
  const ORIENTATION = {
    VERT:   { label:'Surveillance à domicile',      icon:'🟢', phone:'',        color:'#16a34a', bg:'#f0fdf4', border:'#86efac' },
    BLEU:   { label:'Médecin traitant sous 48h',    icon:'🔵', phone:'',        color:'#2563eb', bg:'#eff6ff', border:'#93c5fd' },
    JAUNE:  { label:'Médecin de garde aujourd\'hui', icon:'🟡', phone:'116 117', color:'#d97706', bg:'#fffbeb', border:'#fcd34d' },
    ORANGE: { label:'Urgences médicales',            icon:'🟠', phone:'15',      color:'#ea580c', bg:'#fff7ed', border:'#fdba74' },
    ROUGE:  { label:'SAMU — Urgence vitale',         icon:'🔴', phone:'15',      color:'#dc2626', bg:'#fef2f2', border:'#fca5a5' },
  };

  // ── Règles d'alarme (ordre : plus sévère en premier) ──────
  // Toutes les conditions d'un trigger doivent être présentes → niveau d'alerte
  const ALARM_RULES = [
    { triggers:['purpura'],                              level:'ROUGE',  reason:'Purpura cutané non blanchissant — méningococcémie à exclure en urgence absolue' },
    { triggers:['bleeding'],                             level:'ROUGE',  reason:'Saignements actifs — fièvre hémorragique virale à exclure' },
    { triggers:['seizures'],                             level:'ROUGE',  reason:'Convulsions — urgence neurologique' },
    { triggers:['apnea'],                                level:'ROUGE',  reason:'Apnées — détresse respiratoire aiguë (nourrisson)' },
    { triggers:['cyanosis'],                             level:'ROUGE',  reason:'Cyanose — hypoxémie sévère' },
    { triggers:['confusion'],                            level:'ORANGE', reason:'Confusion/désorientation — évaluation neurologique urgente' },
    { triggers:['dyspnea_rest'],                         level:'ORANGE', reason:'Dyspnée au repos — insuffisance respiratoire à évaluer' },
    { triggers:['neck_stiffness','fever_high'],          level:'ROUGE',  reason:'Syndrome méningé fébrile — méningite à exclure en urgence' },
    { triggers:['neck_stiffness','fever_very_high'],     level:'ROUGE',  reason:'Syndrome méningé fébrile — méningite à exclure en urgence' },
    { triggers:['travel_africa_high_risk','fever_high'], level:'ORANGE', reason:'Retour zone endémique paludisme — bilan parasitologique urgent' },
    { triggers:['age_infant','fever_high'],              level:'ORANGE', reason:'Fièvre chez nourrisson < 3 mois — évaluation aux urgences pédiatriques' },
    { triggers:['immunocompromised','fever_high'],       level:'ORANGE', reason:'Immunodéprimé fébrile — neutropénie fébrile à éliminer' },
    { triggers:['hemoptysis'],                           level:'ORANGE', reason:'Hémoptysie — tuberculose ou embolie pulmonaire à explorer' },
    { triggers:['age_senior','dyspnea_rest'],            level:'ORANGE', reason:'Dyspnée chez senior — décompensation cardiorespiratoire possible' },
  ];

  // ── Rang des niveaux (pour comparaison) ───────────────────
  const LEVEL_RANK = { VERT:0, BLEU:1, JAUNE:2, ORANGE:3, ROUGE:4 };

  // ── runDiagnosticEngine ────────────────────────────────────
  // Entrée : state = { symptoms:string[], alarm:string[], ctx:string[], onset:string, fever:string, age:string }
  // Sortie : { ranked, flags, orientLevel, alarmReason, scores }
  function runDiagnosticEngine(state) {
    const { symptoms = [], alarm = [], ctx = [], onset = 'unknown', fever = 'unknown', age = 'adult' } = state;
    const allFlags = [...symptoms, ...alarm, ...ctx];

    const flags = new Set(allFlags);

    // Normalisation contexte
    if (onset === 'sudden')                              flags.add('onset_sudden');
    if (onset === 'gradual' || onset === 'days_4_7')    flags.add('onset_gradual');
    if (onset === 'weeks') { flags.add('duration_weeks'); flags.add('onset_gradual'); }
    if (fever === 'fever_low')       { flags.add('fever'); flags.add('fever_low'); }
    if (fever === 'fever_high')      { flags.add('fever'); flags.add('fever_high'); }
    if (fever === 'fever_very_high') { flags.add('fever'); flags.add('fever_high'); flags.add('fever_very_high'); }
    if (age === 'infant') flags.add('age_infant');
    if (age === 'senior') flags.add('age_senior');

    // Synonymes des anciens codes symptômes
    const SYNONYMS = {
      'breathlessness':'dyspnea', 'persistent_cough':'cough_3w',
      'muscle_pain':'myalgias', 'taste_loss':'taste_loss',
    };
    for (const [old, nw] of Object.entries(SYNONYMS)) {
      if (flags.has(old)) flags.add(nw);
    }
    // Alarm signs HTML → flags moteur
    if (flags.has('neck_stiffness_alarm'))  { flags.add('neck_stiffness'); flags.add('fever_high'); }
    if (flags.has('purpura'))               flags.add('purpura');
    if (flags.has('confusion_alarm'))       flags.add('confusion');
    if (flags.has('dyspnea_rest_alarm'))    flags.add('dyspnea_rest');
    if (flags.has('bleeding_alarm'))        flags.add('bleeding');
    if (flags.has('seizures_alarm'))        flags.add('seizures');

    // Calcul des scores bayésiens
    const scores = {};
    for (const [pid, profile] of Object.entries(PATHOGENS)) {
      let score = profile.prior;
      for (const [flag, weight] of Object.entries(profile.weights)) {
        if (flags.has(flag)) score += weight;
      }
      scores[pid] = Math.max(0, score);
    }

    const total  = Object.values(scores).reduce((s,v) => s + v, 0) || 1;
    const ranked = Object.entries(scores)
      .map(([pid, raw]) => ({ pid, raw, pct: Math.round((raw / total) * 100) }))
      .sort((a,b) => b.raw - a.raw)
      .filter(d => d.pct >= 3)
      .slice(0, 3);

    // Application des règles d'alarme
    let orientLevel  = null;
    let alarmReason  = null;
    for (const rule of ALARM_RULES) {
      if (rule.triggers.every(t => flags.has(t))) {
        const rk = LEVEL_RANK[rule.level] || 0;
        if (orientLevel === null || rk > LEVEL_RANK[orientLevel]) {
          orientLevel = rule.level;
          alarmReason = rule.reason;
        }
      }
    }

    // Orientation par défaut si pas de règle déclenchée
    if (!orientLevel) {
      const hasHighFever      = flags.has('fever_high') || flags.has('fever_very_high');
      const hasAnySigns       = symptoms.length >= 4;
      const isSeniorOrInfant  = flags.has('age_senior') || flags.has('age_infant');

      if (symptoms.length === 0 && alarm.length === 0) {
        orientLevel = null;
      } else if (isSeniorOrInfant && hasHighFever) {
        orientLevel = 'JAUNE';
      } else if (hasHighFever && hasAnySigns) {
        orientLevel = 'JAUNE';
      } else if (hasHighFever || hasAnySigns) {
        orientLevel = 'BLEU';
      } else {
        orientLevel = 'VERT';
      }
    }

    return { ranked, flags, orientLevel, alarmReason, scores };
  }

  // ── computeZScore ──────────────────────────────────────────
  // Calcule le Z-score sur une fenêtre glissante de 8 semaines.
  // Entrée : current (nombre cas semaine courante), history (tableau 8 valeurs)
  // Sortie : { zscore, level, mean, std }
  // Seuils OMS 7-1-7 : 1.5σ=JAUNE, 2.0σ=ORANGE, 3.0σ=ROUGE
  function computeZScore(current, history) {
    if (!Array.isArray(history) || history.length === 0) {
      return { zscore: 0, level: 'NORMAL', mean: 0, std: 1 };
    }
    const n    = history.length;
    const mean = history.reduce((a, b) => a + b, 0) / n;
    const variance = history.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
    const std  = Math.sqrt(variance) || 1; // garde ≥ 1 pour éviter division par zéro
    const z    = (current - mean) / std;
    const zscore = Math.round(z * 10) / 10;

    const level = zscore >= 3.0 ? 'ROUGE'
      : zscore >= 2.0 ? 'ORANGE'
      : zscore >= 1.5 ? 'JAUNE'
      : 'NORMAL';

    return { zscore, level, mean: Math.round(mean * 10) / 10, std: Math.round(std * 10) / 10 };
  }

  return { PATHOGENS, ORIENTATION, ALARM_RULES, LEVEL_RANK, runDiagnosticEngine, computeZScore };
});
