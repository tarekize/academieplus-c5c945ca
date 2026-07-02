import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
              <div className="mb-8 rounded-2xl bg-[image:var(--gradient-primary)] px-6 py-5 text-primary-foreground shadow-[var(--shadow-elegant)]">
                <p className="text-primary-foreground/70 text-sm font-medium">
                  {isAdmin ? "Espace Administration" : "Tableau de bord"}
                </p>
                <h1 className="text-2xl font-bold mt-0.5">Bonjour, {fullName} 👋</h1>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userRole === 'parent' && (
                  <div
                    className="group bg-card rounded-2xl border border-border/50 p-6 cursor-pointer hover:shadow-lg hover:border-blue-200 transition-all duration-200"
                    onClick={() => navigate("/mes-informations")}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors flex-shrink-0">
                        <Users className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Mes Enfants</h3>
                        <p className="text-sm text-muted-foreground">Suivez la progression de vos enfants</p>
                      </div>
                    </div>
                  </div>
                )}
                {isAdmin && (
                  <>
                    <div
                      className="group bg-card rounded-2xl border border-border/50 p-6 cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all duration-200"
                      onClick={() => navigate("/admin")}
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors flex-shrink-0">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Gestion Utilisateurs</h3>
                          <p className="text-sm text-muted-foreground">Gérez les utilisateurs de la plateforme</p>
                        </div>
                      </div>
                    </div>
                    <div
                      className="group bg-card rounded-2xl border border-border/50 p-6 cursor-pointer hover:shadow-lg hover:border-orange-200 transition-all duration-200"
                      onClick={() => navigate("/analytics")}
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors flex-shrink-0">
                          <BarChart3 className="h-6 w-6 text-orange-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Analytics</h3>
                          <p className="text-sm text-muted-foreground">Consultez les statistiques d'utilisation</p>
                        </div>
                      </div>
                    </div>
                    <div
                      className="group bg-card rounded-2xl border border-border/50 p-6 cursor-pointer hover:shadow-lg hover:border-green-200 transition-all duration-200"
                      onClick={() => navigate("/admin/abonnements")}
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-green-500/10 group-hover:bg-green-500/20 transition-colors flex-shrink-0">
                          <CreditCard className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Abonnements</h3>
                          <p className="text-sm text-muted-foreground">Configurez les tarifs et paiements</p>
                        </div>
                      </div>
                    </div>
                    <div
                      className="group bg-card rounded-2xl border border-border/50 p-6 cursor-pointer hover:shadow-lg hover:border-indigo-200 transition-all duration-200"
                      onClick={() => navigate("/admin/contrats")}
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors flex-shrink-0">
                          <FileText className="h-6 w-6 text-indigo-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Contrats</h3>
                          <p className="text-sm text-muted-foreground">Gérez les contrats établissements, élèves et parents</p>
                        </div>
                      </div>
                    </div>
                    <div
                      className="group bg-card rounded-2xl border border-border/50 p-6 cursor-pointer hover:shadow-lg hover:border-teal-200 transition-all duration-200"
                      onClick={() => navigate("/admin/token-usage")}
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-teal-500/10 group-hover:bg-teal-500/20 transition-colors flex-shrink-0">
                          <Cpu className="h-6 w-6 text-teal-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Consommation IA</h3>
                          <p className="text-sm text-muted-foreground">Estimation de l'usage de tokens par groupe</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                <div
                  className="group bg-card rounded-2xl border border-border/50 p-6 cursor-pointer hover:shadow-lg hover:border-purple-200 transition-all duration-200"
                  onClick={() => navigate("/liste-cours")}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors flex-shrink-0">
                      <GraduationCap className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{isAdmin ? "Voir les Cours" : "Mes Cours"}</h3>
                      <p className="text-sm text-muted-foreground">{isAdmin ? "Consultez les cours par niveau" : "Accédez à vos cours et leçons"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
