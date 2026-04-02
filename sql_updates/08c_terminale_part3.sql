-- =====================================================
-- Terminale - Batch 3/13
-- Covers: الاحتمالات الشرطية + قوانين الاحتمال + المتتاليات العددية
-- Lessons 31-45 of 181
-- =====================================================

-- 31) نمذجة تجربة عشوائية: المتغير العشوائي
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">نمذجة تجربة عشوائية: المتغير العشوائي</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المتغير العشوائي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> المتغير العشوائي X هو تطبيق من فضاء العينة Ω إلى ℝ.<br/>
أي: X: Ω → ℝ يربط كل نتيجة ω بقيمة عددية X(ω).<br/>
X(Ω) = {x₁, x₂, ..., xₖ} هي مجموعة قيم X.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. قانون الاحتمال</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 تعريف:</strong> قانون احتمال X هو الجدول:<br/>
P(X = xᵢ) = pᵢ حيث Σpᵢ = 1 و pᵢ ≥ 0
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. الأمل الرياضي والتباين</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغ:</strong><br/>
• الأمل: E(X) = Σ xᵢ·P(X = xᵢ)<br/>
• التباين: V(X) = Σ (xᵢ - E(X))²·P(X = xᵢ) = E(X²) - [E(X)]²<br/>
• الانحراف المعياري: σ(X) = √V(X)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> نرمي حجر نرد، X = الرقم الظاهر<br/>
E(X) = (1+2+3+4+5+6)/6 = 3.5<br/>
V(X) = E(X²) - (3.5)² = 91/6 - 12.25 ≈ 2.917
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> نسحب بطاقة من مجموعة 10 بطاقات مرقمة 1 إلى 10. X = رقم البطاقة.<br/>
1) أعط قانون احتمال X<br/>
2) احسب E(X) و V(X) و σ(X)<br/>
3) إذا ربح اللاعب 2X - 5 دج، احسب أمل الربح
</div>
</div>' WHERE id = 'bc5ccdc5-df10-4113-b2dc-222a4bf697f5';

-- 32) الاحتمالات الشرطية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الاحتمالات الشرطية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريف الاحتمال الشرطي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> إذا كان P(B) ≠ 0، فإن احتمال A علماً أن B تحقق:<br/>
P_B(A) = P(A∩B)/P(B)<br/>
يُكتب أيضاً P(A|B)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. صيغة الاحتمالات الكلية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 مبرهنة:</strong> إذا B₁, B₂, ..., Bₙ تقسيم لـ Ω:<br/>
P(A) = P(A∩B₁) + P(A∩B₂) + ... + P(A∩Bₙ)<br/>
= P(B₁)·P_B₁(A) + P(B₂)·P_B₂(A) + ... + P(Bₙ)·P_Bₙ(A)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. صيغة بايز</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغة:</strong><br/>
P_A(Bₖ) = P(Bₖ)·P_Bₖ(A) / P(A)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> مصنع فيه آلتان: M₁ تنتج 60% و M₂ تنتج 40%. نسبة العيوب: M₁: 3%، M₂: 5%.<br/>
P(عيب) = 0.6×0.03 + 0.4×0.05 = 0.018 + 0.02 = 0.038<br/>
P(M₁|عيب) = 0.018/0.038 ≈ 0.474
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> في امتحان: 70% تلاميذ راجعوا. نسبة النجاح بين المراجعين 85% وبين غير المراجعين 40%.<br/>
1) احسب P(نجاح)<br/>
2) إذا نجح تلميذ، ما احتمال أنه راجع؟
</div>
</div>' WHERE id = '704aee09-4097-41f9-838b-990a7408290c';

