// MathÃ©matiques - 4Ã¨me CEM
// Programme structurÃ© en 3 chapitres

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
        title: "ActivitÃ©s numÃ©riques",
        titleAr: "Ø£Ù†Ø´Ø·Ø© Ø¹Ø¯Ø¯ÙŠØ©",
        lessons: [
            {
                id: "ch1-l1-nombres-naturels-rationnels",
                title: "Les nombres naturels et les nombres rationnels",
                titleAr: "Ø§Ù„Ø£Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ø·Ø¨ÙŠØ¹ÙŠØ© ÙˆØ§Ù„Ø£Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ù†Ø§Ø·Ù‚Ø©"
            },
            {
                id: "ch1-l2-calcul-racines",
                title: "Calcul sur les racines",
                titleAr: "Ø§Ù„Ø­Ø³Ø§Ø¨ Ø¹Ù„Ù‰ Ø§Ù„Ø¬Ø°ÙˆØ±"
            },
            {
                id: "ch1-l3-calcul-litteral",
                title: "Calcul littÃ©ral",
                titleAr: "Ø§Ù„Ø­Ø³Ø§Ø¨ Ø§Ù„Ø­ÙŽØ±ÙÙŠ"
            },
            {
                id: "ch1-l4-equations-inequations",
                title: "Ã‰quations et inÃ©quations",
                titleAr: "Ø§Ù„Ù…Ø¹Ø§Ø¯Ù„Ø§Øª ÙˆØ§Ù„Ù…ØªØ±Ø§Ø¬Ø­Ø§Øª"
            },
            {
                id: "ch1-l5-systemes-equations",
                title: "SystÃ¨mes d'Ã©quations du premier degrÃ© Ã  deux inconnues",
                titleAr: "Ø¬Ù…Ù„ Ù…Ø¹Ø§Ø¯Ù„ØªÙŠÙ† Ù…Ù† Ø§Ù„Ø¯Ù‘Ø±Ø¬Ø© Ø§Ù„Ø£ÙˆÙ„Ù‰ Ù„Ù…Ø¬Ù‡ÙˆÙ„ÙŠÙ†"
            }
        ]
    },
    {
        id: "ch2-fonctions-organisation-donnees",
        title: "Fonctions et organisation des donnÃ©es",
        titleAr: "Ø§Ù„Ø¯ÙˆØ§Ù„ ÙˆØªÙ†Ø¸ÙŠÙ… Ø§Ù„Ù…Ø¹Ø·ÙŠØ§Øª",
        lessons: [
            {
                id: "ch2-l1-fonction-lineaire-proportionnalite",
                title: "La fonction linÃ©aire et la proportionnalitÃ©",
                titleAr: "Ø§Ù„Ø¯Ø§Ù„Ø© Ø§Ù„Ø®Ø·ÙŠØ© ÙˆØ§Ù„ØªÙ†Ø§Ø³Ø¨ÙŠØ© ..."
            },
            {
                id: "ch2-l2-fonction-quadratique",
                title: "La fonction quadratique",
                titleAr: "Ø§Ù„Ø¯Ù‘Ø§Ù„Ø© Ø§Ù„ØªØ¢Ù„ÙÙŠØ©"
            },
            {
                id: "ch2-l3-statistiques",
                title: "Statistiques",
                titleAr: "Ø§Ù„Ø¥Ø­ØµØ§Ø¡"
            }
        ]
    },
    {
        id: "ch3-activites-geometriques",
        title: "ActivitÃ©s gÃ©omÃ©triques",
        titleAr: "Ø£Ù†Ø´Ø·Ø© Ù‡Ù†Ø¯Ø³ÙŠØ©",
        lessons: [
            {
                id: "ch3-l1-theoreme-thales",
                title: "ThÃ©orÃ¨me de ThalÃ¨s",
                titleAr: "Ø®Ø§ØµÙŠØ© Ø·Ø§Ù„Ø³"
            },
            {
                id: "ch3-l2-trigonometrie-triangle-rectangle",
                title: "TrigonomÃ©trie dans le triangle rectangle",
                titleAr: "Ø­Ø³Ø§Ø¨ Ø§Ù„Ù…Ø«Ù„Ø«Ø§Øª ÙÙŠ Ø§Ù„Ù…Ø«Ù„Ø« Ø§Ù„Ù‚Ø§Ø¦Ù…"
            },
            {
                id: "ch3-l3-rayons-homotheti",
                title: "Rayons et homothÃ©ties",
                titleAr: "Ø§Ù„Ø£Ø´Ø¹Ø© ÙˆØ§Ù„Ø§Ù†Ø³Ø­Ø§Ø¨"
            },
            {
                id: "ch3-l4-rayons-centre",
                title: "Rayons dans un cercle",
                titleAr: "Ø§Ù„Ø£Ø´Ø¹Ø© ÙÙŠ Ù…Ø¹Ù„Ù…"
            },
            {
                id: "ch3-l5-rotations-angles-polygones",
                title: "Rotations - Angles - Polygones rÃ©guliers",
                titleAr: "Ø§Ù„Ø¯ÙˆØ±Ø§Ù† - Ø§Ù„Ø²ÙˆØ§ÙŠØ§ - Ø§Ù„Ù…Ø¶Ù„Ø¹Ø§Øª Ø§Ù„Ù…Ù†ØªØ¸Ù…Ø© .."
            },
            {
                id: "ch3-l6-geometrie-espace",
                title: "GÃ©omÃ©trie dans l'espace",
                titleAr: "Ø§Ù„Ù‡Ù†Ø¯Ø³Ø© ÙÙŠ Ø§Ù„ÙØ¶Ø§Ø¡"
            }
        ]
    }
];

export const getCem4emeCourseInfo = () => ({
    title: "MathÃ©matiques - 4Ã¨me CEM",
    titleAr: "Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠØ§Øª - Ø§Ù„Ø³Ù†Ø© Ø§Ù„Ø±Ø§Ø¨Ø¹Ø© Ø¥Ø¹Ø¯Ø§Ø¯ÙŠ",
    description: "Programme de mathÃ©matiques pour la 4Ã¨me annÃ©e du CollÃ¨ge d'Enseignement Moyen",
    descriptionAr: "Ø¨Ø±Ù†Ø§Ù…Ø¬ Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠØ§Øª Ù„Ù„Ø³Ù†Ø© Ø§Ù„Ø±Ø§Ø¨Ø¹Ø© Ø¥Ø¹Ø¯Ø§Ø¯ÙŠ"
});
