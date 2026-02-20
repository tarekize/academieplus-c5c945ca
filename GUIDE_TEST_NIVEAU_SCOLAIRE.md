# Guide de Test - Adaptation au Niveau Scolaire

## 🎯 Objectif
Vérifier que le système adapte correctement le contenu éducatif en fonction du niveau scolaire de l'élève (primaire, collège, lycée).

## 📋 Niveaux Testables

| Niveau | Code BD | Description |
|--------|---------|-------------|
| **Primaire** | `5eme_primaire` | Concepts simples et ludiques |
| **Collège 1ère** | `1ere_cem` | Approche progressive |
| **Collège 2ème** | `2eme_cem` | Approche progressive |
| **Collège 3ème** | `3eme_cem` | Approche progressive |
| **Collège 4ème** | `4eme_cem` | Approche progressive |
| **Lycée 1ère TCL** | `1ere_tcl` | Concepts avancés |
| **Lycée 1ère TCS** | `1ere_tcs` | Concepts avancés |
| **Lycée Terminale** | `terminale_lettres`, `terminale_sciences`, etc. | Concepts rigoureux |

## 🧪 Étapes de Test

### 1️⃣ Test de Profil et Niveau Scolaire

**Étape:** Créer des comptes utilisateurs avec différents niveaux scolaires
- Créer un utilisateur avec niveau `5eme_primaire`
- Créer un utilisateur avec niveau `2eme_cem`
- Créer un utilisateur avec niveau `terminale_sciences`

**Vérifier:**
- ✅ Le profil sauvegarde correctement le `school_level`
- ✅ Le profil peut être consulté via les hooks

### 2️⃣ Test de l'Évaluation d'Apprentissage (LearningAssessment)

**Pour chaque niveau testable:**

#### Primaire (5eme_primaire)
**Vérifier les questions:**
- Question 1: "Quel type de triangle as-tu vu ?" ✅
- Délai d'affichage: 6 secondes ✅
- Vocabulaire simple et accessible ✅
- Contenu: Nombres pairs/impairs (non premiers) ✅

#### Collège (1ere_cem, 2eme_cem, etc.)
**Vérifier les questions:**
- Question 1: "Quel était le plus grand angle du triangle affiché ?" ✅
- Délai d'affichage: 5 secondes ✅
- Concepts intermédiaires ✅
- Contenu: Nombres premiers (concept intermédiaire) ✅

#### Lycée (1ere_tcl, 1ere_tcs, terminale_*)
**Vérifier les questions:**
- Question 1: "Parmi les angles observés, lequel respecte la propriété : somme = 180° ?" ✅
- Délai d'affichage: 4 secondes ✅
- Concepts avancés et théoriques ✅
- Contenu: Théorème fondamental de l'arithmétique ✅

### 3️⃣ Test des Conseils Personnalisés (ITSRecommendations)

**Pour chaque combinaison niveau + style d'apprentissage:**

#### ✨ Primaire + Styles
- **Visuel:**
  - "Regarde les vidéos colorées et amusantes 🎨" ✅
  - "Utilise des dessins pour représenter les problèmes" ✅
  
- **Textuel:**
  - "Lis les explications à voix haute" ✅
  - "Écris les règles dans tes propres mots" ✅
  
- **Pratique:**
  - "Fais beaucoup d'exercices simples et progressifs" ✅
  - "Utilise des jeux pour apprendre" ✅

#### ✨ Collège + Styles
- **Visuel:**
  - "Commence par les vidéos explicatives" ✅
  - "Fais des cartes mentales visuelles" ✅
  
- **Textuel:**
  - "Lis attentivement le cours avant les exercices" ✅
  - "Rédige des résumés de chaque chapitre" ✅
  
- **Pratique:**
  - "Fais les quiz pour tester ta compréhension" ✅
  - "Résous beaucoup d'exercices variés" ✅

#### ✨ Lycée + Styles
- **Visuel:**
  - "Utilise des visualisations mathématiques avancées" ✅
  - "Utilise des logiciels de visualisation (Geogebra, etc.)" ✅
  
- **Textuel:**
  - "Étudie les démonstrations de manière approfondie" ✅
  - "Écris des preuves et justifie chaque étape" ✅
  
- **Pratique:**
  - "Résous des exercices complexes et progressifs" ✅
  - "Entraîne-toi à expliquer ta méthode résolutoire" ✅

### 4️⃣ Test du ChatBot Adaptatif

**Vérifier que le niveau scolaire est transmis:**

