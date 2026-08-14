import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarWidget } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft, FileText, Loader2, Ban, Search, Pencil, CalendarIcon, Upload, Download, X,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { AppHeader } from "@/components/layout/AppHeader";
import LocationFields from "@/components/profile/LocationFields";

interface ContratRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  is_active: boolean | null;
  contract_start_date?: string | null;
  contract_end_date?: string | null;
  establishment_id?: string | null;
  notice_period_days?: number | null;
  contract_duration_months?: number | null;
  contract_document_url?: string | null;
  contract_notes?: string | null;
  student_count?: number | null;
  teacher_count?: number | null;
  director_name?: string | null;
  director_contact?: string | null;
  deputy_name?: string | null;
  deputy_contact?: string | null;
  general_email?: string | null;
  address?: string | null;
  wilaya?: string | null;
  ville?: string | null;
}

interface StudentSubStatus {
  hasPremium: boolean;
  remainingDays: number;
  startedAt: string | null;
  lastRenewalAt: string | null;
}

// Reproduit exactement la logique de src/hooks/useChatLimits.ts pour rester cohérent
// avec ce qui gère réellement l'accès premium IA côté élève.
function computeSubStatus(sub: {
  total_days: number | null;
  days_used: number | null;
  is_paused: boolean | null;
  last_tick_at: string | null;
  started_at?: string | null;
} | undefined): StudentSubStatus {
  if (!sub) return { hasPremium: false, remainingDays: 0, startedAt: null, lastRenewalAt: null };
  // total_days/days_used arrivent parfois en string depuis PostgREST (days_used est numeric(10,4)) : Number(...) évite une concaténation de chaînes.
  const totalDays = Number(sub.total_days || 0);
  const daysUsed = Number(sub.days_used || 0);
  if (!sub.is_paused && sub.last_tick_at) {
    const elapsed = (Date.now() - new Date(sub.last_tick_at).getTime()) / (1000 * 60 * 60 * 24);
    const remaining = totalDays - (daysUsed + elapsed);
    return {
      hasPremium: remaining > 0, remainingDays: Math.max(0, Math.round(remaining)),
      startedAt: sub.started_at || null, lastRenewalAt: sub.last_tick_at || null,
    };
  }
  const remaining = totalDays - daysUsed;
  return {
    hasPremium: remaining > 0, remainingDays: Math.max(0, Math.round(remaining)),
    startedAt: sub.started_at || null, lastRenewalAt: sub.last_tick_at || null,
  };
}

