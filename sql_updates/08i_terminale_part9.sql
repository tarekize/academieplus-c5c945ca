-- =====================================================
-- Terminale - Batch 9/13
-- Covers: دالة aˣ، التزايد المقارن، الدوال الأصلية، المعادلات التفاضلية، التكامل، العد، الاحتمالات
-- Lessons 121-135 of 181
-- =====================================================

-- 121) Étude des fonctions x ↦ aˣ et x ↦ ⁿ√x - دراسة الدوال aˣ و ⁿ√x
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">دراسة الدوال aˣ و ⁿ√x</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الدالة x ↦ aˣ</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 خواص (a &gt; 0, a ≠ 1):</strong><br/>
• Df = ℝ, aˣ &gt; 0 دائماً<br/>
• (aˣ)'' = ln(a)·aˣ<br/>
• a &gt; 1: متزايدة قطعاً، lim(-∞)=0, lim(+∞)=+∞<br/>
• 0 &lt; a &lt; 1: متناقصة قطعاً، lim(-∞)=+∞, lim(+∞)=0
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الدالة x ↦ ⁿ√x = x^(1/n)</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 خواص:</strong><br/>
• Df = [0, +∞[ (n زوجي) أو ℝ (n فردي)<br/>
• (x^(1/n))'' = (1/n)·x^(1/n - 1)<br/>
• هي الدالة العكسية لـ xⁿ على [0,+∞[<br/>
• متزايدة، مقعّرة، تمر من (0,0) و (1,1)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> قارن بين ³√x و √x و x على [0,+∞[<br/>
عند x = 8: ³√8 = 2, √8 ≈ 2.83, x = 8<br/>
عندما 0 &lt; x &lt; 1: ³√x &gt; √x &gt; x (الجذور أكبر)<br/>
عندما x &gt; 1: x &gt; √x &gt; ³√x (الجذور أصغر)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) ادرس وارسم f(x) = 2ˣ و g(x) = (1/2)ˣ على نفس المعلم<br/>
2) اشتق h(x) = x^(2/3) وادرس تغيراتها<br/>
3) حل: 4ˣ - 3·2ˣ + 2 = 0
</div>
</div>' WHERE id = '2d418167-297f-432f-92cc-e2d81b5a8940';

-- 122) Croissance comparée - التزايد المقارن
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">التزايد المقارن</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. نمو الدوال عند +∞</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 ترتيب النمو عند +∞:</strong><br/>
ln(x) ≪ xᵅ ≪ eˣ (لكل α &gt; 0)<br/><br/>
<strong>بالتحديد:</strong><br/>
• lim(x→+∞) ln(x)/xᵅ = 0 (α &gt; 0)<br/>
• lim(x→+∞) xⁿ/eˣ = 0 (n ∈ ℕ)<br/>
• lim(x→+∞) eˣ/xⁿ = +∞
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. سلوك عند 0</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 </strong><br/>
• lim(x→0⁺) xᵅ·ln(x) = 0 (α &gt; 0)<br/>
• lim(x→0⁺) xᵅ·[ln(x)]ⁿ = 0
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ تطبيقات:</strong><br/>
• lim(x→+∞) x²/eˣ = 0 (exp تهيمن)<br/>
• lim(x→+∞) [ln(x)]³/√x = 0 (القوة تهيمن على ln)<br/>
• lim(x→0⁺) x·ln(x)² = 0 (القوة تهيمن)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احسب: lim(x→+∞) (eˣ - x³) و lim(x→+∞) e⁻ˣ·x¹⁰⁰<br/>
2) احسب: lim(x→0⁺) √x·ln(x) و lim(x→+∞) ln(x)/∜x<br/>
3) رتّب حسب سرعة النمو: x², e^(x/2), [ln(x)]⁵, x·ln(x)
</div>
</div>' WHERE id = '5172ba1f-34ba-414c-8ee3-2c9692ad5287';

