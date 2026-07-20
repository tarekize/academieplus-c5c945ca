import { defaultSchema } from "rehype-sanitize";

// defaultSchema (GitHub-flavored) est déjà sans script/iframe/event handlers ;
// on l'étend seulement pour les classes utilisées par nos blocs pédagogiques
// (::: definition, ::: example...) et pour les schémas SVG générés par l'IA.
// Volontairement PAS de <use>/<image>/<a> dans les tags SVG ajoutés : ce sont
// les seuls vecteurs XSS classiques du SVG (href/xlink:href → javascript:).
export const lessonSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    div: [...(defaultSchema.attributes?.div || []), "className", "dir"],
    span: [...(defaultSchema.attributes?.span || []), "className"],
    "*": [
      ...(defaultSchema.attributes?.["*"] || []),
      "className",
      "viewBox", "width", "height", "d", "cx", "cy", "r", "rx", "ry",
      "x", "y", "x1", "y1", "x2", "y2", "points", "fill", "stroke",
      "strokeWidth", "strokeDasharray", "transform", "fontSize", "textAnchor",
    ],
  },
  tagNames: [
    ...(defaultSchema.tagNames || []),
    "svg", "path", "circle", "line", "rect", "text", "polygon", "polyline",
    "g", "defs", "marker", "ellipse", "tspan",
  ],
};

/**
 * Remplace les blocs pédagogiques ::: type \n content ::: par du HTML
 * (définition / théorème / remarque / exemple / schéma). À appliquer aussi
 * bien pour le contenu Markdown pur que pour le contenu détecté comme HTML :
 * une leçon enrichie par IA est souvent une enveloppe HTML
 * (<div dir="rtl">...) qui contient malgré tout ces blocs ::: à l'intérieur.
 * Le ::: de fermeture n'est pas toujours sur sa propre ligne (le contenu
 * généré par IA le colle parfois à la fin de la dernière phrase), donc on
 * ne l'exige pas précédé d'un saut de ligne. On tolère aussi un peu
 * d'espace ou des marques bidi invisibles (souvent injectées par l'IA dans
 * du texte arabe) avant le ::: d'ouverture.
 * Le titre est émis en HTML (<strong>) plutôt qu'en **gras** Markdown : ce
 * dernier ne serait jamais converti là où le contenu est rendu directement
 * (dangerouslySetInnerHTML / contentEditable, sans passage par ReactMarkdown).
 */
export function convertPedagoBlocks(raw: string): string {
  let s = (raw || "").replace(
    /^[ \t\u200e\u200f\u202a-\u202e]*:::\s*([a-zA-Z0-9_-]+)(.*?)\n([\s\S]*?):::/gm,
    (match, type, titleRaw, content) => {
      let blockClass = "lesson-block";
      const typeLower = type.toLowerCase();
      if (typeLower === "definition") blockClass += " block-definition";
      else if (["theorem", "proposition", "property"].includes(typeLower)) blockClass += " block-property";
      else if (typeLower === "remark") blockClass += " block-remark";
      else if (["example", "exercise", "solution"].includes(typeLower)) blockClass += " block-example";
      else blockClass += " block-graphic";

      let innerContent = content.trim();
      let titleHtml = "";

      // Si un titre est spécifié juste après ::: type (rare, mais possible)
      let titleText = titleRaw.trim();

      // Si la première ligne est en gras it identifies the title (ex: **تعريف X.Y**)
      const titleMatch = innerContent.match(/^\*\*(.*?)\*\*(?:\n|$)/);
      if (titleMatch) {
        titleText = titleMatch[1];
        innerContent = innerContent.slice(titleMatch[0].length).trim();
      }

      if (titleText) {
        titleHtml = `<div class="lesson-block-title"><strong>${titleText}</strong></div>`;
      }

      // On doit ajouter un saut de ligne \n\n après les balises div pour que le Markdown à l'intérieur soit bien rendu par ReactMarkdown
      return `\n<div class="${blockClass}">\n${titleHtml}\n<div class="lesson-block-content">\n\n${innerContent}\n\n</div>\n</div>\n`;
    }
  );

  // Filet de sécurité : certaines leçons ont été converties en HTML avant
  // l'existence du format :::, ce qui encapsule chaque ligne dans son
  // propre <p>/<li> et fragmente la syntaxe ::: type ... ::: sur plusieurs
  // balises (ex: "<p>::: remark\n<strong>titre</strong></p>" puis le
  // contenu dans des balises suivantes, fermeture "...:::</li>" imbriquée
  // dans une liste). Impossible à reconstituer en encadré fiable dans ce
  // cas — mais on retire au moins les marqueurs bruts restants pour ne
  // jamais les afficher à l'élève : "::: type" isolé disparaît (le titre en
  // gras qui suit reste visible), et les ::: de fermeture orphelins aussi.
  if (s.includes(":::")) {
    s = s
      .replace(/:::\s*[a-zA-Z0-9_-]+\s*\n?/g, "")
      .replace(/:::/g, "");
  }

  return s;
}
