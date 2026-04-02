-- =====================================================
-- Terminale - Batch 8/13
-- Covers: الدوال المستمرة والرتيبة، الاشتقاقية، الدوال المثلثية، الأسية، اللوغاريتمية
-- Lessons 106-120 of 181
-- =====================================================

-- 106) Fonctions continues et strictement monotones - الدوال المستمرة والرتيبة قطعاً
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الدوال المستمرة والرتيبة قطعاً</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. مبرهنة القيم الوسطية (TVI)</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 مبرهنة:</strong> إذا f مستمرة على [a,b] و k عدد بين f(a) و f(b):<br/>
⟹ ∃c ∈ [a,b]: f(c) = k<br/><br/>
<strong>حالة خاصة:</strong> إذا f(a)·f(b) &lt; 0 ⟹ ∃c ∈ ]a,b[: f(c) = 0
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. مبرهنة التقابل (البيجكسيون)</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 مبرهنة:</strong> إذا f مستمرة ورتيبة قطعاً على [a,b]:<br/>
⟹ f تحقق تقابلاً من [a,b] إلى [f(a),f(b)] (أو [f(b),f(a)])<br/>
⟹ ∀k ∈ [f(a),f(b)]، المعادلة f(x) = k لها حل وحيد
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = x³ + x - 1 على ℝ<br/>
f متزايدة قطعاً (f''(x) = 3x²+1 &gt; 0)<br/>
f(0) = -1, f(1) = 1 ⟹ ∃!α ∈ ]0,1[: f(α) = 0<br/>
f(0.68) ≈ -0.005 &lt; 0, f(0.69) ≈ 0.018 &gt; 0 ⟹ α ≈ 0.68
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) بيّن أن x³ - 3x + 1 = 0 تقبل 3 حلول وحصرها<br/>
2) بيّن أن eˣ = 2x + 1 تقبل حلاً وحيداً موجباً<br/>
3) حدد عدد حلول sin(x) = x/3
</div>
</div>' WHERE id = 'cf63dff3-bbc5-479e-a063-7936131f9022';

-- 107) Dérivabilité - الاشتقاقية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الاشتقاقية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريف المشتقة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> f قابلة للاشتقاق في a ⟺ النهاية التالية موجودة ومنتهية:<br/>
f''(a) = lim(x→a) [f(x)-f(a)]/(x-a) = lim(h→0) [f(a+h)-f(a)]/h
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. التفسير الهندسي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌</strong><br/>
f''(a) = ميل المماس لـ (Cf) في النقطة (a, f(a))<br/>
معادلة المماس: y = f''(a)(x-a) + f(a)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. الاشتقاقية والاستمرارية</h3>

<div style="background: #fdedec; padding: 15px; border-right: 4px solid #e74c3c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e74c3c;">⚠️ خاصية مهمة:</strong><br/>
f قابلة للاشتقاق في a ⟹ f مستمرة في a<br/>
<strong>العكس غير صحيح:</strong> f(x) = |x| مستمرة في 0 لكن غير قابلة للاشتقاق
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = √x في x = 0<br/>
lim(h→0⁺) [√h - 0]/h = lim 1/√h = +∞ ⟹ f غير قابلة للاشتقاق في 0<br/>
(المنحنى له مماس عمودي في 0)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) ادرس اشتقاقية f(x) = |x-1| في x = 1<br/>
2) أوجد f''(2) لـ f(x) = x³ باستعمال التعريف<br/>
3) هل f(x) = x·|x| قابلة للاشتقاق في 0؟
</div>
</div>' WHERE id = 'a62f4b1f-e06b-4514-aca2-2e8e158c4750';

