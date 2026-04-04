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
        titleAr: "Ø£Ù†Ø´Ø·Ø© Ø¹Ø¯Ø¯ÙŠØ©",
        lessons: [
            {
                id: "ch1-l1-nombres-naturels-decimaux",
                title: "Les nombres naturels et les nombres décimaux",
                titleAr: "Ø§Ù„Ø£Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ø·Ø¨ÙŠØ¹ÙŠØ© ÙˆØ§Ù„Ø£Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ø¹Ø´Ø±ÙŠØ©"
            },
            {
                id: "ch1-l2-calcul-addition-soustraction",
                title: "Calcul sur les nombres naturels et décimaux: addition et soustraction",
                titleAr: "Ø§Ù„Ø­Ø³Ø§Ø¨ Ø¹Ù„Ù‰ Ø§Ù„Ø£Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ø·Ø¨ÙŠØ¹ÙŠØ© ÙˆØ§Ù„Ø£Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ø¹Ø´Ø±ÙŠØ©: Ø§Ù„Ø¬Ù…Ø¹ ÙˆØ§Ù„Ø·Ø±Ø­"
            },
            {
                id: "ch1-l3-calcul-multiplication-division",
                title: "Calcul sur les nombres naturels et décimaux: multiplication et division",
                titleAr: "Ø§Ù„Ø­Ø³Ø§Ø¨ Ø¹Ù„Ù‰ Ø§Ù„Ø£Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ø·Ø¨ÙŠØ¹ÙŠØ© ÙˆØ§Ù„Ø£Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ø¹Ø´Ø±ÙŠØ©: Ø§Ù„Ø¶Ø±Ø¨ ÙˆØ§Ù„Ù‚Ø³Ù…Ø©"
            },
            {
                id: "ch1-l4-ecritures-fractionnaires",
                title: "Les écritures fractionnaires",
                titleAr: "Ø§Ù„ÙƒØªØ§Ø¨Ø§Øª Ø§Ù„ÙƒØ³Ø±ÙŠØ©"
            },
            {
                id: "ch1-l5-nombres-relatifs",
                title: "Les nombres relatifs",
                titleAr: "Ø§Ù„Ø£Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ù†Ø³Ø¨ÙŠØ©"
            },
            {
                id: "ch1-l6-calcul-litteral",
                title: "Le calcul littéral",
                titleAr: "Ø§Ù„Ø­Ø³Ø§Ø¨ Ø§Ù„Ø­Ø±ÙÙŠ"
            }
        ]
    },
    {
        id: "ch2-fonctions-organisation-donnees",
        title: "Fonctions et organisation des données",
        titleAr: "Ø§Ù„Ø¯ÙˆØ§Ù„ ÙˆØªÙ†Ø¸ÙŠÙ… Ø§Ù„Ù…Ø¹Ø·ÙŠØ§Øª",
        lessons: [
            {
                id: "ch2-l1-proportionalite",
                title: "La proportionnalité",
                titleAr: "Ø§Ù„ØªÙ†Ø§Ø³Ø¨ÙŠØ©"
            },
            {
                id: "ch2-l2-organisation-donnees",
                title: "Organisation des données",
                titleAr: "ØªÙ†Ø¸ÙŠÙ… Ù…Ø¹Ø·ÙŠØ§Øª"
            }
        ]
    },
    {
        id: "ch3-activites-geometriques",
        title: "Activités géométriques",
        titleAr: "Ø£Ù†Ø´Ø·Ø© Ù‡Ù†Ø¯Ø³ÙŠØ©",
        lessons: [
            {
                id: "ch3-l1-parallele-perpendiculaire",
                title: "Le parallèle et le perpendiculaire",
                titleAr: "Ø§Ù„ØªÙˆØ§Ø²ÙŠ ÙˆØ§Ù„ØªØ¹Ø§Ù…Ø¯"
            },
            {
                id: "ch3-l2-formes-plani",
                title: "Les formes plani",
                titleAr: "Ø§Ù„Ø£Ø´ÙƒØ§Ù„ Ø§Ù„Ù…Ø³ØªÙˆÙŠØ©"
            },
            {
                id: "ch3-l3-surfaces-plani-longueurs-perimetres-aires",
                title: "Les surfaces plani: longueurs, périmètres, aires",
                titleAr: "Ø§Ù„Ø³Ø·ÙˆØ­ Ø§Ù„Ù…Ø³ØªÙˆÙŠØ©: Ø§Ù„Ø£Ø·ÙˆØ§Ù„ØŒ Ø§Ù„Ù…Ø­ÙŠØ·Ø§ØªØŒ Ø§Ù„Ù…Ø³Ø§Ø­Ø§Øª."
            },
            {
                id: "ch3-l4-angles",
                title: "Les angles",
                titleAr: "Ø§Ù„Ø²ÙˆØ§ÙŠØ§"
            },
            {
                id: "ch3-l5-symetrie-axiale",
                title: "La symétrie axiale",
                titleAr: "Ø§Ù„ØªÙ†Ø§Ø¸Ø± Ø§Ù„Ù…Ø­ÙˆØ±ÙŠ"
            },
            {
                id: "ch3-l6-parallelepipedes-rectangles-cubes",
                title: "Les parallélépipèdes rectangles et les cubes",
                titleAr: "Ù…ØªÙˆØ§Ø²ÙŠ Ø§Ù„Ù…Ø³ØªØ·ÙŠÙ„Ø§Øª ÙˆØ§Ù„Ù…ÙƒØ¹Ù‘Ø¨"
            }
        ]
    }
];

export const getCem1ereCourseInfo = () => ({
    title: "Mathématiques - 1ère CEM",
    titleAr: "Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠØ§Øª - Ø§Ù„Ø³Ù†Ø© Ø§Ù„Ø£ÙˆÙ„Ù‰ Ø¥Ø¹Ø¯Ø§Ø¯ÙŠ",
    description: "Programme de mathématiques pour la 1ère année du Collège d'Enseignement Moyen",
    descriptionAr: "Ø¨Ø±Ù†Ø§Ù…Ø¬ Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠØ§Øª Ù„Ù„Ø³Ù†Ø© Ø§Ù„Ø£ÙˆÙ„Ù‰ Ø¥Ø¹Ø¯Ø§Ø¯ÙŠ"
});
