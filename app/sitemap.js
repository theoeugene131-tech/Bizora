import { getSupabase } from "@/lib/supabase";
import { COUNTRIES } from "@/lib/countries";

export default async function sitemap() {
  const base = process.env.SITE_URL ?? "http://localhost:3000";
  const staticUrls = [
    { url: base, lastModified: new Date() },
    { url: `${base}/add-business`, lastModified: new Date() },
    { url: `${base}/advertise`, lastModified: new Date() },
    ...Object.keys(COUNTRIES).map((code) => ({ url: `${base}/?c=${code}`, lastModified: new Date() })),
  ];

  try {
    const supabase = getSupabase();
    const { data } = await supabase.from("businesses").select("slug").eq("status", "approved");
    return [
      ...staticUrls,
      ...(data ?? []).map((b) => ({ url: `${base}/business/${b.slug}`, lastModified: new Date() })),
    ];
  } catch {
    return staticUrls;
  }
}
