'use strict';
const CACHE_NAME = 'greyfield-shell-v2';
const FALLBACK_SHELL = [
  './', './index.html', './style.css', './script.js', './manifest.webmanifest',
  './assets/favicon.svg', './assets/signal-art.svg', './assets/fallback-01.svg',
  './assets/fallback-02.svg', './assets/fallback-03.svg'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Keep the worker install resilient in both plain-static and Vite builds:
    // Vite may hash the CSS/JS filenames, so one missing fallback must not abort install.
    for (const path of FALLBACK_SHELL) {
      try {
        const response = await fetch(path, { cache: 'reload' });
        if (response.ok) await cache.put(path, response.clone());
      } catch (_) {}
    }
    try {
      const response = await fetch('./index.html', { cache: 'reload' });
      if (response.ok) {
        await cache.put('./index.html', response.clone());
        const html = await response.text();
        const candidates = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(match => match[1]);
        const localUrls = [...new Set(candidates.map(value => {
          try { return new URL(value, self.location.href); } catch (_) { return null; }
        }).filter(url => url && url.origin === self.location.origin && /\.(?:css|js|svg|webmanifest)$/.test(url.pathname)))];
        for (const url of localUrls) {
          try {
            const asset = await fetch(url.href, { cache: 'reload' });
            if (asset.ok) await cache.put(url.href, asset.clone());
          } catch (_) {}
        }
      }
    } catch (_) {}
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith('greyfield-shell-') && key !== CACHE_NAME).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  // External APIs, local media, photos and audio are never cached by this worker.
  if (url.origin !== self.location.origin) return;
  const path = url.pathname;
  const shellFile = /\.(?:css|js|svg|webmanifest)$/.test(path) && (path.includes('/assets/') || /\/(?:index|script|style|sw|manifest)\.[a-z]+$/.test(path));
  const textShell = /\/(?:index\.html|llms\.txt|README-TR\.md|favicon\.svg)$/.test(path);
  const isShell = path.endsWith('/') || shellFile || textShell;
  if (!isShell) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => {
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(async cache => {
          await cache.put('./index.html', copy);
          try { await cache.put('./', copy.clone()); } catch (_) {}
        });
      }
      return response;
    }).catch(async () => (await caches.match('./index.html')) || (await caches.match('./'))));
    return;
  }
  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
    if (response && response.ok) { const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(request, copy)); }
    return response;
  })));
});
