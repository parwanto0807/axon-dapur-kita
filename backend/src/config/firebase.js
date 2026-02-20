import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Path to your service account JSON file
// The user provided the path: d:\Project WebApp\online-shop\frontend\webapp-monorepo-management-ism-firebase-adminsdk-fbsvc-04a8e1c6ef.json
// It's better to keep it in the backend or use an absolute path for now if it's outside.
// I'll assume the path relative to project root or use the absolute path provided.

const serviceAccountPath = 'd:/Project WebApp/online-shop/frontend/webapp-monorepo-management-ism-firebase-adminsdk-fbsvc-04a8e1c6ef.json';

try {
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    console.log('[Firebase] Admin SDK initialized successfully');
} catch (error) {
    console.error('[Firebase] Failed to initialize Admin SDK:', error.message);
}

export const sendPushNotification = async (fcmToken, title, body, data = {}) => {
    if (!fcmToken) return;

    const message = {
        notification: {
            title,
            body
        },
        data: {
            ...data,
            click_action: data.link || '/'
        },
        token: fcmToken
    };

    try {
        const response = await admin.messaging().send(message);
        console.log('[Firebase] Push notification sent successfully:', response);
        return response;
    } catch (error) {
        console.error('[Firebase] Error sending push notification:', error);
        // If token is invalid, we might want to remove it from DB later
    }
};

export default admin;
