-- =====================================================
-- MISE À JOUR DU CONTENU DES LEÇONS : 2ème CEM (12 leçons)
-- =====================================================

-- 1. العمليات على الأعداد
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">العمليات على الأعداد</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
في السنة الثانية متوسط نعمّق دراسة العمليات الأربع على الأعداد النسبية والعشرية، مع التركيز على أولويات العمليات.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">جمع وطرح الأعداد النسبية</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 القواعد:</strong><br>
• <strong>نفس الإشارة:</strong> نجمع القيم المطلقة ونضع الإشارة المشتركة.<br>
(+5) + (+3) = +8 ، (−5) + (−3) = −8<br><br>
• <strong>إشارتان مختلفتان:</strong> نطرح القيم المطلقة ونضع إشارة الأكبر.<br>
(+7) + (−4) = +3 ، (−9) + (+5) = −4
</div>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;">
<strong>طرح عدد = جمع مقابله</strong><br>
a − b = a + (−b)
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">ضرب وقسمة الأعداد النسبية</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 قاعدة الإشارات:</strong><br>
<table style="width: 80%; border-collapse: collapse; margin: 15px auto;">
<tr style="background: #2c3e50; color: white;"><th style="border: 1px solid #bdc3c7; padding: 10px;">×</th><th style="border: 1px solid #bdc3c7; padding: 10px;">+</th><th style="border: 1px solid #bdc3c7; padding: 10px;">−</th></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px; background: #ecf0f1; font-weight: bold;">+</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center; color: green; font-weight: bold;">+</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center; color: red; font-weight: bold;">−</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px; background: #ecf0f1; font-weight: bold;">−</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center; color: red; font-weight: bold;">−</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center; color: green; font-weight: bold;">+</td></tr>
</table>
نفس الإشارة ← (+) ، إشارتان مختلفتان ← (−)
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">أولويات العمليات</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; font-size: 1.1em;">
<strong>الترتيب من الأولوية الأعلى إلى الأدنى:</strong><br>
1. الأقواس ( )<br>
2. الضرب والقسمة (من اليسار إلى اليمين)<br>
3. الجمع والطرح (من اليسار إلى اليمين)
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> أحسب: 3 + 5 × 2 − (4 + 1)<br>
= 3 + 5 × 2 − 5 (نحسب القوس أولاً)<br>
= 3 + 10 − 5 (ثم الضرب)<br>
= <strong>8</strong>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 1:</strong> أحسب: (−3) × (+5) ، (−8) ÷ (−2) ، (−4) + (+7) − (−3)
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 2:</strong> أحسب مع احترام أولويات العمليات: 12 − 3 × (5 − 2) + 8 ÷ 4
</div>

</div>' WHERE id = 'dde807a2-bd34-4f07-ab75-e8fd93645c65';


-- 2. الكسور والعمليات عليها
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">الكسور والعمليات عليها</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
في السنة الثانية متوسط نتعلم إجراء العمليات الأربع على الكسور: الجمع، الطرح، الضرب، والقسمة.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">جمع وطرح الكسور</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;">
<strong>نفس المقام:</strong> a/n + b/n = (a+b)/n<br><br>
<strong>مقامان مختلفان:</strong> نوحّد المقامات أولاً ثم نجمع أو نطرح البسوط.
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال 1:</strong> 2/7 + 3/7 = 5/7<br><br>
📝 <strong>مثال 2:</strong> 1/3 + 1/4<br>
= 4/12 + 3/12 (المقام المشترك = 12)<br>
= <strong>7/12</strong>
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">ضرب الكسور</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;">
<strong>a/b × c/d = (a×c)/(b×d)</strong><br>
نضرب البسط في البسط والمقام في المقام
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> 3/4 × 2/5 = (3×2)/(4×5) = 6/20 = <strong>3/10</strong>
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">قسمة الكسور</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;">
<strong>a/b ÷ c/d = a/b × d/c</strong><br>
القسمة على كسر = الضرب في مقلوبه
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> 3/4 ÷ 2/5 = 3/4 × 5/2 = 15/8
</div>

