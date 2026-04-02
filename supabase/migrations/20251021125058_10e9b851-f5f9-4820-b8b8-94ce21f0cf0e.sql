-- Ajouter le rôle admin au compte utilisé
INSERT INTO public.user_roles (user_id, role)
VALUES ('6e89bd42-45db-4629-8fb2-b2f493be8940', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;