import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import html2pdf from "html2pdf.js";

interface ExportPDFButtonProps {
  chapterTitle: string;
  content: string;
}

export const ExportPDFButton = ({ chapterTitle, content }: ExportPDFButtonProps) => {
  const handleExportPDF = async () => {
    try {
      toast.info("Génération du PDF en cours...");

      const element = document.createElement('div');
      element.innerHTML = `
        <div style="padding: 40px; font-family: Arial, sans-serif;">
          <div style="border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="font-size: 28px; font-weight: bold; text-align: center; margin: 0;">${chapterTitle}</h1>
          </div>
          <div style="line-height: 1.6; color: #333;">
            ${content}
          </div>
        </div>
      `;

      const opt = {
        margin: 10,
        filename: `${chapterTitle.replace(/[^a-z0-9]/gi, '_')}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      };

      await html2pdf().set(opt).from(element).save();
      
      toast.success("PDF exporté avec succès!");
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error("Erreur lors de l'export PDF");
    }
  };

  return (
    <Button onClick={handleExportPDF} variant="outline" size="sm">
      <Download className="w-4 h-4 mr-2" />
      Exporter en PDF
    </Button>
  );
};
