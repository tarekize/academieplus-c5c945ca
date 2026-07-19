import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  hasRole: (role: 'admin' | 'parent' | 'student' | 'pedago' | 'teacher' | 'etablissement') => Promise<boolean>;
  isAdmin: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setRoles(session?.user ? await fetchRoles(session.user.id) : []);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Only re-fetch roles on an actual sign-in/out, not on every event this
      // listener sees (e.g. TOKEN_REFRESHED fires roughly hourly for the same
      // user) — refetching there would just repeat the same query for nothing.
      // `loading` stays true until roles resolve so hasRole()/isAdmin() never
      // read a stale empty cache right after a fresh sign-in.
      if (_event === 'SIGNED_OUT') {
        setRoles([]);
        setLoading(false);
      } else if (session?.user && (_event === 'SIGNED_IN' || _event === 'INITIAL_SESSION' || _event === 'USER_UPDATED')) {
        fetchRoles(session.user.id).then((r) => {
          setRoles(r);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }

      // Vérifier si l'utilisateur SSO a besoin de compléter son profil
      if (session?.user) {
        setTimeout(async () => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('is_active')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileData && profileData.is_active === false) {
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

          // Rediriger admin et pédago vers /liste-cours après connexion
          if ((roleData?.role === 'pedago' || roleData?.role === 'admin') &&
            (currentPath.includes('/complete-profile') || currentPath.includes('/auth') || currentPath === '/')) {
            window.location.href = '/liste-cours';
            return;
          }

          // Rediriger les parents vers /parent-dashboard après connexion
          // Inclure /liste-cours et /cours pour éviter qu'ils soient redirigés vers l'espace élève
          if (roleData?.role === 'parent' &&
            (currentPath.includes('/complete-profile') || currentPath.includes('/auth') || currentPath === '/' || currentPath.includes('/liste-cours') || currentPath.startsWith('/cours'))) {
            window.location.href = '/parent-dashboard';
            return;
          }

          // Rediriger les enseignants vers /teacher-dashboard après connexion
          if (roleData?.role === 'teacher' &&
            (currentPath.includes('/complete-profile') || currentPath.includes('/auth') || currentPath === '/' || currentPath.includes('/liste-cours') || currentPath.startsWith('/cours'))) {
            window.location.href = '/teacher-dashboard';
            return;
          }

          // Rediriger les établissements vers /etablissement-dashboard après connexion
          if (roleData?.role === 'etablissement' &&
            (currentPath.includes('/complete-profile') || currentPath.includes('/auth') || currentPath === '/')) {
            window.location.href = '/etablissement-dashboard';
            return;
          }

          // Rediriger les élèves vers /cours/math après connexion par défaut
          if (roleData?.role === 'student' &&
            (currentPath.includes('/auth') || currentPath === '/')) {
            window.location.href = '/cours/math';
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

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const hasRole = async (role: 'admin' | 'parent' | 'student' | 'pedago' | 'teacher' | 'etablissement'): Promise<boolean> => {
    if (!user) return false;
    return roles.includes(role);
  };

  const isAdmin = async (): Promise<boolean> => {
    return hasRole('admin');
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    hasRole,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
