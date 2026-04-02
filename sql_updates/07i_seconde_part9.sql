-- =====================================================
-- Seconde (2ème Année Secondaire) - Batch 9/12
-- Covers: تطبيقات الإشتقاقية (شعبة 4) + النهايات (شعبة 4) + المتتاليات
-- Lessons 121-135 of 177
-- =====================================================

-- 121) اتجاه تغير دالة (شعبة 4)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">اتجاه تغير دالة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الربط بين المشتقة والتغير</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 مبرهنة:</strong><br/>
• f′(x) &gt; 0 على I ⟹ f متزايدة تماماً على I<br/>
• f′(x) &lt; 0 على I ⟹ f متناقصة تماماً على I<br/>
• f′(x) = 0 على I ⟹ f ثابتة على I
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. جدول التغيرات</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 خطوات:</strong> حساب f′ → حل f′=0 → إشارة f′ → جدول التغيرات
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = 2x³ - 9x² + 12x - 4<br/>
f′(x) = 6x² - 18x + 12 = 6(x²-3x+2) = 6(x-1)(x-2)<br/>
f′ &gt; 0 على ]-∞,1[ و ]2,+∞[ (متزايدة)<br/>
f′ &lt; 0 على ]1,2[ (متناقصة)<br/>
f(1) = 1, f(2) = 0
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> أنشئ جدول التغيرات:<br/>
1) f(x) = x³ - 12x + 5<br/>
2) g(x) = x + 1/x على ]0,+∞[<br/>
3) h(x) = x⁴ - 8x² + 1
</div>
</div>' WHERE id = '7d176c41-c0b2-42b4-98d3-14852b7486a1';

-- 122) القيم الحدية المحلية (شعبة 4)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">القيم الحدية المحلية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الحد الأعظمي والأصغري المحلي</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 شرط لازم:</strong> f′(a) = 0<br/>
<strong>شرط كاف:</strong><br/>
• f′ تتغير من + إلى - عند a → حد أعظمي محلي<br/>
• f′ تتغير من - إلى + عند a → حد أصغري محلي<br/>
• f′ لا تتغير إشارة → نقطة انعطاف
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = x³ - 3x<br/>
f′(x) = 3x²-3 = 3(x-1)(x+1)<br/>
x = -1: f′ من + إلى - → حد أعظمي f(-1) = 2<br/>
x = 1: f′ من - إلى + → حد أصغري f(1) = -2
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) أوجد القيم الحدية: f(x) = x⁴ - 4x + 3<br/>
2) صندوق مفتوح من ورقة 20×30cm بقص مربعات. ما أبعاد أكبر حجم؟
</div>
</div>' WHERE id = 'd769bf88-d82d-4679-94a3-122e345e2c8e';

-- 123) حصر دالة (شعبة 4)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">حصر دالة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> حصر f على [a,b]: إيجاد m و M حيث m ≤ f(x) ≤ M لكل x ∈ [a,b]
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الطريقة باستعمال جدول التغيرات</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 الخطوات:</strong><br/>
1) أنشئ جدول التغيرات على [a,b]<br/>
2) min = أصغر القيم (أطراف + حدود محلية)<br/>
3) max = أكبر القيم
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = x³ - 3x + 1 على [-2, 2]<br/>
f′(x) = 3x²-3 = 0 ⟹ x = ±1<br/>
f(-2)=-1, f(-1)=3, f(1)=-1, f(2)=3<br/>
حصر: -1 ≤ f(x) ≤ 3
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احصر f(x) = 2x²-x+1 على [0, 3]<br/>
2) احصر g(x) = x/(x²+1) على ℝ
</div>
</div>' WHERE id = '9f05d789-e1fa-4c8d-ba91-3b60daf9c47c';

-- 124) العناصر الحادة (شعبة 4)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">العناصر الحادة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. القيم القصوى المطلقة</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 مبرهنة فايرشتراس:</strong> كل دالة متصلة على [a,b] مغلق تبلغ حدها الأقصى والأدنى المطلقين<br/><br/>
<strong>طريقة:</strong> حساب f عند النقاط الحرجة (f′=0) وعند الأطراف → المقارنة
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = x⁴ - 2x² على [-2, 2]<br/>
f′(x) = 4x³-4x = 4x(x²-1) → x = 0, ±1<br/>
f(-2)=8, f(-1)=-1, f(0)=0, f(1)=-1, f(2)=8<br/>
min = -1 (في x=±1), max = 8 (في x=±2)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. مسائل التحسين</h3>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) max و min لـ f(x) = x³ - 6x² + 9x + 2 على [0, 5]<br/>
2) علبة أسطوانية حجمها 1L. ما الأبعاد لتقليل المادة المستعملة؟
</div>
</div>' WHERE id = '2d993527-1cab-4249-a0fa-f685e96230b5';

