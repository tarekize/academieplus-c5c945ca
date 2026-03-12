-- =====================================================
-- Seconde (2ème Année Secondaire) - Batch 10/12
-- Covers: المتتاليات (suite) + المرجح (شعبة 5) + النسب المئوية + الإحصاء
-- Lessons 136-150 of 177
-- =====================================================

-- 136) نهاية متتالية عددية (شعبة 4)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">نهاية متتالية عددية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التقارب</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 (uₙ) متقاربة نحو ℓ:</strong> lim(n→+∞) uₙ = ℓ<br/>
• lim 1/nᵅ = 0 (α &gt; 0)<br/>
• |q| &lt; 1: lim qⁿ = 0<br/>
• q &gt; 1: lim qⁿ = +∞
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. عمليات على النهايات</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 نفس قواعد الدوال + حالات عدم التعيين</strong><br/>
تقنية الكسور: القسمة على أعلى قوة لـ n
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> uₙ = (2n²+n)/(3n²-1)<br/>
= (2+1/n)/(3-1/n²) → 2/3
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) lim (4n-1)/(2n+3)<br/>
2) lim (n²+1)/(n³-n)<br/>
3) lim (√(n²+n) - n)
</div>
</div>' WHERE id = '647819f8-a1a8-402b-b732-62e8bb75d03b';

-- 137) نهاية متتالية عددية باستعمال الحصر (شعبة 4)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">نهاية متتالية باستعمال الحصر</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. مبرهنة الحصر</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 إذا vₙ ≤ uₙ ≤ wₙ و lim vₙ = lim wₙ = ℓ ⟹ lim uₙ = ℓ</strong>
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> uₙ = cos(n²)/(n+1)<br/>
-1/(n+1) ≤ cos(n²)/(n+1) ≤ 1/(n+1)<br/>
الطرفان → 0 ⟹ lim uₙ = 0
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. المتتالية الرتيبة المحصورة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 متتالية متزايدة + محدودة من الأعلى → متقاربة</strong><br/>
لإيجاد النهاية ℓ نحل: ℓ = f(ℓ) (نقطة ثابتة)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) بيّن أن lim n·sin(1/n²) = 0<br/>
2) uₙ₊₁ = √(2+uₙ), u₀ = 0. بيّن أنها متزايدة محدودة بـ 2، ثم أوجد النهاية
</div>
</div>' WHERE id = '65dda28a-1c9c-418b-8c1f-22459398745e';

-- 138) نهاية متتالية هندسية (شعبة 4)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">نهاية متتالية هندسية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. نهاية qⁿ</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 حسب قيمة q:</strong><br/>
• -1 &lt; q &lt; 1: lim qⁿ = 0<br/>
• q = 1: lim qⁿ = 1<br/>
• q &gt; 1: lim qⁿ = +∞<br/>
• q ≤ -1: ليس لها نهاية
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. المجموع اللانهائي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 |q| &lt; 1: Σ(n=0 إلى ∞) u₀qⁿ = u₀/(1-q)</strong>
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> 1 + 1/3 + 1/9 + 1/27 + ... = 1/(1-1/3) = 3/2
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) lim 4×(3/4)ⁿ والمجموع اللانهائي<br/>
2) مربع ضلعه 1. نربط منتصفات أضلاعه... مجموع المساحات؟<br/>
3) lim (3ⁿ + 2ⁿ)/4ⁿ
</div>
</div>' WHERE id = '6e3bbd9e-b2a3-4e9d-8ab8-2dce20130723';

-- 139) تذكير حول الأشعة (شعبة 5)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">تذكير حول الأشعة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. مفاهيم أساسية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 الشعاع AB⃗:</strong> اتجاه + منحى + طول<br/>
AB⃗ = OB⃗ - OA⃗<br/>
علاقة شال: AB⃗ + BC⃗ = AC⃗
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الإحداثيات</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 في المعلم:</strong><br/>
• AB⃗(x_B-x_A, y_B-y_A)<br/>
• ‖AB⃗‖ = √[(Δx)²+(Δy)²]<br/>
• منتصف [AB]: ((x_A+x_B)/2, (y_A+y_B)/2)<br/>
• u⃗ ∥ v⃗ ⟺ xv′-x′v = 0
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> A(2,-1), B(5,3), C(-1,4)<br/>
1) احسب AB⃗ و ‖AB‖<br/>
2) هل AB⃗ و AC⃗ متقاطعان؟<br/>
3) أوجد D حيث ABCD متوازي أضلاع
</div>
</div>' WHERE id = '1d5660f9-fc35-4d96-8490-047c4c3a45f5';

