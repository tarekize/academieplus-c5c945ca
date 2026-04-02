-- Ajouter des chapitres pour le cours Mathématiques Seconde "Fonctions et Études"
INSERT INTO course_chapters (course_id, title, content, order_index, theme) VALUES
('a5b6c7d8-e9f0-41ac-b3c4-d5e6f7a8b9c1', 'Ensembles de nombres et intervalles', 
'<h2>Les ensembles de nombres</h2>
<p>En mathématiques, on distingue plusieurs ensembles de nombres :</p>
<ul>
<li><strong>ℕ (Entiers naturels)</strong> : 0, 1, 2, 3, ... Ce sont les nombres pour compter.</li>
<li><strong>ℤ (Entiers relatifs)</strong> : ..., -2, -1, 0, 1, 2, ... Les entiers naturels avec leurs opposés.</li>
<li><strong>ℚ (Nombres rationnels)</strong> : Tous les nombres qui peuvent s''écrire sous forme de fraction a/b avec a ∈ ℤ et b ∈ ℤ*.</li>
<li><strong>ℝ (Nombres réels)</strong> : Tous les nombres sur la droite numérique, incluant les irrationnels comme √2 ou π.</li>
</ul>

<h3>Intervalles de ℝ</h3>
<p>Un intervalle est un ensemble de nombres réels compris entre deux bornes.</p>
<blockquote>
<strong>Notation :</strong> [a ; b] signifie tous les réels x tels que a ≤ x ≤ b (bornes incluses).<br/>
]a ; b[ signifie tous les réels x tels que a &lt; x &lt; b (bornes exclues).
</blockquote>

<h3>Exemples</h3>
<ul>
<li>[2 ; 5] = {x ∈ ℝ | 2 ≤ x ≤ 5}</li>
<li>]-∞ ; 3[ = {x ∈ ℝ | x &lt; 3}</li>
<li>[0 ; +∞[ = {x ∈ ℝ | x ≥ 0}</li>
</ul>', 1, 'Nombres et calculs'),

('a5b6c7d8-e9f0-41ac-b3c4-d5e6f7a8b9c1', 'Calcul littéral et équations', 
'<h2>Développer et factoriser</h2>

<h3>Développer une expression</h3>
<p>Développer, c''est transformer un produit en somme en utilisant la distributivité :</p>
<blockquote>
k(a + b) = ka + kb<br/>
(a + b)(c + d) = ac + ad + bc + bd
</blockquote>

<h3>Identités remarquables</h3>
<ul>
<li>(a + b)² = a² + 2ab + b²</li>
<li>(a - b)² = a² - 2ab + b²</li>
<li>(a + b)(a - b) = a² - b²</li>
</ul>

<h3>Équations du premier degré</h3>
<p>Résoudre ax + b = 0 :</p>
<ol>
<li>Isoler le terme en x : ax = -b</li>
<li>Diviser par a (si a ≠ 0) : x = -b/a</li>
</ol>

<h3>Exemple</h3>
<p>Résoudre 3x - 7 = 2x + 5</p>
<blockquote>
3x - 2x = 5 + 7<br/>
x = 12
</blockquote>', 2, 'Nombres et calculs'),

('a5b6c7d8-e9f0-41ac-b3c4-d5e6f7a8b9c1', 'Notion de fonction', 
'<h2>Qu''est-ce qu''une fonction ?</h2>
<p>Une fonction f associe à chaque nombre x de son ensemble de définition un unique nombre noté f(x).</p>

<h3>Vocabulaire</h3>
<ul>
<li><strong>Image</strong> : f(x) est l''image de x par f</li>
<li><strong>Antécédent</strong> : x est un antécédent de y si f(x) = y</li>
<li><strong>Ensemble de définition</strong> : ensemble des valeurs de x pour lesquelles f(x) existe</li>
</ul>

<h3>Courbe représentative</h3>
<p>La courbe représentative de f est l''ensemble des points M(x ; f(x)) dans un repère.</p>

<blockquote>
<strong>Lecture graphique :</strong><br/>
• Pour trouver l''image de a : on trace la verticale x = a et on lit l''ordonnée du point d''intersection.<br/>
• Pour trouver les antécédents de b : on trace l''horizontale y = b et on lit les abscisses des points d''intersection.
</blockquote>', 3, 'Fonctions'),

('a5b6c7d8-e9f0-41ac-b3c4-d5e6f7a8b9c1', 'Fonctions de référence', 
'<h2>Les fonctions de référence</h2>

<h3>Fonction affine</h3>
<p>f(x) = ax + b où a est le coefficient directeur et b l''ordonnée à l''origine.</p>
<ul>
<li>Si a &gt; 0 : fonction croissante</li>
<li>Si a &lt; 0 : fonction décroissante</li>
<li>Si a = 0 : fonction constante</li>
</ul>

<h3>Fonction carré</h3>
<p>f(x) = x²</p>
<ul>
<li>Décroissante sur ]-∞ ; 0]</li>
<li>Croissante sur [0 ; +∞[</li>
<li>Minimum en x = 0</li>
</ul>

<h3>Fonction inverse</h3>
<p>f(x) = 1/x (définie sur ℝ*)</p>
<ul>
<li>Décroissante sur ]-∞ ; 0[</li>
<li>Décroissante sur ]0 ; +∞[</li>
</ul>

<blockquote>
<strong>Tableau de variations :</strong> Un tableau de variations résume le sens de variation d''une fonction sur chaque intervalle.
</blockquote>', 4, 'Fonctions'),

('a5b6c7d8-e9f0-41ac-b3c4-d5e6f7a8b9c1', 'Vecteurs et repérage', 
'<h2>Les vecteurs du plan</h2>

<h3>Définition</h3>
<p>Un vecteur est caractérisé par sa direction, son sens et sa norme (longueur).</p>

<h3>Coordonnées d''un vecteur</h3>
<p>Si A(xₐ ; yₐ) et B(x_b ; y_b), alors :</p>
<blockquote>
→AB = (x_b - xₐ ; y_b - yₐ)
</blockquote>

<h3>Opérations sur les vecteurs</h3>
<ul>
<li><strong>Addition</strong> : →u + →v = (xᵤ + xᵥ ; yᵤ + yᵥ)</li>
<li><strong>Multiplication</strong> : k→u = (kxᵤ ; kyᵤ)</li>
</ul>

<h3>Milieu d''un segment</h3>
<p>Le milieu M de [AB] a pour coordonnées :</p>
<blockquote>
xₘ = (xₐ + x_b)/2 et yₘ = (yₐ + y_b)/2
</blockquote>

<h3>Norme d''un vecteur</h3>
<p>||→AB|| = √((x_b - xₐ)² + (y_b - yₐ)²)</p>', 5, 'Géométrie'),

('a5b6c7d8-e9f0-41ac-b3c4-d5e6f7a8b9c1', 'Équations de droites', 
'<h2>Équation de droite</h2>

<h3>Forme cartésienne</h3>
<p>Toute droite du plan admet une équation de la forme :</p>
<blockquote>
ax + by + c = 0 (avec a et b non tous deux nuls)
</blockquote>

<h3>Forme réduite</h3>
<p>Pour une droite non verticale :</p>
<blockquote>
y = mx + p<br/>
où m est le coefficient directeur et p l''ordonnée à l''origine.
</blockquote>

<h3>Coefficient directeur</h3>
<p>Si A(xₐ ; yₐ) et B(x_b ; y_b) sont sur la droite :</p>
<blockquote>
m = (y_b - yₐ)/(x_b - xₐ)
</blockquote>

<h3>Droites parallèles et sécantes</h3>
<ul>
<li>Deux droites sont <strong>parallèles</strong> si elles ont le même coefficient directeur.</li>
<li>Deux droites sont <strong>sécantes</strong> si elles ont des coefficients directeurs différents.</li>
</ul>', 6, 'Géométrie'),

('a5b6c7d8-e9f0-41ac-b3c4-d5e6f7a8b9c1', 'Statistiques descriptives', 
'<h2>Analyse de données</h2>

<h3>Effectifs et fréquences</h3>
<ul>
<li><strong>Effectif</strong> : nombre d''individus ayant une certaine valeur</li>
<li><strong>Fréquence</strong> : effectif / effectif total</li>
<li><strong>Fréquence cumulée</strong> : somme des fréquences jusqu''à une valeur</li>
</ul>

<h3>Indicateurs de position</h3>
<ul>
<li><strong>Moyenne</strong> : x̄ = (Σ nᵢxᵢ) / N</li>
<li><strong>Médiane</strong> : valeur qui partage la série en deux parties égales</li>
</ul>

<h3>Indicateurs de dispersion</h3>
<ul>
<li><strong>Étendue</strong> : max - min</li>
<li><strong>Écart-type</strong> : mesure la dispersion autour de la moyenne</li>
</ul>

<blockquote>
<strong>Interprétation :</strong> Un écart-type faible signifie que les valeurs sont concentrées autour de la moyenne.
</blockquote>', 7, 'Statistiques'),

('a5b6c7d8-e9f0-41ac-b3c4-d5e6f7a8b9c1', 'Probabilités', 
'<h2>Introduction aux probabilités</h2>

<h3>Vocabulaire</h3>
<ul>
<li><strong>Expérience aléatoire</strong> : expérience dont on ne peut pas prévoir le résultat</li>
<li><strong>Univers Ω</strong> : ensemble de tous les résultats possibles</li>
<li><strong>Événement</strong> : sous-ensemble de l''univers</li>
</ul>

<h3>Probabilité d''un événement</h3>
<blockquote>
P(A) = nombre de cas favorables / nombre de cas possibles
</blockquote>
<p>Propriétés :</p>
<ul>
<li>0 ≤ P(A) ≤ 1</li>
<li>P(Ω) = 1 et P(∅) = 0</li>
<li>P(Ā) = 1 - P(A) (événement contraire)</li>
</ul>

<h3>Opérations sur les événements</h3>
<ul>
<li><strong>A ∪ B</strong> : A ou B (au moins un des deux)</li>
<li><strong>A ∩ B</strong> : A et B (les deux)</li>
</ul>

<blockquote>
<strong>Formule :</strong> P(A ∪ B) = P(A) + P(B) - P(A ∩ B)
</blockquote>', 8, 'Probabilités');