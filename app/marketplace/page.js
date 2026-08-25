import MarketplaceExplorer from "@/components/MarketplaceExplorer";
import { getSupabase } from "@/lib/supabase";
import { getCountry } from "@/lib/countries";
import { BRAND } from "@/lib/brand";

export const revalidate = 60;
export const metadata = { title: `Marketplace — ${BRAND.name}` };

export default async function MarketplacePage({ searchParams }) {
  const sp = await searchParams;
  const country = getCountry(sp?.c);

  const supabase = getSupabase();
  const nowIso = new Date().toISOString();
  const [{ data }, { data: bizData }] = await Promise.all([
    supabase
      .from("listings")
      .select("*")
      .eq("status", "approved")
      .eq("country", country.code)
      .or(`paid_until.is.null,paid_until.gt.${nowIso}`)
      .order("created_at", { ascending: false })
      .limit(1000),
    supabase.from("businesses").select("*, products(*)").eq("status", "approved").eq("country", country.code).order("created_at", { ascending: false }).limit(1000),
  ]);

  const listings = (data ?? []).map((l) => ({
    ...l,
    is_featured: l.is_featured && (!l.featured_until || new Date(l.featured_until) > new Date()),
  }));
  const businesses = (bizData ?? []).map((b) => ({ ...b, featured: b.is_featured && (!b.featured_until || new Date(b.featured_until) > new Date()) }));

  return (
    <>
      <section className="bg-green-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold">
            Buy & sell products across {country.label} {country.flag}
          </h1>
          <p className="mt-3 text-green-100">Phones, electronics, fashion and more — straight from sellers near you.</p>
        </div>
      </section>
      <MarketplaceExplorer listings={listings} businesses={businesses} countryCode={country.code} />
    </>
  );
}