-- 33) الحوادث المستقلة والمتغيرات العشوائية المستقلة
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الحوادث المستقلة والمتغيرات العشوائية المستقلة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الحوادث المستقلة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> حادثتان A و B مستقلتان إذا وفقط إذا:<br/>
P(A∩B) = P(A) × P(B)<br/>
أو ما يعادل: P_B(A) = P(A) و P_A(B) = P(B)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. خواص الاستقلال</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 خواص:</strong><br/>
• A و B مستقلتان ⟺ A و B̄ مستقلتان ⟺ Ā و B̄ مستقلتان<br/>
• الاستقلال ≠ التنافي: حادثتان متنافيتان (A∩B = ∅) ليستا مستقلتين إلا إذا P(A)=0 أو P(B)=0
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. تكرار تجارب مستقلة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 مبدأ:</strong> إذا أجريت n تجارب مستقلة، فاحتمال حدوث النتائج A₁, A₂, ..., Aₙ معاً:<br/>
P(A₁∩A₂∩...∩Aₙ) = P(A₁) × P(A₂) × ... × P(Aₙ)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> نرمي حجر نرد 3 مرات. ما احتمال الحصول على 6 في كل مرة؟<br/>
P = (1/6)³ = 1/216 ≈ 0.0046
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) نرمي قطعة نقدية 4 مرات. ما احتمال الحصول على كتابة في كل مرة؟<br/>
2) آلة تنتج قطعاً معيبة بنسبة 5%. نسحب 3 قطع. ما احتمال أن تكون جميعها سليمة؟<br/>
3) بيّن أن P(A) = 0.3 و P(B) = 0.4 و P(A∩B) = 0.12 ⟹ A و B مستقلتان
</div>
</div>' WHERE id = 'dc1d92be-6f39-4074-b79c-1a04a24f3f05';

-- 34) قانون برنولي
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">قانون برنولي</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تجربة برنولي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> تجربة برنولي هي تجربة عشوائية لها نتيجتان فقط:<br/>
• نجاح (S) باحتمال p<br/>
• فشل (F) باحتمال q = 1 - p
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. القانون ثنائي الحد B(n,p)</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 مبرهنة:</strong> إذا كررنا تجربة برنولي n مرة مستقلة و X = عدد النجاحات:<br/>
P(X = k) = Cₙᵏ × pᵏ × (1-p)ⁿ⁻ᵏ حيث k ∈ {0,1,...,n}<br/><br/>
<strong>الأمل والتباين:</strong><br/>
E(X) = np، V(X) = np(1-p)، σ(X) = √(np(1-p))
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> نرمي حجر نرد 10 مرات. X = عدد الحصول على 6.<br/>
X ~ B(10, 1/6)<br/>
P(X = 2) = C₁₀² × (1/6)² × (5/6)⁸ ≈ 0.291<br/>
E(X) = 10/6 ≈ 1.67
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> في اختبار QCM من 20 سؤالاً بـ 4 اختيارات. تلميذ يُجيب عشوائياً.<br/>
1) حدد قانون X (عدد الإجابات الصحيحة)<br/>
2) احسب E(X) و σ(X)<br/>
3) ما احتمال الحصول على 10 إجابات صحيحة أو أكثر؟
</div>
</div>' WHERE id = 'b0a0758e-670b-404d-91db-621ebeabdcf6';