<div style="background: #fdedec; border-right: 4px solid #e74c3c; padding: 15px; margin: 15px 0; border-radius: 6px;">
⚠️ <strong>ملاحظة مهمة:</strong><br>
• بسّط دائماً الناتج النهائي!<br>
• يمكن التبسيط قبل الضرب (تبسيط متقاطع).
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 1:</strong> أحسب وبسّط: 2/3 + 5/6 ، 7/8 − 1/4
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 2:</strong> أحسب: 5/6 × 3/10 ، 4/9 ÷ 2/3
</div>

</div>' WHERE id = 'e78c43a7-c254-4521-81f3-e4ccb73ccd93';


-- 3. الأعداد النسبية (2eme_cem)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">الأعداد النسبية</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
في السنة الثانية متوسط نعمّق دراسة الأعداد النسبية ونتعلم إجراء العمليات الأربع عليها، مع التطبيق على حل مشكلات.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">التمثيل على مستقيم مدرّج</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
على مستقيم مدرّج ذي مبدأ O ووحدة:<br>
• الأعداد الموجبة تقع يمين المبدأ<br>
• الأعداد السالبة تقع يسار المبدأ<br>
• <span style="color: #e74c3c; font-weight: bold;">فاصلة</span> نقطة (abscisse): العدد النسبي المقابل لها على المستقيم
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">العمليات على الأعداد النسبية</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>الجمع:</strong><br>
• (+3) + (+5) = +8<br>
• (−3) + (−5) = −8<br>
• (+7) + (−4) = +3<br>
• (−6) + (+2) = −4<br><br>
<strong>الضرب:</strong> جداء عددين لهما نفس الإشارة موجب، وجداء عددين مختلفي الإشارة سالب.<br>
• (−3) × (−4) = +12<br>
• (−5) × (+2) = −10
</div>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;">
<strong>المسافة بين عددين نسبيين a و b:</strong><br>
d(a, b) = |a − b|
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> المسافة بين (−3) و (+5):<br>
d = |(−3) − (+5)| = |−8| = <strong>8</strong>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> أحسب: (−7) + (+3) − (−5) × (+2)
</div>

</div>' WHERE id = '32666c0f-336b-4b9f-9f30-ae18b87857a3';


-- 4. مفهوم معادلة
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">مفهوم معادلة</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
المعادلة هي مساواة تحتوي على مجهول (عادة نرمز له بـ x). حلّ المعادلة هو إيجاد القيمة (أو القيم) التي تحقق هذه المساواة.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">تعريف</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 تعريف:</strong><br>
<span style="color: #e74c3c; font-weight: bold;">المعادلة</span> هي مساواة بين تعبيرين يحتوي أحدهما على الأقل على مجهول.<br><br>
مثال: 2x + 3 = 11 (معادلة من الدرجة الأولى بمجهول واحد)
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">حلّ معادلة من الدرجة الأولى</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; font-size: 1.1em;">
<strong>المبدأ:</strong> نعزل المجهول x في طرف والأعداد في الطرف الآخر.<br><br>
<strong>القواعد:</strong><br>
• يمكن جمع أو طرح نفس العدد من طرفي المعادلة.<br>
• يمكن ضرب أو قسمة طرفي المعادلة بنفس العدد (≠ 0).
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> حلّ المعادلة 3x + 5 = 20<br><br>
3x + 5 = 20<br>
3x = 20 − 5 (نطرح 5 من الطرفين)<br>
3x = 15<br>
x = 15 ÷ 3 (نقسم على 3)<br>
<strong>x = 5</strong><br><br>
التحقق: 3(5) + 5 = 15 + 5 = 20 ✅
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال 2:</strong> حلّ: 4x − 7 = 2x + 3<br>
4x − 2x = 3 + 7 (ننقل الحدود)<br>
2x = 10<br>
<strong>x = 5</strong>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 1:</strong> حلّ المعادلات: 5x − 3 = 12 ، 2x + 8 = 3x − 1
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 2:</strong> عدد إذا أضفنا إليه 7 ثم ضربنا الناتج في 3 حصلنا على 45. ما هو هذا العدد؟
</div>

</div>' WHERE id = '59457ba6-cea3-4790-85b3-a1ccf0446c7e';


