-- =====================================================
-- Terminale - Batch 4/13
-- Covers: المتتاليات العددية (fin) + الحساب + دراسة الدوال
-- Lessons 46-60 of 181
-- =====================================================

-- 46) استعمال المتتاليات الحسابية والهندسية في حل المشكلات
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">استعمال المتتاليات الحسابية والهندسية في حل المشكلات</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. مشكلات النمو الخطي (حسابية)</h3>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> عامل يتقاضى 30000 دج شهرياً مع زيادة 2000 دج كل سنة.<br/>
uₙ = 30000 + 2000n (حسابية بأساس r = 2000)<br/>
• الراتب بعد 10 سنوات: u₁₀ = 50000 دج<br/>
• مجموع ما تقاضاه في 10 سنوات: S₁₀ = 11 × (30000+50000)/2 = 440000 دج
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. مشكلات النمو الأسي (هندسية)</h3>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> سكان مدينة 100000 يتزايدون 3% سنوياً.<br/>
uₙ = 100000 × (1.03)ⁿ (هندسية بأساس q = 1.03)<br/>
• بعد 20 سنة: u₂₀ = 100000 × (1.03)²⁰ ≈ 180611<br/>
• متى يتضاعف العدد؟ 2 = (1.03)ⁿ ⟹ n = ln2/ln1.03 ≈ 23.4 سنة
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. مشكلات مالية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 الفائدة المركبة:</strong> Cₙ = C₀ × (1+r)ⁿ<br/>
<strong>القسط الشهري الثابت:</strong> a = C₀ × r/(1-(1+r)⁻ⁿ)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) مبلغ 500000 دج بفائدة 5% سنوية مركبة. متى يصبح مليون دج؟<br/>
2) قرض 2000000 دج بفائدة 7% سنوية على 10 سنوات. احسب القسط السنوي<br/>
3) بكتيريا تتضاعف كل 30 دقيقة. بدءاً من 100 بكتيريا، كم بعد 5 ساعات؟
</div>
</div>' WHERE id = 'cfd6a2b1-3d5c-49e3-8911-9784f75b3c65';

-- 47) المتتاليات من الشكل Uₙ₊₁ = aUₙ + b
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المتتاليات من الشكل Uₙ₊₁ = aUₙ + b</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الحالات الخاصة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 حالات:</strong><br/>
• a = 1: uₙ₊₁ = uₙ + b ⟹ حسابية بأساس b<br/>
• b = 0: uₙ₊₁ = auₙ ⟹ هندسية بأساس a<br/>
• a ≠ 1 و b ≠ 0: حالة عامة
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الحل في الحالة العامة (a ≠ 1)</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 طريقة:</strong><br/>
1) أوجد النقطة الثابتة: ℓ = aℓ + b ⟹ ℓ = b/(1-a)<br/>
2) نضع: vₙ = uₙ - ℓ<br/>
3) vₙ₊₁ = uₙ₊₁ - ℓ = a(uₙ - ℓ) = avₙ ⟹ (vₙ) هندسية بأساس a<br/>
4) vₙ = v₀ × aⁿ = (u₀ - ℓ) × aⁿ<br/>
5) <strong>uₙ = (u₀ - ℓ) × aⁿ + ℓ</strong>
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> uₙ₊₁ = 3uₙ - 4, u₀ = 3<br/>
ℓ = -4/(1-3) = 2<br/>
vₙ = uₙ - 2 ⟹ vₙ = (3-2) × 3ⁿ = 3ⁿ<br/>
uₙ = 3ⁿ + 2
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) أوجد الصيغة الصريحة لـ uₙ₊₁ = 2uₙ + 3, u₀ = 1<br/>
2) ادرس تقارب uₙ₊₁ = 0.5uₙ + 4, u₀ = 0<br/>
3) uₙ₊₁ = -uₙ/2 + 6, u₀ = 0. أوجد uₙ وادرس تقاربها
</div>
</div>' WHERE id = '0b29e514-f8a6-4ee6-88d2-62d4fbecbbf3';

