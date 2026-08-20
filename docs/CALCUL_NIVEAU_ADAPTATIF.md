# Calcul du niveau adaptatif de l'élève

Ce document explique comment sont calculés les trois niveaux affichés dans le
tableau de bord élève : le niveau d'une **leçon**, le niveau d'un **chapitre**
et le **niveau global**. Le code source de référence est
[`src/lib/levelEngine.ts`](../src/lib/levelEngine.ts) (fonctions pures,
testables indépendamment de l'UI) et son agrégation dans
[`src/components/dashboard/StudentDashboardContent.tsx`](../src/components/dashboard/StudentDashboardContent.tsx).

Les trois niveaux ne sont **pas** des pourcentages de bonnes réponses. Ce sont
des scores de type ELO (échelle **5 à 100**), qui montent ou descendent
réponse par réponse selon la difficulté de la question, le temps de réponse,
les indices utilisés et le nombre de tentatives — pas un simple ratio
correct/total.

---

## 1. Niveau d'une leçon

C'est la brique de base : chaque ligne `student_scores` (une par élève et par
leçon) porte un `current_level` entre 5 et 100, mis à jour après **chaque**
réponse soumise via `computeDelta()` + `applyDelta()`.

### 1.1 Calcul du delta (`computeDelta`)

Pour chaque réponse, on calcule un delta (positif si correct, négatif sinon)
qui sera ajouté au niveau actuel :

1. **Probabilité de réussite attendue** (courbe ELO) à partir du niveau actuel
   et de la difficulté de la question (1 à 5) :
   ```
   expected = 1 / (1 + 10^((difficulté×20 − niveau_actuel) / 40))
   ```
   Plus le niveau actuel est déjà élevé par rapport à la difficulté, plus la
   réussite est "attendue" et rapporte donc peu de points (et inversement).

2. **Delta de base**, pondéré par la difficulté (poids 0.6 à 1.6, de la
   difficulté 1 à 5) :
   - Correct : `delta = 3 × (1 − expected) × poids`, borné entre **+1** et **+5**.
   - Incorrect : `delta = −2 × expected × poids`, borné entre **−5** et **−1**.

3. **Bonus/malus de rapidité** (comparé à un temps médian par difficulté,
   30s à 120s) :
   - Correct et rapide (< 60% du temps médian) → delta ×1.2
   - Correct mais lent (> 2× le temps médian) → delta ×0.8
   - Incorrect et très lent (> 120s) → delta ×1.3 (pénalité alourdie)

4. **Signaux comportementaux** :
   - Plusieurs tentatives avant de réussir → delta réduit de 15% par tentative
     supplémentaire (`×0.85^(tentatives−1)`)
   - Indice "préventif" (consulté avant de répondre) → gain ×0.70
   - Indice "curatif" (consulté après une erreur) → gain ×0.40, ou pénalité
     ×1.3 en cas d'échec malgré l'indice
   - Réponse abandonnée (solution révélée sans avoir vraiment cherché) →
     pénalité ×1.5

5. Le delta final est re-borné à **[+1, +6]** si correct, **[−7, −1]** si
   incorrect.

### 1.2 Application (`applyDelta`)

```
nouveau_niveau = clamp(niveau_actuel + delta, 5, 100)
```

Le niveau ne peut jamais descendre sous 5 ni dépasser 100.

### 1.3 Décroissance temporelle — "l'oubli" (`applyDecay`)

Si l'élève n'a plus touché une leçon depuis longtemps, son niveau est revu à
la baisse à chaque affichage (pas besoin d'une nouvelle réponse) :

- **≤ 7 jours** sans activité sur la leçon → aucun changement.
- **> 7 jours** → facteur de décroissance = `max(0.10, 1 − 0.01 × (jours − 7))`,
  appliqué au niveau : `nouveau_niveau = max(5, round(niveau × facteur))`.

Exemple : un niveau de 27 non retouché depuis 9 jours → facteur =
`1 − 0.01×(9−7) = 0.98` → `round(27 × 0.98) = 26`.

---

## 2. Niveau d'un chapitre

Le niveau d'un chapitre est la **moyenne des niveaux de ses leçons, pondérée
par le nombre de réponses données à chacune** — pas une moyenne simple.

```
niveau_chapitre = round( Σ(niveau_leçon × réponses_leçon) / Σ(réponses_leçon) )
```

Seules les leçons où l'élève a **au moins une réponse** entrent dans le
calcul (une leçon jamais commencée ne compte pas comme "0" et ne dilue pas la
moyenne).

**Pourquoi pondérer ?** Une leçon travaillée 100 fois donne une mesure bien
plus fiable du niveau réel qu'une leçon travaillée 2 ou 3 fois (qui peut être
faussée par un coup de chance ou de malchance). Pondérer par le volume
d'exercices fait que le niveau du chapitre reflète la performance *prouvée*
de l'élève, plutôt que de laisser une leçon à peine effleurée peser autant
qu'une leçon largement pratiquée.

