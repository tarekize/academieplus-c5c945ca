-- =====================================================
-- Terminale - Batch 1/13
-- Covers: النهايات والاستمرارية + الاشتقاقية + الدوال الأسية واللوغاريتمية
-- Lessons 1-15 of 181
-- =====================================================

-- 1) الاستمرارية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الاستمرارية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 f مستمرة عند a ⟺ lim(x→a) f(x) = f(a)</strong><br/>
أي: النهاية موجودة = f(a) = القيمة عند النقطة<br/>
f مستمرة على I ⟺ مستمرة عند كل نقطة من I
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. خواص</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 مجموع/جداء/قسمة/تركيب دوال مستمرة = مستمرة</strong><br/>
جميع الدوال المرجعية مستمرة على مجموعات تعريفها
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. مبرهنة القيم الوسيطية (TVI)</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 f مستمرة على [a,b] و k بين f(a) و f(b):</strong><br/>
∃c ∈ [a,b]: f(c) = k<br/>
خاصة: f(a)×f(b) &lt; 0 ⟹ ∃c: f(c) = 0
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) بيّن أن x³+x-1 = 0 تقبل حلاً في [0,1]<br/>
2) بيّن أن cos(x) = x تقبل حلاً في [0,π/2]<br/>
3) f(x) = x³-3x+1. بيّن وجود 3 حلول لـ f(x) = 0
</div>
</div>' WHERE id = '9f06cf42-6be9-40ca-a0ef-b3d590476e40';

-- 2) الدوال المستمرة والرتيبة تماما
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الدوال المستمرة والرتيبة تماماً</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المبرهنة الأساسية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 f مستمرة ورتيبة تماماً على [a,b]:</strong><br/>
لكل k بين f(a) و f(b)، المعادلة f(x) = k تقبل حلاً وحيداً في [a,b]
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الدالة المعكوسة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 f مستمرة ورتيبة تماماً ⟹ f⁻¹ موجودة</strong><br/>
• f⁻¹ مستمرة ورتيبة بنفس المنحى<br/>
• منحنى f⁻¹ متناظر لمنحنى f بالنسبة لـ y = x
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = x³ متزايدة تماماً على ℝ<br/>
f⁻¹(x) = ∛x (الجذر التكعيبي)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) f(x) = 2x³-1. بيّن أن f(x) = 5 تقبل حلاً وحيداً<br/>
2) بيّن أن x⁵+x = 3 تقبل حلاً وحيداً وحدده بالتقريب<br/>
3) f(x) = x²+1 على [0,+∞[. أوجد f⁻¹
</div>
</div>' WHERE id = 'a993024b-751e-4520-b2d8-a3f958ea41af';

-- 3) الاشتقاقية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الاشتقاقية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 f قابلة للاشتقاق عند a:</strong><br/>
lim(x→a) [f(x)-f(a)]/(x-a) = f''(a) موجودة ومنتهية<br/>
أو: lim(h→0) [f(a+h)-f(a)]/h = f''(a)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الاشتقاقية والاستمرارية</h3>

<div style="background: #fdedec; padding: 15px; border-right: 4px solid #e74c3c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e74c3c;">⚠️ f قابلة للاشتقاق عند a ⟹ f مستمرة عند a</strong><br/>
العكس غير صحيح! مثال: f(x) = |x| مستمرة عند 0 لكن غير قابلة للاشتقاق
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. التفسير الهندسي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 المماس عند x = a: y = f''(a)(x-a)+f(a)</strong>
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) ادرس اشتقاقية f(x) = |x²-1| عند x = 1<br/>
2) f(x) = x·sin(1/x) إذا x≠0, f(0) = 0. هل f مستمرة؟ قابلة للاشتقاق عند 0؟<br/>
3) اكتب معادلة المماس لـ g(x) = x/(x²+1) عند x = 1
</div>
</div>' WHERE id = 'b5346f5b-7f45-4a1e-bdae-6a7eb6819bda';

-- 4) المشتقات والعمليات
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المشتقات والعمليات</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. جدول المشتقات الأساسية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐</strong><br/>
• (xⁿ)'' = nxⁿ⁻¹ | (1/x)'' = -1/x² | (√x)'' = 1/(2√x)<br/>
• (sin x)'' = cos x | (cos x)'' = -sin x | (tan x)'' = 1+tan²x = 1/cos²x<br/>
• (eˣ)'' = eˣ | (ln x)'' = 1/x
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. قواعد الاشتقاق</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 (f+g)'' = f''+g'' | (kf)'' = kf'' | (fg)'' = f''g+fg''</strong><br/>
(f/g)'' = (f''g-fg'')/g² | (fog)'' = g''×(f''og)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> أوجد المشتقة:<br/>
1) f(x) = x²eˣ<br/>
2) g(x) = ln(x²+1)<br/>
3) h(x) = sin(2x)cos(3x)<br/>
4) p(x) = eˣ/(x+1)
</div>
</div>' WHERE id = '207f6bb6-f928-411a-8189-c49bdde402e9';

