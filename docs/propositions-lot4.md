# Lot 4 — propositions à valider par le Dr Médeau (rien n'est publié sans accord)

## 4.2 — Formulation RGPD (remplace « Conformité RGPD totale »)

**Option A (sobre)**
> BreathIQ est conçu pour respecter le RGPD : aucune donnée personnelle de santé n'est collectée, les préférences restent sur votre appareil, et les seules requêtes vers des tiers (qualité de l'air, cartographie) sont décrites dans la politique de confidentialité.

**Option B (engagement + limite)**
> Nous nous efforçons d'appliquer le RGPD par conception : pas de compte, pas de profilage, pas de donnée de santé transmise. Certaines requêtes techniques (cartes OpenStreetMap, qualité de l'air Open-Meteo, recherche de ville Nominatim) exposent votre adresse IP au prestataire concerné — détail et finalités dans la politique de confidentialité.

Tiers recevant encore l'adresse IP après le lot 3.1 (à lister dans `privacy.html` / `privacy-en.html`) : tuiles OpenStreetMap, Open-Meteo (qualité de l'air et pollens, coordonnées arrondies), Nominatim (recherche de ville / géocodage inverse), Overpass (structures de soins à proximité), Umami (uniquement après consentement), esante.gouv.fr (logo Pro Santé Connect), ANS Pro Santé Connect (uniquement lors d'une connexion soignant).

## 4.3 — Questionnaire de symptômes : information générale, non personnalisée

**Reformulation 1 (par signes)**
> Ce questionnaire présente, à titre d'information générale, les signes qui justifient d'appeler les secours, de consulter rapidement, ou qui relèvent habituellement d'une surveillance à domicile. Il ne tient pas compte de votre situation personnelle et ne constitue ni un diagnostic ni une orientation individuelle : en cas de doute, contactez un professionnel de santé.
> Titres des niveaux : « Signes justifiant d'appeler les secours » / « Signes justifiant de consulter » / « Signes habituellement surveillés à domicile ».

**Reformulation 2 (par repères)**
> Repères d'information : les situations ci-dessous décrivent ce que recommandent en général les autorités sanitaires (HAS, SFMU, OMS) face à certains signes. Elles ne remplacent pas l'avis d'un médecin qui vous connaît. Les signes d'urgence (difficulté à respirer, lèvres bleues, confusion, perte de connaissance) justifient toujours d'appeler le 15 ou le 112.
> Titres des niveaux : « Appeler les secours est recommandé » / « Consulter est recommandé » / « Surveillance à domicile habituellement suffisante ».

Dans les deux cas, les signes d'urgence restent affichés tels quels ; seuls les impératifs individuels (« Restez chez vous », « Allez au centre de santé ») deviennent des repères généraux.

## 4.3 — Mentions légales : bloc éditeur standard (remplace « Titre académique à titre indicatif »)

> **Éditeur du site** — BreathIQ est édité par Dr Clément Médeau, docteur en médecine, médecin généraliste, exerçant à La Rochelle (France), à titre personnel et bénévole, en dehors de toute activité professionnelle ou commerciale.
> **Directeur de la publication** — Dr Clément Médeau.
> **Contact** — contact@breathiq.fr.
> **Hébergeur** — Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, États-Unis (Cloudflare Pages ; données servies depuis le réseau européen de Cloudflare).
> **Nature du service** — outil d'information en santé publique, gratuit, sans publicité ; il ne constitue pas un dispositif médical au sens du règlement (UE) 2017/745 et ne remplace pas une consultation médicale.

(À compléter par le Dr Médeau : numéro RPPS si souhaité, adresse professionnelle, ordre départemental d'inscription.)

## 4.3 — robots.txt : variante proposée (NE PAS appliquer sans accord)

```
# Consultation à la demande autorisée (assistants qui répondent à un utilisateur)
User-agent: ChatGPT-User
Allow: /
User-agent: Claude-Web
Allow: /
User-agent: PerplexityBot
Allow: /

# Collecte pour entraînement de modèles refusée
User-agent: GPTBot
Disallow: /
User-agent: CCBot
Disallow: /
User-agent: Google-Extended
Disallow: /
User-agent: Applebot-Extended
Disallow: /
User-agent: Bytespider
Disallow: /

# Moteurs de recherche classiques
User-agent: *
Allow: /
Disallow: /psc-callback.html
Disallow: /api/

Sitemap: https://breathiq.fr/sitemap.xml
```

## 4.2 — Bandeau cookies

Constat code : aucun cookie n'est déposé ; `localStorage` sert uniquement aux préférences (langue, thème, mode, profil soignant déclaratif, journal local des déclarations, caches de données publiques). Le seul tiers non essentiel est **Umami** (analytics), chargé après consentement.

- **Si Umami est conservé** : le bandeau « Accepter / Continuer sans accepter » reste nécessaire (consentement préalable à la mesure d'audience non exemptée).
- **Si Umami est retiré ou configuré en mode exempté CNIL** (pas de cookie, pas de suivi inter-sites, finalité strictement statistique) : remplacer le bandeau par une ligne d'information — « Ce site ne dépose aucun cookie. Vos préférences restent sur votre appareil. [Confidentialité] ».

Décision à prendre par le Dr Médeau.
