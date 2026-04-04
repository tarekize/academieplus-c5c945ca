// MathÃ©matiques - 5Ã¨me Primaire
// Programme structurÃ© en 4 chapitres

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

export const mathPrimaire5emeChapters: Chapter[] = [
    {
        id: "ch1-wadaiya-intilakiya-1",
        title: "Situation de dÃ©part 1",
        titleAr: "Ø§Ù„ÙˆØ¶Ø¹ÙŠØ© Ø§Ù„Ø§Ù†Ø·Ù„Ø§Ù‚ÙŠØ© 1",
        lessons: [
            {
                id: "ch1-l1-aadad-ila-999999-1",
                title: "Les nombres jusqu'Ã  999 999 '1' (Ã©criture, lecture et dÃ©composition des nombres jusqu'Ã  999 999)",
                titleAr: "Ø§Ù„Ø£Ø¹Ø¯Ø§Ø¯ Ø¥Ù„Ù‰ 999999 '1'(ÙƒØªØ§Ø¨Ø© ÙˆÙ‚Ø±Ø§Ø¡Ø© ÙˆØªÙÙƒÙŠÙƒ Ø§Ù„Ø£Ø¹Ø¯Ø§Ø¯ Ø¥Ù„Ù‰999999 )"
            },
            {
                id: "ch1-l2-taalim-ala-marsoufa",
                title: "Enseignement sur quadrillage et utilisation de patron",
                titleAr: "Ø§Ù„ØªØ¹Ù„ÙŠÙ… Ø¹Ù„Ù‰ Ù…Ø±ØµÙˆÙØ© ÙˆØ§Ø³ØªØ¹Ù…Ø§Ù„ ØªØµÙ…ÙŠÙ…"
            },
            {
                id: "ch1-l3-jam-aadad-tabiiya",
                title: "Addition de nombres naturels",
                titleAr: "Ø¬Ù…Ø¹ Ø£Ø¹Ø¯Ø§Ø¯ Ø·Ø¨ÙŠØ¹ÙŠØ©"
            },
            {
                id: "ch1-l4-aadad-ila-999999-2",
                title: "Les nombres jusqu'Ã  999 999 '2' (comparaison, classement et dÃ©nombrement jusqu'Ã  999 999)",
                titleAr: "Ø§Ù„Ø£Ø¹Ø¯Ø§Ø¯ Ø¥Ù„Ù‰ 999 999 '2'(Ù…Ù‚Ø§Ø±Ù†Ø© ÙˆØªØ±ØªÙŠØ¨ ÙˆØ­ØµØ± Ø§Ù„Ø£Ø¹Ù…Ø§Ø¯ Ø¥Ù„Ù‰999999)"
            },
            {
                id: "ch1-l5-tarh-aadad-tabiiya",
                title: "Soustraction de nombres naturels",
                titleAr: "Ø¶Ø±Ø­ Ø£Ø¹Ø¯Ø§Ø¯ Ø·Ø¨ÙŠØ¹ÙŠØ©"
            },
            {
                id: "ch1-l6-tanzim-maaloumat",
                title: "Organisation d'informations dans un tableau",
                titleAr: "ØªÙ†Ø¸ÙŠÙ… Ù…Ø¹Ù„ÙˆÙ…Ø§Øª ÙÙŠ Ø¬Ø¯ÙˆÙ„"
            },
            {
                id: "ch1-l7-wadaiyat-jamiat-wa-tarhia",
                title: "Situations additives et soustractives",
                titleAr: "ÙˆØ¶Ø¹ÙŠØ§Øª Ø¬Ù…Ø¹ÙŠØ© ÙˆØ·Ø±Ø­ÙŠØ©"
            },
            {
                id: "ch1-l8-istiqamiya-wa-toul",
                title: "Droite et longueur d'un segment",
                titleAr: "Ø§Ù„Ø§Ø³ØªÙ‚Ø§Ù…ÙŠØ©ØŒ ÙˆØ·ÙˆÙ„ Ù‚Ø·Ø¹Ø© Ù…Ø³ØªÙ‚ÙŠÙ…"
            },
            {
                id: "ch1-l9-alaqat-hisabiya",
                title: "Relations arithmÃ©tiques entre nombres naturels",
                titleAr: "Ø¹Ù„Ø§Ù‚Ø§Øª Ø­Ø³Ø§Ø¨ÙŠØ© Ø¨ÙŠÙ† Ø£Ø¹Ø¯Ø§Ø¯ Ø·Ø¨ÙŠØ¹ÙŠØ©"
            },
            {
                id: "ch1-l10-atwal",
                title: "Les longueurs",
                titleAr: "Ø§Ù„Ø£Ø·ÙˆØ§Ù„"
            },
            {
                id: "ch1-l11-darb-fi-adad-birakamayn",
                title: "Multiplication par un nombre Ã  deux chiffres",
                titleAr: "Ø§Ù„Ø¶Ø±Ø¨ ÙÙŠ Ø¹Ø¯Ø¯ Ø¨Ø±Ù‚Ù…ÙŠÙ†"
            },
            {
                id: "ch1-l12-darb-fi-adad-bithalatha",
                title: "Multiplication par un nombre Ã  trois chiffres",
                titleAr: "Ø§Ù„Ø¶Ø±Ø¨ ÙÙŠ Ø¹Ø¯Ø¯ Ø¨Ø«Ù„Ø§Ø«Ø© Ø£Ø±Ù‚Ø§Ù…"
            },
            {
                id: "ch1-l13-tanzim-wa-istighlal",
                title: "Organisation d'informations et leur exploitation",
                titleAr: "ØªÙ†Ø¸ÙŠÙ… Ù…Ø¹Ù„ÙˆÙ…Ø§Øª ÙˆØ§Ø³ØªØºÙ„Ø§Ù„Ù‡Ø§"
            },
            {
                id: "ch1-l14-mustaqimat-mutawazi",
                title: "Droites parallÃ¨les et droites perpendiculaires",
                titleAr: "Ù…Ø³ØªÙ‚ÙŠÙ…Ø§Øª Ù…ØªÙˆØ§Ø²ÙŠØ© ÙˆÙ…Ø³ØªÙ‚ÙŠÙ…Ø§Øª Ù…ØªØ¹Ø§Ù…Ø¯Ø©"
            },
            {
                id: "ch1-l15-aadad-ila-999999999-1",
                title: "Les nombres jusqu'Ã  999 999 999 '1' (lecture, Ã©criture et dÃ©composition des nombres jusqu'Ã  999 999 999)",
                titleAr: "Ø§Ù„Ø£Ø¹Ø¯Ø§Ø¯ Ø¥Ù„Ù‰ 999 999 999 '1'(Ù‚Ø±Ø§Ø¡Ø© ÙˆÙƒØªØ§Ø¨Ø© ÙˆØªÙÙƒÙŠÙƒ Ø§Ù„Ø£Ø¹Ø¯Ø§Ø¯ Ø¥Ù„Ù‰ 999 999 999)"
            },
            {
                id: "ch1-l16-aadad-ila-999999999-2",
                title: "Les nombres jusqu'Ã  999 999 999 '2' (comparaison, classement et dÃ©nombrement des nombres jusqu'Ã  999 999 999)",
                titleAr: "Ø§Ù„Ø£Ø¹Ø¯Ø§Ø¯ Ø¥Ù„Ù‰ 999 999 999 '2'(Ù…Ù‚Ø§Ø±Ù†Ø© ÙˆØªØ±ØªÙŠØ¨ ÙˆØ­ØµØ± Ø§Ù„Ø£Ø¹Ø¯Ø§Ø¯ Ø¥Ù„Ù‰ 999 999 999)"
            },
            {
                id: "ch1-l17-alhasiba",
                title: "La calculatrice (dÃ©couverte des touches mÃ©moire et leur contrÃ´le)",
                titleAr: "Ø§Ù„Ø­Ø§Ø³Ø¨Ø© (Ø§ÙƒØªØ´Ø§Ù Ø§Ù„Ù…Ø³Ø§Øª Ø§Ù„Ø°Ø§ÙƒØ±Ø© ÙˆØ§Ù„ØªØ­ÙƒÙ… ÙÙŠÙ‡Ø§ )"
            },
            {
                id: "ch1-l18-ad-kamiyat-kabira",
                title: "DÃ©nombrement de grandes quantitÃ©s",
                titleAr: "Ø¹Ø¯ ÙƒÙ…ÙŠØ§Øª ÙƒØ¨ÙŠØ±Ø©"
            },
            {
                id: "ch1-l19-manhajiya-hall-mushkilat",
                title: "MÃ©thodologie de rÃ©solution de problÃ¨mes",
                titleAr: "Ù…Ù†Ù‡Ø¬ÙŠØ© Ø­Ù„ Ù…Ø´ÙƒÙ„Ø§Øª"
            }
        ]
    },
    {
        id: "ch2-wadaiya-intilakiya-2",
        title: "Situation de dÃ©part 2",
        titleAr: "Ø§Ù„ÙˆØ¶Ø¹ÙŠØ© Ø§Ù„Ø§Ù†Ø·Ù„Ø§Ù‚ÙŠØ© 2",
        lessons: [
            {
                id: "ch2-l1-muqarana-wa-tartib-zawaya",
                title: "Comparaison et classement d'angles",
                titleAr: "Ù…Ù‚Ø§Ø±Ù†Ø© ÙˆØªØ±ØªÙŠØ¨ Ø²ÙˆØ§ÙŠØ§"
            },
            {
                id: "ch2-l2-istiimal-tasmim",
                title: "Utilisation d'un patron ou d'une carte",
                titleAr: "Ø§Ø³ØªØ¹Ù…Ø§Ù„ ØªØµÙ…ÙŠÙ… Ø£Ùˆ Ø®Ø±ÙŠØ·Ø©"
            },
            {
                id: "ch2-l3-qima-raqm",
                title: "Valeur du chiffre selon sa position dans l'Ã©criture d'un nombre naturel",
                titleAr: "Ù‚ÙÙŠÙ…ÙŽØ©Ù Ø§Ù„Ø±ÙŽÙ‘Ù‚Ù… Ø­ÙŽØ³Ù’Ø¨ÙŽ Ù…ÙŽÙ†Ù’Ø²ÙÙ„ÙŽØªÙÙ‡Ù ÙÙŠ ÙƒÙØªÙŽØ§Ø¨ÙŽØ©Ù Ø¹Ø¯Ø¯Ù Ø·ÙŽØ¨ÙŠØ¹ÙŠÙÙ‘"
            },
            {
                id: "ch2-l4-alkusur",
                title: "Les fractions",
                titleAr: "Ø§Ù„ÙƒØ³ÙˆØ±"
            },
            {
                id: "ch2-l5-alkusur-alashira",
                title: "Les fractions dÃ©cimales et les nombres dÃ©cimaux",
                titleAr: "Ø§Ù„ÙƒØ³ÙˆØ± Ø§Ù„Ø¹Ø´Ø±ÙŠØ© ÙˆØ§Ù„Ø£Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ø¹Ø´Ø±ÙŠØ©"
            },
            {
                id: "ch2-l6-tanasubiya-1",
                title: "ProportionnalitÃ© 1 (classification d'une situation en utilisant le critÃ¨re de proportionnalitÃ©)",
                titleAr: "Ø§Ù„ØªÙ†Ø§Ø³Ø¨ÙŠØ©1 (ØªØµÙ†ÙŠÙ ÙˆØ¶Ø¹ÙŠØ© Ø¨Ø§Ø³ØªØ¹Ù…Ø§Ù„ Ù…Ø¹ÙŠØ§Ø± Ø§Ù„ØªÙ†Ø§Ø³Ø¨ÙŠØ©)"
            },
            {
                id: "ch2-l7-muhit-muraba-wa-mustatil",
                title: "PÃ©rimÃ¨tre du carrÃ© et du rectangle",
                titleAr: "Ù…Ø­ÙŠØ· Ø§Ù„Ù…Ø±Ø¨Ø¹ ÙˆØ§Ù„Ù…Ø³ØªØ·ÙŠÙ„"
            },
            {
                id: "ch2-l8-alqisma",
                title: "La division",
                titleAr: "Ø§Ù„Ù‚Ø³Ù…Ø©"
            },
            {
                id: "ch2-l9-tanazir-1",
                title: "SymÃ©trie 1 (vÃ©rifier qu'une figure a un axe de symÃ©trie ou plus en utilisant diffÃ©rentes techniques)",
                titleAr: "Ø§Ù„ØªÙ†Ø§Ø¸Ø±1 (Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø£Ù†Ù‘ Ù„Ø´ÙƒÙ„ Ù…Ø§ Ù…Ø­ÙˆØ± ØªÙ†Ø§Ø¸Ø± Ø£Ùˆ Ø£ÙƒØ«Ø± Ø¨Ø§Ø³ØªØ¹Ù…Ø§Ù„ ØªÙ‚Ù†ÙŠØ§Øª Ù…Ø®ØªÙ„ÙØ©.)"
            },
            {
                id: "ch2-l10-tanasubiya-2",
                title: "ProportionnalitÃ© 2 (rÃ©soudre des situations de proportionnalitÃ© en utilisant les propriÃ©tÃ©s de linÃ©aritÃ© et le coefficient de proportionnalitÃ©)",
                titleAr: "Ø§Ù„ØªÙ†Ø§Ø³Ø¨ÙŠØ©2 (Ø­Ù„ ÙˆØ¶Ø¹ÙŠØ§Øª ØªÙ†Ø§Ø³Ø¨ÙŠØ© Ø¨Ø§Ø³ØªØ¹Ù…Ø§Ù„ Ø®ÙˆØ§Øµ Ø§Ù„Ø®Ø·ÙŠØ© ÙˆÙ…Ø¹Ø§Ù…Ù„ Ø§Ù„ØªÙ†Ø§Ø³Ø¨ÙŠØ©.)"
            },
            {
                id: "ch2-l11-jam-wa-tarh-1",
                title: "Addition et soustraction de nombres naturels et dÃ©cimaux (1)",
                titleAr: "Ø­Ù…Ø¹ ÙˆØ·Ø±Ø­ Ø£Ø¹Ø¯Ø§Ø¯ Ø·Ø¨ÙŠØ¹ÙŠØ© ÙˆØ¹Ø´Ø±ÙŠØ© (1)"
            },
            {
                id: "ch2-l12-wadaiyat-jamiat-wa-darbiya",
                title: "Situations additives ou multiplicatives",
                titleAr: "ÙˆØ¶Ø¹ÙŠØ§Øª Ø¬Ù…Ø¹ÙŠØ© Ø£Ùˆ Ø¶Ø±Ø¨ÙŠØ©"
            },
            {
                id: "ch2-l13-tanazir-2",
                title: "SymÃ©trie 2 (tracer l'image d'une figure par rapport Ã  une droite donnÃ©e sur papier quadrillÃ©)",
                titleAr: "Ø§Ù„ØªÙ†Ø§Ø¸Ø±2 (Ø±Ø³Ù… Ù†Ø¸ÙŠØ± Ø´ÙƒÙ„ Ø¨Ø§Ù„Ù†Ø³Ø¨Ø© Ø¥Ù„Ù‰ Ù…Ø³ØªÙ‚ÙŠÙ… Ù…Ø¹Ø·Ù‰ Ø¹Ù„Ù‰ ÙˆØ±Ù‚Ø© Ù…Ø±ØµÙˆÙØ©.)"
            },
            {
                id: "ch2-l14-alhasiba",
                title: "La calculatrice",
                titleAr: "Ø§Ù„Ø­Ø§Ø³Ø¨Ø©"
            },
            {
                id: "ch2-l15-alashkal-alhandasiya",
                title: "Les figures gÃ©omÃ©triques familiÃ¨res",
                titleAr: "Ø§Ù„Ø£Ø´ÙƒØ§Ù„ Ø§Ù„Ù‡Ù†Ø¯Ø³ÙŠØ© Ø§Ù„Ù…Ø£Ù„ÙˆÙØ©"
            },
            {
                id: "ch2-l16-manhajiya-hall-mushkilat",
                title: "MÃ©thodologie de rÃ©solution de problÃ¨mes",
                titleAr: "Ù…Ù†Ù‡Ø¬ÙŠØ© Ø­Ù„Ù‘ Ù…Ø´ÙƒÙ„Ø§Øª"
            }
        ]
    },
    {
        id: "ch3-wadaiya-intilakiya-3",
        title: "Situation de dÃ©part 3",
        titleAr: "Ø§Ù„ÙˆØ¶Ø¹ÙŠØ© Ø§Ù„Ø§Ù†Ø·Ù„Ø§Ù‚ÙŠØ© 3",
        lessons: [
            {
                id: "ch3-l1-aadad-ashira-wa-mustaqim",
                title: "Les nombres dÃ©cimaux et la droite graduÃ©e",
                titleAr: "Ø§Ù„Ø§Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ø¹Ø´Ø±ÙŠØ© ÙˆØ§Ù„Ù…Ø³ØªÙ‚ÙŠÙ… Ø§Ù„Ù…Ø¯Ø±Ø¬"
            },
            {
                id: "ch3-l2-muqarana-wa-tartib-ashira",
                title: "Comparaison et classement de nombres dÃ©cimaux",
                titleAr: "Ù…Ù‚Ø§Ø±Ù†Ø© ÙˆØªØ±ØªÙŠØ¨ Ø£Ø¹Ø¯Ø§Ø¯ Ø¹Ø´Ø±ÙŠØ©"
            },
            {
                id: "ch3-l3-darb-fi-100-10-1000",
                title: "Multiplication par (ou division par) 100, 10, 1000",
                titleAr: "Ø§Ù„Ø¶Ø±Ø¨ ÙÙŠ (Ø£Ùˆ Ø§Ù„Ù‚Ø³Ù…Ø© Ø¹Ù„Ù‰) 100.10ØŒ 1000"
            },
            {
                id: "ch3-l4-tanasubiya-3",
                title: "ProportionnalitÃ© (3)",
                titleAr: "Ø§Ù„ØªÙ†Ø§Ø³Ø¨ÙŠØ© (3)"
            },
            {
                id: "ch3-l5-darb-adad-ashiri",
                title: "Multiplication d'un nombre dÃ©cimal par un nombre naturel",
                titleAr: "Ø¶Ø±Ø¨ Ø¹Ø¯Ø¯ Ø¹Ø´Ø±ÙŠ ÙÙŠ Ø¹Ø¯Ø¯ Ø·Ø¨ÙŠØ¹ÙŠ"
            },
            {
                id: "ch3-l6-tafkik-adad-ashiri-1",
                title: "DÃ©composition d'un nombre dÃ©cimal (1)",
                titleAr: "Ù†ÙÙƒÙŠÙƒ Ø¹Ø¯Ø¯ Ø¹Ø´Ø±ÙŠ (1)"
            },
            {
                id: "ch3-l7-almuthallathat-alkhassa",
                title: "Les triangles particuliers",
                titleAr: "Ø§Ù„Ù…Ø«Ù„Ø«Ø§Øª Ø§Ù„Ø®Ø§ØµØ©"
            },
            {
                id: "ch3-l8-qiyas-masahat",
                title: "Mesure de surfaces",
                titleAr: "Ù‚ÙŠØ§Ø³ Ù…Ø³Ø§Ø­Ø§Øª"
            },
            {
                id: "ch3-l9-masaha-muraba-wa-mustatil",
                title: "Aire du carrÃ© et du rectangle",
                titleAr: "Ù…Ø³Ø§Ø­Ø© Ø§Ù„Ù…Ø±Ø¨Ø¹ ÙˆØ§Ù„Ù…Ø³ØªØ·ÙŠÙ„"
            },
            {
                id: "ch3-l10-alaqat-hisabiya-ashira",
                title: "Relations arithmÃ©tiques entre nombres dÃ©cimaux",
                titleAr: "Ø¹Ù„Ø§Ù‚Ø§Øª Ø­Ø³Ø§Ø¨ÙŠØ© Ø¨ÙŠÙ† Ø£Ø¹Ø¯Ø§Ø¯ Ø¹Ø´Ø±ÙŠØ©"
            },
            {
                id: "ch3-l11-alnisba-almiawiya",
                title: "Le pourcentage",
                titleAr: "Ø§Ù„Ù†Ø³Ø¨Ø© Ø§Ù„Ù…Ø¦ÙˆÙŠØ©"
            },
            {
                id: "ch3-l12-alrubaiyat-alkhassa",
                title: "Les quadrilatÃ¨res particuliers",
                titleAr: "Ø§Ù„Ø±Ø¨Ø§Ø¹ÙŠØ§Øª Ø§Ù„Ø®Ø§ØµØ©"
            },
            {
                id: "ch3-l13-alqisma-3",
                title: "La division (3)",
                titleAr: "Ø§Ù„Ù‚Ø³Ù…Ø© (3)"
            },
            {
                id: "ch3-l14-qiyas-kutl",
                title: "Mesure de masses",
                titleAr: "Ù‚ÙŠØ§Ø³ ÙƒØªÙ„"
            },
            {
                id: "ch3-l15-tamthilat-bayaniya",
                title: "ReprÃ©sentations graphiques et diagrammes",
                titleAr: "ØªÙ…Ø«ÙŠÙ„Ø§Øª Ø¨ÙŠØ§Ù†ÙŠØ© ÙˆÙ…Ø®Ø·Ø·Ø§Øª"
            },
            {
                id: "ch3-l16-aldaira",
                title: "Le cercle",
                titleAr: "Ø§Ù„Ø¯Ø§Ø¦Ø±Ø©"
            },
            {
                id: "ch3-l17-alqisma-altamma",
                title: "La division exacte",
                titleAr: "Ø§Ù„Ù‚Ø³Ù…Ø© Ø§Ù„ØªØ§Ù…Ø©"
            },
            {
                id: "ch3-l18-aadad-ashira-wa-qiyas",
                title: "Les nombres dÃ©cimaux et la mesure de grandeurs",
                titleAr: "Ø§Ù„Ø£Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ø¹Ø´Ø±ÙŠØ© ÙˆÙ‚ÙŠØ§Ø³ Ù…Ù‚Ø§Ø¯ÙŠØ±"
            },
            {
                id: "ch3-l19-manhajiya-hall-mushkilat",
                title: "MÃ©thodologie de rÃ©solution de problÃ¨mes",
                titleAr: "Ù…Ù†Ù‡Ø¬ÙŠØ© Ø­Ù„ Ù…Ø´ÙƒÙ„Ø§Øª"
            }
        ]
    },
    {
        id: "ch4-wadaiya-intilakiya-4",
        title: "Situation de dÃ©part 4",
        titleAr: "Ø§Ù„ÙˆØ¶Ø¹ÙŠØ© Ø§Ù„Ø§Ù†Ø·Ù„Ø§Ù‚ÙŠØ© 4",
        lessons: [
            {
                id: "ch4-l1-almajassamat",
                title: "Les solides",
                titleAr: "Ø§Ù„Ù…Ø¬Ø³Ù…Ø§Øª"
            },
            {
                id: "ch4-l2-wadaiyat-qisma",
                title: "Situations de division",
                titleAr: "ÙˆØ¶Ø¹ÙŠØ§Øª Ù‚Ø³Ù…Ø©"
            },
            {
                id: "ch4-l3-naql-shakl",
                title: "Translation d'une figure ou son achÃ¨vement",
                titleAr: "Ù†Ù‚Ù„ Ø´ÙƒÙ„ Ø£Ùˆ Ø¥ØªÙ…Ø§Ù…Ù‡"
            },
            {
                id: "ch4-l4-insha-ashkal-handasiya",
                title: "Construction de figures gÃ©omÃ©triques",
                titleAr: "Ø¥Ù†Ø´Ø§Ø¡ Ø£Ø´ÙƒØ§Ù„ Ù‡Ù†Ø¯Ø³ÙŠØ©"
            },
            {
                id: "ch4-l5-alkusur-wa-aadad-ashira",
                title: "Les fractions et les nombres dÃ©cimaux",
                titleAr: "Ø§Ù„ÙƒØ³ÙˆØ± ÙˆØ§Ù„Ø£Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ø¹Ø´Ø±ÙŠØ©"
            },
            {
                id: "ch4-l6-wadaiyat-darb-wa-qisma",
                title: "Situations de multiplication ou division",
                titleAr: "ÙˆØ¶Ø¹ÙŠØ§Øª Ø¶Ø±Ø¨ Ø£Ùˆ Ù‚Ø³Ù…Ø©"
            },
            {
                id: "ch4-l7-qiyas-mudud",
                title: "Mesure de durÃ©es",
                titleAr: "Ù‚ÙŠØ§Ø³ Ù…Ø¯Ø¯"
            },
            {
                id: "ch4-l8-tafkik-adad-ashiri",
                title: "DÃ©composition d'un nombre dÃ©cimal",
                titleAr: "ØªÙÙƒÙŠÙƒ Ø¹Ø¯Ø¯ Ø¹Ø´Ø±ÙŠ"
            },
            {
                id: "ch4-l9-almqiyas",
                title: "L'Ã©chelle",
                titleAr: "Ø§Ù„Ù…Ù‚ÙŠØ§Ø³"
            },
            {
                id: "ch4-l10-qiyas-saiat",
                title: "Mesure de capacitÃ©s",
                titleAr: "Ù‚ÙŠØ§Ø³ Ø³Ø¹Ø§Øª"
            },
            {
                id: "ch4-l11-wadaiyat-hisabiya",
                title: "Situations arithmÃ©tiques",
                titleAr: "ÙˆØ¶Ø¹ÙŠØ§Øª Ø­Ø³Ø§Ø¨ÙŠØ©"
            },
            {
                id: "ch4-l12-alsurua-almutawassita",
                title: "La vitesse moyenne",
                titleAr: "Ø§Ù„Ø³Ø±Ø¹Ø© Ø§Ù„Ù…ØªÙˆØ³Ø·Ø©"
            },
            {
                id: "ch4-l13-qima-raqm-ashiri",
                title: "Valeur du chiffre selon sa position dans l'Ã©criture d'un nombre dÃ©cimal",
                titleAr: "Ù‚ÙÙŠÙ…ÙŽØ©Ù Ø§Ù„Ø±ÙŽÙ‘Ù‚Ù… Ø­ÙŽØ³Ù’Ø¨ÙŽ Ù…ÙŽÙ†Ù’Ø²ÙÙ„ÙŽØªÙÙ‡ ÙÙŠ ÙƒÙØªÙŽØ§Ø¨ÙŽØ© Ø¹Ø¯Ø¯Ù Ø¹Ø´Ø±ÙŠ"
            },
            {
                id: "ch4-l14-manhajiya-hall-mushkilat",
                title: "MÃ©thodologie de rÃ©solution de problÃ¨mes",
                titleAr: "Ù…Ù†Ù‡Ø¬ÙŠØ© Ø­Ù„Ù‘ Ù…Ø´ÙƒÙ„Ø§Øª"
            }
        ]
    }
];

export const getPrimaire5emeCourseInfo = () => ({
    title: "MathÃ©matiques - 5Ã¨me Primaire",
    titleAr: "Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠØ§Øª - Ø§Ù„Ø³Ù†Ø© Ø§Ù„Ø®Ø§Ù…Ø³Ø© Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠ",
    description: "Programme de mathÃ©matiques pour la 5Ã¨me annÃ©e du primaire",
    descriptionAr: "Ø¨Ø±Ù†Ø§Ù…Ø¬ Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠØ§Øª Ù„Ù„Ø³Ù†Ø© Ø§Ù„Ø®Ø§Ù…Ø³Ø© Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠ"
});
