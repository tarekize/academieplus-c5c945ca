-- =====================================================
-- Seconde (2ème Année Secondaire) - Batch 8/12
-- Covers: المرجح (suite) + الدوال العددية (شعبة 4) + كثيرات الحدود + الإشتقاقية
-- Lessons 106-120 of 177
-- =====================================================

-- 106) إحداثيات مرجح ثلاث نقاط
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">إحداثيات مرجح ثلاث نقاط</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. صيغة الإحداثيات</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 G مرجح {(A,α);(B,β);(C,γ)}:</strong><br/>
x_G = (α·xₐ + β·x_B + γ·x_C) / (α+β+γ)<br/>
y_G = (α·yₐ + β·y_B + γ·y_C) / (α+β+γ)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> A(1,-1), B(3,5), C(-2,4), أوزان (2,3,1)<br/>
x_G = (2×1+3×3+1×(-2))/(2+3+1) = (2+9-2)/6 = 9/6 = 3/2<br/>
y_G = (2×(-1)+3×5+1×4)/6 = (-2+15+4)/6 = 17/6
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. تطبيقات هندسية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 مجموعات نقاط:</strong><br/>
• ‖αMA⃗+βMB⃗+γMC⃗‖ = k ⟺ (α+β+γ)‖MG⃗‖ = k → دائرة مركزها G<br/>
• αMA⃗+βMB⃗+γMC⃗ = 0⃗ ⟺ M = G (نقطة وحيدة)<br/>
• αMA²+βMB²+γMC² = k → دائرة أو ∅ (حسب k)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> A(0,0), B(4,0), C(2,4)<br/>
1) أوجد إحداثيات مركز الثقل G<br/>
2) أوجد مرجح {(A,1);(B,2);(C,3)}<br/>
3) حدد مجموعة M حيث ‖MA⃗+2MB⃗+3MC⃗‖ = 12
</div>
</div>' WHERE id = '0a872920-7d44-4050-a78a-cc4519acd78a';

-- 107) مرجح عدة نقاط
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">مرجح عدة نقاط</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعميم لـ n نقطة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> G مرجح {(A₁,α₁);...;(Aₙ,αₙ)} حيث Σαᵢ ≠ 0:<br/>
α₁GA₁⃗ + α₂GA₂⃗ + ... + αₙGAₙ⃗ = 0⃗<br/>
OG⃗ = Σ(αᵢOAᵢ⃗) / Σαᵢ
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. التجميع الجزئي</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 خاصية:</strong> يمكن تقسيم النقاط إلى مجموعتين:<br/>
• نوجد I مرجح المجموعة الأولى (وزنه = مجموع أوزانها)<br/>
• نوجد J مرجح المجموعة الثانية (وزنه = مجموع أوزانها)<br/>
• G = مرجح {(I, مجموع 1); (J, مجموع 2)}
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. تطبيق: معادلة مجموعة نقاط</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 لتحديد مجموعة E = {M: Σαᵢ·MAᵢ² = k}:</strong><br/>
نستعمل: Σαᵢ·MAᵢ² = (Σαᵢ)·MG² + Σαᵢ·GAᵢ²<br/>
⟹ E دائرة مركزها G  (إذا الشرط محقق)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> A(0,0), B(4,0), C(4,4), D(0,4)<br/>
1) أوجد مرجح {(A,1);(B,2);(C,1);(D,2)} باستعمال التجميع<br/>
2) حدد E = {M: MA²+2MB²+MC²+2MD² = 50}
</div>
</div>' WHERE id = '60590487-c3e2-4e17-9e0e-3755abdb4dae';

-- 108) تذكير حول الدوال (شعبة 4)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">تذكير حول الدوال</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. مفهوم الدالة العددية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> دالة عددية f: D → ℝ تربط كل عدد x ∈ D بعدد وحيد f(x)<br/>
• D = مجموعة التعريف<br/>
• f(x) = صورة x بالدالة f<br/>
• السابق: x بحيث f(x) = y
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. خواص الدوال</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 الزوجية والفردية:</strong><br/>
• f زوجية: f(-x) = f(x) → تماثل محوري (محور الرتيبات)<br/>
• f فردية: f(-x) = -f(x) → تماثل مركزي (المبدأ)
</div>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 اتجاه التغير:</strong><br/>
• f متزايدة على I: x₁ &lt; x₂ ⟹ f(x₁) &lt; f(x₂)<br/>
• f متناقصة على I: x₁ &lt; x₂ ⟹ f(x₁) &gt; f(x₂)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) حدد مجموعة تعريف: f(x) = √(x²-4), g(x) = 1/(x²-1)<br/>
2) ادرس الزوجية: h(x) = x³+x, k(x) = |x|+x²<br/>
3) ادرس اتجاه تغير f(x) = 2x-3 على ℝ
</div>
</div>' WHERE id = 'c773743b-fa76-4c5f-8a1c-1fcba687ad0b';

