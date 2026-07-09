import { useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import {
  BookOpen,
  FileEdit,
  CheckCircle,
  AlertTriangle,
  Plus,
  Users,
  ArrowLeft,
} from "lucide-react";

export default function DashboardEditorial() {
  const navigate = useNavigate();

  // This feature requires the editorial tables (cours, sections, etc.)
  // which are not yet in the database. Showing placeholder UI.

  return (
    <div className="min-h-screen pro-shell">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
            <h1 className="font-display text-3xl font-extrabold">Tableau de bord éditorial</h1>
            <p className="text-muted-foreground mt-1">
              Gérez vos cours et contenus pédagogiques
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <LanguageToggle />
            <Link to="/editorial/equipe">
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Gestion équipe
              </Button>
            </Link>
            <Button disabled className="bg-[image:var(--gradient-primary)] border-0">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau cours
            </Button>
          </div>
        </div>

        {/* Statistics Cards - Static placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="pro-card p-6">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-mint/10 flex items-center justify-center shrink-0">
                <CheckCircle className="h-5 w-5 text-mint" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Publiés</p>
                <p className="font-display text-3xl font-black mt-1">0</p>
              </div>
            </div>
          </Card>

          <Card className="pro-card p-6">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <FileEdit className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Brouillons</p>
                <p className="font-display text-3xl font-black mt-1">0</p>
                <p className="text-xs text-muted-foreground mt-1">À finaliser</p>
              </div>
            </div>
          </Card>

          <Card className="pro-card p-6">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-amber/10 flex items-center justify-center shrink-0">
                <BookOpen className="h-5 w-5 text-amber" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En révision</p>
                <p className="font-display text-3xl font-black mt-1">0</p>
                <p className="text-xs text-muted-foreground mt-1">En attente</p>
              </div>
            </div>
          </Card>

          <Card className="pro-card p-6">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-coral/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-coral" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">À modifier</p>
                <p className="font-display text-3xl font-black mt-1">0</p>
                <p className="text-xs text-muted-foreground mt-1">Non conforme</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Message about missing tables */}
        <Card className="pro-card p-12 text-center">
          <h2 className="font-display text-xl font-bold mb-4">Configuration requise</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Le module éditorial nécessite des tables supplémentaires dans la base de données
            (cours, sections, matieres, niveaux, historique_versions) qui ne sont pas encore configurées.
          </p>
          <p className="text-sm text-muted-foreground">
            En attendant, les cours de mathématiques sont disponibles via les données statiques.
          </p>
          <Button className="mt-6 bg-[image:var(--gradient-primary)] border-0" onClick={() => navigate('/liste-cours')}>
            Voir les cours disponibles
          </Button>
        </Card>
      </div>
    </div>
  );
}
