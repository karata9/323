self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('real-estate-store').then((cache) => cache.addAll([
      './',
      './index.html',
      './style.css',
      './script.js',
      './firebase.js'
    ])),
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request)),
  );
});
