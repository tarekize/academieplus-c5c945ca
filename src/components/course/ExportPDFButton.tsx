import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface ExportPDFButtonProps {
  chapterTitle: string;
  content: string;
}

export const ExportPDFButton = ({ chapterTitle, content }: ExportPDFButtonProps) => {
  const handleExportPDF = () => {
    try {
      toast.info("PrÃ©paration du PDF...");

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error("Veuillez autoriser les pop-ups pour exporter en PDF");
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${chapterTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            h1 { font-size: 28px; font-weight: bold; text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .content { line-height: 1.6; }
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

      toast.success("PDF prÃªt Ã  l'impression !");
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
