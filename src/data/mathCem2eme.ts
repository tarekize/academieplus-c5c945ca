// Mathématiques - 2ème CEM
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

export const mathCem2emeChapters: Chapter[] = [
    {
        id: "ch1-activites-numeriques-2eme",
        title: "Activités numériques",
        titleAr: "أنشطة عددية",
        lessons: [
            {
                id: "ch1-l1-operations-naturels-decimaux",
                title: "Opérations sur les nombres naturels et les nombres décimaux",
                titleAr: "العمليات على الأعداد الطبيعية والأعداد العشرية"
            },
            {
                id: "ch1-l2-fractions-operations",
                title: "Les fractions et les opérations sur les fractions",
                titleAr: "الكسور و العمليات عليها"
            },
            {
                id: "ch1-l3-nombres-relatifs",
                title: "Les nombres relatifs",
                titleAr: "الأعداد النسبية"
            },
            {
                id: "ch1-l4-concept-equation",
                title: "Le concept d'équation",
                titleAr: "مفهوم معادلة"
            }
        ]
    },
    {
        id: "ch2-fonctions-organisation-donnees-2eme",
        title: "Fonctions et organisation des données",
        titleAr: "الدوال وتنظيم المعطيات",
        lessons: [
            {
                id: "ch2-l1-proportionnalite-2eme",
                title: "Proportionnalité",
                titleAr: "التناسبية"
            },
            {
                id: "ch2-l2-organisation-donnees-2eme",
                title: "Organisation des données",
                titleAr: "تنظيم معطيات"
            }
        ]
    },
    {
        id: "ch3-activites-geometriques-2eme",
        title: "Activités géométriques",
        titleAr: "أنشطة هندسية",
        lessons: [
            {
                id: "ch3-l1-construction-formes-simples",
                title: "Construction de formes géométriques simples",
                titleAr: "إنشاء أشكال هندسية بسيطة"
            },
            {
                id: "ch3-l2-symetrie-centrale",
                title: "La symétrie centrale",
                titleAr: "التناظر المركزي"
            },
            {
                id: "ch3-l3-angles-paralleles",
                title: "Les angles et le parallélisme",
                titleAr: "الزوايا والتوازي"
            },
            {
                id: "ch3-l4-trigonometrie-cercle",
                title: "Trigonométrie et cercle",
                titleAr: "المثلثات والدائرة"
            },
            {
                id: "ch3-l5-parallelogramme",
                title: "Le parallélogramme",
                titleAr: "متوازي الأضلاع"
            },
            {
                id: "ch3-l6-prisme-droit-cylindre",
                title: "Le prisme droit et le cylindre de révolution",
                titleAr: "الموشور القائم و أسطوانة الدوران"
            }
        ]
    }
];

export const getCem2emeCourseInfo = () => ({
    title: "Mathématiques - 2ème CEM",
    titleAr: "الرياضيات - السنة الثانية إعدادي",
    description: "Programme de mathématiques pour la 2ème année du Collège d'Enseignement Moyen",
    descriptionAr: "برنامج الرياضيات للسنة الثانية إعدادي"
});
