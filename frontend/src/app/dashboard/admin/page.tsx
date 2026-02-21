'use client';

import { Store, ShoppingBag, DollarSign, Users } from 'lucide-react';

export default function AdminDashboardPage() {
    const stats = [
        { name: 'Total Toko', value: '12', icon: Store, color: 'text-blue-600', bg: 'bg-blue-100' },
        { name: 'Total Produk', value: '156', icon: ShoppingBag, color: 'text-green-600', bg: 'bg-green-100' },
        { name: 'Total Transaksi', value: 'Rp 45.2 jt', icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-100' },
        { name: 'Pengguna Baru', value: '24', icon: Users, color: 'text-orange-600', bg: 'bg-orange-100' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-xs sm:text-2xl font-black text-gray-900 uppercase tracking-tight">Dashboard Administrator</h1>

            <div className="grid grid-cols-4 lg:grid-cols-4 gap-1.5 sm:gap-4">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white p-2 sm:p-6 rounded-lg sm:rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center sm:block">
                        <div className="flex flex-col sm:flex-row items-center justify-between w-full">
                            <div className="text-center sm:text-left">
                                <p className="text-[10px] sm:text-sm font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{stat.name.replace('Total ', '')}</p>
                                <p className="text-xs sm:text-2xl font-black text-gray-900 leading-none">{stat.value}</p>
                            </div>
                            <div className={`p-1 sm:p-3 rounded-lg ${stat.bg} mt-1.5 sm:mt-0`}>
                                <stat.icon className={`h-3 w-3 sm:h-6 sm:w-6 ${stat.color}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="text-xs sm:text-lg font-black text-gray-900 uppercase tracking-widest mb-3 sm:mb-4 underline decoration-blue-600 decoration-2 underline-offset-4">Aktivitas Terbaru</h2>
                    <div className="space-y-2 sm:space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-3 sm:gap-4 py-2 sm:py-3 border-b border-gray-50 last:border-0">
                                <div className="h-7 w-7 sm:h-10 sm:w-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                    <Store className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-gray-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm font-black text-gray-900 leading-tight">Toko Baru Mendaftar</p>
                                    <p className="text-[10px] sm:text-xs text-gray-500 font-bold truncate">Shop #{100 + i} menunggu persetujuan</p>
                                </div>
                                <span className="text-[10px] sm:text-xs text-gray-400 font-bold whitespace-nowrap">2j lalu</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="text-xs sm:text-lg font-black text-gray-900 uppercase tracking-widest mb-3 sm:mb-4 underline decoration-blue-600 decoration-2 underline-offset-4">Statistik Platform</h2>
                    <div className="h-32 sm:h-48 flex items-center justify-center bg-gray-50 rounded-lg sm:rounded-xl border border-dashed border-gray-200">
                        <p className="text-[10px] sm:text-sm text-gray-400 font-black uppercase tracking-widest italic">Chart Placeholder</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
