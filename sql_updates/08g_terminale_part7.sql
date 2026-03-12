-- =====================================================
-- Terminale - Batch 7/13
-- Covers: الإحصاء (متغيرتين)، الاحتمالات، ln(u)، النهايات، الاستمرارية
-- Lessons 91-105 of 181
-- =====================================================

-- 91) Série statistique à deux variables - سلسلة إحصائية بمتغيرتين
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">سلسلة إحصائية بمتغيرتين</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong><br/>
سلسلة إحصائية بمتغيرتين هي مجموعة أزواج (xᵢ, yᵢ) حيث i = 1, ..., n<br/>
<strong>مثال:</strong> (الدرجة الحرارية، كمية المبيعات) أو (الطول، الكتلة)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. معاملات إحصائية</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغ:</strong><br/>
• المتوسط: x̄ = (Σxᵢ)/n و ȳ = (Σyᵢ)/n<br/>
• التباين: V(X) = (Σxᵢ²)/n - x̄²<br/>
• التغاير (Covariance): Cov(X,Y) = (Σxᵢyᵢ)/n - x̄·ȳ<br/>
• معامل الارتباط الخطي: r = Cov(X,Y) / (σ(X)·σ(Y))
</div>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تأويل r:</strong><br/>
• |r| قريب من 1 ⟹ ارتباط خطي قوي<br/>
• |r| قريب من 0 ⟹ لا ارتباط خطي<br/>
• r &gt; 0: ارتباط طردي، r &lt; 0: ارتباط عكسي
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong> لدينا:<br/>
x: 1, 2, 3, 4, 5 &nbsp;&nbsp; y: 3, 5, 7, 8, 11<br/>
1) احسب x̄, ȳ, Cov(X,Y)<br/>
2) احسب معامل الارتباط r<br/>
3) هل الارتباط الخطي قوي؟
</div>
</div>' WHERE id = 'a57226fd-9de2-466d-8f55-057c56127e9e';

-- 92) Nuage de points - سحابة النقاط
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">سحابة النقاط</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تمثيل سحابة النقاط</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> سحابة النقاط هي التمثيل البياني لأزواج (xᵢ, yᵢ) في معلم متعامد.<br/>
<strong>الفائدة:</strong> تعطي فكرة بصرية عن العلاقة بين المتغيرتين
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. أشكال السحابة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 ملاحظات:</strong><br/>
• سحابة ممتدة ⟹ ارتباط خطي (قوي أو ضعيف)<br/>
• سحابة مبعثرة ⟹ لا علاقة خطية<br/>
• سحابة على شكل منحنى ⟹ علاقة غير خطية (أسية، لوغاريتمية...)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong><br/>
<table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
<tr style="background: #2c3e50; color: white;"><th style="padding: 8px; border: 1px solid #ddd;">x</th><th style="padding: 8px;">1</th><th style="padding: 8px;">2</th><th style="padding: 8px;">3</th><th style="padding: 8px;">4</th><th style="padding: 8px;">5</th><th style="padding: 8px;">6</th></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">y</td><td style="padding: 8px;">2.1</td><td style="padding: 8px;">3.8</td><td style="padding: 8px;">6.2</td><td style="padding: 8px;">7.9</td><td style="padding: 8px;">10.1</td><td style="padding: 8px;">11.8</td></tr>
</table>
النقاط متراصفة تقريباً ⟹ ارتباط خطي قوي
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) مثّل سحابة النقاط للجدول أعلاه<br/>
2) حدد النقطة المتوسطة G(x̄, ȳ) ومثّلها<br/>
3) هل يبدو الارتباط خطياً؟ برر
</div>
</div>' WHERE id = '84eb54eb-3649-48bf-a63a-364748db5a84';

