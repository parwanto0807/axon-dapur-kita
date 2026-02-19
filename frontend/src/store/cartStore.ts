import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    productId: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    shopId: string;
    unit: string;
}

interface CartState {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (newItem) => {
                const currentItems = get().items;
                const existingItemIndex = currentItems.findIndex(
                    (item) => item.productId === newItem.productId
                );

                if (existingItemIndex !== -1) {
                    const updatedItems = [...currentItems];
                    updatedItems[existingItemIndex].quantity += newItem.quantity;
                    set({ items: updatedItems });
                } else {
                    set({ items: [...currentItems, newItem] });
                }
            },

            removeItem: (productId) => {
                set({
                    items: get().items.filter((item) => item.productId !== productId),
                });
            },

            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }

                const updatedItems = get().items.map((item) =>
                    item.productId === productId ? { ...item, quantity } : item
                );
                set({ items: updatedItems });
            },

            clearCart: () => set({ items: [] }),

            getTotalItems: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            },

            getTotalPrice: () => {
                return get().items.reduce(
                    (total, item) => total + item.price * item.quantity,
                    0
                );
            },
        }),
        {
            name: 'axon-cart-storage', // name of the item in the storage (must be unique)
        }
    )
);
