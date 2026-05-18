import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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

const esc = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

function buildHtml(data: ParentReportData, generatedAt: string): string {
  const chapterRow = (c: ChapterStat) => `
    <tr>
      <td style="padding:8px 10px;border-bottom:1px solid #eee;font-size:12px;">${esc(c.chapter_title)}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #eee;font-size:12px;text-align:center;">${c.level}/100</td>
      <td style="padding:8px 10px;border-bottom:1px solid #eee;font-size:12px;text-align:center;">${c.accuracy}%</td>
      <td style="padding:8px 10px;border-bottom:1px solid #eee;font-size:12px;text-align:center;">${c.total_answers}</td>
    </tr>`;

  const chapterListItem = (c: ChapterStat) => `
    <li style="margin:6px 0;font-size:12px;line-height:1.5;">
      <strong>${esc(c.chapter_title)}</strong>
      — niveau ${c.level}/100 — réussite ${c.accuracy}%
    </li>`;

  return `
  <div style="width:780px;padding:32px;font-family:-apple-system,'Segoe UI',Roboto,'Noto Sans Arabic','Arial',sans-serif;color:#1a1a1a;background:#fff;">
    <div style="background:linear-gradient(135deg,#2563eb,#1e40af);color:#fff;padding:24px 28px;border-radius:14px;margin-bottom:24px;">
      <div style="font-size:22px;font-weight:700;">Rapport de progression</div>
      <div style="font-size:13px;margin-top:6px;opacity:.9;">AcadémiePlus — généré le ${fmtDate(generatedAt)}</div>
    </div>

    <div style="margin-bottom:22px;">
      <div style="font-size:16px;font-weight:700;">Élève : ${esc(data.child_name)}</div>
      <div style="font-size:12px;color:#666;margin-top:4px;">Niveau scolaire : ${esc(data.school_level || "—")}</div>
      <div style="font-size:12px;color:#666;margin-top:2px;">Période : ${fmtDate(data.period_start)} → ${fmtDate(data.period_end)}</div>
    </div>

    <div style="font-size:14px;font-weight:700;margin-bottom:10px;">Indicateurs clés</div>
    <div style="display:flex;gap:14px;margin-bottom:22px;">
      <div style="flex:1;background:#f3f6fb;border:1px solid #e3e8f0;border-radius:10px;padding:16px;">
        <div style="font-size:11px;color:#666;">Taux de réussite global</div>
        <div style="font-size:26px;font-weight:800;color:#2563eb;margin-top:6px;">${data.global_success_rate}%</div>
      </div>
      <div style="flex:1;background:#f3f6fb;border:1px solid #e3e8f0;border-radius:10px;padding:16px;">
        <div style="font-size:11px;color:#666;">Niveau moyen</div>
        <div style="font-size:26px;font-weight:800;color:#2563eb;margin-top:6px;">${data.global_level}/100</div>
      </div>
    </div>

    <div style="font-size:14px;font-weight:700;margin-bottom:8px;">Résumé</div>
    <div style="font-size:12px;line-height:1.6;margin-bottom:22px;color:#333;">${esc(data.summary)}</div>

    <div style="font-size:14px;font-weight:700;color:#107a57;margin-bottom:8px;">Chapitres forts</div>
    ${
      data.strong_chapters.length === 0
        ? `<div style="font-size:12px;color:#999;margin-bottom:18px;">Aucun.</div>`
        : `<ul style="margin:0 0 18px 18px;padding:0;">${data.strong_chapters.map(chapterListItem).join("")}</ul>`
    }

    <div style="font-size:14px;font-weight:700;color:#c8503c;margin-bottom:8px;">Chapitres à renforcer</div>
    ${
      data.weak_chapters.length === 0
        ? `<div style="font-size:12px;color:#999;margin-bottom:18px;">Aucun.</div>`
        : `<ul style="margin:0 0 18px 18px;padding:0;">${data.weak_chapters.map(chapterListItem).join("")}</ul>`
    }

    ${
      data.chapters.length > 0
        ? `
      <div style="font-size:14px;font-weight:700;margin:18px 0 8px;">Détail par chapitre</div>
      <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #eee;border-radius:8px;overflow:hidden;">
        <thead>
          <tr style="background:#f5f5f5;">
            <th style="padding:9px 10px;text-align:left;font-size:11px;color:#555;font-weight:600;">Chapitre</th>
            <th style="padding:9px 10px;text-align:center;font-size:11px;color:#555;font-weight:600;width:90px;">Niveau</th>
            <th style="padding:9px 10px;text-align:center;font-size:11px;color:#555;font-weight:600;width:90px;">Réussite</th>
            <th style="padding:9px 10px;text-align:center;font-size:11px;color:#555;font-weight:600;width:90px;">Réponses</th>
          </tr>
        </thead>
        <tbody>${data.chapters.map(chapterRow).join("")}</tbody>
      </table>`
        : ""
    }

    <div style="font-size:14px;font-weight:700;margin:22px 0 8px;">Recommandations IA</div>
    <div style="font-size:12px;line-height:1.6;color:#333;white-space:pre-wrap;">${esc(data.recommendations)}</div>

    <div style="margin-top:30px;text-align:center;font-size:10px;color:#999;border-top:1px solid #eee;padding-top:10px;">
      AcadémiePlus — Rapport parent
    </div>
  </div>`;
}

export async function downloadParentReportPdf(
  data: ParentReportData,
  generatedAt: string,
) {
  // Build off-screen container
  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "-10000px";
  wrapper.style.top = "0";
  wrapper.style.zIndex = "-1";
  wrapper.innerHTML = buildHtml(data, generatedAt);
  document.body.appendChild(wrapper);

  try {
    const node = wrapper.firstElementChild as HTMLElement;
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

    const imgData = canvas.toDataURL("image/png");

    if (imgH <= pageH - margin * 2) {
      pdf.addImage(imgData, "PNG", margin, margin, imgW, imgH);
    } else {
      // Slice canvas into pages
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
        ctx.drawImage(
          canvas,
          0, renderedY, canvas.width, sliceH,
          0, 0, canvas.width, sliceH,
        );
        const sliceImg = slice.toDataURL("image/png");
        const sliceImgH = (sliceH * imgW) / canvas.width;
        if (pageIndex > 0) pdf.addPage();
        pdf.addImage(sliceImg, "PNG", margin, margin, imgW, sliceImgH);
        renderedY += sliceH;
        pageIndex += 1;
      }
    }

    // Footer page numbers
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(140, 140, 140);
      pdf.text(
        `AcademiePlus — Rapport parent  |  Page ${i} / ${pageCount}`,
        pageW / 2,
        pageH - 12,
        { align: "center" },
      );
    }

    const safeName = data.child_name.replace(/[^\p{L}\p{N}_-]+/gu, "_");
    pdf.save(`rapport_${safeName}_${fmtDate(generatedAt).replace(/\//g, "-")}.pdf`);
  } finally {
    document.body.removeChild(wrapper);
  }
}
