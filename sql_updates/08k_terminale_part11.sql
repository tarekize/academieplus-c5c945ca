-- Terminale Batch 11: Lessons 151-165
-- Topics: Dérivée fonction composée, Trig, Exponentielle, ln, Puissances, Croissance comparée, Primitives

-- Lesson 151: Dérivée d'une fonction composée
UPDATE lessons SET content = '<div style="font-family: Tajawal, Arial, sans-serif; line-height: 1.8; padding: 20px; direction: rtl;">

<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">🔗 مشتقة دالة مركبة</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #2980b9; margin-top: 0;">📘 تعريف</h3>
<p>إذا كانت <strong>g</strong> دالة قابلة للاشتقاق في <strong>x</strong> و <strong>f</strong> دالة قابلة للاشتقاق في <strong>g(x)</strong>، فإن الدالة المركبة <strong>f∘g</strong> قابلة للاشتقاق في x ومشتقتها هي:</p>
<p style="text-align: center; font-size: 1.2em; color: #2980b9;"><strong>(f∘g)''(x) = g''(x) × f''(g(x))</strong></p>
</div>

<div style="background: #d5a6e6; border-right: 4px solid #8e44ad; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #8e44ad; margin-top: 0;">📐 صيغ المشتقات الأساسية للدوال المركبة</h3>
<table style="width: 100%; border-collapse: collapse; direction: rtl;">
<tr style="background: #2c3e50; color: white;"><th style="padding: 10px; border: 1px solid #ddd;">الدالة f(u(x))</th><th style="padding: 10px; border: 1px solid #ddd;">المشتقة f''(u(x))</th></tr>
<tr><td style="padding: 10px; border: 1px solid #ddd;">[u(x)]ⁿ</td><td style="padding: 10px; border: 1px solid #ddd;">n·u''(x)·[u(x)]ⁿ⁻¹</td></tr>
<tr style="background: #f9f9f9;"><td style="padding: 10px; border: 1px solid #ddd;">√(u(x))</td><td style="padding: 10px; border: 1px solid #ddd;">u''(x) / (2√(u(x)))</td></tr>
<tr><td style="padding: 10px; border: 1px solid #ddd;">1/u(x)</td><td style="padding: 10px; border: 1px solid #ddd;">-u''(x) / [u(x)]²</td></tr>
<tr style="background: #f9f9f9;"><td style="padding: 10px; border: 1px solid #ddd;">eᵘ⁽ˣ⁾</td><td style="padding: 10px; border: 1px solid #ddd;">u''(x)·eᵘ⁽ˣ⁾</td></tr>
<tr><td style="padding: 10px; border: 1px solid #ddd;">ln(u(x))</td><td style="padding: 10px; border: 1px solid #ddd;">u''(x) / u(x)</td></tr>
<tr style="background: #f9f9f9;"><td style="padding: 10px; border: 1px solid #ddd;">sin(u(x))</td><td style="padding: 10px; border: 1px solid #ddd;">u''(x)·cos(u(x))</td></tr>
<tr><td style="padding: 10px; border: 1px solid #ddd;">cos(u(x))</td><td style="padding: 10px; border: 1px solid #ddd;">-u''(x)·sin(u(x))</td></tr>
</table>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 1: اشتقاق دالة مركبة</h3>
<p>لتكن f(x) = (3x² + 1)⁵</p>
<p>نضع u(x) = 3x² + 1 فتصبح f(x) = u⁵</p>
<p>u''(x) = 6x</p>
<p style="color: #e67e22;"><strong>f''(x) = 5 × 6x × (3x² + 1)⁴ = 30x(3x² + 1)⁴</strong></p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 2: اشتقاق دالة أسية مركبة</h3>
<p>لتكن g(x) = e^(2x+3)</p>
<p>نضع u(x) = 2x + 3 ، u''(x) = 2</p>
<p style="color: #e67e22;"><strong>g''(x) = 2·e^(2x+3)</strong></p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 3: اشتقاق دالة لوغاريتمية مركبة</h3>
<p>لتكن h(x) = ln(x² + 4)</p>
<p>u(x) = x² + 4 ، u''(x) = 2x</p>
<p style="color: #e67e22;"><strong>h''(x) = 2x / (x² + 4)</strong></p>
</div>

<div style="background: #fdedec; border-right: 4px solid #e74c3c; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e74c3c; margin-top: 0;">⚠️ أخطاء شائعة</h3>
<ul>
<li>نسيان الضرب في u''(x) عند اشتقاق الدالة المركبة</li>
<li>الخلط بين مشتقة sin(2x) = 2cos(2x) ومشتقة sin(x) = cos(x)</li>
<li>عدم تبسيط النتيجة النهائية</li>
</ul>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #1abc9c; margin-top: 0;">✏️ تمارين تطبيقية</h3>
<p><strong>التمرين 1:</strong> أوجد مشتقة كل من الدوال التالية:</p>
<ol>
<li>f(x) = (2x - 5)⁷</li>
<li>g(x) = √(x² + 9)</li>
<li>h(x) = e^(x³)</li>
<li>k(x) = ln(sin(x))</li>
</ol>
<p><strong>التمرين 2:</strong> أوجد معادلة المماس لمنحنى f(x) = (x² + 1)³ عند النقطة x₀ = 1</p>
</div>

</div>' WHERE id = 'c8473009-2987-43e8-ae76-28474cd7d9fc';

-- Lesson 152: Étude de fonction trigonométrique
UPDATE lessons SET content = '<div style="font-family: Tajawal, Arial, sans-serif; line-height: 1.8; padding: 20px; direction: rtl;">

<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">📐 دراسة دالة مثلثية</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #2980b9; margin-top: 0;">📘 مراحل دراسة دالة مثلثية</h3>
<ol>
<li><strong>مجموعة التعريف</strong>: تحديد القيم التي تكون فيها الدالة معرفة</li>
<li><strong>الدورية</strong>: إيجاد الدور T حيث f(x + T) = f(x)</li>
<li><strong>الزوجية أو الفردية</strong>: دراسة f(-x) مقارنة بـ f(x)</li>
<li><strong>تقليص مجال الدراسة</strong>: الاستفادة من الخصائص السابقة</li>
<li><strong>النهايات</strong>: في أطراف مجال الدراسة</li>
<li><strong>المشتقة ودراسة الاطراد</strong></li>
<li><strong>جدول التغيرات والرسم البياني</strong></li>
</ol>
</div>

