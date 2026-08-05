-- KCS Opportunity Program - Supabase setup
-- Run this file in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
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
  province text,
  residential_address text not null,
  motivation text,
  payment_reference text not null unique,
  payment_operator text,
  transaction_id text,
  payment_proof_path text,
  admin_message text,
  result_message text,
  result_email_sent_at timestamptz,
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

alter table public.applications
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists province text,
  add column if not exists motivation text,
  add column if not exists payment_operator text,
  add column if not exists transaction_id text,
  add column if not exists payment_proof_path text,
  add column if not exists admin_message text,
  add column if not exists result_message text,
  add column if not exists result_email_sent_at timestamptz;

create index if not exists applications_email_idx on public.applications (lower(email));
create index if not exists applications_user_id_idx on public.applications (user_id);
create index if not exists applications_province_idx on public.applications (province);
create index if not exists applications_payment_reference_idx on public.applications (payment_reference);
create index if not exists applications_status_idx on public.applications (status);
create index if not exists applications_created_at_idx on public.applications (created_at desc);

create table if not exists public.result_email_queue (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  recipient_email text not null,
  subject text not null default 'Résultat de votre candidature KCS',
  message text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  error_message text,
  constraint result_email_queue_status_check check (status in ('pending', 'sent', 'failed'))
);

alter table public.result_email_queue enable row level security;

create index if not exists result_email_queue_status_idx on public.result_email_queue (status, created_at);

drop policy if exists "Only service role can manage result email queue" on public.result_email_queue;

create policy "Only service role can manage result email queue"
on public.result_email_queue
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

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

create or replace function public.enqueue_result_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.result_message is not null
    and length(trim(new.result_message)) > 0
    and (
      old.result_message is distinct from new.result_message
      or old.status is distinct from new.status
    )
  then
    insert into public.result_email_queue (application_id, recipient_email, message)
    values (new.id, new.email, new.result_message);
  end if;

  return new;
end;
$$;

drop trigger if exists enqueue_application_result_email on public.applications;

create trigger enqueue_application_result_email
after update of status, result_message on public.applications
for each row
execute function public.enqueue_result_email();

alter table public.applications enable row level security;

drop policy if exists "Public applicants can submit applications" on public.applications;
drop policy if exists "Authenticated users can read own application" on public.applications;
drop policy if exists "Authenticated admins can manage applications" on public.applications;
drop policy if exists "Applicants can update own payment details" on public.applications;

create policy "Public applicants can submit applications"
on public.applications
for insert
to anon, authenticated
with check (
  status = 'submitted'
  and payment_reference like 'KCS-2026-%'
  and length(trim(first_name)) >= 1
  and length(trim(last_name)) >= 1
  and length(trim(email)) >= 5
  and length(trim(phone)) >= 5
  and length(trim(identity_number)) >= 2
  and (province is null or length(trim(province)) >= 2)
  and length(trim(residential_address)) >= 3
  and (motivation is null or length(trim(motivation)) >= 10)
  and (payment_operator is null or length(trim(payment_operator)) >= 2)
  and (transaction_id is null or length(trim(transaction_id)) >= 3)
  and (payment_proof_path is null or length(trim(payment_proof_path)) >= 3)
);

-- Optional authenticated applicant read access.
-- This works when the Supabase Auth user email matches the application email.
create policy "Authenticated users can read own application"
on public.applications
for select
to authenticated
using (
  user_id = auth.uid()
  or lower(email) = lower(auth.jwt() ->> 'email')
);

create policy "Applicants can update own payment details"
on public.applications
for update
to authenticated
using (
  user_id = auth.uid()
  or lower(email) = lower(auth.jwt() ->> 'email')
)
with check (
  user_id = auth.uid()
  or lower(email) = lower(auth.jwt() ->> 'email')
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-proofs',
  'payment-proofs',
  false,
  10485760,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Applicants can upload payment proofs" on storage.objects;
drop policy if exists "Applicants can read own payment proofs" on storage.objects;

create policy "Applicants can upload payment proofs"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'payment-proofs');

create policy "Applicants can read own payment proofs"
on storage.objects
for select
to authenticated
using (bucket_id = 'payment-proofs');

-- Admin access is intentionally not granted to the public publishable key.
-- For an admin dashboard, query through a server route with SUPABASE_SERVICE_ROLE_KEY
-- or add a separate profiles/roles table and admin-only RLS policy.

grant usage on schema public to anon, authenticated;
grant insert on public.applications to anon, authenticated;
grant update (payment_operator, transaction_id, payment_proof_path) on public.applications to authenticated;
grant select on public.applications to authenticated;
grant select, update on public.result_email_queue to service_role;

create or replace view public.admin_application_metrics as
select
  id,
  first_name,
  last_name,
  email,
  phone,
  date_of_birth,
  country_of_birth,
  education_level,
  identity_number,
  guardian_name,
  guardian_phone,
  province,
  residential_address,
  motivation,
  status,
  payment_operator,
  transaction_id,
  payment_proof_path,
  payment_reference,
  result_message,
  admin_message,
  updated_at,
  created_at
from public.applications;

grant select on public.admin_application_metrics to anon, authenticated;
