-- La table "reclamations" (utilisée par ReclamationDialog.tsx côté élève,
-- TeacherReclamationPanel.tsx côté enseignant, et EtablissementDashboard.tsx
-- côté établissement) n'a jamais été créée en base : "Could not find the
-- table 'public.reclamations' in the schema cache" à chaque envoi.
--
-- Reprend la définition d'origine (migration 20260629120000), à une
-- différence près et volontaire : cette ancienne migration accordait aussi
-- à TOUT compte établissement une visibilité totale et non filtrée sur
-- profiles/classes/class_students/user_roles ("Etablissement view all ..."),
-- ce qui aurait recréé exactement la fuite inter-établissements corrigée
-- dans les migrations précédentes (20260721160000/180000/190000, toutes
-- scopées via is_establishment_teacher()/is_establishment_student()). Ces
-- policies globales ne sont donc pas reprises ici — seule la table
-- "reclamations" elle-même est créée, avec ses propres policies déjà
-- correctement pensées comme une boîte de réception partagée admin/établissement.
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'etablissement';

CREATE TABLE IF NOT EXISTS public.reclamations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_role text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  response text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  resolved_at timestamp with time zone
);

GRANT SELECT, INSERT ON public.reclamations TO authenticated;
GRANT UPDATE (status, response, resolved_at) ON public.reclamations TO authenticated;
GRANT ALL ON public.reclamations TO service_role;

ALTER TABLE public.reclamations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users insert own reclamations" ON public.reclamations;
CREATE POLICY "Users insert own reclamations"
ON public.reclamations FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users view own reclamations" ON public.reclamations;
CREATE POLICY "Users view own reclamations"
ON public.reclamations FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Etablissement view all reclamations" ON public.reclamations;
CREATE POLICY "Etablissement view all reclamations"
ON public.reclamations FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role::text = 'etablissement'
  )
);

DROP POLICY IF EXISTS "Etablissement update reclamations" ON public.reclamations;
CREATE POLICY "Etablissement update reclamations"
ON public.reclamations FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role::text = 'etablissement'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role::text = 'etablissement'
  )
);

-- Force PostgREST à recharger immédiatement son cache de schéma plutôt que
-- d'attendre son prochain rafraîchissement automatique.
NOTIFY pgrst, 'reload schema';
