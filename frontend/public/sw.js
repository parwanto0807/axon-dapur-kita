// Basic Service Worker to enable PWA features
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
});

self.addEventListener('fetch', (event) => {
  // Basic fetch handler required for PWA install criteria
  event.respondWith(
    fetch(event.request).catch(() => {
      // Offline fallback can be added here
    })
  );
});
