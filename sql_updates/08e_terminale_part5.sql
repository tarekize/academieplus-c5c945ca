-- =====================================================
-- Terminale - Batch 5/13
-- Covers: المستقيمات المقاربة، تخمين النهايات، المحاكاة، الاحتمالات، المتتاليات، الاشتقاق
-- Lessons 61-75 of 181 (French-titled stream)
-- =====================================================

-- 61) Asymptotes et interprétation - المستقيمات المقاربة وتأويلها
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المستقيمات المقاربة وتأويلها</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المستقيم المقارب الأفقي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> المستقيم y = ℓ مقارب أفقي لمنحنى f إذا:<br/>
lim(x→+∞) f(x) = ℓ أو lim(x→-∞) f(x) = ℓ<br/>
<strong>التأويل:</strong> المنحنى يقترب من المستقيم y = ℓ عند اللانهاية
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. المستقيم المقارب العمودي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> المستقيم x = a مقارب عمودي إذا:<br/>
lim(x→a⁺) f(x) = ±∞ أو lim(x→a⁻) f(x) = ±∞
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. المستقيم المقارب المائل</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 طريقة:</strong> المستقيم y = ax + b مقارب مائل إذا:<br/>
a = lim(x→±∞) f(x)/x و b = lim(x→±∞) [f(x) - ax]<br/>
أي: lim(x→±∞) [f(x) - (ax+b)] = 0
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = (2x²+x+1)/(x+1)<br/>
• x = -1 مقارب عمودي<br/>
• f(x) = 2x - 1 + 2/(x+1) ⟹ y = 2x - 1 مقارب مائل<br/>
• موقع المنحنى: f(x) - (2x-1) = 2/(x+1) &gt; 0 إذا x &gt; -1
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) أوجد المقاربات لـ f(x) = (x²-1)/(x-2)<br/>
2) أوجد المقاربات لـ g(x) = (2x+1)·e⁻ˣ<br/>
3) بيّن أن y = x مقارب مائل لـ h(x) = x + ln(x)/x
</div>
</div>' WHERE id = 'b53e466d-edab-4b1f-9fdb-b6b4896edf9a';

-- 62) Conjecture des limites - تخمين النهايات
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">تخمين النهايات</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. مفهوم التخمين</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 المبدأ:</strong><br/>
• التخمين هو حدس رياضي مبني على ملاحظة أو حساب<br/>
• نستعمل الآلة الحاسبة أو جدول قيم لتخمين lim f(x)<br/>
• التخمين ليس برهاناً! يجب إثبات النهاية بالتعريف أو القواعد
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. طريقة التخمين بالجدول</h3>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> تخمين lim(x→+∞) (1+1/x)ˣ<br/>
<table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
<tr style="background: #2c3e50; color: white;"><th style="padding: 8px; border: 1px solid #ddd;">x</th><th style="padding: 8px;">10</th><th style="padding: 8px;">100</th><th style="padding: 8px;">1000</th><th style="padding: 8px;">10000</th></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">(1+1/x)ˣ</td><td style="padding: 8px;">2.594</td><td style="padding: 8px;">2.705</td><td style="padding: 8px;">2.717</td><td style="padding: 8px;">2.718</td></tr>
</table>
<strong>التخمين:</strong> lim(x→+∞) (1+1/x)ˣ = e ≈ 2.718
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. قواعد حساب النهايات</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 نهايات مرجعية:</strong><br/>
• lim(x→+∞) eˣ/xⁿ = +∞ (الأسية تسيطر)<br/>
• lim(x→+∞) ln(x)/xⁿ = 0 (كثيرات الحدود تسيطر على ln)<br/>
• lim(x→0) sin(x)/x = 1<br/>
• lim(x→0) (eˣ-1)/x = 1
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) خمّن بالجدول lim(x→0⁺) x·ln(x)<br/>
2) خمّن lim(n→+∞) (1+2/n)ⁿ<br/>
3) أثبت أن lim(x→+∞) ln(x)/√x = 0
</div>
</div>' WHERE id = '207475d6-e637-4f6a-8029-c1e7a889bd6c';

