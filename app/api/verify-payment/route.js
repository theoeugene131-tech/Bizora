import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyPaystackTransaction, activateFeaturedListing } from "@/lib/paystack";

export async function POST(request) {
  const { reference } = await request.json();
  if (!reference) return Response.json({ message: "Missing reference" }, { status: 400 });

  const result = await verifyPaystackTransaction(reference);
  if (!result?.status) {
    return Response.json({ message: "Payment could not be verified" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  await activateFeaturedListing({ supabase, reference, data: result.data });

  return Response.json({ message: "Payment verified — your listing is now featured! 🎉" });
}
