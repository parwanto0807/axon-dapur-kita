'use client';

import {
    Store, ShoppingBag, DollarSign, Users, TrendingUp,
    ArrowUpRight, Clock, ShieldCheck, Activity, Award,
    CheckCircle2, LayoutDashboard, Zap
} from 'lucide-react';
import { clsx } from 'clsx';

export default function AdminDashboardPage() {
    const stats = [
        { name: 'Total Toko', value: '12', label: 'Toko Terdaftar', icon: Store, color: 'blue', trend: '+2 minggu ini' },
        { name: 'Total Produk', value: '156', label: 'Produk Aktif', icon: ShoppingBag, color: 'emerald', trend: '+12 hari ini' },
        { name: 'Total Transaksi', value: '45.2 jt', label: 'Volume Penjualan', icon: DollarSign, color: 'indigo', trend: 'Rp 1.2jt/hari' },
        { name: 'Pengguna Baru', value: '24', label: 'User Terdaftar', icon: Users, color: 'purple', trend: '5 hari ini' },
    ];

    const activities = [
        { title: 'Toko Baru Mendaftar', detail: 'Shop #102 "Warung Sejahtera" menunggu persetujuan', time: '2j lalu', icon: Store, color: 'amber' },
        { title: 'Produk Baru Ditambahkan', detail: 'Sambal Goreng Ati oleh Toko Mak Teduh', time: '4j lalu', icon: ShoppingBag, color: 'emerald' },
        { title: 'Pencapaian Baru', detail: 'Volume transaksi harian menembus target Rp 5jt', time: '5j lalu', icon: Award, color: 'blue' },
    ];

    return (
        <div className="space-y-6 sm:space-y-8 font-[family-name:var(--font-poppins)] pb-10">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="bg-gray-900 p-2.5 rounded-2xl shadow-lg shadow-gray-900/20">
                    <LayoutDashboard className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight uppercase">Dashboard Admin</h1>
                    <p className="text-xs text-gray-400 font-medium lowercase tracking-tight">Ringkasan performa dan aktivitas ekosistem Axon</p>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {stats.map((stat) => (
                    <div key={stat.name} className="relative group bg-white p-4 sm:p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className={clsx(
                                "p-3 rounded-2xl bg-opacity-10",
                                `bg-${stat.color}-600 text-${stat.color}-600`
                            )}>
                                <stat.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                <TrendingUp className="h-3 w-3" />
                                {stat.trend}
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                            <div className="flex items-baseline gap-1">
                                {stat.name === 'Total Transaksi' && <span className="text-sm font-black text-gray-400">Rp</span>}
                                <p className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight">{stat.value}</p>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Activity Feed */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                            <Activity className="h-4 w-4 text-gray-400" />
                            Aktivitas Terbaru
                        </h2>
                        <button className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest">Semua Log</button>
                    </div>
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
                        {activities.map((act, i) => (
                            <div key={i} className="px-6 py-5 flex items-center gap-4 hover:bg-gray-50 transition-colors group">
                                <div className={clsx(
                                    "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform",
                                    `bg-${act.color}-50 text-${act.color}-600`
                                )}>
                                    <act.icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <p className="text-sm font-black text-gray-900 tracking-tight">{act.title}</p>
                                        <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {act.time}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium truncate">{act.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Performance Highlights */}
                <div className="space-y-4">
                    <div className="flex items-center px-2">
                        <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                            <Zap className="h-4 w-4 text-amber-500" />
                            Highlight
                        </h2>
                    </div>
                    <div className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm space-y-6">
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-2">
                                    <span className="text-gray-400">Target Bulanan</span>
                                    <span className="text-blue-600">85%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '85%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-2">
                                    <span className="text-gray-400">Akuisisi Toko</span>
                                    <span className="text-emerald-500">62%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '62%' }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-900 rounded-3xl text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <ShieldCheck className="h-16 w-16" />
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-xs font-black uppercase tracking-widest mb-1">Status Keamanan</h4>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                    <span className="text-sm font-bold">Semua Sistem OK</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
