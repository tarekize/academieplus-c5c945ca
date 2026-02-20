-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('student', 'parent', 'admin');

-- Create enum for school levels (French system)
CREATE TYPE public.school_level AS ENUM ('6eme', '5eme', '4eme', '3eme', 'seconde', 'premiere', 'terminale');

-- Create enum for parent-child link status
CREATE TYPE public.link_status AS ENUM ('pending', 'active', 'rejected');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    school_level public.school_level,
    linking_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(4), 'hex'),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_roles table (separate for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create parent_child_links table
CREATE TABLE public.parent_child_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    child_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status public.link_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (parent_id, child_id)
);

-- Create activity_logs table for admin
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_child_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
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

-- Function to check if user is parent of child
CREATE OR REPLACE FUNCTION public.is_parent_of(_parent_id UUID, _child_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.parent_child_links
        WHERE parent_id = _parent_id
        AND child_id = _child_id
        AND status = 'active'
    )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Parents can view linked children profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.is_parent_of(auth.uid(), id));

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete profiles"
ON public.profiles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for parent_child_links
CREATE POLICY "Parents can view their links"
ON public.parent_child_links FOR SELECT
TO authenticated
USING (auth.uid() = parent_id);

CREATE POLICY "Children can view links to them"
ON public.parent_child_links FOR SELECT
TO authenticated
USING (auth.uid() = child_id);

CREATE POLICY "Parents can create links"
ON public.parent_child_links FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can delete their links"
ON public.parent_child_links FOR DELETE
TO authenticated
USING (auth.uid() = parent_id);

CREATE POLICY "Children can update link status"
ON public.parent_child_links FOR UPDATE
TO authenticated
USING (auth.uid() = child_id);

CREATE POLICY "Admins can manage all links"
ON public.parent_child_links FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for activity_logs
CREATE POLICY "Admins can view all logs"
ON public.activity_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert logs"
ON public.activity_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER on_profiles_updated
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_parent_child_links_updated
    BEFORE UPDATE ON public.parent_child_links
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, email_verified)
    VALUES (NEW.id, NEW.email, NEW.email_confirmed_at IS NOT NULL);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Function to log activity
CREATE OR REPLACE FUNCTION public.log_activity(
    _user_id UUID,
    _action TEXT,
    _details JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.activity_logs (user_id, action, details)
    VALUES (_user_id, _action, _details)
    RETURNING id INTO log_id;
    RETURN log_id;
END;
$$;

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatars are publicly viewable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');