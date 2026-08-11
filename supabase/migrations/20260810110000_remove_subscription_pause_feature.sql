-- Retire la fonctionnalité "mettre en pause mon abonnement" (bouton retiré
-- côté élève/parent sur Account.tsx). Révoque l'exécution des RPC pour que
-- la fonctionnalité ne reste pas accessible via un appel direct à l'API une
-- fois le bouton retiré de l'interface.
REVOKE EXECUTE ON FUNCTION public.pause_my_subscription() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.resume_my_subscription() FROM authenticated;
