'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { MapPin, Clock, Star, Phone, Share2, Info, Store, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { formatPrice } from '@/utils/format';
import { getImageUrl } from '@/utils/image';
import ShareDialog from '@/components/ui/ShareDialog';
import { clsx } from 'clsx';
import StarRating from '@/components/ui/StarRating';
import ReviewList from '@/components/features/ReviewList';

interface Product {
    id: string;
    name: string;
    price: number;
    images: { url: string }[];
    stock: number;
    unit: any;
    isActive: boolean;
}

interface Shop {
    id: string;
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
    const [activeTab, setActiveTab] = useState<'HOME' | 'PRODUCTS' | 'REVIEWS'>('PRODUCTS');
    const [shopStats, setShopStats] = useState<any>({ averageRating: 0, totalReviews: 0, totalCompletedOrders: 0 });
    const [shopReviews, setShopReviews] = useState<any[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);

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
                const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';
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

    useEffect(() => {
        if (shop?.id) {
            fetchShopStats();
        }
    }, [shop?.id]);

    useEffect(() => {
        if (shop?.id && activeTab === 'REVIEWS') {
            fetchShopReviews();
        }
    }, [shop?.id, activeTab]);

    const fetchShopStats = async () => {
        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';
            const res = await axios.get(`${apiBaseUrl}/reviews/shop/${shop?.id}/stats`);
            setShopStats(res.data);
        } catch (e) {
            console.error('Failed to fetch shop stats', e);
        }
    };

    const fetchShopReviews = async () => {
        setReviewsLoading(true);
        try {
            // We need a route for shop reviews, or we can just fetch all products reviews?
            // Actually, I should add a getShopReviews endpoint to the backend.
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';
            // Placeholder: currently my backend doesn't have getShopReviews, only product reviews.
            // I'll update the backend in a moment.
            const res = await axios.get(`${apiBaseUrl}/reviews/shop/${shop?.id}`);
            setShopReviews(res.data);
        } catch (e) {
            console.error('Failed to fetch shop reviews', e);
        } finally {
            setReviewsLoading(false);
        }
    };

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
                        <div className="mt-4 sm:mt-0 sm:ml-6 pb-4 flex-1">
                            <h1 className="text-xl sm:text-3xl font-black text-black tracking-tight">{shop.name}</h1>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-xs sm:text-sm text-black">
                                <div className="flex items-center">
                                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 text-gray-700" />
                                    <span className="font-bold">{shop.address || 'Lokasi belum diatur'}</span>
                                </div>
                                {/* <div className="flex items-center">
                                    <StarRating rating={shopStats.averageRating} size={14} className="mr-1" />
                                    <span className="font-black text-black">{shopStats.averageRating.toFixed(1)}</span>
                                    <span className="ml-1 text-gray-600 font-bold">({shopStats.totalReviews} ulasan)</span>
                                </div>
                                <div className="h-1 w-1 bg-gray-300 rounded-full mx-1"></div> */}
                                <div className="flex items-center">
                                    <ShoppingBag className="h-4 w-4 mr-1 text-blue-600 font-black" />
                                    <span className="font-black text-black">{shopStats.totalCompletedOrders}</span>
                                    <span className="ml-1 text-gray-600 font-bold">produk terjual</span>
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-1">
                    <div className="flex border-b border-gray-100">
                        <button
                            onClick={() => setActiveTab('PRODUCTS')}
                            className={clsx(
                                "px-4 py-2 border-b-2 font-black text-xs sm:text-sm transition-colors",
                                activeTab === 'PRODUCTS' ? "border-[#1B5E20] text-[#1B5E20]" : "border-transparent text-gray-500 hover:text-black"
                            )}
                        >
                            Produk ({shop.products.length})
                        </button>
                        {/* <button
                            onClick={() => setActiveTab('REVIEWS')}
                            className={clsx(
                                "px-4 py-2 border-b-2 font-black text-xs sm:text-sm transition-colors",
                                activeTab === 'REVIEWS' ? "border-[#1B5E20] text-[#1B5E20]" : "border-transparent text-gray-500 hover:text-black"
                            )}
                        >
                            Ulasan ({shopStats.totalReviews})
                        </button> */}
                        <button
                            onClick={() => setActiveTab('HOME')}
                            className={clsx(
                                "px-4 py-2 border-b-2 font-black text-xs sm:text-sm transition-colors",
                                activeTab === 'HOME' ? "border-[#1B5E20] text-[#1B5E20]" : "border-transparent text-gray-500 hover:text-black"
                            )}
                        >
                            Info Toko
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Main Content (Products) */}
                    <div className="lg:col-span-2 space-y-8">
                        {activeTab === 'HOME' && (
                            <>
                                {shop.description && (
                                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                        <h3 className="font-black text-black mb-2 text-xs sm:text-base uppercase tracking-tight">Tentang Toko</h3>
                                        <p className="text-black text-[11px] sm:text-sm leading-relaxed font-bold">{shop.description}</p>
                                    </div>
                                )}

                                <div>
                                    <h2 className="font-bold text-xl text-gray-900 mb-4">Produk Unggulan</h2>
                                    {shop.products && shop.products.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                            {shop.products.filter(p => p.isActive).slice(0, 6).map((product) => (
                                                <div
                                                    key={product.id}
                                                    onClick={() => router.push(`/product/${product.id}`)}
                                                    className="group rounded-xl border bg-white overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer flex flex-col"
                                                >
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
                                                        <h4 className="font-bold text-gray-900 line-clamp-2 mb-1 text-xs sm:text-base">
                                                            {product.name}
                                                        </h4>
                                                        <p className="text-[#1B5E20] font-bold text-sm sm:text-lg mb-2">
                                                            {formatPrice(product.price)}
                                                        </p>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); /* Add to cart logic if needed */ }}
                                                            className="mt-auto w-full py-2.5 bg-green-50 text-[#1B5E20] font-bold text-xs sm:text-sm rounded-xl hover:bg-green-100 transition"
                                                        >
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
                            </>
                        )}

                        {activeTab === 'PRODUCTS' && (
                            <div className="space-y-1">
                                <h2 className="font-bold text-sm text-gray-900 mb-4 uppercase tracking-tight">Daftar Semua Produk</h2>
                                {shop.products && shop.products.length > 0 ? (
                                    <div className="flex flex-col gap-2">
                                        {shop.products.map((product) => (
                                            <div
                                                key={product.id}
                                                onClick={() => router.push(`/product/${product.id}`)}
                                                className={clsx(
                                                    "bg-white border border-gray-100 rounded-xl flex items-center px-3 py-2 h-14 sm:h-18 hover:border-green-600 transition-all cursor-pointer group relative shadow-sm",
                                                    !product.isActive && "bg-gray-50/80"
                                                )}
                                            >
                                                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-50">
                                                    {product.images?.[0]?.url ? (
                                                        <img
                                                            src={getImageUrl(product.images[0].url) || ''}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <Store className="h-6 w-6" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0 mx-3 flex items-center justify-between">
                                                    <div className="flex flex-col flex-1 min-w-0 mr-2">
                                                        <h4 className={clsx(
                                                            "font-black text-gray-900 truncate uppercase tracking-tight leading-none mb-1",
                                                            product.isActive ? "text-xs sm:text-sm" : "text-xs sm:text-sm text-gray-400"
                                                        )}>
                                                            {product.name}
                                                        </h4>
                                                        <p className="text-[11px] sm:text-xs font-bold text-[#1B5E20] leading-none">
                                                            {formatPrice(product.price)}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center space-x-3 shrink-0">
                                                        {product.isActive ? (
                                                            <span className="text-[8px] sm:text-[10px] font-black uppercase text-green-600 border border-green-200 px-1.5 py-0.5 rounded-md bg-green-50 tracking-tighter shadow-sm">Aktif</span>
                                                        ) : (
                                                            <span className="text-[8px] sm:text-[10px] font-black uppercase text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded-md bg-gray-50 tracking-tighter">Habis</span>
                                                        )}
                                                        <button
                                                            disabled={!product.isActive}
                                                            onClick={(e) => { e.stopPropagation(); }}
                                                            className={clsx(
                                                                "hidden sm:flex px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition shrink-0",
                                                                product.isActive
                                                                    ? "bg-green-50 text-[#1B5E20] hover:bg-green-600 hover:text-white"
                                                                    : "bg-gray-100 text-gray-300 cursor-not-allowed"
                                                            )}
                                                        >
                                                            {product.isActive ? 'Detail' : 'Habis'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-200">
                                        <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Belum ada produk</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'REVIEWS' && (
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="font-black text-black mb-4 text-sm sm:text-lg uppercase tracking-tight">Ulasan Pembeli</h3>
                                <ReviewList reviews={shopReviews} isLoading={reviewsLoading} />
                            </div>
                        )}
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
                                        <p className="text-xs sm:text-sm font-bold text-gray-900">Jarak Maksimal</p>
                                        <p className="text-gray-500 text-[11px] sm:text-xs">{shop.maxDeliveryDistance} km dari lokasi toko</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="bg-blue-50 p-2 rounded-lg mr-3">
                                        <Clock className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs sm:text-sm font-bold text-gray-900">Jam Operasional</p>
                                        <p className="text-gray-500 text-[11px] sm:text-xs">08:00 - 17:00 WIB</p>
                                    </div>
                                </div>
                            </div>

                            {!shop.isOpen && (
                                <div className="mt-6 p-3 bg-red-50 border border-red-100 rounded-xl text-center">
                                    <p className="text-red-700 font-bold text-[10px] sm:text-sm">Toko Sedang Tutup</p>
                                    <p className="text-red-500 text-[9px] sm:text-xs mt-1">Tidak menerima pesanan saat ini.</p>
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
