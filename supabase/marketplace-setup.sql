-- ================= PRODUCT LISTINGS (Jiji-style marketplace) =================
-- Run this in Supabase SQL Editor. It adds a new "listings" table for
-- individual products sellers post directly (phones, electronics, etc.),
-- separate from the "businesses" directory. Reuses the existing
-- business-images storage bucket for photos — no new storage setup needed.

create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  slug text unique not null,
  title text not null,
  category text not null,
  description text,
  price numeric not null,
  condition text not null default 'used' check (condition in ('new', 'used', 'refurbished')),
  image_url text,
  city text not null,
  state text not null,
  country text not null default 'ng',
  seller_name text,
  seller_phone text not null,
  seller_email text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  is_featured boolean not null default false,
  featured_until timestamptz,
  paid boolean not null default false,
  terms_accepted_at timestamptz
);

alter table listings enable row level security;

-- Public can only see approved listings
create policy "public_read_approved_listings" on listings
  for select using (status = 'approved');

-- Admin (reuses the same admins table from your main setup.sql)
create policy "admin_read_listings" on listings for select to authenticated
  using (exists (select 1 from admins a where a.email = auth.email()));
create policy "admin_update_listings" on listings for update to authenticated
  using (exists (select 1 from admins a where a.email = auth.email()));
create policy "admin_delete_listings" on listings for delete to authenticated
  using (exists (select 1 from admins a where a.email = auth.email()));

create index if not exists listings_status_idx on listings (status);
create index if not exists listings_category_idx on listings (category);
create index if not exists listings_seller_phone_idx on listings (seller_phone);
create index if not exists listings_country_idx on listings (country);
