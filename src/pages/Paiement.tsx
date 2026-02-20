import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CreditCard, GraduationCap, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">AcadémiePlus</span>
              </div>
            </div>
          </div>
        </header>

        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold mb-4">Aucune formule sélectionnée</h1>
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
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">AcadémiePlus</span>
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
                      <p className="text-sm font-medium">{fullName}</p>
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

          <div className="max-w-2xl mx-auto">
            <Card className="p-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">
                  Paiement
                </h1>
                <p className="text-2xl font-semibold text-primary">
                  {paymentInfo.planName}
                </p>
              </div>

              <div className="mb-8 p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center text-lg">
                  <span>Montant total</span>
                  <span className="font-bold">{paymentInfo.price.toLocaleString('fr-DZ')} DA</span>
                </div>
                {paymentInfo.isFamily && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Formule famille incluse
                  </p>
                )}
              </div>

              <div className="space-y-6">
                <h2 className="text-xl font-bold">
                  Informations de paiement
                </h2>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Numéro de carte</Label>
                    <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Date d'expiration</Label>
                      <Input id="expiry" placeholder="MM/AA" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" placeholder="123" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Nom sur la carte</Label>
                    <Input id="cardName" placeholder="Nom complet" />
                  </div>
                </div>

                <Button 
                  className="w-full mt-6"
                  size="lg"
                  onClick={() => {
                    toast({
                      title: "Fonctionnalité en cours de développement",
                      description: "Le système de paiement sera bientôt disponible.",
                    });
                  }}
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payer {paymentInfo.price.toLocaleString('fr-DZ')} DA
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Paiement sécurisé • Vos données sont protégées
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Paiement;
