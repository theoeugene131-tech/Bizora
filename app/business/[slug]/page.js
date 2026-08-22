import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getSupabase } from "@/lib/supabase";
import { getCountry } from "@/lib/countries";
import { formatMoney, whatsappLink } from "@/lib/format";
import { BRAND } from "@/lib/brand";
import MapEmbed from "@/components/MapEmbed";

export const revalidate = 60;

// Wrapped in React's cache() so calling this twice in one request (once for
// generateMetadata, once for the page body) only fetches — and counts a
// view — once, not twice.
const getBusiness = cache(async (slug) => {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("businesses")
    .select("*, products(*)")
    .eq("slug", slug)
    .eq("status", "approved")
    .single();
  if (data) {
    // Fire-and-forget view count — never let analytics tracking break the page.
    supabase.rpc("increment_business_views", { business_slug: slug }).then(
      () => {},
      () => {}
    );
  }
  return data;
});

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const business = await getBusiness(slug);
  return { title: business ? `${business.name} — ${BRAND.name}` : "Business not found" };
}

export default async function BusinessPage({ params }) {
  const { slug } = await params;
  const business = await getBusiness(slug);
  if (!business) notFound();

  const country = getCountry(business.country);
  const featured =
    business.is_featured &&
    (!business.featured_until || new Date(business.featured_until) > new Date());
  const fullAddress = [business.street, business.city, business.state].filter(Boolean).join(", ");
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
  const location =
    business.lat != null && business.lng != null
      ? { lat: business.lat, lng: business.lng }
      : undefined;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/" className="text-green-700 text-sm">← Back to directory</Link>

      <div className="mt-4 bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{business.name}</h1>
            <p className="text-green-700 font-medium text-sm mt-1">{business.category}</p>
          </div>
          {featured && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold">★ Featured</span>
          )}
        </div>

        <p className="mt-4 text-gray-700">{business.description}</p>

        <div className="mt-6 grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <h2 className="font-semibold mb-1">Address</h2>
            <p className="text-gray-600">{fullAddress}</p>
            <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="text-green-700 hover:underline">
              Open in Google Maps →
            </a>
          </div>
          <div>
            <h2 className="font-semibold mb-1">Contact</h2>
            <p className="text-gray-600">📞 {business.phone}</p>
            {business.email && <p className="text-gray-600">✉️ {business.email}</p>}
            {business.website && (
              <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-green-700 hover:underline">
                🌐 Website
              </a>
            )}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <a href={`tel:${business.phone.replace(/\s/g, "")}`}
            className="bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-800">
            Call business
          </a>
          <a href={whatsappLink(business.phone)} target="_blank" rel="noopener noreferrer"
            className="bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-600">
            Chat on WhatsApp
          </a>
        </div>

        <div className="mt-6">
          <h2 className="font-semibold mb-2">Location</h2>
          <MapEmbed address={fullAddress} location={location} />
        </div>
      </div>

      <h2 className="text-xl font-bold mt-8 mb-4">Products & Services</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {business.products.map((p) => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4">
            {p.image_url ? (
              <img src={p.image_url} alt={p.name} className="h-28 w-full object-cover rounded-lg mb-3" />
            ) : (
              <div className="h-28 bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-3xl">🛍️</div>
            )}
            <h3 className="font-semibold text-sm">{p.name}</h3>
            <p className="text-green-700 font-bold mt-1">{formatMoney(Number(p.price), country.currency)}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-6">
        ⚖️ {business.name} is solely responsible for the quality and legality of its products, and for
        all payment arrangements with its customers, including confirming receipt of payment before
        delivery. {BRAND.name} is a directory and is not a party to any transaction.{" "}
        <Link href="/terms" className="underline hover:text-gray-600">Read our Terms & Disclaimer</Link>
      </p>
    </div>
  );
}
