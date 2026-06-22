-- =========================================================
-- 1. Teacher notes on students
-- =========================================================
CREATE TABLE public.teacher_student_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  content text NOT NULL,
  is_private boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.teacher_student_notes TO authenticated;
GRANT ALL ON public.teacher_student_notes TO service_role;

ALTER TABLE public.teacher_student_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers manage notes for their students"
  ON public.teacher_student_notes FOR ALL TO authenticated
  USING (teacher_id = auth.uid() AND public.is_teacher_of(auth.uid(), student_id))
  WITH CHECK (teacher_id = auth.uid() AND public.is_teacher_of(auth.uid(), student_id));

CREATE POLICY "Students view their non-private notes"
  ON public.teacher_student_notes FOR SELECT TO authenticated
  USING (student_id = auth.uid() AND is_private = false);

CREATE POLICY "Parents view non-private notes of their children"
  ON public.teacher_student_notes FOR SELECT TO authenticated
  USING (is_private = false AND public.is_parent_of(auth.uid(), student_id));

CREATE TRIGGER update_teacher_student_notes_updated_at
  BEFORE UPDATE ON public.teacher_student_notes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =========================================================
-- 2. Class announcements
-- =========================================================
CREATE TABLE public.class_announcements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_announcements TO authenticated;
GRANT ALL ON public.class_announcements TO service_role;

ALTER TABLE public.class_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers manage their class announcements"
  ON public.class_announcements FOR ALL TO authenticated
  USING (teacher_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.classes c WHERE c.id = class_announcements.class_id AND c.teacher_id = auth.uid()
  ))
  WITH CHECK (teacher_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.classes c WHERE c.id = class_announcements.class_id AND c.teacher_id = auth.uid()
  ));

CREATE POLICY "Students view announcements of their classes"
  ON public.class_announcements FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.class_students cs
    WHERE cs.class_id = class_announcements.class_id AND cs.student_id = auth.uid()
  ));

CREATE POLICY "Parents view announcements of their children classes"
  ON public.class_announcements FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.class_students cs
    JOIN public.parent_child_links pcl ON pcl.child_id = cs.student_id
    WHERE cs.class_id = class_announcements.class_id
      AND pcl.parent_id = auth.uid() AND pcl.status = 'active'
  ));

CREATE TRIGGER update_class_announcements_updated_at
  BEFORE UPDATE ON public.class_announcements
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =========================================================
-- 3. Teacher <-> parent messages (per student)
-- =========================================================
CREATE TABLE public.teacher_parent_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.teacher_parent_messages TO authenticated;
GRANT ALL ON public.teacher_parent_messages TO service_role;

ALTER TABLE public.teacher_parent_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teacher views messages of their students"
  ON public.teacher_parent_messages FOR SELECT TO authenticated
  USING (teacher_id = auth.uid() AND public.is_teacher_of(auth.uid(), student_id));

CREATE POLICY "Parent views messages about their child"
  ON public.teacher_parent_messages FOR SELECT TO authenticated
  USING (parent_id = auth.uid() AND public.is_parent_of(auth.uid(), student_id));

CREATE POLICY "Teacher sends messages to parents of their students"
  ON public.teacher_parent_messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND teacher_id = auth.uid()
    AND public.is_teacher_of(auth.uid(), student_id)
    AND public.is_parent_of(parent_id, student_id)
  );

CREATE POLICY "Parent replies to teacher about their child"
  ON public.teacher_parent_messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND parent_id = auth.uid()
    AND public.is_parent_of(auth.uid(), student_id)
    AND public.is_teacher_of(teacher_id, student_id)
  );

CREATE POLICY "Recipient can mark messages read"
  ON public.teacher_parent_messages FOR UPDATE TO authenticated
  USING (
    (teacher_id = auth.uid() AND public.is_teacher_of(auth.uid(), student_id))
    OR (parent_id = auth.uid() AND public.is_parent_of(auth.uid(), student_id))
  )
  WITH CHECK (
    (teacher_id = auth.uid() AND public.is_teacher_of(auth.uid(), student_id))
    OR (parent_id = auth.uid() AND public.is_parent_of(auth.uid(), student_id))
  );

CREATE INDEX idx_tpm_thread ON public.teacher_parent_messages (teacher_id, parent_id, student_id, created_at);