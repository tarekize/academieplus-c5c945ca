-- Créer le bucket de stockage pour les médias
INSERT INTO storage.buckets (id, name, public)
VALUES ('medias', 'medias', true)
ON CONFLICT (id) DO NOTHING;

-- Créer les politiques RLS pour le bucket medias
CREATE POLICY "Les médias sont accessibles publiquement"
ON storage.objects FOR SELECT
USING (bucket_id = 'medias');

CREATE POLICY "Les utilisateurs authentifiés peuvent uploader des médias"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'medias' AND auth.uid() IS NOT NULL);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres médias"
ON storage.objects FOR DELETE
USING (bucket_id = 'medias' AND auth.uid() IS NOT NULL);