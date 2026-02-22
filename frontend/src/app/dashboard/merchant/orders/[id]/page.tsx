'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Package, ArrowLeft, CheckCircle2, Clock, AlertCircle,
    Truck, Wallet, MessageCircle, User, MapPin, ExternalLink,
    Banknote, Info, Copy, Check, ChevronRight
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { formatPrice, formatDate } from '@/utils/format';
import { getImageUrl } from '@/utils/image';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';

export default function MerchantOrderDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const fetchOrderDetails = async () => {
        try {
            setIsLoading(true);
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';
            const response = await axios.get(`${apiBaseUrl}/orders/${id}`, { withCredentials: true });
            setOrder(response.data);
        } catch (error: any) {
            console.error('Fetch error:', error);
            toast.error('Gagal mengambil detail pesanan');
            router.push('/dashboard/merchant/orders');
        } finally {
            setIsLoading(false);
        }
    };

    const updateStatus = async (newStatus: string) => {
        try {
            setIsUpdating(true);
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';
            await axios.patch(`${apiBaseUrl}/orders/${id}/status`,
                { paymentStatus: newStatus },
                { withCredentials: true }
            );
            toast.success('Status berhasil diperbarui');
            fetchOrderDetails();
        } catch (error: any) {
            toast.error('Gagal memperbarui status');
        } finally {
            setIsUpdating(false);
        }
    };

    const verifyPayment = async () => {
        try {
            setIsUpdating(true);
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';
            await axios.patch(`${apiBaseUrl}/orders/${id}/verify-payment`, {}, { withCredentials: true });
            toast.success('Pembayaran terverifikasi');
            fetchOrderDetails();
        } catch (error: any) {
            toast.error('Gagal memverifikasi pembayaran');
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="h-8 w-8 border-2 border-gray-200 border-t-[#1B5E20] rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!order) return null;

    const getStatusStyles = (status: string, method: string, hasProof: boolean = false) => {
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
                return {
                    bg: method === 'cod' ? 'bg-yellow-50' : 'bg-amber-50',
                    text: method === 'cod' ? 'text-yellow-700' : 'text-amber-700',
                    border: method === 'cod' ? 'border-yellow-100' : 'border-amber-100',
                    label: method === 'cod' ? 'MENUNGGU COD' : 'MENUNGGU BAYAR',
                    icon: Clock
                };
            case 'paid':
                return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', label: 'SUDAH BAYAR', icon: CheckCircle2 };
            case 'processing':
                return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100', label: 'DIPROSES', icon: Package };
            case 'shipped':
                return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100', label: 'DIKIRIM', icon: Truck };
            case 'completed':
                return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', label: 'SELESAI', icon: CheckCircle2 };
            default:
                return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-100', label: status.toUpperCase(), icon: Info };
        }
    };

    const statusStyle = getStatusStyles(order.paymentStatus, order.paymentMethod, !!order.paymentProof);
    const StatusIcon = statusStyle.icon;

    return (
        <div className="min-h-screen bg-[#F8F9FA] pb-24 font-[family-name:var(--font-poppins)]">
            {/* Header Sticky */}
            <div className="bg-white border-b sticky top-0 z-40 transition-shadow">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                            <ArrowLeft className="h-6 w-6" />
                        </button>
                        <h1 className="font-bold text-gray-900 text-sm sm:text-base">Detail Pesanan Toko</h1>
                    </div>
                    <div className={clsx(
                        "px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5",
                        statusStyle.bg, statusStyle.text, statusStyle.border
                    )}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {statusStyle.label}
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-4 md:py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Left Column: Items & Details */}
                    <div className="lg:col-span-8 space-y-4">
                        {/* Order ID & Time */}
                        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-wrap justify-between items-center gap-3">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Order ID</p>
                                <p className="text-sm font-black text-gray-900">#{order.id.slice(-8).toUpperCase()}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5 text-right sm:text-left">Waktu Pesanan</p>
                                <p className="text-sm font-bold text-gray-900">{formatDate(order.createdAt)}</p>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-3 flex items-center text-sm">
                                <User className="h-4 w-4 mr-2 text-[#1B5E20]" />
                                Informasi Pembeli
                            </h3>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center text-[#1B5E20] font-bold text-base">
                                    {order.user?.name?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">{order.user?.name}</p>
                                    <p className="text-xs text-gray-500">{order.user?.email}</p>
                                    {order.user?.whatsapp && (
                                        <a href={`https://wa.me/62${order.user.whatsapp.replace(/^0/, '')}`} target="_blank" className="text-xs text-[#25D366] font-bold flex items-center mt-1">
                                            <MessageCircle className="h-3 w-3 mr-1" /> WhatsApp Pembeli
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                                <h3 className="font-bold text-gray-900 text-sm flex items-center">
                                    <Package className="h-4 w-4 mr-2 text-[#1B5E20]" />
                                    Produk yang Dipesan
                                </h3>
                            </div>
                            <div className="p-4 space-y-3">
                                {order.items.map((item: any) => (
                                    <div key={item.id} className="flex gap-3">
                                        <div className="h-14 w-14 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden shrink-0">
                                            {item.product.images?.[0] ? (
                                                <img src={getImageUrl(item.product.images[0].url)} className="h-full w-full object-cover" alt={item.product.name} />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center"><Package className="h-5 w-5 text-gray-200" /></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-900 text-xs sm:text-sm truncate">{item.product.name}</p>
                                            <p className="text-[11px] sm:text-xs text-gray-500">{item.quantity} x {formatPrice(item.price)}</p>
                                        </div>
                                        <p className="font-bold text-gray-900 text-xs sm:text-sm">{formatPrice(item.subtotal)}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-gray-50/50 border-t border-gray-100">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-400 uppercase tracking-widest text-xs">Total Belanja</span>
                                    <span className="font-black text-[#1B5E20] text-lg">{formatPrice(order.totalAmount)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-3 flex items-center text-sm">
                                <MapPin className="h-4 w-4 mr-2 text-[#1B5E20]" />
                                Alamat Pengiriman
                            </h3>
                            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="font-bold text-gray-900 text-xs mb-1">{order.shippingAddress?.receiverName || order.user?.name}</p>
                                <p className="text-xs text-gray-600 leading-relaxed mb-1.5">{order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.province}</p>
                                <p className="text-xs font-bold text-gray-800 tracking-tight flex items-center">
                                    <MessageCircle className="h-3.5 w-3.5 mr-1.5 text-gray-400" /> {order.shippingAddress?.phone}
                                </p>
                            </div>
                            {order.notes && (
                                <div className="mt-3 p-2.5 bg-yellow-50 rounded-lg border border-yellow-100 text-[11px] text-yellow-800 italic">
                                    "{order.notes}"
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Actions & Payment Proof */}
                    <div className="lg:col-span-4 space-y-4">
                        {/* Action Panel */}
                        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm sticky top-24">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center text-xs uppercase tracking-widest">
                                <Banknote className="h-4 w-4 mr-2 text-[#1B5E20]" />
                                Kelola Pesanan
                            </h3>

                            {/* Status Actions */}
                            <div className="space-y-2.5">
                                {order.paymentStatus === 'pending' && (
                                    <div className="space-y-2.5">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Konfirmasi Pembayaran</p>
                                        <button
                                            disabled={isUpdating}
                                            onClick={verifyPayment}
                                            className="w-full py-3 bg-[#1B5E20] text-white rounded-xl font-bold text-xs hover:bg-green-800 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-green-100 disabled:opacity-50"
                                        >
                                            <CheckCircle2 className="h-4 w-4" />
                                            <span>Konfirmasi Sudah Bayar</span>
                                        </button>
                                        {order.paymentMethod === 'cod' && (
                                            <p className="text-[10px] text-orange-600 font-medium text-center italic">
                                                *Klik konfirmasi jika pesanan sudah siap diproses (COD).
                                            </p>
                                        )}
                                    </div>
                                )}

                                {order.paymentStatus === 'paid' && (
                                    <button
                                        disabled={isUpdating}
                                        onClick={() => updateStatus('processing')}
                                        className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold text-xs hover:bg-purple-700 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-purple-100 disabled:opacity-50"
                                    >
                                        <Package className="h-4 w-4" />
                                        <span>Mulai Proses Pesanan</span>
                                    </button>
                                )}

                                {order.paymentStatus === 'processing' && (
                                    <button
                                        disabled={isUpdating}
                                        onClick={() => updateStatus('shipped')}
                                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-100 disabled:opacity-50"
                                    >
                                        <Truck className="h-4 w-4" />
                                        <span>Konfirmasi Pengiriman</span>
                                    </button>
                                )}

                                {order.paymentStatus === 'shipped' && (
                                    <p className="text-center py-3.5 bg-gray-50 rounded-xl text-xs text-gray-500 font-medium border border-gray-100 uppercase tracking-widest px-2">
                                        Menunggu pembeli menerima pesanan.
                                    </p>
                                )}

                                {order.paymentStatus === 'completed' && (
                                    <div className="text-center py-5 bg-green-50 rounded-xl border border-green-100">
                                        <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                        <p className="font-black text-green-900 text-sm">PESANAN SELESAI</p>
                                        <p className="text-xs text-green-700">Dana telah diteruskan ke saldo toko.</p>
                                    </div>
                                )}
                            </div>

                            {/* Payment Proof Section for Manual Transfer */}
                            {(order.paymentMethod === 'transfer' || order.paymentMethod === 'qris') && (
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Bukti Pembayaran</p>
                                    {order.paymentProof ? (
                                        <div className="space-y-4">
                                            <div className="rounded-2xl overflow-hidden border border-gray-200">
                                                <img
                                                    src={getImageUrl(order.paymentProof)}
                                                    className="w-full h-auto cursor-pointer"
                                                    alt="Bukti Bayar"
                                                    onClick={() => window.open(getImageUrl(order.paymentProof), '_blank')}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 text-center italic">Klik gambar untuk memperbesar</p>
                                        </div>
                                    ) : (
                                        <div className="py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                                            <Banknote className="h-6 w-6 mb-2 opacity-20" />
                                            <p className="text-xs font-medium">Belum ada bukti diunggah</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Contact Buyer */}
                            {(() => {
                                const phone = order.user?.whatsapp || order.shippingAddress?.phone;
                                if (!phone) return null;
                                const formattedPhone = phone.replace(/\D/g, '').replace(/^0/, '62').replace(/^8/, '628');
                                const finalPhone = formattedPhone.startsWith('62') ? formattedPhone : `62${formattedPhone}`;

                                return (
                                    <div className="mt-6">
                                        <a
                                            href={`https://wa.me/${finalPhone}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full py-3 bg-[#25D366] text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 hover:bg-[#128C7E] transition-all shadow-md shadow-green-100"
                                        >
                                            <MessageCircle className="h-4 w-4" />
                                            <span>Chat via WhatsApp</span>
                                        </a>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