-- 63) Simulation et fréquences - المحاكاة والتواترات
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المحاكاة والتواترات</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التجربة العشوائية والمحاكاة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong><br/>
• التجربة العشوائية: نتيجتها غير محددة مسبقاً<br/>
• المحاكاة: استنساخ التجربة باستعمال أداة (حاسوب، آلة حاسبة)<br/>
• الغرض: تقدير الاحتمال عبر التكرار
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. التواتر النسبي والاحتمال</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قانون الأعداد الكبيرة:</strong><br/>
التواتر النسبي fₙ(A) = عدد مرات A / n<br/>
عندما n → +∞: fₙ(A) → P(A)<br/>
أي: التواتر يقترب من الاحتمال النظري
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> رمي حجر نرد 1000 مرة:<br/>
<table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
<tr style="background: #2c3e50; color: white;"><th style="padding: 8px; border: 1px solid #ddd;">الوجه</th><th style="padding: 8px;">1</th><th style="padding: 8px;">2</th><th style="padding: 8px;">3</th><th style="padding: 8px;">4</th><th style="padding: 8px;">5</th><th style="padding: 8px;">6</th></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">التواتر</td><td style="padding: 8px;">168</td><td style="padding: 8px;">172</td><td style="padding: 8px;">159</td><td style="padding: 8px;">170</td><td style="padding: 8px;">165</td><td style="padding: 8px;">166</td></tr>
<tr style="background: #f8f9fa;"><td style="padding: 8px; border: 1px solid #ddd;">fₙ</td><td style="padding: 8px;">0.168</td><td style="padding: 8px;">0.172</td><td style="padding: 8px;">0.159</td><td style="padding: 8px;">0.170</td><td style="padding: 8px;">0.165</td><td style="padding: 8px;">0.166</td></tr>
</table>
جميع التواترات قريبة من 1/6 ≈ 0.167
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) صمم محاكاة لرمي قطعة نقدية 500 مرة. قارن fₙ بـ 0.5<br/>
2) نرمي نردين ونحسب المجموع. خمّن P(S=7) بالمحاكاة<br/>
3) اشرح لماذا لا يمكن للمحاكاة أن تعطي القيمة الدقيقة للاحتمال
</div>
</div>' WHERE id = '7eb8e0b3-a813-44a8-9ceb-ec7348fb8a84';

-- 64) Calcul de la probabilité - حساب الاحتمال
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">حساب الاحتمال</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. فضاء العينة والأحداث</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريفات:</strong><br/>
• Ω: فضاء العينة (مجموعة النتائج الممكنة)<br/>
• A ⊂ Ω: حدث<br/>
• A̅: الحدث المضاد<br/>
• متساوي الاحتمال: P(ω) = 1/Card(Ω) لكل ω ∈ Ω
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. قواعد الحساب</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قواعد:</strong><br/>
• P(A̅) = 1 - P(A)<br/>
• P(A ∪ B) = P(A) + P(B) - P(A ∩ B)<br/>
• إذا A ∩ B = ∅: P(A ∪ B) = P(A) + P(B)<br/>
• في حالة تساوي الاحتمال: P(A) = Card(A)/Card(Ω)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> سحب بطاقة من 52.<br/>
A: بطاقة حمراء، B: ملك<br/>
P(A) = 26/52 = 1/2, P(B) = 4/52 = 1/13<br/>
P(A ∩ B) = 2/52 (ملكان أحمران)<br/>
P(A ∪ B) = 1/2 + 1/13 - 2/52 = 28/52 = 7/13
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) نرمي نردين. احسب P(مجموع = 7) و P(مجموع ≥ 10)<br/>
2) صندوق به 5 كرات حمراء و3 زرقاء. نسحب 2 دون إرجاع. P(لون واحد)؟<br/>
3) 60% من الطلاب ينجحون بالرياضيات و70% بالفيزياء و50% بكليهما. ما P(نجاح بأحدهما)؟
</div>
</div>' WHERE id = 'b44063b0-403c-4afa-8780-d6ee404a0326';

