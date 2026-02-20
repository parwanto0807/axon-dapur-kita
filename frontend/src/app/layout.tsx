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
  title: "Axon DapurKita - Pilihan Dapur Terdekat Anda",
  description: "Marketplace komunitas untuk sayur segar, masakan matang, dan jamu tradisional.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DapurKita",
  },
  formatDetection: {
    telephone: false,
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
        <Providers>
          <PWARegistry />
          <PWAInstallOverlay />
          <NavbarWithRouteGuard />
          <Toaster position="top-center" reverseOrder={false} />
          <SonnerToaster position="top-center" richColors />
          {children}
        </Providers>
      </body>
    </html>
  );
}
