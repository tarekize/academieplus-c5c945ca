import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, GraduationCap, Search, LogOut, User as UserIcon, BarChart3, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChangePasswordButton } from "@/components/ChangePasswordButton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  school_level: string | null;
  email: string | null;
}

interface ScoreEntry {
  date: string;
  level: number;
  accuracy: number;
  lesson: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [progressData, setProgressData] = useState<ScoreEntry[]>([]);
  const [overallStats, setOverallStats] = useState({ avgLevel: 0, totalAnswers: 0, avgAccuracy: 0 });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate('/auth'); return; }
      setUser(session.user);
      fetchProfile(session.user.id);
      fetchUserRole(session.user.id);
      fetchProgressData(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { navigate('/auth'); return; }
      setUser(session.user);
      fetchProfile(session.user.id);
      fetchUserRole(session.user.id);
      fetchProgressData(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, school_level, email')
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

  const fetchProgressData = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('student_scores')
        .select('current_level, accuracy_rate, total_answers, updated_at, lesson_id')
        .eq('user_id', userId)
        .order('updated_at', { ascending: true });

      if (data && data.length > 0) {
        const entries: ScoreEntry[] = data.map(d => ({
          date: new Date(d.updated_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
          level: d.current_level,
          accuracy: Number(d.accuracy_rate),
          lesson: d.lesson_id || '',
        }));
        setProgressData(entries);

        const avgLevel = Math.round(data.reduce((s, d) => s + d.current_level, 0) / data.length);
        const totalAnswers = data.reduce((s, d) => s + d.total_answers, 0);
        const avgAccuracy = Math.round(data.reduce((s, d) => s + Number(d.accuracy_rate), 0) / data.length);
        setOverallStats({ avgLevel, totalAnswers, avgAccuracy });
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    }
  };

  const getFullName = (profile: Profile | null): string => {
    if (!profile) return "Utilisateur";
    const parts = [profile.first_name, profile.last_name].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "Utilisateur";
  };

  const getSchoolLevelName = (level: string) => {
    const levels: Record<string, string> = {
      cp: 'CP', ce1: 'CE1', ce2: 'CE2', cm1: 'CM1', cm2: 'CM2',
      sixieme: '6ème', cinquieme: '5ème', quatrieme: '4ème', troisieme: '3ème',
      seconde: 'Seconde', premiere: 'Première', terminale: 'Terminale'
    };
    return levels[level] || level;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Déconnexion", description: "Vous avez été déconnecté avec succès" });
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const fullName = getFullName(profile);
  const isAdmin = userRole === 'admin';
  const isStudent = userRole === 'student';

  return (
    <div className="min-h-screen bg-background">
      {/* Custom Header for Dashboard */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div 
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={() => navigate("/liste-cours")}
            >
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">AcadémiePlus</span>
            </div>

            <div className="flex-1 max-w-xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Rechercher un cours, une matière..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {!isAdmin && (
                <Button 
                  variant="destructive"
                  className="font-semibold"
                  onClick={() => navigate("/pricing")}
                >
                  Passer Premium
                </Button>
              )}

              <div className="flex items-center gap-3">
                <ChangePasswordButton />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-2 cursor-pointer hover:bg-accent rounded-lg p-2 transition-colors">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback>{fullName.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="text-left hidden md:block">
                        <p className="text-sm font-medium">{fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          {isAdmin ? 'Administrateur' : profile?.school_level && getSchoolLevelName(profile.school_level)}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {!isAdmin && (
                      <DropdownMenuItem onClick={() => navigate("/account")}>
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Gérer mon compte</span>
                      </DropdownMenuItem>
                    )}
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <Users className="mr-2 h-4 w-4" />
                        <span>Gestion Utilisateurs</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Se déconnecter</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Bonjour {fullName} 👋</h1>
            <p className="text-muted-foreground">
              {isAdmin ? "Bienvenue sur votre espace d'administration" : "Bienvenue sur votre tableau de bord"}
            </p>
          </div>

          {/* Student Progress Chart */}
          {isStudent && progressData.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  تطور مستواك - Votre progression
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Stats summary */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 rounded-lg bg-primary/5">
                    <p className="text-2xl font-bold text-primary">{overallStats.avgLevel}%</p>
                    <p className="text-xs text-muted-foreground">Niveau moyen</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-green-500/5">
                    <p className="text-2xl font-bold text-green-600">{overallStats.avgAccuracy}%</p>
                    <p className="text-xs text-muted-foreground">Précision moyenne</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-accent/10">
                    <p className="text-2xl font-bold text-accent-foreground">{overallStats.totalAnswers}</p>
                    <p className="text-xs text-muted-foreground">Total réponses</p>
                  </div>
                </div>

                {/* Chart */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis domain={[0, 100]} className="text-xs" />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Line type="monotone" dataKey="level" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} name="Niveau" />
                      <Line type="monotone" dataKey="accuracy" stroke="hsl(142, 76%, 36%)" strokeWidth={2} dot={{ r: 3 }} name="Précision %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userRole === 'parent' && (
              <Card 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate("/mes-informations")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Mes Enfants
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Suivez la progression de vos enfants</p>
                </CardContent>
              </Card>
            )}

            {isAdmin && (
              <>
                <Card 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate("/admin")}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Gestion Utilisateurs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Gérez les utilisateurs de la plateforme</p>
                  </CardContent>
                </Card>

                <Card 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate("/analytics")}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Consultez les statistiques d'utilisation</p>
                  </CardContent>
                </Card>
              </>
            )}

            <Card 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate("/liste-cours")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  {isAdmin ? "Voir les Cours" : "Mes Cours"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {isAdmin ? "Consultez les cours par niveau" : "Accédez à vos cours et leçons"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
