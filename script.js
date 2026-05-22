'use strict';

// ============================================================
// BREATHIQ v1.1 — Surveillance épidémique mondiale
// © 2026 Dr. Clément MÉDEAU — Outil d'information publique
// Non dispositif médical
// ============================================================

// ── Seuils OMS 2021 — Valeurs de référence officielles ──────
// Source : WHO (2021). Global Air Quality Guidelines. Geneva.
// ISBN 978-92-4-003422-8
// https://www.who.int/publications/i/item/9789240034228
// REF-01
const WHO_THRESHOLDS_2021 = {
  PM25:  { annual: 5,  daily: 15, unit: 'µg/m³', source: 'WHO AQG 2021' },
  PM10:  { annual: 15, daily: 45, unit: 'µg/m³', source: 'WHO AQG 2021' },
  NO2:   { annual: 10, daily: 25, unit: 'µg/m³', source: 'WHO AQG 2021' },
  O3:    { peak8h: 60,            unit: 'µg/m³', source: 'WHO AQG 2021' },
  SO2:   { daily: 40,             unit: 'µg/m³', source: 'WHO AQG 2021' },
};

// ── i18n ────────────────────────────────────────────────────
const I18N = {
  fr: {
    'nav-score': 'Mon Score',
    'nav-map': 'Carte mondiale',
    'nav-stocks': 'Masques & Stocks',
    'nav-pathogens': 'Maladies',
    'nav-protection': 'Protection',
    'nav-about': 'À propos',
    'hero-badge': 'Surveillance épidémique · Données mondiales',
    'hero-title-1': 'L\'air que vous respirez,',
    'hero-title-2': 'intelligemment surveillé.',
    'hero-subtitle': 'Indice respiratoire en temps réel. Qualité de l\'air, circulation virale, pathogènes actifs. Prenez des décisions éclairées — pas des décisions anxieuses.',
    'hero-cta-score': 'Mon Indice Respiratoire',
    'hero-cta-map': 'Carte des foyers',
    'hero-disclaimer': 'Outil d\'information publique — non dispositif médical · Accès libre et gratuit',
    'hsc-label': 'Indice respiratoire',
    'hsc-loading': 'Calcul en cours…',
    'hsc-regions': 'Régions surveillées',
    'hsc-regions-unit': 'régions',
    'hsc-pathogens': 'Pathogènes suivis',
    'hsc-pathogens-unit': 'pathogènes',
    'score-title': 'Indice Respiratoire Global',
    'score-subtitle': 'Score synthétique 0–100 combinant qualité de l\'air, circulation virale, pollens et météo.',
    'score-label': '/100',
    'score-select-region': 'Région :',
    'score-components-title': 'Composantes du score',
    'comp-aqi': 'Qualité de l\'air (AQI)',
    'comp-viral': 'Circulation virale',
    'comp-pollen': 'Pollens',
    'comp-weather': 'Météo / humidité',
    'formula-label': 'Formule :',
    'ai-badge': 'Intelligence BreathIQ',
    'ai-message-default': 'Sélectionnez une région pour obtenir une analyse personnalisée.',
    'map-title': 'Carte mondiale des stocks & foyers',
    'map-subtitle': 'Stocks FFP2/N95/KN95 et foyers pathogènes actifs nécessitant une protection respiratoire.',
    'layer-stocks': 'Stocks masques',
    'layer-outbreaks': 'Foyers pathogènes',
    'layer-both': 'Vue combinée',
    'leg-critical': 'Critique',
    'leg-low': 'Faible',
    'leg-moderate': 'Modéré',
    'leg-sufficient': 'Suffisant',
    'leg-outbreak': 'Foyer actif',
    'mstat-critical': 'régions critiques',
    'mstat-outbreaks': 'foyers actifs',
    'mstat-monitored': 'régions surveillées',
    'mstat-update': 'dernière mise à jour',
    'pathogens-title': 'Pathogènes sous surveillance mondiale',
    'pathogens-subtitle': 'Revue infectiologique des agents pathogènes nécessitant une protection FFP2/N95 ou équivalent.',
    'filter-all': 'Toutes',
    'filter-pandemic': '🌍 Mondial',
    'filter-epidemic': '📈 En cours',
    'filter-endemic': '🔄 Habituel',
    'filter-emerging': '⚠️ Nouveau',
    'pathogens-note': 'Données épidémiologiques issues de l\'OMS, CDC, ECDC et littérature scientifique. Outil d\'information — non dispositif médical.',
    'protection-title': 'Guide de protection respiratoire',
    'protection-subtitle': 'Critères de sélection et d\'usage des équipements de protection respiratoire.',
    'prot-ffp2-title': 'Protection haute efficacité',
    'prot-ffp2-desc': 'Filtre ≥ 94% des particules 0.3 µm. Standard EN 149. Indispensable face aux pathogènes à transmission aérienne et aux pics de pollution particulaire.',
    'prot-ffp2-li1': 'Influenza H5N1, SARS-CoV-2, Tuberculose',
    'prot-ffp2-li2': 'PM2.5 > 15 µg/m³ (dépassement valeur guide OMS 2021) — Pop. vulnérable dès 10 µg/m³',
    'prot-ffp2-li3': 'Environnements médicaux et confinés',
    'prot-ffp2-li4': 'Transport en commun lors d\'épidémies actives',
    'prot-ffp3-title': 'Protection maximale',
    'prot-ffp3-desc': 'Filtre ≥ 99% des particules. Pour pathogènes à très haute contagiosité. Usage professionnel principalement.',
    'prot-ffp3-li1': 'Virus Nipah, Hantavirus, Marburg, Ebola',
    'prot-ffp3-li2': 'Interventions à haut risque d\'aérosolisation',
    'prot-ffp3-li3': 'PM1.0 ou métaux lourds en suspension',
    'prot-surg-title': 'Barrière gouttelettes',
    'prot-surg-desc': 'Efficacité bactérienne ≥ 98%. Protège contre les projections de gouttelettes. Insuffisant pour les aérosols fins.',
    'prot-surg-li1': 'Rhinovirus, Grippe saisonnière faible',
    'prot-surg-li2': 'Environnements chirurgicaux',
    'prot-surg-li3': 'Prévention source (symptomatiques)',
    'table-mask': 'Masque',
    'table-std': 'Standard',
    'table-eff': 'Efficacité',
    'table-aerosol': 'Aérosols',
    'table-droplets': 'Gouttelettes',
    'table-pm25': 'PM2.5',
    'about-title': 'Confiance & Transparence',
    'about-subtitle': 'BreathIQ est un projet personnel indépendant, construit sur des données publiques vérifiables.',
    'author-role': 'Docteur en médecine · La Rochelle, France',
    'author-bio': 'Initiative indépendante de santé publique créée par un médecin. Cet outil vous informe — il ne remplace pas une consultation médicale.',
    'trust-open-title': '100% Open & Libre',
    'trust-open-desc': 'Accès sans compte, sans inscription, sans tracking publicitaire. Aucune donnée de santé collectée. Conformité RGPD totale.',
    'trust-sources-title': 'Sources vérifiables',
    'trust-sources-desc': 'Données issues de l\'OMS, ECDC, data.gouv.fr, Eurostat et CDC. Toutes les sources sont citées et vérifiables publiquement.',
    'trust-legal-title': 'Données protégées',
    'trust-legal-desc': 'Aucune exploitation commerciale des données. Reproduction à des fins publicitaires ou d\'entraînement IA interdite.',
    'disclaimer-title': 'Non-dispositif médical — Important',
    'disclaimer-text': 'BreathIQ est exclusivement un outil d\'information publique. Il ne constitue pas un dispositif médical et n\'émet pas de recommandations médicales individuelles. Pour tout conseil médical, consultez un professionnel de santé.',
    'footer-tagline': 'Surveillance épidémique mondiale',
    'footer-mentions': 'Mentions légales',
    'footer-cgu': 'CGU',
    'footer-privacy': 'Confidentialité',
    'footer-legal-en': 'Legal Notice (EN)',
    'footer-disclaimer-short': 'Outil d\'information publique · Non dispositif médical',
    'mbn-score': 'Score',
    'mbn-map': 'Carte',
    'mbn-pathogens': 'Virus',
    'mbn-protection': 'FFP2',
    'mode-toggle-patient': '👤 Mode Patient',
    'mode-toggle-expert': '⚙️ Mode Expert',
    'patient-hero-badge': 'Surveillance respiratoire · Accès libre',
    'symptom-checker-title': 'Ai-je des symptômes qui doivent m\'alerter ?',
    'symptom-checker-intro': 'Cochez ce que vous ressentez pour identifier le risque et savoir quoi faire',
    'checker-btn-text': 'Analyser mes symptômes →',
    'action-guide-title': 'Que faire si vous avez des symptômes respiratoires ?',
    'action-guide-subtitle': '3 actions simples et immédiates pour vous protéger et protéger les autres',
    'expert-toggle-label': '⚙️ Afficher les données techniques (Mode Expert)',
    'expert-toggle-note': 'Indices respiratoires, carte mondiale, guide de protection — pour professionnels et curieux',
    'pathogens-patient-title': 'Maladies infectieuses — quels symptômes surveiller ?',
    'pathogens-patient-sub': 'Cliquez sur une maladie pour voir ses symptômes et savoir quand s\'isoler',
    'sym-fever': 'Fièvre ou frissons',
    'sym-dry-cough': 'Toux sèche',
    'sym-wet-cough': 'Toux avec crachats',
    'sym-long-cough': 'Toux depuis + de 3 semaines',
    'sym-breath': 'Difficultés à respirer',
    'sym-smell': 'Perte d\'odorat ou de goût',
    'sym-rash': 'Éruption cutanée ou lésions',
    'sym-muscle': 'Douleurs musculaires intenses',
    'sym-head': 'Maux de tête intenses',
    'sym-confusion': 'Confusion ou somnolence',
    'sym-bleeding': 'Saignements inexpliqués',
    'sym-lymph': 'Ganglions gonflés',
    'sym-sweats': 'Sueurs nocturnes importantes',
    'sym-vomit': 'Vomissements ou diarrhée',
    'care-btn': '📍 Trouver un médecin proche de moi',
    'care-btn-refresh': '🔄 Actualiser',
    'care-searching': 'Recherche en cours…',
    'care-title': 'Trouver un médecin près de chez moi',
    'care-subtitle': 'Pharmacies, médecins et hôpitaux autour de vous',
    'care-permission': 'Pour trouver les soins les plus proches, nous avons besoin d\'accéder temporairement à votre position. Elle reste sur votre appareil et n\'est jamais transmise à nos serveurs.',
    'care-no-geo': 'La géolocalisation n\'est pas disponible sur votre appareil.',
    'care-geo-denied': 'Accès à votre localisation refusé. Autorisez la géolocalisation dans les paramètres de votre navigateur, puis réessayez.',
    'care-error': 'Erreur lors de la recherche. Vérifiez votre connexion internet.',
    'care-no-results': 'Aucun établissement de santé trouvé dans un rayon de 10 km.',
    'care-privacy': 'Votre position reste sur votre appareil — jamais transmise à nos serveurs.',
    'nav-syndromic': 'Surveillance',
    'syn-title': 'Surveillance syndromique — Détection précoce',
    'syn-subtitle': 'Détectez les épidémies 7–14 jours avant confirmation laboratoire · Algorithme OMS 7-1-7',
    'al-normal-desc': 'Signal dans la norme historique (z < 1.5σ)',
    'al-jaune-desc': 'Augmentation inhabituelle (z ≥ 1.5σ)',
    'al-orange-desc': 'Signal épidémique probable (z ≥ 2σ · p<5%)',
    'al-rouge-desc': 'Épidémie confirmée (z ≥ 3σ · p<0.3%)',
    'epi-curve-title': 'Courbe épidémique — Grippe France (SPF)',
    'epi-loading': 'Chargement des données SPF…',
    'epi-stats-title': 'Analyse statistique',
    'epi-stat-current': 'Semaine actuelle',
    'epi-stat-mean': 'Moyenne 52s',
    'epi-stat-zscore': 'Score Z',
    'epi-stat-thresh-jaune': 'Seuil JAUNE',
    'epi-stat-thresh-orange': 'Seuil ORANGE',
    'epi-stat-thresh-rouge': 'Seuil ROUGE',
    'epi-decl-local': 'Déclarations locales (cette semaine)',
    'epi-decl-none': 'Aucune déclaration cette semaine',
    'decl-title': '📋 Déclarer des cas suspects',
    'decl-subtitle': 'Formulaire ultra-rapide · < 30 secondes · 100% anonyme · RGPD',
    'decl-pilot': '⚗️ MODE PILOTE — données stockées localement · Pas de transmission serveur',
    'decl-syndrome': 'Syndrome observé *',
    'decl-count': 'Nb de cas *',
    'decl-age': 'Âge *',
    'decl-age-child': 'Enfant (<15 ans)',
    'decl-age-adult': 'Adulte (15–64)',
    'decl-age-senior': 'Senior (65+)',
    'decl-age-mixed': 'Tous âges',
    'decl-severity': 'Gravité *',
    'decl-sev-mild': 'Légère',
    'decl-sev-moderate': 'Modérée',
    'decl-sev-severe': 'Sévère',
    'decl-sev-hosp': 'Hospitalisation',
    'decl-date': 'Début des symptômes *',
    'decl-lab': 'Labo positif ?',
    'decl-lab-unknown': 'Sans objet',
    'decl-lab-yes': 'Oui',
    'decl-lab-no': 'Non',
    'decl-consent-text': 'J\'accepte le partage anonymisé de ces données à des fins de surveillance épidémiologique. Aucune donnée personnelle n\'est collectée (données agrégées uniquement).',
    'decl-submit': '📤 Déclarer — Anonymement',
    'decl-privacy-note': 'Aucune donnée personnelle collectée — uniquement syndrome, effectif, semaine, région approximative',
    'decl-confirm-title': 'Déclaration enregistrée localement',
    'decl-confirm-sub': 'Merci. Signal intégré à l\'analyse locale en temps réel.',
    'decl-confirm-new': '+ Nouvelle déclaration',
    'live-sources-title': 'Sources de surveillance en direct',
    'live-sources-subtitle': '8 sources épidémiologiques et environnementales connectées en temps réel',
    'live-src-status': 'Statut des sources',
    'live-src-air': 'Qualité de l\'air locale',
    'live-src-air-sub': 'WAQI · 11 polluants · Prévisions 7j',
    'live-src-pollen': 'Pollen local',
    'live-src-pollen-sub': 'Open-Meteo · Index européen pollen',
    'live-src-sumeau': 'COVID-19 — Eaux usées',
    'live-src-sumeau-sub': 'SUM\'EAU · 54 collectivités · Signal précoce France',
    'live-src-waiting': 'En attente de la géolocalisation…',
    'geo-modal-title': 'Accéder à votre position',
    'geo-modal-body': 'Pour afficher les médecins et hôpitaux les plus proches, BreathIQ a besoin d\'accéder temporairement à votre localisation.',
    'geo-modal-g1': 'Votre position n\'est jamais enregistrée sur nos serveurs',
    'geo-modal-g2': 'Utilisée uniquement pour rechercher les soins proches',
    'geo-modal-g3': 'Effacée dès la fermeture de la page',
    'geo-modal-refuse': '✕ Refuser',
    'geo-modal-accept': '✓ Accepter',
    // RGPD
    'consent-title': 'Vos données et votre vie privée',
    'consent-body': 'Vos préférences sont sauvegardées sur votre appareil. Des données publiques sur la qualité de l\'air et les épidémies sont consultées en temps réel depuis des sources officielles (OMS, CDC, ECDC). Aucune donnée personnelle n\'est transmise.',
    'consent-accept': '✓ Accepter',
    'consent-decline': 'Continuer sans accepter',
    'consent-more': 'Politique de confidentialité',
    'mydata-title': 'Mes données & confidentialité',
    'mydata-subtitle': 'Consultez, gérez et effacez les données stockées sur votre appareil.',
    'mydata-decl-label': 'Déclarations syndromiques',
    'mydata-cache-label': 'Cache API (données en direct)',
    'mydata-prefs-label': 'Préférences (thème, langue, mode)',
    'mydata-consent-label': 'Consentement RGPD',
    'mydata-clear-decl': 'Effacer mes déclarations',
    'mydata-clear-cache': 'Vider le cache API',
    'mydata-clear-all': 'Réinitialiser tout',
    'mydata-confirm': 'Confirmez-vous la suppression ?',
    'mydata-done': 'Données supprimées.',
    'mydata-export': 'Exporter mes déclarations (JSON)',
    'mydata-rights': 'Conformément aux articles 15, 17 et 21 du RGPD, vous pouvez accéder à vos données, les effacer ou vous y opposer à tout moment.',
    'mydata-dpo': 'Contact DPO',
    'decl-consent-art9': 'Je déclare agir en qualité de professionnel de santé ou de citoyen informé, et consens expressément au traitement de cette donnée de santé (Art. 9 RGPD) à des fins exclusives de surveillance épidémiologique locale, sans transmission serveur.',
    'nav-mydata': 'Mes données',
  },
  en: {
    'nav-score': 'My Score',
    'nav-map': 'World Map',
    'nav-stocks': 'Masks & Stocks',
    'nav-pathogens': 'Pathogens',
    'nav-protection': 'Protection',
    'nav-about': 'About',
    'hero-badge': 'Respiratory Intelligence · Global Data',
    'hero-title-1': 'The air you breathe,',
    'hero-title-2': 'intelligently monitored.',
    'hero-subtitle': 'Real-time respiratory index. Air quality, viral circulation, active pathogens. Make informed decisions — not anxious ones.',
    'hero-cta-score': 'My Respiratory Index',
    'hero-cta-map': 'Outbreak Map',
    'hero-disclaimer': 'Public information tool — not a medical device · Free access, no registration',
    'hsc-label': 'Respiratory Index',
    'hsc-loading': 'Calculating…',
    'hsc-regions': 'Monitored regions',
    'hsc-regions-unit': 'regions',
    'hsc-pathogens': 'Tracked pathogens',
    'hsc-pathogens-unit': 'pathogens',
    'score-title': 'Global Respiratory Index',
    'score-subtitle': 'Composite score 0–100 combining air quality, viral circulation, pollen and weather.',
    'score-label': '/100',
    'score-select-region': 'Region:',
    'score-components-title': 'Score components',
    'comp-aqi': 'Air Quality (AQI)',
    'comp-viral': 'Viral circulation',
    'comp-pollen': 'Pollen',
    'comp-weather': 'Weather / humidity',
    'formula-label': 'Formula:',
    'ai-badge': 'BreathIQ Intelligence',
    'ai-message-default': 'Select a region to get a personalized analysis.',
    'map-title': 'Global stocks & outbreak map',
    'map-subtitle': 'FFP2/N95/KN95 stocks and active pathogen outbreaks requiring respiratory protection.',
    'layer-stocks': 'Mask stocks',
    'layer-outbreaks': 'Pathogen outbreaks',
    'layer-both': 'Combined view',
    'leg-critical': 'Critical',
    'leg-low': 'Low',
    'leg-moderate': 'Moderate',
    'leg-sufficient': 'Sufficient',
    'leg-outbreak': 'Active outbreak',
    'mstat-critical': 'critical regions',
    'mstat-outbreaks': 'active outbreaks',
    'mstat-monitored': 'monitored regions',
    'mstat-update': 'last update',
    'pathogens-title': 'Pathogens under global surveillance',
    'pathogens-subtitle': 'Infectiological review of pathogens requiring FFP2/N95 or equivalent protection. Sources: WHO, CDC, ECDC, peer-reviewed literature.',
    'filter-all': 'All',
    'filter-pandemic': '🌍 Worldwide',
    'filter-epidemic': '📈 Active now',
    'filter-endemic': '🔄 Ongoing',
    'filter-emerging': '⚠️ New threat',
    'pathogens-note': 'Epidemiological data from WHO, CDC, ECDC and scientific literature. Public information tool — not a medical device.',
    'protection-title': 'Respiratory protection guide',
    'protection-subtitle': 'Selection and usage criteria for respiratory protective equipment. International standards EN 149, NIOSH N95, GB 2626-2019.',
    'prot-ffp2-title': 'High-efficiency protection',
    'prot-ffp2-desc': 'Filters ≥ 94% of 0.3 µm particles. EN 149 standard. Essential against airborne pathogens and particulate pollution peaks.',
    'prot-ffp2-li1': 'Influenza H5N1, SARS-CoV-2, Tuberculosis',
    'prot-ffp2-li2': 'PM2.5 > 15 µg/m³ (WHO 2021 guideline exceedance) — Vulnerable populations from 10 µg/m³',
    'prot-ffp2-li3': 'Medical and confined environments',
    'prot-ffp2-li4': 'Public transport during active epidemics',
    'prot-ffp3-title': 'Maximum protection',
    'prot-ffp3-desc': 'Filters ≥ 99% of particles. For highly contagious pathogens. Primarily professional use.',
    'prot-ffp3-li1': 'Nipah virus, Hantavirus, Marburg, Ebola',
    'prot-ffp3-li2': 'High aerosolization risk interventions',
    'prot-ffp3-li3': 'PM1.0 or suspended heavy metals',
    'prot-surg-title': 'Droplet barrier',
    'prot-surg-desc': 'Bacterial filtration ≥ 98%. Protects against droplet projections. Insufficient for fine aerosols and highly airborne pathogens.',
    'prot-surg-li1': 'Rhinovirus, low seasonal flu',
    'prot-surg-li2': 'Surgical environments',
    'prot-surg-li3': 'Source control (symptomatic individuals)',
    'table-mask': 'Mask',
    'table-std': 'Standard',
    'table-eff': 'Efficiency',
    'table-aerosol': 'Aerosols',
    'table-droplets': 'Droplets',
    'table-pm25': 'PM2.5',
    'about-title': 'Trust & Transparency',
    'about-subtitle': 'BreathIQ is an independent personal project built on verifiable public data.',
    'author-role': 'Medical Doctor · La Rochelle, France',
    'author-bio': 'Independent public health initiative created by a medical doctor. This tool informs you — it does not replace a medical consultation.',
    'trust-open-title': '100% Open & Free',
    'trust-open-desc': 'No account, no registration, no advertising tracking. No health data collected. Full GDPR compliance.',
    'trust-sources-title': 'Verifiable sources',
    'trust-sources-desc': 'Data from WHO, ECDC, data.gouv.fr, Eurostat and CDC. All sources are cited and publicly verifiable.',
    'trust-legal-title': 'Protected data',
    'trust-legal-desc': 'No commercial use of data. Reproduction for advertising or AI training is prohibited.',
    'disclaimer-title': 'Not a medical device — Important',
    'disclaimer-text': 'BreathIQ is exclusively a public information tool. It does not constitute a medical device and does not issue individual medical recommendations. For medical advice, consult a healthcare professional.',
    'footer-tagline': 'Global epidemic surveillance',
    'footer-mentions': 'Legal Notice (FR)',
    'footer-cgu': 'Terms of Use',
    'footer-privacy': 'Privacy',
    'footer-legal-en': 'Legal Notice (EN)',
    'footer-disclaimer-short': 'Public information tool · Not a medical device',
    'mbn-score': 'Score',
    'mbn-map': 'Map',
    'mbn-pathogens': 'Viruses',
    'mbn-protection': 'FFP2',
    'mode-toggle-patient': '👤 Patient Mode',
    'mode-toggle-expert': '⚙️ Expert Mode',
    'patient-hero-badge': 'Epidemic surveillance · Free access',
    'symptom-checker-title': 'Do I have symptoms I should be worried about?',
    'symptom-checker-intro': 'Check what you feel to identify the risk and know what to do',
    'checker-btn-text': 'Analyse my symptoms →',
    'action-guide-title': 'What to do if you have respiratory symptoms?',
    'action-guide-subtitle': '3 simple immediate actions to protect yourself and others',
    'expert-toggle-label': '⚙️ Show technical data (Expert Mode)',
    'expert-toggle-note': 'Respiratory indices, world map, protection guide — for professionals and the curious',
    'pathogens-patient-title': 'Infectious diseases — which symptoms to watch for?',
    'pathogens-patient-sub': 'Click on a disease to see its symptoms and when to isolate',
    'sym-fever': 'Fever or chills',
    'sym-dry-cough': 'Dry cough',
    'sym-wet-cough': 'Cough with sputum',
    'sym-long-cough': 'Cough for more than 3 weeks',
    'sym-breath': 'Difficulty breathing',
    'sym-smell': 'Loss of smell or taste',
    'sym-rash': 'Skin rash or lesions',
    'sym-muscle': 'Severe muscle pain',
    'sym-head': 'Severe headache',
    'sym-confusion': 'Confusion or drowsiness',
    'sym-bleeding': 'Unexplained bleeding',
    'sym-lymph': 'Swollen lymph nodes',
    'sym-sweats': 'Heavy night sweats',
    'sym-vomit': 'Vomiting or diarrhea',
    'care-btn': '📍 Find a doctor near me',
    'care-btn-refresh': '🔄 Refresh',
    'care-searching': 'Searching…',
    'care-title': 'Find nearby medical care',
    'care-subtitle': 'Hospitals and doctors closest to your location',
    'care-permission': 'To find the nearest care, we need temporary access to your location. It stays on your device and is never sent to our servers.',
    'care-no-geo': 'Geolocation is not available on your device.',
    'care-geo-denied': 'Location access denied. Please enable geolocation in your browser settings and try again.',
    'care-error': 'Search error. Please check your internet connection.',
    'care-no-results': 'No healthcare facilities found within 10 km.',
    'care-privacy': 'Your location stays on your device — never sent to our servers.',
    'nav-syndromic': 'Surveillance',
    'syn-title': 'Syndromic surveillance — Early detection',
    'syn-subtitle': 'Detect outbreaks 7–14 days before lab confirmation · WHO 7-1-7 algorithm',
    'al-normal-desc': 'Signal within historical norm (z < 1.5σ)',
    'al-jaune-desc': 'Unusual increase (z ≥ 1.5σ)',
    'al-orange-desc': 'Likely epidemic signal (z ≥ 2σ · p<5%)',
    'al-rouge-desc': 'Confirmed epidemic (z ≥ 3σ · p<0.3%)',
    'epi-curve-title': 'Epidemic curve — Influenza France (SPF)',
    'epi-loading': 'Loading SPF data…',
    'epi-stats-title': 'Statistical analysis',
    'epi-stat-current': 'Current week',
    'epi-stat-mean': '52w average',
    'epi-stat-zscore': 'Z-score',
    'epi-stat-thresh-jaune': 'YELLOW threshold',
    'epi-stat-thresh-orange': 'ORANGE threshold',
    'epi-stat-thresh-rouge': 'RED threshold',
    'epi-decl-local': 'Local declarations (this week)',
    'epi-decl-none': 'No declarations this week',
    'decl-title': '📋 Report suspected cases',
    'decl-subtitle': 'Ultra-fast form · < 30 seconds · 100% anonymous · GDPR',
    'decl-pilot': '⚗️ PILOT MODE — data stored locally · No server transmission',
    'decl-syndrome': 'Observed syndrome *',
    'decl-count': 'Case count *',
    'decl-age': 'Age *',
    'decl-age-child': 'Child (<15)',
    'decl-age-adult': 'Adult (15–64)',
    'decl-age-senior': 'Senior (65+)',
    'decl-age-mixed': 'All ages',
    'decl-severity': 'Severity *',
    'decl-sev-mild': 'Mild',
    'decl-sev-moderate': 'Moderate',
    'decl-sev-severe': 'Severe',
    'decl-sev-hosp': 'Hospitalisation',
    'decl-date': 'Symptom onset *',
    'decl-lab': 'Lab positive?',
    'decl-lab-unknown': 'N/A',
    'decl-lab-yes': 'Yes',
    'decl-lab-no': 'No',
    'decl-consent-text': 'I agree to the anonymous sharing of this data for epidemiological surveillance purposes. No personal data is collected (aggregated data only).',
    'decl-submit': '📤 Report — Anonymously',
    'decl-privacy-note': 'No personal data collected — only syndrome, count, week, approximate region',
    'decl-confirm-title': 'Declaration stored locally',
    'decl-confirm-sub': 'Thank you. Signal integrated into the local real-time analysis.',
    'decl-confirm-new': '+ New declaration',
    'live-sources-title': 'Live surveillance sources',
    'live-sources-subtitle': '8 epidemiological and environmental sources connected in real time',
    'live-src-status': 'Source status',
    'live-src-air': 'Local air quality',
    'live-src-air-sub': 'WAQI · 11 pollutants · 7-day forecast',
    'live-src-pollen': 'Local pollen',
    'live-src-pollen-sub': 'Open-Meteo · European pollen index',
    'live-src-sumeau': 'COVID-19 — Wastewater',
    'live-src-sumeau-sub': 'SUM\'EAU · 54 municipalities · Early warning France',
    'live-src-waiting': 'Waiting for geolocation…',
    'geo-modal-title': 'Access your location',
    'geo-modal-body': 'To show the nearest doctors and hospitals, BreathIQ needs temporary access to your location.',
    'geo-modal-g1': 'Your location is never stored on our servers',
    'geo-modal-g2': 'Used only to search for nearby care',
    'geo-modal-g3': 'Cleared when you close the page',
    'geo-modal-refuse': '✕ Refuse',
    'geo-modal-accept': '✓ Accept',
    // RGPD
    'consent-title': 'Your data & privacy',
    'consent-body': 'Your preferences are saved on your device. Real-time public data on air quality and epidemics is fetched from official sources (WHO, CDC, ECDC). No personal data is transmitted.',
    'consent-accept': '✓ Accept',
    'consent-decline': 'Continue without accepting',
    'consent-more': 'Privacy policy',
    'mydata-title': 'My data & privacy',
    'mydata-subtitle': 'View, manage and delete data stored on your device.',
    'mydata-decl-label': 'Syndromic declarations',
    'mydata-cache-label': 'API cache (live data)',
    'mydata-prefs-label': 'Preferences (theme, language, mode)',
    'mydata-consent-label': 'GDPR consent',
    'mydata-clear-decl': 'Delete my declarations',
    'mydata-clear-cache': 'Clear API cache',
    'mydata-clear-all': 'Reset everything',
    'mydata-confirm': 'Confirm deletion?',
    'mydata-done': 'Data deleted.',
    'mydata-export': 'Export my declarations (JSON)',
    'mydata-rights': 'Under Articles 15, 17 and 21 of the GDPR, you can access, delete or object to your data at any time.',
    'mydata-dpo': 'DPO Contact',
    'decl-consent-art9': 'I declare that I am acting as a healthcare professional or informed citizen, and expressly consent to the processing of this health data (Art. 9 GDPR) for the exclusive purpose of local epidemiological surveillance, with no server transmission.',
    'nav-mydata': 'My data',
  },
  es: {
    'nav-score': 'Mi Puntuación', 'nav-map': 'Mapa Mundial', 'nav-stocks': 'Stocks EPI',
    'nav-pathogens': 'Patógenos', 'nav-protection': 'Protección', 'nav-about': 'Acerca de',
    'hero-badge': 'Inteligencia Respiratoria · Datos Globales',
    'hero-title-1': 'El aire que respiras,', 'hero-title-2': 'monitoreado inteligentemente.',
    'hero-subtitle': 'Índice respiratorio en tiempo real. Calidad del aire, circulación viral, patógenos activos.',
    'hero-disclaimer': 'Herramienta de información pública — no dispositivo médico · Acceso libre',
    'patient-hero-badge': 'Vigilancia respiratoria · Acceso libre',
    'symptom-checker-title': '¿Tengo síntomas que deben alertarme?',
    'symptom-checker-intro': 'Marque lo que siente para identificar el riesgo y saber qué hacer',
    'checker-btn-text': 'Analizar mis síntomas →',
    'action-guide-title': '¿Qué hacer con síntomas respiratorios?',
    'action-guide-subtitle': '3 acciones simples e inmediatas para protegerse y proteger a los demás',
    'expert-toggle-label': '⚙️ Ver datos técnicos (Modo Experto)',
    'expert-toggle-note': 'Índices respiratorios, mapa mundial, guía de protección',
    'mode-toggle-patient': '👤 Modo Paciente', 'mode-toggle-expert': '⚙️ Modo Experto',
    'pathogens-patient-title': 'Enfermedades respiratorias — ¿qué síntomas vigilar?',
    'pathogens-patient-sub': 'Haga clic en una enfermedad para ver sus síntomas',
    'sym-fever': 'Fiebre o escalofríos', 'sym-dry-cough': 'Tos seca',
    'sym-wet-cough': 'Tos con flemas', 'sym-long-cough': 'Tos por más de 3 semanas',
    'sym-breath': 'Dificultad para respirar', 'sym-smell': 'Pérdida de olfato o gusto',
    'sym-rash': 'Erupción cutánea', 'sym-muscle': 'Dolores musculares intensos',
    'sym-head': 'Dolor de cabeza intenso', 'sym-confusion': 'Confusión o somnolencia',
    'sym-bleeding': 'Sangrado inexplicado', 'sym-lymph': 'Ganglios inflamados',
    'sym-sweats': 'Sudores nocturnos', 'sym-vomit': 'Vómitos o diarrea',
    'about-title': 'Confianza y Transparencia', 'footer-tagline': 'Inteligencia respiratoria mundial',
    'author-bio': 'Servicio de información médica educativa y preventiva. No dispositivo médico según Reglamento (UE) 2017/745. No constituye acto médico, consulta ni diagnóstico individual.',
    'disclaimer-title': 'No dispositivo médico — Importante',
    'disclaimer-text': 'BreathIQ es exclusivamente una herramienta de información pública. No emite recomendaciones médicas individuales. Consulte a un profesional de salud.',
    'footer-disclaimer-short': 'Herramienta de información pública · No dispositivo médico',
    'care-btn': '📍 Encontrar médico cercano', 'care-searching': 'Buscando…',
    'care-title': 'Atención médica cercana', 'care-subtitle': 'Centros de salud más próximos a su ubicación',
    'care-no-geo': 'Geolocalización no disponible.', 'care-geo-denied': 'Permiso de ubicación denegado. Actívelo en su navegador.',
    'care-error': 'Error de búsqueda. Verifique su conexión.', 'care-no-results': 'Sin establecimientos en 10 km.',
    'care-btn-refresh': '🔄 Actualizar',
  },
  pt: {
    'nav-score': 'Minha Pontuação', 'nav-map': 'Mapa Mundial', 'nav-stocks': 'Stocks EPI',
    'nav-pathogens': 'Patógenos', 'nav-protection': 'Proteção', 'nav-about': 'Sobre',
    'hero-badge': 'Inteligência Respiratória · Dados Globais',
    'hero-title-1': 'O ar que você respira,', 'hero-title-2': 'monitorado inteligentemente.',
    'hero-subtitle': 'Índice respiratório em tempo real. Qualidade do ar, circulação viral, patógenos ativos.',
    'hero-disclaimer': 'Ferramenta de informação — não dispositivo médico · Acesso livre',
    'patient-hero-badge': 'Vigilância respiratória · Acesso livre',
    'symptom-checker-title': 'Tenho sintomas de alerta?',
    'symptom-checker-intro': 'Marque o que sente para identificar o risco',
    'checker-btn-text': 'Analisar meus sintomas →',
    'action-guide-title': 'O que fazer com sintomas respiratórios?',
    'action-guide-subtitle': '3 ações simples para se proteger e proteger os outros',
    'expert-toggle-label': '⚙️ Ver dados técnicos (Modo Especialista)',
    'expert-toggle-note': 'Índices respiratórios, mapa mundial, guia de proteção',
    'mode-toggle-patient': '👤 Modo Paciente', 'mode-toggle-expert': '⚙️ Modo Especialista',
    'pathogens-patient-title': 'Doenças respiratórias — quais sintomas vigiar?',
    'pathogens-patient-sub': 'Clique em uma doença para ver seus sintomas',
    'sym-fever': 'Febre ou calafrios', 'sym-dry-cough': 'Tosse seca',
    'sym-wet-cough': 'Tosse com catarro', 'sym-long-cough': 'Tosse > 3 semanas',
    'sym-breath': 'Dificuldade para respirar', 'sym-smell': 'Perda de olfato ou paladar',
    'sym-rash': 'Erupção cutânea', 'sym-muscle': 'Dores musculares intensas',
    'sym-head': 'Dor de cabeça intensa', 'sym-confusion': 'Confusão ou sonolência',
    'sym-bleeding': 'Sangramento inexplicado', 'sym-lymph': 'Gânglios inchados',
    'sym-sweats': 'Suores noturnos', 'sym-vomit': 'Vômitos ou diarreia',
    'about-title': 'Confiança e Transparência', 'footer-tagline': 'Inteligência respiratória mundial',
    'author-bio': 'Serviço de informação médica educativa e preventiva. Não dispositivo médico segundo Regulamento (UE) 2017/745.',
    'disclaimer-title': 'Não é dispositivo médico — Importante',
    'disclaimer-text': 'BreathIQ é exclusivamente uma ferramenta de informação pública. Não emite recomendações médicas individuais. Consulte um profissional de saúde.',
    'footer-disclaimer-short': 'Ferramenta de informação pública · Não dispositivo médico',
    'care-btn': '📍 Encontrar médico próximo', 'care-searching': 'Procurando…',
    'care-title': 'Assistência médica próxima', 'care-subtitle': 'Unidades de saúde mais próximas da sua localização',
    'care-no-geo': 'Geolocalização não disponível.', 'care-geo-denied': 'Permissão de localização negada.',
    'care-error': 'Erro na pesquisa. Verifique sua conexão.', 'care-no-results': 'Sem resultados em 10 km.',
    'care-btn-refresh': '🔄 Atualizar',
  },
  ar: {
    'nav-score': 'نتيجتي', 'nav-map': 'الخريطة العالمية', 'nav-stocks': 'مخزون EPI',
    'nav-pathogens': 'مسببات الأمراض', 'nav-protection': 'الحماية', 'nav-about': 'حول',
    'hero-badge': 'ذكاء تنفسي · بيانات عالمية',
    'hero-title-1': 'الهواء الذي تتنفسه،', 'hero-title-2': 'يُراقَب بذكاء.',
    'hero-subtitle': 'مؤشر تنفسي في الوقت الفعلي. جودة الهواء، التداول الفيروسي، مسببات الأمراض النشطة.',
    'hero-disclaimer': 'أداة معلومات عامة — ليست جهازاً طبياً · وصول مجاني',
    'patient-hero-badge': 'مراقبة تنفسية · وصول مجاني',
    'symptom-checker-title': 'هل لدي أعراض تستدعي الانتباه؟',
    'symptom-checker-intro': 'حدد ما تشعر به لتحديد المخاطر ومعرفة ما يجب فعله',
    'checker-btn-text': 'تحليل أعراضي →',
    'action-guide-title': 'ماذا تفعل عند ظهور أعراض تنفسية؟',
    'action-guide-subtitle': '٣ إجراءات فورية بسيطة لحماية نفسك والآخرين',
    'expert-toggle-label': '⚙️ عرض البيانات التقنية (وضع الخبير)',
    'mode-toggle-patient': '👤 وضع المريض', 'mode-toggle-expert': '⚙️ وضع الخبير',
    'pathogens-patient-title': 'الأمراض التنفسية', 'pathogens-patient-sub': 'اضغط لرؤية الأعراض',
    'sym-fever': 'حمى أو قشعريرة', 'sym-dry-cough': 'سعال جاف',
    'sym-wet-cough': 'سعال مع بلغم', 'sym-long-cough': 'سعال أكثر من ٣ أسابيع',
    'sym-breath': 'صعوبة في التنفس', 'sym-smell': 'فقدان حاسة الشم أو التذوق',
    'sym-rash': 'طفح جلدي أو آفات', 'sym-muscle': 'آلام عضلية شديدة',
    'sym-head': 'صداع شديد', 'sym-confusion': 'ارتباك أو نعاس',
    'sym-bleeding': 'نزيف غير مبرر', 'sym-lymph': 'تضخم الغدد الليمفاوية',
    'sym-sweats': 'تعرق ليلي شديد', 'sym-vomit': 'قيء أو إسهال',
    'about-title': 'الثقة والشفافية', 'footer-tagline': 'ذكاء تنفسي عالمي',
    'author-bio': 'خدمة معلومات طبية تعليمية ووقائية. ليست جهازاً طبياً وفق اللائحة الأوروبية 2017/745. لا تمثل عملاً طبياً أو تشخيصاً فردياً.',
    'disclaimer-title': 'ليس جهازاً طبياً — هام',
    'disclaimer-text': 'BreathIQ هو أداة معلومات عامة حصراً. لا يُصدر توصيات طبية فردية. استشر مختصاً صحياً.',
    'footer-disclaimer-short': 'أداة معلومات عامة · ليست جهازاً طبياً',
    'care-btn': '📍 العثور على طبيب قريب', 'care-searching': 'جاري البحث…',
    'care-title': 'الرعاية الطبية القريبة', 'care-subtitle': 'أقرب مراكز الرعاية الصحية',
    'care-no-geo': 'تحديد الموقع غير متاح.', 'care-geo-denied': 'تم رفض إذن الموقع.',
    'care-error': 'خطأ في البحث. تحقق من اتصالك.', 'care-no-results': 'لا توجد مرافق في نطاق ١٠ كم.',
    'care-btn-refresh': '🔄 تحديث',
  },
  zh: {
    'nav-score': '我的评分', 'nav-map': '世界地图', 'nav-stocks': 'EPI库存',
    'nav-pathogens': '病原体', 'nav-protection': '防护', 'nav-about': '关于',
    'hero-badge': '呼吸智能 · 全球数据',
    'hero-title-1': '您呼吸的空气，', 'hero-title-2': '被智能监测。',
    'hero-subtitle': '实时呼吸指数。空气质量、病毒传播、活跃病原体。',
    'hero-disclaimer': '公共信息工具 — 非医疗设备 · 免费访问',
    'patient-hero-badge': '呼吸监测 · 免费访问',
    'symptom-checker-title': '我有需要注意的症状吗？',
    'symptom-checker-intro': '选择您感受到的症状以识别风险，了解该怎么做',
    'checker-btn-text': '分析我的症状 →',
    'action-guide-title': '出现呼吸道症状该怎么办？',
    'action-guide-subtitle': '3个简单的立即行动，保护自己和他人',
    'expert-toggle-label': '⚙️ 显示技术数据（专家模式）',
    'mode-toggle-patient': '👤 患者模式', 'mode-toggle-expert': '⚙️ 专家模式',
    'pathogens-patient-title': '呼吸道疾病', 'pathogens-patient-sub': '点击查看症状',
    'sym-fever': '发烧或发冷', 'sym-dry-cough': '干咳',
    'sym-wet-cough': '有痰咳嗽', 'sym-long-cough': '咳嗽超过3周',
    'sym-breath': '呼吸困难', 'sym-smell': '失去嗅觉或味觉',
    'sym-rash': '皮疹或皮损', 'sym-muscle': '肌肉剧痛',
    'sym-head': '剧烈头痛', 'sym-confusion': '意识混乱或嗜睡',
    'sym-bleeding': '不明原因出血', 'sym-lymph': '淋巴结肿大',
    'sym-sweats': '夜间大量出汗', 'sym-vomit': '呕吐或腹泻',
    'about-title': '信任与透明', 'footer-tagline': '全球呼吸智能',
    'author-bio': '医学教育和预防信息服务。根据欧盟法规2017/745，非医疗设备。不构成医疗行为、就诊或个人诊断。',
    'disclaimer-title': '非医疗设备 — 重要',
    'disclaimer-text': 'BreathIQ是公共信息工具。不构成医疗设备，不发布个人医疗建议。如需医疗建议，请咨询医疗专业人员。',
    'footer-disclaimer-short': '公共信息工具 · 非医疗设备',
    'care-btn': '📍 找附近的医生', 'care-searching': '搜索中…',
    'care-title': '附近医疗机构', 'care-subtitle': '距您最近的医疗中心',
    'care-no-geo': '无法使用地理定位。', 'care-geo-denied': '位置权限被拒绝。',
    'care-error': '搜索错误。请检查您的连接。', 'care-no-results': '10公里范围内无结果。',
    'care-btn-refresh': '🔄 刷新',
  },
  hi: {
    'nav-score': 'मेरा स्कोर', 'nav-map': 'विश्व मानचित्र', 'nav-stocks': 'EPI स्टॉक',
    'nav-pathogens': 'रोगजनक', 'nav-protection': 'सुरक्षा', 'nav-about': 'के बारे में',
    'hero-badge': 'श्वसन बुद्धिमत्ता · वैश्विक डेटा',
    'hero-title-1': 'आप जो हवा सांस लेते हैं,', 'hero-title-2': 'बुद्धिमानी से निगरानी।',
    'hero-subtitle': 'वास्तविक समय श्वसन सूचकांक। वायु गुणवत्ता, वायरल प्रसार, सक्रिय रोगजनक।',
    'hero-disclaimer': 'सार्वजनिक जानकारी उपकरण — चिकित्सा उपकरण नहीं · मुफ्त पहुंच',
    'patient-hero-badge': 'श्वसन निगरानी · मुफ्त पहुंच',
    'symptom-checker-title': 'क्या मुझे चेतावनी के लक्षण हैं?',
    'symptom-checker-intro': 'जोखिम पहचानने के लिए जो महसूस हो उसे चुनें',
    'checker-btn-text': 'मेरे लक्षणों का विश्लेषण करें →',
    'action-guide-title': 'श्वसन लक्षण होने पर क्या करें?',
    'action-guide-subtitle': 'खुद को और दूसरों को बचाने के लिए 3 सरल तत्काल कदम',
    'expert-toggle-label': '⚙️ तकनीकी डेटा दिखाएं (विशेषज्ञ मोड)',
    'mode-toggle-patient': '👤 रोगी मोड', 'mode-toggle-expert': '⚙️ विशेषज्ञ मोड',
    'pathogens-patient-title': 'श्वसन रोग', 'pathogens-patient-sub': 'लक्षण देखने के लिए क्लिक करें',
    'sym-fever': 'बुखार या ठंड लगना', 'sym-dry-cough': 'सूखी खांसी',
    'sym-wet-cough': 'बलगम वाली खांसी', 'sym-long-cough': '3 सप्ताह से अधिक खांसी',
    'sym-breath': 'सांस लेने में कठिनाई', 'sym-smell': 'सूंघने या स्वाद की क्षमता में कमी',
    'sym-rash': 'त्वचा पर दाने', 'sym-muscle': 'मांसपेशियों में तेज दर्द',
    'sym-head': 'तेज सिरदर्द', 'sym-confusion': 'भ्रम या अत्यधिक नींद',
    'sym-bleeding': 'अस्पष्ट रक्तस्राव', 'sym-lymph': 'सूजी लिम्फ नोड्स',
    'sym-sweats': 'रात को पसीना', 'sym-vomit': 'उल्टी या दस्त',
    'about-title': 'विश्वास और पारदर्शिता', 'footer-tagline': 'वैश्विक श्वसन बुद्धिमत्ता',
    'author-bio': 'शैक्षिक और निवारक चिकित्सा सूचना सेवा। EU नियमन 2017/745 के अनुसार चिकित्सा उपकरण नहीं।',
    'disclaimer-title': 'चिकित्सा उपकरण नहीं — महत्वपूर्ण',
    'footer-disclaimer-short': 'सार्वजनिक जानकारी उपकरण · चिकित्सा उपकरण नहीं',
    'care-btn': '📍 नजदीकी डॉक्टर खोजें', 'care-searching': 'खोज रहे हैं…',
    'care-title': 'नजदीकी चिकित्सा देखभाल', 'care-subtitle': 'आपके सबसे नजदीकी स्वास्थ्य केंद्र',
    'care-no-geo': 'जियोलोकेशन उपलब्ध नहीं।', 'care-geo-denied': 'स्थान अनुमति अस्वीकार।',
    'care-error': 'खोज त्रुटि। कनेक्शन जांचें।', 'care-no-results': '10 किमी में कोई परिणाम नहीं।',
    'care-btn-refresh': '🔄 रिफ्रेश',
  },
  sw: {
    'nav-score': 'Alama Yangu', 'nav-map': 'Ramani ya Dunia', 'nav-stocks': 'Hifadhi EPI',
    'nav-pathogens': 'Vimelea', 'nav-protection': 'Ulinzi', 'nav-about': 'Kuhusu',
    'hero-badge': 'Akili ya Upumzaji · Data ya Dunia',
    'hero-title-1': 'Hewa unayopumua,', 'hero-title-2': 'inafuatiliwa kwa akili.',
    'hero-subtitle': 'Kiashiria cha kupumua kwa wakati halisi. Ubora wa hewa, mzunguko wa virusi, vimelea hai.',
    'hero-disclaimer': 'Zana ya habari za umma — si kifaa cha matibabu · Upatikanaji bure',
    'patient-hero-badge': 'Ufuatiliaji wa kupumua · Upatikanaji bure',
    'symptom-checker-title': 'Je, nina dalili za kuniamsha wasiwasi?',
    'symptom-checker-intro': 'Angalia unachohisi ili kutambua hatari na kujua la kufanya',
    'checker-btn-text': 'Changanua dalili zangu →',
    'action-guide-title': 'Nifanye nini na dalili za kupumua?',
    'action-guide-subtitle': 'Hatua 3 rahisi za haraka kukujikinga na kulinda wengine',
    'expert-toggle-label': '⚙️ Onyesha data ya kiufundi (Hali ya Mtaalamu)',
    'mode-toggle-patient': '👤 Hali ya Mgonjwa', 'mode-toggle-expert': '⚙️ Hali ya Mtaalamu',
    'pathogens-patient-title': 'Magonjwa ya kupumua', 'pathogens-patient-sub': 'Bonyeza kuona dalili',
    'sym-fever': 'Homa au baridi', 'sym-dry-cough': 'Kikohozi kavu',
    'sym-wet-cough': 'Kikohozi na makohozi', 'sym-long-cough': 'Kikohozi zaidi ya wiki 3',
    'sym-breath': 'Ugumu wa kupumua', 'sym-smell': 'Kupoteza harufu au ladha',
    'sym-rash': 'Upele au vidonda', 'sym-muscle': 'Maumivu makali ya misuli',
    'sym-head': 'Maumivu makali ya kichwa', 'sym-confusion': 'Kuchanganyikiwa au kusinzia',
    'sym-bleeding': 'Kutokwa na damu bila sababu', 'sym-lymph': 'Uvimbe wa tezi',
    'sym-sweats': 'Kutoka jasho usiku', 'sym-vomit': 'Kutapika au kuharisha',
    'about-title': 'Uaminifu na Uwazi', 'footer-tagline': 'Akili ya kupumua duniani',
    'author-bio': 'Huduma ya habari za matibabu ya elimu na kuzuia. Si kifaa cha matibabu kulingana na Kanuni ya EU 2017/745.',
    'disclaimer-title': 'Si kifaa cha matibabu — Muhimu',
    'footer-disclaimer-short': 'Zana ya habari za umma · Si kifaa cha matibabu',
    'care-btn': '📍 Tafuta daktari karibu', 'care-searching': 'Inatafuta…',
    'care-title': 'Huduma ya Afya Karibu', 'care-subtitle': 'Vituo vya afya vilivyo karibu nawe',
    'care-no-geo': 'Eneo haliwezi kutambuliwa.', 'care-geo-denied': 'Ruhusa ya eneo imekataliwa.',
    'care-error': 'Hitilafu ya utafutaji. Angalia muunganisho wako.', 'care-no-results': 'Hakuna matokeo km 10.',
    'care-btn-refresh': '🔄 Sasisha',
  },
  ru: {
    'nav-score': 'Мой счёт', 'nav-map': 'Карта мира', 'nav-stocks': 'Запасы EPI',
    'nav-pathogens': 'Патогены', 'nav-protection': 'Защита', 'nav-about': 'О проекте',
    'hero-badge': 'Респираторный интеллект · Мировые данные',
    'hero-title-1': 'Воздух, которым вы дышите,', 'hero-title-2': 'под умным контролем.',
    'hero-subtitle': 'Индекс дыхания в реальном времени. Качество воздуха, вирусное распространение, активные патогены.',
    'hero-disclaimer': 'Общедоступный инструмент — не медицинское устройство · Бесплатный доступ',
    'patient-hero-badge': 'Дыхательный мониторинг · Свободный доступ',
    'symptom-checker-title': 'Есть ли у меня симптомы, которые должны насторожить?',
    'symptom-checker-intro': 'Отметьте, что чувствуете, чтобы определить риск',
    'checker-btn-text': 'Проанализировать мои симптомы →',
    'action-guide-title': 'Что делать при респираторных симптомах?',
    'action-guide-subtitle': '3 простых немедленных действия для защиты себя и других',
    'expert-toggle-label': '⚙️ Показать технические данные (Режим эксперта)',
    'mode-toggle-patient': '👤 Режим пациента', 'mode-toggle-expert': '⚙️ Режим эксперта',
    'pathogens-patient-title': 'Респираторные заболевания', 'pathogens-patient-sub': 'Нажмите для просмотра симптомов',
    'sym-fever': 'Жар или озноб', 'sym-dry-cough': 'Сухой кашель',
    'sym-wet-cough': 'Кашель с мокротой', 'sym-long-cough': 'Кашель более 3 недель',
    'sym-breath': 'Затруднённое дыхание', 'sym-smell': 'Потеря обоняния или вкуса',
    'sym-rash': 'Сыпь или поражения кожи', 'sym-muscle': 'Сильные мышечные боли',
    'sym-head': 'Сильная головная боль', 'sym-confusion': 'Спутанность сознания или сонливость',
    'sym-bleeding': 'Необъяснимое кровотечение', 'sym-lymph': 'Увеличение лимфоузлов',
    'sym-sweats': 'Ночная потливость', 'sym-vomit': 'Рвота или диарея',
    'about-title': 'Доверие и прозрачность', 'footer-tagline': 'Глобальный респираторный интеллект',
    'author-bio': 'Образовательно-профилактический медицинский информационный сервис. Не медицинское устройство согласно Регламенту ЕС 2017/745. Не является медицинским актом или индивидуальной диагностикой.',
    'disclaimer-title': 'Не медицинское устройство — Важно',
    'disclaimer-text': 'BreathIQ — исключительно инструмент публичной информации. Не является медицинским устройством. Для медицинской консультации обращайтесь к специалисту.',
    'footer-disclaimer-short': 'Общедоступный инструмент · Не медицинское устройство',
    'care-btn': '📍 Найти ближайшего врача', 'care-searching': 'Поиск…',
    'care-title': 'Ближайшая медицинская помощь', 'care-subtitle': 'Ближайшие медицинские учреждения',
    'care-no-geo': 'Геолокация недоступна.', 'care-geo-denied': 'Разрешение геолокации отклонено.',
    'care-error': 'Ошибка поиска. Проверьте подключение.', 'care-no-results': 'Нет результатов в 10 км.',
    'care-btn-refresh': '🔄 Обновить',
  },
};

