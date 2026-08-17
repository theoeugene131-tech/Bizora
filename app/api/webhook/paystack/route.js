import crypto from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { activateFeaturedListing } from "@/lib/paystack";

export async function POST(request) {
  const rawBody = await request.text();

  const signature = request.headers.get("x-paystack-signature");
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest("hex");

  if (hash !== signature) {
    return Response.json({ message: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "charge.success") {
    const supabase = getSupabaseAdmin();
    await activateFeaturedListing({
      supabase,
      reference: event.data.reference,
      data: event.data,
    });
  }

  return Response.json({ received: true });
}
