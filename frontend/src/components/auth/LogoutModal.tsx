'use client';

import { LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface LogoutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
    const { logout } = useAuthStore();
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';

    if (!isOpen) return null;

    const handleLogout = () => {
        logout();
        window.location.href = `${apiBaseUrl}/auth/logout`;
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 transform transition-all animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col items-center text-center">
                    <div className="h-20 w-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6 border border-red-100">
                        <LogOut className="h-10 w-10 text-red-500" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 leading-tight">Keluar Akun?</h3>
                    <p className="mt-3 text-sm text-gray-500 font-medium leading-relaxed">
                        Apakah Anda yakin akan logout dari <span className="font-bold text-[#1B5E20]">Axon DapurKita</span>?
                    </p>
                </div>

                <div className="mt-8 space-y-3">
                    <button
                        onClick={handleLogout}
                        className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-200 active:scale-95"
                    >
                        Lanjutkan
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl font-bold hover:bg-gray-100 transition-all border border-gray-100 active:scale-95"
                    >
                        Batal
                    </button>
                </div>
            </div>
        </div>
    );
}