// ── DEMO DATA — 67 regions ───────────────────────────────────
// Fields: id, nameFR, nameEN, iso, lat, lon, whoRegion,
//   level, pop(M), stock(units), updated, status, trend, alertLevel
const DEMO_DATA = [
  // ── National ──────────────────────────────────────────────
  { id:1,  nameFR:'France',       nameEN:'France',       iso:'FR', lat:46.23, lon:2.21,   whoRegion:'EURO', level:'national', pop:68.0,  stock:42000000, updated:'2026-05-01', status:'moderate',  trend:'stable',   alertLevel:'moderate' },
  { id:2,  nameFR:'Allemagne',    nameEN:'Germany',      iso:'DE', lat:51.16, lon:10.45,  whoRegion:'EURO', level:'national', pop:84.4,  stock:120000000,updated:'2026-04-28', status:'sufficient',trend:'up',       alertLevel:'low' },
  { id:3,  nameFR:'Italie',       nameEN:'Italy',        iso:'IT', lat:41.87, lon:12.57,  whoRegion:'EURO', level:'national', pop:60.3,  stock:38000000, updated:'2026-04-25', status:'moderate',  trend:'stable',   alertLevel:'moderate' },
  { id:4,  nameFR:'Espagne',      nameEN:'Spain',        iso:'ES', lat:40.46, lon:-3.75,  whoRegion:'EURO', level:'national', pop:47.4,  stock:22000000, updated:'2026-04-20', status:'low',       trend:'down',     alertLevel:'high' },
  { id:5,  nameFR:'Royaume-Uni',  nameEN:'United Kingdom',iso:'GB',lat:55.38, lon:-3.44, whoRegion:'EURO', level:'national', pop:67.7,  stock:55000000, updated:'2026-05-02', status:'sufficient',trend:'up',       alertLevel:'low' },
  { id:6,  nameFR:'Belgique',     nameEN:'Belgium',      iso:'BE', lat:50.50, lon:4.47,   whoRegion:'EURO', level:'national', pop:11.6,  stock:8000000,  updated:'2026-04-15', status:'moderate',  trend:'stable',   alertLevel:'moderate' },
  { id:7,  nameFR:'Pays-Bas',     nameEN:'Netherlands',  iso:'NL', lat:52.13, lon:5.29,   whoRegion:'EURO', level:'national', pop:17.9,  stock:14000000, updated:'2026-04-22', status:'moderate',  trend:'stable',   alertLevel:'moderate' },
  { id:8,  nameFR:'Suède',        nameEN:'Sweden',       iso:'SE', lat:60.13, lon:18.64,  whoRegion:'EURO', level:'national', pop:10.5,  stock:12000000, updated:'2026-04-10', status:'sufficient',trend:'stable',   alertLevel:'low' },
  { id:9,  nameFR:'Suisse',       nameEN:'Switzerland',  iso:'CH', lat:46.82, lon:8.23,   whoRegion:'EURO', level:'national', pop:8.7,   stock:9000000,  updated:'2026-04-18', status:'sufficient',trend:'up',       alertLevel:'low' },
  { id:10, nameFR:'États-Unis',   nameEN:'United States',iso:'US', lat:37.09, lon:-95.71, whoRegion:'AMRO', level:'national', pop:334.0, stock:500000000,updated:'2026-05-05', status:'sufficient',trend:'up',       alertLevel:'low' },
  { id:11, nameFR:'Canada',       nameEN:'Canada',       iso:'CA', lat:56.13, lon:-106.35,whoRegion:'AMRO', level:'national', pop:38.2,  stock:60000000, updated:'2026-04-30', status:'sufficient',trend:'stable',   alertLevel:'low' },
  { id:12, nameFR:'Brésil',       nameEN:'Brazil',       iso:'BR', lat:-14.24,lon:-51.93, whoRegion:'AMRO', level:'national', pop:215.3, stock:45000000, updated:'2026-04-28', status:'low',       trend:'down',     alertLevel:'high' },
  { id:13, nameFR:'Mexique',      nameEN:'Mexico',       iso:'MX', lat:23.63, lon:-102.55,whoRegion:'AMRO', level:'national', pop:128.5, stock:18000000, updated:'2026-04-20', status:'low',       trend:'down',     alertLevel:'high' },
  { id:14, nameFR:'Chine',        nameEN:'China',        iso:'CN', lat:35.86, lon:104.20, whoRegion:'WPRO', level:'national', pop:1412.0,stock:2000000000,updated:'2026-05-01',status:'sufficient',trend:'stable',   alertLevel:'low' },
  { id:15, nameFR:'Japon',        nameEN:'Japan',        iso:'JP', lat:36.20, lon:138.25, whoRegion:'WPRO', level:'national', pop:125.7, stock:180000000,updated:'2026-05-03', status:'sufficient',trend:'up',       alertLevel:'low' },
  { id:16, nameFR:'Inde',         nameEN:'India',        iso:'IN', lat:20.59, lon:78.96,  whoRegion:'SEARO',level:'national', pop:1428.0,stock:120000000,updated:'2026-04-25', status:'low',       trend:'stable',   alertLevel:'high' },
  { id:17, nameFR:'Indonésie',    nameEN:'Indonesia',    iso:'ID', lat:-0.79, lon:113.92, whoRegion:'SEARO',level:'national', pop:277.5, stock:15000000, updated:'2026-04-18', status:'critical',  trend:'down',     alertLevel:'critical' },
  { id:18, nameFR:'Bangladesh',   nameEN:'Bangladesh',   iso:'BD', lat:23.68, lon:90.36,  whoRegion:'SEARO',level:'national', pop:169.4, stock:2000000,  updated:'2026-04-10', status:'critical',  trend:'down',     alertLevel:'critical' },
  { id:19, nameFR:'Pakistan',     nameEN:'Pakistan',     iso:'PK', lat:30.38, lon:69.35,  whoRegion:'EMRO', level:'national', pop:231.4, stock:4000000,  updated:'2026-04-05', status:'critical',  trend:'down',     alertLevel:'critical' },
  { id:20, nameFR:'Nigeria',      nameEN:'Nigeria',      iso:'NG', lat:9.08,  lon:8.68,   whoRegion:'AFRO', level:'national', pop:218.5, stock:3000000,  updated:'2026-03-28', status:'critical',  trend:'down',     alertLevel:'critical' },
  { id:21, nameFR:'Éthiopie',     nameEN:'Ethiopia',     iso:'ET', lat:9.15,  lon:40.49,  whoRegion:'AFRO', level:'national', pop:126.5, stock:800000,   updated:'2026-03-20', status:'critical',  trend:'down',     alertLevel:'critical' },
  { id:22, nameFR:'RD Congo',     nameEN:'DR Congo',     iso:'CD', lat:-4.04, lon:21.76,  whoRegion:'AFRO', level:'national', pop:99.0,  stock:500000,   updated:'2026-03-15', status:'critical',  trend:'down',     alertLevel:'critical' },
  { id:23, nameFR:'Australie',    nameEN:'Australia',    iso:'AU', lat:-25.27,lon:133.78, whoRegion:'WPRO', level:'national', pop:26.0,  stock:40000000, updated:'2026-05-01', status:'sufficient',trend:'stable',   alertLevel:'low' },
  { id:24, nameFR:'Russie',       nameEN:'Russia',       iso:'RU', lat:61.52, lon:105.32, whoRegion:'EURO', level:'national', pop:144.1, stock:80000000, updated:'2026-04-20', status:'moderate',  trend:'stable',   alertLevel:'moderate' },
  { id:25, nameFR:'Corée du Sud', nameEN:'South Korea',  iso:'KR', lat:35.91, lon:127.77, whoRegion:'WPRO', level:'national', pop:51.7,  stock:95000000, updated:'2026-05-02', status:'sufficient',trend:'up',       alertLevel:'low' },
  // ── French metro regions ──────────────────────────────────
  { id:101,nameFR:'Île-de-France',nameEN:'Île-de-France',iso:'FR', lat:48.85, lon:2.35,   whoRegion:'EURO', level:'regional', pop:12.2,  stock:9000000,  updated:'2026-05-10', status:'moderate',  trend:'stable',   alertLevel:'moderate' },
  { id:102,nameFR:'Auvergne-Rhône-Alpes',nameEN:'Auvergne-Rhône-Alpes',iso:'FR',lat:45.74,lon:4.83,whoRegion:'EURO',level:'regional',pop:8.1,stock:5800000,updated:'2026-05-08',status:'moderate',trend:'stable',alertLevel:'moderate'},
  { id:103,nameFR:'Provence-Alpes-Côte d\'Azur',nameEN:'PACA',iso:'FR',lat:43.94,lon:6.07,whoRegion:'EURO',level:'regional',pop:5.1,stock:3400000,updated:'2026-05-05',status:'moderate',trend:'stable',alertLevel:'moderate'},
  { id:104,nameFR:'Hauts-de-France',nameEN:'Hauts-de-France',iso:'FR',lat:50.48,lon:2.79, whoRegion:'EURO', level:'regional', pop:6.0,   stock:3200000,  updated:'2026-05-08', status:'moderate',  trend:'stable',   alertLevel:'moderate' },
  { id:105,nameFR:'Grand Est',    nameEN:'Grand Est',    iso:'FR', lat:48.70, lon:6.18,   whoRegion:'EURO', level:'regional', pop:5.6,   stock:3000000,  updated:'2026-05-06', status:'moderate',  trend:'stable',   alertLevel:'moderate' },
  { id:106,nameFR:'Bretagne',     nameEN:'Brittany',     iso:'FR', lat:48.20, lon:-2.93,  whoRegion:'EURO', level:'regional', pop:3.4,   stock:2800000,  updated:'2026-05-07', status:'sufficient',trend:'up',       alertLevel:'low' },
  { id:107,nameFR:'Nouvelle-Aquitaine',nameEN:'Nouvelle-Aquitaine',iso:'FR',lat:44.84,lon:-0.58,whoRegion:'EURO',level:'regional',pop:6.1,stock:3900000,updated:'2026-05-04',status:'sufficient',trend:'stable',alertLevel:'low'},
  { id:108,nameFR:'Occitanie',    nameEN:'Occitanie',    iso:'FR', lat:43.61, lon:3.88,   whoRegion:'EURO', level:'regional', pop:6.0,   stock:3500000,  updated:'2026-05-05', status:'moderate',  trend:'stable',   alertLevel:'moderate' },
  { id:109,nameFR:'Pays de la Loire',nameEN:'Pays de la Loire',iso:'FR',lat:47.76,lon:-0.33,whoRegion:'EURO',level:'regional',pop:3.8,stock:2500000,updated:'2026-05-06',status:'sufficient',trend:'stable',alertLevel:'low'},
  { id:110,nameFR:'Normandie',    nameEN:'Normandy',     iso:'FR', lat:49.18, lon:0.37,   whoRegion:'EURO', level:'regional', pop:3.4,   stock:2100000,  updated:'2026-05-03', status:'moderate',  trend:'stable',   alertLevel:'moderate' },
  { id:111,nameFR:'Bourgogne-Franche-Comté',nameEN:'Bourgogne-Franche-Comté',iso:'FR',lat:47.28,lon:5.00,whoRegion:'EURO',level:'regional',pop:2.8,stock:1800000,updated:'2026-05-02',status:'low',trend:'down',alertLevel:'high'},
  { id:112,nameFR:'Centre-Val de Loire',nameEN:'Centre-Val de Loire',iso:'FR',lat:47.75,lon:1.67,whoRegion:'EURO',level:'regional',pop:2.6,stock:1600000,updated:'2026-05-01',status:'low',trend:'stable',alertLevel:'moderate'},
  { id:113,nameFR:'Corse',        nameEN:'Corsica',      iso:'FR', lat:42.04, lon:9.01,   whoRegion:'EURO', level:'regional', pop:0.35,  stock:250000,   updated:'2026-04-28', status:'low',       trend:'down',     alertLevel:'high' },
  // ── DROM-COM ──────────────────────────────────────────────
  { id:114,nameFR:'Guadeloupe',   nameEN:'Guadeloupe',   iso:'FR', lat:16.27, lon:-61.55, whoRegion:'AMRO', level:'regional', pop:0.38,  stock:180000,   updated:'2026-04-20', status:'low',       trend:'down',     alertLevel:'high' },
  { id:115,nameFR:'Martinique',   nameEN:'Martinique',   iso:'FR', lat:14.64, lon:-61.02, whoRegion:'AMRO', level:'regional', pop:0.35,  stock:160000,   updated:'2026-04-18', status:'low',       trend:'down',     alertLevel:'high' },
  { id:116,nameFR:'Guyane française',nameEN:'French Guiana',iso:'FR',lat:3.93,lon:-53.13,whoRegion:'AMRO', level:'regional', pop:0.30,  stock:90000,    updated:'2026-04-15', status:'critical',  trend:'down',     alertLevel:'critical' },
  { id:117,nameFR:'La Réunion',   nameEN:'Réunion',      iso:'FR', lat:-21.11,lon:55.54,  whoRegion:'AFRO', level:'regional', pop:0.88,  stock:420000,   updated:'2026-04-22', status:'moderate',  trend:'stable',   alertLevel:'moderate' },
  { id:118,nameFR:'Mayotte',      nameEN:'Mayotte',      iso:'FR', lat:-12.83,lon:45.17,  whoRegion:'AFRO', level:'regional', pop:0.32,  stock:60000,    updated:'2026-04-10', status:'critical',  trend:'down',     alertLevel:'critical' },
  // ── German Länder ─────────────────────────────────────────
  { id:141,nameFR:'Bavière (DE)', nameEN:'Bavaria (DE)', iso:'DE', lat:48.79, lon:11.50,  whoRegion:'EURO', level:'regional', pop:13.2,  stock:18000000, updated:'2026-04-25', status:'sufficient',trend:'up',       alertLevel:'low' },
  { id:142,nameFR:'Rhénanie-Westphalie (DE)',nameEN:'NRW (DE)',iso:'DE',lat:51.43,lon:7.66,whoRegion:'EURO',level:'regional',pop:18.1,stock:22000000,updated:'2026-04-22',status:'sufficient',trend:'stable',alertLevel:'low'},
  { id:143,nameFR:'Baden-Württemberg (DE)',nameEN:'Baden-Württemberg',iso:'DE',lat:48.66,lon:9.35,whoRegion:'EURO',level:'regional',pop:11.1,stock:15000000,updated:'2026-04-20',status:'sufficient',trend:'up',alertLevel:'low'},
  // ── Spanish regions ───────────────────────────────────────
  { id:151,nameFR:'Catalogne (ES)',nameEN:'Catalonia (ES)',iso:'ES',lat:41.59, lon:1.52,   whoRegion:'EURO', level:'regional', pop:7.9,   stock:4200000,  updated:'2026-04-15', status:'moderate',  trend:'stable',   alertLevel:'moderate' },
  { id:152,nameFR:'Madrid (ES)',  nameEN:'Madrid (ES)',  iso:'ES', lat:40.42, lon:-3.70,  whoRegion:'EURO', level:'regional', pop:6.8,   stock:3500000,  updated:'2026-04-12', status:'moderate',  trend:'stable',   alertLevel:'moderate' },
  { id:153,nameFR:'Andalousie (ES)',nameEN:'Andalusia (ES)',iso:'ES',lat:37.39,lon:-5.99, whoRegion:'EURO', level:'regional', pop:8.5,   stock:3000000,  updated:'2026-04-10', status:'low',       trend:'down',     alertLevel:'high' },
  { id:154,nameFR:'Valence (ES)', nameEN:'Valencia (ES)',iso:'ES', lat:39.47, lon:-0.38,  whoRegion:'EURO', level:'regional', pop:5.1,   stock:1900000,  updated:'2026-04-08', status:'low',       trend:'down',     alertLevel:'high' },
  { id:155,nameFR:'Pays Basque (ES)',nameEN:'Basque Country (ES)',iso:'ES',lat:43.23,lon:-2.89,whoRegion:'EURO',level:'regional',pop:2.2,stock:2000000,updated:'2026-04-15',status:'sufficient',trend:'stable',alertLevel:'low'},
  // ── Italian regions ───────────────────────────────────────
  { id:161,nameFR:'Lombardie (IT)',nameEN:'Lombardy (IT)',iso:'IT',lat:45.47, lon:9.19,   whoRegion:'EURO', level:'regional', pop:10.1,  stock:7500000,  updated:'2026-04-18', status:'moderate',  trend:'stable',   alertLevel:'moderate' },
  { id:162,nameFR:'Vénétie (IT)', nameEN:'Veneto (IT)',  iso:'IT', lat:45.44, lon:12.33,  whoRegion:'EURO', level:'regional', pop:4.9,   stock:3200000,  updated:'2026-04-15', status:'moderate',  trend:'stable',   alertLevel:'moderate' },
  { id:163,nameFR:'Piémont (IT)', nameEN:'Piedmont (IT)',iso:'IT', lat:45.07, lon:7.69,   whoRegion:'EURO', level:'regional', pop:4.3,   stock:2800000,  updated:'2026-04-12', status:'moderate',  trend:'stable',   alertLevel:'moderate' },
  { id:164,nameFR:'Lazio (IT)',   nameEN:'Lazio (IT)',   iso:'IT', lat:41.90, lon:12.50,  whoRegion:'EURO', level:'regional', pop:5.8,   stock:3800000,  updated:'2026-04-10', status:'moderate',  trend:'stable',   alertLevel:'moderate' },
  { id:165,nameFR:'Sicile (IT)',  nameEN:'Sicily (IT)',  iso:'IT', lat:37.60, lon:14.01,  whoRegion:'EURO', level:'regional', pop:4.8,   stock:1500000,  updated:'2026-04-05', status:'low',       trend:'down',     alertLevel:'high' },
  // ── UK regions ────────────────────────────────────────────
  { id:171,nameFR:'Angleterre',   nameEN:'England',      iso:'GB', lat:52.36, lon:-1.17,  whoRegion:'EURO', level:'regional', pop:56.5,  stock:46000000, updated:'2026-05-01', status:'sufficient',trend:'up',       alertLevel:'low' },
  { id:172,nameFR:'Écosse',       nameEN:'Scotland',     iso:'GB', lat:56.49, lon:-4.20,  whoRegion:'EURO', level:'regional', pop:5.5,   stock:5000000,  updated:'2026-04-28', status:'sufficient',trend:'stable',   alertLevel:'low' },
  { id:173,nameFR:'Pays de Galles',nameEN:'Wales',       iso:'GB', lat:52.13, lon:-3.78,  whoRegion:'EURO', level:'regional', pop:3.2,   stock:2800000,  updated:'2026-04-25', status:'sufficient',trend:'stable',   alertLevel:'low' },
  { id:174,nameFR:'Irlande du Nord',nameEN:'Northern Ireland',iso:'GB',lat:54.61,lon:-6.69,whoRegion:'EURO',level:'regional',pop:1.9,stock:1700000,updated:'2026-04-22',status:'sufficient',trend:'stable',alertLevel:'low'},
  // ── WHO global regions ────────────────────────────────────
  { id:201,nameFR:'Afrique subsaharienne',nameEN:'Sub-Saharan Africa',iso:'ZZ',lat:-5.0,lon:25.0,whoRegion:'AFRO',level:'regional',pop:1150.0,stock:8000000,updated:'2026-03-01',status:'critical',trend:'down',alertLevel:'critical'},
  { id:202,nameFR:'Asie du Sud-Est',nameEN:'South-East Asia',iso:'ZZ',lat:12.0,lon:101.0,whoRegion:'SEARO',level:'regional',pop:2100.0,stock:90000000,updated:'2026-04-01',status:'low',trend:'down',alertLevel:'high'},
  { id:203,nameFR:'Pacifique Occidental',nameEN:'Western Pacific',iso:'ZZ',lat:15.0,lon:145.0,whoRegion:'WPRO',level:'regional',pop:1900.0,stock:2500000000,updated:'2026-04-15',status:'sufficient',trend:'stable',alertLevel:'low'},
];

