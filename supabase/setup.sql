-- KCS Opportunity Program - Supabase setup
-- Run this file in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  date_of_birth date not null,
  country_of_birth text not null,
  email text not null,
  phone text not null,
  education_level text not null,
  identity_number text not null,
  guardian_name text,
  guardian_phone text,
  residential_address text not null,
  payment_reference text not null unique,
  status text not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint applications_status_check check (
    status in (
      'submitted',
      'payment_pending',
      'payment_under_review',
      'documents_required',
      'under_review',
      'eligible',
      'ineligible',
      'approved',
      'rejected'
    )
  ),
  constraint applications_email_check check (
    email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  )
);

create index if not exists applications_email_idx on public.applications (lower(email));
create index if not exists applications_payment_reference_idx on public.applications (payment_reference);
create index if not exists applications_status_idx on public.applications (status);
create index if not exists applications_created_at_idx on public.applications (created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_applications_updated_at on public.applications;

create trigger set_applications_updated_at
before update on public.applications
for each row
execute function public.set_updated_at();

alter table public.applications enable row level security;

drop policy if exists "Public applicants can submit applications" on public.applications;
drop policy if exists "Authenticated users can read own application" on public.applications;
drop policy if exists "Authenticated admins can manage applications" on public.applications;

create policy "Public applicants can submit applications"
on public.applications
for insert
to anon, authenticated
with check (
  status = 'submitted'
  and payment_reference like 'KCS-2026-%'
  and length(trim(first_name)) >= 2
  and length(trim(last_name)) >= 2
  and length(trim(email)) >= 5
  and length(trim(phone)) >= 6
  and length(trim(identity_number)) >= 3
  and length(trim(residential_address)) >= 8
);

-- Optional authenticated applicant read access.
-- This works when the Supabase Auth user email matches the application email.
create policy "Authenticated users can read own application"
on public.applications
for select
to authenticated
using (lower(email) = lower(auth.jwt() ->> 'email'));

-- Admin access is intentionally not granted to the public publishable key.
-- For an admin dashboard, query through a server route with SUPABASE_SERVICE_ROLE_KEY
-- or add a separate profiles/roles table and admin-only RLS policy.

grant usage on schema public to anon, authenticated;
grant insert on public.applications to anon, authenticated;
grant select on public.applications to authenticated;
