import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Data structure definitions
interface Lesson {
  title: string;
  titleAr: string;
}

interface Chapter {
  title: string;
  titleAr: string;
  lessons: Lesson[];
}

interface Curriculum {
  schoolLevel: string;
  filiereCode: string | null;
  filiereName?: string;
  filiereNameAr?: string;
  chapters: Chapter[];
}

// All curriculum data
const curriculumData: Curriculum[] = [
  // 5ème Primaire
  {
    schoolLevel: "5eme_primaire",
    filiereCode: null,
    chapters: [
      {
        title: "Situation de départ 1",
        titleAr: "الوضعية الانطلاقية 1",
        lessons: [
          { title: "Les nombres jusqu'à 999 999 '1'", titleAr: "الأعداد إلى 999999 '1'" },
          { title: "Enseignement sur quadrillage", titleAr: "التعليم على مرصوفة واستعمال تصميم" },
          { title: "Addition de nombres naturels", titleAr: "جمع أعداد طبيعية" },
          { title: "Les nombres jusqu'à 999 999 '2'", titleAr: "الأعداد إلى 999 999 '2'" },
          { title: "Soustraction de nombres naturels", titleAr: "ضرح أعداد طبيعية" },
          { title: "Organisation d'informations dans un tableau", titleAr: "تنظيم معلومات في جدول" },
          { title: "Situations additives et soustractives", titleAr: "وضعيات جمعية وطرحية" },
          { title: "Droite et longueur d'un segment", titleAr: "الاستقامية، وطول قطعة مستقيم" },
          { title: "Relations arithmétiques", titleAr: "علاقات حسابية بين أعداد طبيعية" },
          { title: "Les longueurs", titleAr: "الأطوال" },
          { title: "Multiplication par un nombre à deux chiffres", titleAr: "الضرب في عدد برقمين" },
          { title: "Multiplication par un nombre à trois chiffres", titleAr: "الضرب في عدد بثلاثة أرقام" },
          { title: "Organisation d'informations", titleAr: "تنظيم معلومات واستغلالها" },
          { title: "Droites parallèles et perpendiculaires", titleAr: "مستقيمات متوازية ومستقيمات متعامدة" },
          { title: "Les nombres jusqu'à 999 999 999 '1'", titleAr: "الأعداد إلى 999 999 999 '1'" },
          { title: "Les nombres jusqu'à 999 999 999 '2'", titleAr: "الأعداد إلى 999 999 999 '2'" },
          { title: "La calculatrice", titleAr: "الحاسبة" },
          { title: "Dénombrement de grandes quantités", titleAr: "عد كميات كبيرة" },
          { title: "Méthodologie de résolution de problèmes", titleAr: "منهجية حل مشكلات" },
        ],
      },
      {
        title: "Situation de départ 2",
        titleAr: "الوضعية الانطلاقية 2",
        lessons: [
          { title: "Comparaison et classement d'angles", titleAr: "مقارنة وترتيب زوايا" },
          { title: "Utilisation d'un patron ou d'une carte", titleAr: "استعمال تصميم أو خريطة" },
          { title: "Valeur du chiffre selon sa position", titleAr: "قِيمَةُ الرَّقم حَسْبَ مَنْزِلَتِهِ" },
          { title: "Les fractions", titleAr: "الكسور" },
          { title: "Les fractions décimales", titleAr: "الكسور العشرية والأعداد العشرية" },
          { title: "Proportionnalité 1", titleAr: "التناسبية1" },
          { title: "Périmètre du carré et du rectangle", titleAr: "محيط المربع والمستطيل" },
          { title: "La division", titleAr: "القسمة" },
          { title: "Symétrie 1", titleAr: "التناظر1" },
          { title: "Proportionnalité 2", titleAr: "التناسبية2" },
          { title: "Addition et soustraction", titleAr: "حمع وطرح أعداد طبيعية وعشرية (1)" },
          { title: "Situations additives ou multiplicatives", titleAr: "وضعيات جمعية أو ضربية" },
          { title: "Symétrie 2", titleAr: "التناظر2" },
          { title: "La calculatrice", titleAr: "الحاسبة" },
          { title: "Les figures géométriques familières", titleAr: "الأشكال الهندسية المألوفة" },
          { title: "Méthodologie de résolution de problèmes", titleAr: "منهجية حلّ مشكلات" },
        ],
      },
      {
        title: "Situation de départ 3",
        titleAr: "الوضعية الانطلاقية 3",
        lessons: [
          { title: "Les nombres décimaux et la droite graduée", titleAr: "الاعداد العشرية والمستقيم المدرج" },
          { title: "Comparaison et classement de nombres décimaux", titleAr: "مقارنة وترتيب أعداد عشرية" },
          { title: "Multiplication/division par 10, 100, 1000", titleAr: "الضرب في (أو القسمة على) 100.10، 1000" },
          { title: "Proportionnalité (3)", titleAr: "التناسبية (3)" },
          { title: "Multiplication d'un nombre décimal", titleAr: "ضرب عدد عشري في عدد طبيعي" },
          { title: "Décomposition d'un nombre décimal (1)", titleAr: "نفكيك عدد عشري (1)" },
          { title: "Les triangles particuliers", titleAr: "المثلثات الخاصة" },
          { title: "Mesure de surfaces", titleAr: "قياس مساحات" },
          { title: "Aire du carré et du rectangle", titleAr: "مساحة المربع والمستطيل" },
          { title: "Relations arithmétiques décimales", titleAr: "علاقات حسابية بين أعداد عشرية" },
          { title: "Le pourcentage", titleAr: "النسبة المئوية" },
          { title: "Les quadrilatères particuliers", titleAr: "الرباعيات الخاصة" },
          { title: "La division (3)", titleAr: "القسمة (3)" },
          { title: "Mesure de masses", titleAr: "قياس كتل" },
          { title: "Représentations graphiques", titleAr: "تمثيلات بيانية ومخططات" },
          { title: "Le cercle", titleAr: "الدائرة" },
          { title: "La division exacte", titleAr: "القسمة التامة" },
          { title: "Les nombres décimaux et mesures", titleAr: "الأعداد العشرية وقياس مقادير" },
          { title: "Méthodologie de résolution de problèmes", titleAr: "منهجية حل مشكلات" },
        ],
      },
      {
        title: "Situation de départ 4",
        titleAr: "الوضعية الانطلاقية 4",
        lessons: [
          { title: "Les solides", titleAr: "المجسمات" },
          { title: "Situations de division", titleAr: "وضعيات قسمة" },
          { title: "Translation d'une figure", titleAr: "نقل شكل أو إتمامه" },
          { title: "Construction de figures géométriques", titleAr: "إنشاء أشكال هندسية" },
          { title: "Les fractions et les nombres décimaux", titleAr: "الكسور والأعداد العشرية" },
          { title: "Situations de multiplication ou division", titleAr: "وضعيات ضرب أو قسمة" },
          { title: "Mesure de durées", titleAr: "قياس مدد" },
          { title: "Décomposition d'un nombre décimal", titleAr: "تفكيك عدد عشري" },
          { title: "L'échelle", titleAr: "المقياس" },
          { title: "Mesure de capacités", titleAr: "قياس سعات" },
          { title: "Situations arithmétiques", titleAr: "وضعيات حسابية" },
          { title: "La vitesse moyenne", titleAr: "السرعة المتوسطة" },
          { title: "Valeur du chiffre dans un nombre décimal", titleAr: "قِيمَةُ الرَّقم حَسْبَ مَنْزِلَتِه" },
          { title: "Méthodologie de résolution de problèmes", titleAr: "منهجية حلّ مشكلات" },
        ],
      },
    ],
  },
  // 1ère CEM
  {
    schoolLevel: "1ere_cem",
    filiereCode: null,
    chapters: [
      {
        title: "Activités numériques",
        titleAr: "أنشطة عددية",
        lessons: [
          { title: "Les nombres naturels et décimaux", titleAr: "الأعداد الطبيعية والأعداد العشرية" },
          { title: "Calcul: addition et soustraction", titleAr: "الحساب على الأعداد الطبيعية والأعداد العشرية: الجمع والطرح" },
          { title: "Calcul: multiplication et division", titleAr: "الحساب على الأعداد الطبيعية والأعداد العشرية: الضرب والقسمة" },
          { title: "Les écritures fractionnaires", titleAr: "الكتابات الكسرية" },
          { title: "Les nombres relatifs", titleAr: "الأعداد النسبية" },
          { title: "Le calcul littéral", titleAr: "الحساب الحرفي" },
        ],
      },
      {
        title: "Fonctions et organisation des données",
        titleAr: "الدوال وتنظيم المعطيات",
        lessons: [
          { title: "La proportionnalité", titleAr: "التناسبية" },
          { title: "Organisation des données", titleAr: "تنظيم معطيات" },
        ],
      },
      {
        title: "Activités géométriques",
        titleAr: "أنشطة هندسية",
        lessons: [
          { title: "Le parallèle et le perpendiculaire", titleAr: "التوازي والتعامد" },
          { title: "Les formes planes", titleAr: "الأشكال المستوية" },
          { title: "Les surfaces planes", titleAr: "السطوح المستوية: الأطوال، المحيطات، المساحات." },
          { title: "Les angles", titleAr: "الزوايا" },
          { title: "La symétrie axiale", titleAr: "التناظر المحوري" },
          { title: "Les parallélépipèdes et cubes", titleAr: "متوازي المستطيلات والمكعّب" },
        ],
      },
    ],
  },
  // 2ème CEM
  {
    schoolLevel: "2eme_cem",
    filiereCode: null,
    chapters: [
      {
        title: "Activités numériques",
        titleAr: "أنشطة عددية",
        lessons: [
          { title: "Opérations sur les nombres naturels et décimaux", titleAr: "العمليات على الأعداد الطبيعية والأعداد العشرية" },
          { title: "Les fractions et opérations", titleAr: "الكسور و العمليات عليها" },
          { title: "Les nombres relatifs", titleAr: "الأعداد النسبية" },
          { title: "Le concept d'équation", titleAr: "مفهوم معادلة" },
        ],
      },
      {
        title: "Fonctions et organisation des données",
        titleAr: "الدوال وتنظيم المعطيات",
        lessons: [
          { title: "Proportionnalité", titleAr: "التناسبية" },
          { title: "Organisation des données", titleAr: "تنظيم معطيات" },
        ],
      },
      {
        title: "Activités géométriques",
        titleAr: "أنشطة هندسية",
        lessons: [
          { title: "Construction de formes géométriques simples", titleAr: "إنشاء أشكال هندسية بسيطة" },
          { title: "La symétrie centrale", titleAr: "التناظر المركزي" },
          { title: "Les angles et le parallélisme", titleAr: "الزوايا والتوازي" },
          { title: "Trigonométrie et cercle", titleAr: "المثلثات والدائرة" },
          { title: "Le parallélogramme", titleAr: "متوازي الأضلاع" },
          { title: "Le prisme droit et le cylindre", titleAr: "الموشور القائم و أسطوانة الدوران" },
        ],
      },
    ],
  },
  // 3ème CEM
  {
    schoolLevel: "3eme_cem",
    filiereCode: null,
    chapters: [
      {
        title: "Activités numériques",
        titleAr: "أنشطة عددية",
        lessons: [
          { title: "Les nombres relatifs", titleAr: "الأعداد النسبية" },
          { title: "Opérations sur les fractions et rationnels", titleAr: "العمليات على الكسور والأعداد الناطقة" },
          { title: "Puissances à exposants relatifs", titleAr: "القوى ذات أسس نسبية صحيحة" },
          { title: "Calcul littéral", titleAr: "الحساب الحرفي" },
          { title: "Égalités - Inégalités - Équations", titleAr: "المساويات - المتباينات - المعادلات" },
        ],
      },
      {
        title: "Fonctions et organisation des données",
        titleAr: "الدوال وتنظيم المعطيات",
        lessons: [
          { title: "Proportionnalité", titleAr: "التناسبية" },
          { title: "Organisation des données", titleAr: "تنظيم معطيات" },
        ],
      },
      {
        title: "Activités géométriques",
        titleAr: "أنشطة هندسية",
        lessons: [
          { title: "Démonstration en mathématiques", titleAr: "البرهان في الرياضيات" },
          { title: "Trigonométrie", titleAr: "المثلثات" },
          { title: "Triangle rectangle et cercle", titleAr: "المثلث القائم و الدائرة" },
          { title: "Théorème de Pythagore", titleAr: "خاصية فيتاغورس، جيب تمام زاوية" },
          { title: "Homothéties", titleAr: "الانسحاب" },
          { title: "Pyramide et cône de révolution", titleAr: "الهرم و مخروط الدوران" },
        ],
      },
    ],
  },
  // 4ème CEM
  {
    schoolLevel: "4eme_cem",
    filiereCode: null,
    chapters: [
      {
        title: "Activités numériques",
        titleAr: "أنشطة عددية",
        lessons: [
          { title: "Les nombres naturels et rationnels", titleAr: "الأعداد الطبيعية والأعداد الناطقة" },
          { title: "Calcul sur les racines", titleAr: "الحساب على الجذور" },
          { title: "Calcul littéral", titleAr: "الحساب الحَرفي" },
          { title: "Équations et inéquations", titleAr: "المعادلات والمتراجحات" },
          { title: "Systèmes d'équations", titleAr: "جمل معادلتين من الدّرجة الأولى لمجهولين" },
        ],
      },
      {
        title: "Fonctions et organisation des données",
        titleAr: "الدوال وتنظيم المعطيات",
        lessons: [
          { title: "La fonction linéaire et proportionnalité", titleAr: "الدالة الخطية والتناسبية ..." },
          { title: "La fonction quadratique", titleAr: "الدّالة التآلفية" },
          { title: "Statistiques", titleAr: "الإحصاء" },
        ],
      },
      {
        title: "Activités géométriques",
        titleAr: "أنشطة هندسية",
        lessons: [
          { title: "Théorème de Thalès", titleAr: "خاصية طالس" },
          { title: "Trigonométrie dans le triangle rectangle", titleAr: "حساب المثلثات في المثلث القائم" },
          { title: "Rayons et homothéties", titleAr: "الأشعة والانسحاب" },
          { title: "Rayons dans un cercle", titleAr: "الأشعة في معلم" },
          { title: "Rotations - Angles - Polygones réguliers", titleAr: "الدوران - الزوايا - المضلعات المنتظمة .." },
          { title: "Géométrie dans l'espace", titleAr: "الهندسة في الفضاء" },
        ],
      },
    ],
  },
  // Première - Tronc Commun Scientifique
  {
    schoolLevel: "premiere",
    filiereCode: "tronc_commun_scientifique",
    filiereName: "Tronc Commun Scientifique",
    filiereNameAr: "جذع مشترك علوم",
    chapters: [
      {
        title: "Les nombres et le calcul",
        titleAr: "الأعداد والحساب",
        lessons: [
          { title: "Calcul dans les ensembles numériques", titleAr: "ممارسة الحساب في مختلف المجموعات العددية" },
          { title: "Maîtrise du calcul algébrique", titleAr: "التحكم في الحساب الجبري" },
          { title: "Équations et inéquations", titleAr: "اكتساب إجراءات تتعلق بالتعبير عن مشكلات بمعادلات ومتراجحات وحلها" },
          { title: "Utilisation de la calculatrice", titleAr: "استخدام الحاسبة العلمية أو البيانية لإجراء حساب" },
        ],
      },
      {
        title: "Les fonctions",
        titleAr: "الدوال",
        lessons: [
          { title: "Concept de fonction", titleAr: "إدراك مفهوم الدالة بمختلف الصيغ" },
          { title: "Fonctions de référence", titleAr: "معرفة واستعمال خواص الدوال المرجعية" },
          { title: "Tableaux de variations et courbes", titleAr: "قراءة جداول تغيرات ومنحنيات دوال، وتفسيرها" },
          { title: "Résolution de problèmes", titleAr: "اكتساب إجراءات للتعبير عن مشكلات - تتعلق بالدوال - وحلها" },
          { title: "Tracé de courbes avec calculatrice", titleAr: "توظيف الحاسبة البيانية لاستخراج منحني دالة" },
        ],
      },
      {
        title: "La géométrie",
        titleAr: "الهندسة",
        lessons: [
          { title: "Calcul vectoriel", titleAr: "ممارسة الحساب الشعاعي في الهندسة التحليلية" },
          { title: "Problèmes géométriques vectoriels", titleAr: "حل مسائل هندسية تتعلق بالحساب الشعاعي" },
          { title: "Droites et résolution de problèmes", titleAr: "اكتساب إجراءات للتعبير عن مشكلات تتعلق بالمستقيمات، وحلها" },
        ],
      },
      {
        title: "Les statistiques",
        titleAr: "الإحصاء",
        lessons: [
          { title: "Lecture et organisation des données", titleAr: "قراءة معطيات وتنظيمها" },
          { title: "Représentations graphiques", titleAr: "عرض نتائج على شكل مخططات بيانية" },
          { title: "Indicateurs statistiques", titleAr: "تلخيص سلاسل إحصائية بواسطة مؤشرات الموقع" },
          { title: "Calculatrice et statistiques", titleAr: "توظيف الحاسبة العلمية أو البيانية لحساب مؤشرات إحصائية" },
        ],
      },
      {
        title: "Technologies de l'information",
        titleAr: "تكنولوجيات الإعلام والاتصال",
        lessons: [
          { title: "Utilisation de la calculatrice scientifique", titleAr: "استخدام الحاسبة العلمية لبناء تعلّمات" },
          { title: "Logiciels pour expérimentation", titleAr: "استخدام البرمجيات والحاسبة للتجريب والتخمين" },
          { title: "Tracé de courbes de fonctions", titleAr: "توظيف البرمجيات والحاسبة البيانية لاستخراج منحنى دالة" },
          { title: "Indicateurs statistiques", titleAr: "توظيف البرمجيات لحساب مؤشرات الموقع" },
        ],
      },
      {
        title: "Logique et démonstration",
        titleAr: "المنطق والبرهان الرياضي",
        lessons: [
          { title: "Propositions simples et composées", titleAr: "الحكم على القضايا البسيطة والمركبة" },
          { title: "Démonstration par déduction", titleAr: "ممارسة البرهان بالاستنتاج وبالخلف" },
          { title: "Reconnaissance et validation de preuves", titleAr: "التعرف على نمط برهان معطى وشرحه وتصديقه" },
          { title: "Distinction des types de démonstration", titleAr: "التمييز بين أنماط البرهان" },
          { title: "Lien entre démonstration et formule logique", titleAr: "تقريب نمط برهان من صيغة منطقية له" },
        ],
      },
    ],
  },
  // Première - Tronc Commun Lettres
  {
    schoolLevel: "premiere",
    filiereCode: "tronc_commun_lettres",
    filiereName: "Tronc Commun Lettres",
    filiereNameAr: "جذع مشترك آداب",
    chapters: [
      {
        title: "Nombres et calcul",
        titleAr: "الأعداد والحساب",
        lessons: [
          { title: "Calcul dans les ensembles numériques", titleAr: "ممارسة الحساب في مختلف المجموعات العددية" },
          { title: "Maîtrise du calcul algébrique", titleAr: "التحكم في الحساب الجبري" },
          { title: "Équations et inéquations", titleAr: "اكتساب إجراءات تتعلق بالتعبير عن مشكلات بمعادلات ومتراجحات وحلها" },
          { title: "Utilisation de la calculatrice", titleAr: "استخدام الحاسبة العلمية أو البيانية لإجراء حساب" },
        ],
      },
      {
        title: "Les fonctions",
        titleAr: "الدوال",
        lessons: [
          { title: "Concept de fonction", titleAr: "إدراك مفهوم الدالة بمختلف الصيغ" },
          { title: "Fonctions de référence", titleAr: "معرفة واستعمال خواص الدوال المرجعية" },
          { title: "Tableaux de variations et courbes", titleAr: "قراءة جداول تغيرات ومنحنيات دوال، وتفسيرها" },
          { title: "Résolution de problèmes", titleAr: "اكتساب إجراءات للتعبير عن مشكلات -تتعلق بالدوال - وحلها" },
          { title: "Tracé de courbes avec calculatrice", titleAr: "توظيف الحاسبة البيانية لاستخراج منحني دالة" },
        ],
      },
      {
        title: "Géométrie",
        titleAr: "الهندسة",
        lessons: [
          { title: "Calcul vectoriel en géométrie analytique", titleAr: "ممارسة الحساب الشعاعي في الهندسة التحليلية" },
          { title: "Problèmes géométriques vectoriels", titleAr: "حل مسائل هندسية تتعلق بالحساب الشعاعي" },
          { title: "Problèmes sur les droites", titleAr: "اكتساب إجراءات للتعبير عن مشكلات تتعلق بالمستقيمات، وحلها" },
        ],
      },
      {
        title: "Statistiques",
        titleAr: "الإحصاء",
        lessons: [
          { title: "Lecture et organisation des données", titleAr: "قراءة معطيات وتنظيمها" },
          { title: "Diagrammes et graphiques", titleAr: "عرض نتائج على شكل مخططات بيانية" },
          { title: "Indicateurs statistiques", titleAr: "تلخيص سلاسل إحصائية بواسطة مؤشرات الموقع" },
          { title: "Calcul avec calculatrice", titleAr: "توظيف الحاسبة العلمية أو البيانية لحساب مؤشرات إحصائية" },
        ],
      },
    ],
  },
  // Seconde - Sciences/Math techniques/Mathématiques (Arabic curriculum)
  {
    schoolLevel: "seconde",
    filiereCode: "sciences",
    filiereName: "Sciences",
    filiereNameAr: "علوم تجريبية",
    chapters: [
      {
        title: "Les fonctions numériques",
        titleAr: "الدوال العددية",
        lessons: [
          { title: "Rappels sur les fonctions", titleAr: "تذكير حول الدوال" },
          { title: "Les fonctions de référence", titleAr: "الدوال المرجعية" },
          { title: "Opérations sur les fonctions", titleAr: "عمليات على الدوال" },
          { title: "Sens de variation", titleAr: "إتجاه التغير" },
          { title: "Représentation graphique", titleAr: "التمثيل البياني" },
        ],
      },
      {
        title: "Les fonctions polynômes",
        titleAr: "الدوال كثيرات الحدود",
        lessons: [
          { title: "Opérations sur les polynômes", titleAr: "عمليات على كثيرات الحدود" },
          { title: "Équations du second degré", titleAr: "المعادلات من الدرجة الثانية" },
          { title: "Inéquations du second degré", titleAr: "المتراجحات من الدرجة الثانية" },
        ],
      },
      {
        title: "La dérivabilité",
        titleAr: "الإشتقاقية",
        lessons: [
          { title: "Le nombre dérivé", titleAr: "العدد المشتق" },
          { title: "Tangente à une courbe en un point", titleAr: "مماس لمنحن عند نقطة" },
          { title: "Approximation affine d'une fonction", titleAr: "التقريب التآلفي لدالة" },
          { title: "La fonction dérivée d'une fonction", titleAr: "الدالة المشتقة لدالة" },
          { title: "Opérations sur les fonctions dérivées", titleAr: "عمليات على الدوال المشتقة" },
        ],
      },
      {
        title: "Applications de la dérivabilité",
        titleAr: "تطبيقات الإشتقاقية",
        lessons: [
          { title: "Sens de variation d'une fonction", titleAr: "اتجاه تغير دالة" },
          { title: "Extremums locaux", titleAr: "القيم الحدية المحلية" },
          { title: "Encadrement d'une fonction", titleAr: "حصر دالة" },
          { title: "Points remarquables", titleAr: "العناصر الحادة" },
        ],
      },
      {
        title: "Les limites",
        titleAr: "النهايات",
        lessons: [
          { title: "Limite infinie en un point réel", titleAr: "نهاية غير منتهية عند عدد حقيقي" },
          { title: "Limite finie à l'infini", titleAr: "نهاية منتهية عند المالانهاية" },
          { title: "Notion de limite", titleAr: "مفهوم النهاية" },
          { title: "Opérations sur les limites", titleAr: "عمليات على النهايات" },
          { title: "Asymptote oblique", titleAr: "المستقيم المقارب المائل" },
          { title: "Étude d'une fonction", titleAr: "دراسة دالة" },
        ],
      },
      {
        title: "Les suites numériques",
        titleAr: "المتتاليات العددية",
        lessons: [
          { title: "Les suites numériques", titleAr: "المتتاليات العددية" },
          { title: "Représentation graphique d'une suite", titleAr: "التمثيل البياني لمتتالية عددية" },
          { title: "Sens de variation d'une suite", titleAr: "إتجاه تغير متتالية عددية" },
          { title: "Les suites arithmétiques", titleAr: "المتتاليات الحسابية" },
          { title: "Les suites géométriques", titleAr: "المتتاليات الهندسية" },
          { title: "Limite d'une suite numérique", titleAr: "نهاية متتالية عددية" },
          { title: "Limite d'une suite par encadrement", titleAr: "نهاية متتالية عددية باستعمال الحصر" },
          { title: "Limite d'une suite géométrique", titleAr: "نهاية متتالية هندسية" },
        ],
      },
      {
        title: "Le barycentre dans le plan",
        titleAr: "المرجح في المستوي",
        lessons: [
          { title: "Rappels sur les vecteurs", titleAr: "تذكير حول الأشعة" },
          { title: "Barycentre de deux points", titleAr: "مرجح نقطتين" },
          { title: "Barycentre de trois points", titleAr: "مرجح ثلاث نقاط" },
          { title: "Coordonnées du barycentre", titleAr: "إحداثيات مرجح ثلاث نقاط" },
          { title: "Barycentre de plusieurs points", titleAr: "مرجح عدة نقاط" },
        ],
      },
    ],
  },
  // Seconde - Lettres & Gestion
  {
    schoolLevel: "seconde",
    filiereCode: "lettres",
    filiereName: "Lettres",
    filiereNameAr: "آداب وفلسفة",
    chapters: [
      {
        title: "Pourcentages et indicateurs",
        titleAr: "النسب المئوية والمؤشرات",
        lessons: [
          { title: "Rapport d'une partie à un tout", titleAr: "نسبة الجزء إِلى الكلّ" },
          { title: "Pourcentage d'un autre pourcentage", titleAr: "النسبة المئوية لنسبة مئوية أخرى" },
          { title: "Évolutions et pourcentages", titleAr: "التطورات والنسب المئوية" },
          { title: "Indicateurs", titleAr: "المؤشرات" },
        ],
      },
      {
        title: "Statistiques",
        titleAr: "الإِحصاء",
        lessons: [
          { title: "Séries chronologiques", titleAr: "السلاسل الزمنية" },
          { title: "Lissage par moyennes mobiles", titleAr: "التمليس بالأوساط المتحركة" },
          { title: "Histogrammes", titleAr: "المدرجات التكرارية" },
          { title: "Variance et écart-type", titleAr: "التباين-الإنحراف المعياري" },
          { title: "Quartiles et diagramme en boîte", titleAr: "الربعيات والعشريات-المخطط بالعلبة" },
          { title: "Expérience aléatoire et simulation", titleAr: "التجربة العشوائية - المحاكاة" },
        ],
      },
      {
        title: "Généralités sur les fonctions",
        titleAr: "عموميات على الدوال",
        lessons: [
          { title: "Fonction 'cube'", titleAr: "الدالة ((مكعب))" },
          { title: "Opérations sur les fonctions", titleAr: "العمليات على الدوال" },
          { title: "Courbes et transformations", titleAr: "المنحنيات والتحويلات النقطية البسيطة" },
          { title: "Éléments de symétrie des courbes", titleAr: "عناصر تناظر منحنيات" },
        ],
      },
      {
        title: "Équations et inéquations",
        titleAr: "المعادلات والمتراجحات",
        lessons: [
          { title: "Trinôme du second degré", titleAr: "ثلاثي الحدود من الدرجة الثانية" },
          { title: "Équations du second degré", titleAr: "المعادلات من الدرجة الثانية" },
          { title: "Inéquations du second degré", titleAr: "المتراجحات من الدرجة الثانية" },
          { title: "Résolution graphique", titleAr: "حلّ معادلات ومتراجحات من الدرجة الثانية بيانيّا" },
        ],
      },
      {
        title: "Dérivation",
        titleAr: "الإِشتقاق",
        lessons: [
          { title: "Nombre dérivé", titleAr: "العدد المشتق" },
          { title: "Équation de la tangente", titleAr: "معادلة المماس لمنحن عند نقطة" },
          { title: "Fonctions dérivées", titleAr: "الدوال المشتقة" },
          { title: "Opérations sur les fonctions dérivées", titleAr: "عمليات على الدوال المشتقة" },
          { title: "Fonction dérivée et sens de variation", titleAr: "الدالة المشتقة وإتجاه التغير" },
          { title: "Extremums d'une fonction", titleAr: "القيم الحدية لدالة" },
          { title: "Approximation affine tangente", titleAr: "التقريب التآلفي المماسي لدالة" },
        ],
      },
      {
        title: "Comportement asymptotique",
        titleAr: "السلوك التقاربي",
        lessons: [
          { title: "Limites de fonctions usuelles", titleAr: "نهايات دوال مألوفة" },
          { title: "Opérations sur les limites", titleAr: "العمليات على النهايات" },
          { title: "Asymptotes", titleAr: "المستقيمات المقاربة" },
        ],
      },
      {
        title: "Suites numériques",
        titleAr: "المتتاليات العددية",
        lessons: [
          { title: "Généralités", titleAr: "عموميات" },
          { title: "Suites arithmétiques", titleAr: "المتتاليات الحسابية" },
          { title: "Suites géométriques", titleAr: "المتتاليات االهندسية" },
        ],
      },
      {
        title: "Systèmes linéaires",
        titleAr: "الجمل الخطية",
        lessons: [
          { title: "Équations linéaires à deux inconnues", titleAr: "المعادلات الخطية لمجهولين" },
          { title: "Systèmes de deux équations", titleAr: "جمل معادلتين خطيتين لمجهولين" },
          { title: "Systèmes de trois équations", titleAr: "جمل ثلاث معادلات خطية لثلاثة مجاهيل" },
          { title: "Inéquations linéaires", titleAr: "المتراجحات الخطية لمجهولين" },
        ],
      },
      {
        title: "Probabilités",
        titleAr: "الإحتمالات",
        lessons: [
          { title: "Vocabulaire des probabilités", titleAr: "مفردات الإحتمالات" },
          { title: "Probabilités", titleAr: "الاحتمالات" },
        ],
      },
    ],
  },
  // Terminale - Sciences
  {
    schoolLevel: "terminale",
    filiereCode: "sciences",
    filiereName: "Sciences Expérimentales",
    filiereNameAr: "علوم تجريبية",
    chapters: [
      {
        title: "Limites et continuité",
        titleAr: "النهايات والاستمرارية",
        lessons: [
          { title: "Limite finie ou infinie en ±∞", titleAr: "نهاية منتهية أو غير منتهية عند ∞+ أو ∞-" },
          { title: "Limite finie ou infinie en un point", titleAr: "نهاية منتهية أو غير منتهية عند عدد حقيقي" },
          { title: "Compléments sur les limites", titleAr: "تتمات على النهايات" },
          { title: "Limite d'une fonction composée", titleAr: "نهاية دالة مركبة - النهايات بالمقارنة" },
          { title: "Continuité", titleAr: "الاستمرارية" },
          { title: "Théorème des valeurs intermédiaires", titleAr: "مبرهنة القيم المتوسطة" },
          { title: "Fonctions continues et strictement monotones", titleAr: "الدوال المستمرة والرتيبة تماما" },
        ],
      },
      {
        title: "Dérivabilité",
        titleAr: "الاشتقاقية",
        lessons: [
          { title: "Dérivabilité", titleAr: "الاشتقاقية" },
          { title: "Dérivées et opérations", titleAr: "المشتقات والعمليات" },
          { title: "Sens de variation d'une fonction", titleAr: "إتجاه التغير دالة" },
          { title: "Dérivée d'une fonction composée", titleAr: "اشتقاق دالة مركبة" },
          { title: "Approximation affine - Méthode d'Euler", titleAr: "التقريب التألفي - طريقة أولر" },
          { title: "Étude de fonction trigonométrique", titleAr: "دراسة دالة مثلثية" },
        ],
      },
      {
        title: "Fonctions exponentielles et logarithmiques",
        titleAr: "الدوال الأسية واللوغاريتمية",
        lessons: [
          { title: "Fonction exponentielle", titleAr: "الدالة الأسية" },
          { title: "Fonctions exponentielles x ↦ e^x", titleAr: "الدوال الأسية x ↦ e^x" },
          { title: "Étude de la fonction exponentielle", titleAr: "دراسة الدالة الأسية" },
          { title: "Étude de la fonction exp(u)", titleAr: "دراسة الدالة exp(u)" },
          { title: "Fonction logarithme népérien", titleAr: "الدالة اللوغاريتمية النيبيرية" },
          { title: "Propriétés algébriques", titleAr: "الخواص الجبرية" },
          { title: "Étude de la fonction logarithme népérien", titleAr: "دراسة الدالة اللوغاريتمية النيبيرية" },
          { title: "Fonction logarithme décimal", titleAr: "الدالة اللوغاريتمية العشرية" },
          { title: "Étude de la fonction ln(u)", titleAr: "دراسة الدالة ln(u)" },
        ],
      },
      {
        title: "Croissance comparée",
        titleAr: "التزايد المقارن",
        lessons: [
          { title: "Puissances d'un nombre réel positif", titleAr: "قوى عدد حقيقي موجب" },
          { title: "Étude des fonctions x ↦ a^x et x ↦ ⁿ√x", titleAr: "دراسة الدالة x ↦ a^x و x ↦ ⁿ√x" },
          { title: "Croissance comparée", titleAr: "التزايد المقارن" },
        ],
      },
      {
        title: "Primitives",
        titleAr: "الدوال الأصلية",
        lessons: [
          { title: "Primitives", titleAr: "الدوال الأصلية" },
          { title: "Calcul de primitives", titleAr: "حساب الدوال الأصلية" },
          { title: "Équations différentielles", titleAr: "المعادلات التفاضلية" },
        ],
      },
      {
        title: "Calcul intégral",
        titleAr: "الحساب التكاملي",
        lessons: [
          { title: "Intégrale d'une fonction", titleAr: "تكامل دالة" },
          { title: "Propriétés de l'intégrale", titleAr: "خواص التكامل" },
          { title: "Valeur moyenne", titleAr: "القيمة المتوسطة" },
          { title: "Extension aux fonctions de signe quelconque", titleAr: "التمديد إلى دالة إشارتها كيفية" },
          { title: "Utilisation du calcul intégral", titleAr: "توظيف الحساب التكاملي لحساب دوال أصلية" },
          { title: "Applications du calcul intégral", titleAr: "بعض تطبيقات الحساب التكاملي" },
        ],
      },
      {
        title: "Probabilités conditionnelles",
        titleAr: "الاحتمالات الشرطية",
        lessons: [
          { title: "Dénombrement", titleAr: "العد (القوائم - الترتيبات - التبديلات)" },
          { title: "Combinaisons - Formule du binôme", titleAr: "التوفيقات - دستور ثنائي الحد" },
          { title: "Modélisation d'une expérience aléatoire", titleAr: "نمذجة تجربة عشوائية: المتغير العشوائي" },
          { title: "Probabilités conditionnelles", titleAr: "الاحتمالات الشرطية" },
          { title: "Événements indépendants", titleAr: "الحوادث المستقلة والمتغيرات العشوائية المستقلة" },
        ],
      },
      {
        title: "Lois de probabilité",
        titleAr: "قوانين الاحتمال",
        lessons: [
          { title: "Loi de Bernoulli", titleAr: "قانون برنولي" },
          { title: "Lois de probabilité continues", titleAr: "قوانين الاحتمالات المستمرة" },
          { title: "Adéquation à une loi équirépartie", titleAr: "قياس تلاؤم سلسلة مشاهدة ونموذج احتمالي" },
          { title: "Loi exponentielle", titleAr: "القانون الأسي" },
        ],
      },
    ],
  },
  // Terminale - Lettres
  {
    schoolLevel: "terminale",
    filiereCode: "lettres",
    filiereName: "Lettres et Philosophie",
    filiereNameAr: "آداب وفلسفة",
    chapters: [
      {
        title: "Suites numériques",
        titleAr: "المتتاليات العددية",
        lessons: [
          { title: "Génération et reconnaissance de suites", titleAr: "توليد متتالية: التعرف على متتاليات" },
          { title: "Suites arithmétiques", titleAr: "المتتاليات الحسابية: التعريف ، الحد العام ؛ الوسط الحسابي" },
          { title: "Somme des premiers termes arithmétiques", titleAr: "حساب مجموع الحدود الاولى من متتالية حسابية" },
          { title: "Suites géométriques", titleAr: "المتتاليات الهندسية: التعريف ، الحد العام؛ الوسط الهندسي" },
          { title: "Somme des premiers termes géométriques", titleAr: "حساب مجموع الحدود الاولى من متتالية هندسية" },
          { title: "Suites récurrentes", titleAr: "التعرّف على متتالية بالتراجع - حساب الحدود الأولى" },
          { title: "Monotonie d'une suite", titleAr: "مفهوم المتتالية الرتيبة وتعيين اتجاه تغيّرها" },
          { title: "Sens de variation", titleAr: "تحديد اتجاه تغيّر متتالية حسابية وهندسية" },
          { title: "Application des suites", titleAr: "استعمال المتتاليات الحسابية والهندسية في حل المشكلات" },
          { title: "Suites arithmotico-géométriques", titleAr: "المتتاليات من الشكل Un+1=a Un +b" },
          { title: "Résolution de problèmes", titleAr: "حل مشكلات تُستعمل فيها متتاليات من الشكل Un+1=a Un +b" },
        ],
      },
      {
        title: "Arithmétique",
        titleAr: "الحساب",
        lessons: [
          { title: "Division euclidienne dans Z", titleAr: "القسمة الإقليدية في Z" },
          { title: "Ensemble des diviseurs", titleAr: "تعيين مجموعة قواسم عدد طبيعي" },
          { title: "Congruences dans Z", titleAr: "الموافقات في Z" },
          { title: "Propriétés des congruences", titleAr: "معرفة خواص الموافقة واستعمالها في حل المشکلات" },
          { title: "Raisonnement par récurrence", titleAr: "الاستدلال بالتراجع" },
        ],
      },
      {
        title: "Étude de fonctions",
        titleAr: "دراسة الدوال",
        lessons: [
          { title: "Rappels : Dérivées et équation de la tangente", titleAr: "تذكير حول المشتقات ومعادلة المماس" },
          { title: "Étude des variations d'une fonction", titleAr: "الدراسة والتمثيل البياني لدالة" },
          { title: "Fonctions polynômes", titleAr: "الدوال كثيرات الحدود" },
          { title: "Point d'inflexion", titleAr: "تعيين نقطة الانعطاف" },
          { title: "Lecture graphique", titleAr: "القراءة البيانية" },
          { title: "Résolution graphique", titleAr: "استعمال التمثيل البياني لحل معادلات أو متراجحات" },
          { title: "Fonctions homographiques", titleAr: "الدوال التناظرية" },
          { title: "Asymptotes et interprétation", titleAr: "تعيين المستقيمات المقاربة وتفسيرها بيانيا" },
          { title: "Conjecture des limites", titleAr: "استعمال التمثيل البياني لتخمين النهايات" },
        ],
      },
      {
        title: "Statistiques et Probabilités",
        titleAr: "الإحصاء و الاحتمالات",
        lessons: [
          { title: "Simulation et fréquences", titleAr: "محاكاة تجربة عشوائية وملاحظة تواترات القيم" },
          { title: "Calcul de la probabilité", titleAr: "حساب احتمال حدث بسيط او مركب" },
          { title: "Loi de probabilité", titleAr: "قانون الاحتمال المتعلق بتجربة عشوائية" },
          { title: "Espérance mathématique et variance", titleAr: "األمل الرياضياتي والتباين" },
        ],
      },
    ],
  },
  // Terminale - Gestion
  {
    schoolLevel: "terminale",
    filiereCode: "gestion",
    filiereName: "Gestion et Économie",
    filiereNameAr: "تسيير واقتصاد",
    chapters: [
      {
        title: "Suites numériques",
        titleAr: "المتتاليات العددية",
        lessons: [
          { title: "Généralités sur les suites", titleAr: "عموميات حول المتتاليات الحسابية والمتتاليات الهندسية" },
          { title: "Raisonnement par récurrence", titleAr: "الاستدلال بالتراجع" },
          { title: "Suites bornées", titleAr: "المتتاليات المحدودة" },
          { title: "Suites monotones", titleAr: "المتتاليات الرتيبة" },
          { title: "Suites convergentes", titleAr: "المتتاليات المتقاربة" },
          { title: "Suite définie par Un+1 = aUn + b", titleAr: "التعرف على متتالية معرفة بالعلاقة : Un+1= aUn+bو حساب حدودها" },
          { title: "Convergence d'une suite récurrente", titleAr: "تقارب متتالية تراجعية" },
        ],
      },
      {
        title: "Dérivabilité et continuité",
        titleAr: "الاشتقاقية والاستمرارية",
        lessons: [
          { title: "Rappel sur la dérivation", titleAr: "الاشتقاقية تذكير: العدد المشتق" },
          { title: "Fonctions dérivées", titleAr: "الدوال المشتقة" },
          { title: "Dérivées et extrema locaux", titleAr: "المشتقات والقيم الحدية المحلية" },
          { title: "Composition de fonctions", titleAr: "مركب دالتين، اشتقاق دالة مركبة" },
          { title: "Continuité et TVI", titleAr: "الإستمرارية: مبرهنة القيم المتوسطة" },
        ],
      },
      {
        title: "Limites",
        titleAr: "النهايات",
        lessons: [
          { title: "Opérations sur les limites", titleAr: "العمليات على النهايات" },
          { title: "Asymptotes", titleAr: "المستقيمات المقاربة" },
        ],
      },
      {
        title: "Étude de fonctions",
        titleAr: "دراسة الدوال",
        lessons: [
          { title: "Asymptote oblique", titleAr: "إثبات وجود مستقيم مقارب مائل" },
        ],
      },
      {
        title: "Primitives et intégrales",
        titleAr: "الدوال الأصلية والتكاملات",
        lessons: [
          { title: "Primitives d'une fonction", titleAr: "الدوال الأصلية لدالة على مجال" },
          { title: "Calcul de primitives", titleAr: "حساب دوال اصلة لدوال بسيطة" },
          { title: "Propriétés de l'intégrale", titleAr: "خواص التكامل: الخطية - علاقةشال- الترتيب" },
          { title: "Application de l'intégrale au calcul d'aires", titleAr: "توظيف التكامل فى حساب المساحات" },
        ],
      },
      {
        title: "Fonctions logarithmiques et exponentielles",
        titleAr: "الدوال اللوغارتمية والأسية",
        lessons: [
          { title: "Fonction logarithme népérien", titleAr: "الدالة اللوغاريتمية النيبيرية" },
          { title: "Étude de la fonction ln", titleAr: "دراسة دوال من الشكل: In" },
          { title: "Étude de la fonction ln(u)", titleAr: "دراسة دوال من الشكل Inou" },
          { title: "Fonction logarithme de base a", titleAr: "الدالة اللوغاريتمية ذات الأساس ه" },
          { title: "Fonctions exponentielles", titleAr: "الدوال الأسية" },
          { title: "Étude de la fonction exponentielle", titleAr: "الدراسة والتمثيل البيانى للدالة الاسية" },
        ],
      },
      {
        title: "Statistiques",
        titleAr: "الإحصاء",
        lessons: [
          { title: "Série statistique à deux variables", titleAr: "تعريف سلسلة إحصائية لمتغيرين حقيقيين" },
          { title: "Nuage de points", titleAr: "تمثيل سلسلة إحصائية لمتغيرين حقيقيين بسحابة نقط" },
          { title: "Point moyen", titleAr: "تعيين إحداثيي النقطة المتوسطة" },
          { title: "Ajustement linéaire", titleAr: "إنشاء مستقيم تعديل خطي" },
          { title: "Exemples de séries statistiques", titleAr: "أمثلة لسلاسل احصائية من الشكل (X;Iny)" },
        ],
      },
      {
        title: "Probabilités",
        titleAr: "الإحتمالات",
        lessons: [
          { title: "Loi de probabilité", titleAr: "قانون احتمال مرفق بتجربة عشوائية" },
          { title: "Espérance, variance et écart type", titleAr: "الأمل الرياضياتي والتباين والانحراف المعياري" },
          { title: "Probabilité conditionnelle", titleAr: "الاحتمال الشرطي" },
          { title: "Arbre pondéré", titleAr: "الشجرة المتوازنة" },
          { title: "Formule des probabilités totales", titleAr: "استعمال أشجار متوازنة أو دستور الاحتمالات الكلية" },
          { title: "Indépendance de deux événements", titleAr: "استقلال حادثتين" },
        ],
      },
    ],
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const results = {
      filieres: 0,
      chapters: 0,
      lessons: 0,
      errors: [] as string[],
    };

    for (const curriculum of curriculumData) {
      let filiereId: string | null = null;

      // Create filiere if needed
      if (curriculum.filiereCode) {
        const { data: existingFiliere } = await supabase
          .from("filieres")
          .select("id")
          .eq("code", curriculum.filiereCode)
          .eq("school_level", curriculum.schoolLevel)
          .maybeSingle();

        if (existingFiliere) {
          filiereId = existingFiliere.id;
        } else {
          const { data: newFiliere, error: filiereError } = await supabase
            .from("filieres")
            .insert({
              code: curriculum.filiereCode,
              name: curriculum.filiereName || curriculum.filiereCode,
              name_ar: curriculum.filiereNameAr,
              school_level: curriculum.schoolLevel,
            })
            .select()
            .single();

          if (filiereError) {
            results.errors.push(`Filiere ${curriculum.filiereCode}: ${filiereError.message}`);
            continue;
          }
          filiereId = newFiliere.id;
          results.filieres++;
        }
      }

      // Create chapters
      for (let chapterIndex = 0; chapterIndex < curriculum.chapters.length; chapterIndex++) {
        const chapter = curriculum.chapters[chapterIndex];

        // Check if chapter already exists
        const { data: existingChapter } = await supabase
          .from("chapters")
          .select("id")
          .eq("school_level", curriculum.schoolLevel)
          .eq("title", chapter.title)
          .eq("filiere_id", filiereId)
          .maybeSingle();

        let chapterId: string;

        if (existingChapter) {
          chapterId = existingChapter.id;
        } else {
          const { data: newChapter, error: chapterError } = await supabase
            .from("chapters")
            .insert({
              school_level: curriculum.schoolLevel,
              filiere_id: filiereId,
              subject: "math",
              title: chapter.title,
              title_ar: chapter.titleAr,
              order_index: chapterIndex,
            })
            .select()
            .single();

          if (chapterError) {
            results.errors.push(`Chapter ${chapter.title}: ${chapterError.message}`);
            continue;
          }
          chapterId = newChapter.id;
          results.chapters++;
        }

        // Create lessons
        for (let lessonIndex = 0; lessonIndex < chapter.lessons.length; lessonIndex++) {
          const lesson = chapter.lessons[lessonIndex];

          // Check if lesson already exists
          const { data: existingLesson } = await supabase
            .from("lessons")
            .select("id")
            .eq("chapter_id", chapterId)
            .eq("title", lesson.title)
            .maybeSingle();

          if (!existingLesson) {
            const { error: lessonError } = await supabase
              .from("lessons")
              .insert({
                chapter_id: chapterId,
                title: lesson.title,
                title_ar: lesson.titleAr,
                order_index: lessonIndex,
              });

            if (lessonError) {
              results.errors.push(`Lesson ${lesson.title}: ${lessonError.message}`);
            } else {
              results.lessons++;
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Migration completed",
      results,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
