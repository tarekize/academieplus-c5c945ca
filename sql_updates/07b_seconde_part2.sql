-- =====================================================
-- Seconde (2ème Année Secondaire) - Batch 2/12
-- Covers: تطبيقات الإشتقاقية (suite) + النهايات + المتتاليات العددية (partial)
-- Lessons 16-30 of 177
-- =====================================================

-- 16) حصر دالة (تطبيقات الإشتقاقية)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">حصر دالة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. مفهوم الحصر</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> حصر (أو تأطير) دالة f على مجال I هو إيجاد دالتين g و h حيث:<br/>
g(x) ≤ f(x) ≤ h(x) لكل x ∈ I<br/>
إذا كان g(x) = m و h(x) = M (أعداد ثابتة) نقول: m ≤ f(x) ≤ M
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. استعمال الاشتقاق للحصر</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 الطريقة:</strong> لحصر f(x) على [a, b]:<br/>
1) ادرس اتجاه تغير f باستعمال f''<br/>
2) أوجد القيمة العظمى M = max والصغرى m = min على [a, b]<br/>
3) النتيجة: m ≤ f(x) ≤ M لكل x ∈ [a, b]
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> احصر f(x) = x² - 2x + 3 على [0, 3]<br/>
f''(x) = 2x - 2 = 0 ⟹ x = 1<br/>
f(0) = 3, f(1) = 2, f(3) = 6<br/>
القيمة الصغرى = 2 (عند x = 1)، القيمة العظمى = 6 (عند x = 3)<br/>
∴ 2 ≤ f(x) ≤ 6 لكل x ∈ [0, 3]
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. خاصية القيم الوسطية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 مبرهنة:</strong> إذا كانت f متصلة على [a, b] فإن f تأخذ كل القيم بين f(a) و f(b).<br/>
<strong>نتيجة:</strong> إذا كان f(a) × f(b) &lt; 0 فإن المعادلة f(x) = 0 تقبل حلاً واحداً على الأقل في ]a, b[.
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احصر f(x) = x³ - 3x على [-1, 2]<br/>
2) أثبت أن المعادلة x³ + x - 1 = 0 تقبل حلاً وحيداً في [0, 1]<br/>
3) احصر f(x) = sin(x) + cos(x) (استعمل الهوية المثلثية)
</div>
</div>' WHERE id = 'd9c193a3-11f6-4278-96ab-1988f89b4279';

-- 17) العناصر الحادة (تطبيقات الإشتقاقية)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">العناصر الحادة (النقاط الحرجة)</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريف النقاط الحرجة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> النقطة الحرجة (أو العنصر الحاد) لدالة f هي كل نقطة a حيث f''(a) = 0 أو f''(a) غير موجودة.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. أنواع النقاط الحرجة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 التصنيف:</strong><br/>
• <strong>قيمة عظمى محلية:</strong> f'' تتغير من + إلى -<br/>
• <strong>قيمة صغرى محلية:</strong> f'' تتغير من - إلى +<br/>
• <strong>نقطة انعطاف ذات مماس أفقي:</strong> f''(a) = 0 لكن f'' لا تغير إشارتها
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> ادرس النقاط الحرجة لـ f(x) = x⁴ - 4x³<br/>
f''(x) = 4x³ - 12x² = 4x²(x - 3)<br/>
f''(x) = 0 ⟹ x = 0 أو x = 3<br/><br/>
• عند x = 0: f'' تبقى سالبة (لا تغير إشارتها) ⟹ نقطة انعطاف أفقية<br/>
• عند x = 3: f'' تتغير من - إلى + ⟹ قيمة صغرى محلية f(3) = -27
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. تطبيق: مسائل التحسين</h3>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال تطبيقي:</strong> نريد صنع علبة مستطيلة مفتوحة من قطعة كرتون مربعة طول ضلعها 12 cm بقطع مربعات من الزوايا. ما هو البعد x الذي يعطي أكبر حجم؟<br/><br/>
V(x) = x(12 - 2x)² حيث 0 &lt; x &lt; 6<br/>
V''(x) = (12 - 2x)² + x · 2(12 - 2x)(-2) = (12-2x)(12-2x - 4x) = (12-2x)(12-6x)<br/>
V''(x) = 0 ⟹ x = 6 (مرفوض) أو x = 2<br/>
V(2) = 2 × 64 = 128 cm³ (الحجم الأقصى)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) صنف النقاط الحرجة لـ f(x) = 3x⁵ - 5x³<br/>
2) أوجد مستطيلاً محيطه 20 ومساحته أكبر ما يمكن
</div>
</div>' WHERE id = 'f8b2b54d-8a27-456d-96bb-3590700706c0';

