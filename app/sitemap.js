import { getSupabase } from "@/lib/supabase";
import { COUNTRIES } from "@/lib/countries";

export default async function sitemap() {
  const base = process.env.SITE_URL ?? "https://bizora-vert.vercel.app";
  const now = new Date();
  const staticUrls = [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/add-business`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/advertise`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/marketplace`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/sell`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    ...Object.keys(COUNTRIES).map((code) => ({ url: `${base}/?c=${code}`, lastModified: now, changeFrequency: "daily", priority: 0.8 })),
  ];

  try {
    const supabase = getSupabase();
    const [{ data: businesses }, { data: listings }] = await Promise.all([
      supabase.from("businesses").select("slug, updated_at, created_at").eq("status", "approved").limit(5000),
      supabase.from("listings").select("slug, updated_at, created_at").eq("status", "approved").limit(5000),
    ]);
    return [
      ...staticUrls,
      ...(businesses ?? []).map((b) => ({ url: `${base}/business/${b.slug}`, lastModified: new Date(b.updated_at || b.created_at || now), changeFrequency: "weekly", priority: 0.8 })),
      ...(listings ?? []).map((l) => ({ url: `${base}/listing/${l.slug}`, lastModified: new Date(l.updated_at || l.created_at || now), changeFrequency: "weekly", priority: 0.7 })),
    ];
  } catch {
    return staticUrls;
  }
}
