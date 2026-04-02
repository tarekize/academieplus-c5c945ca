# 🧪 Guide de Test Pratique - Affichage Adaptatif

## ✅ Vérification Pré-Test

```bash
cd c:\Users\tarek\Downloads\sync-my-school-support
npm run build
# Devrait afficher: "✓ built in ~20s"
```

## 📝 Scénario de Test 1: Configuration Initiale

### Étape 1: Ajouter une Vidéo de Test
1. Ouvrir: `http://localhost:5173/video-admin`
2. Clic: "Ajouter un Mapping"
3. Remplir le forulaire:
   - **Titre du Cours:** `Résolution des équations du premier degré`
   - **URL Vidéo:** `https://youtu.be/kJQX31NMxzc`
   - **Durée:** `12:34` (garder par défaut OK)
   - **Vidéos complémentaires:** Laisser vide
4. Clic: "Ajouter"
5. ✅ Message: "Mapping vidéo ajouté avec succès"

### Étape 2: Vérifier le Stockage
1. Ouvrir Console (F12)
2. Exécuter:
```javascript
console.log(JSON.parse(localStorage.getItem("video_mappings")))
```
3. ✅ Devrait afficher l'objet avec la vidéo

## 🎬 Scénario de Test 2: Affichage Visuel

### Test Style Visual
1. **Modifier le style de l'utilisateur** (Pour test):
```javascript
// Ajouter dans localStorage:
localStorage.setItem("test_learning_style", "visual");
```

2. **Aller dans un cours** avec titre contenant "équations"
3. ✅ La vidéo devrait s'afficher **EN PREMIER**
4. ✅ Bouton: "Voir le texte" (couleur BLEU)
5. ✅ Header gradient: bleu

### Test Style Textual
1. Modifier le style:
```javascript
localStorage.setItem("test_learning_style", "textual");
```

2. Retourner dans le même cours
3. ✅ Le texte devrait s'afficher **EN PREMIER**
4. ✅ Bouton: "Voir les Vidéos" (couleur VERT)
5. ✅ Header gradient: vert

### Test Style Practical
1. Modifier le style:
```javascript
localStorage.setItem("test_learning_style", "practical");
```

2. Retourner dans le même cours
3. ✅ Contenu pratique en premier
4. ✅ Bouton: "Voir les Vidéos" (couleur ORANGE)
5. ✅ Header gradient: orange

## 🎥 Scénario de Test 3: Interactions

### Test Toggle Vidéo ↔ Texte
1. Être sur style Visual (vidéo affichée)
2. Clic: Bouton "Voir le texte"
3. ✅ Animation smooth
4. ✅ Texte apparaît
5. Clic: Bouton "Voir la vidéo"
6. ✅ Animation smooth retour
7. ✅ Vidéo réapparaît

### Test URLs YouTube Invalides
1. Ajouter vidéo avec URL invalide:
```
https://invalid-url.com/video
```
2. ✅ Message: "Vidéo non disponible"
3. ✅ Pas de crash, fallback gracieux

## 🎯 Scénario de Test 4: Admin Interface

### Test Ajouter Vidéo avec Compléments
1. Page: `/video-admin`
2. Clic: "Ajouter un Mapping"
3. Remplir:
   - **Titre:** `Fractions: Addition et Soustraction`
   - **URL Principale:** `https://youtu.be/ABC123`
   - **Vidéos Complémentaires:**
```json
[
  {
    "title": "Dénominateur commun",
    "url": "https://youtu.be/XYZ456",
    "duration": "8:30"
  },
  {
    "title": "Exercices résolus",
    "url": "https://youtu.be/DEF789",
    "duration": "15:00"
  }
]
```
4. Clic: "Ajouter"
5. ✅ Mapping créé
6. ✅ Vidéos complémentaires visibles dans la liste

### Test Supprimer Mapping
1. Page: `/video-admin`
2. Trouver le mapping dans la liste
3. Clic: Poubelle (delete button)
4. ✅ Mapping supprimé
5. ✅ List mise à jour

### Test Refresh Persiste
1. Ajouter quelques mappings
2. F5 Refresh page
3. ✅ Tous les mappings toujours là
4. ✅ localStorage persiste