<div style="background: #d5a6e6; border-right: 4px solid #8e44ad; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #8e44ad; margin-top: 0;">📐 مشتقات الدوال المثلثية</h3>
<table style="width: 100%; border-collapse: collapse;">
<tr style="background: #2c3e50; color: white;"><th style="padding: 10px; border: 1px solid #ddd;">الدالة</th><th style="padding: 10px; border: 1px solid #ddd;">المشتقة</th><th style="padding: 10px; border: 1px solid #ddd;">مجال التعريف</th></tr>
<tr><td style="padding: 10px; border: 1px solid #ddd;">sin(x)</td><td style="padding: 10px; border: 1px solid #ddd;">cos(x)</td><td style="padding: 10px; border: 1px solid #ddd;">ℝ</td></tr>
<tr style="background: #f9f9f9;"><td style="padding: 10px; border: 1px solid #ddd;">cos(x)</td><td style="padding: 10px; border: 1px solid #ddd;">-sin(x)</td><td style="padding: 10px; border: 1px solid #ddd;">ℝ</td></tr>
<tr><td style="padding: 10px; border: 1px solid #ddd;">tan(x)</td><td style="padding: 10px; border: 1px solid #ddd;">1 + tan²(x) = 1/cos²(x)</td><td style="padding: 10px; border: 1px solid #ddd;">ℝ \ {π/2 + kπ}</td></tr>
</table>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال: دراسة الدالة f(x) = 2sin(x) + sin(2x)</h3>
<p><strong>1) مجموعة التعريف:</strong> Df = ℝ</p>
<p><strong>2) الدورية:</strong> f دورية بدور T = 2π</p>
<p><strong>3) الفردية:</strong> f(-x) = -2sin(x) - sin(2x) = -f(x) → f فردية</p>
<p><strong>4) تقليص مجال الدراسة:</strong> نكتفي بالدراسة على [0, π] ونستعمل التناظر مع محور Ox</p>
<p><strong>5) المشتقة:</strong></p>
<p style="text-align: center;">f''(x) = 2cos(x) + 2cos(2x) = 2cos(x) + 2(2cos²(x) - 1)</p>
<p style="text-align: center;">= 4cos²(x) + 2cos(x) - 2 = 2(2cos(x) - 1)(cos(x) + 1)</p>
<p><strong>f''(x) = 0:</strong> cos(x) = 1/2 أي x = π/3 أو cos(x) = -1 أي x = π</p>
<p><strong>6) جدول التغيرات على [0, π]:</strong></p>
<ul>
<li>f متزايدة على [0, π/3] ، f(π/3) = 3√3/2</li>
<li>f متناقصة على [π/3, π] ، f(π) = 0</li>
</ul>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #1abc9c; margin-top: 0;">✏️ تمارين تطبيقية</h3>
<p><strong>التمرين 1:</strong> ادرس الدالة f(x) = cos(x) + cos(2x) دراسة كاملة وارسم منحناها</p>
<p><strong>التمرين 2:</strong> أوجد القيم القصوى للدالة g(x) = sin(x) + √3·cos(x) على [0, 2π]</p>
<p><strong>التمرين 3:</strong> حل المعادلة 2cos²(x) - cos(x) - 1 = 0 في [0, 2π]</p>
</div>

</div>' WHERE id = '0d9fa90e-302d-4a42-b538-dd8a25f22fba';

-- Lesson 153: Fonction exponentielle
UPDATE lessons SET content = '<div style="font-family: Tajawal, Arial, sans-serif; line-height: 1.8; padding: 20px; direction: rtl;">

<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">📈 الدالة الأسية (تعمّق)</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #2980b9; margin-top: 0;">📘 تعريف الدالة الأسية</h3>
<p>الدالة الأسية هي الدالة الوحيدة المعرفة على ℝ والقابلة للاشتقاق التي تحقق:</p>
<p style="text-align: center; font-size: 1.2em; color: #2980b9;"><strong>f''(x) = f(x) و f(0) = 1</strong></p>
<p>نرمز لها بـ exp أو eˣ حيث e = exp(1) ≈ 2.71828...</p>
</div>

<div style="background: #d5a6e6; border-right: 4px solid #8e44ad; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #8e44ad; margin-top: 0;">📐 خصائص جبرية أساسية</h3>
<ul>
<li>∀x, y ∈ ℝ: <strong>eˣ⁺ʸ = eˣ × eʸ</strong></li>
<li>∀x, y ∈ ℝ: <strong>eˣ⁻ʸ = eˣ / eʸ</strong></li>
<li>∀x ∈ ℝ, ∀n ∈ ℤ: <strong>(eˣ)ⁿ = eⁿˣ</strong></li>
<li><strong>e⁰ = 1</strong></li>
<li>∀x ∈ ℝ: <strong>eˣ > 0</strong></li>
<li><strong>e⁻ˣ = 1/eˣ</strong></li>
</ul>
</div>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #2980b9; margin-top: 0;">📘 العلاقة بين exp و ln</h3>
<ul>
<li>∀x ∈ ℝ: <strong>ln(eˣ) = x</strong></li>
<li>∀x > 0: <strong>e^(ln(x)) = x</strong></li>
<li>eˣ = y ⟺ x = ln(y) (حيث y > 0)</li>
</ul>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال: حل معادلات أسية</h3>
<p><strong>حل:</strong> e^(2x-1) = e³</p>
<p>بما أن الدالة الأسية تقابل: 2x - 1 = 3 ⟹ x = 2</p>
<p><strong>حل:</strong> e^(x²) = e^(4x-3)</p>
<p>x² = 4x - 3 ⟹ x² - 4x + 3 = 0 ⟹ (x-1)(x-3) = 0</p>
<p style="color: #e67e22;"><strong>S = {1, 3}</strong></p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال: حل متراجحات أسية</h3>
<p><strong>حل:</strong> e^(3x+1) ≥ e^(5-x)</p>
<p>بما أن الدالة الأسية متزايدة تماماً على ℝ:</p>
<p>3x + 1 ≥ 5 - x ⟹ 4x ≥ 4 ⟹ x ≥ 1</p>
<p style="color: #e67e22;"><strong>S = [1, +∞[</strong></p>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #1abc9c; margin-top: 0;">✏️ تمارين تطبيقية</h3>
<p><strong>التمرين 1:</strong> حل المعادلات التالية:</p>
<ol>
<li>e^(2x) - 5eˣ + 6 = 0</li>
<li>e^(2x) + eˣ - 2 = 0</li>
<li>2e^(2x) - 7eˣ + 3 = 0</li>
</ol>
<p><strong>التمرين 2:</strong> بسّط التعابير: A = e^(ln3) × e^(2ln2) و B = ln(e⁵) + e^(ln√2)</p>
</div>

</div>' WHERE id = '2db9a9de-7963-4fc9-bc4a-723b6065d734';

-- Lesson 154: Fonctions exponentielles x ↦ eˣ
UPDATE lessons SET content = '<div style="font-family: Tajawal, Arial, sans-serif; line-height: 1.8; padding: 20px; direction: rtl;">

<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">📊 الدوال الأسية x ↦ eˣ (تعمّق)</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #2980b9; margin-top: 0;">📘 الدالة الأسية الطبيعية</h3>
<p>الدالة الأسية الطبيعية exp: ℝ → ]0, +∞[ معرفة بـ exp(x) = eˣ هي الدالة العكسية للدالة اللوغاريتمية النيبرية.</p>
<p><strong>خصائصها الأساسية:</strong></p>
<ul>
<li>معرفة ومستمرة وقابلة للاشتقاق على ℝ</li>
<li>متزايدة تماماً على ℝ</li>
<li>exp''(x) = exp(x) لكل x ∈ ℝ</li>
<li>exp(0) = 1 ، exp(1) = e ≈ 2.718</li>
</ul>
</div>

<div style="background: #d5a6e6; border-right: 4px solid #8e44ad; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #8e44ad; margin-top: 0;">📐 نهايات الدالة الأسية</h3>
<ul>
<li style="font-size: 1.1em;">lim(x→+∞) eˣ = <strong>+∞</strong></li>
<li style="font-size: 1.1em;">lim(x→-∞) eˣ = <strong>0</strong></li>
<li style="font-size: 1.1em;">lim(x→+∞) eˣ/x = <strong>+∞</strong> (النمو أسرع من أي كثير حدود)</li>
<li style="font-size: 1.1em;">lim(x→-∞) x·eˣ = <strong>0</strong></li>
<li style="font-size: 1.1em;">lim(x→+∞) eˣ/xⁿ = <strong>+∞</strong> لكل n ∈ ℕ</li>
</ul>
</div>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #2980b9; margin-top: 0;">📘 نهايات مرجعية</h3>
<p style="text-align: center; font-size: 1.2em;">lim(x→0) (eˣ - 1)/x = <strong>1</strong></p>
<p style="text-align: center; font-size: 1.2em;">lim(x→0) (e^(ax) - 1)/x = <strong>a</strong></p>
<p>هذه النهايات أساسية في حساب المشتقات وإزالة أشكال عدم التعيين.</p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال: حساب نهايات</h3>
<p><strong>1)</strong> lim(x→+∞) (x² - 1)eˣ</p>
<p>lim(x→+∞) x²eˣ = +∞ (لأن eˣ يهيمن) ⟹ النهاية هي <strong>+∞</strong></p>
<p><strong>2)</strong> lim(x→-∞) (x² + 3x)eˣ</p>
<p>نكتب: x²eˣ + 3xeˣ ، ولأن lim xⁿeˣ = 0 عندما x→-∞ ⟹ النهاية هي <strong>0</strong></p>
<p><strong>3)</strong> lim(x→+∞) (2eˣ - x³)/(eˣ + x)</p>
<p>نقسم على eˣ: (2 - x³/eˣ)/(1 + x/eˣ) = 2/1 = <strong>2</strong></p>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #1abc9c; margin-top: 0;">✏️ تمارين تطبيقية</h3>
<p><strong>التمرين 1:</strong> احسب النهايات التالية:</p>
<ol>
<li>lim(x→+∞) (eˣ - x² + 1)</li>
<li>lim(x→-∞) e^(2x+1)</li>
<li>lim(x→+∞) (3eˣ + x)/(eˣ - 2x)</li>
</ol>
<p><strong>التمرين 2:</strong> أثبت أن المستقيم y = 0 مقارب أفقي لمنحنى f(x) = (x+1)e⁻ˣ عند +∞</p>
</div>

