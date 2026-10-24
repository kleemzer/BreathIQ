# Arbre de triage infectieux — synthèse (version 0.1.0-brouillon, 25/10/2026)

**Statut : brouillon NON mis en ligne. Validation clinique et avis juridique obligatoires avant intégration au site.**

## Ce qui a été produit
| Fichier | Contenu |
|---|---|
| `A-audit.md` | 41 écarts du questionnaire actuel (9 critiques), dont le conflit entre les deux moteurs et les pré-cochages |
| `arbre-fusion.json` | Arbre final : 152 nœuds, filtre d'urgence U01–U16, 2 questions de population, 13 tableaux cliniques, règles de modulation à conditions booléennes |
| `D-textes.json` | Textes de chaque nœud en 4 variantes : **patient** (phrases ≤ 15 mots, sans jargon, numéro d'urgence selon le pays via `{URGENCE}`, médecin de garde via `{GARDE}`, consignes pour peau foncée) et **soignant** (termes cliniques, seuils), FR et EN |
| `E-rapport.md`, `E-vignettes-final.json` | 90 vignettes cliniques rédigées par un relecteur indépendant, réponses attendues figées avant le test |
| `F-sources.md`, `F-conformite.md` | Sources règle par règle, analyse dispositif médical, accessibilité |
| `check-tree.mjs`, `E-run.mjs`, `F-check.mjs` | Contrôles automatiques rejouables |

## Résultats du relecteur indépendant (90 vignettes, 63 graves)
| Cycle | Faux négatifs graves | Concordance exacte |
|---|---|---|
| 1 | 14 / 63 (22 %) | 69 % |
| 2 | 0 / 63 | 83 % |
| 3 (final) | **1 / 63** | 88 % |

Aucune impasse, aucune boucle, au plus 7 questions avant un résultat (hors urgence).

## Bloquant avant toute mise en ligne
1. **V60 — faux négatif grave restant.** Nourrisson de 8 mois avec diarrhée, vomissements et couches sèches depuis 8 h, orienté en autosoins. Aucune question ne porte sur les couches avant le seuil de 12 h. À corriger après votre arbitrage.
2. **qSOFA mal utilisé** (F) : S01, S03A/B, U12 et MOD16 déclenchent sur un seul critère, alors que le qSOFA demande 2 critères sur 3 chez l'adulte et sert au pronostic, pas au dépistage.
3. **Sources :** 132 règles sur 141 restent « à valider (non vérifié) ». Aucune source n'a été inventée.
4. **Dispositif médical** (F) : 7 éléments qualifiants (orientation individuelle avec délai, SpO2/FC/PA, scores, règles de modulation). En cas de qualification, ce serait probablement la classe IIb, voire III ; c'est une interprétation à faire valider par un avocat ou un organisme notifié.

## Vos arbitrages de clinicien
- E-19 : plancher « moins de 6 h » pour toute fièvre de la grossesse, trop large ?
- Fenêtre « fièvre au retour de zone palustre » : 3 mois, et délai 6 h ou 24 h ?
- 11 écarts non graves : 2 sous-triés, 8 sur-triés et V60. Voir `E-rapport.md`, section « Cycle 3 — final ».
- `sig_pied` (pied diabétique) jamais posé ; « chimiothérapie » laissé dans le texte patient.
- Seuils sans source : FR adulte ≥ 30/min et 22–29/min, PA ≤ 100 mmHg, SpO2 92–95 %.
- NICE NG143 recommande une évaluation urgente, et non le 15, pour un nourrisson de moins de 3 mois fébrile : choix BreathIQ à confirmer.

## Écarts au cahier des charges, assumés
- **Langues :** français et anglais seulement. Les 7 autres langues viendront après validation clinique, chacune relue par un locuteur natif.
- **Numéros :** les numéros d'urgence et de garde ne sont certains que pour certains pays (`_numeros_urgence`, `_numeros_garde` dans `D-textes.json`).

## Fiche de version
- Version : 0.1.0-brouillon — 25/10/2026
- Changements : premier arbre complet ; 3 cycles de correction (E-01 à E-23)
- Médecin validateur : ____________________  Date : __________  Signature : __________
- Avis juridique (règlement UE 2017/745) : ____________________

## Étapes suivantes proposées
1. Votre arbitrage des points ci-dessus, puis la correction de V60 et du qSOFA.
2. Une nouvelle passe du relecteur indépendant, avec l'objectif de zéro faux négatif grave.
3. L'intégration dans le site, en remplaçant les deux moteurs actuels par un seul et en gardant les identifiants du questionnaire existant.
