'use client';

import { useAuthStore } from '@/store/authStore';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const PROTECTED_ROUTES = [
    '/dashboard',
    '/checkout',
    '/seller-registration',
    '/profile'
];

export default function RouteGuard({ children }: { children: React.ReactNode }) {
    const { isLoggedIn, isLoading } = useAuthStore();
    const pathname = usePathname();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkRoute = () => {
            // Wait for auth sync to finish
            if (isLoading) return;

            const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname?.startsWith(route));

            if (isProtectedRoute && !isLoggedIn) {
                console.log(`[RouteGuard] Blocking access to ${pathname}, redirecting to /login`);
                router.replace('/login');
            } else {
                setIsChecking(false);
            }
        };

        checkRoute();
    }, [isLoggedIn, isLoading, pathname, router]);

    // Show loading state ONLY on protected routes while checking
    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname?.startsWith(route));

    if (isLoading || (isProtectedRoute && !isLoggedIn)) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-4">
                <Loader2 className="h-10 w-10 text-[#1B5E20] animate-spin" />
                <p className="text-sm font-medium text-gray-500 animate-pulse">Memeriksa Keamanan...</p>
            </div>
        );
    }

    return <>{children}</>;
}
