-- Create archived_accounts table to store deleted account information
CREATE TABLE public.archived_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_user_id uuid NOT NULL,
  full_name text,
  email text,
  phone text,
  date_of_birth date,
  school_level school_level,
  role app_role,
  archived_at timestamp with time zone NOT NULL DEFAULT now(),
  archived_reason text DEFAULT 'User deleted account'
);

-- Enable RLS
ALTER TABLE public.archived_accounts ENABLE ROW LEVEL SECURITY;

-- Only admins can view archived accounts
CREATE POLICY "Only admins can view archived accounts"
ON public.archived_accounts
FOR SELECT
USING (is_admin(auth.uid()));

-- Only admins can manage archived accounts
CREATE POLICY "Only admins can manage archived accounts"
ON public.archived_accounts
FOR ALL
USING (is_admin(auth.uid()));

-- Add index for faster queries
CREATE INDEX idx_archived_accounts_user_id ON public.archived_accounts(original_user_id);
CREATE INDEX idx_archived_accounts_archived_at ON public.archived_accounts(archived_at);