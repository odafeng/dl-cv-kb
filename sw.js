// Service Worker — offline caching for the static knowledge base
// Cache version bumped any time precache list changes
const CACHE = 'phd-kb-v6';

const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './src/app.js',
  './src/data.js',
  './src/store.js',
  './src/checkboxes.js',
  './src/views.js',
  './src/nav.js',
  './src/graph.js',
  './src/pdf-modal.js',
  // CDN assets that are stable enough to precache
  'https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      // Failures on individual entries shouldn't abort the whole install
      .then(c => Promise.all(PRECACHE.map(url => c.add(url).catch(err => console.warn('precache miss:', url, err)))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Cache PDFs from same origin lazily on first read
  if (url.endsWith('.pdf')) {
    e.respondWith(
      caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match(e.request)))
    );
    return;
  }

  // Cache-first for everything else
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      if (res.ok) {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => new Response('Offline', { status: 503 })))
  );
});
