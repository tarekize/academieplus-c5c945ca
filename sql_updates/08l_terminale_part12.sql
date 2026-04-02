-- Terminale Batch 12: Lessons 166-180
-- Topics: Éq. diff., Intégrales, Dénombrement, Combinaisons, Probabilités, Bernoulli, Lois continues

-- Lesson 166: Équations différentielles
UPDATE lessons SET content = '<div style="font-family: Tajawal, Arial, sans-serif; line-height: 1.8; padding: 20px; direction: rtl;">

<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">📐 المعادلات التفاضلية (تعمّق)</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #2980b9; margin-top: 0;">📘 تعريف</h3>
<p>المعادلة التفاضلية هي معادلة تربط بين دالة مجهولة y ومشتقتها y'' (وربما مشتقات أعلى).</p>
<p>نسمي <strong>حلاً</strong> للمعادلة التفاضلية كل دالة تحقق هذه المعادلة.</p>
</div>

<div style="background: #d5a6e6; border-right: 4px solid #8e44ad; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #8e44ad; margin-top: 0;">📐 المعادلة التفاضلية y'' = ay</h3>
<p>حيث a ∈ ℝ* ثابت. الحل العام هو:</p>
<p style="text-align: center; font-size: 1.2em;"><strong>y(x) = C·eᵃˣ</strong> حيث C ∈ ℝ</p>
<p><strong>مع شرط ابتدائي y(x₀) = y₀:</strong></p>
<p style="text-align: center;">C·eᵃˣ⁰ = y₀ ⟹ C = y₀·e⁻ᵃˣ⁰</p>
<p style="text-align: center; color: #8e44ad;"><strong>الحل الوحيد: y(x) = y₀·eᵃ⁽ˣ⁻ˣ⁰⁾</strong></p>
</div>

<div style="background: #d5a6e6; border-right: 4px solid #8e44ad; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #8e44ad; margin-top: 0;">📐 المعادلة التفاضلية y'' = ay + b</h3>
<p>حيث a ≠ 0 و b ثابتان. الحل العام:</p>
<p style="text-align: center; font-size: 1.2em;"><strong>y(x) = C·eᵃˣ - b/a</strong> حيث C ∈ ℝ</p>
<p><strong>ملاحظة:</strong> y₀ = -b/a هو الحل الثابت (الخاص) للمعادلة.</p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 1</h3>
<p>حل المعادلة التفاضلية: y'' = 3y مع y(0) = 2</p>
<p>الحل العام: y(x) = C·e³ˣ</p>
<p>y(0) = C = 2</p>
<p style="color: #e67e22;"><strong>الحل: y(x) = 2e³ˣ</strong></p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 2</h3>
<p>حل: y'' = -2y + 6 مع y(0) = 1</p>
<p>الحل العام: y(x) = C·e⁻²ˣ + 3 (لأن -b/a = -6/(-2) = 3)</p>
<p>y(0) = C + 3 = 1 ⟹ C = -2</p>
<p style="color: #e67e22;"><strong>الحل: y(x) = -2e⁻²ˣ + 3</strong></p>
<p>lim(x→+∞) y(x) = 3 (الدالة تقترب من الحل الثابت)</p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال تطبيقي: التبريد</h3>
<p>درجة حرارة جسم تتبع: T''(t) = -0.1(T(t) - 20)، أي T'' = -0.1T + 2</p>
<p>T(t) = C·e⁻⁰·¹ᵗ + 20</p>
<p>إذا T(0) = 80°: C = 60 ⟹ T(t) = 60·e⁻⁰·¹ᵗ + 20</p>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #1abc9c; margin-top: 0;">✏️ تمارين تطبيقية</h3>
<p><strong>التمرين 1:</strong> حل المعادلات التفاضلية:</p>
<ol>
<li>y'' = -4y مع y(0) = 3</li>
<li>y'' = 2y - 10 مع y(0) = 8</li>
<li>y'' + y/3 = 2 مع y(0) = 0</li>
</ol>
<p><strong>التمرين 2:</strong> عدد البكتيريا يتضاعف كل ساعة. اكتب المعادلة التفاضلية واحسب العدد بعد 5 ساعات إذا كان العدد الابتدائي 1000</p>
</div>

</div>' WHERE id = 'a8370c4a-2609-4379-b699-0d86f688f4ba';

-- Lesson 167: Intégrale d''une fonction
UPDATE lessons SET content = '<div style="font-family: Tajawal, Arial, sans-serif; line-height: 1.8; padding: 20px; direction: rtl;">

<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">∫ التكامل (تعمّق)</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #2980b9; margin-top: 0;">📘 تعريف التكامل</h3>
<p>إذا كانت f دالة مستمرة على المجال [a, b] و F دالة أصلية لـ f على [a, b]، فإن:</p>
<p style="text-align: center; font-size: 1.3em; color: #2980b9;"><strong>∫ₐᵇ f(x)dx = F(b) - F(a) = [F(x)]ₐᵇ</strong></p>
<p>هذه النتيجة تعرف بـ <strong>المبرهنة الأساسية للتحليل</strong>.</p>
</div>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #2980b9; margin-top: 0;">📘 التفسير الهندسي</h3>
<p>إذا كانت f ≥ 0 على [a, b]، فإن ∫ₐᵇ f(x)dx يمثل <strong>مساحة المنطقة</strong> المحصورة بين منحنى f ومحور Ox والمستقيمين x = a و x = b.</p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 1: حساب تكامل</h3>
<p>∫₀² (3x² + 2x)dx = [x³ + x²]₀²</p>
<p>= (8 + 4) - (0 + 0) = <strong>12</strong></p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 2: تكامل أسي</h3>
<p>∫₀¹ eˣdx = [eˣ]₀¹ = e¹ - e⁰ = <strong>e - 1 ≈ 1.718</strong></p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 3: تكامل مثلثي</h3>
<p>∫₀^(π/2) cos(x)dx = [sin(x)]₀^(π/2) = sin(π/2) - sin(0) = <strong>1</strong></p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 4: تكامل لوغاريتمي</h3>
<p>∫₁ᵉ (1/x)dx = [ln(x)]₁ᵉ = ln(e) - ln(1) = 1 - 0 = <strong>1</strong></p>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #1abc9c; margin-top: 0;">✏️ تمارين تطبيقية</h3>
<p><strong>التمرين 1:</strong> احسب التكاملات:</p>
<ol>
<li>∫₁³ (2x - 1)dx</li>
<li>∫₀¹ (eˣ + x²)dx</li>
<li>∫₀^π sin(x)dx</li>
<li>∫₁⁴ (1/√x)dx</li>
</ol>
<p><strong>التمرين 2:</strong> احسب مساحة المنطقة المحصورة بين منحنى f(x) = x² ومحور Ox بين x = 0 و x = 3</p>
</div>

