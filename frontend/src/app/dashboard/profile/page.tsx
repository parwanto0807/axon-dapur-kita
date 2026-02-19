'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from "@/store/authStore";
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Camera, Save, ArrowLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import axios from 'axios';
import MerchantBottomNav from '@/components/merchant/MerchantBottomNav';

export default function UserProfilePage() {
    const { user, isLoggedIn, isLoading: isAuthLoading, login } = useAuthStore();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
        gender: '',
        dateOfBirth: '',
        address: '',
        image: ''
    });

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    const [addresses, setAddresses] = useState<any[]>([]);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [newAddress, setNewAddress] = useState({
        label: '',
        receiverName: '',
        phone: '',
        street: '',
        city: '',
        province: '',
        postalCode: '',
        isMain: false
    });

    useEffect(() => {
        if (isAuthLoading) return;

        if (!isLoggedIn) {
            router.push('/login?redirect=/dashboard/profile');
            return;
        }

        fetchProfile();
        fetchAddresses();
    }, [isLoggedIn, isAuthLoading]);

    const fetchAddresses = async () => {
        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const response = await axios.get(`${apiBaseUrl}/addresses`, { withCredentials: true });
            setAddresses(response.data);
        } catch (err) {
            console.error('Error fetching addresses:', err);
        }
    };

    const fetchProfile = async () => {
        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const response = await axios.get(`${apiBaseUrl}/users/me`, { withCredentials: true });

            if (response.data) {
                setFormData({
                    name: response.data.name || '',
                    email: response.data.email || '',
                    whatsapp: response.data.whatsapp || '',
                    gender: response.data.gender || '',
                    dateOfBirth: response.data.dateOfBirth ? new Date(response.data.dateOfBirth).toISOString().split('T')[0] : '',
                    address: response.data.address || '',
                    image: response.data.image || ''
                });

                if (response.data.image) {
                    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
                    const image = response.data.image;
                    if (image.startsWith('http')) {
                        setPreviewUrl(image);
                    } else {
                        const imagePath = image.startsWith('/') ? image : `/${image}`;
                        setPreviewUrl(`${backendUrl}${imagePath}`);
                    }
                }
            }
        } catch (err: any) {
            console.error('Error fetching profile:', err);
            setError('Gagal mengambil data profil.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setError('Ukuran file maksimal 2MB');
                return;
            }
            setAvatarFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
            setError('');
        }
    };

    const handleAddAddress = async () => {
        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            await axios.post(`${apiBaseUrl}/addresses`, newAddress, { withCredentials: true });
            fetchAddresses();
            setIsAddressModalOpen(false);
            setNewAddress({
                label: '',
                receiverName: '',
                phone: '',
                street: '',
                city: '',
                province: '',
                postalCode: '',
                isMain: false
            });
            setSuccess('Alamat berhasil ditambahkan!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            console.error('Error adding address:', err);
            setError('Gagal menambahkan alamat.');
        }
    };

    const handleDeleteAddress = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus alamat ini?')) return;
        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            await axios.delete(`${apiBaseUrl}/addresses/${id}`, { withCredentials: true });
            fetchAddresses();
            setSuccess('Alamat berhasil dihapus!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            console.error('Error deleting address:', err);
            setError('Gagal menghapus alamat.');
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError('');
        setSuccess('');

        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const data = new FormData();
            data.append('name', formData.name);
            data.append('whatsapp', formData.whatsapp);
            data.append('gender', formData.gender);
            data.append('dateOfBirth', formData.dateOfBirth);
            data.append('address', formData.address);

            if (avatarFile) {
                data.append('image', avatarFile);
            }

            const response = await axios.put(`${apiBaseUrl}/users/me`, data, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Update local auth store so navbar updates immediately
            login(response.data);

            setSuccess('Profil berhasil diperbarui!');

            if (response.data.image) {
                const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
                const image = response.data.image;
                if (image.startsWith('http')) {
                    setPreviewUrl(image);
                } else {
                    const imagePath = image.startsWith('/') ? image : `/${image}`;
                    setPreviewUrl(`${backendUrl}${imagePath}`);
                }
                setAvatarFile(null);
            }

            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            console.error('Error updating profile:', err);
            setError(err.response?.data?.message || 'Gagal memperbarui profil.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 text-[#1B5E20] animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-poppins)]">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-50">
                <div className="max-w-xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <h1 className="font-bold text-gray-900 text-lg uppercase tracking-tight">Profil Saya</h1>
                    </div>
                </div>
            </div>

            <main className="max-w-xl mx-auto px-4 py-8 pb-32">
                {/* Profile Picture Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl bg-gray-100">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <User className="h-16 w-16" />
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 p-3 bg-[#1B5E20] text-white rounded-2xl shadow-lg border-2 border-white hover:scale-105 active:scale-95 transition-all"
                        >
                            <Camera className="h-5 w-5" />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>
                    <p className="mt-4 text-sm text-gray-900 font-bold uppercase tracking-tight">Ketuk kamera untuk ubah foto</p>
                </div>

                {/* Form Section */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm flex items-start space-x-2 animate-in fade-in slide-in-from-top-1">
                            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="p-4 bg-green-50 border border-green-100 text-[#1B5E20] rounded-2xl text-sm flex items-center space-x-2 animate-in fade-in slide-in-from-top-1">
                            <CheckCircle className="h-4 w-4 shrink-0" />
                            <span>{success}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] sm:text-xs font-black text-gray-900 uppercase tracking-widest mb-2 px-1">Nama Lengkap</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#1B5E20] transition-colors" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Masukkan nama Anda"
                                    className="w-full bg-white border border-gray-300 rounded-2xl py-4 pl-12 pr-4 text-sm font-black text-black focus:border-[#1B5E20] focus:ring-4 focus:ring-[#1B5E20]/5 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] sm:text-xs font-black text-black uppercase tracking-widest mb-2 px-1">Email (Akun)</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full bg-gray-100 border border-gray-300 rounded-2xl py-4 pl-12 pr-4 text-sm font-black text-black cursor-not-allowed"
                                />
                            </div>
                            <p className="mt-1.5 text-[10px] text-black px-1 italic font-black uppercase tracking-tight">Email tidak dapat diubah demi keamanan.</p>
                        </div>

                        <div>
                            <label className="block text-[10px] sm:text-xs font-black text-gray-900 uppercase tracking-widest mb-2 px-1">Nomor WhatsApp</label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#1B5E20] transition-colors" />
                                <input
                                    type="text"
                                    name="whatsapp"
                                    value={formData.whatsapp}
                                    onChange={handleChange}
                                    placeholder="Contoh: 08123456789"
                                    className="w-full bg-white border border-gray-300 rounded-2xl py-4 pl-12 pr-4 text-sm font-black text-black focus:border-[#1B5E20] focus:ring-4 focus:ring-[#1B5E20]/5 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] sm:text-xs font-black text-gray-900 uppercase tracking-widest mb-2 px-1">Jenis Kelamin</label>
                            <div className="flex space-x-4">
                                <label className="flex items-center space-x-2 p-3 border rounded-xl cursor-pointer hover:bg-gray-50 flex-1">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="LAKI_LAKI"
                                        checked={formData.gender === 'LAKI_LAKI'}
                                        onChange={handleChange}
                                        className="text-[#1B5E20] focus:ring-[#1B5E20]"
                                    />
                                    <span className="text-sm font-bold text-gray-700">Laki-laki</span>
                                </label>
                                <label className="flex items-center space-x-2 p-3 border rounded-xl cursor-pointer hover:bg-gray-50 flex-1">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="PEREMPUAN"
                                        checked={formData.gender === 'PEREMPUAN'}
                                        onChange={handleChange}
                                        className="text-[#1B5E20] focus:ring-[#1B5E20]"
                                    />
                                    <span className="text-sm font-bold text-gray-700">Perempuan</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] sm:text-xs font-black text-gray-900 uppercase tracking-widest mb-2 px-1">Tanggal Lahir</label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                className="w-full bg-white border border-gray-300 rounded-2xl py-4 px-4 text-sm font-black text-black focus:border-[#1B5E20] focus:ring-4 focus:ring-[#1B5E20]/5 transition-all outline-none"
                            />
                        </div>

                        {/* Address Book Section */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-[10px] sm:text-xs font-black text-gray-900 uppercase tracking-widest px-1">Daftar Alamat</label>
                                <button
                                    onClick={() => setIsAddressModalOpen(true)}
                                    className="text-[10px] font-bold text-[#1B5E20] hover:underline"
                                >
                                    + Tambah Alamat
                                </button>
                            </div>
                            <div className="space-y-3">
                                {addresses.map((addr) => (
                                    <div key={addr.id} className="p-4 border border-gray-200 rounded-2xl bg-gray-50/50 hover:bg-white hover:border-[#1B5E20] transition-colors relative group">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-black text-gray-900">{addr.label}</span>
                                                    {addr.isMain && <span className="px-2 py-0.5 bg-[#1B5E20]/10 text-[#1B5E20] text-[9px] font-bold rounded-full uppercase">Utama</span>}
                                                </div>
                                                <p className="text-sm font-bold text-gray-800">{addr.receiverName}</p>
                                                <p className="text-xs text-gray-600 font-medium">{addr.phone}</p>
                                                <p className="text-xs text-gray-500 mt-1">{addr.street}, {addr.city}, {addr.province}, {addr.postalCode}</p>
                                            </div>
                                            <button onClick={() => handleDeleteAddress(addr.id)} className="text-red-500 hover:text-red-700 p-1">
                                                <span className="text-[10px] font-bold uppercase">Hapus</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {addresses.length === 0 && (
                                    <p className="text-xs text-gray-400 italic text-center py-4">Belum ada alamat tersimpan.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full py-4 bg-[#1B5E20] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-[#1B5E20]/20 hover:bg-green-800 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="h-5 w-5" />
                                    <span>Simpan Perubahan</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Footer Tips */}
                <div className="mt-8 bg-gray-900/5 border border-gray-900/10 rounded-[2rem] p-6 shadow-sm">
                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-2 underline decoration-[#1B5E20] decoration-2 underline-offset-4">Mengapa Profil Penting?</h3>
                    <p className="text-[11px] text-gray-900 leading-relaxed font-bold">
                        Data yang lengkap memudahkan Merchant menghubungi Anda terkait pesanan. Pastikan nomor WhatsApp aktif untuk mendapatkan notifikasi pesanan.
                    </p>
                </div>
            </main>

            <MerchantBottomNav />

            {/* Address Modal */}
            {isAddressModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-black text-gray-900 mb-6 sticky top-0 bg-white">Tambah Alamat Baru</h3>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Label (Rumah, Kantor, dll)"
                                className="w-full p-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/10"
                                value={newAddress.label}
                                onChange={e => setNewAddress({ ...newAddress, label: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Nama Penerima"
                                className="w-full p-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/10"
                                value={newAddress.receiverName}
                                onChange={e => setNewAddress({ ...newAddress, receiverName: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Nomor Telepon"
                                className="w-full p-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/10"
                                value={newAddress.phone}
                                onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                            />
                            <textarea
                                placeholder="Alamat Lengkap (Jalan, No. Rumah, RT/RW)"
                                className="w-full p-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/10 resize-none"
                                rows={2}
                                value={newAddress.street}
                                onChange={e => setNewAddress({ ...newAddress, street: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Kota/Kabupaten"
                                    className="w-full p-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/10"
                                    value={newAddress.city}
                                    onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Provinsi"
                                    className="w-full p-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/10"
                                    value={newAddress.province}
                                    onChange={e => setNewAddress({ ...newAddress, province: e.target.value })}
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="Kode Pos"
                                className="w-full p-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/10"
                                value={newAddress.postalCode}
                                onChange={e => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                            />
                            <label className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded-xl">
                                <input type="checkbox" checked={newAddress.isMain} onChange={e => setNewAddress({ ...newAddress, isMain: e.target.checked })} className="w-4 h-4 accent-[#1B5E20] rounded border-gray-300" />
                                <span className="text-sm font-bold text-gray-700">Jadikan Alamat Utama</span>
                            </label>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setIsAddressModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Batal</button>
                            <button onClick={handleAddAddress} className="flex-1 py-3 text-sm font-bold text-white bg-[#1B5E20] rounded-xl hover:bg-green-800 transition-colors shadow-lg shadow-[#1B5E20]/20">Simpan</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
