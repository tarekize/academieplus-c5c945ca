# Fonctionnalités Enseignant — Plan de mise en œuvre

Le périmètre est important. Je propose de le livrer en **4 phases** pour garder un produit fonctionnel à chaque étape. Chaque phase est indépendante et testable.

---

## Phase 1 — Onboarding Établissement + Tableau de bord à 4 icônes

**Objectif :** l'enseignant crée son établissement avant les classes, puis arrive sur un accueil à 4 boutons.

- Nouvelle table `establishments` (nom, type, ville) rattachée à l'enseignant ; nouvelle colonne `establishment_id` sur `classes`.
- À la connexion enseignant : si aucun établissement → écran de création d'établissement, puis redirection vers la gestion des classes (page existante, désormais rattachée à l'établissement).
- Nouvelle page d'accueil `/teacher-dashboard` avec 4 cartes-icônes :
  - 🏫 **Établissement** → gestion établissement + classes (vue actuelle)
  - 📝 **Exercices** → espace création exercices
  - 🎯 **Quiz** → espace création quiz
  - 📋 **Examens** → espace création examens

## Phase 2 — Création de contenu : mode Manuel + chatbot IA guidé

**Objectif :** pour Exercices / Quiz / Examens, deux modes de création.

- **Stockage** : nouvelles tables `teacher_content` (le contenu généré/saisi) et `teacher_content_assignments` (envoi vers classes ou élèves).
- **Mode Manuel** : formulaire dédié (énoncé, réponse, indices, difficulté, niveau, leçon).
- **Mode IA — chatbot à flux contrôlé** (les 7 étapes du cahier des charges) :
  1. Accueil « Salut ! » + demande du niveau.
  2. Niveau : uniquement les niveaux des classes réellement enseignées.
  3. Cours : chapitres (avec animation) puis leçons du chapitre choisi.
  4. Nombre de contenus : sélecteur 1 → 10.
  5. Difficulté : min et max.
  6. Génération : contenus détaillés avec indices, **sans** réponses/corrections affichées.
  7. Bouton **Envoyer** par contenu → liste des classes du niveau choisi → confirmation d'envoi.
- Logique identique pour Quiz. Examens : même cadre (génération d'un ensemble).
- Edge function dédiée `generate-teacher-content` (réutilise la logique IA existante, Gemini + repli Llama).

## Phase 3 — Affichage côté élève

**Objectif :** déplacer les annonces et afficher le contenu reçu.

- Les annonces enseignant **n'apparaissent plus** dans le dashboard élève : retrait du bandeau dans `StudentDashboardContent`.
- Elles s'affichent sur la **page principale de l'élève / liste des cours** (`ListeCours`).
- Le contenu (exercices/quiz) envoyé à l'élève ou sa classe apparaît dans une section « Contenu de mon enseignant ».

## Phase 4 — Aide classe & élève (assistants IA ciblés)

**Objectif :** boutons d'aide dans la vue classe et la vue élève.

- **Vue classe** : bouton « Aider les élèves » → Exercices (manuel), Quiz (manuel), Examens (manuel), **Chatbot IA classe**.
  - Le chatbot IA classe lit les performances **globales** de la classe et ne signale une lacune que si elle touche la **majorité** des élèves. Sur « Oui » : génère 5 exercices + 5 quiz, validés individuellement, envoyés à toute la classe.
- **Vue élève** : bouton « Aider l'élève » → Exercices (manuel), Quiz (manuel), **Chatbot IA élève**.
  - Le chatbot IA élève lit le profil individuel, identifie les lacunes et propose des contenus adaptés, validés puis envoyés à l'élève.

---

## Détails techniques

### Nouvelles tables (migrations Supabase)
```text
establishments
  id, teacher_id (auth.users), name, type, ville?, created_at, updated_at
  RLS: l'enseignant gère ses propres établissements (service_role full)

classes  (modif)
  + establishment_id uuid null -> establishments(id)

teacher_content
  id, teacher_id, content_type ('exercise'|'quiz'|'exam'),
  chapter_id?, lesson_id?, school_level, filiere?,
  payload jsonb (statement/question/options/expected_answer/hint/solution...),
  difficulty int, source ('manual'|'ai'), created_at, updated_at
  RLS: enseignant gère son contenu ; élève/classe lisent via assignations

teacher_content_assignments
  id, content_id -> teacher_content(id), class_id? -> classes,
  student_id?, assigned_by, created_at
  RLS: enseignant gère ses assignations ;
       élève voit les assignations le visant ou visant ses classes
```
Chaque `CREATE TABLE public.*` est suivi des `GRANT` (authenticated + service_role) puis `ENABLE RLS` + policies, conformément aux règles du projet. Helpers existants `is_teacher_of` / `is_parent_of` réutilisés.

### Edge functions
- `generate-teacher-content` : génération calibrée (niveau, leçon, nombre, difficulté min/max). Sortie sans corrections pour l'aperçu, corrections stockées séparément à l'envoi.
- `class-performance-summary` : agrège les performances de la classe pour le chatbot classe (lacunes majoritaires).
- Réutilisation des données `student_scores`, `chapters`, `lessons`.

### Frontend (principaux fichiers)
- `EstablishmentOnboarding.tsx`, refonte de `TeacherDashboard.tsx` (accueil 4 icônes).
- `pages/teacher/CreateExercises.tsx`, `CreateQuiz.tsx`, `CreateExams.tsx` (onglets Manuel / IA).
- `components/teacher/GuidedContentChatbot.tsx` (machine à états des 7 étapes).
- `components/teacher/ClassHelpChatbot.tsx`, `StudentHelpChatbot.tsx`.
- `ListeCours.tsx` : intégration des annonces + contenu reçu ; retrait du bandeau dans le dashboard élève.

---

## Question de cadrage
Je peux commencer immédiatement par la **Phase 1** (onboarding + accueil 4 icônes) qui débloque tout le reste. Souhaitez-vous que j'enchaîne directement les phases 1→4, ou que je m'arrête après chaque phase pour validation ?
