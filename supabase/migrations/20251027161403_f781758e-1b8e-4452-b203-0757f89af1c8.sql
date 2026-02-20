-- Create user_consents table to track GDPR consents
CREATE TABLE IF NOT EXISTS public.user_consents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('data_processing', 'terms_and_privacy', 'parental_consent')),
  accepted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  UNIQUE(user_id, consent_type)
);

-- Enable Row Level Security
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

-- Users can view their own consents
CREATE POLICY "Users can view their own consents"
ON public.user_consents
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own consents (only during registration)
CREATE POLICY "Users can insert their own consents"
ON public.user_consents
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_user_consents_user_id ON public.user_consents(user_id);
CREATE INDEX idx_user_consents_consent_type ON public.user_consents(consent_type);