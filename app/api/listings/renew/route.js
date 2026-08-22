import { getSupabaseAdmin } from "@/lib/supabase";
import { LISTING_FEE, BILLING_PERIOD_DAYS } from "@/lib/listings";
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
  if (result?.data?.status !== "success" || amountPaidKobo < LISTING_FEE * 100) {
    return Response.json({ message: "Payment could not be verified." }, { status: 400 });
  }

  const { data: listing } = await supabase.from("listings").select("paid_until").eq("slug", slug).single();
  if (!listing) return Response.json({ message: "Listing not found" }, { status: 404 });

  // Extend from whichever is later: now, or the current paid_until (so
  // renewing early doesn't waste remaining time already paid for).
  const base = listing.paid_until && new Date(listing.paid_until) > new Date() ? new Date(listing.paid_until) : new Date();
  const newPaidUntil = new Date(base.getTime() + BILLING_PERIOD_DAYS * 24 * 60 * 60 * 1000).toISOString();

  await supabase.from("payments").upsert(
    {
      reference: paystackReference,
      plan: "listing-renewal",
      amount: amountPaidKobo / 100,
      status: "success",
    },
    { onConflict: "reference" }
  );

  const { error } = await supabase.from("listings").update({ paid: true, paid_until: newPaidUntil }).eq("slug", slug);
  if (error) return Response.json({ message: error.message }, { status: 400 });

  return Response.json({ message: "Renewed! Your listing stays live for another 30 days.", paidUntil: newPaidUntil });
}