-- 108) Dérivées et opérations - المشتقات والعمليات
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المشتقات والعمليات</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المشتقات الأساسية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 جدول المشتقات:</strong><br/>
<table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
<tr style="background: #2c3e50; color: white;"><th style="padding: 8px; border: 1px solid #ddd;">f(x)</th><th style="padding: 8px;">f''(x)</th></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">xⁿ</td><td style="padding: 8px;">nxⁿ⁻¹</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">1/x</td><td style="padding: 8px;">-1/x²</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">√x</td><td style="padding: 8px;">1/(2√x)</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">eˣ</td><td style="padding: 8px;">eˣ</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">ln(x)</td><td style="padding: 8px;">1/x</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">sin(x)</td><td style="padding: 8px;">cos(x)</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">cos(x)</td><td style="padding: 8px;">-sin(x)</td></tr>
</table>
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. قواعد العمليات</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐</strong><br/>
• (u+v)'' = u'' + v''<br/>
• (ku)'' = ku''<br/>
• (uv)'' = u''v + uv''<br/>
• (u/v)'' = (u''v - uv'')/v²<br/>
• (u∘v)'' = v''·(u''∘v) أو بالتحديد: [f(g(x))]'' = g''(x)·f''(g(x))
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> اشتق:<br/>
1) f(x) = (2x+1)/(x²-3)<br/>
2) g(x) = e^(x²+1)<br/>
3) h(x) = ln(sin(x))<br/>
4) k(x) = x²·√(x+1)
</div>
</div>' WHERE id = 'af7a114f-7a6a-4a9e-b57c-b06f5b10dfad';

-- 109) Sens de variation d'une fonction - اتجاه تغير دالة
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">اتجاه تغير دالة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المبرهنة الأساسية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 مبرهنة:</strong> f قابلة للاشتقاق على ]a,b[<br/>
• f''(x) &gt; 0 على ]a,b[ ⟹ f متزايدة قطعاً على [a,b]<br/>
• f''(x) &lt; 0 على ]a,b[ ⟹ f متناقصة قطعاً على [a,b]<br/>
• f''(x) = 0 على ]a,b[ ⟹ f ثابتة على [a,b]
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. جدول التغيرات</h3>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = x³ - 3x + 1<br/>
f''(x) = 3x² - 3 = 3(x-1)(x+1)<br/>
f''(x) = 0 ⟹ x = -1 أو x = 1<br/>
f(-1) = 3 (قيمة عظمى محلية)<br/>
f(1) = -1 (قيمة صغرى محلية)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. القيم الحدية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 شروط القيمة الحدية:</strong><br/>
α نقطة حدية ⟺ f''(α) = 0 مع تغير إشارة f'' عند α<br/>
• + → - : قيمة عظمى محلية<br/>
• - → + : قيمة صغرى محلية
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) أنشئ جدول التغيرات لـ f(x) = 2x³ - 9x² + 12x - 4<br/>
2) أوجد القيم الحدية لـ g(x) = x·e⁻ˣ<br/>
3) بيّن أن h(x) = x + sin(x) متزايدة قطعاً على ℝ
</div>
</div>' WHERE id = 'bac11588-0685-498f-af92-460307f03352';

-- 110) Approximation affine - Méthode d'Euler - التقريب الخطي وطريقة أويلر
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">التقريب الخطي وطريقة أويلر</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التقريب الخطي</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغة:</strong> عندما x قريب من a:<br/>
f(x) ≈ f(a) + f''(a)(x-a)<br/>
(هذا هو المماس: أفضل تقريب خطي للدالة قرب a)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ تقريبات مشهورة عند x ≈ 0:</strong><br/>
• (1+x)ⁿ ≈ 1 + nx<br/>
• eˣ ≈ 1 + x<br/>
• ln(1+x) ≈ x<br/>
• sin(x) ≈ x<br/>
• cos(x) ≈ 1 - x²/2<br/>
<strong>مثال:</strong> √(1.02) = (1+0.02)^(1/2) ≈ 1 + 0.01 = 1.01 (القيمة الدقيقة: 1.00995...)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. طريقة أويلر</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 المبدأ:</strong> لحل y'' = f(x,y) مع y(x₀) = y₀ عددياً:<br/>
xₙ₊₁ = xₙ + h (h: خطوة)<br/>
yₙ₊₁ = yₙ + h·f(xₙ, yₙ)<br/>
<strong>الفكرة:</strong> نستبدل المنحنى بخطوط مماسة متتالية
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) قرّب √(4.1) باستعمال التقريب الخطي (a = 4)<br/>
2) قرّب e^(0.1) و ln(1.05)<br/>
3) حل y'' = y, y(0) = 1 بطريقة أويلر بخطوة h = 0.1 لإيجاد y(0.3)
</div>
</div>' WHERE id = 'a087d1bb-cdf4-410d-ba66-60a30f25bf27';