export default function AdminContrats() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [etablissements, setEtablissements] = useState<ContratRow[]>([]);
  const [eleves, setEleves] = useState<ContratRow[]>([]);
  const [establishmentNames, setEstablishmentNames] = useState<Record<string, string>>({});
  const [studentSubMap, setStudentSubMap] = useState<Record<string, StudentSubStatus>>({});
  const [lastReminderMap, setLastReminderMap] = useState<Record<string, string>>({});
  const [addDaysInput, setAddDaysInput] = useState<Record<string, string>>({});
  const [savingRow, setSavingRow] = useState<string | null>(null);
  const [editingEtab, setEditingEtab] = useState<ContratRow | null>(null);

  // Filtres de la liste Élèves
  const [studentSearch, setStudentSearch] = useState("");
  const [studentAccountFilter, setStudentAccountFilter] = useState<"all" | "active" | "inactive">("all");
  const [studentPremiumFilter, setStudentPremiumFilter] = useState<"all" | "active" | "inactive">("all");
  const [studentEstablishmentFilter, setStudentEstablishmentFilter] = useState<string>("all");

  // Filtres de la liste Établissements
  const [etabSearch, setEtabSearch] = useState("");
  const [etabAccountFilter, setEtabAccountFilter] = useState<"all" | "active" | "inactive">("all");
  const [etabWilayaFilter, setEtabWilayaFilter] = useState<string>("all");
  const [etabNoticeFilter, setEtabNoticeFilter] = useState<"all" | "upcoming" | "overdue">("all");

  useEffect(() => {
    fetchAll();
  }, []);

  // Charge en parallèle contrats, journal des rappels et abonnements premium
  // au montage de la page.
  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchContracts(), fetchReminderLog(), fetchStudentSubscriptions()]);
    setLoading(false);
  };

  // Charge les profils (établissements + élèves), leurs rôles et les détails
  // de contrat, puis fusionne le tout en lignes ContratRow. Lecture admin-only
  // attendue côté RLS sur profiles/user_roles (page déjà protégée par
  // ProtectedRoute requireAdmin, mais la policy serveur doit aussi restreindre).
  const fetchContracts = async () => {
    const { data: profiles } = await supabase
      .from("profiles")
      .select(
        "id, first_name, last_name, email, is_active, contract_start_date, contract_end_date, establishment_id, " +
        "address, wilaya, ville" as any
      );
    const { data: rolesData } = await supabase.from("user_roles").select("user_id, role");
    // Détails de contrat admin-only, table séparée (voir 20260811130000) : ne
    // fait de sens à charger que pour les lignes "établissement".
    const { data: contractDetails } = await supabase
      .from("establishment_contract_details" as any)
      .select("*");

    const rows = (profiles as any as ContratRow[]) || [];
    const detailsMap = new Map<string, any>();
    (contractDetails as any[] || []).forEach((d) => detailsMap.set(d.establishment_id, d));
    rows.forEach((r) => Object.assign(r, detailsMap.get(r.id)));

    const roleMap = new Map<string, string[]>();
    (rolesData || []).forEach((r: any) => {
      const list = roleMap.get(r.user_id) || [];
      list.push(r.role);
      roleMap.set(r.user_id, list);
    });

    const etabRows = rows.filter((r) => roleMap.get(r.id)?.includes("etablissement"));
    setEtablissements(etabRows);
    setEleves(rows.filter((r) => roleMap.get(r.id)?.includes("student")));

    // Nom de l'établissement (stocké comme first_name sur le profil "etablissement") pour
    // affichage/filtre sur la liste des élèves — le lien élève↔établissement passe par
    // profiles.establishment_id, jamais montré nulle part avant.
    const names: Record<string, string> = {};
    etabRows.forEach((e) => { names[e.id] = e.first_name || e.email || "Établissement"; });
    setEstablishmentNames(names);
  };

  // Statut réel de l'accès premium IA (table lue par useChatLimits), distinct de profiles.is_active
  // qui, lui, contrôle l'accès au compte (connexion).
  const fetchStudentSubscriptions = async () => {
    const { data } = await supabase
      .from("student_subscriptions")
      .select("user_id, total_days, days_used, is_paused, last_tick_at, started_at, created_at")
      .order("created_at", { ascending: false });

    const map: Record<string, StudentSubStatus> = {};
    (data || []).forEach((sub: any) => {
      if (map[sub.user_id]) return; // garde uniquement l'abonnement le plus récent par élève
      map[sub.user_id] = computeSubStatus(sub);
    });
    setStudentSubMap(map);
  };

  // Charge la date du dernier rappel de renouvellement envoyé à chaque
  // utilisateur, pour l'afficher dans les tables. Fusionne l'historique des
  // rappels manuels ponctuellement envoyés par le passé (renewal_reminders_log)
  // avec les rappels automatiques envoyés par process-automatic-notifications
  // (automatic_notification_log, configurés depuis /admin/notifications).
  const fetchReminderLog = async () => {
    const [{ data: manual }, { data: automatic }] = await Promise.all([
      supabase.from("renewal_reminders_log" as any).select("target_user_id, created_at"),
      supabase.from("automatic_notification_log" as any).select("target_user_id, created_at").eq("success", true),
    ]);
    const map: Record<string, string> = {};
    [...((manual as any[]) || []), ...((automatic as any[]) || [])].forEach((r) => {
      if (!map[r.target_user_id] || r.created_at > map[r.target_user_id]) map[r.target_user_id] = r.created_at;
    });
    setLastReminderMap(map);
  };


  // Ajoute des jours à l'abonnement PREMIUM IA de l'élève (table student_subscriptions),
  // sans jamais toucher profiles.is_active : ça ne rouvre/ferme pas l'accès au compte.
  const handleAddDays = async (row: ContratRow) => {
    const daysStr = addDaysInput[row.id];
    const days = parseInt(daysStr, 10);
    if (!days || days <= 0) {
      toast.error("Entrez un nombre de jours valide");
      return;
    }
    setSavingRow(row.id);

    // RPC atomique (verrou de ligne côté DB) : évite qu'un double-clic ou deux
    // onglets admin ouverts en parallèle ne s'écrasent l'un l'autre (lecture
    // de total_days puis écriture séparées, sans verrou), et crédite d'abord
    // le temps déjà écoulé depuis le dernier last_tick_at dans days_used
    // avant de réinitialiser l'horloge — voir migration 20260723140100.
    const { error } = await supabase.rpc("admin_grant_subscription_days" as any, {
      p_user_id: row.id,
      p_days: days,
    });

    if (error) toast.error(error.message);
    else {
      toast.success(`${days} jour(s) de premium ajouté(s)`);
      setAddDaysInput((prev) => ({ ...prev, [row.id]: "" }));
      await fetchStudentSubscriptions();
    }
    setSavingRow(null);
  };

  // Coupe l'accès premium IA de l'élève (met son abonnement à 0 jour restant) SANS désactiver
  // le compte : l'élève garde accès à la connexion et à l'offre gratuite, distinct de "désactiver le compte".
  const handleDeactivateSubscription = async (userId: string) => {
    setSavingRow(userId);

    const { data: existing } = await supabase
      .from("student_subscriptions")
      .select("id, total_days")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!existing) {
      toast.success("Cet élève n'a pas d'abonnement premium actif.");
      setSavingRow(null);
      return;
    }

    const { error } = await supabase
      .from("student_subscriptions")
      .update({
        is_paused: true,
        paused_at: new Date().toISOString(),
        days_used: existing.total_days || 0,
      })
      .eq("id", existing.id);

    if (error) toast.error(error.message);
    else {
      toast.success("Abonnement premium IA désactivé (le compte reste accessible)");
      await fetchStudentSubscriptions();
    }
    setSavingRow(null);
  };

  const getFullName = (r: ContratRow) => [r.first_name, r.last_name].filter(Boolean).join(" ") || "Sans nom";

  // Date de préavis = fin de contrat - délai de préavis. Calculée ici plutôt
  // qu'en base (colonne GENERATED impossible : les deux entrées vivent
  // maintenant dans deux tables différentes, profiles et
  // establishment_contract_details — voir 20260811130000).
  const getNoticeDate = (r: ContratRow): Date | null => {
    if (!r.contract_end_date || !r.notice_period_days) return null;
    const d = new Date(r.contract_end_date);
    d.setDate(d.getDate() - r.notice_period_days);
    return d;
  };

  const renderLastReminder = (userId: string) => {
    const date = lastReminderMap[userId];
    if (!date) return <span className="text-xs text-muted-foreground">—</span>;
    return (
      <span className="text-xs text-muted-foreground">
        {format(new Date(date), "dd MMM yyyy", { locale: fr })}
      </span>
    );
  };

  const renderStatusBadge = (isActive: boolean | null) => (
    <Badge variant={isActive ? "default" : "destructive"}>{isActive ? "Actif" : "Inactif"}</Badge>
  );

  const filteredEleves = eleves.filter((row) => {
    const search = studentSearch.trim().toLowerCase();
    if (search) {
      const haystack = `${getFullName(row)} ${row.email || ""}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (studentAccountFilter === "active" && !row.is_active) return false;
    if (studentAccountFilter === "inactive" && row.is_active) return false;
    const hasPremium = !!studentSubMap[row.id]?.hasPremium;
    if (studentPremiumFilter === "active" && !hasPremium) return false;
    if (studentPremiumFilter === "inactive" && hasPremium) return false;
    if (studentEstablishmentFilter !== "all") {
      if (studentEstablishmentFilter === "none" ? !!row.establishment_id : row.establishment_id !== studentEstablishmentFilter) return false;
    }
    return true;
  });

  const etabWilayaOptions = Array.from(
    new Set(etablissements.map((e) => e.wilaya).filter((w): w is string => !!w))
  ).sort();

  const filteredEtablissements = etablissements.filter((row) => {
    const search = etabSearch.trim().toLowerCase();
    if (search) {
      const haystack = `${getFullName(row)} ${row.email || ""}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (etabAccountFilter === "active" && !row.is_active) return false;
    if (etabAccountFilter === "inactive" && row.is_active) return false;
    if (etabWilayaFilter !== "all" && row.wilaya !== etabWilayaFilter) return false;
    if (etabNoticeFilter !== "all") {
      const noticeDate = getNoticeDate(row);
      if (!noticeDate) return false;
      const noticeTime = noticeDate.getTime();
      const now = Date.now();
      const in30Days = now + 30 * 24 * 60 * 60 * 1000;
      if (etabNoticeFilter === "upcoming" && !(noticeTime >= now && noticeTime <= in30Days)) return false;
      if (etabNoticeFilter === "overdue" && !(noticeTime < now)) return false;
    }
    return true;
  });

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
        title="Gestion des Contrats"
        subtitle="Établissements et élèves"
        titleIcon={FileText}
        onBack={() => navigate("/dashboard")}
      />

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="etablissements">
          <TabsList className="rounded-xl">
            <TabsTrigger value="etablissements" className="rounded-lg">Établissements</TabsTrigger>
            <TabsTrigger value="eleves" className="rounded-lg">Élèves</TabsTrigger>
          </TabsList>

          <TabsContent value="etablissements" className="mt-4 space-y-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un nom ou un email..."
                    value={etabSearch}
                    onChange={(e) => setEtabSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={etabAccountFilter} onValueChange={(v) => setEtabAccountFilter(v as any)}>
                  <SelectTrigger className="w-44"><SelectValue placeholder="Statut du compte" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="active">Compte actif</SelectItem>
                    <SelectItem value="inactive">Compte inactif</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={etabWilayaFilter} onValueChange={setEtabWilayaFilter}>
                  <SelectTrigger className="w-44"><SelectValue placeholder="Wilaya" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les wilayas</SelectItem>
                    {etabWilayaOptions.map((w) => (
                      <SelectItem key={w} value={w}>{w}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={etabNoticeFilter} onValueChange={(v) => setEtabNoticeFilter(v as any)}>
                  <SelectTrigger className="w-52"><SelectValue placeholder="Préavis" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les préavis</SelectItem>
                    <SelectItem value="upcoming">Préavis sous 30 jours</SelectItem>
                    <SelectItem value="overdue">Date de préavis dépassée</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle>Contrats des établissements</CardTitle>
                <CardDescription>
                  Les dates de contrat pilotent automatiquement l'activation du compte (et de ses enseignants)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>Nom</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Wilaya / Ville</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Contrat</TableHead>
                        <TableHead>Préavis</TableHead>
                        <TableHead>Effectifs</TableHead>
                        <TableHead>Dernier rappel</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEtablissements.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            Aucun établissement.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredEtablissements.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell className="font-medium">{getFullName(row)}</TableCell>
                            <TableCell className="text-muted-foreground">{row.email}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {[row.wilaya, row.ville].filter(Boolean).join(" / ") || "—"}
                            </TableCell>
                            <TableCell>{renderStatusBadge(row.is_active)}</TableCell>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                              {row.contract_start_date ? format(new Date(row.contract_start_date), "dd MMM yyyy", { locale: fr }) : "—"}
                              {" → "}
                              {row.contract_end_date ? format(new Date(row.contract_end_date), "dd MMM yyyy", { locale: fr }) : "—"}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                              {(() => { const nd = getNoticeDate(row); return nd ? format(nd, "dd MMM yyyy", { locale: fr }) : "—"; })()}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                              {row.student_count ?? "—"} élèves / {row.teacher_count ?? "—"} profs
                            </TableCell>
                            <TableCell>{renderLastReminder(row.id)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-2"
                                  onClick={() => setEditingEtab(row)}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  Contrat
                                </Button>
                              </div>
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

          {editingEtab && (
            <EstablishmentContractDialog
              establishment={editingEtab}
              open={!!editingEtab}
              onOpenChange={(open) => { if (!open) setEditingEtab(null); }}
              onSaved={async () => {
                setEditingEtab(null);
                await fetchContracts();
              }}
            />
          )}

          <TabsContent value="eleves" className="mt-4 space-y-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un nom ou un email..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={studentAccountFilter} onValueChange={(v) => setStudentAccountFilter(v as any)}>
                  <SelectTrigger className="w-44"><SelectValue placeholder="Statut du compte" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="active">Compte actif</SelectItem>
                    <SelectItem value="inactive">Compte inactif</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={studentPremiumFilter} onValueChange={(v) => setStudentPremiumFilter(v as any)}>
                  <SelectTrigger className="w-44"><SelectValue placeholder="Statut premium" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tout premium</SelectItem>
                    <SelectItem value="active">Premium actif</SelectItem>
                    <SelectItem value="inactive">Premium inactif</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={studentEstablishmentFilter} onValueChange={setStudentEstablishmentFilter}>
                  <SelectTrigger className="w-52"><SelectValue placeholder="Établissement" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les établissements</SelectItem>
                    <SelectItem value="none">Aucun établissement</SelectItem>
                    {etablissements.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{establishmentNames[e.id] || getFullName(e)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
            <ContratTable
              rows={filteredEleves}
              studentSubMap={studentSubMap}
              establishmentNames={establishmentNames}
              getFullName={getFullName}
              renderStatusBadge={renderStatusBadge}
              renderLastReminder={renderLastReminder}
              addDaysInput={addDaysInput}
              setAddDaysInput={setAddDaysInput}
              savingRow={savingRow}
              onAddDays={handleAddDays}
              onDeactivate={handleDeactivateSubscription}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function ContratTable({
  rows,
  studentSubMap,
  establishmentNames,
  getFullName,
  renderStatusBadge,
  renderLastReminder,
  addDaysInput,
  setAddDaysInput,
  savingRow,
  onAddDays,
  onDeactivate,
}: {
  rows: ContratRow[];
  studentSubMap: Record<string, StudentSubStatus>;
  establishmentNames: Record<string, string>;
  getFullName: (r: ContratRow) => string;
  renderStatusBadge: (isActive: boolean | null) => JSX.Element;
  renderLastReminder: (userId: string) => JSX.Element;
  addDaysInput: Record<string, string>;
  setAddDaysInput: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  savingRow: string | null;
  onAddDays: (row: ContratRow) => void;
  onDeactivate: (userId: string) => void;
}) {
  const formatDate = (iso: string | null) => iso ? format(new Date(iso), "dd MMM yyyy", { locale: fr }) : "—";
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b bg-muted/30">
        <CardTitle>Abonnements Premium IA</CardTitle>
        <CardDescription>
          "Statut compte" contrôle l'accès à la connexion. "Premium IA" contrôle uniquement l'offre IA premium —
          désactiver le premium ne bloque pas la connexion de l'élève.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Établissement</TableHead>
                <TableHead>Statut compte</TableHead>
                <TableHead>Premium IA</TableHead>
                <TableHead>Début premium</TableHead>
                <TableHead>Ajouter des jours</TableHead>
                <TableHead>Dernier renouvellement</TableHead>
                <TableHead>Dernier rappel</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    Aucun utilisateur.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => {
                  const sub = studentSubMap[row.id];
                  return (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{getFullName(row)}</TableCell>
                    <TableCell className="text-muted-foreground">{row.email}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.establishment_id ? (establishmentNames[row.establishment_id] || "—") : "—"}
                    </TableCell>
                    <TableCell>{renderStatusBadge(row.is_active)}</TableCell>
                    <TableCell>
                      <Badge variant={sub?.hasPremium ? "default" : "secondary"}>
                        {sub?.hasPremium ? `Actif (${sub.remainingDays}j)` : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(sub?.startedAt || null)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={1}
                          placeholder="Jours"
                          className="w-20"
                          value={addDaysInput[row.id] || ""}
                          onChange={(e) => setAddDaysInput((prev) => ({ ...prev, [row.id]: e.target.value }))}
                        />
                        <Button
                          size="sm"
                          disabled={savingRow === row.id}
                          onClick={() => onAddDays(row)}
                        >
                          Ajouter
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(sub?.lastRenewalAt || null)}</TableCell>
                    <TableCell>{renderLastReminder(row.id)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-2"
                          disabled={savingRow === row.id}
                          onClick={() => onDeactivate(row.id)}
                        >
                          <Ban className="h-3.5 w-3.5" />
                          Désactiver le premium
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function EstablishmentContractDialog({
  establishment,
  open,
  onOpenChange,
  onSaved,
}: {
  establishment: ContratRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [startDate, setStartDate] = useState<Date | undefined>(
    establishment.contract_start_date ? new Date(establishment.contract_start_date) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    establishment.contract_end_date ? new Date(establishment.contract_end_date) : undefined
  );
  const [noticePeriodDays, setNoticePeriodDays] = useState(String(establishment.notice_period_days ?? ""));
  const [durationMonths, setDurationMonths] = useState(String(establishment.contract_duration_months ?? ""));
  const [studentCount, setStudentCount] = useState(String(establishment.student_count ?? ""));
  const [teacherCount, setTeacherCount] = useState(String(establishment.teacher_count ?? ""));
  const [directorName, setDirectorName] = useState(establishment.director_name || "");
  const [directorContact, setDirectorContact] = useState(establishment.director_contact || "");
  const [deputyName, setDeputyName] = useState(establishment.deputy_name || "");
  const [deputyContact, setDeputyContact] = useState(establishment.deputy_contact || "");
  const [generalEmail, setGeneralEmail] = useState(establishment.general_email || "");
  const [address, setAddress] = useState(establishment.address || "");
  const [wilaya, setWilaya] = useState(establishment.wilaya || "");
  const [ville, setVille] = useState(establishment.ville || "");
  const [notes, setNotes] = useState(establishment.contract_notes || "");
  const [documentPath, setDocumentPath] = useState<string | null>(establishment.contract_document_url || null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Génère une URL signée temporaire (5 min) pour le document de contrat déjà
  // uploadé, à chaque changement de documentPath — le bucket
  // "establishment-contracts" n'est pas public, l'accès dépend donc des
  // policies storage (admin-only attendu côté serveur).
  useEffect(() => {
    if (!documentPath || documentFile) {
      setSignedUrl(null);
      return;
    }
    supabase.storage.from("establishment-contracts").createSignedUrl(documentPath, 300).then(({ data }) => {
      setSignedUrl(data?.signedUrl || null);
    });
  }, [documentPath, documentFile]);

  // Enregistre le contrat : upload optionnel du document vers le bucket
  // "establishment-contracts", mise à jour des dates de contrat sur profiles,
  // puis upsert des détails étendus (préavis, effectifs, contacts...) sur la
  // table admin-only establishment_contract_details. Déclenché par le bouton
  // "Enregistrer" du dialogue.
  const handleSave = async () => {
    setSaving(true);
    try {
      let finalDocumentPath = documentPath;
      if (documentFile) {
        const path = `${establishment.id}/${Date.now()}-${documentFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("establishment-contracts")
          .upload(path, documentFile, { upsert: false });
        if (uploadError) throw uploadError;
        finalDocumentPath = path;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          contract_start_date: startDate ? format(startDate, "yyyy-MM-dd") : null,
          contract_end_date: endDate ? format(endDate, "yyyy-MM-dd") : null,
          address: address.trim() || null,
          wilaya: wilaya || null,
          ville: ville || null,
        } as any)
        .eq("id", establishment.id);

      if (profileError) throw profileError;

      // Table séparée admin-only (voir 20260811130000) : ces champs ne
      // doivent pas être lisibles par un enseignant lié à l'établissement.
      const { error: detailsError } = await supabase
        .from("establishment_contract_details" as any)
        .upsert({
          establishment_id: establishment.id,
          notice_period_days: noticePeriodDays ? parseInt(noticePeriodDays, 10) : null,
          contract_duration_months: durationMonths ? parseInt(durationMonths, 10) : null,
          student_count: studentCount ? parseInt(studentCount, 10) : null,
          teacher_count: teacherCount ? parseInt(teacherCount, 10) : null,
          director_name: directorName.trim() || null,
          director_contact: directorContact.trim() || null,
          deputy_name: deputyName.trim() || null,
          deputy_contact: deputyContact.trim() || null,
          general_email: generalEmail.trim() || null,
          contract_notes: notes.trim() || null,
          contract_document_url: finalDocumentPath,
          updated_at: new Date().toISOString(),
        } as any);

      if (detailsError) throw detailsError;
      toast.success("Contrat mis à jour");
      onSaved();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'enregistrement du contrat");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Contrat établissement — {[establishment.first_name, establishment.last_name].filter(Boolean).join(" ")}</DialogTitle>
          <DialogDescription>
            Les dates de contrat pilotent automatiquement l'activation du compte (et de ses enseignants).
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date début du contrat</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd/MM/yyyy") : "Sélectionner"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarWidget mode="single" selected={startDate} onSelect={setStartDate} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Date fin du contrat</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd/MM/yyyy") : "Sélectionner"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarWidget mode="single" selected={endDate} onSelect={setEndDate} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="noticePeriod">Délai de préavis (jours)</Label>
              <Input id="noticePeriod" type="number" min={0} value={noticePeriodDays} onChange={(e) => setNoticePeriodDays(e.target.value)} placeholder="ex : 90" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Durée du contrat (mois)</Label>
              <Input id="duration" type="number" min={0} value={durationMonths} onChange={(e) => setDurationMonths(e.target.value)} placeholder="ex : 12" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="studentCount">Nombre d'élèves</Label>
              <Input id="studentCount" type="number" min={0} value={studentCount} onChange={(e) => setStudentCount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacherCount">Nombre d'enseignants</Label>
              <Input id="teacherCount" type="number" min={0} value={teacherCount} onChange={(e) => setTeacherCount(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="directorName">Directeur — nom</Label>
              <Input id="directorName" value={directorName} onChange={(e) => setDirectorName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="directorContact">Directeur — contact</Label>
              <Input id="directorContact" value={directorContact} onChange={(e) => setDirectorContact(e.target.value)} placeholder="Téléphone ou email" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deputyName">Adjoint — nom</Label>
              <Input id="deputyName" value={deputyName} onChange={(e) => setDeputyName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deputyContact">Adjoint — contact</Label>
              <Input id="deputyContact" value={deputyContact} onChange={(e) => setDeputyContact(e.target.value)} placeholder="Téléphone ou email" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="generalEmail">Email général de l'établissement</Label>
            <Input id="generalEmail" type="email" value={generalEmail} onChange={(e) => setGeneralEmail(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rue, quartier..." />
          </div>

          <LocationFields
            wilaya={wilaya}
            ville={ville}
            ecole=""
            onWilayaChange={setWilaya}
            onVilleChange={setVille}
            onEcoleChange={() => {}}
            hideEcole
            required={false}
          />

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Notes internes sur ce contrat..." />
          </div>

          <div className="space-y-2">
            <Label>Document du contrat</Label>
            {documentPath && !documentFile && (
              <div className="flex items-center gap-2 text-sm">
                {signedUrl ? (
                  <a href={signedUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">
                    <Download className="h-3.5 w-3.5" /> Télécharger le document actuel
                  </a>
                ) : (
                  <span className="text-muted-foreground">Chargement du lien...</span>
                )}
                <Button type="button" variant="ghost" size="sm" className="h-6 px-2" onClick={() => setDocumentPath(null)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
              />
              {documentFile && <Upload className="h-4 w-4 text-muted-foreground shrink-0" />}
            </div>
            <p className="text-xs text-muted-foreground">PDF, Word ou image du contrat signé. Accessible uniquement aux administrateurs.</p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enregistrement...</> : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