-- 93) Point moyen - النقطة المتوسطة
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">النقطة المتوسطة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. تعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> النقطة المتوسطة G لسحابة النقاط (xᵢ, yᵢ):<br/>
G(x̄, ȳ) حيث x̄ = (Σxᵢ)/n و ȳ = (Σyᵢ)/n<br/>
<strong>خاصية:</strong> مستقيم الانحدار يمر دائماً من G
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong><br/>
x: 2, 4, 6, 8 &nbsp;&nbsp; y: 5, 9, 12, 16<br/>
x̄ = (2+4+6+8)/4 = 5<br/>
ȳ = (5+9+12+16)/4 = 10.5<br/>
G(5; 10.5)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. النقاط المتوسطة الجزئية</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 طريقة ماير:</strong><br/>
نقسم السلسلة إلى مجموعتين متساويتين تقريباً<br/>
G₁(x̄₁, ȳ₁) و G₂(x̄₂, ȳ₂)<br/>
مستقيم ماير هو المستقيم (G₁G₂)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
x: 1, 2, 3, 4, 5, 6 &nbsp;&nbsp; y: 3, 5, 8, 9, 13, 14<br/>
1) احسب النقطة المتوسطة G<br/>
2) احسب G₁ و G₂ (النقاط المتوسطة الجزئية)<br/>
3) أوجد معادلة مستقيم ماير
</div>
</div>' WHERE id = '29dc9a16-6c66-4e79-825f-be822ecb1595';

-- 94) Ajustement linéaire - التعديل الخطي
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">التعديل الخطي (الانحدار الخطي)</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. مستقيم الانحدار بطريقة المربعات الصغرى</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 معادلة مستقيم الانحدار y = ax + b:</strong><br/>
a = Cov(X,Y) / V(X)<br/>
b = ȳ - a·x̄<br/>
(المستقيم يمر من G(x̄, ȳ))
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong><br/>
x: 1, 2, 3, 4, 5 &nbsp;&nbsp; y: 3, 5, 7, 8, 12<br/>
x̄ = 3, ȳ = 7, V(X) = 2, Cov(X,Y) = 4.2<br/>
a = 4.2/2 = 2.1<br/>
b = 7 - 2.1×3 = 0.7<br/>
y = 2.1x + 0.7
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. التعديل غير الخطي</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تغيير متغير:</strong><br/>
• إذا y = a·bˣ ⟹ ln(y) = x·ln(b) + ln(a) (نعدّل Z = ln(y) بدالة x)<br/>
• إذا y = a·xⁿ ⟹ ln(y) = n·ln(x) + ln(a) (نعدّل بين ln(y) و ln(x))
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) أوجد مستقيم الانحدار لـ: x: 0,1,2,3,4 و y: 1,3,4,6,8<br/>
2) تنبأ بقيمة y عندما x = 6<br/>
3) بيّن أن العلاقة y = 2ˣ تصبح خطية بتغيير Z = ln(y)
</div>
</div>' WHERE id = '3dd7bb2d-0d76-449f-a8a0-6aa63c0e922a';

-- 95) Exemples de séries statistiques - أمثلة على سلاسل إحصائية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">أمثلة على سلاسل إحصائية بمتغيرتين</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. مثال اقتصادي</h3>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> ميزانية الإعلانات (بالمليون) والمبيعات (بالمليون):<br/>
<table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
<tr style="background: #2c3e50; color: white;"><th style="padding: 8px; border: 1px solid #ddd;">الإعلان x</th><th style="padding: 8px;">1</th><th style="padding: 8px;">2</th><th style="padding: 8px;">3</th><th style="padding: 8px;">4</th><th style="padding: 8px;">5</th></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">المبيعات y</td><td style="padding: 8px;">10</td><td style="padding: 8px;">18</td><td style="padding: 8px;">24</td><td style="padding: 8px;">32</td><td style="padding: 8px;">38</td></tr>
</table>
r = 0.998 (ارتباط خطي قوي جداً)<br/>
y = 7.2x + 3.2 (مستقيم الانحدار)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. مثال على التعديل الأسي</h3>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> نمو بكتيريا (بالساعات والعدد):<br/>
<table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
<tr style="background: #2c3e50; color: white;"><th style="padding: 8px; border: 1px solid #ddd;">t</th><th style="padding: 8px;">0</th><th style="padding: 8px;">1</th><th style="padding: 8px;">2</th><th style="padding: 8px;">3</th><th style="padding: 8px;">4</th></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">N</td><td style="padding: 8px;">100</td><td style="padding: 8px;">200</td><td style="padding: 8px;">410</td><td style="padding: 8px;">790</td><td style="padding: 8px;">1620</td></tr>
</table>
بوضع Z = ln(N): التعديل خطي ⟹ N ≈ 100 × e^(0.69t)
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احسب r للمثال الاقتصادي وتحقق من القيمة<br/>
2) تنبأ بالمبيعات إذا كانت ميزانية الإعلانات 7 ملايين<br/>
3) في مثال البكتيريا، تنبأ بالعدد بعد 6 ساعات
</div>
</div>' WHERE id = 'd1c70785-c6d6-4068-b0ba-6467f22d4540';

