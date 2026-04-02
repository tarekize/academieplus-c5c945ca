-- =====================================================
-- MISE À JOUR DU CONTENU DES LEÇONS : 1ère CEM (14 leçons)
-- =====================================================

-- 1. الأعداد الطبيعية والأعداد العشرية
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">الأعداد الطبيعية والأعداد العشرية</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
الأعداد الطبيعية والعشرية هي أدوات أساسية في الحساب. في هذا الدرس سنتعرّف على خصائصها وكيفية التعامل معها.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">الأعداد الطبيعية</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 تعريف:</strong><br>
<span style="color: #e74c3c; font-weight: bold;">الأعداد الطبيعية</span> هي: 0 ، 1 ، 2 ، 3 ، 4 ، ... نرمز لمجموعتها بالرمز <strong>ℕ</strong>.<br><br>
• لكل عدد طبيعي <strong>تالٍ</strong> (العدد الذي يليه مباشرة).<br>
• لكل عدد طبيعي غير معدوم <strong>سابق</strong> (العدد الذي قبله مباشرة).<br>
• العدد 0 هو أصغر عدد طبيعي وليس له سابق.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">المقارنة والترتيب</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 قواعد المقارنة:</strong><br>
• إذا كان عددان لهما عدد أرقام مختلف، فالأكبر هو الذي له أرقام أكثر.<br>
• إذا كان لهما نفس عدد الأرقام، نقارن رقماً رقماً من اليسار.<br><br>
الرموز: <strong>&lt;</strong> (أصغر من) ، <strong>&gt;</strong> (أكبر من) ، <strong>=</strong> (يساوي) ، <strong>≤</strong> (أصغر أو يساوي) ، <strong>≥</strong> (أكبر أو يساوي)
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">الأعداد العشرية</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 تعريف:</strong><br>
<span style="color: #e74c3c; font-weight: bold;">العدد العشري</span> هو عدد يمكن كتابته على شكل كسر عشري، أي كسر مقامه قوة للعدد 10.<br><br>
مثل: 3.75 = 375/100 ، 0.4 = 4/10<br><br>
يتكوّن العدد العشري من:<br>
• <strong>جزء صحيح</strong>: الأرقام قبل الفاصلة<br>
• <strong>جزء عشري</strong>: الأرقام بعد الفاصلة
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong><br>
العدد <strong>25.347</strong><br>
الجزء الصحيح: 25<br>
الجزء العشري: 347<br>
• 3 في منزلة أعشار (3/10)<br>
• 4 في منزلة أجزاء المئة (4/100)<br>
• 7 في منزلة أجزاء الألف (7/1000)
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">مقارنة الأعداد العشرية</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 القاعدة:</strong><br>
1. نقارن أولاً الجزأين الصحيحين.<br>
2. إذا تساويا، نقارن رقماً رقماً بعد الفاصلة من اليسار إلى اليمين.
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong><br>
قارن 3.47 و 3.5<br>
الجزآن الصحيحان متساويان (3 = 3)<br>
نقارن الأعشار: 4 &lt; 5<br>
إذن: <strong>3.47 &lt; 3.5</strong>
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">التمثيل على المستقيم المدرّج</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
يمكن تمثيل أي عدد عشري على <span style="color: #e74c3c; font-weight: bold;">مستقيم مدرّج</span> بنقطة وحيدة. ترتيب الأعداد على المستقيم يكون من اليسار إلى اليمين (من الأصغر إلى الأكبر).
</div>

<div style="background: #fdedec; border-right: 4px solid #e74c3c; padding: 15px; margin: 15px 0; border-radius: 6px;">
⚠️ <strong>ملاحظة مهمة:</strong><br>
كل عدد طبيعي هو عدد عشري (مثلاً 5 = 5.0)، لكن ليس كل عدد عشري عدداً طبيعياً.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">تمارين تطبيقية</h3>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 1:</strong> رتّب تصاعدياً: 12.5 ، 12.48 ، 12.503 ، 12.6
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 2:</strong> أوجد العدد الطبيعي n إذا علمت أن: 7.3 &lt; n &lt; 8.9
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 3:</strong> أكتب كسراً عشرياً للأعداد: 0.25 ، 3.7 ، 15.003
</div>

