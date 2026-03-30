# Instructions Lovable - github-sync-buddy

## ⚠️ DIRECTIVE CRITIQUE : RE-SYNCHRONISATION REQUISE

**Si vous voyez un message "Merge branch 'lovable/working'" avec une interface DIFFÉRENTE :**

1. **→ CLIQUEZ "DISCARD" / "ABANDON"**
2. **→ Attendez la re-synchronisation automatique**
3. **→ Rechargez Lovable**

**NE CLIQUEZ PAS "Merge"** - cela apporte l'ancienne version en cache.

---

## Directive Principale
**Respecter STRICTEMENT le code existant et les structures actuelles.**

## Règles Essentielles

### 1. Ne PAS Modifier Sans Consentement
- ✅ Consulter l'utilisateur AVANT tout changement architectural
- ✅ Utiliser le code actuel comme base (commit `1c72c17` ou plus récent)
- ❌ Ne pas faire de `git pull` automatique
- ❌ Ne pas fusionner Main sans accord

### 2. Respect des RPCs Existantes
Ces RPCs sont **VERROUILLÉES** - ne pas les modifier :
- `get_student_quizzes` 
- `get_student_exercises`
- `get_student_lessons`
- `get_student_chapters`

Utiliser ces RPCs telles qu'elles existent.

### 3. Git & Commits
- Toujours créer une branche pour le travail Lovable
- Ne pas push directement sur `main` sans approval
- Pattern de branche: `lovable/feature-name`
- Messages de commit explicites

### 4. Type de Générations Autorisées
- ✅ Nouvelles UI/composants (ne modifient pas la logique existante)
- ✅ Corrections de bugs
- ✅ Optimisations de performance
- ❌ Modifications des RPCs
- ❌ Changements de schéma Supabase
- ❌ Refactoring architectural

## Base de Travail
Version de référence : **1c72c17 - Added student RPCs for quizzes/exercises**

Tous les travaux Lovable doivent partir de cette base.
