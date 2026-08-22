import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";

// Bulk operations for the admin dashboard. Supports two modes:
//  - { action, slugs: [...] }              -> act on a specific selection
//  - { action, category, filterStatus }    -> act on every business in a
//                                             category (optionally further
//                                             filtered by current status)
// This is what makes clearing out 1000+ imported businesses by category
// practical instead of clicking through them one at a time.
export async function POST(request) {
  const adminUser = await requireAdmin(request);
  if (!adminUser) return Response.json({ message: "Unauthorized" }, { status: 401 });

  const { action, slugs, category, filterStatus } = await request.json();

  if (!["approve", "reject", "delete"].includes(action)) {
    return Response.json({ message: "Unknown action" }, { status: 400 });
  }

  const hasSlugs = Array.isArray(slugs) && slugs.length > 0;
  if (!hasSlugs && !category) {
    return Response.json({ message: "Provide either slugs or a category" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  let query =
    action === "delete"
      ? admin.from("businesses").delete()
      : admin.from("businesses").update({ status: action === "approve" ? "approved" : "rejected" });

  if (hasSlugs) {
    query = query.in("slug", slugs);
  } else {
    query = query.eq("category", category);
    if (filterStatus) query = query.eq("status", filterStatus);
  }

  const { data, error } = await query.select("id");
  if (error) return Response.json({ message: error.message }, { status: 400 });

  return Response.json({ ok: true, count: data?.length ?? 0 });
}