-- 35) قوانين الاحتمالات المستمرة
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">قوانين الاحتمالات المستمرة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المتغير العشوائي المستمر</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> X متغير عشوائي مستمر إذا كانت قيمه تملأ مجالاً من ℝ.<br/>
يُحدد بدالة الكثافة f حيث:<br/>
• f(x) ≥ 0 لكل x<br/>
• ∫₋∞⁺∞ f(x)dx = 1<br/>
• P(a ≤ X ≤ b) = ∫ₐᵇ f(x)dx
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. القانون المنتظم U[a,b]</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 خصائص:</strong><br/>
• f(x) = 1/(b-a) إذا x ∈ [a,b] و 0 خارجها<br/>
• E(X) = (a+b)/2<br/>
• V(X) = (b-a)²/12
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. القانون الطبيعي N(μ, σ²)</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 خصائص:</strong><br/>
• f(x) = (1/(σ√(2π))) × e^(-(x-μ)²/(2σ²))<br/>
• E(X) = μ، V(X) = σ²<br/>
• المنحنى جرسي متناظر حول μ
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ قاعدة 68-95-99.7:</strong><br/>
• P(μ-σ ≤ X ≤ μ+σ) ≈ 0.68<br/>
• P(μ-2σ ≤ X ≤ μ+2σ) ≈ 0.95<br/>
• P(μ-3σ ≤ X ≤ μ+3σ) ≈ 0.997
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> X ~ N(170, 100) يمثل أطوال طلاب (بالسنتمتر).<br/>
1) ما E(X) و σ(X)؟<br/>
2) ما نسبة الطلاب بطول بين 160 و 180 سم؟<br/>
3) أوجد a بحيث P(X ≤ a) = 0.9
</div>
</div>' WHERE id = 'd6961071-3af4-43cb-a14c-0a0c076c91cf';

-- 36) قياس تلاؤم سلسلة مشاهدة ونموذج احتمالي
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">قياس تلاؤم سلسلة مشاهدة ونموذج احتمالي</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المشكلة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 إشكالية:</strong> هل البيانات المرصودة (سلسلة المشاهدة) تتوافق مع نموذج احتمالي نظري معين؟<br/>
مثل: هل حجر النرد متوازن فعلاً؟ هل الطلاب يتبعون القانون الطبيعي؟
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. اختبار خي-مربع (χ²)</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 الصيغة:</strong><br/>
χ² = Σᵢ (Oᵢ - Eᵢ)²/Eᵢ<br/>
حيث Oᵢ = التكرار المرصود، Eᵢ = التكرار النظري المتوقع<br/><br/>
• χ² صغير ⟹ تلاؤم جيد<br/>
• χ² كبير ⟹ تلاؤم ضعيف (نرفض النموذج)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> رمي حجر نرد 120 مرة:<br/>
مرصود: 1:25 | 2:18 | 3:22 | 4:15 | 5:20 | 6:20<br/>
متوقع (نرد متوازن): كل وجه = 20<br/>
χ² = (25-20)²/20 + (18-20)²/20 + (22-20)²/20 + (15-20)²/20 + (20-20)²/20 + (20-20)²/20<br/>
= 1.25 + 0.2 + 0.2 + 1.25 + 0 + 0 = 2.9<br/>
القيمة الحرجة (df=5, α=0.05) = 11.07 ⟹ 2.9 &lt; 11.07 ⟹ النرد متوازن
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> في استطلاع رأي: الألوان المفضلة لـ 200 شخص:<br/>
أحمر: 55 | أزرق: 65 | أخضر: 45 | أصفر: 35<br/>
هل يمكن القول أن الألوان مفضلة بالتساوي؟ (α = 0.05)
</div>
</div>' WHERE id = 'b94922bf-b6a6-4683-a286-8ec3717be1b2';

-- 37) القانون الأسي
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">القانون الأسي</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> X يتبع القانون الأسي بالمعامل λ &gt; 0 (X ~ Exp(λ)) إذا:<br/>
f(x) = λe^(-λx) إذا x ≥ 0 و f(x) = 0 إذا x &lt; 0
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الخصائص</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 خصائص:</strong><br/>
• E(X) = 1/λ<br/>
• V(X) = 1/λ²<br/>
• P(X ≤ t) = 1 - e^(-λt) (لـ t ≥ 0)<br/>
• P(X &gt; t) = e^(-λt)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. خاصية انعدام الذاكرة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 خاصية:</strong> P(X &gt; s+t | X &gt; s) = P(X &gt; t)<br/>
أي: احتمال البقاء مدة t إضافية لا يعتمد على المدة s المنقضية.
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> عمر مصباح يتبع Exp(0.001) (بالساعات).<br/>
E(X) = 1/0.001 = 1000 ساعة<br/>
P(X &gt; 500) = e^(-0.5) ≈ 0.607<br/>
P(X &gt; 1500 | X &gt; 1000) = P(X &gt; 500) ≈ 0.607
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> مدة انتظار حافلة X ~ Exp(1/10) (بالدقائق).<br/>
1) احسب E(X) و P(X ≤ 15)<br/>
2) احسب P(X &gt; 20)<br/>
3) تحقق من خاصية انعدام الذاكرة: P(X&gt;25 | X&gt;10) = P(X&gt;15)
</div>
</div>' WHERE id = '70478b88-c1d3-49e3-bdcc-0d359fa22825';

