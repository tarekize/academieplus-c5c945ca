-- Matières enseignées par chaque pédago : l'admin choisit, à la création du
-- compte, quelles matières un pédago enseigne (mathématiques, physique,
-- sciences, anglais, français, arabe, éducation islamique, histoire-géo,
-- philosophie). Une même matière ne peut être assignée qu'à un seul pédago
-- à la fois (contrainte encodée directement par la clé primaire de
-- pedago_subjects : chaque matière ne peut apparaître qu'une fois).

CREATE TABLE public.subjects (
  id text PRIMARY KEY,
  name text NOT NULL,
  name_ar text,
  icon text,
  order_index integer NOT NULL DEFAULT 0
);

INSERT INTO public.subjects (id, name, name_ar, icon, order_index) VALUES
  ('math', 'Mathématiques', 'الرياضيات', '📐', 1),
  ('physique', 'Physique', 'الفيزياء', '⚛️', 2),
  ('science', 'Sciences', 'العلوم', '🔬', 3),
  ('anglais', 'Anglais', 'الإنجليزية', '🇬🇧', 4),
  ('francais', 'Français', 'الفرنسية', '🇫🇷', 5),
  ('arabe', 'Arabe', 'العربية', '📖', 6),
  ('islamique', 'Éducation islamique', 'التربية الإسلامية', '🕌', 7),
  ('histoire_geo', 'Histoire-Géographie', 'التاريخ والجغرافيا', '🗺️', 8),
  ('philo', 'Philosophie', 'الفلسفة', '🧠', 9);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view subjects"
  ON public.subjects FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage subjects"
  ON public.subjects FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Une ligne = une matière assignée à un pédago. subject_id en clé primaire
-- garantit qu'une matière n'a jamais plus d'un pédago responsable.
-- Référence profiles (et non auth.users) pour permettre à PostgREST de
-- joindre directement le nom/email du pédago (utile pour l'UI admin qui
-- affiche "déjà assignée à ...").
CREATE TABLE public.pedago_subjects (
  subject_id text PRIMARY KEY REFERENCES public.subjects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_pedago_subjects_user ON public.pedago_subjects (user_id);

ALTER TABLE public.pedago_subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pedagos can view their own assigned subjects"
  ON public.pedago_subjects FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage pedago subject assignments"
  ON public.pedago_subjects FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Backfill du compte pédago existant pedago@test.com -> mathématiques
-- uniquement, pour ne rien changer à son usage actuel. No-op si ce compte
-- n'existe pas dans l'environnement (dev/preview/prod sans ce compte de test).
INSERT INTO public.pedago_subjects (subject_id, user_id)
SELECT 'math', p.id
FROM public.profiles p
WHERE p.email = 'pedago@test.com'
ON CONFLICT (subject_id) DO NOTHING;
