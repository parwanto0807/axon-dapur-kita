'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutDashboard, Store, Settings } from 'lucide-react';
import { clsx } from 'clsx';

export default function AdminBottomNav() {
    const pathname = usePathname();

    const navItems = [
        { label: 'Akun', icon: Settings, href: '/dashboard/profile' },
        { label: 'Stats', icon: LayoutDashboard, href: '/dashboard/admin' },
        { label: 'Toko', icon: Store, href: '/dashboard/admin/shops' },
        { label: 'Home', icon: Home, href: '/' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden font-[family-name:var(--font-poppins)]">
            <div className="bg-white/90 backdrop-blur-xl border-t border-gray-200/50 shadow-[0_-8px_30px_rgb(0,0,0,0.08)] rounded-t-lg flex items-center justify-around h-14 px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={clsx(
                                "flex flex-col items-center justify-center flex-1 transition-all duration-300 relative py-1",
                                isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            {isActive && (
                                <span className="absolute -top-1 w-1 h-1 bg-blue-600 rounded-full animate-pulse" />
                            )}
                            <Icon className={clsx(
                                "h-5 w-5 mb-1 transition-transform duration-300",
                                isActive && "scale-110"
                            )} />
                            <span className={clsx(
                                "text-[9px] font-black uppercase tracking-tight",
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
