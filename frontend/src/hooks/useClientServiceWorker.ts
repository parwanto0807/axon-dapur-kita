'use client';

import { useEffect } from 'react';

export function useClientServiceWorker() {
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            console.log('PWA: Service Worker found in navigator');
            window.addEventListener('load', () => {
                navigator.serviceWorker
                    .register('/sw.js')
                    .then((registration) => {
                        console.log('PWA: Service Worker registered successfully with scope:', registration.scope);
                    })
                    .catch((registrationError) => {
                        console.error('PWA: Service Worker registration failed:', registrationError);
                    });
            });
        } else {
            console.warn('PWA: Service Worker NOT supported or not in secure context (HTTPS/localhost)');
        }
    }, []);
}
