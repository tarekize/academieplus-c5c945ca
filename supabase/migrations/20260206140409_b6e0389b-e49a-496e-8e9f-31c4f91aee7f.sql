
-- Drop the unique constraint on code alone and add a composite unique constraint
ALTER TABLE public.filieres DROP CONSTRAINT IF EXISTS filieres_code_key;
ALTER TABLE public.filieres ADD CONSTRAINT filieres_code_school_level_key UNIQUE (code, school_level);
