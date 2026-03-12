-- =====================================================
-- Seconde (2ème Année Secondaire) - Batch 3/12
-- Covers: المتتاليات (fin) + المرجح في المستوي + النسب المئوية + الإحصاء
-- Lessons 31-45 of 177
-- =====================================================

-- 31) نهاية متتالية هندسية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">نهاية متتالية هندسية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. نهاية qⁿ</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 مبرهنة:</strong><br/>
• إذا |q| &lt; 1 (أي -1 &lt; q &lt; 1): lim(n→+∞) qⁿ = 0<br/>
• إذا q = 1: lim(n→+∞) qⁿ = 1<br/>
• إذا q &gt; 1: lim(n→+∞) qⁿ = +∞<br/>
• إذا q ≤ -1: qⁿ ليس لها نهاية (تتذبذب)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. نهاية متتالية هندسية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 نتيجة:</strong> إذا كانت (uₙ) متتالية هندسية بحيث uₙ = u₀ × qⁿ:<br/>
• |q| &lt; 1: lim uₙ = 0 (المتتالية تتقارب نحو 0)<br/>
• q &gt; 1 و u₀ &gt; 0: lim uₙ = +∞<br/>
• q &gt; 1 و u₀ &lt; 0: lim uₙ = -∞
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 1:</strong> uₙ = 5 × (0.7)ⁿ<br/>
|q| = 0.7 &lt; 1 ⟹ lim uₙ = 5 × 0 = 0
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 2:</strong> uₙ = 3 × 2ⁿ<br/>
q = 2 &gt; 1 و u₀ = 3 &gt; 0 ⟹ lim uₙ = +∞
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. نهاية مجموع متتالية هندسية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 إذا |q| &lt; 1:</strong><br/>
lim(n→+∞) Sₙ = lim u₀(1-qⁿ⁺¹)/(1-q) = u₀/(1-q)<br/>
(المجموع اللانهائي)<br/><br/>
<strong>حالة خاصة:</strong> 1 + q + q² + ... = 1/(1-q) إذا |q| &lt; 1
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) أوجد نهاية uₙ = 100 × (0.9)ⁿ<br/>
2) احسب المجموع: S = 1 + 1/2 + 1/4 + 1/8 + ...<br/>
3) كرة ترتد عن الأرض وتصل في كل مرة إلى 3/4 ارتفاعها السابق. إذا أُسقطت من ارتفاع 4m، ما المسافة الكلية التي تقطعها؟
</div>
</div>' WHERE id = '8062a5fd-d910-4f0b-bc2e-352dec2cca1a';

-- 32) تذكير حول الأشعة (المرجح في المستوي)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">تذكير حول الأشعة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. مفهوم الشعاع</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> الشعاع AB⃗ يتميز بـ:<br/>
• <strong>الاتجاه:</strong> اتجاه المستقيم (AB)<br/>
• <strong>المنحى:</strong> من A إلى B<br/>
• <strong>الطويلة (الطول):</strong> المسافة AB = ‖AB⃗‖
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. إحداثيات شعاع</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 في معلم (O, i⃗, j⃗):</strong> إذا A(xₐ, yₐ) و B(x_b, y_b) فإن:<br/>
AB⃗ = (x_b - xₐ, y_b - yₐ)<br/>
‖AB⃗‖ = √[(x_b - xₐ)² + (y_b - yₐ)²]
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. العمليات على الأشعة</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 القواعد:</strong><br/>
• u⃗(x₁, y₁) + v⃗(x₂, y₂) = (x₁+x₂, y₁+y₂)<br/>
• k·u⃗(x, y) = (kx, ky)<br/>
• u⃗ = v⃗ ⟺ نفس الإحداثيات<br/>
• علاقة شال: AB⃗ + BC⃗ = AC⃗
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> A(1, 3) و B(4, -1) و C(2, 5)<br/>
AB⃗ = (3, -4)، AC⃗ = (1, 2)<br/>
AB⃗ + AC⃗ = (4, -2)<br/>
‖AB⃗‖ = √(9+16) = 5
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">4. التوازي والتعامد</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 خواص:</strong><br/>
• u⃗ ∥ v⃗ ⟺ x₁y₂ - x₂y₁ = 0 (المحدد = 0)<br/>
• u⃗ ⊥ v⃗ ⟺ x₁x₂ + y₁y₂ = 0 (الجداء السلمي = 0)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> في معلم متعامد ومتجانس: A(2,1), B(5,3), C(3,5)<br/>
1) احسب إحداثيات AB⃗ و AC⃗<br/>
2) هل (AB) و (AC) متعامدان؟<br/>
3) احسب مساحة المثلث ABC
</div>
</div>' WHERE id = '6bb4ba56-24a0-441b-ae35-60f3a0cd39eb';

