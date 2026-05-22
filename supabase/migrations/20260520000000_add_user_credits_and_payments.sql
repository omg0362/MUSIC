alter table public.users
  add column if not exists credits integer not null default 0;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'users_credits_nonnegative'
      and conrelid = 'public.users'::regclass
  ) then
    alter table public.users
      add constraint users_credits_nonnegative check (credits >= 0);
  end if;
end $$;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  checkout_id text not null unique,
  credits integer not null check (credits > 0),
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'payments'
      and policyname = 'Users can read their own payments'
  ) then
    create policy "Users can read their own payments"
      on public.payments
      for select
      using (auth.uid() = user_id);
  end if;
end $$;
