'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from "@/store/authStore";
import { useParams, useRouter } from 'next/navigation';
import {
    Package, MapPin, CreditCard, ChevronLeft,
    Clock, CheckCircle, XCircle, Truck,
    Calendar, Store, Hash, AlertTriangle,
    ExternalLink, Download, MessageCircle,
    Info, Copy, Check
} from "lucide-react";
import axios from 'axios';
import Link from 'next/link';
import clsx from 'clsx';
import { useBuyerSocket } from '@/hooks/useBuyerSocket';
import { formatPrice, formatShortDate, formatDate } from '@/utils/format';

export default function OrderDetailsPage() {
    const { id } = useParams();
    const { isLoggedIn, isLoading: isAuthLoading } = useAuthStore();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isAuthLoading) return;
        if (!isLoggedIn) {
            router.push(`/login?redirect=/dashboard/orders/${id}`);
            return;
        }
        fetchOrderDetails();
    }, [isLoggedIn, isAuthLoading, id, router]);

    // Real-time: Refresh order details when status is updated by merchant
    useBuyerSocket((updatedOrder) => {
        if (updatedOrder.id === id) {
            fetchOrderDetails();
        }
    }, { notify: false });

    const fetchOrderDetails = async () => {
        setIsLoading(true);
        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const response = await axios.get(`${apiBaseUrl}/orders/${id}`, { withCredentials: true });
            setOrder(response.data);
        } catch (err: any) {
            console.error('Error fetching order details:', err);
            setError('Gagal memuat detail pesanan.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getStatusStyle = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'paid':
                return {
                    bg: 'bg-green-100',
                    text: 'text-green-700',
                    icon: CheckCircle,
                    label: 'Berhasil Dibayar',
                    sub: 'Pesanan sedang disiapkan'
                };
            case 'pending':
                return {
                    bg: 'bg-yellow-100',
                    text: 'text-yellow-700',
                    icon: Clock,
                    label: 'Menunggu Pembayaran',
                    sub: 'Segera lakukan transfer'
                };
            case 'failed':
                return {
                    bg: 'bg-red-100',
                    text: 'text-red-700',
                    icon: XCircle,
                    label: 'Pembayaran Gagal',
                    sub: 'Silakan pesan kembali'
                };
            case 'processing':
                return {
                    bg: 'bg-blue-100',
                    text: 'text-blue-700',
                    icon: Truck,
                    label: 'Sedang Diproses',
                    sub: 'Oleh penjual'
                };
            default:
                return {
                    bg: 'bg-gray-100',
                    text: 'text-gray-700',
                    icon: Package,
                    label: status || 'Unknown',
                    sub: 'Status pesanan'
                };
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="h-12 w-12 border-4 border-gray-200 border-t-[#1B5E20] rounded-full animate-spin"></div>
                    <p className="mt-4 font-medium text-gray-500">Memuat detail pesanan...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-sm w-full text-center">
                    <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                        <AlertTriangle className="h-10 w-10" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Oops! Ada Masalah</h2>
                    <p className="text-sm text-gray-500 mb-6">{error || 'Pesanan tidak ditemukan'}</p>
                    <Link href="/dashboard/orders" className="block w-full py-3 bg-gray-900 text-white rounded-xl font-bold">
                        Kembali ke Pesanan Saya
                    </Link>
                </div>
            </div>
        );
    }

    const statusObj = getStatusStyle(order.paymentStatus);
    const StatusIcon = statusObj.icon;

    return (
        <div className="min-h-screen bg-[#F8F9FA] font-[family-name:var(--font-poppins)]">
            {/* Header Sticky */}
            <div className="bg-white border-b sticky top-0 z-40 transition-shadow">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Link href="/dashboard/orders" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                            <ChevronLeft className="h-6 w-6" />
                        </Link>
                        <h1 className="font-bold text-gray-900">Detail Pesanan</h1>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24">
                {/* Status Hero Card */}
                <div className={clsx(
                    "rounded-[2.5rem] p-8 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-transparent shadow-xl shadow-gray-200/50",
                    statusObj.bg
                )}>
                    <div className="flex items-center space-x-6">
                        <div className="h-16 w-16 bg-white rounded-3xl flex items-center justify-center shadow-sm">
                            <StatusIcon className={clsx("h-8 w-8", statusObj.text)} />
                        </div>
                        <div className="text-center sm:text-left">
                            <h2 className={clsx("text-xl font-black", statusObj.text)}>{statusObj.label}</h2>
                            <p className={clsx("text-sm font-medium opacity-70 mt-1")}>{statusObj.sub}</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center sm:items-end">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Pembayaran</span>
                        <p className={clsx("text-2xl font-black", statusObj.text)}>{formatPrice(order.totalAmount)}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Left Column: Order Brief & Items */}
                    <div className="md:col-span-12 space-y-8">

                        {/* Summary Info */}
                        <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-gray-100 shadow-sm grid grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Order ID</p>
                                <div className="flex items-center space-x-2">
                                    <span className="font-bold text-gray-900">#{order.id.slice(-8).toUpperCase()}</span>
                                    <button onClick={() => handleCopy(order.id)} className="text-[#1B5E20] hover:bg-green-50 p-1 rounded">
                                        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Waktu Transaksi</p>
                                <p className="font-bold text-gray-900">{formatDate(order.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Metode Pembayaran</p>
                                <p className="font-bold text-gray-900 uppercase">{order.paymentMethod.replace('_', ' ')}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Penjual</p>
                                <Link href={`/${order.shop.slug}`} className="font-bold text-[#1B5E20] hover:underline flex items-center">
                                    {order.shop.name}
                                    <ExternalLink className="h-3 w-3 ml-1" />
                                </Link>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm">
                            <div className="px-6 py-5 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                                <h3 className="font-bold text-gray-900 flex items-center">
                                    <Package className="h-5 w-5 mr-3 text-[#1B5E20]" />
                                    Rincian Produk
                                </h3>
                                <span className="bg-[#1B5E20] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{order.items.length} Items</span>
                            </div>
                            <div className="p-6 sm:p-8 space-y-6">
                                {order.items.map((item: any) => (
                                    <div key={item.id} className="flex items-start justify-between gap-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="h-20 w-20 bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden flex-shrink-0 relative group">
                                                {item.product.images?.[0]?.url ? (
                                                    <img
                                                        src={item.product.images[0].url.startsWith('http') ? item.product.images[0].url : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${item.product.images[0].url.startsWith('/') ? '' : '/'}${item.product.images[0].url}`}
                                                        alt={item.product.name}
                                                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-gray-200">
                                                        <Package className="h-8 w-8" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-sm sm:text-base mb-1">{item.product.name}</h4>
                                                <p className="text-xs text-gray-500 font-medium">{item.quantity} x {formatPrice(item.price)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">{formatPrice(item.subtotal)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-6 sm:p-8 bg-gray-50/50 border-t border-gray-50">
                                <div className="space-y-3 max-w-sm ml-auto">
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>Subtotal</span>
                                        <span className="font-bold text-gray-700">{formatPrice(order.totalAmount)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>Biaya Pengiriman</span>
                                        <span className="font-bold text-green-600">Terhitung Manual</span>
                                    </div>
                                    <div className="flex justify-between text-lg pt-3 border-t border-gray-200">
                                        <span className="font-extrabold text-gray-900">Total Akhir</span>
                                        <span className="font-black text-[#1B5E20]">{formatPrice(order.totalAmount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shipping & Payment Details */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-6 flex items-center">
                                    <MapPin className="h-5 w-5 mr-3 text-[#1B5E20]" />
                                    Alamat Pengiriman
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <p className="font-bold text-gray-900 mb-1">{order.shippingAddress?.receiverName || order.user?.name}</p>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.province}
                                        </p>
                                        <p className="text-sm text-gray-800 font-medium mt-2 flex items-center">
                                            <Hash className="h-3 w-3 mr-1" />
                                            {order.shippingAddress?.phone || 'No phone provided'}
                                        </p>
                                    </div>
                                    {order.notes && (
                                        <div className="flex items-start space-x-3 text-xs text-gray-500 italic bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                                            <Info className="h-4 w-4 text-yellow-500 shrink-0" />
                                            <span>"{order.notes}"</span>
                                        </div>
                                    )}

                                    {/* Action Buttons based on Status */}
                                    {order.deliveryStatus === 'shipped' && order.status !== 'completed' && (
                                        <div className="mt-6 pt-6 border-t border-gray-100">
                                            <p className="text-xs text-gray-500 mb-3">Pesanan sudah dikirim? Konfirmasi jika sudah sampai.</p>
                                            <button
                                                onClick={async () => {
                                                    if (confirm('Apakah Anda yakin pesanan sudah diterima?')) {
                                                        try {
                                                            await axios.patch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/orders/${id}/receive`, {}, { withCredentials: true });
                                                            fetchOrderDetails();
                                                            alert('Terima kasih! Pesanan selesai.');
                                                        } catch (e) { alert('Gagal mengonfirmasi pesanan'); }
                                                    }
                                                }}
                                                className="w-full py-3 bg-[#1B5E20] text-white rounded-xl font-bold hover:bg-green-800 transition-all shadow-lg shadow-green-100 flex items-center justify-center space-x-2"
                                            >
                                                <CheckCircle className="h-4 w-4" />
                                                <span>Pesanan Diterima</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                                <h3 className="font-bold text-gray-900 mb-6 flex items-center">
                                    <CreditCard className="h-5 w-5 mr-3 text-[#1B5E20]" />
                                    Instruksi Pembayaran
                                </h3>

                                {order.paymentStatus === 'pending' ? (
                                    <div className="space-y-6">
                                        <div className="bg-green-50/50 p-5 rounded-3xl border border-green-100">
                                            <p className="text-[10px] font-bold text-[#1B5E20] uppercase tracking-widest mb-3">Bank Transfer (Manual)</p>
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <p className="text-xs text-gray-500 font-bold mb-1">Nomor Rekening</p>
                                                    <p className="text-xl font-black text-gray-900 tracking-tight">7289-01-013000-53-0</p>
                                                </div>
                                                <button
                                                    onClick={() => handleCopy('728901013000530')}
                                                    className="p-3 bg-white text-[#1B5E20] rounded-2xl shadow-sm border border-green-100 hover:bg-green-50 transition-all font-bold text-xs"
                                                >
                                                    Salin
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                                Bank <span className="font-bold text-gray-900">BRI</span> a/n <span className="font-bold text-gray-900">Parwanto</span>
                                            </p>
                                        </div>

                                        <div className="flex items-start space-x-3 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                            <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                                            <p className="text-[11px] text-orange-800 leading-relaxed">
                                                Gunakan <span className="font-bold">Order ID</span> di atas sebagai referensi transfer Anda agar verifikasi berjalan cepat.
                                            </p>
                                        </div>

                                        <button
                                            onClick={async () => {
                                                if (confirm('Saya sudah melakukan transfer sesuai nominal. Konfirmasi pembayaran?')) {
                                                    try {
                                                        await axios.patch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/orders/${id}/pay`, {}, { withCredentials: true });
                                                        fetchOrderDetails();
                                                        alert('Pembayaran dikonfirmasi! Menunggu verifikasi penjual.');
                                                    } catch (e) { alert('Gagal konfirmasi pembayaran'); }
                                                }
                                            }}
                                            className="w-full py-4 bg-white border-2 border-[#1B5E20] text-[#1B5E20] rounded-xl font-bold hover:bg-green-50 transition-all flex items-center justify-center space-x-2"
                                        >
                                            <span>Saya Sudah Bayar</span>
                                        </button>
                                    </div>
                                ) : order.paymentStatus === 'paid' ? (
                                    <div className="text-center py-6">
                                        <div className="h-16 w-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle className="h-8 w-8" />
                                        </div>
                                        <p className="font-bold text-gray-900">Pembayaran Terverifikasi</p>
                                        <p className="text-xs text-gray-500 mt-1">Pesanan Anda telah dibayar penuh menggunakan {order.paymentMethod.toUpperCase()}</p>
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-gray-400">
                                        <Info className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                        <p className="text-xs">Informasi tidak tersedia untuk status ini.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 p-4 z-40 lg:hidden">
                    <button className="w-full py-4 bg-[#1B5E20] text-white rounded-2xl font-bold shadow-lg shadow-green-100 flex items-center justify-center space-x-2">
                        <MessageCircle className="h-5 w-5" />
                        <span>Hubungi Penjual</span>
                    </button>
                </div>

                <div className="hidden lg:flex justify-center mt-12 space-x-4">
                    <button className="px-8 py-3 bg-white text-gray-900 border border-gray-200 rounded-xl font-bold flex items-center space-x-2 hover:bg-gray-50 transition-all shadow-sm">
                        <Download className="h-4 w-4" />
                        <span>Download Invoice</span>
                    </button>
                    <button className="px-8 py-3 bg-[#1B5E20] text-white rounded-xl font-bold flex items-center space-x-2 hover:bg-green-800 transition-all shadow-lg shadow-green-100">
                        <MessageCircle className="h-4 w-4" />
                        <span>Hubungi Penjual</span>
                    </button>
                </div>
            </main>
        </div>
    );
}
