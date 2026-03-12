-- =====================================================
-- Seconde (2ème Année Secondaire) - Batch 7/12
-- Covers: النهايات (suite) + المتتاليات العددية + المرجح في المستوي
-- Lessons 91-105 of 177
-- =====================================================

-- 91) مفهوم النهاية (النهايات - شعبة 3)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">مفهوم النهاية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. نهاية دالة عند عدد حقيقي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong><br/>
lim(x→a) f(x) = ℓ يعني: كلما اقترب x من a، اقترب f(x) من ℓ<br/>
• النهاية من اليمين: lim(x→a⁺) f(x)<br/>
• النهاية من اليسار: lim(x→a⁻) f(x)<br/>
• النهاية موجودة ⟺ النهايتان اليمنى واليسرى متساويتان
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. نهاية دالة عند اللانهاية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 الأشكال الممكنة:</strong><br/>
• lim(x→+∞) f(x) = ℓ (نهاية منتهية)<br/>
• lim(x→+∞) f(x) = +∞ (نهاية غير منتهية)<br/>
• lim(x→+∞) f(x) = -∞
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. حالات عدم التعيين</h3>

<div style="background: #fdedec; padding: 15px; border-right: 4px solid #e74c3c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e74c3c;">⚠️ أشكال غير معيّنة:</strong><br/>
∞ - ∞ | 0 × ∞ | 0/0 | ∞/∞<br/>
تحتاج تحويلات لرفع عدم التعيين
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) أوجد: lim(x→2) (x²-4)/(x-2)<br/>
2) أوجد: lim(x→+∞) (3x²-x+1)/(x²+2)<br/>
3) هل توجد: lim(x→0) |x|/x ؟
</div>
</div>' WHERE id = '46ef2123-93ed-4131-a229-a398e4112712';

-- 92) عمليات على النهايات (النهايات - شعبة 3)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">عمليات على النهايات</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. نهاية المجموع</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قاعدة:</strong> إذا lim f = ℓ و lim g = ℓ′ فإن lim(f+g) = ℓ+ℓ′<br/>
⚠️ شكل غير معيّن: ∞ - ∞
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. نهاية الجداء</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قاعدة:</strong> إذا lim f = ℓ و lim g = ℓ′ فإن lim(f·g) = ℓ·ℓ′<br/>
⚠️ شكل غير معيّن: 0 × ∞
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. نهاية الحاصل</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قاعدة:</strong> إذا lim f = ℓ و lim g = ℓ′ ≠ 0 فإن lim(f/g) = ℓ/ℓ′<br/>
⚠️ أشكال غير معيّنة: 0/0, ∞/∞
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">4. رفع حالات عدم التعيين</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تقنيات:</strong><br/>
• التحليل والاختزال (0/0)<br/>
• إبراز الحد المهيمن (∞/∞)<br/>
• الضرب بالمرافق (عند وجود جذور)<br/>
• القسمة على أعلى قوة
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> أوجد:<br/>
1) lim(x→1) (x²-1)/(x³-1)<br/>
2) lim(x→+∞) (√(x²+x) - x)<br/>
3) lim(x→+∞) (2x³-x)/(5x³+3)
</div>
</div>' WHERE id = 'd8cb339b-6955-4257-a36e-961465d7ee8d';

-- 93) المستقيم المقارب المائل (النهايات - شعبة 3)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المستقيم المقارب المائل</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> y = ax + b مستقيم مقارب مائل لمنحنى f إذا:<br/>
lim(x→±∞) [f(x) - (ax+b)] = 0
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. طريقة الإيجاد</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 الخطوات:</strong><br/>
1) a = lim(x→±∞) f(x)/x<br/>
2) b = lim(x→±∞) [f(x) - ax]<br/>
إذا وُجدا: y = ax + b مقارب مائل
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = (x² + 2x + 3)/(x + 1)<br/>
بالقسمة: f(x) = x + 1 + 2/(x+1)<br/>
lim(x→±∞) 2/(x+1) = 0<br/>
⟹ y = x + 1 مقارب مائل
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. الوضع النسبي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 إشارة f(x) - (ax+b) تحدد:</strong><br/>
• &gt; 0: المنحنى فوق المقارب<br/>
• &lt; 0: المنحنى تحت المقارب
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) أوجد المقاربات لـ f(x) = (2x²-x+3)/(x-1)<br/>
2) حدد الوضع النسبي للمنحنى بالنسبة للمقارب المائل<br/>
3) f(x) = x + 1 + 1/x²، ما هو المقارب المائل؟
</div>
</div>' WHERE id = 'd0578da9-6aa2-4ed2-967e-e237a6763181';