-- 111) Étude de fonction trigonométrique - دراسة دالة مثلثية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">دراسة دالة مثلثية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تذكير: الدوال المثلثية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 خواص:</strong><br/>
• sin, cos دورية بدور 2π و tan دورية بدور π<br/>
• sin زوجية: sin(-x) = -sin(x)، cos فردية: cos(-x) = cos(x)<br/>
• sin''(x) = cos(x), cos''(x) = -sin(x), tan''(x) = 1 + tan²(x) = 1/cos²(x)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. خطوات دراسة f(x) = a·sin(bx + c) + d</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 </strong><br/>
• الدور: T = 2π/|b|<br/>
• السعة: |a|<br/>
• نكتفي بدراسة فترة واحدة بطول T<br/>
• نستغل التناظر والدورية لتبسيط الدراسة
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = 2sin(x) - cos(x)<br/>
f(x) = √5·sin(x - φ) حيث tan(φ) = 1/2<br/>
f''(x) = 2cos(x) + sin(x) = 0 ⟹ tan(x) = -2<br/>
القيمة العظمى: √5 والقيمة الصغرى: -√5
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) ادرس f(x) = sin(2x) + cos(2x) على [0, π]<br/>
2) أوجد القيم الحدية لـ g(x) = cos²(x) - sin(x) على [0, 2π]<br/>
3) حل المعادلة 2sin(x) + cos(x) = 1 على [0, 2π]
</div>
</div>' WHERE id = '35df967b-2549-4fdd-8e49-7bab940948e3';

-- 112) Fonction exponentielle - الدالة الأسية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الدالة الأسية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريف الدالة الأسية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> الدالة الأسية exp هي الدالة الوحيدة المعرّفة على ℝ التي تحقق:<br/>
exp''(x) = exp(x) و exp(0) = 1<br/>
نكتب: eˣ = exp(x), e ≈ 2.718
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الخواص الجبرية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قواعد:</strong><br/>
• eᵃ⁺ᵇ = eᵃ × eᵇ<br/>
• eᵃ⁻ᵇ = eᵃ/eᵇ<br/>
• (eᵃ)ⁿ = eⁿᵃ<br/>
• eˣ &gt; 0 لكل x ∈ ℝ<br/>
• eˣ = eʸ ⟺ x = y<br/>
• ln(eˣ) = x و e^(ln(x)) = x (x &gt; 0)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong><br/>
بسّط: e²ˣ × e³ˣ = e⁵ˣ<br/>
حل: eˣ = 5 ⟹ x = ln(5)<br/>
حل: e²ˣ - 3eˣ + 2 = 0 بوضع t = eˣ: t² - 3t + 2 = 0 ⟹ t = 1 أو t = 2
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) بسّط: (e³ˣ × e⁻²ˣ)/eˣ<br/>
2) حل: e²ˣ - 5eˣ + 6 = 0<br/>
3) حل المتراجحة: eˣ &gt; 3
</div>
</div>' WHERE id = '3b07c9a2-d6b4-40fc-bd4f-1bae5837c0d7';