-- 48) حل مشكلات تُستعمل فيها متتاليات من الشكل Uₙ₊₁ = aUₙ + b
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">حل مشكلات تُستعمل فيها متتاليات من الشكل Uₙ₊₁ = aUₙ + b</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. نمذجة المشكلات</h3>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مشكلة 1 (دواء):</strong> يأخذ مريض 100mg يومياً. يُتخلص من 40% كل يوم.<br/>
uₙ₊₁ = 0.6uₙ + 100, u₀ = 100<br/>
ℓ = 100/(1-0.6) = 250mg (التركيز المستقر)<br/>
uₙ = -150 × (0.6)ⁿ + 250
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مشكلة 2 (بيئة):</strong> بحيرة تفقد 20% من أسماكها سنوياً ويُضاف 500 سمكة.<br/>
uₙ₊₁ = 0.8uₙ + 500, u₀ = 3000<br/>
ℓ = 500/0.2 = 2500 سمكة (عدد التوازن)<br/>
uₙ = 500 × (0.8)ⁿ + 2500
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. دراسة السلوك على المدى البعيد</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 نتيجة:</strong> إذا |a| &lt; 1:<br/>
lim uₙ = ℓ = b/(1-a) (التقارب مضمون)<br/>
أما إذا |a| &gt; 1 فالمتتالية تتباعد.
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) قرض بقسط سنوي a: uₙ₊₁ = 1.05uₙ - a, u₀ = 1000000. أوجد a لسداد القرض في 10 سنوات<br/>
2) مصنع ينتج 1000 وحدة ويُتلف 30% سنوياً ويُضيف 400. ادرس تطور الإنتاج
</div>
</div>' WHERE id = 'a1b9af15-bc25-44e4-ab5d-6f35fdeab8e9';

-- 49) القسمة الإقليدية في Z
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">القسمة الإقليدية في ℤ</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. مبرهنة القسمة الإقليدية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 مبرهنة:</strong> لكل a ∈ ℤ و b ∈ ℤ* يوجد زوج وحيد (q, r) ∈ ℤ² حيث:<br/>
a = bq + r مع 0 ≤ r &lt; |b|<br/>
q: الحاصل، r: الباقي
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong><br/>
• 47 = 5 × 9 + 2 (a=47, b=5, q=9, r=2)<br/>
• -47 = 5 × (-10) + 3 (a=-47, b=5, q=-10, r=3)<br/>
• 100 = 7 × 14 + 2
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. القابلية للقسمة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> a يقبل القسمة على b (b|a) ⟺ r = 0 ⟺ ∃q ∈ ℤ: a = bq<br/><br/>
<strong>خواص:</strong><br/>
• b|a و b|c ⟹ b|(a+c) و b|(a-c)<br/>
• b|a ⟹ b|(ka) لكل k ∈ ℤ<br/>
• b|a و a|b ⟹ a = ±b
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) أنجز القسمة الإقليدية: 2023 على 17، و -145 على 12<br/>
2) بيّن أن n²+n زوجي لكل n ∈ ℤ<br/>
3) بيّن أن باقي قسمة n² على 4 هو 0 أو 1
</div>
</div>' WHERE id = 'bb3e8873-8813-40e7-b9a9-c6dd1f6c19c6';

-- 50) تعيين مجموعة قواسم عدد طبيعي
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">تعيين مجموعة قواسم عدد طبيعي</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. القواسم والمضاعفات</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong><br/>
• D(n): مجموعة قواسم n الموجبة<br/>
• d قاسم لـ n ⟺ n = d × k لعدد طبيعي k<br/>
• كل عدد طبيعي n ≥ 1 له على الأقل قاسمان: 1 و n
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الأعداد الأولية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 تعريف:</strong> عدد طبيعي p ≥ 2 أولي إذا قواسمه هي 1 و p فقط.<br/>
الأعداد الأولية الأولى: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, ...<br/><br/>
<strong>مبرهنة:</strong> كل عدد طبيعي n ≥ 2 يُكتب كجداء أعداد أولية بطريقة وحيدة (التحليل الأولي).
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong><br/>
• D(12) = {1, 2, 3, 4, 6, 12} و 12 = 2² × 3<br/>
• D(60) = {1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, 60} و 60 = 2² × 3 × 5<br/>
• عدد القواسم: إذا n = p₁^α₁ × p₂^α₂ × ... فإن d(n) = (α₁+1)(α₂+1)...
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. PGCD و PPCM</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong><br/>
• PGCD(a,b): أكبر قاسم مشترك<br/>
• PPCM(a,b): أصغر مضاعف مشترك<br/>
• PGCD × PPCM = a × b
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) أوجد D(180) واكتب التحليل الأولي<br/>
2) احسب PGCD(120, 84) بخوارزمية أقليدس<br/>
3) بيّن أن عدد الأعداد الأولية لانهائي
</div>
</div>' WHERE id = '82226b86-184e-4436-9187-cb1b3e63d357';

