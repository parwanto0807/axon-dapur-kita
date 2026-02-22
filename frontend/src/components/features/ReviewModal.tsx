'use client';

import { useState } from 'react';
import { X, Camera, Loader2 } from 'lucide-react';
import { InteractiveStarRating } from '../ui/StarRating';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: {
        id: string;
        name: string;
        image: string;
        shopId?: string;
    };
    orderId?: string;
    onSuccess?: () => void;
}

export default function ReviewModal({ isOpen, onClose, product, orderId, onSuccess }: ReviewModalProps) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';
            await axios.post(`${apiBaseUrl}/reviews`, {
                productId: product.id || null,
                shopId: !product.id ? product.shopId : undefined,
                rating,
                comment,
                orderId
            }, { withCredentials: true });

            toast.success('Ulasan berhasil dikirim!');
            if (onSuccess) onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Failed to submit review:', error);
            toast.error(error.response?.data?.message || 'Gagal mengirim ulasan');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-black">{!product.id ? 'Ulas Toko' : 'Beri Ulasan'}</h3>
                        <p className="text-xs text-black font-semibold">{!product.id ? 'Bagikan pengalamanmu berbelanja di toko ini' : 'Bagikan pengalamanmu dengan produk ini'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="h-6 w-6 text-gray-900" />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Product Summary */}
                    <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-3xl">
                        <div className="h-16 w-16 rounded-xl overflow-hidden border border-gray-200 bg-white shrink-0">
                            {product.image ? (
                                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
                                    <Camera className="h-8 w-8" />
                                </div>
                            )}
                        </div>
                        <p className="font-black text-black line-clamp-2">{product.name}</p>
                    </div>

                    {/* Star Rating */}
                    <div className="space-y-3 text-center">
                        <p className="text-xs font-black text-black uppercase tracking-widest">{!product.id ? 'Pelayanan Toko' : 'Kualitas Produk'}</p>
                        <div className="flex justify-center">
                            <InteractiveStarRating rating={rating} onRatingChange={setRating} size={40} />
                        </div>
                        <p className="text-sm font-black text-[#1B5E20]">
                            {rating === 5 ? 'Sangat Puas' :
                                rating === 4 ? 'Puas' :
                                    rating === 3 ? 'Cukup' :
                                        rating === 2 ? 'Buruk' : 'Sangat Buruk'}
                        </p>
                    </div>

                    {/* Comment */}
                    <div className="space-y-3">
                        <p className="text-xs font-black text-black uppercase tracking-widest">Tulis Komentar</p>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder={!product.id ? "Bagaimana pelayanan tokonya?" : "Apa yang kamu sukai dari produk ini?"}
                            className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-[#1B5E20]/5 focus:border-[#1B5E20] transition-all min-h-[120px] resize-none outline-none font-bold text-black"
                        />
                    </div>

                    {/* Action */}
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full py-4 bg-[#1B5E20] text-white font-black rounded-2xl hover:bg-[#154a1a] transition-all shadow-xl shadow-green-100 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Mengirim...</span>
                            </>
                        ) : (
                            <span>Kirim Ulasan</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