-- 38) توليد متتالية: التعرف على متتاليات
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">توليد متتالية: التعرف على متتاليات</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريف المتتالية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> المتتالية العددية (uₙ) هي دالة من ℕ (أو جزء منه) إلى ℝ.<br/>
<strong>طرق تعريف المتتالية:</strong><br/>
• بالصيغة الصريحة: uₙ = f(n)<br/>
• بالعلاقة بالتراجع: uₙ₊₁ = f(uₙ) مع شرط ابتدائي u₀
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. أمثلة</h3>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 1 (صريحة):</strong> uₙ = 2n + 3<br/>
u₀ = 3, u₁ = 5, u₂ = 7, u₃ = 9, ...
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 2 (بالتراجع):</strong> uₙ₊₁ = 2uₙ - 1 مع u₀ = 3<br/>
u₁ = 5, u₂ = 9, u₃ = 17, u₄ = 33, ...
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. التعرف على نوع المتتالية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 معايير:</strong><br/>
• حسابية ⟺ uₙ₊₁ - uₙ = r (ثابت)<br/>
• هندسية ⟺ uₙ₊₁/uₙ = q (ثابت) و uₙ ≠ 0<br/>
• لا حسابية ولا هندسية: نبحث عن vₙ = f(uₙ) تكون حسابية أو هندسية
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) حدد نوع: uₙ = 3n - 7<br/>
2) حدد نوع: uₙ = 5 × 2ⁿ<br/>
3) uₙ₊₁ = 3uₙ + 2 مع u₀ = 1. بيّن أن vₙ = uₙ + 1 هندسية
</div>
</div>' WHERE id = 'c51adb36-ec0c-411b-8a08-d820a743be51';

-- 39) المتتاليات الحسابية: التعريف، الحد العام؛ الوسط الحسابي
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المتتاليات الحسابية: التعريف، الحد العام؛ الوسط الحسابي</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> (uₙ) حسابية بأساس r إذا: uₙ₊₁ = uₙ + r لكل n<br/>
الحد العام: uₙ = u₀ + nr أو uₙ = uₚ + (n-p)r
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الوسط الحسابي</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 خاصية:</strong> في متتالية حسابية، كل حد هو الوسط الحسابي لجاريه:<br/>
uₙ = (uₙ₋₁ + uₙ₊₁)/2
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> u₀ = 5, r = -3<br/>
u₁ = 2, u₂ = -1, u₃ = -4<br/>
u₁₀ = 5 + 10×(-3) = -25<br/>
تحقق: u₂ = (u₁ + u₃)/2 = (2 + (-4))/2 = -1 ✓
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. التمثيل البياني</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 ملاحظة:</strong> نقاط (n, uₙ) تقع على المستقيم y = rn + u₀<br/>
• r &gt; 0: المتتالية تزايدية<br/>
• r &lt; 0: المتتالية تناقصية<br/>
• r = 0: المتتالية ثابتة
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) (uₙ) حسابية حيث u₃ = 11 و u₇ = 23. أوجد u₀ و r<br/>
2) أوجد الوسط الحسابي لـ 7 و 19<br/>
3) أدرج 4 أعداد بين 3 و 18 بحيث تشكل مع 3 و 18 متتالية حسابية
</div>
</div>' WHERE id = '77096514-b778-4743-9544-4ad323a10bbf';