-- 96) Loi de probabilité - قانون الاحتمال
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">قانون الاحتمال (تعمّق)</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. قانون متغير عشوائي منفصل</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> X متغير عشوائي يأخذ القيم x₁, x₂, ..., xₖ<br/>
قانون X: {(xᵢ, pᵢ)} حيث pᵢ = P(X = xᵢ) ≥ 0 و Σpᵢ = 1
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. القوانين المعروفة</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قانون برنولي B(p):</strong><br/>
X ∈ {0, 1}, P(X=1) = p, P(X=0) = 1-p<br/>
E(X) = p, V(X) = p(1-p)<br/><br/>
<strong>القانون ذو الحدين B(n,p):</strong><br/>
P(X = k) = C(n,k) × pᵏ × (1-p)ⁿ⁻ᵏ<br/>
E(X) = np, V(X) = np(1-p)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> نرمي قطعة نقدية 10 مرات. X = عدد مرات الصورة.<br/>
X ~ B(10, 0.5)<br/>
P(X = 3) = C(10,3) × (0.5)¹⁰ = 120/1024 ≈ 0.117<br/>
E(X) = 5, σ(X) = √2.5 ≈ 1.58
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) X ~ B(5, 0.3). احسب P(X=2) و P(X≥1)<br/>
2) اختبار QCM بـ 20 سؤال و4 اختيارات. X = عدد الإجابات الصحيحة عشوائياً. أوجد E(X)<br/>
3) كم يجب أن يكون n ليكون P(X≥1) &gt; 0.95 في B(n, 0.1)؟
</div>
</div>' WHERE id = '10ab88dc-174c-48e2-a49c-79f41919965c';

-- 97) Espérance, variance et écart type - الأمل الرياضي والتباين والانحراف المعياري
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الأمل الرياضي والتباين والانحراف المعياري</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الأمل الرياضي</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغ:</strong><br/>
E(X) = Σ xᵢ·P(X=xᵢ)<br/>
E(aX+b) = aE(X) + b<br/>
E(X+Y) = E(X) + E(Y) (دائماً)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. التباين والانحراف المعياري</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغ:</strong><br/>
V(X) = E(X²) - [E(X)]² = Σxᵢ²·pᵢ - μ²<br/>
σ(X) = √V(X)<br/>
V(aX+b) = a²V(X)<br/>
<strong>إذا X, Y مستقلان:</strong> V(X+Y) = V(X) + V(Y)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong><br/>
<table style="width: 80%; border-collapse: collapse; margin: 10px 0;">
<tr style="background: #2c3e50; color: white;"><th style="padding: 8px; border: 1px solid #ddd;">xᵢ</th><th style="padding: 8px;">-1</th><th style="padding: 8px;">0</th><th style="padding: 8px;">2</th><th style="padding: 8px;">5</th></tr>
<tr><td style="padding: 8px; border: 1px solid #ddd;">pᵢ</td><td style="padding: 8px;">0.2</td><td style="padding: 8px;">0.3</td><td style="padding: 8px;">0.3</td><td style="padding: 8px;">0.2</td></tr>
</table>
E(X) = (-1)(0.2) + 0(0.3) + 2(0.3) + 5(0.2) = 1.4<br/>
E(X²) = 1(0.2) + 0 + 4(0.3) + 25(0.2) = 6.4<br/>
V(X) = 6.4 - 1.96 = 4.44, σ ≈ 2.11
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) لعبة يانصيب: تربح 100 دج بإحتمال 0.01 و0 دج بإحتمال 0.99. الثمن 2 دج. هل هي عادلة؟<br/>
2) X ~ B(100, 0.4). احسب E(X), V(X), σ(X)<br/>
3) Y = 2X - 3. احسب E(Y) و V(Y)
</div>
</div>' WHERE id = '4518c663-8dcb-444f-8ce3-b015c3c8cf68';

