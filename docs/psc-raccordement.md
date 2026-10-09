# Pro Santé Connect — dossier de raccordement (bac à sable) et déploiement

Statut au 2026-10-09 : code prêt, **aucun `client_id` obtenu**. Tant que l'ANS n'a pas raccordé
BreathIQ, le formulaire de déclaration affiche « réservé aux professionnels authentifiés — raccordement
en cours » et refuse toute saisie. Rien n'est inventé ni simulé.

## 1. Demande à faire par le Dr Médeau (espace industriels ANS)

Portail : https://industriels.esante.gouv.fr/produits-et-services/pro-sante-connect → « Demander un
raccordement » (bac à sable). Éléments à fournir (prêts à coller) :

| Champ | Valeur |
|---|---|
| Nom du projet (public) | BreathIQ |
| Éditeur / contact technique | Dr Clément Médeau — contact@breathiq.fr |
| Description | Texte final validé le 2026-10-09 : voir la section « Description DataPass » ci-dessous |
| Type de client OIDC | Confidentiel côté serveur (Cloudflare Pages Function), flux **Authorization Code + PKCE (S256)** |
| URLs de redirection | `https://breathiq.fr/psc-callback.html` ; preview : `https://fix-audit-lancement.<projet>.pages.dev/psc-callback.html` |
| URL de déconnexion | `https://breathiq.fr/` |
| Scopes | `openid scope_all` |
| Données lues | `SubjectRefPro.exercices[].codeProfession` (profession), nom/prénom d'exercice pour l'affichage ; **aucun stockage** du RPPS — pseudonyme SHA-256 salé côté serveur uniquement pour la limitation de débit |
| Identités de test | Organisation « BreathIQ » déjà créée sur https://edit.esante.gouv.fr/organization/74555 — créer une identité « médecin » + e-CPS de test |

Après réception : `client_id` et `client_secret` bac à sable.

## 2. Configuration Cloudflare Pages (Settings → Environment variables, Production **et** Preview)

| Variable | Valeur |
|---|---|
| `PSC_CLIENT_ID` | fourni par l'ANS |
| `PSC_CLIENT_SECRET` | fourni par l'ANS — **secret**, jamais dans le dépôt |
| `PSC_TOKEN_ENDPOINT` | `https://auth.bas.psc.esante.gouv.fr/auth/realms/esante-wallet/protocol/openid-connect/token` |
| `PSC_USERINFO_ENDPOINT` | `https://auth.bas.psc.esante.gouv.fr/auth/realms/esante-wallet/protocol/openid-connect/userinfo` |
| `PSC_ALLOWED_REDIRECTS` | `https://breathiq.fr/psc-callback.html,https://fix-audit-lancement.<projet>.pages.dev/psc-callback.html` |
| `PSC_ALLOWED_PROFESSIONS` | `10,50,21,60,70` — suspicion clinique : médecin (10), sage-femme (50) ; signal de terrain : pharmacien (21), infirmier (60), masseur-kinésithérapeute (70) |
| `DECL_SALT` | chaîne aléatoire longue (ex. `openssl rand -hex 32`) |

KV : Workers & Pages → KV → créer l'espace `breathiq-declarations`, puis Pages → Settings → Functions →
**KV namespace bindings** : variable `DECL` → cet espace (Production et Preview).

Côté site : dans `index.html`, remplacer `window.__PSC_CLIENT_ID__ = ''` par le `client_id` reçu
(valeur publique, non secrète). Passage en production PSC : endpoints `auth.psc.esante.gouv.fr`
après homologation ANS.

## 3. Ce que fait le code

- `functions/api/psc-token.js` : échange code → jeton avec le `client_secret`, lit le `userinfo`,
  renvoie au navigateur uniquement jeton + nom d'exercice + codes profession.
- `functions/api/declare.js` : **revérifie le jeton auprès de l'ANS à chaque déclaration**, refuse les
  professions hors liste, valide la charge utile (listes fermées, pas de texte libre, position au
  demi-degré), pseudonymise, limite à 20 déclarations/jour/déclarant, stocke 120 jours.
- `functions/api/declarations.js` : agrégat semaine × région × pathologie, cellules < 3 supprimées.
- Tests : `npm run test:declarations`.

## 4. Test de bout en bout (dès réception du client_id)

1. Activer l'e-CPS de test (appli « e-CPS bac à sable », lien sur EDIT).
2. Ouvrir la preview → Espace Soignant → Déclarer → « Se connecter avec Pro Santé Connect ».
3. Vérifier : retour sur `/psc-callback.html`, formulaire déverrouillé avec le nom d'exercice,
   envoi → 201 ; en réseau, aucun appel direct du navigateur vers `*.psc.esante.gouv.fr` hors
   redirection.
4. Tenter l'envoi sans jeton (`curl -X POST /api/declare`) → 401 ; avec une identité de test
   non-PS → 403.

## Description DataPass (version finale du 2026-10-09)

Nom du projet : **BreathIQ**

À coller tel quel dans « Description du projet » (DataPass, étape 1). Deux réserves à la charge du Dr Médeau : vérifier les articles cités sur Légifrance (L3113-1, L1413-15) et ne pas se désigner soi-même DPO.

Le texte est conservé dans l'historique de la conversation ; points clés que le code respecte (testés par `npm run test:declarations`) :
- PSC uniquement pour la fonction de signalement ; mode grand public et contenus professionnels en accès libre ;
- deux catégories déduites de la profession, jamais additionnées : suspicion clinique (10, 50) et signal de terrain (21, 60, 70) ;
- France métropolitaine et DROM uniquement ; aucune position, seule la région ;
- pseudonyme salé côté serveur, conservation 120 jours, hébergement Cloudflare ;
- restitution agrégée semaine × région × catégorie × pathologie, avec nombre de professionnels, cellules < 3 supprimées ;
- phase pilote : aucune alerte statistique (`FEATURE_LOCAL_SIGNALS = false`).
