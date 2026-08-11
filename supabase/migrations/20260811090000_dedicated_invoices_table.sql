-- Règle métier demandée : dissocier le processus de PAIEMENT (transaction,
-- peut être en attente/rejetée) de la FACTURATION (document légal émis une
-- fois pour toutes dès qu'un paiement est validé, qui ne doit plus jamais
-- changer même si le paiement est ensuite ajusté). payments.invoice_number
-- (ajouté précédemment) mélangeait les deux : une facture n'est pas un champ
-- du paiement, c'est un document distinct généré À PARTIR d'un paiement
-- validé. Crée une vraie table invoices, alimentée automatiquement par un
-- trigger dès que payments.status passe à 'completed'.

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  payment_id uuid not null unique references public.payments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null,
  amount_ht integer not null,
  vat_rate numeric(5,2) not null,
  vat_amount integer not null,
  amount_ttc integer not null,
  period_start date,
  period_end date,
  plan_type text not null,
  plan_label text not null,
  is_family boolean not null default false,
  children_count integer not null default 1,
  issued_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

comment on table public.invoices is 'Document de facturation émis une fois, dès qu''un paiement passe à completed. Snapshot immuable : ne change jamais après émission, même si le paiement associé est ensuite modifié.';

alter table public.invoices enable row level security;

create policy "Users can view their own invoices"
  on public.invoices for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Admins can manage all invoices"
  on public.invoices for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'::public.app_role))
  with check (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Génère la facture automatiquement à l'insertion d'un paiement déjà
-- 'completed', ou dès que status passe à 'completed' (ex: admin_approve_payment).
create or replace function public.create_invoice_for_payment()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if new.status = 'completed' and (tg_op = 'INSERT' or old.status is distinct from 'completed') then
    insert into public.invoices (
      invoice_number, payment_id, user_id, amount, amount_ht, vat_rate, vat_amount, amount_ttc,
      period_start, period_end, plan_type, plan_label, is_family, children_count, issued_at
    )
    values (
      'FA-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.payments_invoice_seq')::text, 6, '0'),
      new.id, new.user_id, new.amount, new.amount_ht, new.vat_rate, new.vat_amount, new.amount_ttc,
      new.period_start, new.period_end, new.plan_type, new.plan_label, new.is_family, new.children_count, now()
    )
    on conflict (payment_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_create_invoice_for_payment on public.payments;
create trigger trg_create_invoice_for_payment
  after insert or update of status on public.payments
  for each row
  execute function public.create_invoice_for_payment();

-- Bascule l'ancien mécanisme (invoice_number directement sur payments) :
-- retiré, la facturation vit désormais exclusivement dans invoices.
drop trigger if exists trg_set_payment_invoice_number on public.payments;
drop function if exists public.set_payment_invoice_number();

-- Backfill : reprend les numéros de facture déjà attribués aux paiements
-- complétés existants, sans en régénérer (continuité de la séquence).
insert into public.invoices (
  invoice_number, payment_id, user_id, amount, amount_ht, vat_rate, vat_amount, amount_ttc,
  period_start, period_end, plan_type, plan_label, is_family, children_count, issued_at, created_at
)
select invoice_number, id, user_id, amount, amount_ht, vat_rate, vat_amount, amount_ttc,
  period_start, period_end, plan_type, plan_label, is_family, children_count, payment_date, payment_date
from public.payments
where status = 'completed' and invoice_number is not null
on conflict (payment_id) do nothing;

alter table public.payments drop column if exists invoice_number;
