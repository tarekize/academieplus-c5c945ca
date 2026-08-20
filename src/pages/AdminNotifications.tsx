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
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
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
import { ArrowLeft, Bell, Mail, Plus, Pencil, Trash2, Loader2, Send, Image as ImageIcon, Paperclip, X, Zap, Hand, Search, CheckCircle2, XCircle, Eye } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { extractFunctionErrorMessage } from "@/lib/edgeFunctionError";
import { cn } from "@/lib/utils";
import { AppHeader } from "@/components/layout/AppHeader";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body_text: string;
  logo_url: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  created_by_name: string | null;
  updated_at: string;
  trigger_type: "manual" | "automatic";
  trigger_roles: string[];
  trigger_days_before: number | null;
  trigger_profile_status: "any" | "active" | "inactive";
  trigger_active: boolean;
  trigger_start_date: string | null;
  trigger_end_date: string | null;
}

interface EmailSendLogRow {
  id: string;
  source: "manual" | "automatic";
  template_name_snapshot: string;
  recipient_email: string;
  recipient_name: string | null;
  subject_sent: string;
  body_sent: string;
  status: "success" | "failed";
  error_message: string | null;
  created_at: string;
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

const emptyTemplateForm = {
  name: "", subject: "", bodyText: "", logoUrl: "",
  attachmentUrl: "", attachmentName: "",
  triggerType: "manual" as "manual" | "automatic",
  triggerRoles: [] as string[],
  triggerDaysBefore: "5",
  triggerProfileStatus: "any" as "any" | "active" | "inactive",
  triggerActive: true,
  triggerStartDate: "",
  triggerEndDate: "",
};

export default function AdminNotifications() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [sendLogs, setSendLogs] = useState<EmailSendLogRow[]>([]);

