import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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

const cardVariants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

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
      
      <main className="flex-1 bg-gradient-to-br from-background via-accent/10 to-background py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-10 text-center md:text-left"
          >
            <h1 className="font-display text-4xl font-extrabold text-foreground mb-2">
              Mes Données Personnelles
            </h1>
            <p className="text-muted-foreground">
              Gérez vos données conformément au RGPD — vos droits : accès, rectification, portabilité, oubli
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
            className="grid gap-5 md:grid-cols-2"
          >
            {/* Mes Informations */}
            <motion.div variants={cardVariants}>
              <Card className="h-full rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-4 border-b border-border/30">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
                      <Eye className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-bold text-foreground">Mes Informations</h2>
                      <p className="text-xs text-muted-foreground">Consultez et modifiez vos données</p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6 space-y-4">
                  {profile && (
                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nom complet</span>
                        <span className="font-medium">{getFullName(profile)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email</span>
                        <span className="font-medium">{profile.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Niveau</span>
                        <span className="font-medium">{profile.school_level || 'Non renseigné'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Compte actif</span>
                        <Badge variant={profile.is_active ? "default" : "destructive"} className="rounded-full">
                          {profile.is_active ? 'Oui' : 'Non'}
                        </Badge>
                      </div>
                    </div>
                  )}
                  <Separator />
                  <Button
                    onClick={() => navigate('/mes-informations')}
                    variant="outline"
                    className="w-full rounded-full active:scale-95 transition-transform"
                  >
                    Modifier mes informations
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Export de données */}
            <motion.div variants={cardVariants}>
              <Card className="h-full rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-4 border-b border-border/30">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
                      <Download className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-bold text-foreground">Exporter mes données</h2>
                      <p className="text-xs text-muted-foreground">Format JSON, droit à la portabilité</p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6 space-y-4">
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
                    className="w-full rounded-full active:scale-95 transition-transform"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {loading ? 'Export en cours...' : 'Exporter mes données'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Mes Consentements */}
            <motion.div variants={cardVariants}>
              <Card className="h-full rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-4 border-b border-border/30">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="font-bold text-foreground">Mes Consentements</h2>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">
                    En utilisant ce service, vous avez accepté nos conditions d'utilisation et notre politique de confidentialité.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Historique d'accès */}
            <motion.div variants={cardVariants}>
              <Card className="h-full rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-4 border-b border-border/30">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="font-bold text-foreground">Historique d'accès</h2>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Aucun accès enregistré récemment</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Supprimer mon compte */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="mt-6 rounded-2xl border-destructive/30 bg-destructive/[0.03] overflow-hidden">
              <div className="bg-destructive/10 px-6 py-4 border-b border-destructive/10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-destructive/15 flex items-center justify-center">
                    <Trash2 className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <h2 className="font-bold text-destructive">Supprimer mon compte</h2>
                    <p className="text-xs text-destructive/80">Action irréversible — période de grâce de 30 jours</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="bg-destructive/10 p-4 rounded-xl space-y-2 text-sm">
                  <p className="font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                    Avant de supprimer votre compte :
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Toutes vos données personnelles seront supprimées</li>
                    <li>Vos abonnements seront annulés</li>
                    <li>Vous disposerez d'une période de grâce de 30 jours pour annuler</li>
                    <li>Cette action est définitive après 30 jours</li>
                  </ul>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={loading} className="rounded-full active:scale-95 transition-transform">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer mon compte
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action planifiera la suppression de votre compte dans 30 jours.
                        Vous recevrez un email de confirmation et pourrez annuler à tout moment pendant cette période.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={handleRequestDeletion} className="rounded-xl bg-destructive hover:bg-destructive/90">
                        Confirmer la suppression
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </motion.div>

          {/* Liens utiles */}
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Button variant="outline" className="rounded-full active:scale-95 transition-transform" onClick={() => navigate('/politique-confidentialite')}>
              Politique de confidentialité
            </Button>
            <Button variant="outline" className="rounded-full active:scale-95 transition-transform" onClick={() => navigate('/mentions-legales')}>
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
