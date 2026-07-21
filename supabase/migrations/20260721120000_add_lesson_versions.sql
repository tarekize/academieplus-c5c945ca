-- Historique des versions d'une leçon : à chaque publication (bouton
-- "Envoyer les modifications"), un instantané du contenu envoyé aux élèves
-- est archivé ici. Le pédago peut ensuite consulter "Version 1, Version 2..."
-- (ordre chronologique, pas de numéro stocké) depuis un bouton dédié.
CREATE TABLE public.lesson_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  content text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id),
  created_by_name text NOT NULL
);

CREATE INDEX idx_lesson_versions_lesson ON public.lesson_versions (lesson_id, created_at);

ALTER TABLE public.lesson_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pedago and admin can view lesson versions"
  ON public.lesson_versions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'pedago'::public.app_role));

CREATE POLICY "Pedago and admin can insert lesson versions"
  ON public.lesson_versions FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'pedago'::public.app_role));
