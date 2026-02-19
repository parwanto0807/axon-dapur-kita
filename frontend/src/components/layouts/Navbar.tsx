'use client';

import Link from 'next/link';
import { ShoppingBag, User, Search, Store, ChevronDown, Bell, MessageSquare, Mail, LogOut, Settings, Package, UserPlus, CheckCircle, X, Clock } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useBuyerSocket } from '@/hooks/useBuyerSocket';
import { formatPrice, formatDate, formatShortDate } from '@/utils/format';
import axios from 'axios';

interface Notification {
    id: string;
    title: string;
    body: string;
    type: string;
    isRead: boolean;
    link: string | null;
    createdAt: string;
}


export default function Navbar() {
    const [mounted, setMounted] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [currentLang, setCurrentLang] = useState('ID');
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [isOrdersLoading, setIsOrdersLoading] = useState(false);

    // Dropdown states
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isOrdersOpen, setIsOrdersOpen] = useState(false);

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Refs for outside click handling
    const notifRef = useRef<HTMLDivElement>(null);
    const cartRef = useRef<HTMLDivElement>(null);
    const ordersRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    const { isLoggedIn, user, logout } = useAuthStore();
    const cartItemsCount = useCartStore((state) => state.getTotalItems());
    const cartItems = useCartStore((state) => state.items);
    const totalPrice = useCartStore((state) => state.getTotalPrice());

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    const fetchNotifications = async () => {
        try {
            const res = await axios.get(`${apiBaseUrl}/notifications`, { withCredentials: true });
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.unreadCount);
        } catch (e) {
            // silently fail
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

    // Real-time: refresh notifications when a new order update arrives
    useBuyerSocket(() => {
        fetchNotifications();
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isLoggedIn) {
            fetchRecentOrders();
            fetchNotifications();
        }
    }, [isLoggedIn]);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (notifRef.current && !notifRef.current.contains(target)) {
                setIsNotifOpen(false);
            }
            if (cartRef.current && !cartRef.current.contains(target)) {
                setIsCartOpen(false);
            }
            if (ordersRef.current && !ordersRef.current.contains(target)) {
                setIsOrdersOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchRecentOrders = async () => {
        setIsOrdersLoading(true);
        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const response = await axios.get(`${apiBaseUrl}/orders/my?limit=3`, { withCredentials: true });
            setRecentOrders(response.data);
        } catch (error) {
            console.error('Error fetching recent orders for navbar:', error);
        } finally {
            setIsOrdersLoading(false);
        }
    };

    return (
        <nav className="border-b bg-white sticky top-0 z-50 shadow-sm transition-all duration-300">
            <div className="flex h-12 sm:h-16 w-full items-center justify-between px-3 sm:px-8 lg:px-12">
                {/* Logo Section */}
                <div className="hidden md:flex items-center space-x-2 group">
                    <div className="bg-[#1B5E20] p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                        <Store className="h-6 w-6 text-white" />
                    </div>
                    <Link href="/" className="flex flex-col">
                        <span className="text-xl font-extrabold text-[#1B5E20] tracking-tight leading-none">
                            Axon
                        </span>
                        <span className="text-sm font-semibold text-gray-500 tracking-wider">
                            DapurKita
                        </span>
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="flex flex-1 md:justify-center px-0 sm:px-4 md:px-8">
                    <div className="relative w-full max-w-xl group">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-gray-400 group-focus-within:text-[#1B5E20] transition-colors" />
                        </span>
                        <input
                            type="text"
                            placeholder="Cari di Axon..."
                            className="block w-full rounded-full sm:rounded-2xl border border-gray-200 bg-gray-50 sm:bg-white py-1.5 sm:py-3 pl-8 sm:pl-12 pr-3 sm:pr-4 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#1B5E20] focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-[#1B5E20]/5 text-xs transition-all duration-300"
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-0.5 sm:space-x-4">
                    {/* Seller/Start Selling Section */}
                    <div className="relative group hidden lg:block">
                        {user?.role === 'SELLER' ? (
                            <>
                                <div className="flex items-center px-4 py-2 text-sm font-bold text-[#1B5E20] hover:bg-[#1B5E20]/5 rounded-xl transition-all cursor-default">
                                    Profil Toko
                                </div>
                                {/* Seller Popover */}
                                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 origin-top rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 p-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform group-hover:translate-y-0 translate-y-2">
                                    <div className="text-center">
                                        <div className="mx-auto w-12 h-12 bg-[#1B5E20]/10 rounded-full flex items-center justify-center mb-4">
                                            <CheckCircle className="h-6 w-6 text-[#1B5E20]" />
                                        </div>
                                        <div className="mb-4">
                                            <p className="text-sm font-bold text-gray-900">Toko Anda Aktif</p>
                                            <p className="text-[10px] text-gray-500 mt-1">Kelola penjualan dan produk Anda</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Link
                                                href="/dashboard/merchant"
                                                className="flex items-center justify-center space-x-2 w-full py-2.5 bg-[#1B5E20] text-white text-xs font-bold rounded-xl hover:bg-[#1B5E20]/90 transition-all shadow-lg shadow-[#1B5E20]/10"
                                            >
                                                <Package className="h-4 w-4" />
                                                <span>Manajemen Toko</span>
                                            </Link>
                                            <Link
                                                href="/dashboard/merchant/profile"
                                                className="flex items-center justify-center space-x-2 w-full py-2.5 bg-gray-50 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-100 transition-all border border-gray-100"
                                            >
                                                <Settings className="h-4 w-4 text-gray-400" />
                                                <span>Edit Profil Toko</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : user?.shopId ? (
                            // Pending Seller State (Has shopId but role is USER)
                            <div className="hidden lg:flex items-center space-x-2 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-xl text-xs font-bold border border-yellow-200 cursor-help" title="Menunggu pembayaran/verifikasi">
                                <Clock className="h-4 w-4" />
                                <span>Menunggu Aktivasi Toko</span>
                            </div>
                        ) : (
                            // Not a seller yet
                            <>
                                <div className="flex items-center px-4 py-2 text-sm font-bold text-[#1B5E20] hover:bg-[#1B5E20]/5 rounded-xl transition-all cursor-default">
                                    Mulai Jualan Disini
                                </div>
                                {/* Start Selling Popover */}
                                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 origin-top rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 p-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform group-hover:translate-y-0 translate-y-2">
                                    <div className="text-center">
                                        <div className="mx-auto w-12 h-12 bg-[#1B5E20]/10 rounded-full flex items-center justify-center mb-4">
                                            <Store className="h-6 w-6 text-[#1B5E20]" />
                                        </div>
                                        <div className="flex items-center justify-center space-x-2 mb-2">
                                            <p className="text-sm font-semibold text-gray-900">
                                                Anda belum memiliki toko
                                            </p>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                                            Ayo mulai jualan produk dapur Anda hari ini dengan <span className="font-bold text-[#1B5E20]">biaya terjangkau</span> dan jangkau tetangga sekitar!
                                        </p>
                                        <div className="space-y-2">
                                            <button
                                                type="button"
                                                disabled={true}
                                                className="block w-full py-2.5 px-4 bg-gray-300 text-gray-500 text-xs font-bold rounded-xl cursor-not-allowed opacity-75 select-none"
                                                title="Silakan baca informasi terlebih dahulu atau login"
                                            >
                                                Mulai buka Toko / Berjualan disini
                                            </button>
                                            <Link
                                                href="/seller-info"
                                                className="block w-full py-2.5 px-4 bg-gray-50 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-100 border border-gray-100 transition-all active:scale-95"
                                            >
                                                Baca Kami Dahulu
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Actions Panel (Only for Logged In Users) */}
                    {isLoggedIn && (
                        <div className="flex items-center space-x-0.5 sm:space-x-3 mr-1 sm:mr-4">
                            {/* Shopping Cart with Mini-Cart Dropdown */}
                            <div className="relative group" ref={cartRef}>
                                <button
                                    onClick={() => setIsCartOpen(!isCartOpen)}
                                    className="p-1.5 sm:p-2 text-gray-600 hover:text-[#1B5E20] hover:bg-gray-50 rounded-xl relative block transition-all focus:outline-none"
                                >
                                    <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform" />
                                    {mounted && cartItemsCount > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 h-3.5 sm:h-4 w-3.5 sm:w-4 bg-red-500 text-white text-[8px] sm:text-[9px] font-bold flex items-center justify-center rounded-full border border-white shadow-sm">
                                            {cartItemsCount}
                                        </span>
                                    )}
                                </button>

                                {/* Mini Cart Dropdown */}
                                <div className={clsx(
                                    "fixed md:absolute left-1/2 -translate-x-1/2 md:left-auto md:right-0 md:translate-x-0 mt-2 w-[calc(100vw-16px)] max-w-sm origin-top md:origin-top-right rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 transition-all duration-300 z-50 transform group-hover:translate-y-0 translate-y-2 overflow-hidden border border-gray-100",
                                    isCartOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible group-hover:opacity-100 group-hover:visible"
                                )}>
                                    {mounted && cartItems.length > 0 ? (
                                        <div className="flex flex-col max-h-[400px] sm:max-h-[450px]">
                                            <div className="px-4 s:px-5 py-3 sm:py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                                                <h3 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-wider flex items-center">
                                                    <ShoppingBag className="h-4 w-4 mr-2 text-[#1B5E20]" />
                                                    Keranjang ({cartItemsCount})
                                                </h3>
                                            </div>

                                            {/* Items List */}
                                            <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
                                                {cartItems.map((item) => (
                                                    <div key={item.productId} className="flex items-center space-x-3 sm:space-x-4 px-4 sm:px-5 py-2 sm:py-3 hover:bg-gray-50 transition-colors">
                                                        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden shrink-0">
                                                            {item.image ? (
                                                                <img
                                                                    src={item.image.startsWith('http') ? item.image : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${item.image}`}
                                                                    alt={item.name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center">
                                                                    <Package className="h-5 w-5 sm:h-6 sm:w-6 text-gray-200" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{item.name}</p>
                                                            <p className="text-[10px] sm:text-[11px] text-[#1B5E20] font-bold mt-0.5">
                                                                {item.quantity} x {formatPrice(item.price)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Footer */}
                                            <div className="p-4 sm:p-5 border-t border-gray-100 bg-white">
                                                <div className="flex items-center justify-between mb-3 sm:mb-4">
                                                    <span className="text-[10px] sm:text-xs font-bold text-gray-400 tracking-wider">TOTAL ESTIMASI</span>
                                                    <span className="text-base sm:text-lg font-black text-[#1B5E20]">
                                                        {formatPrice(totalPrice)}
                                                    </span>
                                                </div>
                                                <Link
                                                    href="/cart"
                                                    className="block w-full py-3 sm:py-3.5 bg-[#1B5E20] text-white text-center text-[10px] sm:text-xs font-bold rounded-2xl hover:bg-green-800 transition-all shadow-lg shadow-green-100 active:scale-95"
                                                >
                                                    Lihat Keranjang Belanja
                                                </Link>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-6 sm:p-8 text-center">
                                            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                                                <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 text-gray-300" />
                                            </div>
                                            <p className="text-xs sm:text-sm font-bold text-gray-900 mb-1">
                                                Keranjangmu kosong
                                            </p>
                                            <p className="text-[10px] sm:text-[11px] text-gray-500 mb-4 sm:mb-6 leading-relaxed">
                                                Yuk, penuhi dapurmu with bahan-bahan terbaik hari ini!
                                            </p>
                                            <Link
                                                href="/dashboard"
                                                className="inline-flex items-center text-[10px] sm:text-xs font-bold text-[#1B5E20] hover:underline"
                                            >
                                                Mulai Belanja Sekarang →
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Notification Bell */}
                            <div className="relative" ref={notifRef}>
                                <button
                                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                                    className="p-1.5 sm:p-2 text-gray-600 hover:text-[#1B5E20] hover:bg-gray-50 rounded-xl relative block transition-all"
                                >
                                    <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                                    {mounted && unreadCount > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border border-white shadow-sm">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Notification Dropdown */}
                                {isNotifOpen && (
                                    <div className={clsx(
                                        "fixed md:absolute left-1/2 -translate-x-1/2 md:left-auto md:right-0 md:translate-x-0 mt-2 w-[calc(100vw-16px)] max-w-sm sm:max-w-md origin-top md:origin-top-right rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 z-50 overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200",
                                        isNotifOpen ? "opacity-100 visible" : "opacity-0 invisible"
                                    )}>
                                        {/* Header */}
                                        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                                            <h3 className="text-sm font-black text-gray-900 flex items-center">
                                                <Bell className="h-4 w-4 mr-2 text-[#1B5E20]" />
                                                Notifikasi
                                                {unreadCount > 0 && (
                                                    <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-black rounded-full">{unreadCount}</span>
                                                )}
                                            </h3>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={markAllAsRead}
                                                    className="text-[10px] font-bold text-[#1B5E20] hover:underline"
                                                >
                                                    Tandai semua dibaca
                                                </button>
                                            )}
                                        </div>

                                        {/* Notification List */}
                                        <div className="flex-1 overflow-y-auto max-h-[380px] custom-scrollbar">
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
                                                            "flex items-start space-x-3 px-5 py-3.5 cursor-pointer transition-colors border-b border-gray-50 last:border-0",
                                                            notif.isRead ? "hover:bg-gray-50" : "bg-green-50/50 hover:bg-green-50"
                                                        )}
                                                    >
                                                        <div className={clsx(
                                                            "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                                                            notif.isRead ? "bg-gray-100" : "bg-[#1B5E20]/10"
                                                        )}>
                                                            <Bell className={clsx("h-4 w-4", notif.isRead ? "text-gray-400" : "text-[#1B5E20]")} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={clsx("text-xs font-bold truncate", notif.isRead ? "text-gray-600" : "text-gray-900")}>
                                                                {notif.title}
                                                            </p>
                                                            <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{notif.body}</p>
                                                            <p className="text-[10px] text-gray-400 mt-1 font-medium">
                                                                {formatDate(notif.createdAt)}
                                                            </p>
                                                        </div>
                                                        {!notif.isRead && (
                                                            <span className="h-2 w-2 bg-[#1B5E20] rounded-full shrink-0 mt-2"></span>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-8 text-center">
                                                    <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                                        <Bell className="h-6 w-6 text-gray-300" />
                                                    </div>
                                                    <p className="text-[11px] font-bold text-gray-400">Belum ada notifikasi</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Orders with Mini-Orders Dropdown */}
                            <div className="relative group hidden md:block" ref={ordersRef}>
                                <button
                                    onClick={() => setIsOrdersOpen(!isOrdersOpen)}
                                    className="p-1.5 sm:p-2 text-gray-600 hover:text-[#1B5E20] hover:bg-gray-50 rounded-xl relative block group transition-all focus:outline-none"
                                    title="Pesanan Saya"
                                >
                                    <Mail className="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform" />
                                    {mounted && recentOrders.filter(o => o.paymentStatus === 'pending').length > 0 && (
                                        <span className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 sm:h-2.5 w-2 sm:w-2.5 bg-red-500 border border-white"></span>
                                        </span>
                                    )}
                                </button>

                                {/* Mini Orders Dropdown */}
                                <div className={clsx(
                                    "fixed md:absolute left-1/2 -translate-x-1/2 md:left-auto md:right-0 md:translate-x-0 mt-2 w-80 origin-top-right rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 transition-all duration-300 z-50 transform group-hover:translate-y-0 translate-y-2 overflow-hidden border border-gray-100",
                                    isOrdersOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible group-hover:opacity-100 group-hover:visible"
                                )}>
                                    <div className="flex flex-col max-h-[450px]">
                                        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center">
                                                <Mail className="h-4 w-4 mr-2 text-[#1B5E20]" />
                                                Pesanan Terbaru
                                            </h3>
                                        </div>

                                        {/* Orders List */}
                                        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
                                            {isOrdersLoading ? (
                                                <div className="p-8 text-center">
                                                    <div className="h-8 w-8 border-2 border-gray-200 border-t-[#1B5E20] rounded-full animate-spin mx-auto mb-2"></div>
                                                    <p className="text-[10px] text-gray-500 font-medium">Memuat pesanan...</p>
                                                </div>
                                            ) : recentOrders.length > 0 ? (
                                                recentOrders.map((order) => (
                                                    <Link key={order.id} href={`/dashboard/orders/${order.id}`} className="flex items-center space-x-4 px-5 py-3 hover:bg-gray-50 transition-colors">
                                                        <div className="h-12 w-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[#1B5E20] shrink-0">
                                                            <Package className="h-6 w-6" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate mr-2">#{order.id.slice(-6).toUpperCase()}</p>
                                                                <span className={clsx(
                                                                    "text-[9px] font-black px-1.5 py-0.5 rounded uppercase",
                                                                    order.paymentStatus === 'paid' ? "bg-green-100 text-green-700" :
                                                                        order.paymentStatus === 'pending' ? "bg-yellow-100 text-yellow-700" :
                                                                            "bg-gray-100 text-gray-700"
                                                                )}>
                                                                    {order.paymentStatus === 'paid' ? 'Lunas' :
                                                                        order.paymentStatus === 'pending' ? 'Belum Bayar' : order.paymentStatus}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs font-bold text-gray-900 truncate mt-0.5">{order.shop.name}</p>
                                                            <p className="text-[10px] text-gray-500 font-medium">{formatShortDate(order.createdAt)} • {formatPrice(order.totalAmount)}</p>
                                                        </div>
                                                    </Link>
                                                ))
                                            ) : (
                                                <div className="p-8 text-center">
                                                    <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                                        <Package className="h-6 w-6 text-gray-300" />
                                                    </div>
                                                    <p className="text-[11px] font-bold text-gray-400">Belum ada pesanan</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        <div className="p-4 border-t border-gray-100 bg-white">
                                            <Link
                                                href="/dashboard/orders"
                                                className="block w-full py-3 bg-gray-900 text-white text-center text-[11px] font-bold rounded-2xl hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-gray-200"
                                            >
                                                Tampilkan Semua Pesanan
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isLoggedIn ? (
                        <div className="flex items-center ml-1 sm:ml-2 relative" ref={profileRef}>
                            {/* Guest Dropdown Trigger */}
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center space-x-1 p-1 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all focus:outline-none"
                            >
                                <div className="h-7 w-7 sm:h-9 sm:w-9 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200">
                                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                </div>
                                <ChevronDown className={`h-3 w-3 sm:h-4 sm:w-4 text-gray-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Guest Dropdown Menu */}
                            {isProfileOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setIsProfileOpen(false)}
                                    ></div>
                                    <div className="fixed md:absolute top-[56px] md:top-full right-2 md:right-0 left-auto translate-x-0 mt-0 md:mt-2 w-[calc(100vw-32px)] max-w-[280px] origin-top-right rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 z-50 overflow-hidden transform transition-all animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="p-4 bg-gray-50/50 border-b border-gray-100">
                                            <p className="text-[10px] font-bold text-[#1B5E20] uppercase tracking-widest">Selamat Datang</p>
                                            <p className="text-sm font-bold text-gray-900 mt-1">Belum Masuk Akun</p>
                                        </div>
                                        <div className="py-2 px-1">
                                            <Link
                                                href="/login"
                                                className="flex items-center space-x-3 px-4 py-3 text-sm font-bold text-[#1B5E20] bg-green-100 hover:bg-green-200 rounded-xl transition-all mb-2"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <LogOut className="h-4 w-4 rotate-180" />
                                                <span>Masuk</span>
                                            </Link>
                                            <Link
                                                href="/register"
                                                className="flex items-center space-x-3 px-4 py-3 text-sm font-bold text-white bg-[#1B5E20] hover:bg-[#1B5E20]/90 rounded-xl transition-all shadow-md shadow-[#1B5E20]/20 mx-1 mt-1"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <UserPlus className="h-4 w-4" />
                                                <span>Daftar Akun</span>
                                            </Link>
                                        </div>

                                        <div className="border-t border-gray-100 py-3 px-1">
                                            <p className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pilih Bahasa</p>
                                            <div className="grid grid-cols-2 gap-1 px-2">
                                                <button
                                                    onClick={() => { setCurrentLang('ID'); setIsProfileOpen(false); }}
                                                    className={`flex items-center justify-center px-2 py-2 rounded-xl text-xs font-bold transition-all ${currentLang === 'ID' ? 'bg-[#1B5E20] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                                                >
                                                    ID
                                                </button>
                                                <button
                                                    onClick={() => { setCurrentLang('EN'); setIsProfileOpen(false); }}
                                                    className={`flex items-center justify-center px-2 py-2 rounded-xl text-xs font-bold transition-all ${currentLang === 'EN' ? 'bg-[#1B5E20] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                                                >
                                                    EN
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center ml-1 sm:ml-4 relative" ref={profileRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center space-x-1 focus:outline-none group"
                            >
                                <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-xl border-2 border-gray-100 overflow-hidden group-hover:border-[#1B5E20]/30 transition-all shadow-sm">
                                    {user?.image ? (
                                        <img
                                            src={user.image.startsWith('http') ? user.image : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${user.image.startsWith('/') ? '' : '/'}${user.image}`}
                                            alt={user.name}
                                            referrerPolicy="no-referrer"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-gray-50 flex items-center justify-center">
                                            <User className="h-6 w-6 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <ChevronDown className={`h-3 w-3 sm:h-4 sm:w-4 text-gray-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Profile Dropdown */}
                            {isProfileOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setIsProfileOpen(false)}
                                    ></div>
                                    <div className="fixed md:absolute top-[56px] md:top-full right-2 md:right-0 left-auto translate-x-0 mt-0 md:mt-2 w-[calc(100vw-32px)] max-w-[280px] origin-top-right rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 z-50 overflow-hidden transform transition-all animate-in fade-in slide-in-from-top-2 duration-200">
                                        {/* User Info Header */}
                                        <div className="p-4 bg-gray-50/50 border-b border-gray-100">
                                            <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'User'}</p>
                                            <p className="text-[10px] font-medium text-gray-500 truncate mt-0.5">{user?.email || 'user@email.com'}</p>
                                        </div>

                                        <div className="py-2">
                                            {user?.role === 'SELLER' && (
                                                <Link
                                                    href="/dashboard/merchant"
                                                    className="flex items-center space-x-3 px-4 py-2.5 text-sm text-[#1B5E20] bg-green-50 hover:bg-green-100 transition-colors"
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    <Store className="h-4 w-4" />
                                                    <span className="font-bold">Dashboard Toko</span>
                                                </Link>
                                            )}
                                            <Link
                                                href="/dashboard/profile"
                                                className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-[#1B5E20]/5 hover:text-[#1B5E20] transition-colors"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <User className="h-4 w-4" />
                                                <span className="font-medium">Profil Saya</span>
                                            </Link>
                                            <Link
                                                href="/dashboard/orders"
                                                className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-[#1B5E20]/5 hover:text-[#1B5E20] transition-colors"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <Package className="h-4 w-4" />
                                                <span className="font-medium">Pesanan Saya</span>
                                            </Link>
                                            <Link
                                                href="/dashboard/settings"
                                                className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-[#1B5E20]/5 hover:text-[#1B5E20] transition-colors"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <Settings className="h-4 w-4" />
                                                <span className="font-medium">Pengaturan</span>
                                            </Link>
                                        </div>

                                        {/* Language Section in Profile */}
                                        <div className="border-t border-gray-100 py-2 px-1">
                                            <p className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pilih Bahasa</p>
                                            <div className="grid grid-cols-2 gap-1 px-2">
                                                <button
                                                    onClick={() => setCurrentLang('ID')}
                                                    className={`flex items-center justify-center space-x-2 px-2 py-2 rounded-xl text-xs font-bold transition-all ${currentLang === 'ID' ? 'bg-[#1B5E20] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                                                >
                                                    <span>ID</span>
                                                </button>
                                                <button
                                                    onClick={() => setCurrentLang('EN')}
                                                    className={`flex items-center justify-center space-x-2 px-2 py-2 rounded-xl text-xs font-bold transition-all ${currentLang === 'EN' ? 'bg-[#1B5E20] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                                                >
                                                    <span>EN</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-100 py-2">
                                            <button
                                                onClick={() => {
                                                    setIsProfileOpen(false);
                                                    setIsLogoutModalOpen(true);
                                                }}
                                                className="flex w-full items-center space-x-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                <span className="font-bold">Keluar</span>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div >

            {/* Logout Confirmation Modal */}
            {
                isLogoutModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 transform transition-all animate-in zoom-in-95 duration-200">
                            <div className="flex flex-col items-center text-center">
                                <div className="h-20 w-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6 border border-red-100">
                                    <LogOut className="h-10 w-10 text-red-500" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 leading-tight">Keluar Akun?</h3>
                                <p className="mt-3 text-sm text-gray-500 font-medium leading-relaxed">
                                    Apakah Anda yakin akan logout dari <span className="font-bold text-[#1B5E20]">Axon DapurKita</span>?
                                </p>
                            </div>

                            <div className="mt-8 space-y-3">
                                <button
                                    onClick={() => {
                                        logout();
                                        window.location.href = 'http://localhost:5000/api/auth/logout';
                                    }}
                                    className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-200 active:scale-95"
                                >
                                    Lanjutkan
                                </button>
                                <button
                                    onClick={() => setIsLogoutModalOpen(false)}
                                    className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl font-bold hover:bg-gray-100 transition-all border border-gray-100 active:scale-95"
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </nav >
    );
}
