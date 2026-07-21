import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

type AppRole = 'admin' | 'parent' | 'student' | 'pedago' | 'teacher' | 'etablissement';

// Page d'accueil de chaque rôle, utilisée pour rediriger un utilisateur non autorisé
// vers SON espace plutôt que vers un /dashboard générique qui peut lui-même lui être
// interdit (ex: un enseignant ou un établissement y rebondirait indéfiniment).
const ROLE_HOME: Record<AppRole, string> = {
  admin: '/dashboard',
  pedago: '/liste-cours',
  parent: '/parent-dashboard',
  teacher: '/teacher-dashboard',
  etablissement: '/etablissement-dashboard',
  student: '/cours/math',
};

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: AppRole;
  allowedRoles?: AppRole[];
  requireAdmin?: boolean;
  blockAdmin?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole,
  allowedRoles,
  requireAdmin = false,
  blockAdmin = false
}: ProtectedRouteProps) {
  const { user, loading, roles, hasRole, isAdmin } = useAuth();
  const location = useLocation();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAuthorization() {
      if (loading) return;

      if (!user) {
        setAuthorized(false);
        return;
      }

      // Check if admin should be blocked from this route
      if (blockAdmin) {
        const isUserAdmin = await isAdmin();
        if (isUserAdmin) {
          setAuthorized(false);
          return;
        }
      }

      // If no specific requirements, user is authorized
      if (!requiredRole && !requireAdmin && (!allowedRoles || allowedRoles.length === 0)) {
        setAuthorized(true);
        return;
      }

      // Check admin requirement
      if (requireAdmin) {
        const isUserAdmin = await isAdmin();
        setAuthorized(isUserAdmin);
        return;
      }

      // Check role requirement
      if (requiredRole) {
        const hasRequiredRole = await hasRole(requiredRole);
        setAuthorized(hasRequiredRole);
        return;
      }

      // Check any allowed role
      if (allowedRoles && allowedRoles.length > 0) {
        const checks = await Promise.all(allowedRoles.map((r) => hasRole(r)));
        setAuthorized(checks.some(Boolean));
        return;
      }

      setAuthorized(true);
    }

    checkAuthorization();
  }, [user, loading, requiredRole, requireAdmin, blockAdmin, allowedRoles, hasRole, isAdmin]);

  // Show loading spinner while checking auth
  if (loading || authorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Vérification des autorisations...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Redirect to admin/not-authorized user's own space instead of a generic /dashboard
  // that they may not even be allowed into (e.g. teacher/etablissement roles).
  if (!authorized) {
    const ownHome = (Object.keys(ROLE_HOME) as AppRole[]).find((r) => roles.includes(r));
    return <Navigate to={ownHome ? ROLE_HOME[ownHome] : '/dashboard'} replace />;
  }

  // Render children if authorized
  return <>{children}</>;
}
