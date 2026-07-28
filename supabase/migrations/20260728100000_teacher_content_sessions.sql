-- Sauvegarde de la discussion IA enseignant (génération guidée d'exercices/quiz
-- et générateur d'examen) : bouton "historique" pour revoir/reprendre une
-- session passée (sélections + résultats générés) + bouton "+" pour repartir
-- d'une session vierge — même logique que chat_conversations côté élève, mais
-- avec un état structuré (wizard) plutôt qu'une liste de messages libres, donc
-- une table dédiée plutôt qu'une réutilisation forcée du même schéma.

CREATE TABLE public.teacher_content_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type text NOT NULL CHECK (content_type IN ('exercise', 'quiz', 'exam')),
  title text NOT NULL DEFAULT 'Nouvelle génération',
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teacher_content_sessions TO authenticated;
GRANT ALL ON public.teacher_content_sessions TO service_role;
ALTER TABLE public.teacher_content_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers manage their own content sessions"
  ON public.teacher_content_sessions FOR ALL TO authenticated
  USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);

CREATE TRIGGER teacher_content_sessions_updated_at
  BEFORE UPDATE ON public.teacher_content_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_tcs_teacher ON public.teacher_content_sessions(teacher_id, content_type, updated_at DESC);

NOTIFY pgrst, 'reload schema';
