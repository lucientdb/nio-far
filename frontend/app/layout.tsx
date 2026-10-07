import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AccessibilityWidget from "@/components/AccessibilityWidget";
import ScrollToTop from "@/components/ScrollToTop";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nio Far — Plateforme nationale d'inclusion",
  description: "Ressources, communauté et opportunités pour les personnes en situation de handicap au Sénégal.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${geist.className} bg-white text-gray-900 antialiased`}>
        <ScrollToTop />
        {/* Skip link navigation clavier */}
        <a href="#main-content" className="skip-link">
          Aller au contenu principal
        </a>
        <Navbar />
        <main id="main-content">{children}</main>
        <Footer />
        <AccessibilityWidget />
      </body>
    </html>
  );
}