</div>' WHERE id = '645bda8e-ce98-4231-8373-b0e55e949415';


-- 2. الحساب على الأعداد: الجمع والطرح
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">الحساب على الأعداد الطبيعية والعشرية: الجمع والطرح</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
الجمع والطرح عمليتان أساسيتان نستعملهما يومياً. في هذا الدرس نراجع خصائصهما ونتعلم كيف ننجزهما مع الأعداد العشرية.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">خصائص الجمع</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 الخصائص:</strong><br>
1. <strong>التبديل:</strong> a + b = b + a<br>
2. <strong>التجميع:</strong> (a + b) + c = a + (b + c)<br>
3. <strong>العنصر المحايد:</strong> a + 0 = a
</div>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;">
<strong>لجمع أعداد عشرية: نضع الفواصل تحت بعضها البعض</strong>
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> أحسب 25.7 + 3.85<br><br>
نكتب: 25.70 + 3.85 (نُكمل بصفر)<br>
= <strong>29.55</strong>
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">الطرح</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 تعريف:</strong><br>
الطرح هو العملية العكسية للجمع. الفرق بين a و b يكتب: a − b حيث a ≥ b (في الأعداد الطبيعية).<br><br>
<strong>خاصية:</strong> a − b = c يعني أن a = b + c
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> أحسب 40.2 − 15.78<br><br>
نكتب: 40.20 − 15.78<br>
= <strong>24.42</strong>
</div>

<div style="background: #fdedec; border-right: 4px solid #e74c3c; padding: 15px; margin: 15px 0; border-radius: 6px;">
⚠️ <strong>ملاحظة مهمة:</strong><br>
• الطرح ليس تبديلياً: a − b ≠ b − a<br>
• للتحقق من صحة الطرح نستعمل الجمع: الفرق + المطروح = المطروح منه
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">تمارين تطبيقية</h3>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 1:</strong> أحسب: 345.7 + 28.95 ، 1000 − 456.8 ، 78.25 + 4.3 − 12.05
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 2:</strong> اشترى سمير لعبة بـ 1250.50 دج وكتاباً بـ 650.75 دج. دفع بورقة 2000 دج. كم يسترجع؟
</div>

</div>' WHERE id = 'e2e9d54d-6768-4d40-b1b8-31319b7fa897';


-- 3. الحساب على الأعداد: الضرب والقسمة
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">الحساب على الأعداد: الضرب والقسمة</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
الضرب والقسمة عمليتان أساسيتان مرتبطتان ببعضهما (عمليتان عكسيتان). نستعملهما في العديد من المسائل الحسابية.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">خصائص الضرب</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
1. <strong>التبديل:</strong> a × b = b × a<br>
2. <strong>التجميع:</strong> (a × b) × c = a × (b × c)<br>
3. <strong>العنصر المحايد:</strong> a × 1 = a<br>
4. <strong>العنصر الماص:</strong> a × 0 = 0<br>
5. <strong>التوزيع على الجمع:</strong> a × (b + c) = a × b + a × c
</div>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;">
<strong>لضرب عددين عشريين:</strong> نضرب بدون فواصل ثم نضع الفاصلة في الناتج بعدد أرقام عشرية يساوي مجموع أرقاع العاملين العشرية.
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> 2.5 × 1.3<br>
25 × 13 = 325<br>
عدد الأرقام العشرية: 1 + 1 = 2<br>
النتيجة: <strong>3.25</strong>
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">القسمة الإقليدية</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 تعريف:</strong><br>
لكل عددين طبيعيين a و b (b ≠ 0)، توجد أعداد طبيعية وحيدة q و r حيث:<br>
</div>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;">
<strong>a = b × q + r حيث 0 ≤ r &lt; b</strong><br>
a: المقسوم ، b: المقسوم عليه ، q: الحاصل ، r: الباقي
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> أنجز القسمة الإقليدية لـ 157 على 12<br>
157 = 12 × 13 + 1<br>
الحاصل = 13 ، الباقي = 1
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">قابلية القسمة</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
عدد طبيعي a يقبل القسمة على b إذا كان الباقي = 0 (أي a = b × q)<br><br>
<strong>علامات القسمة:</strong><br>
• يقبل القسمة على <strong>2</strong>: رقم آحاده 0 أو 2 أو 4 أو 6 أو 8<br>
• يقبل القسمة على <strong>3</strong>: مجموع أرقامه يقبل القسمة على 3<br>
• يقبل القسمة على <strong>5</strong>: رقم آحاده 0 أو 5<br>
• يقبل القسمة على <strong>9</strong>: مجموع أرقامه يقبل القسمة على 9
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 1:</strong> أحسب: 3.14 × 2.5 ، 0.7 × 0.08
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 2:</strong> أنجز القسمة الإقليدية: 345 ÷ 16 ، 2000 ÷ 23
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 3:</strong> هل يقبل العدد 3456 القسمة على 2؟ على 3؟ على 9؟ علّل إجابتك.
</div>

