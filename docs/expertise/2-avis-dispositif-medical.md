# Avis 2 : BreathIQ et la qualification en dispositif médical

2026-10-25. Rédigé du point de vue d'un juriste en réglementation des DM, en lien avec l'infectiologue du projet. Repères : **[C]** = texte explicite, **[I]** = interprétation, **[À vérifier]** = source non relue en ligne pendant cette analyse.

## 1. Conclusion

Le questionnaire `#triageApp` présente un **risque de qualification élevé** : il est probable qu'il soit un dispositif médical (DM).

Il prend les réponses d'une personne donnée (signes, âge, grossesse, terrain, parfois des chiffres physiologiques) et en déduit, pour cette personne, l'un de six niveaux de recours, avec un délai : urgence vitale, urgences < 2 h, consultation < 6 h, < 24 h, < 48 h, autosoins. Cela correspond à la définition de l'art. 2(1) du règlement (UE) 2017/745 (« diagnostic, prévention, contrôle, prédiction, pronostic… » pour une personne) et à ce que MDCG 2019-11 appelle une aide à la décision individuelle.

Les mentions « non dispositif médical » du site ne protègent pas contre ce risque. La destination (art. 2(12)) se lit dans tout ce que le fabricant présente, **fonctionnalités comprises**. Le site affirme aussi qu'il « n'émet pas de recommandations médicales individuelles », alors que l'écran de résultat en émet une. Cette contradiction est le point le plus fragile.

## 2. Cadre

- **[C] Art. 2(1) MDR.** Un logiciel est un DM s'il a une destination médicale, notamment le diagnostic, la prévention, le contrôle, la prédiction ou le pronostic d'une maladie. Art. 2(12) : la destination est celle qui ressort de l'étiquetage, de la notice, des documents promotionnels et de l'évaluation clinique.
- **[C] MDCG 2019-11 rev.1 (juin 2025).** La logique de qualification n'a pas changé. Un logiciel qui traite des données propres à un patient pour produire une information sur son état, au bénéfice de ce patient, est un DM. Ne sont pas des DM : le simple stockage, la communication, la recherche documentaire, ou une information générale non individualisée.
- **[C] Annexe VIII, règle 11.** Un logiciel qui fournit des informations servant à prendre des décisions à visée diagnostique ou thérapeutique est en classe IIa. Il passe en IIb si une décision peut causer une détérioration grave de l'état de santé ou une intervention chirurgicale, et en III si elle peut causer un décès ou une détérioration irréversible.
- **[À vérifier] Manual on borderline and classification** de la Commission (dernière version) : il contient des exemples d'applications de symptômes ou de triage, jugées en général être des DM lorsqu'elles orientent une personne. Il faut relire l'entrée exacte avant de la citer.
- **[À vérifier] ANSM** (pages « logiciels et applications mobiles en santé ») et **HAS** (référentiel de bonnes pratiques sur les applications et objets connectés en santé, 2016) : ces textes reprennent le critère de finalité médicale individuelle et ne créent pas de régime à part.

### Outils comparables

| Outil | Statut | Ce qu'il en ressort pour BreathIQ |
|---|---|---|
| **NHS 111 online** (contenu NHS Pathways) | NHS Digital le déclare **DM de classe I** (régime britannique UK MDR 2002, hérité de la directive 93/42, et non du MDR UE) | Un triage public vers un niveau de recours est qualifié de **DM** par son propre éditeur, un service public. Sous le MDR UE et sa règle 11, la classe I ne serait plus disponible pour ce type d'outil [I]. |
| **NHS Pathways** | Déclaré DM de classe I (NHS Digital) | Idem. |
| **116 117 / SAS** (France) | Service téléphonique régulé par des professionnels | Ce n'est pas un logiciel autonome : la décision est prise par un humain. L'exemple ne peut pas servir à BreathIQ. |
| **Ameli / Assurance maladie** | [À vérifier] Les contenus « que faire si… » sont des fiches d'information générale, sans calcul individualisé. | C'est le modèle de l'option A ci-dessous. |

