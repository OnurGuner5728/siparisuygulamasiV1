// Service Worker - Devre dışı bırakıldı (Navigation sorunlarını önlemek için)

// Immediately unregister this service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing but will be disabled...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating but will be disabled...');
  
  event.waitUntil(
    // Clear all caches
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
      .then(() => {
        // Unregister this service worker
        return self.registration.unregister();
      })
      .then(() => {
        console.log('Service Worker unregistered to fix navigation issues');
        return self.clients.claim();
      })
  );
});

// Don't handle any fetch events - let browser handle everything naturally
self.addEventListener('fetch', (event) => {
  // Do nothing - let the browser handle all requests naturally
  return;
}); 