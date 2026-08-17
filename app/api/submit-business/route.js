import { getSupabaseAdmin } from "@/lib/supabase";
import { slugify } from "@/lib/format";
import { sendSubmissionReceived } from "@/lib/email";

export async function POST(request) {
  const body = await request.json();

  if (body.agreed !== true) {
    return Response.json({ message: "You must accept the Terms & Disclaimer" }, { status: 400 });
  }

  const required = ["name", "category", "phone", "city", "state"];
  const missing = required.filter((f) => !String(body[f] ?? "").trim());
  if (missing.length) {
    return Response.json(
      { message: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();
  const slug = `${slugify(body.name)}-${Math.random().toString(36).slice(2, 7)}`;

  const { data: business, error } = await supabase
    .from("businesses")
    .insert({
      slug,
      name: body.name.trim(),
      category: body.category,
      description: body.description ?? "",
      street: body.street ?? "",
      city: body.city.trim(),
      state: body.state,
      country: body.country ?? "ng",
      phone: body.phone.trim(),
      email: body.email ?? "",
      website: body.website ?? "",
      submitter_email: body.submitter_email ?? "",
      image_url: body.image_url ?? null,
      lat: body.place?.lat ?? null,
      lng: body.place?.lng ?? null,
      place_id: body.place?.placeId ?? null,
      terms_accepted_at: new Date().toISOString(),
      status: "pending",
    })
    .select()
    .single();

  if (error) return Response.json({ message: error.message }, { status: 400 });

  const products = (body.products ?? [])
    .filter((p) => p.name?.trim() && Number(p.price) > 0)
    .map((p) => ({ business_id: business.id, name: p.name.trim(), price: Number(p.price) }));

  if (products.length) await supabase.from("products").insert(products);

  await sendSubmissionReceived(business);

  return Response.json({ message: "Submission received!", slug });
}
