# Ré-audit backend Supabase — AcadémiePlus

**Date** : 2026-08-03
**Projet Supabase audité** : `lfothlxoixayjiytwwqa` (SoutienScolaire, région eu-west-1, Postgres 17.6)
**Contexte** : ré-audit de suivi après [`2026-07-31-supabase-backend-audit.md`](./2026-07-31-supabase-backend-audit.md). Objectif : vérifier que les correctifs appliqués depuis (migrations `20260713`→`20260803160004`) tiennent en base, et couvrir plus en profondeur les axes traités de façon synthétique la première fois (Edge Functions, frontend).
**Méthode** : lecture seule sauf pour les deux correctifs listés en §2 (appliqués et vérifiés) — `get_advisors`, requêtes directes sur `pg_proc`/`pg_policies`/`pg_default_acl`, deux agents de relecture dédiés (39 Edge Functions ; grep ciblé sur `src/`).

---

## 1. Confirmé toujours en place (audit du 31/07)

- **C1/C2/C3** (auto-activation d'abonnement, paiements sans passerelle, auto-validation pédago) : les migrations correctives sont bien appliquées en base et le comportement observé correspond à l'intention (paiements en `pending`, jamais `completed`, jusqu'à validation admin explicite via `admin_approve_payment`).
- **E3** (6 Edge Functions non versionnées) : rapatriées, datées du 3 août ; `gemini-chat` et `validate-quiz-answer` neutralisées proprement (HTTP 410) plutôt que laissées comme doublons dangereux.
- **E2** (rate-limiting IA) : les 7 fonctions ciblées par le premier audit ont bien `check_and_log_rate_limit`.
- Contrôles critiques (`admin-create-user`, `delete-user-account`, `export-user-data`, `update-user-email`, `confirm/request-password-change`, `create-child-account`, `send-bulk-notification`) : JWT + vérification de rôle serveur systématiques, aucun secret en dur, autorisation par ressource correcte.
- Frontend : XSS déjà neutralisé (tout `dangerouslySetInnerHTML` passe par `sanitizeLessonHtml`/DOMPurify sauf un texte i18n statique dans `Excellence.tsx`, non exploitable).

## 2. Nouveaux constats corrigés dans ce passage

### 2.1 — `REVOKE ALL ... FROM PUBLIC` ne retirait pas l'accès `anon` sur 25 fonctions `SECURITY DEFINER`

Le motif utilisé dans plusieurs migrations de durcissement (`20260713120000`, `20260803160001`, etc.) :
```sql
REVOKE ALL ON FUNCTION public.xxx(...) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.xxx(...) TO authenticated;
```
ne fonctionne pas sur ce projet : `pg_default_acl` du schéma `public` contient un `ALTER DEFAULT PRIVILEGES` qui accorde `EXECUTE` **explicitement** à `anon` (en plus de `authenticated`/`service_role`) sur toute nouvelle fonction créée dans le schéma. Ce grant est matérialisé au rôle `anon` dès le `CREATE FUNCTION` — un `REVOKE ... FROM PUBLIC` ne touche que le pseudo-rôle `PUBLIC`, pas les grants explicites déjà accordés à `anon`. Vérifié par requête directe sur `pg_proc.proacl` : `anon` avait toujours `EXECUTE` sur 25 fonctions cible (`admin_grant_subscription_days`, `redeem_activation_code`, tout le workflow `approve_*`/`reject_*`/`submit_*_for_review`, `pause_my_subscription`, `increment_chat_usage`, etc.), malgré l'intention explicite des migrations précédentes de les restreindre à `authenticated`.

**Impact réel** : non exploitable en l'état — chacune de ces fonctions vérifie `auth.uid() IS NULL` ou un rôle métier en tout premier, et `auth.uid()` renvoie toujours `NULL` pour un appel `anon` non authentifié. C'est une violation du moindre privilège / de la défense en profondeur, pas une faille active : si une de ces gardes était retirée ou affaiblie par erreur plus tard, `anon` pourrait invoquer la fonction directement.

**Correctif** : migration `20260803170000_revoke_anon_from_authenticated_only_rpcs.sql` — révoque `EXECUTE` de `anon` par résolution d'OID (couvre tous les surcharges sans dépendre d'une signature figée dans le SQL). Appliquée en base et vérifiée (`SELECT ... WHERE proacl::text LIKE '%anon%'` sur les 25 fonctions → 0 résultat).

Note : les fonctions helper RLS (`is_teacher_of`, `is_establishment_*`, `get_my_primary_establishment*`, `user_has_any_role`, `calculate_age`...) gardent volontairement `anon`/`PUBLIC` — ce sont des prédicats booléens sans effet de bord utilisés à l'intérieur même des policies RLS, qui doivent rester évaluables par tout rôle soumis à ces policies.

### 2.2 — `add-student-to-class` : oracle de recherche LIKE non échappé sur le code de liaison élève

`join-class/index.ts` échappe déjà les jokers `%`/`_` avant un `.ilike()` (fonction `escapeLikePattern`, avec commentaire explicite sur le risque de recherche dichotomique). Sa fonction sœur `add-student-to-class/index.ts:83` faisait le même type de recherche (`ilike("linking_code", code)`) **sans cet échappement**. Un compte `teacher`/`admin` valide pouvait deviner le `linking_code` d'un élève arbitraire par recherche dichotomique de motifs (`"A%"`, `"AB%"`...), contournant la confidentialité du code — une rupture de l'isolement entre classes, bien que nécessitant déjà un compte enseignant légitime.

**Correctif** : réplication de `escapeLikePattern` dans `add-student-to-class`. Déployé (v78).

### 2.3 — `join-class` et `add-student-to-class` sans limite de fréquence sur la recherche par code

`link-child-by-code` a un rate-limit dédié (`check_and_log_rate_limit`, 10 tentatives/15 min) explicitement commenté comme protection anti-brute-force. `join-class` et `add-student-to-class` font le même type de recherche à haute valeur (code de classe / code de liaison élève) sans aucune limite : même avec l'échappement LIKE en place, un brute-force scripté par essais-erreurs reste possible.

**Correctif** : même schéma de rate-limit (10/15 min) ajouté aux deux fonctions. Déployées (`add-student-to-class` v78, `join-class` v77).

## 3. Constats sans correctif (acceptés ou hors périmètre)

- **`contact_messages`/`error_logs`** : policies `INSERT ... WITH CHECK (true)` ouvertes à `anon` — voulu (formulaire de contact public, remontée d'erreurs client avant authentification), mais sans limite de fréquence au niveau table : un flood anonyme reste possible (spam / coût de stockage). Accepté en l'état, à surveiller si abus constaté.
- **`password_change_codes`** : RLS activée sans aucune policy → deny-by-default pour `anon`/`authenticated`, accessible seulement via `service_role` (Edge Functions). Comportement voulu, pas un bug.
- **`pg_net` installée dans `public`** et **protection mot de passe compromis désactivée** (Auth) : inchangés depuis le 31/07, toujours à traiter si prioritaire (F1/F2 du rapport précédent).
- Dette de performance (policies permissives redondantes, `auth.uid()` ré-évalué par ligne, FK sans index) et duplication de logique entre Edge Functions IA (M3-M7 du rapport précédent) : non retraités dans ce passage, focalisé sur la sécurité.

## 4. Frontend — ré-audit ciblé (hors XSS déjà vérifié)

Rien de nouveau à signaler en sécurité :
- Aucun secret en dur dans `src/` (clé `service_role`, clé API tierce, mot de passe). `.env` est tracké par git mais ne contient que l'URL du projet et la clé **anon** publique (conçue pour être exposée côté client, protégée par RLS) — pas une fuite.
- Les rôles utilisateur sont refetchés depuis `user_roles` à chaque connexion et gardés en état React, jamais en `localStorage`/`sessionStorage` ; aucun cas où le frontend fait confiance à un rôle client sans revérification serveur.
- Aucun `eval`/`new Function`, aucun redirect ouvert, aucune fuite de stack trace Postgres brute observée sur l'échantillon vérifié.

---

**Résumé des actions de ce passage** : 1 migration SQL (revocation `anon` sur 25 fonctions), 2 Edge Functions corrigées et redéployées (échappement LIKE + rate-limit). Tout appliqué en base/production et vérifié.
