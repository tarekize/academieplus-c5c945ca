// Mathématiques - Terminale - Filière Mathématiques

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
    title: "Limites et continuité",
    titleAr: "Ø§Ù„Ù†Ù‡Ø§ÙŠØ§Øª ÙˆØ§Ù„Ø§Ø³ØªÙ…Ø±Ø§Ø±ÙŠØ©",
    lessons: [
      { id: "lesson-1-2", title: "Limite finie ou infinie en Â±âˆž", titleAr: "Ù†Ù‡Ø§ÙŠØ© Ù…Ù†ØªÙ‡ÙŠØ© Ø£Ùˆ ØºÙŠØ± Ù…Ù†ØªÙ‡ÙŠØ© Ø¹Ù†Ø¯ âˆž+ Ø£Ùˆ âˆž-" },
      { id: "lesson-1-3", title: "Limite finie ou infinie en un point", titleAr: "Ù†Ù‡Ø§ÙŠØ© Ù…Ù†ØªÙ‡ÙŠØ© Ø£Ùˆ ØºÙŠØ± Ù…Ù†ØªÙ‡ÙŠØ© Ø¹Ù†Ø¯ Ø¹Ø¯Ø¯ Ø­Ù‚ÙŠÙ‚ÙŠ" },
      { id: "lesson-1-4", title: "Compléments sur les limites", titleAr: "ØªØªÙ…Ø§Øª Ø¹Ù„Ù‰ Ø§Ù„Ù†Ù‡Ø§ÙŠØ§Øª" },
      { id: "lesson-1-5", title: "Limite d'une fonction composée - Limites par comparaison", titleAr: "Ù†Ù‡Ø§ÙŠØ© Ø¯Ø§Ù„Ø© Ù…Ø±ÙƒØ¨Ø© - Ø§Ù„Ù†Ù‡Ø§ÙŠØ§Øª Ø¨Ø§Ù„Ù…Ù‚Ø§Ø±Ù†Ø©" },
      { id: "lesson-1-6", title: "Continuité", titleAr: "Ø§Ù„Ø§Ø³ØªÙ…Ø±Ø§Ø±ÙŠØ©" },
      { id: "lesson-1-7", title: "Théorème des valeurs intermédiaires", titleAr: "Ù…Ø¨Ø±Ù‡Ù†Ø© Ø§Ù„Ù‚ÙŠÙ… Ø§Ù„Ù…ØªÙˆØ³Ø·Ø©" },
      { id: "lesson-1-8", title: "Fonctions continues et strictement monotones", titleAr: "Ø§Ù„Ø¯ÙˆØ§Ù„ Ø§Ù„Ù…Ø³ØªÙ…Ø±Ø© ÙˆØ§Ù„Ø±ØªÙŠØ¨Ø© ØªÙ…Ø§Ù…Ø§" },
    ],
  },
  {
    id: "chap-2-derivabilite",
    title: "Dérivabilité",
    titleAr: "Ø§Ù„Ø§Ø´ØªÙ‚Ø§Ù‚ÙŠØ©",
    lessons: [
      { id: "lesson-2-1", title: "Dérivabilité", titleAr: "Ø§Ù„Ø§Ø´ØªÙ‚Ø§Ù‚ÙŠØ©" },
      { id: "lesson-2-2", title: "Dérivées et opérations", titleAr: "Ø§Ù„Ù…Ø´ØªÙ‚Ø§Øª ÙˆØ§Ù„Ø¹Ù…Ù„ÙŠØ§Øª" },
      { id: "lesson-2-3", title: "Sens de variation d'une fonction", titleAr: "Ø¥ØªØ¬Ø§Ù‡ Ø§Ù„ØªØºÙŠØ± Ø¯Ø§Ù„Ø©" },
      { id: "lesson-2-4", title: "Dérivée d'une fonction composée", titleAr: "Ø§Ø´ØªÙ‚Ø§Ù‚ Ø¯Ø§Ù„Ø© Ù…Ø±ÙƒØ¨Ø©" },
      { id: "lesson-2-5", title: "Approximation affine - Méthode d'Euler", titleAr: "Ø§Ù„ØªÙ‚Ø±ÙŠØ¨ Ø§Ù„ØªØ£Ù„ÙÙŠ - Ø·Ø±ÙŠÙ‚Ø© Ø£ÙˆÙ„Ø±" },
      { id: "lesson-2-6", title: "Étude de fonction trigonométrique", titleAr: "Ø¯Ø±Ø§Ø³Ø© Ø¯Ø§Ù„Ø© Ù…Ø«Ù„Ø«ÙŠØ©" },
    ],
  },
  {
    id: "chap-3-fonctions-exp-log",
    title: "Fonctions exponentielles et logarithmiques",
    titleAr: "Ø§Ù„Ø¯ÙˆØ§Ù„ Ø§Ù„Ø£Ø³ÙŠØ© ÙˆØ§Ù„Ù„ÙˆØºØ§Ø±ÙŠØªÙ…ÙŠØ©",
    lessons: [
      { id: "lesson-3-1", title: "Fonction exponentielle", titleAr: "Ø§Ù„Ø¯Ø§Ù„Ø© Ø§Ù„Ø£Ø³ÙŠØ©" },
      { id: "lesson-3-2", title: "Fonctions exponentielles x â†¦ e^x", titleAr: "Ø§Ù„Ø¯ÙˆØ§Ù„ Ø§Ù„Ø£Ø³ÙŠØ© x â†¦ e^x" },
      { id: "lesson-3-3", title: "Étude de la fonction exponentielle", titleAr: "Ø¯Ø±Ø§Ø³Ø© Ø§Ù„Ø¯Ø§Ù„Ø© Ø§Ù„Ø£Ø³ÙŠØ©" },
      { id: "lesson-3-4", title: "Étude de la fonction exp(u)", titleAr: "Ø¯Ø±Ø§Ø³Ø© Ø§Ù„Ø¯Ø§Ù„Ø© exp(u)" },
      { id: "lesson-3-5", title: "Fonction logarithme népérien", titleAr: "Ø§Ù„Ø¯Ø§Ù„Ø© Ø§Ù„Ù„ÙˆØºØ§Ø±ÙŠØªÙ…ÙŠØ© Ø§Ù„Ù†ÙŠØ¨ÙŠØ±ÙŠØ©" },
      { id: "lesson-3-6", title: "Propriétés algébriques", titleAr: "Ø§Ù„Ø®ÙˆØ§Øµ Ø§Ù„Ø¬Ø¨Ø±ÙŠØ©" },
      { id: "lesson-3-7", title: "Étude de la fonction logarithme népérien", titleAr: "Ø¯Ø±Ø§Ø³Ø© Ø§Ù„Ø¯Ø§Ù„Ø© Ø§Ù„Ù„ÙˆØºØ§Ø±ÙŠØªÙ…ÙŠØ© Ø§Ù„Ù†ÙŠØ¨ÙŠØ±ÙŠØ©" },
      { id: "lesson-3-8", title: "Fonction logarithme décimal", titleAr: "Ø§Ù„Ø¯Ø§Ù„Ø© Ø§Ù„Ù„ÙˆØºØ§Ø±ÙŠØªÙ…ÙŠØ© Ø§Ù„Ø¹Ø´Ø±ÙŠØ©" },
      { id: "lesson-3-9", title: "Étude de la fonction ln(u)", titleAr: "Ø¯Ø±Ø§Ø³Ø© Ø§Ù„Ø¯Ø§Ù„Ø© ln(u)" },
    ],
  },
  {
    id: "chap-4-croissance-comparee",
    title: "Croissance comparée",
    titleAr: "Ø§Ù„ØªØ²Ø§ÙŠØ¯ Ø§Ù„Ù…Ù‚Ø§Ø±Ù†",
    lessons: [
      { id: "lesson-4-1", title: "Puissances d'un nombre réel positif", titleAr: "Ù‚ÙˆÙ‰ Ø¹Ø¯Ø¯ Ø­Ù‚ÙŠÙ‚ÙŠ Ù…ÙˆØ¬Ø¨" },
      { id: "lesson-4-2", title: "Étude des fonctions x â†¦ a^x et x â†¦ â¿âˆšx", titleAr: "Ø¯Ø±Ø§Ø³Ø© Ø§Ù„Ø¯Ø§Ù„Ø© x â†¦ a^x Ùˆ x â†¦ â¿âˆšx" },
      { id: "lesson-4-3", title: "Croissance comparée", titleAr: "Ø§Ù„ØªØ²Ø§ÙŠØ¯ Ø§Ù„Ù…Ù‚Ø§Ø±Ù†" },
    ],
  },
  {
    id: "chap-5-primitives",
    title: "Primitives",
    titleAr: "Ø§Ù„Ø¯ÙˆØ§Ù„ Ø§Ù„Ø£ØµÙ„ÙŠØ©",
    lessons: [
      { id: "lesson-5-1", title: "Primitives", titleAr: "Ø§Ù„Ø¯ÙˆØ§Ù„ Ø§Ù„Ø£ØµÙ„ÙŠØ©" },
      { id: "lesson-5-2", title: "Calcul de primitives", titleAr: "Ø­Ø³Ø§Ø¨ Ø§Ù„Ø¯ÙˆØ§Ù„ Ø§Ù„Ø£ØµÙ„ÙŠØ©" },
      { id: "lesson-5-3", title: "Équations différentielles", titleAr: "Ø§Ù„Ù…Ø¹Ø§Ø¯Ù„Ø§Øª Ø§Ù„ØªÙØ§Ø¶Ù„ÙŠØ©" },
    ],
  },
  {
    id: "chap-6-calcul-integral",
    title: "Calcul intégral",
    titleAr: "Ø§Ù„Ø­Ø³Ø§Ø¨ Ø§Ù„ØªÙƒØ§Ù…Ù„ÙŠ",
    lessons: [
      { id: "lesson-6-1", title: "Intégrale d'une fonction", titleAr: "ØªÙƒØ§Ù…Ù„ Ø¯Ø§Ù„Ø©" },
      { id: "lesson-6-2", title: "Propriétés de l'intégrale", titleAr: "Ø®ÙˆØ§Øµ Ø§Ù„ØªÙƒØ§Ù…Ù„" },
      { id: "lesson-6-3", title: "Valeur moyenne", titleAr: "Ø§Ù„Ù‚ÙŠÙ…Ø© Ø§Ù„Ù…ØªÙˆØ³Ø·Ø©" },
      { id: "lesson-6-4", title: "Extension aux fonctions de signe quelconque", titleAr: "Ø§Ù„ØªÙ…Ø¯ÙŠØ¯ Ø¥Ù„Ù‰ Ø¯Ø§Ù„Ø© Ø¥Ø´Ø§Ø±ØªÙ‡Ø§ ÙƒÙŠÙÙŠØ©" },
      { id: "lesson-6-5", title: "Utilisation du calcul intégral pour le calcul de primitives", titleAr: "ØªÙˆØ¸ÙŠÙ Ø§Ù„Ø­Ø³Ø§Ø¨ Ø§Ù„ØªÙƒØ§Ù…Ù„ÙŠ Ù„Ø­Ø³Ø§Ø¨ Ø¯ÙˆØ§Ù„ Ø£ØµÙ„ÙŠØ©" },
      { id: "lesson-6-6", title: "Applications du calcul intégral", titleAr: "Ø¨Ø¹Ø¶ ØªØ·Ø¨ÙŠÙ‚Ø§Øª Ø§Ù„Ø­Ø³Ø§Ø¨ Ø§Ù„ØªÙƒØ§Ù…Ù„ÙŠ" },
    ],
  },
  {
    id: "chap-7-probabilites-conditionnelles",
    title: "Probabilités conditionnelles",
    titleAr: "Ø§Ù„Ø§Ø­ØªÙ…Ø§Ù„Ø§Øª Ø§Ù„Ø´Ø±Ø·ÙŠØ©",
    lessons: [
      { id: "lesson-7-1", title: "Dénombrement (p-listes, arrangements, permutations)", titleAr: "Ø§Ù„Ø¹Ø¯ (Ø§Ù„Ù‚ÙˆØ§Ø¦Ù… - Ø§Ù„ØªØ±ØªÙŠØ¨Ø§Øª - Ø§Ù„ØªØ¨Ø¯ÙŠÙ„Ø§Øª)" },
      { id: "lesson-7-2", title: "Combinaisons - Formule du binôme de Newton", titleAr: "Ø§Ù„ØªÙˆÙÙŠÙ‚Ø§Øª - Ø¯Ø³ØªÙˆØ± Ø«Ù†Ø§Ø¦ÙŠ Ø§Ù„Ø­Ø¯" },
      { id: "lesson-7-3", title: "Modélisation d'une expérience aléatoire: variable aléatoire, espérance et variance", titleAr: "Ù†Ù…Ø°Ø¬Ø© ØªØ¬Ø±Ø¨Ø© Ø¹Ø´ÙˆØ§Ø¦ÙŠØ©: Ø§Ù„Ù…ØªØºÙŠØ± Ø§Ù„Ø¹Ø´ÙˆØ§Ø¦ÙŠØŒ Ø§Ù„Ø£Ù…Ù„ Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠ ÙˆØ§Ù„ØªØ¨Ø§ÙŠÙ†" },
      { id: "lesson-7-4", title: "Probabilités conditionnelles", titleAr: "Ø§Ù„Ø§Ø­ØªÙ…Ø§Ù„Ø§Øª Ø§Ù„Ø´Ø±Ø·ÙŠØ©" },
      { id: "lesson-7-5", title: "Événements indépendants et variables aléatoires indépendantes", titleAr: "Ø§Ù„Ø­ÙˆØ§Ø¯Ø« Ø§Ù„Ù…Ø³ØªÙ‚Ù„Ø© ÙˆØ§Ù„Ù…ØªØºÙŠØ±Ø§Øª Ø§Ù„Ø¹Ø´ÙˆØ§Ø¦ÙŠØ© Ø§Ù„Ù…Ø³ØªÙ‚Ù„Ø©" },
    ],
  },
  {
    id: "chap-8-lois-probabilite",
    title: "Lois de probabilité",
    titleAr: "Ù‚ÙˆØ§Ù†ÙŠÙ† Ø§Ù„Ø§Ø­ØªÙ…Ø§Ù„",
    lessons: [
      { id: "lesson-8-1", title: "Loi de Bernoulli", titleAr: "Ù‚Ø§Ù†ÙˆÙ† Ø¨Ø±Ù†ÙˆÙ„ÙŠ" },
      { id: "lesson-8-2", title: "Lois de probabilité continues", titleAr: "Ù‚ÙˆØ§Ù†ÙŠÙ† Ø§Ù„Ø§Ø­ØªÙ…Ø§Ù„Ø§Øª Ø§Ù„Ù…Ø³ØªÙ…Ø±Ø©" },
      { id: "lesson-8-3", title: "Adéquation Ã  une loi équirépartie", titleAr: "Ù‚ÙŠØ§Ø³ ØªÙ„Ø§Ø¤Ù… Ø³Ù„Ø³Ù„Ø© Ù…Ø´Ø§Ù‡Ø¯Ø© ÙˆÙ†Ù…ÙˆØ°Ø¬ Ø§Ø­ØªÙ…Ø§Ù„ÙŠ" },
      { id: "lesson-8-4", title: "Loi exponentielle", titleAr: "Ø§Ù„Ù‚Ø§Ù†ÙˆÙ† Ø§Ù„Ø£Ø³ÙŠ" },
    ],
  },
];
