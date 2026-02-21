'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Navigation, Store, ChevronRight, Info, Target, Layers } from 'lucide-react';
import axios from 'axios';
import { clsx } from 'clsx';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getImageUrl } from '@/utils/image';
import WishlistButton from '@/components/ui/WishlistButton';
import FilterBar, { FilterState } from '@/components/features/FilterBar';

// Dynamically import Leaflet components to avoid SSR errors
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then(mod => mod.Circle), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

// This sub-component helps with re-centering the map
function MapController({ center }: { center: [number, number] }) {
    // We have to import useMap dynamically or use it within a client component inside MapContainer
    // But since this whole page is 'use client', we just need to be careful with SSR.
    return null;
}

interface NearbyProduct {
    id: string;
    name: string;
    price: number;
    distance: number;
    image: string | null;
    shop: {
        name: string;
        slug: string;
        latitude: number;
        longitude: number;
    };
}

export default function NearbyPage() {
    const [radius, setRadius] = useState(2);
    const [isScanning, setIsScanning] = useState(false);
    const [products, setProducts] = useState<NearbyProduct[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [mounted, setMounted] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [filters, setFilters] = useState<FilterState>({ sortBy: 'distance' });

    // Leaflet icons need to be initialized client-side
    const [L, setL] = useState<any>(null);

    const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setMounted(true);
        import('leaflet').then(leaflet => {
            setL(leaflet.default);
            // Fix default icon issues in Leaflet
            delete (leaflet.default.Icon.Default.prototype as any)._getIconUrl;
            leaflet.default.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            });
        });

        // Fetch categories for filtering
        const fetchCategories = async () => {
            try {
                const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';
                const response = await axios.get(`${apiBaseUrl}/categories`);
                setCategories(response.data);
            } catch (err) {
                console.error("Failed to fetch categories", err);
            }
        };
        fetchCategories();
    }, []);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    const handleScan = async () => {
        setIsScanning(true);
        setProducts([]);
        setError(null);

        if (!navigator.geolocation) {
            setError('Geolocation tidak didukung oleh browser Anda.');
            setIsScanning(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ lat: latitude, lng: longitude });

                try {
                    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api'}/products/nearby`, {
                        params: {
                            lat: latitude,
                            lng: longitude,
                            radius: radius
                        }
                    });

                    scanTimeoutRef.current = setTimeout(() => {
                        setProducts(response.data);
                        setIsScanning(false);
                    }, 2000);
                } catch (err: any) {
                    setError('Gagal mencari produk di sekitar Anda.');
                    setIsScanning(false);
                }
            },
            (err) => {
                setError('Akses lokasi ditolak. Harap aktifkan lokasi untuk mencari produk terdekat.');
                setIsScanning(false);
            },
            { enableHighAccuracy: true }
        );
    };

    const filteredProducts = products.filter(product => {
        // Price filter
        if (filters.minPrice && product.price < filters.minPrice) return false;
        if (filters.maxPrice && product.price > filters.maxPrice) return false;

        // Category filter
        // Note: NearbyProduct needs to include category info if we want to filter by it.
        // For now, if category is selected, we filter by shop or product name containing category name (fallback)
        // or just skip if the data model doesn't support it yet.

        return true;
    }).sort((a, b) => {
        if (filters.sortBy === 'price_low') return a.price - b.price;
        if (filters.sortBy === 'price_high') return b.price - a.price;
        if (filters.sortBy === 'distance') return a.distance - b.distance;
        return 0;
    });

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-24 font-[family-name:var(--font-poppins)]">
            {/* Header */}
            <header className="sticky top-0 z-[1000] bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3 shadow-sm">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="bg-[#1B5E20] p-1.5 rounded-lg">
                            <Target className="h-4 w-4 text-white" />
                        </div>
                        <h1 className="font-black text-lg text-gray-900 tracking-tighter uppercase leading-none">Radius Scan</h1>
                    </div>
                    <div className="flex items-center space-x-1 bg-[#1B5E20]/5 px-2.5 py-1 rounded-full border border-[#1B5E20]/10">
                        <MapPin className="h-3 w-3 text-[#1B5E20]" />
                        <span className="text-[10px] font-black text-[#1B5E20] uppercase">{radius} km</span>
                    </div>
                </div>
            </header>

            <main className="max-w-md mx-auto">
                {/* Map Display Area */}
                <div className="relative h-[45vh] w-full bg-gray-200 overflow-hidden shadow-inner">
                    {mounted && location && L && (
                        <MapContainer
                            center={[location.lat, location.lng]}
                            zoom={14}
                            style={{ height: '100%', width: '100%' }}
                            zoomControl={false}
                        >
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                            />

                            {/* User Position */}
                            <Marker position={[location.lat, location.lng]}>
                                <Popup>
                                    <div className="text-center font-bold text-[10px] uppercase">Lokasi Anda</div>
                                </Popup>
                            </Marker>

                            {/* Scan Radius */}
                            <Circle
                                center={[location.lat, location.lng]}
                                radius={radius * 1000}
                                pathOptions={{
                                    color: '#1B5E20',
                                    fillColor: '#1B5E20',
                                    fillOpacity: isScanning ? 0.2 : 0.1,
                                    weight: 1
                                }}
                            />

                            {/* Found Shops Markers */}
                            {!isScanning && products.length > 0 && Array.from(new Set(products.map(p => p.shop.slug))).map(slug => {
                                const product = products.find(p => p.shop.slug === slug);
                                if (!product || !product.shop.latitude) return null;
                                return (
                                    <Marker
                                        key={slug}
                                        position={[product.shop.latitude, product.shop.longitude]}
                                        icon={L.icon({
                                            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
                                            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                                            iconSize: [25, 41],
                                            iconAnchor: [12, 41],
                                            popupAnchor: [1, -34],
                                            shadowSize: [41, 41]
                                        })}
                                    >
                                        <Popup>
                                            <div className="p-1">
                                                <p className="font-black text-[10px] uppercase text-[#1B5E20] leading-none mb-1">{product.shop.name}</p>
                                                <p className="text-[9px] font-bold text-gray-500">{products.filter(p => p.shop.slug === slug).length} Produk</p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                );
                            })}
                        </MapContainer>
                    )}

                    {/* Radar Overlay (Scanner Animation on top of Map) */}
                    {isScanning && (
                        <div className="absolute inset-0 z-[1001] pointer-events-none flex items-center justify-center overflow-hidden">
                            <div className="relative w-full h-full max-w-full max-h-full opacity-60">
                                {/* Rotating Scanner Gradient */}
                                <div
                                    className="absolute inset-0 animate-[spin_3s_linear_infinite]"
                                    style={{
                                        background: 'conic-gradient(from 0deg, #1B5E20 0%, transparent 35%, transparent 100%)',
                                    }}
                                />
                                {/* Sharp Scanning Line */}
                                <div
                                    className="absolute top-0 left-1/2 w-[1.5px] h-1/2 bg-[#1B5E20] origin-bottom animate-[spin_3s_linear_infinite] shadow-[0_0_20px_#1B5E20]"
                                />

                                {/* Static Grid Circles */}
                                <div className="absolute inset-0 border border-[#1B5E20]/10 rounded-full scale-[0.25]" />
                                <div className="absolute inset-0 border border-[#1B5E20]/10 rounded-full scale-50" />
                                <div className="absolute inset-0 border border-[#1B5E20]/10 rounded-full scale-75" />
                                <div className="absolute inset-0 border border-[#1B5E20]/10 rounded-full scale-100" />
                            </div>
                        </div>
                    )}

                    {/* Scan Status Overlay */}
                    {isScanning && (
                        <div className="absolute inset-0 z-[1002] bg-white/20 backdrop-blur-[1px] flex items-center justify-center">
                            <div className="bg-[#1B5E20] text-white px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl animate-pulse flex items-center space-x-2">
                                <div className="h-2 w-2 bg-white rounded-full animate-ping" />
                                <span>Menganalisa Area...</span>
                            </div>
                        </div>
                    )}

                    {!location && (
                        <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center p-8 text-center space-y-4">
                            <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-200 animate-bounce">
                                <Navigation className="h-8 w-8 text-[#1B5E20]" />
                            </div>
                            <div>
                                <h3 className="font-black text-gray-900 uppercase text-xs tracking-tighter">Izin Lokasi Diperlukan</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed mt-2">
                                    Aktifkan GPS untuk melihat peta dan mencari produk di sekitar Anda
                                </p>
                            </div>
                            <button
                                onClick={handleScan}
                                className="px-6 py-2.5 bg-[#1B5E20] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-green-900/20 active:scale-95 transition-all"
                            >
                                Cari Lokasi Saya
                            </button>
                        </div>
                    )}
                </div>

                {/* Floating Controls */}
                <div className="px-4 -mt-10 relative z-[1005]">
                    <div className="bg-white rounded-3xl p-5 shadow-[0_15px_40px_rgb(0,0,0,0.1)] border border-gray-100 space-y-5">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Radius Scan</span>
                                <div className="flex items-center space-x-2">
                                    <span className="text-lg font-black text-[#1B5E20]">{radius}</span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Km</span>
                                </div>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="6"
                                step="0.5"
                                value={radius}
                                onChange={(e) => setRadius(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#1B5E20]"
                                disabled={isScanning}
                            />
                            <div className="flex justify-between text-[8px] font-black text-gray-300 uppercase letter-spacing-widest">
                                <span>1 km</span>
                                <div className="flex space-x-1">
                                    {[1, 2, 3, 4, 5, 6].map(i => <span key={i} className={clsx("w-0.5 h-1 rounded-full", radius >= i ? "bg-[#1B5E20]" : "bg-gray-200")} />)}
                                </div>
                                <span>6 km</span>
                            </div>
                        </div>

                        <button
                            onClick={handleScan}
                            disabled={isScanning}
                            className={clsx(
                                "w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-[0_8px_25px_rgba(27,94,32,0.3)] active:scale-95 flex items-center justify-center space-x-3",
                                isScanning
                                    ? "bg-gray-50 text-gray-400 cursor-not-allowed shadow-none"
                                    : "bg-[#1B5E20] text-white hover:bg-green-800"
                            )}
                        >
                            {isScanning ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                    <span>Scanning Area...</span>
                                </>
                            ) : (
                                <>
                                    <Search className="h-4 w-4" />
                                    <span>Scan Market Sekarang</span>
                                </>
                            )}
                        </button>
                    </div>

                    {error && (
                        <div className="mt-4 flex items-center space-x-2 bg-red-50 p-3 rounded-2xl border border-red-100 animate-in fade-in slide-in-from-top-2 duration-300">
                            <Info className="h-4 w-4 text-red-500 shrink-0" />
                            <p className="text-[10px] font-bold text-red-700 uppercase tracking-tight leading-none">{error}</p>
                        </div>
                    )}
                </div>

                {/* Filter Bar Integration */}
                {!isScanning && products.length > 0 && (
                    <div className="mt-6">
                        <FilterBar
                            categories={categories}
                            onFilterChange={(newFilters) => setFilters(newFilters)}
                        />
                    </div>
                )}

                {/* Results List */}
                <div className="px-4 pt-8 space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest flex items-center space-x-2">
                            <span>Hasil Pencarian</span>
                            {!isScanning && filteredProducts.length > 0 && (
                                <span className="bg-[#1B5E20] text-white px-2 py-0.5 rounded-md text-[9px]">{filteredProducts.length}</span>
                            )}
                        </h2>
                        {!isScanning && filteredProducts.length > 0 && (
                            <div className="flex items-center space-x-1">
                                <Layers className="h-3 w-3 text-gray-400" />
                                <span className="text-[9px] font-bold text-gray-400 uppercase">
                                    {filters.sortBy === 'distance' ? 'Sort Jarak' : filters.sortBy === 'price_low' ? 'Harga Rendah' : 'Harga Tinggi'}
                                </span>
                            </div>
                        )}
                    </div>

                    {!isScanning && filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2.5 pb-20">
                            {filteredProducts.map((product) => (
                                <div className="bg-white border border-gray-100 rounded-2xl p-2.5 flex items-center space-x-4 hover:border-[#1B5E20] transition-all group shadow-sm active:scale-[0.98]">
                                    <Link
                                        href={`/product/${product.id}`}
                                        className="flex items-center space-x-4 flex-1 min-w-0"
                                    >
                                        <div className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100 relative">
                                            {product.image ? (
                                                <img
                                                    src={getImageUrl(product.image) || ''}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <Store className="h-6 w-6" />
                                                </div>
                                            )}
                                            <div className="absolute top-1 left-1 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-lg border border-gray-100">
                                                <span className="text-[8px] font-black text-[#1B5E20] leading-none uppercase">{product.distance.toFixed(1)} km</span>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0 pr-2">
                                            <div className="flex items-center space-x-1.5 mb-1">
                                                <Store className="h-2.5 w-2.5 text-gray-400" />
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider truncate">{product.shop.name}</span>
                                            </div>
                                            <h4 className="font-black text-xs text-gray-900 uppercase tracking-tighter truncate mb-1.5 group-hover:text-[#1B5E20] transition-colors">{product.name}</h4>
                                            <div className="flex items-baseline space-x-1">
                                                <span className="text-[10px] font-black text-[#1B5E20]">{formatPrice(product.price)}</span>
                                            </div>
                                        </div>
                                    </Link>
                                    <div className="flex items-center space-x-2">
                                        <WishlistButton
                                            product={{
                                                id: product.id,
                                                name: product.name,
                                                price: product.price,
                                                image: product.image,
                                                shop: {
                                                    id: product.shop.slug,
                                                    name: product.shop.name
                                                }
                                            }}
                                            className="h-8 w-8"
                                            iconClassName="h-4 w-4"
                                        />
                                        <Link href={`/product/${product.id}`} className="bg-gray-50 p-2 rounded-xl group-hover:bg-[#1B5E20]/10 transition-colors">
                                            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#1B5E20] transition-colors" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : !isScanning && !error && location && (
                        <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200 flex flex-col items-center justify-center px-8">
                            <div className="bg-gray-50 p-6 rounded-full mb-4">
                                <Search className="h-10 w-10 text-gray-200" />
                            </div>
                            <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">Tidak Ada Produk</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed mt-2">
                                Coba perbesar radius scan Anda untuk menemukan produk UMKM di area lain
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {/* CSS for custom markers and animations */}
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="" />
            <style jsx global>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .leaflet-container {
                    background: #f8fafc !important;
                }
                .leaflet-popup-content-wrapper {
                    border-radius: 12px !important;
                    padding: 0 !important;
                    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1) !important;
                }
                .leaflet-popup-content {
                    margin: 8px 12px !important;
                    line-height: 1 !important;
                }
                .leaflet-bar {
                    border: none !important;
                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important;
                }
                .leaflet-bar a {
                    background-color: white !important;
                    color: #1B5E20 !important;
                    border: 1px solid #f1f5f9 !important;
                }
            `}</style>
        </div>
    );
}
