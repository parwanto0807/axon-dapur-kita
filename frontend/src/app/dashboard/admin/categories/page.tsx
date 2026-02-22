'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
    Search, Plus, Loader2, Tag, Pencil, Trash2, X,
    ChevronDown, FolderTree, FolderOpen, Save, Layers,
    ChevronRight, LayoutGrid, Info, CheckCircle2, AlertCircle,
    CookingPot, Soup, Cookie, Croissant, CupSoda, Utensils,
    Fish, Wheat, Package, Leaf, Snowflake as Ice, Sparkles, ChefHat
} from 'lucide-react';
import { clsx } from 'clsx';

interface Category {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    parentId: string | null;
    parent: { name: string; slug: string } | null;
    _count: { products: number };
    children?: Category[];
}

const AVAILABLE_ICONS = [
    { name: 'CookingPot', icon: CookingPot, label: 'Makanan Berat' },
    { name: 'Soup', icon: Soup, label: 'Berkuah' },
    { name: 'Cookie', icon: Cookie, label: 'Camilan' },
    { name: 'Croissant', icon: Croissant, label: 'Kue' },
    { name: 'CupSoda', icon: CupSoda, label: 'Minuman' },
    { name: 'Utensils', icon: Utensils, label: 'Bumbu' },
    { name: 'Fish', icon: Fish, label: 'Lauk Mentah' },
    { name: 'Wheat', icon: Wheat, label: 'Bahan Pokok' },
    { name: 'Ice', icon: Ice, label: 'Frozen' },
    { name: 'Package', icon: Package, label: 'Paket' },
    { name: 'Leaf', icon: Leaf, label: 'Jamu' },
    { name: 'ChefHat', icon: ChefHat, label: 'Katering' },
    { name: 'Sparkles', icon: Sparkles, label: 'Lainnya' },
];

