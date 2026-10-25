# Arbitrages cliniques — 25/10/2026

Proposés à partir des sources ci-dessous. **À confirmer par le médecin validateur** avant mise en ligne.

## 1. Fièvre pendant la grossesse (E-19)
- **Décision :** maintenir le plancher **consultation_urgente (< 6 h)** pour toute fièvre ≥ 38 °C pendant la grossesse. Orienter vers les **urgences de la maternité** (ou un médecin en urgence avant 20 SA si la maternité n'accueille pas). Frissons intenses, fièvre ≥ 39 °C, contractions, perte de liquide, saignement ou malaise → urgence_vitale ({URGENCE}).
- **Pourquoi :** la listériose, la pyélonéphrite et la chorioamniotite sont à éliminer en priorité, avec hémocultures et bilan maternel et fœtal. Une température > 38 °C doit faire consulter aux urgences de la maternité.
- **Sources :** Memento Sages-femmes (Elsevier) ; La Revue du Praticien, « Fièvre et grossesse : points forts » ; cours UNF3S de gynécologie-obstétrique, chap. 25. Le texte CNGOF/HAS à jour n'a pas été consulté directement : **à vérifier**.
- **Ce qui est écarté :** la proposition de E-19 d'abaisser le niveau pour un syndrome grippal sans autre signe. Le tableau grippal ne permet pas d'exclure une listériose, qui débute souvent de façon pseudo-grippale.

## 2. Fièvre au retour d'une zone d'endémie palustre
- **Décision :**
  - Fenêtre : fièvre, ou frissons, sueurs, maux de tête, courbatures, **pendant le voyage et dans les 3 mois suivant le retour** → **consultation_urgente (< 6 h)**, le jour même, en précisant le voyage. Le diagnostic (frottis et goutte épaisse) se fait en urgence, avec un résultat en moins de 2 h.
  - Signes de gravité (confusion, vomissements répétés, urines foncées, jaunisse, respiration difficile, malaise) → urgence_vitale.
  - Au-delà de 3 mois : P. vivax et P. ovale peuvent donner des accès tardifs. Le résultat dit alors : « signalez votre voyage au médecin », niveau consultation_rapide (< 24 h).
- **Sources :** CMIT/SPILF, Pilly étudiant ECN 2020, item 170 (« accès à P. falciparum… jusqu'à 3 mois après avoir quitté cette zone » ; « recherche de paludisme en urgence en cas de fièvre lors du voyage et dans les 3 mois qui suivent le retour » ; résultat biologique en moins de 2 heures). Recommandations SPILF 2017 sur le paludisme d'importation.
- **Changement :** le délai passe de « moins de 24 h » (cahier des charges) à « moins de 6 h », un choix plus prudent et conforme à la notion d'urgence diagnostique.

## 3. Nourrisson de moins de 3 mois avec fièvre ≥ 38 °C
- **Décision :** créer un résultat **« Urgences pédiatriques sans attendre »** (délai : immédiat, moins de 2 h ; il ne s'agit pas du 15 par défaut). Message : « Allez tout de suite aux urgences pédiatriques. Ne donnez pas de médicament contre la fièvre sans avis. »
  - Escalade vers le 15 ({URGENCE}) si l'un de ces signes est présent : difficulté à respirer, bébé difficile à réveiller ou qui ne réagit pas, teint gris ou marbré, convulsions, taches qui ne s'effacent pas.
  - Escalade vers le 15 aussi en l'absence de moyen d'arriver rapidement aux urgences, ou si le bébé a moins de 28 jours et qu'aucun transport n'est possible.
  - Ne pas donner d'ibuprofène avant 3 mois, mention côté soignant uniquement.
- **Pourquoi :** NICE NG143 classe tout nourrisson de moins de 3 mois avec une fièvre ≥ 38 °C en catégorie « rouge » et prévoit une évaluation en face à face urgente (secondaire : délai de 2 h) ou un avis pédiatrique spécialisé, pas un appel systématique aux services d'urgence. Le risque d'infection bactérienne sévère est de 7 à 23 % entre 1 et 3 mois, et toute fièvre avant 28 jours justifie l'hospitalisation (Vidal, recommandations « Fièvre de l'enfant », d'après HAS/SFP).
- **Sources :** NICE NG143, page officielle (accès refusé au robot, contenu confirmé par la revue BMJ ADC Education & Practice 2021) ; Vidal, recommandation 3758 « Fièvre de l'enfant ».

## 4. Bloquants techniques corrigés sur la même base
- **V60, déshydratation du nourrisson :** ajouter dans D01 (âge < 2 ans) « Couches sèches depuis plus de 6 heures, ou bébé qui refuse de boire » → consultation_urgente ; s'y ajoutent somnolence ou yeux creusés → urgence_vitale. Source : NICE NG143 et CG84 (diminution de la diurèse = signe d'alerte) — **à vérifier** pour le seuil de 6 h.
- **qSOFA :** urgence_vitale seulement si **au moins 2** des 3 critères observables sont présents (respiration rapide ≥ 22/min, confusion, tension systolique ≤ 100 mmHg), selon Singer et al., JAMA 2016;315(8):801-810. Un seul critère avec fièvre → consultation_urgente. Côté soignant, préciser que le qSOFA est un outil pronostique et non un outil de dépistage.

### Précision du 25/10 (après re-test)
- **Confusion isolée (U08) → urgence_vitale, maintenu.** Une confusion aiguë est un drapeau rouge à elle seule (méningite, encéphalite, sepsis, hypoxie), avec ou sans autre critère qSOFA. La règle « 1 critère qSOFA → consultation_urgente » ne s'applique donc qu'à la fréquence respiratoire et à la tension. Choix plus prudent que la lettre du §4.
- **Grossesse (§1) :** l'escalade vers le 15 en cas de frissons intenses, fièvre ≥ 39 °C, contractions, perte de liquide, saignement, malaise ou diminution des mouvements fœtaux est portée par U_GRO01 (Oui ou Je ne sais pas → U00). Une vignette dédiée est à ajouter au prochain passage.

## 5. Branche « frissons / état général altéré » (S) : doublons du filtre d'urgence retirés (25/10)
- **Constat :** S01 (FR ≥ 22/min), S03A (volet tension) et S03B (PAS ≤ 100 mmHg) redemandaient ce que U06 et U12 ont déjà recueilli avec les mêmes seuils qSOFA. U06 : ≥ 30/min → U00, 22 à 29/min → `sig_fr_22_29`. U12 : < 90 mmHg ou « Je ne sais pas » → U00, 90 à 100 mmHg → `sig_pas_100`. Aucun seuil propre à la branche (qSOFA = même 22/min et même 100 mmHg) : ce sont de vrais doublons.
- **Décision :**
  - U06 « Je ne sais pas / pas compté » pose maintenant `sig_fr_inconnue`.
  - U_RS « Non, aucun » est routé selon le jeton : `sig_fr_22_29` → S02B ; `sig_fr_inconnue` → S01, question conservée car seule source d'information sur la FR ; sinon → S02A.
  - S02B « Non » : `sig_pas_100` → U00 (2 critères qSOFA), sinon → RS_6H.
  - S02A « Oui » ou « Je ne sais pas » : même règle.
  - S02A « Non » : `sig_pas_100` ou `sig_frissons` (posé par T00) → RS_6H ; sinon → S03A.
  - S03A ne porte plus que le volet clinique : frissons intenses, pâleur ou teint gris, extrémités froides.
  - S03B est supprimé.
- **Sensibilité :** aucune perte. Chaque combinaison (FR, PAS) mène au même niveau qu'avant, ou à un niveau plus élevé.
  - Changement assumé : des frissons déclarés à T00, sans autre critère, mènent désormais à RS_6H (< 6 h) au lieu de passer par S05, où RS_24H restait possible. C'est cohérent avec F03 (frissons intenses → RF_6H), car des frissons intenses font suspecter une bactériémie.
- **Limite :** S02 (somnolence, lenteur) recoupe en partie U04 et U08, mais avec un seuil plus large (GCS < 15). Elle est conservée.
- **Contrôles :** 90/90 vignettes, 0 faux négatif grave. F-check : 0 erreur. Le contrôle des libellés en double tolère désormais des libellés identiques s'ils portent des conditions mutuellement exclusives, et cette exclusivité est vérifiée sur toutes les combinaisons de jetons.

## 6. Arbitrages finaux de la contre-expertise (25/10/2026)
Aucun niveau abaissé. Planchers ajoutés sur le modèle de MOD22 (règle + résultat dédié). Sources : F-sources.md, section « Arbitrages finaux ».
- **Asplénie et fièvre → urgence_sans_delai (< 2 h), MOD23, résultat R_ASPL_2H.** Toute fièvre chez l'asplénique doit faire suspecter une infection fulminante (OPSI, mortalité 50–70 %) ; antibiotique dans l'heure (SPILF/SFLS 2019, d'après HCSP 2015). MOD07 (consultation_urgente) est conservée mais dominée ; MOD07B (urgence_vitale si frissons ou altération) reste prioritaire. Le texte mentionne l'antibiotique de réserve s'il a été prescrit.
- **Nourrisson < 3 mois avec symptômes respiratoires, sans fièvre → consultation_urgente (< 6 h), MOD24, résultat RR_NRS_6H.** Avant : 48 h (RR_S + MOD02). Choix le plus prudent justifié : HAS 2019 hospitalise une forme modérée avant 2 mois et surveille à l'hôpital tout nourrisson de moins de 6 semaines ; NICE NG9 signale les apnées sans autre signe. L'arbre ne distingue ni 6 semaines ni 2 mois : < 6 h couvre la tranche entière sans envoyer tous les rhumes au 15. Appliqué aussi à « âge inconnu, peut-être un bébé ». Avec fièvre, MOD01 prime.
- **Céphalée et fièvre sans autre signe → RN_24H maintenu (24 h).** Vérifié dans l'arbre : avant RN_24H sont demandés la conscience (U04), la confusion (U08), le purpura (U09), la fièvre avec nuque raide (U10), les convulsions (U11), puis U_RN (qui les redemande), N01 (début brutal), N02 (déficit) et N04 (photophobie ou vomissements). La combinaison rouge de NICE NG240 (1.1.4) et les signes de 1.1.9 mènent donc à U00. Les signes de reconsultation de RN_24H reprennent confusion et taches. Les planchers de population (immunodépression, asplénie, etc.) s'appliquent toujours. Vignette V97.
- **Bébé de 3 à 6 mois avec T ≥ 39 °C → consultation_urgente (< 6 h), U_NRS36 + MOD25, résultat R_NRS36_6H.** NICE NG143 (1.2.13, tableau) : orange. L'arbre ne connaissait ni la tranche 3–6 mois ni le seuil de 39 °C : une seule question ajoutée après POP00 « De 3 mois à 2 ans » (Oui / Non / Non concerné / Je ne sais pas = oui). Préfixe U_ : question de modulation hors compte des 7 questions. Délai < 6 h = choix BreathIQ (NG143 laisse l'urgence au jugement).
- **cchf.html / cchf-en.html :** « Ribavirine IV » retiré de la méta description, de la description JSON-LD et du bandeau, remplacé par « prise en charge spécialisée ». Les pages n'ont pas de balises og.
- **Outil :** check-tree.mjs compte désormais comme atteignables les résultats cibles d'une règle (`resultat`), comme RV_PALU l'était déjà de fait.
- **Chemin « Nez et gorge » sans température, corrigé :** R01 « Nez et gorge » mène désormais à U_R02F (fièvre ≥ 38 °C ou ressentie : Oui / Non / Je ne sais pas = oui), puis à R02. La question pose `sig_fievre` ou `sig_fievre_inconnue`, ce qui active MOD01, MOD05/05B, MOD07/MOD23 et MOD08. Elle est activée chez les personnes fragiles (asplénie, immunodépression, chimiothérapie, moins de 3 mois, âge inconnu peut-être bébé, grossesse, post-partum). Pour les autres, un rhume fébrile sans signe de gravité reste en autosoins, comme avant. Le préfixe U_ la laisse hors du compte des 7 questions. Vignettes V92 (corrigée) et V98 ; V67 et V93 complétées.
- **Contrôles :** 98/98 vignettes (V91 à V98 ajoutées), 0 faux négatif grave ; F-check 0 erreur ; check-tree OK (159 nœuds, 7 questions au plus).
