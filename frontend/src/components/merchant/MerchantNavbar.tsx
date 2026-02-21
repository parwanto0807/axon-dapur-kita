'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Search, User, LogOut, Settings, Store, Menu } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useMerchantSocket } from '@/hooks/useMerchantSocket';
import axios from 'axios';
import { clsx } from 'clsx';
import { formatDate } from '@/utils/format';
import { toast } from 'react-hot-toast';
import LogoutModal from '../auth/LogoutModal';

interface Notification {
    id: string;
    title: string;
    body: string;
    type: string;
    isRead: boolean;
    link: string | null;
    createdAt: string;
}

export default function MerchantNavbar({ onMenuClick }: { onMenuClick?: () => void }) {
    const { user, logout } = useAuthStore();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';

    const fetchNotifications = async () => {
        try {
            const res = await axios.get(`${apiBaseUrl}/notifications`, { withCredentials: true });
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.unreadCount);
        } catch (e) {
            console.error('Failed to fetch notifications', e);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.patch(`${apiBaseUrl}/notifications/read-all`, {}, { withCredentials: true });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (e) { }
    };

    const markOneAsRead = async (id: string) => {
        try {
            await axios.patch(`${apiBaseUrl}/notifications/${id}/read`, {}, { withCredentials: true });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (e) { }
    };

    // Real-time socket connection
    const { connectionStatus } = useMerchantSocket({
        shopId: user?.shopId || null,
        onNewOrder: (order) => {
            console.log('[MerchantNavbar] Real-time order received:', order.id);
            // Refresh notifications when new order arrives
            fetchNotifications();
            // Toast is already handled in useMerchantSocket (actually no, looking at hook source, it handles logic but let's double check)
            // Wait, useMerchantSocket (Step 1062) does NOT have toast logic inside it. 
            // It just updates state. 
            // Actually, let's check useMerchantSocket again.
            // It has onNewOrder callback.
            // I should show toast here if the hook doesn't.
            // Looking at Step 1062, useMerchantSocket calls onNewOrder. It does not seem to have toast built-in for new orders?
            // Wait, `useBuyerSocket` had built-in toast. `useMerchantSocket` might not.
            // Let's assume I need to show toast here or relying on the hook if it does.
            // Actually, let's just fetch notifications.

            toast.success(`Order Baru! #${order.id.slice(-6).toUpperCase()}`, {
                icon: '🎉',
                duration: 5000,
                style: {
                    fontSize: '11px',
                    fontWeight: '800',
                }
            });
        }
    });

    useEffect(() => {
        fetchNotifications();

        // Listen for FCM manual refresh events
        const handleRefresh = () => fetchNotifications();
        window.addEventListener('refresh-notifications', handleRefresh);
        return () => window.removeEventListener('refresh-notifications', handleRefresh);
    }, []);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-40 sticky top-0 shadow-sm">
            <div className="flex items-center space-x-4">
                {/* Search Bar - Optional */}
                <div className="hidden md:flex items-center relative max-w-md w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black" />
                    <input
                        type="text"
                        placeholder="Cari..."
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#1B5E20]/20 focus:bg-white transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-3 sm:space-x-4">
                {/* Status Badge */}
                <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200">
                    <div className={clsx(
                        "h-2 w-2 rounded-full animate-pulse",
                        connectionStatus === 'connected' ? "bg-green-500" :
                            connectionStatus === 'connecting' ? "bg-yellow-500" :
                                connectionStatus === 'polling' ? "bg-blue-500" :
                                    "bg-red-500"
                    )} />
                    <span className="text-[10px] font-medium text-gray-500 tracking-wider">
                        {connectionStatus === 'connected' ? 'Live' :
                            connectionStatus === 'connecting' ? 'Connecting' :
                                connectionStatus === 'polling' ? 'Syncing' : 'Offline'}
                    </span>
                </div>

                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                        className="p-2 text-black hover:bg-gray-100 hover:text-[#1B5E20] rounded-xl transition-all relative"
                    >
                        <Bell className="h-6 w-6" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Dropdown */}
                    {isNotifOpen && (
                        <div className="fixed md:absolute left-1/2 -translate-x-1/2 md:left-auto md:right-0 md:translate-x-0 mt-2 w-[calc(100vw-16px)] max-w-sm sm:max-w-md bg-white rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50 transform origin-top md:origin-top-right">
                            <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                                <h3 className="text-sm font-medium text-gray-900">Notifikasi</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs font-medium text-[#1B5E20] hover:underline"
                                    >
                                        Tandai dibaca
                                    </button>
                                )}
                            </div>

                            <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                                {notifications.length > 0 ? (
                                    notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            onClick={async () => {
                                                if (!notif.isRead) await markOneAsRead(notif.id);
                                                setIsNotifOpen(false);
                                                if (notif.link) window.location.href = notif.link;
                                            }}
                                            className={clsx(
                                                "p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors flex items-start space-x-3",
                                                !notif.isRead && "bg-[#1B5E20]/5"
                                            )}
                                        >
                                            <div className={clsx(
                                                "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                                                notif.isRead ? "bg-gray-100 text-gray-400" : "bg-[#1B5E20]/10 text-[#1B5E20]"
                                            )}>
                                                <Bell className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={clsx("text-sm font-medium", !notif.isRead ? "text-gray-900" : "text-gray-600")}>
                                                    {notif.title}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.body}</p>
                                                <p className="text-[10px] text-gray-400 mt-1.5">{formatDate(notif.createdAt)}</p>
                                            </div>
                                            {!notif.isRead && (
                                                <div className="h-2 w-2 bg-[#1B5E20] rounded-full shrink-0" />
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-gray-500">
                                        <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                        <p className="text-xs">Belum ada notifikasi baru</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center space-x-2 p-1.5 hover:bg-gray-100 rounded-xl transition-all"
                    >
                        <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
                            {user?.image ? (
                                <img
                                    src={user.image.startsWith('http') ? user.image : `${apiBaseUrl.replace('/api', '')}${user.image.startsWith('/') ? '' : '/'}${user.image}`}
                                    alt={user.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                    <User className="h-4 w-4 text-black" />
                                </div>
                            )}
                        </div>
                        <span className="text-sm font-medium text-gray-700 hidden md:block max-w-[100px] truncate">{user?.name}</span>
                    </button>

                    {isProfileOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                            <div className="fixed md:absolute left-1/2 -translate-x-1/2 md:left-auto md:right-0 md:translate-x-0 mt-2 w-[calc(100vw-16px)] max-w-[280px] bg-white rounded-xl shadow-xl ring-1 ring-black/5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top md:origin-top-right">
                                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                                    <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                </div>
                                <div className="p-2">
                                    <Link
                                        href="/dashboard"
                                        className="flex items-center space-x-3 px-3 py-2 text-sm text-[#1B5E20] hover:bg-[#1B5E20]/5 rounded-lg font-bold"
                                        onClick={() => setIsProfileOpen(false)}
                                    >
                                        <Store className="h-4 w-4" />
                                        <span>Lihat Marketplace</span>
                                    </Link>
                                    <Link
                                        href="/dashboard/merchant/profile"
                                        className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                                        onClick={() => setIsProfileOpen(false)}
                                    >
                                        <Settings className="h-4 w-4 text-gray-400" />
                                        <span>Pengaturan Toko</span>
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