-- 5) إتجاه التغير دالة
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">اتجاه التغير دالة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المبرهنة الأساسية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 على مجال I:</strong><br/>
• f''(x) &gt; 0 ⟹ f متزايدة تماماً<br/>
• f''(x) &lt; 0 ⟹ f متناقصة تماماً<br/>
• f''(x) = 0 ⟹ f ثابتة
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. جدول التغيرات</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 الخطوات:</strong><br/>
1) أوجد f''(x)<br/>
2) حل f''(x) = 0 لإيجاد النقاط الحرجة<br/>
3) ادرس إشارة f'' على كل مجال<br/>
4) أنشئ جدول التغيرات مع القيم الحدية
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = x³-3x²+4<br/>
f''(x) = 3x²-6x = 3x(x-2)<br/>
f''(x) = 0 عند x = 0 و x = 2<br/>
f متزايدة على ]-∞,0] ∪ [2,+∞[, متناقصة على [0,2]
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) أنشئ جدول تغيرات f(x) = x⁴-2x²+1<br/>
2) ادرس g(x) = xe⁻ˣ<br/>
3) بيّن أن h(x) = x+2sin(x) متزايدة تماماً على ℝ
</div>
</div>' WHERE id = 'e3782e17-87c9-4332-bd80-644cc5505d1f';

-- 6) اشتقاق دالة مركبة
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">اشتقاق دالة مركبة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. القاعدة العامة</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 (fog)''(x) = g''(x) × f''(g(x))</strong>
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. حالات مهمة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 صيغ المركبات:</strong><br/>
• [u(x)]ⁿ'' = n·u''(x)·[u(x)]ⁿ⁻¹<br/>
• [√u(x)]'' = u''(x)/[2√u(x)]<br/>
• [eᵘ⁽ˣ⁾]'' = u''(x)·eᵘ⁽ˣ⁾<br/>
• [ln u(x)]'' = u''(x)/u(x)<br/>
• [sin u(x)]'' = u''(x)·cos u(x)<br/>
• [cos u(x)]'' = -u''(x)·sin u(x)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ أمثلة:</strong><br/>
• f(x) = e²ˣ⁺¹ ⟹ f''(x) = 2e²ˣ⁺¹<br/>
• g(x) = ln(x²+3) ⟹ g''(x) = 2x/(x²+3)<br/>
• h(x) = (3x-1)⁵ ⟹ h''(x) = 15(3x-1)⁴
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> أوجد المشتقة:<br/>
1) f(x) = √(x²+2x+5)<br/>
2) g(x) = e^(sin x)<br/>
3) h(x) = ln(cos x)<br/>
4) p(x) = sin²(3x)
</div>
</div>' WHERE id = 'c52d64d9-ef8a-4d07-ba46-47b85d57289d';

-- 7) التقريب التآلفي - طريقة أولر
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">التقريب التآلفي - طريقة أولر</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التقريب التآلفي</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قرب a: f(a+h) ≈ f(a) + h·f''(a)</strong><br/>
تقريبات مشهورة قرب 0:<br/>
• eʰ ≈ 1+h | ln(1+h) ≈ h<br/>
• sin(h) ≈ h | cos(h) ≈ 1-h²/2<br/>
• (1+h)ⁿ ≈ 1+nh
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. طريقة أولر</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 لحل y'' = f(x,y) بشرط y(x₀) = y₀:</strong><br/>
بخطوة h: xₙ₊₁ = xₙ + h<br/>
yₙ₊₁ = yₙ + h·f(xₙ, yₙ)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> y'' = 2x, y(0) = 1, h = 0.5<br/>
x₀ = 0, y₀ = 1 | x₁ = 0.5, y₁ = 1+0.5×0 = 1<br/>
x₂ = 1, y₂ = 1+0.5×1 = 1.5 (الحل الحقيقي: y = x²+1 ⟹ y(1) = 2)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) قرّب: e⁰·⁰², ln(1.05), sin(3°)<br/>
2) بطريقة أولر: y'' = y, y(0) = 1, h = 0.1. قرّب e (5 خطوات)<br/>
3) قارن النتيجة بحساب (1.1)⁵
</div>
</div>' WHERE id = '7074b173-36b6-4766-86ac-8f5c04af913b';

