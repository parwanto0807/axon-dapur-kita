'use client';

import Link from 'next/link';
import { Store, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
    const handleGoogleLogin = () => {
        // Redirect to backend auth endpoint
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        window.location.href = `${apiBaseUrl}/auth/google`;
    };

    return (
        <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-[family-name:var(--font-poppins)]">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="bg-[#1B5E20] p-3 rounded-2xl shadow-lg shadow-[#1B5E20]/20">
                        <Store className="h-10 w-10 text-white" />
                    </div>
                </div>
                <Link href="/" className="flex flex-col group cursor-pointer">
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight flex flex-col items-center">
                        <span className="text-gray-900">Masuk ke</span>
                        <div className="flex items-center space-x-1 mt-1 group-hover:scale-105 transition-transform">
                            <span className="text-[#1B5E20]">Axon</span>
                            <span className="text-gray-400">DapurKita</span>
                        </div>
                    </h2>
                </Link>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-2xl shadow-gray-200/50 sm:rounded-3xl sm:px-10 border border-gray-100">
                    <div className="space-y-6">
                        <div>
                            <button
                                onClick={handleGoogleLogin}
                                className="w-full flex justify-center items-center py-3 px-4 border border-gray-200 rounded-2xl shadow-sm bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1B5E20] transition-all active:scale-[0.98]"
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
                                Masuk dengan Google
                            </button>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Atau</span>
                            </div>
                        </div>

                        <div className="text-center space-y-4">
                            <Link
                                href="/register"
                                className="block text-sm font-medium text-gray-600 hover:text-[#1B5E20] transition-colors"
                            >
                                Belum punya akun? <span className="text-[#1B5E20] font-bold underline underline-offset-4">Daftar disini</span>
                            </Link>

                            <hr className="border-gray-100" />

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

                <p className="mt-8 text-center text-xs text-gray-400">
                    Dengan masuk, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi kami.
                </p>
            </div>
            {/* Temporary Debugger */}
            <div className="hidden">
                {/* @ts-ignore */}
            </div>
        </div>
    );
}

// Ensure the component is used to trigger the console log
import DebugEnv from '@/components/DebugEnv';