-- 40) حساب مجموع الحدود الأولى من متتالية حسابية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">حساب مجموع الحدود الأولى من متتالية حسابية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. صيغة المجموع</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 مبرهنة:</strong> مجموع (n+1) حد من متتالية حسابية:<br/>
Sₙ = u₀ + u₁ + ... + uₙ = (n+1)(u₀ + uₙ)/2<br/><br/>
أو: <strong>المجموع = عدد الحدود × (الحد الأول + الحد الأخير)/2</strong>
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 1:</strong> S = 1 + 2 + 3 + ... + 100<br/>
= 100 × (1+100)/2 = 100 × 101/2 = 5050
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 2:</strong> uₙ = 3n + 1, احسب S₁₀ = Σₙ₌₀¹⁰ uₙ<br/>
u₀ = 1, u₁₀ = 31, عدد الحدود = 11<br/>
S₁₀ = 11 × (1+31)/2 = 11 × 16 = 176
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. صيغ خاصة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 حالات مفيدة:</strong><br/>
• Σₖ₌₁ⁿ k = n(n+1)/2<br/>
• Σₖ₌₁ⁿ (2k-1) = n² (مجموع الفردية الأولى)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احسب S = 5 + 8 + 11 + ... + 302<br/>
2) (uₙ) حسابية حيث S₁₀ = 55 و u₀ = 1. أوجد r<br/>
3) كم حداً يلزم من المتتالية uₙ = 2n+1 ليصبح المجموع أكبر من 1000؟
</div>
</div>' WHERE id = '105dff92-bda2-43da-b998-4bb66d1d978b';

-- 41) المتتاليات الهندسية: التعريف، الحد العام؛ الوسط الهندسي
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">المتتاليات الهندسية: التعريف، الحد العام؛ الوسط الهندسي</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> (uₙ) هندسية بأساس q إذا: uₙ₊₁ = q × uₙ لكل n (و uₙ ≠ 0)<br/>
الحد العام: uₙ = u₀ × qⁿ أو uₙ = uₚ × qⁿ⁻ᵖ
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الوسط الهندسي</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 خاصية:</strong> في متتالية هندسية ذات حدود موجبة:<br/>
uₙ² = uₙ₋₁ × uₙ₊₁ أو uₙ = √(uₙ₋₁ × uₙ₊₁)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> u₀ = 3, q = 2<br/>
u₁ = 6, u₂ = 12, u₃ = 24, u₄ = 48<br/>
u₁₀ = 3 × 2¹⁰ = 3072<br/>
تحقق: u₂² = 144 = 6×24 = u₁ × u₃ ✓
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. التمثيل البياني</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 ملاحظة:</strong><br/>
• q &gt; 1 و u₀ &gt; 0: نمو أسي<br/>
• 0 &lt; q &lt; 1 و u₀ &gt; 0: اضمحلال أسي<br/>
• q &lt; 0: تذبذب
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) (uₙ) هندسية حيث u₂ = 12 و u₅ = 96. أوجد u₀ و q<br/>
2) أوجد الوسط الهندسي لـ 4 و 16<br/>
3) سكان مدينة يتزايدون بنسبة 5% سنوياً. كم سيكونون بعد 10 سنوات إذا كانوا 50000 حالياً؟
</div>
</div>' WHERE id = '79dd4b00-fec1-4c7a-85ac-41b353e16d2c';

