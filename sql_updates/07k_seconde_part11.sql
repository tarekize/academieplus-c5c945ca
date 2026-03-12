-- =====================================================
-- Seconde (2ème Année Secondaire) - Batch 11/12
-- Covers: الإحصاء (suite) + الاحتمالات + الدوال (شعبة 5) + المشتقات
-- Lessons 151-165 of 177
-- =====================================================

-- 151) الربعيات والعشريات-المخطط بالعلبة
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الربعيات والعشريات - المخطط بالعلبة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الربعيات</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تقسم السلسلة المرتبة إلى 4 أجزاء متساوية:</strong><br/>
• Q₁ (الربع الأول): 25% من القيم أقل منه<br/>
• Q₂ = الوسيط: 50% من القيم أقل منه<br/>
• Q₃ (الربع الثالث): 75% من القيم أقل منه<br/>
• المدى الربعي: IQR = Q₃ - Q₁
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. العشريات</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 D₁, D₂, ..., D₉ تقسم السلسلة إلى 10 أجزاء متساوية</strong><br/>
D₅ = الوسيط
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. المخطط بالعلبة (Box Plot)</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 يتكون من:</strong><br/>
Min ——[ Q₁ ——|—— Q₃ ]—— Max<br/>
الخط في الوسط = الوسيط Me<br/>
يسمح بالمقارنة بين مجموعات مختلفة
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> علامات 20 تلميذاً مرتبة:<br/>
3, 5, 7, 8, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 15, 15, 16, 17, 19<br/>
1) أوجد Q₁, Me, Q₃<br/>
2) ارسم المخطط بالعلبة<br/>
3) هل توجد قيم شاذة؟
</div>
</div>' WHERE id = '52ecbbcd-d34d-4b09-b118-8b1222c246ae';

-- 152) التجربة العشوائية - المحاكاة
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">التجربة العشوائية - المحاكاة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المفاهيم الأساسية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تجربة عشوائية:</strong> لا يمكن التنبؤ بنتيجتها مسبقاً<br/>
• الكون Ω: مجموعة النتائج الممكنة<br/>
• حدث A: جزء من Ω<br/>
• الحدث المستحيل: ∅ | الحدث المؤكد: Ω
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الاحتمال والتكرار النسبي</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 التكرار النسبي f = عدد التحقق / عدد التكرارات</strong><br/>
عند تكرار التجربة كثيراً: f يستقر حول P(A)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. المحاكاة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تقليد تجربة عشوائية باستعمال أداة:</strong><br/>
• آلة حاسبة (RANDOM)<br/>
• جداول الأعداد العشوائية<br/>
• برنامج حاسوب
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) نرمي حجر نرد. حدد Ω. حدد الحدث A = "الحصول على عدد زوجي"<br/>
2) رُمي حجر نرد 100 مرة. ظهر الوجه 6 ست عشرة مرة. ما التكرار النسبي؟<br/>
3) صمّم محاكاة لرمي قطعة نقدية 200 مرة
</div>
</div>' WHERE id = '1f48e978-811d-4cf4-b366-890abc8f9620';

-- 153) الدالة مكعب (شعبة 5)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الدالة «مكعب»</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف والخصائص</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 f(x) = x³</strong><br/>
• المجموعة المعرفة: ℝ<br/>
• فردية: f(-x) = -f(x)<br/>
• متزايدة تماماً على ℝ
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. المنحنى</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 خصائص المنحنى:</strong><br/>
• يمر بنقطة الأصل O<br/>
• متناظر بالنسبة لـ O (مركز تناظر)<br/>
• تقعر يتغير عند O (نقطة انعطاف)<br/>
• lim(x→+∞) x³ = +∞, lim(x→-∞) x³ = -∞
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ جدول قيم:</strong><br/>
x: -2, -1, 0, 1, 2<br/>
f(x): -8, -1, 0, 1, 8
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) مثّل بيانياً f(x) = x³ في [-3,3]<br/>
2) حل بيانياً x³ = 4x<br/>
3) ادرس الوضع النسبي لـ y = x³ و y = x
</div>
</div>' WHERE id = 'fbfca351-963b-437d-919f-c300fad71ad8';

