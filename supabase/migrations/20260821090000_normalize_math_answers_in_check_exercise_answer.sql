-- Les exercices du programme (chapter_exercises) stockent expected_answer/
-- accepted_answers en LaTeX brut généré par l'IA (ex: "$$+\infty$$"), alors
-- que check_exercise_answer() ne faisait qu'une comparaison EXACTE
-- (minuscules + espaces retirés) — un élève tapant "+∞" (symbole direct, via
-- le clavier mathématique) était donc marqué faux tant qu'il n'écrivait pas
-- littéralement "$$+\infty$$" avec dollars et backslash. Ajout d'une
-- normalisation LaTeX -> symbole avant comparaison (même logique que
-- normalizeAnswer() côté client dans teacherContentAttempt.ts, réécrite ici
-- car la comparaison doit rester server-side pour ne jamais exposer
-- expected_answer au client avant correction). Testé directement en SQL
-- contre des valeurs réelles de la base avant application (voir historique) :
-- "$$+\infty$$", "$+\infty$" et "+∞" convergent bien vers le même jeton.
create or replace function public.normalize_math_answer(_input text)
returns text
language plpgsql
immutable
as $function$
declare
  v text;
begin
  v := replace(lower(coalesce(_input, '')), '$', '');

  -- Canonicalise les représentations de l'infini (∞, \infty, infty, inf)
  -- vers un jeton commun, AVANT le retrait générique des commandes LaTeX.
  v := replace(v, '∞', 'infinity');
  v := replace(v, '\infty', 'infinity');
  v := regexp_replace(v, '\yinfty\y', 'infinity', 'g');
  v := regexp_replace(v, '\yinf\y', 'infinity', 'g');

  -- Retire les commandes LaTeX restantes (\boxed, \frac, \to...) en gardant
  -- leur nom, comme normalizeAnswer() côté client.
  v := regexp_replace(v, '\\([a-zA-Z]+)', '\1', 'g');

  -- Retire accolades et espaces, normalise la virgule décimale.
  v := regexp_replace(v, '[{}[:space:]]', '', 'g');
  v := replace(v, ',', '.');
  v := trim(v);

  if v = 'infinity' then
    v := '+infinity';
  end if;

  return v;
end;
$function$;

create or replace function public.check_exercise_answer(_exercise_id uuid, _user_answer text)
 returns jsonb
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  _expected_answer text;
  _accepted_answers jsonb;
  _solution text;
  _is_correct boolean := false;
  _accepted text;
  _user_norm text;
begin
  select expected_answer, accepted_answers, solution
  into _expected_answer, _accepted_answers, _solution
  from public.chapter_exercises
  where id = _exercise_id;

  if _expected_answer is null then
    return jsonb_build_object('error', 'Exercise not found');
  end if;

  _user_norm := public.normalize_math_answer(_user_answer);

  if _user_norm <> '' and _user_norm = public.normalize_math_answer(_expected_answer) then
    _is_correct := true;
  end if;

  if not _is_correct and _accepted_answers is not null then
    for _accepted in select jsonb_array_elements_text(_accepted_answers) loop
      if _user_norm <> '' and _user_norm = public.normalize_math_answer(_accepted) then
        _is_correct := true;
        exit;
      end if;
    end loop;
  end if;

  return jsonb_build_object(
    'is_correct', _is_correct,
    'expected_answer', _expected_answer,
    'solution', _solution
  );
end;
$function$;
