-- =====================================================
-- Seconde (2ème Année Secondaire) - Batch 4/12
-- Covers: عموميات على الدوال (شعبة 2) + المعادلات والمتراجحات + الإشتقاق
-- Lessons 46-60 of 177
-- =====================================================

-- 46) الدالة مكعب
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الدالة «مكعب»</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريف الدالة مكعب</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> الدالة مكعب هي الدالة f المعرّفة على ℝ بـ: f(x) = x³<br/>
مجموعة التعريف: D_f = ℝ
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. خواص الدالة مكعب</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 خواص:</strong><br/>
• <strong>الفردية:</strong> f(-x) = (-x)³ = -x³ = -f(x) → الدالة فردية<br/>
• <strong>التماثل:</strong> المنحنى متماثل بالنسبة لمركز التماثل O(0,0)<br/>
• <strong>اتجاه التغير:</strong> متزايدة تماماً على ℝ<br/>
• f(0) = 0, f(1) = 1, f(-1) = -1, f(2) = 8
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. جدول التغيرات</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<table style="width: 100%; border-collapse: collapse; text-align: center;">
<tr style="background: #2c3e50; color: white;"><td style="padding: 8px; border: 1px solid #ddd;">x</td><td>-∞</td><td colspan="3">→</td><td>+∞</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5;">x³</td><td>-∞</td><td colspan="3">↗</td><td>+∞</td></tr>
</table>
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">4. المنحنى البياني</h3>

<p>المنحنى يشبه حرف S ممتد، يمر بالأصل O ويتقعر نحو الأسفل لما x &lt; 0 ونحو الأعلى لما x &gt; 0. نقطة الانعطاف هي O.</p>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) حل المعادلة x³ = 27<br/>
2) حل المتراجحة x³ ≥ -8<br/>
3) قارن بين المنحنيات: f(x) = x³, g(x) = x², h(x) = x في المجال [0, 2]
</div>
</div>' WHERE id = '966d64e4-895d-45e6-8a45-153bb9c3f939';

-- 47) العمليات على الدوال
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">العمليات على الدوال</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. مجموع وفرق دالتين</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> إذا كانت f و g معرّفتين على مجموعة D:<br/>
• (f+g)(x) = f(x) + g(x) — مجموعة التعريف: D_f ∩ D_g<br/>
• (f-g)(x) = f(x) - g(x) — مجموعة التعريف: D_f ∩ D_g
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. جداء دالتين وقسمتهما</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong><br/>
• (f×g)(x) = f(x) × g(x) — مجموعة التعريف: D_f ∩ D_g<br/>
• (f/g)(x) = f(x)/g(x) — مجموعة التعريف: D_f ∩ D_g مع g(x) ≠ 0
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. ضرب دالة بعدد</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 (k·f)(x) = k·f(x)</strong><br/>
• إذا k &gt; 0: اتجاه تغير k·f هو نفس اتجاه تغير f<br/>
• إذا k &lt; 0: اتجاه تغير k·f عكس اتجاه تغير f
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = x² + 1, g(x) = 2x - 3<br/>
(f+g)(x) = x² + 2x - 2<br/>
(f×g)(x) = (x²+1)(2x-3) = 2x³ - 3x² + 2x - 3<br/>
(f/g)(x) = (x²+1)/(2x-3), D = ℝ \ {3/2}
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">4. اتجاه تغير المجموع</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 قاعدة:</strong> إذا كانت f و g متزايدتين على مجال I، فإن f+g متزايدة على I.<br/>
تنبيه: لا يمكن استنتاج اتجاه تغير f×g من اتجاه تغير f و g بشكل عام.
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> f(x) = √x, g(x) = 1/x<br/>
1) عيّن مجموعة تعريف f+g، f-g، f×g، f/g<br/>
2) احسب (f+g)(4)، (f×g)(9)<br/>
3) ادرس اتجاه تغير h(x) = √x + 1/x على ]0, +∞[
</div>
</div>' WHERE id = 'aa21c3da-2f62-4da5-938a-680dcf9a4c3f';

-- 48) المنحنيات والتحويلات النقطية البسيطة
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المنحنيات والتحويلات النقطية البسيطة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الانسحاب الأفقي والعمودي</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قواعد التحويل:</strong><br/>
• منحنى g(x) = f(x) + k: انسحاب عمودي بمقدار k (لأعلى إذا k &gt; 0)<br/>
• منحنى g(x) = f(x - h): انسحاب أفقي بمقدار h (لليمين إذا h &gt; 0)<br/>
• منحنى g(x) = f(x - h) + k: انسحاب بالشعاع (h, k)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = x²<br/>
g(x) = (x-2)² + 3 هو انسحاب لمنحنى f بالشعاع (2, 3)<br/>
رأس القطع المكافئ ينتقل من (0,0) إلى (2,3)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. التمدد والانكماش</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 قواعد:</strong><br/>
• g(x) = a·f(x) (a &gt; 0): تمدد/انكماش عمودي بالمعامل a<br/>
• g(x) = f(bx) (b &gt; 0): انكماش/تمدد أفقي بالمعامل 1/b
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. التماثل</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 قواعد:</strong><br/>
• g(x) = -f(x): تماثل بالنسبة لمحور الفواصل (المحور الأفقي)<br/>
• g(x) = f(-x): تماثل بالنسبة لمحور الأراتيب (المحور العمودي)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> انطلاقاً من منحنى f(x) = |x|:<br/>
1) ارسم منحنى g(x) = |x - 3| + 2<br/>
2) ارسم منحنى h(x) = -2|x|<br/>
3) ارسم منحنى k(x) = |2x + 1| - 3
</div>
</div>' WHERE id = '875c0df3-f088-430a-91b4-7c8a6ecdaf72';

