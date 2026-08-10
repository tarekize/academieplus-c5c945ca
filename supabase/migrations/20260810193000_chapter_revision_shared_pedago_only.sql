-- Le module Révision (ChapterRevision.tsx) est censé être un contenu publié
-- par le pédagogue et statique pour tout le monde ("Son contenu est publié
-- par le pédagogue et reste statique"). Or ai_generated_content est une
-- table de contenu IA PRIVÉ par utilisateur (RLS : auth.uid() = user_id) :
-- chaque élève qui ouvrait Révision et cliquait "Générer" créait et ne
-- voyait QUE sa propre copie privée (coût IA par élève, jamais partagée).
--
-- Ajoute une exception RLS étroite, uniquement pour content_type='revision'
-- (fiches de chapitre, lesson_id IS NULL) : lecture partagée pour tous les
-- authentifiés, écriture réservée aux admin/pédago. Les autres types de
-- contenu IA (remédiation personnelle, etc.) restent strictement privés.

drop policy if exists "Anyone can view shared chapter revisions" on public.ai_generated_content;
create policy "Anyone can view shared chapter revisions"
  on public.ai_generated_content for select
  to authenticated
  using (content_type = 'revision' and lesson_id is null);

drop policy if exists "Users can insert their own AI content" on public.ai_generated_content;
create policy "Users can insert their own AI content"
  on public.ai_generated_content for insert
  to public
  with check (
    auth.uid() = user_id
    and (
      content_type <> 'revision'
      or public.has_role(auth.uid(), 'admin'::public.app_role)
      or public.has_role(auth.uid(), 'pedago'::public.app_role)
    )
  );
