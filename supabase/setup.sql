-- ================= TABLES =================
create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  slug text unique not null,
  name text not null,
  category text not null,
  description text,
  street text,
  city text,
  state text,
  country text not null default 'ng',
  phone text,
  email text,
  website text,
  image_url text,
  lat double precision,
  lng double precision,
  place_id text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  is_featured boolean not null default false,
  featured_until timestamptz,
  submitter_email text,
  terms_accepted_at timestamptz
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  price numeric not null,
  image_url text
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  reference text unique not null,
  email text,
  plan text,
  amount numeric,
  status text default 'pending'
);

create table if not exists admins (email text primary key);
insert into admins (email) values ('YOUR_EMAIL@gmail.com') on conflict do nothing;

-- ================= SECURITY =================
alter table businesses enable row level security;
alter table products enable row level security;
alter table payments enable row level security;
alter table admins enable row level security;

create policy "admins_read_self" on admins for select to authenticated using (email = auth.email());

-- Public: approved listings only
create policy "public_read_approved" on businesses for select using (status = 'approved');
create policy "public_read_products" on products for select using (
  exists (select 1 from businesses b where b.id = business_id and b.status = 'approved')
);

-- Admin (emails in admins table)
create policy "admin_read_businesses" on businesses for select to authenticated
  using (exists (select 1 from admins a where a.email = auth.email()));
create policy "admin_update_businesses" on businesses for update to authenticated
  using (exists (select 1 from admins a where a.email = auth.email()));
create policy "admin_delete_businesses" on businesses for delete to authenticated
  using (exists (select 1 from admins a where a.email = auth.email()));
create policy "admin_read_payments" on payments for select to authenticated
  using (exists (select 1 from admins a where a.email = auth.email()));
create policy "admin_read_products" on products for select to authenticated
  using (exists (select 1 from admins a where a.email = auth.email()));

-- Owners: only their own listings
create policy "owner_read_own" on businesses for select to authenticated
  using (submitter_email = auth.email());
create policy "owner_update_own" on businesses for update to authenticated
  using (submitter_email = auth.email()) with check (submitter_email = auth.email());
create policy "owner_manage_own_products" on products for all to authenticated
  using (exists (select 1 from businesses b where b.id = business_id and b.submitter_email = auth.email()))
  with check (exists (select 1 from businesses b where b.id = business_id and b.submitter_email = auth.email()));

-- Owners can edit content fields but NEVER status/featured/payments
revoke update on businesses from authenticated;
grant update (name, description, phone, email, website, street, city, state, image_url, lat, lng, place_id)
  on businesses to authenticated;

-- ================= IMAGE STORAGE =================
insert into storage.buckets (id, name, public)
values ('business-images', 'business-images', true) on conflict (id) do nothing;

create policy "anon_upload_business_images" on storage.objects for insert to anon
  with check (bucket_id = 'business-images');
create policy "auth_upload_business_images" on storage.objects for insert to authenticated
  with check (bucket_id = 'business-images');
create policy "auth_update_business_images" on storage.objects for update to authenticated
  using (bucket_id = 'business-images');
create policy "admin_manage_storage" on storage.objects for all to authenticated
  using (exists (select 1 from admins a where a.email = auth.email()));

-- ================= SEED DATA (Nigeria) =================
insert into businesses (slug, name, category, description, street, city, state, phone, email, website, status) values
('adire-elegance', 'Adire Elegance', 'Fashion', 'Handmade adire and ankara fashion. Custom tailoring and fabrics sold by the yard.', '23 Balogun Market Road', 'Lagos Island', 'Lagos', '+234 802 345 6789', 'hello@adireelegance.ng', 'https://adireelegance.ng', 'approved'),
('mama-nkechi-kitchen', 'Mama Nkechi Kitchen', 'Food & Restaurant', 'Local restaurant serving jollof rice, egusi, amala and more. Dine-in, takeaway and delivery within Abuja.', 'Plot 45 Adetokunbo Ademola Crescent', 'Wuse II', 'Abuja (FCT)', '+234 803 456 7890', 'orders@mamankechi.ng', null, 'approved'),
('ph-tech-hub', 'PH Tech Hub', 'Tech & Electronics', 'Laptops, phones and accessories sales plus repairs. Genuine products with warranty.', '10 Aba Road', 'Port Harcourt', 'Rivers', '+234 805 678 1234', 'support@phtechhub.ng', 'https://phtechhub.ng', 'approved'),
('swift-rider-logistics', 'Swift Rider Logistics', 'Logistics', 'Same-day delivery in Enugu, nationwide waybill service and e-commerce fulfilment.', '7 Zik Avenue', 'Enugu', 'Enugu', '+234 806 789 2345', 'bookings@swiftrider.ng', null, 'approved'),
('glow-by-amara', 'Glow by Amara', 'Beauty & Cosmetics', 'Skincare made with natural African ingredients — black soap, shea butter and body oils.', '3 Palace Road', 'Ibadan', 'Oyo', '+234 807 890 3456', 'glowbyamara@gmail.com', null, 'approved');

insert into products (business_id, name, price)
select b.id, v.name, v.price
from businesses b
join (values
  ('adire-elegance', 'Adire Fabric (5 yards)', 15000),
  ('adire-elegance', 'Custom Ankara Dress', 35000),
  ('adire-elegance', 'Gele & Ipele Set', 12000),
  ('mama-nkechi-kitchen', 'Jollof Rice + Chicken', 3500),
  ('mama-nkechi-kitchen', 'Egusi Soup (1 litre)', 5000),
  ('mama-nkechi-kitchen', 'Party Tray (10 people)', 45000),
  ('ph-tech-hub', 'HP Laptop 15"', 450000),
  ('ph-tech-hub', 'Phone Screen Repair', 25000),
  ('ph-tech-hub', '20,000mAh Power Bank', 18000),
  ('swift-rider-logistics', 'Same-day Delivery (Enugu)', 2000),
  ('swift-rider-logistics', 'Nationwide Waybill (per kg)', 1500),
  ('glow-by-amara', 'Raw Shea Butter (500g)', 4500),
  ('glow-by-amara', 'African Black Soap', 2000),
  ('glow-by-amara', 'Body Oil Set', 8500)
) as v(slug, name, price) on b.slug = v.slug;
