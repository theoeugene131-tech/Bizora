import { getSupabase } from "./supabase";

export async function uploadImage(file, path) {
  const supabase = getSupabase();
  const { error } = await supabase.storage
    .from("business-images")
    .upload(path, file, { cacheControl: "3600", upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("business-images").getPublicUrl(path);
  return data.publicUrl;
}
