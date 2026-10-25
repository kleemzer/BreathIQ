# Contre-expertise 6 : relecture juridique adversariale de l'avis 2 (qualification DM)

2026-10-25. Rédigée du point de vue d'un avocat en droit de la santé et des dispositifs médicaux. Elle relit `2-avis-dispositif-medical.md` et le confronte au code et aux textes du site.

Repères : **[C]** = texte connu et cité de façon sûre, **[I]** = interprétation, **[À vérifier]** = source primaire non relue en ligne pendant cette analyse.

> **Limite de méthode.** Les sources primaires n'ont pas pu être relues en ligne. EUR-Lex (arrêt C-329/16) a renvoyé une page vide et digital.nhs.uk une erreur 403. Les autres sources demandées (MDCG 2019-11 rev.1, Manual on borderline, ANSM, Ameli, registre MHRA) n'ont pas été consultées. Tout ce qui en dépend est marqué [À vérifier]. **Aucune citation littérale de ces textes ne doit être publiée sur le site avant cette relecture.**

## 1. Verdict sur l'avis 2

**La conclusion générale est confirmée** : le questionnaire `#triageApp` est probablement un DM. En revanche, l'avis **sous-estime** les risques hors DM (responsabilité, déontologie, RGPD, cohérence des mentions). Il **surestime** aussi un point : la portée de l'exemple NHS.

| # | Point de l'avis 2 | Verdict | Commentaire |
|---|---|---|---|
| 1 | Questionnaire probablement DM (art. 2(1)) | **Confirmé** | Le code (`js/triage-ui.js:25-36`) attribue un niveau et un délai à une personne, à partir de ses réponses. L'arrêt CJUE *Snitem et Philips France* (C-329/16, 7 déc. 2017) retient qu'un logiciel qui exploite des données propres à un patient pour une finalité de l'art. 2 est un DM, même s'il n'agit pas sur le corps humain [C, sur le fond ; formulation exacte À vérifier]. L'avis aurait dû citer cet arrêt : c'est la source la plus solide, et c'est une source contraignante. |
| 2 | Les mentions « non DM » ne protègent pas | **Confirmé** | La qualification dépend de la destination objective du produit. Une mention contraire au fonctionnement réel aggrave la situation : elle peut être lue comme une pratique commerciale trompeuse (art. L121-2 C. consom.) et, en cas de dommage, comme un indice de faute [I]. |
| 3 | « Contradiction = point le plus fragile » | **Confirmé et renforcé** | La contradiction est triple. (a) `mentions-legales.html:172` : le site « ne constitue ni acte médical, ni consultation ». (b) `index.html:868` : il se présente comme un « Outil d'information et d'orientation — non dispositif médical, Règl. UE 2017/745 ». (c) Il ajoute « Les résultats sont des orientations ». Le mot « résultats » suffit à démentir la mention. |
| 4 | Règle 11 : classe IIa minimum, IIb probable | **Confirmé, avec nuance** | Le raisonnement est juste. Mais la classe III est plus qu'une simple hypothèse « non exclue ». Une sous-orientation sur un purpura ou un nourrisson fébrile peut causer un décès, ce qui correspond au critère de la classe III [I]. MDCG 2019-11 rev.1 rattache la règle 11 au tableau IMDRF (gravité × importance de l'information) [À vérifier : annexe et exemples exacts]. |
| 5 | NHS 111 online / Pathways : classe I | **Partiellement infirmé** | Il s'agit d'une auto-déclaration de l'éditeur sous l'UK MDR 2002, régime proche de la directive 93/42. Elle prouve seulement que le triage public est traité comme un DM. Sa valeur en droit de l'Union est nulle. Le lien vers `openprescribing.net` est un **proxy tiers** : ce n'est pas une source primaire, il faut le retirer. L'enregistrement MHRA (base PARD) n'a pas été vérifié [À vérifier]. |
| 6 | Ameli « que faire si… » = modèle de l'option A | **À vérifier, risque de confusion** | Ameli publie des fiches générales. L'Assurance maladie et Mon espace santé ont aussi pu proposer des services plus interactifs [À vérifier]. Ne pas s'appuyer sur un exemple dont on ne connaît pas le statut. |
| 7 | Gratuité sans effet (art. 2(27)–2(28)) | **Confirmé** | La mise à disposition « à titre onéreux ou gratuit » est visée par le texte [C]. |
| 8 | Option A : la navigation par thème est hors DM | **Confirmé sous condition** | La condition : le choix de la fiche ne doit pas se faire à partir de réponses médicales. S'il se fait par signes (« fièvre + raideur de nuque → fiche méningite »), il redevient un tri individuel [I]. **Il faut un menu de thèmes libre, pas un questionnaire.** |
| 9 | Option B : 18 à 36 mois, plusieurs centaines de k€ | **Plausible** | C'est un ordre de grandeur, sans source. À présenter comme tel. |
| 10 | Section 7 : désactiver `#triageApp` en production | **Confirmé, et il faut le compléter** | Désactiver l'affichage ne suffit pas. Le code (`js/triage-ui.js`) et `/data/triage.json` restent servis publiquement (`triage-ui.js:62`). Le produit reste donc accessible et constitue une « mise à disposition » [I]. Il faut retirer ces fichiers du déploiement. |
| 11 | « Aucune donnée transmise » réduit le risque RGPD | **Partiellement infirmé** | Voir § 2.3. |

