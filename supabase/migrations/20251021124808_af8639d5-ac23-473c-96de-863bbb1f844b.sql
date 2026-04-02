-- Ajouter les rôles editeur et reviseur à l'enum app_role
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'editeur';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'reviseur';