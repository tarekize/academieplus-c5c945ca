// Mathématiques - 5ème Primaire
// Programme structuré en 4 chapitres

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
        title: "Situation de départ 1",
        titleAr: "اÙ„ÙˆضعÙŠة اÙ„اÙ†طÙ„اÙ‚ÙŠة 1",
        lessons: [
            {
                id: "ch1-l1-aadad-ila-999999-1",
                title: "Les nombres jusqu'à 999 999 '1' (écriture, lecture et décomposition des nombres jusqu'à 999 999)",
                titleAr: "اÙ„أعداد إÙ„Ù‰ 999999 '1'(Ùƒتابة ÙˆÙ‚راءة ÙˆتفÙƒÙŠÙƒ اÙ„أعداد إÙ„Ù‰999999 )"
            },
            {
                id: "ch1-l2-taalim-ala-marsoufa",
                title: "Enseignement sur quadrillage et utilisation de patron",
                titleAr: "اÙ„تعÙ„ÙŠÙ… عÙ„Ù‰ Ù…رصÙˆفة ÙˆاستعÙ…اÙ„ تصÙ…ÙŠÙ…"
            },
            {
                id: "ch1-l3-jam-aadad-tabiiya",
                title: "Addition de nombres naturels",
                titleAr: "جÙ…ع أعداد طبÙŠعÙŠة"
            },
            {
                id: "ch1-l4-aadad-ila-999999-2",
                title: "Les nombres jusqu'à 999 999 '2' (comparaison, classement et dénombrement jusqu'à 999 999)",
                titleAr: "اÙ„أعداد إÙ„Ù‰ 999 999 '2'(Ù…Ù‚ارÙ†ة ÙˆترتÙŠب Ùˆحصر اÙ„أعÙ…اد إÙ„Ù‰999999)"
            },
            {
                id: "ch1-l5-tarh-aadad-tabiiya",
                title: "Soustraction de nombres naturels",
                titleAr: "ضرح أعداد طبÙŠعÙŠة"
            },
            {
                id: "ch1-l6-tanzim-maaloumat",
                title: "Organisation d'informations dans un tableau",
                titleAr: "تÙ†ظÙŠÙ… Ù…عÙ„ÙˆÙ…ات فÙŠ جدÙˆÙ„"
            },
            {
                id: "ch1-l7-wadaiyat-jamiat-wa-tarhia",
                title: "Situations additives et soustractives",
                titleAr: "ÙˆضعÙŠات جÙ…عÙŠة ÙˆطرحÙŠة"
            },
            {
                id: "ch1-l8-istiqamiya-wa-toul",
                title: "Droite et longueur d'un segment",
                titleAr: "اÙ„استÙ‚اÙ…ÙŠةØŒ ÙˆطÙˆÙ„ Ù‚طعة Ù…ستÙ‚ÙŠÙ…"
            },
            {
                id: "ch1-l9-alaqat-hisabiya",
                title: "Relations arithmétiques entre nombres naturels",
                titleAr: "عÙ„اÙ‚ات حسابÙŠة بÙŠÙ† أعداد طبÙŠعÙŠة"
            },
            {
                id: "ch1-l10-atwal",
                title: "Les longueurs",
                titleAr: "اÙ„أطÙˆاÙ„"
            },
            {
                id: "ch1-l11-darb-fi-adad-birakamayn",
                title: "Multiplication par un nombre à deux chiffres",
                titleAr: "اÙ„ضرب فÙŠ عدد برÙ‚Ù…ÙŠÙ†"
            },
            {
                id: "ch1-l12-darb-fi-adad-bithalatha",
                title: "Multiplication par un nombre à trois chiffres",
                titleAr: "اÙ„ضرب فÙŠ عدد بثÙ„اثة أرÙ‚اÙ…"
            },
            {
                id: "ch1-l13-tanzim-wa-istighlal",
                title: "Organisation d'informations et leur exploitation",
                titleAr: "تÙ†ظÙŠÙ… Ù…عÙ„ÙˆÙ…ات ÙˆاستغÙ„اÙ„Ù‡ا"
            },
            {
                id: "ch1-l14-mustaqimat-mutawazi",
                title: "Droites parallèles et droites perpendiculaires",
                titleAr: "Ù…ستÙ‚ÙŠÙ…ات Ù…تÙˆازÙŠة ÙˆÙ…ستÙ‚ÙŠÙ…ات Ù…تعاÙ…دة"
            },
            {
                id: "ch1-l15-aadad-ila-999999999-1",
                title: "Les nombres jusqu'à 999 999 999 '1' (lecture, écriture et décomposition des nombres jusqu'à 999 999 999)",
                titleAr: "اÙ„أعداد إÙ„Ù‰ 999 999 999 '1'(Ù‚راءة ÙˆÙƒتابة ÙˆتفÙƒÙŠÙƒ اÙ„أعداد إÙ„Ù‰ 999 999 999)"
            },
            {
                id: "ch1-l16-aadad-ila-999999999-2",
                title: "Les nombres jusqu'à 999 999 999 '2' (comparaison, classement et dénombrement des nombres jusqu'à 999 999 999)",
                titleAr: "اÙ„أعداد إÙ„Ù‰ 999 999 999 '2'(Ù…Ù‚ارÙ†ة ÙˆترتÙŠب Ùˆحصر اÙ„أعداد إÙ„Ù‰ 999 999 999)"
            },
            {
                id: "ch1-l17-alhasiba",
                title: "La calculatrice (découverte des touches mémoire et leur contrôle)",
                titleAr: "اÙ„حاسبة (اÙƒتشاف اÙ„Ù…سات اÙ„ذاÙƒرة ÙˆاÙ„تحÙƒÙ… فÙŠÙ‡ا )"
            },
            {
                id: "ch1-l18-ad-kamiyat-kabira",
                title: "Dénombrement de grandes quantités",
                titleAr: "عد ÙƒÙ…ÙŠات ÙƒبÙŠرة"
            },
            {
                id: "ch1-l19-manhajiya-hall-mushkilat",
                title: "Méthodologie de résolution de problèmes",
                titleAr: "Ù…Ù†Ù‡جÙŠة حÙ„ Ù…شÙƒÙ„ات"
            }
        ]
    },
    {
        id: "ch2-wadaiya-intilakiya-2",
        title: "Situation de départ 2",
        titleAr: "اÙ„ÙˆضعÙŠة اÙ„اÙ†طÙ„اÙ‚ÙŠة 2",
        lessons: [
            {
                id: "ch2-l1-muqarana-wa-tartib-zawaya",
                title: "Comparaison et classement d'angles",
                titleAr: "Ù…Ù‚ارÙ†ة ÙˆترتÙŠب زÙˆاÙŠا"
            },
            {
                id: "ch2-l2-istiimal-tasmim",
                title: "Utilisation d'un patron ou d'une carte",
                titleAr: "استعÙ…اÙ„ تصÙ…ÙŠÙ… أÙˆ خرÙŠطة"
            },
            {
                id: "ch2-l3-qima-raqm",
                title: "Valeur du chiffre selon sa position dans l'écriture d'un nombre naturel",
                titleAr: "Ù‚ِÙŠÙ…ÙŽةُ اÙ„رÙŽÙ‘Ù‚Ù… حÙŽسÙ’بÙŽ Ù…ÙŽÙ†Ù’زِÙ„ÙŽتِÙ‡ِ فÙŠ ÙƒِتÙŽابÙŽةِ عددٍ طÙŽبÙŠعÙŠٍÙ‘"
            },
            {
                id: "ch2-l4-alkusur",
                title: "Les fractions",
                titleAr: "اÙ„ÙƒسÙˆر"
            },
            {
                id: "ch2-l5-alkusur-alashira",
                title: "Les fractions décimales et les nombres décimaux",
                titleAr: "اÙ„ÙƒسÙˆر اÙ„عشرÙŠة ÙˆاÙ„أعداد اÙ„عشرÙŠة"
            },
            {
                id: "ch2-l6-tanasubiya-1",
                title: "Proportionnalité 1 (classification d'une situation en utilisant le critère de proportionnalité)",
                titleAr: "اÙ„تÙ†اسبÙŠة1 (تصÙ†ÙŠف ÙˆضعÙŠة باستعÙ…اÙ„ Ù…عÙŠار اÙ„تÙ†اسبÙŠة)"
            },
            {
                id: "ch2-l7-muhit-muraba-wa-mustatil",
                title: "Périmètre du carré et du rectangle",
                titleAr: "Ù…حÙŠط اÙ„Ù…ربع ÙˆاÙ„Ù…ستطÙŠÙ„"
            },
            {
                id: "ch2-l8-alqisma",
                title: "La division",
                titleAr: "اÙ„Ù‚سÙ…ة"
            },
            {
                id: "ch2-l9-tanazir-1",
                title: "Symétrie 1 (vérifier qu'une figure a un axe de symétrie ou plus en utilisant différentes techniques)",
                titleAr: "اÙ„تÙ†اظر1 (اÙ„تحÙ‚Ù‚ Ù…Ù† أÙ†Ù‘ Ù„شÙƒÙ„ Ù…ا Ù…حÙˆر تÙ†اظر أÙˆ أÙƒثر باستعÙ…اÙ„ تÙ‚Ù†ÙŠات Ù…ختÙ„فة.)"
            },
            {
                id: "ch2-l10-tanasubiya-2",
                title: "Proportionnalité 2 (résoudre des situations de proportionnalité en utilisant les propriétés de linéarité et le coefficient de proportionnalité)",
                titleAr: "اÙ„تÙ†اسبÙŠة2 (حÙ„ ÙˆضعÙŠات تÙ†اسبÙŠة باستعÙ…اÙ„ خÙˆاص اÙ„خطÙŠة ÙˆÙ…عاÙ…Ù„ اÙ„تÙ†اسبÙŠة.)"
            },
            {
                id: "ch2-l11-jam-wa-tarh-1",
                title: "Addition et soustraction de nombres naturels et décimaux (1)",
                titleAr: "حÙ…ع Ùˆطرح أعداد طبÙŠعÙŠة ÙˆعشرÙŠة (1)"
            },
            {
                id: "ch2-l12-wadaiyat-jamiat-wa-darbiya",
                title: "Situations additives ou multiplicatives",
                titleAr: "ÙˆضعÙŠات جÙ…عÙŠة أÙˆ ضربÙŠة"
            },
            {
                id: "ch2-l13-tanazir-2",
                title: "Symétrie 2 (tracer l'image d'une figure par rapport à une droite donnée sur papier quadrillé)",
                titleAr: "اÙ„تÙ†اظر2 (رسÙ… Ù†ظÙŠر شÙƒÙ„ باÙ„Ù†سبة إÙ„Ù‰ Ù…ستÙ‚ÙŠÙ… Ù…عطÙ‰ عÙ„Ù‰ ÙˆرÙ‚ة Ù…رصÙˆفة.)"
            },
            {
                id: "ch2-l14-alhasiba",
                title: "La calculatrice",
                titleAr: "اÙ„حاسبة"
            },
            {
                id: "ch2-l15-alashkal-alhandasiya",
                title: "Les figures géométriques familières",
                titleAr: "اÙ„أشÙƒاÙ„ اÙ„Ù‡Ù†دسÙŠة اÙ„Ù…أÙ„Ùˆفة"
            },
            {
                id: "ch2-l16-manhajiya-hall-mushkilat",
                title: "Méthodologie de résolution de problèmes",
                titleAr: "Ù…Ù†Ù‡جÙŠة حÙ„Ù‘ Ù…شÙƒÙ„ات"
            }
        ]
    },
    {
        id: "ch3-wadaiya-intilakiya-3",
        title: "Situation de départ 3",
        titleAr: "اÙ„ÙˆضعÙŠة اÙ„اÙ†طÙ„اÙ‚ÙŠة 3",
        lessons: [
            {
                id: "ch3-l1-aadad-ashira-wa-mustaqim",
                title: "Les nombres décimaux et la droite graduée",
                titleAr: "اÙ„اعداد اÙ„عشرÙŠة ÙˆاÙ„Ù…ستÙ‚ÙŠÙ… اÙ„Ù…درج"
            },
            {
                id: "ch3-l2-muqarana-wa-tartib-ashira",
                title: "Comparaison et classement de nombres décimaux",
                titleAr: "Ù…Ù‚ارÙ†ة ÙˆترتÙŠب أعداد عشرÙŠة"
            },
            {
                id: "ch3-l3-darb-fi-100-10-1000",
                title: "Multiplication par (ou division par) 100, 10, 1000",
                titleAr: "اÙ„ضرب فÙŠ (أÙˆ اÙ„Ù‚سÙ…ة عÙ„Ù‰) 100.10ØŒ 1000"
            },
            {
                id: "ch3-l4-tanasubiya-3",
                title: "Proportionnalité (3)",
                titleAr: "اÙ„تÙ†اسبÙŠة (3)"
            },
            {
                id: "ch3-l5-darb-adad-ashiri",
                title: "Multiplication d'un nombre décimal par un nombre naturel",
                titleAr: "ضرب عدد عشرÙŠ فÙŠ عدد طبÙŠعÙŠ"
            },
            {
                id: "ch3-l6-tafkik-adad-ashiri-1",
                title: "Décomposition d'un nombre décimal (1)",
                titleAr: "Ù†فÙƒÙŠÙƒ عدد عشرÙŠ (1)"
            },
            {
                id: "ch3-l7-almuthallathat-alkhassa",
                title: "Les triangles particuliers",
                titleAr: "اÙ„Ù…ثÙ„ثات اÙ„خاصة"
            },
            {
                id: "ch3-l8-qiyas-masahat",
                title: "Mesure de surfaces",
                titleAr: "Ù‚ÙŠاس Ù…ساحات"
            },
            {
                id: "ch3-l9-masaha-muraba-wa-mustatil",
                title: "Aire du carré et du rectangle",
                titleAr: "Ù…ساحة اÙ„Ù…ربع ÙˆاÙ„Ù…ستطÙŠÙ„"
            },
            {
                id: "ch3-l10-alaqat-hisabiya-ashira",
                title: "Relations arithmétiques entre nombres décimaux",
                titleAr: "عÙ„اÙ‚ات حسابÙŠة بÙŠÙ† أعداد عشرÙŠة"
            },
            {
                id: "ch3-l11-alnisba-almiawiya",
                title: "Le pourcentage",
                titleAr: "اÙ„Ù†سبة اÙ„Ù…ئÙˆÙŠة"
            },
            {
                id: "ch3-l12-alrubaiyat-alkhassa",
                title: "Les quadrilatères particuliers",
                titleAr: "اÙ„رباعÙŠات اÙ„خاصة"
            },
            {
                id: "ch3-l13-alqisma-3",
                title: "La division (3)",
                titleAr: "اÙ„Ù‚سÙ…ة (3)"
            },
            {
                id: "ch3-l14-qiyas-kutl",
                title: "Mesure de masses",
                titleAr: "Ù‚ÙŠاس ÙƒتÙ„"
            },
            {
                id: "ch3-l15-tamthilat-bayaniya",
                title: "Représentations graphiques et diagrammes",
                titleAr: "تÙ…ثÙŠÙ„ات بÙŠاÙ†ÙŠة ÙˆÙ…خططات"
            },
            {
                id: "ch3-l16-aldaira",
                title: "Le cercle",
                titleAr: "اÙ„دائرة"
            },
            {
                id: "ch3-l17-alqisma-altamma",
                title: "La division exacte",
                titleAr: "اÙ„Ù‚سÙ…ة اÙ„تاÙ…ة"
            },
            {
                id: "ch3-l18-aadad-ashira-wa-qiyas",
                title: "Les nombres décimaux et la mesure de grandeurs",
                titleAr: "اÙ„أعداد اÙ„عشرÙŠة ÙˆÙ‚ÙŠاس Ù…Ù‚ادÙŠر"
            },
            {
                id: "ch3-l19-manhajiya-hall-mushkilat",
                title: "Méthodologie de résolution de problèmes",
                titleAr: "Ù…Ù†Ù‡جÙŠة حÙ„ Ù…شÙƒÙ„ات"
            }
        ]
    },
    {
        id: "ch4-wadaiya-intilakiya-4",
        title: "Situation de départ 4",
        titleAr: "اÙ„ÙˆضعÙŠة اÙ„اÙ†طÙ„اÙ‚ÙŠة 4",
        lessons: [
            {
                id: "ch4-l1-almajassamat",
                title: "Les solides",
                titleAr: "اÙ„Ù…جسÙ…ات"
            },
            {
                id: "ch4-l2-wadaiyat-qisma",
                title: "Situations de division",
                titleAr: "ÙˆضعÙŠات Ù‚سÙ…ة"
            },
            {
                id: "ch4-l3-naql-shakl",
                title: "Translation d'une figure ou son achèvement",
                titleAr: "Ù†Ù‚Ù„ شÙƒÙ„ أÙˆ إتÙ…اÙ…Ù‡"
            },
            {
                id: "ch4-l4-insha-ashkal-handasiya",
                title: "Construction de figures géométriques",
                titleAr: "إÙ†شاء أشÙƒاÙ„ Ù‡Ù†دسÙŠة"
            },
            {
                id: "ch4-l5-alkusur-wa-aadad-ashira",
                title: "Les fractions et les nombres décimaux",
                titleAr: "اÙ„ÙƒسÙˆر ÙˆاÙ„أعداد اÙ„عشرÙŠة"
            },
            {
                id: "ch4-l6-wadaiyat-darb-wa-qisma",
                title: "Situations de multiplication ou division",
                titleAr: "ÙˆضعÙŠات ضرب أÙˆ Ù‚سÙ…ة"
            },
            {
                id: "ch4-l7-qiyas-mudud",
                title: "Mesure de durées",
                titleAr: "Ù‚ÙŠاس Ù…دد"
            },
            {
                id: "ch4-l8-tafkik-adad-ashiri",
                title: "Décomposition d'un nombre décimal",
                titleAr: "تفÙƒÙŠÙƒ عدد عشرÙŠ"
            },
            {
                id: "ch4-l9-almqiyas",
                title: "L'échelle",
                titleAr: "اÙ„Ù…Ù‚ÙŠاس"
            },
            {
                id: "ch4-l10-qiyas-saiat",
                title: "Mesure de capacités",
                titleAr: "Ù‚ÙŠاس سعات"
            },
            {
                id: "ch4-l11-wadaiyat-hisabiya",
                title: "Situations arithmétiques",
                titleAr: "ÙˆضعÙŠات حسابÙŠة"
            },
            {
                id: "ch4-l12-alsurua-almutawassita",
                title: "La vitesse moyenne",
                titleAr: "اÙ„سرعة اÙ„Ù…تÙˆسطة"
            },
            {
                id: "ch4-l13-qima-raqm-ashiri",
                title: "Valeur du chiffre selon sa position dans l'écriture d'un nombre décimal",
                titleAr: "Ù‚ِÙŠÙ…ÙŽةُ اÙ„رÙŽÙ‘Ù‚Ù… حÙŽسÙ’بÙŽ Ù…ÙŽÙ†Ù’زِÙ„ÙŽتِÙ‡ فÙŠ ÙƒِتÙŽابÙŽة عددٍ عشرÙŠ"
            },
            {
                id: "ch4-l14-manhajiya-hall-mushkilat",
                title: "Méthodologie de résolution de problèmes",
                titleAr: "Ù…Ù†Ù‡جÙŠة حÙ„Ù‘ Ù…شÙƒÙ„ات"
            }
        ]
    }
];

export const getPrimaire5emeCourseInfo = () => ({
    title: "Mathématiques - 5ème Primaire",
    titleAr: "اÙ„رÙŠاضÙŠات - اÙ„سÙ†ة اÙ„خاÙ…سة ابتدائÙŠ",
    description: "Programme de mathématiques pour la 5ème année du primaire",
    descriptionAr: "برÙ†اÙ…ج اÙ„رÙŠاضÙŠات Ù„Ù„سÙ†ة اÙ„خاÙ…سة ابتدائÙŠ"
});