-- 18) نهاية غير منتهية عند عدد حقيقي (النهايات)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">نهاية غير منتهية عند عدد حقيقي</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> نقول أن نهاية f(x) عندما x يؤول إلى a تساوي +∞ ونكتب:<br/>
lim(x→a) f(x) = +∞<br/>
إذا كانت f(x) تكبر بلا حدود عندما يقترب x من a.<br/><br/>
بالمثل: lim(x→a) f(x) = -∞ إذا كانت f(x) تصغر بلا حدود.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. النهايات من اليمين واليسار</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong><br/>
• lim(x→a⁺) f(x) = L: نهاية f عندما x يؤول إلى a من اليمين (x &gt; a)<br/>
• lim(x→a⁻) f(x) = L: نهاية f عندما x يؤول إلى a من اليسار (x &lt; a)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 1:</strong> lim(x→0) 1/x²<br/>
عندما x → 0⁺: 1/x² → +∞<br/>
عندما x → 0⁻: 1/x² → +∞<br/>
إذن: lim(x→0) 1/x² = +∞
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 2:</strong> lim(x→0) 1/x<br/>
عندما x → 0⁺: 1/x → +∞<br/>
عندما x → 0⁻: 1/x → -∞<br/>
النهاية غير موجودة (النهايتان مختلفتان)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. المستقيم المقارب الشاقولي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> إذا كانت lim(x→a) f(x) = ±∞ فإن المستقيم x = a هو <strong>مستقيم مقارب شاقولي</strong> للمنحنى (C_f).
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = 1/(x - 2)<br/>
lim(x→2⁺) f(x) = +∞ و lim(x→2⁻) f(x) = -∞<br/>
إذن المستقيم x = 2 مقارب شاقولي لـ (C_f)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> أوجد النهايات وحدد المستقيمات المقاربة الشاقولية:<br/>
1) f(x) = (x + 1)/(x² - 1)<br/>
2) g(x) = x/(x² - 4)<br/>
3) h(x) = √x/(x - 1)
</div>
</div>' WHERE id = '7b583470-e74a-4cf5-9ade-ab88f987535d';

-- 19) نهاية منتهية عند المالانهاية (النهايات)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">نهاية منتهية عند المالانهاية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> نقول أن نهاية f(x) عندما x يؤول إلى +∞ تساوي L ونكتب:<br/>
lim(x→+∞) f(x) = L<br/>
إذا كانت f(x) تقترب من L كلما كبر x.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. نهايات مرجعية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 نتائج أساسية:</strong><br/>
• lim(x→+∞) 1/x = 0 و lim(x→-∞) 1/x = 0<br/>
• lim(x→+∞) 1/x² = 0 و lim(x→-∞) 1/x² = 0<br/>
• بشكل عام: lim(x→±∞) 1/xⁿ = 0 لكل n ∈ ℕ*<br/>
• lim(x→+∞) 1/√x = 0
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 1:</strong> lim(x→+∞) (3x² + 2x - 1)/(x² + 1)<br/>
= lim(x→+∞) (3 + 2/x - 1/x²)/(1 + 1/x²) بالقسمة على x²<br/>
= 3/1 = 3
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. المستقيم المقارب الأفقي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> إذا كانت lim(x→+∞) f(x) = L فإن المستقيم y = L هو <strong>مستقيم مقارب أفقي</strong> للمنحنى (C_f) عند +∞.
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 2:</strong> f(x) = (2x - 1)/(x + 3)<br/>
lim(x→+∞) f(x) = lim (2 - 1/x)/(1 + 3/x) = 2<br/>
lim(x→-∞) f(x) = 2<br/>
إذن y = 2 مقارب أفقي عند ±∞
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> احسب النهايات وحدد المستقيمات المقاربة الأفقية:<br/>
1) f(x) = (x + 1)/(2x - 3)<br/>
2) g(x) = (3x² - x)/(x² + 2x + 5)<br/>
3) h(x) = (x + √(x² + 1))
</div>
</div>' WHERE id = '345300b1-edcd-4306-b86e-2565450e7471';

-- 20) مفهوم النهاية (النهايات)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">مفهوم النهاية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الحالات الأربع للنهايات</h3>

