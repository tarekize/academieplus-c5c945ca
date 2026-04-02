-- =====================================================
-- MISE À JOUR DU CONTENU DES LEÇONS : 3ème CEM (13 leçons)
-- =====================================================

-- 1. الأعداد النسبية (3eme_cem)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">الأعداد النسبية — مراجعة وتعميق</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
في السنة الثالثة متوسط نراجع ونعمّق العمليات على الأعداد النسبية مع التركيز على حساب تعابير معقدة والأعداد الكسرية النسبية.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">الأعداد الكسرية النسبية</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 تعريف:</strong><br>
<span style="color: #e74c3c; font-weight: bold;">العدد الكسري النسبي</span> هو كسر بسطه ومقامه عددان نسبيان (المقام ≠ 0).<br>
مثل: −3/5 ، 7/(−2) ، (−4)/(−3)
</div>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;">
<strong>قاعدة الإشارة:</strong><br>
(−a)/b = a/(−b) = −(a/b)<br>
(−a)/(−b) = a/b
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">العمليات على الكسور النسبية</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
تُنجز العمليات بنفس القواعد السابقة مع مراعاة الإشارات.
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> أحسب: (−2/3) + (5/6)<br>
= (−4/6) + (5/6) = <strong>1/6</strong><br><br>
أحسب: (−3/4) × (−8/9)<br>
= (3 × 8)/(4 × 9) = 24/36 = <strong>2/3</strong> (الإشارة + لأن − × − = +)
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> أحسب وبسّط: (−5/8) + (3/4) − (−1/2) ، (−2/3) × (9/−4) ÷ (3/2)
</div>

</div>' WHERE id = 'ee026318-1266-4371-b082-387f095c87fe';


-- 2. العمليات على الكسور
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">العمليات على الكسور</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
في هذا الدرس نتعمّق في العمليات على الكسور بما في ذلك الجمع والطرح والضرب والقسمة مع تبسيط النتائج.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">جمع وطرح كسور ذات مقامات مختلفة</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; font-size: 1.1em;">
<strong>الخطوات:</strong><br>
1. نبحث عن المقام المشترك الأصغر (PPCM).<br>
2. نحوّل كل كسر إلى مقام مشترك.<br>
3. نجمع أو نطرح البسوط.<br>
4. نبسّط النتيجة.
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> أحسب: 5/12 + 3/8<br>
PPCM(12, 8) = 24<br>
= 10/24 + 9/24 = <strong>19/24</strong>
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">ضرب وقسمة كسور متعددة</h3>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> أحسب: (3/4) × (8/15) ÷ (2/5)<br>
= (3/4) × (8/15) × (5/2)<br>
= (3 × 8 × 5)/(4 × 15 × 2)<br>
= 120/120 = <strong>1</strong>
</div>

<div style="background: #fdedec; border-right: 4px solid #e74c3c; padding: 15px; margin: 15px 0; border-radius: 6px;">
⚠️ <strong>نصيحة:</strong> بسّط قبل الضرب لتسهيل الحساب (التبسيط المتقاطع).
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> أحسب وبسّط: 7/15 + 2/5 − 1/3 ، (14/25) × (15/8) ÷ (7/4)
</div>

</div>' WHERE id = 'eb2165c0-dc7e-43b6-8d15-485607744baa';


-- 3. القوى ذات أسس صحيحة طبيعية
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">القوى ذات أسس صحيحة طبيعية</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
القوى هي طريقة مختصرة لكتابة ضرب عدد في نفسه عدة مرات. تُستعمل كثيراً في العلوم والحساب.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">تعريف</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 تعريف:</strong><br>
لكل عدد a وعدد طبيعي n ≥ 2:<br>
<span style="color: #e74c3c; font-weight: bold;">aⁿ = a × a × a × ... × a</span> (n مرات)<br><br>
• a⁰ = 1 (لكل a ≠ 0)<br>
• a¹ = a
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>أمثلة:</strong><br>
2³ = 2×2×2 = 8 ، 5² = 25 ، 10⁴ = 10000<br>
(−3)² = (−3)×(−3) = 9 ، (−2)³ = (−2)×(−2)×(−2) = −8
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">خصائص القوى</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; font-size: 1.1em;">
<table style="width: 100%; border-collapse: collapse;">
<tr><td style="padding: 8px;"><strong>aⁿ × aᵐ = aⁿ⁺ᵐ</strong></td><td style="padding: 8px;">جداء قوتين لنفس الأساس</td></tr>
<tr><td style="padding: 8px;"><strong>aⁿ ÷ aᵐ = aⁿ⁻ᵐ</strong></td><td style="padding: 8px;">حاصل قسمة قوتين (n ≥ m)</td></tr>
<tr><td style="padding: 8px;"><strong>(aⁿ)ᵐ = aⁿˣᵐ</strong></td><td style="padding: 8px;">قوة قوة</td></tr>
<tr><td style="padding: 8px;"><strong>(a×b)ⁿ = aⁿ × bⁿ</strong></td><td style="padding: 8px;">قوة جداء</td></tr>
<tr><td style="padding: 8px;"><strong>(a/b)ⁿ = aⁿ/bⁿ</strong></td><td style="padding: 8px;">قوة حاصل قسمة</td></tr>
</table>
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">الكتابة العلمية</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<span style="color: #e74c3c; font-weight: bold;">الكتابة العلمية</span> لعدد هي: a × 10ⁿ حيث 1 ≤ a &lt; 10 و n عدد صحيح.<br><br>
مثل: 3500 = 3.5 × 10³ ، 0.006 = 6 × 10⁻³
</div>

