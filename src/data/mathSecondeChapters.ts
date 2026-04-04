// Données Quiz et Exercices par chapitre - Mathématiques Seconde

export interface ChapterQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface ChapterExercise {
  id: string;
  title: string;
  statement: string;
  expectedAnswer: string; // Réponse attendue (format simplifié pour vérification)
  acceptedAnswers: string[]; // Variantes acceptées
  solution: string; // Correction détaillée
}

export interface ChapterContent {
  chapterId: string;
  chapterTitle: string;
  quizzes: ChapterQuizQuestion[];
  exercises: ChapterExercise[];
}

// Chapitre 1: Ensembles de nombres et calculs
const chapter1: ChapterContent = {
  chapterId: "ch1-nombres-calculs",
  chapterTitle: "Ensembles de nombres et calculs",
  quizzes: [
    {
      id: "ch1-q1",
      question: "Parmi les nombres suivants, lequel appartient Ã  â„š mais pas Ã  â„¤ ?",
      options: ["âˆš2", "3/4", "-5", "Ï€"],
      correctAnswer: "3/4",
      explanation: "3/4 est un rationnel (quotient de deux entiers). âˆš2 et Ï€ sont irrationnels, -5 est un entier."
    },
    {
      id: "ch1-q2",
      question: "Simplifier la fraction : 48/72",
      options: ["4/6", "2/3", "8/12", "16/24"],
      correctAnswer: "2/3",
      explanation: "PGCD(48, 72) = 24. Donc 48/72 = 2/3"
    },
    {
      id: "ch1-q3",
      question: "Quel est le résultat de (-3)Â² ?",
      options: ["-9", "9", "-6", "6"],
      correctAnswer: "9",
      explanation: "(-3)Â² = (-3) Ã— (-3) = 9. Le carré d'un nombre négatif est positif."
    },
    {
      id: "ch1-q4",
      question: "L'intervalle [2; 5[ contient :",
      options: ["2 et 5", "2 mais pas 5", "5 mais pas 2", "ni 2 ni 5"],
      correctAnswer: "2 mais pas 5",
      explanation: "Le crochet [ inclut la borne, le crochet [ exclut la borne. Donc 2 âˆˆ [2; 5[ mais 5 âˆ‰ [2; 5["
    },
    {
      id: "ch1-q5",
      question: "âˆš49 + âˆš16 = ?",
      options: ["âˆš65", "11", "13", "65"],
      correctAnswer: "11",
      explanation: "âˆš49 = 7 et âˆš16 = 4, donc âˆš49 + âˆš16 = 7 + 4 = 11"
    },
    {
      id: "ch1-q6",
      question: "Quel nombre n'est PAS un nombre rationnel ?",
      options: ["0,333...", "1/7", "âˆš9", "âˆš5"],
      correctAnswer: "âˆš5",
      explanation: "âˆš5 est irrationnel. 0,333... = 1/3, âˆš9 = 3, et 1/7 sont tous rationnels."
    },
    {
      id: "ch1-q7",
      question: "Calculer : 2/3 + 3/4",
      options: ["5/7", "5/12", "17/12", "6/7"],
      correctAnswer: "17/12",
      explanation: "2/3 + 3/4 = 8/12 + 9/12 = 17/12"
    },
    {
      id: "ch1-q8",
      question: "L'intersection de â„• et â„¤â» (entiers négatifs) est :",
      options: ["âˆ…", "{0}", "â„•", "â„¤"],
      correctAnswer: "{0}",
      explanation: "Le seul entier qui est Ã  la fois dans â„• et négatif ou nul est 0."
    },
    {
      id: "ch1-q9",
      question: "Écrire 0,00045 en notation scientifique :",
      options: ["4,5 Ã— 10â»â´", "45 Ã— 10â»âµ", "4,5 Ã— 10â»Â³", "0,45 Ã— 10â»Â³"],
      correctAnswer: "4,5 Ã— 10â»â´",
      explanation: "0,00045 = 4,5 Ã— 10â»â´ (on décale la virgule de 4 positions vers la droite)"
    },
    {
      id: "ch1-q10",
      question: "Quel est le PGCD de 36 et 48 ?",
      options: ["6", "12", "4", "24"],
      correctAnswer: "12",
      explanation: "36 = 12 Ã— 3 et 48 = 12 Ã— 4. Le PGCD est 12."
    }
  ],
  exercises: [
    {
      id: "ch1-ex1",
      title: "Simplification de fraction",
      statement: "Simplifier la fraction 84/126 sous forme irréductible. Donner le résultat sous la forme a/b.",
      expectedAnswer: "2/3",
      acceptedAnswers: ["2/3", "2 / 3"],
      solution: `**Étape 1 : Trouver le PGCD de 84 et 126**
- 84 = 2Â² Ã— 3 Ã— 7
- 126 = 2 Ã— 3Â² Ã— 7
- PGCD(84, 126) = 2 Ã— 3 Ã— 7 = 42

**Étape 2 : Simplifier**
84/126 = (84 Ã· 42)/(126 Ã· 42) = **2/3**`
    },
    {
      id: "ch1-ex2",
      title: "Opérations sur les fractions",
      statement: "Calculer : 5/6 - 2/9. Donner le résultat sous forme de fraction irréductible.",
      expectedAnswer: "11/18",
      acceptedAnswers: ["11/18", "11 / 18"],
      solution: `**Étape 1 : Trouver le dénominateur commun**
- PPCM(6, 9) = 18

**Étape 2 : Réduire au même dénominateur**
- 5/6 = 15/18
- 2/9 = 4/18

**Étape 3 : Calculer**
15/18 - 4/18 = **11/18**`
    },
    {
      id: "ch1-ex3",
      title: "Calcul avec puissances",
      statement: "Calculer (-2)Â³ Ã— 5Â². Donner le résultat numérique.",
      expectedAnswer: "-200",
      acceptedAnswers: ["-200"],
      solution: `**Étape 1 : Calculer chaque puissance**
- (-2)Â³ = (-2) Ã— (-2) Ã— (-2) = -8
- 5Â² = 25

**Étape 2 : Multiplier**
(-8) Ã— 25 = **-200**`
    },
    {
      id: "ch1-ex4",
      title: "Racine carrée",
      statement: "Simplifier âˆš72. Donner le résultat sous la forme aâˆšb où b est le plus petit possible.",
      expectedAnswer: "6âˆš2",
      acceptedAnswers: ["6âˆš2", "6*âˆš2", "6 âˆš2"],
      solution: `**Étape 1 : Décomposer 72**
72 = 36 Ã— 2 = 6Â² Ã— 2

**Étape 2 : Appliquer les propriétés**
âˆš72 = âˆš(36 Ã— 2) = âˆš36 Ã— âˆš2 = **6âˆš2**`
    },
    {
      id: "ch1-ex5",
      title: "Notation scientifique",
      statement: "Écrire 0,000327 en notation scientifique. Format : a Ã— 10^n",
      expectedAnswer: "3,27 Ã— 10^-4",
      acceptedAnswers: ["3,27 Ã— 10^-4", "3.27 Ã— 10^-4", "3,27Ã—10^-4", "3.27Ã—10^-4", "3,27 Ã— 10â»â´"],
      solution: `**Méthode :**
On déplace la virgule vers la droite jusqu'Ã  avoir un nombre entre 1 et 10.

0,000327 â†’ 3,27 (4 déplacements vers la droite)

**Résultat :** 3,27 Ã— 10â»â´`
    },
    {
      id: "ch1-ex6",
      title: "Intervalles",
      statement: "Écrire l'ensemble des solutions de -2 â‰¤ x < 5 sous forme d'intervalle.",
      expectedAnswer: "[-2; 5[",
      acceptedAnswers: ["[-2; 5[", "[-2;5[", "[-2, 5[", "[-2,5["],
      solution: `**Règle :**
- â‰¤ signifie que la borne est incluse â†’ crochet fermant [
- < signifie que la borne est exclue â†’ crochet ouvrant [

**Résultat :** [-2; 5[`
    },
    {
      id: "ch1-ex7",
      title: "Calcul avec racines",
      statement: "Calculer âˆš50 + âˆš18 - âˆš8. Donner le résultat sous la forme aâˆš2.",
      expectedAnswer: "6âˆš2",
      acceptedAnswers: ["6âˆš2", "6*âˆš2", "6 âˆš2"],
      solution: `**Étape 1 : Simplifier chaque racine**
- âˆš50 = âˆš(25Ã—2) = 5âˆš2
- âˆš18 = âˆš(9Ã—2) = 3âˆš2
- âˆš8 = âˆš(4Ã—2) = 2âˆš2

**Étape 2 : Calculer**
5âˆš2 + 3âˆš2 - 2âˆš2 = (5 + 3 - 2)âˆš2 = **6âˆš2**`
    },
    {
      id: "ch1-ex8",
      title: "Fractions composées",
      statement: "Calculer (3/4) Ã· (9/8). Donner le résultat sous forme de fraction irréductible.",
      expectedAnswer: "2/3",
      acceptedAnswers: ["2/3", "2 / 3"],
      solution: `**Règle :** Diviser par une fraction = multiplier par son inverse

**Calcul :**
(3/4) Ã· (9/8) = (3/4) Ã— (8/9)
= (3 Ã— 8) / (4 Ã— 9)
= 24/36 = **2/3**`
    },
    {
      id: "ch1-ex9",
      title: "Encadrement",
      statement: "Sachant que âˆš10 â‰ˆ 3,162, donner un encadrement d'ordre 1 (1 décimale) de âˆš10.",
      expectedAnswer: "3,1 < âˆš10 < 3,2",
      acceptedAnswers: ["3,1 < âˆš10 < 3,2", "3.1 < âˆš10 < 3.2", "[3,1 ; 3,2]"],
      solution: `**Méthode :**
âˆš10 â‰ˆ 3,162

On encadre par les valeurs Ã  une décimale :
**3,1 < âˆš10 < 3,2**

Car 3,1Â² = 9,61 < 10 et 3,2Â² = 10,24 > 10`
    },
    {
      id: "ch1-ex10",
      title: "Union d'intervalles",
      statement: "Écrire sous forme d'intervalle : ]-âˆž; 3] âˆª [1; +âˆž[",
      expectedAnswer: "â„",
      acceptedAnswers: ["â„", "R", "]-âˆž; +âˆž["],
      solution: `**Analyse :**
- ]-âˆž; 3] contient tous les nombres â‰¤ 3
- [1; +âˆž[ contient tous les nombres â‰¥ 1

Ces deux intervalles se chevauchent sur [1; 3].
Leur union couvre tout â„.

**Résultat :** â„ (ou ]-âˆž; +âˆž[)`
    }
  ]
};

