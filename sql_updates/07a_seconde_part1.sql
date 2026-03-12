-- =====================================================
-- Seconde (2ème Année Secondaire) - Batch 1/12
-- Covers: الدوال العددية + كثيرات الحدود + الإشتقاقية (partial)
-- Lessons 1-15 of 177
-- =====================================================

-- 1) تذكير حول الدوال (الدوال العددية)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">تذكير حول الدوال العددية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريف دالة عددية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> الدالة العددية f هي قاعدة تربط كل عدد حقيقي x من مجموعة التعريف D_f بعدد حقيقي وحيد يُرمز له f(x).<br/>
نكتب: f: D_f → ℝ, x ↦ f(x)
</div>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 مجموعة التعريف:</strong> مجموعة التعريف D_f هي مجموعة جميع القيم الحقيقية x التي يكون عندها f(x) موجوداً (معرّفاً).
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. تحديد مجموعة التعريف</h3>

<p><strong>القواعد الأساسية:</strong></p>
<ul>
<li>دالة كثير حدود: D_f = ℝ</li>
<li>دالة ناطقة P(x)/Q(x): D_f = ℝ \ {x : Q(x) = 0}</li>
<li>دالة جذرية √(f(x)): نحل f(x) ≥ 0</li>
</ul>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 1:</strong> أوجد مجموعة تعريف الدالة f(x) = (x² - 1)/(x - 3)<br/>
<strong>الحل:</strong> الشرط: x - 3 ≠ 0 أي x ≠ 3<br/>
إذن: D_f = ℝ \ {3} = ]-∞, 3[ ∪ ]3, +∞[
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 2:</strong> أوجد مجموعة تعريف الدالة g(x) = √(2x - 6)<br/>
<strong>الحل:</strong> الشرط: 2x - 6 ≥ 0 ⟹ x ≥ 3<br/>
إذن: D_g = [3, +∞[
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. صورة وسابقة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong><br/>
• <strong>صورة a بالدالة f:</strong> هي العدد f(a) حيث a ∈ D_f<br/>
• <strong>سابقة العدد b بالدالة f:</strong> هي كل عدد a حيث f(a) = b
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">4. التمثيل البياني لدالة</h3>

<p>المنحنى البياني للدالة f هو مجموعة النقاط M(x, f(x)) حيث x ∈ D_f في معلم متعامد ومتجانس.</p>

<div style="background: #fdedec; padding: 15px; border-right: 4px solid #e74c3c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e74c3c;">⚠️ تنبيه:</strong> النقطة M(a, b) تنتمي إلى المنحنى (C_f) إذا وفقط إذا كان b = f(a) أي f(a) = b.
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> لتكن f(x) = x² - 4x + 3<br/>
1) حدد مجموعة تعريف f<br/>
2) احسب f(0)، f(1)، f(2)، f(3)<br/>
3) هل النقطة A(5, 8) تنتمي إلى (C_f)؟
</div>
</div>' WHERE id = 'd0b59d4e-0280-45cb-b980-50d5d9615310';

