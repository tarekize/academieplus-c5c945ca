-- Table pour stocker les codes de parrainage uniques de chaque utilisateur
CREATE TABLE public.referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  UNIQUE(user_id)
);

-- Index pour améliorer les performances de recherche
CREATE INDEX idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX idx_referral_codes_user_id ON public.referral_codes(user_id);

-- Table pour tracer les relations de parrainage
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_used text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'fraud')),
  first_subscription_id uuid REFERENCES public.subscriptions(id),
  discount_applied_referrer boolean DEFAULT false,
  discount_applied_referee boolean DEFAULT false,
  notes text,
  UNIQUE(referee_id),
  CHECK (referrer_id != referee_id)
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referee_id ON public.referrals(referee_id);
CREATE INDEX idx_referrals_status ON public.referrals(status);

-- Fonction pour générer un code de parrainage unique
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    -- Générer un code aléatoire de 8 caractères (lettres majuscules et chiffres)
    new_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    
    -- Vérifier si le code existe déjà
    SELECT EXISTS(SELECT 1 FROM public.referral_codes WHERE code = new_code) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Fonction pour calculer la réduction de parrainage d'un utilisateur
CREATE OR REPLACE FUNCTION public.calculate_referral_discount(p_user_id uuid)
RETURNS numeric
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  active_referrals_count integer;
  discount_percentage numeric;
BEGIN
  -- Compter le nombre de filleuls actifs
  SELECT COUNT(*) INTO active_referrals_count
  FROM public.referrals
  WHERE referrer_id = p_user_id
    AND status = 'active';
  
  -- Calculer la réduction (5% par filleul, max 50%)
  discount_percentage := LEAST(active_referrals_count * 5, 50);
  
  RETURN discount_percentage;
END;
$$;

-- Fonction pour appliquer la réduction au prix d'un abonnement annuel
CREATE OR REPLACE FUNCTION public.apply_referral_discount(p_base_price numeric, p_user_id uuid)
RETURNS numeric
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  discount_percentage numeric;
  final_price numeric;
BEGIN
  -- Obtenir la réduction applicable
  discount_percentage := public.calculate_referral_discount(p_user_id);
  
  -- Calculer le prix final
  final_price := p_base_price * (1 - discount_percentage / 100);
  
  RETURN ROUND(final_price, 2);
END;
$$;

-- Trigger pour créer automatiquement un code de parrainage lors de la création d'un profil
CREATE OR REPLACE FUNCTION public.create_referral_code_for_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.referral_codes (user_id, code)
  VALUES (NEW.id, public.generate_referral_code());
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_profile_created_referral
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_referral_code_for_new_user();

-- Vue pour afficher les statistiques de parrainage
CREATE OR REPLACE VIEW public.referral_stats AS
SELECT 
  u.id as user_id,
  rc.code,
  COUNT(r.id) FILTER (WHERE r.status = 'active') as active_referrals,
  COUNT(r.id) FILTER (WHERE r.status = 'cancelled') as cancelled_referrals,
  COUNT(r.id) FILTER (WHERE r.status = 'fraud') as fraud_referrals,
  public.calculate_referral_discount(u.id) as current_discount_percentage,
  rc.created_at as code_created_at
FROM auth.users u
LEFT JOIN public.referral_codes rc ON rc.user_id = u.id
LEFT JOIN public.referrals r ON r.referrer_id = u.id
GROUP BY u.id, rc.code, rc.created_at;

-- Enable RLS
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour referral_codes
CREATE POLICY "Users can view their own referral code"
ON public.referral_codes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own referral code"
ON public.referral_codes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view active referral codes by code"
ON public.referral_codes FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage all referral codes"
ON public.referral_codes FOR ALL
USING (public.is_admin(auth.uid()));

-- RLS Policies pour referrals
CREATE POLICY "Users can view their referrals as referrer"
ON public.referrals FOR SELECT
USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

CREATE POLICY "Users can insert referrals when they are the referee"
ON public.referrals FOR INSERT
WITH CHECK (auth.uid() = referee_id);

CREATE POLICY "Admins can manage all referrals"
ON public.referrals FOR ALL
USING (public.is_admin(auth.uid()));