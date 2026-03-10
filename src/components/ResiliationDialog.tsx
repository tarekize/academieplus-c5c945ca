import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertTriangle, Calculator, XCircle } from "lucide-react";

interface SubscriptionInfo {
  id: string;
  plan_type: string;
  started_at: string;
  days_used: number;
  total_days: number;
  is_paused: boolean;
  activation_code_id: string | null;
  is_family: boolean;
}

interface PriceConfig {
  annual_single: number;
  annual_family: number;
  monthly_single: number;
  monthly_family: number;
}

interface ResiliationDialogProps {
  userId: string;
  onResiliation?: () => void;
}

const FALLBACK_PRICES: PriceConfig = {
  annual_single: 15000,
  annual_family: 25000,
  monthly_single: 2000,
  monthly_family: 3500,
};

const ResiliationDialog = ({ userId, onResiliation }: ResiliationDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState<SubscriptionInfo[]>([]);
  const [prices, setPrices] = useState<PriceConfig>(FALLBACK_PRICES);
  const [selectedSub, setSelectedSub] = useState<SubscriptionInfo | null>(null);

  useEffect(() => {
    if (!open) return;
    fetchData();
  }, [open, userId]);

  const fetchData = async () => {
    // Fetch active annual subscriptions created by this parent (via activation codes)
    // Fetch all annual codes (used or free) created by this parent
    const { data: codes } = await supabase
      .from("activation_codes")
      .select("id, is_family, plan_type, status")
      .eq("created_by", userId)
      .eq("plan_type", "annual")
      .in("status", ["used", "free"]);

    if (codes && codes.length > 0) {
      const usedCodes = codes.filter(c => c.status === "used");
      const codeMap = new Map(codes.map(c => [c.id, c]));

      // For used codes, fetch linked subscriptions
      let subsFromDb: SubscriptionInfo[] = [];
      if (usedCodes.length > 0) {
        const codeIds = usedCodes.map(c => c.id);
        const { data: subs } = await supabase
          .from("student_subscriptions")
          .select("id, plan_type, started_at, days_used, total_days, is_paused, activation_code_id")
          .in("activation_code_id", codeIds);

        if (subs) {
          subsFromDb = subs.map(s => ({
            ...s,
            days_used: Number(s.days_used),
            is_family: codeMap.get(s.activation_code_id || "")?.is_family || false,
          }));
        }
      }

      // For free (unused) codes, create virtual entries so parent can cancel the purchase
      const freeCodes = codes.filter(c => c.status === "free");
      const freeEntries: SubscriptionInfo[] = freeCodes.map(c => ({
        id: `free_${c.id}`,
        plan_type: "annual",
        started_at: new Date().toISOString(),
        days_used: 0,
        total_days: 360,
        is_paused: false,
        activation_code_id: c.id,
        is_family: c.is_family,
      }));

      setSubscriptions([...subsFromDb, ...freeEntries]);
    } else {
      setSubscriptions([]);
    }

    // Fetch prices
    const { data: configs } = await supabase
      .from("subscription_config")
      .select("*")
      .eq("is_active", true);

    if (configs) {
      const annual = configs.find((c: any) => c.plan_type === "annual");
      const monthly = configs.find((c: any) => c.plan_type === "monthly");
      setPrices({
        annual_single: annual?.price_single ?? FALLBACK_PRICES.annual_single,
        annual_family: annual?.price_family ?? FALLBACK_PRICES.annual_family,
        monthly_single: monthly?.price_single ?? FALLBACK_PRICES.monthly_single,
        monthly_family: monthly?.price_family ?? FALLBACK_PRICES.monthly_family,
      });
    }
  };

  const getMonthsConsumed = (sub: SubscriptionInfo): number => {
    const days = sub.days_used;
    return Math.ceil(days / 30);
  };

  const calculateRefund = (sub: SubscriptionInfo) => {
    const monthsConsumed = getMonthsConsumed(sub);
    const annualPrice = sub.is_family ? prices.annual_family : prices.annual_single;
    const monthlyPrice = sub.is_family ? prices.monthly_family : prices.monthly_single;
    const costAtMonthlyRate = monthsConsumed * monthlyPrice;
    const refund = Math.max(0, annualPrice - costAtMonthlyRate);
    return { monthsConsumed, annualPrice, monthlyPrice, costAtMonthlyRate, refund };
  };

  const handleResiliation = async () => {
    if (!selectedSub) return;
    setLoading(true);

    try {
      const isFreeCode = selectedSub.id.startsWith("free_");

      // Delete the subscription only if it exists (not a free/unused code)
      if (!isFreeCode) {
        const { error: subError } = await supabase
          .from("student_subscriptions")
          .delete()
          .eq("id", selectedSub.id);

        if (subError) throw subError;
      }

      // Update activation code status to cancelled
      if (selectedSub.activation_code_id) {
        const { error: codeError } = await supabase
          .from("activation_codes")
          .update({ status: "cancelled", used_at: null, used_by: null })
          .eq("id", selectedSub.activation_code_id);

        if (codeError) throw codeError;
      }

      const refundInfo = calculateRefund(selectedSub);

      toast({
        title: "Resiliation confirmee",
        description: `L'abonnement a ete resilie. Montant a rembourser : ${refundInfo.refund}DA`,
      });

      setConfirmOpen(false);
      setOpen(false);
      setSelectedSub(null);
      onResiliation?.();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const annualSubs = subscriptions.filter(s => s.plan_type === "annual");

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="destructive"
            className="gap-2"
          >
            <XCircle className="h-4 w-4" />
            Resiliation
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Resiliation d'abonnement
            </DialogTitle>
            <DialogDescription>
              La resiliation s'applique uniquement aux abonnements annuels (Formule Scolaire). 
              Le remboursement est calcule en deduisant les mois consommes au tarif mensuel standard.
            </DialogDescription>
          </DialogHeader>

          {annualSubs.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">Aucun abonnement annuel actif eligible a la resiliation.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Les abonnements mensuels ne sont pas eligibles a la resiliation.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {annualSubs.map((sub) => {
                const { monthsConsumed, annualPrice, monthlyPrice, costAtMonthlyRate, refund } = calculateRefund(sub);
                return (
                  <Card key={sub.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">
                          Formule Scolaire {sub.is_family ? "(Pack Famille)" : "(1 enfant)"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Debut : {new Date(sub.started_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                      <Badge variant={sub.is_paused ? "outline" : "default"}>
                        {sub.is_paused ? "En pause" : "Actif"}
                      </Badge>
                    </div>

                    {/* Calculation breakdown */}
                    <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
                      <div className="flex items-center gap-2 font-medium text-foreground">
                        <Calculator className="h-4 w-4" />
                        Detail du calcul
                      </div>
                      <div className="space-y-1 text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Prix annuel paye</span>
                          <span className="font-mono">{annualPrice}DA</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Mois consommes</span>
                          <span className="font-mono">{monthsConsumed} mois</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tarif mensuel standard</span>
                          <span className="font-mono">{monthlyPrice}DA/mois</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cout reel ({monthsConsumed} x {monthlyPrice}DA)</span>
                          <span className="font-mono">{costAtMonthlyRate}DA</span>
                        </div>
                        <hr className="border-border" />
                        <div className="flex justify-between font-semibold text-foreground text-base">
                          <span>Remboursement</span>
                          <span className={`font-mono ${refund > 0 ? "text-emerald-600" : "text-destructive"}`}>
                            {refund}DA
                          </span>
                        </div>
                        {refund === 0 && (
                          <p className="text-xs text-destructive mt-1">
                            Aucun remboursement possible. Les mois consommes depassent ou egalent le prix annuel.
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setSelectedSub(sub);
                        setConfirmOpen(true);
                      }}
                    >
                      Resilier cet abonnement
                    </Button>
                  </Card>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Confirmer la resiliation
            </DialogTitle>
            <DialogDescription>
              Cette action est irreversible. L'abonnement sera immediatement desactive.
            </DialogDescription>
          </DialogHeader>

          {selectedSub && (() => {
            const { monthsConsumed, refund } = calculateRefund(selectedSub);
            return (
              <div className="py-4 space-y-3">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center space-y-1">
                  <p className="text-sm text-muted-foreground">Montant a rembourser</p>
                  <p className="text-3xl font-bold text-destructive">{refund}DA</p>
                  <p className="text-xs text-muted-foreground">
                    Apres {monthsConsumed} mois d'utilisation
                  </p>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Etes-vous sur de vouloir resilier cet abonnement ?
                </p>
              </div>
            );
          })()}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={loading}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleResiliation} disabled={loading}>
              {loading ? "Resiliation en cours..." : "Confirmer la resiliation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ResiliationDialog;