-- 65) Loi de probabilité - قانون الاحتمال
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">قانون الاحتمال</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المتغير العشوائي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> المتغير العشوائي X تطبيق من Ω إلى ℝ.<br/>
قانون X: جدول يعطي القيم xᵢ والاحتمالات P(X = xᵢ)<br/>
<strong>شرط:</strong> Σ P(X = xᵢ) = 1
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> نرمي حجر نرد. X = مربع العدد الظاهر.<br/>
<table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
<tr style="background: #2c3e50; color: white;"><th style="padding: 8px; border: 1px solid #ddd;">xᵢ</th><th style="padding: 8px;">1</th><th style="padding: 8px;">4</th><th style="padding: 8px;">9</th><th style="padding: 8px;">16</th><th style="padding: 8px;">25</th><th style="padding: 8px;">36</th></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">P(X=xᵢ)</td><td style="padding: 8px;">1/6</td><td style="padding: 8px;">1/6</td><td style="padding: 8px;">1/6</td><td style="padding: 8px;">1/6</td><td style="padding: 8px;">1/6</td><td style="padding: 8px;">1/6</td></tr>
</table>
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. دالة التوزيع</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 تعريف:</strong> F(x) = P(X ≤ x)<br/>
• F متزايدة<br/>
• lim(x→-∞) F(x) = 0 و lim(x→+∞) F(x) = 1<br/>
• P(a &lt; X ≤ b) = F(b) - F(a)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) نرمي قطعتين نقديتين. X = عدد مرات الصورة. أوجد قانون X<br/>
2) نسحب 3 كرات من صندوق به 4 حمراء و6 زرقاء. X = عدد الحمراء. أوجد قانون X<br/>
3) أوجد P(X ≥ 2) في المثال السابق
</div>
</div>' WHERE id = '7a138071-2716-4349-b7f1-d062753e9fec';

-- 66) Espérance mathématique et variance - الأمل الرياضي والتباين
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الأمل الرياضي والتباين</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الأمل الرياضي (التوقع)</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 تعريف:</strong> E(X) = Σ xᵢ × P(X = xᵢ)<br/>
<strong>تأويل:</strong> المتوسط النظري على عدد كبير من التكرارات<br/>
<strong>خواص:</strong> E(aX+b) = aE(X) + b
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. التباين والانحراف المعياري</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 تعريفات:</strong><br/>
V(X) = E[(X - E(X))²] = E(X²) - [E(X)]²<br/>
σ(X) = √V(X) (الانحراف المعياري)<br/>
<strong>خواص:</strong> V(aX+b) = a²V(X)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> نرمي نرداً. X = العدد الظاهر.<br/>
E(X) = (1+2+3+4+5+6)/6 = 3.5<br/>
E(X²) = (1+4+9+16+25+36)/6 = 91/6<br/>
V(X) = 91/6 - (3.5)² = 91/6 - 49/4 = 35/12 ≈ 2.92<br/>
σ(X) = √(35/12) ≈ 1.71
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) X يتبع القانون: P(X=0)=0.3, P(X=1)=0.5, P(X=2)=0.2. احسب E(X), V(X), σ(X)<br/>
2) لعبة: تربح 10 دج بإحتمال 1/4 وتخسر 2 دج بإحتمال 3/4. هل اللعبة عادلة؟<br/>
3) Y = 3X - 2. احسب E(Y) و V(Y) بدلالة E(X) و V(X)
</div>
</div>' WHERE id = '9a8a68c4-eafb-4867-8f09-7de974b78a38';