-- 125) نهاية غير منتهية عند عدد حقيقي (شعبة 4)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">نهاية غير منتهية عند عدد حقيقي</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المستقيم المقارب العمودي</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 إذا lim(x→a) f(x) = ±∞:</strong><br/>
المستقيم x = a مقارب عمودي لمنحنى f
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. تقنية الحساب</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 لحساب lim(x→a) f(x)/g(x) حيث g(a) = 0:</strong><br/>
1) تأكد أن f(a) ≠ 0<br/>
2) ادرس إشارة g قرب a<br/>
3) النهاية = (إشارة f(a)) × (1/إشارة g) = ±∞
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ أمثلة:</strong><br/>
• lim(x→1⁺) 1/(x-1) = +∞, lim(x→1⁻) = -∞<br/>
• lim(x→0) 1/x² = +∞ (نهاية من الجانبين)<br/>
• lim(x→3) (x+1)/(x-3)²  = +∞
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> حدد المقاربات العمودية:<br/>
1) f(x) = (x+2)/(x²-1)<br/>
2) g(x) = 1/sin(x) عند x = 0<br/>
3) h(x) = x²/(x²-4)
</div>
</div>' WHERE id = '1b683c6b-3f40-4eed-8375-ad481fa67222';

-- 126) نهاية منتهية عند المالانهاية (شعبة 4)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">نهاية منتهية عند المالانهاية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المستقيم المقارب الأفقي</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 lim(x→+∞) f(x) = ℓ ⟹ y = ℓ مقارب أفقي</strong>
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. حساب نهاية كسر في اللانهاية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 قاعدة:</strong> نقسم البسط والمقام على أعلى قوة لـ x<br/>
lim(x→±∞) (aₙxⁿ+...)/(bₘxᵐ+...) =<br/>
• n &lt; m: النهاية = 0<br/>
• n = m: النهاية = aₙ/bₘ<br/>
• n &gt; m: النهاية  = ±∞
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ أمثلة:</strong><br/>
• lim(x→+∞) (2x+1)/(3x-2) = 2/3 → y = 2/3 مقارب<br/>
• lim(x→+∞) x/(x²+1) = 0 → y = 0 مقارب<br/>
• lim(x→+∞) (x²+1)/x = +∞
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) lim(x→+∞) (4x²-x)/(2x²+3) وحدد المقارب<br/>
2) lim(x→-∞) (x-√(x²+1))<br/>
3) حدد كل المقاربات لـ f(x) = 2x/(x-1)
</div>
</div>' WHERE id = 'd46207f5-c408-4519-9117-5cde2e08ef3e';

-- 127) مفهوم النهاية (شعبة 4)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">مفهوم النهاية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. أنواع النهايات</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 أربعة أنواع:</strong><br/>
• lim(x→a) f(x) = ℓ: نهاية منتهية عند عدد<br/>
• lim(x→a) f(x) = ±∞: نهاية لانهائية عند عدد<br/>
• lim(x→±∞) f(x) = ℓ: نهاية منتهية عند اللانهاية<br/>
• lim(x→±∞) f(x) = ±∞: نهاية لانهائية عند اللانهاية
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. النهايات من الجانبين</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 lim(x→a) f(x) = ℓ ⟺ lim(x→a⁺) f(x) = lim(x→a⁻) f(x) = ℓ</strong>
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. الاتصال والنهاية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 f متصلة في a ⟺ lim(x→a) f(x) = f(a)</strong>
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) ادرس اتصال f في x=1: f(x)=x² إذا x≤1, f(x)=2x-1 إذا x&gt;1<br/>
2) هل f(x) = |x|/x متصلة في 0؟<br/>
3) أوجد a لكي g(x) = ax+3 (x&lt;2), g(x)=x² (x≥2) متصلة
</div>
</div>' WHERE id = '88fad4db-f480-4cb9-9c44-ece292a60d41';

-- 128) عمليات على النهايات (شعبة 4)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">عمليات على النهايات</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. جدول العمليات</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 إذا lim f = L و lim g = L′:</strong><br/>
• lim (f+g) = L+L′<br/>
• lim (f·g) = L·L′<br/>
• lim (f/g) = L/L′ (L′ ≠ 0)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الأشكال غير المعيّنة</h3>

