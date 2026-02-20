-- Phase 2: Anonymisation des données archivées et champs mineurs

-- Ajouter colonnes pour la protection des mineurs dans profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS parent_consent_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS parent_email TEXT,
ADD COLUMN IF NOT EXISTS parent_verified BOOLEAN DEFAULT FALSE;

-- Créer table pour les consentements parentaux
CREATE TABLE IF NOT EXISTS public.parental_consents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_email TEXT NOT NULL,
  verification_token TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  UNIQUE(child_id)
);

-- Enable RLS on parental_consents
ALTER TABLE public.parental_consents ENABLE ROW LEVEL SECURITY;

-- Parents can view their consents
CREATE POLICY "Parents can view their consents"
ON public.parental_consents
FOR SELECT
TO authenticated
USING (parent_email = (SELECT email FROM profiles WHERE id = auth.uid()));

-- System can manage parental consents
CREATE POLICY "System can manage parental consents"
ON public.parental_consents
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Fonction pour anonymiser les données d'archive
CREATE OR REPLACE FUNCTION anonymize_archived_account()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Anonymiser l'email
  NEW.email := 'user_' || substr(NEW.original_user_id::text, 1, 8) || '@deleted.local';
  
  -- Anonymiser les noms
  NEW.first_name := 'Utilisateur';
  NEW.last_name := 'Supprimé';
  NEW.full_name := 'Utilisateur Supprimé';
  
  -- Supprimer le téléphone
  NEW.phone := NULL;
  
  -- Supprimer la date de naissance (conserver seulement school_level pour stats)
  NEW.date_of_birth := NULL;
  
  RETURN NEW;
END;
$$;

-- Trigger pour anonymiser à l'insertion
DROP TRIGGER IF EXISTS anonymize_on_archive ON public.archived_accounts;
CREATE TRIGGER anonymize_on_archive
BEFORE INSERT ON public.archived_accounts
FOR EACH ROW
EXECUTE FUNCTION anonymize_archived_account();

-- Fonction pour supprimer automatiquement les archives anciennes (> 3 ans)
CREATE OR REPLACE FUNCTION delete_old_archives()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.archived_accounts
  WHERE archived_at < (NOW() - INTERVAL '3 years');
END;
$$;

-- Table pour tracer les accès aux données sensibles (Phase 5)
CREATE TABLE IF NOT EXISTS public.data_access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  accessed_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  access_type TEXT NOT NULL CHECK (access_type IN ('view', 'export', 'modify', 'delete')),
  data_type TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.data_access_logs ENABLE ROW LEVEL SECURITY;

-- Users can view logs about their data
CREATE POLICY "Users can view their own data access logs"
ON public.data_access_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR accessed_by = auth.uid());

-- Admins can view all logs
CREATE POLICY "Admins can view all data access logs"
ON public.data_access_logs
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- System can insert logs
CREATE POLICY "System can insert data access logs"
ON public.data_access_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Indexes pour performance
CREATE INDEX IF NOT EXISTS idx_data_access_logs_user_id ON public.data_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_data_access_logs_accessed_by ON public.data_access_logs(accessed_by);
CREATE INDEX IF NOT EXISTS idx_data_access_logs_created_at ON public.data_access_logs(created_at);

-- Table pour les demandes de suppression avec période de grâce
CREATE TABLE IF NOT EXISTS public.account_deletion_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  scheduled_deletion_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days'),
  reason TEXT,
  cancelled BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  executed BOOLEAN DEFAULT FALSE,
  executed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own deletion requests
CREATE POLICY "Users can view their own deletion requests"
ON public.account_deletion_requests
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can insert their own deletion requests
CREATE POLICY "Users can insert their own deletion requests"
ON public.account_deletion_requests
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can cancel their own deletion requests
CREATE POLICY "Users can cancel their own deletion requests"
ON public.account_deletion_requests
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admins can manage all deletion requests
CREATE POLICY "Admins can manage deletion requests"
ON public.account_deletion_requests
FOR ALL
TO authenticated
USING (is_admin(auth.uid()));

-- Fonction pour logger les accès aux données
CREATE OR REPLACE FUNCTION log_data_access(
  p_user_id UUID,
  p_access_type TEXT,
  p_data_type TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO data_access_logs (
    user_id,
    accessed_by,
    access_type,
    data_type,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    auth.uid(),
    p_access_type,
    p_data_type,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;