-- 94) دراسة دالة (النهايات - شعبة 3)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">دراسة دالة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. منهجية دراسة دالة كاملة</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 الخطوات المنهجية:</strong><br/>
1) مجموعة التعريف D_f<br/>
2) دراسة التماثل (زوجية/فردية/دورية)<br/>
3) النهايات عند أطراف D_f + المقاربات<br/>
4) الاشتقاق f′(x) وإشارته<br/>
5) جدول التغيرات<br/>
6) تقاطع مع المحاور + نقاط خاصة<br/>
7) رسم المنحنى البياني
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال كامل:</strong> f(x) = (x²-1)/(x-2)<br/>
<strong>D_f = ℝ\{2}</strong><br/>
<strong>النهايات:</strong> lim(x→2⁺) = +∞, lim(x→2⁻) = -∞ → مقارب عمودي x=2<br/>
f(x) = x+2 + 3/(x-2) → مقارب مائل y = x+2<br/>
<strong>f′(x) = (x²-4x+1)/(x-2)²</strong><br/>
f′ = 0 ⟹ x = 2±√3
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> ادرس دراسة كاملة وارسم المنحنى:<br/>
1) f(x) = x + 4/x<br/>
2) g(x) = (x²+x+1)/(x+1)
</div>
</div>' WHERE id = 'e84a29ae-3c32-4d4d-bea0-ccc3d031928a';

-- 95) المتتاليات العددية (شعبة 3)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المتتاليات العددية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريف متتالية عددية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> متتالية عددية (uₙ) هي دالة من ℕ إلى ℝ<br/>
<strong>طرق التعريف:</strong><br/>
• بالصيغة الصريحة: uₙ = f(n) مثل uₙ = 2n+1<br/>
• بعلاقة الرجوع: uₙ₊₁ = f(uₙ) مع u₀ معطى
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong><br/>
• uₙ = 3n - 2: u₀=-2, u₁=1, u₂=4, u₃=7<br/>
• vₙ₊₁ = 2vₙ - 1 مع v₀ = 3: v₁=5, v₂=9, v₃=17
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. اتجاه تغير متتالية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 الطرق:</strong><br/>
• حساب uₙ₊₁ - uₙ: إذا &gt; 0 متزايدة، إذا &lt; 0 متناقصة<br/>
• حساب uₙ₊₁/uₙ (إذا uₙ &gt; 0): إذا &gt; 1 متزايدة<br/>
• دراسة f إذا uₙ = f(n)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) uₙ = n² - 5n. احسب أول 6 حدود وحدد اتجاه التغير<br/>
2) vₙ₊₁ = vₙ/(1+vₙ) مع v₀ = 2. احسب v₁, v₂, v₃<br/>
3) wₙ = (2n+1)/(n+3). ادرس اتجاه التغير
</div>
</div>' WHERE id = '2facb9f7-7544-43d8-887d-2a4e1866166d';

-- 96) التمثيل البياني لمتتالية عددية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">التمثيل البياني لمتتالية عددية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تمثيل بالنقاط</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 طريقة:</strong> نمثل النقاط (n, uₙ) في المعلم (O, i⃗, j⃗)<br/>
• المحور الأفقي: الرتب n<br/>
• المحور العمودي: القيم uₙ
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. طريقة السلالم (لمتتالية بعلاقة رجوع)</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 الطريقة:</strong> إذا uₙ₊₁ = f(uₙ):<br/>
1) ارسم منحنى y = f(x) والمستقيم y = x<br/>
2) ابدأ من u₀ على المحور الأفقي<br/>
3) ارتفع عمودياً إلى المنحنى → تحصل على f(u₀) = u₁<br/>
4) انتقل أفقياً إلى y = x → الإسقاط على المحور<br/>
5) كرر العملية
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> uₙ₊₁ = √(uₙ+2), u₀ = 0<br/>
ارسم y = √(x+2) و y = x<br/>
تقاطعهما: x = √(x+2) → x² = x+2 → x² - x - 2 = 0 → x = 2<br/>
بطريقة السلالم نرى أن المتتالية تقترب من 2
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) مثّل بيانياً uₙ = (-1)ⁿ/n لأول 8 حدود<br/>
2) استعمل طريقة السلالم لـ uₙ₊₁ = uₙ/2 + 1, u₀ = 0. حدس النهاية
</div>
</div>' WHERE id = '9bd6430f-bfd2-4d78-b169-eae6a8e844ac';

