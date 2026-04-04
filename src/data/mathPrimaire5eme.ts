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
        titleAr: "الوضعية الانطلاقية 1",
        lessons: [
            {
                id: "ch1-l1-aadad-ila-999999-1",
                title: "Les nombres jusqu'à 999 999 '1' (écriture, lecture et décomposition des nombres jusqu'à 999 999)",
                titleAr: "الأعداد إلى 999999 '1'(كتابة وقراءة وتفكيك الأعداد إلى999999 )"
            },
            {
                id: "ch1-l2-taalim-ala-marsoufa",
                title: "Enseignement sur quadrillage et utilisation de patron",
                titleAr: "التعليم على مرصوفة واستعمال تصميم"
            },
            {
                id: "ch1-l3-jam-aadad-tabiiya",
                title: "Addition de nombres naturels",
                titleAr: "جمع أعداد طبيعية"
            },
            {
                id: "ch1-l4-aadad-ila-999999-2",
                title: "Les nombres jusqu'à 999 999 '2' (comparaison, classement et dénombrement jusqu'à 999 999)",
                titleAr: "الأعداد إلى 999 999 '2'(مقارنة وترتيب وحصر الأعماد إلى999999)"
            },
            {
                id: "ch1-l5-tarh-aadad-tabiiya",
                title: "Soustraction de nombres naturels",
                titleAr: "ضرح أعداد طبيعية"
            },
            {
                id: "ch1-l6-tanzim-maaloumat",
                title: "Organisation d'informations dans un tableau",
                titleAr: "تنظيم معلومات في جدول"
            },
            {
                id: "ch1-l7-wadaiyat-jamiat-wa-tarhia",
                title: "Situations additives et soustractives",
                titleAr: "وضعيات جمعية وطرحية"
            },
            {
                id: "ch1-l8-istiqamiya-wa-toul",
                title: "Droite et longueur d'un segment",
                titleAr: "الاستقامية، وطول قطعة مستقيم"
            },
            {
                id: "ch1-l9-alaqat-hisabiya",
                title: "Relations arithmétiques entre nombres naturels",
                titleAr: "علاقات حسابية بين أعداد طبيعية"
            },
            {
                id: "ch1-l10-atwal",
                title: "Les longueurs",
                titleAr: "الأطوال"
            },
            {
                id: "ch1-l11-darb-fi-adad-birakamayn",
                title: "Multiplication par un nombre à deux chiffres",
                titleAr: "الضرب في عدد برقمين"
            },
            {
                id: "ch1-l12-darb-fi-adad-bithalatha",
                title: "Multiplication par un nombre à trois chiffres",
                titleAr: "الضرب في عدد بثلاثة أرقام"
            },
            {
                id: "ch1-l13-tanzim-wa-istighlal",
                title: "Organisation d'informations et leur exploitation",
                titleAr: "تنظيم معلومات واستغلالها"
            },
            {
                id: "ch1-l14-mustaqimat-mutawazi",
                title: "Droites parallèles et droites perpendiculaires",
                titleAr: "مستقيمات متوازية ومستقيمات متعامدة"
            },
            {
                id: "ch1-l15-aadad-ila-999999999-1",
                title: "Les nombres jusqu'à 999 999 999 '1' (lecture, écriture et décomposition des nombres jusqu'à 999 999 999)",
                titleAr: "الأعداد إلى 999 999 999 '1'(قراءة وكتابة وتفكيك الأعداد إلى 999 999 999)"
            },
            {
                id: "ch1-l16-aadad-ila-999999999-2",
                title: "Les nombres jusqu'à 999 999 999 '2' (comparaison, classement et dénombrement des nombres jusqu'à 999 999 999)",
                titleAr: "الأعداد إلى 999 999 999 '2'(مقارنة وترتيب وحصر الأعداد إلى 999 999 999)"
            },
            {
                id: "ch1-l17-alhasiba",
                title: "La calculatrice (découverte des touches mémoire et leur contrôle)",
                titleAr: "الحاسبة (اكتشاف المسات الذاكرة والتحكم فيها )"
            },
            {
                id: "ch1-l18-ad-kamiyat-kabira",
                title: "Dénombrement de grandes quantités",
                titleAr: "عد كميات كبيرة"
            },
            {
                id: "ch1-l19-manhajiya-hall-mushkilat",
                title: "Méthodologie de résolution de problèmes",
                titleAr: "منهجية حل مشكلات"
            }
        ]
    },
    {
        id: "ch2-wadaiya-intilakiya-2",
        title: "Situation de départ 2",
        titleAr: "الوضعية الانطلاقية 2",
        lessons: [
            {
                id: "ch2-l1-muqarana-wa-tartib-zawaya",
                title: "Comparaison et classement d'angles",
                titleAr: "مقارنة وترتيب زوايا"
            },
            {
                id: "ch2-l2-istiimal-tasmim",
                title: "Utilisation d'un patron ou d'une carte",
                titleAr: "استعمال تصميم أو خريطة"
            },
            {
                id: "ch2-l3-qima-raqm",
                title: "Valeur du chiffre selon sa position dans l'écriture d'un nombre naturel",
                titleAr: "قِيمَةُ الرَّقم حَسْبَ مَنْزِلَتِهِ في كِتَابَةِ عددٍ طَبيعيٍّ"
            },
            {
                id: "ch2-l4-alkusur",
                title: "Les fractions",
                titleAr: "الكسور"
            },
            {
                id: "ch2-l5-alkusur-alashira",
                title: "Les fractions décimales et les nombres décimaux",
                titleAr: "الكسور العشرية والأعداد العشرية"
            },
            {
                id: "ch2-l6-tanasubiya-1",
                title: "Proportionnalité 1 (classification d'une situation en utilisant le critère de proportionnalité)",
                titleAr: "التناسبية1 (تصنيف وضعية باستعمال معيار التناسبية)"
            },
            {
                id: "ch2-l7-muhit-muraba-wa-mustatil",
                title: "Périmètre du carré et du rectangle",
                titleAr: "محيط المربع والمستطيل"
            },
            {
                id: "ch2-l8-alqisma",
                title: "La division",
                titleAr: "القسمة"
            },
            {
                id: "ch2-l9-tanazir-1",
                title: "Symétrie 1 (vérifier qu'une figure a un axe de symétrie ou plus en utilisant différentes techniques)",
                titleAr: "التناظر1 (التحقق من أنّ لشكل ما محور تناظر أو أكثر باستعمال تقنيات مختلفة.)"
            },
            {
                id: "ch2-l10-tanasubiya-2",
                title: "Proportionnalité 2 (résoudre des situations de proportionnalité en utilisant les propriétés de linéarité et le coefficient de proportionnalité)",
                titleAr: "التناسبية2 (حل وضعيات تناسبية باستعمال خواص الخطية ومعامل التناسبية.)"
            },
            {
                id: "ch2-l11-jam-wa-tarh-1",
                title: "Addition et soustraction de nombres naturels et décimaux (1)",
                titleAr: "حمع وطرح أعداد طبيعية وعشرية (1)"
            },
            {
                id: "ch2-l12-wadaiyat-jamiat-wa-darbiya",
                title: "Situations additives ou multiplicatives",
                titleAr: "وضعيات جمعية أو ضربية"
            },
            {
                id: "ch2-l13-tanazir-2",
                title: "Symétrie 2 (tracer l'image d'une figure par rapport à une droite donnée sur papier quadrillé)",
                titleAr: "التناظر2 (رسم نظير شكل بالنسبة إلى مستقيم معطى على ورقة مرصوفة.)"
            },
            {
                id: "ch2-l14-alhasiba",
                title: "La calculatrice",
                titleAr: "الحاسبة"
            },
            {
                id: "ch2-l15-alashkal-alhandasiya",
                title: "Les figures géométriques familières",
                titleAr: "الأشكال الهندسية المألوفة"
            },
            {
                id: "ch2-l16-manhajiya-hall-mushkilat",
                title: "Méthodologie de résolution de problèmes",
                titleAr: "منهجية حلّ مشكلات"
            }
        ]
    },
    {
        id: "ch3-wadaiya-intilakiya-3",
        title: "Situation de départ 3",
        titleAr: "الوضعية الانطلاقية 3",
        lessons: [
            {
                id: "ch3-l1-aadad-ashira-wa-mustaqim",
                title: "Les nombres décimaux et la droite graduée",
                titleAr: "الاعداد العشرية والمستقيم المدرج"
            },
            {
                id: "ch3-l2-muqarana-wa-tartib-ashira",
                title: "Comparaison et classement de nombres décimaux",
                titleAr: "مقارنة وترتيب أعداد عشرية"
            },
            {
                id: "ch3-l3-darb-fi-100-10-1000",
                title: "Multiplication par (ou division par) 100, 10, 1000",
                titleAr: "الضرب في (أو القسمة على) 100.10، 1000"
            },
            {
                id: "ch3-l4-tanasubiya-3",
                title: "Proportionnalité (3)",
                titleAr: "التناسبية (3)"
            },
            {
                id: "ch3-l5-darb-adad-ashiri",
                title: "Multiplication d'un nombre décimal par un nombre naturel",
                titleAr: "ضرب عدد عشري في عدد طبيعي"
            },
            {
                id: "ch3-l6-tafkik-adad-ashiri-1",
                title: "Décomposition d'un nombre décimal (1)",
                titleAr: "نفكيك عدد عشري (1)"
            },
            {
                id: "ch3-l7-almuthallathat-alkhassa",
                title: "Les triangles particuliers",
                titleAr: "المثلثات الخاصة"
            },
            {
                id: "ch3-l8-qiyas-masahat",
                title: "Mesure de surfaces",
                titleAr: "قياس مساحات"
            },
            {
                id: "ch3-l9-masaha-muraba-wa-mustatil",
                title: "Aire du carré et du rectangle",
                titleAr: "مساحة المربع والمستطيل"
            },
            {
                id: "ch3-l10-alaqat-hisabiya-ashira",
                title: "Relations arithmétiques entre nombres décimaux",
                titleAr: "علاقات حسابية بين أعداد عشرية"
            },
            {
                id: "ch3-l11-alnisba-almiawiya",
                title: "Le pourcentage",
                titleAr: "النسبة المئوية"
            },
            {
                id: "ch3-l12-alrubaiyat-alkhassa",
                title: "Les quadrilatères particuliers",
                titleAr: "الرباعيات الخاصة"
            },
            {
                id: "ch3-l13-alqisma-3",
                title: "La division (3)",
                titleAr: "القسمة (3)"
            },
            {
                id: "ch3-l14-qiyas-kutl",
                title: "Mesure de masses",
                titleAr: "قياس كتل"
            },
            {
                id: "ch3-l15-tamthilat-bayaniya",
                title: "Représentations graphiques et diagrammes",
                titleAr: "تمثيلات بيانية ومخططات"
            },
            {
                id: "ch3-l16-aldaira",
                title: "Le cercle",
                titleAr: "الدائرة"
            },
            {
                id: "ch3-l17-alqisma-altamma",
                title: "La division exacte",
                titleAr: "القسمة التامة"
            },
            {
                id: "ch3-l18-aadad-ashira-wa-qiyas",
                title: "Les nombres décimaux et la mesure de grandeurs",
                titleAr: "الأعداد العشرية وقياس مقادير"
            },
            {
                id: "ch3-l19-manhajiya-hall-mushkilat",
                title: "Méthodologie de résolution de problèmes",
                titleAr: "منهجية حل مشكلات"
            }
        ]
    },
    {
        id: "ch4-wadaiya-intilakiya-4",
        title: "Situation de départ 4",
        titleAr: "الوضعية الانطلاقية 4",
        lessons: [
            {
                id: "ch4-l1-almajassamat",
                title: "Les solides",
                titleAr: "المجسمات"
            },
            {
                id: "ch4-l2-wadaiyat-qisma",
                title: "Situations de division",
                titleAr: "وضعيات قسمة"
            },
            {
                id: "ch4-l3-naql-shakl",
                title: "Translation d'une figure ou son achèvement",
                titleAr: "نقل شكل أو إتمامه"
            },
            {
                id: "ch4-l4-insha-ashkal-handasiya",
                title: "Construction de figures géométriques",
                titleAr: "إنشاء أشكال هندسية"
            },
            {
                id: "ch4-l5-alkusur-wa-aadad-ashira",
                title: "Les fractions et les nombres décimaux",
                titleAr: "الكسور والأعداد العشرية"
            },
            {
                id: "ch4-l6-wadaiyat-darb-wa-qisma",
                title: "Situations de multiplication ou division",
                titleAr: "وضعيات ضرب أو قسمة"
            },
            {
                id: "ch4-l7-qiyas-mudud",
                title: "Mesure de durées",
                titleAr: "قياس مدد"
            },
            {
                id: "ch4-l8-tafkik-adad-ashiri",
                title: "Décomposition d'un nombre décimal",
                titleAr: "تفكيك عدد عشري"
            },
            {
                id: "ch4-l9-almqiyas",
                title: "L'échelle",
                titleAr: "المقياس"
            },
            {
                id: "ch4-l10-qiyas-saiat",
                title: "Mesure de capacités",
                titleAr: "قياس سعات"
            },
            {
                id: "ch4-l11-wadaiyat-hisabiya",
                title: "Situations arithmétiques",
                titleAr: "وضعيات حسابية"
            },
            {
                id: "ch4-l12-alsurua-almutawassita",
                title: "La vitesse moyenne",
                titleAr: "السرعة المتوسطة"
            },
            {
                id: "ch4-l13-qima-raqm-ashiri",
                title: "Valeur du chiffre selon sa position dans l'écriture d'un nombre décimal",
                titleAr: "قِيمَةُ الرَّقم حَسْبَ مَنْزِلَتِه في كِتَابَة عددٍ عشري"
            },
            {
                id: "ch4-l14-manhajiya-hall-mushkilat",
                title: "Méthodologie de résolution de problèmes",
                titleAr: "منهجية حلّ مشكلات"
            }
        ]
    }
];

export const getPrimaire5emeCourseInfo = () => ({
    title: "Mathématiques - 5ème Primaire",
    titleAr: "الرياضيات - السنة الخامسة ابتدائي",
    description: "Programme de mathématiques pour la 5ème année du primaire",
    descriptionAr: "برنامج الرياضيات للسنة الخامسة ابتدائي"
});
