-- =====================================================
-- Terminale - Batch 2/13
-- Covers: الدوال الأسية واللوغاريتمية (fin) + التزايد المقارن + الدوال الأصلية + الحساب التكاملي + الاحتمالات
-- Lessons 16-30 of 181
-- =====================================================

-- 16) دراسة الدالة ln(u)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">دراسة الدالة ln(u)</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريف الدالة ln∘u</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> إذا كانت u دالة معرفة وموجبة قطعاً على مجال I، فإن الدالة f = ln∘u المعرفة بـ:<br/>
f(x) = ln(u(x))<br/>
معرفة على I بشرط u(x) &gt; 0 لكل x من I.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. اشتقاق ln(u)</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 مبرهنة:</strong> إذا كانت u قابلة للاشتقاق وموجبة قطعاً:<br/>
[ln(u)]'' = u''/u<br/><br/>
<strong>حالات خاصة:</strong><br/>
• [ln(ax+b)]'' = a/(ax+b)<br/>
• [ln(x²+1)]'' = 2x/(x²+1)<br/>
• [ln|x|]'' = 1/x
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = ln(x² - 4)<br/>
مجموعة التعريف: x² - 4 &gt; 0 ⟹ x ∈ ]-∞,-2[ ∪ ]2,+∞[<br/>
f''(x) = 2x/(x²-4)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. دراسة كاملة لدالة من الشكل ln(u)</h3>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = ln(x²+1) - 2x<br/>
• التعريف: ℝ (لأن x²+1 &gt; 0 دائماً)<br/>
• f''(x) = 2x/(x²+1) - 2 = (2x - 2x² - 2)/(x²+1) = -2(x²-x+1)/(x²+1)<br/>
• x²-x+1 &gt; 0 دائماً (Δ &lt; 0) ⟹ f''(x) &lt; 0 ⟹ f تناقصية على ℝ
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) ادرس واشتق f(x) = ln(2x+3)<br/>
2) ادرس تغيرات g(x) = x - ln(x) على ]0,+∞[<br/>
3) حدد مجموعة تعريف واشتقاق h(x) = ln((x-1)/(x+1))
</div>
</div>' WHERE id = 'bc173cb0-8e75-403e-9423-7b6a53cd22b7';

-- 17) قوى عدد حقيقي موجب
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">قوى عدد حقيقي موجب</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> لكل a &gt; 0 ولكل α ∈ ℝ:<br/>
a^α = e^(α·ln(a))<br/><br/>
<strong>حالات خاصة:</strong><br/>
• a^0 = 1<br/>
• a^1 = a<br/>
• a^(1/n) = ⁿ√a (الجذر النوني)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. خواص القوى</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قواعد (a &gt; 0, b &gt; 0):</strong><br/>
• a^α × a^β = a^(α+β)<br/>
• a^α / a^β = a^(α-β)<br/>
• (a^α)^β = a^(αβ)<br/>
• (ab)^α = a^α × b^α<br/>
• (a/b)^α = a^α / b^α
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> بسّط: (8)^(2/3) × (4)^(1/2)<br/>
= (2³)^(2/3) × (2²)^(1/2) = 2² × 2 = 4 × 2 = 8
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. اشتقاق x^α</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 مبرهنة:</strong> (x^α)'' = αx^(α-1) لكل x &gt; 0 و α ∈ ℝ
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) بسّط: 27^(2/3) و 16^(3/4)<br/>
2) اشتق f(x) = x^√2<br/>
3) حل المعادلة 3^x = 81
</div>
</div>' WHERE id = '9dbf7221-eb8f-4e13-b444-89ae50df85e2';

