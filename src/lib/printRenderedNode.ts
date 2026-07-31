// html2canvas ne fait pas de véritable "text shaping" (formes contextuelles
// des lettres arabes selon leur position) : il redessine le texte lui-même
// sur un canvas, ce qui casse complètement l'arabe (lettres détachées,
// mal positionnées). La seule façon fiable d'obtenir un export identique à
// l'écran ET avec un texte arabe correct est de laisser le NAVIGATEUR faire
// le rendu (fenêtre d'impression), pas un canvas — on y copie donc le HTML
// déjà rendu (KaTeX déjà injecté dans le DOM), pas une reconstruction brute.
import katexCss from "katex/dist/katex.min.css?raw";

const ARABIC_CHARS_REGEX = /[؀-ۿ]/;

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function detectDir(node: HTMLElement): "rtl" | "ltr" {
  const explicit = node.closest("[dir]")?.getAttribute("dir");
  if (explicit === "rtl" || explicit === "ltr") return explicit;
  return ARABIC_CHARS_REGEX.test(node.innerText || node.textContent || "") ? "rtl" : "ltr";
}

/** Ouvre une fenêtre d'impression contenant une copie du HTML déjà rendu à
 * l'écran (donc avec les formules KaTeX déjà injectées) : rendu par le
 * navigateur lui-même, pas par un canvas, pour un texte arabe correct. */
export function printRenderedNode(node: HTMLElement, title: string): boolean {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return false;

  const dir = detectDir(node);
  const textAlign = dir === "rtl" ? "right" : "left";
  const safeTitle = escapeHtml(title);

  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="${dir}">
    <head>
      <title>${safeTitle}</title>
      <style>${katexCss}</style>
      <style>
        body { font-family: Arial, 'Segoe UI', Tahoma, sans-serif; padding: 40px; color: #222; direction: ${dir}; text-align: ${textAlign}; }
        h1.export-title { font-size: 24px; font-weight: bold; text-align: center; border-bottom: 2px solid #333; padding-bottom: 16px; margin-bottom: 24px; }
        h1, h2, h3 { text-align: ${textAlign}; }
        p { margin: 0.6em 0; line-height: 1.8; }
        hr { border: none; border-top: 1px solid #ddd; margin: 20px 0; }
        .lesson-block { border-radius: 8px; padding: 0.8em 1.1em; margin: 0.9em 0; border-${dir === "rtl" ? "right" : "left"}: 4px solid #999; background: #f7f7f8; }
        .lesson-block-title { font-weight: bold; margin-bottom: 0.4em; }
        .block-definition { border-color: #3b82f6; }
        .block-property { border-color: #10b981; }
        .block-remark { border-color: #f59e0b; }
        .block-example { border-color: #a855f7; }
        .block-graphic { border-color: #ec4899; }
        button, input, textarea { display: none !important; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <h1 class="export-title">${safeTitle}</h1>
      <div class="content">${node.innerHTML}</div>
      <script>window.onload = function() { window.print(); }<\/script>
    </body>
    </html>
  `);
  printWindow.document.close();
  return true;
}
