import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";

export async function POST(request) {
  const adminUser = await requireAdmin(request);
  if (!adminUser) return Response.json({ message: "Unauthorized" }, { status: 401 });

  const { id, status } = await request.json();
  if (!id || !status) return Response.json({ message: "Missing id or status" }, { status: 400 });

  const { error } = await getSupabaseAdmin().from("ads").update({ status }).eq("id", id);
  if (error) return Response.json({ message: error.message }, { status: 400 });
  return Response.json({ ok: true });
}
