'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import {
    ArrowLeft, CookingPot, UtensilsCrossed, Cookie, Croissant,
    CupSoda, Utensils, Fish, Wheat, Snowflake, Package, Leaf, Grid,
    Tag, ShoppingBag, Store, AlertCircle
} from 'lucide-react';
import { getImageUrl } from '@/utils/image';
import { formatPrice } from '@/utils/format';
import { ProductSkeleton } from '@/components/ui/Skeleton';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Category {
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
    parent?: { name: string; slug: string } | null;
    children?: Category[];
    _count?: { products: number };
}

interface TagItem {
    id: string;
    name: string;
    slug: string;
    type: 'CHARACTERISTIC' | 'EVENT' | 'DIET';
}

interface ProductItem {
    id: string;
    name: string;
    price: number;
    stock: number;
    image: string | null;
    unit: { name: string } | null;
    shop: { name: string; slug: string };
    tags: { tag: TagItem }[];
}

// ─── Icon Map ─────────────────────────────────────────────────────────────────
const getCategoryStyle = (slug: string) => {
    switch (slug) {
        case 'makanan-berat': return { icon: CookingPot, color: 'text-orange-600', bg: 'bg-orange-50/80', gradient: 'from-orange-500 to-red-500' };
        case 'hidangan-berkuah': return { icon: UtensilsCrossed, color: 'text-amber-700', bg: 'bg-amber-50/80', gradient: 'from-amber-500 to-orange-500' };
        case 'camilan-gorengan': return { icon: Cookie, color: 'text-yellow-700', bg: 'bg-yellow-50/80', gradient: 'from-yellow-500 to-amber-500' };
        case 'kue-jajanan-pasar': return { icon: Croissant, color: 'text-pink-600', bg: 'bg-pink-50/80', gradient: 'from-pink-500 to-rose-500' };
        case 'minuman': return { icon: CupSoda, color: 'text-sky-600', bg: 'bg-sky-50/80', gradient: 'from-sky-500 to-blue-500' };
        case 'bumbu-rempah': return { icon: Utensils, color: 'text-red-600', bg: 'bg-red-50/80', gradient: 'from-red-500 to-rose-500' };
        case 'lauk-mentah': return { icon: Fish, color: 'text-rose-700', bg: 'bg-rose-50/80', gradient: 'from-rose-500 to-pink-500' };
        case 'bahan-pokok': return { icon: Wheat, color: 'text-amber-600', bg: 'bg-amber-50/80', gradient: 'from-amber-500 to-yellow-500' };
        case 'frozen-food': return { icon: Snowflake, color: 'text-cyan-600', bg: 'bg-cyan-50/80', gradient: 'from-cyan-500 to-sky-500' };
        case 'paket-bundling': return { icon: Package, color: 'text-blue-600', bg: 'bg-blue-50/80', gradient: 'from-blue-500 to-indigo-500' };
        case 'jamu-herbal': return { icon: Leaf, color: 'text-green-700', bg: 'bg-green-50/80', gradient: 'from-green-500 to-emerald-500' };
        default: return { icon: Grid, color: 'text-gray-600', bg: 'bg-gray-50/80', gradient: 'from-gray-500 to-slate-500' };
    }
};

