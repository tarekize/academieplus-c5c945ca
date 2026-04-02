# 📚 Guide d'Intégration - Affichage Adaptatif des Leçons

## 🎯 Vue d'ensemble

Ce système adapte le contenu des leçons selon le **style d'apprentissage** détecté de l'étudiant :

- **👀 VISUEL** : Priorité aux vidéos (cours + micro-vidéos)
- **📖 TEXTUEL** : Priorité au texte (vidéos secondaires)
- **💪 PRATIQUE** : Priorité aux exercices (théorie repliée)

---

## 📦 Composants créés

### 1. `AdaptiveLesson.tsx` (Composant principal)
Affiche le contenu adapté selon le style d'apprentissage.

**Utilisation :**
```tsx
import { AdaptiveLesson } from "@/components/course/AdaptiveLesson";

<AdaptiveLesson
  lessonTitle="Équations du 2e degré"
  lessonContent="<h2>Contenu HTML</h2><p>...</p>"
  videos={videos} // Array de Video
  learningStyle="visual"
  onStyleChange={(style) => console.log(style)}
/>
```

### 2. `AdaptiveLessonContainer.tsx` (Conteneur complet)
Gère le chargement du style d'apprentissage et des vidéos automatiquement.

**Utilisation :**
```tsx
import { AdaptiveLessonContainer } from "@/components/course/AdaptiveLessonContainer";

<AdaptiveLessonContainer
  lessonId="lesson-123"
  lessonTitle="Équations du 2e degré"
  lessonContent={contentHTML}
  userId={currentUserId}
/>
```

### 3. `VideoManager.tsx` (Gestion des vidéos - Admin/Pédagogue)
Interface pour ajouter/supprimer/modifier les vidéos.

**Utilisation :**
```tsx
import { VideoManager } from "@/components/course/VideoManager";

<VideoManager
  lessonId="lesson-123"
  videos={videos}
  onVideosChange={(newVideos) => setVideos(newVideos)}
  isEditable={isAdmin || isPedago}
/>
```

---

## 🔧 Services créés

### `learningStyleService.ts`
Récupère le style d'apprentissage de l'utilisateur depuis `learning_styles` table.

```typescript
// Récupérer le style d'un utilisateur
const style = await learningStyleService.getUserLearningStyle(userId);
// Résultat: "visual" | "textual" | "practical"
```

### `videoService.ts`
Gère toutes les opérations sur les vidéos (CRUD).

```typescript
// Récupérer les vidéos d'une leçon
const videos = await videoService.getVideosByLesson(lessonId);

// Ajouter une vidéo
await videoService.addVideo(
  lessonId,
  "Intro aux équations",
  "https://youtube.com/watch?v=...",
  "10:30",
  "main", // ou "reel"
  "مقدمة المعادلات"
);
```

---

## 💾 Base de données

### Nouvelle table: `lesson_videos`

```sql
CREATE TABLE lesson_videos (
  id uuid PRIMARY KEY,
  lesson_id uuid REFERENCES lessons(id),
  title text NOT NULL,
  title_ar text,
  youtube_url text NOT NULL,
  duration text, -- Format: "10:30"
  type text CHECK (type IN ('main', 'reel')), 
  order_index integer,
  created_at timestamp,
  updated_at timestamp
);
```

**Types de vidéo :**
- `main` : Vidéo de cours complète (longue)
- `reel` : Micro-vidéo/explication courte

---

## 🚀 Comment intégrer dans `Cours.tsx`

### Étape 1 : Remplacer le composant CourseContent

**Avant :**
```tsx
<CourseContent
  content={activeChapter.content}
  materials={materials}
  completed={completed}
/>
```

**Après :**
```tsx
<AdaptiveLessonContainer
  lessonId={activeLesson.id}
  lessonTitle={activeLesson.title}
  lessonContent={activeChapter.content}
  userId={userId}
/>
```

### Étape 2 : Ajouter le gestionnaire de vidéos (optionnel - Admin only)

```tsx
{canManage && (
  <VideoManager
    lessonId={activeLesson.id}
    videos={videos}
    onVideosChange={setVideos}
    isEditable={true}
  />
)}
```

