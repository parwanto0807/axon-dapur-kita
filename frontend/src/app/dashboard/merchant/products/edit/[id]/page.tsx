'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { useAuthStore } from "@/store/authStore";
import { ArrowLeft, Upload, Loader2, Save, X, Image as ImageIcon, ChevronDown, Search, Trash2 } from 'lucide-react';
import Image from 'next/image';
import MerchantBottomNav from '@/components/merchant/MerchantBottomNav';
import { clsx } from 'clsx';
import { toast } from 'react-hot-toast';

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const fileInputRef = useRef<HTMLInputElement>(null);
    const categoryDropdownRef = useRef<HTMLDivElement>(null);
    const unitDropdownRef = useRef<HTMLDivElement>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState('');

    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [units, setUnits] = useState<{ id: string; name: string }[]>([]);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [categorySearch, setCategorySearch] = useState('');
    const [isUnitOpen, setIsUnitOpen] = useState(false);
    const [unitSearch, setUnitSearch] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        weight: '',
        unitId: '',
        condition: 'NEW',
        categoryId: '',
        isActive: true,
        expiresAt: '',
        isPreOrder: false,
        trackStock: true
    });

    const [existingImages, setExistingImages] = useState<{ id: string; url: string; isPrimary: boolean }[]>([]);
    const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
    const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
    const [newPreviewUrls, setNewPreviewUrls] = useState<string[]>([]);

    useEffect(() => {
        if (id) {
            fetchProductData();
        }
        fetchCategories();
        fetchUnits();

        function handleClickOutside(event: MouseEvent) {
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
                setIsCategoryOpen(false);
            }
            if (unitDropdownRef.current && !unitDropdownRef.current.contains(event.target as Node)) {
                setIsUnitOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            newPreviewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [id]);

    const fetchProductData = async () => {
        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const response = await axios.get(`${apiBaseUrl}/products/${id}`);
            const product = response.data;

            setFormData({
                name: product.name,
                description: product.description || '',
                price: product.price.toString(),
                stock: product.stock.toString(),
                weight: product.weight ? product.weight.toString() : '',
                unitId: product.unitId || '',
                condition: product.condition || 'NEW',
                categoryId: product.categoryId || '',
                isActive: product.isActive,
                expiresAt: product.expiresAt ? new Date(product.expiresAt).toISOString().slice(0, 16) : '',
                isPreOrder: product.isPreOrder || false,
                trackStock: product.trackStock !== undefined ? product.trackStock : true
            });

            if (product.images) {
                setExistingImages(product.images.map((img: any) => ({
                    id: img.id,
                    url: img.url,
                    isPrimary: img.isPrimary
                })));
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            setError('Gagal memuat data produk');
            toast.error('Gagal memuat data produk');
        } finally {
            setIsFetching(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const response = await axios.get(`${apiBaseUrl}/categories`);
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchUnits = async () => {
        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const response = await axios.get(`${apiBaseUrl}/units`);
            setUnits(response.data);
        } catch (error) {
            console.error('Error fetching units:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCategorySelect = (categoryId: string) => {
        setFormData(prev => ({ ...prev, categoryId }));
        setIsCategoryOpen(false);
    };

    const handleUnitSelect = (unitId: string) => {
        setFormData(prev => ({ ...prev, unitId }));
        setIsUnitOpen(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            // Check limitations
            const totalImages = existingImages.length + newImageFiles.length + files.length;
            if (totalImages > 10) {
                setError('Maksimal 10 foto produk');
                toast.error('Maksimal 10 foto produk');
                return;
            }

            const newFiles: File[] = [];
            const newUrls: string[] = [];

            Array.from(files).forEach(file => {
                if (file.size > 5 * 1024 * 1024) {
                    setError('Ukuran file maksimal 5MB');
                    toast.error(`File ${file.name} terlalu besar (max 5MB)`);
                    return;
                }
                newFiles.push(file);
                newUrls.push(URL.createObjectURL(file));
            });

            setNewImageFiles(prev => [...prev, ...newFiles]);
            setNewPreviewUrls(prev => [...prev, ...newUrls]);
            setError('');
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeNewImage = (index: number) => {
        setNewImageFiles(prev => prev.filter((_, i) => i !== index));
        setNewPreviewUrls(prev => {
            const newUrls = [...prev];
            URL.revokeObjectURL(newUrls[index]);
            return newUrls.filter((_, i) => i !== index);
        });
    };

    const removeExistingImage = (index: number) => {
        const imageToDelete = existingImages[index];
        setDeletedImageIds(prev => [...prev, imageToDelete.id]);
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (!formData.name || !formData.price || !formData.stock) {
            setError('Nama, Harga, dan Stok wajib diisi');
            toast.error('Nama, Harga, dan Stok wajib diisi');
            setIsLoading(false);
            return;
        }

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('price', formData.price);
            data.append('stock', formData.stock);
            data.append('trackStock', String(formData.trackStock));

            if (formData.weight) data.append('weight', formData.weight);
            if (formData.unitId) data.append('unitId', formData.unitId);
            data.append('condition', formData.condition);
            if (formData.categoryId) data.append('category', formData.categoryId);
            data.append('isActive', String(formData.isActive));
            data.append('isPreOrder', String(formData.isPreOrder));
            if (formData.expiresAt) data.append('expiresAt', formData.expiresAt);

            // Append deleted image IDs
            deletedImageIds.forEach(id => {
                data.append('deletedImageIds', id);
            });

            // Append new images
            newImageFiles.forEach(file => {
                data.append('images', file);
            });

            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            await axios.put(`${apiBaseUrl}/products/${id}`, data, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success('Produk berhasil diperbarui');
            router.push('/dashboard/merchant/products');
        } catch (err: any) {
            console.error('Error updating product:', err);
            const msg = err.response?.data?.message || 'Gagal memperbarui produk';
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(categorySearch.toLowerCase())
    );

    const filteredUnits = units.filter(unit =>
        unit.name.toLowerCase().includes(unitSearch.toLowerCase())
    );

    if (isFetching) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 text-[#1B5E20] animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-poppins)] p-4 sm:p-8 pb-24 lg:pb-8">
            <div className="w-full max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center mb-6 sm:mb-8">
                    <button
                        onClick={() => router.back()}
                        className="mr-3 sm:mr-4 p-1.5 sm:p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200"
                    >
                        <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-xs sm:text-2xl font-black text-gray-900 uppercase tracking-tight">Edit Produk</h1>
                        <p className="text-[8px] sm:text-sm text-gray-400 font-medium mt-0.5">Perbarui informasi produk anda.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Image Upload */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-[2rem] p-5 sm:p-6 border border-gray-100 shadow-sm sticky top-8">
                            <label className="block text-[8px] sm:text-sm font-black text-[#1B5E20] uppercase tracking-widest mb-4">
                                Foto Produk ({existingImages.length + newImageFiles.length}/10)
                            </label>

                            <div className="grid grid-cols-2 gap-2 mb-4">
                                {/* Existing Images */}
                                {existingImages.map((img, index) => (
                                    <div key={`existing-${img.id}`} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 group">
                                        <Image
                                            src={img.url.startsWith('http') ? img.url : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${img.url}`}
                                            alt={`Existing ${index}`}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                        {img.isPrimary && (
                                            <span className="absolute bottom-2 left-2 bg-[#1B5E20] text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm font-medium">Utama</span>
                                        )}
                                    </div>
                                ))}

                                {/* New Images */}
                                {newPreviewUrls.map((url, index) => (
                                    <div key={`new-${index}`} className="relative aspect-square rounded-xl overflow-hidden border-2 border-green-100 group">
                                        <Image
                                            src={url}
                                            alt={`New ${index}`}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeNewImage(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                        <span className="absolute bottom-2 right-2 bg-green-500 text-white text-[8px] px-1.5 py-0.5 rounded-md font-bold uppercase">Baru</span>
                                    </div>
                                ))}

                                {/* Upload Button */}
                                {(existingImages.length + newImageFiles.length) < 10 && (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="relative aspect-square rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#1B5E20] hover:bg-green-50/20 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group"
                                    >
                                        <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-[#1B5E20]">
                                            <Upload className="h-5 w-5 sm:h-6 sm:w-6 mb-1" />
                                            <span className="text-[8px] sm:text-xs font-black uppercase tracking-widest text-center">Upload Foto</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>

                    {/* Right Column: Form Details */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-5 sm:p-8 space-y-5 sm:space-y-6">
                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[10px] sm:text-sm flex items-center font-bold">
                                        <X className="h-3.5 w-3.5 mr-2" />
                                        {error}
                                    </div>
                                )}

                                {/* Same fields as AddProductPage */}
                                <div>
                                    <label className="block text-[8px] sm:text-sm font-black text-[#1B5E20] mb-1.5 uppercase tracking-widest">Nama Produk</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border-none bg-gray-50/80 py-2.5 sm:py-3 px-4 text-gray-900 font-bold text-[10px] sm:text-sm placeholder-gray-400 focus:ring-2 focus:ring-[#1B5E20]/10 focus:bg-white transition-all outline-none"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                    <div className="relative" ref={categoryDropdownRef}>
                                        <label className="block text-[8px] sm:text-sm font-black text-[#1B5E20] mb-1.5 uppercase tracking-widest">Kategori</label>
                                        <div
                                            className={`w-full rounded-2xl bg-gray-50/80 py-2.5 sm:py-3 px-4 flex items-center justify-between cursor-pointer focus-within:ring-2 focus-within:ring-[#1B5E20]/10 transition-all ${isCategoryOpen ? 'ring-2 ring-[#1B5E20]/10 bg-white' : ''}`}
                                            onClick={() => {
                                                setIsCategoryOpen(!isCategoryOpen);
                                                setTimeout(() => {
                                                    const searchInput = document.getElementById('category-search-input');
                                                    if (searchInput) searchInput.focus();
                                                }, 0);
                                            }}
                                        >
                                            <span className={`font-bold text-[10px] sm:text-sm ${formData.categoryId ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {categories.find(c => c.id === formData.categoryId)?.name || 'Pilih Kategori'}
                                            </span>
                                            <ChevronDown className={clsx("h-4 w-4 text-gray-400 transition-transform", isCategoryOpen && "rotate-180")} />
                                        </div>

                                        {isCategoryOpen && (
                                            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-[300px] overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                                                <div className="p-2 border-b border-gray-50 bg-white sticky top-0 z-10">
                                                    <div className="relative">
                                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                        <input
                                                            id="category-search-input"
                                                            type="text"
                                                            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1B5E20]/20 transition-all text-gray-900"
                                                            placeholder="Cari kategori..."
                                                            value={categorySearch}
                                                            onChange={(e) => setCategorySearch(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="overflow-y-auto flex-1 p-2 space-y-1">
                                                    {filteredCategories.length > 0 ? (
                                                        filteredCategories.map(cat => (
                                                            <div
                                                                key={cat.id}
                                                                className={`px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-colors flex items-center justify-between ${formData.categoryId === cat.id ? 'bg-green-50 text-[#1B5E20] font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                                                                onClick={() => handleCategorySelect(cat.id)}
                                                            >
                                                                <span>{cat.name}</span>
                                                                {formData.categoryId === cat.id && <div className="h-2 w-2 rounded-full bg-[#1B5E20]"></div>}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-center py-8 text-gray-400">
                                                            <p className="text-xs">Upps, kategori tidak ditemukan.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-[8px] sm:text-sm font-black text-[#1B5E20] mb-1.5 uppercase tracking-widest">Kondisi</label>
                                        <select
                                            name="condition"
                                            value={formData.condition}
                                            onChange={handleChange}
                                            className="w-full rounded-2xl border-none bg-gray-50/80 py-2.5 sm:py-3 px-4 text-gray-900 font-bold text-[10px] sm:text-sm focus:ring-2 focus:ring-[#1B5E20]/10 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="NEW">Baru</option>
                                            <option value="USED">Bekas</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="p-4 bg-green-50/50 rounded-2xl border border-green-100/50 mb-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <div className="p-1.5 bg-[#1B5E20]/10 rounded-lg text-[#1B5E20]">
                                                <ImageIcon className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-[#1B5E20] uppercase tracking-wider">Kelola Stok Sistem</p>
                                                <p className="text-[8px] text-gray-500 font-medium">Aktifkan jika produk memiliki jumlah terbatas.</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer scale-90">
                                            <input
                                                type="checkbox"
                                                name="trackStock"
                                                checked={formData.trackStock}
                                                onChange={handleChange}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1B5E20]"></div>
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <label className="block text-[8px] sm:text-sm font-black text-[#1B5E20] mb-1.5 uppercase tracking-widest">Harga (Rp)</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            className="w-full rounded-2xl border-none bg-gray-50/80 py-2.5 sm:py-3 px-4 text-gray-900 font-bold text-[10px] sm:text-sm placeholder-gray-400 focus:ring-2 focus:ring-[#1B5E20]/10 focus:bg-white transition-all outline-none"
                                            required
                                            min="0"
                                        />
                                    </div>
                                    <div className={clsx(!formData.trackStock && "opacity-40 grayscale pointer-events-none")}>
                                        <label className="block text-[8px] sm:text-sm font-black text-[#1B5E20] mb-1.5 uppercase tracking-widest">
                                            Stok {!formData.trackStock && "(Non-Aktif)"}
                                        </label>
                                        <input
                                            type="number"
                                            name="stock"
                                            value={formData.stock}
                                            onChange={handleChange}
                                            className="w-full rounded-2xl border-none bg-gray-50/80 py-2.5 sm:py-3 px-4 text-gray-900 font-bold text-[10px] sm:text-sm placeholder-gray-400 focus:ring-2 focus:ring-[#1B5E20]/10 focus:bg-white transition-all outline-none"
                                            required={formData.trackStock}
                                            min="0"
                                            disabled={!formData.trackStock}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <label className="block text-[8px] sm:text-sm font-black text-[#1B5E20] mb-1.5 uppercase tracking-widest">Berat (Gram)</label>
                                        <input
                                            type="number"
                                            name="weight"
                                            value={formData.weight}
                                            onChange={handleChange}
                                            className="w-full rounded-2xl border-none bg-gray-50/80 py-2.5 sm:py-3 px-4 text-gray-900 font-bold text-[10px] sm:text-sm placeholder-gray-400 focus:ring-2 focus:ring-[#1B5E20]/10 focus:bg-white transition-all outline-none"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <div className="relative" ref={unitDropdownRef}>
                                            <label className="block text-[8px] sm:text-sm font-black text-[#1B5E20] mb-1.5 uppercase tracking-widest">Satuan</label>
                                            <div
                                                className={`w-full rounded-2xl bg-gray-50/80 py-2.5 sm:py-3 px-4 flex items-center justify-between cursor-pointer focus-within:ring-2 focus-within:ring-[#1B5E20]/10 transition-all ${isUnitOpen ? 'ring-2 ring-[#1B5E20]/10 bg-white' : ''}`}
                                                onClick={() => {
                                                    setIsUnitOpen(!isUnitOpen);
                                                    setTimeout(() => {
                                                        const searchInput = document.getElementById('unit-search-input');
                                                        if (searchInput) searchInput.focus();
                                                    }, 0);
                                                }}
                                            >
                                                <span className={`font-bold text-[10px] sm:text-sm ${formData.unitId ? 'text-gray-900' : 'text-gray-400'}`}>
                                                    {units.find(u => u.id === formData.unitId)?.name || 'Pilih Satuan'}
                                                </span>
                                                <ChevronDown className={clsx("h-4 w-4 text-gray-400 transition-transform", isUnitOpen && "rotate-180")} />
                                            </div>

                                            {isUnitOpen && (
                                                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-[250px] overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <div className="p-2 border-b border-gray-50 bg-white sticky top-0 z-10">
                                                        <div className="relative">
                                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                            <input
                                                                id="unit-search-input"
                                                                type="text"
                                                                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1B5E20]/20 transition-all text-gray-900"
                                                                placeholder="Cari satuan..."
                                                                value={unitSearch}
                                                                onChange={(e) => setUnitSearch(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="overflow-y-auto flex-1 p-2 space-y-1">
                                                        {filteredUnits.length > 0 ? (
                                                            filteredUnits.map(unit => (
                                                                <div
                                                                    key={unit.id}
                                                                    className={`px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-colors flex items-center justify-between ${formData.unitId === unit.id ? 'bg-green-50 text-[#1B5E20] font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                                                                    onClick={() => handleUnitSelect(unit.id)}
                                                                >
                                                                    <span>{unit.name}</span>
                                                                    {formData.unitId === unit.id && <div className="h-2 w-2 rounded-full bg-[#1B5E20]"></div>}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-center py-6 text-gray-400">
                                                                <p className="text-xs">Satuan tidak ditemukan.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[8px] sm:text-sm font-black text-[#1B5E20] mb-1.5 uppercase tracking-widest">Deskripsi</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full rounded-2xl border-none bg-gray-50/80 py-2.5 sm:py-3 px-4 text-gray-900 font-bold text-[10px] sm:text-sm placeholder-gray-400 focus:ring-2 focus:ring-[#1B5E20]/10 focus:bg-white transition-all outline-none resize-none"
                                        placeholder="Jelaskan detail produkmu..."
                                    />
                                </div>

                                <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                        className="h-4 w-4 rounded-lg border-gray-300 text-[#1B5E20] focus:ring-[#1B5E20]"
                                    />
                                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#1B5E20]">Tampilkan produk di toko (Aktif)</span>
                                </div>

                                <div className="border-t border-gray-100 pt-6">
                                    <h3 className="text-sm font-bold text-[#1B5E20] mb-4 uppercase tracking-wide">Pengaturan Lanjutan</h3>

                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex items-center space-x-2 mb-2">
                                                <input
                                                    type="checkbox"
                                                    id="hasExpiry"
                                                    checked={!!formData.expiresAt}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            const tomorrow = new Date();
                                                            tomorrow.setDate(tomorrow.getDate() + 1);
                                                            tomorrow.setHours(12, 0, 0, 0);
                                                            const localIso = tomorrow.toISOString().slice(0, 16);
                                                            setFormData(prev => ({ ...prev, expiresAt: localIso }));
                                                        } else {
                                                            setFormData(prev => ({ ...prev, expiresAt: '' }));
                                                        }
                                                    }}
                                                    className="h-4 w-4 rounded border-gray-300 text-[#1B5E20] focus:ring-[#1B5E20]"
                                                />
                                                <label htmlFor="hasExpiry" className="text-sm font-medium text-gray-700">
                                                    Atur Waktu Kadaluarsa / Batas Saji
                                                </label>
                                            </div>

                                            {formData.expiresAt && (
                                                <div className="pl-6 animate-in fade-in slide-in-from-top-2">
                                                    <input
                                                        type="datetime-local"
                                                        name="expiresAt"
                                                        value={formData.expiresAt}
                                                        onChange={handleChange}
                                                        className="w-full rounded-xl border-2 border-[#1B5E20]/20 bg-gray-50/50 py-3 px-4 text-gray-900 font-medium placeholder-gray-400 focus:border-[#1B5E20] focus:ring-4 focus:ring-[#1B5E20]/10 focus:bg-white transition-all outline-none"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id="isPreOrder"
                                                    name="isPreOrder"
                                                    checked={formData.isPreOrder}
                                                    onChange={handleChange}
                                                    className="h-4 w-4 rounded border-gray-300 text-[#1B5E20] focus:ring-[#1B5E20]"
                                                />
                                                <label htmlFor="isPreOrder" className="text-sm font-medium text-gray-700">
                                                    Produk Pre-Order (PO)
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 px-6 py-4 flex justify-end items-center border-t border-gray-100 mb-6">
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="mr-4 text-gray-400 hover:text-gray-600 font-bold text-[10px] sm:text-sm uppercase tracking-widest"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex items-center space-x-2 bg-[#1B5E20] text-white px-5 py-2.5 rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-sm hover:bg-[#1B5E20]/90 transition-all disabled:opacity-50 shadow-lg shadow-green-900/10 active:scale-95 transition-all"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Menyimpan...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            <span>Simpan Perubahan</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <MerchantBottomNav />
        </div>
    );
}