<table style="width: 100%; border-collapse: collapse; margin: 15px 0; text-align: center;">
<tr style="background: #2c3e50; color: white;"><th style="padding: 10px; border: 1px solid #ddd;">x يؤول إلى</th><th style="padding: 10px; border: 1px solid #ddd;">f(x) تؤول إلى</th><th style="padding: 10px; border: 1px solid #ddd;">الكتابة</th></tr>
<tr><td style="padding: 10px; border: 1px solid #ddd;">a (عدد حقيقي)</td><td style="padding: 10px; border: 1px solid #ddd;">L (عدد حقيقي)</td><td style="padding: 10px; border: 1px solid #ddd;">lim(x→a) f(x) = L</td></tr>
<tr style="background: #f8f9fa;"><td style="padding: 10px; border: 1px solid #ddd;">a</td><td style="padding: 10px; border: 1px solid #ddd;">±∞</td><td style="padding: 10px; border: 1px solid #ddd;">lim(x→a) f(x) = ±∞</td></tr>
<tr><td style="padding: 10px; border: 1px solid #ddd;">±∞</td><td style="padding: 10px; border: 1px solid #ddd;">L</td><td style="padding: 10px; border: 1px solid #ddd;">lim(x→±∞) f(x) = L</td></tr>
<tr style="background: #f8f9fa;"><td style="padding: 10px; border: 1px solid #ddd;">±∞</td><td style="padding: 10px; border: 1px solid #ddd;">±∞</td><td style="padding: 10px; border: 1px solid #ddd;">lim(x→±∞) f(x) = ±∞</td></tr>
</table>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. نهايات كثيرات الحدود</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قاعدة:</strong> نهاية كثير حدود عند ±∞ هي نهاية حده الرئيسي (ذي الدرجة الأعلى).<br/>
lim(x→±∞) (aₙxⁿ + ... + a₀) = lim(x→±∞) aₙxⁿ
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. نهايات الدوال الناطقة</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قاعدة:</strong> نهاية دالة ناطقة P(x)/Q(x) عند ±∞ هي نهاية نسبة الحدين الرئيسيين.
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ أمثلة:</strong><br/>
• lim(x→+∞) (2x³ - x + 1) = lim(x→+∞) 2x³ = +∞<br/>
• lim(x→-∞) (-x⁴ + 3x²) = lim(x→-∞) -x⁴ = -∞<br/>
• lim(x→+∞) (3x² + 1)/(2x² - x) = lim 3x²/(2x²) = 3/2<br/>
• lim(x→+∞) (x + 1)/(x³ + 2) = lim x/x³ = lim 1/x² = 0
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">4. الاتصال بدلالة النهايات</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> f متصلة عند a ⟺ lim(x→a) f(x) = f(a)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> احسب النهايات:<br/>
1) lim(x→+∞) (x³ - 2x² + 3x - 1)<br/>
2) lim(x→-∞) (5x⁴ - x³ + 2)<br/>
3) lim(x→+∞) (2x + 3)/(5x - 1)<br/>
4) lim(x→2) (x² - 4)/(x - 2)
</div>
</div>' WHERE id = '2fdf4322-f479-4a0c-ba2c-4a0eed68a8fe';

-- 21) عمليات على النهايات (النهايات)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">عمليات على النهايات</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. نهاية مجموع</h3>

<table style="width: 100%; border-collapse: collapse; margin: 15px 0; text-align: center;">
<tr style="background: #2c3e50; color: white;"><th style="padding: 10px; border: 1px solid #ddd;">lim f</th><th style="padding: 10px; border: 1px solid #ddd;">lim g</th><th style="padding: 10px; border: 1px solid #ddd;">lim(f+g)</th></tr>
<tr><td style="padding: 10px; border: 1px solid #ddd;">L₁</td><td style="padding: 10px; border: 1px solid #ddd;">L₂</td><td style="padding: 10px; border: 1px solid #ddd;">L₁ + L₂</td></tr>
<tr style="background: #f8f9fa;"><td style="padding: 10px; border: 1px solid #ddd;">L</td><td style="padding: 10px; border: 1px solid #ddd;">+∞</td><td style="padding: 10px; border: 1px solid #ddd;">+∞</td></tr>
<tr><td style="padding: 10px; border: 1px solid #ddd;">+∞</td><td style="padding: 10px; border: 1px solid #ddd;">+∞</td><td style="padding: 10px; border: 1px solid #ddd;">+∞</td></tr>
<tr style="background: #fdedec;"><td style="padding: 10px; border: 1px solid #ddd;">+∞</td><td style="padding: 10px; border: 1px solid #ddd;">-∞</td><td style="padding: 10px; border: 1px solid #ddd; color: #e74c3c; font-weight: bold;">شكل غير محدد</td></tr>
</table>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. نهاية جداء</h3>

