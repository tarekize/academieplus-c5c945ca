-- La suppression d'un compte pédago (ou tout autre auteur/relecteur de
-- contenu) échouait avec une violation de clé étrangère : chapters,
-- lessons, chapter_exercises, chapter_quizzes, exams, exam_versions et
-- lesson_versions référencent profiles(id) via submitted_by/reviewed_by/
-- created_by/deletion_requested_by en ON DELETE NO ACTION, et aucune de
-- ces tables n'est nettoyée par l'edge function delete-user-account (à
-- raison : ce contenu pédagogique ne doit pas être supprimé avec le
-- compte de son auteur). Passage en ON DELETE SET NULL — cohérent avec
-- email_campaigns.sent_by / email_templates.created_by qui géraient déjà
-- ce cas correctement.

alter table public.chapter_exercises drop constraint chapter_exercises_reviewed_by_fkey;
alter table public.chapter_exercises add constraint chapter_exercises_reviewed_by_fkey
  foreign key (reviewed_by) references public.profiles(id) on delete set null;

alter table public.chapter_exercises drop constraint chapter_exercises_submitted_by_fkey;
alter table public.chapter_exercises add constraint chapter_exercises_submitted_by_fkey
  foreign key (submitted_by) references public.profiles(id) on delete set null;

alter table public.chapter_quizzes drop constraint chapter_quizzes_reviewed_by_fkey;
alter table public.chapter_quizzes add constraint chapter_quizzes_reviewed_by_fkey
  foreign key (reviewed_by) references public.profiles(id) on delete set null;

alter table public.chapter_quizzes drop constraint chapter_quizzes_submitted_by_fkey;
alter table public.chapter_quizzes add constraint chapter_quizzes_submitted_by_fkey
  foreign key (submitted_by) references public.profiles(id) on delete set null;

alter table public.chapters drop constraint chapters_deletion_requested_by_fkey;
alter table public.chapters add constraint chapters_deletion_requested_by_fkey
  foreign key (deletion_requested_by) references public.profiles(id) on delete set null;

alter table public.chapters drop constraint chapters_reviewed_by_fkey;
alter table public.chapters add constraint chapters_reviewed_by_fkey
  foreign key (reviewed_by) references public.profiles(id) on delete set null;

alter table public.chapters drop constraint chapters_submitted_by_fkey;
alter table public.chapters add constraint chapters_submitted_by_fkey
  foreign key (submitted_by) references public.profiles(id) on delete set null;

alter table public.exam_versions drop constraint exam_versions_reviewed_by_fkey;
alter table public.exam_versions add constraint exam_versions_reviewed_by_fkey
  foreign key (reviewed_by) references public.profiles(id) on delete set null;

alter table public.exam_versions drop constraint exam_versions_submitted_by_fkey;
alter table public.exam_versions add constraint exam_versions_submitted_by_fkey
  foreign key (submitted_by) references public.profiles(id) on delete set null;

alter table public.exams drop constraint exams_deletion_requested_by_fkey;
alter table public.exams add constraint exams_deletion_requested_by_fkey
  foreign key (deletion_requested_by) references public.profiles(id) on delete set null;

alter table public.exams drop constraint exams_reviewed_by_fkey;
alter table public.exams add constraint exams_reviewed_by_fkey
  foreign key (reviewed_by) references public.profiles(id) on delete set null;

alter table public.exams drop constraint exams_submitted_by_fkey;
alter table public.exams add constraint exams_submitted_by_fkey
  foreign key (submitted_by) references public.profiles(id) on delete set null;

alter table public.lesson_versions drop constraint lesson_versions_created_by_fkey;
alter table public.lesson_versions add constraint lesson_versions_created_by_fkey
  foreign key (created_by) references public.profiles(id) on delete set null;

alter table public.lesson_versions drop constraint lesson_versions_reviewed_by_fkey;
alter table public.lesson_versions add constraint lesson_versions_reviewed_by_fkey
  foreign key (reviewed_by) references public.profiles(id) on delete set null;

alter table public.lessons drop constraint lessons_deletion_requested_by_fkey;
alter table public.lessons add constraint lessons_deletion_requested_by_fkey
  foreign key (deletion_requested_by) references public.profiles(id) on delete set null;

alter table public.lessons drop constraint lessons_reviewed_by_fkey;
alter table public.lessons add constraint lessons_reviewed_by_fkey
  foreign key (reviewed_by) references public.profiles(id) on delete set null;

alter table public.lessons drop constraint lessons_submitted_by_fkey;
alter table public.lessons add constraint lessons_submitted_by_fkey
  foreign key (submitted_by) references public.profiles(id) on delete set null;

-- pedago_activity_log.user_id est NOT NULL : SET NULL est impossible, donc
-- CASCADE (supprime les entrées de journal de ce pédago avec son compte,
-- même traitement que activity_logs déjà nettoyée explicitement par
-- l'edge function).
alter table public.pedago_activity_log drop constraint pedago_activity_log_user_id_fkey;
alter table public.pedago_activity_log add constraint pedago_activity_log_user_id_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;
