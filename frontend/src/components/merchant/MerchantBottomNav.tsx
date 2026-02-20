'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Package, Settings, PlusCircle, Store } from 'lucide-react';
import { clsx } from 'clsx';

const menuItems = [
    { label: 'Akun', icon: Settings, href: '/dashboard/merchant/profile' },
    { label: 'Pesanan', icon: ShoppingBag, href: '/dashboard/merchant/orders' },
    { label: 'Produk', icon: Package, href: '/dashboard/merchant/products' },
    { label: 'Home', icon: Home, href: '/dashboard/merchant' },
];

export default function MerchantBottomNav() {
    const pathname = usePathname();

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
            <div className="bg-white/90 backdrop-blur-xl border-t border-gray-200/50 shadow-[0_-8px_30px_rgb(0,0,0,0.08)] rounded-t-lg flex items-center justify-between h-14 px-2">
                {/* Pasar & Pesanan */}
                <div className="flex flex-1 items-center justify-around h-full">
                    {menuItems.slice(0, 2).map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    "flex flex-col items-center justify-center transition-all duration-300 relative",
                                    isActive ? "text-[#1B5E20]" : "text-gray-400"
                                )}
                            >
                                {isActive && <span className="absolute -top-1 w-1 h-1 bg-[#1B5E20] rounded-full" />}
                                <Icon className={clsx("h-5 w-5 mb-1", isActive && "scale-110")} />
                                <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* FAB: Tambah */}
                <div className="relative -top-3 px-2">
                    <Link
                        href="/dashboard/merchant/products/add"
                        className="flex flex-col items-center justify-center group"
                    >
                        <div className="bg-[#1B5E20] p-3 rounded-2xl shadow-lg shadow-green-900/30 active:scale-90 transition-all border border-green-700/10 group-hover:bg-green-700">
                            <PlusCircle className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-[8px] font-black text-[#1B5E20] uppercase tracking-widest mt-1.5 opacity-100">Tambah</span>
                    </Link>
                </div>

                {/* Produk & Beranda */}
                <div className="flex flex-1 items-center justify-around h-full">
                    {menuItems.slice(2, 4).map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    "flex flex-col items-center justify-center transition-all duration-300 relative",
                                    isActive ? "text-[#1B5E20]" : "text-gray-400"
                                )}
                            >
                                {isActive && <span className="absolute -top-1 w-1 h-1 bg-[#1B5E20] rounded-full" />}
                                <Icon className={clsx("h-5 w-5 mb-1", isActive && "scale-110")} />
                                <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
