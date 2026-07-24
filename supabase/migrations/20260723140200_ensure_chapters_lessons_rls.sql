-- DURCISSEMENT DÉFENSIF — "chapters" et "lessons" (contenu des cours) sont
-- des tables antérieures à l'historique de migrations suivi ici (comme le
-- bucket "avatars" ou parent_child_links) : aucune migration de ce dépôt n'y
-- active RLS ni n'y définit de policy, ce qui rend impossible de confirmer
-- ici que la base réelle les protège bien. Le modèle d'autorisation voulu
-- est déjà celui appliqué côté frontend partout ailleurs (PedagoCRUD.tsx,
-- LessonEditor.tsx : édition réservée à admin/pédago) — cette migration
-- l'impose aussi côté base, que RLS y ait déjà été correctement configuré
-- (auquel cas ceci ne fait que réaffirmer les mêmes règles sans rien
-- changer) ou non (auquel cas ceci ferme un accès en écriture non protégé).
-- Les edge functions d'administration (bulk-generate-*, generate-lesson-content)
-- utilisent le client service_role, qui contourne RLS et n'est donc pas
-- affecté par ces policies.
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view chapters" ON public.chapters;
CREATE POLICY "Authenticated users can view chapters"
  ON public.chapters FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin and pedago manage chapters" ON public.chapters;
CREATE POLICY "Admin and pedago manage chapters"
  ON public.chapters FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND (ur.role = 'admin' OR ur.role = 'pedago')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND (ur.role = 'admin' OR ur.role = 'pedago')));

DROP POLICY IF EXISTS "Authenticated users can view lessons" ON public.lessons;
CREATE POLICY "Authenticated users can view lessons"
  ON public.lessons FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin and pedago manage lessons" ON public.lessons;
CREATE POLICY "Admin and pedago manage lessons"
  ON public.lessons FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND (ur.role = 'admin' OR ur.role = 'pedago')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND (ur.role = 'admin' OR ur.role = 'pedago')));

NOTIFY pgrst, 'reload schema';
