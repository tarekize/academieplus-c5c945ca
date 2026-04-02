// Mathématiques - 4ème CEM
// Programme structuré en 3 chapitres

export interface Chapter {
    id: string;
    title: string;
    titleAr: string;
    lessons: Lesson[];
}

export interface Lesson {
    id: string;
    title: string;
    titleAr: string;
}

export const mathCem4emeChapters: Chapter[] = [
    {
        id: "ch1-activites-numeriques",
        title: "Activités numériques",
        titleAr: "أنشطة عددية",
        lessons: [
            {
                id: "ch1-l1-nombres-naturels-rationnels",
                title: "Les nombres naturels et les nombres rationnels",
                titleAr: "الأعداد الطبيعية والأعداد الناطقة"
            },
            {
                id: "ch1-l2-calcul-racines",
                title: "Calcul sur les racines",
                titleAr: "الحساب على الجذور"
            },
            {
                id: "ch1-l3-calcul-litteral",
                title: "Calcul littéral",
                titleAr: "الحساب الحَرفي"
            },
            {
                id: "ch1-l4-equations-inequations",
                title: "Équations et inéquations",
                titleAr: "المعادلات والمتراجحات"
            },
            {
                id: "ch1-l5-systemes-equations",
                title: "Systèmes d'équations du premier degré à deux inconnues",
                titleAr: "جمل معادلتين من الدّرجة الأولى لمجهولين"
            }
        ]
    },
    {
        id: "ch2-fonctions-organisation-donnees",
        title: "Fonctions et organisation des données",
        titleAr: "الدوال وتنظيم المعطيات",
        lessons: [
            {
                id: "ch2-l1-fonction-lineaire-proportionnalite",
                title: "La fonction linéaire et la proportionnalité",
                titleAr: "الدالة الخطية والتناسبية ..."
            },
            {
                id: "ch2-l2-fonction-quadratique",
                title: "La fonction quadratique",
                titleAr: "الدّالة التآلفية"
            },
            {
                id: "ch2-l3-statistiques",
                title: "Statistiques",
                titleAr: "الإحصاء"
            }
        ]
    },
    {
        id: "ch3-activites-geometriques",
        title: "Activités géométriques",
        titleAr: "أنشطة هندسية",
        lessons: [
            {
                id: "ch3-l1-theoreme-thales",
                title: "Théorème de Thalès",
                titleAr: "خاصية طالس"
            },
            {
                id: "ch3-l2-trigonometrie-triangle-rectangle",
                title: "Trigonométrie dans le triangle rectangle",
                titleAr: "حساب المثلثات في المثلث القائم"
            },
            {
                id: "ch3-l3-rayons-homotheti",
                title: "Rayons et homothéties",
                titleAr: "الأشعة والانسحاب"
            },
            {
                id: "ch3-l4-rayons-centre",
                title: "Rayons dans un cercle",
                titleAr: "الأشعة في معلم"
            },
            {
                id: "ch3-l5-rotations-angles-polygones",
                title: "Rotations - Angles - Polygones réguliers",
                titleAr: "الدوران - الزوايا - المضلعات المنتظمة .."
            },
            {
                id: "ch3-l6-geometrie-espace",
                title: "Géométrie dans l'espace",
                titleAr: "الهندسة في الفضاء"
            }
        ]
    }
];

export const getCem4emeCourseInfo = () => ({
    title: "Mathématiques - 4ème CEM",
    titleAr: "الرياضيات - السنة الرابعة إعدادي",
    description: "Programme de mathématiques pour la 4ème année du Collège d'Enseignement Moyen",
    descriptionAr: "برنامج الرياضيات للسنة الرابعة إعدادي"
});
