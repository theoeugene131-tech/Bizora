-- ================= VIEW TRACKING (for owner analytics) =================
-- Run this in Supabase SQL Editor. Adds a "views" counter to businesses
-- and listings, plus safe increment functions that visitors' pages call.
-- These functions run as SECURITY DEFINER so anonymous visitors can bump
-- the view count without being granted any other write access — they can
-- only increment views on already-approved rows, nothing else.

alter table businesses add column if not exists views integer not null default 0;
alter table listings add column if not exists views integer not null default 0;

create or replace function increment_business_views(business_slug text)
returns void
language sql
security definer
set search_path = public
as $$
  update businesses set views = views + 1 where slug = business_slug and status = 'approved';
$$;

create or replace function increment_listing_views(listing_slug text)
returns void
language sql
security definer
set search_path = public
as $$
  update listings set views = views + 1 where slug = listing_slug and status = 'approved';
$$;

grant execute on function increment_business_views(text) to anon, authenticated;
grant execute on function increment_listing_views(text) to anon, authenticated;