-- 97) إتجاه تغير متتالية عددية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">إتجاه تغير متتالية عددية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريفات</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 (uₙ) متزايدة:</strong> uₙ₊₁ ≥ uₙ لكل n ∈ ℕ<br/>
<strong>(uₙ) متناقصة:</strong> uₙ₊₁ ≤ uₙ لكل n ∈ ℕ<br/>
<strong>(uₙ) رتيبة:</strong> إذا كانت متزايدة أو متناقصة
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. طرق الإثبات</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 الطريقة 1:</strong> دراسة إشارة uₙ₊₁ - uₙ<br/><br/>
<strong>الطريقة 2:</strong> إذا uₙ &gt; 0، دراسة uₙ₊₁/uₙ (مقارنة بـ 1)<br/><br/>
<strong>الطريقة 3:</strong> إذا uₙ = f(n)، ندرس تغير الدالة f
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> uₙ = n/(n+1)<br/>
uₙ₊₁ - uₙ = (n+1)/(n+2) - n/(n+1) = [(n+1)² - n(n+2)] / [(n+1)(n+2)]<br/>
= (n²+2n+1-n²-2n) / [(n+1)(n+2)] = 1/[(n+1)(n+2)] &gt; 0<br/>
⟹ (uₙ) متزايدة تماماً
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> ادرس اتجاه التغير:<br/>
1) uₙ = 2ⁿ/(n!)<br/>
2) vₙ = n² - 10n + 20<br/>
3) wₙ₊₁ = √(6+wₙ), w₀ = 1
</div>
</div>' WHERE id = '0fe971d4-e796-40a0-8b09-2c2a3671356a';

-- 98) المتتاليات الحسابية (شعبة 3)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المتتاليات الحسابية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> (uₙ) حسابية بأساس r ⟺ uₙ₊₁ = uₙ + r لكل n<br/>
الحد العام: uₙ = u₀ + nr أو uₙ = uₚ + (n-p)r
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. مجموع حدود متتابعة</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغة:</strong> S = u₀ + u₁ + ... + uₙ = (n+1)(u₀ + uₙ)/2<br/>
= (عدد الحدود) × (الحد الأول + الحد الأخير)/2<br/><br/>
حالة خاصة: 1 + 2 + ... + n = n(n+1)/2
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> uₙ حسابية، u₃ = 10 و u₇ = 22<br/>
u₇ = u₃ + 4r ⟹ 22 = 10 + 4r ⟹ r = 3<br/>
u₀ = u₃ - 3r = 10 - 9 = 1<br/>
S₇ = 8×(1+22)/2 = 92
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) uₙ حسابية، u₅ = 17 و u₁₂ = 38. أوجد u₀ و r<br/>
2) احسب 3 + 7 + 11 + ... + 99<br/>
3) أوجد n لكي Sₙ = u₀+...+uₙ = 210 حيث u₀ = 1, r = 2
</div>
</div>' WHERE id = 'd71e18c0-f37d-401e-8cac-da91676b5508';

-- 99) المتتاليات الهندسية (شعبة 3)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المتتاليات الهندسية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> (uₙ) هندسية بأساس q ⟺ uₙ₊₁ = q·uₙ (q ≠ 0)<br/>
الحد العام: uₙ = u₀ × qⁿ أو uₙ = uₚ × qⁿ⁻ᵖ
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. مجموع حدود متتابعة</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغة (q ≠ 1):</strong><br/>
S = u₀ + u₁ + ... + uₙ = u₀ × (1 - qⁿ⁺¹)/(1 - q)<br/>
= الحد الأول × (1 - q^(عدد الحدود))/(1-q)<br/><br/>
حالة خاصة: 1 + q + q² + ... + qⁿ = (1-qⁿ⁺¹)/(1-q)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> uₙ هندسية، u₂ = 12 و u₅ = 96<br/>
u₅ = u₂ × q³ ⟹ 96 = 12q³ ⟹ q³ = 8 ⟹ q = 2<br/>
u₀ = u₂/q² = 12/4 = 3<br/>
S₅ = 3(1-2⁶)/(1-2) = 3×63 = 189
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) uₙ هندسية، u₁ = 6 و u₄ = 162. أوجد u₀ و q<br/>
2) احسب 1 + 1/2 + 1/4 + ... + 1/2⁸<br/>
3) رأسمال 10000 DA يزيد 5% سنوياً. أوجد الرأسمال بعد 10 سنوات
</div>
</div>' WHERE id = 'd16a2ba9-ff39-4f78-b421-90e1e4c0d42a';

