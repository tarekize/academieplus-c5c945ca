import { useState, type RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { printRenderedNode } from "@/lib/printRenderedNode";

interface ExportPDFButtonProps {
  /** Référence vers le nœud DOM déjà affiché à l'écran à exporter tel quel
   * (LaTeX déjà rendu par KaTeX, blocs colorés, direction RTL/LTR...). */
  targetRef: RefObject<HTMLElement>;
  /** Titre du document (utilisé comme <title> et titre imprimé). */
  title: string;
  /** Libellé du bouton (par défaut "Exporter en PDF"). */
  label?: string;
}

export const ExportPDFButton = ({ targetRef, title, label = "Exporter en PDF" }: ExportPDFButtonProps) => {
  const [loading, setLoading] = useState(false);

  /** Ouvre une fenêtre d'impression avec le nœud DOM déjà rendu (donc formules
   * LaTeX déjà calculées), déclenché par un clic sur le bouton d'export. */
  const handleExportPDF = () => {
    if (!targetRef.current) {
      toast.error("Contenu introuvable pour l'export.");
      return;
    }
    setLoading(true);
    try {
      const opened = printRenderedNode(targetRef.current, title);
      if (!opened) {
        toast.error("Veuillez autoriser les pop-ups pour exporter en PDF");
        return;
      }
      toast.success("PDF prêt à l'impression !");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Erreur lors de l'export PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleExportPDF} variant="outline" size="sm" disabled={loading} className="gap-2">
      <Download className="w-4 h-4" />
      {label}
    </Button>
  );
};
