
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'Nouvelle conversation',
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations"
  ON public.chat_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
  ON public.chat_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON public.chat_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON public.chat_conversations FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all conversations"
  ON public.chat_conversations FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_chat_conversations_user_chapter 
  ON public.chat_conversations(user_id, chapter_id);

CREATE INDEX idx_chat_conversations_updated 
  ON public.chat_conversations(updated_at DESC);
