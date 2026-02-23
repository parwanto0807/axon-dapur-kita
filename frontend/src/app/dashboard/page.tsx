'use client';

import { useState, useEffect } from 'react';
import HeroSlider from "@/components/features/HeroSlider";
import ShareDialog from "@/components/ui/ShareDialog";
import {
    Store, MapPin, TrendingUp, ShoppingBag, ShoppingCart,
    User, LayoutDashboard, Sparkles, Coffee, Utensils,
    Leaf, Snowflake, Grid, CookingPot, UtensilsCrossed,
    Apple, Wheat, Package, Droplet, Fish, Egg, CupSoda,
    Cookie, ChefHat, Croissant, ShoppingBasket, ArrowRight, Star, Share2, X
} from "lucide-react";
import StarRating from "@/components/ui/StarRating";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import axios from "axios";
import clsx from 'clsx';
import { formatPrice } from "@/utils/format";
import { getImageUrl } from "@/utils/image";

interface Shop {
    id: string;
    name: string;
    slug: string;
    address: string;
    domain: string | null;
    logo: string | null;
    averageRating?: number;
    totalReviews?: number;
}

interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    unit: any;
    image: string | null;
    shop: {
        name: string;
        slug: string;
        address?: string;
    };
    category: {
        id: string;
        name: string;
        slug: string;
        parent?: { name: string; slug: string } | null;
    } | null;
    averageRating?: number;
    totalReviews?: number;
}

interface Category {
    id: string;
    name: string;
    slug: string;
}



