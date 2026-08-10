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
import { ArrowLeft, FileText, Send, Loader2, Ban, Search } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AppHeader } from "@/components/layout/AppHeader";

interface ContratRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  is_active: boolean | null;
  contract_start_date?: string | null;
  contract_end_date?: string | null;
  establishment_id?: string | null;
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
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);
  const [savingRow, setSavingRow] = useState<string | null>(null);

  // Filtres de la liste Élèves
  const [studentSearch, setStudentSearch] = useState("");
  const [studentAccountFilter, setStudentAccountFilter] = useState<"all" | "active" | "inactive">("all");
  const [studentPremiumFilter, setStudentPremiumFilter] = useState<"all" | "active" | "inactive">("all");
  const [studentEstablishmentFilter, setStudentEstablishmentFilter] = useState<string>("all");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchContracts(), fetchReminderLog(), fetchStudentSubscriptions()]);
    setLoading(false);
  };

  const fetchContracts = async () => {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email, is_active, contract_start_date, contract_end_date, establishment_id" as any);
    const { data: rolesData } = await supabase.from("user_roles").select("user_id, role");

    const rows = (profiles as any as ContratRow[]) || [];
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

  const fetchReminderLog = async () => {
    const { data } = await supabase
      .from("renewal_reminders_log" as any)
      .select("target_user_id, created_at")
      .order("created_at", { ascending: false });
    const map: Record<string, string> = {};
    (data as any[] || []).forEach((r) => {
      if (!map[r.target_user_id]) map[r.target_user_id] = r.created_at;
    });
    setLastReminderMap(map);
  };

  const handleUpdateContractDate = async (
    userId: string,
    field: "contract_start_date" | "contract_end_date",
    value: string
  ) => {
    setSavingRow(userId);
    const { error } = await supabase
      .from("profiles")
      .update({ [field]: value || null } as any)
      .eq("id", userId);
    if (error) toast.error(error.message);
    else {
      toast.success("Date mise à jour");
      await fetchContracts();
    }
    setSavingRow(null);
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

  const handleSendReminder = async (userId: string) => {
    setSendingReminder(userId);
    const { error } = await supabase.functions.invoke("send-renewal-reminder", { body: { userId } });
    if (error) {
      let message = error.message || "Échec de l'envoi du rappel";
      const context = (error as { context?: Response }).context;
      if (context) {
        try {
          const body = await context.clone().json();
          if (body?.error) message = body.error;
        } catch {
          // response body wasn't JSON, keep the default message
        }
      }
      toast.error(message);
    } else {
      toast.success("Rappel envoyé");
    }
    setSendingReminder(null);
    fetchReminderLog();
  };

  const getFullName = (r: ContratRow) => [r.first_name, r.last_name].filter(Boolean).join(" ") || "Sans nom";

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
        showProfileMenu={false}
      />

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="etablissements">
          <TabsList className="rounded-xl">
            <TabsTrigger value="etablissements" className="rounded-lg">Établissements</TabsTrigger>
            <TabsTrigger value="eleves" className="rounded-lg">Élèves</TabsTrigger>
          </TabsList>

          <TabsContent value="etablissements" className="mt-4">
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
                        <TableHead>Statut</TableHead>
                        <TableHead>Date début</TableHead>
                        <TableHead>Date fin</TableHead>
                        <TableHead>Dernier rappel</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {etablissements.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            Aucun établissement.
                          </TableCell>
                        </TableRow>
                      ) : (
                        etablissements.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell className="font-medium">{getFullName(row)}</TableCell>
                            <TableCell className="text-muted-foreground">{row.email}</TableCell>
                            <TableCell>{renderStatusBadge(row.is_active)}</TableCell>
                            <TableCell>
                              <Input
                                type="date"
                                defaultValue={row.contract_start_date || ""}
                                disabled={savingRow === row.id}
                                onBlur={(e) => {
                                  if (e.target.value !== (row.contract_start_date || "")) {
                                    handleUpdateContractDate(row.id, "contract_start_date", e.target.value);
                                  }
                                }}
                                className="w-40"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="date"
                                defaultValue={row.contract_end_date || ""}
                                disabled={savingRow === row.id}
                                onBlur={(e) => {
                                  if (e.target.value !== (row.contract_end_date || "")) {
                                    handleUpdateContractDate(row.id, "contract_end_date", e.target.value);
                                  }
                                }}
                                className="w-40"
                              />
                            </TableCell>
                            <TableCell>{renderLastReminder(row.id)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                disabled={sendingReminder === row.id}
                                onClick={() => handleSendReminder(row.id)}
                              >
                                {sendingReminder === row.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Send className="h-3.5 w-3.5" />
                                )}
                                Rappel
                              </Button>
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
              sendingReminder={sendingReminder}
              onAddDays={handleAddDays}
              onDeactivate={handleDeactivateSubscription}
              onSendReminder={handleSendReminder}
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
  sendingReminder,
  onAddDays,
  onDeactivate,
  onSendReminder,
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
  sendingReminder: string | null;
  onAddDays: (row: ContratRow) => void;
  onDeactivate: (userId: string) => void;
  onSendReminder: (userId: string) => void;
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
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          disabled={sendingReminder === row.id}
                          onClick={() => onSendReminder(row.id)}
                        >
                          {sendingReminder === row.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Send className="h-3.5 w-3.5" />
                          )}
                          Rappel
                        </Button>
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