<div style="background: #fdedec; border-right: 4px solid #e74c3c; padding: 15px; margin: 15px 0; border-radius: 6px;">
⚠️ <strong>انتبه:</strong> (−3)² = 9 لكن −3² = −9 (الأقواس تغيّر المعنى!)
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 1:</strong> بسّط: 2³ × 2⁵ ، (3²)⁴ ، 5⁷ ÷ 5³
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 2:</strong> أكتب بالكتابة العلمية: 45000 ، 0.0023 ، 670000000
</div>

</div>' WHERE id = 'd801abf6-03bb-4e0c-9b10-179a27dd7384';


-- 4. الحساب الحرفي (3eme_cem)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">الحساب الحرفي: النشر والتحليل</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
في السنة الثالثة نتعلم نشر وتحليل تعابير حرفية باستعمال المتطابقات الشهيرة، وهي أدوات أساسية في الجبر.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">النشر (التوزيع)</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; font-size: 1.1em;">
<strong>التوزيع البسيط:</strong> k(a + b) = ka + kb<br>
<strong>الجداء المزدوج:</strong> (a + b)(c + d) = ac + ad + bc + bd
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">المتطابقات الشهيرة</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; font-size: 1.2em; text-align: center;">
<strong>(a + b)² = a² + 2ab + b²</strong><br><br>
<strong>(a − b)² = a² − 2ab + b²</strong><br><br>
<strong>(a + b)(a − b) = a² − b²</strong>
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال نشر:</strong> (3x + 2)² = (3x)² + 2(3x)(2) + 2² = 9x² + 12x + 4<br><br>
📝 <strong>مثال تحليل:</strong> x² − 16 = x² − 4² = (x + 4)(x − 4)
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">التحليل</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>التحليل بإبراز عامل مشترك:</strong><br>
ab + ac = a(b + c)<br><br>
<strong>التحليل بالمتطابقات الشهيرة:</strong><br>
نتعرّف على الشكل المناسب ونطبّق المتطابقة عكسياً.
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> حلّل: 6x² + 9x = 3x(2x + 3)<br>
حلّل: 4x² − 12x + 9 = (2x − 3)²
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 1:</strong> انشر: (2x − 5)² ، (x + 3)(x − 3) ، (4x + 1)(2x − 3)
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 2:</strong> حلّل: 25x² − 9 ، x² + 6x + 9 ، 8x³ − 12x²
</div>

</div>' WHERE id = 'a7e2fa55-6c3b-41d4-bc7b-2028d5cce8bc';


-- 5. المساويات والمتباينات (المعادلات والمتراجحات)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">المساويات والمتباينات</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
المساواة تربط تعبيرين بعلامة =، والمتباينة تربطهما بعلامة &lt; أو &gt; أو ≤ أو ≥. حل المعادلات والمتراجحات من المهارات الأساسية في الجبر.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">حل معادلة من الدرجة الأولى</h3>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> حلّ: 5x − 3 = 2(x + 3)<br>
5x − 3 = 2x + 6<br>
5x − 2x = 6 + 3<br>
3x = 9<br>
<strong>x = 3</strong>
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">حل متراجحة من الدرجة الأولى</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 القواعد:</strong><br>
• نجمع أو نطرح نفس العدد من الطرفين دون تغيير اتجاه المتراجحة.<br>
• نضرب أو نقسم بعدد <strong>موجب</strong> دون تغيير الاتجاه.<br>
• نضرب أو نقسم بعدد <strong>سالب</strong> مع <span style="color: #e74c3c; font-weight: bold;">عكس اتجاه المتراجحة</span>.
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> حلّ: −2x + 5 &gt; 1<br>
−2x &gt; 1 − 5<br>
−2x &gt; −4<br>
x &lt; 2 (عكسنا الاتجاه لأننا قسمنا على −2)<br>
<strong>الحل: x &lt; 2</strong> أي المجال (−∞ , 2)
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 1:</strong> حلّ: 3(2x − 1) = 4x + 7
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 2:</strong> حلّ ومثّل الحل على مستقيم مدرّج: −3x + 6 ≤ 0
</div>

