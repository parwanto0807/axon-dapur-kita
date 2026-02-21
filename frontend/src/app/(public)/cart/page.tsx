'use client';

import { useCart } from '@/hooks/useCart';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Store, ArrowLeft } from 'lucide-react';
import { formatPrice } from '@/utils/format';
import { getImageUrl } from '@/utils/image';



export default function CartPage() {
    const { items, updateQuantity, removeItem, totalPrice, totalItems } = useCart();
    const { isLoggedIn } = useAuthStore();
    const router = useRouter();

    if (items.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
                <div className="bg-gray-50 p-8 rounded-full mb-6">
                    <ShoppingBag className="h-16 w-16 text-gray-300" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Keranjangmu Kosong</h1>
                <p className="text-gray-500 mb-8 max-w-md">
                    Wah, sepertinya Anda belum menambahkan apa-apa. Yuk, cari bahan masakan segar dari tetangga sekitar!
                </p>
                <Link
                    href="/"
                    className="px-8 py-3 bg-[#1B5E20] text-white rounded-2xl font-bold hover:bg-green-800 transition shadow-lg shadow-green-100"
                >
                    Mulai Belanja
                </Link>
            </div>
        );
    }

    const handleCheckout = () => {
        if (!isLoggedIn) {
            router.push('/login?redirect=/checkout');
        } else {
            router.push('/checkout');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-poppins)] pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
                <div className="flex items-center space-x-4 mb-6 md:mb-8">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200 text-gray-500"
                        title="Kembali"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-base md:text-2xl font-black text-gray-900">Keranjang Belanja</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Items List */}
                    <div className="lg:col-span-8 space-y-6">
                        {Object.entries(
                            items.reduce((acc, item) => {
                                if (!acc[item.shopId]) acc[item.shopId] = [];
                                acc[item.shopId].push(item);
                                return acc;
                            }, {} as Record<string, typeof items>)
                        ).map(([shopId, shopItems]) => (
                            <div key={shopId} className="space-y-3">
                                <div className="flex items-center space-x-2 px-1">
                                    <div className="p-1.5 bg-green-50 rounded-lg">
                                        <Store className="h-4 w-4 text-[#1B5E20]" />
                                    </div>
                                    <h2 className="text-[10px] md:text-sm font-black text-gray-900 uppercase tracking-widest">
                                        Toko: {shopId}
                                    </h2>
                                </div>
                                <div className="space-y-3">
                                    {shopItems.map((item) => (
                                        <div key={item.productId} className="bg-white p-3 md:p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3 md:space-x-4">
                                            <div className="h-14 w-14 md:h-20 md:w-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                                                <img
                                                    src={getImageUrl(item.image) || ''}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-[10px] sm:text-base font-bold text-gray-900 truncate">{item.name}</h3>
                                                <p className="text-[10px] md:text-sm font-bold text-[#1B5E20] mt-0.5">
                                                    {formatPrice(item.price)}
                                                    <span className="text-[8px] md:text-xs text-gray-400 font-normal ml-1">/{item.unit}</span>
                                                </p>
                                            </div>

                                            <div className="flex flex-col items-end space-y-3">
                                                <button
                                                    onClick={() => removeItem(item.productId)}
                                                    className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>

                                                <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                        className="p-1 px-1.5 text-gray-600 hover:text-[#1B5E20] disabled:opacity-30"
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <span className="w-5 md:w-8 text-center text-[9px] md:text-sm font-bold text-gray-900">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                        className="p-1 px-1.5 text-gray-600 hover:text-[#1B5E20]"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="lg:col-span-4">
                        <div className="bg-white p-5 md:p-6 rounded-[2rem] border border-gray-100 shadow-xl sticky top-24">
                            <h2 className="text-sm md:text-lg font-black text-gray-900 mb-4 md:mb-6">Ringkasan Belanja</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-[10px] md:text-sm text-gray-500 font-bold">
                                    <span>Total Item ({totalItems})</span>
                                    <span>{formatPrice(totalPrice)}</span>
                                </div>
                                <div className="flex justify-between text-[10px] md:text-sm text-gray-500 font-bold">
                                    <span>Diskon</span>
                                    <span className="text-green-600">- Rp 0</span>
                                </div>
                                <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-end">
                                    <span className="text-[10px] md:text-base font-bold text-gray-900">Total Harga</span>
                                    <span className="text-base md:text-xl font-black text-[#1B5E20]">
                                        {formatPrice(totalPrice)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="w-full py-3 md:py-4 bg-[#1B5E20] text-white rounded-2xl text-[11px] md:text-base font-bold hover:bg-green-800 transition shadow-lg shadow-green-100 flex items-center justify-center space-x-2"
                            >
                                <span>Lanjut ke Checkout</span>
                                <ArrowRight className="h-3.5 w-3.5 md:h-5 md:w-5" />
                            </button>

                            <p className="text-[10px] text-gray-400 text-center mt-4 font-medium uppercase tracking-widest">
                                Aman & Terpercaya • Axon Group
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