</div>' WHERE id = '2a7644fd-2a2e-4481-a183-6f0ca6a2c475';

-- Lesson 155: Étude de la fonction exponentielle
UPDATE lessons SET content = '<div style="font-family: Tajawal, Arial, sans-serif; line-height: 1.8; padding: 20px; direction: rtl;">

<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">📊 دراسة الدالة الأسية (تعمّق)</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #2980b9; margin-top: 0;">📘 دراسة كاملة للدالة f(x) = eˣ</h3>
<ul>
<li><strong>مجموعة التعريف:</strong> Df = ℝ</li>
<li><strong>الاستمرارية:</strong> مستمرة على ℝ</li>
<li><strong>الاشتقاق:</strong> f''(x) = eˣ > 0 لكل x ∈ ℝ</li>
<li><strong>الاطراد:</strong> متزايدة تماماً على ℝ</li>
<li><strong>النهايات:</strong> lim(x→-∞) eˣ = 0 ، lim(x→+∞) eˣ = +∞</li>
<li><strong>المماس عند الأصل:</strong> y = x + 1</li>
</ul>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال: دراسة دالة f(x) = xe⁻ˣ</h3>
<p><strong>مجموعة التعريف:</strong> Df = ℝ</p>
<p><strong>النهايات:</strong></p>
<ul>
<li>lim(x→+∞) xe⁻ˣ = lim x/eˣ = 0 (الأسية تهيمن)</li>
<li>lim(x→-∞) xe⁻ˣ = (-∞)(+∞) = -∞</li>
</ul>
<p><strong>المقارب:</strong> المستقيم y = 0 مقارب أفقي عند +∞</p>
<p><strong>المشتقة:</strong> f''(x) = e⁻ˣ + x(-e⁻ˣ) = e⁻ˣ(1 - x)</p>
<p>f''(x) = 0 ⟺ x = 1 (لأن e⁻ˣ > 0 دائماً)</p>
<p>f''(x) > 0 لـ x < 1 و f''(x) < 0 لـ x > 1</p>
<p style="color: #e67e22;"><strong>f تقبل حد أقصى في x = 1: f(1) = 1/e ≈ 0.368</strong></p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال: دراسة دالة g(x) = e²ˣ - 4eˣ + 3</h3>
<p>نضع t = eˣ > 0 فنحصل على g = t² - 4t + 3 = (t-1)(t-3)</p>
<p><strong>g(x) = 0:</strong> eˣ = 1 أو eˣ = 3 ⟹ x = 0 أو x = ln3</p>
<p><strong>g''(x) = 2e²ˣ - 4eˣ = 2eˣ(eˣ - 2)</strong></p>
<p>g''(x) = 0 ⟺ eˣ = 2 ⟺ x = ln2</p>
<p>g(ln2) = 4 - 8 + 3 = -1 (حد أدنى)</p>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #1abc9c; margin-top: 0;">✏️ تمارين تطبيقية</h3>
<p><strong>التمرين 1:</strong> ادرس الدالة f(x) = (x² - 1)eˣ دراسة كاملة وارسم منحناها</p>
<p><strong>التمرين 2:</strong> ادرس الدالة g(x) = eˣ/(eˣ + 1) وبيّن أن المستقيمين y = 0 و y = 1 مقاربان لها</p>
<p><strong>التمرين 3:</strong> أوجد مساحة المنطقة المحصورة بين منحنى f(x) = e⁻ˣ ومحور Ox على المجال [0, 2]</p>
</div>

</div>' WHERE id = 'dd62a165-e2d2-48b3-ab30-e3d927e24a50';

-- Lesson 156: Étude de la fonction exp(u)
UPDATE lessons SET content = '<div style="font-family: Tajawal, Arial, sans-serif; line-height: 1.8; padding: 20px; direction: rtl;">

<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">📈 دراسة الدالة exp(u) - مركبة أسية (تعمّق)</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #2980b9; margin-top: 0;">📘 الدالة e^(u(x))</h3>
<p>إذا كانت u دالة قابلة للاشتقاق على مجال I، فإن الدالة f(x) = e^(u(x)) قابلة للاشتقاق على I ومشتقتها:</p>
<p style="text-align: center; font-size: 1.2em; color: #2980b9;"><strong>f''(x) = u''(x) · e^(u(x))</strong></p>
<p>بما أن e^(u(x)) > 0 دائماً، فإن إشارة f'' هي نفس إشارة u''</p>
</div>

