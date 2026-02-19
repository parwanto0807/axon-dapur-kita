'use client';

import { ConnectionStatus } from '@/hooks/useMerchantSocket';

interface ConnectionStatusBadgeProps {
    status: ConnectionStatus;
    lastSync: Date | null;
    reconnectCount?: number;
}

const statusConfig: Record<ConnectionStatus, { dot: string; label: string; title: string }> = {
    connected: { dot: 'bg-green-500 animate-pulse', label: 'Live', title: 'Real-time updates aktif' },
    connecting: { dot: 'bg-yellow-400 animate-pulse', label: 'Connecting…', title: 'Menghubungkan ke server...' },
    reconnecting: { dot: 'bg-yellow-500 animate-pulse', label: 'Reconnecting…', title: 'Mencoba menghubungkan kembali...' },
    polling: { dot: 'bg-gray-400', label: 'Offline (Polling)', title: 'WebSocket tidak tersedia, menggunakan polling' },
    disconnected: { dot: 'bg-red-500', label: 'Offline', title: 'Tidak terhubung ke server' },
};

export default function ConnectionStatusBadge({ status, lastSync, reconnectCount = 0 }: ConnectionStatusBadgeProps) {
    const config = statusConfig[status];

    const formatLastSync = (date: Date | null) => {
        if (!date) return 'Belum pernah sync';
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSec = Math.floor(diffMs / 1000);
        if (diffSec < 60) return `${diffSec}s yang lalu`;
        const diffMin = Math.floor(diffSec / 60);
        return `${diffMin}m yang lalu`;
    };

    const tooltipText = [
        config.title,
        lastSync ? `Last sync: ${formatLastSync(lastSync)}` : '',
        reconnectCount > 0 ? `Reconnects: ${reconnectCount}` : '',
    ].filter(Boolean).join(' · ');

    return (
        <div
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-white border border-gray-100 shadow-sm cursor-default select-none"
            title={tooltipText}
        >
            <span className={`w-2 h-2 rounded-full ${config.dot}`} />
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                {config.label}
            </span>
        </div>
    );
}
