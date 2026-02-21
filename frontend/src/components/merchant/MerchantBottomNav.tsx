'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Package, Settings, PlusCircle, Store } from 'lucide-react';
import { clsx } from 'clsx';

const menuItems = [
    { label: 'Akun', icon: Settings, href: '/dashboard/merchant/profile' },
    { label: 'Produk', icon: Package, href: '/dashboard/merchant/products' },
    { label: 'Pesanan', icon: ShoppingBag, href: '/dashboard/merchant/orders' },
    { label: 'Beranda', icon: Home, href: '/dashboard/merchant' },
    { label: 'Market', icon: Store, href: '/dashboard' },
];

export default function MerchantBottomNav() {
    const pathname = usePathname();

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
            <div className="bg-white/90 backdrop-blur-xl border-t border-gray-200/50 shadow-[0_-8px_30px_rgb(0,0,0,0.08)] rounded-t-lg flex items-center justify-around h-16 px-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex flex-col items-center justify-center transition-all duration-300 relative px-1",
                                isActive ? "text-[#1B5E20]" : "text-black"
                            )}
                        >
                            {isActive && <span className="absolute -top-1 w-1 h-1 bg-[#1B5E20] rounded-full" />}
                            <Icon className={clsx("h-5 w-5 mb-1", isActive && "scale-110")} />
                            <span className="text-[10px] font-medium tracking-widest">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
