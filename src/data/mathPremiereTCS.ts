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
    titleAr: "الأعداد والحساب",
    lessons: [
      {
        id: "lesson-1-1",
        title: "Calcul dans les ensembles numériques",
        titleAr: "ممارسة الحساب في مختلف المجموعات العددية",
      },
      {
        id: "lesson-1-2",
        title: "Maîtrise du calcul algébrique",
        titleAr: "التحكم في الحساب الجبري",
      },
      {
        id: "lesson-1-3",
        title: "Équations et inéquations",
        titleAr: "اكتساب إجراءات تتعلق بالتعبير عن مشكلات بمعادلات ومتراجحات وحلها",
      },
      {
        id: "lesson-1-4",
        title: "Utilisation de la calculatrice",
        titleAr: "استخدام الحاسبة العلمية أو البيانية لإجراء حساب",
      },
    ],
  },
  {
    id: "chap-2-fonctions",
    title: "Les fonctions",
    titleAr: "الدوال",
    lessons: [
      {
        id: "lesson-2-1",
        title: "Concept de fonction",
        titleAr: "إدراك مفهوم الدالة بمختلف الصيغ (بيانيا، حسابيا، جبريا)",
      },
      {
        id: "lesson-2-2",
        title: "Fonctions de référence",
        titleAr: "معرفة واستعمال خواص الدوال المرجعية التي تمهد لدراسة الدوال",
      },
      {
        id: "lesson-2-3",
        title: "Tableaux de variations et courbes",
        titleAr: "قراءة جداول تغيرات ومنحنيات دوال، وتفسيرها",
      },
      {
        id: "lesson-2-4",
        title: "Résolution de problèmes",
        titleAr: "اكتساب إجراءات للتعبير عن مشكلات - تتعلق بالدوال - وحلها",
      },
      {
        id: "lesson-2-5",
        title: "Tracé de courbes avec calculatrice",
        titleAr: "توظيف الحاسبة البيانية لاستخراج منحني دالة",
      },
    ],
  },
  {
    id: "chap-3-geometrie",
    title: "La géométrie",
    titleAr: "الهندسة",
    lessons: [
      {
        id: "lesson-3-1",
        title: "Calcul vectoriel",
        titleAr: "ممارسة الحساب الشعاعي في الهندسة التحليلية",
      },
      {
        id: "lesson-3-2",
        title: "Problèmes géométriques vectoriels",
        titleAr: "حل مسائل هندسية تتعلق بالحساب الشعاعي في الهندسة التحليلية",
      },
      {
        id: "lesson-3-3",
        title: "Droites et résolution de problèmes",
        titleAr: "اكتساب إجراءات للتعبير عن مشكلات تتعلق بالمستقيمات، وحلها",
      },
    ],
  },
  {
    id: "chap-4-statistiques",
    title: "Les statistiques",
    titleAr: "الإحصاء",
    lessons: [
      {
        id: "lesson-4-1",
        title: "Lecture et organisation des données",
        titleAr: "قراءة معطيات وتنظيمها",
      },
      {
        id: "lesson-4-2",
        title: "Représentations graphiques",
        titleAr: "عرض نتائج على شكل مخططات بيانية، وقراءتها وتفسيرها",
      },
      {
        id: "lesson-4-3",
        title: "Indicateurs statistiques",
        titleAr: "تلخيص سلاسل إحصائية بواسطة مؤشرات الموقع ومؤشر التشتت (المدى)",
      },
      {
        id: "lesson-4-4",
        title: "Calculatrice et statistiques",
        titleAr: "توظيف الحاسبة العلمية أو البيانية لحساب مؤشرات إحصائية أو لاستخراج تمثيلات بيانية",
      },
    ],
  },
  {
    id: "chap-5-tic",
    title: "Technologies de l'information et de la communication",
    titleAr: "تكنولوجيات الإعلام والاتصال",
    lessons: [
      {
        id: "lesson-5-1",
        title: "Utilisation de la calculatrice scientifique",
        titleAr: "استخدام الحاسبة العلمية لبناء تعلّمات ولإجراء حسابات قصد حل مشكلة والوعي بحدودها",
      },
      {
        id: "lesson-5-2",
        title: "Logiciels et calculatrice pour expérimentation",
        titleAr: "استخدام البرمجيات والحاسبة العلمية أو البيانية للتجريب والتخمين ومقارنة نتائج والتصديق وللتطرق إلى مفهوم جديد (مفهوم الدالة، المحاكاة، ... )",
      },
      {
        id: "lesson-5-3",
        title: "Tracé de courbes de fonctions",
        titleAr: "توظيف البرمجيات والحاسبة البيانية لاستخراج منحنى دالة قصد استغلاله",
      },
      {
        id: "lesson-5-4",
        title: "Indicateurs statistiques et représentations",
        titleAr: "توظيف البرمجيات والحاسبة البيانية لحساب مؤشرات الموقع لسلسلة إحصائية أو لاستخراج تمثيلات بيانية أو مخططات خاصة بهذه السلسلة",
      },
    ],
  },
  {
    id: "chap-6-logique",
    title: "Logique et démonstration mathématique",
    titleAr: "المنطق والبرهان الرياضي",
    lessons: [
      {
        id: "lesson-6-1",
        title: "Propositions simples et composées",
        titleAr: "الحكم على القضايا البسيطة والمركبة",
      },
      {
        id: "lesson-6-2",
        title: "Démonstration par déduction, absurde et cas",
        titleAr: "ممارسة البرهان بالاستنتاج وبالخلف وبفصل الحالات وبمثال مضاد",
      },
      {
        id: "lesson-6-3",
        title: "Reconnaissance et validation de preuves",
        titleAr: "التعرف على نمط برهان معطى وشرحه وتصديقه",
      },
      {
        id: "lesson-6-4",
        title: "Distinction des types de démonstration",
        titleAr: "التمييز بين أنماط البرهان الذي يمارس في هذا المستوى",
      },
      {
        id: "lesson-6-5",
        title: "Lien entre démonstration et formule logique",
        titleAr: "تقريب نمط برهان من صيغة منطقية له",
      },
    ],
  },
];

export const getCourseInfo = () => ({
  level: "Première",
  filiere: "Tronc Commun Scientifique",
  subject: "Mathématiques",
  subjectAr: "الرياضيات",
  totalChapters: mathPremiereTCSChapters.length,
  totalLessons: mathPremiereTCSChapters.reduce((acc, ch) => acc + ch.lessons.length, 0),
});