-- 98) Arbre pondéré - الشجرة المرجّحة
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الشجرة المرجّحة (الاحتمالية)</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المبدأ</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 قواعد:</strong><br/>
• كل فرع يحمل احتمالاً<br/>
• مجموع الاحتمالات المنطلقة من كل عقدة = 1<br/>
• احتمال مسار = جداء احتمالات فروعه<br/>
• P(حدث) = مجموع احتمالات المسارات المحققة للحدث
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الاحتمال الشرطي</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 صيغة بايز:</strong><br/>
P(A|B) = P(A ∩ B)/P(B)<br/><br/>
<strong>صيغة الاحتمالات الكلية:</strong><br/>
P(B) = P(A)·P(B|A) + P(Ā)·P(B|Ā)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> مصنع: آلة A تنتج 60% وآلة B تنتج 40%. نسبة المعيب: 5% من A و3% من B.<br/>
P(معيب) = 0.6×0.05 + 0.4×0.03 = 0.042<br/>
P(من A | معيب) = (0.6×0.05)/0.042 = 0.714
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) صندوق A: 3 حمراء و2 زرقاء. صندوق B: 1 حمراء و4 زرقاء. نختار صندوقاً عشوائياً ثم نسحب كرة. P(حمراء)؟<br/>
2) إذا سحبنا كرة حمراء، ما P(من الصندوق A)؟<br/>
3) ارسم الشجرة المرجّحة للمسألة
</div>
</div>' WHERE id = '1ff334a1-0070-488e-ac8c-947bd9f0e06b';

-- 99) Indépendance de deux événements - استقلال حدثين
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">استقلال حدثين</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. التعريف</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> A و B مستقلان ⟺ P(A ∩ B) = P(A) × P(B)<br/>
أو ما يعادل: P(A|B) = P(A) (أي B لا يؤثر على A)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. خواص</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 خواص:</strong><br/>
• A و B مستقلان ⟹ A و B̄ مستقلان<br/>
• A و B مستقلان ⟹ Ā و B̄ مستقلان<br/>
• انتبه: الاستقلال ≠ عدم التقاطع (A ∩ B = ∅ لا يعني الاستقلال)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> نرمي حجر نرد.<br/>
A: الحصول على عدد زوجي = {2,4,6}, P(A) = 1/2<br/>
B: الحصول على عدد ≤ 3 = {1,2,3}, P(B) = 1/2<br/>
A ∩ B = {2}, P(A∩B) = 1/6<br/>
P(A)×P(B) = 1/4 ≠ 1/6 ⟹ A و B غير مستقلين
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) نرمي نردين. A: مجموع = 7، B: النرد الأول = 3. هل A و B مستقلان؟<br/>
2) P(A)=0.4, P(B)=0.5, P(A∪B)=0.7. هل A و B مستقلان؟<br/>
3) احسب P(A∪B) إذا كان A و B مستقلين مع P(A)=0.3 و P(B)=0.6
</div>
</div>' WHERE id = '88eb46d7-fb05-47cc-baf5-6b993c67853f';

-- 100) Étude de la fonction ln(u) - دراسة الدالة ln(u)
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">دراسة الدالة ln(u) - تعمّق</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. دراسة f(x) = ln(u(x))</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 خطوات:</strong><br/>
1) Df: u(x) &gt; 0<br/>
2) f''(x) = u''(x)/u(x)، إشارة f'' تعتمد على إشارة u''<br/>
3) النهايات: lim ln(u) حسب lim u (ln(0⁺) = -∞, ln(+∞) = +∞)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال شامل:</strong> f(x) = ln(x² - 2x)<br/>
• Df: x² - 2x &gt; 0 ⟹ x(x-2) &gt; 0 ⟹ x ∈ ]-∞,0[ ∪ ]2,+∞[<br/>
• f''(x) = (2x-2)/(x²-2x) = 2(x-1)/(x(x-2))<br/>
• مقاربان عموديان: x = 0 و x = 2<br/>
• lim(x→+∞) f(x) = +∞<br/>
• lim(x→0⁻) f(x) = -∞, lim(x→2⁺) f(x) = -∞
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) ادرس f(x) = ln(eˣ + 1) وبيّن أن y = x مقارب مائل عند +∞<br/>
2) ادرس g(x) = ln(sin(x)) على ]0, π[<br/>
3) حل: ln(x²-3) = ln(2x)
</div>
</div>' WHERE id = 'e7f7bfa4-efa5-4296-8652-45cf673dc2b0';

