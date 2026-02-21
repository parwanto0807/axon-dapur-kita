'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MapPin, Receipt, User, Store, ShieldCheck, Heart } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '@/store/authStore';

export default function BuyerBottomNav() {
    const pathname = usePathname();
    const { isLoggedIn, user } = useAuthStore();

    // Hide on desktop
    // Also might want to hide on specific routes if needed, but usually it stays.
    // If in merchant dashboard, MerchantBottomNav will show (if we manage z-index or conditional rendering)

    // Check if we are in merchant or admin dashboard to avoid double bottom nav
    const isMerchantRoute = pathname?.startsWith('/dashboard/merchant');
    const isAdminRoute = pathname?.startsWith('/dashboard/admin');
    const isProductRoute = pathname?.startsWith('/product');
    const isCartRoute = pathname === '/cart';
    const isCheckoutRoute = pathname === '/checkout';

    if (isMerchantRoute || isAdminRoute || isProductRoute || isCartRoute || isCheckoutRoute) return null;

    const navItems = [
        { label: 'Akun', icon: User, href: '/dashboard/profile' },
        { label: 'Terdekat', icon: MapPin, href: '/nearby' },
        { label: 'Wishlist', icon: Heart, href: '/dashboard/wishlist' },
        { label: 'Transaksi', icon: Receipt, href: '/dashboard/orders' },
    ];

    // Add Seller/Admin links in the middle if roles match
    if (user?.role === 'SELLER') {
        navItems.push({ label: 'Seller', icon: Store, href: '/dashboard/merchant' });
    } else if (user?.role === 'ADMIN') {
        navItems.push({ label: 'Admin', icon: ShieldCheck, href: '/dashboard/admin' });
    }

    // Always put Home at the far right
    navItems.push({ label: 'Beranda', icon: Home, href: isLoggedIn ? '/dashboard' : '/' });

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
            <div className="bg-white/90 backdrop-blur-xl border-t border-gray-200/50 shadow-[0_-8px_30px_rgb(0,0,0,0.08)] rounded-t-lg flex items-center justify-around h-16 px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={clsx(
                                "flex flex-col items-center justify-center flex-1 transition-all duration-300 relative py-1",
                                isActive ? "text-[#1B5E20]" : "text-black hover:text-gray-600"
                            )}
                        >
                            {isActive && (
                                <span className="absolute -top-1 w-1 h-1 bg-[#1B5E20] rounded-full animate-pulse" />
                            )}
                            <Icon className={clsx(
                                "h-5 w-5 mb-1 transition-transform duration-300",
                                isActive && "scale-110"
                            )} />
                            <span className={clsx(
                                "text-[10px] font-medium tracking-tight",
                                isActive ? "opacity-100" : "opacity-80"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
