-- Add a unique join code to each class
ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS join_code text;

-- Backfill existing classes with a unique code
UPDATE public.classes
SET join_code = upper(substring(encode(extensions.gen_random_bytes(5), 'hex') from 1 for 8))
WHERE join_code IS NULL;

-- Default for new classes
ALTER TABLE public.classes
  ALTER COLUMN join_code SET DEFAULT upper(substring(encode(extensions.gen_random_bytes(5), 'hex') from 1 for 8));

ALTER TABLE public.classes
  ALTER COLUMN join_code SET NOT NULL;

-- Ensure uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS classes_join_code_key ON public.classes (join_code);