# Arbre de triage infectieux — synthèse (version 0.2.0-brouillon, 25/10/2026)

**Statut : brouillon NON mis en ligne. Validation clinique et avis juridique obligatoires avant intégration au site.**

## Ce qui a été produit
| Fichier | Contenu |
|---|---|
| `A-audit.md` | 41 écarts du questionnaire actuel (9 critiques), dont le conflit entre les deux moteurs et les pré-cochages |
| `arbre-fusion.json` | Arbre final : 156 nœuds, filtre d'urgence U01–U16, 2 questions de population, 13 tableaux cliniques, règles de modulation à conditions booléennes |
| `D-textes.json` | Textes de chaque nœud en 4 variantes : **patient** (phrases ≤ 15 mots, sans jargon, numéro d'urgence selon le pays via `{URGENCE}`, médecin de garde via `{GARDE}`, consignes pour peau foncée) et **soignant** (termes cliniques, seuils), FR et EN |
| `E-rapport.md`, `E-vignettes-final.json` | 90 vignettes cliniques rédigées par un relecteur indépendant, réponses attendues figées avant le test |
| `F-sources.md`, `F-conformite.md` | Sources règle par règle, analyse dispositif médical, accessibilité |
| `check-tree.mjs`, `E-run.mjs`, `F-check.mjs` | Contrôles automatiques rejouables |

## Résultats du relecteur indépendant (90 vignettes, 63 graves)
| Cycle | Faux négatifs graves | Concordance exacte |
|---|---|---|
| 1 | 14 / 63 (22 %) | 69 % |
| 2 | 0 / 63 | 83 % |
| 3 | 1 / 63 | 88 % |
| Après arbitrages (`ARBITRAGES.md`) | **0 / 63** (sur l'attendu arbitré) | 89 % |

Deux vignettes (V55, V56 : nourrisson fébrile sans signe de gravité) ont un attendu révisé par l'arbitrage §3 : urgences pédiatriques sans attendre au lieu du 15.

Aucune impasse, aucune boucle, au plus 7 questions avant un résultat (hors urgence).

## Arbitrages rendus (voir `ARBITRAGES.md`, avec sources)
- **Grossesse :** toute fièvre ≥ 38 °C → urgences de la maternité en moins de 6 h ; frissons intenses, fièvre ≥ 39 °C, contractions, perte de liquide, saignement, malaise ou bébé qui bouge moins → 15.
- **Paludisme :** fièvre pendant le voyage ou dans les 3 mois après le retour → moins de 6 h (urgence diagnostique, CMIT/SPILF) ; signes de gravité → 15 ; au-delà de 3 mois → moins de 24 h, en signalant le voyage.
- **Nourrisson de moins de 3 mois avec fièvre ≥ 38 °C :** nouveau niveau « urgences pédiatriques sans attendre » (moins de 2 h, NICE NG143 rouge) ; signe de gravité ou absence de transport → 15.
- **Nourrisson déshydraté (V60) :** question sur les couches sèches ajoutée → résolu.
- **qSOFA :** 2 critères sur 3 → 15 ; 1 critère → moins de 6 h, sauf la confusion, qui reste un motif d'appel au 15.

## Avant toute mise en ligne
1. **Validation par le médecin validateur** des arbitrages et des seuils sans source (FR adulte ≥ 30 et 22–29/min, PA 90–100 mmHg, SpO2 92–95 %, couches sèches > 6 h).
2. **Sources :** la plupart des règles restent « à valider (non vérifié) » ; aucune n'a été inventée. Textes à consulter directement : CNGOF/HAS pour la fièvre pendant la grossesse, NICE NG143 (page officielle inaccessible au robot), PCIME OMS.
3. **Dispositif médical (F) :** 7 éléments qualifiants. En cas de qualification, probablement classe IIb, voire III. C'est une interprétation à faire valider par un avocat ou un organisme notifié.
4. **Écarts restants non graves :** 2 sous-triages (V11 toux de 10 jours, V31 sinusite) et 8 sur-triages. Le token `sig_pied` (pied diabétique) n'est posé par aucune question.
5. **Vignettes à ajouter :** grossesse avec signes d'escalade (U_GRO01).

## Écarts au cahier des charges, assumés
- **Langues :** français et anglais seulement. Les 7 autres langues viendront après validation clinique, chacune relue par un locuteur natif.
- **Numéros :** les numéros d'urgence et de garde ne sont certains que pour certains pays (`_numeros_urgence`, `_numeros_garde` dans `D-textes.json`).

## Fiche de version
- Version : 0.2.0-brouillon — 25/10/2026 (156 nœuds)
- Changements : premier arbre complet ; 3 cycles de correction (E-01 à E-23) ; arbitrages cliniques (grossesse, paludisme, nourrisson < 3 mois, déshydratation, qSOFA) ; rappel « ne remplace pas un avis médical » sur chaque résultat
- Médecin validateur : ____________________  Date : __________  Signature : __________
- Avis juridique (règlement UE 2017/745) : ____________________

## Étapes suivantes proposées
1. Validation clinique et avis juridique.
2. L'intégration dans le site, en remplaçant les deux moteurs actuels par un seul et en gardant les identifiants du questionnaire existant.
