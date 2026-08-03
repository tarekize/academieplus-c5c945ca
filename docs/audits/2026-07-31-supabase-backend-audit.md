# Audit backend Supabase — AcadémiePlus

**Date** : 2026-07-31
**Projet Supabase audité** : `lfothlxoixayjiytwwqa` (SoutienScolaire, région eu-west-1, Postgres 17.6)
**Méthode** : audit en lecture seule — `list_tables`, `get_advisors` (security + performance), `list_extensions`, `list_edge_functions`, `list_migrations`, requêtes `SELECT` sur `pg_policies`/`pg_proc`/`information_schema`, lecture du code source (migrations SQL, Edge Functions Deno, intégration frontend). **Aucune donnée, migration ou policy n'a été modifiée.**

> ⚠️ Un second projet Supabase (`jrgjvjnhdliymljelhgd`) existe dans l'organisation mais n'est référencé nulle part dans le code (`.env`, `client.ts`, `supabase/.temp/project-ref` pointent tous vers `lfothlxoixayjiytwwqa`) : il a été ignoré car hors périmètre de cette application.

---

## Sommaire

| # | Sévérité | Titre | Axe |
|---|----------|-------|-----|
| C1 | 🔴 Critique | `activation_codes` : n'importe quel utilisateur authentifié peut s'auto-générer un abonnement gratuit | Sécurité/RLS, Intégrité |
| C2 | 🔴 Critique | Edge Function `record-payment` valide des paiements sans passerelle de paiement réelle | Edge Functions, Permissions |
| C3 | 🔴 Critique | `chapter_exercises`/`chapter_quizzes` : un pédagogue peut auto-valider son propre contenu (pattern verrou/bypass absent) | Sécurité/RLS, Permissions |
| E1 | 🟠 Élevée | Buckets Storage publics avec listing activé → énumération des UUID utilisateurs | Sécurité/Storage |
| E2 | 🟠 Élevée | 7 Edge Functions consommant un quota IA payant sans rate-limiting | Edge Functions |
| E3 | 🟠 Élevée | 6 Edge Functions déployées en production absentes du dépôt Git, dont 2 totalement non-fonctionnelles (RGPD, quiz legacy) | Cohérence/Edge Functions |
| E4 | 🟠 Élevée | Dérive de l'historique de migrations : la base réelle contient des changements jamais tracés par `supabase_migrations` | Cohérence migrations |
| M1 | 🟡 Moyenne | Fonctions `SECURITY DEFINER` exécutables par `anon` (108 occurrences) | Sécurité/RLS |
| M2 | 🟡 Moyenne | `join_establishment_by_code` / `get_establishment_name_by_code` sans rate-limiting ni vérification de rôle | Sécurité/RLS |
| M3 | 🟡 Moyenne | 196 policies permissives redondantes (`multiple_permissive_policies`) | Performance |
| M4 | 🟡 Moyenne | 146 policies RLS ré-évaluant `auth.uid()`/`current_setting()` par ligne (`auth_rls_initplan`) | Performance |
| M5 | 🟡 Moyenne | 60 clés étrangères sans index de couverture | Performance |
| M6 | 🟡 Moyenne | Duplication massive de logique entre Edge Functions IA (CORS, fallback Gemini, sanitation JSON/LaTeX) | Edge Functions |
| M7 | 🟡 Moyenne | Code mort : providers IA définis mais jamais appelés | Edge Functions |
| M8 | 🟡 Moyenne | 334 casts `as any` côté frontend : symptôme de dérive `types.ts` | Frontend |
| F1 | ⚪ Faible | `pg_net` installé dans le schéma `public` | Sécurité |
| F2 | ⚪ Faible | Protection mots de passe compromis (HaveIBeenPwned) désactivée | Sécurité/Auth |
| F3 | ⚪ Faible | `password_change_codes` : RLS activée sans policy (fail-closed, non exploitable) | Sécurité/RLS |
| F4 | ⚪ Faible | 6 index inutilisés | Performance |
| F5 | ⚪ Faible | Polling au lieu de Realtime sur le dashboard élève | Frontend/Performance |

**Couverture** : les axes **1 (Sécurité/RLS)** et **7 (Permissions & rôles)** ont été traités de façon exhaustive, table par table (46 tables, ~65 fonctions, toutes les policies `pg_policies`, tous les triggers). Les axes 2 à 6 ont été traités de façon plus synthétique (échantillonnage ciblé sur les fonctions à risque et les Edge Functions consommant de l'IA ou manipulant de l'argent/des comptes), faute de pouvoir lire exhaustivement les 89 fichiers de migration et les 34 Edge Functions ligne par ligne dans le temps imparti. C'est explicitement indiqué à chaque section concernée.