-- 51) الموافقات في Z
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الموافقات في ℤ</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> a ≡ b [n] (a يوافق b بتردد n) تعني أن n|(a-b)<br/>
أو: a و b لهما نفس الباقي في القسمة على n
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong><br/>
• 17 ≡ 2 [5] لأن 17 - 2 = 15 = 5×3<br/>
• 23 ≡ 3 [10] لأن 23 - 3 = 20 = 10×2<br/>
• -7 ≡ 3 [5] لأن -7 - 3 = -10 = 5×(-2)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. خواص الموافقات</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 خواص:</strong> إذا a ≡ b [n] و c ≡ d [n]:<br/>
• a + c ≡ b + d [n]<br/>
• a - c ≡ b - d [n]<br/>
• a × c ≡ b × d [n]<br/>
• aᵏ ≡ bᵏ [n] لكل k ∈ ℕ
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) أوجد باقي قسمة 7¹⁰⁰ على 3<br/>
2) بيّن أن n³ - n يقبل القسمة على 6 لكل n ∈ ℤ<br/>
3) أوجد آخر رقمين من العدد 3²⁰²⁴
</div>
</div>' WHERE id = '80a20260-ab25-4254-9576-715f9a547d30';

-- 52) معرفة خواص الموافقة واستعمالها في حل المشكلات
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">معرفة خواص الموافقة واستعمالها في حل المشكلات</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. حل المعادلات بالموافقات</h3>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 1:</strong> أوجد باقي قسمة 2¹⁰⁰ على 7<br/>
2¹ ≡ 2 [7]<br/>
2² ≡ 4 [7]<br/>
2³ ≡ 1 [7]<br/>
100 = 3×33 + 1 ⟹ 2¹⁰⁰ = (2³)³³ × 2 ≡ 1³³ × 2 ≡ 2 [7]
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. معايير القابلية للقسمة</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 معايير:</strong><br/>
• القسمة على 3: مجموع الأرقام يقبل القسمة على 3<br/>
• القسمة على 9: مجموع الأرقام يقبل القسمة على 9<br/>
• القسمة على 11: الفرق بين مجموع الأرقام ذات الرتب الفردية والزوجية يقبل القسمة على 11<br/>
(لأن 10 ≡ 1 [3] و 10 ≡ 1 [9] و 10 ≡ -1 [11])
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. مبرهنة فيرما الصغيرة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 مبرهنة:</strong> إذا p عدد أولي و PGCD(a,p) = 1:<br/>
a^(p-1) ≡ 1 [p]
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) بيّن أن 1234567 يقبل القسمة على 3 ولا يقبل على 9<br/>
2) أوجد باقي قسمة 5²⁰²⁴ على 13 (استعمل فيرما)<br/>
3) حل: 3x ≡ 1 [7]
</div>
</div>' WHERE id = 'f9c0519b-5605-45f1-9adc-0dce3beb7e0b';

