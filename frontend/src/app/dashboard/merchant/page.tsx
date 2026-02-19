'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuthStore } from "@/store/authStore";
import { useRouter } from 'next/navigation';
import { Store, ShoppingBag, TrendingUp, Package, Plus, Eye, Settings, ChevronRight, Bell, CheckCircle, Truck, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';
import StatCard from '@/components/merchant/StatCard';
import MerchantBottomNav from '@/components/merchant/MerchantBottomNav';
import ConnectionStatusBadge from '@/components/merchant/ConnectionStatusBadge';
import { useMerchantSocket, RealtimeOrder } from '@/hooks/useMerchantSocket';
import { clsx } from 'clsx';
import { formatPrice, formatShortDate } from '@/utils/format';
import { toast } from 'react-hot-toast';
import OrderDetailsDialog from '@/components/merchant/OrderDetailsDialog';

interface Order {
    id: string;
    totalAmount: number;
    paymentStatus: string;
    description?: string; // Add description if needed for status
    createdAt: string;
    paymentMethod: string; // Added for context
    user: { name: string | null };
    shippingAddress: any;
}

interface ShopStats {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    recentOrders: Order[];
}

// ─── Toast Notification ───────────────────────────────────────────────────────
function NewOrderToast({ order, onClose }: { order: RealtimeOrder; onClose: () => void }) {
    useEffect(() => {
        const t = setTimeout(onClose, 6000);
        return () => clearTimeout(t);
    }, [onClose]);

    return (
        <div className="fixed top-4 right-4 z-[100] bg-white rounded-2xl shadow-2xl border border-green-100 p-4 flex items-start space-x-3 max-w-sm animate-in slide-in-from-top-2 duration-300">
            <div className="h-10 w-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
                <Bell className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-gray-900">Pesanan Baru! 🎉</p>
                <p className="text-xs text-gray-500 mt-0.5">
                    {order.user.name} · {formatPrice(order.totalAmount)} · {order.itemCount} item
                </p>
            </div>
            <button onClick={onClose} className="text-gray-300 hover:text-gray-500 text-lg leading-none">×</button>
        </div>
    );
}

export default function MerchantDashboardPage() {
    const { user, isLoggedIn, isLoading: isAuthLoading } = useAuthStore();
    const router = useRouter();
    const [stats, setStats] = useState<ShopStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [shopId, setShopId] = useState<string | null>(null);
    const [newOrderNotification, setNewOrderNotification] = useState<RealtimeOrder | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

    // ── Handle incoming real-time order ──────────────────────────────────────
    const handleNewOrder = useCallback((order: RealtimeOrder) => {
        setNewOrderNotification(order);
        setUnreadCount(prev => prev + 1);
        setStats(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                totalOrders: prev.totalOrders + 1,
                totalRevenue: prev.totalRevenue + order.totalAmount,
                recentOrders: [
                    {
                        id: order.id,
                        totalAmount: order.totalAmount,
                        paymentStatus: order.paymentStatus,
                        paymentMethod: 'unknown', // Default or fetch if needed
                        createdAt: order.createdAt,
                        user: { name: order.user.name },
                        shippingAddress: {}
                    },
                    ...prev.recentOrders.slice(0, 9) // Keep max 10 orders
                ]
            };
        });
    }, []);

    // ── Socket connection ─────────────────────────────────────────────────────
    const { connectionStatus, lastSync, reconnectCount } = useMerchantSocket({
        shopId,
        onNewOrder: handleNewOrder,
    });

    const fetchStats = async () => {
        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const response = await axios.get(`${apiBaseUrl}/shops/stats`, { withCredentials: true });
            setStats(response.data);
            // Extract shopId from stats response if available
            if (response.data?.shopId) {
                setShopId(response.data.shopId);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateStatus = async (orderId: string, newStatus: string) => {
        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            await axios.patch(`${apiBaseUrl}/orders/${orderId}/status`,
                { paymentStatus: newStatus },
                { withCredentials: true }
            );

            toast.success(`Status berhasil diperbarui ke ${newStatus.toUpperCase()}`);
            fetchStats(); // Refresh data
        } catch (error: any) {
            const message = error.response?.data?.message || error.message;
            toast.error(`Gagal update status: ${message}`);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
            case 'completed':
                return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle, label: 'SELESAI' };
            case 'pending':
                return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', icon: Clock, label: 'MENUNGGU KONFIRMASI' };
            case 'processing':
                return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: Package, label: 'DIPROSES' };
            case 'shipped':
                return { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', icon: Truck, label: 'DIKIRIM' };
            case 'failed':
            case 'cancelled':
                return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: XCircle, label: 'BATAL' };
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', icon: Package, label: status.toUpperCase() };
        }
    };

    useEffect(() => {
        if (isAuthLoading) return;
        if (!isLoggedIn) {
            router.push('/login?redirect=/dashboard/merchant');
            return;
        }
        if (user?.role !== 'SELLER') {
            router.push('/dashboard');
            return;
        }
        fetchStats();
    }, [isLoggedIn, user, router, isAuthLoading]);

    if (isAuthLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B5E20]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-poppins)] p-4 sm:p-8 pb-24 lg:pb-8">
            {/* Toast Notification */}
            {newOrderNotification && <NewOrderToast order={newOrderNotification} onClose={() => setNewOrderNotification(null)} />}

            <OrderDetailsDialog
                orderId={selectedOrderId || ''}
                isOpen={!!selectedOrderId}
                onClose={() => setSelectedOrderId(null)}
                onStatusUpdate={fetchStats}
            />

            <div className="w-full max-w-full">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-sm sm:text-2xl font-black text-gray-900 uppercase tracking-tight">Dashboard Toko</h1>
                            <ConnectionStatusBadge status={connectionStatus} lastSync={lastSync} reconnectCount={reconnectCount} />
                        </div>
                        <p className="text-gray-400 text-[8px] sm:text-sm font-medium">Ringkasan aktivitas tokomu hari ini.</p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex space-x-2 sm:space-x-3 w-full sm:w-auto">
                        <Link href="/dashboard/merchant/profile" className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 sm:space-x-2 bg-white text-gray-700 px-3 py-2 sm:px-4 sm:py-2 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors">
                            <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="font-bold text-[8px] sm:text-sm">Pengaturan</span>
                        </Link>
                        <button className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 sm:space-x-2 bg-[#1B5E20] text-white px-3 py-2 sm:px-4 sm:py-2 rounded-2xl hover:bg-[#1B5E20]/90 transition-colors shadow-lg shadow-green-900/10">
                            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="font-black text-[8px] sm:text-sm uppercase tracking-wider">Produk Baru</span>
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-8">
                    <StatCard
                        title="Pendapatan"
                        value={formatPrice(stats?.totalRevenue || 0)}
                        icon={TrendingUp}
                        trend="+12%"
                        trendUp={true}
                        description="Bulan ini"
                    />
                    <StatCard
                        title="Pesanan"
                        value={stats?.totalOrders || 0}
                        icon={ShoppingBag}
                        trend="+5%"
                        trendUp={true}
                        description="Pesanan selesai"
                    />
                    <div className="col-span-2 lg:col-span-1">
                        <StatCard
                            title="Total Produk"
                            value={stats?.totalProducts || 0}
                            icon={Package}
                            description="Aktif dijual"
                        />
                    </div>
                </div>

                {/* Recent Orders Section */}
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden mb-8">
                    <div className="p-5 sm:p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                        <h2 className="font-black text-xs sm:text-lg text-gray-900 uppercase tracking-tight">Pesanan Terbaru</h2>
                        <Link href="/dashboard/merchant/orders" className="text-[#1B5E20] text-[9px] sm:text-sm font-black uppercase tracking-widest hover:underline flex items-center">
                            Semua <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                        </Link>
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden sm:block overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-black tracking-widest">
                                <tr>
                                    <th className="px-6 py-4 whitespace-nowrap">ID Pesanan</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Pemesan</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Alamat</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Total</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Status</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Tanggal</th>
                                    <th className="px-6 py-4 text-right whitespace-nowrap">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                                    stats.recentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900 whitespace-nowrap">#{order.id.toUpperCase().slice(-8)}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-700 whitespace-nowrap">
                                                {order.user?.name || 'Guest'}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-500 max-w-[200px] truncate" title={order.shippingAddress?.address || (order.shippingAddress?.street ? `${order.shippingAddress.street}, ${order.shippingAddress.city}` : '-')}>
                                                {order.shippingAddress?.address || (order.shippingAddress?.street ? `${order.shippingAddress.street}, ${order.shippingAddress.city}` : '-')}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-black text-[#1B5E20] whitespace-nowrap">{formatPrice(order.totalAmount)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {(() => {
                                                    const badge = getStatusBadge(order.paymentStatus);
                                                    const BadgeIcon = badge.icon;
                                                    return (
                                                        <span className={clsx(
                                                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 w-fit border",
                                                            badge.bg, badge.text, badge.border
                                                        )}>
                                                            <BadgeIcon className="h-3 w-3" />
                                                            {badge.label}
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-500 font-medium whitespace-nowrap">
                                                {formatShortDate(order.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* Status Actions */}
                                                    {order.paymentStatus === 'pending' && (
                                                        <button
                                                            onClick={() => updateStatus(order.id, 'processing')}
                                                            className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-lg hover:bg-blue-700 transition"
                                                        >
                                                            Konfirmasi
                                                        </button>
                                                    )}
                                                    {order.paymentStatus === 'processing' && (
                                                        <button
                                                            onClick={() => updateStatus(order.id, 'shipped')}
                                                            className="px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-bold rounded-lg hover:bg-indigo-700 transition"
                                                        >
                                                            Kirim
                                                        </button>
                                                    )}
                                                    {order.paymentStatus === 'shipped' && (
                                                        <button
                                                            onClick={() => updateStatus(order.id, order.paymentMethod === 'cod' ? 'paid' : 'completed')}
                                                            className="px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-700 transition"
                                                        >
                                                            Selesai
                                                        </button>
                                                    )}

                                                    {/* View Detail Button - Updated */}
                                                    <button
                                                        onClick={() => setSelectedOrderId(order.id)}
                                                        className="flex items-center space-x-1.5 text-gray-500 hover:text-[#1B5E20] transition-colors px-3 py-1.5 hover:bg-green-50 rounded-lg group-hover:bg-white border border-transparent group-hover:border-gray-200"
                                                        title="Lihat Detail Pesanan"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        <span className="text-[10px] font-bold">Detail Order</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <ShoppingBag className="h-8 w-8 text-gray-200 mb-2" />
                                                <p className="text-gray-400 text-sm font-medium">Belum ada pesanan.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View (Refined) */}
                    <div className="sm:hidden divide-y divide-gray-50">
                        {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                            stats.recentOrders.map((order) => (
                                <div key={order.id} className="p-4 flex flex-col gap-3 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className={clsx(
                                                "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border",
                                                order.paymentStatus === 'paid' ? "bg-green-50 border-green-100 text-green-600" :
                                                    order.paymentStatus === 'pending' ? "bg-yellow-50 border-yellow-100 text-yellow-600" :
                                                        "bg-red-50 border-red-100 text-red-600"
                                            )}>
                                                <ShoppingBag className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-gray-900 uppercase tracking-tight">#{order.id.slice(-6).toUpperCase()}</p>
                                                <p className="text-[10px] text-gray-500 font-medium">
                                                    {order.user?.name || 'Guest'} · {formatShortDate(order.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={clsx(
                                            "px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border",
                                            getStatusBadge(order.paymentStatus).bg,
                                            getStatusBadge(order.paymentStatus).text,
                                            getStatusBadge(order.paymentStatus).border
                                        )}>
                                            {getStatusBadge(order.paymentStatus).label}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pl-[3.25rem]">
                                        <p className="text-sm font-black text-[#1B5E20]">{formatPrice(order.totalAmount)}</p>
                                        <div className="flex gap-2">
                                            {/* Mobile Actions */}
                                            {order.paymentStatus === 'pending' && (
                                                <button
                                                    onClick={() => updateStatus(order.id, 'processing')}
                                                    className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-lg"
                                                >
                                                    Confirm
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setSelectedOrderId(order.id)}
                                                className="px-3 py-1.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-lg flex items-center gap-1"
                                            >
                                                <Eye className="h-3 w-3" />
                                                Detail
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center text-gray-400 text-[10px] uppercase font-black tracking-widest">
                                Tidak ada data pesanan
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <MerchantBottomNav />
        </div>
    );
}
