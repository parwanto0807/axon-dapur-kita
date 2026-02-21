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
        <div className="divide-y divide-gray-50">
            {reviews.map((review) => (
                <div key={review.id} className="py-6 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between mb-4">
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
                                <h4 className="text-sm font-bold text-gray-900 leading-none mb-1">{review.user.name}</h4>
                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{formatShortDate(review.createdAt)}</p>
                            </div>
                        </div>
                        <StarRating rating={review.rating} size={14} />
                    </div>

                    <p className="text-sm text-gray-600 leading-relaxed font-medium mb-4">
                        {review.comment || 'Pembeli tidak memberikan komentar.'}
                    </p>

                    {review.images && review.images.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {review.images.map((img, idx) => (
                                <div
                                    key={idx}
                                    className="h-16 w-16 rounded-xl overflow-hidden border border-gray-100 bg-gray-50"
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
