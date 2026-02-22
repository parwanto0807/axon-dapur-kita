"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import HeroSlider from "@/components/features/HeroSlider";
import ShareDialog from "@/components/ui/ShareDialog";
import {
  Store, MapPin, TrendingUp, Sparkles, ShoppingCart, ShoppingBag,
  Grid, Utensils, Snowflake, Coffee, Leaf, CookingPot, UtensilsCrossed,
  Apple, Wheat, Package, Droplet, Fish, Egg, CupSoda, Cookie, ChefHat,
  Croissant, ShoppingBasket, Search, ArrowRight, Star, Share2, Soup, X
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import clsx from 'clsx';
import { formatPrice } from "@/utils/format";
import { getImageUrl } from "@/utils/image";
import { ProductSkeleton, CategorySkeleton, ShopSkeleton } from "@/components/ui/Skeleton";
import WishlistButton from "@/components/ui/WishlistButton";
import FilterBar, { FilterState } from "@/components/features/FilterBar";

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
    address?: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
    parent?: { name: string; slug: string } | null;
  } | null;
  tags?: {
    tag: {
      id: string;
      name: string;
      type: string;
    };
  }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

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

export default function Home() {
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
  const [filters, setFilters] = useState<FilterState>({ sortBy: 'price_low' });

  const { isLoggedIn, isLoading } = useAuthStore();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      router.replace('/dashboard');
    }
  }, [isLoggedIn, isLoading, router]);

  const openShareDialog = (product: Product) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    setShareData({
      isOpen: true,
      url: `${origin}/product/${product.id}`,
      title: product.name
    });
  };

  // Initial Load
  useEffect(() => {
    const fetchData = async () => {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';

      try {
        const [shopsRes, categoriesRes] = await Promise.all([
          axios.get(`${apiBaseUrl}/shops/public`),
          axios.get(`${apiBaseUrl}/categories`)
        ]);
        setShops(shopsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
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

  const filteredProducts = products.filter(product => {
    if (filters.minPrice && product.price < filters.minPrice) return false;
    if (filters.maxPrice && product.price > filters.maxPrice) return false;
    return true;
  }).sort((a, b) => {
    if (filters.sortBy === 'price_low') return a.price - b.price;
    if (filters.sortBy === 'price_high') return b.price - a.price;
    return 0;
  });

  return (
    <div className="min-h-screen bg-white">

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-3 sm:py-6 sm:px-6 lg:px-8 space-y-4 sm:space-y-12">

        {/* Hero Section */}
        <section>
          <HeroSlider />
        </section>


        {/* === VALUE PROPOSITION SECTION === */}
        <section className="py-1 sm:py-4">
          <div className="text-center mb-4 sm:mb-8">
            <span className="inline-block bg-[#1B5E20]/10 text-[#1B5E20] text-[10px] sm:text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-3">
              🌿 Kenapa Axon DapurKita?
            </span>
            <h2 className="text-lg sm:text-3xl font-black text-gray-900 leading-tight">
              Memberdayakan UMKM Lokal,<br className="hidden sm:block" />
              <span className="text-[#1B5E20]"> Satu Dapur dalam Satu Radius</span>
            </h2>
            <p className="mt-2 text-xs sm:text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
              Platform digital yang menghubungkan penjual UMKM rumahan dengan pembeli di sekitarnya — cepat, segar, dan langsung dari tetangga dekat kita.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
            {/* Pillar 1 */}
            <div className="group relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-green-100 hover:shadow-xl hover:shadow-green-100/50 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-2xl flex items-center justify-center shadow-md shadow-green-100 mb-4 group-hover:scale-110 transition-transform">
                <Store className="h-6 w-6 sm:h-8 sm:w-8 text-[#1B5E20]" />
              </div>
              <h3 className="text-sm sm:text-lg font-black text-gray-900 mb-2">Dapur Pribadi Jadi Toko Digital</h3>
              <p className="text-[11px] sm:text-sm text-gray-600 leading-relaxed">
                Siapapun bisa berjualan — dari ibu rumah tangga hingga pedagang warung. Kami bantu UMKM tampil modern dan profesional secara digital tanpa alat canggih.
              </p>
              <div className="mt-4 inline-flex items-center text-[#1B5E20] font-bold text-xs gap-1 group-hover:gap-2 transition-all">
                <Link href="/seller-info">Mulai Berjualan</Link>
                <span>→</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="group relative bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-blue-100 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-2xl flex items-center justify-center shadow-md shadow-blue-100 mb-4 group-hover:scale-110 transition-transform">
                <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              <h3 className="text-sm sm:text-lg font-black text-gray-900 mb-2">Temukan Penjual di Sekitar Anda</h3>
              <p className="text-[11px] sm:text-sm text-gray-600 leading-relaxed">
                Cari produk berdasarkan radius lokasi — temukan UMKM tetangga yang menjual sayur segar, masakan hangat, jamu tradisional, dan lainnya hanya dalam jarak dekat.
              </p>
              <div className="mt-4 inline-flex items-center text-blue-600 font-bold text-xs gap-1 group-hover:gap-2 transition-all">
                <Link href="/nearby">Cari Penjual Terdekat</Link>
                <span>→</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="group relative bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-orange-100 hover:shadow-xl hover:shadow-orange-100/50 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-2xl flex items-center justify-center shadow-md shadow-orange-100 mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
              </div>
              <h3 className="text-sm sm:text-lg font-black text-gray-900 mb-2">Produk Segar, Masih Hangat</h3>
              <p className="text-[11px] sm:text-sm text-gray-600 leading-relaxed">
                Karena penjual ada di sekitar Anda, produk sampai lebih cepat — masakan masih hangat, sayur masih segar, dan jamu baru dibuat. Kualitas terjamin dari sumber langsung.
              </p>
              <div className="mt-4 inline-flex items-center text-orange-500 font-bold text-xs gap-1 group-hover:gap-2 transition-all">
                <Link href="/dashboard">Belanja Sekarang</Link>
                <span>→</span>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section - Modern Horizontal Scroll */}
        <section>
          <div className="flex items-center justify-between mb-3 sm:mb-6">
            <h2 className="text-sm sm:text-2xl font-black text-gray-900 tracking-tight flex items-center">
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
                    ? "bg-[#1B5E20] text-white border-[#1B5E20] ring-2 ring-[#1B5E20] ring-offset-1 sm:ring-offset-2 scale-105"
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
                [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <CategorySkeleton key={i} />
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
                        "text-[10px] sm:text-xs font-bold text-center max-w-[50px] sm:max-w-[80px] leading-tight",
                        isSelected ? "text-gray-900" : "text-gray-500"
                      )}>{cat.name}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* Featured Shops / Toko Terdekat */}
        <section>
          <div className="flex items-center justify-between mb-2 sm:mb-6">
            <h2 className="text-sm sm:text-2xl font-black text-gray-900 tracking-tight flex items-center">
              <Store className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-6 sm:w-6 text-[#1B5E20]" />
              Toko Pilihan
            </h2>
          </div>

          {loading ? (
            <div className="grid gap-2 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <ShopSkeleton key={n} />
              ))}
            </div>
          ) : (
            <div className="grid gap-2 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {shops.length > 0 ? (
                shops.slice(0, 6).map((shop) => (
                  <Link key={shop.id} href={`/${shop.slug}`}>
                    <div className="group relative bg-white rounded-xl sm:rounded-2xl p-2 sm:p-4 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200 hover:border-green-100 flex items-center space-x-2 sm:space-x-4 overflow-hidden">
                      {/* Hover Effect Background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-green-50/0 to-green-50/0 group-hover:from-green-50/30 group-hover:to-transparent transition-all duration-500" />

                      <div className="h-9 w-9 sm:h-16 sm:w-16 shrink-0 bg-gray-50 rounded-lg sm:rounded-xl flex items-center justify-center overflow-hidden border border-gray-100 group-hover:scale-105 transition-transform duration-300">
                        {shop.logo ? (
                          <img
                            src={getImageUrl(shop.logo) || ''}
                            alt={shop.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Store className="h-4 w-4 sm:h-6 sm:w-6 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 relative z-10">
                        <h3 className="font-bold text-[10px] sm:text-base text-gray-900 group-hover:text-[#1B5E20] transition-colors truncate">
                          {shop.name}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-gray-500 truncate flex items-center mt-0.5">
                          <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 shrink-0" />
                          {shop.address || 'Lokasi tidak tersedia'}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                  <p className="text-gray-500">Belum ada toko yang terdaftar.</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Products Grid */}
        <section>
          <div className="flex items-center space-x-1.5 sm:space-x-2 mb-3 sm:mb-6">
            <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-[#1B5E20]" />
            <h2 className="text-sm sm:text-2xl font-black text-gray-900 tracking-tight">Rekomendasi Produk</h2>
          </div>

          <div className="mb-6 -mx-4 sm:mx-0">
            <FilterBar
              categories={categories}
              onFilterChange={(newFilters) => setFilters(newFilters)}
            />
          </div>

          {loading || productsLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <ProductSkeleton key={n} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div key={product.id} className="group bg-white rounded-2xl sm:rounded-3xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 border border-gray-200 hover:border-transparent flex flex-col h-full relative">

                    <div className="relative">
                      <Link href={`/product/${product.id}`} className="block">
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
                              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8" />
                            </div>
                          )}
                          {/* Overlay CTA */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                        </div>
                      </Link>

                      {/* Quick Action Buttons (Overlay) */}
                      <div className="absolute top-2 right-2 flex flex-col space-y-1 z-10">
                        <WishlistButton
                          product={{
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image: product.image,
                            shop: {
                              id: product.shop.slug, // Using slug as ID for simplicity in public view
                              name: product.shop.name
                            }
                          }}
                          className="shadow-md"
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openShareDialog(product);
                          }}
                          className="h-8 w-8 bg-white/90 backdrop-blur-md rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-[#1B5E20] hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                          title="Bagikan"
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <Link href={`/product/${product.id}`} className="block flex-1 flex flex-col">
                      {/* Content */}
                      <div className="p-2.5 sm:p-4 flex flex-col flex-1">
                        <div className="text-[10px] sm:text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-0.5 sm:mb-1 truncate flex items-center">
                          <Store className="h-3 w-3 sm:h-3 sm:w-3 mr-1 sm:mr-1" />
                          {product.shop.name}
                        </div>
                        {product.shop.address && (
                          <div className="text-[10px] sm:text-[10px] text-gray-400 flex items-center mb-1 sm:mb-2 truncate">
                            <MapPin className="h-3 w-3 sm:h-3 sm:w-3 mr-1 sm:mr-1" />
                            {product.shop.address}
                          </div>
                        )}
                        <h3 className="font-bold text-gray-900 text-[10px] sm:text-[15px] leading-snug mb-1 sm:mb-2 line-clamp-2 group-hover:text-[#1B5E20] transition-colors">
                          {product.name}
                        </h3>

                        {product.category && (() => {
                          const catStyle = getCategoryStyle(product.category.slug);
                          const CatIcon = catStyle.icon;
                          return (
                            <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full mb-1 ${catStyle.bg} ${catStyle.color} text-[9px] sm:text-[10px] font-semibold w-fit`}>
                              <CatIcon className="h-2.5 w-2.5 shrink-0" />
                              <span className="truncate max-w-[120px]">
                                {product.category.parent ? `${product.category.parent.name} > ` : ''}
                                {product.category.name}
                              </span>
                            </div>
                          );
                        })()}

                        {product.tags && product.tags.length > 0 && (
                          <div className="flex flex-wrap gap-0.5 mb-1.5 min-h-[14px]">
                            {product.tags.map((t) => (
                              <span key={t.tag.id} className="px-1 py-0.5 bg-[#1B5E20]/5 text-[#1B5E20] text-[7px] font-bold rounded-sm uppercase border border-[#1B5E20]/10 tracking-tight leading-none">
                                {t.tag.name}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="mt-auto flex items-end justify-between">
                          <div>
                            <p className="text-[10px] sm:text-[10px] text-gray-500 line-through">{formatPrice(product.price * 1.1)}</p>
                            <p className="text-sm sm:text-lg font-black text-[#1B5E20]">
                              {formatPrice(product.price)}
                            </p>
                          </div>
                          <div className="h-7 w-7 sm:h-9 sm:w-9 bg-[#1B5E20] rounded-full shadow-lg flex items-center justify-center text-white group-hover:bg-[#154618] transition-all">
                            <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center">
                  <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="h-10 w-10 text-gray-300" />
                  </div>
                  <p className="text-gray-900 font-bold text-lg mb-1">Produk tidak ditemukan</p>
                  <p className="text-gray-500">Coba pilih kategori lain atau cek kembali nanti.</p>
                </div>
              )}
            </div>
          )}
        </section>

      </main>

      {/* Modern Modal for All Categories - Now with Native Mobile Feel */}
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
                    <button
                      key={cat.id}
                      onClick={() => { setSelectedCategory(cat.slug); setIsModalOpen(false); }}
                      className={clsx(
                        "flex flex-col items-center justify-center p-3 sm:p-6 rounded-2xl sm:rounded-[2rem] border transition-all text-center h-full group",
                        isSelected
                          ? "bg-gray-900 border-gray-900 shadow-xl scale-105"
                          : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-xl hover:-translate-y-1"
                      )}
                    >
                      <div className={clsx(
                        "p-2.5 sm:p-5 rounded-xl sm:rounded-2xl mb-2 sm:mb-4 transition-all duration-300",
                        isSelected ? "bg-white/10 text-white" : `${style.bg} ${style.color} group-hover:opacity-80`
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
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Dialog Component */}
      <ShareDialog
        isOpen={shareData.isOpen}
        onClose={() => setShareData({ ...shareData, isOpen: false })}
        url={shareData.url}
        title={shareData.title}
      />
    </div >
  );
}