-- 33) مرجح نقطتين
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">مرجح نقطتين</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> لتكن A و B نقطتان وα و β عددان حقيقيان حيث α + β ≠ 0.<br/>
مرجح الجملة {(A, α), (B, β)} هو النقطة G الوحيدة التي تحقق:<br/>
<strong>α·GA⃗ + β·GB⃗ = 0⃗</strong>
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. إحداثيات المرجح</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغة:</strong> إذا A(xₐ, yₐ) و B(x_b, y_b):<br/>
G = ((αxₐ + βx_b)/(α+β), (αyₐ + βy_b)/(α+β))
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 1:</strong> A(1, 3) و B(5, -1) بالمعاملين α = 2 و β = 3<br/>
x_G = (2×1 + 3×5)/(2+3) = 17/5<br/>
y_G = (2×3 + 3×(-1))/(2+3) = 3/5<br/>
G(17/5, 3/5)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. حالات خاصة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 حالات:</strong><br/>
• α = β: المرجح هو منتصف [AB]<br/>
• α = 1, β = 0: المرجح هو A نفسها<br/>
• G دائماً ينتمي إلى المستقيم (AB)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">4. خاصية التجميع</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 خاصية:</strong> لكل نقطة M في المستوي:<br/>
α·MA⃗ + β·MB⃗ = (α+β)·MG⃗<br/>
حيث G مرجح {(A,α), (B,β)}.
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) أوجد مرجح {(A(2,4), 3), (B(6,0), 1)}<br/>
2) أوجد مجموعة النقاط M حيث ‖2MA⃗ + 3MB⃗‖ = 10<br/>
3) أثبت أن G منتصف [AB] إذا وفقط إذا كان α = β
</div>
</div>' WHERE id = 'a5602322-869c-4b5e-b546-564fa6cac544';

-- 34) مرجح ثلاث نقاط
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">مرجح ثلاث نقاط</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> مرجح الجملة {(A,α), (B,β), (C,γ)} حيث α+β+γ ≠ 0 هو النقطة G التي تحقق:<br/>
<strong>α·GA⃗ + β·GB⃗ + γ·GC⃗ = 0⃗</strong>
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الإحداثيات</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغة:</strong><br/>
x_G = (αxₐ + βx_b + γx_c)/(α+β+γ)<br/>
y_G = (αyₐ + βy_b + γy_c)/(α+β+γ)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> A(0,0), B(6,0), C(0,6) بالمعاملات α=β=γ=1<br/>
G = ((0+6+0)/3, (0+0+6)/3) = (2, 2)<br/>
هذا هو مركز ثقل المثلث (تقاطع المتوسطات).
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. خاصية التجميع</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 خاصية:</strong><br/>
• لكل نقطة M: α·MA⃗ + β·MB⃗ + γ·MC⃗ = (α+β+γ)·MG⃗<br/>
• يمكن تجميع نقطتين وحساب مرجحهما أولاً ثم دمجه مع النقطة الثالثة
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">4. مركز ثقل المثلث</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 خاصية:</strong> مركز ثقل المثلث ABC هو مرجح {(A,1), (B,1), (C,1)}:<br/>
G = ((xₐ+x_b+x_c)/3, (yₐ+y_b+y_c)/3)<br/>
وهو تقاطع المتوسطات الثلاث.
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) أوجد مرجح {(A(1,2), 2), (B(3,4), 1), (C(5,0), 3)}<br/>
2) أوجد مركز ثقل المثلث الذي رؤوسه A(0,3), B(6,1), C(2,7)<br/>
3) حل المعادلة الشعاعية: 2MA⃗ + MB⃗ - 3MC⃗ = 0⃗
</div>
</div>' WHERE id = '900f1bb4-6f61-45af-825c-f0a2a22ad6b6';

