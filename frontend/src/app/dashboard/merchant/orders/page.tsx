'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Package,
    Search,
    Filter,
    Calendar,
    ChevronRight,
    ArrowLeft,
    MoreVertical,
    ShoppingBag,
    CheckCircle2,
    Clock,
    AlertCircle,
    BadgeCheck,
    Truck,
    Wallet,
    MessageCircle,
    User,
    ExternalLink,
    MapPin,
    XCircle
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import MerchantBottomNav from '@/components/merchant/MerchantBottomNav';
import { formatPrice, formatShortDate } from '@/utils/format';
import { getImageUrl } from '@/utils/image';
import { useMerchantSocket } from '@/hooks/useMerchantSocket';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface OrderUser {
    id: string;
    name: string;
    email: string;
    whatsapp?: string;
    image?: string;
}

interface OrderItem {
    id: string;
    productId: string;
    quantity: number;
    price: number;
    subtotal: number;
    product: {
        name: string;
        images?: { url: string }[];
    };
}

interface Order {
    id: string;
    paymentStatus: string;
    deliveryStatus?: string;
    createdAt: string;
    totalAmount: number;
    paymentMethod: string;
    paymentProof?: string;
    status: string;
    user: OrderUser;
    items: OrderItem[];
    shippingAddress?: {
        name: string;
        phone: string;
        address: string;
    };
}



