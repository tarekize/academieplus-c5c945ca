-- =====================================================
-- MISE À JOUR DU CONTENU DES LEÇONS : 4ème CEM (14 leçons)
-- =====================================================

-- 1. الأعداد الطبيعية والناطقة
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">الأعداد الطبيعية والأعداد الناطقة</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
في السنة الرابعة متوسط نراجع مجموعات الأعداد ونتعرّف على الأعداد الناطقة وغير الناطقة استعداداً لامتحان شهادة التعليم المتوسط (BEM).
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">مجموعات الأعداد</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
• <strong>ℕ</strong>: الأعداد الطبيعية {0, 1, 2, 3, ...}<br>
• <strong>ℤ</strong>: الأعداد الصحيحة {..., −2, −1, 0, 1, 2, ...}<br>
• <strong>ℚ</strong>: الأعداد الناطقة (التي يمكن كتابتها على شكل a/b حيث b ≠ 0)<br>
• <strong>ℝ</strong>: الأعداد الحقيقية (تشمل الناطقة وغير الناطقة)<br><br>
<span style="color: #e74c3c; font-weight: bold;">ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ</span>
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">الأعداد الناطقة وغير الناطقة</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
• <strong>عدد ناطق:</strong> يمكن كتابته على شكل كسر a/b. كتابته العشرية منتهية أو دورية.<br>
مثل: 1/3 = 0.333... ، 7/4 = 1.75<br><br>
• <strong>عدد غير ناطق:</strong> لا يمكن كتابته على شكل كسر. كتابته العشرية لا منتهية وغير دورية.<br>
مثل: √2 = 1.41421356... ، π = 3.14159265...
</div>

<div style="background: #fdedec; border-right: 4px solid #e74c3c; padding: 15px; margin: 15px 0; border-radius: 6px;">
⚠️ <strong>ملاحظة:</strong> √n عدد غير ناطق إذا لم يكن n مربعاً كاملاً.
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> صنّف الأعداد التالية (ناطق/غير ناطق): √9 ، √5 ، 0.75 ، π ، −3/7 ، √16/4
</div>

</div>' WHERE id = 'bad4f492-ed35-4563-ae09-65581b88944f';


-- 2. الحساب على الجذور التربيعية
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">الحساب على الجذور التربيعية</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
الجذر التربيعي لعدد موجب a هو العدد الموجب الذي مربعه يساوي a. العمليات على الجذور التربيعية ضرورية في الحساب والهندسة.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">تعريف وخصائص</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; font-size: 1.1em;">
<strong>√a معرّف فقط إذا كان a ≥ 0</strong><br><br>
• (√a)² = a<br>
• √(a²) = |a| (القيمة المطلقة لـ a)<br>
• √(a × b) = √a × √b (a ≥ 0 و b ≥ 0)<br>
• √(a/b) = √a / √b (a ≥ 0 و b &gt; 0)
</div>

<div style="background: #fdedec; border-right: 4px solid #e74c3c; padding: 15px; margin: 15px 0; border-radius: 6px;">
⚠️ <strong>انتبه!</strong> √(a + b) ≠ √a + √b (خطأ شائع!)
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">تبسيط الجذور</h3>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>أمثلة:</strong><br>
• √50 = √(25 × 2) = 5√2<br>
• √72 = √(36 × 2) = 6√2<br>
• √12 = √(4 × 3) = 2√3<br>
• 3√2 + 5√2 = 8√2<br>
• √2 × √8 = √16 = 4
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">تنطيق المقام</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;">
<strong>a/√b = (a × √b)/b</strong> (نضرب البسط والمقام في √b)
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> 6/√3 = (6 × √3)/(√3 × √3) = 6√3/3 = <strong>2√3</strong>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 1:</strong> بسّط: √75 ، √200 ، √48 + √27
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 2:</strong> نطّق المقام: 4/√2 ، 10/√5 ، 6/(2√3)
</div>

</div>' WHERE id = '5c8a7a48-6713-4a95-b754-142ed809ab38';


