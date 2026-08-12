import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";

// Éditeur de cours (création/édition de contenu pédagogique par l'équipe
// éditoriale). Placeholder tant que les tables éditoriales (cours, sections,
// matieres, niveaux) n'existent pas en base ; l'id de cours de l'URL n'est
// pour l'instant pas exploité.
export default function EditeurCours() {
  const { id } = useParams();
  const navigate = useNavigate();

  // This feature requires the editorial tables (cours, sections, etc.)
  // which are not yet in the database

  return (
    <div className="min-h-screen pro-shell">
      <AppHeader />
      <div className="container mx-auto p-6">
        <Button variant="ghost" onClick={() => navigate('/editorial')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au tableau de bord
        </Button>

        <Card className="p-12 text-center">
          <h2 className="text-xl font-semibold mb-4">Éditeur de cours</h2>
          <p className="text-muted-foreground mb-6">
            L'éditeur de cours nécessite les tables éditorial (cours, sections, matieres, niveaux) 
            qui ne sont pas encore configurées dans la base de données.
          </p>
          <Button onClick={() => navigate('/editorial')}>
            Retour au tableau de bord
          </Button>
        </Card>
      </div>
    </div>
  );
}
