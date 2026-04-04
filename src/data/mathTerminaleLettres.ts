// Mathématiques - Terminale - Filière Lettres

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
    title: "Suites numériques",
    titleAr: "اÙ„Ù…تتاÙ„ÙŠات اÙ„عددÙŠة",
    lessons: [
      { id: "lesson-1-1", title: "Génération et reconnaissance de suites", titleAr: "تÙˆÙ„ÙŠد Ù…تتاÙ„ÙŠة: اÙ„تعرف عÙ„Ù‰ Ù…تتاÙ„ÙŠات" },
      { id: "lesson-1-2", title: "Suites arithmétiques : Définition, terme général, moyenne arithmétique", titleAr: "اÙ„Ù…تتاÙ„ÙŠات اÙ„حسابÙŠة: اÙ„تعرÙŠف ØŒ اÙ„حد اÙ„عاÙ… Ø› اÙ„Ùˆسط اÙ„حسابÙŠ" },
      { id: "lesson-1-3", title: "Somme des premiers termes d'une suite arithmétique", titleAr: "حساب Ù…جÙ…Ùˆع اÙ„حدÙˆد اÙ„اÙˆÙ„Ù‰ Ù…Ù† Ù…تتاÙ„ÙŠة حسابÙŠة" },
      { id: "lesson-1-4", title: "Suites géométriques : Définition, terme général, moyenne géométrique", titleAr: "اÙ„Ù…تتاÙ„ÙŠات اÙ„Ù‡Ù†دسÙŠة: اÙ„تعرÙŠف ØŒ اÙ„حد اÙ„عاÙ…Ø› اÙ„Ùˆسط اÙ„Ù‡Ù†دسÙŠ" },
      { id: "lesson-1-5", title: "Somme des premiers termes d'une suite géométrique", titleAr: "حساب Ù…جÙ…Ùˆع اÙ„حدÙˆد اÙ„اÙˆÙ„Ù‰ Ù…Ù† Ù…تتاÙ„ÙŠة Ù‡Ù†دسÙŠة" },
      { id: "lesson-1-6", title: "Suites récurrentes : Reconnaissance et calcul des premiers termes", titleAr: "اÙ„تعرÙ‘ف عÙ„Ù‰ Ù…تتاÙ„ÙŠة باÙ„تراجع - حساب اÙ„حدÙˆد اÙ„أÙˆÙ„Ù‰" },
      { id: "lesson-1-7", title: "Monotonie d'une suite : sens de variation", titleAr: "Ù…فÙ‡ÙˆÙ… اÙ„Ù…تتاÙ„ÙŠة اÙ„رتÙŠبة ÙˆتعÙŠÙŠÙ† اتجاÙ‡ تغÙŠÙ‘رÙ‡ا" },
      { id: "lesson-1-8", title: "Sens de variation d'une suite arithmétique et géométrique", titleAr: "تحدÙŠد اتجاÙ‡ تغÙŠÙ‘ر Ù…تتاÙ„ÙŠة حسابÙŠة ÙˆÙ‡Ù†دسÙŠة" },
      { id: "lesson-1-9", title: "Application des suites à la résolution de problèmes", titleAr: "استعÙ…اÙ„ اÙ„Ù…تتاÙ„ÙŠات اÙ„حسابÙŠة ÙˆاÙ„Ù‡Ù†دسÙŠة فÙŠ حÙ„ اÙ„Ù…شÙƒÙ„ات" },
      { id: "lesson-1-10", title: "Suites arithmotico-géométriques (Un+1 = aUn + b)", titleAr: "اÙ„Ù…تتاÙ„ÙŠات Ù…Ù† اÙ„شÙƒÙ„ Un+1=a Un +b" },
      { id: "lesson-1-11", title: "Résolution de problèmes avec les suites arithmotico-géométriques", titleAr: "حÙ„ Ù…شÙƒÙ„ات تُستعÙ…Ù„ فÙŠÙ‡ا Ù…تتاÙ„ÙŠات Ù…Ù† اÙ„شÙƒÙ„ Un+1=a Un +b" },
    ],
  },
  {
    id: "chap-2-arithmetique",
    title: "Arithmétique",
    titleAr: "اÙ„حساب",
    lessons: [
      { id: "lesson-2-1", title: "Division euclidienne dans Z", titleAr: "اÙ„Ù‚سÙ…ة اÙ„إÙ‚Ù„ÙŠدÙŠة فÙŠ Z" },
      { id: "lesson-2-2", title: "Ensemble des diviseurs d'un entier naturel", titleAr: "تعÙŠÙŠÙ† Ù…جÙ…Ùˆعة Ù‚ÙˆاسÙ… عدد طبÙŠعÙŠ" },
      { id: "lesson-2-3", title: "Congruences dans Z", titleAr: "اÙ„Ù…ÙˆافÙ‚ات فÙŠ Z" },
      { id: "lesson-2-4", title: "Propriétés des congruences et résolution de problèmes", titleAr: "Ù…عرفة خÙˆاص اÙ„Ù…ÙˆافÙ‚ة ÙˆاستعÙ…اÙ„Ù‡ا فÙŠ حÙ„ اÙ„Ù…شکÙ„ات" },
      { id: "lesson-2-5", title: "Raisonnement par récurrence", titleAr: "اÙ„استدÙ„اÙ„ باÙ„تراجع" },
    ],
  },
  {
    id: "chap-3-etude-de-fonctions",
    title: "Étude de fonctions",
    titleAr: "دراسة اÙ„دÙˆاÙ„",
    lessons: [
      { id: "lesson-3-1", title: "Rappels : Dérivées et équation de la tangente", titleAr: "تذÙƒÙŠر حÙˆÙ„ اÙ„Ù…شتÙ‚ات ÙˆÙ…عادÙ„ة اÙ„Ù…Ù…اس" },
      { id: "lesson-3-2", title: "Étude des variations d'une fonction", titleAr: "اÙ„دراسة ÙˆاÙ„تÙ…ثÙŠÙ„ اÙ„بÙŠاÙ†ÙŠ Ù„داÙ„ة" },
      { id: "lesson-3-3", title: "Fonctions polynômes (degré 3 maximum)", titleAr: "اÙ„دÙˆاÙ„ ÙƒثÙŠرات اÙ„حدÙˆد" },
      { id: "lesson-3-4", title: "Point d'inflexion", titleAr: "تعÙŠÙŠÙ† Ù†Ù‚طة اÙ„اÙ†عطاف" },
      { id: "lesson-3-5", title: "Lecture graphique et tableau de variations", titleAr: "اÙ„Ù‚راءة اÙ„بÙŠاÙ†ÙŠة" },
      { id: "lesson-3-6", title: "Résolution graphique d'équations et d'inéquations", titleAr: "استعÙ…اÙ„ اÙ„تÙ…ثÙŠÙ„ اÙ„بÙŠاÙ†ÙŠ Ù„حÙ„ Ù…عادÙ„ات أÙˆ Ù…تراجحات" },
      { id: "lesson-3-7", title: "Fonctions homographiques y = (ax+b)/(cx+d)", titleAr: "اÙ„دÙˆاÙ„ اÙ„تÙ†اظرÙŠة" },
      { id: "lesson-3-8", title: "Asymptotes et interprétation graphique", titleAr: "تعÙŠÙŠÙ† اÙ„Ù…ستÙ‚ÙŠÙ…ات اÙ„Ù…Ù‚اربة ÙˆتفسÙŠرÙ‡ا بÙŠاÙ†ÙŠا" },
      { id: "lesson-3-9", title: "Conjecture des limites à l'infini par lecture graphique", titleAr: "استعÙ…اÙ„ اÙ„تÙ…ثÙŠÙ„ اÙ„بÙŠاÙ†ÙŠ Ù„تخÙ…ÙŠÙ† اÙ„Ù†Ù‡اÙŠات" },
    ],
  },
  {
    id: "chap-4-statistiques-probabilites",
    title: "Statistiques et Probabilités",
    titleAr: "اÙ„إحصاء Ùˆ اÙ„احتÙ…اÙ„ات",
    lessons: [
      { id: "lesson-4-1", title: "Simulation et fréquences", titleAr: "Ù…حاÙƒاة تجربة عشÙˆائÙŠة ÙˆÙ…Ù„احظة تÙˆاترات اÙ„Ù‚ÙŠÙ…" },
      { id: "lesson-4-2", title: "Calcul de la probabilité d'un événement", titleAr: "حساب احتÙ…اÙ„ حدث بسÙŠط اÙˆ Ù…رÙƒب" },
      { id: "lesson-4-3", title: "Loi de probabilité pour une expérience à nombre fini d'issues", titleAr: "Ù‚اÙ†ÙˆÙ† اÙ„احتÙ…اÙ„ اÙ„Ù…تعÙ„Ù‚ بتجربة عشÙˆائÙŠة" },
      { id: "lesson-4-4", title: "Espérance mathématique et variance", titleAr: "اأÙ„Ù…Ù„ اÙ„رÙŠاضÙŠاتÙŠ ÙˆاÙ„تباÙŠÙ†" },
    ],
  },
];
