-- =====================================================
-- Seconde (2ème Année Secondaire) - Batch 6/12
-- Covers: التمثيل البياني + كثيرات الحدود (شعبة 3) + الإشتقاقية + تطبيقات + النهايات
-- Lessons 76-90 of 177
-- =====================================================

-- 76) التمثيل البياني (الدوال العددية - شعبة 3)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">التمثيل البياني</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. قراءة منحنى بياني</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 معلومات من المنحنى:</strong><br/>
• مجموعة التعريف: إسقاط المنحنى على محور الفواصل<br/>
• صورة a: الرتيب (y) للنقطة ذات الفاصلة a<br/>
• حل f(x) = k: فواصل نقاط تقاطع المنحنى مع y = k<br/>
• إشارة f(x): المنحنى فوق أو تحت محور الفواصل
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. رسم منحنى بياني</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 الخطوات:</strong><br/>
1) تحديد مجموعة التعريف<br/>
2) دراسة التماثل (زوجية/فردية)<br/>
3) حساب جدول التغيرات<br/>
4) حساب نقاط خاصة (تقاطع مع المحاور)<br/>
5) رسم المنحنى
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. تحويلات المنحنيات</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 قواعد:</strong><br/>
• g(x) = f(x) + k → انسحاب عمودي<br/>
• g(x) = f(x - h) → انسحاب أفقي<br/>
• g(x) = -f(x) → تماثل محوري (أفقي)<br/>
• g(x) = f(-x) → تماثل محوري (عمودي)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> f(x) = x² - 2x - 3<br/>
1) حدد مجموعة التعريف وتقاطعات المنحنى مع المحاور<br/>
2) أنشئ جدول التغيرات<br/>
3) ارسم المنحنى وحدد منه مجموعة حلول f(x) ≥ 0
</div>
</div>' WHERE id = '26bfc075-aca3-4070-bf02-d26dc2c9c736';

-- 77) عمليات على كثيرات الحدود
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">عمليات على كثيرات الحدود</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريف كثير حدود</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> كثير حدود P(x) = aₙxⁿ + aₙ₋₁xⁿ⁻¹ + ... + a₁x + a₀<br/>
• الدرجة: deg(P) = n (حيث aₙ ≠ 0)<br/>
• المعامل الرئيسي: aₙ
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. العمليات</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قواعد الدرجة:</strong><br/>
• deg(P + Q) ≤ max(deg P, deg Q)<br/>
• deg(P × Q) = deg P + deg Q<br/>
• deg(P ∘ Q) = deg P × deg Q
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. القسمة الإقليدية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 مبرهنة:</strong> لكل P و Q (Q ≠ 0)، يوجد وحيدان Q′ (الحاصل) و R (الباقي) حيث:<br/>
P = Q × Q′ + R حيث deg R &lt; deg Q
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> P(x) = 2x³ + 5x² - x + 3, Q(x) = x + 2<br/>
2x³ + 5x² - x + 3 = (x+2)(2x² + x - 3) + 9<br/>
الحاصل: 2x² + x - 3, الباقي: 9
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) أجرِ القسمة الإقليدية: (x⁴ - 3x² + 2) ÷ (x² - 1)<br/>
2) أوجد باقي قسمة P(x) = x³ - 2x + 1 على (x - 1)<br/>
3) حلل P(x) = x³ - 6x² + 11x - 6
</div>
</div>' WHERE id = '6eb150f6-78f2-4e34-b674-471786526ae8';