-- 8) دراسة دالة مثلثية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">دراسة دالة مثلثية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. خطوات الدراسة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 للدالة الدورية:</strong><br/>
1) المجموعة المعرفة والدور T<br/>
2) الزوجية/الفردية (تردّ الدراسة إلى [0,T/2])<br/>
3) الاشتقاق واتجاه التغير<br/>
4) جدول التغيرات والتمثيل البياني
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. مثال كامل</h3>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ f(x) = 2cos(x) + cos(2x):</strong><br/>
• الدور: 2π<br/>
• f(-x) = f(x) ⟹ زوجية ⟹ ندرس [0,π]<br/>
• f''(x) = -2sin(x)-2sin(2x) = -2sin(x)(1+2cos(x))<br/>
• f''(x) = 0 ⟹ x = 0, π, 2π/3
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) ادرس ومثّل f(x) = sin(x) + sin(2x)<br/>
2) ادرس g(x) = cos(x) + (1/2)cos(2x) على [0,2π]<br/>
3) ادرس h(x) = sin(x)/(2+cos(x))
</div>
</div>' WHERE id = 'b69a64ca-13b4-4c74-9e3b-a56b24cce407';

-- 9) الدالة الأسية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الدالة الأسية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 الدالة الأسية هي الدالة الوحيدة حيث:</strong><br/>
f'' = f و f(0) = 1<br/>
نرمز لها exp(x) = eˣ, e ≈ 2.718
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الخواص الجبرية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 لكل a,b ∈ ℝ:</strong><br/>
• eᵃ⁺ᵇ = eᵃ×eᵇ | eᵃ⁻ᵇ = eᵃ/eᵇ<br/>
• (eᵃ)ⁿ = eⁿᵃ | e⁰ = 1 | e⁻ᵃ = 1/eᵃ<br/>
• eˣ &gt; 0 لكل x
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. المعادلات والمتراجحات</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 eᵃ = eᵇ ⟺ a = b | eᵃ &gt; eᵇ ⟺ a &gt; b</strong>
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) بسّط: e³×e⁻¹/(e²)³<br/>
2) حل: e²ˣ⁻¹ = e³, e²ˣ-3eˣ+2 = 0<br/>
3) حل: eˣ ≥ e⁴
</div>
</div>' WHERE id = 'a69fc9bb-486d-4925-82bf-420c2a81c80d';

-- 10) الدوال الأسية x ↦ e^x
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الدوال الأسية x ↦ eˣ</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. النهايات</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 نهايات أساسية:</strong><br/>
• lim(x→+∞) eˣ = +∞ | lim(x→-∞) eˣ = 0<br/>
• lim(x→+∞) eˣ/x = +∞ | lim(x→-∞) xeˣ = 0<br/>
• lim(x→+∞) eˣ/xⁿ = +∞ (الأسية تسيطر على كثيرات الحدود)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. النهاية المرجعية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 lim(x→0) (eˣ-1)/x = 1</strong>
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> lim(x→+∞) (2x+1)e⁻ˣ<br/>
= lim (2x+1)/eˣ = 0 (الأسية تسيطر)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) lim(x→+∞) x²e⁻ˣ<br/>
2) lim(x→0) (e³ˣ-1)/(2x)<br/>
3) lim(x→-∞) (eˣ+x)
</div>
</div>' WHERE id = '3ce45259-8a0d-4b1c-9441-73033cc8eb45';

-- 11) دراسة الدالة الأسية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">دراسة الدالة الأسية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الخصائص الأساسية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 exp: ℝ → ]0,+∞[</strong><br/>
• (eˣ)'' = eˣ &gt; 0 ⟹ متزايدة تماماً على ℝ<br/>
• محدبة (أسفل المماسات)<br/>
• تقاطع مع Oy عند (0,1)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. دراسة دوال أسية</h3>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ f(x) = (x-1)eˣ:</strong><br/>
f''(x) = eˣ + (x-1)eˣ = xeˣ<br/>
f''(x) = 0 ⟹ x = 0<br/>
النهايات: lim(-∞) = 0⁻, lim(+∞) = +∞
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) ادرس ومثّل f(x) = (2-x)e⁻ˣ<br/>
2) ادرس g(x) = x²eˣ<br/>
3) بيّن أن المعادلة xeˣ = 1 تقبل حلاً وحيداً
</div>
</div>' WHERE id = '72aa1300-b838-4e59-9c07-0286491981ba';

