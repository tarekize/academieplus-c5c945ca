import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  hasRole: (role: 'admin' | 'parent' | 'student' | 'pedago') => Promise<boolean>;
  isAdmin: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Vérifier si l'utilisateur SSO a besoin de compléter son profil
      if (session?.user) {
        setTimeout(async () => {
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

          // Rediriger les élèves vers /liste-cours après connexion (depuis auth ou page d'accueil)
          if (roleData?.role === 'student' &&
            (currentPath.includes('/auth') || currentPath === '/')) {
            window.location.href = '/liste-cours';
            return;
          }

          // Rediriger les élèves sans évaluation vers le jeu d'apprentissage
          if (roleData?.role === 'student' && !currentPath.includes('/learning-assessment') && !currentPath.includes('/complete-profile') && !currentPath.includes('/auth')) {
            const { data: styleData } = await supabase
              .from('student_scores')
              .select('id')
              .eq('user_id', session.user.id)
              .is('lesson_id', null)
              .maybeSingle();

            if (!styleData) {
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

  const hasRole = async (role: 'admin' | 'parent' | 'student' | 'pedago'): Promise<boolean> => {
    if (!user) return false;

    const { data, error } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: role,
    });

    if (error) {
      console.error('Error checking role:', error);
      return false;
    }

    return Boolean(data);
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