-- 3. الحساب الحرفي (4eme_cem)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">الحساب الحرفي — المتطابقات والتحليل</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
في السنة الرابعة متوسط نُعمّق استعمال المتطابقات الشهيرة في النشر والتحليل مع تطبيقات على تبسيط كسور حرفية.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">المتطابقات الشهيرة</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; font-size: 1.2em; text-align: center;">
<strong>(a + b)² = a² + 2ab + b²</strong><br>
<strong>(a − b)² = a² − 2ab + b²</strong><br>
<strong>(a + b)(a − b) = a² − b²</strong>
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>أمثلة نشر:</strong><br>
(3x + 5)² = 9x² + 30x + 25<br>
(2x − √3)² = 4x² − 4√3 x + 3<br>
(x + 7)(x − 7) = x² − 49
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">التحليل المركّب</h3>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> حلّل E = (2x + 1)² − (x − 3)²<br>
= [(2x+1) + (x−3)] × [(2x+1) − (x−3)]<br>
= [3x − 2] × [x + 4]<br>
= <strong>(3x − 2)(x + 4)</strong>
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">تبسيط كسور حرفية</h3>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> بسّط: (x² − 9)/(x + 3)<br>
= (x+3)(x−3)/(x+3) = <strong>x − 3</strong> (بشرط x ≠ −3)
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 1:</strong> انشر وبسّط: (x + √2)² − (x − √2)²
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 2:</strong> حلّل: 4x² − 20x + 25 ، x³ − x
</div>

</div>' WHERE id = '5dda33a2-44c2-47c6-8c49-5e356899445b';


-- 4. المعادلات والمتراجحات من الدرجة الأولى
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">المعادلات والمتراجحات من الدرجة الأولى</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
في السنة الرابعة متوسط نتعمّق في حل المعادلات والمتراجحات مع تطبيقات على مسائل متنوعة.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">المعادلة ax + b = 0</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;">
<strong>ax + b = 0 ⟹ x = −b/a حيث a ≠ 0</strong>
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">معادلة الجداء المعدوم</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; font-size: 1.1em;">
<strong>إذا كان A × B = 0 فإن A = 0 أو B = 0</strong>
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> حلّ: (2x − 6)(x + 4) = 0<br>
إما 2x − 6 = 0 ← x = 3<br>
أو x + 4 = 0 ← x = −4<br>
<strong>الحلّان: x = 3 أو x = −4</strong>
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">المتراجحة ax + b &lt; 0 (أو &gt; أو ≤ أو ≥)</h3>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> حلّ: 3x − 9 ≥ 0<br>
3x ≥ 9<br>
x ≥ 3<br>
<strong>مجموعة الحلول: [3 , +∞)</strong>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 1:</strong> حلّ: (3x + 6)(2x − 10) = 0
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 2:</strong> حلّ ومثّل على مستقيم: −5x + 15 &gt; 0
</div>

</div>' WHERE id = '1f9beab0-8cf4-44da-9f91-d22dc53522af';


