import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, GraduationCap, LogOut, User as UserIcon, Copy, Key } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

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
  const { toast } = useToast();
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
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
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
    toast({ title: "Déconnexion", description: "Vous avez été déconnecté avec succès" });
    navigate("/");
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Code copié !", description: code });
  };

  const getEndDate = (code: ActivationCode) => {
    const start = code.used_at ? new Date(code.used_at) : new Date(code.created_at);
    const days = code.plan_type === "annual" ? 360 : 30;
    const end = new Date(start);
    end.setDate(end.getDate() + days);
    return end.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
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
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate("/liste-cours")}>
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">AcadémiePlus</span>
            </div>
            <div className="flex items-center gap-4">
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

          {/* My Codes Section - visible for parents */}
          {isParent && codes.length > 0 && (
            <div className="max-w-4xl mx-auto mb-8">
              <Button
                variant={showCodes ? "default" : "outline"}
                className="mb-4"
                onClick={() => setShowCodes(!showCodes)}
              >
                <Key className="h-4 w-4 mr-2" />
                Mes Codes ({codes.length})
              </Button>

              {showCodes && (
                <Card className="p-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Formule</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>État</TableHead>
                        <TableHead>Date de début</TableHead>
                        <TableHead>Date de fin</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {codes.map((code) => (
                        <TableRow key={code.id}>
                          <TableCell className="font-mono font-bold tracking-widest">{code.code}</TableCell>
                          <TableCell>{code.plan_type === "annual" ? "Scolaire (1 an)" : "Mensuelle"}</TableCell>
                          <TableCell>
                            <Badge variant={code.status === "used" ? "secondary" : "default"}>
                              {code.status === "used" ? "Utilisé" : "Libre"}
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
                          <TableCell>
                            {code.used_at
                              ? new Date(code.used_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
                              : new Date(code.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                          </TableCell>
                          <TableCell>
                            {getEndDate(code)}
                          </TableCell>
                          <TableCell>
                            {code.status === "free" && (
                              <Button variant="ghost" size="sm" onClick={() => copyCode(code.code)}>
                                <Copy className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
