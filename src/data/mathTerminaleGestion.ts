
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
    titleAr: "المتتاليات العددية",
    lessons: [
      { id: "lesson-1-1", title: "Généralités sur les suites arithmétiques et géométriques", titleAr: "عموميات حول المتتاليات الحسابية والمتتاليات الهندسية" },
      { id: "lesson-1-2", title: "Raisonnement par récurrence", titleAr: "الاستدلال بالتراجع" },
      { id: "lesson-1-3", title: "Suites bornées", titleAr: "المتتاليات المحدودة" },
      { id: "lesson-1-4", title: "Suites monotones", titleAr: "المتتاليات الرتيبة" },
      { id: "lesson-1-5", title: "Suites convergentes", titleAr: "المتتاليات المتقاربة" },
      { id: "lesson-1-6", title: "Suite définie par Un+1 = aUn + b", titleAr: "التعرف على متتالية معرفة بالعلاقة : Un+1= aUn+bو حساب حدودها" },
      { id: "lesson-1-7", title: "Convergence d'une suite récurrente un+1=f(un)", titleAr: "تقارب متتالية تراجعية 𝐮𝐧+𝟏=f(un) بالاستعانة بالدالة" },
    ],
  },
  {
    id: "chap-2-derivabilite-continuite",
    title: "Dérivabilité et continuité",
    titleAr: "الاشتقاقية والاستمرارية",
    lessons: [
      { id: "lesson-2-1", title: "Rappel sur la dérivation", titleAr: "الاشتقاقية تذكير: العدد المشتق (تعريف وقراءة بيانية)" },
      { id: "lesson-2-2", title: "Fonctions dérivées", titleAr: "الدوال المشتقة" },
      { id: "lesson-2-3", title: "Dérivées et extrema locaux", titleAr: "المشتقات والقيم الحدية المحلية" },
      { id: "lesson-2-4", title: "Composition de fonctions et dérivation", titleAr: "مركب دالتين، اشتقاق دالة مركبة" },
      { id: "lesson-2-5", title: "Continuité et théorème des valeurs intermédiaires", titleAr: "الإستمرارية: مبرهنة القيم المتوسطة" },
    ],
  },
  {
    id: "chap-3-limites",
    title: "Nombres",
    titleAr: "النهايات",
    lessons: [
      { id: "lesson-3-1", title: "Opérations sur les limites", titleAr: "العمليات على النهايات: نهاية دالة مركبة والنهاية بالمقارنة" },
      { id: "lesson-3-2", title: "Asymptotes", titleAr: "المستقيمات المقاربة" },
    ],
  },
  {
    id: "chap-4-etude-de-fonctions",
    title: "Étude de fonctions",
    titleAr: "دراسة الدوال",
    lessons: [
      { id: "lesson-4-1", title: "Asymptote oblique", titleAr: "إثبات وجود مستقيم مقارب مائل بالنسبة إلى منحن ممثل لدالة وتعيين معادلة له" },
    ],
  },
  {
    id: "chap-5-primitives-integrales",
    title: "Primitives et intégrales",
    titleAr: "الدوال الأصلية والتكاملات",
    lessons: [
      { id: "lesson-5-1", title: "Primitives d'une fonction", titleAr: "الدوال الأصلية لدالة على مجال" },
      { id: "lesson-5-2", title: "Calcul de primitives de fonctions simples", titleAr: "حساب دوال اصلة لدوال بسيطة" },
      { id: "lesson-5-3", title: "Propriétés de l'intégrale", titleAr: "خواص التكامل: الخطية - علاقةشال- الترتيب" },
      { id: "lesson-5-4", "title": "Application de l'intégrale au calcul d'aires", "titleAr": "توظيف التكامل فى حساب المساحات" },
    ],
  },
  {
    id: "chap-6-fonctions-log-exp",
    title: "Fonctions logarithmiques et exponentielles",
    titleAr: "الدوال اللوغارتمية والأسية",
    lessons: [
      { id: "lesson-6-1", title: "Fonction logarithme népérien", titleAr: "الدالة اللوغاريتمية النيبيرية" },
      { id: "lesson-6-2", title: "Étude de la fonction ln", titleAr: "دراسة دوال من الشكل: In" },
      { id: "lesson-6-3", title: "Étude de la fonction ln(u)", titleAr: "دراسة دوال من الشكل Inou" },
      { id: "lesson-6-4", title: "Fonction logarithme de base a et décimal", titleAr: "الدالة اللوغاريتمية ذات الأساس ه. الدالة اللوغاريتم العشري." },
      { id: "lesson-6-5", title: "Fonctions exponentielles", titleAr: "الدوال الأسية" },
      { id: "lesson-6-6", title: "Étude de la fonction exponentielle", titleAr: "الدراسة والتمثيل البيانى للدالة الاسية" },
    ],
  },
  {
    id: "chap-7-statistiques",
    title: "Statistiques",
    titleAr: "الإحصاء",
    lessons: [
      { id: "lesson-7-1", title: "Série statistique à deux variables", titleAr: "تعريف سلسلة إحصائية لمتغيرين حقيقيين" },
      { id: "lesson-7-2", title: "Nuage de points", titleAr: "تمثيل سلسلة إحصائية لمتغيرين حقيقيين بسحابة نقط" },
      { id: "lesson-7-3", title: "Point moyen", titleAr: "تعيين إحداثيي النقطة المتوسطة" },
      { id: "lesson-7-4", title: "Ajustement linéaire", titleAr: "إنشاء مستقيم تعديل خطي" },
      { id: "lesson-7-5", title: "Exemples de séries statistiques", titleAr: "أمثلة لسلاسل احصائية من الشكل (X;Iny) أو (InX;Y)" },
    ],
  },
  {
    id: "chap-8-probabilites",
    title: "Probabilités",
    titleAr: "الإحتمالات",
    lessons: [
      { id: "lesson-8-1", title: "Loi de probabilité", titleAr: "قانون احتمال مرفق بتجربة عشوائية" },
      { id: "lesson-8-2", title: "Espérance, variance et écart type", titleAr: "الأمل الرياضياتي والتباين والانحراف المعياري" },
      { id: "lesson-8-3", title: "Probabilité conditionnelle", titleAr: "الاحتمال الشرطي" },
      { id: "lesson-8-4", title: "Arbre pondéré", titleAr: "الشجرة المتوازنة" },
      { id: "lesson-8-5", title: "Formule des probabilités totales", titleAr: "استعمال أشجار متوازنة أو دستور الاحتمالات الكلية" },
      { id: "lesson-8-6", title: "Indépendance de deux événements", titleAr: "استقلال حادثتين" },
    ],
  },
];
