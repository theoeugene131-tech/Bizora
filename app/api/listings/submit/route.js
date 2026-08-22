import { getSupabaseAdmin } from "@/lib/supabase";
import { slugify } from "@/lib/format";
import { countSellerListings, FREE_LISTING_LIMIT, LISTING_FEE, BILLING_PERIOD_DAYS } from "@/lib/listings";
import { verifyPaystackTransaction } from "@/lib/paystack";

export async function POST(request) {
  const body = await request.json();

  if (body.agreed !== true) {
    return Response.json({ message: "You must accept the Terms & Disclaimer" }, { status: 400 });
  }

  const required = ["title", "category", "price", "city", "state", "seller_phone"];
  const missing = required.filter((f) => !String(body[f] ?? "").trim());
  if (missing.length) {
    return Response.json({ message: `Missing required fields: ${missing.join(", ")}` }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const phone = body.seller_phone.trim();
  const used = await countSellerListings(supabase, phone);
  let paid = false;
  let paidUntil = null;

  // Free quota used up — payment is required and must be verified server-side
  // before we ever insert the listing. We never trust a "paid" flag sent from
  // the browser; the reference is checked directly against Paystack.
  if (used >= FREE_LISTING_LIMIT) {
    if (!body.paystackReference) {
      return Response.json(
        {
          message: `Free listings used up. A payment of ₦${LISTING_FEE.toLocaleString()}/month is required to list this item.`,
          requiresPayment: true,
          fee: LISTING_FEE,
        },
        { status: 402 }
      );
    }

    const { data: existingPayment } = await supabase
      .from("payments")
      .select("status")
      .eq("reference", body.paystackReference)
      .maybeSingle();
    if (existingPayment?.status === "success") {
      return Response.json({ message: "This payment reference has already been used." }, { status: 400 });
    }

    const result = await verifyPaystackTransaction(body.paystackReference);
    const amountPaidKobo = result?.data?.amount ?? 0;
    if (result?.data?.status !== "success" || amountPaidKobo < LISTING_FEE * 100) {
      return Response.json({ message: "Payment could not be verified." }, { status: 400 });
    }

    await supabase.from("payments").upsert(
      {
        reference: body.paystackReference,
        email: body.seller_email || null,
        plan: "listing-fee",
        amount: amountPaidKobo / 100,
        status: "success",
      },
      { onConflict: "reference" }
    );
    paid = true;
    paidUntil = new Date(Date.now() + BILLING_PERIOD_DAYS * 24 * 60 * 60 * 1000).toISOString();
  }

  const slug = `${slugify(body.title)}-${Math.random().toString(36).slice(2, 7)}`;

  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
      slug,
      title: body.title.trim(),
      category: body.category,
      description: body.description ?? "",
      price: Number(body.price),
      condition: body.condition || "used",
      image_url: body.image_url ?? null,
      city: body.city.trim(),
      state: body.state.trim(),
      country: body.country ?? "ng",
      seller_name: body.seller_name?.trim() ?? "",
      seller_phone: phone,
      seller_email: body.seller_email?.trim() ?? "",
      status: "pending",
      paid,
      paid_until: paidUntil,
      terms_accepted_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return Response.json({ message: error.message }, { status: 400 });

  return Response.json({ message: "Listing submitted!", slug: listing.slug });
}
