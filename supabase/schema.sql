create extension if not exists pgcrypto;

create table if not exists public.records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  category text not null check (char_length(trim(category)) > 0),
  amount numeric(12, 2) not null check (amount > 0),
  date date not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists records_user_id_idx on public.records(user_id);
create index if not exists records_user_date_idx on public.records(user_id, date desc);
create index if not exists records_user_type_idx on public.records(user_id, type);
create index if not exists records_user_category_idx on public.records(user_id, category);

alter table public.records enable row level security;

create table if not exists public.monthly_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month text not null check (month ~ '^[0-9]{4}-[0-9]{2}$'),
  budget numeric(12, 2) not null check (budget > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, month)
);

create index if not exists monthly_budgets_user_month_idx on public.monthly_budgets(user_id, month);

alter table public.monthly_budgets enable row level security;

drop policy if exists "Users can select own records" on public.records;
create policy "Users can select own records"
on public.records
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own records" on public.records;
create policy "Users can insert own records"
on public.records
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own records" on public.records;
create policy "Users can update own records"
on public.records
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own records" on public.records;
create policy "Users can delete own records"
on public.records
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can select own monthly budgets" on public.monthly_budgets;
create policy "Users can select own monthly budgets"
on public.monthly_budgets
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own monthly budgets" on public.monthly_budgets;
create policy "Users can insert own monthly budgets"
on public.monthly_budgets
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own monthly budgets" on public.monthly_budgets;
create policy "Users can update own monthly budgets"
on public.monthly_budgets
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own monthly budgets" on public.monthly_budgets;
create policy "Users can delete own monthly budgets"
on public.monthly_budgets
for delete
to authenticated
using (auth.uid() = user_id);
