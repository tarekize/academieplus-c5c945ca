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
        titleAr: "أÙ†شطة عددÙŠة",
        lessons: [
            {
                id: "ch1-l1-nombres-naturels-decimaux",
                title: "Les nombres naturels et les nombres décimaux",
                titleAr: "اÙ„أعداد اÙ„طبÙŠعÙŠة ÙˆاÙ„أعداد اÙ„عشرÙŠة"
            },
            {
                id: "ch1-l2-calcul-addition-soustraction",
                title: "Calcul sur les nombres naturels et décimaux: addition et soustraction",
                titleAr: "اÙ„حساب عÙ„Ù‰ اÙ„أعداد اÙ„طبÙŠعÙŠة ÙˆاÙ„أعداد اÙ„عشرÙŠة: اÙ„جÙ…ع ÙˆاÙ„طرح"
            },
            {
                id: "ch1-l3-calcul-multiplication-division",
                title: "Calcul sur les nombres naturels et décimaux: multiplication et division",
                titleAr: "اÙ„حساب عÙ„Ù‰ اÙ„أعداد اÙ„طبÙŠعÙŠة ÙˆاÙ„أعداد اÙ„عشرÙŠة: اÙ„ضرب ÙˆاÙ„Ù‚سÙ…ة"
            },
            {
                id: "ch1-l4-ecritures-fractionnaires",
                title: "Les écritures fractionnaires",
                titleAr: "اÙ„Ùƒتابات اÙ„ÙƒسرÙŠة"
            },
            {
                id: "ch1-l5-nombres-relatifs",
                title: "Les nombres relatifs",
                titleAr: "اÙ„أعداد اÙ„Ù†سبÙŠة"
            },
            {
                id: "ch1-l6-calcul-litteral",
                title: "Le calcul littéral",
                titleAr: "اÙ„حساب اÙ„حرفÙŠ"
            }
        ]
    },
    {
        id: "ch2-fonctions-organisation-donnees",
        title: "Fonctions et organisation des données",
        titleAr: "اÙ„دÙˆاÙ„ ÙˆتÙ†ظÙŠÙ… اÙ„Ù…عطÙŠات",
        lessons: [
            {
                id: "ch2-l1-proportionalite",
                title: "La proportionnalité",
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
        id: "ch3-activites-geometriques",
        title: "Activités géométriques",
        titleAr: "أÙ†شطة Ù‡Ù†دسÙŠة",
        lessons: [
            {
                id: "ch3-l1-parallele-perpendiculaire",
                title: "Le parallèle et le perpendiculaire",
                titleAr: "اÙ„تÙˆازÙŠ ÙˆاÙ„تعاÙ…د"
            },
            {
                id: "ch3-l2-formes-plani",
                title: "Les formes plani",
                titleAr: "اÙ„أشÙƒاÙ„ اÙ„Ù…ستÙˆÙŠة"
            },
            {
                id: "ch3-l3-surfaces-plani-longueurs-perimetres-aires",
                title: "Les surfaces plani: longueurs, périmètres, aires",
                titleAr: "اÙ„سطÙˆح اÙ„Ù…ستÙˆÙŠة: اÙ„أطÙˆاÙ„ØŒ اÙ„Ù…حÙŠطاتØŒ اÙ„Ù…ساحات."
            },
            {
                id: "ch3-l4-angles",
                title: "Les angles",
                titleAr: "اÙ„زÙˆاÙŠا"
            },
            {
                id: "ch3-l5-symetrie-axiale",
                title: "La symétrie axiale",
                titleAr: "اÙ„تÙ†اظر اÙ„Ù…حÙˆرÙŠ"
            },
            {
                id: "ch3-l6-parallelepipedes-rectangles-cubes",
                title: "Les parallélépipèdes rectangles et les cubes",
                titleAr: "Ù…تÙˆازÙŠ اÙ„Ù…ستطÙŠÙ„ات ÙˆاÙ„Ù…ÙƒعÙ‘ب"
            }
        ]
    }
];

export const getCem1ereCourseInfo = () => ({
    title: "Mathématiques - 1ère CEM",
    titleAr: "اÙ„رÙŠاضÙŠات - اÙ„سÙ†ة اÙ„أÙˆÙ„Ù‰ إعدادÙŠ",
    description: "Programme de mathématiques pour la 1ère année du Collège d'Enseignement Moyen",
    descriptionAr: "برÙ†اÙ…ج اÙ„رÙŠاضÙŠات Ù„Ù„سÙ†ة اÙ„أÙˆÙ„Ù‰ إعدادÙŠ"
});
