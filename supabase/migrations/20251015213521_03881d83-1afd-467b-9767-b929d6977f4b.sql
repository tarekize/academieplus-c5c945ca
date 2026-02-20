-- Supprimer les doublons en gardant un seul cours par niveau
DELETE FROM public.courses 
WHERE id IN (
  '2fa2ddc3-5527-4e01-9039-c1c3e551e179',
  '8f072959-c01a-44e2-a5bf-2c51a4ff0190',
  'dc85d85a-99ae-44f7-99d3-0e51337d29b7',
  'f9b7eaf9-24dd-4809-b834-72b2e381cfaf',
  'b1f4d8f5-91e1-4dc2-8b52-b8bc6b6d9ad3',
  '7c95af3c-7913-4927-a548-a88d9fbe0912',
  'ee7d4aa1-fe66-42b5-a284-2f3cd49e5670'
);

-- Ajouter les 4 chapitres pour tous les cours d'étude de la langue
-- Chapitre 1: Les accords
INSERT INTO public.course_chapters (course_id, title, content, order_index)
SELECT id, 'Les accords', 
'# Les accords en français

## L''accord du verbe avec le sujet

Le verbe s''accorde toujours avec son sujet en personne et en nombre.

**Exemples :**
- Le chat **mange** (3ème personne du singulier)
- Les chats **mangent** (3ème personne du pluriel)
- Tu **joues** (2ème personne du singulier)

## L''accord de l''adjectif qualificatif

L''adjectif qualificatif s''accorde en genre (masculin/féminin) et en nombre (singulier/pluriel) avec le nom qu''il qualifie.

**Exemples :**
- Un grand garçon → Une grande fille
- Des garçons grands → Des filles grandes', 
0
FROM public.courses 
WHERE subject_id = 'francais' AND title = 'Étude de la langue';

-- Chapitre 2: Le lexique
INSERT INTO public.course_chapters (course_id, title, content, order_index)
SELECT id, 'Le lexique',
'# Le lexique

## Les familles de mots

Une famille de mots regroupe tous les mots formés à partir d''un même radical.

**Exemple : la famille de "terre"**
- terrestre
- terrain
- terrasse
- enterrer
- déterrer
- atterrir

## Les préfixes et suffixes

### Les préfixes
Éléments placés avant le radical pour modifier le sens du mot.
- **in-/im-** : impossible, incroyable
- **dé-/des-** : défaire, désordre
- **re-** : refaire, recommencer',
1
FROM public.courses 
WHERE subject_id = 'francais' AND title = 'Étude de la langue';

-- Chapitre 3: L'interrogation  
INSERT INTO public.course_chapters (course_id, title, content, order_index)
SELECT id, 'L''interrogation',
'# L''interrogation

## Les trois formes de l''interrogation

### 1. L''interrogation totale (réponse par oui/non)

**Forme familière** (à l''oral)
- Tu viens ?
- Il fait beau ?

**Forme courante** (avec "est-ce que")
- Est-ce que tu viens ?
- Est-ce qu''il fait beau ?

**Forme soutenue** (inversion sujet-verbe)
- Viens-tu ?
- Fait-il beau ?',
2
FROM public.courses 
WHERE subject_id = 'francais' AND title = 'Étude de la langue';

-- Chapitre 4: La conjugaison
INSERT INTO public.course_chapters (course_id, title, content, order_index)
SELECT id, 'La conjugaison',
'# La conjugaison

## Les temps simples de l''indicatif

### Le présent
Actions qui se déroulent au moment où l''on parle.

**Verbe "chanter" (1er groupe)**
- Je chante
- Tu chantes
- Il/Elle chante
- Nous chantons
- Vous chantez
- Ils/Elles chantent

### L''imparfait
Actions passées qui durent ou se répètent.',
3
FROM public.courses 
WHERE subject_id = 'francais' AND title = 'Étude de la langue';