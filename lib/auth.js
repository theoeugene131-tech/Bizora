import { createClient } from "@supabase/supabase-js";

const ADMIN_ALLOWLIST = ["theoeugene131@gmail.com", "tnwokobia@gmail.com"];

export async function requireAdmin(request) {
  const header = request.headers.get("authorization") ?? "";
  const token = header.replace("Bearer ", "");
  if (!token || token === header) return null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  );
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;

  const email = (data.user.email || "").toLowerCase();
  if (!ADMIN_ALLOWLIST.includes(email)) return null;

  // Keep admins table in sync but allowlist is authoritative – only those two can sign in as admin
  return data.user;
}
