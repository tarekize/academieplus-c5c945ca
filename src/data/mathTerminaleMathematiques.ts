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
    titleAr: "اÙ„Ù†Ù‡اÙŠات ÙˆاÙ„استÙ…رارÙŠة",
    lessons: [
      { id: "lesson-1-2", title: "Limite finie ou infinie en ±âˆž", titleAr: "Ù†Ù‡اÙŠة Ù…Ù†تÙ‡ÙŠة أÙˆ غÙŠر Ù…Ù†تÙ‡ÙŠة عÙ†د âˆž+ أÙˆ âˆž-" },
      { id: "lesson-1-3", title: "Limite finie ou infinie en un point", titleAr: "Ù†Ù‡اÙŠة Ù…Ù†تÙ‡ÙŠة أÙˆ غÙŠر Ù…Ù†تÙ‡ÙŠة عÙ†د عدد حÙ‚ÙŠÙ‚ÙŠ" },
      { id: "lesson-1-4", title: "Compléments sur les limites", titleAr: "تتÙ…ات عÙ„Ù‰ اÙ„Ù†Ù‡اÙŠات" },
      { id: "lesson-1-5", title: "Limite d'une fonction composée - Limites par comparaison", titleAr: "Ù†Ù‡اÙŠة داÙ„ة Ù…رÙƒبة - اÙ„Ù†Ù‡اÙŠات باÙ„Ù…Ù‚ارÙ†ة" },
      { id: "lesson-1-6", title: "Continuité", titleAr: "اÙ„استÙ…رارÙŠة" },
      { id: "lesson-1-7", title: "Théorème des valeurs intermédiaires", titleAr: "Ù…برÙ‡Ù†ة اÙ„Ù‚ÙŠÙ… اÙ„Ù…تÙˆسطة" },
      { id: "lesson-1-8", title: "Fonctions continues et strictement monotones", titleAr: "اÙ„دÙˆاÙ„ اÙ„Ù…ستÙ…رة ÙˆاÙ„رتÙŠبة تÙ…اÙ…ا" },
    ],
  },
  {
    id: "chap-2-derivabilite",
    title: "Dérivabilité",
    titleAr: "اÙ„اشتÙ‚اÙ‚ÙŠة",
    lessons: [
      { id: "lesson-2-1", title: "Dérivabilité", titleAr: "اÙ„اشتÙ‚اÙ‚ÙŠة" },
      { id: "lesson-2-2", title: "Dérivées et opérations", titleAr: "اÙ„Ù…شتÙ‚ات ÙˆاÙ„عÙ…Ù„ÙŠات" },
      { id: "lesson-2-3", title: "Sens de variation d'une fonction", titleAr: "إتجاÙ‡ اÙ„تغÙŠر داÙ„ة" },
      { id: "lesson-2-4", title: "Dérivée d'une fonction composée", titleAr: "اشتÙ‚اÙ‚ داÙ„ة Ù…رÙƒبة" },
      { id: "lesson-2-5", title: "Approximation affine - Méthode d'Euler", titleAr: "اÙ„تÙ‚رÙŠب اÙ„تأÙ„فÙŠ - طرÙŠÙ‚ة أÙˆÙ„ر" },
      { id: "lesson-2-6", title: "Étude de fonction trigonométrique", titleAr: "دراسة داÙ„ة Ù…ثÙ„ثÙŠة" },
    ],
  },
  {
    id: "chap-3-fonctions-exp-log",
    title: "Fonctions exponentielles et logarithmiques",
    titleAr: "اÙ„دÙˆاÙ„ اÙ„أسÙŠة ÙˆاÙ„Ù„ÙˆغارÙŠتÙ…ÙŠة",
    lessons: [
      { id: "lesson-3-1", title: "Fonction exponentielle", titleAr: "اÙ„داÙ„ة اÙ„أسÙŠة" },
      { id: "lesson-3-2", title: "Fonctions exponentielles x â†¦ e^x", titleAr: "اÙ„دÙˆاÙ„ اÙ„أسÙŠة x â†¦ e^x" },
      { id: "lesson-3-3", title: "Étude de la fonction exponentielle", titleAr: "دراسة اÙ„داÙ„ة اÙ„أسÙŠة" },
      { id: "lesson-3-4", title: "Étude de la fonction exp(u)", titleAr: "دراسة اÙ„داÙ„ة exp(u)" },
      { id: "lesson-3-5", title: "Fonction logarithme népérien", titleAr: "اÙ„داÙ„ة اÙ„Ù„ÙˆغارÙŠتÙ…ÙŠة اÙ„Ù†ÙŠبÙŠرÙŠة" },
      { id: "lesson-3-6", title: "Propriétés algébriques", titleAr: "اÙ„خÙˆاص اÙ„جبرÙŠة" },
      { id: "lesson-3-7", title: "Étude de la fonction logarithme népérien", titleAr: "دراسة اÙ„داÙ„ة اÙ„Ù„ÙˆغارÙŠتÙ…ÙŠة اÙ„Ù†ÙŠبÙŠرÙŠة" },
      { id: "lesson-3-8", title: "Fonction logarithme décimal", titleAr: "اÙ„داÙ„ة اÙ„Ù„ÙˆغارÙŠتÙ…ÙŠة اÙ„عشرÙŠة" },
      { id: "lesson-3-9", title: "Étude de la fonction ln(u)", titleAr: "دراسة اÙ„داÙ„ة ln(u)" },
    ],
  },
  {
    id: "chap-4-croissance-comparee",
    title: "Croissance comparée",
    titleAr: "اÙ„تزاÙŠد اÙ„Ù…Ù‚ارÙ†",
    lessons: [
      { id: "lesson-4-1", title: "Puissances d'un nombre réel positif", titleAr: "Ù‚ÙˆÙ‰ عدد حÙ‚ÙŠÙ‚ÙŠ Ù…Ùˆجب" },
      { id: "lesson-4-2", title: "Étude des fonctions x â†¦ a^x et x â†¦ ⁿâˆšx", titleAr: "دراسة اÙ„داÙ„ة x â†¦ a^x Ùˆ x â†¦ ⁿâˆšx" },
      { id: "lesson-4-3", title: "Croissance comparée", titleAr: "اÙ„تزاÙŠد اÙ„Ù…Ù‚ارÙ†" },
    ],
  },
  {
    id: "chap-5-primitives",
    title: "Primitives",
    titleAr: "اÙ„دÙˆاÙ„ اÙ„أصÙ„ÙŠة",
    lessons: [
      { id: "lesson-5-1", title: "Primitives", titleAr: "اÙ„دÙˆاÙ„ اÙ„أصÙ„ÙŠة" },
      { id: "lesson-5-2", title: "Calcul de primitives", titleAr: "حساب اÙ„دÙˆاÙ„ اÙ„أصÙ„ÙŠة" },
      { id: "lesson-5-3", title: "Équations différentielles", titleAr: "اÙ„Ù…عادÙ„ات اÙ„تفاضÙ„ÙŠة" },
    ],
  },
  {
    id: "chap-6-calcul-integral",
    title: "Calcul intégral",
    titleAr: "اÙ„حساب اÙ„تÙƒاÙ…Ù„ÙŠ",
    lessons: [
      { id: "lesson-6-1", title: "Intégrale d'une fonction", titleAr: "تÙƒاÙ…Ù„ داÙ„ة" },
      { id: "lesson-6-2", title: "Propriétés de l'intégrale", titleAr: "خÙˆاص اÙ„تÙƒاÙ…Ù„" },
      { id: "lesson-6-3", title: "Valeur moyenne", titleAr: "اÙ„Ù‚ÙŠÙ…ة اÙ„Ù…تÙˆسطة" },
      { id: "lesson-6-4", title: "Extension aux fonctions de signe quelconque", titleAr: "اÙ„تÙ…دÙŠد إÙ„Ù‰ داÙ„ة إشارتÙ‡ا ÙƒÙŠفÙŠة" },
      { id: "lesson-6-5", title: "Utilisation du calcul intégral pour le calcul de primitives", titleAr: "تÙˆظÙŠف اÙ„حساب اÙ„تÙƒاÙ…Ù„ÙŠ Ù„حساب دÙˆاÙ„ أصÙ„ÙŠة" },
      { id: "lesson-6-6", title: "Applications du calcul intégral", titleAr: "بعض تطبÙŠÙ‚ات اÙ„حساب اÙ„تÙƒاÙ…Ù„ÙŠ" },
    ],
  },
  {
    id: "chap-7-probabilites-conditionnelles",
    title: "Probabilités conditionnelles",
    titleAr: "اÙ„احتÙ…اÙ„ات اÙ„شرطÙŠة",
    lessons: [
      { id: "lesson-7-1", title: "Dénombrement (p-listes, arrangements, permutations)", titleAr: "اÙ„عد (اÙ„Ù‚ÙˆائÙ… - اÙ„ترتÙŠبات - اÙ„تبدÙŠÙ„ات)" },
      { id: "lesson-7-2", title: "Combinaisons - Formule du binôme de Newton", titleAr: "اÙ„تÙˆفÙŠÙ‚ات - دستÙˆر ثÙ†ائÙŠ اÙ„حد" },
      { id: "lesson-7-3", title: "Modélisation d'une expérience aléatoire: variable aléatoire, espérance et variance", titleAr: "Ù†Ù…ذجة تجربة عشÙˆائÙŠة: اÙ„Ù…تغÙŠر اÙ„عشÙˆائÙŠØŒ اÙ„أÙ…Ù„ اÙ„رÙŠاضÙŠ ÙˆاÙ„تباÙŠÙ†" },
      { id: "lesson-7-4", title: "Probabilités conditionnelles", titleAr: "اÙ„احتÙ…اÙ„ات اÙ„شرطÙŠة" },
      { id: "lesson-7-5", title: "Événements indépendants et variables aléatoires indépendantes", titleAr: "اÙ„حÙˆادث اÙ„Ù…ستÙ‚Ù„ة ÙˆاÙ„Ù…تغÙŠرات اÙ„عشÙˆائÙŠة اÙ„Ù…ستÙ‚Ù„ة" },
    ],
  },
  {
    id: "chap-8-lois-probabilite",
    title: "Lois de probabilité",
    titleAr: "Ù‚ÙˆاÙ†ÙŠÙ† اÙ„احتÙ…اÙ„",
    lessons: [
      { id: "lesson-8-1", title: "Loi de Bernoulli", titleAr: "Ù‚اÙ†ÙˆÙ† برÙ†ÙˆÙ„ÙŠ" },
      { id: "lesson-8-2", title: "Lois de probabilité continues", titleAr: "Ù‚ÙˆاÙ†ÙŠÙ† اÙ„احتÙ…اÙ„ات اÙ„Ù…ستÙ…رة" },
      { id: "lesson-8-3", title: "Adéquation à une loi équirépartie", titleAr: "Ù‚ÙŠاس تÙ„اؤÙ… سÙ„سÙ„ة Ù…شاÙ‡دة ÙˆÙ†Ù…Ùˆذج احتÙ…اÙ„ÙŠ" },
      { id: "lesson-8-4", title: "Loi exponentielle", titleAr: "اÙ„Ù‚اÙ†ÙˆÙ† اÙ„أسÙŠ" },
    ],
  },
];