-- 78) المعادلات من الدرجة الثانية (كثيرات الحدود - شعبة 3)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المعادلات من الدرجة الثانية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. حل ax² + bx + c = 0</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 الطريقة:</strong><br/>
1) حساب Δ = b² - 4ac<br/>
2) Δ &gt; 0: حلان مختلفان x₁ = (-b-√Δ)/(2a), x₂ = (-b+√Δ)/(2a)<br/>
3) Δ = 0: حل مضاعف x₀ = -b/(2a)<br/>
4) Δ &lt; 0: لا حلول حقيقية
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. التحليل إلى جداء عوامل</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 صيغ:</strong><br/>
• Δ &gt; 0: ax² + bx + c = a(x - x₁)(x - x₂)<br/>
• Δ = 0: ax² + bx + c = a(x - x₀)²
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. علاقات فييت والقطع المكافئ</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 علاقات فييت:</strong> x₁ + x₂ = -b/a, x₁·x₂ = c/a<br/><br/>
<strong>القطع المكافئ:</strong> الرأس S(-b/(2a), -Δ/(4a))<br/>
a &gt; 0: المنحنى مفتوح للأعلى | a &lt; 0: مفتوح للأسفل
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) حل: 3x² - 5x + 2 = 0<br/>
2) حلل: 4x² - 12x + 9<br/>
3) أوجد معادلة من الدرجة 2 جذراها 2+√3 و 2-√3
</div>
</div>' WHERE id = '285fa29a-994c-4115-90ca-2191895cdab3';

-- 79) المتراجحات من الدرجة الثانية (كثيرات الحدود - شعبة 3)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المتراجحات من الدرجة الثانية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. قاعدة الإشارة</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 إشارة ax² + bx + c:</strong><br/>
• Δ &lt; 0: من إشارة a لكل x ∈ ℝ<br/>
• Δ = 0: من إشارة a لكل x ≠ x₀, ويعدم عند x₀<br/>
• Δ &gt; 0: من إشارة a خارج ]x₁, x₂[، وعكس إشارة a داخله<br/>
<em>قاعدة: «نفس إشارة a خارج الجذرين»</em>
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> حل: -2x² + 3x + 5 &gt; 0<br/>
Δ = 9 + 40 = 49, x₁ = (3-7)/(-4) = 1, x₂ = (3+7)/(-4) = -5/2<br/>
a = -2 &lt; 0, الجذران: -5/2 و 1<br/>
f(x) &gt; 0 بين الجذرين: S = ]-5/2, 1[
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. جدول الإشارة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 لحل إشارة جداء أو حاصل قسمة:</strong><br/>
1) ندرس إشارة كل عامل على حدة<br/>
2) نستعمل قاعدة الإشارات لتحديد إشارة الجداء/القسمة
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) حل: x² - 4x + 3 ≤ 0<br/>
2) حل: (2x+1)(x²-x-6) ≥ 0<br/>
3) حل: (x²-1)/(x²+x-2) &lt; 0
</div>
</div>' WHERE id = '69d3e90d-dd76-41d3-9939-f3531128a0b8';

-- 80) العدد المشتق (الإشتقاقية - شعبة 3)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">العدد المشتق</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. معدل التغير</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> معدل تغير f بين a و a+h:<br/>
τ(h) = [f(a+h) - f(a)] / h<br/>
هندسياً: ميل الوتر [M(a,f(a)); N(a+h, f(a+h))]
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. العدد المشتق</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 تعريف:</strong> f قابلة للاشتقاق في a إذا وجدت النهاية:<br/>
f′(a) = lim(h→0) [f(a+h) - f(a)] / h<br/>
f′(a) = ميل المماس لمنحنى f عند النقطة (a, f(a))
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = 2x² - 3, حساب f′(1):<br/>
τ(h) = [2(1+h)² - 3 - (2-3)] / h = [2+4h+2h²-3+1] / h = (4h+2h²)/h = 4+2h<br/>
f′(1) = lim(h→0)(4+2h) = 4
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. معادلة المماس</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 صيغة:</strong> y = f′(a)(x - a) + f(a)<br/>
في المثال: y = 4(x-1) + (-1) = 4x - 5
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) باستعمال التعريف، احسب f′(2) لـ f(x) = x³<br/>
2) أوجد معادلة المماس لمنحنى g(x) = 1/x عند x = 1<br/>
3) ما هي قيمة f′(a) إذا كان المماس أفقياً؟
</div>
</div>' WHERE id = '24eacb8b-207e-4572-b46c-f85c40fc524f';

