'use client';

import Link from 'next/link';
import { Store, ArrowLeft, UserPlus, Mail, Lock, User } from 'lucide-react';

export default function RegisterPage() {
    const handleGoogleRegister = () => {
        // Redirect to backend auth endpoint (Google handled as both login/register)
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';
        window.location.href = `${apiBaseUrl}/auth/google`;
    };

    return (
        <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-[family-name:var(--font-poppins)]">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="bg-[#1B5E20] p-3 rounded-2xl shadow-lg shadow-[#1B5E20]/20">
                        <UserPlus className="h-10 w-10 text-white" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                    Daftar di <span className="text-[#1B5E20]">Axon</span>
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Gabung dengan komunitas DapurKita hari ini
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-2xl shadow-gray-200/50 sm:rounded-3xl sm:px-10 border border-gray-100">
                    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Nama Lengkap</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Masukkan nama Anda"
                                    className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-10 pr-4 text-gray-900 focus:bg-white focus:border-[#1B5E20] focus:outline-none focus:ring-4 focus:ring-[#1B5E20]/5 sm:text-sm transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    placeholder="nama@email.com"
                                    className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-10 pr-4 text-gray-900 focus:bg-white focus:border-[#1B5E20] focus:outline-none focus:ring-4 focus:ring-[#1B5E20]/5 sm:text-sm transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-10 pr-4 text-gray-900 focus:bg-white focus:border-[#1B5E20] focus:outline-none focus:ring-4 focus:ring-[#1B5E20]/5 sm:text-sm transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg bg-[#1B5E20] text-sm font-bold text-white hover:bg-[#1B5E20]/90 focus:outline-none transition-all active:scale-[0.98]"
                        >
                            Daftar Sekarang
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-400 text-xs">Atau daftar lebih cepat</span>
                            </div>
                        </div>

                        <button
                            onClick={handleGoogleRegister}
                            type="button"
                            className="w-full flex justify-center items-center py-3 px-4 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all active:scale-[0.98]"
                        >
                            <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.67l-3.57-2.77c-1.01.68-2.3 1.09-3.71 1.09-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.12c-.22-.68-.35-1.39-.35-2.12s.13-1.44.35-2.12V7.04H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.96l3.66-2.84z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Daftar dengan Google
                        </button>

                        <div className="text-center pt-2">
                            <Link
                                href="/login"
                                className="text-sm font-medium text-gray-600 hover:text-[#1B5E20] transition-colors"
                            >
                                Sudah punya akun? <span className="text-[#1B5E20] font-bold underline underline-offset-4">Masuk disini</span>
                            </Link>
                        </div>
                    </form>
                </div>

                <div className="text-center mt-8">
                    <Link
                        href="/"
                        className="inline-flex items-center text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Kembali ke Beranda
                    </Link>
                </div>
            </div>
        </div>
    );
}
