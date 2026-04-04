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
