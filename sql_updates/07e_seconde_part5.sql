-- =====================================================
-- Seconde (2ème Année Secondaire) - Batch 5/12
-- Covers: السلوك التقاربي + المتتاليات العددية + الجمل الخطية + الإحتمالات + الدوال (شعبة 3)
-- Lessons 61-75 of 177
-- =====================================================

-- 61) نهايات دوال مألوفة (السلوك التقاربي)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">نهايات دوال مألوفة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. نهايات الدوال المرجعية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 جدول النهايات الأساسية:</strong><br/>
<table style="width: 100%; border-collapse: collapse; text-align: center; margin-top: 10px;">
<tr style="background: #2c3e50; color: white;"><td style="padding: 8px; border: 1px solid #ddd;">f(x)</td><td style="border: 1px solid #ddd;">lim (-∞)</td><td style="border: 1px solid #ddd;">lim (0⁻)</td><td style="border: 1px solid #ddd;">lim (0⁺)</td><td style="border: 1px solid #ddd;">lim (+∞)</td></tr>
<tr><td style="padding: 6px; border: 1px solid #ddd;">xⁿ (n زوجي)</td><td style="border: 1px solid #ddd;">+∞</td><td style="border: 1px solid #ddd;">-</td><td style="border: 1px solid #ddd;">-</td><td style="border: 1px solid #ddd;">+∞</td></tr>
<tr style="background: #f5f5f5;"><td style="padding: 6px; border: 1px solid #ddd;">xⁿ (n فردي)</td><td style="border: 1px solid #ddd;">-∞</td><td style="border: 1px solid #ddd;">-</td><td style="border: 1px solid #ddd;">-</td><td style="border: 1px solid #ddd;">+∞</td></tr>
<tr><td style="padding: 6px; border: 1px solid #ddd;">1/x</td><td style="border: 1px solid #ddd;">0⁻</td><td style="border: 1px solid #ddd;">-∞</td><td style="border: 1px solid #ddd;">+∞</td><td style="border: 1px solid #ddd;">0⁺</td></tr>
<tr style="background: #f5f5f5;"><td style="padding: 6px; border: 1px solid #ddd;">√x</td><td style="border: 1px solid #ddd;">-</td><td style="border: 1px solid #ddd;">-</td><td style="border: 1px solid #ddd;">0⁺</td><td style="border: 1px solid #ddd;">+∞</td></tr>
</table>
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. نهاية دالة كثير حدود</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 قاعدة:</strong> نهاية كثير حدود في ±∞ هي نهاية الحد الأعلى درجة.<br/>
lim(x→±∞) (aₙxⁿ + ... + a₁x + a₀) = lim(x→±∞) aₙxⁿ
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> lim(x→+∞) (3x³ - 5x² + 2) = lim(x→+∞) 3x³ = +∞
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. نهاية دالة كسرية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 قاعدة:</strong> نهاية P(x)/Q(x) في ±∞ هي نهاية نسبة الحدين الأعلى درجة.
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> أوجد النهايات:<br/>
1) lim(x→+∞) (x⁴ - 3x² + 1)<br/>
2) lim(x→-∞) (2x³ + x - 5)<br/>
3) lim(x→+∞) (3x² - 1)/(2x² + x)
</div>
</div>' WHERE id = '232748f1-f4b6-4940-9cbf-a37899495b0c';

-- 62) العمليات على النهايات (السلوك التقاربي)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">العمليات على النهايات</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. نهاية مجموع</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 القواعد:</strong><br/>
• ℓ + ℓ'' = ℓ + ℓ''<br/>
• ℓ + (+∞) = +∞<br/>
• (+∞) + (+∞) = +∞<br/>
• <strong>حالة غير محددة:</strong> (+∞) + (-∞) → شكل غير محدد!
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. نهاية جداء</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 القواعد:</strong><br/>
• ℓ × ℓ'' = ℓ·ℓ''<br/>
• ℓ × (±∞) = ±∞ (إذا ℓ ≠ 0، الإشارة حسب القاعدة)<br/>
• <strong>حالة غير محددة:</strong> 0 × (±∞) → شكل غير محدد!
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. نهاية حاصل قسمة</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 القواعد:</strong><br/>
• ℓ / ℓ'' = ℓ/ℓ'' (إذا ℓ'' ≠ 0)<br/>
• ℓ / (±∞) = 0<br/>
• <strong>أشكال غير محددة:</strong> ∞/∞ و 0/0
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">4. رفع حالة عدم التحديد</h3>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ تقنيات:</strong><br/>
• <strong>∞/∞:</strong> إخراج الحد المهيمن (أعلى درجة) بعامل مشترك<br/>
• <strong>∞ - ∞:</strong> إخراج بعامل مشترك أو ضرب بالمرافق<br/>
• <strong>0/0:</strong> تحليل واختصار العامل المشترك
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> ارفع حالة عدم التحديد ثم أوجد النهاية:<br/>
1) lim(x→+∞) [(x²+3x) - (x²-x)] (∞-∞)<br/>
2) lim(x→1) (x²-1)/(x-1) (0/0)<br/>
3) lim(x→+∞) (2x+1)/(3x²-5) (∞/∞)
</div>
</div>' WHERE id = '9de11277-49e0-4774-b193-81344555ce7e';