-- 67) Généralités sur les suites - عموميات حول المتتاليات
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">عموميات حول المتتاليات</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريف المتتالية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> المتتالية العددية (uₙ) تطبيق من ℕ إلى ℝ.<br/>
<strong>طرق التعريف:</strong><br/>
• بالصيغة الصريحة: uₙ = f(n) مثل uₙ = 2n+1<br/>
• بعلاقة التراجع: uₙ₊₁ = f(uₙ) مع u₀ معطى مثل uₙ₊₁ = 2uₙ - 1
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الرتابة</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 طرق دراسة الرتابة:</strong><br/>
• دراسة إشارة uₙ₊₁ - uₙ<br/>
• دراسة uₙ₊₁/uₙ (للحدود الموجبة)<br/>
• استعمال دالة f حيث uₙ = f(n) ودراسة اشتقاقها
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> uₙ = n² - 5n<br/>
uₙ₊₁ - uₙ = (n+1)² - 5(n+1) - n² + 5n = 2n - 4<br/>
2n - 4 ≥ 0 ⟺ n ≥ 2<br/>
⟹ (uₙ) متناقصة لـ n ≤ 2 ومتزايدة لـ n ≥ 2
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احسب الحدود الخمسة الأولى لـ uₙ = (-1)ⁿ/n<br/>
2) ادرس رتابة uₙ = n/(n+1)<br/>
3) uₙ₊₁ = √(2uₙ+3), u₀ = 0. احسب u₁, u₂, u₃ وخمّن الرتابة
</div>
</div>' WHERE id = '3c05a945-6547-4039-aca1-4eb464845b47';

-- 68) Raisonnement par récurrence - الاستدلال بالتراجع
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الاستدلال بالتراجع (البرهان بالتراجع)</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المبدأ</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 الخطوات:</strong><br/>
<strong>التهيئة:</strong> نتحقق أن الخاصية P(n₀) صحيحة<br/>
<strong>الوراثة:</strong> لكل n ≥ n₀: نفترض P(n) صحيحة ⟹ نبرهن P(n+1)<br/>
<strong>الخاتمة:</strong> حسب مبدأ التراجع، P(n) صحيحة لكل n ≥ n₀
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. تطبيقات</h3>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 1:</strong> بيّن أن 1+2+...+n = n(n+1)/2<br/>
<strong>التهيئة:</strong> n=1: 1 = 1×2/2 = 1 ✓<br/>
<strong>الوراثة:</strong> نفترض: 1+2+...+n = n(n+1)/2<br/>
1+2+...+n+(n+1) = n(n+1)/2 + (n+1)<br/>
= (n+1)(n/2 + 1) = (n+1)(n+2)/2 ✓
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 2:</strong> بيّن أن 3ⁿ ≥ 2n+1 لكل n ≥ 1<br/>
<strong>التهيئة:</strong> n=1: 3 ≥ 3 ✓<br/>
<strong>الوراثة:</strong> 3ⁿ⁺¹ = 3×3ⁿ ≥ 3(2n+1) = 6n+3 ≥ 2(n+1)+1 (لأن 4n ≥ 0) ✓
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) بيّن بالتراجع أن n! ≥ 2ⁿ⁻¹ لكل n ≥ 1<br/>
2) بيّن أن Σₖ₌₁ⁿ k³ = [n(n+1)/2]²<br/>
3) بيّن أن 4ⁿ + 6n - 1 يقبل القسمة على 9 لكل n ≥ 1
</div>
</div>' WHERE id = '6a8756f5-5abe-412d-9ee9-0776869face7';

-- 69) Suites bornées - المتتاليات المحدودة
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المتتاليات المحدودة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريفات:</strong><br/>
• (uₙ) محدودة من أعلى ⟺ ∃M: uₙ ≤ M لكل n<br/>
• (uₙ) محدودة من أسفل ⟺ ∃m: uₙ ≥ m لكل n<br/>
• (uₙ) محدودة ⟺ محدودة من أعلى ومن أسفل ⟺ ∃M: |uₙ| ≤ M لكل n
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. خواص</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 مبرهنات:</strong><br/>
• كل متتالية متقاربة محدودة (العكس غير صحيح)<br/>
• كل متتالية متزايدة ومحدودة من أعلى متقاربة<br/>
• كل متتالية متناقصة ومحدودة من أسفل متقاربة<br/>
(مبرهنة المتتاليات الرتيبة المحدودة)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong><br/>
• uₙ = (-1)ⁿ: محدودة (|uₙ| ≤ 1) لكنها غير متقاربة<br/>
• uₙ = 1/n: محدودة ومتقاربة نحو 0<br/>
• uₙ = n²: غير محدودة (من أعلى)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) بيّن أن uₙ = n/(n+1) محدودة<br/>
2) بيّن أن uₙ₊₁ = √(2+uₙ), u₀ = 0 محدودة بـ 2 ومتزايدة ثم استنتج تقاربها<br/>
3) أعط مثالاً لمتتالية محدودة غير رتيبة وغير متقاربة
</div>
</div>' WHERE id = 'ab3171d2-9964-4d1a-916d-3cc8deb6ef0b';

