## Objectif

Corriger 3 points: (1) niveau initial = score du test de positionnement (plus de 50 par défaut), (2) nouvelle gestion des erreurs (pas de réponse révélée, rouge 3 s + nouvelle tentative, solution uniquement à la demande, bouton de validation pour les quiz), (3) enrichir le calcul du niveau avec des signaux comportementaux (indice préventif/curatif, hésitation/abandon). Choix confirmés: appliquer partout (adaptatif + chapitre), le chapitre alimente aussi le niveau, pénalités par défaut.

Aucune migration DB nécessaire: les drapeaux d'hésitation seront stockés dans `student_scores.assessment_data` (jsonb existant).

---

## 1. Niveau initial = score du test diagnostic

Le test (`LearningAssessment.tsx`) enregistre déjà `current_level = placementScore` dans une ligne globale (`lesson_id = null, chapter_id = null`). Il manque juste l'amorçage des leçons à partir de cette valeur.

- **`src/lib/levelEngine.ts`** — ajouter une note; pas de logique.
- **Nouveau `src/lib/initialLevel.ts`** — `getPlacementLevel(userId): Promise<number>` lit la ligne placement (`lesson_id is null`) et renvoie son `current_level`, sinon `50`.
- **`src/hooks/useAdaptiveContent.ts`** — dans `loadExisting`, quand aucune ligne de score n'existe pour la leçon, initialiser `score.current_level` via `getPlacementLevel` (au lieu de 50). Idem comme valeur de départ lors du premier `insert` dans `recordAnswer`.
- **`src/lib/chatEvalTracker.ts`** — remplacer le défaut `?? 50` par `getPlacementLevel(userId)` pour une nouvelle ligne chapitre.

---

## 2. Gestion des erreurs & interactions

### A. Exercices (entraînement) — `AdaptiveActivities.tsx` + `ChapterMathExercises.tsx`

Nouveau comportement par exercice:
- Soumission fausse → état **verrouillé rouge pendant 3 s** (input désactivé, bordure/encadré rouge), **sans afficher la bonne réponse**.
- Après 3 s → input réactivé, l'élève peut **retenter** (compteur de tentatives incrémenté).
- La bonne réponse / résolution n'apparaît **que** via le bouton existant **« عرض الحل المفصل »** (déjà présent). Retirer l'affichage direct de `expected_answer` sur erreur (lignes ~379 de `AdaptiveActivities` et ~222 de `ChapterMathExercises`).
- Soumission correcte → état vert, exercice résolu.
- Cliquer « عرض الحل المفصل » avant d'avoir réussi = abandon (compté comme échec pour le niveau, voir §3).

State ajouté: `attempts[id]`, `lockedUntil[id]` (timestamp), `solved[id]`. Un `setTimeout`/`useEffect` lève le verrou après 3 s.

### B. Quiz (évaluation) — `AdaptiveActivities.tsx` (le chapitre a déjà un bouton)

- Remplacer l'auto-soumission au clic (`handleQuizAnswer`) par: sélection d'une option (surbrillance) **puis bouton « تأكيد »** qui valide définitivement. Une seule validation par question; après validation, affichage du résultat + explication (comportement quiz = une tentative).
- `ChapterMathQuiz.tsx` conserve son bouton « تأكيد »; on retire seulement la révélation directe si l'on veut homogénéiser — ici le quiz reste une évaluation à tentative unique, donc l'affichage post-validation est conservé.

---

## 3. Calcul du niveau enrichi (signaux comportementaux)

### 3.1 Moteur — `src/lib/levelEngine.ts`

Étendre `DeltaInput` et `computeDelta`:
```text
hintUsage?: "none" | "preventive" | "curative"   // indice avant / après 1ère réponse
attemptCount?: number                            // nb de soumissions (1 = juste du 1er coup)
abandoned?: boolean                              // a révélé la solution / quitté sans réussir
```
Application (après le calcul ELO actuel):
- Si correct:
  - `attemptCount > 1` → gain × 0.85^(attempts-1) (plancher +1)
  - indice **préventif** → gain × 0.70 (réduction ~30 %)
  - indice **curatif** → gain × 0.40 (réduction ~60 %)
- Si abandon/échec:
  - indice curatif → perte × 1.3