-- 5. التناسبية (2eme_cem)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">التناسبية</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
في السنة الثانية متوسط نعمّق مفهوم التناسبية بدراسة النسبة المئوية، السلالم، والسرعة المتوسطة.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">النسبة المئوية</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 تعريف:</strong><br>
<span style="color: #e74c3c; font-weight: bold;">النسبة المئوية</span> تعني "من أصل 100". نكتبها بالرمز %.<br><br>
25% = 25/100 = 0.25
</div>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;">
<strong>حساب t% من عدد N:</strong><br>
N × t/100
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> ما هو 30% من 500 دج؟<br>
500 × 30/100 = 500 × 0.3 = <strong>150 دج</strong>
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">السلّم (مقياس الخريطة)</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 تعريف:</strong><br>
<span style="color: #e74c3c; font-weight: bold;">سلّم خريطة أو تصميم</span> هو النسبة بين المسافة على الخريطة والمسافة الحقيقية.
</div>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;">
<strong>السلّم = المسافة على الخريطة ÷ المسافة الحقيقية</strong>
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> خريطة بسلّم 1/200000. مسافة 3 سم على الخريطة تمثّل:<br>
3 × 200000 = 600000 سم = 6000 م = <strong>6 كم</strong>
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">السرعة المتوسطة</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;">
<strong>السرعة = المسافة ÷ الزمن</strong><br>
v = d / t
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 1:</strong> ثمن جهاز 15000 دج. خصم 20%. أحسب الثمن بعد الخصم.
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 2:</strong> سيارة قطعت 360 كم في 4 ساعات. ما سرعتها المتوسطة؟
</div>

</div>' WHERE id = 'd4303c02-0d98-4819-9ca8-b435ba7b3945';


-- 6. تنظيم معطيات (2eme_cem)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">تنظيم معطيات</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
في السنة الثانية متوسط نتعلم قراءة وإنشاء مخططات بيانية متنوعة وحساب التكرارات والتكرارات النسبية.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">التكرار والتكرار النسبي</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
• <strong>التكرار (effectif):</strong> عدد مرات ظهور قيمة ما.<br>
• <strong>التكرار النسبي (fréquence):</strong> = التكرار ÷ العدد الإجمالي<br>
• <strong>مجموع التكرارات النسبية = 1 (أو 100%)</strong>
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> في امتحان، حصل 30 تلميذاً على العلامات التالية:<br>
<table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
<tr style="background: #2c3e50; color: white;"><th style="border: 1px solid #bdc3c7; padding: 8px;">العلامة</th><th style="border: 1px solid #bdc3c7; padding: 8px;">10</th><th style="border: 1px solid #bdc3c7; padding: 8px;">12</th><th style="border: 1px solid #bdc3c7; padding: 8px;">14</th><th style="border: 1px solid #bdc3c7; padding: 8px;">16</th><th style="border: 1px solid #bdc3c7; padding: 8px;">18</th></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 8px;">التكرار</td><td style="border: 1px solid #bdc3c7; padding: 8px; text-align: center;">5</td><td style="border: 1px solid #bdc3c7; padding: 8px; text-align: center;">8</td><td style="border: 1px solid #bdc3c7; padding: 8px; text-align: center;">10</td><td style="border: 1px solid #bdc3c7; padding: 8px; text-align: center;">4</td><td style="border: 1px solid #bdc3c7; padding: 8px; text-align: center;">3</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 8px;">التكرار النسبي</td><td style="border: 1px solid #bdc3c7; padding: 8px; text-align: center;">5/30</td><td style="border: 1px solid #bdc3c7; padding: 8px; text-align: center;">8/30</td><td style="border: 1px solid #bdc3c7; padding: 8px; text-align: center;">10/30</td><td style="border: 1px solid #bdc3c7; padding: 8px; text-align: center;">4/30</td><td style="border: 1px solid #bdc3c7; padding: 8px; text-align: center;">3/30</td></tr>
</table>
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">أنواع المخططات</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
• <strong>مخطط بالأعمدة:</strong> للقيم المنفصلة<br>
• <strong>مخطط دائري:</strong> لإظهار النسب<br>
• <strong>مخطط خطي:</strong> لإظهار التطور عبر الزمن
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> في قسم 40 تلميذاً: 15 تفوقوا بامتياز، 10 بجيد، 10 بمقبول، و5 لم ينجحوا. أنشئ جدول التكرارات والتكرارات النسبية بالنسب المئوية.
</div>

