import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

interface Version {
  id: number;
  version_numero: number;
  commentaire: string;
  date_version: string;
  contenu_snapshot: any;
}

export default function CompareVersions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const v1 = searchParams.get('v1');
  const v2 = searchParams.get('v2');

  // This feature requires the editorial tables (cours, historique_versions)
  // which are not yet in the database

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/editorial')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au tableau de bord
          </Button>
          <h1 className="text-3xl font-bold mt-4">Comparaison de versions</h1>
        </div>

        <Card className="p-12 text-center">
          <h2 className="text-xl font-semibold mb-4">Fonctionnalité non disponible</h2>
          <p className="text-muted-foreground mb-6">
            La comparaison de versions nécessite les tables éditorial qui ne sont pas encore configurées dans la base de données.
          </p>
          <Button onClick={() => navigate('/editorial')}>
            Retour au tableau de bord
          </Button>
        </Card>
      </div>
    </div>
  );
}