// Category Styles - Synced with new taxonomy (seed_categories.js)
const getCategoryStyle = (slug: string) => {
    switch (slug) {
        case 'makanan-berat': return { icon: CookingPot, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', ring: 'ring-orange-500' };
        case 'hidangan-berkuah': return { icon: UtensilsCrossed, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100', ring: 'ring-amber-500' };
        case 'camilan-gorengan': return { icon: Cookie, color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-100', ring: 'ring-yellow-500' };
        case 'kue-jajanan-pasar': return { icon: Croissant, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-100', ring: 'ring-pink-500' };
        case 'minuman': return { icon: CupSoda, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-100', ring: 'ring-sky-500' };
        case 'bumbu-rempah': return { icon: Utensils, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', ring: 'ring-red-500' };
        case 'lauk-mentah': return { icon: Fish, color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-100', ring: 'ring-rose-500' };
        case 'bahan-pokok': return { icon: Wheat, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', ring: 'ring-amber-500' };
        case 'frozen-food': return { icon: Snowflake, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-100', ring: 'ring-cyan-500' };
        case 'paket-bundling': return { icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', ring: 'ring-blue-500' };
        case 'jamu-herbal': return { icon: Leaf, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-100', ring: 'ring-green-500' };
        default: return { icon: Grid, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-100', ring: 'ring-gray-400' };
    }
};

export default function DashboardPage() {
    // Force Re-render: Circular Categories & Location Pin
    const { user } = useAuthStore();
    const [isVisible, setIsVisible] = useState(true);
    const [isRemoved, setIsRemoved] = useState(false);

    const [shops, setShops] = useState<Shop[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [productsLoading, setProductsLoading] = useState(false);
    const [shareData, setShareData] = useState<{ isOpen: boolean; url: string; title: string }>({
        isOpen: false,
        url: '',
        title: ''
    });

    const openShareDialog = (product: Product) => {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        setShareData({
            isOpen: true,
            url: `${origin}/product/${product.id}`,
            title: product.name
        });
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => setIsRemoved(true), 1000);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    // Initial Load - Robust Data Fetching
    useEffect(() => {
        const fetchData = async () => {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';

            // 1. Fetch Shops
            try {
                const shopsRes = await axios.get(`${apiBaseUrl}/shops/public`);
                setShops(shopsRes.data);
            } catch (error) {
                console.error("Error fetching shops:", error);
            }

            // 2. Fetch Categories
            try {
                const categoriesRes = await axios.get(`${apiBaseUrl}/categories`);
                setCategories(categoriesRes.data);
            } catch (error: any) {
                console.error("Error fetching categories:", error.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Fetch products when category changes
    useEffect(() => {
        const fetchProducts = async () => {
            setProductsLoading(true);
            try {
                const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';
                const response = await axios.get(`${apiBaseUrl}/products/public`, {
                    params: { category: selectedCategory }
                });
                setProducts(response.data);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setProductsLoading(false);
            }
        };

        fetchProducts();
    }, [selectedCategory]);

    return (
        <div className="min-h-screen bg-white font-[family-name:var(--font-poppins)]">
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                {/* User Welcome Header */}
                {!isRemoved && (
                    <div className={`mb-6 sm:mb-8 flex items-center justify-between bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm transition-all duration-1000 ease-in-out transform ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0 -mb-24 scale-95'}`}>
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                                {user?.image ? (
                                    <img src={user.image} alt={user.name} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full bg-green-50 flex items-center justify-center text-[#1B5E20] font-bold text-lg">
                                        {user?.name?.charAt(0) || 'U'}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h1 className="text-sm sm:text-2xl font-bold text-gray-900">Halo, {user?.name}! 👋</h1>
                                <p className="text-xs sm:text-sm text-gray-500">Selamat datang kembali di Axon DapurKita.</p>
                            </div>
                        </div>
                        {user?.role === 'SELLER' && (
                            <Link href="/dashboard/merchant" className="hidden sm:flex items-center space-x-2 bg-[#1B5E20] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-800 transition shadow-md hover:shadow-lg">
                                <LayoutDashboard className="h-4 w-4" />
                                <span>Merchant Dashboard</span>
                            </Link>
                        )}
                    </div>
                )}

                {/* Mobile Merchant Link */}
                {user?.role === 'SELLER' && (
                    <div className="mb-6 sm:hidden">
                        <Link href="/dashboard/merchant" className="flex items-center justify-center space-x-2 bg-[#1B5E20] text-white px-4 py-3 rounded-xl text-[11px] sm:text-sm font-bold w-full hover:bg-green-800 transition shadow-md">
                            <LayoutDashboard className="h-5 w-5" />
                            <span>Buka Merchant Dashboard</span>
                        </Link>
                    </div>
                )}

                <section className="mb-4 sm:mb-6">
                    <HeroSlider />
                </section>



                {/* Toko Terdekat Section */}
                <section className="mb-4 sm:mb-12">
                    <div className="mb-2 sm:mb-6 flex items-center justify-between">
                        <div className="flex items-center space-x-1 sm:space-x-2">
                            <MapPin className="h-3 w-3 sm:h-6 sm:w-6 text-[#1B5E20]" />
                            <h2 className="text-base sm:text-2xl font-bold text-gray-900">Toko Terbaru</h2>
                        </div>
                        <a href="#" className="text-[#1B5E20] hover:underline font-medium text-[10px] sm:text-base">Lihat Semua</a>
                    </div>

                    {loading ? (
                        <div className="grid gap-2 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3].map((n) => (
                                <div key={n} className="h-12 sm:h-24 bg-gray-100 rounded-xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid gap-2 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {shops.length > 0 ? (
                                shops.map((shop) => (
                                    <Link key={shop.id} href={`/${shop.slug}`}>
                                        <div className="rounded-xl border bg-white p-2 sm:p-4 shadow-sm hover:shadow-md transition cursor-pointer h-full group">
                                            <div className="flex items-center space-x-2 sm:space-x-4">
                                                <div className="h-9 w-9 sm:h-20 sm:w-20 shrink-0 bg-gray-50 rounded-full flex items-center justify-center overflow-hidden border border-gray-100 sm:border-2">
                                                    {shop.logo ? (
                                                        <img
                                                            src={getImageUrl(shop.logo) || ''}
                                                            alt={shop.name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition"
                                                        />
                                                    ) : (
                                                        <Store className="h-4 w-4 sm:h-8 sm:w-8 text-[#1B5E20]" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-black text-[13px] sm:text-lg text-black group-hover:text-[#1B5E20] transition truncate uppercase tracking-tight">
                                                        {shop.name}
                                                    </h3>
                                                    {/* <div className="flex items-center mt-1">
                                                        <StarRating rating={shop.averageRating || 0} size={10} className="mr-1" />
                                                        <span className="text-[10px] sm:text-xs font-black text-black">{(shop.averageRating || 0).toFixed(1)}</span>
                                                        <span className="text-[9px] sm:text-xs text-gray-400 ml-1 font-bold">({shop.totalReviews || 0} ulasan)</span>
                                                    </div> */}
                                                    <p className="text-[10px] sm:text-sm text-gray-500 line-clamp-1 flex items-center mt-1 font-bold">
                                                        <MapPin className="h-2 w-2 sm:h-3 sm:w-3 mr-0.5 shrink-0" />
                                                        {shop.address || 'Alamat tidak tersedia'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <p className="text-gray-500 col-span-3 text-center py-8">Belum ada toko yang terdaftar.</p>
                            )}
                        </div>
                    )}
                </section>

                {/* Categories Section - Modern Horizontal Scroll (Synced) */}
                <section className="mb-6 sm:mb-12">
                    <div className="flex items-center justify-between mb-3 sm:mb-6">
                        <h2 className="text-base sm:text-2xl font-black text-gray-900 tracking-tight flex items-center">
                            <Grid className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-6 sm:w-6 text-[#1B5E20]" />
                            Kategori Pilihan
                        </h2>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="text-xs sm:text-sm font-bold text-[#1B5E20] hover:text-green-700 transition-colors flex items-center group"
                        >
                            Lihat Semua
                            <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>

                    <div className="relative">
                        {/* Scrollable Container */}
                        <div className="flex space-x-3 sm:space-x-4 overflow-x-auto pb-3 sm:pb-4 pt-1 sm:pt-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide snap-x">
                            {/* 'All' Category */}
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className="flex flex-col items-center flex-shrink-0 group snap-center"
                            >
                                <div className={clsx(
                                    "w-10 h-10 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-1 sm:mb-3 transition-all duration-300 shadow-sm border",
                                    selectedCategory === 'all'
                                        ? "bg-[#1B5E20] text-white border-[#1B5E20] ring-2 ring-[#1B5E20] ring-offset-2 scale-105"
                                        : "bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:shadow-md hover:scale-105"
                                )}>
                                    <Grid className="h-4 w-4 sm:h-8 sm:w-8" />
                                </div>
                                <span className={clsx(
                                    "text-[10px] sm:text-xs font-bold text-center",
                                    selectedCategory === 'all' ? "text-[#1B5E20]" : "text-gray-600"
                                )}>Semua</span>
                            </button>

                            {loading ? (
                                [1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="flex flex-col items-center flex-shrink-0 space-y-1.5">
                                        <div className="w-10 h-10 sm:w-20 sm:h-20 rounded-full bg-gray-100 animate-pulse" />
                                        <div className="h-2 w-10 sm:h-3 sm:w-16 bg-gray-100 rounded animate-pulse" />
                                    </div>
                                ))
                            ) : (
                                categories.slice(0, 10).map((cat) => {
                                    const style = getCategoryStyle(cat.slug);
                                    const Icon = style.icon;
                                    const isSelected = selectedCategory === cat.slug;

                                    return (
                                        <div key={cat.id} className="relative group/carousel-item flex flex-col items-center flex-shrink-0 snap-center">
                                            <button
                                                onClick={() => setSelectedCategory(cat.slug)}
                                                className="flex flex-col items-center"
                                            >
                                                <div className={clsx(
                                                    "w-10 h-10 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-1 sm:mb-3 transition-all duration-300 border shadow-sm",
                                                    isSelected
                                                        ? `${style.bg} ${style.color} ${style.border} ring-2 ${style.ring} ring-offset-1 sm:ring-offset-2 scale-105`
                                                        : `${style.bg} ${style.color} ${style.border} opacity-80 hover:opacity-100 hover:shadow-md hover:scale-105 group-hover/carousel-item:text-gray-600`
                                                )}>
                                                    <Icon className={clsx("h-4 w-4 sm:h-8 sm:w-8 transition-colors", isSelected ? style.color : style.color)} />
                                                </div>
                                                <span className={clsx(
                                                    "text-[10px] sm:text-xs font-bold text-center max-w-[50px] sm:max-w-[80px] leading-tight",
                                                    isSelected ? "text-gray-900" : "text-gray-500"
                                                )}>{cat.name}</span>
                                            </button>

                                            {/* Hidden indicator for direct link */}
                                            <Link
                                                href={`/category/${cat.slug}`}
                                                className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-md border border-gray-100 opacity-0 group-hover/carousel-item:opacity-100 transition-opacity hover:bg-green-50"
                                                title={`Halaman ${cat.name}`}
                                            >
                                                <ArrowRight className="h-2 w-2 sm:h-3 sm:w-3 text-[#1B5E20]" />
                                            </Link>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </section>

                {/* Category Modal (Dialog) - Rebuilt for Native Mobile Feel */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
                        <div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                            onClick={() => setIsModalOpen(false)}
                        ></div>

                        <div className="relative bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl w-full sm:max-w-3xl max-h-[85vh] sm:h-auto flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
                            {/* Mobile Drag Handle */}
                            <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
                                <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
                            </div>

                            <div className="px-6 py-4 sm:py-6 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                                <div>
                                    <h3 className="text-base sm:text-xl font-black text-gray-900 flex items-center gap-2">
                                        Jelajahi Kategori
                                    </h3>
                                    <p className="text-[10px] sm:text-sm text-gray-400 font-medium">Temukan semua kebutuhan dapurmu disini</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all hidden sm:block"
                                >
                                    <span className="sr-only">Close</span>
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="p-5 sm:p-8 overflow-y-auto custom-scrollbar pb-10 sm:pb-8">
                                <div className="grid grid-cols-4 sm:grid-cols-4 gap-3 sm:gap-6">
                                    <button
                                        onClick={() => { setSelectedCategory('all'); setIsModalOpen(false); }}
                                        className={clsx(
                                            "flex flex-col items-center justify-center p-3 sm:p-6 rounded-2xl sm:rounded-[2rem] border transition-all text-center h-full group",
                                            selectedCategory === 'all'
                                                ? "bg-green-50 border-[#1B5E20] ring-1 ring-[#1B5E20]"
                                                : "bg-white border-gray-100 hover:border-green-200 hover:bg-green-50/30 hover:shadow-lg"
                                        )}
                                    >
                                        <div className={clsx(
                                            "p-2.5 sm:p-5 rounded-xl sm:rounded-2xl mb-2 sm:mb-4 transition-all duration-300",
                                            selectedCategory === 'all'
                                                ? "bg-[#1B5E20] text-white scale-110"
                                                : "bg-gray-50 text-gray-400 group-hover:bg-green-100 group-hover:text-green-600"
                                        )}>
                                            <Grid className="h-5 w-5 sm:h-8 sm:w-8" />
                                        </div>
                                        <span className={clsx(
                                            "font-bold text-[9px] sm:text-xs leading-tight",
                                            selectedCategory === 'all' ? "text-[#1B5E20]" : "text-gray-500"
                                        )}>Semua</span>
                                    </button>

                                    {categories.map((cat) => {
                                        const style = getCategoryStyle(cat.slug);
                                        const Icon = style.icon;
                                        const isSelected = selectedCategory === cat.slug;

                                        return (
                                            <div key={cat.id} className="relative group/card h-full">
                                                <button
                                                    onClick={() => { setSelectedCategory(cat.slug); setIsModalOpen(false); }}
                                                    className={clsx(
                                                        "flex flex-col items-center justify-center p-3 sm:p-6 rounded-2xl sm:rounded-[2.5rem] border transition-all text-center h-full w-full",
                                                        isSelected
                                                            ? "bg-gray-900 border-gray-900 shadow-xl scale-105"
                                                            : "bg-white border-gray-100 hover:border-green-200 hover:shadow-xl hover:-translate-y-1"
                                                    )}
                                                >
                                                    <div className={clsx(
                                                        "p-2.5 sm:p-5 rounded-xl sm:rounded-2xl mb-2 sm:mb-4 transition-all duration-300",
                                                        isSelected ? "bg-white/10 text-white" : `${style.bg} ${style.color} group-hover/card:opacity-80`
                                                    )}>
                                                        <Icon className="h-5 w-5 sm:h-8 sm:w-8" />
                                                    </div>
                                                    <span className={clsx(
                                                        "font-bold text-[9px] sm:text-xs leading-tight transition-colors",
                                                        isSelected ? "text-white" : "text-gray-500"
                                                    )}>
                                                        {cat.name}
                                                    </span>
                                                </button>

                                                {/* Deep Link to Category Page */}
                                                <Link
                                                    href={`/category/${cat.slug}`}
                                                    className={clsx(
                                                        "absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover/card:opacity-100 transition-all hover:bg-white hover:shadow-md",
                                                        isSelected ? "text-white border-white/20" : "text-gray-400 border-gray-100"
                                                    )}
                                                    title={`Lihat Halaman ${cat.name}`}
                                                >
                                                    <ArrowRight className="h-3 w-3" />
                                                </Link>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Produk Grid */}
                <section>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                        <div className="flex items-center space-x-2">
                            <TrendingUp className="h-6 w-6 text-[#1B5E20]" />
                            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                                {selectedCategory === 'all' ? 'Rekomendasi Produk' : `Produk ${categories.find(c => c.slug === selectedCategory)?.name}`}
                            </h2>
                        </div>

                        {selectedCategory !== 'all' && (
                            <Link
                                href={`/category/${selectedCategory}`}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-[#1B5E20] rounded-xl text-xs sm:text-sm font-bold hover:bg-[#1B5E20] hover:text-white transition-all border border-green-100 shadow-sm group w-fit"
                            >
                                <span>Lihat Halaman Lengkap</span>
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        )}
                    </div>

                    {productsLoading || loading ? (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <div key={n} className="h-64 bg-gray-100 rounded-3xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
                            {products.length > 0 ? (
                                products.map((product) => (
                                    <Link key={product.id} href={`/product/${product.id}`}>
                                        <div className="group bg-white rounded-lg overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 border border-gray-200 hover:border-transparent flex flex-col h-full relative">

                                            {/* Image Container */}
                                            <div className="aspect-square bg-gray-50 relative overflow-hidden">
                                                {product.image ? (
                                                    <img
                                                        src={getImageUrl(product.image) || ''}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <Sparkles className="h-8 w-8" />
                                                    </div>
                                                )}
                                                {/* Overlay CTA */}
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                                                {/* Quick Action Buttons (Overlay) */}
                                                <div className="absolute top-2 right-2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 z-10">
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            openShareDialog(product);
                                                        }}
                                                        className="h-8 w-8 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-[#1B5E20] hover:bg-gray-50 transition-colors"
                                                        title="Bagikan"
                                                    >
                                                        <Share2 className="h-4 w-4" />
                                                    </button>
                                                </div>

                                                <button className="absolute bottom-3 right-3 h-8 w-8 sm:h-10 sm:w-10 bg-white rounded-full shadow-lg flex items-center justify-center text-[#1B5E20] translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#1B5E20] hover:text-white">
                                                    <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                                                </button>
                                            </div>

                                            {/* Content */}
                                            <div className="p-4 flex flex-col flex-1">
                                                <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mb-1 truncate flex items-center">
                                                    <Store className="h-3 w-3 mr-1" />
                                                    {product.shop.name}
                                                </div>
                                                {product.shop.address && (
                                                    <div className="text-[10px] text-gray-400 flex items-center mb-2 truncate">
                                                        <MapPin className="h-3 w-3 mr-1" />
                                                        {product.shop.address}
                                                    </div>
                                                )}
                                                <h3 className="font-black text-black text-[11px] sm:text-[15px] leading-snug mb-1 line-clamp-2 group-hover:text-[#1B5E20] transition-colors uppercase tracking-tight">
                                                    {product.name}
                                                </h3>

                                                {/* <div className="flex items-center mb-2">
                                                    <StarRating rating={product.averageRating || 0} size={10} className="mr-1" />
                                                    <span className="text-[10px] font-black text-black">{(product.averageRating || 0).toFixed(1)}</span>
                                                    <span className="text-[9px] text-gray-400 ml-1 font-bold">({product.totalReviews || 0})</span>
                                                </div> */}

                                                {product.category && (() => {
                                                    const catStyle = getCategoryStyle(product.category.slug);
                                                    const CatIcon = catStyle.icon;
                                                    return (
                                                        <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full mb-2 ${catStyle.bg} ${catStyle.color} text-[9px] sm:text-[10px] font-semibold w-fit`}>
                                                            <CatIcon className="h-2.5 w-2.5 shrink-0" />
                                                            <span className="truncate max-w-[120px]">
                                                                {product.category.parent ? `${product.category.parent.name} > ` : ''}
                                                                {product.category.name}
                                                            </span>
                                                        </div>
                                                    );
                                                })()}

                                                <div className="mt-auto flex items-end justify-between">
                                                    <div>
                                                        <p className="text-[10px] text-gray-500 line-through">{formatPrice(product.price * 1.1)}</p>
                                                        <p className="text-xs sm:text-lg font-black text-[#1B5E20]">
                                                            {formatPrice(product.price)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="col-span-full py-12 text-center">
                                    <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                                        <ShoppingBag className="h-8 w-8 text-gray-300" />
                                    </div>
                                    <p className="text-gray-500 font-medium">Tidak ada produk untuk kategori ini.</p>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </main>

            {/* Share Dialog Component */}
            <ShareDialog
                isOpen={shareData.isOpen}
                onClose={() => setShareData({ ...shareData, isOpen: false })}
                url={shareData.url}
                title={shareData.title}
            />
        </div>
    );
}
