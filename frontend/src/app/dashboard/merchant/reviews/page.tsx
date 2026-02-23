'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, ArrowLeft, RefreshCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ReviewList from '@/components/features/ReviewList';
import MerchantBottomNav from '@/components/merchant/MerchantBottomNav';
import { useAuthStore } from '@/store/authStore';

export default function MerchantReviewsPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuthStore();
    const router = useRouter();

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';
            // First we need the merchant's shop ID
            const statsRes = await axios.get(`${apiBaseUrl}/shops/stats`, { withCredentials: true });
            const shopId = statsRes.data.shopId;

            if (shopId) {
                const reviewsRes = await axios.get(`${apiBaseUrl}/reviews/shop/${shopId}`);
                setReviews(reviewsRes.data);
            }
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-poppins)] pb-24 lg:pb-12">
            <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tight">Kritik & Saran</h1>
                            <p className="text-xs sm:text-sm text-gray-500 font-medium tracking-tight">Daftar masukan dari pembeli untuk perbaikan tokomu.</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchReviews}
                        className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
                        title="Refresh"
                    >
                        <RefreshCcw className={loading ? "h-5 w-5 text-gray-400 animate-spin" : "h-5 w-5 text-gray-600"} />
                    </button>
                </div>

                {/* Content Container */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 sm:p-8">
                        <ReviewList reviews={reviews} isLoading={loading} />
                    </div>
                </div>

                {/* Helpful Message */}
                <div className="mt-8 p-6 bg-green-50 rounded-3xl border border-green-100 flex items-start space-x-4">
                    <div className="p-2 bg-white rounded-xl shadow-sm">
                        <MessageSquare className="h-6 w-6 text-[#1B5E20]" />
                    </div>
                    <div>
                        <h4 className="font-bold text-[#1B5E20] text-sm mb-1">Tips untuk Penjual</h4>
                        <p className="text-xs text-green-700 leading-relaxed">
                            Gunakan kritik dan saran ini sebagai tolak ukur perbaikan rasa, penyajian, atau pelayanan kedepannya. Rasa bersifat subjektif, namun konsistensi dan respon yang baik akan tetap membangun kepercayaan pelanggan.
                        </p>
                    </div>
                </div>
            </main>

            <MerchantBottomNav />
        </div>
    );
}
