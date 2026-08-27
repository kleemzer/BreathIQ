module.exports = {
  content: [
    'index.html',
    'script.js',
    'api-live.js',
    'js/clinical-orientation.js',
    'js/care-facilities.js',
    'js/symptom-guide.js',
  ],
  css: ['style.css'],
  // Classes générées dynamiquement non détectées par l'analyse statique
  safelist: [
    // Thème
    'dark', 'light',
    // Modes (body dataset)
    /^(patient|expert)-only$/,
    // Risk banner — niveaux AQI dynamiques
    'risk-low', 'risk-moderate', 'risk-high', 'risk-critical',
    // Vitals wizard
    'vital-ok', 'vital-warn', 'vital-crit',
    // Tabs
    'biq-tab-active',
    // États JS
    'hidden', 'active', 'selected', 'js-ready', 'alarm-checked',
    // Map markers
    /^(dot|marker|ob-)/,
    // Status sources
    /^(spf-|ecdc-|who-)/,
    // Score dial
    /^score-(low|moderate|high|critical)$/,
    // Alerte épidémique niveaux
    /^(al-|epi-)/,
    // Care tabs
    /^care-tab/,
    // Mode expert
    'expert-mode', 'mode-expert', 'mode-patient',
    // ECDC maladies à prévention vaccinale
    /^ecdc-vacc/,
    /^ecdc-spark/,
    // WHO DON live badge
    /^who-alerts-live/,
    /^who-alerts-cached/,
  ],
  output: 'purged.css',
};