</div>' WHERE id = 'f376d360-dc95-4dda-bba4-b986e7d6552f';


-- 6. التناسبية (3eme_cem)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">التناسبية</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
في السنة الثالثة متوسط نستعمل التناسبية في تطبيقات أعمق: الزيادة والنقصان بنسبة مئوية، تطبيقات على السرعة والمقاييس.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">الزيادة والنقصان بنسبة مئوية</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; font-size: 1.1em;">
<strong>زيادة بنسبة t%:</strong> القيمة الجديدة = القيمة الأصلية × (1 + t/100)<br><br>
<strong>نقصان بنسبة t%:</strong> القيمة الجديدة = القيمة الأصلية × (1 − t/100)
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال 1:</strong> زاد ثمن سلعة بـ 15%. إذا كان ثمنها الأصلي 2000 دج:<br>
الثمن الجديد = 2000 × (1 + 15/100) = 2000 × 1.15 = <strong>2300 دج</strong><br><br>
📝 <strong>مثال 2:</strong> خُفّض ثمن سلعة بـ 20%. إذا كان ثمنها 5000 دج:<br>
الثمن الجديد = 5000 × (1 − 20/100) = 5000 × 0.80 = <strong>4000 دج</strong>
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">تطبيقات متنوعة</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>المسافة والزمن والسرعة:</strong><br>
v = d/t ، d = v × t ، t = d/v<br><br>
<strong>السلّم:</strong> سلّم = المسافة على الرسم ÷ المسافة الحقيقية
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> قطار ينطلق من المدينة A إلى المدينة B (المسافة 450 كم) بسرعة متوسطة 90 كم/سا. إذا انطلق الساعة 8:00 صباحاً، متى يصل؟
</div>

</div>' WHERE id = '5db7c6e3-d33b-4aa5-a649-7c9ea65f7dfe';


-- 7. تنظيم معطيات (3eme_cem)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">تنظيم معطيات — الإحصاء</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
في السنة الثالثة متوسط نتعلم حساب المتوسط الحسابي والمنوال ونتعمّق في تمثيل البيانات.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">المتوسط الحسابي</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;">
<strong>المتوسط الحسابي = مجموع القيم ÷ عدد القيم</strong><br><br>
<strong>المتوسط الحسابي الموزون = Σ(xᵢ × nᵢ) ÷ N</strong>
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> علامات تلميذ: 14، 12، 16، 10، 18<br>
المتوسط = (14 + 12 + 16 + 10 + 18) ÷ 5 = 70 ÷ 5 = <strong>14</strong>
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">المنوال</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<span style="color: #e74c3c; font-weight: bold;">المنوال (Mode)</span> هو القيمة الأكثر تكراراً في سلسلة إحصائية.
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> في امتحان الرياضيات، حصل 25 تلميذاً على العلامات التالية:<br>
10 (3 تلاميذ)، 12 (5 تلاميذ)، 14 (8 تلاميذ)، 16 (6 تلاميذ)، 18 (3 تلاميذ).<br>
أحسب المتوسط الحسابي الموزون وحدد المنوال.
</div>

</div>' WHERE id = '23a08292-e6f5-452b-a182-e1b956150798';


