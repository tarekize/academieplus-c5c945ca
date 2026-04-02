-- =====================================================
-- Terminale - Batch 10/13
-- Covers: الأحداث المستقلة، برنولي، قوانين مستمرة، القانون الأسي، النهايات، الاستمرارية، TVI، الاشتقاقية
-- Lessons 136-150 of 181
-- =====================================================

-- 136) Événements indépendants - الأحداث المستقلة
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الأحداث المستقلة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريف الاستقلال</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> A و B مستقلان ⟺ P(A ∩ B) = P(A) × P(B)<br/>
<strong>ما يعادل:</strong> P(A|B) = P(A) أي أن وقوع B لا يؤثر على A
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. خواص الاستقلال</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 إذا A و B مستقلان:</strong><br/>
• A و B̄ مستقلان<br/>
• Ā و B مستقلان<br/>
• Ā و B̄ مستقلان<br/>
• P(A ∪ B) = P(A) + P(B) - P(A)·P(B) = 1 - P(Ā)·P(B̄)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> تكرار تجربة مستقلة<br/>
نرمي حجر نرد 3 مرات مستقلة. P(6 أول مرة فقط):<br/>
= P(6)·P(6̄)·P(6̄) = (1/6)×(5/6)×(5/6) = 25/216
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) P(A)=0.6, P(B)=0.3, A وB مستقلان. احسب P(A∩B), P(A∪B)<br/>
2) نلعب 5 مباريات مستقلة. P(فوز) = 0.7 في كل مباراة. P(فوز في الكل)؟<br/>
3) P(A)=0.4, P(B)=0.5, P(A∪B)=0.7. هل A وB مستقلان؟
</div>
</div>' WHERE id = '6d295ca6-640b-4600-b701-d285c3372715';

-- 137) Loi de Bernoulli - قانون برنولي
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">قانون برنولي والقانون ذو الحدين</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تجربة برنولي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌</strong> تجربة لها نتيجتان: نجاح (p) أو فشل (q = 1-p)<br/>
X ~ B(p): X = 1 (نجاح) أو X = 0 (فشل)<br/>
E(X) = p, V(X) = pq
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. مخطط برنولي</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 القانون ذو الحدين B(n,p):</strong><br/>
n تكرار مستقل لتجربة برنولي. X = عدد النجاحات<br/>
P(X = k) = C(n,k) × pᵏ × (1-p)ⁿ⁻ᵏ<br/>
E(X) = np, V(X) = npq, σ = √(npq)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> QCM: 10 أسئلة، 4 اختيارات لكل سؤال. X = إجابات صحيحة عشوائياً<br/>
X ~ B(10, 0.25)<br/>
P(X=3) = C(10,3)·(0.25)³·(0.75)⁷ ≈ 0.250<br/>
E(X) = 2.5, σ ≈ 1.37
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) X ~ B(8, 0.3). احسب P(X=2), P(X≤1), P(X≥3)<br/>
2) كم مرة يجب رمي نرد ليكون P(6 مرة واحدة على الأقل) &gt; 0.9؟<br/>
3) مراقبة جودة: 2% معيب. عينة 50. P(3 معيبة على الأكثر)؟
</div>
</div>' WHERE id = '4647fb79-006a-46ff-a04e-95b5081b93e6';

-- 138) Lois de probabilité continues - قوانين الاحتمال المستمرة
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">قوانين الاحتمال المستمرة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. مفهوم المتغير العشوائي المستمر</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> X متغير عشوائي مستمر إذا وُجدت دالة كثافة f حيث:<br/>
• f(x) ≥ 0 على ℝ<br/>
• ∫₋∞⁺∞ f(x)dx = 1<br/>
• P(a ≤ X ≤ b) = ∫ₐᵇ f(x)dx<br/>
<strong>ملاحظة:</strong> P(X = a) = 0 لكل a
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. القانون المنتظم U([a,b])</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 X ~ U([a,b]):</strong><br/>
f(x) = 1/(b-a) إذا x ∈ [a,b] و 0 خارجه<br/>
E(X) = (a+b)/2, V(X) = (b-a)²/12<br/>
P(c ≤ X ≤ d) = (d-c)/(b-a)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> حافلة كل 10 دقائق. وقت الانتظار X ~ U([0,10])<br/>
P(X ≤ 3) = 3/10 = 0.3<br/>
E(X) = 5 دقائق (متوسط الانتظار)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) X ~ U([2,8]). احسب P(3 ≤ X ≤ 5), E(X), σ(X)<br/>
2) أنا أصل عشوائياً بين 8h و 8h30. القطار في 8h15. P(ألتحق بالقطار)؟<br/>
3) بيّن أن f(x) = 3x² على [0,1] هي دالة كثافة. احسب E(X)
</div>
</div>' WHERE id = '1b0419fe-2f44-4e9f-a3c2-c94aae620837';

