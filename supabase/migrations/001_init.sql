create extension if not exists "pgcrypto";

create table if not exists public.neighborhoods (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  arrondissement integer not null check (arrondissement between 1 and 16),
  price numeric(10,2) not null default 39,
  stock_by_size jsonb not null default '{"S": 0, "M": 0, "L": 0, "XL": 0}'::jsonb,
  image_url text not null,
  description_history text not null,
  coordinates jsonb not null default '{"lat": 43.2965, "lng": 5.3698}'::jsonb,
  is_available boolean not null default false,
  release_date date,
  seo_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  neighborhood_id uuid not null references public.neighborhoods(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (email, neighborhood_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text not null unique,
  email text,
  amount_total integer,
  currency text,
  status text not null default 'pending',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  neighborhood_id uuid not null references public.neighborhoods(id) on delete restrict,
  size text not null check (size in ('S', 'M', 'L', 'XL')),
  quantity integer not null default 1 check (quantity > 0),
  unit_price integer not null
);

create index if not exists neighborhoods_arrondissement_idx
  on public.neighborhoods(arrondissement);

create index if not exists neighborhoods_available_idx
  on public.neighborhoods(is_available);

create index if not exists votes_neighborhood_idx
  on public.votes(neighborhood_id);

create index if not exists order_items_neighborhood_idx
  on public.order_items(neighborhood_id);

create or replace view public.neighborhood_metrics as
select
  n.id as neighborhood_id,
  coalesce(v.vote_count, 0)::int as vote_count,
  coalesce(oi.sales_count, 0)::int as sales_count,
  (coalesce(v.vote_count, 0) + coalesce(oi.sales_count, 0) * 3)::int as popularity_score
from public.neighborhoods n
left join (
  select neighborhood_id, count(*) as vote_count
  from public.votes
  group by neighborhood_id
) v on v.neighborhood_id = n.id
left join (
  select oi.neighborhood_id, sum(oi.quantity) as sales_count
  from public.order_items oi
  inner join public.orders o on o.id = oi.order_id
  where o.status = 'paid'
  group by oi.neighborhood_id
) oi on oi.neighborhood_id = n.id;

alter table public.neighborhoods enable row level security;
alter table public.votes enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Public can read neighborhoods"
  on public.neighborhoods
  for select
  using (true);
