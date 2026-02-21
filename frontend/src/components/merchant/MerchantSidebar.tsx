'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Package, Settings, Store, Menu, X, LogOut, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import Image from 'next/image';
import LogoutModal from '../auth/LogoutModal';

interface MerchantSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MerchantSidebar({ isOpen, onClose }: MerchantSidebarProps) {
    const pathname = usePathname();
    const { user, logout } = useAuthStore();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);


    const navigation = [
        { name: 'Dashboard', href: '/dashboard/merchant', icon: LayoutDashboard },
        { name: 'Pesanan', href: '/dashboard/merchant/orders', icon: ShoppingBag },
        { name: 'Produk', href: '/dashboard/merchant/products', icon: Package },
        { name: 'Pengaturan Toko', href: '/dashboard/merchant/profile', icon: Settings },
    ];

    const isActive = (path: string) => {
        if (path === '/dashboard/merchant' && pathname === '/dashboard/merchant') return true;
        if (path !== '/dashboard/merchant' && pathname?.startsWith(path)) return true;
        return false;
    };

    return (
        <>
            {/* Sidebar Container */}
            <aside className={`
                fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
                lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="h-16 flex items-center px-6 border-b border-gray-100">
                        <Link href="/dashboard" className="flex items-center space-x-2 group">
                            <div className="bg-green-50 p-1.5 rounded-lg group-hover:bg-[#1B5E20] transition-colors">
                                <Store className="h-5 w-5 text-[#1B5E20] group-hover:text-white transition-colors" />
                            </div>
                            <span className="font-bold text-gray-900 text-lg">Axon<span className="text-[#1B5E20]">Mitra</span></span>
                        </Link>
                    </div>

                    {/* Shop Profile Summary */}
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden border border-gray-300 shrink-0">
                                {user?.image ? (
                                    <img
                                        src={user.image.startsWith('http') ? user.image : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5003'}${user.image.startsWith('/') ? '' : '/'}${user.image}`}
                                        alt={user.name || 'Merchant'}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-gray-300">
                                        <Store className="h-5 w-5 text-gray-500" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                                <p className="text-xs text-gray-500 truncate">ID: {user?.shopId ? `#${user.shopId}` : '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={onClose}
                                    className={`
                                        flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                                        ${active
                                            ? 'bg-[#1B5E20] text-white shadow-md shadow-green-900/20'
                                            : 'text-gray-600 hover:bg-green-50 hover:text-[#1B5E20]'
                                        }
                                    `}
                                >
                                    <div className="flex items-center space-x-3">
                                        <item.icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-400 group-hover:text-[#1B5E20]'}`} />
                                        <span>{item.name}</span>
                                    </div>
                                    {active && <ChevronRight className="h-4 w-4 text-white/50" />}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-gray-100">
                        <Link
                            href="/dashboard"
                            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            <Store className="h-5 w-5 text-gray-400" />
                            <span>Lihat Marketplace</span>
                        </Link>
                        <button
                            onClick={() => setIsLogoutModalOpen(true)}
                            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="h-5 w-5" />
                            <span>Keluar</span>
                        </button>
                    </div>
                </div>
            </aside >
            <LogoutModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
            />
        </>
    );
}
