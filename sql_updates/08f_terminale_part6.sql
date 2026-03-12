-- =====================================================
-- Terminale - Batch 6/13
-- Covers: المشتقات والحدود القصوى، الاستمرارية، النهايات، المقاربات، الدوال الأصلية، التكامل، اللوغاريتم، الأسية
-- Lessons 76-90 of 181
-- =====================================================

-- 76) Dérivées et extrema locaux - المشتقات والحدود القصوى المحلية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المشتقات والحدود القصوى المحلية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. شرط ضروري للحد الأقصى/الأدنى</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 مبرهنة:</strong> إذا f قابلة للاشتقاق في x₀ و f لها حد أقصى أو أدنى محلي في x₀ فإن f''(x₀) = 0
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. شرط كافٍ</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 قاعدة:</strong><br/>
• f''(x₀) = 0 و f'' تتغير من + إلى - ⟹ حد أقصى محلي<br/>
• f''(x₀) = 0 و f'' تتغير من - إلى + ⟹ حد أدنى محلي<br/>
• f''(x₀) = 0 و f'' لا تتغير إشارتها ⟹ ليس حداً أقصى ولا أدنى
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = x³ - 3x + 2<br/>
f''(x) = 3x² - 3 = 3(x-1)(x+1)<br/>
f''(x) = 0 ⟹ x = -1 أو x = 1<br/>
• x = -1: f'' تغير من + إلى - ⟹ حد أقصى: f(-1) = 4<br/>
• x = 1: f'' تغير من - إلى + ⟹ حد أدنى: f(1) = 0
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) أوجد الحدود القصوى لـ f(x) = 2x³ - 9x² + 12x - 4<br/>
2) أوجد أبعاد المستطيل ذي المحيط 20cm والمساحة الأكبر<br/>
3) بيّن أن f(x) = x⁴ لها حد أدنى في 0 رغم أن f''''(0) = 0
</div>
</div>' WHERE id = 'bad91242-1c39-4e17-842c-ff5c018c0fe0';

-- 77) Continuité et TVI - الاستمرارية ومبرهنة القيم المتوسطة
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الاستمرارية ومبرهنة القيم المتوسطة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الاستمرارية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> f مستمرة في a ⟺ lim(x→a) f(x) = f(a)<br/>
f مستمرة على مجال I ⟺ مستمرة في كل نقطة من I<br/>
<strong>خاصية:</strong> كل دالة قابلة للاشتقاق مستمرة (العكس غير صحيح)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. مبرهنة القيم المتوسطة (TVI)</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 مبرهنة:</strong> إذا f مستمرة على [a,b] و k بين f(a) و f(b):<br/>
∃c ∈ [a,b]: f(c) = k<br/><br/>
<strong>نتيجة (TVI مع الرتابة):</strong> إذا f مستمرة ورتيبة تماماً على [a,b] و k بين f(a) و f(b):<br/>
∃! c ∈ [a,b]: f(c) = k (الوجود والوحدانية)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> بيّن أن x⁵ + x - 1 = 0 لها حل وحيد في ]0,1[<br/>
f(x) = x⁵ + x - 1, f مستمرة ومتزايدة تماماً على ℝ<br/>
f(0) = -1 &lt; 0 و f(1) = 1 &gt; 0<br/>
⟹ حسب TVI: ∃! α ∈ ]0,1[: f(α) = 0
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) بيّن أن cos(x) = x لها حل في ]0, π/2[<br/>
2) بيّن أن eˣ = 2x + 1 لها حلّان وحدد مجالاً لكل منهما<br/>
3) أوجد تأطيراً بدقة 0.1 لحل x³ + x - 5 = 0
</div>
</div>' WHERE id = 'b66d8112-c903-487d-bc7b-f29f28faed57';

-- 78) Opérations sur les limites - العمليات على النهايات
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">العمليات على النهايات</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. نهاية المجموع</h3>

<table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
<tr style="background: #2c3e50; color: white;"><th style="padding: 8px; border: 1px solid #ddd;">lim f</th><th style="padding: 8px;">ℓ</th><th style="padding: 8px;">ℓ</th><th style="padding: 8px;">+∞</th><th style="padding: 8px;">+∞</th><th style="padding: 8px;">-∞</th><th style="padding: 8px;">+∞</th></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>lim g</strong></td><td style="padding: 8px;">ℓ''</td><td style="padding: 8px;">±∞</td><td style="padding: 8px;">+∞</td><td style="padding: 8px;">-∞</td><td style="padding: 8px;">-∞</td><td style="padding: 8px;">-∞</td></tr>
<tr style="background: #fef9e7;"><td style="padding: 8px; border: 1px solid #ddd;"><strong>lim(f+g)</strong></td><td style="padding: 8px;">ℓ+ℓ''</td><td style="padding: 8px;">±∞</td><td style="padding: 8px;">+∞</td><td style="padding: 8px; color: red;"><strong>FI</strong></td><td style="padding: 8px;">-∞</td><td style="padding: 8px; color: red;"><strong>FI</strong></td></tr>
</table>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الأشكال غير المحددة</h3>

<div style="background: #fdedec; padding: 15px; border-right: 4px solid #e74c3c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e74c3c;">⚠️ 7 أشكال غير محددة (FI):</strong><br/>
+∞ - ∞ &nbsp;&nbsp; 0 × ∞ &nbsp;&nbsp; ∞/∞ &nbsp;&nbsp; 0/0 &nbsp;&nbsp; 0⁰ &nbsp;&nbsp; 1^∞ &nbsp;&nbsp; ∞⁰<br/>
يجب رفعها بطرق خاصة: تحليل، ضرب بالمرافق، قسمة على الأعلى درجة...
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ أمثلة:</strong><br/>
• lim(x→+∞) (x²-3x) = lim x²(1-3/x) = +∞ (إخراج x²)<br/>
• lim(x→+∞) (√(x²+x) - x) = lim x/(√(x²+x)+x) = 1/2 (الضرب بالمرافق)<br/>
• lim(x→0) sin(x)/x = 1 (نهاية مرجعية)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احسب lim(x→+∞) (2x³-x+1)/(x³+3x²)<br/>
2) احسب lim(x→1) (x²-1)/(x-1)<br/>
3) احسب lim(x→+∞) (√(4x²+x) - 2x)
</div>
</div>' WHERE id = 'ee33afcf-a5bf-4108-9b02-b3495ee04b7e';

-- 79) Asymptotes - المستقيمات المقاربة
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المستقيمات المقاربة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المقارب الأفقي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> y = ℓ مقارب أفقي ⟺ lim(x→±∞) f(x) = ℓ<br/>
<strong>مثال:</strong> f(x) = (2x+1)/(x-1), lim = 2 ⟹ y = 2 مقارب أفقي
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. المقارب العمودي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> x = a مقارب عمودي ⟺ lim(x→a) f(x) = ±∞<br/>
<strong>مثال:</strong> f(x) = 1/(x-3), x = 3 مقارب عمودي
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. تحديد موقع المنحنى بالنسبة للمقارب</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 طريقة:</strong> ندرس إشارة f(x) - ℓ (أو f(x) - (ax+b)):<br/>
• f(x) - ℓ &gt; 0 ⟹ المنحنى فوق المقارب<br/>
• f(x) - ℓ &lt; 0 ⟹ المنحنى تحت المقارب
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = (x²+1)/(x-1) = x + 1 + 2/(x-1)<br/>
• x = 1 مقارب عمودي<br/>
• لا مقارب أفقي (لأن lim = ±∞)<br/>
• f(x) - (x+1) = 2/(x-1): &gt; 0 إذا x &gt; 1 (فوق) و &lt; 0 إذا x &lt; 1 (تحت)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) أوجد المقاربات لـ f(x) = (3x-1)/(x+2)<br/>
2) أوجد المقاربات لـ g(x) = x·e⁻ˣ + 1<br/>
3) حدد موقع منحنى f بالنسبة لمقاربه الأفقي
</div>
</div>' WHERE id = '4f49a9ce-3eda-4534-bb74-c268b2cb8573';

-- 80) Asymptote oblique - المقارب المائل
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المستقيم المقارب المائل</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> y = ax + b مقارب مائل لمنحنى f عند ±∞ إذا:<br/>
lim(x→±∞) [f(x) - (ax + b)] = 0
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. كيفية إيجاده</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 طريقة:</strong><br/>
1) a = lim(x→±∞) f(x)/x<br/>
2) b = lim(x→±∞) [f(x) - ax]<br/>
إذا كانت a و b أعداداً حقيقية فإن y = ax + b مقارب مائل
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 1:</strong> f(x) = (x²+2x+3)/(x+1)<br/>
القسمة: f(x) = x + 1 + 2/(x+1)<br/>
lim [f(x) - (x+1)] = lim 2/(x+1) = 0 ⟹ y = x + 1 مقارب مائل
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 2:</strong> f(x) = √(x²+x)<br/>
a = lim f(x)/x = lim √(1+1/x) = 1 (عند +∞)<br/>
b = lim (√(x²+x) - x) = lim x/(√(x²+x)+x) = 1/2<br/>
y = x + 1/2 مقارب مائل عند +∞
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) أوجد المقارب المائل لـ f(x) = (2x²-3x+1)/(x-2)<br/>
2) بيّن أن y = x - 1 مقارب مائل لـ g(x) = x - 1 + 1/√x عند +∞<br/>
3) حدد موقع المنحنى بالنسبة للمقارب المائل في كل تمرين
</div>
</div>' WHERE id = '5dbecfea-ae8b-479b-b63a-dc1b88d088d7';

-- 81) Primitives d'une fonction - الدوال الأصلية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الدوال الأصلية لدالة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> F دالة أصلية لـ f على I ⟺ F''(x) = f(x) لكل x ∈ I<br/>
إذا F أصلية لـ f فإن كل أصلية لها الشكل F(x) + C (ثابت)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. جدول الدوال الأصلية</h3>

<table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
<tr style="background: #2c3e50; color: white;"><th style="padding: 8px; border: 1px solid #ddd;">f(x)</th><th style="padding: 8px; border: 1px solid #ddd;">F(x)</th></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">xⁿ (n ≠ -1)</td><td style="padding: 8px; border: 1px solid #ddd;">xⁿ⁺¹/(n+1)</td></tr>
<tr style="background: #f8f9fa;"><td style="padding: 8px; border: 1px solid #ddd;">1/x</td><td style="padding: 8px; border: 1px solid #ddd;">ln|x|</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">eˣ</td><td style="padding: 8px; border: 1px solid #ddd;">eˣ</td></tr>
<tr style="background: #f8f9fa;"><td style="padding: 8px; border: 1px solid #ddd;">cos(x)</td><td style="padding: 8px; border: 1px solid #ddd;">sin(x)</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">sin(x)</td><td style="padding: 8px; border: 1px solid #ddd;">-cos(x)</td></tr>
<tr style="background: #f8f9fa;"><td style="padding: 8px; border: 1px solid #ddd;">1/(1+x²)</td><td style="padding: 8px; border: 1px solid #ddd;">arctan(x)</td></tr>
</table>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) أوجد أصلية كل من: 3x² + 2x - 1 و 1/x² + eˣ<br/>
2) أوجد F الأصلية لـ f(x) = 2x + 3 حيث F(1) = 5<br/>
3) أوجد أصلية f(x) = cos(x) - sin(x)
</div>
</div>' WHERE id = '5914f32c-390e-4f4b-abf5-f036e36c9b07';

-- 82) Calcul de primitives - حساب الدوال الأصلية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">حساب الدوال الأصلية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. أصلية الدوال المركبة</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغ:</strong><br/>
<table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
<tr style="background: #2c3e50; color: white;"><th style="padding: 8px; border: 1px solid #ddd;">f(x)</th><th style="padding: 8px; border: 1px solid #ddd;">F(x)</th></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">u'' × uⁿ</td><td style="padding: 8px; border: 1px solid #ddd;">uⁿ⁺¹/(n+1)</td></tr>
<tr style="background: #f8f9fa;"><td style="padding: 8px; border: 1px solid #ddd;">u''/u</td><td style="padding: 8px; border: 1px solid #ddd;">ln|u|</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">u'' × eᵘ</td><td style="padding: 8px; border: 1px solid #ddd;">eᵘ</td></tr>
<tr style="background: #f8f9fa;"><td style="padding: 8px; border: 1px solid #ddd;">u'' × cos(u)</td><td style="padding: 8px; border: 1px solid #ddd;">sin(u)</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">u'' / √u</td><td style="padding: 8px; border: 1px solid #ddd;">2√u</td></tr>
</table>
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ أمثلة:</strong><br/>
• ∫ 2x·e^(x²) dx: u = x², u'' = 2x ⟹ F = e^(x²) + C<br/>
• ∫ (2x+1)/(x²+x) dx: u = x²+x, u'' = 2x+1 ⟹ F = ln|x²+x| + C<br/>
• ∫ x/√(x²+1) dx: u = x²+1, u'' = 2x ⟹ F = √(x²+1) + C
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> أوجد أصلية كل من:<br/>
1) f(x) = (6x²)/(2x³+1)<br/>
2) g(x) = sin(x)·cos²(x)<br/>
3) h(x) = x·e^(-x²)
</div>
</div>' WHERE id = '6e0ffbf5-f617-4e5c-90ab-acf10d69e984';

-- 83) Propriétés de l'intégrale - خواص التكامل
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">خواص التكامل</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> ∫ₐᵇ f(x) dx = F(b) - F(a) = [F(x)]ₐᵇ<br/>
حيث F أصلية أي لـ f
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الخواص</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 خواص التكامل:</strong><br/>
• الخطية: ∫ₐᵇ (αf + βg) = α∫ₐᵇ f + β∫ₐᵇ g<br/>
• علاقة شال: ∫ₐᵇ f + ∫ᵇᶜ f = ∫ₐᶜ f<br/>
• ∫ₐᵃ f = 0 و ∫ₐᵇ f = -∫ᵇₐ f<br/>
• إذا f ≥ 0 على [a,b] فإن ∫ₐᵇ f ≥ 0<br/>
• إذا f ≤ g على [a,b] فإن ∫ₐᵇ f ≤ ∫ₐᵇ g
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong><br/>
∫₀² (3x² - 2x + 1) dx = [x³ - x² + x]₀² = (8-4+2) - 0 = 6
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احسب ∫₁³ (2x + 1/x) dx<br/>
2) احسب ∫₀^π sin(x) dx<br/>
3) بيّن أن ∫₀¹ eˣ dx ≤ e - 1 ≤ ∫₀¹ 3eˣ/2 dx (استعمل التأطير)
</div>
</div>' WHERE id = 'c5651afd-0c63-4067-a940-0b14d1048c40';

-- 84) Application de l'intégrale au calcul d'aires - تطبيق التكامل لحساب المساحات
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">تطبيق التكامل لحساب المساحات</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المساحة تحت منحنى</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغة:</strong> المساحة بين منحنى f ومحور الفواصل على [a,b]:<br/>
𝒜 = ∫ₐᵇ |f(x)| dx (بوحدة المساحة u.a.)<br/>
• إذا f ≥ 0: 𝒜 = ∫ₐᵇ f(x) dx<br/>
• إذا f ≤ 0: 𝒜 = -∫ₐᵇ f(x) dx
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. المساحة بين منحنيين</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغة:</strong> المساحة بين منحنى f ومنحنى g على [a,b]:<br/>
𝒜 = ∫ₐᵇ |f(x) - g(x)| dx
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> المساحة بين y = x² و y = x على [0,1]<br/>
x ≥ x² على [0,1] ⟹ 𝒜 = ∫₀¹ (x - x²) dx<br/>
= [x²/2 - x³/3]₀¹ = 1/2 - 1/3 = 1/6 u.a.
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احسب المساحة بين منحنى f(x) = x² - 1 ومحور الفواصل على [-1,2]<br/>
2) احسب المساحة المحصورة بين y = eˣ و y = 1 على [0, ln2]<br/>
3) أوجد المساحة بين y = x³ و y = x
</div>
</div>' WHERE id = '748cff7f-7692-48fa-bb5e-dfbd29d2fa07';

-- 85) Fonction logarithme népérien - دالة اللوغاريتم الطبيعي
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">دالة اللوغاريتم الطبيعي (النيبيري)</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> ln: ]0,+∞[ → ℝ الدالة المعرّفة بـ:<br/>
ln(x) = ∫₁ˣ (1/t) dt<br/>
أو: y = ln(x) ⟺ eʸ = x<br/>
ln(1) = 0, ln(e) = 1
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الخواص الجبرية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 خواص:</strong><br/>
• ln(ab) = ln(a) + ln(b)<br/>
• ln(a/b) = ln(a) - ln(b)<br/>
• ln(aⁿ) = n·ln(a)<br/>
• ln(1/a) = -ln(a)<br/>
• ln(√a) = ln(a)/2
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. خواص تحليلية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 </strong><br/>
• (ln(x))'' = 1/x<br/>
• ln متزايدة تماماً على ]0,+∞[<br/>
• lim(x→+∞) ln(x) = +∞ و lim(x→0⁺) ln(x) = -∞
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) بسّط: ln(12) - ln(4) + ln(3) و ln(e³) + ln(1/e)<br/>
2) حل: ln(x) = 2 و ln(x²) = ln(x) + ln(3)<br/>
3) حل: ln(x+1) + ln(x-1) = ln(3)
</div>
</div>' WHERE id = '66c9a073-e758-4206-b4b4-280eaa12757c';

-- 86) Étude de la fonction ln - دراسة دالة اللوغاريتم
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">دراسة دالة اللوغاريتم الطبيعي</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الدراسة الكاملة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 خواص ln:</strong><br/>
• مجال التعريف: ]0,+∞[<br/>
• ln''(x) = 1/x &gt; 0 ⟹ متزايدة تماماً<br/>
• ln''''(x) = -1/x² &lt; 0 ⟹ المنحنى مقعّر<br/>
• lim(x→0⁺) ln(x) = -∞ (مقارب عمودي x = 0)<br/>
• lim(x→+∞) ln(x) = +∞
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. نهايات مرجعية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 التزايد المقارن:</strong><br/>
• lim(x→+∞) ln(x)/x = 0 (x يسيطر على ln(x))<br/>
• lim(x→+∞) ln(x)/xⁿ = 0 لكل n &gt; 0<br/>
• lim(x→0⁺) x·ln(x) = 0 (x يسيطر على ln(x) عند 0)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> ادرس f(x) = x - ln(x) على ]0,+∞[<br/>
f''(x) = 1 - 1/x = (x-1)/x<br/>
f''(x) = 0 ⟹ x = 1<br/>
f(1) = 1 (حد أدنى مطلق)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احسب lim(x→+∞) (ln(x))²/x<br/>
2) ادرس وارسم f(x) = ln(x)/x<br/>
3) بيّن أن ln(x) ≤ x - 1 لكل x &gt; 0
</div>
</div>' WHERE id = 'e03123e0-d058-485b-98eb-295009da4703';

