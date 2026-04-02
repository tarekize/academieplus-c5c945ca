import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";

export default function Mediatheque() {
  const navigate = useNavigate();

  // This feature requires the 'medias' table which is not in the database

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/editorial')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au tableau de bord
        </Button>
        <h1 className="text-3xl font-bold">Médiathèque</h1>
        <p className="text-muted-foreground mt-1">
          Gérez vos images et médias
        </p>
      </div>

      <Card className="p-12 text-center">
        <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h2 className="text-xl font-semibold mb-4">Fonctionnalité non disponible</h2>
        <p className="text-muted-foreground mb-6">
          La médiathèque nécessite la table 'medias' qui n'est pas encore configurée dans la base de données.
        </p>
        <Button onClick={() => navigate('/editorial')}>
          Retour au tableau de bord
        </Button>
      </Card>
    </div>
  );
}