-- 18) دراسة الدالة x ↦ a^x و x ↦ ⁿ√x
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">دراسة الدالة x ↦ aˣ و x ↦ ⁿ√x</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الدالة الأسية ذات الأساس a</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> لكل a &gt; 0 و a ≠ 1:<br/>
f(x) = aˣ = e^(x·ln(a))<br/>
• معرّفة على ℝ بقيم في ]0,+∞[<br/>
• f''(x) = ln(a) × aˣ
</div>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 تغيرات:</strong><br/>
• a &gt; 1: الدالة تزايدية تماماً (النمو الأسي)<br/>
• 0 &lt; a &lt; 1: الدالة تناقصية تماماً (الاضمحلال الأسي)<br/>
• lim(x→+∞) aˣ = +∞ إذا a &gt; 1، و = 0 إذا 0 &lt; a &lt; 1<br/>
• lim(x→-∞) aˣ = 0 إذا a &gt; 1، و = +∞ إذا 0 &lt; a &lt; 1
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. دالة الجذر النوني</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> g(x) = x^(1/n) = ⁿ√x (n ∈ ℕ*)<br/>
• n فردي: معرفة على ℝ<br/>
• n زوجي: معرفة على [0,+∞[<br/>
• g''(x) = (1/n) × x^(1/n - 1)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = 2ˣ<br/>
f''(x) = ln(2) × 2ˣ ≈ 0.693 × 2ˣ &gt; 0 ⟹ f تزايدية على ℝ<br/>
f(0) = 1، f(1) = 2، f(-1) = 0.5
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) ادرس تغيرات f(x) = (1/3)ˣ وارسم منحناها<br/>
2) اشتق g(x) = ³√(x²+1)<br/>
3) حل المعادلة 5ˣ = 125 و 2ˣ = 1/8
</div>
</div>' WHERE id = '2a5cd254-c8cd-4f3e-b9b6-66b784f69531';

-- 19) التزايد المقارن
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">التزايد المقارن</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. مقارنة نهايات الدوال</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 مبرهنات أساسية عند +∞:</strong><br/>
• lim(x→+∞) eˣ/xⁿ = +∞ (الأسية أسرع من كل كثيرة حدود)<br/>
• lim(x→+∞) ln(x)/xⁿ = 0 لكل n &gt; 0 (اللوغاريتم أبطأ من كل قوة)<br/>
• lim(x→+∞) xⁿ/eˣ = 0 (كل قوة أبطأ من الأسية)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. نهايات عند الصفر</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 نتائج:</strong><br/>
• lim(x→0⁺) x·ln(x) = 0<br/>
• lim(x→0⁺) xⁿ·ln(x) = 0 لكل n &gt; 0<br/>
• lim(x→+∞) x^α·e^(-x) = 0 لكل α ∈ ℝ
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> حساب lim(x→+∞) (x² - 3x)eˣ<br/>
= lim x²eˣ(1 - 3/x) = +∞ (لأن x²eˣ → +∞ و (1-3/x) → 1)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. الترتيب: eˣ ≫ xⁿ ≫ ln(x)</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 ملخص:</strong> عند +∞، الدالة الأسية هي الأسرع نمواً، تليها القوى ثم اللوغاريتم:<br/>
eˣ ≫ xⁿ ≫ (ln x)ᵏ عند +∞
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احسب: lim(x→+∞) (ln x)³/x<br/>
2) احسب: lim(x→+∞) eˣ/(x³+1)<br/>
3) احسب: lim(x→0⁺) x²·ln(x)<br/>
4) ادرس نهايات f(x) = x·e^(-x) عند +∞ و -∞
</div>
</div>' WHERE id = '6b125989-f215-4d87-8d47-450e9c646418';

-- 20) الدوال الأصلية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الدوال الأصلية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> نقول إن الدالة F هي دالة أصلية للدالة f على المجال I إذا:<br/>
F''(x) = f(x) لكل x ∈ I
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. خاصية أساسية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 مبرهنة:</strong> إذا كانت F دالة أصلية لـ f على I، فإن جميع الدوال الأصلية لـ f هي:<br/>
G(x) = F(x) + C (حيث C ثابت حقيقي)<br/>
أي: دالتان أصليتان لنفس الدالة تختلفان بثابت.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. جدول الدوال الأصلية الأساسية</h3>

