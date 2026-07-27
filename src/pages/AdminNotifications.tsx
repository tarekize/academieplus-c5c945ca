import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Bell, Mail, Plus, Pencil, Trash2, Loader2, Send, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { extractFunctionErrorMessage } from "@/lib/edgeFunctionError";
import { cn } from "@/lib/utils";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body_text: string;
  logo_url: string | null;
  created_by_name: string | null;
  updated_at: string;
}

interface NotificationCandidate {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  role: string;
  contract_status: string;
}

interface EmailCampaign {
  id: string;
  template_name_snapshot: string;
  subject_snapshot: string;
  filter_roles: string[];
  filter_contract_status: string;
  recipient_count: number;
  success_count: number;
  failure_count: number;
  sent_by_name: string | null;
  created_at: string;
}

const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: "student", label: "Élèves" },
  { value: "teacher", label: "Enseignants" },
  { value: "pedago", label: "Pédagogues" },
  { value: "etablissement", label: "Établissements" },
  { value: "parent", label: "Parents" },
];

const CONTRACT_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Tous, peu importe le contrat/abonnement" },
  { value: "no_contract", label: "Sans contrat / abonnement" },
  { value: "has_contract", label: "Avec contrat / abonnement" },
  { value: "expiring_soon", label: "Contrat / abonnement bientôt expiré (30 jours)" },
  { value: "expired", label: "Contrat / abonnement déjà expiré" },
];

const roleLabel = (value: string) => ROLE_OPTIONS.find((r) => r.value === value)?.label || value;
const contractStatusLabel = (value: string) => CONTRACT_STATUS_OPTIONS.find((c) => c.value === value)?.label || value;

const CONTRACT_STATUS_SHORT: Record<string, string> = {
  no_contract: "Sans contrat",
  has_contract: "Avec contrat",
  expiring_soon: "Bientôt expiré",
  expired: "Expiré",
};

const contractStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  if (status === "expired") return "destructive";
  if (status === "no_contract") return "secondary";
  return "outline";
};

const contractStatusBadgeClass = (status: string): string =>
  status === "expiring_soon" ? "border-orange-400 text-orange-700 dark:text-orange-400" : "";

const emptyTemplateForm = { name: "", subject: "", bodyText: "", logoUrl: "" };

