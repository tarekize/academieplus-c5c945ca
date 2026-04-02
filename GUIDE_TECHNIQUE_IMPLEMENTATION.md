# Guide Technique - Adaptation au Niveau Scolaire

## 📐 Architecture de Implémentation

### Diagramme de Flux

```
┌─────────────────────────────────────────────────────────────┐
│                    Utilisateur (Élève)                      │
└─────────────────────────────────────────────────────────────┘
                             ↓
    ┌────────────────────────────────────────────────────┐
    │  1. Complète son Profil (CompleteProfile.tsx)    │
    │     - Sélectionne son niveau scolaire             │
    │     - Sauvegarde dans profiles.school_level       │
    └────────────────────────────────────────────────────┘
                             ↓
    ┌────────────────────────────────────────────────────┐
    │  2. Accède à Évaluation d'Apprentissage           │
    │     LearningAssessment.tsx                        │
    │     - Charge le profil avec useProfile()          │
    │     - Appelle getAssessmentPhasesByLevel()        │
    │     - Affiche questions adaptées au niveau        │
    └────────────────────────────────────────────────────┘
                             ↓
    ┌────────────────────────────────────────────────────┐
    │  3. Sauvegarde le Style d'Apprentissage           │
    │     learning_styles table                         │
    │     - visual_score, textual_score, etc.           │
    │     - preferred_style                             │
    └────────────────────────────────────────────────────┘
                             ↓
    ┌────────────────────────────────────────────────────┐
    │  4. Consulte les Recommandations                  │
    │     ITSRecommendations.tsx                        │
    │     - Charge profil + style d'apprentissage       │
    │     - Appelle getTipsByLevelAndStyle()            │
    │     - Affiche conseils personnalisés              │
    └────────────────────────────────────────────────────┘
                             ↓
    ┌────────────────────────────────────────────────────┐
    │  5. Accède à un Cours                             │
    │     Cours.tsx                                     │
    │     - Passe school_level au ChatBot               │
    │     - ChatBot envoie au backend avec niveau       │
    │     - Réponses adaptées au niveau de l'élève      │
    └────────────────────────────────────────────────────┘
```

## 🔧 Implémentation Détaillée

### 1. Structure de Types TypeScript

#### MainFile: `LearningAssessment.tsx`
```typescript
type SchoolLevel = 
  | "5eme_primaire" 
  | "1ere_cem" 
  | "2eme_cem" 
  | "3eme_cem" 
  | "4eme_cem" 
  | "1ere_tcl"
  | "1ere_tcs"
  | "terminale_lettres"
  | "terminale_sciences"
  | "terminale_mathematiques"
  | "terminale_gestion"
  | null;
```

**Note:** Ce type est cohérent avec les valeurs stockées dans la base de données.

### 2. Fonction de Adaptation - LearningAssessment

```typescript
const getAssessmentPhasesByLevel = (level: SchoolLevel) => {
  // Retourne: { visualPhases: [], textPhase: {} }
  // Structure: 
  // - visualPhases: array de questions visuelles
  // - textPhase: objet avec question textuelle
  
  // Logic:
  // if (level === "5eme_primaire") → questions simples
  // if (["1ere_cem",...].includes(level)) → questions intermédiaires
  // else → questions avancées (lycée)
}
```

**Points Clés:**
- Retourne des objets avec la même structure que les constantes `VISUAL_PHASES` et `TEXT_PHASE`
- Délais d'affichage adaptés (6s → 5s → 4s)
- Questions progressivement plus complexes

### 3. Fonction de Adaptation - ITSRecommendations

```typescript
const getTipsByLevelAndStyle = (level: SchoolLevel, style: string): string[] => {
  // Retourne: array de conseils textuels
  
  // Logic basée sur niveau ET style:
  if (level === "5eme_primaire") {
    if (style === "visual") → conseils visuels simples
    else if (style === "textual") → conseils de lecture simples
    else → conseils pratiques ludiques
  }
  
  if (["1ere_cem",...].includes(level)) {
    if (style === "visual") → conseils visuels progressifs
    else if (style === "textual") → conseils de lecture structurés
    else → conseils pratiques variés
  }
  
  // Lycée par défaut
  if (style === "visual") → conseils visuels avancés
  // ...etc
}
```

