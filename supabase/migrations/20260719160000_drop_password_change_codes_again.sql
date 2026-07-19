-- Le changement de mot de passe repasse en direct (sans étape de
-- vérification par email), à la demande explicite de l'exploitant :
-- pas de solution d'envoi d'email en place pour l'instant qui convienne
-- (Resend nécessite une clé valide + domaine vérifié pour joindre
-- n'importe quel utilisateur). Table redevenue inutile.
DROP TABLE IF EXISTS public.password_change_codes;