-- 70) Suites monotones - المتتاليات الرتيبة
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المتتاليات الرتيبة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. طرق دراسة الرتابة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 الطريقة 1:</strong> دراسة إشارة uₙ₊₁ - uₙ<br/>
• uₙ₊₁ - uₙ ≥ 0 لكل n ⟹ متزايدة<br/>
• uₙ₊₁ - uₙ ≤ 0 لكل n ⟹ متناقصة
</div>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 الطريقة 2:</strong> (إذا uₙ &gt; 0) دراسة uₙ₊₁/uₙ<br/>
• uₙ₊₁/uₙ ≥ 1 ⟹ متزايدة<br/>
• uₙ₊₁/uₙ ≤ 1 ⟹ متناقصة
</div>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 الطريقة 3:</strong> إذا uₙ = f(n)، ندرس f'' على [0,+∞[
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> uₙ = 2ⁿ/n!<br/>
uₙ₊₁/uₙ = 2/(n+1) &lt; 1 لـ n ≥ 2<br/>
⟹ (uₙ) متناقصة ابتداءً من n = 2
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) ادرس رتابة uₙ = 3n/(n²+1)<br/>
2) ادرس رتابة uₙ = (n+1)!/2ⁿ<br/>
3) uₙ₊₁ = uₙ²/2, u₀ = 1. ادرس رتابتها
</div>
</div>' WHERE id = 'c14cde02-22ba-43b9-af01-0c00a8f010a3';

-- 71) Suites convergentes - المتتاليات المتقاربة
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المتتاليات المتقاربة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريف التقارب</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> (uₙ) تتقارب نحو ℓ ⟺ lim(n→+∞) uₙ = ℓ<br/>
أي: ∀ε &gt; 0, ∃N ∈ ℕ: n ≥ N ⟹ |uₙ - ℓ| &lt; ε<br/>
إذا لم تتقارب نقول إنها متباعدة.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. قواعد حساب النهايات</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قواعد:</strong><br/>
• lim(uₙ + vₙ) = lim uₙ + lim vₙ (إذا لم يكن هناك شكل غير محدد)<br/>
• lim(uₙ × vₙ) = lim uₙ × lim vₙ<br/>
• lim(1/uₙ) = 1/lim uₙ (إذا lim uₙ ≠ 0)<br/><br/>
<strong>أشكال غير محددة:</strong> +∞-∞, 0×∞, ∞/∞, 0/0
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. مبرهنات مفيدة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 مبرهنة الحصر (الشرطية):</strong><br/>
إذا uₙ ≤ vₙ ≤ wₙ و lim uₙ = lim wₙ = ℓ ⟹ lim vₙ = ℓ
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احسب lim (3n²+2n)/(n²-1)<br/>
2) باستعمال الحصر بيّن أن lim sin(n)/n = 0<br/>
3) احسب lim (√(n²+n) - n)
</div>
</div>' WHERE id = '39bb9f3f-c2c0-4e0b-88ad-537553923ccc';