-- 63) المستقيمات المقاربة (السلوك التقاربي)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المستقيمات المقاربة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المستقيم المقارب الأفقي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> المستقيم y = ℓ مقارب أفقي لـ (C_f) إذا:<br/>
lim(x→+∞) f(x) = ℓ أو lim(x→-∞) f(x) = ℓ
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. المستقيم المقارب العمودي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> المستقيم x = a مقارب عمودي لـ (C_f) إذا:<br/>
lim(x→a⁺) f(x) = ±∞ أو lim(x→a⁻) f(x) = ±∞
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. المستقيم المقارب المائل</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 تعريف:</strong> المستقيم y = ax + b مقارب مائل لـ (C_f) إذا:<br/>
lim(x→±∞) [f(x) - (ax + b)] = 0<br/><br/>
<strong>لإيجاده:</strong><br/>
a = lim(x→±∞) f(x)/x<br/>
b = lim(x→±∞) [f(x) - ax]
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = (x² + 2x)/(x + 1)<br/>
القسمة: f(x) = x + 1 - 1/(x+1)<br/>
• المستقيم x = -1 مقارب عمودي (lim f = ±∞)<br/>
• المستقيم y = x + 1 مقارب مائل (الباقي → 0)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> f(x) = (2x² - 3x + 1)/(x - 2)<br/>
1) حدد مجموعة التعريف والمستقيم المقارب العمودي<br/>
2) حدد المستقيم المقارب المائل<br/>
3) ادرس وضع المنحنى بالنسبة للمستقيم المقارب المائل
</div>
</div>' WHERE id = '5aa3ac0a-6851-4fa4-8f84-db60828c908a';

-- 64) عموميات (المتتاليات العددية)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">عموميات حول المتتاليات العددية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريف متتالية عددية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> المتتالية العددية هي دالة من ℕ (أو جزء منه) إلى ℝ. تُرمز (uₙ) ويُسمى uₙ الحد العام.<br/>
<strong>طرق التعريف:</strong><br/>
• بالصيغة الصريحة: uₙ = f(n)، مثال: uₙ = 3n + 1<br/>
• بعلاقة الترجع: uₙ₊₁ = g(uₙ)، مثال: uₙ₊₁ = 2uₙ - 1, u₀ = 3
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. اتجاه تغير متتالية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 طرق الدراسة:</strong><br/>
• (uₙ) متزايدة ⟺ uₙ₊₁ - uₙ ≥ 0 لكل n<br/>
• (uₙ) متناقصة ⟺ uₙ₊₁ - uₙ ≤ 0 لكل n<br/>
• إذا uₙ &gt; 0: (uₙ) متزايدة ⟺ uₙ₊₁/uₙ ≥ 1
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. متتالية محدودة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong><br/>
• (uₙ) محدودة من الأعلى ⟺ ∃M, ∀n: uₙ ≤ M<br/>
• (uₙ) محدودة من الأسفل ⟺ ∃m, ∀n: uₙ ≥ m<br/>
• (uₙ) محدودة ⟺ محدودة من الأعلى ومن الأسفل
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احسب الحدود u₀ إلى u₄ لـ: uₙ = (n²-1)/(n+2)<br/>
2) ادرس اتجاه تغير: uₙ₊₁ = √(uₙ + 6), u₀ = 1<br/>
3) أثبت أن uₙ = (-1)ⁿ/n محدودة
</div>
</div>' WHERE id = 'd5520caa-5c16-48ab-8f4d-5d471dcda02b';