---

## 🔴 Critique

### C1 — `activation_codes` : auto-activation d'abonnement gratuit par insertion directe

**Table** : `public.activation_codes`
**Policy** : `Authenticated can insert codes` (INSERT, rôle `authenticated`)
```sql
with_check: (auth.uid() = created_by)
```
**Colonnes** : `status` par défaut `'free'`, `payment_id` **nullable**, `plan_type` sans contrainte CHECK, `is_family` boolean libre.

**Scénario d'exploitation** : n'importe quel compte authentifié (élève, enseignant, parent...) peut appeler directement l'API REST Supabase (pas besoin d'Edge Function ni de rôle particulier) :
```js
await supabase.from('activation_codes').insert({
  code: 'X7K9QZ21', created_by: myUserId, plan_type: 'annual', is_family: true
});
// payment_id reste NULL, status reste 'free' par défaut
await supabase.rpc('redeem_activation_code', { p_code: 'X7K9QZ21' });
```
`redeem_activation_code` (SECURITY DEFINER, `supabase/migrations/...`) ne vérifie que `status = 'free'` — elle ne vérifie jamais que `payment_id` référence un paiement réellement complété. Le code est donc immédiatement consommable et crée une ligne dans `student_subscriptions` avec `total_days = 360` (plan annuel) sans qu'aucun paiement n'ait eu lieu. Le compte peut aussi générer un code `is_family: true` et le partager pour activer 3 comptes gratuitement.

**Recommandation** :
- Retirer la policy INSERT `authenticated` sur `activation_codes` : seule l'écriture via `service_role` (Edge Function `record-payment`, une fois corrigée — voir C2) ou une RPC `SECURITY DEFINER` dédiée doit pouvoir créer un code.
- Ajouter une contrainte `CHECK (payment_id IS NOT NULL OR created_by_admin)` ou équivalent pour interdire un code "orphelin" sans paiement rattaché.
- Ajouter une contrainte CHECK sur `plan_type` (`IN ('monthly','annual')`).

**Effort** : rapide (une migration RLS + une contrainte CHECK).

---

### C2 — Edge Function `record-payment` : paiement validé sans passerelle de paiement

**Fichier** : Edge Function déployée `record-payment` (⚠️ **absente du dépôt Git**, récupérée via `get_edge_function`), invoquée depuis `src/pages/Paiement.tsx:109`.

**Extrait** :
```ts
// aucune vérification externe (Stripe/CIB/Chargily/webhook signé) —
// le prix est recalculé côté serveur, mais la "réussite" du paiement
// est acceptée sur la seule foi de l'appel du client
const { data: payment } = await serviceClient.from('payments').insert({
  user_id: user.id, amount: price, plan_type: billing_period,
  is_family, status: 'completed',           // <-- toujours "completed"
}).select().single();

for (let i = 0; i < childrenCount; i++) {
  const { data: codeData } = await serviceClient.rpc('generate_activation_code');
  await serviceClient.from('activation_codes').insert({ code, payment_id: payment.id, ...status: 'free' });
}
```

**Scénario d'exploitation** : `Paiement.tsx` n'intègre aucun formulaire de carte bancaire ni redirection vers un prestataire de paiement (CIB/EDAHABIA/Chargily/Stripe...) — le clic sur "Payer" appelle directement cette fonction. N'importe quel utilisateur authentifié peut appeler `record-payment` directement (curl/Postman) autant de fois que souhaité, avec `billing_period`, `plan_name`, `is_family` de son choix, sans jamais effectuer de paiement réel, et recevoir en retour des codes d'activation valides à chaque appel — aucun rate-limit, aucune vérification anti-abus. C'est une occurrence différente mais liée à C1 : même sans la faille RLS directe sur `activation_codes`, ce chemin **officiel** produit exactement le même résultat : accès payant gratuit illimité.

**Recommandation** :
- Intégrer une vraie passerelle de paiement (webhook serveur-à-serveur signé, vérifié par une clé secrète stockée dans `Deno.env`) avant de marquer `status: 'completed'`.
- Tant que l'intégration n'existe pas, marquer les paiements `status: 'pending'` et exiger une validation manuelle admin (via `approve`-style RPC) avant génération des codes.
- Ajouter un rate-limit (`check_and_log_rate_limit`) sur cette fonction.

