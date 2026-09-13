create table if not exists public.email_jobs (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('contact_notification', 'stock_back', 'review_request')),
  recipient text not null,
  subject text not null,
  body text not null,
  reply_to text,
  dedupe_key text unique,
  status text not null default 'pending' check (status in ('pending', 'sending', 'sent', 'failed')),
  attempts integer not null default 0,
  available_at timestamptz not null default timezone('utc', now()),
  sent_at timestamptz,
  last_error text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists email_jobs_dispatch_idx
  on public.email_jobs(status, available_at, created_at);

alter table public.email_jobs enable row level security;

create or replace function public.claim_email_jobs(max_jobs integer default 20)
returns setof public.email_jobs
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  update public.email_jobs
  set status = 'sending', attempts = attempts + 1
  where id in (
    select id from public.email_jobs
    where status in ('pending', 'failed')
      and available_at <= timezone('utc', now())
      and attempts < 5
    order by created_at
    for update skip locked
    limit greatest(1, least(max_jobs, 100))
  )
  returning *;
end;
$$;

revoke all on function public.claim_email_jobs(integer) from public, anon, authenticated;
grant execute on function public.claim_email_jobs(integer) to service_role;
