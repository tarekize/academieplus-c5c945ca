-- Détail de facturation manquant (période, HT, TTC, TVA) : ajoutés comme
-- champs déclarés sur payments plutôt que recalculés côté frontend, pour
-- que chaque facture porte ses propres montants et sa période de
-- couverture. amount reste la source de vérité (TTC réellement facturé) ;
-- amount_ht/vat_amount/amount_ttc sont dérivés automatiquement (GENERATED,
-- arithmétique pure donc immutable) pour ne jamais pouvoir diverger de
-- amount/vat_rate. period_start/period_end dépendent de payment_date
-- (timestamptz -> date, non immutable côté Postgres) : calculés par
-- trigger plutôt que GENERATED, mais tout aussi automatiques.

alter table public.payments
  add column if not exists vat_rate numeric(5,2) not null default 19.00;

alter table public.payments
  add column if not exists amount_ht integer
    generated always as (round((amount::numeric) / (1 + vat_rate / 100.0))::integer) stored;

alter table public.payments
  add column if not exists vat_amount integer
    generated always as (amount - round((amount::numeric) / (1 + vat_rate / 100.0))::integer) stored;

alter table public.payments
  add column if not exists amount_ttc integer
    generated always as (amount) stored;

alter table public.payments
  add column if not exists period_start date;

alter table public.payments
  add column if not exists period_end date;

comment on column public.payments.vat_rate is 'Taux de TVA appliqué (%), 19% par défaut (Algérie). Modifiable par facture si besoin.';
comment on column public.payments.amount_ht is 'Montant hors taxes (dérivé de amount et vat_rate).';
comment on column public.payments.vat_amount is 'Montant de la TVA (dérivé de amount et vat_rate).';
comment on column public.payments.amount_ttc is 'Montant toutes taxes comprises (alias explicite de amount).';
comment on column public.payments.period_start is 'Début de la période de facturation couverte (= date de paiement).';
comment on column public.payments.period_end is 'Fin de la période de facturation couverte (30 jours mensuel, 360 jours annuel), tenue à jour par trigger.';

create or replace function public.set_payment_period()
returns trigger
language plpgsql
as $$
begin
  new.period_start := (new.payment_date at time zone 'UTC')::date;
  new.period_end := new.period_start + (case when new.plan_type = 'annual' then 360 else 30 end);
  return new;
end;
$$;

drop trigger if exists trg_set_payment_period on public.payments;
create trigger trg_set_payment_period
  before insert or update of payment_date, plan_type on public.payments
  for each row
  execute function public.set_payment_period();

-- Backfill des lignes existantes (le trigger ne s'applique qu'aux futures écritures).
update public.payments
set period_start = (payment_date at time zone 'UTC')::date,
    period_end = (payment_date at time zone 'UTC')::date + (case when plan_type = 'annual' then 360 else 30 end)
where period_start is null;

alter table public.payments alter column period_start set not null;
alter table public.payments alter column period_end set not null;
