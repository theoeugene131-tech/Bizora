# Bizora — Local Business Directory

A multi-country business directory (Next.js + Supabase + Paystack + Resend + Google Maps).

## Setup
1. `npm install`
2. Create a free project at supabase.com → SQL Editor → run `supabase/setup.sql`
   (replace YOUR_EMAIL in the file with your admin email first).
3. Supabase → Authentication → Users → Add user (your email/password, auto-confirm) → this is your /admin login.
4. Supabase → Storage → business-images → set file size limit 2MB, allowed types image/*.
5. Copy `.env.example` to `.env.local` and fill in your keys (Supabase, Paystack, Resend, optional Google Maps + GA).
6. `npm run dev` → http://localhost:3000

## Go live
- Push to GitHub → import in vercel.com → add the same env vars in Vercel.
- Paystack → Settings → Webhooks → add `https://YOUR_SITE/api/webhook/paystack`.
- Submit a business at /add-business, approve it at /admin, test payment with card 4084 0840 8408 4081 (CVV 408, PIN 0000, OTP 123456).
