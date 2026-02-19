'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import {
    MapPin, CreditCard, ShieldCheck, CheckCircle2,
    ArrowLeft, ArrowRight, Loader2, Copy, ExternalLink, Truck
} from 'lucide-react';
import { formatPrice } from '@/utils/format';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function CheckoutPage() {
    const { items, totalPrice, clearCart } = useCart();
    const { isLoggedIn, user, isLoading } = useAuthStore();
    const router = useRouter();

    const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review, 4: Success
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderResult, setOrderResult] = useState<any>(null);

    // Form States
    const [shippingData, setShippingData] = useState({
        receiverName: '',
        phone: '',
        address: '',
        notes: ''
    });

    // Update initial form state when user is loaded
    useEffect(() => {
        if (user && !shippingData.receiverName) {
            setShippingData(prev => ({
                ...prev,
                receiverName: user.name || '',
                phone: (user as any).whatsapp || '',
                address: (user as any).address || ''
            }));
        }
    }, [user]);

    const [paymentMethod, setPaymentMethod] = useState('bank_transfer');

    // Address Selection State (Moved up to fix Hook Rule violation)
    const [addresses, setAddresses] = useState<any[]>([]);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

    useEffect(() => {
        if (isLoggedIn) {
            fetchAddresses();
        }
    }, [isLoggedIn]);

    useEffect(() => {
        if (!isLoading && !isLoggedIn) {
            router.push('/login?redirect=/checkout');
        }
        if (!isLoading && items.length === 0 && step !== 4) {
            router.push('/cart');
        }
    }, [isLoggedIn, isLoading, items, router, step]);

    const fetchAddresses = async () => {
        try {
            const response = await axios.get(`${apiBaseUrl}/addresses`, { withCredentials: true });
            const addressList = response.data;
            setAddresses(addressList);

            if (addressList.length > 0) {
                // Priority 1: Main Address
                const mainAddress = addressList.find((addr: any) => addr.isMain);
                // Priority 2: First address in the list
                const defaultAddr = mainAddress || addressList[0];

                if (defaultAddr) {
                    setShippingData(prev => ({
                        ...prev,
                        receiverName: defaultAddr.receiverName,
                        phone: defaultAddr.phone,
                        address: `${defaultAddr.street}, ${defaultAddr.city}, ${defaultAddr.province}, ${defaultAddr.postalCode}`,
                    }));
                    setSelectedAddressId(defaultAddr.id);
                }
            } else if (user) {
                // Fallback: Use profile data if no dedicated addresses found
                setShippingData(prev => ({
                    ...prev,
                    receiverName: user.name || '',
                    phone: (user as any).whatsapp || prev.phone,
                    address: (user as any).address || prev.address
                }));
            }
        } catch (err) {
            console.error('Error fetching addresses:', err);
        }
    };

    const handleSelectAddress = (addr: any) => {
        setShippingData({
            receiverName: addr.receiverName,
            phone: addr.phone,
            address: defaultAddrString(addr),
            notes: shippingData.notes
        });
        setSelectedAddressId(addr.id);
        setIsAddressModalOpen(false);
    };

    const defaultAddrString = (addr: any) => {
        return `${addr.street}, ${addr.city}, ${addr.province}, ${addr.postalCode}`;
    };

    const [availablePaymentMethods, setAvailablePaymentMethods] = useState<string[]>([]);
    const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(false);

    useEffect(() => {
        if (items.length > 0) {
            fetchPaymentMethods();
        }
    }, [items]);

    const fetchPaymentMethods = async () => {
        setIsLoadingPaymentMethods(true);
        try {
            // Get unique shop slugs from items
            // Note: Currently cart items store shopId as slug based on product page logic
            // If shopId is ID, we might need to adjust, but based on product page:
            // shopId: product.shop.slug
            const uniqueSlugs = Array.from(new Set(items.map(item => item.shopId)));

            if (uniqueSlugs.length === 0) return;

            const response = await axios.post(`${apiBaseUrl}/shops/payment-methods`, {
                slugs: uniqueSlugs
            }, { withCredentials: true });

            const shops = response.data;

            if (shops.length > 0) {
                // Find intersection of payment methods
                // Start with the first shop's methods
                let commonMethods = shops[0].paymentMethods || [];

                // Intersect with other shops
                for (let i = 1; i < shops.length; i++) {
                    const shopMethods = shops[i].paymentMethods || [];
                    commonMethods = commonMethods.filter((method: string) => shopMethods.includes(method));
                }

                // If no common methods found, or if methods include 'manual_transfer', ensure it's handled on UI
                // If commonMethods is empty but shops exist, it means NO common method.
                // However, we default to 'bank_transfer' (manual) often.
                // Let's rely on what DB returns.
                // If DB returns empty array [], it might mean defaults or strict NO.
                // For now, let's assume if 'manual_transfer' or 'bank_transfer' is not there, we can't use it.
                // BUT for compatibility, if the array is empty in DB, maybe we assume ALL or Default?
                // Let's assume empty = default ['bank_transfer'] for now to be safe, or handle strictly.
                // Better strictly:

                // Map DB codes to UI codes if needed.
                // converting 'manual_transfer' -> 'bank_transfer' if that's the mismatch
                // DB usually stores: 'manual_transfer', 'cod', 'e_wallet'
                // UI state uses: 'bank_transfer'

                const uiMethods = commonMethods.map((m: string) => m === 'manual_transfer' ? 'bank_transfer' : m);

                // Fallback: If DB had no payment info (old records), maybe default to bank_transfer?
                // Or if commonMethods is empty, show error?
                /* 
                 * Allow fallback to bank_transfer if array is empty (legacy support)
                 * Otherwise use strict intersection
                 */
                if (shops.every((s: any) => !s.paymentMethods || s.paymentMethods.length === 0)) {
                    setAvailablePaymentMethods(['bank_transfer']);
                } else {
                    setAvailablePaymentMethods(uiMethods);
                }

                // Set default selected
                if (uiMethods.length > 0 && !uiMethods.includes(paymentMethod)) {
                    setPaymentMethod(uiMethods[0]);
                } else if (uiMethods.length === 0) {
                    // No common methods
                    setPaymentMethod('');
                }

            }
        } catch (error) {
            console.error('Error fetching payment methods:', error);
            // Fallback to default
            setAvailablePaymentMethods(['bank_transfer']);
        } finally {
            setIsLoadingPaymentMethods(false);
        }
    };

    const handleCreateOrder = async () => {
        setIsSubmitting(true);
        try {
            const response = await axios.post(`${apiBaseUrl}/orders`, {
                items: items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                })),
                paymentMethod,
                shippingAddress: {
                    name: shippingData.receiverName,
                    phone: shippingData.phone,
                    address: shippingData.address
                },
                notes: shippingData.notes
            }, { withCredentials: true });

            setOrderResult(response.data);
            setStep(4);
            clearCart();
        } catch (error: any) {
            console.error('Checkout error:', error);
            alert(error.response?.data?.message || 'Gagal membuat pesanan');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-[#1B5E20] animate-spin" />
            </div>
        );
    }





    // Step 1: Shipping Info
    if (step === 1) {
        return (
            <div className="min-h-screen bg-gray-50 pb-24 font-[family-name:var(--font-poppins)]">
                <div className="max-w-3xl mx-auto px-4 py-8">
                    <button onClick={() => router.back()} className="flex items-center text-gray-500 font-bold mb-6 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Kembali ke Keranjang
                    </button>

                    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-2xl font-black text-gray-900">Alamat Pengiriman</h1>
                            <div className="flex items-center space-x-1">
                                <div className="h-2 w-8 bg-[#1B5E20] rounded-full"></div>
                                <div className="h-2 w-2 bg-gray-200 rounded-full"></div>
                                <div className="h-2 w-2 bg-gray-200 rounded-full"></div>
                            </div>
                        </div>

                        {/* Address Selection Button */}
                        {addresses.length > 0 && (
                            <div className="mb-6">
                                <button
                                    onClick={() => setIsAddressModalOpen(true)}
                                    className="w-full py-3 border-2 border-[#1B5E20] text-[#1B5E20] rounded-2xl font-bold hover:bg-green-50 transition flex items-center justify-center space-x-2"
                                >
                                    <MapPin className="h-5 w-5" />
                                    <span>Pilih dari Daftar Alamat</span>
                                </button>
                            </div>
                        )}

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Nama Penerima</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Budi Santoso"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 font-bold text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:border-[#1B5E20] transition-all"
                                    value={shippingData.receiverName}
                                    onChange={(e) => setShippingData({ ...shippingData, receiverName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Nomor WhatsApp</label>
                                <input
                                    type="tel"
                                    placeholder="Contoh: 081234567890"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 font-bold text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:border-[#1B5E20] transition-all"
                                    value={shippingData.phone}
                                    onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Alamat Lengkap (Rt/Rw, No Rumah)</label>
                                <textarea
                                    rows={3}
                                    placeholder="Contoh: Jl. Sudirman No. 123, RT 01/RW 02"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 font-bold text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:border-[#1B5E20] transition-all"
                                    value={shippingData.address}
                                    onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            disabled={!shippingData.receiverName || !shippingData.phone || !shippingData.address}
                            onClick={() => setStep(2)}
                            className="w-full mt-10 py-5 bg-[#1B5E20] text-white rounded-2xl font-black text-lg shadow-xl shadow-green-100 hover:bg-green-800 transition active:scale-95 disabled:bg-gray-200 disabled:shadow-none flex items-center justify-center space-x-2"
                        >
                            <span>Lanjut ke Pembayaran</span>
                            <ArrowRight className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Address Selection Modal */}
                {isAddressModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-[2rem] p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-black text-gray-900">Pilih Alamat</h3>
                                <button onClick={() => setIsAddressModalOpen(false)} className="text-gray-500 hover:text-gray-900 font-bold">Tutup</button>
                            </div>
                            <div className="space-y-3">
                                {addresses.map((addr) => (
                                    <button
                                        key={addr.id}
                                        onClick={() => handleSelectAddress(addr)}
                                        className={`w-full text-left p-4 border-2 rounded-2xl transition-all group relative ${selectedAddressId === addr.id
                                            ? 'border-[#1B5E20] bg-green-50/50'
                                            : 'border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-200'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black text-gray-900">{addr.label}</span>
                                                {addr.isMain && <span className="px-2 py-0.5 bg-[#1B5E20]/10 text-[#1B5E20] text-[9px] font-bold rounded-full uppercase">Utama</span>}
                                            </div>
                                            {selectedAddressId === addr.id && <CheckCircle2 className="h-4 w-4 text-[#1B5E20]" />}
                                        </div>
                                        <p className="text-sm font-bold text-gray-800">{addr.receiverName}</p>
                                        <p className="text-xs text-gray-600 font-medium">{addr.phone}</p>
                                        <p className="text-xs text-gray-500 mt-1 leading-tight">{addr.street}, {addr.city}, {addr.province}, {addr.postalCode}</p>
                                    </button>
                                ))}
                            </div>
                            <div className="mt-6 pt-4 border-t">
                                <Link href="/dashboard/profile" className="block text-center text-sm font-bold text-[#1B5E20] hover:underline">
                                    + Kelola / Tambah Alamat Baru
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Step 2: Payment Method
    if (step === 2) {
        return (
            <div className="min-h-screen bg-gray-50 pb-24 font-[family-name:var(--font-poppins)]">
                <div className="max-w-3xl mx-auto px-4 py-8">
                    <button onClick={() => setStep(1)} className="flex items-center text-gray-500 font-bold mb-6 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Kembali ke Alamat
                    </button>

                    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-2xl font-black text-gray-900">Pilih Pembayaran</h1>
                            <div className="flex items-center space-x-1">
                                <div className="h-2 w-2 bg-[#1B5E20] rounded-full"></div>
                                <div className="h-2 w-8 bg-[#1B5E20] rounded-full"></div>
                                <div className="h-2 w-2 bg-gray-200 rounded-full"></div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {isLoadingPaymentMethods ? (
                                <div className="p-8 text-center text-gray-500">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-[#1B5E20]" />
                                    <p className="text-sm font-medium">Memuat metode pembayaran...</p>
                                </div>
                            ) : availablePaymentMethods.length === 0 ? (
                                <div className="p-6 bg-red-50 rounded-3xl border border-red-100 text-center">
                                    <p className="text-red-800 font-bold mb-1">Tidak ada metode pembayaran yang tersedia</p>
                                    <p className="text-red-600 text-sm">Toko-toko yang Anda pilih tidak memiliki metode pembayaran yang sama. Silakan split order Anda.</p>
                                </div>
                            ) : (
                                <>
                                    {availablePaymentMethods.includes('bank_transfer') && (
                                        <button
                                            onClick={() => setPaymentMethod('bank_transfer')}
                                            className={`w-full flex items-center justify-between p-6 rounded-3xl border-2 transition-all ${paymentMethod === 'bank_transfer' ? 'border-[#1B5E20] bg-green-50' : 'border-gray-50 hover:border-gray-200 bg-gray-50'}`}
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className={`p-3 rounded-xl ${paymentMethod === 'bank_transfer' ? 'bg-[#1B5E20] text-white' : 'bg-white text-gray-400'}`}>
                                                    <CreditCard className="h-6 w-6" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-bold text-gray-900">Transfer Bank (Manual)</p>
                                                    <p className="text-xs text-gray-500 font-medium">Verifikasi otomatis (Soon)</p>
                                                </div>
                                            </div>
                                            {paymentMethod === 'bank_transfer' && <CheckCircle2 className="h-6 w-6 text-[#1B5E20]" />}
                                        </button>
                                    )}

                                    {availablePaymentMethods.includes('cod') && (
                                        <button
                                            onClick={() => setPaymentMethod('cod')}
                                            className={`w-full flex items-center justify-between p-6 rounded-3xl border-2 transition-all ${paymentMethod === 'cod' ? 'border-[#1B5E20] bg-green-50' : 'border-gray-50 hover:border-gray-200 bg-gray-50'}`}
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className={`p-3 rounded-xl ${paymentMethod === 'cod' ? 'bg-[#1B5E20] text-white' : 'bg-white text-gray-400'}`}>
                                                    <Truck className="h-6 w-6" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-bold text-gray-900">Bayar di Tempat (COD)</p>
                                                    <p className="text-xs text-gray-500 font-medium">Bayar tunai saat kurir tiba</p>
                                                </div>
                                            </div>
                                            {paymentMethod === 'cod' && <CheckCircle2 className="h-6 w-6 text-[#1B5E20]" />}
                                        </button>
                                    )}

                                    {/* E-Wallet Placeholder - can be enabled if backend sends 'e_wallet' */}
                                    <button
                                        disabled
                                        className="w-full flex items-center justify-between p-6 rounded-3xl border-2 border-gray-50 bg-gray-50 opacity-60 cursor-not-allowed"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="p-3 bg-white text-gray-300 rounded-xl">
                                                <ShieldCheck className="h-6 w-6" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-gray-900">E-Wallet (OVO, Dana, QRIS)</p>
                                                <p className="text-[10px] bg-yellow-100 text-yellow-700 font-black px-2 py-0.5 rounded inline-block mt-1">COMING SOON</p>
                                            </div>
                                        </div>
                                    </button>
                                </>
                            )}
                        </div>

                        <button
                            onClick={() => setStep(3)}
                            className="w-full mt-10 py-5 bg-[#1B5E20] text-white rounded-2xl font-black text-lg shadow-xl shadow-green-100 hover:bg-green-800 transition active:scale-95 flex items-center justify-center space-x-2"
                        >
                            <span>Review Pesanan</span>
                            <ArrowRight className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Step 3: Review Order
    if (step === 3) {
        return (
            <div className="min-h-screen bg-gray-50 pb-24 font-[family-name:var(--font-poppins)]">
                <div className="max-w-3xl mx-auto px-4 py-8">
                    <button onClick={() => setStep(2)} className="flex items-center text-gray-500 font-bold mb-6 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Kembali ke Pembayaran
                    </button>

                    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-2xl font-black text-gray-900">Review Akhir</h1>
                            <div className="flex items-center space-x-1">
                                <div className="h-2 w-2 bg-[#1B5E20] rounded-full"></div>
                                <div className="h-2 w-2 bg-[#1B5E20] rounded-full"></div>
                                <div className="h-2 w-8 bg-[#1B5E20] rounded-full"></div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-gray-50 p-6 rounded-3xl">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Tujuan Pengiriman</p>
                                <p className="font-black text-gray-900">{shippingData.receiverName}</p>
                                <p className="text-sm font-bold text-gray-500 mt-1">{shippingData.phone}</p>
                                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{shippingData.address}</p>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-3xl">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Metode Pembayaran</p>
                                <div className="flex items-center space-x-3">
                                    {paymentMethod === 'bank_transfer' ? (
                                        <>
                                            <CreditCard className="h-5 w-5 text-[#1B5E20]" />
                                            <span className="font-bold text-gray-900">Transfer Bank (Manual)</span>
                                        </>
                                    ) : paymentMethod === 'cod' ? (
                                        <>
                                            <Truck className="h-5 w-5 text-[#1B5E20]" />
                                            <span className="font-bold text-gray-900">Bayar di Tempat (COD)</span>
                                        </>
                                    ) : (
                                        <span className="font-bold text-gray-900 capitalize">{paymentMethod.replace('_', ' ')}</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Item Pesanan</p>
                                <div className="space-y-3">
                                    {items.map((item) => (
                                        <div key={item.productId} className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600 font-medium">
                                                <span className="font-black text-[#1B5E20] mr-2">{item.quantity}x</span>
                                                {item.name}
                                            </span>
                                            <span className="font-black text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-dashed border-gray-200">
                                <div className="flex justify-between items-end">
                                    <span className="font-bold text-gray-400">Total Pembayaran</span>
                                    <span className="text-2xl font-black text-[#1B5E20]">{formatPrice(totalPrice)}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={isSubmitting}
                            onClick={handleCreateOrder}
                            className="w-full mt-10 py-5 bg-[#1B5E20] text-white rounded-2xl font-black text-lg shadow-xl shadow-green-100 hover:bg-green-800 transition active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                            {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                                <>
                                    <span>{paymentMethod === 'cod' ? 'Konfirmasi Pesanan' : 'Konfirmasi & Bayar'}</span>
                                    <CheckCircle2 className="h-6 w-6" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Step 4: Success & Payment Instructions
    if (step === 4) {
        // Calculate totals from multiple orders if applicable
        const orders = orderResult?.orders || [orderResult];
        const totalAmount = orders.reduce((sum: number, order: any) => sum + Number(order.totalAmount), 0);
        const orderIds = orders.map((o: any) => o.id);

        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-[family-name:var(--font-poppins)]">
                <div className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-2xl border border-gray-100 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-[#1B5E20]"></div>

                    <div className="h-24 w-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        {paymentMethod === 'cod' ? (
                            <Truck className="h-12 w-12 text-[#1B5E20]" />
                        ) : (
                            <CheckCircle2 className="h-12 w-12 text-[#1B5E20]" />
                        )}
                    </div>

                    <h1 className="text-2xl font-black text-gray-900 mb-2">
                        {paymentMethod === 'cod' ? 'Pesanan Berhasil!' : 'Pesanan Dibuat!'}
                    </h1>
                    <p className="text-gray-500 font-medium mb-8">
                        {orders.length > 1
                            ? `Berhasil membuat ${orders.length} pesanan terpisah.`
                            : paymentMethod === 'cod'
                                ? 'Pesanan Anda akan segera diproses oleh penjual.'
                                : 'Silakan selesaikan pembayaran untuk memproses pesanan Anda.'}
                    </p>

                    <div className="bg-gray-50 p-6 rounded-3xl text-left mb-8 space-y-4">
                        {paymentMethod === 'bank_transfer' && (
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Rekening Tujuan</p>
                                <div className="p-4 bg-white rounded-2xl border border-gray-100 flex items-center justify-between">
                                    <div>
                                        <p className="font-black text-gray-900">BCA - 8620 1234 56</p>
                                        <p className="text-xs text-gray-500 font-bold uppercase">A.N PT AXON DIGITAL INDO</p>
                                    </div>
                                    <button className="p-2 text-gray-400 hover:text-[#1B5E20] transition-colors">
                                        <Copy className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {paymentMethod === 'cod' && (
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Instruksi Pembayaran</p>
                                <div className="p-4 bg-white rounded-2xl border border-gray-100">
                                    <p className="font-bold text-gray-900 leading-relaxed text-sm">
                                        Siapkan uang tunai sejumlah <span className="text-[#1B5E20] text-lg">{formatPrice(totalAmount)}</span> saat kurir tiba di lokasi Anda.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Nominal</p>
                            <p className="text-2xl font-black text-[#1B5E20]">{formatPrice(totalAmount)}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Link
                            href="/dashboard/orders"
                            className="block w-full py-4 bg-[#1B5E20] text-white rounded-2xl font-black hover:bg-green-800 transition shadow-lg shadow-green-100"
                        >
                            Lihat Daftar Pesanan
                        </Link>
                        <button
                            onClick={() => router.push('/')}
                            className="block w-full py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition border border-gray-100"
                        >
                            Kembali ke Beranda
                        </button>
                    </div>

                    <div className="mt-8 text-[9px] text-gray-400 font-bold uppercase tracking-widest space-y-1">
                        {orderIds.map((id: string) => (
                            <p key={id}>ORDER ID: {id}</p>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