-- 35) إحداثيات مرجح ثلاث نقاط
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">إحداثيات مرجح ثلاث نقاط</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الصيغة التحليلية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغة شاملة:</strong> إحداثيات مرجح {(A(xₐ,yₐ), α), (B(x_b,y_b), β), (C(x_c,y_c), γ)}:<br/>
x_G = (α·xₐ + β·x_b + γ·x_c) / (α + β + γ)<br/>
y_G = (α·yₐ + β·y_b + γ·y_c) / (α + β + γ)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال تطبيقي:</strong> A(1,-1), B(3,5), C(-2,4) مع α=2, β=3, γ=1<br/>
x_G = (2×1 + 3×3 + 1×(-2))/(2+3+1) = (2+9-2)/6 = 9/6 = 3/2<br/>
y_G = (2×(-1) + 3×5 + 1×4)/(2+3+1) = (-2+15+4)/6 = 17/6<br/>
G(3/2, 17/6)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. تطبيقات هندسية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 نقاط خاصة في المثلث ABC:</strong><br/>
• <strong>مركز الثقل:</strong> مرجح {(A,1),(B,1),(C,1)} → G = ((xₐ+x_b+x_c)/3, ...)<br/>
• <strong>منتصف [AB]:</strong> مرجح {(A,1),(B,1)} → I = ((xₐ+x_b)/2, ...)<br/>
• <strong>نقطة تقسم [AB] بنسبة k:</strong> مرجح {(A,1-k),(B,k)}
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. مجموعة النقاط ‖αMA⃗ + βMB⃗ + γMC⃗‖ = k</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 خاصية:</strong> بوجود G المرجح:<br/>
‖αMA⃗ + βMB⃗ + γMC⃗‖ = k ⟺ ‖(α+β+γ)MG⃗‖ = k ⟺ MG = k/|α+β+γ|<br/>
هذه دائرة مركزها G ونصف قطرها k/|α+β+γ|.
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> A(0,0), B(4,0), C(2,4)<br/>
1) أوجد G مرجح {(A,1),(B,2),(C,3)}<br/>
2) عيّن مجموعة النقاط M حيث ‖MA⃗ + 2MB⃗ + 3MC⃗‖ = 12<br/>
3) حدد طبيعة ومميزات هذه المجموعة
</div>
</div>' WHERE id = '578c313b-1136-4463-a71d-873db7ff9529';

-- 36) مرجح عدة نقاط
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">مرجح عدة نقاط</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف العام</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> مرجح الجملة {(A₁,α₁), (A₂,α₂), ..., (Aₙ,αₙ)} حيث Σαᵢ ≠ 0 هو النقطة G التي تحقق:<br/>
α₁·GA₁⃗ + α₂·GA₂⃗ + ... + αₙ·GAₙ⃗ = 0⃗<br/><br/>
<strong>الإحداثيات:</strong><br/>
x_G = (Σαᵢxᵢ)/(Σαᵢ)، y_G = (Σαᵢyᵢ)/(Σαᵢ)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. خاصية التجميع الجزئي</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 مبرهنة:</strong> يمكن تجميع مجموعة جزئية واستبدالها بمرجحها مع مجموع معاملاتها.<br/>
مثال: مرجح {(A,α),(B,β),(C,γ),(D,δ)} يُحسب بـ:<br/>
1) G₁ = مرجح {(A,α),(B,β)} بمعامل (α+β)<br/>
2) G = مرجح {(G₁,α+β),(C,γ),(D,δ)}
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. تطبيقات</h3>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> أوجد مرجح {(A(0,0),1), (B(4,0),1), (C(4,4),1), (D(0,4),1)}<br/>
x_G = (0+4+4+0)/4 = 2, y_G = (0+0+4+4)/4 = 2<br/>
G(2,2): مركز المربع ABCD
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) أوجد مرجح 4 نقاط A(1,0), B(3,2), C(5,4), D(1,6) بمعاملات 2,1,3,2<br/>
2) استعمل التجميع الجزئي لتبسيط: 2MA⃗ + MB⃗ + 3MC⃗ + 2MD⃗
</div>
</div>' WHERE id = 'a92ae0b3-5dab-4a43-ac73-bff600b08e7a';

