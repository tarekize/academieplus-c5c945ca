import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, GraduationCap, LogOut, User as UserIcon, BarChart3, CreditCard, FileText, Cpu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChangePasswordButton } from "@/components/ChangePasswordButton";
import StudentDashboardContent from "@/components/dashboard/StudentDashboardContent";
import DashboardTile from "@/components/dashboard/DashboardTile";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useTranslation } from "react-i18next";

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
    if (!p) return "Utilisateur";
    const parts = [p.first_name, p.last_name].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "Utilisateur";
  };

  const getSchoolLevelName = (level: string) => {
    const levels: Record<string, string> = {
      "5eme_primaire": "5ème Primaire", "1ere_cem": "1ère CEM", "2eme_cem": "2ème CEM",
      "3eme_cem": "3ème CEM", "4eme_cem": "4ème CEM", premiere: "Première",
      seconde: "Seconde", terminale: "Terminale",
    };
    return levels[level] || level;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border/60 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate("/liste-cours")}>
              <div className="w-9 h-9 rounded-xl bg-[image:var(--gradient-primary)] flex items-center justify-center shadow-sm flex-shrink-0">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold hidden sm:block">AcadémiePlus</span>
            </div>


            {/* Right actions */}
            <div className="flex items-center gap-2">
              <ChangePasswordButton />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer rounded-xl px-2 py-1.5 hover:bg-muted transition-colors">
                    <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                        {fullName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left hidden md:block">
                      <p className="text-sm font-semibold leading-tight">{fullName}</p>
                      <p className="text-xs text-muted-foreground leading-tight">
                        {isAdmin ? 'Administrateur' : profile?.school_level && getSchoolLevelName(profile.school_level)}
                      </p>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-lg border-border/50">
                  {!isAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/account")} className="rounded-lg cursor-pointer">
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Gérer mon compte</span>
                    </DropdownMenuItem>
                  )}
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/admin")} className="rounded-lg cursor-pointer">
                      <Users className="mr-2 h-4 w-4" />
                      <span>Gestion Utilisateurs</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive rounded-lg cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Se déconnecter</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-20 pb-12">
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
                    {isAdmin ? "Espace Administration" : "Tableau de bord"}
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-bold mt-1">Bonjour, {fullName} 👋</h1>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userRole === 'parent' && (
                  <DashboardTile
                    icon={Users}
                    iconBg="bg-blue-500/10"
                    iconText="text-blue-600"
                    title="Mes Enfants"
                    description="Suivez la progression de vos enfants"
                    onClick={() => navigate("/mes-informations")}
                  />
                )}
                {isAdmin && (
                  <>
                    <DashboardTile
                      icon={Users}
                      iconBg="bg-primary/10"
                      iconText="text-primary"
                      title="Gestion Utilisateurs"
                      description="Gérez les utilisateurs de la plateforme"
                      onClick={() => navigate("/admin")}
                    />
                    <DashboardTile
                      icon={BarChart3}
                      iconBg="bg-orange-500/10"
                      iconText="text-orange-600"
                      title="Analytics"
                      description="Consultez les statistiques d'utilisation"
                      onClick={() => navigate("/analytics")}
                    />
                    <DashboardTile
                      icon={CreditCard}
                      iconBg="bg-emerald-500/10"
                      iconText="text-emerald-600"
                      title="Abonnements"
                      description="Configurez les tarifs et paiements"
                      onClick={() => navigate("/admin/abonnements")}
                    />
                    <DashboardTile
                      icon={FileText}
                      iconBg="bg-indigo-500/10"
                      iconText="text-indigo-600"
                      title="Contrats"
                      description="Gérez les contrats établissements, élèves et parents"
                      onClick={() => navigate("/admin/contrats")}
                    />
                    <DashboardTile
                      icon={Cpu}
                      iconBg="bg-teal-500/10"
                      iconText="text-teal-600"
                      title="Consommation IA"
                      description="Estimation de l'usage de tokens par groupe"
                      onClick={() => navigate("/admin/token-usage")}
                    />
                  </>
                )}
                <DashboardTile
                  icon={GraduationCap}
                  iconBg="bg-purple-500/10"
                  iconText="text-purple-600"
                  title={isAdmin ? "Voir les Cours" : "Mes Cours"}
                  description={isAdmin ? "Consultez les cours par niveau" : "Accédez à vos cours et leçons"}
                  onClick={() => navigate("/liste-cours")}
                />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