// Chapitre 2: Calcul littéral
const chapter2: ChapterContent = {
  chapterId: "ch2-calcul-litteral",
  chapterTitle: "Calcul littéral",
  quizzes: [
    {
      id: "ch2-q1",
      question: "Développer (2x + 3)(x - 1) :",
      options: ["2xÂ² + x - 3", "2xÂ² - x - 3", "2xÂ² + 5x - 3", "2xÂ² - 5x + 3"],
      correctAnswer: "2xÂ² + x - 3",
      explanation: "(2x + 3)(x - 1) = 2xÂ² - 2x + 3x - 3 = 2xÂ² + x - 3"
    },
    {
      id: "ch2-q2",
      question: "Factoriser xÂ² - 9 :",
      options: ["(x - 3)Â²", "(x + 3)Â²", "(x - 3)(x + 3)", "(x - 9)(x + 1)"],
      correctAnswer: "(x - 3)(x + 3)",
      explanation: "C'est une différence de carrés : aÂ² - bÂ² = (a-b)(a+b), donc xÂ² - 9 = (x-3)(x+3)"
    },
    {
      id: "ch2-q3",
      question: "Développer (x + 4)Â² :",
      options: ["xÂ² + 16", "xÂ² + 4x + 16", "xÂ² + 8x + 16", "xÂ² + 8x + 8"],
      correctAnswer: "xÂ² + 8x + 16",
      explanation: "(a + b)Â² = aÂ² + 2ab + bÂ², donc (x + 4)Â² = xÂ² + 8x + 16"
    },
    {
      id: "ch2-q4",
      question: "Réduire : 3xÂ² + 2x - xÂ² + 5x - 7",
      options: ["2xÂ² + 7x - 7", "4xÂ² + 7x - 7", "2xÂ² + 3x - 7", "3xÂ² + 7x - 7"],
      correctAnswer: "2xÂ² + 7x - 7",
      explanation: "3xÂ² - xÂ² = 2xÂ² et 2x + 5x = 7x, donc 2xÂ² + 7x - 7"
    },
    {
      id: "ch2-q5",
      question: "Factoriser 6xÂ² + 9x :",
      options: ["3x(2x + 3)", "6x(x + 3)", "3(2xÂ² + 3x)", "9x(x + 1)"],
      correctAnswer: "3x(2x + 3)",
      explanation: "Le facteur commun est 3x : 6xÂ² + 9x = 3x(2x + 3)"
    },
    {
      id: "ch2-q6",
      question: "Développer (3x - 2)Â² :",
      options: ["9xÂ² - 4", "9xÂ² - 6x + 4", "9xÂ² - 12x + 4", "9xÂ² + 12x + 4"],
      correctAnswer: "9xÂ² - 12x + 4",
      explanation: "(a - b)Â² = aÂ² - 2ab + bÂ², donc (3x - 2)Â² = 9xÂ² - 12x + 4"
    },
    {
      id: "ch2-q7",
      question: "Simplifier (x + 2)(x - 2) - xÂ² :",
      options: ["-4", "4", "0", "-2x"],
      correctAnswer: "-4",
      explanation: "(x + 2)(x - 2) = xÂ² - 4, donc xÂ² - 4 - xÂ² = -4"
    },
    {
      id: "ch2-q8",
      question: "Factoriser xÂ² + 6x + 9 :",
      options: ["(x + 3)Â²", "(x - 3)Â²", "(x + 9)(x + 1)", "(x + 6)(x + 3)"],
      correctAnswer: "(x + 3)Â²",
      explanation: "C'est un carré parfait : xÂ² + 6x + 9 = (x + 3)Â²"
    },
    {
      id: "ch2-q9",
      question: "Développer 2(x - 3)(x + 1) :",
      options: ["2xÂ² - 4x - 6", "2xÂ² - 2x - 6", "2xÂ² + 4x - 6", "2xÂ² - 6x - 6"],
      correctAnswer: "2xÂ² - 4x - 6",
      explanation: "(x - 3)(x + 1) = xÂ² - 2x - 3, puis 2(xÂ² - 2x - 3) = 2xÂ² - 4x - 6"
    },
    {
      id: "ch2-q10",
      question: "Factoriser 25xÂ² - 1 :",
      options: ["(5x - 1)Â²", "(25x - 1)(x + 1)", "(5x - 1)(5x + 1)", "(5x + 1)Â²"],
      correctAnswer: "(5x - 1)(5x + 1)",
      explanation: "C'est aÂ² - bÂ² avec a = 5x et b = 1 : (5x - 1)(5x + 1)"
    }
  ],
  exercises: [
    {
      id: "ch2-ex1",
      title: "Développement double distributivité",
      statement: "Développer et réduire : (3x - 2)(2x + 5)",
      expectedAnswer: "6xÂ² + 11x - 10",
      acceptedAnswers: ["6xÂ² + 11x - 10", "6xÂ²+11x-10"],
      solution: `**Application de la double distributivité :**
(3x - 2)(2x + 5)
= 3x Ã— 2x + 3x Ã— 5 + (-2) Ã— 2x + (-2) Ã— 5
= 6xÂ² + 15x - 4x - 10
= **6xÂ² + 11x - 10**`
    },
    {
      id: "ch2-ex2",
      title: "Identité remarquable (a + b)Â²",
      statement: "Développer : (2x + 7)Â²",
      expectedAnswer: "4xÂ² + 28x + 49",
      acceptedAnswers: ["4xÂ² + 28x + 49", "4xÂ²+28x+49"],
      solution: `**Formule :** (a + b)Â² = aÂ² + 2ab + bÂ²

Avec a = 2x et b = 7 :
(2x + 7)Â² = (2x)Â² + 2(2x)(7) + 7Â²
= 4xÂ² + 28x + 49`
    },
    {
      id: "ch2-ex3",
      title: "Identité remarquable (a - b)Â²",
      statement: "Développer : (5x - 3)Â²",
      expectedAnswer: "25xÂ² - 30x + 9",
      acceptedAnswers: ["25xÂ² - 30x + 9", "25xÂ²-30x+9"],
      solution: `**Formule :** (a - b)Â² = aÂ² - 2ab + bÂ²

Avec a = 5x et b = 3 :
(5x - 3)Â² = 25xÂ² - 30x + 9`
    },
    {
      id: "ch2-ex4",
      title: "Factorisation par facteur commun",
      statement: "Factoriser : 12xÂ³ - 8xÂ² + 4x",
      expectedAnswer: "4x(3xÂ² - 2x + 1)",
      acceptedAnswers: ["4x(3xÂ² - 2x + 1)", "4x(3xÂ²-2x+1)"],
      solution: `**Étape 1 :** Identifier le facteur commun
- 12, 8, 4 ont pour PGCD : 4
- xÂ³, xÂ², x ont pour facteur commun : x
- Facteur commun : 4x

**Étape 2 :** Factoriser
12xÂ³ - 8xÂ² + 4x = 4x(3xÂ² - 2x + 1)`
    },
    {
      id: "ch2-ex5",
      title: "Différence de carrés",
      statement: "Factoriser : 16xÂ² - 81",
      expectedAnswer: "(4x - 9)(4x + 9)",
      acceptedAnswers: ["(4x - 9)(4x + 9)", "(4x+9)(4x-9)", "(4x - 9)(4x + 9)"],
      solution: `**Formule :** aÂ² - bÂ² = (a - b)(a + b)

16xÂ² - 81 = (4x)Â² - 9Â²
= (4x - 9)(4x + 9)`
    },
    {
      id: "ch2-ex6",
      title: "Carré parfait Ã  factoriser",
      statement: "Factoriser : xÂ² - 10x + 25",
      expectedAnswer: "(x - 5)Â²",
      acceptedAnswers: ["(x - 5)Â²", "(x-5)Â²", "(x - 5)^2"],
      solution: `**Vérification du carré parfait :**
xÂ² - 10x + 25

- Premier terme : xÂ²
- Dernier terme : 25 = 5Â²
- Terme du milieu : -10x = -2 Ã— x Ã— 5 âœ“

C'est (a - b)Â² avec a = x, b = 5
**Résultat :** (x - 5)Â²`
    },
    {
      id: "ch2-ex7",
      title: "Expression complexe",
      statement: "Développer et réduire : (x + 3)Â² - (x - 2)Â²",
      expectedAnswer: "10x + 5",
      acceptedAnswers: ["10x + 5", "10x+5", "5(2x + 1)"],
      solution: `**Méthode 1 : Développer chaque carré**
(x + 3)Â² = xÂ² + 6x + 9
(x - 2)Â² = xÂ² - 4x + 4

(x + 3)Â² - (x - 2)Â² = xÂ² + 6x + 9 - xÂ² + 4x - 4
= 10x + 5

**Méthode 2 : Utiliser aÂ² - bÂ² = (a-b)(a+b)**
= [(x+3) - (x-2)][(x+3) + (x-2)]
= (5)(2x + 1) = 10x + 5`
    },
    {
      id: "ch2-ex8",
      title: "Factorisation guidée",
      statement: "Factoriser : (x + 1)Â² - 4",
      expectedAnswer: "(x - 1)(x + 3)",
      acceptedAnswers: ["(x - 1)(x + 3)", "(x+3)(x-1)", "(x - 1)(x + 3)"],
      solution: `**Reconnaître aÂ² - bÂ² avec :**
- a = (x + 1)
- b = 2 (car 4 = 2Â²)

(x + 1)Â² - 4 = [(x + 1) - 2][(x + 1) + 2]
= (x - 1)(x + 3)`
    },
    {
      id: "ch2-ex9",
      title: "Produit nul",
      statement: "Soit P(x) = (2x - 6)(x + 4). Pour quelle valeur de x a-t-on P(x) = 0 ? (donner la plus petite)",
      expectedAnswer: "-4",
      acceptedAnswers: ["-4", "- 4"],
      solution: `**Équation produit nul :**
(2x - 6)(x + 4) = 0

Un produit est nul si l'un des facteurs est nul :
- 2x - 6 = 0 âŸ¹ x = 3
- x + 4 = 0 âŸ¹ x = -4

La plus petite valeur est **x = -4**`
    },
    {
      id: "ch2-ex10",
      title: "Calcul numérique astucieux",
      statement: "Calculer 101Â² - 99Â² sans poser d'opération. (Utiliser une identité remarquable)",
      expectedAnswer: "400",
      acceptedAnswers: ["400"],
      solution: `**Utiliser aÂ² - bÂ² = (a - b)(a + b)**

101Â² - 99Â² = (101 - 99)(101 + 99)
= 2 Ã— 200
= **400**`
    }
  ]
};

