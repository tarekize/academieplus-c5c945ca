// MathÃ©matiques - PremiÃ¨re AnnÃ©e Secondaire - Tronc Commun Scientifique

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

export const mathPremiereTCSChapters: Chapter[] = [
  {
    id: "chap-1-nombres-calcul",
    title: "Les nombres et le calcul",
    titleAr: "Ø§Ù„Ø£Ø¹Ø¯Ø§Ø¯ ÙˆØ§Ù„Ø­Ø³Ø§Ø¨",
    lessons: [
      {
        id: "lesson-1-1",
        title: "Calcul dans les ensembles numÃ©riques",
        titleAr: "Ù…Ù…Ø§Ø±Ø³Ø© Ø§Ù„Ø­Ø³Ø§Ø¨ ÙÙŠ Ù…Ø®ØªÙ„Ù Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø§Øª Ø§Ù„Ø¹Ø¯Ø¯ÙŠØ©",
      },
      {
        id: "lesson-1-2",
        title: "MaÃ®trise du calcul algÃ©brique",
        titleAr: "Ø§Ù„ØªØ­ÙƒÙ… ÙÙŠ Ø§Ù„Ø­Ø³Ø§Ø¨ Ø§Ù„Ø¬Ø¨Ø±ÙŠ",
      },
      {
        id: "lesson-1-3",
        title: "Ã‰quations et inÃ©quations",
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
        title: "Fonctions de rÃ©fÃ©rence",
        titleAr: "Ù…Ø¹Ø±ÙØ© ÙˆØ§Ø³ØªØ¹Ù…Ø§Ù„ Ø®ÙˆØ§Øµ Ø§Ù„Ø¯ÙˆØ§Ù„ Ø§Ù„Ù…Ø±Ø¬Ø¹ÙŠØ© Ø§Ù„ØªÙŠ ØªÙ…Ù‡Ø¯ Ù„Ø¯Ø±Ø§Ø³Ø© Ø§Ù„Ø¯ÙˆØ§Ù„",
      },
      {
        id: "lesson-2-3",
        title: "Tableaux de variations et courbes",
        titleAr: "Ù‚Ø±Ø§Ø¡Ø© Ø¬Ø¯Ø§ÙˆÙ„ ØªØºÙŠØ±Ø§Øª ÙˆÙ…Ù†Ø­Ù†ÙŠØ§Øª Ø¯ÙˆØ§Ù„ØŒ ÙˆØªÙØ³ÙŠØ±Ù‡Ø§",
      },
      {
        id: "lesson-2-4",
        title: "RÃ©solution de problÃ¨mes",
        titleAr: "Ø§ÙƒØªØ³Ø§Ø¨ Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª Ù„Ù„ØªØ¹Ø¨ÙŠØ± Ø¹Ù† Ù…Ø´ÙƒÙ„Ø§Øª - ØªØªØ¹Ù„Ù‚ Ø¨Ø§Ù„Ø¯ÙˆØ§Ù„ - ÙˆØ­Ù„Ù‡Ø§",
      },
      {
        id: "lesson-2-5",
        title: "TracÃ© de courbes avec calculatrice",
        titleAr: "ØªÙˆØ¸ÙŠÙ Ø§Ù„Ø­Ø§Ø³Ø¨Ø© Ø§Ù„Ø¨ÙŠØ§Ù†ÙŠØ© Ù„Ø§Ø³ØªØ®Ø±Ø§Ø¬ Ù…Ù†Ø­Ù†ÙŠ Ø¯Ø§Ù„Ø©",
      },
    ],
  },
  {
    id: "chap-3-geometrie",
    title: "La gÃ©omÃ©trie",
    titleAr: "Ø§Ù„Ù‡Ù†Ø¯Ø³Ø©",
    lessons: [
      {
        id: "lesson-3-1",
        title: "Calcul vectoriel",
        titleAr: "Ù…Ù…Ø§Ø±Ø³Ø© Ø§Ù„Ø­Ø³Ø§Ø¨ Ø§Ù„Ø´Ø¹Ø§Ø¹ÙŠ ÙÙŠ Ø§Ù„Ù‡Ù†Ø¯Ø³Ø© Ø§Ù„ØªØ­Ù„ÙŠÙ„ÙŠØ©",
      },
      {
        id: "lesson-3-2",
        title: "ProblÃ¨mes gÃ©omÃ©triques vectoriels",
        titleAr: "Ø­Ù„ Ù…Ø³Ø§Ø¦Ù„ Ù‡Ù†Ø¯Ø³ÙŠØ© ØªØªØ¹Ù„Ù‚ Ø¨Ø§Ù„Ø­Ø³Ø§Ø¨ Ø§Ù„Ø´Ø¹Ø§Ø¹ÙŠ ÙÙŠ Ø§Ù„Ù‡Ù†Ø¯Ø³Ø© Ø§Ù„ØªØ­Ù„ÙŠÙ„ÙŠØ©",
      },
      {
        id: "lesson-3-3",
        title: "Droites et rÃ©solution de problÃ¨mes",
        titleAr: "Ø§ÙƒØªØ³Ø§Ø¨ Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª Ù„Ù„ØªØ¹Ø¨ÙŠØ± Ø¹Ù† Ù…Ø´ÙƒÙ„Ø§Øª ØªØªØ¹Ù„Ù‚ Ø¨Ø§Ù„Ù…Ø³ØªÙ‚ÙŠÙ…Ø§ØªØŒ ÙˆØ­Ù„Ù‡Ø§",
      },
    ],
  },
  {
    id: "chap-4-statistiques",
    title: "Les statistiques",
    titleAr: "Ø§Ù„Ø¥Ø­ØµØ§Ø¡",
    lessons: [
      {
        id: "lesson-4-1",
        title: "Lecture et organisation des donnÃ©es",
        titleAr: "Ù‚Ø±Ø§Ø¡Ø© Ù…Ø¹Ø·ÙŠØ§Øª ÙˆØªÙ†Ø¸ÙŠÙ…Ù‡Ø§",
      },
      {
        id: "lesson-4-2",
        title: "ReprÃ©sentations graphiques",
        titleAr: "Ø¹Ø±Ø¶ Ù†ØªØ§Ø¦Ø¬ Ø¹Ù„Ù‰ Ø´ÙƒÙ„ Ù…Ø®Ø·Ø·Ø§Øª Ø¨ÙŠØ§Ù†ÙŠØ©ØŒ ÙˆÙ‚Ø±Ø§Ø¡ØªÙ‡Ø§ ÙˆØªÙØ³ÙŠØ±Ù‡Ø§",
      },
      {
        id: "lesson-4-3",
        title: "Indicateurs statistiques",
        titleAr: "ØªÙ„Ø®ÙŠØµ Ø³Ù„Ø§Ø³Ù„ Ø¥Ø­ØµØ§Ø¦ÙŠØ© Ø¨ÙˆØ§Ø³Ø·Ø© Ù…Ø¤Ø´Ø±Ø§Øª Ø§Ù„Ù…ÙˆÙ‚Ø¹ ÙˆÙ…Ø¤Ø´Ø± Ø§Ù„ØªØ´ØªØª (Ø§Ù„Ù…Ø¯Ù‰)",
      },
      {
        id: "lesson-4-4",
        title: "Calculatrice et statistiques",
        titleAr: "ØªÙˆØ¸ÙŠÙ Ø§Ù„Ø­Ø§Ø³Ø¨Ø© Ø§Ù„Ø¹Ù„Ù…ÙŠØ© Ø£Ùˆ Ø§Ù„Ø¨ÙŠØ§Ù†ÙŠØ© Ù„Ø­Ø³Ø§Ø¨ Ù…Ø¤Ø´Ø±Ø§Øª Ø¥Ø­ØµØ§Ø¦ÙŠØ© Ø£Ùˆ Ù„Ø§Ø³ØªØ®Ø±Ø§Ø¬ ØªÙ…Ø«ÙŠÙ„Ø§Øª Ø¨ÙŠØ§Ù†ÙŠØ©",
      },
    ],
  },
  {
    id: "chap-5-tic",
    title: "Technologies de l'information et de la communication",
    titleAr: "ØªÙƒÙ†ÙˆÙ„ÙˆØ¬ÙŠØ§Øª Ø§Ù„Ø¥Ø¹Ù„Ø§Ù… ÙˆØ§Ù„Ø§ØªØµØ§Ù„",
    lessons: [
      {
        id: "lesson-5-1",
        title: "Utilisation de la calculatrice scientifique",
        titleAr: "Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ø­Ø§Ø³Ø¨Ø© Ø§Ù„Ø¹Ù„Ù…ÙŠØ© Ù„Ø¨Ù†Ø§Ø¡ ØªØ¹Ù„Ù‘Ù…Ø§Øª ÙˆÙ„Ø¥Ø¬Ø±Ø§Ø¡ Ø­Ø³Ø§Ø¨Ø§Øª Ù‚ØµØ¯ Ø­Ù„ Ù…Ø´ÙƒÙ„Ø© ÙˆØ§Ù„ÙˆØ¹ÙŠ Ø¨Ø­Ø¯ÙˆØ¯Ù‡Ø§",
      },
      {
        id: "lesson-5-2",
        title: "Logiciels et calculatrice pour expÃ©rimentation",
        titleAr: "Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ø¨Ø±Ù…Ø¬ÙŠØ§Øª ÙˆØ§Ù„Ø­Ø§Ø³Ø¨Ø© Ø§Ù„Ø¹Ù„Ù…ÙŠØ© Ø£Ùˆ Ø§Ù„Ø¨ÙŠØ§Ù†ÙŠØ© Ù„Ù„ØªØ¬Ø±ÙŠØ¨ ÙˆØ§Ù„ØªØ®Ù…ÙŠÙ† ÙˆÙ…Ù‚Ø§Ø±Ù†Ø© Ù†ØªØ§Ø¦Ø¬ ÙˆØ§Ù„ØªØµØ¯ÙŠÙ‚ ÙˆÙ„Ù„ØªØ·Ø±Ù‚ Ø¥Ù„Ù‰ Ù…ÙÙ‡ÙˆÙ… Ø¬Ø¯ÙŠØ¯ (Ù…ÙÙ‡ÙˆÙ… Ø§Ù„Ø¯Ø§Ù„Ø©ØŒ Ø§Ù„Ù…Ø­Ø§ÙƒØ§Ø©ØŒ ... )",
      },
      {
        id: "lesson-5-3",
        title: "TracÃ© de courbes de fonctions",
        titleAr: "ØªÙˆØ¸ÙŠÙ Ø§Ù„Ø¨Ø±Ù…Ø¬ÙŠØ§Øª ÙˆØ§Ù„Ø­Ø§Ø³Ø¨Ø© Ø§Ù„Ø¨ÙŠØ§Ù†ÙŠØ© Ù„Ø§Ø³ØªØ®Ø±Ø§Ø¬ Ù…Ù†Ø­Ù†Ù‰ Ø¯Ø§Ù„Ø© Ù‚ØµØ¯ Ø§Ø³ØªØºÙ„Ø§Ù„Ù‡",
      },
      {
        id: "lesson-5-4",
        title: "Indicateurs statistiques et reprÃ©sentations",
        titleAr: "ØªÙˆØ¸ÙŠÙ Ø§Ù„Ø¨Ø±Ù…Ø¬ÙŠØ§Øª ÙˆØ§Ù„Ø­Ø§Ø³Ø¨Ø© Ø§Ù„Ø¨ÙŠØ§Ù†ÙŠØ© Ù„Ø­Ø³Ø§Ø¨ Ù…Ø¤Ø´Ø±Ø§Øª Ø§Ù„Ù…ÙˆÙ‚Ø¹ Ù„Ø³Ù„Ø³Ù„Ø© Ø¥Ø­ØµØ§Ø¦ÙŠØ© Ø£Ùˆ Ù„Ø§Ø³ØªØ®Ø±Ø§Ø¬ ØªÙ…Ø«ÙŠÙ„Ø§Øª Ø¨ÙŠØ§Ù†ÙŠØ© Ø£Ùˆ Ù…Ø®Ø·Ø·Ø§Øª Ø®Ø§ØµØ© Ø¨Ù‡Ø°Ù‡ Ø§Ù„Ø³Ù„Ø³Ù„Ø©",
      },
    ],
  },
  {
    id: "chap-6-logique",
    title: "Logique et dÃ©monstration mathÃ©matique",
    titleAr: "Ø§Ù„Ù…Ù†Ø·Ù‚ ÙˆØ§Ù„Ø¨Ø±Ù‡Ø§Ù† Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠ",
    lessons: [
      {
        id: "lesson-6-1",
        title: "Propositions simples et composÃ©es",
        titleAr: "Ø§Ù„Ø­ÙƒÙ… Ø¹Ù„Ù‰ Ø§Ù„Ù‚Ø¶Ø§ÙŠØ§ Ø§Ù„Ø¨Ø³ÙŠØ·Ø© ÙˆØ§Ù„Ù…Ø±ÙƒØ¨Ø©",
      },
      {
        id: "lesson-6-2",
        title: "DÃ©monstration par dÃ©duction, absurde et cas",
        titleAr: "Ù…Ù…Ø§Ø±Ø³Ø© Ø§Ù„Ø¨Ø±Ù‡Ø§Ù† Ø¨Ø§Ù„Ø§Ø³ØªÙ†ØªØ§Ø¬ ÙˆØ¨Ø§Ù„Ø®Ù„Ù ÙˆØ¨ÙØµÙ„ Ø§Ù„Ø­Ø§Ù„Ø§Øª ÙˆØ¨Ù…Ø«Ø§Ù„ Ù…Ø¶Ø§Ø¯",
      },
      {
        id: "lesson-6-3",
        title: "Reconnaissance et validation de preuves",
        titleAr: "Ø§Ù„ØªØ¹Ø±Ù Ø¹Ù„Ù‰ Ù†Ù…Ø· Ø¨Ø±Ù‡Ø§Ù† Ù…Ø¹Ø·Ù‰ ÙˆØ´Ø±Ø­Ù‡ ÙˆØªØµØ¯ÙŠÙ‚Ù‡",
      },
      {
        id: "lesson-6-4",
        title: "Distinction des types de dÃ©monstration",
        titleAr: "Ø§Ù„ØªÙ…ÙŠÙŠØ² Ø¨ÙŠÙ† Ø£Ù†Ù…Ø§Ø· Ø§Ù„Ø¨Ø±Ù‡Ø§Ù† Ø§Ù„Ø°ÙŠ ÙŠÙ…Ø§Ø±Ø³ ÙÙŠ Ù‡Ø°Ø§ Ø§Ù„Ù…Ø³ØªÙˆÙ‰",
      },
      {
        id: "lesson-6-5",
        title: "Lien entre dÃ©monstration et formule logique",
        titleAr: "ØªÙ‚Ø±ÙŠØ¨ Ù†Ù…Ø· Ø¨Ø±Ù‡Ø§Ù† Ù…Ù† ØµÙŠØºØ© Ù…Ù†Ø·Ù‚ÙŠØ© Ù„Ù‡",
      },
    ],
  },
];

export const getCourseInfo = () => ({
  level: "PremiÃ¨re",
  filiere: "Tronc Commun Scientifique",
  subject: "MathÃ©matiques",
  subjectAr: "Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠØ§Øª",
  totalChapters: mathPremiereTCSChapters.length,
  totalLessons: mathPremiereTCSChapters.reduce((acc, ch) => acc + ch.lessons.length, 0),
});
