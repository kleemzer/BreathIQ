'use strict';

// ============================================================
// BreathIQ Service Worker — Cache-first pour assets statiques,
// Network-first pour données épidémiques critiques.
// © 2026 Dr. Clément MÉDEAU
// ============================================================

const CACHE_VERSION = 'biq-v39';
// Doit suivre le ?v= de index.html : les URLs .min.* sans ?v= sont figées un an par le CDN (immutable),
// le SW ne doit donc jamais les demander au réseau sans version.
const ASSET_VERSION = '20261007s';
const CACHE_STATIC  = `${CACHE_VERSION}-static`;
const CACHE_DATA    = `${CACHE_VERSION}-data`;

// Assets statiques : chemins sans ?v= — le SW normalise les URLs
// Les ?v= dans index.html servent uniquement au cache HTTP natif (sans SW)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.min.css',
  '/script.min.js',
  '/api-live.min.js',
  '/js/clinical-orientation.min.js',
  '/js/care-facilities.min.js',
  '/js/symptom-guide.min.js',
  '/favicon.svg',
  '/manifest.json',
  '/assets/og-image.png',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/dr-medeau-64.webp',
  '/assets/dr-medeau.webp',
  '/assets/dr-medeau.jpg',
  '/assets/inter-variable.woff2',
  '/404.html',
  '/offline.html',
  '/bilan-epidemique.html',
];

// Données épidémiques : mises en cache mais réseau prioritaire
const DATA_ASSETS = [
  '/data/pathogens.json',
  '/data/pheic-alerts.json',
  '/data/who-alerts.json',
  '/data/spf-live.json',
];

// ── Installation — pré-cache des assets statiques ────────────
// Réseau : URL versionnée + cache:'reload' (contourne CDN immutable et HTTP cache) ; clé de cache : URL nue
function isVersionedAsset(pathname) {
  return pathname.endsWith('.js') || pathname.endsWith('.css') || pathname.endsWith('.woff2');
}

// Assets dont l'absence rend le site inutilisable : leur échec fait échouer l'installation
const CRITICAL_ASSETS = new Set(['/', '/index.html', '/style.min.css', '/script.min.js', '/api-live.min.js']);

async function precacheAll(cache, urls) {
  // 1) Garde-fou de propagation : Cloudflare Pages ne bascule pas tous les fichiers au même instant
  //    sur chaque PoP. index.html n'est jamais mis en cache au CDN : s'il ne référence pas encore
  //    ASSET_VERSION, ce PoP sert encore l'ancien déploiement — on n'y télécharge SURTOUT pas les
  //    assets versionnés (ils seraient figés un an sous la nouvelle URL). L'install échoue, le
  //    navigateur réessaiera à la prochaine navigation.
  const indexResp = await fetch(new Request('/index.html', { cache: 'reload' }));
  if (!indexResp.ok) throw new Error(`[SW] index.html HTTP ${indexResp.status}`);
  const indexHtml = await indexResp.clone().text();
  if (!indexHtml.includes(`script.min.js?v=${ASSET_VERSION}`)) {
    throw new Error(`[SW] déploiement non propagé : index.html ne référence pas ${ASSET_VERSION}`);
  }
  await cache.put('/index.html', indexResp.clone());
  await cache.put('/', indexResp);

  // 2) Précache du reste : URL versionnée + cache:'reload' (contourne CDN immutable et HTTP cache),
  //    clé de cache = URL nue (le fetch handler normalise les ?v=)
  await Promise.all(urls.filter(u => u !== '/' && u !== '/index.html').map(async url => {
    const versioned = isVersionedAsset(url);
    const req = new Request(versioned ? `${url}?v=${ASSET_VERSION}` : url, { cache: 'reload' });
    try {
      const r = await fetch(req);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      await cache.put(url, r);
    } catch (e) {
      if (CRITICAL_ASSETS.has(url)) throw new Error(`[SW] précache critique échoué ${url}: ${e.message}`);
    }
  }));
}

self.addEventListener('install', event => {
  // Pas de catch : une installation incomplète ne doit jamais être promue
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => precacheAll(cache, STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── Activation — purge des anciens caches ────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_STATIC && k !== CACHE_DATA)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Normalise une URL en retirant les ?v= de cache-busting pour la clé de cache SW
function normalizeRequest(request) {
  const url = new URL(request.url);
  if (url.search && (url.searchParams.has('v') || url.searchParams.has('_'))) {
    url.search = '';
    return new Request(url.toString(), { mode: request.mode, credentials: request.credentials });
  }
  return request;
}

// ── Fetch — stratégie par type de ressource ──────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ne traiter que les requêtes GET du même origin + CDN Leaflet/Fonts
  if (request.method !== 'GET') return;
  const isOwnOrigin = url.origin === self.location.origin;
  const isCDN = url.hostname === 'unpkg.com' ||
                url.hostname === 'fonts.googleapis.com' ||
                url.hostname === 'fonts.gstatic.com';

  if (!isOwnOrigin && !isCDN) return;

  // Données épidémiques : Network-first, fallback cache (clé normalisée sans ?_=)
  if (isOwnOrigin && url.pathname.startsWith('/data/')) {
    event.respondWith(networkFirstWithCache(normalizeRequest(request), CACHE_DATA));
    return;
  }

  // Assets statiques propres : Cache-first avec URL normalisée (sans ?v=)
  if (isOwnOrigin && (
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js')  ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.webp')||
    url.pathname === '/manifest.json'
  )) {
    event.respondWith(cacheFirstWithNetworkFallback(normalizeRequest(request), CACHE_STATIC, request));
    return;
  }

  // HTML : Network-first, fallback cache (pour les mises à jour)
  if (isOwnOrigin && (
    url.pathname === '/' ||
    url.pathname.endsWith('.html')
  )) {
    event.respondWith(networkFirstWithCache(request, CACHE_STATIC));
    return;
  }

  // CDN (Leaflet) : Cache-first
  if (isCDN) {
    event.respondWith(cacheFirstWithNetworkFallback(request, CACHE_STATIC));
    return;
  }
});

// ── Stratégies ───────────────────────────────────────────────
async function networkFirstWithCache(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || offlineFallback(request);
  }
}

// cacheKeyRequest : URL normalisée (clé) ; networkRequest : requête d'origine, versionnée, pour le réseau
async function cacheFirstWithNetworkFallback(cacheKeyRequest, cacheName, networkRequest = cacheKeyRequest) {
  const cached = await caches.match(cacheKeyRequest);
  if (cached) return cached;
  try {
    const response = await fetch(networkRequest);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(cacheKeyRequest, response.clone());
    }
    return response;
  } catch {
    return offlineFallback(cacheKeyRequest);
  }
}

function offlineFallback(request) {
  const url = new URL(request.url);
  if (url.pathname.endsWith('.html') || url.pathname === '/') {
    return caches.match('/offline.html').then(r => r || caches.match('/404.html'));
  }
  // Pour les données JSON, retourner un objet vide valide
  if (url.pathname.endsWith('.json')) {
    return new Response(JSON.stringify({ offline: true, alerts: [], pathogens: [] }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return new Response('', { status: 503, statusText: 'Service Unavailable' });
}
