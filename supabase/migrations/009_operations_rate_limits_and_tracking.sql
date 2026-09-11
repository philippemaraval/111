alter table public.orders
  add column if not exists sendcloud_order_id text,
  add column if not exists shipping_status text not null default 'not_started',
  add column if not exists cancelled_at timestamptz,
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  event_type text not null,
  source text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists order_events_order_created_idx
  on public.order_events(order_id, created_at desc);

alter table public.order_events enable row level security;

create table if not exists public.api_rate_limits (
  key text primary key,
  window_started_at timestamptz not null,
  request_count integer not null check (request_count > 0)
);

alter table public.api_rate_limits enable row level security;

create table if not exists public.stock_alerts (
  id uuid primary key default gen_random_uuid(),
  neighborhood_id uuid not null references public.neighborhoods(id) on delete cascade,
  size text not null check (size in ('S', 'M', 'L', 'XL')),
  email text not null,
  notified_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  unique(neighborhood_id, size, email)
);

alter table public.stock_alerts enable row level security;

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  neighborhood_id uuid references public.neighborhoods(id) on delete set null,
  author_name text not null,
  rating integer not null check (rating between 1 and 5),
  body text not null,
  status text not null default 'pending' check (status in ('pending', 'published', 'rejected')),
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.reviews enable row level security;

create unique index if not exists reviews_order_neighborhood_unique
  on public.reviews(order_id, neighborhood_id)
  where order_id is not null and neighborhood_id is not null;

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'closed')),
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.contact_messages enable row level security;

create or replace function public.consume_rate_limit(rate_key text, max_requests integer, window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_time timestamptz := timezone('utc', now());
  current_count integer;
begin
  if max_requests < 1 or window_seconds < 1 then return false; end if;

  insert into public.api_rate_limits as limits(key, window_started_at, request_count)
  values (rate_key, current_time, 1)
  on conflict (key) do update
  set window_started_at = case when limits.window_started_at <= current_time - make_interval(secs => window_seconds) then current_time else limits.window_started_at end,
      request_count = case when limits.window_started_at <= current_time - make_interval(secs => window_seconds) then 1 else limits.request_count + 1 end
  returning request_count into current_count;

  return current_count <= max_requests;
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;

create or replace function public.create_pending_order(p_stripe_session_id text, p_items jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_order_id uuid;
begin
  if p_stripe_session_id is null or p_stripe_session_id = '' or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'invalid_order_payload' using errcode = '22023';
  end if;

  insert into public.orders(stripe_session_id, status)
  values (p_stripe_session_id, 'pending')
  returning id into new_order_id;

  insert into public.order_items(order_id, neighborhood_id, size, quantity, unit_price)
  select new_order_id, (item ->> 'neighborhood_id')::uuid, item ->> 'size',
    (item ->> 'quantity')::integer, (item ->> 'unit_price')::integer
  from jsonb_array_elements(p_items) as item;

  return new_order_id;
end;
$$;

revoke all on function public.create_pending_order(text, jsonb) from public, anon, authenticated;
grant execute on function public.create_pending_order(text, jsonb) to service_role;

create or replace function public.touch_order_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists touch_orders_updated_at on public.orders;
create trigger touch_orders_updated_at before update on public.orders
for each row execute function public.touch_order_updated_at();

-- Corrige aussi les installations ayant déjà appliqué la première version de 008 :
-- un remboursement passe normalement par refund_pending avant d'être confirmé.
create or replace function public.decrement_stock_on_paid_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  item record;
  current_stock integer;
begin
  if new.status = 'paid' and old.status is distinct from 'paid' then
    for item in
      select neighborhood_id, size, sum(quantity)::integer as quantity
      from public.order_items
      where order_id = new.id
      group by neighborhood_id, size
      order by neighborhood_id, size
    loop
      select coalesce((stock_by_size ->> item.size)::integer, 0)
      into current_stock
      from public.neighborhoods
      where id = item.neighborhood_id
      for update;

      if current_stock < item.quantity then
        raise exception 'insufficient_stock:%:%', item.neighborhood_id, item.size
          using errcode = 'P0001';
      end if;

      update public.neighborhoods
      set stock_by_size = jsonb_set(stock_by_size, array[item.size], to_jsonb(current_stock - item.quantity), true)
      where id = item.neighborhood_id;
    end loop;
  end if;

  if new.status = 'refunded' and old.status is distinct from 'refunded' then
    for item in
      select neighborhood_id, size, sum(quantity)::integer as quantity
      from public.order_items
      where order_id = new.id
      group by neighborhood_id, size
    loop
      update public.neighborhoods
      set stock_by_size = jsonb_set(
        stock_by_size,
        array[item.size],
        to_jsonb(coalesce((stock_by_size ->> item.size)::integer, 0) + item.quantity),
        true
      )
      where id = item.neighborhood_id;
    end loop;
  end if;

  return new;
end;
$$;