  // Template dialog
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateForm, setTemplateForm] = useState(emptyTemplateForm);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

  // History filters + selection (onglet Historique)
  const [historySearch, setHistorySearch] = useState("");
  const [historyTemplateFilter, setHistoryTemplateFilter] = useState("all");
  const [historyDateFrom, setHistoryDateFrom] = useState("");
  const [historyDateTo, setHistoryDateTo] = useState("");
  const [selectedLogIds, setSelectedLogIds] = useState<Set<string>>(new Set());
  const [deletingLogs, setDeletingLogs] = useState(false);
  const [viewingLog, setViewingLog] = useState<EmailSendLogRow | null>(null);

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

  // Charge en parallèle modèles, historique des campagnes, journal détaillé
  // des envois et destinataires potentiels au montage de la page.
  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchTemplates(), fetchCampaigns(), fetchCandidates(), fetchSendLogs()]);
    setLoading(false);
  };

  // Charge la liste des destinataires potentiels (tous rôles) avec leur
  // statut de contrat/abonnement calculé côté serveur, via la RPC
  // admin_list_notification_candidates (admin-only attendu côté serveur).
  const fetchCandidates = async () => {
    const { data, error } = await supabase.rpc("admin_list_notification_candidates" as any);
    if (error) {
      toast.error("Erreur", { description: error.message });
      return;
    }
    setCandidates((data as any) || []);
  };

  // Charge les modèles d'email réutilisables. Lecture directe de
  // email_templates : à couvrir par une policy RLS admin-only côté serveur.
  const fetchTemplates = async () => {
    const { data, error } = await supabase
      .from("email_templates" as any)
      .select("id, name, subject, body_text, logo_url, attachment_url, attachment_name, created_by_name, updated_at, trigger_type, trigger_roles, trigger_days_before, trigger_profile_status, trigger_active, trigger_start_date, trigger_end_date")
      .order("updated_at", { ascending: false });
    if (error) {
      toast.error("Erreur", { description: error.message });
      return;
    }
    setTemplates((data as any) || []);
  };

  // Charge les 200 derniers emails réellement envoyés (manuels + automatiques
  // confondus), un enregistrement par destinataire — alimente l'onglet
  // Historique (recherche/filtre/suppression). Lecture directe de
  // email_send_log : couverte par une policy RLS admin-only côté serveur.
  const fetchSendLogs = async () => {
    const { data, error } = await supabase
      .from("email_send_log" as any)
      .select("id, source, template_name_snapshot, recipient_email, recipient_name, subject_sent, body_sent, status, error_message, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      toast.error("Erreur", { description: error.message });
      return;
    }
    setSendLogs((data as any) || []);
  };

  // Charge les 50 dernières campagnes envoyées, pour l'onglet Historique.
  // Lecture directe de email_campaigns : à couvrir par une policy RLS
  // admin-only côté serveur.
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

  // Ouvre le dialogue Modèle à vide (bouton "Nouveau modèle").
  const openCreateTemplate = () => {
    setEditingTemplateId(null);
    setTemplateForm(emptyTemplateForm);
    setTemplateDialogOpen(true);
  };

  // Ouvre le dialogue Modèle préchargé avec les valeurs du modèle cliqué
  // (bouton crayon de la liste).
  const openEditTemplate = (template: EmailTemplate) => {
    setEditingTemplateId(template.id);
    setTemplateForm({
      name: template.name,
      subject: template.subject,
      bodyText: template.body_text,
      logoUrl: template.logo_url || "",
      attachmentUrl: template.attachment_url || "",
      attachmentName: template.attachment_name || "",
      triggerType: template.trigger_type,
      triggerRoles: template.trigger_roles || [],
      triggerDaysBefore: template.trigger_days_before != null ? String(template.trigger_days_before) : "5",
      triggerProfileStatus: template.trigger_profile_status,
      triggerActive: template.trigger_active,
      triggerStartDate: template.trigger_start_date || "",
      triggerEndDate: template.trigger_end_date || "",
    });
    setTemplateDialogOpen(true);
  };

  const toggleTemplateTriggerRole = (role: string) => {
    setTemplateForm((f) => ({
      ...f,
      triggerRoles: f.triggerRoles.includes(role) ? f.triggerRoles.filter((r) => r !== role) : [...f.triggerRoles, role],
    }));
  };

  const LOGO_ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
  const LOGO_MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 Mo

  // Upload le logo du modèle vers le bucket public "email-assets" (utilisé
  // tel quel dans l'email envoyé, d'où l'URL publique), après validation du
  // format et de la taille côté client. Déclenché par le champ fichier
  // "Importer un logo".
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

  const ATTACHMENT_ALLOWED_EXTENSIONS = ["pdf", "doc", "docx", "xls", "xlsx", "jpg", "jpeg", "png"];
  const ATTACHMENT_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo

  // Upload le document à joindre à l'email vers le bucket "email-assets"
  // (dossier attachments/), envoyé tel quel en pièce jointe par
  // send-bulk-notification / process-automatic-notifications.
  const handleAttachmentUpload = async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !ATTACHMENT_ALLOWED_EXTENSIONS.includes(ext)) {
      toast.error("Format non supporté. Utilisez PDF, Word, Excel, JPG ou PNG.");
      return;
    }
    if (file.size > ATTACHMENT_MAX_FILE_SIZE) {
      toast.error("Fichier trop volumineux. Maximum 10 Mo.");
      return;
    }
    setUploadingAttachment(true);
    try {
      const fileName = `attachments/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("email-assets").upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("email-assets").getPublicUrl(fileName);
      setTemplateForm((f) => ({ ...f, attachmentUrl: data.publicUrl, attachmentName: file.name }));
    } catch (error: any) {
      toast.error("Erreur lors de l'envoi de la pièce jointe", { description: error.message });
    } finally {
      setUploadingAttachment(false);
    }
  };

  // Crée ou met à jour un modèle d'email (bouton "Créer"/"Enregistrer" du
  // dialogue). Écriture directe sur email_templates : à couvrir par une
  // policy RLS admin-only côté serveur.
  const handleSaveTemplate = async () => {
    if (!templateForm.name.trim() || !templateForm.subject.trim() || !templateForm.bodyText.trim()) {
      toast.error("Nom, sujet et contenu sont requis.");
      return;
    }
    const daysBeforeNum = parseInt(templateForm.triggerDaysBefore, 10);
    if (templateForm.triggerType === "automatic" && (!Number.isFinite(daysBeforeNum) || daysBeforeNum < 0)) {
      toast.error("Indiquez un nombre de jours valide (0 ou plus) avant l'échéance.");
      return;
    }
    if (templateForm.triggerType === "automatic" && templateForm.triggerStartDate && templateForm.triggerEndDate && templateForm.triggerStartDate > templateForm.triggerEndDate) {
      toast.error("La date de fin doit être postérieure à la date de début.");
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
        attachment_url: templateForm.attachmentUrl || null,
        attachment_name: templateForm.attachmentName || null,
        trigger_type: templateForm.triggerType,
        trigger_roles: templateForm.triggerRoles,
        trigger_days_before: templateForm.triggerType === "automatic" ? daysBeforeNum : null,
        trigger_profile_status: templateForm.triggerProfileStatus,
        trigger_active: templateForm.triggerActive,
        trigger_start_date: templateForm.triggerType === "automatic" && templateForm.triggerStartDate ? templateForm.triggerStartDate : null,
        trigger_end_date: templateForm.triggerType === "automatic" && templateForm.triggerEndDate ? templateForm.triggerEndDate : null,
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

  // Supprime un modèle d'email (bouton corbeille + confirmation AlertDialog).
  // Écriture directe sur email_templates : à couvrir par une policy RLS
  // admin-only côté serveur.
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

  // Les modèles automatiques ne sont pas proposés dans l'onglet Envoyer :
  // ils sont déjà pris en charge par process-automatic-notifications, les
  // proposer ici risquerait un envoi manuel en double.
  const manualTemplates = templates.filter((t) => t.trigger_type === "manual");

  // Liste vide de filtre rôle = aucune restriction (tout le monde visible),
  // conforme à l'affichage initial "tous les utilisateurs" avant tout filtre.
  const visibleCandidates = candidates.filter((c) => {
    if (roleFilter.length > 0 && !roleFilter.includes(c.role)) return false;
    if (contractFilter !== "all" && c.contract_status !== contractFilter) return false;
    return true;
  });

  const allVisibleSelected = visibleCandidates.length > 0 && visibleCandidates.every((c) => selectedIds.has(c.id));

  // Coche/décoche tous les destinataires actuellement visibles (après filtre
  // rôle/contrat) — n'affecte jamais la sélection des candidats masqués par
  // le filtre. Déclenché par la case "Tout sélectionner".
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

  // Envoie la campagne aux destinataires cochés (bouton "Envoyer" +
  // confirmation AlertDialog), via l'edge function send-bulk-notification qui
  // doit vérifier côté serveur que l'appelant est admin avant d'envoyer les
  // emails et d'enregistrer la campagne dans email_campaigns.
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
      fetchSendLogs();
    } catch (error: any) {
      toast.error("Échec de l'envoi", { description: error.message });
    } finally {
      setSending(false);
    }
  };

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || null;

  // Onglet Historique : liste des modèles distincts déjà présents dans le
  // journal, pour peupler le filtre (indépendant des modèles encore
  // existants — un modèle supprimé reste filtrable via son nom figé).
  const historyTemplateOptions = [...new Set(sendLogs.map((l) => l.template_name_snapshot))].sort();

  const filteredSendLogs = sendLogs.filter((log) => {
    if (historyTemplateFilter !== "all" && log.template_name_snapshot !== historyTemplateFilter) return false;
    if (historyDateFrom && log.created_at.slice(0, 10) < historyDateFrom) return false;
    if (historyDateTo && log.created_at.slice(0, 10) > historyDateTo) return false;
    if (historySearch.trim()) {
      const q = historySearch.trim().toLowerCase();
      const haystack = `${log.recipient_email} ${log.recipient_name || ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const allFilteredLogsSelected = filteredSendLogs.length > 0 && filteredSendLogs.every((l) => selectedLogIds.has(l.id));

  const toggleSelectAllFilteredLogs = () => {
    setSelectedLogIds((prev) => {
      const next = new Set(prev);
      if (allFilteredLogsSelected) {
        filteredSendLogs.forEach((l) => next.delete(l.id));
      } else {
        filteredSendLogs.forEach((l) => next.add(l.id));
      }
      return next;
    });
  };

  const toggleLogSelection = (id: string) => {
    setSelectedLogIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Supprime un ou plusieurs enregistrements du journal détaillé (bouton
  // corbeille unitaire, ou "Supprimer la sélection" en masse) — n'affecte ni
  // email_campaigns (compteurs agrégés déjà figés) ni la déduplication
  // automatic_notification_log.
  const handleDeleteSendLogs = async (ids: string[]) => {
    if (ids.length === 0) return;
    setDeletingLogs(true);
    try {
      const { error } = await supabase.from("email_send_log" as any).delete().in("id", ids);
      if (error) throw error;
      toast.success(ids.length > 1 ? `${ids.length} entrées supprimées.` : "Entrée supprimée.");
      setSelectedLogIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
      fetchSendLogs();
    } catch (error: any) {
      toast.error("Erreur", { description: error.message });
    } finally {
      setDeletingLogs(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pro-shell">
      <AppHeader
        title="Notifications"
        subtitle="Modèles d'email, rappels et campagnes ciblées"
        titleIcon={Bell}
        onBack={() => navigate("/dashboard")}
      />

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
                {manualTemplates.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {templates.length === 0
                      ? "Créez d'abord un modèle dans l'onglet « Modèles » avant de pouvoir envoyer une campagne."
                      : "Tous vos modèles sont automatiques. Créez un modèle manuel dans l'onglet « Modèles » pour envoyer une campagne ponctuelle."}
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
                        {manualTemplates.map((t) => (
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
                        <Label>Pièce jointe (optionnel)</Label>
                        {templateForm.attachmentUrl ? (
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-2 text-sm border border-border rounded-lg px-3 py-2">
                              <Paperclip className="h-4 w-4 text-muted-foreground" /> {templateForm.attachmentName || "Fichier joint"}
                            </span>
                            <Button type="button" variant="ghost" size="sm" onClick={() => setTemplateForm((f) => ({ ...f, attachmentUrl: "", attachmentName: "" }))}>
                              <X className="h-4 w-4 mr-1" /> Retirer
                            </Button>
                          </div>
                        ) : (
                          <label className="flex items-center gap-2 text-sm border border-dashed border-border rounded-lg px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors w-fit">
                            {uploadingAttachment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
                            {uploadingAttachment ? "Envoi en cours..." : "Joindre un document"}
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
                              className="hidden"
                              disabled={uploadingAttachment}
                              onChange={(e) => e.target.files?.[0] && handleAttachmentUpload(e.target.files[0])}
                            />
                          </label>
                        )}
                        <p className="text-xs text-muted-foreground">PDF, Word, Excel, JPG ou PNG — joint tel quel à chaque email envoyé avec ce modèle.</p>
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

                      <div className="space-y-2 pt-2 border-t border-border">
                        <Label>Type de modèle</Label>
                        <RadioGroup
                          value={templateForm.triggerType}
                          onValueChange={(v) => setTemplateForm((f) => ({ ...f, triggerType: v as "manual" | "automatic" }))}
                          className="grid grid-cols-2 gap-3"
                        >
                          <label className={cn(
                            "flex items-start gap-2.5 text-sm cursor-pointer border rounded-lg p-3 transition-colors",
                            templateForm.triggerType === "manual" ? "border-primary bg-primary/5" : "border-border"
                          )}>
                            <RadioGroupItem value="manual" className="mt-0.5" />
                            <span>
                              <span className="flex items-center gap-1.5 font-medium"><Hand className="h-3.5 w-3.5" /> Manuel</span>
                              <span className="block text-xs text-muted-foreground mt-0.5">Envoyé à la main depuis l'onglet Envoyer.</span>
                            </span>
                          </label>
                          <label className={cn(
                            "flex items-start gap-2.5 text-sm cursor-pointer border rounded-lg p-3 transition-colors",
                            templateForm.triggerType === "automatic" ? "border-primary bg-primary/5" : "border-border"
                          )}>
                            <RadioGroupItem value="automatic" className="mt-0.5" />
                            <span>
                              <span className="flex items-center gap-1.5 font-medium"><Zap className="h-3.5 w-3.5" /> Automatique</span>
                              <span className="block text-xs text-muted-foreground mt-0.5">Envoyé seul quand la condition ci-dessous est remplie.</span>
                            </span>
                          </label>
                        </RadioGroup>
                      </div>

                      {templateForm.triggerType === "automatic" && (
                        <div className="space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <Label>Condition active</Label>
                              <p className="text-xs text-muted-foreground">Désactivez pour suspendre les envois automatiques sans supprimer le modèle.</p>
                            </div>
                            <Switch
                              checked={templateForm.triggerActive}
                              onCheckedChange={(checked) => setTemplateForm((f) => ({ ...f, triggerActive: checked }))}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="template-days-before">Jours avant l'échéance du contrat/abonnement</Label>
                            <Input
                              id="template-days-before"
                              type="number"
                              min={0}
                              value={templateForm.triggerDaysBefore}
                              onChange={(e) => setTemplateForm((f) => ({ ...f, triggerDaysBefore: e.target.value }))}
                              placeholder="Ex : 5"
                              className="w-32"
                            />
                            <p className="text-xs text-muted-foreground">
                              Envoyé une fois par échéance dès qu'il reste ce nombre de jours ou moins avant l'expiration du contrat (établissement) ou de l'abonnement (élève/enseignant/pédago/parent).
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor="template-start-date">Actif à partir du</Label>
                              <Input
                                id="template-start-date"
                                type="date"
                                value={templateForm.triggerStartDate}
                                onChange={(e) => setTemplateForm((f) => ({ ...f, triggerStartDate: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="template-end-date">Actif jusqu'au</Label>
                              <Input
                                id="template-end-date"
                                type="date"
                                value={templateForm.triggerEndDate}
                                onChange={(e) => setTemplateForm((f) => ({ ...f, triggerEndDate: e.target.value }))}
                              />
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground -mt-2">Laissez vide pour aucune limite. En dehors de cette période, le modèle automatique n'envoie rien.</p>

                          <div className="space-y-2">
                            <Label>Rôles ciblés</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {ROLE_OPTIONS.map((role) => (
                                <label key={role.value} className="flex items-center gap-2 text-sm cursor-pointer">
                                  <Checkbox
                                    checked={templateForm.triggerRoles.includes(role.value)}
                                    onCheckedChange={() => toggleTemplateTriggerRole(role.value)}
                                  />
                                  {role.label}
                                </label>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground">Aucun rôle coché = tous les rôles.</p>
                          </div>

                          <div className="space-y-2">
                            <Label>Statut du profil</Label>
                            <Select
                              value={templateForm.triggerProfileStatus}
                              onValueChange={(v) => setTemplateForm((f) => ({ ...f, triggerProfileStatus: v as "any" | "active" | "inactive" }))}
                            >
                              <SelectTrigger className="w-full sm:w-64">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="any">Peu importe</SelectItem>
                                <SelectItem value="active">Compte actif uniquement</SelectItem>
                                <SelectItem value="inactive">Compte désactivé uniquement</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
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
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium text-foreground truncate">{template.name}</p>
                            {template.trigger_type === "automatic" ? (
                              <Badge variant={template.trigger_active ? "default" : "secondary"} className="rounded-full gap-1 shrink-0">
                                <Zap className="h-3 w-3" /> Auto — {template.trigger_days_before}j avant échéance{!template.trigger_active ? " (suspendu)" : ""}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="rounded-full gap-1 shrink-0">
                                <Hand className="h-3 w-3" /> Manuel
                              </Badge>
                            )}
                          </div>
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
                <CardDescription>Résumé des 50 dernières campagnes manuelles — détail par destinataire ci-dessous</CardDescription>
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

            {/* Journal détaillé : un enregistrement par email réellement envoyé
                (manuel ou automatique), recherchable/filtrable et supprimable
                à l'unité ou en masse. */}
            <Card className="border-0 shadow-lg mt-4">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle>Journal des notifications envoyées</CardTitle>
                <CardDescription>200 derniers emails — destinataire, contenu envoyé, modèle et date</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-wrap items-end gap-3">
                  <div className="space-y-1.5 flex-1 min-w-[220px]">
                    <Label className="text-xs">Rechercher un destinataire</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-9"
                        placeholder="Nom ou email..."
                        value={historySearch}
                        onChange={(e) => setHistorySearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Modèle</Label>
                    <select
                      className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
                      value={historyTemplateFilter}
                      onChange={(e) => setHistoryTemplateFilter(e.target.value)}
                    >
                      <option value="all">Tous les modèles</option>
                      {historyTemplateOptions.map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Du</Label>
                    <Input type="date" value={historyDateFrom} onChange={(e) => setHistoryDateFrom(e.target.value)} className="w-40" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Au</Label>
                    <Input type="date" value={historyDateTo} onChange={(e) => setHistoryDateTo(e.target.value)} className="w-40" />
                  </div>
                  {(historySearch || historyTemplateFilter !== "all" || historyDateFrom || historyDateTo) && (
                    <Button variant="ghost" size="sm" onClick={() => { setHistorySearch(""); setHistoryTemplateFilter("all"); setHistoryDateFrom(""); setHistoryDateTo(""); }}>
                      Réinitialiser
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-xs text-muted-foreground">
                    {filteredSendLogs.length} entrée{filteredSendLogs.length !== 1 ? "s" : ""} affichée{filteredSendLogs.length !== 1 ? "s" : ""} sur {sendLogs.length} — {selectedLogIds.size} sélectionnée{selectedLogIds.size !== 1 ? "s" : ""}
                  </p>
                  {selectedLogIds.size > 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="gap-2" disabled={deletingLogs}>
                          {deletingLogs ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          Supprimer la sélection ({selectedLogIds.size})
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer {selectedLogIds.size} entrée{selectedLogIds.size !== 1 ? "s" : ""} du journal ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. Les emails déjà envoyés ne sont pas rappelés — seul leur enregistrement dans le journal est supprimé.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteSendLogs(Array.from(selectedLogIds))}>Supprimer</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>

                <div className="border border-border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">
                          <Checkbox checked={allFilteredLogsSelected} onCheckedChange={toggleSelectAllFilteredLogs} disabled={filteredSendLogs.length === 0} />
                        </TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Destinataire</TableHead>
                        <TableHead>Modèle</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Contenu</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSendLogs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-sm text-muted-foreground text-center py-8">
                            {sendLogs.length === 0 ? "Aucune notification envoyée pour le moment." : "Aucune entrée ne correspond à ces filtres."}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredSendLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>
                              <Checkbox checked={selectedLogIds.has(log.id)} onCheckedChange={() => toggleLogSelection(log.id)} />
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                              {format(new Date(log.created_at), "dd MMM yyyy HH:mm", { locale: fr })}
                            </TableCell>
                            <TableCell className="text-sm">
                              <p className="font-medium truncate max-w-[180px]">{log.recipient_name || "Sans nom"}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[180px]">{log.recipient_email}</p>
                            </TableCell>
                            <TableCell className="text-sm">
                              <p>{log.template_name_snapshot}</p>
                              <Badge variant="outline" className="rounded-full gap-1 mt-1">
                                {log.source === "automatic" ? <Zap className="h-3 w-3" /> : <Hand className="h-3 w-3" />}
                                {log.source === "automatic" ? "Auto" : "Manuel"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={log.status === "success" ? "default" : "destructive"} className="rounded-full gap-1">
                                {log.status === "success" ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                {log.status === "success" ? "Envoyé" : "Échec"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setViewingLog(log)}>
                                <Eye className="h-3.5 w-3.5" /> Voir
                              </Button>
                            </TableCell>
                            <TableCell>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Supprimer cette entrée du journal ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      L'envoi à {log.recipient_email} sera retiré du journal. Cette action est irréversible.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteSendLogs([log.id])}>Supprimer</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={!!viewingLog} onOpenChange={(open) => !open && setViewingLog(null)}>
          <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Contenu envoyé</DialogTitle>
              <DialogDescription>
                À {viewingLog?.recipient_name ? `${viewingLog.recipient_name} — ` : ""}{viewingLog?.recipient_email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Sujet</Label>
                <p className="text-sm font-medium mt-1">{viewingLog?.subject_sent}</p>
              </div>
              <div>
                <Label className="text-xs">Corps du message</Label>
                <p className="text-sm mt-1 whitespace-pre-wrap">{viewingLog?.body_sent}</p>
              </div>
              {viewingLog?.status === "failed" && viewingLog?.error_message && (
                <div>
                  <Label className="text-xs text-destructive">Erreur</Label>
                  <p className="text-sm mt-1 text-destructive">{viewingLog.error_message}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
