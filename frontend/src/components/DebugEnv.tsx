'use client';

import { useEffect } from 'react';

export default function DebugEnv() {
    useEffect(() => {
        console.log('--- DEBUG ENVIRONMENT ---');
        console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
        console.log('-------------------------');
    }, []);

    return null;
}