// Chapitre 3: Équations et inéquations
const chapter3: ChapterContent = {
  chapterId: "ch3-equations-inequations",
  chapterTitle: "Équations et inéquations",
  quizzes: [
    {
      id: "ch3-q1",
      question: "Résoudre : 3x - 7 = 2x + 5",
      options: ["x = 12", "x = -2", "x = 2", "x = -12"],
      correctAnswer: "x = 12",
      explanation: "3x - 2x = 5 + 7 âŸ¹ x = 12"
    },
    {
      id: "ch3-q2",
      question: "L'ensemble solution de 2x - 4 â‰¥ 0 est :",
      options: ["]-âˆž; 2]", "[2; +âˆž[", "]-âˆž; 2[", "]2; +âˆž["],
      correctAnswer: "[2; +âˆž[",
      explanation: "2x â‰¥ 4 âŸ¹ x â‰¥ 2, donc S = [2; +âˆž["
    },
    {
      id: "ch3-q3",
      question: "Résoudre : 5(x - 2) = 3x + 4",
      options: ["x = 7", "x = 3", "x = -7", "x = 14"],
      correctAnswer: "x = 7",
      explanation: "5x - 10 = 3x + 4 âŸ¹ 2x = 14 âŸ¹ x = 7"
    },
    {
      id: "ch3-q4",
      question: "L'équation 2x + 3 = 2x + 5 a pour solution :",
      options: ["x = 1", "x = 0", "Aucune solution", "Tous les réels"],
      correctAnswer: "Aucune solution",
      explanation: "2x - 2x = 5 - 3 âŸ¹ 0 = 2, ce qui est impossible. Aucune solution."
    },
    {
      id: "ch3-q5",
      question: "Résoudre : -3x < 12",
      options: ["x < -4", "x > -4", "x < 4", "x > 4"],
      correctAnswer: "x > -4",
      explanation: "En divisant par -3, on change le sens : x > -4"
    },
    {
      id: "ch3-q6",
      question: "L'équation (x - 3)(x + 2) = 0 a pour solutions :",
      options: ["x = 3", "x = -2", "x = 3 ou x = -2", "x = 3 et x = -2"],
      correctAnswer: "x = 3 ou x = -2",
      explanation: "Produit nul : x - 3 = 0 ou x + 2 = 0, donc x = 3 ou x = -2"
    },
    {
      id: "ch3-q7",
      question: "Résoudre : x/2 - 1 = x/3 + 2",
      options: ["x = 18", "x = 6", "x = -18", "x = 3"],
      correctAnswer: "x = 18",
      explanation: "x/2 - x/3 = 3 âŸ¹ x/6 = 3 âŸ¹ x = 18"
    },
    {
      id: "ch3-q8",
      question: "L'ensemble solution de 4 - 2x â‰¤ 10 est :",
      options: ["x â‰¥ -3", "x â‰¤ -3", "x â‰¥ 3", "x â‰¤ 3"],
      correctAnswer: "x â‰¥ -3",
      explanation: "-2x â‰¤ 6 âŸ¹ x â‰¥ -3 (on divise par -2, on change le sens)"
    },
    {
      id: "ch3-q9",
      question: "L'équation |x| = 5 a pour solutions :",
      options: ["x = 5", "x = -5", "x = 5 ou x = -5", "Pas de solution"],
      correctAnswer: "x = 5 ou x = -5",
      explanation: "|x| = 5 signifie x = 5 ou x = -5"
    },
    {
      id: "ch3-q10",
      question: "L'équation 3x + 1 = 3(x + 1) - 2 a pour solution :",
      options: ["x = 0", "x = 1", "Aucune solution", "Tous les réels"],
      correctAnswer: "Tous les réels",
      explanation: "3x + 1 = 3x + 3 - 2 = 3x + 1. L'équation est vraie pour tout x."
    }
  ],
  exercises: [
    {
      id: "ch3-ex1",
      title: "Équation du premier degré",
      statement: "Résoudre dans â„ : 5(x - 2) - 3(2x + 1) = 4x - 17",
      expectedAnswer: "x = 4/5",
      acceptedAnswers: ["x = 4/5", "4/5", "0,8", "0.8", "x = 0,8", "x = 0.8"],
      solution: `**Développer :**
5x - 10 - 6x - 3 = 4x - 17
-x - 13 = 4x - 17

**Isoler x :**
-x - 4x = -17 + 13
-5x = -4
**x = 4/5 = 0,8**`
    },
    {
      id: "ch3-ex2",
      title: "Inéquation du premier degré",
      statement: "Résoudre : 3x + 7 > 5x - 9. Donner la borne de l'intervalle solution.",
      expectedAnswer: "8",
      acceptedAnswers: ["8", "x < 8"],
      solution: `3x + 7 > 5x - 9
7 + 9 > 5x - 3x
16 > 2x
8 > x

**S = ]-âˆž; 8[**`
    },
    {
      id: "ch3-ex3",
      title: "Équation produit",
      statement: "Résoudre : (2x - 6)(3x + 9) = 0. Donner les deux solutions séparées par ;",
      expectedAnswer: "3 ; -3",
      acceptedAnswers: ["3 ; -3", "3;-3", "-3 ; 3", "-3;3", "x = 3 ou x = -3"],
      solution: `**Produit nul :**
2x - 6 = 0 âŸ¹ x = 3
3x + 9 = 0 âŸ¹ x = -3

**S = {-3 ; 3}**`
    },
    {
      id: "ch3-ex4",
      title: "Équation avec fractions",
      statement: "Résoudre : x/4 + 2 = x/6 + 5. Donner la valeur de x.",
      expectedAnswer: "-36",
      acceptedAnswers: ["-36", "x = -36"],
      solution: `**Multiplier par 12 (PPCM) :**
3x + 24 = 2x + 60
3x - 2x = 60 - 24
**x = 36**

Vérification : 36/4 + 2 = 9 + 2 = 11
36/6 + 5 = 6 + 5 = 11 âœ“`
    },
    {
      id: "ch3-ex5",
      title: "Inéquation avec coefficient négatif",
      statement: "Résoudre : -4x + 8 â‰¤ 20. Donner la borne de l'intervalle sous forme d'entier.",
      expectedAnswer: "-3",
      acceptedAnswers: ["-3", "x â‰¥ -3"],
      solution: `-4x + 8 â‰¤ 20
-4x â‰¤ 12
x â‰¥ -3 (division par -4, changement de sens)

**S = [-3; +âˆž[**`
    },
    {
      id: "ch3-ex6",
      title: "Problème avec mise en équation",
      statement: "Un rectangle a un périmètre de 54 cm. Sa longueur est le triple de sa largeur. Quelle est sa largeur en cm ?",
      expectedAnswer: "6,75",
      acceptedAnswers: ["6,75", "6.75", "27/4"],
      solution: `**Soit L la largeur**
Longueur = 3L
Périmètre = 2(L + 3L) = 8L

8L = 54
L = 54/8 = **6,75 cm**

Vérification : Longueur = 20,25 cm
P = 2(6,75 + 20,25) = 2 Ã— 27 = 54 âœ“`
    },
    {
      id: "ch3-ex7",
      title: "Double inéquation",
      statement: "Résoudre : -3 < 2x + 1 â‰¤ 7. Donner l'intervalle solution.",
      expectedAnswer: "]-2; 3]",
      acceptedAnswers: ["]-2; 3]", "]-2;3]", "(-2; 3]"],
      solution: `**Soustraire 1 :**
-3 - 1 < 2x â‰¤ 7 - 1
-4 < 2x â‰¤ 6

**Diviser par 2 :**
-2 < x â‰¤ 3

**S = ]-2; 3]**`
    },
    {
      id: "ch3-ex8",
      title: "Équation avec valeur absolue",
      statement: "Résoudre |2x - 4| = 6. Donner la somme des solutions.",
      expectedAnswer: "4",
      acceptedAnswers: ["4"],
      solution: `|2x - 4| = 6 signifie :
2x - 4 = 6 ou 2x - 4 = -6

**Cas 1 :** 2x = 10 âŸ¹ x = 5
**Cas 2 :** 2x = -2 âŸ¹ x = -1

Somme : 5 + (-1) = **4**`
    },
    {
      id: "ch3-ex9",
      title: "Problème d'âge",
      statement: "Dans 5 ans, Pierre aura le double de l'âge qu'avait Marie il y a 3 ans. Pierre a 21 ans. Quel est l'âge actuel de Marie ?",
      expectedAnswer: "16",
      acceptedAnswers: ["16", "16 ans"],
      solution: `**Soit M l'âge de Marie**
Dans 5 ans, Pierre aura : 21 + 5 = 26 ans
Il y a 3 ans, Marie avait : M - 3 ans

Équation : 26 = 2(M - 3)
26 = 2M - 6
32 = 2M
M = **16 ans**`
    },
    {
      id: "ch3-ex10",
      title: "Système de conditions",
      statement: "Trouver les entiers x tels que 2x - 1 > 5 ET 3x < 21",
      expectedAnswer: "4, 5, 6",
      acceptedAnswers: ["4, 5, 6", "4;5;6", "{4, 5, 6}", "4 5 6"],
      solution: `**Condition 1 :** 2x - 1 > 5 âŸ¹ 2x > 6 âŸ¹ x > 3
**Condition 2 :** 3x < 21 âŸ¹ x < 7

Intersection : 3 < x < 7
Entiers : **x âˆˆ {4, 5, 6}**`
    }
  ]
};

