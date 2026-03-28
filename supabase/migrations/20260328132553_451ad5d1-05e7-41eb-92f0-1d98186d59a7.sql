
-- 1. Fix user_roles: restrict self-insert to 'student' role only
DROP POLICY IF EXISTS "Users can insert their own role" ON public.user_roles;
CREATE POLICY "Users can insert their own student role"
ON public.user_roles
FOR INSERT
TO public
WITH CHECK (
  auth.uid() = user_id
  AND role = 'student'::app_role
  AND NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid())
);

-- 2. Fix activation_codes: restrict free code updates to creator only
DROP POLICY IF EXISTS "Authenticated can update free codes" ON public.activation_codes;
CREATE POLICY "Creators can update their free codes"
ON public.activation_codes
FOR UPDATE
TO authenticated
USING (status = 'free'::text AND auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- 3. Fix chapter_exercises: restrict SELECT to authenticated users only
DROP POLICY IF EXISTS "Authenticated users can view exercises" ON public.chapter_exercises;
CREATE POLICY "Authenticated users can view exercises"
ON public.chapter_exercises
FOR SELECT
TO authenticated
USING (true);

-- 4. Fix chapter_quizzes: also restrict to authenticated only (same pattern)
DROP POLICY IF EXISTS "Authenticated users can view quizzes" ON public.chapter_quizzes;
CREATE POLICY "Authenticated users can view quizzes"
ON public.chapter_quizzes
FOR SELECT
TO authenticated
USING (true);
