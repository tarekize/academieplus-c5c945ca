// Programme de Mathématiques - Première (Tronc Commun Lettres)
// Curriculum structuré en 4 chapitres

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

export const mathPremiereTCLChapters: Chapter[] = [
  {
    id: "chap-1-nombres",
    title: "Nombres et calcul",
    titleAr: "Ø§Ù„Ø£Ø¹Ø¯Ø§Ø¯ ÙˆØ§Ù„Ø­Ø³Ø§Ø¨",
    lessons: [
      {
        id: "lesson-1-1",
        title: "Calcul dans les ensembles numériques",
        titleAr: "Ù…Ù…Ø§Ø±Ø³Ø© Ø§Ù„Ø­Ø³Ø§Ø¨ ÙÙŠ Ù…Ø®ØªÙ„Ù Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø§Øª Ø§Ù„Ø¹Ø¯Ø¯ÙŠØ©",
      },
      {
        id: "lesson-1-2",
        title: "Maîtrise du calcul algébrique",
        titleAr: "Ø§Ù„ØªØ­ÙƒÙ… ÙÙŠ Ø§Ù„Ø­Ø³Ø§Ø¨ Ø§Ù„Ø¬Ø¨Ø±ÙŠ",
      },
      {
        id: "lesson-1-3",
        title: "Équations et inéquations",
        titleAr: "Ø§ÙƒØªØ³Ø§Ø¨ Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª ØªØªØ¹Ù„Ù‚ Ø¨Ø§Ù„ØªØ¹Ø¨ÙŠØ± Ø¹Ù† Ù…Ø´ÙƒÙ„Ø§Øª Ø¨Ù…Ø¹Ø§Ø¯Ù„Ø§Øª ÙˆÙ…ØªØ±Ø§Ø¬Ø­Ø§Øª ÙˆØ­Ù„Ù‡Ø§",
      },
      {
        id: "lesson-1-4",
        title: "Utilisation de la calculatrice",
        titleAr: "Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ø­Ø§Ø³Ø¨Ø© Ø§Ù„Ø¹Ù„Ù…ÙŠØ© Ø£Ùˆ Ø§Ù„Ø¨ÙŠØ§Ù†ÙŠØ© Ù„Ø¥Ø¬Ø±Ø§Ø¡ Ø­Ø³Ø§Ø¨",
      },
    ],
  },
  {
    id: "chap-2-fonctions",
    title: "Les fonctions",
    titleAr: "Ø§Ù„Ø¯ÙˆØ§Ù„",
    lessons: [
      {
        id: "lesson-2-1",
        title: "Concept de fonction",
        titleAr: "Ø¥Ø¯Ø±Ø§Ùƒ Ù…ÙÙ‡ÙˆÙ… Ø§Ù„Ø¯Ø§Ù„Ø© Ø¨Ù…Ø®ØªÙ„Ù Ø§Ù„ØµÙŠØº (Ø¨ÙŠØ§Ù†ÙŠØ§ØŒ Ø­Ø³Ø§Ø¨ÙŠØ§ØŒ Ø¬Ø¨Ø±ÙŠØ§)",
      },
      {
        id: "lesson-2-2",
        title: "Fonctions de référence",
        titleAr: "Ù…Ø¹Ø±ÙØ© ÙˆØ§Ø³ØªØ¹Ù…Ø§Ù„ Ø®ÙˆØ§Øµ Ø§Ù„Ø¯ÙˆØ§Ù„ Ø§Ù„Ù…Ø±Ø¬Ø¹ÙŠØ© Ø§Ù„ØªÙŠ ØªÙ…Ù‡Ø¯ Ù„Ø¯Ø±Ø§Ø³Ø© Ø§Ù„Ø¯ÙˆØ§Ù„",
      },
      {
        id: "lesson-2-3",
        title: "Tableaux de variations et courbes",
        titleAr: "Ù‚Ø±Ø§Ø¡Ø© Ø¬Ø¯Ø§ÙˆÙ„ ØªØºÙŠØ±Ø§Øª ÙˆÙ…Ù†Ø­Ù†ÙŠØ§Øª Ø¯ÙˆØ§Ù„ØŒ ÙˆØªÙØ³ÙŠØ±Ù‡Ø§",
      },
      {
        id: "lesson-2-4",
        title: "Résolution de problèmes",
        titleAr: "Ø§ÙƒØªØ³Ø§Ø¨ Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª Ù„Ù„ØªØ¹Ø¨ÙŠØ± Ø¹Ù† Ù…Ø´ÙƒÙ„Ø§Øª -ØªØªØ¹Ù„Ù‚ Ø¨Ø§Ù„Ø¯ÙˆØ§Ù„ - ÙˆØ­Ù„Ù‡Ø§",
      },
      {
        id: "lesson-2-5",
        title: "Tracé de courbes avec calculatrice",
        titleAr: "ØªÙˆØ¸ÙŠÙ Ø§Ù„Ø­Ø§Ø³Ø¨Ø© Ø§Ù„Ø¨ÙŠØ§Ù†ÙŠØ© Ù„Ø§Ø³ØªØ®Ø±Ø§Ø¬ Ù…Ù†Ø­Ù†ÙŠ Ø¯Ø§Ù„Ø©",
      },
    ],
  },
  {
    id: "chap-3-geometrie",
    title: "Géométrie",
    titleAr: "Ø§Ù„Ù‡Ù†Ø¯Ø³Ø©",
    lessons: [
      {
        id: "lesson-3-1",
        title: "Calcul vectoriel en géométrie analytique",
        titleAr: "Ù…Ù…Ø§Ø±Ø³Ø© Ø§Ù„Ø­Ø³Ø§Ø¨ Ø§Ù„Ø´Ø¹Ø§Ø¹ÙŠ ÙÙŠ Ø§Ù„Ù‡Ù†Ø¯Ø³Ø© Ø§Ù„ØªØ­Ù„ÙŠÙ„ÙŠØ©",
      },
      {
        id: "lesson-3-2",
        title: "Problèmes géométriques vectoriels",
        titleAr: "Ø­Ù„ Ù…Ø³Ø§Ø¦Ù„ Ù‡Ù†Ø¯Ø³ÙŠØ© ØªØªØ¹Ù„Ù‚ Ø¨Ø§Ù„Ø­Ø³Ø§Ø¨ Ø§Ù„Ø´Ø¹Ø§Ø¹ÙŠ ÙÙŠ Ø§Ù„Ù‡Ù†Ø¯Ø³Ø© Ø§Ù„ØªØ­Ù„ÙŠÙ„ÙŠØ©",
      },
      {
        id: "lesson-3-3",
        title: "Problèmes sur les droites",
        titleAr: "Ø§ÙƒØªØ³Ø§Ø¨ Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª Ù„Ù„ØªØ¹Ø¨ÙŠØ± Ø¹Ù† Ù…Ø´ÙƒÙ„Ø§Øª ØªØªØ¹Ù„Ù‚ Ø¨Ø§Ù„Ù…Ø³ØªÙ‚ÙŠÙ…Ø§ØªØŒ ÙˆØ­Ù„Ù‡Ø§",
      },
    ],
  },
  {
    id: "chap-4-statistiques",
    title: "Statistiques",
    titleAr: "Ø§Ù„Ø¥Ø­ØµØ§Ø¡",
    lessons: [
      {
        id: "lesson-4-1",
        title: "Lecture et organisation des données",
        titleAr: "Ù‚Ø±Ø§Ø¡Ø© Ù…Ø¹Ø·ÙŠØ§Øª ÙˆØªÙ†Ø¸ÙŠÙ…Ù‡Ø§",
      },
      {
        id: "lesson-4-2",
        title: "Diagrammes et graphiques",
        titleAr: "Ø¹Ø±Ø¶ Ù†ØªØ§Ø¦Ø¬ Ø¹Ù„Ù‰ Ø´ÙƒÙ„ Ù…Ø®Ø·Ø·Ø§Øª Ø¨ÙŠØ§Ù†ÙŠØ©ØŒ ÙˆÙ‚Ø±Ø§Ø¡ØªÙ‡Ø§ ÙˆØªÙØ³ÙŠØ±Ù‡Ø§",
      },
      {
        id: "lesson-4-3",
        title: "Indicateurs statistiques",
        titleAr: "ØªÙ„Ø®ÙŠØµ Ø³Ù„Ø§Ø³Ù„ Ø¥Ø­ØµØ§Ø¦ÙŠØ© Ø¨ÙˆØ§Ø³Ø·Ø© Ù…Ø¤Ø´Ø±Ø§Øª Ø§Ù„Ù…ÙˆÙ‚Ø¹ ÙˆÙ…Ø¤Ø´Ø± Ø§Ù„ØªØ´ØªØª (Ø§Ù„Ù…Ø¯Ù‰)",
      },
      {
        id: "lesson-4-4",
        title: "Calcul avec calculatrice",
        titleAr: "ØªÙˆØ¸ÙŠÙ Ø§Ù„Ø­Ø§Ø³Ø¨Ø© Ø§Ù„Ø¹Ù„Ù…ÙŠØ© Ø£Ùˆ Ø§Ù„Ø¨ÙŠØ§Ù†ÙŠØ© Ù„Ø­Ø³Ø§Ø¨ Ù…Ø¤Ø´Ø±Ø§Øª Ø¥Ø­ØµØ§Ø¦ÙŠØ© Ø£Ùˆ Ù„Ø§Ø³ØªØ®Ø±Ø§Ø¬ ØªÙ…Ø«ÙŠÙ„Ø§Øª Ø¨ÙŠØ§Ù†ÙŠØ©",
      },
    ],
  },
];

export const getCourseInfo = () => ({
  title: "Mathématiques - Première (Tronc Commun Lettres)",
  titleAr: "Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠØ§Øª - Ø§Ù„Ø£ÙˆÙ„Ù‰ Ø«Ø§Ù†ÙˆÙŠ (Ø¬Ø°Ø¹ Ù…Ø´ØªØ±Ùƒ Ø¢Ø¯Ø§Ø¨)",
  description: "Programme de mathématiques pour la Première année du Tronc Commun Lettres",
  descriptionAr: "Ø¨Ø±Ù†Ø§Ù…Ø¬ Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠØ§Øª Ù„Ù„Ø³Ù†Ø© Ø§Ù„Ø£ÙˆÙ„Ù‰ Ø«Ø§Ù†ÙˆÙŠ - Ø¬Ø°Ø¹ Ù…Ø´ØªØ±Ùƒ Ø¢Ø¯Ø§Ø¨",
});
