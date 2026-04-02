import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, BookOpen } from "lucide-react";

export default function PreviewCours() {
  const { id } = useParams();
  const navigate = useNavigate();

  // This feature requires the 'cours' table which is not in the database

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        <Button variant="ghost" onClick={() => navigate('/editorial')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au tableau de bord
        </Button>

        <Card className="p-12 text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-xl font-semibold mb-4">Prévisualisation non disponible</h2>
          <p className="text-muted-foreground mb-6">
            La prévisualisation de cours nécessite les tables éditorial (cours, sections) 
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