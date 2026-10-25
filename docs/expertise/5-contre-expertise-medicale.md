# 5 — Contre-expertise médicale adversariale (triage + pages FHV)

Rôle : infectiologue et urgentiste senior, en contre-expertise. Le but est de chercher les erreurs, pas de valider. Date : 2026-10-25. Branche : `fix/audit-lancement`. Commits relus : 4ab3f41 (triage) et 44d8638 (pages FHV).
Toutes les sources ont été relues directement en ligne le **25/10/2026**, sans se fier à ce qu'ont écrit les experts 1, 3 et 4. Brouillon à valider par le médecin validateur. Aucun commit n'a été fait.

## A. Vérification des sources

| # | Affirmation contrôlée | Verdict | Source primaire (consultée le 25/10/2026) |
|---|---|---|---|
| 1 | NICE NG253 existe : publiée le 19/11/2025, mise à jour le 23/09/2026 | Confirmé | https://www.nice.org.uk/guidance/ng253 |
| 2 | NG253, FR : ≥ 25/min = haut risque ; 21–24/min = risque modéré | Confirmé | https://www.nice.org.uk/guidance/ng253/chapter/Evaluating-risk |
| 3 | NG253, PAS : ≤ 90 mmHg (ou baisse de plus de 40 mmHg) = haut risque ; 91–100 mmHg = risque modéré | Confirmé | idem |
| 4 | NG253, diurèse : pas d'urine depuis 18 h = haut risque ; 12–18 h = risque modéré | Confirmé | idem |
| 5 | NG253 rec. 1.10.1 : SpO2 cible 94–98 %, ou 88–92 % en cas de risque hypercapnique | Confirmé | https://www.nice.org.uk/guidance/ng253/chapter/Antibiotic-therapy-intravenous-fluid-and-oxygen |
| 6 | NEWS2 : FR 21–24 = 2 points, ≥ 25 = 3 ; SpO2 échelle 1 : ≤ 91 = 3, 92–93 = 2, 94–95 = 1 ; échelle 2 : 88–92 = 0 ; PAS ≤ 90 = 3, 91–100 = 2 | Confirmé (PDF lu) | https://www.rcp.ac.uk/media/alxev00t/news2-chart-1_the-news-scoring-system_0_0.pdf |
| 7 | NG143 : SpO2 ≤ 95 % = orange ; « reduced urine output » sans durée chiffrée ; < 3 mois et ≥ 38 °C = haut risque | Confirmé. Le seuil de 6 h reste un choix BreathIQ, sans source | https://www.nice.org.uk/guidance/ng143/chapter/Recommendations |
| 8 | DON585, Marburg en Éthiopie, 21/11/2025 | Confirmé. **Corrigé dans le doc 4** : à cette date, l'OMS compte 6 cas confirmés et 3 probables, et 6 décès, dont 3 confirmés (le doc 4 écrivait « 3 décès ») | https://www.who.int/emergencies/disease-outbreak-news/item/2025-DON585 |
| 9 | Fin de l'épidémie en Éthiopie : 14 confirmés et 5 probables, 9 + 5 décès ; létalité de 74 % et de 64 % | Confirmé. L'OMS Afrique ne donne pas la date exacte de la déclaration ; le 26/01/2026 est la date de publication | https://www.afro.who.int/countries/ethiopia/news/ethiopia-declares-end-first-ever-marburg-virus-disease-outbreak |
| 10 | Tanzanie 2025 (DON559) : 2 confirmés et 8 probables, 10 décès, fin le 13/03/2025 | Confirmé | https://www.who.int/emergencies/disease-outbreak-news/item/2025-DON559 |
| 11 | Rwanda 2024 : 66 cas, 15 décès, fin le 20/12/2024 | Confirmé | https://www.afro.who.int/countries/rwanda/news/marburg-outbreak-rwanda-declared-over |
| 12 | Tableau historique Marburg (aide-mémoire OMS) | Confirmé, ligne par ligne | https://www.who.int/news-room/fact-sheets/detail/marburg-virus-disease |
| 13 | Bundibugyo (DON603, 21/05/2026) : létalité d'« environ 30 à 50 % » en 2007 et 2012 | Confirmé. **Mais l'information était incomplète, corrigé** : la page affiche « ACTIF — PHEIC » (urgence de santé publique de portée internationale, déclarée le 17/05/2026) sans donner la létalité de l'épidémie en cours. Celle-ci est de **12 %** (10 décès pour 85 cas confirmés au 21/05/2026). Ajouté dans ebola.html et ebola-en.html | https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON603 |
| 14 | Aide-mémoire OMS Lassa : létalité globale de 1 %, ≥ 15 % chez les hospitalisés graves ; efficacité de la ribavirine incertaine | Confirmé | https://www.who.int/news-room/fact-sheets/detail/lassa-fever |
| 15 | McCormick 1986, NEJM 314:20-26 : 55 % (33/60) ; 5 % (1/20) si traitement débuté dans les 6 jours ; 26 % (11/43) si débuté à 7 jours ou plus | Confirmé (PubMed, PMID 3940312) | https://doi.org/10.1056/NEJM198601023140104 |
| 16 | Eberhardt 2019, IJID 87:15-20 : risque de biais critique ; OR 0,41 si ASAT élevées, OR 2,37 sans ASAT élevées | Confirmé (PubMed, PMID 31357056) | https://doi.org/10.1016/j.ijid.2019.07.015 |
| 17 | R3113-1 (circuits ARS et ANSP), R3113-2 (données transmises), R3113-3 (signalement « sans délai » à l'ARS) | Confirmé | https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072665/LEGISCTA000006178560/ |
| 18 | D3113-8 à D3113-10 en vigueur ; D3113-8 cite les « fièvres hémorragiques africaines » et ne nomme pas la FHCC | Confirmé. Ces articles sont en vigueur depuis le **04/08/2023** (décret 2023-716) | https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072665/LEGISCTA000006190444/ |
| 19 | D3113-6 et D3113-7 abrogés au 02/08/2023 « par les décrets 2023-700 et 2023-716 » | **Corrigé (doc 4)** : l'abrogation vient du seul **décret 2023-700 du 31/07/2023**. Les articles étaient en vigueur jusqu'au 02/08/2023. Le décret 2023-716 crée les articles D3113-8 à D3113-10 | Légifrance, lien du point 17 |
| 20 | Fiche COREB FHCC (version du 31/03/2026) : recours à l'expertise (infectiologue référent REB, ARS, SAMU, CNR) | Confirmé. La fiche précise aussi : « Ribavirine : efficacité discutée en curatif » | https://www.coreb.infectiologie.com/UserFiles/File/20250702-fiche-reb-fhcc.pdf |
| 21 | La liste SPF des maladies à déclaration obligatoire ne nomme pas la FHCC, seulement les « fièvres hémorragiques africaines » | Confirmé. La question de savoir si la FHCC relève de cet intitulé reste **douteuse**, à poser à SPF ou à la DGS | https://www.santepubliquefrance.fr/liste-des-maladies-a-signalement-obligatoire |

## B. Corrections des pages

- **cchf.html / cchf-en.html, encadré de chiffres clés.** « Ribavirine — traitement IV disponible » devient « efficacité discutée (COREB) ». L'ancien libellé contredisait la fiche COREB et le traitement de la même question sur la page Lassa. Source : point 20.
  - Restent à reformuler éditorialement : le bandeau et les méta-descriptions, qui disent « Ribavirine IV » (verdict douteux, ce n'est pas faux au sens strict).
- **ebola.html / ebola-en.html, ligne Bundibugyo.** Ajout de la létalité de l'épidémie 2026 : 12 %, soit 10 décès pour 85 cas au 21/05/2026. Source : point 13.

## C. Régressions cliniques du triage

Méthode : 25 vignettes limites jouées dans `js/triage-engine.js` avec `data/triage.json`. Le script est dans le scratchpad (`vign.mjs`), il ne fait pas partie du dépôt.

| Cas | Résultat | Verdict |
|---|---|---|
| T_PALU « Oui » (fièvre au retour d'une zone d'endémie de moins de 3 mois), puis V01 « Non » (réponse contradictoire) | **Avant : RV_S en autosoins_surveillance.** Le chemin V07 « Oui » donnait de même RV_S_PALU en autosoins | **Corrigé : sous-orientation grave.** Ajout du jeton `expo_palu_3m` (posé par T_PALU « Oui » ou « Je ne sais pas ») et de la règle **MOD22** : plancher consultation_urgente, redirection vers le texte RV_PALU. Source : Pilly 2020, item 170 ; ARBITRAGES §2 |
| Nourrisson de moins de 3 mois avec fièvre (U01 Oui ou « Je ne sais pas », ou bien U01 Non mais POP00 « moins de 3 mois ») | R_NRS_2H, urgence_sans_delai | Confirmé |
| Nourrisson de moins de 3 mois sans fièvre, avec toux et rhume | consultation_programmee (48 h, après relèvement par MOD02) | **Douteux.** Pas de source pour corriger ; à arbitrer (bronchiolite, apnées) |
| Grossesse avec fièvre | consultation_urgente (MOD08) | Confirmé |
| Chimiothérapie avec fièvre | urgence_vitale (MOD05B) | Confirmé |
| Immunodéprimé avec fièvre | consultation_urgente | Confirmé |
| Asplénie avec fièvre, sans frissons | consultation_urgente | Douteux : le niveau urgence_vitale se discute. Non modifié |
| Adulte : FR 21–24 et PAS 91–100 | urgence_vitale (MOD21) | Confirmé |
| FR seule, ou PAS seule | consultation_urgente | Confirmé |
| Maux de tête et fièvre ≥ 38 °C, sans photophobie, vomissements ni raideur de nuque | consultation_rapide (24 h) | Douteux : à arbitrer |
| Purpura (U09), raideur de nuque (U10) | U00 | Confirmé |
| Enfant de 3 mois à 2 ans avec fièvre | consultation_rapide (MOD03) | Douteux : NG143 classe 3–6 mois et ≥ 39 °C en orange, mais l'arbre ne distingue pas cette tranche d'âge. Non modifié |

## D. Cohérence FR/EN et patient/soignant

- Les corrections ont été appliquées à l'identique en FR et en EN.
- Les autres contrôles FR/EN n'ont relevé aucun écart de chiffre sur les quatre pages.
- Le bandeau Marburg « 24–88 % » reprend la fourchette de l'aide-mémoire OMS. Le tableau contient pourtant aussi 0 % (Yougoslavie 1967) et 100 % (Tanzanie 2025). Verdict : douteux, une précision serait utile.

## E. Chiffres sans source

- 6 h de couches sèches : déjà assumé comme un choix BreathIQ.
- FR ≥ 30/min chez l'enfant de 5 à 12 ans.
- Les délais « dans l'heure » du circuit de signalement FHV.
- Les règles MOD02 à MOD15 sont marquées « à valider ».

## F. Contrôles

- `node scripts/build-triage.mjs` : OK, 155 nœuds.
- `npm test` : 90/90 vignettes, **0 faux négatif grave**, 89 identiques au relecteur.
- `node docs/triage/F-check.mjs` : 0 erreur, 5 alertes A11Y-COULEUR déjà présentes.
- `check-tree` : OK.
- Aucun niveau n'a été abaissé.

## G. Arbitrages finaux (25/10/2026)

Détail et sources : ARBITRAGES.md §6, F-sources.md. Aucun niveau abaissé.

| Point douteux | Décision | Source vérifiée en ligne |
|---|---|---|
| Asplénie avec fièvre (consultation_urgente) | **Relevé à urgence_sans_delai (< 2 h)** : MOD23 → R_ASPL_2H | SPILF/SFLS 2019, d'après HCSP 2015 (OPSI, antibiotique dans l'heure) |
| Nourrisson < 3 mois, toux sans fièvre (48 h) | **Relevé à consultation_urgente (< 6 h)** : MOD24 → RR_NRS_6H | HAS/CNPP 2019 (< 2 mois vulnérable, < 6 semaines surveillance hospitalière) ; NICE NG9 1.1.5, 1.2.3 |
| Céphalée et fièvre, sans autre signe (24 h) | **Maintenu** : nuque raide, purpura, confusion, conscience, photophobie et vomissements sont demandés avant | NICE NG240 1.1.4, 1.1.9 |
| 3–6 mois et ≥ 39 °C | **Ajout de la question U_NRS36 + MOD25 → consultation_urgente (< 6 h)** | NICE NG143 1.2.13 et tableau (orange), 1.3.4 |
| cchf « Ribavirine IV » (méta, bandeau) | **Reformulé** : « prise en charge spécialisée » | Fiche COREB FHCC |

Écart découvert en ajoutant les vignettes, corrigé : le chemin R01 « Nez et gorge » ne demandait pas la température. La question U_R02F (fièvre, activée chez les personnes fragiles) pose désormais le token de fièvre, ce qui active les planchers. Vignettes V92 et V98.

Contrôles : 98/98 vignettes, 0 faux négatif grave ; F-check 0 erreur ; check-tree OK.

Validation clinique : Dr Clément Médeau — date : ______ — signature : ______
