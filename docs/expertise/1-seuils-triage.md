# 1 — Seuils du triage : sources et décisions

Date : 2026-10-25. Branche : `fix/audit-lancement`. Périmètre : quatre seuils signalés « sans source » dans `docs/triage/SYNTHESE.md`.
BreathIQ est un outil d'information et d'orientation. Ce n'est pas un dispositif médical. Règle suivie : on ne baisse jamais un niveau d'orientation.

## Sources vérifiées (consultées le 2026-10-25)

- **NICE NG253**, *Suspected sepsis in people aged 16 or over: recognition, assessment and early management*, publié le 19/11/2025, mis à jour le 23/09/2026. Elle remplace la partie adulte de NG51. Le PDF officiel a été lu, tableau 1 (milieu communautaire, ≥ 16 ans). https://www.nice.org.uk/guidance/ng253
- **RCP, NEWS2** (2017), chart 1 « The NEWS scoring system ». https://www.rcp.ac.uk/media/alxev00t/news2-chart-1_the-news-scoring-system_0_0.pdf
- **NICE NG143**, *Fever in under 5s*, tableau « feu tricolore » (support pédagogique NICE). https://www.nice.org.uk/guidance/ng143/resources/support-for-education-and-learning-educational-resource-traffic-light-table-pdf-6960664333
- **Singer M et al.**, JAMA 2016 (Sepsis-3, qSOFA). Déjà citée dans l'arbre.

## 1. Fréquence respiratoire de l'adulte (U06, MOD16, MOD21)

- **Avant :** ≥ 30/min → urgence_vitale ; 22–29/min → plancher consultation_urgente.
- **Référence :**
  - NICE NG253 : ≥ 25/min = critère de haut risque ; 21–24/min = risque modéré.
  - NEWS2 : ≥ 25 = 3 points ; 21–24 = 2 points.
  - qSOFA : ≥ 22/min.
  - Le seuil de 30/min n'apparaît dans aucune de ces sources. Pour les adultes de 25 à 29/min, il était donc moins prudent que la référence.
- **Décision : modifier.** Adulte ≥ 25/min → urgence_vitale. Adulte 21–24/min → plancher consultation_urgente, via le même token `sig_fr_22_29`, dont le nom interne est conservé.
  - Les deux changements relèvent le niveau d'orientation (25–29/min, 21/min). Aucun ne le baisse.
- **Libellé pour le patient :** un profane compte mal sa fréquence respiratoire. Ce que l'on peut observer (ne peut pas finir une phrase, tirage, lèvres bleutées) est déjà demandé en U05, avant U06, et mène à U00.
  - Ajouté à l'aide patient : « une inspiration et une expiration comptent pour 1 » et « Vous n'arrivez pas à compter ? Répondez « Je ne sais pas » ».
  - « Je ne sais pas » ne rassure pas : la question reste un signal de gravité.
- **Non tranché :** 5 à 12 ans ≥ 30/min reste sans source. Le seuil n'a pas été modifié.

## 2. Pression artérielle systolique 90–100 mmHg (U12, MOD20, MOD21)

- **Avant :** < 90 mmHg → urgence_vitale ; 90–100 mmHg → consultation_urgente.
- **Référence :** NICE NG253 : ≤ 90 mmHg = haut risque ; 91–100 mmHg = risque modéré. NEWS2 : ≤ 90 = 3 points ; 91–100 = 2 points. qSOFA : PAS ≤ 100.
- **Décision : modifier la borne.** « 90 mmHg ou moins » → urgence_vitale. « 91 à 100 mmHg » → consultation_urgente. Une PAS de 90 mmHg tout juste passe ainsi au niveau supérieur.
  - Le libellé patient reste « chiffre du haut ». Sans appareil, le patient répond sur le malaise, ce qui est déjà le cas.

## 3. SpO2 92–95 % (U07)

- **Arbre actuel :**
  - ≥ 94 % → la suite des questions ;
  - 92–93 % sans BPCO → U00 ;
  - 92–93 % avec BPCO → la suite des questions ;
  - < 92 % → U00.
- **Référence :**
  - NEWS2 échelle 1 : ≤ 91 % = 3 points, 92–93 % = 2 points, 94–95 % = 1 point.
  - NEWS2 échelle 2 (insuffisance respiratoire hypercapnique) : 88–92 % = 0 point.
  - NICE NG253 rec. 1.10.1 : cible de 88–92 % en cas de risque hypercapnique.
  - NICE NG143 : ≤ 95 % = risque intermédiaire chez l'enfant de moins de 5 ans.
- **Décision : garder.** L'arbre envoie en urgence dès 92–93 %, ce qui est plus prudent que NEWS2. L'exception BPCO est cohérente avec l'échelle 2. Seuls l'aide et la source ont été mis à jour.
- **À arbitrer par le médecin validateur :** un plancher consultation_urgente pour une SpO2 de 94–95 % chez l'enfant de moins de 5 ans (critère intermédiaire NICE NG143). Il n'est pas appliqué, car il faudrait une nouvelle règle et une nouvelle vignette.

## 4. Couches sèches depuis plus de 6 h (U14, D01)

- **Référence :** NICE NG143 classe la « diurèse diminuée » (reduced urine output) en risque intermédiaire, **sans durée chiffrée**. Aucune source officielle trouvée ne fixe 6 h. Pour l'adulte, NICE NG253 : 12–18 h sans uriner = risque modéré ; > 18 h = haut risque. L'arbre envoie donc l'adulte en urgence dès 12 h, ce qui est plus prudent.
- **Décision : garder 6 h.** C'est un choix de prudence propre à BreathIQ, désormais présenté comme tel dans l'aide et la source.
  - Un seuil plus long (8 h, proposé par le relecteur) baisserait le niveau pour certains enfants. Il n'est donc pas retenu sans avis du validateur.
- **Libellé :** « couches sèches » est déjà observable par un parent. Il n'a pas été modifié.

## Fichiers modifiés

- `docs/triage/arbre-fusion.json` :
  - U06 : libellés, aide, source ;
  - U07 : aide, source ;
  - U12 : libellés, aide, source ;
  - U14 : aide, source.
- `docs/triage/D-textes.json` : U06 et U12 (4 variantes) ; U14 (aide soignant FR/EN).
- `data/triage.json` : régénéré.
- `docs/triage/F-sources.md` : nouvelle section « Seuils sourcés le 2026-10-25 ».
- `docs/triage/SYNTHESE.md` : liste des seuils sans source mise à jour.

## Vérifications

- `node scripts/build-triage.mjs` : OK, 155 nœuds.
- `npm test` : 90/90 vignettes, 0 faux négatif grave, 89 identiques au relecteur (même score qu'avant la modification).
- `node docs/triage/F-check.mjs` : 3 erreurs « A11Y-LIBELLE : libellés en double » sur U_RS, S02A et S02B.
  - Elles ne viennent pas de ces modifications. Ce sont des choix « Non, aucun » à `condition_activation` différente (`sig_fr_inconnue`). Ils ont été ajoutés en parallèle dans le même fichier par un autre travail, à 07:02.
  - Avec les fichiers sauvegardés juste avant ce passage, F-check donnait 0 erreur.

## Validation

Validation clinique : Dr Clément Médeau — date : ______ — signature : ______
