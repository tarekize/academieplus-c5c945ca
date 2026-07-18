import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Users, GraduationCap, BarChart3, CreditCard, FileText, Cpu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import StudentDashboardContent from "@/components/dashboard/StudentDashboardContent";
import DashboardTile from "@/components/dashboard/DashboardTile";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { BottomNav } from "@/components/layout/BottomNav";
import { AppHeader } from "@/components/layout/AppHeader";

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  school_level: string | null;
  filiere: string | null;
  email: string | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate('/auth'); return; }
      setUser(session.user);
      fetchProfile(session.user.id);
      fetchUserRole(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { navigate('/auth'); return; }
      setUser(session.user);
      fetchProfile(session.user.id);
      fetchUserRole(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, school_level, filiere, email')
        .eq('id', userId)
        .single();
      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRole = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();
      if (data) setUserRole(data.role);
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  const getFullName = (p: Profile | null): string => {
    if (!p) return t("dashboard.user");
    const parts = [p.first_name, p.last_name].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : t("dashboard.user");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[image:var(--gradient-primary)] flex items-center justify-center shadow-[var(--shadow-elegant)]">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    );
  }

  const fullName = getFullName(profile);
  const isAdmin = userRole === 'admin';
  const isStudent = userRole === 'student';

  return (
    <div className={cn("min-h-screen", isStudent ? "student-shell" : "bg-background")}>
      <AppHeader />

      <main className={cn("container mx-auto px-4 pt-6", isStudent ? "pb-28" : "pb-12")}>
        <div className="max-w-7xl mx-auto">
          {/* Student Dashboard */}
          {isStudent && user && profile && (
            <StudentDashboardContent userId={user.id} profile={profile} />
          )}

          {/* Admin / Other roles */}
          {!isStudent && (
            <>
              {/* Welcome banner */}
              <div className="relative overflow-hidden mb-8 rounded-3xl bg-[image:var(--gradient-primary)] px-6 py-7 sm:px-8 sm:py-8 text-primary-foreground shadow-[var(--shadow-elegant)]">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden />
                <div className="absolute right-6 bottom-0 h-20 w-20 rounded-full bg-white/10" aria-hidden />
                <div className="relative">
                  <p className="text-primary-foreground/75 text-sm font-medium uppercase tracking-wide">
                    {isAdmin ? t("dashboard.adminSpace") : t("nav.dashboard")}
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-bold mt-1">{t("dashboard.hello", { name: fullName })}</h1>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userRole === 'parent' && (
                  <DashboardTile
                    icon={Users}
                    iconBg="bg-blue-500/10"
                    iconText="text-blue-600"
                    title={t("dashboard.myChildren")}
                    description={t("dashboard.myChildrenDesc")}
                    onClick={() => navigate("/mes-informations")}
                  />
                )}
                {isAdmin && (
                  <>
                    <DashboardTile
                      icon={Users}
                      iconBg="bg-primary/10"
                      iconText="text-primary"
                      title={t("dashboard.userManagement")}
                      description={t("dashboard.userManagementDesc")}
                      onClick={() => navigate("/admin")}
                    />
                    <DashboardTile
                      icon={BarChart3}
                      iconBg="bg-amber/10"
                      iconText="text-amber"
                      title={t("dashboard.analytics")}
                      description={t("dashboard.analyticsDesc")}
                      onClick={() => navigate("/analytics")}
                    />
                    <DashboardTile
                      icon={CreditCard}
                      iconBg="bg-emerald-500/10"
                      iconText="text-emerald-600"
                      title={t("dashboard.subscriptions")}
                      description={t("dashboard.subscriptionsDesc")}
                      onClick={() => navigate("/admin/abonnements")}
                    />
                    <DashboardTile
                      icon={FileText}
                      iconBg="bg-indigo-500/10"
                      iconText="text-indigo-600"
                      title={t("dashboard.contracts")}
                      description={t("dashboard.contractsDesc")}
                      onClick={() => navigate("/admin/contrats")}
                    />
                    <DashboardTile
                      icon={Cpu}
                      iconBg="bg-teal-500/10"
                      iconText="text-teal-600"
                      title={t("dashboard.aiUsage")}
                      description={t("dashboard.aiUsageDesc")}
                      onClick={() => navigate("/admin/token-usage")}
                    />
                  </>
                )}
                <DashboardTile
                  icon={GraduationCap}
                  iconBg="bg-purple-500/10"
                  iconText="text-purple-600"
                  title={isAdmin ? t("dashboard.viewCourses") : t("dashboard.myCourses")}
                  description={isAdmin ? t("dashboard.viewCoursesDesc") : t("dashboard.myCoursesDesc")}
                  onClick={() => navigate("/liste-cours")}
                />
              </div>
            </>
          )}
        </div>
      </main>
      {isStudent && <BottomNav />}
    </div>
  );
};

export default Dashboard;