-- 139) Adéquation à une loi équirépartie - الموافقة لقانون متساوي التوزيع
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الموافقة لقانون متساوي التوزيع</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. مبدأ الاختبار</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 الهدف:</strong> هل النتائج المشاهدة تتوافق مع قانون متساوي الاحتمال؟<br/>
<strong>المبدأ:</strong> نقارن التكرارات المشاهدة (Oᵢ) بالتكرارات النظرية (Eᵢ)<br/>
Eᵢ = n/k (n = العدد الكلي، k = عدد الفئات)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. مسافة χ² (كاي تربيع)</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 الإحصائية:</strong><br/>
d² = Σᵢ (Oᵢ - Eᵢ)²/Eᵢ<br/><br/>
• d² صغير ⟹ توافق جيد<br/>
• d² كبير ⟹ التوزيع ليس متساوياً<br/>
• القرار: نقارن d² بعتبة حرجة (حسب مستوى الدلالة)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> نرمي حجر نرد 60 مرة:<br/>
<table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
<tr style="background: #2c3e50; color: white;"><th style="padding: 8px; border: 1px solid #ddd;">الوجه</th><th style="padding: 8px;">1</th><th style="padding: 8px;">2</th><th style="padding: 8px;">3</th><th style="padding: 8px;">4</th><th style="padding: 8px;">5</th><th style="padding: 8px;">6</th></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">Oᵢ</td><td style="padding: 8px;">12</td><td style="padding: 8px;">8</td><td style="padding: 8px;">11</td><td style="padding: 8px;">9</td><td style="padding: 8px;">10</td><td style="padding: 8px;">10</td></tr>
</table>
Eᵢ = 10 لكل وجه<br/>
d² = (4+4+1+1+0+0)/10 = 1.0 (قيمة صغيرة ⟹ النرد متوازن)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) نرمي عملة 100 مرة: 58 صورة و42 كتابة. احسب d² وقرر<br/>
2) مخبز: 200 زبون موزعون على 5 أيام. هل التوزيع متساوٍ؟
</div>
</div>' WHERE id = 'b4bb927e-c75b-420e-9561-773d8a89479d';

-- 140) Loi exponentielle - القانون الأسي
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">القانون الأسي (الإكسبونانسي)</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 X ~ Exp(λ) (λ &gt; 0):</strong><br/>
دالة الكثافة: f(t) = λe⁻ᵏᵗ إذا t ≥ 0 و 0 إذا t &lt; 0<br/>
P(X ≤ t) = 1 - e⁻ᵏᵗ (t ≥ 0)<br/>
P(X &gt; t) = e⁻ᵏᵗ
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. المعالم</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐</strong><br/>
E(X) = 1/λ (العمر المتوسط)<br/>
V(X) = 1/λ², σ(X) = 1/λ
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. خاصية انعدام الذاكرة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 P(X &gt; s+t | X &gt; s) = P(X &gt; t)</strong><br/>
الماضي لا يؤثر على المستقبل (مثل: عمر جهاز إلكتروني)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> عمر مصباح X ~ Exp(0.001) (λ بالساعة)<br/>
E(X) = 1000 ساعة<br/>
P(X &gt; 500) = e⁻⁰·⁵ ≈ 0.607<br/>
P(X &gt; 1500 | X &gt; 1000) = P(X &gt; 500) ≈ 0.607 (انعدام الذاكرة)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) X ~ Exp(0.5). احسب P(X &gt; 2), P(1 &lt; X &lt; 3), E(X)<br/>
2) مدة مكالمة هاتفية X ~ Exp(λ) مع E(X) = 4 دقائق. أوجد λ و P(X &gt; 6)<br/>
3) تحقق من خاصية انعدام الذاكرة بالحساب المباشر
</div>
</div>' WHERE id = '6b190aef-c4f1-4a0a-ba0a-42c47b45d50c';

