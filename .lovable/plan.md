## Objectif

Refondre le calcul du niveau de l'élève selon les 5 règles de la nouvelle spécification (ELO pondéré difficulté, composite sans reading_time/streak, niveau global pondéré, suppression du seed `learning_styles`, décroissance temporelle).

## Fichiers impactés

- `src/hooks/useAdaptiveContent.ts` — règles 1, 2, 4, et exposition du composite
- `src/components/dashboard/StudentDashboardContent.tsx` — règle 3 (niveau global pondéré + leçon faible/forte + alerte) et règle 5 (decay à l'ouverture de session)
- `src/lib/levelEngine.ts` *(nouveau)* — moteur isolé et testable
- *(option)* `src/components/dashboard/StatCard.tsx` ou nouvelle carte pour afficher `weakest_lesson` / alerte lacune critique / streak séparé

Aucun changement de schéma DB nécessaire (`current_level`, `streak`, `total_answers`, `correct_answers`, `updated_at` suffisent). On peut éventuellement stocker `accepted_answers`/historique des dernières réponses pour le « taux pondéré difficulté », mais on commence par approximer avec `accuracy_rate` + dernier ELO si pas d'historique.

## Détail par règle

### Règle 1 — Ajustement ELO par réponse (remplace lignes 373-382)

```text
expected = 1 / (1 + 10^((difficulty*20 - current_level) / 40))
weight   = {1:0.6, 2:0.8, 3:1.0, 4:1.3, 5:1.6}[difficulty]
delta    = correct ? clamp(round(3*(1-expected)*weight),  +1, +5)
                   : clamp(round(-2*expected*weight),     -5, -1)

// modulateur temps (median par difficulté, défauts 30/45/60/90/120s)
if correct && t < median*0.6 : delta = round(delta*1.2)
if correct && t > median*2.0 : delta = round(delta*0.8)
if !correct && t > 120       : delta = round(delta*1.3)

new_level = clamp(current_level + delta, 5, 100)
```

`recordAnswer` doit recevoir `difficulty` (1-5) — actuellement absent. On le passera depuis les composants quiz/exercice qui appellent déjà la donnée (`QuizItem.difficulty` / `ExerciseItem.difficulty` existent côté contenu IA). Fallback = 3.

### Règle 2 — Composite (remplace `computeCompositeLevel`)

```text
composite = 0.40*taux_pondéré_difficulté
          + 0.35*current_level
          + 0.25*quiz_accuracy
```

- Suppression totale de `reading_time` et du bonus `streak` du composite.
- `taux_pondéré_difficulté` : si on n'a pas l'historique des 30 dernières réponses, on utilise `accuracy_rate` comme fallback (à enrichir plus tard via une table `answer_history` si souhaité).
- `streak` continue d'être stocké et exposé séparément pour l'UI (« indicateur de régularité »).

### Règle 3 — Niveau global dashboard

Dans `StudentDashboardContent.tsx`, remplacer `sumLevel/count` par :

```text
total_answers_all = Σ s.total_answers
poids_l           = s.total_answers / total_answers_all
global_level      = Σ (s.current_level * poids_l)
weakest           = argmin(s.current_level où s.total_answers > 0)
strongest         = argmax(...)
critical_gap      = ∃ leçon avec current_level < 30
```

Ajouter dans l'UI : carte « مستواك العام »  + badge « نقطة ضعف » sur la leçon la plus faible + alerte rouge si `critical_gap`.

### Règle 4 — Niveau initial

Dans `useAdaptiveContent.ts` lignes 188-198 : **supprimer** la lecture de `learning_styles` pour seeder `current_level`. Garder `learning_styles` uniquement pour le format pédagogique (visuel/textuel/pratique). `current_level` reste à 50 par défaut, ou utilise `assessment_data.placement_score` si présent dans `student_scores`.

### Règle 5 — Décroissance temporelle

Au chargement du dashboard (et au mount de `useAdaptiveContent` pour la leçon courante) :

```text
days = floor((now - updated_at) / 86400000)
if days > 7:
  decay = max(0.10, 1 - 0.01*(days-7))   // plancher 0.10 (≈ ×0.90 max d'érosion)
  current_level = max(5, round(current_level * decay))
  → UPDATE student_scores SET current_level=..., updated_at=now()
```

Effet appliqué une seule fois par session (drapeau `decay_applied` en mémoire) pour ne pas re-déclencher au re-render.

## Moteur isolé `src/lib/levelEngine.ts`

Exporte des fonctions pures :

```ts
computeDelta({ isCorrect, timeSec, difficulty, currentLevel }): number
computeComposite({ currentLevel, accuracy, quizAccuracy, weightedAccuracy? }): number
computeGlobal(scores: { current_level, total_answers }[]): {
  global, weakest, strongest, criticalGap
}
applyDecay(currentLevel: number, lastUpdate: Date): { level, applied }
```

Ces fonctions seront appelées depuis `useAdaptiveContent` et `StudentDashboardContent`. Couvrables par tests unitaires (`src/test/`).

## Sortie JSON (Règle Format)

`recordAnswer` retourne maintenant un objet :

```json
{ "new_level", "delta_applied", "composite_level", "streak_display", "decay_applied" }
```

`global_level / weakest_lesson / critical_gap` sont calculés au niveau dashboard.

## Hors-scope (à confirmer)

- Création d'une table `answer_history` pour le vrai « taux pondéré difficulté sur 30 dernières réponses » : non inclus, fallback sur `accuracy_rate`. Dis-moi si tu veux qu'on l'ajoute.
- Test de placement réel (Règle 4) : on ne crée pas le test ici, on se contente de lire `assessment_data.placement_score` si présent.