-- 37) نسبة الجزء إِلى الكلّ (النسب المئوية والمؤشرات)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">نسبة الجزء إلى الكلّ</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. النسبة المئوية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> النسبة المئوية t% تعني t من كل 100، أي الكسر t/100.<br/>
نسبة الجزء P من الكل T هي: p = P/T أو بالنسبة المئوية: p% = (P/T) × 100
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 1:</strong> في قسم من 40 تلميذاً، 12 منهم يدرسون الرياضيات.<br/>
النسبة المئوية = 12/40 × 100 = 30%
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. حساب الجزء من النسبة</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغ:</strong><br/>
• الجزء = الكل × (النسبة/100)<br/>
• الكل = الجزء / (النسبة/100)<br/>
• النسبة = (الجزء/الكل) × 100
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 2:</strong> 15% من تلاميذ مدرسة (600 تلميذ) يمارسون الرياضة.<br/>
عدد الرياضيين = 600 × 15/100 = 90 تلميذاً
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. جمع النسب المئوية</h3>

<div style="background: #fdedec; padding: 15px; border-right: 4px solid #e74c3c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e74c3c;">⚠️ تنبيه:</strong> لا يمكن جمع نسب مئوية إلا إذا كانت محسوبة بالنسبة لنفس الكل.<br/>
30% من الأولاد + 20% من البنات ≠ 50% من التلاميذ!
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) 35% من سكان مدينة (200000) هم شباب. كم عدد الشباب؟<br/>
2) في مصنع 450 عاملاً: 180 نساء. ما نسبة النساء؟<br/>
3) تخفيض 20% على سلعة بـ 5000 دج. ما الثمن الجديد؟
</div>
</div>' WHERE id = 'b942f15c-6090-40e3-b805-6fd85473d40d';

-- 38) النسبة المئوية لنسبة مئوية أخرى
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">النسبة المئوية لنسبة مئوية أخرى</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. نسبة مئوية مركبة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 مبدأ:</strong> أخذ p% من q% من كمية يعني: ضرب الكمية بـ (p/100) × (q/100)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> 40% من تلاميذ مدرسة (500) ذكور. 30% من الذكور يمارسون كرة القدم.<br/>
عدد الذكور = 500 × 0.4 = 200<br/>
عدد الذكور الذين يمارسون كرة القدم = 200 × 0.3 = 60<br/>
أي: 0.4 × 0.3 = 0.12 = 12% من تلاميذ المدرسة
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. النسبة المئوية الإجمالية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قاعدة:</strong> p% من q% = (p × q)/100 %<br/>
مثال: 25% من 60% = (25 × 60)/100 % = 15%
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. النسبة المئوية بتقسيم مجموعة</h3>

<p>عند تقسيم مجموعة إلى فئات، يجب حساب نسبة كل فئة بالنسبة للمجموعة الكلية، وليس بالنسبة لفئة فرعية.</p>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> مؤسسة 1000 موظف: 60% ذكور. من الذكور 25% مهندسون. من الإناث 40% مهندسات.<br/>
ذكور = 600، منهم مهندسون = 150<br/>
إناث = 400، منهن مهندسات = 160<br/>
نسبة المهندسين الكلية = (150 + 160)/1000 = 31%
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) 70% من تلاميذ مدرسة ناجحون. 60% من الناجحين بمعدل أكبر من 12. ما نسبة من معدلهم أكبر من 12 من مجموع التلاميذ؟<br/>
2) مصنع ينتج 3 أنواع: A (50%), B (30%), C (20%). نسب العيوب: A: 2%, B: 5%, C: 3%. ما نسبة المنتجات المعيبة إجمالاً؟
</div>
</div>' WHERE id = '63794fd7-292f-4a10-b262-ff484d0d48fa';

