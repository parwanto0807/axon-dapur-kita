'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from "@/store/authStore";
import { useRouter } from 'next/navigation';
import { Store, MapPin, CheckCircle, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import axios from 'axios';

export default function SellerRegistrationPage() {
    const { user, isLoggedIn, isLoading: isAuthLoading } = useAuthStore();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Protect Route: Redirect to Login/Register if not authenticated
    useEffect(() => {
        if (isAuthLoading) return;

        if (!isLoggedIn) {
            router.push('/login?redirect=/seller-registration');
        }
    }, [isLoggedIn, router, isAuthLoading]);

    if (isAuthLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 text-[#1B5E20] animate-spin" />
            </div>
        );
    }

    if (!isLoggedIn) {
        return null; // Don't render form while redirecting
    }

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        address: '',
        city: '',
        province: '',
        postalCode: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Auto-generate slug from name
        if (name === 'name') {
            const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            setFormData(prev => ({
                ...prev,
                slug: slug
            }));
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError('');

        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const fullAddress = `${formData.address}, ${formData.city}, ${formData.province}, ${formData.postalCode}`;

            const response = await axios.post(`${apiBaseUrl}/shops`, {
                name: formData.name,
                slug: formData.slug,
                description: formData.description,
                address: fullAddress,
            }, {
                withCredentials: true
            });

            if (response.status === 201) {
                // Update local user state to reflect SELLER role
                if (user) {
                    const updatedUser = { ...user, role: 'SELLER' as const, shopId: response.data.id };
                    // We might need a way to update the user in the store without full login, 
                    // or just redirect and let the session refresh handle it.
                    // For now, let's assume redirecting to dashboard will refresh data if we refetch.
                }

                router.push('/dashboard?registration=success');
            }
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.response?.data?.message || 'Gagal mendaftar toko. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    return (
        <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-poppins)]">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-50">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="bg-[#1B5E20] p-1.5 rounded-lg">
                            <Store className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-gray-900 text-lg">Registrasi Toko</span>
                    </div>
                    <div className="text-sm text-gray-500 font-medium">
                        Langkah {step} dari 2
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="h-1 bg-gray-100">
                    <div
                        className="h-full bg-[#1B5E20] transition-all duration-500"
                        style={{ width: `${(step / 2) * 100}%` }}
                    />
                </div>
            </div>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10">

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center">
                            <p>{error}</p>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-900">Mulai Perjalanan Bisnismu 🚀</h2>
                                <p className="text-gray-500 mt-2">Isi identitas tokomu agar mudah dikenali pelanggan.</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Nama Toko</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Contoh: Dapur Bunda Ani"
                                        className="w-full rounded-xl border-gray-300 bg-white border text-gray-900 focus:border-[#1B5E20] focus:ring-[#1B5E20] py-3 px-4"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Link Toko (Slug)</label>
                                    <div className="flex rounded-xl shadow-sm">
                                        <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                            axonumkm.id/
                                        </span>
                                        <input
                                            type="text"
                                            name="slug"
                                            value={formData.slug}
                                            onChange={handleChange}
                                            className="flex-1 min-w-0 block w-full px-4 py-3 rounded-none rounded-r-xl border border-gray-300 bg-white text-gray-900 focus:ring-[#1B5E20] focus:border-[#1B5E20]"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">Link ini akan jadi identitas unik tokomu.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi Singkat</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder="Jual aneka masakan rumahan, katering, dan kue basah..."
                                        className="w-full rounded-xl border-gray-300 bg-white border text-gray-900 focus:border-[#1B5E20] focus:ring-[#1B5E20] py-3 px-4"
                                    />
                                </div>
                            </div>

                            <div className="pt-6">
                                <button
                                    onClick={nextStep}
                                    disabled={!formData.name || !formData.slug}
                                    className="w-full flex items-center justify-center space-x-2 bg-[#1B5E20] text-white py-3.5 rounded-xl font-bold hover:bg-[#1B5E20]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span>Lanjut ke Alamat</span>
                                    <ArrowRight className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-900">Di mana lokasi dapurmu? 📍</h2>
                                <p className="text-gray-500 mt-2">Bantu pelanggan sekitar menemukan tokomu dengan mudah.</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Alamat Lengkap</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows={2}
                                        placeholder="Nama Jalan, No. Rumah, RT/RW..."
                                        className="w-full rounded-xl border-gray-300 bg-white border text-gray-900 focus:border-[#1B5E20] focus:ring-[#1B5E20] py-3 px-4"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Kota/Kabupaten</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border-gray-300 bg-white border text-gray-900 focus:border-[#1B5E20] focus:ring-[#1B5E20] py-3 px-4"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Provinsi</label>
                                        <input
                                            type="text"
                                            name="province"
                                            value={formData.province}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border-gray-300 bg-white border text-gray-900 focus:border-[#1B5E20] focus:ring-[#1B5E20] py-3 px-4"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Kode Pos</label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        value={formData.postalCode}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border-gray-300 bg-white border text-gray-900 focus:border-[#1B5E20] focus:ring-[#1B5E20] py-3 px-4"
                                    />
                                </div>
                            </div>

                            <div className="pt-6 flex items-center space-x-3">
                                <button
                                    onClick={prevStep}
                                    className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold hover:bg-gray-200 transition-all"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                    <span>Kembali</span>
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading || !formData.address}
                                    className="flex-[2] flex items-center justify-center space-x-2 bg-[#1B5E20] text-white py-3.5 rounded-xl font-bold hover:bg-[#1B5E20]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-900/20"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span>Mendaftarkan...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-5 w-5" />
                                            <span>Buka Toko Sekarang</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