-- 2) الدوال المرجعية (الدوال العددية)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الدوال المرجعية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الدالة التآلفية (من الدرجة الأولى)</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> f(x) = ax + b حيث a, b ∈ ℝ و a ≠ 0<br/>
• D_f = ℝ<br/>
• التمثيل البياني: مستقيم ميله a ويقطع محور الأراتيب في النقطة (0, b)<br/>
• إذا a &gt; 0: الدالة متزايدة تماماً على ℝ<br/>
• إذا a &lt; 0: الدالة متناقصة تماماً على ℝ
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الدالة التربيعية (المربع)</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> f(x) = x²<br/>
• D_f = ℝ<br/>
• متناقصة على ]-∞, 0] ومتزايدة على [0, +∞[<br/>
• القيمة الصغرى: f(0) = 0<br/>
• المنحنى: قطع مكافئ رأسه O(0,0) ومحور تناظره (Oy)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. الدالة المقلوب</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> f(x) = 1/x<br/>
• D_f = ℝ* = ℝ \ {0}<br/>
• متناقصة تماماً على ]-∞, 0[ وعلى ]0, +∞[<br/>
• المنحنى: قطع زائد مركزه O ومحاور تناظره y = x و y = -x
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">4. دالة الجذر التربيعي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> f(x) = √x<br/>
• D_f = [0, +∞[<br/>
• متزايدة تماماً على [0, +∞[<br/>
• f(0) = 0، f(1) = 1، f(4) = 2
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">5. دالة القيمة المطلقة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> f(x) = |x| = x إذا x ≥ 0، و f(x) = -x إذا x &lt; 0<br/>
• D_f = ℝ<br/>
• متناقصة على ]-∞, 0] ومتزايدة على [0, +∞[<br/>
• المنحنى على شكل حرف V رأسه O
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> قارن بين العددين باستعمال خاصيات الدوال المرجعية:<br/>
• √5 و √7: بما أن x ↦ √x متزايدة و 5 &lt; 7 فإن √5 &lt; √7<br/>
• 1/3 و 1/5: بما أن x ↦ 1/x متناقصة على ]0,+∞[ و 3 &lt; 5 فإن 1/3 &gt; 1/5
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) ارسم المنحنيات البيانية للدوال المرجعية الخمس في نفس المعلم<br/>
2) حدد اتجاه تغير كل دالة<br/>
3) قارن: √3 و √(π)، ثم 1/√2 و 1/√3
</div>
</div>' WHERE id = '688ce86c-9ddf-4210-bd79-31cb037aea7e';

-- 3) عمليات على الدوال (الدوال العددية)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">عمليات على الدوال</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. مجموع وفرق دالتين</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> لتكن f و g دالتان معرّفتان على D:<br/>
• (f + g)(x) = f(x) + g(x) على D_f ∩ D_g<br/>
• (f - g)(x) = f(x) - g(x) على D_f ∩ D_g
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. جداء دالتين وقسمة دالتين</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong><br/>
• (f × g)(x) = f(x) × g(x) على D_f ∩ D_g<br/>
• (f/g)(x) = f(x)/g(x) على D_f ∩ D_g مع g(x) ≠ 0<br/>
• (k·f)(x) = k × f(x) حيث k ∈ ℝ
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. تركيب دالتين</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> الدالة المركبة g∘f معرّفة بـ: (g∘f)(x) = g(f(x))<br/>
مجموعة تعريفها: {x ∈ D_f : f(x) ∈ D_g}
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> لتكن f(x) = 2x + 1 و g(x) = x²<br/>
• (f + g)(x) = 2x + 1 + x² = x² + 2x + 1<br/>
• (f × g)(x) = (2x + 1) × x² = 2x³ + x²<br/>
• (g∘f)(x) = g(f(x)) = g(2x+1) = (2x+1)² = 4x² + 4x + 1<br/>
• (f∘g)(x) = f(g(x)) = f(x²) = 2x² + 1
</div>

<div style="background: #fdedec; padding: 15px; border-right: 4px solid #e74c3c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e74c3c;">⚠️ تنبيه:</strong> بشكل عام g∘f ≠ f∘g. التركيب ليس تبديلياً.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">4. أثر العمليات على اتجاه التغير</h3>

<table style="width: 100%; border-collapse: collapse; margin: 15px 0; text-align: center;">
<tr style="background: #2c3e50; color: white;"><th style="padding: 10px; border: 1px solid #ddd;">العملية</th><th style="padding: 10px; border: 1px solid #ddd;">الأثر على اتجاه التغير</th></tr>
<tr><td style="padding: 10px; border: 1px solid #ddd;">k·f مع k &gt; 0</td><td style="padding: 10px; border: 1px solid #ddd;">نفس اتجاه f</td></tr>
<tr style="background: #f8f9fa;"><td style="padding: 10px; border: 1px solid #ddd;">k·f مع k &lt; 0</td><td style="padding: 10px; border: 1px solid #ddd;">عكس اتجاه f</td></tr>
<tr><td style="padding: 10px; border: 1px solid #ddd;">f + g (متزايدتان)</td><td style="padding: 10px; border: 1px solid #ddd;">متزايدة</td></tr>
</table>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> لتكن f(x) = x² + 1 و g(x) = 1/x<br/>
1) حدد مجموعة تعريف كل من f+g و f/g و g∘f<br/>
2) عبّر عن (g∘f)(x)
</div>
</div>' WHERE id = '66f7c5d1-5825-4319-99e4-61c94975d693';

-- 4) إتجاه التغير (الدوال العددية)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">اتجاه تغير دالة عددية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريف الدالة المتزايدة والمتناقصة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> لتكن f دالة معرّفة على مجال I:<br/>
• f <strong>متزايدة</strong> على I إذا: لكل x₁, x₂ ∈ I: x₁ &lt; x₂ ⟹ f(x₁) ≤ f(x₂)<br/>
• f <strong>متزايدة تماماً</strong> على I إذا: لكل x₁, x₂ ∈ I: x₁ &lt; x₂ ⟹ f(x₁) &lt; f(x₂)<br/>
• f <strong>متناقصة</strong> على I إذا: لكل x₁, x₂ ∈ I: x₁ &lt; x₂ ⟹ f(x₁) ≥ f(x₂)<br/>
• f <strong>متناقصة تماماً</strong> على I إذا: لكل x₁, x₂ ∈ I: x₁ &lt; x₂ ⟹ f(x₁) &gt; f(x₂)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. طريقة دراسة اتجاه التغير</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 الطريقة:</strong> لدراسة اتجاه تغير f على I:<br/>
1) نأخذ x₁, x₂ ∈ I حيث x₁ &lt; x₂<br/>
2) ندرس إشارة f(x₁) - f(x₂) أو نسبة التغير [f(x₁) - f(x₂)]/(x₁ - x₂)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> أثبت أن f(x) = x² - 2x متناقصة على ]-∞, 1]<br/>
<strong>الحل:</strong> لنأخذ x₁ &lt; x₂ ≤ 1<br/>
f(x₁) - f(x₂) = (x₁² - 2x₁) - (x₂² - 2x₂) = (x₁² - x₂²) - 2(x₁ - x₂)<br/>
= (x₁ - x₂)(x₁ + x₂) - 2(x₁ - x₂) = (x₁ - x₂)(x₁ + x₂ - 2)<br/>
بما أن x₁ &lt; x₂: (x₁ - x₂) &lt; 0<br/>
بما أن x₁ &lt; x₂ ≤ 1: x₁ + x₂ &lt; 2 أي (x₁ + x₂ - 2) &lt; 0<br/>
إذن: f(x₁) - f(x₂) &gt; 0 أي f(x₁) &gt; f(x₂)<br/>
∴ f متناقصة تماماً على ]-∞, 1]
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. جدول التغيرات</h3>