-- 141) Limite finie ou infinie en ±∞ - النهايات عند ±∞ (شعبة أخرى)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">النهايات عند ±∞ (تعمّق)</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. طرق حساب النهايات</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 القواعد:</strong><br/>
• <strong>كثير حدود:</strong> lim P(x) = lim (الحد المسيطر)<br/>
• <strong>دالة كسرية:</strong> lim P(x)/Q(x) = lim (أعلى حد/أعلى حد)<br/>
• <strong>أشكال غير محددة:</strong> +∞ - ∞, 0×∞, ∞/∞, 0/0
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ أمثلة متقدمة:</strong><br/>
• lim(x→+∞) (√(x²+x) - x) = lim x²+x-x²)/(√(x²+x)+x) = lim x/(x(√(1+1/x)+1)) = 1/2<br/>
• lim(x→+∞) (1 + 1/x)ˣ = e (نهاية مشهورة)<br/>
• lim(x→+∞) x·sin(1/x) = 1 (بوضع t = 1/x)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. المقاربات</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 </strong><br/>
• lim f(x) = ℓ ⟹ y = ℓ مقارب أفقي<br/>
• lim f(x) = ±∞ عند x₀ ⟹ x = x₀ مقارب عمودي<br/>
• lim [f(x)-(ax+b)] = 0 ⟹ y = ax+b مقارب مائل
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احسب lim(x→+∞) (√(x²+3x) - √(x²-x))<br/>
2) أوجد المقارب المائل لـ f(x) = (x²+1)/(x-1)<br/>
3) احسب lim(x→+∞) (3ˣ + 2ˣ)^(1/x)
</div>
</div>' WHERE id = '1e03cc03-a1f5-4db4-8578-7a27f9d3dd26';

-- 142) Limite finie ou infinie en un point - النهاية في نقطة (شعبة أخرى)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">النهاية في نقطة (تعمّق)</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. رفع أشكال عدم التحديد</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 طرق:</strong><br/>
• <strong>0/0:</strong> تحليل وتبسيط<br/>
• <strong>∞/∞ عند نقطة:</strong> نادر، نستعمل تحويلات<br/>
• <strong>جذور:</strong> نضرب بالمرافق<br/>
• <strong>مثلثية:</strong> نستعمل lim sin(x)/x = 1
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ أمثلة:</strong><br/>
• lim(x→1) (x³-1)/(x-1) = lim(x²+x+1) = 3 (تحليل)<br/>
• lim(x→4) (√x-2)/(x-4) = lim 1/(√x+2) = 1/4 (ضرب بالمرافق)<br/>
• lim(x→0) sin(5x)/(3x) = 5/3 (sin(5x)/(5x) × 5/(3))
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. النهايات من اليمين واليسار</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 التطبيق:</strong><br/>
lim(x→a) f(x) موجودة ⟺ lim(x→a⁺) f(x) = lim(x→a⁻) f(x)<br/>
مهم لدراسة الدوال المعرّفة بأجزاء
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) lim(x→2) (x²-5x+6)/(x²-4)<br/>
2) lim(x→0) (eˣ-1-x)/x²<br/>
3) lim(x→0) (tan(x)-sin(x))/x³
</div>
</div>' WHERE id = '3aeed964-62ac-465d-83ca-4ae7005b461a';

-- 143) Compléments sur les limites - تكملات النهايات (شعبة أخرى)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">تكملات حول النهايات</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. مبرهنة الحصر</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 إذا g(x) ≤ f(x) ≤ h(x) قرب a:</strong><br/>
و lim g(x) = lim h(x) = ℓ ⟹ lim f(x) = ℓ
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ تطبيقات مهمة:</strong><br/>
• lim(x→0) x²·sin(1/x) = 0 لأن -x² ≤ x²sin(1/x) ≤ x²<br/>
• lim(x→+∞) cos(x)/x = 0 لأن -1/x ≤ cos(x)/x ≤ 1/x<br/>
• lim(n→∞) sin(n)/n = 0
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. نهايات مرجعية أساسية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 </strong><br/>
• lim(x→0) sin(x)/x = 1<br/>
• lim(x→0) (eˣ-1)/x = 1<br/>
• lim(x→0) ln(1+x)/x = 1<br/>
• lim(x→0) (1-cos(x))/x² = 1/2<br/>
• lim(x→0) tan(x)/x = 1
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احسب lim(x→0) sin(x²)/x² و lim(x→0) (e³ˣ-1)/(2x)<br/>
2) باستعمال الحصر: lim(x→+∞) sin(eˣ)/x<br/>
3) أوجد lim(x→0) [1/sin(x) - 1/x]
</div>
</div>' WHERE id = '0b44521d-7c36-4928-a4e8-2e609bdf4825';

