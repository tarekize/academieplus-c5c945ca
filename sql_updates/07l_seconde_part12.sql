-- =====================================================
-- Seconde (2ème Année Secondaire) - Batch 12/12 (FINAL)
-- Covers: الإشتقاق + السلوك التقاربي + المتتاليات + الجمل الخطية + الاحتمالات
-- Lessons 166-177 of 177
-- =====================================================

-- 166) القيم الحدية لدالة (شعبة 5)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">القيم الحدية لدالة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 f''(a) = 0 مع تغيّر الإشارة:</strong><br/>
• من + إلى - ⟹ f(a) قيمة كبرى محلية<br/>
• من - إلى + ⟹ f(a) قيمة صغرى محلية
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الحد الأقصى والأدنى المطلق</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 في [a,b]:</strong> نقارن قيم النقاط الحرجة + الأطراف<br/>
• القيمة الأكبر = الحد الأقصى المطلق<br/>
• القيمة الأصغر = الحد الأدنى المطلق
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = x³-6x²+9x في [0,4]<br/>
f''(x) = 3x²-12x+9 = 3(x-1)(x-3)<br/>
f(0) = 0, f(1) = 4, f(3) = 0, f(4) = 4<br/>
الحد الأقصى = 4 (عند 1 و 4)، الأدنى = 0 (عند 0 و 3)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) أوجد القيم الحدية لـ f(x) = 2x³+3x²-12x+1<br/>
2) في [-1,3]: أوجد الحد الأقصى والأدنى لـ g(x) = x⁴-4x²<br/>
3) صندوق بدون غطاء حجمه 500cm³. أوجد أبعاده لتكون المساحة أصغر ما يمكن
</div>
</div>' WHERE id = 'f586f313-1d35-467a-87d1-bb5bb2a769b5';

-- 167) التقريب التآلفي المماسي لدالة (شعبة 5)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">التقريب التآلفي المماسي لدالة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المبدأ</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قرب نقطة a:</strong><br/>
f(a+h) ≈ f(a) + h·f''(a) عندما h صغير<br/>
أي: f(x) ≈ f''(a)(x-a) + f(a)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. التفسير الهندسي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 المنحنى يشبه المماس قرب نقطة التماس</strong><br/>
الخطأ = |f(x) - [f''(a)(x-a)+f(a)]| يقترب من 0 أسرع من |x-a|
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ أمثلة:</strong><br/>
• √(1+h) ≈ 1 + h/2 قرب 0<br/>
⟹ √(1.02) ≈ 1.01<br/>
• (1+h)ⁿ ≈ 1 + nh قرب 0<br/>
⟹ (1.01)⁵ ≈ 1.05
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) قرّب: √(9.1), ∛(8.06), 1/(2.01)²<br/>
2) f(x) = sin(x). اكتب التقريب قرب 0. قرّب sin(0.1)<br/>
3) قارن القيمة المقربة والقيمة الحقيقية لـ (1.03)⁴
</div>
</div>' WHERE id = 'a45c01c7-27a8-48e6-8a66-8e8dc7f9e3c2';

-- 168) نهايات دوال مألوفة (شعبة 5)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">نهايات دوال مألوفة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. نهايات الدوال كثيرات الحدود</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 P(x) = aₙxⁿ + ... + a₀:</strong><br/>
lim(x→±∞) P(x) = lim(x→±∞) aₙxⁿ<br/>
(يسيطر الحد الأعلى درجة)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. نهايات الدوال المرجعية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 النهايات المهمة:</strong><br/>
• lim(x→+∞) xⁿ = +∞, lim(x→-∞) xⁿ = (-1)ⁿ×∞<br/>
• lim(x→+∞) √x = +∞, lim(x→0⁺) √x = 0<br/>
• lim(x→0⁺) 1/x = +∞, lim(x→0⁻) 1/x = -∞<br/>
• lim(x→+∞) 1/x = 0
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) lim(x→+∞) (3x⁴-2x+1)<br/>
2) lim(x→-∞) (-5x³+x²)<br/>
3) lim(x→0⁺) (√x + 1/x)
</div>
</div>' WHERE id = 'e51d37ac-f248-46aa-9c6a-a8cd48ff2473';

-- 169) العمليات على النهايات (شعبة 5)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">العمليات على النهايات</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. القواعد</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 إذا lim f = ℓ و lim g = ℓ'':</strong><br/>
• lim(f+g) = ℓ+ℓ''<br/>
• lim(f×g) = ℓ×ℓ''<br/>
• lim(f/g) = ℓ/ℓ'' (ℓ'' ≠ 0)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. حالات عدم التعيين</h3>

<div style="background: #fdedec; padding: 15px; border-right: 4px solid #e74c3c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e74c3c;">⚠️ الأشكال غير المعينة:</strong><br/>
∞-∞, 0×∞, ∞/∞, 0/0<br/>
الحل: التحليل، القسمة على أعلى قوة، الملاقط
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> lim(x→+∞) (3x²+x)/(2x²-1)<br/>
= lim (3+1/x)/(2-1/x²) = 3/2
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) lim(x→+∞) (x²-3x+1)/(2x²+x)<br/>
2) lim(x→2) (x²-4)/(x-2)<br/>
3) lim(x→+∞) (√(x²+x) - x)
</div>
</div>' WHERE id = '7c986e2e-1ddc-4a50-a463-6f71d2efdc78';

