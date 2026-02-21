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

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';

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
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <h1 className="text-sm sm:text-2xl font-black text-gray-900 uppercase tracking-tight">Kelola Toko</h1>
                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari toko..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8 pr-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg text-xs sm:text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full sm:w-64"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-2 py-1.5 sm:py-2 border border-gray-200 rounded-lg text-xs sm:text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none bg-white min-w-[100px]"
                    >
                        <option value="ALL">Semua</option>
                        <option value="PENDING">Menunggu</option>
                        <option value="ACTIVE">Aktif</option>
                        <option value="SUSPENDED">Off</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Mobile View: Card List */}
                <div className="block sm:hidden divide-y divide-gray-50">
                    {isLoading ? (
                        <div className="p-10 text-center text-gray-500">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-500 mx-auto mb-2" />
                            <span className="text-xs font-bold uppercase tracking-widest">Memuat...</span>
                        </div>
                    ) : shops.length === 0 ? (
                        <div className="p-10 text-center text-gray-400 text-xs font-bold uppercase tracking-widest italic">
                            Kosong
                        </div>
                    ) : (
                        shops.map((shop) => (
                            <div key={shop.id} className="p-3 bg-white hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                                            <Store className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-xs font-black text-gray-900 truncate leading-tight uppercase tracking-tight">{shop.name}</h3>
                                            <p className="text-[10px] font-bold text-gray-400 tracking-widest">#{shop.id.slice(-6)}</p>
                                        </div>
                                    </div>
                                    {getStatusBadge(shop.status)}
                                </div>
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <div className="p-1.5 bg-gray-50 rounded-lg">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Pemilik</p>
                                        <p className="text-[11px] font-bold text-gray-800 truncate">{shop.owner.name}</p>
                                        <p className="text-[10px] text-gray-500 truncate leading-none mt-0.5">{shop.owner.email}</p>
                                    </div>
                                    <div className="p-1.5 bg-gray-50 rounded-lg">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Metrik</p>
                                        <div className="flex gap-2">
                                            <span className="text-[11px] font-bold text-gray-800">{shop._count.products} Prd</span>
                                            <span className="text-[11px] font-bold text-gray-800">{shop._count.orders} Psn</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-50">
                                    {shop.status === 'PENDING' && (
                                        <>
                                            <button
                                                onClick={() => updateStatus(shop.id, 'ACTIVE')}
                                                disabled={actionLoading === shop.id}
                                                className="bg-green-500 text-white px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest shadow-sm shadow-green-200"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => updateStatus(shop.id, 'REJECTED')}
                                                disabled={actionLoading === shop.id}
                                                className="bg-red-50 text-red-500 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border border-red-100"
                                            >
                                                Tolak
                                            </button>
                                        </>
                                    )}
                                    {shop.status === 'ACTIVE' && (
                                        <button
                                            onClick={() => updateStatus(shop.id, 'SUSPENDED')}
                                            disabled={actionLoading === shop.id}
                                            className="text-orange-500 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-orange-50 border border-orange-100"
                                        >
                                            Suspend
                                        </button>
                                    )}
                                    {shop.status === 'SUSPENDED' && (
                                        <button
                                            onClick={() => updateStatus(shop.id, 'ACTIVE')}
                                            disabled={actionLoading === shop.id}
                                            className="text-green-600 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-green-50 border border-green-100"
                                        >
                                            Aktifkan
                                        </button>
                                    )}
                                    <a href={`/shop/${shop.slug}`} target="_blank" rel="noreferrer" className="p-1 text-gray-400">
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden sm:block overflow-x-auto">
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
                        <tbody className="bg-white divide-y divide-gray-100">
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
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500 italic">
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
                                                    <div className="text-sm font-bold text-gray-900">{shop.name}</div>
                                                    <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">ID: #{shop.id.slice(-6)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">{shop.owner.name}</div>
                                            <div className="text-xs text-gray-500">{shop.owner.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(shop.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-bold">{shop._count.products} Produk</span>
                                                <span className="font-bold">{shop._count.orders} Pesanan</span>
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
                    <div className="px-3 sm:px-6 py-2 sm:py-4 border-t border-gray-50 flex items-center justify-between">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-2 py-1 border border-gray-300 rounded text-[11px] sm:text-sm font-bold disabled:opacity-50 uppercase tracking-widest"
                        >
                            Prev
                        </button>
                        <span className="text-[11px] sm:text-sm text-gray-400 font-black uppercase tracking-widest">
                            Hlm {page} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-2 py-1 border border-gray-300 rounded text-[11px] sm:text-sm font-bold disabled:opacity-50 uppercase tracking-widest"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