// Chapitre 4: Fonctions - Généralités
const chapter4: ChapterContent = {
  chapterId: "ch4-fonctions-generalites",
  chapterTitle: "Fonctions - Généralités",
  quizzes: [
    {
      id: "ch4-q1",
      question: "Soit f(x) = 2x - 5. Quelle est l'image de 3 par f ?",
      options: ["1", "-1", "6", "11"],
      correctAnswer: "1",
      explanation: "f(3) = 2Ã—3 - 5 = 6 - 5 = 1"
    },
    {
      id: "ch4-q2",
      question: "Si f(x) = 3, alors 3 est :",
      options: ["Un antécédent de x", "L'image de x", "La courbe de f", "Le domaine de f"],
      correctAnswer: "L'image de x",
      explanation: "f(x) = 3 signifie que 3 est l'image de x par f"
    },
    {
      id: "ch4-q3",
      question: "Soit f(x) = xÂ² - 4. Les antécédents de 0 sont :",
      options: ["0", "2", "-2", "2 et -2"],
      correctAnswer: "2 et -2",
      explanation: "f(x) = 0 âŸ¹ xÂ² = 4 âŸ¹ x = 2 ou x = -2"
    },
    {
      id: "ch4-q4",
      question: "Une fonction est croissante sur un intervalle si :",
      options: [
        "Sa courbe monte de gauche Ã  droite",
        "f(a) < f(b) pour tout a < b de l'intervalle",
        "f(a) > f(b) pour tout a < b de l'intervalle",
        "Les réponses 1 et 2"
      ],
      correctAnswer: "Les réponses 1 et 2",
      explanation: "Une fonction est croissante si quand x augmente, f(x) augmente aussi"
    },
    {
      id: "ch4-q5",
      question: "Le domaine de définition de f(x) = 1/(x-2) est :",
      options: ["â„", "â„ \\ {2}", "â„âº", "]2; +âˆž["],
      correctAnswer: "â„ \\ {2}",
      explanation: "On ne peut pas diviser par 0, donc x â‰  2"
    },
    {
      id: "ch4-q6",
      question: "f(x) = -3x + 7 est une fonction :",
      options: ["Croissante sur â„", "Décroissante sur â„", "Ni croissante ni décroissante", "Constante"],
      correctAnswer: "Décroissante sur â„",
      explanation: "Le coefficient de x est -3 < 0, donc f est décroissante"
    },
    {
      id: "ch4-q7",
      question: "L'extremum de f(x) = xÂ² est :",
      options: ["Un maximum en 0", "Un minimum en 0", "Un maximum en 1", "Il n'y en a pas"],
      correctAnswer: "Un minimum en 0",
      explanation: "xÂ² â‰¥ 0 pour tout x, avec égalité en x = 0"
    },
    {
      id: "ch4-q8",
      question: "Lire graphiquement f(2) signifie :",
      options: [
        "Trouver l'abscisse du point d'ordonnée 2",
        "Trouver l'ordonnée du point d'abscisse 2",
        "Trouver 2 sur l'axe des x",
        "Calculer 2 Ã— f"
      ],
      correctAnswer: "Trouver l'ordonnée du point d'abscisse 2",
      explanation: "f(2) est l'ordonnée du point de la courbe d'abscisse 2"
    },
    {
      id: "ch4-q9",
      question: "Soit f définie sur [0; 5]. L'image de [0; 5] par f peut être :",
      options: ["[2; 10]", "Un seul nombre", "Un ensemble vide", "Les réponses 1 et 2"],
      correctAnswer: "Les réponses 1 et 2",
      explanation: "L'image peut être un intervalle ou même réduite Ã  un point (fonction constante)"
    },
    {
      id: "ch4-q10",
      question: "Si la courbe de f passe par le point (3; 7), alors :",
      options: ["f(7) = 3", "f(3) = 7", "f(0) = 10", "f(3) = 0"],
      correctAnswer: "f(3) = 7",
      explanation: "Le point (3; 7) signifie que pour x = 3, f(x) = 7"
    }
  ],
  exercises: [
    {
      id: "ch4-ex1",
      title: "Calcul d'images",
      statement: "Soit f(x) = 3xÂ² - 2x + 1. Calculer f(-2).",
      expectedAnswer: "17",
      acceptedAnswers: ["17", "f(-2) = 17"],
      solution: `f(-2) = 3Ã—(-2)Â² - 2Ã—(-2) + 1
= 3Ã—4 + 4 + 1
= 12 + 4 + 1
= **17**`
    },
    {
      id: "ch4-ex2",
      title: "Recherche d'antécédent",
      statement: "Soit f(x) = 4x - 7. Trouver l'antécédent de 13 par f.",
      expectedAnswer: "5",
      acceptedAnswers: ["5", "x = 5"],
      solution: `On résout f(x) = 13
4x - 7 = 13
4x = 20
**x = 5**

Vérification : f(5) = 4Ã—5 - 7 = 13 âœ“`
    },
    {
      id: "ch4-ex3",
      title: "Tableau de valeurs",
      statement: "Soit f(x) = xÂ² - 3x. Calculer f(0) + f(1) + f(2).",
      expectedAnswer: "-4",
      acceptedAnswers: ["-4"],
      solution: `f(0) = 0Â² - 3Ã—0 = 0
f(1) = 1Â² - 3Ã—1 = -2
f(2) = 2Â² - 3Ã—2 = 4 - 6 = -2

f(0) + f(1) + f(2) = 0 + (-2) + (-2) = **-4**`
    },
    {
      id: "ch4-ex4",
      title: "Domaine de définition",
      statement: "Soit f(x) = âˆš(x - 3). Pour quelle valeur minimale de x la fonction est-elle définie ?",
      expectedAnswer: "3",
      acceptedAnswers: ["3", "x = 3", "x â‰¥ 3"],
      solution: `Pour que âˆš(x - 3) existe, il faut :
x - 3 â‰¥ 0
x â‰¥ 3

Le domaine de définition est [3; +âˆž[
La valeur minimale est **x = 3**`
    },
    {
      id: "ch4-ex5",
      title: "Parité d'une fonction",
      statement: "Soit f(x) = xÂ³ + x. Calculer f(-2) + f(2).",
      expectedAnswer: "0",
      acceptedAnswers: ["0"],
      solution: `f(2) = 2Â³ + 2 = 8 + 2 = 10
f(-2) = (-2)Â³ + (-2) = -8 - 2 = -10

f(-2) + f(2) = -10 + 10 = **0**

(f est impaire : f(-x) = -f(x))`
    },
    {
      id: "ch4-ex6",
      title: "Extremum",
      statement: "Soit f(x) = -xÂ² + 4x - 3. Pour quelle valeur de x f atteint-elle son maximum ?",
      expectedAnswer: "2",
      acceptedAnswers: ["2", "x = 2"],
      solution: `f(x) = -xÂ² + 4x - 3 = -(xÂ² - 4x) - 3
= -(xÂ² - 4x + 4 - 4) - 3
= -(x - 2)Â² + 4 - 3
= -(x - 2)Â² + 1

Le maximum est atteint quand (x - 2)Â² = 0
soit **x = 2**`
    },
    {
      id: "ch4-ex7",
      title: "Sens de variation",
      statement: "Soit f(x) = 5 - 2x. Sur quel intervalle f est-elle positive ? Donner la borne.",
      expectedAnswer: "2,5",
      acceptedAnswers: ["2,5", "2.5", "5/2", "x â‰¤ 2,5"],
      solution: `f(x) â‰¥ 0
5 - 2x â‰¥ 0
5 â‰¥ 2x
x â‰¤ 2,5

f est positive sur ]-âˆž; **2,5**]`
    },
    {
      id: "ch4-ex8",
      title: "Résolution graphique",
      statement: "Soit f(x) = xÂ² - 4. Combien la courbe de f a-t-elle de points d'intersection avec l'axe des abscisses ?",
      expectedAnswer: "2",
      acceptedAnswers: ["2", "deux"],
      solution: `Points d'intersection avec l'axe des x : f(x) = 0
xÂ² - 4 = 0
xÂ² = 4
x = 2 ou x = -2

Il y a **2** points d'intersection : (-2; 0) et (2; 0)`
    },
    {
      id: "ch4-ex9",
      title: "Expression algébrique",
      statement: "Une fonction f vérifie f(x+1) = f(x) + 3 pour tout x, et f(0) = 2. Calculer f(3).",
      expectedAnswer: "11",
      acceptedAnswers: ["11", "f(3) = 11"],
      solution: `f(1) = f(0) + 3 = 2 + 3 = 5
f(2) = f(1) + 3 = 5 + 3 = 8
f(3) = f(2) + 3 = 8 + 3 = **11**`
    },
    {
      id: "ch4-ex10",
      title: "Problème contextualisé",
      statement: "Le prix d'un trajet en taxi est P(x) = 2.5x + 4 où x est la distance en km. Quel est le prix pour 12 km ?",
      expectedAnswer: "34",
      acceptedAnswers: ["34", "34â‚¬", "34 â‚¬", "34 euros"],
      solution: `P(12) = 2.5 Ã— 12 + 4
= 30 + 4
= **34 â‚¬**`
    }
  ]
};

