import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Axon DapurKita - Pilihan Dapur Terdekat Anda",
  description: "Marketplace komunitas untuk sayur segar, masakan matang, dan jamu tradisional.",
};

import Providers from "@/components/layouts/Providers";
import NavbarWithRouteGuard from "@/components/layouts/NavbarWithRouteGuard";
import { Toaster } from 'react-hot-toast';
import { Toaster as SonnerToaster } from 'sonner';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} antialiased`}
      >
        <Providers>
          <NavbarWithRouteGuard />
          <Toaster position="top-center" reverseOrder={false} />
          <SonnerToaster position="top-center" richColors />
          {children}
        </Providers>
      </body>
    </html>
  );
}