</div>' WHERE id = 'd7ad4dc0-c950-4841-9b31-fa1cca6ba453';


-- 4. الكتابات الكسرية
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">الكتابات الكسرية</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
الكسر هو طريقة لكتابة حاصل قسمة عدد على عدد آخر غير معدوم. الكسور تسمح لنا بالتعبير عن أجزاء من كلّ أو عن حاصل قسمة غير صحيح.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">تعريف الكسر</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 تعريف:</strong><br>
<span style="color: #e74c3c; font-weight: bold;">الكسر</span> a/b حيث a عدد طبيعي و b عدد طبيعي غير معدوم:<br>
• <strong>a</strong> يسمى البسط (numérateur)<br>
• <strong>b</strong> يسمى المقام (dénominateur)<br>
• الخط الأفقي بينهما يسمى خط الكسر
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> الكسر 3/4<br>
البسط = 3 ، المقام = 4<br>
يعني: 3 أجزاء من أصل 4 ، أو حاصل قسمة 3 على 4 (= 0.75)
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">الكسور المتساوية</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;">
<strong>a/b = (a×k)/(b×k) لكل عدد k ≠ 0</strong><br>
نضرب (أو نقسم) البسط والمقام بنفس العدد فنحصل على كسر مساوٍ.
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong><br>
1/2 = 2/4 = 3/6 = 5/10 (نضرب البسط والمقام بنفس العدد)<br>
6/8 = 3/4 (نقسم البسط والمقام على 2)
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">تبسيط كسر</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 تعريف:</strong><br>
تبسيط كسر هو قسمة بسطه ومقامه على نفس العدد (قاسم مشترك). الكسر <span style="color: #e74c3c; font-weight: bold;">غير قابل للتبسيط</span> عندما لا يوجد قاسم مشترك لبسطه ومقامه سوى 1.
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> بسّط الكسر 12/18<br>
12 و 18 يقبلان القسمة على 6<br>
12/18 = (12÷6)/(18÷6) = <strong>2/3</strong>
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">مقارنة كسور</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
• إذا كان لكسرين <strong>نفس المقام</strong>: الأكبر هو ذو البسط الأكبر.<br>
• إذا كان لهما <strong>مقامان مختلفان</strong>: نوحّد المقامات أولاً ثم نقارن.
</div>

<div style="background: #fdedec; border-right: 4px solid #e74c3c; padding: 15px; margin: 15px 0; border-radius: 6px;">
⚠️ <strong>ملاحظة مهمة:</strong><br>
المقام لا يمكن أن يكون صفراً أبداً! القسمة على صفر مستحيلة.
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 1:</strong> بسّط الكسور: 15/20 ، 24/36 ، 8/12
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 2:</strong> قارن: 3/4 و 5/8 ، 2/3 و 3/5
</div>

</div>' WHERE id = '2134b451-34df-4097-9eb4-144e74d1e8c9';


