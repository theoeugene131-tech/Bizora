import { getSupabaseAdmin } from "@/lib/supabase";
import { ALIST_FEE, BILLING_PERIOD_DAYS } from "@/lib/listings";
import { verifyPaystackTransaction } from "@/lib/paystack";

export async function POST(request) {
  const { slug, paystackReference } = await request.json();
  if (!slug || !paystackReference) {
    return Response.json({ message: "Missing slug or payment reference" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: existingPayment } = await supabase
    .from("payments")
    .select("status")
    .eq("reference", paystackReference)
    .maybeSingle();
  if (existingPayment?.status === "success") {
    return Response.json({ message: "This payment reference has already been used." }, { status: 400 });
  }

  const result = await verifyPaystackTransaction(paystackReference);
  const amountPaidKobo = result?.data?.amount ?? 0;
  if (result?.data?.status !== "success" || amountPaidKobo < ALIST_FEE * 100) {
    return Response.json({ message: "Payment could not be verified." }, { status: 400 });
  }

  const { data: listing } = await supabase.from("listings").select("featured_until").eq("slug", slug).single();
  if (!listing) return Response.json({ message: "Listing not found" }, { status: 404 });

  const base =
    listing.featured_until && new Date(listing.featured_until) > new Date() ? new Date(listing.featured_until) : new Date();
  const newFeaturedUntil = new Date(base.getTime() + BILLING_PERIOD_DAYS * 24 * 60 * 60 * 1000).toISOString();

  await supabase.from("payments").upsert(
    {
      reference: paystackReference,
      plan: "listing-alist",
      amount: amountPaidKobo / 100,
      status: "success",
    },
    { onConflict: "reference" }
  );

  const { error } = await supabase
    .from("listings")
    .update({ is_featured: true, featured_until: newFeaturedUntil })
    .eq("slug", slug);
  if (error) return Response.json({ message: error.message }, { status: 400 });

  return Response.json({ message: "You're now A-List! Top placement for 30 days.", featuredUntil: newFeaturedUntil });
}
