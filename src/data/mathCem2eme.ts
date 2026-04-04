// MathÃ©matiques - 2Ã¨me CEM
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

export const mathCem2emeChapters: Chapter[] = [
    {
        id: "ch1-activites-numeriques-2eme",
        title: "ActivitÃ©s numÃ©riques",
        titleAr: "Ø£Ù†Ø´Ø·Ø© Ø¹Ø¯Ø¯ÙŠØ©",
        lessons: [
            {
                id: "ch1-l1-operations-naturels-decimaux",
                title: "OpÃ©rations sur les nombres naturels et les nombres dÃ©cimaux",
                titleAr: "Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª Ø¹Ù„Ù‰ Ø§Ù„Ø£Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ø·Ø¨ÙŠØ¹ÙŠØ© ÙˆØ§Ù„Ø£Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ø¹Ø´Ø±ÙŠØ©"
            },
            {
                id: "ch1-l2-fractions-operations",
                title: "Les fractions et les opÃ©rations sur les fractions",
                titleAr: "Ø§Ù„ÙƒØ³ÙˆØ± Ùˆ Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª Ø¹Ù„ÙŠÙ‡Ø§"
            },
            {
                id: "ch1-l3-nombres-relatifs",
                title: "Les nombres relatifs",
                titleAr: "Ø§Ù„Ø£Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ù†Ø³Ø¨ÙŠØ©"
            },
            {
                id: "ch1-l4-concept-equation",
                title: "Le concept d'Ã©quation",
                titleAr: "Ù…ÙÙ‡ÙˆÙ… Ù…Ø¹Ø§Ø¯Ù„Ø©"
            }
        ]
    },
    {
        id: "ch2-fonctions-organisation-donnees-2eme",
        title: "Fonctions et organisation des donnÃ©es",
        titleAr: "Ø§Ù„Ø¯ÙˆØ§Ù„ ÙˆØªÙ†Ø¸ÙŠÙ… Ø§Ù„Ù…Ø¹Ø·ÙŠØ§Øª",
        lessons: [
            {
                id: "ch2-l1-proportionnalite-2eme",
                title: "ProportionnalitÃ©",
                titleAr: "Ø§Ù„ØªÙ†Ø§Ø³Ø¨ÙŠØ©"
            },
            {
                id: "ch2-l2-organisation-donnees-2eme",
                title: "Organisation des donnÃ©es",
                titleAr: "ØªÙ†Ø¸ÙŠÙ… Ù…Ø¹Ø·ÙŠØ§Øª"
            }
        ]
    },
    {
        id: "ch3-activites-geometriques-2eme",
        title: "ActivitÃ©s gÃ©omÃ©triques",
        titleAr: "Ø£Ù†Ø´Ø·Ø© Ù‡Ù†Ø¯Ø³ÙŠØ©",
        lessons: [
            {
                id: "ch3-l1-construction-formes-simples",
                title: "Construction de formes gÃ©omÃ©triques simples",
                titleAr: "Ø¥Ù†Ø´Ø§Ø¡ Ø£Ø´ÙƒØ§Ù„ Ù‡Ù†Ø¯Ø³ÙŠØ© Ø¨Ø³ÙŠØ·Ø©"
            },
            {
                id: "ch3-l2-symetrie-centrale",
                title: "La symÃ©trie centrale",
                titleAr: "Ø§Ù„ØªÙ†Ø§Ø¸Ø± Ø§Ù„Ù…Ø±ÙƒØ²ÙŠ"
            },
            {
                id: "ch3-l3-angles-paralleles",
                title: "Les angles et le parallÃ©lisme",
                titleAr: "Ø§Ù„Ø²ÙˆØ§ÙŠØ§ ÙˆØ§Ù„ØªÙˆØ§Ø²ÙŠ"
            },
            {
                id: "ch3-l4-trigonometrie-cercle",
                title: "TrigonomÃ©trie et cercle",
                titleAr: "Ø§Ù„Ù…Ø«Ù„Ø«Ø§Øª ÙˆØ§Ù„Ø¯Ø§Ø¦Ø±Ø©"
            },
            {
                id: "ch3-l5-parallelogramme",
                title: "Le parallÃ©logramme",
                titleAr: "Ù…ØªÙˆØ§Ø²ÙŠ Ø§Ù„Ø£Ø¶Ù„Ø§Ø¹"
            },
            {
                id: "ch3-l6-prisme-droit-cylindre",
                title: "Le prisme droit et le cylindre de rÃ©volution",
                titleAr: "Ø§Ù„Ù…ÙˆØ´ÙˆØ± Ø§Ù„Ù‚Ø§Ø¦Ù… Ùˆ Ø£Ø³Ø·ÙˆØ§Ù†Ø© Ø§Ù„Ø¯ÙˆØ±Ø§Ù†"
            }
        ]
    }
];

export const getCem2emeCourseInfo = () => ({
    title: "MathÃ©matiques - 2Ã¨me CEM",
    titleAr: "Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠØ§Øª - Ø§Ù„Ø³Ù†Ø© Ø§Ù„Ø«Ø§Ù†ÙŠØ© Ø¥Ø¹Ø¯Ø§Ø¯ÙŠ",
    description: "Programme de mathÃ©matiques pour la 2Ã¨me annÃ©e du CollÃ¨ge d'Enseignement Moyen",
    descriptionAr: "Ø¨Ø±Ù†Ø§Ù…Ø¬ Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠØ§Øª Ù„Ù„Ø³Ù†Ø© Ø§Ù„Ø«Ø§Ù†ÙŠØ© Ø¥Ø¹Ø¯Ø§Ø¯ÙŠ"
});
