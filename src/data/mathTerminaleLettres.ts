// MathÃ©matiques - Terminale - FiliÃ¨re Lettres

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

export const mathTerminaleLettresChapters: Chapter[] = [
  {
    id: "chap-1-suites-numeriques",
    title: "Suites numÃ©riques",
    titleAr: "Ø§Ù„Ù…ØªØªØ§Ù„ÙŠØ§Øª Ø§Ù„Ø¹Ø¯Ø¯ÙŠØ©",
    lessons: [
      { id: "lesson-1-1", title: "GÃ©nÃ©ration et reconnaissance de suites", titleAr: "ØªÙˆÙ„ÙŠØ¯ Ù…ØªØªØ§Ù„ÙŠØ©: Ø§Ù„ØªØ¹Ø±Ù Ø¹Ù„Ù‰ Ù…ØªØªØ§Ù„ÙŠØ§Øª" },
      { id: "lesson-1-2", title: "Suites arithmÃ©tiques : DÃ©finition, terme gÃ©nÃ©ral, moyenne arithmÃ©tique", titleAr: "Ø§Ù„Ù…ØªØªØ§Ù„ÙŠØ§Øª Ø§Ù„Ø­Ø³Ø§Ø¨ÙŠØ©: Ø§Ù„ØªØ¹Ø±ÙŠÙ ØŒ Ø§Ù„Ø­Ø¯ Ø§Ù„Ø¹Ø§Ù… Ø› Ø§Ù„ÙˆØ³Ø· Ø§Ù„Ø­Ø³Ø§Ø¨ÙŠ" },
      { id: "lesson-1-3", title: "Somme des premiers termes d'une suite arithmÃ©tique", titleAr: "Ø­Ø³Ø§Ø¨ Ù…Ø¬Ù…ÙˆØ¹ Ø§Ù„Ø­Ø¯ÙˆØ¯ Ø§Ù„Ø§ÙˆÙ„Ù‰ Ù…Ù† Ù…ØªØªØ§Ù„ÙŠØ© Ø­Ø³Ø§Ø¨ÙŠØ©" },
      { id: "lesson-1-4", title: "Suites gÃ©omÃ©triques : DÃ©finition, terme gÃ©nÃ©ral, moyenne gÃ©omÃ©trique", titleAr: "Ø§Ù„Ù…ØªØªØ§Ù„ÙŠØ§Øª Ø§Ù„Ù‡Ù†Ø¯Ø³ÙŠØ©: Ø§Ù„ØªØ¹Ø±ÙŠÙ ØŒ Ø§Ù„Ø­Ø¯ Ø§Ù„Ø¹Ø§Ù…Ø› Ø§Ù„ÙˆØ³Ø· Ø§Ù„Ù‡Ù†Ø¯Ø³ÙŠ" },
      { id: "lesson-1-5", title: "Somme des premiers termes d'une suite gÃ©omÃ©trique", titleAr: "Ø­Ø³Ø§Ø¨ Ù…Ø¬Ù…ÙˆØ¹ Ø§Ù„Ø­Ø¯ÙˆØ¯ Ø§Ù„Ø§ÙˆÙ„Ù‰ Ù…Ù† Ù…ØªØªØ§Ù„ÙŠØ© Ù‡Ù†Ø¯Ø³ÙŠØ©" },
      { id: "lesson-1-6", title: "Suites rÃ©currentes : Reconnaissance et calcul des premiers termes", titleAr: "Ø§Ù„ØªØ¹Ø±Ù‘Ù Ø¹Ù„Ù‰ Ù…ØªØªØ§Ù„ÙŠØ© Ø¨Ø§Ù„ØªØ±Ø§Ø¬Ø¹ - Ø­Ø³Ø§Ø¨ Ø§Ù„Ø­Ø¯ÙˆØ¯ Ø§Ù„Ø£ÙˆÙ„Ù‰" },
      { id: "lesson-1-7", title: "Monotonie d'une suite : sens de variation", titleAr: "Ù…ÙÙ‡ÙˆÙ… Ø§Ù„Ù…ØªØªØ§Ù„ÙŠØ© Ø§Ù„Ø±ØªÙŠØ¨Ø© ÙˆØªØ¹ÙŠÙŠÙ† Ø§ØªØ¬Ø§Ù‡ ØªØºÙŠÙ‘Ø±Ù‡Ø§" },
      { id: "lesson-1-8", title: "Sens de variation d'une suite arithmÃ©tique et gÃ©omÃ©trique", titleAr: "ØªØ­Ø¯ÙŠØ¯ Ø§ØªØ¬Ø§Ù‡ ØªØºÙŠÙ‘Ø± Ù…ØªØªØ§Ù„ÙŠØ© Ø­Ø³Ø§Ø¨ÙŠØ© ÙˆÙ‡Ù†Ø¯Ø³ÙŠØ©" },
      { id: "lesson-1-9", title: "Application des suites Ã  la rÃ©solution de problÃ¨mes", titleAr: "Ø§Ø³ØªØ¹Ù…Ø§Ù„ Ø§Ù„Ù…ØªØªØ§Ù„ÙŠØ§Øª Ø§Ù„Ø­Ø³Ø§Ø¨ÙŠØ© ÙˆØ§Ù„Ù‡Ù†Ø¯Ø³ÙŠØ© ÙÙŠ Ø­Ù„ Ø§Ù„Ù…Ø´ÙƒÙ„Ø§Øª" },
      { id: "lesson-1-10", title: "Suites arithmotico-gÃ©omÃ©triques (Un+1 = aUn + b)", titleAr: "Ø§Ù„Ù…ØªØªØ§Ù„ÙŠØ§Øª Ù…Ù† Ø§Ù„Ø´ÙƒÙ„ Un+1=a Un +b" },
      { id: "lesson-1-11", title: "RÃ©solution de problÃ¨mes avec les suites arithmotico-gÃ©omÃ©triques", titleAr: "Ø­Ù„ Ù…Ø´ÙƒÙ„Ø§Øª ØªÙØ³ØªØ¹Ù…Ù„ ÙÙŠÙ‡Ø§ Ù…ØªØªØ§Ù„ÙŠØ§Øª Ù…Ù† Ø§Ù„Ø´ÙƒÙ„ Un+1=a Un +b" },
    ],
  },
  {
    id: "chap-2-arithmetique",
    title: "ArithmÃ©tique",
    titleAr: "Ø§Ù„Ø­Ø³Ø§Ø¨",
    lessons: [
      { id: "lesson-2-1", title: "Division euclidienne dans Z", titleAr: "Ø§Ù„Ù‚Ø³Ù…Ø© Ø§Ù„Ø¥Ù‚Ù„ÙŠØ¯ÙŠØ© ÙÙŠ Z" },
      { id: "lesson-2-2", title: "Ensemble des diviseurs d'un entier naturel", titleAr: "ØªØ¹ÙŠÙŠÙ† Ù…Ø¬Ù…ÙˆØ¹Ø© Ù‚ÙˆØ§Ø³Ù… Ø¹Ø¯Ø¯ Ø·Ø¨ÙŠØ¹ÙŠ" },
      { id: "lesson-2-3", title: "Congruences dans Z", titleAr: "Ø§Ù„Ù…ÙˆØ§ÙÙ‚Ø§Øª ÙÙŠ Z" },
      { id: "lesson-2-4", title: "PropriÃ©tÃ©s des congruences et rÃ©solution de problÃ¨mes", titleAr: "Ù…Ø¹Ø±ÙØ© Ø®ÙˆØ§Øµ Ø§Ù„Ù…ÙˆØ§ÙÙ‚Ø© ÙˆØ§Ø³ØªØ¹Ù…Ø§Ù„Ù‡Ø§ ÙÙŠ Ø­Ù„ Ø§Ù„Ù…Ø´Ú©Ù„Ø§Øª" },
      { id: "lesson-2-5", title: "Raisonnement par rÃ©currence", titleAr: "Ø§Ù„Ø§Ø³ØªØ¯Ù„Ø§Ù„ Ø¨Ø§Ù„ØªØ±Ø§Ø¬Ø¹" },
    ],
  },
  {
    id: "chap-3-etude-de-fonctions",
    title: "Ã‰tude de fonctions",
    titleAr: "Ø¯Ø±Ø§Ø³Ø© Ø§Ù„Ø¯ÙˆØ§Ù„",
    lessons: [
      { id: "lesson-3-1", title: "Rappels : DÃ©rivÃ©es et Ã©quation de la tangente", titleAr: "ØªØ°ÙƒÙŠØ± Ø­ÙˆÙ„ Ø§Ù„Ù…Ø´ØªÙ‚Ø§Øª ÙˆÙ…Ø¹Ø§Ø¯Ù„Ø© Ø§Ù„Ù…Ù…Ø§Ø³" },
      { id: "lesson-3-2", title: "Ã‰tude des variations d'une fonction", titleAr: "Ø§Ù„Ø¯Ø±Ø§Ø³Ø© ÙˆØ§Ù„ØªÙ…Ø«ÙŠÙ„ Ø§Ù„Ø¨ÙŠØ§Ù†ÙŠ Ù„Ø¯Ø§Ù„Ø©" },
      { id: "lesson-3-3", title: "Fonctions polynÃ´mes (degrÃ© 3 maximum)", titleAr: "Ø§Ù„Ø¯ÙˆØ§Ù„ ÙƒØ«ÙŠØ±Ø§Øª Ø§Ù„Ø­Ø¯ÙˆØ¯" },
      { id: "lesson-3-4", title: "Point d'inflexion", titleAr: "ØªØ¹ÙŠÙŠÙ† Ù†Ù‚Ø·Ø© Ø§Ù„Ø§Ù†Ø¹Ø·Ø§Ù" },
      { id: "lesson-3-5", title: "Lecture graphique et tableau de variations", titleAr: "Ø§Ù„Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„Ø¨ÙŠØ§Ù†ÙŠØ©" },
      { id: "lesson-3-6", title: "RÃ©solution graphique d'Ã©quations et d'inÃ©quations", titleAr: "Ø§Ø³ØªØ¹Ù…Ø§Ù„ Ø§Ù„ØªÙ…Ø«ÙŠÙ„ Ø§Ù„Ø¨ÙŠØ§Ù†ÙŠ Ù„Ø­Ù„ Ù…Ø¹Ø§Ø¯Ù„Ø§Øª Ø£Ùˆ Ù…ØªØ±Ø§Ø¬Ø­Ø§Øª" },
      { id: "lesson-3-7", title: "Fonctions homographiques y = (ax+b)/(cx+d)", titleAr: "Ø§Ù„Ø¯ÙˆØ§Ù„ Ø§Ù„ØªÙ†Ø§Ø¸Ø±ÙŠØ©" },
      { id: "lesson-3-8", title: "Asymptotes et interprÃ©tation graphique", titleAr: "ØªØ¹ÙŠÙŠÙ† Ø§Ù„Ù…Ø³ØªÙ‚ÙŠÙ…Ø§Øª Ø§Ù„Ù…Ù‚Ø§Ø±Ø¨Ø© ÙˆØªÙØ³ÙŠØ±Ù‡Ø§ Ø¨ÙŠØ§Ù†ÙŠØ§" },
      { id: "lesson-3-9", title: "Conjecture des limites Ã  l'infini par lecture graphique", titleAr: "Ø§Ø³ØªØ¹Ù…Ø§Ù„ Ø§Ù„ØªÙ…Ø«ÙŠÙ„ Ø§Ù„Ø¨ÙŠØ§Ù†ÙŠ Ù„ØªØ®Ù…ÙŠÙ† Ø§Ù„Ù†Ù‡Ø§ÙŠØ§Øª" },
    ],
  },
  {
    id: "chap-4-statistiques-probabilites",
    title: "Statistiques et ProbabilitÃ©s",
    titleAr: "Ø§Ù„Ø¥Ø­ØµØ§Ø¡ Ùˆ Ø§Ù„Ø§Ø­ØªÙ…Ø§Ù„Ø§Øª",
    lessons: [
      { id: "lesson-4-1", title: "Simulation et frÃ©quences", titleAr: "Ù…Ø­Ø§ÙƒØ§Ø© ØªØ¬Ø±Ø¨Ø© Ø¹Ø´ÙˆØ§Ø¦ÙŠØ© ÙˆÙ…Ù„Ø§Ø­Ø¸Ø© ØªÙˆØ§ØªØ±Ø§Øª Ø§Ù„Ù‚ÙŠÙ…" },
      { id: "lesson-4-2", title: "Calcul de la probabilitÃ© d'un Ã©vÃ©nement", titleAr: "Ø­Ø³Ø§Ø¨ Ø§Ø­ØªÙ…Ø§Ù„ Ø­Ø¯Ø« Ø¨Ø³ÙŠØ· Ø§Ùˆ Ù…Ø±ÙƒØ¨" },
      { id: "lesson-4-3", title: "Loi de probabilitÃ© pour une expÃ©rience Ã  nombre fini d'issues", titleAr: "Ù‚Ø§Ù†ÙˆÙ† Ø§Ù„Ø§Ø­ØªÙ…Ø§Ù„ Ø§Ù„Ù…ØªØ¹Ù„Ù‚ Ø¨ØªØ¬Ø±Ø¨Ø© Ø¹Ø´ÙˆØ§Ø¦ÙŠØ©" },
      { id: "lesson-4-4", title: "EspÃ©rance mathÃ©matique et variance", titleAr: "Ø§Ø£Ù„Ù…Ù„ Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠØ§ØªÙŠ ÙˆØ§Ù„ØªØ¨Ø§ÙŠÙ†" },
    ],
  },
];
