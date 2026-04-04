// Mathématiques - Première Année Secondaire - Tronc Commun Scientifique

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
        titleAr: "اÙƒتساب إجراءات Ù„Ù„تعبÙŠر عÙ† Ù…شÙƒÙ„ات - تتعÙ„Ù‚ باÙ„دÙˆاÙ„ - ÙˆحÙ„Ù‡ا",
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
    title: "La géométrie",
    titleAr: "اÙ„Ù‡Ù†دسة",
    lessons: [
      {
        id: "lesson-3-1",
        title: "Calcul vectoriel",
        titleAr: "Ù…Ù…ارسة اÙ„حساب اÙ„شعاعÙŠ فÙŠ اÙ„Ù‡Ù†دسة اÙ„تحÙ„ÙŠÙ„ÙŠة",
      },
      {
        id: "lesson-3-2",
        title: "Problèmes géométriques vectoriels",
        titleAr: "حÙ„ Ù…سائÙ„ Ù‡Ù†دسÙŠة تتعÙ„Ù‚ باÙ„حساب اÙ„شعاعÙŠ فÙŠ اÙ„Ù‡Ù†دسة اÙ„تحÙ„ÙŠÙ„ÙŠة",
      },
      {
        id: "lesson-3-3",
        title: "Droites et résolution de problèmes",
        titleAr: "اÙƒتساب إجراءات Ù„Ù„تعبÙŠر عÙ† Ù…شÙƒÙ„ات تتعÙ„Ù‚ باÙ„Ù…ستÙ‚ÙŠÙ…اتØŒ ÙˆحÙ„Ù‡ا",
      },
    ],
  },
  {
    id: "chap-4-statistiques",
    title: "Les statistiques",
    titleAr: "اÙ„إحصاء",
    lessons: [
      {
        id: "lesson-4-1",
        title: "Lecture et organisation des données",
        titleAr: "Ù‚راءة Ù…عطÙŠات ÙˆتÙ†ظÙŠÙ…Ù‡ا",
      },
      {
        id: "lesson-4-2",
        title: "Représentations graphiques",
        titleAr: "عرض Ù†تائج عÙ„Ù‰ شÙƒÙ„ Ù…خططات بÙŠاÙ†ÙŠةØŒ ÙˆÙ‚راءتÙ‡ا ÙˆتفسÙŠرÙ‡ا",
      },
      {
        id: "lesson-4-3",
        title: "Indicateurs statistiques",
        titleAr: "تÙ„خÙŠص سÙ„اسÙ„ إحصائÙŠة بÙˆاسطة Ù…ؤشرات اÙ„Ù…ÙˆÙ‚ع ÙˆÙ…ؤشر اÙ„تشتت (اÙ„Ù…دÙ‰)",
      },
      {
        id: "lesson-4-4",
        title: "Calculatrice et statistiques",
        titleAr: "تÙˆظÙŠف اÙ„حاسبة اÙ„عÙ„Ù…ÙŠة أÙˆ اÙ„بÙŠاÙ†ÙŠة Ù„حساب Ù…ؤشرات إحصائÙŠة أÙˆ Ù„استخراج تÙ…ثÙŠÙ„ات بÙŠاÙ†ÙŠة",
      },
    ],
  },
  {
    id: "chap-5-tic",
    title: "Technologies de l'information et de la communication",
    titleAr: "تÙƒÙ†ÙˆÙ„ÙˆجÙŠات اÙ„إعÙ„اÙ… ÙˆاÙ„اتصاÙ„",
    lessons: [
      {
        id: "lesson-5-1",
        title: "Utilisation de la calculatrice scientifique",
        titleAr: "استخداÙ… اÙ„حاسبة اÙ„عÙ„Ù…ÙŠة Ù„بÙ†اء تعÙ„Ù‘Ù…ات ÙˆÙ„إجراء حسابات Ù‚صد حÙ„ Ù…شÙƒÙ„ة ÙˆاÙ„ÙˆعÙŠ بحدÙˆدÙ‡ا",
      },
      {
        id: "lesson-5-2",
        title: "Logiciels et calculatrice pour expérimentation",
        titleAr: "استخداÙ… اÙ„برÙ…جÙŠات ÙˆاÙ„حاسبة اÙ„عÙ„Ù…ÙŠة أÙˆ اÙ„بÙŠاÙ†ÙŠة Ù„Ù„تجرÙŠب ÙˆاÙ„تخÙ…ÙŠÙ† ÙˆÙ…Ù‚ارÙ†ة Ù†تائج ÙˆاÙ„تصدÙŠÙ‚ ÙˆÙ„Ù„تطرÙ‚ إÙ„Ù‰ Ù…فÙ‡ÙˆÙ… جدÙŠد (Ù…فÙ‡ÙˆÙ… اÙ„داÙ„ةØŒ اÙ„Ù…حاÙƒاةØŒ ... )",
      },
      {
        id: "lesson-5-3",
        title: "Tracé de courbes de fonctions",
        titleAr: "تÙˆظÙŠف اÙ„برÙ…جÙŠات ÙˆاÙ„حاسبة اÙ„بÙŠاÙ†ÙŠة Ù„استخراج Ù…Ù†حÙ†Ù‰ داÙ„ة Ù‚صد استغÙ„اÙ„Ù‡",
      },
      {
        id: "lesson-5-4",
        title: "Indicateurs statistiques et représentations",
        titleAr: "تÙˆظÙŠف اÙ„برÙ…جÙŠات ÙˆاÙ„حاسبة اÙ„بÙŠاÙ†ÙŠة Ù„حساب Ù…ؤشرات اÙ„Ù…ÙˆÙ‚ع Ù„سÙ„سÙ„ة إحصائÙŠة أÙˆ Ù„استخراج تÙ…ثÙŠÙ„ات بÙŠاÙ†ÙŠة أÙˆ Ù…خططات خاصة بÙ‡ذÙ‡ اÙ„سÙ„سÙ„ة",
      },
    ],
  },
  {
    id: "chap-6-logique",
    title: "Logique et démonstration mathématique",
    titleAr: "اÙ„Ù…Ù†طÙ‚ ÙˆاÙ„برÙ‡اÙ† اÙ„رÙŠاضÙŠ",
    lessons: [
      {
        id: "lesson-6-1",
        title: "Propositions simples et composées",
        titleAr: "اÙ„حÙƒÙ… عÙ„Ù‰ اÙ„Ù‚ضاÙŠا اÙ„بسÙŠطة ÙˆاÙ„Ù…رÙƒبة",
      },
      {
        id: "lesson-6-2",
        title: "Démonstration par déduction, absurde et cas",
        titleAr: "Ù…Ù…ارسة اÙ„برÙ‡اÙ† باÙ„استÙ†تاج ÙˆباÙ„خÙ„ف ÙˆبفصÙ„ اÙ„حاÙ„ات ÙˆبÙ…ثاÙ„ Ù…ضاد",
      },
      {
        id: "lesson-6-3",
        title: "Reconnaissance et validation de preuves",
        titleAr: "اÙ„تعرف عÙ„Ù‰ Ù†Ù…ط برÙ‡اÙ† Ù…عطÙ‰ ÙˆشرحÙ‡ ÙˆتصدÙŠÙ‚Ù‡",
      },
      {
        id: "lesson-6-4",
        title: "Distinction des types de démonstration",
        titleAr: "اÙ„تÙ…ÙŠÙŠز بÙŠÙ† أÙ†Ù…اط اÙ„برÙ‡اÙ† اÙ„ذÙŠ ÙŠÙ…ارس فÙŠ Ù‡ذا اÙ„Ù…ستÙˆÙ‰",
      },
      {
        id: "lesson-6-5",
        title: "Lien entre démonstration et formule logique",
        titleAr: "تÙ‚رÙŠب Ù†Ù…ط برÙ‡اÙ† Ù…Ù† صÙŠغة Ù…Ù†طÙ‚ÙŠة Ù„Ù‡",
      },
    ],
  },
];

export const getCourseInfo = () => ({
  level: "Première",
  filiere: "Tronc Commun Scientifique",
  subject: "Mathématiques",
  subjectAr: "اÙ„رÙŠاضÙŠات",
  totalChapters: mathPremiereTCSChapters.length,
  totalLessons: mathPremiereTCSChapters.reduce((acc, ch) => acc + ch.lessons.length, 0),
});
