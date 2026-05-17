import jsPDF from "jspdf";

interface ChapterStat {
  chapter_title: string;
  level: number;
  accuracy: number;
  total_answers: number;
}

export interface ParentReportData {
  child_name: string;
  school_level?: string | null;
  period_start: string;
  period_end: string;
  global_success_rate: number;
  global_level: number;
  chapters: ChapterStat[];
  strong_chapters: ChapterStat[];
  weak_chapters: ChapterStat[];
  recommendations: string;
  summary: string;
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export function downloadParentReportPdf(data: ParentReportData, generatedAt: string) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  let y = margin;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const contentW = pageW - margin * 2;

  const ensureSpace = (h: number) => {
    if (y + h > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // Header
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageW, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Rapport de progression", margin, 35);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`AcademiePlus — genere le ${fmtDate(generatedAt)}`, margin, 55);

  y = 100;
  doc.setTextColor(20, 20, 20);

  // Student info
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`Eleve : ${data.child_name}`, margin, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text(`Niveau scolaire : ${data.school_level || "—"}`, margin, y);
  y += 14;
  doc.text(
    `Periode : ${fmtDate(data.period_start)} → ${fmtDate(data.period_end)}`,
    margin,
    y,
  );
  y += 24;

  // Key metrics
  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Indicateurs cles", margin, y);
  y += 12;

  const boxW = (contentW - 20) / 2;
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(245, 247, 251);
  doc.roundedRect(margin, y, boxW, 60, 6, 6, "FD");
  doc.roundedRect(margin + boxW + 20, y, boxW, 60, 6, 6, "FD");

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text("Taux de reussite global", margin + 12, y + 20);
  doc.text("Niveau moyen", margin + boxW + 32, y + 20);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(37, 99, 235);
  doc.text(`${data.global_success_rate}%`, margin + 12, y + 45);
  doc.text(`${data.global_level}/100`, margin + boxW + 32, y + 45);

  y += 80;
  doc.setTextColor(20, 20, 20);

  // Summary
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Resume", margin, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const lines = doc.splitTextToSize(data.summary, contentW);
  ensureSpace(lines.length * 12 + 10);
  doc.text(lines, margin, y);
  y += lines.length * 12 + 14;

  const drawChapterList = (
    title: string,
    items: ChapterStat[],
    color: [number, number, number],
  ) => {
    ensureSpace(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...color);
    doc.text(title, margin, y);
    y += 16;
    doc.setTextColor(20, 20, 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    if (items.length === 0) {
      doc.setTextColor(140, 140, 140);
      doc.text("Aucun.", margin, y);
      y += 14;
      doc.setTextColor(20, 20, 20);
      return;
    }
    items.forEach((c) => {
      ensureSpace(16);
      const t = `• ${c.chapter_title}  —  niveau ${c.level}/100  —  reussite ${c.accuracy}%`;
      const wrapped = doc.splitTextToSize(t, contentW);
      doc.text(wrapped, margin, y);
      y += wrapped.length * 12 + 2;
    });
    y += 8;
  };

  drawChapterList("Chapitres forts", data.strong_chapters, [16, 122, 87]);
  drawChapterList("Chapitres a renforcer", data.weak_chapters, [200, 80, 60]);

  // All chapters table
  if (data.chapters.length > 0) {
    ensureSpace(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Detail par chapitre", margin, y);
    y += 14;

    // header
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y, contentW, 18, "F");
    doc.setFontSize(9);
    doc.text("Chapitre", margin + 8, y + 12);
    doc.text("Niveau", margin + contentW - 180, y + 12);
    doc.text("Reussite", margin + contentW - 120, y + 12);
    doc.text("Reponses", margin + contentW - 60, y + 12);
    y += 18;
    doc.setFont("helvetica", "normal");
    data.chapters.forEach((c, i) => {
      ensureSpace(18);
      if (i % 2 === 1) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, y, contentW, 18, "F");
      }
      const title = doc.splitTextToSize(c.chapter_title, contentW - 200)[0];
      doc.text(title, margin + 8, y + 12);
      doc.text(`${c.level}/100`, margin + contentW - 180, y + 12);
      doc.text(`${c.accuracy}%`, margin + contentW - 120, y + 12);
      doc.text(`${c.total_answers}`, margin + contentW - 60, y + 12);
      y += 18;
    });
    y += 12;
  }

  // Recommendations
  ensureSpace(40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Recommandations IA", margin, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const rec = doc.splitTextToSize(data.recommendations, contentW);
  ensureSpace(rec.length * 12);
  doc.text(rec, margin, y);

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(
      `AcademiePlus — Rapport parent  |  Page ${i} / ${pageCount}`,
      pageW / 2,
      pageH - 20,
      { align: "center" },
    );
  }

  const safeName = data.child_name.replace(/[^\p{L}\p{N}_-]+/gu, "_");
  doc.save(`rapport_${safeName}_${fmtDate(generatedAt).replace(/\//g, "-")}.pdf`);
}