-- 101) Limite finie ou infinie en ±∞ - نهاية منتهية أو لامنتهية عند ±∞
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">نهاية منتهية أو لامنتهية عند ±∞</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. نهاية منتهية عند ±∞</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> lim(x→+∞) f(x) = ℓ تعني:<br/>
∀ε &gt; 0, ∃A: x &gt; A ⟹ |f(x) - ℓ| &lt; ε<br/>
<strong>هندسياً:</strong> y = ℓ مقارب أفقي
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. نهاية لامنتهية عند ±∞</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> lim(x→+∞) f(x) = +∞ تعني:<br/>
∀M &gt; 0, ∃A: x &gt; A ⟹ f(x) &gt; M
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ أمثلة:</strong><br/>
• lim(x→+∞) 1/x = 0 (منتهية)<br/>
• lim(x→+∞) x² = +∞ (لامنتهية)<br/>
• lim(x→+∞) sin(x) غير موجودة<br/>
• lim(x→+∞) (3x²+1)/(x²-1) = 3
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احسب: lim(x→+∞) (2x+1)/(3x-2) و lim(x→-∞) (x³-x)/(2x³+1)<br/>
2) احسب lim(x→+∞) √(x²+1) - x<br/>
3) حدد المقاربات الأفقية لـ f(x) = (x+1)/√(x²+1)
</div>
</div>' WHERE id = '56602f7c-4122-43c3-8ce4-b88322c6cef0';

-- 102) Limite finie ou infinie en un point - نهاية منتهية أو لامنتهية في نقطة
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">نهاية منتهية أو لامنتهية في نقطة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. نهاية منتهية في نقطة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> lim(x→a) f(x) = ℓ ⟺<br/>
∀ε &gt; 0, ∃δ &gt; 0: |x-a| &lt; δ ⟹ |f(x)-ℓ| &lt; ε<br/>
<strong>ملاحظة:</strong> لا يهم قيمة f(a)، المهم هو سلوك f قرب a
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. النهايات من اليمين واليسار</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 قاعدة:</strong><br/>
lim(x→a) f(x) = ℓ ⟺ lim(x→a⁺) f(x) = lim(x→a⁻) f(x) = ℓ<br/><br/>
إذا lim(x→a⁺) ≠ lim(x→a⁻) فالنهاية غير موجودة
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ أمثلة:</strong><br/>
• lim(x→2) (x²-4)/(x-2) = lim (x+2) = 4 (رفع عدم التحديد)<br/>
• lim(x→0⁺) 1/x = +∞ و lim(x→0⁻) 1/x = -∞<br/>
⟹ x = 0 مقارب عمودي لـ 1/x
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احسب lim(x→1) (x³-1)/(x-1)<br/>
2) ادرس النهاية من اليمين واليسار لـ f(x) = |x|/x عند 0<br/>
3) أوجد المقاربات العمودية لـ f(x) = 1/(x²-4)
</div>
</div>' WHERE id = '70eabbe7-ac65-4cee-a6ab-fd6186e4200a';

-- 103) Compléments sur les limites - تكملة حول النهايات
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">تكملة حول النهايات</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. مبرهنة الحصر (الساندويتش)</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 مبرهنة:</strong> إذا g(x) ≤ f(x) ≤ h(x) قرب a و lim g(x) = lim h(x) = ℓ:<br/>
⟹ lim f(x) = ℓ
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> lim(x→+∞) sin(x)/x = 0<br/>
-1/x ≤ sin(x)/x ≤ 1/x و lim(±1/x) = 0 ⟹ lim sin(x)/x = 0
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. مبرهنة المقارنة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 </strong><br/>
• إذا f(x) ≥ g(x) و lim g(x) = +∞ ⟹ lim f(x) = +∞<br/>
• إذا f(x) ≤ g(x) و lim g(x) = -∞ ⟹ lim f(x) = -∞
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. نهايات مرجعية خاصة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 </strong><br/>
• lim(x→0) sin(x)/x = 1, lim(x→0) (1-cos(x))/x² = 1/2<br/>
• lim(x→0) (eˣ-1)/x = 1, lim(x→0) ln(1+x)/x = 1<br/>
• lim(x→0) tan(x)/x = 1
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احسب lim(x→0) sin(3x)/x و lim(x→0) (e²ˣ-1)/x<br/>
2) باستعمال الحصر احسب lim(x→+∞) cos(x²)/x<br/>
3) احسب lim(x→0) x·sin(1/x)
</div>
</div>' WHERE id = '1345eaf9-e7e4-456f-81e8-1b0412a9b029';

