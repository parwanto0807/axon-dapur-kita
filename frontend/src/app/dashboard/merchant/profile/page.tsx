'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from "@/store/authStore";
import { useRouter } from 'next/navigation';
import { Store, User, MapPin, CheckCircle, Loader2, ArrowLeft, Save, Globe, Info, Camera, Power, AlertTriangle, Navigation, Locate, Search, ExternalLink, Banknote, CreditCard } from "lucide-react";
import axios from 'axios';
import { toast } from 'sonner';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import MerchantBottomNav from '@/components/merchant/MerchantBottomNav';

const LocationPickerMap = dynamic(() => import('@/components/merchant/LocationPickerMap'), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400">Memuat Peta...</div>
});

export default function MerchantProfilePage() {
    const { user, isLoggedIn, isLoading: isAuthLoading } = useAuthStore();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        address: '',
        isOpen: true,
        logo: '',
        latitude: '',
        longitude: '',
        maxDeliveryDistance: 5,
        paymentMethods: [] as string[]
    });

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [locating, setLocating] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [debouncedAddress, setDebouncedAddress] = useState(formData.address);

    useEffect(() => {
        if (isAuthLoading) return;

        if (!isLoggedIn) {
            router.push('/login?redirect=/dashboard/merchant/profile');
            return;
        }

        if (user?.role !== 'SELLER') {
            router.push('/dashboard');
            return;
        }

        fetchShopData();
    }, [isLoggedIn, user, router, isAuthLoading]);

    const fetchShopData = async () => {
        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const response = await axios.get(`${apiBaseUrl}/shops/me`, { withCredentials: true });

            if (response.data) {
                setFormData({
                    name: response.data.name || '',
                    slug: response.data.slug || '',
                    description: response.data.description || '',
                    address: response.data.address || '',
                    isOpen: response.data.isOpen,
                    logo: response.data.logo || '',
                    latitude: response.data.latitude || '',
                    longitude: response.data.longitude || '',
                    maxDeliveryDistance: response.data.maxDeliveryDistance || 5,
                    paymentMethods: response.data.paymentMethods || []
                });
                if (response.data.logo) {
                    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
                    setPreviewUrl(`${backendUrl}${response.data.logo}`);
                }
            }
        } catch (err: any) {
            console.error('Error fetching shop:', err);
            setError('Gagal mengambil data toko.');
        } finally {
            setIsLoading(false);
        }
    };

    // Debounce address input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedAddress(formData.address);
        }, 1500); // 1.5s delay

        return () => clearTimeout(timer);
    }, [formData.address]);

    // Auto-geocode when debounced address changes
    useEffect(() => {
        if (debouncedAddress && debouncedAddress.length > 10) {
            handleGeocode(debouncedAddress);
        }
    }, [debouncedAddress]);

    const handleGeocode = async (address: string) => {
        if (!address) return;
        setIsGeocoding(true);
        try {
            // Nominatim requires a User-Agent. Browsers send one automatically.
            // We adding distinct params to avoid caching issues.
            // Use fetch instead of axios to avoid global interceptors (e.g. Auth headers) interfering with external APIs
            const params = new URLSearchParams({
                q: address,
                format: 'json',
                limit: '1',
                addressdetails: '1'
            });

            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const response = await axios.get(`${apiBaseUrl}/shops/geocode?${params.toString()}`, { withCredentials: true });
            const data = response.data;

            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                setFormData(prev => ({
                    ...prev,
                    latitude: lat,
                    longitude: lon
                }));
            }
        } catch (error) {
            console.error("Geocoding failed:", error);
            // Non-blocking error, just log it. 
            // Could show a toast: "Gagal mencari lokasi otomatis. Silakan set manual."
        } finally {
            setIsGeocoding(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'name' && !formData.slug) {
            const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            setFormData(prev => ({ ...prev, slug: slug }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Ukuran file maksimal 5MB');
                return;
            }
            setLogoFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
            setError('');
        }
    };

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError('Browser Anda tidak mendukung Geolakasi.');
            return;
        }

        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData(prev => ({
                    ...prev,
                    latitude: position.coords.latitude.toString(),
                    longitude: position.coords.longitude.toString()
                }));
                setLocating(false);
                setSuccess('Lokasi berhasil ditemukan!');
                setTimeout(() => setSuccess(''), 3000);
            },
            (err) => {
                console.error(err);
                setError('Gagal mendapatkan lokasi. Pastikan GPS aktif dan izin diberikan.');
                setLocating(false);
            }
        );
    };

    const handlePaymentMethodChange = (methodId: string) => {
        setFormData(prev => {
            const currentMethods = prev.paymentMethods || [];
            if (currentMethods.includes(methodId)) {
                return { ...prev, paymentMethods: currentMethods.filter(id => id !== methodId) };
            } else {
                return { ...prev, paymentMethods: [...currentMethods, methodId] };
            }
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError('');
        setSuccess('');

        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

            const data = new FormData();
            data.append('name', formData.name);
            data.append('slug', formData.slug);
            data.append('description', formData.description);
            data.append('address', formData.address);
            data.append('isOpen', String(formData.isOpen));
            data.append('latitude', formData.latitude);
            data.append('longitude', formData.longitude);
            data.append('maxDeliveryDistance', String(formData.maxDeliveryDistance));
            data.append('paymentMethods', JSON.stringify(formData.paymentMethods));

            if (logoFile) {
                data.append('logo', logoFile);
            }

            const response = await axios.put(`${apiBaseUrl}/shops`, data, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Profil toko berhasil diperbarui!');

            if (response.data.logo) {
                const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
                setPreviewUrl(`${backendUrl}${response.data.logo}`);
                setLogoFile(null);
            }

            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            console.error('Error updating shop:', err);
            const errorMessage = err.response?.data?.message || 'Gagal memperbarui profil toko.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 text-[#1B5E20] animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-poppins)]">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-50">
                <div className="w-full max-w-full px-4 h-14 sm:h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                        <button
                            onClick={() => router.back()}
                            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                        </button>
                        <h1 className="font-black text-gray-900 text-xs sm:text-lg uppercase tracking-tight">Profil Toko</h1>
                    </div>

                    {formData.slug && (
                        <a
                            href={`/${formData.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1.5 sm:space-x-2 text-[#1B5E20] hover:bg-green-50 px-2.5 py-1.5 rounded-xl transition-colors text-[9px] sm:text-sm font-black uppercase tracking-widest border border-green-100/50 sm:border-transparent"
                        >
                            <span>Lihat</span>
                            <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                        </a>
                    )}
                </div>
            </div>

            <main className="w-full max-w-full px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Sidebar - Preview/Tips */}
                    <div className="lg:col-span-3 space-y-4 sm:space-y-6">
                        {/* Logo Upload Card */}
                        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm text-center">
                            <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 mb-4 group">
                                <div className="w-full h-full rounded-3xl overflow-hidden border-2 border-gray-100 bg-gray-50">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Logo Toko" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <Store className="h-8 w-8 sm:h-10 sm:w-10" />
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 p-2 bg-[#1B5E20] text-white rounded-full shadow-lg hover:bg-[#1B5E20]/90 transition-all hover:scale-105"
                                >
                                    <Camera className="h-4 w-4" />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                            <h2 className="font-black text-gray-900 text-sm sm:text-base tracking-tight truncate">{formData.name || 'Nama Toko'}</h2>
                            <p className="text-[9px] sm:text-xs text-[#1B5E20] font-black uppercase tracking-widest mt-1">axonumkm.id/{formData.slug || 'url-toko'}</p>

                            <div className={`mt-4 inline-flex items-center px-3 py-1 rounded-xl text-[8px] sm:text-xs font-black uppercase tracking-widest ${formData.isOpen ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                {formData.isOpen ? '● Toko Buka' : '● Toko Tutup'}
                            </div>
                        </div>

                        <div className="bg-green-50/50 rounded-3xl p-5 sm:p-6 border border-green-100">
                            <div className="flex items-start space-x-3">
                                <Info className="h-4 w-4 sm:h-5 sm:w-5 text-[#1B5E20] mt-0.5 shrink-0" />
                                <div>
                                    <h3 className="text-[9px] sm:text-sm font-black text-[#1B5E20] uppercase tracking-wider">Tips Manajemen</h3>
                                    <p className="text-[8px] sm:text-xs text-gray-500 mt-1 leading-relaxed font-medium">
                                        Atur area layanan Anda untuk memastikan makanan tetap fresh saat sampai di pelanggan.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Form */}
                    <div className="lg:col-span-9">
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-20 lg:mb-0">
                            <div className="p-5 sm:p-8">

                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
                                        {error}
                                    </div>
                                )}

                                {success && (
                                    <div className="mb-6 p-4 bg-green-50 border border-green-100 text-[#1B5E20] rounded-xl text-sm flex items-center">
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        {success}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Left Column: Status & Info */}
                                    <div className="space-y-6">
                                        {/* Status Toggle */}
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="flex items-center space-x-3">
                                                <div className={`p-2 rounded-lg ${formData.isOpen ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                                                    <Power className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] sm:text-sm font-black text-gray-900 uppercase tracking-tight">Status Toko</p>
                                                    <p className="text-[7px] sm:text-xs text-gray-500 font-medium">{formData.isOpen ? 'Toko sedang BUKA' : 'Toko sedang TUTUP'}</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isOpen}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, isOpen: e.target.checked }))}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#1B5E20]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1B5E20]"></div>
                                            </label>
                                        </div>

                                        <div className="space-y-4 text-gray-900">
                                            <div>
                                                <label className="block text-[8px] sm:text-sm font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center">
                                                    <Store className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                                    Nama Toko
                                                </label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="w-full rounded-2xl border border-gray-100 bg-white py-2.5 sm:py-3 px-4 focus:border-[#1B5E20] focus:ring-[#1B5E20]/10 transition-all outline-none text-[10px] sm:text-sm font-bold"
                                                    placeholder="Masukkan nama tokomu"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[8px] sm:text-sm font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center">
                                                    <Globe className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                                    Link Toko
                                                </label>

                                                <div className="flex rounded-2xl border border-gray-100 overflow-hidden bg-gray-50">
                                                    <span className="px-3 sm:px-4 py-2.5 sm:py-3 text-[9px] sm:text-sm text-gray-400 font-bold border-r border-gray-100">
                                                        axon.id/
                                                    </span>
                                                    <input
                                                        type="text"
                                                        name="slug"
                                                        value={formData.slug}
                                                        disabled
                                                        className="flex-1 bg-gray-50 py-2.5 sm:py-3 px-4 text-[10px] sm:text-sm font-bold outline-none text-gray-500 cursor-not-allowed"
                                                        placeholder="slug-toko"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[8px] sm:text-sm font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center">
                                                    <Info className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                                    Deskripsi
                                                </label>
                                                <textarea
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleChange}
                                                    rows={3}
                                                    className="w-full rounded-2xl border border-gray-100 bg-white py-2.5 sm:py-3 px-4 focus:border-[#1B5E20] focus:ring-[#1B5E20]/10 transition-all outline-none resize-none text-[10px] sm:text-sm font-semibold"
                                                    placeholder="Ceritakan tentang tokomu..."
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                                        Alamat Lengkap
                                                    </div>
                                                    {isGeocoding && <span className="text-xs text-[#1B5E20] animate-pulse">Mencari lokasi...</span>}
                                                </label>
                                                <div className="relative">
                                                    <textarea
                                                        name="address"
                                                        value={formData.address}
                                                        onChange={handleChange}
                                                        rows={3}
                                                        className="w-full rounded-xl border border-gray-200 bg-white py-3 px-4 focus:border-[#1B5E20] focus:ring-[#1B5E20]/10 transition-all outline-none resize-none pr-10"
                                                        placeholder="Alamat lengkap toko untuk pengiriman"
                                                    />
                                                    <button
                                                        onClick={() => handleGeocode(formData.address)}
                                                        className="absolute right-3 top-3 text-gray-400 hover:text-[#1B5E20] transition-colors"
                                                        title="Cari di Peta"
                                                        disabled={isGeocoding || !formData.address}
                                                    >
                                                        {isGeocoding ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                                                    </button>
                                                </div>
                                                <p className="text-[10px] text-gray-500 mt-1">
                                                    *Ketik alamat, peta akan update otomatis (atau klik ikon kaca pembesar).
                                                </p>
                                            </div>

                                            <div className="pt-4 border-t border-gray-100">
                                                <label className="block text-[8px] sm:text-sm font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center">
                                                    <Banknote className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                                    Metode Pembayaran
                                                </label>

                                                <div className="space-y-3">
                                                    <label className={`flex items-start p-3 rounded-xl border cursor-pointer transition-all ${formData.paymentMethods?.includes('cod') ? 'bg-green-50 border-[#1B5E20] ring-1 ring-[#1B5E20]' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                                                        <input
                                                            type="checkbox"
                                                            className="mt-1 h-4 w-4 text-[#1B5E20] border-gray-300 rounded focus:ring-[#1B5E20]"
                                                            checked={formData.paymentMethods?.includes('cod')}
                                                            onChange={() => handlePaymentMethodChange('cod')}
                                                        />
                                                        <div className="ml-3">
                                                            <div className="flex items-center">
                                                                <span className="font-bold text-gray-900 text-sm">Cash On Delivery (COD)</span>
                                                                <span className="ml-2 px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded">Tunai</span>
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-0.5">Pembeli membayar tunai saat pesanan sampai di lokasi.</p>
                                                        </div>
                                                    </label>

                                                    <label className={`flex items-start p-3 rounded-xl border cursor-pointer transition-all ${formData.paymentMethods?.includes('transfer') ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-600' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                                                        <input
                                                            type="checkbox"
                                                            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                            checked={formData.paymentMethods?.includes('transfer')}
                                                            onChange={() => handlePaymentMethodChange('transfer')}
                                                        />
                                                        <div className="ml-3">
                                                            <div className="flex items-center">
                                                                <span className="font-bold text-gray-900 text-sm">Bank Transfer</span>
                                                                <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">Manual</span>
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-0.5">Pembeli transfer ke rekening bank toko (konfirmasi manual).</p>
                                                        </div>
                                                    </label>

                                                    <label className={`flex items-start p-3 rounded-xl border cursor-pointer transition-all ${formData.paymentMethods?.includes('qris') ? 'bg-red-50 border-red-600 ring-1 ring-red-600' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                                                        <input
                                                            type="checkbox"
                                                            className="mt-1 h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                                            checked={formData.paymentMethods?.includes('qris')}
                                                            onChange={() => handlePaymentMethodChange('qris')}
                                                        />
                                                        <div className="ml-3">
                                                            <div className="flex items-center">
                                                                <span className="font-bold text-gray-900 text-sm">QRIS / E-Wallet</span>
                                                                <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded">Otomatis</span>
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-0.5">Pembayaran instan via Gopay, OVO, Dana, dll.</p>
                                                        </div>
                                                    </label>

                                                    <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-100 flex items-start">
                                                        <Info className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 shrink-0" />
                                                        <p className="text-xs text-yellow-700">
                                                            Pastikan Anda memiliki rekening/akun yang valid untuk metode non-tunai.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Location Map */}
                                    <div className="space-y-4">
                                        {/* Location Settings */}
                                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-4 h-full">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <Navigation className="h-5 w-5 text-blue-600" />
                                                    <h3 className="text-sm font-bold text-blue-900">Pengaturan Jarak & Lokasi</h3>
                                                </div>
                                            </div>

                                            {/* Map Visualization */}
                                            <div className="rounded-xl overflow-hidden border border-blue-200 shadow-sm relative z-0 h-[300px] lg:h-[400px]">
                                                <LocationPickerMap
                                                    latitude={formData.latitude ? parseFloat(formData.latitude) : -6.2088}
                                                    longitude={formData.longitude ? parseFloat(formData.longitude) : 106.8456}
                                                    maxDeliveryDistance={formData.maxDeliveryDistance}
                                                    onLocationChange={(lat, lng) => {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            latitude: lat.toString(),
                                                            longitude: lng.toString()
                                                        }));
                                                    }}
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-blue-800 mb-1.5">Titik Lokasi Toko</label>
                                                    <div className="flex space-x-2">
                                                        <input
                                                            type="text"
                                                            value={formData.latitude && formData.longitude ? `${parseFloat(formData.latitude).toFixed(4)}, ${parseFloat(formData.longitude).toFixed(4)}` : ''}
                                                            readOnly
                                                            placeholder="Belum ada lokasi"
                                                            className="w-full rounded-xl border border-blue-200 bg-white py-2 px-3 text-sm text-gray-600 focus:outline-none"
                                                        />
                                                        <button
                                                            onClick={handleGetCurrentLocation}
                                                            disabled={locating}
                                                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition-colors disabled:opacity-50"
                                                            title="Gunakan Lokasi Saat Ini"
                                                        >
                                                            {locating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Locate className="h-5 w-5" />}
                                                        </button>
                                                    </div>
                                                    <p className="text-[10px] text-blue-600 mt-1">*Geser marker di peta atau klik tombol bidik untuk set lokasi.</p>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-blue-800 mb-1.5">
                                                        Radius Pengantaran: <span className="text-blue-600 text-sm">{formData.maxDeliveryDistance} km</span>
                                                    </label>
                                                    <input
                                                        type="range"
                                                        min="1"
                                                        max="10"
                                                        step="0.5"
                                                        value={formData.maxDeliveryDistance}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, maxDeliveryDistance: parseFloat(e.target.value) }))}
                                                        className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                                    />
                                                    <div className="flex justify-between text-[10px] text-blue-500 mt-1">
                                                        <span>1 km</span>
                                                        <span>10 km</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex items-center space-x-2 bg-[#1B5E20] text-white py-3 px-8 rounded-xl font-bold hover:bg-[#1B5E20]/90 transition-all disabled:opacity-50 shadow-lg shadow-[#1B5E20]/20 active:scale-95"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span>Menyimpan...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 sm:h-5 sm:w-5" />
                                            <span>Simpan</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Nav */}
            <MerchantBottomNav />
        </div>
    );
}
