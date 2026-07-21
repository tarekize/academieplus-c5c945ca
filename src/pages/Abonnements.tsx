import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, GraduationCap, LogOut, User as UserIcon, Copy, Key } from "lucide-react";
import ResiliationDialog from "@/components/ResiliationDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Pricing from "@/components/Pricing";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { formatLocaleDate } from "@/lib/formatLocale";

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
      toast.error("Erreur", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

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

  const getFullName = (p: Profile | null): string => {
    if (!p) return "Utilisateur";
    const parts = [p.first_name, p.last_name].filter(Boolean);
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
    navigate("/");
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copié !", { description: code });
  };

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

  const fullName = getFullName(profile);

  return (
    <div className="min-h-screen pro-shell">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate("/liste-cours")}>
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-extrabold">AcadémiePlus</span>
            </div>
            <div className="flex items-center gap-4">
              <LanguageToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer hover:bg-accent/10 rounded-lg p-2 transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback>{fullName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="text-left hidden md:block">
                      <p className="text-sm font-medium">{fullName}</p>
                      <p className="text-xs text-muted-foreground">{profile?.school_level && getSchoolLevelName(profile.school_level)}</p>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate("/account")}><UserIcon className="mr-2 h-4 w-4" /><span>Gérer mon compte</span></DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}><GraduationCap className="mr-2 h-4 w-4" /><span>Tableau de bord</span></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive"><LogOut className="mr-2 h-4 w-4" /><span>Se déconnecter</span></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-20">
        <div className="container mx-auto px-4 pt-8">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => navigate("/account")} className="cursor-pointer flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Retour vers Gérer mon compte
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
                      <h3 className="font-semibold text-lg">Mes Codes d'Activation</h3>
                      <p className="text-sm text-muted-foreground">
                        {codes.length} code{codes.length > 1 ? "s" : ""} • {codes.filter(c => c.status === "free").length} disponible{codes.filter(c => c.status === "free").length > 1 ? "s" : ""}
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
                          <TableHead className="font-semibold">Code</TableHead>
                          <TableHead className="font-semibold">Formule</TableHead>
                          <TableHead className="font-semibold">Statut</TableHead>
                          <TableHead className="font-semibold">État</TableHead>
                          <TableHead className="font-semibold">Date de début</TableHead>
                          <TableHead className="font-semibold">Date de fin</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {codes.map((code) => (
                          <TableRow key={code.id} className="group hover:bg-muted/20 transition-colors">
                            <TableCell className="font-mono font-bold tracking-widest text-primary">{code.code}</TableCell>
                            <TableCell>{code.plan_type === "annual" ? "Scolaire (1 an)" : "Mensuelle"}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={code.status === "used" ? "secondary" : "default"}
                                className={code.status === "free" ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20" : ""}
                              >
                                {code.status === "used" ? "Utilisé" : "Disponible"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {code.status === "used" ? (
                                <Badge variant={subStatuses[code.id]?.is_paused ? "outline" : "default"}>
                                  {subStatuses[code.id]?.is_paused ? "En pause" : "Actif"}
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
                                  <span className="hidden sm:inline">Copier</span>
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
