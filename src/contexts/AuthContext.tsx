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

          // Si pas de rôle et qu'on n'est pas déjà sur la page de complétion ou d'évaluation
          // Allow new users to reach /learning-assessment before redirecting to /complete-profile
          if (!roleData?.role && !window.location.pathname.includes('/complete-profile') && !window.location.pathname.includes('/auth') && !window.location.pathname.includes('/learning-assessment')) {
            window.location.href = '/complete-profile';
          }

          // Rediriger les pédagos vers /liste-cours s'ils arrivent sur /complete-profile
          if (roleData?.role === 'pedago' && window.location.pathname.includes('/complete-profile')) {
            window.location.href = '/liste-cours';
          }

          // Rediriger les élèves sans évaluation vers le jeu d'apprentissage
          if (roleData?.role === 'student' && !window.location.pathname.includes('/learning-assessment') && !window.location.pathname.includes('/complete-profile') && !window.location.pathname.includes('/auth')) {
            const { data: styleData } = await supabase
              .from('learning_styles')
              .select('id')
              .eq('user_id', session.user.id)
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
