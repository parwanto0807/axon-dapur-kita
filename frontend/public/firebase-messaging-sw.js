// ─── Unified Service Worker for Axon Dapur Kita (PWA + FCM) ───────────────────

// Give the service worker access to Firebase Messaging.
// Note: compat version is used for easier integration in SW environment.
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// 1. Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDOgJcM8nxoKJRKqCDm1ps1aZ9NPHoSYKM",
  authDomain: "webapp-monorepo-management-ism.firebaseapp.com",
  projectId: "webapp-monorepo-management-ism",
  storageBucket: "webapp-monorepo-management-ism.firebasestorage.app",
  messagingSenderId: "210071266940",
  appId: "1:210071266940:web:a524d1288018f365554bf9",
  measurementId: "G-JBZL8Z0WT8"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// 2. SW Lifecycle Handlers
self.addEventListener('install', (event) => {
  console.log('[SW] Unified Service Worker: Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Unified Service Worker: Activated');
  event.waitUntil(clients.claim());
});

// 3. PWA Fetch Handler (Required for "Installable" criteria)
self.addEventListener('fetch', (event) => {
  // Simple pass-through for now
  event.respondWith(fetch(event.request).catch(() => {}));
});

// 4. Handle Background Messages
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);
  console.log('[SW] Permission status:', Notification.permission);
  
  if (Notification.permission !== 'granted') {
    console.warn('[SW] Suppression: Permission not granted');
    return;
  }

  const title = payload.notification?.title || payload.data?.title || 'Notifikasi Pesanan';
  const body = payload.notification?.body || payload.data?.body || 'Buka aplikasi untuk detail selengkapnya';
  
  const notificationOptions = {
    body: body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    tag: payload.data?.tag || 'axon-notif',
    data: {
      url: payload.data?.click_action || payload.data?.link || '/'
    },
    vibrate: [200, 100, 200],
    requireInteraction: true
  };

  const showPromise = self.registration.showNotification(title, notificationOptions)
    .then(() => console.log('[SW] showNotification succeeded'))
    .catch(err => console.error('[SW] showNotification failed:', err));

  return showPromise;
});

// 5. Handle Notification Click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click detected');
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus existing tab if open
      for (const client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