-- 109) الدوال المرجعية (شعبة 4)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الدوال المرجعية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الدوال الأساسية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<table style="width:100%; border-collapse: collapse; text-align: center;">
<tr style="background: #2c3e50; color: white;">
<td style="padding:8px; border:1px solid #ddd;">الدالة</td><td style="border:1px solid #ddd;">D</td><td style="border:1px solid #ddd;">التغير</td><td style="border:1px solid #ddd;">التماثل</td></tr>
<tr><td style="border:1px solid #ddd;">f(x) = x²</td><td style="border:1px solid #ddd;">ℝ</td><td style="border:1px solid #ddd;">↘ ]-∞,0] ↗ [0,+∞[</td><td style="border:1px solid #ddd;">زوجية</td></tr>
<tr style="background:#f5f5f5;"><td style="border:1px solid #ddd;">f(x) = x³</td><td style="border:1px solid #ddd;">ℝ</td><td style="border:1px solid #ddd;">↗ على ℝ</td><td style="border:1px solid #ddd;">فردية</td></tr>
<tr><td style="border:1px solid #ddd;">f(x) = 1/x</td><td style="border:1px solid #ddd;">ℝ*</td><td style="border:1px solid #ddd;">↘ على كل مجال</td><td style="border:1px solid #ddd;">فردية</td></tr>
<tr style="background:#f5f5f5;"><td style="border:1px solid #ddd;">f(x) = √x</td><td style="border:1px solid #ddd;">[0,+∞[</td><td style="border:1px solid #ddd;">↗</td><td style="border:1px solid #ddd;">-</td></tr>
<tr><td style="border:1px solid #ddd;">f(x) = |x|</td><td style="border:1px solid #ddd;">ℝ</td><td style="border:1px solid #ddd;">↘ ]-∞,0] ↗ [0,+∞[</td><td style="border:1px solid #ddd;">زوجية</td></tr>
</table>
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. المنحنيات المرجعية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 معرفة شكل كل منحنى مهمة لاستعمالها كأساس للتحويلات</strong>
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) ارسم منحنيات الدوال المرجعية الخمس<br/>
2) باستعمال المقارنة: رتب x², x³, √x, x لـ x ∈ ]0,1[ ثم x &gt; 1
</div>
</div>' WHERE id = '26223f8b-f0ba-4035-9484-44ee3cdcded3';

-- 110) عمليات على الدوال (شعبة 4)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">عمليات على الدوال</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. العمليات الحسابية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 (f+g)(x) = f(x)+g(x)</strong> → D_{f+g} = D_f ∩ D_g<br/>
<strong>(f·g)(x) = f(x)·g(x)</strong> → D_{fg} = D_f ∩ D_g<br/>
<strong>(f/g)(x) = f(x)/g(x)</strong> → D_{f/g} = D_f ∩ D_g \ {x: g(x)=0}<br/>
<strong>(kf)(x) = k·f(x)</strong>
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. التركيب</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 (g∘f)(x) = g(f(x)):</strong><br/>
نحسب أولاً f(x)، ثم نطبق g على النتيجة<br/>
D_{g∘f} = {x ∈ D_f : f(x) ∈ D_g}
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = 2x+1, g(x) = x²<br/>
(g∘f)(x) = g(2x+1) = (2x+1)² = 4x²+4x+1<br/>
(f∘g)(x) = f(x²) = 2x²+1<br/>
ملاحظة: g∘f ≠ f∘g
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> f(x) = x-1, g(x) = √x, h(x) = 1/x<br/>
1) أوجد D و صيغة: g∘f, f∘g, h∘f<br/>
2) اكتب k(x) = √(x²+1) كتركيب دالتين
</div>
</div>' WHERE id = '7de769d4-bcf4-4994-8c06-f87123183f2c';

