'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';

export const useBuyerSocket = (onOrderUpdate?: (order: any) => void, options: { notify?: boolean } = { notify: true }) => {
    const { user, isLoggedIn } = useAuthStore();
    const socketRef = useRef<Socket | null>(null);

    const onOrderUpdateRef = useRef(onOrderUpdate);

    useEffect(() => {
        onOrderUpdateRef.current = onOrderUpdate;
    }, [onOrderUpdate]);

    useEffect(() => {
        if (!isLoggedIn || !user) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            return;
        }

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const socketUrl = apiBaseUrl.replace('/api', '');

        // Initialize socket connection with session cookies
        const socket = io(socketUrl, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('[BuyerSocket] Connected to real-time updates');
        });

        socket.on('order_updated', (data) => {
            console.log('[BuyerSocket] Order updated:', data);

            if (options.notify) {
                // Build a human-readable status label
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
                    `Pesanan #${data.id?.slice(-6).toUpperCase()} dari ${data.shopName || 'Toko'} ${statusText}`,
                    { duration: 5000, icon: '🛍️' }
                );
            }

            // Callback to refresh data in the UI
            if (onOrderUpdateRef.current) {
                onOrderUpdateRef.current(data);
            }
        });

        socket.on('connect_error', (err) => {
            console.warn('[BuyerSocket] Connection error:', err.message);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [isLoggedIn, user?.id]);

    return {
        isConnected: socketRef.current?.connected || false,
        socket: socketRef.current
    };
};
