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
        titleAr: "Ø£Ù†Ø´Ø·Ø© Ø¹Ø¯Ø¯ÙŠØ©",
        lessons: [
            {
                id: "ch1-l1-nombres-relatifs",
                title: "Les nombres relatifs",
                titleAr: "Ø§Ù„Ø£Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ù†Ø³Ø¨ÙŠØ©"
            },
            {
                id: "ch1-l2-operations-fractions-rationnels",
                title: "Opérations sur les fractions et les nombres rationnels",
                titleAr: "Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª Ø¹Ù„Ù‰ Ø§Ù„ÙƒØ³ÙˆØ± ÙˆØ§Ù„Ø£Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ù†Ø§Ø·Ù‚Ø©"
            },
            {
                id: "ch1-l3-puissances-relatifs",
                title: "Puissances Ã  exposants relatifs entiers",
                titleAr: "Ø§Ù„Ù‚ÙˆÙ‰ Ø°Ø§Øª Ø£Ø³Ø³ Ù†Ø³Ø¨ÙŠØ© ØµØ­ÙŠØ­Ø©"
            },
            {
                id: "ch1-l4-calcul-litteral-3eme",
                title: "Calcul littéral",
                titleAr: "Ø§Ù„Ø­Ø³Ø§Ø¨ Ø§Ù„Ø­Ø±ÙÙŠ"
            },
            {
                id: "ch1-l5-egalites-inegalites-equations",
                title: "Égalités - Inégalités - Équations",
                titleAr: "Ø§Ù„Ù…Ø³Ø§ÙˆÙŠØ§Øª - Ø§Ù„Ù…ØªØ¨Ø§ÙŠÙ†Ø§Øª - Ø§Ù„Ù…Ø¹Ø§Ø¯Ù„Ø§Øª"
            }
        ]
    },
    {
        id: "ch2-fonctions-organisation-donnees-3eme",
        title: "Fonctions et organisation des données",
        titleAr: "Ø§Ù„Ø¯ÙˆØ§Ù„ ÙˆØªÙ†Ø¸ÙŠÙ… Ø§Ù„Ù…Ø¹Ø·ÙŠØ§Øª",
        lessons: [
            {
                id: "ch2-l1-proportionnalite",
                title: "Proportionnalité",
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
        id: "ch3-activites-geometriques-3eme",
        title: "Activités géométriques",
        titleAr: "Ø£Ù†Ø´Ø·Ø© Ù‡Ù†Ø¯Ø³ÙŠØ©",
        lessons: [
            {
                id: "ch3-l1-demonstration-mathematiques",
                title: "Démonstration en mathématiques",
                titleAr: "Ø§Ù„Ø¨Ø±Ù‡Ø§Ù† ÙÙŠ Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠØ§Øª"
            },
            {
                id: "ch3-l2-trigonometrie",
                title: "Trigonométrie",
                titleAr: "Ø§Ù„Ù…Ø«Ù„Ø«Ø§Øª"
            },
            {
                id: "ch3-l3-triangle-rectangle-cercle",
                title: "Triangle rectangle et cercle",
                titleAr: "Ø§Ù„Ù…Ø«Ù„Ø« Ø§Ù„Ù‚Ø§Ø¦Ù… Ùˆ Ø§Ù„Ø¯Ø§Ø¦Ø±Ø©"
            },
            {
                id: "ch3-l4-pythagore-cosecante",
                title: "Théorème de Pythagore, cosécante d'un angle",
                titleAr: "Ø®Ø§ØµÙŠØ© ÙÙŠØªØ§ØºÙˆØ±Ø³ØŒ Ø¬ÙŠØ¨ ØªÙ…Ø§Ù… Ø²Ø§ÙˆÙŠØ©"
            },
            {
                id: "ch3-l5-homotheti",
                title: "Homothéties",
                titleAr: "Ø§Ù„Ø§Ù†Ø³Ø­Ø§Ø¨"
            },
            {
                id: "ch3-l6-pyramide-cone-revolution",
                title: "Pyramide et cône de révolution",
                titleAr: "Ø§Ù„Ù‡Ø±Ù… Ùˆ Ù…Ø®Ø±ÙˆØ· Ø§Ù„Ø¯ÙˆØ±Ø§Ù†"
            }
        ]
    }
];

export const getCem3emeCourseInfo = () => ({
    title: "Mathématiques - 3ème CEM",
    titleAr: "Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠØ§Øª - Ø§Ù„Ø³Ù†Ø© Ø§Ù„Ø«Ø§Ù„Ø«Ø© Ø¥Ø¹Ø¯Ø§Ø¯ÙŠ",
    description: "Programme de mathématiques pour la 3ème année du Collège d'Enseignement Moyen",
    descriptionAr: "Ø¨Ø±Ù†Ø§Ù…Ø¬ Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠØ§Øª Ù„Ù„Ø³Ù†Ø© Ø§Ù„Ø«Ø§Ù„Ø«Ø© Ø¥Ø¹Ø¯Ø§Ø¯ÙŠ"
});