-- 49) عناصر تناظر منحنيات
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">عناصر تناظر منحنيات</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الدالة الزوجية والفردية (تذكير)</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong><br/>
• <strong>f زوجية:</strong> f(-x) = f(x) لكل x → المنحنى متماثل بالنسبة لمحور الأراتيب<br/>
• <strong>f فردية:</strong> f(-x) = -f(x) لكل x → المنحنى متماثل بالنسبة للمبدأ O
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. محور تناظر عام</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 مبرهنة:</strong> المستقيم x = a محور تناظر لمنحنى f إذا وفقط إذا:<br/>
f(a + h) = f(a - h) لكل h حيث يكون المعنى<br/>
أي ما يعادل: g(x) = f(x + a) دالة زوجية
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = (x-3)² + 1<br/>
f(3+h) = h² + 1 = f(3-h) ⟹ المستقيم x = 3 محور تناظر
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. مركز تناظر عام</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 مبرهنة:</strong> النقطة I(a, b) مركز تناظر لمنحنى f إذا وفقط إذا:<br/>
f(a + h) + f(a - h) = 2b لكل h<br/>
أي: g(x) = f(x + a) - b دالة فردية
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) أثبت أن x = -1 محور تناظر لمنحنى f(x) = x² + 2x + 5<br/>
2) أثبت أن I(1, 2) مركز تناظر لمنحنى g(x) = 2x/(x-1) + 2<br/>
3) حدد عناصر التناظر لمنحنى h(x) = x³ - 6x² + 12x - 8
</div>
</div>' WHERE id = '758dc756-207b-478b-bc07-af0e8da51685';

-- 50) ثلاثي الحدود من الدرجة الثانية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">ثلاثي الحدود من الدرجة الثانية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الشكل العام</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> ثلاثي الحدود من الدرجة الثانية هو كل تعبير من الشكل:<br/>
f(x) = ax² + bx + c حيث a ≠ 0<br/>
• a: المعامل الرئيسي | b: معامل x | c: الحد الثابت
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. المميز (Discriminant)</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 Δ = b² - 4ac</strong><br/>
• Δ &gt; 0: جذران حقيقيان مختلفان x₁ = (-b-√Δ)/(2a) و x₂ = (-b+√Δ)/(2a)<br/>
• Δ = 0: جذر مضاعف x₀ = -b/(2a)<br/>
• Δ &lt; 0: لا جذور حقيقية
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. الشكل القانوني</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 f(x) = a(x - α)² + β</strong> حيث α = -b/(2a) و β = f(α) = -Δ/(4a)<br/>
الرأس S(α, β) هو أعلى/أدنى نقطة في المنحنى
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = 2x² - 8x + 6<br/>
Δ = 64 - 48 = 16 &gt; 0<br/>
x₁ = (8-4)/4 = 1, x₂ = (8+4)/4 = 3<br/>
الشكل القانوني: f(x) = 2(x-2)² - 2, الرأس S(2, -2)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) حدد Δ والجذور والشكل القانوني لـ: f(x) = x² - 6x + 8<br/>
2) أوجد الشكل القانوني لـ g(x) = -x² + 4x - 3<br/>
3) عيّن a, b, c حتى يكون رأس القطع المكافئ (1, -4) ويمر بالأصل
</div>
</div>' WHERE id = 'aae27dfa-ae9a-46f7-9d4d-fe6b111585a8';