## 2. Risques omis par l'avis 2

### 2.1 Responsabilité du médecin éditeur (risque élevé)

- **Civile.** L'éditeur s'identifie comme « Docteur en médecine » (`mentions-legales.html:178`). Un juge appréciera probablement sa faute au regard de la compétence qu'il affiche, et non de celle d'un profane [I]. Si l'outil oriente à tort vers les autosoins ou un délai de 48 h, la victime peut invoquer la **perte de chance** (art. 1240 C. civ.). La réparation est alors une fraction du dommage. On ne peut pas non plus exclure la responsabilité du fait des produits défectueux (art. 1245 et s. C. civ.) pour un logiciel. La directive (UE) 2024/2853 inclut expressément les logiciels ; sa transposition est attendue pour décembre 2026 [À vérifier : état de la transposition].
- **Pénale.** Les infractions possibles sont l'homicide ou les blessures involontaires (art. 221-6 et 222-19 C. pén., causalité indirecte et faute caractérisée, art. 121-3). La mise en danger d'autrui (art. 223-1) est peu probable, car elle exige la violation *manifestement délibérée* d'une obligation particulière de prudence. Si l'outil est un DM sans marquage CE, s'ajoutent les sanctions spécifiques du CSP (art. L5461-1 et s., mise sur le marché d'un DM non conforme) [À vérifier : numérotation actuelle].
- **Assurance.** La RCP du médecin couvre en principe l'exercice clinique, pas l'édition d'un logiciel grand public. **Il faut demander par écrit à l'assureur RCP si cette activité est couverte.**
- Clause d'exclusion de responsabilité : sans effet contre un consommateur pour une faute ou un dommage corporel (art. R212-1 C. consom.) [C].

### 2.2 Déontologie et exercice

- **Téléconsultation / exercice illégal.** Il n'y a pas d'exercice illégal (art. L4161-1), puisque l'éditeur est médecin. Il n'y a pas non plus de télémédecine au sens de l'art. R6316-1 : aucun professionnel n'intervient en temps réel. Mais un outil qui « oriente » une personne précise s'approche d'un acte de régulation, qui relève de la régulation médicale du SAMU/SAS [I].
- **R4127-19 et 19-1 CSP.** L'avis initial ne les traite pas, et la consigne les présente comme des règles sur « la publicité ». Or, depuis le décret n° 2020-1662, l'art. 19 n'interdit plus que la pratique de la médecine « comme un commerce ». L'art. 19-1 autorise la communication d'informations, à condition qu'elle soit loyale, honnête, fondée sur des données acquises de la science, et non comparative [C, à relire sur Légifrance]. **Le risque réel n'est pas la publicité, c'est la loyauté** : afficher « non DM » alors que l'outil trie va contre l'exigence d'une information loyale. S'y ajoutent l'art. R4127-13 (participation à l'information du public : prudence, souci des répercussions) et l'art. R4127-14 (pas de divulgation de procédés insuffisamment éprouvés). L'avis 1 sur les seuils et l'absence de validation clinique pèsent directement ici.
- **Titre.** La mention « titre académique — usage personnel » ne neutralise pas la déontologie. Dès qu'il utilise sa qualité de médecin auprès du public, il reste soumis au code [I]. Si le médecin est inscrit au tableau, informer le conseil départemental de l'Ordre de cette activité est prudent [I].

