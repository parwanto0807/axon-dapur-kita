'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import {
    Store,
    User,
    CheckCircle,
    ArrowRight,
    ArrowLeft,
    CreditCard,
    Upload,
    Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatPrice } from '@/utils/format';
import { useAuthStore } from '@/store/authStore';

// Wrap the main content in Suspense for useSearchParams
export default function SellerRegistrationPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-[#1B5E20]" /></div>}>
            <RegistrationContent />
        </Suspense>
    );
}

function RegistrationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, isLoggedIn, isLoading: authLoading, login } = useAuthStore();
    const initialPlan = searchParams.get('plan') || 'monthly';

    // Steps: 
    // 1. Auth (Login/Register) - Skipped if already logged in
    // 2. Shop Name (Minimal Info)
    // 3. Plan Confirmation
    // 4. Payment
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        shopName: '',
        phone: '',
        plan: initialPlan,
    });

    // Auto-advance if logged in, or redirect if already a seller
    useEffect(() => {
        if (!authLoading && isLoggedIn) {
            // Check if user is already a seller or has a shop
            // Note: user.shopId check depends on if backend sends it. 
            // If user.role is SELLER, definitely redirect.
            if (user?.role === 'SELLER' || (user?.shopId && user.shopId.length > 5)) {
                // Only redirect if valid shop detected
                toast.success('Anda sudah memiliki toko active! Mengalihkan...');
                router.push('/dashboard/merchant');
            } else if (step === 1) {
                setStep(2);
            }
        }
    }, [isLoggedIn, authLoading, step, user, router]);

    // Debug user data
    useEffect(() => {
        if (user) {
            console.log("Seller Registration - User State:", { email: user.email, role: user.role, shopId: user.shopId });
        }
    }, [user]);

    const plans = {
        starter: { name: 'Starter Promo', price: 25000, duration: '3 Bulan', total: 75000 },
        monthly: { name: 'Regular Bulanan', price: 33500, duration: '1 Bulan', total: 33500 },
        annual: { name: 'Hemat Tahunan', price: 31800, duration: '1 Tahun', total: 381600 },
    };

    const selectedPlan = plans[formData.plan as keyof typeof plans] || plans.monthly;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGoogleLogin = () => {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';
        // Redirect to Google Auth
        // After login, Google callback should redirect back here? 
        // Ideally, we need to store the 'intended' destination or plan in localStorage before redirecting
        if (typeof window !== 'undefined') {
            localStorage.setItem('seller_plan', formData.plan);
            const redirectPath = `/seller-registration?plan=${formData.plan}`;
            window.location.href = `${apiBaseUrl}/auth/google?redirect=${encodeURIComponent(redirectPath)}`;
        }
    };

    const handleNext = () => {
        if (step === 2) {
            if (!formData.shopName || !formData.phone) {
                toast.error('Mohon isi Nama Toko dan Nomor WhatsApp');
                return;
            }
        }
        setStep(step + 1);
    };

    const handleBack = () => {
        if (step === 2 && isLoggedIn) {
            // If logged in, back from step 2 might mean cancel or logout? 
            // For now just let them go back to step 1 (which will auto-forward if still logged in, creating a loop? No, handled by useEffect check)
            // Actually better to redirect to home or seller-info
            router.push('/seller-info');
            return;
        }
        setStep(step - 1);
    };



    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';

            // Create Shop via API
            await axios.post(`${apiBaseUrl}/shops`, {
                name: formData.shopName,
                slug: formData.shopName.toLowerCase().replace(/[^a-z0-9]+/g, '-'), // Basic slug gen, backend handles collision
                description: `Created via Seller Registration | Plan: ${formData.plan} | Contact: ${formData.phone}`,
                plan: formData.plan,
                phone: formData.phone,
                address: 'Alamat belum diatur', // Placeholder
            }, { withCredentials: true });

            // Refresh User Data (to get new role: SELLER and shopId)
            const userResponse = await axios.get(`${apiBaseUrl}/auth/me`, { withCredentials: true });
            if (userResponse.data) {
                login(userResponse.data);
            }

            setStep(4);
            toast.success('Pendaftaran Berhasil! Silakan konfirmasi pembayaran.');
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Gagal memproses pendaftaran. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-[#1B5E20]" /></div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-poppins)] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <Store className="mx-auto h-12 w-12 text-[#1B5E20]" />
                    <h2 className="mt-4 text-3xl font-black text-gray-900">
                        Registrasi Mitra Seller
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {step === 1 ? 'Masuk dengan Akun Google' :
                            step === 2 ? 'Detail Toko' :
                                step === 3 ? 'Konfirmasi Paket' : 'Instruksi Pembayaran'}
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
                    <div
                        className="bg-[#1B5E20] h-2.5 rounded-full transition-all duration-300 ease-in-out"
                        style={{ width: `${(step / 4) * 100}%` }}
                    ></div>
                </div>

                <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-3xl sm:px-10 border border-gray-100">

                    {/* Step 1: Login / Register (Only if NOT authenticated) */}
                    {step === 1 && !isLoggedIn && (
                        <div className="space-y-6 animate-fade-in text-center">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Masuk atau Daftar dengan Google
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Gunakan akun Google Anda untuk proses pendaftaran yang instan.
                                Jika belum punya akun, kami buatkan otomatis.
                            </p>

                            <button
                                onClick={handleGoogleLogin}
                                className="w-full flex justify-center items-center py-4 px-4 border border-gray-300 rounded-2xl shadow-sm bg-white text-base font-bold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1B5E20] transition-all active:scale-[0.98]"
                            >
                                <svg className="h-6 w-6 mr-3" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.67l-3.57-2.77c-1.01.68-2.3 1.09-3.71 1.09-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.12c-.22-.68-.35-1.39-.35-2.12s.13-1.44.35-2.12V7.04H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.96l3.66-2.84z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Lanjut dengan Google
                            </button>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Sudah punya akun?</span>
                                </div>
                            </div>
                            <Link href="/login?redirect=/seller-registration" className="block text-center text-[#1B5E20] font-bold hover:underline">
                                Login Manual
                            </Link>
                        </div>
                    )}

                    {/* Step 2: Minimal Shop Info */}
                    {step === 2 && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-xs text-yellow-800 font-semibold uppercase">Paket Pilihan Anda</p>
                                    <p className="font-bold text-gray-900">{selectedPlan.name}</p>
                                </div>
                                <Link href="/seller-info#pricing" className="text-xs font-bold text-[#1B5E20] hover:underline">
                                    Lihat Detail Paket Lain
                                </Link>
                            </div>



                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center mb-6">
                                <User className="h-10 w-10 text-green-700 bg-green-200 rounded-full p-2 mr-3" />
                                <div>
                                    <p className="text-xs text-green-800 font-semibold uppercase">Login Sebagai</p>
                                    <p className="font-bold text-gray-900">{user?.name || 'User'}</p>
                                    <p className="text-xs text-gray-600">{user?.email}</p>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                <Store className="mr-2 h-5 w-5 text-[#1B5E20]" /> Nama Toko & Kontak
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama Toko Anda</label>
                                <input
                                    type="text"
                                    name="shopName"
                                    value={formData.shopName}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border-gray-300 rounded-xl focus:ring-[#1B5E20] focus:border-[#1B5E20] sm:text-sm py-3 px-4 border text-gray-900 bg-white placeholder:text-gray-400"
                                    placeholder="Contoh: Dapur Bu Siti"
                                    autoFocus
                                />
                                <p className="mt-1 text-xs text-gray-400">Nama yang akan dilihat pelanggan.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nomor WhatsApp</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border-gray-300 rounded-xl focus:ring-[#1B5E20] focus:border-[#1B5E20] sm:text-sm py-3 px-4 border text-gray-900 bg-white placeholder:text-gray-400"
                                    placeholder="0812..."
                                />
                                <p className="mt-1 text-xs text-gray-400">Untuk konfirmasi pesanan dan pembayaran.</p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Confirmation */}
                    {step === 3 && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <CheckCircle className="mr-2 h-5 w-5 text-[#1B5E20]" /> Ringkasan Pendaftaran
                            </h3>

                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 relative">
                                <Link href="/seller-info#pricing" className="absolute top-4 right-4 text-[10px] font-bold text-[#1B5E20] bg-white px-2 py-1 rounded-full shadow-sm hover:bg-green-50 transition-colors">
                                    Ganti Paket
                                </Link>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Paket Pilihan</p>
                                        <h4 className="text-xl font-black text-[#1B5E20]">{selectedPlan.name}</h4>
                                        <p className="text-sm text-gray-600 mt-1">{selectedPlan.duration}</p>
                                    </div>
                                    <div className="text-right mt-6 sm:mt-0">
                                        <p className="text-2xl font-black text-[#1B5E20]">{formatPrice(selectedPlan.total)}</p>
                                    </div>
                                </div>
                                <hr className="border-green-200 my-4" />
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Nama Toko</p>
                                        <p className="font-bold text-gray-800">{formData.shopName}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-green-600 font-bold uppercase tracking-wider">WhatsApp</p>
                                        <p className="font-bold text-gray-800">{formData.phone}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center">
                                <Link href="/seller-info#pricing" className="text-xs font-bold text-gray-500 hover:text-[#1B5E20] hover:underline transition-colors">
                                    Lihat Detail Paket Lainnya
                                </Link>
                                <p className="text-sm text-gray-500 mt-2">
                                    Klik "Lanjut Pembayaran" untuk menyelesaikan pendaftaran.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Payment Instructions */}
                    {step === 4 && (
                        <div className="text-center py-4 animate-fade-in">
                            <div className="bg-green-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="h-10 w-10 text-[#1B5E20]" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 mb-2">Order Diterima!</h2>
                            <p className="text-gray-600 mb-8">Mohon selesaikan pembayaran untuk mengaktifkan toko <strong>{formData.shopName}</strong>.</p>

                            <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-6 max-w-md mx-auto mb-8 text-left relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                                    MENUNGGU PEMBAYARAN
                                </div>
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                                    <CreditCard className="mr-2 h-5 w-5 text-gray-500" /> Transfer BMS / BCA
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold">Nomor Rekening</p>
                                        <div className="flex justify-between items-center">
                                            <p className="text-xl font-mono font-bold text-gray-900">123 456 7890</p>
                                            <button
                                                onClick={() => { navigator.clipboard.writeText('1234567890'); toast.success('Disalin'); }}
                                                className="text-xs font-bold text-[#1B5E20] hover:underline"
                                            >
                                                SALIN
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500">a.n PT Axon DapurKita</p>
                                    </div>
                                    <div className="border-t border-gray-100 pt-4">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold">Total Transfer</p>
                                                <p className="text-xs text-gray-400">Tepat hingga 3 digit terakhir</p>
                                            </div>
                                            <p className="text-2xl font-black text-[#1B5E20]">{formatPrice(selectedPlan.total)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <a
                                href={`https://wa.me/6281234567890?text=Halo%20Admin,%20saya%20sudah%20daftar%20toko%20*${formData.shopName}*.%0A%0APaket:%20${selectedPlan.name}%0ATotal:%20${formatPrice(selectedPlan.total)}%0A%0AMohon%20bantu%20aktivasi.%20Terima%20kasih.`}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full inline-flex items-center justify-center px-6 py-4 border border-transparent text-base font-bold rounded-xl shadow-lg text-white bg-[#25D366] hover:bg-[#128C7E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#25D366] transition-all transform hover:-translate-y-1 mb-4"
                            >
                                <Upload className="mr-2 h-5 w-5" />
                                Konfirmasi via WhatsApp
                            </a>

                            <Link
                                href="/dashboard/merchant"
                                className="w-full inline-flex items-center justify-center px-6 py-4 border border-gray-300 text-base font-bold rounded-xl shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1B5E20] transition-all"
                            >
                                Masuk ke Dashboard (Menunggu Aktivasi)
                            </Link>

                            <p className="mt-4 text-xs text-gray-400">
                                Akun Anda akan aktif otomatis setelah bukti pembayaran diverifikasi Admin (Max 1x24 Jam).
                            </p>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    {step < 4 && (
                        <div className="mt-8 flex justify-between items-center">
                            {/* Back Button Logic */}
                            {step > 1 && (
                                <button
                                    onClick={handleBack}
                                    className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    {step === 2 && isLoggedIn ? 'Ganti Paket / Batal' : 'Kembali'}
                                </button>
                            )}

                            {/* Next Button Logic */}
                            {step === 1 && !isLoggedIn ? (
                                <span className="text-xs text-gray-400">Silakan login terlebih dahulu</span>
                            ) : (
                                <button
                                    onClick={step === 3 ? handleSubmit : handleNext}
                                    disabled={isLoading}
                                    className={`ml-auto flex items-center px-8 py-3.5 border border-transparent text-sm font-bold rounded-xl shadow-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1B5E20] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 ${step === 3 ? 'bg-yellow-500 hover:bg-yellow-400 text-yellow-950' : 'bg-[#1B5E20] hover:bg-[#154a1a]'
                                        }`}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                            Memproses...
                                        </>
                                    ) : step === 3 ? (
                                        <>
                                            Lanjut Pembayaran <CreditCard className="ml-2 h-4 w-4" />
                                        </>
                                    ) : (
                                        <>
                                            Selanjutnya <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {step === 1 && !isLoggedIn && (
                    <p className="text-center mt-6 text-xs text-gray-400">
                        Kami menjaga kerahasiaan data Anda.
                    </p>
                )}
            </div>
        </div>
    );
}