-- 5. الأعداد النسبية (1ère CEM)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">الأعداد النسبية</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
في الحياة اليومية نصادف أعداداً سالبة: درجات الحرارة تحت الصفر، الأرصدة البنكية المدينة، الارتفاعات تحت سطح البحر... لذلك نحتاج إلى الأعداد النسبية.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">تعريف</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 تعريف:</strong><br>
<span style="color: #e74c3c; font-weight: bold;">العدد النسبي</span> هو عدد له إشارة (+ أو −) وقيمة مطلقة.<br><br>
• <strong>عدد نسبي موجب</strong>: مثل +3 أو 3 (أكبر من الصفر)<br>
• <strong>عدد نسبي سالب</strong>: مثل −5 (أصغر من الصفر)<br>
• <strong>الصفر</strong>: ليس موجباً وليس سالباً
</div>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;">
<strong>القيمة المطلقة لعدد نسبي هي: المسافة بين هذا العدد والصفر على المستقيم المدرّج</strong><br>
|+5| = 5 و |−5| = 5
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">المقارنة والترتيب</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
• كل عدد موجب أكبر من كل عدد سالب.<br>
• كل عدد موجب أكبر من الصفر.<br>
• كل عدد سالب أصغر من الصفر.<br>
• بين عددين سالبين، الأكبر هو الأقرب إلى الصفر.
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> رتّب تصاعدياً: −7 ، 3 ، −2 ، 0 ، 5 ، −10<br>
الترتيب: <strong>−10 &lt; −7 &lt; −2 &lt; 0 &lt; 3 &lt; 5</strong>
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">التمثيل على المستقيم المدرّج</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
على مستقيم مدرّج ذي مبدأ O:<br>
• الأعداد الموجبة على يمين O<br>
• الأعداد السالبة على يسار O<br>
• عددان <span style="color: #e74c3c; font-weight: bold;">متقابلان</span> لهما نفس البُعد عن O لكن بإشارتين مختلفتين. مثل: +3 و −3
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 1:</strong> ضع الإشارة المناسبة (&lt; أو &gt;): −4 ... −1 ، −3 ... 2 ، 0 ... −5
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 2:</strong> أوجد القيمة المطلقة: |−8| ، |+3.5| ، |0| ، |−0.7|
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 3:</strong> مثّل على مستقيم مدرّج الأعداد: −3 ، +1.5 ، −0.5 ، +4
</div>

</div>' WHERE id = '3b0ddd4e-393e-47c1-a482-db69187d6840';


-- 6. الحساب الحرفي
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">الحساب الحرفي</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
الحساب الحرفي يعني استعمال حروف (مثل x، a، b...) للتعبير عن أعداد مجهولة أو عامة. هذا يساعدنا على كتابة قوانين رياضية تصلح لكل الأعداد.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">التعبير الحرفي</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 تعريف:</strong><br>
<span style="color: #e74c3c; font-weight: bold;">التعبير الحرفي</span> هو عبارة رياضية تحتوي على أعداد وحروف وعمليات.<br><br>
<strong>اصطلاحات الكتابة:</strong><br>
• 2 × a نكتبها: <strong>2a</strong><br>
• a × b نكتبها: <strong>ab</strong><br>
• a × a نكتبها: <strong>a²</strong><br>
• 1 × a نكتبها: <strong>a</strong>
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">حساب قيمة تعبير حرفي</h3>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> أحسب قيمة التعبير 3x + 5 من أجل x = 4<br><br>
نعوّض x بالقيمة 4:<br>
3 × 4 + 5 = 12 + 5 = <strong>17</strong>
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">النشر والتبسيط</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;">
<strong>خاصية التوزيع: k(a + b) = ka + kb</strong><br>
<strong>k(a − b) = ka − kb</strong>
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> انشر ثم بسّط: 3(x + 2) + 5x<br>
= 3x + 6 + 5x<br>
= <strong>8x + 6</strong>
</div>

