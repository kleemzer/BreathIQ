'use strict';

// ============================================================
// BreathIQ Service Worker — Cache-first pour assets statiques,
// Network-first pour données épidémiques critiques.
// © 2026 Dr. Clément MÉDEAU
// ============================================================

const CACHE_VERSION = 'biq-v2';
const CACHE_STATIC  = `${CACHE_VERSION}-static`;
const CACHE_DATA    = `${CACHE_VERSION}-data`;

// Assets statiques : mis en cache à l'installation, servis offline
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.min.css',
  '/script.min.js',
  '/api-live.js',
  '/js/clinical-orientation.min.js',
  '/js/care-facilities.min.js',
  '/favicon.svg',
  '/manifest.json',
  '/assets/og-image.png',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/dr-medeau-64.webp',
  '/assets/dr-medeau.webp',
  '/assets/dr-medeau.jpg',
  '/404.html',
];

// Données épidémiques : mises en cache mais réseau prioritaire
const DATA_ASSETS = [
  '/data/pathogens.json',
  '/data/pheic-alerts.json',
  '/data/who-alerts.json',
  '/data/spf-live.json',
];

// ── Installation — pré-cache des assets statiques ────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch(err => console.warn('[SW] Install partial fail:', err))
  );
});

// ── Activation — purge des anciens caches ────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k.startsWith('biq-') && k !== CACHE_STATIC && k !== CACHE_DATA)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

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

  // Données épidémiques : Network-first, fallback cache
  if (isOwnOrigin && url.pathname.startsWith('/data/')) {
    event.respondWith(networkFirstWithCache(request, CACHE_DATA));
    return;
  }

  // Assets statiques propres : Cache-first
  if (isOwnOrigin && (
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js')  ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.webp')||
    url.pathname === '/manifest.json'
  )) {
    event.respondWith(cacheFirstWithNetworkFallback(request, CACHE_STATIC));
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

  // CDN (Leaflet, Fonts) : Cache-first
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

async function cacheFirstWithNetworkFallback(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return offlineFallback(request);
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