// Chapitre 5: Fonctions affines
const chapter5: ChapterContent = {
  chapterId: "ch5-fonctions-affines",
  chapterTitle: "Fonctions affines et droites",
  quizzes: [
    {
      id: "ch5-q1",
      question: "L'équation y = 2x + 3 représente :",
      options: ["Une parabole", "Une droite de pente 3", "Une droite de pente 2", "Un cercle"],
      correctAnswer: "Une droite de pente 2",
      explanation: "y = ax + b est l'équation d'une droite avec a = coefficient directeur (pente)"
    },
    {
      id: "ch5-q2",
      question: "Une fonction affine f(x) = ax + b est croissante si :",
      options: ["a > 0", "a < 0", "b > 0", "b < 0"],
      correctAnswer: "a > 0",
      explanation: "Le sens de variation dépend du signe de a"
    },
    {
      id: "ch5-q3",
      question: "La droite passant par A(1; 3) et B(3; 7) a pour coefficient directeur :",
      options: ["2", "4", "1/2", "10"],
      correctAnswer: "2",
      explanation: "a = (y_B - y_A)/(x_B - x_A) = (7-3)/(3-1) = 4/2 = 2"
    },
    {
      id: "ch5-q4",
      question: "L'ordonnée Ã  l'origine de y = -3x + 5 est :",
      options: ["-3", "5", "2", "-5"],
      correctAnswer: "5",
      explanation: "L'ordonnée Ã  l'origine est b dans y = ax + b"
    },
    {
      id: "ch5-q5",
      question: "Deux droites parallèles ont :",
      options: ["La même ordonnée Ã  l'origine", "Le même coefficient directeur", "La même équation", "Aucun point commun toujours"],
      correctAnswer: "Le même coefficient directeur",
      explanation: "Parallèles âŸº mêmes coefficients directeurs (mais ordonnées Ã  l'origine différentes)"
    },
    {
      id: "ch5-q6",
      question: "f(x) = 5 est une fonction :",
      options: ["Affine non linéaire", "Linéaire", "Constante", "Quadratique"],
      correctAnswer: "Constante",
      explanation: "f(x) = 5 = 0Ã—x + 5, c'est une fonction constante (cas particulier d'affine)"
    },
    {
      id: "ch5-q7",
      question: "La droite y = 2x - 1 coupe l'axe des x en :",
      options: ["x = -1", "x = 1/2", "x = 2", "x = 1"],
      correctAnswer: "x = 1/2",
      explanation: "2x - 1 = 0 âŸ¹ x = 1/2"
    },
    {
      id: "ch5-q8",
      question: "Si f(x) = 3x + b et f(2) = 11, alors b = :",
      options: ["5", "6", "8", "3"],
      correctAnswer: "5",
      explanation: "f(2) = 6 + b = 11 âŸ¹ b = 5"
    },
    {
      id: "ch5-q9",
      question: "La droite y = -x + 4 est :",
      options: ["Horizontale", "Verticale", "Croissante", "Décroissante"],
      correctAnswer: "Décroissante",
      explanation: "Le coefficient directeur est -1 < 0, donc décroissante"
    },
    {
      id: "ch5-q10",
      question: "Une fonction linéaire passe toujours par :",
      options: ["(0; 1)", "(1; 0)", "(0; 0)", "(1; 1)"],
      correctAnswer: "(0; 0)",
      explanation: "f(x) = ax âŸ¹ f(0) = 0, donc passe par l'origine"
    }
  ],
  exercises: [
    {
      id: "ch5-ex1",
      title: "Déterminer une fonction affine",
      statement: "Trouver f(x) = ax + b sachant que f(1) = 5 et f(3) = 11. Donner la valeur de a.",
      expectedAnswer: "3",
      acceptedAnswers: ["3", "a = 3"],
      solution: `**Système :**
a + b = 5
3a + b = 11

**Soustraction :**
2a = 6 âŸ¹ **a = 3**
b = 5 - 3 = 2

f(x) = 3x + 2`
    },
    {
      id: "ch5-ex2",
      title: "Coefficient directeur",
      statement: "Calculer le coefficient directeur de la droite passant par A(-2; 5) et B(4; -1).",
      expectedAnswer: "-1",
      acceptedAnswers: ["-1", "a = -1"],
      solution: `a = (y_B - y_A)/(x_B - x_A)
= (-1 - 5)/(4 - (-2))
= -6/6
= **-1**`
    },
    {
      id: "ch5-ex3",
      title: "Équation de droite",
      statement: "Écrire l'équation de la droite de coefficient directeur 2 passant par (3; 7). Donner b.",
      expectedAnswer: "1",
      acceptedAnswers: ["1", "b = 1"],
      solution: `y = 2x + b
Le point (3; 7) vérifie : 7 = 2Ã—3 + b
7 = 6 + b
**b = 1**

Équation : y = 2x + 1`
    },
    {
      id: "ch5-ex4",
      title: "Point d'intersection avec l'axe des x",
      statement: "La droite y = 4x - 8 coupe l'axe des x en quel point ? Donner l'abscisse.",
      expectedAnswer: "2",
      acceptedAnswers: ["2", "x = 2"],
      solution: `Sur l'axe des x : y = 0
4x - 8 = 0
4x = 8
**x = 2**

Point d'intersection : (2; 0)`
    },
    {
      id: "ch5-ex5",
      title: "Parallélisme",
      statement: "La droite D1 : y = 3x - 2 est parallèle Ã  D2 : y = ax + 5. Quelle est la valeur de a ?",
      expectedAnswer: "3",
      acceptedAnswers: ["3", "a = 3"],
      solution: `Deux droites sont parallèles si elles ont le même coefficient directeur.
D1 a pour coefficient 3.
Donc **a = 3** pour que D2 soit parallèle Ã  D1.`
    },
    {
      id: "ch5-ex6",
      title: "Point d'intersection de deux droites",
      statement: "Trouver l'abscisse du point d'intersection de D1 : y = 2x + 1 et D2 : y = -x + 7.",
      expectedAnswer: "2",
      acceptedAnswers: ["2", "x = 2"],
      solution: `À l'intersection : 2x + 1 = -x + 7
3x = 6
**x = 2**

y = 2Ã—2 + 1 = 5
Point : (2; 5)`
    },
    {
      id: "ch5-ex7",
      title: "Fonction affine - Applications",
      statement: "Un plombier facture 30â‚¬ de déplacement plus 40â‚¬/heure. Quel est le coût pour 3h de travail ?",
      expectedAnswer: "150",
      acceptedAnswers: ["150", "150â‚¬", "150 â‚¬"],
      solution: `Coût = f(t) = 40t + 30
f(3) = 40Ã—3 + 30 = 120 + 30 = **150â‚¬**`
    },
    {
      id: "ch5-ex8",
      title: "Représentation graphique",
      statement: "Une droite passe par (0; 4) et (2; 0). Donner son coefficient directeur.",
      expectedAnswer: "-2",
      acceptedAnswers: ["-2", "a = -2"],
      solution: `a = (0 - 4)/(2 - 0) = -4/2 = **-2**

Équation : y = -2x + 4`
    },
    {
      id: "ch5-ex9",
      title: "Signe d'une fonction affine",
      statement: "Pour quelles valeurs de x a-t-on 3x - 6 > 0 ? Donner la borne de l'intervalle.",
      expectedAnswer: "2",
      acceptedAnswers: ["2", "x > 2"],
      solution: `3x - 6 > 0
3x > 6
x > 2

La fonction est positive sur ]**2**; +âˆž[`
    },
    {
      id: "ch5-ex10",
      title: "Modélisation",
      statement: "La température baisse de 2°C par heure. À 14h il fait 20°C. Quelle température Ã  17h ?",
      expectedAnswer: "14",
      acceptedAnswers: ["14", "14°C", "14 °C"],
      solution: `T(t) = -2t + b où t = nombre d'heures après 14h
T(0) = 20 donc b = 20

T(t) = -2t + 20
À 17h : t = 3
T(3) = -6 + 20 = **14°C**`
    }
  ]
};