-- 65) المتتاليات الحسابية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المتتاليات الحسابية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> (uₙ) متتالية حسابية أساسها r إذا: uₙ₊₁ = uₙ + r لكل n<br/>
الحد العام: <strong>uₙ = u₀ + n·r</strong> أو uₙ = uₚ + (n-p)·r
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. المجموع</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغة:</strong><br/>
Sₙ = u₀ + u₁ + ... + uₙ = (n+1)(u₀ + uₙ)/2<br/>
أي: عدد الحدود × (الأول + الأخير) / 2<br/><br/>
حالة خاصة: 1 + 2 + 3 + ... + n = n(n+1)/2
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> uₙ حسابية، u₀ = 3، r = 5<br/>
uₙ = 3 + 5n<br/>
u₁₀ = 3 + 50 = 53<br/>
S₁₀ = 11 × (3 + 53)/2 = 11 × 28 = 308
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) (uₙ) حسابية: u₃ = 11 و u₇ = 23. أوجد r و u₀<br/>
2) احسب: S = 2 + 5 + 8 + 11 + ... + 302<br/>
3) أوجد n بحيث مجموع n حد الأول يتجاوز 1000، إذا u₀ = 1 و r = 3
</div>
</div>' WHERE id = '96acb02f-7b38-4521-bab5-7e6f2afe6b0a';

-- 66) المتتاليات الهندسية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المتتاليات الهندسية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> (uₙ) متتالية هندسية أساسها q إذا: uₙ₊₁ = q × uₙ لكل n<br/>
الحد العام: <strong>uₙ = u₀ × qⁿ</strong> أو uₙ = uₚ × qⁿ⁻ᵖ
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. المجموع</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغة (q ≠ 1):</strong><br/>
Sₙ = u₀ + u₁ + ... + uₙ = u₀ × (1 - qⁿ⁺¹)/(1 - q)<br/><br/>
أو: <strong>S = الحد الأول × (1 - qعدد الحدود)/(1 - q)</strong>
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> uₙ هندسية، u₀ = 2، q = 3<br/>
uₙ = 2 × 3ⁿ<br/>
u₅ = 2 × 243 = 486<br/>
S₅ = 2(1-3⁶)/(1-3) = 2(1-729)/(-2) = 728
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. النهاية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 خاصية:</strong><br/>
• |q| &lt; 1: lim uₙ = 0<br/>
• q &gt; 1: lim |uₙ| = +∞<br/>
• q = 1: uₙ = u₀ (ثابتة)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) (uₙ) هندسية: u₂ = 12 و u₅ = 324. أوجد q و u₀<br/>
2) احسب: 1 + 2 + 4 + 8 + ... + 2¹⁰<br/>
3) مبلغ 10000 دج يستثمر بمعدل 5% سنوياً. ما قيمته بعد 10 سنوات؟
</div>
</div>' WHERE id = 'cf861f39-c909-486c-a5c5-b94596b24c72';

