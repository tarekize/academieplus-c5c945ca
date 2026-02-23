-- ============================================
-- FICHIER DE MIGRATION COMPLET - SoutienScolaire
-- Généré le 2026-02-22
-- ============================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TYPES ENUM
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('student', 'parent', 'admin', 'pedago');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.school_level AS ENUM (
    '5eme_primaire', '1ere_cem', '2eme_cem', '3eme_cem', '4eme_cem',
    'premiere', 'seconde', 'terminale'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.link_status AS ENUM ('pending', 'active', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. TABLES

-- profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL PRIMARY KEY,
  email text NOT NULL,
  email_verified boolean DEFAULT false,
  first_name text,
  last_name text,
  phone text,
  avatar_url text,
  school_level public.school_level,
  filiere text,
  linking_code text DEFAULT encode(gen_random_bytes(4), 'hex'),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);

-- filieres
CREATE TABLE IF NOT EXISTS public.filieres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_level public.school_level NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  name_ar text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(code, school_level)
);

-- chapters
CREATE TABLE IF NOT EXISTS public.chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_level public.school_level NOT NULL,
  filiere_id uuid REFERENCES public.filieres(id),
  title text NOT NULL,
  title_ar text,
  description text,
  subject text NOT NULL DEFAULT 'math',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- lessons
CREATE TABLE IF NOT EXISTS public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid NOT NULL REFERENCES public.chapters(id),
  title text NOT NULL,
  title_ar text,
  content text,
  video_url text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- chapter_quizzes
CREATE TABLE IF NOT EXISTS public.chapter_quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid NOT NULL REFERENCES public.chapters(id),
  question text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]',
  correct_answer text NOT NULL,
  explanation text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- chapter_exercises
CREATE TABLE IF NOT EXISTS public.chapter_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid NOT NULL REFERENCES public.chapters(id),
  title text NOT NULL,
  statement text NOT NULL,
  expected_answer text NOT NULL,
  accepted_answers jsonb NOT NULL DEFAULT '[]',
  solution text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- learning_styles
CREATE TABLE IF NOT EXISTS public.learning_styles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  preferred_style text NOT NULL DEFAULT 'mixed',
  visual_score integer NOT NULL DEFAULT 0,
  textual_score integer NOT NULL DEFAULT 0,
  practical_score integer NOT NULL DEFAULT 0,
  assessment_data jsonb DEFAULT '{}',
  advice_seen boolean DEFAULT false,
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- its_recommendations
CREATE TABLE IF NOT EXISTS public.its_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  chapter_id uuid REFERENCES public.chapters(id),
  recommendation_type text NOT NULL,
  content text NOT NULL,
  priority integer NOT NULL DEFAULT 0,
  is_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- parent_child_links
CREATE TABLE IF NOT EXISTS public.parent_child_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL REFERENCES public.profiles(id),
  child_id uuid NOT NULL REFERENCES public.profiles(id),
  status public.link_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- activity_logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id),
  action text NOT NULL,
  details jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- 4. FONCTIONS

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_parent_of(_parent_id uuid, _child_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.parent_child_links
    WHERE parent_id = _parent_id AND child_id = _child_id AND status = 'active'
  )
$$;

