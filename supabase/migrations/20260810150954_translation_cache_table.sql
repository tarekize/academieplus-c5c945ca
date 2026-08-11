-- Cache serveur partagé pour les traductions à la volée (contenu élève :
-- titres, contenu de leçon, énoncés/solutions/aides d'exercices, questions
-- de quiz). Le contenu pédagogique n'existe qu'en une seule langue en base
-- (arabe) ; ce cache évite de retraduire le même texte pour chaque élève et
-- chaque session, ce qui épuiserait rapidement le quota du service de
-- traduction gratuit (partagé par IP sortante de l'edge function, donc par
-- toute l'application, pas par utilisateur).
create table if not exists public.translation_cache (
  cache_key text primary key,
  target_lang text not null check (target_lang in ('fr','ar')),
  source_text text not null,
  translated_text text not null,
  created_at timestamptz not null default now()
);

alter table public.translation_cache enable row level security;

-- Lecture ouverte à tout utilisateur authentifié (contenu non sensible,
-- juste des traductions de contenu pédagogique déjà visible).
create policy "translation_cache_select_authenticated"
  on public.translation_cache for select
  to authenticated
  using (true);

-- Aucune policy insert/update/delete pour les rôles authenticated/anon :
-- seule l'edge function translate-text (clé service_role, qui contourne
-- RLS) peut écrire dans ce cache.
revoke all on public.translation_cache from authenticated, anon;
grant select on public.translation_cache to authenticated;
