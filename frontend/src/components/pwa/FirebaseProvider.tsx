'use client';

import { useFCM } from "@/hooks/useFCM";

export default function FirebaseProvider({ children }: { children: React.ReactNode }) {
    useFCM();
    return <>{children}</>;
}
