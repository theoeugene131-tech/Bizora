import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";
import { sendApproved, sendRejected } from "@/lib/email";

export async function POST(request) {
  const adminUser = await requireAdmin(request);
  if (!adminUser) return Response.json({ message: "Unauthorized" }, { status: 401 });

  const { slug, status, imageUrl, featured } = await request.json();
  const admin = getSupabaseAdmin();

  const { data: business } = await admin
    .from("businesses").select("*").eq("slug", slug).single();
  if (!business) return Response.json({ message: "Business not found" }, { status: 404 });

  const changes = {};
  if (status) changes.status = status;
  if (imageUrl) changes.image_url = imageUrl;
  if (typeof featured === "boolean") {
    changes.is_featured = featured;
    changes.featured_until = featured
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : null;
  }

  const { error } = await admin.from("businesses").update(changes).eq("slug", slug);
  if (error) return Response.json({ message: error.message }, { status: 400 });

  if (status === "approved") await sendApproved(business);
  if (status === "rejected") await sendRejected(business);

  return Response.json({ ok: true });
}
