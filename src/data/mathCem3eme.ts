// Mathématiques - 3ème CEM
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

export const mathCem3emeChapters: Chapter[] = [
    {
        id: "ch1-activites-numeriques-3eme",
        title: "Activités numériques",
        titleAr: "أنشطة عددية",
        lessons: [
            {
                id: "ch1-l1-nombres-relatifs",
                title: "Les nombres relatifs",
                titleAr: "الأعداد النسبية"
            },
            {
                id: "ch1-l2-operations-fractions-rationnels",
                title: "Opérations sur les fractions et les nombres rationnels",
                titleAr: "العمليات على الكسور والأعداد الناطقة"
            },
            {
                id: "ch1-l3-puissances-relatifs",
                title: "Puissances à exposants relatifs entiers",
                titleAr: "القوى ذات أسس نسبية صحيحة"
            },
            {
                id: "ch1-l4-calcul-litteral-3eme",
                title: "Calcul littéral",
                titleAr: "الحساب الحرفي"
            },
            {
                id: "ch1-l5-egalites-inegalites-equations",
                title: "Égalités - Inégalités - Équations",
                titleAr: "المساويات - المتباينات - المعادلات"
            }
        ]
    },
    {
        id: "ch2-fonctions-organisation-donnees-3eme",
        title: "Fonctions et organisation des données",
        titleAr: "الدوال وتنظيم المعطيات",
        lessons: [
            {
                id: "ch2-l1-proportionnalite",
                title: "Proportionnalité",
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
        id: "ch3-activites-geometriques-3eme",
        title: "Activités géométriques",
        titleAr: "أنشطة هندسية",
        lessons: [
            {
                id: "ch3-l1-demonstration-mathematiques",
                title: "Démonstration en mathématiques",
                titleAr: "البرهان في الرياضيات"
            },
            {
                id: "ch3-l2-trigonometrie",
                title: "Trigonométrie",
                titleAr: "المثلثات"
            },
            {
                id: "ch3-l3-triangle-rectangle-cercle",
                title: "Triangle rectangle et cercle",
                titleAr: "المثلث القائم و الدائرة"
            },
            {
                id: "ch3-l4-pythagore-cosecante",
                title: "Théorème de Pythagore, cosécante d'un angle",
                titleAr: "خاصية فيتاغورس، جيب تمام زاوية"
            },
            {
                id: "ch3-l5-homotheti",
                title: "Homothéties",
                titleAr: "الانسحاب"
            },
            {
                id: "ch3-l6-pyramide-cone-revolution",
                title: "Pyramide et cône de révolution",
                titleAr: "الهرم و مخروط الدوران"
            }
        ]
    }
];

export const getCem3emeCourseInfo = () => ({
    title: "Mathématiques - 3ème CEM",
    titleAr: "الرياضيات - السنة الثالثة إعدادي",
    description: "Programme de mathématiques pour la 3ème année du Collège d'Enseignement Moyen",
    descriptionAr: "برنامج الرياضيات للسنة الثالثة إعدادي"
});