-- 81) مماس لمنحنى عند نقطة (الإشتقاقية - شعبة 3)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">مماس لمنحنى عند نقطة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. معادلة المماس</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 الصيغة:</strong> المماس لمنحنى C_f عند النقطة A(a, f(a)):<br/>
<strong>y = f′(a)(x - a) + f(a)</strong>
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = x² - 3x + 2, المماس عند a = 2<br/>
f(2) = 4 - 6 + 2 = 0, f′(x) = 2x - 3, f′(2) = 1<br/>
المماس: y = 1(x - 2) + 0 = x - 2
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. المماس الأفقي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 خاصية:</strong> المماس أفقي ⟺ f′(a) = 0 ⟺ y = f(a)<br/>
يحدث عند القيم الحدية (حد أعظمي أو أصغري محلي)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. المماس المار بنقطة خارجية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 طريقة:</strong> لإيجاد مماسات تمر بنقطة M(α,β) خارج المنحنى:<br/>
نكتب: β = f′(a)(α - a) + f(a) ونحل بالنسبة لـ a
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> f(x) = x³ - 3x²<br/>
1) أوجد معادلة المماس عند x = 0 وعند x = 2<br/>
2) أوجد النقاط حيث المماس أفقي<br/>
3) أوجد المماسات المارة بالنقطة (1, -4)
</div>
</div>' WHERE id = '4adc2929-99ac-4480-98b9-e71133e8070f';

-- 82) التقريب التآلفي لدالة (الإشتقاقية - شعبة 3)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">التقريب التآلفي لدالة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. مبدأ التقريب</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 الصيغة:</strong> بجوار النقطة a، المنحنى يُقرَّب بمماسه:<br/>
<strong>f(x) ≈ f(a) + f′(a)(x - a)</strong> لـ x قريب من a
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. تقريبات كلاسيكية (بجوار 0)</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 لقيم x صغيرة (قريبة من 0):</strong><br/>
• (1+x)ⁿ ≈ 1 + nx<br/>
• √(1+x) ≈ 1 + x/2<br/>
• 1/(1+x) ≈ 1 - x
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ أمثلة:</strong><br/>
• √(1.06) = √(1+0.06) ≈ 1 + 0.03 = 1.03 (الدقيقة: 1.02956...)<br/>
• (1.02)⁵ ≈ 1 + 5×0.02 = 1.10 (الدقيقة: 1.10408...)<br/>
• 1/1.03 ≈ 1 - 0.03 = 0.97 (الدقيقة: 0.97087...)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. التفاضل وتطبيقاته</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 التفاضل:</strong> df = f′(a) × dx حيث dx = h تقريب لـ Δf = f(a+h) - f(a)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) قرّب √(4.1) باستعمال التقريب التآلفي حول a = 4<br/>
2) قرّب (3.98)³ حول a = 4<br/>
3) مربع ضلعه 10cm يتغير بـ ±0.1cm. قدّر الخطأ في المساحة
</div>
</div>' WHERE id = '1cece62b-1c95-4c55-b9d1-8b178c72e3f6';

