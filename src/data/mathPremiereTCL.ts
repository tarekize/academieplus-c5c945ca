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
    titleAr: "اÙ„أعداد ÙˆاÙ„حساب",
    lessons: [
      {
        id: "lesson-1-1",
        title: "Calcul dans les ensembles numériques",
        titleAr: "Ù…Ù…ارسة اÙ„حساب فÙŠ Ù…ختÙ„ف اÙ„Ù…جÙ…Ùˆعات اÙ„عددÙŠة",
      },
      {
        id: "lesson-1-2",
        title: "Maîtrise du calcul algébrique",
        titleAr: "اÙ„تحÙƒÙ… فÙŠ اÙ„حساب اÙ„جبرÙŠ",
      },
      {
        id: "lesson-1-3",
        title: "Équations et inéquations",
        titleAr: "اÙƒتساب إجراءات تتعÙ„Ù‚ باÙ„تعبÙŠر عÙ† Ù…شÙƒÙ„ات بÙ…عادÙ„ات ÙˆÙ…تراجحات ÙˆحÙ„Ù‡ا",
      },
      {
        id: "lesson-1-4",
        title: "Utilisation de la calculatrice",
        titleAr: "استخداÙ… اÙ„حاسبة اÙ„عÙ„Ù…ÙŠة أÙˆ اÙ„بÙŠاÙ†ÙŠة Ù„إجراء حساب",
      },
    ],
  },
  {
    id: "chap-2-fonctions",
    title: "Les fonctions",
    titleAr: "اÙ„دÙˆاÙ„",
    lessons: [
      {
        id: "lesson-2-1",
        title: "Concept de fonction",
        titleAr: "إدراÙƒ Ù…فÙ‡ÙˆÙ… اÙ„داÙ„ة بÙ…ختÙ„ف اÙ„صÙŠغ (بÙŠاÙ†ÙŠاØŒ حسابÙŠاØŒ جبرÙŠا)",
      },
      {
        id: "lesson-2-2",
        title: "Fonctions de référence",
        titleAr: "Ù…عرفة ÙˆاستعÙ…اÙ„ خÙˆاص اÙ„دÙˆاÙ„ اÙ„Ù…رجعÙŠة اÙ„تÙŠ تÙ…Ù‡د Ù„دراسة اÙ„دÙˆاÙ„",
      },
      {
        id: "lesson-2-3",
        title: "Tableaux de variations et courbes",
        titleAr: "Ù‚راءة جداÙˆÙ„ تغÙŠرات ÙˆÙ…Ù†حÙ†ÙŠات دÙˆاÙ„ØŒ ÙˆتفسÙŠرÙ‡ا",
      },
      {
        id: "lesson-2-4",
        title: "Résolution de problèmes",
        titleAr: "اÙƒتساب إجراءات Ù„Ù„تعبÙŠر عÙ† Ù…شÙƒÙ„ات -تتعÙ„Ù‚ باÙ„دÙˆاÙ„ - ÙˆحÙ„Ù‡ا",
      },
      {
        id: "lesson-2-5",
        title: "Tracé de courbes avec calculatrice",
        titleAr: "تÙˆظÙŠف اÙ„حاسبة اÙ„بÙŠاÙ†ÙŠة Ù„استخراج Ù…Ù†حÙ†ÙŠ داÙ„ة",
      },
    ],
  },
  {
    id: "chap-3-geometrie",
    title: "Géométrie",
    titleAr: "اÙ„Ù‡Ù†دسة",
    lessons: [
      {
        id: "lesson-3-1",
        title: "Calcul vectoriel en géométrie analytique",
        titleAr: "Ù…Ù…ارسة اÙ„حساب اÙ„شعاعÙŠ فÙŠ اÙ„Ù‡Ù†دسة اÙ„تحÙ„ÙŠÙ„ÙŠة",
      },
      {
        id: "lesson-3-2",
        title: "Problèmes géométriques vectoriels",
        titleAr: "حÙ„ Ù…سائÙ„ Ù‡Ù†دسÙŠة تتعÙ„Ù‚ باÙ„حساب اÙ„شعاعÙŠ فÙŠ اÙ„Ù‡Ù†دسة اÙ„تحÙ„ÙŠÙ„ÙŠة",
      },
      {
        id: "lesson-3-3",
        title: "Problèmes sur les droites",
        titleAr: "اÙƒتساب إجراءات Ù„Ù„تعبÙŠر عÙ† Ù…شÙƒÙ„ات تتعÙ„Ù‚ باÙ„Ù…ستÙ‚ÙŠÙ…اتØŒ ÙˆحÙ„Ù‡ا",
      },
    ],
  },
  {
    id: "chap-4-statistiques",
    title: "Statistiques",
    titleAr: "اÙ„إحصاء",
    lessons: [
      {
        id: "lesson-4-1",
        title: "Lecture et organisation des données",
        titleAr: "Ù‚راءة Ù…عطÙŠات ÙˆتÙ†ظÙŠÙ…Ù‡ا",
      },
      {
        id: "lesson-4-2",
        title: "Diagrammes et graphiques",
        titleAr: "عرض Ù†تائج عÙ„Ù‰ شÙƒÙ„ Ù…خططات بÙŠاÙ†ÙŠةØŒ ÙˆÙ‚راءتÙ‡ا ÙˆتفسÙŠرÙ‡ا",
      },
      {
        id: "lesson-4-3",
        title: "Indicateurs statistiques",
        titleAr: "تÙ„خÙŠص سÙ„اسÙ„ إحصائÙŠة بÙˆاسطة Ù…ؤشرات اÙ„Ù…ÙˆÙ‚ع ÙˆÙ…ؤشر اÙ„تشتت (اÙ„Ù…دÙ‰)",
      },
      {
        id: "lesson-4-4",
        title: "Calcul avec calculatrice",
        titleAr: "تÙˆظÙŠف اÙ„حاسبة اÙ„عÙ„Ù…ÙŠة أÙˆ اÙ„بÙŠاÙ†ÙŠة Ù„حساب Ù…ؤشرات إحصائÙŠة أÙˆ Ù„استخراج تÙ…ثÙŠÙ„ات بÙŠاÙ†ÙŠة",
      },
    ],
  },
];

export const getCourseInfo = () => ({
  title: "Mathématiques - Première (Tronc Commun Lettres)",
  titleAr: "اÙ„رÙŠاضÙŠات - اÙ„أÙˆÙ„Ù‰ ثاÙ†ÙˆÙŠ (جذع Ù…شترÙƒ آداب)",
  description: "Programme de mathématiques pour la Première année du Tronc Commun Lettres",
  descriptionAr: "برÙ†اÙ…ج اÙ„رÙŠاضÙŠات Ù„Ù„سÙ†ة اÙ„أÙˆÙ„Ù‰ ثاÙ†ÙˆÙŠ - جذع Ù…شترÙƒ آداب",
});