<table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
<tr style="background: #2c3e50; color: white;"><th style="padding: 10px; border: 1px solid #ddd;">f(x)</th><th style="padding: 10px; border: 1px solid #ddd;">F(x)</th><th style="padding: 10px; border: 1px solid #ddd;">الشروط</th></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">k (ثابت)</td><td style="padding: 8px; border: 1px solid #ddd;">kx</td><td style="padding: 8px; border: 1px solid #ddd;">ℝ</td></tr>
<tr style="background: #f8f9fa;"><td style="padding: 8px; border: 1px solid #ddd;">xⁿ</td><td style="padding: 8px; border: 1px solid #ddd;">x^(n+1)/(n+1)</td><td style="padding: 8px; border: 1px solid #ddd;">n ≠ -1</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">1/x</td><td style="padding: 8px; border: 1px solid #ddd;">ln|x|</td><td style="padding: 8px; border: 1px solid #ddd;">x ≠ 0</td></tr>
<tr style="background: #f8f9fa;"><td style="padding: 8px; border: 1px solid #ddd;">eˣ</td><td style="padding: 8px; border: 1px solid #ddd;">eˣ</td><td style="padding: 8px; border: 1px solid #ddd;">ℝ</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">cos(x)</td><td style="padding: 8px; border: 1px solid #ddd;">sin(x)</td><td style="padding: 8px; border: 1px solid #ddd;">ℝ</td></tr>
<tr style="background: #f8f9fa;"><td style="padding: 8px; border: 1px solid #ddd;">sin(x)</td><td style="padding: 8px; border: 1px solid #ddd;">-cos(x)</td><td style="padding: 8px; border: 1px solid #ddd;">ℝ</td></tr>
</table>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) أوجد الدالة الأصلية لـ f(x) = 3x² - 2x + 5 التي تحقق F(1) = 0<br/>
2) أوجد دالة أصلية لـ g(x) = 1/x² + eˣ<br/>
3) أوجد F بحيث F'' = cos(x) و F(0) = 2
</div>
</div>' WHERE id = 'ea308785-eaeb-4279-a598-6ee1e774ae10';

-- 21) حساب الدوال الأصلية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">حساب الدوال الأصلية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. دوال أصلية بالتركيب</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قواعد مهمة:</strong><br/>
• الدالة الأصلية لـ u'' × uⁿ هي u^(n+1)/(n+1) (إذا n ≠ -1)<br/>
• الدالة الأصلية لـ u''/u هي ln|u|<br/>
• الدالة الأصلية لـ u'' × eᵘ هي eᵘ<br/>
• الدالة الأصلية لـ u'' × cos(u) هي sin(u)<br/>
• الدالة الأصلية لـ u'' × sin(u) هي -cos(u)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. أمثلة تطبيقية</h3>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 1:</strong> ∫ 2x·(x²+1)³ dx<br/>
u = x²+1, u'' = 2x ⟹ الجواب: (x²+1)⁴/4 + C
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 2:</strong> ∫ (3x²)/(x³+5) dx<br/>
u = x³+5, u'' = 3x² ⟹ الجواب: ln|x³+5| + C
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 3:</strong> ∫ 4x·e^(2x²) dx<br/>
u = 2x², u'' = 4x ⟹ الجواب: e^(2x²) + C
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. الخطية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 خاصية:</strong><br/>
• الدالة الأصلية لـ (αf + βg) هي αF + βG<br/>
• حيث F و G أصليتا f و g
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) أوجد الدالة الأصلية لـ f(x) = (2x+1)/(x²+x+3)<br/>
2) أوجد الدالة الأصلية لـ g(x) = x·e^(x²)<br/>
3) أوجد F بحيث F''(x) = sin(2x)·cos(2x) و F(0) = 1
</div>
</div>' WHERE id = '5c7f065b-1351-4bbd-b51e-bfee7ddf0e79';

-- 22) المعادلات التفاضلية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المعادلات التفاضلية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المعادلة التفاضلية y'' = ay + b</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> المعادلة التفاضلية الخطية من الدرجة الأولى بمعاملات ثابتة هي:<br/>
y'' = ay + b حيث a, b ∈ ℝ و a ≠ 0
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. حل المعادلة y'' = ay</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 مبرهنة:</strong> الحل العام لـ y'' = ay هو:<br/>
y(x) = C·e^(ax) حيث C ∈ ℝ
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. حل المعادلة y'' = ay + b</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 مبرهنة:</strong> الحل العام لـ y'' = ay + b هو:<br/>
y(x) = C·e^(ax) - b/a حيث C ∈ ℝ<br/>
(-b/a هو الحل الخاص الثابت)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> y'' = 2y - 6 مع y(0) = 5<br/>
الحل العام: y = Ce^(2x) + 3<br/>
y(0) = 5 ⟹ C + 3 = 5 ⟹ C = 2<br/>
الحل: y(x) = 2e^(2x) + 3
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) حل y'' = -3y مع y(0) = 4<br/>
2) حل y'' = 5y - 10 مع y(0) = 0<br/>
3) أوجد الحل الخاص لـ y'' = -y + 7 الذي يمر بالنقطة (0, 3)
</div>
</div>' WHERE id = '46bd0e3a-2c4a-4dd7-a6a4-8ead8e5ea1cd';