- Re-clamp final (+1..+6 / -7..-1) inchangé.

Nouvelle fonction pure `hesitationAdjustment(kind)` :
- `"timeout"` (>1 min inactif puis sortie sans réponse) → `-1` (et −2 si difficulté ≥ 4).
- `"erase"` (saisie puis effacement total puis sortie) → `0` (profil seulement, pas d'impact niveau).

### 3.2 Enregistrement partagé — nouveau `src/lib/recordActivityAnswer.ts`

Fonction unique réutilisée par le chapitre (et alignée avec le hook adaptatif):
```text
recordActivityAnswer({ userId, chapterId, lessonId|null, isCorrect, timeSec,
  difficulty, hintUsage, attemptCount, abandoned })
```
- Charge/insère la ligne `student_scores` (niveau-leçon si `lessonId`, sinon niveau-chapitre `lesson_id null`).
- Niveau initial via `getPlacementLevel`.
- Applique `computeDelta` (avec signaux) → met à jour `current_level`, `total_answers`, `correct_answers`, `accuracy_rate`, `streak`.
- Drapeaux d'hésitation/abandon: incrémentés dans `assessment_data` (`{ hesitation_timeout, hesitation_erase, abandons }`).

### 3.3 Hook adaptatif — `src/hooks/useAdaptiveContent.ts`

- `recordAnswer(... , extra?: { hintUsage, attemptCount, abandoned })` → transmis à `computeDelta`.
- Ajouter `recordHesitation(kind)` qui applique `hesitationAdjustment` et persiste les drapeaux.

### 3.4 Détection hésitation/abandon — `AdaptiveActivities.tsx` + `ChapterMathExercises.tsx`

Par exercice ouvert, suivre: `openedAt`, `hasTyped`, `valueNonEmptyThenEmptied`, `submitted/solved`.
- **Timeout**: si exercice actif > 60 s sans aucune soumission, à la sortie (changement d'onglet/exercice/unmount) → `recordHesitation("timeout")`.
- **Effacement**: si l'élève a tapé puis vidé le champ et quitte sans soumettre → `recordHesitation("erase")`.
- Déclenché dans le cleanup d'un `useEffect` lié à l'exercice courant + au `beforeunload`.

### 3.5 Indices (bouton « مساعدة » / « تلميحات »)

- À l'ouverture d'un indice, mémoriser `hintUsage`: `"preventive"` si aucune soumission encore faite, `"curative"` si au moins une mauvaise réponse déjà soumise. Passé à `recordAnswer`/`recordActivityAnswer` au moment où l'exercice/quiz est résolu ou abandonné.

### 3.6 Chapitre alimente le niveau

- `ChapterMathExercises.tsx` / `ChapterMathQuiz.tsx` récupèrent l'`userId` via `supabase.auth.getUser()` et appellent `recordActivityAnswer` (niveau-leçon via `ex.lesson_id`, sinon niveau-chapitre) à la résolution/abandon, avec les signaux comportementaux. (Ils ne modifiaient pas le niveau auparavant.)

---

## Détails techniques

- Pénalités/centralisées dans `levelEngine.ts` (testable). Tests unitaires possibles dans `src/test/`.
- Verrou 3 s = `lockedUntil` + `setTimeout` nettoyé au démontage; pas de blocage si l'élève change d'exercice.
- Stockage hésitation: `assessment_data` jsonb (aucune migration).
- Compat: lignes existantes (niveau 50) inchangées; le nouvel amorçage ne concerne que les leçons sans score.

## Fichiers impactés
- `src/lib/levelEngine.ts` (signaux + hesitationAdjustment)
- `src/lib/initialLevel.ts` (nouveau)
- `src/lib/recordActivityAnswer.ts` (nouveau)
- `src/hooks/useAdaptiveContent.ts` (seed placement + signaux + recordHesitation)
- `src/lib/chatEvalTracker.ts` (seed placement)
- `src/components/course/AdaptiveActivities.tsx` (UX erreur, validate quiz, hints, hésitation)
- `src/components/course/ChapterMathExercises.tsx` (UX erreur, hints, hésitation, alimente niveau)
- `src/components/course/ChapterMathQuiz.tsx` (alimente niveau, hints)
- `src/test/` (tests du moteur, optionnel)
