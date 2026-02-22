'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Search, Filter, Check, X, Ban, ExternalLink, Loader2, Store,
    User, Mail, Phone, ShoppingBag, Clock, ShieldCheck, ShieldAlert,
    Briefcase, ArrowUpRight, TrendingUp, MoreVertical, LayoutGrid, Users,
    Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clsx } from 'clsx';
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

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return { label: 'Aktif', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', dot: 'bg-emerald-500' };
            case 'PENDING':
                return { label: 'Menunggu', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', dot: 'bg-amber-500' };
            case 'SUSPENDED':
                return { label: 'Off', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100', dot: 'bg-rose-500' };
            case 'REJECTED':
                return { label: 'Ditolak', bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' };
            default:
                return { label: status, bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-100', dot: 'bg-gray-300' };
        }
    };

    // Calculate metadata from the fetched list (for display in stats)
    // In a real app, these should come from a dedicated stats endpoint
    const stats = {
        total: shops.length, // local length for visual feedback
        pending: shops.filter(s => s.status === 'PENDING').length,
        active: shops.filter(s => s.status === 'ACTIVE').length,
    };

    return (
        <div className="space-y-4 sm:space-y-8 font-[family-name:var(--font-poppins)] pb-10">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-600 p-2.5 rounded-2xl shadow-lg shadow-emerald-900/20">
                        <Store className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2 uppercase">
                            Moderasi Toko
                        </h1>
                        <p className="text-xs text-gray-400 font-medium tracking-tight">Kelola persetujuan dan status operasional seller</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari toko atau pemilik..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all shadow-sm"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-white border border-gray-100 rounded-xl px-3 py-2 text-xs font-black uppercase tracking-widest text-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm cursor-pointer"
                    >
                        <option value="ALL">Semua</option>
                        <option value="PENDING">Menunggu</option>
                        <option value="ACTIVE">Aktif</option>
                        <option value="SUSPENDED">Off</option>
                    </select>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[
                    { label: 'Total Toko', value: shops.length, icon: Store, color: 'blue' },
                    { label: 'Persetujuan', value: stats.pending, icon: Clock, color: 'amber' },
                    { label: 'Toko Aktif', value: stats.active, icon: ShieldCheck, color: 'emerald' },
                    { label: 'Total Pesanan', value: shops.reduce((sum, s) => sum + s._count.orders, 0), icon: TrendingUp, color: 'indigo' },
                ].map((s) => (
                    <div key={s.label} className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 group hover:border-emerald-100 transition-all">
                        <div className={clsx(
                            "p-2 sm:p-3 rounded-xl group-hover:scale-110 transition-transform",
                            `bg-${s.color}-50 text-${s.color}-600`
                        )}>
                            <s.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
                            <p className="text-base sm:text-xl font-black text-gray-900 leading-none mt-1">{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                {/* Mobile View: High Quality Cards */}
                <div className="block sm:hidden divide-y divide-gray-50">
                    {isLoading ? (
                        <div className="p-20 text-center">
                            <Loader2 className="h-10 w-10 text-emerald-600 animate-spin mx-auto mb-4" />
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Menghubungkan...</p>
                        </div>
                    ) : shops.length === 0 ? (
                        <div className="p-20 text-center">
                            <Users className="h-12 w-12 text-gray-100 mx-auto mb-3" />
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest italic tracking-wider">Tidak ada toko tersedia</p>
                        </div>
                    ) : (
                        shops.map((shop) => {
                            const style = getStatusStyle(shop.status);
                            return (
                                <div key={shop.id} className="p-5 flex flex-col gap-4 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-2 opacity-5 translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform pointer-events-none">
                                        <Store className="h-24 w-24" />
                                    </div>

                                    <div className="flex justify-between items-start z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shadow-inner">
                                                <Store className="h-6 w-6 text-gray-300" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-sm font-black text-gray-900 truncate tracking-tight uppercase">{shop.name}</h3>
                                                <p className="text-[10px] font-bold text-gray-400 tracking-widest">ID: #{shop.id.slice(-8).toUpperCase()}</p>
                                            </div>
                                        </div>
                                        <div className={clsx(
                                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                            style.bg, style.text, style.border
                                        )}>
                                            {style.label}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 z-10">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-1.5 text-gray-500">
                                                <User className="h-3 w-3" />
                                                <span className="text-[11px] font-bold truncate">{shop.owner.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-gray-400">
                                                <Mail className="h-3 w-3" />
                                                <span className="text-[11px] truncate">{shop.owner.email}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 bg-gray-50/50 p-2 rounded-xl">
                                            <div className="flex items-center justify-between text-[11px]">
                                                <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Produk</span>
                                                <span className="text-gray-900 font-black">{shop._count.products}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-[11px]">
                                                <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Pesanan</span>
                                                <span className="text-gray-900 font-black">{shop._count.orders}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-2 z-10">
                                        {shop.status === 'PENDING' ? (
                                            <>
                                                <button
                                                    onClick={() => updateStatus(shop.id, 'ACTIVE')}
                                                    className="flex-1 bg-emerald-600 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-900/10 active:scale-95"
                                                >
                                                    Setujui
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(shop.id, 'REJECTED')}
                                                    className="flex-1 bg-white border border-gray-200 text-gray-400 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all"
                                                >
                                                    Tolak
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => updateStatus(shop.id, shop.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')}
                                                className={clsx(
                                                    "flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md transition-all active:scale-95",
                                                    shop.status === 'ACTIVE'
                                                        ? "bg-rose-50 text-rose-600 border border-rose-100 shadow-rose-900/5 hover:bg-rose-100"
                                                        : "bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-emerald-900/5 hover:bg-emerald-100"
                                                )}
                                            >
                                                {shop.status === 'ACTIVE' ? 'Suspend Toko' : 'Aktifkan Kembali'}
                                            </button>
                                        )}
                                        <Link href={`/${shop.slug}`} target="_blank" className="p-2.5 bg-gray-900 text-white rounded-xl shadow-lg shadow-gray-900/20 active:scale-95">
                                            <ExternalLink className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Desktop View: Premium Table */}
                <div className="hidden sm:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/80">
                            <tr>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Profil Toko</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Data Pemilik</th>
                                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Performance</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Moderasi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <Loader2 className="h-10 w-10 text-emerald-600 animate-spin mb-3" />
                                            <p className="text-xs font-black text-gray-300 uppercase underline decoration-emerald-500/30 underline-offset-8">Synchronizing Warehouse Data...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : shops.map((shop) => {
                                const style = getStatusStyle(shop.status);
                                return (
                                    <tr key={shop.id} className="hover:bg-emerald-50/30 transition-all duration-300 group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                                                    <Store className="h-6 w-6 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-gray-900 uppercase tracking-tight">{shop.name}</div>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">axonvmkm.id/</span>
                                                        <span className="text-[10px] font-black text-emerald-600 font-mono underline decoration-emerald-200">{shop.slug}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="h-5 w-5 rounded-lg bg-indigo-50 flex items-center justify-center">
                                                        <User className="h-3 w-3 text-indigo-500" />
                                                    </div>
                                                    <span className="text-xs font-black text-gray-800 tracking-tight">{shop.owner.name}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="h-5 w-5 rounded-lg bg-sky-50 flex items-center justify-center">
                                                        <Mail className="h-3 w-3 text-sky-500" />
                                                    </div>
                                                    <span className="text-[10px] font-medium text-gray-500">{shop.owner.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className={clsx(
                                                "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border",
                                                style.bg, style.text, style.border
                                            )}>
                                                <span className={clsx("h-1.5 w-1.5 rounded-full animate-pulse", style.dot)}></span>
                                                {style.label}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="inline-flex flex-col gap-1 p-2 bg-gray-50/50 rounded-xl min-w-[100px] border border-gray-100">
                                                <div className="flex items-center justify-between gap-4 px-1">
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Produk</span>
                                                    <span className="text-xs font-black text-gray-900">{shop._count.products}</span>
                                                </div>
                                                <div className="flex items-center justify-between gap-4 px-1">
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Orders</span>
                                                    <span className="text-xs font-black text-indigo-600">{shop._count.orders}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {shop.status === 'PENDING' ? (
                                                    <>
                                                        <button
                                                            onClick={() => updateStatus(shop.id, 'ACTIVE')}
                                                            title=" Approve & Activate Shop"
                                                            className="h-9 w-9 flex items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-900/10 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all active:scale-95"
                                                        >
                                                            {actionLoading === shop.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-5 w-5" />}
                                                        </button>
                                                        <button
                                                            onClick={() => updateStatus(shop.id, 'REJECTED')}
                                                            title="Reject Registration"
                                                            className="h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-rose-100 text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-all"
                                                        >
                                                            <X className="h-5 w-5" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => updateStatus(shop.id, shop.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')}
                                                        className={clsx(
                                                            "h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border",
                                                            shop.status === 'ACTIVE'
                                                                ? "bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100"
                                                                : "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100"
                                                        )}
                                                    >
                                                        {shop.status === 'ACTIVE' ? 'Suspend' : 'Reactive'}
                                                    </button>
                                                )}

                                                <Link
                                                    href={`/${shop.slug}`}
                                                    target="_blank"
                                                    className="h-9 w-9 flex items-center justify-center rounded-xl bg-gray-900 text-white hover:bg-black transition-all shadow-lg shadow-gray-900/20"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Modern Pagination */}
                {totalPages > 1 && (
                    <div className="px-8 py-6 bg-gray-50/50 flex items-center justify-between border-t border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">
                            Halaman <span className="text-gray-900">{page}</span> dari <span className="text-gray-900">{totalPages}</span>
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                            >
                                Sebelumnya
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/10 active:scale-95"
                            >
                                Berikutnya
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Admin Notice */}
            <div className="flex items-center gap-3 p-5 bg-gradient-to-r from-gray-900 to-slate-800 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                    <ShieldCheck className="h-20 w-20 text-white" />
                </div>
                <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center flex-shrink-0 animate-bounce-slow">
                    <Info className="h-6 w-6 text-emerald-400" />
                </div>
                <div className="relative z-10">
                    <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1 leading-none">Prosedur Moderasi</h4>
                    <p className="text-[10px] sm:text-xs text-white/50 font-medium leading-relaxed max-w-2xl uppercase tracking-tighter">
                        Toko baru dengan status <span className="text-amber-400 font-bold">PENDING</span> memerlukan verifikasi data pemilik dan alamat sebelum disetujui.
                        Pastikan untuk melakukan verifikasi via <span className="text-emerald-400 font-bold">WhatsApp</span> jika diperlukan sebelum mengaktifkan toko.
                    </p>
                </div>
            </div>
        </div>
    );
}