-- 100) نهاية متتالية عددية (شعبة 3)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">نهاية متتالية عددية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريف التقارب</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> (uₙ) متقاربة نحو ℓ ⟺ lim(n→+∞) uₙ = ℓ<br/>
أي: uₙ يقترب من ℓ كلما كبر n
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. نتائج أساسية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 نهايات مرجعية:</strong><br/>
• lim 1/n = 0, lim 1/n² = 0, lim 1/√n = 0<br/>
• lim n = +∞, lim n² = +∞, lim √n = +∞<br/>
• |q| &lt; 1 ⟹ lim qⁿ = 0<br/>
• q &gt; 1 ⟹ lim qⁿ = +∞
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. العمليات على النهايات</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 نفس قواعد نهايات الدوال تنطبق:</strong><br/>
المجموع، الجداء، الحاصل + حالات عدم التعيين
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> uₙ = (3n²+1)/(n²-n+1)<br/>
= (3 + 1/n²) / (1 - 1/n + 1/n²) → 3/1 = 3
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> أوجد النهاية:<br/>
1) uₙ = (5n-3)/(2n+1)<br/>
2) vₙ = (n+(-1)ⁿ)/n<br/>
3) wₙ = (√(n²+n) - n)
</div>
</div>' WHERE id = '3412ac64-8905-4e89-9b35-dc9207ca8e0a';

-- 101) نهاية متتالية عددية باستعمال الحصر
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">نهاية متتالية عددية باستعمال الحصر</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. مبرهنة الحصر (الدرك)</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 مبرهنة:</strong> إذا كان لكل n ∈ ℕ:<br/>
vₙ ≤ uₙ ≤ wₙ و lim vₙ = lim wₙ = ℓ<br/>
⟹ lim uₙ = ℓ
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> uₙ = sin(n)/n<br/>
-1 ≤ sin(n) ≤ 1 ⟹ -1/n ≤ sin(n)/n ≤ 1/n<br/>
lim(-1/n) = lim(1/n) = 0<br/>
بالحصر: lim uₙ = 0
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. مبرهنة المتتالية المتقاربة الرتيبة المحصورة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 مبرهنة:</strong><br/>
• كل متتالية متزايدة ومحدودة من الأعلى → متقاربة<br/>
• كل متتالية متناقصة ومحدودة من الأسفل → متقاربة
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) بيّن أن lim cos(n)/n² = 0 باستعمال الحصر<br/>
2) uₙ₊₁ = (uₙ+3)/2, u₀ = 0. بيّن أنها متزايدة محدودة ثم أوجد نهايتها<br/>
3) بيّن أن lim (n²·sin(1/n³)) = 0
</div>
</div>' WHERE id = '6349931a-d29d-4502-b58f-dcea423f966e';

-- 102) نهاية متتالية هندسية (شعبة 3)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">نهاية متتالية هندسية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. نهاية qⁿ حسب q</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 نتائج:</strong><br/>
• |q| &lt; 1 (أي -1 &lt; q &lt; 1): lim qⁿ = 0<br/>
• q = 1: lim qⁿ = 1<br/>
• q &gt; 1: lim qⁿ = +∞<br/>
• q ≤ -1: qⁿ ليس لها نهاية (تتذبذب)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. نهاية مجموع هندسي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 إذا |q| &lt; 1:</strong><br/>
lim Sₙ = lim u₀(1-qⁿ⁺¹)/(1-q) = u₀/(1-q)<br/>
(المجموع اللانهائي)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> uₙ = 3×(1/2)ⁿ<br/>
|q| = 1/2 &lt; 1 ⟹ lim uₙ = 0<br/>
المجموع اللانهائي: S = 3/(1-1/2) = 6
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) أوجد نهاية: uₙ = 5×(2/3)ⁿ و المجموع اللانهائي<br/>
2) كرة ترتد بـ 80% من ارتفاعها. أسقطت من 10m. ما المسافة الكلية؟<br/>
3) أوجد نهاية: vₙ = (2ⁿ+3ⁿ)/4ⁿ
</div>
</div>' WHERE id = '95c656ff-cbca-4641-914f-b7d931b95a5d';

