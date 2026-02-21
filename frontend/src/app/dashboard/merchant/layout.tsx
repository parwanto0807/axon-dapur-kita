'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import MerchantNavbar from '@/components/merchant/MerchantNavbar';
import PendingApproval from '@/components/merchant/PendingApproval';

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [shop, setShop] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkShopStatus = async () => {
        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';
            const response = await axios.get(`${apiBaseUrl}/shops/me`, { withCredentials: true });
            if (response.data) {
                setShop(response.data);
            }
        } catch (error) {
            console.error('Failed to check shop status', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkShopStatus();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B5E20]"></div>
            </div>
        );
    }

    if (shop?.status === 'PENDING') {
        return <PendingApproval shop={shop} onRefresh={checkShopStatus} />;
    }

    return (
        <div className="flex min-h-screen bg-[#F0F4EF]">
            <MerchantSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300">
                <MerchantNavbar onMenuClick={() => setIsSidebarOpen(true)} />

                <main className="flex-1 px-2 pt-4 pb-20 sm:p-6 overflow-y-auto bg-gradient-to-br from-[#F0F4EF] via-[#F8FAF7] to-[#E8F1E5]">
                    {children}
                </main>
            </div>
        </div>
    );
}