-- 170) المستقيمات المقاربة (شعبة 5)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المستقيمات المقاربة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المقارب الأفقي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 lim(x→±∞) f(x) = ℓ ⟹ y = ℓ مقارب أفقي</strong>
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. المقارب العمودي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 lim(x→a) f(x) = ±∞ ⟹ x = a مقارب عمودي</strong>
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. المقارب المائل</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 lim(x→±∞) [f(x)-(ax+b)] = 0 ⟹ y = ax+b مقارب مائل</strong><br/>
a = lim f(x)/x, b = lim [f(x)-ax]
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = (x²+1)/(x-1)<br/>
= x+1 + 2/(x-1)<br/>
المقارب المائل: y = x+1 | العمودي: x = 1
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) أوجد المقاربات: f(x) = (2x+1)/(x-3)<br/>
2) أوجد المقاربات: g(x) = (x²-x+1)/(x+1)<br/>
3) ادرس الوضع النسبي للمنحنى والمقارب في كل حالة
</div>
</div>' WHERE id = '8bd888b2-a1d3-4a55-989f-f5b2a85a7e51';

-- 171) عموميات حول المتتاليات (شعبة 5)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">عموميات حول المتتاليات العددية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريف متتالية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 طريقتان لتعريف متتالية:</strong><br/>
• بالحد العام: uₙ = f(n)<br/>
• بعلاقة تراجعية: uₙ₊₁ = f(uₙ) مع u₀ معلوم
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. اتجاه التغير</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 (uₙ) متزايدة ⟺ uₙ₊₁ - uₙ &gt; 0 لكل n</strong><br/>
أو: uₙ₊₁/uₙ &gt; 1 (حدود موجبة)<br/>
أو: uₙ = f(n) و f متزايدة
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. التمثيل البياني</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 النقاط (n, uₙ) في المعلم</strong><br/>
للمتتالية التراجعية: نستعمل المنحنى والقطر y = x
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) uₙ = (2n+1)/(n+3). احسب u₀,...,u₄ وادرس اتجاه التغير<br/>
2) u₀ = 2, uₙ₊₁ = 3uₙ - 4. احسب 5 حدود أولى<br/>
3) ادرس اتجاه تغير vₙ = n² - 5n
</div>
</div>' WHERE id = '59927aeb-1b03-4ab4-a17c-d19e298fd00b';

-- 172) المتتاليات الحسابية (شعبة 5)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المتتاليات الحسابية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 uₙ₊₁ = uₙ + r (r: الأساس)</strong><br/>
uₙ = u₀ + n·r<br/>
r &gt; 0: متزايدة | r &lt; 0: متناقصة | r = 0: ثابتة
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. المجموع</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 Sₙ = u₀+u₁+...+uₙ = (n+1)(u₀+uₙ)/2</strong><br/>
حالة خاصة: 1+2+...+n = n(n+1)/2
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> u₀ = 3, r = 5<br/>
u₁₀ = 3+10×5 = 53<br/>
S₁₀ = 11×(3+53)/2 = 308
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) u₃ = 10, u₇ = 22. أوجد u₀ و r<br/>
2) احسب S = 5+8+11+...+302<br/>
3) كراء شهري 25000 DA يزيد 500 DA كل شهر. المجموع بعد 3 سنوات؟
</div>
</div>' WHERE id = 'f613d2c0-8271-4a29-9412-54bf3d77058a';

-- 173) المتتاليات الهندسية (شعبة 5)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المتتاليات الهندسية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 uₙ₊₁ = uₙ × q (q: الأساس، q ≠ 0)</strong><br/>
uₙ = u₀ × qⁿ
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. المجموع</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 q ≠ 1: Sₙ = u₀(1-qⁿ⁺¹)/(1-q)</strong><br/>
q = 1: Sₙ = (n+1)u₀
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> u₀ = 2, q = 3<br/>
u₅ = 2×3⁵ = 486<br/>
S₅ = 2(1-3⁶)/(1-3) = 2×728/2 = 728
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) u₂ = 12, u₅ = 96. أوجد u₀ و q<br/>
2) مبلغ 100000 DA بفائدة مركبة 5% سنوياً. القيمة بعد 10 سنوات؟<br/>
3) احسب: 1+2+4+8+...+2¹⁰
</div>
</div>' WHERE id = 'd6e85157-e350-45d0-a7d6-aff146e14a9e';

