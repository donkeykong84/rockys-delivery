// Rocky's Delivery — Service Worker
// Cache-first for static assets, network-first for API calls.

const CACHE = 'rk-v1';
const STATIC = [
  './',
  './index.html',
  './Login.html',
  './Customer.html',
  './Picker.html',
  './Driver.html',
  './StockHandler.html',
  './Manager.html',
  './ITDashboard.html',
  './brand.css',
  './manifest.json',
  './icon.svg',
  './rk-config.js',
  './rk-auth.js',
  './rk-stock.js',
  './rk-brain.js',
  './rk-store.js',
  './rk-shared.jsx',
  './rk-home.jsx',
  './rk-home-stock.jsx',
  './rk-screens.jsx',
  './rk-map.jsx',
  './rk-chat.jsx',
  './rk-roles.jsx',
  './rk-role-page.jsx',
  './rk-customer-app.jsx',
  './ios-frame.jsx',
  './android-frame.jsx',
];

// Install: pre-cache all static assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

// Activate: evict old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first for same-origin files, network-only for external
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Pass through non-GET and external requests (CDN scripts, maps, Open Food Facts)
  if (e.request.method !== 'GET') return;
  if (url.origin !== location.origin) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      const networkFetch = fetch(e.request).then(res => {
        if (res.ok && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
      // Serve cache immediately, update in background
      return cached || networkFetch;
    })
  );
});