</div>' WHERE id = '205e0a50-13f6-4ace-aec8-efb80247576c';


-- 7. إنشاء أشكال هندسية
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">إنشاء أشكال هندسية</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
الإنشاء الهندسي يعتمد على استعمال الأدوات (المسطرة، الفرجار، المنقلة، المدور) بشكل دقيق. في هذا الدرس نتعلم إنشاء أشكال هندسية أساسية.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">إنشاء المنصّف</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 تعريف:</strong><br>
<span style="color: #e74c3c; font-weight: bold;">منصّف زاوية</span> هو نصف المستقيم الذي يقسم الزاوية إلى زاويتين متساويتين.<br><br>
<strong>طريقة الإنشاء بالفرجار:</strong><br>
1. بالفرجار من الرأس نرسم قوساً يقطع ضلعي الزاوية في نقطتين A و B.<br>
2. بنفس فتحة الفرجار من A و B نرسم قوسين يتقاطعان في C.<br>
3. المستقيم الذي يمر من الرأس و C هو المنصّف.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">إنشاء المتوسط العمودي</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 تعريف:</strong><br>
<span style="color: #e74c3c; font-weight: bold;">المتوسط العمودي</span> لقطعة مستقيم [AB] هو المستقيم المتعامد مع [AB] والمار من منتصفها.<br><br>
<strong>خاصية:</strong> كل نقطة من المتوسط العمودي لـ [AB] تبعد بُعداً متساوياً عن A و B.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">إنشاء مثلث</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
لإنشاء مثلث معروفة أطوال أضلاعه (a, b, c):<br>
1. نرسم ضلعاً (مثلاً [BC] = a) بالمسطرة.<br>
2. بالفرجار من B بفتحة = c نرسم قوساً.<br>
3. بالفرجار من C بفتحة = b نرسم قوساً.<br>
4. تقاطع القوسين هو النقطة A.
</div>

<div style="background: #fdedec; border-right: 4px solid #e74c3c; padding: 15px; margin: 15px 0; border-radius: 6px;">
⚠️ <strong>متراجحة المثلث:</strong><br>
لا يمكن إنشاء مثلث إلا إذا كان كل ضلع أصغر من مجموع الضلعين الآخرين.
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> أنشئ مثلث ABC حيث BC = 6 سم، AB = 4 سم، AC = 5 سم. ثم أنشئ منصفات زواياه. ماذا تلاحظ؟
</div>

</div>' WHERE id = '3cb2fc4a-2496-47ab-978d-7690b33de39f';


-- 8. التناظر المركزي
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">التناظر المركزي</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
التناظر المركزي هو تحويل هندسي مرتبط بنقطة (مركز التناظر). نراه في الحياة اليومية: حرف S، علامات الطريق، تصاميم الزليج...
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">تعريف</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 تعريف:</strong><br>
نظير النقطة A بالنسبة لنقطة O (المركز) هي النقطة A'' بحيث يكون O هو <span style="color: #e74c3c; font-weight: bold;">منتصف</span> القطعة [AA''].<br><br>
أي أن: OA = OA'' والنقاط A و O و A'' على استقامة واحدة.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">خصائص التناظر المركزي</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
التناظر المركزي <strong>يحفظ</strong>:<br>
• الأطوال (المسافات)<br>
• الزوايا<br>
• التوازي<br>
• المساحات<br><br>
<strong>يحوّل</strong>:<br>
• مستقيماً إلى مستقيم موازٍ له<br>
• قطعة مستقيم إلى قطعة مستقيم لها نفس الطول<br>
• دائرة إلى دائرة لها نفس نصف القطر
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> لإيجاد نظير النقطة A(2, 3) بالنسبة للمبدأ O(0, 0):<br>
A''(−2, −3) (نغيّر إشارة الفاصلة والترتيبة)
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">مركز تناظر شكل</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
شكل له <strong>مركز تناظر</strong> إذا كان نظيره بالنسبة لهذا المركز هو نفسه.<br>
• متوازي الأضلاع: مركز تناظره هو نقطة تقاطع قطريه.<br>
• الدائرة: مركز تناظرها هو مركزها.
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> ارسم مثلثاً ABC وحدد نقطة O. أنشئ نظير المثلث بالنسبة للنقطة O.
</div>