-- 154) العمليات على الدوال (شعبة 5)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">العمليات على الدوال</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المجموع والفرق</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 (f+g)(x) = f(x) + g(x)</strong><br/>
D_{f+g} = D_f ∩ D_g<br/>
• f و g متزايدتان ⟹ f+g متزايدة<br/>
• f و g متناقصتان ⟹ f+g متناقصة
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الجداء والقسمة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 (f×g)(x) = f(x)×g(x)</strong><br/>
(f/g)(x) = f(x)/g(x) حيث g(x) ≠ 0<br/>
(k·f)(x) = k·f(x)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. التركيب</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 (fog)(x) = f(g(x))</strong><br/>
مثال: f(x) = x², g(x) = 2x+1 ⟹ fog(x) = (2x+1)²
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> f(x) = x², g(x) = √x<br/>
1) أوجد f+g, f×g, f/g مع تحديد المجموعات المعرفة<br/>
2) أوجد fog و gof. هل هما متساويتان؟<br/>
3) ادرس اتجاه تغير h(x) = x² + 2x في [0,+∞[
</div>
</div>' WHERE id = 'b0cf8bbf-b9f1-42d3-8ce6-09936a81c19f';

-- 155) المنحنيات والتحويلات النقطية البسيطة
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المنحنيات والتحويلات النقطية البسيطة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الانسحاب العمودي</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 g(x) = f(x) + k:</strong><br/>
• k &gt; 0: انسحاب نحو الأعلى<br/>
• k &lt; 0: انسحاب نحو الأسفل
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الانسحاب الأفقي</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 g(x) = f(x - a):</strong><br/>
• a &gt; 0: انسحاب نحو اليمين<br/>
• a &lt; 0: انسحاب نحو اليسار
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. التوسع والانضغاط</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 g(x) = k·f(x):</strong><br/>
• |k| &gt; 1: توسع عمودي<br/>
• |k| &lt; 1: انضغاط عمودي<br/>
• k &lt; 0: انعكاس بالنسبة لمحور x
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> انطلاقاً من منحنى f(x) = x²:<br/>
1) ارسم g(x) = x² + 3 و h(x) = (x-2)²<br/>
2) ارسم p(x) = -x² و q(x) = 2x²<br/>
3) اكتب دالة تعبيرها y = (x+1)² - 4 بدلالة تحويلات f
</div>
</div>' WHERE id = '5eb3271e-6a2d-4cd6-925c-1be5e953d884';

-- 156) عناصر تناظر منحنيات
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">عناصر تناظر منحنيات</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التناظر المحوري</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 f زوجية ⟺ f(-x) = f(x):</strong><br/>
منحناها متناظر بالنسبة لمحور الأوساط (Oy)<br/>
مثال: f(x) = x², f(x) = cos(x)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. التناظر المركزي</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 f فردية ⟺ f(-x) = -f(x):</strong><br/>
منحناها متناظر بالنسبة لنقطة الأصل O<br/>
مثال: f(x) = x³, f(x) = sin(x)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. الاستفادة من التناظر</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 إذا كانت الدالة زوجية أو فردية:</strong><br/>
يكفي دراستها على [0,+∞[ ثم نكمل بالتناظر
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) ادرس زوجية/فردية: f(x) = x⁴-3x², g(x) = x³+x<br/>
2) h(x) = (x²+1)/(x³-x). زوجية أم فردية؟<br/>
3) ادرس f(x) = |x³-x| على [0,+∞[ ثم أكمل بالتناظر
</div>
</div>' WHERE id = 'cbf7bf32-f5af-4cbc-8e4a-5cff1cb03a02';

-- 157) ثلاثي الحدود من الدرجة الثانية (شعبة 5)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">ثلاثي الحدود من الدرجة الثانية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الشكل القانوني</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 f(x) = ax² + bx + c = a(x - α)² + β</strong><br/>
حيث: α = -b/(2a)، β = f(α) = -Δ/(4a)<br/>
Δ = b² - 4ac (المميز)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. القمة والمنحنى</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 القمة S(α, β) = محور تناظر x = α</strong><br/>
• a &gt; 0: المنحنى مفتوح للأعلى (قيمة صغرى = β)<br/>
• a &lt; 0: المنحنى مفتوح للأسفل (قيمة كبرى = β)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = 2x² - 8x + 6<br/>
α = 8/4 = 2, β = f(2) = 8-16+6 = -2<br/>
f(x) = 2(x-2)² - 2, القمة S(2,-2)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) اكتب الشكل القانوني: f(x) = -x²+6x-5<br/>
2) أوجد القمة ومثّل بيانياً: g(x) = 3x²+12x+7<br/>
3) حدد a,b,c حيث القمة (1,3) ويمر بـ (0,1)
</div>
</div>' WHERE id = '2acc9f3d-2436-4f4a-8621-6e60451a6cc9';