// Chapitre 6: Fonctions de référence
const chapter6: ChapterContent = {
  chapterId: "ch6-fonctions-reference",
  chapterTitle: "Fonctions carré et inverse",
  quizzes: [
    {
      id: "ch6-q1",
      question: "La fonction carré f(x) = xÂ² est :",
      options: [
        "Croissante sur â„",
        "Décroissante sur â„",
        "Décroissante sur ]-âˆž; 0] et croissante sur [0; +âˆž[",
        "Croissante sur ]-âˆž; 0]"
      ],
      correctAnswer: "Décroissante sur ]-âˆž; 0] et croissante sur [0; +âˆž[",
      explanation: "La fonction carré admet un minimum en 0"
    },
    {
      id: "ch6-q2",
      question: "La courbe de f(x) = xÂ² est :",
      options: ["Une droite", "Une parabole", "Une hyperbole", "Un cercle"],
      correctAnswer: "Une parabole",
      explanation: "La fonction carré a pour représentation graphique une parabole"
    },
    {
      id: "ch6-q3",
      question: "Si x < y < 0, alors :",
      options: ["xÂ² < yÂ²", "xÂ² > yÂ²", "xÂ² = yÂ²", "On ne peut pas comparer"],
      correctAnswer: "xÂ² > yÂ²",
      explanation: "Sur ]-âˆž; 0], la fonction carré est décroissante, donc l'ordre est inversé"
    },
    {
      id: "ch6-q4",
      question: "Le domaine de définition de f(x) = 1/x est :",
      options: ["â„", "â„ \\ {0}", "â„âº*", "â„â»*"],
      correctAnswer: "â„ \\ {0}",
      explanation: "On ne peut pas diviser par 0"
    },
    {
      id: "ch6-q5",
      question: "La fonction inverse f(x) = 1/x est :",
      options: [
        "Croissante sur â„*",
        "Décroissante sur â„*",
        "Croissante sur â„âº* et décroissante sur â„â»*",
        "Décroissante sur â„âº* et sur â„â»*"
      ],
      correctAnswer: "Décroissante sur â„âº* et sur â„â»*",
      explanation: "La fonction inverse est décroissante sur chaque intervalle où elle est définie"
    },
    {
      id: "ch6-q6",
      question: "Comparer 1/3 et 1/5 :",
      options: ["1/3 < 1/5", "1/3 > 1/5", "1/3 = 1/5", "Impossible Ã  comparer"],
      correctAnswer: "1/3 > 1/5",
      explanation: "Pour x > 0, si a < b alors 1/a > 1/b. Ici 3 < 5 donc 1/3 > 1/5"
    },
    {
      id: "ch6-q7",
      question: "L'image de [-2; 3] par la fonction carré est :",
      options: ["[4; 9]", "[0; 9]", "[-4; 9]", "[0; 4]"],
      correctAnswer: "[0; 9]",
      explanation: "Le minimum est 0 (en x=0) et le maximum est 9 (en x=3)"
    },
    {
      id: "ch6-q8",
      question: "Résoudre xÂ² = 16 :",
      options: ["x = 4", "x = -4", "x = 4 ou x = -4", "x = 8"],
      correctAnswer: "x = 4 ou x = -4",
      explanation: "xÂ² = 16 âŸº x = 4 ou x = -4"
    },
    {
      id: "ch6-q9",
      question: "Laquelle de ces égalités est vraie ?",
      options: ["(-3)Â² = -9", "âˆš9 = Â±3", "(-5)Â² = 25", "3Â² = 6"],
      correctAnswer: "(-5)Â² = 25",
      explanation: "(-5)Â² = (-5) Ã— (-5) = 25"
    },
    {
      id: "ch6-q10",
      question: "La fonction f(x) = 1/x est symétrique par rapport Ã  :",
      options: ["L'axe des x", "L'axe des y", "L'origine", "Aucune symétrie"],
      correctAnswer: "L'origine",
      explanation: "f(-x) = -f(x), donc f est impaire : symétrie par rapport Ã  l'origine"
    }
  ],
  exercises: [
    {
      id: "ch6-ex1",
      title: "Comparaison avec la fonction carré",
      statement: "Comparer (-3)Â² et (-5)Â². Quel est le plus grand ?",
      expectedAnswer: "25",
      acceptedAnswers: ["25", "(-5)Â²", "-5"],
      solution: `(-3)Â² = 9
(-5)Â² = 25

Comme 25 > 9, **(-5)Â² = 25** est le plus grand.

(Sur â„â», la fonction carré est décroissante : -5 < -3 donc (-5)Â² > (-3)Â²)`
    },
    {
      id: "ch6-ex2",
      title: "Résolution d'équation avec carré",
      statement: "Résoudre xÂ² = 49. Donner la somme des solutions.",
      expectedAnswer: "0",
      acceptedAnswers: ["0"],
      solution: `xÂ² = 49
x = 7 ou x = -7

Somme des solutions : 7 + (-7) = **0**`
    },
    {
      id: "ch6-ex3",
      title: "Inéquation avec carré",
      statement: "Résoudre xÂ² < 9. Donner l'intervalle solution.",
      expectedAnswer: "]-3; 3[",
      acceptedAnswers: ["]-3; 3[", "]-3;3[", "(-3; 3)"],
      solution: `xÂ² < 9
|x| < 3
-3 < x < 3

**S = ]-3; 3[**`
    },
    {
      id: "ch6-ex4",
      title: "Image d'un intervalle",
      statement: "Déterminer l'image de l'intervalle [-3; 2] par f(x) = xÂ². Donner le maximum.",
      expectedAnswer: "9",
      acceptedAnswers: ["9", "[0; 9]"],
      solution: `Sur [-3; 2] :
- En x = 0 : f(0) = 0 (minimum)
- En x = -3 : f(-3) = 9
- En x = 2 : f(2) = 4

L'image est [0; 9], maximum = **9**`
    },
    {
      id: "ch6-ex5",
      title: "Fonction inverse - calcul",
      statement: "Calculer l'image de 4 par la fonction inverse puis l'image de 1/4.",
      expectedAnswer: "4",
      acceptedAnswers: ["4"],
      solution: `f(x) = 1/x
f(4) = 1/4
f(1/4) = 1/(1/4) = **4**

(La fonction inverse est sa propre réciproque)`
    },
    {
      id: "ch6-ex6",
      title: "Comparaison avec la fonction inverse",
      statement: "Comparer 1/0.25 et 1/0.5. Quel est le plus grand ?",
      expectedAnswer: "4",
      acceptedAnswers: ["4", "1/0.25"],
      solution: `1/0.25 = 4
1/0.5 = 2

**4 > 2**

(0.25 < 0.5 donc leurs inverses sont dans l'ordre contraire)`
    },
    {
      id: "ch6-ex7",
      title: "Résolution avec fonction inverse",
      statement: "Résoudre 1/x = 3. Donner x sous forme de fraction.",
      expectedAnswer: "1/3",
      acceptedAnswers: ["1/3", "0,333", "0.333"],
      solution: `1/x = 3
x = 1/3

**x = 1/3**`
    },
    {
      id: "ch6-ex8",
      title: "Tableau de variations",
      statement: "La fonction f(x) = xÂ² - 4 atteint son minimum pour quelle valeur de x ?",
      expectedAnswer: "0",
      acceptedAnswers: ["0", "x = 0"],
      solution: `f(x) = xÂ² - 4

Le minimum de xÂ² est atteint en x = 0.
Donc le minimum de xÂ² - 4 est aussi en **x = 0**.

Valeur minimale : f(0) = -4`
    },
    {
      id: "ch6-ex9",
      title: "Équation avec inverse",
      statement: "Résoudre 2/x + 3 = 7. Donner x sous forme de fraction.",
      expectedAnswer: "1/2",
      acceptedAnswers: ["1/2", "0.5", "0,5"],
      solution: `2/x + 3 = 7
2/x = 4
x = 2/4 = **1/2**`
    },
    {
      id: "ch6-ex10",
      title: "Problème contextualisé",
      statement: "La durée d'un trajet est proportionnelle Ã  1/v où v est la vitesse. Si Ã  60 km/h le trajet dure 2h, combien dure-t-il Ã  80 km/h ? (en heures, format décimal)",
      expectedAnswer: "1,5",
      acceptedAnswers: ["1,5", "1.5", "3/2"],
      solution: `t = k/v
À 60 km/h : 2 = k/60 âŸ¹ k = 120

À 80 km/h : t = 120/80 = **1,5 h**`
    }
  ]
};

