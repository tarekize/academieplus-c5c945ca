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
        titleAr: "اكتساب إجراءات للتعبير عن مشكلات -تتعلق بالدوال - وحلها",
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
    title: "Géométrie",
    titleAr: "الهندسة",
    lessons: [
      {
        id: "lesson-3-1",
        title: "Calcul vectoriel en géométrie analytique",
        titleAr: "ممارسة الحساب الشعاعي في الهندسة التحليلية",
      },
      {
        id: "lesson-3-2",
        title: "Problèmes géométriques vectoriels",
        titleAr: "حل مسائل هندسية تتعلق بالحساب الشعاعي في الهندسة التحليلية",
      },
      {
        id: "lesson-3-3",
        title: "Problèmes sur les droites",
        titleAr: "اكتساب إجراءات للتعبير عن مشكلات تتعلق بالمستقيمات، وحلها",
      },
    ],
  },
  {
    id: "chap-4-statistiques",
    title: "Statistiques",
    titleAr: "الإحصاء",
    lessons: [
      {
        id: "lesson-4-1",
        title: "Lecture et organisation des données",
        titleAr: "قراءة معطيات وتنظيمها",
      },
      {
        id: "lesson-4-2",
        title: "Diagrammes et graphiques",
        titleAr: "عرض نتائج على شكل مخططات بيانية، وقراءتها وتفسيرها",
      },
      {
        id: "lesson-4-3",
        title: "Indicateurs statistiques",
        titleAr: "تلخيص سلاسل إحصائية بواسطة مؤشرات الموقع ومؤشر التشتت (المدى)",
      },
      {
        id: "lesson-4-4",
        title: "Calcul avec calculatrice",
        titleAr: "توظيف الحاسبة العلمية أو البيانية لحساب مؤشرات إحصائية أو لاستخراج تمثيلات بيانية",
      },
    ],
  },
];

export const getCourseInfo = () => ({
  title: "Mathématiques - Première (Tronc Commun Lettres)",
  titleAr: "الرياضيات - الأولى ثانوي (جذع مشترك آداب)",
  description: "Programme de mathématiques pour la Première année du Tronc Commun Lettres",
  descriptionAr: "برنامج الرياضيات للسنة الأولى ثانوي - جذع مشترك آداب",
});