export default function MerchantOrdersPage() {
    const { user } = useAuthStore();
    const { t } = useLanguage();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 20;

    const [stats, setStats] = useState<any>({ all: 0, pending: 0, paid: 0, processing: 0, shipped: 0, completed: 0, failed: 0 });

    const fetchOrders = async (silent = false, currentPage = page, currentStatus = statusFilter, currentSearch = searchTerm) => {
        try {
            if (!silent) setIsLoading(true);
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';
            const params = new URLSearchParams({
                page: String(currentPage),
                pageSize: String(pageSize),
                ...(currentStatus !== 'all' && { status: currentStatus }),
                ...(currentSearch.trim() && { search: currentSearch.trim() }),
            });
            const response = await axios.get(`${apiBaseUrl}/orders/shop?${params.toString()}`, {
                withCredentials: true,
                headers: { 'Accept': 'application/json' }
            });
            setOrders(response.data.data);
            setTotal(response.data.total);
            setTotalPages(response.data.totalPages);
            setStats(response.data.stats || { all: response.data.total });
        } catch (error: any) {
            console.error('Fetch error:', error);
            const message = error.response?.data?.message || error.message;
            toast.error(`Gagal mengambil data pesanan: ${message}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(false, 1, statusFilter, searchTerm);
        setPage(1);
    }, [statusFilter]);

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchOrders(false, 1, statusFilter, searchTerm);
            setPage(1);
        }, 400);
        return () => clearTimeout(debounce);
    }, [searchTerm]);

    useEffect(() => {
        fetchOrders(false, page, statusFilter, searchTerm);
    }, [page]);

    useEffect(() => {
        fetchOrders(false, 1);
    }, []);

    // Real-time: auto-refresh order list when a new order arrives
    useMerchantSocket({
        shopId: user?.shopId || null,
        onNewOrder: () => { fetchOrders(true, 1, statusFilter, searchTerm); setPage(1); }
    });

    const updateStatus = async (orderId: string, newStatus: string) => {
        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';
            await axios.patch(`${apiBaseUrl}/orders/${orderId}/status`,
                { paymentStatus: newStatus },
                { withCredentials: true }
            );
            toast.success('Status pesanan berhasil diperbarui');
            fetchOrders(true, page, statusFilter, searchTerm);
        } catch (error: any) {
            const message = error.response?.data?.message || error.message;
            toast.error(`Gagal memperbarui status: ${message}`);
            console.error(error);
        }
    };

    const handleCancelOrder = async (orderId: string) => {
        if (!window.confirm('Apakah Anda yakin ingin membatalkan pesanan ini? Stok akan dikembalikan otomatis.')) return;
        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';
            await axios.patch(`${apiBaseUrl}/orders/${orderId}/cancel`, {}, { withCredentials: true });
            toast.success('Pesanan berhasil dibatalkan');
            fetchOrders(true, page, statusFilter, searchTerm);
        } catch (err: any) {
            console.error('Error cancelling order:', err);
            toast.error(err.response?.data?.message || 'Gagal membatalkan pesanan');
        }
    };

    // Grouping only on current page data (already filtered server-side)
    const groupedOrders = orders.reduce((groups: { [key: string]: Order[] }, order) => {
        const dateKey = new Date(order.createdAt).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(order);
        return groups;
    }, {});

    const sortedDates = Object.keys(groupedOrders).sort((a, b) => {
        return new Date(groupedOrders[b][0].createdAt).getTime() - new Date(groupedOrders[a][0].createdAt).getTime();
    });

    const isToday = (dateStr: string) => {
        const today = new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        return dateStr === today;
    };

    const isYesterday = (dateStr: string) => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        return dateStr === yesterdayStr;
    };

    const getStatusStyles = (status: string, paymentMethod?: string, hasProof: boolean = false, orderStatus: string = 'pending') => {
        if (orderStatus === 'cancelled') {
            return {
                bg: 'bg-red-50',
                text: 'text-red-700',
                border: 'border-red-100',
                label: t('status.cancelled').toUpperCase(),
                icon: AlertCircle
            };
        }

        switch (status) {
            case 'pending':
                if (hasProof) {
                    return {
                        bg: 'bg-orange-50',
                        text: 'text-orange-700',
                        border: 'border-orange-100',
                        label: 'MENUNGGU VERIFIKASI',
                        icon: Clock
                    };
                }
                if (paymentMethod === 'cod') {
                    return {
                        bg: 'bg-yellow-50',
                        text: 'text-yellow-700',
                        border: 'border-yellow-100',
                        label: t('status.pending_cod').toUpperCase(),
                        icon: Clock
                    };
                }
                return {
                    bg: 'bg-amber-50',
                    text: 'text-amber-700',
                    border: 'border-amber-100',
                    label: t('status.pending_transfer').toUpperCase(),
                    icon: Clock
                };
            case 'paid':
                return {
                    bg: 'bg-blue-50',
                    text: 'text-blue-700',
                    border: 'border-blue-100',
                    label: t('status.paid').toUpperCase(),
                    icon: CheckCircle2
                };
            case 'processing':
                return {
                    bg: 'bg-purple-50',
                    text: 'text-purple-700',
                    border: 'border-purple-100',
                    label: t('status.processing').toUpperCase(),
                    icon: Package
                };
            case 'shipped':
                return {
                    bg: 'bg-indigo-50',
                    text: 'text-indigo-700',
                    border: 'border-indigo-100',
                    label: t('status.shipped').toUpperCase(),
                    icon: Truck
                };
            case 'completed':
                return {
                    bg: 'bg-emerald-50',
                    text: 'text-emerald-700',
                    border: 'border-emerald-100',
                    label: t('status.completed').toUpperCase(),
                    icon: CheckCircle2
                };
            case 'failed':
                return {
                    bg: 'bg-red-50',
                    text: 'text-red-700',
                    border: 'border-red-100',
                    label: t('status.failed').toUpperCase(),
                    icon: AlertCircle
                };
            default:
                return {
                    bg: 'bg-gray-50',
                    text: 'text-gray-700',
                    border: 'border-gray-100',
                    label: status.toUpperCase(),
                    icon: Package
                };
        }
    };

    return (
        <div className="min-h-screen pb-24 lg:pb-8 font-[family-name:var(--font-poppins)]">
            {/* Header Area - More Compact */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="w-full px-2 sm:px-6 lg:px-8">
                    <div className="flex flex-col py-4 gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/dashboard/merchant"
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                                <div>
                                    <h1 className="text-sm sm:text-xl font-bold text-gray-900 leading-tight">Pesanan Toko</h1>
                                    <p className="text-xs text-gray-500">Kelola pesanan masuk</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => fetchOrders()}
                                    className="p-2 bg-[#1B5E20] text-white rounded-lg hover:bg-green-800 transition-all shadow-sm active:scale-95"
                                    title="Refresh Data"
                                >
                                    <Clock className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Validated Search & Filter - Compact */}
                        <div className="flex flex-col gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari ID, Nama Pembeli..."
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm focus:ring-1 focus:ring-[#1B5E20] focus:border-[#1B5E20] outline-none transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                                {['all', 'pending', 'paid', 'processing', 'shipped', 'completed', 'failed'].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setStatusFilter(s)}
                                        className={clsx(
                                            "whitespace-nowrap px-3 py-1.5 rounded-lg text-xs sm:text-xs font-semibold border transition-all flex items-center gap-1.5",
                                            statusFilter === s
                                                ? "bg-[#1B5E20] text-white border-[#1B5E20]"
                                                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                                        )}
                                    >
                                        <span>
                                            {s === 'all' ? t('merchant.tab_all') :
                                                s === 'pending' ? t('merchant.tab_pending') :
                                                    s === 'paid' ? t('merchant.tab_paid') :
                                                        s === 'processing' ? t('merchant.tab_processing') :
                                                            s === 'shipped' ? t('merchant.tab_shipped') :
                                                                s === 'completed' ? t('merchant.tab_completed') : t('merchant.tab_failed')}
                                        </span>
                                        <span className={clsx(
                                            "text-[10px] px-1.5 py-0.5 rounded-full",
                                            statusFilter === s ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                                        )}>
                                            {stats[s] || 0}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full px-2 sm:px-6 lg:px-8 py-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="h-8 w-8 border-2 border-gray-200 border-t-[#1B5E20] rounded-full animate-spin mb-3"></div>
                        <p className="text-sm text-gray-500 font-medium">{t('merchant.loading')}</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
                        <div className="bg-gray-50 mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3">
                            <ShoppingBag className="h-6 w-6 text-gray-300" />
                        </div>
                        <p className="text-gray-900 font-semibold text-sm">{t('merchant.empty_title')}</p>
                        <p className="text-xs text-gray-500">{t('merchant.empty_sub')}</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {sortedDates.map((date) => (
                            <div key={date} className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className={clsx(
                                        "px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-black tracking-widest uppercase shadow-sm border transition-all",
                                        isToday(date)
                                            ? "bg-[#1B5E20] text-white border-[#1B5E20] ring-4 ring-green-50 animate-in fade-in slide-in-from-left-4"
                                            : isYesterday(date)
                                                ? "bg-amber-500 text-white border-amber-500"
                                                : "bg-white text-gray-500 border-gray-200"
                                    )}>
                                        {isToday(date) ? 'Hari Ini' : isYesterday(date) ? 'Kemarin' : date}
                                    </div>
                                    <div className="h-px flex-1 bg-gray-100"></div>
                                    <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">{groupedOrders[date].length} Pesanan</span>
                                </div>

                                <div className="grid gap-4">
                                    {groupedOrders[date].map((order) => {
                                        const statusStyle = getStatusStyles(order.paymentStatus, order.paymentMethod, !!order.paymentProof, order.status);
                                        const StatusIcon = statusStyle.icon;

                                        return (
                                            <div
                                                key={order.id}
                                                className={clsx(
                                                    "bg-white rounded-xl border overflow-hidden hover:shadow-md transition-all duration-200",
                                                    isToday(date) ? "border-green-100 shadow-sm" : "border-gray-200"
                                                )}
                                            >
                                                {/* Compact Header */}
                                                <div className={clsx(
                                                    "px-4 py-2 border-b flex flex-wrap items-center justify-between gap-y-1",
                                                    isToday(date) ? "bg-green-50/30 border-green-50" : "bg-gray-50/50 border-gray-100"
                                                )}>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-gray-900">#{order.id.slice(-8).toUpperCase()}</span>
                                                                <span className="text-xs text-gray-400">•</span>
                                                                <span className="text-xs text-gray-500 font-medium font-mono">{new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <User className="h-3 w-3 text-gray-400" />
                                                                <span className="text-xs text-gray-600 font-medium truncate max-w-[150px]">{order.user.name}</span>
                                                                {(() => {
                                                                    const phone = order.user.whatsapp || order.shippingAddress?.phone;
                                                                    if (!phone) return null;
                                                                    const formattedPhone = phone.replace(/\D/g, '').replace(/^0/, '62').replace(/^8/, '628');
                                                                    const finalPhone = formattedPhone.startsWith('62') ? formattedPhone : `62${formattedPhone}`;

                                                                    return (
                                                                        <a
                                                                            href={`https://wa.me/${finalPhone}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="ml-1 text-[#25D366] hover:text-[#128C7E] flex items-center"
                                                                            title="Chat WhatsApp"
                                                                        >
                                                                            <MessageCircle className="h-3 w-3" />
                                                                        </a>
                                                                    );
                                                                })()}
                                                            </div>
                                                            {/* Shipping Address */}
                                                            <div className="flex items-start gap-1">
                                                                <MapPin className="h-3 w-3 text-gray-400 mt-0.5" />
                                                                <span className="text-xs text-gray-500 font-medium max-w-[200px] sm:max-w-md truncate">
                                                                    {order.shippingAddress?.address || 'Alamat tidak tersedia'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className={clsx(
                                                        "px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 border",
                                                        statusStyle.bg, statusStyle.text, statusStyle.border
                                                    )}>
                                                        <StatusIcon className="h-3 w-3" />
                                                        {statusStyle.label}
                                                    </div>
                                                </div>

                                                {/* Compact Content */}
                                                <div className="p-4 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                                                    {/* Products Preview - Stacked compact */}
                                                    <div className="flex-1 space-y-2 min-w-0">
                                                        {order.items.slice(0, 2).map((item) => (
                                                            <div key={item.id} className="flex items-center gap-2">
                                                                <div className="h-9 w-9 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                                                                    {item.product.images?.[0] ? (
                                                                        <img
                                                                            src={getImageUrl(item.product.images[0].url) || ''}
                                                                            alt={item.product.name}
                                                                            className="h-full w-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="h-full w-full flex items-center justify-center"><Package className="h-4 w-4 text-gray-300" /></div>
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="text-xs font-semibold text-gray-900 truncate">{item.product.name}</p>
                                                                    <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                                                        <span className="font-medium text-gray-700">{item.quantity}x</span>
                                                                        <span className="mx-1 text-gray-300">|</span>
                                                                        <span>{formatPrice(item.price)}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="text-xs font-semibold text-gray-900 tabular-nums">
                                                                    {formatPrice(item.subtotal)}
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {order.items.length > 2 && (
                                                            <p className="text-xs text-gray-400 font-medium pl-14">+{order.items.length - 2} produk lainnya</p>
                                                        )}
                                                    </div>

                                                    {/* Divider on mobile */}
                                                    <div className="h-px bg-gray-100 sm:hidden"></div>

                                                    {/* Total & Actions */}
                                                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-3 sm:gap-1.5 sm:min-w-[144px] shrink-0">
                                                        <div className="text-right">
                                                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Total Belanja</p>
                                                            <p className="text-sm font-bold text-[#1B5E20]">{formatPrice(order.totalAmount)}</p>
                                                        </div>

                                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                                            {/* Cancel Button for Merchant */}
                                                            {!['shipped', 'delivered', 'completed', 'cancelled', 'failed'].includes(order.paymentStatus) && (
                                                                <button
                                                                    onClick={() => handleCancelOrder(order.id)}
                                                                    className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100 hover:bg-red-100 transition-all flex items-center justify-center gap-1.5"
                                                                    title="Batalkan Pesanan"
                                                                >
                                                                    <XCircle className="h-3.5 w-3.5" />
                                                                    <span>Batalkan</span>
                                                                </button>
                                                            )}

                                                            {/* Action Buttons */}
                                                            {order.paymentStatus === 'pending' && (
                                                                <div className="flex flex-col gap-2 w-full sm:w-auto">
                                                                    {order.paymentProof && (
                                                                        <div className="flex items-center gap-1 text-[10px] text-[#1B5E20] font-black bg-green-50 px-2 py-0.5 rounded border border-green-100 animate-pulse">
                                                                            <CheckCircle2 className="h-2.5 w-2.5" />
                                                                            BUKTI BAYAR ADA
                                                                        </div>
                                                                    )}
                                                                    <button
                                                                        onClick={async () => {
                                                                            if (order.paymentMethod === 'cod') {
                                                                                updateStatus(order.id, 'processing');
                                                                            } else {
                                                                                try {
                                                                                    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';
                                                                                    await axios.patch(`${apiBaseUrl}/orders/${order.id}/verify-payment`, {}, { withCredentials: true });
                                                                                    toast.success('Pembayaran diverifikasi');
                                                                                    fetchOrders();
                                                                                } catch (err) { toast.error('Gagal verifikasi'); }
                                                                            }
                                                                        }}
                                                                        className="flex-1 sm:flex-none px-3 py-1.5 bg-[#1B5E20] text-white text-xs font-semibold rounded-lg hover:bg-green-800 transition-colors shadow-sm"
                                                                    >
                                                                        {order.paymentMethod === 'cod' ? t('btn.confirm') : t('btn.verify')}
                                                                    </button>
                                                                </div>
                                                            )}

                                                            {order.paymentStatus === 'paid' && (
                                                                <button
                                                                    onClick={() => updateStatus(order.id, 'processing')}
                                                                    className="flex-1 sm:flex-none px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                                                                >
                                                                    {t('btn.process')}
                                                                </button>
                                                            )}

                                                            {order.paymentStatus === 'processing' && (
                                                                <button
                                                                    onClick={() => updateStatus(order.id, 'shipped')}
                                                                    className="flex-1 sm:flex-none px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                                                                >
                                                                    {t('btn.ship')}
                                                                </button>
                                                            )}

                                                            {order.paymentStatus === 'shipped' && (
                                                                <button
                                                                    onClick={() => updateStatus(order.id, 'completed')}
                                                                    className="flex-1 sm:flex-none px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                                                                >
                                                                    {t('btn.done')}
                                                                </button>
                                                            )}

                                                            {(() => {
                                                                const phone = order.user.whatsapp || order.shippingAddress?.phone;
                                                                if (!phone) return null;
                                                                const formattedPhone = phone.replace(/\D/g, '').replace(/^0/, '62').replace(/^8/, '628');
                                                                const finalPhone = formattedPhone.startsWith('62') ? formattedPhone : `62${formattedPhone}`;

                                                                return (
                                                                    <a
                                                                        href={`https://wa.me/${finalPhone}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="px-3 py-1.5 bg-[#25D366] text-white text-xs font-bold rounded-lg hover:bg-[#128C7E] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                                                                    >
                                                                        <MessageCircle className="h-3.5 w-3.5" />
                                                                        <span className="hidden xs:inline">Chat</span>
                                                                    </a>
                                                                );
                                                            })()}

                                                            <Link
                                                                href={`/dashboard/merchant/orders/${order.id}`}
                                                                className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center text-center"
                                                            >
                                                                {t('btn.detail')}
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* COD Badge if applicable */}
                                                {order.paymentMethod === 'cod' && (
                                                    <div className="bg-orange-50 px-4 py-1 border-t border-orange-100 flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5 text-orange-700">
                                                            <Wallet className="h-3 w-3" />
                                                            <span className="text-xs font-black uppercase tracking-wide">{t('merchant.cod_note')}</span>
                                                        </div>
                                                        <span className="text-[11px] text-orange-600/80 font-bold">{t('merchant.cod_reminder')}</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 mt-2">
                    <span className="text-xs text-gray-500">
                        {total} pesanan &bull; Hal {page} dari {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                        >
                            ← Sebelumnya
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                        >
                            Selanjutnya →
                        </button>
                    </div>
                </div>
            )}

            <MerchantBottomNav />
        </div>
    );
}

