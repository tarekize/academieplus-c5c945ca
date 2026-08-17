-- Le total_days=70 sur le compte de test (au lieu de 30 pour un code
-- "monthly") n'était pas un bug de calcul : c'est le cumul de plusieurs
-- codes activés pendant que le bug corrigé dans la migration précédente
-- (20260817120000) empêchait chacun de vraiment repasser l'abonnement actif
-- — chaque nouveau code s'additionnait sur un total jamais consommé. Une
-- fois ce bug corrigé, ce cumul de test n'a plus de sens : on réaligne sur
-- exactement les jours du dernier code réellement activé (monthly = 30j).
UPDATE public.student_subscriptions
SET total_days = 30, days_used = 0, last_tick_at = now()
WHERE user_id = 'b83ac949-c3dc-4997-91e1-a25000fa1c11';
