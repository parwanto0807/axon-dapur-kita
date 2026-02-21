'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import AuthSync from '../auth/AuthSync';
import RouteGuard from '../auth/RouteGuard';
import FirebaseProvider from '../pwa/FirebaseProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <AuthSync>
                <RouteGuard>
                    <FirebaseProvider>
                        {children}
                    </FirebaseProvider>
                </RouteGuard>
            </AuthSync>
        </QueryClientProvider>
    );
}
