# F — Sources des règles cliniques

Généré le 2026-10-25 par le sous-agent F à partir de arbre-fusion.json (aucune modification de l'arbre). Aucune source n'a été inventée : « à valider (non vérifié) » = pas de source trouvée ni vérifiée. Sources candidates à rechercher en priorité : HAS, SPF, SFMU, SPILF, COREB (FHV/REB), OMS, ECDC, CDC, NICE.

## Points saillants

- **qSOFA détourné** (S01, S03A/B, U12, MOD16) : Sepsis-3 définit qSOFA comme ≥ 2 critères sur 3, outil pronostique adulte, pas de dépistage. L'usage d'un critère isolé (FR ≥ 22) pour fixer un plancher doit être validé ou re-sourcé (ex. NICE NG51 sepsis, non vérifié ici).
- **NICE NG143** : référence existante ; critère < 3 mois ≥ 38 °C confirmé ; l'escalade « 15 » dépasse la recommandation NICE (évaluation urgente) — choix à assumer et documenter.
- **PCIME** : seuils < 5 ans confirmés ; 5–12 ans et adulte ≥ 30/min sans source.
- **Ebola 2–21 j** : vérifié (OMS 2025).
- **Paludisme** : principe vérifié (SPILF 2017) ; fenêtre de 3 mois et délai de 6 h non sourcés.
- 132 règles sur 141 restent « à valider (non vérifié) ».

| Règle | Source | URL | Statut |
|---|---|---|---|
| U00 → urgence_vitale / immediat | — | — | à valider (non vérifié) |
| U01 (seuil/drapeau) — La personne concernée a-t-elle moins de 3 mois ? | — | — | à valider (non vérifié) |
| U02 (seuil/drapeau) — Température mesurée (thermomètre rectal ou frontal) ? | NICE NG143 « Fever in under 5s: assessment and initial management » (2019 ; surveillance avr. 2025 sans modification du feu tricolore) : âge < 3 mois et T ≥ 38 °C = critère rouge (risque élevé). NB : NICE préconise une évaluation urgente, pas systématiquement le 15 ; le choix « appel 15 » est une décision d'orientation propre à BreathIQ. Seuil < 36 °C : non vérifié. | https://www.nice.org.uk/guidance/ng143 (page recommandations 403 ; contenu confirmé via résumé de surveillance NICE avr. 2025 et revue BMJ ADC 2021, consultés 2026-10-25) | partiellement vérifié |
| U03 (seuil/drapeau) — Chez un enfant de moins de 2 ans : pauses respiratoires (arrêt de respirer de plus de 10 s | — | — | à valider (non vérifié) |
| U06 (seuil/drapeau) — Fréquence respiratoire au repos (compter les mouvements de la poitrine pendant 1 minute) ? | OMS, PCIME / IMCI Chart Booklet (2014) : respiration rapide ≥ 50/min (2–12 mois), ≥ 40/min (12 mois–5 ans) ; < 2 mois ≥ 60/min (OMS, Management of the sick young infant, 2019). Seuils 5–12 ans et adulte ≥ 30 : sans source. | https://apo.who.int/publications/i/item/9789241506823 ; https://www.who.int/publications/i/item/9789241516365 (consultés 2026-10-25, tableau lu via source secondaire Univ. Leeds) | partiellement vérifié — relire le booklet |
| U07 (seuil/drapeau) — Saturation en oxygène (SpO2) mesurée au repos avec un saturomètre ? | — | — | à valider (non vérifié) |
| U10 (seuil/drapeau) — Y a-t-il une fièvre (≥ 38 °C) avec une nuque raide (impossible de toucher la poitrine avec | — | — | à valider (non vérifié) |
| U12 (seuil/drapeau) — Y a-t-il un malaise, des étourdissements empêchant de tenir debout, ou une tension artérie | Seuil PAS 100 mmHg : cohérent qSOFA (Singer JAMA 2016) ; usage isolé non sourcé. | https://jamanetwork.com/journals/jama/fullarticle/2492881 (2026-10-25) | usage à valider |
| U14 (seuil/drapeau) — La personne n'a-t-elle pas uriné depuis plus de 12 heures (plus de 6 heures, couches sèche | — | — | à valider (non vérifié) |
| U15 (seuil/drapeau) — Y a-t-il un saignement abondant et inexpliqué (nez qui ne s'arrête pas, vomissements de sa | — | — | à valider (non vérifié) |
| POP00 (seuil/drapeau) — Quel âge a la personne concernée ? | Cité dans l'arbre : « Tranches issues de A-audit.md (A-07) ; seuils à valider » | — | à valider (non vérifié) |
| POP01 (seuil/drapeau) — La personne est-elle dans une ou plusieurs de ces situations ? (plusieurs réponses possibl | Cité dans l'arbre : « Liste fournie par la consigne ; durée de corticothérapie non précisée, à valider » | — | à valider (non vérifié) |
| T_PALU (seuil/drapeau) — Depuis un séjour dans une zone où sévit le paludisme au cours des 3 derniers mois, y a-t-i | SPILF 2017, RPC « Prise en charge et prévention du paludisme d'importation » (mise à jour des RPC 2007, reprises BEH mai 2018) : toute fièvre au retour de zone d'endémie = paludisme jusqu'à preuve du contraire, urgence diagnostique ; P. falciparum surtout < 2 mois après retour. Fenêtre « 3 mois » et liste de zones : à valider (zones à tirer de la carte OMS/SPF voyageurs). | https://www.infectiologie.com (RPC 2017 non lues en texte intégral ; principe confirmé par supports SPILF/JNI 2017 et Rev Prat, consultés 2026-10-25) | partiellement vérifié |
| U_RF (seuil/drapeau) — Depuis le début, un de ces signes est-il apparu : difficulté à respirer, confusion, taches | — | — | à valider (non vérifié) |
| F01 (seuil/drapeau) — Température la plus élevée mesurée ? | — | — | à valider (non vérifié) |
| RF_6H → consultation_urgente / moins_de_6h | — | — | à valider (non vérifié) |
| RF_24H → consultation_rapide / moins_de_24h | — | — | à valider (non vérifié) |
| RF_S → autosoins_surveillance / surveillance | — | — | à valider (non vérifié) |
| U_RG (seuil/drapeau) — Depuis le début, un de ces signes est-il apparu : difficulté à respirer, confusion, taches | — | — | à valider (non vérifié) |
| G03 (seuil/drapeau) — Après une amélioration de 2 jours ou plus, la fièvre ou la toux sont-elles revenues ? | — | — | à valider (non vérifié) |
| RG_6H → consultation_urgente / moins_de_6h | — | — | à valider (non vérifié) |
| RG_24H → consultation_rapide / moins_de_24h | — | — | à valider (non vérifié) |
| RG_S → autosoins_surveillance / surveillance | — | — | à valider (non vérifié) |
| U_RR (seuil/drapeau) — Depuis le début, un de ces signes est-il apparu : difficulté à respirer, confusion, taches | — | — | à valider (non vérifié) |
| R02 (seuil/drapeau) — Les symptômes durent-ils depuis plus de 10 jours sans amélioration ? | — | — | à valider (non vérifié) |
| RR_6H → consultation_urgente / moins_de_6h | — | — | à valider (non vérifié) |
| RR_24H → consultation_rapide / moins_de_24h | — | — | à valider (non vérifié) |
| RR_48H → consultation_programmee / moins_de_48h | — | — | à valider (non vérifié) |
| RR_48H_TOUX → consultation_programmee / moins_de_48h | — | — | à valider (non vérifié) |
| RR_S → autosoins_surveillance / surveillance | — | — | à valider (non vérifié) |
| U_RD (seuil/drapeau) — Depuis le début, un de ces signes est-il apparu : difficulté à respirer, confusion, taches | — | — | à valider (non vérifié) |
| D01 (seuil/drapeau) — Les vomissements empêchent-ils de garder le moindre liquide depuis plus de 6 heures (4 heu | — | — | à valider (non vérifié) |
| RD_6H → consultation_urgente / moins_de_6h | — | — | à valider (non vérifié) |
| RD_24H → consultation_rapide / moins_de_24h | — | — | à valider (non vérifié) |
| RD_48H → consultation_programmee / moins_de_48h | — | — | à valider (non vérifié) |
| RD_S → autosoins_surveillance / surveillance | — | — | à valider (non vérifié) |
| U_RC (seuil/drapeau) — Depuis le début, un de ces signes est-il apparu : difficulté à respirer, confusion, taches | — | — | à valider (non vérifié) |
| C05 (seuil/drapeau) — La lésion est localisée (bouton, abcès, plaie). Y a-t-il de la fièvre (≥ 38 °C) ? | — | — | à valider (non vérifié) |
| RC_6H → consultation_urgente / moins_de_6h | — | — | à valider (non vérifié) |
| RC_24H → consultation_rapide / moins_de_24h | — | — | à valider (non vérifié) |
| RC_24H_ERUPT → consultation_rapide / moins_de_24h | — | — | à valider (non vérifié) |
| RC_48H → consultation_programmee / moins_de_48h | — | — | à valider (non vérifié) |
| U_RU (seuil/drapeau) — Depuis le début, un de ces signes est-il apparu : difficulté à respirer, confusion, taches | — | — | à valider (non vérifié) |
| UR02 (seuil/drapeau) — Y a-t-il une fièvre (≥ 38 °C) ou une douleur dans le bas du dos ? | — | — | à valider (non vérifié) |
| UR04 (seuil/drapeau) — Y a-t-il une fièvre (≥ 38 °C) ou des frissons ? | — | — | à valider (non vérifié) |
| UR05 (seuil/drapeau) — Fièvre (38 °C ou plus) et personne concernée ? | — | — | à valider (non vérifié) |
| RU_6H → consultation_urgente / moins_de_6h | — | — | à valider (non vérifié) |
| RU_24H → consultation_rapide / moins_de_24h | — | — | à valider (non vérifié) |
| RU_48H → consultation_programmee / moins_de_48h | — | — | à valider (non vérifié) |
| U_RO (seuil/drapeau) — Depuis le début, un de ces signes est-il apparu : difficulté à respirer, confusion, taches | — | — | à valider (non vérifié) |
| O04 (seuil/drapeau) — Le mal de gorge dure-t-il depuis plus de 3 jours, ou la température est-elle de 38,5 °C ou | — | — | à valider (non vérifié) |
| O06 (seuil/drapeau) — Les symptômes durent-ils depuis plus de 10 jours, ou se sont-ils aggravés après une amélio | — | — | à valider (non vérifié) |
| RO_6H → consultation_urgente / moins_de_6h | — | — | à valider (non vérifié) |
| RO_48H → consultation_programmee / moins_de_48h | — | — | à valider (non vérifié) |
| RO_S → autosoins_surveillance / surveillance | — | — | à valider (non vérifié) |
| U_RN (seuil/drapeau) — Depuis le début, un de ces signes est-il apparu : difficulté à respirer, confusion, taches | — | — | à valider (non vérifié) |
| N04 (seuil/drapeau) — La lumière est-elle insupportable, ou y a-t-il des vomissements ? | — | — | à valider (non vérifié) |
| N05 (seuil/drapeau) — Ce mal de tête est-il différent des maux de tête habituels, ou dure-t-il depuis plus de 3  | — | — | à valider (non vérifié) |
| RN_24H → consultation_rapide / moins_de_24h | — | — | à valider (non vérifié) |
| RN_S → autosoins_surveillance / surveillance | — | — | à valider (non vérifié) |
| U_RS (seuil/drapeau) — Depuis le début, un de ces signes est-il apparu : difficulté à respirer, confusion, taches | — | — | à valider (non vérifié) |
| S01 (seuil/drapeau) — Au repos, la personne respire-t-elle vite (22 respirations par minute ou plus chez l'adult | Singer M et al. « The Third International Consensus Definitions for Sepsis and Septic Shock (Sepsis-3) », JAMA 2016;315(8):801-810 : qSOFA = ≥ 2 critères parmi FR ≥ 22/min, altération de conscience, PAS ≤ 100 mmHg. ATTENTION : l'arbre utilise FR ≥ 22 seule (MOD16) ; qSOFA n'est ni un outil de dépistage ni validé hors adulte suspect d'infection ; référence vérifiée mais usage non conforme à la source. | https://jamanetwork.com/journals/jama/fullarticle/2492881 (consulté 2026-10-25) | vérifié (référence) / usage à valider |
| S02B (seuil/drapeau) — Comportement inhabituel : somnolence, lenteur, propos décousus ? | — | — | à valider (non vérifié) |
| S03A (seuil/drapeau) — Tension mesurée (chiffre du haut) de 100 mmHg ou moins, OU frissons intenses, peau pâle ou | Singer JAMA 2016 (qSOFA : PAS ≤ 100 mmHg) — même réserve que S01. | https://jamanetwork.com/journals/jama/fullarticle/2492881 (2026-10-25) | vérifié (référence) / usage à valider |
| S05 (seuil/drapeau) — Fréquence cardiaque au repos (pouls compté sur 1 minute) ? | — | — | à valider (non vérifié) |
| RS_6H → consultation_urgente / moins_de_6h | — | — | à valider (non vérifié) |
| RS_24H → consultation_rapide / moins_de_24h | — | — | à valider (non vérifié) |
| U_RV (seuil/drapeau) — Depuis le début, un de ces signes est-il apparu : difficulté à respirer, confusion, taches | — | — | à valider (non vérifié) |
| V02 (seuil/drapeau) — Le séjour a-t-il eu lieu dans une zone où sévit le paludisme, au cours des 3 derniers mois | — | — | à valider (non vérifié) |
| V03 (seuil/drapeau) — Dans les 21 jours avant les symptômes : séjour dans une zone d'épidémie déclarée de fièvre | — | — | à valider (non vérifié) |
| RV_PALU → consultation_urgente / moins_de_6h | SPILF 2017 (urgence diagnostique : frottis/TDR à résultat rapide). Délai 6 h retenu : choix BreathIQ, à valider. | idem T_PALU | partiellement vérifié |
| RV_6H → consultation_urgente / moins_de_6h | — | — | à valider (non vérifié) |
| RV_24H → consultation_rapide / moins_de_24h | — | — | à valider (non vérifié) |
| RV_48H → consultation_programmee / moins_de_48h | — | — | à valider (non vérifié) |
| RV_S → autosoins_surveillance / surveillance | — | — | à valider (non vérifié) |
| U_RH (seuil/drapeau) — Depuis le début, un de ces signes est-il apparu : difficulté à respirer, confusion, taches | — | — | à valider (non vérifié) |
| H01 (seuil/drapeau) — Dans les 21 derniers jours : contact avec une personne malade ou décédée d'une fièvre hémo | — | — | à valider (non vérifié) |
| H02 (seuil/drapeau) — Y a-t-il une fièvre (≥ 38 °C) ou un symptôme (fatigue intense, diarrhée, vomissements) ? | — | — | à valider (non vérifié) |
| RH_ISOL → urgence_vitale / immediat | — | — | à valider (non vérifié) |
| RH_S → autosoins_surveillance / surveillance | — | — | à valider (non vérifié) |
| U_RI (seuil/drapeau) — Depuis le début, un de ces signes est-il apparu : difficulté à respirer, confusion, taches | — | — | à valider (non vérifié) |
| I01 (seuil/drapeau) — Rapport sexuel sans préservatif (ou rupture) avec un risque d'infection, il y a moins de 4 | — | — | à valider (non vérifié) |
| I02 (seuil/drapeau) — Y a-t-il une fièvre (≥ 38 °C) avec une douleur du bas-ventre ou des testicules ? | — | — | à valider (non vérifié) |
| RI_6H_TPE → consultation_urgente / moins_de_6h | Cité dans l'arbre : « Délai de 48 h pour le traitement post-exposition : à valider » | — | à valider (non vérifié) |
| RI_6H → consultation_urgente / moins_de_6h | — | — | à valider (non vérifié) |
| RI_48H → consultation_programmee / moins_de_48h | — | — | à valider (non vérifié) |
| RI_48H_DEP → consultation_programmee / moins_de_48h | — | — | à valider (non vérifié) |
| U_RM (seuil/drapeau) — Depuis le début, un de ces signes est-il apparu : difficulté à respirer, confusion, taches | — | — | à valider (non vérifié) |
| M02 (seuil/drapeau) — La plaie est-elle profonde, au visage, aux mains ou aux organes génitaux, ou le saignement | — | — | à valider (non vérifié) |
| M05 (seuil/drapeau) — Une rougeur en anneau qui s'étend (5 cm ou plus) est-elle apparue autour de la piqûre ? | — | — | à valider (non vérifié) |
| RM_6H → consultation_urgente / moins_de_6h | — | — | à valider (non vérifié) |
| RM_6H_RAGE → consultation_urgente / moins_de_6h | — | — | à valider (non vérifié) |
| RM_24H → consultation_rapide / moins_de_24h | — | — | à valider (non vérifié) |
| RM_48H → consultation_programmee / moins_de_48h | — | — | à valider (non vérifié) |
| RM_48H_T → consultation_programmee / moins_de_48h | — | — | à valider (non vérifié) |
| RM_24H_T → consultation_rapide / moins_de_24h | — | — | à valider (non vérifié) |
| RM_S → autosoins_surveillance / surveillance | — | — | à valider (non vérifié) |
| R07J (seuil/drapeau) — Les crachats contiennent-ils du sang ? | — | — | à valider (non vérifié) |
| V06 (seuil/drapeau) — Le séjour a-t-il eu lieu dans une zone où sévit le paludisme, au cours des 3 derniers mois | — | — | à valider (non vérifié) |
| V07 (seuil/drapeau) — Le séjour a-t-il eu lieu dans une zone où sévit le paludisme, au cours des 3 derniers mois | — | — | à valider (non vérifié) |
| U_GRO01 (seuil/drapeau) — Pendant cette grossesse : contractions, perte de liquide, saignement vaginal, ou bébé qui  | — | — | à valider (non vérifié) |
| R01B (seuil/drapeau) — Avec la toux, lequel de ces cas correspond ? | — | — | à valider (non vérifié) |
| C02F (seuil/drapeau) — Y a-t-il de la fièvre (38 °C ou plus, ou sensation de fièvre) ? | — | — | à valider (non vérifié) |
| U02B (seuil/drapeau) — Âge inconnu, peut-être un bébé : température mesurée ? | — | — | à valider (non vérifié) |
| RV_S_PALU → autosoins_surveillance / surveillance | — | — | à valider (non vérifié) |
| RI_24H → consultation_rapide / moins_de_24h | — | — | à valider (non vérifié) |
| MOD01 [pop_nourrisson_moins_3m \|\| pop_age_inconnu_bebe] fièvre ≥ 38 °C (mesurée, ou « je ne sais pas ») → plancher urgence_vitale | Cité : « à valider (consigne ; court-circuite toute autre question) » | — | à valider (non vérifié) |
| MOD02 [pop_nourrisson_moins_3m] tout résultat sans fièvre → relever 1 | Cité : « à valider » | — | à valider (non vérifié) |
| MOD03 [pop_enfant_3m_2a] fièvre → plancher consultation_rapide | Cité : « à valider » | — | à valider (non vérifié) |
| MOD04 [pop_nourrisson_moins_3m \|\| pop_enfant_3m_2a] vomissements ou diarrhée avec moins de couches mouillées (< 4 par 24 h) ou refus de boire → plancher consultation_urgente | Cité : « à valider » | — | à valider (non vérifié) |
| MOD05 [pop_immunodeprime] fièvre → plancher consultation_urgente | Cité : « à valider (consigne) » | — | à valider (non vérifié) |
| MOD06 [pop_immunodeprime] tout autre tableau infectieux → relever 1 | Cité : « à valider » | — | à valider (non vérifié) |
| MOD07 [pop_asplenie] fièvre isolée, bien tolérée → plancher consultation_urgente | Cité : « à valider » | — | à valider (non vérifié) |
| MOD08 [pop_grossesse] fièvre → plancher consultation_urgente | Cité : « à valider (listériose, chorioamniotite) » | — | à valider (non vérifié) |
| MOD09 [pop_grossesse] signes urinaires, ou fièvre + éruption → plancher consultation_rapide | Cité : « à valider » | — | à valider (non vérifié) |
| MOD10 [pop_65_plus] fièvre → plancher consultation_rapide | Cité : « à valider » | — | à valider (non vérifié) |
| MOD11 [pop_65_plus && (confusion \|\| pop_chute)] confusion ou chute / perte d'autonomie récente → plancher consultation_urgente | Cité : « à valider » | — | à valider (non vérifié) |
| MOD12 [pop_diabete] fièvre, ou plaie / infection du pied → relever 1 | Cité : « à valider » | — | à valider (non vérifié) |
| MOD13 [pop_insuffisance_organe] fièvre → plancher consultation_urgente | Cité : « à valider » | — | à valider (non vérifié) |
| MOD14 [pop_insuffisance_organe] essoufflement inhabituel → plancher consultation_urgente | Cité : « à valider » | — | à valider (non vérifié) |
| MOD15 [cumul : ≥ 2 populations à risque] fièvre → relever 1 | Cité : « à valider (pas de cumul au-delà de +1, à arbitrer) » | — | à valider (non vérifié) |
| MOD05B [pop_chimio] fièvre (ou « je ne sais pas ») → plancher urgence_vitale | Cité : « à valider ; message : appeler le 15 ou le numéro d'urgence du service d'oncologie, immédiatement » | — | à valider (non vérifié) |
| MOD07B [pop_asplenie] fièvre avec frissons ou mauvaise tolérance → plancher urgence_vitale | Cité : « à valider » | — | à valider (non vérifié) |
| MOD08B [pop_post_partum] fièvre → plancher consultation_urgente | Cité : « à valider » | — | à valider (non vérifié) |
| MOD04B [pop_enfant_3m_2a] signes respiratoires → relever 1 | Cité : « à valider » | — | à valider (non vérifié) |
| MOD10B [pop_65_plus] signes respiratoires sans fièvre → relever 1 | Cité : « à valider » | — | à valider (non vérifié) |
| MOD12B [pop_diabete_desequilibre] tout tableau → plancher consultation_urgente | Cité : « à valider » | — | à valider (non vérifié) |
| MOD13B [pop_insuffisance_organe] signes respiratoires sans fièvre → relever 1 | Cité : « à valider » | — | à valider (non vérifié) |
| MOD16 [sig_fr_22_29] fréquence respiratoire adulte 22 à 29/min → plancher consultation_urgente | Dérivé de qSOFA (Singer JAMA 2016) mais critère isolé : non conforme à la source | https://jamanetwork.com/journals/jama/fullarticle/2492881 | à valider (non vérifié) |
| MOD17 [expo_contact_meningite] tout tableau → plancher consultation_rapide | Cité : « à valider (prophylaxie décidée par un médecin) » | — | à valider (non vérifié) |
| MOD18 [expo_hanta] fièvre ou essoufflement → plancher consultation_urgente | Cité : « à valider » | — | à valider (non vérifié) |
| MOD19 [pop_age_inconnu_bebe] température inconnue à U02B → plancher consultation_urgente | Cité : « à valider (E-18) » | — | à valider (non vérifié) |
| MODG [toute population] règle générale → plancher max(niveau clinique, planchers, relèvements) | Cité : « A-audit.md A-01 (un seul niveau final = max) ; « Je ne sais pas » = oui » | — | règle de conception (pas clinique) |
| Incubation Ebola 2 à 21 j (fenêtre de la question FHV V03/H01) | OMS, aide-mémoire « Maladie à virus Ebola », 24 avril 2025 : « varies from 2 to 21 days » | https://www.who.int/news-room/fact-sheets/detail/ebola-virus-disease (consulté 2026-10-25) | vérifié |
| ACT_EBOLA (activation V03 / H01) | Alerte OMS citée (Disease Outbreak News) — contenu non relu par F | https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON619 | à valider (non vérifié) ; ajouter date de péremption |
| ACT_HANTA (activation POP01 (expo_hanta) (volet croisière)) | Alerte OMS citée (Disease Outbreak News) — contenu non relu par F | https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON611 | à valider (non vérifié) ; ajouter date de péremption |
| ACT_ARBO_FR (activation V01 (mention cas autochtones en France hexagonale)) | Alerte OMS citée (Disease Outbreak News) — contenu non relu par F | Santé publique France, bulletin arboviroses du 2026-10-07 | à valider (non vérifié) ; ajouter date de péremption |
| ACT_WESTNILE_FR (activation aucune question dédiée ; message d'information si fièvre + signes neurologiques) | Alerte OMS citée (Disease Outbreak News) — contenu non relu par F | Santé publique France | à valider (non vérifié) ; ajouter date de péremption |
| ACT_NIPAH (activation POP01 (expo_contact_meningite) (mention voyage)) | Alerte OMS citée (Disease Outbreak News) — contenu non relu par F | https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON609 | à valider (non vérifié) ; ajouter date de péremption |
| ACT_MERS (activation POP01 (expo_contact_meningite) (mention voyage)) | Alerte OMS citée (Disease Outbreak News) — contenu non relu par F | https://www.who.int/emergencies/disease-outbreak-news/item/middle-east-respiratory-syndrome-coronavirus---kingdom-of-saudi-arabia | à valider (non vérifié) ; ajouter date de péremption |
| ACT_FIEVRE_JAUNE (activation T_PALU (mention voyage tropical)) | Alerte OMS citée (Disease Outbreak News) — contenu non relu par F | https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON610 | à valider (non vérifié) ; ajouter date de péremption |
