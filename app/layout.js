import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Analytics from "@/components/Analytics";
import { BRAND } from "@/lib/brand";

export const metadata = {
  title: `${BRAND.name} — ${BRAND.tagline}`,
  description: `Search addresses, products and services of trusted local businesses. ${BRAND.tagline}`,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-50 text-gray-900 antialiased">
        <Analytics />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