-- 158) المعادلات من الدرجة الثانية (شعبة 5)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المعادلات من الدرجة الثانية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المميز Δ</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 ax² + bx + c = 0, Δ = b²-4ac:</strong><br/>
• Δ &gt; 0: حلان x₁ = (-b-√Δ)/(2a), x₂ = (-b+√Δ)/(2a)<br/>
• Δ = 0: حل مضاعف x₀ = -b/(2a)<br/>
• Δ &lt; 0: لا حل في ℝ
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. التحليل</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 Δ ≥ 0: ax²+bx+c = a(x-x₁)(x-x₂)</strong><br/>
علاقات فييت: x₁+x₂ = -b/a, x₁·x₂ = c/a
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> 2x²-5x+3 = 0<br/>
Δ = 25-24 = 1, x₁ = (5-1)/4 = 1, x₂ = (5+1)/4 = 3/2<br/>
تحقق: 1+3/2 = 5/2 = -(-5)/2 ✓
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) حل: x²-7x+12 = 0, 4x²-4x+1 = 0, x²+x+1 = 0<br/>
2) حلل: 3x²-x-2<br/>
3) أوجد عددين مجموعهما 10 وجداؤهما 21
</div>
</div>' WHERE id = '6fe52f8f-8d4e-425e-be0f-714f156a1c63';

-- 159) المتراجحات من الدرجة الثانية (شعبة 5)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المتراجحات من الدرجة الثانية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. دراسة إشارة ثلاثي الحدود</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 إشارة ax²+bx+c:</strong><br/>
• Δ &lt; 0: إشارة a للجميع<br/>
• Δ = 0: إشارة a (وتنعدم عند x₀)<br/>
• Δ &gt; 0: إشارة a خارج الجذرين، إشارة -a بينهما
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. حل المتراجحة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 ax²+bx+c ≥ 0 عندما Δ &gt; 0, a &gt; 0:</strong><br/>
الحل: x ∈ ]-∞, x₁] ∪ [x₂, +∞[<br/>
ax²+bx+c ≤ 0: الحل: x ∈ [x₁, x₂]
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> x²-5x+6 ≤ 0<br/>
Δ = 1, x₁ = 2, x₂ = 3, a = 1 &gt; 0<br/>
الحل: x ∈ [2, 3]
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) حل: -x²+4x-3 &gt; 0<br/>
2) حل: 2x²+x+1 ≤ 0<br/>
3) أوجد قيم m حيث x²-2mx+m+2 &gt; 0 لكل x
</div>
</div>' WHERE id = '921216a4-dc0a-4317-9b57-c1009f5ff453';

-- 160) حلّ معادلات ومتراجحات من الدرجة الثانية بيانيّا
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">حلّ معادلات ومتراجحات من الدرجة الثانية بيانيّاً</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الحل البياني لمعادلة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 حل f(x) = g(x): نقاط تقاطع منحنيي f و g</strong><br/>
• f(x) = k: تقاطع المنحنى مع المستقيم y = k<br/>
• f(x) = 0: نقاط تقاطع المنحنى مع محور x
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الحل البياني لمتراجحة</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 f(x) ≥ g(x):</strong> المنطقة حيث منحنى f فوق منحنى g<br/>
f(x) ≥ 0: المنطقة فوق محور x
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> حل بيانياً x²-2x-3 ≤ 0:<br/>
نرسم القطع المكافئ f(x) = x²-2x-3<br/>
يقطع محور x عند x = -1 و x = 3<br/>
f(x) ≤ 0 ⟺ x ∈ [-1, 3]
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) حل بيانياً: x² = 2x+3<br/>
2) حل بيانياً: -x²+4 &gt; x<br/>
3) حدد عدد حلول x²-4x+m = 0 حسب m
</div>
</div>' WHERE id = '328cb8cb-e7b9-4fbc-942a-12cc0de161dd';

-- 161) العدد المشتق (شعبة 5)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">العدد المشتق</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. معدل التغير</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 معدل التغير بين a و a+h:</strong><br/>
τ(h) = [f(a+h) - f(a)] / h<br/>
يمثل ميل القاطع
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. العدد المشتق</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 f''(a) = lim(h→0) [f(a+h)-f(a)]/h</strong><br/>
إذا وُجدت، f قابلة للاشتقاق عند a<br/>
f''(a) = ميل المماس عند النقطة (a, f(a))
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = x², f''(3):<br/>
τ(h) = [(3+h)²-9]/h = (6h+h²)/h = 6+h → 6<br/>
⟹ f''(3) = 6
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احسب f''(1) لـ f(x) = x³ بالتعريف<br/>
2) f(x) = 1/x، احسب f''(2)<br/>
3) f(x) = √x، احسب f''(4)
</div>
</div>' WHERE id = '42b65044-6dee-4f43-8e1c-2e8c5878c95b';