<p>جدول التغيرات يلخص اتجاه تغير الدالة على مجال تعريفها، نضع فيه:</p>
<ul>
<li>سهم صاعد (↗) يعني الدالة متزايدة</li>
<li>سهم نازل (↘) يعني الدالة متناقصة</li>
<li>القيم الحدية عند نقاط التحول</li>
</ul>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) ادرس اتجاه تغير f(x) = -x² + 4x - 1 على كل من ]-∞, 2] و [2, +∞[<br/>
2) أنشئ جدول التغيرات<br/>
3) استنتج القيمة القصوى لـ f
</div>
</div>' WHERE id = '1b407dde-723c-4bbc-83c2-ead1a2865921';

-- 5) التمثيل البياني (الدوال العددية)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">التمثيل البياني لدالة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المنحنى البياني لدالة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> المنحنى البياني (C_f) للدالة f في معلم (O, i⃗, j⃗) هو مجموعة النقاط M(x, y) حيث y = f(x) و x ∈ D_f.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. قراءة بيانية</h3>

<p>من المنحنى البياني يمكننا:</p>
<ul>
<li><strong>تحديد مجموعة التعريف:</strong> مسقط المنحنى على محور الفواصل</li>
<li><strong>تحديد المدى:</strong> مسقط المنحنى على محور الأراتيب</li>
<li><strong>إيجاد الصور:</strong> قراءة f(a) من المنحنى (الأرتوب المقابل للفاصلة a)</li>
<li><strong>إيجاد السوابق:</strong> حل f(x) = b بيانياً (فواصل نقاط تقاطع المنحنى مع y = b)</li>
<li><strong>حل المعادلة f(x) = 0:</strong> فواصل نقاط تقاطع المنحنى مع محور الفواصل</li>
<li><strong>تحديد إشارة f(x):</strong> f(x) &gt; 0 فوق محور الفواصل، f(x) &lt; 0 تحته</li>
</ul>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. رسم منحنى بياني</h3>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> ارسم المنحنى البياني لـ f(x) = x² - 2x - 3<br/>
<strong>الخطوات:</strong><br/>
1) D_f = ℝ<br/>
2) جدول القيم:<br/>
x: -2, -1, 0, 1, 2, 3, 4<br/>
f(x): 5, 0, -3, -4, -3, 0, 5<br/>
3) f(x) = (x-1)² - 4: رأس القطع المكافئ V(1, -4)<br/>
4) f(x) = 0 ⟹ x = -1 أو x = 3 (نقاط التقاطع مع Ox)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">4. عناصر التماثل</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 خاصية:</strong><br/>
• إذا كانت f زوجية (f(-x) = f(x)): المنحنى متماثل بالنسبة لمحور الأراتيب<br/>
• إذا كانت f فردية (f(-x) = -f(x)): المنحنى متماثل بالنسبة لنقطة الأصل
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> لتكن f(x) = x³ - 3x<br/>
1) أنشئ جدول قيم لـ x ∈ [-2, 2] بخطوة 0.5<br/>
2) ارسم المنحنى البياني<br/>
3) أثبت أن f فردية واستنتج عنصر تماثل المنحنى<br/>
4) حل بيانياً: f(x) = 0 ثم f(x) &gt; 0
</div>
</div>' WHERE id = '4ada8125-4fee-4a59-b5fd-cea8c62ae970';

-- 6) عمليات على كثيرات الحدود (الدوال كثيرات الحدود)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">عمليات على كثيرات الحدود</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريف كثير الحدود</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> كثير الحدود من الدرجة n هو تعبير على الشكل:<br/>
P(x) = aₙxⁿ + aₙ₋₁xⁿ⁻¹ + ... + a₁x + a₀<br/>
حيث aₙ ≠ 0 و n ∈ ℕ و aᵢ ∈ ℝ<br/>
• aₙ: المعامل الرئيسي<br/>
• n: درجة كثير الحدود (deg P = n)<br/>
• a₀: الحد الثابت
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. العمليات على كثيرات الحدود</h3>

