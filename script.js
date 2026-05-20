'use strict';

// ============================================================
// BREATHIQ v1.1 — Intelligence respiratoire mondiale
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
    'nav-stocks': 'Stocks EPI',
    'nav-pathogens': 'Pathogènes',
    'nav-protection': 'Protection',
    'nav-about': 'À propos',
    'hero-badge': 'Intelligence respiratoire · Données mondiales',
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
    'pathogens-title': 'Pathogènes respiratoires sous surveillance',
    'pathogens-subtitle': 'Revue infectiologique des agents pathogènes nécessitant une protection FFP2/N95 ou équivalent.',
    'filter-all': 'Tous',
    'filter-pandemic': 'Pandémique',
    'filter-epidemic': 'Épidémique',
    'filter-endemic': 'Endémique',
    'filter-emerging': 'Émergent',
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
    'author-bio': 'Service d\'information médicale à vocation éducative et préventive. Non dispositif médical au sens du Règlement (UE) 2017/745. Ne constitue ni acte médical, ni consultation médicale, ni diagnostic individuel.',
    'trust-open-title': '100% Open & Libre',
    'trust-open-desc': 'Accès sans compte, sans inscription, sans tracking publicitaire. Aucune donnée de santé collectée. Conformité RGPD totale.',
    'trust-sources-title': 'Sources vérifiables',
    'trust-sources-desc': 'Données issues de l\'OMS, ECDC, data.gouv.fr, Eurostat et CDC. Toutes les sources sont citées et vérifiables publiquement.',
    'trust-legal-title': 'Protection juridique',
    'trust-legal-desc': 'Base de données protégée — droit sui generis Art. L341-1 CPI. Toute reproduction à des fins d\'entraînement IA est expressément interdite.',
    'disclaimer-title': 'Non-dispositif médical — Important',
    'disclaimer-text': 'BreathIQ est exclusivement un outil d\'information publique. Il ne constitue pas un dispositif médical et n\'émet pas de recommandations médicales individuelles. Pour tout conseil médical, consultez un professionnel de santé.',
    'footer-tagline': 'Intelligence respiratoire mondiale',
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
    'pathogens-patient-title': 'Maladies respiratoires — quels symptômes surveiller ?',
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
  },
  en: {
    'nav-score': 'My Score',
    'nav-map': 'World Map',
    'nav-stocks': 'EPI Stocks',
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
    'pathogens-title': 'Respiratory pathogens under surveillance',
    'pathogens-subtitle': 'Infectiological review of pathogens requiring FFP2/N95 or equivalent protection. Sources: WHO, CDC, ECDC, peer-reviewed literature.',
    'filter-all': 'All',
    'filter-pandemic': 'Pandemic',
    'filter-epidemic': 'Epidemic',
    'filter-endemic': 'Endemic',
    'filter-emerging': 'Emerging',
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
    'author-bio': 'Educational and preventive health information service. Not a medical device under Regulation (EU) 2017/745. Does not constitute a medical act, consultation, or individual diagnosis.',
    'trust-open-title': '100% Open & Free',
    'trust-open-desc': 'No account, no registration, no advertising tracking. No health data collected. Full GDPR compliance.',
    'trust-sources-title': 'Verifiable sources',
    'trust-sources-desc': 'Data from WHO, ECDC, data.gouv.fr, Eurostat and CDC. All sources are cited and publicly verifiable.',
    'trust-legal-title': 'Legal protection',
    'trust-legal-desc': 'Database protected — sui generis right Art. L341-1 CPI. Any reproduction for AI training is expressly prohibited.',
    'disclaimer-title': 'Not a medical device — Important',
    'disclaimer-text': 'BreathIQ is exclusively a public information tool. It does not constitute a medical device and does not issue individual medical recommendations. For medical advice, consult a healthcare professional.',
    'footer-tagline': 'Global respiratory intelligence',
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
    'patient-hero-badge': 'Respiratory surveillance · Free access',
    'symptom-checker-title': 'Do I have symptoms I should be worried about?',
    'symptom-checker-intro': 'Check what you feel to identify the risk and know what to do',
    'checker-btn-text': 'Analyse my symptoms →',
    'action-guide-title': 'What to do if you have respiratory symptoms?',
    'action-guide-subtitle': '3 simple immediate actions to protect yourself and others',
    'expert-toggle-label': '⚙️ Show technical data (Expert Mode)',
    'expert-toggle-note': 'Respiratory indices, world map, protection guide — for professionals and the curious',
    'pathogens-patient-title': 'Respiratory diseases — which symptoms to watch for?',
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
  const labelEl = document.getElementById('langLabel');
  if (labelEl) labelEl.textContent = LANG_LABELS[currentLang] || currentLang.toUpperCase();
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
function renderPathogens() {
  const grid = document.getElementById('pathogensGrid');
  if (!grid) return;

  const filtered = currentFilter === 'all'
    ? OUTBREAK_DATA
    : OUTBREAK_DATA.filter(ob => ob.category === currentFilter);

  const riskColors = { critical:'#EF4444', high:'#F97316', moderate:'#F59E0B', low:'#10B981' };
  const riskLabels = {
    fr: { critical:'Risque critique', high:'Risque élevé', moderate:'Risque modéré', low:'Risque faible' },
    en: { critical:'Critical risk', high:'High risk', moderate:'Moderate risk', low:'Low risk' }
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
    const name = currentLang === 'fr' ? ob.nameFR : ob.nameEN;
    const desc = currentLang === 'fr' ? ob.descFR : ob.descEN;
    const riskColor = riskColors[ob.riskLevel] || '#6B7280';
    const riskLabel = (riskLabels[currentLang] || riskLabels.fr)[ob.riskLevel] || ob.riskLevel;
    const catLabel  = (categoryLabels[currentLang] || categoryLabels.fr)[ob.category] || ob.category;
    const statLabel = (statusLabels[currentLang] || statusLabels.fr)[ob.currentStatus] || ob.currentStatus;

    const protBadgeClass = ob.protectionLevel >= 3 ? 'prot-ffp3' : ob.protectionLevel === 2 ? 'prot-ffp2' : 'prot-surg';

    const refList = ob.references
      ? ob.references.map(r => `<li>${r}</li>`).join('')
      : '';

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

      ${(() => {
        const symp = SYMPTOMS_DATA[ob.id];
        if (!symp) return '';
        const sympList = (currentLang === 'fr' ? symp.fr : symp.en) || [];
        const alarmList = (currentLang === 'fr' ? symp.alarmFR : symp.alarmEN) || [];
        const isoNote = currentLang === 'fr' ? symp.isolationFR : symp.isolationEN;
        return `
        <div class="pc-symptoms-section">
          <div class="pc-symptoms-title">🤒 ${currentLang === 'fr' ? 'Symptômes à surveiller' : 'Symptoms to watch for'}</div>
          <div class="pc-symptom-tags">${sympList.map(s => `<span class="pc-symptom-tag">${s}</span>`).join('')}</div>
        </div>
        ${alarmList.length ? `<div class="pc-alarm-section">
          <div class="pc-alarm-title">⚠️ ${currentLang === 'fr' ? 'Signes d\'alarme — Urgence médicale' : 'Alarm signs — Medical emergency'}</div>
          <ul class="pc-alarm-list">${alarmList.map(a => `<li>${a}</li>`).join('')}</ul>
        </div>` : ''}
        <div class="pc-isolation-note">🏠 ${isoNote || ''}</div>`;
      })()}

      <div class="pc-meta">
        <div class="pc-meta-item">
          <span class="pc-meta-label">${currentLang==='fr'?'R₀ / Reff':'R₀ / Reff'}</span>
          <span class="pc-meta-val">${ob.reproductionNumber}</span>
        </div>
        <div class="pc-meta-item">
          <span class="pc-meta-label">${currentLang==='fr'?'Létalité (CFR)':'Case Fatality Rate'}</span>
          <span class="pc-meta-val">${ob.cfr}</span>
        </div>
        <div class="pc-meta-item">
          <span class="pc-meta-label">${currentLang==='fr'?'Incubation':'Incubation'}</span>
          <span class="pc-meta-val">${ob.incubation}</span>
        </div>
        <div class="pc-meta-item">
          <span class="pc-meta-label">${currentLang==='fr'?'Transmission':'Transmission'}</span>
          <span class="pc-meta-val">${ob.transmission_route.substring(0,80)}…</span>
        </div>
      </div>

      ${ob.maskNote ? `<div class="pc-mask-note">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        ${ob.maskNote}
      </div>` : ''}

      ${refList ? `<details class="pc-refs">
        <summary>${currentLang==='fr'?'Références scientifiques':'Scientific references'} (${ob.references.length})</summary>
        <ul>${refList}</ul>
      </details>` : ''}
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
  // Lang toggle
  document.getElementById('langToggle')?.addEventListener('click', () => {
    const idx = (LANG_CYCLE.indexOf(currentLang) + 1) % LANG_CYCLE.length;
    setLang(LANG_CYCLE[idx]);
    buildRegionSelector();
  });

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
  currentMode = currentMode === 'patient' ? 'expert' : 'patient';
  localStorage.setItem('biq-mode', currentMode);
  document.body.dataset.mode = currentMode;
  updateModeToggleBtn();
  if (currentMode === 'expert') {
    setTimeout(() => {
      if (!worldMap) initMapWhenReady();
      else worldMap.invalidateSize(true);
    }, 50);
  }
}

function updateModeToggleBtn() {
  const btn = document.getElementById('modeToggleBtn');
  if (!btn) return;
  const t = I18N[currentLang] || I18N.fr;
  btn.textContent = currentMode === 'patient'
    ? (t['mode-toggle-expert'] || '⚙️ Mode Expert')
    : (t['mode-toggle-patient'] || '👤 Mode Patient');
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

function checkSymptoms() {
  const checked = Array.from(document.querySelectorAll('.symptom-check input:checked')).map(cb => cb.value);
  if (checked.length === 0) return;

  const scores = {};
  checked.forEach(symptom => {
    (SYMPTOM_MAP[symptom] || []).forEach(pid => { scores[pid] = (scores[pid] || 0) + 1; });
  });
  const ranked = Object.entries(scores).sort((a,b) => b[1]-a[1]).slice(0,4);

  const hasBleeding   = checked.includes('bleeding');
  const hasConfusion  = checked.includes('confusion');
  const hasBreath     = checked.includes('breathlessness');
  const isAlarm       = hasBleeding || hasConfusion;
  const lang          = currentLang;
  const riskColors    = { critical:'#EF4444', high:'#F97316', moderate:'#F59E0B', low:'#10B981' };

  let html = '';
  if (isAlarm) {
    html = `<div class="result-header" style="color:#DC2626"><span>🚨</span><span>${lang==='fr'?'URGENCE — Appelez le 15 (SAMU) immédiatement':'EMERGENCY — Call emergency services immediately'}</span></div>
    <p style="font-size:.88rem;color:#7F1D1D;margin-bottom:.75rem">${lang==='fr'?'Les symptômes que vous décrivez nécessitent une évaluation médicale urgente. N\'attendez pas.':'The symptoms you describe require urgent medical evaluation. Do not wait.'}</p>`;
  } else if (hasBreath) {
    html = `<div class="result-header" style="color:#EA580C"><span>⚠️</span><span>${lang==='fr'?'Symptômes d\'alerte — Consultez un médecin rapidement':'Warning symptoms — See a doctor promptly'}</span></div>`;
  } else {
    html = `<div class="result-header" style="color:#1A3C5E"><span>🔍</span><span>${lang==='fr'?'Analyse de vos symptômes':'Symptom analysis'}</span></div>`;
  }

  if (ranked.length > 0) {
    html += `<p style="font-size:.84rem;color:var(--text-secondary);margin-bottom:.5rem">${lang==='fr'?'Maladies possibles à surveiller :':'Possible conditions to watch:'}</p><ul class="result-pathogen-list">`;
    ranked.forEach(([pid]) => {
      const ob = OUTBREAK_DATA.find(o => o.id === pid);
      if (!ob) return;
      const name = lang === 'fr' ? ob.nameFR : ob.nameEN;
      html += `<li><span><strong>${name}</strong> <small style="color:var(--text-muted)">— ${ob.incubation}</small></span><span style="font-size:.76rem;color:${riskColors[ob.riskLevel]};font-weight:600">${ob.protectionRequired}</span></li>`;
    });
    html += `</ul>`;
  }

  html += `<div class="result-actions">
    <button class="result-action-btn result-action-primary" onclick="document.getElementById('actionGuide')?.scrollIntoView({behavior:'smooth',block:'start'})">${lang==='fr'?'→ Que faire maintenant ?':'→ What to do now?'}</button>
    <button class="result-action-btn result-action-secondary" onclick="resetChecker()">${lang==='fr'?'Recommencer':'Reset'}</button>
  </div>
  <p style="font-size:.73rem;color:var(--text-muted);margin-top:.5rem">${lang==='fr'?'Outil indicatif — consultez toujours un médecin pour un diagnostic.':'Indicative tool — always consult a doctor for diagnosis.'}</p>`;

  const resultEl = document.getElementById('symptomResult');
  if (!resultEl) return;
  resultEl.className = `symptom-result ${isAlarm ? 'result-alarm' : hasBreath ? 'result-moderate' : 'result-ok'}`;
  resultEl.innerHTML = html;
  resultEl.classList.remove('hidden');
  resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

// ── Localisateur de soins ─────────────────────────────────────
async function findNearbyCare() {
  const btn = document.getElementById('findCareBtn');
  const results = document.getElementById('careResults');
  if (!btn || !results) return;

  btn.disabled = true;
  btn.textContent = t('care-searching') || 'Recherche en cours…';

  if (!navigator.geolocation) {
    results.innerHTML = `<p class="care-error">${t('care-no-geo')}</p>`;
    btn.disabled = false;
    btn.textContent = t('care-btn');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async ({ coords: { latitude: lat, longitude: lon } }) => {
      try {
        const [geoResp, ovResp] = await Promise.all([
          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
            headers: { 'Accept-Language': currentLang.substring(0,2), 'User-Agent': 'BreathIQ/1.0' }
          }),
          fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
            `[out:json][timeout:15];(node[amenity~"hospital|clinic|doctors|health_post"](around:10000,${lat},${lon}););out 10;`
          )}`),
        ]);

        const geoData = await geoResp.json();
        const ovData  = await ovResp.json();
        const addr    = geoData.address || {};
        const city    = addr.city || addr.town || addr.village || addr.county || '';
        const country = addr.country || '';
        const cc      = (addr.country_code || '').toUpperCase();
        const emerNum = getEmergencyNumber(cc);

        const facilities = (ovData.elements || [])
          .filter(el => el.tags?.name)
          .map(el => ({
            name:    el.tags.name,
            amenity: el.tags.amenity,
            phone:   el.tags.phone || el.tags['contact:phone'] || null,
            dist:    Math.round(Math.sqrt(
              Math.pow((el.lat - lat) * 111320, 2) +
              Math.pow((el.lon - lon) * 111320 * Math.cos(lat * Math.PI / 180), 2)
            )),
          }))
          .sort((a, b) => a.dist - b.dist)
          .slice(0, 6);

        let html = `<div class="care-location">
          <span class="care-city">📍 ${city}${country ? ', ' + country : ''}</span>
          <span class="care-emergency">🚨 ${currentLang === 'fr' ? 'Urgences' : 'Emergency'} : <strong>${emerNum}</strong></span>
        </div>`;

        if (facilities.length) {
          html += `<ul class="care-list">` + facilities.map(f => {
            const icon = f.amenity === 'hospital' ? '🏥' : f.amenity === 'clinic' ? '🏨' : '👨‍⚕️';
            const dist = f.dist < 1000 ? `${f.dist} m` : `${(f.dist/1000).toFixed(1)} km`;
            return `<li class="care-item">
              <span class="care-icon">${icon}</span>
              <div class="care-info">
                <strong>${f.name}</strong>
                <span class="care-dist">${dist}</span>
                ${f.phone ? `<a href="tel:${f.phone}" class="care-phone">📞 ${f.phone}</a>` : ''}
              </div>
            </li>`;
          }).join('') + `</ul>`;
        } else {
          html += `<p class="care-no-results">${t('care-no-results')}</p>`;
        }

        results.innerHTML = html;
        btn.textContent = t('care-btn-refresh') || '🔄 Actualiser';
      } catch {
        results.innerHTML = `<p class="care-error">${t('care-error')}</p>`;
        btn.textContent = t('care-btn');
      }
      btn.disabled = false;
    },
    () => {
      results.innerHTML = `<p class="care-error">${t('care-geo-denied')}</p>`;
      btn.disabled = false;
      btn.textContent = t('care-btn');
    },
    { timeout: 10000, maximumAge: 300000 }
  );
}

// Appliquer le mode immédiatement (pas besoin d'attendre DOMContentLoaded)
// car script.js est en bas du body — le DOM est déjà parsé
initMode();

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

  // Mise à jour du score viral (composante AQI + viral)
  const region = DEMO_DATA.find(r => r.id === (selectedRegionId || 1)) || DEMO_DATA[0];
  const score = generateScoreForRegion(region);

  if (parsed.frAqi?.aqiScore != null) {
    score.aqi = parsed.frAqi.aqiScore;
    score.sr  = Math.round(0.40 * score.aqi + 0.30 * score.viral + 0.15 * score.pollen + 0.15 * score.weather);
  }
  if (parsed.frFlu?.viralScore != null) {
    score.viral = parsed.frFlu.viralScore;
    score.sr    = Math.round(0.40 * score.aqi + 0.30 * score.viral + 0.15 * score.pollen + 0.15 * score.weather);
  }

  // Mise à jour bandeau de risque patient
  updatePatientRiskBanner();

  // Source tags sur les composantes du score
  const aqiComp = document.getElementById('comp-aqi-value');
  if (aqiComp && parsed.frAqi) {
    aqiComp.title = parsed.frAqi.label || '';
  }
  const viralComp = document.getElementById('comp-viral-value');
  if (viralComp && parsed.frFlu) {
    viralComp.title = parsed.frFlu.label || '';
  }

  // Horodatage dernière mise à jour
  const tsEl = document.getElementById('liveLastUpdate');
  if (tsEl) {
    const d = new Date();
    tsEl.textContent = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
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
