-- BUG : l'upload de photo de profil échouait avec "new row violates row-level
-- security policy" pour tout utilisateur. Cause racine : AvatarUpload.tsx
-- appelle .upload(..., { upsert: true }), que Supabase Storage traduit en
-- INSERT ... ON CONFLICT (bucket_id, name) DO UPDATE. Ce chemin UPDATE d'un
-- upsert a besoin de pouvoir SELECT la ligne existante pour détecter le
-- conflit — or la policy SELECT du bucket "avatars" avait été supprimée par
-- la migration 20260803090007 (elle était en USING(true), permettant
-- l'énumération de tous les fichiers du bucket, y compris des photos de
-- mineurs, par un client authentifié quelconque). Sans AUCUNE policy SELECT,
-- l'upsert ne peut plus détecter/valider le conflit et RLS bloque tout,
-- même l'upload initial d'un utilisateur dans SON PROPRE dossier.
--
-- Fix : on restaure une policy SELECT, mais strictement scoped au dossier de
-- l'utilisateur (même prédicat que les policies INSERT/UPDATE/DELETE déjà en
-- place), donc sans réintroduire le risque d'énumération corrigé par
-- 20260803090007 — chacun ne peut lister/lire que son propre avatar via
-- l'API authentifiée (la lecture publique par URL directe reste inchangée,
-- gérée par le bucket public, indépendamment de cette policy).
CREATE POLICY "Users can view their own avatar objects"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);
