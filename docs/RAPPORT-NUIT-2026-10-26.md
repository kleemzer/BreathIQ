# Rapport de nuit — 25-26 octobre 2026

Branche `fix/audit-lancement`. Rien n'a été mis en production. Release courante : `v=20261026d`, service worker `biq-v63`.
Après chaque lot : `npm run check:js`, `npm test` (questionnaire : 90 vignettes, 0 faux négatif grave), contrôle i18n FR/EN, contrôle de la charte CSS, vérification dans le navigateur.

## Ce qui a été fait

| Commit | Contenu |
|---|---|
| 7349b07 | Vues courtes du mode patient : accueil, `#situation`, `#voyager`, `#maladies`, `#apropos` (adresses partageables, retour arrière) |
| e18873b | Signes d'urgence oui/non regroupés en 3 écrans à cases (logique inchangée, prouvée par test) : ≈ 24 → ≈ 15 écrans pour un adulte ; accessibilité WCAG (contrastes, focus visible, cibles 44 px, modales avec Échap et focus piégé) ; liens morts |
| fe79835 | Recherche dans la vue Maladies |
| 9bfbc2f | Vue Voyager : encart « Avant le départ » (liens officiels vérifiés : Affaires étrangères, Institut Pasteur, OMS) |
| 85a34af | **Sécurité** : plus aucun code en ligne ; la CSP n'autorise plus `'unsafe-inline'` pour les scripts (≈ 190 gestionnaires convertis sans `eval`, 24 scripts externalisés). Testé avec la CSP appliquée : aucune violation |
| 4b584a6 | Relecture anglaise (≈ 100 corrections) ; cache : modules qui seraient restés figés un an au CDN (dont la règle « fièvre au retour de voyage tropical ») ; revalidation des données au lieu d'un rechargement complet |
| c006746 | Pages Ebola, Marburg, Lassa, FHCC, bilan, méthodologie, à propos : posologies de ribavirine et protocoles EPI maison retirés (renvoi COREB / HCSP / OMS), Ebola EN aligné sur DON619, « protocole CHAZAL » introuvable retiré, PHEIC mpox levée (5 sept. 2025), DOI corrigé, hébergeur Cloudflare dans les mentions anglaises |
| cb12e2a | Revue de code adversariale : 5 bugs corrigés (sections masquées en passant en mode soignant, retour arrière vers l'accueil, double défilement, erreurs console, garde-fous du moteur de triage) |
| 2bcff2d | Relecture du français côté patient (80 corrections : langage clair, « signaler » au lieu de « déclarer », phrases ≤ 15 mots) |

## Ce qui attend vos décisions

1. **Validation clinique de l'arbre de triage** (signature dans `docs/triage/SYNTHESE.md`). Seuils sans source : FR adulte, PA 90–100 mmHg, SpO2 92–95 %, couches sèches > 6 h.
2. **Avis juridique** sur la qualification de dispositif médical (questionnaire).
3. **Titre de l'accueil** : « Quels virus circulent en France ? » ne correspond plus au bouton principal « J'ai des symptômes ». Deux options :
   - (a) « Malade ou inquiet ? Savoir quoi faire » ;
   - (b) garder le titre et placer « Virus en circulation » juste dessous.
4. **Branche « frissons » du triage** : elle repose la fréquence respiratoire et la tension, déjà demandées dans le filtre d'urgence. À raccourcir ?
5. **Pages maladies, points cliniques laissés en l'état** :
   - tableau Marburg (épidémie d'Éthiopie, nov. 2025) ;
   - CFR Lassa « 55 % → < 5 % » et encart « ribavirine efficace < 6 j » ;
   - CFR Bundibugyo ;
   - article R3113-2 CSP ;
   - classement FHCC dans la liste des maladies à déclaration obligatoire.
6. **Mentions légales** : SIRET et adresse professionnelle.
7. **Pro Santé Connect** : client_id et secret quand l'ANS aura instruit DataPass D99412 (nécessite aussi le KV `DECL`).
8. **Mise en production** : `git checkout main && git merge --ff-only fix/audit-lancement && git push origin main`. Avant cela, il faut fusionner `main` dans la branche : les robots de données y ont ajouté des commits.

## Non fait, volontairement

- **Suppression de l'ancien questionnaire** (masqué) et de ses deux moteurs : à faire après votre validation du nouvel arbre.
- **Découpage de script.min.js** (137 Ko compressés) : gain réel sur mobile lent, mais chantier long et risqué.
- **Traductions des 7 autres langues** : après validation clinique, avec relecture par des locuteurs natifs.
