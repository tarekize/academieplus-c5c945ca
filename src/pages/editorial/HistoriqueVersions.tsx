import { useNavigate, useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock } from "lucide-react";

export default function HistoriqueVersions() {
  const { id } = useParams();
  const navigate = useNavigate();

  // This feature requires the editorial tables (cours, historique_versions)
  // which are not yet in the database

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/editorial')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au tableau de bord
        </Button>
        <h1 className="text-3xl font-bold">Historique des versions</h1>
      </div>

      <Card className="p-12 text-center">
        <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h2 className="text-xl font-semibold mb-4">Fonctionnalité non disponible</h2>
        <p className="text-muted-foreground mb-6">
          L'historique des versions nécessite les tables éditorial qui ne sont pas encore configurées dans la base de données.
        </p>
        <Button onClick={() => navigate('/editorial')}>
          Retour au tableau de bord
        </Button>
      </Card>
    </div>
  );
}