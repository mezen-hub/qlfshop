-- QLF SHOP CHROME — Supabase database setup
-- Run the whole file in Supabase > SQL Editor > New query.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id text primary key,
  name text not null,
  collection text not null,
  label text not null default '',
  color text not null default '',
  image_url text not null default '',
  price integer not null default 55 check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null default '',
  customer_phone text not null default '',
  customer_address text not null default '',
  items jsonb not null default '[]'::jsonb check (jsonb_typeof(items) = 'array'),
  total integer not null default 0 check (total >= 0),
  status text not null default 'pending' check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin'))
);

create or replace function public.is_qlf_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.user_roles enable row level security;

-- Visitors can only see active products. Admins can see all products.
drop policy if exists "Public reads active products" on public.products;
create policy "Public reads active products" on public.products
for select to anon, authenticated
using (active = true or public.is_qlf_admin());

drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products" on public.products
for all to authenticated
using (public.is_qlf_admin())
with check (public.is_qlf_admin());

-- Visitors can create an order, but cannot read or edit orders.
drop policy if exists "Visitors create pending orders" on public.orders;
create policy "Visitors create pending orders" on public.orders
for insert to anon, authenticated
with check (
  status = 'pending'
  and jsonb_typeof(items) = 'array'
  and total >= 0
  and length(customer_name) <= 100
  and length(customer_phone) <= 40
  and length(customer_address) <= 500
);

drop policy if exists "Admins read orders" on public.orders;
create policy "Admins read orders" on public.orders
for select to authenticated
using (public.is_qlf_admin());

drop policy if exists "Admins update orders" on public.orders;
create policy "Admins update orders" on public.orders
for update to authenticated
using (public.is_qlf_admin())
with check (public.is_qlf_admin());

drop policy if exists "Admins read roles" on public.user_roles;
create policy "Admins read roles" on public.user_roles
for select to authenticated
using (public.is_qlf_admin() or user_id = auth.uid());

-- Initial QLF catalogue. Images use the existing GitHub filenames from the site.
insert into public.products (id,name,collection,label,color,image_url,price,stock,active) values
('dl-gris','Dans la légende','dans-legende','DANS LA LÉGENDE','Gris','https://raw.githubusercontent.com/mezen-hub/qlfshop/main/dans-legende-gris.jpg',55,10,true),
('dl-rose','Dans la légende','dans-legende','DANS LA LÉGENDE','Rose','https://raw.githubusercontent.com/mezen-hub/qlfshop/main/dans-legende-rose.jpg',55,10,true),
('dl-turquoise','Dans la légende','dans-legende','DANS LA LÉGENDE','Turquoise','https://raw.githubusercontent.com/mezen-hub/qlfshop/main/dans-legende-turquoise.jpg',55,10,true),
('dl-blanc','Dans la légende','dans-legende','DANS LA LÉGENDE','Blanc','https://raw.githubusercontent.com/mezen-hub/qlfshop/main/dans-legende-blanc.jpg',55,10,true),
('dl-noir','Dans la légende','dans-legende','DANS LA LÉGENDE','Noir','https://raw.githubusercontent.com/mezen-hub/qlfshop/main/dans-legende-noir.jpg',55,10,true),
('df-gris','Deux frères','deux-freres','DEUX FRÈRES','Gris','https://raw.githubusercontent.com/mezen-hub/qlfshop/main/deux-freres-gris.jpg',55,10,true),
('df-noir','Deux frères','deux-freres','DEUX FRÈRES','Noir','https://raw.githubusercontent.com/mezen-hub/qlfshop/main/deux-freres-noir.jpg',55,10,true),
('df-marine','Deux frères','deux-freres','DEUX FRÈRES','Bleu marine','https://raw.githubusercontent.com/mezen-hub/qlfshop/main/deux-freres-marine.jpg',55,10,true),
('df-turquoise','Deux frères','deux-freres','DEUX FRÈRES','Turquoise','https://raw.githubusercontent.com/mezen-hub/qlfshop/main/deux-freres-turquoise.jpg',55,10,true),
('df-blanc','Deux frères','deux-freres','DEUX FRÈRES','Blanc','https://raw.githubusercontent.com/mezen-hub/qlfshop/main/deux-freres-blanc.jpg',55,10,true)
on conflict (id) do nothing;

-- IMPORTANT: after creating your admin account in Supabase Authentication > Users,
-- copy its UUID and run this separately (replace the UUID):
-- insert into public.user_roles (user_id, role)
-- values ('PASTE-ADMIN-USER-UUID-HERE', 'admin')
-- on conflict (user_id) do update set role = excluded.role;