<p><strong>المجموع والفرق:</strong> نجمع المعاملات المتشابهة (نفس الأس)</p>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong><br/>
P(x) = 3x³ - 2x² + x - 1 و Q(x) = x³ + 4x² - 3x + 5<br/>
P(x) + Q(x) = 4x³ + 2x² - 2x + 4<br/>
P(x) - Q(x) = 2x³ - 6x² + 4x - 6
</div>

<p><strong>الجداء:</strong> نطبق خاصية التوزيع</p>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> (2x + 1)(x² - 3x + 2) = 2x³ - 6x² + 4x + x² - 3x + 2 = 2x³ - 5x² + x + 2
</div>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 خاصية الدرجة:</strong><br/>
• deg(P + Q) ≤ max(deg P, deg Q)<br/>
• deg(P × Q) = deg P + deg Q
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. القسمة الإقليدية لكثيرات الحدود</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 مبرهنة:</strong> لكل كثيري حدود A و B (B ≠ 0)، يوجد كثيرا حدود Q و R وحيدان حيث:<br/>
A(x) = B(x) × Q(x) + R(x) مع deg R &lt; deg B<br/>
Q: الحاصل، R: الباقي
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">4. جذور كثير الحدود</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 مبرهنة الباقي:</strong> باقي قسمة P(x) على (x - a) يساوي P(a).<br/>
<strong>نتيجة:</strong> a جذر لـ P(x) ⟺ P(a) = 0 ⟺ (x - a) يقسم P(x)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) أجرِ القسمة الإقليدية لـ P(x) = 2x³ - 3x² + x - 6 على B(x) = x - 2<br/>
2) استنتج هل x = 2 جذر لـ P(x)؟<br/>
3) حلل P(x) إن أمكن
</div>
</div>' WHERE id = '6193aa9b-7a47-414e-ba64-bd1580b4ac1d';

-- 7) المعادلات من الدرجة الثانية (الدوال كثيرات الحدود)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المعادلات من الدرجة الثانية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الشكل العام</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> المعادلة من الدرجة الثانية هي: ax² + bx + c = 0 حيث a ≠ 0<br/>
<strong>المميز (المنقوص):</strong> Δ = b² - 4ac
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. حل المعادلة حسب إشارة Δ</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 القاعدة:</strong><br/>
• إذا Δ &gt; 0: حلّان حقيقيان مختلفان: x₁ = (-b - √Δ)/(2a) و x₂ = (-b + √Δ)/(2a)<br/>
• إذا Δ = 0: حل مضاعف: x₀ = -b/(2a)<br/>
• إذا Δ &lt; 0: لا يوجد حل حقيقي (S = ∅)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 1:</strong> حل x² - 5x + 6 = 0<br/>
a = 1, b = -5, c = 6<br/>
Δ = 25 - 24 = 1 &gt; 0<br/>
x₁ = (5 - 1)/2 = 2 و x₂ = (5 + 1)/2 = 3<br/>
S = {2, 3}
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 2:</strong> حل 2x² + 3x + 5 = 0<br/>
Δ = 9 - 40 = -31 &lt; 0<br/>
S = ∅ (لا يوجد حل في ℝ)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. علاقات فييت (Viète)</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 خاصية:</strong> إذا كان x₁ و x₂ جذري ax² + bx + c = 0:<br/>
• x₁ + x₂ = -b/a (مجموع الجذرين)<br/>
• x₁ × x₂ = c/a (جداء الجذرين)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">4. التحليل بالجذور</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغة التحليل:</strong><br/>
• Δ &gt; 0: ax² + bx + c = a(x - x₁)(x - x₂)<br/>
• Δ = 0: ax² + bx + c = a(x - x₀)²<br/>
• Δ &lt; 0: لا يمكن التحليل في ℝ
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) حل: 3x² - 7x + 2 = 0<br/>
2) حلل: 2x² - 8x + 8<br/>
3) أوجد عددين مجموعهما 10 وجداؤهما 21
</div>
</div>' WHERE id = 'bfef1392-56bb-46bd-afe8-d660c631c5c6';