-- 67) المعادلات الخطية لمجهولين (الجمل الخطية)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المعادلات الخطية لمجهولين</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. جملة معادلتين خطيتين بمجهولين</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 الشكل العام:</strong><br/>
(S): { a₁x + b₁y = c₁<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{ a₂x + b₂y = c₂
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. طريقة التعويض</h3>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> { 2x + y = 5 ... (1)<br/>
{ x - 3y = -1 ... (2)<br/>
من (2): x = 3y - 1. نعوض في (1): 2(3y-1) + y = 5 → 7y = 7 → y = 1<br/>
x = 3(1) - 1 = 2. الحل: (2, 1)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. طريقة الحذف (التآلف الخطي)</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 المبدأ:</strong> نضرب المعادلتين بأعداد مناسبة بحيث يُحذف أحد المجهولين عند الجمع.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">4. طريقة المحددات (كرامر)</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغ كرامر:</strong> D = a₁b₂ - a₂b₁<br/>
إذا D ≠ 0: x = (c₁b₂ - c₂b₁)/D, y = (a₁c₂ - a₂c₁)/D
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> حل بثلاث طرق:<br/>
{ 3x - 2y = 7<br/>
{ 5x + y = 13
</div>
</div>' WHERE id = 'a3c89fa8-9a78-4a6a-9bc0-76ca927792f6';

-- 68) جمل ثلاث معادلات خطية لثلاثة مجاهيل
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">جمل ثلاث معادلات خطية لثلاثة مجاهيل</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الشكل العام</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 الجملة:</strong><br/>
{ a₁x + b₁y + c₁z = d₁<br/>
{ a₂x + b₂y + c₂z = d₂<br/>
{ a₃x + b₃y + c₃z = d₃
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. طريقة الحذف (غاوس)</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 الخطوات:</strong><br/>
1) نحذف x من المعادلتين الثانية والثالثة<br/>
2) نحصل على جملة معادلتين بمجهولين (y, z)<br/>
3) نحل هذه الجملة<br/>
4) نعوض لإيجاد x
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong><br/>
{ x + y + z = 6 ... (1)<br/>
{ 2x - y + z = 3 ... (2)<br/>
{ x + 2y - z = 4 ... (3)<br/>
(2)-(1): x - 2y = -3 ... (4)<br/>
(3)-(1): y - 2z = -2 ... (5)<br/>
من (1)+(3): 2x + 3y = 10 ... (6)<br/>
بحل (4) و (6): x = 1, y = 8/3... → الحل (1, 2, 3)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> حل الجملة:<br/>
{ 2x + y - z = 1<br/>
{ x - y + 2z = 5<br/>
{ 3x + 2y + z = 8
</div>
</div>' WHERE id = '4dd037e1-0960-4c44-b227-3d6cc75d1ec9';

-- 69) المتراجحات الخطية لمجهولين
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المتراجحات الخطية لمجهولين</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. متراجحة خطية بمجهولين</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> المتراجحة ax + by ≤ c (أو ≥, &lt;, &gt;) تمثّل نصف مستوي محدود بالمستقيم ax + by = c.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. التمثيل البياني</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 طريقة:</strong><br/>
1) نرسم المستقيم ax + by = c<br/>
2) نختار نقطة اختبار (مثلاً O(0,0)) لا تنتمي للمستقيم<br/>
3) إذا تحققت المتراجحة: الحل هو نصف المستوي الذي يحتوي النقطة<br/>
4) إذا لم تتحقق: الحل هو النصف الآخر
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> مجموعة حلول 2x + y ≤ 6:<br/>
نرسم 2x + y = 6، ثم نختبر O(0,0): 0 + 0 = 0 ≤ 6 ✓<br/>
الحل: نصف المستوي الذي يحتوي الأصل (أسفل المستقيم)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. جملة متراجحات (البرمجة الخطية)</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 مبدأ:</strong> مجموعة حلول جملة متراجحات = تقاطع مجموعات حلول كل متراجحة = منطقة مقبولة (مضلع محدب).
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> مثّل بيانياً مجموعة حلول:<br/>
{ x + y ≤ 8<br/>
{ 2x + y ≤ 12<br/>
{ x ≥ 0, y ≥ 0<br/>
ثم أوجد الحد الأقصى لـ Z = 3x + 5y في المنطقة المقبولة
</div>
</div>' WHERE id = '0ca8775b-58cb-4e73-9d3e-0c0e84311b74';

-- 70) مفردات الإحتمالات
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">مفردات الإحتمالات</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المصطلحات الأساسية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريفات:</strong><br/>
• <strong>التجربة العشوائية:</strong> تجربة نتيجتها غير محددة مسبقاً<br/>
• <strong>الفضاء العيني Ω:</strong> مجموعة كل النتائج الممكنة<br/>
• <strong>الحدث:</strong> جزء من Ω<br/>
• <strong>الحدث الأولي (البسيط):</strong> يحتوي نتيجة واحدة {ω}<br/>
• <strong>الحدث المؤكد:</strong> هو Ω نفسه<br/>
• <strong>الحدث المستحيل:</strong> هو ∅
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. العمليات على الأحداث</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 العمليات:</strong><br/>
• A ∪ B: الحدث "A أو B" (اتحاد)<br/>
• A ∩ B: الحدث "A و B" (تقاطع)<br/>
• Ā: الحدث المعاكس لـ A (المتممة)<br/>
• A ∩ B = ∅: الحدثان متنافيان (لا يقعان معاً)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> رمي حجر نرد: Ω = {1,2,3,4,5,6}<br/>
A = "عدد زوجي" = {2,4,6}<br/>
B = "عدد أكبر من 3" = {4,5,6}<br/>
A ∪ B = {2,4,5,6}, A ∩ B = {4,6}, Ā = {1,3,5}
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> سحب بطاقة من 52: A = "بطاقة حمراء", B = "بطاقة صورة"<br/>
1) حدد Ω و |Ω|<br/>
2) حدد A, B, A∩B, A∪B<br/>
3) هل A و B متنافيان؟
</div>
</div>' WHERE id = '896bb478-ea38-452f-a52e-91535e9bde93';

-- 71) الاحتمالات
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الاحتمالات</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريف الاحتمال</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> الاحتمال هو دالة P من مجموعة أجزاء Ω إلى [0,1] تحقق:<br/>
• P(Ω) = 1<br/>
• P(A ∪ B) = P(A) + P(B) إذا A ∩ B = ∅
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. تكافؤ الاحتمالات</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 في حالة تساوي الاحتمالات (التكافؤ):</strong><br/>
P(A) = |A| / |Ω| = عدد الحالات الموافقة / عدد الحالات الممكنة
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. الخواص الأساسية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 خواص:</strong><br/>
• 0 ≤ P(A) ≤ 1<br/>
• P(Ā) = 1 - P(A)<br/>
• P(∅) = 0<br/>
• P(A ∪ B) = P(A) + P(B) - P(A ∩ B)<br/>
• A ⊂ B ⟹ P(A) ≤ P(B)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> رمي حجر نرد متوازن:<br/>
P("عدد زوجي") = 3/6 = 1/2<br/>
P("عدد &gt; 4") = 2/6 = 1/3<br/>
P("زوجي و &gt; 4") = |{6}|/6 = 1/6<br/>
P("زوجي أو &gt; 4") = 1/2 + 1/3 - 1/6 = 2/3
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> كيس يحتوي 3 كرات حمراء و4 زرقاء و3 خضراء. نسحب كرة عشوائياً:<br/>
1) ما احتمال أن تكون حمراء؟<br/>
2) ما احتمال أن تكون غير زرقاء؟<br/>
3) ما احتمال أن تكون حمراء أو خضراء؟
</div>
</div>' WHERE id = '17efbf5b-d82b-48f1-81b8-39a220340013';

