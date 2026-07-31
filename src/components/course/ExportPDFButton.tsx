import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface ExportPDFButtonProps {
  chapterTitle: string;
  content: string;
  /** Sens d'écriture du document exporté. Auto-détecté (présence de
   * caractères arabes dans le titre/contenu) si non fourni. */
  dir?: "rtl" | "ltr";
  /** Libellé du bouton (par défaut "Exporter en PDF"). */
  label?: string;
}

const ARABIC_CHARS_REGEX = /[؀-ۿ]/;

export const ExportPDFButton = ({ chapterTitle, content, dir, label = "Exporter en PDF" }: ExportPDFButtonProps) => {
  const handleExportPDF = () => {
    try {
      toast.info("Préparation du PDF...");

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error("Veuillez autoriser les pop-ups pour exporter en PDF");
        return;
      }

      const resolvedDir = dir || (ARABIC_CHARS_REGEX.test(`${chapterTitle} ${content}`) ? "rtl" : "ltr");
      const textAlign = resolvedDir === "rtl" ? "right" : "left";

      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="${resolvedDir}">
        <head>
          <title>${chapterTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; direction: ${resolvedDir}; text-align: ${textAlign}; }
            h1 { font-size: 28px; font-weight: bold; text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            h2, h3 { text-align: ${textAlign}; }
            .content { line-height: 1.8; }
            .content p { margin: 0.6em 0; }
            .content hr { border: none; border-top: 1px solid #ddd; margin: 20px 0; }
            .lesson-block { border-radius: 8px; padding: 0.8em 1.1em; margin: 0.9em 0; border-${resolvedDir === "rtl" ? "right" : "left"}: 4px solid #999; background: #f7f7f8; }
            .lesson-block-title { font-weight: bold; margin-bottom: 0.4em; }
            .block-definition { border-color: #3b82f6; }
            .block-property { border-color: #10b981; }
            .block-remark { border-color: #f59e0b; }
            .block-example { border-color: #a855f7; }
            .block-graphic { border-color: #ec4899; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <h1>${chapterTitle}</h1>
          <div class="content">${content}</div>
          <script>window.onload = function() { window.print(); }<\/script>
        </body>
        </html>
      `);
      printWindow.document.close();

      toast.success("PDF prêt à l'impression !");
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error("Erreur lors de l'export PDF");
    }
  };

  return (
    <Button onClick={handleExportPDF} variant="outline" size="sm">
      <Download className="w-4 h-4 mr-2" />
      {label}
    </Button>
  );
};