-- 87) Étude de la fonction ln(u) - دراسة الدالة ln(u)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">دراسة الدالة ln(u(x))</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الاشتقاق والمجال</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قاعدة:</strong><br/>
• مجال تعريف ln(u(x)): u(x) &gt; 0<br/>
• [ln(u(x))]'' = u''(x)/u(x)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ أمثلة:</strong><br/>
• f(x) = ln(x²+1): Df = ℝ, f''(x) = 2x/(x²+1)<br/>
• g(x) = ln(2x-1): Df = ]1/2,+∞[, g''(x) = 2/(2x-1)<br/>
• h(x) = ln|x|: Df = ℝ*, h''(x) = 1/x
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. دراسة كاملة</h3>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = ln(x² - 4)<br/>
• Df: x² - 4 &gt; 0 ⟹ x ∈ ]-∞,-2[ ∪ ]2,+∞[<br/>
• f''(x) = 2x/(x²-4)<br/>
• مقاربان عموديان: x = -2 و x = 2<br/>
• lim(x→+∞) f(x) = +∞
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) ادرس f(x) = ln(1+eˣ) وبيّن أن y = x مقارب مائل<br/>
2) ادرس g(x) = x - ln(x+1)<br/>
3) حل المعادلة ln(x-1) + ln(x+1) = ln(8)
</div>
</div>' WHERE id = '3282726b-feb2-4a78-81b9-fe991e245f89';

