import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Copy, Key } from "lucide-react";
import ResiliationDialog from "@/components/ResiliationDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Pricing from "@/components/Pricing";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { formatLocaleDate } from "@/lib/formatLocale";
import { useTranslation } from "react-i18next";
import { AppHeader } from "@/components/layout/AppHeader";

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  school_level: string | null;
  avatar_url: string | null;
}

interface ActivationCode {
  id: string;
  code: string;
  plan_type: string;
  status: string;
  used_at: string | null;
  created_at: string;
  is_family: boolean;
}

interface SubStatus {
  is_paused: boolean;
}


const Abonnements = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { hasRole } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isParent, setIsParent] = useState(false);
  const [codes, setCodes] = useState<ActivationCode[]>([]);
  const [subStatuses, setSubStatuses] = useState<Record<string, SubStatus>>({});
  const [showCodes, setShowCodes] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate("/auth"); return; }
      fetchProfile(session.user.id);
      hasRole('parent').then(setIsParent);
      fetchCodes(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { navigate("/auth"); return; }
      fetchProfile(session.user.id);
      hasRole('parent').then(setIsParent);
      fetchCodes(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [navigate, hasRole]);

  // Charge le profil affiché dans l'en-tête. Appelée au montage et à chaque
  // changement de session.
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, school_level, avatar_url")
        .eq("id", userId)
        .single();
      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      toast.error(t("account.errorTitle"), { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Charge les codes d'activation créés par ce compte (RLS : "Creators can
  // view their codes", auth.uid() = created_by) et, pour ceux déjà utilisés,
  // leur statut d'abonnement (en pause ou actif) — affiché dans le tableau
  // "Mes codes d'activation" réservé aux parents.
  const fetchCodes = async (userId: string) => {
    const { data } = await supabase
      .from("activation_codes")
      .select("*")
      .eq("created_by", userId)
      .order("created_at", { ascending: false });

    if (data) {
      setCodes(data as any[]);
      // Fetch subscription statuses for used codes
      const usedCodeIds = (data as any[]).filter(c => c.status === "used").map(c => c.id);
      if (usedCodeIds.length > 0) {
        const { data: subs } = await supabase
          .from("student_subscriptions")
          .select("activation_code_id, is_paused")
          .in("activation_code_id", usedCodeIds);
        if (subs) {
          const map: Record<string, SubStatus> = {};
          (subs as any[]).forEach(s => { map[s.activation_code_id] = { is_paused: s.is_paused }; });
          setSubStatuses(map);
        }
      }
    }
  };

  // Copie un code d'activation dans le presse-papiers (bouton "Copier" du
  // tableau des codes) pour que le parent puisse le transmettre à l'enfant.
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(t("abonnements.codeCopied"), { description: code });
  };

  // Calcule la date de fin d'abonnement affichée pour un code (30 jours pour
  // le mensuel, 360 pour l'annuel), à partir de sa date d'utilisation ou, si
  // pas encore utilisé, de sa date de création — purement indicatif côté
  // client : la vraie durée restante vient de student_subscriptions,
  // calculée serveur (voir AdminContrats/admin_grant_subscription_days).
  const getEndDate = (code: ActivationCode) => {
    const start = code.used_at ? new Date(code.used_at) : new Date(code.created_at);
    const days = code.plan_type === "annual" ? 360 : 30;
    const end = new Date(start);
    end.setDate(end.getDate() + days);
    return formatLocaleDate(end, { day: "numeric", month: "long", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pro-shell">
      <AppHeader />

      <main>
        <div className="container mx-auto px-4 pt-8">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => navigate("/account")} className="cursor-pointer flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  {t("factures.backToAccount")}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Resiliation button for parents with annual codes */}
          {isParent && codes.some(c => c.plan_type === "annual") && (
            <div className="max-w-4xl mx-auto mb-6 flex justify-end">
              <ResiliationDialog 
                userId={profile?.id || ""} 
                onResiliation={() => {
                  supabase.auth.getSession().then(({ data: { session } }) => {
                    if (session) fetchCodes(session.user.id);
                  });
                }}
              />
            </div>
          )}

          {/* My Codes Section - visible for parents */}
          {isParent && codes.length > 0 && (
            <div className="max-w-4xl mx-auto mb-10">
              {/* Modern toggle card */}
              <Card 
                className={`cursor-pointer transition-all duration-300 overflow-hidden ${
                  showCodes 
                    ? "border-primary/30 shadow-lg shadow-primary/5" 
                    : "hover:border-primary/20 hover:shadow-md"
                }`}
                onClick={() => setShowCodes(!showCodes)}
              >
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors ${
                      showCodes ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                    }`}>
                      <Key className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{t("abonnements.myActivationCodes")}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t("abonnements.codesCountSummary", { count: codes.length, available: codes.filter(c => c.status === "free").length })}
                      </p>
                    </div>
                  </div>
                  <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    showCodes ? "border-primary bg-primary/10 rotate-180" : "border-muted-foreground/30"
                  }`}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </Card>

              {/* Expandable table */}
              {showCodes && (
                <Card className="mt-3 overflow-hidden border-primary/10 animate-in slide-in-from-top-2 duration-300">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                          <TableHead className="font-semibold">{t("abonnements.tableCode")}</TableHead>
                          <TableHead className="font-semibold">{t("account.plan")}</TableHead>
                          <TableHead className="font-semibold">{t("factures.status")}</TableHead>
                          <TableHead className="font-semibold">{t("abonnements.tableState")}</TableHead>
                          <TableHead className="font-semibold">{t("abonnements.tableStartDate")}</TableHead>
                          <TableHead className="font-semibold">{t("abonnements.tableEndDate")}</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {codes.map((code) => (
                          <TableRow key={code.id} className="group hover:bg-muted/20 transition-colors">
                            <TableCell className="font-mono font-bold tracking-widest text-primary">{code.code}</TableCell>
                            <TableCell>{code.plan_type === "annual" ? t("account.planAnnual") : t("account.planMonthly")}</TableCell>
                            <TableCell>
                              <Badge
                                variant={code.status === "used" ? "secondary" : "default"}
                                className={code.status === "free" ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20" : ""}
                              >
                                {code.status === "used" ? t("abonnements.statusUsed") : t("abonnements.statusAvailable")}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {code.status === "used" ? (
                                <Badge variant={subStatuses[code.id]?.is_paused ? "outline" : "default"}>
                                  {subStatuses[code.id]?.is_paused ? t("account.paused") : t("account.active")}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {code.used_at
                                ? formatLocaleDate(code.used_at, { day: "numeric", month: "long", year: "numeric" })
                                : formatLocaleDate(code.created_at, { day: "numeric", month: "long", year: "numeric" })}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {getEndDate(code)}
                            </TableCell>
                            <TableCell>
                              {code.status === "free" && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={(e) => { e.stopPropagation(); copyCode(code.code); }}
                                  className="opacity-60 group-hover:opacity-100 transition-opacity hover:bg-primary/10 hover:text-primary"
                                >
                                  <Copy className="h-4 w-4 mr-1" />
                                  <span className="hidden sm:inline">{t("abonnements.copy")}</span>
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>

        <Pricing />
      </main>
    </div>
  );
};

export default Abonnements;
