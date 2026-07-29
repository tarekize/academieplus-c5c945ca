-- Journal d'activité pédago : trace chaque ajout/modification/suppression de
-- chapitre, leçon ou contenu de leçon par un pédago (ou un admin, qui passe
-- par les mêmes composants PedagoCRUD.tsx/LessonEditor.tsx), pour la page
-- "Activité" du profil pédago. Rien de tel n'existait jusqu'ici : les
-- colonnes created_by/updated_by n'existent pas sur chapters/lessons, et la
-- table activity_logs déjà présente sert au rate-limiting/sécurité, pas à un
-- historique CRUD lisible par l'auteur.
CREATE TABLE public.pedago_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  user_name text NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  entity_title text,
  chapter_id uuid REFERENCES public.chapters(id) ON DELETE SET NULL,
  subject text,
  school_level public.school_level,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pedago_activity_log
  ADD CONSTRAINT pedago_activity_log_action_check
  CHECK (action IN ('create', 'update', 'delete')),
  ADD CONSTRAINT pedago_activity_log_entity_type_check
  CHECK (entity_type IN ('chapter', 'lesson', 'lesson_content'));

CREATE INDEX idx_pedago_activity_log_user_created ON public.pedago_activity_log (user_id, created_at DESC);

-- L'auteur (user_id/user_name) est toujours dérivé de la session côté
-- serveur, jamais du payload client, pour qu'un pédago ne puisse pas
-- fabriquer une entrée au nom de quelqu'un d'autre.
CREATE OR REPLACE FUNCTION public.guard_pedago_activity_log_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.user_id := auth.uid();
  NEW.user_name := public.profile_display_name(auth.uid());
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_guard_pedago_activity_log_insert
  BEFORE INSERT ON public.pedago_activity_log
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_pedago_activity_log_insert();

ALTER TABLE public.pedago_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and pedago can log their own activity"
  ON public.pedago_activity_log FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND (ur.role = 'admin' OR ur.role = 'pedago')));

-- Journal immuable : pas de policy UPDATE/DELETE, et chacun ne lit que ses
-- propres entrées (un admin n'a pas besoin de voir celles des autres ici ;
-- ce n'est pas la page de validation, juste le "mon activité" du pédago).
CREATE POLICY "Users can view their own activity"
  ON public.pedago_activity_log FOR SELECT TO authenticated
  USING (user_id = auth.uid());

NOTIFY pgrst, 'reload schema';
