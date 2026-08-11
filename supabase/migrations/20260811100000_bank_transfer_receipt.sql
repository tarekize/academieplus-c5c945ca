-- Paiement par virement bancaire : l'élève/parent choisit carte ou virement
-- sur /paiement. Pour un virement, il doit joindre une image du reçu, que
-- l'admin consulte sur /admin/paiements avant de valider ou rejeter.

alter table public.payments
  add column if not exists payment_method text not null default 'card',
  add column if not exists receipt_url text;

alter table public.payments
  add constraint payments_payment_method_check
  check (payment_method in ('card', 'bank_transfer'));

comment on column public.payments.receipt_url is 'Chemin du reçu de virement dans le bucket privé payment-receipts (requis quand payment_method = bank_transfer).';

-- Bucket privé : chaque utilisateur dépose son reçu dans son propre dossier
-- (userId/...), lisible par lui-même et par les admins pour la vérification.
insert into storage.buckets (id, name, public)
values ('payment-receipts', 'payment-receipts', false)
on conflict (id) do nothing;

drop policy if exists "Users can upload their own payment receipts" on storage.objects;
create policy "Users can upload their own payment receipts"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'payment-receipts' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users and admins can view payment receipts" on storage.objects;
create policy "Users and admins can view payment receipts"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'payment-receipts'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.has_role(auth.uid(), 'admin'::public.app_role))
  );
