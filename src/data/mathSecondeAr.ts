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
    titleAr: "اÙ„دÙˆاÙ„ اÙ„عددÙŠة",
    lessons: [
      {
        id: "lesson-1-1",
        title: "Rappels sur les fonctions",
        titleAr: "تذÙƒÙŠر حÙˆÙ„ اÙ„دÙˆاÙ„",
      },
      {
        id: "lesson-1-2",
        title: "Les fonctions de référence",
        titleAr: "اÙ„دÙˆاÙ„ اÙ„Ù…رجعÙŠة",
      },
      {
        id: "lesson-1-3",
        title: "Opérations sur les fonctions",
        titleAr: "عÙ…Ù„ÙŠات عÙ„Ù‰ اÙ„دÙˆاÙ„",
      },
      {
        id: "lesson-1-4",
        title: "Sens de variation",
        titleAr: "إتجاÙ‡ اÙ„تغÙŠر",
      },
      {
        id: "lesson-1-5",
        title: "Représentation graphique",
        titleAr: "اÙ„تÙ…ثÙŠÙ„ اÙ„بÙŠاÙ†ÙŠ",
      },
    ],
  },
  {
    id: "chap-2-polynomes",
    title: "Les fonctions polynômes",
    titleAr: "اÙ„دÙˆاÙ„ ÙƒثÙŠرات اÙ„حدÙˆد",
    lessons: [
      {
        id: "lesson-2-1",
        title: "Opérations sur les polynômes",
        titleAr: "عÙ…Ù„ÙŠات عÙ„Ù‰ ÙƒثÙŠرات اÙ„حدÙˆد",
      },
      {
        id: "lesson-2-2",
        title: "Équations du second degré",
        titleAr: "اÙ„Ù…عادÙ„ات Ù…Ù† اÙ„درجة اÙ„ثاÙ†ÙŠة",
      },
      {
        id: "lesson-2-3",
        title: "Inéquations du second degré",
        titleAr: "اÙ„Ù…تراجحات Ù…Ù† اÙ„درجة اÙ„ثاÙ†ÙŠة",
      },
    ],
  },
  {
    id: "chap-3-derivabilite",
    title: "La dérivabilité",
    titleAr: "اÙ„إشتÙ‚اÙ‚ÙŠة",
    lessons: [
      {
        id: "lesson-3-1",
        title: "Le nombre dérivé",
        titleAr: "اÙ„عدد اÙ„Ù…شتÙ‚",
      },
      {
        id: "lesson-3-2",
        title: "Tangente à une courbe en un point",
        titleAr: "Ù…Ù…اس Ù„Ù…Ù†حÙ† عÙ†د Ù†Ù‚طة",
      },
      {
        id: "lesson-3-3",
        title: "Approximation affine d'une fonction",
        titleAr: "اÙ„تÙ‚رÙŠب اÙ„تآÙ„فÙŠ Ù„داÙ„ة",
      },
      {
        id: "lesson-3-4",
        title: "La fonction dérivée d'une fonction",
        titleAr: "اÙ„داÙ„ة اÙ„Ù…شتÙ‚ة Ù„داÙ„ة",
      },
      {
        id: "lesson-3-5",
        title: "Opérations sur les fonctions dérivées",
        titleAr: "عÙ…Ù„ÙŠات عÙ„Ù‰ اÙ„دÙˆاÙ„ اÙ„Ù…شتÙ‚ة",
      },
    ],
  },
  {
    id: "chap-4-applications-derivabilite",
    title: "Applications de la dérivabilité",
    titleAr: "تطبÙŠÙ‚ات اÙ„إشتÙ‚اÙ‚ÙŠة",
    lessons: [
      {
        id: "lesson-4-1",
        title: "Sens de variation d'une fonction",
        titleAr: "اتجاÙ‡ تغÙŠر داÙ„ة",
      },
      {
        id: "lesson-4-2",
        title: "Extremums locaux",
        titleAr: "اÙ„Ù‚ÙŠÙ… اÙ„حدÙŠة اÙ„Ù…حÙ„ÙŠة",
      },
      {
        id: "lesson-4-3",
        title: "Encadrement d'une fonction",
        titleAr: "حصر داÙ„ة",
      },
      {
        id: "lesson-4-4",
        title: "Points remarquables",
        titleAr: "اÙ„عÙ†اصر اÙ„حادة",
      },
    ],
  },
  {
    id: "chap-5-limites",
    title: "Les limites",
    titleAr: "اÙ„Ù†Ù‡اÙŠات",
    lessons: [
      {
        id: "lesson-5-1",
        title: "Limite infinie en un point réel",
        titleAr: "Ù†Ù‡اÙŠة غÙŠر Ù…Ù†تÙ‡ÙŠة عÙ†د عدد حÙ‚ÙŠÙ‚ÙŠ",
      },
      {
        id: "lesson-5-2",
        title: "Limite finie à l'infini",
        titleAr: "Ù†Ù‡اÙŠة Ù…Ù†تÙ‡ÙŠة عÙ†د اÙ„Ù…اÙ„اÙ†Ù‡اÙŠة",
      },
      {
        id: "lesson-5-3",
        title: "Notion de limite",
        titleAr: "Ù…فÙ‡ÙˆÙ… اÙ„Ù†Ù‡اÙŠة",
      },
      {
        id: "lesson-5-4",
        title: "Opérations sur les limites",
        titleAr: "عÙ…Ù„ÙŠات عÙ„Ù‰ اÙ„Ù†Ù‡اÙŠات",
      },
      {
        id: "lesson-5-5",
        title: "Asymptote oblique",
        titleAr: "اÙ„Ù…ستÙ‚ÙŠÙ… اÙ„Ù…Ù‚ارب اÙ„Ù…ائÙ„",
      },
      {
        id: "lesson-5-6",
        title: "Étude d'une fonction",
        titleAr: "دراسة داÙ„ة",
      },
    ],
  },
  {
    id: "chap-6-suites",
    title: "Les suites numériques",
    titleAr: "اÙ„Ù…تتاÙ„ÙŠات اÙ„عددÙŠة",
    lessons: [
      {
        id: "lesson-6-1",
        title: "Les suites numériques",
        titleAr: "اÙ„Ù…تتاÙ„ÙŠات اÙ„عددÙŠة",
      },
      {
        id: "lesson-6-2",
        title: "Représentation graphique d'une suite",
        titleAr: "اÙ„تÙ…ثÙŠÙ„ اÙ„بÙŠاÙ†ÙŠ Ù„Ù…تتاÙ„ÙŠة عددÙŠة",
      },
      {
        id: "lesson-6-3",
        title: "Sens de variation d'une suite",
        titleAr: "إتجاÙ‡ تغÙŠر Ù…تتاÙ„ÙŠة عددÙŠة",
      },
      {
        id: "lesson-6-4",
        title: "Les suites arithmétiques",
        titleAr: "اÙ„Ù…تتاÙ„ÙŠات اÙ„حسابÙŠة",
      },
      {
        id: "lesson-6-5",
        title: "Les suites géométriques",
        titleAr: "اÙ„Ù…تتاÙ„ÙŠات اÙ„Ù‡Ù†دسÙŠة",
      },
      {
        id: "lesson-6-6",
        title: "Limite d'une suite numérique",
        titleAr: "Ù†Ù‡اÙŠة Ù…تتاÙ„ÙŠة عددÙŠة",
      },
      {
        id: "lesson-6-7",
        title: "Limite d'une suite par encadrement",
        titleAr: "Ù†Ù‡اÙŠة Ù…تتاÙ„ÙŠة عددÙŠة باستعÙ…اÙ„ اÙ„حصر",
      },
      {
        id: "lesson-6-8",
        title: "Limite d'une suite géométrique",
        titleAr: "Ù†Ù‡اÙŠة Ù…تتاÙ„ÙŠة Ù‡Ù†دسÙŠة",
      },
    ],
  },
  {
    id: "chap-7-barycentre",
    title: "Le barycentre dans le plan",
    titleAr: "اÙ„Ù…رجح فÙŠ اÙ„Ù…ستÙˆÙŠ",
    lessons: [
      {
        id: "lesson-7-1",
        title: "Rappels sur les vecteurs",
        titleAr: "تذÙƒÙŠر حÙˆÙ„ اÙ„أشعة",
      },
      {
        id: "lesson-7-2",
        title: "Barycentre de deux points",
        titleAr: "Ù…رجح Ù†Ù‚طتÙŠÙ†",
      },
      {
        id: "lesson-7-3",
        title: "Barycentre de trois points",
        titleAr: "Ù…رجح ثÙ„اث Ù†Ù‚اط",
      },
      {
        id: "lesson-7-4",
        title: "Coordonnées du barycentre de trois points",
        titleAr: "إحداثÙŠات Ù…رجح ثÙ„اث Ù†Ù‚اط",
      },
      {
        id: "lesson-7-5",
        title: "Barycentre de plusieurs points",
        titleAr: "Ù…رجح عدة Ù†Ù‚اط",
      },
    ],
  },
];

export const getSecondeArCourseInfo = () => ({
  title: "Mathématiques - Seconde",
  titleAr: "اÙ„رÙŠاضÙŠات - اÙ„سÙ†ة اÙ„ثاÙ†ÙŠة ثاÙ†ÙˆÙŠ",
  description: "Programme de mathématiques pour la Seconde année (Sciences, Math techniques, Mathématiques)",
  descriptionAr: "برÙ†اÙ…ج اÙ„رÙŠاضÙŠات Ù„Ù„سÙ†ة اÙ„ثاÙ†ÙŠة ثاÙ†ÙˆÙŠ - عÙ„ÙˆÙ…ØŒ تÙ‚Ù†ÙŠ رÙŠاضÙŠØŒ رÙŠاضÙŠات",
});