-- 111) إتجاه التغير (شعبة 4)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">إتجاه التغير</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الطريقة الجبرية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 لإثبات أن f متزايدة على I:</strong><br/>
لكل x₁, x₂ ∈ I: x₁ &lt; x₂ ⟹ f(x₁) &lt; f(x₂)<br/>
أي ندرس إشارة f(x₂) - f(x₁) عندما x₂ - x₁ &gt; 0
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. تأثير العمليات</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قواعد:</strong><br/>
• f متزايدة و k &gt; 0 ⟹ kf متزايدة<br/>
• f متزايدة و k &lt; 0 ⟹ kf متناقصة<br/>
• f و g متزايدتان + موجبتان ⟹ fg متزايدة<br/>
• f متزايدة وموجبة ⟹ 1/f متناقصة
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. تأثير التركيب</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 g∘f:</strong><br/>
• f و g بنفس الاتجاه ⟹ g∘f متزايدة<br/>
• f و g باتجاهين مختلفين ⟹ g∘f متناقصة
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) ادرس اتجاه تغير f(x) = -3/(x+1) على ]−1,+∞[<br/>
2) g(x) = √(5-2x). ادرس اتجاه التغير<br/>
3) h(x) = x² - 4x + 5. أنشئ جدول التغيرات
</div>
</div>' WHERE id = '76944939-80b3-4e3c-96f4-1080d893db20';

-- 112) التمثيل البياني (شعبة 4)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">التمثيل البياني</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تحويلات المنحنيات</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 الانسحاب:</strong><br/>
• y = f(x) + k: انسحاب عمودي بـ k<br/>
• y = f(x-h): انسحاب أفقي بـ h<br/><br/>
<strong>التماثل والضرب:</strong><br/>
• y = -f(x): تماثل محوري (أفقي)<br/>
• y = f(-x): تماثل محوري (عمودي)<br/>
• y = af(x): تمدد عمودي بمعامل |a|
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. من جدول التغيرات إلى المنحنى</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 الخطوات:</strong><br/>
1) علّم النقاط الخاصة (حدود، تقاطعات)<br/>
2) احترم اتجاه التغير في كل مجال<br/>
3) صل النقاط بمنحنى أملس
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> انطلاقاً من y = x²:<br/>
• y = (x-2)² + 3: قطع مكافئ رأسه (2,3)<br/>
• y = -x² + 1: قطع مكافئ مفتوح للأسفل رأسه (0,1)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) ارسم g(x) = |x-2| + 1 انطلاقاً من y = |x|<br/>
2) ارسم h(x) = -(x+1)² + 4<br/>
3) حدد f إذا منحناها يُحصل من y = 1/x بانسحاب (1,2)
</div>
</div>' WHERE id = '3fde44de-14d0-42d9-b39f-2b63564d8c18';

-- 113) عمليات على كثيرات الحدود (شعبة 4)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">عمليات على كثيرات الحدود</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الجمع والضرب</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 الجمع:</strong> جمع المعاملات ذات القوة نفسها<br/>
<strong>الضرب:</strong> ضرب كل حد من P بكل حد من Q ثم تجميع الحدود المتشابهة
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> P(x) = 2x² - x + 3, Q(x) = x² + 2x - 1<br/>
P + Q = 3x² + x + 2<br/>
P × Q = 2x⁴ + 4x³ - 2x² - x³ - 2x² + x + 3x² + 6x - 3<br/>
= 2x⁴ + 3x³ - x² + 7x - 3
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. القسمة الإقليدية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 P = Q × H + R حيث deg R &lt; deg Q</strong><br/>
مبرهنة الباقي: باقي قسمة P(x) على (x-a) يساوي P(a)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) أجرِ القسمة: (2x³-3x²+x-1) ÷ (x-2)<br/>
2) أوجد باقي قسمة x⁴-2x+1 على x+1<br/>
3) بيّن أن (x-1) قاسم لـ P(x) = x³-3x²+3x-1
</div>
</div>' WHERE id = '9c8e2140-e30d-4628-a3fe-9c389fcb4868';

