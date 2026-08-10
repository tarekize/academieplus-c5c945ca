import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarWidget } from "@/components/ui/calendar";
import {
  ArrowLeft, CreditCard, Calendar, CalendarIcon, Settings, Users, Eye, Loader2, Save, Plus, Pencil, Landmark, Check, X,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { AppHeader } from "@/components/layout/AppHeader";

interface SubscriptionConfig {
  id: string;
  plan_type: string;
  price_single: number;
  price_family: number;
  label: string;
  is_active: boolean;
}

interface SubscriptionPeriod {
  id: string;
  label: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface BankDetails {
  bank_name: string;
  rib: string;
  ccp_number: string;
  ccp_key: string;
  account_holder: string;
  instructions: string;
}

interface PaymentRecord {
  id: string;
  user_id: string;
  plan_type: string;
  plan_label: string;
  amount: number;
  is_family: boolean;
  children_count: number;
  payment_date: string;
  status: string;
  user_name?: string;
  user_email?: string;
}

export default function AdminAbonnements() {
  const navigate = useNavigate();
  const [configs, setConfigs] = useState<SubscriptionConfig[]>([]);
  const [periods, setPeriods] = useState<SubscriptionPeriod[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPayments, setShowPayments] = useState(false);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

  // Edit state for prices
  const [editPrices, setEditPrices] = useState<Record<string, { single: number; family: number }>>({});

  // Bank details (RIB/CCP) shown to users on the payment page
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    bank_name: "", rib: "", ccp_number: "", ccp_key: "", account_holder: "", instructions: "",
  });
  const [savingBankDetails, setSavingBankDetails] = useState(false);

  // Period dialog
  const [periodDialog, setPeriodDialog] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<SubscriptionPeriod | null>(null);
  const [periodForm, setPeriodForm] = useState({ label: "", start_date: "", end_date: "", is_active: false });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchConfigs(), fetchPeriods(), fetchPayments(), fetchBankDetails()]);
    setLoading(false);
  };

  const fetchBankDetails = async () => {
    const { data, error } = await supabase
      .from("payment_bank_details" as any)
      .select("bank_name, rib, ccp_number, ccp_key, account_holder, instructions")
      .maybeSingle();
    if (error) {
      toast.error("Impossible de charger les coordonnées bancaires", { description: error.message });
      return;
    }
    if (data) {
      const d = data as any;
      setBankDetails({
        bank_name: d.bank_name || "",
        rib: d.rib || "",
        ccp_number: d.ccp_number || "",
        ccp_key: d.ccp_key || "",
        account_holder: d.account_holder || "",
        instructions: d.instructions || "",
      });
    }
  };

  const handleSaveBankDetails = async () => {
    setSavingBankDetails(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("payment_bank_details" as any)
      .update({ ...bankDetails, updated_at: new Date().toISOString(), updated_by: user?.id })
      .eq("id", true);
    if (error) {
      toast.error("Erreur", { description: error.message });
    } else {
      toast.success("Coordonnées bancaires mises à jour");
    }
    setSavingBankDetails(false);
  };

  const fetchConfigs = async () => {
    const { data, error } = await supabase.from("subscription_config").select("*").order("plan_type");
    if (error) {
      toast.error("Impossible de charger les tarifs", { description: error.message });
      return;
    }
    if (data) {
      setConfigs(data as SubscriptionConfig[]);
      const prices: Record<string, { single: number; family: number }> = {};
      data.forEach((c: any) => {
        prices[c.id] = { single: c.price_single, family: c.price_family };
      });
      setEditPrices(prices);
    }
  };

  const fetchPeriods = async () => {
    const { data, error } = await supabase.from("subscription_periods").select("*").order("start_date", { ascending: false });
    if (error) {
      toast.error("Impossible de charger les périodes", { description: error.message });
      return;
    }
    if (data) setPeriods(data as SubscriptionPeriod[]);
  };

  const fetchPayments = async () => {
    const { data: paymentsData, error: paymentsError } = await supabase
      .from("payments")
      .select("*")
      .order("payment_date", { ascending: false });

    if (paymentsError) {
      toast.error("Impossible de charger les paiements", { description: paymentsError.message });
      return;
    }

    if (paymentsData && paymentsData.length > 0) {
      // Fetch profile names
      const userIds = [...new Set(paymentsData.map((p: any) => p.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .in("id", userIds);

      const profileMap = new Map<string, { name: string; email: string }>();
      profiles?.forEach((p: any) => {
        const name = [p.first_name, p.last_name].filter(Boolean).join(" ") || "Sans nom";
        profileMap.set(p.id, { name, email: p.email });
      });

      setPayments(
        paymentsData.map((p: any) => ({
          ...p,
          user_name: profileMap.get(p.user_id)?.name || "Inconnu",
          user_email: profileMap.get(p.user_id)?.email || "",
        }))
      );
    } else {
      setPayments([]);
    }
  };

  // Aucune passerelle de paiement réelle n'est intégrée : un paiement entre en
  // statut 'pending' et seul un admin, après avoir vérifié le virement/paiement
  // réel, peut l'approuver (ce qui émet alors les codes d'activation) ou le
  // rejeter.
  const handleApprovePayment = async (paymentId: string) => {
    setProcessingPayment(paymentId);
    const { error } = await supabase.rpc("admin_approve_payment" as any, { p_payment_id: paymentId });
    if (error) {
      toast.error("Impossible de valider ce paiement", { description: error.message });
    } else {
      toast.success("Paiement validé, codes d'activation émis");
      await fetchPayments();
    }
    setProcessingPayment(null);
  };

  const handleRejectPayment = async (paymentId: string) => {
    setProcessingPayment(paymentId);
    const { error } = await supabase.rpc("admin_reject_payment" as any, { p_payment_id: paymentId });
    if (error) {
      toast.error("Impossible de rejeter ce paiement", { description: error.message });
    } else {
      toast.success("Paiement rejeté");
      await fetchPayments();
    }
    setProcessingPayment(null);
  };

  const handleSavePrices = async (configId: string) => {
    setSaving(true);
    const prices = editPrices[configId];
    const { error } = await supabase
      .from("subscription_config")
      .update({ price_single: prices.single, price_family: prices.family, updated_at: new Date().toISOString() })
      .eq("id", configId);

    if (error) {
      toast.error("Erreur", { description: error.message });
    } else {
      toast.success("Succès", { description: "Prix mis à jour avec succès" });
      fetchConfigs();
    }
    setSaving(false);
  };

  const handleSavePeriod = async () => {
    if (!periodForm.label.trim() || !periodForm.start_date || !periodForm.end_date) {
      toast.error("Erreur", { description: "Libellé, date de début et date de fin sont obligatoires." });
      return;
    }
    if (periodForm.end_date <= periodForm.start_date) {
      toast.error("Erreur", { description: "La date de fin doit être postérieure à la date de début." });
      return;
    }

    setSaving(true);

    // Une seule période "active" à la fois (c'est elle que record-payment
    // rattache aux nouveaux paiements) : en activer une désactive les autres.
    if (periodForm.is_active) {
      const { error: deactivateError } = await supabase
        .from("subscription_periods")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .neq("id", editingPeriod?.id || "00000000-0000-0000-0000-000000000000");
      if (deactivateError) {
        toast.error("Erreur", { description: deactivateError.message });
        setSaving(false);
        return;
      }
    }

    if (editingPeriod) {
      const { error } = await supabase
        .from("subscription_periods")
        .update({
          label: periodForm.label, start_date: periodForm.start_date, end_date: periodForm.end_date,
          is_active: periodForm.is_active, updated_at: new Date().toISOString(),
        })
        .eq("id", editingPeriod.id);
      if (error) toast.error("Erreur", { description: error.message });
      else toast.success("Succès", { description: "Période mise à jour" });
    } else {
      const { error } = await supabase
        .from("subscription_periods")
        .insert({ label: periodForm.label, start_date: periodForm.start_date, end_date: periodForm.end_date, is_active: periodForm.is_active });
      if (error) toast.error("Erreur", { description: error.message });
      else toast.success("Succès", { description: "Période créée" });
    }
    setPeriodDialog(false);
    setEditingPeriod(null);
    setPeriodForm({ label: "", start_date: "", end_date: "", is_active: false });
    fetchPeriods();
    setSaving(false);
  };

  const openEditPeriod = (p: SubscriptionPeriod) => {
    setEditingPeriod(p);
    setPeriodForm({ label: p.label, start_date: p.start_date, end_date: p.end_date, is_active: p.is_active });
    setPeriodDialog(true);
  };

  const openNewPeriod = () => {
    setEditingPeriod(null);
    setPeriodForm({ label: "", start_date: "", end_date: "", is_active: false });
    setPeriodDialog(true);
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
        title="Gestion des Abonnements"
        subtitle="Configurez les tarifs, périodes et consultez les paiements"
        titleIcon={CreditCard}
        onBack={() => navigate("/dashboard")}
        showProfileMenu={false}
      />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Section 1: Tarifs */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Configuration des Tarifs</CardTitle>
                <CardDescription>Modifiez les prix des abonnements</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {configs.map((config) => (
                <Card key={config.id} className="p-5 border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">{config.label}</h3>
                    <Badge variant={config.plan_type === "annual" ? "default" : "secondary"}>
                      {config.plan_type === "annual" ? "Annuelle" : "Mensuelle"}
                    </Badge>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>Prix 1 enfant (DA)</Label>
                      <Input
                        type="number"
                        value={editPrices[config.id]?.single || 0}
                        onChange={(e) =>
                          setEditPrices((prev) => ({
                            ...prev,
                            [config.id]: { ...prev[config.id], single: parseInt(e.target.value) || 0 },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Prix Famille (DA)</Label>
                      <Input
                        type="number"
                        value={editPrices[config.id]?.family || 0}
                        onChange={(e) =>
                          setEditPrices((prev) => ({
                            ...prev,
                            [config.id]: { ...prev[config.id], family: parseInt(e.target.value) || 0 },
                          }))
                        }
                      />
                    </div>
                    <Button onClick={() => handleSavePrices(config.id)} disabled={saving} className="w-full">
                      <Save className="h-4 w-4 mr-2" /> Enregistrer
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Périodes scolaires */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber/10">
                  <Calendar className="h-5 w-5 text-amber" />
                </div>
                <div>
                  <CardTitle>Périodes Scolaires</CardTitle>
                  <CardDescription>Définissez les dates de début et fin de l'année scolaire</CardDescription>
                </div>
              </div>
              <Button onClick={openNewPeriod}>
                <Plus className="h-4 w-4 mr-2" /> Nouvelle période
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Libellé</TableHead>
                  <TableHead>Date début</TableHead>
                  <TableHead>Date fin</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periods.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Aucune période définie. Créez-en une pour commencer.
                    </TableCell>
                  </TableRow>
                ) : (
                  periods.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.label}</TableCell>
                      <TableCell>{format(new Date(p.start_date), "dd MMMM yyyy", { locale: fr })}</TableCell>
                      <TableCell>{format(new Date(p.end_date), "dd MMMM yyyy", { locale: fr })}</TableCell>
                      <TableCell>
                        <Badge variant={p.is_active ? "default" : "secondary"}>
                          {p.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => openEditPeriod(p)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Section 2bis: Coordonnées bancaires pour les versements */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Landmark className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Coordonnées bancaires</CardTitle>
                <CardDescription>
                  Affichées aux utilisateurs sur la page de paiement pour effectuer leur virement ou versement CCP.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Titulaire du compte</Label>
                <Input
                  value={bankDetails.account_holder}
                  onChange={(e) => setBankDetails((b) => ({ ...b, account_holder: e.target.value }))}
                  placeholder="Ex: AcadémiePlus SARL"
                />
              </div>
              <div>
                <Label>Banque</Label>
                <Input
                  value={bankDetails.bank_name}
                  onChange={(e) => setBankDetails((b) => ({ ...b, bank_name: e.target.value }))}
                  placeholder="Ex: BNA, CPA, BADR..."
                />
              </div>
              <div>
                <Label>RIB</Label>
                <Input
                  value={bankDetails.rib}
                  onChange={(e) => setBankDetails((b) => ({ ...b, rib: e.target.value }))}
                  placeholder="XX XXXXX XXXXXXXXXXXX XX"
                  className="font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Numéro CCP</Label>
                  <Input
                    value={bankDetails.ccp_number}
                    onChange={(e) => setBankDetails((b) => ({ ...b, ccp_number: e.target.value }))}
                    placeholder="XXXXXXXX"
                    className="font-mono"
                  />
                </div>
                <div>
                  <Label>Clé CCP</Label>
                  <Input
                    value={bankDetails.ccp_key}
                    onChange={(e) => setBankDetails((b) => ({ ...b, ccp_key: e.target.value }))}
                    placeholder="XX"
                    className="font-mono"
                  />
                </div>
              </div>
            </div>
            <div>
              <Label>Instructions complémentaires (optionnel)</Label>
              <Input
                value={bankDetails.instructions}
                onChange={(e) => setBankDetails((b) => ({ ...b, instructions: e.target.value }))}
                placeholder="Ex: précisez votre nom complet en communication du virement"
              />
            </div>
            {!bankDetails.rib && !bankDetails.ccp_number && (
              <p className="text-sm text-warning">
                Tant qu'aucun RIB ni numéro CCP n'est renseigné, la page de paiement affiche un message
                indiquant que les coordonnées ne sont pas encore disponibles.
              </p>
            )}
            <Button onClick={handleSaveBankDetails} disabled={savingBankDetails}>
              <Save className="h-4 w-4 mr-2" /> Enregistrer les coordonnées
            </Button>
          </CardContent>
        </Card>

        {/* Section 3: Paiements */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Users className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <CardTitle>Historique des Paiements</CardTitle>
                  <CardDescription>Consultez toutes les transactions effectuées</CardDescription>
                </div>
              </div>
              <Button variant="outline" onClick={() => setShowPayments(!showPayments)}>
                <Eye className="h-4 w-4 mr-2" /> {showPayments ? "Masquer" : "Voir les paiements"}
              </Button>
            </div>
          </CardHeader>
          {showPayments && (
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Date de paiement</TableHead>
                      <TableHead>Formule</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Nb enfants</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          Aucun paiement enregistré pour le moment.
                        </TableCell>
                      </TableRow>
                    ) : (
                      payments.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.user_name}</TableCell>
                          <TableCell className="text-muted-foreground">{p.user_email}</TableCell>
                          <TableCell>{format(new Date(p.payment_date), "dd MMM yyyy à HH:mm", { locale: fr })}</TableCell>
                          <TableCell>
                            <Badge variant={p.plan_type === "annual" ? "default" : "secondary"}>
                              {p.plan_label}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">{p.amount.toLocaleString("fr-DZ")} DA</TableCell>
                          <TableCell className="text-center">{p.is_family ? p.children_count : 1}</TableCell>
                          <TableCell>
                            <Badge variant={p.status === "completed" ? "default" : p.status === "pending" ? "secondary" : "destructive"}>
                              {p.status === "completed" ? "Complété" : p.status === "pending" ? "En attente" : p.status === "failed" ? "Rejeté" : p.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {p.status === "pending" && (
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  className="gap-1.5"
                                  disabled={processingPayment === p.id}
                                  onClick={() => handleApprovePayment(p.id)}
                                >
                                  {processingPayment === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                                  Valider
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="gap-1.5"
                                  disabled={processingPayment === p.id}
                                  onClick={() => handleRejectPayment(p.id)}
                                >
                                  <X className="h-3.5 w-3.5" />
                                  Rejeter
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          )}
        </Card>
      </main>

      {/* Period Dialog */}
      <Dialog open={periodDialog} onOpenChange={setPeriodDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPeriod ? "Modifier la période" : "Nouvelle période scolaire"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Libellé (ex: Année scolaire 2025-2026) *</Label>
              <Input
                value={periodForm.label}
                onChange={(e) => setPeriodForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="Année scolaire 2025-2026"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date de début *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !periodForm.start_date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {periodForm.start_date ? format(new Date(`${periodForm.start_date}T00:00:00`), "dd MMMM yyyy", { locale: fr }) : "Sélectionner"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarWidget
                      mode="single"
                      selected={periodForm.start_date ? new Date(`${periodForm.start_date}T00:00:00`) : undefined}
                      onSelect={(date) => date && setPeriodForm((f) => ({ ...f, start_date: format(date, "yyyy-MM-dd") }))}
                      initialFocus
                      className="p-3 pointer-events-auto"
                      captionLayout="dropdown-buttons"
                      fromYear={2020}
                      toYear={new Date().getFullYear() + 5}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Date de fin *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !periodForm.end_date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {periodForm.end_date ? format(new Date(`${periodForm.end_date}T00:00:00`), "dd MMMM yyyy", { locale: fr }) : "Sélectionner"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarWidget
                      mode="single"
                      selected={periodForm.end_date ? new Date(`${periodForm.end_date}T00:00:00`) : undefined}
                      onSelect={(date) => date && setPeriodForm((f) => ({ ...f, end_date: format(date, "yyyy-MM-dd") }))}
                      disabled={(date) => !!periodForm.start_date && date <= new Date(`${periodForm.start_date}T00:00:00`)}
                      initialFocus
                      className="p-3 pointer-events-auto"
                      captionLayout="dropdown-buttons"
                      fromYear={2020}
                      toYear={new Date().getFullYear() + 5}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label>Période active</Label>
                <p className="text-xs text-muted-foreground max-w-sm">
                  La période active est celle rattachée aux nouveaux paiements enregistrés.
                  Une seule période peut être active à la fois ; l'activer désactive
                  automatiquement les autres.
                </p>
              </div>
              <Switch
                checked={periodForm.is_active}
                onCheckedChange={(checked) => setPeriodForm((f) => ({ ...f, is_active: checked }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPeriodDialog(false)}>Annuler</Button>
            <Button onClick={handleSavePeriod} disabled={saving || !periodForm.label || !periodForm.start_date || !periodForm.end_date}>
              <Save className="h-4 w-4 mr-2" /> {editingPeriod ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
