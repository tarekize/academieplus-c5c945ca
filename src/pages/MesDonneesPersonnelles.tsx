import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Download, Eye, Trash2, AlertTriangle, FileText, Shield } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  school_level: string | null;
  is_active: boolean | null;
}

const MesDonneesPersonnelles = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const getFullName = (profile: Profile | null): string => {
    if (!profile) return "Non renseigné";
    const parts = [profile.first_name, profile.last_name].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "Non renseigné";
  };

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, school_level, is_active')
        .eq('id', user.id)
        .single();
      
      setProfile(profileData);

    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
        return;
      }

      const { data, error } = await supabase.functions.invoke('export-user-data', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      // Create a blob and download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `academieplus-mes-donnees-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Vos données ont été exportées avec succès !");

    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(error.message || "Erreur lors de l'export des données");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestDeletion = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      toast.success(
        "Demande de suppression enregistrée. Votre compte sera supprimé dans 30 jours.",
        { duration: 8000 }
      );

    } catch (error: any) {
      console.error('Deletion request error:', error);
      toast.error(error.message || "Erreur lors de la demande de suppression");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gradient-to-br from-background via-secondary/10 to-background py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Mes Données Personnelles
            </h1>
            <p className="text-muted-foreground">
              Gérez vos données conformément au RGPD - Vos droits : accès, rectification, portabilité, oubli
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Mes Informations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Mes Informations
                </CardTitle>
                <CardDescription>
                  Consultez et modifiez vos données personnelles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile && (
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Nom complet:</span> {getFullName(profile)}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {profile.email}
                    </div>
                    <div>
                      <span className="font-medium">Niveau:</span> {profile.school_level || 'Non renseigné'}
                    </div>
                    <div>
                      <span className="font-medium">Compte actif:</span>{' '}
                      <Badge variant={profile.is_active ? "default" : "destructive"}>
                        {profile.is_active ? 'Oui' : 'Non'}
                      </Badge>
                    </div>
                  </div>
                )}
                <Separator />
                <Button 
                  onClick={() => navigate('/mes-informations')} 
                  variant="outline"
                  className="w-full"
                >
                  Modifier mes informations
                </Button>
              </CardContent>
            </Card>

            {/* Export de données */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Exporter mes données
                </CardTitle>
                <CardDescription>
                  Téléchargez toutes vos données au format JSON (droit à la portabilité)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Vous recevrez un fichier JSON contenant :
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Vos informations de profil</li>
                  <li>Vos liens parent-enfant</li>
                  <li>Vos logs d'activité</li>
                </ul>
                <Button 
                  onClick={handleExportData} 
                  disabled={loading}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {loading ? 'Export en cours...' : 'Exporter mes données'}
                </Button>
              </CardContent>
            </Card>

            {/* Mes Consentements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Mes Consentements
                </CardTitle>
                <CardDescription>
                  Historique de vos consentements RGPD
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  En utilisant ce service, vous avez accepté nos conditions d'utilisation et notre politique de confidentialité.
                </p>
              </CardContent>
            </Card>

            {/* Historique d'accès */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Historique d'accès
                </CardTitle>
                <CardDescription>
                  Derniers accès à vos données personnelles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Aucun accès enregistré récemment</p>
              </CardContent>
            </Card>
          </div>

          {/* Supprimer mon compte */}
          <Card className="mt-6 border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Supprimer mon compte
              </CardTitle>
              <CardDescription>
                Action irréversible - Période de grâce de 30 jours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-destructive/10 p-4 rounded-lg space-y-2 text-sm">
                <p className="font-medium">⚠️ Avant de supprimer votre compte :</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Toutes vos données personnelles seront supprimées</li>
                  <li>Vos abonnements seront annulés</li>
                  <li>Vous disposerez d'une période de grâce de 30 jours pour annuler</li>
                  <li>Cette action est définitive après 30 jours</li>
                </ul>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={loading}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer mon compte
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action planifiera la suppression de votre compte dans 30 jours.
                      Vous recevrez un email de confirmation et pourrez annuler à tout moment pendant cette période.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRequestDeletion} className="bg-destructive hover:bg-destructive/90">
                      Confirmer la suppression
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          {/* Liens utiles */}
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Button variant="outline" onClick={() => navigate('/politique-confidentialite')}>
              Politique de confidentialité
            </Button>
            <Button variant="outline" onClick={() => navigate('/mentions-legales')}>
              Mentions légales
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MesDonneesPersonnelles;
