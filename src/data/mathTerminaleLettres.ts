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
    titleAr: "المتتاليات العددية",
    lessons: [
      { id: "lesson-1-1", title: "Génération et reconnaissance de suites", titleAr: "توليد متتالية: التعرف على متتاليات" },
      { id: "lesson-1-2", title: "Suites arithmétiques : Définition, terme général, moyenne arithmétique", titleAr: "المتتاليات الحسابية: التعريف ، الحد العام ؛ الوسط الحسابي" },
      { id: "lesson-1-3", title: "Somme des premiers termes d'une suite arithmétique", titleAr: "حساب مجموع الحدود الاولى من متتالية حسابية" },
      { id: "lesson-1-4", title: "Suites géométriques : Définition, terme général, moyenne géométrique", titleAr: "المتتاليات الهندسية: التعريف ، الحد العام؛ الوسط الهندسي" },
      { id: "lesson-1-5", title: "Somme des premiers termes d'une suite géométrique", titleAr: "حساب مجموع الحدود الاولى من متتالية هندسية" },
      { id: "lesson-1-6", title: "Suites récurrentes : Reconnaissance et calcul des premiers termes", titleAr: "التعرّف على متتالية بالتراجع - حساب الحدود الأولى" },
      { id: "lesson-1-7", title: "Monotonie d'une suite : sens de variation", titleAr: "مفهوم المتتالية الرتيبة وتعيين اتجاه تغيّرها" },
      { id: "lesson-1-8", title: "Sens de variation d'une suite arithmétique et géométrique", titleAr: "تحديد اتجاه تغيّر متتالية حسابية وهندسية" },
      { id: "lesson-1-9", title: "Application des suites à la résolution de problèmes", titleAr: "استعمال المتتاليات الحسابية والهندسية في حل المشكلات" },
      { id: "lesson-1-10", title: "Suites arithmotico-géométriques (Un+1 = aUn + b)", titleAr: "المتتاليات من الشكل Un+1=a Un +b" },
      { id: "lesson-1-11", title: "Résolution de problèmes avec les suites arithmotico-géométriques", titleAr: "حل مشكلات تُستعمل فيها متتاليات من الشكل Un+1=a Un +b" },
    ],
  },
  {
    id: "chap-2-arithmetique",
    title: "Arithmétique",
    titleAr: "الحساب",
    lessons: [
      { id: "lesson-2-1", title: "Division euclidienne dans Z", titleAr: "القسمة الإقليدية في Z" },
      { id: "lesson-2-2", title: "Ensemble des diviseurs d'un entier naturel", titleAr: "تعيين مجموعة قواسم عدد طبيعي" },
      { id: "lesson-2-3", title: "Congruences dans Z", titleAr: "الموافقات في Z" },
      { id: "lesson-2-4", title: "Propriétés des congruences et résolution de problèmes", titleAr: "معرفة خواص الموافقة واستعمالها في حل المشکلات" },
      { id: "lesson-2-5", title: "Raisonnement par récurrence", titleAr: "الاستدلال بالتراجع" },
    ],
  },
  {
    id: "chap-3-etude-de-fonctions",
    title: "Étude de fonctions",
    titleAr: "دراسة الدوال",
    lessons: [
      { id: "lesson-3-1", title: "Rappels : Dérivées et équation de la tangente", titleAr: "تذكير حول المشتقات ومعادلة المماس" },
      { id: "lesson-3-2", title: "Étude des variations d'une fonction", titleAr: "الدراسة والتمثيل البياني لدالة" },
      { id: "lesson-3-3", title: "Fonctions polynômes (degré 3 maximum)", titleAr: "الدوال كثيرات الحدود" },
      { id: "lesson-3-4", title: "Point d'inflexion", titleAr: "تعيين نقطة الانعطاف" },
      { id: "lesson-3-5", title: "Lecture graphique et tableau de variations", titleAr: "القراءة البيانية" },
      { id: "lesson-3-6", title: "Résolution graphique d'équations et d'inéquations", titleAr: "استعمال التمثيل البياني لحل معادلات أو متراجحات" },
      { id: "lesson-3-7", title: "Fonctions homographiques y = (ax+b)/(cx+d)", titleAr: "الدوال التناظرية" },
      { id: "lesson-3-8", title: "Asymptotes et interprétation graphique", titleAr: "تعيين المستقيمات المقاربة وتفسيرها بيانيا" },
      { id: "lesson-3-9", title: "Conjecture des limites à l'infini par lecture graphique", titleAr: "استعمال التمثيل البياني لتخمين النهايات" },
    ],
  },
  {
    id: "chap-4-statistiques-probabilites",
    title: "Statistiques et Probabilités",
    titleAr: "الإحصاء و الاحتمالات",
    lessons: [
      { id: "lesson-4-1", title: "Simulation et fréquences", titleAr: "محاكاة تجربة عشوائية وملاحظة تواترات القيم" },
      { id: "lesson-4-2", title: "Calcul de la probabilité d'un événement", titleAr: "حساب احتمال حدث بسيط او مركب" },
      { id: "lesson-4-3", title: "Loi de probabilité pour une expérience à nombre fini d'issues", titleAr: "قانون الاحتمال المتعلق بتجربة عشوائية" },
      { id: "lesson-4-4", title: "Espérance mathématique et variance", titleAr: "األمل الرياضياتي والتباين" },
    ],
  },
];
