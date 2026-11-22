'use strict';

const CACHE = 'd1d2dopamine-site-v8';
const PREFIX = 'd1d2dopamine-site-';
const SHELL = [
  './',
  'index.html',
  'ru.html',
  'projects.html',
  'projects-ru.html',
  'about.html',
  'about-ru.html',
  'styles.css?v=v8',
  'site.js?v=v8',
  'assets/skyline-lines.png?v=v8',
  'assets/header-tiles.webp',
  'assets/bg-blueberries.webp',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => Promise.allSettled(
        SHELL.map(path => cache.add(new Request(new URL(path, self.registration.scope), { cache: 'reload' })))
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try {
        const fresh = await fetch(new Request(req, { cache: 'no-cache' }));
        if (fresh.ok) event.waitUntil(cache.put(req, fresh.clone()));
        return fresh;
      } catch (err) {
        const cached = await cache.match(req);
        if (cached) return cached;
        throw err;
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req);
    const update = fetch(new Request(req, { cache: 'no-cache' }))
      .then(fresh => {
        if (fresh.ok) {
          event.waitUntil(cache.put(req, fresh.clone()));
        }
        return fresh;
      })
      .catch(() => cached);
    return cached || update;
  })());
});
