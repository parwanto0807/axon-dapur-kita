// Import and configure the Firebase SDK
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging/sw";

// NOTE: Same config as in src/lib/firebase.ts
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "webapp-monorepo-management-ism.firebaseapp.com",
  projectId: "webapp-monorepo-management-ism",
  storageBucket: "webapp-monorepo-management-ism.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/icon-192x192.png', // Ensure this path is correct
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