-- 88) Fonction logarithme de base a - دالة اللوغاريتم ذي الأساس a
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">دالة اللوغاريتم ذي الأساس a</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> لكل a &gt; 0 و a ≠ 1:<br/>
log_a(x) = ln(x)/ln(a)<br/>
y = log_a(x) ⟺ aʸ = x
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الخواص</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 خواص:</strong><br/>
• log_a(1) = 0 و log_a(a) = 1<br/>
• log_a(xy) = log_a(x) + log_a(y)<br/>
• log_a(x/y) = log_a(x) - log_a(y)<br/>
• log_a(xⁿ) = n·log_a(x)<br/>
• صيغة تغيير الأساس: log_a(x) = log_b(x)/log_b(a)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ أمثلة:</strong><br/>
• log₂(8) = ln(8)/ln(2) = 3ln(2)/ln(2) = 3<br/>
• log₁₀(1000) = 3<br/>
• log₃(1/9) = log₃(3⁻²) = -2
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احسب: log₂(32), log₅(125), log₄(1/16)<br/>
2) حل: log₂(x) + log₂(x-2) = 3<br/>
3) بيّن أن log_a(b) × log_b(a) = 1
</div>
</div>' WHERE id = 'f51c72a9-874e-4b34-90eb-a242a4c24aba';