**Effort** : important (dépend du choix et de l'intégration d'un prestataire de paiement réel — hors périmètre purement Supabase).

---

### C3 — `chapter_exercises` / `chapter_quizzes` : auto-validation de contenu par un pédagogue

**Tables** : `public.chapter_exercises`, `public.chapter_quizzes`
**Triggers `guard_*` présents sur** : `chapters` (`trg_guard_chapter_insert`, `trg_guard_chapter_update`), `lessons` (`trg_guard_lesson_insert`, `trg_guard_lesson_content`, `trg_guard_lesson_status_update`), `exams` (`trg_guard_exam_update`).
**Triggers `guard_*` ABSENTS sur** : `chapter_exercises`, `chapter_quizzes` (vérifié via `information_schema.triggers` — aucune entrée pour ces deux tables en dehors de rien du tout, pas même un trigger `updated_at`).

**Policy en cause** :
```sql
-- chapter_exercises (et chapter_quizzes, policy identique)
"Admin and pedago manage chapter exercises" — ALL — roles {authenticated}
qual: EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND (ur.role='admin' OR ur.role='pedago'))
-- + policy redondante "Pedagos can manage exercises" ALL, has_role(auth.uid(),'pedago')
```
Aucune de ces policies ne vérifie un lien de propriété (`submitted_by = auth.uid()`) ni un `current_setting('app.bypass_..._lock')`, contrairement à `chapters`/`lessons`/`exams`.

Le workflow officiel (`submit_chapter_item_for_review` → statut `pending` → `approve_chapter_item`/`reject_chapter_item`, réservées à `admin`) existe bien pour les items de type `'exercise'`/`'quiz'` — mais rien n'empêche de le contourner : la colonne `status` de `chapter_exercises`/`chapter_quizzes` est modifiable en direct par n'importe quel pédagogue.

**Scénario d'exploitation détaillé** : un compte `pedago` (y compris sur du contenu créé par lui-même, en `status = 'pending'` après soumission, ou même du contenu d'un **autre** pédagogue puisque la policy ne restreint pas par auteur) exécute :
```js
await supabase.from('chapter_quizzes')
  .update({ status: 'approved', reviewed_by: myUserId, reviewed_by_name: 'Moi-même', reviewed_at: new Date() })
  .eq('id', anyQuizId);
```
Cet appel réussit car la policy `ALL` autorise toute mise à jour dès lors que l'appelant a le rôle `pedago`, sans passer par `approve_chapter_item` (qui, elle, vérifie `has_role(auth.uid(),'admin')`). Le quiz/exercice devient immédiatement visible aux élèves via `get_student_quizzes`/`get_student_exercises` (qui filtrent uniquement sur `status = 'approved'`), **sans jamais avoir été relu par un administrateur** — alors que c'est précisément le contrôle que le produit met en place pour `chapters`, `lessons` et `exams`.

**Recommandation** :
- Créer `guard_chapter_exercise_update()` et `guard_chapter_quiz_update()` sur le même modèle que `guard_exam_update()` : bloquer toute modification de `status`/`reviewed_by`/`reviewed_at`/`rejection_reason` sauf si l'appelant est admin OU si `current_setting('app.bypass_exercise_status_lock')='on'` (positionné par `approve_chapter_item`/`reject_chapter_item`/`submit_chapter_item_for_review` via `PERFORM set_config(...)`, comme c'est déjà fait pour `chapters`/`lessons`).
- Remplacer la policy `ALL` par des policies séparées : INSERT libre au pédagogue, UPDATE restreint aux colonnes de contenu (pas de statut), DELETE réservé à l'auteur ou l'admin.

**Effort** : modéré (deux fonctions trigger + une migration, en copiant le pattern existant).

---

## 🟠 Élevée

### E1 — Buckets Storage publics avec listing activé

**Buckets** : `avatars`, `email-assets`, `lesson-media` (tous `public: true`)
**Policies concernées** :
```sql
"Avatar images are publicly accessible" — SELECT — bucket_id='avatars' — qual: true
"Public read access to email assets" — SELECT — bucket_id='email-assets' — qual: true
"Public read access to lesson media" — SELECT — bucket_id='lesson-media' — qual: true
```
Confirmé par l'advisor sécurité (`public_bucket_allows_listing` ×3).

