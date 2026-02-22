'use client';

import { useState, useEffect } from 'react';
import {
    Plus, Edit2, Trash2, Image as ImageIcon,
    Link as LinkIcon, Save, X, MoveUp, MoveDown,
    CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { getImageUrl } from '@/utils/image';

interface Carousel {
    id: string;
    title: string | null;
    subtitle: string | null;
    description: string | null;
    imageUrl: string;
    link: string | null;
    cta: string | null;
    order: number;
    isActive: boolean;
}

export default function AdminCarouselPage() {
    const [carousels, setCarousels] = useState<Carousel[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCarousel, setEditingCarousel] = useState<Carousel | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        description: '',
        link: '',
        cta: '',
        order: 0,
        isActive: true
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';

    const fetchCarousels = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiBaseUrl}/carousel/admin`, {
                withCredentials: true
            });
            setCarousels(response.data);
        } catch (error) {
            console.error('Error fetching carousels:', error);
            toast.error('Gagal mengambil data carousel');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCarousels();
    }, []);

    const handleOpenModal = (carousel: Carousel | null = null) => {
        if (carousel) {
            setEditingCarousel(carousel);
            setFormData({
                title: carousel.title || '',
                subtitle: carousel.subtitle || '',
                description: carousel.description || '',
                link: carousel.link || '',
                cta: carousel.cta || '',
                order: carousel.order,
                isActive: carousel.isActive
            });
            setPreviewUrl(getImageUrl(carousel.imageUrl));
        } else {
            setEditingCarousel(null);
            setFormData({
                title: '',
                subtitle: '',
                description: '',
                link: '',
                cta: '',
                order: carousels.length,
                isActive: true
            });
            setPreviewUrl(null);
        }
        setSelectedFile(null);
        setIsModalOpen(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            data.append(key, value.toString());
        });
        if (selectedFile) {
            data.append('image', selectedFile);
        }

        try {
            if (editingCarousel) {
                await axios.put(`${apiBaseUrl}/carousel/${editingCarousel.id}`, data, {
                    withCredentials: true,
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Carousel berhasil diperbarui');
            } else {
                await axios.post(`${apiBaseUrl}/carousel`, data, {
                    withCredentials: true,
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Carousel berhasil ditambahkan');
            }
            setIsModalOpen(false);
            fetchCarousels();
        } catch (error: any) {
            console.error('Error saving carousel:', error);
            toast.error(error.response?.data?.message || 'Gagal menyimpan carousel');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus carousel ini?')) return;

        try {
            await axios.delete(`${apiBaseUrl}/carousel/${id}`, {
                withCredentials: true
            });
            toast.success('Carousel berhasil dihapus');
            fetchCarousels();
        } catch (error) {
            console.error('Error deleting carousel:', error);
            toast.error('Gagal menghapus carousel');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Manajemen Carousel</h1>
                    <p className="text-gray-500 mt-1">Kelola gambar slider yang tampil di halaman depan</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-[#1B5E20] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#154618] transition-all shadow-lg active:scale-95"
                >
                    <Plus className="h-5 w-5" />
                    Tambah Carousel
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="h-12 w-12 text-[#1B5E20] animate-spin mb-4" />
                    <p className="text-gray-500 font-medium">Memuat data carousel...</p>
                </div>
            ) : carousels.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200 p-20 text-center">
                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ImageIcon className="h-10 w-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Carousel</h3>
                    <p className="text-gray-500 max-w-xs mx-auto mb-8">Tambahkan carousel pertama Anda untuk menyambut pengunjung di halaman depan.</p>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold hover:bg-black transition-all"
                    >
                        Buat Sekarang
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {carousels.map((item) => (
                        <div key={item.id} className="group bg-white rounded-[2rem] border border-gray-200 overflow-hidden hover:shadow-2xl hover:shadow-[#1B5E20]/5 transition-all duration-300">
                            <div className="aspect-[16/9] relative overflow-hidden bg-gray-100">
                                <img
                                    src={getImageUrl(item.imageUrl) || ''}
                                    alt={item.title || 'Carousel'}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${item.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                                        {item.isActive ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                    <span className="px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-gray-900 text-[10px] font-black shadow-sm">
                                        Urutan: {item.order}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="font-black text-gray-900 text-sm mb-1 truncate">{item.title || 'Tanpa Judul'}</h3>
                                <p className="text-gray-500 text-xs mb-4 line-clamp-2 min-h-[2rem]">
                                    {item.description || 'Tidak ada deskripsi'}
                                </p>
                                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => handleOpenModal(item)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-gray-50 text-gray-600 px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-gray-100 transition-all active:scale-95"
                                    >
                                        <Edit2 className="h-3.5 w-3.5" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="flex items-center justify-center bg-red-50 text-red-600 p-2.5 rounded-xl hover:bg-red-100 transition-all active:scale-95"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col">
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <h2 className="text-2xl font-black text-gray-900">
                                {editingCarousel ? 'Edit Carousel' : 'Tambah Carousel Baru'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                                <X className="h-6 w-6 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar space-y-6">
                            {/* Image Upload Area */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Gambar Hero (Landscape Recommended)</label>
                                <div className="relative group">
                                    {previewUrl ? (
                                        <div className="aspect-[21/9] rounded-3xl overflow-hidden border-2 border-gray-100 relative shadow-inner">
                                            <img src={previewUrl} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedFile(null);
                                                        setPreviewUrl(editingCarousel ? getImageUrl(editingCarousel.imageUrl) : null);
                                                    }}
                                                    className="bg-white text-gray-900 px-6 py-2 rounded-full font-bold text-xs"
                                                >
                                                    Ganti Gambar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="aspect-[21/9] rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-[#1B5E20] hover:bg-green-50 transition-all group">
                                            <div className="bg-gray-50 p-4 rounded-2xl mb-4 group-hover:bg-[#1B5E20] transition-all">
                                                <Plus className="h-8 w-8 text-gray-300 group-hover:text-white" />
                                            </div>
                                            <span className="text-gray-500 font-bold">Pilih File Gambar</span>
                                            <span className="text-gray-400 text-[10px] mt-1">Saran: 1920x1080px | Max 5MB</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                        </label>
                                    )}
                                    {previewUrl && (
                                        <input type="file" className="hidden" id="change-image" accept="image/*" onChange={handleFileChange} />
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Judul Utama</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1B5E20] focus:border-transparent outline-none transition-all text-sm font-bold text-gray-900"
                                        placeholder="Contoh: Masakan Rumah..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Subtitle</label>
                                    <input
                                        type="text"
                                        value={formData.subtitle}
                                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1B5E20] focus:border-transparent outline-none transition-all text-sm font-bold text-gray-900"
                                        placeholder="Contoh: FRESH & DAILY"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Deskripsi Singkat</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1B5E20] focus:border-transparent outline-none transition-all text-sm font-bold text-gray-900 h-24 resize-none"
                                    placeholder="Ceritakan sedikit tentang slide ini..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Text Tombol (CTA)</label>
                                    <input
                                        type="text"
                                        value={formData.cta}
                                        onChange={(e) => setFormData({ ...formData, cta: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1B5E20] focus:border-transparent outline-none transition-all text-sm font-bold text-gray-900"
                                        placeholder="Contoh: Pesan Sekarang"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Link Tujuan</label>
                                    <input
                                        type="text"
                                        value={formData.link}
                                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1B5E20] focus:border-transparent outline-none transition-all text-sm font-bold text-gray-900"
                                        placeholder="Contoh: /category/makanan"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="space-y-2 flex-1">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest line-clamp-1">Urutan Tampil</label>
                                        <input
                                            type="number"
                                            value={formData.order}
                                            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                            className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1B5E20] focus:border-transparent outline-none transition-all text-sm font-bold text-gray-900"
                                        />
                                    </div>
                                    <div className="space-y-2 flex-1 pt-6">
                                        <label className="relative inline-flex items-center cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={formData.isActive}
                                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#1B5E20]"></div>
                                            <span className="ml-3 text-xs font-black text-gray-500 uppercase tracking-wider group-hover:text-gray-900 transition-colors">Aktif</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="flex items-end justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-6 py-3 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all text-sm"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={formLoading}
                                        className="bg-[#1B5E20] text-white px-10 py-3 rounded-2xl font-bold hover:bg-[#154618] transition-all shadow-lg shadow-green-100 flex items-center gap-2 active:scale-95 disabled:opacity-70"
                                    >
                                        {formLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                        {editingCarousel ? 'Simpan Perubahan' : 'Terbitkan Slide'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