---

## 3. Niveau global

Même principe que le niveau de chapitre, mais étendu à **toutes les leçons de
tous les chapitres** où l'élève a répondu au moins une fois
(`computeGlobal()`) :

```
niveau_global = round( Σ(niveau_leçon × réponses_leçon) / Σ(réponses_leçon) )
```

sur l'ensemble des leçons actives (`total_answers > 0`), tous chapitres
confondus, avec la décroissance déjà appliquée à chaque niveau de leçon.

---

## 4. Exemple réel — compte `izerroukentrk@gmail.com`

Données réelles de ce compte (Terminale, filière Sciences), au 17/08/2026.

### 4.1 Niveau de leçon

Leçon **"نهاية منتهية أو غير منتهية عند ∞+ أو ∞-"** : `niveau = 27`, avec
104 réponses données (38 correctes, soit 37% de réussite brute) et une
dernière activité la veille (< 7 jours → pas de décroissance). Le niveau
(27) est bien inférieur au taux de réussite brut (37%) car le score intègre
aussi la difficulté des questions, le temps de réponse, les indices
utilisés et les tentatives multiples — ce n'est jamais un simple
correct/total.

### 4.2 Niveau du chapitre "النهايات والاستمرارية"

Trois leçons de ce chapitre ont au moins une réponse :

| Leçon | Niveau (après décroissance) | Réponses |
|---|---:|---:|
| نهاية منتهية أو غير منتهية عند ∞+ أو ∞- | 27 | 104 |
| نهاية منتهية أو غير منتهية عند عدد حقيقي | 10 | 5 |
| نهاية دالة مركبة - النهايات بالمقارنة | 23 | 10 |

(Les autres leçons du chapitre — الاستمرارية, تتمات على النهايات, etc. — ont
0 réponse et ne comptent pas.)

```
niveau_chapitre = round((27×104 + 10×5 + 23×10) / (104+5+10))
                = round(3088 / 119)
                = round(25,95)
                = 26
```

### 4.3 Niveau global

Toutes les leçons actives (tous chapitres confondus) pour ce compte :

| Chapitre | Leçon | Niveau | Réponses |
|---|---|---:|---:|
| النهايات والاستمرارية | نهاية منتهية أو غير منتهية عند ∞+ أو ∞- | 27 | 104 |
| النهايات والاستمرارية | نهاية منتهية أو غير منتهية عند عدد حقيقي | 10 | 5 |
| الاشتقاقية | الاشتقاقية | 12 | 16 |
| التزايد المقارن | قوى عدد حقيقي موجب | 16 | 20 |
| الدوال الأصلية | الدوال الأصلية | 26 | 6 |
| النهايات والاستمرارية | نهاية دالة مركبة - النهايات بالمقارنة | 23 | 10 |

```
niveau_global = round((27×104 + 10×5 + 12×16 + 16×20 + 26×6 + 23×10) / 161)
              = round(3756 / 161)
              = round(23,33)
              = 23
```

### 4.4 Pourquoi le niveau baisse en élargissant le périmètre

Leçon (27) → chapitre (26) → global (23) : chaque élargissement du périmètre
intègre d'autres leçons/chapitres où l'élève est en moyenne plus faible. Ce
n'est pas une incohérence — c'est attendu, puisque la leçon "∞+/∞-" (104
réponses) est de loin la plus travaillée par cet élève, et les autres
chapitres (الاشتقاقية, التزايد المقارن...) tirent la moyenne globale vers le
bas.

---

## 5. Où ces niveaux sont utilisés dans l'UI

- **Niveau de leçon** : liste des leçons du chapitre sélectionné, et pastille
  de notification (leçon à retravailler si niveau < 50).
- **Niveau de chapitre** (`chapter.level`) : badge "المستوى: X/100" du
  chapitre sélectionné, radar "أداؤك الإجمالي" (un point par chapitre), et
  texte de suggestion IA sous le chapitre.
- **Niveau global** (`avgLevel`) : bannière d'accueil du tableau de bord et
  carte KPI "المستوى الحالي".

Les trois niveaux utilisent désormais systématiquement la même donnée déjà
calculée (`chapter.level` pour le chapitre, `avgLevel` pour le global) — il
n'existe plus qu'une seule formule par périmètre, pour éviter que deux
endroits de l'UI affichent des nombres différents pour le même concept.

