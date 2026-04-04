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
        titleAr: "Ø£Ù†Ø´Ø·Ø© Ø¹Ø¯Ø¯ÙŠØ©",
        lessons: [
            {
                id: "ch1-l1-operations-naturels-decimaux",
                title: "Opérations sur les nombres naturels et les nombres décimaux",
                titleAr: "Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª Ø¹Ù„Ù‰ Ø§Ù„Ø£Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ø·Ø¨ÙŠØ¹ÙŠØ© ÙˆØ§Ù„Ø£Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ø¹Ø´Ø±ÙŠØ©"
            },
            {
                id: "ch1-l2-fractions-operations",
                title: "Les fractions et les opérations sur les fractions",
                titleAr: "Ø§Ù„ÙƒØ³ÙˆØ± Ùˆ Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª Ø¹Ù„ÙŠÙ‡Ø§"
            },
            {
                id: "ch1-l3-nombres-relatifs",
                title: "Les nombres relatifs",
                titleAr: "Ø§Ù„Ø£Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ù†Ø³Ø¨ÙŠØ©"
            },
            {
                id: "ch1-l4-concept-equation",
                title: "Le concept d'équation",
                titleAr: "Ù…ÙÙ‡ÙˆÙ… Ù…Ø¹Ø§Ø¯Ù„Ø©"
            }
        ]
    },
    {
        id: "ch2-fonctions-organisation-donnees-2eme",
        title: "Fonctions et organisation des données",
        titleAr: "Ø§Ù„Ø¯ÙˆØ§Ù„ ÙˆØªÙ†Ø¸ÙŠÙ… Ø§Ù„Ù…Ø¹Ø·ÙŠØ§Øª",
        lessons: [
            {
                id: "ch2-l1-proportionnalite-2eme",
                title: "Proportionnalité",
                titleAr: "Ø§Ù„ØªÙ†Ø§Ø³Ø¨ÙŠØ©"
            },
            {
                id: "ch2-l2-organisation-donnees-2eme",
                title: "Organisation des données",
                titleAr: "ØªÙ†Ø¸ÙŠÙ… Ù…Ø¹Ø·ÙŠØ§Øª"
            }
        ]
    },
    {
        id: "ch3-activites-geometriques-2eme",
        title: "Activités géométriques",
        titleAr: "Ø£Ù†Ø´Ø·Ø© Ù‡Ù†Ø¯Ø³ÙŠØ©",
        lessons: [
            {
                id: "ch3-l1-construction-formes-simples",
                title: "Construction de formes géométriques simples",
                titleAr: "Ø¥Ù†Ø´Ø§Ø¡ Ø£Ø´ÙƒØ§Ù„ Ù‡Ù†Ø¯Ø³ÙŠØ© Ø¨Ø³ÙŠØ·Ø©"
            },
            {
                id: "ch3-l2-symetrie-centrale",
                title: "La symétrie centrale",
                titleAr: "Ø§Ù„ØªÙ†Ø§Ø¸Ø± Ø§Ù„Ù…Ø±ÙƒØ²ÙŠ"
            },
            {
                id: "ch3-l3-angles-paralleles",
                title: "Les angles et le parallélisme",
                titleAr: "Ø§Ù„Ø²ÙˆØ§ÙŠØ§ ÙˆØ§Ù„ØªÙˆØ§Ø²ÙŠ"
            },
            {
                id: "ch3-l4-trigonometrie-cercle",
                title: "Trigonométrie et cercle",
                titleAr: "Ø§Ù„Ù…Ø«Ù„Ø«Ø§Øª ÙˆØ§Ù„Ø¯Ø§Ø¦Ø±Ø©"
            },
            {
                id: "ch3-l5-parallelogramme",
                title: "Le parallélogramme",
                titleAr: "Ù…ØªÙˆØ§Ø²ÙŠ Ø§Ù„Ø£Ø¶Ù„Ø§Ø¹"
            },
            {
                id: "ch3-l6-prisme-droit-cylindre",
                title: "Le prisme droit et le cylindre de révolution",
                titleAr: "Ø§Ù„Ù…ÙˆØ´ÙˆØ± Ø§Ù„Ù‚Ø§Ø¦Ù… Ùˆ Ø£Ø³Ø·ÙˆØ§Ù†Ø© Ø§Ù„Ø¯ÙˆØ±Ø§Ù†"
            }
        ]
    }
];

export const getCem2emeCourseInfo = () => ({
    title: "Mathématiques - 2ème CEM",
    titleAr: "Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠØ§Øª - Ø§Ù„Ø³Ù†Ø© Ø§Ù„Ø«Ø§Ù†ÙŠØ© Ø¥Ø¹Ø¯Ø§Ø¯ÙŠ",
    description: "Programme de mathématiques pour la 2ème année du Collège d'Enseignement Moyen",
    descriptionAr: "Ø¨Ø±Ù†Ø§Ù…Ø¬ Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠØ§Øª Ù„Ù„Ø³Ù†Ø© Ø§Ù„Ø«Ø§Ù†ÙŠØ© Ø¥Ø¹Ø¯Ø§Ø¯ÙŠ"
});
