import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'parent' | 'student' | 'pedago';
  requireAdmin?: boolean;
  blockAdmin?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole,
  requireAdmin = false,
  blockAdmin = false
}: ProtectedRouteProps) {
  const { user, loading, hasRole, isAdmin } = useAuth();
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
      if (!requiredRole && !requireAdmin) {
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

      setAuthorized(true);
    }

    checkAuthorization();
  }, [user, loading, requiredRole, requireAdmin, blockAdmin, hasRole, isAdmin]);

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

  // Redirect to dashboard if admin is blocked or not authorized
  if (!authorized) {
    return <Navigate to="/dashboard" replace />;
  }

  // Render children if authorized
  return <>{children}</>;
}