// Chapitre 7: Vecteurs du plan
const chapter7: ChapterContent = {
  chapterId: "ch7-vecteurs",
  chapterTitle: "Vecteurs du plan",
  quizzes: [
    {
      id: "ch7-q1",
      question: "Les coordonnées du vecteur AB avec A(1, 2) et B(4, 6) sont :",
      options: ["(3, 4)", "(5, 8)", "(4, 6)", "(1, 2)"],
      correctAnswer: "(3, 4)",
      explanation: "AB = (x_B - x_A ; y_B - y_A) = (4-1 ; 6-2) = (3, 4)"
    },
    {
      id: "ch7-q2",
      question: "Deux vecteurs sont égaux si et seulement si :",
      options: [
        "Ils ont la même norme",
        "Ils ont la même direction",
        "Ils ont mêmes coordonnées",
        "Ils ont le même point d'origine"
      ],
      correctAnswer: "Ils ont mêmes coordonnées",
      explanation: "L'égalité de vecteurs se traduit par l'égalité des coordonnées"
    },
    {
      id: "ch7-q3",
      question: "La norme du vecteur u(3, 4) est :",
      options: ["7", "5", "12", "25"],
      correctAnswer: "5",
      explanation: "||u|| = âˆš(3Â² + 4Â²) = âˆš(9 + 16) = âˆš25 = 5"
    },
    {
      id: "ch7-q4",
      question: "Si u(2, 3) et v(4, 6), alors :",
      options: ["u = v", "u = 2v", "v = 2u", "u et v ne sont pas colinéaires"],
      correctAnswer: "v = 2u",
      explanation: "v = (4, 6) = 2Ã—(2, 3) = 2u"
    },
    {
      id: "ch7-q5",
      question: "Le milieu de [AB] avec A(2, 4) et B(6, 8) a pour coordonnées :",
      options: ["(4, 6)", "(8, 12)", "(3, 5)", "(2, 2)"],
      correctAnswer: "(4, 6)",
      explanation: "M = ((x_A + x_B)/2 ; (y_A + y_B)/2) = (4, 6)"
    },
    {
      id: "ch7-q6",
      question: "u + v avec u(2, -1) et v(3, 4) égale :",
      options: ["(5, 3)", "(-1, -5)", "(6, -4)", "(5, -3)"],
      correctAnswer: "(5, 3)",
      explanation: "u + v = (2+3, -1+4) = (5, 3)"
    },
    {
      id: "ch7-q7",
      question: "Si ABCD est un parallélogramme, alors :",
      options: ["AB = CD", "AB = DC", "AC = BD", "AB = -DC"],
      correctAnswer: "AB = DC",
      explanation: "Dans un parallélogramme, AB = DC (vecteurs égaux)"
    },
    {
      id: "ch7-q8",
      question: "Le vecteur -3u avec u(2, -1) vaut :",
      options: ["(-6, 3)", "(-6, -3)", "(6, -3)", "(-5, 2)"],
      correctAnswer: "(-6, 3)",
      explanation: "-3u = -3Ã—(2, -1) = (-6, 3)"
    },
    {
      id: "ch7-q9",
      question: "Deux vecteurs sont colinéaires si :",
      options: [
        "Ils ont même norme",
        "L'un est multiple de l'autre",
        "Ils sont perpendiculaires",
        "Ils ont même direction mais sens opposé"
      ],
      correctAnswer: "L'un est multiple de l'autre",
      explanation: "u et v colinéaires âŸº âˆƒk : v = ku (ou u = 0 ou v = 0)"
    },
    {
      id: "ch7-q10",
      question: "Si u(a, b) et v(c, d) sont colinéaires, alors :",
      options: ["a + d = b + c", "ad = bc", "ac = bd", "ad - bc â‰  0"],
      correctAnswer: "ad = bc",
      explanation: "Colinéarité : ad - bc = 0 âŸº ad = bc"
    }
  ],
  exercises: [
    {
      id: "ch7-ex1",
      title: "Coordonnées d'un vecteur",
      statement: "Calculer les coordonnées du vecteur AB avec A(3, -2) et B(-1, 5). Format : (x, y)",
      expectedAnswer: "(-4, 7)",
      acceptedAnswers: ["(-4, 7)", "(-4;7)", "-4, 7"],
      solution: `AB = (x_B - x_A ; y_B - y_A)
= (-1 - 3 ; 5 - (-2))
= **(-4, 7)**`
    },
    {
      id: "ch7-ex2",
      title: "Norme d'un vecteur",
      statement: "Calculer la norme du vecteur u(5, -12).",
      expectedAnswer: "13",
      acceptedAnswers: ["13"],
      solution: `||u|| = âˆš(5Â² + (-12)Â²)
= âˆš(25 + 144)
= âˆš169
= **13**`
    },
    {
      id: "ch7-ex3",
      title: "Somme de vecteurs",
      statement: "Calculer u + v avec u(4, -3) et v(-2, 7). Donner l'ordonnée du résultat.",
      expectedAnswer: "4",
      acceptedAnswers: ["4", "(2, 4)"],
      solution: `u + v = (4 + (-2), -3 + 7)
= (2, **4**)`
    },
    {
      id: "ch7-ex4",
      title: "Multiplication par un scalaire",
      statement: "Calculer 3u - 2v avec u(2, 1) et v(1, 3). Donner l'abscisse du résultat.",
      expectedAnswer: "4",
      acceptedAnswers: ["4", "(4, -3)"],
      solution: `3u = (6, 3)
2v = (2, 6)
3u - 2v = (6-2, 3-6) = (**4**, -3)`
    },
    {
      id: "ch7-ex5",
      title: "Coordonnées du milieu",
      statement: "Trouver les coordonnées du milieu M de [AB] avec A(-3, 4) et B(5, -2). Format : (x, y)",
      expectedAnswer: "(1, 1)",
      acceptedAnswers: ["(1, 1)", "(1;1)", "1, 1"],
      solution: `M = ((x_A + x_B)/2 ; (y_A + y_B)/2)
= ((-3 + 5)/2 ; (4 + (-2))/2)
= (2/2 ; 2/2)
= **(1, 1)**`
    },
    {
      id: "ch7-ex6",
      title: "Vérification de colinéarité",
      statement: "Les vecteurs u(6, -9) et v(-4, 6) sont-ils colinéaires ? Répondre par oui ou non.",
      expectedAnswer: "oui",
      acceptedAnswers: ["oui", "Oui", "OUI"],
      solution: `Test de colinéarité : ad - bc = 0 ?
6 Ã— 6 - (-9) Ã— (-4) = 36 - 36 = 0

**Oui**, les vecteurs sont colinéaires.
(On vérifie : v = -2/3 Ã— u)`
    },
    {
      id: "ch7-ex7",
      title: "Parallélogramme",
      statement: "ABCD est un parallélogramme avec A(1, 2), B(4, 3), C(6, 7). Trouver l'abscisse de D.",
      expectedAnswer: "3",
      acceptedAnswers: ["3", "x = 3"],
      solution: `Dans un parallélogramme : AB = DC
AB = (3, 1)
D + DC = C
D = C - AB = (6-3, 7-1) = (**3**, 6)`
    },
    {
      id: "ch7-ex8",
      title: "Vecteur et translation",
      statement: "L'image de A(2, -1) par la translation de vecteur u(3, 5) est A'. Donner l'ordonnée de A'.",
      expectedAnswer: "4",
      acceptedAnswers: ["4", "(5, 4)"],
      solution: `A' = A + u
A' = (2+3, -1+5) = (5, **4**)`
    },
    {
      id: "ch7-ex9",
      title: "Vecteur unitaire",
      statement: "Le vecteur u(3, 4) a pour norme 5. Quelles sont les coordonnées du vecteur unitaire de même direction ? Donner l'abscisse.",
      expectedAnswer: "0,6",
      acceptedAnswers: ["0,6", "0.6", "3/5"],
      solution: `Vecteur unitaire = u / ||u||
= (3/5, 4/5)
= (**0,6** ; 0,8)`
    },
    {
      id: "ch7-ex10",
      title: "Relation de Chasles",
      statement: "Simplifier AB + BC + CD. Exprimer le résultat en 2 lettres.",
      expectedAnswer: "AD",
      acceptedAnswers: ["AD"],
      solution: `Par la relation de Chasles :
AB + BC = AC
AC + CD = AD

Donc AB + BC + CD = **AD**`
    }
  ]
};

