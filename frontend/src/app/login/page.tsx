'use client';

import Link from 'next/link';
import { Store, ArrowLeft, MapPin, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function LoginPage() {
    const [mode, setMode] = useState<'login' | 'register'>('login');

    const handleGoogleAuth = () => {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';
        window.location.href = `${apiBaseUrl}/auth/google`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f0fdf4] via-white to-[#f0fdf4] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-[family-name:var(--font-poppins)]">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {/* Logo */}
                <div className="flex justify-center">
                    <div className="bg-[#1B5E20] p-3 rounded-2xl shadow-lg shadow-[#1B5E20]/20">
                        <Store className="h-10 w-10 text-white" />
                    </div>
                </div>
                <Link href="/" className="flex flex-col group cursor-pointer">
                    <h2 className="mt-4 text-center text-2xl font-extrabold text-gray-900 tracking-tight">
                        <span className="text-[#1B5E20] group-hover:opacity-80 transition-opacity">Axon</span>{' '}
                        <span className="text-gray-400">DapurKita</span>
                    </h2>
                </Link>
            </div>

            <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-2xl shadow-gray-200/60 sm:rounded-3xl sm:px-10 border border-gray-100">

                    {/* Tab Toggle */}
                    <div className="flex bg-gray-100 rounded-2xl p-1 mb-7">
                        <button
                            onClick={() => setMode('login')}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${mode === 'login'
                                ? 'bg-white text-[#1B5E20] shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Masuk
                        </button>
                        <button
                            onClick={() => setMode('register')}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${mode === 'register'
                                ? 'bg-white text-[#1B5E20] shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Daftar
                        </button>
                    </div>

                    {/* Login Mode */}
                    {mode === 'login' && (
                        <div className="space-y-5">
                            <div className="text-center">
                                <p className="text-sm text-gray-500">Masuk dengan akun Google Anda</p>
                            </div>
                            <button
                                onClick={handleGoogleAuth}
                                className="w-full flex justify-center items-center py-3.5 px-4 border border-gray-200 rounded-2xl shadow-sm bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 transition-all active:scale-[0.98]"
                            >
                                <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.67l-3.57-2.77c-1.01.68-2.3 1.09-3.71 1.09-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.12c-.22-.68-.35-1.39-.35-2.12s.13-1.44.35-2.12V7.04H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.96l3.66-2.84z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Masuk dengan Google
                            </button>

                            <p className="text-center text-xs text-gray-400 pt-1">
                                Belum punya akun?{' '}
                                <button
                                    onClick={() => setMode('register')}
                                    className="text-[#1B5E20] font-bold hover:underline underline-offset-2 transition-all"
                                >
                                    Daftar di sini
                                </button>
                            </p>
                        </div>
                    )}

                    {/* Register Mode */}
                    {mode === 'register' && (
                        <div className="space-y-5">
                            {/* Benefits */}
                            <div className="space-y-2.5">
                                {[
                                    {
                                        icon: Store,
                                        title: 'UMKM Lokal Jadi Toko Digital',
                                        text: 'Bantu dapur & warung sekitar tampil modern dan menjual produk secara online.',
                                        color: 'text-[#1B5E20] bg-green-50'
                                    },
                                    {
                                        icon: MapPin,
                                        title: 'Temukan Penjual di Radius Anda',
                                        text: 'Scan penjual terdekat berdasarkan lokasi — sayur, masakan, jamu, langsung dari tetangga.',
                                        color: 'text-blue-600 bg-blue-50'
                                    },
                                    {
                                        icon: Sparkles,
                                        title: 'Segar & Hangat, Terjamin',
                                        text: 'Jarak dekat artinya produk tiba lebih cepat — masih hangat dan segar dari sumbernya.',
                                        color: 'text-orange-500 bg-orange-50'
                                    },
                                ].map(({ icon: Icon, title, text, color }) => (
                                    <div key={title} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                        <div className={`p-1.5 rounded-lg mt-0.5 flex-shrink-0 ${color}`}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-800 leading-tight">{title}</p>
                                            <p className="text-[11px] text-gray-500 leading-snug mt-0.5">{text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-100" />
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="px-3 bg-white text-gray-400">Daftar gratis dengan</span>
                                </div>
                            </div>

                            <button
                                onClick={handleGoogleAuth}
                                className="w-full flex justify-center items-center py-3.5 px-4 border border-gray-200 rounded-2xl shadow-sm bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 transition-all active:scale-[0.98]"
                            >
                                <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.67l-3.57-2.77c-1.01.68-2.3 1.09-3.71 1.09-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.12c-.22-.68-.35-1.39-.35-2.12s.13-1.44.35-2.12V7.04H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.96l3.66-2.84z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Daftar dengan Google
                            </button>

                            <p className="text-center text-xs text-gray-400">
                                Sudah punya akun?{' '}
                                <button
                                    onClick={() => setMode('login')}
                                    className="text-[#1B5E20] font-bold hover:underline underline-offset-2 transition-all"
                                >
                                    Masuk di sini
                                </button>
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer links */}
                <div className="mt-6 flex flex-col items-center gap-3">
                    <Link
                        href="/seller-info"
                        className="text-xs font-semibold text-[#1B5E20] hover:underline underline-offset-2 transition-all"
                    >
                        🏪 Mau berjualan? Baca info seller dulu
                    </Link>
                    <Link
                        href="/"
                        className="inline-flex items-center text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                        Kembali ke Beranda
                    </Link>
                </div>

                <p className="mt-6 text-center text-[11px] text-gray-400 px-4">
                    Dengan masuk atau mendaftar, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi kami.
                </p>
            </div>
        </div>
    );
}