</div>' WHERE id = '7d628019-891c-4a68-8ed1-721b076435ee';

-- Lesson 168: Propriétés de l''intégrale
UPDATE lessons SET content = '<div style="font-family: Tajawal, Arial, sans-serif; line-height: 1.8; padding: 20px; direction: rtl;">

<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">∫ خصائص التكامل (تعمّق)</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #2980b9; margin-top: 0;">📘 الخصائص الأساسية</h3>
<ul>
<li><strong>الخطية:</strong> ∫ₐᵇ [αf(x) + βg(x)]dx = α∫ₐᵇ f(x)dx + β∫ₐᵇ g(x)dx</li>
<li><strong>علاقة شال:</strong> ∫ₐᵇ f(x)dx + ∫ᵇᶜ f(x)dx = ∫ₐᶜ f(x)dx</li>
<li><strong>عكس الحدود:</strong> ∫ₐᵇ f(x)dx = -∫ᵇₐ f(x)dx</li>
<li><strong>التكامل الصفري:</strong> ∫ₐᵃ f(x)dx = 0</li>
</ul>
</div>

<div style="background: #d5a6e6; border-right: 4px solid #8e44ad; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #8e44ad; margin-top: 0;">📐 خصائص الترتيب</h3>
<ul>
<li>إذا f ≥ 0 على [a, b] فإن ∫ₐᵇ f(x)dx ≥ 0</li>
<li>إذا f ≤ g على [a, b] فإن ∫ₐᵇ f(x)dx ≤ ∫ₐᵇ g(x)dx</li>
<li>|∫ₐᵇ f(x)dx| ≤ ∫ₐᵇ |f(x)|dx</li>
<li>إذا m ≤ f(x) ≤ M على [a, b] فإن: m(b-a) ≤ ∫ₐᵇ f(x)dx ≤ M(b-a)</li>
</ul>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 1: استخدام علاقة شال</h3>
<p>إذا علمت أن ∫₀³ f(x)dx = 7 و ∫₀¹ f(x)dx = 2</p>
<p>فإن ∫₁³ f(x)dx = ∫₀³ f(x)dx - ∫₀¹ f(x)dx = 7 - 2 = <strong>5</strong></p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 2: استخدام خاصية الترتيب</h3>
<p>أثبت أن 1 ≤ ∫₀¹ (x + 1)dx ≤ 2</p>
<p>على [0, 1]: 0 ≤ x ≤ 1 ⟹ 1 ≤ x + 1 ≤ 2</p>
<p>بالتكامل: 1×(1-0) ≤ ∫₀¹ (x+1)dx ≤ 2×(1-0)</p>
<p>(نتحقق: ∫₀¹ (x+1)dx = [x²/2 + x]₀¹ = 3/2 ∈ [1, 2] ✓)</p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 3: الخطية</h3>
<p>∫₀¹ (3eˣ - 2x + 5)dx = 3∫₀¹ eˣdx - 2∫₀¹ xdx + 5∫₀¹ dx</p>
<p>= 3(e-1) - 2(1/2) + 5(1) = 3e - 3 - 1 + 5 = <strong>3e + 1</strong></p>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #1abc9c; margin-top: 0;">✏️ تمارين تطبيقية</h3>
<p><strong>التمرين 1:</strong> إذا ∫₀⁵ f(x)dx = 10 و ∫₂⁵ f(x)dx = 4، احسب ∫₀² f(x)dx</p>
<p><strong>التمرين 2:</strong> أثبت أن 2 ≤ ∫₁² (x + 1/x)dx ≤ 5/2</p>
<p><strong>التمرين 3:</strong> احسب ∫₋₁¹ (x³ + x² + 1)dx باستخدام الزوجية والفردية</p>
</div>

</div>' WHERE id = 'e877e15c-ab90-4199-b9f0-bafe343822c1';

-- Lesson 169: Valeur moyenne
UPDATE lessons SET content = '<div style="font-family: Tajawal, Arial, sans-serif; line-height: 1.8; padding: 20px; direction: rtl;">

<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">📊 القيمة المتوسطة لدالة (تعمّق)</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #2980b9; margin-top: 0;">📘 تعريف</h3>
<p>القيمة المتوسطة للدالة المستمرة f على المجال [a, b] هي:</p>
<p style="text-align: center; font-size: 1.3em; color: #2980b9;"><strong>μ = (1/(b-a)) × ∫ₐᵇ f(x)dx</strong></p>
<p><strong>التفسير الهندسي:</strong> μ هو ارتفاع المستطيل الذي قاعدته [a, b] ومساحته تساوي مساحة المنطقة تحت المنحنى.</p>
</div>

<div style="background: #d5a6e6; border-right: 4px solid #8e44ad; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #8e44ad; margin-top: 0;">📐 مبرهنة القيمة المتوسطة</h3>
<p>إذا كانت f مستمرة على [a, b]، فيوجد c ∈ [a, b] على الأقل بحيث:</p>
<p style="text-align: center; font-size: 1.2em;"><strong>f(c) = μ = (1/(b-a)) × ∫ₐᵇ f(x)dx</strong></p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 1</h3>
<p>أوجد القيمة المتوسطة لـ f(x) = x² على [0, 3]</p>
<p>μ = (1/3) × ∫₀³ x²dx = (1/3) × [x³/3]₀³ = (1/3) × 9 = <strong>3</strong></p>
<p>التحقق: f(c) = 3 ⟹ c² = 3 ⟹ c = √3 ∈ [0, 3] ✓</p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 2</h3>
<p>أوجد القيمة المتوسطة لـ g(x) = eˣ على [0, 1]</p>
<p>μ = (1/1) × ∫₀¹ eˣdx = [eˣ]₀¹ = e - 1 ≈ <strong>1.718</strong></p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال تطبيقي: متوسط درجة الحرارة</h3>
<p>درجة الحرارة خلال اليوم تتبع: T(t) = 20 + 8sin(πt/12) حيث t ∈ [0, 24] (بالساعات)</p>
<p>متوسط درجة الحرارة:</p>
<p>μ = (1/24) × ∫₀²⁴ [20 + 8sin(πt/12)]dt</p>
<p>= (1/24) × [20t - 8×(12/π)cos(πt/12)]₀²⁴</p>
<p>= (1/24) × [480 - (96/π)(cos(2π) - cos(0))] = (1/24) × 480 = <strong>20°C</strong></p>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #1abc9c; margin-top: 0;">✏️ تمارين تطبيقية</h3>
<p><strong>التمرين 1:</strong> أوجد القيمة المتوسطة لـ f(x) = sin(x) على [0, π]</p>
<p><strong>التمرين 2:</strong> أوجد القيمة المتوسطة لـ g(x) = 1/(1+x) على [0, 1]</p>
<p><strong>التمرين 3:</strong> سرعة متحرك v(t) = 3t² - 12t + 12. أوجد السرعة المتوسطة بين t = 0 و t = 4</p>
</div>

