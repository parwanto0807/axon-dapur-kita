'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, MoreHorizontal, Check, X, Ban, ExternalLink, Loader2, Store } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface Shop {
    id: string;
    name: string;
    slug: string;
    status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';
    owner: {
        name: string;
        email: string;
        whatsapp: string | null;
    };
    _count: {
        products: number;
        orders: number;
    };
    createdAt: string;
}

export default function AdminShopsPage() {
    const [shops, setShops] = useState<Shop[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    const fetchShops = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`${apiBaseUrl}/shops/admin/all`, {
                params: { page, search, status: statusFilter },
                withCredentials: true
            });
            setShops(res.data.shops);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error('Failed to fetch shops', error);
            toast.error('Gagal memuat data toko');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchShops();
        }, 300);
        return () => clearTimeout(timeout);
    }, [page, search, statusFilter]);

    const updateStatus = async (id: string, newStatus: string) => {
        if (!confirm(`Apakah Anda yakin ingin mengubah status toko menjadi ${newStatus}?`)) return;

        setActionLoading(id);
        const toastId = toast.loading('Memperbarui status...');

        try {
            await axios.put(`${apiBaseUrl}/shops/admin/${id}/status`,
                { status: newStatus },
                { withCredentials: true }
            );

            setShops(shops.map(shop =>
                shop.id === id ? { ...shop, status: newStatus as any } : shop
            ));

            toast.success(`Status berhasil diubah menjadi ${newStatus}`, { id: toastId });
        } catch (error) {
            console.error('Failed to update status', error);
            toast.error('Gagal memperbarui status', { id: toastId });
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Aktif</span>;
            case 'PENDING':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Menunggu</span>;
            case 'SUSPENDED':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Ditangguhkan</span>;
            case 'REJECTED':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Ditolak</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Kelola Toko</h1>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari toko atau pemilik..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full sm:w-64"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                        <option value="ALL">Semua Status</option>
                        <option value="PENDING">Menunggu</option>
                        <option value="ACTIVE">Aktif</option>
                        <option value="SUSPENDED">Ditangguhkan</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toko</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pemilik</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metrik</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                        <div className="flex justify-center items-center">
                                            <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                                            Memuat data...
                                        </div>
                                    </td>
                                </tr>
                            ) : shops.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                        Tidak ada toko yang ditemukan
                                    </td>
                                </tr>
                            ) : (
                                shops.map((shop) => (
                                    <tr key={shop.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                                                    <Store className="h-5 w-5 text-gray-500" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{shop.name}</div>
                                                    <div className="text-xs text-gray-500">ID: #{shop.id.slice(-6)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{shop.owner.name}</div>
                                            <div className="text-xs text-gray-500">{shop.owner.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(shop.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex flex-col gap-1">
                                                <span>{shop._count.products} Produk</span>
                                                <span>{shop._count.orders} Pesanan</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                {shop.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => updateStatus(shop.id, 'ACTIVE')}
                                                            disabled={actionLoading === shop.id}
                                                            className="text-green-600 hover:text-green-900 p-1 bg-green-50 rounded hover:bg-green-100 transition-colors"
                                                            title="Setujui Toko"
                                                        >
                                                            {actionLoading === shop.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                                        </button>
                                                        <button
                                                            onClick={() => updateStatus(shop.id, 'REJECTED')}
                                                            disabled={actionLoading === shop.id}
                                                            className="text-red-600 hover:text-red-900 p-1 bg-red-50 rounded hover:bg-red-100 transition-colors"
                                                            title="Tolak Toko"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {shop.status === 'ACTIVE' && (
                                                    <button
                                                        onClick={() => updateStatus(shop.id, 'SUSPENDED')}
                                                        disabled={actionLoading === shop.id}
                                                        className="text-orange-600 hover:text-orange-900 p-1 bg-orange-50 rounded hover:bg-orange-100 transition-colors"
                                                        title="Tangguhkan Toko"
                                                    >
                                                        <Ban className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {shop.status === 'SUSPENDED' && (
                                                    <button
                                                        onClick={() => updateStatus(shop.id, 'ACTIVE')}
                                                        disabled={actionLoading === shop.id}
                                                        className="text-green-600 hover:text-green-900 p-1 bg-green-50 rounded hover:bg-green-100 transition-colors"
                                                        title="Aktifkan Kembali"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                )}

                                                <a href={`/shop/${shop.slug}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-600 p-1 transition-colors">
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-600">
                            Halaman {page} dari {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