-- 89) Fonctions exponentielles - الدوال الأسية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الدوال الأسية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريف الدالة الأسية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> الدالة الأسية أساس a (a &gt; 0, a ≠ 1):<br/>
x ↦ aˣ = e^(x·ln(a))<br/>
حالة خاصة: a = e ⟹ eˣ (الدالة الأسية الطبيعية)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. خواص الدالة الأسية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 خواص eˣ:</strong><br/>
• e⁰ = 1<br/>
• eˣ⁺ʸ = eˣ × eʸ<br/>
• eˣ⁻ʸ = eˣ/eʸ<br/>
• (eˣ)ⁿ = eⁿˣ<br/>
• (eˣ)'' = eˣ<br/>
• eˣ &gt; 0 لكل x ∈ ℝ<br/>
• lim(x→+∞) eˣ = +∞ و lim(x→-∞) eˣ = 0
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. مبرهنات مفيدة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 </strong><br/>
• eˣ = eʸ ⟺ x = y<br/>
• eˣ &gt; eʸ ⟺ x &gt; y<br/>
• ln و exp دالتان متعاكستان: ln(eˣ) = x و e^(ln(x)) = x
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) حل: e²ˣ - 3eˣ + 2 = 0<br/>
2) بسّط: e^(2ln3) و ln(e⁵) و e^(ln2+ln3)<br/>
3) حل المتراجحة e²ˣ⁺¹ &lt; e³
</div>
</div>' WHERE id = '37ec657a-6fef-4f80-8948-ff92aafe38e4';