-- 140) مرجح نقطتين (شعبة 5)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">مرجح نقطتين</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 G مرجح {(A,α);(B,β)}, α+β ≠ 0:</strong><br/>
αGA⃗ + βGB⃗ = 0⃗<br/>
OG⃗ = (αOA⃗ + βOB⃗)/(α+β)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الخصائص</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 AG⃗ = β/(α+β)·AB⃗</strong><br/>
• α = β ⟹ G منتصف [AB]<br/>
• لكل M: αMA⃗ + βMB⃗ = (α+β)MG⃗
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> A(1,3), B(7,9), أوزان (2,1)<br/>
G = ((2+7)/3, (6+9)/3) = (3, 5)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> A(-2,1), B(4,7)<br/>
1) أوجد G مرجح بأوزان (3,2)<br/>
2) حدد E = {M: ‖3MA⃗+2MB⃗‖ = 15}<br/>
3) أوجد مرجح بأوزان (1,-2)
</div>
</div>' WHERE id = '9349e797-d212-4aa4-9ef8-736a81419e73';

-- 141) إحداثيات مرجح ثلاث نقاط (شعبة 5)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">إحداثيات مرجح ثلاث نقاط</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الصيغة</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 G مرجح {(A,α);(B,β);(C,γ)}:</strong><br/>
x_G = (αx_A+βx_B+γx_C)/(α+β+γ)<br/>
y_G = (αy_A+βy_B+γy_C)/(α+β+γ)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> A(0,0), B(6,0), C(3,6), أوزان (1,2,3)<br/>
G = ((0+12+9)/6, (0+0+18)/6) = (21/6, 3) = (7/2, 3)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. تطبيقات</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 ‖αMA⃗+βMB⃗+γMC⃗‖ = k ⟹ دائرة مركزها G ونصف قطرها k/|α+β+γ|</strong>
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> A(1,1), B(5,1), C(3,5)<br/>
1) أوجد مركز الثقل<br/>
2) أوجد مرجح بأوزان (2,1,1)<br/>
3) حدد {M: ‖2MA⃗+MB⃗+MC⃗‖ = 8}
</div>
</div>' WHERE id = '949eab17-e7d9-4b83-a9ef-a8cdc376efc0';

-- 142) مرجح عدة نقاط (شعبة 5)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">مرجح عدة نقاط</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعميم</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 G مرجح {(Aᵢ,αᵢ)}:</strong><br/>
Σαᵢ·GAᵢ⃗ = 0⃗<br/>
OG⃗ = Σ(αᵢ·OAᵢ⃗)/Σαᵢ
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. التجميع الجزئي</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 نجمّع نقاطاً في مرجح جزئي:</strong><br/>
{(A,α);(B,β);(C,γ);(D,δ)} → {(I,α+β);(J,γ+δ)}<br/>
حيث I مرجح (A,α)(B,β) و J مرجح (C,γ)(D,δ)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. صيغة المسافات</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 Σαᵢ·MAᵢ² = (Σαᵢ)MG² + Σαᵢ·GAᵢ²</strong>
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> ABCD مربع ضلعه 4<br/>
1) أوجد مرجح {(A,1);(B,2);(C,2);(D,1)}<br/>
2) حدد E = {M: MA²+2MB²+2MC²+MD² = 60}
</div>
</div>' WHERE id = '79f7509b-4853-4cfe-a794-7b46e22f7467';

-- 143) نسبة الجزء إلى الكلّ
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">نسبة الجزء إلى الكلّ</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المفهوم</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 النسبة المئوية = (الجزء/الكلّ) × 100</strong><br/>
مثال: 15 تلميذاً من أصل 40 ⟹ 15/40 × 100 = 37.5%
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. حساب الجزء والكلّ</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 المعادلات:</strong><br/>
• الجزء = الكلّ × (النسبة/100)<br/>
• الكلّ = الجزء / (النسبة/100)<br/>
• معامل الضرب: t% ⟹ المعامل = t/100
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ أمثلة:</strong><br/>
• 25% من 600 = 600 × 0.25 = 150<br/>
• 45 هو x% من 200 ⟹ x = (45/200)×100 = 22.5%<br/>
• 30% من مبلغ = 120 ⟹ المبلغ = 120/0.3 = 400
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) في قسم 35 تلميذاً، 40% إناث. كم عدد الإناث؟<br/>
2) اشترى سلعة بـ 850 DA وبيعها بربح 15%. ما سعر البيع؟<br/>
3) خُفض سعر بـ 20% فأصبح 4800 DA. ما السعر الأصلي؟
</div>
</div>' WHERE id = 'aef4aed2-6fd6-49fd-992a-96b6b2f05be1';