<div style="background: #d5a6e6; border-right: 4px solid #8e44ad; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #8e44ad; margin-top: 0;">📐 خاصية أساسية</h3>
<p>اطراد الدالة x ↦ e^(u(x)) هو نفس اطراد الدالة u:</p>
<ul>
<li>إذا كانت u متزايدة فإن e^u متزايدة</li>
<li>إذا كانت u متناقصة فإن e^u متناقصة</li>
</ul>
<p>∀x ∈ I: e^(u(x)) = e^(v(x)) ⟺ u(x) = v(x)</p>
<p>∀x ∈ I: e^(u(x)) > e^(v(x)) ⟺ u(x) > v(x)</p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 1: دراسة f(x) = e^(1-x²)</h3>
<p><strong>مجموعة التعريف:</strong> ℝ</p>
<p><strong>u(x) = 1 - x² ، u''(x) = -2x</strong></p>
<p><strong>f''(x) = -2x · e^(1-x²)</strong></p>
<p>f''(x) = 0 ⟺ x = 0</p>
<p>f''(x) > 0 لـ x < 0 (متزايدة) و f''(x) < 0 لـ x > 0 (متناقصة)</p>
<p style="color: #e67e22;"><strong>حد أقصى: f(0) = e¹ = e</strong></p>
<p><strong>النهايات:</strong> lim(x→±∞) e^(1-x²) = e^(-∞) = 0</p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 2: دراسة g(x) = e^(x/(x+1))</h3>
<p><strong>مجموعة التعريف:</strong> ℝ \ {-1}</p>
<p>u(x) = x/(x+1) = 1 - 1/(x+1)</p>
<p>u''(x) = 1/(x+1)² > 0 ⟹ u متزايدة على كل مجال</p>
<p><strong>g''(x) = [1/(x+1)²] · e^(x/(x+1)) > 0</strong></p>
<p>g متزايدة تماماً على كل من ]-∞, -1[ و ]-1, +∞[</p>
<p><strong>النهايات:</strong> lim(x→±∞) g(x) = e¹ = e (مقارب أفقي y = e)</p>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #1abc9c; margin-top: 0;">✏️ تمارين تطبيقية</h3>
<p><strong>التمرين 1:</strong> ادرس الدالة f(x) = e^(2x-x²) وحدد القيم القصوى</p>
<p><strong>التمرين 2:</strong> ادرس الدالة g(x) = e^(sin(x)) وبيّن أنها دورية</p>
<p><strong>التمرين 3:</strong> حل المتراجحة e^(x²-3x) ≤ e² وحدد مجموعة الحلول</p>
</div>

</div>' WHERE id = '93453e6d-ff5b-4b65-ae04-05c948c0641a';

-- Lesson 157: Propriétés algébriques
UPDATE lessons SET content = '<div style="font-family: Tajawal, Arial, sans-serif; line-height: 1.8; padding: 20px; direction: rtl;">

<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">🔢 الخصائص الجبرية (تعمّق)</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #2980b9; margin-top: 0;">📘 خصائص اللوغاريتم والأسية</h3>
<p>لكل x, y > 0 ولكل a, b ∈ ℝ:</p>
<table style="width: 100%; border-collapse: collapse;">
<tr style="background: #2c3e50; color: white;"><th style="padding: 10px; border: 1px solid #ddd;">الخاصية الأسية</th><th style="padding: 10px; border: 1px solid #ddd;">الخاصية اللوغاريتمية</th></tr>
<tr><td style="padding: 10px; border: 1px solid #ddd;">eᵃ⁺ᵇ = eᵃ × eᵇ</td><td style="padding: 10px; border: 1px solid #ddd;">ln(xy) = ln(x) + ln(y)</td></tr>
<tr style="background: #f9f9f9;"><td style="padding: 10px; border: 1px solid #ddd;">eᵃ⁻ᵇ = eᵃ / eᵇ</td><td style="padding: 10px; border: 1px solid #ddd;">ln(x/y) = ln(x) - ln(y)</td></tr>
<tr><td style="padding: 10px; border: 1px solid #ddd;">(eᵃ)ⁿ = eⁿᵃ</td><td style="padding: 10px; border: 1px solid #ddd;">ln(xⁿ) = n·ln(x)</td></tr>
<tr style="background: #f9f9f9;"><td style="padding: 10px; border: 1px solid #ddd;">e⁰ = 1</td><td style="padding: 10px; border: 1px solid #ddd;">ln(1) = 0</td></tr>
<tr><td style="padding: 10px; border: 1px solid #ddd;">e¹ = e</td><td style="padding: 10px; border: 1px solid #ddd;">ln(e) = 1</td></tr>
</table>
</div>

<div style="background: #d5a6e6; border-right: 4px solid #8e44ad; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #8e44ad; margin-top: 0;">📐 علاقات التحويل</h3>
<ul>
<li>∀a > 0: <strong>a = e^(ln(a))</strong></li>
<li>∀a > 0, ∀x ∈ ℝ: <strong>aˣ = e^(x·ln(a))</strong></li>
<li>∀a > 0, a ≠ 1: <strong>log_a(x) = ln(x)/ln(a)</strong></li>
<li><strong>√x = e^(½·ln(x))</strong> لكل x > 0</li>
<li><strong>ⁿ√x = e^((1/n)·ln(x))</strong> لكل x > 0</li>
</ul>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 أمثلة على التبسيط</h3>
<p><strong>1)</strong> بسّط: A = ln(e³) + ln(e⁻²) - ln(√e)</p>
<p>A = 3 + (-2) - ½ = <strong>½</strong></p>
<p><strong>2)</strong> بسّط: B = e^(2ln3 - ln9 + ln1)</p>
<p>B = e^(ln9 - ln9 + 0) = e⁰ = <strong>1</strong></p>
<p><strong>3)</strong> اكتب على شكل eᵏ: C = 8^(1/3) × e²/√e</p>
<p>C = 2 × e² × e^(-½) = 2e^(3/2) = e^(ln2) × e^(3/2) = <strong>e^(ln2 + 3/2)</strong></p>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #1abc9c; margin-top: 0;">✏️ تمارين تطبيقية</h3>
<p><strong>التمرين 1:</strong> بسّط التعابير التالية:</p>
<ol>
<li>ln(e⁵ × √e) - 2ln(e)</li>
<li>e^(3ln2 + ln5)</li>
<li>ln(27)/ln(9)</li>
</ol>
<p><strong>التمرين 2:</strong> حل في ℝ: 3ˣ = 5 (اكتب الحل بدلالة ln)</p>
<p><strong>التمرين 3:</strong> بيّن أن ln(2) + ln(3) + ln(4) + ... + ln(n) = ln(n!)</p>
</div>

</div>' WHERE id = '3174169a-7b73-4f00-90f0-89779cd61636';

-- Lesson 158: Étude de la fonction logarithme népérien
UPDATE lessons SET content = '<div style="font-family: Tajawal, Arial, sans-serif; line-height: 1.8; padding: 20px; direction: rtl;">