-- 23) تكامل دالة
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">تكامل دالة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التكامل المحدود</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> إذا كانت f متصلة على [a,b] و F دالة أصلية لها:<br/>
∫ₐᵇ f(x)dx = F(b) - F(a) = [F(x)]ₐᵇ
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. التفسير الهندسي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 خاصية:</strong><br/>
• إذا f ≥ 0 على [a,b]: ∫ₐᵇ f(x)dx = المساحة بين المنحنى ومحور الفواصل<br/>
• إذا f ≤ 0 على [a,b]: المساحة = -∫ₐᵇ f(x)dx<br/>
• بشكل عام: المساحة = ∫ₐᵇ |f(x)|dx
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> ∫₁³ (2x + 1)dx<br/>
F(x) = x² + x<br/>
= [x² + x]₁³ = (9+3) - (1+1) = 12 - 2 = 10
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 2:</strong> ∫₀¹ eˣ dx = [eˣ]₀¹ = e - 1 ≈ 1.718
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احسب ∫₀² (x² - 3x + 2)dx<br/>
2) احسب ∫₁ᵉ (1/x)dx<br/>
3) احسب المساحة المحصورة بين y = x² و محور الفواصل على [-1, 2]
</div>
</div>' WHERE id = 'dc305851-bb9d-4105-a886-f6e25a36de8e';

-- 24) خواص التكامل
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">خواص التكامل</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الخطية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 خواص:</strong><br/>
• ∫ₐᵇ [f(x) + g(x)]dx = ∫ₐᵇ f(x)dx + ∫ₐᵇ g(x)dx<br/>
• ∫ₐᵇ k·f(x)dx = k·∫ₐᵇ f(x)dx<br/>
• ∫ₐᵇ [αf(x) + βg(x)]dx = α∫ₐᵇ f(x)dx + β∫ₐᵇ g(x)dx
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. علاقة شال</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 خاصية:</strong> لكل a، b، c:<br/>
∫ₐᵇ f(x)dx = ∫ₐᶜ f(x)dx + ∫ᶜᵇ f(x)dx
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. خواص الترتيب</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 خواص (a ≤ b):</strong><br/>
• إذا f ≥ 0 على [a,b] فإن ∫ₐᵇ f(x)dx ≥ 0<br/>
• إذا f ≤ g على [a,b] فإن ∫ₐᵇ f(x)dx ≤ ∫ₐᵇ g(x)dx<br/>
• |∫ₐᵇ f(x)dx| ≤ ∫ₐᵇ |f(x)|dx
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ خواص أخرى:</strong><br/>
• ∫ₐᵃ f(x)dx = 0<br/>
• ∫ₐᵇ f(x)dx = -∫ᵇₐ f(x)dx
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) بيّن أن ∫₀¹ (x²+x)dx = ∫₀¹ x²dx + ∫₀¹ xdx واحسب<br/>
2) استعمل علاقة شال: ∫₀³ |x-1|dx<br/>
3) بيّن أن 0 ≤ ∫₀¹ eˣ/(1+eˣ) dx ≤ 1
</div>
</div>' WHERE id = 'e2c28dd0-54ac-4481-8554-c134c948b2a4';

-- 25) القيمة المتوسطة
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">القيمة المتوسطة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريف القيمة المتوسطة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> القيمة المتوسطة لدالة f متصلة على [a,b] هي:<br/>
μ = (1/(b-a)) × ∫ₐᵇ f(x)dx
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. التفسير الهندسي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تفسير:</strong> المستطيل ذو الأساس [a,b] والارتفاع μ له نفس مساحة المنطقة المحصورة بين منحنى f ومحور الفواصل على [a,b].
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = x² على [0, 3]<br/>
μ = (1/3) × ∫₀³ x²dx = (1/3) × [x³/3]₀³ = (1/3) × 9 = 3
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. مبرهنة القيمة المتوسطة</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 مبرهنة:</strong> إذا كانت f متصلة على [a,b]، فإنه يوجد c ∈ [a,b] بحيث:<br/>
∫ₐᵇ f(x)dx = (b-a)·f(c)<br/>
أي: μ = f(c) لقيمة c معينة.
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احسب القيمة المتوسطة لـ f(x) = 2x + 1 على [0, 4]<br/>
2) احسب القيمة المتوسطة لـ g(x) = eˣ على [0, 1]<br/>
3) أوجد c المحققة لمبرهنة القيمة المتوسطة لـ f(x) = x² على [1, 4]
</div>
</div>' WHERE id = 'd7b33d21-4453-4aa3-b1f3-5882cf54f47d';

