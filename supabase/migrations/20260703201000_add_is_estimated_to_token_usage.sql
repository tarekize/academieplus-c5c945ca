-- Distinguish real token counts (from the AI provider's own usage metadata)
-- from character-based estimates, so the admin token-usage page can show
-- exactly how much of the reported consumption is measured vs approximate.
ALTER TABLE public.ai_token_usage
  ADD COLUMN IF NOT EXISTS is_estimated boolean NOT NULL DEFAULT true;
