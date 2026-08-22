import Link from "next/link";
import AdBanner from "@/components/AdBanner";
import DirectoryExplorer from "@/components/DirectoryExplorer";
import ListingCard from "@/components/ListingCard";
import { getSupabase } from "@/lib/supabase";
import { getCountry } from "@/lib/countries";

export const revalidate = 60;

export default async function Home({ searchParams }) {
  const sp = await searchParams;
  const country = getCountry(sp?.c);

  const supabase = getSupabase();
  const nowIso = new Date().toISOString();
  const [{ data: bizData }, { data: listingData }, { data: adData }] = await Promise.all([
    supabase
      .from("businesses")
      .select("*, products(*)")
      .eq("status", "approved")
      .eq("country", country.code)
      .order("created_at", { ascending: false }),
    supabase
      .from("listings")
      .select("*")
      .eq("status", "approved")
      .eq("country", country.code)
      .or(`paid_until.is.null,paid_until.gt.${nowIso}`)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("ads")
      .select("*")
      .eq("status", "approved")
      .gt("paid_until", nowIso)
      .order("created_at", { ascending: false }),
  ]);

  const businesses = (bizData ?? []).map((b) => ({
    ...b,
    featured: b.is_featured && (!b.featured_until || new Date(b.featured_until) > new Date()),
  }));

  const listings = (listingData ?? []).map((l) => ({
    ...l,
    is_featured: l.is_featured && (!l.featured_until || new Date(l.featured_until) > new Date()),
  }));

  // Map DB ad rows to the shape AdBanner expects; falls back to the static
  // house ad automatically inside AdBanner if this list is empty.
  const paidAds = (adData ?? []).map((a) => ({
    id: a.id,
    title: a.title,
    text: a.text,
    cta: a.cta,
    link: a.link,
    bgColor: a.bg_color,
  }));

  return (
    <>
      <section className="bg-green-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold">
            Buy, sell, and find trusted businesses across {country.label} {country.flag}
          </h1>
          <p className="mt-3 text-green-100">Browse products, addresses and services near you.</p>
        </div>
      </section>
      <AdBanner ads={paidAds} />

      {listings.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">🔥 Latest products for sale</h2>
            <Link href={`/marketplace?c=${country.code}`} className="text-green-700 text-sm font-medium hover:underline">
              See all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} currency={country.currency} />
            ))}
          </div>
        </section>
      )}

      <DirectoryExplorer businesses={businesses} countryCode={country.code} />
    </>
  );
}
