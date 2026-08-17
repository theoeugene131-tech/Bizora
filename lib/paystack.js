import { sendFeaturedActivated } from "./email";

export async function verifyPaystackTransaction(reference) {
  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      cache: "no-store",
    }
  );
  return res.json();
}

export async function activateFeaturedListing({ supabase, reference, data }) {
  const { data: existing } = await supabase
    .from("payments")
    .select("status")
    .eq("reference", reference)
    .maybeSingle();
  if (existing?.status === "success") return { alreadyProcessed: true };

  await supabase.from("payments").upsert(
    {
      reference,
      email: data.customer?.email ?? null,
      plan: "featured",
      amount: (data.amount ?? 0) / 100,
      status: data.status,
    },
    { onConflict: "reference" }
  );

  if (data.status !== "success") return { activated: false };

  const slug = data.metadata?.custom_fields?.find(
    (f) => f.variable_name === "business_slug"
  )?.value;
  if (!slug) return { activated: false };

  const featuredUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  await supabase
    .from("businesses")
    .update({ is_featured: true, featured_until: featuredUntil })
    .eq("slug", slug);

  const { data: biz } = await supabase.from("businesses").select("*").eq("slug", slug).single();
  if (biz) await sendFeaturedActivated(biz);

  return { activated: true, slug };
}