-- 162) معادلة المماس لمنحنى عند نقطة (شعبة 5)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">معادلة المماس لمنحنى عند نقطة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المعادلة</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 معادلة المماس عند x = a:</strong><br/>
y = f''(a)(x - a) + f(a)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = x²+1 عند x = 2<br/>
f(2) = 5, f''(x) = 2x ⟹ f''(2) = 4<br/>
y = 4(x-2)+5 = 4x-3
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. التقريب التآلفي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 قرب a: f(x) ≈ f''(a)(x-a)+f(a)</strong><br/>
مثال: √(4.01) ≈ √4 + (1/2√4)(0.01) = 2.0025
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) معادلة مماس f(x) = x³-x عند x = 1<br/>
2) معادلة مماس g(x) = √x عند x = 9<br/>
3) قرّب √(8.9) و 1/(1.02)²
</div>
</div>' WHERE id = '638ad39b-410f-4193-87dc-c3268859ce4b';

-- 163) الدوال المشتقة (شعبة 5)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الدوال المشتقة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المشتقات الأساسية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 جدول المشتقات:</strong><br/>
• (c)'' = 0<br/>
• (x)'' = 1<br/>
• (xⁿ)'' = nxⁿ⁻¹<br/>
• (1/x)'' = -1/x²<br/>
• (√x)'' = 1/(2√x)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. أمثلة</h3>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ أمثلة:</strong><br/>
• f(x) = 5x³ ⟹ f''(x) = 15x²<br/>
• g(x) = 3/x ⟹ g''(x) = -3/x²<br/>
• h(x) = 4√x ⟹ h''(x) = 2/√x
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> أوجد المشتقة:<br/>
1) f(x) = 3x⁴ - 2x² + x - 7<br/>
2) g(x) = 5/x + 2√x<br/>
3) h(x) = x⁵ - (1/x³)
</div>
</div>' WHERE id = '5001066d-92ff-426d-84e1-c19d956067f0';

-- 164) عمليات على الدوال المشتقة (شعبة 5)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">عمليات على الدوال المشتقة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. القواعد</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قواعد الاشتقاق:</strong><br/>
• (f+g)'' = f''+g''<br/>
• (kf)'' = kf''<br/>
• (fg)'' = f''g + fg''<br/>
• (f/g)'' = (f''g - fg'')/g²<br/>
• (1/g)'' = -g''/g²
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = (2x+1)(x²-3)<br/>
f''(x) = 2(x²-3) + (2x+1)(2x) = 2x²-6+4x²+2x = 6x²+2x-6
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> g(x) = (x+1)/(x-2)<br/>
g''(x) = [(x-2)-(x+1)]/(x-2)² = -3/(x-2)²
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> أوجد المشتقة:<br/>
1) f(x) = (3x-1)(x²+2)<br/>
2) g(x) = x²/(x+1)<br/>
3) h(x) = (2x+3)/(x²-1)
</div>
</div>' WHERE id = '8492234d-4ee5-4501-a78a-26279a0270af';

-- 165) الدالة المشتقة وإتجاه التغير (شعبة 5)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الدالة المشتقة واتجاه التغير</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. العلاقة</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 على مجال I:</strong><br/>
• f''(x) &gt; 0 ⟹ f متزايدة تماماً<br/>
• f''(x) &lt; 0 ⟹ f متناقصة تماماً<br/>
• f''(x) = 0 ⟹ f ثابتة
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. القيم الحدية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 f''(a) = 0 مع تغيّر الإشارة:</strong><br/>
• من + إلى - ⟹ قيمة كبرى محلية<br/>
• من - إلى + ⟹ قيمة صغرى محلية
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = x³-3x+1<br/>
f''(x) = 3x²-3 = 3(x-1)(x+1)<br/>
f''(x) = 0 عند x = ±1<br/>
f(-1) = 3 (قيمة كبرى)، f(1) = -1 (قيمة صغرى)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) ادرس اتجاه تغير f(x) = -2x³+3x²+12x-5<br/>
2) أوجد القيم الحدية لـ g(x) = x⁴-8x²+10<br/>
3) مستطيل محيطه 20cm. أوجد الأبعاد التي تعطي أكبر مساحة
</div>
</div>' WHERE id = '147cc6d1-7785-4d5a-b380-915c99a6ca49';