-- 51) المعادلات من الدرجة الثانية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المعادلات من الدرجة الثانية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. حل المعادلة ax² + bx + c = 0</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 طريقة الحل:</strong><br/>
1) نحسب Δ = b² - 4ac<br/>
2) إذا Δ &gt; 0: x₁ = (-b - √Δ)/(2a)، x₂ = (-b + √Δ)/(2a)، S = {x₁, x₂}<br/>
3) إذا Δ = 0: x₀ = -b/(2a)، S = {x₀}<br/>
4) إذا Δ &lt; 0: S = ∅
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 1:</strong> x² - 5x + 6 = 0<br/>
Δ = 25 - 24 = 1 &gt; 0<br/>
x₁ = (5-1)/2 = 2, x₂ = (5+1)/2 = 3<br/>
S = {2, 3}
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. التحليل إلى جداء عوامل</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 قاعدة:</strong><br/>
• Δ &gt; 0: ax² + bx + c = a(x - x₁)(x - x₂)<br/>
• Δ = 0: ax² + bx + c = a(x - x₀)²<br/>
• Δ &lt; 0: لا يمكن التحليل في ℝ
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. علاقات فييت (Viète)</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 إذا x₁ و x₂ جذرا ax² + bx + c = 0:</strong><br/>
x₁ + x₂ = -b/a (مجموع الجذرين)<br/>
x₁ × x₂ = c/a (جداء الجذرين)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) حل: 3x² - 7x + 2 = 0<br/>
2) حلل إلى جداء عوامل: 2x² + 5x - 3<br/>
3) دون حل، أوجد مجموع وجداء جذري: 4x² - 12x + 5 = 0
</div>
</div>' WHERE id = '5784b0d4-d57f-45c3-98e7-c86f38f79c4c';

-- 52) المتراجحات من الدرجة الثانية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المتراجحات من الدرجة الثانية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. إشارة ثلاثي الحدود</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قاعدة الإشارة:</strong> f(x) = ax² + bx + c<br/>
• <strong>Δ &lt; 0:</strong> f(x) من إشارة a لكل x ∈ ℝ<br/>
• <strong>Δ = 0:</strong> f(x) من إشارة a لكل x ≠ x₀, وf(x₀) = 0<br/>
• <strong>Δ &gt; 0:</strong> f(x) من إشارة a خارج الجذرين، وعكس إشارة a بين الجذرين
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> حل x² - 4x + 3 ≤ 0<br/>
Δ = 16 - 12 = 4 &gt; 0, x₁ = 1, x₂ = 3, a = 1 &gt; 0<br/>
جدول الإشارة: + | 0 | - | 0 | +<br/>
f(x) ≤ 0 ⟺ 1 ≤ x ≤ 3, S = [1, 3]
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. حل المتراجحات</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 خطوات:</strong><br/>
1) حوّل إلى الشكل: ... ≤ 0 أو ... ≥ 0<br/>
2) احسب الجذور والمميز<br/>
3) أنشئ جدول الإشارة<br/>
4) اقرأ الحل من الجدول
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) حل: -x² + 2x + 3 &gt; 0<br/>
2) حل: 2x² - x - 1 ≥ 0<br/>
3) أوجد مجموعة القيم حيث f(x) = 3x² + 1 &gt; 4x
</div>
</div>' WHERE id = '2e9da105-229b-4dfb-b1de-bad929e76070';

