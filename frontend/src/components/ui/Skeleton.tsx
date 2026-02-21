'use client';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-gray-200/60",
                className
            )}
        />
    );
}

export function ProductSkeleton() {
    return (
        <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 flex flex-col h-full animate-pulse">
            <div className="aspect-square bg-gray-100" />
            <div className="p-4 space-y-3">
                <div className="h-3 w-2/3 bg-gray-100 rounded-lg" />
                <div className="h-4 w-full bg-gray-100 rounded-lg" />
                <div className="h-5 w-1/2 bg-gray-100 rounded-lg" />
            </div>
        </div>
    );
}

export function CategorySkeleton() {
    return (
        <div className="flex flex-col items-center flex-shrink-0 space-y-3 animate-pulse">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100" />
            <div className="h-3 w-12 bg-gray-100 rounded" />
        </div>
    );
}

export function ShopSkeleton() {
    return (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center space-x-4 animate-pulse">
            <div className="h-16 w-16 bg-gray-100 rounded-xl" />
            <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-gray-100 rounded" />
                <div className="h-3 w-1/2 bg-gray-100 rounded" />
            </div>
        </div>
    );
}