-- 12) دراسة الدالة exp(u)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">دراسة الدالة exp(u)</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. اشتقاق eᵘ⁽ˣ⁾</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 [eᵘ⁽ˣ⁾]'' = u''(x)·eᵘ⁽ˣ⁾</strong><br/>
اتجاه تغير eᵘ هو نفس اتجاه تغير u (لأن eᵘ &gt; 0 دائماً)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. أمثلة</h3>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ f(x) = e^(x²-3x):</strong><br/>
f''(x) = (2x-3)e^(x²-3x)<br/>
f''(x) = 0 ⟹ x = 3/2<br/>
f متناقصة على ]-∞,3/2] ومتزايدة على [3/2,+∞[
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ g(x) = e^(-x²):</strong> (جرس غاوس)<br/>
g''(x) = -2x·e^(-x²)<br/>
قيمة كبرى عند x = 0: g(0) = 1
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) ادرس f(x) = e^(1/x)<br/>
2) ادرس g(x) = e^(√x)<br/>
3) حل e^(x²) = e^(2x+3)
</div>
</div>' WHERE id = 'ecda3d9f-5135-40ef-8d41-efb3de2a3a99';

-- 13) الدالة اللوغاريتمية النيبيرية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الدالة اللوغاريتمية النيبيرية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 ln: ]0,+∞[ → ℝ هي معكوسة exp</strong><br/>
y = ln(x) ⟺ x = eʸ<br/>
ln(eˣ) = x لكل x ∈ ℝ | e^(ln x) = x لكل x &gt; 0
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. القيم الخاصة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 ln(1) = 0 | ln(e) = 1</strong><br/>
ln(x) &gt; 0 ⟺ x &gt; 1 | ln(x) &lt; 0 ⟺ 0 &lt; x &lt; 1
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) حل: ln(x) = 3, e^(ln 5) = ?, ln(e⁴) = ?<br/>
2) بدون آلة حاسبة، رتّب: ln(2), ln(e), ln(1/e), ln(√e)<br/>
3) حل: ln(x) ≥ -1
</div>
</div>' WHERE id = '5e98a94b-bc8f-4ce6-89f1-6548a23a378b';

-- 14) الخواص الجبرية (للوغاريتم)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الخواص الجبرية للوغاريتم</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. قواعد الحساب</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 لكل a,b &gt; 0:</strong><br/>
• ln(a×b) = ln(a)+ln(b)<br/>
• ln(a/b) = ln(a)-ln(b)<br/>
• ln(aⁿ) = n·ln(a)<br/>
• ln(√a) = (1/2)ln(a)<br/>
• ln(1/a) = -ln(a)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. المعادلات والمتراجحات</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 ln(a) = ln(b) ⟺ a = b (a,b &gt; 0)</strong><br/>
ln(a) &gt; ln(b) ⟺ a &gt; b (ln متزايدة)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> حل ln(x²-1) = ln(3)+ln(x-1)<br/>
⟹ ln(x+1)(x-1) = ln 3(x-1)<br/>
⟹ x+1 = 3 ⟹ x = 2 (مع التحقق: x &gt; 1)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) بسّط: ln(8)-2ln(2)+ln(1/4)<br/>
2) حل: ln(x)+ln(x+2) = ln(3)<br/>
3) حل: 2ˣ = 5 (باستعمال ln)
</div>
</div>' WHERE id = 'cede67b8-3e56-4b22-96f2-00e7d8a03fdc';

-- 15) دراسة الدالة اللوغاريتمية النيبيرية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">دراسة الدالة اللوغاريتمية النيبيرية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الاشتقاق والتغيرات</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 (ln x)'' = 1/x &gt; 0 لكل x &gt; 0</strong><br/>
⟹ ln متزايدة تماماً على ]0,+∞[
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. النهايات</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 lim(x→+∞) ln(x) = +∞ | lim(x→0⁺) ln(x) = -∞</strong><br/>
• lim(x→+∞) ln(x)/x = 0 (كثيرات الحدود تسيطر على ln)<br/>
• lim(x→0⁺) x·ln(x) = 0<br/>
• lim(x→0) ln(1+x)/x = 1
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. المنحنى</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 المقارب العمودي: x = 0 | يمر بـ (1,0) و (e,1)</strong><br/>
منحنى ln متناظر لمنحنى exp بالنسبة لـ y = x
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) ادرس ومثّل f(x) = x-ln(x)<br/>
2) ادرس g(x) = ln(x)/x<br/>
3) lim(x→+∞) [ln(x)]²/x و lim(x→0⁺) x²·ln(x)
</div>
</div>' WHERE id = 'c8b5c87d-a3f2-417d-8e70-0fc5d035cd68';
