import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserCircle, BarChart3, ArrowLeft, GraduationCap, LogOut, User as UserIcon, Key, Pause, Play, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { ChangePasswordButton } from "@/components/ChangePasswordButton";

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

  // Activation code state
  const [activationCode, setActivationCode] = useState("");
  const [activating, setActivating] = useState(false);
  const [subscription, setSubscription] = useState<StudentSubscription | null>(null);

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

  const handleActivateCode = async () => {
    if (!activationCode.trim() || !user) return;
    setActivating(true);

    try {
      // Find the code
      const { data: codeData, error: codeErr } = await supabase
        .from("activation_codes")
        .select("*")
        .eq("code", activationCode.trim().toUpperCase())
        .eq("status", "free")
        .single();

      if (codeErr || !codeData) {
        toast({ title: "Code invalide", description: "Ce code n'existe pas ou a déjà été utilisé.", variant: "destructive" });
        setActivating(false);
        return;
      }

      // Mark code as used
      await supabase
        .from("activation_codes")
        .update({ status: "used", used_by: user.id, used_at: new Date().toISOString() })
        .eq("id", (codeData as any).id);

      // Create student subscription
      const totalDays = (codeData as any).plan_type === "annual" ? 360 : 30;
      await supabase.from("student_subscriptions").insert({
        user_id: user.id,
        activation_code_id: (codeData as any).id,
        plan_type: (codeData as any).plan_type,
        total_days: totalDays,
        days_used: 0,
        is_paused: false,
        started_at: new Date().toISOString(),
        last_tick_at: new Date().toISOString(),
      });

      toast({ title: "Abonnement activé avec succès !", description: `Vous avez ${totalDays} jours de crédit.` });
      setActivationCode("");
      fetchSubscription(user.id);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setActivating(false);
    }
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
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div 
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={() => navigate(isParent ? "/dashboard" : "/liste-cours")}
            >
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">AcadémiePlus</span>
            </div>

            <div className="flex items-center gap-3">
              <ChangePasswordButton />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer hover:bg-accent/10 rounded-lg p-2 transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback>{fullName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="text-left hidden md:block">
                      <p className="text-sm font-medium">{fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {profile?.school_level && getSchoolLevelName(profile.school_level)}
                      </p>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate("/account")}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Gérer mon compte</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(isParent ? "/parent-dashboard" : "/dashboard")}>
                    <GraduationCap className="mr-2 h-4 w-4" />
                    <span>Tableau de bord</span>
                  </DropdownMenuItem>
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
      </header>

      <main className="container mx-auto px-4 py-8 mt-20">
        {!isParent && (
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => navigate("/liste-cours")} className="cursor-pointer flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Retour vers liste des matières
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        )}

        <div className="max-w-6xl mx-auto">
          {/* Profile Photo and Title */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <Avatar className="h-32 w-32 border-4 border-primary">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="text-4xl">{fullName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            <h1 className="text-4xl font-bold mb-2">Gérer mon compte</h1>
            <p className="text-muted-foreground text-lg">{fullName}</p>
            <p className="text-muted-foreground text-sm">{profile?.email}</p>
          </div>

          {/* Account Management Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {accountCards.map((card, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-all cursor-pointer hover:scale-105"
                onClick={card.onClick}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <card.icon className={`h-6 w-6 ${card.color}`} />
                    <span>{card.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{card.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Student: Activate Subscription Section */}
          {isStudent && (
            <Card className="max-w-xl mx-auto p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Key className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Activer l'abonnement</h2>
              </div>

              {subscription ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Formule</p>
                      <p className="font-semibold text-foreground">
                        {subscription.plan_type === "annual" ? "Scolaire (1 an)" : "Mensuelle"}
                      </p>
                    </div>
                    <Badge variant={subscription.is_paused ? "secondary" : "default"}>
                      {subscription.is_paused ? "En pause" : "Actif"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-foreground">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{remaining} jours restants</span>
                    <span className="text-muted-foreground">/ {subscription.total_days} jours</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-secondary rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (remaining / subscription.total_days) * 100)}%` }}
                    />
                  </div>

                  {/* Pause/Resume button - only for annual */}
                  {subscription.plan_type === "annual" && remaining > 0 && (
                    <Button
                      variant={subscription.is_paused ? "default" : "outline"}
                      className="w-full"
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
                  <p className="text-sm text-muted-foreground">
                    Entrez le code d'activation fourni par votre parent pour activer votre abonnement.
                  </p>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Ex: A1B2C3D4"
                      value={activationCode}
                      onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                      className="font-mono text-lg tracking-widest"
                      maxLength={8}
                    />
                    <Button onClick={handleActivateCode} disabled={activating || !activationCode.trim()}>
                      {activating ? "Activation..." : "Activer"}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Account;