-- 42) حساب مجموع الحدود الأولى من متتالية هندسية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">حساب مجموع الحدود الأولى من متتالية هندسية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. صيغة المجموع</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 مبرهنة:</strong> Sₙ = u₀ + u₁ + ... + uₙ (q ≠ 1):<br/>
Sₙ = u₀ × (1 - qⁿ⁺¹)/(1 - q)<br/><br/>
أو: <strong>المجموع = الحد الأول × (1 - أساسⁿ⁺¹)/(1 - الأساس)</strong><br/>
إذا q = 1: Sₙ = (n+1)u₀
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 1:</strong> S = 1 + 2 + 4 + 8 + ... + 2¹⁰<br/>
u₀ = 1, q = 2, عدد الحدود = 11<br/>
S = 1 × (1 - 2¹¹)/(1 - 2) = (1 - 2048)/(-1) = 2047
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 2:</strong> S = 1 + 1/3 + 1/9 + 1/27 + ... + 1/3⁶<br/>
u₀ = 1, q = 1/3, عدد الحدود = 7<br/>
S = (1 - (1/3)⁷)/(1 - 1/3) = (1 - 1/2187)/(2/3) ≈ 1.4995
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. المجموع اللانهائي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 خاصية:</strong> إذا |q| &lt; 1:<br/>
S∞ = u₀/(1 - q)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احسب S = 5 + 5/2 + 5/4 + ... + 5/2⁸<br/>
2) احسب المجموع اللانهائي: S = 1 + 0.5 + 0.25 + ...<br/>
3) مبلغ 10000 دج بفائدة 4% سنوية مركبة. كم يصبح بعد 20 سنة؟
</div>
</div>' WHERE id = 'a8b4e214-c5f6-4c90-85a7-8ffc59d53076';

-- 43) التعرّف على متتالية بالتراجع - حساب الحدود الأولى
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">التعرّف على متتالية بالتراجع - حساب الحدود الأولى</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف بالتراجع</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 مبدأ:</strong> متتالية معرفة بالتراجع تحتاج:<br/>
• شرط ابتدائي: u₀ = a (أو u₁ = a)<br/>
• علاقة تراجعية: uₙ₊₁ = f(uₙ) أو uₙ₊₁ = f(uₙ, n)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. حساب الحدود الأولى</h3>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 1:</strong> uₙ₊₁ = 2uₙ + 1, u₀ = 0<br/>
u₁ = 2(0)+1 = 1<br/>
u₂ = 2(1)+1 = 3<br/>
u₃ = 2(3)+1 = 7<br/>
u₄ = 2(7)+1 = 15<br/>
(الصيغة الصريحة: uₙ = 2ⁿ - 1)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 2:</strong> uₙ₊₁ = √(uₙ + 6), u₀ = 2<br/>
u₁ = √8 ≈ 2.83<br/>
u₂ = √8.83 ≈ 2.97<br/>
u₃ = √8.97 ≈ 3.00<br/>
(يبدو أن المتتالية تتقارب نحو 3)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. النقطة الثابتة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 مفهوم:</strong> إذا uₙ₊₁ = f(uₙ) والمتتالية متقاربة نحو ℓ:<br/>
ℓ = f(ℓ) (نقطة ثابتة)<br/>
في المثال 2: ℓ = √(ℓ+6) ⟹ ℓ² = ℓ+6 ⟹ ℓ = 3
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احسب أول 5 حدود: uₙ₊₁ = uₙ² - 2, u₀ = 2<br/>
2) uₙ₊₁ = (uₙ + 3)/(uₙ + 1), u₀ = 1. احسب 4 حدود واحدس النهاية<br/>
3) أوجد النقطة الثابتة لـ f(x) = x/(x+1) + 1
</div>
</div>' WHERE id = 'ebdb927f-a8ae-48f0-bd6f-572ee0cdf777';

