'use client';

import React from 'react';
import { useWishlistStore } from '@/store/wishlistStore';
import { ShoppingBag, ChevronRight, Trash2, Store, Heart } from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/utils/format';
import { getImageUrl } from '@/utils/image';
import EmptyState from '@/components/ui/EmptyState';
import { toast } from 'react-hot-toast';

export default function WishlistPage() {
    const { items, removeItem, clearWishlist } = useWishlistStore();

    const handleRemove = (id: string, name: string) => {
        removeItem(id);
        toast.success(`${name} dihapus dari wishlist`);
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-white pb-24">
                <header className="sticky top-0 z-[50] bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-4 sm:px-8">
                    <h1 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tighter">Wishlist Saya</h1>
                </header>
                <div className="max-w-2xl mx-auto pt-10 px-4">
                    <EmptyState
                        title="Wishlist Masih Kosong"
                        description="Simpan produk UMKM yang kamu sukai di sini untuk dibeli nanti!"
                        actionLabel="Cari Produk Sekarang"
                        actionHref="/"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24 font-[family-name:var(--font-poppins)]">
            <header className="sticky top-0 z-[50] bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-4 sm:px-8 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-3">
                    <div className="bg-red-50 p-2 rounded-xl">
                        <Heart className="h-5 w-5 text-red-500 fill-current" />
                    </div>
                    <div>
                        <h1 className="text-lg sm:text-xl font-black text-gray-900 uppercase tracking-tighter leading-none">Wishlist</h1>
                        <p className="text-[10px] sm:text-xs text-gray-400 font-medium uppercase tracking-widest mt-1">{items.length} Produk Favorit</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        if (confirm('Hapus semua wishlist?')) clearWishlist();
                    }}
                    className="text-[10px] sm:text-xs font-bold text-red-500 uppercase tracking-widest hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                    Kosongkan
                </button>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-6 space-y-3">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-sm flex items-center space-x-4 relative group hover:border-red-100 transition-all active:scale-[0.98]"
                    >
                        <Link href={`/product/${item.id}`} className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-2xl overflow-hidden border border-gray-50 relative">
                            {item.image ? (
                                <img
                                    src={getImageUrl(item.image) || ''}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-200">
                                    <ShoppingBag className="h-8 w-8" />
                                </div>
                            )}
                        </Link>

                        <div className="flex-1 min-w-0 pr-8">
                            <div className="flex items-center space-x-1.5 mb-1">
                                <Store className="h-3 w-3 text-gray-400" />
                                <span className="text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider truncate">{item.shop.name}</span>
                            </div>
                            <Link href={`/product/${item.id}`}>
                                <h3 className="font-bold text-sm text-gray-900 tracking-tight truncate group-hover:text-red-500 transition-colors leading-tight">
                                    {item.name}
                                </h3>
                            </Link>
                            <p className="text-sm sm:text-lg font-black text-[#1B5E20] mt-1">
                                {formatPrice(item.price)}
                            </p>

                            <div className="mt-3 flex items-center space-x-2">
                                <Link
                                    href={`/product/${item.id}`}
                                    className="flex-1 bg-[#1B5E20] text-white py-2 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest text-center shadow-lg shadow-green-900/10 hover:bg-green-800 transition-all flex items-center justify-center space-x-2"
                                >
                                    <span>Lihat Produk</span>
                                    <ChevronRight className="h-3 w-3" />
                                </Link>
                            </div>
                        </div>

                        <button
                            onClick={() => handleRemove(item.id, item.name)}
                            className="absolute top-3 right-3 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Hapus"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </main>

            <div className="max-w-3xl mx-auto px-4 pt-10 text-center">
                <p className="text-[10px] sm:text-xs text-gray-400 font-medium uppercase tracking-widest">Tarik ke bawah untuk refresh</p>
            </div>
        </div>
    );
}
