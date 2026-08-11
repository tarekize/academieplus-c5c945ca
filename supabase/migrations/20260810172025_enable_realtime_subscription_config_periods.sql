-- Requis pour que l'abonnement realtime de Pricing.tsx reçoive les
-- changements de tarifs/périodes faits depuis AdminAbonnements — sans ça,
-- supabase.channel(...).on("postgres_changes", ...) ne se déclenche jamais,
-- silencieusement.
alter publication supabase_realtime add table public.subscription_config;
alter publication supabase_realtime add table public.subscription_periods;
