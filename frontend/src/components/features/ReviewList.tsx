'use client';

import { formatShortDate } from '@/utils/format';
import { getImageUrl } from '@/utils/image';
import StarRating from '../ui/StarRating';
import { Package, User } from 'lucide-react';

interface Review {
    id: string;
    rating: number;
    comment: string | null;
    images: string[];
    createdAt: string;
    productId?: string;
    product?: {
        name: string;
    };
    user: {
        name: string;
        image: string | null;
    };
}

interface ReviewListProps {
    reviews: Review[];
    isLoading?: boolean;
}

export default function ReviewList({ reviews, isLoading }: ReviewListProps) {
    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse">
                {[1, 2].map((i) => (
                    <div key={i} className="p-4 border-b border-gray-50 last:border-0">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="h-10 w-10 bg-gray-100 rounded-full" />
                            <div className="space-y-2">
                                <div className="h-3 w-32 bg-gray-100 rounded" />
                                <div className="h-3 w-20 bg-gray-100 rounded" />
                            </div>
                        </div>
                        <div className="h-4 w-full bg-gray-100 rounded mb-2" />
                        <div className="h-4 w-3/4 bg-gray-100 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="py-12 text-center">
                <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="h-8 w-8 text-gray-200" />
                </div>
                <p className="text-sm text-gray-500 font-medium">Belum ada ulasan untuk produk ini.</p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-100">
            {reviews.map((review) => (
                <div key={review.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-gray-100 overflow-hidden border border-gray-100">
                                {review.user.image ? (
                                    <img
                                        src={getImageUrl(review.user.image) || ''}
                                        alt={review.user.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-black leading-none mb-1">{review.user.name}</h4>
                                <div className="flex items-center gap-2">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{formatShortDate(review.createdAt)}</p>
                                    <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
                                    {review.productId ? (
                                        <span className="text-[9px] font-black text-[#1B5E20] px-1.5 py-0.5 bg-green-50 rounded border border-green-100 uppercase tracking-tighter">Ulasan Produk</span>
                                    ) : (
                                        <span className="text-[9px] font-black text-amber-600 px-1.5 py-0.5 bg-amber-50 rounded border border-amber-100 uppercase tracking-tighter">Ulasan Toko</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <StarRating rating={review.rating} size={12} />
                    </div>

                    {review.product && (
                        <div className="mb-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100 inline-flex items-center">
                            <Package className="h-3 w-3 text-gray-400 mr-2" />
                            <span className="text-[11px] font-bold text-black uppercase tracking-tight">{review.product.name}</span>
                        </div>
                    )}

                    <p className="text-sm text-black leading-relaxed font-bold mb-3">
                        {review.comment || 'Pembeli tidak memberikan komentar.'}
                    </p>

                    {review.images && review.images.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {review.images.map((img, idx) => (
                                <div
                                    key={idx}
                                    className="h-14 w-14 rounded-lg overflow-hidden border border-gray-100 bg-gray-50"
                                >
                                    <img
                                        src={getImageUrl(img) || ''}
                                        alt={`Review image ${idx + 1}`}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
