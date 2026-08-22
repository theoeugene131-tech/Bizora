import { getSupabaseAdmin } from "@/lib/supabase";
import { BANNER_AD_FEE } from "@/lib/ads";
import { verifyPaystackTransaction } from "@/lib/paystack";

const BILLING_PERIOD_DAYS = 30;

export async function POST(request) {
  const body = await request.json();

  if (body.agreed !== true) {
    return Response.json({ message: "You must accept the Terms & Disclaimer" }, { status: 400 });
  }

  const required = ["title", "text", "link"];
  const missing = required.filter((f) => !String(body[f] ?? "").trim());
  if (missing.length) {
    return Response.json({ message: `Missing required fields: ${missing.join(", ")}` }, { status: 400 });
  }

  if (!body.paystackReference) {
    return Response.json(
      { message: `A payment of ₦${BANNER_AD_FEE.toLocaleString()}/month is required.`, fee: BANNER_AD_FEE },
      { status: 402 }
    );
  }

  const supabase = getSupabaseAdmin();

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
  if (result?.data?.status !== "success" || amountPaidKobo < BANNER_AD_FEE * 100) {
    return Response.json({ message: "Payment could not be verified." }, { status: 400 });
  }

  await supabase.from("payments").upsert(
    {
      reference: body.paystackReference,
      email: body.advertiser_email || null,
      plan: "banner-ad",
      amount: amountPaidKobo / 100,
      status: "success",
    },
    { onConflict: "reference" }
  );

  const paidUntil = new Date(Date.now() + BILLING_PERIOD_DAYS * 24 * 60 * 60 * 1000).toISOString();

  // Paid, but still requires admin approval before it appears — protects
  // against inappropriate ad content going live automatically.
  const { data: ad, error } = await supabase
    .from("ads")
    .insert({
      title: body.title.trim(),
      text: body.text.trim(),
      cta: body.cta?.trim() || "Learn more",
      link: body.link.trim(),
      bg_color: "bg-green-700",
      advertiser_name: body.advertiser_name?.trim() ?? "",
      advertiser_email: body.advertiser_email?.trim() ?? "",
      advertiser_phone: body.advertiser_phone?.trim() ?? "",
      status: "pending",
      paid_until: paidUntil,
      terms_accepted_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return Response.json({ message: error.message }, { status: 400 });

  return Response.json({ message: "Ad submitted! It'll appear once reviewed (usually within 24 hours).", id: ad.id });
}