-- 53) الاستدلال بالتراجع
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الاستدلال بالتراجع</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. مبدأ الاستدلال بالتراجع</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 المبدأ:</strong> لإثبات خاصية P(n) لكل n ≥ n₀:<br/>
<strong>المرحلة 1 (التهيئة):</strong> نتحقق أن P(n₀) صحيحة<br/>
<strong>المرحلة 2 (الوراثة):</strong> نفترض P(k) صحيحة لعدد k ≥ n₀، ونبرهن P(k+1)<br/>
<strong>الاستنتاج:</strong> P(n) صحيحة لكل n ≥ n₀
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. أمثلة</h3>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> بيّن أن Σₖ₌₁ⁿ k² = n(n+1)(2n+1)/6<br/>
<strong>التهيئة:</strong> n=1: 1² = 1 و 1×2×3/6 = 1 ✓<br/>
<strong>الوراثة:</strong> نفترض Σₖ₌₁ⁿ k² = n(n+1)(2n+1)/6<br/>
Σₖ₌₁ⁿ⁺¹ k² = n(n+1)(2n+1)/6 + (n+1)²<br/>
= (n+1)[n(2n+1) + 6(n+1)]/6<br/>
= (n+1)(2n²+7n+6)/6<br/>
= (n+1)(n+2)(2n+3)/6 ✓
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) بيّن بالتراجع أن 2ⁿ &gt; n لكل n ∈ ℕ<br/>
2) بيّن أن 6ⁿ - 1 يقبل القسمة على 5 لكل n ≥ 1<br/>
3) بيّن أن Σₖ₌₀ⁿ qᵏ = (1-qⁿ⁺¹)/(1-q) لكل q ≠ 1
</div>
</div>' WHERE id = 'a5530fd4-6c89-4299-ac56-edd07d47df4a';

-- 54) تذكير حول المشتقات ومعادلة المماس
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">تذكير حول المشتقات ومعادلة المماس</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. جدول المشتقات</h3>

<table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
<tr style="background: #2c3e50; color: white;"><th style="padding: 8px; border: 1px solid #ddd;">f(x)</th><th style="padding: 8px; border: 1px solid #ddd;">f''(x)</th></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">xⁿ</td><td style="padding: 8px; border: 1px solid #ddd;">nxⁿ⁻¹</td></tr>
<tr style="background: #f8f9fa;"><td style="padding: 8px; border: 1px solid #ddd;">1/x</td><td style="padding: 8px; border: 1px solid #ddd;">-1/x²</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">√x</td><td style="padding: 8px; border: 1px solid #ddd;">1/(2√x)</td></tr>
<tr style="background: #f8f9fa;"><td style="padding: 8px; border: 1px solid #ddd;">eˣ</td><td style="padding: 8px; border: 1px solid #ddd;">eˣ</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">ln(x)</td><td style="padding: 8px; border: 1px solid #ddd;">1/x</td></tr>
<tr style="background: #f8f9fa;"><td style="padding: 8px; border: 1px solid #ddd;">sin(x)</td><td style="padding: 8px; border: 1px solid #ddd;">cos(x)</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">cos(x)</td><td style="padding: 8px; border: 1px solid #ddd;">-sin(x)</td></tr>
</table>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. قواعد الاشتقاق</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قواعد:</strong><br/>
• (u+v)'' = u'' + v''<br/>
• (ku)'' = ku''<br/>
• (uv)'' = u''v + uv''<br/>
• (u/v)'' = (u''v - uv'')/v²<br/>
• (u∘v)'' = v'' × u''(v)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. معادلة المماس</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 صيغة:</strong> معادلة المماس للمنحنى عند (a, f(a)):<br/>
y = f''(a)(x - a) + f(a)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) أوجد معادلة المماس لـ f(x) = x³ - 2x عند x = 1<br/>
2) اشتق g(x) = x²·eˣ و h(x) = ln(x²+1)<br/>
3) أوجد النقاط التي يكون فيها المماس أفقياً لـ f(x) = x³ - 3x
</div>
</div>' WHERE id = '22393aca-9eca-4bda-81c1-2deb4a7626ee';

-- 55) الدراسة والتمثيل البياني لدالة
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الدراسة والتمثيل البياني لدالة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. خطوات دراسة دالة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 المنهجية:</strong><br/>
1) مجموعة التعريف Df<br/>
2) التناظر (زوجية/فردية)<br/>
3) النهايات عند حدود مجموعة التعريف<br/>
4) المستقيمات المقاربة (أفقية/عمودية/مائلة)<br/>
5) الاشتقاق وجدول التغيرات<br/>
6) النقاط الخاصة (تقاطع مع المحاور، القيم الحدية)<br/>
7) التمثيل البياني
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = (x²-1)/(x-2)<br/>
• Df = ℝ\{2}<br/>
• lim(x→2⁺) = +∞, lim(x→2⁻) = -∞ (مقارب عمودي x=2)<br/>
• f(x) = x + 2 + 3/(x-2) ⟹ مقارب مائل y = x+2<br/>
• f''(x) = (x²-4x+1)/(x-2)²
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> ادرس وارسم:<br/>
1) f(x) = x + 1/x<br/>
2) g(x) = xe^(-x)<br/>
3) h(x) = ln(x)/x
</div>
</div>' WHERE id = '3d759ead-256e-4e4b-be80-db9fa8621a49';

