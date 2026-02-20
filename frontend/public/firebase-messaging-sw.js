// Import and configure the Firebase SDK
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging/sw";

// NOTE: Same config as in src/lib/firebase.ts
const firebaseConfig = {
apiKey: "AIzaSyDOgJcM8nxoKJRKqCDm1ps1aZ9NPHoSYKM",
  authDomain: "webapp-monorepo-management-ism.firebaseapp.com",
  projectId: "webapp-monorepo-management-ism",
  storageBucket: "webapp-monorepo-management-ism.firebasestorage.app",
  messagingSenderId: "210071266940",
  appId: "1:210071266940:web:a524d1288018f365554bf9",
  measurementId: "G-JBZL8Z0WT8"
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