-- 144) Limite d'une fonction composée - نهاية دالة مركبة (شعبة أخرى)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">نهاية دالة مركبة (تعمّق)</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المبرهنة العامة</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 إذا lim(x→a) u(x) = b و lim(t→b) f(t) = L:</strong><br/>
⟹ lim(x→a) f(u(x)) = L<br/>
(a و b يمكن أن يكونا ±∞)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. تطبيقات متنوعة</h3>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ أمثلة متقدمة:</strong><br/>
• lim(x→+∞) e^(x/(x+1)): u=x/(x+1)→1 ⟹ e¹ = e<br/>
• lim(x→0⁺) ln(1-eˣ): eˣ→1 ⟹ 1-eˣ→0⁻ (غير ممكن لـ ln)<br/>
  لكن lim(x→0⁻) ln(1-eˣ): eˣ→1⁻ ⟹ 1-eˣ→0⁺ ⟹ ln→-∞<br/>
• lim(x→+∞) sin(eˣ): eˣ→+∞ و sin لا نهاية لها ⟹ لا نهاية
</div>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 حالة خاصة: lim(x→a) [f(x)]^g(x)</strong><br/>
نكتب: f^g = e^(g·ln(f))<br/>
<strong>مثال:</strong> lim(x→+∞) (1+1/x)ˣ = e^(lim x·ln(1+1/x)) = e^1 = e
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) lim(x→0⁺) e^(ln(x)²)<br/>
2) lim(x→+∞) (1+2/x)^(3x)<br/>
3) lim(x→0⁺) x^x (إرشاد: اكتب x^x = e^(x·ln(x)))
</div>
</div>' WHERE id = '912159ce-1465-4c20-a896-2d707e308f7a';

-- 145) Continuité - الاستمرارية (شعبة أخرى)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الاستمرارية (تعمّق)</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الاستمرارية في نقطة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 f مستمرة في a ⟺ lim(x→a) f(x) = f(a)</strong><br/>
أي: ∀ε &gt; 0, ∃δ &gt; 0: |x-a| &lt; δ ⟹ |f(x)-f(a)| &lt; ε
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. أنواع عدم الاستمرارية</h3>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ </strong><br/>
• <strong>عدم استمرارية قابلة للرفع:</strong> النهاية موجودة لكن f(a) مختلفة/غير معرّفة<br/>
  مثال: f(x) = sin(x)/x عند 0<br/>
• <strong>قفزة:</strong> النهايات اليمنى واليسرى مختلفة<br/>
  مثال: f(x) = E(x) (الجزء الصحيح)<br/>
• <strong>أساسية:</strong> لا نهاية (تذبذب)<br/>
  مثال: f(x) = sin(1/x) عند 0
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. التمديد بالاستمرارية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 </strong> إذا lim(x→a) f(x) = ℓ وf(a) غير معرّفة:<br/>
نعرّف g(x) = f(x) إذا x ≠ a و g(a) = ℓ ⟹ g مستمرة
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) ادرس استمرارية f(x) = {(x²-1)/(x-1) إذا x≠1; 3 إذا x=1}<br/>
2) أوجد a,b ليكون g(x) = {ax+b إذا x≤1; x² إذا x&gt;1} مستمرة وقابلة للاشتقاق<br/>
3) مدّد h(x) = (eˣ-1)/x بالاستمرارية عند 0
</div>
</div>' WHERE id = 'f0744f40-dfd9-4ffc-b983-5beef30948fa';

