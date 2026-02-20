import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Path to your service account JSON file
// We try to load from ENV variable first, then fallback to a relative path
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || join(__dirname, '../../firebase-service-account.json');

try {
    const serviceAccountContent = readFileSync(serviceAccountPath, 'utf8');
    const serviceAccount = JSON.parse(serviceAccountContent);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    console.log('[Firebase] Admin SDK initialized successfully');
} catch (error) {
    console.warn('[Firebase] Warning: Failed to initialize Admin SDK. Push notifications will be disabled.', error.message);
    console.info('[Firebase] Expected service account JSON at:', serviceAccountPath);
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
