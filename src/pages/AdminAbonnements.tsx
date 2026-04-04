import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft, CreditCard, Calendar, Settings, Users, Eye, Loader2, Save, Plus, Pencil,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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
  const { toast } = useToast();
  const [configs, setConfigs] = useState<SubscriptionConfig[]>([]);
  const [periods, setPeriods] = useState<SubscriptionPeriod[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPayments, setShowPayments] = useState(false);

  // Edit state for prices
  const [editPrices, setEditPrices] = useState<Record<string, { single: number; family: number }>>({});

  // Period dialog
  const [periodDialog, setPeriodDialog] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<SubscriptionPeriod | null>(null);
  const [periodForm, setPeriodForm] = useState({ label: "", start_date: "", end_date: "" });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchConfigs(), fetchPeriods(), fetchPayments()]);
    setLoading(false);
  };

  const fetchConfigs = async () => {
    const { data } = await supabase.from("subscription_config").select("*").order("plan_type");
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
    const { data } = await supabase.from("subscription_periods").select("*").order("start_date", { ascending: false });
    if (data) setPeriods(data as SubscriptionPeriod[]);
  };

  const fetchPayments = async () => {
    const { data: paymentsData } = await supabase
      .from("payments")
      .select("*")
      .order("payment_date", { ascending: false });

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

  const handleSavePrices = async (configId: string) => {
    setSaving(true);
    const prices = editPrices[configId];
    const { error } = await supabase
      .from("subscription_config")
      .update({ price_single: prices.single, price_family: prices.family, updated_at: new Date().toISOString() })
      .eq("id", configId);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Succès", description: "Prix mis Ã  jour avec succès" });
      fetchConfigs();
    }
    setSaving(false);
  };

  const handleSavePeriod = async () => {
    setSaving(true);
    if (editingPeriod) {
      const { error } = await supabase
        .from("subscription_periods")
        .update({ label: periodForm.label, start_date: periodForm.start_date, end_date: periodForm.end_date, updated_at: new Date().toISOString() })
        .eq("id", editingPeriod.id);
      if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
      else toast({ title: "Succès", description: "Période mise Ã  jour" });
    } else {
      const { error } = await supabase
        .from("subscription_periods")
        .insert({ label: periodForm.label, start_date: periodForm.start_date, end_date: periodForm.end_date });
      if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
      else toast({ title: "Succès", description: "Période créée" });
    }
    setPeriodDialog(false);
    setEditingPeriod(null);
    setPeriodForm({ label: "", start_date: "", end_date: "" });
    fetchPeriods();
    setSaving(false);
  };

  const openEditPeriod = (p: SubscriptionPeriod) => {
    setEditingPeriod(p);
    setPeriodForm({ label: p.label, start_date: p.start_date, end_date: p.end_date });
    setPeriodDialog(true);
  };

  const openNewPeriod = () => {
    setEditingPeriod(null);
    setPeriodForm({ label: "", start_date: "", end_date: "" });
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Retour
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Gestion des Abonnements</h1>
                <p className="text-sm text-muted-foreground">Configurez les tarifs, périodes et consultez les paiements</p>
              </div>
            </div>
          </div>
        </div>
      </header>

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
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Calendar className="h-5 w-5 text-orange-500" />
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Aucun paiement enregistré pour le moment.
                        </TableCell>
                      </TableRow>
                    ) : (
                      payments.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.user_name}</TableCell>
                          <TableCell className="text-muted-foreground">{p.user_email}</TableCell>
                          <TableCell>{format(new Date(p.payment_date), "dd MMM yyyy Ã  HH:mm", { locale: fr })}</TableCell>
                          <TableCell>
                            <Badge variant={p.plan_type === "annual" ? "default" : "secondary"}>
                              {p.plan_label}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">{p.amount.toLocaleString("fr-DZ")} DA</TableCell>
                          <TableCell className="text-center">{p.is_family ? p.children_count : 1}</TableCell>
                          <TableCell>
                            <Badge variant={p.status === "completed" ? "default" : "destructive"}>
                              {p.status === "completed" ? "Complété" : p.status}
                            </Badge>
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
              <Label>Libellé (ex: Année scolaire 2025-2026)</Label>
              <Input
                value={periodForm.label}
                onChange={(e) => setPeriodForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="Année scolaire 2025-2026"
              />
            </div>
            <div>
              <Label>Date de début</Label>
              <Input
                type="date"
                value={periodForm.start_date}
                onChange={(e) => setPeriodForm((f) => ({ ...f, start_date: e.target.value }))}
              />
            </div>
            <div>
              <Label>Date de fin</Label>
              <Input
                type="date"
                value={periodForm.end_date}
                onChange={(e) => setPeriodForm((f) => ({ ...f, end_date: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPeriodDialog(false)}>Annuler</Button>
            <Button onClick={handleSavePeriod} disabled={saving || !periodForm.label || !periodForm.start_date || !periodForm.end_date}>
              <Save className="h-4 w-4 mr-2" /> {editingPeriod ? "Mettre Ã  jour" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