-- 8) المتراجحات من الدرجة الثانية (الدوال كثيرات الحدود)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المتراجحات من الدرجة الثانية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. إشارة ثلاثي الحدود ax² + bx + c</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قاعدة الإشارة:</strong> حيث a ≠ 0 و Δ = b² - 4ac:<br/><br/>
<strong>الحالة 1: Δ &lt; 0:</strong> إشارة ax² + bx + c هي نفس إشارة a لكل x ∈ ℝ<br/><br/>
<strong>الحالة 2: Δ = 0:</strong> ax² + bx + c = a(x - x₀)² حيث x₀ = -b/(2a)<br/>
إشارته هي نفس إشارة a لكل x ≠ x₀، وتنعدم عند x₀<br/><br/>
<strong>الحالة 3: Δ &gt; 0:</strong> ax² + bx + c = a(x - x₁)(x - x₂) مع x₁ &lt; x₂<br/>
• بين الجذرين: إشارة عكس a<br/>
• خارج الجذرين: نفس إشارة a
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> حل المتراجحة x² - 3x + 2 &gt; 0<br/>
<strong>الحل:</strong><br/>
Δ = 9 - 8 = 1 &gt; 0 → x₁ = 1, x₂ = 2 (a = 1 &gt; 0)<br/>
جدول الإشارة: موجبة خارج الجذرين، سالبة بينهما<br/>
S = ]-∞, 1[ ∪ ]2, +∞[
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. حل متراجحات من الدرجة الثانية</h3>

<p><strong>الخطوات:</strong></p>
<ol>
<li>كتابة المتراجحة على الشكل: ax² + bx + c ≥ 0 (أو ≤ أو &gt; أو &lt;)</li>
<li>حساب Δ وإيجاد الجذور (إن وُجدت)</li>
<li>إنشاء جدول الإشارة</li>
<li>قراءة الحل من الجدول</li>
</ol>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> حل -x² + 4x - 5 ≥ 0<br/>
a = -1, b = 4, c = -5<br/>
Δ = 16 - 20 = -4 &lt; 0<br/>
بما أن a &lt; 0 و Δ &lt; 0: التعبير سالب دائماً<br/>
S = ∅
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> حل المتراجحات التالية:<br/>
1) x² - 5x + 4 ≤ 0<br/>
2) -2x² + 3x - 1 &gt; 0<br/>
3) x² + 2x + 3 &lt; 0
</div>
</div>' WHERE id = 'c5dec85c-221a-4393-a1a9-258398a3d1e3';

-- 9) العدد المشتق (الإشتقاقية)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">العدد المشتق</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. معدل التغير</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> معدل تغير الدالة f بين a و a+h هو النسبة:<br/>
τ(h) = [f(a+h) - f(a)] / h حيث h ≠ 0<br/>
هندسياً: هو ميل الوتر [M(a, f(a)), M''(a+h, f(a+h))]
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. العدد المشتق</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> نقول أن f قابلة للاشتقاق عند a إذا كانت النهاية:<br/>
lim(h→0) [f(a+h) - f(a)] / h<br/>
موجودة ومنتهية. نرمز لها بـ f''(a) ونسميها العدد المشتق لـ f عند a.
</div>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغة مكافئة:</strong><br/>
f''(a) = lim(x→a) [f(x) - f(a)] / (x - a)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 1:</strong> أوجد f''(2) حيث f(x) = x²<br/>
τ(h) = [(2+h)² - 4] / h = [4 + 4h + h² - 4] / h = (4h + h²)/h = 4 + h<br/>
f''(2) = lim(h→0)(4 + h) = 4
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 2:</strong> أوجد f''(1) حيث f(x) = 1/x<br/>
τ(h) = [1/(1+h) - 1] / h = [-h/(1+h)] / h = -1/(1+h)<br/>
f''(1) = lim(h→0) -1/(1+h) = -1
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. التفسير الهندسي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 خاصية:</strong> f''(a) هو <strong>ميل المماس</strong> للمنحنى (C_f) عند النقطة A(a, f(a)).<br/>
معادلة المماس: y = f''(a)(x - a) + f(a)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احسب f''(3) حيث f(x) = x² - 2x + 1 باستعمال التعريف<br/>
2) اكتب معادلة المماس لـ (C_f) عند النقطة ذات الفاصلة 3<br/>
3) احسب g''(0) حيث g(x) = √(x+1)
</div>
</div>' WHERE id = '3fb0641e-29de-4154-97ef-78d778becd3c';

-- 10) مماس لمنحن عند نقطة (الإشتقاقية)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">مماس لمنحنى عند نقطة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. معادلة المماس</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغة المماس:</strong> المماس للمنحنى (C_f) عند النقطة A(a, f(a)) هو المستقيم ذو المعادلة:<br/>
<strong>y = f''(a)(x - a) + f(a)</strong><br/>
• ميله: f''(a)<br/>
• يمر بالنقطة A(a, f(a))
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 1:</strong> أوجد معادلة المماس لمنحنى f(x) = x³ عند النقطة ذات الفاصلة x₀ = 1<br/>
<strong>الحل:</strong><br/>
• f(1) = 1<br/>
• f''(x) = 3x² ⟹ f''(1) = 3<br/>
• معادلة المماس: y = 3(x - 1) + 1 = 3x - 2
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. حالات خاصة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 مماس أفقي:</strong> إذا كان f''(a) = 0 فإن المماس أفقي (موازٍ لمحور الفواصل):<br/>
y = f(a)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 2:</strong> أوجد معادلة المماس لمنحنى f(x) = x² - 4x + 5 عند x₀ = 2<br/>
f(2) = 4 - 8 + 5 = 1<br/>
f''(x) = 2x - 4 ⟹ f''(2) = 0<br/>
المماس: y = 1 (مماس أفقي)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. تحديد فاصلة نقطة التماس</h3>

