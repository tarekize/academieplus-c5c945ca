import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Home, Users, GraduationCap, BarChart3, CreditCard, FileText, Cpu, Bell,
  ClipboardCheck, History, BookOpen, UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import StudentDashboardContent from "@/components/dashboard/StudentDashboardContent";
import DashboardTile from "@/components/dashboard/DashboardTile";
import { useTranslation } from "react-i18next";
import { AppShell, type AppShellNavItem, type AppRole } from "@/components/layout/AppShell";
import { WelcomeBanner } from "@/components/layout/WelcomeBanner";

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
  const { user, roles, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [hasPendingValidation, setHasPendingValidation] = useState(false);

  // La session/les rôles viennent déjà de AuthContext (chargés une seule fois
  // par session, cf. ProtectedRoute qui garde déjà cette route) : seul le
  // profil (non exposé par le contexte) reste à charger ici.
  useEffect(() => {
    if (!user) return;
    fetchProfile(user.id);
  }, [user?.id]);

  // Pastille rouge sur la tuile "Validation" : signale à l'admin qu'un
  // pédago a du contenu (chapitre/leçon/suppression/exercice/quiz) en
  // attente de décision.
  useEffect(() => {
    if (!user || !roles.includes('admin')) return;
    supabase.rpc('admin_pending_content_items' as any).then(({ data, error }) => {
      if (!error) setHasPendingValidation(Array.isArray(data) && data.length > 0);
    });
  }, [user?.id, roles]);

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
      toast.error("Erreur", { description: error.message });
    } finally {
      setProfileLoading(false);
    }
  };

  const getFullName = (p: Profile | null): string => {
    if (!p) return t("dashboard.user");
    const parts = [p.first_name, p.last_name].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : t("dashboard.user");
  };

  if (authLoading || profileLoading) {
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
  const isAdmin = roles.includes('admin');
  const isStudent = roles.includes('student');
  const isPedago = roles.includes('pedago');

  const role: AppRole = isAdmin ? "admin" : isPedago ? "pedago" : "student";
  const initials = (fullName.match(/\S+/g) ?? [])
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "U";

  const navItems: AppShellNavItem[] = isAdmin
    ? [
        { label: t("nav.dashboard"), icon: Home, active: true, to: "/dashboard" },
        { label: t("dashboard.userManagement"), icon: Users, to: "/admin" },
        { label: t("dashboard.analytics"), icon: BarChart3, to: "/analytics" },
        { label: t("dashboard.subscriptions"), icon: CreditCard, to: "/admin/abonnements" },
        { label: t("dashboard.contracts"), icon: FileText, to: "/admin/contrats" },
        { label: t("dashboard.aiUsage"), icon: Cpu, to: "/admin/token-usage" },
        { label: t("dashboard.notifications"), icon: Bell, to: "/admin/notifications" },
        { label: t("dashboard.validation"), icon: ClipboardCheck, to: "/admin/validation" },
        { label: t("dashboard.exams"), icon: FileText, to: "/admin/examens" },
        { label: t("dashboard.viewCourses"), icon: GraduationCap, to: "/liste-matieres" },
      ]
    : isPedago
    ? [
        { label: t("nav.dashboard"), icon: Home, active: true, to: "/dashboard" },
        { label: t("dashboard.myCourses"), icon: GraduationCap, to: "/liste-matieres" },
        { label: t("dashboard.exams"), icon: FileText, to: "/pedago/examens" },
        { label: t("dashboard.activity"), icon: History, to: "/pedago/activite" },
        { label: t("editorial.title", "Espace éditorial"), icon: BookOpen, to: "/editorial" },
      ]
    : [
        { label: t("nav.dashboard"), icon: Home, active: true, to: "/dashboard" },
        { label: t("dashboard.myCourses"), icon: BookOpen, to: "/liste-matieres" },
        { label: t("dashboard.exams"), icon: FileText, to: "/exams" },
        { label: t("app.manageAccount"), icon: UserRound, to: "/account" },
      ];

  return (
    <AppShell role={role} navItems={navItems} userName={fullName} initials={initials}>
      <div className={isStudent ? undefined : "p-[26px]"}>
        {/* Student Dashboard */}
        {isStudent && user && profile && (
          <StudentDashboardContent userId={user.id} profile={profile} />
        )}

        {/* Admin / Other roles */}
        {!isStudent && (
          <>
            <WelcomeBanner
              className="mb-[22px]"
              role={role}
              title={t("dashboard.hello", { name: fullName })}
              subtitle={isAdmin ? t("dashboard.adminSpace") : t("nav.dashboard")}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.includes('parent') && (
                <DashboardTile
                  icon={Users}
                  iconBg="bg-primary/10"
                  iconText="text-primary"
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
                    iconBg="bg-violet/10"
                    iconText="text-violet"
                    title={t("dashboard.subscriptions")}
                    description={t("dashboard.subscriptionsDesc")}
                    onClick={() => navigate("/admin/abonnements")}
                  />
                  <DashboardTile
                    icon={FileText}
                    iconBg="bg-mint/10"
                    iconText="text-mint"
                    title={t("dashboard.contracts")}
                    description={t("dashboard.contractsDesc")}
                    onClick={() => navigate("/admin/contrats")}
                  />
                  <DashboardTile
                    icon={Cpu}
                    iconBg="bg-info/10"
                    iconText="text-info"
                    title={t("dashboard.aiUsage")}
                    description={t("dashboard.aiUsageDesc")}
                    onClick={() => navigate("/admin/token-usage")}
                  />
                  <DashboardTile
                    icon={Bell}
                    iconBg="bg-coral/10"
                    iconText="text-coral"
                    title={t("dashboard.notifications")}
                    description={t("dashboard.notificationsDesc")}
                    onClick={() => navigate("/admin/notifications")}
                  />
                  <DashboardTile
                    icon={ClipboardCheck}
                    iconBg="bg-orange-500/10"
                    iconText="text-orange-600"
                    title={t("dashboard.validation")}
                    description={t("dashboard.validationDesc")}
                    onClick={() => navigate("/admin/validation")}
                    showDot={hasPendingValidation}
                  />
                  <DashboardTile
                    icon={FileText}
                    iconBg="bg-rose-500/10"
                    iconText="text-rose-600"
                    title={t("dashboard.exams")}
                    description={t("dashboard.examsDescAdmin")}
                    onClick={() => navigate("/admin/examens")}
                    showDot={hasPendingValidation}
                  />
                </>
              )}
              {isPedago && (
                <>
                  <DashboardTile
                    icon={FileText}
                    iconBg="bg-rose-500/10"
                    iconText="text-rose-600"
                    title={t("dashboard.exams")}
                    description={t("dashboard.examsDescPedago")}
                    onClick={() => navigate("/pedago/examens")}
                  />
                  <DashboardTile
                    icon={History}
                    iconBg="bg-amber/10"
                    iconText="text-amber"
                    title={t("dashboard.activity")}
                    description={t("dashboard.activityDesc")}
                    onClick={() => navigate("/pedago/activite")}
                  />
                </>
              )}
              <DashboardTile
                icon={GraduationCap}
                iconBg="bg-purple-500/10"
                iconText="text-purple-600"
                title={isAdmin ? t("dashboard.viewCourses") : t("dashboard.myCourses")}
                description={isAdmin ? t("dashboard.viewCoursesDesc") : t("dashboard.myCoursesDesc")}
                onClick={() => navigate("/liste-matieres")}
              />
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
};

export default Dashboard;