-- 113) Fonctions exponentielles x ↦ e^x - الدوال الأسية x ↦ eˣ
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الدوال الأسية من الشكل aˣ</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريف aˣ</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> لكل a &gt; 0:<br/>
aˣ = e^(x·ln(a))<br/>
<strong>خاصية:</strong> (aˣ)'' = ln(a)·aˣ
</div>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 خواص aˣ:</strong><br/>
• aˣ⁺ʸ = aˣ·aʸ<br/>
• (aˣ)ⁿ = aⁿˣ<br/>
• (a·b)ˣ = aˣ·bˣ<br/>
• إذا a &gt; 1: aˣ متزايدة<br/>
• إذا 0 &lt; a &lt; 1: aˣ متناقصة
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> النمو الأسي: N(t) = N₀ × 2^(t/T)<br/>
حيث T = فترة المضاعفة<br/>
N''(t) = N₀·(ln2/T)·2^(t/T)<br/>
<strong>تطبيق:</strong> N₀ = 1000, T = 3h ⟹ N(6) = 1000 × 2² = 4000
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) حل: 3ˣ = 81 و 2ˣ = 0.5<br/>
2) ادرس تغيرات f(x) = (0.5)ˣ ومثّل بيانياً<br/>
3) رأس مال: C(t) = 5000 × (1.05)ᵗ. بعد كم سنة يتضاعف؟
</div>
</div>' WHERE id = 'f61f9ff0-9ff6-45a9-81b1-7aebf676a4e6';

-- 114) Étude de la fonction exponentielle - دراسة الدالة الأسية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">دراسة الدالة الأسية eˣ</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. خواص الدالة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌</strong><br/>
• مجال التعريف: ℝ<br/>
• مجال القيم: ]0, +∞[<br/>
• exp''(x) = eˣ &gt; 0 ⟹ متزايدة قطعاً على ℝ<br/>
• lim(x→+∞) eˣ = +∞<br/>
• lim(x→-∞) eˣ = 0 ⟹ y = 0 مقارب أفقي
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. التزايد المقارن</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 نهايات مهمة:</strong><br/>
• lim(x→+∞) eˣ/xⁿ = +∞ (eˣ تهيمن على أي كثير حدود)<br/>
• lim(x→-∞) xⁿ·eˣ = 0<br/>
• lim(x→+∞) x·e⁻ˣ = 0
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ تطبيق:</strong> ادرس f(x) = (x-1)eˣ<br/>
• Df = ℝ<br/>
• f''(x) = eˣ + (x-1)eˣ = x·eˣ<br/>
• f''(x) = 0 ⟹ x = 0, f(0) = -1 (صغرى)<br/>
• lim(-∞) = 0 (مقارب y=0)، lim(+∞) = +∞
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) ادرس ومثّل f(x) = x²·e⁻ˣ<br/>
2) احسب lim(x→+∞) (x² + 1)/eˣ<br/>
3) بيّن أن المعادلة (x-1)eˣ = 0 تقبل حلاً وحيداً
</div>
</div>' WHERE id = '2e19286f-3bc5-43c2-9b9c-681614ed957c';

-- 115) Étude de la fonction exp(u) - دراسة الدالة e^(u(x))
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">دراسة الدالة e^(u(x))</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الاشتقاق</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قاعدة:</strong><br/>
[e^(u(x))]'' = u''(x) × e^(u(x))<br/><br/>
<strong>ملاحظة:</strong> إشارة [e^u]'' = إشارة u''<br/>
(لأن e^u &gt; 0 دائماً)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ أمثلة:</strong><br/>
• f(x) = e^(x²) ⟹ f''(x) = 2x·e^(x²)<br/>
• g(x) = e^(-3x+1) ⟹ g''(x) = -3·e^(-3x+1)<br/>
• h(x) = e^(sin(x)) ⟹ h''(x) = cos(x)·e^(sin(x))
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. دراسة شاملة</h3>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال شامل:</strong> f(x) = e^(1-x²)<br/>
• Df = ℝ<br/>
• f''(x) = -2x·e^(1-x²)<br/>
• f''(x) = 0 ⟹ x = 0, f(0) = e (عظمى)<br/>
• lim(±∞) = e^(-∞) = 0<br/>
• f(1) = f(-1) = 1 (f زوجية)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) ادرس f(x) = e^(2x-x²) (تعريف، اشتقاق، تغيرات، نهايات)<br/>
2) بيّن أن f(x) = x·e^(1/x) لها مقارب مائل عند +∞<br/>
3) حل f''(x) = 0 لـ f(x) = e^(x³-3x)
</div>
</div>' WHERE id = '4fb9e091-1844-4219-8221-2d4b4c462c86';