<p>أحياناً نعرف ميل المماس (أو معادلته) ونريد إيجاد نقطة التماس:</p>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 3:</strong> أوجد النقاط على منحنى f(x) = x³ - 3x حيث المماس أفقي<br/>
f''(x) = 3x² - 3 = 0 ⟹ x² = 1 ⟹ x = 1 أو x = -1<br/>
النقطتان: A(1, -2) و B(-1, 2)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> لتكن f(x) = x² - 2x + 3<br/>
1) اكتب معادلة المماس عند x₀ = 0 ثم عند x₀ = 1 ثم عند x₀ = 3<br/>
2) أوجد النقطة التي يكون فيها المماس موازياً للمستقيم y = 4x + 1<br/>
3) هل يمكن أن يكون المماس موازياً للمستقيم y = -6x؟
</div>
</div>' WHERE id = 'ac61dd18-778c-4f00-afdb-ab758fbd98ce';

-- 11) التقريب التآلفي لدالة (الإشتقاقية)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">التقريب التآلفي لدالة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. مفهوم التقريب التآلفي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 مبدأ:</strong> عندما يكون x قريباً من a، يكون المنحنى قريباً من مماسه. لذلك نقرّب:<br/>
<strong>f(x) ≈ f(a) + f''(a)(x - a)</strong><br/>
هذا يُسمى التقريب التآلفي (الخطي) لـ f بجوار a.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. تطبيقات حسابية</h3>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 1:</strong> قرّب √(4.02) باستعمال التقريب التآلفي<br/>
نأخذ f(x) = √x و a = 4<br/>
f(4) = 2، f''(x) = 1/(2√x) ⟹ f''(4) = 1/4<br/>
√(4.02) ≈ 2 + (1/4)(4.02 - 4) = 2 + 0.005 = 2.005<br/>
<em>(القيمة الدقيقة: 2.00499...)</em>
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 2:</strong> قرّب (1.01)³<br/>
نأخذ f(x) = x³ و a = 1<br/>
f(1) = 1، f''(x) = 3x² ⟹ f''(1) = 3<br/>
(1.01)³ ≈ 1 + 3(0.01) = 1.03<br/>
<em>(القيمة الدقيقة: 1.030301)</em>
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. صيغ تقريبية مفيدة بجوار 0</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 عندما h قريب من 0:</strong><br/>
• (1 + h)ⁿ ≈ 1 + nh<br/>
• √(1 + h) ≈ 1 + h/2<br/>
• 1/(1 + h) ≈ 1 - h
</div>

<div style="background: #fdedec; padding: 15px; border-right: 4px solid #e74c3c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e74c3c;">⚠️ تنبيه:</strong> التقريب التآلفي دقيق فقط عندما يكون x قريباً جداً من a. كلما ابتعدنا عن a زاد الخطأ.
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) قرّب √(9.06) باستعمال التقريب التآلفي<br/>
2) قرّب 1/(2.03)<br/>
3) قرّب (0.98)⁵ باستعمال الصيغة (1+h)ⁿ ≈ 1 + nh
</div>
</div>' WHERE id = '84c6b006-dd34-43dc-9b44-dbbfa6c1e47b';

-- 12) الدالة المشتقة لدالة (الإشتقاقية)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الدالة المشتقة لدالة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريف الدالة المشتقة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> إذا كانت f قابلة للاشتقاق على المجال I، فإن الدالة المشتقة f'' هي الدالة التي تربط كل x ∈ I بالعدد f''(x):<br/>
f''(x) = lim(h→0) [f(x+h) - f(x)] / h
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. جدول المشتقات الأساسية</h3>