</div>' WHERE id = '8145834a-cbda-44a6-9541-922a3e182883';


-- 9. الزوايا والتوازي
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">الزوايا والتوازي</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
عندما يقطع مستقيم مستقيمين متوازيين تتشكّل زوايا لها خصائص مهمة. هذه الخصائص أساسية في البرهان الهندسي.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">الزوايا المتشكّلة بين مستقيمين وقاطع</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
عندما يقطع مستقيم (Δ) مستقيمين (d₁) و (d₂) تتشكّل 8 زوايا. نميّز:<br><br>
• <strong>زاويتان متبادلتان داخلياً:</strong> على جانبين مختلفين من القاطع وبين المستقيمين.<br>
• <strong>زاويتان متناظرتان:</strong> على نفس الجانب من القاطع وفي نفس الموضع بالنسبة لكل مستقيم.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">خصائص التوازي والزوايا</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; font-size: 1.1em;">
<strong>إذا كان (d₁) // (d₂):</strong><br>
• الزاويتان المتبادلتان داخلياً <strong>متساويتان</strong>.<br>
• الزاويتان المتناظرتان <strong>متساويتان</strong>.<br><br>
<strong>والعكس صحيح:</strong><br>
إذا كانت زاويتان متبادلتان داخلياً (أو متناظرتان) متساويتين، فالمستقيمان متوازيان.
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> مستقيمان متوازيان يقطعهما قاطع. إذا كانت إحدى الزوايا = 65°:<br>
• الزاوية المتناظرة = 65°<br>
• الزاوية المتبادلة داخلياً = 65°<br>
• الزاوية المكملة لها في نفس النقطة = 180° − 65° = 115°
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> مستقيمان (d₁) و (d₂) يقطعهما قاطع. الزاويتان المتبادلتان داخلياً = 72° و 72°. ماذا تستنتج عن (d₁) و (d₂)؟
</div>

</div>' WHERE id = '26ffabb6-ed50-44ab-a590-7ce0fdf7fbb2';


-- 10. المثلثات والدائرة
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">المثلثات والدائرة</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
في هذا الدرس ندرس العلاقة بين المثلثات والدائرة: الدائرة المحيطة، الدائرة المحصورة، وخصائص الوتر والقطر.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">المستقيمات الخاصة في المثلث</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
• <strong>المتوسط:</strong> قطعة مستقيم تربط رأساً بمنتصف الضلع المقابل. تتقاطع المتوسطات في نقطة واحدة (مركز الثقل).<br>
• <strong>الارتفاع:</strong> مستقيم يمر من رأس ويكون متعامداً مع الضلع المقابل.<br>
• <strong>المنصّف:</strong> نصف مستقيم يقسم زاوية إلى زاويتين متساويتين.<br>
• <strong>المتوسط العمودي:</strong> المستقيم المتعامد مع ضلع من منتصفه.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">الدائرة المحيطة بمثلث</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;">
<strong>المتوسطات العمودية لأضلاع مثلث تتقاطع في نقطة واحدة هي مركز الدائرة المحيطة بالمثلث.</strong>
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>خاصية مهمة:</strong><br>
إذا كانت زاوية في مثلث = 90° (مثلث قائم)، فإن الوتر هو قطر الدائرة المحيطة بالمثلث.<br>
والعكس: إذا كان أحد أضلاع مثلث مسجّل في دائرة هو قطر هذه الدائرة، فالمثلث قائم.
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> أنشئ مثلث ABC حيث AB = 6 سم، AC = 5 سم، BC = 4 سم. أنشئ المتوسطات العمودية لأضلاعه وحدد مركز الدائرة المحيطة. ارسم هذه الدائرة.
</div>

</div>' WHERE id = 'edb70baa-a10d-4799-947f-059ad94ae185';


