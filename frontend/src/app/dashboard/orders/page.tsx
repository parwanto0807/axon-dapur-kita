'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    ShoppingBag,
    ChevronRight,
    Calendar,
    Store,
    CheckCircle,
    Clock,
    AlertCircle,
    Truck,
    Search,
    Package,
    LayoutDashboard,
    CreditCard
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import { clsx } from 'clsx';
import { useBuyerSocket } from '@/hooks/useBuyerSocket';
import { formatPrice, formatShortDate } from '@/utils/format';
import { getImageUrl } from '@/utils/image';
import ReviewModal from '@/components/features/ReviewModal';
import StarRating from '@/components/ui/StarRating';
import { useLanguage } from '@/contexts/LanguageContext';

interface OrderItem {
    id: string;
    productId: string;
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
    totalAmount: number;
    paymentStatus: string;
    deliveryStatus: string;
    paymentMethod: string;
    createdAt: string;
    status: string;
    shop: {
        name: string;
    };
    items: OrderItem[];
}

export default function OrdersPage() {
    const { user, isLoading: isAuthLoading } = useAuthStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');

    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [currentOrderId, setCurrentOrderId] = useState<string>('');

    const { t } = useLanguage();

    const fetchOrders = useCallback(async () => {
        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';
            const res = await axios.get(`${apiBaseUrl}/orders/my-orders`, {
                withCredentials: true
            });
            setOrders(res.data);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Gagal memuat pesanan');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Real-time updates — auto-refresh list when seller updates order status
    useBuyerSocket(fetchOrders);

    useEffect(() => {
        if (isAuthLoading) return;
        fetchOrders();
    }, [isAuthLoading]);


    const getStatusStyle = (paymentStatus: string, method: string) => {
        if (paymentStatus === 'pending') {
            if (method === 'cod') {
                return {
                    label: t('status.pending_cod'),
                    bg: 'bg-yellow-50',
                    text: 'text-yellow-700',
                    border: 'border-yellow-200',
                    icon: Clock
                };
            }
            return {
                label: t('status.pending_transfer'),
                bg: 'bg-yellow-50',
                text: 'text-yellow-700',
                border: 'border-yellow-200',
                icon: Clock
            };
        }
        if (paymentStatus === 'paid') {
            return {
                label: t('status.paid'),
                bg: 'bg-blue-50',
                text: 'text-blue-700',
                border: 'border-blue-200',
                icon: CheckCircle
            };
        }
        if (paymentStatus === 'processing') {
            return {
                label: t('status.processing'),
                bg: 'bg-purple-50',
                text: 'text-purple-700',
                border: 'border-purple-200',
                icon: Package
            };
        }
        if (paymentStatus === 'shipped') {
            return {
                label: t('status.shipped'),
                bg: 'bg-indigo-50',
                text: 'text-indigo-700',
                border: 'border-indigo-200',
                icon: Truck
            };
        }
        if (paymentStatus === 'completed') {
            return {
                label: t('status.completed'),
                bg: 'bg-green-50',
                text: 'text-green-700',
                border: 'border-green-200',
                icon: CheckCircle
            };
        }
        if (paymentStatus === 'failed') {
            return {
                label: t('status.failed'),
                bg: 'bg-red-50',
                text: 'text-red-700',
                border: 'border-red-200',
                icon: AlertCircle
            };
        }
        return {
            label: paymentStatus,
            bg: 'bg-gray-50',
            text: 'text-gray-700',
            border: 'border-gray-200',
            icon: Package
        };
    };

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        if (filter === 'pending') return order.paymentStatus === 'pending';
        if (filter === 'paid') return order.paymentStatus === 'paid';
        return true;
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B5E20]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-poppins)] pb-24 lg:pb-12">
            <header className="bg-white border-b sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <h1 className="text-lg font-black text-gray-900 tracking-tight">Pesanan Saya</h1>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-6">
                {/* Stats / Filter Tabs */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                    <button
                        onClick={() => setFilter('all')}
                        className={clsx(
                            "p-2 sm:p-4 rounded-xl sm:rounded-2xl border transition-all text-left",
                            filter === 'all' ? "bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-900/20" : "bg-white text-gray-600 border-gray-100 hover:border-gray-200 shadow-sm"
                        )}
                    >
                        <ShoppingBag className={clsx("h-3.5 w-3.5 sm:h-5 sm:w-5 mb-1 sm:mb-2", filter === 'all' ? "text-gray-400" : "text-gray-400")} />
                        <p className="text-[10px] sm:text-[10px] font-bold uppercase tracking-wider opacity-80 leading-none mb-0.5">Semua</p>
                        <p className="text-sm sm:text-xl font-black leading-none">{orders.length}</p>
                    </button>

                    <button
                        onClick={() => setFilter('pending')}
                        className={clsx(
                            "p-2 sm:p-4 rounded-xl sm:rounded-2xl border transition-all text-left",
                            filter === 'pending' ? "bg-yellow-500 text-white border-yellow-500 shadow-lg shadow-yellow-500/20" : "bg-white text-gray-600 border-gray-100 hover:border-gray-200 shadow-sm"
                        )}
                    >
                        <CreditCard className={clsx("h-3.5 w-3.5 sm:h-5 sm:w-5 mb-1 sm:mb-2", filter === 'pending' ? "text-yellow-100" : "text-yellow-500")} />
                        <p className="text-[10px] sm:text-[10px] font-bold uppercase tracking-wider opacity-80 leading-none mb-0.5">Bayar</p>
                        <p className="text-sm sm:text-xl font-black leading-none">{orders.filter(o => o.paymentStatus === 'pending').length}</p>
                    </button>

                    <button
                        onClick={() => setFilter('paid')}
                        className={clsx(
                            "p-2 sm:p-4 rounded-xl sm:rounded-2xl border transition-all text-left",
                            filter === 'paid' ? "bg-green-600 text-white border-green-600 shadow-lg shadow-green-600/20" : "bg-white text-gray-600 border-gray-100 hover:border-gray-200 shadow-sm"
                        )}
                    >
                        <CheckCircle className={clsx("h-3.5 w-3.5 sm:h-5 sm:w-5 mb-1 sm:mb-2", filter === 'paid' ? "text-green-100" : "text-green-600")} />
                        <p className="text-[10px] sm:text-[10px] font-bold uppercase tracking-wider opacity-80 leading-none mb-0.5">Lunas</p>
                        <p className="text-sm sm:text-xl font-black leading-none">{orders.filter(o => o.paymentStatus === 'paid').length}</p>
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
                                <div key={order.id} className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group p-4 sm:p-6">
                                    {/* Order Meta Info */}
                                    <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
                                        <div className="flex items-center space-x-2.5 sm:space-x-4">
                                            <div className="h-8 w-8 sm:h-12 sm:w-12 bg-gray-50 rounded-lg sm:rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-[#1B5E20]/10 group-hover:text-[#1B5E20] transition-colors shrink-0">
                                                <ShoppingBag className="h-4 w-4 sm:h-6 sm:w-6" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center space-x-1.5 leading-none">
                                                    <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest hidden xs:inline">Order ID</span>
                                                    <span className="text-[10px] sm:text-xs font-black text-gray-900 bg-gray-100 px-1 py-0.5 rounded-md">#{order.id.slice(-6).toUpperCase()}</span>
                                                </div>
                                                <div className="flex items-center space-x-2 mt-1 text-[10px] sm:text-xs text-gray-500 font-medium leading-none">
                                                    <span className="flex items-center truncate max-w-[100px] sm:max-w-none"><Store className="h-3 w-3 sm:h-3 sm:w-3 mr-1" /> {order.shop.name}</span>
                                                    <span className="h-0.5 w-0.5 bg-gray-300 rounded-full"></span>
                                                    <span className="flex items-center whitespace-nowrap"><Calendar className="h-3 w-3 sm:h-3 sm:w-3 mr-1" /> {formatShortDate(order.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={clsx(
                                            "flex items-center space-x-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg border text-[10px] sm:text-xs font-black transition-all whitespace-nowrap",
                                            status.bg,
                                            status.text,
                                            status.border
                                        )}>
                                            <StatusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                                            <span>{status.label}</span>
                                        </div>
                                    </div>

                                    {/* Products Preview */}
                                    <div className="space-y-2 mb-4">
                                        {order.items.slice(0, 1).map((item) => {
                                            const productImage = item.product.images?.[0]?.url;
                                            return (
                                                <div key={item.id} className="flex items-center space-x-3">
                                                    <div className="h-12 w-12 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                                                        {productImage ? (
                                                            <img
                                                                src={getImageUrl(productImage)}
                                                                alt={item.product.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center text-gray-200">
                                                                <Package className="h-5 w-5" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-gray-900 truncate text-xs sm:text-sm">{item.product.name}</h4>
                                                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{item.quantity} x {formatPrice(item.price)}</p>

                                                        {order.paymentStatus === 'paid' && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedProduct({
                                                                        id: item.productId,
                                                                        name: item.product.name,
                                                                        image: getImageUrl(productImage) || ''
                                                                    });
                                                                    setCurrentOrderId(order.id);
                                                                    setIsReviewModalOpen(true);
                                                                }}
                                                                className="mt-2 inline-flex items-center space-x-1 px-3 py-1 bg-[#1B5E20]/5 text-[#1B5E20] text-[10px] font-bold rounded-lg hover:bg-[#1B5E20]/10 transition-colors"
                                                            >
                                                                <StarRating rating={0} size={10} />
                                                                <span>Beri Ulasan</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {order.items.length > 1 && (
                                            <p className="text-[10px] text-gray-400 font-medium pl-15">+ {order.items.length - 1} produk lainnya</p>
                                        )}
                                    </div>

                                    {/* Total & Action */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                        <div>
                                            <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Total Belanja</p>
                                            <p className="text-sm sm:text-lg font-black text-[#1B5E20] leading-none">{formatPrice(order.totalAmount)}</p>
                                        </div>
                                        <Link
                                            href={`/dashboard/orders/${order.id}`}
                                            className="flex items-center space-x-1 px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-900 text-white text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl hover:bg-gray-800 transition-all active:scale-95"
                                        >
                                            <span>Detail</span>
                                            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </Link>
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

            {selectedProduct && (
                <ReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    product={selectedProduct}
                    orderId={currentOrderId}
                    onSuccess={fetchOrders}
                />
            )}
        </div>
    );
}
