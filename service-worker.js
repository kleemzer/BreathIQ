// BreathIQ Service Worker — PWA Offline Support
// Cache stratégique : triage disponible sans connexion

const CACHE_NAME = 'breathiq-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.min.css',
  '/script.min.js',
  '/js/diagnostic-engine.min.js',
  '/manifest.json',
  '/assets/favicon.ico',
];

// Installation : mise en cache des assets critiques
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activation : nettoyage anciens caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch : Cache First pour assets statiques, Network First pour data
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Module pro pathogènes → toujours réseau (lazy load, pas de cache SW)
  if (url.pathname.startsWith('/pro/')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Données épidémio live → Network First (fresh data si dispo)
  if (url.pathname.startsWith('/data/') || url.hostname !== location.hostname) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res.ok && url.hostname === location.hostname) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Assets statiques → Cache First
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return res;
      });
    })
  );
});