<table style="width: 100%; border-collapse: collapse; margin: 15px 0; text-align: center;">
<tr style="background: #2c3e50; color: white;"><th style="padding: 10px; border: 1px solid #ddd;">f(x)</th><th style="padding: 10px; border: 1px solid #ddd;">f''(x)</th><th style="padding: 10px; border: 1px solid #ddd;">مجموعة التعريف</th></tr>
<tr><td style="padding: 10px; border: 1px solid #ddd;">k (ثابت)</td><td style="padding: 10px; border: 1px solid #ddd;">0</td><td style="padding: 10px; border: 1px solid #ddd;">ℝ</td></tr>
<tr style="background: #f8f9fa;"><td style="padding: 10px; border: 1px solid #ddd;">x</td><td style="padding: 10px; border: 1px solid #ddd;">1</td><td style="padding: 10px; border: 1px solid #ddd;">ℝ</td></tr>
<tr><td style="padding: 10px; border: 1px solid #ddd;">xⁿ</td><td style="padding: 10px; border: 1px solid #ddd;">nxⁿ⁻¹</td><td style="padding: 10px; border: 1px solid #ddd;">ℝ</td></tr>
<tr style="background: #f8f9fa;"><td style="padding: 10px; border: 1px solid #ddd;">1/x</td><td style="padding: 10px; border: 1px solid #ddd;">-1/x²</td><td style="padding: 10px; border: 1px solid #ddd;">ℝ*</td></tr>
<tr><td style="padding: 10px; border: 1px solid #ddd;">√x</td><td style="padding: 10px; border: 1px solid #ddd;">1/(2√x)</td><td style="padding: 10px; border: 1px solid #ddd;">]0, +∞[</td></tr>
</table>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong><br/>
• f(x) = x⁴ ⟹ f''(x) = 4x³<br/>
• f(x) = x⁵ ⟹ f''(x) = 5x⁴<br/>
• f(x) = 1/x² = x⁻² ⟹ f''(x) = -2x⁻³ = -2/x³
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. قابلية الاشتقاق والاتصال</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 مبرهنة:</strong> إذا كانت f قابلة للاشتقاق عند a فهي متصلة عند a.<br/>
<strong>العكس غير صحيح:</strong> f(x) = |x| متصلة عند 0 لكن غير قابلة للاشتقاق عند 0.
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> أوجد الدالة المشتقة:<br/>
1) f(x) = 3x⁴ - 2x³ + 5x - 7<br/>
2) g(x) = x⁵ + 1/x<br/>
3) h(x) = 2√x - 3/x²
</div>
</div>' WHERE id = 'fdf662c4-813e-4db2-95b3-f270ed897d9f';

-- 13) عمليات على الدوال المشتقة (الإشتقاقية)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">عمليات على الدوال المشتقة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. قواعد الاشتقاق</h3>

<table style="width: 100%; border-collapse: collapse; margin: 15px 0; text-align: center;">
<tr style="background: #2c3e50; color: white;"><th style="padding: 10px; border: 1px solid #ddd;">الدالة</th><th style="padding: 10px; border: 1px solid #ddd;">المشتقة</th></tr>
<tr><td style="padding: 10px; border: 1px solid #ddd;">k·f</td><td style="padding: 10px; border: 1px solid #ddd;">k·f''</td></tr>
<tr style="background: #f8f9fa;"><td style="padding: 10px; border: 1px solid #ddd;">f + g</td><td style="padding: 10px; border: 1px solid #ddd;">f'' + g''</td></tr>
<tr><td style="padding: 10px; border: 1px solid #ddd;">f × g</td><td style="padding: 10px; border: 1px solid #ddd;">f''g + fg''</td></tr>
<tr style="background: #f8f9fa;"><td style="padding: 10px; border: 1px solid #ddd;">f/g</td><td style="padding: 10px; border: 1px solid #ddd;">(f''g - fg'')/g²</td></tr>
<tr><td style="padding: 10px; border: 1px solid #ddd;">1/g</td><td style="padding: 10px; border: 1px solid #ddd;">-g''/g²</td></tr>
</table>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. مشتقة جداء دالتين</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 القاعدة:</strong> (f × g)'' = f'' × g + f × g''
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = (2x + 1)(x² - 3)<br/>
u(x) = 2x + 1 ⟹ u''(x) = 2<br/>
v(x) = x² - 3 ⟹ v''(x) = 2x<br/>
f''(x) = 2(x² - 3) + (2x + 1)(2x) = 2x² - 6 + 4x² + 2x = 6x² + 2x - 6
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. مشتقة حاصل قسمة</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 القاعدة:</strong> (f/g)'' = (f''g - fg'') / g²
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = (x + 1)/(x² + 1)<br/>
u = x + 1, u'' = 1<br/>
v = x² + 1, v'' = 2x<br/>
f''(x) = [1·(x² + 1) - (x + 1)·2x] / (x² + 1)²<br/>
= (x² + 1 - 2x² - 2x) / (x² + 1)²<br/>
= (-x² - 2x + 1) / (x² + 1)²
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">4. مشتقة دالة مركبة</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 القاعدة:</strong><br/>
• [f(ax + b)]'' = a × f''(ax + b)<br/>
• [uⁿ]'' = n × u'' × uⁿ⁻¹<br/>
• [√u]'' = u'' / (2√u)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> اشتق الدوال التالية:<br/>
1) f(x) = (3x - 1)(x² + 2)<br/>
2) g(x) = (2x + 1)/(x - 3)<br/>
3) h(x) = √(x² + 1)<br/>
4) k(x) = (x² - 1)³
</div>
</div>' WHERE id = '84fa2b78-3a9e-4ea9-826c-695324bf6d58';

-- 14) اتجاه تغير دالة (تطبيقات الإشتقاقية)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">اتجاه تغير دالة باستعمال الاشتقاق</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. العلاقة بين إشارة المشتقة واتجاه التغير</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 مبرهنة أساسية:</strong> لتكن f دالة قابلة للاشتقاق على المجال I:<br/>
• إذا f''(x) &gt; 0 لكل x ∈ I ⟹ f متزايدة تماماً على I<br/>
• إذا f''(x) &lt; 0 لكل x ∈ I ⟹ f متناقصة تماماً على I<br/>
• إذا f''(x) = 0 لكل x ∈ I ⟹ f ثابتة على I
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. خطوات دراسة اتجاه التغير</h3>

