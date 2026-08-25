import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Analytics from "@/components/Analytics";
import { BRAND } from "@/lib/brand";

const siteUrl = process.env.SITE_URL ?? "https://bizora-vert.vercel.app";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${BRAND.name} — ${BRAND.tagline}`,
    template: `%s — ${BRAND.name}`,
  },
  description: `Search businesses and products across Nigeria. Find addresses, products and services of trusted local businesses in Lagos, Abuja, Port Harcourt, Kano, Ibadan and beyond. ${BRAND.tagline} Owned by ${BRAND.owner}.`,
  keywords: ["Bizora","Nigeria business directory","Lagos businesses","Abuja businesses","buy products Nigeria","Nigeria marketplace","local businesses","Next Level Global Consult"],
  authors: [{ name: BRAND.owner }],
  creator: BRAND.owner,
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: siteUrl,
    siteName: BRAND.name,
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: `Discover trusted businesses and products in Nigeria. Search by business name, category or product.`,
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: `Search businesses and products across Nigeria.`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: { canonical: siteUrl },
};

export default function RootLayout({ children }) {
  const siteUrl = process.env.SITE_URL ?? "https://bizora-vert.vercel.app";
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND.name,
    url: siteUrl,
    logo: `${siteUrl}/icon.svg`,
    description: BRAND.tagline,
    parentOrganization: { "@type": "Organization", name: BRAND.owner },
    contactPoint: { "@type": "ContactPoint", telephone: `+${BRAND.whatsapp}`, contactType: "customer service", availableLanguage: "en" },
  };
  return (
    <html lang="en">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      </head>
      <body className="min-h-screen flex flex-col bg-gray-50 text-gray-900 antialiased">
        <Analytics />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
