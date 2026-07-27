-- Centre de notifications admin : modèles d'email réutilisables (avec logo,
-- façon email d'entreprise) envoyés en masse à un segment d'utilisateurs
-- filtré (rôle + statut contrat/abonnement). Couvre aussi bien les campagnes
-- ponctuelles que les rappels d'expiration (= un modèle envoyé au segment
-- "contrat/abonnement bientôt expiré").

CREATE TABLE public.email_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  subject text NOT NULL,
  body_text text NOT NULL,
  logo_url text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage email templates"
ON public.email_templates FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Historique des campagnes envoyées (écrit uniquement par l'edge function
-- send-bulk-notification via service_role, qui contourne RLS — aucune policy
-- INSERT n'est donc ouverte aux utilisateurs authentifiés ici).
CREATE TABLE public.email_campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id uuid REFERENCES public.email_templates(id) ON DELETE SET NULL,
  template_name_snapshot text NOT NULL,
  subject_snapshot text NOT NULL,
  filter_roles text[] NOT NULL DEFAULT '{}',
  filter_contract_status text NOT NULL DEFAULT 'all'
    CHECK (filter_contract_status IN ('all', 'no_contract', 'has_contract', 'expiring_soon', 'expired')),
  recipient_count integer NOT NULL DEFAULT 0,
  success_count integer NOT NULL DEFAULT 0,
  failure_count integer NOT NULL DEFAULT 0,
  failed_emails text[] NOT NULL DEFAULT '{}',
  sent_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  sent_by_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_campaigns_created_at ON public.email_campaigns (created_at DESC);

GRANT ALL ON public.email_campaigns TO service_role;

ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view email campaign history"
ON public.email_campaigns FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Bucket public pour les logos insérés dans les modèles d'email (les clients
-- mail exigent une URL publique, un data URI est souvent filtré) — même
-- schéma de policies que lesson-media (public en lecture, écriture admin).
INSERT INTO storage.buckets (id, name, public)
VALUES ('email-assets', 'email-assets', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read access to email assets" ON storage.objects;
CREATE POLICY "Public read access to email assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'email-assets');

DROP POLICY IF EXISTS "Admin can upload email assets" ON storage.objects;
CREATE POLICY "Admin can upload email assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'email-assets'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

DROP POLICY IF EXISTS "Admin can update email assets" ON storage.objects;
CREATE POLICY "Admin can update email assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'email-assets'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

DROP POLICY IF EXISTS "Admin can delete email assets" ON storage.objects;
CREATE POLICY "Admin can delete email assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'email-assets'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Compte les destinataires correspondant à un filtre avant l'envoi (aperçu côté
-- admin) — reproduit exactement la logique de filtrage de l'edge function
-- send-bulk-notification pour rester cohérent avec le nombre réel envoyé.
CREATE OR REPLACE FUNCTION public.count_notification_recipients(_roles public.app_role[], _contract_status text)
RETURNS integer
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count integer;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;

  SELECT count(DISTINCT p.id) INTO v_count
  FROM public.profiles p
  JOIN public.user_roles ur ON ur.user_id = p.id
  WHERE ur.role = ANY(_roles)
    AND p.email IS NOT NULL
    AND p.is_active IS NOT FALSE
    AND (
      _contract_status = 'all'
      OR (_contract_status = 'no_contract' AND (CASE WHEN ur.role = 'etablissement' THEN p.contract_end_date ELSE p.subscription_end_date END) IS NULL)
      OR (_contract_status = 'has_contract' AND (CASE WHEN ur.role = 'etablissement' THEN p.contract_end_date ELSE p.subscription_end_date END) IS NOT NULL)
      OR (_contract_status = 'expiring_soon' AND (CASE WHEN ur.role = 'etablissement' THEN p.contract_end_date ELSE p.subscription_end_date END) BETWEEN CURRENT_DATE AND CURRENT_DATE + 30)
      OR (_contract_status = 'expired' AND (CASE WHEN ur.role = 'etablissement' THEN p.contract_end_date ELSE p.subscription_end_date END) < CURRENT_DATE)
    );

  RETURN COALESCE(v_count, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.count_notification_recipients(public.app_role[], text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.count_notification_recipients(public.app_role[], text) TO authenticated;

NOTIFY pgrst, 'reload schema';
