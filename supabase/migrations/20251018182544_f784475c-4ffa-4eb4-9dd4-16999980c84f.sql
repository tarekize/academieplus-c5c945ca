-- Modifier la politique RLS sur profiles pour permettre aux parrains de voir les infos de leurs filleuls
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

CREATE POLICY "Users can view their own profile" 
ON profiles 
FOR SELECT 
USING (
  auth.uid() = id OR
  -- Utilisateur peut voir ses enfants (via parent_children)
  EXISTS (
    SELECT 1
    FROM parent_children
    WHERE parent_children.parent_id = auth.uid()
    AND parent_children.child_id = profiles.id
  ) OR
  -- Parrain peut voir les infos de base de ses filleuls
  EXISTS (
    SELECT 1
    FROM referrals
    WHERE referrals.referrer_id = auth.uid()
    AND referrals.referee_id = profiles.id
  ) OR
  is_admin(auth.uid())
);