-- 56) الدوال كثيرات الحدود
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الدوال كثيرات الحدود</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> كثيرة الحدود P من الدرجة n هي:<br/>
P(x) = aₙxⁿ + aₙ₋₁xⁿ⁻¹ + ... + a₁x + a₀ (aₙ ≠ 0)<br/>
aₙ: المعامل الرئيسي، n: الدرجة
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. خواص</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 خواص:</strong><br/>
• lim(x→±∞) P(x) = lim aₙxⁿ<br/>
• P قابلة للاشتقاق: P''(x) = naₙxⁿ⁻¹ + ... + a₁<br/>
• P من الدرجة n لها على الأكثر n جذراً<br/>
• قسمة P/Q = حاصل + باقي (القسمة الإقليدية)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. تحليل كثيرات الحدود</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 طرق التحليل:</strong><br/>
• إذا P(a) = 0 فإن (x-a) يقسم P(x)<br/>
• الدرجة 2: ax²+bx+c = a(x-x₁)(x-x₂) إذا Δ &gt; 0<br/>
• الدرجة 3: البحث عن جذر واضح ثم القسمة
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) حلل P(x) = x³ - 6x² + 11x - 6<br/>
2) أنجز القسمة الإقليدية: (2x³+x²-3x+1) ÷ (x-1)<br/>
3) ادرس إشارة P(x) = -x³ + 4x
</div>
</div>' WHERE id = 'c79d32f0-7a3f-424c-aa5c-51925a416d8d';

