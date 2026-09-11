alter table public.orders
  add column if not exists sendcloud_imported_at timestamptz,
  add column if not exists sendcloud_error text,
  add column if not exists refunded_at timestamptz;

update public.neighborhoods
set image_url = '/illustrations/la-joliette-plat-face.webp'
where (seo_metadata ->> 'slug') = 'la-joliette';

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
      set stock_by_size = jsonb_set(
        stock_by_size,
        array[item.size],
        to_jsonb(current_stock - item.quantity),
        true
      )
      where id = item.neighborhood_id;
    end loop;
  end if;

  if new.status = 'refunded' and old.status = 'paid' then
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