export default function AdminCategoriesPage() {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';

    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // Form state
    const [formName, setFormName] = useState('');
    const [formSlug, setFormSlug] = useState('');
    const [formIcon, setFormIcon] = useState('');
    const [formParentId, setFormParentId] = useState('');
    const [formLoading, setFormLoading] = useState(false);
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

    const nameInputRef = useRef<HTMLInputElement>(null);

    // ─── Data Fetching ───────────────────────────────────────────────
    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`${apiBaseUrl}/categories/all`, { withCredentials: true });
            setCategories(res.data);

            // Auto expand parents that have search matches in children
            if (search) {
                const parentsToExpand = new Set<string>();
                res.data.forEach((cat: Category) => {
                    if (cat.parentId && (
                        cat.name.toLowerCase().includes(search.toLowerCase()) ||
                        cat.slug.toLowerCase().includes(search.toLowerCase())
                    )) {
                        parentsToExpand.add(cat.parentId);
                    }
                });
                setExpandedParents(parentsToExpand);
            }
        } catch {
            toast.error('Gagal memuat kategori');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    // ─── Slug auto-generate ──────────────────────────────────────────
    useEffect(() => {
        if (!slugManuallyEdited && formName) {
            setFormSlug(
                formName.toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, '')
                    .trim()
                    .replace(/\s+/g, '-')
            );
        }
    }, [formName, slugManuallyEdited]);

    // ─── Hierarchy Logic ─────────────────────────────────────────────
    const rootCategories = categories.filter(c => !c.parentId);
    const getChildren = (parentId: string) => categories.filter(c => c.parentId === parentId);

    const toggleParent = (id: string) => {
        const newExpanded = new Set(expandedParents);
        if (newExpanded.has(id)) newExpanded.delete(id);
        else newExpanded.add(id);
        setExpandedParents(newExpanded);
    };

    const toggleAllParents = (expand: boolean) => {
        if (expand) setExpandedParents(new Set(rootCategories.map(c => c.id)));
        else setExpandedParents(new Set());
    };

    // ─── Stats ───────────────────────────────────────────────────────
    const stats = {
        total: categories.length,
        root: rootCategories.length,
        subs: categories.length - rootCategories.length,
        products: categories.reduce((sum, c) => sum + (c._count?.products || 0), 0)
    };

    // ─── Open modal ──────────────────────────────────────────────────
    const openAddModal = (parentId: string = '') => {
        setEditingCategory(null);
        setFormName(''); setFormSlug(''); setFormIcon('Sparkles'); setFormParentId(parentId);
        setSlugManuallyEdited(false);
        setIsModalOpen(true);
        setTimeout(() => nameInputRef.current?.focus(), 50);
    };

    const openEditModal = (cat: Category) => {
        setEditingCategory(cat);
        setFormName(cat.name);
        setFormSlug(cat.slug);
        setFormIcon(cat.icon || 'Sparkles');
        setFormParentId(cat.parentId || '');
        setSlugManuallyEdited(true);
        setIsModalOpen(true);
        setTimeout(() => nameInputRef.current?.focus(), 50);
    };

    // ─── Submit ──────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formName.trim()) return;
        setFormLoading(true);
        const toastId = toast.loading(editingCategory ? 'Memperbarui...' : 'Menyimpan...');
        try {
            const payload = {
                name: formName.trim(),
                slug: formSlug.trim(),
                icon: formIcon.trim() || null,
                parentId: formParentId || null,
            };

            if (editingCategory) {
                await axios.put(`${apiBaseUrl}/categories/${editingCategory.id}`, payload, { withCredentials: true });
                toast.success('Kategori diperbarui', { id: toastId });
            } else {
                await axios.post(`${apiBaseUrl}/categories`, payload, { withCredentials: true });
                toast.success('Kategori ditambahkan', { id: toastId });
            }
            setIsModalOpen(false);
            fetchCategories();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Gagal menyimpan kategori', { id: toastId });
        } finally {
            setFormLoading(false);
        }
    };

    // ─── Delete ──────────────────────────────────────────────────────
    const handleDelete = async (cat: Category) => {
        const hasChildren = categories.some(c => c.parentId === cat.id);
        if (hasChildren) {
            toast.error('Tidak bisa hapus — kategori ini memiliki sub-kategori');
            return;
        }
        if (cat._count.products > 0) {
            toast.error(`Tidak bisa hapus — kategori digunakan oleh ${cat._count.products} produk`);
            return;
        }
        if (!confirm(`Hapus kategori "${cat.name}"?`)) return;
        setActionLoading(cat.id);
        const toastId = toast.loading('Menghapus...');
        try {
            await axios.delete(`${apiBaseUrl}/categories/${cat.id}`, { withCredentials: true });
            toast.success('Kategori dihapus', { id: toastId });
            fetchCategories();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Gagal menghapus', { id: toastId });
        } finally {
            setActionLoading(null);
        }
    };

    // ─── Render Icon ─────────────────────────────────────────────────
    const CategoryIcon = ({ iconName, className }: { iconName: string | null, className?: string }) => {
        const match = AVAILABLE_ICONS.find(i => i.name === iconName);
        const Icon = match ? match.icon : Sparkles;
        return <Icon className={className} />;
    };

    // ─── Filter ──────────────────────────────────────────────────────
    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.slug.toLowerCase().includes(search.toLowerCase())
    );

    // Filter root categories that either match search themselves OR have a child that matches
    const visibleRootCategories = rootCategories.filter(root => {
        if (root.name.toLowerCase().includes(search.toLowerCase())) return true;
        if (root.slug.toLowerCase().includes(search.toLowerCase())) return true;
        return getChildren(root.id).some(child =>
            child.name.toLowerCase().includes(search.toLowerCase()) ||
            child.slug.toLowerCase().includes(search.toLowerCase())
        );
    });

    return (
        <div className="space-y-4 sm:space-y-6 font-[family-name:var(--font-poppins)] pb-10">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-800 p-2.5 rounded-2xl shadow-lg shadow-blue-900/20">
                        <Layers className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                            Kelola Kategori
                        </h1>
                        <p className="text-xs text-gray-400 font-medium">Struktur dan organisasi produk di marketplace</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => openAddModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-800 text-white rounded-xl text-sm font-black uppercase tracking-wider hover:bg-blue-900 transition-all shadow-lg shadow-blue-900/20 active:scale-95 shrink-0"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Kategori</span>
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[
                    { label: 'Total', value: stats.total, icon: Layers, color: 'blue' },
                    { label: 'Induk', value: stats.root, icon: FolderTree, color: 'indigo' },
                    { label: 'Sub', value: stats.subs, icon: FolderOpen, color: 'purple' },
                    { label: 'Produk Terkait', value: stats.products, icon: Tag, color: 'emerald' },
                ].map((s) => (
                    <div key={s.label} className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4 group hover:border-blue-100 transition-colors">
                        <div className={`p-2 sm:p-3 rounded-xl bg-${s.color}-50 text-${s.color}-600 group-hover:scale-110 transition-transform`}>
                            <s.icon className="h-4 w-4 sm:h-6 sm:w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
                            <p className="text-lg sm:text-2xl font-black text-gray-900 leading-none mt-1">{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    <button
                        onClick={() => toggleAllParents(true)}
                        className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest"
                    >
                        Buka Semua
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                        onClick={() => toggleAllParents(false)}
                        className="text-[10px] font-black text-gray-400 hover:underline uppercase tracking-widest"
                    >
                        Tutup Semua
                    </button>
                </div>
                {search && (
                    <p className="text-[10px] font-bold text-gray-400 italic">
                        Menampilkan {visibleRootCategories.length} kelompok yang cocok
                    </p>
                )}
            </div>

            {/* Categories List (Accordion) */}
            <div className="space-y-3">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <Loader2 className="h-10 w-10 text-blue-800 animate-spin mb-4" />
                        <p className="text-sm font-black text-gray-400 uppercase tracking-widest animate-pulse">Memuat Data...</p>
                    </div>
                ) : visibleRootCategories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <LayoutGrid className="h-12 w-12 text-gray-200 mb-3" />
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest italic">Tidak ada kategori ditemukan</p>
                    </div>
                ) : (
                    visibleRootCategories.map(root => {
                        const isOpen = expandedParents.has(root.id);
                        const children = getChildren(root.id).filter(c =>
                            c.name.toLowerCase().includes(search.toLowerCase()) ||
                            c.slug.toLowerCase().includes(search.toLowerCase())
                        );

                        return (
                            <div key={root.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300">
                                {/* Parent Row */}
                                <div className={clsx(
                                    "px-4 py-3 flex items-center justify-between group transition-colors",
                                    isOpen ? "bg-blue-50/50" : "hover:bg-gray-50 bg-white"
                                )}>
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <button
                                            onClick={() => toggleParent(root.id)}
                                            className={clsx(
                                                "p-1.5 rounded-lg transition-all",
                                                isOpen ? "bg-blue-100 text-blue-800 rotate-90" : "bg-gray-100 text-gray-400"
                                            )}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </button>

                                        <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 flex-shrink-0">
                                            <CategoryIcon iconName={root.icon} className="h-5 w-5 text-blue-800" />
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm sm:text-base font-black text-gray-900 truncate tracking-tight">{root.name}</h3>
                                                <span className="text-[10px] font-black bg-white px-1.5 py-0.5 rounded border border-gray-100 text-gray-400 uppercase">
                                                    {root.slug}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                {children.length} Sub-kategori · {root._count.products} Produk
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 sm:gap-2">
                                        <button
                                            onClick={() => openAddModal(root.id)}
                                            className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-[10px] font-black text-blue-600 hover:bg-blue-100 rounded-lg transition-all uppercase tracking-widest border border-blue-200/50"
                                        >
                                            <Plus className="h-3 w-3" /> Sub
                                        </button>
                                        <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>
                                        <button
                                            onClick={() => openEditModal(root)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(root)}
                                            disabled={children.length > 0 || root._count.products > 0}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-xl transition-all disabled:opacity-20"
                                        >
                                            {actionLoading === root.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Children Container */}
                                {isOpen && (
                                    <div className="border-t border-gray-50 bg-gray-50/30">
                                        {children.length === 0 ? (
                                            <div className="px-14 py-4 text-[10px] font-bold text-gray-400 italic">Belum ada sub-kategori</div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y divide-x divide-gray-50 border-gray-50">
                                                {children.map(child => (
                                                    <div key={child.id} className="px-6 py-4 flex items-center justify-between hover:bg-white transition-all group/child">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0"></div>
                                                            <div className="min-w-0">
                                                                <h4 className="text-sm font-bold text-gray-800 truncate">{child.name}</h4>
                                                                <p className="text-[10px] font-mono text-gray-400">{child.slug}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-1 opacity-0 group-hover/child:opacity-100 transition-opacity">
                                                            <div className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-black text-gray-400 flex items-center gap-1 mr-2">
                                                                <Tag className="h-2.5 w-2.5" /> {child._count.products}
                                                            </div>
                                                            <button
                                                                onClick={() => openEditModal(child)}
                                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                                            >
                                                                <Pencil className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(child)}
                                                                disabled={child._count.products > 0}
                                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-20"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Info Footer */}
            {!isLoading && (
                <div className="flex items-center gap-2 p-4 bg-blue-50 text-blue-800 rounded-3xl border border-blue-100 shadow-sm shadow-blue-900/5">
                    <Info className="h-5 w-5 shrink-0" />
                    <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest leading-snug">
                        Kategori induk yang masih memiliki sub-kategori atau produk tidak dapat dihapus. Pastikan hirarki bersih sebelum menghapus.
                    </p>
                </div>
            )}

            {/* Modal Tambah / Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-900/60 backdrop-blur-sm p-0 sm:p-4">
                    <div className="bg-white w-full sm:max-w-md rounded-t-[2.5rem] sm:rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-300">
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white relative z-10">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight">
                                    {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
                                </h2>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lengkapi Informasi Kategori</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
                            {/* Icon Picker (Lucide) */}
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Pilih Icon Tampilan</label>
                                <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
                                    {AVAILABLE_ICONS.map(item => (
                                        <button
                                            key={item.name}
                                            type="button"
                                            onClick={() => setFormIcon(item.name)}
                                            className={clsx(
                                                "p-2.5 rounded-xl border-2 transition-all group flex flex-col items-center gap-1",
                                                formIcon === item.name
                                                    ? "bg-blue-800 border-blue-800 shadow-lg shadow-blue-800/20 text-white"
                                                    : "bg-gray-50 border-transparent text-gray-400 hover:border-gray-200 hover:bg-white"
                                            )}
                                            title={item.label}
                                        >
                                            <item.icon className="h-5 w-5" />
                                            <span className="text-[8px] font-bold truncate max-w-full">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Name Input */}
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 px-1">Nama Kategori *</label>
                                <input
                                    ref={nameInputRef}
                                    type="text"
                                    value={formName}
                                    onChange={e => setFormName(e.target.value)}
                                    placeholder="Contoh: Makanan Berat"
                                    required
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 placeholder-gray-400 focus:ring-4 focus:ring-blue-800/5 focus:border-blue-800 outline-none transition-all"
                                />
                            </div>

                            {/* Slug Input */}
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 px-1">Slug URL (Otomatis)</label>
                                <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 focus-within:ring-4 focus-within:ring-blue-800/5 transition-all">
                                    <span className="text-gray-400 text-xs font-mono">/</span>
                                    <input
                                        type="text"
                                        value={formSlug}
                                        onChange={e => { setFormSlug(e.target.value); setSlugManuallyEdited(true); }}
                                        placeholder="slug-kategori"
                                        className="bg-transparent border-none p-0 w-full text-sm font-mono text-gray-700 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Parent Selector */}
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 px-1">Level Hirarki</label>
                                <div className="relative">
                                    <select
                                        value={formParentId}
                                        onChange={e => setFormParentId(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 appearance-none focus:ring-4 focus:ring-blue-800/5 outline-none"
                                    >
                                        <option value="">🏠 Kategori Induk (Utama)</option>
                                        {rootCategories
                                            .filter(c => c.id !== editingCategory?.id)
                                            .map(c => (
                                                <option key={c.id} value={c.id}>↳ {c.name}</option>
                                            ))
                                        }
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <ChevronDown className="h-5 w-5" />
                                    </div>
                                </div>
                            </div>

                            {/* Preview Area */}
                            {formName && (
                                <div className="p-4 bg-gradient-to-br from-gray-900 to-slate-800 rounded-[1.5rem] shadow-xl text-white relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                                        <CategoryIcon iconName={formIcon} className="h-16 w-16" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                                                <CategoryIcon iconName={formIcon} className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Live Preview</p>
                                                <h4 className="text-lg font-black tracking-tight">{formName}</h4>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full font-mono">/{formSlug}</span>
                                            {formParentId && (
                                                <span className="text-[9px] bg-blue-500/30 px-2 py-0.5 rounded-full font-bold">
                                                    Sub dari: {rootCategories.find(c => c.id === formParentId)?.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Form Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-sm font-black text-gray-500 hover:bg-gray-50 transition-all uppercase tracking-widest"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading || !formName.trim()}
                                    className="flex-[1.5] flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-blue-800 text-white text-sm font-black uppercase tracking-widest hover:bg-blue-900 transition-all shadow-lg shadow-blue-900/20 active:scale-95 disabled:opacity-50"
                                >
                                    {formLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                    {editingCategory ? 'Simpan' : 'Tambah Kategori'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