<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">📉 دراسة الدالة اللوغاريتمية النيبرية (تعمّق)</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #2980b9; margin-top: 0;">📘 تعريف ودراسة ln</h3>
<p>الدالة اللوغاريتمية النيبرية ln: ]0, +∞[ → ℝ هي الدالة العكسية للدالة الأسية، معرفة بـ:</p>
<p style="text-align: center; font-size: 1.2em; color: #2980b9;"><strong>y = ln(x) ⟺ x = eʸ</strong></p>
<ul>
<li><strong>مجموعة التعريف:</strong> ]0, +∞[</li>
<li><strong>المشتقة:</strong> ln''(x) = 1/x > 0 لكل x > 0</li>
<li><strong>الاطراد:</strong> متزايدة تماماً على ]0, +∞[</li>
<li><strong>ln(1) = 0</strong> ، <strong>ln(e) = 1</strong></li>
</ul>
</div>

<div style="background: #d5a6e6; border-right: 4px solid #8e44ad; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #8e44ad; margin-top: 0;">📐 النهايات المرجعية</h3>
<ul>
<li>lim(x→+∞) ln(x) = <strong>+∞</strong></li>
<li>lim(x→0⁺) ln(x) = <strong>-∞</strong></li>
<li>lim(x→+∞) ln(x)/x = <strong>0</strong> (النمو أبطأ من x)</li>
<li>lim(x→+∞) ln(x)/xⁿ = <strong>0</strong> لكل n > 0</li>
<li>lim(x→0⁺) x·ln(x) = <strong>0</strong></li>
<li>lim(x→0) ln(1+x)/x = <strong>1</strong></li>
</ul>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال: دراسة f(x) = x·ln(x)</h3>
<p><strong>مجموعة التعريف:</strong> ]0, +∞[</p>
<p><strong>النهايات:</strong></p>
<ul>
<li>lim(x→0⁺) x·ln(x) = 0 (شكل عدم تعيين 0 × (-∞))</li>
<li>lim(x→+∞) x·ln(x) = +∞</li>
</ul>
<p><strong>المشتقة:</strong> f''(x) = ln(x) + x·(1/x) = ln(x) + 1</p>
<p>f''(x) = 0 ⟺ ln(x) = -1 ⟺ x = e⁻¹ = 1/e</p>
<p style="color: #e67e22;"><strong>حد أدنى: f(1/e) = (1/e)·(-1) = -1/e ≈ -0.368</strong></p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال: دراسة g(x) = ln(x)/x</h3>
<p><strong>مجموعة التعريف:</strong> ]0, +∞[</p>
<p><strong>g''(x) = (1 - ln(x))/x²</strong></p>
<p>g''(x) = 0 ⟺ ln(x) = 1 ⟺ x = e</p>
<p>حد أقصى: g(e) = 1/e</p>
<p>lim(x→+∞) g(x) = 0 ، lim(x→0⁺) g(x) = -∞</p>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #1abc9c; margin-top: 0;">✏️ تمارين تطبيقية</h3>
<p><strong>التمرين 1:</strong> ادرس الدالة f(x) = (ln(x))² دراسة كاملة</p>
<p><strong>التمرين 2:</strong> ادرس الدالة g(x) = ln(x²+1) وحدد المقاربات والقيم القصوى</p>
<p><strong>التمرين 3:</strong> أثبت أن المعادلة x·ln(x) = 2 تقبل حلاً وحيداً في ]1, +∞[</p>
</div>

</div>' WHERE id = '36158834-0f10-4976-90e5-24be7b0b2ee5';

-- Lesson 159: Fonction logarithme décimal
UPDATE lessons SET content = '<div style="font-family: Tajawal, Arial, sans-serif; line-height: 1.8; padding: 20px; direction: rtl;">

<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">🔢 الدالة اللوغاريتمية العشرية (تعمّق)</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #2980b9; margin-top: 0;">📘 تعريف</h3>
<p>اللوغاريتم العشري (log أو log₁₀) هو اللوغاريتم ذو الأساس 10:</p>
<p style="text-align: center; font-size: 1.2em; color: #2980b9;"><strong>log(x) = ln(x)/ln(10)</strong></p>
<p>بمعنى: log(x) = y ⟺ 10ʸ = x</p>
</div>

<div style="background: #d5a6e6; border-right: 4px solid #8e44ad; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #8e44ad; margin-top: 0;">📐 خصائص اللوغاريتم العشري</h3>
<ul>
<li><strong>log(1) = 0</strong> لأن 10⁰ = 1</li>
<li><strong>log(10) = 1</strong> لأن 10¹ = 10</li>
<li><strong>log(10ⁿ) = n</strong> لكل n ∈ ℤ</li>
<li><strong>log(xy) = log(x) + log(y)</strong></li>
<li><strong>log(x/y) = log(x) - log(y)</strong></li>
<li><strong>log(xⁿ) = n·log(x)</strong></li>
<li><strong>log(x) = ln(x)/ln(10) ≈ ln(x)/2.3026</strong></li>
</ul>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 تطبيقات اللوغاريتم العشري</h3>
<p><strong>1) مقياس ريشتر (الزلازل):</strong></p>
<p>M = log(A/A₀) حيث A شدة الزلزال و A₀ شدة مرجعية</p>
<p>زلزال بقوة 7 أقوى بـ 10 مرات من زلزال بقوة 6</p>
<p><strong>2) شدة الصوت (ديسيبل):</strong></p>
<p>L = 10·log(I/I₀) dB</p>
<p><strong>3) pH في الكيمياء:</strong></p>
<p>pH = -log([H⁺])</p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 أمثلة حسابية</h3>
<p><strong>1)</strong> أوجد عدد أرقام العدد 2¹⁰⁰⁰</p>
<p>log(2¹⁰⁰⁰) = 1000 × log(2) ≈ 1000 × 0.301 = 301</p>
<p>عدد الأرقام = ⌊log(N)⌋ + 1 = 301 + 1 = <strong>302 رقم</strong></p>
<p><strong>2)</strong> حل: log(x) + log(x-3) = 1</p>
<p>log(x(x-3)) = 1 ⟹ x(x-3) = 10 ⟹ x² - 3x - 10 = 0</p>
<p>(x-5)(x+2) = 0 ⟹ x = 5 (نرفض x = -2 لأن x > 3)</p>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #1abc9c; margin-top: 0;">✏️ تمارين تطبيقية</h3>
<p><strong>التمرين 1:</strong> حل المعادلات:</p>
<ol>
<li>log(x²) = 4</li>
<li>log(x) + log(x+21) = 2</li>
<li>2·log(x) - log(x+6) = 0</li>
</ol>
<p><strong>التمرين 2:</strong> محلول حمضي تركيزه [H⁺] = 3.5 × 10⁻⁴ mol/L. أحسب pH هذا المحلول</p>
</div>

</div>' WHERE id = 'cdc7aea9-7d66-4e24-8f14-4331246eaeb1';

-- Lesson 160: Étude de la fonction ln(u)
UPDATE lessons SET content = '<div style="font-family: Tajawal, Arial, sans-serif; line-height: 1.8; padding: 20px; direction: rtl;">

<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">📉 دراسة الدالة ln(u) - مركبة لوغاريتمية (تعمّق)</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #2980b9; margin-top: 0;">📘 الدالة ln(u(x))</h3>
<p>إذا كانت u دالة موجبة تماماً وقابلة للاشتقاق على مجال I، فإن الدالة f(x) = ln(u(x)) قابلة للاشتقاق على I:</p>
<p style="text-align: center; font-size: 1.2em; color: #2980b9;"><strong>f''(x) = u''(x)/u(x)</strong></p>
<p><strong>شرط التعريف:</strong> u(x) > 0</p>
</div>

