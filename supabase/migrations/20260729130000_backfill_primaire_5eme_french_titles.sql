-- Complète le titre français manquant des chapitres/leçons de mathématiques
-- 5ème primaire, à partir de la source d'origine (src/data/mathPrimaire5eme.ts,
-- non utilisée par l'application mais qui a servi à peupler la base). Cette
-- source contient les titres FR ET AR pour ces 4 chapitres et 68 leçons, mais
-- l'import initial en base n'a visiblement retenu que le titre arabe
-- (title_ar), laissant `title` vide ou dupliquant l'arabe — ce qui faisait
-- apparaître ces titres en arabe même en interface française. Idempotent :
-- ne touche que les lignes dont le titre français est encore manquant/erroné
-- (vide ou identique à l'arabe), et ne modifie jamais le titre arabe.

UPDATE public.chapters AS c
SET title = v.title_fr
FROM (VALUES
  ('الوضعية الانطلاقية 1', 'Situation de départ 1'),
  ('الوضعية الانطلاقية 2', 'Situation de départ 2'),
  ('الوضعية الانطلاقية 3', 'Situation de départ 3'),
  ('الوضعية الانطلاقية 4', 'Situation de départ 4')
) AS v(title_ar, title_fr)
WHERE c.title_ar = v.title_ar
  AND c.subject = 'math'
  AND c.school_level = '5eme_primaire'
  AND (c.title IS NULL OR c.title = '' OR c.title = c.title_ar);

UPDATE public.lessons AS l
SET title = v.title_fr
FROM (VALUES
  ('الأعداد إلى 999999 ''1''(كتابة وقراءة وتفكيك الأعداد إلى999999 )', 'Les nombres jusqu''à 999 999 ''1'' (écriture, lecture et décomposition des nombres jusqu''à 999 999)'),
  ('التعليم على مرصوفة واستعمال تصميم', 'Enseignement sur quadrillage et utilisation de patron'),
  ('جمع أعداد طبيعية', 'Addition de nombres naturels'),
  ('الأعداد إلى 999 999 ''2''(مقارنة وترتيب وحصر الأعماد إلى999999)', 'Les nombres jusqu''à 999 999 ''2'' (comparaison, classement et dénombrement jusqu''à 999 999)'),
  ('ضرح أعداد طبيعية', 'Soustraction de nombres naturels'),
  ('تنظيم معلومات في جدول', 'Organisation d''informations dans un tableau'),
  ('وضعيات جمعية وطرحية', 'Situations additives et soustractives'),
  ('الاستقامية، وطول قطعة مستقيم', 'Droite et longueur d''un segment'),
  ('علاقات حسابية بين أعداد طبيعية', 'Relations arithmétiques entre nombres naturels'),
  ('الأطوال', 'Les longueurs'),
  ('الضرب في عدد برقمين', 'Multiplication par un nombre à deux chiffres'),
  ('الضرب في عدد بثلاثة أرقام', 'Multiplication par un nombre à trois chiffres'),
  ('تنظيم معلومات واستغلالها', 'Organisation d''informations et leur exploitation'),
  ('مستقيمات متوازية ومستقيمات متعامدة', 'Droites parallèles et droites perpendiculaires'),
  ('الأعداد إلى 999 999 999 ''1''(قراءة وكتابة وتفكيك الأعداد إلى 999 999 999)', 'Les nombres jusqu''à 999 999 999 ''1'' (lecture, écriture et décomposition des nombres jusqu''à 999 999 999)'),
  ('الأعداد إلى 999 999 999 ''2''(مقارنة وترتيب وحصر الأعداد إلى 999 999 999)', 'Les nombres jusqu''à 999 999 999 ''2'' (comparaison, classement et dénombrement des nombres jusqu''à 999 999 999)'),
  ('الحاسبة (اكتشاف المسات الذاكرة والتحكم فيها )', 'La calculatrice (découverte des touches mémoire et leur contrôle)'),
  ('عد كميات كبيرة', 'Dénombrement de grandes quantités'),
  ('منهجية حل مشكلات', 'Méthodologie de résolution de problèmes'),
  ('مقارنة وترتيب زوايا', 'Comparaison et classement d''angles'),
  ('استعمال تصميم أو خريطة', 'Utilisation d''un patron ou d''une carte'),
  ('قِيمَةُ الرَّقم حَسْبَ مَنْزِلَتِهِ في كِتَابَةِ عددٍ طَبيعيٍّ', 'Valeur du chiffre selon sa position dans l''écriture d''un nombre naturel'),
  ('الكسور', 'Les fractions'),
  ('الكسور العشرية والأعداد العشرية', 'Les fractions décimales et les nombres décimaux'),
  ('التناسبية1 (تصنيف وضعية باستعمال معيار التناسبية)', 'Proportionnalité 1 (classification d''une situation en utilisant le critère de proportionnalité)'),
  ('محيط المربع والمستطيل', 'Périmètre du carré et du rectangle'),
  ('القسمة', 'La division'),
  ('التناظر1 (التحقق من أنّ لشكل ما محور تناظر أو أكثر باستعمال تقنيات مختلفة.)', 'Symétrie 1 (vérifier qu''une figure a un axe de symétrie ou plus en utilisant différentes techniques)'),
  ('التناسبية2 (حل وضعيات تناسبية باستعمال خواص الخطية ومعامل التناسبية.)', 'Proportionnalité 2 (résoudre des situations de proportionnalité en utilisant les propriétés de linéarité et le coefficient de proportionnalité)'),
  ('حمع وطرح أعداد طبيعية وعشرية (1)', 'Addition et soustraction de nombres naturels et décimaux (1)'),
  ('وضعيات جمعية أو ضربية', 'Situations additives ou multiplicatives'),
  ('التناظر2 (رسم نظير شكل بالنسبة إلى مستقيم معطى على ورقة مرصوفة.)', 'Symétrie 2 (tracer l''image d''une figure par rapport à une droite donnée sur papier quadrillé)'),
  ('الحاسبة', 'La calculatrice'),
  ('الأشكال الهندسية المألوفة', 'Les figures géométriques familières'),
  ('منهجية حلّ مشكلات', 'Méthodologie de résolution de problèmes'),
  ('الاعداد العشرية والمستقيم المدرج', 'Les nombres décimaux et la droite graduée'),
  ('مقارنة وترتيب أعداد عشرية', 'Comparaison et classement de nombres décimaux'),
  ('الضرب في (أو القسمة على) 100.10، 1000', 'Multiplication par (ou division par) 100, 10, 1000'),
  ('التناسبية (3)', 'Proportionnalité (3)'),
  ('ضرب عدد عشري في عدد طبيعي', 'Multiplication d''un nombre décimal par un nombre naturel'),
  ('نفكيك عدد عشري (1)', 'Décomposition d''un nombre décimal (1)'),
  ('المثلثات الخاصة', 'Les triangles particuliers'),
  ('قياس مساحات', 'Mesure de surfaces'),
  ('مساحة المربع والمستطيل', 'Aire du carré et du rectangle'),
  ('علاقات حسابية بين أعداد عشرية', 'Relations arithmétiques entre nombres décimaux'),
  ('النسبة المئوية', 'Le pourcentage'),
  ('الرباعيات الخاصة', 'Les quadrilatères particuliers'),
  ('القسمة (3)', 'La division (3)'),
  ('قياس كتل', 'Mesure de masses'),
  ('تمثيلات بيانية ومخططات', 'Représentations graphiques et diagrammes'),
  ('الدائرة', 'Le cercle'),
  ('القسمة التامة', 'La division exacte'),
  ('الأعداد العشرية وقياس مقادير', 'Les nombres décimaux et la mesure de grandeurs'),
  ('منهجية حل مشكلات', 'Méthodologie de résolution de problèmes'),
  ('المجسمات', 'Les solides'),
  ('وضعيات قسمة', 'Situations de division'),
  ('نقل شكل أو إتمامه', 'Translation d''une figure ou son achèvement'),
  ('إنشاء أشكال هندسية', 'Construction de figures géométriques'),
  ('الكسور والأعداد العشرية', 'Les fractions et les nombres décimaux'),
  ('وضعيات ضرب أو قسمة', 'Situations de multiplication ou division'),
  ('قياس مدد', 'Mesure de durées'),
  ('تفكيك عدد عشري', 'Décomposition d''un nombre décimal'),
  ('المقياس', 'L''échelle'),
  ('قياس سعات', 'Mesure de capacités'),
  ('وضعيات حسابية', 'Situations arithmétiques'),
  ('السرعة المتوسطة', 'La vitesse moyenne'),
  ('قِيمَةُ الرَّقم حَسْبَ مَنْزِلَتِه في كِتَابَة عددٍ عشري', 'Valeur du chiffre selon sa position dans l''écriture d''un nombre décimal'),
  ('منهجية حلّ مشكلات', 'Méthodologie de résolution de problèmes')
) AS v(title_ar, title_fr),
public.chapters c
WHERE l.title_ar = v.title_ar
  AND c.id = l.chapter_id
  AND c.subject = 'math'
  AND c.school_level = '5eme_primaire'
  AND (l.title IS NULL OR l.title = '' OR l.title = l.title_ar);

NOTIFY pgrst, 'reload schema';
