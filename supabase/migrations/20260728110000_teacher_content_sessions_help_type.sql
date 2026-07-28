-- "Aider les élèves" (HelpChatbot) mélange exercices ET quiz dans une même
-- session (contrairement à GuidedContentChatbot/ExamAIBuilder qui sont
-- mono-type) — il lui faut son propre bucket de content_type pour que son
-- historique ne se mélange pas avec celui des deux autres interfaces.
ALTER TABLE public.teacher_content_sessions DROP CONSTRAINT IF EXISTS teacher_content_sessions_content_type_check;
ALTER TABLE public.teacher_content_sessions
  ADD CONSTRAINT teacher_content_sessions_content_type_check
  CHECK (content_type IN ('exercise', 'quiz', 'exam', 'help'));

NOTIFY pgrst, 'reload schema';