-- 26) التمديد إلى دالة إشارتها كيفية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">التمديد إلى دالة إشارتها كيفية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المشكلة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 إشكالية:</strong> عندما تكون الدالة f سالبة (أو تُغيّر إشارتها) على [a,b]، التكامل لا يمثل مباشرة مساحة. يجب التعامل مع الأجزاء الموجبة والسالبة بشكل منفصل.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. حساب المساحة الجبرية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قاعدة:</strong><br/>
• التكامل ∫ₐᵇ f(x)dx = المساحة الجبرية (موجب فوق المحور - سالب تحته)<br/>
• المساحة الحقيقية = ∫ₐᵇ |f(x)|dx<br/>
• إذا f تُلغى عند c ∈ ]a,b[:<br/>
المساحة = |∫ₐᶜ f(x)dx| + |∫ᶜᵇ f(x)dx|
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = x - 1 على [0, 3]<br/>
f تُلغى عند x = 1<br/>
المساحة = |∫₀¹ (x-1)dx| + |∫₁³ (x-1)dx|<br/>
= |[x²/2 - x]₀¹| + |[x²/2 - x]₁³|<br/>
= |−1/2| + |2| = 1/2 + 2 = 5/2
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احسب المساحة المحصورة بين y = x²-4 ومحور الفواصل على [-3, 3]<br/>
2) احسب المساحة بين y = sin(x) ومحور الفواصل على [0, 2π]<br/>
3) احسب المساحة بين المنحنيين y = x² و y = x على [0, 2]
</div>
</div>' WHERE id = '6a95707f-0296-4aca-a8fb-405efa0a8e8c';

-- 27) توظيف الحساب التكاملي لحساب دوال أصلية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">توظيف الحساب التكاملي لحساب دوال أصلية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الدالة التكاملية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> الدالة F المعرفة بـ: F(x) = ∫ₐˣ f(t)dt<br/>
هي الدالة الأصلية الوحيدة لـ f التي تُلغى عند a: F(a) = 0
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. مبرهنة أساسية في التحليل</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 مبرهنة:</strong> إذا كانت f متصلة على I و a ∈ I:<br/>
F(x) = ∫ₐˣ f(t)dt تحقق F''(x) = f(x)<br/>
وهي الدالة الأصلية الوحيدة التي تنعدم عند a.
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> F(x) = ∫₀ˣ e^(t²) dt<br/>
لا نستطيع حساب F بصيغة مغلقة، لكن نعرف أن:<br/>
• F''(x) = e^(x²)<br/>
• F(0) = 0<br/>
• F تزايدية (لأن F'' &gt; 0)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. التكامل بالأجزاء</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغة:</strong><br/>
∫ₐᵇ u(x)v''(x)dx = [u(x)v(x)]ₐᵇ - ∫ₐᵇ u''(x)v(x)dx
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احسب ∫₀¹ x·eˣ dx بالتكامل بالأجزاء<br/>
2) ادرس تغيرات F(x) = ∫₁ˣ ln(t)dt<br/>
3) بيّن أن ∫₀¹ t²·e^(-t) dt = 2 - 5/e
</div>
</div>' WHERE id = '66272b74-2758-48ba-9752-bb7e7074eda6';