## 📊 Scénario de Test 5: Matching des Titres

### Test Case-Insensitive
1. Ajouter vidéo: `"LES EQUATIONS DU 1ER DEGRE"`
2. Chercher cours avec titre: `"les equations du 1er degré"`
3. ✅ Vidéo trouvée (matching case-insensitive)

### Test Partial Matching
1. Ajouter vidéo avec titre: `"Trigonométrie: Sinus, Cosinus, Tangente"`
2. Créer cours avec titre: `"Trigonométrie"`
3. ✅ Vidéo trouvée (contient le mot-clé)

## 🐛 Scénario de Test 6: Gestion des Erreurs

### Test Pas de Vidéos Trouvées
1. Chercher cours avec titre: `"Astrodynamique Quantique"` (n'existe pas)
2. ✅ Afficher: "Aucune vidéo disponible pour cette leçon"
3. ✅ Contenu texte affiche normalement

### Test LocalStorage Vidé
1. Ouvrir Console (F12)
2. Exécuter:
```javascript
localStorage.clear();
```
3. Refresh page
4. ✅ Pas d'erreur
5. ✅ Interface admin vide (OK)

## 📱 Scénario de Test 7: Responsive Design

### Test Desktop (1920x1080)
1. Ouvrir cours
2. Vérifier layout optimal
3. ✅ Vidéo: 100% width responsive
4. ✅ Texte: prose styling OK

### Test Tablet (768x1024)
1. DevTools: Toggle device toolbar
2. Tablet mode
3. ✅ Vidéo: responsive ratio 16:9
4. ✅ Bouton: accessible

### Test Mobile (375x667)
1. DevTools: iPhone mode
2. ✅ Vidéo: responsive
3. ✅ Bouton: touch-friendly size
4. ✅ Pas d'overflow

## ✨ Scénario de Test 8: Performance

### Test Loading Time
1. Ouvrir DevTools: Network tab
2. Charger cours
3. ✅ Skeletons apparaissent (<100ms)
4. ✅ Contenu charge (<500ms total)

### Test Large Dataset
1. Console:
```javascript
// Créer 100 mappings
const large = {};
for (let i = 0; i < 100; i++) {
  large[`Cours ${i}`] = {
    lesson_title: `Cours ${i}`,
    main_video_url: "https://youtu.be/kJQX31NMxzc",
    reel_videos: []
  };
}
localStorage.setItem("video_mappings", JSON.stringify(large));
```
2. Naviguer entre cours
3. ✅ <100ms lookup time
4. ✅ Pas de lag

## 📋 Checklist de Test Complet

### Fonctionnalité
- [ ] Vidéo affiche côté visual
- [ ] Texte affiche côté textual
- [ ] Exercices affiche côté practical
- [ ] Toggle fonctionne
- [ ] Animation smooth
- [ ] Pas de vidéo: message OK
- [ ] URLs invalides: fallback OK

### Admin
- [ ] Ajouter vidéo: OK
- [ ] Supprimer vidéo: OK
- [ ] Vidéos complémentaires: JSON parse OK
- [ ] Refresh persiste: OK
- [ ] Matching titles: case-insensitive OK

### Tech
- [ ] Build: 0 errors
- [ ] Console: 0 errors
- [ ] Responsive: 3 breakpoints OK
- [ ] Performance: <500ms

### UX
- [ ] Boutons cliquables
- [ ] Couleurs distinctives
- [ ] Messages user claire
- [ ] Pas de confusion

## 🎓 Résultats Attendus

### Succès ✅
```
✓ Toutes les vidéos s'affichent
✓ Styles adaptatifsfonctionnent
✓ Admin interface responsive
✓ 0 erreurs console
✓ Performance < 500ms
✓ localStorage persiste
```

### Points à Noter
- 📝 Quels styles utilisés plus?
- 📈 Engagement augmente?
- 🎯 Feedback utilisateurs?

## 🚀 Post-Test Actions

1. **Si succès:** 
   - ✅ Intégrer dans Cours.tsx (FAIRE)
   - Ajouter 20+ vidéos réelles
   - Release en production

2. **Si problème:**
   - Checker console errors
   - Revoir localStorage structure
   - Tester matching titles

---

**Ready to Test! 🎬**