**Points Clés:**
- Combinaison niveau × style = conseils spécifiques
- Vocabulaire adapté à chaque niveau
- Méthodes d'apprentissage appropriées

### 4. Intégration dans LearningAssessment

```typescript
const { profile, loading: profileLoading } = useProfile();

useEffect(() => {
  if (profileLoading || !profile) return;
  
  const adaptation = getAssessmentPhasesByLevel(profile.school_level as SchoolLevel);
  setVisualPhases(adaptation.visualPhases);
  setTextPhase(adaptation.textPhase);
}, [profile, profileLoading]);
```

**Points Clés:**
- Attendre le chargement du profil
- Mettre à jour les phases au montage
- Garder les constantes comme défaut

### 5. Intégration dans ITSRecommendations

```typescript
const { profile } = useProfile();

const tips = getTipsByLevelAndStyle(
  profile.school_level as SchoolLevel,
  learningStyle.preferred_style
);
```

**Points Clés:**
- Récupération immédiate (pas de loading check nécessaire)
- Utilisation dans la render

### 6. Intégration du ChatBot

```typescript
// ChatBot.tsx
type ChatBotProps = {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  subject?: string;
  schoolLevel?: string | null; // ← NEW
};

export default function ChatBot({ 
  messages, 
  setMessages, 
  subject = "mathématiques", 
  schoolLevel = null // ← NEW
}: ChatBotProps) {
  // ...
  
  const response = await fetch("...lovable-chat", {
    method: "POST",
    body: JSON.stringify({
      messages: updatedMessages,
      subject: subject,
      schoolLevel: schoolLevel, // ← NEW
    }),
  });
}
```

**Points Clés:**
- Prop optionnelle pour la rétrocompatibilité
- Transmission au backend via JSON
- Valeur null acceptable

### 7. Passage du Niveau dans Cours.tsx

```typescript
// Cours.tsx
<ChatBot
  messages={chatMessages}
  setMessages={setChatMessages}
  schoolLevel={profile?.school_level} // ← NEW
/>
```

**Points Clés:**
- Utilisation de l'optional chaining (`?.`)
- Récupère depuis le profil déjà chargé
- Null-safe

## 📊 Base de Données

### Table: `profiles`
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  school_level TEXT,  -- "5eme_primaire", "1ere_cem", etc.
  -- ... autres champs
);
```

### Table: `learning_styles`
```sql
CREATE TABLE learning_styles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  visual_score INTEGER,
  textual_score INTEGER,
  practical_score INTEGER,
  preferred_style TEXT,  -- "visual", "textual", "practical"
  assessment_data JSONB,
  -- ... timestamps
);
```

**Note:** Les deux tables travaillent ensemble pour adapter le système.

## 🔌 Fonction Cloud - Backend

### Endpoint: `/lovable-chat`

**Payload Reçu:**
```json
{
  "messages": [
    {"role": "user", "content": "Qu'est-ce qu'un nombre premier?"},
    {"role": "assistant", "content": "..."}
  ],
  "subject": "mathématiques",
  "schoolLevel": "2eme_cem"
}
```

**Recommandations d'Implémentation Backend:**
```typescript
const schoolLevel = req.body.schoolLevel; // "2eme_cem"

// Adapter le prompt système selon le niveau
const systemPrompt = getSystemPromptByLevel(schoolLevel);

// Exemples adaptés
const examples = getExamplesByLevel(schoolLevel);

