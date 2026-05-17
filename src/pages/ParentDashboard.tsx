import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  GraduationCap, LogOut, User as UserIcon, UserPlus, Hash, Eye, Trash2, Loader2, ArrowLeft, Plus, BookOpen, Key, Check, Calendar as CalendarIcon, FileDown, FileText
} from "lucide-react";
import { downloadParentReportPdf, type ParentReportData } from "@/lib/parentReportPdf";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { getSchoolLevelLabel, allSchoolLevels } from "@/lib/validation";
import { ChangePasswordButton } from "@/components/ChangePasswordButton";
import StudentDashboardContent from "@/components/dashboard/StudentDashboardContent";
import { format, parse, isValid } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import LocationFields from "@/components/profile/LocationFields";

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  school_level: string | null;
  email: string | null;
  wilaya?: string | null;
  ville?: string | null;
  ecole?: string | null;
}

interface LinkedChild {
  id: string;
  child_id: string;
  status: string;
  created_at: string;
  child: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    school_level: string | null;
    avatar_url: string | null;
  } | null;
  subscription?: {
    id: string;
    total_days: number;
    days_used: number;
    last_tick_at: string;
    is_paused: boolean;
  } | null;
}

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [children, setChildren] = useState<LinkedChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [childrenLoading, setChildrenLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedChild, setSelectedChild] = useState<LinkedChild | null>(null);

  // Create child account state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newChildEmail, setNewChildEmail] = useState("");
  const [newChildPassword, setNewChildPassword] = useState("");
  const [newChildFirstName, setNewChildFirstName] = useState("");
  const [newChildLastName, setNewChildLastName] = useState("");
  const [newChildLevel, setNewChildLevel] = useState("");
  const [newChildFiliere, setNewChildFiliere] = useState("");
  const [newChildBirthDate, setNewChildBirthDate] = useState<Date | undefined>(undefined);
  const [newChildBirthDateInput, setNewChildBirthDateInput] = useState("");
  const [newChildWilaya, setNewChildWilaya] = useState("");
  const [newChildVille, setNewChildVille] = useState("");
  const [newChildEcole, setNewChildEcole] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Activation state
  const [activationDialogOpen, setActivationDialogOpen] = useState(false);
  const [selectedChildForActivation, setSelectedChildForActivation] = useState<string | null>(null);
  const [activationCode, setActivationCode] = useState("");
  const [activating, setActivating] = useState(false);

  // Parent reports state: child_id -> latest report row
  const [latestReports, setLatestReports] = useState<Record<string, { id: string; generated_at: string; report_data: ParentReportData } | null>>({});
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, avatar_url, school_level, email, wilaya, ville, ecole")
        .eq("id", userId)
        .single();
      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchChildren = useCallback(async (userId: string) => {
    setChildrenLoading(true);
    try {
      const { data, error } = await supabase
        .from("parent_child_links")
        .select(`id, child_id, status, created_at, child:profiles!parent_child_links_child_id_fkey(id, first_name, last_name, email, school_level, avatar_url)`)
        .eq("parent_id", userId);
      if (error) throw error;

      let mappedChildren = ((data as any[]) || []).filter((link) => link.child);
      const childIds = mappedChildren.map(c => c.child_id);

      if (childIds.length > 0) {
        const { data: subs } = await supabase
          .from("student_subscriptions")
          .select("*")
          .in("user_id", childIds) // Use in just to be safe
          .eq("is_paused", false);

        mappedChildren = mappedChildren.map(child => {
          // Find the active subscription. Note: a student can have multiple rows, we want the "active" one.
          // Filter expiration manually if needed, but for now we assume non-paused is active.
          // Better logic: subscription with remaining days > 0
          const sub = subs?.find(s => s.user_id === child.child_id);
          if (!sub) return child;

          const now = new Date();
          const lastTick = new Date(sub.last_tick_at || sub.created_at);
          const elapsed = (now.getTime() - lastTick.getTime()) / (1000 * 60 * 60 * 24);
          const totalUsed = (sub.days_used || 0) + elapsed;
          const remaining = (sub.total_days || 0) - totalUsed;

          if (remaining > 0) {
            return { ...child, subscription: sub };
          }
          return child;
        });
      }

      setChildren(mappedChildren);
    } catch (error: any) {
      console.error("Error fetching children:", error);
    } finally {
      setChildrenLoading(false);
    }
  }, []);

  const fetchLatestReports = useCallback(async (childIds: string[]) => {
    if (childIds.length === 0) return;
    const { data } = await supabase
      .from("parent_reports")
      .select("id, child_id, generated_at, report_data")
      .in("child_id", childIds)
      .order("generated_at", { ascending: false });
    const map: Record<string, any> = {};
    (data || []).forEach((r: any) => {
      if (!map[r.child_id]) map[r.child_id] = r;
    });
    setLatestReports(map);
  }, []);

  useEffect(() => {
    const ids = children.map((c) => c.child_id);
    if (ids.length) fetchLatestReports(ids);
  }, [children, fetchLatestReports]);

  const handleDownloadReport = async (childId: string) => {
    const report = latestReports[childId];
    if (report?.report_data) {
      downloadParentReportPdf(report.report_data, report.generated_at);
      return;
    }
    // Generate a new one
    setGeneratingFor(childId);
    try {
      const { data, error } = await supabase.functions.invoke("generate-parent-report", {
        body: { child_id: childId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const r = data?.report;
      if (r?.report_data) {
        downloadParentReportPdf(r.report_data, r.generated_at);
        setLatestReports((prev) => ({ ...prev, [childId]: r }));
        sonnerToast.success("Rapport généré et téléchargé");
      }
    } catch (e: any) {
      sonnerToast.error(e.message || "Erreur lors de la génération du rapport");
    } finally {
      setGeneratingFor(null);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    fetchProfile(user.id);
    fetchChildren(user.id);
  }, [user, authLoading, navigate, fetchProfile, fetchChildren]);

  const getFullName = (p: Profile | null): string => {
    if (!p) return "Utilisateur";
    const parts = [p.first_name, p.last_name].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "Utilisateur";
  };

  const getChildFullName = (child: LinkedChild["child"]): string => {
    if (!child) return "Compte élève";
    const parts = [child.first_name, child.last_name].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "Sans nom";
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Déconnexion", description: "Vous avez été déconnecté avec succès" });
    navigate("/");
  };

  const handleAddByCode = async () => {
    const trimmedCode = code.trim();
    if (!trimmedCode) { sonnerToast.error("Veuillez entrer un code"); return; }
    if (!user) return;
    if (!/^[a-f0-9]{8}$/i.test(trimmedCode)) {
      sonnerToast.error("Format de code invalide (8 caractères attendus)"); return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("link-child-by-code", {
        body: { code: trimmedCode },
      });
      if (error) { sonnerToast.error(error.message || "Erreur lors de la liaison"); return; }
      if (data?.error) { sonnerToast.error(data.error); return; }
      sonnerToast.success(data?.message || "Demande de liaison envoyée");
      setCode("");
      setDialogOpen(false);
      fetchChildren(user.id);
    } catch (error: any) {
      sonnerToast.error(error.message || "Erreur inattendue");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveChild = async (linkId: string) => {
    try {
      const { error } = await supabase.from("parent_child_links").delete().eq("id", linkId);
      if (error) throw error;
      if (user) fetchChildren(user.id);
      sonnerToast.success("Lien supprimé avec succès");
    } catch (error: any) {
      sonnerToast.error("Erreur lors de la suppression du lien");
    }
  };

  const handleActivateSubscription = async () => {
    if (!activationCode.trim() || !selectedChildForActivation || !user) return;
    setActivating(true);

    try {
      const { data: anyCode } = await supabase
        .from("activation_codes")
        .select("status")
        .eq("code", activationCode.trim().toUpperCase())
        .maybeSingle();

      if (!anyCode) {
        sonnerToast.error("Ce code n'existe pas");
        setActivating(false);
        return;
      }

      if (anyCode.status === "used") {
        sonnerToast.error("Ce code a déjà été activé");
        setActivating(false);
        return;
      }

      const { data: codeData, error: codeErr } = await supabase
        .from("activation_codes")
        .select("*")
        .eq("code", activationCode.trim().toUpperCase())
        .eq("status", "free")
        .single();

      if (codeErr || !codeData) {
        sonnerToast.error("Impossible d'activer ce code");
        setActivating(false);
        return;
      }

      const { error: updateError } = await supabase
        .from("activation_codes")
        .update({ status: "used", used_by: user.id, used_at: new Date().toISOString() })
        .eq("id", codeData.id);

      if (updateError) throw updateError;

      const totalDays = codeData.plan_type === "annual" ? 360 : 30;
      const { error: insertError } = await supabase.from("student_subscriptions").insert({
        user_id: selectedChildForActivation,
        activation_code_id: codeData.id,
        plan_type: codeData.plan_type,
        total_days: totalDays,
        days_used: 0,
        is_paused: false,
        started_at: new Date().toISOString(),
        last_tick_at: new Date().toISOString(),
      });

      if (insertError) throw insertError;

      sonnerToast.success(`Abonnement activé (${totalDays} jours)`);
      setActivationCode("");
      setActivationDialogOpen(false);
      setSelectedChildForActivation(null);
    } catch (err: any) {
      sonnerToast.error(err.message || "Erreur lors de l'activation");
    } finally {
      setActivating(false);
    }
  };

  const needsFiliere = ["premiere", "seconde", "terminale"].includes(newChildLevel);
  const filiereOptions: Record<string, { value: string; label: string }[]> = {
    premiere: [
      { value: "Tronc Commun Sciences", label: "Tronc Commun Sciences" },
      { value: "Tronc Commun Lettres", label: "Tronc Commun Lettres" },
    ],
    seconde: [
      { value: "Sciences", label: "Sciences" },
      { value: "Lettres", label: "Lettres" },
      { value: "Gestion", label: "Gestion" },
      { value: "Math techniques", label: "Math techniques" },
      { value: "Mathématiques", label: "Mathématiques" },
    ],
    terminale: [
      { value: "Sciences", label: "Sciences" },
      { value: "Lettres", label: "Lettres" },
      { value: "Gestion", label: "Gestion" },
      { value: "Math techniques", label: "Math techniques" },
      { value: "Mathématiques", label: "Mathématiques" },
    ],
  };

  const handleCreateChild = async () => {
    setCreateError(null);
    const missingFields = [];
    if (!newChildFirstName) missingFields.push("Prénom");
    if (!newChildLastName) missingFields.push("Nom");
    if (!newChildEmail) missingFields.push("Email");
    if (!newChildPassword) missingFields.push("Mot de passe");
    if (!newChildLevel) missingFields.push("Niveau scolaire");
    if (needsFiliere && !newChildFiliere) missingFields.push(newChildLevel === "premiere" ? "Tronc commun" : "Filière");

    if (missingFields.length > 0) {
      setCreateError(`Veuillez remplir les champs obligatoires suivants : ${missingFields.join(", ")}`);
      return;
    }

    if (newChildPassword.length < 8) {
      setCreateError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-child-account", {
        body: {
          email: newChildEmail,
          password: newChildPassword,
          firstName: newChildFirstName,
          lastName: newChildLastName,
          schoolLevel: newChildLevel,
          filiere: newChildFiliere || null,
          dateOfBirth: newChildBirthDate ? format(newChildBirthDate, 'yyyy-MM-dd') : null,
          wilaya: newChildWilaya || null,
          ville: newChildVille || null,
          ecole: newChildEcole || null,
        },
      });

      if (error) {
        let errorMessage = error.message || "Erreur lors de la création";
        if (errorMessage.includes("Edge Function returned a non-2xx status code")) {
          errorMessage = "Cette adresse email est déjà utilisée par un autre compte.";
        }
        setCreateError(errorMessage);
        return;
      }

      if (data?.error) {
        let errorMessage = data.error;
        if (errorMessage.includes("already registered") || errorMessage.includes("already exists")) {
          errorMessage = "Cette adresse email est déjà utilisée par un autre compte.";
        }
        setCreateError(errorMessage);
        return;
      }
      sonnerToast.success(data?.message || "Compte élève créé avec succès");
      setNewChildEmail(""); setNewChildPassword(""); setNewChildFirstName("");
      setNewChildLastName(""); setNewChildLevel(""); setNewChildFiliere("");
      setNewChildBirthDate(undefined); setNewChildBirthDateInput("");
      setNewChildWilaya(""); setNewChildVille(""); setNewChildEcole("");
      setCreateDialogOpen(false);
      if (user) fetchChildren(user.id);
    } catch (error: any) {
      setCreateError(error.message || "Erreur inattendue");
    } finally {
      setCreating(false);
    }
  };



  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const fullName = getFullName(profile);

  // If a child is selected, show their dashboard
  if (selectedChild && selectedChild.child) {
    return (
      <div className="min-h-screen bg-background">
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => setSelectedChild(null)} className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Retour
                </Button>
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">AcadémiePlus</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Progression de {getChildFullName(selectedChild.child)}
              </p>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8 mt-20">
          <div className="max-w-7xl mx-auto">
            <StudentDashboardContent
              userId={selectedChild.child_id}
              profile={selectedChild.child}
              hideActions
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate("/")}>
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">AcadémiePlus</span>
            </div>
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
                      <p className="text-xs text-muted-foreground">Compte Parent</p>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate("/account")}>
                    <UserIcon className="mr-2 h-4 w-4" /><span>Gérer mon compte</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /><span>Se déconnecter</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Bonjour {fullName} 👋</h1>
              <p className="text-muted-foreground">Suivez la progression de vos enfants</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {/* Ajouter un élève - création de compte */}
              <Dialog open={createDialogOpen} onOpenChange={(open) => {
                setCreateDialogOpen(open);
                if (!open) setCreateError(null);
                if (open && profile) {
                  setNewChildWilaya(profile.wilaya || "");
                  setNewChildVille(profile.ville || "");
                  setNewChildEcole(profile.ecole || "");
                }
              }}>
                <DialogTrigger asChild>
                  <Button size="lg" className="gap-2"><Plus className="h-5 w-5" />Ajouter un élève</Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Créer un compte élève</DialogTitle>
                    <DialogDescription>Créez un compte pour votre enfant. Le lien de parenté sera établi automatiquement.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    {createError && (
                      <div className="p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm font-medium">
                        ⚠️ {createError}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Prénom <span className="text-red-500">*</span></Label>
                        <Input placeholder="Prénom" value={newChildFirstName} onChange={(e) => setNewChildFirstName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Nom <span className="text-red-500">*</span></Label>
                        <Input placeholder="Nom" value={newChildLastName} onChange={(e) => setNewChildLastName(e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Email <span className="text-red-500">*</span></Label>
                      <Input type="email" placeholder="email@exemple.com" value={newChildEmail} onChange={(e) => setNewChildEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Mot de passe <span className="text-red-500">*</span></Label>
                      <Input type="password" placeholder="Min. 8 caractères" value={newChildPassword} onChange={(e) => setNewChildPassword(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Date de naissance</Label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="JJ/MM/AAAA"
                          value={newChildBirthDateInput}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, "");
                            if (value.length > 8) value = value.slice(0, 8);
                            let formattedValue = "";
                            if (value.length > 0) formattedValue += value.slice(0, 2);
                            if (value.length > 2) formattedValue += "/" + value.slice(2, 4);
                            if (value.length > 4) formattedValue += "/" + value.slice(4, 8);
                            setNewChildBirthDateInput(formattedValue);
                            if (formattedValue.length === 10) {
                              const parsedDate = parse(formattedValue, "dd/MM/yyyy", new Date());
                              if (isValid(parsedDate)) setNewChildBirthDate(parsedDate);
                            }
                          }}
                        />
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="icon" className="flex-shrink-0">
                              <CalendarIcon className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                              mode="single"
                              selected={newChildBirthDate}
                              onSelect={(date) => {
                                setNewChildBirthDate(date);
                                if (date) setNewChildBirthDateInput(format(date, "dd/MM/yyyy"));
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Niveau scolaire <span className="text-red-500">*</span></Label>
                      <Select value={newChildLevel} onValueChange={(v) => { setNewChildLevel(v); setNewChildFiliere(""); }}>
                        <SelectTrigger><SelectValue placeholder="Sélectionner le niveau" /></SelectTrigger>
                        <SelectContent>
                          {allSchoolLevels.map((l) => (
                            <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {needsFiliere && filiereOptions[newChildLevel] && (
                      <div className="space-y-2">
                        <Label>{newChildLevel === "premiere" ? "Tronc commun" : "Filière"} <span className="text-red-500">*</span></Label>
                        <Select value={newChildFiliere} onValueChange={setNewChildFiliere}>
                          <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                          <SelectContent>
                            {filiereOptions[newChildLevel].map((f) => (
                              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <LocationFields
                      wilaya={newChildWilaya}
                      ville={newChildVille}
                      ecole={newChildEcole}
                      onWilayaChange={setNewChildWilaya}
                      onVilleChange={setNewChildVille}
                      onEcoleChange={setNewChildEcole}
                      required={false}
                    />

                    <Button onClick={handleCreateChild} disabled={creating} className="w-full">
                      {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                      Créer le compte élève
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Ajouter un lien de parenté - par code */}
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" variant="outline" className="gap-2"><UserPlus className="h-5 w-5" />Ajouter un lien de parenté</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter un lien de parenté</DialogTitle>
                    <DialogDescription>Liez le compte de votre enfant en utilisant son code de liaison</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Code de liaison</Label>
                      <Input placeholder="ABC123" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={8} />
                      <p className="text-sm text-muted-foreground">Demandez à votre enfant de générer un code depuis son profil</p>
                    </div>
                    <Button onClick={handleAddByCode} disabled={submitting} className="w-full">
                      {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Hash className="h-4 w-4 mr-2" />}
                      Valider le code
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Activation Abonnement Dialog */}
              <Dialog open={activationDialogOpen} onOpenChange={setActivationDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Activer l'abonnement</DialogTitle>
                    <DialogDescription>
                      Entrez le code d'activation pour débloquer l'accès complet.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Code d'activation</Label>
                      <Input
                        placeholder="Ex: A1B2C3D4"
                        value={activationCode}
                        onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                        maxLength={8}
                        className="font-mono text-lg tracking-widest uppercase text-center"
                      />
                    </div>
                    <Button onClick={handleActivateSubscription} disabled={activating || !activationCode} className="w-full">
                      {activating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Key className="h-4 w-4 mr-2" />}
                      Activer maintenant
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5" />Mes enfants</CardTitle>
              <CardDescription>Cliquez sur "Voir" pour consulter le tableau de bord de votre enfant</CardDescription>
            </CardHeader>
            <CardContent>
              {childrenLoading ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : children.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <UserIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">Aucun enfant lié pour le moment</p>
                  <p className="text-sm">Cliquez sur "Ajouter un enfant" pour commencer</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Enfant</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Niveau</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Dernier rapport</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {children.map((link) => {
                      const childName = getChildFullName(link.child);
                      const initials = childName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
                      return (
                        <TableRow key={link.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={link.child?.avatar_url || undefined} />
                                <AvatarFallback className="bg-primary/10 text-primary">{initials || <UserIcon className="h-4 w-4" />}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{childName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{link.child?.email ?? "—"}</TableCell>
                          <TableCell>
                            {link.child?.school_level ? (
                              <Badge variant="outline">{getSchoolLevelLabel(link.child.school_level)}</Badge>
                            ) : <span className="text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell>
                            <Badge variant={link.status === "active" ? "default" : "secondary"}>
                              {link.status === "active" ? "Actif" : "En attente"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {link.subscription ? (
                                (() => {
                                  const sub = link.subscription!;
                                  let rem: number;
                                  if (sub.is_paused) {
                                    rem = Math.max(0, (sub.total_days || 0) - Number(sub.days_used || 0));
                                  } else {
                                    const now = new Date();
                                    const lastTick = new Date(sub.last_tick_at);
                                    const elapsedDays = (now.getTime() - lastTick.getTime()) / (1000 * 60 * 60 * 24);
                                    rem = Math.max(0, (sub.total_days || 0) - Number(sub.days_used || 0) - elapsedDays);
                                  }
                                  rem = Math.floor(rem);

                                  return (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-emerald-700 hover:text-emerald-800 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                                      onClick={() => sonnerToast.success(`Abonnement actif : ${rem} jours restants`)}
                                      title="Voir les jours restants de l'abonnement"
                                    >
                                      <Check className="h-4 w-4 mr-2" />
                                      {rem} jours restants
                                    </Button>
                                  );
                                })()
                              ) : (
                                <Button
                                  size="sm"
                                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                                  onClick={() => {
                                    setSelectedChildForActivation(link.child_id);
                                    setActivationCode("");
                                    setActivationDialogOpen(true);
                                  }}
                                  title="Ajouter un code d'abonnement pour cet enfant"
                                >
                                  <Key className="h-4 w-4 mr-2" />
                                  Activer l'abonnement
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedChild(link)}
                                title="Voir le tableau de bord et la progression de cet enfant"
                              >
                                <Eye className="h-4 w-4 mr-2" />Tableau de bord
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/parent-cours/${link.child_id}`)}
                                title="Consulter les leçons et le contenu de cours"
                              >
                                <BookOpen className="h-4 w-4 mr-2" />Contenu des cours
                              </Button>
                              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleRemoveChild(link.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ParentDashboard;
