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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { hasRole } = useAuth();
  const [isParent, setIsParent] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [isPedago, setIsPedago] = useState(false);
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
      hasRole('pedago').then(setIsPedago);
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
      hasRole('pedago').then(setIsPedago);
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
        title: t("account.errorTitle"),
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

    const { error } = await supabase.rpc("pause_my_subscription" as any);
    if (error) {
      toast({ title: t("account.errorTitle"), description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: t("account.subscriptionPaused"), description: t("account.subscriptionPausedDesc") });
    fetchSubscription(user.id);
  };

  const handleResume = async () => {
    if (!subscription || !user) return;

    const { error } = await supabase.rpc("resume_my_subscription" as any);
    if (error) {
      toast({ title: t("account.errorTitle"), description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: t("account.subscriptionResumed"), description: t("account.subscriptionResumedDesc") });
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
      const { error } = await supabase.rpc("redeem_activation_code" as any, {
        p_code: activationCode.trim(),
      });

      if (error) {
        toast({ title: t("account.invalidCode"), description: error.message || t("account.invalidCodeDesc"), variant: "destructive" });
        return;
      }

      toast({ title: t("account.codeActivated"), description: t("account.codeActivatedDesc") });
      setActivationCode("");
      fetchSubscription(user.id);
    } catch (error: any) {
      toast({ title: t("account.errorTitle"), description: error.message, variant: "destructive" });
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
      title: t("account.myInfo"),
      description: t("account.myInfoDesc"),
      icon: UserCircle,
      color: "text-blue-600",
      onClick: () => navigate("/mes-informations"),
    },
    {
      title: t("account.subscriptions"),
      description: t("account.subscriptionsDesc"),
      icon: Key,
      color: "text-purple-600",
      onClick: () => navigate("/abonnements"),
    },
    {
      title: t("account.billing"),
      description: t("account.billingDesc"),
      icon: FileText,
      color: "text-emerald-600",
      onClick: () => navigate("/factures"),
    },
    {
      title: t("account.myStats"),
      description: t("account.myStatsDesc"),
      icon: BarChart3,
      color: "text-indigo-600",
      onClick: () => toast({ title: t("account.myStats"), description: t("account.inDevelopment") }),
    },
  ];

  // Parent cards: full set
  const parentCards = [
    {
      title: t("account.myInfo"),
      description: t("account.myInfoDesc"),
      icon: UserCircle,
      color: "text-blue-600",
      onClick: () => navigate("/mes-informations"),
    },
    {
      title: t("account.subscriptions"),
      description: t("account.subscriptionsDesc"),
      icon: Key,
      color: "text-purple-600",
      onClick: () => navigate("/abonnements"),
    },
    {
      title: t("account.billing"),
      description: t("account.billingDesc"),
      icon: FileText,
      color: "text-emerald-600",
      onClick: () => navigate("/factures"),
    },
    {
      title: t("account.myStats"),
      description: t("account.myStatsDesc"),
      icon: BarChart3,
      color: "text-indigo-600",
      onClick: () => toast({ title: t("account.myStats"), description: t("account.inDevelopment") }),
    },
  ];

  // Pédago : uniquement les informations personnelles (pas d'abonnement,
  // de facturation ni de statistiques d'apprentissage — ça ne les concerne pas).
  const pedagoCards = [
    {
      title: t("account.myInfo"),
      description: t("account.myInfoDesc"),
      icon: UserCircle,
      color: "text-blue-600",
      onClick: () => navigate("/mes-informations"),
    },
  ];

  const accountCards = isParent ? parentCards : isPedago ? pedagoCards : studentCards;

  const remaining = subscription ? Math.floor(getRemainingDays(subscription)) : 0;

  return (
    <div className="min-h-screen pro-shell">
      <AppHeader />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <h1 className="font-display text-2xl font-extrabold text-foreground">{t("account.pageTitle")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t("account.pageSubtitle")}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
          {/* LEFT column */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-4 lg:sticky lg:top-24"
          >
            {/* Profile card */}
            <Card className="pro-card">
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
              <Card className="pro-card overflow-hidden">
                <div className="divide-y divide-border">
                  <button
                    type="button"
                    onClick={() => navigate("/liste-cours")}
                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors text-left"
                  >
                    <span className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-foreground/70 shrink-0">
                      <ArrowLeft className="h-4 w-4" />
                    </span>
                    <span className="flex-1 text-sm font-medium">{t("account.subjectsList")}</span>
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
                    <span className="flex-1 text-sm font-medium">{t("account.dashboardLink")}</span>
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
                          <span className="flex-1 text-sm font-medium">{t("account.complaint")}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </button>
                      }
                    />
                  )}
                </div>
              </Card>
            ) : (
              <Card className="pro-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => navigate("/parent-dashboard")}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors text-left"
                >
                  <span className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-foreground/70 shrink-0">
                    <ArrowLeft className="h-4 w-4" />
                  </span>
                  <span className="flex-1 text-sm font-medium">{t("account.parentDashboardLink")}</span>
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
            <Card className="pro-card overflow-hidden">
              <div className="px-6 py-3.5 border-b border-border">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("account.accountSettings")}</p>
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
              <Card className="pro-card overflow-hidden">
                <div className="px-6 py-3.5 border-b border-border flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Key className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="text-sm font-semibold text-foreground">{t("account.mySubscription")}</h2>
                </div>

                <div className="p-6">
                  {subscription && remaining > 0 ? (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">{t("account.plan")}</p>
                          <p className="font-semibold text-foreground">
                            {subscription.plan_type === "annual" ? t("account.planAnnual") : t("account.planMonthly")}
                          </p>
                        </div>
                        <Badge
                          variant={subscription.is_paused ? "secondary" : "default"}
                          className="rounded-full px-4"
                        >
                          {subscription.is_paused ? t("account.paused") : t("account.active")}
                        </Badge>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="font-semibold text-foreground">{t("account.daysRemaining", { count: remaining })}</span>
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
                            <><Play className="h-4 w-4 mr-2" /> {t("account.resumeSubscription")}</>
                          ) : (
                            <><Pause className="h-4 w-4 mr-2" /> {t("account.pauseSubscription")}</>
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
                            <p className="font-semibold text-destructive text-sm">{t("account.subscriptionExpired")}</p>
                            <p className="text-destructive/80 text-xs mt-0.5">
                              {t("account.subscriptionExpiredDesc", { type: subscription.plan_type === "annual" ? t("account.planAnnualLower") : t("account.planMonthlyLower") })}
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
                            {t("account.noActiveSubscription")}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {t("account.enterActivationCode")}
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
                            t("account.activate")
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        {t("account.activationCodeFormat")}
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