-- 72) Suite définie par Un+1 = aUn + b
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المتتالية المعرّفة بـ Uₙ₊₁ = aUₙ + b</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الحالة a = 1 (حسابية)</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 </strong> uₙ₊₁ = uₙ + b ⟹ uₙ = u₀ + nb<br/>
Sₙ = (n+1)(u₀ + uₙ)/2
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الحالة b = 0 (هندسية)</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 </strong> uₙ₊₁ = auₙ ⟹ uₙ = u₀ × aⁿ<br/>
Sₙ = u₀(1-aⁿ⁺¹)/(1-a) إذا a ≠ 1
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. الحالة العامة a ≠ 1, b ≠ 0</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 طريقة:</strong><br/>
1) أوجد ℓ = b/(1-a) (النقطة الثابتة)<br/>
2) vₙ = uₙ - ℓ ⟹ vₙ₊₁ = avₙ (هندسية)<br/>
3) vₙ = (u₀ - ℓ)aⁿ<br/>
4) <strong>uₙ = (u₀ - ℓ)aⁿ + ℓ</strong><br/><br/>
<strong>التقارب:</strong> إذا |a| &lt; 1 ⟹ lim uₙ = ℓ
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> uₙ₊₁ = 0.5uₙ + 3, u₀ = 0<br/>
ℓ = 3/(1-0.5) = 6<br/>
vₙ = uₙ - 6, v₀ = -6, vₙ = -6×(0.5)ⁿ<br/>
uₙ = 6 - 6×(0.5)ⁿ = 6(1 - (0.5)ⁿ)<br/>
lim uₙ = 6
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) uₙ₊₁ = 2uₙ + 1, u₀ = 0. أوجد uₙ<br/>
2) uₙ₊₁ = -0.5uₙ + 9, u₀ = 3. أوجد uₙ وادرس التقارب<br/>
3) احسب S = Σₖ₌₀ⁿ uₖ في المثال 2
</div>
</div>' WHERE id = 'dcdba2d5-78ec-49a7-acc2-30c082942164';

-- 73) Convergence d'une suite récurrente - تقارب متتالية بالتراجع
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">تقارب متتالية معرّفة بالتراجع</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المبدأ العام</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 لدراسة uₙ₊₁ = f(uₙ):</strong><br/>
1) حدد مجال [a,b] بحيث f([a,b]) ⊂ [a,b] (المجال المستقر)<br/>
2) ادرس رتابة (uₙ) (بالتراجع عادةً)<br/>
3) بيّن أنها محدودة<br/>
4) استنتج التقارب<br/>
5) أوجد النهاية بحل ℓ = f(ℓ)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> uₙ₊₁ = √(2uₙ + 3), u₀ = 0<br/>
f(x) = √(2x+3), f''(x) = 1/√(2x+3) &gt; 0 ⟹ f متزايدة<br/>
• بالتراجع: 0 ≤ uₙ ≤ 3 (المجال المستقر [0,3])<br/>
• uₙ₊₁ - uₙ = f(uₙ) - uₙ. بما أن u₁ = √3 &gt; 0 = u₀ و f متزايدة ⟹ (uₙ) متزايدة<br/>
• متزايدة ومحدودة ⟹ متقاربة<br/>
• ℓ = √(2ℓ+3) ⟹ ℓ² = 2ℓ+3 ⟹ ℓ = 3 (لأن ℓ ≥ 0)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) uₙ₊₁ = (uₙ + 2/uₙ)/2, u₀ = 2. بيّن التقارب وأوجد النهاية<br/>
2) uₙ₊₁ = cos(uₙ), u₀ = 0. خمّن النهاية عددياً<br/>
3) uₙ₊₁ = uₙ(3-uₙ)/2, u₀ = 0.5. ادرس التقارب
</div>
</div>' WHERE id = 'e9c45a18-4235-4760-bba1-527c1fcd6890';

-- 74) Rappel sur la dérivation - تذكير حول الاشتقاق
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">تذكير حول الاشتقاق</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريف المشتقة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> f قابلة للاشتقاق في a إذا:<br/>
lim(x→a) [f(x) - f(a)]/(x - a) = f''(a) (عدد حقيقي)<br/>
أو: lim(h→0) [f(a+h) - f(a)]/h = f''(a)<br/>
<strong>هندسياً:</strong> f''(a) = ميل المماس في a
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. جدول المشتقات الأساسية</h3>

