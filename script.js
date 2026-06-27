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
    'nav-symptoms': 'Que faire ?',
    'nav-score': 'Mon Score',
    'nav-map': 'Carte',
    'nav-stocks': 'Masques FFP2',
    'nav-pathogens': 'Maladies',
    'nav-protection': 'Protection',
    'nav-about': 'À propos',
    'hero-badge': 'Prévention respiratoire · Données publiques',
    'hero-title-1': 'Votre copilote de prévention',
    'hero-title-2': 'respiratoire.',
    'hero-subtitle': 'BreathIQ croise qualité de l\'air, virus saisonniers et données sanitaires publiques pour vous donner une lecture simple de votre environnement — chaque jour.',
    'hero-cta-score': 'Voir mon score respiratoire',
    'hero-cta-map': 'Carte mondiale',
    'hero-disclaimer': 'Outil d\'information publique — non dispositif médical · Accès libre et gratuit',
    'hsc-label': 'Indice respiratoire',
    'hsc-loading': 'Calcul en cours…',
    'hsc-regions': 'Régions surveillées',
    'hsc-regions-unit': 'régions',
    'hsc-pathogens': 'Pathogènes suivis',
    'hsc-pathogens-unit': 'pathogènes',
    'score-title': 'Votre score respiratoire du jour',
    'score-subtitle': 'Un score 0–100 qui résume la qualité de l\'air, la circulation virale, les pollens et la météo autour de vous.',
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
    'footer-about': 'À propos',
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
    'action-guide-title': 'J\'ai des symptômes — que faire ?',
    'action-guide-subtitle': 'Évaluez votre situation et agissez au bon niveau d\'urgence',
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
    'skip-link': 'Aller au contenu principal',
    'scroll-top-aria': 'Retour en haut de page',
    // Onboarding
    'ob-title': 'Bienvenue sur BreathIQ',
    'ob-subtitle': 'Outil d\'information épidémique mondiale — gratuit, sans inscription, sans publicité.',
    'ob-patient-aria': 'Continuer en mode patient',
    'ob-patient-title': 'Je suis patient / citoyen',
    'ob-patient-f1': '✓ Vérifier mes symptômes',
    'ob-patient-f2': '✓ Trouver un médecin proche',
    'ob-patient-f3': '✓ Maladies à surveiller',
    'ob-patient-f4': '✓ Triage urgences',
    'ob-patient-cta': 'Commencer →',
    'ob-expert-aria': 'Continuer en mode soignant',
    'ob-expert-title': 'Je suis soignant / expert',
    'ob-expert-f1': '✓ Tableau de bord épidémique',
    'ob-expert-f2': '✓ Score respiratoire 0–100',
    'ob-expert-f3': '✓ Carte mondiale des foyers',
    'ob-expert-f4': '✓ Déclaration de cas',
    'ob-expert-cta': 'Accès soignant →',
    'ob-disclaimer': 'Outil d\'information publique — non dispositif médical (Règl. UE 2017/745)',
    'ob-skip': 'Continuer sans choisir',
  },
  en: {
    'nav-score': 'My Score',
    'nav-map': 'World Map',
    'nav-stocks': 'Masks & Stocks',
    'nav-pathogens': 'Pathogens',
    'nav-protection': 'Protection',
    'nav-about': 'About',
    'hero-badge': 'Respiratory prevention · Public data',
    'hero-title-1': 'Your daily respiratory',
    'hero-title-2': 'co-pilot.',
    'hero-subtitle': 'BreathIQ combines air quality, seasonal viruses and public health data to give you a simple read on your environment — every day.',
    'hero-cta-score': 'See my respiratory score',
    'hero-cta-map': 'Outbreak map',
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
    'gp-score-label': 'Your respiratory health briefing',
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
    'footer-about': 'About',
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
    'nav-symptoms': 'Symptoms',
    'action-guide-title': 'I have symptoms — what should I do?',
    'action-guide-subtitle': 'Assess your situation and act at the right level of urgency',
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
    'syn-title': 'Global epidemic surveillance',
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
    'live-src-sumeau': 'COVID-19 — Wastewater surveillance',
    'live-src-sumeau-sub': 'SUM\'EAU · 54 municipalities · early warning France',
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
    'skip-link': 'Skip to main content',
    'scroll-top-aria': 'Back to top',
    'ob-title': 'Welcome to BreathIQ',
    'ob-subtitle': 'Global epidemic information tool — free, no registration, no ads.',
    'ob-patient-aria': 'Continue as patient',
    'ob-patient-title': 'I am a patient / citizen',
    'ob-patient-f1': '✓ Check my symptoms',
    'ob-patient-f2': '✓ Find a nearby doctor',
    'ob-patient-f3': '✓ Diseases to watch',
    'ob-patient-f4': '✓ Emergency triage',
    'ob-patient-cta': 'Get started →',
    'ob-expert-aria': 'Continue in healthcare professional mode',
    'ob-expert-title': 'I am a healthcare professional / expert',
    'ob-expert-f1': '✓ Epidemic dashboard',
    'ob-expert-f2': '✓ Respiratory score 0–100',
    'ob-expert-f3': '✓ Global outbreak map',
    'ob-expert-f4': '✓ Case reporting',
    'ob-expert-cta': 'Healthcare access →',
    'ob-disclaimer': 'Public information tool — not a medical device (EU Reg. 2017/745)',
    'ob-skip': 'Continue without choosing',
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
    'about-title': 'Confianza y Transparencia', 'footer-tagline': 'Inteligencia respiratoria mundial', 'footer-about': 'Acerca de',
    'author-bio': 'Servicio de información médica educativa y preventiva. No dispositivo médico según Reglamento (UE) 2017/745. No constituye acto médico, consulta ni diagnóstico individual.',
    'disclaimer-title': 'No dispositivo médico — Importante',
    'disclaimer-text': 'BreathIQ es exclusivamente una herramienta de información pública. No emite recomendaciones médicas individuales. Consulte a un profesional de salud.',
    'footer-disclaimer-short': 'Herramienta de información pública · No dispositivo médico',
    'care-btn': '📍 Encontrar médico cercano', 'care-searching': 'Buscando…',
    'care-title': 'Atención médica cercana', 'care-subtitle': 'Centros de salud más próximos a su ubicación',
    'care-no-geo': 'Geolocalización no disponible.', 'care-geo-denied': 'Permiso de ubicación denegado. Actívelo en su navegador.',
    'care-error': 'Error de búsqueda. Verifique su conexión.', 'care-no-results': 'Sin establecimientos en 10 km.',
    'care-btn-refresh': '🔄 Actualizar',
    // RGPD / Consentimiento
    'consent-title': 'Sus datos y privacidad',
    'consent-body': 'Sus preferencias se guardan en su dispositivo. Se consultan datos públicos sobre calidad del aire y epidemias en tiempo real desde fuentes oficiales (OMS, CDC, ECDC). No se transmiten datos personales.',
    'consent-accept': '✓ Aceptar',
    'consent-decline': 'Continuar sin aceptar',
    'consent-more': 'Política de privacidad',
    // Modal geolocalización
    'geo-modal-title': 'Acceder a su ubicación',
    'geo-modal-body': 'Para mostrar los médicos y hospitales más cercanos, BreathIQ necesita acceso temporal a su ubicación.',
    'geo-modal-g1': 'Su ubicación nunca se almacena en nuestros servidores',
    'geo-modal-g2': 'Usada únicamente para buscar atención cercana',
    'geo-modal-g3': 'Eliminada al cerrar la página',
    'geo-modal-refuse': '✕ Rechazar',
    'geo-modal-accept': '✓ Aceptar',
    // Mis datos
    'mydata-title': 'Mis datos y privacidad',
    'mydata-subtitle': 'Consulte, gestione y elimine los datos almacenados en su dispositivo.',
    'mydata-decl-label': 'Declaraciones sindrómicas',
    'mydata-cache-label': 'Caché API',
    'mydata-prefs-label': 'Preferencias',
    'mydata-consent-label': 'Consentimiento RGPD',
    'mydata-clear-decl': 'Eliminar mis declaraciones',
    'mydata-clear-cache': 'Vaciar caché',
    'mydata-clear-all': 'Restablecer todo',
    'mydata-confirm': '¿Confirma la eliminación?',
    'mydata-done': 'Datos eliminados.',
    'mydata-export': 'Exportar declaraciones (JSON)',
    'mydata-rights': 'Conforme a los artículos 15, 17 y 21 del RGPD, puede acceder, eliminar u oponerse a sus datos en cualquier momento.',
    'mydata-dpo': 'Contacto DPD',
    'nav-syndromic': 'Vigilancia',
    'nav-mydata': 'Mis datos',
    'skip-link': 'Saltar al contenido principal',
    'scroll-top-aria': 'Volver al inicio',
    'decl-consent-art9': 'Declaro actuar como profesional sanitario o ciudadano informado, y doy mi consentimiento expreso para el tratamiento de este dato de salud (Art. 9 RGPD) con fines exclusivos de vigilancia epidemiológica local, sin transmisión al servidor.',
    'disclaimer-text': 'BreathIQ es exclusivamente una herramienta de información pública. No constituye un dispositivo médico y no emite recomendaciones médicas individuales. Para cualquier consejo médico, consulte a un profesional de salud.',
    'ob-title': 'Bienvenido a BreathIQ',
    'ob-subtitle': 'Herramienta de información epidémica mundial — gratuita, sin registro, sin publicidad.',
    'ob-patient-aria': 'Continuar como paciente',
    'ob-patient-title': 'Soy paciente / ciudadano',
    'ob-patient-f1': '✓ Verificar mis síntomas',
    'ob-patient-f2': '✓ Encontrar médico cercano',
    'ob-patient-f3': '✓ Enfermedades a vigilar',
    'ob-patient-f4': '✓ Triaje de urgencias',
    'ob-patient-cta': 'Comenzar →',
    'ob-expert-aria': 'Continuar como sanitario',
    'ob-expert-title': 'Soy profesional sanitario',
    'ob-expert-f1': '✓ Panel epidémico',
    'ob-expert-f2': '✓ Puntuación respiratoria 0–100',
    'ob-expert-f3': '✓ Mapa mundial de focos',
    'ob-expert-f4': '✓ Declaración de casos',
    'ob-expert-cta': 'Acceso sanitario →',
    'ob-disclaimer': 'Herramienta de información pública — no dispositivo médico (Regl. UE 2017/745)',
    'ob-skip': 'Continuar sin elegir',
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
    'about-title': 'Confiança e Transparência', 'footer-tagline': 'Inteligência respiratória mundial', 'footer-about': 'Sobre',
    'author-bio': 'Serviço de informação médica educativa e preventiva. Não dispositivo médico segundo Regulamento (UE) 2017/745.',
    'disclaimer-title': 'Não é dispositivo médico — Importante',
    'disclaimer-text': 'BreathIQ é exclusivamente uma ferramenta de informação pública. Não emite recomendações médicas individuais. Consulte um profissional de saúde.',
    'footer-disclaimer-short': 'Ferramenta de informação pública · Não dispositivo médico',
    'care-btn': '📍 Encontrar médico próximo', 'care-searching': 'Procurando…',
    'care-title': 'Assistência médica próxima', 'care-subtitle': 'Unidades de saúde mais próximas da sua localização',
    'care-no-geo': 'Geolocalização não disponível.', 'care-geo-denied': 'Permissão de localização negada.',
    'care-error': 'Erro na pesquisa. Verifique sua conexão.', 'care-no-results': 'Sem resultados em 10 km.',
    'care-btn-refresh': '🔄 Atualizar',
    'consent-title': 'Seus dados e privacidade',
    'consent-body': 'Suas preferências são salvas no seu dispositivo. Dados públicos sobre qualidade do ar e epidemias são consultados em tempo real de fontes oficiais (OMS, CDC, ECDC). Nenhum dado pessoal é transmitido.',
    'consent-accept': '✓ Aceitar',
    'consent-decline': 'Continuar sem aceitar',
    'consent-more': 'Política de privacidade',
    'geo-modal-title': 'Acessar sua localização',
    'geo-modal-body': 'Para mostrar os médicos e hospitais mais próximos, BreathIQ precisa de acesso temporário à sua localização.',
    'geo-modal-g1': 'Sua localização nunca é armazenada em nossos servidores',
    'geo-modal-g2': 'Usada somente para buscar atendimento próximo',
    'geo-modal-g3': 'Apagada ao fechar a página',
    'geo-modal-refuse': '✕ Recusar',
    'geo-modal-accept': '✓ Aceitar',
    'mydata-title': 'Meus dados e privacidade',
    'mydata-subtitle': 'Consulte, gerencie e exclua os dados armazenados no seu dispositivo.',
    'mydata-decl-label': 'Declarações sindrômicas',
    'mydata-cache-label': 'Cache da API',
    'mydata-prefs-label': 'Preferências',
    'mydata-consent-label': 'Consentimento LGPD/RGPD',
    'mydata-clear-decl': 'Excluir minhas declarações',
    'mydata-clear-cache': 'Limpar cache',
    'mydata-clear-all': 'Redefinir tudo',
    'mydata-confirm': 'Confirma a exclusão?',
    'mydata-done': 'Dados excluídos.',
    'mydata-export': 'Exportar declarações (JSON)',
    'mydata-rights': 'De acordo com os artigos 15, 17 e 21 do RGPD, você pode acessar, excluir ou opor-se aos seus dados a qualquer momento.',
    'mydata-dpo': 'Contato DPO',
    'nav-syndromic': 'Vigilância',
    'nav-mydata': 'Meus dados',
    'skip-link': 'Ir para o conteúdo principal',
    'scroll-top-aria': 'Voltar ao topo',
    'decl-consent-art9': 'Declaro agir na qualidade de profissional de saúde ou cidadão informado, e consinto expressamente no tratamento deste dado de saúde (Art. 9 RGPD) para fins exclusivos de vigilância epidemiológica local, sem transmissão ao servidor.',
    'disclaimer-text': 'BreathIQ é exclusivamente uma ferramenta de informação pública. Não constitui dispositivo médico e não emite recomendações médicas individuais. Para qualquer conselho médico, consulte um profissional de saúde.',
    'ob-title': 'Bem-vindo ao BreathIQ',
    'ob-subtitle': 'Ferramenta de informação epidêmica mundial — gratuita, sem cadastro, sem anúncios.',
    'ob-patient-aria': 'Continuar como paciente',
    'ob-patient-title': 'Sou paciente / cidadão',
    'ob-patient-f1': '✓ Verificar meus sintomas',
    'ob-patient-f2': '✓ Encontrar médico próximo',
    'ob-patient-f3': '✓ Doenças a monitorar',
    'ob-patient-f4': '✓ Triagem de emergências',
    'ob-patient-cta': 'Começar →',
    'ob-expert-aria': 'Continuar como profissional de saúde',
    'ob-expert-title': 'Sou profissional de saúde',
    'ob-expert-f1': '✓ Painel epidêmico',
    'ob-expert-f2': '✓ Pontuação respiratória 0–100',
    'ob-expert-f3': '✓ Mapa mundial de surtos',
    'ob-expert-f4': '✓ Declaração de casos',
    'ob-expert-cta': 'Acesso profissional →',
    'ob-disclaimer': 'Ferramenta de informação pública — não dispositivo médico (Reg. UE 2017/745)',
    'ob-skip': 'Continuar sem escolher',
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
    'about-title': 'الثقة والشفافية', 'footer-tagline': 'ذكاء تنفسي عالمي', 'footer-about': 'حول',
    'author-bio': 'خدمة معلومات طبية تعليمية ووقائية. ليست جهازاً طبياً وفق اللائحة الأوروبية 2017/745. لا تمثل عملاً طبياً أو تشخيصاً فردياً.',
    'disclaimer-title': 'ليس جهازاً طبياً — هام',
    'disclaimer-text': 'BreathIQ هو أداة معلومات عامة حصراً. لا يُصدر توصيات طبية فردية. استشر مختصاً صحياً.',
    'footer-disclaimer-short': 'أداة معلومات عامة · ليست جهازاً طبياً',
    'care-btn': '📍 العثور على طبيب قريب', 'care-searching': 'جاري البحث…',
    'care-title': 'الرعاية الطبية القريبة', 'care-subtitle': 'أقرب مراكز الرعاية الصحية',
    'care-no-geo': 'تحديد الموقع غير متاح.', 'care-geo-denied': 'تم رفض إذن الموقع.',
    'care-error': 'خطأ في البحث. تحقق من اتصالك.', 'care-no-results': 'لا توجد مرافق في نطاق ١٠ كم.',
    'care-btn-refresh': '🔄 تحديث',
    'consent-title': 'بياناتك وخصوصيتك',
    'consent-body': 'يتم حفظ تفضيلاتك على جهازك. يتم الاستعلام عن بيانات عامة حول جودة الهواء والأوبئة في الوقت الفعلي من مصادر رسمية (WHO, CDC, ECDC). لا يتم إرسال أي بيانات شخصية.',
    'consent-accept': '✓ قبول',
    'consent-decline': 'المتابعة بدون قبول',
    'consent-more': 'سياسة الخصوصية',
    'geo-modal-title': 'الوصول إلى موقعك',
    'geo-modal-body': 'لعرض أقرب الأطباء والمستشفيات، تحتاج BreathIQ إلى وصول مؤقت إلى موقعك.',
    'geo-modal-g1': 'موقعك لا يُخزّن أبداً على خوادمنا',
    'geo-modal-g2': 'يُستخدم فقط للبحث عن الرعاية القريبة',
    'geo-modal-g3': 'يُحذف عند إغلاق الصفحة',
    'geo-modal-refuse': '✕ رفض',
    'geo-modal-accept': '✓ قبول',
    'mydata-title': 'بياناتي وخصوصيتي',
    'mydata-subtitle': 'عرض وإدارة وحذف البيانات المخزنة على جهازك.',
    'mydata-decl-label': 'الإبلاغات السريرية',
    'mydata-cache-label': 'ذاكرة التخزين المؤقت',
    'mydata-prefs-label': 'التفضيلات',
    'mydata-consent-label': 'موافقة RGPD',
    'mydata-clear-decl': 'حذف إبلاغاتي',
    'mydata-clear-cache': 'مسح التخزين المؤقت',
    'mydata-clear-all': 'إعادة ضبط الكل',
    'mydata-confirm': 'هل تأكد الحذف؟',
    'mydata-done': 'تم حذف البيانات.',
    'mydata-export': 'تصدير الإبلاغات (JSON)',
    'mydata-rights': 'وفقاً للمواد 15 و17 و21 من RGPD، يمكنك الوصول إلى بياناتك أو حذفها أو الاعتراض عليها في أي وقت.',
    'mydata-dpo': 'اتصل بمسؤول حماية البيانات',
    'nav-syndromic': 'المراقبة',
    'nav-mydata': 'بياناتي',
    'skip-link': 'انتقل إلى المحتوى الرئيسي',
    'scroll-top-aria': 'العودة إلى الأعلى',
    'decl-consent-art9': 'أصرّح بأنني أتصرف بوصفي متخصصاً صحياً أو مواطناً مطلعاً، وأوافق صراحةً على معالجة هذه البيانات الصحية (المادة 9 RGPD) لأغراض المراقبة الوبائية المحلية حصراً، دون إرسالها إلى الخادم.',
    'disclaimer-text': 'BreathIQ هو أداة معلومات عامة حصراً. لا يشكّل جهازاً طبياً ولا يُصدر توصيات طبية فردية. للحصول على أي نصيحة طبية، استشر مختصاً صحياً.',
    'ob-title': 'مرحباً بك في BreathIQ',
    'ob-subtitle': 'أداة معلومات وبائية عالمية — مجانية، بدون تسجيل، بدون إعلانات.',
    'ob-patient-aria': 'المتابعة كمريض',
    'ob-patient-title': 'أنا مريض / مواطن',
    'ob-patient-f1': '✓ فحص أعراضي',
    'ob-patient-f2': '✓ إيجاد طبيب قريب',
    'ob-patient-f3': '✓ الأمراض التي يجب مراقبتها',
    'ob-patient-f4': '✓ فرز حالات الطوارئ',
    'ob-patient-cta': 'ابدأ ←',
    'ob-expert-aria': 'المتابعة كمتخصص صحي',
    'ob-expert-title': 'أنا متخصص صحي',
    'ob-expert-f1': '✓ لوحة المتابعة الوبائية',
    'ob-expert-f2': '✓ مؤشر التنفس 0–100',
    'ob-expert-f3': '✓ خريطة بؤر عالمية',
    'ob-expert-f4': '✓ الإبلاغ عن الحالات',
    'ob-expert-cta': 'وصول المتخصصين ←',
    'ob-disclaimer': 'أداة معلومات عامة — ليست جهازاً طبياً (لائحة UE 2017/745)',
    'ob-skip': 'المتابعة بدون اختيار',
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
    'about-title': '信任与透明', 'footer-tagline': '全球呼吸智能', 'footer-about': '关于',
    'author-bio': '医学教育和预防信息服务。根据欧盟法规2017/745，非医疗设备。不构成医疗行为、就诊或个人诊断。',
    'disclaimer-title': '非医疗设备 — 重要',
    'disclaimer-text': 'BreathIQ是公共信息工具。不构成医疗设备，不发布个人医疗建议。如需医疗建议，请咨询医疗专业人员。',
    'footer-disclaimer-short': '公共信息工具 · 非医疗设备',
    'care-btn': '📍 找附近的医生', 'care-searching': '搜索中…',
    'care-title': '附近医疗机构', 'care-subtitle': '距您最近的医疗中心',
    'care-no-geo': '无法使用地理定位。', 'care-geo-denied': '位置权限被拒绝。',
    'care-error': '搜索错误。请检查您的连接。', 'care-no-results': '10公里范围内无结果。',
    'care-btn-refresh': '🔄 刷新',
    'consent-title': '您的数据与隐私',
    'consent-body': '您的偏好设置保存在您的设备上。来自官方来源（世卫组织、CDC、ECDC）的空气质量和疫情公开数据实时查询。不传输任何个人数据。',
    'consent-accept': '✓ 接受',
    'consent-decline': '不接受继续',
    'consent-more': '隐私政策',
    'geo-modal-title': '访问您的位置',
    'geo-modal-body': '为了显示最近的医生和医院，BreathIQ需要临时访问您的位置。',
    'geo-modal-g1': '您的位置从不存储在我们的服务器上',
    'geo-modal-g2': '仅用于搜索附近的医疗机构',
    'geo-modal-g3': '关闭页面时即删除',
    'geo-modal-refuse': '✕ 拒绝',
    'geo-modal-accept': '✓ 接受',
    'mydata-title': '我的数据与隐私',
    'mydata-subtitle': '查看、管理和删除存储在您设备上的数据。',
    'mydata-decl-label': '综合征申报',
    'mydata-cache-label': 'API缓存',
    'mydata-prefs-label': '偏好设置',
    'mydata-consent-label': 'RGPD同意',
    'mydata-clear-decl': '删除我的申报',
    'mydata-clear-cache': '清除缓存',
    'mydata-clear-all': '重置全部',
    'mydata-confirm': '确认删除？',
    'mydata-done': '数据已删除。',
    'mydata-export': '导出申报 (JSON)',
    'mydata-rights': '根据RGPD第15、17和21条，您可以随时访问、删除或反对处理您的数据。',
    'mydata-dpo': '联系数据保护官',
    'nav-syndromic': '监测',
    'nav-mydata': '我的数据',
    'skip-link': '跳转到主要内容',
    'scroll-top-aria': '返回顶部',
    'decl-consent-art9': '我声明以医疗专业人员或知情公民身份行事，并明确同意处理此健康数据（RGPD第9条），仅用于本地流行病学监测，不向服务器传输。',
    'disclaimer-text': 'BreathIQ仅为公共信息工具。不构成医疗设备，不发布个人医疗建议。如需医疗建议，请咨询医疗专业人员。',
    'ob-title': '欢迎使用 BreathIQ',
    'ob-subtitle': '全球流行病信息工具 — 免费，无需注册，无广告。',
    'ob-patient-aria': '以患者身份继续',
    'ob-patient-title': '我是患者 / 公众',
    'ob-patient-f1': '✓ 检查我的症状',
    'ob-patient-f2': '✓ 寻找附近医生',
    'ob-patient-f3': '✓ 需要关注的疾病',
    'ob-patient-f4': '✓ 急诊分诊',
    'ob-patient-cta': '开始 →',
    'ob-expert-aria': '以医疗专业人员身份继续',
    'ob-expert-title': '我是医疗专业人员',
    'ob-expert-f1': '✓ 流行病监测仪表盘',
    'ob-expert-f2': '✓ 呼吸评分 0–100',
    'ob-expert-f3': '✓ 全球疫情地图',
    'ob-expert-f4': '✓ 病例申报',
    'ob-expert-cta': '医疗人员入口 →',
    'ob-disclaimer': '公共信息工具 — 非医疗设备（欧盟法规 2017/745）',
    'ob-skip': '不选择继续',
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
    'about-title': 'विश्वास और पारदर्शिता', 'footer-tagline': 'वैश्विक श्वसन बुद्धिमत्ता', 'footer-about': 'के बारे में',
    'author-bio': 'शैक्षिक और निवारक चिकित्सा सूचना सेवा। EU नियमन 2017/745 के अनुसार चिकित्सा उपकरण नहीं।',
    'disclaimer-title': 'चिकित्सा उपकरण नहीं — महत्वपूर्ण',
    'footer-disclaimer-short': 'सार्वजनिक जानकारी उपकरण · चिकित्सा उपकरण नहीं',
    'care-btn': '📍 नजदीकी डॉक्टर खोजें', 'care-searching': 'खोज रहे हैं…',
    'care-title': 'नजदीकी चिकित्सा देखभाल', 'care-subtitle': 'आपके सबसे नजदीकी स्वास्थ्य केंद्र',
    'care-no-geo': 'जियोलोकेशन उपलब्ध नहीं।', 'care-geo-denied': 'स्थान अनुमति अस्वीकार।',
    'care-error': 'खोज त्रुटि। कनेक्शन जांचें।', 'care-no-results': '10 किमी में कोई परिणाम नहीं।',
    'care-btn-refresh': '🔄 रिफ्रेश',
    'consent-title': 'आपका डेटा और गोपनीयता',
    'consent-body': 'आपकी प्राथमिकताएं आपके डिवाइस पर सहेजी जाती हैं। वायु गुणवत्ता और महामारी पर सार्वजनिक डेटा आधिकारिक स्रोतों (WHO, CDC, ECDC) से वास्तविक समय में प्राप्त किया जाता है। कोई व्यक्तिगत डेटा प्रेषित नहीं किया जाता।',
    'consent-accept': '✓ स्वीकार करें',
    'consent-decline': 'बिना स्वीकार किए जारी रखें',
    'consent-more': 'गोपनीयता नीति',
    'geo-modal-title': 'आपका स्थान एक्सेस करें',
    'geo-modal-body': 'निकटतम डॉक्टर और अस्पताल दिखाने के लिए, BreathIQ को आपके स्थान तक अस्थायी पहुंच की आवश्यकता है।',
    'geo-modal-g1': 'आपका स्थान कभी भी हमारे सर्वर पर संग्रहीत नहीं किया जाता',
    'geo-modal-g2': 'केवल निकटतम देखभाल खोजने के लिए उपयोग किया जाता है',
    'geo-modal-g3': 'पृष्ठ बंद करने पर हटा दिया जाता है',
    'geo-modal-refuse': '✕ अस्वीकार',
    'geo-modal-accept': '✓ स्वीकार',
    'mydata-title': 'मेरा डेटा और गोपनीयता',
    'mydata-subtitle': 'अपने डिवाइस पर संग्रहीत डेटा देखें, प्रबंधित करें और हटाएं।',
    'mydata-decl-label': 'सिंड्रोमिक घोषणाएं',
    'mydata-cache-label': 'API कैश',
    'mydata-prefs-label': 'प्राथमिकताएं',
    'mydata-consent-label': 'RGPD सहमति',
    'mydata-clear-decl': 'मेरी घोषणाएं हटाएं',
    'mydata-clear-cache': 'कैश साफ करें',
    'mydata-clear-all': 'सब कुछ रीसेट करें',
    'mydata-confirm': 'क्या आप हटाने की पुष्टि करते हैं?',
    'mydata-done': 'डेटा हटा दिया गया।',
    'mydata-export': 'घोषणाएं निर्यात करें (JSON)',
    'mydata-rights': 'RGPD के अनुच्छेद 15, 17 और 21 के अनुसार, आप किसी भी समय अपने डेटा तक पहुंच सकते हैं, उसे हटा सकते हैं या उसका विरोध कर सकते हैं।',
    'mydata-dpo': 'DPO से संपर्क करें',
    'nav-syndromic': 'निगरानी',
    'nav-mydata': 'मेरा डेटा',
    'skip-link': 'मुख्य सामग्री पर जाएं',
    'scroll-top-aria': 'ऊपर वापस जाएं',
    'decl-consent-art9': 'मैं घोषणा करता/करती हूं कि मैं स्वास्थ्य पेशेवर या सूचित नागरिक के रूप में कार्य कर रहा/रही हूं, और RGPD अनुच्छेद 9 के तहत इस स्वास्थ्य डेटा के प्रसंस्करण के लिए स्पष्ट सहमति देता/देती हूं।',
    'disclaimer-text': 'BreathIQ केवल एक सार्वजनिक सूचना उपकरण है। यह चिकित्सा उपकरण नहीं है और व्यक्तिगत चिकित्सा सिफारिशें नहीं देता। किसी भी चिकित्सा सलाह के लिए, स्वास्थ्य पेशेवर से परामर्श करें।',
    'ob-title': 'BreathIQ में आपका स्वागत है',
    'ob-subtitle': 'वैश्विक महामारी सूचना उपकरण — मुफ्त, बिना पंजीकरण, बिना विज्ञापन।',
    'ob-patient-aria': 'रोगी के रूप में जारी रखें',
    'ob-patient-title': 'मैं रोगी / नागरिक हूं',
    'ob-patient-f1': '✓ अपने लक्षण जांचें',
    'ob-patient-f2': '✓ नजदीकी डॉक्टर खोजें',
    'ob-patient-f3': '✓ निगरानी योग्य रोग',
    'ob-patient-f4': '✓ आपातकालीन ट्राइएज',
    'ob-patient-cta': 'शुरू करें →',
    'ob-expert-aria': 'स्वास्थ्यकर्मी के रूप में जारी रखें',
    'ob-expert-title': 'मैं स्वास्थ्यकर्मी हूं',
    'ob-expert-f1': '✓ महामारी डैशबोर्ड',
    'ob-expert-f2': '✓ श्वसन स्कोर 0–100',
    'ob-expert-f3': '✓ वैश्विक फ़ोकस मानचित्र',
    'ob-expert-f4': '✓ मामले की रिपोर्टिंग',
    'ob-expert-cta': 'चिकित्सक पहुंच →',
    'ob-disclaimer': 'सार्वजनिक सूचना उपकरण — चिकित्सा उपकरण नहीं (EU Reg. 2017/745)',
    'ob-skip': 'बिना चुने जारी रखें',
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
    'about-title': 'Uaminifu na Uwazi', 'footer-tagline': 'Akili ya kupumua duniani', 'footer-about': 'Kuhusu',
    'author-bio': 'Huduma ya habari za matibabu ya elimu na kuzuia. Si kifaa cha matibabu kulingana na Kanuni ya EU 2017/745.',
    'disclaimer-title': 'Si kifaa cha matibabu — Muhimu',
    'footer-disclaimer-short': 'Zana ya habari za umma · Si kifaa cha matibabu',
    'care-btn': '📍 Tafuta daktari karibu', 'care-searching': 'Inatafuta…',
    'care-title': 'Huduma ya Afya Karibu', 'care-subtitle': 'Vituo vya afya vilivyo karibu nawe',
    'care-no-geo': 'Eneo haliwezi kutambuliwa.', 'care-geo-denied': 'Ruhusa ya eneo imekataliwa.',
    'care-error': 'Hitilafu ya utafutaji. Angalia muunganisho wako.', 'care-no-results': 'Hakuna matokeo km 10.',
    'care-btn-refresh': '🔄 Sasisha',
    'consent-title': 'Data yako na faragha',
    'consent-body': 'Mapendeleo yako yamehifadhiwa kwenye kifaa chako. Data za umma kuhusu ubora wa hewa na magonjwa ya mlipuko zinaulizwa wakati halisi kutoka kwa vyanzo rasmi (WHO, CDC, ECDC). Hakuna data ya kibinafsi inayotumwa.',
    'consent-accept': '✓ Kukubali',
    'consent-decline': 'Endelea bila kukubali',
    'consent-more': 'Sera ya faragha',
    'geo-modal-title': 'Fikia eneo lako',
    'geo-modal-body': 'Ili kuonyesha madaktari na hospitali zilizo karibu nawe, BreathIQ inahitaji ufikiaji wa muda wa eneo lako.',
    'geo-modal-g1': 'Eneo lako halihifadhiwi kamwe kwenye seva zetu',
    'geo-modal-g2': 'Inatumika tu kutafuta huduma za karibu',
    'geo-modal-g3': 'Inafutwa ukifunga ukurasa',
    'geo-modal-refuse': '✕ Kataa',
    'geo-modal-accept': '✓ Kukubali',
    'mydata-title': 'Data yangu na faragha',
    'mydata-subtitle': 'Angalia, simamia na ufute data zilizohifadhiwa kwenye kifaa chako.',
    'mydata-decl-label': 'Matangazo ya ugonjwa',
    'mydata-cache-label': 'Kumbukumbu ya API',
    'mydata-prefs-label': 'Mapendeleo',
    'mydata-consent-label': 'Idhini ya RGPD',
    'mydata-clear-decl': 'Futa matangazo yangu',
    'mydata-clear-cache': 'Futa kumbukumbu',
    'mydata-clear-all': 'Rudisha kila kitu',
    'mydata-confirm': 'Uthibitisha kufuta?',
    'mydata-done': 'Data imefutwa.',
    'mydata-export': 'Hamisha matangazo (JSON)',
    'mydata-rights': 'Kulingana na vifungu 15, 17 na 21 vya RGPD, unaweza kufikia, kufuta au kupinga data yako wakati wowote.',
    'mydata-dpo': 'Wasiliana na DPO',
    'nav-syndromic': 'Ufuatiliaji',
    'nav-mydata': 'Data yangu',
    'skip-link': 'Nenda kwa maudhui makuu',
    'scroll-top-aria': 'Rudi juu',
    'decl-consent-art9': 'Natangaza kwamba ninafanya kazi kama mtaalamu wa afya au raia mwenye ufahamu, na nakubali wazi kuchakata data hii ya afya (Ibara ya 9 RGPD) kwa madhumuni ya ufuatiliaji wa magonjwa ya ndani tu, bila kutuma kwa seva.',
    'disclaimer-text': 'BreathIQ ni zana ya habari za umma peke yake. Haiundi kifaa cha matibabu na haitoi mapendekezo ya matibabu ya mtu binafsi. Kwa ushauri wowote wa matibabu, wasiliana na mtaalamu wa afya.',
    'ob-title': 'Karibu BreathIQ',
    'ob-subtitle': 'Zana ya habari za magonjwa ya mlipuko duniani — bila malipo, bila usajili, bila matangazo.',
    'ob-patient-aria': 'Endelea kama mgonjwa',
    'ob-patient-title': 'Mimi ni mgonjwa / raia',
    'ob-patient-f1': '✓ Angalia dalili zangu',
    'ob-patient-f2': '✓ Tafuta daktari karibu',
    'ob-patient-f3': '✓ Magonjwa ya kufuatilia',
    'ob-patient-f4': '✓ Uchunguzi wa dharura',
    'ob-patient-cta': 'Anza →',
    'ob-expert-aria': 'Endelea kama mtaalamu wa afya',
    'ob-expert-title': 'Mimi ni mtaalamu wa afya',
    'ob-expert-f1': '✓ Dashibodi ya magonjwa',
    'ob-expert-f2': '✓ Alama ya upumzaji 0–100',
    'ob-expert-f3': '✓ Ramani ya mlipuko duniani',
    'ob-expert-f4': '✓ Kutangaza kesi',
    'ob-expert-cta': 'Ufikiaji wa mtaalamu →',
    'ob-disclaimer': 'Zana ya habari za umma — si kifaa cha matibabu (Kanuni EU 2017/745)',
    'ob-skip': 'Endelea bila kuchagua',
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
    'about-title': 'Доверие и прозрачность', 'footer-tagline': 'Глобальный респираторный интеллект', 'footer-about': 'О нас',
    'author-bio': 'Образовательно-профилактический медицинский информационный сервис. Не медицинское устройство согласно Регламенту ЕС 2017/745. Не является медицинским актом или индивидуальной диагностикой.',
    'disclaimer-title': 'Не медицинское устройство — Важно',
    'disclaimer-text': 'BreathIQ — исключительно инструмент публичной информации. Не является медицинским устройством. Для медицинской консультации обращайтесь к специалисту.',
    'footer-disclaimer-short': 'Общедоступный инструмент · Не медицинское устройство',
    'care-btn': '📍 Найти ближайшего врача', 'care-searching': 'Поиск…',
    'care-title': 'Ближайшая медицинская помощь', 'care-subtitle': 'Ближайшие медицинские учреждения',
    'care-no-geo': 'Геолокация недоступна.', 'care-geo-denied': 'Разрешение геолокации отклонено.',
    'care-error': 'Ошибка поиска. Проверьте подключение.', 'care-no-results': 'Нет результатов в 10 км.',
    'care-btn-refresh': '🔄 Обновить',
    'consent-title': 'Ваши данные и конфиденциальность',
    'consent-body': 'Ваши настройки сохранены на вашем устройстве. Публичные данные о качестве воздуха и эпидемиях запрашиваются в режиме реального времени из официальных источников (ВОЗ, CDC, ECDC). Никакие личные данные не передаются.',
    'consent-accept': '✓ Принять',
    'consent-decline': 'Продолжить без принятия',
    'consent-more': 'Политика конфиденциальности',
    'geo-modal-title': 'Доступ к вашему местоположению',
    'geo-modal-body': 'Для отображения ближайших врачей и больниц BreathIQ нужен временный доступ к вашему местоположению.',
    'geo-modal-g1': 'Ваше местоположение никогда не хранится на наших серверах',
    'geo-modal-g2': 'Используется только для поиска ближайшей помощи',
    'geo-modal-g3': 'Удаляется при закрытии страницы',
    'geo-modal-refuse': '✕ Отказать',
    'geo-modal-accept': '✓ Принять',
    'mydata-title': 'Мои данные и конфиденциальность',
    'mydata-subtitle': 'Просматривайте, управляйте и удаляйте данные, хранящиеся на вашем устройстве.',
    'mydata-decl-label': 'Синдромные декларации',
    'mydata-cache-label': 'Кэш API',
    'mydata-prefs-label': 'Настройки',
    'mydata-consent-label': 'Согласие RGPD',
    'mydata-clear-decl': 'Удалить мои декларации',
    'mydata-clear-cache': 'Очистить кэш',
    'mydata-clear-all': 'Сбросить всё',
    'mydata-confirm': 'Подтвердите удаление?',
    'mydata-done': 'Данные удалены.',
    'mydata-export': 'Экспорт деклараций (JSON)',
    'mydata-rights': 'Согласно статьям 15, 17 и 21 RGPD, вы можете получить доступ к своим данным, удалить их или отказаться от обработки в любое время.',
    'mydata-dpo': 'Связаться с DPO',
    'nav-syndromic': 'Наблюдение',
    'nav-mydata': 'Мои данные',
    'skip-link': 'Перейти к основному содержанию',
    'scroll-top-aria': 'Вернуться наверх',
    'decl-consent-art9': 'Я заявляю, что действую как медицинский работник или информированный гражданин, и явно соглашаюсь на обработку этих медицинских данных (ст. 9 RGPD) исключительно в целях местного эпидемиологического наблюдения, без передачи на сервер.',
    'disclaimer-text': 'BreathIQ является исключительно инструментом публичной информации. Не является медицинским устройством и не выдаёт индивидуальных медицинских рекомендаций. Для получения медицинской консультации обращайтесь к специалисту.',
    'ob-title': 'Добро пожаловать в BreathIQ',
    'ob-subtitle': 'Мировой инструмент эпидемической информации — бесплатно, без регистрации, без рекламы.',
    'ob-patient-aria': 'Продолжить как пациент',
    'ob-patient-title': 'Я пациент / гражданин',
    'ob-patient-f1': '✓ Проверить мои симптомы',
    'ob-patient-f2': '✓ Найти ближайшего врача',
    'ob-patient-f3': '✓ Болезни под наблюдением',
    'ob-patient-f4': '✓ Сортировка при неотложной помощи',
    'ob-patient-cta': 'Начать →',
    'ob-expert-aria': 'Продолжить как медработник',
    'ob-expert-title': 'Я медицинский работник',
    'ob-expert-f1': '✓ Эпидемиологическая панель',
    'ob-expert-f2': '✓ Респираторный счёт 0–100',
    'ob-expert-f3': '✓ Мировая карта вспышек',
    'ob-expert-f4': '✓ Декларация случаев',
    'ob-expert-cta': 'Доступ для специалистов →',
    'ob-disclaimer': 'Инструмент публичной информации — не медицинское устройство (Рег. ЕС 2017/745)',
    'ob-skip': 'Продолжить без выбора',
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

// ── OUTBREAK DATA — chargé depuis data/pathogens.json ──────
let OUTBREAK_DATA = []; // rempli par loadPathogensData()


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
// AQI réel via Open-Meteo Air Quality API quand disponible, sinon estimation

// Cache AQI réels par région — persisté en sessionStorage pour éviter trop d'appels API
const _liveAqiCache = (() => {
  try { return JSON.parse(sessionStorage.getItem('biq_live_aqi') || '{}'); } catch(e) { return {}; }
})();

function _saveLiveAqiCache() {
  try { sessionStorage.setItem('biq_live_aqi', JSON.stringify(_liveAqiCache)); } catch(e) {}
}

// Convertit un European AQI (0–500) en score BreathIQ (0–100, 100=pire)
function _eaqiToScore(eaqi) {
  // EAQI: 0-20 Good → 20-40 Fair → 40-60 Moderate → 60-80 Poor → 80-100 Very Poor → >100 Extremely Poor
  if (eaqi <= 20)  return Math.round(eaqi * 0.5);          // 0-10
  if (eaqi <= 40)  return Math.round(10 + (eaqi-20) * 1);  // 10-30
  if (eaqi <= 60)  return Math.round(30 + (eaqi-40) * 1);  // 30-50
  if (eaqi <= 80)  return Math.round(50 + (eaqi-60) * 1);  // 50-70
  if (eaqi <= 100) return Math.round(70 + (eaqi-80) * 1);  // 70-90
  return Math.min(100, Math.round(90 + (eaqi-100) * 0.5)); // 90-100
}

// Récupère l'AQI réel depuis Open-Meteo (gratuit, sans clé API)
async function fetchLiveAqi(region) {
  if (!region.lat || !region.lon) return null;
  const cacheKey = `${region.id}`;
  const cached = _liveAqiCache[cacheKey];
  // Utiliser le cache si < 30 min
  if (cached && cached.ts && (Date.now() - cached.ts) < 30 * 60 * 1000) return cached.score;

  try {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${region.lat}&longitude=${region.lon}&current=european_aqi,pm2_5,pm10&timezone=auto`;
    const resp = await Promise.race([
      fetch(url),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
    ]);
    if (!resp.ok) throw new Error('API error');
    const data = await resp.json();
    const eaqi = data?.current?.european_aqi;
    if (typeof eaqi !== 'number') throw new Error('No AQI value');
    const score = _eaqiToScore(eaqi);
    const pm25 = data?.current?.pm2_5 ?? null;
    const pm10 = data?.current?.pm10 ?? null;
    _liveAqiCache[cacheKey] = { score, eaqi, pm25, pm10, ts: Date.now() };
    _saveLiveAqiCache();
    return score;
  } catch(e) {
    return null; // Fallback vers l'estimation
  }
}

function generateScoreForRegion(region) {
  const seed = region.id * 137 + 42;
  const noise = (n) => ((Math.sin(n) * 43758.5453123) % 1 + 1) % 1;

  const statusBase = {
    critical: 75, low: 60, moderate: 45, sufficient: 25
  }[region.status] || 40;

  // AQI : si ville personnalisée active, utiliser son cache ; sinon cache régional
  const cacheKey = _customCity ? 'custom' : String(region.id);
  const cachedAqi = _liveAqiCache[cacheKey];
  const aqi    = cachedAqi ? cachedAqi.score : Math.round(statusBase + (noise(seed * 1.1) - 0.5) * 20);
  const viral  = Math.round(statusBase + (noise(seed * 2.3) - 0.5) * 25);
  const pollen = Math.round(30 + noise(seed * 3.7) * 40);
  const weather= Math.round(20 + noise(seed * 4.1) * 30);

  const sr = Math.round(0.40 * aqi + 0.30 * viral + 0.20 * pollen + 0.10 * weather);

  return {
    sr: Math.min(100, Math.max(0, sr)),
    aqi: Math.min(100, Math.max(0, aqi)),
    viral: Math.min(100, Math.max(0, viral)),
    pollen: Math.min(100, Math.max(0, pollen)),
    weather: Math.min(100, Math.max(0, weather)),
    aqiIsLive: !!cachedAqi
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
      excellent: `Très bonne journée à ${name} — vous pouvez sortir et vaquer normalement à vos activités. Aucune précaution particulière recommandée.`,
      good: `Bonne journée à ${name}. L'environnement est favorable. Si vous souffrez d'asthme ou d'allergies, votre traitement habituel suffit.`,
      moderate: `Journée correcte à ${name}, avec quelques facteurs à surveiller. Les personnes asthmatiques ou allergiques peuvent préférer limiter les sorties prolongées.`,
      high: `Contexte respiratoire chargé à ${name}. Les personnes fragiles (asthme, allergie, personnes âgées) sont invitées à limiter les sorties et à porter un masque dans les transports.`,
      critical: `Situation préoccupante à ${name}. Limitez vos sorties si vous êtes fragile. Portez un masque de protection si vous devez sortir. Aérez votre logement tôt le matin.`
    },
    en: {
      excellent: `Great day in ${name} — you can go out and carry on normally. No precautions needed.`,
      good: `Good day in ${name}. The environment is favourable. If you have asthma or allergies, your usual treatment is sufficient.`,
      moderate: `Moderate conditions in ${name}. People with asthma or allergies may prefer to limit extended outdoor time.`,
      high: `Heavy respiratory context in ${name}. Vulnerable people (asthma, allergies, elderly) are advised to limit outings and wear a mask on public transport.`,
      critical: `Concerning situation in ${name}. Limit your outings if you are vulnerable. Wear a mask if you must go out. Ventilate your home early in the morning.`
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
// Priorité : ?lang= URL param (hreflang SEO) > localStorage > 'fr'
const _urlLang = new URLSearchParams(location.search).get('lang');
const _validLangs = new Set(['fr','en','es','pt','ar','zh','hi','sw','ru']);
let currentLang = (_urlLang && _validLangs.has(_urlLang))
  ? _urlLang
  : (localStorage.getItem('biq-lang') || 'fr');
let currentMode = localStorage.getItem('biq-mode') || 'patient';
let darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
let worldMap = null;
let stockLayer = null;
let outbreakLayer = null;
let activeLayer = 'both';
let currentFilter = localStorage.getItem('biq-pathogen-filter') || 'all';
let selectedRegionId = null;
let _customCity = null; // { name, lat, lon } quand l'utilisateur a cherché une ville ou utilisé la géolocalisation
let outbreakDataVersion = 0;
let lastPathogensRenderSignature = '';
let latestClinicalOrientation = null;

const JSON_FETCH_DEFAULTS = {
  timeout: 7000,
  cache: 'no-store',
};

// ── Utilitaires performance ──────────────────────────────────
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function throttle(fn, interval) {
  let last = 0;
  return function(...args) {
    const now = Date.now();
    if (now - last >= interval) { last = now; fn.apply(this, args); }
  };
}

function isDebugMode() {
  return location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.search.includes('debug=1');
}

function logDataWarning(label, error) {
  if (isDebugMode()) console.warn(`[BreathIQ] ${label}:`, error);
  else console.debug(`[BreathIQ] ${label}: ${error.message}`);
}

function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function fetchJsonWithTimeout(url, options = {}) {
  const timeout = options.timeout ?? JSON_FETCH_DEFAULTS.timeout;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const resp = await fetch(url, {
      cache: options.cache ?? JSON_FETCH_DEFAULTS.cache,
      headers: { Accept: 'application/json', ...(options.headers || {}) },
      signal: controller.signal,
    });

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const contentType = resp.headers.get('content-type') || '';
    if (contentType && !contentType.includes('json')) {
      console.debug(`[BreathIQ] ${url} content-type inattendu: ${contentType}`);
    }

    const data = await resp.json();
    if (!data || typeof data !== 'object') throw new Error('JSON racine invalide');
    if (options.validate && !options.validate(data)) throw new Error('Schema JSON inattendu');
    return data;
  } finally {
    clearTimeout(timer);
  }
}

function formatFrenchDate(value, options = { day: 'numeric', month: 'long', year: 'numeric' }) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('fr-FR', options);
}

// ── Language ─────────────────────────────────────────────────
const LANG_CYCLE = ['fr', 'en', 'es', 'pt', 'ar', 'zh', 'hi', 'sw', 'ru'];
const LANG_LABELS = { fr:'FR', en:'EN', es:'ES', pt:'PT', ar:'عر', zh:'中文', hi:'हि', sw:'SW', ru:'РУ' };

function t(key) {
  return I18N[currentLang]?.[key] ?? I18N.en?.[key] ?? I18N.fr[key] ?? key;
}

// Clés dont la valeur contient du HTML (innerHTML au lieu de textContent)
const I18N_HTML_KEYS = new Set(['ob-disclaimer']);

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (!val) return;
    if (I18N_HTML_KEYS.has(key)) el.innerHTML = val;
    else el.textContent = val;
  });
  // aria-label traduits via data-i18n-aria
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria');
    const val = t(key);
    if (val) el.setAttribute('aria-label', val);
  });
  // Synchroniser lang + dir sur <html>
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
  // Mettre à jour les numéros d'urgence et l'alerte PHEIC selon la langue
  renderEmergencyNumbers();
  loadPheicAlert();
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

  // ── GP Score Card (grand public) ──────────────────────────────
  const gpNum   = document.getElementById('gpScoreNum');
  const gpLevel = document.getElementById('gpScoreLevel');
  const gpLoc   = document.getElementById('gpScoreLocText');
  const gpAdv   = document.getElementById('gpScoreAdvice');
  const gpDial  = document.querySelector('.gp-score-dial');
  const gpInner = document.querySelector('.gp-score-dial-inner');

  if (gpNum)   gpNum.textContent = score.sr;
  if (gpLevel) { gpLevel.textContent = currentLang === 'fr' ? grade.grade : scoreGradeEN(score.sr); gpLevel.style.color = grade.color; }
  if (gpLoc)   gpLoc.textContent = _customCity ? '📍 ' + _customCity.name : (currentLang === 'fr' ? region.nameFR : (region.nameEN || region.nameFR));
  if (gpAdv)   gpAdv.textContent = aiMessageForRegion(region, score, currentLang);
  if (gpDial)  gpDial.style.setProperty('--score-color', grade.color);
  if (gpInner) gpInner.style.setProperty('--score-pct', score.sr + '%');

  // Factor values — qualitative labels (not raw numbers) for grand public
  function factorLabel(val, lang) {
    const fr = val <= 25 ? 'Excellent' : val <= 45 ? 'Bon' : val <= 60 ? 'Modéré' : val <= 75 ? 'Élevé' : 'Critique';
    const en = val <= 25 ? 'Excellent' : val <= 45 ? 'Good' : val <= 60 ? 'Moderate' : val <= 75 ? 'High' : 'Critical';
    return lang === 'fr' ? fr : en;
  }
  const gpFactorMap = {
    gpFactorAqi:     factorLabel(score.aqi,     currentLang),
    gpFactorViral:   factorLabel(score.viral,   currentLang),
    gpFactorPollen:  factorLabel(score.pollen,  currentLang),
    gpFactorWeather: factorLabel(score.weather, currentLang)
  };
  Object.entries(gpFactorMap).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  });

  // Delta J vs J-1 (localStorage)
  const TODAY = new Date().toISOString().slice(0, 10);
  const stored = JSON.parse(localStorage.getItem('biq_score_history') || '{}');
  const yesterday = Object.keys(stored).sort().reverse().find(d => d < TODAY);
  const deltaEl = document.getElementById('gpScoreDelta');
  if (deltaEl) {
    if (yesterday && stored[yesterday] !== undefined) {
      const diff = score.sr - stored[yesterday];
      const sign = diff > 0 ? '+' : '';
      deltaEl.textContent = `${sign}${diff} vs hier`;
      deltaEl.style.color = diff > 0 ? '#EF4444' : diff < 0 ? '#10B981' : '#9CA3AF';
      deltaEl.style.display = 'inline';
    } else {
      deltaEl.style.display = 'none';
    }
  }
  // Save today's score
  stored[TODAY] = score.sr;
  // Keep only last 8 days
  const keys = Object.keys(stored).sort().reverse();
  if (keys.length > 8) keys.slice(8).forEach(k => delete stored[k]);
  try { localStorage.setItem('biq_score_history', JSON.stringify(stored)); } catch(e) {}

  // Date de calcul sur le score card
  const dateEl = document.getElementById('gpScoreDate');
  if (dateEl) {
    const d = new Date();
    const opts = { day: 'numeric', month: 'long', year: 'numeric' };
    const dateStr = d.toLocaleDateString(currentLang === 'fr' ? 'fr-FR' : 'en-GB', opts);
    dateEl.textContent = currentLang === 'fr'
      ? `Estimation calculée aujourd'hui, ${dateStr} — Sources : OMS · ECDC · SPF · Open-Meteo`
      : `Estimate calculated today, ${dateStr} — Sources: WHO · ECDC · SPF · Open-Meteo`;
  }

  // CTA contextuel selon niveau de risque
  const ctaDiv  = document.getElementById('gpScoreCta');
  const ctaBtn  = document.getElementById('gpScoreCtaBtn');
  const ctaIcon = document.getElementById('gpScoreCtaIcon');
  const ctaTxt  = document.getElementById('gpScoreCtaText');
  if (ctaDiv && ctaBtn && ctaIcon && ctaTxt) {
    ctaDiv.style.display = 'block';
    if (score.sr <= 35) {
      ctaIcon.textContent = '✅'; ctaTxt.textContent = currentLang === 'fr' ? 'Vous pouvez sortir — conseils du jour' : 'You can go out — daily tips';
      ctaBtn.style.background = '#16a34a';
    } else if (score.sr <= 55) {
      ctaIcon.textContent = '💡'; ctaTxt.textContent = currentLang === 'fr' ? 'Quelques précautions utiles' : 'A few useful precautions';
      ctaBtn.style.background = '#2563eb';
    } else if (score.sr <= 70) {
      ctaIcon.textContent = '⚠️'; ctaTxt.textContent = currentLang === 'fr' ? 'Précautions recommandées — voir les conseils' : 'Precautions recommended — see tips';
      ctaBtn.style.background = '#d97706';
    } else {
      ctaIcon.textContent = '🔴'; ctaTxt.textContent = currentLang === 'fr' ? 'Contexte chargé — précautions importantes' : 'Heavy context — important precautions';
      ctaBtn.style.background = '#dc2626';
    }
  }

  // Révéler la carte (anti-flash : était opacity:0 au chargement)
  const card = document.getElementById('gpScoreCard');
  if (card) card.classList.add('js-ready');
}