-- 174) المعادلات الخطية لمجهولين
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المعادلات الخطية لمجهولين</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الجملة</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 ax + by = c و a''x + b''y = c''</strong><br/>
المحدد: D = ab'' - a''b
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. طرق الحل</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 التعويض:</strong> نستخرج مجهولاً من معادلة ونعوض في الأخرى<br/>
<strong>الجمع:</strong> نضرب ونجمع لإلغاء مجهول<br/>
<strong>كرامر:</strong> D ≠ 0 ⟹ x = (cb''-c''b)/D, y = (ac''-a''c)/D
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. مناقشة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌</strong><br/>
• D ≠ 0: حل وحيد<br/>
• D = 0 مع توافق: عدد لا نهائي من الحلول<br/>
• D = 0 بدون توافق: لا حل (مستقيمان متوازيان)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) حل: 2x+3y = 7 و x-y = 1<br/>
2) ناقش حسب m: mx+2y = 1 و 3x+my = 2<br/>
3) مجموع عددين 50 والفرق 14. أوجدهما
</div>
</div>' WHERE id = '8c58e31f-f503-43c7-9862-84e05abf8213';

-- 175) جمل ثلاث معادلات خطية لثلاثة مجاهيل
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">جمل ثلاث معادلات خطية لثلاثة مجاهيل</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الشكل العام</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 a₁x + b₁y + c₁z = d₁<br/>
a₂x + b₂y + c₂z = d₂<br/>
a₃x + b₃y + c₃z = d₃</strong>
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. طريقة الحذف (غوص)</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 الخطوات:</strong><br/>
1) نحذف مجهولاً من معادلتين ⟹ جملة بمجهولين<br/>
2) نحل الجملة بمجهولين<br/>
3) نعوض لإيجاد المجهول الثالث
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong><br/>
x+y+z = 6 | 2x-y+z = 3 | x+2y-z = 3<br/>
(2)-(1): x-2y = -3 | (3)-(1): y-2z = -3<br/>
من المعادلة الأولى الجديدة: x = 2y-3...<br/>
الحل: x = 1, y = 2, z = 3
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) حل: x+y+z = 10, 2x-y+3z = 15, x+3y-z = 9<br/>
2) ثلاثة أعداد مجموعها 30. ضعف الأول + الثاني = 25. الأول + الثالث = 18. أوجدها
</div>
</div>' WHERE id = 'dd951c49-0a6f-4ee4-bd9a-b440081b09f6';

-- 176) المتراجحات الخطية لمجهولين
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المتراجحات الخطية لمجهولين</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التمثيل البياني لمتراجحة خطية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 ax + by ≤ c: نصف مستوي</strong><br/>
1) نرسم المستقيم ax+by = c<br/>
2) نختار نقطة (مثلاً الأصل): إذا حققت المتراجحة نُلوّن جهتها
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. جملة متراجحات خطية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 مجموعة الحلول = تقاطع أنصاف المستويات</strong><br/>
عادة نحصل على منطقة متعددة الأضلاع (مضلع محدب)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> x ≥ 0, y ≥ 0, x+y ≤ 5, 2x+y ≤ 8<br/>
رؤوس المنطقة: (0,0), (4,0), (3,2), (0,5)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. التحسين الخطي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 الحد الأقصى/الأدنى لدالة هدف يكون عند أحد الرؤوس</strong>
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) مثّل بيانياً: x ≥ 0, y ≥ 0, x+2y ≤ 10, 3x+y ≤ 12<br/>
2) في الجملة السابقة، أوجد الحد الأقصى لـ f(x,y) = 5x+3y<br/>
3) مصنع ينتج نوعين. القيود والأرباح معطاة. ما الإنتاج الأمثل؟
</div>
</div>' WHERE id = '558fa9f1-ee05-4a0c-9a83-0cf5823fd52d';

-- 177) مفردات الاحتمالات (شعبة 5)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">مفردات الاحتمالات</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المفاهيم الأساسية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تجربة عشوائية → كون Ω</strong><br/>
• حدث أولي: يحتوي نتيجة واحدة<br/>
• حدث مركب: اتحاد أحداث أولية<br/>
• A̅ (المكمل): عدم تحقق A ⟹ P(A̅) = 1 - P(A)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. عمليات على الأحداث</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قواعد الاحتمال:</strong><br/>
• 0 ≤ P(A) ≤ 1, P(Ω) = 1, P(∅) = 0<br/>
• P(A∪B) = P(A)+P(B)-P(A∩B)<br/>
• A و B غير متوافقين: P(A∪B) = P(A)+P(B)<br/>
• تساوي الاحتمالات: P(A) = |A|/|Ω|
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> رمي حجري نرد<br/>
Ω = {(i,j): 1≤i,j≤6}, |Ω| = 36<br/>
A = "المجموع 7" = {(1,6),(2,5),(3,4),(4,3),(5,2),(6,1)}<br/>
P(A) = 6/36 = 1/6
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) كيس فيه 3 كرات حمراء و 5 زرقاء. نسحب 2. P(كلاهما أحمر)؟<br/>
2) P(A) = 0.6, P(B) = 0.4, P(A∩B) = 0.2. أوجد P(A∪B) و P(A̅)<br/>
3) رمي 3 قطع نقدية. ما P(ظهور وجهين على الأقل)؟
</div>
</div>' WHERE id = 'fda096d6-2910-4e24-a96b-6a98268a2087';