-- 39) التطورات والنسب المئوية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">التطورات والنسب المئوية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. نسبة التطور (التغير)</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> نسبة التطور بين القيمة الابتدائية V₀ والقيمة النهائية V₁:<br/>
t = (V₁ - V₀)/V₀ أو بالنسبة المئوية: t% = ((V₁ - V₀)/V₀) × 100
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> سعر سلعة ارتفع من 800 دج إلى 920 دج<br/>
t = (920 - 800)/800 = 120/800 = 0.15 = 15%<br/>
هذا يعني زيادة بنسبة 15%
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. معامل الضرب</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 تعريف:</strong> معامل الضرب المرتبط بالتطور t%:<br/>
CM = 1 + t/100 = V₁/V₀<br/>
• زيادة 20% ⟹ CM = 1.20<br/>
• نقصان 15% ⟹ CM = 0.85
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. التطورات المتتالية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 قاعدة:</strong> معامل الضرب الإجمالي = جداء معاملات الضرب.<br/>
CM_total = CM₁ × CM₂ × ... × CMₙ
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> سعر يرتفع 10% ثم ينخفض 10%.<br/>
CM = 1.10 × 0.90 = 0.99<br/>
نسبة التطور الإجمالي = -1% (وليس 0%!)
</div>

<div style="background: #fdedec; padding: 15px; border-right: 4px solid #e74c3c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e74c3c;">⚠️ تنبيه:</strong> زيادة ثم نقصان بنفس النسبة لا يعيد القيمة الأصلية!
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) سعر 2000 دج يزداد 25% ثم ينخفض 20%. ما السعر النهائي؟<br/>
2) ما هي نسبة الزيادة التي تلغي نقصان 30%؟<br/>
3) سكان مدينة يتزايدون 3% سنوياً. إذا كانوا 100000 اليوم، كم سيكونون بعد 5 سنوات؟
</div>
</div>' WHERE id = 'd790ebf5-14fa-40eb-ba97-2830b93b4c41';

-- 40) المؤشرات (النسب المئوية والمؤشرات)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المؤشرات</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريف المؤشر</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> مؤشر كمية V في تاريخ t بالنسبة لتاريخ مرجعي t₀ (الأساس 100):<br/>
I(t) = (V(t)/V(t₀)) × 100
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> سعر سلعة: 2010: 50 دج، 2015: 65 دج (الأساس 2010 = 100)<br/>
I(2015) = (65/50) × 100 = 130<br/>
المؤشر 130 يعني زيادة 30% بالنسبة لـ 2010
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. خصائص المؤشرات</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 خاصيات:</strong><br/>
• I(t₀) = 100 دائماً (المؤشر في السنة المرجعية)<br/>
• I(t) &gt; 100 ⟹ زيادة<br/>
• I(t) &lt; 100 ⟹ نقصان<br/>
• نسبة التطور = I(t) - 100 بالنسبة المئوية
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. تغيير الأساس</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 قاعدة:</strong> لتحويل المؤشر من أساس t₀ إلى أساس t₁:<br/>
I_جديد(t) = (I_قديم(t) / I_قديم(t₁)) × 100
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> سعر سلعة بمؤشرات (أساس 2010 = 100):<br/>
2010: 100 | 2012: 108 | 2014: 115 | 2016: 125<br/>
1) ما نسبة الزيادة بين 2010 و 2016؟<br/>
2) حوّل المؤشرات إلى أساس 2012 = 100<br/>
3) إذا كان السعر 200 دج في 2010، ما هو في 2016؟
</div>
</div>' WHERE id = '49229e92-ef5c-42f7-9778-baf13a3a291a';

-- 41) السلاسل الزمنية (الإحصاء)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">السلاسل الزمنية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> السلسلة الزمنية هي مجموعة قياسات مرتبة زمنياً لنفس الظاهرة على فترات منتظمة (يومياً، شهرياً، سنوياً...).
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. التمثيل البياني</h3>

<p>يُمثَّل بمخطط خطي (منحنى) حيث محور الفواصل يمثل الزمن ومحور الأراتيب يمثل القيم المرصودة.</p>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. مكونات السلسلة الزمنية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 المكونات:</strong><br/>
• <strong>الاتجاه العام (Trend):</strong> التطور طويل المدى (صاعد/نازل/ثابت)<br/>
• <strong>التغيرات الموسمية:</strong> تذبذبات دورية مرتبطة بالمواسم<br/>
• <strong>التغيرات العشوائية:</strong> تقلبات غير منتظمة
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> مبيعات متجر (بآلاف الدنانير):<br/>
شهر 1: 45 | شهر 2: 42 | شهر 3: 50 | شهر 4: 48 | شهر 5: 55 | شهر 6: 52<br/>
الاتجاه العام: تصاعدي (المبيعات تزداد مع الوقت)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> درجات الحرارة الشهرية لمدينة (بالدرجة المئوية):<br/>
ج: 8 | ف: 10 | م: 14 | أ: 18 | ماي: 23 | جو: 28 | جل: 32 | أو: 31 | س: 26 | أك: 20 | ن: 14 | د: 9<br/>
1) مثّل السلسلة بيانياً<br/>
2) حدد الاتجاه العام والتغيرات الموسمية<br/>
3) احسب المتوسط السنوي
</div>
</div>' WHERE id = '4a8aa61d-f382-47e0-b977-088e0a33885c';

