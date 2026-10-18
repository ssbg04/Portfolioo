const CACHE_NAME = 'portfolio-cache-v2';

// Core assets to precache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/logo.png',
  '/favicon.ico',
  '/CV-Cris-Charles-Garcia.pdf'
];

// Install: precache shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('SW: Precache partial failure (non-critical):', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch handler
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Skip non-GET requests and non-http protocols
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 2. CRITICAL: Never intercept cross-origin requests (e.g. cloudflareinsights.com, cdn, analytics)
  // This avoids ad-blocker network rejections crashing the Service Worker with TypeError
  if (url.origin !== self.location.origin) {
    return;
  }

  // 3. CRITICAL: Never intercept or cache API requests (/api/live-chat, /api/geo, etc.)
  // Real-time server communication must always hit the edge network directly
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // 4. Navigation requests (HTML pages): Network-First with Cache Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Offline fallback
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          const rootCached = await caches.match('/');
          if (rootCached) {
            return rootCached;
          }
          return new Response(
            '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Offline - Cris Charles</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="font-family:sans-serif;background:#090a0f;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;padding:20px;"><div><h1 style="font-size:1.8rem;margin-bottom:12px;">Offline Mode</h1><p style="color:#888;max-width:400px;margin:0 auto 20px;">You are currently offline. Please reconnect to view new updates or visit previously cached pages.</p><a href="/" style="display:inline-block;padding:10px 20px;border-radius:12px;background:#3b82f6;color:#fff;text-decoration:none;font-weight:600;">Return to Home</a></div></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        })
    );
    return;
  }

  // 5. Static Assets (CSS, JS, WebP, SVG, Fonts, PNG): Cache with Network Fallback & Background Update
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Revalidate in background
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return networkResponse;
      });
    })
  );
});