<div style="background: #fdedec; border-right: 4px solid #e74c3c; padding: 15px; margin: 15px 0; border-radius: 6px;">
⚠️ <strong>ملاحظة مهمة:</strong><br>
لا يمكن جمع حدود مختلفة! مثل: 3x + 5 لا يمكن تبسيطها أكثر. لكن 3x + 5x = 8x.
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 1:</strong> أحسب قيمة 2x² − 3x + 1 من أجل x = 3
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 2:</strong> انشر وبسّط: 4(2x − 1) − 3(x + 5)
</div>

</div>' WHERE id = '4e0e56f4-c0af-4f46-b61e-620ce2fadbdc';


-- 7. التناسبية (1ere_cem)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">التناسبية</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
التناسبية مفهوم أساسي نصادفه في الحياة اليومية: ثمن بضاعة بالكمية، المسافة بالزمن عند سرعة ثابتة، كمية المكونات في وصفة طبخ...
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">تعريف التناسبية</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 تعريف:</strong><br>
نقول أن مقدارين في <span style="color: #e74c3c; font-weight: bold;">وضعية تناسبية</span> إذا يمكن الانتقال من قيم أحدهما إلى قيم الآخر <strong>بالضرب في نفس العدد</strong> (معامل التناسبية).
</div>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;">
<strong>معامل التناسبية = القيمة الثانية ÷ القيمة الأولى</strong>
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong><br>
<table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
<tr style="background: #2c3e50; color: white;"><th style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">الكمية (كغ)</th><th style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">2</th><th style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">5</th><th style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">8</th></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">الثمن (دج)</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">360</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">900</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">1440</td></tr>
</table>
معامل التناسبية = 360 ÷ 2 = 900 ÷ 5 = 1440 ÷ 8 = <strong>180 دج/كغ</strong> ✅ تناسبية
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">الرابع المتناسب (الجداء التصالبي)</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;">
إذا كان a/b = c/d فإن: <strong>d = (b × c) ÷ a</strong>
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> إذا كان ثمن 3 كغ هو 540 دج، ما هو ثمن 7 كغ؟<br>
x = (540 × 7) ÷ 3 = 3780 ÷ 3 = <strong>1260 دج</strong>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 1:</strong> هل الجدول التالي جدول تناسبية؟<br>
x: 3 , 6 , 9 | y: 12 , 24 , 36
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 2:</strong> سيارة تقطع 180 كم في 3 ساعات. كم تقطع في 5 ساعات؟ (بفرض السرعة ثابتة)
</div>

</div>' WHERE id = '40e58840-5a6f-4e3f-ae4b-767545597235';


-- 8. تنظيم معطيات (1ere_cem)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">تنظيم معطيات</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
في الحياة اليومية وفي العلوم، نحتاج لجمع معلومات وتنظيمها بطريقة واضحة تساعدنا على قراءتها وتحليلها واستخلاص استنتاجات منها.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">الجداول</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 تعريف:</strong><br>
<span style="color: #e74c3c; font-weight: bold;">الجدول</span> هو طريقة لتنظيم المعطيات في صفوف وأعمدة لتسهيل القراءة والمقارنة.
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> درجات الحرارة في أسبوع<br>
<table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
<tr style="background: #2c3e50; color: white;"><th style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">اليوم</th><th style="border: 1px solid #bdc3c7; padding: 10px;">السبت</th><th style="border: 1px solid #bdc3c7; padding: 10px;">الأحد</th><th style="border: 1px solid #bdc3c7; padding: 10px;">الاثنين</th><th style="border: 1px solid #bdc3c7; padding: 10px;">الثلاثاء</th></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">درجة الحرارة °C</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">22</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">25</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">20</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">23</td></tr>
</table>
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">المخططات البيانية</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
أنواع المخططات:<br>
• <strong>المخطط بالأعمدة:</strong> يمثل كل قيمة بعمود ارتفاعه يناسب القيمة.<br>
• <strong>المخطط الدائري:</strong> يقسم الدائرة إلى قطاعات تمثل نسب القيم.<br>
• <strong>المخطط الخطي:</strong> يربط النقاط بخطوط لإظهار التطور.
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> في قسم 30 تلميذاً: 12 يفضلون الرياضيات، 8 يفضلون العلوم، 6 يفضلون اللغة العربية، و4 يفضلون التاريخ. أنشئ جدولاً واحسب النسبة المئوية لكل مادة.
</div>

