-- KCS - Correction du stockage des preuves de paiement
-- A executer dans Supabase SQL Editor si l'upload affiche une erreur de stockage.

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
    'application/pdf',
    'text/plain'
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
