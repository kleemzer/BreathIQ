# Rapport E : relecture de sécurité clinique indépendante de arbre-fusion.json

Périmètre : seul `arbre-fusion.json` a été lu. Les 90 vignettes et leur orientation attendue ont été écrites et figées avant toute lecture de l'arbre. Le moteur est `E-run.mjs` et le détail se trouve dans `E-vignettes.json`. L'arbre n'a pas été modifié.

## Taux
| Indicateur | Valeur |
|---|---|
| Vignettes | 90 (63 graves, 12 pièges : V09, V32, V57, V66, V70, V71, V84, V85, V86, V87, V88, V69) |
| Résultat atteint | 90/90 (100 %) ; aucune impasse ; aucune boucle |
| Concordance exacte | 62/90 (69 %) |
| **Faux négatifs graves** | **14/63 cas graves (22 %)** : V08, V09, V18, V28, V32, V60, V65, V66, V69, V73, V77, V80, V81, V88 |
| Sous-triage non grave | 6 (V04, V11, V29, V31, V45, V72) |
| Sur-triage | 8 (V20, V22, V43, V58, V61, V70, V84, V85) |

Hypothèses du moteur :
- Les relèvements comptent pour +1 au total, plus +1 pour MOD15 en cas de cumul.
- Pour les mesures (FR, SpO2, pouls, tension), le patient moyen répond « Je ne sais pas ».
- Les ambiguïtés sont notées vignette par vignette dans le champ `ambiguite`.

## Corrections EXIGÉES (ordre de priorité)

