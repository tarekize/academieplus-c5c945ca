-- Oubli dans la migration précédente : toute fonction doit fixer
-- explicitement search_path (cohérence avec le reste de la base).
create or replace function public.set_payment_period()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  new.period_start := (new.payment_date at time zone 'UTC')::date;
  new.period_end := new.period_start + (case when new.plan_type = 'annual' then 360 else 30 end);
  return new;
end;
$$;
