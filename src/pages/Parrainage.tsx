import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, Check, User as UserIcon, LogOut, GraduationCap, Users, Gift, TrendingUp, Wallet, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ReferralShareDialog } from "@/components/ReferralShareDialog";

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  avatar_url: string | null;
  school_level: string | null;
  linking_code: string | null;
}

const Parrainage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Récupérer le profil
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      setProfile(profileData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const referralCode = profile?.linking_code || "";
  const referralUrl = referralCode 
    ? `${window.location.origin}/auth?ref=${referralCode}`
    : "";

  const handleCopyCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      toast({
        title: "Lien copié !",
        description: "Le lien de parrainage a été copié dans le presse-papier.",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getFullName = () => {
    if (!profile) return "Utilisateur";
    const parts = [profile.first_name, profile.last_name].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : profile.email;
  };

  const getSchoolLevelName = (level: string) => {
    const levels: Record<string, string> = {
      "6eme": "6ème",
      "5eme": "5ème",
      "4eme": "4ème",
      "3eme": "3ème",
      "seconde": "Seconde",
      "premiere": "Première",
      "terminale": "Terminale",
    };
    return levels[level] || level;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/liste-cours")}>
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">AcadémiePlus</span>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback>
                      <UserIcon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{getFullName()}</p>
                    {profile?.school_level && (
                      <p className="text-xs text-muted-foreground">{getSchoolLevelName(profile.school_level)}</p>
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate("/account")}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  Gestion du compte
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Tableau de bord
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate("/account")} className="cursor-pointer">
                Retour à mon compte
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Programme de Parrainage</h1>
          <p className="text-lg text-muted-foreground">
            Parrainez vos amis et bénéficiez de réductions sur votre abonnement !
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-8 w-8 text-primary" />
              <h3 className="text-sm font-semibold">Filleuls</h3>
            </div>
            <p className="text-3xl font-bold text-primary">0</p>
            <p className="text-sm text-muted-foreground">Invitations acceptées</p>
          </Card>

          <Card className="p-6 bg-green-500/5 border-green-500/20">
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="h-8 w-8 text-green-600" />
              <h3 className="text-sm font-semibold">Crédit</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">0 €</p>
            <p className="text-sm text-muted-foreground">Solde disponible</p>
          </Card>

          <Card className="p-6 bg-purple-500/5 border-purple-500/20">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <h3 className="text-sm font-semibold">Réduction Max</h3>
            </div>
            <p className="text-3xl font-bold text-purple-600">50%</p>
            <p className="text-sm text-muted-foreground">Plafond atteint</p>
          </Card>
        </div>

        <Card className="p-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Votre Code de Parrainage</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Partagez ce code avec vos amis. Chaque fois qu'un ami s'inscrit avec votre code,
            vous recevez tous les deux une réduction !
          </p>

          {referralCode ? (
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <code className="text-2xl font-mono font-bold flex-1">{referralCode}</code>
              <Button onClick={handleCopyCode} variant="outline">
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? "Copié !" : "Copier le lien"}
              </Button>
              <Button onClick={() => setShareDialogOpen(true)}>
                <LinkIcon className="h-4 w-4 mr-2" />
                Partager
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground">Aucun code de parrainage disponible.</p>
          )}

          <div className="mt-6 p-4 bg-primary/5 border-l-4 border-primary rounded">
            <h3 className="font-semibold mb-2">Comment ça marche ?</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>5% de crédit</strong> par filleul basé sur son abonnement</li>
              <li>• <strong>Maximum 10 filleuls</strong> par parrain</li>
              <li>• Crédits <strong>sans limite de durée</strong></li>
              <li>• Utilisable comme <strong>moyen de paiement</strong> sur vos abonnements</li>
            </ul>
          </div>
        </Card>

        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-4">Historique des Parrainages</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Filleul</TableHead>
                <TableHead>Date d'inscription</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Crédit obtenu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  Aucun parrainage pour le moment. Partagez votre code pour commencer !
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>

        <ReferralShareDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          referralUrl={referralUrl}
          referralCode={referralCode}
        />
      </div>
    </div>
  );
};

export default Parrainage;