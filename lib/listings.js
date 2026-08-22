// The first FREE_LISTING_LIMIT listings a seller posts (tracked by their
// phone number) are free. After that, each new listing costs LISTING_FEE
// PER MONTH — it stops being visible to the public once its paid period
// ends, until the seller renews via /renew.
export const FREE_LISTING_LIMIT = 3;
export const LISTING_FEE = 5000; // Naira, per month
export const ALIST_FEE = 10000; // Naira, per month — premium top-of-results placement
export const BILLING_PERIOD_DAYS = 30;

// Counts a seller's listings that count against their free quota — approved
// and pending both count (so someone can't get unlimited free listings by
// spamming submissions that sit in review), rejected listings don't count.
export async function countSellerListings(supabase, phone) {
  const { count } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("seller_phone", phone)
    .neq("status", "rejected");
  return count ?? 0;
}