<table style="width: 100%; border-collapse: collapse; margin: 15px 0; text-align: center;">
<tr style="background: #2c3e50; color: white;"><th style="padding: 10px; border: 1px solid #ddd;">lim f</th><th style="padding: 10px; border: 1px solid #ddd;">lim g</th><th style="padding: 10px; border: 1px solid #ddd;">lim(f×g)</th></tr>
<tr><td style="padding: 10px; border: 1px solid #ddd;">L₁</td><td style="padding: 10px; border: 1px solid #ddd;">L₂</td><td style="padding: 10px; border: 1px solid #ddd;">L₁ × L₂</td></tr>
<tr style="background: #f8f9fa;"><td style="padding: 10px; border: 1px solid #ddd;">L ≠ 0</td><td style="padding: 10px; border: 1px solid #ddd;">±∞</td><td style="padding: 10px; border: 1px solid #ddd;">±∞ (حسب الإشارة)</td></tr>
<tr style="background: #fdedec;"><td style="padding: 10px; border: 1px solid #ddd;">0</td><td style="padding: 10px; border: 1px solid #ddd;">±∞</td><td style="padding: 10px; border: 1px solid #ddd; color: #e74c3c; font-weight: bold;">شكل غير محدد</td></tr>
</table>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. الأشكال غير المحددة</h3>

<div style="background: #fdedec; padding: 15px; border-right: 4px solid #e74c3c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e74c3c;">⚠️ الأشكال غير المحددة (FI):</strong><br/>
+∞ - ∞ ، 0 × ∞ ، 0/0 ، ∞/∞ ، 0⁰ ، ∞⁰ ، 1^∞<br/>
هذه الأشكال تحتاج إلى تقنيات خاصة لرفعها (التحليل، الضرب بالمرافق، ...)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال (رفع حالة 0/0):</strong> lim(x→1) (x² - 1)/(x - 1)<br/>
= lim(x→1) (x-1)(x+1)/(x-1) = lim(x→1) (x+1) = 2
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال (رفع ∞-∞):</strong> lim(x→+∞) (√(x²+1) - x)<br/>
= lim (√(x²+1) - x)(√(x²+1) + x)/(√(x²+1) + x)<br/>
= lim (x²+1-x²)/(√(x²+1)+x) = lim 1/(√(x²+1)+x) = 0
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> احسب (ارفع حالة عدم التحديد):<br/>
1) lim(x→2) (x² - 3x + 2)/(x² - 4)<br/>
2) lim(x→+∞) (x - √(x² - 2x))<br/>
3) lim(x→0) (√(1+x) - 1)/x
</div>
</div>' WHERE id = 'fb21bca7-0608-454e-97ce-e4a7187a922c';

-- 22) المستقيم المقارب المائل (النهايات)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المستقيم المقارب المائل</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> المستقيم y = ax + b هو مستقيم مقارب مائل للمنحنى (C_f) عند +∞ إذا:<br/>
lim(x→+∞) [f(x) - (ax + b)] = 0
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. كيفية إيجاد المقارب المائل</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 الطريقة:</strong><br/>
1) نحسب: a = lim(x→+∞) f(x)/x<br/>
2) إذا كان a عدداً حقيقياً (≠ 0)، نحسب: b = lim(x→+∞) [f(x) - ax]<br/>
3) إذا كان b عدداً حقيقياً: y = ax + b مقارب مائل
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> أوجد المستقيم المقارب المائل لـ f(x) = (x² + 2x + 3)/(x + 1)<br/>
بالقسمة الإقليدية: f(x) = x + 1 + 2/(x+1)<br/><br/>
a = lim(x→+∞) f(x)/x = lim (x + 1 + 2/(x+1))/x = 1<br/>
b = lim(x→+∞) [f(x) - x] = lim [1 + 2/(x+1)] = 1<br/><br/>
المستقيم المقارب المائل: y = x + 1<br/>
فعلاً: f(x) - (x+1) = 2/(x+1) → 0 عند ±∞
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. الموضع النسبي للمنحنى والمقارب</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 خاصية:</strong> ندرس إشارة f(x) - (ax + b):<br/>
• إذا f(x) - (ax + b) &gt; 0: المنحنى فوق المقارب<br/>
• إذا f(x) - (ax + b) &lt; 0: المنحنى تحت المقارب
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) أوجد المستقيمات المقاربة لـ f(x) = (2x² - x + 3)/(x - 1)<br/>
2) حدد الموضع النسبي للمنحنى والمقارب المائل<br/>
3) أوجد المقارب المائل لـ g(x) = (x³ + 1)/(x² + 1)
</div>
</div>' WHERE id = 'ef339e50-31b9-4e00-a530-722ede7c349d';