-- 83) الدالة المشتقة لدالة (الإشتقاقية - شعبة 3)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الدالة المشتقة لدالة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الدالة المشتقة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> إذا كانت f قابلة للاشتقاق على D، فالدالة x ↦ f′(x) تُسمى الدالة المشتقة لـ f.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. جدول المشتقات</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<table style="width: 100%; border-collapse: collapse; text-align: center;">
<tr style="background: #2c3e50; color: white;"><td style="padding: 8px; border: 1px solid #ddd;">f(x)</td><td style="border: 1px solid #ddd;">f′(x)</td><td style="border: 1px solid #ddd;">D_f</td></tr>
<tr><td style="border: 1px solid #ddd;">k</td><td style="border: 1px solid #ddd;">0</td><td style="border: 1px solid #ddd;">ℝ</td></tr>
<tr style="background: #f5f5f5;"><td style="border: 1px solid #ddd;">x</td><td style="border: 1px solid #ddd;">1</td><td style="border: 1px solid #ddd;">ℝ</td></tr>
<tr><td style="border: 1px solid #ddd;">xⁿ</td><td style="border: 1px solid #ddd;">nxⁿ⁻¹</td><td style="border: 1px solid #ddd;">ℝ</td></tr>
<tr style="background: #f5f5f5;"><td style="border: 1px solid #ddd;">1/x</td><td style="border: 1px solid #ddd;">-1/x²</td><td style="border: 1px solid #ddd;">ℝ*</td></tr>
<tr><td style="border: 1px solid #ddd;">√x</td><td style="border: 1px solid #ddd;">1/(2√x)</td><td style="border: 1px solid #ddd;">]0,+∞[</td></tr>
</table>
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ أمثلة:</strong><br/>
• f(x) = 3x⁴ - 2x² + x → f′(x) = 12x³ - 4x + 1<br/>
• f(x) = 5/x → f′(x) = -5/x²<br/>
• f(x) = 2√x → f′(x) = 1/√x
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> اشتق:<br/>
1) f(x) = x⁵ - 3x³ + 2x - 7<br/>
2) g(x) = 3/x² + 4√x<br/>
3) h(x) = x⁴/4 - x³/3 + x²/2
</div>
</div>' WHERE id = '17efef8e-76e6-48fd-b1e1-586c7b391680';

-- 84) عمليات على الدوال المشتقة (الإشتقاقية - شعبة 3)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">عمليات على الدوال المشتقة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المجموع والضرب بثابت</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 (f + g)′ = f′ + g′ و (kf)′ = kf′</strong>
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. مشتقة الجداء</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 (f·g)′ = f′·g + f·g′</strong>
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> h(x) = (x²+1)(3x-2)<br/>
h′(x) = 2x·(3x-2) + (x²+1)·3 = 6x² - 4x + 3x² + 3 = 9x² - 4x + 3
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. مشتقة الحاصل</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 (f/g)′ = (f′g - fg′)/g²</strong>
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> h(x) = (2x+3)/(x²+1)<br/>
h′(x) = [2(x²+1) - (2x+3)(2x)] / (x²+1)²<br/>
= (2x²+2 - 4x²-6x) / (x²+1)² = (-2x²-6x+2)/(x²+1)²
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> اشتق:<br/>
1) f(x) = (2x-1)(x²+3)<br/>
2) g(x) = (x+1)/(x-1)<br/>
3) h(x) = x√x (اكتب كـ x^(3/2) أو كجداء)
</div>
</div>' WHERE id = '3290cc95-bc85-477c-a90e-97a23aff948d';

-- 85) اتجاه تغير دالة (تطبيقات الإشتقاقية - شعبة 3)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">اتجاه تغير دالة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الربط بين المشتقة واتجاه التغير</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 مبرهنة:</strong> f قابلة للاشتقاق على I:<br/>
• f′(x) &gt; 0 لكل x ∈ I ⟹ f متزايدة تماماً على I<br/>
• f′(x) &lt; 0 لكل x ∈ I ⟹ f متناقصة تماماً على I<br/>
• f′(x) = 0 لكل x ∈ I ⟹ f ثابتة على I
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. إنشاء جدول التغيرات</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 الخطوات:</strong><br/>
1) حساب f′(x)<br/>
2) حل f′(x) = 0 وتحديد إشارة f′<br/>
3) ملء جدول التغيرات مع القيم الخاصة
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = x³ - 6x² + 9x + 1<br/>
f′(x) = 3x² - 12x + 9 = 3(x² - 4x + 3) = 3(x-1)(x-3)<br/>
f′ = 0 ⟹ x = 1 أو x = 3<br/>
f′ &gt; 0 على ]-∞,1[ و ]3,+∞[ (متزايدة)<br/>
f′ &lt; 0 على ]1,3[ (متناقصة)<br/>
f(1) = 5 (حد أعظمي)، f(3) = 1 (حد أصغري)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> أنشئ جدول التغيرات:<br/>
1) f(x) = -2x³ + 3x² + 12x - 5<br/>
2) g(x) = x + 9/x على ]0,+∞[<br/>
3) h(x) = x⁴ - 4x³ + 6
</div>
</div>' WHERE id = 'bdf872c2-4168-4c68-b36e-63847aaf82c8';

