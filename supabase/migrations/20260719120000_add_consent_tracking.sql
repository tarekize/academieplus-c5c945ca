-- RGPD accountability (art. 7(1)): persist proof of consent captured at signup,
-- instead of only checking the boxes client-side and discarding the result.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS consent_data_processing_at timestamptz,
  ADD COLUMN IF NOT EXISTS consent_terms_privacy_at timestamptz,
  ADD COLUMN IF NOT EXISTS consent_parental_at timestamptz;

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
  v_consent_data_processing boolean;
  v_consent_terms_privacy boolean;
  v_consent_parental boolean;
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
    v_wilaya, v_ville, v_ecole, v_phone, v_est_id, v_new_est_code,
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

  RETURN NEW;
END;
$function$;