-- 42) التمليس بالأوساط المتحركة
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">التمليس بالأوساط المتحركة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. مفهوم التمليس</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> التمليس (Le lissage) هو تقنية إحصائية لإزالة التذبذبات العشوائية والموسمية من سلسلة زمنية لإبراز الاتجاه العام.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الأوساط المتحركة (Moyennes mobiles)</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 التعريف:</strong> الوسط المتحرك من الرتبة p للقيمة yᵢ هو:<br/>
<strong>وسط متحرك من الرتبة 3:</strong> Mᵢ = (yᵢ₋₁ + yᵢ + yᵢ₊₁)/3<br/>
<strong>وسط متحرك من الرتبة 5:</strong> Mᵢ = (yᵢ₋₂ + yᵢ₋₁ + yᵢ + yᵢ₊₁ + yᵢ₊₂)/5
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> القيم: 10, 15, 12, 18, 14, 20, 16<br/>
الأوساط المتحركة من الرتبة 3:<br/>
M₂ = (10+15+12)/3 = 12.33<br/>
M₃ = (15+12+18)/3 = 15<br/>
M₄ = (12+18+14)/3 = 14.67<br/>
M₅ = (18+14+20)/3 = 17.33<br/>
M₆ = (14+20+16)/3 = 16.67
</div>

<div style="background: #fdedec; padding: 15px; border-right: 4px solid #e74c3c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e74c3c;">⚠️ ملاحظة:</strong> الوسط المتحرك من الرتبة p الفردية يُفقد (p-1)/2 قيمة من كل طرف.
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> سلسلة زمنية: 25, 30, 28, 35, 32, 40, 38, 45, 42<br/>
1) احسب الأوساط المتحركة من الرتبة 3<br/>
2) احسب الأوساط المتحركة من الرتبة 5<br/>
3) ارسم السلسلة الأصلية والممهدتين على نفس الرسم. قارن
</div>
</div>' WHERE id = '9303ab9e-62c5-4d64-acd4-0cdb153653a0';