-- 72) تذكير حول الدوال (شعبة 3 - الدوال العددية)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">تذكير حول الدوال</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. مفهوم الدالة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تذكير:</strong> الدالة العددية f هي قاعدة تربط بكل عدد x من مجموعة التعريف D_f عدداً وحيداً f(x).<br/>
• <strong>مجموعة التعريف:</strong> مجموعة قيم x التي تكون عندها f(x) معرّفة<br/>
• <strong>صورة a:</strong> هي f(a) | <strong>السابق لـ b:</strong> هو x حيث f(x) = b
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الدوال المرجعية الأساسية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 الدوال:</strong><br/>
• الدالة التآلفية: f(x) = ax + b (مستقيم)<br/>
• دالة التربيع: f(x) = x² (قطع مكافئ)<br/>
• الدالة المقلوب: f(x) = 1/x (قطع زائد)<br/>
• دالة الجذر التربيعي: f(x) = √x<br/>
• دالة القيمة المطلقة: f(x) = |x|
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. الخواص العامة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 خواص:</strong><br/>
• <strong>الزوجية:</strong> f(-x) = f(x) → تماثل بالنسبة لمحور الأراتيب<br/>
• <strong>الفردية:</strong> f(-x) = -f(x) → تماثل بالنسبة للمبدأ<br/>
• <strong>اتجاه التغير:</strong> متزايدة/متناقصة على مجال
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) حدد مجموعة تعريف: f(x) = (x+1)/(x²-4)<br/>
2) ادرس زوجية g(x) = x³ + x<br/>
3) من المنحنى البياني، حدد مجالات التزايد والتناقص
</div>
</div>' WHERE id = '539e8c6f-7ec8-4fbf-a982-3c0093927ac1';

