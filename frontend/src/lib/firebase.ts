import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import axios from "axios";

// NOTE: These values must be provided by the user from Firebase Console
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "webapp-monorepo-management-ism.firebaseapp.com",
    projectId: "webapp-monorepo-management-ism",
    storageBucket: "webapp-monorepo-management-ism.firebasestorage.app",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const requestForToken = async () => {
    try {
        const messaging = getMessaging(app);
        const currentToken = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY // From .env.local
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
            console.log('No registration token available. Request permission to generate one.');
        }
    } catch (err) {
        console.log('An error occurred while retrieving token. ', err);
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
