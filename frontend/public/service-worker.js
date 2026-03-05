const CACHE_NAME = 'bebrivus-v1';
const API_CACHE_NAME = 'bebrivus-api-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/beBivus.png',
  '/manifest.json',
  '/offline.html',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Pre-cache critical API endpoints
      caches.open(API_CACHE_NAME).then(cache => {
        return Promise.allSettled([
          fetch('/api/opportunities/').then(r => r.ok && cache.put('/api/opportunities/', r.clone())),
          fetch('/api/mentors/').then(r => r.ok && cache.put('/api/mentors/', r.clone())),
          fetch('/api/forum/discussions/').then(r => r.ok && cache.put('/api/forum/discussions/', r.clone())),
          fetch('/api/resources/').then(r => r.ok && cache.put('/api/resources/', r.clone())),
        ]);
      }),
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // API requests — Network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request.clone())
        .then(response => {
          // Always update cache with fresh data when online (GET only — POST/PUT/DELETE can't be cached)
          if (response.ok && request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(API_CACHE_NAME).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline — return cached version
          return caches.match(request).then(cached => {
            if (cached) return cached;
            // Return empty array if nothing cached
            return new Response(
              JSON.stringify({ results: [], count: 0 }),
              { headers: { 'Content-Type': 'application/json' }}
            );
          });
        })
    );
    return;
  }

  // Static assets — Cache first, fallback to network
  event.respondWith(
    caches.match(request).then(cached => {
      return cached || fetch(request).catch(() => {
        // Ultimate fallback for pages
        if (request.destination === 'document') {
          return caches.match('/offline.html');
        }
      });
    })
  );
});

// Listen for messages from clients
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
