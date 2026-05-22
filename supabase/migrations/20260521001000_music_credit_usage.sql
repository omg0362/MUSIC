create or replace function public.consume_user_credits(
  p_user_id uuid,
  p_credits integer
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  remaining_credits integer;
begin
  if p_credits <= 0 then
    raise exception 'Credits must be positive.';
  end if;

  update public.users
  set credits = credits - p_credits
  where id = p_user_id
    and credits >= p_credits
  returning credits into remaining_credits;

  return remaining_credits;
end;
$$;

create or replace function public.refund_user_credits(
  p_user_id uuid,
  p_credits integer
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  remaining_credits integer;
begin
  if p_credits <= 0 then
    raise exception 'Credits must be positive.';
  end if;

  update public.users
  set credits = credits + p_credits
  where id = p_user_id
  returning credits into remaining_credits;

  return remaining_credits;
end;
$$;
