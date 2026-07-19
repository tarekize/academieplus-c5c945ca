import DOMPurify from "dompurify";

// Contenu de leçon potentiellement dangereux : généré par IA (prompt injection
// possible) ou saisi par un enseignant (compte compromis ou malveillant
// possible). Rendu dans le navigateur de chaque élève/parent qui consulte la
// leçon -> XSS stocké si non filtré. Les leçons intègrent légitimement des
// schémas SVG inline, d'où le profil svg en plus de html. La config est
// passée à chaque appel plutôt que via setConfig() global, pour ne pas
// affecter d'autres usages de DOMPurify dans le bundle (ex: jspdf).
export function sanitizeLessonHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty || "", {
    USE_PROFILES: { html: true, svg: true, svgFilters: true },
    FORBID_TAGS: ["iframe", "object", "embed", "form", "input", "button"],
    FORBID_ATTR: ["srcdoc"],
  });
}