-- 103) تذكير حول الأشعة (المرجح في المستوي - شعبة 3)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">تذكير حول الأشعة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. العمليات على الأشعة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 جمع أشعة:</strong><br/>
• علاقة شال: AB⃗ + BC⃗ = AC⃗<br/>
• u⃗ + v⃗: قاعدة متوازي الأضلاع أو وضع سهمي<br/>
• AB⃗ = OB⃗ - OA⃗ (مهم جداً!)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الإحداثيات</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 في المعلم (O, i⃗, j⃗):</strong><br/>
• A(xₐ, yₐ) ⟹ OA⃗(xₐ, yₐ)<br/>
• AB⃗(x_B - x_A, y_B - y_A)<br/>
• ‖AB⃗‖ = √[(x_B-x_A)² + (y_B-y_A)²]<br/>
• منتصف [AB]: I((xₐ+x_B)/2, (yₐ+y_B)/2)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. الشعاعان المتساويان والمتقاطعان</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 u⃗ = v⃗ ⟺ نفس الإحداثيات</strong><br/>
u⃗ و v⃗ متقاطعان (u⃗ ∥ v⃗) ⟺ ∃ k: u⃗ = k·v⃗ ⟺ xy′ - x′y = 0
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> A(1,3), B(4,1), C(-2,5)<br/>
1) احسب AB⃗ و AC⃗ و ‖AB⃗‖<br/>
2) هل A, B, C على استقامة واحدة؟<br/>
3) أوجد D حيث ABDC متوازي أضلاع
</div>
</div>' WHERE id = '2a2e0c08-3f4b-4aa6-83f9-6620ee753a5b';

-- 104) مرجح نقطتين (المرجح في المستوي - شعبة 3)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">مرجح نقطتين</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> G مرجح الجملة {(A, α); (B, β)} حيث α+β ≠ 0:<br/>
<strong>αGA⃗ + βGB⃗ = 0⃗</strong>
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. موضع المرجح</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغة:</strong> OG⃗ = (αOA⃗ + βOB⃗)/(α+β)<br/>
أو إحداثياً: G((αxₐ+βx_B)/(α+β), (αyₐ+βy_B)/(α+β))<br/><br/>
حالات خاصة:<br/>
• α = β: G منتصف [AB]<br/>
• G يقع على [AB] بين A و B إذا α و β من نفس الإشارة
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> A(1,2), B(5,6), α=3, β=1<br/>
G = ((3×1+1×5)/4, (3×2+1×6)/4) = (8/4, 12/4) = (2, 3)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. خاصية التجميع</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 لكل نقطة M:</strong> αMA⃗ + βMB⃗ = (α+β)MG⃗
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> A(0,1), B(4,5)<br/>
1) أوجد G مرجح {(A,2);(B,3)}<br/>
2) حدد مجموعة النقاط M حيث ‖2MA⃗+3MB⃗‖ = 10<br/>
3) أوجد G′ مرجح {(A,1);(B,-3)}
</div>
</div>' WHERE id = '99f65ea7-6d04-4edb-b266-f37d8a920fb3';

-- 105) مرجح ثلاث نقاط (المرجح في المستوي - شعبة 3)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">مرجح ثلاث نقاط</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> G مرجح {(A,α);(B,β);(C,γ)} حيث α+β+γ ≠ 0:<br/>
<strong>αGA⃗ + βGB⃗ + γGC⃗ = 0⃗</strong><br/>
OG⃗ = (αOA⃗ + βOB⃗ + γOC⃗)/(α+β+γ)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. حالة خاصة: مركز ثقل مثلث</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 α = β = γ:</strong> G = مركز ثقل المثلث ABC<br/>
G = ((xₐ+x_B+x_C)/3, (yₐ+y_B+y_C)/3)<br/>
وهو تقاطع المتوسطات
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. التجميع الجزئي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 خاصية:</strong> يمكن تجميع نقطتين أولاً:<br/>
G = مرجح {(A,α);(B,β);(C,γ)} = مرجح {(I,α+β);(C,γ)}<br/>
حيث I مرجح {(A,α);(B,β)}
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> A(0,0), B(6,0), C(0,6)<br/>
G مرجح بأوزان (1,1,1): G = (2, 2)<br/>
G مرجح بأوزان (2,1,1): G = ((0+6+0)/4, (0+0+6)/4) ← خطأ<br/>
G = ((2×0+1×6+1×0)/4, (2×0+1×0+1×6)/4) = (6/4, 6/4) = (3/2, 3/2)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> A(1,0), B(3,4), C(5,2)<br/>
1) أوجد مركز ثقل المثلث ABC<br/>
2) أوجد G مرجح {(A,2);(B,1);(C,-1)}<br/>
3) حدد مجموعة M حيث ‖MA⃗+MB⃗+MC⃗‖ = 6
</div>
</div>' WHERE id = '3b064280-2590-437a-97e9-8ed3d9b90e3d';
