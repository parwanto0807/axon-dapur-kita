'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Lang = 'ID' | 'EN';

const dict = {
    // ── Status Labels ──────────────────────────────────────────
    'status.pending_cod': { ID: 'Pesanan Diterima', EN: 'Order Received' },
    'status.pending_transfer': { ID: 'Menunggu Pembayaran', EN: 'Awaiting Payment' },
    'status.paid': { ID: 'Pembayaran Terkonfirmasi', EN: 'Payment Confirmed' },
    'status.processing': { ID: 'Sedang Diproses', EN: 'Processing' },
    'status.shipped': { ID: 'Sedang Dikirim', EN: 'Out for Delivery' },
    'status.completed': { ID: 'Pesanan Selesai', EN: 'Order Completed' },
    'status.failed': { ID: 'Dibatalkan', EN: 'Cancelled' },
    'status.cancelled': { ID: 'Dibatalkan', EN: 'Cancelled' },

    // ── Action Buttons ─────────────────────────────────────────
    'btn.confirm': { ID: 'Konfirmasi', EN: 'Confirm' },
    'btn.verify': { ID: 'Verifikasi', EN: 'Verify Payment' },
    'btn.process': { ID: 'Proses', EN: 'Process' },
    'btn.ship': { ID: 'Kirim', EN: 'Ship' },
    'btn.done': { ID: 'Selesai', EN: 'Done' },
    'btn.detail': { ID: 'Detail', EN: 'Detail' },
    'btn.back': { ID: 'Kembali', EN: 'Back' },
    'btn.add_to_cart': { ID: 'Keranjang', EN: 'Cart' },
    'btn.buy_now': { ID: 'Beli Langsung', EN: 'Buy Now' },
    'btn.checkout': { ID: 'Checkout', EN: 'Checkout' },
    'btn.give_review': { ID: 'Beri Ulasan', EN: 'Write Review' },
    'btn.refresh': { ID: 'Refresh Data', EN: 'Refresh Data' },
    'btn.start_shopping': { ID: 'Belanja Sekarang', EN: 'Shop Now' },

    // ── Navbar ────────────────────────────────────────────────
    'nav.seller_info': { ID: 'Info Berjualan', EN: 'Seller Info' },
    'nav.my_orders': { ID: 'Pesanan Saya', EN: 'My Orders' },
    'nav.my_profile': { ID: 'Profil Saya', EN: 'My Profile' },
    'nav.settings': { ID: 'Pengaturan', EN: 'Settings' },
    'nav.logout': { ID: 'Keluar', EN: 'Log Out' },
    'nav.login': { ID: 'Masuk', EN: 'Log In' },
    'nav.register': { ID: 'Daftar Akun', EN: 'Register' },
    'nav.cart': { ID: 'Keranjang', EN: 'Cart' },
    'nav.notifications': { ID: 'Notifikasi', EN: 'Notifications' },
    'nav.admin_dashboard': { ID: 'Dashboard Admin', EN: 'Admin Dashboard' },
    'nav.merchant_dashboard': { ID: 'Dashboard Toko', EN: 'Store Dashboard' },
    'nav.language': { ID: 'Pilih Bahasa', EN: 'Language' },
    'nav.welcome': { ID: 'Selamat Datang', EN: 'Welcome' },
    'nav.not_logged_in': { ID: 'Belum Masuk Akun', EN: 'Not Logged In' },
    'nav.view_all_orders': { ID: 'Tampilkan Semua Pesanan', EN: 'View All Orders' },
    'nav.cart_total': { ID: 'Total Estimasi', EN: 'Estimated Total' },
    'nav.view_cart': { ID: 'Lihat Keranjang Belanja', EN: 'View Shopping Cart' },
    'nav.mark_all_read': { ID: 'Tandai semua dibaca', EN: 'Mark all as read' },
    'nav.no_notif': { ID: 'Belum ada notifikasi', EN: 'No notifications yet' },
    'nav.recent_orders': { ID: 'Pesanan Terbaru', EN: 'Recent Orders' },
    'nav.cart_empty': { ID: 'Keranjangmu kosong', EN: 'Your cart is empty' },
    'nav.start_shopping': { ID: 'Mulai Belanja Sekarang →', EN: 'Start Shopping Now →' },
    'nav.pending_orders': { ID: 'Belum ada pesanan', EN: 'No orders yet' },

    // ── Order Status Display (short for badges) ───────────────
    'badge.paid': { ID: 'Lunas', EN: 'Paid' },
    'badge.pending': { ID: 'Belum Bayar', EN: 'Unpaid' },

    // ── Buyer Orders Page ─────────────────────────────────────
    'orders.title': { ID: 'Pesanan Saya', EN: 'My Orders' },
    'orders.all': { ID: 'Semua', EN: 'All' },
    'orders.pending_tab': { ID: 'Bayar', EN: 'Unpaid' },
    'orders.paid_tab': { ID: 'Lunas', EN: 'Paid' },
    'orders.total': { ID: 'Total Belanja', EN: 'Order Total' },
    'orders.error': { ID: 'Gagal memuat pesanan', EN: 'Failed to load orders' },
    'orders.empty_title': { ID: 'Belum ada pesanan', EN: 'No orders yet' },
    'orders.empty_sub': { ID: 'Sepertinya Anda belum melakukan transaksi apapun. Yuk mulai belanja!', EN: 'You have no transactions yet. Start shopping now!' },
    'orders.shop_now': { ID: 'Belanja Sekarang', EN: 'Shop Now' },
    'orders.more_items': { ID: 'produk lainnya', EN: 'more items' },
    'orders.qty': { ID: 'x', EN: 'x' },
    'orders.loading': { ID: 'Memuat pesanan...', EN: 'Loading orders...' },

    // ── Seller Orders Page ────────────────────────────────────
    'merchant.orders_title': { ID: 'Pesanan Toko', EN: 'Shop Orders' },
    'merchant.orders_sub': { ID: 'Kelola pesanan masuk', EN: 'Manage incoming orders' },
    'merchant.search_ph': { ID: 'Cari ID, Nama Pembeli...', EN: 'Search ID, Buyer Name...' },
    'merchant.tab_all': { ID: 'Semua', EN: 'All' },
    'merchant.tab_pending': { ID: 'Pesanan Masuk', EN: 'Incoming' },
    'merchant.tab_paid': { ID: 'Terkonfirmasi', EN: 'Confirmed' },
    'merchant.tab_processing': { ID: 'Diproses', EN: 'Processing' },
    'merchant.tab_shipped': { ID: 'Dikirim', EN: 'Shipped' },
    'merchant.tab_completed': { ID: 'Selesai', EN: 'Completed' },
    'merchant.tab_failed': { ID: 'Dibatalkan', EN: 'Cancelled' },
    'merchant.total': { ID: 'Total Belanja', EN: 'Order Total' },
    'merchant.empty_title': { ID: 'Belum ada pesanan', EN: 'No orders yet' },
    'merchant.empty_sub': { ID: 'Pesanan baru akan muncul di sini', EN: 'New orders will appear here' },
    'merchant.loading': { ID: 'Memuat pesanan...', EN: 'Loading orders...' },
    'merchant.cod_note': { ID: 'Bayar di Tempat (COD)', EN: 'Cash on Delivery (COD)' },
    'merchant.cod_reminder': { ID: 'Pastikan pembayaran diterima saat pengiriman', EN: 'Ensure payment is collected upon delivery' },
    'merchant.address_na': { ID: 'Alamat tidak tersedia', EN: 'Address not available' },
    'merchant.more_items': { ID: 'produk lainnya', EN: 'more items' },

    // ── Cart ──────────────────────────────────────────────────
    'cart.title': { ID: 'Keranjang Belanja', EN: 'Shopping Cart' },
    'cart.empty_title': { ID: 'Keranjang Kosong', EN: 'Cart is Empty' },
    'cart.empty_sub': { ID: 'Belum ada produk dipilih', EN: 'No products selected yet' },
    'cart.checkout': { ID: 'Checkout', EN: 'Checkout' },
    'cart.selected': { ID: 'dipilih', EN: 'selected' },
    'cart.total': { ID: 'Total', EN: 'Total' },
    'cart.subtotal': { ID: 'Subtotal', EN: 'Subtotal' },
    'cart.items': { ID: 'item', EN: 'item' },

    // ── Product Detail ────────────────────────────────────────
    'product.price': { ID: 'Harga', EN: 'Price' },
    'product.stock_out': { ID: 'Stok Habis', EN: 'Out of Stock' },
    'product.qty': { ID: 'Qty', EN: 'Qty' },
} as const;

type DictKey = keyof typeof dict;

interface LanguageContextType {
    lang: Lang;
    setLang: (l: Lang) => void;
    t: (key: DictKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
    lang: 'ID',
    setLang: () => { },
    t: (key) => dict[key].ID,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Lang>('ID');

    useEffect(() => {
        const saved = localStorage.getItem('axon-lang') as Lang | null;
        if (saved === 'ID' || saved === 'EN') setLangState(saved);
    }, []);

    const setLang = (l: Lang) => {
        setLangState(l);
        localStorage.setItem('axon-lang', l);
    };

    const t = (key: DictKey): string => dict[key][lang];

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
