-- Add first_name column to profiles table if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'first_name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN first_name text;
  END IF;
END $$;

-- Add first_name column to archived_accounts table if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'archived_accounts' 
    AND column_name = 'first_name'
  ) THEN
    ALTER TABLE public.archived_accounts ADD COLUMN first_name text;
  END IF;
END $$;