Sources : [NHS 111 online is a class 1 medical device](https://digital.nhs.uk/services/nhs-111-online/nhs-111-online-is-a-class-1-medical-device) ; [NHS Pathways, class 1](https://nhsd-proxy.openprescribing.net/services/nhs-pathways/nhs-pathways-is-a-class-1-medical-device) ; [Commission, mise à jour MDCG 2019-11 rev.1, 17/06/2025](https://health.ec.europa.eu/latest-updates/update-mdcg-2019-11-rev1-qualification-and-classification-software-regulation-eu-2017745-and-2025-06-17_en) ; [Emergo, analyse de la rev.1](https://www.emergobyul.com/news/european-revision-primary-software-guidance-mdcg-2019-11-revision-1-small-changes-meaningful).

## 3. Éléments qui aggravent le risque

| # | Fichier : ligne | Élément | Effet |
|---|---|---|---|
| A1 | `js/triage-ui.js:25-32` | Six niveaux de recours avec délais chiffrés (« Voyez un médecin dans les 6 heures », etc.) | Décision individuelle explicite. C'est le cœur de la qualification. |
| A2 | `js/triage-ui.js:92-95` | Le message « Votre situation (âge, grossesse, maladie ou traitement) rend ce délai plus court » (texte `raised`, l. 36) | Montre que le résultat est personnalisé selon le terrain. |
| A3 | `js/triage-ui.js:94, 103` | En version soignant : « Urgence vitale », « Règles appliquées », nœud, source | Il s'agit d'une aide à la décision clinique, qui serait elle aussi un DM. |
| A4 | `index.html:764` | « Évaluez votre situation et agissez au bon niveau d'urgence » | Revendique une évaluation individuelle (section masquée, mais présente dans le code). |
| A5 | `index.html:868` | « Les résultats sont des orientations » et « Outil d'information **et d'orientation** » | Le mot « orientation » décrit la fonction de triage. |
| A6 | `index.html:863` | « Répondez aux questions suivantes pour savoir quoi faire » | Destination individuelle. |
| A7 | `index.html:903` | « nous vous orientons immédiatement » | Idem. |
| A8 | `about.html:250` | « il oriente vers les ressources de soins appropriées » | Destination revendiquée dans la page « à propos ». |
| A9 | `index.html:2234` | Onboarding : « Aide à l'orientation » | Idem. |
| A10 | `index.html:1977` | Biographie : « trop de patients consultent trop tard — ou trop tôt » | Présente l'outil comme un moyen de décider quand consulter. |
| A11 | Arbre `docs/triage` (voir `F-conformite.md` § 1, lignes 2-4 du tableau) | Seuils physiologiques (SpO2, FR, FC, PA, température), critères qSOFA, règles de modulation MOD01-MOD19 | Traitement de données physiologiques individuelles, typique d'un DM. |
| A12 | `index.html:2021`, `mentions-legales.html:156-160` | « n'émet pas de recommandations médicales individuelles », « gestion logistique » | Ces affirmations sont contredites par A1. Une déclaration inexacte affaiblit la crédibilité de toutes les autres et pose un problème de pratique commerciale trompeuse [I]. |

## 4. Éléments qui réduisent le risque

| Fichier : ligne | Élément | Portée |
|---|---|---|
| `index.html:868, 2019-2021, 2074, 2253` ; `mentions-legales.html:151-160, 220-224` | Mentions « non DM », « ne remplace pas votre médecin » | Nécessaires pour l'information et la responsabilité, mais **sans effet sur la qualification** [C : c'est la fonction qui compte]. |
| `js/triage-ui.js:102` | Rappel `t.rappel` à chaque résultat | Corrige l'échec relevé dans `F-conformite.md` § 2 (à condition que `rappel` soit rempli pour tous les nœuds). |
| `index.html:875` | Aucune donnée transmise | Réduit le risque RGPD, pas le risque DM. |
| `index.html:767-777, 894-903` | Signes d'alarme affichés en liste statique, avec appel au 15 | C'est de l'information générale : élément favorable. |
| Gratuité, absence de publicité (`index.html:1977-1980`, `2021`) | Pas de mise sur le marché à titre onéreux | **Sans effet** : l'art. 2(27) vise aussi la fourniture gratuite. |