<div style="background: #d5a6e6; border-right: 4px solid #8e44ad; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #8e44ad; margin-top: 0;">📐 حالات خاصة للمشتقة</h3>
<table style="width: 100%; border-collapse: collapse;">
<tr style="background: #2c3e50; color: white;"><th style="padding: 10px; border: 1px solid #ddd;">الدالة</th><th style="padding: 10px; border: 1px solid #ddd;">المشتقة</th></tr>
<tr><td style="padding: 10px; border: 1px solid #ddd;">ln(ax+b)</td><td style="padding: 10px; border: 1px solid #ddd;">a/(ax+b)</td></tr>
<tr style="background: #f9f9f9;"><td style="padding: 10px; border: 1px solid #ddd;">ln(x²+a)</td><td style="padding: 10px; border: 1px solid #ddd;">2x/(x²+a)</td></tr>
<tr><td style="padding: 10px; border: 1px solid #ddd;">ln|x|</td><td style="padding: 10px; border: 1px solid #ddd;">1/x</td></tr>
<tr style="background: #f9f9f9;"><td style="padding: 10px; border: 1px solid #ddd;">[ln(x)]ⁿ</td><td style="padding: 10px; border: 1px solid #ddd;">n·[ln(x)]ⁿ⁻¹/x</td></tr>
</table>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 1: دراسة f(x) = ln(x² - 4)</h3>
<p><strong>مجموعة التعريف:</strong> x² - 4 > 0 ⟹ x ∈ ]-∞, -2[ ∪ ]2, +∞[</p>
<p><strong>المشتقة:</strong> f''(x) = 2x/(x² - 4)</p>
<p>على ]2, +∞[: f''(x) > 0 ⟹ f متزايدة</p>
<p>على ]-∞, -2[: f''(x) < 0 ⟹ f متناقصة</p>
<p><strong>النهايات:</strong> lim(x→2⁺) f(x) = -∞ ، lim(x→+∞) f(x) = +∞</p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 2: دراسة g(x) = ln((x+1)/(x-1))</h3>
<p><strong>مجموعة التعريف:</strong> (x+1)/(x-1) > 0 ⟹ x ∈ ]-∞, -1[ ∪ ]1, +∞[</p>
<p>g(x) = ln(x+1) - ln(x-1)</p>
<p>g''(x) = 1/(x+1) - 1/(x-1) = -2/(x²-1)</p>
<p>على ]1, +∞[: x²-1 > 0 ⟹ g''(x) < 0 ⟹ g متناقصة</p>
<p>lim(x→+∞) g(x) = ln(1) = 0 ، lim(x→1⁺) g(x) = +∞</p>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #1abc9c; margin-top: 0;">✏️ تمارين تطبيقية</h3>
<p><strong>التمرين 1:</strong> حدد مجموعة تعريف ثم اشتق:</p>
<ol>
<li>f(x) = ln(3x - 7)</li>
<li>g(x) = ln(sin(x))</li>
<li>h(x) = ln(√(x² + 1))</li>
</ol>
<p><strong>التمرين 2:</strong> ادرس الدالة f(x) = ln(x) - x + 1 وبيّن أن ln(x) ≤ x - 1 لكل x > 0</p>
</div>

</div>' WHERE id = 'c620f397-ec7b-41c1-84e1-164e266632e6';

-- Lesson 161: Puissances d''un nombre réel positif
UPDATE lessons SET content = '<div style="font-family: Tajawal, Arial, sans-serif; line-height: 1.8; padding: 20px; direction: rtl;">

<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">🔢 قوى عدد حقيقي موجب (تعمّق)</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #2980b9; margin-top: 0;">📘 تعريف القوى الحقيقية</h3>
<p>لكل عدد حقيقي موجب a > 0 ولكل عدد حقيقي α:</p>
<p style="text-align: center; font-size: 1.2em; color: #2980b9;"><strong>aᵅ = e^(α·ln(a))</strong></p>
<p>هذا التعريف يعمم مفهوم القوى لأي أس حقيقي (وليس فقط الأعداد الصحيحة أو الكسرية).</p>
</div>

<div style="background: #d5a6e6; border-right: 4px solid #8e44ad; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #8e44ad; margin-top: 0;">📐 خصائص القوى</h3>
<p>لكل a, b > 0 ولكل α, β ∈ ℝ:</p>
<ul>
<li><strong>aᵅ × aᵝ = aᵅ⁺ᵝ</strong></li>
<li><strong>aᵅ / aᵝ = aᵅ⁻ᵝ</strong></li>
<li><strong>(aᵅ)ᵝ = aᵅᵝ</strong></li>
<li><strong>(ab)ᵅ = aᵅ × bᵅ</strong></li>
<li><strong>(a/b)ᵅ = aᵅ / bᵅ</strong></li>
<li><strong>a⁰ = 1</strong> ، <strong>a¹ = a</strong></li>
<li><strong>a⁻ᵅ = 1/aᵅ</strong></li>
</ul>
</div>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #2980b9; margin-top: 0;">📘 حالات خاصة مهمة</h3>
<ul>
<li><strong>a^(1/n) = ⁿ√a</strong> (الجذر النوني)</li>
<li><strong>a^(p/q) = ᵍ√(aᵖ)</strong></li>
<li><strong>a^√2</strong> = e^(√2·ln(a)) (قوة غير نسبية)</li>
</ul>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 أمثلة</h3>
<p><strong>1)</strong> احسب 8^(2/3):</p>
<p>8^(2/3) = (2³)^(2/3) = 2² = <strong>4</strong></p>
<p><strong>2)</strong> بسّط: (27)^(1/3) × (4)^(3/2) / (8)^(2/3)</p>
<p>= 3 × 8 / 4 = <strong>6</strong></p>
<p><strong>3)</strong> اشتق f(x) = x^√2 حيث x > 0:</p>
<p>f(x) = e^(√2·ln(x))</p>
<p>f''(x) = (√2/x)·e^(√2·ln(x)) = √2·x^(√2-1)</p>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #1abc9c; margin-top: 0;">✏️ تمارين تطبيقية</h3>
<p><strong>التمرين 1:</strong> بسّط: A = 16^(3/4) ، B = (1/27)^(-2/3) ، C = 5^√3 × 5^(-√3+2)</p>
<p><strong>التمرين 2:</strong> اشتق f(x) = x^π لـ x > 0</p>
<p><strong>التمرين 3:</strong> حل المعادلة 4ˣ - 3·2ˣ + 2 = 0</p>
</div>

</div>' WHERE id = 'c4a4de9a-5268-4781-94f7-5aa3a435a777';

-- Lesson 162: Étude des fonctions x ↦ aˣ et x ↦ ⁿ√x
UPDATE lessons SET content = '<div style="font-family: Tajawal, Arial, sans-serif; line-height: 1.8; padding: 20px; direction: rtl;">