const TAG_TYPE_LABELS: Record<string, string> = {
    CHARACTERISTIC: '✦ Karakteristik',
    EVENT: '🎉 Acara & Momen',
    DIET: '🌿 Diet & Gaya Hidup',
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function CategoryPage() {
    const { slug } = useParams<{ slug: string }>();
    const router = useRouter();

    const [category, setCategory] = useState<Category | null>(null);
    const [products, setProducts] = useState<ProductItem[]>([]);
    const [tags, setTags] = useState<TagItem[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';

    useEffect(() => {
        if (!slug) return;
        fetchCategoryData();
        fetchTags();
    }, [slug]);

    const fetchCategoryData = async () => {
        setLoading(true);
        try {
            const [catRes, prodRes] = await Promise.all([
                axios.get(`${apiBaseUrl}/categories/${slug}`),
                axios.get(`${apiBaseUrl}/products/public?category=${slug}`),
            ]);
            setCategory(catRes.data);
            setProducts(prodRes.data);
        } catch (err: any) {
            if (err.response?.status === 404) setNotFound(true);
        } finally {
            setLoading(false);
        }
    };

    const fetchTags = async () => {
        try {
            const res = await axios.get(`${apiBaseUrl}/tags`);
            setTags(res.data);
        } catch { /* silent */ }
    };

    const toggleTag = (tagSlug: string) => {
        setSelectedTags(prev =>
            prev.includes(tagSlug) ? prev.filter(t => t !== tagSlug) : [...prev, tagSlug]
        );
    };

    // Filter products by selected tags
    const filteredProducts = selectedTags.length === 0
        ? products
        : products.filter(p =>
            selectedTags.some(ts => p.tags?.some(pt => pt.tag.slug === ts))
        );

    const style = category ? getCategoryStyle(category.slug) : getCategoryStyle('');
    const CategoryIcon = style.icon;

    // ── Loading ───────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 pb-10">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="h-48 rounded-3xl bg-gray-200 animate-pulse mt-4 mb-8" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
                    </div>
                </div>
            </div>
        );
    }

    // ── Not Found ─────────────────────────────────────────────────────────────
    if (notFound || !category) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 px-4">
                <AlertCircle className="w-16 h-16 text-gray-400" />
                <h1 className="text-2xl font-bold text-gray-700">Kategori tidak ditemukan</h1>
                <p className="text-gray-500 text-center">Kategori &ldquo;{slug}&rdquo; tidak ada atau sudah dihapus.</p>
                <Link href="/" className="px-5 py-2.5 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors">
                    Kembali ke Beranda
                </Link>
            </div>
        );
    }

    // Group tags by type for filter UI
    const tagGroups = tags.reduce<Record<string, TagItem[]>>((acc, tag) => {
        if (!acc[tag.type]) acc[tag.type] = [];
        acc[tag.type].push(tag);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 pb-16">
            {/* ── Hero Banner ─────────────────────────────────────────────── */}
            <div className={`bg-gradient-to-r ${style.gradient} text-white`}>
                <div className="max-w-5xl mx-auto px-4 py-8">
                    {/* Back button */}
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-white/80 hover:text-white mb-4 text-sm font-medium transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center flex-shrink-0">
                            <CategoryIcon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <p className="text-white/70 text-sm font-medium uppercase tracking-widest mb-1">Kategori</p>
                            <h1 className="text-2xl sm:text-3xl font-bold">{category.name}</h1>
                            {category.parent && (
                                <Link href={`/category/${category.parent.slug}`} className="text-white/70 text-sm hover:text-white">
                                    ← {category.parent.name}
                                </Link>
                            )}
                        </div>
                        <div className="ml-auto text-right">
                            <p className="text-3xl font-bold">{filteredProducts.length}</p>
                            <p className="text-white/70 text-sm">produk</p>
                        </div>
                    </div>

                    {/* Sub-categories */}
                    {category.children && category.children.length > 0 && (
                        <div className="mt-5 flex gap-2 flex-wrap">
                            {category.children.map((child: Category) => (
                                <Link
                                    key={child.id}
                                    href={`/category/${child.slug}`}
                                    className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-full text-sm font-medium transition-colors"
                                >
                                    {child.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 mt-6">
                {/* ── Tag Filters ─────────────────────────────────────────── */}
                {tags.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 border border-gray-100">
                        <div className="flex items-center gap-2 mb-3">
                            <Tag className="w-4 h-4 text-gray-500" />
                            <span className="font-semibold text-gray-700 text-sm">Filter Label</span>
                            {selectedTags.length > 0 && (
                                <button
                                    onClick={() => setSelectedTags([])}
                                    className="ml-auto text-xs text-red-500 hover:text-red-600 font-medium"
                                >
                                    Hapus filter
                                </button>
                            )}
                        </div>
                        <div className="space-y-3">
                            {Object.entries(tagGroups).map(([type, typeTags]) => (
                                <div key={type}>
                                    <p className="text-xs text-gray-400 font-medium mb-1.5">{TAG_TYPE_LABELS[type] ?? type}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {typeTags.map(tag => (
                                            <button
                                                key={tag.id}
                                                onClick={() => toggleTag(tag.slug)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${selectedTags.includes(tag.slug)
                                                    ? `bg-gradient-to-r ${style.gradient} text-white border-transparent shadow-sm`
                                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                {tag.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Product Grid ─────────────────────────────────────────── */}
                {filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                        <ShoppingBag className="w-16 h-16 text-gray-300" />
                        <h2 className="text-xl font-semibold text-gray-500">Belum ada produk</h2>
                        <p className="text-gray-400 text-sm max-w-xs">
                            {selectedTags.length > 0
                                ? 'Tidak ada produk yang cocok dengan filter yang dipilih.'
                                : 'Belum ada produk di kategori ini. Pantau terus ya!'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {filteredProducts.map(product => (
                            <Link
                                key={product.id}
                                href={`/product/${product.id}`}
                                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border border-gray-100 group"
                            >
                                {/* Image */}
                                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                                    {product.image ? (
                                        <img
                                            src={getImageUrl(product.image)}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ShoppingBag className="w-10 h-10 text-gray-300" />
                                        </div>
                                    )}
                                    {/* Event tags badge */}
                                    {product.tags?.some(pt => pt.tag.type === 'EVENT') && (
                                        <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                            {product.tags.find(pt => pt.tag.type === 'EVENT')?.tag.name}
                                        </div>
                                    )}
                                </div>

                                <div className="p-3">
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                                        <Store className="w-3 h-3" />
                                        {product.shop.name}
                                    </p>
                                    <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 leading-snug">{product.name}</h3>

                                    {/* Characteristic tags */}
                                    {product.tags?.filter(pt => pt.tag.type === 'CHARACTERISTIC').length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                            {product.tags.filter(pt => pt.tag.type === 'CHARACTERISTIC').slice(0, 2).map(pt => (
                                                <span key={pt.tag.id} className="text-[10px] bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
                                                    {pt.tag.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-end justify-between mt-2">
                                        <div>
                                            <p className="text-base font-bold text-gray-900">{formatPrice(product.price)}</p>
                                            <p className="text-[10px] text-gray-400">{product.stock} {product.unit?.name ?? 'pcs'}</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
