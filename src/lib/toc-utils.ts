// Ajoute un id (h1/h2/h3 -> "toc-<index>-<texte>") à chaque titre du HTML de
// leçon, pour permettre les ancres du sommaire (table des matières) affiché à
// côté du contenu. Ne fait que réécrire le HTML déjà présent (parse/serialize
// via DOMParser) — n'introduit ni n'exécute aucun script, mais suppose que
// `html` a déjà été sanitizé en amont (sanitizeLessonHtml) si sa provenance
// n'est pas fiable.
export function injectHeaderIds(html: string): string {
    if (!html) return '';

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const headings = doc.querySelectorAll('h1, h2, h3');

    headings.forEach((heading, index) => {
        const text = heading.textContent || '';
        const id = `toc-${index}-${text.toLowerCase().replace(/[^\w]/g, "-")}`;
        heading.id = id;
    });

    return doc.body.innerHTML;
}
