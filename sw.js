// Zenix — Service Worker v2
// - Page (index.html) : réseau d'abord, cache en secours → les mises à jour arrivent sans changer de version
// - Ressources statiques (icônes, Chart.js, polices) : cache d'abord
// Incrémenter CACHE_NAME seulement si la liste des ressources change.

const CACHE_NAME = 'zenix-v3';  // v3 : nouvelles icônes Ensō

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js',
  'https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Syne:wght@400;500;600;700;800&display=swap'
];

const CACHEABLE_HOSTS = [self.location.host, 'cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.allSettled(
        ASSETS_TO_CACHE.map(url => cache.add(url).catch(() => console.warn('[SW] Échec mise en cache :', url)))
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isCacheable(response) {
  return response && (response.ok || response.type === 'opaque');
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (!CACHEABLE_HOSTS.includes(url.host)) return;

  // Navigation : réseau d'abord, uniquement pour les pages de ce dossier
  // (une ancienne version gardée dans un sous-dossier, ex. /v1/, n'est jamais interceptée)
  if (req.mode === 'navigate') {
    const scopePath = new URL(self.registration.scope).pathname;
    const rel = url.pathname.slice(scopePath.length);
    if (!url.pathname.startsWith(scopePath) || rel.includes('/')) return;
    event.respondWith(
      fetch(req)
        .then(res => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then(c => c.put('./index.html', copy));
          }
          return res;
        })
        .catch(() => caches.match('./index.html').then(r => r || caches.match('./')))
    );
    return;
  }
  // Ne sert pas les fichiers d'un sous-dossier (ancienne version) depuis ce cache
  if (url.host === self.location.host) {
    const scopePath = new URL(self.registration.scope).pathname;
    if (url.pathname.slice(scopePath.length).includes('/')) return;
  }

  // Ressources : cache d'abord, puis réseau (et mise en cache)
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        if (isCacheable(res)) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, copy));
        }
        return res;
      });
    })
  );
});
