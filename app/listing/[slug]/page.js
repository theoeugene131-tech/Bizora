import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getSupabase } from "@/lib/supabase";
import { getCountry } from "@/lib/countries";
import { formatMoney, whatsappLink } from "@/lib/format";
import { BRAND } from "@/lib/brand";
import ShareButtons from "@/components/ShareButtons";

export const revalidate = 60;

// cache() dedupes this within one request — generateMetadata and the page
// body both call it, but the view only gets counted once.
const getListing = cache(async (slug) => {
  const supabase = getSupabase();
  const nowIso = new Date().toISOString();
  const { data } = await supabase
    .from("listings")
    .select("*")
    .eq("slug", slug)
    .eq("status", "approved")
    .or(`paid_until.is.null,paid_until.gt.${nowIso}`)
    .single();
  if (data) {
    supabase.rpc("increment_listing_views", { listing_slug: slug }).then(
      () => {},
      () => {}
    );
  }
  return data;
});

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing) return { title: "Listing not found" };

  const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";
  const url = `${siteUrl}/listing/${listing.slug}`;
  const description = listing.description || `${listing.title} — ₦${Number(listing.price).toLocaleString()}`;

  return {
    title: `${listing.title} — ${BRAND.name}`,
    description,
    openGraph: {
      title: listing.title,
      description,
      url,
      siteName: BRAND.name,
      images: listing.image_url ? [{ url: listing.image_url }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: listing.title,
      description,
      images: listing.image_url ? [listing.image_url] : [],
    },
  };
}

export default async function ListingPage({ params }) {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing) notFound();

  const country = getCountry(listing.country);
  const featured = listing.is_featured && (!listing.featured_until || new Date(listing.featured_until) > new Date());
  const shareUrl = `${process.env.SITE_URL ?? "http://localhost:3000"}/listing/${listing.slug}`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/marketplace" className="text-green-700 text-sm">
        ← Back to marketplace
      </Link>

      <div className="mt-4 bg-white rounded-xl border border-gray-200 overflow-hidden">
        {listing.image_url ? (
          <img src={listing.image_url} alt={listing.title} className="w-full max-h-96 object-cover" />
        ) : (
          <div className="h-64 bg-gray-100 flex items-center justify-center text-5xl">🛍️</div>
        )}
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{listing.title}</h1>
              <p className="text-green-700 font-medium text-sm mt-1 capitalize">
                {listing.category} · {listing.condition}
              </p>
            </div>
            {featured && (
              <span className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-semibold">
                🅰 A-List
              </span>
            )}
          </div>

          <p className="text-3xl font-bold text-green-700 mt-4">{formatMoney(Number(listing.price), country.currency)}</p>
          {listing.description && <p className="mt-4 text-gray-700">{listing.description}</p>}
          <p className="mt-4 text-sm text-gray-600">
            📍 {listing.city}, {listing.state}
          </p>

          <div className="mt-6 flex gap-3">
            <a
              href={`tel:${listing.seller_phone.replace(/\s/g, "")}`}
              className="bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-800"
            >
              Call seller
            </a>
            <a
              href={whatsappLink(listing.seller_phone)}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-600"
            >
              Chat on WhatsApp
            </a>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <ShareButtons url={shareUrl} title={listing.title} />
          </div>

          <p className="text-xs text-gray-400 mt-6">
            ⚖️ The seller is solely responsible for the quality and legality of this product, and for confirming
            receipt of payment before handing over the item. {BRAND.name} is a marketplace listing service and is
            not a party to this transaction.{" "}
            <Link href="/terms" className="underline hover:text-gray-600">
              Read our Terms & Disclaimer
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
