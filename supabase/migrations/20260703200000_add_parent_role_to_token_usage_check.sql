-- The ai_token_usage.role_group CHECK constraint was missing 'parent', silently
-- rejecting every token usage insert logged with roleGroup: "parent"
-- (e.g. from generate-parent-report), which is why the admin token-usage page
-- always showed 0 tokens for the "Parents" group.
ALTER TABLE public.ai_token_usage
  DROP CONSTRAINT IF EXISTS ai_token_usage_role_group_check;

ALTER TABLE public.ai_token_usage
  ADD CONSTRAINT ai_token_usage_role_group_check
  CHECK (role_group IN ('student', 'teacher', 'pedago', 'admin', 'parent', 'other'));
