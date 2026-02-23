import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

let redisErrorLogged = false;
redisClient.on('error', (err) => {
    if (!redisErrorLogged && err.message) {
        console.warn('[Redis] Connection Error:', err.message);
        console.warn('[Redis] Caching and Socket.io scaling will be disabled.');
        redisErrorLogged = true;
    }
});
redisClient.on('connect', () => {
    console.log('[Redis] Client Connected');
    redisErrorLogged = false;
});

// Try to connect but don't block the app if it fails
redisClient.connect().catch(err => {
    console.warn('[Redis] Failed to connect. Caching and Socket.io scaling will be disabled.');
});


export default redisClient;