**Scénario d'exploitation** : les policies SELECT sur `storage.objects` ne filtrent que par `bucket_id`, sans restreindre aux opérations de lecture d'un objet précis. Elles permettent donc un `list()` complet du bucket (`supabase.storage.from('avatars').list()`), pas seulement la récupération d'une URL publique connue. Comme les fichiers d'avatar sont rangés sous `{user_id}/...` (cf. policy `Users can upload their own avatar` : `(auth.uid())::text = (storage.foldername(name))[1]`), un attaquant anonyme peut lister **tous les dossiers du bucket `avatars`** et ainsi récupérer la liste complète des UUID d'utilisateurs de la plateforme — une information qui, combinée à des RPC acceptant un `user_id` en paramètre (`is_parent_of`, `is_teacher_of`, `get_establishment_name_by_code`...), facilite l'énumération et le ciblage de comptes réels.

**Recommandation** : remplacer les policies `SELECT ... USING (true)` par des policies qui n'autorisent que l'accès via l'API "get public URL" standard (qui ne nécessite pas de policy `SELECT` du tout pour un bucket `public`) — c'est-à-dire **supprimer ces policies SELECT** : un bucket marqué `public` sert déjà les objets par URL directe sans policy RLS ; la policy actuelle n'ajoute que la capacité de *listing*, non désirée ici (recommandation standard de l'advisor Supabase).

**Effort** : rapide.

---

### E2 — Edge Functions IA sans rate-limiting

**Fonctions concernées** (authentification vérifiée ✅, mais **aucun appel à `check_and_log_rate_limit`**) : `generate-adaptive-content`, `generate-remediation`, `generate-placement-test`, `generate-chapter-revision`, `generate-lesson-comment`, `generate-parent-report`, `generate-periodic-advice`.

À l'inverse, `lovable-chat` (le chat élève) implémente correctement le pattern (`supabase/functions/lovable-chat/index.ts:429-446`) : 20 requêtes/60s via `check_and_log_rate_limit`, plus un quota gratuit quotidien (`chat_usage`/`increment_chat_usage`). `extract-content-from-document`, `generate-exam-exercise`, `generate-teacher-content`, `link-child-by-code`, `send-bulk-notification`, `request-password-change`, `generate-editorial-assistant` sont également protégées.

