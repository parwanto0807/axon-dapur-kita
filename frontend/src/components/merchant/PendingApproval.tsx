'use client';
import { useState } from 'react';
import { Clock, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function PendingApproval({ shop, onRefresh }: { shop?: any; onRefresh?: () => Promise<void> }) {
    const [isChecking, setIsChecking] = useState(false);

    const handleCheckStatus = async () => {
        if (!onRefresh) return;

        setIsChecking(true);
        const loadingToast = toast.loading('Mengecek status toko...');

        try {
            await Promise.all([
                onRefresh(),
                new Promise(resolve => setTimeout(resolve, 800))
            ]);

            // If we are still here, it means status is still PENDING
            toast.dismiss(loadingToast);
            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                    <div className="flex-1 w-0 p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 pt-0.5">
                                <Clock className="h-10 w-10 text-yellow-500" />
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                    Status Masih Pending
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                    Admin sedang meninjau toko Anda. Mohon tunggu sebentar lagi.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ), { duration: 4000 });

        } catch (error) {
            toast.error("Gagal mengecek status", { id: loadingToast });
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center animate-fade-in bg-gray-50">
            <div className="bg-yellow-100 p-6 rounded-full mb-6 relative">
                <Clock className="h-16 w-16 text-yellow-600 animate-pulse" />
                <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-2 animate-bounce">
                    <div className="h-3 w-3 bg-white rounded-full"></div>
                </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
                Menunggu Aktivasi
            </h1>
            <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
                Toko Anda sedang ditinjau oleh Admin. Proses ini biasanya memakan waktu max 1x24 jam setelah bukti pembayaran dikonfirmasi.
            </p>

            <div className="space-y-3 w-full max-w-xs">
                <a
                    href="https://wa.me/6281234567890"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center px-6 py-3.5 border border-transparent text-sm font-bold rounded-xl shadow-lg text-white bg-[#25D366] hover:bg-[#128C7E] transition-all transform hover:-translate-y-1 w-full"
                >
                    Hubungi Admin via WhatsApp
                </a>
                <button
                    onClick={handleCheckStatus}
                    disabled={isChecking}
                    className={`flex items-center justify-center gap-2 px-6 py-3.5 border border-gray-200 text-sm font-bold rounded-xl w-full transition-all duration-200
                        ${isChecking
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm'
                        }`}
                >
                    {isChecking ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sedang Mengecek...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="h-4 w-4" />
                            Cek Status Lagi
                        </>
                    )}
                </button>
                <Link
                    href="/dashboard"
                    className="block text-xs font-bold text-gray-400 hover:text-gray-600 mt-4 transition-colors"
                >
                    Kembali ke Dashboard Utama
                </Link>
            </div>
        </div>
    );
}
