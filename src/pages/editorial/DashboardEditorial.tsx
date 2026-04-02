import { useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Button>
          <h1 className="text-3xl font-bold">Tableau de bord éditorial</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos cours et contenus pédagogiques
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/editorial/equipe">
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Gestion équipe
            </Button>
          </Link>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau cours
          </Button>
        </div>
      </div>

      {/* Statistics Cards - Static placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Publiés</p>
              <p className="text-3xl font-bold mt-2">0</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Brouillons</p>
              <p className="text-3xl font-bold mt-2">0</p>
              <p className="text-xs text-muted-foreground mt-1">À finaliser</p>
            </div>
            <FileEdit className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">En révision</p>
              <p className="text-3xl font-bold mt-2">0</p>
              <p className="text-xs text-muted-foreground mt-1">En attente</p>
            </div>
            <BookOpen className="h-8 w-8 text-orange-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">À modifier</p>
              <p className="text-3xl font-bold mt-2">0</p>
              <p className="text-xs text-muted-foreground mt-1">Non conforme</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>
      </div>

      {/* Message about missing tables */}
      <Card className="p-12 text-center">
        <h2 className="text-xl font-semibold mb-4">Configuration requise</h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          Le module éditorial nécessite des tables supplémentaires dans la base de données 
          (cours, sections, matieres, niveaux, historique_versions) qui ne sont pas encore configurées.
        </p>
        <p className="text-sm text-muted-foreground">
          En attendant, les cours de mathématiques sont disponibles via les données statiques.
        </p>
        <Button className="mt-6" onClick={() => navigate('/liste-cours')}>
          Voir les cours disponibles
        </Button>
      </Card>
    </div>
  );
}