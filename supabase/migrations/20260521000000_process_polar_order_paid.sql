alter table public.payments
  add column if not exists polar_order_id text,
  add column if not exists product_id text,
  add column if not exists amount integer,
  add column if not exists currency text,
  add column if not exists paid_at timestamptz,
  add column if not exists raw_event jsonb;

create or replace function public.process_polar_order_paid(
  p_user_id uuid,
  p_checkout_id text,
  p_credits integer,
  p_status text,
  p_polar_order_id text default null,
  p_product_id text default null,
  p_amount integer default null,
  p_currency text default null,
  p_raw_event jsonb default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_payment_id uuid;
begin
  insert into public.payments (
    user_id,
    checkout_id,
    credits,
    status,
    polar_order_id,
    product_id,
    amount,
    currency,
    paid_at,
    raw_event
  )
  values (
    p_user_id,
    p_checkout_id,
    p_credits,
    p_status,
    p_polar_order_id,
    p_product_id,
    p_amount,
    p_currency,
    now(),
    p_raw_event
  )
  on conflict (checkout_id) do nothing
  returning id into inserted_payment_id;

  if inserted_payment_id is null then
    return false;
  end if;

  update public.users
  set credits = credits + p_credits
  where id = p_user_id;

  return true;
end;
$$;
