// Mathématiques - 1ère CEM
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

export const mathCem1ereChapters: Chapter[] = [
    {
        id: "ch1-activites-numeriques",
        title: "Activités numériques",
        titleAr: "أنشطة عددية",
        lessons: [
            {
                id: "ch1-l1-nombres-naturels-decimaux",
                title: "Les nombres naturels et les nombres décimaux",
                titleAr: "الأعداد الطبيعية والأعداد العشرية"
            },
            {
                id: "ch1-l2-calcul-addition-soustraction",
                title: "Calcul sur les nombres naturels et décimaux: addition et soustraction",
                titleAr: "الحساب على الأعداد الطبيعية والأعداد العشرية: الجمع والطرح"
            },
            {
                id: "ch1-l3-calcul-multiplication-division",
                title: "Calcul sur les nombres naturels et décimaux: multiplication et division",
                titleAr: "الحساب على الأعداد الطبيعية والأعداد العشرية: الضرب والقسمة"
            },
            {
                id: "ch1-l4-ecritures-fractionnaires",
                title: "Les écritures fractionnaires",
                titleAr: "الكتابات الكسرية"
            },
            {
                id: "ch1-l5-nombres-relatifs",
                title: "Les nombres relatifs",
                titleAr: "الأعداد النسبية"
            },
            {
                id: "ch1-l6-calcul-litteral",
                title: "Le calcul littéral",
                titleAr: "الحساب الحرفي"
            }
        ]
    },
    {
        id: "ch2-fonctions-organisation-donnees",
        title: "Fonctions et organisation des données",
        titleAr: "الدوال وتنظيم المعطيات",
        lessons: [
            {
                id: "ch2-l1-proportionalite",
                title: "La proportionnalité",
                titleAr: "التناسبية"
            },
            {
                id: "ch2-l2-organisation-donnees",
                title: "Organisation des données",
                titleAr: "تنظيم معطيات"
            }
        ]
    },
    {
        id: "ch3-activites-geometriques",
        title: "Activités géométriques",
        titleAr: "أنشطة هندسية",
        lessons: [
            {
                id: "ch3-l1-parallele-perpendiculaire",
                title: "Le parallèle et le perpendiculaire",
                titleAr: "التوازي والتعامد"
            },
            {
                id: "ch3-l2-formes-plani",
                title: "Les formes plani",
                titleAr: "الأشكال المستوية"
            },
            {
                id: "ch3-l3-surfaces-plani-longueurs-perimetres-aires",
                title: "Les surfaces plani: longueurs, périmètres, aires",
                titleAr: "السطوح المستوية: الأطوال، المحيطات، المساحات."
            },
            {
                id: "ch3-l4-angles",
                title: "Les angles",
                titleAr: "الزوايا"
            },
            {
                id: "ch3-l5-symetrie-axiale",
                title: "La symétrie axiale",
                titleAr: "التناظر المحوري"
            },
            {
                id: "ch3-l6-parallelepipedes-rectangles-cubes",
                title: "Les parallélépipèdes rectangles et les cubes",
                titleAr: "متوازي المستطيلات والمكعّب"
            }
        ]
    }
];

export const getCem1ereCourseInfo = () => ({
    title: "Mathématiques - 1ère CEM",
    titleAr: "الرياضيات - السنة الأولى إعدادي",
    description: "Programme de mathématiques pour la 1ère année du Collège d'Enseignement Moyen",
    descriptionAr: "برنامج الرياضيات للسنة الأولى إعدادي"
});
