create or replace function public.decrement_stock_on_paid_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  item record;
begin
  if new.status = 'paid' and old.status is distinct from 'paid' then
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
        to_jsonb(greatest(0, coalesce((stock_by_size ->> item.size)::integer, 0) - item.quantity)),
        true
      )
      where id = item.neighborhood_id;
    end loop;
  end if;
  return new;
end;
$$;

drop trigger if exists decrement_stock_after_payment on public.orders;

create trigger decrement_stock_after_payment
after update of status on public.orders
for each row
execute function public.decrement_stock_on_paid_order();