-- 123) Primitives - الدوال الأصلية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الدوال الأصلية (Primitives)</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> F دالة أصلية لـ f على I ⟺ F''(x) = f(x) لكل x ∈ I<br/>
<strong>خاصية:</strong> إذا F أصلية لـ f فإن F + C (C ثابت) هي كذلك.<br/>
كل أصليات f هي: F(x) + C
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. جدول الدوال الأصلية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐</strong><br/>
<table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
<tr style="background: #2c3e50; color: white;"><th style="padding: 8px; border: 1px solid #ddd;">f(x)</th><th style="padding: 8px;">F(x)</th></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">xⁿ (n≠-1)</td><td style="padding: 8px;">xⁿ⁺¹/(n+1)</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">1/x</td><td style="padding: 8px;">ln|x|</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">eˣ</td><td style="padding: 8px;">eˣ</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">cos(x)</td><td style="padding: 8px;">sin(x)</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">sin(x)</td><td style="padding: 8px;">-cos(x)</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">1/cos²(x)</td><td style="padding: 8px;">tan(x)</td></tr>
</table>
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> أوجد أصلية لكل من:<br/>
1) f(x) = 3x² - 2x + 5<br/>
2) g(x) = 2eˣ + 1/x<br/>
3) h(x) = cos(x) - sin(x) مع h(0) = 3
</div>
</div>' WHERE id = '0c1766b4-dd7f-4fc7-8408-44b1baee2f80';

-- 124) Calcul de primitives - حساب الدوال الأصلية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">حساب الدوال الأصلية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. أصلية u''·uⁿ و u''/u</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغ مركبة:</strong><br/>
• أصلية u''·uⁿ = uⁿ⁺¹/(n+1) + C (n ≠ -1)<br/>
• أصلية u''/u = ln|u| + C<br/>
• أصلية u''·eᵘ = eᵘ + C<br/>
• أصلية u''/√u = 2√u + C
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ أمثلة:</strong><br/>
• ∫(2x)(x²+1)³dx: u = x²+1, u'' = 2x ⟹ (x²+1)⁴/4 + C<br/>
• ∫(3x²)/(x³+1)dx: u = x³+1, u'' = 3x² ⟹ ln|x³+1| + C<br/>
• ∫cos(x)·e^(sin(x))dx: u = sin(x), u'' = cos(x) ⟹ e^(sin(x)) + C
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. التكامل بالتجزئة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 صيغة:</strong> ∫u·v'' = uv - ∫u''·v<br/>
<strong>متى نستعملها:</strong> عندما يكون الجداء x·eˣ أو x·sin(x) أو x·ln(x)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> أوجد أصلية:<br/>
1) f(x) = x·eˣ (بالتجزئة)<br/>
2) g(x) = (6x)/√(3x²+1)<br/>
3) h(x) = x·ln(x)
</div>
</div>' WHERE id = '48726cc6-ebef-404d-bcf7-2790f5f271d0';

-- 125) Équations différentielles - المعادلات التفاضلية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المعادلات التفاضلية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. y'' = ay (a ثابت)</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 الحل العام:</strong><br/>
y'' = ay ⟹ y(x) = C·eᵃˣ (C ∈ ℝ)<br/><br/>
<strong>مع شرط ابتدائي y(0) = y₀:</strong><br/>
y(x) = y₀·eᵃˣ
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> y'' = 3y مع y(0) = 2<br/>
y(x) = 2e³ˣ<br/>
<strong>تحقق:</strong> y'' = 6e³ˣ = 3·(2e³ˣ) = 3y ✓
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. y'' = ay + b</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 الحل العام:</strong><br/>
y'' = ay + b (a ≠ 0) ⟹ y(x) = C·eᵃˣ - b/a<br/><br/>
<strong>المكوّنات:</strong> حل خاص ثابت: y₀ = -b/a + حل المعادلة المتجانسة
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) حل y'' = -2y + 6 مع y(0) = 1<br/>
2) تركيز دواء: C''(t) = -0.5C(t), C(0) = 100mg. أوجد C(t) و متى C &lt; 10mg<br/>
3) حل y'' + y = 3 مع y(0) = 5
</div>
</div>' WHERE id = 'b92cb05d-ea78-40c5-8c44-d10d3b4b2457';

-- 126) Intégrale d'une fonction - تكامل دالة
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">تكامل دالة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> إذا F أصلية لـ f على [a,b]:<br/>
∫ₐᵇ f(x)dx = F(b) - F(a) = [F(x)]ₐᵇ<br/><br/>
<strong>تفسير هندسي:</strong> إذا f ≥ 0 فإن ∫ₐᵇ f(x)dx = مساحة المنطقة تحت المنحنى
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong><br/>
∫₀² (3x² + 1)dx = [x³ + x]₀² = (8+2) - (0+0) = 10<br/>
∫₁ᵉ (1/x)dx = [ln(x)]₁ᵉ = ln(e) - ln(1) = 1
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الخواص الأساسية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐</strong><br/>
• ∫ₐᵃ f(x)dx = 0<br/>
• ∫ₐᵇ f(x)dx = -∫ᵇₐ f(x)dx<br/>
• ∫ₐᵇ [αf + βg]dx = α∫ₐᵇ f dx + β∫ₐᵇ g dx (خطية)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احسب ∫₀¹ eˣ dx و ∫₀^(π/2) cos(x) dx<br/>
2) احسب ∫₁⁴ (2√x + 1/x) dx<br/>
3) احسب المساحة بين y = x² و محور Ox على [0,3]
</div>
</div>' WHERE id = 'b03ec711-d068-4ab3-8118-31924de8b473';

