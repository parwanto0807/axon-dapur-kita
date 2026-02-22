'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
    Search, Plus, Loader2, Pencil, Trash2, X, Save,
    Scale, ChevronDown, ChevronUp, RefreshCw, Layers
} from 'lucide-react';

interface Unit {
    id: string;
    name: string;
    symbol: string | null;
    group: string | null;
    subGroup: string | null;
    isFractionAllowed: boolean;
    decimalPlaces: number;
    conversionBase: string | null;
    conversionRate: number | null;
    _count: { products: number };
}

const UNIT_GROUPS = ['BERAT', 'VOLUME', 'KEMASAN', 'HITUNG', 'KHUSUS', 'GROSIR', 'FROZEN', 'BAHAN BAKU'];

const GROUP_COLORS: Record<string, string> = {
    'BERAT': 'bg-blue-50 text-blue-700 border-blue-100',
    'VOLUME': 'bg-cyan-50 text-cyan-700 border-cyan-100',
    'KEMASAN': 'bg-purple-50 text-purple-700 border-purple-100',
    'HITUNG': 'bg-green-50 text-green-700 border-green-100',
    'KHUSUS': 'bg-orange-50 text-orange-700 border-orange-100',
    'GROSIR': 'bg-yellow-50 text-yellow-700 border-yellow-100',
    'FROZEN': 'bg-indigo-50 text-indigo-700 border-indigo-100',
    'BAHAN BAKU': 'bg-rose-50 text-rose-700 border-rose-100',
};

const GROUP_ICONS: Record<string, string> = {
    'BERAT': '⚖️', 'VOLUME': '💧', 'KEMASAN': '📦', 'HITUNG': '🔢',
    'KHUSUS': '✨', 'GROSIR': '🏭', 'FROZEN': '❄️', 'BAHAN BAKU': '🌿',
};

const emptyForm = {
    name: '', symbol: '', group: '', subGroup: '',
    isFractionAllowed: false, decimalPlaces: 0,
    conversionBase: '', conversionRate: '',
};