-- 23) دراسة دالة (النهايات)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">دراسة دالة كاملة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. خطوات الدراسة الكاملة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 المنهجية:</strong><br/>
<strong>①</strong> مجموعة التعريف D_f<br/>
<strong>②</strong> دراسة التماثل (زوجية/فردية/دورية)<br/>
<strong>③</strong> حساب النهايات عند أطراف D_f → المستقيمات المقاربة<br/>
<strong>④</strong> حساب f''(x) ودراسة إشارتها<br/>
<strong>⑤</strong> جدول التغيرات<br/>
<strong>⑥</strong> نقاط خاصة (تقاطع مع المحاور)<br/>
<strong>⑦</strong> رسم المنحنى البياني
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. مثال تطبيقي كامل</h3>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> دراسة f(x) = (x² - 1)/(x - 2)<br/><br/>

<strong>① D_f = ℝ \ {2}</strong><br/><br/>

<strong>② التماثل:</strong> f(-x) = (x² - 1)/(-x - 2) ≠ f(x) ≠ -f(x) → لا تماثل<br/><br/>

<strong>③ النهايات:</strong><br/>
lim(x→2⁺) f(x) = 3/0⁺ = +∞ و lim(x→2⁻) f(x) = 3/0⁻ = -∞ → x = 2 مقارب شاقولي<br/>
بالقسمة: f(x) = x + 2 + 3/(x-2) → y = x + 2 مقارب مائل<br/><br/>

<strong>④ الاشتقاق:</strong><br/>
f''(x) = [2x(x-2) - (x²-1)]/(x-2)² = (x² - 4x + 1)/(x-2)²<br/>
f''(x) = 0 ⟹ x = 2 ± √3<br/><br/>

<strong>⑤ جدول التغيرات:</strong><br/>
f متزايدة على ]-∞, 2-√3]، متناقصة على [2-√3, 2[∪]2, 2+√3]، متزايدة على [2+√3, +∞[<br/>
f(2-√3) = 4 - 2√3 (قيمة عظمى محلية)<br/>
f(2+√3) = 4 + 2√3 (قيمة صغرى محلية)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> ادرس دراسة كاملة الدالة:<br/>
f(x) = (x² + x - 2)/(x + 1)<br/>
(مجموعة التعريف، النهايات، المقاربات، الاشتقاق، جدول التغيرات، الرسم)
</div>
</div>' WHERE id = '79faff42-839e-401c-a7d1-6aacfa325d5f';

-- 24) المتتاليات العددية (المتتاليات العددية)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المتتاليات العددية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريف متتالية عددية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> المتتالية العددية (uₙ) هي دالة من ℕ (أو جزء منه) إلى ℝ.<br/>
تربط كل عدد طبيعي n بعدد حقيقي uₙ يُسمى الحد العام للمتتالية.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. طرق تعريف متتالية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 الطريقة الصريحة:</strong> uₙ = f(n) (الحد العام يُعطى بدالة n)<br/>
مثال: uₙ = 2n + 3
</div>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 الطريقة بالتراجع:</strong> يُعطى الحد الأول u₀ وعلاقة تراجعية uₙ₊₁ = f(uₙ)<br/>
مثال: u₀ = 1 و uₙ₊₁ = 2uₙ + 3
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong><br/>
• uₙ = n² - 1: u₀ = -1, u₁ = 0, u₂ = 3, u₃ = 8, u₄ = 15<br/>
• v₀ = 2, vₙ₊₁ = 3vₙ - 1: v₁ = 5, v₂ = 14, v₃ = 41
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. اتجاه التغير</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 الطرق:</strong><br/>
• دراسة إشارة uₙ₊₁ - uₙ:<br/>
  - uₙ₊₁ - uₙ &gt; 0 ⟹ متزايدة<br/>
  - uₙ₊₁ - uₙ &lt; 0 ⟹ متناقصة<br/>
• إذا uₙ &gt; 0: دراسة uₙ₊₁/uₙ مقارنة بـ 1<br/>
• إذا uₙ = f(n): دراسة اتجاه تغير f
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) عرّف المتتالية uₙ = (2n+1)/(n+3) واحسب الحدود الخمسة الأولى<br/>
2) ادرس اتجاه تغير المتتالية vₙ = n² - 5n<br/>
3) لتكن wₙ₊₁ = wₙ/(1+wₙ) مع w₀ = 1. احسب w₁, w₂, w₃. هل المتتالية متزايدة أم متناقصة؟
</div>
</div>' WHERE id = 'aec7bc43-e373-45d0-9daa-290131830de4';

