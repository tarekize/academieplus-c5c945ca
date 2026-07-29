-- Complète le titre français manquant des chapitres/leçons de mathématiques
-- pour les niveaux CEM/Première/Seconde/Terminale, à partir des sources
-- d'origine (src/data/math*.ts, non utilisées par l'application mais qui ont
-- servi à peupler la base). Ces sources contiennent les titres FR ET AR, mais
-- l'import initial en base n'a visiblement retenu que le titre arabe
-- (title_ar) pour une bonne partie du contenu, laissant `title` vide ou
-- dupliquant l'arabe. Idempotent : ne touche que les lignes dont le titre
-- français est encore manquant/erroné (vide ou identique à l'arabe), et ne
-- modifie jamais le titre arabe. Non scopé par filière (codes non
-- vérifiables depuis ce dépôt) : en cas de titre arabe partagé entre
-- filières avec une traduction différente, une seule des deux variantes
-- (également correcte) est retenue de façon déterministe.


UPDATE public.chapters AS c
SET title = v.title_fr
FROM (VALUES
  ('أنشطة عددية', 'Activités numériques'),
  ('الأعداد الطبيعية والأعداد العشرية', 'Les nombres naturels et les nombres décimaux'),
  ('الحساب على الأعداد الطبيعية والأعداد العشرية: الجمع والطرح', 'Calcul sur les nombres naturels et décimaux: addition et soustraction'),
  ('الحساب على الأعداد الطبيعية والأعداد العشرية: الضرب والقسمة', 'Calcul sur les nombres naturels et décimaux: multiplication et division'),
  ('الكتابات الكسرية', 'Les écritures fractionnaires'),
  ('الأعداد النسبية', 'Les nombres relatifs'),
  ('الحساب الحرفي', 'Le calcul littéral'),
  ('الدوال وتنظيم المعطيات', 'Fonctions et organisation des données'),
  ('التناسبية', 'La proportionnalité'),
  ('تنظيم معطيات', 'Organisation des données'),
  ('أنشطة هندسية', 'Activités géométriques'),
  ('التوازي والتعامد', 'Le parallèle et le perpendiculaire'),
  ('الأشكال المستوية', 'Les formes plani'),
  ('السطوح المستوية: الأطوال، المحيطات، المساحات.', 'Les surfaces plani: longueurs, périmètres, aires'),
  ('الزوايا', 'Les angles'),
  ('التناظر المحوري', 'La symétrie axiale'),
  ('متوازي المستطيلات والمكعّب', 'Les parallélépipèdes rectangles et les cubes')
) AS v(title_ar, title_fr)
WHERE c.title_ar = v.title_ar
  AND c.subject = 'math'
  AND c.school_level = '1ere_cem'
  AND (c.title IS NULL OR c.title = '' OR c.title = c.title_ar);

UPDATE public.lessons AS l
SET title = v.title_fr
FROM (VALUES
  ('أنشطة عددية', 'Activités numériques'),
  ('الأعداد الطبيعية والأعداد العشرية', 'Les nombres naturels et les nombres décimaux'),
  ('الحساب على الأعداد الطبيعية والأعداد العشرية: الجمع والطرح', 'Calcul sur les nombres naturels et décimaux: addition et soustraction'),
  ('الحساب على الأعداد الطبيعية والأعداد العشرية: الضرب والقسمة', 'Calcul sur les nombres naturels et décimaux: multiplication et division'),
  ('الكتابات الكسرية', 'Les écritures fractionnaires'),
  ('الأعداد النسبية', 'Les nombres relatifs'),
  ('الحساب الحرفي', 'Le calcul littéral'),
  ('الدوال وتنظيم المعطيات', 'Fonctions et organisation des données'),
  ('التناسبية', 'La proportionnalité'),
  ('تنظيم معطيات', 'Organisation des données'),
  ('أنشطة هندسية', 'Activités géométriques'),
  ('التوازي والتعامد', 'Le parallèle et le perpendiculaire'),
  ('الأشكال المستوية', 'Les formes plani'),
  ('السطوح المستوية: الأطوال، المحيطات، المساحات.', 'Les surfaces plani: longueurs, périmètres, aires'),
  ('الزوايا', 'Les angles'),
  ('التناظر المحوري', 'La symétrie axiale'),
  ('متوازي المستطيلات والمكعّب', 'Les parallélépipèdes rectangles et les cubes')
) AS v(title_ar, title_fr),
public.chapters c
WHERE l.title_ar = v.title_ar
  AND c.id = l.chapter_id
  AND c.subject = 'math'
  AND c.school_level = '1ere_cem'
  AND (l.title IS NULL OR l.title = '' OR l.title = l.title_ar);


UPDATE public.chapters AS c
SET title = v.title_fr
FROM (VALUES
  ('أنشطة عددية', 'Activités numériques'),
  ('العمليات على الأعداد الطبيعية والأعداد العشرية', 'Opérations sur les nombres naturels et les nombres décimaux'),
  ('الكسور و العمليات عليها', 'Les fractions et les opérations sur les fractions'),
  ('الأعداد النسبية', 'Les nombres relatifs'),
  ('مفهوم معادلة', 'Le concept d''équation'),
  ('الدوال وتنظيم المعطيات', 'Fonctions et organisation des données'),
  ('التناسبية', 'Proportionnalité'),
  ('تنظيم معطيات', 'Organisation des données'),
  ('أنشطة هندسية', 'Activités géométriques'),
  ('إنشاء أشكال هندسية بسيطة', 'Construction de formes géométriques simples'),
  ('التناظر المركزي', 'La symétrie centrale'),
  ('الزوايا والتوازي', 'Les angles et le parallélisme'),
  ('المثلثات والدائرة', 'Trigonométrie et cercle'),
  ('متوازي الأضلاع', 'Le parallélogramme'),
  ('الموشور القائم و أسطوانة الدوران', 'Le prisme droit et le cylindre de révolution')
) AS v(title_ar, title_fr)
WHERE c.title_ar = v.title_ar
  AND c.subject = 'math'
  AND c.school_level = '2eme_cem'
  AND (c.title IS NULL OR c.title = '' OR c.title = c.title_ar);

UPDATE public.lessons AS l
SET title = v.title_fr
FROM (VALUES
  ('أنشطة عددية', 'Activités numériques'),
  ('العمليات على الأعداد الطبيعية والأعداد العشرية', 'Opérations sur les nombres naturels et les nombres décimaux'),
  ('الكسور و العمليات عليها', 'Les fractions et les opérations sur les fractions'),
  ('الأعداد النسبية', 'Les nombres relatifs'),
  ('مفهوم معادلة', 'Le concept d''équation'),
  ('الدوال وتنظيم المعطيات', 'Fonctions et organisation des données'),
  ('التناسبية', 'Proportionnalité'),
  ('تنظيم معطيات', 'Organisation des données'),
  ('أنشطة هندسية', 'Activités géométriques'),
  ('إنشاء أشكال هندسية بسيطة', 'Construction de formes géométriques simples'),
  ('التناظر المركزي', 'La symétrie centrale'),
  ('الزوايا والتوازي', 'Les angles et le parallélisme'),
  ('المثلثات والدائرة', 'Trigonométrie et cercle'),
  ('متوازي الأضلاع', 'Le parallélogramme'),
  ('الموشور القائم و أسطوانة الدوران', 'Le prisme droit et le cylindre de révolution')
) AS v(title_ar, title_fr),
public.chapters c
WHERE l.title_ar = v.title_ar
  AND c.id = l.chapter_id
  AND c.subject = 'math'
  AND c.school_level = '2eme_cem'
  AND (l.title IS NULL OR l.title = '' OR l.title = l.title_ar);


UPDATE public.chapters AS c
SET title = v.title_fr
FROM (VALUES
  ('أنشطة عددية', 'Activités numériques'),
  ('الأعداد النسبية', 'Les nombres relatifs'),
  ('العمليات على الكسور والأعداد الناطقة', 'Opérations sur les fractions et les nombres rationnels'),
  ('القوى ذات أسس نسبية صحيحة', 'Puissances à exposants relatifs entiers'),
  ('الحساب الحرفي', 'Calcul littéral'),
  ('المساويات - المتباينات - المعادلات', 'Égalités - Inégalités - Équations'),
  ('الدوال وتنظيم المعطيات', 'Fonctions et organisation des données'),
  ('التناسبية', 'Proportionnalité'),
  ('تنظيم معطيات', 'Organisation des données'),
  ('أنشطة هندسية', 'Activités géométriques'),
  ('البرهان في الرياضيات', 'Démonstration en mathématiques'),
  ('المثلثات', 'Trigonométrie'),
  ('المثلث القائم و الدائرة', 'Triangle rectangle et cercle'),
  ('خاصية فيتاغورس، جيب تمام زاوية', 'Théorème de Pythagore, cosécante d''un angle'),
  ('الانسحاب', 'Homothéties'),
  ('الهرم و مخروط الدوران', 'Pyramide et cône de révolution')
) AS v(title_ar, title_fr)
WHERE c.title_ar = v.title_ar
  AND c.subject = 'math'
  AND c.school_level = '3eme_cem'
  AND (c.title IS NULL OR c.title = '' OR c.title = c.title_ar);

UPDATE public.lessons AS l
SET title = v.title_fr
FROM (VALUES
  ('أنشطة عددية', 'Activités numériques'),
  ('الأعداد النسبية', 'Les nombres relatifs'),
  ('العمليات على الكسور والأعداد الناطقة', 'Opérations sur les fractions et les nombres rationnels'),
  ('القوى ذات أسس نسبية صحيحة', 'Puissances à exposants relatifs entiers'),
  ('الحساب الحرفي', 'Calcul littéral'),
  ('المساويات - المتباينات - المعادلات', 'Égalités - Inégalités - Équations'),
  ('الدوال وتنظيم المعطيات', 'Fonctions et organisation des données'),
  ('التناسبية', 'Proportionnalité'),
  ('تنظيم معطيات', 'Organisation des données'),
  ('أنشطة هندسية', 'Activités géométriques'),
  ('البرهان في الرياضيات', 'Démonstration en mathématiques'),
  ('المثلثات', 'Trigonométrie'),
  ('المثلث القائم و الدائرة', 'Triangle rectangle et cercle'),
  ('خاصية فيتاغورس، جيب تمام زاوية', 'Théorème de Pythagore, cosécante d''un angle'),
  ('الانسحاب', 'Homothéties'),
  ('الهرم و مخروط الدوران', 'Pyramide et cône de révolution')
) AS v(title_ar, title_fr),
public.chapters c
WHERE l.title_ar = v.title_ar
  AND c.id = l.chapter_id
  AND c.subject = 'math'
  AND c.school_level = '3eme_cem'
  AND (l.title IS NULL OR l.title = '' OR l.title = l.title_ar);


UPDATE public.chapters AS c
SET title = v.title_fr
FROM (VALUES
  ('أنشطة عددية', 'Activités numériques'),
  ('الأعداد الطبيعية والأعداد الناطقة', 'Les nombres naturels et les nombres rationnels'),
  ('الحساب على الجذور', 'Calcul sur les racines'),
  ('الحساب الحَرفي', 'Calcul littéral'),
  ('المعادلات والمتراجحات', 'Équations et inéquations'),
  ('جمل معادلتين من الدّرجة الأولى لمجهولين', 'Systèmes d''équations du premier degré à deux inconnues'),
  ('الدوال وتنظيم المعطيات', 'Fonctions et organisation des données'),
  ('الدالة الخطية والتناسبية ...', 'La fonction linéaire et la proportionnalité'),
  ('الدّالة التآلفية', 'La fonction quadratique'),
  ('الإحصاء', 'Statistiques'),
  ('أنشطة هندسية', 'Activités géométriques'),
  ('خاصية طالس', 'Théorème de Thalès'),
  ('حساب المثلثات في المثلث القائم', 'Trigonométrie dans le triangle rectangle'),
  ('الأشعة والانسحاب', 'Rayons et homothéties'),
  ('الأشعة في معلم', 'Rayons dans un cercle'),
  ('الدوران - الزوايا - المضلعات المنتظمة ..', 'Rotations - Angles - Polygones réguliers'),
  ('الهندسة في الفضاء', 'Géométrie dans l''espace')
) AS v(title_ar, title_fr)
WHERE c.title_ar = v.title_ar
  AND c.subject = 'math'
  AND c.school_level = '4eme_cem'
  AND (c.title IS NULL OR c.title = '' OR c.title = c.title_ar);

UPDATE public.lessons AS l
SET title = v.title_fr
FROM (VALUES
  ('أنشطة عددية', 'Activités numériques'),
  ('الأعداد الطبيعية والأعداد الناطقة', 'Les nombres naturels et les nombres rationnels'),
  ('الحساب على الجذور', 'Calcul sur les racines'),
  ('الحساب الحَرفي', 'Calcul littéral'),
  ('المعادلات والمتراجحات', 'Équations et inéquations'),
  ('جمل معادلتين من الدّرجة الأولى لمجهولين', 'Systèmes d''équations du premier degré à deux inconnues'),
  ('الدوال وتنظيم المعطيات', 'Fonctions et organisation des données'),
  ('الدالة الخطية والتناسبية ...', 'La fonction linéaire et la proportionnalité'),
  ('الدّالة التآلفية', 'La fonction quadratique'),
  ('الإحصاء', 'Statistiques'),
  ('أنشطة هندسية', 'Activités géométriques'),
  ('خاصية طالس', 'Théorème de Thalès'),
  ('حساب المثلثات في المثلث القائم', 'Trigonométrie dans le triangle rectangle'),
  ('الأشعة والانسحاب', 'Rayons et homothéties'),
  ('الأشعة في معلم', 'Rayons dans un cercle'),
  ('الدوران - الزوايا - المضلعات المنتظمة ..', 'Rotations - Angles - Polygones réguliers'),
  ('الهندسة في الفضاء', 'Géométrie dans l''espace')
) AS v(title_ar, title_fr),
public.chapters c
WHERE l.title_ar = v.title_ar
  AND c.id = l.chapter_id
  AND c.subject = 'math'
  AND c.school_level = '4eme_cem'
  AND (l.title IS NULL OR l.title = '' OR l.title = l.title_ar);


UPDATE public.chapters AS c
SET title = v.title_fr
FROM (VALUES
  ('الأعداد والحساب', 'Nombres et calcul'),
  ('ممارسة الحساب في مختلف المجموعات العددية', 'Calcul dans les ensembles numériques'),
  ('التحكم في الحساب الجبري', 'Maîtrise du calcul algébrique'),
  ('اكتساب إجراءات تتعلق بالتعبير عن مشكلات بمعادلات ومتراجحات وحلها', 'Équations et inéquations'),
  ('استخدام الحاسبة العلمية أو البيانية لإجراء حساب', 'Utilisation de la calculatrice'),
  ('الدوال', 'Les fonctions'),
  ('إدراك مفهوم الدالة بمختلف الصيغ (بيانيا، حسابيا، جبريا)', 'Concept de fonction'),
  ('معرفة واستعمال خواص الدوال المرجعية التي تمهد لدراسة الدوال', 'Fonctions de référence'),
  ('قراءة جداول تغيرات ومنحنيات دوال، وتفسيرها', 'Tableaux de variations et courbes'),
  ('اكتساب إجراءات للتعبير عن مشكلات -تتعلق بالدوال - وحلها', 'Résolution de problèmes'),
  ('توظيف الحاسبة البيانية لاستخراج منحني دالة', 'Tracé de courbes avec calculatrice'),
  ('الهندسة', 'Géométrie'),
  ('ممارسة الحساب الشعاعي في الهندسة التحليلية', 'Calcul vectoriel en géométrie analytique'),
  ('حل مسائل هندسية تتعلق بالحساب الشعاعي في الهندسة التحليلية', 'Problèmes géométriques vectoriels'),
  ('اكتساب إجراءات للتعبير عن مشكلات تتعلق بالمستقيمات، وحلها', 'Problèmes sur les droites'),
  ('الإحصاء', 'Statistiques'),
  ('قراءة معطيات وتنظيمها', 'Lecture et organisation des données'),
  ('عرض نتائج على شكل مخططات بيانية، وقراءتها وتفسيرها', 'Diagrammes et graphiques'),
  ('تلخيص سلاسل إحصائية بواسطة مؤشرات الموقع ومؤشر التشتت (المدى)', 'Indicateurs statistiques'),
  ('توظيف الحاسبة العلمية أو البيانية لحساب مؤشرات إحصائية أو لاستخراج تمثيلات بيانية', 'Calcul avec calculatrice'),
  ('اكتساب إجراءات للتعبير عن مشكلات - تتعلق بالدوال - وحلها', 'Résolution de problèmes'),
  ('تكنولوجيات الإعلام والاتصال', 'Technologies de l''information et de la communication'),
  ('استخدام الحاسبة العلمية لبناء تعلّمات ولإجراء حسابات قصد حل مشكلة والوعي بحدودها', 'Utilisation de la calculatrice scientifique'),
  ('استخدام البرمجيات والحاسبة العلمية أو البيانية للتجريب والتخمين ومقارنة نتائج والتصديق وللتطرق إلى مفهوم جديد (مفهوم الدالة، المحاكاة، ... )', 'Logiciels et calculatrice pour expérimentation'),
  ('توظيف البرمجيات والحاسبة البيانية لاستخراج منحنى دالة قصد استغلاله', 'Tracé de courbes de fonctions'),
  ('توظيف البرمجيات والحاسبة البيانية لحساب مؤشرات الموقع لسلسلة إحصائية أو لاستخراج تمثيلات بيانية أو مخططات خاصة بهذه السلسلة', 'Indicateurs statistiques et représentations'),
  ('المنطق والبرهان الرياضي', 'Logique et démonstration mathématique'),
  ('الحكم على القضايا البسيطة والمركبة', 'Propositions simples et composées'),
  ('ممارسة البرهان بالاستنتاج وبالخلف وبفصل الحالات وبمثال مضاد', 'Démonstration par déduction, absurde et cas'),
  ('التعرف على نمط برهان معطى وشرحه وتصديقه', 'Reconnaissance et validation de preuves'),
  ('التمييز بين أنماط البرهان الذي يمارس في هذا المستوى', 'Distinction des types de démonstration'),
  ('تقريب نمط برهان من صيغة منطقية له', 'Lien entre démonstration et formule logique')
) AS v(title_ar, title_fr)
WHERE c.title_ar = v.title_ar
  AND c.subject = 'math'
  AND c.school_level = 'premiere'
  AND (c.title IS NULL OR c.title = '' OR c.title = c.title_ar);

UPDATE public.lessons AS l
SET title = v.title_fr
FROM (VALUES
  ('الأعداد والحساب', 'Nombres et calcul'),
  ('ممارسة الحساب في مختلف المجموعات العددية', 'Calcul dans les ensembles numériques'),
  ('التحكم في الحساب الجبري', 'Maîtrise du calcul algébrique'),
  ('اكتساب إجراءات تتعلق بالتعبير عن مشكلات بمعادلات ومتراجحات وحلها', 'Équations et inéquations'),
  ('استخدام الحاسبة العلمية أو البيانية لإجراء حساب', 'Utilisation de la calculatrice'),
  ('الدوال', 'Les fonctions'),
  ('إدراك مفهوم الدالة بمختلف الصيغ (بيانيا، حسابيا، جبريا)', 'Concept de fonction'),
  ('معرفة واستعمال خواص الدوال المرجعية التي تمهد لدراسة الدوال', 'Fonctions de référence'),
  ('قراءة جداول تغيرات ومنحنيات دوال، وتفسيرها', 'Tableaux de variations et courbes'),
  ('اكتساب إجراءات للتعبير عن مشكلات -تتعلق بالدوال - وحلها', 'Résolution de problèmes'),
  ('توظيف الحاسبة البيانية لاستخراج منحني دالة', 'Tracé de courbes avec calculatrice'),
  ('الهندسة', 'Géométrie'),
  ('ممارسة الحساب الشعاعي في الهندسة التحليلية', 'Calcul vectoriel en géométrie analytique'),
  ('حل مسائل هندسية تتعلق بالحساب الشعاعي في الهندسة التحليلية', 'Problèmes géométriques vectoriels'),
  ('اكتساب إجراءات للتعبير عن مشكلات تتعلق بالمستقيمات، وحلها', 'Problèmes sur les droites'),
  ('الإحصاء', 'Statistiques'),
  ('قراءة معطيات وتنظيمها', 'Lecture et organisation des données'),
  ('عرض نتائج على شكل مخططات بيانية، وقراءتها وتفسيرها', 'Diagrammes et graphiques'),
  ('تلخيص سلاسل إحصائية بواسطة مؤشرات الموقع ومؤشر التشتت (المدى)', 'Indicateurs statistiques'),
  ('توظيف الحاسبة العلمية أو البيانية لحساب مؤشرات إحصائية أو لاستخراج تمثيلات بيانية', 'Calcul avec calculatrice'),
  ('اكتساب إجراءات للتعبير عن مشكلات - تتعلق بالدوال - وحلها', 'Résolution de problèmes'),
  ('تكنولوجيات الإعلام والاتصال', 'Technologies de l''information et de la communication'),
  ('استخدام الحاسبة العلمية لبناء تعلّمات ولإجراء حسابات قصد حل مشكلة والوعي بحدودها', 'Utilisation de la calculatrice scientifique'),
  ('استخدام البرمجيات والحاسبة العلمية أو البيانية للتجريب والتخمين ومقارنة نتائج والتصديق وللتطرق إلى مفهوم جديد (مفهوم الدالة، المحاكاة، ... )', 'Logiciels et calculatrice pour expérimentation'),
  ('توظيف البرمجيات والحاسبة البيانية لاستخراج منحنى دالة قصد استغلاله', 'Tracé de courbes de fonctions'),
  ('توظيف البرمجيات والحاسبة البيانية لحساب مؤشرات الموقع لسلسلة إحصائية أو لاستخراج تمثيلات بيانية أو مخططات خاصة بهذه السلسلة', 'Indicateurs statistiques et représentations'),
  ('المنطق والبرهان الرياضي', 'Logique et démonstration mathématique'),
  ('الحكم على القضايا البسيطة والمركبة', 'Propositions simples et composées'),
  ('ممارسة البرهان بالاستنتاج وبالخلف وبفصل الحالات وبمثال مضاد', 'Démonstration par déduction, absurde et cas'),
  ('التعرف على نمط برهان معطى وشرحه وتصديقه', 'Reconnaissance et validation de preuves'),
  ('التمييز بين أنماط البرهان الذي يمارس في هذا المستوى', 'Distinction des types de démonstration'),
  ('تقريب نمط برهان من صيغة منطقية له', 'Lien entre démonstration et formule logique')
) AS v(title_ar, title_fr),
public.chapters c
WHERE l.title_ar = v.title_ar
  AND c.id = l.chapter_id
  AND c.subject = 'math'
  AND c.school_level = 'premiere'
  AND (l.title IS NULL OR l.title = '' OR l.title = l.title_ar);


UPDATE public.chapters AS c
SET title = v.title_fr
FROM (VALUES
  ('الدوال العددية', 'Les fonctions numériques'),
  ('تذكير حول الدوال', 'Rappels sur les fonctions'),
  ('الدوال المرجعية', 'Les fonctions de référence'),
  ('عمليات على الدوال', 'Opérations sur les fonctions'),
  ('إتجاه التغير', 'Sens de variation'),
  ('التمثيل البياني', 'Représentation graphique'),
  ('الدوال كثيرات الحدود', 'Les fonctions polynômes'),
  ('عمليات على كثيرات الحدود', 'Opérations sur les polynômes'),
  ('المعادلات من الدرجة الثانية', 'Équations du second degré'),
  ('المتراجحات من الدرجة الثانية', 'Inéquations du second degré'),
  ('الإشتقاقية', 'La dérivabilité'),
  ('العدد المشتق', 'Le nombre dérivé'),
  ('مماس لمنحن عند نقطة', 'Tangente à une courbe en un point'),
  ('التقريب التآلفي لدالة', 'Approximation affine d''une fonction'),
  ('الدالة المشتقة لدالة', 'La fonction dérivée d''une fonction'),
  ('عمليات على الدوال المشتقة', 'Opérations sur les fonctions dérivées'),
  ('تطبيقات الإشتقاقية', 'Applications de la dérivabilité'),
  ('اتجاه تغير دالة', 'Sens de variation d''une fonction'),
  ('القيم الحدية المحلية', 'Extremums locaux'),
  ('حصر دالة', 'Encadrement d''une fonction'),
  ('العناصر الحادة', 'Points remarquables'),
  ('النهايات', 'Les limites'),
  ('نهاية غير منتهية عند عدد حقيقي', 'Limite infinie en un point réel'),
  ('نهاية منتهية عند المالانهاية', 'Limite finie à l''infini'),
  ('مفهوم النهاية', 'Notion de limite'),
  ('عمليات على النهايات', 'Opérations sur les limites'),
  ('المستقيم المقارب المائل', 'Asymptote oblique'),
  ('دراسة دالة', 'Étude d''une fonction'),
  ('المتتاليات العددية', 'Les suites numériques'),
  ('التمثيل البياني لمتتالية عددية', 'Représentation graphique d''une suite'),
  ('إتجاه تغير متتالية عددية', 'Sens de variation d''une suite'),
  ('المتتاليات الحسابية', 'Les suites arithmétiques'),
  ('المتتاليات الهندسية', 'Les suites géométriques'),
  ('نهاية متتالية عددية', 'Limite d''une suite numérique'),
  ('نهاية متتالية عددية باستعمال الحصر', 'Limite d''une suite par encadrement'),
  ('نهاية متتالية هندسية', 'Limite d''une suite géométrique'),
  ('المرجح في المستوي', 'Le barycentre dans le plan'),
  ('تذكير حول الأشعة', 'Rappels sur les vecteurs'),
  ('مرجح نقطتين', 'Barycentre de deux points'),
  ('مرجح ثلاث نقاط', 'Barycentre de trois points'),
  ('إحداثيات مرجح ثلاث نقاط', 'Coordonnées du barycentre de trois points'),
  ('مرجح عدة نقاط', 'Barycentre de plusieurs points'),
  ('النسب المئوية والمؤشرات', 'Pourcentages et indicateurs'),
  ('الإِحصاء', 'Statistiques'),
  ('عموميات على الدوال', 'Généralités sur les fonctions'),
  ('المعادلات والمتراجحات', 'Équations et inéquations'),
  ('الإِشتقاق', 'Dérivation'),
  ('السلوك التقاربي', 'Comportement asymptotique'),
  ('الجمل الخطية', 'Systèmes linéaires'),
  ('الإحتمالات', 'Probabilités')
) AS v(title_ar, title_fr)
WHERE c.title_ar = v.title_ar
  AND c.subject = 'math'
  AND c.school_level = 'seconde'
  AND (c.title IS NULL OR c.title = '' OR c.title = c.title_ar);

UPDATE public.lessons AS l
SET title = v.title_fr
FROM (VALUES
  ('الدوال العددية', 'Les fonctions numériques'),
  ('تذكير حول الدوال', 'Rappels sur les fonctions'),
  ('الدوال المرجعية', 'Les fonctions de référence'),
  ('عمليات على الدوال', 'Opérations sur les fonctions'),
  ('إتجاه التغير', 'Sens de variation'),
  ('التمثيل البياني', 'Représentation graphique'),
  ('الدوال كثيرات الحدود', 'Les fonctions polynômes'),
  ('عمليات على كثيرات الحدود', 'Opérations sur les polynômes'),
  ('المعادلات من الدرجة الثانية', 'Équations du second degré'),
  ('المتراجحات من الدرجة الثانية', 'Inéquations du second degré'),
  ('الإشتقاقية', 'La dérivabilité'),
  ('العدد المشتق', 'Le nombre dérivé'),
  ('مماس لمنحن عند نقطة', 'Tangente à une courbe en un point'),
  ('التقريب التآلفي لدالة', 'Approximation affine d''une fonction'),
  ('الدالة المشتقة لدالة', 'La fonction dérivée d''une fonction'),
  ('عمليات على الدوال المشتقة', 'Opérations sur les fonctions dérivées'),
  ('تطبيقات الإشتقاقية', 'Applications de la dérivabilité'),
  ('اتجاه تغير دالة', 'Sens de variation d''une fonction'),
  ('القيم الحدية المحلية', 'Extremums locaux'),
  ('حصر دالة', 'Encadrement d''une fonction'),
  ('العناصر الحادة', 'Points remarquables'),
  ('النهايات', 'Les limites'),
  ('نهاية غير منتهية عند عدد حقيقي', 'Limite infinie en un point réel'),
  ('نهاية منتهية عند المالانهاية', 'Limite finie à l''infini'),
  ('مفهوم النهاية', 'Notion de limite'),
  ('عمليات على النهايات', 'Opérations sur les limites'),
  ('المستقيم المقارب المائل', 'Asymptote oblique'),
  ('دراسة دالة', 'Étude d''une fonction'),
  ('المتتاليات العددية', 'Les suites numériques'),
  ('التمثيل البياني لمتتالية عددية', 'Représentation graphique d''une suite'),
  ('إتجاه تغير متتالية عددية', 'Sens de variation d''une suite'),
  ('المتتاليات الحسابية', 'Les suites arithmétiques'),
  ('المتتاليات الهندسية', 'Les suites géométriques'),
  ('نهاية متتالية عددية', 'Limite d''une suite numérique'),
  ('نهاية متتالية عددية باستعمال الحصر', 'Limite d''une suite par encadrement'),
  ('نهاية متتالية هندسية', 'Limite d''une suite géométrique'),
  ('المرجح في المستوي', 'Le barycentre dans le plan'),
  ('تذكير حول الأشعة', 'Rappels sur les vecteurs'),
  ('مرجح نقطتين', 'Barycentre de deux points'),
  ('مرجح ثلاث نقاط', 'Barycentre de trois points'),
  ('إحداثيات مرجح ثلاث نقاط', 'Coordonnées du barycentre de trois points'),
  ('مرجح عدة نقاط', 'Barycentre de plusieurs points'),
  ('النسب المئوية والمؤشرات', 'Pourcentages et indicateurs'),
  ('الإِحصاء', 'Statistiques'),
  ('عموميات على الدوال', 'Généralités sur les fonctions'),
  ('المعادلات والمتراجحات', 'Équations et inéquations'),
  ('الإِشتقاق', 'Dérivation'),
  ('السلوك التقاربي', 'Comportement asymptotique'),
  ('الجمل الخطية', 'Systèmes linéaires'),
  ('الإحتمالات', 'Probabilités')
) AS v(title_ar, title_fr),
public.chapters c
WHERE l.title_ar = v.title_ar
  AND c.id = l.chapter_id
  AND c.subject = 'math'
  AND c.school_level = 'seconde'
  AND (l.title IS NULL OR l.title = '' OR l.title = l.title_ar);


UPDATE public.chapters AS c
SET title = v.title_fr
FROM (VALUES
  ('المتتاليات العددية', 'Suites numériques'),
  ('الاشتقاقية والاستمرارية', 'Dérivabilité et continuité'),
  ('النهايات', 'Nombres'),
  ('دراسة الدوال', 'Étude de fonctions'),
  ('الدوال الأصلية والتكاملات', 'Primitives et intégrales'),
  ('الدوال اللوغارتمية والأسية', 'Fonctions logarithmiques et exponentielles'),
  ('الإحصاء', 'Statistiques'),
  ('الإحتمالات', 'Probabilités'),
  ('الحساب', 'Arithmétique'),
  ('الإحصاء و الاحتمالات', 'Statistiques et Probabilités'),
  ('النهايات والاستمرارية', 'Limites et continuité'),
  ('الاشتقاقية', 'Dérivabilité'),
  ('الدوال الأسية واللوغاريتمية', 'Fonctions exponentielles et logarithmiques'),
  ('التزايد المقارن', 'Croissance comparée'),
  ('الدوال الأصلية', 'Primitives'),
  ('الحساب التكاملي', 'Calcul intégral'),
  ('الاحتمالات الشرطية', 'Probabilités conditionnelles'),
  ('قوانين الاحتمال', 'Lois de probabilité')
) AS v(title_ar, title_fr)
WHERE c.title_ar = v.title_ar
  AND c.subject = 'math'
  AND c.school_level = 'terminale'
  AND (c.title IS NULL OR c.title = '' OR c.title = c.title_ar);

UPDATE public.lessons AS l
SET title = v.title_fr
FROM (VALUES
  ('المتتاليات العددية', 'Suites numériques'),
  ('الاشتقاقية والاستمرارية', 'Dérivabilité et continuité'),
  ('النهايات', 'Nombres'),
  ('دراسة الدوال', 'Étude de fonctions'),
  ('الدوال الأصلية والتكاملات', 'Primitives et intégrales'),
  ('الدوال اللوغارتمية والأسية', 'Fonctions logarithmiques et exponentielles'),
  ('الإحصاء', 'Statistiques'),
  ('الإحتمالات', 'Probabilités'),
  ('الحساب', 'Arithmétique'),
  ('الإحصاء و الاحتمالات', 'Statistiques et Probabilités'),
  ('النهايات والاستمرارية', 'Limites et continuité'),
  ('الاشتقاقية', 'Dérivabilité'),
  ('الدوال الأسية واللوغاريتمية', 'Fonctions exponentielles et logarithmiques'),
  ('التزايد المقارن', 'Croissance comparée'),
  ('الدوال الأصلية', 'Primitives'),
  ('الحساب التكاملي', 'Calcul intégral'),
  ('الاحتمالات الشرطية', 'Probabilités conditionnelles'),
  ('قوانين الاحتمال', 'Lois de probabilité')
) AS v(title_ar, title_fr),
public.chapters c
WHERE l.title_ar = v.title_ar
  AND c.id = l.chapter_id
  AND c.subject = 'math'
  AND c.school_level = 'terminale'
  AND (l.title IS NULL OR l.title = '' OR l.title = l.title_ar);


NOTIFY pgrst, 'reload schema';