-- 116) Fonction logarithme népérien - الدالة اللوغاريتم النيبيري
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الدالة اللوغاريتم النيبيري</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> ln هي الدالة العكسية للدالة الأسية:<br/>
y = ln(x) ⟺ x = eʸ (x &gt; 0)<br/>
• ln(1) = 0, ln(e) = 1<br/>
• ln(eˣ) = x و e^(ln(x)) = x
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الخواص الجبرية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قواعد:</strong><br/>
• ln(ab) = ln(a) + ln(b) (a,b &gt; 0)<br/>
• ln(a/b) = ln(a) - ln(b)<br/>
• ln(aⁿ) = n·ln(a)<br/>
• ln(√a) = ln(a)/2<br/>
• ln(x) &gt; 0 ⟺ x &gt; 1<br/>
• ln(x) &lt; 0 ⟺ 0 &lt; x &lt; 1
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong><br/>
بسّط: ln(8) = ln(2³) = 3ln(2)<br/>
حل: ln(x) + ln(x-1) = ln(6) ⟹ ln(x(x-1)) = ln(6) ⟹ x² - x - 6 = 0<br/>
⟹ x = 3 (مقبول) أو x = -2 (مرفوض)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) بسّط: ln(12) - 2ln(2) + ln(3)<br/>
2) حل: 2ln(x) - ln(x+2) = 0<br/>
3) حل: e^(2ln(x)) = 9
</div>
</div>' WHERE id = '156423a6-53a8-49b3-815b-f77e79068c27';

-- 117) Propriétés algébriques - الخواص الجبرية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الخواص الجبرية لـ ln و exp</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. العلاقة بين ln و exp</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 تحويلات:</strong><br/>
• eˣ = a ⟺ x = ln(a) (a &gt; 0)<br/>
• ln(x) = a ⟺ x = eᵃ<br/>
• eˣ &gt; a ⟺ x &gt; ln(a)<br/>
• ln(x) &gt; a ⟺ x &gt; eᵃ (x &gt; 0)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. حل المعادلات والمتراجحات</h3>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ أمثلة:</strong><br/>
<strong>1) معادلات أسية:</strong><br/>
2ˣ = 5 ⟹ x·ln(2) = ln(5) ⟹ x = ln(5)/ln(2)<br/><br/>
<strong>2) معادلات لوغاريتمية:</strong><br/>
ln(2x+1) = ln(x) + ln(3) ⟹ 2x+1 = 3x ⟹ x = 1<br/><br/>
<strong>3) متراجحات:</strong><br/>
eˣ ≤ 1/e ⟹ eˣ ≤ e⁻¹ ⟹ x ≤ -1
</div>

<div style="background: #fdedec; padding: 15px; border-right: 4px solid #e74c3c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e74c3c;">⚠️ أخطاء شائعة:</strong><br/>
• ln(a+b) ≠ ln(a) + ln(b)<br/>
• ln(a²) = 2ln(|a|) (وليس 2ln(a) إلا إذا a &gt; 0)<br/>
• eᵃ⁺ᵇ ≠ eᵃ + eᵇ
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) حل: 3ˣ⁺¹ = 5ˣ⁻²<br/>
2) حل: ln(x²-1) ≤ ln(3)<br/>
3) حل الجملة: eˣ⁺ʸ = 6 و eˣ⁻ʸ = 2/3
</div>
</div>' WHERE id = 'b2355fef-207e-45cb-9efb-01a4eb211013';