export default function AdminUnitsPage() {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';

    const [units, setUnits] = useState<Unit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [groupFilter, setGroupFilter] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [formLoading, setFormLoading] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(UNIT_GROUPS));
    const nameInputRef = useRef<HTMLInputElement>(null);

    // ─── Fetch ───────────────────────────────────────────────────────────────
    const fetchUnits = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`${apiBaseUrl}/units`, { withCredentials: true });
            setUnits(res.data);
        } catch {
            toast.error('Gagal memuat data satuan');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchUnits(); }, []);

    // ─── Modal helpers ────────────────────────────────────────────────────────
    const openAddModal = () => {
        setEditingUnit(null);
        setForm(emptyForm);
        setIsModalOpen(true);
        setTimeout(() => nameInputRef.current?.focus(), 50);
    };

    const openEditModal = (unit: Unit) => {
        setEditingUnit(unit);
        setForm({
            name: unit.name,
            symbol: unit.symbol || '',
            group: unit.group || '',
            subGroup: unit.subGroup || '',
            isFractionAllowed: unit.isFractionAllowed,
            decimalPlaces: unit.decimalPlaces,
            conversionBase: unit.conversionBase || '',
            conversionRate: unit.conversionRate?.toString() || '',
        });
        setIsModalOpen(true);
        setTimeout(() => nameInputRef.current?.focus(), 50);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUnit(null);
        setForm(emptyForm);
    };

    // ─── CRUD ─────────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) return;
        setFormLoading(true);
        const toastId = toast.loading(editingUnit ? 'Memperbarui satuan...' : 'Menambahkan satuan...');
        try {
            const payload = {
                ...form,
                isFractionAllowed: form.isFractionAllowed,
                decimalPlaces: Number(form.decimalPlaces),
                conversionRate: form.conversionRate ? Number(form.conversionRate) : null,
                conversionBase: form.conversionBase || null,
                group: form.group || null,
                subGroup: form.subGroup || null,
                symbol: form.symbol || null,
            };

            if (editingUnit) {
                await axios.put(`${apiBaseUrl}/units/${editingUnit.id}`, payload, { withCredentials: true });
                toast.success('Satuan diperbarui', { id: toastId });
            } else {
                await axios.post(`${apiBaseUrl}/units`, payload, { withCredentials: true });
                toast.success('Satuan ditambahkan', { id: toastId });
            }
            closeModal();
            fetchUnits();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Gagal menyimpan satuan', { id: toastId });
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (unit: Unit) => {
        if (unit._count.products > 0) {
            toast.error(`Tidak bisa hapus — digunakan oleh ${unit._count.products} produk`);
            return;
        }
        if (!confirm(`Hapus satuan "${unit.name}"?`)) return;
        setActionLoading(unit.id);
        const toastId = toast.loading('Menghapus...');
        try {
            await axios.delete(`${apiBaseUrl}/units/${unit.id}`, { withCredentials: true });
            toast.success('Satuan dihapus', { id: toastId });
            fetchUnits();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Gagal menghapus', { id: toastId });
        } finally {
            setActionLoading(null);
        }
    };

    // ─── Filter & group ──────────────────────────────────────────────────────
    const filtered = units.filter(u => {
        const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
            (u.symbol && u.symbol.toLowerCase().includes(search.toLowerCase())) ||
            (u.group && u.group.toLowerCase().includes(search.toLowerCase()));
        const matchGroup = !groupFilter || u.group === groupFilter;
        return matchSearch && matchGroup;
    });

    const byGroup = filtered.reduce<Record<string, Unit[]>>((acc, u) => {
        const g = u.group || 'LAINNYA';
        if (!acc[g]) acc[g] = [];
        acc[g].push(u);
        return acc;
    }, {});

    const toggleGroup = (group: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(group)) next.delete(group); else next.add(group);
            return next;
        });
    };

    // ─── Stats ───────────────────────────────────────────────────────────────
    const totalProducts = units.reduce((s, u) => s + u._count.products, 0);
    const fractionUnits = units.filter(u => u.isFractionAllowed).length;
    const groups = [...new Set(units.map(u => u.group).filter(Boolean))];

    // ─── Render ──────────────────────────────────────────────────────────────
    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-sm sm:text-2xl font-black text-gray-900 uppercase tracking-tight">Kelola Satuan</h1>
                    <p className="text-[10px] sm:text-sm text-gray-400 font-medium mt-0.5">
                        {units.length} satuan · {groups.length} grup · {totalProducts} produk terkait
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap w-full sm:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari satuan..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-8 pr-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg text-xs sm:text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full sm:w-48"
                        />
                    </div>
                    {/* Group filter */}
                    <select
                        value={groupFilter}
                        onChange={e => setGroupFilter(e.target.value)}
                        className="py-1.5 sm:py-2 px-2 border border-gray-200 rounded-lg text-xs sm:text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
                    >
                        <option value="">Semua Grup</option>
                        {UNIT_GROUPS.map(g => (
                            <option key={g} value={g}>{GROUP_ICONS[g]} {g}</option>
                        ))}
                    </select>
                    <button
                        onClick={fetchUnits}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className="h-4 w-4 text-gray-400" />
                    </button>
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 bg-blue-800 text-white rounded-lg text-xs sm:text-sm font-black uppercase tracking-widest hover:bg-blue-900 transition-colors shadow-sm shadow-blue-900/20"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Tambah</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                {[
                    { label: 'Total Satuan', value: units.length, color: 'bg-blue-50 text-blue-700', icon: '⚖️' },
                    { label: 'Grup Aktif', value: groups.length, color: 'bg-purple-50 text-purple-700', icon: '🗂️' },
                    { label: 'Boleh Pecahan', value: fractionUnits, color: 'bg-green-50 text-green-700', icon: '½' },
                    { label: 'Produk Terkait', value: totalProducts, color: 'bg-orange-50 text-orange-700', icon: '📦' },
                ].map(s => (
                    <div key={s.label} className="p-3 sm:p-4 rounded-xl border border-gray-100 bg-white flex items-center gap-2 sm:gap-3 shadow-sm">
                        <div className={`p-2 rounded-lg text-base ${s.color}`}>{s.icon}</div>
                        <div>
                            <p className="text-[9px] sm:text-xs font-black text-gray-400 uppercase tracking-widest leading-none">{s.label}</p>
                            <p className="text-sm sm:text-xl font-black text-gray-900 leading-tight">{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table / Group view */}
            {isLoading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
            ) : Object.keys(byGroup).length === 0 ? (
                <div className="text-center py-16 text-gray-400 text-sm font-bold italic">
                    Tidak ada satuan ditemukan
                </div>
            ) : (
                <div className="space-y-3">
                    {Object.entries(byGroup).map(([group, groupUnits]) => {
                        const colorClass = GROUP_COLORS[group] || 'bg-gray-50 text-gray-700 border-gray-100';
                        const icon = GROUP_ICONS[group] || '📁';
                        const isExpanded = expandedGroups.has(group);

                        return (
                            <div key={group} className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                {/* Group header */}
                                <button
                                    onClick={() => toggleGroup(group)}
                                    className="w-full flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest border ${colorClass}`}>
                                            {icon} {group}
                                        </span>
                                        <span className="text-xs font-black text-gray-400">{groupUnits.length} satuan</span>
                                    </div>
                                    {isExpanded
                                        ? <ChevronUp className="h-4 w-4 text-gray-400" />
                                        : <ChevronDown className="h-4 w-4 text-gray-400" />
                                    }
                                </button>

                                {isExpanded && (
                                    <>
                                        {/* Mobile cards */}
                                        <div className="sm:hidden divide-y divide-gray-50 border-t border-gray-50">
                                            {groupUnits.map(unit => (
                                                <div key={unit.id} className="p-3 hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <p className="text-sm font-black text-gray-900">{unit.name}</p>
                                                                {unit.symbol && (
                                                                    <code className="text-[9px] font-mono bg-gray-100 text-gray-500 px-1 py-0.5 rounded">{unit.symbol}</code>
                                                                )}
                                                            </div>
                                                            {unit.subGroup && (
                                                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{unit.subGroup}</p>
                                                            )}
                                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                                {unit.isFractionAllowed && (
                                                                    <span className="text-[8px] font-black text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                                                                        ½ {unit.decimalPlaces} des.
                                                                    </span>
                                                                )}
                                                                {unit.conversionBase && (
                                                                    <span className="text-[8px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                                                                        1 = {unit.conversionRate} {unit.conversionBase}
                                                                    </span>
                                                                )}
                                                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${unit._count.products > 0 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                                                                    {unit._count.products} produk
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 shrink-0 ml-2">
                                                            <button onClick={() => openEditModal(unit)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                                                <Pencil className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(unit)}
                                                                disabled={actionLoading === unit.id || unit._count.products > 0}
                                                                className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                                                                title={unit._count.products > 0 ? 'Hapus produk terlebih dahulu' : 'Hapus'}
                                                            >
                                                                {actionLoading === unit.id
                                                                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                    : <Trash2 className="h-3.5 w-3.5" />
                                                                }
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Desktop table */}
                                        <div className="hidden sm:block overflow-x-auto border-t border-gray-50">
                                            <table className="min-w-full divide-y divide-gray-50">
                                                <thead className="bg-gray-50/50">
                                                    <tr>
                                                        <th className="px-4 py-2.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Nama</th>
                                                        <th className="px-4 py-2.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Simbol</th>
                                                        <th className="px-4 py-2.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Sub-Grup</th>
                                                        <th className="px-4 py-2.5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Pecahan</th>
                                                        <th className="px-4 py-2.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Konversi</th>
                                                        <th className="px-4 py-2.5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Produk</th>
                                                        <th className="px-4 py-2.5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Aksi</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {groupUnits.map(unit => (
                                                        <tr key={unit.id} className="hover:bg-gray-50/50 transition-colors group">
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                <span className="font-bold text-sm text-gray-900">{unit.name}</span>
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                {unit.symbol
                                                                    ? <code className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{unit.symbol}</code>
                                                                    : <span className="text-gray-300 text-xs">—</span>
                                                                }
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                <span className="text-xs text-gray-500 font-medium">{unit.subGroup || '—'}</span>
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                                                {unit.isFractionAllowed ? (
                                                                    <span className="text-xs font-black text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                                                        ✓ {unit.decimalPlaces} des.
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-xs font-bold text-gray-300 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                                                                        Bulat
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                {unit.conversionBase ? (
                                                                    <code className="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                                                        1 = {unit.conversionRate?.toLocaleString()} {unit.conversionBase}
                                                                    </code>
                                                                ) : (
                                                                    <span className="text-gray-300 text-xs">—</span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                                                <span className={`text-xs font-black px-2 py-0.5 rounded-full border ${unit._count.products > 0 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                                                                    {unit._count.products}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-right">
                                                                <div className="flex items-center justify-end gap-1">
                                                                    <button
                                                                        onClick={() => openEditModal(unit)}
                                                                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                                        title="Edit"
                                                                    >
                                                                        <Pencil className="h-4 w-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(unit)}
                                                                        disabled={actionLoading === unit.id || unit._count.products > 0}
                                                                        className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-20 opacity-0 group-hover:opacity-100"
                                                                        title={unit._count.products > 0 ? 'Hapus produk terlebih dahulu' : 'Hapus satuan'}
                                                                    >
                                                                        {actionLoading === unit.id
                                                                            ? <Loader2 className="h-4 w-4 animate-spin" />
                                                                            : <Trash2 className="h-4 w-4" />
                                                                        }
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Add / Edit Modal ── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
                    <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        {/* Modal header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
                            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">
                                {editingUnit ? 'Edit Satuan' : 'Tambah Satuan Baru'}
                            </h2>
                            <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                                <X className="h-4 w-4 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
                            {/* Row 1: Name + Symbol */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Nama Satuan *</label>
                                    <input
                                        ref={nameInputRef}
                                        type="text"
                                        value={form.name}
                                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        placeholder="Contoh: Kilogram"
                                        required
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3.5 text-sm font-bold text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Simbol</label>
                                    <input
                                        type="text"
                                        value={form.symbol}
                                        onChange={e => setForm(f => ({ ...f, symbol: e.target.value }))}
                                        placeholder="kg"
                                        maxLength={10}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3.5 text-sm font-mono text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-center"
                                    />
                                </div>
                            </div>

                            {/* Row 2: Group + SubGroup */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Grup</label>
                                    <select
                                        value={form.group}
                                        onChange={e => setForm(f => ({ ...f, group: e.target.value }))}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3.5 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none"
                                    >
                                        <option value="">— Pilih Grup —</option>
                                        {UNIT_GROUPS.map(g => (
                                            <option key={g} value={g}>{GROUP_ICONS[g]} {g}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Sub-Grup</label>
                                    <input
                                        type="text"
                                        value={form.subGroup}
                                        onChange={e => setForm(f => ({ ...f, subGroup: e.target.value }))}
                                        placeholder="Contoh: Berat Kecil"
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3.5 text-sm font-bold text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Fraction settings */}
                            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <p className="text-xs font-black text-gray-700">Izinkan Pecahan (Desimal)</p>
                                        <p className="text-[9px] text-gray-400 font-medium">Contoh: 0.5 kg, 1.75 liter</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.isFractionAllowed}
                                            onChange={e => setForm(f => ({ ...f, isFractionAllowed: e.target.checked, decimalPlaces: e.target.checked ? (f.decimalPlaces || 2) : 0 }))}
                                            className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                                {form.isFractionAllowed && (
                                    <div className="mt-2">
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Jumlah Desimal</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3].map(d => (
                                                <button
                                                    key={d}
                                                    type="button"
                                                    onClick={() => setForm(f => ({ ...f, decimalPlaces: d }))}
                                                    className={`flex-1 py-1.5 rounded-lg text-xs font-black border transition-all ${form.decimalPlaces === d ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}
                                                >
                                                    {d} {d === 1 ? 'desimal' : 'desimal'}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-[9px] text-gray-400 mt-1">
                                            Preview: {(1.0).toFixed(form.decimalPlaces)} {form.symbol || form.name || 'unit'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Conversion */}
                            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-xs font-black text-gray-700 mb-1">Konversi ke Unit Dasar (Opsional)</p>
                                <p className="text-[9px] text-gray-400 font-medium mb-2.5">Contoh: 1 kg = 1000 gr</p>
                                <div className="grid grid-cols-3 gap-2 items-center">
                                    <div className="text-center">
                                        <span className="text-[9px] text-gray-400 font-black uppercase">1 {form.symbol || form.name || 'unit'} =</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={form.conversionRate}
                                        onChange={e => setForm(f => ({ ...f, conversionRate: e.target.value }))}
                                        placeholder="1000"
                                        min="0"
                                        step="any"
                                        className="rounded-lg border border-gray-200 bg-white py-2 px-2.5 text-sm font-bold text-gray-900 placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-center"
                                    />
                                    <input
                                        type="text"
                                        value={form.conversionBase}
                                        onChange={e => setForm(f => ({ ...f, conversionBase: e.target.value }))}
                                        placeholder="gr"
                                        className="rounded-lg border border-gray-200 bg-white py-2 px-2.5 text-sm font-mono font-bold text-gray-900 placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>

                            {/* Preview */}
                            {form.name && (
                                <div className={`flex items-center gap-3 p-3 rounded-xl border ${GROUP_COLORS[form.group] || 'bg-gray-50 text-gray-700 border-gray-100'}`}>
                                    <span className="text-xl">{GROUP_ICONS[form.group] || '⚖️'}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-black">{form.name}</p>
                                            {form.symbol && <code className="text-[10px] font-mono bg-white/60 px-1.5 py-0.5 rounded">{form.symbol}</code>}
                                        </div>
                                        <p className="text-[9px] font-bold opacity-70">
                                            {form.group || 'No group'} {form.subGroup ? `· ${form.subGroup}` : ''}
                                            {form.isFractionAllowed ? ` · Pecahan (${form.decimalPlaces} des.)` : ' · Bulat'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading || !form.name.trim()}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-800 text-white text-sm font-black uppercase tracking-widest hover:bg-blue-900 transition-colors disabled:opacity-50 shadow-md shadow-blue-900/20"
                                >
                                    {formLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    {editingUnit ? 'Simpan' : 'Tambahkan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
