'use client';

import { ArrowLeft, ChevronDown, ChevronUp, HelpCircle, MessageCircle, ShieldCheck, Truck } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const faqs = [
    {
        category: 'Umum',
        icon: HelpCircle,
        items: [
            {
                q: 'Apa itu Axon DapurKita?',
                a: 'Axon DapurKita adalah marketplace komunitas yang menghubungkan Anda dengan tetangga sekitar yang menjual sayur segar, masakan matang, dan jamu tradisional. Kami fokus pada pemberdayaan UMKM lokal.'
            },
            {
                q: 'Apakah saya bisa belanja dari beberapa toko sekaligus?',
                a: 'Bisa, namun karena setiap toko adalah penjual mandiri, ongkos kirim akan dihitung per toko.'
            }
        ]
    },
    {
        category: 'Pengiriman',
        icon: Truck,
        items: [
            {
                q: 'Bagaimana sistem pengirimannya?',
                a: 'Saat ini pengiriman dilakukan langsung oleh penjual (kurir internal toko) atau layanan pengiriman instan untuk memastikan kesegaran produk.'
            },
            {
                q: 'Apakah ada batasan jarak pengiriman?',
                a: 'Ya, setiap toko memiliki batasan jarak pengiriman (biasanya 5km) untuk menjaga kualitas produk tetap prima.'
            }
        ]
    },
    {
        category: 'Pembayaran',
        icon: ShieldCheck,
        items: [
            {
                q: 'Metode pembayaran apa saja yang tersedia?',
                a: 'Kami mendukung pembayaran melalui Transfer Bank, E-Wallet (Gopay, OVO, Dana), dan Cash on Delivery (COD) tergantung kebijakan masing-masing toko.'
            }
        ]
    }
];

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-poppins)]">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-40">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </Link>
                        <h1 className="font-bold text-gray-900">Pusat Bantuan</h1>
                    </div>
                </div>
            </div>

            <main className="max-w-3xl mx-auto px-4 py-8">
                <div className="text-center mb-12">
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4">Ada yang bisa kami bantu?</h2>
                    <p className="text-gray-500 font-medium max-w-md mx-auto">
                        Cari jawaban untuk pertanyaan Anda atau hubungi dukungan pelanggan kami.
                    </p>
                </div>

                <div className="space-y-8">
                    {faqs.map((section, sIdx) => (
                        <div key={sIdx} className="space-y-4">
                            <div className="flex items-center space-x-2 text-[#1B5E20]">
                                <section.icon className="h-5 w-5" />
                                <h3 className="font-bold uppercase tracking-widest text-xs">{section.category}</h3>
                            </div>

                            <div className="space-y-3">
                                {section.items.map((item, iIdx) => {
                                    const id = `${sIdx}-${iIdx}`;
                                    const isOpen = openIndex === id;

                                    return (
                                        <div
                                            key={iIdx}
                                            className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300"
                                        >
                                            <button
                                                onClick={() => setOpenIndex(isOpen ? null : id)}
                                                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                                            >
                                                <span className="font-bold text-gray-800 text-sm">{item.q}</span>
                                                {isOpen ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                                            </button>

                                            {isOpen && (
                                                <div className="px-6 pb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                                    <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                                        {item.a}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact CTA */}
                <div className="mt-16 bg-[#1B5E20] rounded-[2.5rem] p-8 text-center text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-bold mb-2">Masih punya pertanyaan?</h3>
                        <p className="text-green-100 text-sm mb-8 opacity-80">
                            Tim dukungan kami siap membantu Anda 24/7 melalui WhatsApp.
                        </p>
                        <button className="px-8 py-3 bg-white text-[#1B5E20] font-bold rounded-xl hover:bg-green-50 transition-all active:scale-95 shadow-xl shadow-black/10">
                            Hubungi via WhatsApp
                        </button>
                    </div>
                    {/* Abstract circles */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                </div>
            </main>
        </div>
    );
}
