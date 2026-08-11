import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CreditCard, Search, Loader2, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AppHeader } from "@/components/layout/AppHeader";

interface PaymentRecord {
  id: string;
  user_id: string;
  plan_type: string;
  plan_label: string;
  amount: number;
  amount_ttc: number;
  is_family: boolean;
  children_count: number;
  payment_date: string;
  status: string;
  user_name?: string;
  user_email?: string;
  invoice_number?: string | null;
}

const PAGE_SIZE = 20;

export default function AdminPaiements() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed" | "failed" | "cancelled">("all");

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  // La recherche texte se fait côté client sur la page courante (le filtre
  // nom/email nécessiterait sinon une jointure serveur sur profiles) : on
  // revient à la page 1 pour éviter une page vide après un filtre.
  useEffect(() => {
    setPage(0);
  }, [statusFilter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("payments")
        .select("*", { count: "exact" })
        .order("payment_date", { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data: paymentsData, error: paymentsError, count } = await query;

      if (paymentsError) {
        toast.error("Impossible de charger les paiements", { description: paymentsError.message });
        return;
      }

      setTotalCount(count || 0);

      if (paymentsData && paymentsData.length > 0) {
        const userIds = [...new Set(paymentsData.map((p: any) => p.user_id))];
        const paymentIds = paymentsData.map((p: any) => p.id);

        const [{ data: profiles }, { data: invoices }] = await Promise.all([
          supabase.from("profiles").select("id, first_name, last_name, email").in("id", userIds),
          supabase.from("invoices").select("payment_id, invoice_number").in("payment_id", paymentIds),
        ]);

        const profileMap = new Map<string, { name: string; email: string }>();
        profiles?.forEach((p: any) => {
          const name = [p.first_name, p.last_name].filter(Boolean).join(" ") || "Sans nom";
          profileMap.set(p.id, { name, email: p.email });
        });

        const invoiceMap = new Map<string, string>();
        (invoices as any[] || []).forEach((inv) => invoiceMap.set(inv.payment_id, inv.invoice_number));

        setPayments(
          paymentsData.map((p: any) => ({
            ...p,
            user_name: profileMap.get(p.user_id)?.name || "Inconnu",
            user_email: profileMap.get(p.user_id)?.email || "",
            invoice_number: invoiceMap.get(p.id) || null,
          }))
        );
      } else {
        setPayments([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Aucune passerelle de paiement réelle n'est intégrée : un paiement entre en
  // statut 'pending' et seul un admin, après avoir vérifié le virement/paiement
  // réel, peut l'approuver (ce qui émet alors les codes d'activation et crée
  // automatiquement la facture) ou le rejeter.
  const handleApprovePayment = async (paymentId: string) => {
    setProcessingPayment(paymentId);
    const { error } = await supabase.rpc("admin_approve_payment" as any, { p_payment_id: paymentId });
    if (error) {
      toast.error("Impossible de valider ce paiement", { description: error.message });
    } else {
      toast.success("Paiement validé, codes d'activation émis et facture créée");
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

  const filteredPayments = payments.filter((p) => {
    const s = search.trim().toLowerCase();
    if (!s) return true;
    return `${p.user_name || ""} ${p.user_email || ""}`.toLowerCase().includes(s);
  });

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="min-h-screen pro-shell">
      <AppHeader
        title="Paiements"
        subtitle="Historique des transactions et validation des paiements en attente"
        titleIcon={CreditCard}
        onBack={() => navigate("/dashboard")}
        showProfileMenu={false}
      />

      <main className="container mx-auto px-4 py-8 space-y-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un nom ou un email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="completed">Complété</SelectItem>
                <SelectItem value="failed">Rejeté</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle>Historique des paiements</CardTitle>
            <CardDescription>
              {totalCount} paiement{totalCount > 1 ? "s" : ""} au total — page {page + 1} / {totalPages}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
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
                      <TableHead>Facture</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          Aucun paiement trouvé.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPayments.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.user_name}</TableCell>
                          <TableCell className="text-muted-foreground">{p.user_email}</TableCell>
                          <TableCell>{format(new Date(p.payment_date), "dd MMM yyyy à HH:mm", { locale: fr })}</TableCell>
                          <TableCell>
                            <Badge variant={p.plan_type === "annual" ? "default" : "secondary"}>
                              {p.plan_label}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">{(p.amount_ttc ?? p.amount).toLocaleString("fr-DZ")} DA</TableCell>
                          <TableCell className="text-center">{p.is_family ? p.children_count : 1}</TableCell>
                          <TableCell className="text-xs text-muted-foreground font-mono">{p.invoice_number || "—"}</TableCell>
                          <TableCell>
                            <Badge variant={p.status === "completed" ? "default" : p.status === "pending" ? "secondary" : "destructive"}>
                              {p.status === "completed" ? "Complété" : p.status === "pending" ? "En attente" : p.status === "failed" ? "Rejeté" : p.status === "cancelled" ? "Annulé" : p.status}
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
            )}
          </CardContent>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={page === 0 || loading}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" /> Précédent
              </Button>
              <span className="text-sm text-muted-foreground">Page {page + 1} sur {totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={page >= totalPages - 1 || loading}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              >
                Suivant <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