-- 53) حلّ معادلات ومتراجحات من الدرجة الثانية بيانياً
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">حلّ معادلات ومتراجحات من الدرجة الثانية بيانياً</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الحل البياني للمعادلة f(x) = k</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 طريقة:</strong><br/>
1) نرسم منحنى الدالة f والمستقيم y = k<br/>
2) نقاط التقاطع تعطي حلول المعادلة<br/>
3) فواصل نقاط التقاطع هي الحلول
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الحل البياني للمعادلة f(x) = g(x)</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 طريقة:</strong><br/>
1) نرسم منحنيي f و g في نفس المعلم<br/>
2) فواصل نقاط التقاطع = حلول f(x) = g(x)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. الحل البياني للمتراجحات</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قاعدة:</strong><br/>
• f(x) ≥ g(x) ⟺ منحنى f فوق منحنى g أو عليه<br/>
• f(x) ≤ k ⟺ المنحنى تحت المستقيم y = k أو عليه
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = x² - 2x - 3<br/>
حل f(x) ≤ 0 بيانياً: المنحنى يقطع المحور الأفقي في x = -1 و x = 3<br/>
f(x) ≤ 0 ⟺ المنحنى تحت المحور الأفقي ⟺ x ∈ [-1, 3]
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> من المنحنى البياني لـ f(x) = -x² + 4x:<br/>
1) حل بيانياً: f(x) = 3<br/>
2) حل بيانياً: f(x) ≥ 0<br/>
3) حل بيانياً: f(x) &lt; x + 2
</div>
</div>' WHERE id = '6b69507a-2b35-416b-a903-de3207174a9f';

-- 54) العدد المشتق (الإشتقاق)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">العدد المشتق</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. معدل التغير</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> معدل تغير الدالة f بين a و a+h هو:<br/>
τ(h) = [f(a+h) - f(a)] / h<br/>
وهو ميل الوتر الواصل بين النقطتين M(a, f(a)) و N(a+h, f(a+h))
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. العدد المشتق</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 تعريف:</strong> f قابلة للاشتقاق في a إذا كانت النهاية:<br/>
f''(a) = lim(h→0) [f(a+h) - f(a)] / h موجودة ومنتهية<br/>
هذه النهاية تُسمى العدد المشتق لـ f عند a ويُرمز لها f''(a)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = x²، نحسب f''(3):<br/>
τ(h) = [(3+h)² - 9] / h = [9 + 6h + h² - 9] / h = 6 + h<br/>
f''(3) = lim(h→0) (6+h) = 6
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. التفسير الهندسي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 خاصية:</strong> f''(a) هو ميل المماس لمنحنى f عند النقطة ذات الفاصلة a.
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احسب العدد المشتق لـ f(x) = 3x² - 2x عند x = 1<br/>
2) احسب f''(2) لـ f(x) = 1/x باستعمال التعريف<br/>
3) ما معنى أن f''(a) = 0 هندسياً؟
</div>
</div>' WHERE id = '4a6423e4-7dc5-44db-bc6c-3a0158ffeb65';

-- 55) معادلة المماس لمنحنى عند نقطة
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">معادلة المماس لمنحنى عند نقطة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. معادلة المماس</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغة:</strong> معادلة المماس لمنحنى f عند النقطة ذات الفاصلة a هي:<br/>
<strong>y = f''(a)(x - a) + f(a)</strong><br/>
حيث f''(a) هو الميل و f(a) ترتيب نقطة التماس
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = x², معادلة المماس عند a = 2:<br/>
f(2) = 4, f''(x) = 2x ⟹ f''(2) = 4<br/>
y = 4(x - 2) + 4 = 4x - 4
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. حالات خاصة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 حالات:</strong><br/>
• f''(a) = 0: المماس أفقي (y = f(a))<br/>
• f''(a) = 1: المماس يميل بزاوية 45°<br/>
• المماس عند الأصل (a = 0): y = f''(0)·x + f(0)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. تطبيق: إيجاد مماس يمر بنقطة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 طريقة:</strong> لإيجاد مماسات لـ C_f تمر بنقطة M(α, β):<br/>
1) نكتب معادلة المماس العام: y = f''(a)(x-a) + f(a)<br/>
2) نعوّض بإحداثيات M: β = f''(a)(α-a) + f(a)<br/>
3) نحل بالنسبة لـ a
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> f(x) = x³ - 3x<br/>
1) أوجد معادلة المماس عند x = 1<br/>
2) أوجد النقاط التي يكون فيها المماس أفقياً<br/>
3) أوجد معادلات المماسات التي تمر بالنقطة (0, 2)
</div>
</div>' WHERE id = '6f759608-534b-42f1-8977-76e3acce5226';

