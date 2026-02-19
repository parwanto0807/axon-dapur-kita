'use client';

import { useState } from 'react';
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import MerchantNavbar from '@/components/merchant/MerchantNavbar';

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <MerchantSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300">
                <MerchantNavbar onMenuClick={() => setIsSidebarOpen(true)} />

                <main className="flex-1 px-[2px] pt-4 pb-20 sm:p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
