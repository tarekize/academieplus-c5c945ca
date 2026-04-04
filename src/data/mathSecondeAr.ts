// Programme de Mathématiques - Seconde (Sciences, Math techniques, Mathématiques)
// Curriculum structuré en 7 chapitres - Version Arabe

export interface Lesson {
  id: string;
  title: string;
  titleAr: string;
}

export interface Chapter {
  id: string;
  title: string;
  titleAr: string;
  lessons: Lesson[];
}

export const mathSecondeChaptersAr: Chapter[] = [
  {
    id: "chap-1-fonctions-numeriques",
    title: "Les fonctions numériques",
    titleAr: "Ø§Ù„Ø¯ÙˆØ§Ù„ Ø§Ù„Ø¹Ø¯Ø¯ÙŠØ©",
    lessons: [
      {
        id: "lesson-1-1",
        title: "Rappels sur les fonctions",
        titleAr: "ØªØ°ÙƒÙŠØ± Ø­ÙˆÙ„ Ø§Ù„Ø¯ÙˆØ§Ù„",
      },
      {
        id: "lesson-1-2",
        title: "Les fonctions de référence",
        titleAr: "Ø§Ù„Ø¯ÙˆØ§Ù„ Ø§Ù„Ù…Ø±Ø¬Ø¹ÙŠØ©",
      },
      {
        id: "lesson-1-3",
        title: "Opérations sur les fonctions",
        titleAr: "Ø¹Ù…Ù„ÙŠØ§Øª Ø¹Ù„Ù‰ Ø§Ù„Ø¯ÙˆØ§Ù„",
      },
      {
        id: "lesson-1-4",
        title: "Sens de variation",
        titleAr: "Ø¥ØªØ¬Ø§Ù‡ Ø§Ù„ØªØºÙŠØ±",
      },
      {
        id: "lesson-1-5",
        title: "Représentation graphique",
        titleAr: "Ø§Ù„ØªÙ…Ø«ÙŠÙ„ Ø§Ù„Ø¨ÙŠØ§Ù†ÙŠ",
      },
    ],
  },
  {
    id: "chap-2-polynomes",
    title: "Les fonctions polynômes",
    titleAr: "Ø§Ù„Ø¯ÙˆØ§Ù„ ÙƒØ«ÙŠØ±Ø§Øª Ø§Ù„Ø­Ø¯ÙˆØ¯",
    lessons: [
      {
        id: "lesson-2-1",
        title: "Opérations sur les polynômes",
        titleAr: "Ø¹Ù…Ù„ÙŠØ§Øª Ø¹Ù„Ù‰ ÙƒØ«ÙŠØ±Ø§Øª Ø§Ù„Ø­Ø¯ÙˆØ¯",
      },
      {
        id: "lesson-2-2",
        title: "Équations du second degré",
        titleAr: "Ø§Ù„Ù…Ø¹Ø§Ø¯Ù„Ø§Øª Ù…Ù† Ø§Ù„Ø¯Ø±Ø¬Ø© Ø§Ù„Ø«Ø§Ù†ÙŠØ©",
      },
      {
        id: "lesson-2-3",
        title: "Inéquations du second degré",
        titleAr: "Ø§Ù„Ù…ØªØ±Ø§Ø¬Ø­Ø§Øª Ù…Ù† Ø§Ù„Ø¯Ø±Ø¬Ø© Ø§Ù„Ø«Ø§Ù†ÙŠØ©",
      },
    ],
  },
  {
    id: "chap-3-derivabilite",
    title: "La dérivabilité",
    titleAr: "Ø§Ù„Ø¥Ø´ØªÙ‚Ø§Ù‚ÙŠØ©",
    lessons: [
      {
        id: "lesson-3-1",
        title: "Le nombre dérivé",
        titleAr: "Ø§Ù„Ø¹Ø¯Ø¯ Ø§Ù„Ù…Ø´ØªÙ‚",
      },
      {
        id: "lesson-3-2",
        title: "Tangente Ã  une courbe en un point",
        titleAr: "Ù…Ù…Ø§Ø³ Ù„Ù…Ù†Ø­Ù† Ø¹Ù†Ø¯ Ù†Ù‚Ø·Ø©",
      },
      {
        id: "lesson-3-3",
        title: "Approximation affine d'une fonction",
        titleAr: "Ø§Ù„ØªÙ‚Ø±ÙŠØ¨ Ø§Ù„ØªØ¢Ù„ÙÙŠ Ù„Ø¯Ø§Ù„Ø©",
      },
      {
        id: "lesson-3-4",
        title: "La fonction dérivée d'une fonction",
        titleAr: "Ø§Ù„Ø¯Ø§Ù„Ø© Ø§Ù„Ù…Ø´ØªÙ‚Ø© Ù„Ø¯Ø§Ù„Ø©",
      },
      {
        id: "lesson-3-5",
        title: "Opérations sur les fonctions dérivées",
        titleAr: "Ø¹Ù…Ù„ÙŠØ§Øª Ø¹Ù„Ù‰ Ø§Ù„Ø¯ÙˆØ§Ù„ Ø§Ù„Ù…Ø´ØªÙ‚Ø©",
      },
    ],
  },
  {
    id: "chap-4-applications-derivabilite",
    title: "Applications de la dérivabilité",
    titleAr: "ØªØ·Ø¨ÙŠÙ‚Ø§Øª Ø§Ù„Ø¥Ø´ØªÙ‚Ø§Ù‚ÙŠØ©",
    lessons: [
      {
        id: "lesson-4-1",
        title: "Sens de variation d'une fonction",
        titleAr: "Ø§ØªØ¬Ø§Ù‡ ØªØºÙŠØ± Ø¯Ø§Ù„Ø©",
      },
      {
        id: "lesson-4-2",
        title: "Extremums locaux",
        titleAr: "Ø§Ù„Ù‚ÙŠÙ… Ø§Ù„Ø­Ø¯ÙŠØ© Ø§Ù„Ù…Ø­Ù„ÙŠØ©",
      },
      {
        id: "lesson-4-3",
        title: "Encadrement d'une fonction",
        titleAr: "Ø­ØµØ± Ø¯Ø§Ù„Ø©",
      },
      {
        id: "lesson-4-4",
        title: "Points remarquables",
        titleAr: "Ø§Ù„Ø¹Ù†Ø§ØµØ± Ø§Ù„Ø­Ø§Ø¯Ø©",
      },
    ],
  },
  {
    id: "chap-5-limites",
    title: "Les limites",
    titleAr: "Ø§Ù„Ù†Ù‡Ø§ÙŠØ§Øª",
    lessons: [
      {
        id: "lesson-5-1",
        title: "Limite infinie en un point réel",
        titleAr: "Ù†Ù‡Ø§ÙŠØ© ØºÙŠØ± Ù…Ù†ØªÙ‡ÙŠØ© Ø¹Ù†Ø¯ Ø¹Ø¯Ø¯ Ø­Ù‚ÙŠÙ‚ÙŠ",
      },
      {
        id: "lesson-5-2",
        title: "Limite finie Ã  l'infini",
        titleAr: "Ù†Ù‡Ø§ÙŠØ© Ù…Ù†ØªÙ‡ÙŠØ© Ø¹Ù†Ø¯ Ø§Ù„Ù…Ø§Ù„Ø§Ù†Ù‡Ø§ÙŠØ©",
      },
      {
        id: "lesson-5-3",
        title: "Notion de limite",
        titleAr: "Ù…ÙÙ‡ÙˆÙ… Ø§Ù„Ù†Ù‡Ø§ÙŠØ©",
      },
      {
        id: "lesson-5-4",
        title: "Opérations sur les limites",
        titleAr: "Ø¹Ù…Ù„ÙŠØ§Øª Ø¹Ù„Ù‰ Ø§Ù„Ù†Ù‡Ø§ÙŠØ§Øª",
      },
      {
        id: "lesson-5-5",
        title: "Asymptote oblique",
        titleAr: "Ø§Ù„Ù…Ø³ØªÙ‚ÙŠÙ… Ø§Ù„Ù…Ù‚Ø§Ø±Ø¨ Ø§Ù„Ù…Ø§Ø¦Ù„",
      },
      {
        id: "lesson-5-6",
        title: "Étude d'une fonction",
        titleAr: "Ø¯Ø±Ø§Ø³Ø© Ø¯Ø§Ù„Ø©",
      },
    ],
  },
  {
    id: "chap-6-suites",
    title: "Les suites numériques",
    titleAr: "Ø§Ù„Ù…ØªØªØ§Ù„ÙŠØ§Øª Ø§Ù„Ø¹Ø¯Ø¯ÙŠØ©",
    lessons: [
      {
        id: "lesson-6-1",
        title: "Les suites numériques",
        titleAr: "Ø§Ù„Ù…ØªØªØ§Ù„ÙŠØ§Øª Ø§Ù„Ø¹Ø¯Ø¯ÙŠØ©",
      },
      {
        id: "lesson-6-2",
        title: "Représentation graphique d'une suite",
        titleAr: "Ø§Ù„ØªÙ…Ø«ÙŠÙ„ Ø§Ù„Ø¨ÙŠØ§Ù†ÙŠ Ù„Ù…ØªØªØ§Ù„ÙŠØ© Ø¹Ø¯Ø¯ÙŠØ©",
      },
      {
        id: "lesson-6-3",
        title: "Sens de variation d'une suite",
        titleAr: "Ø¥ØªØ¬Ø§Ù‡ ØªØºÙŠØ± Ù…ØªØªØ§Ù„ÙŠØ© Ø¹Ø¯Ø¯ÙŠØ©",
      },
      {
        id: "lesson-6-4",
        title: "Les suites arithmétiques",
        titleAr: "Ø§Ù„Ù…ØªØªØ§Ù„ÙŠØ§Øª Ø§Ù„Ø­Ø³Ø§Ø¨ÙŠØ©",
      },
      {
        id: "lesson-6-5",
        title: "Les suites géométriques",
        titleAr: "Ø§Ù„Ù…ØªØªØ§Ù„ÙŠØ§Øª Ø§Ù„Ù‡Ù†Ø¯Ø³ÙŠØ©",
      },
      {
        id: "lesson-6-6",
        title: "Limite d'une suite numérique",
        titleAr: "Ù†Ù‡Ø§ÙŠØ© Ù…ØªØªØ§Ù„ÙŠØ© Ø¹Ø¯Ø¯ÙŠØ©",
      },
      {
        id: "lesson-6-7",
        title: "Limite d'une suite par encadrement",
        titleAr: "Ù†Ù‡Ø§ÙŠØ© Ù…ØªØªØ§Ù„ÙŠØ© Ø¹Ø¯Ø¯ÙŠØ© Ø¨Ø§Ø³ØªØ¹Ù…Ø§Ù„ Ø§Ù„Ø­ØµØ±",
      },
      {
        id: "lesson-6-8",
        title: "Limite d'une suite géométrique",
        titleAr: "Ù†Ù‡Ø§ÙŠØ© Ù…ØªØªØ§Ù„ÙŠØ© Ù‡Ù†Ø¯Ø³ÙŠØ©",
      },
    ],
  },
  {
    id: "chap-7-barycentre",
    title: "Le barycentre dans le plan",
    titleAr: "Ø§Ù„Ù…Ø±Ø¬Ø­ ÙÙŠ Ø§Ù„Ù…Ø³ØªÙˆÙŠ",
    lessons: [
      {
        id: "lesson-7-1",
        title: "Rappels sur les vecteurs",
        titleAr: "ØªØ°ÙƒÙŠØ± Ø­ÙˆÙ„ Ø§Ù„Ø£Ø´Ø¹Ø©",
      },
      {
        id: "lesson-7-2",
        title: "Barycentre de deux points",
        titleAr: "Ù…Ø±Ø¬Ø­ Ù†Ù‚Ø·ØªÙŠÙ†",
      },
      {
        id: "lesson-7-3",
        title: "Barycentre de trois points",
        titleAr: "Ù…Ø±Ø¬Ø­ Ø«Ù„Ø§Ø« Ù†Ù‚Ø§Ø·",
      },
      {
        id: "lesson-7-4",
        title: "Coordonnées du barycentre de trois points",
        titleAr: "Ø¥Ø­Ø¯Ø§Ø«ÙŠØ§Øª Ù…Ø±Ø¬Ø­ Ø«Ù„Ø§Ø« Ù†Ù‚Ø§Ø·",
      },
      {
        id: "lesson-7-5",
        title: "Barycentre de plusieurs points",
        titleAr: "Ù…Ø±Ø¬Ø­ Ø¹Ø¯Ø© Ù†Ù‚Ø§Ø·",
      },
    ],
  },
];

export const getSecondeArCourseInfo = () => ({
  title: "Mathématiques - Seconde",
  titleAr: "Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠØ§Øª - Ø§Ù„Ø³Ù†Ø© Ø§Ù„Ø«Ø§Ù†ÙŠØ© Ø«Ø§Ù†ÙˆÙŠ",
  description: "Programme de mathématiques pour la Seconde année (Sciences, Math techniques, Mathématiques)",
  descriptionAr: "Ø¨Ø±Ù†Ø§Ù…Ø¬ Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠØ§Øª Ù„Ù„Ø³Ù†Ø© Ø§Ù„Ø«Ø§Ù†ÙŠØ© Ø«Ø§Ù†ÙˆÙŠ - Ø¹Ù„ÙˆÙ…ØŒ ØªÙ‚Ù†ÙŠ Ø±ÙŠØ§Ø¶ÙŠØŒ Ø±ÙŠØ§Ø¶ÙŠØ§Øª",
});
