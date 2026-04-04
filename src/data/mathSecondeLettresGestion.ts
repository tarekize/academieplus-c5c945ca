// Mathématiques - Seconde - Filières Lettres & Gestion

export interface Lesson {
  id: string;
  title: string;
  titleAr: string;
  completed?: boolean;
}

export interface Chapter {
  id: string;
  title: string;
  titleAr: string;
  lessons: Lesson[];
  completed?: boolean;
}

export const mathSecondeLettresGestionChapters: Chapter[] = [
  {
    id: "chap-1-pourcentages-indicateurs",
    title: "Pourcentages et indicateurs",
    titleAr: "Ø§Ù„Ù†Ø³Ø¨ Ø§Ù„Ù…Ø¦ÙˆÙŠØ© ÙˆØ§Ù„Ù…Ø¤Ø´Ø±Ø§Øª",
    lessons: [
      { id: "lesson-1-1", title: "Rapport d'une partie Ã  un tout", titleAr: "Ù†Ø³Ø¨Ø© Ø§Ù„Ø¬Ø²Ø¡ Ø¥ÙÙ„Ù‰ Ø§Ù„ÙƒÙ„Ù‘" },
      { id: "lesson-1-2", title: "Pourcentage d'un autre pourcentage", titleAr: "Ø§Ù„Ù†Ø³Ø¨Ø© Ø§Ù„Ù…Ø¦ÙˆÙŠØ© Ù„Ù†Ø³Ø¨Ø© Ù…Ø¦ÙˆÙŠØ© Ø£Ø®Ø±Ù‰" },
      { id: "lesson-1-3", title: "Évolutions et pourcentages", titleAr: "Ø§Ù„ØªØ·ÙˆØ±Ø§Øª ÙˆØ§Ù„Ù†Ø³Ø¨ Ø§Ù„Ù…Ø¦ÙˆÙŠØ©" },
      { id: "lesson-1-4", title: "Indicateurs", titleAr: "Ø§Ù„Ù…Ø¤Ø´Ø±Ø§Øª" },
    ],
  },
  {
    id: "chap-2-statistiques",
    title: "Statistiques",
    titleAr: "Ø§Ù„Ø¥ÙØ­ØµØ§Ø¡",
    lessons: [
      { id: "lesson-2-1", title: "Séries chronologiques", titleAr: "Ø§Ù„Ø³Ù„Ø§Ø³Ù„ Ø§Ù„Ø²Ù…Ù†ÙŠØ©" },
      { id: "lesson-2-2", title: "Lissage par moyennes mobiles", titleAr: "Ø§Ù„ØªÙ…Ù„ÙŠØ³ Ø¨Ø§Ù„Ø£ÙˆØ³Ø§Ø· Ø§Ù„Ù…ØªØ­Ø±ÙƒØ©" },
      { id: "lesson-2-3", title: "Histogrammes", titleAr: "Ø§Ù„Ù…Ø¯Ø±Ø¬Ø§Øª Ø§Ù„ØªÙƒØ±Ø§Ø±ÙŠØ©" },
      { id: "lesson-2-4", title: "Variance et écart-type", titleAr: "Ø§Ù„ØªØ¨Ø§ÙŠÙ†-Ø§Ù„Ø¥Ù†Ø­Ø±Ø§Ù Ø§Ù„Ù…Ø¹ÙŠØ§Ø±ÙŠ" },
      { id: "lesson-2-5", title: "Quartiles, déciles et diagramme en boîte", titleAr: "Ø§Ù„Ø±Ø¨Ø¹ÙŠØ§Øª ÙˆØ§Ù„Ø¹Ø´Ø±ÙŠØ§Øª-Ø§Ù„Ù…Ø®Ø·Ø· Ø¨Ø§Ù„Ø¹Ù„Ø¨Ø©" },
      { id: "lesson-2-6", title: "Expérience aléatoire et simulation", titleAr: "Ø§Ù„ØªØ¬Ø±Ø¨Ø© Ø§Ù„Ø¹Ø´ÙˆØ§Ø¦ÙŠØ© - Ø§Ù„Ù…Ø­Ø§ÙƒØ§Ø©" },
    ],
  },
  {
    id: "chap-3-generalites-fonctions",
    title: "Généralités sur les fonctions",
    titleAr: "Ø¹Ù…ÙˆÙ…ÙŠØ§Øª Ø¹Ù„Ù‰ Ø§Ù„Ø¯ÙˆØ§Ù„",
    lessons: [
      { id: "lesson-3-1", title: "Fonction 'cube'", titleAr: "Ø§Ù„Ø¯Ø§Ù„Ø© ((Ù…ÙƒØ¹Ø¨))" },
      { id: "lesson-3-2", title: "Opérations sur les fonctions", titleAr: "Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª Ø¹Ù„Ù‰ Ø§Ù„Ø¯ÙˆØ§Ù„" },
      { id: "lesson-3-3", title: "Courbes et transformations de points simples", titleAr: "Ø§Ù„Ù…Ù†Ø­Ù†ÙŠØ§Øª ÙˆØ§Ù„ØªØ­ÙˆÙŠÙ„Ø§Øª Ø§Ù„Ù†Ù‚Ø·ÙŠØ© Ø§Ù„Ø¨Ø³ÙŠØ·Ø©" },
      { id: "lesson-3-4", title: "Éléments de symétrie des courbes", titleAr: "Ø¹Ù†Ø§ØµØ± ØªÙ†Ø§Ø¸Ø± Ù…Ù†Ø­Ù†ÙŠØ§Øª" },
    ],
  },
  {
    id: "chap-4-equations-inequations",
    title: "Équations et inéquations",
    titleAr: "Ø§Ù„Ù…Ø¹Ø§Ø¯Ù„Ø§Øª ÙˆØ§Ù„Ù…ØªØ±Ø§Ø¬Ø­Ø§Øª",
    lessons: [
        { id: "lesson-4-1", title: "Trinôme du second degré", titleAr: "Ø«Ù„Ø§Ø«ÙŠ Ø§Ù„Ø­Ø¯ÙˆØ¯ Ù…Ù† Ø§Ù„Ø¯Ø±Ø¬Ø© Ø§Ù„Ø«Ø§Ù†ÙŠØ©" },
        { id: "lesson-4-2", title: "Équations du second degré", titleAr: "Ø§Ù„Ù…Ø¹Ø§Ø¯Ù„Ø§Øª Ù…Ù† Ø§Ù„Ø¯Ø±Ø¬Ø© Ø§Ù„Ø«Ø§Ù†ÙŠØ©" },
        { id: "lesson-4-3", title: "Inéquations du second degré", titleAr: "Ø§Ù„Ù…ØªØ±Ø§Ø¬Ø­Ø§Øª Ù…Ù† Ø§Ù„Ø¯Ø±Ø¬Ø© Ø§Ù„Ø«Ø§Ù†ÙŠØ©" },
        { id: "lesson-4-4", title: "Résolution graphique d'équations et d'inéquations du second degré", titleAr: "Ø­Ù„Ù‘ Ù…Ø¹Ø§Ø¯Ù„Ø§Øª ÙˆÙ…ØªØ±Ø§Ø¬Ø­Ø§Øª Ù…Ù† Ø§Ù„Ø¯Ø±Ø¬Ø© Ø§Ù„Ø«Ø§Ù†ÙŠØ© Ø¨ÙŠØ§Ù†ÙŠÙ‘Ø§" },
    ],
  },
  {
    id: "chap-5-derivation",
    title: "Dérivation",
    titleAr: "Ø§Ù„Ø¥ÙØ´ØªÙ‚Ø§Ù‚",
    lessons: [
      { id: "lesson-5-1", title: "Nombre dérivé", titleAr: "Ø§Ù„Ø¹Ø¯Ø¯ Ø§Ù„Ù…Ø´ØªÙ‚" },
      { id: "lesson-5-2", title: "Équation de la tangente", titleAr: "Ù…Ø¹Ø§Ø¯Ù„Ø© Ø§Ù„Ù…Ù…Ø§Ø³ Ù„Ù…Ù†Ø­Ù† Ø¹Ù†Ø¯ Ù†Ù‚Ø·Ø©" },
      { id: "lesson-5-3", title: "Fonctions dérivées", titleAr: "Ø§Ù„Ø¯ÙˆØ§Ù„ Ø§Ù„Ù…Ø´ØªÙ‚Ø©" },
      { id: "lesson-5-4", title: "Opérations sur les fonctions dérivées", titleAr: "Ø¹Ù…Ù„ÙŠØ§Øª Ø¹Ù„Ù‰ Ø§Ù„Ø¯ÙˆØ§Ù„ Ø§Ù„Ù…Ø´ØªÙ‚Ø©" },
      { id: "lesson-5-5", title: "Fonction dérivée et sens de variation", titleAr: "Ø§Ù„Ø¯Ø§Ù„Ø© Ø§Ù„Ù…Ø´ØªÙ‚Ø© ÙˆØ¥ØªØ¬Ø§Ù‡ Ø§Ù„ØªØºÙŠØ±" },
      { id: "lesson-5-6", title: "Extremums d'une fonction", titleAr: "Ø§Ù„Ù‚ÙŠÙ… Ø§Ù„Ø­Ø¯ÙŠØ© Ù„Ø¯Ø§Ù„Ø©" },
      { id: "lesson-5-7", title: "Approximation affine tangente", titleAr: "Ø§Ù„ØªÙ‚Ø±ÙŠØ¨ Ø§Ù„ØªØ¢Ù„ÙÙŠ Ø§Ù„Ù…Ù…Ø§Ø³ÙŠ Ù„Ø¯Ø§Ù„Ø©" },
    ],
  },
  {
    id: "chap-6-comportement-asymptotique",
    title: "Comportement asymptotique",
    titleAr: "Ø§Ù„Ø³Ù„ÙˆÙƒ Ø§Ù„ØªÙ‚Ø§Ø±Ø¨ÙŠ",
    lessons: [
      { id: "lesson-6-1", title: "Limites de fonctions usuelles", titleAr: "Ù†Ù‡Ø§ÙŠØ§Øª Ø¯ÙˆØ§Ù„ Ù…Ø£Ù„ÙˆÙØ©" },
      { id: "lesson-6-2", title: "Opérations sur les limites", titleAr: "Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª Ø¹Ù„Ù‰ Ø§Ù„Ù†Ù‡Ø§ÙŠØ§Øª" },
      { id: "lesson-6-3", title: "Asymptotes", titleAr: "Ø§Ù„Ù…Ø³ØªÙ‚ÙŠÙ…Ø§Øª Ø§Ù„Ù…Ù‚Ø§Ø±Ø¨Ø©" },
    ],
  },
  {
    id: "chap-7-suites-numeriques",
    title: "Suites numériques",
    titleAr: "Ø§Ù„Ù…ØªØªØ§Ù„ÙŠØ§Øª Ø§Ù„Ø¹Ø¯Ø¯ÙŠØ©",
    lessons: [
      { id: "lesson-7-1", title: "Généralités", titleAr: "Ø¹Ù…ÙˆÙ…ÙŠØ§Øª" },
      { id: "lesson-7-2", title: "Suites arithmétiques", titleAr: "Ø§Ù„Ù…ØªØªØ§Ù„ÙŠØ§Øª Ø§Ù„Ø­Ø³Ø§Ø¨ÙŠØ©" },
      { id: "lesson-7-3", title: "Suites géométriques", titleAr: "Ø§Ù„Ù…ØªØªØ§Ù„ÙŠØ§Øª Ø§Ø§Ù„Ù‡Ù†Ø¯Ø³ÙŠØ©" },
    ],
  },
  {
    id: "chap-8-systemes-lineaires",
    title: "Systèmes linéaires",
    titleAr: "Ø§Ù„Ø¬Ù…Ù„ Ø§Ù„Ø®Ø·ÙŠØ©",
    lessons: [
      { id: "lesson-8-1", title: "Équations linéaires Ã  deux inconnues", titleAr: "Ø§Ù„Ù…Ø¹Ø§Ø¯Ù„Ø§Øª Ø§Ù„Ø®Ø·ÙŠØ© Ù„Ù…Ø¬Ù‡ÙˆÙ„ÙŠÙ†" },
      { id: "lesson-8-2", title: "Systèmes de deux équations linéaires Ã  deux inconnues", titleAr: "Ø¬Ù…Ù„ Ù…Ø¹Ø§Ø¯Ù„ØªÙŠÙ† Ø®Ø·ÙŠØªÙŠÙ† Ù„Ù…Ø¬Ù‡ÙˆÙ„ÙŠÙ†" },
      { id: "lesson-8-3", title: "Systèmes de trois équations linéaires Ã  trois inconnues", titleAr: "Ø¬Ù…Ù„ Ø«Ù„Ø§Ø« Ù…Ø¹Ø§Ø¯Ù„Ø§Øª Ø®Ø·ÙŠØ© Ù„Ø«Ù„Ø§Ø«Ø© Ù…Ø¬Ø§Ù‡ÙŠÙ„" },
      { id: "lesson-8-4", title: "Inéquations linéaires Ã  deux inconnues", titleAr: "Ø§Ù„Ù…ØªØ±Ø§Ø¬Ø­Ø§Øª Ø§Ù„Ø®Ø·ÙŠØ© Ù„Ù…Ø¬Ù‡ÙˆÙ„ÙŠÙ†" },
    ],
  },
  {
    id: "chap-9-probabilites",
    title: "Probabilités",
    titleAr: "Ø§Ù„Ø¥Ø­ØªÙ…Ø§Ù„Ø§Øª",
    lessons: [
      { id: "lesson-9-1", title: "Vocabulaire des probabilités", titleAr: "Ù…ÙØ±Ø¯Ø§Øª Ø§Ù„Ø¥Ø­ØªÙ…Ø§Ù„Ø§Øª" },
      { id: "lesson-9-2", title: "Probabilités", titleAr: "Ø§Ù„Ø§Ø­ØªÙ…Ø§Ù„Ø§Øª" },
    ],
  },
];
