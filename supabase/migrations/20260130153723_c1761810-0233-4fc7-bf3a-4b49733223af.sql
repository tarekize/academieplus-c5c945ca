-- Table pour les codes de liaison parent-enfant
CREATE TABLE IF NOT EXISTS public.linking_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  code VARCHAR(8) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  used_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour les recherches par code
CREATE INDEX IF NOT EXISTS idx_linking_codes_code ON public.linking_codes(code) WHERE used = FALSE;
CREATE INDEX IF NOT EXISTS idx_linking_codes_child ON public.linking_codes(child_id);

-- Enable RLS
ALTER TABLE public.linking_codes ENABLE ROW LEVEL SECURITY;

-- Policies pour linking_codes
CREATE POLICY "Children can create and view their own codes"
ON public.linking_codes
FOR ALL
TO authenticated
USING (child_id = auth.uid())
WITH CHECK (child_id = auth.uid());

CREATE POLICY "Parents can view codes when linking"
ON public.linking_codes
FOR SELECT
TO authenticated
USING (used = FALSE AND expires_at > now());

-- Fonction pour générer un code de liaison unique
CREATE OR REPLACE FUNCTION public.generate_linking_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Générer un code de 6 caractères alphanumériques majuscules
    new_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
    
    SELECT EXISTS(SELECT 1 FROM public.linking_codes WHERE code = new_code AND used = FALSE) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Fonction pour créer une demande de liaison parent-enfant
CREATE OR REPLACE FUNCTION public.create_parent_child_request(
  p_parent_id UUID,
  p_child_email TEXT DEFAULT NULL,
  p_linking_code TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_child_id UUID;
  v_result JSON;
BEGIN
  -- Vérifier si c'est par email ou par code
  IF p_linking_code IS NOT NULL THEN
    -- Recherche par code
    SELECT lc.child_id INTO v_child_id
    FROM linking_codes lc
    WHERE lc.code = p_linking_code 
    AND lc.used = FALSE 
    AND lc.expires_at > now();
    
    IF v_child_id IS NULL THEN
      RETURN json_build_object('success', false, 'message', 'Code invalide ou expiré');
    END IF;
    
    -- Marquer le code comme utilisé
    UPDATE linking_codes 
    SET used = TRUE, used_at = now(), used_by = p_parent_id 
    WHERE code = p_linking_code;
    
  ELSIF p_child_email IS NOT NULL THEN
    -- Recherche par email
    SELECT id INTO v_child_id
    FROM profiles
    WHERE email = p_child_email AND role = 'student';
    
    IF v_child_id IS NULL THEN
      RETURN json_build_object('success', false, 'message', 'Aucun élève trouvé avec cet email');
    END IF;
  ELSE
    RETURN json_build_object('success', false, 'message', 'Veuillez fournir un email ou un code');
  END IF;
  
  -- Vérifier si le lien existe déjà
  IF EXISTS (SELECT 1 FROM parent_children WHERE parent_id = p_parent_id AND child_id = v_child_id) THEN
    RETURN json_build_object('success', false, 'message', 'Ce lien existe déjà');
  END IF;
  
  -- Créer la demande de liaison
  INSERT INTO parent_children (parent_id, child_id, status)
  VALUES (p_parent_id, v_child_id, 'pending');
  
  RETURN json_build_object('success', true, 'message', 'Demande de liaison envoyée', 'child_id', v_child_id);
END;
$$;

-- Fonction pour répondre à une demande de liaison
CREATE OR REPLACE FUNCTION public.respond_to_link_request(
  p_request_id UUID,
  p_accept BOOLEAN
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_child_id UUID;
BEGIN
  -- Vérifier que l'enfant fait la demande pour lui-même
  SELECT child_id INTO v_child_id
  FROM parent_children
  WHERE id = p_request_id AND child_id = auth.uid();
  
  IF v_child_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Demande non trouvée');
  END IF;
  
  IF p_accept THEN
    UPDATE parent_children 
    SET status = 'active' 
    WHERE id = p_request_id;
    RETURN json_build_object('success', true, 'message', 'Lien parent-enfant activé');
  ELSE
    DELETE FROM parent_children WHERE id = p_request_id;
    RETURN json_build_object('success', true, 'message', 'Demande refusée');
  END IF;
END;
$$;

-- Ajouter colonne status à parent_children si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parent_children' AND column_name = 'status') THEN
    ALTER TABLE public.parent_children ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
  END IF;
END $$;

-- Mettre à jour les politiques RLS de parent_children
DROP POLICY IF EXISTS "Parents can view their children" ON parent_children;
DROP POLICY IF EXISTS "Children can view their parents" ON parent_children;

CREATE POLICY "Parents can view and manage their children"
ON parent_children
FOR ALL
TO authenticated
USING (parent_id = auth.uid() OR child_id = auth.uid())
WITH CHECK (parent_id = auth.uid());

-- Log activité pour les admins
CREATE OR REPLACE FUNCTION public.log_user_activity(
  p_user_id UUID,
  p_action TEXT,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
  VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_details)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;