<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">📊 دراسة الدوال x ↦ aˣ و x ↦ ⁿ√x (تعمّق)</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #2980b9; margin-top: 0;">📘 الدالة الأسية ذات الأساس a: x ↦ aˣ</h3>
<p>لكل a > 0 و a ≠ 1: f(x) = aˣ = e^(x·ln(a))</p>
<p><strong>المشتقة:</strong> f''(x) = ln(a)·aˣ</p>
<ul>
<li>إذا <strong>a > 1</strong>: ln(a) > 0 ⟹ f متزايدة تماماً و lim(x→+∞) aˣ = +∞</li>
<li>إذا <strong>0 < a < 1</strong>: ln(a) < 0 ⟹ f متناقصة تماماً و lim(x→+∞) aˣ = 0</li>
</ul>
<p>في جميع الحالات: f(0) = 1 و aˣ > 0 لكل x</p>
</div>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #2980b9; margin-top: 0;">📘 دالة الجذر النوني: x ↦ ⁿ√x = x^(1/n)</h3>
<p>لكل n ∈ ℕ* و x ≥ 0:</p>
<p style="text-align: center; font-size: 1.2em;">g(x) = x^(1/n) = e^((1/n)·ln(x))</p>
<p><strong>المشتقة:</strong> g''(x) = (1/n)·x^(1/n - 1) = 1/(n·x^((n-1)/n))</p>
<ul>
<li>g''(x) > 0 لكل x > 0 ⟹ g متزايدة تماماً</li>
<li>g(0) = 0 ، g(1) = 1</li>
<li>lim(x→+∞) ⁿ√x = +∞</li>
</ul>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال: مقارنة الدوال 2ˣ و 3ˣ و (1/2)ˣ</h3>
<p>عند x = 0: 2⁰ = 3⁰ = (1/2)⁰ = 1 (كلها تمر من النقطة (0,1))</p>
<p>عند x = 2: 2² = 4 ، 3² = 9 ، (1/2)² = 1/4</p>
<p>عند x = -2: 2⁻² = 1/4 ، 3⁻² = 1/9 ، (1/2)⁻² = 4</p>
<p><strong>ملاحظة:</strong> كلما كان الأساس أكبر (وأكبر من 1)، كان النمو أسرع عند +∞</p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال: تطبيق النمو الأسي</h3>
<p>رأسمال بقيمة 10000 دج بفائدة سنوية 5%:</p>
<p>C(n) = 10000 × (1.05)ⁿ</p>
<p>بعد 10 سنوات: C(10) = 10000 × 1.05¹⁰ ≈ 16288.95 دج</p>
<p>لمضاعفة الرأسمال: 1.05ⁿ = 2 ⟹ n = ln(2)/ln(1.05) ≈ 14.2 سنة</p>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #1abc9c; margin-top: 0;">✏️ تمارين تطبيقية</h3>
<p><strong>التمرين 1:</strong> ادرس وارسم منحنيات الدوال 2ˣ و (1/3)ˣ في نفس المعلم</p>
<p><strong>التمرين 2:</strong> ادرس الدالة f(x) = ³√(x² - 1) وحدد مجموعة التعريف والاطراد</p>
<p><strong>التمرين 3:</strong> سكان مدينة يتزايدون بنسبة 3% سنوياً. إذا كان عددهم الحالي 500000، متى يصل إلى مليون؟</p>
</div>

</div>' WHERE id = 'c707cd6b-e066-492e-a673-76577f5a76f5';

-- Lesson 163: Croissance comparée
UPDATE lessons SET content = '<div style="font-family: Tajawal, Arial, sans-serif; line-height: 1.8; padding: 20px; direction: rtl;">

<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">📈 النمو المقارن (تعمّق)</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #2980b9; margin-top: 0;">📘 المبدأ الأساسي</h3>
<p>عند المقارنة بين الدوال الكبيرة نحو +∞، لدينا الترتيب التالي من الأبطأ إلى الأسرع:</p>
<p style="text-align: center; font-size: 1.3em; color: #2980b9;"><strong>ln(x) &lt;&lt; xᵅ (α > 0) &lt;&lt; eˣ</strong></p>
<p>أي: <strong>اللوغاريتم أبطأ من كل قوة، وكل قوة أبطأ من الأسية</strong></p>
</div>

<div style="background: #d5a6e6; border-right: 4px solid #8e44ad; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #8e44ad; margin-top: 0;">📐 النهايات المرجعية للنمو المقارن</h3>
<p><strong>مقارنة exp مع القوى:</strong></p>
<ul>
<li>∀n ∈ ℕ: lim(x→+∞) <strong>eˣ/xⁿ = +∞</strong></li>
<li>∀n ∈ ℕ: lim(x→+∞) <strong>xⁿ·e⁻ˣ = 0</strong></li>
<li>∀n ∈ ℕ: lim(x→-∞) <strong>|x|ⁿ·eˣ = 0</strong></li>
</ul>
<p><strong>مقارنة ln مع القوى:</strong></p>
<ul>
<li>∀α > 0: lim(x→+∞) <strong>ln(x)/xᵅ = 0</strong></li>
<li>∀α > 0: lim(x→0⁺) <strong>xᵅ·|ln(x)| = 0</strong></li>
<li>∀n ∈ ℕ*: lim(x→+∞) <strong>[ln(x)]ⁿ/x = 0</strong></li>
</ul>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 أمثلة على استخدام النمو المقارن</h3>
<p><strong>1)</strong> lim(x→+∞) (eˣ - x³)</p>
<p>= eˣ(1 - x³/eˣ) → +∞ × (1-0) = <strong>+∞</strong></p>

<p><strong>2)</strong> lim(x→+∞) (x² - 3x)e⁻²ˣ</p>
<p>نكتب t = 2x: lim(t→+∞) ((t/2)² - 3t/2)e⁻ᵗ = 0 (القوى × e⁻ᵗ → 0)</p>
<p>النهاية = <strong>0</strong></p>

<p><strong>3)</strong> lim(x→+∞) [ln(x)]²/√x</p>
<p>= [ln(x)]²/x^(1/2) → 0 (اللوغاريتم أبطأ من أي قوة)</p>

<p><strong>4)</strong> lim(x→0⁺) x²·ln(x)</p>
<p>= 0 (القوة تهيمن على ln عند 0⁺)</p>
</div>

<div style="background: #fdedec; border-right: 4px solid #e74c3c; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e74c3c; margin-top: 0;">⚠️ تنبيه مهم</h3>
<p>هذه النهايات صالحة فقط عند +∞ (أو 0⁺ للحالات المخصوصة). لا يمكن استخدامها في حالات أخرى دون تحويل مناسب.</p>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #1abc9c; margin-top: 0;">✏️ تمارين تطبيقية</h3>
<p><strong>التمرين 1:</strong> احسب النهايات:</p>
<ol>
<li>lim(x→+∞) (e²ˣ - x¹⁰)</li>
<li>lim(x→+∞) x⁵·e⁻ˣ</li>
<li>lim(x→0⁺) √x·ln(x)</li>
<li>lim(x→+∞) [ln(x)]³/x²</li>
</ol>
<p><strong>التمرين 2:</strong> ادرس النهايات عند +∞ للدالة f(x) = x - ln(x) وبيّن أن x يهيمن</p>
</div>

</div>' WHERE id = '687454b4-0011-4a99-adaa-1cc1d84f1ada';

-- Lesson 164: Primitives
UPDATE lessons SET content = '<div style="font-family: Tajawal, Arial, sans-serif; line-height: 1.8; padding: 20px; direction: rtl;">

<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">∫ الدوال الأصلية (تعمّق)</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #2980b9; margin-top: 0;">📘 تعريف</h3>
<p>نقول إن F دالة أصلية (primitive) للدالة f على مجال I إذا:</p>
<p style="text-align: center; font-size: 1.2em; color: #2980b9;"><strong>∀x ∈ I: F''(x) = f(x)</strong></p>
<p>إذا كانت F دالة أصلية لـ f على I، فإن كل الدوال الأصلية لـ f هي من الشكل <strong>F(x) + C</strong> حيث C ∈ ℝ</p>
</div>

