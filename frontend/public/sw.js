// frontend/public/sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/cart',
        '/styles/globals.css',
      ]);
    })
  );
});