-- 146) Théorème des valeurs intermédiaires - مبرهنة القيم الوسطية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">مبرهنة القيم الوسطية (TVI)</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المبرهنة</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 مبرهنة TVI:</strong> f مستمرة على [a,b]<br/>
∀k بين f(a) و f(b): ∃c ∈ [a,b]: f(c) = k<br/><br/>
<strong>حالة خاصة (بولزانو):</strong><br/>
f(a)·f(b) &lt; 0 ⟹ ∃c ∈ ]a,b[: f(c) = 0
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. وحدانية الحل</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 إذا f مستمرة ورتيبة قطعاً على [a,b]:</strong><br/>
f(c) = k يقبل حلاً وحيداً (مبرهنة التقابل)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> بيّن أن eˣ = x + 2 تقبل حلاً وحيداً<br/>
f(x) = eˣ - x - 2<br/>
f''(x) = eˣ - 1 = 0 ⟹ x = 0<br/>
f(0) = -1 &lt; 0 (صغرى) ⟹ المعادلة لها حلان<br/>
بل: f(-2) = e⁻² &gt; 0 و f(0) &lt; 0 و f(2) = e²-4 &gt; 0<br/>
حلان: α ∈ ]-2,0[ و β ∈ ]0,2[
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) بيّن أن x⁵ + x - 1 = 0 لها حل وحيد<br/>
2) بيّن أن cos(x) = x لها حل وحيد في [0, π/2]<br/>
3) حدد عدد حلول ln(x) = 2 - x
</div>
</div>' WHERE id = 'b5c68cb6-6bc0-4284-b45b-d698d68f95d1';

