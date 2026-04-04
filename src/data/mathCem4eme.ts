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
        titleAr: "أÙ†شطة عددÙŠة",
        lessons: [
            {
                id: "ch1-l1-nombres-naturels-rationnels",
                title: "Les nombres naturels et les nombres rationnels",
                titleAr: "اÙ„أعداد اÙ„طبÙŠعÙŠة ÙˆاÙ„أعداد اÙ„Ù†اطÙ‚ة"
            },
            {
                id: "ch1-l2-calcul-racines",
                title: "Calcul sur les racines",
                titleAr: "اÙ„حساب عÙ„Ù‰ اÙ„جذÙˆر"
            },
            {
                id: "ch1-l3-calcul-litteral",
                title: "Calcul littéral",
                titleAr: "اÙ„حساب اÙ„حÙŽرفÙŠ"
            },
            {
                id: "ch1-l4-equations-inequations",
                title: "Équations et inéquations",
                titleAr: "اÙ„Ù…عادÙ„ات ÙˆاÙ„Ù…تراجحات"
            },
            {
                id: "ch1-l5-systemes-equations",
                title: "Systèmes d'équations du premier degré à deux inconnues",
                titleAr: "جÙ…Ù„ Ù…عادÙ„تÙŠÙ† Ù…Ù† اÙ„دÙ‘رجة اÙ„أÙˆÙ„Ù‰ Ù„Ù…جÙ‡ÙˆÙ„ÙŠÙ†"
            }
        ]
    },
    {
        id: "ch2-fonctions-organisation-donnees",
        title: "Fonctions et organisation des données",
        titleAr: "اÙ„دÙˆاÙ„ ÙˆتÙ†ظÙŠÙ… اÙ„Ù…عطÙŠات",
        lessons: [
            {
                id: "ch2-l1-fonction-lineaire-proportionnalite",
                title: "La fonction linéaire et la proportionnalité",
                titleAr: "اÙ„داÙ„ة اÙ„خطÙŠة ÙˆاÙ„تÙ†اسبÙŠة ..."
            },
            {
                id: "ch2-l2-fonction-quadratique",
                title: "La fonction quadratique",
                titleAr: "اÙ„دÙ‘اÙ„ة اÙ„تآÙ„فÙŠة"
            },
            {
                id: "ch2-l3-statistiques",
                title: "Statistiques",
                titleAr: "اÙ„إحصاء"
            }
        ]
    },
    {
        id: "ch3-activites-geometriques",
        title: "Activités géométriques",
        titleAr: "أÙ†شطة Ù‡Ù†دسÙŠة",
        lessons: [
            {
                id: "ch3-l1-theoreme-thales",
                title: "Théorème de Thalès",
                titleAr: "خاصÙŠة طاÙ„س"
            },
            {
                id: "ch3-l2-trigonometrie-triangle-rectangle",
                title: "Trigonométrie dans le triangle rectangle",
                titleAr: "حساب اÙ„Ù…ثÙ„ثات فÙŠ اÙ„Ù…ثÙ„ث اÙ„Ù‚ائÙ…"
            },
            {
                id: "ch3-l3-rayons-homotheti",
                title: "Rayons et homothéties",
                titleAr: "اÙ„أشعة ÙˆاÙ„اÙ†سحاب"
            },
            {
                id: "ch3-l4-rayons-centre",
                title: "Rayons dans un cercle",
                titleAr: "اÙ„أشعة فÙŠ Ù…عÙ„Ù…"
            },
            {
                id: "ch3-l5-rotations-angles-polygones",
                title: "Rotations - Angles - Polygones réguliers",
                titleAr: "اÙ„دÙˆراÙ† - اÙ„زÙˆاÙŠا - اÙ„Ù…ضÙ„عات اÙ„Ù…Ù†تظÙ…ة .."
            },
            {
                id: "ch3-l6-geometrie-espace",
                title: "Géométrie dans l'espace",
                titleAr: "اÙ„Ù‡Ù†دسة فÙŠ اÙ„فضاء"
            }
        ]
    }
];

export const getCem4emeCourseInfo = () => ({
    title: "Mathématiques - 4ème CEM",
    titleAr: "اÙ„رÙŠاضÙŠات - اÙ„سÙ†ة اÙ„رابعة إعدادÙŠ",
    description: "Programme de mathématiques pour la 4ème année du Collège d'Enseignement Moyen",
    descriptionAr: "برÙ†اÙ…ج اÙ„رÙŠاضÙŠات Ù„Ù„سÙ†ة اÙ„رابعة إعدادÙŠ"
});