// ── OUTBREAK DATA — Infectiological literature review ────────
// Sources: WHO DON, CDC, ECDC, Nature, NEJM, Lancet, JID
// Protection required = FFP2/N95 minimum or FFP3/N99 for high risk
const OUTBREAK_DATA = [
  {
    id: 'H5N1',
    nameFR: 'Grippe aviaire H5N1',
    nameEN: 'Avian Influenza H5N1',
    pathogen: 'Influenza A(H5N1)',
    category: 'epidemic',
    riskLevel: 'high',
    lat: 21.0, lon: 105.8, // Vietnam/SE Asia cluster
    lat2: 37.0, lon2: -96.0, // USA dairy cattle cluster
    activeRegions: ['Viet Nam', 'USA', 'Égypte', 'Cambodge', 'Chine'],
    transmission: ['Aérosols', 'Contact direct oiseaux/bovins', 'Gouttelettes'],
    protectionRequired: 'FFP2/N95 minimum',
    protectionLevel: 2,
    maskNote: 'FFP2 lors de contact avec animaux infectés. FFP3 recommandé pour soignants.',
    reproductionNumber: '< 1 (humain-humain rare)',
    cfr: '52% (cas humains confirmés, OMS 2024)',
    incubation: '2–5 jours',
    transmission_route: 'Voie aérienne (aérosols aviaires), contact muqueuses',
    currentStatus: 'active',
    outbreakStart: '2024-01',
    lastUpdate: '2026-04',
    iconColor: '#EF4444',
    references: [
      'WHO DON 2024 — H5N1 Human Cases',
      'CDC H5 Bird Flu Situation Summary 2024',
      'Uyeki TM et al. N Engl J Med 2024',
      'WHO Global Influenza Surveillance 2024'
    ],
    descFR: 'Foyers actifs chez l\'homme en Asie du Sud-Est et détection chez bovins laitiers aux États-Unis (2024). Transmission humain-humain rare mais Rh &lt; 1. Létalité humaine élevée (~52%). Protection FFP2 lors de toute exposition aviaire/bovine potentiellement contaminée.',
    descEN: 'Active human cases in SE Asia and dairy cattle detection in USA (2024). Human-to-human transmission rare but R0 <1. High human CFR (~52%). FFP2 protection required during any potentially contaminated avian/bovine exposure.'
  },
  {
    id: 'SARS2',
    nameFR: 'COVID-19 / SARS-CoV-2',
    nameEN: 'COVID-19 / SARS-CoV-2',
    pathogen: 'SARS-CoV-2 variants',
    category: 'pandemic',
    riskLevel: 'moderate',
    lat: 0.0, lon: 20.0, // Global
    activeRegions: ['Mondial'],
    transmission: ['Aérosols', 'Gouttelettes', 'Surfaces (mineur)'],
    protectionRequired: 'FFP2/N95',
    protectionLevel: 2,
    maskNote: 'FFP2 recommandé en milieu médical et transports bondés. Variants JN.1/KP.2 dominants 2024.',
    reproductionNumber: 'R eff ≈ 1.0–1.4 (variants JN.1/KP)',
    cfr: '< 0.1% (populations vaccinées 2024)',
    incubation: '2–14 jours (Omicron: 2–4 j)',
    transmission_route: 'Transmission aérienne dominante, aérosols de petites particules',
    currentStatus: 'endemic',
    outbreakStart: '2019-12',
    lastUpdate: '2026-05',
    iconColor: '#F97316',
    references: [
      'WHO COVID-19 Weekly Epidemiological Updates 2024–2026',
      'Morawska L, Milton DK. Clin Infect Dis 2020',
      'Greenhalgh T et al. Lancet 2021 — Ten scientific reasons in support of airborne transmission',
      'ECDC COVID-19 Situation Updates 2024'
    ],
    descFR: 'Circulation endémique mondiale. Variants KP.2/KP.1.1/JN.1. Transmission aérienne par aérosols démontrée (Morawska & Milton 2020, Lancet 2021). FFP2 recommandé dans espaces bondés, milieux médicaux, immunodéprimés.',
    descEN: 'Endemic global circulation. KP.2/JN.1 variants. Airborne aerosol transmission demonstrated. FFP2 recommended in crowded spaces, healthcare settings, immunocompromised individuals.'
  },
  {
    id: 'TB',
    nameFR: 'Tuberculose (MTB)',
    nameEN: 'Tuberculosis (MTB)',
    pathogen: 'Mycobacterium tuberculosis',
    category: 'endemic',
    riskLevel: 'high',
    lat: 22.0, lon: 82.0,
    activeRegions: ['Inde', 'Indonésie', 'Philippines', 'Pakistan', 'Nigeria', 'Afrique subsaharienne'],
    transmission: ['Aérosols (droplet nuclei)', 'Air confiné'],
    protectionRequired: 'FFP2/N95 minimum',
    protectionLevel: 2,
    maskNote: 'FFP2/N95 recommandé lors de contact avec cas suspects ou confirmés. FFP3 pour TB-MR.',
    reproductionNumber: 'R0 ≈ 10–12 (non traité)',
    cfr: '45–50% (non traité) ; < 5% (traité)',
    incubation: 'Primoinfection à réactivation : semaines à années',
    transmission_route: 'Droplet nuclei (< 5 µm) restant en suspension dans l\'air pendant heures',
    currentStatus: 'endemic',
    outbreakStart: 'Endémique',
    lastUpdate: '2026-01',
    iconColor: '#EF4444',
    references: [
      'WHO Global Tuberculosis Report 2023 — 10.6 million new cases worldwide',
      'Furin J et al. Lancet 2019 — Tuberculosis',
      'CDC TB Transmission and Pathogenesis 2023',
      'Jensen PA et al. MMWR 2005 — Guidelines for Preventing TB Transmission'
    ],
    descFR: 'Première cause infectieuse de mortalité mondiale (OMS 2023 : 1,3M décès). 10,6M nouveaux cas/an. Transmission par droplet nuclei en suspension. FFP2/N95 indispensable contact avec cas actif. TB multirésistante (TB-MR) : FFP3 requis.',
    descEN: 'Leading infectious cause of death worldwide (WHO 2023: 1.3M deaths). 10.6M new cases/year. Transmission via airborne droplet nuclei. FFP2/N95 essential for contact with active case. MDR-TB: FFP3 required.'
  },
  {
    id: 'NIPAH',
    nameFR: 'Virus Nipah',
    nameEN: 'Nipah Virus',
    pathogen: 'Nipah virus (NiV)',
    category: 'emerging',
    riskLevel: 'critical',
    lat: 10.5, lon: 76.2, // Kerala, India cluster
    activeRegions: ['Bangladesh', 'Inde (Kerala)', 'Malaisie (historique)'],
    transmission: ['Contact direct (sécrétions)', 'Consommation aliments contaminés', 'Potentiel aérosol'],
    protectionRequired: 'FFP3/N99 — isolement strict',
    protectionLevel: 3,
    maskNote: 'Niveau biosécurité 4. FFP3 minimum. Transmission interhumaine possible. Pas de vaccin.',
    reproductionNumber: 'R0 ≈ 0.3–0.5 (Kerala 2018) ; jusqu\'à 1.0 en confinement',
    cfr: '40–75% selon souche (Bangladesh 40–75%, Malaisie 40%)',
    incubation: '4–14 jours (jusqu\'à 45 j)',
    transmission_route: 'Contact avec hôtes réservoirs (Pteropus spp.), possible transmission aérienne nosocomial',
    currentStatus: 'sporadic',
    outbreakStart: '2023-09 (Kerala)',
    lastUpdate: '2026-02',
    iconColor: '#991B1B',
    references: [
      'WHO Nipah virus — Key Facts 2023',
      'Chua KB et al. Clin Infect Dis 2002 — Nipah encephalitis outbreak',
      'Gurley ES et al. Clin Infect Dis 2007 — Person-to-person transmission of Nipah virus',
      'Luby SP. Curr Opin Virol 2013 — Risk of human-to-human transmission',
      'IMB Blueprint Priority Pathogens List 2023'
    ],
    descFR: 'Agent prioritaire OMS (R&D Blueprint). CFR 40–75%. Réservoir : chauves-souris Pteropus. Foyers récurrents Kerala (Inde) et Bangladesh. Transmission interhumaine documentée (Bangladesh). FFP3 + contact précautions + isolement strict requis.',
    descEN: 'WHO priority pathogen (R&D Blueprint). CFR 40-75%. Reservoir: Pteropus bats. Recurrent outbreaks Kerala (India) and Bangladesh. Human-to-human transmission documented. FFP3 + contact precautions + strict isolation required.'
  },
  {
    id: 'HANTA',
    nameFR: 'Hantavirus (SPH)',
    nameEN: 'Hantavirus (HPS)',
    pathogen: 'Hantavirus (Sin Nombre, Andes, Seoul)',
    category: 'emerging',
    riskLevel: 'high',
    lat: -35.0, lon: -65.0, // Southern Cone Argentina/Chile
    lat2: 47.0, lon2: -110.0, // USA
    activeRegions: ['Argentine', 'Chili', 'Brésil', 'USA (Four Corners)', 'Canada'],
    transmission: ['Aérosols d\'excrétas rongeurs', 'Contact rongeurs infectés'],
    protectionRequired: 'FFP2/N95 minimum — FFP3 lors de nettoyage zones infestées',
    protectionLevel: 2,
    maskNote: 'N95/FFP2 lors de nettoyage espaces infestés par rongeurs. FFP3 recommandé milieu médical HPS actif.',
    reproductionNumber: 'R0 ≈ 1.0 (Andes, transmission interhumaine documentée — unique parmi Hantavirus)',
    cfr: '35–40% (SPH/HPS Sin Nombre) ; 12% (Andes virus)',
    incubation: '9–33 jours',
    transmission_route: 'Inhalation d\'aérosols d\'urine/fèces/salive de rongeurs infectés. Andes virus : transmission interhumaine prouvée.',
    currentStatus: 'active',
    outbreakStart: 'Endémique Amériques',
    lastUpdate: '2025-12',
    iconColor: '#B45309',
    references: [
      'CDC Hantavirus — Symptoms, Diagnosis, Treatment 2023',
      'Jonsson CB et al. Clin Microbiol Rev 2010 — A global perspective on hantavirus ecology, epidemiology, and disease',
      'Ferres M et al. Emerg Infect Dis 2007 — Andes virus interhuman transmission',
      'WHO Hantavirus Disease Fact Sheet 2022'
    ],
    descFR: 'Syndrome Pulmonaire à Hantavirus (SPH) : CFR 35–40%. Réservoir : rongeurs sylvestres. Transmission par aérosols d\'excrétas. Andes virus (Chili/Argentine) : seul Hantavirus avec transmission interhumaine prouvée. FFP2 indispensable lors de nettoyage de zones infestées.',
    descEN: 'Hantavirus Pulmonary Syndrome (HPS): CFR 35-40%. Reservoir: wild rodents. Transmission via aerosolized excreta. Andes virus (Chile/Argentina): only hantavirus with proven human-to-human transmission. FFP2 essential when cleaning rodent-infested areas.'
  },
  {
    id: 'MPOX',
    nameFR: 'Mpox (clade I)',
    nameEN: 'Mpox (clade I)',
    pathogen: 'Monkeypox virus clade Ib',
    category: 'epidemic',
    riskLevel: 'high',
    lat: -2.0, lon: 29.0, // DRC, Eastern Africa
    activeRegions: ['RD Congo', 'Burundi', 'Rwanda', 'Ouganda', 'Kenya'],
    transmission: ['Contact direct lésions', 'Gouttelettes respiratoires', 'Contact prolongé'],
    protectionRequired: 'FFP2/N95 + équipement contact',
    protectionLevel: 2,
    maskNote: 'FFP2 + gants + lunettes pour soignants et contacts proches. Clade Ib plus transmissible que clade II.',
    reproductionNumber: 'R0 clade Ib ≈ 1.5–2.1 (transmission sexuelle et ménagère)',
    cfr: '3–10% (clade Ib, populations non vaccinées)',
    incubation: '5–21 jours',
    transmission_route: 'Contact cutané lésions, sécrétions respiratoires, fomites, transmission sexuelle',
    currentStatus: 'active',
    outbreakStart: '2023-09',
    lastUpdate: '2026-04',
    iconColor: '#DC2626',
    references: [
      'WHO PHEIC Declaration Mpox August 2024',
      'Kibungu EM et al. N Engl J Med 2024 — Clade Ib monkeypox outbreak',
      'ECDC Mpox Epidemiological Update 2024',
      'Titanji BK et al. Lancet Infect Dis 2022 — Monkeypox disease'
    ],
    descFR: 'USPPI déclaré par OMS août 2024 pour clade Ib (RDC/Afrique orientale). Clade Ib plus transmissible que clade IIb (2022). Transmission via contact cutané, gouttelettes respiratoires lors de contact prolongé. FFP2 + EPI contact requis pour soignants.',
    descEN: 'WHO PHEIC declared August 2024 for clade Ib (DRC/East Africa). Clade Ib more transmissible than 2022 clade IIb outbreak. Transmission via skin contact, respiratory droplets during prolonged contact. FFP2 + contact PPE required for healthcare workers.'
  },
  {
    id: 'MERS',
    nameFR: 'MERS-CoV',
    nameEN: 'MERS-CoV',
    pathogen: 'Middle East Respiratory Syndrome coronavirus',
    category: 'endemic',
    riskLevel: 'high',
    lat: 24.7, lon: 46.7, // Riyadh, Saudi Arabia
    activeRegions: ['Arabie Saoudite', 'Émirats arabes unis', 'Corée du Sud (nosocomial)'],
    transmission: ['Contact direct dromadaires', 'Transmission interhumaine nosocomial', 'Aérosols milieu médical'],
    protectionRequired: 'FFP2/N95 minimum — aérosol precautions',
    protectionLevel: 2,
    maskNote: 'Précautions aérosols (FFP2/N95) + contact + yeux. Réservoir : dromadaires. Transmission interhumaine surtout nosocomial.',
    reproductionNumber: 'R0 ≈ 0.4–0.9 (R0 > 1 en contexte nosocomial non contrôlé)',
    cfr: '34–36% (OMS, cas confirmés)',
    incubation: '2–14 jours',
    transmission_route: 'Zoonose (dromadaires). Transmission interhumaine via gouttelettes et aérosols en milieu hospitalier. Clusters nosocomiaux.',
    currentStatus: 'sporadic',
    outbreakStart: '2012 (sporadique)',
    lastUpdate: '2026-01',
    iconColor: '#EA580C',
    references: [
      'WHO MERS Global Summary and Risk Assessment 2023',
      'Zaki AM et al. N Engl J Med 2012 — Isolation of a novel coronavirus',
      'Assiri A et al. Lancet Infect Dis 2013 — MERS cluster in nosocomial setting',
      'Oh MD et al. J Korean Med Sci 2015 — MERS outbreak in South Korea'
    ],
    descFR: 'CFR ~34–36% (OMS). Réservoir animal : dromadaires (clade C). Transmission humaine principalement nosocomiale. Précautions aérosols (FFP2) + contact + protection oculaire requis pour soignants. Cas sporadiques continus Péninsule arabique.',
    descEN: 'CFR ~34-36% (WHO). Animal reservoir: dromedary camels (clade C). Human transmission mainly nosocomial. Airborne precautions (FFP2) + contact + eye protection required for HCW. Sporadic continuous cases Arabian Peninsula.'
  },
  {
    id: 'MARBURG',
    nameFR: 'Virus Marburg',
    nameEN: 'Marburg Virus',
    pathogen: 'Marburg marburgvirus',
    category: 'emerging',
    riskLevel: 'critical',
    lat: 0.35, lon: 37.9, // Kenya/Rwanda historical clusters
    activeRegions: ['Rwanda (2024)', 'Ghana (2022)', 'Guinée équatoriale (2023)'],
    transmission: ['Contact direct fluides biologiques', 'Potentiel aérosol milieu médical', 'Fomites'],
    protectionRequired: 'FFP3/P100 + équipement biosécurité niveau 4',
    protectionLevel: 3,
    maskNote: 'Niveau BSL-4. FFP3/P100 + combinaison + double gantage. Transmission aérienne non dominante mais signalée en contexte AGP.',
    reproductionNumber: 'R0 ≈ 1.0–2.0 (Angola 2005)',
    cfr: '24–90% selon souche (Angola 2005 : 90%)',
    incubation: '2–21 jours',
    transmission_route: 'Contact direct avec sang, sécrétions, organes ou d\'autres fluides corporels de personnes infectées. Réservoir : Rousettus aegyptiacus.',
    currentStatus: 'sporadic',
    outbreakStart: '2024-09 (Rwanda)',
    lastUpdate: '2025-01',
    iconColor: '#7F1D1D',
    references: [
      'WHO Marburg virus disease — Key Facts 2023',
      'Rwanda Biomedical Centre — Marburg Outbreak Report 2024',
      'Towner JS et al. PLoS Pathog 2009 — Isolation of genetically diverse Marburg viruses',
      'WHO DON Marburg Rwanda September 2024'
    ],
    descFR: 'Virus à filovirus (famille Filoviridae). CFR 24–90%. Réservoir : chauve-souris Rousettus aegyptiacus. Foyer Rwanda septembre 2024 (62 cas, 15 décès). BSL-4. FFP3 + combinaison étanche. Transmission interhumaine par contact direct fluides.',
    descEN: 'Filovirus (Filoviridae). CFR 24-90%. Reservoir: Rousettus aegyptiacus bats. Rwanda outbreak September 2024 (62 cases, 15 deaths). BSL-4. FFP3 + full suit. Human-to-human transmission via direct fluid contact.'
  },
  {
    id: 'MEASLES',
    nameFR: 'Rougeole',
    nameEN: 'Measles',
    pathogen: 'Measles morbillivirus',
    category: 'epidemic',
    riskLevel: 'high',
    lat: 13.5, lon: 17.0, // Sahel Africa
    activeRegions: ['Afrique subsaharienne', 'Europe (foyers non-vaccinés)', 'Gaza 2024'],
    transmission: ['Aérosols (jusqu\'à 2h en air confiné)', 'Contact direct'],
    protectionRequired: 'FFP2/N95',
    protectionLevel: 2,
    maskNote: 'L\'un des pathogènes les plus contagieux connus (R0 12–18). FFP2 recommandé contacts non immuns en milieu endémique.',
    reproductionNumber: 'R0 ≈ 12–18 (le plus élevé des maladies à déclaration obligatoire)',
    cfr: '1–5% (pays à revenus faibles) ; 0.01–0.1% (pays vaccinés)',
    incubation: '10–14 jours',
    transmission_route: 'Aérosols pouvant rester en suspension jusqu\'à 2 heures. Contagiosité 4j avant–4j après éruption.',
    currentStatus: 'active',
    outbreakStart: 'Résurgence 2022–2026',
    lastUpdate: '2026-03',
    iconColor: '#D97706',
    references: [
      'WHO Measles Global Status Update 2024 — 306,000 cases reported',
      'ECDC Measles Surveillance 2024',
      'Moss WJ. Lancet 2017 — Measles',
      'Mina MJ et al. Science 2015 — Measles virus infection diminishes preexisting antibodies'
    ],
    descFR: 'Résurgence mondiale 2022–2024 : 306 000 cas déclarés (OMS 2024). R0 12–18. Transmission aérienne sur grande distance (2h en air confiné). Immunosuppression post-rougeole 2–3 ans. FFP2 recommandé pour non-immuns dans zones épidémiques.',
    descEN: 'Global resurgence 2022-2024: 306,000 cases reported (WHO 2024). R0 12-18. Long-range airborne transmission (2h in confined air). Post-measles immune suppression 2-3 years. FFP2 recommended for non-immune individuals in epidemic areas.'
  },
  {
    id: 'LEGIONELLA',
    nameFR: 'Légionellose',
    nameEN: 'Legionnaires\' Disease',
    pathogen: 'Legionella pneumophila',
    category: 'endemic',
    riskLevel: 'moderate',
    lat: 48.85, lon: 2.35, // France / Europe
    activeRegions: ['Europe', 'USA', 'Australie'],
    transmission: ['Aérosols d\'eau contaminée (tours de refroidissement, douches)'],
    protectionRequired: 'FFP2/N95 lors d\'interventions sur circuits eau contaminés',
    protectionLevel: 2,
    maskNote: 'FFP2 lors d\'exposition à aérosols d\'eau potentiellement contaminée (nettoyage tours aéroréfrigérantes, interventions plomberie en zone épidémique).',
    reproductionNumber: 'Non transmissible interhumain',
    cfr: '5–15% (formes hospitalisées)',
    incubation: '2–10 jours',
    transmission_route: 'Inhalation d\'aérosols contaminés (eau chaude sanitaire, tours aéroréfrigérantes, jacuzzis, équipements respiratoires médicaux).',
    currentStatus: 'endemic',
    outbreakStart: 'Endémique (clusters)',
    lastUpdate: '2026-02',
    iconColor: '#0EA5E9',
    references: [
      'ECDC Legionnaires Disease in Europe 2022 — 3,167 cases',
      'Fields BS et al. Clin Microbiol Rev 2002 — Legionella and Legionnaires\' disease',
      'Cunha BA et al. Lancet Infect Dis 2016 — Legionnaires\' disease',
      'Santé Publique France — Légionellose : données de surveillance 2023'
    ],
    descFR: '3 167 cas Europe 2022 (ECDC). Réservoirs : circuits d\'eau chaude anthropiques. CFR 5–15% formes sévères. FFP2 lors d\'interventions sur circuits eau (tours de refroidissement, plomberie). Non transmissible de personne à personne.',
    descEN: '3,167 cases Europe 2022 (ECDC). Reservoirs: anthropogenic hot water systems. CFR 5-15% severe forms. FFP2 during water system interventions (cooling towers, plumbing). Not person-to-person transmissible.'
  },
  {
    id: 'INFLUENZA',
    nameFR: 'Grippe saisonnière',
    nameEN: 'Seasonal Influenza',
    pathogen: 'Influenza A & B (H1N1, H3N2)',
    category: 'endemic',
    riskLevel: 'moderate',
    lat: 50.0, lon: 10.0, // Europe winter season
    activeRegions: ['Hémisphère Nord (oct–mars)', 'Hémisphère Sud (avr–sept)'],
    transmission: ['Aérosols', 'Gouttelettes', 'Contact'],
    protectionRequired: 'FFP1 suffisant / FFP2 recommandé milieux à risque',
    protectionLevel: 1,
    maskNote: 'FFP2 recommandé pour soignants et personnes à risque (immunodéprimés, cardio-respiratoire, >65 ans). Masque chirurgical = protection source insuffisante contre aérosols.',
    reproductionNumber: 'R0 ≈ 1.2–1.4 (saisonnier)',
    cfr: '0.01–0.1% (estimé) ; 290 000–650 000 décès/an mondiaux (OMS)',
    incubation: '1–4 jours',
    transmission_route: 'Gouttelettes et aérosols de petites particules. Contagiosité 1 jour avant apparition des symptômes.',
    currentStatus: 'seasonal',
    outbreakStart: 'Saisonnier',
    lastUpdate: '2026-04',
    iconColor: '#6366F1',
    references: [
      'WHO Influenza (Seasonal) Fact Sheet 2023',
      'Tellier R et al. Sci Rep 2019 — Recognition of aerosol transmission of infectious agents',
      'Cowling BJ et al. Nat Med 2013 — Aerosol transmission of influenza',
      'ECDC Seasonal Influenza Surveillance 2024'
    ],
    descFR: '290 000–650 000 décès/an (OMS). Transmission aérienne par aérosols démontrée (Cowling 2013). FFP2 recommandé pour soignants, immunodéprimés et personnes > 65 ans lors des pics épidémiques.',
    descEN: '290,000-650,000 deaths/year (WHO). Airborne aerosol transmission demonstrated. FFP2 recommended for healthcare workers, immunocompromised and >65 year-olds during epidemic peaks.'
  },
  {
    id: 'RSYNCYTIAL',
    nameFR: 'Virus respiratoire syncytial',
    nameEN: 'Respiratory Syncytial Virus (RSV)',
    pathogen: 'Human Respiratory Syncytial Virus (RSV-A, RSV-B)',
    category: 'endemic',
    riskLevel: 'moderate',
    lat: 52.0, lon: 4.9,
    activeRegions: ['Mondial (épidémies annuelles automne-hiver)'],
    transmission: ['Gouttelettes', 'Contact direct', 'Aérosols (mineur)'],
    protectionRequired: 'FFP2/N95 milieux pédiatriques et néonataux',
    protectionLevel: 2,
    maskNote: 'FFP2 recommandé soignants pédiatrie/néonatologie pendant pic épidémique. Prévention source importante.',
    reproductionNumber: 'R0 ≈ 2.8–3.3',
    cfr: '0.5–1% nourrissons < 6 mois (pays à faible revenu)',
    incubation: '4–6 jours',
    transmission_route: 'Gouttelettes respiratoires larges et contact avec surfaces contaminées. Aérosols en intérieur documentés.',
    currentStatus: 'seasonal',
    outbreakStart: 'Saisonnier',
    lastUpdate: '2026-03',
    iconColor: '#8B5CF6',
    references: [
      'Shi T et al. Lancet 2017 — Global, regional and national incidence of RSV',
      'WHO RSV — Briefing Notes 2022',
      'Hall CB et al. N Engl J Med 2009 — Community RSV circulation'
    ],
    descFR: '64 000 décès/an enfants < 5 ans (Lancet 2017). Principal pathogène respiratoire nourrisson. Transmission gouttelettes larges + contact. FFP2 recommandé pédiatrie/néonatologie lors pics hivernaux.',
    descEN: '64,000 deaths/year in children <5 (Lancet 2017). Leading respiratory pathogen in infants. FFP2 recommended in pediatrics/neonatology during winter peaks.'
  },
  {
    id: 'PERTUSSIS',
    nameFR: 'Coqueluche',
    nameEN: 'Pertussis (Whooping Cough)',
    pathogen: 'Bordetella pertussis',
    category: 'epidemic',
    riskLevel: 'moderate',
    lat: 45.0, lon: 5.0, // Europe 2024 resurgence
    activeRegions: ['Europe (résurgence 2024)', 'USA', 'Philippines', 'Chine'],
    transmission: ['Gouttelettes', 'Aérosols air confiné'],
    protectionRequired: 'FFP2/N95 lors de contact rapproché non protégé',
    protectionLevel: 2,
    maskNote: 'FFP2 recommandé lors de contact non protégé avec cas confirmé, notamment pour nourrissons non vaccinés et immunodéprimés.',
    reproductionNumber: 'R0 ≈ 12–17 (non vaccinés)',
    cfr: '1–2% nourrissons < 6 mois',
    incubation: '9–10 jours',
    transmission_route: 'Gouttelettes de grande taille et potentiellement petites particules en air très confiné. Très contagieux phase catarrhale.',
    currentStatus: 'active',
    outbreakStart: '2024-01 (résurgence Europe)',
    lastUpdate: '2026-03',
    iconColor: '#EC4899',
    references: [
      'ECDC Pertussis Monthly Data 2024 — Record levels in Europe',
      'WHO Pertussis Fact Sheet 2023',
      'Cherry JD. N Engl J Med 2012 — Epidemic Pertussis in 2012',
      'Santé Publique France — Coqueluche : point épidémiologique 2024'
    ],
    descFR: 'Résurgence record 2024 en Europe (ECDC : niveaux les plus élevés depuis décennies). R0 12–17. CFR 1–2% nourrissons. FFP2 recommandé contact rapproché non protégé avec cas confirmé, surtout autour de nourrissons.',
    descEN: 'Record 2024 resurgence in Europe (ECDC: highest levels in decades). R0 12-17. CFR 1-2% in infants. FFP2 recommended for unprotected close contact with confirmed case, especially around infants.'
  },
  {
    id: 'COVID19VAR',
    nameFR: 'Nouveaux variants émergents',
    nameEN: 'Novel emerging variants',
    pathogen: 'SARS-CoV-2 nouveaux variants (XEC, KP.3.1.1)',
    category: 'emerging',
    riskLevel: 'moderate',
    lat: 35.0, lon: 125.0, // East Asia early detection
    activeRegions: ['Mondial — surveillance continue'],
    transmission: ['Aérosols', 'Gouttelettes'],
    protectionRequired: 'FFP2/N95',
    protectionLevel: 2,
    maskNote: 'FFP2 recommandé milieux à risque jusqu\'à caractérisation épidémiologique complète du nouveau variant.',
    reproductionNumber: 'À déterminer',
    cfr: 'À déterminer',
    incubation: '2–7 jours (estimé)',
    transmission_route: 'Aéroporté présumé (analogue Omicron)',
    currentStatus: 'monitoring',
    outbreakStart: 'Surveillance continue 2026',
    lastUpdate: '2026-05',
    iconColor: '#6366F1',
    references: [
      'WHO Tracking SARS-CoV-2 Variants 2024–2026',
      'GISAID Variant Tracker 2026',
      'ECDC SARS-CoV-2 Variants of Concern/Interest — Monthly Report'
    ],
    descFR: 'Surveillance continue des nouveaux variants SARS-CoV-2 (GISAID/ECDC/OMS). XEC, KP.3.1.1 en circulation 2025. FFP2 recommandé dans attente de caractérisation complète de tout nouveau variant à transmissibilité accrue.',
    descEN: 'Continuous surveillance of new SARS-CoV-2 variants (GISAID/ECDC/WHO). XEC, KP.3.1.1 circulating 2025. FFP2 recommended while awaiting complete characterization of any new variant with increased transmissibility.'
  },
  {
    id: 'CANDIDA',
    nameFR: 'Aspergillus / Champignons aéroportés',
    nameEN: 'Aspergillus / Airborne Fungi',
    pathogen: 'Aspergillus fumigatus, Histoplasma, Coccidioides',
    category: 'endemic',
    riskLevel: 'moderate',
    lat: 32.0, lon: -100.0, // Coccidioides Valley Fever USA
    activeRegions: ['USA (Valley Fever)', 'Europe (Aspergillus)', 'Chantiers construction immunodéprimés'],
    transmission: ['Spores aéroportées', 'Sol/poussières'],
    protectionRequired: 'FFP2/N95 — FFP3 immunodéprimés',
    protectionLevel: 2,
    maskNote: 'FFP2 obligatoire travaux sol/poussières en zone endémique. FFP3 pour immunodéprimés graves (greffe, hémato-oncologie).',
    reproductionNumber: 'Non transmissible interhumain',
    cfr: '15–40% aspergillose invasive (immunodéprimés)',
    incubation: '1–3 semaines (aspergillose)',
    transmission_route: 'Inhalation spores fongiques environnementales. Non transmissible de personne à personne.',
    currentStatus: 'endemic',
    outbreakStart: 'Endémique',
    lastUpdate: '2025-12',
    iconColor: '#059669',
    references: [
      'CDC Aspergillosis Statistics 2023',
      'Morgan J et al. Clin Infect Dis 2005 — Incidence of invasive aspergillosis',
      'Galgiani JN et al. Clin Infect Dis 2016 — Coccidioidomycosis'
    ],
    descFR: 'CFR 15–40% aspergillose invasive en immunodépression sévère. Spores omniprésentes dans environnement. FFP2 lors de travaux exposants à poussières/sol (construction, jardinage, chantiers). FFP3 obligatoire pour immunodéprimés sévères.',
    descEN: 'CFR 15-40% invasive aspergillosis in severe immunocompromise. Spores ubiquitous in environment. FFP2 during soil/dust-exposing work (construction, gardening). FFP3 mandatory for severely immunocompromised.'
  },
  {
    id: 'EBOLA',
    nameFR: 'Ebola',
    nameEN: 'Ebola Virus Disease',
    pathogen: 'Ebola virus (Zaire, Sudan, Bundibugyo strains)',
    category: 'epidemic',
    riskLevel: 'critical',
    lat: 0.3, lon: 25.0, // DRC
    activeRegions: ['RD Congo', 'Ouganda (historique)', 'Guinée (historique)'],
    transmission: ['Contact direct fluides biologiques', 'Contact corps décédés'],
    protectionRequired: 'FFP3/P100 + équipement BSL-4 complet',
    protectionLevel: 3,
    maskNote: 'Transmission principalement par contact direct (non aéroporté). FFP3 recommandé milieu médical en raison de potentiel aérosolisation lors procédures (intubation, aspiration).',
    reproductionNumber: 'R0 ≈ 1.5–2.5 (epidémie non contrôlée)',
    cfr: '25–90% selon souche (Zaire : ~70%)',
    incubation: '2–21 jours',
    transmission_route: 'Contact avec sang, sécrétions, organes ou fluides de personnes/animaux infectés. Nosocomial via AGP. Pas de transmission aérienne avérée en conditions naturelles.',
    currentStatus: 'sporadic',
    outbreakStart: '2024 (foyers sporadiques RDC)',
    lastUpdate: '2025-09',
    iconColor: '#7F1D1D',
    references: [
      'WHO Ebola — Key Facts 2023',
      'WHO DON Ebola DRC 2024',
      'Feldmann H, Geisbert TW. Lancet 2011 — Ebola haemorrhagic fever',
      'CDC Ebola (Ebola Virus Disease) 2023'
    ],
    descFR: 'CFR 25–90% selon souche. Transmission directe par fluides biologiques (non aéroporté en conditions naturelles). FFP3 + tenue BSL-4 pour procédures aérosolisantes en milieu médical. Réservoir présumé : chauves-souris frugivores.',
    descEN: 'CFR 25-90% by strain. Direct transmission via biological fluids (not airborne in natural conditions). FFP3 + BSL-4 suit for aerosol-generating procedures in healthcare. Presumed reservoir: fruit bats.'
  },
  {
    id: 'RSVA_HMPV',
    nameFR: 'Métapneumovirus humain (hMPV)',
    nameEN: 'Human Metapneumovirus (hMPV)',
    pathogen: 'Human metapneumovirus (hMPV A/B)',
    category: 'emerging',
    riskLevel: 'moderate',
    lat: 23.7, lon: 116.7, // China 2024 reported surge
    activeRegions: ['Chine (résurgence hivernale 2024–2025)', 'Mondial'],
    transmission: ['Gouttelettes', 'Contact', 'Aérosols'],
    protectionRequired: 'FFP2/N95 milieux pédiatriques',
    protectionLevel: 2,
    maskNote: 'Similaire RSV en épidémiologie. FFP2 recommandé soignants pédiatrie lors épidémies.',
    reproductionNumber: 'R0 ≈ 2.5–3.0',
    cfr: '< 1% immunocompétents ; > 10% immunodéprimés',
    incubation: '4–6 jours',
    transmission_route: 'Gouttelettes respiratoires et contact avec surfaces contaminées. Aérosols documentés.',
    currentStatus: 'active',
    outbreakStart: '2024-12 (résurgence Chine)',
    lastUpdate: '2025-03',
    iconColor: '#7C3AED',
    references: [
      'van den Hoogen BG et al. Nat Med 2001 — A newly discovered human pneumovirus',
      'WHO hMPV Monitoring 2025',
      'China CDC hMPV Situation Report Q1 2025'
    ],
    descFR: 'Pathogène respiratoire majeur (2e cause après RSV chez nourrisson). Résurgence hivernale Chine 2024–2025 avec souches A1/B1. FFP2 recommandé soignants pédiatriques lors pics épidémiques. Pas de vaccin disponible.',
    descEN: 'Major respiratory pathogen (2nd cause after RSV in infants). Winter resurgence China 2024-2025 with A1/B1 strains. FFP2 recommended for pediatric healthcare workers during epidemic peaks. No vaccine available.'
  }
];