-- 118) Étude de la fonction logarithme népérien - دراسة الدالة اللوغاريتم النيبيري
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">دراسة الدالة اللوغاريتم النيبيري</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. خواص الدالة ln</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌</strong><br/>
• مجال التعريف: ]0, +∞[<br/>
• (ln)''(x) = 1/x &gt; 0 ⟹ متزايدة قطعاً<br/>
• lim(x→0⁺) ln(x) = -∞ (مقارب عمودي x = 0)<br/>
• lim(x→+∞) ln(x) = +∞
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. التزايد المقارن</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 نهايات مهمة:</strong><br/>
• lim(x→+∞) ln(x)/x = 0 (ln تنمو أبطأ من x)<br/>
• lim(x→+∞) ln(x)/xⁿ = 0 (n &gt; 0)<br/>
• lim(x→0⁺) x·ln(x) = 0<br/>
• lim(x→0⁺) xⁿ·ln(x) = 0 (n &gt; 0)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ تطبيق:</strong> ادرس f(x) = x·ln(x) - x على ]0,+∞[<br/>
f''(x) = ln(x) + 1 - 1 = ln(x)<br/>
f''(x) = 0 ⟹ x = 1, f(1) = -1 (صغرى)<br/>
lim(0⁺) = 0, lim(+∞) = +∞
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) ادرس ومثّل f(x) = ln(x)/x على ]0,+∞[<br/>
2) احسب lim(x→+∞) [ln(x)]²/x<br/>
3) بيّن أن eˣ ≥ x + 1 لكل x ∈ ℝ
</div>
</div>' WHERE id = '931aee2b-f00b-4dd7-98d4-698856019a61';

-- 119) Fonction logarithme décimal - الدالة اللوغاريتم العشري
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الدالة اللوغاريتم العشري</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong><br/>
log₁₀(x) = ln(x)/ln(10) (x &gt; 0)<br/>
أو: log₁₀(x) = y ⟺ 10ʸ = x<br/><br/>
<strong>قيم مرجعية:</strong><br/>
log(1) = 0, log(10) = 1, log(100) = 2, log(0.1) = -1
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الخواص</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 نفس خواص ln:</strong><br/>
• log(ab) = log(a) + log(b)<br/>
• log(a/b) = log(a) - log(b)<br/>
• log(aⁿ) = n·log(a)<br/>
• log(x) = ln(x)/ln(10) ≈ ln(x)/2.302
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. تطبيقات</h3>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️</strong><br/>
• <strong>الأس الهيدروجيني:</strong> pH = -log([H⁺])<br/>
• <strong>شدة الصوت (ديسيبل):</strong> L = 10·log(I/I₀)<br/>
• <strong>مقياس ريختر:</strong> M = log(A/A₀)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احسب log(500) و log(0.02) بدلالة log(2)و log(5)<br/>
2) محلول حمضي pH = 3. أوجد تركيز [H⁺]<br/>
3) بكم ديسيبل يزداد صوت إذا تضاعفت شدته؟
</div>
</div>' WHERE id = '4a95cdde-a02d-4610-b1d2-f018990b685e';

-- 120) Puissances d'un nombre réel positif - قوى عدد حقيقي موجب
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">قوى عدد حقيقي موجب</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريف aᵅ (α حقيقي)</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> لكل a &gt; 0 و α ∈ ℝ:<br/>
aᵅ = e^(α·ln(a))<br/><br/>
<strong>حالات خاصة:</strong><br/>
• a^(1/n) = ⁿ√a (الجذر النوني)<br/>
• a^(p/q) = ᵠ√(aᵖ)<br/>
• a⁰ = 1, a¹ = a
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. قواعد الحساب</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قواعد (a,b &gt; 0):</strong><br/>
• aᵅ × aᵝ = aᵅ⁺ᵝ<br/>
• aᵅ/aᵝ = aᵅ⁻ᵝ<br/>
• (aᵅ)ᵝ = aᵅᵝ<br/>
• (ab)ᵅ = aᵅ·bᵅ<br/>
• ln(aᵅ) = α·ln(a)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. الدالة القوة x ↦ xᵅ</h3>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ </strong><br/>
f(x) = xᵅ معرّفة على ]0,+∞[<br/>
f''(x) = α·xᵅ⁻¹<br/>
• α &gt; 0: f متزايدة<br/>
• α &lt; 0: f متناقصة<br/>
<strong>مثال:</strong> f(x) = x^(3/2) ⟹ f''(x) = (3/2)·x^(1/2) = (3/2)·√x
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) بسّط: 8^(2/3) و 27^(-1/3) و 16^(3/4)<br/>
2) اشتق f(x) = x^π<br/>
3) حل: x^(3/2) = 8
</div>
</div>' WHERE id = '27378671-5a16-4b21-910a-2da82095ed48';
