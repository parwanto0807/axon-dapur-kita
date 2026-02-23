'use client';

import Image from 'next/image';

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
    // Search,
    Package,
    LayoutDashboard,
    CreditCard,
    MessageCircle,
    XCircle
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import { toast } from 'react-hot-toast';
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
    hasReview: boolean;
}

interface Order {
    id: string;
    totalAmount: number;
    paymentStatus: string;
    paymentMethod: string;
    createdAt: string;
    status: string;
    deliveryStatus: string;
    shopId: string;
    hasShopReview: boolean;
    shop: {
        name: string;
        logo?: string;
        owner?: {
            whatsapp?: string;
        };
    };
    paymentProof?: string;
    items: OrderItem[];
}

export default function OrdersPage() {
    const { isLoading: isAuthLoading } = useAuthStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 20;

    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<{ id: string, name: string, image: string, shopId?: string } | null>(null);
    const [currentOrderId, setCurrentOrderId] = useState<string>('');

    const { t } = useLanguage();

    const [stats, setStats] = useState<any>({ all: 0, pending: 0, paid: 0 });

    const fetchOrders = useCallback(async (currentPage = 1) => {
        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';
            const params = new URLSearchParams({ page: String(currentPage), pageSize: String(pageSize) });
            const res = await axios.get(`${apiBaseUrl}/orders/my-orders?${params.toString()}`, {
                withCredentials: true
            });
            setOrders(res.data.data);
            setTotal(res.data.total);
            setTotalPages(res.data.totalPages);
            setStats(res.data.stats || { all: res.data.total, pending: 0, paid: 0 });
            setPage(currentPage);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Gagal memuat pesanan');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleCancelOrder = async (orderId: string) => {
        if (!window.confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) return;

        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';
            await axios.patch(`${apiBaseUrl}/orders/${orderId}/cancel`, {}, {
                withCredentials: true
            });
            toast.success('Pesanan berhasil dibatalkan');
            fetchOrders(page);
        } catch (err: any) {
            console.error('Error cancelling order:', err);
            toast.error(err.response?.data?.message || 'Gagal membatalkan pesanan');
        }
    };

    // Real-time updates — auto-refresh list when seller updates order status
    useBuyerSocket(() => fetchOrders(page), { notify: false });

    useEffect(() => {
        if (isAuthLoading) return;
        fetchOrders(1);
    }, [isAuthLoading, fetchOrders]);


    const getStatusStyle = (paymentStatus: string, method: string, orderStatus: string = 'pending') => {
        if (orderStatus === 'cancelled') {
            return {
                label: t('status.cancelled'),
                bg: 'bg-red-50',
                text: 'text-red-700',
                border: 'border-red-200',
                icon: XCircle
            };
        }

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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-(family-name:--font-poppins) pb-24 lg:pb-12">
            <header className="bg-white border-b sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <h1 className="text-lg font-black text-black tracking-tight">Pesanan Saya</h1>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-6">
                {/* Stats / Filter Tabs */}
                <div className="grid grid-cols-3 gap-3 mb-6 sm:mb-8">
                    <button
                        onClick={() => setFilter('all')}
                        className={clsx(
                            "p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all text-left",
                            filter === 'all' ? "bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-900/20" : "bg-white text-gray-600 border-gray-100 hover:border-gray-200 shadow-sm"
                        )}
                    >
                        <ShoppingBag className={clsx("h-4 w-4 sm:h-5 sm:w-5 mb-1 sm:mb-2", filter === 'all' ? "text-gray-400" : "text-gray-400")} />
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 leading-none mb-0.5">Semua</p>
                        <p className="text-sm sm:text-xl font-black leading-none">{stats.all || 0}</p>
                    </button>

                    <button
                        onClick={() => setFilter('pending')}
                        className={clsx(
                            "p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all text-left",
                            filter === 'pending' ? "bg-yellow-500 text-white border-yellow-500 shadow-lg shadow-yellow-500/20" : "bg-white text-gray-600 border-gray-100 hover:border-gray-200 shadow-sm"
                        )}
                    >
                        <CreditCard className={clsx("h-4 w-4 sm:h-5 sm:w-5 mb-1 sm:mb-2", filter === 'pending' ? "text-yellow-100" : "text-yellow-500")} />
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 leading-none mb-0.5">Bayar</p>
                        <p className="text-sm sm:text-xl font-black leading-none">{stats.pending || 0}</p>
                    </button>

                    <button
                        onClick={() => setFilter('paid')}
                        className={clsx(
                            "p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all text-left",
                            filter === 'paid' ? "bg-green-600 text-white border-green-600 shadow-lg shadow-green-600/20" : "bg-white text-gray-600 border-gray-100 hover:border-gray-200 shadow-sm"
                        )}
                    >
                        <CheckCircle className={clsx("h-4 w-4 sm:h-5 sm:w-5 mb-1 sm:mb-2", filter === 'paid' ? "text-green-100" : "text-green-600")} />
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 leading-none mb-0.5">Lunas</p>
                        <p className="text-sm sm:text-xl font-black leading-none">{(stats.paid || 0) + (stats.processing || 0) + (stats.shipped || 0) + (stats.completed || 0)}</p>
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
                            const status = getStatusStyle(order.paymentStatus, order.paymentMethod, order.status);
                            const StatusIcon = status.icon;

                            return (
                                <div key={order.id} className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group p-4 sm:p-6">
                                    {/* Order Meta Info */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
                                        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                                            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-brand/10 group-hover:text-brand transition-colors shrink-0">
                                                <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center space-x-1.5 leading-none">
                                                    <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">Order ID</span>
                                                    <span className="text-[10px] sm:text-xs font-black text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded-md">#{order.id.slice(-6).toUpperCase()}</span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5 text-[10px] sm:text-xs text-gray-500 font-medium leading-none">
                                                    <span className="flex items-center truncate max-w-30 sm:max-w-none">
                                                        <Store className="h-3 w-3 mr-1" /> {order.shop.name}
                                                    </span>
                                                    <span className="hidden sm:block h-0.5 w-0.5 bg-gray-300 rounded-full"></span>
                                                    <span className="flex items-center">
                                                        <Calendar className="h-3 w-3 mr-1" /> {formatShortDate(order.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={clsx(
                                            "self-start sm:self-center flex items-center space-x-1.5 px-3 py-1 rounded-full border text-[10px] sm:text-xs font-black transition-all whitespace-nowrap shadow-sm",
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
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img
                                                                src={getImageUrl(productImage)}
                                                                alt={item.product.name}
                                                                width={48}
                                                                height={48}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center text-gray-200">
                                                                <Package className="h-5 w-5" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-black truncate text-xs sm:text-sm">{item.product.name}</h4>
                                                        <p className="text-[10px] sm:text-xs text-gray-700 mt-0.5">{item.quantity} x {formatPrice(item.price)}</p>

                                                        {(order.status === 'completed' || order.deliveryStatus === 'delivered' || order.status === 'delivered' || order.paymentStatus === 'paid' || order.paymentStatus === 'completed' || order.deliveryStatus === 'completed') && !item.hasReview && (
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
                                                                className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#1B5E20]/5 text-[#1B5E20] text-[10px] sm:text-xs font-bold rounded-lg hover:bg-[#1B5E20]/10 transition-colors border border-[#1B5E20]/10"
                                                            >
                                                                <StarRating rating={0} size={10} />
                                                                <span>Kritik & Saran</span>
                                                            </button>
                                                        )}

                                                        {item.hasReview && (
                                                            <div className="mt-2 inline-flex items-center space-x-1 px-2 py-1 bg-gray-50 text-gray-400 text-[10px] font-bold rounded-lg border border-gray-100">
                                                                <CheckCircle className="h-3 w-3" />
                                                                <span>Masukan Terkirim</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {order.items.length > 1 && (
                                            <p className="text-[10px] text-gray-400 font-medium pl-15">+ {order.items.length - 1} produk lainnya</p>
                                        )}
                                    </div>

                                    {/* Payment Warning */}
                                    {order.paymentStatus === 'pending' && order.paymentMethod !== 'cod' && !order.paymentProof && (
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl bg-orange-50 border border-orange-100 mb-6 animate-[pulse_2s_ease-in-out_infinite] shadow-sm">
                                            <div className="flex items-center gap-2 flex-1">
                                                <AlertCircle className="h-5 w-5 text-orange-600 shrink-0" />
                                                <p className="text-xs sm:text-sm font-bold text-orange-800 leading-tight">
                                                    Unggah bukti Pembayaran Anda untuk segera diproses oleh penjual.
                                                </p>
                                            </div>
                                            <Link
                                                href={`/dashboard/orders/${order.id}`}
                                                className="px-4 py-2 bg-orange-600 text-white text-[10px] sm:text-xs font-black rounded-xl hover:bg-orange-700 transition-all shadow-sm shadow-orange-600/20 text-center active:scale-95 whitespace-nowrap"
                                            >
                                                UPLOAD SEKARANG
                                            </Link>
                                        </div>
                                    )}

                                    {/* Total & Action */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                        <div>
                                            <p className="text-[10px] sm:text-xs text-gray-600 font-bold uppercase tracking-widest leading-none mb-1">Total Belanja</p>
                                            <p className="text-sm sm:text-lg font-black text-brand leading-none">{formatPrice(order.totalAmount)}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {order.status === 'pending' && order.paymentStatus === 'pending' && order.deliveryStatus === 'pending' && (
                                                <button
                                                    onClick={() => handleCancelOrder(order.id)}
                                                    className="px-3 py-2 bg-red-50 text-red-700 text-[10px] sm:text-xs font-bold rounded-lg border border-red-100 hover:bg-red-100 transition-all flex items-center gap-1.5"
                                                >
                                                    <XCircle className="h-3 w-3" />
                                                    <span>Batalkan</span>
                                                </button>
                                            )}
                                            {(order.status === 'completed' || order.deliveryStatus === 'delivered' || order.status === 'delivered' || order.paymentStatus === 'paid' || order.paymentStatus === 'completed' || order.deliveryStatus === 'completed') && !order.hasShopReview && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedProduct({
                                                            id: '',
                                                            name: order.shop.name,
                                                            image: order.shop.logo ? getImageUrl(order.shop.logo) : '/images/default-shop.png',
                                                            shopId: order.shopId
                                                        } as any);
                                                        setCurrentOrderId(order.id);
                                                        setIsReviewModalOpen(true);
                                                    }}
                                                    className="px-3 py-2 bg-yellow-50 text-yellow-700 text-[10px] sm:text-xs font-bold rounded-lg border border-yellow-100 hover:bg-yellow-100 transition-all flex items-center gap-1.5"
                                                >
                                                    <StarRating rating={0} size={10} />
                                                    <span>Kritik dan Saran</span>
                                                </button>
                                            )}
                                            {order.hasShopReview && (
                                                <div className="px-3 py-2 bg-gray-50 text-gray-400 text-[10px] sm:text-xs font-bold rounded-lg border border-gray-100 flex items-center gap-1.5">
                                                    <CheckCircle className="h-3 w-3" />
                                                    <span>Masukan Terkirim</span>
                                                </div>
                                            )}
                                            {order.shop.owner?.whatsapp && (
                                                <a
                                                    href={`https://wa.me/${order.shop.owner.whatsapp.replace(/\D/g, '').replace(/^0/, '62').replace(/^8/, '628')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[#25D366] text-white text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl hover:bg-[#128C7E] transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                                                >
                                                    <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                                                    <span className="hidden xs:inline">Chat</span>
                                                </a>
                                            )}
                                            <Link
                                                href={`/dashboard/orders/${order.id}`}
                                                className="flex items-center space-x-1 px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-900 text-white text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl hover:bg-gray-800 transition-all active:scale-95"
                                            >
                                                <span>Detail</span>
                                                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
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
                                className="inline-flex items-center space-x-2 px-8 py-4 bg-brand text-white font-bold rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-100 active:scale-95"
                            >
                                <LayoutDashboard className="h-5 w-5" />
                                <span>Belanja Sekarang</span>
                            </Link>
                        </div>
                    )}
                </div>
            </main>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-100 mx-4 sm:mx-0 rounded-2xl mt-2">
                    <span className="text-xs text-gray-500">
                        {total} pesanan &bull; Hal {page} dari {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                        <button onClick={() => fetchOrders(Math.max(1, page - 1))} disabled={page === 1}
                            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                            ← Sebelumnya
                        </button>
                        <button onClick={() => fetchOrders(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                            Selanjutnya →
                        </button>
                    </div>
                </div>
            )}

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
