import { useState, useEffect } from 'react';
import { X, Package, MapPin, CreditCard, User, Truck, CheckCircle, Clock, AlertTriangle, MessageCircle, Copy, Check } from 'lucide-react';
import { formatPrice, formatDate } from '@/utils/format';
import axios from 'axios';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';

interface OrderDetailsDialogProps {
    orderId: string;
    isOpen: boolean;
    onClose: () => void;
    onStatusUpdate?: () => void;
}

export default function OrderDetailsDialog({ orderId, isOpen, onClose, onStatusUpdate }: OrderDetailsDialogProps) {
    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen && orderId) {
            fetchOrderDetails();
        }
    }, [isOpen, orderId]);

    const fetchOrderDetails = async () => {
        setIsLoading(true);
        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';
            const response = await axios.get(`${apiBaseUrl}/orders/${orderId}`, { withCredentials: true });
            setOrder(response.data);
        } catch (error) {
            console.error('Error fetching order details:', error);
            toast.error('Gagal memuat detail pesanan');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('ID Pesanan disalin');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-3 sm:p-6 border-b border-gray-100 shrink-0">
                    <div>
                        <h2 className="text-sm sm:text-xl font-black text-gray-900 leading-tight">Detail Pesanan</h2>
                        <p className="text-[10px] sm:text-sm text-gray-500 font-medium">#{orderId.slice(-8).toUpperCase()}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                        <X className="h-4 w-4 sm:h-6 sm:w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-8 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                            <div className="h-6 w-6 sm:h-10 sm:w-10 border-2 sm:border-4 border-gray-200 border-t-[#1B5E20] rounded-full animate-spin"></div>
                            <p className="mt-2 sm:mt-4 text-[10px] sm:text-sm font-medium text-gray-500">Memuat data...</p>
                        </div>
                    ) : order ? (
                        <>
                            {/* Status & ID */}
                            <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                <div className={clsx(
                                    "p-2 sm:p-4 rounded-xl sm:rounded-2xl flex items-center space-x-2 sm:space-x-4 border",
                                    order.paymentStatus === 'paid' || order.paymentStatus === 'completed' ? "bg-green-50 border-green-100 text-green-700" :
                                        order.paymentStatus === 'pending' ? "bg-yellow-50 border-yellow-100 text-yellow-700" :
                                            "bg-blue-50 border-blue-100 text-blue-700"
                                )}>
                                    <div className="h-6 w-6 sm:h-10 sm:w-10 bg-white rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                        {order.paymentStatus === 'paid' || order.paymentStatus === 'completed' ? <CheckCircle className="h-3 w-3 sm:h-5 sm:w-5" /> :
                                            order.paymentStatus === 'pending' ? <Clock className="h-3 w-3 sm:h-5 sm:w-5" /> :
                                                <Truck className="h-3 w-3 sm:h-5 sm:w-5" />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] sm:text-[10px] uppercase font-bold tracking-widest opacity-70 truncate">Status</p>
                                        <p className="font-black text-xs sm:text-lg truncate">{order.paymentStatus.toUpperCase()}</p>
                                    </div>
                                </div>
                                <div className="p-2 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-100 flex items-center justify-between">
                                    <div className="min-w-0">
                                        <p className="text-[10px] sm:text-[10px] uppercase font-bold text-gray-400 tracking-widest truncate">Order ID</p>
                                        <p className="font-black text-xs sm:text-base text-gray-900 truncate">#{order.id.slice(-8).toUpperCase()}</p>
                                    </div>
                                    <button onClick={() => handleCopy(order.id)} className="p-1.5 sm:p-2 bg-white rounded-lg sm:rounded-xl border border-gray-200 hover:border-[#1B5E20] text-gray-400 hover:text-[#1B5E20] transition-all shrink-0">
                                        {copied ? <Check className="h-3 w-3 sm:h-4 sm:w-4" /> : <Copy className="h-3 w-3 sm:h-4 sm:w-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Customer & Shipping */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                                <div className="space-y-1.5 sm:space-y-4">
                                    <h3 className="font-bold text-gray-900 flex items-center text-[10px] sm:text-base">
                                        <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-[#1B5E20]" />
                                        Informasi Pembeli
                                    </h3>
                                    <div className="bg-gray-50 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 space-y-0.5 sm:space-y-1">
                                        <p className="font-bold text-gray-900 text-xs sm:text-base truncate">{order.user?.name || 'Guest User'}</p>
                                        <p className="text-[10px] sm:text-sm text-gray-500 truncate">{order.user?.email || '-'}</p>
                                        {order.user?.whatsapp && (
                                            <a href={`https://wa.me/${order.user.whatsapp}`} target="_blank" rel="noreferrer" className="text-[10px] sm:text-sm text-[#1B5E20] font-bold hover:underline flex items-center mt-1 sm:mt-2">
                                                <MessageCircle className="h-3 w-3 mr-1" />
                                                Hubungi via WhatsApp
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1.5 sm:space-y-4">
                                    <h3 className="font-bold text-gray-900 flex items-center text-[10px] sm:text-base">
                                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-[#1B5E20]" />
                                        Alamat Pengiriman
                                    </h3>
                                    <div className="bg-gray-50 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 text-[10px] sm:text-sm text-gray-600 leading-relaxed">
                                        <p className="font-bold text-gray-900 mb-0.5 sm:mb-1 truncate">{order.shippingAddress?.receiverName || order.user?.name || 'Guest'}</p>
                                        <p className="truncate">{order.shippingAddress?.street}, {order.shippingAddress?.city}</p>
                                        <p>{order.shippingAddress?.province}, {order.shippingAddress?.postalCode}</p>
                                        <p className="mt-1 sm:mt-2 font-medium text-gray-800">{order.shippingAddress?.phone}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden">
                                <div className="px-3 py-2 sm:px-5 sm:py-3 bg-gray-50/50 border-b border-gray-50 flex items-center justify-between">
                                    <h3 className="font-bold text-gray-900 flex items-center text-[10px] sm:text-sm">
                                        <Package className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-[#1B5E20]" />
                                        Rincian Produk
                                    </h3>
                                    <span className="text-[10px] sm:text-xs font-bold text-gray-400">{order.items?.length || 0} Barang</span>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {order.items?.map((item: any) => (
                                        <div key={item.id} className="p-2.5 sm:p-4 flex items-start space-x-2.5 sm:space-x-4">
                                            <div className="h-10 w-10 sm:h-16 sm:w-16 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-100 flex-shrink-0 overflow-hidden">
                                                {item.product?.images?.[0]?.url ? (
                                                    <img
                                                        src={item.product.images[0].url.startsWith('http') ? item.product.images[0].url : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5003'}${item.product.images[0].url.startsWith('/') ? '' : '/'}${item.product.images[0].url}`}
                                                        alt={item.product?.name || 'Product'}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center">
                                                        <Package className="h-4 w-4 sm:h-6 sm:w-6 text-gray-300" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-900 text-xs sm:text-sm truncate leading-tight">{item.product?.name || 'Unknown Product'}</h4>
                                                <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{item.quantity} x {formatPrice(item.price)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900 text-xs sm:text-sm">{formatPrice(item.subtotal)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-2.5 sm:p-4 bg-gray-50/30 border-t border-gray-50">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] sm:text-sm font-bold text-gray-500">Total Pesanan</span>
                                        <span className="text-sm sm:text-xl font-black text-[#1B5E20]">{formatPrice(order.totalAmount)}</span>
                                    </div>
                                    <div className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-gray-400 text-right">
                                        Metode: <span className="font-bold uppercase text-gray-600">{order.paymentMethod}</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8 sm:py-12 text-gray-400">
                            <AlertTriangle className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 opacity-20" />
                            <p className="text-[10px] sm:text-sm">Data pesanan tidak ditemukan.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 sm:p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 sm:px-6 sm:py-2.5 bg-white border border-gray-200 text-[10px] sm:text-base text-gray-700 font-bold rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors">
                        Tutup
                    </button>
                    {/* Add more action buttons here if needed */}
                </div>
            </div>
        </div>
    );
}
