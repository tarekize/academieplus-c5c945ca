
-- RPC: Check quiz answer server-side
CREATE OR REPLACE FUNCTION public.check_quiz_answer(_quiz_id uuid, _user_answer text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _correct_answer text;
  _explanation text;
  _is_correct boolean;
BEGIN
  SELECT correct_answer, explanation
  INTO _correct_answer, _explanation
  FROM public.chapter_quizzes
  WHERE id = _quiz_id;

  IF _correct_answer IS NULL THEN
    RETURN jsonb_build_object('error', 'Question not found');
  END IF;

  _is_correct := (_user_answer = _correct_answer);

  RETURN jsonb_build_object(
    'is_correct', _is_correct,
    'explanation', COALESCE(_explanation, ''),
    'correct_answer', CASE WHEN NOT _is_correct THEN _correct_answer ELSE NULL END
  );
END;
$$;

-- RPC: Check exercise answer server-side
CREATE OR REPLACE FUNCTION public.check_exercise_answer(_exercise_id uuid, _user_answer text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _expected_answer text;
  _accepted_answers jsonb;
  _solution text;
  _is_correct boolean := false;
  _accepted text;
  _user_lower text;
BEGIN
  SELECT expected_answer, accepted_answers, solution
  INTO _expected_answer, _accepted_answers, _solution
  FROM public.chapter_exercises
  WHERE id = _exercise_id;

  IF _expected_answer IS NULL THEN
    RETURN jsonb_build_object('error', 'Exercise not found');
  END IF;

  _user_lower := lower(trim(_user_answer));

  FOR _accepted IN SELECT jsonb_array_elements_text(_accepted_answers) LOOP
    IF _user_lower = lower(trim(_accepted))
       OR _user_lower LIKE '%' || lower(trim(_accepted)) || '%'
       OR lower(trim(_accepted)) LIKE '%' || _user_lower || '%' THEN
      _is_correct := true;
      EXIT;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'is_correct', _is_correct,
    'expected_answer', _expected_answer,
    'solution', _solution
  );
END;
$$;

-- Fix log_activity to ignore client-provided IP
CREATE OR REPLACE FUNCTION public.log_activity(_user_id uuid, _action text, _details jsonb DEFAULT NULL::jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE log_id UUID;
BEGIN
  INSERT INTO public.activity_logs (user_id, action, details, ip_address)
  VALUES (_user_id, _action, _details, NULL)
  RETURNING id INTO log_id;
  RETURN log_id;
END;
$$;
