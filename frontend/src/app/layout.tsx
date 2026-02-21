import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import PWAInstallOverlay from "@/components/ui/PWAInstallOverlay";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Axon DapurKita - Pilihan Dapur Terdekat Anda",
    template: "%s | Axon DapurKita"
  },
  description: "Marketplace komunitas untuk sayur segar, masakan matang, dan jamu tradisional. Dari tetangga, untuk tetangga.",
  keywords: ["online shop", "sayur segar", "masakan matang", "jamu tradisional", "dapur kita", "axon", "umkm", "marketplace"],
  authors: [{ name: "Axon Group" }],
  creator: "Axon DapurKita",
  publisher: "Axon DapurKita",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://axonumkm.id", // Update with actual domain if available
    siteName: "Axon DapurKita",
    title: "Axon DapurKita - Pilihan Dapur Terdekat Anda",
    description: "Marketplace komunitas untuk kebutuhan dapur segar dan matang langsung dari tetangga sekitar.",
    images: [
      {
        url: "/og-image.png", // Will create this later/placeholder
        width: 1200,
        height: 630,
        alt: "Axon DapurKita",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Axon DapurKita - Pilihan Dapur Terdekat Anda",
    description: "Marketplace komunitas segar & matang.",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DapurKita",
  },
  formatDetection: {
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#1B5E20",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import Providers from "@/components/layouts/Providers";
import NavbarWithRouteGuard from "@/components/layouts/NavbarWithRouteGuard";
import { Toaster } from 'react-hot-toast';
import { Toaster as SonnerToaster } from 'sonner';

import PWARegistry from "@/components/pwa/PWARegistry";
import BuyerBottomNav from "@/components/layouts/BuyerBottomNav";
import { LanguageProvider } from "@/contexts/LanguageContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body
        className={`${poppins.variable} antialiased`}
      >
        <PWAInstallOverlay />
        <Providers>
          <LanguageProvider>
            <PWARegistry />
            <NavbarWithRouteGuard />
            <Toaster
              position="top-center"
              reverseOrder={false}
              toastOptions={{
                className: 'font-[family-name:var(--font-poppins)]',
                style: {
                  borderRadius: '16px',
                  background: '#ffffff',
                  color: '#1a1a1a',
                  fontSize: '12px',
                  fontWeight: '600',
                  padding: '12px 16px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  maxWidth: '90vw',
                },
                success: {
                  style: {
                    background: '#F0FDF4',
                    border: '1px solid #DCFCE7',
                    color: '#166534',
                  },
                  iconTheme: {
                    primary: '#166534',
                    secondary: '#F0FDF4',
                  },
                },
                error: {
                  style: {
                    background: '#FEF2F2',
                    border: '1px solid #FEE2E2',
                    color: '#991B1B',
                  },
                },
              }}
            />
            <SonnerToaster
              position="top-center"
              richColors
              theme="light"
              toastOptions={{
                style: {
                  fontSize: '12px',
                  borderRadius: '16px',
                },
              }}
            />
            <div className="pb-20 lg:pb-0">
              {children}
            </div>
            <BuyerBottomNav />
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}