-- 56) الدوال المشتقة
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الدوال المشتقة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الدالة المشتقة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> إذا كانت f قابلة للاشتقاق على مجال I، فإن الدالة التي ترفق بكل x ∈ I العدد المشتق f''(x) تُسمى الدالة المشتقة وتُرمز f''.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. جدول المشتقات الأساسية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<table style="width: 100%; border-collapse: collapse; text-align: center;">
<tr style="background: #2c3e50; color: white;"><td style="padding: 8px; border: 1px solid #ddd;">f(x)</td><td style="border: 1px solid #ddd;">f''(x)</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">k (ثابت)</td><td style="border: 1px solid #ddd;">0</td></tr>
<tr style="background: #f5f5f5;"><td style="padding: 8px; border: 1px solid #ddd;">x</td><td style="border: 1px solid #ddd;">1</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">xⁿ</td><td style="border: 1px solid #ddd;">nxⁿ⁻¹</td></tr>
<tr style="background: #f5f5f5;"><td style="padding: 8px; border: 1px solid #ddd;">1/x</td><td style="border: 1px solid #ddd;">-1/x²</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">√x</td><td style="border: 1px solid #ddd;">1/(2√x)</td></tr>
</table>
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ أمثلة:</strong><br/>
• f(x) = x⁴ ⟹ f''(x) = 4x³<br/>
• f(x) = 5x³ ⟹ f''(x) = 15x²<br/>
• f(x) = 1/x² = x⁻² ⟹ f''(x) = -2x⁻³ = -2/x³
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> أوجد الدالة المشتقة:<br/>
1) f(x) = 3x⁵ - 2x³ + x - 7<br/>
2) g(x) = 4/x + √x<br/>
3) h(x) = x⁴/4 - x²/2 + 1
</div>
</div>' WHERE id = 'b69b0a29-2486-480f-9962-e5592c887ed3';

-- 57) عمليات على الدوال المشتقة
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">عمليات على الدوال المشتقة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. مشتقة مجموع وفرق</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قواعد:</strong><br/>
• (f + g)'' = f'' + g''<br/>
• (f - g)'' = f'' - g''<br/>
• (k·f)'' = k·f'' (k عدد حقيقي)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. مشتقة جداء</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قاعدة لايبنتز:</strong><br/>
(f × g)'' = f'' × g + f × g''
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> h(x) = (2x+1)(x²-3)<br/>
h''(x) = 2·(x²-3) + (2x+1)·2x = 2x² - 6 + 4x² + 2x = 6x² + 2x - 6
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. مشتقة حاصل قسمة</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قاعدة:</strong><br/>
(f/g)'' = (f''·g - f·g'') / g²<br/>
حالة خاصة: (1/g)'' = -g''/g²
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> h(x) = (x+1)/(x-2)<br/>
h''(x) = [1·(x-2) - (x+1)·1] / (x-2)² = -3/(x-2)²
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> أوجد المشتقة:<br/>
1) f(x) = (3x-1)(x²+2)<br/>
2) g(x) = (2x+3)/(x-1)<br/>
3) h(x) = x²·√x
</div>
</div>' WHERE id = '57a7529f-877b-42d4-bc12-83692b2b5f05';

-- 58) الدالة المشتقة واتجاه التغير
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الدالة المشتقة واتجاه التغير</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. العلاقة بين إشارة المشتقة واتجاه التغير</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 مبرهنة أساسية:</strong> f قابلة للاشتقاق على المجال I:<br/>
• f''(x) &gt; 0 لكل x ∈ I ⟹ f متزايدة تماماً على I<br/>
• f''(x) &lt; 0 لكل x ∈ I ⟹ f متناقصة تماماً على I<br/>
• f''(x) = 0 لكل x ∈ I ⟹ f ثابتة على I
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. جدول التغيرات</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 خطوات:</strong><br/>
1) حساب f''(x)<br/>
2) دراسة إشارة f''(x) (حل f''(x) = 0)<br/>
3) ملء السطر الأول: قيم x الخاصة + الجذور<br/>
4) السطر الثاني: إشارة f''(x) (+ أو -)<br/>
5) السطر الثالث: اتجاه تغير f (↗ أو ↘)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = x³ - 3x + 1<br/>
f''(x) = 3x² - 3 = 3(x²-1) = 3(x-1)(x+1)<br/>
f''(x) = 0 ⟹ x = -1 أو x = 1<br/>
f''(x) &gt; 0 على ]-∞, -1[ و ]1, +∞[ (متزايدة)<br/>
f''(x) &lt; 0 على ]-1, 1[ (متناقصة)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> ادرس اتجاه تغير كل من:<br/>
1) f(x) = -x³ + 6x² - 9x + 2<br/>
2) g(x) = x + 4/x على ]0, +∞[<br/>
3) h(x) = x⁴ - 8x² + 16
</div>
</div>' WHERE id = 'fa27c589-3062-42dc-9431-953531647a14';

