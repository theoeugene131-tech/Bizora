import { getSupabase } from "@/lib/supabase";
import { COUNTRIES } from "@/lib/countries";

export default async function sitemap() {
  const base = process.env.SITE_URL ?? "http://localhost:3000";
  const staticUrls = [
    { url: base, lastModified: new Date() },
    { url: `${base}/add-business`, lastModified: new Date() },
    { url: `${base}/advertise`, lastModified: new Date() },
    { url: `${base}/marketplace`, lastModified: new Date() },
    { url: `${base}/sell`, lastModified: new Date() },
    ...Object.keys(COUNTRIES).map((code) => ({ url: `${base}/?c=${code}`, lastModified: new Date() })),
  ];

  try {
    const supabase = getSupabase();
    const [{ data: businesses }, { data: listings }] = await Promise.all([
      supabase.from("businesses").select("slug").eq("status", "approved"),
      supabase.from("listings").select("slug").eq("status", "approved"),
    ]);
    return [
      ...staticUrls,
      ...(businesses ?? []).map((b) => ({ url: `${base}/business/${b.slug}`, lastModified: new Date() })),
      ...(listings ?? []).map((l) => ({ url: `${base}/listing/${l.slug}`, lastModified: new Date() })),
    ];
  } catch {
    return staticUrls;
  }
}