<div style="background: #fdedec; padding: 15px; border-right: 4px solid #e74c3c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e74c3c;">⚠️ ∞-∞, 0×∞, 0/0, ∞/∞</strong><br/>
<strong>تقنيات الرفع:</strong><br/>
• التحليل (0/0): تحليل وتبسيط<br/>
• الحد المهيمن (∞/∞): إبراز أعلى قوة<br/>
• الضرب بالمرافق (∞-∞ مع جذور)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ أمثلة:</strong><br/>
• lim(x→3) (x²-9)/(x-3) = lim (x+3) = 6<br/>
• lim(x→+∞) (√(x²+x)-x) = lim x/(√(x²+x)+x) = 1/2
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) lim(x→2) (x³-8)/(x²-4)<br/>
2) lim(x→+∞) (√(4x²+1) - 2x)<br/>
3) lim(x→0) (√(1+x)-1)/x
</div>
</div>' WHERE id = '37913dff-9587-43ff-a67b-5ddd7d0387ff';

-- 129) المستقيم المقارب المائل (شعبة 4)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المستقيم المقارب المائل</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف والإيجاد</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 y = ax+b مقارب مائل ⟺ lim[f(x)-(ax+b)] = 0</strong><br/>
الإيجاد:<br/>
1) a = lim f(x)/x<br/>
2) b = lim [f(x) - ax]
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = (2x²+3)/(x-1)<br/>
بالقسمة: f(x) = 2x+2 + 5/(x-1)<br/>
lim 5/(x-1) = 0 → المقارب المائل: y = 2x+2
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الوضع النسبي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 f(x)-(ax+b) &gt; 0 → المنحنى فوق المقارب والعكس</strong>
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) أوجد كل مقاربات f(x) = (x²-2x+3)/(x+1)<br/>
2) حدد الوضع النسبي للمنحنى والمقارب المائل
</div>
</div>' WHERE id = 'd17a78b6-799d-4238-b8c6-3dcedb32b078';

-- 130) دراسة دالة (شعبة 4)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">دراسة دالة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. خطوات الدراسة الكاملة</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 المنهجية:</strong><br/>
1) D_f: مجموعة التعريف<br/>
2) التماثل (زوجية/فردية)<br/>
3) النهايات والمقاربات<br/>
4) f′ وإشارته → جدول التغيرات<br/>
5) نقاط خاصة (تقاطعات مع المحاور)<br/>
6) رسم المنحنى
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = x² - 1/x على ]0, +∞[<br/>
• lim(x→0⁺) = -∞, lim(x→+∞) = +∞<br/>
• f′(x) = 2x + 1/x² = (2x³+1)/x² &gt; 0 لكل x &gt; 0<br/>
• f متزايدة تماماً على ]0,+∞[<br/>
• f(1) = 0: يقطع محور الفواصل في x = 1
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> ادرس وارسم:<br/>
1) f(x) = (x²+1)/(x-1)<br/>
2) g(x) = x - 2 + 4/(x+1) على ]-1, +∞[
</div>
</div>' WHERE id = '2431b964-0a0e-4df7-87da-555dd90895c5';

-- 131) المتتاليات العددية (شعبة 4)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المتتاليات العددية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريف وطرق التعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> (uₙ) متتالية عددية = دالة من ℕ إلى ℝ<br/>
• صيغة صريحة: uₙ = f(n)<br/>
• علاقة رجوع: uₙ₊₁ = g(uₙ) مع u₀
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong><br/>
• uₙ = n²-4n: u₀=0, u₁=-3, u₂=-4, u₃=-3, u₄=0<br/>
• vₙ₊₁ = 3vₙ-2, v₀=1: v₁=1, v₂=1... (ثابتة!)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. المتتالية المحدودة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 (uₙ) محدودة ⟺ ∃ M: |uₙ| ≤ M لكل n</strong>
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) uₙ = (-1)ⁿ·n/(n+1). احسب أول 5 حدود. هل هي رتيبة؟ محدودة؟<br/>
2) vₙ₊₁ = √(2vₙ+3), v₀ = 1. احسب v₁, v₂, v₃
</div>
</div>' WHERE id = 'b5ff499b-b143-448b-b862-f35fd9fc7eed';