-- 59) القيم الحدية لدالة
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">القيم الحدية لدالة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. القيمة الحدية الصغرى والكبرى المحلية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong><br/>
• f تملك <strong>حداً أصغرياً محلياً</strong> في a إذا: f(x) ≥ f(a) لكل x قريب من a<br/>
• f تملك <strong>حداً أعظمياً محلياً</strong> في a إذا: f(x) ≤ f(a) لكل x قريب من a
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الشرط اللازم</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 مبرهنة:</strong> إذا كانت f قابلة للاشتقاق في a ولها حد أعظمي أو أصغري محلي في a فإن:<br/>
<strong>f''(a) = 0</strong><br/>
(العكس غير صحيح! مثال: f(x) = x³ فـ f''(0) = 0 لكن لا حد في 0)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. الشرط الكافي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 قاعدة:</strong> إذا f''(a) = 0 وتغيرت إشارة f'' حول a:<br/>
• f'' تغير من + إلى - ⟹ حد أعظمي في a<br/>
• f'' تغير من - إلى + ⟹ حد أصغري في a
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = x³ - 3x + 1, f''(x) = 3(x-1)(x+1)<br/>
• x = -1: f'' تغير + → - ⟹ حد أعظمي: f(-1) = 3<br/>
• x = 1: f'' تغير - → + ⟹ حد أصغري: f(1) = -1
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) أوجد القيم الحدية المحلية لـ f(x) = 2x³ - 9x² + 12x<br/>
2) صندوق بدون غطاء يُصنع من ورقة مربعة طولها 12cm بقطع مربعات من الأركان. ما أبعاد الصندوق ذي الحجم الأقصى؟
</div>
</div>' WHERE id = 'c872378e-f313-4717-821d-fb203b0588fd';

-- 60) التقريب التآلفي المماسي لدالة
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">التقريب التآلفي المماسي لدالة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التقريب الخطي</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغة:</strong> إذا كانت f قابلة للاشتقاق في a، فإنه لقيم x القريبة من a:<br/>
<strong>f(x) ≈ f(a) + f''(a)(x - a)</strong><br/>
أي أن المنحنى يُقرَّب بمماسه عند a بجوار هذه النقطة
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 1:</strong> تقريب √(1+x) بجوار x = 0:<br/>
f(x) = √(1+x), f(0) = 1, f''(x) = 1/(2√(1+x)), f''(0) = 1/2<br/>
√(1+x) ≈ 1 + x/2<br/>
مثلاً: √1.02 = √(1+0.02) ≈ 1 + 0.01 = 1.01 (القيمة الحقيقية: 1.00995...)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. التفاضل</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> تفاضل f في a بالتزايد h هو:<br/>
df = f''(a) × h<br/>
وهو تقريب للفرق: f(a+h) - f(a) ≈ f''(a) × h
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 2:</strong> تقريب (2.01)³:<br/>
f(x) = x³, a = 2, h = 0.01<br/>
f''(x) = 3x², f''(2) = 12<br/>
(2.01)³ ≈ 2³ + 12 × 0.01 = 8 + 0.12 = 8.12<br/>
(القيمة الدقيقة: 8.120601...)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) قرّب (1.03)⁴ باستعمال التقريب التآلفي<br/>
2) أوجد تقريباً لـ 1/(1+x) بجوار 0<br/>
3) كرة نصف قطرها r = 5cm يزداد بـ 0.1cm. ما تقريب الزيادة في الحجم؟
</div>
</div>' WHERE id = '225889f5-d924-4da7-bcb0-5f6cb518709d';
