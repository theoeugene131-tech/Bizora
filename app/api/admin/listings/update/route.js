import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";

export async function POST(request) {
  const adminUser = await requireAdmin(request);
  if (!adminUser) return Response.json({ message: "Unauthorized" }, { status: 401 });

  const { slug, status, featured } = await request.json();
  const admin = getSupabaseAdmin();

  const changes = {};
  if (status) changes.status = status;
  if (typeof featured === "boolean") {
    changes.is_featured = featured;
    changes.featured_until = featured ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null;
  }

  const { error } = await admin.from("listings").update(changes).eq("slug", slug);
  if (error) return Response.json({ message: error.message }, { status: 400 });
  return Response.json({ ok: true });
}