<table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
<tr style="background: #2c3e50; color: white;"><th style="padding: 8px; border: 1px solid #ddd;">f(x)</th><th style="padding: 8px; border: 1px solid #ddd;">f''(x)</th><th style="padding: 8px; border: 1px solid #ddd;">مجال الاشتقاق</th></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">k (ثابت)</td><td style="padding: 8px; border: 1px solid #ddd;">0</td><td style="padding: 8px; border: 1px solid #ddd;">ℝ</td></tr>
<tr style="background: #f8f9fa;"><td style="padding: 8px; border: 1px solid #ddd;">xⁿ</td><td style="padding: 8px; border: 1px solid #ddd;">nxⁿ⁻¹</td><td style="padding: 8px; border: 1px solid #ddd;">ℝ</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">1/x</td><td style="padding: 8px; border: 1px solid #ddd;">-1/x²</td><td style="padding: 8px; border: 1px solid #ddd;">ℝ*</td></tr>
<tr style="background: #f8f9fa;"><td style="padding: 8px; border: 1px solid #ddd;">√x</td><td style="padding: 8px; border: 1px solid #ddd;">1/(2√x)</td><td style="padding: 8px; border: 1px solid #ddd;">]0,+∞[</td></tr>
</table>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. العمليات على المشتقات</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قواعد:</strong><br/>
• (u + v)'' = u'' + v''<br/>
• (ku)'' = ku''<br/>
• (uv)'' = u''v + uv''<br/>
• (u/v)'' = (u''v - uv'')/v²
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) اشتق: f(x) = (2x+1)(x²-3) و g(x) = (x+1)/(x-1)<br/>
2) أوجد معادلة المماس لـ f(x) = √x عند x = 4<br/>
3) باستعمال التعريف، احسب مشتقة f(x) = x² + 3x في النقطة 1
</div>
</div>' WHERE id = 'cc264f75-e83e-4fa8-b11d-1149eea73c9d';

-- 75) Fonctions dérivées - الدوال المشتقة
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الدوال المشتقة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. مشتقات الدوال المركبة</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قاعدة السلسلة:</strong> [f(g(x))]'' = g''(x) × f''(g(x))<br/><br/>
<table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
<tr style="background: #2c3e50; color: white;"><th style="padding: 8px; border: 1px solid #ddd;">الدالة</th><th style="padding: 8px; border: 1px solid #ddd;">المشتقة</th></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">[u(x)]ⁿ</td><td style="padding: 8px; border: 1px solid #ddd;">n·u''(x)·[u(x)]ⁿ⁻¹</td></tr>
<tr style="background: #f8f9fa;"><td style="padding: 8px; border: 1px solid #ddd;">√(u(x))</td><td style="padding: 8px; border: 1px solid #ddd;">u''(x) / (2√u(x))</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">1/u(x)</td><td style="padding: 8px; border: 1px solid #ddd;">-u''(x) / [u(x)]²</td></tr>
<tr style="background: #f8f9fa;"><td style="padding: 8px; border: 1px solid #ddd;">e^(u(x))</td><td style="padding: 8px; border: 1px solid #ddd;">u''(x)·e^(u(x))</td></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">ln(u(x))</td><td style="padding: 8px; border: 1px solid #ddd;">u''(x)/u(x)</td></tr>
</table>
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. تطبيقات الاشتقاق</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 استعمالات f'':</strong><br/>
• إشارة f'': اتجاه تغير f (تزايد/تناقص)<br/>
• f''(x₀) = 0 مع تغيّر الإشارة ⟹ حد أقصى أو أدنى<br/>
• إشارة f'''': تقعر المنحنى ونقاط الانعطاف
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) اشتق: f(x) = e^(2x+1), g(x) = ln(x²+1), h(x) = (3x-1)⁵<br/>
2) ادرس تغيرات f(x) = x·e⁻ˣ وارسم جدول التغيرات<br/>
3) أوجد الحدود القصوى لـ f(x) = x³ - 3x² + 4
</div>
</div>' WHERE id = '10bb56cd-9ed1-4a01-ae21-839d9cabce80';