-- 73) الدوال المرجعية (شعبة 3)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الدوال المرجعية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الدالة التآلفية f(x) = ax + b</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 خواص:</strong> D_f = ℝ<br/>
• a &gt; 0: متزايدة على ℝ | a &lt; 0: متناقصة على ℝ | a = 0: ثابتة<br/>
• المنحنى: مستقيم ميله a ويقطع محور الأراتيب في b
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. دالة التربيع f(x) = x²</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 خواص:</strong> D_f = ℝ، دالة زوجية<br/>
• متناقصة على ]-∞, 0] ومتزايدة على [0, +∞[<br/>
• الحد الأدنى: f(0) = 0 | المنحنى: قطع مكافئ رأسه O
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. دالة المقلوب f(x) = 1/x</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 خواص:</strong> D_f = ℝ*، دالة فردية<br/>
• متناقصة تماماً على ]-∞, 0[ وعلى ]0, +∞[<br/>
• المقاربات: x = 0 (عمودي)، y = 0 (أفقي)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">4. دالة الجذر التربيعي f(x) = √x</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 خواص:</strong> D_f = [0, +∞[<br/>
• متزايدة تماماً على [0, +∞[<br/>
• f(0) = 0, f(1) = 1, f(4) = 2
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) قارن بين x² و x على [0,1] وعلى [1,+∞[<br/>
2) حل بيانياً: x² = 1/x<br/>
3) ارسم منحنى g(x) = -(x-1)² + 4 وحدد رأس القطع ومحور التماثل
</div>
</div>' WHERE id = '3948511e-cf8f-471f-809f-9e4249afad60';

-- 74) عمليات على الدوال (شعبة 3)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">عمليات على الدوال</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. مجموع وفرق دالتين</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 القواعد:</strong><br/>
• (f + g)(x) = f(x) + g(x)، D_{f+g} = D_f ∩ D_g<br/>
• (f - g)(x) = f(x) - g(x)<br/>
• (k·f)(x) = k × f(x)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. جداء وقسمة دالتين</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 القواعد:</strong><br/>
• (f × g)(x) = f(x) × g(x)<br/>
• (f / g)(x) = f(x) / g(x), بشرط g(x) ≠ 0
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. تأثير العمليات على اتجاه التغير</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 قواعد:</strong><br/>
• f متزايدة و g متزايدة ⟹ f + g متزايدة<br/>
• f متزايدة ⟹ -f متناقصة<br/>
• f متزايدة و k &gt; 0 ⟹ kf متزايدة<br/>
• f متزايدة و k &lt; 0 ⟹ kf متناقصة
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = x² + 3x - 1, g(x) = 2x + 5<br/>
(f+g)(x) = x² + 5x + 4<br/>
(f·g)(x) = (x²+3x-1)(2x+5)<br/>
(f/g)(x) = (x²+3x-1)/(2x+5), D = ℝ\{-5/2}
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> f(x) = √x, g(x) = x - 2<br/>
1) حدد D_{f+g}, D_{f/g}<br/>
2) احسب (f·g)(4) و (f/g)(9)<br/>
3) ادرس اتجاه تغير h(x) = √x - x/2 على [0, +∞[
</div>
</div>' WHERE id = 'c379abd5-1308-49d1-9583-357d450ef409';

-- 75) اتجاه التغير (شعبة 3)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">اتجاه التغير</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريفات</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> على مجال I:<br/>
• f <strong>متزايدة</strong>: لكل x₁ &lt; x₂ من I: f(x₁) ≤ f(x₂)<br/>
• f <strong>متزايدة تماماً</strong>: لكل x₁ &lt; x₂ من I: f(x₁) &lt; f(x₂)<br/>
• f <strong>متناقصة</strong>: لكل x₁ &lt; x₂ من I: f(x₁) ≥ f(x₂)<br/>
• f <strong>رتيبة</strong>: متزايدة أو متناقصة على I
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. طرق دراسة اتجاه التغير</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 الطرق:</strong><br/>
<strong>أ) بالتعريف:</strong> ندرس إشارة f(x₁) - f(x₂) أو f(x₁) - f(x₂) لـ x₁ &lt; x₂<br/>
<strong>ب) باستعمال المشتقة:</strong> f'' &gt; 0 ⟹ متزايدة، f'' &lt; 0 ⟹ متناقصة<br/>
<strong>ج) بالرسم البياني:</strong> المنحنى يصعد = متزايدة
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = x² - 4x + 5<br/>
f''(x) = 2x - 4 = 2(x - 2)<br/>
f''(x) &lt; 0 لـ x &lt; 2 ⟹ متناقصة<br/>
f''(x) &gt; 0 لـ x &gt; 2 ⟹ متزايدة<br/>
الحد الأدنى: f(2) = 1
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. جدول التغيرات</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 مكونات:</strong><br/>
السطر 1: قيم x الخاصة (حدود المجموعة + جذور المشتقة)<br/>
السطر 2: إشارة f'' (+ أو -)<br/>
السطر 3: اتجاه تغير f (↗ أو ↘) مع القيم عند النقاط الخاصة
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) أنشئ جدول تغيرات f(x) = -x² + 6x - 5<br/>
2) ادرس اتجاه تغير g(x) = x + 1/x على ]0, +∞[<br/>
3) من جدول التغيرات، حدد القيم الحدية
</div>
</div>' WHERE id = '91769173-882e-4212-a0ff-095349cac6a6';