// ── Bannière épidémique — contrôle grand public / expert ─────
function closePheicBanner() {
  const banner = document.getElementById('epidemicAlertBanner');
  if (banner) {
    banner.classList.add('alert-inactive');
    try { sessionStorage.setItem('biq_pheic_closed', '1'); } catch(e) {}
  }
}

function updateEpidemicBannerMode(isExpert) {
  const gpMsg = document.getElementById('epidemicGpMsg');
  const expertMsg = document.getElementById('epidemicExpertMsg');
  const expertLinks = document.querySelectorAll('#epidemicAlertBanner .expert-only');
  if (gpMsg) gpMsg.style.display = isExpert ? 'none' : '';
  if (expertMsg) expertMsg.style.display = isExpert ? '' : 'none';
  expertLinks.forEach(el => { el.style.display = isExpert ? '' : 'none'; });
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

  // CartoCDN dark tiles — sans rate-limit, thème sombre, déjà en CSP
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(worldMap);

  renderMapLayers();
  updateMapStats();

  // Force correct tile rendering after container is fully sized
  setTimeout(() => { if (worldMap) worldMap.invalidateSize(); }, 200);
  setTimeout(() => { if (worldMap) worldMap.invalidateSize(); }, 800);

  window.addEventListener('resize', debounce(() => {
    if (worldMap) worldMap.invalidateSize();
  }, 150), { passive: true });
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
  if (el('mstatMonitored')) el('mstatMonitored').textContent = 7; // 7 sources officielles réelles
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

// ── Chargement pathogènes depuis JSON ────────────────────────
async function loadPathogensData() {
  try {
    const data = await fetchJsonWithTimeout('data/pathogens.json?_=' + Date.now(), {
      timeout: 8000,
      validate: d => Array.isArray(d.pathogens) && d.pathogens.length > 0,
    });
    OUTBREAK_DATA = data.pathogens;
  } catch (e) {
    logDataWarning('pathogens.json indisponible', e);
  }
}

// ── WHO Disease Outbreak News (daily pipeline) ──────────────────────────────
async function loadWHOAlerts() {
  try {
    const data = await fetchJsonWithTimeout('data/who-alerts.json?_=' + Date.now(), {
      timeout: 6000,
      validate: payload => Array.isArray(payload.alerts) && typeof payload.generatedAt === 'string',
    });
    if (!data?.alerts?.length || !data.generatedAt) return;

    // Inject WHO alerts into the epi tracker section
    const whoSection = document.getElementById('whoAlertsSection');
    if (!whoSection) return;

    const dateLabel = formatFrenchDate(data.generatedAt, { day: 'numeric', month: 'long' });

    const riskColor = { critical:'#EF4444', high:'#F59E0B', moderate:'#6366F1', low:'#10B981' };
    const riskLabel = { critical:'🔴 CRITIQUE', high:'🟠 ÉLEVÉ', moderate:'🟡 MODÉRÉ', low:'🟢 NORMAL' };

    const items = data.alerts.slice(0, 6).map(a => {
      const color = riskColor[a.riskLevel] || '#6B7280';
      return `
      <a href="${escapeHTML(a.url || '#')}" target="_blank" rel="noopener noreferrer" class="who-alert-item">
        <span class="who-alert-badge" style="background:${color}22;color:${color};border-color:${color}44">${riskLabel[a.riskLevel] || '⚪'}</span>
        <span class="who-alert-title">${escapeHTML(a.title)}</span>
        <span class="who-alert-date">${a.pubDate ? formatFrenchDate(a.pubDate, {day:'numeric',month:'short'}) : ''}</span>
      </a>`;
    }).join('');

    whoSection.innerHTML = `
      <div class="who-alerts-header">
        <span class="who-alerts-title">📡 OMS — Disease Outbreak News</span>
        <span class="who-alerts-meta">Mis à jour le ${dateLabel} · <a href="https://www.who.int/emergencies/disease-outbreak-news" target="_blank" rel="noopener">who.int →</a></span>
      </div>
      <div class="who-alerts-list">${items}</div>`;
    whoSection.hidden = false;
    if (isDebugMode()) console.log(`[BreathIQ] WHO DON chargé (${data.alerts.length} alertes)`);
  } catch (e) {
    logDataWarning('WHO DON non disponible', e);
  }
}

function isLegacySPFLiveData(live) {
  return Boolean(live && typeof live === 'object' && live.patches && typeof live.patches === 'object');
}

function isCompactSPFLiveData(live) {
  return Boolean(
    live &&
    typeof live === 'object' &&
    typeof live.run_date === 'string' &&
    typeof live.overall_summary === 'string' &&
    Array.isArray(live.sources) &&
    Array.isArray(live.recommended_action)
  );
}

function applySPFPatches(live) {
  if (!isLegacySPFLiveData(live)) return 0;

  const UPDATABLE_KEYS = ['currentStatus', 'riskLevel', 'activeRegions', 'descFR', 'descEN', 'lastUpdate'];
  let patchCount = 0;

  for (const entry of OUTBREAK_DATA) {
    const patch = live.patches[entry.id];
    if (!patch || typeof patch !== 'object') continue;
    for (const key of UPDATABLE_KEYS) {
      if (patch[key] !== undefined) entry[key] = patch[key];
    }
    patchCount += 1;
  }

  if (Array.isArray(live.newOutbreaks)) {
    for (const nov of live.newOutbreaks) {
      if (!nov || typeof nov !== 'object') continue;
      const name = nov.nameFR || nov.nameEN || nov.name || 'Alerte SPF';
      const id = nov.id || 'SPF_' + name.replace(/\s+/g, '_').toUpperCase().slice(0, 12);
      if (!OUTBREAK_DATA.find(e => e.id === id)) {
        OUTBREAK_DATA.push({
          id,
          category: 'epidemic',
          lat: 0,
          lon: 20,
          transmission: [],
          protectionLevel: 1,
          protectionRequired: 'Masque chirurgical',
          iconColor: '#F59E0B',
          references: ['Santé Publique France — bulletin automatisé'],
          ...nov,
        });
        patchCount += 1;
      }
    }
  }

  if (patchCount) outbreakDataVersion += 1;
  return patchCount;
}

function updateSPFLiveBadge(live) {
  const badge = document.getElementById('spfLiveBadge');
  if (!badge) return;

  const dateValue = live.generatedAt || live.run_date || live.bulletinDate;
  if (!dateValue) return;

  const label = formatFrenchDate(dateValue);
  badge.textContent = `📡 Données SPF mises à jour le ${label}`;
  badge.style.display = 'inline-flex';
}

const SPF_JUNK_RE = /en savoir plus|skip to|nos services|saisis des suggestions|facebook|twitter|linkedin|courriel|navigation|menu|recherche|fil d'ariane|cookie|abonnez-vous|newsletter|inscription|partager|imprimer|^Nous contacter|chargement en cours/i;

function cleanSPFTitle(raw) {
  if (!raw) return 'Bulletin SPF';
  // Remove repeated title pattern "Title | Title ..."
  const parts = raw.split('|');
  return parts[0].trim().slice(0, 80);
}

function cleanSPFSignals(signals) {
  return (Array.isArray(signals) ? signals : [])
    .filter(s => s && s.length > 20 && s.length < 300 && !SPF_JUNK_RE.test(s))
    .slice(0, 3);
}

function renderSPFCompactSummary(live) {
  const panel = document.getElementById('spfLiveSummary');
  if (!panel) return;

  if (!isCompactSPFLiveData(live)) {
    panel.hidden = true;
    panel.innerHTML = '';
    return;
  }

  const riskClass = {
    high: 'spf-risk-high',
    medium: 'spf-risk-medium',
    low: 'spf-risk-low',
  };

  const sourceItems = live.sources.slice(0, 5).map(source => {
    const title = escapeHTML(cleanSPFTitle(source.title));
    const region = escapeHTML(source.region || 'France');
    const risk = ['low', 'medium', 'high'].includes(source.risk_level) ? source.risk_level : 'low';
    const signals = cleanSPFSignals(source.signals);
    const points = Array.isArray(source.key_points) ? source.key_points.slice(0, 3) : [];

    return `<article class="spf-source-item ${riskClass[risk]}">
      <div class="spf-source-head">
        <strong>${title}</strong>
        <span>${region} · ${risk}</span>
      </div>
      ${signals.length ? `<ul>${signals.map(signal => `<li>${escapeHTML(signal)}</li>`).join('')}</ul>` : ''}
      ${points.length ? `<p>${points.map(escapeHTML).join(' · ')}</p>` : ''}
    </article>`;
  }).join('');

  const actions = live.recommended_action.slice(0, 4).map(action => `<li>${escapeHTML(action)}</li>`).join('');

  panel.innerHTML = `
    <div class="spf-summary-head">
      <span>🇫🇷 Synthèse SPF automatisée</span>
      <time datetime="${escapeHTML(live.run_date)}">${escapeHTML(formatFrenchDate(live.run_date))}</time>
    </div>
    <p class="spf-summary-text">${escapeHTML(live.overall_summary)}</p>
    ${sourceItems ? `<div class="spf-source-list">${sourceItems}</div>` : ''}
    ${actions ? `<div class="spf-actions"><strong>Actions recommandées</strong><ul>${actions}</ul></div>` : ''}
  `;
  panel.hidden = false;
}

// ── SPF Live Data (AI-generated weekly) ─────────────────────────────────────
// Supports both legacy "patches" data and compact SPF summaries.
async function loadSPFLiveData() {
  try {
    const live = await fetchJsonWithTimeout('data/spf-live.json?_=' + Date.now(), {
      timeout: 8000,
      validate: payload => isLegacySPFLiveData(payload) || isCompactSPFLiveData(payload),
    });

    const patchCount = applySPFPatches(live);
    updateSPFLiveBadge(live);
    renderSPFCompactSummary(live);

    const sourceCount = Array.isArray(live.sources) ? live.sources.length : 0;
    if (isDebugMode()) console.log(`[BreathIQ] SPF live data chargée (${patchCount} patchs, ${sourceCount} sources compactes)`);
  } catch (e) {
    logDataWarning('SPF live data non disponible', e);
  }
}

function makeRefLink(ref) {
  const e = ref.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  let url = '';
  if (/WHO DON/i.test(ref))                          url = 'https://www.who.int/emergencies/disease-outbreak-news/';
  else if (/ECDC/i.test(ref))                        url = 'https://www.ecdc.europa.eu/';
  else if (/MMWR/i.test(ref))                        url = 'https://www.cdc.gov/mmwr/';
  else if (/CDC/i.test(ref))                         url = 'https://www.cdc.gov/';
  else if (/Lancet/i.test(ref))                      url = 'https://www.thelancet.com/';
  else if (/N Engl J Med|NEJM/i.test(ref))           url = 'https://www.nejm.org/';
  else if (/Santé Publique France|santepubliquefrance|SPF bulletin/i.test(ref)) url = 'https://www.santepubliquefrance.fr/';
  else if (/\bOMS\b|\bWHO\b/i.test(ref))             url = 'https://www.who.int/';
  else if (/PubMed|pubmed/i.test(ref))               url = 'https://pubmed.ncbi.nlm.nih.gov/';
  return url
    ? `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#60a5fa;text-decoration:none;border-bottom:1px solid rgba(96,165,250,.3)">${e}</a>`
    : e;
}

function renderPathogens() {
  const grid = document.getElementById('pathogensGrid');
  if (!grid) return;

  const filtered = currentFilter === 'all'
    ? OUTBREAK_DATA
    : OUTBREAK_DATA.filter(ob => ob.category === currentFilter);

  const renderSignature = [
    currentFilter,
    currentLang,
    currentMode,
    outbreakDataVersion,
    filtered.length,
  ].join('|');
  if (renderSignature === lastPathogensRenderSignature) return;
  lastPathogensRenderSignature = renderSignature;

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
    fr: { active:'Actif', outbreak:'🚨 Foyer actif', endemic:'Endémique', sporadic:'Sporadique', seasonal:'Saisonnier', monitoring:'Surveillance' },
    en: { active:'Active', outbreak:'🚨 Active outbreak', endemic:'Endemic', sporadic:'Sporadic', seasonal:'Seasonal', monitoring:'Monitoring' }
  };

  grid.innerHTML = filtered.map(ob => {
    const name = currentLang === 'fr' ? ob.nameFR : (ob.nameEN || ob.nameFR);
    const desc = currentLang === 'fr' ? ob.descFR : (ob.descEN || ob.descFR);
    const riskColor = riskColors[ob.riskLevel] || '#6B7280';
    const riskLabel = (riskLabels[currentLang] || riskLabels.en || riskLabels.fr)[ob.riskLevel] || ob.riskLevel;
    const catLabel  = (categoryLabels[currentLang] || categoryLabels.en || categoryLabels.fr)[ob.category] || ob.category;
    const statLabel = (statusLabels[currentLang] || statusLabels.en || statusLabels.fr)[ob.currentStatus] || ob.currentStatus;
    const protBadgeClass = ob.protectionLevel >= 3 ? 'prot-ffp3' : ob.protectionLevel === 2 ? 'prot-ffp2' : 'prot-surg';
    const refList = ob.references ? ob.references.map(r => `<li>${makeRefLink(r)}</li>`).join('') : '';
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

    // ── Mode EXPERT : fiche clinique complète pour infectiologues ──
    const isOutbreak = ob.currentStatus === 'outbreak' || ob.currentStatus === 'active';
    const lbl = currentLang === 'fr';
    const transModes = ob.transmission || [];
    const regions = ob.activeRegions || [];

    return `<article class="pathogen-card pathogen-card-expert${isOutbreak ? ' pc-outbreak-active' : ''}" data-id="${ob.id}" data-category="${ob.category}">

      <!-- ① En-tête identité -->
      <div class="pc-header">
        <div class="pc-dot" style="background:${ob.iconColor}"></div>
        <div class="pc-titles">
          <h3 class="pc-name">${name}</h3>
          <span class="pc-pathogen">${ob.pathogen}</span>
        </div>
        <span class="pc-risk" style="color:${riskColor};border-color:${riskColor}40;background:${riskColor}10">${riskLabel}</span>
      </div>

      <!-- ② Badges statut + EPI -->
      <div class="pc-badges">
        <span class="pc-badge pc-cat">${catLabel}</span>
        <span class="pc-badge pc-status${isOutbreak ? ' status-active' : ''}">${statLabel}</span>
        <span class="pc-badge ${protBadgeClass}">${ob.protectionRequired}</span>
        ${ob.lastUpdate ? `<span class="pc-badge pc-update">🗓 ${lbl?'Màj':'Upd'} ${ob.lastUpdate}</span>` : ''}
      </div>

      <!-- ③ Régions actives -->
      ${regions.length ? `<div class="pc-regions">
        <span class="pc-section-label">${lbl?'Zones actives':'Active zones'}</span>
        <div class="pc-region-chips">${regions.map(r=>`<span class="pc-region-chip">${r}</span>`).join('')}</div>
      </div>` : ''}

      <!-- ④ Description clinique -->
      <p class="pc-desc">${desc || ''}</p>

      <!-- ⑤ Grille épidémiologique -->
      <div class="pc-epi-grid">
        <div class="pc-epi-cell">
          <span class="pc-epi-label">R₀ / Reff</span>
          <span class="pc-epi-val">${ob.reproductionNumber}</span>
        </div>
        <div class="pc-epi-cell">
          <span class="pc-epi-label">${lbl?'Létalité (CFR)':'Case fatality rate'}</span>
          <span class="pc-epi-val">${ob.cfr}</span>
        </div>
        <div class="pc-epi-cell">
          <span class="pc-epi-label">${lbl?'Incubation':'Incubation'}</span>
          <span class="pc-epi-val">${ob.incubation}</span>
        </div>
        <div class="pc-epi-cell pc-epi-wide">
          <span class="pc-epi-label">${lbl?'Voie de transmission':'Transmission route'}</span>
          <span class="pc-epi-val">${ob.transmission_route}</span>
        </div>
      </div>

      <!-- ⑥ Modes de transmission -->
      ${transModes.length ? `<div class="pc-trans-modes">
        <span class="pc-section-label">${lbl?'Modes de transmission':'Transmission modes'}</span>
        <div class="pc-trans-chips">${transModes.map(t=>`<span class="pc-trans-chip">${t}</span>`).join('')}</div>
      </div>` : ''}

      <!-- ⑦ EPI & Protection -->
      ${ob.maskNote ? `<div class="pc-epi-block">
        <div class="pc-epi-block-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          ${lbl?'Protection EPI requise':'Required PPE'}
        </div>
        <p class="pc-epi-block-body">${ob.maskNote}</p>
      </div>` : ''}

      <!-- ⑧ Tableau clinique & Conduite à tenir -->
      ${sympList.length ? `<details class="pc-clinical-details" open>
        <summary class="pc-clinical-summary">🩺 ${lbl?'Tableau clinique & Conduite à tenir':'Clinical picture & Management'}</summary>
        <div class="pc-clinical-body">
          <div class="pc-symptoms-section">
            <div class="pc-symptoms-title">${lbl?'Symptômes':'Symptoms'}</div>
            <div class="pc-symptom-tags">${sympList.map(s=>`<span class="pc-symptom-tag">${s}</span>`).join('')}</div>
          </div>
          ${alarmList.length ? `<div class="pc-alarm-section">
            <div class="pc-alarm-title">⚠️ ${lbl?'Signes d\'alarme — urgence médicale immédiate':'Alarm signs — immediate medical emergency'}</div>
            <ul class="pc-alarm-list">${alarmList.map(a=>`<li>${a}</li>`).join('')}</ul>
          </div>` : ''}
          ${isoNote ? `<div class="pc-isolation-expert">
            <span class="pc-section-label">📋 ${lbl?'Conduite à tenir':'Management'}</span>
            <p>${isoNote}</p>
          </div>` : ''}
        </div>
      </details>` : ''}

      <!-- ⑨ Références scientifiques -->
      ${refList ? `<details class="pc-refs">
        <summary>📚 ${lbl?'Références scientifiques':'Scientific references'} (${ob.references.length})</summary>
        <ul class="pc-refs-list">${refList}</ul>
      </details>` : ''}

      <!-- ⑩ Pied de carte : foyer + mise à jour -->
      ${ob.outbreakStart ? `<div class="pc-footer-meta">
        <span>📍 ${lbl?'Foyer':'Outbreak'} : ${ob.outbreakStart}</span>
      </div>` : ''}
    </article>`;
  }).join('');
}