-- 43) المدرجات التكرارية (الإحصاء)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المدرجات التكرارية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المتغير الإحصائي المتصل</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> عندما تكون قيم المتغير الإحصائي كثيرة أو متصلة، نقسمها إلى فئات (أقسام) على شكل مجالات: [a₁, a₂[, [a₂, a₃[, ..., [aₖ, aₖ₊₁]
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. المدرج التكراري (Histogramme)</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 التعريف:</strong> هو تمثيل بياني بأعمدة متلاصقة حيث:<br/>
• عرض كل عمود = مدى الفئة (aᵢ₊₁ - aᵢ)<br/>
• مساحة كل عمود تتناسب مع التكرار<br/>
• الارتفاع = الكثافة التكرارية = التكرار / مدى الفئة
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> أعمار 50 شخصاً:<br/>
[10, 20[: 8 أشخاص (كثافة = 0.8)<br/>
[20, 30[: 15 شخصاً (كثافة = 1.5)<br/>
[30, 50[: 20 شخصاً (كثافة = 1.0)<br/>
[50, 70[: 7 أشخاص (كثافة = 0.35)<br/>
<em>لاحظ: الفئة [30,50[ عرضها 20 يحتاجها كثافة أقل</em>
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. المضلع التكراري</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 التعريف:</strong> يُحصل عليه بوصل منتصفات الحدود العليا لأعمدة المدرج بخطوط مستقيمة.
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> علامات 40 تلميذاً في الرياضيات:<br/>
[0, 5[: 3 | [5, 10[: 8 | [10, 15[: 18 | [15, 20]: 11<br/>
1) أنشئ المدرج التكراري<br/>
2) ارسم المضلع التكراري<br/>
3) احسب المدى والمتوسط
</div>
</div>' WHERE id = 'e2164757-6747-4864-b624-ba5d6dfefe5c';

-- 44) التباين والانحراف المعياري (الإحصاء)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">التباين والانحراف المعياري</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المتوسط الحسابي (تذكير)</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 صيغة:</strong> x̄ = (Σnᵢxᵢ) / N حيث N = Σnᵢ
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. التباين (Variance)</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 التعريف:</strong><br/>
V(X) = (1/N) × Σnᵢ(xᵢ - x̄)²<br/><br/>
<strong>صيغة كونيغ:</strong> V(X) = (Σnᵢxᵢ²)/N - x̄² = x̄² - (x̄)²<br/>
(متوسط المربعات ناقص مربع المتوسط)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. الانحراف المعياري (Écart-type)</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 التعريف:</strong><br/>
σ = √V(X) = √[(Σnᵢ(xᵢ - x̄)²)/N]
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> البيانات: 4, 6, 8, 10, 12<br/>
x̄ = (4+6+8+10+12)/5 = 8<br/>
V = [(4-8)² + (6-8)² + (8-8)² + (10-8)² + (12-8)²] / 5<br/>
= [16 + 4 + 0 + 4 + 16] / 5 = 40/5 = 8<br/>
σ = √8 ≈ 2.83
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">4. تفسير الانحراف المعياري</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تفسير:</strong><br/>
• σ صغير: القيم قريبة من المتوسط (تجانس)<br/>
• σ كبير: القيم متباعدة عن المتوسط (تشتت)<br/>
• σ = 0: كل القيم متساوية
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> علامات مجموعتين في امتحان:<br/>
المجموعة أ: 12, 13, 14, 13, 13<br/>
المجموعة ب: 8, 18, 10, 16, 13<br/>
1) احسب المتوسط والتباين والانحراف المعياري لكل مجموعة<br/>
2) أي مجموعة أكثر تجانساً؟ علل!
</div>
</div>' WHERE id = '88544f1b-5e1c-4bea-86ad-2b9953d04cd9';

-- 45) التجربة العشوائية - المحاكاة (الإحصاء)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">التجربة العشوائية - المحاكاة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التجربة العشوائية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> التجربة العشوائية هي تجربة يمكن تكرارها في نفس الظروف ونتيجتها غير معروفة مسبقاً.<br/>
<strong>الفضاء العيني Ω:</strong> مجموعة جميع النتائج الممكنة.<br/>
<strong>الحدث:</strong> جزء من الفضاء العيني.
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ أمثلة:</strong><br/>
• رمي حجر نرد: Ω = {1, 2, 3, 4, 5, 6}<br/>
• رمي قطعة نقدية: Ω = {كتابة, صورة}<br/>
• سحب بطاقة من 52: |Ω| = 52
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. التكرار النسبي والاحتمال</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong><br/>
• <strong>التكرار النسبي</strong> لحدث A بعد n تجربة: f(A) = عدد تحقق A / n<br/>
• عندما n كبير جداً: f(A) يستقر حول قيمة تُسمى <strong>الاحتمال</strong> P(A)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. المحاكاة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 مبدأ:</strong> المحاكاة هي استعمال الحاسوب أو أدوات أخرى لتقليد تجربة عشوائية عدداً كبيراً من المرات لتقدير الاحتمالات تجريبياً.
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> محاكاة رمي حجر نرد 1000 مرة:<br/>
النتائج المرصودة: 1: 168 | 2: 162 | 3: 175 | 4: 158 | 5: 171 | 6: 166<br/>
التكرارات النسبية ≈ 1/6 لكل وجه ⟹ الاحتمال النظري P = 1/6
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) عرّف الفضاء العيني لرمي حجري نرد وحساب مجموعهما<br/>
2) ما احتمال الحصول على مجموع يساوي 7؟<br/>
3) أجرِ 50 تجربة (أو محاكاة) واحسب التكرار النسبي. قارنه بالاحتمال النظري
</div>
</div>' WHERE id = '75c9ec89-1921-40f8-bbc3-5c2b9207c7a3';