-- 132) التمثيل البياني لمتتالية عددية (شعبة 4)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">التمثيل البياني لمتتالية عددية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التمثيل بالنقاط المعزولة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 نمثل النقاط (n, uₙ) في المعلم:</strong><br/>
الفواصل أعداد طبيعية → نقاط معزولة (غير متصلة)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. طريقة السلالم والحلزون</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 لمتتالية uₙ₊₁ = f(uₙ):</strong><br/>
• ارسم y = f(x) و y = x<br/>
• ابدأ من (u₀, 0) ← ارتفع إلى المنحنى ← أفقياً إلى y=x ← كرر<br/>
• سلالم (f متزايدة) أو حلزون (f متناقصة)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> uₙ₊₁ = uₙ/2 + 1, u₀ = 0<br/>
y = x/2 + 1 و y = x: تقاطع في x=2<br/>
سلالم صاعدة → المتتالية تتقارب نحو 2
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) مثل بيانياً: uₙ = 3 - 2/n لأول 6 حدود<br/>
2) استعمل طريقة السلالم لـ uₙ₊₁ = √(2uₙ), u₀ = 1
</div>
</div>' WHERE id = '2f87d1ec-885b-469d-86c5-b6a2b8061e2c';

-- 133) إتجاه تغير متتالية عددية (شعبة 4)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">إتجاه تغير متتالية عددية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الطرق</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 ثلاث طرق:</strong><br/>
1) إشارة uₙ₊₁ - uₙ<br/>
2) uₙ₊₁/uₙ مقارنة بـ 1 (إذا uₙ &gt; 0)<br/>
3) uₙ = f(n): ندرس تغير f
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> uₙ = 2ⁿ/(n+1)<br/>
uₙ₊₁/uₙ = [2ⁿ⁺¹/(n+2)] × [(n+1)/2ⁿ] = 2(n+1)/(n+2)<br/>
لـ n ≥ 1: 2(n+1)/(n+2) = 2-2/(n+2) &gt; 1<br/>
⟹ (uₙ) متزايدة ابتداءً من n = 1
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) uₙ = (n+1)/2ⁿ. ادرس اتجاه التغير<br/>
2) vₙ = n - √n. ادرس الرتابة<br/>
3) wₙ₊₁ = wₙ²/4, w₀ = 1. ادرس (wₙ) واحسب أول 4 حدود
</div>
</div>' WHERE id = '2ef8cebd-205e-4e08-ab45-2fe52243c989';

-- 134) المتتاليات الحسابية (شعبة 4)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المتتاليات الحسابية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف والحد العام</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 (uₙ) حسابية بأساس r:</strong><br/>
uₙ₊₁ = uₙ + r<br/>
uₙ = u₀ + nr
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. المجموع</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 Sₙ = (n+1) × (u₀+uₙ)/2</strong><br/>
1+2+...+n = n(n+1)/2
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> u₂ = 7, u₆ = 19<br/>
4r = 12 → r = 3, u₀ = 1<br/>
S₁₀ = 11(1+31)/2 = 176
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) u₃=11, u₈=31. أوجد u₀, r, و S₂₀<br/>
2) احسب مجموع الأعداد الزوجية من 2 إلى 200<br/>
3) يتقاضى عامل 30000DA أول شهر بزيادة 2000 شهرياً. ما مجموع أجره السنوي؟
</div>
</div>' WHERE id = 'aa6c52e2-ba3d-4af2-8f39-54a659041b5f';

-- 135) المتتاليات الهندسية (شعبة 4)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المتتاليات الهندسية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف والحد العام</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 (uₙ) هندسية بأساس q:</strong><br/>
uₙ₊₁ = q × uₙ<br/>
uₙ = u₀ × qⁿ
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. المجموع</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 q ≠ 1: Sₙ = u₀(1-qⁿ⁺¹)/(1-q)</strong><br/>
1+q+q²+...+qⁿ = (1-qⁿ⁺¹)/(1-q)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> u₁ = 4, u₄ = 108<br/>
u₄ = u₁ × q³ → 108 = 4q³ → q = 3<br/>
u₀ = 4/3, S₅ = (4/3)(1-3⁶)/(1-3) = (4/3)(728/2) = 1456/3
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) u₀ = 5, q = 1/2. احسب S₁₀<br/>
2) بكتيريا تتضاعف كل ساعة. 100 بكتيريا أولاً → بعد 10 ساعات؟<br/>
3) أوجد q إذا u₃ = 24 و u₆ = 192
</div>
</div>' WHERE id = 'ca285514-30ff-4cdc-a1bf-af67afe4eb0a';