-- 25) التمثيل البياني لمتتالية عددية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">التمثيل البياني لمتتالية عددية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التمثيل البياني المباشر</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 الطريقة:</strong> نمثل النقاط (n, uₙ) في معلم حيث:<br/>
• محور الفواصل: الأعداد الطبيعية n<br/>
• محور الأراتيب: قيم الحدود uₙ<br/>
نحصل على مجموعة نقاط معزولة (وليس منحنى متصل).
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> uₙ = (-1)ⁿ/n لـ n ≥ 1<br/>
u₁ = -1, u₂ = 1/2, u₃ = -1/3, u₄ = 1/4, u₅ = -1/5<br/>
النقاط: (1,-1), (2,0.5), (3,-0.33), (4,0.25), (5,-0.2)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. التمثيل بطريقة السلّم (للمتتاليات بالتراجع)</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 الطريقة:</strong> إذا كانت uₙ₊₁ = f(uₙ):<br/>
1) ارسم منحنى y = f(x) والمستقيم y = x<br/>
2) ابدأ من النقطة (u₀, 0) على محور الفواصل<br/>
3) ارسم خطاً شاقولياً حتى المنحنى، ثم أفقياً حتى المستقيم y = x<br/>
4) كرر العملية للحصول على الحدود التالية
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. قراءة بيانية</h3>

<p>من التمثيل البياني يمكن:</p>
<ul>
<li>تخمين اتجاه التغير (متزايدة/متناقصة)</li>
<li>تخمين وجود نهاية (تقارب نحو قيمة معينة)</li>
<li>ملاحظة التذبذب (للمتتاليات المتناوبة)</li>
<li>تقدير سرعة التقارب</li>
</ul>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) مثّل بيانياً المتتالية uₙ = 1/n لـ n من 1 إلى 10<br/>
2) استعمل طريقة السلّم لتمثيل أولى حدود uₙ₊₁ = √(uₙ + 2) مع u₀ = 0<br/>
3) ماذا تلاحظ حول تقارب هذه المتتالية؟
</div>
</div>' WHERE id = '5e14e54e-2386-4082-b01c-e6b13190b09a';

-- 26) إتجاه تغير متتالية عددية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">اتجاه تغير متتالية عددية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريفات</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong><br/>
• (uₙ) <strong>متزايدة</strong> إذا: uₙ₊₁ ≥ uₙ لكل n<br/>
• (uₙ) <strong>متناقصة</strong> إذا: uₙ₊₁ ≤ uₙ لكل n<br/>
• (uₙ) <strong>رتيبة</strong> إذا كانت متزايدة أو متناقصة
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الطريقة 1: دراسة إشارة uₙ₊₁ - uₙ</h3>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> uₙ = n² - 5n<br/>
uₙ₊₁ - uₙ = (n+1)² - 5(n+1) - n² + 5n = 2n + 1 - 5 = 2n - 4<br/>
• إذا n ≥ 2: uₙ₊₁ - uₙ ≥ 0 (متزايدة ابتداءً من n = 2)<br/>
• إذا n ≤ 1: uₙ₊₁ - uₙ ≤ 0 (متناقصة لـ n = 0, 1)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. الطريقة 2: حاصل القسمة uₙ₊₁/uₙ</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 القاعدة (إذا uₙ &gt; 0):</strong><br/>
• uₙ₊₁/uₙ ≥ 1 لكل n ⟹ (uₙ) متزايدة<br/>
• uₙ₊₁/uₙ ≤ 1 لكل n ⟹ (uₙ) متناقصة
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">4. الطريقة 3: استعمال دالة مرفقة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 الطريقة:</strong> إذا uₙ = f(n) حيث f دالة monotone على [n₀, +∞[:<br/>
• f متزايدة ⟹ (uₙ) متزايدة<br/>
• f متناقصة ⟹ (uₙ) متناقصة
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> ادرس اتجاه تغير المتتاليات:<br/>
1) uₙ = 2ⁿ/(n+1)<br/>
2) vₙ = (n+1)/(2n+3)<br/>
3) wₙ₊₁ = (wₙ + 3)/2 مع w₀ = 0
</div>
</div>' WHERE id = '4a5daa71-b22e-47cc-b722-22aa2c4ea9e0';

