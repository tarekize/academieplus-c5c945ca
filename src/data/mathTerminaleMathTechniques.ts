// Mathématiques - Terminale - Filière Math Techniques

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

export const mathTerminaleMathTechniquesChapters: Chapter[] = [
  {
    id: "chap-1-limites-continuite",
    title: "Limites et continuité",
    titleAr: "النهايات والاستمرارية",
    lessons: [
      { id: "lesson-1-2", title: "Limite finie ou infinie en ±∞", titleAr: "نهاية منتهية أو غير منتهية عند ∞+ أو ∞-" },
      { id: "lesson-1-3", title: "Limite finie ou infinie en un point", titleAr: "نهاية منتهية أو غير منتهية عند عدد حقيقي" },
      { id: "lesson-1-4", title: "Compléments sur les limites", titleAr: "تتمات على النهايات" },
      { id: "lesson-1-5", title: "Limite d'une fonction composée - Limites par comparaison", titleAr: "نهاية دالة مركبة - النهايات بالمقارنة" },
      { id: "lesson-1-6", title: "Continuité", titleAr: "الاستمرارية" },
      { id: "lesson-1-7", title: "Théorème des valeurs intermédiaires", titleAr: "مبرهنة القيم المتوسطة" },
      { id: "lesson-1-8", title: "Fonctions continues et strictement monotones", titleAr: "الدوال المستمرة والرتيبة تماما" },
    ],
  },
  {
    id: "chap-2-derivabilite",
    title: "Dérivabilité",
    titleAr: "الاشتقاقية",
    lessons: [
      { id: "lesson-2-1", title: "Dérivabilité", titleAr: "الاشتقاقية" },
      { id: "lesson-2-2", title: "Dérivées et opérations", titleAr: "المشتقات والعمليات" },
      { id: "lesson-2-3", title: "Sens de variation d'une fonction", titleAr: "إتجاه التغير دالة" },
      { id: "lesson-2-4", title: "Dérivée d'une fonction composée", titleAr: "اشتقاق دالة مركبة" },
      { id: "lesson-2-5", title: "Approximation affine - Méthode d'Euler", titleAr: "التقريب التألفي - طريقة أولر" },
      { id: "lesson-2-6", title: "Étude de fonction trigonométrique", titleAr: "دراسة دالة مثلثية" },
    ],
  },
  {
    id: "chap-3-fonctions-exp-log",
    title: "Fonctions exponentielles et logarithmiques",
    titleAr: "الدوال الأسية واللوغاريتمية",
    lessons: [
      { id: "lesson-3-1", title: "Fonction exponentielle", titleAr: "الدالة الأسية" },
      { id: "lesson-3-2", title: "Fonctions exponentielles x ↦ e^x", titleAr: "الدوال الأسية x ↦ e^x" },
      { id: "lesson-3-3", title: "Étude de la fonction exponentielle", titleAr: "دراسة الدالة الأسية" },
      { id: "lesson-3-4", title: "Étude de la fonction exp(u)", titleAr: "دراسة الدالة exp(u)" },
      { id: "lesson-3-5", title: "Fonction logarithme népérien", titleAr: "الدالة اللوغاريتمية النيبيرية" },
      { id: "lesson-3-6", title: "Propriétés algébriques", titleAr: "الخواص الجبرية" },
      { id: "lesson-3-7", title: "Étude de la fonction logarithme népérien", titleAr: "دراسة الدالة اللوغاريتمية النيبيرية" },
      { id: "lesson-3-8", title: "Fonction logarithme décimal", titleAr: "الدالة اللوغاريتمية العشرية" },
      { id: "lesson-3-9", title: "Étude de la fonction ln(u)", titleAr: "دراسة الدالة ln(u)" },
    ],
  },
  {
    id: "chap-4-croissance-comparee",
    title: "Croissance comparée",
    titleAr: "التزايد المقارن",
    lessons: [
      { id: "lesson-4-1", title: "Puissances d'un nombre réel positif", titleAr: "قوى عدد حقيقي موجب" },
      { id: "lesson-4-2", title: "Étude des fonctions x ↦ a^x et x ↦ ⁿ√x", titleAr: "دراسة الدالة x ↦ a^x و x ↦ ⁿ√x" },
      { id: "lesson-4-3", title: "Croissance comparée", titleAr: "التزايد المقارن" },
    ],
  },
  {
    id: "chap-5-primitives",
    title: "Primitives",
    titleAr: "الدوال الأصلية",
    lessons: [
      { id: "lesson-5-1", title: "Primitives", titleAr: "الدوال الأصلية" },
      { id: "lesson-5-2", title: "Calcul de primitives", titleAr: "حساب الدوال الأصلية" },
      { id: "lesson-5-3", title: "Équations différentielles", titleAr: "المعادلات التفاضلية" },
    ],
  },
  {
    id: "chap-6-calcul-integral",
    title: "Calcul intégral",
    titleAr: "الحساب التكاملي",
    lessons: [
      { id: "lesson-6-1", title: "Intégrale d'une fonction", titleAr: "تكامل دالة" },
      { id: "lesson-6-2", title: "Propriétés de l'intégrale", titleAr: "خواص التكامل" },
      { id: "lesson-6-3", title: "Valeur moyenne", titleAr: "القيمة المتوسطة" },
      { id: "lesson-6-4", title: "Extension aux fonctions de signe quelconque", titleAr: "التمديد إلى دالة إشارتها كيفية" },
      { id: "lesson-6-5", title: "Utilisation du calcul intégral pour le calcul de primitives", titleAr: "توظيف الحساب التكاملي لحساب دوال أصلية" },
      { id: "lesson-6-6", title: "Applications du calcul intégral", titleAr: "بعض تطبيقات الحساب التكاملي" },
    ],
  },
  {
    id: "chap-7-probabilites-conditionnelles",
    title: "Probabilités conditionnelles",
    titleAr: "الاحتمالات الشرطية",
    lessons: [
      { id: "lesson-7-1", title: "Dénombrement (p-listes, arrangements, permutations)", titleAr: "العد (القوائم - الترتيبات - التبديلات)" },
      { id: "lesson-7-2", title: "Combinaisons - Formule du binôme de Newton", titleAr: "التوفيقات - دستور ثنائي الحد" },
      { id: "lesson-7-3", title: "Modélisation d'une expérience aléatoire: variable aléatoire, espérance et variance", titleAr: "نمذجة تجربة عشوائية: المتغير العشوائي، الأمل الرياضي والتباين" },
      { id: "lesson-7-4", title: "Probabilités conditionnelles", titleAr: "الاحتمالات الشرطية" },
      { id: "lesson-7-5", title: "Événements indépendants et variables aléatoires indépendantes", titleAr: "الحوادث المستقلة والمتغيرات العشوائية المستقلة" },
    ],
  },
  {
    id: "chap-8-lois-probabilite",
    title: "Lois de probabilité",
    titleAr: "قوانين الاحتمال",
    lessons: [
      { id: "lesson-8-1", title: "Loi de Bernoulli", titleAr: "قانون برنولي" },
      { id: "lesson-8-2", title: "Lois de probabilité continues", titleAr: "قوانين الاحتمالات المستمرة" },
      { id: "lesson-8-3", title: "Adéquation à une loi équirépartie", titleAr: "قياس تلاؤم سلسلة مشاهدة ونموذج احتمالي" },
      { id: "lesson-8-4", title: "Loi exponentielle", titleAr: "القانون الأسي" },
    ],
  },
];
