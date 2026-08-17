import { createClient } from "@supabase/supabase-js";

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

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  const { data: adminRow } = await admin
    .from("admins")
    .select("email")
    .eq("email", data.user.email)
    .maybeSingle();

  return adminRow ? data.user : null;
}