**E-01 : fièvre au retour d'une zone d'endémie palustre, sans fièvre franche** (V88, FN grave : autosoins au lieu d'urgente).
- `T_PALU` et `V01` : remplacer « fièvre ≥ 38 °C ou sensation de fièvre » par « fièvre, frissons, sueurs, fatigue inhabituelle, maux de tête ou courbatures, même sans thermomètre ».
- `V05` : ajouter le choix « Fatigue, frissons ou maux de tête » qui renvoie à `RV_PALU` quand un séjour en zone palustre a eu lieu dans les 3 derniers mois.
- `RV_S` ne doit jamais être atteint après une zone palustre sans une question explicite sur la zone.

**E-02 : grossesse et post-partum fébriles** (V65, V66, V69, FN graves).
- MOD08 : relever le plancher en cas de fièvre pendant la grossesse de consultation_rapide à **consultation_urgente** (listériose, chorioamniotite).
- Ajouter dans `POP01` le choix « Accouchement, fausse couche ou IVG il y a moins de 6 semaines », qui pose `pop_post_partum`, avec un plancher consultation_urgente en cas de fièvre.
- Ajouter un nœud `GRO01`, déclenché après `POP01` si `pop_grossesse` : « Contractions, perte de liquide, saignement vaginal ou bébé qui bouge moins ? ». Oui → `U00`.

**E-03 : neutropénie et asplénie fébriles** (V73, V77, FN graves).
- MOD05 : quand la fièvre survient sous chimiothérapie, le plancher devient **urgence_vitale** (ou un résultat dédié « appeler le 15 ou le numéro d'urgence du service d'oncologie, immédiatement »).
- MOD07 : en cas d'asplénie avec fièvre et frissons ou mauvaise tolérance, plancher urgence_vitale ; avec une fièvre isolée, garder consultation_urgente.
- Séparer, dans `POP01`, « chimiothérapie dans les 6 dernières semaines » des autres cancers.

**E-04 : la branche respiratoire `R*` ne pose ni la dyspnée d'effort ni la douleur pleurale** (V09, FN grave).
- Insérer dans `R01`, pour « Toux, poitrine », un équivalent de `G01` et `G02` avant `R03` : essoufflement à l'effort léger, ou douleur thoracique d'un côté en inspirant → `RR_6H`.
- Dans `R04`, l'option « Je ne sais pas » mène à `R07J`, ce qui est cohérent ; aligner le reste sur cette logique.

**E-05 : insuffisances d'organe et diabète fébriles** (V80, V81, FN graves).
- MOD13 : en cas de fièvre chez un patient dialysé ou insuffisant rénal ou cardiaque, plancher **consultation_urgente** au lieu de « relever 1 », qui part d'autosoins.
- MOD12 : avec un diabète, ajouter la question « soif intense, urines abondantes, vomissements, ou glycémie > 2,5 g/L ou cétones positives ? ». Oui → consultation_urgente.
- Ajouter la cirrhose à `POP01` (absente aujourd'hui, V83).

**E-06 : déshydratation du nourrisson** (V60, FN grave).
- MOD04 : quand l'enfant a moins de 2 ans et présente des vomissements ou une diarrhée avec moins de couches mouillées ou un refus de boire, plancher consultation_urgente.
- Dans `D01`, ajouter « moins de couches mouillées que d'habitude (moins de 4 par 24 h) ».
- `U14` : un seuil de 12 h est trop tardif sous 6 mois ; prévoir 6 à 8 h.

**E-07 : dermohypodermite fébrile** (V18, FN grave).
- `C02` = Non → `RC_24H`. Si `C01` = Oui et qu'il y a de la fièvre, orienter vers **RC_6H** (consultation_urgente) ; garder `RC_24H` en l'absence de fièvre.

**E-08 : rétention urinaire fébrile** (V28, FN grave).
- Ajouter le nœud `UR00` en tête de `U_RU` : « Impossible d'uriner, ou seulement quelques gouttes, avec le ventre tendu ? ». Oui → `RU_6H`.
- Prostatite : `UR06` est trop tardif. Pour un homme avec fièvre, `UR05` = Oui doit mener à `RU_6H`.

**E-09 : épiglottite, phlegmon, cellulite orbitaire** (V08, V32, FN graves).
- Scinder `O01` : « impossible d'avaler sa salive, bave, voix étouffée, ou position assise penchée en avant pour respirer » → **U00**. Le trismus et le gonflement du cou restent vers `RO_6H`.
- `O02` : la partie « autour de l'œil avec baisse de la vision, œil qui ne bouge plus ou douleur à la mobilisation de l'œil » → U00.
- Dans `T00`, ajouter « Œil » ou renommer l'entrée en « Gorge, oreille, sinus, œil ».

**E-10 : « Je ne sais pas » à `U01` et `U02`** (V84, V85 : sur-triage massif).
- Un adulte qui ne connaît pas l'âge de la personne parle d'un tiers. Remplacer `U01` « Je ne sais pas » par une question de bascule : « Est-ce un bébé ? ».
- Pour un adulte, `U02` « pas de thermomètre » ne doit pas conduire à `U00`.

**E-11 : chute de la personne âgée**.
- MOD11 cite « chute récente », mais aucune question ne la pose (V70). Ajouter à `POP01`, ou dans `U_RS` pour les 65 ans et plus : « Chute ou perte d'autonomie brutale depuis le début ? ».

**E-12 : hypothermie du nourrisson** (V57).
- Dans `U02`, l'option « Moins de 38 °C » ne distingue pas une température inférieure à 36 °C. Ajouter le choix « Moins de 36 °C » → U00.

**E-13 : seuils incohérents**.
- `S03A` et `S03B` : un seuil de tension ≤ 100 mmHg mène à U00 en S03B, alors que `U12` utilise < 90 mmHg. Harmoniser sur PAS ≤ 100 (qSOFA).
- `U06` : seuil adulte ≥ 30/min, alors que `S01` utilise ≥ 22/min. Harmoniser sur ≥ 22 pour orienter vers urgente, et ≥ 30 pour U00.
- `F01` : une température ≥ 40 °C donne RF_6H, mais `U00` n'est jamais atteint chez l'enfant fébrile de 3 à 24 mois avec un teint gris tant que `U04` est répondu Non.

**E-14 : sous-triage du sujet âgé fébrile** (V04, V72).
- MOD10 : avec la règle « relever 1 », une fièvre isolée chez une personne de 65 ans ou plus aboutit à consultation_programmee. Remplacer par un **plancher consultation_rapide** en cas de fièvre.

**E-15 : expositions non câblées**.
- Les nœuds `EXP_*` renvoient vers `SUITE_CLINIQUE`, qui n'existe pas parmi les nœuds, et aucun nœud ne pointe vers eux.
- `EXP_PALU.effet_si_oui` (plancher consultation_rapide) contredit `RV_PALU` (consultation_urgente). Il faut soit les brancher avec un plancher **consultation_urgente**, soit les supprimer.

**E-16 : formulations**.
- `U_R*` : « Un de ces signes est-il apparu ? » renvoie à une liste qui figure seulement dans `aide`. Elle doit apparaître dans `texte`, sinon la question est ambiguë et risque une réponse Non par défaut.
- `T00` : les options « Fièvre avec … toux » et « Toux… gêne pour respirer » se recouvrent et mènent à des branches de sensibilité différente (E-04).
- `U15` : « sang dans les selles » mène à U00, ce qui est un sur-triage de la dysenterie (V16). Restreindre à un saignement abondant ou associé à un malaise.

## Sur-triages acceptés
- V61 (bronchiolite avec tirage → 15) est défendable.
- V20 et V22 (varicelle, furoncle) sont surorientés d'un ou deux niveaux, sans risque.

---

## Cycle 2 (arbre corrigé, 149 nœuds)

### Méthode
- Ni les vignettes, ni les orientations attendues, ni la gravité n'ont été modifiées. Seuls les chemins ont été re-routés (objet `ROUTE2` dans `E-run.mjs`). Le cycle 1 est conservé tel quel dans `E-vignettes.json` ; le cycle 2 est dans `E-vignettes-cycle2.json`.
- `E-run.mjs` lit désormais `regles_modulation` depuis le fichier. Le champ `population` est évalué comme une expression booléenne de tokens. Le champ `tableau` est traduit en prédicat d'après son texte : fièvre, sans fièvre, respiratoire, urinaire, éruption, couches, chute ou confusion, essoufflement, frissons.
- Les relèvements s'ajoutent au niveau clinique, avec un maximum de +1 en tout, comme l'indique MOD15.
- `POP01` est traité en choix multiples : toutes les populations cochées sont posées, et le chemin suit le choix le plus spécifique (`U_GRO01` en cas de grossesse).
- Les nouveaux nœuds sont gérés : `U01B`, `U_GRO01`, `R01B`, `C02F`, `UR00`, `O07`, ainsi que les nouvelles formes de `O01`, `O02`, `UR05`, `V05` et `U02`.

### Taux
| Indicateur | Cycle 1 | Cycle 2 |
|---|---|---|
| Faux négatifs graves (sur 63 cas graves) | 14 (22 %) | **0 (0 %)** |
| Sous-triage non grave | 6 | 4 (V11, V29, V31, V45) |
| Sur-triage | 8 | 11 |
| Concordance exacte | 62/90 | 75/90 (83 %) |
| Résultat atteint, impasse, boucle | 90/90, 0, 0 | 90/90, 0, 0 |

Les 14 faux négatifs graves du cycle 1 sont tous corrigés.

### Écarts restants
- **Sous-triage, toujours d'un seul niveau, sans gravité :**
  - V11 : toux de 10 jours ;
  - V29 : otite fébrile de l'enfant ;
  - V31 : sinusite de 5 jours ;
  - V45 : urétrite purulente.
- **Sur-triage :**
  - vers urgence_vitale par un relèvement : V70, V79, V82 ;
  - vers urgence_vitale par « Je ne sais pas » : V84, V85 ;
  - V61 : bronchiolite avec tirage, défendable ;
  - V68 : syndrome grippal pendant la grossesse ;
  - V43 : dengue probable ;
  - V20, V22, V58 : un ou deux niveaux au-dessus, sans risque.

### Nouvelles corrections exigées
Il ne reste aucun faux négatif grave. Les corrections ci-dessous portent sur la sécurité du système de soins (l'appel au 15 à tort) et sur la cohérence.

**E-17 : un relèvement ne doit jamais créer une urgence_vitale.** Les règles « relever 1 » (MOD10B, MOD12, MOD13, MOD15) font passer un résultat consultation_urgente à urgence_vitale : V70 (personne âgée qui chute, avec une toux), V79 (pied diabétique fébrile) et V82 (insuffisant cardiaque essoufflé). Dans `regle_fusion`, il faut écrire : « un relèvement est plafonné à consultation_urgente ; seuls les nœuds U00/RH_ISOL et les planchers explicites (MOD01, MOD05B, MOD07B) donnent urgence_vitale ».

**E-18 : « Je ne sais pas » à `U01B`, puis à `U02`, mène à U00** (V84, V85). Quelqu'un qui ne sait pas si la personne est un bébé décrit un tiers dont il ignore tout. Dans `U01B`, « Je ne sais pas » doit renvoyer vers `U03` et poser `pop_age_inconnu`. MOD01, qui cite `pop_age_inconnu_bebe`, désigne un token qu'aucun choix ne pose : il faut soit le poser dans `U01B`, soit le retirer de MOD01.

**E-19 : MOD08 s'applique à toute fièvre pendant la grossesse** (V68 : grippe bien tolérée au 3e mois, orientée vers consultation_urgente). C'est acceptable pour la sécurité, mais cela surcharge les urgences. Proposition à faire valider par un clinicien : consultation_urgente pour une fièvre isolée sans point d'appel (listériose), consultation_rapide pour un syndrome grippal ou une rhinopharyngite. Si l'option est retenue, préciser le champ `tableau` de MOD08.

**E-20 : MOD15 compte deux fois la même fragilité.** Cocher « Chimiothérapie » et « Cancer en cours de traitement » pose `pop_chimio` et `pop_immunodeprime`, ce qui déclenche le cumul (V73). Même chose pour `pop_diabete` et `pop_diabete_desequilibre`. Les populations du même groupe doivent être dédoublonnées avant le calcul de MOD15.

**E-21 : la ligne `V07` est une fausse question.** Les trois réponses mènent toutes à `RV_S`, qui conclut à des autosoins. Pour un séjour en zone palustre sans symptôme, il faut soit supprimer la question, soit faire en sorte que « Oui » affiche le message « fièvre dans les 3 mois = consultation le jour même ». Sinon, la question suggère au patient que sa réponse compte alors qu'elle ne change rien.

**E-22 : sous-triages ORL et IST.**
- `O05` : chez un enfant de moins de 2 ans, ou en cas de fièvre de 38,5 °C ou plus, l'otalgie fébrile doit mener à `RO_48H` (V29).
- `I03` : un écoulement urétral purulent doit mener à consultation_rapide plutôt qu'à `RI_48H` (risque de gonococcie et d'épididymite, V45).
- Ces deux corrections sont mineures.

**E-23 : les règles de modulation ne sont pas exécutables par une machine.** Les champs `tableau` sont en texte libre, par exemple « fièvre isolée, bien tolérée » ou « signes respiratoires sans fièvre ». Le moteur doit les interpréter par mots-clés, ce qui ouvre un risque de divergence entre l'application et cette relecture. Il faut ajouter à chaque règle un champ `condition` en expression booléenne sur des tokens posés par l'arbre (`sig_fievre`, `sig_resp`, `sig_desh`, `sig_frissons`…), et faire poser ces tokens par les nœuds correspondants.

---

## Cycle 3 : final (arbre de 152 nœuds)

### Méthode
- `E-run.mjs` évalue désormais le champ `condition` de chaque règle MOD comme une expression booléenne.
- Les tokens pris en compte sont uniquement ceux posés par les choix du chemin réellement parcouru (token seul ou tableau de tokens). Les drapeaux tirés du texte des vignettes ne sont plus utilisés.
- `cumul_2_groupes` est calculé sur des groupes dédoublonnés : chimiothérapie et immunodépression comptent pour un seul groupe, de même que grossesse et post-partum, et diabète et diabète déséquilibré.
- Les relèvements sont limités à +1 et plafonnés à consultation_urgente, conformément à `regle_fusion`.
- Vignettes, orientations attendues et gravité sont inchangées. Seuls les chemins ont été adaptés : `O05` (V29), `I03` (V45, V48). Sortie dans `E-vignettes-final.json`.

### Taux
| Indicateur | Cycle 1 | Cycle 2 | Cycle 3 |
|---|---|---|---|
| Faux négatifs graves (sur 63 cas graves) | 14 | 0 | **1 (1,6 %)** |
| Sous-triage non grave | 6 | 4 | 2 |
| Sur-triage | 8 | 11 | 8 |
| Concordance exacte | 62 | 75 | **79/90 (88 %)** |
| Résultat atteint, impasse, boucle | 90/90, 0, 0 | 90/90, 0, 0 | 90/90, 0, 0 |

### Écarts restants : tous NON RÉSOLUS, à arbitrer par un clinicien
1. **V60, faux négatif grave.**
   - Vignette : nourrisson de 8 mois, diarrhée et vomissements, couches sèches depuis 8 h. Attendu consultation_urgente, obtenu autosoins_surveillance.
   - Cause : avec l'évaluation par tokens, MOD04 a besoin de `sig_desh`. Ce token n'est posé que par `D01` (Oui ou Je ne sais pas) et par `F04`, et aucune question de la branche D ne porte sur les couches mouillées. `U14` ne se déclenche qu'après 12 h à cet âge.
   - Il s'agit d'une régression du cycle 3 : au cycle 2, le moteur s'appuyait sur le texte de la vignette.
2. **V11, sous-triage** : toux de 10 jours sans fièvre, orientée en autosoins au lieu de consultation_programmee.
3. **V31, sous-triage** : sinusite de 5 jours, orientée en autosoins au lieu de consultation_programmee.
4. **V84, V85, sur-triage** : quand la personne répond « Je ne sais pas » partout, `U03` (« Je ne sais pas ») mène à U00 et MOD19 s'applique. Le résultat reste urgence_vitale.
5. **V61, sur-triage** : bronchiolite avec tirage orientée vers urgence_vitale ; l'orientation est défendable.
6. **V68, sur-triage** : syndrome grippal pendant la grossesse, MOD08 donne consultation_urgente.
7. **V43, sur-triage** : fièvre avec éruption au retour de Thaïlande, orientée en consultation_urgente.
8. **V20, V22, V58, sur-triage** d'un ou deux niveaux : varicelle, furoncle, fièvre bien tolérée chez un enfant de 14 mois.

Plus aucune correction n'est exigée par ce relecteur. Les points ci-dessus sont transmis à l'arbitrage clinique.
