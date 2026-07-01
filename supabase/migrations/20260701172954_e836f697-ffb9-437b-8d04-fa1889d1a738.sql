ALTER TABLE public.student_subscriptions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_subscriptions;