-- BUG racine : ni `chapters` ni `lessons` n'étaient dans la publication
-- `supabase_realtime` — tout abonnement realtime sur ces tables (déjà tenté
-- côté Cours.tsx via le canal "curriculum-changes", et maintenant ajouté côté
-- StudentDashboardContent.tsx) ne se déclenchait donc JAMAIS, silencieusement.
-- Un chapitre supprimé par un admin/pédago restait affiché dans le tableau de
-- bord élève jusqu'au prochain rafraîchissement à 30s (ou un rechargement de
-- page), au lieu de disparaître immédiatement.
ALTER PUBLICATION supabase_realtime ADD TABLE public.chapters;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lessons;