CREATE OR REPLACE FUNCTION public.log_activity(_user_id uuid, _action text, _details jsonb DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE log_id UUID;
BEGIN
  INSERT INTO public.activity_logs (user_id, action, details)
  VALUES (_user_id, _action, _details)
  RETURNING id INTO log_id;
  RETURN log_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_school_level_text text;
  v_school_level_enum public.school_level;
  v_role_text text;
  v_role_enum public.app_role;
  v_filiere text;
BEGIN
  v_school_level_text := NULLIF(trim(COALESCE(NEW.raw_user_meta_data ->> 'school_level', '')), '');
  v_filiere := NULLIF(trim(COALESCE(NEW.raw_user_meta_data ->> 'filiere', '')), '');

  v_school_level_enum := CASE v_school_level_text
    WHEN '5ème Primaire' THEN '5eme_primaire'::public.school_level
    WHEN '5eme_primaire' THEN '5eme_primaire'::public.school_level
    WHEN '1ère CEM' THEN '1ere_cem'::public.school_level
    WHEN '1ere_cem' THEN '1ere_cem'::public.school_level
    WHEN '2ème CEM' THEN '2eme_cem'::public.school_level
    WHEN '2eme_cem' THEN '2eme_cem'::public.school_level
    WHEN '3ème CEM' THEN '3eme_cem'::public.school_level
    WHEN '3eme_cem' THEN '3eme_cem'::public.school_level
    WHEN '4ème CEM' THEN '4eme_cem'::public.school_level
    WHEN '4eme_cem' THEN '4eme_cem'::public.school_level
    WHEN 'Première' THEN 'premiere'::public.school_level
    WHEN 'premiere' THEN 'premiere'::public.school_level
    WHEN 'Seconde' THEN 'seconde'::public.school_level
    WHEN 'seconde' THEN 'seconde'::public.school_level
    WHEN 'Terminale' THEN 'terminale'::public.school_level
    WHEN 'terminale' THEN 'terminale'::public.school_level
    ELSE NULL
  END;

  INSERT INTO public.profiles (id, email, email_verified, first_name, last_name, school_level, filiere)
  VALUES (
    NEW.id, NEW.email, NEW.email_confirmed_at IS NOT NULL,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    v_school_level_enum, v_filiere
  );

  v_role_text := NULLIF(lower(trim(COALESCE(NEW.raw_user_meta_data ->> 'role', ''))), '');
  v_role_enum := CASE v_role_text
    WHEN 'student' THEN 'student'::public.app_role
    WHEN 'parent' THEN 'parent'::public.app_role
    WHEN 'admin' THEN 'admin'::public.app_role
    WHEN 'pedago' THEN 'pedago'::public.app_role
    ELSE NULL
  END;

  IF v_role_enum IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, v_role_enum)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- 5. TRIGGER sur auth.users (à exécuter manuellement dans le SQL Editor de Supabase)
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. RLS POLICIES

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.filieres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.its_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_child_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Parents can view linked children profiles" ON public.profiles FOR SELECT USING (is_parent_of(auth.uid(), id));

-- USER_ROLES policies
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own role" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'admin'));

-- FILIERES policies
CREATE POLICY "Authenticated users can view filieres" ON public.filieres FOR SELECT USING (true);
CREATE POLICY "Admins can manage filieres" ON public.filieres FOR ALL USING (has_role(auth.uid(), 'admin'));

-- CHAPTERS policies
CREATE POLICY "Authenticated users can view chapters" ON public.chapters FOR SELECT USING (true);
CREATE POLICY "Admins can manage chapters" ON public.chapters FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Pedagos can manage chapters" ON public.chapters FOR ALL USING (has_role(auth.uid(), 'pedago')) WITH CHECK (has_role(auth.uid(), 'pedago'));

-- LESSONS policies
CREATE POLICY "Authenticated users can view lessons" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Admins can manage lessons" ON public.lessons FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Pedagos can manage lessons" ON public.lessons FOR ALL USING (has_role(auth.uid(), 'pedago')) WITH CHECK (has_role(auth.uid(), 'pedago'));

-- CHAPTER_QUIZZES policies
CREATE POLICY "Authenticated users can view quizzes" ON public.chapter_quizzes FOR SELECT USING (true);
CREATE POLICY "Admins can manage quizzes" ON public.chapter_quizzes FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Pedagos can manage quizzes" ON public.chapter_quizzes FOR ALL USING (has_role(auth.uid(), 'pedago')) WITH CHECK (has_role(auth.uid(), 'pedago'));

-- CHAPTER_EXERCISES policies
CREATE POLICY "Authenticated users can view exercises" ON public.chapter_exercises FOR SELECT USING (true);
CREATE POLICY "Admins can manage exercises" ON public.chapter_exercises FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Pedagos can manage exercises" ON public.chapter_exercises FOR ALL USING (has_role(auth.uid(), 'pedago')) WITH CHECK (has_role(auth.uid(), 'pedago'));

-- LEARNING_STYLES policies
CREATE POLICY "Users can view their own learning style" ON public.learning_styles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own learning style" ON public.learning_styles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own learning style" ON public.learning_styles FOR UPDATE USING (auth.uid() = user_id);

-- ITS_RECOMMENDATIONS policies
CREATE POLICY "Users can view their own recommendations" ON public.its_recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert recommendations" ON public.its_recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own recommendations" ON public.its_recommendations FOR UPDATE USING (auth.uid() = user_id);

