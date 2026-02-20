import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye } from "lucide-react";

export default function PageRevision() {
  const navigate = useNavigate();

  // This feature requires the 'cours' table which is not in the database

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate('/editorial')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au tableau de bord
        </Button>
        <h1 className="text-3xl font-bold">Révision des cours</h1>
        <p className="text-muted-foreground mt-2">
          Examinez et approuvez les cours soumis par les éditeurs
        </p>
      </div>

      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <Eye className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-semibold mb-4">Fonctionnalité non disponible</h2>
            <p className="text-muted-foreground mb-6">
              La révision de cours nécessite les tables éditorial (cours, sections) 
              qui ne sont pas encore configurées dans la base de données.
            </p>
            <Button onClick={() => navigate('/editorial')}>
              Retour au tableau de bord
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}