# Application 100% arabe par défaut + bascule FR/AR

## Objectif
- L'application s'affiche **en arabe par défaut** (sens RTL), sur toutes les pages et tous les boutons.
- Deux boutons **FR / AR** en haut de l'écran (déjà présents sur l'accueil, à ajouter sur les pages internes).
- Un clic sur **FR** bascule tout le contenu affiché en français ; **AR** revient à l'arabe.
- La base de données reste en **arabe uniquement** (aucun champ FR généré/stocké).
- L'IA du chatbot répond dans la langue de la question ✅ (déjà en place).
- L'IA qui génère exercices / quiz / examens génère **en arabe seulement** ✅ (déjà en place).

## Constat technique important
L'application a **211 fichiers** d'interface, mais **seulement 12** utilisent le système de traduction (i18n). Tout le reste (boutons, titres, menus, messages) a le **texte français écrit directement dans le code**. Un bouton FR/AR ne peut pas traduire ces textes tant qu'ils ne passent pas par le système de traduction.

Convertir chaque texte est un travail **volumineux et progressif** : il faut extraire chaque phrase, créer sa clé arabe (par défaut) + française, puis remplacer dans le code. On procède donc par étapes, page par page, en commençant par les plus visibles.

## Étapes

### Phase 1 — Fondations (rapide, effet immédiat)
```text
1. i18n: langue par défaut = arabe (au lieu de la détection navigateur)
2. Au démarrage: document.dir = "rtl" + lang="ar" appliqués globalement
3. Bascule FR/AR: applique dir/lang + mémorise le choix (localStorage)
4. Ajouter les boutons FR/AR dans l'entête interne (AppHeader) —
   visible sur toutes les pages élève/parent/prof/admin
```

### Phase 2 — Traduction des pages prioritaires
Conversion des textes codés en dur vers le système de traduction (clé AR par défaut + FR) :
```text
- Entêtes et menus (AppHeader, navigation, menus déroulants)
- Tableau de bord élève + tableau de bord parent
- Liste des cours / contenu de cours (boutons d'action)
- Pages compte / informations personnelles
```

### Phase 3 — Pages secondaires et espaces pro
```text
- Espace enseignant / pédago / admin (listes, formulaires, boutons)
- Examens, révisions, remédiation, paiement/abonnements
- Dialogues, toasts, messages d'erreur
```

### Phase 4 — Base de données « arabe uniquement »
```text
- Formulaire de création d'examen: supprimer tout champ FR,
  ne conserver que les champs arabes (déjà fait pour l'examen IA)
- Vérifier les autres formulaires de saisie de contenu (leçons, exercices)
  pour retirer les doublons FR quand ils existent
```

## Détails techniques
- `src/i18n/config.ts` : `lng: "ar"`, `fallbackLng: "ar"`, garder localStorage pour mémoriser une bascule FR manuelle.
- Application du sens d'écriture (RTL/LTR) centralisée dans un petit effet au montage de l'app + à chaque `changeLanguage`.
- Les fichiers `src/i18n/locales/ar.json` et `fr.json` s'enrichissent au fur et à mesure des pages converties (mêmes clés dans les deux fichiers).
- Aucune modification du schéma de base de données n'est nécessaire pour la langue ; il s'agit uniquement de retirer les champs FR côté formulaires de saisie.
- Les fonctions IA restent inchangées (déjà conformes).

## Remarque sur l'ampleur
La Phase 1 est immédiate. Les phases 2–4 se font par lots successifs : à chaque tour je convertis un groupe de pages complet. Dis-moi si tu veux que je commence tout de suite par la Phase 1 + le tableau de bord élève/parent, ou si tu préfères un autre ordre de priorité.
