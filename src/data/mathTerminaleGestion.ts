
// Mathématiques - Terminale - Filière Gestion

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

export const mathTerminaleGestionChapters: Chapter[] = [
  {
    id: "chap-1-suites-numeriques",
    title: "Suites numériques",
    titleAr: "اÙ„Ù…تتاÙ„ÙŠات اÙ„عددÙŠة",
    lessons: [
      { id: "lesson-1-1", title: "Généralités sur les suites arithmétiques et géométriques", titleAr: "عÙ…ÙˆÙ…ÙŠات حÙˆÙ„ اÙ„Ù…تتاÙ„ÙŠات اÙ„حسابÙŠة ÙˆاÙ„Ù…تتاÙ„ÙŠات اÙ„Ù‡Ù†دسÙŠة" },
      { id: "lesson-1-2", title: "Raisonnement par récurrence", titleAr: "اÙ„استدÙ„اÙ„ باÙ„تراجع" },
      { id: "lesson-1-3", title: "Suites bornées", titleAr: "اÙ„Ù…تتاÙ„ÙŠات اÙ„Ù…حدÙˆدة" },
      { id: "lesson-1-4", title: "Suites monotones", titleAr: "اÙ„Ù…تتاÙ„ÙŠات اÙ„رتÙŠبة" },
      { id: "lesson-1-5", title: "Suites convergentes", titleAr: "اÙ„Ù…تتاÙ„ÙŠات اÙ„Ù…تÙ‚اربة" },
      { id: "lesson-1-6", title: "Suite définie par Un+1 = aUn + b", titleAr: "اÙ„تعرف عÙ„Ù‰ Ù…تتاÙ„ÙŠة Ù…عرفة باÙ„عÙ„اÙ‚ة : Un+1= aUn+bÙˆ حساب حدÙˆدÙ‡ا" },
      { id: "lesson-1-7", title: "Convergence d'une suite récurrente un+1=f(un)", titleAr: "تÙ‚ارب Ù…تتاÙ„ÙŠة تراجعÙŠة 𝐮𝐧+ðŸ=f(un) باÙ„استعاÙ†ة باÙ„داÙ„ة" },
    ],
  },
  {
    id: "chap-2-derivabilite-continuite",
    title: "Dérivabilité et continuité",
    titleAr: "اÙ„اشتÙ‚اÙ‚ÙŠة ÙˆاÙ„استÙ…رارÙŠة",
    lessons: [
      { id: "lesson-2-1", title: "Rappel sur la dérivation", titleAr: "اÙ„اشتÙ‚اÙ‚ÙŠة تذÙƒÙŠر: اÙ„عدد اÙ„Ù…شتÙ‚ (تعرÙŠف ÙˆÙ‚راءة بÙŠاÙ†ÙŠة)" },
      { id: "lesson-2-2", title: "Fonctions dérivées", titleAr: "اÙ„دÙˆاÙ„ اÙ„Ù…شتÙ‚ة" },
      { id: "lesson-2-3", title: "Dérivées et extrema locaux", titleAr: "اÙ„Ù…شتÙ‚ات ÙˆاÙ„Ù‚ÙŠÙ… اÙ„حدÙŠة اÙ„Ù…حÙ„ÙŠة" },
      { id: "lesson-2-4", title: "Composition de fonctions et dérivation", titleAr: "Ù…رÙƒب داÙ„تÙŠÙ†ØŒ اشتÙ‚اÙ‚ داÙ„ة Ù…رÙƒبة" },
      { id: "lesson-2-5", title: "Continuité et théorème des valeurs intermédiaires", titleAr: "اÙ„إستÙ…رارÙŠة: Ù…برÙ‡Ù†ة اÙ„Ù‚ÙŠÙ… اÙ„Ù…تÙˆسطة" },
    ],
  },
  {
    id: "chap-3-limites",
    title: "Nombres",
    titleAr: "اÙ„Ù†Ù‡اÙŠات",
    lessons: [
      { id: "lesson-3-1", title: "Opérations sur les limites", titleAr: "اÙ„عÙ…Ù„ÙŠات عÙ„Ù‰ اÙ„Ù†Ù‡اÙŠات: Ù†Ù‡اÙŠة داÙ„ة Ù…رÙƒبة ÙˆاÙ„Ù†Ù‡اÙŠة باÙ„Ù…Ù‚ارÙ†ة" },
      { id: "lesson-3-2", title: "Asymptotes", titleAr: "اÙ„Ù…ستÙ‚ÙŠÙ…ات اÙ„Ù…Ù‚اربة" },
    ],
  },
  {
    id: "chap-4-etude-de-fonctions",
    title: "Étude de fonctions",
    titleAr: "دراسة اÙ„دÙˆاÙ„",
    lessons: [
      { id: "lesson-4-1", title: "Asymptote oblique", titleAr: "إثبات ÙˆجÙˆد Ù…ستÙ‚ÙŠÙ… Ù…Ù‚ارب Ù…ائÙ„ باÙ„Ù†سبة إÙ„Ù‰ Ù…Ù†حÙ† Ù…Ù…ثÙ„ Ù„داÙ„ة ÙˆتعÙŠÙŠÙ† Ù…عادÙ„ة Ù„Ù‡" },
    ],
  },
  {
    id: "chap-5-primitives-integrales",
    title: "Primitives et intégrales",
    titleAr: "اÙ„دÙˆاÙ„ اÙ„أصÙ„ÙŠة ÙˆاÙ„تÙƒاÙ…Ù„ات",
    lessons: [
      { id: "lesson-5-1", title: "Primitives d'une fonction", titleAr: "اÙ„دÙˆاÙ„ اÙ„أصÙ„ÙŠة Ù„داÙ„ة عÙ„Ù‰ Ù…جاÙ„" },
      { id: "lesson-5-2", title: "Calcul de primitives de fonctions simples", titleAr: "حساب دÙˆاÙ„ اصÙ„ة Ù„دÙˆاÙ„ بسÙŠطة" },
      { id: "lesson-5-3", title: "Propriétés de l'intégrale", titleAr: "خÙˆاص اÙ„تÙƒاÙ…Ù„: اÙ„خطÙŠة - عÙ„اÙ‚ةشاÙ„- اÙ„ترتÙŠب" },
      { id: "lesson-5-4", "title": "Application de l'intégrale au calcul d'aires", "titleAr": "تÙˆظÙŠف اÙ„تÙƒاÙ…Ù„ فÙ‰ حساب اÙ„Ù…ساحات" },
    ],
  },
  {
    id: "chap-6-fonctions-log-exp",
    title: "Fonctions logarithmiques et exponentielles",
    titleAr: "اÙ„دÙˆاÙ„ اÙ„Ù„ÙˆغارتÙ…ÙŠة ÙˆاÙ„أسÙŠة",
    lessons: [
      { id: "lesson-6-1", title: "Fonction logarithme népérien", titleAr: "اÙ„داÙ„ة اÙ„Ù„ÙˆغارÙŠتÙ…ÙŠة اÙ„Ù†ÙŠبÙŠرÙŠة" },
      { id: "lesson-6-2", title: "Étude de la fonction ln", titleAr: "دراسة دÙˆاÙ„ Ù…Ù† اÙ„شÙƒÙ„: In" },
      { id: "lesson-6-3", title: "Étude de la fonction ln(u)", titleAr: "دراسة دÙˆاÙ„ Ù…Ù† اÙ„شÙƒÙ„ Inou" },
      { id: "lesson-6-4", title: "Fonction logarithme de base a et décimal", titleAr: "اÙ„داÙ„ة اÙ„Ù„ÙˆغارÙŠتÙ…ÙŠة ذات اÙ„أساس Ù‡. اÙ„داÙ„ة اÙ„Ù„ÙˆغارÙŠتÙ… اÙ„عشرÙŠ." },
      { id: "lesson-6-5", title: "Fonctions exponentielles", titleAr: "اÙ„دÙˆاÙ„ اÙ„أسÙŠة" },
      { id: "lesson-6-6", title: "Étude de la fonction exponentielle", titleAr: "اÙ„دراسة ÙˆاÙ„تÙ…ثÙŠÙ„ اÙ„بÙŠاÙ†Ù‰ Ù„Ù„داÙ„ة اÙ„اسÙŠة" },
    ],
  },
  {
    id: "chap-7-statistiques",
    title: "Statistiques",
    titleAr: "اÙ„إحصاء",
    lessons: [
      { id: "lesson-7-1", title: "Série statistique à deux variables", titleAr: "تعرÙŠف سÙ„سÙ„ة إحصائÙŠة Ù„Ù…تغÙŠرÙŠÙ† حÙ‚ÙŠÙ‚ÙŠÙŠÙ†" },
      { id: "lesson-7-2", title: "Nuage de points", titleAr: "تÙ…ثÙŠÙ„ سÙ„سÙ„ة إحصائÙŠة Ù„Ù…تغÙŠرÙŠÙ† حÙ‚ÙŠÙ‚ÙŠÙŠÙ† بسحابة Ù†Ù‚ط" },
      { id: "lesson-7-3", title: "Point moyen", titleAr: "تعÙŠÙŠÙ† إحداثÙŠÙŠ اÙ„Ù†Ù‚طة اÙ„Ù…تÙˆسطة" },
      { id: "lesson-7-4", title: "Ajustement linéaire", titleAr: "إÙ†شاء Ù…ستÙ‚ÙŠÙ… تعدÙŠÙ„ خطÙŠ" },
      { id: "lesson-7-5", title: "Exemples de séries statistiques", titleAr: "أÙ…ثÙ„ة Ù„سÙ„اسÙ„ احصائÙŠة Ù…Ù† اÙ„شÙƒÙ„ (X;Iny) أÙˆ (InX;Y)" },
    ],
  },
  {
    id: "chap-8-probabilites",
    title: "Probabilités",
    titleAr: "اÙ„إحتÙ…اÙ„ات",
    lessons: [
      { id: "lesson-8-1", title: "Loi de probabilité", titleAr: "Ù‚اÙ†ÙˆÙ† احتÙ…اÙ„ Ù…رفÙ‚ بتجربة عشÙˆائÙŠة" },
      { id: "lesson-8-2", title: "Espérance, variance et écart type", titleAr: "اÙ„أÙ…Ù„ اÙ„رÙŠاضÙŠاتÙŠ ÙˆاÙ„تباÙŠÙ† ÙˆاÙ„اÙ†حراف اÙ„Ù…عÙŠارÙŠ" },
      { id: "lesson-8-3", title: "Probabilité conditionnelle", titleAr: "اÙ„احتÙ…اÙ„ اÙ„شرطÙŠ" },
      { id: "lesson-8-4", title: "Arbre pondéré", titleAr: "اÙ„شجرة اÙ„Ù…تÙˆازÙ†ة" },
      { id: "lesson-8-5", title: "Formule des probabilités totales", titleAr: "استعÙ…اÙ„ أشجار Ù…تÙˆازÙ†ة أÙˆ دستÙˆر اÙ„احتÙ…اÙ„ات اÙ„ÙƒÙ„ÙŠة" },
      { id: "lesson-8-6", title: "Indépendance de deux événements", titleAr: "استÙ‚Ù„اÙ„ حادثتÙŠÙ†" },
    ],
  },
];
