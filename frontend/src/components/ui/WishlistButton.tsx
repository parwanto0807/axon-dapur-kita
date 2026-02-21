'use client';

import { Heart } from 'lucide-react';
import { useWishlistStore } from '@/store/wishlistStore';
import { clsx } from 'clsx';
import { toast } from 'react-hot-toast';

interface WishlistButtonProps {
    product: {
        id: string;
        name: string;
        price: number;
        image: string | null;
        shop: {
            id: string;
            name: string;
        };
    };
    className?: string;
    iconClassName?: string;
}

export default function WishlistButton({ product, className, iconClassName }: WishlistButtonProps) {
    const { addItem, removeItem, isInWishlist } = useWishlistStore();
    const active = isInWishlist(product.id);

    const toggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (active) {
            removeItem(product.id);
            toast.success('Dihapus dari Wishlist');
        } else {
            addItem(product);
            toast.success('Ditambahkan ke Wishlist');
        }
    };

    return (
        <button
            onClick={toggleWishlist}
            className={clsx(
                "p-2 rounded-full transition-all active:scale-90",
                active ? "bg-red-50 text-red-500" : "bg-black/5 text-gray-400 hover:bg-black/10",
                className
            )}
            title={active ? "Hapus dari Wishlist" : "Tambah ke Wishlist"}
        >
            <Heart
                className={clsx(
                    "h-5 w-5",
                    active && "fill-current",
                    iconClassName
                )}
            />
        </button>
    );
}