-- 28) بعض تطبيقات الحساب التكاملي
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">بعض تطبيقات الحساب التكاملي</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. حساب المساحات</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 المساحة بين منحنيين:</strong><br/>
المساحة بين f و g على [a,b]: S = ∫ₐᵇ |f(x) - g(x)|dx
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> المساحة بين y = x² و y = x على [0, 1]<br/>
x ≥ x² على [0,1] ⟹ S = ∫₀¹ (x - x²)dx = [x²/2 - x³/3]₀¹ = 1/2 - 1/3 = 1/6
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. حساب الحجوم</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 حجم المجسم الدوراني:</strong> عند تدوير منحنى f حول محور الفواصل:<br/>
V = π ∫ₐᵇ [f(x)]² dx
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> حجم المخروط الناتج عن تدوير y = x حول Ox على [0, r]:<br/>
V = π∫₀ʳ x²dx = π[x³/3]₀ʳ = πr³/3
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. تطبيقات اقتصادية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 فائض المستهلك والمنتج:</strong><br/>
• فائض المستهلك = ∫₀ᵠ* D(q)dq - p*·q*<br/>
حيث D(q) دالة الطلب و (q*, p*) نقطة التوازن.
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احسب المساحة بين y = eˣ و y = e على [0, 1]<br/>
2) احسب حجم الكرة ذات نصف القطر R بالتكامل<br/>
3) إذا كان الربح الحدي R''(q) = 100 - 2q، احسب الربح الكلي لإنتاج 20 وحدة
</div>
</div>' WHERE id = 'c2ad44d4-f3ef-47b0-b224-e77ff3030bda';

-- 29) العد (القوائم - الترتيبات - التبديلات)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">العد: القوائم - الترتيبات - التبديلات</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. مبدأ العد الأساسي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 مبدأ الضرب:</strong> إذا كان للاختيار الأول n₁ إمكانية وللثاني n₂ ... وللأخير nₖ:<br/>
العدد الكلي = n₁ × n₂ × ... × nₖ
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. القوائم (التكرار مسموح)</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغة:</strong> عدد القوائم من p عنصراً من مجموعة ذات n عنصراً (التكرار مسموح):<br/>
nᵖ
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. الترتيبات (بدون تكرار)</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغة:</strong> Aₙᵖ = n!/(n-p)! = n(n-1)(n-2)...(n-p+1)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> A₅³ = 5!/(5-3)! = 5!/2! = 120/2 = 60
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">4. التبديلات</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغة:</strong> Pₙ = n! (عدد ترتيبات n عنصراً مختلفاً)<br/>
n! = 1 × 2 × 3 × ... × n و 0! = 1
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> كم طريقة لترتيب 5 كتب على رف؟<br/>
P₅ = 5! = 120 طريقة
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) كم رقم سري مكون من 4 أرقام يمكن تشكيله (التكرار مسموح)؟<br/>
2) كم طريقة لاختيار رئيس ونائب وأمين من 10 أعضاء؟<br/>
3) كم كلمة مكونة من 5 أحرف مختلفة من {A,B,C,D,E,F,G}؟
</div>
</div>' WHERE id = '8f56ac85-4087-499b-bdb1-ca7cf52ff133';

-- 30) التوفيقات - دستور ثنائي الحد
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">التوفيقات - دستور ثنائي الحد</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التوفيقات (التجميعات)</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> عدد الطرق لاختيار p عنصراً من n بدون ترتيب:<br/>
Cₙᵖ = (ⁿₚ) = n!/(p!(n-p)!) = Aₙᵖ/p!
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. خواص التوفيقات</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 خواص:</strong><br/>
• Cₙ⁰ = Cₙⁿ = 1<br/>
• Cₙ¹ = Cₙⁿ⁻¹ = n<br/>
• Cₙᵖ = Cₙⁿ⁻ᵖ (التناظر)<br/>
• Cₙᵖ = Cₙ₋₁ᵖ⁻¹ + Cₙ₋₁ᵖ (صيغة باسكال)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> C₅² = 5!/(2!3!) = 120/(2×6) = 10<br/>
(عدد طرق اختيار شخصين من 5)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. دستور ثنائي الحد (نيوتن)</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغة:</strong><br/>
(a+b)ⁿ = Σₖ₌₀ⁿ Cₙᵏ aⁿ⁻ᵏ bᵏ<br/><br/>
<strong>حالات خاصة:</strong><br/>
• (a+b)² = a² + 2ab + b²<br/>
• (a+b)³ = a³ + 3a²b + 3ab² + b³
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> (1+x)⁴ = C₄⁰ + C₄¹x + C₄²x² + C₄³x³ + C₄⁴x⁴<br/>
= 1 + 4x + 6x² + 4x³ + x⁴
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) في لجنة من 12 شخصاً، كم طريقة لتشكيل فريق من 4 أعضاء؟<br/>
2) انشر (2+x)⁵ باستعمال ثنائي الحد<br/>
3) بيّن أن Σₖ₌₀ⁿ Cₙᵏ = 2ⁿ
</div>
</div>' WHERE id = '75bc2078-6ee8-4fc0-b7a7-16115f8de022';