// Chapitre 8: Statistiques et Probabilités
const chapter8: ChapterContent = {
  chapterId: "ch8-stats-probas",
  chapterTitle: "Statistiques et Probabilités",
  quizzes: [
    {
      id: "ch8-q1",
      question: "La moyenne de 4, 6, 8, 10, 12 est :",
      options: ["6", "8", "10", "40"],
      correctAnswer: "8",
      explanation: "(4+6+8+10+12)/5 = 40/5 = 8"
    },
    {
      id: "ch8-q2",
      question: "La médiane de 3, 7, 2, 9, 5 est :",
      options: ["5", "7", "5.2", "2"],
      correctAnswer: "5",
      explanation: "Ordonnés : 2, 3, 5, 7, 9. La médiane (valeur centrale) est 5"
    },
    {
      id: "ch8-q3",
      question: "On lance un dé équilibré. P(obtenir 6) = :",
      options: ["1/2", "1/3", "1/6", "6"],
      correctAnswer: "1/6",
      explanation: "1 issue favorable sur 6 possibles"
    },
    {
      id: "ch8-q4",
      question: "La probabilité d'un événement impossible est :",
      options: ["0", "1", "-1", "Impossible Ã  calculer"],
      correctAnswer: "0",
      explanation: "Un événement impossible a une probabilité nulle"
    },
    {
      id: "ch8-q5",
      question: "Si P(A) = 0.3, alors P(non A) = :",
      options: ["0.3", "0.7", "-0.3", "1.3"],
      correctAnswer: "0.7",
      explanation: "P(A) + P(non A) = 1, donc P(non A) = 1 - 0.3 = 0.7"
    },
    {
      id: "ch8-q6",
      question: "L'étendue de la série 4, 7, 2, 9, 5 est :",
      options: ["7", "9", "2", "5"],
      correctAnswer: "7",
      explanation: "Étendue = max - min = 9 - 2 = 7"
    },
    {
      id: "ch8-q7",
      question: "Dans une classe de 30 élèves, 18 sont des filles. La fréquence des filles est :",
      options: ["18%", "60%", "40%", "30%"],
      correctAnswer: "60%",
      explanation: "Fréquence = 18/30 = 0.6 = 60%"
    },
    {
      id: "ch8-q8",
      question: "On tire une carte d'un jeu de 52 cartes. P(cÅ“ur) = :",
      options: ["1/52", "1/13", "1/4", "13/52"],
      correctAnswer: "1/4",
      explanation: "13 cÅ“urs sur 52 cartes : 13/52 = 1/4"
    },
    {
      id: "ch8-q9",
      question: "Le premier quartile Q1 est la valeur telle que :",
      options: [
        "25% des données sont inférieures Ã  Q1",
        "50% des données sont inférieures Ã  Q1",
        "75% des données sont inférieures Ã  Q1",
        "Q1 est toujours égal Ã  la médiane"
      ],
      correctAnswer: "25% des données sont inférieures Ã  Q1",
      explanation: "Q1 sépare les 25% inférieurs des 75% supérieurs"
    },
    {
      id: "ch8-q10",
      question: "Si deux événements A et B sont incompatibles, alors :",
      options: ["P(A âˆª B) = P(A) + P(B)", "P(A âˆ© B) = P(A) Ã— P(B)", "P(A) = P(B)", "P(A âˆª B) = 0"],
      correctAnswer: "P(A âˆª B) = P(A) + P(B)",
      explanation: "Événements incompatibles : P(A âˆ© B) = 0, donc P(A âˆª B) = P(A) + P(B)"
    }
  ],
  exercises: [
    {
      id: "ch8-ex1",
      title: "Calcul de moyenne",
      statement: "Calculer la moyenne des notes : 12, 14, 8, 16, 10, 15, 11.",
      expectedAnswer: "12,29",
      acceptedAnswers: ["12,29", "12.29", "86/7", "12,3"],
      solution: `Moyenne = (12+14+8+16+10+15+11)/7
= 86/7
â‰ˆ **12,29**`
    },
    {
      id: "ch8-ex2",
      title: "Calcul de médiane",
      statement: "Trouver la médiane de : 15, 8, 22, 17, 11, 25, 19, 13.",
      expectedAnswer: "16",
      acceptedAnswers: ["16"],
      solution: `Ordonnées : 8, 11, 13, 15, 17, 19, 22, 25
8 valeurs (pair) : médiane = moyenne des 4ème et 5ème
Médiane = (15 + 17)/2 = **16**`
    },
    {
      id: "ch8-ex3",
      title: "Étendue et quartiles",
      statement: "Calculer l'étendue de : 45, 52, 38, 67, 41, 55. Donner la valeur.",
      expectedAnswer: "29",
      acceptedAnswers: ["29"],
      solution: `Étendue = max - min = 67 - 38 = **29**`
    },
    {
      id: "ch8-ex4",
      title: "Fréquences",
      statement: "Sur 80 personnes interrogées, 28 préfèrent le chocolat. Quelle est cette fréquence en pourcentage ?",
      expectedAnswer: "35",
      acceptedAnswers: ["35", "35%", "0,35"],
      solution: `Fréquence = 28/80 = 0,35 = **35%**`
    },
    {
      id: "ch8-ex5",
      title: "Probabilité simple",
      statement: "Une urne contient 5 boules rouges, 3 bleues et 2 vertes. Quelle est P(rouge) ? Format : fraction.",
      expectedAnswer: "1/2",
      acceptedAnswers: ["1/2", "5/10", "0,5", "0.5"],
      solution: `Total = 5 + 3 + 2 = 10 boules
P(rouge) = 5/10 = **1/2**`
    },
    {
      id: "ch8-ex6",
      title: "Probabilité de l'événement contraire",
      statement: "La probabilité de gagner Ã  un jeu est 0,15. Quelle est la probabilité de perdre ?",
      expectedAnswer: "0,85",
      acceptedAnswers: ["0,85", "0.85", "85%", "17/20"],
      solution: `P(perdre) = 1 - P(gagner)
= 1 - 0,15
= **0,85**`
    },
    {
      id: "ch8-ex7",
      title: "Événements incompatibles",
      statement: "On lance un dé. A : 'obtenir un nombre pair'. B : 'obtenir 1 ou 3'. Calculer P(A âˆª B).",
      expectedAnswer: "5/6",
      acceptedAnswers: ["5/6", "0,833"],
      solution: `A = {2, 4, 6} â†’ P(A) = 3/6 = 1/2
B = {1, 3} â†’ P(B) = 2/6 = 1/3
A et B sont incompatibles (pas d'élément commun)

P(A âˆª B) = P(A) + P(B) = 1/2 + 1/3 = 3/6 + 2/6 = **5/6**`
    },
    {
      id: "ch8-ex8",
      title: "Moyenne pondérée",
      statement: "Un élève a 12 de moyenne (coef 3), 15 en maths (coef 4) et 10 en sport (coef 2). Sa moyenne générale ?",
      expectedAnswer: "12,89",
      acceptedAnswers: ["12,89", "12.89", "116/9", "12,9"],
      solution: `Moyenne = (12Ã—3 + 15Ã—4 + 10Ã—2) / (3+4+2)
= (36 + 60 + 20) / 9
= 116/9
â‰ˆ **12,89**`
    },
    {
      id: "ch8-ex9",
      title: "Tirage de cartes",
      statement: "On tire une carte d'un jeu de 52. Quelle est P(roi ou dame) ? Format : fraction irréductible.",
      expectedAnswer: "2/13",
      acceptedAnswers: ["2/13", "8/52"],
      solution: `4 rois + 4 dames = 8 figures concernées
P(roi ou dame) = 8/52 = **2/13**`
    },
    {
      id: "ch8-ex10",
      title: "Simulation",
      statement: "On simule 200 lancers de pièce et on obtient 112 fois pile. Quelle est la fréquence de pile ? (format décimal)",
      expectedAnswer: "0,56",
      acceptedAnswers: ["0,56", "0.56", "56%", "112/200"],
      solution: `Fréquence de pile = 112/200 = **0,56** = 56%

(La fréquence théorique est 0,5. L'écart s'explique par la fluctuation d'échantillonnage)`
    }
  ]
};

// Export de tous les chapitres
export const mathSecondeChapters: ChapterContent[] = [
  chapter1,
  chapter2,
  chapter3,
  chapter4,
  chapter5,
  chapter6,
  chapter7,
  chapter8
];

// Fonction pour obtenir le contenu d'un chapitre par son index (0-based)
export const getChapterContent = (index: number): ChapterContent | null => {
  if (index >= 0 && index < mathSecondeChapters.length) {
    return mathSecondeChapters[index];
  }
  return null;
};

// Fonction pour obtenir le contenu par titre de chapitre (recherche flexible)
export const getChapterContentByTitle = (title: string): ChapterContent | null => {
  const normalizedTitle = title.toLowerCase();
  return mathSecondeChapters.find(ch => 
    ch.chapterTitle.toLowerCase().includes(normalizedTitle) ||
    normalizedTitle.includes(ch.chapterTitle.toLowerCase())
  ) || mathSecondeChapters[0]; // Retourne le premier chapitre par défaut
};
