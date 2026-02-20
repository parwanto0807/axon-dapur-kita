'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface RealtimeOrder {
    id: string;
    totalAmount: number;
    paymentStatus: string;
    createdAt: string;
    itemCount: number;
    user: { name: string };
    _timestamp: string;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'polling' | 'disconnected';

interface UseMerchantSocketOptions {
    shopId: string | null;
    onNewOrder?: (order: RealtimeOrder) => void;
}

interface UseMerchantSocketReturn {
    connectionStatus: ConnectionStatus;
    lastSync: Date | null;
    reconnectCount: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';
const SOCKET_URL = API_URL.replace('/api', '');

// Exponential backoff intervals: 30s, 60s, 120s
const POLLING_INTERVALS = [30_000, 60_000, 120_000];

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useMerchantSocket({ shopId, onNewOrder }: UseMerchantSocketOptions): UseMerchantSocketReturn {
    const { user } = useAuthStore();
    const socketRef = useRef<Socket | null>(null);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const pollingStepRef = useRef(0);
    const reconnectCountRef = useRef(0);
    const connectionStatusRef = useRef<ConnectionStatus>('connecting'); // To track status in callbacks if needed
    const onNewOrderRef = useRef(onNewOrder);

    // Update ref when callback changes
    useEffect(() => {
        onNewOrderRef.current = onNewOrder;
    }, [onNewOrder]);


    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
    const [lastSync, setLastSync] = useState<Date | null>(null);
    const [reconnectCount, setReconnectCount] = useState(0);

    // ── Polling Fallback ──────────────────────────────────────────────────────
    const stopPolling = useCallback(() => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
            pollingStepRef.current = 0;
        }
    }, []);

    const startPolling = useCallback(() => {
        if (pollingRef.current || !shopId) return;

        setConnectionStatus('polling');

        const poll = async () => {
            try {
                const res = await axios.get(`${API_URL}/orders/shop`, {
                    withCredentials: true,
                    params: { limit: 5 }
                });
                setLastSync(new Date());
                // The parent component handles state update via onNewOrder
                // Here we just update lastSync to show polling is working
            } catch (err) {
                // Silently fail - polling is a fallback
            }
        };

        // Poll immediately, then on interval
        poll();

        const interval = POLLING_INTERVALS[Math.min(pollingStepRef.current, POLLING_INTERVALS.length - 1)];
        pollingRef.current = setInterval(() => {
            poll();
            // Increase backoff step
            if (pollingStepRef.current < POLLING_INTERVALS.length - 1) {
                pollingStepRef.current++;
                stopPolling();
                startPolling(); // Restart with new interval
            }
        }, interval);
    }, [shopId, stopPolling]);

    // ── Socket Connection ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!shopId || !user) return;

        setConnectionStatus('connecting');

        // Connect using session cookie (withCredentials) - no JWT needed
        const socket = io(SOCKET_URL, {
            withCredentials: true,  // Send session cookie automatically
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 10000,
            timeout: 20000,
            path: '/socket.io/',
        });

        socketRef.current = socket;

        // ── Event Handlers ────────────────────────────────────────────────────
        socket.on('connect', () => {
            setConnectionStatus('connected');
            setLastSync(new Date());
            stopPolling(); // Stop polling if it was running
            reconnectCountRef.current = 0;
            setReconnectCount(0);

            // Join the shop room
            if (shopId) {
                socket.emit('join_shop', { shopId });
            }
        });

        socket.on('joined_shop', (data) => {
            console.log('[Socket] Joined shop room:', data.shopName);
        });

        socket.on('new_order', (order: RealtimeOrder) => {
            setLastSync(new Date());
            // Use ref to call latest callback without re-running effect
            if (onNewOrderRef.current) {
                onNewOrderRef.current(order);
            }
        });

        socket.on('disconnect', (reason) => {
            console.log('[Socket] Disconnected:', reason);
            if (reason === 'io server disconnect') {
                // strict disconnection by server
                socket.connect();
            }
            setConnectionStatus('reconnecting');
        });

        // Handle connection errors
        socket.on('connect_error', (err) => {
            console.warn('[Socket] Connection error:', err.message);
            setConnectionStatus('polling');
            // Start polling if socket fails
            const timer = setTimeout(() => {
                startPolling();
            }, 5000);
            return () => clearTimeout(timer);
        });

        // Listen for generic order updates (payment confirmed, completed, etc)
        // We can reuse onNewOrder or add a new callback 
        // For simplicity, let's trigger onNewOrder style callback to refresh data
        socket.on('payment_confirmed', (order: RealtimeOrder) => {
            console.log('[Socket] Payment Confirmed:', order.id);
            setLastSync(new Date());
            if (onNewOrderRef.current) onNewOrderRef.current(order);
        });

        socket.on('order_completed', (order: RealtimeOrder) => {
            console.log('[Socket] Order Completed:', order.id);
            setLastSync(new Date());
            if (onNewOrderRef.current) onNewOrderRef.current(order);
        });

        // Listen for updates on ORDERS I MADE (as a buyer) - B2B Scenario
        socket.on('order_updated', (data: any) => {
            console.log('[Socket] My Purchase Updated:', data.id);

            // Show toast for B2B updates
            const statusLabels: Record<string, string> = {
                paid: 'dikonfirmasi pembayarannya ✅',
                pending: 'menunggu pembayaran ⏳',
                failed: 'gagal ❌',
                processing: 'sedang diproses 🔄',
                shipped: 'dikirim 🚚',
                delivered: 'telah sampai 📦',
                cancelled: 'dibatalkan ❌',
            };
            const statusKey = (data.paymentStatus || data.deliveryStatus || '').toLowerCase();
            const statusText = statusLabels[statusKey] || `diupdate ke ${statusKey}`;

            toast.success(
                `Pesanan Pembelian #${data.id?.slice(-6).toUpperCase()} ${statusText}`,
                { duration: 5000, icon: '🛍️' }
            );

            setLastSync(new Date());
            if (onNewOrderRef.current) onNewOrderRef.current(data);
        });

        return () => {
            socket.off('connect');
            socket.off('joined_shop');
            socket.off('new_order');
            socket.off('payment_confirmed');
            socket.off('order_completed');
            socket.off('disconnect');
            socket.off('connect_error');

            socket.emit('leave_shop', { shopId });
            socket.disconnect();
            socketRef.current = null;
            stopPolling();
        };
    }, [shopId, user?.id, startPolling, stopPolling]); // Removed onNewOrder, used user.id instead of user object

    return { connectionStatus, lastSync, reconnectCount };
}