-- 57) تعيين نقطة الانعطاف
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">تعيين نقطة الانعطاف</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التقعر</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong><br/>
• المنحنى مُقعّر لأعلى (محدّب) على I ⟺ f''''(x) &gt; 0 على I<br/>
• المنحنى مُقعّر لأسفل (مقعّر) على I ⟺ f''''(x) &lt; 0 على I
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. نقطة الانعطاف</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 تعريف:</strong> النقطة (a, f(a)) نقطة انعطاف إذا تغيّر اتجاه التقعر عندها.<br/>
<strong>شرط ضروري:</strong> f''''(a) = 0<br/>
<strong>شرط كافٍ:</strong> f''''(a) = 0 و f'''' تُغيّر إشارتها عند a<br/><br/>
<strong>خاصية:</strong> المماس عند نقطة الانعطاف يقطع المنحنى
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = x³ - 3x<br/>
f''(x) = 3x² - 3, f''''(x) = 6x<br/>
f''''(x) = 0 ⟹ x = 0<br/>
f''''(x) &lt; 0 إذا x &lt; 0 و f''''(x) &gt; 0 إذا x &gt; 0<br/>
⟹ (0, 0) نقطة انعطاف
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) أوجد نقاط الانعطاف لـ f(x) = x⁴ - 6x²<br/>
2) ادرس تقعر g(x) = eˣ - x وأوجد نقاط الانعطاف<br/>
3) أوجد معادلة المماس عند نقطة الانعطاف لـ h(x) = x³ - 3x² + 2
</div>
</div>' WHERE id = 'dfeb7567-0f2b-4451-a59c-91ae05f66f8a';

-- 58) القراءة البيانية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">القراءة البيانية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. قراءة صور وأصول</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 من المنحنى نقرأ:</strong><br/>
• f(a) = b ⟺ النقطة (a,b) على المنحنى<br/>
• حل f(x) = k: إسقاط تقاطع y = k مع المنحنى على الفواصل<br/>
• إشارة f(x): فوق محور الفواصل ⟹ f(x) &gt; 0
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. قراءة معلومات الاشتقاق</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 من المنحنى نستنتج:</strong><br/>
• f''(a) = ميل المماس عند a<br/>
• مماس أفقي عند a ⟹ f''(a) = 0 (قيمة حدية محتملة)<br/>
• المنحنى صاعد ⟹ f''(x) &gt; 0<br/>
• المنحنى نازل ⟹ f''(x) &lt; 0
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. قراءة المستقيمات المقاربة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 أنواع:</strong><br/>
• مقارب أفقي y = ℓ: المنحنى يقترب من y = ℓ عند ±∞<br/>
• مقارب عمودي x = a: المنحنى يقترب من x = a (تصبح f لامتناهية)<br/>
• مقارب مائل y = ax+b: المنحنى يقترب من مستقيم مائل
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> من رسم بياني معطى:<br/>
1) حدد مجموعة التعريف والنهايات<br/>
2) حدد المستقيمات المقاربة<br/>
3) أعط جدول التغيرات وإشارة f''(x)<br/>
4) حل بيانياً f(x) = 2 و f(x) &gt; 0
</div>
</div>' WHERE id = 'ba690b8b-1e79-4b6e-9098-e839a6a1b615';

-- 59) استعمال التمثيل البياني لحل معادلات أو متراجحات
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">استعمال التمثيل البياني لحل معادلات أو متراجحات</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الحل البياني لمعادلة f(x) = g(x)</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 مبدأ:</strong> حلول f(x) = g(x) هي فواصل نقاط تقاطع منحنى f مع منحنى g.<br/>
حالة خاصة: f(x) = k ⟹ تقاطع المنحنى مع المستقيم y = k
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الحل البياني لمتراجحة f(x) ≥ g(x)</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 مبدأ:</strong> f(x) ≥ g(x) ⟺ منحنى f فوق منحنى g<br/>
• f(x) &gt; 0: المنحنى فوق محور الفواصل<br/>
• f(x) &lt; g(x): المنحنى تحت منحنى g
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. مبرهنة القيم المتوسطة (TVI)</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 مبرهنة:</strong> إذا f متصلة ورتيبة تماماً على [a,b] و k بين f(a) و f(b):<br/>
المعادلة f(x) = k تقبل حلاً وحيداً في [a,b]
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> بيّن أن x³ + x - 1 = 0 تقبل حلاً وحيداً في ]0,1[<br/>
f(x) = x³ + x - 1، f(0) = -1 &lt; 0, f(1) = 1 &gt; 0<br/>
f متصلة ومتزايدة تماماً ⟹ ∃! α ∈ ]0,1[ حيث f(α) = 0
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) حل بيانياً: eˣ = 2x + 1<br/>
2) حل بيانياً: ln(x) ≥ x - 2<br/>
3) بيّن أن eˣ = x + 2 تقبل حلين وحدد مجالاً لكل منهما
</div>
</div>' WHERE id = '164905c6-8cd4-406e-b8c5-15ea33af1b38';

-- 60) الدوال التناظرية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الدوال التناظرية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الدالة الزوجية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> f زوجية ⟺ f(-x) = f(x) لكل x ∈ Df<br/>
(شرط: Df متناظر حول 0)<br/>
<strong>هندسياً:</strong> المنحنى متناظر بالنسبة لمحور الأراتيب<br/>
<strong>أمثلة:</strong> x², cos(x), |x|
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الدالة الفردية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> f فردية ⟺ f(-x) = -f(x) لكل x ∈ Df<br/>
<strong>هندسياً:</strong> المنحنى متناظر بالنسبة لنقطة الأصل O<br/>
<strong>أمثلة:</strong> x³, sin(x), x
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. تناظر حول نقطة أو محور</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 تعميم:</strong><br/>
• تناظر حول المحور x = a: f(a+x) = f(a-x)<br/>
• تناظر حول النقطة (a, b): f(a+x) + f(a-x) = 2b<br/>
يكفي الدراسة على نصف Df ثم استعمال التناظر
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = x⁴ - 2x²<br/>
f(-x) = (-x)⁴ - 2(-x)² = x⁴ - 2x² = f(x) ⟹ f زوجية<br/>
يكفي دراسة f على [0,+∞[ ثم تناظر محوري
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) حدد زوجية/فردية: f(x) = x/(x²+1), g(x) = eˣ + e⁻ˣ<br/>
2) بيّن أن h(x) = x + 1/x فردية. ادرسها على ]0,+∞[ وأتمّ بالتناظر<br/>
3) بيّن أن منحنى f(x) = 1/(x-1) يقبل مركز تناظر. ما هو؟
</div>
</div>' WHERE id = 'a7014447-6f00-4114-9521-2673cf938efe';
