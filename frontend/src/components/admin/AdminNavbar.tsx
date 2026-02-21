'use client';

import { Menu, Search, Bell, User, LogOut, Store } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import Link from 'next/link';
import LogoutModal from '../auth/LogoutModal';

export default function AdminNavbar({ onMenuClick }: { onMenuClick?: () => void }) {
    const { user, logout } = useAuthStore();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-40 sticky top-0 shadow-sm">
            <div className="flex items-center space-x-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <div className="hidden md:flex items-center text-sm font-medium text-gray-500">
                    Administrator Panel
                </div>
            </div>

            <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center space-x-2 p-1.5 hover:bg-gray-100 rounded-xl transition-all"
                    >
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 text-blue-600">
                            <User className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 hidden md:block max-w-[100px] truncate">{user?.name}</span>
                    </button>

                    {isProfileOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl ring-1 ring-black/5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-2 space-y-1">
                                    <Link
                                        href="/dashboard"
                                        className="flex items-center space-x-3 px-3 py-2 text-sm text-[#1B5E20] hover:bg-[#1B5E20]/5 rounded-lg font-bold"
                                        onClick={() => setIsProfileOpen(false)}
                                    >
                                        <Store className="h-4 w-4" />
                                        <span>Lihat Marketplace</span>
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setIsProfileOpen(false);
                                            setIsLogoutModalOpen(true);
                                        }}
                                        className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Keluar</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <LogoutModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
            />
        </header>
    );
}