-- 8. البرهان في الرياضيات
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">البرهان في الرياضيات</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
البرهان هو تسلسل منطقي من الخطوات لإثبات صحة نتيجة ما. في الرياضيات، لا نقبل نتيجة إلا إذا برهنّاها.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">بنية البرهان</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
يتكوّن البرهان من:<br>
1. <strong>المعطيات (الفرضيات):</strong> ما هو معطى أو معروف.<br>
2. <strong>المطلوب:</strong> ما نريد إثباته.<br>
3. <strong>التبرير:</strong> سلسلة استنتاجات منطقية مبنية على خصائص وقواعد معروفة.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">أنواع البرهان</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
• <strong>البرهان المباشر:</strong> ننطلق من المعطيات ونصل إلى النتيجة خطوة بخطوة.<br>
• <strong>البرهان بالخُلف (بالتناقض):</strong> نفترض عكس ما نريد إثباته ونصل إلى تناقض.
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال برهان مباشر:</strong><br>
<strong>المعطى:</strong> ABCD متوازي أضلاع و (d) // (AB).<br>
<strong>المطلوب:</strong> أثبت أن (d) // (DC).<br>
<strong>البرهان:</strong><br>
• ABCD متوازي أضلاع ← (AB) // (DC) (خاصية)<br>
• (d) // (AB) (معطى)<br>
• إذاً (d) // (DC) (مستقيمان موازيان لنفس المستقيم متوازيان)
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> ABC مثلث حيث الزاوية A = 90° و AB = 3 سم و AC = 4 سم. أثبت أن BC = 5 سم.
</div>

</div>' WHERE id = '347ccefb-9478-466a-8904-c114aed5bb0d';


-- 9. المثلثات (3eme_cem)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">المثلثات — تطابق وتشابه</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
في هذا الدرس ندرس حالات تطابق مثلثات (عندما يكونان متطابقين) وشروط ذلك.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">حالات تطابق المثلثات</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
مثلثان متطابقان إذا كانا يتطابقان في أحد الشروط التالية:<br><br>
<strong>الحالة 1 (ض.ض.ض):</strong> ثلاثة أضلاع متساوية اثنين اثنين.<br>
<strong>الحالة 2 (ض.ز.ض):</strong> ضلعان متساويان والزاوية المحصورة بينهما متساوية.<br>
<strong>الحالة 3 (ز.ض.ز):</strong> زاويتان متساويتان والضلع الواصل بينهما متساوٍ.
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong><br>
ABC و DEF مثلثان حيث: AB = DE = 5 سم، الزاوية B = الزاوية E = 40°، BC = EF = 7 سم.<br>
الحالة ض.ز.ض محققة ← المثلثان متطابقان.
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> ABC مثلث حيث AB = 6 سم، BC = 8 سم، AC = 7 سم. أنشئ مثلث DEF متطابق معه بحالة ض.ض.ض.
</div>

</div>' WHERE id = 'bf268c80-1eff-4f55-bb7a-5d34b8c5ff49';


-- 10. المثلث القائم والدائرة
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">المثلث القائم والدائرة</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
هناك علاقة قوية بين المثلث القائم والدائرة. في هذا الدرس ندرس هذه العلاقة ونتعلم خاصية مهمة تربط بينهما.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">خاصية المثلث القائم والدائرة المحيطة</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; font-size: 1.1em;">
<strong>الخاصية المباشرة:</strong><br>
إذا كان المثلث ABC قائماً في A، فإن الدائرة المحيطة به مركزها منتصف الوتر [BC] ونصف قطرها BC/2.<br><br>
<strong>الخاصية العكسية:</strong><br>
إذا كان المثلث ABC مسجّلاً في دائرة قطرها [BC]، فإن المثلث قائم في A.
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> ABC مثلث قائم في A حيث BC = 10 سم.<br>
الدائرة المحيطة به مركزها M (منتصف [BC]).<br>
نصف قطرها = 10/2 = <strong>5 سم</strong>
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">الزاوية المحيطية والزاوية المركزية</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
• <strong>زاوية مركزية:</strong> رأسها مركز الدائرة.<br>
• <strong>زاوية محيطية:</strong> رأسها نقطة على الدائرة.<br>
• زاوية محيطية تساوي نصف الزاوية المركزية التي تقابل نفس القوس.
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> [AB] قطر دائرة مركزها O ونصف قطرها 5 سم. C نقطة من الدائرة حيث OC = 5 سم. ما قياس الزاوية ACB؟ علّل.
</div>

</div>' WHERE id = '583a0edc-27b2-457a-b310-36d695b8cf16';


