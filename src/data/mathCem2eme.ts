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
        titleAr: "أÙ†شطة عددÙŠة",
        lessons: [
            {
                id: "ch1-l1-operations-naturels-decimaux",
                title: "Opérations sur les nombres naturels et les nombres décimaux",
                titleAr: "اÙ„عÙ…Ù„ÙŠات عÙ„Ù‰ اÙ„أعداد اÙ„طبÙŠعÙŠة ÙˆاÙ„أعداد اÙ„عشرÙŠة"
            },
            {
                id: "ch1-l2-fractions-operations",
                title: "Les fractions et les opérations sur les fractions",
                titleAr: "اÙ„ÙƒسÙˆر Ùˆ اÙ„عÙ…Ù„ÙŠات عÙ„ÙŠÙ‡ا"
            },
            {
                id: "ch1-l3-nombres-relatifs",
                title: "Les nombres relatifs",
                titleAr: "اÙ„أعداد اÙ„Ù†سبÙŠة"
            },
            {
                id: "ch1-l4-concept-equation",
                title: "Le concept d'équation",
                titleAr: "Ù…فÙ‡ÙˆÙ… Ù…عادÙ„ة"
            }
        ]
    },
    {
        id: "ch2-fonctions-organisation-donnees-2eme",
        title: "Fonctions et organisation des données",
        titleAr: "اÙ„دÙˆاÙ„ ÙˆتÙ†ظÙŠÙ… اÙ„Ù…عطÙŠات",
        lessons: [
            {
                id: "ch2-l1-proportionnalite-2eme",
                title: "Proportionnalité",
                titleAr: "اÙ„تÙ†اسبÙŠة"
            },
            {
                id: "ch2-l2-organisation-donnees-2eme",
                title: "Organisation des données",
                titleAr: "تÙ†ظÙŠÙ… Ù…عطÙŠات"
            }
        ]
    },
    {
        id: "ch3-activites-geometriques-2eme",
        title: "Activités géométriques",
        titleAr: "أÙ†شطة Ù‡Ù†دسÙŠة",
        lessons: [
            {
                id: "ch3-l1-construction-formes-simples",
                title: "Construction de formes géométriques simples",
                titleAr: "إÙ†شاء أشÙƒاÙ„ Ù‡Ù†دسÙŠة بسÙŠطة"
            },
            {
                id: "ch3-l2-symetrie-centrale",
                title: "La symétrie centrale",
                titleAr: "اÙ„تÙ†اظر اÙ„Ù…رÙƒزÙŠ"
            },
            {
                id: "ch3-l3-angles-paralleles",
                title: "Les angles et le parallélisme",
                titleAr: "اÙ„زÙˆاÙŠا ÙˆاÙ„تÙˆازÙŠ"
            },
            {
                id: "ch3-l4-trigonometrie-cercle",
                title: "Trigonométrie et cercle",
                titleAr: "اÙ„Ù…ثÙ„ثات ÙˆاÙ„دائرة"
            },
            {
                id: "ch3-l5-parallelogramme",
                title: "Le parallélogramme",
                titleAr: "Ù…تÙˆازÙŠ اÙ„أضÙ„اع"
            },
            {
                id: "ch3-l6-prisme-droit-cylindre",
                title: "Le prisme droit et le cylindre de révolution",
                titleAr: "اÙ„Ù…ÙˆشÙˆر اÙ„Ù‚ائÙ… Ùˆ أسطÙˆاÙ†ة اÙ„دÙˆراÙ†"
            }
        ]
    }
];

export const getCem2emeCourseInfo = () => ({
    title: "Mathématiques - 2ème CEM",
    titleAr: "اÙ„رÙŠاضÙŠات - اÙ„سÙ†ة اÙ„ثاÙ†ÙŠة إعدادÙŠ",
    description: "Programme de mathématiques pour la 2ème année du Collège d'Enseignement Moyen",
    descriptionAr: "برÙ†اÙ…ج اÙ„رÙŠاضÙŠات Ù„Ù„سÙ†ة اÙ„ثاÙ†ÙŠة إعدادÙŠ"
});
