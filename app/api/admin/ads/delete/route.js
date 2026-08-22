import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";

export async function POST(request) {
  const adminUser = await requireAdmin(request);
  if (!adminUser) return Response.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  const { error } = await getSupabaseAdmin().from("ads").delete().eq("id", id);
  if (error) return Response.json({ message: error.message }, { status: 400 });
  return Response.json({ ok: true });
}