-- 114) المعادلات من الدرجة الثانية (شعبة 4)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المعادلات من الدرجة الثانية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الصيغة العامة</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 ax² + bx + c = 0, a ≠ 0:</strong><br/>
Δ = b² - 4ac<br/>
• Δ &gt; 0: x = (-b ± √Δ)/(2a) حلان مختلفان<br/>
• Δ = 0: x₀ = -b/(2a) حل مضاعف<br/>
• Δ &lt; 0: لا حلول في ℝ
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الشكل القانوني</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 ax² + bx + c = a[(x + b/(2a))² - Δ/(4a²)]</strong><br/>
الرأس: S(-b/(2a), -Δ/(4a))
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> 2x² - 8x + 6 = 0<br/>
Δ = 64 - 48 = 16, √Δ = 4<br/>
x₁ = (8-4)/4 = 1, x₂ = (8+4)/4 = 3
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) حل: x² + 6x + 9 = 0 و 2x² - 5x - 3 = 0<br/>
2) اكتب الشكل القانوني: f(x) = -x² + 4x - 7<br/>
3) أوجد m لكي x² - 2mx + m + 2 = 0 يقبل حلين
</div>
</div>' WHERE id = 'dfe134ce-e3f3-418d-943c-5bfbcf79df1a';

-- 115) المتراجحات من الدرجة الثانية (شعبة 4)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المتراجحات من الدرجة الثانية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. إشارة ثلاثية الحدود</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قاعدة:</strong><br/>
• Δ &lt; 0: إشارة a دائماً<br/>
• Δ = 0: إشارة a مع انعدام في x₀<br/>
• Δ &gt; 0: إشارة a خارج الجذرين، عكسها بينهما
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> حل x² - 5x + 4 ≤ 0<br/>
Δ = 25-16 = 9 &gt; 0, x₁ = 1, x₂ = 4, a = 1 &gt; 0<br/>
خارج [1,4]: موجب, داخل [1,4]: سالب أو 0<br/>
S = [1, 4]
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. متراجحة جداء/حاصل</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 طريقة:</strong> جدول إشارة كل عامل، ثم إشارة الجداء
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) حل: -x² + 2x + 3 &gt; 0<br/>
2) حل: (x-1)(x²-4) ≤ 0<br/>
3) حل: (x²-x-2)/(x²-9) ≥ 0
</div>
</div>' WHERE id = 'd183fd16-f84c-405b-9c51-e7d1571cc4a5';

-- 116) العدد المشتق (شعبة 4)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">العدد المشتق</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. معدل التغير والعدد المشتق</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 تعريف:</strong><br/>
f′(a) = lim(h→0) [f(a+h) - f(a)] / h<br/>
= lim(x→a) [f(x) - f(a)] / (x - a)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = x² + 3x, حساب f′(2):<br/>
[f(2+h)-f(2)]/h = [(2+h)²+3(2+h) - 10]/h = [4+4h+h²+6+3h-10]/h<br/>
= (7h+h²)/h = 7+h → f′(2) = 7
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. المعنى الهندسي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 f′(a) = ميل المماس لمنحنى f في النقطة (a, f(a))</strong><br/>
معادلة المماس: y = f′(a)(x - a) + f(a)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احسب f′(1) لـ f(x) = 1/x باستعمال التعريف<br/>
2) أوجد معادلة المماس لـ g(x) = x² - x عند x = 2<br/>
3) أوجد النقاط حيث ميل المماس يساوي 3 لـ h(x) = x² + x
</div>
</div>' WHERE id = 'cf4eacb6-8790-4183-9be0-ab7867f091c0';

-- 117) مماس لمنحن عند نقطة (شعبة 4)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">مماس لمنحنى عند نقطة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. معادلة المماس</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 y = f′(a)(x - a) + f(a)</strong><br/>
حيث: f′(a) = ميل المماس، (a, f(a)) = نقطة التماس
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = x³ - x, المماس عند x = 1:<br/>
f(1) = 0, f′(x) = 3x² - 1, f′(1) = 2<br/>
y = 2(x - 1) + 0 = 2x - 2
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. حالات خاصة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 مماس أفقي:</strong> f′(a) = 0 → y = f(a)<br/>
<strong>مماس مع ميل معين m:</strong> نحل f′(a) = m
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. مماسات من نقطة خارجية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 نقطة M(α,β) خارج المنحنى:</strong><br/>
نكتب β = f′(t)(α-t)+f(t) ونحل بالنسبة لـ t<br/>
كل حل يعطي مماساً يمر بـ M
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> f(x) = x² + 1<br/>
1) أوجد معادلة المماس عند x = -1<br/>
2) أوجد النقاط حيث المماس أفقي<br/>
3) كم مماساً يمر بالنقطة (0, -3)؟
</div>
</div>' WHERE id = '8800e8fc-a602-4065-b506-ef4cbd4221d7';

