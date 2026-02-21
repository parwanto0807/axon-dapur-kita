'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Store, Users, Settings, LogOut, ChevronRight, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import LogoutModal from '../auth/LogoutModal';

interface AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    const pathname = usePathname();
    const { user, logout } = useAuthStore();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const navigation = [
        { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
        { name: 'Kelola Toko', href: '/dashboard/admin/shops', icon: Store },
        // { name: 'Pengguna', href: '/dashboard/admin/users', icon: Users }, // Future
        // { name: 'Pengaturan', href: '/dashboard/admin/settings', icon: Settings }, // Future
    ];

    const isActive = (path: string) => {
        if (path === '/dashboard/admin' && pathname === '/dashboard/admin') return true;
        if (path !== '/dashboard/admin' && pathname?.startsWith(path)) return true;
        return false;
    };

    return (
        <aside className={`
            fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
            lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen
            ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
            <div className="h-full flex flex-col">
                {/* Header */}
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <Link href="/dashboard" className="flex items-center space-x-2 group">
                        <div className="bg-blue-50 p-1.5 rounded-lg group-hover:bg-blue-800 transition-colors">
                            <ShieldCheck className="h-5 w-5 text-blue-800 group-hover:text-white transition-colors" />
                        </div>
                        <span className="font-bold text-gray-900 text-lg">Axon<span className="text-blue-800">Admin</span></span>
                    </Link>
                </div>

                {/* Admin Profile Summary */}
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 shrink-0">
                            <ShieldCheck className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'Administrator'}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
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
                                        ? 'bg-blue-800 text-white shadow-md shadow-blue-900/20'
                                        : 'text-black hover:bg-blue-50 hover:text-blue-800'
                                    }
                                `}
                            >
                                <div className="flex items-center space-x-3">
                                    <item.icon className={`h-5 w-5 ${active ? 'text-white' : 'text-black group-hover:text-blue-800'}`} />
                                    <span>{item.name}</span>
                                </div>
                                {active && <ChevronRight className="h-4 w-4 text-white/50" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        <span>Keluar</span>
                    </button>
                </div>
            </div>
            <LogoutModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
            />
        </aside>
    );
}
