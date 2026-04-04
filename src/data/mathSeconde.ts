// Programme de Mathématiques - Classe de Seconde
// Basé sur le programme officiel

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  category: string;
}

export interface Exercise {
  id: string;
  title: string;
  category: string;
  statement: string;
  solution: string;
}

// 10 Questions de Quiz QCM
export const mathQuizQuestions: QuizQuestion[] = [
  {
    id: "q1",
    question: "Parmi les nombres suivants, lequel appartient à l'ensemble ℚ (rationnels) mais pas à ℤ (entiers) ?",
    options: ["√2", "3/4", "-5", "π"],
    correctAnswer: "3/4",
    explanation: "3/4 est un rationnel car c'est le quotient de deux entiers. √2 et π sont irrationnels, -5 est un entier.",
    category: "Ensembles de nombres"
  },
  {
    id: "q2",
    question: "Simplifier la fraction : 48/72",
    options: ["4/6", "2/3", "8/12", "16/24"],
    correctAnswer: "2/3",
    explanation: "PGCD(48, 72) = 24. Donc 48/72 = (48÷24)/(72÷24) = 2/3",
    category: "Calcul de fractions"
  },
  {
    id: "q3",
    question: "Développer et réduire : (2x + 3)(x - 1)",
    options: ["2x² + x - 3", "2x² - x - 3", "2x² + 5x - 3", "2x² - 5x + 3"],
    correctAnswer: "2x² + x - 3",
    explanation: "(2x + 3)(x - 1) = 2x·x + 2x·(-1) + 3·x + 3·(-1) = 2x² - 2x + 3x - 3 = 2x² + x - 3",
    category: "Développement/réduction"
  },
  {
    id: "q4",
    question: "Soit f(x) = 2x - 5. Quelle est l'image de 3 par f ?",
    options: ["1", "-1", "6", "11"],
    correctAnswer: "1",
    explanation: "f(3) = 2×3 - 5 = 6 - 5 = 1. L'image de 3 par f est 1.",
    category: "Images et antécédents"
  },
  {
    id: "q5",
    question: "Quelles sont les coordonnées du milieu du segment [AB] avec A(2, 4) et B(6, 8) ?",
    options: ["(4, 6)", "(8, 12)", "(3, 5)", "(2, 2)"],
    correctAnswer: "(4, 6)",
    explanation: "Le milieu M a pour coordonnées : xₘ = (xₐ + x_b)/2 = (2+6)/2 = 4 et yₘ = (yₐ + y_b)/2 = (4+8)/2 = 6",
    category: "Coordonnées de milieu"
  },
  {
    id: "q6",
    question: "Résoudre l'équation : 3x - 7 = 2x + 5",
    options: ["x = 12", "x = -2", "x = 2", "x = -12"],
    correctAnswer: "x = 12",
    explanation: "3x - 7 = 2x + 5 ⟹ 3x - 2x = 5 + 7 ⟹ x = 12",
    category: "Équations du premier degré"
  },
  {
    id: "q7",
    question: "La fonction carré f(x) = x² est :",
    options: [
      "Croissante sur ℝ",
      "Décroissante sur ℝ",
      "Décroissante sur ]-∞; 0] et croissante sur [0; +∞[",
      "Croissante sur ]-∞; 0] et décroissante sur [0; +∞["
    ],
    correctAnswer: "Décroissante sur ]-∞; 0] et croissante sur [0; +∞[",
    explanation: "La fonction carré admet un minimum en x = 0. Elle décroît avant et croît après.",
    category: "Fonctions"
  },
  {
    id: "q8",
    question: "Dans un repère, l'équation y = 2x + 3 représente :",
    options: [
      "Une parabole",
      "Une droite de coefficient directeur 3",
      "Une droite de coefficient directeur 2",
      "Un cercle"
    ],
    correctAnswer: "Une droite de coefficient directeur 2",
    explanation: "L'équation y = ax + b représente une droite. Ici a = 2 est le coefficient directeur.",
    category: "Équations de droites"
  },
  {
    id: "q9",
    question: "On lance un dé équilibré. Quelle est la probabilité d'obtenir un nombre pair ?",
    options: ["1/6", "1/3", "1/2", "2/3"],
    correctAnswer: "1/2",
    explanation: "Les nombres pairs sur un dé sont 2, 4, 6 (3 issues favorables sur 6 possibles). P = 3/6 = 1/2",
    category: "Probabilités"
  },
  {
    id: "q10",
    question: "Quel est l'intervalle solution de l'inéquation 2x - 4 ≥ 0 ?",
    options: ["]-∞; 2]", "[2; +∞[", "]-∞; 2[", "]2; +∞["],
    correctAnswer: "[2; +∞[",
    explanation: "2x - 4 ≥ 0 ⟹ 2x ≥ 4 ⟹ x ≥ 2. L'ensemble solution est [2; +∞[",
    category: "Inéquations"
  }
];