-- 11. خاصية فيتاغورس
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">خاصية فيتاغورس (نظرية بيتاغوراس)</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
خاصية فيتاغورس من أهم الخصائص في الهندسة. تربط بين أطوال أضلاع المثلث القائم. تُستعمل لحساب الأطوال والتحقق من أن مثلثاً قائم.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">نصّ الخاصية</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.3em;">
<strong>في مثلث قائم، مربع الوتر يساوي مجموع مربعي الضلعين الآخرين.</strong><br><br>
إذا كان ABC قائماً في A:<br>
<strong>BC² = AB² + AC²</strong>
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال 1 (حساب طول):</strong><br>
ABC مثلث قائم في A حيث AB = 3 سم و AC = 4 سم.<br>
BC² = AB² + AC² = 9 + 16 = 25<br>
BC = √25 = <strong>5 سم</strong>
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">الخاصية العكسية</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; font-size: 1.1em;">
إذا كان في مثلث ABC: BC² = AB² + AC²<br>
فإن المثلث <strong>قائم في A</strong> (الزاوية القائمة تقابل الضلع الأطول).
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال 2 (التحقق):</strong><br>
هل المثلث ذو الأضلاع 5, 12, 13 قائم؟<br>
13² = 169 ، 5² + 12² = 25 + 144 = 169<br>
13² = 5² + 12² ← <strong>نعم، المثلث قائم</strong>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 1:</strong> مثلث قائم في B حيث AB = 6 سم و BC = 8 سم. أحسب AC.
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 2:</strong> هل المثلث ذو الأضلاع 7 سم، 24 سم، 25 سم قائم؟ علّل.
</div>

</div>' WHERE id = 'cbb0988a-4e3c-40c0-adad-29fd3b60b491';


-- 12. الانسحاب
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">الانسحاب</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
الانسحاب (Translation) هو تحويل هندسي يُزيح كل نقطة بنفس المسافة وفي نفس الاتجاه وبنفس المنحى.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">تعريف</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 تعريف:</strong><br>
الانسحاب الذي يحوّل A إلى B هو التحويل الذي يحوّل كل نقطة M إلى النقطة M'' بحيث:<br>
يكون الرباعي ABMM'' متوازي أضلاع (أو أن الشعاع MM'' = الشعاع AB).
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">خصائص الانسحاب</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
الانسحاب <strong>يحفظ</strong>:<br>
• الأطوال (المسافات)<br>
• الزوايا<br>
• التوازي<br>
• المساحات<br>
• الاستقامية<br><br>
صورة مستقيم بالانسحاب هي مستقيم <strong>موازٍ</strong> له.
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> الانسحاب الذي يحوّل A(1, 2) إلى B(4, 5) يحوّل أي نقطة M(x, y) إلى M''(x+3, y+3) (نضيف 3 للفاصلة و 3 للترتيبة).
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> في معلم متعامد ومتجانس، أنشئ صورة المثلث ABC حيث A(1,1) B(4,1) C(2,3) بالانسحاب الذي يحوّل النقطة O(0,0) إلى I(3,2).
</div>

</div>' WHERE id = '3ccbf59a-e99b-4dd5-8020-aa74e1f4e582';


-- 13. الهرم ومخروط الدوران
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">الهرم ومخروط الدوران</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
الهرم والمخروط مجسّمان لهما رأس واحد وقاعدة واحدة. نجدهما في الأهرامات والمخاريط المرورية وغيرها.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">الهرم</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 تعريف:</strong><br>
<span style="color: #e74c3c; font-weight: bold;">الهرم</span> مجسّم له قاعدة مضلعة وأوجه جانبية مثلثية تلتقي في رأس واحد.<br><br>
• ارتفاع الهرم: المسافة بين الرأس والقاعدة (عموديّاً).
</div>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;">
<strong>حجم الهرم = (1/3) × مساحة القاعدة × الارتفاع</strong><br>
V = (1/3) × S × h
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">مخروط الدوران</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<span style="color: #e74c3c; font-weight: bold;">المخروط</span> هو المجسّم الناتج عن دوران مثلث قائم حول أحد ضلعيه القائمين.<br>
• القاعدة: دائرة نصف قطرها R<br>
• الارتفاع: h<br>
• الراسم (المائل): l حيث l² = R² + h²
</div>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;">
<strong>حجم المخروط = (1/3) × π × R² × h</strong><br><br>
<strong>المساحة الجانبية = π × R × l</strong>
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> هرم قاعدته مربع ضلعه 6 سم وارتفاعه 10 سم.<br>
مساحة القاعدة = 36 سم²<br>
الحجم = (1/3) × 36 × 10 = <strong>120 سم³</strong>
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> مخروط R = 3 سم و h = 4 سم.<br>
الحجم = (1/3) × 3.14 × 9 × 4 = <strong>37.68 سم³</strong><br>
l = √(9+16) = √25 = 5 سم
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> مخروط نصف قطر قاعدته 7 سم وراسمه 25 سم. أحسب ارتفاعه ثم حجمه.
</div>

</div>' WHERE id = '81e1c950-e22d-4ad6-84cf-9367f523d51f';