<div style="background: #d5a6e6; border-right: 4px solid #8e44ad; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #8e44ad; margin-top: 0;">📐 جدول الدوال الأصلية الأساسية</h3>
<table style="width: 100%; border-collapse: collapse;">
<tr style="background: #2c3e50; color: white;"><th style="padding: 10px; border: 1px solid #ddd;">f(x)</th><th style="padding: 10px; border: 1px solid #ddd;">F(x)</th><th style="padding: 10px; border: 1px solid #ddd;">المجال</th></tr>
<tr><td style="padding: 10px; border: 1px solid #ddd;">k (ثابت)</td><td style="padding: 10px; border: 1px solid #ddd;">kx + C</td><td style="padding: 10px; border: 1px solid #ddd;">ℝ</td></tr>
<tr style="background: #f9f9f9;"><td style="padding: 10px; border: 1px solid #ddd;">xⁿ (n ≠ -1)</td><td style="padding: 10px; border: 1px solid #ddd;">xⁿ⁺¹/(n+1) + C</td><td style="padding: 10px; border: 1px solid #ddd;">ℝ أو ]0,+∞[</td></tr>
<tr><td style="padding: 10px; border: 1px solid #ddd;">1/x</td><td style="padding: 10px; border: 1px solid #ddd;">ln|x| + C</td><td style="padding: 10px; border: 1px solid #ddd;">ℝ*</td></tr>
<tr style="background: #f9f9f9;"><td style="padding: 10px; border: 1px solid #ddd;">eˣ</td><td style="padding: 10px; border: 1px solid #ddd;">eˣ + C</td><td style="padding: 10px; border: 1px solid #ddd;">ℝ</td></tr>
<tr><td style="padding: 10px; border: 1px solid #ddd;">cos(x)</td><td style="padding: 10px; border: 1px solid #ddd;">sin(x) + C</td><td style="padding: 10px; border: 1px solid #ddd;">ℝ</td></tr>
<tr style="background: #f9f9f9;"><td style="padding: 10px; border: 1px solid #ddd;">sin(x)</td><td style="padding: 10px; border: 1px solid #ddd;">-cos(x) + C</td><td style="padding: 10px; border: 1px solid #ddd;">ℝ</td></tr>
<tr><td style="padding: 10px; border: 1px solid #ddd;">1/cos²(x)</td><td style="padding: 10px; border: 1px solid #ddd;">tan(x) + C</td><td style="padding: 10px; border: 1px solid #ddd;">]-π/2, π/2[</td></tr>
<tr style="background: #f9f9f9;"><td style="padding: 10px; border: 1px solid #ddd;">1/√x</td><td style="padding: 10px; border: 1px solid #ddd;">2√x + C</td><td style="padding: 10px; border: 1px solid #ddd;">]0, +∞[</td></tr>
</table>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال: إيجاد الدالة الأصلية المحققة لشرط</h3>
<p>أوجد F الدالة الأصلية لـ f(x) = 3x² - 2x + 1 التي تحقق F(1) = 5</p>
<p>F(x) = x³ - x² + x + C</p>
<p>F(1) = 1 - 1 + 1 + C = 5 ⟹ C = 4</p>
<p style="color: #e67e22;"><strong>F(x) = x³ - x² + x + 4</strong></p>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #1abc9c; margin-top: 0;">✏️ تمارين تطبيقية</h3>
<p><strong>التمرين 1:</strong> أوجد الدوال الأصلية:</p>
<ol>
<li>f(x) = 4x³ - 6x + 2</li>
<li>g(x) = 3eˣ + 2/x</li>
<li>h(x) = 2cos(x) - 3sin(x)</li>
</ol>
<p><strong>التمرين 2:</strong> أوجد F أصلية f(x) = 1/x² + √x بحيث F(1) = 0</p>
</div>

</div>' WHERE id = 'be29691d-353f-41cd-aed8-013de57b9f3b';

-- Lesson 165: Calcul de primitives
UPDATE lessons SET content = '<div style="font-family: Tajawal, Arial, sans-serif; line-height: 1.8; padding: 20px; direction: rtl;">

<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">∫ حساب الدوال الأصلية (تعمّق)</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #2980b9; margin-top: 0;">📘 أصليات الدوال المركبة</h3>
<p>إذا كانت u دالة قابلة للاشتقاق:</p>
<table style="width: 100%; border-collapse: collapse;">
<tr style="background: #2c3e50; color: white;"><th style="padding: 10px; border: 1px solid #ddd;">f(x)</th><th style="padding: 10px; border: 1px solid #ddd;">F(x)</th></tr>
<tr><td style="padding: 10px; border: 1px solid #ddd;">u''·uⁿ (n ≠ -1)</td><td style="padding: 10px; border: 1px solid #ddd;">uⁿ⁺¹/(n+1) + C</td></tr>
<tr style="background: #f9f9f9;"><td style="padding: 10px; border: 1px solid #ddd;">u''/u</td><td style="padding: 10px; border: 1px solid #ddd;">ln|u| + C</td></tr>
<tr><td style="padding: 10px; border: 1px solid #ddd;">u''·eᵘ</td><td style="padding: 10px; border: 1px solid #ddd;">eᵘ + C</td></tr>
<tr style="background: #f9f9f9;"><td style="padding: 10px; border: 1px solid #ddd;">u''·cos(u)</td><td style="padding: 10px; border: 1px solid #ddd;">sin(u) + C</td></tr>
<tr><td style="padding: 10px; border: 1px solid #ddd;">u''·sin(u)</td><td style="padding: 10px; border: 1px solid #ddd;">-cos(u) + C</td></tr>
<tr style="background: #f9f9f9;"><td style="padding: 10px; border: 1px solid #ddd;">u''/(2√u)</td><td style="padding: 10px; border: 1px solid #ddd;">√u + C</td></tr>
</table>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 1: أصلية من الشكل u''/u</h3>
<p>أوجد أصلية f(x) = (6x + 2)/(3x² + 2x + 1)</p>
<p>نضع u(x) = 3x² + 2x + 1 ⟹ u''(x) = 6x + 2</p>
<p>f(x) هي من الشكل u''/u</p>
<p style="color: #e67e22;"><strong>F(x) = ln(3x² + 2x + 1) + C</strong></p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 2: أصلية أسية مركبة</h3>
<p>أوجد أصلية g(x) = (4x - 2)·e^(2x²-2x)</p>
<p>نضع u(x) = 2x² - 2x ⟹ u''(x) = 4x - 2</p>
<p>g(x) = u''(x)·eᵘ</p>
<p style="color: #e67e22;"><strong>G(x) = e^(2x²-2x) + C</strong></p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 3: تعديل المعامل</h3>
<p>أوجد أصلية h(x) = x·e^(x²)</p>
<p>نضع u = x² ⟹ u'' = 2x ⟹ x = u''/2</p>
<p>h(x) = (1/2)·2x·e^(x²) = (1/2)·u''·eᵘ</p>
<p style="color: #e67e22;"><strong>H(x) = (1/2)·e^(x²) + C</strong></p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 4: أصلية مثلثية</h3>
<p>أوجد أصلية k(x) = cos(3x + π/4)</p>
<p>u = 3x + π/4 ⟹ u'' = 3</p>
<p>k(x) = (1/3)·3·cos(u) = (1/3)·u''·cos(u)</p>
<p style="color: #e67e22;"><strong>K(x) = (1/3)·sin(3x + π/4) + C</strong></p>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #1abc9c; margin-top: 0;">✏️ تمارين تطبيقية</h3>
<p><strong>التمرين 1:</strong> أوجد أصليات الدوال:</p>
<ol>
<li>f(x) = x²·e^(x³)</li>
<li>g(x) = sin(x)·cos²(x)</li>
<li>h(x) = x/√(x²+1)</li>
<li>k(x) = (2x+1)/(x²+x+3)²</li>
</ol>
<p><strong>التمرين 2:</strong> أوجد F أصلية f(x) = e^(2x)·sin(e^(2x)) بحيث F(0) = cos(1)</p>
</div>

</div>' WHERE id = 'cfeb7aff-6213-4380-aa95-40ff8166a8b1';
