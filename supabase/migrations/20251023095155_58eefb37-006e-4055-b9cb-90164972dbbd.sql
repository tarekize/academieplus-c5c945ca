-- Chapitres exemples pour Math, Physique, SVT, Anglais, Histoire avec UUIDs auto-générés

-- Math 6ème - Nombres et Calculs
INSERT INTO course_chapters (course_id, title, content, order_index, theme) VALUES
('a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c1', 'Les nombres entiers', '# Les nombres entiers

Les nombres entiers naturels sont : 0, 1, 2, 3, 4...

## Écriture et lecture
- 4 567 se lit "quatre mille cinq cent soixante-sept"
- 1 000 000 se lit "un million"

## Comparaison
Pour comparer : celui qui a le plus de chiffres est le plus grand.', 1, 'Numération'),

('a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c1', 'Addition et soustraction', '# Addition et soustraction

## L''addition réunit des quantités
## La soustraction retire une quantité

**Astuce** : On commence toujours par les unités, puis dizaines, puis centaines...', 2, 'Numération'),

-- Math 5ème - Calcul littéral  
('a2b3c4d5-e6f7-48a9-b0c1-d2e3f4a5b6c1', 'Introduction aux expressions', '# Les expressions algébriques

Une expression algébrique contient des **lettres** (variables) et des **nombres**.

## Exemples
- 3x + 5
- 2a - 7b
- 4(x + 2)

La lettre représente un nombre qu''on ne connaît pas encore.', 1, 'Algèbre'),

('a2b3c4d5-e6f7-48a9-b0c1-d2e3f4a5b6c1', 'Simplifier une expression', '# Simplifier une expression

## Supprimer les parenthèses
- a + (b + c) = a + b + c
- a - (b - c) = a - b + c

## Réduire les termes semblables
- 3x + 5x = 8x
- 7a - 2a = 5a', 2, 'Algèbre'),

-- Physique 5ème - Circuits électriques
('b2c3d4e5-f6a7-48b9-c0d1-e2f3a4b5c6d1', 'Qu''est-ce qu''un circuit électrique ?', '# Le circuit électrique

Un circuit électrique est un ensemble de composants reliés par des fils conducteurs.

## Les composants essentiels
- **Générateur** : pile, batterie (fournit l''énergie)
- **Récepteur** : lampe, moteur (utilise l''énergie)
- **Interrupteur** : permet d''ouvrir ou fermer le circuit
- **Fils de connexion** : relient les composants

## Circuit fermé vs circuit ouvert
- **Fermé** : le courant circule, la lampe brille
- **Ouvert** : le courant ne circule pas, la lampe est éteinte', 1, 'Électricité'),

('b2c3d4e5-f6a7-48b9-c0d1-e2f3a4b5c6d1', 'Le sens du courant', '# Le sens du courant électrique

## Convention
Le courant électrique circule de la **borne + vers la borne -** du générateur (à l''extérieur).

## Schématisation
On représente le sens du courant par une flèche sur le schéma.

## Conducteurs et isolants
- **Conducteurs** : métaux, graphite (laissent passer le courant)
- **Isolants** : plastique, bois, verre (ne laissent pas passer)', 2, 'Électricité'),

-- SVT 6ème - Le vivant
('d4e5f6a7-b8c9-40d1-e2f3-a4b5c6d7e8f1', 'Classification des êtres vivants', '# La classification des êtres vivants

Les êtres vivants sont classés en grands groupes selon leurs caractères communs.

## Les 5 règnes
1. **Animaux** : se déplacent, se nourrissent
2. **Végétaux** : produisent leur propre nourriture (photosynthèse)
3. **Champignons** : ni plante ni animal
4. **Protistes** : organismes unicellulaires
5. **Bactéries** : très petits organismes

## Vertébrés et invertébrés
- **Vertébrés** : possèdent une colonne vertébrale (poissons, oiseaux, mammifères...)
- **Invertébrés** : n''ont pas de colonne vertébrale (insectes, mollusques...)', 1, 'Biologie'),

('d4e5f6a7-b8c9-40d1-e2f3-a4b5c6d7e8f1', 'Les milieux de vie', '# Les milieux de vie

Un milieu de vie est l''endroit où vit un être vivant.

## Milieux aquatiques
- **Mer** : eau salée
- **Rivière** : eau douce en mouvement
- **Lac** : eau douce calme

## Milieux terrestres
- **Forêt** : nombreux arbres
- **Prairie** : herbes, peu d''arbres
- **Désert** : très sec

## Adaptation
Les êtres vivants sont **adaptés** à leur milieu de vie (ex: poisson a des branchies pour respirer dans l''eau).', 2, 'Biologie'),

-- Anglais 6ème - Grammar Basics
('e5f6a7b8-c9d0-41e2-f3a4-b5c6d7e8f9a1', 'Personal Pronouns', '# Personal Pronouns

Personal pronouns replace nouns (people or things).

## Subject Pronouns
- **I** - me/je
- **You** - tu/vous
- **He** - il (masculin)
- **She** - elle (féminin)
- **It** - il/elle (objet)
- **We** - nous
- **They** - ils/elles

## Examples
- I am a student
- She is my friend
- They are happy', 1, 'Grammar'),

('e5f6a7b8-c9d0-41e2-f3a4-b5c6d7e8f9a1', 'The verb "to be"', '# The verb "to be" (être)

## Conjugation in present
- I **am**
- You **are**
- He/She/It **is**
- We **are**
- They **are**

## Examples
- I am 12 years old
- You are my best friend
- He is a teacher
- We are students', 2, 'Grammar'),

-- Histoire 6ème - L''Orient ancien
('f6a7b8c9-d0e1-42f3-a4b5-c6d7e8f9a0b1', 'La Mésopotamie', '# La Mésopotamie : le berceau de l''écriture

La Mésopotamie (actuel Irak) signifie "entre deux fleuves" : le Tigre et l''Euphrate.

## Premières civilisations
- **Sumériens** (vers -3500)
- **Babyloniens** (vers -1800)
- **Assyriens** (vers -1300)

## L''invention de l''écriture
- Vers **-3300** : invention de l''**écriture cunéiforme**
- Tracée sur des tablettes d''argile
- D''abord pour compter, puis pour écrire des histoires

## Les cités-États
Chaque ville était un petit État indépendant avec :
- Un roi
- Un temple (ziggourat)
- Des murailles', 1, 'Antiquité'),

('f6a7b8c9-d0e1-42f3-a4b5-c6d7e8f9a0b1', 'L''Égypte antique', '# L''Égypte des pharaons

L''Égypte antique s''est développée le long du **Nil**, fleuve vital pour l''agriculture.

## Le pharaon
- **Roi-dieu** : à la fois chef politique et religieux
- Porte la couronne et le sceptre
- Exemples célèbres : Ramsès II, Toutânkhamon

## Les pyramides
- **Tombeaux** des pharaons
- Pyramide de Khéops : 146 mètres de haut !
- Construites par des milliers d''ouvriers

## L''écriture hiéroglyphique
- Écriture sacrée composée de dessins
- Déchiffrée en 1822 par Champollion
- Utilisée pour les textes religieux', 2, 'Antiquité');