## 5. Options

### Option A : rester hors DM avec des garde-fous (recommandée à court terme)

Il faut **supprimer la fonction**, pas seulement changer les mots. Le principe : l'outil n'attribue plus de niveau ni de délai à l'utilisateur. Il affiche une information générale, que la personne lit et applique elle-même.

1. **Remplacer l'écran de résultat.** Au lieu d'un niveau calculé, afficher une fiche thématique fixe (par exemple « Fièvre chez l'adulte ») qui liste, pour **tous les niveaux à la fois**, les signes qui en général justifient d'appeler le 15, d'aller aux urgences, de consulter sous 24 h, ou de rester chez soi. Les réponses ne servent qu'à **choisir la fiche** (navigation par thème, comme une table des matières), jamais à choisir un niveau. [I : c'est le schéma « recherche documentaire » admis par MDCG 2019-11.]
2. **Retirer** du parcours grand public : les saisies chiffrées (SpO2, FR, FC, PA), les scores (qSOFA), les règles MOD et le message `raised` (`js/triage-ui.js:36, 95`).
3. **Exception de sécurité.** Garder la liste statique des signes d'alarme, avec un appel au 15 affiché à tout le monde, sans condition. C'est de l'information générale et c'est cliniquement indispensable.
4. **Version soignant.** La transformer en fiches de référence non interactives (pas de « Règles appliquées », pas de niveau calculé), ou bien la sortir du site.
5. **Aligner tous les textes** (point 6), puis faire établir un **mémo de qualification daté et signé** par un avocat ou un consultant réglementaire. Ce mémo servira de preuve de bonne foi en cas de contrôle de l'ANSM.
6. Optionnel : demander à l'ANSM un avis informel sur la qualification [À vérifier : modalités actuelles].

Limite : l'arbre `docs/triage` (48 nœuds de résultat) perd sa valeur de calcul. Il reste utile comme base de contenu pour rédiger les fiches.

### Option B : assumer le statut de DM

- **Classe.** Avec la règle 11, la classe IIa n'est réaliste que si le fabricant démontre qu'aucune erreur d'orientation ne peut causer de détérioration grave. Pour un triage infectieux grand public (sepsis, purpura, paludisme, nourrisson fébrile), une sous-orientation peut être grave, voire létale : la classe **IIb** est la plus probable, et la classe III ne peut pas être exclue [I]. Viser IIa demanderait de réduire le périmètre (par exemple, pas d'autosoins pour les populations à risque, et un recours systématique au 15 en cas de doute) et de le justifier dans l'analyse de risque.
- **Obligations** [C] : fabricant identifié (une personne morale est préférable), système qualité ISO 13485, gestion des risques ISO 14971, cycle de vie logiciel IEC 62304, ergonomie IEC 62366-1, évaluation clinique (art. 61, annexe XIV), organisme notifié, PRRC (art. 15), surveillance après commercialisation et vigilance, enregistrement dans EUDAMED, cybersécurité (MDCG 2019-16).
- **Ordre de grandeur** [I] : 18 à 36 mois et un budget de plusieurs centaines de milliers d'euros. Ce n'est pas compatible avec un projet bénévole sans structure, sauf adossement à un établissement ou à un industriel.

## 6. Formulations proposées

À remplacer partout où le texte apparaît, y compris dans les clés i18n EN.

| Lieu | Actuel | FR proposé | EN proposé |
|---|---|---|---|
| `index.html:863` | Répondez aux questions suivantes pour savoir quoi faire | Choisissez un thème pour lire les repères généraux sur quand consulter. | Choose a topic to read general guidance on when to seek care. |
| `index.html:868` | Ce site vous aide à savoir quoi faire… Les résultats sont des orientations, pas un diagnostic… (Outil d'information et d'orientation — non dispositif médical) | Ces pages donnent des informations générales de santé publique. Elles ne tiennent pas compte de votre situation personnelle et ne remplacent pas l'avis d'un médecin. En cas de difficulté à respirer, appelez le 15 ou le 112. | These pages give general public-health information. They do not take your personal situation into account and do not replace a doctor's advice. If you have trouble breathing, call 112 (15 in France). |
| `index.html:764` | Évaluez votre situation et agissez au bon niveau d'urgence | Les signes qui, en général, doivent faire appeler, consulter ou surveiller | Signs that generally mean you should call, see a doctor or keep watch |
| `index.html:903` | Si oui, cochez et nous vous orientons immédiatement. | Si vous avez l'un de ces signes, appelez le 15 maintenant. | If you have any of these signs, call 112 (15 in France) now. |
| `about.html:250` | il oriente vers les ressources de soins appropriées | il présente des repères généraux sur les situations qui justifient habituellement de consulter. | it presents general guidance on situations that usually call for medical care. |
| `index.html:2234` | Aide à l'orientation | Repères : quand consulter | Guidance: when to seek care |
| `js/triage-ui.js:36` (`raised`) | Votre situation (âge, grossesse…) rend ce délai plus court. | *Supprimer.* Le remplacer, dans chaque fiche, par : « Pour un bébé de moins de 3 mois, une femme enceinte, une personne âgée ou une personne qui a une maladie chronique ou un traitement qui affaiblit les défenses, consultez plus tôt. » | For a baby under 3 months, a pregnant woman, an older person or someone with a long-term illness or a treatment that weakens immunity, seek care sooner. |
| `js/triage-ui.js:26-31` | « Voyez un médecin dans les 6 heures », etc. (affiché comme résultat) | Ne plus afficher un niveau seul. Dans la fiche, présenter les quatre rubriques ensemble : « Appelez le 15 si… / Allez aux urgences si… / Consultez dans la journée si… / En général, vous pouvez rester chez vous si… » | Call 112 (15 in France) if… / Go to the emergency department if… / See a doctor today if… / You can usually stay at home if… |
| Rappel par fiche (`t.rappel`) | variable | Information générale, non personnalisée. En cas de doute, appelez le 15 ou votre médecin. | General information, not personalised. If in doubt, call 112 (15 in France) or your doctor. |
| `index.html:2021`, `mentions-legales.html:156-160` | « outil d'information publique et de gestion logistique… n'émet aucune recommandation individuelle » | BreathIQ publie des informations générales de santé publique. Il ne calcule aucune recommandation à partir de la situation d'une personne. Sa destination n'est pas médicale au sens de l'article 2 du règlement (UE) 2017/745. *(Ne publier ce texte qu'une fois l'option A mise en œuvre.)* | BreathIQ publishes general public-health information. It does not compute any recommendation from an individual's situation. It has no medical purpose within the meaning of Article 2 of Regulation (EU) 2017/745. *(Publish only once option A is implemented.)* |

Termes à bannir des textes patient et marketing : « triage », « évaluer votre situation », « nous vous orientons », « résultat », « votre niveau d'urgence ». [I : nécessaire, mais pas suffisant sans l'option A.]

## 7. En attendant

Tant que l'option A n'est pas en ligne, il vaut mieux **désactiver `#triageApp` en production** (l'ancien questionnaire est déjà masqué) et ne garder que les signes d'alarme statiques. C'est la mesure qui réduit le plus le risque à coût nul.

---

Ceci n'est pas une consultation juridique ; à faire valider par un avocat.
