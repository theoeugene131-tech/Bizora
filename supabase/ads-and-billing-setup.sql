-- ================= RECURRING LISTING FEE + SELF-SERVE ADVERTS =================
-- Run this in Supabase SQL Editor after your other setup files.

-- 1. Track when a paid listing's month runs out. NULL = free listing
--    (first 3 per seller), never expires on its own. A set date = paid
--    listing, becomes invisible to the public once that date passes,
--    until the seller renews.
alter table listings add column if not exists paid_until timestamptz;

-- 2. Self-serve homepage banner adverts (₦20,000/month)
create table if not exists ads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  title text not null,
  text text not null,
  cta text not null default 'Learn more',
  link text not null,
  bg_color text not null default 'bg-green-700',
  advertiser_name text,
  advertiser_email text,
  advertiser_phone text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  paid_until timestamptz,
  terms_accepted_at timestamptz
);

alter table ads enable row level security;

create policy "public_read_active_ads" on ads
  for select using (status = 'approved');

create policy "admin_read_ads" on ads for select to authenticated
  using (exists (select 1 from admins a where a.email = auth.email()));
create policy "admin_update_ads" on ads for update to authenticated
  using (exists (select 1 from admins a where a.email = auth.email()));
create policy "admin_delete_ads" on ads for delete to authenticated
  using (exists (select 1 from admins a where a.email = auth.email()));

create index if not exists ads_status_idx on ads (status);
