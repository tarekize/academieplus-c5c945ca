-- Étend le module Notifications (admin) : pièce jointe + fenêtre de validité
-- sur les modèles automatiques, et un journal détaillé de chaque email
-- réellement envoyé (destinataire, contenu envoyé, modèle, date), qu'il
-- vienne d'une campagne manuelle ou d'un déclenchement automatique — pour
-- permettre la recherche/filtre et la suppression (unité/masse) demandées.

-- 1. Pièce jointe + fenêtre de validité (date début/fin) sur les modèles.
alter table public.email_templates
  add column attachment_url text,
  add column attachment_name text,
  add column trigger_start_date date,
  add column trigger_end_date date;

comment on column public.email_templates.trigger_start_date is
  'Modèle automatique : ne déclenche aucun envoi avant cette date (NULL = pas de borne basse).';
comment on column public.email_templates.trigger_end_date is
  'Modèle automatique : ne déclenche plus aucun envoi après cette date (NULL = pas de borne haute).';

-- 2. Journal unifié de chaque email envoyé (un enregistrement par
-- destinataire, source manuelle ou automatique) — distinct
-- d'automatic_notification_log qui reste dédié à l'anti-doublon d'envoi et
-- n'est jamais exposé à la suppression admin.
create table public.email_send_log (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('manual', 'automatic')),
  campaign_id uuid references public.email_campaigns(id) on delete cascade,
  template_id uuid references public.email_templates(id) on delete set null,
  template_name_snapshot text not null,
  recipient_id uuid,
  recipient_email text not null,
  recipient_name text,
  subject_sent text not null,
  body_sent text not null,
  status text not null check (status in ('success', 'failed')),
  error_message text,
  created_at timestamptz not null default now()
);

create index email_send_log_created_at_idx on public.email_send_log (created_at desc);
create index email_send_log_campaign_id_idx on public.email_send_log (campaign_id);
create index email_send_log_recipient_email_idx on public.email_send_log (recipient_email);

alter table public.email_send_log enable row level security;

create policy "Admins can view email send log"
  on public.email_send_log for select
  using (has_role(auth.uid(), 'admin'::app_role));

create policy "Admins can delete email send log"
  on public.email_send_log for delete
  using (has_role(auth.uid(), 'admin'::app_role));

-- 3. email_campaigns n'avait qu'une policy SELECT : ajout de DELETE pour
-- permettre à l'admin de purger une campagne (et, par cascade, ses lignes
-- de journal détaillé) depuis l'onglet Historique.
create policy "Admins can delete email campaigns"
  on public.email_campaigns for delete
  using (has_role(auth.uid(), 'admin'::app_role));
