-- Ré-audit du 12/08 : un enseignant qui arrive sur /complete-profile sans
-- rôle encore assigné (ex : inscription Google OAuth, qui ne passe pas par
-- performSignUp()/handle_new_user() et son raw_user_meta_data.role) ne
-- pouvait PAS terminer son inscription en choisissant "Enseignant" :
--   1. CompleteProfile.tsx appelait join_establishment_by_code(), qui exige
--      `has_role(auth.uid(), 'teacher')` — impossible puisque justement
--      aucun rôle n'est encore assigné à ce stade (poule et œuf).
--   2. Même en contournant ce premier blocage, l'insert direct
--      `user_roles.insert({ role: 'teacher' })` depuis le client aurait été
--      rejeté par la policy RLS "Users can insert their own initial role",
--      qui n'autorise que role IN ('student','parent') en self-insert.
-- Résultat : ce chemin d'inscription échouait toujours avec un message
-- d'erreur incompréhensible ("Seul un enseignant peut rejoindre un
-- établissement.") pour un utilisateur qui justement essaie de le devenir.
--
-- Correctif : une RPC dédiée qui fait, de façon atomique et sans dépendre
-- d'un rôle déjà présent, ce que handle_new_user() fait pour les enseignants
-- qui s'inscrivent par email/mot de passe : valider le code établissement,
-- assigner le rôle teacher, rattacher l'établissement (teacher_establishments
-- + profiles.establishment_id, comme handle_new_user pour que
-- get_my_primary_establishment()/EstablishmentManager fonctionnent à
-- l'identique quel que soit le chemin d'inscription).
create or replace function public.complete_teacher_signup(p_code text)
returns table(establishment_id uuid, establishment_name text)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_id uuid;
  v_name text;
begin
  -- Empêche un compte ayant déjà un rôle (élève, parent, ou déjà enseignant)
  -- de s'en attribuer un second via cette RPC.
  if public.user_has_any_role(auth.uid()) then
    raise exception 'Ce compte a déjà un rôle assigné.';
  end if;

  select id, first_name into v_id, v_name
  from public.profiles
  where establishment_code = upper(trim(p_code))
  limit 1;

  if v_id is null then
    raise exception 'Code d''établissement invalide.';
  end if;

  insert into public.user_roles (user_id, role) values (auth.uid(), 'teacher'::public.app_role)
  on conflict do nothing;

  update public.profiles set establishment_id = v_id where id = auth.uid();

  insert into public.teacher_establishments (teacher_id, establishment_id)
  values (auth.uid(), v_id)
  on conflict (teacher_id, establishment_id) do nothing;

  return query select v_id, v_name;
end;
$function$;

revoke all on function public.complete_teacher_signup(text) from public;
revoke all on function public.complete_teacher_signup(text) from anon;
grant execute on function public.complete_teacher_signup(text) to authenticated;
