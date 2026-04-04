// Bot Onboarding Messages in French and Arabic
export const botOnboardingMessages = {
    welcome: {
        fr: "Salut ! Moi c'est EduBot. Avant de commencer tes leçons, j'aimerais savoir comment ton cerveau préfère apprendre ! 🧠",
        ar: "أهلاً بك يا بطل! أنا رفيقك، وسأرافقك في رحلتك التعليمية. 🚀",
    },
    explanation: {
        fr: "On va faire un petit jeu de quelques questions. Il n'y a pas de mauvaises réponses ! C'est juste pour découvrir comment tu apprends le mieux.",
        ar: "سوف نقوم بعمل لعبة صغيرة من الأسئلة. لا توجد إجابات خاطئة! فقط لمعرفة ما إذا كنت متعلماً بصرياً أم سمعياً أم حركياً.",
    },
    explanationDetail: {
        fr: "En d'autres termes, tu vas découvrir ton super-pouvoir d'apprentissage et je vais personnaliser tes cours en fonction ! 💪",
        ar: "بمعنى آخر، ستكتشف قوتك الخارقة في التعلم وسأقوم بتخصيص دروسك وفقاً لذلك! 💪",
    },
    reassurance: {
        fr: "Ne t'inquiète pas, ce n'est pas un test scolaire ! Juste un petit défi pour découvrir ton style d'apprentissage unique. 💪",
        ar: "لا تقلق، هذا ليس اختباراً مدرسياً! هو مجرد تحدٍ بسيط لنكتشف أسلوبك الخاص.",
    },
    readyQuestion: {
        fr: "Tu es prêt à découvrir ton super-pouvoir d'apprentissage ?",
        ar: "هل أنت مستعد لاكتشاف قوتك الخارقة في التعلم؟",
    },
    buttonStart: {
        fr: "C'est parti ! 🚀",
        ar: "يلا بنا! 🚀",
    },
    buttonExplainMore: {
        fr: "Explique-moi encore un peu",
        ar: "شرح أكثر قليلاً",
    },
    explainMoreTitle: {
        fr: "Bien sûr! Laisse-moi t'expliquer en détail 📚",
        ar: "بالتأكيد! دعني أشرح لك بالتفصيل 📚",
    },
    testExplanation: {
        fr: "Le test t'aide à comprendre ton style d'apprentissage unique et me permet de personnaliser tout pour toi! ✨",
        ar: "الاختبار يساعدك على فهم أسلوبك الفريد في التعلم ويسمح لي بتخصيص كل شيء من أجلك! ✨",
    },
    buttonContinue: {
        fr: "Compris, allons-y! 🚀",
        ar: "فهمت، يلا بنا! 🚀",
    },
};

// Learning Style Questions in French and Arabic
export const learningStyleQuestions = {
    question1: {
        fr: "Comment préfères-tu apprendre un nouveau concept en maths ?",
        ar: "كيف تفضل تعلم مفهوم جديد في الرياضيات؟",
        options: {
            visual: {
                fr: "Regarder une vidéo explicative",
                ar: "مشاهدة فيديو شارح 📺",
            },
            auditory: {
                fr: "Lire le cours écrit",
                ar: "سماع شرح صوتي 🎧",
            },
            kinesthetic: {
                fr: "Faire des exercices directement",
                ar: "ممارسة التمارين مباشرة 🛠️",
            },
        },
    },
    question2: {
        fr: "Quand tu ne comprends pas un exercice, tu préfères :",
        ar: "عندما لا تفهم تمريناً، تفضل:",
        options: {
            visual: {
                fr: "Voir un schéma ou un dessin",
                ar: "رؤية رسم تخطيطي أو صورة 📊",
            },
            auditory: {
                fr: "Relire la règle ou la formule",
                ar: "قراءة القاعدة أو الصيغة 📖",
            },
            kinesthetic: {
                fr: "Essayer avec d'autres nombres",
                ar: "محاولة مع أرقام أخرى 🔢",
            },
        },
    },
    question3: {
        fr: "Quel type de ressource t'aide le plus ?",
        ar: "ما نوع المورد الذي يساعدك أكثر؟",
        options: {
            visual: {
                fr: "Des infographies colorées et des diagrammes",
                ar: "رسومات بيانية ملونة وميزانيات 🎨",
            },
            auditory: {
                fr: "Des explications détaillées par écrit",
                ar: "شروحات مفصلة على النص ðŸ“",
            },
            kinesthetic: {
                fr: "Des projets pratiques et des défis",
                ar: "مشاريع عملية وتحديات 💪",
            },
        },
    },
};

// Learning Style Results
export const learningStyleResults = {
    visual: {
        fr: {
            title: "Apprenant Visuel 👀",
            description:
                "Tu apprends mieux avec des images, vidéos et schémas. Tes cours incluront beaucoup de visuels et de graphiques !",
        },
        ar: {
            title: "متعلم بصري 👀",
            description:
                "أنت تتعلم بشكل أفضل من خلال الصور والفيديوهات والرسوم التخطيطية. ستشمل دراستك الكثير من العناصر البصرية!",
        },
    },
    auditory: {
        fr: {
            title: "Apprenant Auditif 🎧",
            description:
                "Tu apprends mieux en lisant et en écoutant les explications. Tes ressources seront riches en textes détaillés et explications !",
        },
        ar: {
            title: "متعلم سمعي 🎧",
            description:
                "أنت تتعلم بشكل أفضل من خلال القراءة والاستماع للشروحات. ستكون مواردك غنية بالنصوص والتفسيرات الموضحة!",
        },
    },
    kinesthetic: {
        fr: {
            title: "Apprenant Pratique 🛠️",
            description:
                "Tu apprends mieux en faisant des exercices et en pratiquant. Tes cours seront remplis de défis et d'activités interactives !",
        },
        ar: {
            title: "متعلم عملي 🛠️",
            description:
                "أنت تتعلم بشكل أفضل من خلال ممارسة التمارين والأنشطة. ستكون دراستك مليئة بالتحديات والأنشطة التفاعلية!",
        },
    },
};

export const learningStyleDescriptions = {
    visual: {
        fr: {
            title: "👀 Apprenant Visuel",
            description: "Tu apprends mieux avec des images, des diagrammes et des vidéos. Tes cours incluront beaucoup de visuels!",
        },
        ar: {
            title: "👀 المتعلم البصري",
            description: "يتعلم بشكل أفضل من خلال الصور والرسومات والفيديوهات. سيحتوي منهجك على الكثير من العناصر البصرية!",
        },
    },
    auditory: {
        fr: {
            title: "🎧 Apprenant Auditif",
            description: "Tu apprends mieux en écoutant des explications verbales. Tes cours comprendront des explications audio détaillées!",
        },
        ar: {
            title: "🎧 المتعلم السمعي",
            description: "يتعلم بشكل أفضل من خلال الاستماع والشرح اللفظي. ستتضمن دروسك الكثير من التوضيحات الصوتية!",
        },
    },
    kinesthetic: {
        fr: {
            title: "🛠️ Apprenant Kinesthésique",
            description: "Tu apprends mieux en pratiquant et en faisant des exercices. Tes cours mettront l'accent sur la pratique!",
        },
        ar: {
            title: "🛠️ المتعلم الحركي",
            description: "يتعلم بشكل أفضل من خلال الممارسة والتمارين العملية. ستركز دروسك على التطبيق العملي!",
        },
    },
};
