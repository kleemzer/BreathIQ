# 3. Titre de l'accueil patient et branche « frissons »

Rôle : infectiologue et ergonome en santé grand public. Brouillon à valider par le médecin validateur.

## A. Titre de l'accueil (index.html)

| | FR | EN |
|---|---|---|
| Avant | Quels virus circulent en France en ce moment ? | Which viruses are circulating right now? |
| **Après** | **Symptômes ou inquiétude ? Savoir quoi faire** | **Unwell or worried? Know what to do** |

**Pourquoi :**
- Le titre annonce désormais l'action du bouton principal (« J'ai des symptômes : que faire ? »). L'ancien titre posait une question à laquelle répondait le bouton secondaire.
- La phrase compte 6 mots en FR et 7 en EN, avec des mots courants.
- Elle ne fait aucune promesse diagnostique : « savoir quoi faire » renvoie à une orientation. Elle évite tout ton alarmiste.
- L'option (a) « Malade ou inquiet ? » est écartée : elle est genrée au masculin et « malade » s'auto-étiquette. « Symptômes ou inquiétude » est neutre.
- L'option (b) est écartée : elle ajoute une ligne au-dessus du pli. La veille virale reste visible dans le sous-titre (OMS · ECDC · SPF) et dans le bouton secondaire « Voir la situation épidémique ».

**Mise en œuvre :**
- La nouvelle clé `x-hero-symptomes-inquietude` remplace `x-quels-virus-circulent-en-be32`, dans index.html et dans script.js (FR et EN).
- script.min.js est regénéré par terser.
- `check-i18n --langs=fr,en --max-hardcoded=0` : OK.

## B. Branche « frissons » (T00 → U_RS → S…)

**Analyse :** les questions S01, S03A (volet tension) et S03B reprennent exactement les seuils qSOFA (22/min, 100 mmHg) déjà recueillis par U06 et U12. Elles n'apportent aucun seuil propre (pas de « sepsis modéré » distinct) : ce sont de vrais doublons.

**Correction :**
- Les choix sont reroutés selon les jetons déjà posés : `sig_fr_22_29`, `sig_pas_100`, `sig_frissons`, et le nouveau `sig_fr_inconnue` posé par U06 « Je ne sais pas ».
- S03B est supprimé.
- S03A est réduit au volet clinique.
- S01 n'est posée que si la FR n'a pas été comptée à U06.
- Le détail figure dans ARBITRAGES.md §5.

**Nombre d'écrans de questions, de U_RS jusqu'au résultat :**

| Situation (adulte, filtre d'urgence négatif) | Avant | Après |
|---|---|---|
| Frissons déclarés à T00, FR et tension sans critère | 5 (U_RS, S01, S02A, S03A, S05) | **2** (U_RS, S02A) → RS_6H |
| Frissons, FR 22 à 29/min | 4 (U_RS, S01, S02B, S03B) | **2** (U_RS, S02B) |
| Frissons, PAS 90 à 100 mmHg | 4 (U_RS, S01, S02A, S03A) | **2** (U_RS, S02A) |
| FR non comptée (vignettes V39, V70) | 4 (U_RS, S01, S02B, S03B) | **3** (U_RS, S01, S02B) |
| Entrée « Je ne sais pas » à T00, aucun critère | 5 | 4 (U_RS, S02A, S03A, S05) |

**Sensibilité :**
- Le niveau est identique ou plus élevé pour chaque combinaison.
- Seul changement : des frissons isolés mènent à RS_6H (< 6 h) au lieu de RS_24H possible, ce qui est cohérent avec F03.

**Contrôles :**
- `build-triage` : OK.
- `npm test` : 90/90 vignettes, 0 faux négatif grave, 89 identiques au relecteur, comme avant la modification.
- `F-check` : 0 erreur.
- `check-tree` : références, atteignabilité, absence de boucle et format OK.

**Retouche de F-check.mjs :**
- Le contrôle « libellés en double » tolère deux libellés identiques seulement si leurs conditions d'activation s'excluent. L'interface n'en affiche alors qu'un.
- Cette exclusivité est vérifiée de façon exhaustive, sur toutes les combinaisons de jetons.

**À faire au déploiement :** suivre la procédure de release BreathIQ (bump `?v=`, ASSET_VERSION et CACHE_VERSION dans sw.js), car script.min.js et data/triage.json ont changé.
