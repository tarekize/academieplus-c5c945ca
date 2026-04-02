-- =====================================================
-- MISE À JOUR DU CONTENU DES LEÇONS : 5ème PRIMAIRE
-- =====================================================

-- 1. قِيمَةُ الرَّقم حَسْبَ مَنْزِلَتِه (Valeur du chiffre selon sa position)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">قِيمَةُ الرَّقم حَسْبَ مَنْزِلَتِه</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
في عدد مكوّن من عدة أرقام، تتغيّر قيمة كل رقم حسب المنزلة التي يحتلها. معرفة قيمة الرقم حسب منزلته تساعدنا على فهم الأعداد الكبيرة وإجراء العمليات الحسابية بشكل صحيح.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">تعريف المنازل</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 تعريف:</strong><br>
<span style="color: #e74c3c; font-weight: bold;">المنزلة</span> هي الموضع الذي يحتله الرقم في العدد. كل منزلة تعطي للرقم قيمة مختلفة.<br><br>
المنازل من اليمين إلى اليسار هي:
<table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
<tr style="background: #2c3e50; color: white; padding: 12px;">
<th style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">المنزلة</th>
<th style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">القيمة</th>
</tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">الآحاد</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">1</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">العشرات</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">10</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">المئات</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">100</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">الآلاف</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">1 000</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">عشرات الآلاف</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">10 000</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">مئات الآلاف</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">100 000</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">الملايين</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">1 000 000</td></tr>
</table>
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">خصائص المنازل</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;">
<strong>قيمة الرقم = الرقم × قيمة منزلته</strong>
</div>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 خاصية:</strong><br>
• كل منزلة تساوي <strong>10 مرات</strong> المنزلة التي على يمينها.<br>
• الرقم 0 في أي منزلة يعني عدم وجود وحدات من تلك المنزلة.<br>
• نفس الرقم يمكن أن يكون له قِيَم مختلفة حسب منزلته.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">أمثلة محلولة</h3>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال 1:</strong><br>
في العدد <strong>45 832</strong>، أوجد قيمة كل رقم:<br><br>
<table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
<tr style="background: #2c3e50; color: white; padding: 12px;">
<th style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">الرقم</th>
<th style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">المنزلة</th>
<th style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">القيمة</th>
</tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">2</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">الآحاد</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">2</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">3</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">العشرات</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">30</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">8</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">المئات</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">800</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">5</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">الآلاف</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">5 000</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">4</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">عشرات الآلاف</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">40 000</td></tr>
</table>
إذن: 45 832 = 40 000 + 5 000 + 800 + 30 + 2
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال 2:</strong><br>
في العدد <strong>307 061</strong>، ما هي قيمة الرقم 3؟<br><br>
الرقم 3 يقع في منزلة <strong>مئات الآلاف</strong>.<br>
قيمته = 3 × 100 000 = <strong>300 000</strong>
</div>

<div style="background: #fdedec; border-right: 4px solid #e74c3c; padding: 15px; margin: 15px 0; border-radius: 6px;">
⚠️ <strong>ملاحظة مهمة:</strong><br>
لا تخلط بين <span style="color: #e74c3c; font-weight: bold;">الرقم</span> و<span style="color: #e74c3c; font-weight: bold;">قيمته</span>! الرقم 5 في العدد 500 قيمته 500 وليس 5.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">تمارين تطبيقية</h3>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 1:</strong><br>
في العدد 76 254، أوجد قيمة كل رقم حسب منزلته.
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 2:</strong><br>
اكتب تفكيك العدد 803 415 حسب المنازل.
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 3:</strong><br>
ما هي قيمة الرقم 9 في كل من الأعداد التالية: 9 321 ، 49 000 ، 190 000؟
</div>

</div>' WHERE id = '4f23dbd6-3e8a-4e5f-b748-979b75237305';


