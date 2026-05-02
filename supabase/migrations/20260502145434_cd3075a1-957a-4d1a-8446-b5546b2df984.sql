
-- 1. Profiles: remove the broad parent policy that allowed viewing a child's
--    linking_code on pending/rejected links. The remaining policy
--    "Parents can view linked children profiles" uses is_parent_of() which
--    only matches status = 'active'.
DROP POLICY IF EXISTS "Parents can view linked children profiles (any status)" ON public.profiles;

-- 2. Activation codes: remove the policy that lets any authenticated user
--    enumerate all unused/free codes.
DROP POLICY IF EXISTS "Anyone can lookup free codes" ON public.activation_codes;

-- 3. SECURITY DEFINER functions: revoke broad EXECUTE rights and re-grant
--    only where end users legitimately need to call them.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_parent_of(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_activity(uuid, text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_activation_code() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM PUBLIC, anon, authenticated;

-- Student-facing helpers: signed-in users only, never anon.
REVOKE EXECUTE ON FUNCTION public.check_quiz_answer(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.check_exercise_answer(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_student_quizzes(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_student_exercises(uuid, uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.check_quiz_answer(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_exercise_answer(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_student_quizzes(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_student_exercises(uuid, uuid) TO authenticated;
