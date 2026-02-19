'use client';

import { useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

export default function AuthSync({ children }: { children: React.ReactNode }) {
    const { login, logout, setLoading } = useAuthStore();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/auth/me', {
                    withCredentials: true
                });
                if (response.data) {
                    console.log('[AuthSync] User logged in:', response.data.id, 'Role:', response.data.role, 'ShopId:', response.data.shopId);
                    // Login action already sets loading to false
                    login(response.data);
                } else {
                    setLoading(false);
                }
            } catch (error) {
                // If 401, they are not logged in, which is fine
                logout(); // Logout action already sets loading to false
            }
        };

        checkAuth();
    }, [login, logout, setLoading]);

    return <>{children}</>;
}