-- 144) النسبة المئوية لنسبة مئوية أخرى
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">النسبة المئوية لنسبة مئوية أخرى</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. نسبة مئوية من مجموعة فرعية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 p% من المجموع هم A. من A، q% يحققون B.</strong><br/>
نسبة B من المجموع = (p/100) × (q/100) × 100 = pq/100 %
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> 60% تلاميذ علميون. منهم 30% اختاروا الرياضيات.<br/>
نسبة تلاميذ الرياضيات من المجموع = 0.6 × 0.3 = 0.18 = 18%
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الجمع بين نسب مئوية</h3>

<div style="background: #fdedec; padding: 15px; border-right: 4px solid #e74c3c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e74c3c;">⚠️ لا يمكن جمع نسب مئوية بمراجع مختلفة!</strong><br/>
30% من A + 20% من B ≠ 50% من (A+B)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) 70% عمال و 30% موظفون. 40% من العمال نساء و 60% من الموظفين نساء. ما نسبة النساء من المجموع؟<br/>
2) 80% من المنتجات مطابقة. 95% من المطابقة تُباع. ما نسبة المُباعة من الإنتاج؟
</div>
</div>' WHERE id = 'f478c6af-b84c-4c4b-9916-4d23c70d6052';

-- 145) التطورات والنسب المئوية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">التطورات والنسب المئوية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. نسبة التطور</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 نسبة التطور = (V_f - V_i)/V_i × 100</strong><br/>
• تطور موجب = زيادة<br/>
• تطور سالب = نقصان<br/>
معامل الضرب: CM = 1 + t/100
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. التطورات المتعاقبة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 زيادة t₁% ثم t₂%:</strong><br/>
CM الكلي = (1+t₁/100)(1+t₂/100)<br/>
⚠️ زيادة 20% ثم نقصان 20% ≠ العودة للقيمة الأصلية!<br/>
CM = 1.2 × 0.8 = 0.96 (نقصان 4%)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. التطور المعاكس</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 CM المعاكس = 1/CM</strong><br/>
بعد زيادة 25% (CM=1.25): للعودة CM=1/1.25=0.8 أي نقصان 20%
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) سعر ارتفع من 500 إلى 600 DA. ما نسبة التطور؟<br/>
2) سعر ارتفع 10% ثم 15%. ما النسبة الإجمالية؟<br/>
3) بعد تخفيض 30%، ما النسبة للعودة للسعر الأصلي؟
</div>
</div>' WHERE id = '462306a8-8afc-45dd-a5f3-f3fd51060b45';

-- 146) المؤشرات
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المؤشرات</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. مفهوم المؤشر</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 المؤشر هو رقم يقيس تطور كمية بالنسبة لقيمة مرجعية (القاعدة)</strong><br/>
I_t = (V_t / V₀) × 100<br/>
حيث V₀ = القيمة في سنة الأساس (المؤشر = 100)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. خصائص المؤشرات</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قواعد:</strong><br/>
• تغيير سنة الأساس: I_{t,new} = (I_t / I_new) × 100<br/>
• نسبة التطور = I_t - 100 (%)<br/>
• معامل الضرب = I_t / 100
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> مؤشر أسعار: 2020: 100, 2021: 105, 2022: 112<br/>
بين 2021 و 2022: (112/105)×100 = 106.67 → زيادة 6.67%
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) إنتاج: 2019: 500, 2020: 550, 2021: 520. احسب المؤشرات (أساس 2019)<br/>
2) مؤشر أسعار أساس 2018: 2020: 108, 2022: 115. غيّر الأساس إلى 2020
</div>
</div>' WHERE id = '749f3644-a56b-44ad-bef0-be7612e7a26c';