-- 86) القيم الحدية المحلية (تطبيقات الإشتقاقية - شعبة 3)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">القيم الحدية المحلية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. حد أعظمي وأصغري محلي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong><br/>
• f لها حد أعظمي محلي في a ⟺ f(x) ≤ f(a) لكل x في جوار a<br/>
• f لها حد أصغري محلي في a ⟺ f(x) ≥ f(a) لكل x في جوار a
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. شرط وجود حد</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 شرط لازم:</strong> إذا f لها حد في a و f قابلة للاشتقاق: f′(a) = 0<br/><br/>
<strong>شرط كاف:</strong><br/>
• f′(a) = 0 و f′ تتغير من + إلى - ⟹ حد أعظمي<br/>
• f′(a) = 0 و f′ تتغير من - إلى + ⟹ حد أصغري
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = x⁴ - 2x²<br/>
f′(x) = 4x³ - 4x = 4x(x²-1) = 4x(x-1)(x+1)<br/>
f′ = 0 ⟹ x ∈ {-1, 0, 1}<br/>
• x = -1: f′ من - إلى + → حد أصغري: f(-1) = -1<br/>
• x = 0: f′ من + إلى - → حد أعظمي: f(0) = 0<br/>
• x = 1: f′ من - إلى + → حد أصغري: f(1) = -1
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) أوجد القيم الحدية لـ f(x) = 2x³ - 3x² - 12x + 7<br/>
2) مستطيل محيطه 20cm. ما أبعاده لتكون مساحته أكبر ما يمكن؟
</div>
</div>' WHERE id = '7a6513d6-0131-4baa-a3fa-4947266877e0';

-- 87) حصر دالة (تطبيقات الإشتقاقية - شعبة 3)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">حصر دالة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المقصود بحصر دالة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> حصر f على مجال I يعني إيجاد m و M حيث:<br/>
m ≤ f(x) ≤ M لكل x ∈ I<br/>
• m: الحد الأدنى العام | M: الحد الأقصى العام
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. استعمال جدول التغيرات للحصر</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 طريقة:</strong><br/>
1) أنشئ جدول تغيرات f على [a, b]<br/>
2) الحد الأدنى = أصغر قيمة في القيم الحدية وقيم الأطراف<br/>
3) الحد الأقصى = أكبر قيمة في القيم الحدية وقيم الأطراف
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = x² - 4x + 5 على [0, 5]<br/>
f′(x) = 2x - 4 = 0 ⟹ x = 2<br/>
f(0) = 5, f(2) = 1, f(5) = 10<br/>
1 ≤ f(x) ≤ 10 لكل x ∈ [0, 5]
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احصر f(x) = -x² + 6x - 5 على [1, 4]<br/>
2) احصر g(x) = x³ - 3x على [-2, 2]<br/>
3) بيّن أن sin(x) - x ≤ 0 لكل x ≥ 0
</div>
</div>' WHERE id = '24c4c65d-7e7e-4844-96f1-3f66af05042a';

-- 88) العناصر الحادة (تطبيقات الإشتقاقية - شعبة 3)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">العناصر الحادة (القيم القصوى المطلقة)</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الحد الأقصى والأدنى المطلق</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong><br/>
• M هو الحد الأقصى المطلق لـ f على I إذا: M = max f(x) لـ x ∈ I<br/>
• m هو الحد الأدنى المطلق لـ f على I إذا: m = min f(x) لـ x ∈ I
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. إيجاد القيم القصوى على مجال مغلق</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 مبرهنة (فايرشتراس):</strong> كل دالة متصلة على مجال مغلق ومحدود [a,b] تبلغ حدها الأقصى وحدها الأدنى.<br/><br/>
<strong>خطوات الإيجاد:</strong><br/>
1) أوجد f′(x) = 0 (النقاط الحرجة في ]a,b[)<br/>
2) احسب f عند هذه النقاط وعند الأطراف a و b<br/>
3) قارن: أكبر قيمة = max، أصغر قيمة = min
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = x³ - 3x + 2 على [-2, 3]<br/>
f′(x) = 3x² - 3 = 0 ⟹ x = ±1<br/>
f(-2) = 0, f(-1) = 4, f(1) = 0, f(3) = 20<br/>
min = 0 (في x = -2 و x = 1), max = 20 (في x = 3)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) أوجد max و min لـ f(x) = 2x³ - 9x² + 12x على [0, 4]<br/>
2) مزارع لديه 100m من السياج. ما أبعاد الحقل المستطيل ذي المساحة القصوى؟
</div>
</div>' WHERE id = 'd144d307-fe71-4469-985b-c17419a89919';

