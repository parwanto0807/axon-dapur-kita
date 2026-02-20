'use client';

import { useEffect } from 'react';
import { requestForToken, onMessageListener } from '@/lib/firebase';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

export const useFCM = () => {
    const { user } = useAuthStore();

    useEffect(() => {
        if (!user) return;

        // Request token on mount/login
        const initFCM = async () => {
            const token = await requestForToken();
            if (token) {
                console.log('[FCM] Token registered successfully');
            }
        };

        initFCM();

        // Listen for foreground messages
        const unsubscribe = onMessageListener().then((payload: any) => {
            console.log('[FCM] Foreground message received:', payload);

            // 1. Show toast for foreground notifications
            toast.success(
                <div className="flex flex-col">
                    <span className="font-bold">{payload.notification.title}</span>
                    <span className="text-sm">{payload.notification.body}</span>
                </div>,
                {
                    duration: 5000,
                    icon: '🔔',
                }
            );

            // 2. Trigger a refresh of the notification state
            window.dispatchEvent(new CustomEvent('refresh-notifications'));

        }).catch(err => console.error('[FCM] Listener error:', err));

        return () => {
            // In Firebase v9+, onMessage returns an unsubscribe function if used directly, 
            // but here we wrapped it in a promise for simplicity. 
            // Refinement would be to handle unsubscription if needed.
        };
    }, [user]);
};