</div>' WHERE id = '1eee0c03-ef75-4a00-b594-c1b005df1e14';

-- Lesson 170: Extension aux fonctions de signe quelconque
UPDATE lessons SET content = '<div style="font-family: Tajawal, Arial, sans-serif; line-height: 1.8; padding: 20px; direction: rtl;">

<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">∫ امتداد للدوال ذات إشارة كيفية (تعمّق)</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #2980b9; margin-top: 0;">📘 المبدأ</h3>
<p>عندما تأخذ الدالة f قيماً موجبة وسالبة على [a, b]، فإن التكامل ∫ₐᵇ f(x)dx يمثل <strong>المساحة الجبرية</strong> (مع الإشارة):</p>
<ul>
<li>المناطق فوق محور Ox تُحسب بإشارة <strong>موجبة</strong></li>
<li>المناطق تحت محور Ox تُحسب بإشارة <strong>سالبة</strong></li>
</ul>
</div>

<div style="background: #d5a6e6; border-right: 4px solid #8e44ad; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #8e44ad; margin-top: 0;">📐 حساب المساحة الحقيقية</h3>
<p>المساحة الحقيقية (بدون إشارة) للمنطقة بين المنحنى ومحور Ox:</p>
<p style="text-align: center; font-size: 1.2em; color: #8e44ad;"><strong>S = ∫ₐᵇ |f(x)|dx</strong></p>
<p>عملياً: نبحث عن أصفار f في ]a, b[ ثم نجزئ التكامل:</p>
<p>إذا f تنعدم في c حيث a < c < b، وf ≥ 0 على [a,c] وf ≤ 0 على [c,b]:</p>
<p style="text-align: center;"><strong>S = ∫ₐᶜ f(x)dx - ∫ᶜᵇ f(x)dx</strong></p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال: مساحة منطقة f(x) = x² - 1 على [-2, 2]</h3>
<p>أصفار f: x² - 1 = 0 ⟹ x = ±1</p>
<p>f ≥ 0 على [-2, -1] و [1, 2] ، f ≤ 0 على [-1, 1]</p>
<p>S = ∫₋₂⁻¹ (x²-1)dx - ∫₋₁¹ (x²-1)dx + ∫₁² (x²-1)dx</p>
<p>= [x³/3 - x]₋₂⁻¹ - [x³/3 - x]₋₁¹ + [x³/3 - x]₁²</p>
<p>= (-1/3+1-(-8/3+2)) - (1/3-1-(-1/3+1)) + (8/3-2-(1/3-1))</p>
<p>= (2/3+2/3) - (-4/3) + (4/3+2/3)</p>
<p>= 4/3 + 4/3 + 4/3 = <strong>4</strong></p>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #1abc9c; margin-top: 0;">✏️ تمارين تطبيقية</h3>
<p><strong>التمرين 1:</strong> احسب المساحة المحصورة بين منحنى f(x) = sin(x) ومحور Ox على [0, 2π]</p>
<p><strong>التمرين 2:</strong> احسب المساحة المحصورة بين منحنى g(x) = x³ - 4x ومحور Ox على [-2, 3]</p>
<p><strong>التمرين 3:</strong> احسب ∫₀²π sin(x)dx وقارنه بالمساحة الحقيقية. ماذا تلاحظ؟</p>
</div>

</div>' WHERE id = 'f56ec762-3687-4134-aba7-8604ef9a5c86';

-- Lesson 171: Utilisation du calcul intégral
UPDATE lessons SET content = '<div style="font-family: Tajawal, Arial, sans-serif; line-height: 1.8; padding: 20px; direction: rtl;">

<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">∫ استخدامات الحساب التكاملي (تعمّق)</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #2980b9; margin-top: 0;">📘 المساحة بين منحنيين</h3>
<p>المساحة بين منحنيي الدالتين f و g على [a, b]:</p>
<p style="text-align: center; font-size: 1.2em; color: #2980b9;"><strong>S = ∫ₐᵇ |f(x) - g(x)|dx</strong></p>
<p>إذا كانت f(x) ≥ g(x) على [a, b]: S = ∫ₐᵇ [f(x) - g(x)]dx</p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 1: مساحة بين منحنيين</h3>
<p>أوجد المساحة بين منحنيي f(x) = x² و g(x) = x</p>
<p>نقاط التقاطع: x² = x ⟹ x(x-1) = 0 ⟹ x = 0 أو x = 1</p>
<p>على [0, 1]: x ≥ x² (أي g ≥ f)</p>
<p>S = ∫₀¹ (x - x²)dx = [x²/2 - x³/3]₀¹ = 1/2 - 1/3 = <strong>1/6</strong></p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 2: حجم المجسم الدوراني</h3>
<p>حجم المجسم الناتج عن دوران المنطقة تحت f حول محور Ox:</p>
<p style="text-align: center; font-size: 1.2em;">V = π∫ₐᵇ [f(x)]²dx</p>
<p>حجم المخروط: f(x) = (r/h)x على [0, h]</p>
<p>V = π∫₀ʰ (r²x²/h²)dx = π(r²/h²)[x³/3]₀ʰ = <strong>(1/3)πr²h</strong></p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 3: المسافة من السرعة</h3>
<p>سرعة متحرك v(t) = 2t + 3 (م/ث). المسافة المقطوعة بين t = 0 و t = 5:</p>
<p>d = ∫₀⁵ v(t)dt = ∫₀⁵ (2t+3)dt = [t² + 3t]₀⁵ = 25 + 15 = <strong>40 م</strong></p>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #1abc9c; margin-top: 0;">✏️ تمارين تطبيقية</h3>
<p><strong>التمرين 1:</strong> أوجد المساحة بين منحنيي f(x) = x² و g(x) = √x على [0, 1]</p>
<p><strong>التمرين 2:</strong> أوجد حجم الكرة بطريقة التكامل (تدوير f(x) = √(R²-x²) حول Ox)</p>
<p><strong>التمرين 3:</strong> متحرك سرعته v(t) = sin(πt/2). أوجد المسافة المقطوعة من t = 0 إلى t = 4</p>
</div>

</div>' WHERE id = '94a2e1c8-f345-403f-b140-17dd2056dc71';

-- Lesson 172: Applications du calcul intégral
UPDATE lessons SET content = '<div style="font-family: Tajawal, Arial, sans-serif; line-height: 1.8; padding: 20px; direction: rtl;">

<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">∫ تطبيقات الحساب التكاملي (تعمّق)</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #2980b9; margin-top: 0;">📘 التكامل بالتجزئة</h3>
<p>إذا كانت u و v دالتان قابلتان للاشتقاق على [a, b]:</p>
<p style="text-align: center; font-size: 1.2em; color: #2980b9;"><strong>∫ₐᵇ u''(x)·v(x)dx = [u(x)·v(x)]ₐᵇ - ∫ₐᵇ u(x)·v''(x)dx</strong></p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 1: تكامل بالتجزئة</h3>
<p>احسب ∫₀¹ xeˣdx</p>
<p>u''(x) = eˣ ⟹ u(x) = eˣ ، v(x) = x ⟹ v''(x) = 1</p>
<p>= [xeˣ]₀¹ - ∫₀¹ eˣdx = e - [eˣ]₀¹ = e - (e - 1) = <strong>1</strong></p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 2: تكامل بالتجزئة</h3>
<p>احسب ∫₁ᵉ ln(x)dx</p>
<p>u''(x) = 1 ⟹ u(x) = x ، v(x) = ln(x) ⟹ v''(x) = 1/x</p>
<p>= [x·ln(x)]₁ᵉ - ∫₁ᵉ x·(1/x)dx = (e·1 - 0) - ∫₁ᵉ dx = e - (e-1) = <strong>1</strong></p>
</div>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #2980b9; margin-top: 0;">📘 حساب نهايات بالتكامل</h3>
<p>يمكن استخدام التكامل لحساب نهايات بعض المتتاليات. مثلاً:</p>
<p>إذا كان Sₙ = Σ(k=1 to n) f(k/n)/n فإن:</p>
<p style="text-align: center;">lim(n→∞) Sₙ = ∫₀¹ f(x)dx (مجموع ريمان)</p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 3: نهاية متتالية</h3>
<p>احسب lim(n→∞) Σ(k=1 to n) k²/n³</p>
<p>= lim(n→∞) (1/n) × Σ(k=1 to n) (k/n)²</p>
<p>هذا مجموع ريمان للدالة f(x) = x² على [0, 1]</p>
<p>= ∫₀¹ x²dx = [x³/3]₀¹ = <strong>1/3</strong></p>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #1abc9c; margin-top: 0;">✏️ تمارين تطبيقية</h3>
<p><strong>التمرين 1:</strong> احسب بالتجزئة: ∫₀¹ x²eˣdx</p>
<p><strong>التمرين 2:</strong> احسب ∫₁ᵉ x·ln(x)dx</p>
<p><strong>التمرين 3:</strong> احسب lim(n→∞) (1/n)·Σ(k=1 to n) √(k/n)</p>
</div>

</div>' WHERE id = 'f0e92e20-05d9-4a86-accd-2c12bb983713';

-- Lesson 173: Dénombrement
UPDATE lessons SET content = '<div style="font-family: Tajawal, Arial, sans-serif; line-height: 1.8; padding: 20px; direction: rtl;">

<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">🔢 التعداد (تعمّق)</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #2980b9; margin-top: 0;">📘 المبادئ الأساسية</h3>
<p><strong>مبدأ الجمع:</strong> إذا كان A و B حدثين متنافيين: |A ∪ B| = |A| + |B|</p>
<p><strong>مبدأ الضرب:</strong> إذا كانت التجربة تتكون من مرحلتين متتاليتين بـ p و q اختيار: العدد الكلي = p × q</p>
<p><strong>المتممة:</strong> |Ā| = |Ω| - |A|</p>
</div>

<div style="background: #d5a6e6; border-right: 4px solid #8e44ad; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #8e44ad; margin-top: 0;">📐 الترتيبات والتباديل</h3>
<table style="width: 100%; border-collapse: collapse;">
<tr style="background: #2c3e50; color: white;"><th style="padding: 10px; border: 1px solid #ddd;">النوع</th><th style="padding: 10px; border: 1px solid #ddd;">الصيغة</th><th style="padding: 10px; border: 1px solid #ddd;">الوصف</th></tr>
<tr><td style="padding: 10px; border: 1px solid #ddd;">n!</td><td style="padding: 10px; border: 1px solid #ddd;">n × (n-1) × ... × 1</td><td style="padding: 10px; border: 1px solid #ddd;">عاملي n</td></tr>
<tr style="background: #f9f9f9;"><td style="padding: 10px; border: 1px solid #ddd;">Aₙᵖ</td><td style="padding: 10px; border: 1px solid #ddd;">n!/(n-p)!</td><td style="padding: 10px; border: 1px solid #ddd;">ترتيبات p من n (بترتيب)</td></tr>
<tr><td style="padding: 10px; border: 1px solid #ddd;">Pₙ</td><td style="padding: 10px; border: 1px solid #ddd;">n!</td><td style="padding: 10px; border: 1px solid #ddd;">تباديل n عنصر</td></tr>
</table>
<p><strong>ملاحظة:</strong> 0! = 1 بالاتفاق</p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 1: الترتيبات</h3>
<p>كم عدد أرقام القفل السري المكون من 4 أرقام مختلفة من {0,...,9}؟</p>
<p>A₁₀⁴ = 10!/(10-4)! = 10 × 9 × 8 × 7 = <strong>5040</strong></p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 2: التباديل</h3>
<p>كم طريقة لترتيب 6 أشخاص في صف؟</p>
<p>P₆ = 6! = 720 <strong>طريقة</strong></p>
<p>كم طريقة لترتيبهم حول طاولة مستديرة؟</p>
<p>(6-1)! = 5! = <strong>120 طريقة</strong></p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 3: السحب مع/بدون إرجاع</h3>
<p>صندوق فيه 10 كرات مرقمة. نسحب 3 كرات:</p>
<p><strong>مع إرجاع + ترتيب:</strong> 10³ = 1000</p>
<p><strong>بدون إرجاع + ترتيب:</strong> A₁₀³ = 10 × 9 × 8 = 720</p>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #1abc9c; margin-top: 0;">✏️ تمارين تطبيقية</h3>
<p><strong>التمرين 1:</strong> كم كلمة من 5 حروف مختلفة يمكن تكوينها من الأبجدية (26 حرف)؟</p>
<p><strong>التمرين 2:</strong> بطولة كرة قدم فيها 8 فرق. كم طريقة لترتيب الفرق الثلاثة الأولى؟</p>
<p><strong>التمرين 3:</strong> كم عدد صحيح من 4 أرقام (دون تكرار) يمكن تكوينه من {1,2,3,4,5,6}؟</p>
</div>

</div>' WHERE id = '542f74ba-69c9-4e6b-bf97-60e4bde4bde5';

-- Lesson 174: Combinaisons - Formule du binôme
UPDATE lessons SET content = '<div style="font-family: Tajawal, Arial, sans-serif; line-height: 1.8; padding: 20px; direction: rtl;">

<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">🔢 التوافيق وصيغة ذي الحدين (تعمّق)</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #2980b9; margin-top: 0;">📘 التوافيق</h3>
<p>عدد الطرق لاختيار p عنصر من n عنصر <strong>بدون ترتيب</strong>:</p>
<p style="text-align: center; font-size: 1.3em; color: #2980b9;"><strong>C(n,p) = (ⁿₚ) = n! / (p!(n-p)!)</strong></p>
<p><strong>خصائص:</strong></p>
<ul>
<li>C(n,0) = C(n,n) = 1</li>
<li>C(n,1) = C(n,n-1) = n</li>
<li><strong>C(n,p) = C(n,n-p)</strong> (التناظر)</li>
<li><strong>C(n,p) = C(n-1,p-1) + C(n-1,p)</strong> (علاقة باسكال)</li>
</ul>
</div>

<div style="background: #d5a6e6; border-right: 4px solid #8e44ad; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #8e44ad; margin-top: 0;">📐 صيغة ذي الحدين (نيوتن)</h3>
<p style="text-align: center; font-size: 1.2em; color: #8e44ad;"><strong>(a + b)ⁿ = Σ(k=0 to n) C(n,k)·aⁿ⁻ᵏ·bᵏ</strong></p>
<p><strong>حالات خاصة:</strong></p>
<ul>
<li>(a+b)² = a² + 2ab + b²</li>
<li>(a+b)³ = a³ + 3a²b + 3ab² + b³</li>
<li>(1+x)ⁿ = Σ(k=0 to n) C(n,k)·xᵏ</li>
</ul>
<p><strong>نتيجة:</strong> Σ(k=0 to n) C(n,k) = 2ⁿ (بوضع a = b = 1)</p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 1: حساب التوافيق</h3>
<p>C(10,3) = 10!/(3!×7!) = (10×9×8)/(3×2×1) = <strong>120</strong></p>
<p>C(8,5) = C(8,3) = (8×7×6)/(3×2×1) = <strong>56</strong></p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 2: صيغة ذي الحدين</h3>
<p>انشر (2x + 3)⁴:</p>
<p>= C(4,0)(2x)⁴ + C(4,1)(2x)³(3) + C(4,2)(2x)²(3²) + C(4,3)(2x)(3³) + C(4,4)(3⁴)</p>
<p>= 16x⁴ + 4·8x³·3 + 6·4x²·9 + 4·2x·27 + 81</p>
<p>= <strong>16x⁴ + 96x³ + 216x² + 216x + 81</strong></p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 3: مثلث باسكال</h3>
<pre style="text-align: center; font-family: monospace;">
n=0:          1
n=1:        1   1
n=2:      1   2   1
n=3:    1   3   3   1
n=4:  1   4   6   4   1
n=5: 1  5  10  10  5   1
</pre>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #1abc9c; margin-top: 0;">✏️ تمارين تطبيقية</h3>
<p><strong>التمرين 1:</strong> احسب C(12,4) و C(15,13)</p>
<p><strong>التمرين 2:</strong> انشر (x - 2)⁵ باستعمال صيغة ذي الحدين</p>
<p><strong>التمرين 3:</strong> لجنة من 5 أعضاء من 8 رجال و 6 نساء. كم لجنة تحتوي على 3 رجال ونساءين بالضبط؟</p>
</div>

</div>' WHERE id = 'f4a64657-65a8-4e7e-94d7-6c2c02043c60';

-- Lesson 175: Modélisation d''une expérience aléatoire
UPDATE lessons SET content = '<div style="font-family: Tajawal, Arial, sans-serif; line-height: 1.8; padding: 20px; direction: rtl;">

<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">🎲 نمذجة تجربة عشوائية (تعمّق)</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #2980b9; margin-top: 0;">📘 المفاهيم الأساسية</h3>
<ul>
<li><strong>التجربة العشوائية:</strong> تجربة لا يمكن التنبؤ بنتيجتها مسبقاً</li>
<li><strong>الفضاء العيني Ω:</strong> مجموعة كل النتائج الممكنة</li>
<li><strong>الحدث:</strong> جزء من Ω</li>
<li><strong>قانون الاحتمال:</strong> دالة P تعطي لكل حدث احتمالاً بين 0 و 1</li>
</ul>
</div>

<div style="background: #d5a6e6; border-right: 4px solid #8e44ad; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #8e44ad; margin-top: 0;">📐 بديهيات الاحتمال</h3>
<ol>
<li>∀A ⊆ Ω: <strong>0 ≤ P(A) ≤ 1</strong></li>
<li><strong>P(Ω) = 1</strong> و P(∅) = 0</li>
<li>إذا A ∩ B = ∅: <strong>P(A ∪ B) = P(A) + P(B)</strong></li>
<li><strong>P(Ā) = 1 - P(A)</strong></li>
<li><strong>P(A ∪ B) = P(A) + P(B) - P(A ∩ B)</strong></li>
</ol>
</div>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #2980b9; margin-top: 0;">📘 المتغير العشوائي</h3>
<p>المتغير العشوائي X هو دالة من Ω إلى ℝ. يتميز بـ:</p>
<ul>
<li><strong>قانون الاحتمال:</strong> جدول يعطي P(X = xᵢ) لكل قيمة</li>
<li><strong>الأمل الرياضي:</strong> E(X) = Σ xᵢ·P(X = xᵢ)</li>
<li><strong>التباين:</strong> V(X) = E(X²) - [E(X)]²</li>
<li><strong>الانحراف المعياري:</strong> σ(X) = √V(X)</li>
</ul>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال: رمي حجري نرد</h3>
<p>X = مجموع الوجهين. Ω = {(i,j): 1 ≤ i,j ≤ 6}، |Ω| = 36</p>
<p>P(X=2) = 1/36 ، P(X=7) = 6/36 = 1/6 ، P(X=12) = 1/36</p>
<p>E(X) = 2×(1/36) + 3×(2/36) + ... + 12×(1/36) = <strong>7</strong></p>
<p>V(X) = E(X²) - 49 = 329/6 - 49 = <strong>35/6 ≈ 5.83</strong></p>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #1abc9c; margin-top: 0;">✏️ تمارين تطبيقية</h3>
<p><strong>التمرين 1:</strong> صندوق فيه 5 كرات حمراء و3 بيضاء. نسحب كرتين. أوجد P(كرتان حمراء)</p>
<p><strong>التمرين 2:</strong> X متغير عشوائي قيمه 0, 1, 2 مع P(X=0) = 0.3 و P(X=1) = 0.5. أوجد E(X) و V(X)</p>
<p><strong>التمرين 3:</strong> لعبة: تربح 10 دج إذا ظهر 6 وتخسر 2 دج في الحالات الأخرى. هل اللعبة مربحة؟</p>
</div>

</div>' WHERE id = 'f3303bfc-6113-4c5a-9e85-9461fabbcc7b';

-- Lesson 176: Probabilités conditionnelles
UPDATE lessons SET content = '<div style="font-family: Tajawal, Arial, sans-serif; line-height: 1.8; padding: 20px; direction: rtl;">

<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">🎯 الاحتمالات الشرطية (تعمّق)</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #2980b9; margin-top: 0;">📘 تعريف</h3>
<p>إذا كان P(B) ≠ 0، فإن احتمال الحدث A بشرط تحقق B هو:</p>
<p style="text-align: center; font-size: 1.3em; color: #2980b9;"><strong>P_B(A) = P(A ∩ B) / P(B)</strong></p>
<p>ويكتب أيضاً P(A|B)</p>
</div>

<div style="background: #d5a6e6; border-right: 4px solid #8e44ad; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #8e44ad; margin-top: 0;">📐 صيغة الاحتمالات الكلية</h3>
<p>إذا كانت B₁, B₂, ..., Bₙ تشكل نظاماً كاملاً للأحداث (تجزئة لـ Ω):</p>
<p style="text-align: center; font-size: 1.1em;"><strong>P(A) = Σ(i=1 to n) P(Bᵢ) × P_{Bᵢ}(A)</strong></p>
</div>

<div style="background: #d5a6e6; border-right: 4px solid #8e44ad; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #8e44ad; margin-top: 0;">📐 صيغة بايز</h3>
<p style="text-align: center; font-size: 1.1em;"><strong>P_A(Bₖ) = P(Bₖ) × P_{Bₖ}(A) / P(A)</strong></p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال: اختبار طبي</h3>
<p>مرض يصيب 1% من السكان. اختبار طبي:</p>
<ul>
<li>إذا كان الشخص مريضاً: الاختبار إيجابي بنسبة 99%</li>
<li>إذا كان الشخص سليماً: الاختبار إيجابي بنسبة 2% (إيجابي كاذب)</li>
</ul>
<p>M: مريض ، T: اختبار إيجابي</p>
<p>P(M) = 0.01 ، P_M(T) = 0.99 ، P_{M̄}(T) = 0.02</p>
<p><strong>P(T)</strong> = P(M)·P_M(T) + P(M̄)·P_{M̄}(T) = 0.01×0.99 + 0.99×0.02 = 0.0297</p>
<p><strong>P_T(M)</strong> = P(M)·P_M(T)/P(T) = 0.0099/0.0297 ≈ <strong>0.333 = 33.3%</strong></p>
<p style="color: #e74c3c;">⚠️ حتى مع اختبار موثوق 99%، احتمال أن يكون فعلاً مريضاً هو فقط 33% !</p>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #1abc9c; margin-top: 0;">✏️ تمارين تطبيقية</h3>
<p><strong>التمرين 1:</strong> صندوقان: الأول فيه 3 حمراء و7 بيضاء، والثاني 6 حمراء و4 بيضاء. نختار صندوقاً عشوائياً ونسحب كرة. P(حمراء) = ؟ وإذا كانت حمراء، P(من الصندوق الأول) = ؟</p>
<p><strong>التمرين 2:</strong> مصنعان ينتجان 60% و 40% من الإنتاج. نسبة العيوب 3% و 5%. ما احتمال أن تكون قطعة عشوائية معيبة؟</p>
</div>

</div>' WHERE id = 'e7833552-7775-4245-a191-93a649a50e6a';

-- Lesson 177: Événements indépendants
UPDATE lessons SET content = '<div style="font-family: Tajawal, Arial, sans-serif; line-height: 1.8; padding: 20px; direction: rtl;">

<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">🎲 أحداث مستقلة (تعمّق)</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #2980b9; margin-top: 0;">📘 تعريف الاستقلال</h3>
<p>حدثان A و B مستقلان إذا وفقط إذا:</p>
<p style="text-align: center; font-size: 1.3em; color: #2980b9;"><strong>P(A ∩ B) = P(A) × P(B)</strong></p>
<p>بمعنى آخر: تحقق أحدهما لا يؤثر على احتمال الآخر:</p>
<p style="text-align: center;">P_B(A) = P(A) و P_A(B) = P(B)</p>
</div>

<div style="background: #d5a6e6; border-right: 4px solid #8e44ad; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #8e44ad; margin-top: 0;">📐 خصائص</h3>
<ul>
<li>إذا كان A و B مستقلين فإن A و B̄ مستقلان أيضاً</li>
<li>إذا كان A و B مستقلين فإن Ā و B̄ مستقلان أيضاً</li>
<li>استقلال ≠ عدم التوافق (التنافي)</li>
<li>إذا P(A) = 0 أو P(A) = 1 فإن A مستقل مع أي حدث</li>
</ul>
</div>

<div style="background: #fdedec; border-right: 4px solid #e74c3c; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e74c3c; margin-top: 0;">⚠️ تنبيه</h3>
<p><strong>الاستقلال ≠ التنافي (عدم التوافق)</strong></p>
<p>حدثان متنافيان (A ∩ B = ∅) ليسا مستقلين أبداً (إلا إذا كان أحدهما مستحيلاً)، لأن P(A ∩ B) = 0 ≠ P(A)×P(B)</p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 1</h3>
<p>رمي حجر نرد عادل مرتين. A: الأولى زوجية ، B: الثانية ≤ 3</p>
<p>P(A) = 1/2 ، P(B) = 1/2 ، P(A ∩ B) = ?</p>
<p>الرمية الأولى مستقلة عن الثانية: P(A ∩ B) = 1/2 × 1/2 = 1/4</p>
<p>هل P(A)×P(B) = P(A∩B)؟ ✓ إذن A و B <strong>مستقلان</strong></p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 2: تكرار تجارب مستقلة</h3>
<p>احتمال نجاح رامي كرة السلة في التسديدة = 0.8. يسدد 5 مرات مستقلة.</p>
<p>P(كل التسديدات ناجحة) = 0.8⁵ = <strong>0.32768</strong></p>
<p>P(واحدة على الأقل ناجحة) = 1 - P(لا شيء) = 1 - 0.2⁵ = <strong>0.99968</strong></p>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #1abc9c; margin-top: 0;">✏️ تمارين تطبيقية</h3>
<p><strong>التمرين 1:</strong> P(A) = 0.6 و P(B) = 0.3 و A,B مستقلان. احسب P(A∪B) و P(A∩B̄)</p>
<p><strong>التمرين 2:</strong> آلة تعطل بنسبة 5% يومياً (أيام مستقلة). P(لا تعطل لمدة أسبوع) = ؟</p>
<p><strong>التمرين 3:</strong> رمي عملة عادلة 10 مرات. P(كل الوجوه صورة) = ؟ و P(على الأقل كتابة واحدة) = ؟</p>
</div>

</div>' WHERE id = '24b01d9c-c3fc-4265-817d-d03516d54d81';

-- Lesson 178: Loi de Bernoulli
UPDATE lessons SET content = '<div style="font-family: Tajawal, Arial, sans-serif; line-height: 1.8; padding: 20px; direction: rtl;">

<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">🎯 قانون برنولي وذي الحدين (تعمّق)</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #2980b9; margin-top: 0;">📘 تجربة برنولي</h3>
<p>تجربة عشوائية لها نتيجتان فقط: <strong>نجاح</strong> (باحتمال p) و <strong>فشل</strong> (باحتمال q = 1-p)</p>
<p>المتغير العشوائي X ~ B(1, p) حيث X = 1 (نجاح) أو X = 0 (فشل)</p>
<ul>
<li>E(X) = p</li>
<li>V(X) = p(1-p) = pq</li>
</ul>
</div>

<div style="background: #d5a6e6; border-right: 4px solid #8e44ad; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #8e44ad; margin-top: 0;">📐 قانون ذي الحدين B(n, p)</h3>
<p>إذا كررنا تجربة برنولي n مرة مستقلة، وكان X = عدد النجاحات:</p>
<p style="text-align: center; font-size: 1.2em; color: #8e44ad;"><strong>P(X = k) = C(n,k) × pᵏ × (1-p)ⁿ⁻ᵏ</strong></p>
<p>نكتب X ~ B(n, p)</p>
<ul>
<li><strong>E(X) = np</strong></li>
<li><strong>V(X) = np(1-p)</strong></li>
<li><strong>σ(X) = √(np(1-p))</strong></li>
</ul>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 1: QCM</h3>
<p>اختبار QCM من 10 أسئلة، كل سؤال له 4 اختيارات. تلميذ يجيب عشوائياً.</p>
<p>X = عدد الإجابات الصحيحة ~ B(10, 1/4)</p>
<p>E(X) = 10 × 1/4 = <strong>2.5 إجابة</strong></p>
<p>P(X = 0) = C(10,0)×(1/4)⁰×(3/4)¹⁰ = (3/4)¹⁰ ≈ <strong>0.0563</strong></p>
<p>P(X ≥ 5) = 1 - P(X ≤ 4) ≈ <strong>0.0781</strong></p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 2: مراقبة الجودة</h3>
<p>مصنع ينتج قطعاً بنسبة عيوب 3%. نأخذ عينة من 20 قطعة.</p>
<p>X = عدد القطع المعيبة ~ B(20, 0.03)</p>
<p>P(X = 0) = 0.97²⁰ ≈ 0.5438</p>
<p>P(X ≥ 2) = 1 - P(X=0) - P(X=1)</p>
<p>P(X=1) = C(20,1)×0.03×0.97¹⁹ ≈ 0.3364</p>
<p>P(X ≥ 2) ≈ 1 - 0.5438 - 0.3364 = <strong>0.1198</strong></p>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #1abc9c; margin-top: 0;">✏️ تمارين تطبيقية</h3>
<p><strong>التمرين 1:</strong> رمي عملة مزورة (P(صورة) = 0.6) 8 مرات. احسب P(X=3) و E(X) و V(X)</p>
<p><strong>التمرين 2:</strong> فريق يفوز باحتمال 0.7 في كل مباراة. في بطولة من 5 مباريات مستقلة، ما احتمال الفوز بـ 4 مباريات على الأقل؟</p>
<p><strong>التمرين 3:</strong> أوجد n الأصغر بحيث P(X ≥ 1) > 0.95 حيث X ~ B(n, 0.1)</p>
</div>

</div>' WHERE id = '3000d350-2722-45d4-921a-f718ef424617';

-- Lesson 179: Lois de probabilité continues
UPDATE lessons SET content = '<div style="font-family: Tajawal, Arial, sans-serif; line-height: 1.8; padding: 20px; direction: rtl;">

<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">📊 قوانين الاحتمال المستمرة (تعمّق)</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #2980b9; margin-top: 0;">📘 تعريف</h3>
<p>المتغير العشوائي المستمر X يأخذ قيماً في مجال (وليس قيماً منفصلة). يتميز بدالة كثافة f حيث:</p>
<ul>
<li>f(x) ≥ 0 لكل x</li>
<li>∫₋∞^(+∞) f(x)dx = 1</li>
<li><strong>P(a ≤ X ≤ b) = ∫ₐᵇ f(x)dx</strong></li>
</ul>
<p><strong>ملاحظة:</strong> P(X = a) = 0 لأي قيمة معينة a</p>
</div>

<div style="background: #d5a6e6; border-right: 4px solid #8e44ad; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #8e44ad; margin-top: 0;">📐 القانون المنتظم U([a, b])</h3>
<p>دالة الكثافة: f(x) = 1/(b-a) لـ x ∈ [a, b] و 0 في الباقي</p>
<ul>
<li>E(X) = (a+b)/2</li>
<li>V(X) = (b-a)²/12</li>
<li>P(c ≤ X ≤ d) = (d-c)/(b-a) لـ a ≤ c ≤ d ≤ b</li>
</ul>
</div>

<div style="background: #d5a6e6; border-right: 4px solid #8e44ad; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #8e44ad; margin-top: 0;">📐 القانون الأسي E(λ)</h3>
<p>دالة الكثافة: f(x) = λe⁻ᵏˣ لـ x ≥ 0 و 0 لـ x < 0</p>
<ul>
<li>E(X) = 1/λ</li>
<li>V(X) = 1/λ²</li>
<li>P(X ≤ t) = 1 - e⁻ᵏᵗ</li>
<li>P(X > t) = e⁻ᵏᵗ</li>
<li><strong>خاصية انعدام الذاكرة:</strong> P(X > s+t | X > s) = P(X > t)</li>
</ul>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال: عمر جهاز</h3>
<p>عمر جهاز يتبع القانون الأسي بمعامل λ = 0.001 (بالساعات)</p>
<p>E(X) = 1/0.001 = <strong>1000 ساعة</strong></p>
<p>P(X > 500) = e⁻⁰·⁰⁰¹ˣ⁵⁰⁰ = e⁻⁰·⁵ ≈ <strong>0.6065</strong></p>
<p>P(X > 2000) = e⁻² ≈ <strong>0.1353</strong></p>
<p>P(500 < X < 1500) = e⁻⁰·⁵ - e⁻¹·⁵ ≈ 0.6065 - 0.2231 = <strong>0.3834</strong></p>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #1abc9c; margin-top: 0;">✏️ تمارين تطبيقية</h3>
<p><strong>التمرين 1:</strong> X ~ U([2, 8]). احسب P(3 ≤ X ≤ 6) و E(X) و V(X)</p>
<p><strong>التمرين 2:</strong> وقت الانتظار T ~ E(0.2) (بالدقائق). P(T > 10) = ؟ و P(T < 5) = ؟</p>
<p><strong>التمرين 3:</strong> تحقق من خاصية انعدام الذاكرة: P(T > 15 | T > 5) = P(T > 10) للقانون الأسي</p>
</div>

</div>' WHERE id = 'e5694187-de57-4d96-9617-176ec248fe47';

-- Lesson 180: Adéquation à une loi équirépartie
UPDATE lessons SET content = '<div style="font-family: Tajawal, Arial, sans-serif; line-height: 1.8; padding: 20px; direction: rtl;">

<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">📊 ملاءمة لقانون متساوي التوزيع (تعمّق)</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #2980b9; margin-top: 0;">📘 القانون المتساوي التوزيع</h3>
<p>نقول إن المتغير العشوائي X يتبع قانوناً متساوي التوزيع إذا كان لكل القيم الممكنة نفس الاحتمال:</p>
<p><strong>حالة منفصلة:</strong> X يأخذ n قيمة مختلفة بنفس الاحتمال 1/n</p>
<p><strong>حالة مستمرة:</strong> X ~ U([a, b]) بدالة كثافة ثابتة f(x) = 1/(b-a)</p>
</div>

<div style="background: #d5a6e6; border-right: 4px solid #8e44ad; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #8e44ad; margin-top: 0;">📐 اختبار الملاءمة (χ²)</h3>
<p>للتحقق من أن بيانات تتبع قانوناً معيناً:</p>
<ol>
<li>نحسب التكرارات الملاحظة Oᵢ</li>
<li>نحسب التكرارات المتوقعة Eᵢ (حسب القانون النظري)</li>
<li>نحسب: <strong>χ² = Σ (Oᵢ - Eᵢ)² / Eᵢ</strong></li>
<li>نقارن مع χ² الجدولي عند مستوى الدلالة المطلوب</li>
</ol>
<p>إذا χ² المحسوبة < χ² الجدولية: نقبل الفرضية</p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال: هل حجر النرد عادل؟</h3>
<p>رمينا حجر نرد 120 مرة وحصلنا على:</p>
<table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
<tr style="background: #2c3e50; color: white;"><th style="padding: 8px; border: 1px solid #ddd;">الوجه</th><th style="padding: 8px;">1</th><th style="padding: 8px;">2</th><th style="padding: 8px;">3</th><th style="padding: 8px;">4</th><th style="padding: 8px;">5</th><th style="padding: 8px;">6</th></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">ملاحظ Oᵢ</td><td style="padding: 8px;">18</td><td style="padding: 8px;">22</td><td style="padding: 8px;">17</td><td style="padding: 8px;">25</td><td style="padding: 8px;">19</td><td style="padding: 8px;">19</td></tr>
<tr style="background: #f9f9f9;"><td style="padding: 8px; border: 1px solid #ddd;">متوقع Eᵢ</td><td style="padding: 8px;">20</td><td style="padding: 8px;">20</td><td style="padding: 8px;">20</td><td style="padding: 8px;">20</td><td style="padding: 8px;">20</td><td style="padding: 8px;">20</td></tr>
</table>
<p>χ² = (18-20)²/20 + (22-20)²/20 + (17-20)²/20 + (25-20)²/20 + (19-20)²/20 + (19-20)²/20</p>
<p>= 4/20 + 4/20 + 9/20 + 25/20 + 1/20 + 1/20 = 44/20 = <strong>2.2</strong></p>
<p>χ² الجدولي (5 درجات حرية، مستوى 5%) = 11.07</p>
<p>2.2 < 11.07 ⟹ <strong>نقبل فرضية أن النرد عادل</strong></p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال: ملاءمة توزيع مستمر</h3>
<p>لاختبار أن مدة انتظار تتبع U([0, 10])، نقسم [0,10] إلى 5 مجالات متساوية ونقارن التكرارات.</p>
<p>إذا كانت العينة 100: التكرار المتوقع لكل مجال = 100/5 = 20</p>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #1abc9c; margin-top: 0;">✏️ تمارين تطبيقية</h3>
<p><strong>التمرين 1:</strong> في 200 رمية عملة حصلنا على 112 صورة و88 كتابة. اختبر عند مستوى 5% هل العملة عادلة (χ² الجدولي = 3.84)</p>
<p><strong>التمرين 2:</strong> مولد أعداد عشوائية بين 0 و 1. من 500 عدد، وزعت على [0,0.25[, [0.25,0.5[, [0.5,0.75[, [0.75,1] بتكرارات 118, 130, 122, 130. هل التوزيع منتظم؟</p>
</div>

</div>' WHERE id = '593d5727-b1c1-4956-917a-fe5419f940f3';
