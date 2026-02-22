'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCart } from '@/hooks/useCart';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import {
    MapPin, CreditCard, ShieldCheck, CheckCircle2,
    ArrowLeft, ArrowRight, Loader2, Copy, ExternalLink, Truck, Store, Banknote, Package
} from 'lucide-react';
import { formatPrice } from '@/utils/format';
import { toast } from 'sonner';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';

interface Address {
    id: string;
    label: string;
    receiverName: string;
    phone: string;
    street: string;
    city: string;
    province: string;
    postalCode: string;
    isMain: boolean;
}

interface Shop {
    id: string;
    name: string;
    paymentMethods?: string[];
    qrisImage?: string;
    bankName?: string;
    bankAccountName?: string;
    bankAccountNumber?: string;
}

interface Order {
    id: string;
    totalAmount: number;
    items: { productId: string; }[];
    shop: Shop;
}

interface OrderResult {
    orders: Order[];
}

export default function CheckoutPage() {
    const { items, totalPrice, clearCart } = useCart();
    const { isLoggedIn, user, isLoading } = useAuthStore();
    const router = useRouter();

    const [step, setStep] = useState(1); // 1: Shipping, 2: Shipping Method, 3: Payment, 4: Review, 5: Success
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
    const [shippingMethod, setShippingMethod] = useState('seller'); // Default to seller delivery

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
                phone: (user as { whatsapp?: string }).whatsapp || '',
                address: (user as { address?: string }).address || ''
            }));
        }
    }, [user, shippingData.receiverName]);

    const [paymentMethod, setPaymentMethod] = useState('transfer');

    // Address Selection State (Moved up to fix Hook Rule violation)
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

    const fetchAddresses = useCallback(async () => {
        try {
            const response = await axios.get(`${apiBaseUrl}/addresses`, { withCredentials: true });
            const addressList = response.data;
            setAddresses(addressList);

            if (addressList.length > 0) {
                // Priority 1: Main Address
                const mainAddress = addressList.find((addr: Address) => addr.isMain);
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
                    phone: (user as { whatsapp?: string }).whatsapp || prev.phone,
                    address: (user as { address?: string }).address || prev.address
                }));
            }
        } catch (err) {
            console.error('Error fetching addresses:', err);
        }
    }, [user]);

    useEffect(() => {
        if (isLoggedIn) {
            fetchAddresses();
        }
    }, [isLoggedIn, fetchAddresses]);

    useEffect(() => {
        if (!isLoading && !isLoggedIn) {
            router.push('/login?redirect=/checkout');
        }
        if (!isLoading && items.length === 0 && step !== 4) {
            router.push('/cart');
        }
    }, [isLoggedIn, isLoading, items, router, step]);

    const handleSelectAddress = (addr: Address) => {
        setShippingData({
            receiverName: addr.receiverName,
            phone: addr.phone,
            address: defaultAddrString(addr),
            notes: shippingData.notes
        });
        setSelectedAddressId(addr.id);
        setIsAddressModalOpen(false);
    };

    const defaultAddrString = (addr: Address) => {
        return `${addr.street}, ${addr.city}, ${addr.province}, ${addr.postalCode}`;
    };

    const [availablePaymentMethods, setAvailablePaymentMethods] = useState<string[]>([]);
    const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(false);

    const fetchPaymentMethods = useCallback(async () => {
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

                // Map legacy codes to new codes if necessary
                const normalizedMethods = commonMethods.map((m: string) => {
                    if (m === 'manual_transfer' || m === 'bank_transfer') return 'transfer';
                    return m;
                });

                // Fallback: If DB had no payment info (old records), default to transfer
                if (shops.every((s: Shop) => !s.paymentMethods || s.paymentMethods.length === 0)) {
                    setAvailablePaymentMethods(['transfer', 'cod']);
                } else {
                    setAvailablePaymentMethods(normalizedMethods);
                }

                // Set default selected
                if (normalizedMethods.length > 0 && !normalizedMethods.includes(paymentMethod)) {
                    setPaymentMethod(normalizedMethods[0]);
                } else if (normalizedMethods.length === 0) {
                    // No common methods
                    setPaymentMethod('');
                }
            }
        } catch (error) {
            console.error('Error fetching payment methods:', error);
            // Fallback to default
            setAvailablePaymentMethods(['transfer']);
        } finally {
            setIsLoadingPaymentMethods(false);
        }
    }, [items, paymentMethod]);

    useEffect(() => {
        if (items.length > 0) {
            fetchPaymentMethods();
        }
    }, [items, fetchPaymentMethods]);

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
            setStep(5);
            clearCart();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            console.error('Checkout error:', error);
            alert(err.response?.data?.message || 'Gagal membuat pesanan');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-brand animate-spin" />
            </div>
        );
    }





    // Step 1: Shipping Info
    if (step === 1) {
        return (
            <div className="min-h-screen bg-gray-50 pb-24 font-(family-name:--font-poppins)">
                <div className="max-w-3xl mx-auto px-4 py-6 md:py-8">
                    <button onClick={() => router.back()} className="flex items-center text-[10px] sm:text-base text-gray-500 font-bold mb-4 md:mb-6 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-1.5" />
                        Kembali ke Keranjang
                    </button>

                    <div className="bg-white rounded-4xl md:rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-gray-100">
                        <div className="flex items-center justify-between mb-6 md:mb-8">
                            <h1 className="text-base md:text-2xl font-black text-gray-900">Alamat Pengiriman</h1>
                            <div className="flex items-center space-x-1">
                                <div className="h-2 w-8 bg-brand rounded-full"></div>
                                <div className="h-2 w-2 bg-gray-200 rounded-full"></div>
                                <div className="h-2 w-2 bg-gray-200 rounded-full"></div>
                            </div>
                        </div>

                        {/* Address Selection Button */}
                        {addresses.length > 0 && (
                            <div className="mb-6">
                                <button
                                    onClick={() => setIsAddressModalOpen(true)}
                                    className="w-full py-2.5 md:py-3 border-2 border-brand text-brand rounded-2xl font-bold text-[11px] md:text-base hover:bg-green-50 transition flex items-center justify-center space-x-2"
                                >
                                    <MapPin className="h-4 w-4 md:h-5 md:w-5" />
                                    <span>Pilih dari Daftar Alamat</span>
                                </button>
                            </div>
                        )}

                        <div className="space-y-4 md:space-y-6">
                            <div>
                                <label className="block text-[8px] md:text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 md:mb-2">Nama Penerima</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Budi Santoso"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 md:py-4 px-4 md:px-6 font-bold text-sm md:text-base text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:border-brand transition-all"
                                    value={shippingData.receiverName}
                                    onChange={(e) => setShippingData({ ...shippingData, receiverName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[8px] md:text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 md:mb-2">Nomor WhatsApp</label>
                                <input
                                    type="tel"
                                    placeholder="Contoh: 081234567890"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 md:py-4 px-4 md:px-6 font-bold text-sm md:text-base text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:border-brand transition-all"
                                    value={shippingData.phone}
                                    onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[8px] md:text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 md:mb-2">Alamat Lengkap (Rt/Rw, No Rumah)</label>
                                <textarea
                                    rows={3}
                                    placeholder="Contoh: Jl. Sudirman No. 123, RT 01/RW 02"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 md:py-4 px-4 md:px-6 font-bold text-sm md:text-base text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:border-brand transition-all"
                                    value={shippingData.address}
                                    onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            disabled={!shippingData.receiverName || !shippingData.phone || !shippingData.address}
                            onClick={() => setStep(2)}
                            className="w-full mt-8 md:mt-10 py-4 md:py-5 bg-brand text-white rounded-2xl font-black text-sm md:text-lg shadow-xl shadow-green-100 hover:bg-green-800 transition active:scale-95 disabled:bg-gray-200 disabled:shadow-none flex items-center justify-center space-x-2"
                        >
                            <span>Lanjut ke Metode Pengiriman</span>
                            <ArrowRight className="h-4 w-4 md:h-6 md:w-6" />
                        </button>
                    </div>
                </div>

                {/* Address Selection Modal */}
                {isAddressModalOpen && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-4xl p-5 md:p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4 md:mb-6">
                                <h3 className="text-sm md:text-lg font-black text-gray-900">Pilih Alamat</h3>
                                <button onClick={() => setIsAddressModalOpen(false)} className="text-[10px] md:text-sm text-gray-500 hover:text-gray-900 font-bold">Tutup</button>
                            </div>
                            <div className="space-y-3">
                                {addresses.map((addr) => (
                                    <button
                                        key={addr.id}
                                        onClick={() => handleSelectAddress(addr)}
                                        className={`w-full text-left p-3 md:p-4 border-2 rounded-2xl transition-all group relative ${selectedAddressId === addr.id
                                            ? 'border-brand bg-green-50/50'
                                            : 'border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-200'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] md:text-xs font-black text-gray-900">{addr.label}</span>
                                                {addr.isMain && <span className="px-2 py-0.5 bg-brand/10 text-brand text-[8px] md:text-[9px] font-bold rounded-full uppercase">Utama</span>}
                                            </div>
                                            {selectedAddressId === addr.id && <CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4 text-brand" />}
                                        </div>
                                        <p className="text-[10px] md:text-sm font-bold text-gray-800">{addr.receiverName}</p>
                                        <p className="text-[9px] md:text-xs text-gray-600 font-medium">{addr.phone}</p>
                                        <p className="text-[9px] md:text-xs text-gray-500 mt-1 leading-tight">{addr.street}, {addr.city}, {addr.province}, {addr.postalCode}</p>
                                    </button>
                                ))}
                            </div>
                            <div className="mt-5 pt-4 border-t">
                                <Link href="/dashboard/profile" className="block text-center text-[11px] md:text-sm font-bold text-brand hover:underline">
                                    + Kelola / Tambah Alamat Baru
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Step 2: Shipping Method
    if (step === 2) {
        return (
            <div className="min-h-screen bg-gray-50 pb-24 font-(family-name:--font-poppins)">
                <div className="max-w-3xl mx-auto px-4 py-6 md:py-8">
                    <button onClick={() => setStep(1)} className="flex items-center text-[10px] sm:text-base text-gray-500 font-bold mb-4 md:mb-6 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-1.5" />
                        Kembali ke Alamat
                    </button>

                    <div className="bg-white rounded-4xl md:rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-gray-100">
                        <div className="flex items-center justify-between mb-6 md:mb-8">
                            <h1 className="text-base md:text-2xl font-black text-gray-900">Metode Pengiriman</h1>
                            <div className="flex items-center space-x-1">
                                <div className="h-2 w-2 bg-brand rounded-full"></div>
                                <div className="h-2 w-8 bg-brand rounded-full"></div>
                                <div className="h-2 w-2 bg-gray-200 rounded-full"></div>
                            </div>
                        </div>

                        <div className="space-y-3 md:space-y-4">
                            {/* Seller Delivery */}
                            <button
                                onClick={() => setShippingMethod('seller')}
                                className={`w-full flex items-center justify-between p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 transition-all ${shippingMethod === 'seller' ? 'border-brand bg-green-50' : 'border-gray-50 hover:border-gray-200 bg-gray-50'}`}
                            >
                                <div className="flex items-center space-x-3 md:space-x-4">
                                    <div className={`p-2.5 md:p-3 rounded-xl ${shippingMethod === 'seller' ? 'bg-brand text-white' : 'bg-white text-gray-400'}`}>
                                        <Store className="h-5 w-5 md:h-6 md:w-6" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs md:text-base font-bold text-gray-900">Dikirim Oleh Penjual</p>
                                        <p className="text-[9px] md:text-xs text-gray-500 font-medium">Penjual akan mengirimkan pesanan Anda</p>
                                    </div>
                                </div>
                                {shippingMethod === 'seller' && <CheckCircle2 className="h-4 w-4 md:h-6 md:w-6 text-brand" />}
                            </button>

                            {/* Coming Soon: Grab */}
                            <button
                                disabled
                                className="w-full flex items-center justify-between p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 border-gray-50 bg-gray-50 opacity-60 cursor-not-allowed"
                            >
                                <div className="flex items-center space-x-3 md:space-x-4">
                                    <div className="p-2.5 md:p-3 bg-white text-gray-300 rounded-xl">
                                        <Truck className="h-5 w-5 md:h-6 md:w-6" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs md:text-base font-bold text-gray-900">Grab</p>
                                        <p className="text-[8px] md:text-[10px] bg-yellow-100 text-yellow-700 font-black px-2 py-0.5 rounded inline-block mt-1">COMING SOON</p>
                                    </div>
                                </div>
                            </button>

                            {/* Coming Soon: Gojek */}
                            <button
                                disabled
                                className="w-full flex items-center justify-between p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 border-gray-50 bg-gray-50 opacity-60 cursor-not-allowed"
                            >
                                <div className="flex items-center space-x-3 md:space-x-4">
                                    <div className="p-2.5 md:p-3 bg-white text-gray-300 rounded-xl">
                                        <Truck className="h-5 w-5 md:h-6 md:w-6" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs md:text-base font-bold text-gray-900">Gojek</p>
                                        <p className="text-[8px] md:text-[10px] bg-yellow-100 text-yellow-700 font-black px-2 py-0.5 rounded inline-block mt-1">COMING SOON</p>
                                    </div>
                                </div>
                            </button>

                            {/* Coming Soon: Maxim */}
                            <button
                                disabled
                                className="w-full flex items-center justify-between p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 border-gray-50 bg-gray-50 opacity-60 cursor-not-allowed"
                            >
                                <div className="flex items-center space-x-3 md:space-x-4">
                                    <div className="p-2.5 md:p-3 bg-white text-gray-300 rounded-xl">
                                        <Truck className="h-5 w-5 md:h-6 md:w-6" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs md:text-base font-bold text-gray-900">Maxim</p>
                                        <p className="text-[8px] md:text-[10px] bg-yellow-100 text-yellow-700 font-black px-2 py-0.5 rounded inline-block mt-1">COMING SOON</p>
                                    </div>
                                </div>
                            </button>

                            {/* Coming Soon: Lalamove */}
                            <button
                                disabled
                                className="w-full flex items-center justify-between p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 border-gray-50 bg-gray-50 opacity-60 cursor-not-allowed"
                            >
                                <div className="flex items-center space-x-3 md:space-x-4">
                                    <div className="p-2.5 md:p-3 bg-white text-gray-300 rounded-xl">
                                        <Package className="h-5 w-5 md:h-6 md:w-6" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs md:text-base font-bold text-gray-900">Lalamove</p>
                                        <p className="text-[8px] md:text-[10px] bg-yellow-100 text-yellow-700 font-black px-2 py-0.5 rounded inline-block mt-1">COMING SOON</p>
                                    </div>
                                </div>
                            </button>
                        </div>

                        <button
                            onClick={() => setStep(3)}
                            className="w-full mt-8 md:mt-10 py-4 md:py-5 bg-brand text-white rounded-2xl font-black text-sm md:text-lg shadow-xl shadow-green-100 hover:bg-green-800 transition active:scale-95 flex items-center justify-center space-x-2"
                        >
                            <span>Lanjut ke Pembayaran</span>
                            <ArrowRight className="h-4 w-4 md:h-6 md:w-6" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Step 3: Payment Method
    if (step === 3) {
        return (
            <div className="min-h-screen bg-gray-50 pb-24 font-(family-name:--font-poppins)\">
                <div className="max-w-3xl mx-auto px-4 py-6 md:py-8">
                    <button onClick={() => setStep(2)} className="flex items-center text-[10px] sm:text-base text-gray-500 font-bold mb-4 md:mb-6 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-1.5" />
                        Kembali ke Metode Pengiriman
                    </button>

                    <div className="bg-white rounded-4xl md:rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-gray-100">
                        <div className="flex items-center justify-between mb-6 md:mb-8">
                            <h1 className="text-base md:text-2xl font-black text-gray-900">Pilih Pembayaran</h1>
                            <div className="flex items-center space-x-1">
                                <div className="h-2 w-2 bg-brand rounded-full"></div>
                                <div className="h-2 w-8 bg-brand rounded-full"></div>
                                <div className="h-2 w-2 bg-gray-200 rounded-full"></div>
                            </div>
                        </div>

                        <div className="space-y-3 md:space-y-4">
                            {isLoadingPaymentMethods ? (
                                <div className="p-8 text-center text-gray-500">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-brand" />
                                    <p className="text-[10px] md:text-sm font-medium">Memuat metode pembayaran...</p>
                                </div>
                            ) : availablePaymentMethods.length === 0 ? (
                                <div className="p-5 md:p-6 bg-red-50 rounded-2xl border border-red-100 text-center">
                                    <p className="text-red-800 text-xs md:text-base font-bold mb-1">Tidak ada metode pembayaran yang tersedia</p>
                                    <p className="text-red-600 text-[10px] md:text-sm">Toko-toko yang Anda pilih tidak memiliki metode pembayaran yang sama.</p>
                                </div>
                            ) : (
                                <>
                                    {availablePaymentMethods.includes('transfer') && (
                                        <button
                                            onClick={() => setPaymentMethod('transfer')}
                                            className={`w-full flex items-center justify-between p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 transition-all ${paymentMethod === 'transfer' ? 'border-brand bg-green-50' : 'border-gray-50 hover:border-gray-200 bg-gray-50'}`}
                                        >
                                            <div className="flex items-center space-x-3 md:space-x-4">
                                                <div className={`p-2.5 md:p-3 rounded-xl ${paymentMethod === 'transfer' ? 'bg-brand text-white' : 'bg-white text-gray-400'}`}>
                                                    <CreditCard className="h-5 w-5 md:h-6 md:w-6" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-xs md:text-base font-bold text-gray-900">Transfer Bank (Manual)</p>
                                                    <p className="text-[9px] md:text-xs text-gray-500 font-medium">Verifikasi oleh penjual</p>
                                                </div>
                                            </div>
                                            {paymentMethod === 'transfer' && <CheckCircle2 className="h-4 w-4 md:h-6 md:w-6 text-brand" />}
                                        </button>
                                    )}

                                    {availablePaymentMethods.includes('qris') && (
                                        <button
                                            onClick={() => setPaymentMethod('qris')}
                                            className={`w-full flex items-center justify-between p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 transition-all ${paymentMethod === 'qris' ? 'border-brand bg-green-50' : 'border-gray-50 hover:border-gray-200 bg-gray-50'}`}
                                        >
                                            <div className="flex items-center space-x-3 md:space-x-4">
                                                <div className={`p-2.5 md:p-3 rounded-xl ${paymentMethod === 'qris' ? 'bg-brand text-white' : 'bg-white text-gray-400'}`}>
                                                    <Banknote className="h-5 w-5 md:h-6 md:w-6" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-xs md:text-base font-bold text-gray-900">QRIS Pribadi</p>
                                                    <p className="text-[9px] md:text-xs text-gray-500 font-medium">Scan QR & Upload bukti</p>
                                                </div>
                                            </div>
                                            {paymentMethod === 'qris' && <CheckCircle2 className="h-4 w-4 md:h-6 md:w-6 text-brand" />}
                                        </button>
                                    )}

                                    {availablePaymentMethods.includes('cod') && (
                                        <button
                                            onClick={() => setPaymentMethod('cod')}
                                            className={`w-full flex items-center justify-between p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 transition-all ${paymentMethod === 'cod' ? 'border-brand bg-green-50' : 'border-gray-50 hover:border-gray-200 bg-gray-50'}`}
                                        >
                                            <div className="flex items-center space-x-3 md:space-x-4">
                                                <div className={`p-2.5 md:p-3 rounded-xl ${paymentMethod === 'cod' ? 'bg-brand text-white' : 'bg-white text-gray-400'}`}>
                                                    <Truck className="h-5 w-5 md:h-6 md:w-6" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-xs md:text-base font-bold text-gray-900">Bayar di Tempat (COD)</p>
                                                    <p className="text-[9px] md:text-xs text-gray-500 font-medium">Bayar tunai saat kurir tiba</p>
                                                </div>
                                            </div>
                                            {paymentMethod === 'cod' && <CheckCircle2 className="h-4 w-4 md:h-6 md:w-6 text-brand" />}
                                        </button>
                                    )}

                                    <button
                                        disabled
                                        className="w-full flex items-center justify-between p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 border-gray-50 bg-gray-50 opacity-60 cursor-not-allowed"
                                    >
                                        <div className="flex items-center space-x-3 md:space-x-4">
                                            <div className="p-2.5 md:p-3 bg-white text-gray-300 rounded-xl">
                                                <ShieldCheck className="h-5 w-5 md:h-6 md:w-6" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs md:text-base font-bold text-gray-900">E-Wallet (OVO, Dana, QRIS)</p>
                                                <p className="text-[8px] md:text-[10px] bg-yellow-100 text-yellow-700 font-black px-2 py-0.5 rounded inline-block mt-1">COMING SOON</p>
                                            </div>
                                        </div>
                                    </button>
                                </>
                            )}
                        </div>

                        <button
                            onClick={() => setStep(4)}
                            className="w-full mt-8 md:mt-10 py-4 md:py-5 bg-brand text-white rounded-2xl font-black text-sm md:text-lg shadow-xl shadow-green-100 hover:bg-green-800 transition active:scale-95 flex items-center justify-center space-x-2"
                        >
                            <span>Review Pesanan</span>
                            <ArrowRight className="h-4 w-4 md:h-6 md:w-6" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Step 4: Review Order
    if (step === 4) {
        return (
            <div className="min-h-screen bg-gray-50 pb-24 font-(family-name:--font-poppins)\">
                <div className="max-w-3xl mx-auto px-4 py-6 md:py-8">
                    <button onClick={() => setStep(3)} className="flex items-center text-[10px] sm:text-base text-gray-500 font-bold mb-4 md:mb-6 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-1.5" />
                        Kembali ke Pembayaran
                    </button>

                    <div className="bg-white rounded-4xl md:rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-gray-100">
                        <div className="flex items-center justify-between mb-6 md:mb-8">
                            <h1 className="text-base md:text-2xl font-black text-gray-900">Review Akhir</h1>
                            <div className="flex items-center space-x-1">
                                <div className="h-2 w-2 bg-brand rounded-full"></div>
                                <div className="h-2 w-2 bg-brand rounded-full"></div>
                                <div className="h-2 w-8 bg-brand rounded-full"></div>
                            </div>
                        </div>

                        <div className="space-y-4 md:space-y-6">
                            <div className="bg-gray-50 p-4 md:p-6 rounded-2xl md:rounded-3xl">
                                <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 md:mb-3">Tujuan Pengiriman</p>
                                <p className="text-[11px] md:text-base font-black text-gray-900">{shippingData.receiverName}</p>
                                <p className="text-[9px] md:text-sm font-bold text-gray-500 mt-0.5 md:mt-1">{shippingData.phone}</p>
                                <p className="text-[10px] md:text-sm text-gray-500 mt-1.5 md:mt-2 leading-relaxed">{shippingData.address}</p>
                            </div>

                            <div className="bg-gray-50 p-4 md:p-6 rounded-2xl md:rounded-3xl">
                                <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 md:mb-3">Metode Pembayaran</p>
                                <div className="flex items-center space-x-2 md:space-x-3">
                                    {paymentMethod === 'transfer' ? (
                                        <>
                                            <CreditCard className="h-3.5 w-3.5 md:h-5 md:w-5 text-brand" />
                                            <span className="text-[10px] md:text-base font-bold text-gray-900">Transfer Bank (Manual)</span>
                                        </>
                                    ) : paymentMethod === 'qris' ? (
                                        <>
                                            <Banknote className="h-3.5 w-3.5 md:h-5 md:w-5 text-brand" />
                                            <span className="text-[10px] md:text-base font-bold text-gray-900">QRIS Pribadi</span>
                                        </>
                                    ) : paymentMethod === 'cod' ? (
                                        <>
                                            <Truck className="h-3.5 w-3.5 md:h-5 md:w-5 text-brand" />
                                            <span className="text-[10px] md:text-base font-bold text-gray-900">Bayar di Tempat (COD)</span>
                                        </>
                                    ) : (
                                        <span className="text-[10px] md:text-base font-bold text-gray-900 capitalize">{paymentMethod.replace('_', ' ')}</span>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 md:p-6 rounded-2xl md:rounded-3xl">
                                <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 md:mb-3">Metode Pengiriman</p>
                                <div className="flex items-center space-x-2 md:space-x-3">
                                    {shippingMethod === 'seller' && (
                                        <>
                                            <Store className="h-3.5 w-3.5 md:h-5 md:w-5 text-brand" />
                                            <span className="text-[10px] md:text-base font-bold text-gray-900">Dikirim Oleh Penjual</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div>
                                <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 md:mb-4">Item Pesanan</p>
                                <div className="space-y-2 md:space-y-3">
                                    {items.map((item) => (
                                        <div key={item.productId} className="flex justify-between items-center text-[9px] md:text-sm">
                                            <span className="text-gray-600 font-medium">
                                                <span className="font-black text-brand mr-1.5 md:mr-2">{item.quantity}x</span>
                                                {item.name}
                                            </span>
                                            <span className="font-black text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 md:pt-6 border-t border-dashed border-gray-200">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] md:text-base font-bold text-gray-400">Total Pembayaran</span>
                                    <span className="text-lg md:text-2xl font-black text-brand">{formatPrice(totalPrice)}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={isSubmitting}
                            onClick={handleCreateOrder}
                            className="w-full mt-8 md:mt-10 py-4 md:py-5 bg-brand text-white rounded-2xl font-black text-sm md:text-lg shadow-xl shadow-green-100 hover:bg-green-800 transition active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                            {isSubmitting ? <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin" /> : (
                                <>
                                    <span>{paymentMethod === 'cod' ? 'Konfirmasi Pesanan' : 'Konfirmasi & Bayar'}</span>
                                    <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Step 5: Success & Payment Instructions
    if (step === 5 && orderResult) {
        // Calculate totals from multiple orders if applicable
        const orders: Order[] = Array.isArray(orderResult?.orders) ? orderResult.orders : [];
        const totalAmount = orders.reduce((sum: number, order: Order) => sum + Number(order.totalAmount), 0);
        const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5003';

        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start p-4 py-12 font-(family-name:--font-poppins)">
                <div className="max-w-2xl w-full bg-white rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl border border-gray-100 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 md:h-2 bg-brand"></div>

                    <div className="h-16 w-16 md:h-24 md:w-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                        {paymentMethod === 'cod' ? (
                            <Truck className="h-8 w-8 md:h-12 md:w-12 text-brand" />
                        ) : (
                            <CheckCircle2 className="h-8 w-8 md:h-12 md:w-12 text-brand" />
                        )}
                    </div>

                    <h1 className="text-xl md:text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">
                        {paymentMethod === 'cod' ? 'Pesanan Berhasil!' : 'Pesanan Dibuat!'}
                    </h1>
                    <p className="text-[10px] md:text-sm text-gray-500 font-bold mb-6 md:mb-8 uppercase tracking-widest">
                        {orders.length > 1
                            ? `Berhasil membuat ${orders.length} pesanan terpisah.`
                            : paymentMethod === 'cod'
                                ? 'Merchant akan segera memproses pesanan Anda.'
                                : 'Silakan selesaikan pembayaran ke arah rekening merchant.'}
                    </p>

                    {/* Order Details Per Shop */}
                    <div className="space-y-6 md:space-y-8 mb-8">
                        {orders.map((order: Order, idx: number) => (
                            <div key={order.id} className="bg-gray-50 rounded-3xl p-5 md:p-8 border border-gray-100 text-left relative">
                                <div className="absolute top-0 right-8 -translate-y-1/2 bg-brand text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">
                                    Pesanan #{idx + 1}
                                </div>

                                <div className="flex items-center space-x-3 mb-4 md:mb-6">
                                    <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
                                        <Store className="h-4 w-4 md:h-5 md:w-5 text-brand" />
                                    </div>
                                    <h3 className="font-black text-gray-900 text-sm md:text-xl uppercase tracking-tight">{order.shop?.name || 'Nama Toko'}</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                                    <div className="space-y-4">
                                        {paymentMethod === 'transfer' && (
                                            <div>
                                                <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Rekening Tujuan</p>
                                                <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
                                                    <p className="text-[10px] md:text-xs font-black text-brand uppercase mb-1">{order.shop?.bankName || 'BANK'}</p>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <p className="text-sm md:text-lg font-black text-gray-900 tracking-tight">{order.shop?.bankAccountNumber || '-'}</p>
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(order.shop?.bankAccountNumber || '');
                                                                toast.success('Nomor rekening disalin!');
                                                            }}
                                                            className="p-1.5 text-gray-400 hover:text-brand transition-colors"
                                                        >
                                                            <Copy className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                                        </button>
                                                    </div>
                                                    <p className="text-[9px] md:text-xs text-gray-500 font-bold uppercase tracking-wide">A.N {order.shop?.bankAccountName || '-'}</p>
                                                </div>
                                            </div>
                                        )}

                                        {paymentMethod === 'qris' && (
                                            <div>
                                                <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Pembayaran QRIS</p>
                                                <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center">
                                                    {order.shop?.qrisImage ? (
                                                        <>
                                                            <div className="w-full aspect-square max-w-50 mb-3 border border-gray-100 rounded-xl overflow-hidden">
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img
                                                                    src={`${backendUrl}${order.shop.qrisImage}`}
                                                                    alt="QRIS"
                                                                    className="w-full h-full object-contain"
                                                                />
                                                            </div>
                                                            <a
                                                                href={`${backendUrl}${order.shop.qrisImage}`}
                                                                target="_blank"
                                                                className="text-[9px] font-black text-brand uppercase flex items-center hover:underline"
                                                            >
                                                                Buka Gambar Penuh <ExternalLink className="h-3 w-3 ml-1" />
                                                            </a>
                                                        </>
                                                    ) : (
                                                        <p className="text-xs text-gray-400 font-medium py-8 text-center">QRIS tidak tersedia. Hubungi penjual.</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {paymentMethod === 'cod' && (
                                            <div>
                                                <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Instruksi COD</p>
                                                <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
                                                    <p className="text-[10px] md:text-sm font-bold text-gray-700 leading-relaxed">
                                                        Siapkan uang tunai dan berikan kepada kurir saat pesanan ini tiba di alamat Anda.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col justify-end border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-8">
                                        <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Tagihan Toko</p>
                                        <p className="text-xl md:text-3xl font-black text-brand">{formatPrice(order.totalAmount)}</p>
                                        <p className="text-[8px] md:text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-2">ID: {order.id.slice(-8).toUpperCase()}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-green-50/50 p-6 md:p-8 rounded-4xl border border-green-100 mb-8 md:mb-10">
                        <p className="text-[10px] md:text-xs font-black text-brand uppercase tracking-[0.2em] mb-2">Total Seluruh Pesanan</p>
                        <p className="text-2xl md:text-4xl font-black text-brand tracking-tighter">{formatPrice(totalAmount)}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                        <Link
                            href="/dashboard/orders"
                            className="flex items-center justify-center py-4 bg-brand text-white rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest hover:bg-green-800 transition shadow-xl shadow-green-100 active:scale-95"
                        >
                            <Copy className="h-4 w-4 mr-2" />
                            Daftar Pesanan
                        </Link>
                        <button
                            onClick={() => router.push('/')}
                            className="flex items-center justify-center py-4 bg-white text-gray-500 rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest hover:bg-gray-50 transition border border-gray-100 active:scale-95"
                        >
                            Beranda Utama
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
