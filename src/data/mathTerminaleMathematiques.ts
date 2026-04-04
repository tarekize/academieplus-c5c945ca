// MathÃ©matiques - Terminale - FiliÃ¨re MathÃ©matiques

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

export const mathTerminaleMathematiquesChapters: Chapter[] = [
  {
    id: "chap-1-limites-continuite",
    title: "Limites et continuitÃ©",
    titleAr: "Ø§Ù„Ù†Ù‡Ø§ÙŠØ§Øª ÙˆØ§Ù„Ø§Ø³ØªÙ…Ø±Ø§Ø±ÙŠØ©",
    lessons: [
      { id: "lesson-1-2", title: "Limite finie ou infinie en Â±âˆž", titleAr: "Ù†Ù‡Ø§ÙŠØ© Ù…Ù†ØªÙ‡ÙŠØ© Ø£Ùˆ ØºÙŠØ± Ù…Ù†ØªÙ‡ÙŠØ© Ø¹Ù†Ø¯ âˆž+ Ø£Ùˆ âˆž-" },
      { id: "lesson-1-3", title: "Limite finie ou infinie en un point", titleAr: "Ù†Ù‡Ø§ÙŠØ© Ù…Ù†ØªÙ‡ÙŠØ© Ø£Ùˆ ØºÙŠØ± Ù…Ù†ØªÙ‡ÙŠØ© Ø¹Ù†Ø¯ Ø¹Ø¯Ø¯ Ø­Ù‚ÙŠÙ‚ÙŠ" },
      { id: "lesson-1-4", title: "ComplÃ©ments sur les limites", titleAr: "ØªØªÙ…Ø§Øª Ø¹Ù„Ù‰ Ø§Ù„Ù†Ù‡Ø§ÙŠØ§Øª" },
      { id: "lesson-1-5", title: "Limite d'une fonction composÃ©e - Limites par comparaison", titleAr: "Ù†Ù‡Ø§ÙŠØ© Ø¯Ø§Ù„Ø© Ù…Ø±ÙƒØ¨Ø© - Ø§Ù„Ù†Ù‡Ø§ÙŠØ§Øª Ø¨Ø§Ù„Ù…Ù‚Ø§Ø±Ù†Ø©" },
      { id: "lesson-1-6", title: "ContinuitÃ©", titleAr: "Ø§Ù„Ø§Ø³ØªÙ…Ø±Ø§Ø±ÙŠØ©" },
      { id: "lesson-1-7", title: "ThÃ©orÃ¨me des valeurs intermÃ©diaires", titleAr: "Ù…Ø¨Ø±Ù‡Ù†Ø© Ø§Ù„Ù‚ÙŠÙ… Ø§Ù„Ù…ØªÙˆØ³Ø·Ø©" },
      { id: "lesson-1-8", title: "Fonctions continues et strictement monotones", titleAr: "Ø§Ù„Ø¯ÙˆØ§Ù„ Ø§Ù„Ù…Ø³ØªÙ…Ø±Ø© ÙˆØ§Ù„Ø±ØªÙŠØ¨Ø© ØªÙ…Ø§Ù…Ø§" },
    ],
  },
  {
    id: "chap-2-derivabilite",
    title: "DÃ©rivabilitÃ©",
    titleAr: "Ø§Ù„Ø§Ø´ØªÙ‚Ø§Ù‚ÙŠØ©",
    lessons: [
      { id: "lesson-2-1", title: "DÃ©rivabilitÃ©", titleAr: "Ø§Ù„Ø§Ø´ØªÙ‚Ø§Ù‚ÙŠØ©" },
      { id: "lesson-2-2", title: "DÃ©rivÃ©es et opÃ©rations", titleAr: "Ø§Ù„Ù…Ø´ØªÙ‚Ø§Øª ÙˆØ§Ù„Ø¹Ù…Ù„ÙŠØ§Øª" },
      { id: "lesson-2-3", title: "Sens de variation d'une fonction", titleAr: "Ø¥ØªØ¬Ø§Ù‡ Ø§Ù„ØªØºÙŠØ± Ø¯Ø§Ù„Ø©" },
      { id: "lesson-2-4", title: "DÃ©rivÃ©e d'une fonction composÃ©e", titleAr: "Ø§Ø´ØªÙ‚Ø§Ù‚ Ø¯Ø§Ù„Ø© Ù…Ø±ÙƒØ¨Ø©" },
      { id: "lesson-2-5", title: "Approximation affine - MÃ©thode d'Euler", titleAr: "Ø§Ù„ØªÙ‚Ø±ÙŠØ¨ Ø§Ù„ØªØ£Ù„ÙÙŠ - Ø·Ø±ÙŠÙ‚Ø© Ø£ÙˆÙ„Ø±" },
      { id: "lesson-2-6", title: "Ã‰tude de fonction trigonomÃ©trique", titleAr: "Ø¯Ø±Ø§Ø³Ø© Ø¯Ø§Ù„Ø© Ù…Ø«Ù„Ø«ÙŠØ©" },
    ],
  },
  {
    id: "chap-3-fonctions-exp-log",
    title: "Fonctions exponentielles et logarithmiques",
    titleAr: "Ø§Ù„Ø¯ÙˆØ§Ù„ Ø§Ù„Ø£Ø³ÙŠØ© ÙˆØ§Ù„Ù„ÙˆØºØ§Ø±ÙŠØªÙ…ÙŠØ©",
    lessons: [
      { id: "lesson-3-1", title: "Fonction exponentielle", titleAr: "Ø§Ù„Ø¯Ø§Ù„Ø© Ø§Ù„Ø£Ø³ÙŠØ©" },
      { id: "lesson-3-2", title: "Fonctions exponentielles x â†¦ e^x", titleAr: "Ø§Ù„Ø¯ÙˆØ§Ù„ Ø§Ù„Ø£Ø³ÙŠØ© x â†¦ e^x" },
      { id: "lesson-3-3", title: "Ã‰tude de la fonction exponentielle", titleAr: "Ø¯Ø±Ø§Ø³Ø© Ø§Ù„Ø¯Ø§Ù„Ø© Ø§Ù„Ø£Ø³ÙŠØ©" },
      { id: "lesson-3-4", title: "Ã‰tude de la fonction exp(u)", titleAr: "Ø¯Ø±Ø§Ø³Ø© Ø§Ù„Ø¯Ø§Ù„Ø© exp(u)" },
      { id: "lesson-3-5", title: "Fonction logarithme nÃ©pÃ©rien", titleAr: "Ø§Ù„Ø¯Ø§Ù„Ø© Ø§Ù„Ù„ÙˆØºØ§Ø±ÙŠØªÙ…ÙŠØ© Ø§Ù„Ù†ÙŠØ¨ÙŠØ±ÙŠØ©" },
      { id: "lesson-3-6", title: "PropriÃ©tÃ©s algÃ©briques", titleAr: "Ø§Ù„Ø®ÙˆØ§Øµ Ø§Ù„Ø¬Ø¨Ø±ÙŠØ©" },
      { id: "lesson-3-7", title: "Ã‰tude de la fonction logarithme nÃ©pÃ©rien", titleAr: "Ø¯Ø±Ø§Ø³Ø© Ø§Ù„Ø¯Ø§Ù„Ø© Ø§Ù„Ù„ÙˆØºØ§Ø±ÙŠØªÙ…ÙŠØ© Ø§Ù„Ù†ÙŠØ¨ÙŠØ±ÙŠØ©" },
      { id: "lesson-3-8", title: "Fonction logarithme dÃ©cimal", titleAr: "Ø§Ù„Ø¯Ø§Ù„Ø© Ø§Ù„Ù„ÙˆØºØ§Ø±ÙŠØªÙ…ÙŠØ© Ø§Ù„Ø¹Ø´Ø±ÙŠØ©" },
      { id: "lesson-3-9", title: "Ã‰tude de la fonction ln(u)", titleAr: "Ø¯Ø±Ø§Ø³Ø© Ø§Ù„Ø¯Ø§Ù„Ø© ln(u)" },
    ],
  },
  {
    id: "chap-4-croissance-comparee",
    title: "Croissance comparÃ©e",
    titleAr: "Ø§Ù„ØªØ²Ø§ÙŠØ¯ Ø§Ù„Ù…Ù‚Ø§Ø±Ù†",
    lessons: [
      { id: "lesson-4-1", title: "Puissances d'un nombre rÃ©el positif", titleAr: "Ù‚ÙˆÙ‰ Ø¹Ø¯Ø¯ Ø­Ù‚ÙŠÙ‚ÙŠ Ù…ÙˆØ¬Ø¨" },
      { id: "lesson-4-2", title: "Ã‰tude des fonctions x â†¦ a^x et x â†¦ â¿âˆšx", titleAr: "Ø¯Ø±Ø§Ø³Ø© Ø§Ù„Ø¯Ø§Ù„Ø© x â†¦ a^x Ùˆ x â†¦ â¿âˆšx" },
      { id: "lesson-4-3", title: "Croissance comparÃ©e", titleAr: "Ø§Ù„ØªØ²Ø§ÙŠØ¯ Ø§Ù„Ù…Ù‚Ø§Ø±Ù†" },
    ],
  },
  {
    id: "chap-5-primitives",
    title: "Primitives",
    titleAr: "Ø§Ù„Ø¯ÙˆØ§Ù„ Ø§Ù„Ø£ØµÙ„ÙŠØ©",
    lessons: [
      { id: "lesson-5-1", title: "Primitives", titleAr: "Ø§Ù„Ø¯ÙˆØ§Ù„ Ø§Ù„Ø£ØµÙ„ÙŠØ©" },
      { id: "lesson-5-2", title: "Calcul de primitives", titleAr: "Ø­Ø³Ø§Ø¨ Ø§Ù„Ø¯ÙˆØ§Ù„ Ø§Ù„Ø£ØµÙ„ÙŠØ©" },
      { id: "lesson-5-3", title: "Ã‰quations diffÃ©rentielles", titleAr: "Ø§Ù„Ù…Ø¹Ø§Ø¯Ù„Ø§Øª Ø§Ù„ØªÙØ§Ø¶Ù„ÙŠØ©" },
    ],
  },
  {
    id: "chap-6-calcul-integral",
    title: "Calcul intÃ©gral",
    titleAr: "Ø§Ù„Ø­Ø³Ø§Ø¨ Ø§Ù„ØªÙƒØ§Ù…Ù„ÙŠ",
    lessons: [
      { id: "lesson-6-1", title: "IntÃ©grale d'une fonction", titleAr: "ØªÙƒØ§Ù…Ù„ Ø¯Ø§Ù„Ø©" },
      { id: "lesson-6-2", title: "PropriÃ©tÃ©s de l'intÃ©grale", titleAr: "Ø®ÙˆØ§Øµ Ø§Ù„ØªÙƒØ§Ù…Ù„" },
      { id: "lesson-6-3", title: "Valeur moyenne", titleAr: "Ø§Ù„Ù‚ÙŠÙ…Ø© Ø§Ù„Ù…ØªÙˆØ³Ø·Ø©" },
      { id: "lesson-6-4", title: "Extension aux fonctions de signe quelconque", titleAr: "Ø§Ù„ØªÙ…Ø¯ÙŠØ¯ Ø¥Ù„Ù‰ Ø¯Ø§Ù„Ø© Ø¥Ø´Ø§Ø±ØªÙ‡Ø§ ÙƒÙŠÙÙŠØ©" },
      { id: "lesson-6-5", title: "Utilisation du calcul intÃ©gral pour le calcul de primitives", titleAr: "ØªÙˆØ¸ÙŠÙ Ø§Ù„Ø­Ø³Ø§Ø¨ Ø§Ù„ØªÙƒØ§Ù…Ù„ÙŠ Ù„Ø­Ø³Ø§Ø¨ Ø¯ÙˆØ§Ù„ Ø£ØµÙ„ÙŠØ©" },
      { id: "lesson-6-6", title: "Applications du calcul intÃ©gral", titleAr: "Ø¨Ø¹Ø¶ ØªØ·Ø¨ÙŠÙ‚Ø§Øª Ø§Ù„Ø­Ø³Ø§Ø¨ Ø§Ù„ØªÙƒØ§Ù…Ù„ÙŠ" },
    ],
  },
  {
    id: "chap-7-probabilites-conditionnelles",
    title: "ProbabilitÃ©s conditionnelles",
    titleAr: "Ø§Ù„Ø§Ø­ØªÙ…Ø§Ù„Ø§Øª Ø§Ù„Ø´Ø±Ø·ÙŠØ©",
    lessons: [
      { id: "lesson-7-1", title: "DÃ©nombrement (p-listes, arrangements, permutations)", titleAr: "Ø§Ù„Ø¹Ø¯ (Ø§Ù„Ù‚ÙˆØ§Ø¦Ù… - Ø§Ù„ØªØ±ØªÙŠØ¨Ø§Øª - Ø§Ù„ØªØ¨Ø¯ÙŠÙ„Ø§Øª)" },
      { id: "lesson-7-2", title: "Combinaisons - Formule du binÃ´me de Newton", titleAr: "Ø§Ù„ØªÙˆÙÙŠÙ‚Ø§Øª - Ø¯Ø³ØªÙˆØ± Ø«Ù†Ø§Ø¦ÙŠ Ø§Ù„Ø­Ø¯" },
      { id: "lesson-7-3", title: "ModÃ©lisation d'une expÃ©rience alÃ©atoire: variable alÃ©atoire, espÃ©rance et variance", titleAr: "Ù†Ù…Ø°Ø¬Ø© ØªØ¬Ø±Ø¨Ø© Ø¹Ø´ÙˆØ§Ø¦ÙŠØ©: Ø§Ù„Ù…ØªØºÙŠØ± Ø§Ù„Ø¹Ø´ÙˆØ§Ø¦ÙŠØŒ Ø§Ù„Ø£Ù…Ù„ Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠ ÙˆØ§Ù„ØªØ¨Ø§ÙŠÙ†" },
      { id: "lesson-7-4", title: "ProbabilitÃ©s conditionnelles", titleAr: "Ø§Ù„Ø§Ø­ØªÙ…Ø§Ù„Ø§Øª Ø§Ù„Ø´Ø±Ø·ÙŠØ©" },
      { id: "lesson-7-5", title: "Ã‰vÃ©nements indÃ©pendants et variables alÃ©atoires indÃ©pendantes", titleAr: "Ø§Ù„Ø­ÙˆØ§Ø¯Ø« Ø§Ù„Ù…Ø³ØªÙ‚Ù„Ø© ÙˆØ§Ù„Ù…ØªØºÙŠØ±Ø§Øª Ø§Ù„Ø¹Ø´ÙˆØ§Ø¦ÙŠØ© Ø§Ù„Ù…Ø³ØªÙ‚Ù„Ø©" },
    ],
  },
  {
    id: "chap-8-lois-probabilite",
    title: "Lois de probabilitÃ©",
    titleAr: "Ù‚ÙˆØ§Ù†ÙŠÙ† Ø§Ù„Ø§Ø­ØªÙ…Ø§Ù„",
    lessons: [
      { id: "lesson-8-1", title: "Loi de Bernoulli", titleAr: "Ù‚Ø§Ù†ÙˆÙ† Ø¨Ø±Ù†ÙˆÙ„ÙŠ" },
      { id: "lesson-8-2", title: "Lois de probabilitÃ© continues", titleAr: "Ù‚ÙˆØ§Ù†ÙŠÙ† Ø§Ù„Ø§Ø­ØªÙ…Ø§Ù„Ø§Øª Ø§Ù„Ù…Ø³ØªÙ…Ø±Ø©" },
      { id: "lesson-8-3", title: "AdÃ©quation Ã  une loi Ã©quirÃ©partie", titleAr: "Ù‚ÙŠØ§Ø³ ØªÙ„Ø§Ø¤Ù… Ø³Ù„Ø³Ù„Ø© Ù…Ø´Ø§Ù‡Ø¯Ø© ÙˆÙ†Ù…ÙˆØ°Ø¬ Ø§Ø­ØªÙ…Ø§Ù„ÙŠ" },
      { id: "lesson-8-4", title: "Loi exponentielle", titleAr: "Ø§Ù„Ù‚Ø§Ù†ÙˆÙ† Ø§Ù„Ø£Ø³ÙŠ" },
    ],
  },
];
