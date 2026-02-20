'use client';

import { useClientServiceWorker } from "@/hooks/useClientServiceWorker";

export default function ServiceWorkerRegistry() {
    useClientServiceWorker();
    return null;
}
