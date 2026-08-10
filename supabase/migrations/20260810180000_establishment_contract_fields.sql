-- Contrat/Établissement (AdminContrats.tsx) ne permettait de gérer que les
-- dates de début/fin de contrat sur profiles. La liste d'anomalies demande
-- : délai de préavis, durée du contrat, dépôt d'un document, notes,
-- effectifs élèves/enseignants, contacts directeur/adjoint, email général,
-- adresse (wilaya/ville existent déjà sur profiles, partagés avec les élèves).

alter table public.profiles
  add column if not exists address text,
  add column if not exists notice_period_days integer,
  add column if not exists contract_duration_months integer,
  add column if not exists contract_document_url text,
  add column if not exists contract_notes text,
  add column if not exists student_count integer,
  add column if not exists teacher_count integer,
  add column if not exists director_name text,
  add column if not exists director_contact text,
  add column if not exists deputy_name text,
  add column if not exists deputy_contact text,
  add column if not exists general_email text;

-- Date de préavis = date à laquelle le préavis doit être donné pour ne pas
-- reconduire le contrat, calculée automatiquement à partir de la fin de
-- contrat et du délai de préavis (en jours). Sert de filtre dans l'admin.
alter table public.profiles
  add column if not exists notice_date date generated always as (
    case
      when contract_end_date is not null and notice_period_days is not null
        then contract_end_date - notice_period_days
      else null
    end
  ) stored;

comment on column public.profiles.notice_period_days is 'Délai de préavis (en jours) avant la fin du contrat établissement, pour le résilier/renégocier.';
comment on column public.profiles.notice_date is 'Calculée : contract_end_date - notice_period_days.';

-- Bucket privé pour les documents de contrat (PDF signé, avenants...),
-- accessible uniquement aux admins — jamais exposé publiquement.
insert into storage.buckets (id, name, public)
values ('establishment-contracts', 'establishment-contracts', false)
on conflict (id) do nothing;

drop policy if exists "Admin can view establishment contract documents" on storage.objects;
create policy "Admin can view establishment contract documents"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'establishment-contracts' and has_role(auth.uid(), 'admin'::app_role));

drop policy if exists "Admin can upload establishment contract documents" on storage.objects;
create policy "Admin can upload establishment contract documents"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'establishment-contracts' and has_role(auth.uid(), 'admin'::app_role));

drop policy if exists "Admin can update establishment contract documents" on storage.objects;
create policy "Admin can update establishment contract documents"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'establishment-contracts' and has_role(auth.uid(), 'admin'::app_role));

drop policy if exists "Admin can delete establishment contract documents" on storage.objects;
create policy "Admin can delete establishment contract documents"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'establishment-contracts' and has_role(auth.uid(), 'admin'::app_role));
