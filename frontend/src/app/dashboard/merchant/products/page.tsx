'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from "@/store/authStore";
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Package, X, Share2, ChevronLeft, ChevronRight, Settings, AlertCircle, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import MerchantBottomNav from '@/components/merchant/MerchantBottomNav';
import ShareDialog from '@/components/ui/ShareDialog';
import { clsx } from 'clsx';
import { formatPrice } from '@/utils/format';
import { toast } from 'react-hot-toast';
import { getImageUrl } from '@/utils/image';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    image: string | null;
    unit: { name: string } | null;
    createdAt: string;
    slug: string;
    trackStock: boolean;
}

export default function ProductsPage() {
    const { isLoggedIn, isLoading: isAuthLoading } = useAuthStore();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [shareData, setShareData] = useState<{ isOpen: boolean; url: string; title: string }>({
        isOpen: false,
        url: '',
        title: ''
    });
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [stockManageDialog, setStockManageDialog] = useState<{
        isOpen: boolean;
        product: Product | null;
    }>({
        isOpen: false,
        product: null
    });

    const handleToggleTrackStock = async (productId: string, currentValue: boolean) => {
        setIsUpdating(productId);
        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';
            await axios.put(`${apiBaseUrl}/products/${productId}`, {
                trackStock: !currentValue
            }, { withCredentials: true });

            setProducts(prev => prev.map(p => p.id === productId ? { ...p, trackStock: !currentValue } : p));
            if (!currentValue) {
                toast.success('Stok diaktifkan (Otomatis)');
            } else {
                toast.error('Stok dimatikan (Manual)');
            }
        } catch (error) {
            console.error('Error toggling stock:', error);
            toast.error('Gagal mengubah pengaturan stok');
        } finally {
            setIsUpdating(null);
        }
    };

    useEffect(() => {
        if (!isAuthLoading && isLoggedIn) {
            fetchProducts();
        }
    }, [isAuthLoading, isLoggedIn]);

    const fetchProducts = async () => {
        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';
            const response = await axios.get(`${apiBaseUrl}/products/my-products`, { withCredentials: true });
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
            // Fallback to all products if my-products fails (dev environment consistency)
            try {
                const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';
                const response = await axios.get(`${apiBaseUrl}/products`, { withCredentials: true });
                setProducts(response.data);
            } catch (err) {
                toast.error('Gagal memuat produk');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Apakah anda yakin ingin menghapus produk ini?')) {
            try {
                const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';
                await axios.delete(`${apiBaseUrl}/products/${id}`, { withCredentials: true });
                setProducts(prev => prev.filter(p => p.id !== id));
                toast.success('Produk berhasil dihapus');
            } catch (error) {
                console.error('Error deleting product:', error);
                toast.error('Gagal menghapus produk');
            }
        }
    };

    const openShareDialog = (product: Product) => {
        // Use slug if available, fallback to id for now (backend should provide slug)
        // If slug is not available in type yet, we might need to rely on ID or structure from backend
        // Assuming backend returns slug. If not, we use id.
        const identifier = product.slug || product.id;
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        setShareData({
            isOpen: true,
            url: `${origin}/product/${identifier}`,
            title: product.name
        });
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen font-[family-name:var(--font-poppins)] p-2 pb-24 sm:p-6 lg:pb-8">
            <div className="w-full max-w-full">

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-8 gap-3 sm:gap-4 sm:px-0">
                    <div>
                        <h1 className="text-xs sm:text-2xl font-black text-gray-900 uppercase tracking-tight">Daftar Produk</h1>
                        <p className="text-[7px] sm:text-sm text-gray-400 font-medium mt-0.5 whitespace-nowrap">Kelola stok dan katalog produk anda</p>
                    </div>
                    <Link
                        href="/dashboard/merchant/products/add"
                        className="w-full sm:w-auto flex items-center justify-center space-x-1.5 sm:space-x-2 bg-[#1B5E20] text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl font-black uppercase tracking-widest text-[9px] sm:text-sm hover:bg-[#1B5E20]/90 transition-all shadow-lg shadow-green-900/10 active:scale-95 transition-all"
                    >
                        <Plus className="h-3 w-3 sm:h-5 sm:w-5" />
                        <span>Tambah Produk</span>
                    </Link>
                </div>

                {/* Filters & Search */}
                <div className="bg-white p-2.5 sm:p-4 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 shadow-sm mb-4 flex items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari Produk..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-none bg-gray-50 focus:ring-2 focus:ring-[#1B5E20]/10 focus:bg-white transition-all outline-none font-bold text-[10px] sm:text-sm text-gray-900 placeholder-gray-400"
                        />
                    </div>
                </div>

                {/* Products Display */}
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden mb-8">
                    {/* Desktop Table - Hidden on Mobile & Tablet */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-black tracking-widest">
                                <tr>
                                    <th className="px-6 py-4 w-24">Gambar</th>
                                    <th className="px-6 py-4">Nama Produk</th>
                                    <th className="px-6 py-4">Harga</th>
                                    <th className="px-6 py-4 text-center">Stok</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <div className="flex justify-center flex-col items-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B5E20] mb-2"></div>
                                                <span className="text-[#1B5E20] font-bold text-xs uppercase tracking-widest">Memuat...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredProducts.length > 0 ? (
                                    filteredProducts.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div
                                                    className="h-14 w-14 bg-white rounded-xl overflow-hidden border border-gray-100 relative cursor-pointer shadow-sm transition-all"
                                                    onClick={() => setSelectedImage(getImageUrl(product.image))}
                                                >
                                                    {product.image ? (
                                                        <Image
                                                            src={getImageUrl(product.image)}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover"
                                                            unoptimized
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-gray-200">
                                                            <Package className="h-6 w-6" />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-black text-gray-900 text-sm tracking-tight uppercase line-clamp-1">{product.name}</p>
                                                <p className="text-[10px] font-bold text-gray-400 mt-0.5 line-clamp-1 truncate uppercase tracking-widest">{product.description || 'No description'}</p>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-black text-[#1B5E20]">
                                                {formatPrice(product.price)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col items-center space-y-2">
                                                    <span className={clsx(
                                                        "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all",
                                                        product.trackStock && product.stock > 10 ? 'bg-green-50 text-green-700 border-green-100' :
                                                            product.trackStock && product.stock > 0 ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                                                product.trackStock && product.stock === 0 ? 'bg-red-50 text-red-700 border-red-100' :
                                                                    'bg-gray-50 text-gray-400 border-gray-100'
                                                    )}>
                                                        {product.trackStock ? (
                                                            <span className="font-bold">{product.stock} {product.unit?.name}</span>
                                                        ) : (
                                                            <span className="text-[8px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">OFF</span>
                                                        )}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end space-x-1">
                                                    <button
                                                        onClick={() => setStockManageDialog({ isOpen: true, product })}
                                                        className="flex items-center space-x-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-gray-50 text-gray-500 hover:bg-gray-100 rounded-xl transition-all border border-gray-200 group"
                                                        title="Kelola Stok"
                                                        disabled={isUpdating === product.id}
                                                    >
                                                        <Settings className={clsx("h-3 w-3 sm:h-3.5 sm:w-3.5", isUpdating === product.id && "animate-spin")} />
                                                        <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider hidden sm:inline-block">Stok</span>
                                                    </button>
                                                    <button
                                                        onClick={() => openShareDialog(product)}
                                                        className="flex items-center space-x-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all border border-blue-100 group"
                                                        title="Bagikan Produk"
                                                    >
                                                        <Share2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                                        <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider hidden sm:inline-block">Share</span>
                                                    </button>
                                                    <Link href={`/dashboard/merchant/products/edit/${product.id}`} className="flex items-center space-x-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-green-50 text-[#1B5E20] hover:bg-green-100 rounded-xl transition-all border border-green-100 group">
                                                        <Edit className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                                        <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider hidden sm:inline-block">Edit</span>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="flex items-center space-x-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all border border-red-100 group"
                                                    >
                                                        <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                                        <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider hidden sm:inline-block">Hapus</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest">
                                            Tidak ada produk
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile & Tablet Card List */}
                    <div className="md:hidden">
                        {isLoading ? (
                            <div className="p-12 text-center text-[10px] font-black text-[#1B5E20] uppercase tracking-widest">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B5E20] mx-auto mb-4"></div>
                                Memuat Produk...
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 p-1 sm:p-4 gap-3 bg-gray-50/30">
                                {filteredProducts.map((product) => (
                                    <div key={product.id} className="bg-white rounded-[1.75rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all active:scale-[0.98]">
                                        {/* Product Info Section */}
                                        <div className="p-3 flex items-start space-x-3">
                                            <div
                                                className="h-20 w-20 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 relative shadow-inner"
                                                onClick={() => setSelectedImage(getImageUrl(product.image))}
                                            >
                                                {product.image ? (
                                                    <Image
                                                        src={getImageUrl(product.image)}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center bg-gray-50 text-gray-200">
                                                        <Package className="h-8 w-8" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0 pt-0.5">
                                                <div className="flex justify-between items-start mb-0.5">
                                                    <p className="text-[10px] font-black text-gray-900 uppercase tracking-tight truncate pr-2">{product.name}</p>
                                                    <div className={clsx(
                                                        "h-1.5 w-1.5 rounded-full mt-1",
                                                        product.trackStock && product.stock > 0 ? "bg-green-500" : "bg-red-400"
                                                    )} />
                                                </div>
                                                <p className="text-[#1B5E20] text-xs font-black mb-1.5">{formatPrice(product.price)}</p>

                                                <div className="space-y-1">
                                                    <div className="flex items-center space-x-1.5">
                                                        <span className={clsx(
                                                            "px-1.5 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border",
                                                            product.trackStock && product.stock > 10 ? 'bg-green-50 text-green-700 border-green-100' :
                                                                product.trackStock && product.stock > 0 ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                                                    product.trackStock && product.stock === 0 ? 'bg-red-50 text-red-700 border-red-100' :
                                                                        'bg-gray-50 text-gray-400 border-gray-100'
                                                        )}>
                                                            {product.trackStock ? `${product.stock} ${product.unit?.name || ''}` : 'OFF'}
                                                        </span>
                                                        <span className="text-[8px] text-gray-400 font-bold uppercase tracking-tight">Stok</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Bar Section - Compact Native Style */}
                                        <div className="mt-auto px-3 pb-3 pt-1.5 flex items-center justify-between gap-1.5">
                                            <div className="flex items-center space-x-1.5">
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-100 hover:bg-red-100 transition-all active:scale-90"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setStockManageDialog({ isOpen: true, product })}
                                                    className="p-2 bg-gray-50 text-gray-500 rounded-xl border border-gray-100 hover:bg-gray-100 transition-all active:scale-90"
                                                    title="Kelola Stok"
                                                    disabled={isUpdating === product.id}
                                                >
                                                    <Settings className={clsx("h-3.5 w-3.5", isUpdating === product.id && "animate-spin")} />
                                                </button>
                                                <button
                                                    onClick={() => openShareDialog(product)}
                                                    className="p-2 bg-blue-50/50 text-blue-600 rounded-xl border border-blue-100 hover:bg-blue-100 transition-all active:scale-90"
                                                    title="Bagikan"
                                                >
                                                    <Share2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <Link
                                                    href={`/dashboard/merchant/products/edit/${product.id}`}
                                                    className="px-6 py-2 bg-green-50 text-[#1B5E20] rounded-xl font-black text-[8px] uppercase tracking-widest text-center border border-green-100 active:scale-95 transition-all"
                                                >
                                                    Edit
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-20 text-center">
                                <Package className="h-12 w-12 text-gray-100 mx-auto mb-4" />
                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest items-center inline-flex gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-gray-200" />
                                    Belum ada produk
                                    <span className="h-1.5 w-1.5 rounded-full bg-gray-200" />
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* pagination info */}
                <div className="mt-4 px-2 flex items-center justify-between text-[8px] sm:text-xs text-gray-400 font-black uppercase tracking-widest">
                    <p>{filteredProducts.length} Produk</p>
                </div>

                {/* Image Zoom Dialog */}
                {
                    selectedImage && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setSelectedImage(null)}>
                            <div className="relative max-w-3xl max-h-[90vh] w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-2" onClick={e => e.stopPropagation()}>
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                                <div className="relative w-full h-[60vh] sm:h-[80vh]">
                                    <Image
                                        src={selectedImage}
                                        alt="Zoomed Product"
                                        fill
                                        className="object-contain"
                                        unoptimized
                                    />
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Share Dialog */}
                <ShareDialog
                    isOpen={shareData.isOpen}
                    onClose={() => setShareData({ ...shareData, isOpen: false })}
                    url={shareData.url}
                    title={shareData.title}
                />

                {/* Stock Manage Dialog */}
                {
                    stockManageDialog.isOpen && stockManageDialog.product && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-[family-name:var(--font-poppins)]">
                            <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
                                {/* Close Button */}
                                <button
                                    onClick={() => setStockManageDialog({ isOpen: false, product: null })}
                                    className="absolute top-6 right-6 p-2 bg-gray-50 text-gray-400 hover:text-gray-600 rounded-full transition-colors z-10"
                                >
                                    <X className="h-4 w-4" />
                                </button>

                                <div className="p-8">
                                    <div className="flex items-center space-x-4 mb-8">
                                        <div className="p-4 bg-[#1B5E20]/5 rounded-[1.5rem] shrink-0">
                                            <Settings className="h-6 w-6 text-[#1B5E20]" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Pengaturan Stok</h3>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest line-clamp-1">{stockManageDialog.product.name}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-8">
                                        {/* Option: Enable Tracking */}
                                        <div
                                            className={clsx(
                                                "relative p-4 rounded-3xl transition-all border-2 cursor-pointer group",
                                                stockManageDialog.product.trackStock
                                                    ? "bg-green-50/50 border-[#1B5E20] shadow-sm shadow-green-900/5"
                                                    : "bg-white border-gray-100 hover:border-gray-200"
                                            )}
                                            onClick={() => {
                                                if (!stockManageDialog.product?.trackStock) {
                                                    handleToggleTrackStock(stockManageDialog.product!.id, false);
                                                    setStockManageDialog(prev => ({
                                                        ...prev,
                                                        product: { ...prev.product!, trackStock: true }
                                                    }));
                                                }
                                            }}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div className={clsx(
                                                    "p-2 rounded-xl shrink-0 transition-colors",
                                                    stockManageDialog.product.trackStock ? "bg-[#1B5E20] text-white" : "bg-gray-100 text-gray-400"
                                                )}>
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={clsx(
                                                        "text-[10px] font-black uppercase tracking-widest items-center flex gap-1.5",
                                                        stockManageDialog.product.trackStock ? "text-[#1B5E20]" : "text-gray-400"
                                                    )}>
                                                        Otomatis (Sistem)
                                                    </p>
                                                    <p className="text-[9px] font-medium leading-relaxed text-gray-500 mt-1">
                                                        Stok berkurang tiap ada order. Jika <span className="font-bold">0</span>, produk otomatis <span className="font-bold">Habis</span>.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Option: Disable Tracking */}
                                        <div
                                            className={clsx(
                                                "relative p-4 rounded-3xl transition-all border-2 cursor-pointer group",
                                                !stockManageDialog.product.trackStock
                                                    ? "bg-orange-50/50 border-orange-400 shadow-sm shadow-orange-900/5"
                                                    : "bg-white border-gray-100 hover:border-gray-200"
                                            )}
                                            onClick={() => {
                                                if (stockManageDialog.product?.trackStock) {
                                                    handleToggleTrackStock(stockManageDialog.product!.id, true);
                                                    setStockManageDialog(prev => ({
                                                        ...prev,
                                                        product: { ...prev.product!, trackStock: false }
                                                    }));
                                                }
                                            }}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div className={clsx(
                                                    "p-2 rounded-xl shrink-0 transition-colors",
                                                    !stockManageDialog.product.trackStock ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400"
                                                )}>
                                                    <AlertCircle className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={clsx(
                                                        "text-[10px] font-black uppercase tracking-widest items-center flex gap-1.5",
                                                        !stockManageDialog.product.trackStock ? "text-orange-600" : "text-gray-400"
                                                    )}>
                                                        Manual (Sistem OFF)
                                                    </p>
                                                    <p className="text-[9px] font-medium leading-relaxed text-gray-500 mt-1">
                                                        Stok <span className="font-bold">tidak berkurang</span> otomatis. Terima order tanpa batasan sistem.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setStockManageDialog({ isOpen: false, product: null })}
                                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-lg active:scale-95 border-b-4 border-gray-700 active:border-b-0 active:translate-y-1"
                                    >
                                        Simpan & Selesai
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div >

            {/* Bottom Nav */}
            < MerchantBottomNav />
        </div >
    );
}