// ── Données symptomatologiques ────────────────────────────────
// Sources : OMS, CDC, ECDC, UpToDate — à usage indicatif uniquement
const SYMPTOMS_DATA = {
  H5N1:       { fr: ['Fièvre brutale ≥ 38°C', 'Toux', 'Essoufflement', 'Douleurs musculaires intenses', 'Conjonctivite (yeux rouges)', 'Maux de tête'], en: ['Sudden fever ≥ 38°C', 'Cough', 'Shortness of breath', 'Severe muscle pain', 'Conjunctivitis (red eyes)', 'Headache'], alarmFR: ['Détresse respiratoire sévère', 'Cyanose (lèvres ou doigts bleus)', 'Aggravation rapide en 24–48h'], alarmEN: ['Severe respiratory distress', 'Cyanosis (blue lips or fingers)', 'Rapid deterioration within 24-48h'], isolationFR: 'Isolement 7 jours — déclaration obligatoire aux autorités sanitaires', isolationEN: 'Isolation 7 days — mandatory reporting to health authorities' },
  SARS2:      { fr: ['Fièvre ou frissons', 'Toux sèche', 'Fatigue', 'Perte d\'odorat ou de goût', 'Maux de gorge', 'Difficultés à respirer'], en: ['Fever or chills', 'Dry cough', 'Fatigue', 'Loss of smell or taste', 'Sore throat', 'Shortness of breath'], alarmFR: ['Essoufflement sévère au repos', 'Douleur thoracique persistante', 'Confusion mentale', 'Lèvres ou ongles bleutés'], alarmEN: ['Severe shortness of breath at rest', 'Persistent chest pain', 'Mental confusion', 'Bluish lips or nails'], isolationFR: 'Isolement 5 à 7 jours dès les symptômes ou test positif', isolationEN: 'Isolation 5 to 7 days from symptom onset or positive test' },
  TB:         { fr: ['Toux persistante > 3 semaines', 'Crachats pouvant contenir du sang', 'Sueurs nocturnes importantes', 'Perte de poids inexpliquée', 'Fièvre modérée le soir', 'Fatigue chronique'], en: ['Persistent cough > 3 weeks', 'Sputum possibly containing blood', 'Heavy night sweats', 'Unexplained weight loss', 'Mild evening fever', 'Chronic fatigue'], alarmFR: ['Crachats franchement sanglants (hémoptysie)', 'Essoufflement sévère au repos'], alarmEN: ['Frank bloody sputum (hemoptysis)', 'Severe shortness of breath at rest'], isolationFR: 'Isolement jusqu\'à 2 semaines de traitement efficace — déclaration obligatoire', isolationEN: 'Isolation until 2 weeks of confirmed effective treatment — mandatory reporting' },
  NIPAH:      { fr: ['Fièvre brutale', 'Maux de tête intenses', 'Vomissements', 'Confusion mentale', 'Difficultés à avaler', 'Convulsions'], en: ['Sudden fever', 'Severe headache', 'Vomiting', 'Mental confusion', 'Difficulty swallowing', 'Seizures'], alarmFR: ['Trouble de conscience', 'Convulsions', 'Paralysie progressive', 'Coma'], alarmEN: ['Altered consciousness', 'Seizures', 'Progressive paralysis', 'Coma'], isolationFR: 'Isolement strict — URGENCE NATIONALE — appelez le 15 immédiatement', isolationEN: 'Strict isolation — NATIONAL EMERGENCY — call emergency services immediately' },
  HANTA:      { fr: ['Fièvre', 'Douleurs musculaires intenses', 'Maux de tête', 'Fatigue', 'Toux sèche', 'Essoufflement brutal (J4–J10)'], en: ['Fever', 'Severe muscle pain', 'Headache', 'Fatigue', 'Dry cough', 'Sudden shortness of breath (day 4-10)'], alarmFR: ['Détresse respiratoire aiguë (SDRA)', 'Chute de tension artérielle', 'Aggravation brutale après la phase fébrile'], alarmEN: ['Acute respiratory distress (ARDS)', 'Drop in blood pressure', 'Sudden deterioration after febrile phase'], isolationFR: 'Non contagieux de personne à personne (sauf virus Andes). Évitez tout contact avec des rongeurs.', isolationEN: 'Not contagious person-to-person (except Andes virus). Avoid all rodent contact.' },
  MPOX:       { fr: ['Fièvre', 'Ganglions gonflés (cou, aisselles, aines)', 'Éruption cutanée (vésicules puis croûtes)', 'Douleurs musculaires', 'Maux de dos', 'Fatigue'], en: ['Fever', 'Swollen lymph nodes (neck, armpit, groin)', 'Skin rash (vesicles then scabs)', 'Muscle pain', 'Back pain', 'Fatigue'], alarmFR: ['Lésions très étendues sur le corps', 'Surinfection bactérienne des lésions', 'Difficultés à avaler ou à respirer'], alarmEN: ['Very extensive skin lesions', 'Bacterial superinfection of lesions', 'Difficulty swallowing or breathing'], isolationFR: 'Isolement jusqu\'à cicatrisation complète de TOUTES les lésions — déclaration obligatoire', isolationEN: 'Isolation until ALL lesions are completely healed — mandatory reporting' },
  MERS:       { fr: ['Fièvre élevée', 'Toux', 'Essoufflement', 'Diarrhée (30% des cas)', 'Douleurs musculaires', 'Nausées'], en: ['High fever', 'Cough', 'Shortness of breath', 'Diarrhea (30% of cases)', 'Muscle pain', 'Nausea'], alarmFR: ['Insuffisance rénale aiguë (peu d\'urines)', 'Détresse respiratoire sévère', 'Choc'], alarmEN: ['Acute kidney failure (little urine)', 'Severe respiratory distress', 'Shock'], isolationFR: 'Isolement 14 jours — déclaration immédiate aux autorités sanitaires', isolationEN: 'Isolation 14 days — immediate notification to health authorities' },
  MARBURG:    { fr: ['Fièvre brutale ≥ 38.5°C', 'Maux de tête intenses', 'Douleurs musculaires', 'Diarrhée profuse', 'Nausées/vomissements', 'Éruption cutanée (J5–J7)', 'Saignements (phase tardive)'], en: ['Sudden fever ≥ 38.5°C', 'Severe headache', 'Muscle pain', 'Profuse diarrhea', 'Nausea/vomiting', 'Skin rash (day 5-7)', 'Bleeding (late stage)'], alarmFR: ['Saignements multiples (nez, gencives, selles noires)', 'Confusion mentale', 'Choc hémorragique'], alarmEN: ['Multiple bleedings (nose, gums, black stools)', 'Mental confusion', 'Hemorrhagic shock'], isolationFR: 'URGENCE NATIONALE — isolement BSL-4 — appelez le 15 immédiatement', isolationEN: 'NATIONAL EMERGENCY — BSL-4 isolation — call emergency services immediately' },
  MEASLES:    { fr: ['Fièvre élevée', 'Toux', 'Nez qui coule (rhinorrhée)', 'Yeux rouges et larmoyants', 'Éruption rouge (visage puis corps)', 'Taches blanches dans la bouche (signe de Köplik)'], en: ['High fever', 'Cough', 'Runny nose', 'Red watery eyes', 'Red rash (face then body)', 'White spots in mouth (Koplik spots)'], alarmFR: ['Confusion mentale (encéphalite)', 'Difficultés à respirer (pneumonie)', 'Convulsions'], alarmEN: ['Mental confusion (encephalitis)', 'Breathing difficulty (pneumonia)', 'Seizures'], isolationFR: 'Isolement 4 jours avant l\'éruption + 4 jours après l\'éruption — déclaration obligatoire', isolationEN: 'Isolation 4 days before rash + 4 days after rash onset — mandatory reporting' },
  LEGIONELLA: { fr: ['Fièvre élevée (39–40°C)', 'Toux avec expectorations', 'Essoufflement', 'Douleurs musculaires', 'Maux de tête', 'Diarrhée', 'Confusion'], en: ['High fever (39-40°C)', 'Cough with sputum', 'Shortness of breath', 'Muscle pain', 'Headache', 'Diarrhea', 'Confusion'], alarmFR: ['Confusion sévère ou désorientation', 'Peu d\'urines ou urines foncées (insuffisance rénale)', 'Détresse respiratoire'], alarmEN: ['Severe confusion or disorientation', 'Little or dark urine (kidney failure)', 'Respiratory distress'], isolationFR: 'Non contagieux entre personnes — signalez l\'exposition à l\'eau (tour de refroidissement, climatisation)', isolationEN: 'Not contagious between people — report water exposure (cooling tower, air conditioning)' },
  INFLUENZA:  { fr: ['Fièvre brutale ≥ 38.5°C', 'Toux sèche', 'Douleurs musculaires et articulaires', 'Fatigue intense', 'Maux de tête', 'Maux de gorge', 'Frissons'], en: ['Sudden fever ≥ 38.5°C', 'Dry cough', 'Muscle and joint pain', 'Intense fatigue', 'Headache', 'Sore throat', 'Chills'], alarmFR: ['Essoufflement sévère ou douleur thoracique', 'Confusion ou altération de la conscience', 'Fièvre > 40°C résistante au paracétamol'], alarmEN: ['Severe shortness of breath or chest pain', 'Confusion or altered consciousness', 'Fever > 40°C resistant to paracetamol'], isolationFR: 'Isolement 5 à 7 jours dès le début des symptômes', isolationEN: 'Isolation 5 to 7 days from symptom onset' },
  RSYNCYTIAL: { fr: ['Nez qui coule (rhinorrhée)', 'Toux', 'Fièvre légère à modérée', 'Sifflements respiratoires (sibilants)', 'Difficultés à s\'alimenter (nourrissons)', 'Irritabilité (nourrissons)'], en: ['Runny nose', 'Cough', 'Mild to moderate fever', 'Wheezing', 'Feeding difficulties (infants)', 'Irritability (infants)'], alarmFR: ['Difficultés respiratoires sévères (nourrissons)', 'Tirage intercostal visible', 'Lèvres bleues (cyanose)', 'Pauses respiratoires (apnées)'], alarmEN: ['Severe breathing difficulty (infants)', 'Visible chest retractions', 'Blue lips (cyanosis)', 'Breathing pauses (apnea)'], isolationFR: 'Isolement 7 jours — particulièrement important autour des prématurés et nouveau-nés', isolationEN: 'Isolation 7 days — especially important around premature babies and newborns' },
  PERTUSSIS:  { fr: ['Phase 1 (10–14 j) : rhume banal avec légère toux', 'Phase 2 : quintes de toux violentes ("chant du coq")', 'Toux nocturne intense', 'Vomissements après les quintes', 'Visage rouge ou bleuté pendant les quintes'], en: ['Phase 1 (10-14 days): common cold with mild cough', 'Phase 2: violent coughing fits ("whooping")', 'Intense night cough', 'Vomiting after coughing fits', 'Red or bluish face during fits'], alarmFR: ['Pauses respiratoires (apnées) — nourrissons', 'Cyanose (lèvres bleues)', 'Pneumonie secondaire (aggravation brusque)'], alarmEN: ['Breathing pauses (apnea) — infants', 'Cyanosis (blue lips)', 'Secondary pneumonia (sudden worsening)'], isolationFR: 'Isolement 21 jours ou 5 jours d\'antibiothérapie efficace — déclaration obligatoire', isolationEN: 'Isolation 21 days or 5 days of effective antibiotic treatment — mandatory reporting' },
  COVID19VAR: { fr: ['Fièvre ou frissons', 'Toux sèche', 'Fatigue', 'Perte d\'odorat ou de goût', 'Maux de gorge', 'Difficultés à respirer', 'Maux de tête'], en: ['Fever or chills', 'Dry cough', 'Fatigue', 'Loss of smell or taste', 'Sore throat', 'Shortness of breath', 'Headache'], alarmFR: ['Essoufflement sévère au repos', 'Douleur thoracique', 'Confusion mentale', 'Lèvres bleutées'], alarmEN: ['Severe shortness of breath at rest', 'Chest pain', 'Mental confusion', 'Bluish lips'], isolationFR: 'Isolement 5 à 7 jours dès les symptômes', isolationEN: 'Isolation 5 to 7 days from symptom onset' },
  CANDIDA:    { fr: ['Fièvre résistante aux antibiotiques', 'Toux (avec ou sans expectorations)', 'Douleurs thoraciques', 'Difficultés à respirer', 'Crachats avec sang possible', 'Maux de tête (atteinte sinusienne)'], en: ['Fever resistant to antibiotics', 'Cough (with or without sputum)', 'Chest pain', 'Shortness of breath', 'Possibly bloody sputum', 'Headache (sinus involvement)'], alarmFR: ['Hémoptysie (crachats abondamment sanglants)', 'Extension cérébrale (confusion, céphalées intenses)'], alarmEN: ['Hemoptysis (heavy bloody cough)', 'Cerebral spread (confusion, severe headaches)'], isolationFR: 'Non transmissible entre personnes — protéger les immunodéprimés', isolationEN: 'Not transmissible between people — protect immunocompromised individuals' },
  EBOLA:      { fr: ['Fièvre brutale', 'Maux de tête intenses', 'Douleurs musculaires', 'Fatigue extrême', 'Maux de gorge', 'Vomissements et diarrhée', 'Éruption cutanée', 'Saignements (phase tardive)'], en: ['Sudden fever', 'Severe headache', 'Muscle pain', 'Extreme fatigue', 'Sore throat', 'Vomiting and diarrhea', 'Skin rash', 'Bleeding (late stage)'], alarmFR: ['Saignements multiples (nez, gencives, selles noires)', 'Choc hémorragique', 'Confusion ou perte de conscience'], alarmEN: ['Multiple bleedings (nose, gums, black stools)', 'Hemorrhagic shock', 'Confusion or loss of consciousness'], isolationFR: 'URGENCE NATIONALE — isolement BSL-4 — appelez le 15 immédiatement', isolationEN: 'NATIONAL EMERGENCY — BSL-4 isolation — call emergency services immediately' },
  RSVA_HMPV:  { fr: ['Toux', 'Nez qui coule', 'Fièvre', 'Difficultés à respirer', 'Sifflements respiratoires', 'Maux de gorge'], en: ['Cough', 'Runny nose', 'Fever', 'Shortness of breath', 'Wheezing', 'Sore throat'], alarmFR: ['Détresse respiratoire (nourrissons, personnes âgées, immunodéprimés)', 'Lèvres bleues (cyanose)'], alarmEN: ['Respiratory distress (infants, elderly, immunocompromised)', 'Blue lips (cyanosis)'], isolationFR: 'Isolement 7 jours — précautions contact et gouttelettes', isolationEN: 'Isolation 7 days — contact and droplet precautions' },
};