1. Ouvrir la page `Cours.tsx`
2. Ouvrir le ChatBot
3. Inspecter l'appel API (DevTools > Network > lovable-chat)
4. **Vérifier le payload contient:**
   ```json
   {
     "messages": [...],
     "subject": "mathématiques",
     "schoolLevel": "2eme_cem"
   }
   ```

**Attendu:** ✅ Le `schoolLevel` est présent dans la requête

### 5️⃣ Test de Flux Complet

**Scénario de test utilisateur:**

1. ✅ Créer compte utilisateur
2. ✅ Compléter profil (sélectionner niveau = collège)
3. ✅ Faire évaluation d'apprentissage
   - Questions appropriées au collège affichées
4. ✅ Consulter recommandations ITSRecommendations
   - Conseils spécifiques au collège affichés
5. ✅ Accéder aux cours
   - ChatBot reçoit le niveau
   - Réponses du ChatBot adaptées au niveau

## 🐛 Checklist de Validation

- [ ] Tous les niveaux scolaires sont correctement stockés
- [ ] LearningAssessment affiche les bonnes questions selon le niveau
- [ ] ITSRecommendations affiche les conseils appropriés
- [ ] Délais d'affichage varient selon le niveau
- [ ] ChatBot envoie le schoolLevel au backend
- [ ] Pas d'erreurs dans la console (DevTools)
- [ ] L'application compile sans erreurs TypeScript
- [ ] Les transitions entre pages sont fluides
- [ ] Les données de profil sont persistantes

## 📊 Données de Test Recommandées

### Utilisateur Test 1 - Primaire
```
Level: 5eme_primaire
Style: visual
Expected: Questions simples, conseils ludiques, 6s d'affichage
```

### Utilisateur Test 2 - Collège
```
Level: 2eme_cem
Style: textual
Expected: Questions intermédiaires, conseils structurés, 5s d'affichage
```

### Utilisateur Test 3 - Lycée
```
Level: terminale_sciences
Style: practical
Expected: Questions avancées, conseils rigoureux, 4s d'affichage
```

## 🔍 Points de Vérification Spécifiques

### Fichier: LearningAssessment.tsx
```
✅ useProfile() charge le profil
✅ getAssessmentPhasesByLevel() retourne le contenu adapté
✅ visualPhases et textPhase sont mis à jour au montage
✅ Délais d'affichage correspond au niveau
```

### Fichier: ITSRecommendations.tsx
```
✅ useProfile() charge le profil
✅ getTipsByLevelAndStyle() retourne les bons conseils
✅ Le message "Contenu adapté à ton style et ton niveau" est visible
✅ Les conseils changent selon le niveau
```

### Fichier: ChatBot.tsx
```
✅ schoolLevel est accepté en prop
✅ schoolLevel est envoyé au backend via JSON
✅ Pas de null dans la transmission (valeur par défaut: null ok)
```

### Fichier: Cours.tsx
```
✅ profile?.school_level est passé au ChatBot
✅ Pas d'erreur si school_level est null
```

## 📱 Test sur Différents Navigateurs

- [ ] Chrome/Chromium (Desktop)
- [ ] Firefox (Desktop)
- [ ] Safari (Desktop)
- [ ] Edge (Desktop)
- [ ] Mobile Chrome
- [ ] Mobile Safari

## 🚨 Messages d'Erreur à Éviter

- ❌ "Cannot read property 'school_level' of null"
- ❌ "Type 'null' is not assignable to type 'SchoolLevel'"
- ❌ "getAssessmentPhasesByLevel is not a function"
- ❌ "undefined is not an object (evaluating profile)"

## ✅ Résultats Attendus

| Test | Résultat Attendu | Statut |
|------|------------------|--------|
| Profil Primaire | Questions simples | 🟢 |
| Profil Collège | Questions intermédiaires | 🟢 |
| Profil Lycée | Questions avancées | 🟢 |
| Conseils Primaire | Ludiques et simples | 🟢 |
| Conseils Collège | Progressifs | 🟢 |
| Conseils Lycée | Rigoureux | 🟢 |
| ChatBot Primaire | Réponses simples | 🟢 |
| ChatBot Collège | Réponses adaptées | 🟢 |
| ChatBot Lycée | Réponses approfondies | 🟢 |

## 📝 Rapport de Test

Après avoir effectué les tests, créer un rapport contenant:
- Date du test
- Navigateurs testés
- Niveaux testés
- Problèmes trouvés
- Recommandations d'amélioration
- Status global (✅ OK / ⚠ Amélioration nécessaire / ❌ Blocages)

---

**Bon test ! 🧪**
