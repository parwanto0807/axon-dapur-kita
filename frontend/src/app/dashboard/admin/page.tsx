'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Store, ShoppingBag, DollarSign, Users, TrendingUp,
    Clock, ShieldCheck, Activity,
    CheckCircle2, LayoutDashboard, Zap
} from 'lucide-react';
import { clsx } from 'clsx';
import { formatPrice } from '@/utils/format';

interface AdminStats {
    totalShops: number;
    totalProducts: number;
    totalOrders: number;
    totalAmount: number;
    totalUsers: number;
    pendingShops: number;
    todayAmount: number;
}

interface ActivityItem {
    id: string;
    title: string;
    detail: string;
    time: string;
    type: 'order' | 'shop' | 'product';
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';
            const res = await axios.get(`${apiBaseUrl}/admin/statistics`, {
                withCredentials: true
            });
            setStats(res.data.stats);
            // Flatten and combine all activities
            const allActivities = [
                ...res.data.activities.recentOrders,
                ...res.data.activities.newShops,
                ...res.data.activities.newProducts
            ];
            // Sort by most recent first - you might want to add timestamp to sort properly
            setActivities(allActivities.slice(0, 3));
        } catch (err) {
            console.error('Error fetching admin data:', err);
            setError('Gagal memuat data dashboard');
        } finally {
            setIsLoading(false);
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'order': return ShoppingBag;
            case 'shop': return Store;
            case 'product': return ShoppingBag;
            default: return Activity;
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'order': return 'emerald';
            case 'shop': return 'amber';
            case 'product': return 'blue';
            default: return 'gray';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
            </div>
        );
    }

    const statCards = stats ? [
        { name: 'Total Toko', value: stats.totalShops.toString(), label: 'Toko Terdaftar', icon: Store, color: 'blue', trend: `${stats.pendingShops} menunggu` },
        { name: 'Total Produk', value: stats.totalProducts.toString(), label: 'Produk Aktif', icon: ShoppingBag, color: 'emerald', trend: '+12 hari ini' },
        { name: 'Total Transaksi', value: formatPrice(stats.totalAmount), label: 'Volume Penjualan', icon: DollarSign, color: 'indigo', trend: `${formatPrice(stats.todayAmount)}/hari` },
        { name: 'Pengguna Baru', value: stats.totalUsers.toString(), label: 'User Terdaftar', icon: Users, color: 'purple', trend: `${stats.totalOrders} pesanan` },
    ] : [];

    return (
        <div className="space-y-4 sm:space-y-8 font-(family-name:--font-poppins) pb-24 lg:pb-12">
            {/* Header */}
            <div className="flex items-start gap-2.5 sm:gap-3 px-0.5 sm:px-0">
                <div className="bg-gray-900 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl shadow-lg shadow-gray-900/20 shrink-0">
                    <LayoutDashboard className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                    <h1 className="text-base sm:text-2xl font-black text-gray-900 tracking-tight uppercase leading-tight">Dashboard Admin</h1>
                    <p className="text-[10px] sm:text-xs text-gray-400 font-medium lowercase tracking-tight mt-0.5">Ringkasan performa dan aktivitas ekosistem Axon</p>
                </div>
            </div>

            {error && (
                <div className="mx-0.5 sm:mx-0 p-3 sm:p-4 bg-red-50 border border-red-100 rounded-xl sm:rounded-2xl text-red-600 text-xs sm:text-sm font-medium">
                    {error}
                </div>
            )}

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6 px-0.5 sm:px-0">
                {statCards.map((stat) => (
                    <div key={stat.name} className="relative group bg-white p-3 sm:p-6 rounded-2xl sm:rounded-4xl border border-gray-100 shadow-sm hover:shadow-md sm:hover:shadow-xl transition-all">
                        <div className="flex justify-between items-start gap-2 mb-3 sm:mb-4">
                            <div className={clsx(
                                "p-2 sm:p-3 rounded-lg sm:rounded-2xl bg-opacity-10 shrink-0",
                                `bg-${stat.color}-600 text-${stat.color}-600`
                            )}>
                                <stat.icon className="h-4 w-4 sm:h-6 sm:w-6" />
                            </div>
                            <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                                <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                <span className="hidden sm:inline">{stat.trend}</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-wide mb-1">{stat.label}</p>
                            <div className="flex items-baseline gap-1">
                                {stat.name === 'Total Transaksi' && <span className="text-[10px] sm:text-sm font-black text-gray-400">Rp</span>}
                                <p className="text-base sm:text-3xl font-black text-gray-900 tracking-tight truncate">{stat.value}</p>
                            </div>
                        </div>
                        {/* Decorative background element */}
                        <div className={clsx(
                            "absolute bottom-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-500",
                            `text-${stat.color}-600`
                        )}>
                            <stat.icon className="h-16 w-16" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Secondary Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Activity Feed */}
                <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between px-0.5 sm:px-2">
                        <h2 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-1.5 sm:gap-2">
                            <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                            Aktivitas Terbaru
                        </h2>
                        <button className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest">Log</button>
                    </div>
                    <div className="mx-0.5 sm:mx-0 bg-white rounded-2xl sm:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
                        {activities.map((act) => {
                            const IconComponent = getActivityIcon(act.type);
                            const color = getActivityColor(act.type);
                            return (
                                <div key={act.id} className="px-3 sm:px-6 py-3 sm:py-5 flex items-start gap-3 hover:bg-gray-50 transition-colors group">
                                    <div className={clsx(
                                        "h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 sm:group-hover:scale-110 transition-transform",
                                        `bg-${color}-50 text-${color}-600`
                                    )}>
                                        <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-0.5">
                                            <p className="text-xs sm:text-sm font-black text-gray-900 tracking-tight line-clamp-2 flex-1">{act.title}</p>
                                            <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold flex items-center gap-0.5 shrink-0 whitespace-nowrap">
                                                <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                                {act.time}
                                            </span>
                                        </div>
                                        <p className="text-[10px] sm:text-xs text-gray-500 font-medium truncate">{act.detail}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Performance Highlights */}
                <div className="space-y-3 sm:space-y-4 px-0.5 sm:px-0 lg:px-0">
                    <div className="flex items-center sm:px-2">
                        <h2 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-1.5 sm:gap-2">
                            <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500" />
                            Highlight
                        </h2>
                    </div>
                    <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 border border-gray-100 shadow-sm space-y-4 sm:space-y-6">
                        <div className="space-y-3 sm:space-y-4">
                            <div>
                                <div className="flex justify-between text-[10px] sm:text-[11px] font-black uppercase tracking-wider mb-1.5 sm:mb-2">
                                    <span className="text-gray-400">Target Bulanan</span>
                                    <span className="text-blue-600">85%</span>
                                </div>
                                <div className="h-1.5 sm:h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '85%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[10px] sm:text-[11px] font-black uppercase tracking-wider mb-1.5 sm:mb-2">
                                    <span className="text-gray-400">Akuisisi Toko</span>
                                    <span className="text-emerald-500">62%</span>
                                </div>
                                <div className="h-1.5 sm:h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '62%' }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 sm:p-4 bg-gray-900 rounded-2xl sm:rounded-3xl text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 sm:p-4 opacity-10">
                                <ShieldCheck className="h-12 w-12 sm:h-16 sm:w-16" />
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-widest mb-1">Status Keamanan</h4>
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400" />
                                    <span className="text-xs sm:text-sm font-bold">Semua Sistem OK</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
