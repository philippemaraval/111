create or replace function public.consume_rate_limit(rate_key text, max_requests integer, window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  current_count integer;
begin
  if max_requests < 1 or window_seconds < 1 then return false; end if;

  insert into public.api_rate_limits as limits(key, window_started_at, request_count)
  values (rate_key, v_now, 1)
  on conflict (key) do update
  set window_started_at = case when limits.window_started_at <= v_now - make_interval(secs => window_seconds) then v_now else limits.window_started_at end,
      request_count = case when limits.window_started_at <= v_now - make_interval(secs => window_seconds) then 1 else limits.request_count + 1 end
  returning request_count into current_count;

  return current_count <= max_requests;
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;