-- 5. جمل معادلتين من الدرجة الأولى بمجهولين
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">جمل معادلتين من الدرجة الأولى بمجهولين</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
جملة معادلتين بمجهولين هي مسألة نبحث فيها عن قيمتين لمجهولين يحققان معادلتين في الوقت نفسه.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">طريقة التعويض</h3>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> حلّ الجملة:<br>
{ x + y = 10<br>
{ 2x − y = 5<br><br>
من المعادلة الأولى: y = 10 − x<br>
نعوّض في الثانية: 2x − (10 − x) = 5<br>
3x − 10 = 5 ← 3x = 15 ← <strong>x = 5</strong><br>
y = 10 − 5 = <strong>5</strong><br>
الحل: <strong>(5, 5)</strong>
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">طريقة الجمع</h3>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> حلّ الجملة:<br>
{ 3x + 2y = 12<br>
{ x − 2y = 0<br><br>
بالجمع: 3x + 2y + x − 2y = 12 + 0<br>
4x = 12 ← <strong>x = 3</strong><br>
من المعادلة الثانية: 3 − 2y = 0 ← y = <strong>3/2</strong>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 1:</strong> حلّ بالتعويض: { 2x + y = 7 ، x − y = 2
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 2:</strong> مجموع عددين 42 وفرقهما 8. أوجدهما.
</div>

</div>' WHERE id = '5e4f674d-d0b5-4039-b2f5-163967ef3a5c';


-- 6. الدالة الخطية
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">الدالة الخطية</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
الدالة الخطية تعبّر عن وضعية تناسبية. هي أبسط أنواع الدوال وتمثيلها البياني مستقيم يمر من المبدأ.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">تعريف</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;">
<strong>f(x) = ax</strong><br>
حيث a عدد حقيقي ثابت يسمى <strong>معامل التناسبية</strong> أو <strong>الميل</strong>.
</div>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
• f(0) = 0 دائماً (المستقيم يمر من المبدأ O)<br>
• a = f(x)/x لكل x ≠ 0
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> f(x) = 3x<br>
f(1) = 3 ، f(2) = 6 ، f(−1) = −3<br>
التمثيل: مستقيم يمر من O(0,0) و من النقطة (1, 3)
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> مثّل بيانياً الدالة f(x) = −2x. حدد f(3) و أوجد x إذا كان f(x) = 8.
</div>

</div>' WHERE id = '2ff765c8-1a56-4441-8a70-08cb10f86750';


-- 7. الدالة التآلفية
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">الدالة التآلفية</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
الدالة التآلفية هي تعميم للدالة الخطية. تمثيلها مستقيم لا يمر بالضرورة من المبدأ.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">تعريف</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;">
<strong>f(x) = ax + b</strong><br>
• <strong>a</strong>: معامل التوجيه (الميل)<br>
• <strong>b</strong>: الترتيب عند المبدأ (f(0) = b)
</div>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
• إذا كان b = 0 ← الدالة خطية (حالة خاصة)<br>
• إذا كان a = 0 ← الدالة ثابتة f(x) = b<br>
• <strong>الميل:</strong> a = [f(x₂) − f(x₁)]/(x₂ − x₁)
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> f(x) = 2x − 3<br>
a = 2 (الميل) ، b = −3 (الترتيب عند المبدأ)<br>
f(0) = −3 ، f(1) = −1 ، f(2) = 1<br>
المستقيم يمر من (0, −3) و (1, −1)
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> حدد a و b للدالة التآلفية التي يمر تمثيلها من النقطتين A(1, 5) و B(3, 9). مثّلها بيانياً.
</div>

</div>' WHERE id = 'eb04fbf2-b7cc-4bc4-ae12-186605f05f1b';


-- 8. الإحصاء (4eme_cem)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">الإحصاء</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
في السنة الرابعة متوسط نتعلم حساب المتوسط الحسابي الموزون والمدى وقراءة المخططات البيانية المتنوعة.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">المؤشرات الإحصائية</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; font-size: 1.1em;">
<strong>المتوسط الحسابي الموزون:</strong> x̄ = Σ(xᵢ × nᵢ) / N<br><br>
<strong>المدى (étendue):</strong> = أكبر قيمة − أصغر قيمة<br><br>
<strong>المنوال:</strong> القيمة الأكثر تكراراً
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong><br>
<table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
<tr style="background: #2c3e50; color: white;"><th style="border: 1px solid #bdc3c7; padding: 8px;">العلامة xᵢ</th><th style="border: 1px solid #bdc3c7; padding: 8px;">8</th><th style="border: 1px solid #bdc3c7; padding: 8px;">10</th><th style="border: 1px solid #bdc3c7; padding: 8px;">12</th><th style="border: 1px solid #bdc3c7; padding: 8px;">15</th><th style="border: 1px solid #bdc3c7; padding: 8px;">18</th></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 8px;">التكرار nᵢ</td><td style="border: 1px solid #bdc3c7; padding: 8px; text-align: center;">4</td><td style="border: 1px solid #bdc3c7; padding: 8px; text-align: center;">6</td><td style="border: 1px solid #bdc3c7; padding: 8px; text-align: center;">10</td><td style="border: 1px solid #bdc3c7; padding: 8px; text-align: center;">7</td><td style="border: 1px solid #bdc3c7; padding: 8px; text-align: center;">3</td></tr>
</table>
x̄ = (8×4 + 10×6 + 12×10 + 15×7 + 18×3) ÷ 30 = (32+60+120+105+54)/30 = 371/30 ≈ <strong>12.37</strong><br>
المدى = 18 − 8 = <strong>10</strong> ، المنوال = <strong>12</strong>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> في مسابقة رياضية: 5 متسابقين حصلوا على 60 نقطة، 8 على 70 نقطة، 12 على 80 نقطة، 5 على 90 نقطة. أحسب المتوسط والمنوال والمدى.
</div>

</div>' WHERE id = '6a744a67-4ebe-4861-af8d-0f9d685ee893';


-- 9. خاصية طالس
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">خاصية طالس</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
خاصية طالس (Thalès) من أهم خصائص الهندسة المستوية. تُستعمل لحساب أطوال مجهولة عندما يقطع مستقيمان متوازيان ضلعي زاوية.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">نصّ الخاصية</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; font-size: 1.1em;">
<strong>خاصية طالس:</strong><br>
إذا كان (MN) // (BC) حيث M ∈ [AB) و N ∈ [AC) فإن:<br><br>
<strong>AM/AB = AN/AC = MN/BC</strong>
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> في مثلث ABC: M نقطة من [AB] و N نقطة من [AC] حيث (MN) // (BC).<br>
AM = 3 ، AB = 9 ، AN = 2 ، BC = 12<br><br>
AM/AB = 3/9 = 1/3<br>
AC = AN × AB/AM = 2 × 9/3 = <strong>6</strong><br>
MN = BC × AM/AB = 12 × 1/3 = <strong>4</strong>
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">الخاصية العكسية</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
إذا كانت النسب AM/AB = AN/AC متساوية والنقاط مرتبة بنفس الطريقة، فإن (MN) // (BC).
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> ABC مثلث حيث AB = 10 سم، AC = 8 سم، BC = 6 سم. M منتصف [AB]. (MN) // (BC). أحسب MN و AN.
</div>

</div>' WHERE id = 'a1557836-267f-4240-a449-c6a5556de812';


-- 10. حساب المثلثات (النسب المثلثية)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">حساب المثلثات — النسب المثلثية</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
النسب المثلثية (جيب التمام، الجيب، المماس) تربط بين زوايا وأضلاع المثلث القائم. تُستعمل لحساب أطوال وزوايا مجهولة.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">النسب المثلثية في مثلث قائم</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; font-size: 1.2em; text-align: center;">
في مثلث ABC قائم في A:<br><br>
<strong>cos B = الضلع المجاور / الوتر = AB/BC</strong><br>
<strong>sin B = الضلع المقابل / الوتر = AC/BC</strong><br>
<strong>tan B = الضلع المقابل / الضلع المجاور = AC/AB</strong>
</div>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.1em;">
<strong>خاصية أساسية:</strong> cos²B + sin²B = 1<br>
<strong>و:</strong> tan B = sin B / cos B
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال (حساب طول):</strong> ABC مثلث قائم في A، BC = 10 سم، الزاوية B = 30°.<br>
AC = BC × sin B = 10 × sin 30° = 10 × 0.5 = <strong>5 سم</strong><br>
AB = BC × cos B = 10 × cos 30° = 10 × 0.866 ≈ <strong>8.66 سم</strong>
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال (حساب زاوية):</strong> ABC مثلث قائم في A، AB = 4 سم، BC = 5 سم.<br>
cos B = 4/5 = 0.8<br>
B = cos⁻¹(0.8) ≈ <strong>36.87°</strong>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> سلّم طوله 5 م يستند على جدار. أسفل السلم يبعد 3 م عن قاعدة الجدار. أحسب ارتفاع أعلى السلم والزاوية التي يشكّلها مع الأرض.
</div>

</div>' WHERE id = 'cea0d7c8-57c0-439b-b55e-5751b134cac4';


-- 11. الأشعة والانسحاب
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">الأشعة والانسحاب</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
الشعاع (vecteur) هو كائن رياضي يتميز باتجاه ومنحى وطول (معيار). الأشعة مرتبطة ارتباطاً وثيقاً بالانسحاب.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">تعريف الشعاع</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<span style="color: #e74c3c; font-weight: bold;">الشعاع AB</span> (يكتب بسهم فوقه) يتميز بـ:<br>
• <strong>الاتجاه:</strong> اتجاه المستقيم (AB)<br>
• <strong>المنحى:</strong> من A نحو B<br>
• <strong>المعيار (الطول):</strong> المسافة AB
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">تساوي شعاعين</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; font-size: 1.1em;">
<strong>الشعاع AB = الشعاع CD</strong> إذا وفقط إذا كان ABDC متوازي أضلاع.<br>
(نفس الاتجاه، نفس المنحى، نفس المعيار)
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">مجموع شعاعين</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>علاقة شال:</strong> الشعاع AB + الشعاع BC = الشعاع AC
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> ABCD متوازي أضلاع. أثبت أن: الشعاع AB + الشعاع AD = الشعاع AC.
</div>

</div>' WHERE id = 'b797ca0c-1110-4867-ba7a-4d5e8f7feb14';


-- 12. الأشعة في المعلم
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">الأشعة في المعلم</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
في معلم متعامد ومتجانس نتعامل مع الأشعة عبر إحداثياتها. هذا يسهّل العمليات الحسابية عليها.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">إحداثيات شعاع</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; font-size: 1.1em;">
إذا كان A(xₐ, yₐ) و B(x_b, y_b) فإن:<br>
<strong>الشعاع AB له الإحداثيات (x_b − xₐ , y_b − yₐ)</strong>
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">العمليات على إحداثيات الأشعة</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
إذا كان u(x₁, y₁) و v(x₂, y₂):<br>
• <strong>المجموع:</strong> u + v = (x₁+x₂ , y₁+y₂)<br>
• <strong>الضرب بعدد:</strong> ku = (kx₁ , ky₁)<br>
• <strong>المعيار:</strong> ||u|| = √(x₁² + y₁²)
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> A(1, 3) و B(4, 7)<br>
الشعاع AB = (4−1, 7−3) = (3, 4)<br>
||AB|| = √(9+16) = √25 = <strong>5</strong>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> A(2, −1) و B(5, 3) و C(−1, 2). أحسب إحداثيات الشعاعين AB و AC ثم أثبت أن ABDC متوازي أضلاع حيث D(2, 6).
</div>

</div>' WHERE id = '90bc8d6b-77d5-4a48-83d4-8b871e06a771';


-- 13. الدوران والمضلعات المنتظمة
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">الدوران والمضلعات المنتظمة</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
الدوران تحويل هندسي يدوّر كل نقطة حول مركز ثابت بزاوية محددة. المضلعات المنتظمة ترتبط ارتباطاً وثيقاً بالدوران.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">تعريف الدوران</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<span style="color: #e74c3c; font-weight: bold;">الدوران</span> بمركز O وزاوية α يحوّل كل نقطة M إلى نقطة M'' بحيث:<br>
• OM'' = OM (نفس المسافة من المركز)<br>
• الزاوية MOM'' = α<br>
• اتجاه الدوران محدد (موجب = عكس عقارب الساعة)
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">خصائص الدوران</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
الدوران يحفظ: الأطوال، الزوايا، التوازي، المساحات.<br>
• صورة مستقيم: مستقيم<br>
• صورة دائرة: دائرة بنفس نصف القطر
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">المضلعات المنتظمة</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<span style="color: #e74c3c; font-weight: bold;">المضلع المنتظم</span> ذو n ضلعاً: أضلاعه متساوية وزواياه متساوية.<br>
• يُنشأ بتقسيم الدائرة إلى n أقواس متساوية.<br>
• زاوية الدوران = 360°/n
</div>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; font-size: 1.1em;">
<table style="width: 80%; border-collapse: collapse; margin: 0 auto;">
<tr style="background: #2c3e50; color: white;"><th style="border: 1px solid #bdc3c7; padding: 8px;">المضلع</th><th style="border: 1px solid #bdc3c7; padding: 8px;">n</th><th style="border: 1px solid #bdc3c7; padding: 8px;">زاوية الدوران</th></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 8px;">مثلث متساوي الأضلاع</td><td style="border: 1px solid #bdc3c7; padding: 8px; text-align: center;">3</td><td style="border: 1px solid #bdc3c7; padding: 8px; text-align: center;">120°</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 8px;">مربع</td><td style="border: 1px solid #bdc3c7; padding: 8px; text-align: center;">4</td><td style="border: 1px solid #bdc3c7; padding: 8px; text-align: center;">90°</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 8px;">سداسي منتظم</td><td style="border: 1px solid #bdc3c7; padding: 8px; text-align: center;">6</td><td style="border: 1px solid #bdc3c7; padding: 8px; text-align: center;">60°</td></tr>
</table>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> أنشئ سداسياً منتظماً مسجّلاً في دائرة نصف قطرها 4 سم.
</div>

</div>' WHERE id = '67cfe631-6901-4d53-b80b-aae15f187cbb';


-- 14. الهندسة في الفضاء (4eme_cem)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">الهندسة في الفضاء — الكرة</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
في السنة الرابعة متوسط نراجع المجسّمات السابقة ونتعرّف على الكرة كمجسّم جديد مع صيغ حجمها ومساحتها.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">الكرة</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<span style="color: #e74c3c; font-weight: bold;">الكرة</span> بمركز O ونصف قطر R هي مجموعة النقاط التي تبعد عن O بمسافة تساوي R أو أقل.<br>
<strong>السطح الكروي:</strong> مجموعة النقاط التي تبعد عن O بمسافة تساوي R بالضبط.
</div>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;">
<strong>حجم الكرة = (4/3) × π × R³</strong><br><br>
<strong>مساحة السطح الكروي = 4 × π × R²</strong>
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> كرة نصف قطرها R = 6 سم (π ≈ 3.14)<br>
الحجم = (4/3) × 3.14 × 216 = <strong>904.32 سم³</strong><br>
المساحة = 4 × 3.14 × 36 = <strong>452.16 سم²</strong>
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">ملخص صيغ المجسّمات</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px;">
<table style="width: 100%; border-collapse: collapse;">
<tr style="background: #2c3e50; color: white;"><th style="border: 1px solid #bdc3c7; padding: 8px;">المجسّم</th><th style="border: 1px solid #bdc3c7; padding: 8px;">الحجم</th></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 8px;">متوازي المستطيلات</td><td style="border: 1px solid #bdc3c7; padding: 8px;">L × l × h</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 8px;">الموشور القائم</td><td style="border: 1px solid #bdc3c7; padding: 8px;">S_base × h</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 8px;">الأسطوانة</td><td style="border: 1px solid #bdc3c7; padding: 8px;">πR²h</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 8px;">الهرم</td><td style="border: 1px solid #bdc3c7; padding: 8px;">(1/3) S_base × h</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 8px;">المخروط</td><td style="border: 1px solid #bdc3c7; padding: 8px;">(1/3) πR²h</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 8px;">الكرة</td><td style="border: 1px solid #bdc3c7; padding: 8px;">(4/3) πR³</td></tr>
</table>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> كرة حديدية نصف قطرها 3 سم. أحسب حجمها. إذا كانت كثافة الحديد 7.8 غ/سم³، أوجد كتلتها.
</div>

</div>' WHERE id = '47a8fd30-a0ab-479d-9186-cc325d687b6a';
