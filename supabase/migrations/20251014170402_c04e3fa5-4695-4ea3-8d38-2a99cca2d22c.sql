-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('student', 'parent', 'teacher', 'admin');

-- Create enum for school levels
CREATE TYPE public.school_level AS ENUM (
  'cp', 'ce1', 'ce2', 'cm1', 'cm2', -- Primaire
  'sixieme', 'cinquieme', 'quatrieme', 'troisieme', -- Collège
  'seconde', 'premiere', 'terminale' -- Lycée
);

-- Update profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role app_role DEFAULT 'student',
ADD COLUMN IF NOT EXISTS school_level school_level,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS parent_consent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS data_processing_consent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS account_active boolean DEFAULT true;

-- Create user_roles table for role management
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create parent_children relationship table
CREATE TABLE IF NOT EXISTS public.parent_children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  child_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(parent_id, child_id)
);

ALTER TABLE public.parent_children ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
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

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.is_admin(auth.uid()));

-- RLS Policies for parent_children
CREATE POLICY "Parents can view their children"
  ON public.parent_children FOR SELECT
  USING (auth.uid() = parent_id);

CREATE POLICY "Parents can add their children"
  ON public.parent_children FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Admins can view all parent-child relationships"
  ON public.parent_children FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Update profiles RLS policies to allow parents to view their children
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id 
    OR 
    EXISTS (
      SELECT 1 FROM public.parent_children 
      WHERE parent_id = auth.uid() AND child_id = profiles.id
    )
    OR
    public.is_admin(auth.uid())
  );

-- Update handle_new_user function to assign default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    COALESCE((new.raw_user_meta_data->>'role')::app_role, 'student')
  );
  
  -- Assign default role in user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    new.id,
    COALESCE((new.raw_user_meta_data->>'role')::app_role, 'student')
  );
  
  RETURN new;
END;
$$;