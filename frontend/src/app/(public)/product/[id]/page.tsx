'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import {
    Store, MapPin, Star, Share2, ShoppingCart,
    ArrowLeft, Minus, Plus, ShieldCheck, Truck
} from 'lucide-react';
import WishlistButton from '@/components/ui/WishlistButton';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import clsx from 'clsx';
import { formatPrice } from '@/utils/format';
import { getImageUrl } from '@/utils/image';
import { Skeleton } from '@/components/ui/Skeleton';
import StarRating from '@/components/ui/StarRating';
import ReviewList from '@/components/features/ReviewList';
import { toast } from 'sonner';


interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    weight: number;
    condition: string;
    category: { name: string };
    unit: { name: string };
    images: { url: string; isPrimary: boolean }[];
    shop: {
        name: string;
        slug: string;
        logo: string | null;
        address: string;
        isOpen: boolean;
    };
    isActive: boolean;
}



export default function ProductPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);

    const [reviews, setReviews] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({ averageRating: 0, totalReviews: 0 });
    const [reviewsLoading, setReviewsLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';
                const response = await axios.get(`${apiBaseUrl}/products/${id}`);
                setProduct(response.data);

                // Set initial selected image
                if (response.data.images && response.data.images.length > 0) {
                    const primary = response.data.images.find((img: any) => img.isPrimary);
                    setSelectedImage(primary ? primary.url : response.data.images[0].url);
                }
            } catch (err: any) {
                console.error("Error fetching product:", err);
                setError(err.response?.data?.message || 'Gagal memuat produk.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
            fetchReviews();
        }
    }, [id]);

    const fetchReviews = async () => {
        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';
            const res = await axios.get(`${apiBaseUrl}/reviews/product/${id}`);
            setReviews(res.data.reviews);
            setStats({
                averageRating: res.data.averageRating,
                totalReviews: res.data.totalReviews
            });
        } catch (e) {
            console.error('Failed to fetch reviews', e);
        } finally {
            setReviewsLoading(false);
        }
    };

    const handleQuantityChange = (type: 'inc' | 'dec') => {
        if (type === 'inc' && product && quantity < product.stock) {
            setQuantity(prev => prev + 1);
        } else if (type === 'dec' && quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const addItem = useCartStore((state) => state.addItem);
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: product?.name,
                url: window.location.href,
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link produk berhasil disalin!');
        }
    };

    const handleAddToCart = () => {
        if (!product) return;

        addItem({
            productId: product.id,
            name: product.name,
            price: Number(product.price),
            image: product.images.length > 0 ? product.images[0].url : '',
            quantity: quantity,
            shopId: product.shop.slug, // Use slug or ID based on cartStore needs
            unit: product.unit?.name || 'pcs'
        });

        toast.success(`Berhasil menambahkan ${quantity} ${product.name} ke keranjang!`, {
            action: {
                label: 'Lihat Keranjang',
                onClick: () => router.push('/cart')
            }
        });
    };

    const handleBuyNow = () => {
        if (!isLoggedIn) {
            router.push(`/login?redirect=/product/${id}`);
            return;
        }

        if (!product) return;

        addItem({
            productId: product.id,
            name: product.name,
            price: Number(product.price),
            image: product.images.length > 0 ? product.images[0].url : '',
            quantity: quantity,
            shopId: product.shop.slug,
            unit: product.unit?.name || 'pcs'
        });

        router.push('/checkout');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        <div className="md:col-span-5">
                            <Skeleton className="aspect-square w-full rounded-[2.5rem]" />
                        </div>
                        <div className="md:col-span-7 space-y-6">
                            <Skeleton className="h-32 w-full rounded-[2rem]" />
                            <Skeleton className="h-24 w-full rounded-2xl" />
                            <Skeleton className="h-48 w-full rounded-2xl" />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center">
                <div className="bg-red-50 p-4 rounded-full mb-4">
                    <Store className="h-8 w-8 text-red-500" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">Produk Tidak Ditemukan</h1>
                <p className="text-gray-500 mb-6">{error || "Produk yang Anda cari mungkin sudah dihapus."}</p>
                <button
                    onClick={() => router.back()}
                    className="px-6 py-2 bg-[#1B5E20] text-white rounded-xl font-medium"
                >
                    Kembali
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-poppins)] pb-24 md:pb-12">
            {/* Mobile Header Removed - Navigation moved to card */}

            <main className="max-w-7xl mx-auto md:px-6 md:py-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                    {/* Left: Images */}
                    <div className="md:col-span-6 lg:col-span-5 flex flex-col pt-2 md:pt-0">
                        <div className="bg-white md:rounded-[2.5rem] p-4 sm:p-6 lg:p-10 md:shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 relative">

                            {/* In-content Navigation Buttons (Mobile) */}
                            <div className="absolute top-4 right-4 flex items-center z-20 md:hidden">
                                <button
                                    onClick={handleShare}
                                    className="px-3 py-1.5 bg-white/95 backdrop-blur-sm shadow-sm rounded-xl flex items-center space-x-1.5 text-gray-600 font-bold text-[10px] active:scale-95 transition-all border border-gray-50"
                                >
                                    <Share2 className="h-3.5 w-3.5" />
                                    <span>Bagikan</span>
                                </button>
                            </div>
                            <div className="relative w-[65%] md:w-[85%] lg:w-[65%] mx-auto group">
                                {selectedImage ? (
                                    <img
                                        src={getImageUrl(selectedImage) || ''}
                                        alt={product.name}
                                        className="w-full h-auto object-contain transform group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="aspect-square w-full flex items-center justify-center text-gray-200 bg-gray-50/50 rounded-2xl">
                                        <Store className="h-12 w-12" />
                                    </div>
                                )}
                            </div>

                            {/* Thumbnails integrated into the same card */}
                            {product.images && product.images.length > 1 && (
                                <div className="mt-6 flex space-x-2 overflow-x-auto pb-1 scrollbar-hide px-1 justify-center">
                                    {product.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImage(img.url)}
                                            className={clsx(
                                                "relative h-10 w-10 sm:h-16 sm:w-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-300",
                                                selectedImage === img.url
                                                    ? 'border-[#1B5E20] shadow-sm scale-110'
                                                    : 'border-gray-50 opacity-60 hover:opacity-100'
                                            )}
                                        >
                                            <img
                                                src={getImageUrl(img.url) || ''}
                                                alt={`Thumbnail ${idx}`}
                                                className="w-full h-full object-cover"
                                            />
                                            {selectedImage === img.url && (
                                                <div className="absolute inset-0 bg-[#1B5E20]/5" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Product Info */}
                    <div className="md:col-span-6 lg:col-span-7 space-y-6 px-4 md:px-0">
                        {/* Generic Info */}
                        <div className="bg-white p-6 rounded-[2rem] border border-gray-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mt-2 md:mt-0">
                            <div className="flex items-center justify-between">
                                <span className="px-2 py-0.5 bg-green-50 text-[#1B5E20] text-[8px] sm:text-[10px] font-bold rounded-full uppercase tracking-widest">
                                    {product.category?.name || 'Produk'}
                                </span>
                                <StarRating
                                    rating={stats.averageRating || 0}
                                    count={stats.totalReviews}
                                    showLabel
                                />
                            </div>

                            <h1 className="mt-2 text-sm md:text-2xl lg:text-3xl font-black text-gray-900 leading-tight">
                                {product.name}
                            </h1>

                            <div className="mt-2 flex items-baseline space-x-2">
                                <p className="text-base md:text-3xl lg:text-4xl font-black text-[#1B5E20]">
                                    {formatPrice(product.price)}
                                </p>
                                {product.unit && <span className="text-[9px] md:text-base text-gray-400 font-bold uppercase tracking-wider">/ {product.unit.name}</span>}
                            </div>

                            <div className="mt-4 grid grid-cols-3 gap-2 py-3 border-t border-gray-50">
                                <div className="text-center">
                                    <span className="block text-[8px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Kondisi</span>
                                    <span className="text-[10px] sm:text-sm font-black text-gray-900">{product.condition === 'NEW' ? 'Baru' : 'Bekas'}</span>
                                </div>
                                <div className="text-center border-x border-gray-50">
                                    <span className="block text-[8px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Berat</span>
                                    <span className="text-[10px] sm:text-sm font-black text-gray-900">{product.weight} gr</span>
                                </div>
                                <div className="text-center">
                                    <span className="block text-[7px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Stok</span>
                                    <span className="text-[9px] sm:text-sm font-black text-gray-900">{product.stock} {product.unit?.name || 'Pcs'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Shop Card */}
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:border-[#1B5E20] transition active:scale-[0.98]"
                            onClick={() => router.push(`/${product.shop.slug}`)}>
                            <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-full border border-gray-100 overflow-hidden bg-gray-50 shrink-0">
                                    {product.shop.logo ? (
                                        <img src={getImageUrl(product.shop.logo) || ''} alt={product.shop.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <Store className="h-full w-full p-2.5 text-gray-300" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-1.5">
                                        <h3 className="font-bold text-[9px] sm:text-base text-gray-900 truncate">{product.shop.name}</h3>
                                        <div className="bg-green-100 px-1.5 py-0.5 rounded text-[7px] font-bold text-green-700">Official</div>
                                    </div>
                                    <div className="flex items-center text-[9px] sm:text-xs text-gray-500 mt-0.5">
                                        <MapPin className="h-2.5 w-2.5 mr-1" />
                                        <span className="truncate">{product.shop.address}</span>
                                    </div>
                                </div>
                                <button className="px-3 py-1 border border-[#1B5E20] text-[#1B5E20] text-[10px] sm:text-sm font-bold rounded-lg hover:bg-green-50 transition-colors">
                                    Cek Toko
                                </button>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-[9px] md:text-base font-black text-gray-900 mb-2 uppercase tracking-tight">Deskripsi Produk</h3>
                            <div className="prose prose-sm text-gray-600 leading-relaxed whitespace-pre-wrap text-[9px] sm:text-sm">
                                {product.description || 'Tidak ada deskripsi.'}
                            </div>
                        </div>

                        {/* Reviews Section */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-[9px] md:text-base font-black text-gray-900 uppercase tracking-tight">Ulasan Pembeli</h3>
                                {stats.totalReviews > 0 && (
                                    <div className="text-right">
                                        <div className="flex items-center justify-end space-x-1">
                                            <span className="text-lg font-black text-gray-900">{stats.averageRating.toFixed(1)}</span>
                                            <span className="text-xs text-gray-400 font-bold">/ 5.0</span>
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-medium">{stats.totalReviews} Ulasan</p>
                                    </div>
                                )}
                            </div>
                            <ReviewList reviews={reviews} isLoading={reviewsLoading} />
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Floating Action Bar (Mobile & Desktop sticky) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 md:px-8 md:py-4 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">

                    {/* Desktop Price & Shop Info (Hidden on Mobile) */}
                    <div className="hidden md:flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden">
                            {selectedImage && <img src={getImageUrl(selectedImage) || ''} className="h-full w-full object-cover" />}
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 line-clamp-1">{product.name}</p>
                            <p className="text-[#1B5E20] font-bold">{formatPrice(product.price)}</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3 w-full md:w-auto">
                        {/* Quantity */}
                        {product.stock > 0 && (
                            <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50/50">
                                <button
                                    onClick={() => handleQuantityChange('dec')}
                                    disabled={quantity <= 1}
                                    className="p-1.5 sm:p-3 text-gray-500 hover:text-[#1B5E20] disabled:opacity-30"
                                >
                                    <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                                </button>
                                <span className="w-5 sm:w-8 text-center font-bold text-[9px] sm:text-base text-gray-900">{quantity}</span>
                                <button
                                    onClick={() => handleQuantityChange('inc')}
                                    disabled={quantity >= product.stock}
                                    className="p-1.5 sm:p-3 text-gray-500 hover:text-[#1B5E20] disabled:opacity-30"
                                >
                                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                                </button>
                            </div>
                        )}

                        {product.stock > 0 ? (
                            <>
                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 md:flex-none md:w-36 py-1.5 sm:py-3 border border-[#1B5E20] text-[#1B5E20] text-[9px] sm:text-base font-bold rounded-lg hover:bg-green-50 active:bg-green-100 transition flex items-center justify-center space-x-1 sm:space-x-2"
                                >
                                    <ShoppingCart className="h-3 w-3 sm:h-5 sm:w-5" />
                                    <span>Keranjang</span>
                                </button>
                                <WishlistButton
                                    product={{
                                        id: product.id,
                                        name: product.name,
                                        price: product.price,
                                        image: product.images[0]?.url || null,
                                        shop: {
                                            id: product.shop.slug,
                                            name: product.shop.name
                                        }
                                    }}
                                    className="h-9 w-9 sm:h-[48px] sm:w-[48px] border border-gray-200"
                                />
                                <button
                                    onClick={handleBuyNow}
                                    className="flex-1 md:flex-none md:w-44 py-1.5 sm:py-3 bg-[#1B5E20] text-white text-[9px] sm:text-base font-bold rounded-lg hover:bg-green-800 active:bg-green-900 shadow-sm transition"
                                >
                                    Beli Langsung
                                </button>
                                <button
                                    onClick={() => router.back()}
                                    className="lg:hidden px-3 py-1.5 sm:py-3 border border-gray-200 text-gray-500 text-[9px] sm:text-base font-bold rounded-lg active:scale-95 transition-all"
                                >
                                    Kembali
                                </button>
                            </>
                        ) : (
                            <button disabled className="w-full md:w-64 py-2 sm:py-3 bg-gray-100 text-gray-400 text-[11px] sm:text-base font-black rounded-xl cursor-not-allowed uppercase tracking-widest">
                                Stok Habis
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
