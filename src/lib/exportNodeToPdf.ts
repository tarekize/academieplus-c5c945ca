import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/** Capture le rendu réel d'un nœud DOM déjà affiché (donc avec le LaTeX déjà
 * rendu par KaTeX, les styles/couleurs, la direction RTL/LTR...) et le
 * convertit en PDF paginé — même logique que parentReportPdf.ts, généralisée
 * pour être réutilisée par les exports leçon/exercices/examen : contrairement
 * à un export basé sur une chaîne HTML reconstruite à la main, on obtient un
 * PDF visuellement identique à ce que l'utilisateur voit dans l'application. */
export async function exportNodeToPdf(node: HTMLElement, fileName: string): Promise<void> {
  const canvas = await html2canvas(node, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
  });

  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 24;
  const imgW = pageW - margin * 2;
  const imgH = (canvas.height * imgW) / canvas.width;

  if (imgH <= pageH - margin * 2) {
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", margin, margin, imgW, imgH);
  } else {
    const pageContentH = pageH - margin * 2;
    const pxPerPage = (pageContentH * canvas.width) / imgW;
    let renderedY = 0;
    let pageIndex = 0;
    while (renderedY < canvas.height) {
      const sliceH = Math.min(pxPerPage, canvas.height - renderedY);
      const slice = document.createElement("canvas");
      slice.width = canvas.width;
      slice.height = sliceH;
      const ctx = slice.getContext("2d");
      if (!ctx) break;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, slice.width, slice.height);
      ctx.drawImage(canvas, 0, renderedY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
      const sliceImgH = (sliceH * imgW) / canvas.width;
      if (pageIndex > 0) pdf.addPage();
      pdf.addImage(slice.toDataURL("image/png"), "PNG", margin, margin, imgW, sliceImgH);
      renderedY += sliceH;
      pageIndex += 1;
    }
  }

  pdf.save(fileName);
}

export function sanitizeFileName(title: string): string {
  return (title || "document").trim().replace(/[^\p{L}\p{N}_-]+/gu, "_").slice(0, 80) || "document";
}
