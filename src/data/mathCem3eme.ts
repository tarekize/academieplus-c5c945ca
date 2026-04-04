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
        titleAr: "أÙ†شطة عددÙŠة",
        lessons: [
            {
                id: "ch1-l1-nombres-relatifs",
                title: "Les nombres relatifs",
                titleAr: "اÙ„أعداد اÙ„Ù†سبÙŠة"
            },
            {
                id: "ch1-l2-operations-fractions-rationnels",
                title: "Opérations sur les fractions et les nombres rationnels",
                titleAr: "اÙ„عÙ…Ù„ÙŠات عÙ„Ù‰ اÙ„ÙƒسÙˆر ÙˆاÙ„أعداد اÙ„Ù†اطÙ‚ة"
            },
            {
                id: "ch1-l3-puissances-relatifs",
                title: "Puissances à exposants relatifs entiers",
                titleAr: "اÙ„Ù‚ÙˆÙ‰ ذات أسس Ù†سبÙŠة صحÙŠحة"
            },
            {
                id: "ch1-l4-calcul-litteral-3eme",
                title: "Calcul littéral",
                titleAr: "اÙ„حساب اÙ„حرفÙŠ"
            },
            {
                id: "ch1-l5-egalites-inegalites-equations",
                title: "Égalités - Inégalités - Équations",
                titleAr: "اÙ„Ù…ساÙˆÙŠات - اÙ„Ù…تباÙŠÙ†ات - اÙ„Ù…عادÙ„ات"
            }
        ]
    },
    {
        id: "ch2-fonctions-organisation-donnees-3eme",
        title: "Fonctions et organisation des données",
        titleAr: "اÙ„دÙˆاÙ„ ÙˆتÙ†ظÙŠÙ… اÙ„Ù…عطÙŠات",
        lessons: [
            {
                id: "ch2-l1-proportionnalite",
                title: "Proportionnalité",
                titleAr: "اÙ„تÙ†اسبÙŠة"
            },
            {
                id: "ch2-l2-organisation-donnees",
                title: "Organisation des données",
                titleAr: "تÙ†ظÙŠÙ… Ù…عطÙŠات"
            }
        ]
    },
    {
        id: "ch3-activites-geometriques-3eme",
        title: "Activités géométriques",
        titleAr: "أÙ†شطة Ù‡Ù†دسÙŠة",
        lessons: [
            {
                id: "ch3-l1-demonstration-mathematiques",
                title: "Démonstration en mathématiques",
                titleAr: "اÙ„برÙ‡اÙ† فÙŠ اÙ„رÙŠاضÙŠات"
            },
            {
                id: "ch3-l2-trigonometrie",
                title: "Trigonométrie",
                titleAr: "اÙ„Ù…ثÙ„ثات"
            },
            {
                id: "ch3-l3-triangle-rectangle-cercle",
                title: "Triangle rectangle et cercle",
                titleAr: "اÙ„Ù…ثÙ„ث اÙ„Ù‚ائÙ… Ùˆ اÙ„دائرة"
            },
            {
                id: "ch3-l4-pythagore-cosecante",
                title: "Théorème de Pythagore, cosécante d'un angle",
                titleAr: "خاصÙŠة فÙŠتاغÙˆرسØŒ جÙŠب تÙ…اÙ… زاÙˆÙŠة"
            },
            {
                id: "ch3-l5-homotheti",
                title: "Homothéties",
                titleAr: "اÙ„اÙ†سحاب"
            },
            {
                id: "ch3-l6-pyramide-cone-revolution",
                title: "Pyramide et cône de révolution",
                titleAr: "اÙ„Ù‡رÙ… Ùˆ Ù…خرÙˆط اÙ„دÙˆراÙ†"
            }
        ]
    }
];

export const getCem3emeCourseInfo = () => ({
    title: "Mathématiques - 3ème CEM",
    titleAr: "اÙ„رÙŠاضÙŠات - اÙ„سÙ†ة اÙ„ثاÙ„ثة إعدادÙŠ",
    description: "Programme de mathématiques pour la 3ème année du Collège d'Enseignement Moyen",
    descriptionAr: "برÙ†اÙ…ج اÙ„رÙŠاضÙŠات Ù„Ù„سÙ†ة اÙ„ثاÙ„ثة إعدادÙŠ"
});
