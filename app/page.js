import AdBanner from "@/components/AdBanner";
import AppShareButtons from "@/components/AppShareButtons";
import DirectoryExplorer from "@/components/DirectoryExplorer";
import { getSupabase } from "@/lib/supabase";
import { getCountry } from "@/lib/countries";

export const revalidate = 60;

export default async function Home({ searchParams }) {
  const sp = await searchParams;
  const country = getCountry(sp?.c);

  const supabase = getSupabase();
  const { data } = await supabase
    .from("businesses")
    .select("*, products(*)")
    .eq("status", "approved")
    .eq("country", country.code)
    .order("created_at", { ascending: false })
    .limit(1000);

  const businesses = (data ?? []).map((b) => ({
    ...b,
    featured: b.is_featured && (!b.featured_until || new Date(b.featured_until) > new Date()),
  }));

  return (
    <>
      <section className="bg-green-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold">
            Find trusted businesses across {country.label} {country.flag}
          </h1>
          <p className="mt-3 text-green-100">Browse addresses, products and services near you.</p>
          <AppShareButtons variant="hero" />
        </div>
      </section>
      <AdBanner />
      <DirectoryExplorer businesses={businesses} countryCode={country.code} />
    </>
  );
}