-- 90) Étude de la fonction exponentielle - دراسة الدالة الأسية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">دراسة الدالة الأسية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الدراسة الكاملة لـ eˣ</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 خصائص:</strong><br/>
• Df = ℝ<br/>
• (eˣ)'' = eˣ &gt; 0 ⟹ متزايدة تماماً على ℝ<br/>
• (eˣ)'''' = eˣ &gt; 0 ⟹ محدّب (مقعّر لأعلى)<br/>
• مقارب أفقي y = 0 عند -∞<br/>
• lim(x→+∞) eˣ = +∞
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. التزايد المقارن</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 نهايات مرجعية:</strong><br/>
• lim(x→+∞) eˣ/xⁿ = +∞ (eˣ تنمو أسرع من أي كثيرة حدود)<br/>
• lim(x→-∞) xⁿ·eˣ = 0<br/>
• lim(x→0) (eˣ-1)/x = 1
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> ادرس f(x) = (x-1)eˣ<br/>
f''(x) = eˣ + (x-1)eˣ = xeˣ<br/>
f''(x) = 0 ⟹ x = 0<br/>
f(0) = -1 (حد أدنى)<br/>
lim(x→-∞) f(x) = 0⁺, lim(x→+∞) f(x) = +∞
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) ادرس وارسم f(x) = x²·e⁻ˣ<br/>
2) احسب lim(x→+∞) (e²ˣ - 1)/(e²ˣ + 1)<br/>
3) بيّن أن eˣ ≥ 1 + x لكل x ∈ ℝ
</div>
</div>' WHERE id = 'd0bf7b55-65b2-4ad3-bdac-07b18cccbc00';