</div>' WHERE id = 'af4b5115-cda4-46f7-a729-e90e9c3f9a1f';


-- 9. التوازي والتعامد
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">التوازي والتعامد</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
التوازي والتعامد هما علاقتان أساسيتان بين المستقيمات في الهندسة المستوية. نجدهما في كل مكان: جدران المباني، سطور الدفتر، شبكة الطرق...
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">المستقيمات المتعامدة</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 تعريف:</strong><br>
مستقيمان <span style="color: #e74c3c; font-weight: bold;">متعامدان</span> إذا تقاطعا وشكّلا زاوية قائمة (90°).<br>
نكتب: (d₁) ⊥ (d₂)
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">المستقيمات المتوازية</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 تعريف:</strong><br>
مستقيمان <span style="color: #e74c3c; font-weight: bold;">متوازيان</span> إذا لم يتقاطعا أبداً (البُعد بينهما ثابت).<br>
نكتب: (d₁) // (d₂)
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">خصائص أساسية</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;">
<strong>إذا كان مستقيمان متعامدين مع نفس المستقيم، فهما متوازيان.</strong><br><br>
<strong>إذا كان مستقيم متعامداً مع أحد مستقيمين متوازيين، فهو متعامد مع الآخر.</strong>
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> إذا كان (d₁) ⊥ (d₃) و (d₂) ⊥ (d₃)<br>فإن (d₁) // (d₂)
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 1:</strong> ارسم مستقيماً (d) ثم أنشئ المستقيم (d'') المار من النقطة A والمتعامد مع (d).
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 2:</strong> ارسم مستقيماً (d) ثم أنشئ المستقيم (Δ) المار من النقطة B والموازي لـ (d).
</div>

</div>' WHERE id = 'd03a16df-1c61-4f04-bbdd-c9717d496300';


-- 10. الأشكال المستوية
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">الأشكال المستوية</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
الأشكال المستوية هي أشكال هندسية مرسومة في المستوى. تتنوع بين المثلثات والرباعيات والدوائر، ولكل منها خصائص مميزة.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">المثلثات</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 أنواع المثلثات:</strong><br>
• <strong>مثلث متساوي الأضلاع:</strong> أضلاعه الثلاثة متساوية وزواياه = 60°<br>
• <strong>مثلث متساوي الساقين:</strong> ضلعان متساويان<br>
• <strong>مثلث قائم:</strong> له زاوية قائمة (90°)<br>
• <strong>مثلث عام (قائم الزوايا):</strong> لا ضلعان متساويان
</div>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;">
<strong>مجموع زوايا أي مثلث = 180°</strong>
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">الرباعيات الخاصة</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
<tr style="background: #2c3e50; color: white;"><th style="border: 1px solid #bdc3c7; padding: 10px;">الشكل</th><th style="border: 1px solid #bdc3c7; padding: 10px;">الخصائص</th></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px;"><strong>المربع</strong></td><td style="border: 1px solid #bdc3c7; padding: 10px;">4 أضلاع متساوية + 4 زوايا قائمة</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px;"><strong>المستطيل</strong></td><td style="border: 1px solid #bdc3c7; padding: 10px;">أضلاع متقابلة متساوية + 4 زوايا قائمة</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px;"><strong>المعين</strong></td><td style="border: 1px solid #bdc3c7; padding: 10px;">4 أضلاع متساوية</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px;"><strong>متوازي الأضلاع</strong></td><td style="border: 1px solid #bdc3c7; padding: 10px;">أضلاع متقابلة متساوية ومتوازية</td></tr>
</table>
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">الدائرة</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<span style="color: #e74c3c; font-weight: bold;">الدائرة</span> هي مجموعة النقاط التي تبعد بُعداً ثابتاً (نصف القطر R) عن نقطة ثابتة (المركز O).<br>
• <strong>القطر</strong> = 2 × نصف القطر<br>
• <strong>الوتر</strong>: قطعة مستقيم طرفاها على الدائرة
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> أنشئ مثلثاً ABC حيث AB = 5 سم، AC = 4 سم، BC = 3 سم. ما نوع هذا المثلث؟
</div>

