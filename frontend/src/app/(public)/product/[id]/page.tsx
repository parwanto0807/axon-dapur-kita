'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import {
    Store, MapPin, Star, Heart, Share2, ShoppingCart,
    ArrowLeft, Minus, Plus, ShieldCheck, Truck
} from 'lucide-react';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatPrice } from '@/utils/format';
import { getImageUrl } from '@/utils/image';


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

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
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
        }
    }, [id]);

    const handleQuantityChange = (type: 'inc' | 'dec') => {
        if (type === 'inc' && product && quantity < product.stock) {
            setQuantity(prev => prev + 1);
        } else if (type === 'dec' && quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const addItem = useCartStore((state) => state.addItem);
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

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

        alert(`Berhasil menambahkan ${quantity} ${product.name} ke keranjang!`);
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
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-48 w-48 bg-gray-200 rounded-xl mb-4"></div>
                    <div className="h-4 w-64 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
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
            {/* Mobile Header */}
            <div className="sticky top-0 z-50 bg-white border-b px-4 py-3 flex items-center justify-between md:hidden">
                <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="h-6 w-6 text-gray-700" />
                </button>
                <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-gray-100 rounded-full">
                        <Share2 className="h-6 w-6 text-gray-700" />
                    </button>

                </div>
            </div>

            <main className="max-w-7xl mx-auto md:px-6 md:py-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                    {/* Left: Images */}
                    <div className="md:col-span-5 bg-white md:rounded-2xl md:p-4">
                        <div className="relative aspect-square w-full bg-white md:rounded-xl overflow-hidden border-b md:border border-gray-100">
                            {selectedImage ? (
                                <img
                                    src={getImageUrl(selectedImage) || ''}
                                    alt={product.name}
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <Store className="h-20 w-20" />
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {product.images && product.images.length > 1 && (
                            <div className="p-4 md:p-0 md:mt-4 flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(img.url)}
                                        className={`relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border-2 transition ${selectedImage === img.url ? 'border-[#1B5E20]' : 'border-gray-200'
                                            }`}
                                    >
                                        <img
                                            src={getImageUrl(img.url) || ''}
                                            alt={`Thumbnail ${idx}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Info */}
                    <div className="md:col-span-7 space-y-6 px-4 md:px-0">
                        {/* Generic Info */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mt-4 md:mt-0">
                            <h1 className="text-lg md:text-2xl font-bold text-gray-900 leading-tight">
                                {product.name}
                            </h1>

                            <div className="mt-3 flex items-end justify-between">
                                <p className="text-xl md:text-3xl font-bold text-[#1B5E20]">
                                    {formatPrice(product.price)}
                                    {product.unit && <span className="text-sm text-gray-500 font-normal ml-1">/{product.unit.name}</span>}
                                </p>
                            </div>

                            <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500 border-t pt-4">
                                <div>
                                    <span className="block text-xs text-gray-400">Kondisi</span>
                                    <span className="font-semibold text-gray-900">{product.condition === 'NEW' ? 'Baru' : 'Bekas'}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-gray-400">Berat</span>
                                    <span className="font-semibold text-gray-900">{product.weight} gr</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-gray-400">Kategori</span>
                                    <span className="font-semibold text-[#1B5E20]">{product.category?.name || '-'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Shop Card */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:border-[#1B5E20] transition"
                            onClick={() => router.push(`/${product.shop.slug}`)}>
                            <div className="flex items-center space-x-4">
                                <div className="h-14 w-14 rounded-full border border-gray-200 overflow-hidden bg-gray-50">
                                    {product.shop.logo ? (
                                        <img src={getImageUrl(product.shop.logo) || ''} alt={product.shop.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <Store className="h-full w-full p-3 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <h3 className="font-bold text-gray-900">{product.shop.name}</h3>
                                        <div className="bg-green-100 px-2 py-0.5 rounded text-[10px] font-bold text-green-700">Official</div>
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500 mt-1">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        <span className="line-clamp-1">{product.shop.address}</span>
                                    </div>
                                </div>
                                <button className="px-4 py-1.5 border border-[#1B5E20] text-[#1B5E20] text-sm font-semibold rounded-lg hover:bg-green-50">
                                    Kunjungi
                                </button>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-sm md:text-base font-bold text-gray-900 mb-3">Deskripsi Produk</h3>
                            <div className="prose prose-sm text-gray-600 leading-relaxed whitespace-pre-wrap text-xs md:text-sm">
                                {product.description || 'Tidak ada deskripsi.'}
                            </div>
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
                        {/* Quantity (Hidden if out or stock) */}
                        {product.stock > 0 && (
                            <div className="flex items-center border border-gray-300 rounded-xl bg-gray-50">
                                <button
                                    onClick={() => handleQuantityChange('dec')}
                                    disabled={quantity <= 1}
                                    className="p-2 md:p-3 text-gray-600 hover:text-[#1B5E20] disabled:opacity-30"
                                >
                                    <ArrowLeft className="h-4 w-4 rotate-270" />
                                    <Minus className="h-3 w-3 md:h-4 md:w-4" />
                                </button>
                                <span className="w-8 text-center font-semibold text-gray-900">{quantity}</span>
                                <button
                                    onClick={() => handleQuantityChange('inc')}
                                    disabled={quantity >= product.stock}
                                    className="p-2 md:p-3 text-gray-600 hover:text-[#1B5E20] disabled:opacity-30"
                                >
                                    <Plus className="h-3 w-3 md:h-4 md:w-4" />
                                </button>
                            </div>
                        )}

                        {product.stock > 0 ? (
                            <>
                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 md:flex-none md:w-40 py-2.5 md:py-3 border border-[#1B5E20] text-[#1B5E20] text-sm md:text-base font-bold rounded-xl hover:bg-green-50 transition flex items-center justify-center space-x-2"
                                >
                                    <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
                                    <span>Keranjang</span>
                                </button>
                                <button
                                    onClick={handleBuyNow}
                                    className="flex-1 md:flex-none md:w-48 py-2.5 md:py-3 bg-[#1B5E20] text-white text-sm md:text-base font-bold rounded-xl hover:bg-green-800 transition"
                                >
                                    Beli Langsung
                                </button>
                            </>
                        ) : (
                            <button disabled className="w-full md:w-64 py-3 bg-gray-300 text-gray-500 font-bold rounded-xl cursor-not-allowed">
                                Stok Habis
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
