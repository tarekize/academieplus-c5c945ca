-- Pricing.tsx (composant des tarifs) est affiché sur la page d'accueil
-- publique (Index.tsx), donc aussi pour des visiteurs non connectés — mais
-- les policies SELECT de subscription_config/subscription_periods ne
-- couvraient que le rôle authenticated. Un visiteur anonyme ne recevait
-- donc jamais aucune ligne (RLS bloque, pas d'erreur visible) et retombait
-- silencieusement sur les prix codés en dur (FALLBACK_PLANS), obsolètes
-- dès qu'un admin change un tarif : "la modification n'est pas prise en
-- compte" pour quiconque n'est pas déjà connecté. Aucune donnée sensible
-- dans ces tables (juste libellés/prix/dates), lecture seule.

drop policy if exists "Anyone can view config" on public.subscription_config;
create policy "Anyone can view config"
  on public.subscription_config for select
  to anon, authenticated
  using (true);

drop policy if exists "Anyone can view active periods" on public.subscription_periods;
create policy "Anyone can view active periods"
  on public.subscription_periods for select
  to anon, authenticated
  using (true);
