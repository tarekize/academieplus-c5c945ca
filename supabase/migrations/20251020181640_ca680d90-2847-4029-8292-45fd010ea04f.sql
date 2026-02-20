-- Create activity_logs table for monitoring
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  entity_type TEXT,
  entity_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for better performance
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all logs
CREATE POLICY "Admins can view all logs"
ON public.activity_logs
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Users can insert their own logs
CREATE POLICY "Users can insert their own logs"
ON public.activity_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create faq_items table for FAQ management
CREATE TABLE IF NOT EXISTS public.faq_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for ordering
CREATE INDEX idx_faq_items_order ON public.faq_items(order_index);
CREATE INDEX idx_faq_items_category ON public.faq_items(category);

-- Enable RLS
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;

-- Everyone can view active FAQ items
CREATE POLICY "Anyone can view active FAQ items"
ON public.faq_items
FOR SELECT
TO authenticated
USING (is_active = true);

-- Admins can manage FAQ items
CREATE POLICY "Admins can manage FAQ items"
ON public.faq_items
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_faq_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_faq_items_updated_at
BEFORE UPDATE ON public.faq_items
FOR EACH ROW
EXECUTE FUNCTION update_faq_updated_at();