-- PARENT_CHILD_LINKS policies
CREATE POLICY "Parents can view their links" ON public.parent_child_links FOR SELECT USING (auth.uid() = parent_id);
CREATE POLICY "Children can view links to them" ON public.parent_child_links FOR SELECT USING (auth.uid() = child_id);
CREATE POLICY "Parents can create links" ON public.parent_child_links FOR INSERT WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "Children can update link status" ON public.parent_child_links FOR UPDATE USING (auth.uid() = child_id);
CREATE POLICY "Parents can delete their links" ON public.parent_child_links FOR DELETE USING (auth.uid() = parent_id);
CREATE POLICY "Admins can manage all links" ON public.parent_child_links FOR ALL USING (has_role(auth.uid(), 'admin'));

-- ACTIVITY_LOGS policies
CREATE POLICY "Users can view their own logs" ON public.activity_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all logs" ON public.activity_logs FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated users can insert logs" ON public.activity_logs FOR INSERT WITH CHECK (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

-- 7. STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- 8. DONNÉES (INSERT)
-- ============================================

-- FILIERES
INSERT INTO public.filieres (id, school_level, code, name, name_ar, created_at) VALUES
('3d2af2aa-fd2f-4e18-8229-06a92c0a3460', 'premiere', 'tronc_commun_scientifique', 'Tronc Commun Scientifique', 'جذع مشترك علوم', '2026-02-06 14:06:49.303435+00'),
('32197879-9362-4695-931d-65d0e096e87c', 'premiere', 'tronc_commun_lettres', 'Tronc Commun Lettres', 'جذع مشترك آداب', '2026-02-06 14:06:52.841991+00'),
('8796f844-bce9-4166-bb4d-9248487feee4', 'seconde', 'sciences', 'Sciences', 'علوم تجريبية', '2026-02-06 14:06:55.1767+00'),
('55205b03-3186-423e-9ccb-f22cc3eef229', 'seconde', 'lettres', 'Lettres', 'آداب وفلسفة', '2026-02-06 14:07:00.578554+00'),
('9f9cea26-5b2c-4bb3-ab00-206abb7f43c5', 'terminale', 'sciences', 'Sciences Expérimentales', 'علوم تجريبية', '2026-02-06 14:07:06.784859+00'),
('34ce4ab2-0859-4f61-b7ba-1dd1ec8f87ce', 'terminale', 'lettres', 'Lettres et Philosophie', 'آداب وفلسفة', '2026-02-06 14:07:13.14413+00'),
('b0328c50-b9e0-45cd-b6c3-ed9159ba419e', 'terminale', 'gestion', 'Gestion et Économie', 'تسيير واقتصاد', '2026-02-06 14:07:17.11719+00'),
('3204540c-a0b0-4be5-8405-26a2a8e3639b', 'seconde', 'math_techniques', 'Math Techniques', 'تقني رياضي', '2026-02-06 14:08:06.885222+00'),
('e34a7362-62e0-472f-9a9c-a252f21760b4', 'seconde', 'mathematiques', 'Mathématiques', 'رياضيات', '2026-02-06 14:08:06.885222+00'),
('8bf8e8c1-cc4a-4e3e-b9c4-64e507ed4631', 'seconde', 'gestion', 'Gestion et Économie', 'تسيير واقتصاد', '2026-02-06 14:08:06.885222+00'),
('b22a89fb-df82-4962-a948-925d39bafd7f', 'terminale', 'math_techniques', 'Math Techniques', 'تقني رياضي', '2026-02-06 14:08:06.885222+00'),
('96c3815e-960f-4b65-9e85-9dc14b05c727', 'terminale', 'mathematiques', 'Mathématiques', 'رياضيات', '2026-02-06 14:08:06.885222+00')
ON CONFLICT DO NOTHING;

-- NOTE: Les données des tables chapters (101 rows) et lessons (538 rows) sont volumineuses.
-- Elles sont disponibles via les requêtes SQL ci-dessous à exécuter sur la base source.
-- Pour les exporter, exécutez dans le SQL Editor de votre projet Lovable Cloud :
--
--   COPY (SELECT * FROM public.chapters) TO STDOUT WITH CSV HEADER;
--   COPY (SELECT * FROM public.lessons) TO STDOUT WITH CSV HEADER;
--   COPY (SELECT * FROM public.chapter_quizzes) TO STDOUT WITH CSV HEADER;
--   COPY (SELECT * FROM public.chapter_exercises) TO STDOUT WITH CSV HEADER;
--
-- Puis importez avec :
--   COPY public.chapters FROM STDIN WITH CSV HEADER;
--   etc.

-- ============================================
-- FIN DU FICHIER DE MIGRATION
-- ============================================