<ol>
<li>حساب الدالة المشتقة f''(x)</li>
<li>حل f''(x) = 0 لإيجاد القيم الحرجة</li>
<li>دراسة إشارة f''(x) على كل مجال</li>
<li>إنشاء جدول التغيرات</li>
</ol>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> ادرس اتجاه تغير f(x) = x³ - 3x + 1<br/>
f''(x) = 3x² - 3 = 3(x² - 1) = 3(x - 1)(x + 1)<br/>
f''(x) = 0 ⟹ x = -1 أو x = 1<br/><br/>
جدول الإشارة:<br/>
• x &lt; -1: f''(x) &gt; 0 ⟹ f متزايدة<br/>
• -1 &lt; x &lt; 1: f''(x) &lt; 0 ⟹ f متناقصة<br/>
• x &gt; 1: f''(x) &gt; 0 ⟹ f متزايدة<br/><br/>
f(-1) = -1 + 3 + 1 = 3 (قيمة عظمى محلية)<br/>
f(1) = 1 - 3 + 1 = -1 (قيمة صغرى محلية)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. جدول التغيرات الكامل</h3>

<p>جدول التغيرات يتضمن:</p>
<ul>
<li>السطر الأول: قيم x الحرجة وحدود مجموعة التعريف</li>
<li>السطر الثاني: إشارة f''(x)</li>
<li>السطر الثالث: اتجاه تغير f مع الأسهم والقيم</li>
</ul>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> ادرس اتجاه تغير الدوال التالية وأنشئ جداول تغيراتها:<br/>
1) f(x) = -x³ + 3x² - 4<br/>
2) g(x) = x⁴ - 2x²<br/>
3) h(x) = x + 4/x على ]0, +∞[
</div>
</div>' WHERE id = 'aa0af8d5-36f4-4a7d-aed1-5da8a4e5c514';

-- 15) القيم الحدية المحلية (تطبيقات الإشتقاقية)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">القيم الحدية المحلية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريفات</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong><br/>
• f تملك <strong>قيمة عظمى محلية</strong> عند a إذا وُجد مجال مفتوح ]a-ε, a+ε[ حيث: f(x) ≤ f(a) لكل x في هذا المجال<br/>
• f تملك <strong>قيمة صغرى محلية</strong> عند a إذا وُجد مجال مفتوح ]a-ε, a+ε[ حيث: f(x) ≥ f(a) لكل x في هذا المجال<br/>
• تُسمى القيم العظمى والصغرى المحلية بـ <strong>القيم الحدية المحلية</strong> (extremums locaux)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. شرط ضروري</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 مبرهنة:</strong> إذا كانت f قابلة للاشتقاق على ]a-ε, a+ε[ ولها قيمة حدية محلية عند a فإن:<br/>
<strong>f''(a) = 0</strong>
</div>

<div style="background: #fdedec; padding: 15px; border-right: 4px solid #e74c3c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e74c3c;">⚠️ العكس غير صحيح:</strong> f''(a) = 0 لا يعني بالضرورة أن f لها قيمة حدية عند a.<br/>
مثال: f(x) = x³ حيث f''(0) = 0 لكن 0 ليست قيمة حدية (نقطة انعطاف).
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. شرط كافٍ (تغير إشارة المشتقة)</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 مبرهنة:</strong> إذا كانت f''(a) = 0 و:<br/>
• f'' تتغير من + إلى - عند a ⟹ f لها <strong>قيمة عظمى محلية</strong> عند a<br/>
• f'' تتغير من - إلى + عند a ⟹ f لها <strong>قيمة صغرى محلية</strong> عند a
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> أوجد القيم الحدية المحلية لـ f(x) = 2x³ - 9x² + 12x - 3<br/>
f''(x) = 6x² - 18x + 12 = 6(x² - 3x + 2) = 6(x-1)(x-2)<br/>
f''(x) = 0 ⟹ x = 1 أو x = 2<br/><br/>
• عند x = 1: f'' تتغير من + إلى - ⟹ قيمة عظمى محلية: f(1) = 2<br/>
• عند x = 2: f'' تتغير من - إلى + ⟹ قيمة صغرى محلية: f(2) = 1
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) أوجد القيم الحدية المحلية لـ f(x) = x⁴ - 4x³ + 6x² - 4x<br/>
2) حدد القيمة العظمى والصغرى لـ g(x) = x³ - 12x على [-3, 3]<br/>
3) أثبت أن h(x) = x + 1/x ≥ 2 لكل x &gt; 0
</div>
</div>' WHERE id = 'fe7699dc-2f93-4254-a595-98bca40334db';