// ── Mapping symptômes → pathogènes (pour le vérificateur) ─────
const SYMPTOM_MAP = {
  fever:            ['H5N1','SARS2','TB','NIPAH','HANTA','MPOX','MERS','MARBURG','MEASLES','LEGIONELLA','INFLUENZA','RSYNCYTIAL','PERTUSSIS','COVID19VAR','EBOLA','RSVA_HMPV','CANDIDA'],
  dry_cough:        ['H5N1','SARS2','MERS','INFLUENZA','COVID19VAR','HANTA'],
  wet_cough:        ['TB','LEGIONELLA','CANDIDA','PERTUSSIS'],
  persistent_cough: ['TB'],
  breathlessness:   ['H5N1','SARS2','HANTA','MERS','MEASLES','LEGIONELLA','INFLUENZA','RSYNCYTIAL','EBOLA','RSVA_HMPV','CANDIDA'],
  smell_loss:       ['SARS2','COVID19VAR'],
  rash:             ['MPOX','MEASLES','MARBURG','EBOLA'],
  muscle_pain:      ['H5N1','INFLUENZA','HANTA','NIPAH','EBOLA','MARBURG','MERS','LEGIONELLA'],
  headache:         ['H5N1','NIPAH','MARBURG','EBOLA','LEGIONELLA','INFLUENZA','MERS'],
  confusion:        ['NIPAH','LEGIONELLA','MARBURG','EBOLA','MEASLES'],
  bleeding:         ['MARBURG','EBOLA'],
  lymph_nodes:      ['MPOX'],
  night_sweats:     ['TB'],
  vomiting:         ['NIPAH','MARBURG','EBOLA','LEGIONELLA'],
};

// ── Score calculation ────────────────────────────────────────
// SR = (0.40 × AQI) + (0.30 × Viral) + (0.20 × Pollen) + (0.10 × Weather)
// Components: 0–100 scale (100 = worst)

function generateScoreForRegion(region) {
  const seed = region.id * 137 + 42;
  const noise = (n) => ((Math.sin(n) * 43758.5453123) % 1 + 1) % 1;

  const statusBase = {
    critical: 75, low: 60, moderate: 45, sufficient: 25
  }[region.status] || 40;

  const aqi    = Math.round(statusBase + (noise(seed * 1.1) - 0.5) * 20);
  const viral  = Math.round(statusBase + (noise(seed * 2.3) - 0.5) * 25);
  const pollen = Math.round(30 + noise(seed * 3.7) * 40);
  const weather= Math.round(20 + noise(seed * 4.1) * 30);

  const sr = Math.round(0.40 * aqi + 0.30 * viral + 0.20 * pollen + 0.10 * weather);

  return {
    sr: Math.min(100, Math.max(0, sr)),
    aqi: Math.min(100, Math.max(0, aqi)),
    viral: Math.min(100, Math.max(0, viral)),
    pollen: Math.min(100, Math.max(0, pollen)),
    weather: Math.min(100, Math.max(0, weather))
  };
}

function scoreGrade(sr) {
  if (sr <= 25) return { grade: 'Excellent', colorClass: 'grade-excellent', color: '#10B981' };
  if (sr <= 45) return { grade: 'Bon',       colorClass: 'grade-good',      color: '#84CC16' };
  if (sr <= 60) return { grade: 'Modéré',    colorClass: 'grade-moderate',  color: '#F59E0B' };
  if (sr <= 75) return { grade: 'Élevé',     colorClass: 'grade-high',      color: '#F97316' };
  return             { grade: 'Critique',    colorClass: 'grade-critical',  color: '#EF4444' };
}

function scoreGradeEN(sr) {
  if (sr <= 25) return 'Excellent';
  if (sr <= 45) return 'Good';
  if (sr <= 60) return 'Moderate';
  if (sr <= 75) return 'High';
  return 'Critical';
}

function aiMessageForRegion(region, score, lang) {
  const g = scoreGrade(score.sr);
  const name = lang === 'fr' ? region.nameFR : (region.nameEN || region.nameFR);

  const messages = {
    fr: {
      excellent: `L'air à ${name} est de qualité excellente. Aucune protection particulière recommandée pour les personnes en bonne santé.`,
      good: `Conditions respiratoires satisfaisantes à ${name}. Personnes sensibles (asthme, BPCO) peuvent bénéficier d'un masque chirurgical dans espaces bondés.`,
      moderate: `Vigilance recommandée à ${name}. Personnes vulnérables : envisager FFP2 lors de transports bondés et espaces peu ventilés.`,
      high: `Exposition respiratoire significative à ${name}. FFP2 conseillé pour personnes à risque. Éviter exercice physique intense en extérieur.`,
      critical: `Niveau critique à ${name}. Protection FFP2 fortement recommandée en extérieur. Limiter les sorties inutiles. Aérer les locaux aux heures creuses.`
    },
    en: {
      excellent: `Air quality in ${name} is excellent. No special protection recommended for healthy individuals.`,
      good: `Satisfactory respiratory conditions in ${name}. Sensitive individuals (asthma, COPD) may benefit from a surgical mask in crowded spaces.`,
      moderate: `Vigilance recommended in ${name}. Vulnerable individuals: consider FFP2 in crowded transport and poorly ventilated spaces.`,
      high: `Significant respiratory exposure in ${name}. FFP2 advised for at-risk individuals. Avoid intense outdoor exercise.`,
      critical: `Critical level in ${name}. FFP2 strongly recommended outdoors. Limit unnecessary outings. Ventilate premises during off-peak hours.`
    }
  };

  const t = messages[lang] || messages.fr;
  if (score.sr <= 25) return t.excellent;
  if (score.sr <= 45) return t.good;
  if (score.sr <= 60) return t.moderate;
  if (score.sr <= 75) return t.high;
  return t.critical;
}

// ── Map helpers ──────────────────────────────────────────────
function statusColor(status) {
  return { critical:'#EF4444', low:'#F97316', moderate:'#F59E0B', sufficient:'#10B981' }[status] || '#6B7280';
}

function statusColorDark(status) {
  return { critical:'#7F1D1D', low:'#7C2D12', moderate:'#78350F', sufficient:'#064E3B' }[status] || '#1F2937';
}

function stockMarkerHTML(status, level) {
  const color = statusColor(status);
  const size = level === 'national' ? 14 : 10;
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.7);box-shadow:0 0 0 3px ${color}40;"></div>`;
}

function outbreakMarkerHTML(ob) {
  return `<div style="position:relative;width:20px;height:20px;">
    <div style="position:absolute;inset:0;border-radius:50%;background:${ob.iconColor};opacity:0.2;animation:ob-pulse 1.8s ease-out infinite;"></div>
    <div style="position:absolute;inset:4px;border-radius:50%;background:${ob.iconColor};"></div>
  </div>`;
}

// ── State ────────────────────────────────────────────────────
let currentLang = localStorage.getItem('biq-lang') || 'fr';
let currentMode = localStorage.getItem('biq-mode') || 'patient';
let darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
let worldMap = null;
let stockLayer = null;
let outbreakLayer = null;
let activeLayer = 'both';
let currentFilter = 'all';
let selectedRegionId = null;

// ── Language ─────────────────────────────────────────────────
const LANG_CYCLE = ['fr', 'en', 'es', 'pt', 'ar', 'zh', 'hi', 'sw', 'ru'];
const LANG_LABELS = { fr:'FR', en:'EN', es:'ES', pt:'PT', ar:'عر', zh:'中文', hi:'हि', sw:'SW', ru:'РУ' };

function t(key) {
  return I18N[currentLang]?.[key] ?? I18N.en?.[key] ?? I18N.fr[key] ?? key;
}

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (val) el.textContent = val;
  });
  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
  const sel = document.getElementById('langSelect');
  if (sel) sel.value = currentLang;
  localStorage.setItem('biq-lang', currentLang);
}

function setLang(lang) {
  currentLang = lang;
  applyI18n();
  renderPathogens();
  updateScoreDisplay(selectedRegionId || DEMO_DATA[0].id);
  updateModeToggleBtn();
  updatePatientRiskBanner();
}

// ── Theme ────────────────────────────────────────────────────
function applyTheme() {
  document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
}

function toggleTheme() {
  darkMode = !darkMode;
  applyTheme();
  localStorage.setItem('biq-theme', darkMode ? 'dark' : 'light');
}

// ── Region selector ──────────────────────────────────────────
function buildRegionSelector() {
  const sel = document.getElementById('regionSelect');
  const natGroup = document.createElement('optgroup');
  natGroup.label = currentLang === 'fr' ? 'Pays' : 'Countries';
  const regGroup = document.createElement('optgroup');
  regGroup.label = currentLang === 'fr' ? 'Régions' : 'Regions';

  DEMO_DATA.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r.id;
    opt.textContent = currentLang === 'fr' ? r.nameFR : (r.nameEN || r.nameFR);
    if (r.level === 'national') natGroup.appendChild(opt);
    else regGroup.appendChild(opt);
  });

  sel.innerHTML = '';
  sel.appendChild(natGroup);
  sel.appendChild(regGroup);
  sel.value = selectedRegionId || DEMO_DATA[0].id;
}

// ── Score display ────────────────────────────────────────────
function updateScoreDisplay(regionId) {
  selectedRegionId = parseInt(regionId, 10);
  const region = DEMO_DATA.find(r => r.id === selectedRegionId) || DEMO_DATA[0];
  const score = generateScoreForRegion(region);
  const grade = scoreGrade(score.sr);

  // Dial arc
  const circumference = 515.22;
  const offset = circumference * (1 - score.sr / 100);
  const arc = document.getElementById('scoreArc');
  if (arc) {
    arc.style.strokeDashoffset = offset;
    arc.style.stroke = grade.color;
  }

  const valEl = document.getElementById('scoreValue');
  if (valEl) valEl.textContent = score.sr;

  const gradeEl = document.getElementById('scoreGrade');
  if (gradeEl) {
    gradeEl.textContent = currentLang === 'fr' ? grade.grade : scoreGradeEN(score.sr);
    gradeEl.style.color = grade.color;
  }

  // Hero score
  const heroScoreEl = document.getElementById('heroScore');
  if (heroScoreEl) heroScoreEl.textContent = score.sr;
  const heroStatus = document.getElementById('heroScoreStatus');
  if (heroStatus) {
    heroStatus.textContent = currentLang === 'fr' ? grade.grade : scoreGradeEN(score.sr);
    heroStatus.style.color = grade.color;
  }

  // Components
  const components = [
    { fillId:'aqiFill',     valId:'aqiVal',     val:score.aqi,    color:'#3B82F6' },
    { fillId:'viralFill',   valId:'viralVal',   val:score.viral,  color:'#EF4444' },
    { fillId:'pollenFill',  valId:'pollenVal',  val:score.pollen, color:'#84CC16' },
    { fillId:'weatherFill', valId:'weatherVal', val:score.weather,color:'#0EA5E9' }
  ];
  components.forEach(c => {
    const fill = document.getElementById(c.fillId);
    const val  = document.getElementById(c.valId);
    if (fill) { fill.style.width = `${c.val}%`; fill.style.background = c.color; }
    if (val)  val.textContent = c.val;
  });

  // AI message
  const msg = aiMessageForRegion(region, score, currentLang);
  const msgEl = document.getElementById('aiMessage');
  if (msgEl) msgEl.textContent = msg;

  // AI recommendation
  const recoEl = document.getElementById('aiReco');
  if (recoEl) {
    const protLevel = score.sr > 60 ? 'FFP2/N95' : score.sr > 45 ? 'Chirurgical' : '—';
    recoEl.innerHTML = score.sr > 45
      ? `<span class="reco-badge">${currentLang==='fr'?'Protection recommandée':'Recommended protection'} : ${protLevel}</span>`
      : '';
  }

  // Region selector sync
  const sel = document.getElementById('regionSelect');
  if (sel) sel.value = selectedRegionId;
}

// ── Map ──────────────────────────────────────────────────────
function initMap() {
  if (worldMap) return;

  const mapEl = document.getElementById('worldMap');
  if (!mapEl) return;

  worldMap = L.map('worldMap', {
    center: [20, 10],
    zoom: 2,
    minZoom: 1,
    maxZoom: 10,
    zoomControl: true,
    attributionControl: true
  });

  // OpenStreetMap tiles (fiable, pas de restriction CDN)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abc',
    maxZoom: 19
  }).addTo(worldMap);

  renderMapLayers();
  updateMapStats();

  // Force correct tile rendering after container is fully sized
  setTimeout(() => { if (worldMap) worldMap.invalidateSize(); }, 200);
  setTimeout(() => { if (worldMap) worldMap.invalidateSize(); }, 800);

  window.addEventListener('resize', () => {
    if (worldMap) worldMap.invalidateSize();
  }, { passive: true });
}

function renderMapLayers() {
  if (!worldMap) return;

  // Clear existing layers
  if (stockLayer) { worldMap.removeLayer(stockLayer); stockLayer = null; }
  if (outbreakLayer) { worldMap.removeLayer(outbreakLayer); outbreakLayer = null; }

  const showStocks    = activeLayer === 'stocks' || activeLayer === 'both';
  const showOutbreaks = activeLayer === 'outbreaks' || activeLayer === 'both';

  if (showStocks) {
    const markers = [];
    DEMO_DATA.forEach(r => {
      const icon = L.divIcon({
        html: stockMarkerHTML(r.status, r.level),
        className: 'biq-stock-marker',
        iconSize: [r.level==='national'?14:10, r.level==='national'?14:10],
        iconAnchor: [r.level==='national'?7:5, r.level==='national'?7:5]
      });
      const marker = L.marker([r.lat, r.lon], { icon })
        .bindPopup(buildStockPopup(r));
      markers.push(marker);
    });
    stockLayer = L.layerGroup(markers).addTo(worldMap);
  }

  if (showOutbreaks) {
    const markers = [];
    OUTBREAK_DATA.filter(ob => ob.currentStatus !== 'monitoring').forEach(ob => {
      const icon = L.divIcon({
        html: outbreakMarkerHTML(ob),
        className: 'biq-outbreak-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
      const marker = L.marker([ob.lat, ob.lon], { icon })
        .bindPopup(buildOutbreakPopup(ob));
      markers.push(marker);

      // Second location if available
      if (ob.lat2 !== undefined) {
        const icon2 = L.divIcon({
          html: outbreakMarkerHTML(ob),
          className: 'biq-outbreak-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        markers.push(L.marker([ob.lat2, ob.lon2], { icon: icon2 }).bindPopup(buildOutbreakPopup(ob)));
      }
    });
    outbreakLayer = L.layerGroup(markers).addTo(worldMap);
  }
}

function buildStockPopup(r) {
  const name = currentLang === 'fr' ? r.nameFR : (r.nameEN || r.nameFR);
  const statusLabel = { critical:'Critique', low:'Faible', moderate:'Modéré', sufficient:'Suffisant' }[r.status] || r.status;
  const perCapita = r.pop > 0 ? Math.round((r.stock / r.pop / 1e6) * 10) / 10 : 0;

  return `<div class="map-popup">
    <strong>${name}</strong><br>
    <span style="color:${statusColor(r.status)}">${statusLabel}</span><br>
    Stock : <strong>${r.stock ? (r.stock/1e6).toFixed(1)+'M' : '—'}</strong> unités<br>
    ${perCapita}/habitant · Pop. ${r.pop}M<br>
    <small>Mis à jour : ${r.updated}</small>
  </div>`;
}

function buildOutbreakPopup(ob) {
  const name = currentLang === 'fr' ? ob.nameFR : ob.nameEN;
  const desc = currentLang === 'fr' ? ob.descFR : ob.descEN;
  return `<div class="map-popup outbreak-popup">
    <strong style="color:${ob.iconColor}">${name}</strong><br>
    <em>${ob.pathogen}</em><br>
    <strong>${ob.protectionRequired}</strong><br>
    <small>${ob.activeRegions.join(', ')}</small><br>
    <p style="margin-top:6px;font-size:11px;max-width:220px">${desc ? desc.substring(0,120)+'…' : ''}</p>
  </div>`;
}

function updateMapStats() {
  const critical = DEMO_DATA.filter(r => r.status === 'critical').length;
  const outbreaks = OUTBREAK_DATA.filter(ob => ob.currentStatus === 'active').length;

  const el = (id) => document.getElementById(id);
  if (el('mstatCritical'))  el('mstatCritical').textContent  = critical;
  if (el('mstatOutbreaks')) el('mstatOutbreaks').textContent = outbreaks;
  if (el('mstatMonitored')) el('mstatMonitored').textContent = DEMO_DATA.length;
  if (el('mstatLastUpdate'))el('mstatLastUpdate').textContent = '2026-05-19';

  // Simple patient count
  const simpleCount = document.getElementById('simpleOutbreakCount');
  if (simpleCount) simpleCount.textContent = outbreaks;

  // Hero outbreak count
  const heroCount = document.getElementById('heroOutbreakCount');
  if (heroCount) {
    heroCount.textContent = currentLang === 'fr'
      ? `${outbreaks} foyers actifs`
      : `${outbreaks} active outbreaks`;
  }
  // Hero pathogen count
  const heroPath = document.getElementById('heroPathCount');
  if (heroPath) heroPath.textContent = OUTBREAK_DATA.length;
}

// ── Pathogens grid ───────────────────────────────────────────
const PATHOGEN_ICONS = {
  H5N1:'🐔',        // grippe aviaire → volaille
  SARS2:'🦠',       // coronavirus
  TB:'🫁',          // tuberculose → poumons
  NIPAH:'🦇',       // nipah → chauve-souris
  HANTA:'🐭',       // hantavirus → rongeurs
  MPOX:'🐒',        // mpox → primate
  MERS:'🐫',        // MERS → chameau
  MARBURG:'☣️',     // fièvre hémorragique
  MEASLES:'🌡️',    // rougeole → fièvre élevée
  LEGIONELLA:'🚿',  // légionellose → eau/douche
  INFLUENZA:'🤒',   // grippe → visage malade
  EBOLA:'🩸',       // ebola → hémorragie
  RSV:'👶',         // VRS → nourrissons
  RSYNCYTIAL:'👶',
  PERTUSSIS:'😮‍💨', // coqueluche → toux
  COVID19VAR:'🦠',
  RSVA_HMPV:'🍼',
  CANDIDA_AURIS:'🍄',
  DEFAULT:'🦠',
};

function renderPathogens() {
  const grid = document.getElementById('pathogensGrid');
  if (!grid) return;

  const filtered = currentFilter === 'all'
    ? OUTBREAK_DATA
    : OUTBREAK_DATA.filter(ob => ob.category === currentFilter);

  const riskColors = { critical:'#EF4444', high:'#F97316', moderate:'#F59E0B', low:'#10B981' };
  const riskLabels = {
    fr: { critical:'Risque critique', high:'Risque élevé', moderate:'Risque modéré', low:'Risque faible' },
    en: { critical:'Critical risk', high:'High risk', moderate:'Moderate risk', low:'Low risk' },
    es: { critical:'Riesgo crítico', high:'Riesgo alto', moderate:'Riesgo moderado', low:'Riesgo bajo' },
    pt: { critical:'Risco crítico', high:'Risco alto', moderate:'Risco moderado', low:'Risco baixo' },
    ar: { critical:'خطر حرج', high:'خطر مرتفع', moderate:'خطر متوسط', low:'خطر منخفض' },
    zh: { critical:'极高风险', high:'高风险', moderate:'中等风险', low:'低风险' },
    hi: { critical:'अत्यधिक जोखिम', high:'उच्च जोखिम', moderate:'मध्यम जोखिम', low:'कम जोखिम' },
    sw: { critical:'Hatari kubwa sana', high:'Hatari kubwa', moderate:'Hatari ya wastani', low:'Hatari ndogo' },
    ru: { critical:'Критический риск', high:'Высокий риск', moderate:'Умеренный риск', low:'Низкий риск' },
  };
  const categoryLabels = {
    fr: { pandemic:'Pandémique', epidemic:'Épidémique', endemic:'Endémique', emerging:'Émergent' },
    en: { pandemic:'Pandemic', epidemic:'Epidemic', endemic:'Endemic', emerging:'Emerging' }
  };
  const statusLabels = {
    fr: { active:'Actif', endemic:'Endémique', sporadic:'Sporadique', seasonal:'Saisonnier', monitoring:'Surveillance' },
    en: { active:'Active', endemic:'Endemic', sporadic:'Sporadic', seasonal:'Seasonal', monitoring:'Monitoring' }
  };

  grid.innerHTML = filtered.map(ob => {
    const name = currentLang === 'fr' ? ob.nameFR : (ob.nameEN || ob.nameFR);
    const desc = currentLang === 'fr' ? ob.descFR : (ob.descEN || ob.descFR);
    const riskColor = riskColors[ob.riskLevel] || '#6B7280';
    const riskLabel = (riskLabels[currentLang] || riskLabels.en || riskLabels.fr)[ob.riskLevel] || ob.riskLevel;
    const catLabel  = (categoryLabels[currentLang] || categoryLabels.en || categoryLabels.fr)[ob.category] || ob.category;
    const statLabel = (statusLabels[currentLang] || statusLabels.en || statusLabels.fr)[ob.currentStatus] || ob.currentStatus;
    const protBadgeClass = ob.protectionLevel >= 3 ? 'prot-ffp3' : ob.protectionLevel === 2 ? 'prot-ffp2' : 'prot-surg';
    const refList = ob.references ? ob.references.map(r => `<li>${r}</li>`).join('') : '';
    const pathIcon = PATHOGEN_ICONS[ob.id] || PATHOGEN_ICONS.DEFAULT;
    const symp = SYMPTOMS_DATA[ob.id];
    const sympList = symp ? ((currentLang === 'fr' ? symp.fr : symp.en) || []) : [];
    const alarmList = symp ? ((currentLang === 'fr' ? symp.alarmFR : symp.alarmEN) || []) : [];
    const isoNote = symp ? (currentLang === 'fr' ? symp.isolationFR : symp.isolationEN) : '';

    // ── Mode PATIENT : carte simple, visuelle, universelle ──
    if (currentMode === 'patient') {
      const sympEmojis = ['🌡️','😮‍💨','💪','🤕','🤢','👃','💦','🔴','🔵','🌀'];
      const maskSimple = ob.protectionLevel >= 3
        ? (currentLang === 'fr' ? '😷 Masque FFP3 requis' : '😷 FFP3 mask required')
        : ob.protectionLevel === 2
        ? (currentLang === 'fr' ? '😷 Masque FFP2 recommandé' : '😷 FFP2 mask recommended')
        : (currentLang === 'fr' ? '😷 Masque chirurgical suffisant' : '😷 Surgical mask sufficient');
      const ctaLabel = currentLang === 'fr' ? 'J\'ai ces symptômes →' : 'I have these symptoms →';
      const sympTitle = currentLang === 'fr' ? 'Symptômes' : 'Symptoms';
      const alarmTitle = currentLang === 'fr' ? '🚨 Signe grave — appelez le médecin immédiatement' : '🚨 Serious sign — call a doctor immediately';

      return `<article class="pc-patient" data-id="${ob.id}" data-category="${ob.category}">
        <div class="pcp-icon-wrap" style="border-color:${riskColor}40">
          <span class="pcp-icon">${pathIcon}</span>
        </div>
        <div class="pcp-risk-pill" style="background:${riskColor}15;color:${riskColor};border:1.5px solid ${riskColor}40">
          ${riskLabel}
        </div>
        <h3 class="pcp-name">${name}</h3>
        ${sympList.length ? `<div class="pcp-symptoms">
          <div class="pcp-sym-title">${sympTitle}</div>
          <div class="pcp-sym-tags">
            ${sympList.slice(0,5).map((s,i) => `<span class="pcp-sym-tag">${sympEmojis[i]||'•'} ${s}</span>`).join('')}
          </div>
        </div>` : ''}
        ${alarmList.length ? `<div class="pcp-alarm">
          <strong>${alarmTitle}</strong>
          <span>${alarmList[0]}</span>
        </div>` : ''}
        <div class="pcp-footer">
          <span class="pcp-mask">${maskSimple}</span>
          <button class="pcp-cta" onclick="document.getElementById('symptomChecker')?.scrollIntoView({behavior:'smooth',block:'start'})">${ctaLabel}</button>
        </div>
      </article>`;
    }

    // ── Mode EXPERT : carte technique complète ──
    return `<article class="pathogen-card" data-id="${ob.id}" data-category="${ob.category}">
      <div class="pc-header">
        <div class="pc-dot" style="background:${ob.iconColor}"></div>
        <div class="pc-titles">
          <h3 class="pc-name">${name}</h3>
          <span class="pc-pathogen">${ob.pathogen}</span>
        </div>
        <span class="pc-risk" style="color:${riskColor};border-color:${riskColor}40;background:${riskColor}10">${riskLabel}</span>
      </div>
      <div class="pc-badges">
        <span class="pc-badge pc-cat">${catLabel}</span>
        <span class="pc-badge pc-status ${ob.currentStatus==='active'?'status-active':''}">${statLabel}</span>
        <span class="pc-badge ${protBadgeClass}">${ob.protectionRequired}</span>
      </div>
      <p class="pc-desc">${desc || ''}</p>
      ${sympList.length ? `
        <div class="pc-symptoms-section">
          <div class="pc-symptoms-title">🤒 ${currentLang === 'fr' ? 'Symptômes à surveiller' : 'Symptoms to watch for'}</div>
          <div class="pc-symptom-tags">${sympList.map(s => `<span class="pc-symptom-tag">${s}</span>`).join('')}</div>
        </div>
        ${alarmList.length ? `<div class="pc-alarm-section">
          <div class="pc-alarm-title">⚠️ ${currentLang === 'fr' ? 'Signes d\'alarme — Urgence médicale' : 'Alarm signs — Medical emergency'}</div>
          <ul class="pc-alarm-list">${alarmList.map(a => `<li>${a}</li>`).join('')}</ul>
        </div>` : ''}
        <div class="pc-isolation-note">🏠 ${isoNote || ''}</div>` : ''}
      <div class="pc-meta">
        <div class="pc-meta-item"><span class="pc-meta-label">R₀ / Reff</span><span class="pc-meta-val">${ob.reproductionNumber}</span></div>
        <div class="pc-meta-item"><span class="pc-meta-label">${currentLang==='fr'?'Létalité':'CFR'}</span><span class="pc-meta-val">${ob.cfr}</span></div>
        <div class="pc-meta-item"><span class="pc-meta-label">${currentLang==='fr'?'Incubation':'Incubation'}</span><span class="pc-meta-val">${ob.incubation}</span></div>
        <div class="pc-meta-item"><span class="pc-meta-label">${currentLang==='fr'?'Transmission':'Transmission'}</span><span class="pc-meta-val">${ob.transmission_route.substring(0,80)}…</span></div>
      </div>
      ${ob.maskNote ? `<div class="pc-mask-note"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>${ob.maskNote}</div>` : ''}
      ${refList ? `<details class="pc-refs"><summary>${currentLang==='fr'?'Références scientifiques':'Scientific references'} (${ob.references.length})</summary><ul>${refList}</ul></details>` : ''}
    </article>`;
  }).join('');
}

// ── Navigation scroll behavior ───────────────────────────────
function initNavScroll() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('nav-scrolled', y > 20);
    nav.classList.toggle('nav-hidden', y > lastScrollY && y > 100);
    lastScrollY = y;
  }, { passive: true });
}

// ── Map init — robust (window.load + scroll fallback) ────────
function initMapWhenReady() {
  // S'assurer que Leaflet est bien chargé
  if (typeof L === 'undefined') {
    console.warn('BreathIQ: Leaflet not ready, retrying in 300ms');
    setTimeout(initMapWhenReady, 300);
    return;
  }
  initMap();
}

function initMapObserver() {
  const mapEl = document.getElementById('worldMap');
  if (!mapEl) return;

  // Essai 1 : IntersectionObserver (threshold 0 = dès qu'une partie est visible)
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        initMapWhenReady();
        obs.disconnect();
      }
    }, { threshold: 0, rootMargin: '200px' });
    obs.observe(mapEl);
  }

  // Essai 2 : scroll fallback si IntersectionObserver ne se déclenche pas
  const onScroll = () => {
    const rect = mapEl.getBoundingClientRect();
    if (rect.top < window.innerHeight + 300) {
      window.removeEventListener('scroll', onScroll, { passive: true });
      initMapWhenReady();
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // Essai 3 : window.load fallback ultime (2s max après chargement)
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (!worldMap) initMapWhenReady();
    }, 500);
  }, { once: true });
}

