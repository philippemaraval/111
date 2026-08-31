update public.neighborhoods
set price = 25;

alter table public.neighborhoods
alter column price set default 25;
