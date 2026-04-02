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
    titleAr: "الدوال العددية",
    lessons: [
      {
        id: "lesson-1-1",
        title: "Rappels sur les fonctions",
        titleAr: "تذكير حول الدوال",
      },
      {
        id: "lesson-1-2",
        title: "Les fonctions de référence",
        titleAr: "الدوال المرجعية",
      },
      {
        id: "lesson-1-3",
        title: "Opérations sur les fonctions",
        titleAr: "عمليات على الدوال",
      },
      {
        id: "lesson-1-4",
        title: "Sens de variation",
        titleAr: "إتجاه التغير",
      },
      {
        id: "lesson-1-5",
        title: "Représentation graphique",
        titleAr: "التمثيل البياني",
      },
    ],
  },
  {
    id: "chap-2-polynomes",
    title: "Les fonctions polynômes",
    titleAr: "الدوال كثيرات الحدود",
    lessons: [
      {
        id: "lesson-2-1",
        title: "Opérations sur les polynômes",
        titleAr: "عمليات على كثيرات الحدود",
      },
      {
        id: "lesson-2-2",
        title: "Équations du second degré",
        titleAr: "المعادلات من الدرجة الثانية",
      },
      {
        id: "lesson-2-3",
        title: "Inéquations du second degré",
        titleAr: "المتراجحات من الدرجة الثانية",
      },
    ],
  },
  {
    id: "chap-3-derivabilite",
    title: "La dérivabilité",
    titleAr: "الإشتقاقية",
    lessons: [
      {
        id: "lesson-3-1",
        title: "Le nombre dérivé",
        titleAr: "العدد المشتق",
      },
      {
        id: "lesson-3-2",
        title: "Tangente à une courbe en un point",
        titleAr: "مماس لمنحن عند نقطة",
      },
      {
        id: "lesson-3-3",
        title: "Approximation affine d'une fonction",
        titleAr: "التقريب التآلفي لدالة",
      },
      {
        id: "lesson-3-4",
        title: "La fonction dérivée d'une fonction",
        titleAr: "الدالة المشتقة لدالة",
      },
      {
        id: "lesson-3-5",
        title: "Opérations sur les fonctions dérivées",
        titleAr: "عمليات على الدوال المشتقة",
      },
    ],
  },
  {
    id: "chap-4-applications-derivabilite",
    title: "Applications de la dérivabilité",
    titleAr: "تطبيقات الإشتقاقية",
    lessons: [
      {
        id: "lesson-4-1",
        title: "Sens de variation d'une fonction",
        titleAr: "اتجاه تغير دالة",
      },
      {
        id: "lesson-4-2",
        title: "Extremums locaux",
        titleAr: "القيم الحدية المحلية",
      },
      {
        id: "lesson-4-3",
        title: "Encadrement d'une fonction",
        titleAr: "حصر دالة",
      },
      {
        id: "lesson-4-4",
        title: "Points remarquables",
        titleAr: "العناصر الحادة",
      },
    ],
  },
  {
    id: "chap-5-limites",
    title: "Les limites",
    titleAr: "النهايات",
    lessons: [
      {
        id: "lesson-5-1",
        title: "Limite infinie en un point réel",
        titleAr: "نهاية غير منتهية عند عدد حقيقي",
      },
      {
        id: "lesson-5-2",
        title: "Limite finie à l'infini",
        titleAr: "نهاية منتهية عند المالانهاية",
      },
      {
        id: "lesson-5-3",
        title: "Notion de limite",
        titleAr: "مفهوم النهاية",
      },
      {
        id: "lesson-5-4",
        title: "Opérations sur les limites",
        titleAr: "عمليات على النهايات",
      },
      {
        id: "lesson-5-5",
        title: "Asymptote oblique",
        titleAr: "المستقيم المقارب المائل",
      },
      {
        id: "lesson-5-6",
        title: "Étude d'une fonction",
        titleAr: "دراسة دالة",
      },
    ],
  },
  {
    id: "chap-6-suites",
    title: "Les suites numériques",
    titleAr: "المتتاليات العددية",
    lessons: [
      {
        id: "lesson-6-1",
        title: "Les suites numériques",
        titleAr: "المتتاليات العددية",
      },
      {
        id: "lesson-6-2",
        title: "Représentation graphique d'une suite",
        titleAr: "التمثيل البياني لمتتالية عددية",
      },
      {
        id: "lesson-6-3",
        title: "Sens de variation d'une suite",
        titleAr: "إتجاه تغير متتالية عددية",
      },
      {
        id: "lesson-6-4",
        title: "Les suites arithmétiques",
        titleAr: "المتتاليات الحسابية",
      },
      {
        id: "lesson-6-5",
        title: "Les suites géométriques",
        titleAr: "المتتاليات الهندسية",
      },
      {
        id: "lesson-6-6",
        title: "Limite d'une suite numérique",
        titleAr: "نهاية متتالية عددية",
      },
      {
        id: "lesson-6-7",
        title: "Limite d'une suite par encadrement",
        titleAr: "نهاية متتالية عددية باستعمال الحصر",
      },
      {
        id: "lesson-6-8",
        title: "Limite d'une suite géométrique",
        titleAr: "نهاية متتالية هندسية",
      },
    ],
  },
  {
    id: "chap-7-barycentre",
    title: "Le barycentre dans le plan",
    titleAr: "المرجح في المستوي",
    lessons: [
      {
        id: "lesson-7-1",
        title: "Rappels sur les vecteurs",
        titleAr: "تذكير حول الأشعة",
      },
      {
        id: "lesson-7-2",
        title: "Barycentre de deux points",
        titleAr: "مرجح نقطتين",
      },
      {
        id: "lesson-7-3",
        title: "Barycentre de trois points",
        titleAr: "مرجح ثلاث نقاط",
      },
      {
        id: "lesson-7-4",
        title: "Coordonnées du barycentre de trois points",
        titleAr: "إحداثيات مرجح ثلاث نقاط",
      },
      {
        id: "lesson-7-5",
        title: "Barycentre de plusieurs points",
        titleAr: "مرجح عدة نقاط",
      },
    ],
  },
];

export const getSecondeArCourseInfo = () => ({
  title: "Mathématiques - Seconde",
  titleAr: "الرياضيات - السنة الثانية ثانوي",
  description: "Programme de mathématiques pour la Seconde année (Sciences, Math techniques, Mathématiques)",
  descriptionAr: "برنامج الرياضيات للسنة الثانية ثانوي - علوم، تقني رياضي، رياضيات",
});