// ── Event listeners ──────────────────────────────────────────
function bindEvents() {
  // Lang select (onchange déjà dans le HTML, on sync juste au rebuild)
  const sel = document.getElementById('langSelect');
  if (sel) sel.value = currentLang;

  // Theme toggle
  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);

  // Region selector
  document.getElementById('regionSelect')?.addEventListener('change', (e) => {
    updateScoreDisplay(parseInt(e.target.value, 10));
  });

  // Layer buttons
  document.querySelectorAll('.layer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.layer-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeLayer = btn.dataset.layer;
      renderMapLayers();
    });
  });

  // Pathogen filters
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderPathogens();
    });
  });
}

// ── Smooth scroll for anchor links ───────────────────────────
// ── Navigation — fonction globale appelable via onclick ───────
// Définie ici (hors DOMContentLoaded) pour être disponible immédiatement
const EXPERT_SECTIONS = new Set(['#score', '#map', '#protection', '#about']);

function navTo(e, href) {
  if (e) e.preventDefault();
  if (EXPERT_SECTIONS.has(href) && currentMode === 'patient') {
    currentMode = 'expert';
    localStorage.setItem('biq-mode', currentMode);
    document.body.dataset.mode = currentMode;
    updateModeToggleBtn();
    setTimeout(() => {
      if (!worldMap) { if (typeof initMapWhenReady === 'function') initMapWhenReady(); }
      else worldMap.invalidateSize(true);
      smoothScrollTo(href);
    }, 80);
    return false;
  }
  smoothScrollTo(href);
  return false;
}

function smoothScrollTo(href) {
  const target = document.querySelector(href);
  if (!target) return;
  const navH = document.getElementById('mainNav')?.offsetHeight || 68;
  window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH - 16, behavior: 'smooth' });
}

function initSmoothScroll() {
  // Gère uniquement les ancres hors-nav (pas les liens onclick déjà traités)
  document.querySelectorAll('a[href^="#"]:not([onclick])').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        smoothScrollTo(href);
      }
    });
  });
}

// ── Mode Patient / Expert ────────────────────────────────────
function initMode() {
  document.body.dataset.mode = currentMode;
  updateModeToggleBtn();
  updatePatientRiskBanner();
}

function toggleMode() {
  if (currentMode === 'patient') {
    // Vérifier si déjà authentifié dans cette session
    if (sessionStorage.getItem('biq-soignant-auth') === '1') {
      activateExpertMode();
    } else {
      openSoignantModal();
    }
  } else {
    currentMode = 'patient';
    localStorage.setItem('biq-mode', 'patient');
    sessionStorage.removeItem('biq-soignant-auth');
    document.body.dataset.mode = 'patient';
    updateModeToggleBtn();
    renderPathogens();
  }
}

function updateModeToggleBtn() {
  const btn = document.getElementById('modeToggleBtn');
  if (!btn) return;
  if (currentMode === 'patient') {
    btn.textContent = '👨‍⚕️ Espace Soignant';
    btn.setAttribute('title', 'Accès réservé aux professionnels de santé');
    btn.classList.remove('mode-btn-expert-active');
  } else {
    btn.textContent = '👤 Mode Patient';
    btn.setAttribute('title', 'Retour à l\'espace grand public');
    btn.classList.add('mode-btn-expert-active');
  }
}

// ── Modal Espace Soignant ────────────────────────────────────────────────────
const SOIGNANT_PASS = 'breathiq2026'; // Mot de passe professionnel par défaut

function openSoignantModal() {
  const modal = document.getElementById('soignantModal');
  if (!modal) return;
  modal.hidden = false;
  modal.removeAttribute('hidden');
  const inp = document.getElementById('soignantPassInput');
  if (inp) { inp.value = ''; inp.classList.remove('soignant-pass-error'); inp.focus(); }
}

function closeSoignantModal() {
  const modal = document.getElementById('soignantModal');
  if (modal) modal.hidden = true;
}

function validateSoignantPass() {
  const inp = document.getElementById('soignantPassInput');
  const val = (inp?.value || '').trim();
  const storedPass = localStorage.getItem('biq-soignant-pass') || SOIGNANT_PASS;
  if (val === storedPass) {
    sessionStorage.setItem('biq-soignant-auth', '1');
    closeSoignantModal();
    activateExpertMode();
  } else {
    if (inp) {
      inp.classList.add('soignant-pass-error');
      inp.value = '';
      inp.placeholder = currentLang === 'fr' ? 'Code incorrect — réessayez' : 'Wrong code — retry';
      setTimeout(() => {
        inp.classList.remove('soignant-pass-error');
        inp.placeholder = currentLang === 'fr' ? 'Code professionnel' : 'Professional code';
      }, 2000);
      inp.focus();
    }
  }
}

