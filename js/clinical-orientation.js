(function initClinicalOrientation(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.BIQ_CLINICAL = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, function clinicalOrientationFactory() {
  'use strict';

  const RED_FLAG_RULES = [
    { flags: ['dyspnea_rest'], level: 'emergency', score: 92, careNeed: 'emergency_department', reasonFR: 'Difficultés à respirer au repos.', reasonEN: 'Breathing difficulty at rest.' },
    { flags: ['cyanosis'], level: 'emergency', score: 96, careNeed: 'emergency_department', reasonFR: 'Lèvres ou ongles bleutés, signe possible d’hypoxie.', reasonEN: 'Blue lips or nails, possible hypoxia.' },
    { flags: ['chest_pain'], level: 'emergency', score: 92, careNeed: 'emergency_department', reasonFR: 'Douleur thoracique associée à des symptômes respiratoires.', reasonEN: 'Chest pain with respiratory symptoms.' },
    { flags: ['confusion'], level: 'emergency', score: 90, careNeed: 'emergency_department', reasonFR: 'Confusion ou altération de la conscience.', reasonEN: 'Confusion or altered consciousness.' },
    { flags: ['seizures'], level: 'emergency', score: 95, careNeed: 'emergency_department', reasonFR: 'Convulsions ou malaise neurologique sévère.', reasonEN: 'Seizure or severe neurological event.' },
    { flags: ['purpura'], level: 'emergency', score: 94, careNeed: 'emergency_department', reasonFR: 'Taches rouges/violettes non blanchissantes : urgence à évaluer.', reasonEN: 'Non-blanching red/purple rash requires urgent assessment.' },
    { flags: ['bleeding'], level: 'medical_regulation', score: 94, careNeed: 'medical_regulation', reasonFR: 'Saignements inexpliqués avec contexte infectieux possible.', reasonEN: 'Unexplained bleeding with possible infectious context.' },
    { flags: ['neck_stiffness', 'fever'], level: 'emergency', score: 93, careNeed: 'emergency_department', reasonFR: 'Raideur de nuque avec fièvre : méningite à exclure.', reasonEN: 'Neck stiffness with fever: meningitis must be ruled out.' },
    { flags: ['severe_dehydration'], level: 'emergency', score: 88, careNeed: 'emergency_department', reasonFR: 'Signes de déshydratation sévère.', reasonEN: 'Signs of severe dehydration.' },
    { flags: ['travel_africa_high_risk', 'fever'], level: 'medical_regulation', score: 91, careNeed: 'medical_regulation', reasonFR: 'Fièvre après retour d’une zone à risque : appelez la régulation avant tout déplacement.', reasonEN: 'Fever after travel to a high-risk area: call medical regulation before travelling.' },
  ];

  const CARE_LABELS = {
    emergency_department: { fr: 'Urgences / service hospitalier', en: 'Emergency department' },
    medical_regulation: { fr: 'Régulation médicale avant déplacement', en: 'Medical regulation before travelling' },
    doctor: { fr: 'Médecin ou centre de santé', en: 'Doctor or health centre' },
    pharmacy: { fr: 'Pharmacie / conseil officinal', en: 'Pharmacy advice' },
    clinic: { fr: 'Clinique ou consultation sans rendez-vous', en: 'Clinic or walk-in care' },
    teleconsultation: { fr: 'Téléconsultation possible', en: 'Teleconsultation possible' },
    self_monitoring: { fr: 'Auto-surveillance prudente', en: 'Careful self-monitoring' },
  };

  function asSet(values) {
    return new Set((values || []).filter(Boolean));
  }

  function normalizeInput(input) {
    const symptoms = asSet(input.symptoms);
    const riskFactors = asSet(input.riskFactors);
    const ageGroup = input.ageGroup || 'adult';
    const durationDays = Number.isFinite(input.durationDays) ? input.durationDays : null;
    const localOutbreakRisk = input.context?.localOutbreakRisk || 'low';

    if (symptoms.has('breathlessness')) symptoms.add('dyspnea');
    if (symptoms.has('dyspnea_rest_alarm')) symptoms.add('dyspnea_rest');
    if (symptoms.has('neck_stiffness_alarm')) symptoms.add('neck_stiffness');
    if (symptoms.has('fever_low') || symptoms.has('fever_high') || symptoms.has('fever_very_high')) symptoms.add('fever');
    if (symptoms.has('vomiting') || symptoms.has('diarrhea')) symptoms.add('gastro');
    if (symptoms.has('persistent_cough')) symptoms.add('cough_3w');
    if (symptoms.has('hemoptysis')) symptoms.add('blood_sputum');
    if (riskFactors.has('immunocompromised')) riskFactors.add('immunosuppression');
    if (riskFactors.has('pregnant')) riskFactors.add('pregnancy');

    return { symptoms, riskFactors, ageGroup, durationDays, localOutbreakRisk, context: input.context || {} };
  }

  function ruleMatches(rule, symptoms, riskFactors) {
    return rule.flags.every(flag => symptoms.has(flag) || riskFactors.has(flag));
  }

  function applyRedFlags(normalized) {
    const reasons = [];
    let selected = null;

    for (const rule of RED_FLAG_RULES) {
      if (!ruleMatches(rule, normalized.symptoms, normalized.riskFactors)) continue;
      reasons.push(rule.reasonFR);
      if (!selected || rule.score > selected.score) selected = rule;
    }

    return { selected, reasons };
  }

  function hasVulnerability(normalized) {
    return normalized.ageGroup === 'infant' ||
      normalized.ageGroup === 'senior' ||
      normalized.riskFactors.has('pregnancy') ||
      normalized.riskFactors.has('immunosuppression') ||
      normalized.riskFactors.has('cardio_respiratory_disease');
  }

  function evaluateClinicalOrientation(input = {}) {
    const normalized = normalizeInput(input);
    const symptoms = normalized.symptoms;
    const riskFactors = normalized.riskFactors;
    const red = applyRedFlags(normalized);
    const redFlags = red.reasons;
    const reasons = [];

    let level = 'self_monitoring';
    let urgencyScore = 20;
    let careNeed = 'self_monitoring';

    if (red.selected) {
      level = red.selected.level;
      urgencyScore = red.selected.score;
      careNeed = red.selected.careNeed;
      reasons.push(...red.reasons);
    } else {
      const vulnerable = hasVulnerability(normalized);
      const highFever = symptoms.has('fever_high') || symptoms.has('fever_very_high');
      const respiratory = symptoms.has('dry_cough') || symptoms.has('wet_cough') || symptoms.has('dyspnea') || symptoms.has('wheezing');
      const prolongedCough = symptoms.has('cough_3w') || (respiratory && normalized.durationDays !== null && normalized.durationDays >= 21);
      const tbPattern = prolongedCough && (symptoms.has('night_sweats') || symptoms.has('weight_loss') || symptoms.has('blood_sputum'));
      const rashFever = symptoms.has('rash') && symptoms.has('fever');
      const gastroRisk = symptoms.has('gastro') && (symptoms.has('abdominal_pain') || vulnerable);

      if (tbPattern) {
        level = 'same_day_doctor';
        urgencyScore = 70;
        careNeed = 'doctor';
        reasons.push('Toux prolongée avec signes généraux : avis médical rapide recommandé.');
      } else if (vulnerable && (highFever || respiratory || gastroRisk)) {
        level = 'same_day_doctor';
        urgencyScore = 68;
        careNeed = 'doctor';
        reasons.push('Terrain fragile : le seuil d’avis médical est abaissé.');
      } else if (rashFever || highFever || symptoms.has('rapid_deterioration')) {
        level = 'same_day_doctor';
        urgencyScore = 62;
        careNeed = 'doctor';
        reasons.push('Fièvre élevée, éruption ou aggravation : avis médical le jour même conseillé.');
      } else if (respiratory && symptoms.size <= 3 && !vulnerable) {
        level = 'pharmacy';
        urgencyScore = 35;
        careNeed = 'pharmacy';
        reasons.push('Symptômes respiratoires légers sans signe rouge déclaré.');
      } else if (symptoms.size >= 4) {
        level = 'same_day_doctor';
        urgencyScore = 58;
        careNeed = 'doctor';
        reasons.push('Plusieurs symptômes associés justifient un avis médical si l’état persiste ou s’aggrave.');
      } else {
        level = 'self_monitoring';
        urgencyScore = 25;
        careNeed = 'self_monitoring';
        reasons.push('Aucun signe rouge déclaré dans les informations saisies.');
      }

      if (normalized.localOutbreakRisk === 'high' && level === 'self_monitoring') {
        level = 'pharmacy';
        urgencyScore = Math.max(urgencyScore, 40);
        careNeed = 'pharmacy';
        reasons.push('Contexte épidémique local élevé : prudence renforcée.');
      }
    }

    const recommendation = buildMessages({ level, careNeed, urgencyScore, reasons, redFlags });
    return {
      level,
      urgencyScore,
      careNeed,
      redFlags,
      reasons: reasons.slice(0, 4),
      patientMessageFR: recommendation.fr,
      patientMessageEN: recommendation.en,
      careLabelFR: CARE_LABELS[careNeed]?.fr || careNeed,
      careLabelEN: CARE_LABELS[careNeed]?.en || careNeed,
      disclaimerFR: 'BreathIQ oriente vers un niveau de recours. Il ne pose pas de diagnostic et ne remplace pas une consultation médicale.',
      disclaimerEN: 'BreathIQ suggests a level of care. It does not provide a diagnosis and does not replace medical consultation.',
    };
  }

  function buildMessages(result) {
    const frByLevel = {
      emergency: 'Vos symptômes déclarés comportent un signe d’urgence. Appelez les urgences ou faites-vous accompagner vers un service adapté.',
      medical_regulation: 'Appelez la régulation médicale avant de vous déplacer, surtout si vous revenez d’une zone à risque ou présentez des signes infectieux sévères.',
      same_day_doctor: 'Un avis médical le jour même est recommandé, surtout si les symptômes s’aggravent ou persistent.',
      pharmacy: 'Une pharmacie peut vous orienter et vous conseiller, avec avis médical si aggravation ou facteur de risque.',
      self_monitoring: 'Surveillez l’évolution, reposez-vous, hydratez-vous et consultez si les symptômes s’aggravent ou persistent.',
    };
    const enByLevel = {
      emergency: 'The symptoms entered include an emergency warning sign. Call emergency services or seek urgent care.',
      medical_regulation: 'Call medical regulation before travelling, especially after high-risk travel or severe infectious signs.',
      same_day_doctor: 'Same-day medical advice is recommended, especially if symptoms worsen or persist.',
      pharmacy: 'A pharmacy may provide advice, with medical review if symptoms worsen or risk factors are present.',
      self_monitoring: 'Monitor symptoms, rest, hydrate, and seek care if symptoms worsen or persist.',
    };
    return { fr: frByLevel[result.level], en: enByLevel[result.level] };
  }

  return { evaluateClinicalOrientation };
});