-- 27) المتتاليات الحسابية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المتتاليات الحسابية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> (uₙ) متتالية حسابية أساسها r إذا:<br/>
uₙ₊₁ = uₙ + r لكل n ∈ ℕ<br/>
أي أن الفرق بين كل حدين متتاليين ثابت يساوي r.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الحد العام</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغة الحد العام:</strong><br/>
<strong>uₙ = u₀ + nr</strong><br/>
أو بشكل عام: uₙ = uₚ + (n - p)r
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> متتالية حسابية حدها الأول u₀ = 3 وأساسها r = 5<br/>
uₙ = 3 + 5n<br/>
u₀ = 3, u₁ = 8, u₂ = 13, u₃ = 18, ...
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. مجموع n+1 حد أول</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغة المجموع:</strong><br/>
Sₙ = u₀ + u₁ + ... + uₙ = (n+1)(u₀ + uₙ)/2<br/>
أو: Sₙ = (n+1)(2u₀ + nr)/2<br/><br/>
<strong>حالة خاصة:</strong> 1 + 2 + 3 + ... + n = n(n+1)/2
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> احسب S = 3 + 8 + 13 + 18 + ... + 53<br/>
r = 5, u₀ = 3, uₙ = 53<br/>
53 = 3 + 5n ⟹ n = 10<br/>
S₁₀ = 11 × (3 + 53)/2 = 11 × 28 = 308
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">4. خواص</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 خواص:</strong><br/>
• r &gt; 0: المتتالية متزايدة<br/>
• r &lt; 0: المتتالية متناقصة<br/>
• r = 0: المتتالية ثابتة<br/>
• التمثيل البياني: نقاط على مستقيم
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) أثبت أن uₙ = 4n - 7 متتالية حسابية وحدد أساسها<br/>
2) (uₙ) حسابية u₃ = 11 و u₇ = 23. أوجد u₀ و r<br/>
3) احسب 1 + 3 + 5 + ... + 99 (مجموع الأعداد الفردية الأولى)
</div>
</div>' WHERE id = '8f40badf-f2cb-4df4-aa57-2e16ac43c6a7';

-- 28) المتتاليات الهندسية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المتتاليات الهندسية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> (uₙ) متتالية هندسية أساسها q (q ≠ 0) إذا:<br/>
uₙ₊₁ = uₙ × q لكل n ∈ ℕ<br/>
أي أن النسبة بين كل حدين متتاليين ثابتة تساوي q.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الحد العام</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغة الحد العام:</strong><br/>
<strong>uₙ = u₀ × qⁿ</strong><br/>
أو: uₙ = uₚ × qⁿ⁻ᵖ
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> u₀ = 5 و q = 2<br/>
uₙ = 5 × 2ⁿ<br/>
u₀ = 5, u₁ = 10, u₂ = 20, u₃ = 40, ...
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. مجموع n+1 حد أول</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغة المجموع (q ≠ 1):</strong><br/>
Sₙ = u₀ + u₁ + ... + uₙ = u₀ × (1 - qⁿ⁺¹)/(1 - q)<br/><br/>
<strong>حالة خاصة:</strong> 1 + q + q² + ... + qⁿ = (1 - qⁿ⁺¹)/(1 - q)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> احسب S = 1 + 2 + 4 + 8 + ... + 2⁹<br/>
متتالية هندسية: u₀ = 1, q = 2, n = 9<br/>
S = (1 - 2¹⁰)/(1 - 2) = (1 - 1024)/(-1) = 1023
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">4. اتجاه التغير</h3>

<table style="width: 100%; border-collapse: collapse; margin: 15px 0; text-align: center;">
<tr style="background: #2c3e50; color: white;"><th style="padding: 10px; border: 1px solid #ddd;">u₀</th><th style="padding: 10px; border: 1px solid #ddd;">q</th><th style="padding: 10px; border: 1px solid #ddd;">الاتجاه</th></tr>
<tr><td style="padding: 10px; border: 1px solid #ddd;">u₀ &gt; 0</td><td style="padding: 10px; border: 1px solid #ddd;">q &gt; 1</td><td style="padding: 10px; border: 1px solid #ddd;">متزايدة</td></tr>
<tr style="background: #f8f9fa;"><td style="padding: 10px; border: 1px solid #ddd;">u₀ &gt; 0</td><td style="padding: 10px; border: 1px solid #ddd;">0 &lt; q &lt; 1</td><td style="padding: 10px; border: 1px solid #ddd;">متناقصة</td></tr>
<tr><td style="padding: 10px; border: 1px solid #ddd;">u₀ &gt; 0</td><td style="padding: 10px; border: 1px solid #ddd;">q &lt; 0</td><td style="padding: 10px; border: 1px solid #ddd;">غير رتيبة (متناوبة)</td></tr>
</table>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) أثبت أن uₙ = 3 × (1/2)ⁿ متتالية هندسية وحدد أساسها<br/>
2) (uₙ) هندسية u₂ = 12 و u₅ = 96. أوجد u₀ و q<br/>
3) رأس مال 10000 دج بفائدة مركبة 5%. ما قيمته بعد 10 سنوات؟
</div>
</div>' WHERE id = '486a9cac-14a3-4e1c-98d5-c019211332b8';