---

## 📊 Flux de données

```
┌─────────────────────────────────────────┐
│  Utilisateur accède à une leçon        │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  AdaptiveLessonContainer charge:        │
│  1. Style d'apprentissage (DB)          │
│  2. Vidéos de la leçon (DB)            │
└────────┬────────────────────────────────┘
         │
         ▼
    Selon le style détecté:
    
    👀 VISUEL              📖 TEXTUEL           💪 PRATIQUE
    ┌─────────┐           ┌─────────┐         ┌─────────┐
    │ Vidéo   │           │ Texte   │         │ Exo/Quiz│
    │ principale
           │           │ (principal)
         │         │ (principal)
     │
    │ Reels   │   ▶──    │ Bouton  │    ▶──   │ Théorie │
    │ (opt)   │           │ vidéo   │         │ caché   │
    │         │           │ (caché) │         │         │
    └─────────┘           └─────────┘         └─────────┘
```

---

## 🎨 Interface utilisateur

### Vue Visuelle
```
┌─ Vidéo de cours (16:9 aspect) ──┐
│                                 │
│   [PLAYER - YouTube embed]      │
│                                 │
└─────────────────────────────────┘

┌─ Vidéos complémentaires ─────────┐
│ [Video 1] [Video 2]             │
│ [Video 3] [Video 4]             │
└─────────────────────────────────┘

[📝 Voir le contenu en texte]
```

### Vue Textuelle
```
┌─ Contenu écrit ──────────────────┐
│                                 │
│  Texte formaté                  │
│  - Titres                       │
│  - Paragraphes                  │
│  - Listes                       │
│                                 │
└─────────────────────────────────┘

[▶ Voir les vidéos]
```

### Vue Pratique
```
┌─ Mode Pratique ──────────────────┐
│                                 │
│  [📖 Afficher la théorie]       │
│                                 │
│  ▶ Exercices/Quiz (à venir)    │
│                                 │
└─────────────────────────────────┘
```

---

## ⚙️ Configuration des vidéos

### Pour chaque leçon, ajouter :

1. **Une vidéo MAIN** (cours complet)
   - Durée : ~15-20 minutes
   - URL YouTube complète
   - Titre clair

2. **2-4 vidéos REEL** (micro-explications)
   - Durée : ~2-5 minutes chacune
   - Concepts spécifiques
   - Points clés seulement

**Exemple pour "Équations 2e degré" :**

| Titre | Type | Durée | URL |
|-------|------|-------|-----|
| Équations du 2e degré - Cours complet | main | 18:30 | https://youtube.com/watch?v=abc... |
| Discriminant - Expliqué | reel | 3:45 | https://youtube.com/watch?v=def... |
| Résoudre avec factorisation | reel | 4:10 | https://youtube.com/watch?v=ghi... |
| Solutions imagines | reel | 2:50 | https://youtube.com/watch?v=jkl... |

---

## 🐛 Dépannage

### Les vidéos ne s'affichent pas
✓ Vérifier que `lesson_id` est correct
✓ Vérifier que les URLs YouTube sont valides
✓ Consulter la console pour les erreurs

### Style d'apprentissage non détecté
✓ L'utilisateur a-t-il complété l'évaluation ?
✓ Vérifier la table `learning_styles`

### Migration SQL non appliquée
```bash
# Dans Supabase Studio → SQL Editor
# Copier/coller le contenu de la migration
```

---

## ✅ Checklist d'intégration

- [ ] Migration SQL appliquée (`lesson_videos` table créée)
- [ ] Services créés : `learningStyleService.ts`, `videoService.ts`
- [ ] Composants créés : `AdaptiveLesson.tsx`, `AdaptiveLessonContainer.tsx`, `VideoManager.tsx`
- [ ] Intégration dans `Cours.tsx`
- [ ] Tester avec différents styles d'apprentissage
- [ ] Ajouter des vidéos pour une leçon de test
- [ ] Vérifier l'affichage adaptatif

---

## 📞 Besoin d'aide ?

Consultez les logs de la console pour les erreurs spécifiques.

Bonne implémentation ! 🎉