-- 11. متوازي الأضلاع
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">متوازي الأضلاع</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
متوازي الأضلاع هو رباعي خاص له خصائص مميزة تتعلق بأضلاعه، أقطاره، وزواياه.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">تعريف وخصائص</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 تعريف:</strong><br>
<span style="color: #e74c3c; font-weight: bold;">متوازي الأضلاع</span> هو رباعي أضلاعه المتقابلة متوازية.<br><br>
<strong>الخصائص:</strong><br>
• الأضلاع المتقابلة متساوية ومتوازية.<br>
• الزوايا المتقابلة متساوية.<br>
• الزاويتان المتتاليتان متكاملتان (مجموعهما = 180°).<br>
• القُطران ينصّف كل منهما الآخر (يتقاطعان في منتصفيهما).
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">الحالات الخاصة</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
<tr style="background: #2c3e50; color: white;"><th style="border: 1px solid #bdc3c7; padding: 10px;">الشكل</th><th style="border: 1px solid #bdc3c7; padding: 10px;">الشرط الإضافي</th></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px;"><strong>المستطيل</strong></td><td style="border: 1px solid #bdc3c7; padding: 10px;">متوازي أضلاع + زاوية قائمة</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px;"><strong>المعين</strong></td><td style="border: 1px solid #bdc3c7; padding: 10px;">متوازي أضلاع + ضلعان متتاليان متساويان</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px;"><strong>المربع</strong></td><td style="border: 1px solid #bdc3c7; padding: 10px;">متوازي أضلاع + زاوية قائمة + ضلعان متتاليان متساويان</td></tr>
</table>
</div>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;">
<strong>مساحة متوازي الأضلاع = القاعدة × الارتفاع</strong>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> ABCD متوازي أضلاع حيث AB = 8 سم و BC = 5 سم والزاوية A = 60°. أحسب الزوايا الأخرى. أنشئ هذا الشكل.
</div>

</div>' WHERE id = 'cd6bc7b1-6de6-47a1-91b6-2998ad50d054';


-- 12. الموشور القائم وأسطوانة الدوران
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">الموشور القائم وأسطوانة الدوران</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
الموشور القائم والأسطوانة مجسّمان نصادفهما كثيراً: علبة عصير (موشور)، علبة حليب (أسطوانة)...
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">الموشور القائم</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 تعريف:</strong><br>
<span style="color: #e74c3c; font-weight: bold;">الموشور القائم</span> هو مجسّم له قاعدتان متطابقتان (مضلعان) وأوجهه الجانبية مستطيلات.<br><br>
• <strong>القاعدة:</strong> يمكن أن تكون مثلثاً أو رباعياً أو أي مضلع.<br>
• <strong>الارتفاع h:</strong> المسافة بين القاعدتين.
</div>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;">
<strong>حجم الموشور = مساحة القاعدة × الارتفاع</strong><br>
V = S<sub>base</sub> × h<br><br>
<strong>المساحة الجانبية = محيط القاعدة × الارتفاع</strong>
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">أسطوانة الدوران</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 تعريف:</strong><br>
<span style="color: #e74c3c; font-weight: bold;">الأسطوانة</span> مجسّم قاعدتاه دائرتان متطابقتان وسطحه الجانبي مستطيل (عند النشر).
</div>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;">
<strong>حجم الأسطوانة = π × R² × h</strong><br><br>
<strong>المساحة الجانبية = 2π × R × h</strong><br>
<strong>المساحة الكلية = 2πRh + 2πR²</strong>
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> أسطوانة نصف قطر قاعدتها R = 5 سم وارتفاعها h = 10 سم (π ≈ 3.14)<br>
الحجم = 3.14 × 25 × 10 = <strong>785 سم³</strong><br>
المساحة الجانبية = 2 × 3.14 × 5 × 10 = <strong>314 سم²</strong>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> موشور قائم قاعدته مثلث قائم فيه الضلعان القائمان 3 سم و 4 سم والارتفاع 10 سم. أحسب حجمه ومساحته الكلية.
</div>

</div>' WHERE id = '73a375f3-14da-41bd-bad5-41ef47ce3f57';