// 10 Exercices d'application
export const mathExercises: Exercise[] = [
  {
    id: "ex1",
    title: "Résolution d'équation du premier degré",
    category: "Équations",
    statement: "Résoudre l'équation suivante dans ℝ :\n\n**5(x - 2) - 3(2x + 1) = 4x - 17**",
    solution: `**Étape 1 : Développer**
5(x - 2) - 3(2x + 1) = 4x - 17
5x - 10 - 6x - 3 = 4x - 17

**Étape 2 : Réduire le membre de gauche**
-x - 13 = 4x - 17

**Étape 3 : Isoler x**
-x - 4x = -17 + 13
-5x = -4
x = -4 / -5 = **4/5** ou **0.8**

**Vérification :** 5(0.8 - 2) - 3(2×0.8 + 1) = 5(-1.2) - 3(2.6) = -6 - 7.8 = -13.8
4×0.8 - 17 = 3.2 - 17 = -13.8 ✓`
  },
  {
    id: "ex2",
    title: "Théorème de Pythagore",
    category: "Géométrie",
    statement: "Dans un triangle ABC rectangle en A, on donne AB = 6 cm et AC = 8 cm.\n\n1. Calculer BC.\n2. Calculer l'aire du triangle ABC.",
    solution: `**1. Calcul de BC (hypoténuse)**
D'après le théorème de Pythagore :
BC² = AB² + AC²
BC² = 6² + 8² = 36 + 64 = 100
BC = √100 = **10 cm**

**2. Aire du triangle rectangle**
L'aire d'un triangle rectangle est :
A = (base × hauteur) / 2
A = (AB × AC) / 2 = (6 × 8) / 2 = **24 cm²**`
  },
  {
    id: "ex3",
    title: "Théorème de Thalès",
    category: "Géométrie repérée",
    statement: "Les droites (MN) et (BC) sont parallèles. On donne :\n- AM = 4 cm, AB = 10 cm\n- AN = 3 cm\n\n1. Calculer AC.\n2. Calculer MN si BC = 7.5 cm.",
    solution: `**1. Calcul de AC**
D'après le théorème de Thalès :
AM/AB = AN/AC
4/10 = 3/AC
AC = (3 × 10) / 4 = **7.5 cm**

**2. Calcul de MN**
D'après le théorème de Thalès :
AM/AB = MN/BC
4/10 = MN/7.5
MN = (4 × 7.5) / 10 = **3 cm**`
  },
  {
    id: "ex4",
    title: "Calcul de fréquences cumulées",
    category: "Statistiques",
    statement: "Dans une classe de 25 élèves, on a relevé les notes obtenues à un contrôle :\n\n| Note | 8 | 10 | 12 | 14 | 16 |\n|------|---|----|----|----|----|----|\n| Effectif | 3 | 5 | 8 | 6 | 3 |\n\nCalculer :\n1. La moyenne de la série.\n2. Les fréquences et fréquences cumulées croissantes.",
    solution: `**1. Calcul de la moyenne**
Moyenne = Σ(note × effectif) / effectif total
= (8×3 + 10×5 + 12×8 + 14×6 + 16×3) / 25
= (24 + 50 + 96 + 84 + 48) / 25
= 302 / 25 = **12.08**

**2. Tableau des fréquences**

| Note | Effectif | Fréquence | Fréq. cum. croissante |
|------|----------|-----------|----------------------|
| 8 | 3 | 3/25 = 0.12 | 0.12 |
| 10 | 5 | 5/25 = 0.20 | 0.32 |
| 12 | 8 | 8/25 = 0.32 | 0.64 |
| 14 | 6 | 6/25 = 0.24 | 0.88 |
| 16 | 3 | 3/25 = 0.12 | 1.00 |`
  },
  {
    id: "ex5",
    title: "Étude d'une fonction affine",
    category: "Fonctions",
    statement: "Soit f la fonction définie sur ℝ par f(x) = -2x + 6.\n\n1. Calculer f(0), f(3) et f(-1).\n2. Déterminer l'antécédent de 0 par f.\n3. Dresser le tableau de variations de f.",
    solution: `**1. Images**
- f(0) = -2(0) + 6 = **6**
- f(3) = -2(3) + 6 = -6 + 6 = **0**
- f(-1) = -2(-1) + 6 = 2 + 6 = **8**

**2. Antécédent de 0**
On résout f(x) = 0
-2x + 6 = 0
-2x = -6
x = **3**

**3. Tableau de variations**
f est une fonction affine avec a = -2 < 0
Donc f est **décroissante** sur ℝ.

| x | -∞ ————————→ +∞ |
|---|------------------|
| f(x) | +∞ ↘ -∞ |`
  },
  {
    id: "ex6",
    title: "Algorithmique - Suite de Syracuse",
    category: "Algorithmique",
    statement: "On considère l'algorithme suivant écrit en Python :\n\n```python\nn = int(input(\"Entrer un entier n > 0 : \"))\nwhile n != 1:\n    if n % 2 == 0:\n        n = n // 2\n    else:\n        n = 3 * n + 1\n    print(n)\n```\n\nExécuter cet algorithme pour n = 6 et donner la suite des valeurs affichées.",
    solution: `**Exécution pour n = 6 :**

| Étape | n | n pair ? | Calcul | Nouveau n |
|-------|---|----------|--------|-----------|
| 1 | 6 | Oui | 6 // 2 | 3 |
| 2 | 3 | Non | 3×3 + 1 | 10 |
| 3 | 10 | Oui | 10 // 2 | 5 |
| 4 | 5 | Non | 3×5 + 1 | 16 |
| 5 | 16 | Oui | 16 // 2 | 8 |
| 6 | 8 | Oui | 8 // 2 | 4 |
| 7 | 4 | Oui | 4 // 2 | 2 |
| 8 | 2 | Oui | 2 // 2 | 1 |

**Suite affichée : 3, 10, 5, 16, 8, 4, 2, 1**

L'algorithme s'arrête car n = 1 (condition de sortie de la boucle).`
  },
  {
    id: "ex7",
    title: "Vecteurs et coordonnées",
    category: "Vecteurs",
    statement: "Dans un repère orthonormé, on donne A(1, 2), B(4, 6) et C(-2, 5).\n\n1. Calculer les coordonnées du vecteur AB.\n2. Calculer la norme ||AB||.\n3. D est tel que ABCD est un parallélogramme. Trouver les coordonnées de D.",
    solution: `**1. Coordonnées de AB**
AB = (x_B - x_A ; y_B - y_A) = (4 - 1 ; 6 - 2) = **(3 ; 4)**

**2. Norme de AB**
||AB|| = √(3² + 4²) = √(9 + 16) = √25 = **5**

**3. Coordonnées de D**
ABCD parallélogramme ⟹ AB = DC
Donc D est tel que : C + AB = D (non !)
En fait : AB = DC ⟹ D + DC = C ⟹ D = C - AB... Non.
Reprenons : DC = AB
⟹ (x_C - x_D ; y_C - y_D) = (3 ; 4)
⟹ x_C - x_D = 3 ⟹ x_D = -2 - 3 = -5
⟹ y_C - y_D = 4 ⟹ y_D = 5 - 4 = 1

**D(-5 ; 1)**`
  },
  {
    id: "ex8",
    title: "Probabilités - Expérience aléatoire",
    category: "Probabilités",
    statement: "Une urne contient 4 boules rouges, 3 boules bleues et 2 boules vertes. On tire une boule au hasard.\n\n1. Calculer la probabilité de tirer une boule rouge.\n2. Calculer la probabilité de tirer une boule qui n'est pas verte.\n3. Calculer la probabilité de tirer une boule rouge ou bleue.",
    solution: `**Univers :** 4 + 3 + 2 = 9 boules au total

**1. P(Rouge)**
P(R) = nombre de boules rouges / nombre total = **4/9**

**2. P(non verte)**
P(non verte) = 1 - P(verte) = 1 - 2/9 = **7/9**

Ou directement : P(non verte) = (4 + 3) / 9 = 7/9

**3. P(Rouge ou Bleue)**
P(R ∪ B) = P(R) + P(B) (événements incompatibles)
= 4/9 + 3/9 = **7/9**`
  },
  {
    id: "ex9",
    title: "Étude de la fonction carré",
    category: "Fonctions de référence",
    statement: "Soit f(x) = x².\n\n1. Compléter le tableau de valeurs pour x ∈ {-3, -2, -1, 0, 1, 2, 3}.\n2. Résoudre graphiquement f(x) = 4.\n3. Résoudre algébriquement f(x) = 9.",
    solution: `**1. Tableau de valeurs**

| x | -3 | -2 | -1 | 0 | 1 | 2 | 3 |
|---|----|----|----|----|---|---|---|
| f(x) | 9 | 4 | 1 | 0 | 1 | 4 | 9 |

**2. Résolution graphique de f(x) = 4**
On cherche les abscisses des points d'intersection de la parabole y = x² et de la droite horizontale y = 4.
D'après le tableau : **x = -2 ou x = 2**

**3. Résolution algébrique de f(x) = 9**
x² = 9
x² - 9 = 0
(x - 3)(x + 3) = 0
x = 3 ou x = -3

**S = {-3 ; 3}**`
  },
  {
    id: "ex10",
    title: "Trigonométrie - Cercle trigonométrique",
    category: "Trigonométrie",
    statement: "En utilisant le cercle trigonométrique :\n\n1. Donner les valeurs exactes de cos(π/3) et sin(π/3).\n2. Calculer cos²(π/3) + sin²(π/3).\n3. Résoudre l'équation cos(x) = 1/2 pour x ∈ [0 ; 2π].",
    solution: `**1. Valeurs remarquables**
Pour π/3 (60°) :
- **cos(π/3) = 1/2**
- **sin(π/3) = √3/2**

**2. Relation fondamentale**
cos²(π/3) + sin²(π/3) = (1/2)² + (√3/2)²
= 1/4 + 3/4
= **1**

(On retrouve la relation fondamentale cos²x + sin²x = 1)

**3. Résolution de cos(x) = 1/2 sur [0 ; 2π]**
cos(x) = 1/2 = cos(π/3)

Les solutions sont :
- x = π/3 (premier quadrant)
- x = 2π - π/3 = 5π/3 (quatrième quadrant)

**S = {π/3 ; 5π/3}**`
  }
];

// Structure du programme de Seconde
export const programmeSeconde = {
  title: "Mathématiques - Classe de Seconde",
  themes: [
    {
      name: "Nombres et calculs",
      topics: [
        "Ensembles de nombres (ℕ, ℤ, ℚ, ℝ)",
        "Intervalles de ℝ",
        "Calcul littéral (développer, factoriser, réduire)",
        "Équations et inéquations du premier degré"
      ]
    },
    {
      name: "Fonctions",
      topics: [
        "Notion de fonction",
        "Image et antécédent",
        "Courbe représentative",
        "Sens de variation",
        "Fonctions affines",
        "Fonctions carré et inverse"
      ]
    },
    {
      name: "Géométrie",
      topics: [
        "Vecteurs du plan",
        "Repérage dans le plan",
        "Équations de droites",
        "Géométrie dans l'espace",
        "Trigonométrie"
      ]
    },
    {
      name: "Statistiques et Probabilités",
      topics: [
        "Statistiques descriptives",
        "Indicateurs de position et de dispersion",
        "Probabilités",
        "Modélisation d'expériences aléatoires",
        "Fluctuation d'échantillonnage"
      ]
    }
  ]
};
