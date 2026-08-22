import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/format";

// Bulk-adds businesses from a CSV the admin uploads (parsed client-side,
// sent here as an array of row objects). Expected columns: name, category,
// description, street, city, state, phone, email, website, country.
// Only name, category, city, state, phone are required per row.
export async function POST(request) {
  const adminUser = await requireAdmin(request);
  if (!adminUser) return Response.json({ message: "Unauthorized" }, { status: 401 });

  const { rows, status } = await request.json();
  if (!Array.isArray(rows) || rows.length === 0) {
    return Response.json({ message: "No rows provided" }, { status: 400 });
  }

  const finalStatus = status === "approved" ? "approved" : "pending";

  const prepared = rows
    .filter((r) => r.name?.trim() && r.category?.trim() && r.city?.trim() && r.state?.trim() && r.phone?.trim())
    .map((r) => ({
      slug: `${slugify(r.name)}-${Math.random().toString(36).slice(2, 7)}`,
      name: r.name.trim(),
      category: r.category.trim(),
      description: r.description?.trim() ?? "",
      street: r.street?.trim() ?? "",
      city: r.city.trim(),
      state: r.state.trim(),
      country: r.country?.trim() || "ng",
      phone: r.phone.trim(),
      email: r.email?.trim() ?? "",
      website: r.website?.trim() ?? "",
      status: finalStatus,
    }));

  const skipped = rows.length - prepared.length;

  if (prepared.length === 0) {
    return Response.json(
      { message: "No valid rows found. Each row needs at least: name, category, city, state, phone." },
      { status: 400 }
    );
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin.from("businesses").insert(prepared).select("id");
  if (error) return Response.json({ message: error.message }, { status: 400 });

  return Response.json({ ok: true, inserted: data.length, skipped });
}
