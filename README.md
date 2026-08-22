# Bizora — Business Directory & Product Marketplace

A multi-country platform combining a business/service directory with a
Jiji-style product marketplace (Next.js + Supabase + Paystack + Resend +
Google Maps).

## What's in here
- **Business directory** — businesses list free, pay ₦5,000/month to be Featured
- **Product marketplace** — sellers post products (first 3 free, then ₦5,000/month per listing), can upgrade any listing to A-List (₦10,000/month, top placement)
- **Self-serve homepage banner ads** — ₦20,000/month, admin-reviewed
- **Owner portal** — business owners self-manage their listing
- **Admin dashboard** — approve/reject/bulk-manage businesses, listings, and ads; CSV bulk import; analytics (views, growth, revenue trends)
- **Renewal page** (`/renew`) — sellers renew expiring paid listings or buy A-List, using just their phone number
- **Social sharing** — WhatsApp/Facebook/X share buttons with rich link previews on product pages
- **OpenStreetMap import script** (`scripts/import-osm.mjs`) — bulk-seed real businesses legally (Google Maps data cannot be scraped)

## Setup
1. `npm install`
2. In Supabase → SQL Editor, run these files **in this exact order**:
   1. `supabase/setup.sql` (core schema — replace `YOUR_EMAIL` with your admin email first)
   2. `supabase/marketplace-setup.sql` (product listings table)
   3. `supabase/analytics-setup.sql` (view tracking)
   4. `supabase/ads-and-billing-setup.sql` (banner ads + monthly listing billing)
3. Supabase → Authentication → Users → Add user (your email/password, auto-confirm) → this is your `/admin` login.
4. Supabase → Storage → business-images → set file size limit 2MB, allowed types image/*.
5. Copy `.env.example` to `.env.local` and fill in your keys (Supabase, Paystack, Resend, optional Google Maps + GA). Set `SITE_URL` to your real domain once deployed — it's used for sitemap links and social share previews.
6. `npm run dev` → http://localhost:3000

## Go live
- Push to GitHub → import in vercel.com → add the same env vars in Vercel.
- Paystack → Settings → Webhooks → add `https://YOUR_SITE/api/webhook/paystack`.
- Test the business flow: submit at `/add-business`, approve at `/admin`, pay with test card 4084 0840 8408 4081 (CVV 408, PIN 0000, OTP 123456).
- Test the marketplace flow: post a product at `/sell` (same phone number 4 times to trigger the paid tier), approve at `/admin`, check `/renew` and the A-List upsell.

## Pricing reference (all editable in `lib/listings.js` and `lib/ads.js`)
| What | Price |
|---|---|
| Business Featured | ₦5,000/month |
| Product listing (after 3 free) | ₦5,000/month |
| Product A-List | ₦10,000/month |
| Homepage banner ad | ₦20,000/month |

