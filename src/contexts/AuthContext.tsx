import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: string[];
  signOut: () => Promise<void>;
  hasRole: (role: 'admin' | 'parent' | 'student' | 'pedago' | 'teacher' | 'etablissement') => Promise<boolean>;
  isAdmin: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Détermine si un élève a déjà passé le test de positionnement (pour décider
// s'il faut le rediriger vers /learning-assessment après connexion, voir plus
// bas). Vérifie d'abord student_scores (ligne sans lesson_id = résultat de
// placement), puis toute ligne student_scores existante (compatibilité), puis
// l'ancienne table learning_styles en dernier recours pour les comptes créés
// avant la migration vers student_scores.
async function hasCompletedPlacementAssessment(userId: string): Promise<boolean> {
  const { data: scoreRows, error: scoreError } = await supabase
    .from('student_scores')
    .select('id')
    .eq('user_id', userId)
    .is('lesson_id', null)
    .limit(1);

  if ((scoreRows?.length || 0) > 0) return true;

  // Compatibility: users with only lesson-linked rows should not be forced to retake placement.
  const { data: anyScoreRows } = await supabase
    .from('student_scores')
    .select('id')
    .eq('user_id', userId)
    .limit(1);

  if ((anyScoreRows?.length || 0) > 0) return true;

  // Fallback legacy table for environments not fully migrated yet.
  const { data: legacyRows, error: legacyError } = await (supabase as any)
    .from('learning_styles')
    .select('id')
    .eq('user_id', userId)
    .limit(1);

  if (scoreError && legacyError) {
    console.warn('Unable to verify placement assessment status:', { scoreError, legacyError });
  }

  return (legacyRows?.length || 0) > 0;
}

// Toutes les routes protégées et l'en-tête appelaient hasRole()/isAdmin() (une
// requête RPC par appel) à chaque montage — jusqu'à 4-7 allers-retours réseau
// par navigation. Sous charge (10 VUs concurrents), ça faisait exploser le TTFB.
// On récupère les rôles une seule fois par session et hasRole()/isAdmin() lisent
// ce cache en mémoire au lieu de refaire une requête à chaque appel.
async function fetchRoles(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching roles:', error);
    return [];
  }

  return (data ?? []).map((r) => r.role);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // Suit l'utilisateur actuellement connu en dehors du cycle de rendu (pas de closure
  // périmée) : sert à distinguer une vraie connexion (nouvel utilisateur) d'une simple
  // ré-authentification du même utilisateur (ex : ChangePasswordButton revérifie le mot
  // de passe actuel via signInWithPassword, ce qui émet aussi un SIGNED_IN).
  const currentUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      currentUserIdRef.current = session?.user?.id ?? null;
      setRoles(session?.user ? await fetchRoles(session.user.id) : []);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const previousUserId = currentUserIdRef.current;
      setSession(session);
      setUser(session?.user ?? null);
      currentUserIdRef.current = session?.user?.id ?? null;

      // Une ré-authentification du même utilisateur déjà connu (ex : ChangePasswordButton
      // qui revérifie le mot de passe actuel via signInWithPassword, ce qui émet aussi un
      // SIGNED_IN) ne peut pas avoir changé ses rôles ni nécessiter les redirections
      // post-connexion ci-dessous — inutile de repasser `loading` à true et de faire
      // disparaître la page protégée (spinner plein écran de ProtectedRoute) derrière
      // l'utilisateur, ce qui détruisait par ex. la modale de changement de mot de passe
      // en plein milieu de sa saisie du code reçu par email.
      const isSameUserReauth =
        _event === 'SIGNED_IN' && !!session?.user && previousUserId !== null && previousUserId === session.user.id;

      // Only re-fetch roles on an actual sign-in/out, not on every event this
      // listener sees (e.g. TOKEN_REFRESHED fires roughly hourly for the same
      // user) — refetching there would just repeat the same query for nothing.
      // `loading` stays true until roles resolve so hasRole()/isAdmin() never
      // read a stale empty cache right after a fresh sign-in.
      if (_event === 'SIGNED_OUT') {
        setRoles([]);
        setLoading(false);
      } else if (session?.user && (_event === 'SIGNED_IN' || _event === 'INITIAL_SESSION' || _event === 'USER_UPDATED' || _event === 'PASSWORD_RECOVERY')) {
        if (!isSameUserReauth) {
          // `loading` peut déjà être à false (ex: session initiale nulle sur /auth) au moment
          // où ce SIGNED_IN arrive : sans ce setLoading(true) synchrone, un ProtectedRoute déjà
          // monté sur la route de destination lirait le cache `roles` encore vide et rejetterait
          // l'utilisateur vers /dashboard avant même que fetchRoles() n'ait eu le temps de répondre.
          setLoading(true);
        }
        fetchRoles(session.user.id).then((r) => {
          setRoles(r);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }

      // Vérifier si l'utilisateur SSO a besoin de compléter son profil (inutile et risqué
      // pour une simple ré-authentification du même utilisateur : voir isSameUserReauth).
      if (session?.user && !isSameUserReauth) {
        setTimeout(async () => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('is_active, date_of_birth')
            .eq('id', session.user.id)
            .maybeSingle();

          // Un profil introuvable (et non juste "is_active = false") signifie que le
          // compte a été supprimé pendant que ce navigateur gardait une session encore
          // valide localement (jeton non expiré) : on ne doit pas le traiter comme un
          // nouvel utilisateur sans rôle (-> /complete-profile), mais déconnecter et
          // renvoyer vers l'accueil.
          if (!profileData) {
            await supabase.auth.signOut();
            window.location.href = '/';
            return;
          }

          if (profileData.is_active === false) {
            await supabase.auth.signOut();
            window.location.href = '/auth?deactivated=1';
            return;
          }

          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .maybeSingle();

          const currentPath = window.location.pathname;

          // Si pas de rôle et qu'on n'est pas déjà sur la page de complétion ou d'évaluation
          if (!roleData?.role && !currentPath.includes('/complete-profile') && !currentPath.includes('/auth') && !currentPath.includes('/learning-assessment')) {
            window.location.href = '/complete-profile';
            return;
          }

          // Campagne de régularisation douce : un compte élève créé avant que
          // date_of_birth ne devienne obligatoire à l'inscription (cf.
          // 20260803090009) est invité une fois par connexion à la renseigner,
          // sans jamais bloquer la navigation ("Plus tard" reste possible).
          if (roleData?.role === 'student' && !profileData.date_of_birth &&
            !currentPath.includes('/completer-naissance') && !currentPath.includes('/complete-profile') &&
            !currentPath.includes('/auth') && !currentPath.includes('/learning-assessment')) {
            window.location.href = '/completer-naissance';
            return;
          }

          // Rediriger admin et pédago vers /liste-matieres après connexion
          if ((roleData?.role === 'pedago' || roleData?.role === 'admin') &&
            (currentPath.includes('/complete-profile') || currentPath.includes('/auth') || currentPath === '/')) {
            window.location.href = '/liste-matieres';
            return;
          }

          // Rediriger les parents vers /parent-dashboard après connexion
          // Inclure /liste-matieres et /cours pour éviter qu'ils soient redirigés vers l'espace élève
          if (roleData?.role === 'parent' &&
            (currentPath.includes('/complete-profile') || currentPath.includes('/auth') || currentPath === '/' || currentPath.includes('/liste-matieres') || currentPath.startsWith('/cours'))) {
            window.location.href = '/parent-dashboard';
            return;
          }

          // Rediriger les enseignants vers /teacher-dashboard après connexion
          if (roleData?.role === 'teacher' &&
            (currentPath.includes('/complete-profile') || currentPath.includes('/auth') || currentPath === '/' || currentPath.includes('/liste-matieres') || currentPath.startsWith('/cours'))) {
            window.location.href = '/teacher-dashboard';
            return;
          }

          // Rediriger les établissements vers /etablissement-dashboard après connexion
          if (roleData?.role === 'etablissement' &&
            (currentPath.includes('/complete-profile') || currentPath.includes('/auth') || currentPath === '/')) {
            window.location.href = '/etablissement-dashboard';
            return;
          }

          // Rediriger les élèves vers /cours/math/chapitres après connexion par défaut
          if (roleData?.role === 'student' &&
            (currentPath.includes('/auth') || currentPath === '/')) {
            window.location.href = '/cours/math/chapitres';
            return;
          }

          // Rediriger les élèves sans évaluation vers le jeu d'apprentissage
          if (roleData?.role === 'student' && !currentPath.includes('/learning-assessment') && !currentPath.includes('/complete-profile') && !currentPath.includes('/auth')) {
            const hasAssessment = await hasCompletedPlacementAssessment(session.user.id);
            if (!hasAssessment) {
              window.location.href = '/learning-assessment';
            }
          }
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Déconnecte l'utilisateur et renvoie vers /auth. Exposé via le contexte,
  // appelé par les boutons "Se déconnecter" de tous les en-têtes de page.
  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  // Lit le cache `roles` en mémoire (peuplé par fetchRoles depuis la table
  // user_roles, jamais depuis un champ modifiable côté client) — utilisé par
  // ProtectedRoute et par les pages pour afficher/masquer des sections selon
  // le rôle. Ne remplace pas une vérification RLS/RPC côté serveur : c'est un
  // contrôle d'affichage, pas la barrière de sécurité réelle.
  const hasRole = async (role: 'admin' | 'parent' | 'student' | 'pedago' | 'teacher' | 'etablissement'): Promise<boolean> => {
    if (!user) return false;
    return roles.includes(role);
  };

  // Raccourci pour hasRole('admin'), utilisé par les gardes de routes admin.
  const isAdmin = async (): Promise<boolean> => {
    return hasRole('admin');
  };

  const value = {
    user,
    session,
    loading,
    roles,
    signOut,
    hasRole,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook consommé par toute page/composant ayant besoin de user/session/roles
// ou de signOut/hasRole/isAdmin ; lève une erreur explicite si utilisé hors
// d'un <AuthProvider> (bug d'intégration, pas un cas à gérer silencieusement).
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
