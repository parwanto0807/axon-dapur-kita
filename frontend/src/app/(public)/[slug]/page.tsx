'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { MapPin, Clock, Star, Phone, Share2, Info, Store } from 'lucide-react';
import Image from 'next/image';
import { formatPrice } from '@/utils/format';
import ShareDialog from '@/components/ui/ShareDialog';

interface Product {
    id: string;
    name: string;
    price: number;
    images: { url: string }[];
    stock: number;
    unit: any;
}

interface Shop {
    id: number;
    name: string;
    slug: string;
    description: string;
    address: string;
    logo: string | null;
    isOpen: boolean;
    latitude: number | null;
    longitude: number | null;
    maxDeliveryDistance: number;
    products: Product[];
}

const getImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${path}`;
};

export default function ShopPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [shop, setShop] = useState<Shop | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [shareData, setShareData] = useState<{ isOpen: boolean; url: string; title: string }>({
        isOpen: false,
        url: '',
        title: ''
    });

    const openShareDialog = () => {
        if (!shop) return;
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        setShareData({
            isOpen: true,
            url: `${origin}/${shop.slug}`,
            title: shop.name
        });
    };

    useEffect(() => {
        const fetchShop = async () => {
            try {
                const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                const response = await axios.get(`${apiBaseUrl}/shops/${slug}`);
                setShop(response.data);
            } catch (err: any) {
                console.error("Error fetching shop:", err);
                setError(err.response?.data?.message || 'Gagal memuat informasi toko.');
            } finally {
                setIsLoading(false);
            }
        };

        if (slug) {
            fetchShop();
        }
    }, [slug]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 font-[family-name:var(--font-poppins)]">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
                    <div className="h-4 w-48 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (error || !shop) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-[family-name:var(--font-poppins)] p-4 text-center">
                <Store className="h-16 w-16 text-gray-300 mb-4" />
                <h1 className="text-xl font-bold text-gray-900 mb-2">Toko Tidak Ditemukan</h1>
                <p className="text-gray-500 mb-6 max-w-md">{error || "Halaman toko yang Anda cari mungkin sudah dihapus atau URL salah."}</p>
                <button
                    onClick={() => router.push('/')}
                    className="px-6 py-2 bg-[#1B5E20] text-white rounded-xl font-medium hover:bg-[#1B5E20]/90 transition"
                >
                    Kembali ke Beranda
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-poppins)] pb-20">
            {/* Header / Cover Area */}
            <div className="bg-white border-b">
                {/* Cover Image Placeholder - could be dynamic later */}
                <div className="h-32 sm:h-48 bg-gradient-to-r from-green-50 to-green-100 w-full relative">
                    <div className="absolute inset-0 bg-black/5"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end text-center sm:text-left">
                        {/* Logo */}
                        <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-white bg-gray-50 shadow-md overflow-hidden flex-shrink-0">
                            {shop.logo ? (
                                <img
                                    src={getImageUrl(shop.logo) || ''}
                                    alt={shop.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full bg-green-50 flex items-center justify-center">
                                    <Store className="h-10 w-10 text-[#1B5E20]" />
                                </div>
                            )}
                        </div>

                        {/* Shop Info */}
                        <div className="mt-4 sm:mt-0 sm:ml-6 pb-6 flex-1">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{shop.name}</h1>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    <span>{shop.address || 'Lokasi belum diatur'}</span>
                                </div>
                                <div className="flex items-center">
                                    <Star className="h-4 w-4 mr-1 text-yellow-400 fill-yellow-400" />
                                    <span className="font-bold text-gray-900">4.8</span>
                                    <span className="ml-1 text-gray-400">(24 ulasan)</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 sm:mt-0 pb-6 flex items-center space-x-3">
                            {shop.isOpen ? (
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">
                                    BUKA
                                </span>
                            ) : (
                                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-200">
                                    TUTUP
                                </span>
                            )}
                            <button
                                onClick={openShareDialog}
                                className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                                title="Bagikan Toko"
                            >
                                <Share2 className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs / Nav */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
                    <div className="flex border-b border-gray-100">
                        <button className="px-4 py-3 border-b-2 border-[#1B5E20] text-[#1B5E20] font-bold text-sm">Beranda</button>
                        <button className="px-4 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">Produk</button>
                        <button className="px-4 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">Ulasan</button>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Main Content (Products) */}
                    <div className="lg:col-span-2 space-y-8">
                        {shop.description && (
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-2">Tentang Toko</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{shop.description}</p>
                            </div>
                        )}

                        <div>
                            <h2 className="font-bold text-xl text-gray-900 mb-4">Etalase Produk</h2>
                            {shop.products && shop.products.length > 0 ? (
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                    {shop.products.map((product) => (
                                        <div key={product.id} className="group rounded-xl border bg-white overflow-hidden shadow-sm hover:shadow-md transition flex flex-col">
                                            <div className="h-40 sm:h-48 bg-gray-100 relative">
                                                {product.images?.[0]?.url ? (
                                                    <img
                                                        src={getImageUrl(product.images[0].url) || ''}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <Store className="h-8 w-8" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4 flex flex-col flex-1">
                                                <h4 className="font-bold text-gray-900 line-clamp-2 mb-1 text-sm sm:text-base">
                                                    {product.name}
                                                </h4>
                                                <p className="text-[#1B5E20] font-bold text-sm sm:text-[15px] mb-2">
                                                    {formatPrice(product.price)}
                                                </p>
                                                <button className="mt-auto w-full py-2 bg-green-50 text-[#1B5E20] font-bold text-xs sm:text-sm rounded-lg hover:bg-green-100 transition">
                                                    + Keranjang
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-200">
                                    <p className="text-gray-500">Belum ada produk di etalase ini.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Info Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm sticky top-24">
                            <h3 className="font-bold text-gray-900 mb-4">Info Pengiriman</h3>
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <div className="bg-green-50 p-2 rounded-lg mr-3">
                                        <MapPin className="h-5 w-5 text-[#1B5E20]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Jarak Maksimal</p>
                                        <p className="text-gray-500 text-xs">{shop.maxDeliveryDistance} km dari lokasi toko</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="bg-blue-50 p-2 rounded-lg mr-3">
                                        <Clock className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Jam Operasional</p>
                                        <p className="text-gray-500 text-xs">08:00 - 17:00 WIB</p>
                                    </div>
                                </div>
                            </div>

                            {!shop.isOpen && (
                                <div className="mt-6 p-3 bg-red-50 border border-red-100 rounded-xl text-center">
                                    <p className="text-red-700 font-bold text-sm">Toko Sedang Tutup</p>
                                    <p className="text-red-500 text-xs mt-1">Tidak menerima pesanan saat ini.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <ShareDialog
                isOpen={shareData.isOpen}
                onClose={() => setShareData({ ...shareData, isOpen: false })}
                url={shareData.url}
                title={shareData.title}
            />
        </div>
    );
}