-- 118) التقريب التآلفي لدالة (شعبة 4)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">التقريب التآلفي لدالة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المبدأ</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 الصيغة:</strong><br/>
f(x) ≈ f(a) + f′(a)(x - a) لـ x قريب من a<br/>
أي: قيم الدالة تُقرَّب بقيم المماس
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. تقريبات مفيدة (بجوار 0)</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 لـ x قريب من 0:</strong><br/>
• (1+x)ⁿ ≈ 1 + nx<br/>
• √(1+x) ≈ 1 + x/2<br/>
• 1/(1+x) ≈ 1 - x
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ تطبيقات عملية:</strong><br/>
• √(9.02) = 3√(1+0.02/9) ≈ 3(1 + 0.001) ≈ 3.003<br/>
• (2.01)⁴ = 2⁴(1+0.005)⁴ ≈ 16(1+0.02) = 16.32
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) قرّب √(26) باستعمال a = 25<br/>
2) قرّب 1/0.98<br/>
3) دائرة نصف قطرها 5.1cm. قرّب المساحة باستعمال a = 5
</div>
</div>' WHERE id = '49d2aff8-5821-447f-b62d-7ffc7ef7065e';

-- 119) الدالة المشتقة لدالة (شعبة 4)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الدالة المشتقة لدالة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. جدول المشتقات الأساسية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<table style="width:100%; border-collapse: collapse; text-align: center;">
<tr style="background: #2c3e50; color: white;">
<td style="padding:8px; border:1px solid #ddd;">f(x)</td><td style="border:1px solid #ddd;">f′(x)</td></tr>
<tr><td style="border:1px solid #ddd;">k (ثابت)</td><td style="border:1px solid #ddd;">0</td></tr>
<tr style="background:#f5f5f5;"><td style="border:1px solid #ddd;">xⁿ</td><td style="border:1px solid #ddd;">nxⁿ⁻¹</td></tr>
<tr><td style="border:1px solid #ddd;">1/x</td><td style="border:1px solid #ddd;">-1/x²</td></tr>
<tr style="background:#f5f5f5;"><td style="border:1px solid #ddd;">√x</td><td style="border:1px solid #ddd;">1/(2√x)</td></tr>
</table>
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. قواعد الاشتقاق</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 (kf)′ = kf′, (f+g)′ = f′+g′</strong><br/>
(fg)′ = f′g + fg′<br/>
(f/g)′ = (f′g - fg′)/g²
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ أمثلة:</strong><br/>
• (x⁴ - 3x + 1)′ = 4x³ - 3<br/>
• [(x+1)(x²)]′ = x² + 2x(x+1) = 3x² + 2x<br/>
• [x/(x²+1)]′ = (x²+1-2x²)/(x²+1)² = (1-x²)/(x²+1)²
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> اشتق:<br/>
1) f(x) = 2x⁴ - x³ + 5x - 3<br/>
2) g(x) = (3x+2)/(x-1)<br/>
3) h(x) = (x²+1)·√x
</div>
</div>' WHERE id = '25564932-76fd-44a9-86ee-a48df31a56ca';

-- 120) عمليات على الدوال المشتقة (شعبة 4)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">عمليات على الدوال المشتقة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. مشتقة التركيب</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 (g∘f)′(x) = f′(x) · g′(f(x))</strong><br/><br/>
حالات مفيدة:<br/>
• [f(x)]ⁿ → n·f′(x)·[f(x)]ⁿ⁻¹<br/>
• 1/f(x) → -f′(x)/[f(x)]²<br/>
• √(f(x)) → f′(x) / [2√(f(x))]
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ أمثلة:</strong><br/>
• [(2x+1)³]′ = 2·3(2x+1)² = 6(2x+1)²<br/>
• [1/(x²+1)]′ = -2x/(x²+1)²<br/>
• [√(3x-2)]′ = 3/(2√(3x-2))
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. المشتقة الثانية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 f″(x) = (f′)′(x):</strong> مشتقة الدالة المشتقة<br/>
فائدتها: دراسة تحدب المنحنى ونقاط الانعطاف
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> اشتق:<br/>
1) f(x) = (x²-3x+1)⁴<br/>
2) g(x) = √(x²+4)<br/>
3) h(x) = 1/(2x-5)³<br/>
4) أوجد f″ لـ f(x) = x⁴ - 2x²
</div>
</div>' WHERE id = '3e747c58-739a-43f0-b2f0-af1791556125';
