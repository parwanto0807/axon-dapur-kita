'use client';

import { useState, useEffect } from 'react';
import HeroSlider from "@/components/features/HeroSlider";
import ShareDialog from "@/components/ui/ShareDialog";
import {
    Store, MapPin, TrendingUp, ShoppingBag, ShoppingCart,
    User, LayoutDashboard, Sparkles, Coffee, Utensils,
    Leaf, Snowflake, Grid, CookingPot, UtensilsCrossed,
    Apple, Wheat, Package, Droplet, Fish, Egg, CupSoda,
    Cookie, ChefHat, Croissant, ShoppingBasket, ArrowRight, Star, Share2
} from "lucide-react";
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
        address?: string; // Added address
    };
}

interface Category {
    id: string;
    name: string;
    slug: string;
}



// Refined Category Styles - Soft Pastels & Modern Gradients (Synced with Landing Page)
const getCategoryStyle = (slug: string) => {
    switch (slug) {
        case 'lauk-mateng': return { icon: CookingPot, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', ring: 'ring-orange-500' };
        case 'sayur-matang': return { icon: UtensilsCrossed, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', ring: 'ring-green-500' };
        case 'sayuran-segar': return { icon: Leaf, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', ring: 'ring-emerald-500' };
        case 'bumbu-dapur': return { icon: Utensils, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', ring: 'ring-red-500' };
        case 'buah-buahan': return { icon: Apple, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', ring: 'ring-rose-500' };
        case 'beras': return { icon: Wheat, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', ring: 'ring-amber-500' };
        case 'sembako': return { icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', ring: 'ring-blue-500' };
        case 'minyak-goreng': return { icon: Droplet, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100', ring: 'ring-yellow-500' };
        case 'daging-ikan': return { icon: Fish, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-100', ring: 'ring-red-500' };
        case 'telur-susu': return { icon: Egg, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100', ring: 'ring-orange-500' };
        case 'minuman': return { icon: CupSoda, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-100', ring: 'ring-sky-500' };
        case 'cemilan': return { icon: Cookie, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100', ring: 'ring-amber-500' };
        case 'frozen-food': return { icon: Snowflake, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-100', ring: 'ring-cyan-500' };
        case 'katering': return { icon: ChefHat, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', ring: 'ring-purple-500' };
        case 'kue-roti': return { icon: Croissant, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-100', ring: 'ring-pink-500' };
        case 'jajanan-pasar': return { icon: ShoppingBasket, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100', ring: 'ring-teal-500' };
        case 'jamu': return { icon: Coffee, color: 'text-yellow-800', bg: 'bg-yellow-50', border: 'border-yellow-100', ring: 'ring-yellow-600' };
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
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
                const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
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
                                <p className="text-[10px] sm:text-sm text-gray-500">Selamat datang kembali di Axon DapurKita.</p>
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

                {/* Value Proposition */}
                <section className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                    {[
                        { icon: MapPin, title: "Dekat Rumah", desc: "Temukan penjual di sekitarmu" },
                        { icon: Star, title: "Terpercaya", desc: "Rating & ulasan transparan" },
                        { icon: ShoppingBag, title: "Bebas Ongkir", desc: "Untuk area terdekat" },
                        { icon: Utensils, title: "Masakan Segar", desc: "Dibuat setiap hari" },
                    ].map((feature, idx) => (
                        <div key={idx} className="bg-white p-2.5 sm:p-4 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-200 flex items-center space-x-2 sm:space-x-3 transition-transform hover:-translate-y-1">
                            <div className="p-1.5 sm:p-2.5 bg-green-50 rounded-lg text-[#1B5E20] shrink-0">
                                <feature.icon className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                            </div>
                            <div>
                                <h4 className="text-[9px] sm:text-sm font-bold text-gray-900 leading-tight">{feature.title}</h4>
                                <p className="text-[8px] sm:text-[10px] text-gray-500 hidden sm:block">{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </section>

                {/* Toko Terdekat Section */}
                <section className="mb-4 sm:mb-12">
                    <div className="mb-2 sm:mb-6 flex items-center justify-between">
                        <div className="flex items-center space-x-1 sm:space-x-2">
                            <MapPin className="h-3 w-3 sm:h-6 sm:w-6 text-[#1B5E20]" />
                            <h2 className="text-[11px] sm:text-2xl font-bold text-gray-900">Toko Terbaru</h2>
                        </div>
                        <a href="#" className="text-[#1B5E20] hover:underline font-medium text-[8px] sm:text-base">Lihat Semua</a>
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
                                                <div className="min-w-0">
                                                    <h3 className="font-bold text-[9px] sm:text-lg text-gray-900 group-hover:text-[#1B5E20] transition truncate">
                                                        {shop.name}
                                                    </h3>
                                                    <p className="text-[8px] sm:text-sm text-gray-500 line-clamp-1 flex items-center mt-0.5">
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
                                    "text-[8px] sm:text-xs font-bold text-center",
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
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.slug)}
                                            className="flex flex-col items-center flex-shrink-0 group snap-center"
                                        >
                                            <div className={clsx(
                                                "w-10 h-10 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-1 sm:mb-3 transition-all duration-300 border shadow-sm",
                                                isSelected
                                                    ? `${style.bg} ${style.color} ${style.border} ring-2 ${style.ring} ring-offset-1 sm:ring-offset-2 scale-105`
                                                    : `${style.bg} ${style.color} ${style.border} opacity-80 hover:opacity-100 hover:shadow-md hover:scale-105 group-hover:text-gray-600`
                                            )}>
                                                <Icon className={clsx("h-4 w-4 sm:h-8 sm:w-8 transition-colors", isSelected ? style.color : style.color)} />
                                            </div>
                                            <span className={clsx(
                                                "text-[8px] sm:text-xs font-bold text-center max-w-[40px] sm:max-w-[80px] leading-tight",
                                                isSelected ? "text-gray-900" : "text-gray-500"
                                            )}>{cat.name}</span>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </section>

                {/* Category Modal (Dialog) */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 sm:px-6">
                        <div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all"
                            onClick={() => setIsModalOpen(false)}
                        ></div>

                        <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                        Jelajahi Kategori
                                    </h3>
                                    <p className="text-sm text-gray-500">Temukan semua kebutuhan dapurmu disini</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all"
                                >
                                    <span className="sr-only">Close</span>
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    <button
                                        onClick={() => { setSelectedCategory('all'); setIsModalOpen(false); }}
                                        className={clsx(
                                            "flex flex-col items-center justify-center p-6 rounded-3xl border transition-all text-center h-full group",
                                            selectedCategory === 'all'
                                                ? "bg-green-50 border-[#1B5E20] ring-1 ring-[#1B5E20]"
                                                : "bg-white border-gray-100 hover:border-green-200 hover:bg-green-50/30 hover:shadow-lg"
                                        )}
                                    >
                                        <div className={clsx(
                                            "p-4 rounded-2xl mb-3 transition-colors",
                                            selectedCategory === 'all' ? "bg-[#1B5E20] text-white" : "bg-gray-50 text-gray-400 group-hover:bg-green-100 group-hover:text-green-600"
                                        )}>
                                            <Grid className="h-8 w-8" />
                                        </div>
                                        <span className={clsx("font-bold text-sm", selectedCategory === 'all' ? "text-[#1B5E20]" : "text-gray-700")}>Semua Produk</span>
                                    </button>

                                    {categories.map((cat) => {
                                        const style = getCategoryStyle(cat.slug);
                                        const Icon = style.icon;
                                        const isSelected = selectedCategory === cat.slug;

                                        return (
                                            <button
                                                key={cat.id}
                                                onClick={() => { setSelectedCategory(cat.slug); setIsModalOpen(false); }}
                                                className={clsx(
                                                    "flex flex-col items-center justify-center p-6 rounded-3xl border transition-all text-center h-full group",
                                                    isSelected
                                                        ? "bg-gray-900 text-white border-gray-900 shadow-xl"
                                                        : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-xl hover:-translate-y-1"
                                                )}
                                            >
                                                <div className={clsx(
                                                    "p-4 rounded-2xl mb-3 transition-colors",
                                                    isSelected ? "bg-white/10 text-white" : `${style.bg} ${style.color} group-hover:opacity-80`
                                                )}>
                                                    <Icon className="h-8 w-8" />
                                                </div>
                                                <span className={clsx(
                                                    "font-bold text-sm",
                                                    isSelected ? "text-white" : "text-gray-700"
                                                )}>
                                                    {cat.name}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Produk Grid */}
                <section>
                    <div className="flex items-center space-x-2 mb-6">
                        <TrendingUp className="h-6 w-6 text-[#1B5E20]" />
                        <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Rekomendasi Produk</h2>
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
                                                <div className="text-[9px] text-gray-500 font-medium uppercase tracking-wider mb-1 truncate flex items-center">
                                                    <Store className="h-3 w-3 mr-1" />
                                                    {product.shop.name}
                                                </div>
                                                {product.shop.address && (
                                                    <div className="text-[8px] text-gray-400 flex items-center mb-2 truncate">
                                                        <MapPin className="h-3 w-3 mr-1" />
                                                        {product.shop.address}
                                                    </div>
                                                )}
                                                <h3 className="font-bold text-gray-900 text-[11px] sm:text-[15px] leading-snug mb-2 line-clamp-2 group-hover:text-[#1B5E20] transition-colors">
                                                    {product.name}
                                                </h3>

                                                <div className="mt-auto flex items-end justify-between">
                                                    <div>
                                                        <p className="text-[8px] text-gray-500 line-through">{formatPrice(product.price * 1.1)}</p>
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
