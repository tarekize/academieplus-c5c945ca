

## Correction du profil Pedago

### Probleme actuel
Le role `pedago` a ete ajoute a la base de donnees et a l'interface d'administration, mais plusieurs elements sont incomplets ou cassent le build :

1. **Erreur de build** : `AuthContext.tsx` definit `hasRole` avec le type `'admin' | 'parent' | 'student'` -- le type `'pedago'` n'est pas inclus, ce qui cause l'erreur TypeScript dans `ListeCours.tsx`.
2. **`ProtectedRoute.tsx`** : Le type `requiredRole` n'inclut pas `'pedago'`.
3. **Onglet Pedagos dans Admin** : Le `TabsContent` pour l'onglet "pedagos" est manquant -- l'onglet existe dans la barre mais aucun contenu ne s'affiche.
4. **RLS sur chapters/lessons** : Seuls les admins ont la permission ALL. Les pedagos n'ont aucun droit d'ecriture sur les chapitres et lecons.

### Plan de correction

#### 1. Mise a jour des types TypeScript

Modifier `AuthContext.tsx` et `ProtectedRoute.tsx` pour inclure `'pedago'` dans les types de roles :
- `hasRole(role: 'admin' | 'parent' | 'student' | 'pedago')`
- `requiredRole?: 'admin' | 'parent' | 'student' | 'pedago'`

#### 2. Ajout des politiques RLS pour le role pedago

Creer une migration SQL pour donner aux pedagos le controle total sur les chapitres et les lecons :

```sql
-- Chapters: pedago full access
CREATE POLICY "Pedagos can manage chapters"
ON public.chapters FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'pedago'::app_role));

-- Lessons: pedago full access
CREATE POLICY "Pedagos can manage lessons"
ON public.lessons FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'pedago'::app_role));
```

#### 3. Ajout du TabsContent "pedagos" dans Admin.tsx

Ajouter le contenu de l'onglet Pedagos dans la page Admin, avec :
- Un tableau listant les utilisateurs pedago (nom, email, statut, date d'inscription)
- Les actions de gestion (activer/desactiver, supprimer)
- Un champ de recherche dedie

Le modele sera identique a celui des onglets Parents et Eleves deja existants.

#### 4. Verification du AddUserDialog

Le `AddUserDialog` et la fonction `admin-create-user` supportent deja le role `pedago` -- aucune modification necessaire sur cette partie.

### Details techniques

| Fichier | Modification |
|---|---|
| `src/contexts/AuthContext.tsx` | Ajouter `'pedago'` au type du parametre `role` dans `hasRole` |
| `src/components/ProtectedRoute.tsx` | Ajouter `'pedago'` au type `requiredRole` |
| `src/pages/Admin.tsx` | Ajouter `TabsContent value="pedagos"` avec le tableau de gestion |
| Migration SQL | 2 nouvelles politiques RLS sur `chapters` et `lessons` pour le role pedago |