-- 127) Propriétés de l'intégrale - خواص التكامل
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">خواص التكامل</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. علاقة شال</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 علاقة شال:</strong><br/>
∫ₐᵇ f(x)dx = ∫ₐᶜ f(x)dx + ∫ᶜᵇ f(x)dx<br/>
(صالحة لأي ترتيب لـ a, b, c)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. مقارنة التكاملات</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 لكل a ≤ b:</strong><br/>
• إذا f ≥ 0 على [a,b] ⟹ ∫ₐᵇ f(x)dx ≥ 0<br/>
• إذا f ≤ g على [a,b] ⟹ ∫ₐᵇ f dx ≤ ∫ₐᵇ g dx<br/>
• |∫ₐᵇ f(x)dx| ≤ ∫ₐᵇ |f(x)|dx
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. التكامل ودوال التناظر</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌</strong><br/>
• f زوجية: ∫₋ₐᵃ f(x)dx = 2∫₀ᵃ f(x)dx<br/>
• f فردية: ∫₋ₐᵃ f(x)dx = 0<br/>
• f دورية بدور T: ∫ₐᵃ⁺ᵀ f(x)dx = ∫₀ᵀ f(x)dx
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احسب ∫₋₂² (x³ + x²) dx باستعمال خواص التناظر<br/>
2) بيّن أن ∫₀¹ eˣ dx ≤ e - 1<br/>
3) بيّن أن 1 ≤ ∫₀¹ √(1+x²) dx ≤ √2
</div>
</div>' WHERE id = '428b20f4-cd4b-4ae3-aeb5-c280450da745';

-- 128) Valeur moyenne - القيمة المتوسطة
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">القيمة المتوسطة لدالة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 تعريف:</strong> القيمة المتوسطة لـ f على [a,b]:<br/>
μ = (1/(b-a)) × ∫ₐᵇ f(x)dx<br/><br/>
<strong>تفسير:</strong> ارتفاع المستطيل الذي له نفس المساحة تحت المنحنى
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = x² على [0,3]<br/>
μ = (1/3)∫₀³ x² dx = (1/3)[x³/3]₀³ = (1/3)(9) = 3<br/>
القيمة المتوسطة لـ x² على [0,3] هي 3
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. مبرهنة القيمة المتوسطة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 مبرهنة:</strong> إذا f مستمرة على [a,b]:<br/>
∃c ∈ [a,b]: f(c) = μ = (1/(b-a))∫ₐᵇ f(x)dx
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احسب القيمة المتوسطة لـ eˣ على [0,1]<br/>
2) متوسط درجة الحرارة: T(t) = 20 + 10sin(πt/12) على [0,24]. أوجد μ<br/>
3) أوجد c حيث f(c) = μ لـ f(x) = 1/x على [1,e]
</div>
</div>' WHERE id = '0d4bdd8f-507a-44cd-bd10-8cb19471ddb8';

-- 129) Extension aux fonctions de signe quelconque - التكامل لدوال متغيرة الإشارة
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">التكامل لدوال متغيرة الإشارة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المساحة الجبرية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 ملاحظة مهمة:</strong><br/>
∫ₐᵇ f(x)dx = مساحة جبرية (يمكن أن تكون سالبة!)<br/>
• المنطقة فوق Ox ⟹ مساهمة موجبة<br/>
• المنطقة تحت Ox ⟹ مساهمة سالبة
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. حساب المساحة الحقيقية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغة:</strong><br/>
المساحة = ∫ₐᵇ |f(x)| dx<br/>
<strong>الطريقة:</strong> نحدد أصفار f ثم نحسب على كل مجال جزئي
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = x² - 1 على [-2, 2]<br/>
أصفار: x = ±1<br/>
A = ∫₋₂⁻¹ (x²-1)dx + ∫₋₁¹ |x²-1|dx + ∫₁² (x²-1)dx<br/>
= ∫₋₂⁻¹ (x²-1)dx + ∫₋₁¹ (1-x²)dx + ∫₁² (x²-1)dx<br/>
= 4/3 + 4/3 + 4/3 = 4
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احسب المساحة بين sin(x) و Ox على [0, 2π]<br/>
2) احسب المساحة المحصورة بين y = x³ - x و Ox<br/>
3) ∫₀²π sin(x)dx = 0 لكن المساحة ≠ 0. لماذا؟
</div>
</div>' WHERE id = '60228da7-d5c2-4564-9e07-a62d7a2d0714';

