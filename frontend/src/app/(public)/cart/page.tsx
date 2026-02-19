'use client';

import { useCart } from '@/hooks/useCart';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Store } from 'lucide-react';
import { formatPrice } from '@/utils/format';

const getImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    return `${apiBaseUrl.replace('/api', '')}${path}`;
};

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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-black text-gray-900 mb-8">Keranjang Belanja</h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Items List */}
                    <div className="lg:col-span-8 space-y-4">
                        {items.map((item) => (
                            <div key={item.productId} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
                                <div className="h-20 w-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                                    <img
                                        src={getImageUrl(item.image) || ''}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-0.5">
                                        <Store className="h-3 w-3 text-gray-400" />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.shopId}</span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 truncate">{item.name}</h3>
                                    <p className="text-sm font-bold text-[#1B5E20] mt-1">
                                        {formatPrice(item.price)}
                                        <span className="text-xs text-gray-400 font-normal ml-1">/{item.unit}</span>
                                    </p>
                                </div>

                                <div className="flex flex-col items-end space-y-3">
                                    <button
                                        onClick={() => removeItem(item.productId)}
                                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>

                                    <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50">
                                        <button
                                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                            className="p-1 px-2 text-gray-600 hover:text-[#1B5E20] disabled:opacity-30"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </button>
                                        <span className="w-8 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                            className="p-1 px-2 text-gray-600 hover:text-[#1B5E20]"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="lg:col-span-4">
                        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl sticky top-24">
                            <h2 className="text-lg font-black text-gray-900 mb-6">Ringkasan Belanja</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-500 font-medium">
                                    <span>Total Item ({totalItems})</span>
                                    <span>{formatPrice(totalPrice)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500 font-medium">
                                    <span>Diskon</span>
                                    <span className="text-green-600">- Rp 0</span>
                                </div>
                                <div className="border-t border-dashed border-gray-200 pt-4 flex justify-between items-end">
                                    <span className="font-bold text-gray-900">Total Harga</span>
                                    <span className="text-xl font-black text-[#1B5E20]">
                                        {formatPrice(totalPrice)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="w-full py-4 bg-[#1B5E20] text-white rounded-2xl font-bold hover:bg-green-800 transition shadow-lg shadow-green-100 flex items-center justify-center space-x-2"
                            >
                                <span>Lanjut ke Checkout</span>
                                <ArrowRight className="h-5 w-5" />
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