-- 104) Limite d'une fonction composée - نهاية دالة مركبة
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">نهاية دالة مركبة</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. المبرهنة</h3>

<div style="background: #d5a6e6; padding: 15px; border-right: 4px solid #8e44ad; margin: 10px 0; border-radius: 5px;">
<strong style="color: #8e44ad;">📐 مبرهنة:</strong> إذا lim(x→a) g(x) = b و lim(t→b) f(t) = ℓ:<br/>
⟹ lim(x→a) f(g(x)) = ℓ<br/>
(نستبدل: إذا g(x) → b فإن f(g(x)) → f(b) أو ℓ)
</div>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ أمثلة:</strong><br/>
• lim(x→+∞) e^(1/x): g(x)=1/x → 0 و e⁰ = 1 ⟹ النهاية = 1<br/>
• lim(x→0⁺) ln(sin(x)): sin(x) → 0⁺ و ln(0⁺) = -∞ ⟹ النهاية = -∞<br/>
• lim(x→+∞) sin(1/x): 1/x → 0 و sin(0) = 0 ⟹ النهاية = 0
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. تطبيقات</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 حالات شائعة:</strong><br/>
• lim e^(f(x)): إذا f(x) → +∞ فـ e^f → +∞، إذا f(x) → -∞ فـ e^f → 0<br/>
• lim ln(f(x)): إذا f(x) → 0⁺ فـ ln(f) → -∞، إذا f(x) → +∞ فـ ln(f) → +∞
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) احسب lim(x→+∞) e^(-x²) و lim(x→0⁺) e^(1/x)<br/>
2) احسب lim(x→+∞) ln(1 + e⁻ˣ)<br/>
3) احسب lim(x→1⁺) ln(ln(x))
</div>
</div>' WHERE id = '6b106257-d27f-4f35-94fa-4bc741d72f27';

-- 105) Continuité - الاستمرارية
UPDATE lessons SET content = '<div style="direction: rtl; font-family: ''Tajawal'', Arial, sans-serif; padding: 20px; line-height: 1.8;">
<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">الاستمرارية</h2>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">1. الاستمرارية في نقطة</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 تعريف:</strong> f مستمرة في a ⟺ الشروط الثلاثة محققة:<br/>
1) f(a) معرّفة<br/>
2) lim(x→a) f(x) موجودة<br/>
3) lim(x→a) f(x) = f(a)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">2. الاستمرارية على مجال</h3>

<div style="background: #eaf2f8; padding: 15px; border-right: 4px solid #2980b9; margin: 10px 0; border-radius: 5px;">
<strong style="color: #2980b9;">📌 دوال مستمرة:</strong><br/>
• كثيرات الحدود مستمرة على ℝ<br/>
• الدوال الكسرية مستمرة حيث المقام ≠ 0<br/>
• √, sin, cos, eˣ, ln مستمرة على مجالات تعريفها<br/>
• مجموع وجداء وتركيب دوال مستمرة = دالة مستمرة
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 10px; border-radius: 5px;">3. التمديد بالاستمرارية</h3>

<div style="background: #fef9e7; padding: 15px; border-right: 4px solid #e67e22; margin: 10px 0; border-radius: 5px;">
<strong style="color: #e67e22;">✏️ مثال:</strong> f(x) = (x²-4)/(x-2) غير معرّفة في 2<br/>
lim(x→2) f(x) = lim(x+2) = 4<br/>
نمدد: g(x) = f(x) إذا x ≠ 2 و g(2) = 4 ⟹ g مستمرة في 2
</div>

<div style="background: #e8f8f5; padding: 15px; border-right: 4px solid #1abc9c; margin: 10px 0; border-radius: 5px;">
<strong style="color: #1abc9c;">🎯 تمرين:</strong><br/>
1) ادرس استمرارية f(x) = {x² إذا x ≤ 1; 2x-1 إذا x &gt; 1} في x = 1<br/>
2) مدّد f(x) = sin(x)/x بالاستمرارية في 0<br/>
3) أوجد a لتكون f(x) = {ax+1 إذا x ≤ 2; x²-1 إذا x &gt; 2} مستمرة في 2
</div>
</div>' WHERE id = 'd6d4d588-cf9a-474f-b5ee-53fbf8562660';
