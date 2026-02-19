import { create } from 'zustand';

interface AuthState {
    isLoggedIn: boolean;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        image?: string;
        shopId?: string; // Added to track pending shop
    } | null;
    isLoading: boolean;
    login: (user: any) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    isLoggedIn: false, // Default to false as requested
    user: null,
    isLoading: true, // Default to true while checking session
    login: (user) => set({ isLoggedIn: true, user, isLoading: false }),
    logout: () => set({ isLoggedIn: false, user: null, isLoading: false }),
    setLoading: (loading) => set({ isLoading: loading }),
}));