</div>' WHERE id = '83a1a13f-307b-4765-8d59-24f76d70fa0d';


-- 11. السطوح المستوية: الأطوال، المحيطات، المساحات
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">السطوح المستوية: الأطوال، المحيطات، المساحات</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
حساب المحيطات والمساحات مهارة أساسية نحتاجها في العديد من التطبيقات: تبليط غرفة، سياج حديقة، طلاء جدار...
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">صيغ المحيطات والمساحات</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; font-size: 1.1em;">
<table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
<tr style="background: #2c3e50; color: white;"><th style="border: 1px solid #bdc3c7; padding: 10px;">الشكل</th><th style="border: 1px solid #bdc3c7; padding: 10px;">المحيط</th><th style="border: 1px solid #bdc3c7; padding: 10px;">المساحة</th></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px;">المربع (ضلع a)</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">P = 4a</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">S = a²</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px;">المستطيل (L, l)</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">P = 2(L+l)</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">S = L × l</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px;">المثلث (قاعدة b, ارتفاع h)</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">P = مجموع الأضلاع</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">S = (b×h)/2</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px;">الدائرة (نصف قطر R)</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">P = 2πR</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">S = πR²</td></tr>
</table>
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال 1:</strong> مستطيل طوله 8 سم وعرضه 5 سم.<br>
المحيط = 2(8+5) = 2×13 = <strong>26 سم</strong><br>
المساحة = 8×5 = <strong>40 سم²</strong>
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال 2:</strong> دائرة نصف قطرها 7 سم (π ≈ 3.14)<br>
المحيط = 2 × 3.14 × 7 = <strong>43.96 سم</strong><br>
المساحة = 3.14 × 7² = 3.14 × 49 = <strong>153.86 سم²</strong>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> أرض مربعة الشكل ضلعها 25 م. أحسب محيطها ومساحتها. إذا أردنا تبليطها بلاط مربع ضلعه 50 سم، كم بلاطة نحتاج؟
</div>

</div>' WHERE id = 'dffc5c23-6dbc-4317-ab2c-78a51695cb8f';


-- 12. الزوايا
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">الزوايا</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
الزاوية هي الشكل المكوّن من نصفي مستقيمين لهما نفس الأصل (الرأس). قياس الزوايا ضروري في الهندسة والحياة اليومية.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">أنواع الزوايا</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
<tr style="background: #2c3e50; color: white;"><th style="border: 1px solid #bdc3c7; padding: 10px;">نوع الزاوية</th><th style="border: 1px solid #bdc3c7; padding: 10px;">القياس</th></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px;">زاوية معدومة</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">0°</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px;">زاوية حادة</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">بين 0° و 90°</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px;"><strong>زاوية قائمة</strong></td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;"><strong>90°</strong></td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px;">زاوية منفرجة</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">بين 90° و 180°</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px;">زاوية مستقيمة</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">180°</td></tr>
</table>
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">زوايا خاصة</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
• <strong>زاويتان متتامتان:</strong> مجموعهما = 90°<br>
• <strong>زاويتان متكاملتان:</strong> مجموعهما = 180°<br>
• <strong>زاويتان متقابلتان بالرأس:</strong> متساويتان
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> إذا كانت زاوية قياسها 35°، ما هي متتامتها ومتكاملتها؟<br>
المتتامة = 90° − 35° = <strong>55°</strong><br>
المتكاملة = 180° − 35° = <strong>145°</strong>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> في مثلث ABC: الزاوية A = 50° والزاوية B = 70°. أوجد الزاوية C. ما نوع هذا المثلث؟
</div>

</div>' WHERE id = '0fbe5e9b-951a-4a68-b18f-f8595f58c28e';