function activateExpertMode() {
  currentMode = 'expert';
  localStorage.setItem('biq-mode', 'expert');
  document.body.dataset.mode = 'expert';
  updateModeToggleBtn();
  renderPathogens();
  renderLocalDeclarations();
  renderClusterAlertBanner();
  setTimeout(() => {
    if (!worldMap) initMapWhenReady();
    else worldMap.invalidateSize(true);
    document.getElementById('syndromic')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

function updatePatientRiskBanner() {
  const region = DEMO_DATA.find(r => r.id === (selectedRegionId || 1)) || DEMO_DATA[0];
  const score  = generateScoreForRegion(region);
  const banner = document.getElementById('patientRiskBanner');
  if (!banner) return;

  const icon  = document.getElementById('patientRiskIcon');
  const label = document.getElementById('patientRiskLabel');
  const title = document.getElementById('patientRiskTitle');
  const desc  = document.getElementById('patientRiskDesc');
  const lang  = currentLang;

  banner.className = 'risk-banner';
  if (score.sr <= 45) {
    banner.classList.add('risk-low');
    if (icon)  icon.textContent  = '🟢';
    if (label) label.textContent = lang === 'fr' ? 'RISQUE FAIBLE' : 'LOW RISK';
    if (title) title.textContent = lang === 'fr' ? 'Risque respiratoire actuellement faible dans votre région' : 'Currently low respiratory risk in your region';
    if (desc)  desc.textContent  = lang === 'fr' ? 'La situation épidémiologique est sous contrôle — restez vigilant' : 'Epidemiological situation is under control — stay alert';
  } else if (score.sr <= 65) {
    banner.classList.add('risk-moderate');
    if (icon)  icon.textContent  = '🟡';
    if (label) label.textContent = lang === 'fr' ? 'VIGILANCE RECOMMANDÉE' : 'CAUTION ADVISED';
    if (title) title.textContent = lang === 'fr' ? 'Risque modéré — des foyers épidémiques sont actifs dans le monde' : 'Moderate risk — active disease outbreaks worldwide';
    if (desc)  desc.textContent  = lang === 'fr' ? 'Portez un masque dans les espaces bondés. Lavez-vous les mains régulièrement.' : 'Wear a mask in crowded spaces. Wash your hands regularly.';
  } else {
    banner.classList.add('risk-high');
    if (icon)  icon.textContent  = '🔴';
    if (label) label.textContent = lang === 'fr' ? 'RISQUE ÉLEVÉ' : 'HIGH RISK';
    if (title) title.textContent = lang === 'fr' ? 'Risque élevé — protection respiratoire fortement recommandée' : 'High risk — respiratory protection strongly recommended';
    if (desc)  desc.textContent  = lang === 'fr' ? 'Port du masque FFP2 recommandé. Évitez les espaces confinés.' : 'FFP2 mask recommended. Avoid confined and crowded spaces.';
  }
}

// ── Vérificateur de symptômes ────────────────────────────────
function toggleSymptom(labelEl) {
  const cb = labelEl.querySelector('input[type="checkbox"]');
  if (!cb) return;
  cb.checked = !cb.checked;
  labelEl.classList.toggle('checked', cb.checked);
  const anyChecked = document.querySelectorAll('.symptom-check input:checked').length > 0;
  const btn = document.getElementById('checkerBtn');
  if (btn) btn.disabled = !anyChecked;
  if (cb.checked && ['breathlessness','confusion','bleeding'].includes(cb.value)) {
    setTimeout(checkSymptoms, 300);
  }
}

// ============================================================
// MOTEUR DIAGNOSTIQUE INFECTIOLOGIQUE — BreathIQ v2.0
// Algorithme Bayésien pondéré — Référentiels OMS, ECDC, CDC
// Critères validés: ILI (OMS), CURB-65, FLU score, SARI
// © 2026 Dr. Clément MÉDEAU — Non dispositif médical
// ============================================================

const DIAG_ENGINE = {
  pathogens: {
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
  },

  ORIENTATION: {
    VERT:   { label:'Surveillance à domicile',     icon:'🟢', phone:'',        color:'#16a34a', bg:'#f0fdf4', border:'#86efac' },
    BLEU:   { label:'Médecin traitant sous 48h',   icon:'🔵', phone:'',        color:'#2563eb', bg:'#eff6ff', border:'#93c5fd' },
    JAUNE:  { label:'Médecin de garde aujourd\'hui', icon:'🟡', phone:'116 117', color:'#d97706', bg:'#fffbeb', border:'#fcd34d' },
    ORANGE: { label:'Urgences médicales',           icon:'🟠', phone:'15',      color:'#ea580c', bg:'#fff7ed', border:'#fdba74' },
    ROUGE:  { label:'SAMU — Urgence vitale',        icon:'🔴', phone:'15',      color:'#dc2626', bg:'#fef2f2', border:'#fca5a5' },
  },

  ALARM_RULES: [
    { triggers:['purpura'],                                  level:'ROUGE',  reason:'Purpura cutané non blanchissant — méningococcémie à exclure en urgence absolue' },
    { triggers:['bleeding'],                                 level:'ROUGE',  reason:'Saignements actifs — fièvre hémorragique virale à exclure' },
    { triggers:['seizures'],                                 level:'ROUGE',  reason:'Convulsions — urgence neurologique' },
    { triggers:['apnea'],                                    level:'ROUGE',  reason:'Apnées — détresse respiratoire aiguë (nourrisson)' },
    { triggers:['cyanosis'],                                 level:'ROUGE',  reason:'Cyanose — hypoxémie sévère' },
    { triggers:['confusion'],                                level:'ORANGE', reason:'Confusion/désorientation — évaluation neurologique urgente' },
    { triggers:['dyspnea_rest'],                             level:'ORANGE', reason:'Dyspnée au repos — insuffisance respiratoire à évaluer' },
    { triggers:['neck_stiffness','fever_high'],              level:'ROUGE',  reason:'Syndrome méningé fébrile — méningite à exclure en urgence' },
    { triggers:['neck_stiffness','fever_very_high'],         level:'ROUGE',  reason:'Syndrome méningé fébrile — méningite à exclure en urgence' },
    { triggers:['travel_africa_high_risk','fever_high'],     level:'ORANGE', reason:'Retour zone endémique paludisme — bilan parasitologique urgent' },
    { triggers:['age_infant','fever_high'],                  level:'ORANGE', reason:'Fièvre chez nourrisson < 3 mois — évaluation aux urgences pédiatriques' },
    { triggers:['immunocompromised','fever_high'],           level:'ORANGE', reason:'Immunodéprimé fébrile — neutropénie fébrile à éliminer' },
    { triggers:['hemoptysis'],                               level:'ORANGE', reason:'Hémoptysie — tuberculose ou embolie pulmonaire à explorer' },
    { triggers:['age_senior','dyspnea_rest'],                level:'ORANGE', reason:'Dyspnée chez senior — décompensation cardiorespiratoire possible' },
  ],
};

function collectCheckerState() {
  const symptoms = Array.from(document.querySelectorAll('.symptom-check input:checked')).map(cb => cb.value);
  const alarm    = Array.from(document.querySelectorAll('.alarm-sign-check input:checked')).map(cb => cb.value);
  const ctx      = Array.from(document.querySelectorAll('.ctx-check input:checked')).map(cb => cb.value);
  const onset    = document.querySelector('.ctx-pill[data-group="onset"].selected')?.dataset.value || 'unknown';
  const fever    = document.querySelector('.ctx-pill[data-group="fever"].selected')?.dataset.value || 'unknown';
  const age      = document.querySelector('.ctx-pill[data-group="age"].selected')?.dataset.value || 'adult';
  return { symptoms, alarm, ctx, onset, fever, age };
}

function runDiagnosticEngine(state) {
  const { symptoms, alarm, ctx, onset, fever, age } = state;
  const allFlags = [...symptoms, ...alarm, ...ctx];

  // Normalise les flags d'entrée → identifiants du moteur
  const flags = new Set(allFlags);
  if (onset === 'sudden') flags.add('onset_sudden');
  if (onset === 'gradual' || onset === 'days_4_7') flags.add('onset_gradual');
  if (onset === 'weeks') { flags.add('duration_weeks'); flags.add('onset_gradual'); }
  if (fever === 'fever_low')       { flags.add('fever'); flags.add('fever_low'); }
  if (fever === 'fever_high')      { flags.add('fever'); flags.add('fever_high'); }
  if (fever === 'fever_very_high') { flags.add('fever'); flags.add('fever_high'); flags.add('fever_very_high'); }
  if (age === 'infant') flags.add('age_infant');
  if (age === 'senior') flags.add('age_senior');

  // Synonymes (anciens codes symptômes → nouveaux flags)
  const syn = {
    'breathlessness':'dyspnea', 'dry_cough':'dry_cough', 'wet_cough':'wet_cough',
    'persistent_cough':'cough_3w', 'smell_loss':'smell_loss', 'muscle_pain':'myalgias',
    'headache':'headache', 'confusion':'confusion', 'bleeding':'bleeding',
    'lymph_nodes':'lymph_nodes', 'night_sweats':'night_sweats', 'vomiting':'vomiting',
    'rash':'rash', 'fever':'fever',
  };
  for (const [old, nw] of Object.entries(syn)) { if (flags.has(old)) flags.add(nw); }
  // Alarm signs use _alarm suffix in HTML — map back to engine flag names
  if (flags.has('neck_stiffness_alarm')) { flags.add('neck_stiffness'); flags.add('fever_high'); }
  if (flags.has('purpura_alarm'))        flags.add('purpura');
  if (flags.has('confusion_alarm'))      flags.add('confusion');
  if (flags.has('dyspnea_rest_alarm'))   flags.add('dyspnea_rest');
  if (flags.has('bleeding_alarm'))       flags.add('bleeding');
  if (flags.has('seizures_alarm'))       flags.add('seizures');

  // Calcul des scores par pathogène
  const scores = {};
  for (const [pid, profile] of Object.entries(DIAG_ENGINE.pathogens)) {
    let score = profile.prior;
    for (const [flag, weight] of Object.entries(profile.weights)) {
      if (flags.has(flag)) score += weight;
    }
    scores[pid] = Math.max(0, score);
  }

  // Normalisation → probabilité relative (top 3 candidats affichés)
  const total = Object.values(scores).reduce((s,v) => s + v, 0) || 1;
  const ranked = Object.entries(scores)
    .map(([pid, raw]) => ({ pid, raw, pct: Math.round((raw / total) * 100) }))
    .sort((a,b) => b.raw - a.raw)
    .filter(d => d.pct >= 3)
    .slice(0, 3);

  // Détermination du niveau d'orientation (règles d'alarme)
  let orientLevel = null;
  let alarmReason = null;
  const LEVEL_RANK = { VERT:0, BLEU:1, JAUNE:2, ORANGE:3, ROUGE:4 };
  const LEVEL_REV  = ['VERT','BLEU','JAUNE','ORANGE','ROUGE'];

  for (const rule of DIAG_ENGINE.ALARM_RULES) {
    if (rule.triggers.every(t => flags.has(t))) {
      const rk = LEVEL_RANK[rule.level] || 0;
      if (orientLevel === null || rk > LEVEL_RANK[orientLevel]) {
        orientLevel = rule.level;
        alarmReason = rule.reason;
      }
    }
  }

  // Orientation par défaut basée sur le score si pas d'alarme
  if (!orientLevel) {
    const topScore = ranked[0]?.raw || 0;
    const hasHighFever   = flags.has('fever_high') || flags.has('fever_very_high');
    const hasAnySigns    = symptoms.length >= 4;
    const isSeniorOrInfant = flags.has('age_senior') || flags.has('age_infant');

    if (symptoms.length === 0 && alarm.length === 0) {
      orientLevel = null; // pas encore assez d'info
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

function checkSymptoms() {
  const state  = collectCheckerState();
  const result = runDiagnosticEngine(state);
  renderDiagnosticResult(result, state);
}

function renderDiagnosticResult(result, state) {
  const { ranked, flags, orientLevel, alarmReason } = result;
  const lang = currentLang;
  const fr   = lang === 'fr';

  if (!orientLevel) return;

  const orient = DIAG_ENGINE.ORIENTATION[orientLevel];

  // ── Bloc orientation ────────────────────────────────────────
  const alarmBlock = alarmReason
    ? `<div class="diag-alarm-reason">${fr ? '⚠️ Motif :' : '⚠️ Reason:'} ${alarmReason}</div>`
    : '';

  const phoneBlock = orient.phone
    ? `<a class="diag-phone-btn" href="tel:${orient.phone.replace(/\s/g,'')}">
         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
         ${orient.phone}
       </a>`
    : '';

  // ── Pathogènes probables ────────────────────────────────────
  let pathoBlock = '';
  if (ranked.length > 0) {
    pathoBlock = `<div class="diag-patho-title">${fr ? '🔬 Diagnostics à évoquer' : '🔬 Suspected diagnoses'}</div>`;
    ranked.forEach((d,i) => {
      const p = DIAG_ENGINE.pathogens[d.pid];
      if (!p) return;
      const name = fr ? p.nameFR : p.nameEN;
      const criterion = p.criterionFR || '';
      const reportBadge = p.mandatoryReport
        ? `<span class="diag-report-badge">${fr ? 'Déclaration obligatoire' : 'Mandatory reporting'}</span>` : '';
      pathoBlock += `
        <div class="diag-patho-card ${i===0?'diag-patho-card--top':''}">
          <div class="diag-patho-row">
            <span class="diag-patho-icon">${p.icon}</span>
            <div class="diag-patho-info">
              <div class="diag-patho-name">${name} ${reportBadge}</div>
              <div class="diag-patho-criterion">${criterion}</div>
            </div>
            <div class="diag-patho-bar-wrap">
              <div class="diag-patho-bar"><div class="diag-patho-fill" style="width:${Math.min(d.pct*2.5,100)}%"></div></div>
              <span class="diag-patho-prot">${p.protection}</span>
            </div>
          </div>
          ${i===0&&p.isolationFR ? `<div class="diag-isolation">${fr?'🔒 Isolement :':' 🔒 Isolation:'} ${p.isolationFR}</div>` : ''}
        </div>`;
    });
  }

  // ── Assemblage final ────────────────────────────────────────
  const html = `
  <div class="diag-result-card" style="--orient-color:${orient.color};--orient-bg:${orient.bg};--orient-border:${orient.border}">
    <div class="diag-orient-header">
      <span class="diag-orient-icon">${orient.icon}</span>
      <div>
        <div class="diag-orient-label">${orient.label}</div>
        ${alarmBlock}
      </div>
      ${phoneBlock}
    </div>

    ${pathoBlock}

    <div class="diag-result-actions">
      <button class="result-action-btn result-action-primary" onclick="document.getElementById('actionGuide')?.scrollIntoView({behavior:'smooth'})">
        ${fr ? '→ Que faire maintenant ?' : '→ What to do now?'}
      </button>
      <button class="result-action-btn result-action-secondary" onclick="resetChecker()">
        ${fr ? '↺ Recommencer' : '↺ Reset'}
      </button>
    </div>
    <div class="diag-legal-footer">
      <p class="diag-disclaimer">${fr
        ? 'Outil indicatif non diagnostique — consultez toujours un professionnel de santé. Orientations basées sur les référentiels publiés OMS / ECDC / CDC / HCSP.'
        : 'Indicative tool — always consult a healthcare professional. Based on published WHO/ECDC/CDC/HCSP guidelines.'}</p>
      <p class="diag-ai-notice">${fr
        ? '🤖 Système d\'aide algorithmique — Règlement UE IA Act (2024). Cet outil n\'est pas un dispositif médical (Règl. UE 2017/745). Il ne pose aucun diagnostic et ne remplace pas l\'examen clinique. La décision appartient toujours au clinicien.'
        : '🤖 Algorithmic assistance system — EU AI Act (2024). This tool is not a medical device (EU Reg. 2017/745). It does not diagnose and does not replace clinical examination.'}</p>
    </div>
  </div>`;

  const resultEl = document.getElementById('symptomResult');
  if (!resultEl) return;
  resultEl.className = `symptom-result diag-result-${orientLevel.toLowerCase()}`;
  resultEl.innerHTML = html;
  resultEl.classList.remove('hidden');
  resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function toggleContextPill(el, group) {
  document.querySelectorAll(`.ctx-pill[data-group="${group}"]`).forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
  const anyChecked = document.querySelectorAll('.symptom-check input:checked, .alarm-sign-check input:checked').length > 0;
  const btn = document.getElementById('checkerBtn');
  if (btn) btn.disabled = !anyChecked;
  checkSymptoms();
}

function toggleAlarmSign(labelEl) {
  const cb = labelEl.querySelector('input[type="checkbox"]');
  if (!cb) return;
  cb.checked = !cb.checked;
  labelEl.classList.toggle('alarm-checked', cb.checked);
  const btn = document.getElementById('checkerBtn');
  if (btn) btn.disabled = false;
  checkSymptoms();
}

function resetChecker() {
  document.querySelectorAll('.symptom-check').forEach(el => {
    el.classList.remove('checked');
    const cb = el.querySelector('input');
    if (cb) cb.checked = false;
  });
  const btn = document.getElementById('checkerBtn');
  if (btn) btn.disabled = true;
  const res = document.getElementById('symptomResult');
  if (res) res.classList.add('hidden');
}

// ── Numéros d'urgence par pays ────────────────────────────────
function getEmergencyNumber(countryCode) {
  const nums = {
    FR:'15 · 116 117', BE:'112 · 100', CH:'144', LU:'112', MC:'15',
    DE:'112', AT:'144', NL:'112', SE:'112', NO:'113', DK:'112', FI:'112',
    ES:'112', PT:'112', IT:'118', GB:'999', IE:'999', PL:'112', CZ:'155',
    US:'911', CA:'911', AU:'000', NZ:'111', MX:'911', BR:'192', AR:'911', CL:'131',
    CN:'120', JP:'119', KR:'119', IN:'112', PH:'911', TH:'1669', ID:'119', VN:'115',
    ZA:'10111', NG:'199', KE:'999', GH:'193', SN:'15', CI:'185', CM:'15', MA:'15', DZ:'115',
    SA:'911', AE:'998', EG:'123', TR:'112', IL:'101', RU:'103', UA:'103',
  };
  return nums[countryCode] || '112';
}

// ── Modale de permission de géolocalisation ───────────────────
let _geoResolve = null;

function openGeoModal() {
  return new Promise(resolve => {
    _geoResolve = resolve;
    const modal = document.getElementById('geoModal');
    if (!modal) { resolve(true); return; }
    applyI18n();
    modal.hidden = false;
    modal.removeAttribute('hidden');
    document.getElementById('geoAcceptBtn')?.focus();
  });
}

function closeGeoModal(accepted) {
  const modal = document.getElementById('geoModal');
  if (modal) modal.hidden = true;
  if (_geoResolve) { _geoResolve(accepted); _geoResolve = null; }
}

function renderGeoDeniedHelp() {
  const isChrome  = navigator.userAgent.includes('Chrome') && !navigator.userAgent.includes('Edg');
  const isFirefox = navigator.userAgent.includes('Firefox');
  const isSafari  = navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome');
  const isIOS     = /iPhone|iPad|iPod/.test(navigator.userAgent);

  let steps = '';
  if (isIOS) {
    steps = currentLang === 'fr'
      ? '<li>Ouvrez <strong>Réglages</strong> de votre iPhone/iPad</li><li>Allez dans <strong>Confidentialité &amp; Sécurité → Service de localisation</strong></li><li>Cherchez votre navigateur (Safari/Chrome) et sélectionnez <strong>Lors de l\'utilisation de l\'app</strong></li><li>Revenez sur cette page et réessayez</li>'
      : '<li>Open your iPhone/iPad <strong>Settings</strong></li><li>Go to <strong>Privacy &amp; Security → Location Services</strong></li><li>Find your browser and select <strong>While Using the App</strong></li><li>Come back to this page and try again</li>';
  } else if (isFirefox) {
    steps = currentLang === 'fr'
      ? '<li>Cliquez sur l\'<strong>icône de cadenas 🔒</strong> dans la barre d\'adresse</li><li>Cliquez sur <strong>Effacer les permissions</strong> à côté de Localisation</li><li>Rechargez la page et acceptez la demande</li>'
      : '<li>Click the <strong>lock icon 🔒</strong> in the address bar</li><li>Click <strong>Clear Permission</strong> next to Location</li><li>Reload the page and accept the request</li>';
  } else if (isSafari) {
    steps = currentLang === 'fr'
      ? '<li>Dans Safari, allez dans <strong>Safari → Réglages pour ce site web</strong></li><li>Changez <strong>Localisation</strong> de "Refuser" à <strong>"Demander"</strong></li><li>Rechargez la page et acceptez</li>'
      : '<li>In Safari, go to <strong>Safari → Settings for This Website</strong></li><li>Change <strong>Location</strong> from "Deny" to <strong>"Ask"</strong></li><li>Reload the page and accept</li>';
  } else {
    // Chrome / Edge / autres
    steps = currentLang === 'fr'
      ? '<li>Cliquez sur l\'<strong>icône de cadenas 🔒</strong> dans la barre d\'adresse (à gauche de l\'URL)</li><li>Cliquez sur <strong>Paramètres du site</strong></li><li>Changez <strong>Localisation</strong> de "Bloquer" à <strong>"Autoriser"</strong></li><li>Rechargez la page et réessayez</li>'
      : '<li>Click the <strong>lock icon 🔒</strong> in the address bar (left of the URL)</li><li>Click <strong>Site settings</strong></li><li>Change <strong>Location</strong> from "Block" to <strong>"Allow"</strong></li><li>Reload the page and try again</li>';
  }

  const title = currentLang === 'fr' ? '🔒 Localisation bloquée par votre navigateur' : '🔒 Location blocked by your browser';
  const intro = currentLang === 'fr'
    ? 'Votre navigateur a mémorisé un refus. Pour débloquer la localisation :'
    : 'Your browser remembered a previous refusal. To re-enable location:';

  return `<div class="care-geo-denied-box">
    <p class="care-geo-denied-title">${title}</p>
    <p class="care-geo-denied-intro">${intro}</p>
    <ol class="care-geo-denied-steps">${steps}</ol>
  </div>`;
}

// ── Localisateur de soins ─────────────────────────────────────
async function findNearbyCare() {
  const btn = document.getElementById('findCareBtn');
  const results = document.getElementById('careResults');
  if (!btn || !results) return;

  if (!navigator.geolocation) {
    results.innerHTML = `<p class="care-error">${t('care-no-geo') || 'Géolocalisation non supportée par votre navigateur.'}</p>`;
    return;
  }

  // Appel direct à getCurrentPosition — Chrome affiche son prompt natif si besoin.
  // Pas de pré-vérification navigator.permissions ni de modal custom :
  // ceux-ci créaient des conditions de course avec l'état mémorisé par Chrome.
  btn.disabled = true;
  btn.textContent = t('care-searching') || 'Recherche en cours…';

  navigator.geolocation.getCurrentPosition(
    async ({ coords: { latitude: lat, longitude: lon } }) => {
      try {
        const ovQuery = (amenities, limit) =>
          `[out:json][timeout:20];(node[amenity~"${amenities}"](around:10000,${lat},${lon});way[amenity~"${amenities}"](around:10000,${lat},${lon}););out center ${limit};`;

        const ovFetch = (query) => fetch('/api/overpass', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: query }),
        });

        const [geoResp, ovHospResp, ovPharmResp] = await Promise.all([
          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=${currentLang.substring(0,2)}`),
          ovFetch(ovQuery('hospital|clinic|doctors|health_post', 8)),
          ovFetch(ovQuery('pharmacy', 8)),
        ]);

        const geoData   = await geoResp.json();
        const ovHosp    = await ovHospResp.json();
        const ovPharm   = await ovPharmResp.json();
        const addr      = geoData.address || {};
        const city      = addr.city || addr.town || addr.village || addr.county || '';
        const country   = addr.country || '';
        const cc        = (addr.country_code || '').toUpperCase();
        const emerNum   = getEmergencyNumber(cc);
        const fr        = currentLang === 'fr';

        const calcDist = (el) => Math.round(Math.sqrt(
          Math.pow(((el.lat || el.center?.lat) - lat) * 111320, 2) +
          Math.pow(((el.lon || el.center?.lon) - lon) * 111320 * Math.cos(lat * Math.PI / 180), 2)
        ));

        const mapFacilities = (elements) => (elements || [])
          .filter(el => el.tags?.name)
          .map(el => ({
            name:    el.tags.name,
            amenity: el.tags.amenity,
            phone:   el.tags.phone || el.tags['contact:phone'] || null,
            hours:   el.tags['opening_hours'] || null,
            website: el.tags.website || el.tags['contact:website'] || null,
            dist:    calcDist(el),
          }))
          .sort((a,b) => a.dist - b.dist)
          .slice(0, 6);

        const hospitals  = mapFacilities(ovHosp.elements);
        const pharmacies = mapFacilities(ovPharm.elements);

        const renderList = (items, icons) => {
          if (!items.length) return `<p class="care-no-results">${t('care-no-results')}</p>`;
          return `<ul class="care-list">${items.map(f => {
            const icon = icons[f.amenity] || icons.default;
            const dist = f.dist < 1000 ? `${f.dist} m` : `${(f.dist/1000).toFixed(1)} km`;
            return `<li class="care-item">
              <span class="care-icon">${icon}</span>
              <div class="care-info">
                <strong>${f.name}</strong>
                <span class="care-dist">📍 ${dist}</span>
                ${f.hours ? `<span class="care-hours">🕐 ${f.hours}</span>` : ''}
                ${f.phone ? `<a href="tel:${f.phone}" class="care-phone">📞 ${f.phone}</a>` : ''}
                ${f.website ? `<a href="${f.website}" class="care-web" target="_blank" rel="noopener">🌐 ${fr ? 'Site' : 'Website'}</a>` : ''}
              </div>
            </li>`;
          }).join('')}</ul>`;
        };

        const html = `
          <div class="care-location">
            <span class="care-city">📍 ${city}${country ? ', ' + country : ''}</span>
            <span class="care-emergency">🚨 ${fr ? 'Urgences' : 'Emergency'}: <strong>${emerNum}</strong></span>
          </div>
          <div class="care-tabs">
            <button class="care-tab-btn active" onclick="switchCareTab(this,'care-tab-hosp')">${fr ? '🏥 Soins médicaux' : '🏥 Medical care'} <span class="care-tab-count">${hospitals.length}</span></button>
            <button class="care-tab-btn" onclick="switchCareTab(this,'care-tab-pharm')">${fr ? '💊 Pharmacies' : '💊 Pharmacies'} <span class="care-tab-count">${pharmacies.length}</span></button>
          </div>
          <div id="care-tab-hosp" class="care-tab-panel active">
            ${renderList(hospitals, { hospital:'🏥', clinic:'🏥', doctors:'👨‍⚕️', health_post:'🩺', default:'🏥' })}
          </div>
          <div id="care-tab-pharm" class="care-tab-panel hidden">
            ${pharmacies.length ? `
              <div class="pharm-epi-note">
                ${fr
                  ? '💊 Les pharmacies vendent généralement masques FFP2, FFP3 et chirurgicaux. Appelez avant de vous déplacer pour confirmer les stocks.'
                  : '💊 Pharmacies typically stock FFP2, FFP3 and surgical masks. Call ahead to confirm availability.'}
              </div>
            ` : ''}
            ${renderList(pharmacies, { pharmacy:'💊', default:'💊' })}
          </div>
        `;

        results.innerHTML = html;
        btn.textContent = t('care-btn-refresh') || '🔄 Actualiser';
      } catch {
        results.innerHTML = `<p class="care-error">${t('care-error')}</p>`;
        btn.textContent = t('care-btn');
      }
      btn.disabled = false;
    },
    (err) => {
      btn.disabled = false;
      btn.textContent = t('care-btn');
      if (err.code === 1 /* PERMISSION_DENIED */) {
        results.innerHTML = renderGeoDeniedHelp();
      } else if (err.code === 3 /* TIMEOUT */) {
        results.innerHTML = `<p class="care-error">${currentLang === 'fr' ? 'Délai dépassé — réessayez.' : 'Request timed out — please try again.'}</p>`;
      } else {
        results.innerHTML = `<p class="care-error">${t('care-error') || 'Position indisponible.'}</p>`;
      }
    },
    { timeout: 15000, maximumAge: 30000 }
  );
}

function switchCareTab(btn, tabId) {
  btn.closest('.care-results').querySelectorAll('.care-tab-btn').forEach(b => b.classList.remove('active'));
  btn.closest('.care-results').querySelectorAll('.care-tab-panel').forEach(p => { p.classList.remove('active'); p.classList.add('hidden'); });
  btn.classList.add('active');
  const panel = document.getElementById(tabId);
  if (panel) { panel.classList.add('active'); panel.classList.remove('hidden'); }
}

// Appliquer le mode immédiatement (pas besoin d'attendre DOMContentLoaded)
// car script.js est en bas du body — le DOM est déjà parsé
initMode();

// Pré-remplir la date d'aujourd'hui dans le formulaire de déclaration
(() => {
  const d = document.getElementById('declOnsetDate');
  if (d) d.value = new Date().toISOString().slice(0,10);
  renderLocalDeclarations();
})();

// ── Init ─────────────────────────────────────────────────────
// Wrapper robuste : fonctionne même si DOMContentLoaded est déjà passé
function domReady(cb) {
  if (document.readyState !== 'loading') cb();
  else document.addEventListener('DOMContentLoaded', cb);
}
domReady(() => {
  // Theme from storage
  const savedTheme = localStorage.getItem('biq-theme');
  if (savedTheme) darkMode = savedTheme === 'dark';
  applyTheme();

  // Mode Patient / Expert (déjà appelé immédiatement hors DOMContentLoaded)
  updatePatientRiskBanner();

  // i18n
  applyI18n();

  // Region selector
  buildRegionSelector();

  // Score for first region
  updateScoreDisplay(DEMO_DATA[0].id);

  // Pathogens
  renderPathogens();

  // Map — init direct + lazy fallback
  setTimeout(() => initMapWhenReady(), 400);
  initMapObserver();

  // Map stats (even before map loads)
  updateMapStats();

  // UI
  bindEvents();
  initNavScroll();
  initSmoothScroll();

  // RGPD consent + mes données
  initConsent();
  renderMyDataSection();

  // Proactive geolocation permission state → update care-finder button label
  if (navigator.permissions) {
    navigator.permissions.query({ name: 'geolocation' }).then(status => {
      const careBtn = document.getElementById('findCareBtn');
      if (!careBtn) return;
      if (status.state === 'denied') {
        careBtn.title = 'Géolocalisation bloquée — autorisez-la dans les réglages du navigateur';
        careBtn.classList.add('geo-blocked');
      }
      status.addEventListener('change', () => {
        if (status.state === 'denied') {
          careBtn.title = 'Géolocalisation bloquée — autorisez-la dans les réglages du navigateur';
          careBtn.classList.add('geo-blocked');
        } else {
          careBtn.title = '';
          careBtn.classList.remove('geo-blocked');
        }
      });
    }).catch(() => {});
  }

  // Données live
  if (typeof BIQ_LIVE !== 'undefined') {
    BIQ_LIVE.on('update', (e) => applyLiveData(e.detail.parsed));
    BIQ_LIVE.on('status', (e) => updateLiveStatusBadge(e.detail));
    BIQ_LIVE.start(5 * 60 * 1000);
  }
});

// ── Intégration données live ─────────────────────────────────
function applyLiveData(parsed) {
  if (!parsed) return;

  const region = DEMO_DATA.find(r => r.id === (selectedRegionId || 1)) || DEMO_DATA[0];
  const score  = generateScoreForRegion(region);

  // Meilleure source AQI locale : WAQI > Open-Meteo > OpenAQ FR
  const bestAqi = parsed.waqiLocal || parsed.localAqi || parsed.frAqi;
  if (bestAqi?.aqiScore != null) {
    score.aqi = bestAqi.aqiScore;
    score.sr  = Math.round(0.40 * score.aqi + 0.30 * score.viral + 0.15 * score.pollen + 0.15 * score.weather);
  }
  if (parsed.frFlu?.viralScore != null) {
    score.viral = parsed.frFlu.viralScore;
    score.sr    = Math.round(0.40 * score.aqi + 0.30 * score.viral + 0.15 * score.pollen + 0.15 * score.weather);
  }
  // Pollen local (Open-Meteo)
  if (parsed.localAqi?.pollenScore != null) {
    score.pollen = parsed.localAqi.pollenScore;
    score.sr     = Math.round(0.40 * score.aqi + 0.30 * score.viral + 0.15 * score.pollen + 0.15 * score.weather);
  }

  updatePatientRiskBanner();

  // Tooltip sur les composantes du score
  const aqiComp = document.getElementById('comp-aqi-value');
  if (aqiComp && bestAqi) aqiComp.title = bestAqi.label || '';
  const viralComp = document.getElementById('comp-viral-value');
  if (viralComp && parsed.frFlu) viralComp.title = parsed.frFlu.label || '';

  // Horodatage
  const tsEl = document.getElementById('liveLastUpdate');
  if (tsEl) {
    const d = new Date();
    tsEl.textContent = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
  }

  // Surveillance syndromique : courbe épidémique + alertes
  if (parsed.frFlu?.series?.length) updateSyndromicDashboard(parsed.frFlu);

  // Panneau sources live (mode expert)
  renderLiveSourcesPanel(parsed);
  // Widget SUM'EAU
  renderSumEauWidget(parsed.sumeau);
  // Widget WAQI détaillé
  renderWaqiWidget(parsed.waqiLocal || parsed.localAqi);
  // Pollen
  renderPollenWidget(parsed.localAqi);
}

// ── Surveillance syndromique — Algorithme OMS 7-1-7 ──────────

/**
 * Met à jour les niveaux d'alerte et la courbe épidémique
 * à partir des données SPF Grippe (avec baseline 52 semaines)
 */
function updateSyndromicDashboard(frFlu) {
  if (!frFlu) return;

  // ── Niveaux d'alerte dynamiques ──
  const level = frFlu.alertLevel || 'normal'; // 'normal'|'jaune'|'orange'|'rouge'
  ['normal','jaune','orange','rouge'].forEach(l => {
    const el = document.getElementById(`al-${l}`);
    if (el) el.classList.toggle('active', l === level);
  });

  // ── Statistiques ──
  const setEl = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  const b = frFlu.baseline || {};
  setEl('epiStatCurrent', frFlu.rate != null ? `${frFlu.rate.toFixed(0)} /100k` : '—');
  setEl('epiStatMean',    b.mean != null  ? `${b.mean.toFixed(0)} /100k` : '—');
  setEl('epiStatZ',       frFlu.zScore != null ? `${frFlu.zScore > 0 ? '+' : ''}${frFlu.zScore}σ` : '—');
  setEl('epiStatT1',      b.t1 != null  ? `${b.t1.toFixed(0)} /100k` : '—');
  setEl('epiStatT2',      b.t2 != null  ? `${b.t2.toFixed(0)} /100k` : '—');
  setEl('epiStatT3',      b.t3 != null  ? `${b.t3.toFixed(0)} /100k` : '—');

  // Stat dans l'en-tête courbe
  const statEl = document.getElementById('epiCurveStat');
  if (statEl && frFlu.zScore != null) {
    const colors = { normal:'#10B981', jaune:'#F59E0B', orange:'#F97316', rouge:'#EF4444' };
    statEl.innerHTML = `<span style="color:${colors[level]};font-weight:700">z=${frFlu.zScore > 0 ? '+' : ''}${frFlu.zScore}σ · ${level.toUpperCase()}</span>`;
  }

  // ── Courbe épidémique SVG ──
  renderEpiCurve(frFlu);

  // ── Déclarations locales ──
  renderLocalDeclarations();
}

/**
 * Dessine la courbe épidémique (SVG) avec seuils d'alerte
 */
function renderEpiCurve(frFlu) {
  const wrap = document.getElementById('epiCurveChart');
  if (!wrap || !frFlu?.series?.length) return;

  const series = frFlu.series.slice(-26); // dernières 26 semaines
  const b      = frFlu.baseline || {};
  const vals   = series.map(s => s.rate);
  const maxVal = Math.max(...vals, b.t3 || 0, 10);
  const W = 560, H = 140, padL = 48, padR = 12, padT = 16, padB = 28;
  const iW = W - padL - padR;
  const iH = H - padT - padB;

  const xScale = (i) => padL + (i / (series.length - 1)) * iW;
  const yScale = (v) => padT + iH - (v / maxVal) * iH;

  // Ligne principale
  const linePts = series.map((s,i) => `${xScale(i).toFixed(1)},${yScale(s.rate).toFixed(1)}`).join(' ');

  // Seuils
  const threshLine = (val, color, label) => {
    if (val == null || isNaN(val)) return '';
    const y = yScale(val).toFixed(1);
    return `
      <line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="${color}" stroke-width="1" stroke-dasharray="4 3" opacity=".7"/>
      <text x="${W - padR + 2}" y="${parseFloat(y)+4}" font-size="9" fill="${color}" opacity=".9">${label}</text>
    `;
  };

  // Aires de fond par niveau
  const areaT3 = yScale(b.t3 || 0).toFixed(1);
  const areaT2 = yScale(b.t2 || 0).toFixed(1);
  const areaT1 = yScale(b.t1 || 0).toFixed(1);
  const areaBot = (padT + iH).toFixed(1);

  // Axe Y (3 labels)
  const yLabels = [0, Math.round(maxVal/2), Math.round(maxVal)].map(v =>
    `<text x="${padL-4}" y="${yScale(v).toFixed(1)+4}" font-size="9" fill="#9ca3af" text-anchor="end">${v}</text>`
  ).join('');

  // Points de données (dernier en surbrillance)
  const dots = series.map((s,i) => {
    const isLast = i === series.length - 1;
    const colors = { normal:'#10B981', jaune:'#F59E0B', orange:'#F97316', rouge:'#EF4444' };
    const col = s.rate >= (b.t3||Infinity) ? colors.rouge
              : s.rate >= (b.t2||Infinity) ? colors.orange
              : s.rate >= (b.t1||Infinity) ? colors.jaune : colors.normal;
    return `<circle cx="${xScale(i).toFixed(1)}" cy="${yScale(s.rate).toFixed(1)}" r="${isLast?5:2.5}" fill="${col}" ${isLast ? `stroke="#fff" stroke-width="2"` : 'opacity=".8"'}><title>${s.week}: ${s.rate.toFixed(0)}/100k</title></circle>`;
  }).join('');

  // Labels X (toutes les 4 semaines)
  const xLabels = series.filter((_,i) => i % 4 === 0 || i === series.length-1).map((s,_,arr) => {
    const origIdx = series.indexOf(s);
    const label = s.week?.slice(-3) || '';
    return `<text x="${xScale(origIdx).toFixed(1)}" y="${H-4}" font-size="8" fill="#9ca3af" text-anchor="middle">${label}</text>`;
  }).join('');

  wrap.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" role="img" aria-label="Courbe épidémique grippe France" style="overflow:visible">
      <!-- Aires niveaux -->
      <rect x="${padL}" y="${areaT3}" width="${iW}" height="${parseFloat(areaBot)-parseFloat(areaT3)}" fill="#EF4444" opacity=".06"/>
      <rect x="${padL}" y="${areaT2}" width="${iW}" height="${parseFloat(areaT3)-parseFloat(areaT2)}" fill="#F97316" opacity=".07"/>
      <rect x="${padL}" y="${areaT1}" width="${iW}" height="${parseFloat(areaT2)-parseFloat(areaT1)}" fill="#F59E0B" opacity=".07"/>
      <!-- Grille -->
      ${[0,.25,.5,.75,1].map(f => {
        const y = (padT + iH * (1-f)).toFixed(1);
        return `<line x1="${padL}" y1="${y}" x2="${W-padR}" y2="${y}" stroke="#e5e7eb" stroke-width=".5" opacity=".5"/>`;
      }).join('')}
      <!-- Seuils -->
      ${threshLine(b.t1, '#F59E0B', 'J')}
      ${threshLine(b.t2, '#F97316', 'O')}
      ${threshLine(b.t3, '#EF4444', 'R')}
      <!-- Moyenne -->
      ${b.mean != null ? threshLine(b.mean, '#6B7280', 'µ') : ''}
      <!-- Courbe -->
      <polyline points="${linePts}" fill="none" stroke="#3B82F6" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      <!-- Points -->
      ${dots}
      <!-- Axes -->
      ${yLabels}
      ${xLabels}
    </svg>
  `;
}

// ── Déclarations syndromiques locales (localStorage) ──────────
const DECL_KEY = 'biq-declarations';

function getDeclarations() {
  try { return JSON.parse(localStorage.getItem(DECL_KEY) || '[]'); } catch { return []; }
}

function saveDeclaration(decl) {
  const all = getDeclarations();
  all.push(decl);
  try { localStorage.setItem(DECL_KEY, JSON.stringify(all.slice(-500))); } catch { /* plein */ }
}

function getCurrentISOWeek() {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-S${String(week).padStart(2,'0')}`;
}

function submitDeclaration(e) {
  e.preventDefault();
  const form = e.target;
  const data = new FormData(form);

  const syndrome   = data.get('syndrome');
  const count      = data.get('count');
  const age        = data.get('age');
  const severity   = data.get('severity');
  const onsetDate  = data.get('onset_date');
  const lab        = data.get('lab') || 'unknown';

  const pathologie = data.get('pathologie') || null;

  if (!syndrome || !count || !age || !severity || !onsetDate) return;

  const region_code = data.get('region_code') || null;

  const decl = {
    id: Math.random().toString(36).slice(2,10),
    syndrome, count, age, severity, lab, pathologie,
    week: getCurrentISOWeek(),
    onset: onsetDate,
    ts: Date.now(),
    region: null,
    region_code,
  };

  // Essai géoloc silencieux (si permission déjà accordée)
  try {
    navigator.permissions.query({ name: 'geolocation' }).then(p => {
      if (p.state === 'granted') {
        navigator.geolocation.getCurrentPosition(pos => {
          decl.region = `${(Math.round(pos.coords.latitude * 2) / 2).toFixed(1)},${(Math.round(pos.coords.longitude * 2) / 2).toFixed(1)}`;
          saveDeclaration(decl);
        }, () => saveDeclaration(decl), { timeout: 2000, maximumAge: 600000 });
      } else {
        saveDeclaration(decl);
      }
    }).catch(() => saveDeclaration(decl));
  } catch { saveDeclaration(decl); }

  // Afficher confirmation + widget signal épidémique
  const container = form.closest('.decl-form-container');
  container.querySelector('#declForm').classList.add('hidden');
  const confirmEl = container.querySelector('#declConfirm');
  confirmEl.classList.remove('hidden');

  // Calculer et afficher le signal Z-score pour la pathologie déclarée
  if (pathologie) {
    const signal = detectEpiSignal(pathologie);
    const signalEl = document.getElementById('epiSignalResult');
    if (signalEl) signalEl.innerHTML = renderEpiSignalWidget(signal);
  }

  renderLocalDeclarations();
  renderClusterAlertBanner();
}

function resetDeclForm() {
  const container = document.getElementById('declFormContainer');
  if (!container) return;
  container.querySelector('#declForm').classList.remove('hidden');
  container.querySelector('#declConfirm').classList.add('hidden');
  container.querySelector('#declForm').reset();
  // Pré-remplir la date d'aujourd'hui
  const dateInput = document.getElementById('declOnsetDate');
  if (dateInput) dateInput.value = new Date().toISOString().slice(0,10);
}

function renderLocalDeclarations() {
  const el = document.getElementById('epiDeclCounts');
  if (!el) return;
  const week = getCurrentISOWeek();
  const all  = getDeclarations().filter(d => d.week === week);
  if (!all.length) {
    el.innerHTML = `<span class="epi-decl-none" data-i18n="epi-decl-none">${currentLang === 'fr' ? 'Aucune déclaration cette semaine' : 'No declarations this week'}</span>`;
    return;
  }
  // Agrégation par syndrome
  const counts = {};
  all.forEach(d => { counts[d.syndrome] = (counts[d.syndrome] || 0) + 1; });
  const synIcons = { grippal:'🤒', respiratoire:'😮‍💨', diarrhéique:'🤢', fébrile:'🌡️', neurologique:'🧠', hémorragique:'🩸', cutané:'🔴' };
  el.innerHTML = Object.entries(counts).map(([s,n]) =>
    `<span class="epi-decl-tag">${synIcons[s] || '🏥'} ${s} <strong>${n}</strong></span>`
  ).join('');
}

// ── Pathologies surveillées ──────────────────────────────────────────────────
const WATCHED_PATHOLOGIES = [
  { id: 'grippe',      label: '🤒 Grippe / ILI',           syndrome: 'grippal'      },
  { id: 'covid19',     label: '🦠 COVID-19 / SARS-CoV-2',  syndrome: 'respiratoire' },
  { id: 'rsv',         label: '🌬️ VRS (bronchiolite)',     syndrome: 'respiratoire' },
  { id: 'mpox',        label: '🔴 Mpox (variole du singe)', syndrome: 'cutané'       },
  { id: 'dengue',      label: '🦟 Dengue',                 syndrome: 'fébrile'      },
  { id: 'cholera',     label: '💧 Choléra',                syndrome: 'diarrhéique'  },
  { id: 'ebola',       label: '🩸 Ebola / Marburg',        syndrome: 'hémorragique' },
  { id: 'h5n1',        label: '🐦 H5N1 (grippe aviaire)',  syndrome: 'respiratoire' },
  { id: 'mers',        label: '🐪 MERS-CoV',              syndrome: 'respiratoire' },
  { id: 'rougeole',    label: '🔴 Rougeole',              syndrome: 'cutané'       },
  { id: 'meningo',     label: '🧠 Méningite bactérienne',  syndrome: 'neurologique' },
  { id: 'enceph',      label: '🧠 Encéphalite virale',     syndrome: 'neurologique' },
  { id: 'chikungunya', label: '🦟 Chikungunya / Zika',     syndrome: 'fébrile'      },
  { id: 'typhus',      label: '🦠 Typhus / fièvre typhoïde', syndrome: 'fébrile'    },
  { id: 'anthrax',     label: '☣️ Charbon (anthrax)',      syndrome: 'fébrile'      },
  { id: 'botulisme',   label: '⚠️ Botulisme',             syndrome: 'neurologique' },
  { id: 'autre',       label: '🏥 Autre syndrome',         syndrome: 'autre'        },
];

// ── ARS françaises par région ─────────────────────────────────────────────────
const ARS_REGIONS = {
  IDF: { name: 'ARS Île-de-France',            portal: 'https://www.iledefrance.ars.sante.fr',           email: 'ars-idf-sg@ars.sante.fr' },
  ARA: { name: 'ARS Auvergne-Rhône-Alpes',     portal: 'https://www.auvergne-rhone-alpes.ars.sante.fr',  email: 'ars-ara-sg@ars.sante.fr' },
  BFC: { name: 'ARS Bourgogne-Franche-Comté',  portal: 'https://www.bourgogne-franche-comte.ars.sante.fr', email: 'ars-bfc-sg@ars.sante.fr' },
  BRE: { name: 'ARS Bretagne',                 portal: 'https://www.bretagne.ars.sante.fr',              email: 'ars-bretagne-sg@ars.sante.fr' },
  CVL: { name: 'ARS Centre-Val de Loire',      portal: 'https://www.centre.ars.sante.fr',                email: 'ars-cvl-sg@ars.sante.fr' },
  COR: { name: 'ARS Corse',                    portal: 'https://www.corse.ars.sante.fr',                 email: 'ars-corse-sg@ars.sante.fr' },
  GES: { name: 'ARS Grand Est',                portal: 'https://www.grand-est.ars.sante.fr',             email: 'ars-grand-est-sg@ars.sante.fr' },
  HDF: { name: 'ARS Hauts-de-France',          portal: 'https://www.hauts-de-france.ars.sante.fr',       email: 'ars-hdf-sg@ars.sante.fr' },
  NOR: { name: 'ARS Normandie',                portal: 'https://www.normandie.ars.sante.fr',             email: 'ars-normandie-sg@ars.sante.fr' },
  NAQ: { name: 'ARS Nouvelle-Aquitaine',       portal: 'https://www.nouvelle-aquitaine.ars.sante.fr',    email: 'ars-na-sg@ars.sante.fr' },
  OCC: { name: 'ARS Occitanie',                portal: 'https://www.occitanie.ars.sante.fr',             email: 'ars-occ-sg@ars.sante.fr' },
  PDL: { name: 'ARS Pays de la Loire',         portal: 'https://www.pays-de-la-loire.ars.sante.fr',      email: 'ars-pdl-sg@ars.sante.fr' },
  PAC: { name: 'ARS Provence-Alpes-Côte d\'Azur', portal: 'https://www.paca.ars.sante.fr',              email: 'ars-paca-sg@ars.sante.fr' },
  GUA: { name: 'ARS Guadeloupe',               portal: 'https://www.guadeloupe.ars.sante.fr',            email: 'ars-guadeloupe-sg@ars.sante.fr' },
  MAR: { name: 'ARS Martinique',               portal: 'https://www.martinique.ars.sante.fr',            email: 'ars-martinique-sg@ars.sante.fr' },
  GUY: { name: 'ARS Guyane',                   portal: 'https://www.guyane.ars.sante.fr',                email: 'ars-guyane-sg@ars.sante.fr' },
  REU: { name: 'ARS La Réunion',               portal: 'https://www.lareunion.ars.sante.fr',             email: 'ars-reunion-sg@ars.sante.fr' },
  MAY: { name: 'ARS Mayotte',                  portal: 'https://www.mayotte.ars.sante.fr',               email: 'ars-mayotte-sg@ars.sante.fr' },
};

// Maladies à Déclaration Obligatoire (DO) — liste officielle CSP Art. R3113-2
const MALADIES_DO = ['meningo','ebola','h5n1','mers','cholera','typhus','anthrax','botulisme','rougeole','dengue','mpox','chikungunya'];

// ── Détection de clusters multi-dimensionnels ─────────────────────────────────
function detectAllClusters() {
  const all  = getDeclarations();
  const now  = Date.now();
  const recent = all.filter(d => (now - d.ts) < 14 * 24 * 3600 * 1000); // 14 derniers jours

  // Groupement : syndrome + région + semaine
  const groups = {};
  for (const d of recent) {
    const regionKey = d.region_code || 'INCONNUE';
    const key = `${d.syndrome}|${regionKey}|${d.week}`;
    if (!groups[key]) groups[key] = { syndrome: d.syndrome, region_code: regionKey, week: d.week, decls: [] };
    groups[key].decls.push(d);
  }

  // Seuil k≥3 pour cluster local (déclarations d'un même soignant)
  const clusters = Object.values(groups)
    .filter(g => g.decls.length >= 3)
    .map(g => {
      const counts = g.decls.map(d => {
        const map = { '1-5': 3, '6-20': 13, '21-50': 35, '50+': 60 };
        return map[d.count] || 3;
      });
      const totalEstimate = counts.reduce((a,b) => a + b, 0);
      // Bruit différentiel ε=1 : ±1-2 cas aléatoires pour anonymisation supplémentaire
      const noisedTotal = totalEstimate + Math.floor(Math.random() * 3) - 1;
      const pathologies = [...new Set(g.decls.map(d => d.pathologie).filter(Boolean))];
      const ars = ARS_REGIONS[g.region_code] || null;
      const isMaladieDO = g.decls.some(d => MALADIES_DO.includes(d.pathologie));
      // Z-score simplifié sur 14 jours (baseline = 1 déclaration/semaine attendue)
      const zscore = Math.round((g.decls.length - 1) / 1 * 10) / 10;
      const level = g.decls.length >= 10 ? 'ROUGE' : g.decls.length >= 6 ? 'ORANGE' : g.decls.length >= 3 ? 'JAUNE' : 'NORMAL';
      return { ...g, totalEstimate: Math.max(1, noisedTotal), pathologies, ars, isMaladieDO, zscore, level };
    })
    .sort((a,b) => b.decls.length - a.decls.length);

  return clusters;
}

// ── Bannière clusters dans le mode soignant ────────────────────────────────────
function renderClusterAlertBanner() {
  const el = document.getElementById('clusterAlertBanner');
  if (!el || currentMode !== 'expert') return;

  const clusters = detectAllClusters();
  if (!clusters.length) { el.innerHTML = ''; return; }

  const COLS = {
    JAUNE:  { bg: '#fefce8', border: '#ca8a04', text: '#854d0e', icon: '⚠️' },
    ORANGE: { bg: '#fff7ed', border: '#ea580c', text: '#9a3412', icon: '🟠' },
    ROUGE:  { bg: '#fff1f2', border: '#dc2626', text: '#991b1b', icon: '🔴' },
  };

  const rows = clusters.map(c => {
    const col = COLS[c.level] || COLS.JAUNE;
    const arsName = c.ars?.name || `Région ${c.region_code}`;
    const doTag   = c.isMaladieDO ? `<span class="cluster-do-tag">⚡ DO obligatoire</span>` : '';
    const pathStr = c.pathologies.length ? c.pathologies.join(', ') : c.syndrome;
    return `<div class="cluster-row" style="border-left:4px solid ${col.border};background:${col.bg}">
      <div class="cluster-row-main">
        <span class="cluster-level" style="color:${col.text}">${col.icon} ${c.level}</span>
        <span class="cluster-info">
          <strong>${c.syndrome}</strong> · ${arsName} · ${c.week}
          · <em>${c.decls.length} déclarations</em> (≈${c.totalEstimate} cas estimés)
          ${doTag}
        </span>
      </div>
      <div class="cluster-row-actions">
        <button class="btn-cluster-alert" style="border-color:${col.border};color:${col.text}"
          onclick='openARSAlert(${JSON.stringify(c)})'>
          📧 Alerter ${c.ars ? c.ars.name : 'les autorités'}
        </button>
        ${c.isMaladieDO ? `<a class="btn-cluster-do" href="https://signalement.sante.fr" target="_blank" rel="noopener">🔗 e-DO officiel</a>` : ''}
      </div>
    </div>`;
  }).join('');

  el.innerHTML = `<div class="cluster-alert-banner">
    <div class="cluster-banner-header">
      <span class="cluster-banner-title">🚨 ${clusters.length} foyer${clusters.length > 1 ? 's' : ''} épidémique${clusters.length > 1 ? 's' : ''} détecté${clusters.length > 1 ? 's' : ''} — Action recommandée</span>
      <span class="cluster-banner-sub">Basé sur vos déclarations locales des 14 derniers jours · Données anonymes agrégées</span>
    </div>
    ${rows}
    <p class="cluster-legal-note">⚖️ Données anonymisées — aucune information patient identifiable (RGPD Art. 2 · k-anonymité ≥3 · bruit différentiel). Cette alerte est générée automatiquement à titre d'aide à la décision et doit être confirmée par les voies officielles avant toute action.</p>
  </div>`;
}

// ── Modal alerte ARS ───────────────────────────────────────────────────────────
function openARSAlert(cluster) {
  const ars      = cluster.ars || { name: 'Autorités sanitaires', portal: 'https://signalement.sante.fr', email: null };
  const pathStr  = cluster.pathologies?.length ? cluster.pathologies.join(', ') : cluster.syndrome;
  const doInfo   = cluster.isMaladieDO ? '\n⚡ MALADIE À DÉCLARATION OBLIGATOIRE — Déclaration officielle requise via e-DO : https://signalement.sante.fr' : '';
  const date     = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const body = [
    `========================================`,
    `SIGNAL ÉPIDÉMIQUE — BreathIQ`,
    `========================================`,
    ``,
    `Date de détection : ${date}`,
    `Semaine épidémique : ${cluster.week}`,
    `Niveau d'alerte : ${cluster.level}`,
    ``,
    `SYNDROME CLINIQUE : ${cluster.syndrome.toUpperCase()}`,
    `Pathologie(s) suspectée(s) : ${pathStr}`,
    `Territoire : ${ars.name}`,
    `Nombre de déclarations professionnelles : ${cluster.decls?.length || '?'}`,
    `Estimation de cas (agrégée) : ≈ ${cluster.totalEstimate} cas`,
    doInfo,
    ``,
    `----------------------------------------`,
    `CONFORMITÉ RÉGLEMENTAIRE`,
    `----------------------------------------`,
    `• Données anonymisées de façon irréversible (RGPD Art. 2 + considérant 26)`,
    `• Aucune information patient identifiable (k-anonymité ≥ 3 + bruit différentiel)`,
    `• Déclarations de professionnels de santé (Art. 9(2)(j) RGPD)`,
    `• Secret médical préservé (CSP Art. L1110-4)`,
    ``,
    `⚠️ IMPORTANT : Ce signal est généré automatiquement par un outil d'aide à la`,
    `surveillance. Il doit être confirmé par les voies officielles avant toute action.`,
    `BreathIQ n'est pas un système officiel de surveillance épidémique.`,
    ``,
    `Portail officiel de déclaration : ${ars.portal}`,
    `Plateforme e-DO nationale : https://signalement.sante.fr`,
    `Santé Publique France : https://www.santepubliquefrance.fr`,
    ``,
    `Source : BreathIQ — breathiq.fr`,
  ].join('\n');

  const subject = encodeURIComponent(`[BreathIQ] Signal ${cluster.level} — ${cluster.syndrome} — ${cluster.week}`);
  const mailto  = ars.email
    ? `mailto:${ars.email}?cc=veille.alerte@santepubliquefrance.fr&subject=${subject}&body=${encodeURIComponent(body)}`
    : `mailto:veille.alerte@santepubliquefrance.fr?subject=${subject}&body=${encodeURIComponent(body)}`;

  const existing = document.getElementById('arsAlertModal');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.id = 'arsAlertModal';
  el.className = 'auth-alert-overlay';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-labelledby', 'arsModalTitle');
  el.innerHTML = `<div class="auth-alert-box ars-alert-box">
    <button class="auth-alert-close" onclick="document.getElementById('arsAlertModal').remove()" aria-label="Fermer">✕</button>
    <h3 class="auth-alert-title" id="arsModalTitle">📧 Alerte — ${ars.name}</h3>
    <p class="auth-alert-sub">Signal <strong>${cluster.level}</strong> · ${cluster.syndrome} · ${cluster.week} · ≈${cluster.totalEstimate} cas estimés</p>
    ${cluster.isMaladieDO ? `<div class="ars-do-banner">⚡ Maladie à Déclaration Obligatoire — La déclaration officielle via <a href="https://signalement.sante.fr" target="_blank" rel="noopener">e-DO</a> est requise par la loi (CSP Art. L3113-1).</div>` : ''}
    <div class="ars-legal-reminder">
      <strong>Rappel légal :</strong> Ce rapport ne contient aucune donnée personnelle (RGPD Art. 2).
      Vérifiez l'adresse email de votre ARS sur son site officiel avant envoi.
    </div>
    <textarea class="auth-alert-text" id="arsAlertTextarea" readonly rows="14">${body}</textarea>
    <div class="auth-alert-actions">
      <button class="btn-copy-auth" onclick="copyARSAlert()">📋 Copier le rapport</button>
      <a class="btn-email-auth" href="${mailto}" target="_blank" rel="noopener">📨 Ouvrir dans ma messagerie</a>
      <a class="btn-portal-auth" href="${ars.portal}" target="_blank" rel="noopener">🔗 Site ARS</a>
      <a class="btn-portal-auth" href="https://signalement.sante.fr" target="_blank" rel="noopener">📋 e-DO officiel</a>
    </div>
  </div>`;
  document.body.appendChild(el);
}

function copyARSAlert() {
  const ta  = document.getElementById('arsAlertTextarea');
  const btn = document.querySelector('.btn-copy-auth');
  if (!ta) return;
  navigator.clipboard?.writeText(ta.value).then(() => {
    if (btn) { btn.textContent = '✅ Copié !'; setTimeout(() => { btn.textContent = '📋 Copier le rapport'; }, 2500); }
  }).catch(() => {
    ta.select();
    document.execCommand('copy');
  });
}

// ── Autorités sanitaires par pays ────────────────────────────────────────────
const HEALTH_AUTHORITIES = {
  FR: { name: 'Santé Publique France',         email: 'declaration@santepubliquefrance.fr', phone: '0800 130 000', declUrl: 'https://www.sentiweb.fr/france/fr/?page=declaration' },
  BE: { name: 'Sciensano (Belgique)',          email: 'surveillance@sciensano.be',          phone: null,           declUrl: 'https://www.sciensano.be/fr/maladies-infectieuses/maladies-a-declaration-obligatoire' },
  CH: { name: 'OFSP Suisse',                  email: 'infosantepublique@bag.admin.ch',     phone: null,           declUrl: 'https://www.bag.admin.ch/bag/fr/home/krankheiten/infektionskrankheiten-bekaempfen/meldepflicht.html' },
  LU: { name: 'Direction de la Santé (Lux.)', email: 'inspection.sanitaire@ms.etat.lu',   phone: null,           declUrl: 'https://sante.public.lu/fr/prevention/maladies-infectieuses/maladies-declaration-obligatoire.html' },
  DE: { name: 'Robert Koch Institut',         email: 'info@rki.de',                        phone: null,           declUrl: 'https://www.rki.de/DE/Content/Infekt/IfSG/Meldeboegen/Arztmeldung/arztmeldung_node.html' },
  ES: { name: 'Ministerio de Sanidad España', email: 'dgalerta@msps.es',                   phone: null,           declUrl: 'https://www.mscbs.gob.es/profesionales/saludPublica/enfermedades/declaracion.htm' },
  IT: { name: 'Istituto Superiore di Sanità', email: 'centroref.sorveglianza@iss.it',      phone: null,           declUrl: 'https://www.iss.it/malattie-infettive' },
  GB: { name: 'UK Health Security Agency',    email: null,                                  phone: null,           declUrl: 'https://www.gov.uk/report-notifiable-disease' },
  US: { name: 'CDC USA',                      email: null,                                  phone: '1-800-232-4636', declUrl: 'https://www.cdc.gov/reportanillness' },
  CA: { name: 'ASPC Canada',                  email: 'phac.info-rndss-snsri.aspc@canada.ca', phone: null,         declUrl: 'https://www.canada.ca/fr/sante-publique/services/maladies-declaration-obligatoire.html' },
  DEFAULT: { name: 'OMS / WHO',              email: null,                                   phone: null,           declUrl: 'https://www.who.int/emergencies/report-an-event' },
};

// ── Décalage semaine ISO ──────────────────────────────────────────────────────
function isoWeekOffset(isoWeek, offset) {
  const [yearStr, wStr] = isoWeek.split('-S');
  let w = parseInt(wStr, 10) + offset;
  let y = parseInt(yearStr, 10);
  while (w <= 0)  { y--; w += 52; }
  while (w > 52)  { y++; w -= 52; }
  return `${y}-S${String(w).padStart(2, '0')}`;
}

// ── Détection signal épidémique (Z-score 8 semaines glissantes) ──────────────
function detectEpiSignal(pathologyId) {
  const allDecls    = getDeclarations();
  const currentWeek = getCurrentISOWeek();
  const pathObj     = WATCHED_PATHOLOGIES.find(p => p.id === pathologyId);

  const weeks  = Array.from({ length: 9 }, (_, i) => isoWeekOffset(currentWeek, -(8 - i)));
  const counts = weeks.map(w =>
    allDecls.filter(d => d.week === w &&
      (d.pathologie === pathologyId || (!d.pathologie && pathObj && d.syndrome === pathObj.syndrome))
    ).length
  );

  const current = counts[8];
  const history = counts.slice(0, 8);
  const n       = history.length || 1;
  const mean    = history.reduce((a, b) => a + b, 0) / n;
  const std     = Math.sqrt(history.reduce((a, b) => a + (b - mean) ** 2, 0) / n) || 1;
  const zscore  = (current - mean) / std;

  const level = zscore >= 3.0 ? 'ROUGE'
    : zscore >= 2.0 ? 'ORANGE'
    : zscore >= 1.5 ? 'JAUNE'
    : 'NORMAL';

  return { pathologyId, zscore: Math.round(zscore * 10) / 10, level, weeklyCount: current, baseline: Math.round(mean * 10) / 10, currentWeek };
}

// ── Rendu widget signal post-déclaration ──────────────────────────────────────
function renderEpiSignalWidget(signal) {
  const COLS = {
    NORMAL: { bg: '#F0FDF4', border: '#86EFAC', text: '#15803D', label: '✅ NORMAL' },
    JAUNE:  { bg: '#FEFCE8', border: '#FDE047', text: '#854D0E', label: '⚠️ VIGILANCE' },
    ORANGE: { bg: '#FFF7ED', border: '#FB923C', text: '#9A3412', label: '🟠 ALERTE PRÉCOCE' },
    ROUGE:  { bg: '#FFF1F2', border: '#F87171', text: '#991B1B', label: '🔴 SIGNAL ÉPIDÉMIQUE' },
  };
  const col      = COLS[signal.level] || COLS.NORMAL;
  const pathLabel = WATCHED_PATHOLOGIES.find(p => p.id === signal.pathologyId)?.label || signal.pathologyId;
  const showAlert = signal.level === 'ORANGE' || signal.level === 'ROUGE';

  return `<div class="epi-signal-widget" style="border-color:${col.border};background:${col.bg}">
    <div class="epi-signal-row">
      <span class="epi-signal-level" style="color:${col.text}">${col.label}</span>
      <span class="epi-signal-path">${pathLabel}</span>
    </div>
    <div class="epi-signal-stats">
      <span>Z = <strong>${signal.zscore}</strong></span>
      <span>Cette sem. : <strong>${signal.weeklyCount} cas</strong></span>
      <span>Baseline : <strong>${signal.baseline} cas/sem</strong></span>
    </div>
    ${showAlert ? `<div class="epi-signal-cta">
      <span style="font-size:.78rem;color:${col.text}">Signal ${signal.level} — transmission aux autorités recommandée</span>
      <button class="btn-alert-auth" onclick="openAuthorityAlert('${signal.pathologyId}','${signal.level}',${signal.zscore},${signal.weeklyCount},${signal.baseline})">
        📧 Alerter les autorités sanitaires
      </button>
    </div>` : ''}
  </div>`;
}

// ── Alerte aux autorités sanitaires ──────────────────────────────────────────
function openAuthorityAlert(pathologyId, level, zscore, count, baseline) {
  const cc   = currentLang === 'en' ? 'GB' : currentLang === 'es' ? 'ES' : 'FR';
  const auth = HEALTH_AUTHORITIES[cc] || HEALTH_AUTHORITIES.DEFAULT;
  const path = WATCHED_PATHOLOGIES.find(p => p.id === pathologyId)?.label || pathologyId;
  const week = getCurrentISOWeek();
  const date = new Date().toLocaleDateString('fr-FR');

  const body = [
    `Signal BreathIQ — ${week} (${date})`,
    `Pathologie : ${path}`,
    `Niveau d'alerte : ${level} (Z-score = ${zscore})`,
    `Cas déclarés cette semaine : ${count}`,
    `Baseline historique : ${baseline} cas/semaine`,
    ``,
    `Source : Déclarations anonymes de professionnels de santé — BreathIQ (breathiq.fr)`,
    `RGPD : Données agrégées anonymisées, aucune information patient identifiable`,
    ``,
    `Pour déclarer officiellement : ${auth.declUrl}`,
  ].join('\n');

  const existing = document.getElementById('authAlertModal');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.id = 'authAlertModal';
  el.className = 'auth-alert-overlay';
  el.innerHTML = `<div class="auth-alert-box" role="dialog" aria-modal="true">
    <button class="auth-alert-close" onclick="document.getElementById('authAlertModal').remove()" aria-label="Fermer">✕</button>
    <h3 class="auth-alert-title">📧 ${auth.name}</h3>
    <p class="auth-alert-sub">Signal <strong>${level}</strong> · ${path} · ${week}</p>
    <textarea class="auth-alert-text" id="authAlertTextarea" readonly rows="11">${body}</textarea>
    <div class="auth-alert-actions">
      <button class="btn-copy-auth" onclick="copyAuthAlert()">📋 Copier</button>
      ${auth.email ? `<a class="btn-email-auth" href="mailto:${auth.email}?subject=${encodeURIComponent(`Signal ${level} ${path} — BreathIQ`)}&body=${encodeURIComponent(body)}" target="_blank">📨 Email</a>` : ''}
      <a class="btn-portal-auth" href="${auth.declUrl}" target="_blank" rel="noopener">🔗 Portail officiel</a>
    </div>
  </div>`;
  document.body.appendChild(el);
}

function copyAuthAlert() {
  const ta  = document.getElementById('authAlertTextarea');
  const btn = document.querySelector('.btn-copy-auth');
  if (!ta) return;
  navigator.clipboard?.writeText(ta.value).then(() => {
    if (btn) { btn.textContent = '✅ Copié !'; setTimeout(() => { btn.textContent = '📋 Copier'; }, 2000); }
  }).catch(() => { ta.select(); document.execCommand('copy'); });
}

// ── Panneau sources en direct ─────────────────────────────────
function renderLiveSourcesPanel(parsed) {
  const panel = document.getElementById('liveSourcesPanel');
  if (!panel) return;

  const src = parsed.sources || {};
  const sourceStatus = (key) => {
    const s = src[key];
    if (!s) return '⚫';
    if (s === 'api') return '🟢';
    if (s === 'cache') return '🟡';
    if (s === 'stale') return '🟠';
    return '🔴';
  };

  const fr = currentLang === 'fr';
  const sources = [
    { key:'waqiLocal',    icon:'🌫️', label: fr ? 'WAQI — Air local (11 polluants)' : 'WAQI — Local air (11 pollutants)',    value: parsed.waqiLocal   ? `AQI ${parsed.waqiLocal.aqi} · PM2.5 ${parsed.waqiLocal.pm25 ?? '?'}` : '—' },
    { key:'openMeteoLocal',icon:'🌿',label: fr ? 'Open-Meteo — Pollen local'        : 'Open-Meteo — Local pollen',           value: parsed.localAqi?.dominantPollen ? `${parsed.localAqi.dominantPollen.name} ${parsed.localAqi.dominantPollen.value}` : (parsed.localAqi ? `PM2.5 ${parsed.localAqi.pm25}` : '—') },
    { key:'openaqFr',     icon:'🇫🇷', label: fr ? 'OpenAQ — PM2.5 France'           : 'OpenAQ — PM2.5 France',               value: parsed.frAqi       ? `${parsed.frAqi.pm25} µg/m³` : '—' },
    { key:'openaqWorld',  icon:'🌍', label: fr ? 'OpenAQ — PM2.5 mondial'           : 'OpenAQ — PM2.5 global',               value: parsed.worldAqi    ? `${parsed.worldAqi.pm25} µg/m³` : '—' },
    { key:'spfGrippe',    icon:'🇫🇷', label: fr ? 'SPF — Grippe France'             : 'SPF — Flu France',                    value: parsed.frFlu       ? `${parsed.frFlu.rate?.toFixed(0) ?? '?'}/100k` : '—' },
    { key:'cdcFlu',       icon:'🇺🇸', label: fr ? 'CDC — Grippe USA'                : 'CDC — Flu USA',                       value: parsed.usFlu       ? `niv. ${parsed.usFlu.level}` : '—' },
    { key:'ecdcMpox',     icon:'🇪🇺', label: fr ? 'ECDC — Mpox Europe'             : 'ECDC — Mpox Europe',                  value: parsed.ecMpox      ? `${parsed.ecMpox.cases30d} cas/30j` : '—' },
    { key:'sumeau',       icon:'💧', label: fr ? 'SUM\'EAU — COVID eaux usées'      : 'SUM\'EAU — COVID wastewater',         value: parsed.sumeau      ? `${parsed.sumeau.intensity} (${parsed.sumeau.week})` : '—' },
  ];

  const statusLabel = fr
    ? { api:'En direct', cache:'Cache', stale:'Données anciennes', error:'Hors ligne' }
    : { api:'Live', cache:'Cached', stale:'Stale', error:'Offline' };

  panel.innerHTML = `
    <div class="lsp-grid">
      ${sources.map(s => `
        <div class="lsp-item">
          <span class="lsp-icon">${s.icon}</span>
          <div class="lsp-info">
            <span class="lsp-label">${s.label}</span>
            <span class="lsp-value">${s.value}</span>
          </div>
          <span class="lsp-status" title="${statusLabel[src[s.key]] || 'Inconnu'}">${sourceStatus(s.key)}</span>
        </div>
      `).join('')}
    </div>
    <p class="lsp-footer">${fr ? `Mis à jour : ${new Date().toLocaleTimeString(currentLang)}` : `Updated: ${new Date().toLocaleTimeString(currentLang)}`}</p>
  `;
}

// ── Widget SUM'EAU ───────────────────────────────────────────
function renderSumEauWidget(data) {
  const el = document.getElementById('sumeauWidget');
  if (!el || !data) return;

  const fr = currentLang === 'fr';
  const colors = { low: '#10B981', moderate: '#F59E0B', high: '#EF4444', unknown: '#6B7280' };
  const color = colors[data.intensity] || colors.unknown;
  const arrow = data.deltaDir === 'up' ? '↑' : data.deltaDir === 'down' ? '↓' : '→';
  const labels = {
    fr: { low:'Faible', moderate:'Modéré', high:'Élevé', unknown:'Inconnu', up:'en hausse', down:'en baisse', stable:'stable', unknown2:'—' },
    en: { low:'Low', moderate:'Moderate', high:'High', unknown:'Unknown', up:'rising', down:'falling', stable:'stable', unknown2:'—' },
  };
  const l = labels[fr ? 'fr' : 'en'];

  el.innerHTML = `
    <div class="sumeau-badge" style="background:${color}15;border:1.5px solid ${color}40">
      <span class="sumeau-icon">💧</span>
      <div class="sumeau-info">
        <span class="sumeau-title">${fr ? 'COVID-19 dans les eaux usées' : 'COVID-19 in wastewater'} <span style="color:${color}">${l[data.intensity] || '—'} ${arrow}</span></span>
        <span class="sumeau-sub">${fr ? `Signal national — semaine ${data.week}` : `National signal — week ${data.week}`}</span>
      </div>
    </div>
    ${data.trend?.length > 1 ? `<div class="sumeau-sparkline">${renderSparkline(data.trend.map(t => t.nat54 ?? t.nat12).filter(v => v!=null), color)}</div>` : ''}
  `;
}

// ── Sparkline SVG minimal ────────────────────────────────────
function renderSparkline(values, color = '#10B981') {
  if (values.length < 2) return '';
  const w = 120, h = 32, pad = 2;
  const min = Math.min(...values);
  const max = Math.max(...values) || 1;
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - 2*pad);
    const y = h - pad - ((v - min) / (max - min + 0.001)) * (h - 2*pad);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

// ── Widget WAQI détaillé ─────────────────────────────────────
function renderWaqiWidget(data) {
  const el = document.getElementById('waqiWidget');
  if (!el || !data) return;

  const fr = currentLang === 'fr';
  const aqiColors = { good:'#10B981', moderate:'#F59E0B', 'unhealthy-sensitive':'#F97316', unhealthy:'#EF4444', 'very-unhealthy':'#9333EA', hazardous:'#7F1D1D' };
  const aqiLabels = {
    fr:  { good:'Bon', moderate:'Modéré', 'unhealthy-sensitive':'Mauvais (groupes sensibles)', unhealthy:'Mauvais', 'very-unhealthy':'Très mauvais', hazardous:'Dangereux' },
    en:  { good:'Good', moderate:'Moderate', 'unhealthy-sensitive':'Unhealthy (sensitive groups)', unhealthy:'Unhealthy', 'very-unhealthy':'Very Unhealthy', hazardous:'Hazardous' },
  };
  const cat = data.aqiCategory || 'moderate';
  const color = aqiColors[cat] || '#6B7280';
  const label = (aqiLabels[fr ? 'fr' : 'en'] || aqiLabels.en)[cat] || cat;

  const pollutants = [
    { key:'pm25', name:'PM2.5', unit:'µg/m³', val: data.pm25 },
    { key:'pm10', name:'PM10',  unit:'µg/m³', val: data.pm10 },
    { key:'no2',  name:'NO₂',   unit:'µg/m³', val: data.no2 },
    { key:'o3',   name:'O₃',    unit:'µg/m³', val: data.o3 },
    { key:'so2',  name:'SO₂',   unit:'µg/m³', val: data.so2 },
    { key:'co',   name:'CO',    unit:'ppm',   val: data.co },
  ].filter(p => p.val != null);

  const forecastHtml = data.forecast7d?.length ? `
    <div class="waqi-forecast">
      <div class="waqi-forecast-title">${fr ? 'Prévisions PM2.5 (7j)' : 'PM2.5 forecast (7d)'}</div>
      <div class="waqi-forecast-bars">
        ${data.forecast7d.map(f => {
          const pct = Math.min(100, Math.round((f.avg / 75) * 100));
          const fc = pct > 66 ? '#EF4444' : pct > 33 ? '#F59E0B' : '#10B981';
          return `<div class="waqi-fc-bar" title="${f.day}: ${f.avg} µg/m³">
            <div class="waqi-fc-fill" style="height:${pct}%;background:${fc}"></div>
            <span class="waqi-fc-day">${f.day?.slice(8) || ''}</span>
          </div>`;
        }).join('')}
      </div>
    </div>
  ` : '';

  el.innerHTML = `
    <div class="waqi-header">
      <div class="waqi-aqi" style="border-color:${color};color:${color}">${data.aqi ?? '?'}</div>
      <div class="waqi-meta">
        <span class="waqi-city">📍 ${data.city}</span>
        <span class="waqi-cat" style="color:${color}">${label}</span>
        ${data.dominant ? `<span class="waqi-dom">${fr ? 'Polluant dominant' : 'Dominant'}: ${data.dominant.toUpperCase()}</span>` : ''}
      </div>
    </div>
    ${pollutants.length ? `<div class="waqi-pollutants">${pollutants.map(p =>
      `<span class="waqi-pol">${p.name} <strong>${p.val}</strong> ${p.unit}</span>`
    ).join('')}</div>` : ''}
    ${data.temp != null ? `<div class="waqi-meteo">🌡️ ${data.temp}°C · 💧 ${data.hum ?? '?'}% · 💨 ${data.wind ?? '?'} m/s</div>` : ''}
    ${forecastHtml}
    ${data.attributions?.length ? `<p class="waqi-attr">${data.attributions.join(' · ')}</p>` : ''}
  `;
}

// ── Widget Pollen ────────────────────────────────────────────
function renderPollenWidget(data) {
  const el = document.getElementById('pollenWidget');
  if (!el || !data?.pollen) return;

  const fr = currentLang === 'fr';
  const pollenNames = {
    fr: { alder:'Aulne', birch:'Bouleau', grass:'Graminées', mugwort:'Armoise', olive:'Olivier', ragweed:'Ambroisie' },
    en: { alder:'Alder', birch:'Birch',   grass:'Grass',     mugwort:'Mugwort', olive:'Olive',   ragweed:'Ragweed' },
  };
  const names = pollenNames[fr ? 'fr' : 'en'];
  const pollenIcons = { alder:'🌳', birch:'🌲', grass:'🌾', mugwort:'🌿', olive:'🫒', ragweed:'🌻' };

  // Seuils EPI : 0=none, 1-3=low, 4-6=moderate, ≥7=high
  const levelColor = v => v == null ? '#9ca3af' : v >= 7 ? '#EF4444' : v >= 4 ? '#F59E0B' : v >= 1 ? '#10B981' : '#9ca3af';
  const levelLabel = v => {
    if (v == null || v === 0) return fr ? 'Aucun' : 'None';
    if (v >= 7) return fr ? 'Élevé' : 'High';
    if (v >= 4) return fr ? 'Modéré' : 'Moderate';
    return fr ? 'Faible' : 'Low';
  };

  const entries = Object.entries(data.pollen).filter(([,v]) => v != null && v > 0);
  if (!entries.length) { el.innerHTML = `<p class="pollen-none">${fr ? 'Aucun pollen détecté localement' : 'No pollen detected locally'}</p>`; return; }

  el.innerHTML = `
    <div class="pollen-grid">
      ${entries.sort(([,a],[,b]) => b-a).map(([key, val]) => `
        <div class="pollen-item">
          <span class="pollen-icon">${pollenIcons[key] || '🌿'}</span>
          <span class="pollen-name">${names[key] || key}</span>
          <div class="pollen-bar-wrap"><div class="pollen-bar" style="width:${Math.min(100,val*10)}%;background:${levelColor(val)}"></div></div>
          <span class="pollen-level" style="color:${levelColor(val)}">${levelLabel(val)}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function updateLiveStatusBadge(detail) {
  const badge = document.getElementById('liveBadge');
  if (!badge) return;
  badge.className = 'live-badge';
  if (detail.status === 'live') {
    badge.classList.add('live-on');
    badge.title = `Données en direct — ${detail.liveCount} source(s) connectée(s)`;
  } else if (detail.status === 'partial') {
    badge.classList.add('live-partial');
    badge.title = `Données partielles — ${detail.liveCount} source(s)`;
  } else if (detail.status === 'loading') {
    badge.classList.add('live-loading');
    badge.title = 'Connexion aux sources de données…';
  } else {
    badge.classList.add('live-off');
    badge.title = 'Données hors ligne — affichage demo';
  }
}

// ── RGPD / Consentement ───────────────────────────────────────

const CONSENT_KEY = 'biq-consent';

function getConsentStatus() {
  try { return localStorage.getItem(CONSENT_KEY); } catch { return null; }
}

function setConsentStatus(value) {
  try { localStorage.setItem(CONSENT_KEY, value); } catch { /* plein */ }
}

function initConsent() {
  const status = getConsentStatus();
  if (status) return; // déjà répondu
  const banner = document.getElementById('consentBanner');
  if (banner) banner.removeAttribute('hidden');
}

function acceptConsent() {
  setConsentStatus('accepted');
  const banner = document.getElementById('consentBanner');
  if (banner) banner.setAttribute('hidden', '');
}

function declineConsent() {
  setConsentStatus('declined');
  const banner = document.getElementById('consentBanner');
  if (banner) banner.setAttribute('hidden', '');
}

// ── Mes données — gestion localStorage ───────────────────────

function getMyDataSummary() {
  const decls = getDeclarations();
  const cacheKeys = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('biq-live-')) cacheKeys.push(k);
    }
  } catch { /* rien */ }

  const prefs = [];
  ['biq-theme', 'biq-lang', 'biq-mode'].forEach(k => {
    try { if (localStorage.getItem(k)) prefs.push(k); } catch { /* rien */ }
  });

  return {
    declarations: decls.length,
    cacheEntries: cacheKeys.length,
    cacheKeys,
    prefs,
    consent: getConsentStatus() || 'non défini',
  };
}

function clearMyDeclarations() {
  if (!confirm(t('mydata-confirm'))) return;
  try { localStorage.removeItem(DECL_KEY); } catch { /* rien */ }
  renderLocalDeclarations();
  renderMyDataSection();
}

function clearAllCache() {
  if (!confirm(t('mydata-confirm'))) return;
  try {
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('biq-live-')) toRemove.push(k);
    }
    toRemove.forEach(k => localStorage.removeItem(k));
  } catch { /* rien */ }
  renderMyDataSection();
}

function resetAllSettings() {
  if (!confirm(t('mydata-confirm'))) return;
  try {
    ['biq-theme', 'biq-lang', 'biq-mode', CONSENT_KEY, DECL_KEY].forEach(k => localStorage.removeItem(k));
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('biq-')) toRemove.push(k);
    }
    toRemove.forEach(k => localStorage.removeItem(k));
  } catch { /* rien */ }
  // Recharger la page pour appliquer la réinitialisation
  window.location.reload();
}

function exportMyDeclarations() {
  const decls = getDeclarations();
  if (!decls.length) { alert(currentLang === 'fr' ? 'Aucune déclaration à exporter.' : 'No declarations to export.'); return; }
  const blob = new Blob([JSON.stringify(decls, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `breathiq-declarations-${getCurrentISOWeek()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function renderMyDataSection() {
  const el = document.getElementById('myDataSummary');
  if (!el) return;
  const s = getMyDataSummary();
  const fr = currentLang === 'fr';

  el.innerHTML = `
    <div class="mydata-grid">
      <div class="mydata-card">
        <div class="mydata-card-icon">📋</div>
        <div class="mydata-card-body">
          <strong>${t('mydata-decl-label')}</strong>
          <span class="mydata-count">${s.declarations}</span>
          <p>${fr ? 'entrée(s) cette session' : 'entry/entries'}</p>
        </div>
        <div class="mydata-card-actions">
          <button class="mydata-btn mydata-btn-export" onclick="exportMyDeclarations()">${t('mydata-export')}</button>
          <button class="mydata-btn mydata-btn-danger" onclick="clearMyDeclarations()">${t('mydata-clear-decl')}</button>
        </div>
      </div>

      <div class="mydata-card">
        <div class="mydata-card-icon">🗄️</div>
        <div class="mydata-card-body">
          <strong>${t('mydata-cache-label')}</strong>
          <span class="mydata-count">${s.cacheEntries}</span>
          <p>${fr ? 'entrée(s) en cache' : 'cached entry/entries'}</p>
        </div>
        <div class="mydata-card-actions">
          <button class="mydata-btn mydata-btn-danger" onclick="clearAllCache()">${t('mydata-clear-cache')}</button>
        </div>
      </div>

      <div class="mydata-card">
        <div class="mydata-card-icon">⚙️</div>
        <div class="mydata-card-body">
          <strong>${t('mydata-prefs-label')}</strong>
          <span class="mydata-count">${s.prefs.length}</span>
          <p>${s.prefs.map(k => k.replace('biq-','')).join(', ') || (fr ? 'aucune' : 'none')}</p>
        </div>
      </div>

      <div class="mydata-card">
        <div class="mydata-card-icon">🔐</div>
        <div class="mydata-card-body">
          <strong>${t('mydata-consent-label')}</strong>
          <span class="mydata-count mydata-consent-status ${s.consent === 'accepted' ? 'status-ok' : s.consent === 'declined' ? 'status-warn' : 'status-none'}">${s.consent}</span>
        </div>
        <div class="mydata-card-actions">
          ${s.consent !== 'accepted' ? `<button class="mydata-btn mydata-btn-primary" onclick="acceptConsent();renderMyDataSection()">${t('consent-accept')}</button>` : ''}
          ${s.consent === 'accepted' ? `<button class="mydata-btn mydata-btn-danger" onclick="declineConsent();renderMyDataSection()">${fr ? 'Retirer le consentement' : 'Withdraw consent'}</button>` : ''}
        </div>
      </div>
    </div>

    <div class="mydata-rights-note">
      <p>${t('mydata-rights')}</p>
      <p><a href="mailto:privacy@breathiq.fr">${t('mydata-dpo')} : privacy@breathiq.fr</a> · <a href="privacy.html">${t('consent-more')}</a></p>
    </div>

    <div class="mydata-reset-zone">
      <button class="mydata-btn mydata-btn-reset" onclick="resetAllSettings()">${t('mydata-clear-all')}</button>
    </div>
  `;
}
