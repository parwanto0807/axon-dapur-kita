import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface WishlistItem {
    id: string;
    name: string;
    price: number;
    image: string | null;
    shop: {
        id: string;
        name: string;
    };
}

interface WishlistState {
    items: WishlistItem[];
    addItem: (item: WishlistItem) => void;
    removeItem: (id: string) => void;
    isInWishlist: (id: string) => boolean;
    clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (item) => {
                const { items } = get();
                if (!items.find((i) => i.id === item.id)) {
                    set({ items: [...items, item] });
                }
            },
            removeItem: (id) => {
                set({ items: get().items.filter((i) => i.id !== id) });
            },
            isInWishlist: (id) => {
                return get().items.some((i) => i.id === id);
            },
            clearWishlist: () => set({ items: [] }),
        }),
        {
            name: 'wishlist-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
