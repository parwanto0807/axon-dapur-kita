'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from "@/store/authStore";
import { useRouter } from 'next/navigation';
import {
    Package, Search, Filter, ChevronRight,
    Clock, CheckCircle, CheckCircle2, XCircle, Truck,
    CreditCard, ArrowLeft, LayoutDashboard,
    ShoppingBag, Calendar, MapPin, Store,
    Loader2, AlertCircle
} from "lucide-react";
import axios from 'axios';
import Link from 'next/link';
import clsx from 'clsx';
import { useBuyerSocket } from '@/hooks/useBuyerSocket';
import { formatPrice, formatShortDate } from '@/utils/format';
import { getImageUrl } from '@/utils/image';

interface OrderItem {
    id: string;
    product: {
        name: string;
        images: { url: string }[];
    };
    quantity: number;
    price: number;
    subtotal: number;
}

interface Order {
    id: string;
    createdAt: string;
    totalAmount: number;
    paymentStatus: string;
    paymentMethod: string;
    shop: {
        name: string;
        slug: string;
    };
    items: OrderItem[];
}

export default function OrdersPage() {
    const { isLoggedIn, isLoading: isAuthLoading } = useAuthStore();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (isAuthLoading) return;
        if (!isLoggedIn) {
            router.push('/login?redirect=/dashboard/orders');
            return;
        }
        fetchOrders();
    }, [isLoggedIn, isAuthLoading, router]);

    // Listen for real-time order updates
    useBuyerSocket(() => {
        fetchOrders();
    }, { notify: false });

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const response = await axios.get(`${apiBaseUrl}/orders/my`, { withCredentials: true });
            setOrders(response.data);
        } catch (err: any) {
            console.error('Error fetching orders:', err);
            setError('Gagal memuat daftar pesanan.');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusStyle = (status: string, method: string = '') => {
        switch (status.toLowerCase()) {
            case 'paid':
                return {
                    bg: 'bg-green-100',
                    text: 'text-green-700',
                    icon: CheckCircle,
                    label: 'Dibayar',
                    border: 'border-green-200'
                };
            case 'pending':
                // Check if COD
                if (method === 'cod') {
                    return {
                        bg: 'bg-orange-100',
                        text: 'text-orange-700',
                        icon: Clock, // Or maybe a different icon?
                        label: 'Menunggu Konfirmasi',
                        border: 'border-orange-200'
                    };
                }
                return {
                    bg: 'bg-yellow-100',
                    text: 'text-yellow-700',
                    icon: Clock,
                    label: 'Menunggu Pembayaran',
                    border: 'border-yellow-200'
                };
            case 'failed':
            case 'expired':
                return {
                    bg: 'bg-red-100',
                    text: 'text-red-700',
                    icon: XCircle,
                    label: 'Gagal / Kadaluarsa',
                    border: 'border-red-200'
                };
            case 'processing':
                return {
                    bg: 'bg-blue-50',
                    text: 'text-blue-700',
                    icon: Package,
                    label: 'Diproses Penjual',
                    border: 'border-blue-200'
                };
            case 'shipped':
                return {
                    bg: 'bg-indigo-50',
                    text: 'text-indigo-700',
                    icon: Truck,
                    label: 'Sedang Dikirim',
                    border: 'border-indigo-200'
                };
            case 'completed':
                return {
                    bg: 'bg-green-100',
                    text: 'text-green-700',
                    icon: CheckCircle2,
                    label: 'Selesai',
                    border: 'border-green-200'
                };
            default:
                return {
                    bg: 'bg-gray-100',
                    text: 'text-gray-700',
                    icon: Package,
                    label: status,
                    border: 'border-gray-200'
                };
        }
    };

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        return order.paymentStatus.toLowerCase() === filter.toLowerCase();
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 text-[#1B5E20] animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Memuat daftar pesanan...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-poppins)]">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-40">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </Link>
                        <h1 className="font-bold text-gray-900 text-sm sm:text-lg">Pesanan Saya</h1>
                    </div>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-2 sm:px-4 py-3 sm:py-8">
                {/* Stats / Quick Info */}
                <div className="grid grid-cols-4 gap-1.5 sm:gap-4 mb-4 sm:mb-8">
                    <button
                        onClick={() => setFilter('all')}
                        className={clsx(
                            "p-2 sm:p-4 rounded-xl sm:rounded-2xl border transition-all text-left",
                            filter === 'all' ? "bg-[#1B5E20] text-white border-[#1B5E20] shadow-lg shadow-[#1B5E20]/20" : "bg-white text-gray-600 border-gray-100 hover:border-gray-200 shadow-sm"
                        )}
                    >
                        <Package className={clsx("h-3.5 w-3.5 sm:h-5 sm:w-5 mb-1 sm:mb-2", filter === 'all' ? "text-green-200" : "text-[#1B5E20]")} />
                        <p className="text-[6px] sm:text-[10px] font-bold uppercase tracking-wider opacity-80 leading-none mb-0.5">Semua</p>
                        <p className="text-xs sm:text-xl font-black leading-none">{orders.length}</p>
                    </button>

                    <button
                        onClick={() => setFilter('pending')}
                        className={clsx(
                            "p-2 sm:p-4 rounded-xl sm:rounded-2xl border transition-all text-left",
                            filter === 'pending' ? "bg-yellow-500 text-white border-yellow-500 shadow-lg shadow-yellow-500/20" : "bg-white text-gray-600 border-gray-100 hover:border-gray-200 shadow-sm"
                        )}
                    >
                        <CreditCard className={clsx("h-3.5 w-3.5 sm:h-5 sm:w-5 mb-1 sm:mb-2", filter === 'pending' ? "text-yellow-100" : "text-yellow-500")} />
                        <p className="text-[6px] sm:text-[10px] font-bold uppercase tracking-wider opacity-80 leading-none mb-0.5">Bayar</p>
                        <p className="text-xs sm:text-xl font-black leading-none">{orders.filter(o => o.paymentStatus === 'pending').length}</p>
                    </button>

                    <button
                        onClick={() => setFilter('paid')}
                        className={clsx(
                            "p-2 sm:p-4 rounded-xl sm:rounded-2xl border transition-all text-left",
                            filter === 'paid' ? "bg-green-600 text-white border-green-600 shadow-lg shadow-green-600/20" : "bg-white text-gray-600 border-gray-100 hover:border-gray-200 shadow-sm"
                        )}
                    >
                        <CheckCircle className={clsx("h-3.5 w-3.5 sm:h-5 sm:w-5 mb-1 sm:mb-2", filter === 'paid' ? "text-green-100" : "text-green-600")} />
                        <p className="text-[6px] sm:text-[10px] font-bold uppercase tracking-wider opacity-80 leading-none mb-0.5">Lunas</p>
                        <p className="text-xs sm:text-xl font-black leading-none">{orders.filter(o => o.paymentStatus === 'paid').length}</p>
                    </button>

                    <button
                        className="p-2 sm:p-4 rounded-xl sm:rounded-2xl border bg-white text-gray-400 border-gray-100 shadow-sm cursor-not-allowed opacity-60 flex flex-col justify-start"
                        disabled
                    >
                        <Truck className="h-3.5 w-3.5 sm:h-5 sm:w-5 mb-1 sm:mb-2" />
                        <p className="text-[6px] sm:text-[10px] font-bold uppercase tracking-wider leading-none mb-0.5">Dikirim</p>
                        <p className="text-xs sm:text-xl font-black leading-none">0</p>
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center space-x-3 text-red-600">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                <div className="space-y-4">
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => {
                            const status = getStatusStyle(order.paymentStatus, order.paymentMethod);
                            const StatusIcon = status.icon;

                            return (
                                <div key={order.id} className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                                    <div className="py-2.5 px-3.5 sm:p-6">
                                        {/* Order Meta Info */}
                                        <div className="flex items-center justify-between gap-2 mb-2 sm:mb-6">
                                            <div className="flex items-center space-x-2.5 sm:space-x-4">
                                                <div className="h-8 w-8 sm:h-12 sm:w-12 bg-gray-50 rounded-lg sm:rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-[#1B5E20]/10 group-hover:text-[#1B5E20] transition-colors shrink-0">
                                                    <ShoppingBag className="h-4 w-4 sm:h-6 sm:w-6" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center space-x-1.5 leading-none">
                                                        <span className="text-[6px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest hidden xs:inline">Order ID</span>
                                                        <span className="text-[7px] sm:text-xs font-black text-gray-900 bg-gray-100 px-1 py-0.5 rounded-md">#{order.id.slice(-6).toUpperCase()}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 mt-0.5 text-[6px] sm:text-xs text-gray-500 font-medium leading-none">
                                                        <span className="flex items-center truncate max-w-[80px] sm:max-w-none"><Store className="h-2 w-2 sm:h-3 sm:w-3 mr-0.5" /> {order.shop.name}</span>
                                                        <span className="h-0.5 w-0.5 bg-gray-300 rounded-full"></span>
                                                        <span className="flex items-center whitespace-nowrap"><Calendar className="h-2 w-2 sm:h-3 sm:w-3 mr-0.5" /> {formatShortDate(order.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={clsx(
                                                "flex items-center space-x-1 px-1 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg border text-[6px] sm:text-xs font-black transition-all whitespace-nowrap",
                                                status.bg,
                                                status.text,
                                                status.border
                                            )}>
                                                <StatusIcon className="h-2 w-2 sm:h-4 sm:w-4" />
                                                <span>{status.label}</span>
                                            </div>
                                        </div>

                                        {/* Products Preview */}
                                        <div className="space-y-2 mb-3 sm:mb-6">
                                            {order.items.slice(0, 1).map((item) => {
                                                const productImage = item.product.images?.[0]?.url;
                                                return (
                                                    <div key={item.id} className="flex items-center space-x-2.5 sm:space-x-4">
                                                        <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-lg sm:rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                                                            {productImage ? (
                                                                <img
                                                                    src={getImageUrl(productImage)}
                                                                    alt={item.product.name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center text-gray-300">
                                                                    <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-gray-900 truncate text-[9px] sm:text-base leading-tight">{item.product.name}</h4>
                                                            <p className="text-[7px] sm:text-xs text-gray-500 mt-0.5 leading-none">{item.quantity} x {formatPrice(item.price)}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {order.items.length > 1 && (
                                                <p className="text-[7px] sm:text-[9px] text-gray-400 font-medium pl-12.5 sm:pl-18">+ {order.items.length - 1} produk lainnya</p>
                                            )}
                                        </div>

                                        {/* Total & Action */}
                                        <div className="flex items-center justify-between pt-2 sm:pt-5 border-t border-gray-50">
                                            <div>
                                                <p className="text-[5px] sm:text-xs text-gray-400 font-bold uppercase tracking-widest leading-none mb-0.5">Total Belanja</p>
                                                <p className="text-[11px] sm:text-lg font-black text-[#1B5E20] leading-none">{formatPrice(order.totalAmount)}</p>
                                            </div>
                                            <Link
                                                href={`/dashboard/orders/${order.id}`}
                                                className="flex items-center space-x-1 px-2.5 sm:px-6 py-1.5 sm:py-2.5 bg-gray-900 text-white text-[7px] sm:text-xs font-bold rounded-lg sm:rounded-xl hover:bg-gray-800 transition-all active:scale-95"
                                            >
                                                <span>Detail</span>
                                                <ChevronRight className="h-2 w-2 sm:h-4 sm:w-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="bg-white rounded-[2.5rem] p-12 text-center border border-gray-100 shadow-sm">
                            <div className="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShoppingBag className="h-10 w-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">Belum ada pesanan</h3>
                            <p className="text-sm text-gray-500 font-medium mb-8 max-w-xs mx-auto">
                                Sepertinya Anda belum melakukan transaksi apapun. Yuk mulai belanja!
                            </p>
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center space-x-2 px-8 py-4 bg-[#1B5E20] text-white font-bold rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-100 active:scale-95"
                            >
                                <LayoutDashboard className="h-5 w-5" />
                                <span>Belanja Sekarang</span>
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
