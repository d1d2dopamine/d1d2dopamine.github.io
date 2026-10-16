'use strict';
const CACHE = 'd1d2dopamine-site-round14-v1';
const PREFIX = 'd1d2dopamine-site-';
const FILES = [
  './', 'index.html', 'ru.html', 'about.html', 'about-ru.html', 'projects.html', 'projects-ru.html',
  '404.html', 'favicon.ico?v=round14', 'styles.css?v=round14', 'site.js?v=round14', 'pixel-fx.js?v=round14', 'site.webmanifest?v=round14',
  'assets/og-image.png', 'assets/favicon.png?v=round14', 'assets/apple-touch-icon.png?v=round14',
  'assets/icon-192.png?v=round14', 'assets/icon-512.png?v=round14', 'assets/icon-maskable-512.png?v=round14',
  'assets/fonts/shantell-sans-variable.woff2',
];
const allowed = new Set(FILES.map(file => new URL(file, self.registration.scope).href));
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES.map(file => new Request(new URL(file, self.registration.scope), {cache: 'reload'})))));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !allowed.has(event.request.url)) return;
  if (event.request.mode === 'navigate') {
    // Fresh documents online; exact page from the cache when offline.
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try {
        const response = await fetch(event.request);
        if (response.ok) await cache.put(event.request, response.clone());
        return response;
      } catch (error) {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        throw error;
      }
    })());
  } else {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(event.request);
      if (cached) return cached;
      const response = await fetch(event.request);
      if (response.ok) await cache.put(event.request, response.clone());
      return response;
    })());
  }
});