### 2.3 RGPD et données de santé

Constats tirés du code :

- `js/triage-ui.js` : un seul appel réseau, `fetch('/data/triage.json')`, qui est une lecture. Un seul stockage, `localStorage['biq-triage-country']` (le pays). **Aucune réponse au questionnaire n'est stockée ni envoyée.** L'affirmation de `index.html:875` est exacte *pour ce fichier*.
- **Mais** Umami Analytics est chargé après consentement (`index.html:192`, `script.js`). Si des événements ou des URL révèlent un parcours (par ex. une ancre ou un événement par niveau de résultat), on obtient une donnée de santé indirecte (art. 9 RGPD) [I]. Aucun appel `umami.track` n'a été trouvé dans `script.js` ni `js/*.js`. **À contrôler dans les autres scripts et dans les URL avant de garder la promesse « rien n'est transmis ».**
- Le `localStorage` du pays relève de l'art. 82 de la loi Informatique et libertés. Il est exempté de consentement s'il est strictement nécessaire à une préférence demandée par l'utilisateur [C, doctrine CNIL]. Il faut le mentionner dans la politique de confidentialité.
- L'hébergeur Cloudflare reçoit les adresses IP dans ses journaux. Ce n'est pas une donnée de santé tant qu'aucune réponse n'est transmise.
- **HDS (art. L1111-8 CSP)** : il n'est pas requis aujourd'hui, puisque aucune donnée de santé n'est hébergée. Il deviendrait obligatoire si l'on ajoutait une sauvegarde, une version PSC ou des journaux de réponses (la page `psc-callback.html` existe : à surveiller).

### 2.4 Mentions légales (LCEN)

- Statut d'« éditeur non professionnel » avec adresse confiée à l'hébergeur (`mentions-legales.html`). C'est admis par la LCEN (art. 6, renuméroté par la loi SREN du 21 mai 2024 [À vérifier : la référence « 6.II / 6.I.2 » citée sur le site est peut-être devenue inexacte]). **Mais un médecin qui édite un outil de santé sous son nom et son titre aura du mal à se dire « non professionnel »** [I]. Un juge peut requalifier ce statut, ce qui obligerait à publier l'adresse.
- Il faut harmoniser `mentions-legales.html`, `legal-notice.html`, `conditions-utilisation.html` et `terms-of-use.html` avec la nouvelle qualification.

### 2.5 Pages maladies et art. R3113 CSP

- `ebola.html:787`, `marburg.html:677`, `ebola-en.html:404` citent les art. R3113-1, R3113-3 et D3113-8 (« fièvres hémorragiques africaines »). Les rattachements sont plausibles [À vérifier sur Légifrance : intitulé exact de la liste D3113-6/D3113-7/D3113-8, que le site désigne par « D3113-8 »].
- **Erreur de destinataire.** La déclaration obligatoire incombe aux **médecins et biologistes**, pas au public. Ces pages doivent le dire explicitement. Sinon, un patient pourrait croire qu'il doit déclarer lui-même ou que le site le fait pour lui.
- Le délai « within 1 hour » n'est pas prévu par le texte, qui dit « sans délai ». Il faut le supprimer ou en citer la source (procédure SPF/ARS).

### 2.6 Autres angles morts

- **Version EN ou multi-pays.** Un sélecteur de pays (`biq-triage-country`) signale une diffusion hors de France. C'est un argument de plus pour la mise sur le marché de l'Union, et cela pose aussi le régime britannique si des utilisateurs du Royaume-Uni sont visés [I].
- **AI Act.** Il ne s'applique pas tant que l'arbre est déterministe et sans apprentissage [I].
- **Mineurs.** Le parcours « nourrisson » s'adresse aux parents. Cela renforce le niveau de gravité retenu par la règle 11.

