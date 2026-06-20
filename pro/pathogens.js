/* BreathIQ — Espace Soignant : Référentiel Pathogènes
   Outil d'information professionnelle — Non dispositif médical (UE 2017/745)
   Chargement lazy — uniquement sur demande explicite du soignant */

const BIQ_PRO = (() => {
'use strict';

// ─── BASE DE DONNÉES PATHOGÈNES ───────────────────────────────────────────────
const PRO_PATHOGENS = {

INFLUENZA: {
  id:'INFLUENZA', icon:'🤧', nameFR:'Grippe saisonnière / Influenza', nameEN:'Influenza',
  dangerLevel:'ORANGE',
  agent:'Influenza A, B, C (Orthomyxoviridae) — souches H3N2, H1N1pdm09, B/Victoria',
  famille:'ARN monocaténaire segmenté — enveloppé',
  incubation:'1–4 jours (médiane 2j)',
  contagiosite:'Élevée — R0 : 1,2–1,4 (saisonnier) / 2–3 (pandémique)',
  cfr:'<0,1% (saisonnier) — 2,5% (1918) — variable pandémique',
  reservoir:'Homme, porc, volailles — réservoir aviaire (H5N1/H7N9)',
  transmission:'Gouttelettes (< 1 m), aérosols (< 5 µm), contact surfaces',
  zonesEndemiques:'Mondiale — pic Oct-Mars (hémisphère nord), Avr-Sep (sud)',
  saisonalite:'Épidémie hivernale 8–12 sem — circulation inter-épidémique tropicale',
  phases:[
    {nom:'Invasion',duree:'24–48h',signes:['Fièvre brutale 39-40°C','Frissons','Céphalées frontales','Myalgies intenses']},
    {nom:'État',duree:'3–5j',signes:['Asthénie majeure','Toux sèche','Rhinorrhée','Anorexie']},
    {nom:'Résolution',duree:'7–10j',signes:['Défervescence progressive','Asthénie résiduelle','Toux persistante']},
  ],
  redFlags:['SpO2 < 94%','FR > 30/min','Confusion / somnolence','Cyanose','Détresse respiratoire','PAS < 90 mmHg','Aggravation après amélioration initiale (surinfection bactérienne)'],
  priseEnChargeImmediate:[
    'Précautions gouttelettes + contact (masque chirurgical patient)',
    'TDR Grippe si < 48h symptômes + signe de gravité ou immunodéprimé',
    'SpO2, FR, FC, conscience — évaluation clinique complète',
    'Hydratation, antipyrétiques (paracétamol — éviter AINS si grippal)',
    'Hospitalisation si FR > 30, SpO2 < 94%, confusion, comorbidité grave',
  ],
  traitementFR:'Oseltamivir (Tamiflu®) 75 mg x2/j x5j si < 48h symptômes ou facteur de risque. Zanamivir inhalé alternatif. Baloxavir marboxil dose unique si disponible. — Information soignant, prescription médicale obligatoire.',
  declarationObligatoire:false,
  declarationDetails:'Surveillance réseau Sentinelles + GROG — signalement volontaire',
  epiSoignant:['Masque chirurgical', 'Hygiène mains', 'FFP2 si geste aérosolisant'],
  isolementPatient:'Chambre seule ou regroupement géographique — 5j après début symptômes',
  pubmedQuery:'influenza treatment antiviral 2024 2025',
  pubmedMesh:'Influenza, Human[MeSH] AND (therapy[sh] OR antiviral agents[MeSH])',
  refOfficielle:'https://www.who.int/teams/global-influenza-programme',
},

COVID19: {
  id:'COVID19', icon:'🦠', nameFR:'COVID-19 (SARS-CoV-2)', nameEN:'COVID-19',
  dangerLevel:'ORANGE',
  agent:'SARS-CoV-2 (Betacoronavirus) — variants JN.1, KP.2, LB.1 en 2024-2025',
  famille:'ARN+ monocaténaire — enveloppé — spike protéine cible ACE2',
  incubation:'2–14 j (médiane 5j) — variants récents 2–4j',
  contagiosite:'Très élevée — R0 : 2–3 (ancestral 2020) / 8–15 (Omicron/XBB) / 10–18 (JN.1·KP.2 2024-2026)',
  cfr:'< 0,1% Omicron vacciné — 1–2% non vacciné personnes âgées',
  reservoir:'Humain exclusif (réservoir animal en surveillance)',
  transmission:'Aérosols +++, gouttelettes, contact surfaces (rare)',
  zonesEndemiques:'Mondiale — circulation endémique — vagues saisonnières',
  saisonalite:'Pics automne-hiver — vagues estivales variables selon variant',
  phases:[
    {nom:'Précoce',duree:'J1–J5',signes:['Fièvre modérée','Toux sèche','Fatigue','Anosmie/agueusie (variants anciens)']},
    {nom:'Pulmonaire',duree:'J5–J10',signes:['Dyspnée progressive','SpO2 dégradée','Toux persistante']},
    {nom:'Hyperinflammatoire',duree:'J10–J14',signes:['Orage cytokinique','SDRA','CIVD','Défaillance multiviscérale']},
  ],
  redFlags:['SpO2 < 92% (air ambiant)','FR > 30/min','Confusion aiguë','Cyanose centrale','Incapacité à parler complet','CRP > 100 ou ferritine > 1000','D-Dimères > 2000'],
  priseEnChargeImmediate:[
    'Isolement aérosol (FFP2 soignant, chambre individuelle)',
    'Test antigénique ou PCR nasopharyngée',
    'SpO2, FR, NEWS2 ou qSOFA',
    'Bilan biologique : NFS, CRP, D-dimères, ferritine, LDH, troponine si grave',
    'Oxygénothérapie si SpO2 < 94% — cible 94–98%',
  ],
  traitementFR:'Nirmatrelvir/ritonavir (Paxlovid®) si < 5j symptômes + FR élevé — Remdesivir IV hospitalier — Dexaméthasone 6mg/j si O2 requis. — Information soignant, prescription médicale obligatoire.',
  declarationObligatoire:false,
  declarationDetails:'SIDEP déclaration laboratoire — DGS-Urgent si cluster inhabituel',
  epiSoignant:['FFP2 obligatoire','Surblouse','Lunettes/visière si aérosolisant','Double gants'],
  isolementPatient:'Chambre individuelle — pression négative si disponible — 10j (5j si léger)',
  pubmedQuery:'COVID-19 SARS-CoV-2 treatment 2024 2025',
  pubmedMesh:'COVID-19[MeSH] AND (drug therapy[sh] OR antiviral agents[MeSH])',
  refOfficielle:'https://www.who.int/emergencies/diseases/novel-coronavirus-2019',
},

TUBERCULOSIS: {
  id:'TUBERCULOSIS', icon:'🫁', nameFR:'Tuberculose (Mycobacterium tuberculosis)', nameEN:'Tuberculosis',
  dangerLevel:'ORANGE',
  agent:'Mycobacterium tuberculosis (complexe MTBC) — BK — bacille acido-alcoolo-résistant',
  famille:'Actinobactérie — paroi riche en acides mycoliques',
  incubation:'2–12 semaines (primo-infection) — réactivation après années/décennies',
  contagiosite:'Modérée — R0 : 1,0–3,5 — bacillifère si caverne ou crachats positifs',
  cfr:'~50% si non traitée — < 5% si traitement adapté',
  reservoir:'Humain exclusif (complexe bovin : M. bovis)',
  transmission:'Aérosols (noyaux de Wells < 5µm) — contact prolongé en espace confiné',
  zonesEndemiques:'Mondiale — Asie du Sud (44%), Afrique sub-saharienne (25%) — haute prévalence LMIC',
  saisonalite:'Toute l\'année — pic de découvertes en hiver (confinement)',
  phases:[
    {nom:'Primo-infection',duree:'2–12 sem',signes:['Souvent asymptomatique','Virage IDR','Adénopathie hilaire']},
    {nom:'Tuberculose maladie',duree:'Semaines-mois',signes:['Toux > 3 sem','Hémoptysie','Sueurs nocturnes','Amaigrissement','Fièvre vespérale']},
    {nom:'Disséminée (miliaire)',duree:'Urgence',signes:['Fièvre prolongée','Dyspnée','Méningite','Atteinte hépatosplénique']},
  ],
  redFlags:['Hémoptysie abondante','Méningite tuberculeuse','Miliaire','SpO2 < 92%','Immunodépression sévère (CD4 < 200)','Multi-résistance (TB-MR)'],
  priseEnChargeImmediate:[
    'ISOLEMENT AÉRIEN IMMÉDIAT — chambre à pression négative',
    'Masque N95/FFP2 soignant — masque chirurgical patient',
    'ECBC x3 (expectoration ou aspiration) + BK direct + PCR GeneXpert',
    'Radio thorax face (caverne = contagiosité élevée)',
    'IDR ou IGRA (QuantiFERON-TB Gold)',
    'Déclaration obligatoire ARS < 24h',
    'Recherche contacts (enquête autour du cas)',
  ],
  traitementFR:'RHZE x2 mois puis RH x4 mois (Rifampicine + Isoniazide + Pyrazinamide + Éthambutol). TB-MR : protocole spécialisé centre référent. — Information soignant, prescription médicale obligatoire.',
  declarationObligatoire:true,
  declarationDetails:'DO ARS < 24h — Cerfa 12218*04 — Enquête autour du cas obligatoire',
  epiSoignant:['FFP2 obligatoire (aérosol)','Chambre pression négative','Port FFP2 en entrant'],
  isolementPatient:'Isolement aérien strict — minimum 2 semaines de traitement efficace + 3 ECBC négatifs',
  pubmedQuery:'tuberculosis treatment drug resistance 2024 2025',
  pubmedMesh:'Tuberculosis[MeSH] AND (drug therapy[sh] OR extensively drug-resistant tuberculosis[MeSH])',
  refOfficielle:'https://www.who.int/teams/global-tuberculosis-programme',
},

MALARIA: {
  id:'MALARIA', icon:'🦟', nameFR:'Paludisme (Plasmodium spp.)', nameEN:'Malaria',
  dangerLevel:'ROUGE',
  agent:'Plasmodium falciparum (80% formes graves), P. vivax, P. ovale, P. malariae, P. knowlesi',
  famille:'Protozoaire apicomplexe — cycle schizogonique hépatocytaire et érythrocytaire',
  incubation:'7–30j (falciparum) — 12–18j (vivax) — jusqu\'à 12 mois (vivax/ovale)',
  contagiosite:'Nulle inter-humain — vectorielle exclusive (Anopheles femelle)',
  cfr:'Falciparum non traité : 15–25% — Traité urgence : < 1% — Pédiatrique grave : 20%',
  reservoir:'Homme (hôte définitif) — Anopheles (vecteur/hôte intermédiaire)',
  transmission:'Piqûre Anopheles infecté nocturne — transfusion sanguine (rare) — congénital',
  zonesEndemiques:'Afrique sub-saharienne (90% des 608 000 décès/an OMS), Asie du Sud, Amériques tropicales',
  saisonalite:'Saison des pluies — multiplication vectorielle — toute l\'année en zones de transmission stable',
  phases:[
    {nom:'Phase froide',duree:'15–60 min',signes:['Frissons intenses en quintes','Pâleur','Sensation froid intense']},
    {nom:'Phase chaude',duree:'2–6h',signes:['Fièvre 40–41°C','Céphalées','Myalgies intenses','Nausées/vomissements']},
    {nom:'Phase de sueurs',duree:'2–4h',signes:['Sueurs profuses','Apyrexie transitoire','Asthénie majeure']},
  ],
  redFlags:['Confusion / coma (neuropaludisme)','Convulsions','Détresse respiratoire','Ictère (falciparum)','Hémoglobinurie (urines porto)','Prostration','Hypoglycémie < 2,2 mmol/L','Anémie sévère Hb < 7 g/dL','Parasitémie > 4%','Insuffisance rénale créat > 265 µmol/L'],
  priseEnChargeImmediate:[
    'URGENCE — NE PAS ATTENDRE si retour zone tropicale + fièvre',
    'Goutte épaisse + frottis + TDR IMMÉDIAT (< 2h)',
    'NFS, créatininémie, glycémie, bilirubine, LDH, coagulation',
    'Glasgow — évaluation neurologique',
    'Hospitalisation si : falciparum, signe de gravité, grossesse, enfant',
    'Glucosé 10% si hypoglycémie',
    'Déclaration DO si autochtone ou cas groupés',
  ],
  traitementFR:'Falciparum non compliqué : Artéméther/Luméfantrine (Riamet® ou Coartem®) 6 prises sur 3j. Falciparum grave : Artésunate IV (hôpital). Vivax/ovale : Chloroquine + Primaquine (après G6PD exclu). — Information soignant, prescription médicale obligatoire.',
  declarationObligatoire:false,
  declarationDetails:'Signalement si cas autochtone ou groupé — surveillance CNRP',
  epiSoignant:['Précautions standard uniquement','Pas de risque de transmission au soignant'],
  isolementPatient:'Non requis (non contagieux)',
  pubmedQuery:'malaria treatment artesunate 2024 2025',
  pubmedMesh:'Malaria[MeSH] AND (drug therapy[sh] OR Artemisinins[MeSH])',
  refOfficielle:'https://www.who.int/docs/default-source/malaria/malaria-guidelines',
},

DENGUE: {
  id:'DENGUE', icon:'🦟', nameFR:'Dengue (DENV 1-4)', nameEN:'Dengue Fever',
  dangerLevel:'ORANGE',
  agent:'Virus dengue sérotypes 1 à 4 (Flaviviridae, Flavivirus) — vecteur Aedes aegypti/albopictus',
  famille:'ARN monocaténaire — enveloppé — protéine E et NS1',
  incubation:'4–10 jours (3–14j)',
  contagiosite:'Nulle inter-humain — vectorielle exclusive',
  cfr:'< 1% dengue classique — 2–5% dengue sévère non traitée',
  reservoir:'Homme (période virémique 5j) — primates non-humains',
  transmission:'Piqûre Aedes aegypti / albopictus (diurne ++) — cycle urbain',
  zonesEndemiques:'Tropiques et subtropiques — 100+ pays — 390 millions d\'infections/an',
  saisonalite:'Saison des pluies — prolifération Aedes',
  phases:[
    {nom:'Fébrile',duree:'J1–J3',signes:['Fièvre brutale 39-40°C','Céphalées rétro-orbitaires','Myalgies / arthralgies (breakbone fever)','Flush facial']},
    {nom:'Critique (défervescence)',duree:'J4–J6',signes:['Fuite plasmatique','Thrombopénie < 100 G/L','Risque hémorragique','Épanchements']},
    {nom:'Récupération',duree:'J7–J10',signes:['Réabsorption des fuites','Éruption tardive','Bradycardie relative']},
  ],
  redFlags:['Douleurs abdominales sévères','Vomissements persistants','Épanchements pleuraux / ascite','Saignement muqueux','Hématémèse ou méléna','Léthargie / agitation','Foie > 2 cm sous rebord','Augmentation hématocrite + chute rapide des plaquettes'],
  priseEnChargeImmediate:[
    'Précautions standard — pas d\'isolement respiratoire',
    'NFS quotidienne en phase critique (plaquettes, hématocrite)',
    'NS1 antigen J1-J5, sérologie IgM/IgG à partir J4',
    'Hydratation orale aggressive si tolérance',
    'Éviter AINS et aspirine (risque hémorragique)',
    'Surveillance ambulatoire possible si critères OMS favorables',
    'Signalement obligatoire en France métropolitaine (Aedes présent)',
  ],
  traitementFR:'Traitement symptomatique exclusif. Paracétamol pour fièvre/douleurs. Hydratation ± IV si signes d\'alarme. Pas d\'antiviral disponible. Transfusion plaquettaire si < 20 G/L + saignement. — Information soignant, prescription médicale obligatoire.',
  declarationObligatoire:true,
  declarationDetails:'DO ARS en France métropolitaine et Antilles — Formulaire spécifique dengue',
  epiSoignant:['Précautions standard','Signaler si Aedes présent localement'],
  isolementPatient:'Non requis — protection anti-vectorielle (moustiquaire patient virémique)',
  pubmedQuery:'dengue fever treatment clinical management 2024 2025',
  pubmedMesh:'Dengue[MeSH] AND (therapy[sh] OR clinical management)',
  refOfficielle:'https://www.who.int/teams/control-of-neglected-tropical-diseases/dengue-and-arboviral-diseases',
},

MPOX: {
  id:'MPOX', icon:'🔴', nameFR:'Mpox (Monkeypox, MPXV)', nameEN:'Mpox (Monkeypox)',
  dangerLevel:'ORANGE',
  agent:'Virus Monkeypox (Orthopoxvirus) — clades Ia (endémique, létal), Ib (émergent RDC), IIb (épidémie 2022)',
  famille:'ADN double brin — enveloppé — Poxviridae',
  incubation:'5–21 jours (clade IIb : 7–14j)',
  contagiosite:'Modérée — R0 : 1,5–2,0 (clade IIb sexual) — élevée clade Ia',
  cfr:'Clade I : 3–11% — Clade II : < 1% — Élevé chez immunodéprimés',
  reservoir:'Rongeurs africains (Funisciurus spp., Graphiurus spp.) — primates',
  transmission:'Contact direct lésions/fluides — gouttelettes respiratoires prolongées — fomites — sexuel (clade IIb)',
  zonesEndemiques:'Bassin Congo (clade I) — Afrique de l\'Ouest (clade II) — Épidémie mondiale 2022 clade IIb',
  saisonalite:'Toute l\'année — pas de saisonnalité stricte',
  phases:[
    {nom:'Prodrome',duree:'J1–J4',signes:['Fièvre','Céphalées','Adénopathies (cervicales, axillaires, inguinales)','Myalgies']},
    {nom:'Éruptive',duree:'J4–J21',signes:['Rash centrifuge (visage → membres)','Évolution macule→papule→vésicule→pustule→croûte','Lésions muqueuses / génitales','Lésions au même stade (vs varicelle)']},
  ],
  redFlags:['Lésions confluentes > 100','Atteinte oculaire (kératite)','Pneumonie mpox','Encéphalite','Sepsis secondaire','Immunodépression (HIV CD4 < 200)','Grossesse'],
  priseEnChargeImmediate:[
    'ISOLEMENT CONTACT ET GOUTTELETTES',
    'Masque chirurgical patient + FFP2 soignant si geste',
    'PCR mpox sur lésion cutanée (écouvillon lésion + croûte)',
    'Sérologie orthopoxvirus si < 5 lésions',
    'Bilan IST associé (HIV, syphilis, gonorrhée, chlamydia)',
    'Vaccination contacts (Imvanex® ≤ 4j post-exposition)',
    'Déclaration obligatoire ARS immédiate',
  ],
  traitementFR:'Forme légère : traitement symptomatique. Forme grave/immunodéprimé : Tecovirimat (TPOXX®) — accès ATU nominative. Cidofovir en alternative. — Information soignant, prescription médicale obligatoire.',
  declarationObligatoire:true,
  declarationDetails:'DO immédiate ARS — formulaire spécifique mpox SPF',
  epiSoignant:['FFP2','Surblouse','Gants doubles','Lunettes si geste','Pas de lentilles contact'],
  isolementPatient:'Isolement contact + gouttelettes — jusqu\'à cicatrisation complète toutes lésions',
  pubmedQuery:'mpox monkeypox treatment tecovirimat 2024 2025',
  pubmedMesh:'Mpox[MeSH] AND (therapy[sh] OR antiviral agents[MeSH])',
  refOfficielle:'https://www.who.int/news-room/fact-sheets/detail/mpox',
},

MENINGITIS: {
  id:'MENINGITIS', icon:'🧠', nameFR:'Méningite bactérienne (Neisseria meningitidis / S. pneumoniae)', nameEN:'Bacterial Meningitis',
  dangerLevel:'ROUGE',
  agent:'Neisseria meningitidis (A,B,C,W,Y) / Streptococcus pneumoniae / Listeria / E. coli néonat',
  famille:'Méningocoque : Gram- diplocoque encapsulé — Pneumocoque : Gram+ lancéolé',
  incubation:'2–10 jours (méningocoque) — variable (pneumocoque)',
  contagiosite:'Méningocoque : gouttelettes — portage nasopharyngé 5–10% population',
  cfr:'Méningocoque : 10–15% traité (30–50% méningococcémie) — Pneumocoque : 20–30%',
  reservoir:'Homme exclusif (portage nasopharyngé asymptomatique)',
  transmission:'Gouttelettes courte distance — contact étroit (< 1m, > 1h) — sécrétions naso-oro-pharyngées',
  zonesEndemiques:'Mondiale — Ceinture de la méningite (Afrique sub-saharienne) — épidémies saisonnières',
  saisonalite:'Hiver/printemps — saison sèche en zone endémique africaine',
  phases:[
    {nom:'Précoce',duree:'0–6h',signes:['Fièvre brutale','Céphalées','Raideur nuque']},
    {nom:'Constitution',duree:'6–24h',signes:['Triade méningée','Photophobie / phonophobie','Vomissements en jet','Altération conscience']},
    {nom:'Purpura fulminans',duree:'URGENCE < 3h',signes:['Purpura extensif nécrotique','Collapsus','CIVD','Défaillance multiviscérale']},
  ],
  redFlags:['PURPURA FULMINANS — urgence absolue','Coma — Glasgow < 12','Convulsions','Bradycardie + HTA (HTIC)','Paralysies des nerfs crâniens','Choc septique'],
  priseEnChargeImmediate:[
    'URGENCE VITALE — appel 15/SAMU',
    'Céfotaxime ou Ceftriaxone IV SANS DÉLAI si purpura',
    'Ponction lombaire SEULEMENT si pas de signe HTIC ni purpura',
    'NFS, hémocultures, CRP, coagulation, lactates',
    'Dexaméthasone 0,4 mg/kg/6h avant/avec ATB (pneumocoque adulte)',
    'Isolement gouttelettes 24h après ATB efficace',
    'DO ARS immédiate — prophylaxie contacts (rifampicine)',
  ],
  traitementFR:'Céfotaxime 200–300 mg/kg/j ou Ceftriaxone 2g/12h IV. Purpura : injection IM de Céfotaxime par le médecin présent AVANT transfert. — Information soignant, prescription médicale obligatoire.',
  declarationObligatoire:true,
  declarationDetails:'DO IMMÉDIATE ARS — Prophylaxie contacts < 24h (rifampicine ou ciprofloxacine)',
  epiSoignant:['Masque chirurgical 24h','Prophylaxie rifampicine si contact < 1m sans protection'],
  isolementPatient:'Isolement gouttelettes strict — 24h d\'antibiothérapie efficace',
  pubmedQuery:'bacterial meningitis treatment ceftriaxone dexamethasone 2024',
  pubmedMesh:'Meningitis, Bacterial[MeSH] AND (drug therapy[sh])',
  refOfficielle:'https://www.who.int/news-room/fact-sheets/detail/meningitis',
},

RSV: {
  id:'RSV', icon:'👶', nameFR:'Virus Respiratoire Syncytial (RSV)', nameEN:'RSV',
  dangerLevel:'ORANGE',
  agent:'Respiratory Syncytial Virus A et B (Pneumoviridae, Metapneumovirus)',
  famille:'ARN monocaténaire — enveloppé — protéines F et G',
  incubation:'2–8 jours (médiane 5j)',
  contagiosite:'Élevée — R0 : 1,5–3 — épidémie communautaire',
  cfr:'< 0,1% adulte sain — 1–3% nourrisson < 3 mois — 10% immunodéprimé greffé',
  reservoir:'Humain exclusif — réinfections tout au long de la vie',
  transmission:'Gouttelettes courte distance — contact direct — fomites (survie 6h surface)',
  zonesEndemiques:'Mondiale — première cause bronchiolite nourrisson',
  saisonalite:'Épidémie automne-hiver (Oct-Mars France)',
  phases:[
    {nom:'VAS',duree:'J1–J3',signes:['Rhinorrhée','Toux','Fièvre modérée','Difficultés alimentaires']},
    {nom:'Bronchiolite',duree:'J3–J7',signes:['Toux grasse','Sibilants / crépitants','Détresse respiratoire','Apnées (nourrisson < 2 mois)']},
  ],
  redFlags:['Apnées','FR > 60/min (nourrisson)','SpO2 < 92%','Signes de lutte (tirage, battement ailes du nez)','Déshydratation (perte > 10% poids)','Âge < 6 semaines','Cardiopathie sous-jacente'],
  priseEnChargeImmediate:[
    'Désobstruction rhinopharyngée (DRP) x avant chaque repas',
    'Positionnement semi-assis',
    'Surveillance SpO2 continue si signes de lutte',
    'O2 si SpO2 < 92% — haut débit si > 2 L/min requis',
    'Score de gravité (PEWS ou score de Wang)',
    'Pas de kinésithérapie respiratoire en aigu (Société Française de Pédiatrie)',
    'Nirsevimab (Beyfortus®) — anticorps monoclonal prophylactique nourrisson',
  ],
  traitementFR:'Traitement symptomatique exclusif. Oxygénothérapie si nécessaire. Hydratation entérale ou IV. Pas d\'antiviral validé en pratique courante (ribavirine réservée immunodéprimés). — Information soignant, prescription médicale obligatoire.',
  declarationObligatoire:false,
  declarationDetails:'Surveillance épidémique réseau Sentinelles / Oscour — pas de DO individuelle',
  epiSoignant:['Hygiène mains +++','Masque chirurgical','Cohortage nourrissons'],
  isolementPatient:'Isolement gouttelettes et contact — regroupement géographique',
  pubmedQuery:'RSV respiratory syncytial virus treatment nirsevimab 2024 2025',
  pubmedMesh:'Respiratory Syncytial Virus Infections[MeSH] AND (therapy[sh])',
  refOfficielle:'https://www.who.int/news-room/fact-sheets/detail/respiratory-syncytial-virus',
},

LEGIONELLA: {
  id:'LEGIONELLA', icon:'💧', nameFR:'Légionellose (Legionella pneumophila)', nameEN:'Legionnaires Disease',
  dangerLevel:'ORANGE',
  agent:'Legionella pneumophila sérogroupe 1 (85% cas) — espèces non-pneumophila (15%)',
  famille:'Bactérie gram-négative — intracellulaire facultative — milieu hydrique',
  incubation:'2–10 jours (extrêmes 1–19j)',
  contagiosite:'NULLE inter-humain — source hydrique exclusive',
  cfr:'5–30% (mortalité hospitalière) — 50–80% si immunodéprimé non traité',
  reservoir:'Environnement hydrique artificiel : tours aéroréfrigérantes, douches, thermes',
  transmission:'Inhalation aérosols aquatiques contaminés (Legionella > 37°C et < 50°C)',
  zonesEndemiques:'Mondiale — foyers nosocomiaux et communautaires — voyages en hôtel',
  saisonalite:'Été/automne (chaleur favorise prolifération)',
  phases:[
    {nom:'Début',duree:'J1–J2',signes:['Fièvre > 40°C','Frissons','Céphalées','Myalgies']},
    {nom:'Pneumopathie',duree:'J2–J5',signes:['Toux non productive','Dyspnée','Confusion (30%)','Bradycardie relative','Diarrhée','Hyponatrémie']},
    {nom:'Grave',duree:'J5+',signes:['SDRA','Insuffisance rénale','Rhabdomyolyse','Hépatite cytolytique']},
  ],
  redFlags:['Confusion / encéphalopathie','SpO2 < 90%','SDRA','Créatinine > 200','Choc','Immunodépression','Absence d\'amélioration à 48h'],
  priseEnChargeImmediate:[
    'Pas d\'isolement nécessaire (non contagieux)',
    'Antigénurie légionelle (serogroupe 1 — sensibilité 70–80%)',
    'PCR Legionella expectorations / LBA si disponible',
    'Radio thorax (opacités multilobaires, épanchement)',
    'Ionogramme (hyponatrémie < 130 fréquente), CPK, bilan rénal, hépatique',
    'Déclaration DO ARS obligatoire',
    'Enquête source : recensement expositions eau 2–10j avant',
  ],
  traitementFR:'Lévofloxacine 500 mg x2/j IV ou po x8–21j selon gravité. Alternative : Azithromycine 500 mg/j. Rifampicine en association si forme grave. — Information soignant, prescription médicale obligatoire.',
  declarationObligatoire:true,
  declarationDetails:'DO ARS immédiate — enquête environnementale obligatoire — signalement ECDC',
  epiSoignant:['Précautions standard uniquement'],
  isolementPatient:'Non requis — pas de transmission inter-humaine',
  pubmedQuery:'legionella pneumophila treatment fluoroquinolone 2024',
  pubmedMesh:'Legionnaires Disease[MeSH] AND (drug therapy[sh])',
  refOfficielle:'https://www.who.int/news-room/fact-sheets/detail/legionellosis',
},

H5N1: {
  id:'H5N1', icon:'🐦', nameFR:'Grippe aviaire H5N1 (Influenza A hautement pathogène)', nameEN:'H5N1 Avian Influenza',
  dangerLevel:'ROUGE',
  agent:'Influenza A/H5N1 (clade 2.3.4.4b) — mutation PB2 627K si adaptation humaine',
  famille:'ARN segmenté — Orthomyxoviridae — HAI élevé (HA clivage ubiquitaire)',
  incubation:'2–5 jours (jusqu\'à 17j signalés)',
  contagiosite:'Très faible inter-humain (quelques clusters familiaux) — vectorielle aviaire',
  cfr:'~60% cas humains signalés (OMS 2003-2024) — biais de déclaration (cas graves) — épidémie bovine US 2024 : < 1% (détection précoce, formes bénignes)',
  reservoir:'Volailles domestiques, oiseaux sauvages migrateurs — mammifères marins (2023)',
  transmission:'Contact direct volailles infectées / surfaces contaminées — pas de transmission soutenue inter-humaine',
  zonesEndemiques:'Asie du Sud-Est, Afrique du Nord, Europe — USA bovins laitiers 2024',
  saisonalite:'Épidémies aviaires hivernales — risque humain toute l\'année près des élevages',
  phases:[
    {nom:'Début',duree:'J1–J3',signes:['Fièvre > 38°C','Toux','Dyspnée précoce','Diarrhée (25%)','Conjonctivite']},
    {nom:'Pneumopathie sévère',duree:'J3–J7',signes:['SDRA rapide','Infiltrats diffus bilatéraux','Hyperleucocytose ou lymphopénie']},
  ],
  redFlags:['SDRA','SpO2 < 90%','Toute exposition aviaire + pneumopathie','Cluster familial','Lymphopénie < 1G/L'],
  priseEnChargeImmediate:[
    'ISOLEMENT AÉRIEN ET CONTACT IMMÉDIAT',
    'FFP2 / FFP3 soignant obligatoire',
    'Contact URGENT Cellule de Crise infectieux (SAMU + CHU référent)',
    'PCR H5 spécifique (prélèvement nasopharyngé + bronchique)',
    'Oseltamivir SANS ATTENDRE résultat PCR si suspicion forte',
    'Déclaration ARS + DGS-Urgent immédiate',
    'Enquête exposition (volailles, mammifères, lait cru) 2–17j avant',
  ],
  traitementFR:'Oseltamivir 150 mg x2/j x10j (double dose) si suspicion H5N1. Corticoïdes controversés — déconseillés sauf SDRA documenté. — Information soignant, prescription médicale obligatoire.',
  declarationObligatoire:true,
  declarationDetails:'DO IMMÉDIATE — cellule nationale crise infectieuse — alerte OMS si confirmé',
  epiSoignant:['FFP3 obligatoire','Surblouse imperméable','Double gants','Lunettes étanches','APR en circuit fermé si ventilation'],
  isolementPatient:'Isolement aérien strict — chambre pression négative',
  pubmedQuery:'H5N1 avian influenza human infection 2024 2025',
  pubmedMesh:'Influenza A Virus, H5N1 Subtype[MeSH] AND (humans[MeSH] OR therapy[sh])',
  refOfficielle:'https://www.who.int/teams/global-influenza-programme/avian-influenza',
},

HEMORRHAGIC_FEVER: {
  id:'HEMORRHAGIC_FEVER', icon:'🩸', nameFR:'Fièvre Hémorragique Virale — Ebola', nameEN:'Viral Hemorrhagic Fever (Ebola)',
  dangerLevel:'ROUGE',
  agent:'Virus Ebola (Zaire ebolavirus) — Marburgvirus — Lassa virus — CCHFV',
  famille:'ARN monocaténaire — Filoviridae (Ebola/Marburg) — Arenaviridae (Lassa)',
  incubation:'Ebola : 2–21j — Marburg : 2–21j — Lassa : 6–21j',
  contagiosite:'Très élevée par contact direct liquides biologiques — non aérien en routine',
  cfr:'Ebola Zaïre : 40–90% — Marburg : 24–88% — Lassa : 1% communautaire / 15–50% hospitalier',
  reservoir:'Chauves-souris frugivores (Ebola, Marburg) — rongeurs Mastomys (Lassa)',
  transmission:'Contact direct sang/fluides/vomissements/fèces patient ou mort — rituels funèbres — nosocomial',
  zonesEndemiques:'Afrique centrale (Ebola/Marburg) — Afrique de l\'Ouest (Lassa) — retour voyageurs',
  saisonalite:'Épidémies focales après cas index — pas de saisonnalité stricte',
  phases:[
    {nom:'Fébrile (1)',duree:'J1–J5',signes:['Fièvre brutale','Céphalées','Myalgies','Diarrhée profuse']},
    {nom:'Hémorragique (2)',duree:'J5–J10',signes:['Purpura / pétéchies','Hématémèse / méléna','Saignements muqueux / IV','Conjonctivite hémorragique']},
    {nom:'Choc/décès',duree:'J7–J14',signes:['CIVD','Choc hypovolémique','Défaillance multiviscérale']},
  ],
  redFlags:['TOUTE FIÈVRE + RETOUR ZONE ENDÉMIQUE = ISOLEMENT IMMÉDIAT','Saignements spontanés','Conjonctivite hémorragique','Rash maculopapuleux tronc','Diarrhée profuse > 5 selles/j'],
  priseEnChargeImmediate:[
    '⚠️ ARRÊT DES SOINS INVASIFS — appel SAMU 15 + CHU référent',
    'EQUIPEMENT P4 COMPLET avant tout contact patient',
    'Signalement DGS-URGENT + ARS < 1h',
    'Patient seul en chambre — porte fermée — pas de famille',
    'PCR Ebola/Marburg sur sang EDTA — laboratoire niveau 4 (INSERM Lyon)',
    'Aucun geste invasif non vital sans équipement adapté',
    'Traçage TOUS les contacts depuis début symptômes',
  ],
  traitementFR:'Ebola : Atoltivimab-maftivimab-odesivimab (Inmazeb®) IV ou Ansuvimab (Ebanga®). Marburg : traitement de soutien. Lassa : Ribavirine IV précoce. — Information soignant, prescription médicale obligatoire.',
  declarationObligatoire:true,
  declarationDetails:'DO IMMÉDIATE — alerte niveau national + OMS — cellule crise REACTing',
  epiSoignant:['COMBINAISON ÉTANCHE NIVEAU 4','Double gants +++','Masque FFP3 ou APR','Visière + lunettes étanches','Surchaussures','Décontamination sortie scrupuleuse'],
  isolementPatient:'ISOLEMENT STRICT — chambre pression négative — accès restreint équipe formée seulement',
  pubmedQuery:'Ebola hemorrhagic fever treatment monoclonal antibody 2024',
  pubmedMesh:'Hemorrhagic Fever, Ebola[MeSH] AND (therapy[sh] OR Antibodies, Monoclonal[MeSH])',
  refOfficielle:'https://www.who.int/news-room/fact-sheets/detail/ebola-virus-disease',
},

LASSA: {
  id:'LASSA', icon:'🐭', nameFR:'Fièvre de Lassa', nameEN:'Lassa Fever',
  dangerLevel:'ROUGE',
  agent:'Lassa mammarenavirus (Arenaviridae) — ARN bipartite ambisens',
  famille:'Arenaviridae — enveloppé — glycoprotéines GP1/GP2',
  incubation:'6–21 jours',
  contagiosite:'Contact direct fluides biologiques — nosocomial — rats Mastomys',
  cfr:'1% cas communautaires — 15–50% cas hospitalisés sévères',
  reservoir:'Rongeur Mastomys natalensis (rat multimamelle) — Afrique de l\'Ouest',
  transmission:'Contact sécrétions rat / aliments contaminés — inter-humain nosocomial (sang, fluides)',
  zonesEndemiques:'Afrique de l\'Ouest (Nigéria +++, Sierra Leone, Guinée, Liberia) — 300 000–500 000 cas/an',
  saisonalite:'Saison sèche (Nov-Avr) — rongeurs entrent habitations',
  phases:[
    {nom:'Phase 1',duree:'J1–J3',signes:['Fièvre progressive','Malaise','Céphalées']},
    {nom:'Phase 2',duree:'J4–J7',signes:['Pharyngite exsudative','Douleurs thoraciques','Vomissements','Visage oedématié','Protéinurie']},
    {nom:'Grave',duree:'J7–J14',signes:['Hypoacousie (surdité 30% survivants)','Encéphalopathie','Saignements (seulement 20%)','Choc']},
  ],
  redFlags:['Pharyngite hémorragique','Visage oedématié symétrique','Surdité soudaine','Protéinurie > 2g/L','Transaminases > 10N (ALAT)','Virémie élevée'],
  priseEnChargeImmediate:[
    'Isolement contact + gouttelettes IMMÉDIAT',
    'Signalement DGS-URGENT si retour Afrique Ouest + tableau évocateur',
    'PCR Lassa (CNRP fièvres hémorragiques Lyon)',
    'Ribavirine IV précoce si confirmation',
    'Pas de geste invasif non vital avant résultat',
    'Traçage contacts',
  ],
  traitementFR:'Ribavirine IV 2g dose de charge puis 1g/6h x4j puis 500mg/8h x6j. Efficacité maximale si débutée < 6j symptômes. — Information soignant, prescription médicale obligatoire.',
  declarationObligatoire:true,
  declarationDetails:'DO IMMÉDIATE — catégorie A France — alerte internationale si confirmé',
  epiSoignant:['Précautions type P3/P4','FFP3','Surblouse imperméable','Double gants'],
  isolementPatient:'Isolement contact/gouttelettes — lit dédié, matériel non partagé',
  pubmedQuery:'Lassa fever treatment ribavirin outcome 2024',
  pubmedMesh:'Lassa Fever[MeSH] AND (ribavirin[MeSH] OR therapy[sh])',
  refOfficielle:'https://www.who.int/news-room/fact-sheets/detail/lassa-fever',
},

CCHF: {
  id:'CCHF', icon:'🕷️', nameFR:'Fièvre Hémorragique Crimée-Congo (CCHF)', nameEN:'Crimean-Congo Hemorrhagic Fever',
  dangerLevel:'ROUGE',
  agent:'Nairovirus CCHF (Nairoviridae) — ARN segmenté trisegmenté',
  famille:'Bunyavirales — Nairoviridae — vecteur tique Hyalomma',
  incubation:'1–3j (piqûre tique) — 5–6j (contact sang animal/humain)',
  contagiosite:'Nosocomial par contact sang/fluides — non aérien',
  cfr:'5–40% selon contexte',
  reservoir:'Tiques Hyalomma — bovins, ovins, caprins (amplificateurs virémiques)',
  transmission:'Piqûre de tique Hyalomma — contact sang animal lors abattage — nosocomial',
  zonesEndemiques:'Afrique, Balkans, Moyen-Orient, Asie centrale — extension en Europe méridionale (Espagne, Italie)',
  saisonalite:'Printemps-été (activité tiques) — toute l\'année en zones d\'élevage',
  phases:[
    {nom:'Pré-hémorragique',duree:'J1–J3',signes:['Fièvre brutale','Céphalées violentes','Myalgies','Nausées']},
    {nom:'Hémorragique',duree:'J4–J9',signes:['Pétéchies/ecchymoses','Saignements gastro-intestinaux','Epistaxis/gingivorragies','Hémorragie utérine']},
  ],
  redFlags:['Tout saignement spontané','Thrombopénie < 50 G/L','ASAT/ALAT > 10N','Augmentation TCA','Fibrino < 1g/L'],
  priseEnChargeImmediate:[
    'ISOLEMENT CONTACT IMMÉDIAT',
    'FFP2 soignant + surblouse + gants doubles',
    'PCR CCHF (CNR Lyon — INSERM P4)',
    'NFS, coagulation, transaminases quotidiens',
    'Ribavirine IV (si disponible)',
    'Déclaration DO ARS urgente',
  ],
  traitementFR:'Ribavirine IV précoce (même posologie que Lassa). Traitement de soutien intensif. Facteurs coagulation si CIVD. — Information soignant, prescription médicale obligatoire.',
  declarationObligatoire:true,
  declarationDetails:'DO ARS — alerte ECDC en Europe',
  epiSoignant:['FFP2 minimum','Surblouse imperméable','Double gants','Éviter tout contact muqueux'],
  isolementPatient:'Isolement contact strict',
  pubmedQuery:'Crimean-Congo hemorrhagic fever CCHF ribavirin treatment 2024',
  pubmedMesh:'Hemorrhagic Fever, Crimean[MeSH] AND (therapy[sh])',
  refOfficielle:'https://www.who.int/news-room/fact-sheets/detail/crimean-congo-haemorrhagic-fever',
},

MARBURG: {
  id:'MARBURG', icon:'🦇', nameFR:'Maladie à virus Marburg', nameEN:'Marburg Virus Disease',
  dangerLevel:'ROUGE',
  agent:'Marburg marburgvirus (Filoviridae) — souches Musoke et Angola',
  famille:'Filoviridae — ARN monocaténaire — morphologie filamenteuse',
  incubation:'2–21 jours (médiane 7j)',
  contagiosite:'Contact direct fluides biologiques — rituels funèbres — nosocomial',
  cfr:'24–88% (souche Angola : 90%)',
  reservoir:'Chauves-souris frugivores Rousettus aegyptiacus — mines/grottes endémiques',
  transmission:'Contact sécrétions/sang/vomissements patient — exposition chauves-souris',
  zonesEndemiques:'Afrique équatoriale — épidémies Rwanda, Guinée équatoriale, Tanzanie 2023-2024',
  saisonalite:'Épidémies focales — pas de saisonnalité',
  phases:[
    {nom:'Phase 1',duree:'J1–J5',signes:['Fièvre brutale','Céphalées sévères','Myalgies','Prostation']},
    {nom:'Phase 2',duree:'J5–J13',signes:['Rash maculopapuleux tronc (J5)','Nausées/vomissements/diarrhée','Jaunisse','Confusion']},
    {nom:'Phase hémorragique',duree:'J7+',signes:['Saignements multiples sites','CIVD','Choc','Défaillance multiviscérale']},
  ],
  redFlags:['= Ebola — ISOLEMENT NIVEAU 4 IMMÉDIAT','Rash maculopapuleux + fièvre + retour Afrique'],
  priseEnChargeImmediate:[
    '⚠️ MÊMES MESURES QUE FIÈVRE HÉMORRAGIQUE EBOLA',
    'EPI NIVEAU 4 obligatoire — ARRÊT soins sans équipement adapté',
    'Appel SAMU + CHU référent + DGS-Urgent',
    'PCR Marburg (INSERM P4 Lyon exclusivement)',
    'Pas d\'anticorps monoclonaux validés en 2024 — traitement de soutien',
    'Traçage TOUS contacts depuis J-21',
  ],
  traitementFR:'Traitement de soutien exclusif — réhydratation IV, correction troubles électrolytiques, transfusion si nécessaire. Essais cliniques en cours (MR191, anticorps monoclonaux). — Information soignant, prescription médicale obligatoire.',
  declarationObligatoire:true,
  declarationDetails:'DO IMMÉDIATE catégorie A — alerte OMS obligatoire',
  epiSoignant:['NIVEAU P4 COMPLET — identique Ebola'],
  isolementPatient:'Isolement strict pression négative — équipe dédiée formée seulement',
  pubmedQuery:'Marburg virus disease treatment clinical outcome 2024',
  pubmedMesh:'Marburg Virus Disease[MeSH] AND (therapy[sh])',
  refOfficielle:'https://www.who.int/news-room/fact-sheets/detail/marburg-virus-disease',
},

TYPHOID: {
  id:'TYPHOID', icon:'🌡️', nameFR:'Fièvre typhoïde (Salmonella Typhi)', nameEN:'Typhoid Fever',
  dangerLevel:'ORANGE',
  agent:'Salmonella enterica sérotype Typhi — bacille gram-négatif intracellulaire facultatif',
  famille:'Enterobacteriaceae — sérovar Typhi (H:d) et Paratyphi A/B/C',
  incubation:'6–30 jours (médiane 8–14j)',
  contagiosite:'Faible direct — féco-oral — eau et aliments contaminés',
  cfr:'1–4% traité — 12–30% non traité',
  reservoir:'Humain exclusif — portage biliaire chronique (3%) — porteurs sains asymptomatiques',
  transmission:'Eau/aliments contaminés par selles de porteur — mains — mouches (indirect)',
  zonesEndemiques:'Asie du Sud (Pakistan, Inde, Bangladesh +++), Afrique subsaharienne, Asie du Sud-Est',
  saisonalite:'Saison des pluies (contamination hydraulique)',
  phases:[
    {nom:'Semaine 1',duree:'J1–J7',signes:['Fièvre ascendante en plateau 39–40°C','Céphalées','Constipation (≠ entérite classique)','Bradycardie relative (discordance pouls/T°)']},
    {nom:'Semaine 2',duree:'J8–J14',signes:['Fièvre plateau','Tuphos (obnubilation)','Tâches rosées lenticulaires abdomen (30%)','Splénomégalie','Diarrhée pois-cassé tardive']},
    {nom:'Complications',duree:'J14–J21',signes:['Perforation intestinale (3–10%)','Hémorragie digestive','Encéphalite','Myocardite']},
  ],
  redFlags:['Douleur abdominal aiguë (perforation)','Hémorragie digestive','Encéphalite','Myocardite','Résistance antibiotique (XDR-Typhi)'],
  priseEnChargeImmediate:[
    'Hémocultures x3 (positivité 60–80% sem 1) — copro + sérologie Widal',
    'NFS (leucopénie relative), transaminases, bilirubine',
    'Évaluation abdominale (perforation)',
    'Isolement contact (fèces virulentes)',
    'Déclaration DO ARS',
    'Recherche résistance (XDR-Typhi Pakistan)',
  ],
  traitementFR:'Ciprofloxacine 500 mg x2/j x10–14j (si sensible) ou Azithromycine 500 mg/j x7j (si résistance quinolones). XDR-Typhi : Ceftriaxone IV ou Azithromycine. — Information soignant, prescription médicale obligatoire.',
  declarationObligatoire:true,
  declarationDetails:'DO ARS — enquête alimentaire/hydrique — recherche source',
  epiSoignant:['Précautions contact (selles)','Hygiène mains +++'],
  isolementPatient:'Isolement entérique — chambre individuelle — précautions fèces',
  pubmedQuery:'typhoid fever treatment azithromycin drug resistance 2024',
  pubmedMesh:'Typhoid Fever[MeSH] AND (drug therapy[sh] OR drug resistance[MeSH])',
  refOfficielle:'https://www.who.int/news-room/fact-sheets/detail/typhoid',
},

CHOLERA: {
  id:'CHOLERA', icon:'💧', nameFR:'Choléra (Vibrio cholerae O1/O139)', nameEN:'Cholera',
  dangerLevel:'ORANGE',
  agent:'Vibrio cholerae sérogroupes O1 (El Tor — biotypes Ogawa/Inaba) et O139',
  famille:'Vibrionaceae — bacille gram-négatif incurvé — flagelle polaire',
  incubation:'Quelques heures à 5 jours (médiane 1–3j)',
  contagiosite:'Élevée en contexte épidémique — féco-oral — dose infectante faible',
  cfr:'< 1% si réhydratation correcte — 25–50% sans traitement',
  reservoir:'Humain + réservoir aquatique (estuaires, eau saumâtre)',
  transmission:'Eau contaminée +++, aliments (crudités/fruits de mer), mains sales',
  zonesEndemiques:'Afrique subsaharienne (Haïti, RDC, Mozambique, Somalie), Asie du Sud, Yémen',
  saisonalite:'Épidémies toute l\'année — pic en saison des pluies',
  phases:[
    {nom:'Début',duree:'H0–H6',signes:['Diarrhée aqueuse soudaine (eau de riz)','Vomissements','Crampes abdominales (absentes ou légères)']},
    {nom:'Déshydratation',duree:'H6–H48',signes:['Diarrhée profuse (10–20 L/j)','Déshydratation sévère','Hypotension','Crampes musculaires','Voix éteinte']},
    {nom:'Choc',duree:'H24–H72',signes:['Choc hypovolémique','Anurie','Acidose métabolique','Hypokaliémie sévère']},
  ],
  redFlags:['Pli cutané permanent','Yeux excavés','Soif intense + impossibilité boire','Anurie > 6h','Troubles conscience','Crampes généralisées','Pouls non perçu'],
  priseEnChargeImmediate:[
    'RÉHYDRATATION IMMÉDIATE — urgence vitale par déshydratation',
    'SRO (Sels de Réhydratation Orale) si conscience + déglutition présentes',
    'Voie IV si choc ou inconscience : Ringer Lactate ou NaCl 0,9%',
    'Peser patient (référence pour suivi entrées/sorties)',
    'Coproculture + TDR choléra si disponible',
    'Isolement entérique — déclaration DO immédiate',
    'WASH : eau potable pour tous les contacts',
  ],
  traitementFR:'Réhydratation = traitement principal. Antibiotique adjuvant (réduit durée/contagiosité) : Doxycycline 300 mg dose unique adulte. Alternative : Azithromycine 1g dose unique. Résistance croissante à surveiller. — Information soignant, prescription médicale obligatoire.',
  declarationObligatoire:true,
  declarationDetails:'DO IMMÉDIATE ARS — alerte OMS si épidémie — investigation WASH',
  epiSoignant:['Précautions contact (selles/vomissements)','Hygiène mains eau+savon (pas seulement SHA)','Éviter contamination eau'],
  isolementPatient:'Isolement entérique — matériel dédié — déchets bio sécurisés',
  pubmedQuery:'cholera treatment oral rehydration antibiotic 2024',
  pubmedMesh:'Cholera[MeSH] AND (fluid therapy[MeSH] OR anti-bacterial agents[MeSH])',
  refOfficielle:'https://www.who.int/news-room/fact-sheets/detail/cholera',
},

PNEUMONIA: {
  id:'PNEUMONIA', icon:'🫁', nameFR:'Pneumonie communautaire bactérienne', nameEN:'Community-Acquired Pneumonia',
  dangerLevel:'ORANGE',
  agent:'S. pneumoniae (40%), M. pneumoniae (atypiques 20%), H. influenzae, L. pneumophila, K. pneumoniae',
  famille:'Variable selon pathogène — bactéries gram+ ou gram- ou intracellulaires obligatoires',
  incubation:'1–5 jours selon pathogène',
  contagiosite:'Modérée — gouttelettes — portage nasopharyngé',
  cfr:'< 1% ambulatoire — 5–15% hospitalier — 30–40% USI',
  reservoir:'Homme — portage nasopharyngé — environnement (Legionella)',
  transmission:'Gouttelettes respiratoires — aspiration sécrétions — aérosols',
  zonesEndemiques:'Mondiale — première cause de mortalité infectieuse 5–14 ans monde',
  saisonalite:'Hiver ++ (pneumocoque) — toute l\'année (atypiques)',
  phases:[
    {nom:'Début',duree:'J1–J2',signes:['Fièvre brutale (pneumocoque) ou progressive (atypiques)','Toux + expectoration (purulente/rouillée)','Douleur thoracique pleurétique']},
    {nom:'Constitution',duree:'J2–J5',signes:['Syndrome de condensation (crépitants, souffle tubaire)','Dyspnée','Herpès labial (pneumocoque)']},
  ],
  redFlags:['FR > 30/min','PAS < 90','Confusion','SpO2 < 90%','Atteinte bilatérale','Épanchement pleural','Alcool ou immunodépression','Score PSI IV-V ou CURB-65 ≥ 3'],
  priseEnChargeImmediate:[
    'SpO2, FR, PA, conscience — score CURB-65 ou PSI',
    'Radio thorax face (opacité lobaire ou bilatérale)',
    'NFS, CRP, procalcitonine, créatinine, hépatique',
    'Antigénurie pneumocoque + légionelle si forme grave',
    'Hémocultures x2 si hospitalisation',
    'Oxygénothérapie si SpO2 < 94%',
    'Décision hospitalisation selon score gravité',
  ],
  traitementFR:'Ambulatoire : Amoxicilline 1g x3/j x5j (pneumocoque). Atypique suspecté : Amoxicilline + Macrolide. Grave hospitalier : Amoxicilline/clavulanate + Azithromycine ou C3G. — Information soignant, prescription médicale obligatoire.',
  declarationObligatoire:false,
  declarationDetails:'Pneumonie Légionelle : DO — Cluster ou forme grave : signalement OSCOUR',
  epiSoignant:['Masque chirurgical si toux productive','Hygiène mains'],
  isolementPatient:'Précautions gouttelettes si toux — levée rapide sous traitement',
  pubmedQuery:'community-acquired pneumonia treatment antibiotic guidelines 2024',
  pubmedMesh:'Pneumonia[MeSH] AND (drug therapy[sh] OR anti-bacterial agents[MeSH])',
  refOfficielle:'https://www.who.int/news-room/fact-sheets/detail/pneumonia',
},

LEISHMANIASIS: {
  id:'LEISHMANIASIS', icon:'🪰', nameFR:'Leishmaniose (viscérale / cutanée)', nameEN:'Leishmaniasis',
  dangerLevel:'ORANGE',
  agent:'Leishmania donovani (viscérale — Kala-azar), L. tropica / major (cutanée), L. braziliensis (muco-cutanée)',
  famille:'Protozoaire flagellé — kinetoplastide — parasite des macrophages',
  incubation:'Viscérale : 2–6 mois (extrêmes 10j–2ans) — Cutanée : 1–4 semaines',
  contagiosite:'Nulle inter-humain — vectorielle Phlébotome femelle exclusivement',
  cfr:'Viscérale non traitée : 95–100% — Traitée : < 5% — Immunodéprimé : 50%',
  reservoir:'Homme (viscérale anthroponotique) — Chien (zoonotique) — rongeurs (cutanée)',
  transmission:'Piqûre Phlébotome infecté (nocturne, vols courts) — transfusion (rare)',
  zonesEndemiques:'Asie du Sud (Bangladesh, Inde, Népal), Afrique Est, Bassin méditerranéen (L. infantum)',
  saisonalite:'Saison chaude/sèche — activité nocturne vecteur',
  phases:[
    {nom:'Viscérale (Kala-azar)',duree:'Semaines-mois',signes:['Fièvre ondulante prolongée','Splénomégalie massive','Hépatomégalie','Amaigrissement','Pancytopénie','Hypergammaglobulinémie']},
    {nom:'Cutanée',duree:'Semaines-mois',signes:['Papule évoluant en ulcère indolore (volcan)','Croûte centrale','Lésion unique ou multiple','Cicatrice permanente']},
  ],
  redFlags:['Pancytopénie profonde (Hb < 7, plaquettes < 50G/L)','Saignements','Infections secondaires','HIV co-infection','Leishmaniose viscérale + grossesse'],
  priseEnChargeImmediate:[
    'Pas d\'isolement nécessaire (non contagieux)',
    'Sérologie (DAT, rK39 TDR), PCR sang/moelle selon forme',
    'NFS, électrophorèse protéines (pic polyclonal), créatinine',
    'Myélogramme si sérologie négative et suspicion viscérale',
    'Bilan VIH systématique (co-infection fréquente)',
    'Centre de référence maladies tropicales',
  ],
  traitementFR:'Viscérale : Amphotéricine B liposomale (AmBisome®) dose cumulée 18–21 mg/kg. Alternative LMIC : Miltefosine orale. Cutanée : Observation si forme limitée, Méglumine antimoniate locale ou Fluconazole. — Information soignant, prescription médicale obligatoire.',
  declarationObligatoire:false,
  declarationDetails:'Signalement CNRP maladies tropicales — surveillance SPF',
  epiSoignant:['Précautions standard uniquement'],
  isolementPatient:'Non requis',
  pubmedQuery:'leishmaniasis treatment amphotericin miltefosine 2024',
  pubmedMesh:'Leishmaniasis, Visceral[MeSH] AND (drug therapy[sh])',
  refOfficielle:'https://www.who.int/news-room/fact-sheets/detail/leishmaniasis',
},

MEASLES: {
  id:'MEASLES', icon:'🔴', nameFR:'Rougeole (Measles virus)', nameEN:'Measles',
  dangerLevel:'ORANGE',
  agent:'Morbillivirus hominis (Paramyxoviridae) — ARN monocaténaire — enveloppé',
  famille:'Paramyxoviridae — protéines H (hémagglutinine), F (fusion), N (nucléoprotéine)',
  incubation:'8–12 jours (jusqu\'à 21j pour éruption)',
  contagiosite:'TRÈS ÉLEVÉE — R0 : 12–18 — taux d\'attaque > 90% chez non-immunisés',
  cfr:'0,1% pays riches — 1–5% LMIC — 20–30% malnutris et immunodéprimés',
  reservoir:'Humain exclusif — aucun réservoir animal',
  transmission:'AÉROSOL +++ (survie dans l\'air 1–2h après départ patient) — gouttelettes',
  zonesEndemiques:'Mondiale si couverture vaccinale < 95% — résurgences Europe, USA, Afrique',
  saisonalite:'Hiver/printemps en zones tempérées',
  phases:[
    {nom:'Prodrome (Catarrhal)',duree:'J1–J4',signes:['Fièvre','Toux','Coryza','Conjonctivite (3C)','Signe de Köplik (taches blanchâtres muqueuse jugale)']},
    {nom:'Éruptive',duree:'J4–J7',signes:['Rash maculopapuleux craniocaudal (visage→cou→tronc→membres)','Fièvre maintenue','Confluent sur visage']},
    {nom:'Desquamation',duree:'J7–J14',signes:['Rash brunissant','Desquamation fine','Asthénie prolongée']},
  ],
  redFlags:['Pneumonie rougeoleuse (1ère cause décès)','Encéphalite aiguë (1/1000)','PESS (panencéphalite sclérosante subaiguë, 7–10 ans après)','Diarrhée sévère + déshydratation','Kératite / cécité (malnutris)','Immunodéprimé : forme atypique grave'],
  priseEnChargeImmediate:[
    'ISOLEMENT AÉRIEN IMMÉDIAT — chambre individuelle',
    'FFP2 soignant — vérification statut vaccinal équipe',
    'Vaccination post-exposition < 72h (non immuns)',
    'Immunoglobulines < 6j (nourrisson < 6 mois, immunodéprimé, femme enceinte)',
    'Déclaration DO ARS < 24h',
    'Vitamine A (enfants LMIC : 200 000 UI x2 — réduit mortalité 50%)',
    'Recherche foyer — investigation contacts',
  ],
  traitementFR:'Traitement symptomatique (fièvre, hydratation). Vitamine A 200 000 UI/j x2j enfant (< 1 an : 100 000 UI). Pas d\'antiviral validé. Antibiotique si surinfection bactérienne documentée. — Information soignant, prescription médicale obligatoire.',
  declarationObligatoire:true,
  declarationDetails:'DO ARS < 24h — genotypage souche — investigation foyer',
  epiSoignant:['FFP2 OBLIGATOIRE — aérosol persistant','Vérification 2 doses ROR personnel','Exclusion soignant non-immun'],
  isolementPatient:'Isolement aérien jusqu\'à J5 éruption',
  pubmedQuery:'measles outbreak vaccination management 2024 2025',
  pubmedMesh:'Measles[MeSH] AND (prevention and control[sh] OR therapy[sh])',
  refOfficielle:'https://www.who.int/news-room/fact-sheets/detail/measles',
},

SEPSIS: {
  id:'SEPSIS', icon:'⚠️', nameFR:'Sepsis / Choc Septique', nameEN:'Sepsis & Septic Shock',
  dangerLevel:'ROUGE',
  agent:'Tout micro-organisme — Bactéries gram- (E. coli, K. pneumoniae) gram+ (S. aureus, pneumocoque) — Candida',
  famille:'Syndrome clinique — réponse dysrégulée de l\'hôte — définition Sepsis-3 (2016)',
  incubation:'Variable selon foyer infectieux — heures à jours',
  contagiosite:'Variable selon pathogène causal',
  cfr:'Sepsis : 15–30% — Choc septique : 30–50%',
  reservoir:'Endogène (flore commensal), environnemental, nosocomial',
  transmission:'Variable selon foyer — nosocomiale fréquente',
  zonesEndemiques:'Mondiale — 50 millions de cas/an OMS — 20% des décès mondiaux',
  saisonalite:'Toute l\'année — pic hivernal (pneumocoque)',
  phases:[
    {nom:'Infection + SIRS',duree:'H0–H6',signes:['Fièvre > 38°C ou Hypothermie < 36°C','Tachycardie > 90/min','Tachypnée > 20/min ou PaCO2 < 32','Leucocytes > 12G/L ou < 4G/L']},
    {nom:'Sepsis (Dysfonction organe)',duree:'H0–H24',signes:['Score SOFA ≥ 2','Confusion aiguë','Oligurie < 0,5 mL/kg/h','Créatinine > 176','Bilirubine > 34','Plaquettes < 100G/L']},
    {nom:'Choc septique',duree:'URGENCE',signes:['Vasopresseurs nécessaires','PAM < 65 malgré remplissage','Lactate > 2 mmol/L']},
  ],
  redFlags:['TOUT : Lactate > 2 mmol/L','Score NEWS2 ≥ 7','Vasopresseurs requis','Trouble conscience aigu','Anurie','FR > 25/min + saturation basse','Purpura extensif'],
  priseEnChargeImmediate:[
    '⏱️ OBJECTIF : ATB < 1h si choc — < 3h si sepsis',
    'BUNDLE SEPSIS (Surviving Sepsis Campaign) :',
    '1. Lactate sanguin — 2. Hémocultures x2 AVANT ATB',
    '3. ATB large spectre IMMÉDIAT',
    '4. Cristalloïdes 30 mL/kg si PAS < 90 ou lactate > 4',
    '5. Vasopresseurs si PAS < 65 malgré remplissage (noradrénaline)',
    'Recherche foyer (Rx thorax, ECBU, PL, écho)',
    'Contrôle foyer chirurgical si nécessaire (drainage, ablation matériel)',
  ],
  traitementFR:'ATB selon foyer suspecté : Pipéracilline/Tazobactam (C3G si allergie) ± Amikacine si choc. Antifongique si candidémie suspecte. Réduction spectre à J3-J5 selon documentation. — Information soignant, prescription médicale obligatoire.',
  declarationObligatoire:false,
  declarationDetails:'Pas de DO individuelle — surveillance hospitalière SPILF/ECDC',
  epiSoignant:['Précautions adaptées au foyer — hygiène mains+++'],
  isolementPatient:'Selon pathogène identifié — BMR : isolement contact',
  pubmedQuery:'sepsis treatment bundle antibiotic 2024 2025',
  pubmedMesh:'Sepsis[MeSH] AND (therapy[sh] OR Shock, Septic[MeSH])',
  refOfficielle:'https://www.survivingsepsis.org/guidelines',
},

SCHISTOSOMIASIS: {
  id:'SCHISTOSOMIASIS', icon:'🐌', nameFR:'Schistosomiase (Bilharziose)', nameEN:'Schistosomiasis',
  dangerLevel:'JAUNE',
  agent:'Schistosoma mansoni (intestinal/hépatique), S. haematobium (urogénital), S. japonicum (Asie)',
  famille:'Trématode vasculaire — cycle avec mollusque hôte intermédiaire (Bulinus spp.)',
  incubation:'Primo-infection : 4–6 semaines (fièvre de Katayama) — Chronique : mois-années',
  contagiosite:'NULLE inter-humain — cycle obligatoirement via eau douce + mollusque',
  cfr:'< 1% — morbidité chronique majeure (fibrose hépatique, cancer vésical)',
  reservoir:'Homme (hôte définitif) — mollusques d\'eau douce (Bulinus, Biomphalaria)',
  transmission:'Pénétration cercariale transcutanée en eau douce contaminée (baignade, irrigation)',
  zonesEndemiques:'Afrique subsaharienne (90% cas), Bassin méditerranéen, Amériques tropicales, Asie (S. japonicum)',
  saisonalite:'Toute l\'année — transmission maximale eau chaude',
  phases:[
    {nom:'Cercarite',duree:'J0–J3',signes:['Prurit et éruption urticariforme (point d\'entrée)']},
    {nom:'Fièvre de Katayama (primo)',duree:'J4–J8 semaines',signes:['Fièvre élevée','Myalgies','Urticaire','Éosinophilie massive > 30%','Hépatosplénomégalie']},
    {nom:'Chronique',duree:'Années',signes:['S. mansoni : fibrose hépatique, hypertension portale','S. haematobium : hématurie terminale, cancer vésical','S. japonicum : fibrose hépatique massive']},
  ],
  redFlags:['Hypertension portale (ascite, circulation collatérale)','Hématémèse (varices)','Hématurie persistante','Uropathie obstructive','Neuro-schistosomiase (spinale ou cérébrale)'],
  priseEnChargeImmediate:[
    'Pas d\'urgence habituelle — maladie chronique',
    'Sérologie schistosome (ELISA) + examen parasitologique selles/urines',
    'NFS (éosinophilie > 30% en phase aiguë)',
    'Échographie hépatique et vésicale',
    'Cystoscopie si S. haematobium chronique (bilan cancer)',
    'Centre spécialisé maladies tropicales',
  ],
  traitementFR:'Praziquantel 40 mg/kg en 1 à 2 prises (dose unique). 60 mg/kg pour S. japonicum. Répéter 4–6 semaines après primo-infection (œufs pas encore pondus). — Information soignant, prescription médicale obligatoire.',
  declarationObligatoire:false,
  declarationDetails:'Pas de DO — signalement CNRP maladies tropicales si cluster',
  epiSoignant:['Précautions standard uniquement','Pas de risque contact patient'],
  isolementPatient:'Non requis',
  pubmedQuery:'schistosomiasis treatment praziquantel 2024',
  pubmedMesh:'Schistosomiasis[MeSH] AND (praziquantel[MeSH] OR therapy[sh])',
  refOfficielle:'https://www.who.int/news-room/fact-sheets/detail/schistosomiasis',
},

}; // fin PRO_PATHOGENS

// ─── CONTACTS URGENCE FRANCE ─────────────────────────────────────────────────
const EMERGENCY_CONTACTS = {
  national: [
    {label:'SAMU', number:'15', desc:'Médecin régulateur 24h/24', urgent:true},
    {label:'Centre 15', number:'15', desc:'Régulation médicale — conseil, ambulance, SMUR'},
    {label:'Santé Publique France (InVS)', number:'01 41 79 67 00', desc:'Épidémiosurveillance, déclarations obligatoires'},
    {label:'ANSM — Alerte médicament', number:'01 55 87 30 00', desc:'Pharmacovigilance, rupture médicaments critiques'},
    {label:'CNR Fièvres Hémorragiques (INSERM P4 Lyon)', number:'04 37 28 24 40', desc:'Ebola, Marburg, Lassa, CCHF — Identification urgente'},
    {label:'EPRUS — Réserve sanitaire', number:'0 800 130 000', desc:'Mobilisation réserve sanitaire nationale (gratuit)'},
    {label:'DGS-Urgent (ARS → national)', number:'', desc:'Plateforme numérique DGS-Urgent.fr — alertes nationales'},
  ],
  ars: [
    {region:'Île-de-France', number:'01 44 02 00 00', email:'ars-idf-alerte@ars.sante.fr'},
    {region:'Auvergne-Rhône-Alpes', number:'04 72 34 74 00', email:'ars-ara-alerte@ars.sante.fr'},
    {region:'Nouvelle-Aquitaine', number:'05 57 01 31 00', email:'ars-na-alerte@ars.sante.fr'},
    {region:'Occitanie', number:'05 34 30 27 00', email:'ars-occ-alerte@ars.sante.fr'},
    {region:'Grand Est', number:'03 87 69 47 00', email:'ars-ge-alerte@ars.sante.fr'},
    {region:'Hauts-de-France', number:'03 62 28 18 00', email:'ars-hdf-alerte@ars.sante.fr'},
    {region:'Normandie', number:'02 32 18 25 00', email:'ars-nor-alerte@ars.sante.fr'},
    {region:'Bretagne', number:'02 99 29 67 67', email:'ars-bre-alerte@ars.sante.fr'},
    {region:'Pays de la Loire', number:'02 49 10 40 00', email:'ars-pdl-alerte@ars.sante.fr'},
    {region:'Centre-Val de Loire', number:'02 38 77 37 37', email:'ars-cvl-alerte@ars.sante.fr'},
    {region:'Bourgogne-Franche-Comté', number:'03 81 65 72 00', email:'ars-bfc-alerte@ars.sante.fr'},
    {region:'Provence-Alpes-Côte d\'Azur', number:'04 13 55 80 10', email:'ars-paca-alerte@ars.sante.fr'},
    {region:'Corse', number:'04 95 51 91 91', email:'ars-cor-alerte@ars.sante.fr'},
    {region:'La Réunion', number:'02 62 93 90 00', email:'ars-oi-alerte@ars.sante.fr'},
    {region:'Martinique', number:'05 96 39 42 00', email:'ars-martinique@ars.sante.fr'},
    {region:'Guadeloupe', number:'05 90 99 77 00', email:'ars-guadeloupe@ars.sante.fr'},
    {region:'Guyane', number:'05 94 39 41 00', email:'ars-guyane@ars.sante.fr'},
    {region:'Mayotte', number:'02 69 63 37 00', email:'ars-mayotte@ars.sante.fr'},
  ],
};

// ─── CACHE PUBMED ─────────────────────────────────────────────────────────────
const PUBMED_TTL = 86400000; // 24h

function getCachedPubMed(id) {
  try {
    const raw = localStorage.getItem('biq_pubmed_' + id);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Date.now() - data.ts > PUBMED_TTL) return null;
    return data;
  } catch(e) { return null; }
}

function setCachedPubMed(id, articles) {
  try {
    localStorage.setItem('biq_pubmed_' + id, JSON.stringify({ts:Date.now(), articles}));
  } catch(e) {}
}

async function fetchPubMed(pathogen) {
  const cacheKey = pathogen.id;
  const cached = getCachedPubMed(cacheKey);
  if (cached) return {articles: cached.articles, fromCache: true, cacheDate: new Date(cached.ts)};

  const query = encodeURIComponent(pathogen.pubmedQuery + ' AND ("2024"[pdat] OR "2025"[pdat] OR "2026"[pdat])');
  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${query}&retmax=8&sort=date&retmode=json`;

  try {
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) throw new Error('PubMed search failed');
    const searchData = await searchRes.json();
    const ids = (searchData.esearchresult?.idlist || []).slice(0, 6);
    if (!ids.length) return {articles:[], fromCache:false};

    await new Promise(r => setTimeout(r, 400)); // rate limit 3 req/s

    const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
    const summaryRes = await fetch(summaryUrl);
    if (!summaryRes.ok) throw new Error('PubMed summary failed');
    const summaryData = await summaryRes.json();

    const articles = ids.map(id => {
      const a = summaryData.result?.[id];
      if (!a) return null;
      return {
        pmid: id,
        title: a.title || '',
        authors: (a.authors || []).slice(0,3).map(au => au.name).join(', '),
        journal: a.source || '',
        date: a.pubdate || '',
        doi: (a.elocationid || '').replace('doi: ',''),
      };
    }).filter(Boolean);

    setCachedPubMed(cacheKey, articles);
    return {articles, fromCache:false};
  } catch(e) {
    const stale = (() => {
      try {
        const raw = localStorage.getItem('biq_pubmed_' + cacheKey);
        return raw ? JSON.parse(raw) : null;
      } catch(e2) { return null; }
    })();
    if (stale) return {articles: stale.articles, fromCache:true, cacheDate: new Date(stale.ts), offline:true};
    return {articles:[], fromCache:false, offline:true};
  }
}

// ─── RENDU LISTE ─────────────────────────────────────────────────────────────
function renderPathogenList(container) {
  const dangerOrder = {ROUGE:0,ORANGE:1,JAUNE:2};
  const sorted = Object.values(PRO_PATHOGENS).sort((a,b) => (dangerOrder[a.dangerLevel]||9) - (dangerOrder[b.dangerLevel]||9));

  container.innerHTML = `
    <div class="biq-pro-filters" role="group" aria-label="Filtrer les pathogènes">
      <button class="biq-filter-btn active" data-filter="all" onclick="BIQ_PRO.applyFilter(this,'all')">Tous (${sorted.length})</button>
      <button class="biq-filter-btn" data-filter="ROUGE" onclick="BIQ_PRO.applyFilter(this,'ROUGE')">🔴 Urgence</button>
      <button class="biq-filter-btn" data-filter="ORANGE" onclick="BIQ_PRO.applyFilter(this,'ORANGE')">🟠 Alerte</button>
      <button class="biq-filter-btn" data-filter="DO" onclick="BIQ_PRO.applyFilter(this,'DO')">📋 Déclaration obligatoire</button>
    </div>
    <div class="biq-patho-grid" id="biqPathoGrid">
      ${sorted.map(p => `
        <div class="biq-patho-card" data-danger="${p.dangerLevel}" data-do="${p.declarationObligatoire}"
             onclick="BIQ_PRO.showDetail('${p.id}')" role="button" tabindex="0"
             onkeydown="if(event.key==='Enter'||event.key===' ')BIQ_PRO.showDetail('${p.id}')"
             aria-label="Ouvrir la fiche ${p.nameFR}">
          <div class="biq-patho-card-top">
            <span class="biq-patho-icon" aria-hidden="true">${p.icon}</span>
            <span class="biq-danger-badge biq-danger-${p.dangerLevel.toLowerCase()}">${p.dangerLevel}</span>
          </div>
          <div class="biq-patho-name">${p.nameFR.split('(')[0].trim()}</div>
          <div class="biq-patho-sub">${p.agent.split('—')[0].trim().substring(0,50)}…</div>
          ${p.declarationObligatoire ? '<div class="biq-do-chip">📋 DO</div>' : ''}
          <div class="biq-patho-open">Fiche clinique →</div>
        </div>
      `).join('')}
    </div>`;
}

function applyFilter(btn, filter) {
  document.querySelectorAll('.biq-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.biq-patho-card').forEach(card => {
    let show = true;
    if (filter === 'ROUGE') show = card.dataset.danger === 'ROUGE';
    else if (filter === 'ORANGE') show = card.dataset.danger === 'ORANGE';
    else if (filter === 'DO') show = card.dataset.do === 'true';
    card.style.display = show ? '' : 'none';
  });
}

// ─── RENDU DÉTAIL ─────────────────────────────────────────────────────────────
function showDetail(id) {
  const p = PRO_PATHOGENS[id];
  if (!p) return;
  const container = document.getElementById('biqProContent');
  if (!container) return;

  // push history
  try { history.pushState({biqPathogen:id}, '', location.pathname + '#pathogen-' + id); } catch(e) {}

  container.innerHTML = `
    <button class="biq-back-btn" onclick="BIQ_PRO.showList()" aria-label="Retour à la liste des pathogènes">← Retour à la liste</button>

    <div class="biq-detail-header biq-danger-bg-${p.dangerLevel.toLowerCase()}">
      <div class="biq-detail-icon" aria-hidden="true">${p.icon}</div>
      <div>
        <h2 class="biq-detail-title">${p.nameFR}</h2>
        <div class="biq-detail-meta">
          <span class="biq-danger-badge biq-danger-${p.dangerLevel.toLowerCase()}">${p.dangerLevel}</span>
          <span class="biq-detail-cfr">Létalité : ${p.cfr}</span>
          ${p.declarationObligatoire ? '<span class="biq-do-chip">📋 Déclaration Obligatoire</span>' : ''}
        </div>
      </div>
    </div>

    <!-- SECTION 1 : PRISE EN CHARGE IMMÉDIATE -->
    <details class="biq-section" open>
      <summary class="biq-section-title biq-section-urgent">🚨 Prise en charge immédiate</summary>
      <div class="biq-section-body">
        <div class="biq-epi-banner">
          <strong>EPI soignant :</strong> ${p.epiSoignant.join(' · ')} &nbsp;|&nbsp;
          <strong>Isolement patient :</strong> ${p.isolementPatient}
        </div>
        <ol class="biq-action-list">
          ${p.priseEnChargeImmediate.map(a => `<li>${a}</li>`).join('')}
        </ol>
        <div class="biq-treatment-box">
          <strong>Traitement de référence (information) :</strong><br>
          ${p.traitementFR}
        </div>
        ${p.declarationObligatoire ? `
        <div class="biq-do-box">
          <strong>📋 Déclaration obligatoire</strong><br>${p.declarationDetails}
        </div>` : ''}
      </div>
    </details>

    <!-- SECTION 2 : PROFIL DU PATHOGÈNE -->
    <details class="biq-section">
      <summary class="biq-section-title">🔬 Profil du pathogène</summary>
      <div class="biq-section-body">
        <table class="biq-data-table">
          <tr><th>Agent</th><td>${p.agent}</td></tr>
          <tr><th>Famille</th><td>${p.famille}</td></tr>
          <tr><th>Incubation</th><td>${p.incubation}</td></tr>
          <tr><th>Contagiosité / R0</th><td>${p.contagiosite}</td></tr>
          <tr><th>Réservoir</th><td>${p.reservoir}</td></tr>
          <tr><th>Transmission</th><td>${p.transmission}</td></tr>
          <tr><th>Zones endémiques</th><td>${p.zonesEndemiques}</td></tr>
          <tr><th>Saisonnalité</th><td>${p.saisonalite}</td></tr>
        </table>
        ${p.phases.length > 0 ? `
        <h4 class="biq-phases-title">Évolution clinique</h4>
        <div class="biq-phases">
          ${p.phases.map((ph,i) => `
            <div class="biq-phase-item">
              <div class="biq-phase-num">${i+1}</div>
              <div>
                <div class="biq-phase-name">${ph.nom} <span class="biq-phase-dur">${ph.duree}</span></div>
                <ul class="biq-phase-signs">${ph.signes.map(s=>`<li>${s}</li>`).join('')}</ul>
              </div>
            </div>`).join('<div class="biq-phase-arrow">→</div>')}
        </div>` : ''}
      </div>
    </details>

    <!-- SECTION 3 : SIGNES DE GRAVITÉ -->
    <details class="biq-section" open>
      <summary class="biq-section-title biq-section-danger">⚠️ Signes de gravité — Red Flags</summary>
      <div class="biq-section-body">
        <ul class="biq-red-flags">
          ${p.redFlags.map(f=>`<li>🚩 ${f}</li>`).join('')}
        </ul>
      </div>
    </details>

    <!-- SECTION 4 : BIBLIOGRAPHIE PUBMED LIVE -->
    <details class="biq-section" open>
      <summary class="biq-section-title">📚 Publications récentes (PubMed)</summary>
      <div class="biq-section-body">
        <div id="biqPubMedContainer">
          <div class="biq-pubmed-loading">
            <div class="biq-skeleton"></div><div class="biq-skeleton"></div><div class="biq-skeleton"></div>
          </div>
        </div>
      </div>
    </details>

    <div class="biq-legal-footer">
      BreathIQ — Outil d'information médicale professionnelle — <strong>Non dispositif médical</strong> (Règlement UE 2017/745) —
      Les données présentées sont fournies à titre informatif et ne se substituent pas au jugement clinique du praticien responsable du patient.
    </div>`;

  // Charger PubMed en async
  fetchPubMed(p).then(result => {
    const c = document.getElementById('biqPubMedContainer');
    if (!c) return;
    if (result.offline && !result.articles.length) {
      c.innerHTML = '<p class="biq-pubmed-offline">📵 Mode hors-ligne — bibliographie non disponible. Connectez-vous pour accéder aux publications récentes.</p>';
      return;
    }
    if (!result.articles.length) {
      c.innerHTML = '<p class="biq-pubmed-empty">Aucune publication récente trouvée pour ce pathogène.</p>';
      return;
    }
    const offlineNote = result.offline ? `<p class="biq-pubmed-stale">⚠️ Données du cache (${result.cacheDate?.toLocaleDateString('fr-FR')}) — mode hors-ligne</p>` : '';
    const cacheNote = (result.fromCache && !result.offline) ? `<p class="biq-pubmed-cache">✓ Données mises en cache le ${result.cacheDate?.toLocaleDateString('fr-FR')}</p>` : '';
    c.innerHTML = offlineNote + cacheNote + result.articles.map(a => `
      <div class="biq-article">
        <div class="biq-article-title">
          ${a.doi ? `<a href="https://doi.org/${a.doi}" target="_blank" rel="noopener noreferrer" class="biq-article-link">${a.title}</a>` : a.title}
        </div>
        <div class="biq-article-meta">${a.authors}${a.authors && a.journal ? ' · ' : ''}${a.journal} · ${a.date}</div>
        <a href="https://pubmed.ncbi.nlm.nih.gov/${a.pmid}/" target="_blank" rel="noopener noreferrer" class="biq-pubmed-link">PubMed →</a>
      </div>`).join('');
  });
}

// ─── LISTE DEPUIS DÉTAIL ──────────────────────────────────────────────────────
function showList() {
  try { history.pushState({}, '', location.pathname); } catch(e) {}
  const container = document.getElementById('biqProContent');
  if (container) renderPathogenList(container);
}

// ─── ONGLET CONTACTS ─────────────────────────────────────────────────────────
function renderContacts(container) {
  container.innerHTML = `
    <div class="biq-contacts-section">
      <h3 class="biq-contacts-h3">🇫🇷 Numéros nationaux — Urgences sanitaires</h3>
      <div class="biq-contacts-grid">
        ${EMERGENCY_CONTACTS.national.map(c => `
          <div class="biq-contact-card ${c.urgent ? 'biq-contact-urgent' : ''}">
            <div class="biq-contact-label">${c.label}</div>
            ${c.number ? `<a href="tel:${c.number.replace(/\s/g,'')}" class="biq-contact-number" aria-label="Appeler ${c.label}">${c.number}</a>` : ''}
            <div class="biq-contact-desc">${c.desc}</div>
          </div>`).join('')}
      </div>

      <h3 class="biq-contacts-h3" style="margin-top:1.5rem">🏥 ARS — Agences Régionales de Santé</h3>
      <div class="biq-ars-select-row">
        <label for="biqArsSelect" class="biq-ars-label">Sélectionner une région :</label>
        <select id="biqArsSelect" class="biq-ars-select" onchange="BIQ_PRO.showArs(this.value)">
          <option value="">— Choisir une région —</option>
          ${EMERGENCY_CONTACTS.ars.map(a => `<option value="${a.region}">${a.region}</option>`).join('')}
        </select>
      </div>
      <div id="biqArsDetail" class="biq-ars-detail"></div>
    </div>`;
}

function showArs(region) {
  const ars = EMERGENCY_CONTACTS.ars.find(a => a.region === region);
  const d = document.getElementById('biqArsDetail');
  if (!d) return;
  if (!ars) { d.innerHTML = ''; return; }
  d.innerHTML = `
    <div class="biq-contact-card biq-contact-ars">
      <div class="biq-contact-label">ARS ${ars.region}</div>
      <a href="tel:${ars.number.replace(/[\s.]/g,'')}" class="biq-contact-number" aria-label="Appeler ARS ${ars.region}">${ars.number}</a>
      <div class="biq-contact-desc"><a href="mailto:${ars.email}" class="biq-ars-email">${ars.email}</a></div>
    </div>`;
}

// ─── SYSTÈME D'ONGLETS ────────────────────────────────────────────────────────
function switchTab(tabId) {
  ['biqTabPathogens','biqTabContacts'].forEach(id => {
    const btn = document.getElementById(id);
    const panel = document.getElementById(id + 'Panel');
    if (btn) { btn.classList.toggle('biq-tab-active', id === tabId); btn.setAttribute('aria-selected', id === tabId); }
    if (panel) panel.hidden = id !== tabId;
  });

  if (tabId === 'biqTabContacts') {
    const c = document.getElementById('biqTabContactsPanel');
    if (c && !c.dataset.rendered) { renderContacts(c); c.dataset.rendered = '1'; }
  }
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
function init() {
  const wrapper = document.getElementById('biqProWrapper');
  if (!wrapper || wrapper.dataset.init) return;
  wrapper.dataset.init = '1';

  // Gérer le bouton retour navigateur
  window.addEventListener('popstate', e => {
    if (!e.state?.biqPathogen) showList();
  });

  // Tab par défaut : Pathogènes
  switchTab('biqTabPathogens');
  const c = document.getElementById('biqProContent');
  if (c) renderPathogenList(c);
}

window.BIQ_PRO = { init, showDetail, showList, applyFilter, switchTab, showArs, renderContacts };
return window.BIQ_PRO;

})(); // fin BIQ_PRO
