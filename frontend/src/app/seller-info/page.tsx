'use client';

import Link from 'next/link';
import {
    CheckCircle,
    ArrowRight,
    Store,
    DollarSign,
    Users,
    Clock,
    ShieldCheck,
    TrendingUp,
    XCircle,
    HelpCircle,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { formatPrice } from '@/utils/format';
import { useState } from 'react';

export default function SellerInfoPage() {
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    const faqs = [
        {
            question: "Apakah benar-benar tidak ada potongan per transaksi?",
            answer: "Benar! 100% pendapatan penjualan adalah milik Anda. Kami tidak memotong komisi sepeserpun dari transaksi Anda. Anda hanya membayar biaya langganan bulanan yang tetap."
        },
        {
            question: "Bagaimana jika saya ingin berhenti berlangganan?",
            answer: "Anda bebas berhenti kapan saja. Tidak ada kontrak jangka panjang yang mengikat (kecuali Anda memilih paket tahunan untuk diskon ekstra). Cukup batalkan langganan sebelum periode berikutnya dimulai."
        },
        {
            question: "Apakah ada batasan jumlah produk yang bisa saya jual?",
            answer: "Tidak ada! Anda bisa mengunggah produk sebanyak-banyaknya tanpa biaya tambahan."
        },
        {
            question: "Bagaimana sistem pengirimannya?",
            answer: "Kami memberikan fleksibilitas penuh. Penjual bebas menentukan kurir atau layanan pengiriman sendiri (termasuk kurir lokal), tanpa terikat pada sistem logistik platform. Ongkos kirim dapat diatur sesuai kesepakatan antara penjual dan pembeli."
        }
    ];

    return (
        <div className="min-h-screen bg-white font-[family-name:var(--font-poppins)]">
            {/* Hero Section */}
            <div className="bg-[#1B5E20] text-white pt-16 pb-12 sm:pt-32 sm:pb-28 px-0 sm:px-4 overflow-hidden relative">
                <div className="absolute inset-0 overflow-hidden opacity-20">
                    <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-green-400 blur-[120px]"></div>
                    <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-yellow-400 blur-[100px]"></div>
                </div>

                <div className="max-w-5xl mx-auto text-center relative z-10 px-4">
                    <div className="inline-flex items-center space-x-2 bg-white/10 px-4 py-1.5 rounded-full mb-6 sm:mb-8 backdrop-blur-md border border-white/20 shadow-lg animate-fade-in-up">
                        <Store className="h-3 w-3 sm:h-4 sm:w-4 text-green-300" />
                        <span className="text-[10px] sm:text-sm font-bold text-green-50 uppercase tracking-widest">Axon DapurKita Merchant</span>
                    </div>

                    <h1 className="text-3xl sm:text-6xl lg:text-7xl font-black mb-4 sm:mb-6 leading-tight tracking-tight drop-shadow-sm">
                        Jualan Online,<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-yellow-300">
                            Tanpa Potongan Komisi!
                        </span>
                    </h1>

                    <p className="text-xs sm:text-xl text-green-100 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
                        Platform e-commerce pertama yang membiarkan Anda menyimpan <span className="text-white font-bold decoration-yellow-400 decoration-2 underline underline-offset-4">100% profit</span> penjualan. Cukup bayar langganan flat, nikmati fitur premium sepuasnya.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 px-4 sm:px-0">
                        <Link
                            href="/seller-registration"
                            className="w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 bg-yellow-400 text-yellow-950 font-black rounded-xl sm:rounded-2xl hover:bg-yellow-300 transition-all shadow-xl shadow-yellow-400/20 active:scale-95 flex items-center justify-center text-xs sm:text-lg group"
                        >
                            Mulai Berjualan Sekarang
                            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <a
                            href="#pricing"
                            className="w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 bg-white/10 text-white font-bold rounded-xl sm:rounded-2xl hover:bg-white/20 transition-all backdrop-blur-sm border border-white/20 flex items-center justify-center text-xs sm:text-lg"
                        >
                            Lihat Paket Promo
                        </a>
                    </div>

                    <div className="mt-8 sm:mt-12 flex flex-wrap justify-center gap-4 sm:gap-12 opacity-80">
                        <div className="flex items-center space-x-1.5 sm:space-x-2">
                            <CheckCircle className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-green-300" />
                            <span className="text-[10px] sm:text-base font-semibold">Tanpa Hidden Fees</span>
                        </div>
                        <div className="flex items-center space-x-1.5 sm:space-x-2">
                            <CheckCircle className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-green-300" />
                            <span className="text-[10px] sm:text-base font-semibold">Setup Toko Instan</span>
                        </div>
                        <div className="flex items-center space-x-1.5 sm:space-x-2">
                            <CheckCircle className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-green-300" />
                            <span className="text-[10px] sm:text-base font-semibold">Support 24/7</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comparison Section */}
            <div className="py-12 sm:py-32 px-2 sm:px-4 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-10 sm:mb-16">
                        <h2 className="text-xl sm:text-4xl font-black text-gray-900 mb-2 sm:mb-4">Mengapa Pindah ke Axon DapurKita?</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto text-[10px] sm:text-lg">
                            Bandingkan keuntungan yang Anda dapatkan di sini dengan platform lain (Ojek Online / Marketplace Biasa).
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 lg:gap-12">
                        {/* The Other Guys */}
                        <div className="bg-white p-6 sm:p-10 rounded-3xl sm:rounded-[2.5rem] border border-gray-100 shadow-sm opacity-70 hover:opacity-100 transition-opacity">
                            <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
                                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gray-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
                                    <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                                </div>
                                <h3 className="text-base sm:text-xl font-bold text-gray-500">Platform Lain</h3>
                            </div>
                            <ul className="space-y-4 sm:space-y-6">
                                <li className="flex items-start">
                                    <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 mt-0.5 shrink-0 mr-2 sm:mr-3" />
                                    <div>
                                        <p className="text-[10px] sm:text-base font-bold text-gray-900">Potongan Komisi Tinggi</p>
                                        <p className="text-[8px] sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Dikenakan 15-30% dari setiap transaksi penjualan Anda.</p>
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 mt-0.5 shrink-0 mr-2 sm:mr-3" />
                                    <div>
                                        <p className="text-[10px] sm:text-base font-bold text-gray-900">Biaya Layanan Tambahan</p>
                                        <p className="text-[8px] sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Seringkali ada biaya admin, biaya aplikasi, dll.</p>
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 mt-0.5 shrink-0 mr-2 sm:mr-3" />
                                    <div>
                                        <p className="text-[10px] sm:text-base font-bold text-gray-900">Persaingan Tidak Sehat</p>
                                        <p className="text-[8px] sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Algoritma sering menguntungkan toko besar saja.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* Axon DapurKita */}
                        <div className="bg-white p-6 sm:p-10 rounded-3xl sm:rounded-[2.5rem] border-2 border-[#1B5E20]/10 shadow-2xl shadow-green-900/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-[#1B5E20] text-white text-[8px] sm:text-xs font-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-bl-xl sm:rounded-bl-2xl">
                                REKOMENDASI
                            </div>
                            <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
                                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
                                    <Store className="h-5 w-5 sm:h-6 sm:w-6 text-[#1B5E20]" />
                                </div>
                                <h3 className="text-base sm:text-xl font-black text-[#1B5E20]">Axon DapurKita</h3>
                            </div>
                            <ul className="space-y-4 sm:space-y-6">
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-[#1B5E20] mt-0.5 shrink-0 mr-2 sm:mr-3" />
                                    <div>
                                        <p className="text-[10px] sm:text-base font-bold text-gray-900">0% Komisi Penjualan</p>
                                        <p className="text-[8px] sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Omzet penjualan 100% masuk ke saku Anda.</p>
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-[#1B5E20] mt-0.5 shrink-0 mr-2 sm:mr-3" />
                                    <div>
                                        <p className="text-[10px] sm:text-base font-bold text-gray-900">Biaya Flat Terjangkau</p>
                                        <p className="text-[8px] sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Cukup bayar langganan bulanan mulai Rp 25.000.</p>
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-[#1B5E20] mt-0.5 shrink-0 mr-2 sm:mr-3" />
                                    <div>
                                        <p className="text-[10px] sm:text-base font-bold text-gray-900">Fokus Komunitas Lokal</p>
                                        <p className="text-[8px] sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Membangun pelanggan setia di sekitar lingkungan Anda.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Highlights with Cards */}
            <div className="py-12 sm:py-32 max-w-7xl mx-auto px-2 sm:px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
                    <div className="p-6 sm:p-8 rounded-3xl sm:rounded-[2rem] bg-indigo-50 hover:bg-indigo-100 transition-colors group cursor-default">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                            <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
                        </div>
                        <h3 className="text-lg sm:text-2xl font-black text-gray-900 mb-2 sm:mb-3">Profit Maksimal</h3>
                        <p className="text-[10px] sm:text-base text-gray-600 leading-relaxed font-medium">
                            Tanpa potongan berarti margin keuntungan Anda lebih besar. Bisa untuk modal ekspansi atau tabungan masa depan.
                        </p>
                    </div>

                    <div className="p-6 sm:p-8 rounded-3xl sm:rounded-[2rem] bg-orange-50 hover:bg-orange-100 transition-colors group cursor-default">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                        </div>
                        <h3 className="text-lg sm:text-2xl font-black text-gray-900 mb-2 sm:mb-3">Hyperlocal Market</h3>
                        <p className="text-[10px] sm:text-base text-gray-600 leading-relaxed font-medium">
                            Targetkan tetangga dan komunitas sekitar. Biaya kirim murah, makanan sampai lebih cepat dan hangat.
                        </p>
                    </div>

                    <div className="p-6 sm:p-8 rounded-3xl sm:rounded-[2rem] bg-teal-50 hover:bg-teal-100 transition-colors group cursor-default">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-teal-600" />
                        </div>
                        <h3 className="text-lg sm:text-2xl font-black text-gray-900 mb-2 sm:mb-3">Dashboard Canggih</h3>
                        <p className="text-[10px] sm:text-base text-gray-600 leading-relaxed font-medium">
                            Kelola pesanan, stok, dan laporan keuangan semudah bermain media sosial. Semua real-time!
                        </p>
                    </div>
                </div>
            </div>

            {/* Pricing Section */}
            <div id="pricing" className="bg-[#0f172a] py-16 sm:py-32 px-2 sm:px-4 text-white rounded-t-[2.5rem] sm:rounded-t-[5rem] relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-green-500/20 rounded-full blur-[100px]"></div>
                <div className="absolute top-40 right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px]"></div>

                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="text-center mb-12 sm:mb-20">
                        <span className="text-green-400 font-bold tracking-widest uppercase text-[10px] sm:text-xs bg-green-400/10 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-green-400/20">Membership Plans</span>
                        <h2 className="text-2xl sm:text-5xl font-black mt-4 sm:mt-6 mb-4 sm:mb-6">Investasi Kecil,<br />Impact Besar</h2>
                        <p className="text-gray-400 max-w-xl mx-auto text-[10px] sm:text-lg">Pilih paket yang pas untuk memulai perjalanan bisnis kuliner Anda.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-center max-w-6xl mx-auto">

                        {/* Starter Plan (Promo) */}
                        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/10 p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] flex flex-col hover:bg-white/10 transition-all duration-300 group">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-200 mb-2">Paket Starter</h3>
                            <div className="flex items-end mb-4 sm:mb-6">
                                <span className="text-3xl sm:text-4xl font-black text-white">25rb</span>
                                <span className="text-gray-400 ml-2 font-medium mb-1 text-[10px] sm:text-base">/ bulan</span>
                            </div>
                            <p className="text-[10px] sm:text-sm text-gray-300 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-white/10 min-h-[4rem] sm:min-h-[5rem]">
                                Harga promo gila-gilaan khusus untuk pendaftar baru di 3 bulan pertama.
                            </p>
                            <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 flex-1">
                                <li className="flex items-center space-x-2 sm:space-x-3 text-gray-200 text-[10px] sm:text-sm">
                                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                                    <span>Total 75rb untuk 3 Bulan</span>
                                </li>
                                <li className="flex items-center space-x-2 sm:space-x-3 text-gray-200 text-[10px] sm:text-sm">
                                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                                    <span>Full Akses Dashboard</span>
                                </li>
                            </ul>
                            <Link href="/seller-registration?plan=starter" className="w-full py-3.5 sm:py-4 bg-white text-[#1B5E20] font-black rounded-xl sm:rounded-2xl text-center transition-all hover:bg-green-50 text-xs sm:text-base">
                                Ambil Promo Ini
                            </Link>
                        </div>

                        {/* Annual Plan (Best Value) */}
                        <div className="bg-gradient-to-b from-[#1B5E20] to-[#144217] p-1 rounded-3xl sm:rounded-[2.5rem] shadow-2xl shadow-green-900/50 transform lg:-translate-y-4 relative">
                            <div className="absolute top-0 right-0 left-0 -mt-3 sm:-mt-4 flex justify-center">
                                <span className="bg-yellow-400 text-yellow-950 text-[10px] sm:text-xs font-black px-3 py-1 sm:px-4 sm:py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                                    Paling Hemat
                                </span>
                            </div>
                            <div className="bg-[#1B5E20] h-full rounded-[1.8rem] sm:rounded-[2.3rem] p-6 sm:p-8 flex flex-col">
                                <h3 className="text-lg sm:text-xl font-bold text-green-200 mb-2">Paket Tahunan</h3>
                                <div className="flex items-end mb-4 sm:mb-6">
                                    <span className="text-4xl sm:text-5xl font-black text-white">31.8rb</span>
                                    <span className="text-green-200 ml-2 font-medium mb-1 text-[10px] sm:text-base">/ bulan</span>
                                </div>
                                <p className="text-[10px] sm:text-sm text-green-100 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-green-700/30 min-h-[4rem] sm:min-h-[5rem]">
                                    Bayar langsung setahun, pikiran tenang, dompet senang. Hemat 5% dari harga normal.
                                </p>
                                <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10 flex-1">
                                    <li className="flex items-center space-x-2 sm:space-x-3 text-white text-[10px] sm:text-sm font-semibold">
                                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
                                        <span>Total tagihan ~382rb / tahun</span>
                                    </li>
                                    <li className="flex items-center space-x-2 sm:space-x-3 text-white text-[10px] sm:text-sm font-semibold">
                                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
                                        <span>Prioritas Support 24/7</span>
                                    </li>
                                    <li className="flex items-center space-x-2 sm:space-x-3 text-white text-[10px] sm:text-sm font-semibold">
                                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
                                        <span>Verified Merchant Badge</span>
                                    </li>
                                    <li className="flex items-center space-x-2 sm:space-x-3 text-white text-[10px] sm:text-sm font-semibold">
                                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
                                        <span>Gratis Domain .com (1 thn)</span>
                                    </li>
                                </ul>
                                <Link href="/seller-registration?plan=annual" className="w-full py-4 sm:py-5 bg-yellow-400 hover:bg-yellow-300 text-yellow-950 font-black rounded-xl sm:rounded-2xl text-center transition-all shadow-lg shadow-yellow-400/20 active:scale-95 text-xs sm:text-lg">
                                    Pilih Tahunan
                                </Link>
                            </div>
                        </div>

                        {/* Standard Plan */}
                        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] flex flex-col hover:bg-gray-800 transition-all duration-300">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-400 mb-2">Paket Bulanan</h3>
                            <div className="flex items-end mb-4 sm:mb-6">
                                <span className="text-3xl sm:text-4xl font-black text-white">33.5rb</span>
                                <span className="text-gray-500 ml-2 font-medium mb-1 text-[10px] sm:text-base">/ bulan</span>
                            </div>
                            <p className="text-[10px] sm:text-sm text-gray-400 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-700/50 min-h-[4rem] sm:min-h-[5rem]">
                                Fleksibilitas penuh. Bayar per bulan, bebas berhenti kapan saja tanpa denda.
                            </p>
                            <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 flex-1">
                                <li className="flex items-center space-x-2 sm:space-x-3 text-gray-300 text-[10px] sm:text-sm">
                                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                                    <span>Bebas Cancel Kapan Saja</span>
                                </li>
                                <li className="flex items-center space-x-2 sm:space-x-3 text-gray-300 text-[10px] sm:text-sm">
                                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                                    <span>Full Akses Fitur</span>
                                </li>
                            </ul>
                            <Link href="/seller-registration?plan=monthly" className="w-full py-3.5 sm:py-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl sm:rounded-2xl text-center transition-all text-xs sm:text-base">
                                Daftar Reguler
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="py-12 sm:py-32 max-w-3xl mx-auto px-2 sm:px-4">
                <div className="text-center mb-10 sm:mb-16">
                    <h2 className="text-xl sm:text-3xl font-black text-gray-900 mb-2 sm:mb-4">Sering Ditanyakan</h2>
                </div>
                <div className="space-y-3 sm:space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 hover:border-green-200 hover:shadow-md bg-white">
                            <button
                                onClick={() => toggleFaq(index)}
                                className="w-full flex items-center justify-between p-4 sm:p-6 text-left focus:outline-none"
                            >
                                <span className="font-bold text-gray-900 text-xs sm:text-lg pr-4">{faq.question}</span>
                                {openFaqIndex === index ? (
                                    <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 shrink-0" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 shrink-0" />
                                )}
                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaqIndex === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                            >
                                <div className="px-4 pb-4 sm:px-6 sm:pb-6 text-gray-600 leading-relaxed text-[10px] sm:text-base">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Final CTA */}
            <div className="bg-[#1B5E20] py-12 sm:py-20 px-4 text-center">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl sm:text-5xl font-black text-white mb-4 sm:mb-8 leading-tight">
                        Siap Mengubah Dapur Jadi <br /> <span className="text-green-300">Sumber Penghasilan?</span>
                    </h2>
                    <p className="text-green-100 text-xs sm:text-lg mb-6 sm:mb-10 max-w-2xl mx-auto">
                        Jangan biarkan potensi Anda terhenti. Gabung sekarang, bangun reputasi toko Anda, dan nikmati hasil kerja keras Anda 100%.
                    </p>
                    <Link
                        href="/seller-registration"
                        className="inline-flex items-center px-6 py-3.5 sm:px-10 sm:py-5 bg-white text-[#1B5E20] font-black rounded-full text-xs sm:text-lg hover:bg-gray-100 transition-all shadow-2xl shadow-black/20 transform hover:-translate-y-1"
                    >
                        Mulai Berjualan Sekarang
                        <ArrowRight className="ml-2 h-4 w-4 sm:h-6 sm:w-6" />
                    </Link>
                    <p className="mt-4 sm:mt-6 text-[10px] sm:text-sm text-green-200/60 font-medium">
                        *Dapatkan harga spesial untuk pendaftaran hari ini.
                    </p>
                </div>
            </div>

            <div className="bg-[#0f172a] py-6 sm:py-8 text-center border-t border-gray-800">
                <p className="text-gray-500 text-[10px] sm:text-sm font-medium">
                    &copy; {new Date().getFullYear()} Axon DapurKita. All rights reserved. <br />
                    Part of <span className="text-white font-bold">AXON GROUP</span>
                </p>
            </div>
        </div>
    );
}
