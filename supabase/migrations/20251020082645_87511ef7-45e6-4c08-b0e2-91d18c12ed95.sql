-- Check if app_role type exists, if not create it
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'editeur', 'reviseur');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table (NEVER store roles in profiles!)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user roles
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS SETOF app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
$$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can delete roles" ON public.user_roles;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Add profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    nom TEXT,
    prenom TEXT,
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Only admins can insert profiles" ON public.profiles;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
ON public.profiles
FOR SELECT
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Only admins can insert profiles"
ON public.profiles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nom, prenom)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nom', ''),
    COALESCE(NEW.raw_user_meta_data->>'prenom', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);