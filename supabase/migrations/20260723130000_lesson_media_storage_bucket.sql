-- Bucket de stockage pour les images insérées dans le contenu des leçons
-- (bouton "Ajouter une image" des éditeurs LessonSourceEditor et
-- InlineLessonEditor) : jusqu'ici ce bouton se contentait d'insérer un
-- placeholder texte ("URL_DE_L_IMAGE") que le pédagogue devait remplacer
-- manuellement — il n'y avait aucun moyen d'importer réellement une image
-- depuis l'appareil. Public en lecture (les leçons sont consultées par tous
-- les élèves), écriture réservée aux admins/pédagogues (seuls rôles pouvant
-- éditer le contenu des leçons).
INSERT INTO storage.buckets (id, name, public)
VALUES ('lesson-media', 'lesson-media', true)
ON CONFLICT (id) DO NOTHING;

-- DROP IF EXISTS avant chaque CREATE POLICY : rend la migration rejouable
-- sans erreur si une exécution précédente s'est arrêtée à mi-chemin (ex:
-- bucket créé mais policies pas encore appliquées).
DROP POLICY IF EXISTS "Public read access to lesson media" ON storage.objects;
CREATE POLICY "Public read access to lesson media"
ON storage.objects FOR SELECT
USING (bucket_id = 'lesson-media');

DROP POLICY IF EXISTS "Pedago and admin can upload lesson media" ON storage.objects;
CREATE POLICY "Pedago and admin can upload lesson media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'lesson-media'
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND (ur.role = 'admin' OR ur.role = 'pedago')
  )
);

DROP POLICY IF EXISTS "Pedago and admin can update lesson media" ON storage.objects;
CREATE POLICY "Pedago and admin can update lesson media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'lesson-media'
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND (ur.role = 'admin' OR ur.role = 'pedago')
  )
);

DROP POLICY IF EXISTS "Pedago and admin can delete lesson media" ON storage.objects;
CREATE POLICY "Pedago and admin can delete lesson media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'lesson-media'
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND (ur.role = 'admin' OR ur.role = 'pedago')
  )
);

NOTIFY pgrst, 'reload schema';