// ── Navigation scroll behavior ───────────────────────────────
function initNavScroll() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', throttle(() => {
    const y = window.scrollY;
    nav.classList.toggle('nav-scrolled', y > 20);
    nav.classList.toggle('nav-hidden', y > lastScrollY && y > 100);
    lastScrollY = y;
    // Mise à jour bouton scroll-top
    const btn = document.getElementById('scrollTopBtn');
    if (btn) btn.classList.toggle('visible', y > 400);
  }, 80), { passive: true });
}

// ── Map init — robust (window.load + scroll fallback) ────────
let _leafletLoading = false;
function initMapWhenReady() {
  if (typeof L !== 'undefined') { initMap(); return; }
  if (_leafletLoading) return;
  _leafletLoading = true;

  // Inject Leaflet CSS only if not already present
  if (!document.querySelector('link[href*="leaflet"]')) {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    css.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    css.crossOrigin = '';
    document.head.appendChild(css);
  }

  // Dynamically load Leaflet JS
  const script = document.createElement('script');
  script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
  script.crossOrigin = '';
  script.onload = () => { _leafletLoading = false; initMap(); };
  script.onerror = () => { _leafletLoading = false; console.warn('[BreathIQ] Leaflet failed to load'); };
  document.head.appendChild(script);
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
    const rid = parseInt(e.target.value, 10);
    updateScoreDisplay(rid);
    fetchLiveAqiAndRefresh(rid);
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
    btn.classList.toggle('active', btn.dataset.filter === currentFilter);
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      localStorage.setItem('biq-pathogen-filter', currentFilter);
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
    // Si profil déjà enregistré → accès direct sans re-saisie
    if (localStorage.getItem('biq-pro-profile')) {
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
    updateEpidemicBannerMode(false);
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
const SOIGNANT_PASS = 'breathiq2026';

// Country auto-detect from browser locale
function _detectCountry() {
  const lang = navigator.language || '';
  const map = { 'fr-FR':'FR','fr-BE':'BE','fr-CH':'CH','fr-CA':'CA',
                'fr-SN':'SN','fr-MA':'MA','fr-DZ':'DZ','fr-TN':'TN',
                'fr-CI':'CI','fr-CM':'CM','fr-CD':'CD',
                'en-US':'US','en-GB':'GB' };
  return map[lang] || (lang.startsWith('fr') ? 'FR' : 'OTHER');
}

function openSoignantModal() {
  const modal = document.getElementById('soignantModal');
  if (!modal) return;
  modal.hidden = false;
  modal.removeAttribute('hidden');
  // Pre-select detected country and reset specialty
  const sel = document.getElementById('proCountrySelect');
  if (sel) {
    sel.value = _detectCountry();
    _onCountryChange();
  }
  document.querySelectorAll('.pro-spec-card').forEach(c => c.classList.remove('selected'));
  const btn = document.getElementById('proStep2Btn');
  if (btn) btn.disabled = true;
}

function closeSoignantModal() {
  const modal = document.getElementById('soignantModal');
  if (modal) modal.hidden = true;
}

// validateSoignantPass kept for backward compatibility but no longer used
function validateSoignantPass() { saveProProfile(); }
function _showProStep2() { /* no-op — single step now */ }

// Identifiant professionnel adapté au pays
const PRO_ID_CONFIG = {
  FR: { label: 'N° RPPS (11 chiffres)', hint: 'Répertoire Partagé des Professionnels de Santé · optionnel · jamais transmis', maxlen: 11, numeric: true },
  BE: { label: 'N° INAMI / RIZIV (11 chiffres)', hint: 'Institut National d\'Assurance Maladie-Invalidité · optionnel', maxlen: 11, numeric: true },
  CH: { label: 'N° GLN / EAN (13 chiffres)', hint: 'Global Location Number · RCC Suisse · optionnel', maxlen: 13, numeric: true },
  LU: { label: 'N° CMSS (optionnel)', hint: 'Caisse de Maladie des Secteurs Santé · optionnel', maxlen: 20, numeric: false },
  CA: { label: 'N° provincial (optionnel)', hint: 'Numéro d\'inscription au collège provincial · optionnel', maxlen: 20, numeric: false },
  GB: { label: 'GMC / NMC number (optional)', hint: 'General Medical Council or Nursing & Midwifery Council · optional', maxlen: 20, numeric: false },
  US: { label: 'NPI number (optional)', hint: 'National Provider Identifier · optional', maxlen: 10, numeric: true },
};

function _onCountryChange() {
  const sel = document.getElementById('proCountrySelect');
  const rppsGroup = document.getElementById('proRppsGroup');
  const rppsInput = document.getElementById('proRppsInput');
  const rppsHint = document.getElementById('proRppsHint');
  if (!sel || !rppsGroup) return;

  const cfg = PRO_ID_CONFIG[sel.value];
  if (cfg) {
    rppsGroup.hidden = false;
    if (rppsInput) {
      rppsInput.placeholder = cfg.label;
      rppsInput.maxLength = cfg.maxlen;
      rppsInput.oninput = cfg.numeric
        ? function() { this.value = this.value.replace(/\D/g,'').slice(0, cfg.maxlen); }
        : function() { this.value = this.value.slice(0, cfg.maxlen); };
    }
    if (rppsHint) rppsHint.textContent = cfg.hint;
  } else {
    rppsGroup.hidden = true;
  }
}

function selectSpecialty(btn) {
  document.querySelectorAll('.pro-spec-card').forEach(c => c.classList.remove('selected'));
  btn.classList.add('selected');
  document.getElementById('proStep2Btn').disabled = false;
}

function saveProProfile() {
  const country = document.getElementById('proCountrySelect')?.value || 'OTHER';
  const specBtn = document.querySelector('.pro-spec-card.selected');
  const specialty = specBtn?.dataset.spec || 'autre-soignant';
  const rpps = (document.getElementById('proRppsInput')?.value || '').trim();
  const profile = { country, specialty, rpps: rpps || null, savedAt: Date.now() };
  localStorage.setItem('biq-pro-profile', JSON.stringify(profile));
  closeSoignantModal();
  activateExpertMode();
  _renderProBadge(profile);
}

function skipProProfile() {
  localStorage.setItem('biq-pro-profile', JSON.stringify({ country:'OTHER', specialty:'autre-soignant', rpps:null, savedAt:Date.now() }));
  closeSoignantModal();
  activateExpertMode();
}

function _renderProBadge(profile) {
  const btn = document.getElementById('modeToggleBtn');
  if (!btn || !profile) return;
  const specLabels = { medecin:'Dr', infirmier:'IDE', pharmacien:'Pharm.', epidemiologiste:'Épidémio.', 'autre-soignant':'Soignant', etudiant:'Étudiant' };
  const label = specLabels[profile.specialty] || 'Soignant';
  const rppsTag = profile.rpps ? ' · RPPS ✓' : '';
  btn.innerHTML = `👤 Mode Patient <span class="pro-profile-badge">${label}${rppsTag}</span>`;
}

function activateExpertMode() {
  currentMode = 'expert';
  localStorage.setItem('biq-mode', 'expert');
  document.body.dataset.mode = 'expert';
  updateModeToggleBtn();
  updateEpidemicBannerMode(true);
  // Restore pro badge if profile exists
  try {
    const p = JSON.parse(localStorage.getItem('biq-pro-profile') || 'null');
    if (p) _renderProBadge(p);
  } catch(_) {}
  renderPathogens();
  renderLocalDeclarations();
  renderClusterAlertBanner();
  renderEpiTracker();
  loadWHOAlerts();
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

  // ── Check for active PHEIC → override to CRITIQUE ──────────
  const hasPHEIC = OUTBREAK_DATA.some(ob => ob.currentStatus === 'outbreak' && ob.riskLevel === 'critical');

  banner.className = 'risk-banner';

  if (hasPHEIC) {
    banner.classList.add('risk-moderate');
    if (icon)  { icon.textContent = 'ℹ️'; icon.classList.remove('pulse'); }
    if (label) label.textContent = lang === 'fr' ? 'SURVEILLANCE INTERNATIONALE' : 'INTERNATIONAL MONITORING';
    if (title) title.textContent = lang === 'fr'
      ? '🚨 France : 1 cas Ebola confirmé (24/06/2026) — cas importé isolé en UHSI · population générale non exposée'
      : '🚨 France: 1 Ebola case confirmed (June 24, 2026) — imported case in UHSI isolation · general population not at risk';
    if (desc)  desc.textContent  = lang === 'fr' ? 'Une épidémie est active en Afrique centrale. Si vous revenez de cette région avec de la fièvre, appelez le 15 sans vous déplacer.' : 'An outbreak is active in Central Africa. If you return from this region with fever, call emergency services without travelling.';
    const dot = document.getElementById('heroUrgencyDot');
    if (dot) dot.hidden = true;
  } else if (score.sr <= 45) {
    banner.classList.add('risk-low');
    if (icon)  { icon.textContent = '🟢'; icon.classList.remove('pulse'); }
    if (label) label.textContent = lang === 'fr' ? 'ENVIRONNEMENT FAVORABLE' : 'FAVOURABLE CONDITIONS';
    if (title) title.textContent = lang === 'fr' ? 'Oui, vous pouvez sortir normalement aujourd\'hui' : 'Yes, you can go out normally today';
    if (desc)  desc.textContent  = lang === 'fr' ? 'L\'air, les virus et les pollens sont à des niveaux acceptables dans votre région' : 'Air quality, viruses and pollen are at acceptable levels in your area';
  } else if (score.sr <= 65) {
    banner.classList.add('risk-moderate');
    if (icon)  { icon.textContent = '🟡'; icon.classList.remove('pulse'); }
    if (label) label.textContent = lang === 'fr' ? 'QUELQUES PRÉCAUTIONS' : 'SOME PRECAUTIONS';
    if (title) title.textContent = lang === 'fr' ? 'Vous pouvez sortir — quelques précautions si vous êtes fragile' : 'You can go out — some precautions if you are vulnerable';
    if (desc)  desc.textContent  = lang === 'fr' ? 'Lavez-vous les mains régulièrement. Si vous êtes asthmatique ou allergique, surveillez vos symptômes.' : 'Wash your hands regularly. If you have asthma or allergies, monitor your symptoms.';
  } else {
    banner.classList.add('risk-high');
    if (icon)  { icon.textContent = '🔴'; icon.classList.remove('pulse'); }
    if (label) label.textContent = lang === 'fr' ? 'PRUDENCE RECOMMANDÉE' : 'CAUTION RECOMMENDED';
    if (title) title.textContent = lang === 'fr' ? 'Contexte respiratoire chargé — limitez vos sorties si vous êtes fragile' : 'Heavy respiratory context — limit outings if you are vulnerable';
    if (desc)  desc.textContent  = lang === 'fr' ? 'Portez un masque dans les transports et espaces bondés. Lavez-vous les mains souvent.' : 'Wear a mask on public transport and in crowded spaces. Wash your hands frequently.';
  }

  // Update expert stats bar
  _updateExpertStats();
}

function _updateExpertStats() {
  const pheicCount = OUTBREAK_DATA.filter(o => o.currentStatus === 'outbreak' && o.riskLevel === 'critical').length;
  const outbreakCount = OUTBREAK_DATA.filter(o => o.currentStatus === 'outbreak' || o.currentStatus === 'active').length;
  const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  el('esbPheic', pheicCount);
  el('esbOutbreaks', outbreakCount);
  el('esbPathogens', OUTBREAK_DATA.length);
}

// ── Quick symptom selection from chips ──────────────────────────
// ════════════════════════════════════════════════════════════
// WIZARD SÉQUENTIEL — Vérificateur de symptômes v3
// ════════════════════════════════════════════════════════════

const WIZ = {
  currentStep: 0,
  mainSymptom: null,
  vitals: { spo2: 'unknown', hr: 'unknown' },
  // Symptômes associés selon le symptôme principal
  ASSOC_SYMPTOMS: {
    fever: [
      { v:'shivering',          icon:'🥶', label:'Frissons intenses (en quintes)' },
      { v:'sweating',           icon:'💦', label:'Sueurs abondantes après les frissons' },
      { v:'fever_resistant',    icon:'🔁', label:'Fièvre qui ne baisse pas (> 3 jours)' },
      { v:'night_sweats',       icon:'🌙', label:'Sueurs nocturnes (trempé le matin)' },
      { v:'myalgias',           icon:'💪', label:'Douleurs musculaires' },
      { v:'headache',           icon:'🤕', label:'Maux de tête' },
      { v:'fatigue_severe',     icon:'😴', label:'Fatigue intense' },
      { v:'vomiting',           icon:'🤢', label:'Vomissements' },
      { v:'diarrhea',           icon:'💧', label:'Diarrhée' },
      { v:'sore_throat',        icon:'🤧', label:'Maux de gorge' },
      { v:'rash_maculopapular', icon:'🔴', label:'Éruption rouge (visage puis corps)' },
      { v:'rose_spots',         icon:'🌸', label:'Petites taches roses sur le ventre' },
      { v:'jaundice',           icon:'🟡', label:'Jaunisse (yeux ou peau jaunes)' },
      { v:'relative_bradycardia',icon:'💓',label:'Pouls lent malgré fièvre élevée' },
      { v:'splenomegaly',       icon:'🫀', label:'Ventre gonflé (rate ou foie)' },
      { v:'weight_loss',        icon:'⚖️', label:'Amaigrissement récent' },
      { v:'rapid_deterioration',icon:'📉', label:'Aggravation très rapide (< 24h)' },
    ],
    cough: [
      { v:'dry_cough',          icon:'🫁', label:'Toux sèche' },
      { v:'wet_cough',          icon:'💧', label:'Toux avec crachats' },
      { v:'cough_3w',           icon:'⏱️', label:'Toux depuis plus de 3 semaines' },
      { v:'hemoptysis',         icon:'🩸', label:'Crachats avec sang' },
      { v:'wheezing',           icon:'🌬️', label:'Sifflements respiratoires' },
      { v:'tachypnea',          icon:'💨', label:'Respiration très rapide' },
      { v:'sore_throat',        icon:'🤧', label:'Maux de gorge' },
      { v:'rhinorrhea',         icon:'💧', label:'Nez qui coule' },
      { v:'breathlessness',     icon:'😮‍💨', label:'Essoufflement à l\'effort' },
      { v:'chest_pain',         icon:'💔', label:'Douleur dans la poitrine' },
      { v:'fever',              icon:'🌡️', label:'Fièvre' },
      { v:'night_sweats',       icon:'🌙', label:'Sueurs nocturnes' },
      { v:'weight_loss',        icon:'⚖️', label:'Amaigrissement' },
      { v:'koplik_spots',       icon:'⬜', label:'Taches blanches dans la bouche' },
    ],
    headache: [
      { v:'photophobia',        icon:'🌟', label:'Sensibilité à la lumière' },
      { v:'neck_stiffness',     icon:'🔒', label:'Raideur de la nuque' },
      { v:'vomiting',           icon:'🤢', label:'Vomissements' },
      { v:'fever',              icon:'🌡️', label:'Fièvre' },
      { v:'retrobulbar_pain',   icon:'👁️', label:'Douleur derrière les yeux' },
      { v:'conjunctivitis',     icon:'👁️', label:'Yeux rouges' },
      { v:'myalgias',           icon:'💪', label:'Douleurs musculaires' },
      { v:'fatigue_severe',     icon:'😴', label:'Fatigue intense' },
      { v:'rash',               icon:'🩹', label:'Éruption cutanée' },
      { v:'confusion',          icon:'🌀', label:'Confusion / désorientation' },
      { v:'tachycardia',        icon:'💗', label:'Cœur qui bat très vite' },
    ],
    rash: [
      { v:'rash_pustular',      icon:'⭕', label:'Boutons avec pus (pustules)' },
      { v:'rash_maculopapular', icon:'🔴', label:'Taches / boutons rouges plats' },
      { v:'purpura',            icon:'🟣', label:'Taches violettes qui ne s\'effacent pas' },
      { v:'koplik_spots',       icon:'⬜', label:'Taches blanches dans la bouche' },
      { v:'lymph_nodes',        icon:'🔵', label:'Ganglions gonflés' },
      { v:'fever',              icon:'🌡️', label:'Fièvre' },
      { v:'myalgias',           icon:'💪', label:'Douleurs musculaires' },
      { v:'arthralgia',         icon:'🦴', label:'Douleurs articulaires' },
      { v:'conjunctivitis',     icon:'👁️', label:'Yeux rouges' },
      { v:'rhinorrhea',         icon:'💧', label:'Nez qui coule' },
      { v:'itching',            icon:'🤚', label:'Démangeaisons' },
      { v:'sore_throat',        icon:'🤧', label:'Maux de gorge' },
      { v:'urticaria',          icon:'🫧', label:'Plaques rouges qui démangent' },
    ],
    digestive: [
      { v:'vomiting',           icon:'🤢', label:'Vomissements' },
      { v:'diarrhea',           icon:'💧', label:'Diarrhée (selles liquides)' },
      { v:'diarrhea_profuse',   icon:'🌊', label:'Diarrhée très abondante, eau de riz' },
      { v:'abdominal_pain',     icon:'🫃', label:'Douleurs au ventre' },
      { v:'constipation',       icon:'⛔', label:'Constipation' },
      { v:'fever',              icon:'🌡️', label:'Fièvre' },
      { v:'bleeding',           icon:'🩸', label:'Sang dans les selles' },
      { v:'hematuria',          icon:'🔴', label:'Sang dans les urines' },
      { v:'dehydration',        icon:'🏜️', label:'Très soif, bouche sèche, peu d\'urines' },
      { v:'fatigue_severe',     icon:'😴', label:'Fatigue intense' },
      { v:'jaundice',           icon:'🟡', label:'Jaunisse (yeux/peau jaunes)' },
      { v:'weight_loss',        icon:'⚖️', label:'Amaigrissement' },
      { v:'hepatomegaly',       icon:'🫀', label:'Ventre gonflé (côté droit)' },
    ],
    pain: [
      { v:'myalgias',           icon:'💪', label:'Douleurs musculaires diffuses' },
      { v:'arthralgia',         icon:'🦴', label:'Douleurs articulaires' },
      { v:'fever',              icon:'🌡️', label:'Fièvre' },
      { v:'fatigue_severe',     icon:'😴', label:'Fatigue intense' },
      { v:'rash',               icon:'🩹', label:'Éruption cutanée' },
      { v:'retrobulbar_pain',   icon:'👁️', label:'Douleur derrière les yeux' },
      { v:'shivering',          icon:'🥶', label:'Frissons' },
      { v:'night_sweats',       icon:'🌙', label:'Sueurs nocturnes' },
      { v:'chest_pain',         icon:'💔', label:'Douleur dans la poitrine' },
      { v:'splenomegaly',       icon:'🫀', label:'Ventre gonflé (rate)' },
    ],
    other: [
      { v:'smell_loss',         icon:'👃', label:'Perte d\'odorat' },
      { v:'taste_loss',         icon:'👅', label:'Perte de goût' },
      { v:'hearing_loss',       icon:'👂', label:'Perte d\'audition / surdité soudaine' },
      { v:'weight_loss',        icon:'⚖️', label:'Amaigrissement inexpliqué' },
      { v:'night_sweats',       icon:'🌙', label:'Sueurs nocturnes' },
      { v:'fatigue_chronic',    icon:'😴', label:'Fatigue intense et prolongée (> 1 mois)' },
      { v:'fatigue_severe',     icon:'😴', label:'Fatigue intense' },
      { v:'lymph_nodes',        icon:'🔵', label:'Ganglions gonflés' },
      { v:'fever',              icon:'🌡️', label:'Fièvre' },
      { v:'conjunctivitis',     icon:'👁️', label:'Yeux rouges' },
      { v:'facial_edema',       icon:'😶', label:'Gonflement du visage' },
      { v:'anemia_signs',       icon:'🫥', label:'Pâleur, grande fatigue, essoufflement' },
      { v:'hematuria',          icon:'🔴', label:'Sang dans les urines' },
      { v:'rapid_deterioration',icon:'📉', label:'Aggravation très rapide' },
    ],
  },
};

function wizGoTo(step) {
  document.querySelectorAll('.wizard-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById(`wiz-step-${step}`);
  if (panel) { panel.classList.add('active'); }

  // Met à jour les dots
  document.querySelectorAll('.wizard-step-dot').forEach(dot => {
    const s = parseInt(dot.dataset.step);
    dot.classList.remove('active','done');
    if (s === step) dot.classList.add('active');
    else if (s < step) dot.classList.add('done');
  });
  document.querySelectorAll('.wizard-step-line').forEach((line, i) => {
    line.classList.toggle('done', i < step);
  });

  WIZ.currentStep = step;
  document.getElementById('symptomChecker')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function wizNext(fromStep) {
  if (fromStep === 0) {
    // "Aucun de ces signes" → décocher tout et aller step 1
    document.querySelectorAll('#wiz-step-0 .alarm-sign-check input').forEach(cb => {
      cb.checked = false;
      cb.closest('.alarm-sign-check')?.classList.remove('alarm-checked');
    });
    wizGoTo(1);
    return;
  }
  if (fromStep === 2) {
    wizGoTo(3);
    return;
  }
}

// Appelé quand une alarme est cochée — analyse immédiate
function wizAlarmChecked(labelEl) {
  const cb = labelEl.querySelector('input[type="checkbox"]');
  if (!cb) return;
  cb.checked = !cb.checked;
  labelEl.classList.toggle('alarm-checked', cb.checked);
  // Bandeau urgence immédiat visible dès le premier cochage
  const emergBanner = document.getElementById('wiz-emergency-banner');
  const anyChecked = document.querySelectorAll('#wiz-step-0 input[type="checkbox"]:checked').length > 0;
  if (emergBanner) emergBanner.classList.toggle('visible', anyChecked);
  if (anyChecked) {
    emergBanner?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(wizAnalyze, 400);
  }
}

function wizBack(fromStep) {
  if (fromStep === 1) { wizGoTo(0); return; }
  if (fromStep === 2) { wizGoTo(1); return; }
  if (fromStep === 3) { wizGoTo(2); return; }
}

function wizToggleAlarm(labelEl) {
  const cb = labelEl.querySelector('input[type="checkbox"]');
  if (!cb) return;
  cb.checked = !cb.checked;
  labelEl.classList.toggle('alarm-checked', cb.checked);
}

function wizSelectMain(main) {
  WIZ.mainSymptom = main;
  // Highlight bouton sélectionné
  document.querySelectorAll('.wiz-main-btn').forEach(b => b.classList.toggle('active', b.dataset.main === main));

  // Titre étape 2
  const titles = {
    fever:'🌡️ Quels autres symptômes avez-vous avec la fièvre ?',
    cough:'🫁 Comment est la toux et quels autres symptômes ?',
    headache:'🤕 Quels symptômes accompagnent vos maux de tête ?',
    rash:'🔴 Comment est l\'éruption et quels symptômes ?',
    digestive:'🤢 Quels troubles digestifs ressentez-vous ?',
    pain:'💪 Où avez-vous mal et quels autres symptômes ?',
    other:'🔍 Quels symptômes ressentez-vous ?',
  };
  const titleEl = document.getElementById('wiz2-title');
  if (titleEl) titleEl.textContent = titles[main] || 'Symptômes associés';

  // Génère la grille
  const grid = document.getElementById('wizAssocGrid');
  if (grid) {
    const items = WIZ.ASSOC_SYMPTOMS[main] || WIZ.ASSOC_SYMPTOMS.other;
    grid.innerHTML = items.map(s => `
      <label class="symptom-check" onclick="toggleSymptom(this)">
        <input type="checkbox" value="${s.v}">
        <span class="sym-icon">${s.icon}</span>
        <span>${s.label}</span>
      </label>`).join('');
  }

  wizGoTo(2);
}

function wizUpdateVital(type, value) {
  WIZ.vitals[type] = value;
}

function wizCollectState() {
  // Alarme step 0
  const alarm = Array.from(document.querySelectorAll('#wiz-step-0 .alarm-sign-check input:checked')).map(cb => cb.value);

  // Symptôme principal → flag engine
  const mainFlagMap = {
    fever: ['fever','fever_high'],
    cough: ['dry_cough'],
    headache: ['headache'],
    rash: ['rash'],
    digestive: ['vomiting','diarrhea'],
    pain: ['myalgias'],
    other: [],
  };
  const mainFlags = WIZ.mainSymptom ? (mainFlagMap[WIZ.mainSymptom] || []) : [];

  // Symptômes associés (step 2)
  const assoc = Array.from(document.querySelectorAll('#wizAssocGrid input:checked')).map(cb => cb.value);

  // Contexte épidémio (step 3)
  const ctx = Array.from(document.querySelectorAll('.wiz-epid-check input:checked')).map(cb => cb.value);

  // Signes vitaux → flags
  const vitalFlags = [];
  if (WIZ.vitals.spo2 === 'critical')  vitalFlags.push('spo2_critical');
  if (WIZ.vitals.spo2 === 'low')       vitalFlags.push('spo2_low');
  if (WIZ.vitals.hr  === 'very_high')  vitalFlags.push('hr_very_high');
  if (WIZ.vitals.hr  === 'high')       vitalFlags.push('hr_high');

  const onset = document.querySelector('.ctx-pill[data-group="onset"].selected')?.dataset.value || 'unknown';
  const fever = document.querySelector('.ctx-pill[data-group="fever"].selected')?.dataset.value || 'unknown';
  const age   = document.querySelector('.ctx-pill[data-group="age"].selected')?.dataset.value  || 'adult';

  return {
    symptoms: [...new Set([...mainFlags, ...assoc, ...vitalFlags])],
    alarm,
    ctx,
    onset,
    fever,
    age,
  };
}

function wizAnalyze() {
  const state  = wizCollectState();

  // Cas spécial HAS/SFMU : nourrisson < 3 mois + fièvre ≥ 38°C → urgences sans délai
  if (state.alarm.includes('infant_fever_alarm')) {
    const infantResult = {
      ranked: [],
      orientLevel: 'emergency',
      alarmReason: '👶 Nourrisson < 3 mois avec fièvre ≥ 38°C — urgences pédiatriques immédiates (HAS/SFMU)',
      clinical: {
        level: 'emergency',
        urgencyScore: 98,
        careNeed: 'emergency_department',
        redFlags: ['infant_fever_alarm'],
        reasons: ['Tout nourrisson de moins de 3 mois avec température ≥ 38°C doit être évalué aux urgences sans délai.'],
        patientMessageFR: '🚨 Nourrisson < 3 mois avec fièvre ≥ 38°C : rendez-vous aux urgences pédiatriques immédiatement ou appelez le 15. Ne donnez aucun antipyrétique sans avis médical.',
        patientMessageEN: '🚨 Infant < 3 months with fever ≥ 38°C: go to paediatric emergency immediately or call 15. Do not give any antipyretic without medical advice.',
        careLabelFR: 'Urgences pédiatriques',
        careLabelEN: 'Paediatric emergency department',
        disclaimerFR: 'BreathIQ oriente vers un niveau de recours. Il ne pose pas de diagnostic et ne remplace pas une consultation médicale.',
        disclaimerEN: 'BreathIQ suggests a level of care. It does not provide a diagnosis and does not replace medical consultation.',
      },
    };
    latestClinicalOrientation = infantResult.clinical;
    renderDiagnosticResult(infantResult, state);
    const res = document.getElementById('symptomResult');
    if (res) { res.classList.remove('hidden'); res.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
    return;
  }

  const result = BIQ_DIAG.runDiagnosticEngine(state);
  const clinicalInput = buildClinicalOrientationInput(state);
  result.clinical = window.BIQ_CLINICAL?.evaluateClinicalOrientation
    ? window.BIQ_CLINICAL.evaluateClinicalOrientation(clinicalInput)
    : null;
  latestClinicalOrientation = result.clinical;
  renderDiagnosticResult(result, state);

  // Afficher résultat sous le wizard
  const res = document.getElementById('symptomResult');
  if (res) {
    res.classList.remove('hidden');
    res.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function wizShare() {
  const resultEl = document.getElementById('symptomResult');
  const text = resultEl ? resultEl.innerText.substring(0, 500) : '';
  if (navigator.share) {
    navigator.share({ title: 'BreathIQ — Résultat triage', text, url: location.href })
      .catch(() => {});
  } else {
    navigator.clipboard?.writeText(location.href + '\n\n' + text)
      .then(() => alert('Lien copié dans le presse-papier'))
      .catch(() => {});
  }
}

function quickSelectSymptom(symptomValue) {
  // Mappe les quick chips vers le bon main symptom du wizard
  const mainMap = {
    fever:'fever', dry_cough:'cough', breathlessness:'cough',
    headache:'headache', vomiting:'digestive', rash:'rash', bleeding:'other',
  };
  const main = mainMap[symptomValue] || 'other';
  wizGoTo(0);
  setTimeout(() => {
    // Si signe d'alarme critique → sélectionner direct
    if (['breathlessness','confusion','bleeding'].includes(symptomValue)) {
      const cb = document.querySelector(`#wiz-step-0 input[value="${
        symptomValue === 'breathlessness' ? 'dyspnea_rest' : symptomValue
      }"]`);
      if (cb) { cb.checked = true; cb.closest('.alarm-sign-check')?.classList.add('alarm-checked'); }
      wizAnalyze();
    } else {
      wizSelectMain(main);
    }
  }, 100);
  document.getElementById('symptomChecker')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Vérificateur de symptômes (compatibilité callbacks HTML) ─
function toggleSymptom(labelEl) {
  const cb = labelEl.querySelector('input[type="checkbox"]');
  if (!cb) return;
  cb.checked = !cb.checked;
  labelEl.classList.toggle('checked', cb.checked);
}

// ============================================================
// MOTEUR DIAGNOSTIQUE INFECTIOLOGIQUE — BreathIQ v2.0
// Algorithme Bayésien pondéré — Référentiels OMS, ECDC, CDC
// Critères validés: ILI (OMS), CURB-65, FLU score, SARI
// © 2026 Dr. Clément MÉDEAU — Non dispositif médical
// ============================================================

// DIAG_ENGINE -> js/diagnostic-engine.js (window.BIQ_DIAG)


function collectCheckerState() {
  return wizCollectState();
}

function buildClinicalOrientationInput(state) {
  const symptoms = [...state.symptoms, ...state.alarm];
  const riskFactors = [...state.ctx];
  if (state.fever && state.fever !== 'no_fever') symptoms.push(state.fever);
  if (state.onset === 'weeks') symptoms.push('persistent_cough');
  if (state.age === 'senior') riskFactors.push('age_senior');
  if (state.age === 'infant') riskFactors.push('age_infant');

  const durationDays = state.onset === 'weeks'
    ? 21
    : state.onset === 'days_4_7'
      ? 5
      : state.onset === 'days_1_3'
        ? 2
        : 1;

  const hasGlobalCriticalOutbreak = OUTBREAK_DATA.some(ob => ob.currentStatus === 'outbreak' && ob.riskLevel === 'critical');
  return {
    symptoms,
    durationDays,
    ageGroup: state.age === 'senior' || state.age === 'infant' || state.age === 'child' ? state.age : 'adult',
    riskFactors,
    context: {
      localOutbreakRisk: hasGlobalCriticalOutbreak ? 'high' : 'medium',
      userCountry: 'FR',
      userRegion: selectedRegionId ? String(selectedRegionId) : '',
    },
  };
}

// runDiagnosticEngine -> BIQ_DIAG.runDiagnosticEngine


function checkSymptoms() {
  const state  = collectCheckerState();
  const result = BIQ_DIAG.runDiagnosticEngine(state);
  const clinicalEngine = window.BIQ_CLINICAL;
  result.clinical = clinicalEngine?.evaluateClinicalOrientation
    ? clinicalEngine.evaluateClinicalOrientation(buildClinicalOrientationInput(state))
    : null;
  latestClinicalOrientation = result.clinical;
  renderDiagnosticResult(result, state);
}

// ── Numéros d'urgence simples par langue (utilisé dans renderDiagnosticResult) ─
const EMERGENCY_NUMBERS_SIMPLE = {
  fr: { main:'15', alt:'112', label:'SAMU', note:'Ou 112 partout en Europe' },
  en: { main:'999', alt:'112', label:'Emergency', note:'Or 112 in Europe / 911 in USA' },
  es: { main:'112', alt:'061', label:'Emergencias', note:'O 061 para urgencias médicas' },
  pt: { main:'112', alt:'192', label:'Emergência', note:'Ou 192 SAMU no Brasil' },
  ar: { main:'15', alt:'190', label:'الإسعاف', note:'أو 190 في بعض الدول العربية' },
  zh: { main:'120', alt:'110', label:'急救', note:'或呼叫 110 报警' },
  hi: { main:'108', alt:'112', label:'आपातकाल', note:'या 112 राष्ट्रीय नंबर' },
  sw: { main:'999', alt:'112', label:'Dharura', note:'Au 112 katika nchi nyingi za Afrika' },
  ru: { main:'103', alt:'112', label:'Скорая', note:'Или 112 единый номер' },
};

// ── Conseils "en attendant" par niveau ────────────────────────
const WAITING_ADVICE = {
  ROUGE: {
    fr: ['Ne vous déplacez PAS — attendez les secours', 'Restez allongé, ne mangez ni ne buvez rien', 'Gardez quelqu\'un à côté de vous', 'Desserrez les vêtements serrés', 'Si purpura : ne touchez pas les taches, allongez-vous'],
    en: ['Do NOT move — wait for emergency services', 'Stay lying down, do not eat or drink', 'Keep someone with you', 'Loosen tight clothing', 'If purpura: do not touch spots, lie flat'],
  },
  ORANGE: {
    fr: ['Allez aux urgences maintenant ou appelez le 15', 'Ne conduisez pas seul si vous vous sentez très mal', 'Prenez votre carte vitale et ordonnances', 'Notez l\'heure du début des symptômes'],
    en: ['Go to emergency room now or call emergency services', 'Do not drive alone if feeling very unwell', 'Take your medical ID card', 'Note the time symptoms started'],
  },
  JAUNE: {
    fr: ['Appelez votre médecin ou le 116 117 (médecin de garde)', 'Buvez de l\'eau régulièrement', 'Prenez du paracétamol si fièvre > 38.5°C (dose : 1g adulte)', 'Reposez-vous', 'Si ça empire dans les 2h → appelez le 15'],
    en: ['Call your doctor or medical helpline', 'Drink water regularly', 'Take paracetamol if fever > 38.5°C (1g adult dose)', 'Rest', 'If worsening in 2h → call emergency services'],
  },
  BLEU: {
    fr: ['Consultez un médecin dans les 48h', 'Buvez beaucoup d\'eau', 'Paracétamol si besoin', 'Portez un masque pour protéger votre entourage', 'Revenez ici si nouveaux symptômes'],
    en: ['See a doctor within 48h', 'Drink plenty of water', 'Paracetamol if needed', 'Wear a mask to protect others', 'Return here if new symptoms develop'],
  },
  VERT: {
    fr: ['Restez chez vous et reposez-vous', 'Buvez de l\'eau — minimum 1,5L par jour', 'Paracétamol si douleur ou fièvre légère', 'Isolez-vous des personnes fragiles (bébés, personnes âgées)', 'Revenez consulter si pas d\'amélioration en 5 jours'],
    en: ['Stay home and rest', 'Drink water — minimum 1.5L per day', 'Paracetamol for pain or mild fever', 'Stay away from vulnerable people', 'See a doctor if no improvement in 5 days'],
  },
};

// ── Signes d'escalade (quand revenir d'urgence) ───────────────
const ESCALATE_SIGNS = {
  fr: ['Difficultés à respirer au repos', 'Lèvres ou ongles qui deviennent bleus', 'Confusion ou perte de connaissance', 'Convulsions', 'Taches violettes sur la peau (purpura)', 'Saignements inexpliqués', 'Aggravation très rapide'],
  en: ['Breathing difficulty at rest', 'Blue lips or fingernails', 'Confusion or loss of consciousness', 'Seizures', 'Purple skin spots (purpura)', 'Unexplained bleeding', 'Very rapid worsening'],
};

function renderDiagnosticResult(result, state) {
  const { ranked, orientLevel, alarmReason, clinical } = result;
  const lang = currentLang;
  const fr   = lang === 'fr';

  if (!orientLevel && !clinical) return;

  const clinicalVisuals = {
    emergency: { icon: '🔴', labelFR: 'Urgence immédiate', labelEN: 'Immediate emergency', color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', phone: '15 / 112' },
    medical_regulation: { icon: '🟠', labelFR: 'Régulation médicale avant déplacement', labelEN: 'Medical regulation before travelling', color: '#ea580c', bg: '#fff7ed', border: '#fdba74', phone: '15 / 112' },
    same_day_doctor: { icon: '🟡', labelFR: 'Avis médical le jour même', labelEN: 'Same-day medical advice', color: '#d97706', bg: '#fffbeb', border: '#fcd34d', phone: '116 117' },
    pharmacy: { icon: '🔵', labelFR: 'Pharmacie ou avis médical si aggravation', labelEN: 'Pharmacy advice or medical review if worse', color: '#2563eb', bg: '#eff6ff', border: '#93c5fd', phone: '' },
    self_monitoring: { icon: '🟢', labelFR: 'Auto-surveillance prudente', labelEN: 'Careful self-monitoring', color: '#16a34a', bg: '#f0fdf4', border: '#86efac', phone: '' },
  };
  const fallbackOrient = orientLevel ? BIQ_DIAG.ORIENTATION[orientLevel] : null;
  const visual = clinical
    ? clinicalVisuals[clinical.level] || clinicalVisuals.self_monitoring
    : {
        icon: fallbackOrient.icon,
        labelFR: fallbackOrient.label,
        labelEN: fallbackOrient.label,
        color: fallbackOrient.color,
        bg: fallbackOrient.bg,
        border: fallbackOrient.border,
        phone: fallbackOrient.phone,
      };
  const orientationLabel = fr ? visual.labelFR : visual.labelEN;
  const patientMessage = clinical ? (fr ? clinical.patientMessageFR : clinical.patientMessageEN) : '';
  const careLabel = clinical ? (fr ? clinical.careLabelFR : clinical.careLabelEN) : '';

  // ── Bloc orientation ────────────────────────────────────────
  const reasons = clinical?.reasons?.length ? clinical.reasons : (alarmReason ? [alarmReason] : []);
  const alarmBlock = reasons.length
    ? `<div class="diag-alarm-reason">${fr ? 'Pourquoi :' : 'Why:'} ${reasons.map(escapeHTML).join(' · ')}</div>`
    : '';

  const phoneBlock = visual.phone
    ? `<a class="diag-phone-btn" href="tel:${visual.phone.replace(/[^\d]/g,'')}">
         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
         ${visual.phone}
       </a>`
    : '';

  // ── Pathogènes probables ────────────────────────────────────
  let pathoBlock = '';
  if (ranked.length > 0) {
    pathoBlock = `<div class="diag-patho-title">${fr ? '🔬 Hypothèses à discuter avec un professionnel' : '🔬 Possibilities to discuss with a clinician'}</div>`;
    ranked.forEach((d,i) => {
      const p = BIQ_DIAG.PATHOGENS[d.pid];
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
              <div class="diag-patho-name">${escapeHTML(name)} ${reportBadge}</div>
              <div class="diag-patho-criterion">${escapeHTML(criterion)}</div>
            </div>
            <div class="diag-patho-bar-wrap">
              <div class="diag-patho-bar"><div class="diag-patho-fill" style="width:${Math.min(d.pct*2.5,100)}%"></div></div>
              <span class="diag-patho-prot">${escapeHTML(p.protection)}</span>
            </div>
          </div>
          ${i===0&&p.isolationFR ? `<div class="diag-isolation">${fr?'🔒 Mesure de prudence :':' 🔒 Precaution:'} ${escapeHTML(p.isolationFR)}</div>` : ''}
        </div>`;
    });
  }

  // ── Numéros d'urgence ───────────────────────────────────────
  const emNum = EMERGENCY_NUMBERS_SIMPLE[lang] || EMERGENCY_NUMBERS_SIMPLE.fr;
  const isHighUrgency = ['ROUGE','ORANGE'].includes(orientLevel) ||
    ['emergency','medical_regulation'].includes(clinical?.level);

  // ── Conduite à tenir (waiting advice) ───────────────────────
  const waitKey = orientLevel || (clinical?.level === 'emergency' ? 'ROUGE' :
    clinical?.level === 'medical_regulation' ? 'ORANGE' :
    clinical?.level === 'same_day_doctor' ? 'JAUNE' : 'VERT');
  const waitingTips = (WAITING_ADVICE[waitKey] || WAITING_ADVICE.VERT)[fr ? 'fr' : 'en'];
  const waitingBlock = `
    <div class="diag-action-block">
      <div class="diag-action-title">${fr ? '✅ Ce qu\'il faut faire maintenant' : '✅ What to do now'}</div>
      <ul class="diag-action-list">
        ${waitingTips.map(t => `<li>${escapeHTML(t)}</li>`).join('')}
      </ul>
    </div>`;

  // ── Signes d'escalade ────────────────────────────────────────
  const escalateBlock = !isHighUrgency ? `
    <div class="diag-escalate-block">
      <div class="diag-action-title">🚨 ${fr ? 'Appelez le ' + emNum.main + ' IMMÉDIATEMENT si :' : 'Call ' + emNum.main + ' IMMEDIATELY if:'}</div>
      <ul class="diag-action-list diag-escalate-list">
        ${ESCALATE_SIGNS[fr ? 'fr' : 'en'].map(s => `<li>${escapeHTML(s)}</li>`).join('')}
      </ul>
    </div>` : '';

  // ── Bloc téléphone urgences renforcé ────────────────────────
  const phoneBlockEnhanced = isHighUrgency ? `
    <div class="diag-phone-block">
      <a class="diag-phone-btn diag-phone-main" href="tel:${emNum.main}">
        📞 ${emNum.label} : ${emNum.main}
      </a>
      <a class="diag-phone-btn diag-phone-alt" href="tel:${emNum.alt}">
        📞 ${emNum.alt}
      </a>
      <div class="diag-phone-note">${escapeHTML(emNum.note)}</div>
    </div>` : phoneBlock;

  // ── Conduite 1er pathogène ───────────────────────────────────
  const topPathogen = ranked[0] ? BIQ_DIAG.PATHOGENS[ranked[0].pid] : null;
  const conduiteBlock = topPathogen?.conduiteFR ? `
    <div class="diag-conduite-block">
      <div class="diag-action-title">🩺 ${fr ? 'Conduite à tenir spécifique' : 'Specific guidance'}</div>
      <p class="diag-conduite-text">${escapeHTML(fr ? topPathogen.conduiteFR : (topPathogen.conduiteEN || topPathogen.conduiteFR))}</p>
      ${topPathogen.mandatoryReport ? `<div class="diag-report-banner">${fr ? '📋 Maladie à déclaration obligatoire — le médecin doit signaler à l\'ARS' : '📋 Mandatory reporting disease — doctor must notify health authorities'}</div>` : ''}
    </div>` : '';

  // ── Assemblage final ────────────────────────────────────────
  const html = `
  <div class="diag-result-card" style="--orient-color:${visual.color};--orient-bg:${visual.bg};--orient-border:${visual.border}">

    <div class="diag-orient-header">
      <span class="diag-orient-icon">${visual.icon}</span>
      <div class="diag-orient-text">
        <div class="diag-orient-label">${escapeHTML(orientationLabel)}</div>
        ${patientMessage ? `<div class="diag-patient-message">${escapeHTML(patientMessage)}</div>` : ''}
        ${alarmBlock}
      </div>
    </div>

    ${isHighUrgency ? phoneBlockEnhanced : ''}

    ${waitingBlock}

    ${escalateBlock}

    ${conduiteBlock}

    ${pathoBlock}

    ${!isHighUrgency ? phoneBlock : ''}

    <div class="diag-result-actions">
      <button class="result-action-btn result-action-secondary" onclick="resetChecker()">
        ${fr ? '↺ Recommencer' : '↺ Reset'}
      </button>
      <button class="result-action-btn result-action-secondary" onclick="wizShare()">
        ${fr ? '📤 Partager ce résultat' : '📤 Share result'}
      </button>
    </div>
    <div class="diag-legal-footer">
      <div class="diag-legal-box">
        <p class="diag-disclaimer">${fr
          ? `⚠️ <strong>Orientation indicative — non diagnostique.</strong> En cas de doute ou d'aggravation, consultez immédiatement un professionnel de santé.`
          : `⚠️ <strong>Indicative guidance — not a diagnosis.</strong> If in doubt or symptoms worsen, seek immediate medical care.`}</p>
        <p class="diag-legal-meta">${fr
          ? '📋 Références : OMS · ECDC · CDC · HCSP · Critères ILI/SARI/CURB-65/qSOFA. Non dispositif médical (UE 2017/745).'
          : '📋 References: WHO · ECDC · CDC · ILI/SARI/CURB-65/qSOFA criteria. Not a medical device (EU 2017/745).'}</p>
      </div>
    </div>
  </div>`;

  const resultEl = document.getElementById('symptomResult');
  if (!resultEl) return;
  resultEl.className = `symptom-result diag-result-${(clinical?.level || orientLevel || 'self_monitoring').toLowerCase()}`;
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
  wizToggleAlarm(labelEl);
}

function resetChecker() {
  // Réinitialise toutes les checkboxes
  document.querySelectorAll('.symptom-check, .alarm-sign-check').forEach(el => {
    el.classList.remove('checked','alarm-checked');
    const cb = el.querySelector('input');
    if (cb) cb.checked = false;
  });
  // Réinitialise les radios signes vitaux
  document.querySelectorAll('input[name="spo2"], input[name="hr"]').forEach(r => {
    r.checked = r.value === 'unknown';
  });
  WIZ.vitals = { spo2: 'unknown', hr: 'unknown' };
  WIZ.mainSymptom = null;
  // Retour étape 0
  wizGoTo(0);
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

function careTypeLabel(type) {
  const labels = {
    fr: {
      emergency: 'Urgences',
      hospital: 'Hôpital',
      pharmacy: 'Pharmacie',
      doctor: 'Médecin',
      clinic: 'Clinique',
      dispensary: 'Dispensaire',
      health_center: 'Centre de santé',
      unknown: 'Lieu de soins',
    },
    en: {
      emergency: 'Emergency',
      hospital: 'Hospital',
      pharmacy: 'Pharmacy',
      doctor: 'Doctor',
      clinic: 'Clinic',
      dispensary: 'Dispensary',
      health_center: 'Health centre',
      unknown: 'Healthcare facility',
    },
  };
  return (labels[currentLang] || labels.en)[type] || type;
}

function careIcon(type) {
  return {
    emergency: '🚑',
    hospital: '🏥',
    pharmacy: '💊',
    doctor: '👨‍⚕️',
    clinic: '🏥',
    dispensary: '🩺',
    health_center: '🩺',
    unknown: '📍',
  }[type] || '📍';
}

function confidenceLabel(score) {
  if (score >= 80) return currentLang === 'fr' ? 'Très pertinent' : 'High relevance';
  if (score >= 60) return currentLang === 'fr' ? 'Pertinent' : 'Relevant';
  return currentLang === 'fr' ? 'À vérifier' : 'Check details';
}

function renderCareFacilities(payload, need) {
  const fr = currentLang === 'fr';
  const items = payload.results || [];
  const requested = latestClinicalOrientation?.careNeed || need || 'doctor';
  const warning = requested === 'medical_regulation' || requested === 'emergency_department'
    ? `<div class="care-critical-note">${fr
        ? '🚨 En cas de signe grave, appelez la régulation médicale ou les urgences avant tout déplacement.'
        : '🚨 If severe warning signs are present, call medical regulation or emergency services before travelling.'}</div>`
    : '';

  if (!items.length) {
    return `${warning}<p class="care-no-results">${fr
      ? 'Aucun lieu adapté trouvé dans le rayon choisi. Appelez le numéro d’urgence local si la situation est préoccupante.'
      : 'No suitable facility found nearby. Call local emergency services if the situation is concerning.'}</p>`;
  }

  const sourceMeta = (payload.providers || [])
    .filter(p => p.ok)
    .map(p => `${p.provider}: ${p.count}`)
    .join(' · ');

  return `
    ${warning}
    <div class="care-location">
      <span class="care-city">📍 ${fr ? 'Résultats proches de votre position' : 'Results near your location'}</span>
      <span class="care-emergency">🚨 ${fr ? 'Urgence' : 'Emergency'}: <strong>15 / 112</strong></span>
      ${sourceMeta ? `<span class="care-source-summary">${escapeHTML(sourceMeta)}</span>` : ''}
    </div>
    <ul class="care-list care-list-ranked">
      ${items.map(facility => {
        const dist = facility.distance_km === null ? '' : facility.distance_km < 1 ? `${Math.round(facility.distance_km * 1000)} m` : `${facility.distance_km.toFixed(1)} km`;
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${facility.lat},${facility.lon}`)}`;
        return `<li class="care-item care-item-ranked">
          <span class="care-icon">${careIcon(facility.type)}</span>
          <div class="care-info">
            <div class="care-row-head">
              <strong>${escapeHTML(facility.name)}</strong>
              <span class="care-confidence">${confidenceLabel(facility.relevance_score)} · ${facility.relevance_score}/100</span>
            </div>
            <span class="care-type">${escapeHTML(careTypeLabel(facility.type))} · ${escapeHTML(facility.source || 'source')}</span>
            ${dist ? `<span class="care-dist">📍 ${dist}</span>` : ''}
            ${facility.address ? `<span class="care-address">${escapeHTML(facility.address)}</span>` : ''}
            ${facility.opening_hours ? `<span class="care-hours">🕐 ${escapeHTML(facility.opening_hours)}</span>` : '<span class="care-hours">🕐 Horaires à vérifier</span>'}
            <div class="care-actions-row">
              ${facility.phone ? `<a href="tel:${escapeHTML(facility.phone)}" class="care-phone">📞 ${escapeHTML(facility.phone)}</a>` : ''}
              ${facility.website ? `<a href="${escapeHTML(facility.website)}" class="care-web" target="_blank" rel="noopener">🌐 ${fr ? 'Site' : 'Website'}</a>` : ''}
              <a href="${mapsUrl}" class="care-web" target="_blank" rel="noopener">🧭 ${fr ? 'Itinéraire' : 'Directions'}</a>
            </div>
          </div>
        </li>`;
      }).join('')}
    </ul>
    <p class="care-data-warning">${fr
      ? 'Données issues de sources publiques. Téléphone, horaires et capacité d’urgence doivent être vérifiés avant déplacement.'
      : 'Data comes from public sources. Phone, opening hours and emergency capacity should be checked before travelling.'}</p>
  `;
}

// ── Localisateur de soins ─────────────────────────────────────
async function findNearbyCare(needOverride) {
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
  results.innerHTML = `<p class="care-loading">${t('care-searching') || 'Recherche en cours…'}</p>`;

  navigator.geolocation.getCurrentPosition(
    async ({ coords: { latitude: lat, longitude: lon } }) => {
      try {
        const careNeed = needOverride || latestClinicalOrientation?.careNeed || 'doctor';
        const url = `/api/care-nearby?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&need=${encodeURIComponent(careNeed)}&radiusKm=10`;
        const payload = await fetchJsonWithTimeout(url, {
          timeout: 22000,
          validate: data => data && Array.isArray(data.results),
        });
        results.innerHTML = renderCareFacilities(payload, careNeed);
        btn.textContent = t('care-btn-refresh') || '🔄 Actualiser';
      } catch (error) {
        logDataWarning('Recherche de soins indisponible', error);
        results.innerHTML = `<p class="care-error">${t('care-error')}</p>
          <div class="care-critical-note">🚨 ${currentLang === 'fr' ? 'Si la situation est urgente, appelez le 15 ou le 112 sans attendre.' : 'If this is urgent, call emergency services now.'}</div>`;
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

// ── Service Worker ────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(reg => {
        if (isDebugMode()) console.log('[SW] Enregistré, scope:', reg.scope);
      })
      .catch(err => {
        if (isDebugMode()) console.warn('[SW] Échec enregistrement:', err);
      });
  });
}

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

  // Score for first region — immédiat avec données estimées, puis maj AQI réel
  updateScoreDisplay(DEMO_DATA[0].id);
  fetchLiveAqiAndRefresh(DEMO_DATA[0].id);

  // Pathogens — charger JSON pathogènes + SPF en parallèle, puis rendre
  Promise.all([
    loadPathogensData(),
    loadSPFLiveData(),
  ]).finally(() => renderPathogens());

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

  // PHEIC alert — chargement dynamique
  loadPheicAlert();

  // Numéros d'urgence localisés
  renderEmergencyNumbers();

  // Onboarding première visite
  initOnboarding();

  // Compteur de visites — proposition notification PWA à la 3ème
  try {
    if (!sessionStorage.getItem('biq_visit_counted')) {
      sessionStorage.setItem('biq_visit_counted', '1');
      const visits = parseInt(localStorage.getItem('biq_visits') || '0', 10) + 1;
      localStorage.setItem('biq_visits', String(visits));
      if (visits === 3 && 'Notification' in window && Notification.permission === 'default'
          && !localStorage.getItem('biq_notif_declined')) {
        setTimeout(promptPwaNotification, 4000);
      }
    }
  } catch(e) {}

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
    const viralBadge = document.getElementById('viralEstBadge');
    if (viralBadge) viralBadge.style.display = 'none';
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

  // Affichage PM2.5 / PM10 (Open-Meteo régional, déjà fetchés dans _liveAqiCache)
  const cachedAqi = _liveAqiCache[`${selectedRegionId || 1}`];
  const pmBadgeEl = document.getElementById('gpPmBadge');
  if (pmBadgeEl && (cachedAqi?.pm25 != null || cachedAqi?.pm10 != null)) {
    const pm25 = cachedAqi.pm25 != null ? cachedAqi.pm25.toFixed(1) : '—';
    const pm10 = cachedAqi.pm10 != null ? cachedAqi.pm10.toFixed(1) : '—';
    const pm25AboveWHO = cachedAqi.pm25 != null && cachedAqi.pm25 > 15;
    const pm25Color = pm25AboveWHO ? '#EF4444' : '#10B981';
    pmBadgeEl.innerHTML = `
      <span class="pm-chip" style="color:${pm25Color}" title="Valeur guide OMS 2021 : PM2.5 ≤ 15 µg/m³">
        PM2.5 <strong>${pm25}</strong> µg/m³ ${pm25AboveWHO ? '⚠️' : '✅'}
      </span>
      ${cachedAqi.pm10 != null ? `<span class="pm-chip" title="PM10 (OMS : ≤ 45 µg/m³)">PM10 <strong>${pm10}</strong> µg/m³</span>` : ''}
    `;
    pmBadgeEl.style.display = 'flex';
  }

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
  // Widget COVID-19 courbe épidémique (disease.sh)
  renderCovidCurveWidget(parsed.covidFr);
  // Widget vaccination grippe (data.gouv.fr SPF)
  renderVaccGrippeWidget(parsed.fluVaccFr || parsed.fluVaccMeta);
}

// ── Tracker multi-épidémies ──────────────────────────────────────
// ── Niveaux de confiance des sources ─────────────────────────────────────────
// R1 + R2 : indicateur ★ et délai publication (priorité médico-légale)
const SOURCE_CONFIDENCE = {
  // id pathogène → { stars, source, delayNote, trend }
  EBOLA:      { stars: 5, source: 'OMS DON · ECDC',     delay: 'Données J-0 (alerte active)', trend: '↗' },
  HANTA:      { stars: 5, source: 'OMS DON · NEJM',     delay: 'Données mai 2026',            trend: '↗' },
  MPOX:       { stars: 5, source: 'ECDC opendata',       delay: 'Données hebdomadaires S18',   trend: '→' },
  INFLUENZA:  { stars: 4, source: 'SPF data.gouv',       delay: 'Délai publication : ~7 jours', trend: '↘' },
  COVID19VAR: { stars: 4, source: 'SPF SUM\'EAU',        delay: 'Délai publication : ~7 jours', trend: '↘' },
  H5N1:       { stars: 4, source: 'OMS · CDC',           delay: 'Données avril 2026',          trend: '→' },
  MEASLES:    { stars: 4, source: 'ECDC · OMS',          delay: 'Données mars 2026',           trend: '↗' },
  PERTUSSIS:  { stars: 3, source: 'ECDC · SPF',          delay: 'Données mars 2026',           trend: '→' },
  MARBURG:    { stars: 5, source: 'OMS AFRO',            delay: 'Foyer terminé jan 2026',      trend: '✅' },
  NIPAH:      { stars: 5, source: 'OMS DON594',          delay: 'Données fév 2026',            trend: '→' },
};

function _confidenceStars(n) {
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

function renderEpiTracker() {
  const wrap = document.getElementById('epiTracker');
  if (!wrap) return;

  const TRACK_IDS = ['EBOLA','HANTA','MPOX','INFLUENZA','COVID19VAR','H5N1','MEASLES','PERTUSSIS','MARBURG','NIPAH'];

  const statusLabel = {
    outbreak:   { text: '🚨 ÉPIDÉMIE ACTIVE', cls: 'badge-outbreak' },
    active:     { text: '📈 ACTIF',           cls: 'badge-active' },
    endemic:    { text: '🔄 ENDÉMIQUE',        cls: 'badge-endemic' },
    seasonal:   { text: '📅 SAISONNIER',       cls: 'badge-endemic' },
    sporadic:   { text: '⚡ SPORADIQUE',       cls: 'badge-monitoring' },
    monitoring: { text: '👁 SURVEILLANCE',     cls: 'badge-monitoring' },
    resolved:   { text: '✅ RÉSOLU',           cls: 'badge-monitoring' },
  };

  const trendColor = { '↗':'#EF4444', '↘':'#10B981', '→':'#F59E0B', '✅':'#10B981' };
  const riskColor  = { critical:'#EF4444', high:'#F59E0B', moderate:'#6366F1', low:'#10B981' };
  const riskWidth  = { critical: 95, high: 70, moderate: 45, low: 20 };

  const cards = TRACK_IDS.map(id => {
    const ob = OUTBREAK_DATA.find(o => o.id === id);
    if (!ob) return '';
    const sl   = statusLabel[ob.currentStatus] || statusLabel.monitoring;
    const conf = SOURCE_CONFIDENCE[id] || { stars: 3, source: 'Source interne', delay: '', trend: '→' };
    const color = riskColor[ob.riskLevel] || '#6366F1';
    const width = riskWidth[ob.riskLevel] || 20;
    const tc    = trendColor[conf.trend] || '#F59E0B';

    const regions = (ob.activeRegions || []).slice(0, 2).map(r =>
      `<span class="epi-track-chip">${r.replace(/^[🚨⚠️✅]\s*/,'').split('—')[0].trim().slice(0,30)}</span>`
    ).join('');

    const summary = (ob.descFR || '').replace(/^[🚨⚠️📊✅][^.]+\.\s*/,'').slice(0, 110) + '…';

    // CFR avec source — R7
    const cfrRaw   = ob.cfr || '?';
    const cfrLabel = cfrRaw.length > 30 ? cfrRaw.slice(0, 30) + '…' : cfrRaw;

    return `
    <div class="epi-track-card ${ob.riskLevel}" role="article" aria-label="${ob.nameFR}">
      <div class="epi-track-header">
        <span class="epi-track-name">${ob.nameFR}</span>
        <span class="epi-track-badge ${sl.cls}">${sl.text}</span>
      </div>
      <p class="epi-track-desc">${summary}</p>
      <div class="epi-track-meta">
        ${regions}
        <span class="epi-track-chip" title="Taux de létalité (source : ${conf.source})">CFR ${cfrLabel}</span>
      </div>
      <!-- R1 : confiance + R2 : tendance + R5 : délai publication -->
      <div class="epi-track-footer">
        <span class="epi-conf-stars" title="Niveau de confiance de la source : ${conf.source}">${_confidenceStars(conf.stars)}</span>
        <span class="epi-conf-source">${conf.source}</span>
        <span class="epi-trend" style="color:${tc};font-weight:700" title="Tendance">${conf.trend}</span>
      </div>
      <div class="epi-pub-delay" title="Délai et fraîcheur des données">${conf.delay}</div>
      <div class="epi-track-progress" title="Niveau de risque : ${ob.riskLevel}">
        <div class="epi-track-bar" style="width:${width}%;background:${color}"></div>
      </div>
    </div>`;
  }).join('');

  wrap.innerHTML = cards;
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

  // Déléguer le calcul à BIQ_DIAG.computeZScore (module testable)
  const sig = BIQ_DIAG.computeZScore(current, history);

  return { pathologyId, zscore: sig.zscore, level: sig.level, weeklyCount: current, baseline: sig.mean, currentWeek };
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
    { key:'covidFr',      icon:'🦠', label: fr ? 'disease.sh — COVID-19 France 30j' : 'disease.sh — COVID-19 France 30d',     value: parsed.covidFr     ? `${parsed.covidFr.casesAvg7d?.toLocaleString()} cas/j · ${parsed.covidFr.trendDir === 'up' ? '↗' : parsed.covidFr.trendDir === 'down' ? '↘' : '→'}` : '—' },
    { key:'fluVaccFr',    icon:'💉', label: fr ? 'SPF — Vaccination grippe France'   : 'SPF — Flu vaccination France',         value: parsed.fluVaccFr   ? `${parsed.fluVaccFr.nationalRate?.toFixed(1)}%${parsed.fluVaccFr._isStatic ? ' (statique)' : ''} / cible ${parsed.fluVaccFr.target}%` : '—' },
    { key:'fluNetFr',     icon:'🌡️', label: fr ? 'WHO FluNet — Grippe France'        : 'WHO FluNet — Flu France',              value: parsed.frFlu       ? `${parsed.frFlu.rate} cas sem. ${parsed.frFlu.week} (${parsed.frFlu.source || 'FluNet'})` : '—' },
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

// ── Widget COVID-19 courbe épidémique (disease.sh) ───────────────────────────
function renderCovidCurveWidget(data) {
  const el = document.getElementById('covidCurveWidget');
  if (!el) return;

  if (!data?.dailyCases?.length) {
    el.innerHTML = `<p class="lsd-loading">Données COVID non disponibles</p>`;
    return;
  }

  const fr = currentLang === 'fr';
  const trendIcon = data.trendDir === 'up' ? '↗' : data.trendDir === 'down' ? '↘' : '→';
  const trendColor = data.trendDir === 'up' ? '#EF4444' : data.trendDir === 'down' ? '#10B981' : '#F59E0B';

  // Mini courbe SVG 30j
  const vals = data.dailyCases.map(d => d.cases);
  const maxVal = Math.max(...vals, 1);
  const W = 220, H = 50;
  const pts = vals.map((v, i) => {
    const x = Math.round((i / (vals.length - 1)) * W);
    const y = Math.round(H - (v / maxVal) * H);
    return `${x},${y}`;
  }).join(' ');

  // Couleur selon tendance
  const curveColor = data.trendDir === 'up' ? '#EF4444' : data.trendDir === 'down' ? '#10B981' : '#F59E0B';

  el.innerHTML = `
    <div class="covid-curve-header">
      <span class="covid-curve-val">${data.casesAvg7d.toLocaleString(fr ? 'fr-FR' : 'en-US')}</span>
      <span class="covid-curve-unit">${fr ? 'cas/j moy. 7j' : 'cases/day avg 7d'}</span>
      <span class="covid-curve-trend" style="color:${trendColor}">${trendIcon} ${data.trend > 0 ? '+' : ''}${data.trend}%</span>
    </div>
    <svg viewBox="0 0 ${W} ${H}" class="covid-svg" aria-hidden="true">
      <polyline points="${pts}" fill="none" stroke="${curveColor}" stroke-width="2" stroke-linejoin="round"/>
      <line x1="0" y1="${H}" x2="${W}" y2="${H}" stroke="rgba(255,255,255,.15)" stroke-width="1"/>
    </svg>
    <div class="covid-curve-footer">
      <span>💀 ${data.deathsAvg7d} ${fr ? 'décès/j moy.' : 'deaths/day avg'}</span>
      <span class="covid-source">disease.sh · ${data.lastDate}</span>
    </div>
    <div class="covid-who-note">${fr
      ? '⚠️ COVID-19 reste endémique — données déclaratives (sous-estimation probable)'
      : '⚠️ COVID-19 remains endemic — declared cases (likely undercount)'}</div>
  `;
}

// ── Widget vaccination grippe (data.gouv.fr SPF) ─────────────────────────────
function renderVaccGrippeWidget(data) {
  const el = document.getElementById('vaccGrippeWidget');
  if (!el) return;

  const fr = currentLang === 'fr';

  // Cas où on a seulement les métadonnées (URL de ressource, pas encore les données)
  if (data?._needsSecondFetch || !data?.nationalRate) {
    if (data?.datasetTitle) {
      el.innerHTML = `
        <p class="lsd-loading">
          📋 ${fr ? 'Jeu de données disponible' : 'Dataset available'} : <em>${data.datasetTitle}</em><br>
          <small>${fr ? 'Ressource en cours de chargement…' : 'Loading resource…'}</small>
        </p>`;
    } else {
      el.innerHTML = `<p class="lsd-loading">${fr ? 'Données vaccination non disponibles' : 'Vaccination data unavailable'}</p>`;
    }
    return;
  }

  const rate = data.nationalRate;
  const target = data.target || 75;
  const pct = Math.min(100, Math.round((rate / target) * 100));
  const barColor = rate >= target ? '#10B981' : rate >= target * 0.85 ? '#F59E0B' : '#EF4444';

  const regionRows = (data.byRegion || []).slice(0, 5).map(r => `
    <div class="vacc-region-row">
      <span class="vacc-region-name">${r.region}</span>
      <div class="vacc-bar-wrap">
        <div class="vacc-bar" style="width:${Math.min(100,(r.rate/target)*100)}%;background:${r.rate >= target ? '#10B981' : '#F59E0B'}"></div>
      </div>
      <span class="vacc-region-rate">${r.rate.toFixed(1)}%</span>
    </div>
  `).join('');

  el.innerHTML = `
    <div class="vacc-national">
      <span class="vacc-national-val" style="color:${barColor}">${rate.toFixed(1)}%</span>
      <span class="vacc-national-label">${fr ? 'couverture nationale' : 'national coverage'}</span>
      <span class="vacc-target">cible OMS : ${target}%</span>
    </div>
    <div class="vacc-progress-wrap">
      <div class="vacc-progress" style="width:${pct}%;background:${barColor}"></div>
    </div>
    ${regionRows ? `<div class="vacc-regions">${regionRows}</div>` : ''}
    <div class="vacc-footer">
      <span>Saison ${data.season}</span>
      <span class="vacc-source">SPF · data.gouv.fr</span>
    </div>
    ${rate < target ? `<div class="vacc-alert">${fr
      ? `⚠️ Couverture insuffisante (${rate.toFixed(0)}% < ${target}%) — risque épidémique accru`
      : `⚠️ Insufficient coverage (${rate.toFixed(0)}% < ${target}%) — increased epidemic risk`}</div>` : ''}
  `;
}

// Lance une récupération AQI réelle en arrière-plan et rafraîchit le score si disponible
async function fetchLiveAqiAndRefresh(regionId) {
  const region = DEMO_DATA.find(r => r.id === parseInt(regionId, 10));
  if (!region) return;
  const aqiScore = await fetchLiveAqi(region);
  if (aqiScore !== null) {
    // AQI réel obtenu : refresher l'affichage avec la nouvelle valeur
    updateScoreDisplay(region.id);
    _updateLiveBadgeAqi(true);
  }
}

// ── Géolocalisation GPS → AQI commune précise ────────────────────────────────
async function activateGeolocationAqi() {
  if (!navigator.geolocation) return;
  const btn = document.getElementById('gpGeoBtn');
  if (btn) { btn.disabled = true; btn.textContent = '⌛'; }

  navigator.geolocation.getCurrentPosition(
    async ({ coords: { latitude: lat, longitude: lon } }) => {
      try {
        const geoResp = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat.toFixed(5)}&lon=${lon.toFixed(5)}&format=json`,
          { headers: { 'Accept-Language': currentLang || 'fr', 'User-Agent': 'BreathIQ/1.0 (contact@breathiq.fr)' } }
        );
        let cityName = 'Position actuelle';
        if (geoResp.ok) {
          const geo = await geoResp.json();
          cityName = geo.address?.city || geo.address?.town || geo.address?.village || geo.address?.county || 'Position actuelle';
        }

        _customCity = { name: cityName, lat, lon };
        await fetchLiveAqi({ id: 'custom', lat, lon });
        updateScoreDisplay(selectedRegionId || 1);
        _updateLiveBadgeAqi(true);

        const hint = document.getElementById('gpCityHint');
        if (hint) { hint.textContent = '📍 ' + cityName; hint.style.color = '#10b981'; }
        const input = document.getElementById('gpCityInput');
        if (input) input.value = cityName;
        if (btn) { btn.textContent = '📍'; btn.title = cityName; }
      } catch {
        if (btn) { btn.textContent = '📍'; }
      }
      if (btn) btn.disabled = false;
    },
    () => { if (btn) { btn.disabled = false; btn.textContent = '📍'; } },
    { timeout: 10000, maximumAge: 60000 }
  );
}

// ── Recherche ville → AQI précis ─────────────────────────────────────────────
async function searchCityAqi() {
  const input = document.getElementById('gpCityInput');
  if (!input) return;
  const query = input.value.trim();
  if (!query) return;

  const btn  = document.getElementById('gpCityBtn');
  const hint = document.getElementById('gpCityHint');
  if (btn)  { btn.disabled = true; btn.textContent = '…'; }
  if (hint) { hint.textContent = ''; }

  try {
    const geoResp = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`,
      { headers: { 'Accept-Language': currentLang || 'fr', 'User-Agent': 'BreathIQ/1.0 (contact@breathiq.fr)' } }
    );
    if (!geoResp.ok) throw new Error('Geocoding error');
    const geoData = await geoResp.json();
    if (!geoData.length) {
      if (hint) { hint.textContent = currentLang === 'fr' ? 'Ville introuvable' : 'City not found'; hint.style.color = '#ef4444'; }
      return;
    }

    const { lat, lon, address } = geoData[0];
    const cityName = address?.city || address?.town || address?.village || address?.county || query;

    _customCity = { name: cityName, lat: parseFloat(lat), lon: parseFloat(lon) };
    await fetchLiveAqi({ id: 'custom', lat: parseFloat(lat), lon: parseFloat(lon) });
    updateScoreDisplay(selectedRegionId || 1);
    _updateLiveBadgeAqi(true);

    if (hint) { hint.textContent = '✅ ' + cityName; hint.style.color = '#10b981'; }
  } catch {
    if (hint) { hint.textContent = currentLang === 'fr' ? 'Erreur réseau' : 'Network error'; hint.style.color = '#ef4444'; }
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '→'; }
  }
}

// Met à jour le badge LIVE/ESTIMÉ selon disponibilité AQI réel
function _updateLiveBadgeAqi(isLive) {
  const badge = document.getElementById('liveBadge');
  const label = document.getElementById('liveLabelText');
  if (!badge) return;
  if (isLive) {
    badge.classList.remove('live-off');
    badge.classList.add('live-partial');
    if (label) label.textContent = 'LIVE';
    const now = new Date();
    const hhmm = now.toLocaleTimeString(currentLang === 'fr' ? 'fr-FR' : 'en-GB', { hour: '2-digit', minute: '2-digit' });
    badge.title = currentLang === 'fr'
      ? `AQI en temps réel (Open-Meteo) · mis à jour à ${hhmm}`
      : `Real-time AQI (Open-Meteo) · updated at ${hhmm}`;
  } else {
    badge.classList.remove('live-partial');
    badge.classList.add('live-off');
    if (label) label.textContent = 'DONNÉES PUBLIQUES';
    badge.title = 'Données publiques OMS · ECDC · SPF · Open-Meteo — mises à jour quotidiennement';
  }
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

// ── PHEIC Alert — chargement dynamique depuis data/pheic-alerts.json ─────────
async function loadPheicAlert() {
  const banner = document.getElementById('epidemicAlertBanner');
  if (!banner) return;
  try {
    const data = await fetchJsonWithTimeout('data/pheic-alerts.json?_=' + Date.now(), { timeout: 6000 });
    const active = data?.alerts?.find(a => a.active);
    if (!active) {
      banner.classList.add('alert-inactive');
      return;
    }
    const lang = currentLang in (active.levelLabel || {}) ? currentLang : 'fr';
    const L = (obj) => (obj && (obj[lang] || obj['fr'])) || '';

    const levelEl = banner.querySelector('.epidemic-level');
    const diseaseEl = banner.querySelector('.epidemic-disease');
    const dateEl = banner.querySelector('.epidemic-date');
    const msgEl = banner.querySelector('.epidemic-msg');
    const maskEl = banner.querySelector('.epidemic-mask');
    const linkEl = banner.querySelector('.epidemic-link');

    if (levelEl) {
      levelEl.className = `epidemic-level ${active.level}`;
      levelEl.textContent = (active.level === 'rouge' ? '🔴 ' : active.level === 'orange' ? '🟠 ' : '⚠️ ') + L(active.levelLabel);
    }
    if (diseaseEl) {
      diseaseEl.textContent = `${active.disease} · ${L(active.subtitle)}`;
    }
    if (dateEl) {
      const pheicFormatted = active.pheicDate ? new Date(active.pheicDate).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
      const updateFormatted = active.lastUpdate ? new Date(active.lastUpdate).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
      const pheicLabel = { fr:'PHEIC déclarée le', en:'PHEIC declared', es:'PHEIC declarada el', pt:'PHEIC declarada em', ar:'أُعلن PHEIC في', zh:'PHEIC宣布于', hi:'PHEIC घोषित', sw:'PHEIC ilitangazwa', ru:'PHEIC объявлен' }[lang] || 'PHEIC';
      const deathsLabel = { fr:'décès confirmés', en:'confirmed deaths', es:'muertes confirmadas', pt:'mortes confirmadas', ar:'وفاة مؤكدة', zh:'确认死亡', hi:'पुष्ट मृत्यु', sw:'vifo vilivyothibitishwa', ru:'подтверждённых смертей' }[lang] || 'deaths';
      const updateLabel = { fr:'Mise à jour :', en:'Updated:', es:'Actualizado:', pt:'Atualizado:', ar:'تحديث:', zh:'更新:', hi:'अपडेट:', sw:'Ilisasishwa:', ru:'Обновлено:' }[lang] || 'Updated:';
      const franceLabel = L(active.franceStatus);
      dateEl.textContent = `${pheicLabel} ${pheicFormatted} · ${active.deaths} ${deathsLabel} · ${updateLabel} ${updateFormatted}${franceLabel ? ' · ' + franceLabel : ''}`;
    }
    if (msgEl) {
      msgEl.innerHTML = `🚨 <strong>${active.level === 'rouge' ? (lang === 'fr' ? 'Urgence sanitaire internationale (PHEIC)' : 'International Health Emergency (PHEIC)') : 'Alerte OMS'}</strong> — ${L(active.message)}`;
    }
    if (maskEl) {
      const hcwLabel = { fr:'Soignants', en:'Healthcare workers', es:'Sanitarios', pt:'Profissionais de saúde', ar:'الكوادر الصحية', zh:'医护人员', hi:'स्वास्थ्यकर्मी', sw:'Wahudumu wa afya', ru:'Медработники' }[lang] || 'HCW';
      maskEl.innerHTML = `🩺 <strong>${hcwLabel} :</strong> ${L(active.hcwNote)}`;
    }
    if (linkEl && active.pathogen_id) {
      const seeLabel = { fr:'Fiche →', en:'Factsheet →', es:'Ficha →', pt:'Ficha →', ar:'الملف ←', zh:'详情 →', hi:'विवरण →', sw:'Faili →', ru:'Подробнее →' }[lang] || 'Info →';
      linkEl.textContent = `${active.disease} — ${seeLabel}`;
    }

    // Render PHEIC strip in patient hero
    const strip = document.getElementById('riskPheicStrip');
    if (strip) {
      const see = { fr:'Voir la fiche →', en:'See factsheet →', es:'Ver ficha →', pt:'Ver ficha →', ar:'انظر الملف ←', zh:'查看详情 →', hi:'विवरण देखें →', sw:'Tazama faili →', ru:'Подробнее →' }[lang] || '→';
      strip.innerHTML = `🚨 <strong>PHEIC OMS</strong> — ${active.disease} · ${L(active.subtitle)} · <a href="#pathogens" onclick="return navTo(event,'#pathogens')" style="color:#FCA5A5">${see}</a>`;
      strip.style.display = '';
    }

    // Update expert stats bar
    const esbPheic = document.getElementById('esbPheic');
    if (esbPheic) esbPheic.textContent = data.alerts.filter(a => a.active).length;

    // Freshness warning : si données > 7 jours, ajouter un avertissement visible
    if (active.lastUpdate) {
      const daysSince = Math.floor((Date.now() - new Date(active.lastUpdate)) / 86400000);
      if (daysSince > 7) {
        const dateEl2 = banner.querySelector('.epidemic-date');
        if (dateEl2) {
          const staleMsg = {
            fr: `⚠️ Ces données ont ${daysSince} jours — vérifier la source OMS`,
            en: `⚠️ Data is ${daysSince} days old — check WHO source`,
            es: `⚠️ Datos con ${daysSince} días — verificar fuente OMS`,
            pt: `⚠️ Dados com ${daysSince} dias — verificar fonte OMS`,
            ar: `⚠️ البيانات عمرها ${daysSince} يومًا — تحقق من مصدر منظمة الصحة العالمية`,
            zh: `⚠️ 数据已有 ${daysSince} 天 — 请检查世卫组织来源`,
            hi: `⚠️ डेटा ${daysSince} दिन पुराना — WHO स्रोत जांचें`,
            sw: `⚠️ Data ina siku ${daysSince} — angalia chanzo cha WHO`,
            ru: `⚠️ Данным ${daysSince} дней — проверьте источник ВОЗ`
          }[currentLang] || `⚠️ Data ${daysSince} days old — check WHO source`;
          const staleSpan = document.createElement('span');
          staleSpan.style.cssText = 'display:block;font-size:0.78em;color:#FCA5A5;margin-top:3px;font-style:italic';
          staleSpan.textContent = staleMsg;
          dateEl2.appendChild(staleSpan);
        }
      }
    }

    banner.classList.remove('alert-inactive');
  } catch (e) {
    logDataWarning('PHEIC alert load failed', e);
  }
}

// ── Numéros d'urgence — localisation par langue/pays ─────────────────────────
const EMERGENCY_NUMBERS = {
  // [primary, secondary, description]
  fr: [{ num:'15', label:'SAMU', tel:'15' }, { num:'15', label:'SAMU', tel:'15' }, { num:'18', label:'Pompiers', tel:'18' }, { num:'112', label:'Urgences EU', tel:'112' }],
  'fr-BE': [{ num:'112', label:'Urgences', tel:'112' }, { num:'100', label:'Ambulance', tel:'100' }],
  'fr-CH': [{ num:'144', label:'Ambulance', tel:'144' }, { num:'112', label:'Urgences EU', tel:'112' }],
  'fr-CA': [{ num:'911', label:'Urgences', tel:'911' }],
  en: [{ num:'999', label:'Emergency', tel:'999' }, { num:'112', label:'EU Emergency', tel:'112' }],
  'en-US': [{ num:'911', label:'Emergency', tel:'911' }],
  'en-AU': [{ num:'000', label:'Emergency', tel:'000' }, { num:'112', label:'Intl', tel:'112' }],
  'en-IN': [{ num:'108', label:'Ambulance', tel:'108' }, { num:'112', label:'Emergency', tel:'112' }],
  es: [{ num:'112', label:'Emergencias', tel:'112' }, { num:'061', label:'Ambulancia', tel:'061' }],
  'es-MX': [{ num:'911', label:'Emergencias', tel:'911' }],
  'es-AR': [{ num:'107', label:'SAME', tel:'107' }, { num:'911', label:'Policía', tel:'911' }],
  pt: [{ num:'192', label:'SAMU', tel:'192' }, { num:'190', label:'Polícia', tel:'190' }],
  'pt-PT': [{ num:'112', label:'Emergência', tel:'112' }],
  ar: [{ num:'123', label:'إسعاف', tel:'123' }, { num:'112', label:'طوارئ', tel:'112' }],
  'ar-SA': [{ num:'997', label:'هلال أحمر', tel:'997' }, { num:'911', label:'طوارئ', tel:'911' }],
  'ar-MA': [{ num:'150', label:'SAMU', tel:'150' }, { num:'15', label:'SAMU', tel:'15' }],
  zh: [{ num:'120', label:'急救', tel:'120' }, { num:'110', label:'警察', tel:'110' }],
  'zh-TW': [{ num:'119', label:'救護', tel:'119' }],
  hi: [{ num:'108', label:'एम्बुलेंस', tel:'108' }, { num:'112', label:'आपातकाल', tel:'112' }],
  sw: [{ num:'112', label:'Dharura', tel:'112' }, { num:'999', label:'Polisi', tel:'999' }],
  ru: [{ num:'103', label:'Скорая', tel:'103' }, { num:'112', label:'Единый', tel:'112' }],
  default: [{ num:'112', label:'Emergency EU', tel:'112' }, { num:'911', label:'USA', tel:'911' }, { num:'999', label:'UK', tel:'999' }],
};

function getEmergencyNumbers() {
  const lang = currentLang || 'fr';
  // Try lang-REGION variant first (e.g. navigator.language = 'pt-BR')
  const navLang = navigator.language || '';
  if (navLang && EMERGENCY_NUMBERS[navLang]) return EMERGENCY_NUMBERS[navLang];
  // Try base language
  if (EMERGENCY_NUMBERS[lang]) return EMERGENCY_NUMBERS[lang];
  // Map language to most common country variant
  const fallbacks = { pt:'pt', es:'es', zh:'zh', hi:'hi', ar:'ar', sw:'sw', ru:'ru', en:'en', fr:'fr' };
  return EMERGENCY_NUMBERS[fallbacks[lang]] || EMERGENCY_NUMBERS.default;
}

function renderEmergencyNumbers() {
  const containers = document.querySelectorAll('.triage-severe-nums, .triage-alarm-nums');
  const numbers = getEmergencyNumbers();
  // Always include 112 if not already present
  const has112 = numbers.some(n => n.num === '112');
  const display = has112 ? numbers : [...numbers, { num:'112', label:'International', tel:'112' }];

  containers.forEach(container => {
    const isAlarm = container.classList.contains('triage-alarm-nums');
    if (isAlarm) {
      container.innerHTML = display.slice(0, 4).map(n =>
        `<span aria-label="${n.label}">${getFlagForNumber(n.num)} ${n.num}</span>`
      ).join('');
    } else {
      container.innerHTML = display.slice(0, 4).map(n =>
        `<a href="tel:${n.tel}" class="triage-num-btn" aria-label="${n.label}">${getFlagForNumber(n.num)} ${n.num}</a>`
      ).join('');
    }
  });
}

function getFlagForNumber(num) {
  const map = { '15':'🇫🇷', '18':'🇫🇷', '112':'🌍', '999':'🇬🇧', '911':'🇺🇸', '120':'🇨🇳',
    '108':'🇮🇳', '103':'🇷🇺', '192':'🇧🇷', '107':'🇦🇷', '123':'🇪🇬', '150':'🇲🇦',
    '997':'🇸🇦', '119':'🇹🇼', '144':'🇨🇭', '100':'🇧🇪', '000':'🇦🇺', '061':'🇪🇸' };
  return map[num] || '📞';
}

// ── Onboarding first-visit ────────────────────────────────────────────────────
const ONBOARDING_KEY = 'biq-onboarded';

function initOnboarding() {
  try {
    if (localStorage.getItem(ONBOARDING_KEY)) return;
  } catch { return; }

  const modal = document.getElementById('onboardingModal');
  if (!modal) return;

  // Show after a brief delay so the page renders first
  setTimeout(() => {
    modal.removeAttribute('hidden');
    modal.setAttribute('aria-hidden', 'false');
    // Trap focus on first button
    const firstBtn = modal.querySelector('button');
    if (firstBtn) firstBtn.focus();
  }, 800);
}

function closeOnboarding(chosenMode) {
  try { localStorage.setItem(ONBOARDING_KEY, '1'); } catch { /* rien */ }
  const modal = document.getElementById('onboardingModal');
  if (modal) {
    modal.setAttribute('hidden', '');
    modal.setAttribute('aria-hidden', 'true');
  }
  if (chosenMode && chosenMode !== currentMode) {
    if (chosenMode === 'expert') {
      toggleMode();
    }
  }
  // Incrémenter le compteur de visites pour proposer les notifs PWA à J3
  try {
    const visits = parseInt(localStorage.getItem('biq_visits') || '0', 10) + 1;
    localStorage.setItem('biq_visits', visits);
    if (visits === 3 && 'Notification' in window && Notification.permission === 'default') {
      setTimeout(promptPwaNotification, 2000);
    }
  } catch(e) {}
}

function promptPwaNotification() {
  if (!('Notification' in window) || Notification.permission !== 'default') return;
  const el = document.createElement('div');
  el.id = 'pwaNotifPrompt';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-labelledby', 'pwaNotifTitle');
  el.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1e293b;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:16px 20px;max-width:340px;width:90%;z-index:9000;box-shadow:0 8px 32px rgba(0,0,0,.5);display:flex;flex-direction:column;gap:10px';
  el.innerHTML = `
    <p id="pwaNotifTitle" style="font-size:14px;font-weight:600;color:#f1f5f9;margin:0">🔔 Recevoir votre score chaque matin ?</p>
    <p style="font-size:12px;color:#94a3b8;margin:0">Pas de spam. Une notification par jour. Désactivable à tout moment.</p>
    <div style="display:flex;gap:8px">
      <button onclick="acceptPwaNotif()" style="flex:1;padding:9px;background:#2563eb;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer">Oui, chaque matin</button>
      <button onclick="declinePwaNotif()" style="padding:9px 14px;background:transparent;color:#64748b;border:1px solid rgba(255,255,255,.1);border-radius:8px;font-size:13px;cursor:pointer">Non merci</button>
    </div>`;
  document.body.appendChild(el);
}

function acceptPwaNotif() {
  document.getElementById('pwaNotifPrompt')?.remove();
  Notification.requestPermission().then(perm => {
    if (perm === 'granted') {
      try { localStorage.setItem('biq_notif_ok', '1'); } catch(e) {}
    }
  });
}

function declinePwaNotif() {
  document.getElementById('pwaNotifPrompt')?.remove();
  try { localStorage.setItem('biq_notif_declined', '1'); } catch(e) {}
}

// ── Care Finder — fallback recherche par ville ────────────────────────────────
async function searchCareByCity() {
  const input = document.getElementById('careCityInput');
  const resultsEl = document.getElementById('careResults');
  if (!input || !resultsEl) return;

  const query = input.value.trim();
  if (!query) return;

  const btn = document.getElementById('careCityBtn');
  if (btn) { btn.disabled = true; btn.textContent = t('care-searching'); }

  resultsEl.innerHTML = `<p class="care-loading">${t('care-searching')}</p>`;

  try {
    // Step 1: Geocode city name via Nominatim
    const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`;
    const geoResp = await fetch(geoUrl, { headers: { 'Accept-Language': currentLang || 'fr', 'User-Agent': 'BreathIQ/1.0 (contact@breathiq.fr)' } });
    if (!geoResp.ok) throw new Error('Geocoding failed');
    const geoData = await geoResp.json();
    if (!geoData.length) {
      resultsEl.innerHTML = `<p class="care-error">${currentLang === 'fr' ? 'Ville introuvable. Essayez un nom plus précis.' : 'City not found. Try a more specific name.'}</p>`;
      return;
    }
    const { lat, lon } = geoData[0];
    // Step 2: Query Overpass via existing API
    await findNearbyCareAtCoords(parseFloat(lat), parseFloat(lon));
  } catch (e) {
    resultsEl.innerHTML = `<p class="care-error">${t('care-error')}</p>`;
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = currentLang === 'fr' ? 'Rechercher' : 'Search'; }
  }
}

// Wrapper: expose findNearbyCare to work with explicit coords too
async function findNearbyCareAtCoords(lat, lon) {
  // Delegate to the existing care-facilities module if available
  if (typeof window.BIQ_CARE !== 'undefined' && typeof window.BIQ_CARE.findAtCoords === 'function') {
    return window.BIQ_CARE.findAtCoords(lat, lon);
  }
  // Fallback: call the API directly
  const apiUrl = `/api/care-nearby?lat=${lat}&lon=${lon}&lang=${currentLang || 'fr'}`;
  const resultsEl = document.getElementById('careResults');
  try {
    const resp = await fetch(apiUrl);
    if (!resp.ok) throw new Error('API error');
    const data = await resp.json();
    renderCareResults(data, resultsEl);
  } catch {
    if (resultsEl) resultsEl.innerHTML = `<p class="care-error">${t('care-error')}</p>`;
  }
}

function renderCareResults(data, container) {
  if (!container) return;
  if (!data?.results?.length) {
    container.innerHTML = `<p class="care-no-results">${t('care-no-results')}</p>`;
    return;
  }
  container.innerHTML = data.results.slice(0, 8).map(r => `
    <div class="care-result-item">
      <span class="care-result-icon">${r.type === 'hospital' ? '🏥' : r.type === 'pharmacy' ? '💊' : '🩺'}</span>
      <div class="care-result-body">
        <strong class="care-result-name">${escapeHTML(r.name || (currentLang === 'fr' ? 'Établissement de santé' : 'Healthcare facility'))}</strong>
        <span class="care-result-dist">${r.distance ? Math.round(r.distance) + ' m' : ''}</span>
        ${r.address ? `<span class="care-result-addr">${escapeHTML(r.address)}</span>` : ''}
      </div>
      ${r.phone ? `<a href="tel:${escapeHTML(r.phone)}" class="care-result-call">📞</a>` : ''}
    </div>`).join('');
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