-- 147) السلاسل الزمنية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">السلاسل الزمنية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 سلسلة زمنية:</strong> مجموعة ملاحظات لمتغير مرتبة حسب الزمن<br/>
(t₁, y₁), (t₂, y₂), ..., (tₙ, yₙ)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. التمثيل البياني</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 مخطط بياني:</strong> المحور الأفقي = الزمن، العمودي = القيم<br/>
نصل النقاط بمستقيمات (مضلع التكرارات الزمني)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. المركبات</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 يمكن تحليل سلسلة إلى:</strong><br/>
• الاتجاه العام (trend)<br/>
• التغيرات الموسمية (دورية)<br/>
• التغيرات العشوائية
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> مبيعات فصلية (بالآلاف):<br/>
2021: 15, 20, 12, 25 | 2022: 18, 23, 14, 28<br/>
1) مثّل بيانياً<br/>
2) هل هناك اتجاه عام؟ تغيرات موسمية؟
</div>
</div>' WHERE id = '76190620-bcaa-4980-9dfc-c048903a7bbb';

-- 148) التمليس بالأوساط المتحركة
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">التمليس بالأوساط المتحركة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المبدأ</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 التمليس:</strong> إزالة التقلبات لإبراز الاتجاه العام<br/>
الوسط المتحرك لرتبة p: متوسط p قيم متتالية
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الوسط المتحرك من الرتبة 3</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 ȳᵢ = (yᵢ₋₁ + yᵢ + yᵢ₊₁)/3</strong><br/>
⚠️ لا يمكن حساب أول وآخر قيمة
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> القيم: 10, 15, 8, 20, 12, 18, 14<br/>
ȳ₂ = (10+15+8)/3 = 11<br/>
ȳ₃ = (15+8+20)/3 = 14.3<br/>
ȳ₄ = (8+20+12)/3 = 13.3 ...
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> بيانات شهرية: 25, 30, 22, 35, 28, 40, 32, 45<br/>
1) احسب الأوساط المتحركة من الرتبة 3<br/>
2) ارسم السلسلة الأصلية والسلسلة الممهدة<br/>
3) ما الاتجاه العام؟
</div>
</div>' WHERE id = 'e59bc717-f2cc-4799-b6ac-562d1d29a3a5';

-- 149) المدرجات التكرارية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المدرجات التكرارية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المتغير المتصل والفئات</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 عندما تكون البيانات متصلة نجمعها في فئات:</strong><br/>
[a₁,a₂[, [a₂,a₃[, ...<br/>
• مركز الفئة = (aᵢ + aᵢ₊₁)/2<br/>
• سعة الفئة = aᵢ₊₁ - aᵢ
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. المدرج التكراري</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 مستطيلات متلاصقة:</strong><br/>
• القاعدة = سعة الفئة<br/>
• فئات متساوية السعة: الارتفاع = التكرار<br/>
• فئات مختلفة السعة: الارتفاع = التكرار/السعة (الكثافة)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> أعمار 50 شخصاً:<br/>
[10,20[: 8 | [20,30[: 15 | [30,40[: 12 | [40,60[: 10 | [60,80[: 5<br/>
1) ارسم المدرج التكراري (انتبه للسعات المختلفة)<br/>
2) احسب المتوسط باستعمال مراكز الفئات
</div>
</div>' WHERE id = 'c80d21d4-2d14-4c4e-a2c6-ece8326b26f0';

-- 150) التباين-الإنحراف المعياري
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">التباين والإنحراف المعياري</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التباين</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 V = (1/N)Σnᵢ(xᵢ - x̄)²</strong><br/>
= (1/N)Σnᵢxᵢ² - x̄²<br/>
(الصيغة الثانية أسهل للحساب)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الإنحراف المعياري</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 σ = √V</strong><br/>
• بنفس وحدة المتغير (بخلاف التباين)<br/>
• يقيس التشتت حول المتوسط<br/>
• σ صغير ⟹ القيم قريبة من المتوسط
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> علامات: 8, 10, 12, 14, 16 (تكرارات متساوية)<br/>
x̄ = 60/5 = 12<br/>
V = (1/5)(16+4+0+4+16) = 8<br/>
σ = √8 ≈ 2.83
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احسب V و σ: 5, 5, 10, 10, 15, 15, 20, 20<br/>
2) قارن تشتت قسمين: A: x̄=12, σ=2.5 | B: x̄=12.5, σ=4<br/>
3) أضفنا 3 لكل قيمة. ما تأثير ذلك على x̄ و σ؟
</div>
</div>' WHERE id = 'c8e384cc-673b-481f-95ae-6746dbc29b52';
