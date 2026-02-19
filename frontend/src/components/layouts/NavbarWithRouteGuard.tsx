'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function NavbarWithRouteGuard() {
    const pathname = usePathname();

    // Hide navbar on merchant dashboard routes
    const isMerchantRoute = pathname?.startsWith('/dashboard/merchant');

    if (isMerchantRoute) return null;

    return <Navbar />;
}
