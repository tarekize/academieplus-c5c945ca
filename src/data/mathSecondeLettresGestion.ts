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
    titleAr: "النسب المئوية والمؤشرات",
    lessons: [
      { id: "lesson-1-1", title: "Rapport d'une partie à un tout", titleAr: "نسبة الجزء إِلى الكلّ" },
      { id: "lesson-1-2", title: "Pourcentage d'un autre pourcentage", titleAr: "النسبة المئوية لنسبة مئوية أخرى" },
      { id: "lesson-1-3", title: "Évolutions et pourcentages", titleAr: "التطورات والنسب المئوية" },
      { id: "lesson-1-4", title: "Indicateurs", titleAr: "المؤشرات" },
    ],
  },
  {
    id: "chap-2-statistiques",
    title: "Statistiques",
    titleAr: "الإِحصاء",
    lessons: [
      { id: "lesson-2-1", title: "Séries chronologiques", titleAr: "السلاسل الزمنية" },
      { id: "lesson-2-2", title: "Lissage par moyennes mobiles", titleAr: "التمليس بالأوساط المتحركة" },
      { id: "lesson-2-3", title: "Histogrammes", titleAr: "المدرجات التكرارية" },
      { id: "lesson-2-4", title: "Variance et écart-type", titleAr: "التباين-الإنحراف المعياري" },
      { id: "lesson-2-5", title: "Quartiles, déciles et diagramme en boîte", titleAr: "الربعيات والعشريات-المخطط بالعلبة" },
      { id: "lesson-2-6", title: "Expérience aléatoire et simulation", titleAr: "التجربة العشوائية - المحاكاة" },
    ],
  },
  {
    id: "chap-3-generalites-fonctions",
    title: "Généralités sur les fonctions",
    titleAr: "عموميات على الدوال",
    lessons: [
      { id: "lesson-3-1", title: "Fonction 'cube'", titleAr: "الدالة ((مكعب))" },
      { id: "lesson-3-2", title: "Opérations sur les fonctions", titleAr: "العمليات على الدوال" },
      { id: "lesson-3-3", title: "Courbes et transformations de points simples", titleAr: "المنحنيات والتحويلات النقطية البسيطة" },
      { id: "lesson-3-4", title: "Éléments de symétrie des courbes", titleAr: "عناصر تناظر منحنيات" },
    ],
  },
  {
    id: "chap-4-equations-inequations",
    title: "Équations et inéquations",
    titleAr: "المعادلات والمتراجحات",
    lessons: [
        { id: "lesson-4-1", title: "Trinôme du second degré", titleAr: "ثلاثي الحدود من الدرجة الثانية" },
        { id: "lesson-4-2", title: "Équations du second degré", titleAr: "المعادلات من الدرجة الثانية" },
        { id: "lesson-4-3", title: "Inéquations du second degré", titleAr: "المتراجحات من الدرجة الثانية" },
        { id: "lesson-4-4", title: "Résolution graphique d'équations et d'inéquations du second degré", titleAr: "حلّ معادلات ومتراجحات من الدرجة الثانية بيانيّا" },
    ],
  },
  {
    id: "chap-5-derivation",
    title: "Dérivation",
    titleAr: "الإِشتقاق",
    lessons: [
      { id: "lesson-5-1", title: "Nombre dérivé", titleAr: "العدد المشتق" },
      { id: "lesson-5-2", title: "Équation de la tangente", titleAr: "معادلة المماس لمنحن عند نقطة" },
      { id: "lesson-5-3", title: "Fonctions dérivées", titleAr: "الدوال المشتقة" },
      { id: "lesson-5-4", title: "Opérations sur les fonctions dérivées", titleAr: "عمليات على الدوال المشتقة" },
      { id: "lesson-5-5", title: "Fonction dérivée et sens de variation", titleAr: "الدالة المشتقة وإتجاه التغير" },
      { id: "lesson-5-6", title: "Extremums d'une fonction", titleAr: "القيم الحدية لدالة" },
      { id: "lesson-5-7", title: "Approximation affine tangente", titleAr: "التقريب التآلفي المماسي لدالة" },
    ],
  },
  {
    id: "chap-6-comportement-asymptotique",
    title: "Comportement asymptotique",
    titleAr: "السلوك التقاربي",
    lessons: [
      { id: "lesson-6-1", title: "Limites de fonctions usuelles", titleAr: "نهايات دوال مألوفة" },
      { id: "lesson-6-2", title: "Opérations sur les limites", titleAr: "العمليات على النهايات" },
      { id: "lesson-6-3", title: "Asymptotes", titleAr: "المستقيمات المقاربة" },
    ],
  },
  {
    id: "chap-7-suites-numeriques",
    title: "Suites numériques",
    titleAr: "المتتاليات العددية",
    lessons: [
      { id: "lesson-7-1", title: "Généralités", titleAr: "عموميات" },
      { id: "lesson-7-2", title: "Suites arithmétiques", titleAr: "المتتاليات الحسابية" },
      { id: "lesson-7-3", title: "Suites géométriques", titleAr: "المتتاليات االهندسية" },
    ],
  },
  {
    id: "chap-8-systemes-lineaires",
    title: "Systèmes linéaires",
    titleAr: "الجمل الخطية",
    lessons: [
      { id: "lesson-8-1", title: "Équations linéaires à deux inconnues", titleAr: "المعادلات الخطية لمجهولين" },
      { id: "lesson-8-2", title: "Systèmes de deux équations linéaires à deux inconnues", titleAr: "جمل معادلتين خطيتين لمجهولين" },
      { id: "lesson-8-3", title: "Systèmes de trois équations linéaires à trois inconnues", titleAr: "جمل ثلاث معادلات خطية لثلاثة مجاهيل" },
      { id: "lesson-8-4", title: "Inéquations linéaires à deux inconnues", titleAr: "المتراجحات الخطية لمجهولين" },
    ],
  },
  {
    id: "chap-9-probabilites",
    title: "Probabilités",
    titleAr: "الإحتمالات",
    lessons: [
      { id: "lesson-9-1", title: "Vocabulaire des probabilités", titleAr: "مفردات الإحتمالات" },
      { id: "lesson-9-2", title: "Probabilités", titleAr: "الاحتمالات" },
    ],
  },
];