export default function AdminNotifications() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);

  // Template dialog
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateForm, setTemplateForm] = useState(emptyTemplateForm);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Send campaign
  const [candidates, setCandidates] = useState<NotificationCandidate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string[]>([]);
  const [contractFilter, setContractFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchTemplates(), fetchCampaigns(), fetchCandidates()]);
    setLoading(false);
  };

  const fetchCandidates = async () => {
    const { data, error } = await supabase.rpc("admin_list_notification_candidates" as any);
    if (error) {
      toast.error("Erreur", { description: error.message });
      return;
    }
    setCandidates((data as any) || []);
  };

  const fetchTemplates = async () => {
    const { data, error } = await supabase
      .from("email_templates" as any)
      .select("id, name, subject, body_text, logo_url, created_by_name, updated_at")
      .order("updated_at", { ascending: false });
    if (error) {
      toast.error("Erreur", { description: error.message });
      return;
    }
    setTemplates((data as any) || []);
  };

  const fetchCampaigns = async () => {
    const { data, error } = await supabase
      .from("email_campaigns" as any)
      .select("id, template_name_snapshot, subject_snapshot, filter_roles, filter_contract_status, recipient_count, success_count, failure_count, sent_by_name, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) {
      toast.error("Erreur", { description: error.message });
      return;
    }
    setCampaigns((data as any) || []);
  };

  const openCreateTemplate = () => {
    setEditingTemplateId(null);
    setTemplateForm(emptyTemplateForm);
    setTemplateDialogOpen(true);
  };

  const openEditTemplate = (template: EmailTemplate) => {
    setEditingTemplateId(template.id);
    setTemplateForm({
      name: template.name,
      subject: template.subject,
      bodyText: template.body_text,
      logoUrl: template.logo_url || "",
    });
    setTemplateDialogOpen(true);
  };

  const LOGO_ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
  const LOGO_MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 Mo

  const handleLogoUpload = async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !LOGO_ALLOWED_EXTENSIONS.includes(ext)) {
      toast.error("Format non supporté. Utilisez JPG, PNG, GIF, WebP ou SVG.");
      return;
    }
    if (file.size > LOGO_MAX_FILE_SIZE) {
      toast.error("Fichier trop volumineux. Maximum 2 Mo.");
      return;
    }
    setUploadingLogo(true);
    try {
      const fileName = `logos/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("email-assets").upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("email-assets").getPublicUrl(fileName);
      setTemplateForm((f) => ({ ...f, logoUrl: data.publicUrl }));
    } catch (error: any) {
      toast.error("Erreur lors de l'envoi du logo", { description: error.message });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateForm.name.trim() || !templateForm.subject.trim() || !templateForm.bodyText.trim()) {
      toast.error("Nom, sujet et contenu sont requis.");
      return;
    }
    setSavingTemplate(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { data: profileData } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", userData.user?.id)
        .maybeSingle();
      const createdByName = [profileData?.first_name, profileData?.last_name].filter(Boolean).join(" ") || null;

      const payload = {
        name: templateForm.name.trim(),
        subject: templateForm.subject.trim(),
        body_text: templateForm.bodyText,
        logo_url: templateForm.logoUrl || null,
      };

      if (editingTemplateId) {
        const { error } = await supabase.from("email_templates" as any).update(payload).eq("id", editingTemplateId);
        if (error) throw error;
        toast.success("Modèle mis à jour.");
      } else {
        const { error } = await supabase.from("email_templates" as any).insert({
          ...payload,
          created_by: userData.user?.id,
          created_by_name: createdByName,
        });
        if (error) throw error;
        toast.success("Modèle créé.");
      }

      setTemplateDialogOpen(false);
      fetchTemplates();
    } catch (error: any) {
      toast.error("Erreur", { description: error.message });
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    const { error } = await supabase.from("email_templates" as any).delete().eq("id", id);
    if (error) {
      toast.error("Erreur", { description: error.message });
      return;
    }
    toast.success("Modèle supprimé.");
    if (selectedTemplateId === id) setSelectedTemplateId("");
    fetchTemplates();
  };

  const toggleRoleFilter = (role: string) => {
    setRoleFilter((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));
  };

  // Liste vide de filtre rôle = aucune restriction (tout le monde visible),
  // conforme à l'affichage initial "tous les utilisateurs" avant tout filtre.
  const visibleCandidates = candidates.filter((c) => {
    if (roleFilter.length > 0 && !roleFilter.includes(c.role)) return false;
    if (contractFilter !== "all" && c.contract_status !== contractFilter) return false;
    return true;
  });

  const allVisibleSelected = visibleCandidates.length > 0 && visibleCandidates.every((c) => selectedIds.has(c.id));

  const toggleSelectAllVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        visibleCandidates.forEach((c) => next.delete(c.id));
      } else {
        visibleCandidates.forEach((c) => next.add(c.id));
      }
      return next;
    });
  };

  const toggleCandidateSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSendCampaign = async () => {
    if (!selectedTemplateId || selectedIds.size === 0) return;
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-bulk-notification", {
        body: { templateId: selectedTemplateId, recipientIds: Array.from(selectedIds) },
      });
      if (error) throw new Error(await extractFunctionErrorMessage(error));
      toast.success("Campagne envoyée", {
        description: `${data.successCount}/${data.recipientCount} email(s) envoyé(s)${data.failureCount ? `, ${data.failureCount} échec(s)` : ""}.`,
      });
      setSelectedIds(new Set());
      fetchCampaigns();
    } catch (error: any) {
      toast.error("Échec de l'envoi", { description: error.message });
    } finally {
      setSending(false);
    }
  };

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pro-shell">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Retour
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-extrabold">Notifications</h1>
                <p className="text-sm text-muted-foreground">Modèles d'email, rappels et campagnes ciblées</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="send">
          <TabsList className="rounded-xl">
            <TabsTrigger value="send" className="rounded-lg">Envoyer</TabsTrigger>
            <TabsTrigger value="templates" className="rounded-lg">Modèles</TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg">Historique</TabsTrigger>
          </TabsList>

          {/* SEND */}
          <TabsContent value="send" className="mt-4">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle>Envoyer une campagne</CardTitle>
                <CardDescription>
                  Tous les utilisateurs sont affichés ci-dessous. Le filtre ne fait que réduire la liste — cochez qui doit recevoir l'email. {"{{prenom}}"}, {"{{nom}}"} et {"{{email}}"} sont remplacés automatiquement.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {templates.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Créez d'abord un modèle dans l'onglet « Modèles » avant de pouvoir envoyer une campagne.
                  </p>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Modèle d'email</Label>
                      <select
                        className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                        value={selectedTemplateId}
                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                      >
                        <option value="">— Sélectionner un modèle —</option>
                        {templates.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>Filtrer par rôle</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {ROLE_OPTIONS.map((role) => (
                          <label key={role.value} className="flex items-center gap-2 text-sm cursor-pointer">
                            <Checkbox
                              checked={roleFilter.includes(role.value)}
                              onCheckedChange={() => toggleRoleFilter(role.value)}
                            />
                            {role.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Filtrer par statut contrat / abonnement</Label>
                      <RadioGroup value={contractFilter} onValueChange={setContractFilter} className="space-y-2">
                        {CONTRACT_STATUS_OPTIONS.map((opt) => (
                          <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
                            <RadioGroupItem value={opt.value} />
                            {opt.label}
                          </label>
                        ))}
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <Label>Destinataires</Label>
                        <p className="text-xs text-muted-foreground">
                          {visibleCandidates.length} affiché{visibleCandidates.length !== 1 ? "s" : ""} sur {candidates.length} au total — {selectedIds.size} sélectionné{selectedIds.size !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="border border-border rounded-lg overflow-hidden">
                        <div className="flex items-center gap-3 px-4 py-2.5 bg-muted/40 border-b border-border">
                          <Checkbox
                            checked={allVisibleSelected}
                            onCheckedChange={toggleSelectAllVisible}
                            disabled={visibleCandidates.length === 0}
                          />
                          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Tout sélectionner ({visibleCandidates.length})
                          </span>
                        </div>
                        <div className="max-h-80 overflow-y-auto divide-y divide-border">
                          {visibleCandidates.length === 0 ? (
                            <p className="text-sm text-muted-foreground p-4">Aucun utilisateur ne correspond à ce filtre.</p>
                          ) : (
                            visibleCandidates.map((c) => (
                              <label
                                key={c.id}
                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors cursor-pointer"
                              >
                                <Checkbox
                                  checked={selectedIds.has(c.id)}
                                  onCheckedChange={() => toggleCandidateSelection(c.id)}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {[c.first_name, c.last_name].filter(Boolean).join(" ") || "Sans nom"}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                                </div>
                                <Badge variant="outline" className="rounded-full shrink-0">{roleLabel(c.role)}</Badge>
                                <Badge variant={contractStatusBadgeVariant(c.contract_status)} className={cn("rounded-full shrink-0", contractStatusBadgeClass(c.contract_status))}>
                                  {CONTRACT_STATUS_SHORT[c.contract_status] || c.contract_status}
                                </Badge>
                              </label>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          className="gap-2"
                          disabled={!selectedTemplateId || selectedIds.size === 0 || sending}
                        >
                          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          Envoyer à {selectedIds.size} destinataire{selectedIds.size !== 1 ? "s" : ""}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmer l'envoi</AlertDialogTitle>
                          <AlertDialogDescription>
                            Vous allez envoyer « {selectedTemplate?.name} » à {selectedIds.size} destinataire{selectedIds.size !== 1 ? "s" : ""} sélectionné{selectedIds.size !== 1 ? "s" : ""}. Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={handleSendCampaign}>Envoyer</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TEMPLATES */}
          <TabsContent value="templates" className="mt-4">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b bg-muted/30 flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle>Modèles d'email</CardTitle>
                  <CardDescription>Réutilisables pour vos campagnes et rappels</CardDescription>
                </div>
                <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={openCreateTemplate} className="gap-2">
                      <Plus className="h-4 w-4" /> Nouveau modèle
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingTemplateId ? "Modifier le modèle" : "Nouveau modèle d'email"}</DialogTitle>
                      <DialogDescription>
                        Utilisez {"{{prenom}}"}, {"{{nom}}"} ou {"{{email}}"} dans le sujet ou le contenu pour personnaliser chaque envoi.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <div className="space-y-2">
                        <Label>Logo (optionnel)</Label>
                        {templateForm.logoUrl ? (
                          <div className="flex items-center gap-3">
                            <img src={templateForm.logoUrl} alt="Logo" className="h-12 max-w-[160px] object-contain rounded border border-border p-1" />
                            <Button type="button" variant="ghost" size="sm" onClick={() => setTemplateForm((f) => ({ ...f, logoUrl: "" }))}>
                              <X className="h-4 w-4 mr-1" /> Retirer
                            </Button>
                          </div>
                        ) : (
                          <label className="flex items-center gap-2 text-sm border border-dashed border-border rounded-lg px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors w-fit">
                            {uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                            {uploadingLogo ? "Envoi en cours..." : "Importer un logo"}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={uploadingLogo}
                              onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
                            />
                          </label>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="template-name">Nom du modèle</Label>
                        <Input
                          id="template-name"
                          value={templateForm.name}
                          onChange={(e) => setTemplateForm((f) => ({ ...f, name: e.target.value }))}
                          placeholder="Ex : Rappel d'expiration de contrat"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="template-subject">Sujet de l'email</Label>
                        <Input
                          id="template-subject"
                          value={templateForm.subject}
                          onChange={(e) => setTemplateForm((f) => ({ ...f, subject: e.target.value }))}
                          placeholder="Ex : Bonjour {{prenom}}, votre contrat arrive à échéance"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="template-body">Contenu du message</Label>
                        <Textarea
                          id="template-body"
                          rows={8}
                          value={templateForm.bodyText}
                          onChange={(e) => setTemplateForm((f) => ({ ...f, bodyText: e.target.value }))}
                          placeholder={"Bonjour {{prenom}},\n\nVotre message ici, un paragraphe par ligne.\n\n— L'équipe AcademiePlus"}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setTemplateDialogOpen(false)}>Annuler</Button>
                      <Button onClick={handleSaveTemplate} disabled={savingTemplate}>
                        {savingTemplate ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                        {editingTemplateId ? "Enregistrer" : "Créer"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="p-0">
                {templates.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-6">Aucun modèle pour le moment.</p>
                ) : (
                  <div className="divide-y divide-border">
                    {templates.map((template) => (
                      <div key={template.id} className="flex items-center gap-4 px-6 py-4">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                          {template.logo_url ? (
                            <img src={template.logo_url} alt="" className="h-full w-full object-contain" />
                          ) : (
                            <Mail className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{template.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{template.subject}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => openEditTemplate(template)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer ce modèle ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                « {template.name} » sera définitivement supprimé. Les campagnes déjà envoyées avec ce modèle restent dans l'historique.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteTemplate(template.id)}>Supprimer</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* HISTORY */}
          <TabsContent value="history" className="mt-4">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle>Historique des campagnes</CardTitle>
                <CardDescription>50 derniers envois</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {campaigns.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-6">Aucune campagne envoyée pour le moment.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Modèle</TableHead>
                          <TableHead>Filtre</TableHead>
                          <TableHead>Résultat</TableHead>
                          <TableHead>Envoyé par</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {campaigns.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                              {format(new Date(c.created_at), "dd MMM yyyy HH:mm", { locale: fr })}
                            </TableCell>
                            <TableCell className="text-sm font-medium">{c.template_name_snapshot}</TableCell>
                            <TableCell className="text-xs text-muted-foreground max-w-[260px]">
                              {c.filter_roles.map(roleLabel).join(", ")} — {contractStatusLabel(c.filter_contract_status)}
                            </TableCell>
                            <TableCell className="text-xs">
                              <Badge variant={c.failure_count > 0 ? "destructive" : "default"} className="rounded-full">
                                {c.success_count}/{c.recipient_count} envoyé{c.success_count !== 1 ? "s" : ""}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{c.sent_by_name || "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
