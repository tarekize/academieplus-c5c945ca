import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CreditCard, GraduationCap, LogOut, User as UserIcon, Shield, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
import { useToast } from "@/hooks/use-toast";

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

const Paiement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const paymentInfo = location.state as PaymentInfo | null;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      fetchProfile(session.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      fetchProfile(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFullName = (profile: Profile | null): string => {
    if (!profile) return "Utilisateur";
    const parts = [profile.first_name, profile.last_name].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "Utilisateur";
  };

  const getSchoolLevelName = (level: string) => {
    const levels: Record<string, string> = {
      "6eme": "6ème",
      "5eme": "5ème",
      "4eme": "4ème",
      "3eme": "3ème",
      seconde: "Seconde",
      premiere: "Première",
      terminale: "Terminale",
    };
    return levels[level] || level || "Votre classe";
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Déconnexion",
      description: "Vous avez été déconnecté avec succès",
    });
    navigate("/");
  };

  // Compute billing details
  const getBillingDetails = () => {
    if (!paymentInfo) return null;

    const now = new Date();
    const isAnnual = paymentInfo.billingPeriod === 'annual';
    const months = isAnnual ? 10 : 1;
    const monthlyPrice = Math.round(paymentInfo.price / months);

    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + months);

    const renewalDate = new Date(endDate);

    const formatDate = (d: Date) =>
      d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

    const periodLabel = isAnnual ? '1 année scolaire' : 'mensuel';

    return {
      monthlyPrice,
      totalPrice: paymentInfo.price,
      months,
      periodLabel,
      startDate: formatDate(now),
      endDate: formatDate(endDate),
      renewalDate: formatDate(renewalDate),
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
      <div className="min-h-screen bg-background">
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate("/liste-cours")}
              >
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
            <h1 className="text-3xl font-bold mb-4 text-foreground">Aucune formule sélectionnée</h1>
            <p className="text-muted-foreground mb-8">
              Veuillez d'abord choisir une formule d'abonnement.
            </p>
            <Button onClick={() => navigate("/abonnements")}>
              Voir les formules
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const fullName = getFullName(profile);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate("/liste-cours")}
            >
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">AcadémiePlus</span>
            </div>

            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer hover:bg-accent/10 rounded-lg p-2 transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback>
                        {fullName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left hidden md:block">
                      <p className="text-sm font-medium text-foreground">{fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {profile?.school_level && getSchoolLevelName(profile.school_level)}
                      </p>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate("/account")}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Gérer mon compte</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <GraduationCap className="mr-2 h-4 w-4" />
                    <span>Tableau de bord</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Se déconnecter</span>
                  </DropdownMenuItem>
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
                  Retour aux formules
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid lg:grid-cols-[1fr_380px] gap-8 max-w-5xl mx-auto">
            {/* Left Column - Plan + Payment Form */}
            <div className="space-y-6">
              {/* Selected Plan Header */}
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground">Formule sélectionnée</h1>
                <span className="text-muted-foreground underline underline-offset-4">
                  Contenus - {billing?.isAnnual ? '1 année scolaire' : 'mensuel'}
                </span>
              </div>

              <Separator />

              {/* Payment Form */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-foreground">Paiement</h2>

                {/* Payment Methods */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 border-2 border-primary rounded-lg px-4 py-2.5">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <span className="text-sm font-semibold text-foreground">CIB / EDAHABIA</span>
                  </div>
                  <div className="flex items-center gap-2 border rounded-lg px-4 py-2.5 text-muted-foreground">
                    <span className="text-sm font-medium">Virement bancaire</span>
                  </div>
                </div>

                {/* Card Number */}
                <div className="space-y-2">
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="cardNumber"
                      placeholder="1234 1234 1234 1234"
                      className="pl-11 h-12 text-base"
                    />
                  </div>
                </div>

                {/* Expiry + CVC */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Input
                      id="expiry"
                      placeholder="MM / AA"
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="cvv"
                      placeholder="CVC"
                      className="pl-10 h-12 text-base"
                    />
                  </div>
                </div>

                {/* Security Notice */}
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Shield className="h-4 w-4 flex-shrink-0" />
                  <span>
                    Hébergement entièrement sécurisé. AcadémiePlus n'enregistre pas votre moyen de paiement.
                  </span>
                </div>

                {/* Pay Button */}
                <Button
                  className="w-auto px-10 font-bold text-lg py-6"
                  size="lg"
                  onClick={() => {
                    toast({
                      title: "Fonctionnalité en cours de développement",
                      description: "Le système de paiement sera bientôt disponible.",
                    });
                  }}
                >
                  Payer {paymentInfo.price.toLocaleString('fr-DZ')} DA
                </Button>

                {/* Legal Text */}
                <p className="text-xs text-muted-foreground leading-relaxed">
                  En cliquant sur ce bouton, je confirme avoir lu et accepté les{" "}
                  <span
                    className="font-semibold text-foreground cursor-pointer hover:underline"
                    onClick={() => navigate("/mentions-legales")}
                  >
                    Conditions générales d'utilisation
                  </span>
                  , la{" "}
                  <span
                    className="font-semibold text-foreground cursor-pointer hover:underline"
                    onClick={() => navigate("/politique-confidentialite")}
                  >
                    politique de confidentialité
                  </span>
                  , ainsi que les{" "}
                  <span className="font-semibold text-foreground">
                    Conditions générales de vente d'AcadémiePlus
                  </span>
                  .
                </p>
              </div>
            </div>

            {/* Right Column - Tarif Summary */}
            <div className="lg:sticky lg:top-24 h-fit">
              <Card className="p-6 border-l-4 border-l-primary bg-card">
                <div className="flex items-baseline justify-between mb-6">
                  <h3 className="text-xl font-bold text-foreground">Tarif</h3>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-primary">
                      {billing ? billing.monthlyPrice.toLocaleString('fr-DZ') : '---'} DA
                    </span>
                    <span className="text-muted-foreground text-sm"> / mois</span>
                  </div>
                </div>

                <Separator className="mb-5" />

                <div className="space-y-5">
                  {/* Facturation */}
                  <div>
                    <h4 className="font-bold text-foreground mb-1">Facturation :</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Prélèvement immédiat de{" "}
                      <span className="font-semibold text-foreground">
                        {paymentInfo.price.toLocaleString('fr-DZ')} DA
                      </span>
                      {billing?.isAnnual ? (
                        <> pour une période de {billing.months} mois, soit du {billing.startDate} au {billing.endDate}.</>
                      ) : (
                        <> pour un mois, soit du {billing?.startDate} au {billing?.endDate}.</>
                      )}
                    </p>
                  </div>

                  {/* Résiliation */}
                  <div>
                    <h4 className="font-bold text-foreground mb-1">Résiliation en un clic :</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Immédiate en un clic depuis votre espace personnel, à effectuer à tout moment jusqu'à 24h avant le renouvellement. Accès maintenu jusqu'à la fin de la période déjà payée.
                    </p>
                  </div>

                  {/* Renouvellement */}
                  <div>
                    <h4 className="font-bold text-foreground mb-1">Renouvellement :</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Automatique le{" "}
                      <span className="font-bold text-foreground">{billing?.renewalDate}</span>
                      {" "}à hauteur de{" "}
                      <span className="font-semibold text-foreground">
                        {paymentInfo.price.toLocaleString('fr-DZ')} DA
                      </span>
                      {billing?.isAnnual ? (
                        <> pour une période suivante de {billing.months} mois, sauf résiliation préalable.</>
                      ) : (
                        <> pour une période suivante de 1 mois, sauf résiliation préalable.</>
                      )}
                    </p>
                  </div>

                  {paymentInfo.isFamily && (
                    <div>
                      <h4 className="font-bold text-foreground mb-1">Formule :</h4>
                      <p className="text-sm text-muted-foreground">
                        Famille (jusqu'à 3 enfants)
                      </p>
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
