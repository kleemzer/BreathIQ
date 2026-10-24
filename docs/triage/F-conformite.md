# F — Conformité réglementaire et accessibilité

Sous-agent F, 2026-10-25. Analyse non juridique : ce que ce document classe comme « interprétation » doit être validé par un avocat spécialisé en droit des produits de santé ou par un organisme notifié, voire par l'ANSM.

Légende : **[C]** = certitude (texte réglementaire explicite) ; **[I]** = interprétation à faire valider.

## 1. Risque de qualification en dispositif médical (DM)

### Cadre

- **[C]** Le règlement (UE) 2017/745, à l'article 2(1), définit un DM par sa *destination* médicale : diagnostic, prévention, surveillance, prédiction, pronostic ou traitement, et cela **pour une personne donnée**. La qualification dépend de la destination revendiquée par le fabricant, ce qui inclut le site, la notice et le marketing. Une simple mention « non-DM » ne suffit pas si l'outil fait réellement ce qu'est un DM.
- **[C]** D'après le guide MDCG 2019-11, un logiciel qui aide à une décision pour un patient individuel à partir de ses données est en principe un DM. L'information générale, non individualisée, ne l'est pas.
- **[C]** La règle 11 de l'annexe VIII s'applique dès qu'un logiciel est un DM. S'il fournit des informations servant à prendre des décisions diagnostiques ou thérapeutiques, il est au minimum en classe IIa. Il monte en IIb si une décision erronée peut entraîner une détérioration grave de l'état de santé, et en III si elle peut entraîner un décès ou une détérioration irréversible.
- **[I]** Un triage infectieux qui oriente vers « urgence vitale / 15 » ou « auto-surveillance » relèverait probablement de la classe **IIb, voire III**. En effet, une sous-orientation (sepsis, purpura, paludisme, nourrisson fébrile) peut être létale. Le marquage CE en classe IIb ou III exige un organisme notifié et une investigation clinique. L'outil actuel en est très loin.

### Éléments qualifiants et mitigations

