-- Ré-audit du 11/08 : les champs ajoutés par 20260810180000 (délai de
-- préavis, notes de contrat, document, effectifs, contacts directeur/
-- adjoint, email général) vivent sur `profiles`, table dont TOUTES les
-- colonnes sont exposées par les policies RLS "Teachers can view linked
-- establishment profiles" / "Establishments can view their teachers|students
-- profiles" (SELECT ligne entière, Postgres n'a pas de RLS par colonne).
-- Un enseignant qui a simplement rejoint un établissement peut donc
-- interroger directement PostgREST et lire les notes internes de contrat,
-- le téléphone/email du directeur, l'email général, etc. — jamais affiché
-- par le frontend (AdminContrats.tsx, seule consommatrice), mais accessible
-- via un appel REST direct. Ces données sont censées être admin-only.
--
-- Correctif : même pattern que la séparation invoices/payments
-- (20260811090000) — extraction dans une table dédiée, RLS admin uniquement,
-- deny-by-default pour tout le monde d'autre (comme password_change_codes).
-- contract_start_date/contract_end_date restent sur profiles : ils pilotent
-- déjà sync_etablissement_active_from_dates() et étaient exposés de la même
-- façon avant ce round (accepté dans les audits précédents, hors périmètre
-- ici) ; wilaya/ville/address aussi (mêmes colonnes que celles déjà
-- partagées par tous les profils, pas de régression introduite par ce round).

create table public.establishment_contract_details (
  establishment_id uuid primary key references public.profiles(id) on delete cascade,
  notice_period_days integer,
  contract_duration_months integer,
  contract_document_url text,
  contract_notes text,
  student_count integer,
  teacher_count integer,
  director_name text,
  director_contact text,
  deputy_name text,
  deputy_contact text,
  general_email text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

comment on table public.establishment_contract_details is 'Détails de contrat établissement, admin-only. Séparée de profiles pour ne pas exposer ces champs via les policies RLS "vue enseignant/établissement lié" qui donnent accès à la ligne profiles entière.';

alter table public.establishment_contract_details enable row level security;

create policy "Admins can manage establishment contract details"
  on public.establishment_contract_details for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'::public.app_role))
  with check (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Backfill depuis profiles avant de retirer les colonnes.
insert into public.establishment_contract_details (
  establishment_id, notice_period_days, contract_duration_months, contract_document_url,
  contract_notes, student_count, teacher_count, director_name, director_contact,
  deputy_name, deputy_contact, general_email
)
select id, notice_period_days, contract_duration_months, contract_document_url,
  contract_notes, student_count, teacher_count, director_name, director_contact,
  deputy_name, deputy_contact, general_email
from public.profiles
where notice_period_days is not null or contract_duration_months is not null
  or contract_document_url is not null or contract_notes is not null
  or student_count is not null or teacher_count is not null
  or director_name is not null or director_contact is not null
  or deputy_name is not null or deputy_contact is not null
  or general_email is not null;

alter table public.profiles drop column if exists notice_date;
alter table public.profiles drop column if exists notice_period_days;
alter table public.profiles drop column if exists contract_duration_months;
alter table public.profiles drop column if exists contract_document_url;
alter table public.profiles drop column if exists contract_notes;
alter table public.profiles drop column if exists student_count;
alter table public.profiles drop column if exists teacher_count;
alter table public.profiles drop column if exists director_name;
alter table public.profiles drop column if exists director_contact;
alter table public.profiles drop column if exists deputy_name;
alter table public.profiles drop column if exists deputy_contact;
alter table public.profiles drop column if exists general_email;

NOTIFY pgrst, 'reload schema';