-- 147) Fonctions continues et strictement monotones - الدوال المستمرة والرتيبة (شعبة أخرى)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الدوال المستمرة والرتيبة قطعاً (تعمّق)</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. مبرهنة التقابل</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐</strong> f مستمرة ورتيبة قطعاً على I ⟹<br/>
f تحقق تقابلاً من I إلى f(I).<br/>
الدالة العكسية f⁻¹ موجودة ومستمرة ورتيبة بنفس الاتجاه.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الدالة العكسية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌</strong><br/>
• (Cf⁻¹) هو انعكاس (Cf) بالنسبة للمستقيم y = x<br/>
• f(f⁻¹(x)) = x و f⁻¹(f(x)) = x<br/>
• (f⁻¹)''(y) = 1/f''(x) حيث y = f(x)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = x³ متزايدة قطعاً على ℝ<br/>
f⁻¹(x) = ³√x = x^(1/3)<br/>
(f⁻¹)''(x) = (1/3)x^(-2/3) = 1/(3x^(2/3))<br/>
تحقق: f''(f⁻¹(x)) · (f⁻¹)''(x) = 3(³√x)² · 1/(3x^(2/3)) = 1 ✓
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) بيّن أن f(x) = 2x+1)/(x-1) تقابل ثم أوجد f⁻¹<br/>
2) f(x) = eˣ + x. بيّن أن f تقابل من ℝ إلى ]-1,+∞[ ثم أوجد (f⁻¹)''(1)<br/>
3) ارسم (Cf) و (Cf⁻¹) لـ f(x) = x² على [0,+∞[
</div>
</div>' WHERE id = 'aa4f240b-5670-428d-b111-8b4a02a49bab';

-- 148) Dérivabilité - الاشتقاقية (شعبة أخرى)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الاشتقاقية (تعمّق)</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المشتقة من اليمين واليسار</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐</strong><br/>
f''ᵈ(a) = lim(h→0⁺) [f(a+h)-f(a)]/h (المشتقة من اليمين)<br/>
f''ᵍ(a) = lim(h→0⁻) [f(a+h)-f(a)]/h (المشتقة من اليسار)<br/><br/>
f قابلة للاشتقاق في a ⟺ f''ᵈ(a) = f''ᵍ(a)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = |x| في 0<br/>
f''ᵈ(0) = lim(h→0⁺) |h|/h = 1<br/>
f''ᵍ(0) = lim(h→0⁻) |h|/h = -1<br/>
f''ᵈ(0) ≠ f''ᵍ(0) ⟹ f غير قابلة للاشتقاق في 0 (نقطة حادة)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. المشتقة الثانية والتحدب</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌</strong><br/>
• f''''(x) &gt; 0 ⟹ f محدّبة (المنحنى فوق المماسات)<br/>
• f''''(x) &lt; 0 ⟹ f مقعّرة (المنحنى تحت المماسات)<br/>
• f''''(a) = 0 مع تغيّر إشارة ⟹ نقطة انعطاف
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) ادرس اشتقاقية f(x) = {x² إذا x≥0; -x² إذا x&lt;0} في 0<br/>
2) أوجد نقاط الانعطاف لـ g(x) = x⁴ - 6x² + 1<br/>
3) بيّن أن eˣ ≥ 1+x باستعمال التحدب
</div>
</div>' WHERE id = '3b1d9369-c5a3-4585-be6d-dee75ab3c8a6';

-- 149) Dérivées et opérations - المشتقات والعمليات (شعبة أخرى)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المشتقات والعمليات (تعمّق)</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. مشتقة دالة مركبة</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغة السلسلة:</strong><br/>
[f(g(x))]'' = g''(x) · f''(g(x))<br/><br/>
<strong>حالات شائعة:</strong><br/>
• [uⁿ]'' = n·u''·uⁿ⁻¹<br/>
• [eᵘ]'' = u''·eᵘ<br/>
• [ln(u)]'' = u''/u<br/>
• [√u]'' = u''/(2√u)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ أمثلة متقدمة:</strong><br/>
• f(x) = ln(eˣ+1) ⟹ f''(x) = eˣ/(eˣ+1)<br/>
• g(x) = e^(sin(x²)) ⟹ g''(x) = 2x·cos(x²)·e^(sin(x²))<br/>
• h(x) = [ln(x)]³ ⟹ h''(x) = 3[ln(x)]²/x
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. مشتقة الدالة العكسية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌</strong> (f⁻¹)''(y) = 1/f''(f⁻¹(y))<br/>
<strong>مثال:</strong> f(x) = eˣ, f⁻¹(y) = ln(y)<br/>
(f⁻¹)''(y) = 1/e^(ln(y)) = 1/y ✓
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) اشتق: f(x) = √(1+e²ˣ)<br/>
2) اشتق: g(x) = (sin(x))^x (إرشاد: g = e^(x·ln(sin(x))))<br/>
3) أوجد (f⁻¹)''(2) إذا f(x) = x³+x و f(1)=2
</div>
</div>' WHERE id = '3ae34b73-01d2-4f90-af6d-942636e93c43';

-- 150) Sens de variation d'une fonction - اتجاه تغير دالة (شعبة أخرى)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">اتجاه تغير دالة (تعمّق)</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. دراسة تغيرات دوال متقدمة</h3>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 1:</strong> f(x) = (x²-1)·eˣ<br/>
f''(x) = 2x·eˣ + (x²-1)·eˣ = (x²+2x-1)·eˣ<br/>
f''(x) = 0 ⟹ x = -1±√2<br/>
x₁ = -1-√2 ≈ -2.41 و x₂ = -1+√2 ≈ 0.41
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 2:</strong> g(x) = ln(x)/x على ]0,+∞[<br/>
g''(x) = (1-ln(x))/x²<br/>
g''(x) = 0 ⟹ x = e<br/>
g(e) = 1/e (عظمى مطلقة)<br/>
<strong>نتيجة:</strong> ln(x)/x ≤ 1/e لكل x &gt; 0
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. تطبيقات على المتراجحات</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 طريقة:</strong> لإثبات f(x) ≥ g(x):<br/>
1) ندرس h(x) = f(x) - g(x)<br/>
2) نثبت h(x) ≥ 0 بدراسة تغيرات h<br/>
<strong>مثال:</strong> eˣ ≥ 1+x: h(x) = eˣ-1-x, h''(x) = eˣ-1 = 0 ⟹ x=0<br/>
h(0) = 0 (صغرى) ⟹ h(x) ≥ 0 ✓
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) ادرس تغيرات f(x) = x·e^(-x²) وأنشئ جدول التغيرات<br/>
2) بيّن أن ln(x) ≤ x - 1 لكل x &gt; 0<br/>
3) بيّن أن x - x³/6 ≤ sin(x) ≤ x لكل x ≥ 0
</div>
</div>' WHERE id = '566c4f5b-7cc2-4659-a19b-2af4f3b15229';
