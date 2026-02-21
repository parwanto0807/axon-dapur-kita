'use client';

import { ShoppingBag, Search, Package, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: 'cart' | 'search' | 'package' | 'order';
    actionLabel?: string;
    actionHref?: string;
}

export default function EmptyState({
    title,
    description,
    icon = 'package',
    actionLabel,
    actionHref
}: EmptyStateProps) {
    const icons = {
        cart: ShoppingCart,
        search: Search,
        package: Package,
        order: ShoppingBag
    };

    const Icon = icons[icon];

    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Icon className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto mb-8 font-medium">
                {description}
            </p>
            {actionLabel && actionHref && (
                <Link
                    href={actionHref}
                    className="px-6 py-3 bg-[#1B5E20] text-white text-sm font-bold rounded-xl hover:bg-[#154a1a] transition-all shadow-lg shadow-green-100 active:scale-95"
                >
                    {actionLabel}
                </Link>
            )}
        </div>
    );
}