-- 13. التناظر المحوري
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">التناظر المحوري</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
التناظر المحوري (الانعكاس) هو تحويل هندسي نلاحظه في الحياة اليومية: انعكاس الصورة في المرآة، أجنحة الفراشة، الحروف المتناظرة...
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">تعريف</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 تعريف:</strong><br>
نظير النقطة A بالنسبة لمستقيم (d) هي النقطة A'' بحيث يكون (d) هو <span style="color: #e74c3c; font-weight: bold;">المحور المتوسط</span> لقطعة المستقيم [AA''].<br><br>
أي أن: (d) يمر من منتصف [AA''] ويكون متعامداً معها.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">خصائص التناظر المحوري</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
التناظر المحوري <strong>يحفظ</strong>:<br>
• الأطوال (المسافات)<br>
• قياسات الزوايا<br>
• التوازي والتعامد<br>
• المساحات<br><br>
نظير نقطة تقع على محور التناظر <strong>هي نفسها</strong>.
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> لإيجاد نظير النقطة A بالنسبة للمستقيم (d):<br>
1. نرسم المستقيم المار من A والمتعامد مع (d)، يقطعه في H.<br>
2. نحدد A'' على هذا المستقيم بحيث HA'' = HA (على الجهة الأخرى).
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">محور تناظر شكل</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
شكل له <strong>محور تناظر</strong> إذا كان نظيره بالنسبة لهذا المحور هو نفسه.<br><br>
• المثلث المتساوي الأضلاع: 3 محاور تناظر<br>
• المربع: 4 محاور تناظر<br>
• المستطيل: 2 محوري تناظر<br>
• الدائرة: عدد لا نهائي من محاور التناظر
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> ارسم مثلثاً ABC ومستقيماً (d). أنشئ نظير المثلث بالنسبة لـ (d).
</div>

</div>' WHERE id = 'e91ac042-f62c-45ad-85a1-323b52764e10';


-- 14. متوازي المستطيلات والمكعّب
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">متوازي المستطيلات والمكعّب</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
متوازي المستطيلات والمكعّب هما من أكثر المجسمات شيوعاً: علبة أحذية، صندوق حلويات، نرد...
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">متوازي المستطيلات</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 تعريف:</strong><br>
<span style="color: #e74c3c; font-weight: bold;">متوازي المستطيلات</span> (المتوازي المستطيلات) هو مجسّم له 6 وجوه مستطيلة.<br><br>
أبعاده الثلاثة: <strong>الطول L</strong> و <strong>العرض l</strong> و <strong>الارتفاع h</strong><br><br>
• عدد الوجوه: <strong>6</strong> (3 أزواج من المستطيلات المتطابقة)<br>
• عدد الحروف: <strong>12</strong><br>
• عدد الرؤوس: <strong>8</strong>
</div>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;">
<strong>الحجم = L × l × h</strong><br>
<strong>المساحة الكلية = 2(Ll + Lh + lh)</strong>
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">المكعّب</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<span style="color: #e74c3c; font-weight: bold;">المكعّب</span> هو حالة خاصة من متوازي المستطيلات حيث جميع الأبعاد متساوية (L = l = h = a).
</div>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;">
<strong>حجم المكعّب = a³</strong><br>
<strong>المساحة الكلية = 6a²</strong>
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال 1:</strong> متوازي مستطيلات أبعاده 5 سم × 3 سم × 4 سم.<br>
الحجم = 5 × 3 × 4 = <strong>60 سم³</strong><br>
المساحة الكلية = 2(15 + 20 + 12) = 2 × 47 = <strong>94 سم²</strong>
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال 2:</strong> مكعّب حرفه 6 سم.<br>
الحجم = 6³ = <strong>216 سم³</strong><br>
المساحة = 6 × 6² = 6 × 36 = <strong>216 سم²</strong>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> حوض سمك على شكل متوازي مستطيلات أبعاده 80 سم × 40 سم × 50 سم. أحسب حجمه بالسم³ ثم بالليترات (1 لتر = 1000 سم³).
</div>

</div>' WHERE id = '3be49d62-9d37-43c2-a3b0-cbae3e95d32e';