-- 130) Utilisation du calcul intégral - استعمال حساب التكامل
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">استعمال حساب التكامل</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. مساحة بين منحنيين</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغة:</strong><br/>
المساحة بين (Cf) و (Cg) على [a,b]:<br/>
A = ∫ₐᵇ |f(x) - g(x)| dx
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> المساحة بين y = x² و y = x على [0,1]<br/>
x ≥ x² على [0,1]<br/>
A = ∫₀¹ (x - x²)dx = [x²/2 - x³/3]₀¹ = 1/2 - 1/3 = 1/6
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الحجم الدوراني</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 صيغة:</strong> الحجم الناتج عن دوران (Cf) حول Ox:<br/>
V = π∫ₐᵇ [f(x)]² dx
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احسب المساحة بين y = eˣ و y = 1 و x = 0 و x = 1<br/>
2) احسب المساحة المحصورة بين y = x و y = x² و y = √x<br/>
3) أوجد حجم المخروط الناتج عن دوران y = x حول Ox بين 0 و h
</div>
</div>' WHERE id = '35c496ae-f70e-4669-a5f5-ff55ad52fff8';

-- 131) Applications du calcul intégral - تطبيقات حساب التكامل
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">تطبيقات حساب التكامل</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تطبيقات فيزيائية</h3>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ أمثلة:</strong><br/>
<strong>المسافة:</strong> d = ∫ₜ₁ᵗ² |v(t)| dt<br/>
<strong>العمل (الشغل):</strong> W = ∫ₐᵇ F(x) dx<br/>
<strong>الشحنة الكهربائية:</strong> Q = ∫₀ᵀ i(t) dt
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. تطبيقات اقتصادية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 فائض المستهلك:</strong><br/>
FC = ∫₀ᵠ⁰ D(q) dq - p₀·q₀<br/>
حيث D(q) = دالة الطلب، (q₀, p₀) = نقطة التوازن
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال فيزيائي:</strong> v(t) = 3t² - 6t + 3 (m/s) على [0, 4]<br/>
المسافة = ∫₀⁴ |3t²-6t+3| dt<br/>
v(t) = 3(t-1)², v(t) ≥ 0 على [0,4]<br/>
d = [t³ - 3t² + 3t]₀⁴ = 64 - 48 + 12 = 28 m
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) سرعة v(t) = 20 - 10t. احسب المسافة على [0,3]s<br/>
2) D(q) = 50 - 2q (طلب)، سعر التوازن p₀ = 30. أوجد فائض المستهلك<br/>
3) تيار i(t) = 5sin(100πt). احسب الشحنة على [0, 0.01]s
</div>
</div>' WHERE id = 'b93a0c6d-eaab-4b25-9cc0-984bd29673a7';

-- 132) Dénombrement - العدّ (التحليل التوافقي)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">العدّ (التحليل التوافقي)</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المبادئ الأساسية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 مبدأ الضرب:</strong> إذا كان لعمل m طريقة وعمل آخر n طريقة:<br/>
عدد طرق إنجازهما معاً = m × n<br/><br/>
<strong>مبدأ الجمع:</strong> إذا كان A و B حدثين متنافيين:<br/>
|A ∪ B| = |A| + |B|
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الترتيبات والتباديل</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغ:</strong><br/>
• <strong>الترتيبات:</strong> Aₙᵖ = n!/(n-p)! (اختيار p من n مع الترتيب)<br/>
• <strong>التباديل:</strong> Pₙ = n! = n×(n-1)×...×1<br/>
• n! = عاملي n<br/>
• 0! = 1, 1! = 1
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong><br/>
• كم طريقة لترتيب 4 أشخاص في صف؟ P₄ = 4! = 24<br/>
• كم طريقة لاختيار 3 من 8 مع الترتيب؟ A₈³ = 8!/5! = 336
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) كم رقم سري مكون من 4 أرقام مختلفة؟<br/>
2) كم كلمة من 5 حروف مختلفة من ABCDEFGH؟<br/>
3) 8 متسابقين: كم ترتيب للثلاثة الأوائل؟
</div>
</div>' WHERE id = '253987cb-f762-42ac-b27f-aac56d8cd674';

