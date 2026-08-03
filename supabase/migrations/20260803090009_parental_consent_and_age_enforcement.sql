-- BLOQUANT (conformité mineurs) : le contrôle d'âge <15 ans n'existait que
-- côté client (contournable par un appel direct à signUp), la date de
-- naissance était facultative (17/25 profils existants sans DOB — donc le
-- contrôle ne s'appliquait jamais pour eux), et le "consentement parental"
-- n'était qu'une case cochée par l'enfant lui-même, sans aucune trace
-- contactable. On ajoute : (1) un calcul d'âge correct côté serveur
-- (année seule surestimait l'âge de jusqu'à 11 mois), (2) une exigence
-- serveur de date de naissance pour tout nouveau compte élève, (3) une
-- table parental_consents qui capture au moins un email de contact
-- parental pour les moins de 15 ans, avec un jeton prêt pour une future
-- vérification par email (l'envoi réel d'email et le blocage d'accès tant
-- que non vérifié restent un chantier produit à part).

CREATE OR REPLACE FUNCTION public.calculate_age(p_date_of_birth date)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
  SELECT CASE WHEN p_date_of_birth IS NULL THEN NULL ELSE
    date_part('year', age(current_date, p_date_of_birth))::integer
  END;
$function$;

CREATE TABLE IF NOT EXISTS public.parental_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_email text NOT NULL,
  token text NOT NULL UNIQUE,
  verified boolean NOT NULL DEFAULT false,
  verified_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.parental_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage parental consents"
  ON public.parental_consents FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Parents can view their children consents"
  ON public.parental_consents FOR SELECT
  TO authenticated
  USING (public.is_parent_of(auth.uid(), child_id));

CREATE INDEX IF NOT EXISTS idx_parental_consents_child ON public.parental_consents(child_id);

-- handle_new_user : date de naissance obligatoire pour un élève, calcul
-- d'âge correct, et enregistrement d'un contact parental pour les <15 ans.
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
  v_consent_data_processing boolean;
  v_consent_terms_privacy boolean;
  v_consent_parental boolean;
  v_consent_parent_email text;
  v_age integer;
BEGIN
  v_school_level_text := NULLIF(trim(COALESCE(NEW.raw_user_meta_data ->> 'school_level', '')), '');
  v_filiere := NULLIF(trim(COALESCE(NEW.raw_user_meta_data ->> 'filiere', '')), '');
  v_dob := NULLIF(trim(COALESCE(NEW.raw_user_meta_data ->> 'date_of_birth', '')), '');
  v_wilaya := NULLIF(trim(COALESCE(NEW.raw_user_meta_data ->> 'wilaya', '')), '');
  v_ville := NULLIF(trim(COALESCE(NEW.raw_user_meta_data ->> 'ville', '')), '');
  v_ecole := NULLIF(trim(COALESCE(NEW.raw_user_meta_data ->> 'ecole', '')), '');
  v_phone := NULLIF(trim(COALESCE(NEW.raw_user_meta_data ->> 'phone', '')), '');
  v_consent_data_processing := COALESCE((NEW.raw_user_meta_data ->> 'consent_data_processing')::boolean, false);
  v_consent_terms_privacy := COALESCE((NEW.raw_user_meta_data ->> 'consent_terms_privacy')::boolean, false);
  v_consent_parental := COALESCE((NEW.raw_user_meta_data ->> 'consent_parental')::boolean, false);
  v_consent_parent_email := NULLIF(trim(COALESCE(NEW.raw_user_meta_data ->> 'consent_parent_email', '')), '');

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
    WHEN 'teacher' THEN 'teacher'::public.app_role
    ELSE NULL
  END;

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

  -- Conformité mineurs : un compte élève doit fournir sa date de naissance.
  IF v_role_enum = 'student'::public.app_role THEN
    IF v_dob IS NULL THEN
      RAISE EXCEPTION 'La date de naissance est obligatoire pour créer un compte élève.';
    END IF;
    v_age := public.calculate_age(v_dob::date);
    IF v_age < 15 THEN
      IF NOT v_consent_parental OR v_consent_parent_email IS NULL THEN
        RAISE EXCEPTION 'Un consentement parental (avec email de contact du parent) est requis pour un élève de moins de 15 ans.';
      END IF;
    END IF;
  END IF;

  INSERT INTO public.profiles (
    id, email, email_verified, first_name, last_name, school_level, filiere, date_of_birth,
    wilaya, ville, ecole, phone, establishment_id, establishment_code,
    consent_data_processing_at, consent_terms_privacy_at, consent_parental_at
  )
  VALUES (
    NEW.id, NEW.email, NEW.email_confirmed_at IS NOT NULL,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    v_school_level_enum, v_filiere,
    CASE WHEN v_dob IS NOT NULL THEN v_dob::date ELSE NULL END,
    v_wilaya, v_ville, v_ecole, v_phone, v_est_id, NULL,
    CASE WHEN v_consent_data_processing THEN now() ELSE NULL END,
    CASE WHEN v_consent_terms_privacy THEN now() ELSE NULL END,
    CASE WHEN v_consent_parental THEN now() ELSE NULL END
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

  IF v_role_enum = 'student'::public.app_role AND v_age < 15 THEN
    INSERT INTO public.parental_consents (child_id, parent_email, token)
    VALUES (NEW.id, v_consent_parent_email, encode(extensions.gen_random_bytes(24), 'hex'));
  END IF;

  RETURN NEW;
END;
$function$;
