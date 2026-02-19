'use client';

import { X, Copy, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-hot-toast';

interface ShareDialogProps {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    title: string;
}

export default function ShareDialog({ isOpen, onClose, url, title }: ShareDialogProps) {
    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        toast.success('Link disalin!', {
            icon: '🔗',
            position: 'bottom-center',
            style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
            },
        });
    };

    const handleWhatsApp = () => {
        const text = `Cek produk ini: ${title}\n${url}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Bagikan Produk</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* QR Code */}
                    <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
                            <QRCodeSVG value={url} size={160} level="M" />
                        </div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest text-center">
                            Scan QR Code untuk membuka
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={handleWhatsApp}
                            className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-all active:scale-95 group"
                        >
                            <Share2 className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold">WhatsApp</span>
                        </button>
                        <button
                            onClick={handleCopy}
                            className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all active:scale-95 group"
                        >
                            <Copy className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold">Salin Link</span>
                        </button>
                    </div>

                    {/* Link Display */}
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center justify-between">
                        <p className="text-xs text-gray-500 truncate flex-1 min-w-0 mr-2">{url}</p>
                        <button onClick={handleCopy} className="text-xs font-bold text-[#1B5E20] hover:underline">
                            Salin
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