## 3. Plan d'action priorisé

| Priorité | Action | Délai |
|---|---|---|
| **P0** | Retirer du déploiement `#triageApp`, `js/triage-ui.js` et `/data/triage.json`. Garder seulement la liste statique des signes d'alarme et l'appel au 15/112. | Immédiat |
| **P0** | Retirer partout « Outil d'information et d'orientation — non dispositif médical » et « Les résultats sont des orientations » (`index.html:868` et clés i18n). | Immédiat |
| **P0** | Vérifier l'absence de tout événement analytics lié au questionnaire, puis corriger ou maintenir la phrase « aucune donnée ». | Immédiat |
| **P1** | Demander par écrit à l'assureur RCP si l'activité d'édition est couverte. | 2 semaines |
| **P1** | Pages maladies : préciser que la déclaration obligatoire vise les professionnels, et supprimer « 1 hour » sans source. | 2 semaines |
| **P1** | Relire sur sources primaires les références marquées [À vérifier] et remplacer le lien proxy NHS. | 2 semaines |
| **P2** | Option A de l'avis 2 avec un **menu de thèmes libre** (pas de questionnaire), puis mémo de qualification signé. | 1–3 mois |
| **P2** | Revoir le statut LCEN (non professionnel ou professionnel) et la numérotation de l'art. 6. Harmoniser les quatre pages légales FR/EN. | 1 mois |
| **P3** | Informer le CDOM si le médecin est inscrit. Documenter les sources cliniques de chaque fiche (R4127-13/14). | 3 mois |

## 4. Formulations exactes à publier

| Lieu | FR | EN |
|---|---|---|
| Bandeau unique, remplace `index.html:868` | Ces pages donnent des informations générales de santé publique, rédigées par un médecin. Elles ne tiennent pas compte de votre situation personnelle, ne posent pas de diagnostic et ne remplacent pas un avis médical. En cas d'urgence, appelez le 15 ou le 112. | These pages provide general public-health information written by a doctor. They do not take your personal situation into account, do not provide a diagnosis and do not replace medical advice. In an emergency, call 112 (15 in France). |
| Signes d'alarme (statique) | Si vous ou un proche avez l'un de ces signes, appelez le 15 ou le 112 maintenant. | If you or someone with you has any of these signs, call 112 (15 in France) now. |
| Phrase sur les données (si l'audit analytics est concluant) | Ces pages ne vous demandent aucune information sur votre santé et n'en enregistrent aucune. | These pages do not ask for, or record, any information about your health. |
| Mentions légales, nature du service (seulement après P0) | BreathIQ publie des informations générales de santé publique. Il n'analyse pas la situation d'une personne et ne produit aucune recommandation individuelle. | BreathIQ publishes general public-health information. It does not analyse any individual's situation and does not produce individual recommendations. |
| Mentions légales, responsabilité | Les informations sont fournies en l'état des connaissances à la date indiquée sur chaque page. Elles ne constituent pas un acte médical. Pour toute question sur votre santé, adressez-vous à un professionnel de santé. | Information reflects the state of knowledge on the date shown on each page. It is not a medical act. For any question about your health, consult a health professional. |
| Pages maladies, encadré déclaration | Pour les professionnels de santé : cette maladie fait l'objet d'une déclaration obligatoire sans délai à l'ARS par le médecin ou le biologiste (art. R3113-1 et s. du code de la santé publique). Le public n'a aucune démarche à faire : en cas de doute, appelez le 15. | For health professionals: in France, this disease must be notified without delay to the Regional Health Authority (ARS) by the doctor or laboratory (French Public Health Code, art. R3113-1 et seq.). Members of the public have nothing to declare: if in doubt, call 112 (15 in France). |

À ne pas publier : « non dispositif médical », « orientation », « résultat », « triage », « évaluez votre situation ». La phrase « Sa destination n'est pas médicale au sens de l'article 2… », proposée dans l'avis 2, est **déconseillée** même après l'option A. Une affirmation juridique sur le site n'apporte rien et crée un engagement vérifiable. Mieux vaut décrire ce que fait le site.

---

Ceci n'est pas une consultation juridique. **À faire valider par un avocat inscrit au barreau.**
