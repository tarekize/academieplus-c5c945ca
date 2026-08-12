import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CreditCard, GraduationCap, LogOut, User as UserIcon, Shield, Lock, Clock, Landmark, Upload, FileImage, X as XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatLocaleDate } from "@/lib/formatLocale";
import { useTranslation } from "react-i18next";

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  school_level: string | null;
  avatar_url: string | null;
}

interface PaymentInfo {
  planId: string;
  planName: string;
  price: number;
  isFamily: boolean;
  billingPeriod: string;
  monthsCount: number;
}

interface BankDetails {
  bank_name: string;
  rib: string;
  ccp_number: string;
  ccp_key: string;
  account_holder: string;
  instructions: string;
}

const RECEIPT_MAX_SIZE = 5 * 1024 * 1024; // 5 Mo
const RECEIPT_ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

const Paiement = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const paymentInfo = location.state as PaymentInfo | null;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank_transfer">("card");
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate("/auth"); return; }
      fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { navigate("/auth"); return; }
      fetchProfile(session.user.id);
    });

    fetchBankDetails();

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Charge les coordonnées bancaires à afficher pour le virement (RIB/CCP/
  // instructions), éditables par l'admin dans AdminAbonnements. Lecture
  // publique en RLS (table `payment_bank_details`) car nécessaire avant même
  // que l'utilisateur ait choisi un mode de paiement.
  const fetchBankDetails = async () => {
    const { data } = await supabase
      .from("payment_bank_details" as any)
      .select("bank_name, rib, ccp_number, ccp_key, account_holder, instructions")
      .maybeSingle();
    if (data) setBankDetails(data as unknown as BankDetails);
  };

  // Charge le profil de l'utilisateur connecté pour l'affichage (nom, avatar,
  // niveau scolaire) dans l'en-tête de la page. Appelée au montage et à
  // chaque changement de session (onAuthStateChange ci-dessus).
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, school_level, avatar_url")
        .eq("id", userId)
        .single();
      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      toast.error(t("account.errorTitle"), { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Formate le nom affiché dans l'en-tête à partir du profil chargé.
  const getFullName = (p: Profile | null): string => {
    if (!p) return t("abonnements.defaultUser");
    const parts = [p.first_name, p.last_name].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : t("abonnements.defaultUser");
  };

  // Traduit le code de niveau scolaire (ex: "3as") en libellé lisible.
  const getSchoolLevelName = (level: string) => {
    return t(`app.schoolLevels.${level}`, { defaultValue: level });
  };

  // Déconnecte l'utilisateur depuis le menu de l'en-tête et renvoie à l'accueil.
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // Valide le fichier de reçu de virement choisi (type image + taille max
  // 5 Mo) avant de le garder en state — l'edge function record-payment
  // revalide ensuite côté serveur que le fichier a bien été uploadé, ce
  // contrôle client n'est qu'un confort UX, pas une garantie de sécurité.
  const handleReceiptChange = (file: File | null) => {
    if (!file) { setReceiptFile(null); return; }
    if (!RECEIPT_ACCEPTED_TYPES.includes(file.type)) {
      toast.error(t("paiement.receiptInvalidType"));
      return;
    }
    if (file.size > RECEIPT_MAX_SIZE) {
      toast.error(t("paiement.receiptTooLarge"));
      return;
    }
    setReceiptFile(file);
  };

  // Soumet la demande de paiement : uploade le reçu de virement si besoin
  // puis appelle l'edge function record-payment, qui recalcule le prix
  // server-side (jamais le `paymentInfo.price` local, purement informatif
  // ici) et crée un paiement en statut 'pending'. Déclenchée par le bouton
  // "Payer"/"Envoyer le reçu" en bas du formulaire.
  const handlePayment = async () => {
    if (!paymentInfo || !profile) return;

    if (paymentMethod === "card") {
      if (!cardNumber.trim() || !secretCode.trim()) {
        toast.error(t("paiement.missingFieldsError"));
        return;
      }
    } else if (!receiptFile) {
      toast.error(t("paiement.receiptRequired"));
      return;
    }

    setProcessing(true);

    try {
      let receiptPath: string | null = null;

      if (paymentMethod === "bank_transfer" && receiptFile) {
        const ext = receiptFile.name.split(".").pop() || "jpg";
        receiptPath = `${profile.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("payment-receipts")
          .upload(receiptPath, receiptFile, { upsert: false });
        if (uploadError) throw new Error(uploadError.message);
      }

      const { data, error } = await supabase.functions.invoke('record-payment', {
        body: {
          billing_period: paymentInfo.billingPeriod,
          plan_name: paymentInfo.planName,
          is_family: paymentInfo.isFamily,
          payment_method: paymentMethod,
          receipt_path: receiptPath,
        },
      });

      if (error) throw new Error(error.message || 'Payment failed');
      if (data?.error) throw new Error(data.error);

      setPaymentDone(true);
      toast.success(t("paiement.paymentPendingToast"), { description: t("paiement.paymentPendingDesc") });
    } catch (err: any) {
      toast.error(t("account.errorTitle"), { description: err.message });
    } finally {
      setProcessing(false);
    }
  };

  // Dérive les infos d'affichage du récapitulatif (mensualité, dates de
  // début/fin) à partir du plan choisi transmis par Pricing.tsx — purement
  // pour l'UI, aucune de ces valeurs n'est envoyée au serveur.
  const getBillingDetails = () => {
    if (!paymentInfo) return null;
    const now = new Date();
    const isAnnual = paymentInfo.billingPeriod === 'annual';
    const months = isAnnual ? 12 : 1;
    const monthlyPrice = Math.round(paymentInfo.price / months);
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + months);
    const formatDate = (d: Date) => formatLocaleDate(d, { day: 'numeric', month: 'long', year: 'numeric' });
    return {
      monthlyPrice,
      totalPrice: paymentInfo.price,
      months,
      periodLabel: isAnnual ? t("pricing.fallbackPeriod") : t("account.planMonthlyLower"),
      startDate: formatDate(now),
      endDate: formatDate(endDate),
      renewalDate: formatDate(endDate),
      isAnnual,
    };
  };

  const billing = getBillingDetails();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!paymentInfo) {
    return (
      <div className="min-h-screen pro-shell">
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate("/liste-matieres")}>
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">AcadémiePlus</span>
              </div>
            </div>
          </div>
        </header>
        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-3xl font-extrabold mb-4 text-foreground">{t("paiement.noPlanTitle")}</h1>
            <p className="text-muted-foreground mb-8">{t("paiement.noPlanDesc")}</p>
            <Button onClick={() => navigate("/abonnements")}>{t("paiement.viewPlans")}</Button>
          </div>
        </main>
      </div>
    );
  }

  const fullName = getFullName(profile);

  if (paymentDone) {
    return (
      <div className="min-h-screen pro-shell">
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate("/liste-matieres")}>
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">AcadémiePlus</span>
              </div>
            </div>
          </div>
        </header>

        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-lg">
            <Card className="p-8 text-center">
              <Clock className="h-16 w-16 text-amber-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">{t("paiement.paymentPendingTitle")}</h1>
              <p className="text-muted-foreground mb-6">
                {t("paiement.paymentPendingDesc")}
              </p>

              <p className="text-sm text-muted-foreground mb-6">
                {t("paiement.retrieveCodesHint")}
              </p>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => navigate("/factures")}>
                  {t("paiement.myCodes")}
                </Button>
                <Button className="flex-1" onClick={() => navigate("/account")}>
                  {t("account.pageTitle")}
                </Button>
              </div>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pro-shell">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate("/liste-matieres")}>
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">AcadémiePlus</span>
            </div>
            <div className="flex items-center gap-4">
              <LanguageToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer hover:bg-accent/10 rounded-lg p-2 transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback>{fullName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="text-left hidden md:block">
                      <p className="text-sm font-medium text-foreground">{fullName}</p>
                      <p className="text-xs text-muted-foreground">{profile?.school_level && getSchoolLevelName(profile.school_level)}</p>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate("/account")}><UserIcon className="mr-2 h-4 w-4" /><span>{t("app.manageAccount")}</span></DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}><GraduationCap className="mr-2 h-4 w-4" /><span>{t("app.dashboard")}</span></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive"><LogOut className="mr-2 h-4 w-4" /><span>{t("app.logout")}</span></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => navigate("/abonnements")} className="cursor-pointer flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  {t("paiement.backToPlans")}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid lg:grid-cols-[1fr_380px] gap-8 max-w-5xl mx-auto">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="font-display text-2xl font-extrabold text-foreground">{t("paiement.selectedFormula")}</h1>
                <span className="text-muted-foreground underline underline-offset-4">
                  {t("paiement.contentPrefix", { period: billing?.isAnnual ? t("pricing.fallbackPeriod") : t("account.planMonthlyLower") })}
                </span>
              </div>
              <Separator />

              <div className="space-y-6">
                <h2 className="text-xl font-bold text-foreground">{t("paiement.paymentSectionTitle")}</h2>

                <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "card" | "bank_transfer")}>
                  <TabsList className="grid grid-cols-2 h-auto">
                    <TabsTrigger value="card" className="gap-2 py-2.5">
                      <CreditCard className="h-4 w-4" /> {t("paiement.methodCard")}
                    </TabsTrigger>
                    <TabsTrigger value="bank_transfer" className="gap-2 py-2.5">
                      <Landmark className="h-4 w-4" /> {t("paiement.methodBankTransfer")}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {paymentMethod === "card" ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 border-2 border-primary rounded-lg px-4 py-2.5">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <span className="text-sm font-semibold text-foreground">CIB / EDAHABIA</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="cardNumber"
                          placeholder={t("paiement.cardNumberPlaceholder")}
                          className="pl-11 h-12 text-base"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="secretCode"
                          type="password"
                          placeholder={t("paiement.secretCodePlaceholder")}
                          className="pl-10 h-12 text-base"
                          value={secretCode}
                          onChange={(e) => setSecretCode(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Shield className="h-4 w-4 flex-shrink-0" />
                      <span>{t("paiement.securedHosting")}</span>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    {bankDetails && (bankDetails.rib || bankDetails.ccp_number) ? (
                      <Card className="p-4 bg-muted/30 space-y-2 text-sm">
                        {bankDetails.account_holder && (
                          <p><span className="font-semibold text-foreground">{t("paiement.accountHolderLabel")} :</span> {bankDetails.account_holder}</p>
                        )}
                        {bankDetails.bank_name && (
                          <p><span className="font-semibold text-foreground">{t("paiement.bankNameLabel")} :</span> {bankDetails.bank_name}</p>
                        )}
                        {bankDetails.rib && (
                          <p><span className="font-semibold text-foreground">{t("paiement.ribLabel")} :</span> <span className="font-mono">{bankDetails.rib}</span></p>
                        )}
                        {bankDetails.ccp_number && (
                          <p><span className="font-semibold text-foreground">{t("paiement.ccpLabel")} :</span> <span className="font-mono">{bankDetails.ccp_number}{bankDetails.ccp_key ? ` / ${bankDetails.ccp_key}` : ""}</span></p>
                        )}
                        {bankDetails.instructions && (
                          <p className="text-muted-foreground pt-1">{bankDetails.instructions}</p>
                        )}
                      </Card>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t("paiement.bankDetailsUnavailable")}</p>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">{t("paiement.receiptLabel")}</label>
                      <p className="text-xs text-muted-foreground">{t("paiement.receiptHint")}</p>
                      {receiptFile ? (
                        <div className="flex items-center justify-between gap-2 border rounded-lg px-3 py-2.5">
                          <span className="flex items-center gap-2 text-sm truncate">
                            <FileImage className="h-4 w-4 text-primary shrink-0" />
                            {receiptFile.name}
                          </span>
                          <Button type="button" variant="ghost" size="sm" onClick={() => setReceiptFile(null)}>
                            <XIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-2 border-2 border-dashed rounded-lg px-4 py-6 text-sm text-muted-foreground cursor-pointer hover:border-primary/50 hover:text-foreground transition-colors">
                          <Upload className="h-4 w-4" />
                          {t("paiement.receiptUploadCta")}
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                            onChange={(e) => handleReceiptChange(e.target.files?.[0] || null)}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  className="w-auto px-10 font-bold text-lg py-6"
                  size="lg"
                  disabled={processing}
                  onClick={handlePayment}
                >
                  {processing
                    ? t("paiement.processing")
                    : paymentMethod === "card"
                      ? t("paiement.payButton", { amount: paymentInfo.price.toLocaleString('fr-DZ') })
                      : t("paiement.submitReceiptButton")}
                </Button>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t("paiement.termsAgreementPrefix")}{" "}
                  <span className="font-semibold text-foreground cursor-pointer hover:underline" onClick={() => navigate("/mentions-legales")}>
                    {t("paiement.termsOfUse")}
                  </span>
                  , {t("paiement.andThe")}{" "}
                  <span className="font-semibold text-foreground cursor-pointer hover:underline" onClick={() => navigate("/politique-confidentialite")}>
                    {t("paiement.privacyPolicy")}
                  </span>
                  , {t("paiement.aswellAs")}{" "}
                  <span className="font-semibold text-foreground">{t("paiement.salesTerms")}</span>.
                </p>
              </div>
            </div>

            {/* Right Column - Tarif Summary */}
            <div className="lg:sticky lg:top-24 h-fit">
              <Card className="p-6 border-l-4 border-l-primary bg-card">
                <div className="flex items-baseline justify-between mb-6">
                  <h3 className="text-xl font-bold text-foreground">{t("paiement.tariffTitle")}</h3>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-primary">
                      {billing ? billing.monthlyPrice.toLocaleString('fr-DZ') : '---'} DA
                    </span>
                    <span className="text-muted-foreground text-sm"> {t("paiement.perMonth")}</span>
                  </div>
                </div>
                <Separator className="mb-5" />
                <div className="space-y-5">
                  <div>
                    <h4 className="font-bold text-foreground mb-1">{t("paiement.billingLabel")}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t("paiement.immediateDebit")}{" "}
                      <span className="font-semibold text-foreground">{paymentInfo.price.toLocaleString('fr-DZ')} DA</span>
                      {" "}
                      {billing?.isAnnual
                        ? t("paiement.forPeriodAnnual", { months: billing.months, start: billing.startDate, end: billing.endDate })
                        : t("paiement.forPeriodMonthly", { start: billing?.startDate, end: billing?.endDate })}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-1">{t("paiement.activationCodesLabel")}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {paymentInfo.isFamily ? t("paiement.codesFamily") : t("paiement.codesSingle")}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-1">{t("paiement.durationLabel")}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {billing?.isAnnual ? t("paiement.annualDuration") : t("paiement.monthlyDuration")}
                    </p>
                  </div>
                  {paymentInfo.isFamily && (
                    <div>
                      <h4 className="font-bold text-foreground mb-1">{t("paiement.formulaLabel")}</h4>
                      <p className="text-sm text-muted-foreground">{t("paiement.familyPlan")}</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Paiement;
