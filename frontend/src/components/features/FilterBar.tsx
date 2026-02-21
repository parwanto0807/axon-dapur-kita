'use client';

import React, { useState } from 'react';
import { SlidersHorizontal, ChevronDown, Check, X, ArrowUpNarrowWide, ArrowDownWideNarrow, MapPin } from 'lucide-react';
import { clsx } from 'clsx';

interface FilterBarProps {
    onFilterChange: (filters: FilterState) => void;
    categories: { id: string; name: string; slug: string }[];
}

export interface FilterState {
    sortBy: 'distance' | 'price_low' | 'price_high' | 'rating';
    minPrice?: number;
    maxPrice?: number;
    category?: string;
}

export default function FilterBar({ onFilterChange, categories }: FilterBarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState<FilterState>({
        sortBy: 'distance'
    });

    const sortOptions = [
        { id: 'distance', label: 'Terdekat', icon: MapPin },
        { id: 'price_low', label: 'Harga Terendah', icon: ArrowUpNarrowWide },
        { id: 'price_high', label: 'Harga Tertinggi', icon: ArrowDownWideNarrow },
    ];

    const applyFilters = (newFilters: FilterState) => {
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleSortChange = (sortId: any) => {
        const updated = { ...filters, sortBy: sortId };
        applyFilters(updated);
    };

    return (
        <div className="w-full bg-white border-b border-gray-100 sticky top-[52px] z-[999] shadow-sm">
            <div className="max-w-md mx-auto px-4 py-2 bg-white flex items-center space-x-2 overflow-x-auto scrollbar-hide">
                {/* Sort Quick Select */}
                {sortOptions.map((opt) => {
                    const isActive = filters.sortBy === opt.id;
                    const Icon = opt.icon;
                    return (
                        <button
                            key={opt.id}
                            onClick={() => handleSortChange(opt.id)}
                            className={clsx(
                                "flex items-center space-x-1 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-tighter shrink-0 transition-all",
                                isActive
                                    ? "bg-[#1B5E20] text-white border-[#1B5E20] shadow-sm"
                                    : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"
                            )}
                        >
                            <Icon className="h-3 w-3" />
                            <span>{opt.label}</span>
                        </button>
                    );
                })}

                <div className="h-4 w-[1px] bg-gray-100 shrink-0 mx-1" />

                {/* Filter Trigger */}
                <button
                    onClick={() => setIsOpen(true)}
                    className={clsx(
                        "flex items-center space-x-1 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-tighter shrink-0 transition-all",
                        (filters.minPrice || filters.maxPrice || filters.category)
                            ? "bg-green-50 text-[#1B5E20] border-green-200"
                            : "bg-white text-gray-500 border-gray-100"
                    )}
                >
                    <SlidersHorizontal className="h-3 w-3" />
                    <span>Filter Detail</span>
                    {(filters.minPrice || filters.maxPrice || filters.category) && (
                        <span className="w-1.5 h-1.5 bg-[#1B5E20] rounded-full animate-pulse" />
                    )}
                </button>
            </div>

            {/* Filter Drawer / Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom duration-300">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Filter Lanjutan</h3>
                                <button onClick={() => setIsOpen(false)} className="p-2 bg-gray-50 rounded-full">
                                    <X className="h-4 w-4 text-gray-400" />
                                </button>
                            </div>

                            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                {/* Price Range */}
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Rentang Harga (Rp)</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={filters.minPrice || ''}
                                            onChange={(e) => setFilters({ ...filters, minPrice: parseInt(e.target.value) || undefined })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold focus:ring-1 focus:ring-[#1B5E20] focus:border-transparent outline-none"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={filters.maxPrice || ''}
                                            onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) || undefined })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold focus:ring-1 focus:ring-[#1B5E20] focus:border-transparent outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Category Selection */}
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Kategori</label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setFilters({ ...filters, category: undefined })}
                                            className={clsx(
                                                "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-tight transition-all",
                                                !filters.category ? "bg-[#1B5E20] text-white" : "bg-gray-50 text-gray-500"
                                            )}
                                        >
                                            Semua
                                        </button>
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setFilters({ ...filters, category: cat.slug })}
                                                className={clsx(
                                                    "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-tight transition-all",
                                                    filters.category === cat.slug ? "bg-[#1B5E20] text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                                                )}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button
                                    onClick={() => {
                                        const reset: FilterState = { sortBy: 'distance' };
                                        applyFilters(reset);
                                        setIsOpen(false);
                                    }}
                                    className="flex-1 py-4 border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all"
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={() => {
                                        onFilterChange(filters);
                                        setIsOpen(false);
                                    }}
                                    className="flex-[2] py-4 bg-[#1B5E20] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-900/20 active:scale-95 transition-all"
                                >
                                    Terapkan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
