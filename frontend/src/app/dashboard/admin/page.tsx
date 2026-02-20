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
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrator</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-lg ${stat.bg}`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Aktivitas Terbaru</h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                    <Store className="h-5 w-5 text-gray-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">Toko Baru Mendaftar</p>
                                    <p className="text-xs text-gray-500">Shop #{100 + i} menunggu persetujuan</p>
                                </div>
                                <span className="text-xs text-gray-400">2 jam lalu</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Statistik Platform</h2>
                    <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-sm text-gray-400">Chart Placeholder</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