-- 29) نهاية متتالية عددية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">نهاية متتالية عددية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريف التقارب</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> نقول أن المتتالية (uₙ) تتقارب نحو L ونكتب lim(n→+∞) uₙ = L إذا:<br/>
|uₙ - L| يقترب من 0 عندما n يكبر بلا حدود.<br/><br/>
إذا لم تكن المتتالية متقاربة نقول أنها <strong>متباعدة</strong>.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. نهايات مرجعية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 نتائج أساسية:</strong><br/>
• lim(n→+∞) 1/n = 0<br/>
• lim(n→+∞) 1/n² = 0<br/>
• lim(n→+∞) 1/√n = 0<br/>
• lim(n→+∞) c = c (لكل ثابت c)<br/>
• lim(n→+∞) nᵅ = +∞ لكل α &gt; 0
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. العمليات على النهايات</h3>

<p>إذا lim uₙ = L و lim vₙ = L'' (حيث L و L'' أعداد حقيقية):</p>
<ul>
<li>lim(uₙ + vₙ) = L + L''</li>
<li>lim(uₙ × vₙ) = L × L''</li>
<li>lim(uₙ/vₙ) = L/L'' (إذا L'' ≠ 0)</li>
<li>lim(k·uₙ) = k·L</li>
</ul>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong><br/>
• lim(n→+∞) (3n² + 2n)/(n² + 1) = lim (3 + 2/n)/(1 + 1/n²) = 3<br/>
• lim(n→+∞) (2n + 1)/(n - 3) = lim (2 + 1/n)/(1 - 3/n) = 2<br/>
• lim(n→+∞) n/(n² + 1) = lim (1/n)/(1 + 1/n²) = 0
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> احسب النهايات:<br/>
1) lim(n→+∞) (n³ - 2n)/(3n³ + n²)<br/>
2) lim(n→+∞) (√(n+1) - √n)<br/>
3) lim(n→+∞) (1 + 1/n)ⁿ
</div>
</div>' WHERE id = '49d89c4e-d331-4e5e-8733-1def7591a217';

-- 30) نهاية متتالية عددية باستعمال الحصر
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">نهاية متتالية عددية باستعمال الحصر</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. مبرهنة الحصر (الدرك)</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 مبرهنة الحصر (Squeeze Theorem):</strong><br/>
إذا كانت لدينا ثلاث متتاليات (aₙ)، (uₙ)، (bₙ) حيث:<br/>
① aₙ ≤ uₙ ≤ bₙ لكل n ≥ n₀<br/>
② lim(n→+∞) aₙ = lim(n→+∞) bₙ = L<br/>
فإن: <strong>lim(n→+∞) uₙ = L</strong>
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 1:</strong> أثبت أن lim(n→+∞) sin(n)/n = 0<br/>
نعلم أن -1 ≤ sin(n) ≤ 1 لكل n<br/>
بالقسمة على n (n &gt; 0): -1/n ≤ sin(n)/n ≤ 1/n<br/>
بما أن lim(-1/n) = lim(1/n) = 0<br/>
حسب مبرهنة الحصر: lim sin(n)/n = 0
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. تطبيق: المتتاليات المحصورة</h3>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 2:</strong> أوجد نهاية uₙ = (n + (-1)ⁿ)/(2n + 1)<br/>
بما أن -1 ≤ (-1)ⁿ ≤ 1:<br/>
(n - 1)/(2n + 1) ≤ uₙ ≤ (n + 1)/(2n + 1)<br/><br/>
lim (n-1)/(2n+1) = 1/2 و lim (n+1)/(2n+1) = 1/2<br/>
حسب مبرهنة الحصر: lim uₙ = 1/2
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. المتتاليات المتقاربة الرتيبة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 مبرهنة:</strong><br/>
• كل متتالية متزايدة ومحدودة من الأعلى متقاربة<br/>
• كل متتالية متناقصة ومحدودة من الأسفل متقاربة
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) باستعمال الحصر، أثبت أن lim(n→+∞) cos(n²)/n = 0<br/>
2) أثبت أن المتتالية uₙ = (2ⁿ + (-1)ⁿ)/2ⁿ تتقارب نحو 1<br/>
3) لتكن uₙ₊₁ = (uₙ + 3)/2 مع u₀ = 0. أثبت أن 0 ≤ uₙ ≤ 3 وأن (uₙ) متزايدة. استنتج أنها متقاربة وأوجد نهايتها
</div>
</div>' WHERE id = 'c9106f17-f1cb-4e09-a954-4d173985d44d';
