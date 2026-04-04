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
    titleAr: "اÙ„Ù†سب اÙ„Ù…ئÙˆÙŠة ÙˆاÙ„Ù…ؤشرات",
    lessons: [
      { id: "lesson-1-1", title: "Rapport d'une partie à un tout", titleAr: "Ù†سبة اÙ„جزء إِÙ„Ù‰ اÙ„ÙƒÙ„Ù‘" },
      { id: "lesson-1-2", title: "Pourcentage d'un autre pourcentage", titleAr: "اÙ„Ù†سبة اÙ„Ù…ئÙˆÙŠة Ù„Ù†سبة Ù…ئÙˆÙŠة أخرÙ‰" },
      { id: "lesson-1-3", title: "Évolutions et pourcentages", titleAr: "اÙ„تطÙˆرات ÙˆاÙ„Ù†سب اÙ„Ù…ئÙˆÙŠة" },
      { id: "lesson-1-4", title: "Indicateurs", titleAr: "اÙ„Ù…ؤشرات" },
    ],
  },
  {
    id: "chap-2-statistiques",
    title: "Statistiques",
    titleAr: "اÙ„إِحصاء",
    lessons: [
      { id: "lesson-2-1", title: "Séries chronologiques", titleAr: "اÙ„سÙ„اسÙ„ اÙ„زÙ…Ù†ÙŠة" },
      { id: "lesson-2-2", title: "Lissage par moyennes mobiles", titleAr: "اÙ„تÙ…Ù„ÙŠس باÙ„أÙˆساط اÙ„Ù…تحرÙƒة" },
      { id: "lesson-2-3", title: "Histogrammes", titleAr: "اÙ„Ù…درجات اÙ„تÙƒرارÙŠة" },
      { id: "lesson-2-4", title: "Variance et écart-type", titleAr: "اÙ„تباÙŠÙ†-اÙ„إÙ†حراف اÙ„Ù…عÙŠارÙŠ" },
      { id: "lesson-2-5", title: "Quartiles, déciles et diagramme en boîte", titleAr: "اÙ„ربعÙŠات ÙˆاÙ„عشرÙŠات-اÙ„Ù…خطط باÙ„عÙ„بة" },
      { id: "lesson-2-6", title: "Expérience aléatoire et simulation", titleAr: "اÙ„تجربة اÙ„عشÙˆائÙŠة - اÙ„Ù…حاÙƒاة" },
    ],
  },
  {
    id: "chap-3-generalites-fonctions",
    title: "Généralités sur les fonctions",
    titleAr: "عÙ…ÙˆÙ…ÙŠات عÙ„Ù‰ اÙ„دÙˆاÙ„",
    lessons: [
      { id: "lesson-3-1", title: "Fonction 'cube'", titleAr: "اÙ„داÙ„ة ((Ù…Ùƒعب))" },
      { id: "lesson-3-2", title: "Opérations sur les fonctions", titleAr: "اÙ„عÙ…Ù„ÙŠات عÙ„Ù‰ اÙ„دÙˆاÙ„" },
      { id: "lesson-3-3", title: "Courbes et transformations de points simples", titleAr: "اÙ„Ù…Ù†حÙ†ÙŠات ÙˆاÙ„تحÙˆÙŠÙ„ات اÙ„Ù†Ù‚طÙŠة اÙ„بسÙŠطة" },
      { id: "lesson-3-4", title: "Éléments de symétrie des courbes", titleAr: "عÙ†اصر تÙ†اظر Ù…Ù†حÙ†ÙŠات" },
    ],
  },
  {
    id: "chap-4-equations-inequations",
    title: "Équations et inéquations",
    titleAr: "اÙ„Ù…عادÙ„ات ÙˆاÙ„Ù…تراجحات",
    lessons: [
        { id: "lesson-4-1", title: "Trinôme du second degré", titleAr: "ثÙ„اثÙŠ اÙ„حدÙˆد Ù…Ù† اÙ„درجة اÙ„ثاÙ†ÙŠة" },
        { id: "lesson-4-2", title: "Équations du second degré", titleAr: "اÙ„Ù…عادÙ„ات Ù…Ù† اÙ„درجة اÙ„ثاÙ†ÙŠة" },
        { id: "lesson-4-3", title: "Inéquations du second degré", titleAr: "اÙ„Ù…تراجحات Ù…Ù† اÙ„درجة اÙ„ثاÙ†ÙŠة" },
        { id: "lesson-4-4", title: "Résolution graphique d'équations et d'inéquations du second degré", titleAr: "حÙ„Ù‘ Ù…عادÙ„ات ÙˆÙ…تراجحات Ù…Ù† اÙ„درجة اÙ„ثاÙ†ÙŠة بÙŠاÙ†ÙŠÙ‘ا" },
    ],
  },
  {
    id: "chap-5-derivation",
    title: "Dérivation",
    titleAr: "اÙ„إِشتÙ‚اÙ‚",
    lessons: [
      { id: "lesson-5-1", title: "Nombre dérivé", titleAr: "اÙ„عدد اÙ„Ù…شتÙ‚" },
      { id: "lesson-5-2", title: "Équation de la tangente", titleAr: "Ù…عادÙ„ة اÙ„Ù…Ù…اس Ù„Ù…Ù†حÙ† عÙ†د Ù†Ù‚طة" },
      { id: "lesson-5-3", title: "Fonctions dérivées", titleAr: "اÙ„دÙˆاÙ„ اÙ„Ù…شتÙ‚ة" },
      { id: "lesson-5-4", title: "Opérations sur les fonctions dérivées", titleAr: "عÙ…Ù„ÙŠات عÙ„Ù‰ اÙ„دÙˆاÙ„ اÙ„Ù…شتÙ‚ة" },
      { id: "lesson-5-5", title: "Fonction dérivée et sens de variation", titleAr: "اÙ„داÙ„ة اÙ„Ù…شتÙ‚ة ÙˆإتجاÙ‡ اÙ„تغÙŠر" },
      { id: "lesson-5-6", title: "Extremums d'une fonction", titleAr: "اÙ„Ù‚ÙŠÙ… اÙ„حدÙŠة Ù„داÙ„ة" },
      { id: "lesson-5-7", title: "Approximation affine tangente", titleAr: "اÙ„تÙ‚رÙŠب اÙ„تآÙ„فÙŠ اÙ„Ù…Ù…اسÙŠ Ù„داÙ„ة" },
    ],
  },
  {
    id: "chap-6-comportement-asymptotique",
    title: "Comportement asymptotique",
    titleAr: "اÙ„سÙ„ÙˆÙƒ اÙ„تÙ‚اربÙŠ",
    lessons: [
      { id: "lesson-6-1", title: "Limites de fonctions usuelles", titleAr: "Ù†Ù‡اÙŠات دÙˆاÙ„ Ù…أÙ„Ùˆفة" },
      { id: "lesson-6-2", title: "Opérations sur les limites", titleAr: "اÙ„عÙ…Ù„ÙŠات عÙ„Ù‰ اÙ„Ù†Ù‡اÙŠات" },
      { id: "lesson-6-3", title: "Asymptotes", titleAr: "اÙ„Ù…ستÙ‚ÙŠÙ…ات اÙ„Ù…Ù‚اربة" },
    ],
  },
  {
    id: "chap-7-suites-numeriques",
    title: "Suites numériques",
    titleAr: "اÙ„Ù…تتاÙ„ÙŠات اÙ„عددÙŠة",
    lessons: [
      { id: "lesson-7-1", title: "Généralités", titleAr: "عÙ…ÙˆÙ…ÙŠات" },
      { id: "lesson-7-2", title: "Suites arithmétiques", titleAr: "اÙ„Ù…تتاÙ„ÙŠات اÙ„حسابÙŠة" },
      { id: "lesson-7-3", title: "Suites géométriques", titleAr: "اÙ„Ù…تتاÙ„ÙŠات ااÙ„Ù‡Ù†دسÙŠة" },
    ],
  },
  {
    id: "chap-8-systemes-lineaires",
    title: "Systèmes linéaires",
    titleAr: "اÙ„جÙ…Ù„ اÙ„خطÙŠة",
    lessons: [
      { id: "lesson-8-1", title: "Équations linéaires à deux inconnues", titleAr: "اÙ„Ù…عادÙ„ات اÙ„خطÙŠة Ù„Ù…جÙ‡ÙˆÙ„ÙŠÙ†" },
      { id: "lesson-8-2", title: "Systèmes de deux équations linéaires à deux inconnues", titleAr: "جÙ…Ù„ Ù…عادÙ„تÙŠÙ† خطÙŠتÙŠÙ† Ù„Ù…جÙ‡ÙˆÙ„ÙŠÙ†" },
      { id: "lesson-8-3", title: "Systèmes de trois équations linéaires à trois inconnues", titleAr: "جÙ…Ù„ ثÙ„اث Ù…عادÙ„ات خطÙŠة Ù„ثÙ„اثة Ù…جاÙ‡ÙŠÙ„" },
      { id: "lesson-8-4", title: "Inéquations linéaires à deux inconnues", titleAr: "اÙ„Ù…تراجحات اÙ„خطÙŠة Ù„Ù…جÙ‡ÙˆÙ„ÙŠÙ†" },
    ],
  },
  {
    id: "chap-9-probabilites",
    title: "Probabilités",
    titleAr: "اÙ„إحتÙ…اÙ„ات",
    lessons: [
      { id: "lesson-9-1", title: "Vocabulaire des probabilités", titleAr: "Ù…فردات اÙ„إحتÙ…اÙ„ات" },
      { id: "lesson-9-2", title: "Probabilités", titleAr: "اÙ„احتÙ…اÙ„ات" },
    ],
  },
];
