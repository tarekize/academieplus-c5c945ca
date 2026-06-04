CREATE OR REPLACE FUNCTION public.check_exercise_answer(_exercise_id uuid, _user_answer text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _expected_answer text;
  _accepted_answers jsonb;
  _solution text;
  _is_correct boolean := false;
  _accepted text;
  _user_norm text;
BEGIN
  SELECT expected_answer, accepted_answers, solution
  INTO _expected_answer, _accepted_answers, _solution
  FROM public.chapter_exercises
  WHERE id = _exercise_id;

  IF _expected_answer IS NULL THEN
    RETURN jsonb_build_object('error', 'Exercise not found');
  END IF;

  -- Normalize: lowercase + remove all whitespace (so "2 x" = "2x") for an EXACT comparison.
  _user_norm := regexp_replace(lower(trim(_user_answer)), '\s+', '', 'g');

  -- Exact match against expected_answer.
  IF _user_norm <> '' AND _user_norm = regexp_replace(lower(trim(_expected_answer)), '\s+', '', 'g') THEN
    _is_correct := true;
  END IF;

  -- Exact match against any of the accepted answers (no substring/LIKE matching).
  IF NOT _is_correct AND _accepted_answers IS NOT NULL THEN
    FOR _accepted IN SELECT jsonb_array_elements_text(_accepted_answers) LOOP
      IF _user_norm <> '' AND _user_norm = regexp_replace(lower(trim(_accepted)), '\s+', '', 'g') THEN
        _is_correct := true;
        EXIT;
      END IF;
    END LOOP;
  END IF;

  RETURN jsonb_build_object(
    'is_correct', _is_correct,
    'expected_answer', _expected_answer,
    'solution', _solution
  );
END;
$function$;