---

## 6. Sur quelle base les exercices de progression (« تجديد ») sont proposés

Le niveau composite (règle 2) ne sert pas qu'à l'affichage : il pilote
directement la difficulté du contenu que l'IA génère quand l'élève clique
sur **« تجديد »** (renouveler) dans l'onglet « تعمّق » (Approfondir) d'une
leçon. Code source :
[`src/hooks/useAdaptiveContent.ts`](../src/hooks/useAdaptiveContent.ts)
(déclenchement) et
[`supabase/functions/generate-adaptive-content/index.ts`](../supabase/functions/generate-adaptive-content/index.ts)
(génération IA).

### 6.1 Déclenchement — jamais automatique

Le lot de contenu (5 quiz ou 5 exercices) n'est régénéré QUE sur clic
explicite du bouton « تجديد ». Répondre à des questions met à jour le niveau
en continu (règle 1), mais **ne redéclenche jamais** une génération : toutes
les 5 réponses d'une session, l'élève reçoit seulement une notification
("تم تحديث مستواك") l'invitant à cliquer lui-même s'il veut du contenu
recalibré sur son niveau à jour.

### 6.2 Le niveau de départ : le composite de CETTE leçon

Au moment du clic, on recalcule le niveau composite (règle 2, section 1) à
partir du `student_scores` courant de la leçon :

```
composite = 0.40 × accuracy_rate + 0.35 × current_level + 0.25 × accuracy_rate
```

(`accuracy_rate` intervient deux fois, faute d'historique détaillé des 30
dernières réponses pour calculer le "taux pondéré" séparément — voir le
commentaire dans `computeCompositeLevel`.)

### 6.3 Conversion du composite en difficulté cible (1 à 5)

Ce score 0-100 est ensuite converti en une échelle de difficulté 1-5 envoyée
à l'IA (`getDifficultyScale`) :

| Niveau composite | Difficulté cible | Libellé |
|---:|:---:|---|
| < 20 | 1 | débutant (très facile) |
| 20 – 39 | 2 | facile |
| 40 – 59 | 3 | intermédiaire |
| 60 – 79 | 4 | difficile |
| ≥ 80 | 5 | avancé (très difficile) |

### 6.4 Consignes envoyées à l'IA pour calibrer les 5 items

- **Variation autour de la cible** : l'IA ne génère pas 5 questions à la même
  difficulté — la consigne est explicitement "1 facile (warm-up), 2-3 au
  niveau cible, 1 plus difficile (challenge)".
- **Ajustement selon le taux de réussite récent** (`accuracy_rate` de la
  leçon) :
  - < 50 % → applications directes, énoncés courts, valeurs entières.
  - 50-75 % → niveau cible, raisonnement intermédiaire.
  - \> 75 % → raisonnement avancé, valeurs non triviales, plusieurs étapes.
- **Points faibles textuels**, injectés dans le prompt à titre indicatif
  (pas une règle numérique stricte, l'IA en tient compte librement) :
  - `accuracy_rate < 40` → "compréhension générale faible"
  - `40 ≤ accuracy_rate < 60` → "difficultés sur les exercices de raisonnement"
  - `streak == 0` (dernière réponse fausse) → "erreurs consécutives récentes"
- **Anti-répétition** : les 20 derniers énoncés déjà générés pour cette leçon
  sont listés dans le prompt avec la consigne explicite de proposer des
  variantes différentes plutôt que de les répéter.
- **Seed aléatoire** : un nombre tiré au hasard est ajouté au prompt à chaque
  génération pour forcer des valeurs numériques et contextes différents même
  à difficulté égale.
- **Périmètre strict** : l'IA reçoit l'ordre explicite de rester sur le sujet
  exact de la leçon en cours — aucune question hors-sujet.

### 6.5 Après génération

Le nouveau lot de 5 items **remplace** (upsert) le lot précédent du même
type (quiz ou exercice) pour cette leçon — un seul lot "actuel" est conservé
par élève/leçon/type, pas un historique cumulatif de tous les lots générés.

### 6.6 À ne pas confondre avec Découvrir/Comprendre

Les exercices "Découvrir"/"Comprendre" du programme (`chapter_exercises` /
`chapter_quizzes`) sont un contenu FIXE, classé par difficulté 1-2
(Découvrir) / 3-5 (Comprendre), identique pour tous les élèves d'un même
niveau scolaire. Seul l'onglet "تعمّق" (Approfondir) décrit ci-dessus génère
du contenu réellement personnalisé, calibré sur le niveau composite propre à
chaque élève.
