alter table public.votes
  add column if not exists newsletter_consent boolean not null default false;