**Scénario d'exploitation** : `generate-adaptive-content` et `generate-remediation` sont appelées côté élève à chaque session d'exercice (`useAdaptiveContent.ts`). Un élève (rôle légitime le plus bas-privilège pouvant appeler ces fonctions) peut scripter des appels en boucle directement contre l'endpoint `/functions/v1/generate-adaptive-content` avec son propre JWT valide : chaque appel déclenche un appel payant à l'API Gemini (`GEMINI_API_KEY_2`, jusqu'à 16 384 tokens de sortie), sans aucune limite de fréquence — un abus (bug client, script, compte compromis) peut multiplier la facture IA sans qu'aucun garde-fou serveur n'intervienne, contrairement à `lovable-chat`.

**Recommandation** : ajouter le même appel `adminClient.rpc('check_and_log_rate_limit', { p_user_id, p_action: '<nom_fonction>', p_window_seconds: 60, p_max_requests: N })` en tête de chaque fonction listée, avant l'appel au modèle IA.

**Effort** : rapide par fonction (le pattern existe déjà et est copiable depuis `lovable-chat`).

---

### E3 — Edge Functions déployées en production mais absentes du dépôt Git

**Constat** : `list_edge_functions` retourne 39 fonctions actives sur le projet ; le dossier `supabase/functions/` du dépôt n'en contient que 33 (`_shared` + 32 fonctions). Six fonctions tournent en production sans aucune trace dans le code versionné : `gemini-chat`, `gdpr-cleanup`, `create-child-account`, `bulk-gen-batch`, `record-payment` (cf. C2), `validate-quiz-answer`.

Plus grave : deux d'entre elles référencent un schéma qui **n'existe plus** dans la base actuelle (confirmé via `list_tables`, 46 tables au total) :
- `gdpr-cleanup` (protégée par `x-cron-secret`, censée exécuter les obligations RGPD via `pg_cron`) référence `data_access_logs`, `account_deletion_requests`, `parental_consents`, et la colonne `profiles.account_active` — **aucune de ces tables/colonnes n'existe** dans le schéma public actuel (46 tables listées, aucune ne porte ces noms). Chaque exécution planifiée échoue silencieusement sur chacune de ces 4 actions (elle catch chaque erreur individuellement et renvoie `status: 200` avec des entrées `"status":"error"` dans le corps) — **sans alerte visible**, ce qui donne une fausse impression de conformité RGPD alors que la purge automatique ne s'exécute pas.
- `validate-quiz-answer` référence `quiz_questions`/`quiz_submissions`, remplacées depuis par `chapter_quizzes`/`check_quiz_answer` (RPC actuelle) — fonction morte, mais toujours **déployée et invocable** (`verify_jwt:false`, accessible publiquement avec n'importe quel JWT).

**Impact** : ces fonctions ne passent par aucune revue de code, aucune CI, aucun contrôle de version — un correctif appliqué au code du dépôt (ex. durcissement CORS, correction du rate-limiting) ne s'y répercute jamais. `gdpr-cleanup` en particulier représente un risque de conformité : l'entreprise peut croire à tort que ses obligations légales de purge de données sont automatisées et respectées.

**Recommandation** :
- Rapatrier le code de ces 6 fonctions dans `supabase/functions/` (déjà fait pour l'audit via `get_edge_function`, à committer).
- Décommissionner `validate-quiz-answer` (remplacée par `check_quiz_answer`) et `bulk-gen-batch`/`gemini-chat` si obsolètes, ou les aligner sur le schéma actuel.
- Réécrire `gdpr-cleanup` sur les tables réelles (probablement `activity_logs`, un futur `account_deletion_requests` s'il doit être créé, etc.) et ajouter une alerte (email/Slack) en cas d'échec au lieu d'un simple `console.error`.
- Mettre en place un déploiement Edge Functions exclusivement via CI/CD (`supabase functions deploy` depuis le pipeline Git), pour qu'aucune fonction ne puisse plus diverger du dépôt.

**Effort** : modéré (rapatriement + nettoyage) à important (réécriture `gdpr-cleanup` sur le schéma réel).

---

### E4 — Dérive entre le dossier de migrations et l'historique réel de la base

**Constat** : le dépôt contient **89** fichiers `supabase/migrations/*.sql` ; `list_migrations` (table `supabase_migrations.schema_migrations`) n'en recense que **58**, avec une dernière version trackée au `20260701172953`. Le dépôt contient pourtant des migrations datées jusqu'au `20260801090000` (soit après la date d'audit), et l'écart (31 fichiers) touche une plage de dates qui chevauche des fonctionnalités bien présentes en base (guard triggers, `teacher_content`, `lesson_versions`...).

Cela indique que des changements de schéma ont été appliqués à la base réelle par un canal qui ne passe pas par le suivi standard des migrations (édition directe via SQL Editor du dashboard, ou migrations appliquées puis leur entrée supprimée/jamais insérée dans `schema_migrations`). Concrètement : **rejouer les migrations du dépôt sur une base vierge ne reproduira pas fidèlement l'état actuel de la base de production**, et le suivi de version du schéma n'est plus fiable comme source de vérité.

**Recommandation** : exécuter `supabase migration repair` (ou l'équivalent manuel : réinsérer les versions manquantes dans `supabase_migrations.schema_migrations` une fois vérifié qu'elles sont bien reflétées par le schéma actuel), puis imposer que tout changement de schéma passe exclusivement par `supabase db push`/CI.

**Effort** : modéré (audit de réconciliation), mais dépend d'un accès admin que cet audit en lecture seule n'a pas cherché à exercer.

---

## 🟡 Moyenne

### M1 — Fonctions `SECURITY DEFINER` exécutables par `anon`

L'advisor sécurité remonte 108 warnings `anon_security_definer_function_executable` / `authenticated_security_definer_function_executable` (57 + 51) : la quasi-totalité des ~65 fonctions `public.*` sont exécutables via `/rest/v1/rpc/<nom>` par le rôle `anon`, y compris des fonctions d'administration (`approve_exam`, `admin_get_last_sign_in_times`, `redeem_activation_code`, `join_establishment_by_code`...).

Vérification faite sur un échantillon (`admin_get_last_sign_in_times`, `admin_list_notification_candidates`, `admin_pending_content_items`, `approve_chapter_item`, `reject_chapter_item`) : **toutes contiennent un `IF NOT has_role(auth.uid(),'admin') THEN RAISE EXCEPTION`** ou un `WHERE ... AND has_role(...)` qui les neutralise pour un appelant non-admin/anon (retour vide ou erreur). Ce n'est donc pas une fuite de données directe, mais une **surface d'attaque inutilement large** : la sécurité repose à 100% sur la justesse de chaque vérification interne plutôt que sur un filtrage en profondeur (defense-in-depth), et une seule fonction future oubliant ce garde-fou serait immédiatement exploitable par un utilisateur anonyme.

**Recommandation** : `REVOKE EXECUTE ON FUNCTION ... FROM anon, authenticated` par défaut sur toutes les fonctions `SECURITY DEFINER` qui ne sont pas censées être appelées côté client public, puis `GRANT EXECUTE` explicitement aux rôles qui en ont besoin (`authenticated` pour les RPC élève/parent, rien pour les RPC admin qui ne devraient être atteintes que via le rôle `service_role` ou après vérification applicative).

**Effort** : modéré (revue fonction par fonction des grants nécessaires).

---

### M2 — `join_establishment_by_code` / `get_establishment_name_by_code` sans rate-limit ni contrôle de rôle

**Fonctions** : `public.join_establishment_by_code(p_code text)`, `public.get_establishment_name_by_code(p_code text)`.

`join_establishment_by_code` ne vérifie **pas** que l'appelant a le rôle `teacher` avant de l'insérer dans `teacher_establishments` — n'importe quel compte authentifié (élève, parent...) peut s'y rattacher. Une fois lié, la policy `profiles` — `"Teachers can view linked establishment profiles"` (`EXISTS (... te.teacher_id = auth.uid())`) — lui donne accès au profil de l'établissement visé, sans vérification de légitimité. Le code fait 4 octets (8 caractères hex, `generate_establishment_code()`), soit 2³² combinaisons : un brute-force reste coûteux mais non protégé par aucun rate-limit applicatif (contrairement à `check_and_log_rate_limit` utilisé ailleurs).

**Recommandation** : exiger `has_role(auth.uid(),'teacher')` dans `join_establishment_by_code`, et ajouter un rate-limit sur les deux fonctions (par IP ou par utilisateur) pour rendre le brute-force impraticable même en cas de fuite partielle d'entropie.

**Effort** : rapide.

---

### M3 — 196 policies permissives redondantes (`multiple_permissive_policies`)

Confirmé par l'advisor performance. Exemple typique — `chapter_exercises` cumule pour la même action et le même rôle :
```sql
"Admin and pedago manage chapter exercises" ALL (EXISTS ur.role IN admin/pedago)
"Pedagos can manage exercises"              ALL has_role(pedago)
"Admins can manage exercises"               ALL has_role(admin)
```
Trois policies `ALL` qui se recouvrent totalement (la première suffit à elle seule). PostgreSQL doit évaluer et combiner (OR) toutes les policies permissives applicables à chaque requête, ce qui multiplie le coût d'évaluation RLS par table concernée (`chapters`, `lessons`, `chapter_quizzes`, `exams`... — le même pattern de duplication historique se retrouve partout). C'est aussi un facteur de risque pour C3 : plus il y a de policies qui se chevauchent, plus il est facile d'en laisser une trop permissive lors d'une future modification.

**Recommandation** : consolider chaque groupe de policies redondantes en une seule policy par action (`SELECT`/`INSERT`/`UPDATE`/`DELETE`), en supprimant les policies `ALL` historiques dupliquées.

**Effort** : modéré (revue table par table, ~15 tables concernées).

---

### M4 — 146 policies RLS avec ré-évaluation de `auth.uid()` par ligne

Advisor `auth_rls_initplan` : la quasi-totalité des policies écrivent `auth.uid() = user_id` au lieu de `(select auth.uid()) = user_id`. Sur les tables à fort volume (`student_scores`, `activity_logs`, `ai_generated_content`...), Postgres réévalue `auth.uid()` (un appel de fonction) pour **chaque ligne** scannée plutôt qu'une seule fois par requête, ce qui dégrade les performances à l'échelle.

**Recommandation** : réécrire les policies en enveloppant les appels `auth.<fn>()`/`current_setting()` dans un sous-select, ex. `(select auth.uid()) = user_id` (fix mécanique, documenté par Supabase).

**Effort** : modéré (script de migration générant les nouvelles définitions à partir de `pg_policies`).

---

### M5 — 60 clés étrangères sans index de couverture

Ex. `activation_codes.payment_id`, `activity_logs.user_id`, `ai_generated_content.chapter_id`/`lesson_id`, etc. (liste complète disponible via `get_advisors` performance). Ces colonnes sont utilisées dans des jointures et par des policies RLS de type `EXISTS (SELECT 1 FROM classes c WHERE c.id = class_students.class_id AND ...)` — sans index, chaque évaluation de policy ou jointure déclenche un scan complet de la table référencée.

**Recommandation** : ajouter des index B-Tree sur les 60 colonnes de clé étrangère listées par l'advisor, en priorisant celles utilisées dans des policies RLS fréquentes (`chapter_id`, `lesson_id`, `class_id`, `student_id`, `teacher_id`, `establishment_id`).

**Effort** : rapide (migration `CREATE INDEX CONCURRENTLY` par colonne).

---

### M6 — Duplication de logique entre Edge Functions IA

Le pattern suivant est copié-collé (avec de légères variations) dans une dizaine de fonctions (`generate-adaptive-content`, `generate-remediation`, `generate-chapter-quizzes`, `generate-lesson-content`, `enrich-chapter-lessons`, `bulk-generate-*`, `generate-exam-exercise`...) :
- `corsHeaders` identiques recopiés fichier par fichier ;
- la liste de fallback de modèles Gemini (`GEMINI_FALLBACK_MODELS` / `GEMINI2_MODELS`, ex. `generate-adaptive-content/index.ts:301` vs `generate-remediation/index.ts:232`) — les commentaires eux-mêmes documentent qu'un modèle retiré par Google (`gemini-2.0-flash`) a dû être corrigé **fonction par fonction** ;
- `sanitizeJsonEscapes()` (correction des échappements LaTeX/JSON) réimplémentée à l'identique dans chaque fichier.

**Impact** : un correctif (nouveau modèle Gemini retiré, bug de parsing JSON découvert en prod) doit actuellement être appliqué manuellement dans chaque fonction ; le risque de divergence (correctif oublié dans une fonction) est élevé et déjà matérialisé par les commentaires du code lui-même.

**Recommandation** : extraire ce code commun dans `supabase/functions/_shared/` (à côté de `tokenLogger.ts` qui suit déjà ce pattern correctement) : `corsHeaders.ts`, `geminiClient.ts` (fallback de modèles + parsing), `jsonSanitize.ts`.

**Effort** : modéré.

---

### M7 — Code mort : providers IA définis mais jamais appelés

`generate-adaptive-content/index.ts:240-269` définit `callLovableAI()` et `callGemini()` (clé 1) — le handler n'appelle en réalité que `callGemini2()` (ligne 436). `generate-editorial-assistant/index.ts` définit également `callLovableAI`/`callGemini` en tête de fichier sans qu'on ait confirmé leur utilisation réelle dans le reste du handler. Ce code mort complexifie la maintenance et peut faire croire à tort qu'un mécanisme de fallback multi-provider est actif alors qu'il ne l'est pas dans ces fonctions.

**Recommandation** : supprimer les providers non utilisés ou, si un vrai fallback multi-provider est voulu, les brancher réellement dans le handler.

**Effort** : rapide.

---

### M8 — 334 casts `as any` côté frontend

`grep -rn "as any" src` remonte 334 occurrences, concentrées entre autres dans `LessonRemediation.tsx`, `useAdaptiveContent.ts`, `QuizExerciseCRUD.tsx`, `EstablishmentManager.tsx`. C'est un symptôme direct de dérive entre `src/integrations/supabase/types.ts` (généré) et les usages réels : dès qu'une requête Supabase ne correspond pas exactement au type généré (jointures imbriquées, RPC avec des types de retour complexes comme `admin_content_review_history`/`admin_pending_content_items` qui font des `UNION ALL` entre tables hétérogènes), le code contourne le typage plutôt que de régénérer les types.

**Recommandation** : régénérer systématiquement `types.ts` après chaque migration (`generate_typescript_types`, déjà disponible via MCP) et l'intégrer en étape de CI qui échoue si le fichier committé diverge du schéma réel.

**Effort** : modéré (mise en place du contrôle CI), rapide pour la régénération ponctuelle.

---

## ⚪ Faible

### F1 — `pg_net` installé dans le schéma `public`
Advisor `extension_in_public`. `pg_net` (schéma `public`) donne accès à `net.http_get`/`http_post` à quiconque a des privilèges d'exécution sur le schéma public. Recommandation : déplacer l'extension dans un schéma dédié (`extensions`, comme `pgcrypto`/`uuid-ossp` le sont déjà). Effort rapide.

### F2 — Protection "mots de passe compromis" désactivée
Advisor `auth_leaked_password_protection`. Supabase Auth peut vérifier les mots de passe contre HaveIBeenPwned à l'inscription/changement — actuellement désactivé. Recommandation : l'activer dans la configuration Auth du dashboard (hors du périmètre SQL de cet audit). Effort rapide.
> Note de couverture : la configuration Auth complète (durée de vie JWT, rotation du refresh token, confirmation d'email) n'est pas exposée par les outils MCP en lecture seule utilisés ici (`get_advisors`/`execute_sql` ne couvrent pas `auth.config`) — seul ce point précis a pu être vérifié via l'advisor. Une vérification manuelle du dashboard Auth reste nécessaire pour compléter cet axe.

### F3 — `password_change_codes` : RLS activée sans policy
Advisor `rls_enabled_no_policy`. Sans policy, PostgREST refuse tout accès `anon`/`authenticated` (fail-closed) — la table n'est lisible/écrivable que par les Edge Functions `request-password-change`/`confirm-password-change` via `service_role`, ce qui correspond à l'usage voulu. **Non exploitable**, mais mérite une policy explicite (même `USING (false)`) pour clarifier l'intention et faire taire l'avertissement.

### F4 — 6 index inutilisés
`idx_parent_reports_child`, `idx_tcr_content`, `idx_lesson_versions_status`, `idx_exams_deletion_requested` (+2 autres) n'ont jamais servi depuis leur création selon les statistiques Postgres. À surveiller avant suppression (les stats peuvent être récentes) plutôt qu'à supprimer immédiatement.

### F5 — Polling au lieu de Realtime
`StudentDashboardContent.tsx:521` utilise un `setInterval(() => fetchScores(true), REFRESH_INTERVAL)` pour rafraîchir les scores, alors qu'une seule souscription `supabase.channel()` existe dans tout le code (`useEditConflictDetection.ts`, correctement nettoyée). Un remplacement par un abonnement Realtime sur `student_scores` réduirait la charge et la latence d'affichage.

---

## Synthèse finale

### Top 5 des correctifs à appliquer en priorité

1. **C1 — Fermer la policy INSERT permissive sur `activation_codes`** : c'est le trou le plus direct et le plus simple à exploiter (aucun outil requis, juste l'API REST standard) pour obtenir un abonnement payant gratuitement. Correctif quasi immédiat (une migration RLS + une contrainte CHECK).
2. **C2 — Sécuriser `record-payment`** : sans passerelle de paiement réelle, l'intégralité du modèle économique de l'application peut être contournée par n'importe quel compte. À traiter en parallèle de C1 puisque les deux se recoupent sur le même risque business.
3. **C3 — Corriger le workflow de validation `chapter_exercises`/`chapter_quizzes`** : c'est l'incohérence la plus flagrante avec le reste du modèle (les autres tables de contenu sont bien protégées), et elle permet à un rôle non-admin de publier du contenu pédagogique non relu aux élèves.
4. **E1 — Retirer le listing public des 3 buckets Storage** : correctif d'une ligne par bucket, qui referme une fuite d'énumération d'utilisateurs.
5. **E2 — Ajouter le rate-limiting manquant sur les 7 Edge Functions IA** : limite l'exposition financière (coût API) et l'abus, avec un pattern déjà prouvé et réutilisable (`lovable-chat`).

### Évaluation globale de la maturité

Le modèle RLS est **globalement bien pensé et appliqué avec sérieux** : 46/46 tables ont RLS activé, un pattern de rôles cohérent (`has_role`, fonctions `is_parent_of`/`is_teacher_of`/`is_establishment_*` bien factorisées et réutilisées dans la quasi-totalité des policies), toutes les fonctions `SECURITY DEFINER` fixent `search_path`, et le pattern "verrou + bypass" pour les workflows de validation est une solution élégante et correctement appliquée sur 3 des 5 tables concernées (`chapters`, `lessons`, `exams`) — ce qui rend d'autant plus visible son absence sur les 2 tables restantes (C3).

Les points faibles se concentrent sur trois zones précises plutôt que d'être diffus : **(a)** le circuit monétisation/activation (C1/C2), qui semble avoir été développé rapidement sans intégration de paiement réelle ni durcissement RLS a posteriori ; **(b)** la gouvernance des Edge Functions, qui échappent partiellement au contrôle de version (E3) et à la discipline de rate-limiting déjà démontrée ailleurs (E2) ; **(c)** une dette de performance RLS/index classique et mécanique (M3–M5), sans gravité immédiate mais qui se paiera à l'échelle.

En l'état, ce backend n'est **pas prêt pour un usage commercial avec paiements réels** tant que C1 et C2 ne sont pas corrigés — ce sont des failles de monétisation directement exploitables sans compétence technique particulière. Une fois ces 3 correctifs critiques traités, la base présente une maturité sécurité RLS supérieure à la moyenne des applications Supabase de cette taille, et les points Élevés/Moyens relèvent davantage de dette technique (performance, gouvernance du déploiement, duplication de code) que de failles de sécurité actives.
