-- ============================================================================
-- Corrige les établissements (table libre "establishments") créés avant la
-- colonne establishment_profile_id : elle reste NULL pour ces lignes, donc le
-- statut actif/inactif de l'établissement n'est jamais vérifié côté enseignant
-- (le verrou ne s'applique jamais). On rattache ces lignes au vrai compte
-- établissement correspondant.
-- ============================================================================

-- 1. Rattachement précis via teacher_establishments (nom de l'établissement
--    correspondant au first_name du compte établissement lié à cet enseignant).
UPDATE public.establishments e
SET establishment_profile_id = te.establishment_id
FROM public.teacher_establishments te
JOIN public.profiles p ON p.id = te.establishment_id
WHERE e.establishment_profile_id IS NULL
  AND te.teacher_id = e.teacher_id
  AND lower(trim(p.first_name)) = lower(trim(e.name));

-- 2. Repli pour les lignes restantes : lien historique unique
--    profiles.establishment_id de l'enseignant propriétaire de la ligne.
UPDATE public.establishments e
SET establishment_profile_id = p.establishment_id
FROM public.profiles p
WHERE e.establishment_profile_id IS NULL
  AND e.teacher_id = p.id
  AND p.establishment_id IS NOT NULL;
