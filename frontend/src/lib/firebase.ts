import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import axios from "axios";

// NOTE: These values must be provided by the user from Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyDOgJcM8nxoKJRKqCDm1ps1aZ9NPHoSYKM",
    authDomain: "webapp-monorepo-management-ism.firebaseapp.com",
    projectId: "webapp-monorepo-management-ism",
    storageBucket: "webapp-monorepo-management-ism.firebasestorage.app",
    messagingSenderId: "210071266940",
    appId: "1:210071266940:web:a524d1288018f365554bf9",
    measurementId: "G-JBZL8Z0WT8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const requestForToken = async () => {
    try {
        if (typeof window === 'undefined') return;

        // 1. Check for notification permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.log('[FCM] Notification permission not granted');
            return null;
        }

        const messaging = getMessaging(app);
        const currentToken = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        });

        if (currentToken) {
            console.log('FCM Token generated:', currentToken);
            // Save token to backend
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/notifications/fcm-token`,
                { fcmToken: currentToken },
                { withCredentials: true }
            );
            return currentToken;
        } else {
            console.log('No registration token available.');
        }
    } catch (err) {
        console.log('An error occurred while retrieving token: ', err);
    }
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        const messaging = getMessaging(app);
        onMessage(messaging, (payload) => {
            console.log("Payload received:", payload);
            resolve(payload);
        });
    });

export default app;
