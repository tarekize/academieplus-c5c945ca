-- ============================================================================
-- Contrats (établissements/élèves/parents), consommation tokens IA,
-- et relation plusieurs-à-plusieurs enseignant <-> établissement.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Nouvelles colonnes sur profiles
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS contract_start_date date,
  ADD COLUMN IF NOT EXISTS contract_end_date date,
  ADD COLUMN IF NOT EXISTS subscription_end_date date;

-- ----------------------------------------------------------------------------
-- 2. Table de liaison plusieurs-à-plusieurs enseignant <-> établissement
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.teacher_establishments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  establishment_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (teacher_id, establishment_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.teacher_establishments TO authenticated;
GRANT ALL ON public.teacher_establishments TO service_role;
ALTER TABLE public.teacher_establishments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers manage their own establishment links"
  ON public.teacher_establishments FOR ALL TO authenticated
  USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Establishments can view their linked teachers"
  ON public.teacher_establishments FOR SELECT TO authenticated
  USING (auth.uid() = establishment_id);

CREATE INDEX IF NOT EXISTS idx_teacher_establishments_teacher ON public.teacher_establishments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_establishments_establishment ON public.teacher_establishments(establishment_id);

-- Backfill depuis l'ancien lien unique profiles.establishment_id
INSERT INTO public.teacher_establishments (teacher_id, establishment_id)
SELECT p.id, p.establishment_id
FROM public.profiles p
WHERE p.establishment_id IS NOT NULL
ON CONFLICT (teacher_id, establishment_id) DO NOTHING;

-- Un enseignant doit pouvoir lire l'état (is_active) des établissements auxquels il est lié,
-- pour filtrer les établissements expirés côté switcher.
CREATE POLICY "Teachers can view linked establishment profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.teacher_establishments te
    WHERE te.establishment_id = profiles.id AND te.teacher_id = auth.uid()
  ));

-- ----------------------------------------------------------------------------
-- 3. Pointeur depuis la table libre "establishments" vers le vrai compte
-- ----------------------------------------------------------------------------
ALTER TABLE public.establishments
  ADD COLUMN IF NOT EXISTS establishment_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- ----------------------------------------------------------------------------
