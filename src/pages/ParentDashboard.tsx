import { useEffect, useState, useCallback } from "react";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSessionState } from "@/hooks/useSessionState";
import { Card, CardContent } from "@/components/ui/card";
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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  GraduationCap, UserIcon, UserPlus, Hash, Eye, Trash2, Loader2, ArrowLeft, Plus, BookOpen, Key, Check, Calendar as CalendarIcon, FileDown, FileText, Users, RefreshCw
} from "lucide-react";
import { downloadParentReportPdf, type ParentReportData } from "@/lib/parentReportPdf";
import { toast as sonnerToast } from "sonner";
import { getSchoolLevelLabel, allSchoolLevels } from "@/lib/validation";
import StudentDashboardContent from "@/components/dashboard/StudentDashboardContent";
import ParentTeacherChat from "@/components/messaging/ParentTeacherChat";
import { format, parse, isValid } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import LocationFields from "@/components/profile/LocationFields";
import { AppHeader } from "@/components/layout/AppHeader";

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
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [children, setChildren] = useState<LinkedChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [childrenLoading, setChildrenLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // Persisté en sessionStorage : un changement de fenêtre peut faire décharger
  // puis recharger l'onglet par le navigateur, ce qui remonterait le composant
  // et ramènerait sinon silencieusement le parent à l'écran de sélection d'enfant.
  const [selectedChild, setSelectedChild] = useSessionState<LinkedChild | null>("parentDashboard:selectedChild", null);
  const [removingChildId, setRemovingChildId] = useState<string | null>(null);

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
      sonnerToast.error("Erreur", { description: error.message });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchChildren = useCallback(async (userId: string) => {
    setChildrenLoading(true);
    try {
      const { data, error } = await supabase
        .from("parent_child_links")
        .select(`id, child_id, status, created_at, child:profiles!parent_child_links_child_id_fkey(id, first_name, last_name, email, school_level, filiere, avatar_url)`)
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
          const totalUsed = Number(sub.days_used || 0) + elapsed;
          const remaining = Number(sub.total_days || 0) - totalUsed;

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
      await downloadParentReportPdf(report.report_data, report.generated_at);
      return;
    }
    // No report yet: generate a fresh one
    await generateReport(childId);
  };

  const generateReport = async (childId: string) => {
    setGeneratingFor(childId);
    try {
      const { data, error } = await supabase.functions.invoke("generate-parent-report", {
        body: { child_id: childId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const r = data?.report;
      if (r?.report_data) {
        await downloadParentReportPdf(r.report_data, r.generated_at);
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
    setRemovingChildId(linkId);
    try {
      const { error } = await supabase.from("parent_child_links").delete().eq("id", linkId);
      if (error) throw error;
      if (user) fetchChildren(user.id);
      sonnerToast.success("Lien supprimé avec succès");
    } catch (error: any) {
      sonnerToast.error("Erreur lors de la suppression du lien");
    } finally {
      setRemovingChildId(null);
    }
  };

  const handleActivateSubscription = async () => {
    if (!activationCode.trim() || !selectedChildForActivation || !user) return;
    setActivating(true);

    try {
      const { data: sub, error } = await supabase.rpc("redeem_activation_code" as any, {
        p_code: activationCode.trim().toUpperCase(),
        p_target_user_id: selectedChildForActivation,
      });

      if (error) throw error;

      const totalDays = (sub as any)?.total_days;
      sonnerToast.success(totalDays ? `Abonnement activé (${totalDays} jours)` : "Abonnement activé");
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
      <div className="min-h-screen pro-shell">
        <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border/60 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16 gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedChild(null)}
                  className="gap-2 rounded-xl shrink-0 text-muted-foreground hover:text-foreground active:scale-95 transition-transform"
                >
                  <ArrowLeft className="h-4 w-4" /> Retour
                </Button>
                <div className="w-9 h-9 rounded-xl bg-[image:var(--gradient-primary)] flex items-center justify-center shadow-sm shrink-0">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-foreground hidden sm:block">AcadémiePlus</span>
              </div>
              <p className="text-sm text-muted-foreground truncate flex-1">
                Progression de {getChildFullName(selectedChild.child)}
              </p>
              <LanguageToggle />
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <StudentDashboardContent
              userId={selectedChild.child_id}
              profile={selectedChild.child}
              hideActions
              parentView
            />
            <div className="mt-6">
              <ParentTeacherChat
                studentId={selectedChild.child_id}
                studentName={getChildFullName(selectedChild.child)}
                role="parent"
              />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pro-shell">
      <AppHeader />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
        >
          <div>
            <h1 className="font-display text-2xl font-extrabold text-foreground">Bonjour {fullName} 👋</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Suivez la progression de vos enfants</p>
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
                  <Button className="gap-2 rounded-xl shadow-sm active:scale-95 transition-transform"><Plus className="h-4 w-4" />Ajouter un élève</Button>
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
                  <Button variant="outline" className="gap-2 rounded-xl active:scale-95 transition-transform"><UserPlus className="h-4 w-4" />Ajouter un lien de parenté</Button>
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
        >
          <Card className="pro-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Mes enfants</h2>
                <p className="text-xs text-muted-foreground">Cliquez sur "Tableau de bord" pour consulter la progression de votre enfant</p>
              </div>
            </div>
            <CardContent className="p-6">
              {childrenLoading ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : children.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="mx-auto mb-4 h-14 w-14 rounded-xl bg-muted flex items-center justify-center">
                    <Users className="h-7 w-7 opacity-50" />
                  </div>
                  <p className="text-base font-medium text-foreground">Aucun enfant lié pour le moment</p>
                  <p className="text-sm mt-0.5">Cliquez sur "Ajouter un élève" pour commencer</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-6 px-6">
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
                              <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                                <AvatarImage src={link.child?.avatar_url || undefined} />
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">{initials || <UserIcon className="h-4 w-4" />}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{childName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{link.child?.email ?? "—"}</TableCell>
                          <TableCell>
                            {link.child?.school_level ? (
                              <Badge variant="outline" className="rounded-full">{getSchoolLevelLabel(link.child.school_level)}</Badge>
                            ) : <span className="text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell>
                            <Badge variant={link.status === "active" ? "default" : "secondary"} className="rounded-full">
                              {link.status === "active" ? "Actif" : "En attente"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const report = latestReports[link.child_id];
                              const isGen = generatingFor === link.child_id;
                              if (report) {
                                return (
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="gap-2 rounded-xl active:scale-95 transition-transform"
                                      onClick={() => handleDownloadReport(link.child_id)}
                                      title={`Télécharger le rapport du ${new Date(report.generated_at).toLocaleDateString("fr-FR")}`}
                                    >
                                      <FileDown className="h-4 w-4" />
                                      {new Date(report.generated_at).toLocaleDateString("fr-FR")}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="gap-2 rounded-xl active:scale-95 transition-transform"
                                      disabled={isGen}
                                      onClick={() => generateReport(link.child_id)}
                                      title="Régénérer un nouveau rapport maintenant"
                                    >
                                      {isGen ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                                      {isGen ? "Génération…" : "Régénérer"}
                                    </Button>
                                  </div>
                                );
                              }
                              return (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="gap-2 text-muted-foreground rounded-xl active:scale-95 transition-transform"
                                  disabled={isGen}
                                  onClick={() => handleDownloadReport(link.child_id)}
                                  title="Générer et télécharger un rapport maintenant"
                                >
                                  {isGen ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                                  {isGen ? "Génération…" : "Générer"}
                                </Button>
                              );
                            })()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2 flex-wrap">
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
                                      className="rounded-xl text-emerald-700 hover:text-emerald-800 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 active:scale-95 transition-transform"
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
                                  className="rounded-xl active:scale-95 transition-transform"
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
                                className="rounded-xl active:scale-95 transition-transform"
                                onClick={() => setSelectedChild(link)}
                                title="Voir le tableau de bord et la progression de cet enfant"
                              >
                                <Eye className="h-4 w-4 mr-2" />Tableau de bord
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl active:scale-95 transition-transform"
                                onClick={() => navigate(`/parent-cours/${link.child_id}`)}
                                title="Consulter les leçons et le contenu de cours"
                              >
                                <BookOpen className="h-4 w-4 mr-2" />Contenu des cours
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={removingChildId === link.id}
                                    className="rounded-xl h-9 w-9 shrink-0 text-destructive hover:text-destructive active:scale-95 transition-transform"
                                    title="Supprimer le lien avec cet enfant"
                                    aria-label="Supprimer le lien avec cet enfant"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-2xl">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Retirer ce lien ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Vous n'aurez plus accès au tableau de bord ni au suivi de cet enfant. Cette action est irréversible.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleRemoveChild(link.id)}
                                      className="rounded-xl bg-destructive hover:bg-destructive/90"
                                    >
                                      Confirmer
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default ParentDashboard;
