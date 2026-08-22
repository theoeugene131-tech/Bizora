import { getSupabaseAdmin } from "@/lib/supabase";

// Phone-based lookup (no login system for sellers) — deliberately excludes
// rejected listings, and only returns fields already visible on an approved
// listing's public page, so this can't leak anything sensitive.
export async function POST(request) {
  const { phone } = await request.json();
  if (!phone?.trim()) return Response.json({ message: "Phone required" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("listings")
    .select("slug, title, status, paid, paid_until, is_featured, featured_until, price, image_url")
    .eq("seller_phone", phone.trim())
    .neq("status", "rejected")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ message: error.message }, { status: 400 });
  return Response.json({ listings: data ?? [] });
}