-- 2. المقياس (L'échelle)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">المقياس</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
عندما نريد رسم خريطة أو تصميم لمبنى، لا يمكننا رسمه بحجمه الحقيقي. لذلك نستعمل <span style="color: #e74c3c; font-weight: bold;">المقياس</span> الذي يسمح لنا بتمثيل الأبعاد الحقيقية بأبعاد أصغر (أو أكبر) مع الحفاظ على التناسب.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">تعريف المقياس</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 تعريف:</strong><br>
<span style="color: #e74c3c; font-weight: bold;">المقياس</span> هو النسبة بين البعد على الرسم (أو الخريطة) والبعد الحقيقي.<br><br>
</div>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;">
<strong>المقياس = البعد على الرسم ÷ البعد الحقيقي</strong>
</div>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 خاصية:</strong><br>
• إذا كان المقياس <strong>1/1000</strong>، فإن 1 سم على الرسم يمثل 1000 سم (أي 10 م) في الواقع.<br>
• إذا كان المقياس <strong>1/100 000</strong>، فإن 1 سم على الخريطة يمثل 100 000 سم (أي 1 كم) في الواقع.<br>
• يجب أن تكون الوحدتان (على الرسم وفي الواقع) <strong>متماثلتين</strong> عند حساب المقياس.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">كيفية استخدام المقياس</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 طريقة الحساب:</strong><br>
<strong>لإيجاد البعد الحقيقي:</strong><br>
البعد الحقيقي = البعد على الرسم × مقلوب المقياس<br><br>
<strong>لإيجاد البعد على الرسم:</strong><br>
البعد على الرسم = البعد الحقيقي × المقياس
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">أمثلة محلولة</h3>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال 1:</strong><br>
خريطة مقياسها <strong>1/200 000</strong>. المسافة بين مدينتين على الخريطة هي <strong>4 سم</strong>. ما هي المسافة الحقيقية؟<br><br>
<strong>الحل:</strong><br>
المسافة الحقيقية = 4 سم × 200 000 = 800 000 سم<br>
800 000 سم = 8 000 م = <strong>8 كم</strong>
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال 2:</strong><br>
تصميم غرفة بمقياس <strong>1/50</strong>. طول الغرفة الحقيقي هو <strong>6 م</strong>. ما هو طولها على التصميم؟<br><br>
<strong>الحل:</strong><br>
6 م = 600 سم<br>
البعد على التصميم = 600 ÷ 50 = <strong>12 سم</strong>
</div>

<div style="background: #fdedec; border-right: 4px solid #e74c3c; padding: 15px; margin: 15px 0; border-radius: 6px;">
⚠️ <strong>ملاحظة مهمة:</strong><br>
تأكد دائماً من توحيد الوحدات قبل تطبيق المقياس! حوّل كل الأبعاد إلى نفس الوحدة (عادةً السنتيمتر).
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">تمارين تطبيقية</h3>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 1:</strong><br>
خريطة بمقياس 1/500 000. المسافة بين مدينتين على الخريطة 3 سم. أوجد المسافة الحقيقية بالكيلومتر.
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 2:</strong><br>
تصميم ملعب بمقياس 1/200. طول الملعب الحقيقي 100 م وعرضه 70 م. أوجد أبعاده على التصميم.
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 3:</strong><br>
على تصميم بمقياس 1/100، طول جدار هو 5.5 سم. ما هو طوله الحقيقي بالأمتار؟
</div>

</div>' WHERE id = '961f0cc1-7fbb-4a68-bbc3-ec3c11643b9b';


-- 3. قياس سعات (Mesure de capacités)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">قياس سعات</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
السعة هي كمية السائل التي يمكن أن يحتويها إناء. نحتاج لقياس السعات في حياتنا اليومية: كمية الماء في قارورة، كمية الحليب في علبة، كمية البنزين في خزان السيارة...
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">تعريف السعة ووحداتها</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 تعريف:</strong><br>
<span style="color: #e74c3c; font-weight: bold;">السعة</span> هي حجم السائل الذي يمكن أن يحتويه إناء. الوحدة الأساسية لقياس السعات هي <span style="color: #e74c3c; font-weight: bold;">اللتر (l)</span>.
</div>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 وحدات قياس السعات:</strong><br>
<table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
<tr style="background: #2c3e50; color: white; padding: 12px;">
<th style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">الوحدة</th>
<th style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">الرمز</th>
<th style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">القيمة باللتر</th>
</tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">الهكتولتر</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">hl</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">100 l</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">الديكالتر</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">dal</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">10 l</td></tr>
<tr style="background: #eaf2f8;"><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;"><strong>اللتر</strong></td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;"><strong>l</strong></td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;"><strong>1 l</strong></td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">الديسيلتر</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">dl</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">0.1 l</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">السنتيلتر</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">cl</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">0.01 l</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">المليلتر</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">ml</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">0.001 l</td></tr>
</table>
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">التحويل بين الوحدات</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;">
<strong>للانتقال من وحدة إلى الوحدة الأصغر منها مباشرة: نضرب في 10</strong><br>
<strong>للانتقال من وحدة إلى الوحدة الأكبر منها مباشرة: نقسم على 10</strong>
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">أمثلة محلولة</h3>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال 1:</strong><br>
حوّل 3.5 لتر إلى مليلتر.<br><br>
<strong>الحل:</strong><br>
1 لتر = 1000 مليلتر<br>
3.5 لتر = 3.5 × 1000 = <strong>3 500 مليلتر</strong>
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال 2:</strong><br>
حوّل 250 سنتيلتر إلى لتر.<br><br>
<strong>الحل:</strong><br>
1 لتر = 100 سنتيلتر<br>
250 سنتيلتر = 250 ÷ 100 = <strong>2.5 لتر</strong>
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال 3:</strong><br>
خزان سيارة سعته 50 لتراً. كم هكتولتر يساوي ذلك؟<br><br>
<strong>الحل:</strong><br>
1 هكتولتر = 100 لتر<br>
50 لتر = 50 ÷ 100 = <strong>0.5 هكتولتر</strong>
</div>

<div style="background: #fdedec; border-right: 4px solid #e74c3c; padding: 15px; margin: 15px 0; border-radius: 6px;">
⚠️ <strong>ملاحظة مهمة:</strong><br>
1 لتر = 1 ديسيمتر مكعب (dm³) وهذا يربط السعات بالحجوم.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">تمارين تطبيقية</h3>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 1:</strong><br>
حوّل: 7 l إلى ml ، 4500 ml إلى l ، 35 cl إلى dl
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 2:</strong><br>
قارورة ماء سعتها 1.5 l. كم قارورة نحتاج لملء إناء سعته 12 l؟
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 3:</strong><br>
رتّب السعات التالية من الأصغر إلى الأكبر: 500 ml ، 2 l ، 30 cl ، 1.5 dl
</div>

</div>' WHERE id = 'ed096ff6-db4b-45ee-8deb-ef7b97fb527d';


-- 4. وضعيات حسابية (Situations arithmétiques)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">وضعيات حسابية</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
الوضعيات الحسابية هي مسائل من الحياة اليومية تتطلب استعمال العمليات الأربع (الجمع، الطرح، الضرب، القسمة) لإيجاد الحل. التعرف على نوع العملية المناسبة هو المفتاح لحل أي وضعية.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">كيف نختار العملية المناسبة؟</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 قواعد أساسية:</strong><br>
<table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
<tr style="background: #2c3e50; color: white; padding: 12px;">
<th style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">الكلمات المفتاحية</th>
<th style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">العملية</th>
</tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">المجموع، إضافة، زيادة، كم يصبح</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;"><strong>الجمع (+)</strong></td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">الفرق، نقصان، الباقي، كم يبقى</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;"><strong>الطرح (−)</strong></td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">ضعف، أضعاف، مرات، ثمن عدة أشياء متشابهة</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;"><strong>الضرب (×)</strong></td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">توزيع، تقسيم، حصة كل واحد، كم مرة</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;"><strong>القسمة (÷)</strong></td></tr>
</table>
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">منهجية حل وضعية حسابية</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 الخطوات:</strong><br>
<strong>1.</strong> أقرأ الوضعية جيداً وأفهمها.<br>
<strong>2.</strong> أحدد المعطيات (ما أعرفه).<br>
<strong>3.</strong> أحدد السؤال (ما أبحث عنه).<br>
<strong>4.</strong> أختار العملية المناسبة.<br>
<strong>5.</strong> أنجز العملية الحسابية.<br>
<strong>6.</strong> أكتب الجواب بجملة كاملة.<br>
<strong>7.</strong> أتحقق من معقولية النتيجة.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">أمثلة محلولة</h3>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال 1 (جمع وطرح):</strong><br>
اشترى أحمد دفتراً بـ 150 دج وقلماً بـ 75 دج. دفع بورقة نقدية من فئة 500 دج. كم يسترجع؟<br><br>
<strong>الحل:</strong><br>
المبلغ الإجمالي = 150 + 75 = 225 دج<br>
المبلغ المسترجع = 500 − 225 = <strong>275 دج</strong>
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال 2 (ضرب):</strong><br>
ثمن كتاب 350 دج. اشترت المدرسة 24 كتاباً. ما هو الثمن الإجمالي؟<br><br>
<strong>الحل:</strong><br>
الثمن الإجمالي = 350 × 24 = <strong>8 400 دج</strong>
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال 3 (قسمة):</strong><br>
يريد أب توزيع 840 دج بالتساوي على أبنائه الـ 4. كم يأخذ كل ابن؟<br><br>
<strong>الحل:</strong><br>
حصة كل ابن = 840 ÷ 4 = <strong>210 دج</strong>
</div>

<div style="background: #fdedec; border-right: 4px solid #e74c3c; padding: 15px; margin: 15px 0; border-radius: 6px;">
⚠️ <strong>ملاحظة مهمة:</strong><br>
بعض الوضعيات تتطلب أكثر من عملية واحدة! اقرأ الوضعية بتمعن لتحديد جميع العمليات اللازمة.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">تمارين تطبيقية</h3>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 1:</strong><br>
في مكتبة 1250 كتاباً عربياً و875 كتاباً فرنسياً. أُعير 340 كتاباً. كم كتاباً بقي في المكتبة؟
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 2:</strong><br>
ثمن 1 كغ من البرتقال 180 دج. اشترت أم 3 كغ من البرتقال و2 كغ من التفاح بسعر 250 دج/كغ. ما هو المبلغ الإجمالي؟
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 3:</strong><br>
يقطع حافلة مسافة 480 كم في 6 ساعات. ما هي المسافة التي يقطعها في ساعة واحدة؟ وفي 10 ساعات؟
</div>

</div>' WHERE id = '7878f68f-94e1-4daa-a49a-87f7ac858a76';


-- 5. السرعة المتوسطة (La vitesse moyenne)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">السرعة المتوسطة</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
السرعة المتوسطة تعبّر عن المسافة التي يقطعها جسم متحرك في وحدة زمنية. نستعملها يومياً: سرعة السيارة، سرعة القطار، سرعة الماشي على الأقدام...
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">تعريف السرعة المتوسطة</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 تعريف:</strong><br>
<span style="color: #e74c3c; font-weight: bold;">السرعة المتوسطة</span> هي حاصل قسمة المسافة المقطوعة على الزمن المستغرق.
</div>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;">
<strong>السرعة = المسافة ÷ الزمن</strong><br><br>
<strong>V = d ÷ t</strong><br><br>
ومنها: <strong>d = V × t</strong> و <strong>t = d ÷ V</strong>
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">وحدات قياس السرعة</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
<tr style="background: #2c3e50; color: white; padding: 12px;">
<th style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">المسافة بـ</th>
<th style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">الزمن بـ</th>
<th style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">وحدة السرعة</th>
</tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">كم (km)</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">ساعة (h)</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">كم/سا (km/h)</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">متر (m)</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">ثانية (s)</td><td style="border: 1px solid #bdc3c7; padding: 10px; text-align: center;">م/ثا (m/s)</td></tr>
</table>
</div>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.2em;">
<strong>للتحويل من km/h إلى m/s: نقسم على 3.6</strong><br>
<strong>للتحويل من m/s إلى km/h: نضرب في 3.6</strong>
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">أمثلة محلولة</h3>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال 1:</strong><br>
سيارة قطعت 240 كم في 3 ساعات. ما هي سرعتها المتوسطة؟<br><br>
<strong>الحل:</strong><br>
V = d ÷ t = 240 ÷ 3 = <strong>80 كم/سا</strong>
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال 2:</strong><br>
قطار يسير بسرعة 120 كم/سا. ما هي المسافة التي يقطعها في ساعتين ونصف؟<br><br>
<strong>الحل:</strong><br>
d = V × t = 120 × 2.5 = <strong>300 كم</strong>
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال 3:</strong><br>
دراج يقطع 45 كم بسرعة 15 كم/سا. كم من الوقت يستغرق؟<br><br>
<strong>الحل:</strong><br>
t = d ÷ V = 45 ÷ 15 = <strong>3 ساعات</strong>
</div>

<div style="background: #fdedec; border-right: 4px solid #e74c3c; padding: 15px; margin: 15px 0; border-radius: 6px;">
⚠️ <strong>ملاحظة مهمة:</strong><br>
انتبه لوحدة الزمن! إذا كان الزمن بالدقائق، حوّله إلى ساعات قبل الحساب. مثلاً: 30 دقيقة = 0.5 ساعة، 45 دقيقة = 0.75 ساعة.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">تمارين تطبيقية</h3>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 1:</strong><br>
سيارة قطعت 150 كم في ساعتين. أحسب سرعتها المتوسطة.
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 2:</strong><br>
طائرة تطير بسرعة 900 كم/سا. كم تقطع في 3 ساعات و20 دقيقة؟
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 3:</strong><br>
المسافة بين الجزائر ووهران 430 كم. سيارة تسير بسرعة 86 كم/سا. كم تستغرق من الوقت؟
</div>

</div>' WHERE id = 'd56963eb-13a2-49bf-b7b4-5ad688fb9f81';


-- 6. منهجية حلّ مشكلات (Méthodologie de résolution de problèmes)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px; margin-top: 30px;">منهجية حلّ مشكلات</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 مقدمة:</strong><br>
حل المشكلات الرياضية ليس مجرد إجراء عمليات حسابية، بل هو عملية تفكير منظمة. اتباع منهجية واضحة يساعدك على حل أي مشكلة مهما كانت صعوبتها.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">مراحل حل المشكلة</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📖 المراحل الأساسية:</strong><br><br>

<strong style="color: #2980b9;">المرحلة 1: فهم المشكلة 🔍</strong><br>
• أقرأ النص مرتين أو ثلاث مرات.<br>
• أحدد: ماذا أعرف؟ (المعطيات) وماذا يُطلب مني؟ (السؤال)<br>
• أبحث عن الكلمات المفتاحية.<br><br>

<strong style="color: #27ae60;">المرحلة 2: البحث عن خطة الحل 📝</strong><br>
• أختار العملية أو العمليات المناسبة.<br>
• أرتب خطوات الحل.<br>
• أتأكد أن لدي كل المعلومات اللازمة.<br><br>

<strong style="color: #e67e22;">المرحلة 3: تنفيذ الحل ✏️</strong><br>
• أنجز العمليات الحسابية بدقة.<br>
• أكتب كل خطوة بوضوح.<br>
• لا أنسى الوحدات.<br><br>

<strong style="color: #8e44ad;">المرحلة 4: التحقق والإجابة ✅</strong><br>
• أعيد قراءة السؤال.<br>
• أتحقق: هل إجابتي منطقية؟<br>
• أكتب جملة الجواب.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">أمثلة محلولة</h3>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال 1:</strong><br>
اشترى تاجر 45 صندوقاً من البرتقال، في كل صندوق 12 كغ. باع 380 كغ. كم كيلوغراماً بقي عنده؟<br><br>
<strong>الفهم:</strong> المعطيات: 45 صندوقاً، 12 كغ/صندوق، باع 380 كغ. السؤال: كم بقي؟<br>
<strong>الخطة:</strong> أولاً أحسب الكمية الإجمالية (ضرب)، ثم أطرح ما باعه (طرح).<br>
<strong>التنفيذ:</strong><br>
الكمية الإجمالية = 45 × 12 = 540 كغ<br>
الكمية الباقية = 540 − 380 = <strong>160 كغ</strong><br>
<strong>التحقق:</strong> 160 + 380 = 540 = 45 × 12 ✅
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال 2:</strong><br>
حديقة مستطيلة الشكل طولها 35 م وعرضها 20 م. نريد إحاطتها بسياج. ثمن المتر الواحد من السياج 450 دج. ما هو الثمن الإجمالي؟<br><br>
<strong>الفهم:</strong> حديقة مستطيلة (35 × 20)، سياج بـ 450 دج/م. السؤال: الثمن الإجمالي.<br>
<strong>الخطة:</strong> أحسب المحيط أولاً، ثم أضرب في ثمن المتر.<br>
<strong>التنفيذ:</strong><br>
المحيط = 2 × (35 + 20) = 2 × 55 = 110 م<br>
الثمن الإجمالي = 110 × 450 = <strong>49 500 دج</strong>
</div>

<div style="background: #fdedec; border-right: 4px solid #e74c3c; padding: 15px; margin: 15px 0; border-radius: 6px;">
⚠️ <strong>ملاحظة مهمة:</strong><br>
• لا تبدأ الحل مباشرة! خذ وقتك في الفهم أولاً.<br>
• في المشكلات المعقدة، قسّمها إلى مشكلات صغيرة.<br>
• التحقق من الإجابة بطريقة مختلفة يضمن صحتها.
</div>

<h3 style="color: #e67e22; font-size: 1.4em; margin-top: 20px; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">تمارين تطبيقية</h3>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 1:</strong><br>
مدرسة فيها 12 قسماً، في كل قسم 32 تلميذاً. اشترت المدرسة كتاباً لكل تلميذ بسعر 550 دج. ما هو المبلغ الإجمالي الذي دفعته المدرسة؟
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 2:</strong><br>
صهريج ماء سعته 5000 لتر. يملأ بمضخة تدفع 250 لتراً في الدقيقة. بعد 15 دقيقة، توقفت المضخة. كم لتراً ينقص لملء الصهريج كاملاً؟
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين 3:</strong><br>
عائلة تستهلك 3 أكياس حليب يومياً. ثمن الكيس 25 دج. كم تنفق هذه العائلة على الحليب في شهر مارس (31 يوماً)؟
</div>

</div>' WHERE id = 'c93a5ab6-c300-4d9b-a050-9fb6143e1044';
