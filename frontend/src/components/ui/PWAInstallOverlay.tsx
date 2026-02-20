'use client';

import { useState, useEffect } from 'react';
import { Download, Smartphone, LayoutGrid } from 'lucide-react';

export default function PWAInstallOverlay() {
    const [isVisible, setIsVisible] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        const handleBeforeInstallPrompt = (e: any) => {
            console.log('beforeinstallprompt event fired');
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Check if running in standalone mode (installed)
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
            || (window.navigator as any).standalone
            || document.referrer.includes('android-app://');

        // Show overlay if NOT installed
        // Note: For production, you might want to add back isMobile check 
        // but for now we keep it visible for the user to see the UI.
        setIsVisible(!isStandaloneMode);

        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            alert('Silakan gunakan menu browser (Share/Titik Tiga) lalu pilih "Tambahkan ke Layar Utama" jika tombol ini tidak merespon pada browser Anda.');
            return;
        }
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    if (!mounted || !isVisible) return null;

    return (
        <div className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500 overflow-y-auto">
            <div className="max-w-xs w-full space-y-8 py-10">
                {/* App Icon / Logo */}
                <div className="mx-auto w-24 h-24 bg-[#1B5E20] rounded-[2rem] shadow-2xl shadow-green-200 flex items-center justify-center transform animate-bounce">
                    <img src="/icons/icon-192x192.png" alt="Axon" className="w-16 h-16 object-contain" />
                </div>

                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Pasang Aplikasi</h1>
                    <p className="text-sm text-gray-500 leading-relaxed px-4">
                        Untuk pengalaman terbaik dan akses lebih cepat, silakan pasang **Axon DapurKita** di layar utama gadget Anda.
                    </p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={handleInstallClick}
                        className="w-full py-4 bg-[#1B5E20] text-white rounded-2xl font-bold hover:bg-green-800 transition-all shadow-xl shadow-green-100 flex items-center justify-center gap-3 active:scale-95 group"
                    >
                        <Download className="h-5 w-5 group-hover:animate-bounce" />
                        <span>Pasang Sekarang</span>
                    </button>

                    <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Atau Gunakan Cara Manual</p>
                        <div className="flex items-start gap-4 text-left">
                            <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 shrink-0">
                                <LayoutGrid className="h-5 w-5 text-[#1B5E20]" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Langkah 1</p>
                                <p className="text-sm font-bold text-gray-800 leading-tight">Klik tombol menu browser</p>
                                <p className="text-[10px] text-gray-500">(Ikon titik tiga atau "Share")</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 text-left">
                            <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 shrink-0 text-[#1B5E20]">
                                <Download className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Langkah 2</p>
                                <p className="text-sm font-bold text-gray-800 leading-tight">Pilih "Instal Aplikasi"</p>
                                <p className="text-[10px] text-gray-500">atau "Tambahkan ke Layar Utama"</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 space-y-6">
                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                        <Smartphone className="h-3 w-3" />
                        <span>Native Mobile Experience</span>
                    </div>

                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-[10px] text-gray-300 hover:text-gray-500 underline transition-colors"
                    >
                        Lanjutkan di Browser (Khusus Testing)
                    </button>
                </div>
            </div>

            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-green-50 rounded-full blur-3xl opacity-50 z-[-1]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 z-[-1]"></div>
        </div>
    );
}
