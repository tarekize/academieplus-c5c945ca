import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserCircle, BarChart3, ArrowLeft, GraduationCap, Key, Pause, Play, Clock, FileText, Loader2, AlertCircle, Sparkles, ChevronRight, MessageSquareWarning } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ChangePasswordButton } from "@/components/ChangePasswordButton";
import JoinClassDialog from "@/components/student/JoinClassDialog";
import ReclamationDialog from "@/components/ReclamationDialog";
import { AppHeader } from "@/components/layout/AppHeader";

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
  const [hasClass, setHasClass] = useState(false);

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
      checkClassMembership(session.user.id);
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
      checkClassMembership(session.user.id);
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

  const checkClassMembership = async (userId: string) => {
    const { data } = await supabase
      .from("class_students")
      .select("id")
      .eq("student_id", userId)
      .limit(1)
      .maybeSingle();
    setHasClass(!!data);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/10">
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-full border-4 border-primary/15" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        </div>
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
    <div className="min-h-screen bg-muted/30">
      <AppHeader />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-foreground">Mon compte</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gérez vos informations et votre abonnement</p>
        </motion.div>

<<<<<<< HEAD
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
          {/* LEFT column */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-4 lg:sticky lg:top-24"
=======
      <main className="container mx-auto px-4 py-8 mt-20">
        {!isParent && (
          <div className="flex flex-wrap gap-3 mb-8">
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
            {isStudent && <JoinClassDialog onClassChange={setHasClass} />}
            {isStudent && hasClass && <ReclamationDialog userRole="student" />}
          </div>
        )}
        {isParent && (
          <button
            onClick={() => navigate("/parent-dashboard")}
            className="mb-8 inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-primary/10 text-primary font-medium text-sm border border-primary/20 hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 group"
>>>>>>> df9841324e47cbdb6890623ea34d56d4ef7a6137
          >
            {/* Profile card */}
            <Card className="rounded-xl border-border shadow-sm">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Avatar className="h-20 w-20 ring-4 ring-muted">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">{fullName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <h2 className="mt-4 text-lg font-semibold text-foreground">{fullName}</h2>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
                {profile?.school_level && (
                  <Badge variant="secondary" className="mt-3 rounded-full px-3">
                    <GraduationCap className="h-3.5 w-3.5 mr-1.5" />
                    {getSchoolLevelName(profile.school_level)}
                  </Badge>
                )}
                <div className="w-full border-t border-border my-5" />
                <ChangePasswordButton className="w-full justify-center rounded-lg" />
              </CardContent>
            </Card>

            {/* Quick navigation */}
            {!isParent ? (
              <Card className="rounded-xl border-border shadow-sm overflow-hidden">
                <div className="divide-y divide-border">
                  <button
                    type="button"
                    onClick={() => navigate("/liste-cours")}
                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors text-left"
                  >
                    <span className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-foreground/70 shrink-0">
                      <ArrowLeft className="h-4 w-4" />
                    </span>
                    <span className="flex-1 text-sm font-medium">Liste des matières</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors text-left"
                  >
                    <span className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-foreground/70 shrink-0">
                      <BarChart3 className="h-4 w-4" />
                    </span>
                    <span className="flex-1 text-sm font-medium">Tableau de bord</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                  {isStudent && <JoinClassDialog onClassChange={setHasClass} />}
                  {isStudent && hasClass && (
                    <ReclamationDialog
                      userRole="student"
                      trigger={
                        <button
                          type="button"
                          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors text-left"
                        >
                          <span className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-foreground/70 shrink-0">
                            <MessageSquareWarning className="h-4 w-4" />
                          </span>
                          <span className="flex-1 text-sm font-medium">Réclamation</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </button>
                      }
                    />
                  )}
                </div>
              </Card>
            ) : (
              <Card className="rounded-xl border-border shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => navigate("/parent-dashboard")}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors text-left"
                >
                  <span className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-foreground/70 shrink-0">
                    <ArrowLeft className="h-4 w-4" />
                  </span>
                  <span className="flex-1 text-sm font-medium">Tableau de bord parent</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              </Card>
            )}
          </motion.div>

          {/* RIGHT column */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
            className="space-y-6"
          >
            {/* Account settings list */}
            <Card className="rounded-xl border-border shadow-sm overflow-hidden">
              <div className="px-6 py-3.5 border-b border-border">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Réglages du compte</p>
              </div>
              <div className="divide-y divide-border">
                {accountCards.map((card, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={card.onClick}
                    className="group w-full flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <card.icon className={`h-5 w-5 ${card.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{card.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{card.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </Card>

            {/* Student: Subscription Section */}
            {isStudent && (
              <Card className="rounded-xl border-border shadow-sm overflow-hidden">
                <div className="px-6 py-3.5 border-b border-border flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Key className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="text-sm font-semibold text-foreground">Mon abonnement</h2>
                </div>

                <div className="p-6">
                  {subscription && remaining > 0 ? (
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

                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="font-semibold text-foreground">{remaining} jours restants</span>
                          <span className="text-sm text-muted-foreground">/ {subscription.total_days}</span>
                        </div>
                        <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (remaining / subscription.total_days) * 100)}%` }}
                            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                            className="bg-primary h-2 rounded-full"
                          />
                        </div>
                      </div>

                      {subscription.plan_type === "annual" && (
                        <Button
                          variant={subscription.is_paused ? "default" : "outline"}
                          className="w-full rounded-lg h-11 active:scale-[0.98] transition-transform"
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
                      {subscription && remaining <= 0 && (
                        <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-destructive text-sm">Abonnement expiré</p>
                            <p className="text-destructive/80 text-xs mt-0.5">
                              Votre abonnement {subscription.plan_type === "annual" ? "scolaire" : "mensuel"} est terminé. Activez un nouveau code pour continuer.
                            </p>
                          </div>
                        </div>
                      )}
                      {!subscription && (
                        <div className="text-center py-3">
                          <div className="mx-auto mb-3 h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-primary" />
                          </div>
                          <p className="text-muted-foreground text-sm mb-1">
                            Vous n'avez pas encore d'abonnement actif.
                          </p>
                          <p className="text-muted-foreground text-sm">
                            Entrez votre code d'activation pour commencer.
                          </p>
                        </div>
                      )}
                      <div className="flex gap-3">
                        <Input
                          placeholder="XXXX-XXXX-XXXX"
                          value={activationCode}
                          onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                          className="text-center text-lg font-mono tracking-wider flex-1 rounded-lg h-11"
                          maxLength={14}
                          disabled={activatingCode}
                        />
                        <Button
                          onClick={handleActivateCode}
                          disabled={activatingCode || !activationCode.trim()}
                          className="rounded-lg px-6 h-11 active:scale-[0.98] transition-transform"
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
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Account;
