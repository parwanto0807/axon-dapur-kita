import http from 'http';
import app, { sessionMiddleware } from './app.js';
import dotenv from 'dotenv';
import { initSocket } from './socket.js';
import './cron.js'; // Start cron jobs

dotenv.config();

const PORT = process.env.PORT || 5000;

// Create HTTP server and attach Socket.io
const httpServer = http.createServer(app);
initSocket(httpServer, sessionMiddleware);

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Socket.io ready on port ${PORT}`);
});

