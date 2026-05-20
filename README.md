# BreathIQ — Intelligence respiratoire mondiale

> Outil d'information publique sur la qualité de l'air, la circulation virale et les foyers pathogènes. Non dispositif médical. Accès libre et gratuit.

**Site :** https://breathiq.fr  
**Auteur :** Dr. Clément MÉDEAU — contact@breathiq.fr

---

## Déploiement sur GitHub + Netlify (sans coder)

### Étape 1 — Créer un dépôt GitHub

1. Allez sur [github.com](https://github.com) et connectez-vous (ou créez un compte gratuit)
2. Cliquez sur le bouton vert **"New"** (ou **"+"** en haut à droite → **"New repository"**)
3. Donnez un nom : `breathiq`
4. Laissez le dépôt en **Public**
5. **Ne cochez rien** (pas de README, pas de .gitignore)
6. Cliquez **"Create repository"**

### Étape 2 — Envoyer les fichiers sur GitHub

1. Sur la page de votre nouveau dépôt vide, cliquez sur **"uploading an existing file"** (lien bleu au centre)
2. **Glissez-déposez tous les fichiers** du dossier `breathiq/` dans la zone de dépôt
   - `index.html`
   - `style.css`
   - `script.js`
   - `favicon.svg`
   - `privacy.html`
   - `mentions-legales.html`
   - `legal-notice.html`
   - `conditions-utilisation.html`
   - `404.html`
   - `robots.txt`
   - `sitemap.xml`
   - `humans.txt`
   - `_headers`
   - `_redirects`
   - `netlify.toml`
   - `.gitignore`
3. En bas de la page, laissez le message par défaut et cliquez **"Commit changes"**

### Étape 3 — Connecter Netlify à GitHub

1. Allez sur [app.netlify.com](https://app.netlify.com) et connectez-vous avec votre compte GitHub
2. Cliquez **"Add new site"** → **"Import an existing project"**
3. Cliquez **"Deploy with GitHub"**
4. Autorisez Netlify à accéder à votre GitHub si demandé
5. Sélectionnez le dépôt **`breathiq`**
6. Paramètres de build :
   - **Branch to deploy :** `main`
   - **Build command :** *(laisser vide)*
   - **Publish directory :** `.`
7. Cliquez **"Deploy site"**

### Étape 4 — Configurer le domaine breathiq.fr

1. Dans Netlify, allez dans **"Domain settings"**
2. Cliquez **"Add custom domain"** et entrez `breathiq.fr`
3. Suivez les instructions pour modifier les DNS chez votre registrar (OVH, Gandi, etc.)
4. Netlify active automatiquement le HTTPS (certificat SSL gratuit via Let's Encrypt)

### Étape 5 — Mises à jour futures

Pour modifier le site plus tard, il suffit de :
1. Aller sur github.com → votre dépôt `breathiq`
2. Cliquer sur le fichier à modifier → icône crayon ✏️
3. Faire vos modifications → **"Commit changes"**
4. Netlify redéploie automatiquement en 1-2 minutes

---

## Structure des fichiers

```
breathiq/
├── index.html              ← Page principale
├── style.css               ← Design
├── script.js               ← Logique (carte, données, i18n)
├── favicon.svg             ← Icône de l'onglet
├── privacy.html            ← Politique de confidentialité (FR)
├── mentions-legales.html   ← Mentions légales (FR)
├── legal-notice.html       ← Legal Notice (EN)
├── conditions-utilisation.html ← CGU (FR)
├── 404.html                ← Page d'erreur
├── robots.txt              ← Blocage des bots IA
├── sitemap.xml             ← Plan du site (SEO)
├── humans.txt              ← Crédit auteur
├── _headers                ← Sécurité HTTP (Netlify)
├── _redirects              ← Redirections (Netlify)
└── netlify.toml            ← Configuration Netlify
```

---

## Licence & Propriété intellectuelle

© 2026 Clément MÉDEAU — Tous droits réservés  
Opt-out TDM activé — Art. L122-5-3 CPI · Dir. 2019/790/UE · AI Act Règl. UE 2024/1689  
Voir [mentions-legales.html](mentions-legales.html) et [conditions-utilisation.html](conditions-utilisation.html)
