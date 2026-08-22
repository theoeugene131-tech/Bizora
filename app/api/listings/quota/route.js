import { getSupabaseAdmin } from "@/lib/supabase";
import { countSellerListings, FREE_LISTING_LIMIT, LISTING_FEE } from "@/lib/listings";

export async function POST(request) {
  const { phone } = await request.json();
  if (!phone?.trim()) return Response.json({ message: "Phone required" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const used = await countSellerListings(supabase, phone.trim());
  const requiresPayment = used >= FREE_LISTING_LIMIT;

  return Response.json({
    used,
    freeLimit: FREE_LISTING_LIMIT,
    freeRemaining: Math.max(0, FREE_LISTING_LIMIT - used),
    requiresPayment,
    fee: LISTING_FEE,
  });
}