-- 44) مفهوم المتتالية الرتيبة وتعيين اتجاه تغيّرها
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">مفهوم المتتالية الرتيبة وتعيين اتجاه تغيّرها</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong><br/>
• (uₙ) تزايدية ⟺ uₙ₊₁ ≥ uₙ لكل n<br/>
• (uₙ) تناقصية ⟺ uₙ₊₁ ≤ uₙ لكل n<br/>
• (uₙ) رتيبة إذا كانت تزايدية أو تناقصية
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. طرق تحديد اتجاه التغير</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 الطرق:</strong><br/>
<strong>الطريقة 1:</strong> دراسة إشارة uₙ₊₁ - uₙ<br/>
• uₙ₊₁ - uₙ ≥ 0 ⟹ تزايدية<br/><br/>
<strong>الطريقة 2:</strong> إذا uₙ &gt; 0: دراسة uₙ₊₁/uₙ<br/>
• uₙ₊₁/uₙ ≥ 1 ⟹ تزايدية<br/><br/>
<strong>الطريقة 3:</strong> إذا uₙ = f(n): دراسة تغيرات f على [0,+∞[
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> uₙ = n² - 5n<br/>
uₙ₊₁ - uₙ = (n+1)² - 5(n+1) - n² + 5n = 2n - 4<br/>
2n - 4 ≥ 0 ⟺ n ≥ 2<br/>
المتتالية تناقصية على {0,1,2} وتزايدية ابتداءً من n = 2
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) ادرس اتجاه تغير uₙ = (2n+1)/(n+3)<br/>
2) ادرس اتجاه تغير uₙ = 3ⁿ/n!<br/>
3) uₙ₊₁ = √(2uₙ+3), u₀ = 0. بيّن أن (uₙ) تزايدية
</div>
</div>' WHERE id = 'dcbe367a-8a8b-41d4-9a19-5becb206889e';

-- 45) تحديد اتجاه تغيّر متتالية حسابية وهندسية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">تحديد اتجاه تغيّر متتالية حسابية وهندسية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. اتجاه تغير متتالية حسابية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قاعدة:</strong> (uₙ) حسابية بأساس r:<br/>
• r &gt; 0 ⟹ (uₙ) تزايدية تماماً<br/>
• r &lt; 0 ⟹ (uₙ) تناقصية تماماً<br/>
• r = 0 ⟹ (uₙ) ثابتة<br/>
(لأن uₙ₊₁ - uₙ = r)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. اتجاه تغير متتالية هندسية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قاعدة:</strong> (uₙ) هندسية بأساس q و u₀ &gt; 0:<br/>
• q &gt; 1 ⟹ (uₙ) تزايدية تماماً<br/>
• 0 &lt; q &lt; 1 ⟹ (uₙ) تناقصية تماماً<br/>
• q &lt; 0 ⟹ (uₙ) ليست رتيبة (تتذبذب)<br/>
إذا u₀ &lt; 0: ينعكس الاتجاه
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال 1:</strong> uₙ = 3 + 5n ⟹ حسابية بأساس r = 5 &gt; 0 ⟹ تزايدية<br/>
<strong>مثال 2:</strong> uₙ = 4 × (0.8)ⁿ ⟹ هندسية u₀ = 4 &gt; 0, q = 0.8 &lt; 1 ⟹ تناقصية<br/>
<strong>مثال 3:</strong> uₙ = 2 × (-3)ⁿ ⟹ هندسية q = -3 &lt; 0 ⟹ متذبذبة
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. حدود متتالية هندسية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 خواص:</strong> (uₙ) هندسية بأساس q و u₀ &gt; 0:<br/>
• |q| &lt; 1: uₙ محصورة و lim uₙ = 0<br/>
• q = 1: uₙ = u₀ (ثابتة)<br/>
• q &gt; 1: uₙ غير محصورة و lim uₙ = +∞
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) حدد اتجاه تغير: uₙ = 100 - 7n<br/>
2) حدد اتجاه تغير: uₙ = 5 × (3/2)ⁿ<br/>
3) (uₙ) حسابية حيث u₅ = 20 و u₁₂ = 6. هل هي تزايدية أم تناقصية؟ أوجد r
</div>
</div>' WHERE id = 'ebfc9c05-d7bb-4efb-b1a7-669a39e9f794';