| # | Élément de l'arbre | Pourquoi il qualifie | Mitigation 1 | Mitigation 2 |
|---|---|---|---|---|
| 1 | **Orientation individuelle avec délai** : 48 nœuds résultat (`niveau_orientation` + `delai_action` : immédiat, < 6 h, < 24 h, < 48 h, surveillance) | [C] Il s'agit d'une décision individuelle tirée des réponses d'une personne, ce qui est le cœur de la définition MDCG 2019-11. [I] C'est l'élément le plus qualifiant. | Remplacer le résultat individualisé par une **information générale** : « voici les signes qui, en général, justifient d'appeler le 15 ou de consulter », sans calcul de niveau propre à l'utilisateur. Cela peut se faire sous forme de fiche statique filtrée par thème. [I] | Assumer le statut de DM : marquage CE, organisme notifié, système qualité ISO 13485, gestion des risques ISO 14971, IEC 62304, évaluation clinique. [C : ce sont les obligations si le statut DM est retenu] |
| 2 | **Mesures physiologiques** : SpO2 (U07, RR_24H « saturation limite »), FR (U06, S01), FC (S05), PA (U12, S03A/B), température (U02, F01…) | [I] Interpréter une mesure physiologique individuelle par rapport à un seuil, c'est faire de l'aide au diagnostic ou à la surveillance. MDCG 2019-11 cite ce type de traitement de données comme typique d'un DM. | Ne plus *calculer* d'orientation à partir des chiffres. Afficher les seuils comme des repères éducatifs généraux (« une saturation sous 94 % est un motif d'appel au 15 ») et laisser l'utilisateur conclure. [I] | Retirer SpO2, FC et PA du parcours grand public et les garder seulement dans la version soignant documentaire. [I] |
| 3 | **Scores** : critères qSOFA (S01, S03, MOD16), seuils PCIME, feu tricolore NICE | [I] Un score pronostique automatisé est un traitement de données à visée médicale. De plus, qSOFA est utilisé ici hors de son cadre de validation (≥ 2 critères sur 3, adulte), ce qui aggrave aussi le risque de responsabilité. | Supprimer toute mention et tout calcul de score dans la version patient. [C : le retrait supprime la fonction] | Si un score est conservé, l'appliquer exactement comme dans la source (2 critères sur 3) et le réserver à la version soignant, avec un statut DM à étudier. [I] |
| 4 | **Règles de modulation** (MOD01–MOD19 : planchers et relèvements selon la population) | [I] Elles personnalisent la décision selon le terrain (âge, immunodépression, grossesse), ce qui renforce le caractère individuel. | Les présenter comme des **messages de prudence généraux par population** (« bébé de moins de 3 mois avec fièvre : appelez le 15 »), sans les combiner à d'autres réponses. [I] | Les conserver uniquement dans un parcours DM assumé. |
| 5 | **Activations par alertes OMS** (ACT_EBOLA, ACT_HANTA…) | [I] Elles adaptent la question au contexte épidémique. Cela reste de l'information de santé publique si aucune décision individuelle n'en découle. | Présenter l'alerte comme une information à part, avec un lien vers l'OMS, SPF ou le COREB, et un renvoi au 15 en cas de contact ou de voyage. [I] | Mettre une date de péremption sur chaque alerte (déjà relevé dans l'arbre). |
| 6 | **Positionnement, marketing, nom du site** (« triage », « orientation ») | [C] La destination revendiquée par le fabricant est déterminante (art. 2(12) : « destination »). | Bannir les termes « diagnostic », « triage » et « évaluer votre état » ; écrire « information », « repères », « quand consulter ». [I : nécessaire, mais pas suffisant] | Conserver une trace écrite de la destination déclarée (mentions légales, CGU) et la faire relire par un avocat. |
| 7 | **Version soignant** | [I] Un outil d'aide à la décision destiné aux professionnels peut aussi être un DM (MDCG 2019-11). Le public visé ne change pas la qualification. | La présenter comme un document de référence statique (fiche) et non interactif. [I] | Inclure la version soignant dans le même dossier DM. |

**Disclaimer.** [C] La mention « ne remplace pas un avis médical » ne suffit pas à elle seule à exclure le statut de DM, mais elle reste nécessaire pour l'information de l'utilisateur et la responsabilité. Elle est **absente de tous les résultats** (voir § 2).

**Hors règlement DM, à vérifier [I]** : responsabilité civile de l'éditeur médecin, déontologie (code de la santé publique R.4127-13 sur l'information du public, à confirmer), RGPD si des réponses sont collectées. Les données de santé sont une catégorie particulière (art. 9 du RGPD) : la règle est **aucune collecte côté serveur**.

## 2. Accessibilité et séparation patient / soignant

Résultats obtenus avec `node F-check.mjs` le 2026-10-25 (code retour 1).

| Contrôle | Résultat | Détail |
|---|---|---|
| « Je ne sais pas » sur chaque question chiffrée | **OK** | Aucune question chiffrée sans option d'incertitude. Les questions non chiffrées sans « Je ne sais pas » sont signalées en alerte. |
| Aucune réponse pré-cochée | **OK (données)** | Aucun attribut `default`, `selected` ou `checked` dans l'arbre. À revérifier dans le rendu HTML. |
| Libellés lisibles par un lecteur d'écran | **OK (données)** | Pas de libellé vide ni en double dans un même nœud. À compléter par un test sur le rendu : `fieldset`/`legend`, `label for`, `aria-live` sur le résultat. |
| Pas d'information portée par la seule couleur | **OK avec réserve** | Il n'y a aucun code couleur d'interface dans les données. Les seules couleurs citées décrivent des symptômes (C01, O02, M04, RM_24H : « rouge », « jaune ») et sont accompagnées d'autres descripteurs. Le niveau d'orientation affiché à l'écran ne doit jamais être signalé par une seule pastille de couleur : toujours ajouter un texte et une icône. |
| Rappel « outil d'information, ne remplace pas un avis médical » à chaque résultat | **ÉCHEC — 192 erreurs** | Le rappel est absent de tous les résultats et urgences, en patient et en soignant, en FR et en EN. Correction : l'ajouter dans D-textes.json ou l'injecter par le gabarit de résultat. Dans ce second cas, adapter le contrôle. |
| Aucun terme clinique dans les textes patient | **1 erreur** | POP01 patient.fr contient « chimiothérapie ». Ce terme est sans doute acceptable pour le grand public (proposition : « traitement contre le cancer, par perfusion ou comprimés »), à arbitrer. |
| Couverture des textes | **11 alertes** | Nœuds de l'arbre sans texte D : V06, V07, U_GRO01, R01B, C02F, UR00, O07, U01B, U02B, RV_S_PALU, RI_24H. |

Limites du script : il fait un contrôle statique des JSON avec un lexique clinique extensible (constante `CLINIQUE`). Il ne remplace pas un audit RGAA 4.1 / WCAG 2.1 AA du site rendu (contraste, focus clavier, zoom à 200 %, ordre de lecture) ni un test avec des utilisateurs à faible littératie.
