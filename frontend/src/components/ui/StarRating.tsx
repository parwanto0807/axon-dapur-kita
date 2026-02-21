'use client';

import { Star, StarHalf } from 'lucide-react';
import { clsx } from 'clsx';

interface StarRatingProps {
    rating: number;
    max?: number;
    size?: number;
    className?: string;
    showLabel?: boolean;
    count?: number;
}

export default function StarRating({
    rating,
    max = 5,
    size = 16,
    className,
    showLabel = false,
    count
}: StarRatingProps) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = max - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className={clsx("flex items-center space-x-1", className)}>
            <div className="flex items-center">
                {[...Array(fullStars)].map((_, i) => (
                    <Star
                        key={`full-${i}`}
                        size={size}
                        className="fill-amber-400 text-amber-400"
                    />
                ))}
                {hasHalfStar && (
                    <div className="relative">
                        <Star size={size} className="text-gray-200 fill-gray-200" />
                        <div className="absolute inset-0 overflow-hidden w-1/2">
                            <Star size={size} className="fill-amber-400 text-amber-400" />
                        </div>
                    </div>
                )}
                {[...Array(emptyStars)].map((_, i) => (
                    <Star
                        key={`empty-${i}`}
                        size={size}
                        className="fill-gray-200 text-gray-200"
                    />
                ))}
            </div>
            {showLabel && (
                <span className="text-xs font-bold text-gray-900 ml-1">
                    {rating.toFixed(1)}
                </span>
            )}
            {count !== undefined && (
                <span className="text-[10px] text-gray-400 font-medium ml-1">
                    ({count})
                </span>
            )}
        </div>
    );
}

interface InteractiveStarRatingProps {
    rating: number;
    onRatingChange: (rating: number) => void;
    size?: number;
}

export function InteractiveStarRating({ rating, onRatingChange, size = 32 }: InteractiveStarRatingProps) {
    return (
        <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onRatingChange(star)}
                    className="focus:outline-none transition-transform active:scale-95"
                >
                    <Star
                        size={size}
                        className={clsx(
                            star <= rating
                                ? "fill-amber-400 text-amber-400 shadow-sm"
                                : "text-gray-200 fill-gray-200 hover:text-amber-200 hover:fill-amber-200"
                        )}
                    />
                </button>
            ))}
        </div>
    );
}
