const CACHE = 'family-menu-v4';
const STATIC_ASSETS = [
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;

  if (req.method !== 'GET') return;

  // Always prefer the network for page navigations / index.html.
  if (req.mode === 'navigate' || new URL(req.url).pathname.endsWith('/index.html')) {
    event.respondWith(
      fetch(req, { cache: 'no-store' })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Static assets: cache first, refresh in background.
  event.respondWith(
    caches.match(req).then(cached => {
      const fresh = fetch(req).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(req, copy));
        }
        return response;
      }).catch(() => cached);

      return cached || fresh;
    })
  );
});