-- 133) Combinaisons - Formule du binôme - التوفيقات وصيغة ذات الحدين
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">التوفيقات وصيغة ذات الحدين</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التوفيقات</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغة:</strong><br/>
C(n,p) = n! / (p!(n-p)!) (اختيار p من n بدون ترتيب)<br/><br/>
<strong>خواص:</strong><br/>
• C(n,0) = C(n,n) = 1<br/>
• C(n,p) = C(n,n-p)<br/>
• C(n,p) = C(n-1,p-1) + C(n-1,p) (مثلث باسكال)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. صيغة ذات الحدين (نيوتن)</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 (a+b)ⁿ = Σₖ₌₀ⁿ C(n,k)·aⁿ⁻ᵏ·bᵏ</strong><br/><br/>
<strong>حالات خاصة:</strong><br/>
• (a+b)² = a² + 2ab + b²<br/>
• (a+b)³ = a³ + 3a²b + 3ab² + b³<br/>
• Σₖ₌₀ⁿ C(n,k) = 2ⁿ
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong><br/>
(1+x)⁴ = 1 + 4x + 6x² + 4x³ + x⁴<br/>
(2x-1)³ = 8x³ - 12x² + 6x - 1
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احسب C(10,3) و C(8,5)<br/>
2) انشر (x+2)⁵<br/>
3) لجنة من 4 من بين 10 (6 رجال و4 نساء). كم لجنة بها رجلان ونساء؟
</div>
</div>' WHERE id = 'b95a31c7-f783-499e-a686-9be0100b44a1';

-- 134) Modélisation d'une expérience aléatoire - نمذجة تجربة عشوائية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">نمذجة تجربة عشوائية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الفضاء العيني والأحداث</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريفات:</strong><br/>
• <strong>Ω:</strong> الفضاء العيني = مجموعة كل النتائج الممكنة<br/>
• <strong>حدث:</strong> جزء من Ω<br/>
• <strong>P(A):</strong> احتمال الحدث A, 0 ≤ P(A) ≤ 1<br/>
• P(Ω) = 1, P(∅) = 0
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. قوانين الاحتمال</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغ:</strong><br/>
• P(Ā) = 1 - P(A)<br/>
• P(A ∪ B) = P(A) + P(B) - P(A ∩ B)<br/>
• <strong>تجربة تساوي الاحتمال:</strong> P(A) = |A|/|Ω|
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> نرمي نردين<br/>
Ω: 36 نتيجة ممكنة<br/>
A: مجموع = 7 ⟹ A = {(1,6),(2,5),(3,4),(4,3),(5,2),(6,1)}<br/>
P(A) = 6/36 = 1/6
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) نسحب 3 كرات من صندوق يحتوي 5 حمراء و4 زرقاء. P(كلها حمراء)؟<br/>
2) نرمي قطعة نقود 4 مرات. P(صورتان على الأقل)؟<br/>
3) لعبة: تربح إذا مجموع نردين ≥ 9. P(ربح)؟
</div>
</div>' WHERE id = '14d6a4ae-c18c-42fb-b50d-17f176149e51';

-- 135) Probabilités conditionnelles - الاحتمالات الشرطية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الاحتمالات الشرطية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌</strong> P(A|B) = P(A ∩ B)/P(B) (بشرط P(B) ≠ 0)<br/>
<strong>تأويل:</strong> احتمال A علماً أن B قد تحقق
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. صيغة بايز والاحتمالات الكلية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغة الاحتمالات الكلية:</strong><br/>
إذا {B₁, B₂, ..., Bₙ} تجزئة لـ Ω:<br/>
P(A) = Σᵢ P(Bᵢ)·P(A|Bᵢ)<br/><br/>
<strong>صيغة بايز:</strong><br/>
P(Bₖ|A) = P(Bₖ)·P(A|Bₖ) / P(A)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> فحص طبي<br/>
• نسبة المرض في السكان: 1%<br/>
• حساسية الفحص: P(+|مريض) = 95%<br/>
• خصوصية: P(-|سليم) = 90%<br/>
P(+) = 0.01×0.95 + 0.99×0.10 = 0.1085<br/>
P(مريض|+) = (0.01×0.95)/0.1085 ≈ 8.8% فقط!
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) صندوقان: A(3 ⚪ 2 ⚫) و B(1 ⚪ 4 ⚫). نختار صندوقاً عشوائياً ونسحب كرة.<br/>
   a) P(كرة بيضاء)؟<br/>
   b) إذا الكرة بيضاء، P(من الصندوق A)؟<br/>
2) بيّن أن P(A|B) ≠ P(B|A) عموماً
</div>
</div>' WHERE id = 'ac47d216-ad64-4064-a463-65b3783914d9';