-- 4. Suivi (estimation) de la consommation de tokens IA
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_token_usage (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  role_group text NOT NULL CHECK (role_group IN ('student', 'teacher', 'pedago', 'admin', 'other')),
  function_name text NOT NULL,
  estimated_input_tokens integer NOT NULL DEFAULT 0,
  estimated_output_tokens integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.ai_token_usage TO authenticated;
GRANT ALL ON public.ai_token_usage TO service_role;
ALTER TABLE public.ai_token_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own token usage"
  ON public.ai_token_usage FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all token usage"
  ON public.ai_token_usage FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

CREATE INDEX IF NOT EXISTS idx_ai_token_usage_role_created ON public.ai_token_usage(role_group, created_at);

-- ----------------------------------------------------------------------------
-- 5. Journal des rappels de renouvellement envoyés
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.renewal_reminders_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sent_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  channel text NOT NULL DEFAULT 'email',
  success boolean NOT NULL DEFAULT true,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.renewal_reminders_log TO authenticated;
GRANT ALL ON public.renewal_reminders_log TO service_role;
ALTER TABLE public.renewal_reminders_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view reminder logs"
  ON public.renewal_reminders_log FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

CREATE POLICY "Admins can insert reminder logs"
  ON public.renewal_reminders_log FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

CREATE INDEX IF NOT EXISTS idx_renewal_reminders_target ON public.renewal_reminders_log(target_user_id, created_at DESC);

-- ----------------------------------------------------------------------------
-- 6. Dérivation de is_active pour les établissements à partir des dates de contrat
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_etablissement_active_from_dates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = NEW.id AND ur.role = 'etablissement'
  ) THEN
    IF NEW.contract_start_date IS NOT NULL OR NEW.contract_end_date IS NOT NULL THEN
      NEW.is_active := (
        (NEW.contract_start_date IS NULL OR NEW.contract_start_date <= CURRENT_DATE)
        AND (NEW.contract_end_date IS NULL OR NEW.contract_end_date >= CURRENT_DATE)
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_etablissement_active ON public.profiles;
CREATE TRIGGER trg_sync_etablissement_active
  BEFORE UPDATE OF contract_start_date, contract_end_date ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_etablissement_active_from_dates();

-- ----------------------------------------------------------------------------
-- 7. Cascade : quand un établissement change de statut, met à jour ses enseignants
--    (un enseignant reste actif tant qu'au moins un de ses établissements est actif)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cascade_etablissement_status_to_teachers()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Le rôle est vérifié ici (et non dans un WHEN de trigger, qui n'accepte pas les sous-requêtes).
  IF NEW.is_active IS DISTINCT FROM OLD.is_active
     AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = NEW.id AND ur.role = 'etablissement')
  THEN
    IF NEW.is_active = false THEN
      UPDATE public.profiles p
      SET is_active = false
      WHERE p.id IN (
        SELECT te.teacher_id FROM public.teacher_establishments te WHERE te.establishment_id = NEW.id
      )
      AND NOT EXISTS (
        SELECT 1
        FROM public.teacher_establishments te2
        JOIN public.profiles est ON est.id = te2.establishment_id
        WHERE te2.teacher_id = p.id AND est.is_active = true
      );
    ELSE
      UPDATE public.profiles p
      SET is_active = true
      WHERE p.id IN (
        SELECT te.teacher_id FROM public.teacher_establishments te WHERE te.establishment_id = NEW.id
      )
      AND p.is_active = false
      AND EXISTS (
        SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role = 'teacher'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_cascade_etablissement_status ON public.profiles;
CREATE TRIGGER trg_cascade_etablissement_status
  AFTER UPDATE OF is_active ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.cascade_etablissement_status_to_teachers();

-- ----------------------------------------------------------------------------
-- 8. Recalcul quotidien (expiration silencieuse sans écriture admin)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.recompute_expired_contracts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Établissements : force le re-déclenchement du trigger BEFORE UPDATE via un no-op.
  UPDATE public.profiles p
  SET contract_end_date = p.contract_end_date
  WHERE EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role = 'etablissement')
    AND (p.contract_start_date IS NOT NULL OR p.contract_end_date IS NOT NULL);

  -- Élèves/parents : l'expiration passive ne fait que désactiver
  -- (la réactivation se fait uniquement via l'action "ajouter des jours").
  UPDATE public.profiles p
  SET is_active = false
  WHERE p.subscription_end_date IS NOT NULL
    AND p.subscription_end_date < CURRENT_DATE
    AND p.is_active = true
    AND EXISTS (
      SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role IN ('student', 'parent')
    );
END;
$$;

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

DO $$
BEGIN
  PERFORM cron.unschedule('daily-contract-expiry-check');
EXCEPTION WHEN OTHERS THEN
  NULL;
END$$;

SELECT cron.schedule(
  'daily-contract-expiry-check',
  '0 3 * * *',
  $cron$ SELECT public.recompute_expired_contracts(); $cron$
);

-- ----------------------------------------------------------------------------
-- 9. RPCs
-- ----------------------------------------------------------------------------

-- Résout un code d'établissement en (id, nom) ET lie l'enseignant appelant.
CREATE OR REPLACE FUNCTION public.join_establishment_by_code(p_code text)
RETURNS TABLE(establishment_id uuid, establishment_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_id uuid;
  v_name text;
BEGIN
  SELECT id, first_name INTO v_id, v_name
  FROM public.profiles
  WHERE establishment_code = upper(trim(p_code))
  LIMIT 1;

  IF v_id IS NULL THEN
    RAISE EXCEPTION 'Code d''établissement invalide.';
  END IF;

  INSERT INTO public.teacher_establishments (teacher_id, establishment_id)
  VALUES (auth.uid(), v_id)
  ON CONFLICT (teacher_id, establishment_id) DO NOTHING;

  RETURN QUERY SELECT v_id, v_name;
END;
$$;

-- Variante de get_my_primary_establishment_name() qui retourne aussi l'id.
CREATE OR REPLACE FUNCTION public.get_my_primary_establishment()
RETURNS TABLE(establishment_id uuid, establishment_name text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT p2.id, p2.first_name
  FROM public.profiles p1
  JOIN public.profiles p2 ON p2.id = p1.establishment_id
  WHERE p1.id = auth.uid()
  LIMIT 1;
$$;

-- Étend la vérification enseignant<->établissement à la nouvelle table de liaison,
-- en plus de l'ancien lien unique. Toutes les policies existantes qui appellent
-- cette fonction (profiles/user_roles/classes/class_students) en bénéficient
-- automatiquement, sans policy dupliquée.
CREATE OR REPLACE FUNCTION public.is_establishment_teacher(_est_id uuid, _teacher_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = _teacher_id AND establishment_id = _est_id
  ) OR EXISTS (
    SELECT 1 FROM public.teacher_establishments WHERE teacher_id = _teacher_id AND establishment_id = _est_id
  )
$$;

-- ----------------------------------------------------------------------------
-- 10. Trigger d'inscription : lier aussi l'enseignant dans teacher_establishments
--     (corps complet repris de 20260630112908_bdfb7c4b-cb2d-4195-90bf-01aff59260c4.sql
--     + insertion supplémentaire dans teacher_establishments).
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_school_level_text text;
  v_school_level_enum public.school_level;
  v_role_text text;
  v_role_enum public.app_role;
  v_filiere text;
  v_dob text;
  v_wilaya text;
  v_ville text;
  v_ecole text;
  v_phone text;
  v_est_code text;
  v_est_id uuid;
  v_new_est_code text;
BEGIN
  v_school_level_text := NULLIF(trim(COALESCE(NEW.raw_user_meta_data ->> 'school_level', '')), '');
  v_filiere := NULLIF(trim(COALESCE(NEW.raw_user_meta_data ->> 'filiere', '')), '');
  v_dob := NULLIF(trim(COALESCE(NEW.raw_user_meta_data ->> 'date_of_birth', '')), '');
  v_wilaya := NULLIF(trim(COALESCE(NEW.raw_user_meta_data ->> 'wilaya', '')), '');
  v_ville := NULLIF(trim(COALESCE(NEW.raw_user_meta_data ->> 'ville', '')), '');
  v_ecole := NULLIF(trim(COALESCE(NEW.raw_user_meta_data ->> 'ecole', '')), '');
  v_phone := NULLIF(trim(COALESCE(NEW.raw_user_meta_data ->> 'phone', '')), '');

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

  v_role_text := NULLIF(lower(trim(COALESCE(NEW.raw_user_meta_data ->> 'role', ''))), '');
  v_role_enum := CASE v_role_text
    WHEN 'student' THEN 'student'::public.app_role
    WHEN 'parent' THEN 'parent'::public.app_role
    WHEN 'admin' THEN 'admin'::public.app_role
    WHEN 'pedago' THEN 'pedago'::public.app_role
    WHEN 'teacher' THEN 'teacher'::public.app_role
    WHEN 'etablissement' THEN 'etablissement'::public.app_role
    ELSE NULL
  END;

  -- A teacher self-registration requires a valid establishment code.
  IF v_role_enum = 'teacher'::public.app_role THEN
    v_est_code := NULLIF(upper(trim(COALESCE(NEW.raw_user_meta_data ->> 'establishment_code', ''))), '');
    IF v_est_code IS NULL THEN
      RAISE EXCEPTION 'Un code d''établissement est requis pour créer un compte enseignant.';
    END IF;
    SELECT id INTO v_est_id FROM public.profiles WHERE establishment_code = v_est_code;
    IF v_est_id IS NULL THEN
      RAISE EXCEPTION 'Code d''établissement invalide.';
    END IF;
  END IF;

  -- An establishment account gets a freshly generated unique code.
  IF v_role_enum = 'etablissement'::public.app_role THEN
    v_new_est_code := public.generate_establishment_code();
  END IF;

  INSERT INTO public.profiles (id, email, email_verified, first_name, last_name, school_level, filiere, date_of_birth, wilaya, ville, ecole, phone, establishment_id, establishment_code)
  VALUES (
    NEW.id, NEW.email, NEW.email_confirmed_at IS NOT NULL,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    v_school_level_enum, v_filiere,
    CASE WHEN v_dob IS NOT NULL THEN v_dob::date ELSE NULL END,
    v_wilaya, v_ville, v_ecole, v_phone, v_est_id, v_new_est_code
  );

  IF v_role_enum IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, v_role_enum)
    ON CONFLICT DO NOTHING;
  END IF;

  IF v_est_id IS NOT NULL THEN
    INSERT INTO public.teacher_establishments (teacher_id, establishment_id)
    VALUES (NEW.id, v_est_id)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;