// Complexité du langage
const languageComplexity = getLanguageComplexity(schoolLevel);
// "primaire" → vocabulaire simple
// "college" → vocabulaire standard
// "lycee" → vocabulaire académique
```

## 🧪 Exemples de Tests Unitaires

### Test 1: LearningAssessment Primaire
```typescript
test('Primary level gets simpler questions', () => {
  const result = getAssessmentPhasesByLevel("5eme_primaire");
  
  expect(result.visualPhases[0].question).toContain("triangle");
  expect(result.visualPhases[0].displayTime).toBe(6); // Plus de temps
  expect(result.textPhase.paragraph).toContain("nombres pairs");
});
```

### Test 2: ITSRecommendations Lycée
```typescript
test('High school visual learner gets advanced tips', () => {
  const tips = getTipsByLevelAndStyle("terminale_sciences", "visual");
  
  expect(tips[0]).toContain("Geogebra");
  expect(tips[0]).toContain("avancé");
  expect(tips.length).toBe(4); // 4 conseils pour lycée
});
```

### Test 3: ChatBot envoie le niveau
```typescript
test('ChatBot sends schoolLevel to backend', async () => {
  const mockFetch = jest.fn();
  global.fetch = mockFetch;
  
  const { container } = render(
    <ChatBot schoolLevel="1ere_cem" {...otherProps} />
  );
  
  // Envoyer un message
  // ...
  
  expect(mockFetch).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      body: expect.stringContaining('"schoolLevel":"1ere_cem"')
    })
  );
});
```

## 🚫 Erreurs Communes et Solutions

### Erreur 1: "Cannot read property 'school_level' of undefined"
**Cause:** Profile non encore chargé
**Solution:** 
```typescript
if (!profile) return null; // ou retourner un Default
```

### Erreur 2: "Type 'null' is not assignable to type 'SchoolLevel'"
**Cause:** school_level peut être null
**Solution:**
```typescript
getTipsByLevelAndStyle(profile.school_level as SchoolLevel, ...)
// Utiliser type assertion ou vérifier null avant
```

### Erreur 3: ChatBot ne passe pas schoolLevel
**Cause:** Oubli de passer la prop ou fonction cloud ignorée
**Solution:**
```typescript
// Dans Cours.tsx
<ChatBot schoolLevel={profile?.school_level} />

// Dans CharBot.tsx
body: JSON.stringify({ ..., schoolLevel })
```

## 📈 Performance

### Optimisations Appliquées
- ✅ Les phases sont chargées une fois au montage
- ✅ Les conseils sont calculés en mémoire (pas de requête BD)
- ✅ useProfile() utilise du caching interne
- ✅ Pas de re-rendus inutiles grâce aux useState et useEffect

### Complexité Temporelle
- `getAssessmentPhasesByLevel()`: O(1) - Switch sur 3-4 conditions
- `getTipsByLevelAndStyle()`: O(1) - Lookup d'array simple
- Rendu: O(n) où n = nombre de conseils (~4-6)

## 🔐 Sécurité

### Validations

✅ **Front-end:**
- SchoolLevel TypeScript type pour validation à la compilation
- Vérification du profil avant utilisation

✅ **Back-end (recommandé):**
- Valider que schoolLevel est dans la liste autorisée
- Vérifier les permissions utilisateur
- Sanitizer les inputs

## 📚 Documentations Externes

### Types Supabase
- [Profiles table definition](../supabase/types.ts)
- [Learning Styles table definition](../supabase/types.ts)

### Composants Liés
- [useProfile hook](../hooks/useProfile.ts)
- [useAuth context](../contexts/AuthContext.tsx)

## 🔄 Cycle de Mise à Jour Future

Si vous voulez ajouter plus de niveaux:

1. Ajouter le type dans `LearningAssessment.tsx`
2. Ajouter un cas dans `getAssessmentPhasesByLevel()`
3. Ajouter un cas dans `getTipsByLevelAndStyle()`
4. Mettre à jour la BD pour le permettre
5. Tester avec les nouveaux niveaux

---

**Document Technique Complet ✅**
