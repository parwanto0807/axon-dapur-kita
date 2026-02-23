import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import passport from 'passport';
import { createAdapter } from '@socket.io/redis-adapter';
import redisClient from './config/redis.js';


const prisma = new PrismaClient();

let io = null;

// Track failed join attempts for audit logging
const failedAttempts = new Map();

/**
 * Initialize Socket.io server using Passport session auth
 * @param {import('http').Server} httpServer
 * @param {Function} sessionMiddleware - the same express-session instance used in app.js
 */
export const initSocket = (httpServer, sessionMiddleware) => {
    io = new Server(httpServer, {
        cors: {
            origin: [
                'http://localhost:3000',
                'http://127.0.0.1:3000',
                'https://axon-ecosystem.id',
                'https://www.axon-ecosystem.id',
                process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'
            ],
            credentials: true
        },
        pingTimeout: 60000,
        pingInterval: 25000,
    });

    // ─── Redis Adapter Configuration ─────────────────────────────────────────
    if (redisClient.isReady) {
        const pubClient = redisClient.duplicate();
        const subClient = redisClient.duplicate();
        
        // Connect duplicates for the adapter
        Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
            io.adapter(createAdapter(pubClient, subClient));
            console.log('[Socket] Redis Adapter Integrated');
        }).catch(err => {
            console.error('[Socket] Failed to integrate Redis Adapter:', err);
        });
    } else {
        console.warn('[Socket] Redis not available, using default in-memory adapter');
    }


    // ─── Session-based Auth Middleware ────────────────────────────────────────
    // Wrap Express middleware so it works with Socket.io
    const wrap = (middleware) => (socket, next) =>
        middleware(socket.request, socket.request.res || {}, next);

    io.use(wrap(sessionMiddleware));
    io.use(wrap(passport.initialize()));
    io.use(wrap(passport.session()));

    // Validate that user is authenticated via session
    io.use((socket, next) => {
        if (socket.request.user) {
            socket.user = socket.request.user;
            next();
        } else {
            console.warn('[Socket] Unauthenticated connection attempt');
            next(new Error('AUTH_REQUIRED: Not authenticated'));
        }
    });

    // ─── Connection Handler ──────────────────────────────────────────────────
    io.on('connection', (socket) => {
        console.log(`[Socket] Connected: ${socket.user.name || socket.user.email} (${socket.user.id})`);

        // ── Join Personal Room ────────────────────────────────────────────────
        const userRoom = `user_${socket.user.id}`;
        socket.join(userRoom);
        console.log(`[Socket] ${socket.user.name || socket.user.email} joined personal room: ${userRoom}`);

        // ── Join Shop Room (with authorization) ──────────────────────────────
        socket.on('join_shop', async ({ shopId }) => {
            console.log(`[Socket] User ${socket.user?.id} requesting to join shop room: ${shopId}`);
            try {
                if (!shopId) {
                    socket.emit('error', { code: 'INVALID_SHOP', message: 'shopId is required' });
                    return;
                }

                // Validate that this user owns the shop
                const shop = await prisma.shop.findFirst({
                    where: {
                        id: shopId,
                        owner: { id: socket.user.id }
                    },
                    select: { id: true, name: true }
                });

                if (shop) {
                    const roomName = `shop_${shopId}`;
                    socket.join(roomName);
                    console.log(`[Socket] Success: User ${socket.user.id} joined room: ${roomName}`);

                    socket.emit('joined_shop', {
                        shopId,
                        shopName: shop.name,
                        message: `Connected to ${shop.name} live updates`
                    });
                } else {
                    console.warn(`[Socket] Access Denied: User ${socket.user.id} tried joining shop ${shopId} which they don't own.`);
                    socket.emit('error', { code: 'UNAUTHORIZED', message: 'You do not own this shop' });
                }
            } catch (err) {
                console.error('[Socket] join_shop error:', err);
                socket.emit('error', { code: 'SERVER_ERROR', message: 'Failed to join shop room' });
            }
        });

        socket.on('leave_shop', ({ shopId }) => {
            if (shopId) {
                const roomName = `shop_${shopId}`;
                socket.leave(roomName);
                console.log(`[Socket] User ${socket.user?.id} left room: ${roomName}`);
            }
        });

        // ── Disconnect ───────────────────────────────────────────────────────
        socket.on('disconnect', (reason) => {
            console.log(`[Socket] Disconnected: ${socket.user?.name || socket.user?.email || 'Unknown'} - ${reason}`);
        });
    });

    console.log('[Socket] Socket.io server initialized (session-based auth)');
    return io;
};

/**
 * Get the initialized Socket.io instance
 */
export const getIO = () => {
    if (!io) throw new Error('Socket.io not initialized');
    return io;
};

/**
 * Emit a new order event to the shop's room
 */
export const emitNewOrder = (shopId, orderData) => {
    try {
        if (!io) return;
        const roomName = `shop_${shopId}`;
        
        // Debug: Check if anyone is in the room
        const room = io.sockets.adapter.rooms.get(roomName);
        const recipientCount = room ? room.size : 0;
        console.log(`[Socket] Emitting 'new_order' to ${roomName}. Recipient Count: ${recipientCount}`);

        io.to(roomName).emit('new_order', {
            ...orderData,
            _timestamp: new Date().toISOString()
        });
        console.log(`[Socket] Emitted new_order to room: ${roomName}`);
    } catch (err) {
        console.error('[Socket] emitNewOrder error:', err);
    }
};

/**
 * Emit a generic event to the shop's room
 */
export const emitShopEvent = (shopId, eventName, data) => {
    try {
        if (!io) return;
        const roomName = `shop_${shopId}`;
        
         // Debug: Check if anyone is in the room
        const room = io.sockets.adapter.rooms.get(roomName);
        const recipientCount = room ? room.size : 0;
        console.log(`[Socket] Emitting '${eventName}' to ${roomName}. Recipient Count: ${recipientCount}`);

        io.to(roomName).emit(eventName, {
            ...data,
            _timestamp: new Date().toISOString()
        });
        console.log(`[Socket] Emitted ${eventName} to room: ${roomName}`);
    } catch (err) {
        console.error(`[Socket] emitShopEvent error (${eventName}):`, err);
    }
};

/**
 * Emit an order status update to the buyer's room
 */
export const emitOrderStatusUpdate = (userId, orderData) => {
    try {
        if (!io) return;
        const roomName = `user_${userId}`;
        
         // Debug: Check if anyone is in the room
        const room = io.sockets.adapter.rooms.get(roomName);
        const recipientCount = room ? room.size : 0;
        console.log(`[Socket] Emitting 'order_updated' to ${roomName}. Recipient Count: ${recipientCount}`);

        io.to(roomName).emit('order_updated', { // Keep this as order_updated for buyers
            ...orderData,
            _timestamp: new Date().toISOString()
        });
        console.log(`[Socket] Emitted order_updated to room: ${roomName}`);
    } catch (err) {
        console.error('[Socket] emitOrderStatusUpdate error:', err);
    }
};