-- 89) نهاية غير منتهية عند عدد حقيقي (النهايات - شعبة 3)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">نهاية غير منتهية عند عدد حقيقي</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong><br/>
• lim(x→a⁺) f(x) = +∞ يعني أن f(x) تكبر بلا حدود عندما x يقترب من a من اليمين<br/>
• lim(x→a⁻) f(x) = -∞ يعني أن f(x) تصغر بلا حدود عندما x يقترب من a من اليسار
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. التفسير الهندسي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 إذا كانت النهاية ±∞ عند x = a:</strong><br/>
المستقيم x = a هو <strong>مستقيم مقارب عمودي</strong> للمنحنى
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ أمثلة:</strong><br/>
• f(x) = 1/x: lim(x→0⁺) = +∞, lim(x→0⁻) = -∞ → المقارب: x = 0<br/>
• f(x) = 1/(x-2)²: lim(x→2) = +∞ → المقارب: x = 2<br/>
• f(x) = (x+1)/(x-3): lim(x→3⁺) = +∞, lim(x→3⁻) = -∞
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. حساب النهايات</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قاعدة:</strong> لحساب lim(x→a) f(x)/g(x) حيث g(a) = 0:<br/>
ندرس إشارة g(x) قرب a (يميناً ويساراً) وقيمة f(a)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> أوجد النهايات وحدد المقاربات العمودية:<br/>
1) f(x) = (2x+1)/(x²-4)<br/>
2) g(x) = x/(x²-x)<br/>
3) h(x) = √x/(x-1)
</div>
</div>' WHERE id = 'e274f7c6-d27e-43af-b73a-0df246e79536';

-- 90) نهاية منتهية عند المالانهاية (النهايات - شعبة 3)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">نهاية منتهية عند المالانهاية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong><br/>
lim(x→+∞) f(x) = ℓ يعني أن f(x) تقترب من العدد ℓ عندما x يكبر بلا حدود
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. التفسير الهندسي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 المستقيم y = ℓ مقارب أفقي</strong> لمنحنى f إذا lim f(x) = ℓ عند ±∞
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. نهايات مرجعية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 نتائج:</strong><br/>
• lim(x→±∞) 1/x = 0<br/>
• lim(x→±∞) 1/xⁿ = 0 (لكل n ∈ ℕ*)<br/>
• lim(x→±∞) k = k (دالة ثابتة)<br/>
• لكسر: نهاية = نهاية نسبة الحدين المهيمنين
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ أمثلة:</strong><br/>
• lim(x→+∞) (3x+1)/(2x-5) = 3/2 → المقارب الأفقي: y = 3/2<br/>
• lim(x→+∞) (x²+1)/(x³-x) = 0 → المقارب الأفقي: y = 0<br/>
• lim(x→+∞) (2x²-3)/(x²+1) = 2 → المقارب الأفقي: y = 2
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> أوجد النهايات وحدد المقاربات الأفقية:<br/>
1) f(x) = (5x-1)/(3x+2) عند +∞ و -∞<br/>
2) g(x) = (x²+3x)/(2x²-1)<br/>
3) h(x) = (√x)/(x+1) عند +∞
</div>
</div>' WHERE id = '3ec96233-4a66-4789-8f8c-74d9d9470550';
