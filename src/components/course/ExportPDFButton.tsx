import { useState, type RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { exportNodeToPdf } from "@/lib/exportNodeToPdf";

interface ExportPDFButtonProps {
  /** Référence vers le nœud DOM déjà affiché à l'écran à exporter tel quel
   * (LaTeX déjà rendu par KaTeX, blocs colorés, direction RTL/LTR...). */
  targetRef: RefObject<HTMLElement>;
  fileName: string;
  /** Libellé du bouton (par défaut "Exporter en PDF"). */
  label?: string;
}

export const ExportPDFButton = ({ targetRef, fileName, label = "Exporter en PDF" }: ExportPDFButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleExportPDF = async () => {
    if (!targetRef.current) {
      toast.error("Contenu introuvable pour l'export.");
      return;
    }
    setLoading(true);
    toast.info("Préparation du PDF...");
    try {
      await exportNodeToPdf(targetRef.current, fileName);
      toast.success("PDF téléchargé !");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Erreur lors de l'export PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleExportPDF} variant="outline" size="sm" disabled={loading} className="gap-2">
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      {label}
    </Button>
  );
};
