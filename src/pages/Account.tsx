import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserCircle, BarChart3, ArrowLeft, GraduationCap, LogOut, User as UserIcon, Key, Pause, Play, Clock, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChangePasswordButton } from "@/components/ChangePasswordButton";
import JoinClassDialog from "@/components/student/JoinClassDialog";

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  school_level: string | null;
  email: string | null;
}

interface StudentSubscription {
  id: string;
  plan_type: string;
  total_days: number;
  days_used: number;
  is_paused: boolean;
  paused_at: string | null;
  started_at: string;
  last_tick_at: string;
}

const Account = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { hasRole } = useAuth();
  const [isParent, setIsParent] = useState(false);
  const [isStudent, setIsStudent] = useState(false);

  const [subscription, setSubscription] = useState<StudentSubscription | null>(null);
  const [activationCode, setActivationCode] = useState("");
  const [activatingCode, setActivatingCode] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      fetchProfile(session.user.id);
      hasRole('parent').then(setIsParent);
      hasRole('student').then(setIsStudent);
      fetchSubscription(session.user.id);
    });

    const {
      data: { subscription: authSub },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      fetchProfile(session.user.id);
      hasRole('parent').then(setIsParent);
      hasRole('student').then(setIsStudent);
      fetchSubscription(session.user.id);
    });

    return () => authSub.unsubscribe();
  }, [navigate, hasRole]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, avatar_url, school_level, email")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscription = async (userId: string) => {
    const { data } = await supabase
      .from("student_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      setSubscription(data[0] as any);
    }
  };

  const getRemainingDays = (sub: StudentSubscription): number => {
    if (sub.is_paused) {
      return Math.max(0, sub.total_days - Number(sub.days_used));
    }
    // Calculate elapsed since last_tick_at
    const now = new Date();
    const lastTick = new Date(sub.last_tick_at);
    const elapsedDays = (now.getTime() - lastTick.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, sub.total_days - Number(sub.days_used) - elapsedDays);
  };

  const handlePause = async () => {
    if (!subscription || !user) return;
    // Update days_used with elapsed time since last_tick
    const now = new Date();
    const lastTick = new Date(subscription.last_tick_at);
    const elapsed = (now.getTime() - lastTick.getTime()) / (1000 * 60 * 60 * 24);
    const newDaysUsed = Number(subscription.days_used) + elapsed;

    await supabase
      .from("student_subscriptions")
      .update({
        is_paused: true,
        paused_at: now.toISOString(),
        days_used: newDaysUsed,
        last_tick_at: now.toISOString(),
      })
      .eq("id", subscription.id);

    toast({ title: "Abonnement mis en pause", description: "Le décompte de vos jours est suspendu." });
    fetchSubscription(user.id);
  };

  const handleResume = async () => {
    if (!subscription || !user) return;

    await supabase
      .from("student_subscriptions")
      .update({
        is_paused: false,
        paused_at: null,
        last_tick_at: new Date().toISOString(),
      })
      .eq("id", subscription.id);

    toast({ title: "Abonnement réactivé", description: "Le décompte de vos jours reprend." });
    fetchSubscription(user.id);
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
    return levels[level] || 'Votre classe';
  };

  const handleActivateCode = async () => {
    if (!activationCode.trim() || !user) return;
    setActivatingCode(true);
    try {
      // Find the code
      const { data: codeData, error: codeError } = await supabase
        .from("activation_codes")
        .select("*")
        .eq("code", activationCode.trim())
        .eq("status", "free")
        .maybeSingle();

      if (codeError) throw codeError;
      if (!codeData) {
        toast({ title: "Code invalide", description: "Ce code n'existe pas ou a déjà été utilisé.", variant: "destructive" });
        return;
      }

      const now = new Date().toISOString();
      const totalDays = codeData.plan_type === "annual" ? 360 : 30;

      // Mark code as used
      await supabase
        .from("activation_codes")
        .update({ status: "used", used_by: user.id, used_at: now })
        .eq("id", codeData.id);

      // Create subscription
      await supabase.from("student_subscriptions").insert({
        user_id: user.id,
        plan_type: codeData.plan_type,
        total_days: totalDays,
        activation_code_id: codeData.id,
      });

      // Activate profile
      await supabase.from("profiles").update({ is_active: true }).eq("id", user.id);

      toast({ title: "Code activé !", description: "Votre abonnement a été activé avec succès." });
      setActivationCode("");
      fetchSubscription(user.id);
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setActivatingCode(false);
    }
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

  // Student cards: only personal info + stats + activate
  const studentCards = [
    {
      title: "Mes Informations",
      description: "Gérer mes informations personnelles",
      icon: UserCircle,
      color: "text-blue-600",
      onClick: () => navigate("/mes-informations"),
    },
    {
      title: "Les abonnements",
      description: "Gérer mes abonnements et plans",
      icon: Key,
      color: "text-purple-600",
      onClick: () => navigate("/abonnements"),
    },
    {
      title: "Facturation",
      description: "Consulter et télécharger mes factures",
      icon: FileText,
      color: "text-emerald-600",
      onClick: () => navigate("/factures"),
    },
    {
      title: "Mes statistiques",
      description: "Voir mes statistiques d'apprentissage",
      icon: BarChart3,
      color: "text-indigo-600",
      onClick: () => toast({ title: "Mes statistiques", description: "Section en cours de développement" }),
    },
  ];

  // Parent cards: full set
  const parentCards = [
    {
      title: "Mes Informations",
      description: "Gérer mes informations personnelles",
      icon: UserCircle,
      color: "text-blue-600",
      onClick: () => navigate("/mes-informations"),
    },
    {
      title: "Les abonnements",
      description: "Gérer mes abonnements et plans",
      icon: Key,
      color: "text-purple-600",
      onClick: () => navigate("/abonnements"),
    },
    {
      title: "Facturation",
      description: "Consulter et télécharger mes factures",
      icon: FileText,
      color: "text-emerald-600",
      onClick: () => navigate("/factures"),
    },
    {
      title: "Mes statistiques",
      description: "Voir mes statistiques d'apprentissage",
      icon: BarChart3,
      color: "text-indigo-600",
      onClick: () => toast({ title: "Mes statistiques", description: "Section en cours de développement" }),
    },
  ];

  const accountCards = isParent ? parentCards : studentCards;

  const remaining = subscription ? Math.floor(getRemainingDays(subscription)) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate(isParent ? "/dashboard" : "/liste-cours")}
            >
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">AcadémiePlus</span>
            </div>

            <div className="flex items-center gap-3">
              <ChangePasswordButton />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 rounded-xl p-2 transition-all duration-200">
                    <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">{fullName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="text-left hidden md:block">
                      <p className="text-sm font-medium">{fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {profile?.school_level && getSchoolLevelName(profile.school_level)}
                      </p>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-border/50">
                  <DropdownMenuItem onClick={() => navigate("/account")} className="rounded-lg">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Gérer mon compte</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(isParent ? "/parent-dashboard" : "/dashboard")} className="rounded-lg">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    <span>Tableau de bord</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive rounded-lg">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Se déconnecter</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 mt-20">
        {!isParent && (
          <div className="flex gap-3 mb-8">
            <button
              onClick={() => navigate("/liste-cours")}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-primary/10 text-primary font-medium text-sm border border-primary/20 hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
              Retour vers liste des matières
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-accent/10 text-accent font-medium text-sm border border-accent/20 hover:bg-accent hover:text-white hover:border-accent hover:shadow-lg hover:shadow-accent/25 transition-all duration-300 group"
            >
              <BarChart3 className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
              Tableau de bord
            </button>
            {isStudent && <JoinClassDialog />}
          </div>
        )}
        {isParent && (
          <button
            onClick={() => navigate("/parent-dashboard")}
            className="mb-8 inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-primary/10 text-primary font-medium text-sm border border-primary/20 hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
            Retour au tableau de bord parent
          </button>
        )}

        <div className="max-w-5xl mx-auto">
          {/* Profile Hero Section */}
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/20 to-primary/5 rounded-3xl blur-xl" />
            <div className="relative bg-card/80 backdrop-blur-sm rounded-3xl border border-border/50 p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-br from-primary to-primary/50 rounded-full blur-sm opacity-60" />
                  <Avatar className="relative h-28 w-28 md:h-32 md:w-32 ring-4 ring-background shadow-2xl">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-4xl font-bold bg-primary/10 text-primary">{fullName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="text-center md:text-left flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                    {fullName}
                  </h1>
                  <p className="text-muted-foreground">{profile?.email}</p>
                  {profile?.school_level && (
                    <Badge variant="secondary" className="mt-3 rounded-full px-4 py-1">
                      <GraduationCap className="h-3.5 w-3.5 mr-1.5" />
                      {getSchoolLevelName(profile.school_level)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Account Management Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
            {accountCards.map((card, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer hover:-translate-y-1"
                onClick={card.onClick}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="relative pb-2">
                  <CardTitle className="flex items-center gap-4 text-lg">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${index === 0 ? 'from-blue-500/15 to-blue-600/5' :
                      index === 1 ? 'from-purple-500/15 to-purple-600/5' :
                        index === 2 ? 'from-emerald-500/15 to-emerald-600/5' :
                          'from-indigo-500/15 to-indigo-600/5'
                      }`}>
                      <card.icon className={`h-6 w-6 ${card.color}`} />
                    </div>
                    <span className="font-semibold">{card.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-sm text-muted-foreground ml-16">{card.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Student: Subscription Section */}
          {isStudent && (
            <Card className="max-w-2xl mx-auto rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-4 border-b border-border/30">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
                    <Key className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground">Mon Abonnement</h2>
                </div>
              </div>

              <div className="p-6">
                {subscription ? (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">Formule</p>
                        <p className="font-semibold text-foreground">
                          {subscription.plan_type === "annual" ? "Scolaire (1 an)" : "Mensuelle"}
                        </p>
                      </div>
                      <Badge
                        variant={subscription.is_paused ? "secondary" : "default"}
                        className="rounded-full px-4"
                      >
                        {subscription.is_paused ? "En pause" : "Actif"}
                      </Badge>
                    </div>

                    <div className="bg-accent/30 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-foreground">{remaining} jours restants</span>
                        <span className="text-sm text-muted-foreground">/ {subscription.total_days}</span>
                      </div>
                      <div className="w-full bg-secondary/50 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary to-primary/70 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (remaining / subscription.total_days) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {subscription.plan_type === "annual" && remaining > 0 && (
                      <Button
                        variant={subscription.is_paused ? "default" : "outline"}
                        className="w-full rounded-xl h-11"
                        onClick={subscription.is_paused ? handleResume : handlePause}
                      >
                        {subscription.is_paused ? (
                          <><Play className="h-4 w-4 mr-2" /> Reprendre l'abonnement</>
                        ) : (
                          <><Pause className="h-4 w-4 mr-2" /> Mettre en pause</>
                        )}
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center py-2">
                      <p className="text-muted-foreground text-sm mb-4">
                        Vous n'avez pas encore d'abonnement actif. Entrez votre code d'activation pour commencer.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Input
                        placeholder="XXXX-XXXX-XXXX"
                        value={activationCode}
                        onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                        className="text-center text-lg font-mono tracking-wider flex-1"
                        maxLength={14}
                        disabled={activatingCode}
                      />
                      <Button
                        onClick={handleActivateCode}
                        disabled={activatingCode || !activationCode.trim()}
                        className="rounded-xl px-6"
                      >
                        {activatingCode ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Activer"
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Format du code : XXXX-XXXX-XXXX
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Account;
