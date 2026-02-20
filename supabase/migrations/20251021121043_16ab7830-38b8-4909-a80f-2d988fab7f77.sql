-- Ajouter une politique RLS pour permettre la suppression de cours
CREATE POLICY "Éditeurs peuvent supprimer cours"
ON public.cours
FOR DELETE
USING (true);