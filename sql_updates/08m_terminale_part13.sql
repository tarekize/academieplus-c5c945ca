-- Terminale Batch 13: Lesson 181 (FINAL LESSON)
-- Topic: Loi exponentielle

-- Lesson 181: Loi exponentielle
UPDATE lessons SET content = '<div style="font-family: Tajawal, Arial, sans-serif; line-height: 1.8; padding: 20px; direction: rtl;">

<h2 style="color: #2980b9; border-bottom: 3px solid #2980b9; padding-bottom: 10px;">📊 القانون الأسي (تعمّق)</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #2980b9; margin-top: 0;">📘 تعريف القانون الأسي</h3>
<p>المتغير العشوائي المستمر X يتبع القانون الأسي ذا المعامل λ > 0 (نكتب X ~ E(λ)) إذا كانت دالة كثافته:</p>
<p style="text-align: center; font-size: 1.2em; color: #2980b9;"><strong>f(x) = λe⁻ᵏˣ لـ x ≥ 0 ، f(x) = 0 لـ x < 0</strong></p>
</div>

<div style="background: #d5a6e6; border-right: 4px solid #8e44ad; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #8e44ad; margin-top: 0;">📐 خصائص القانون الأسي</h3>
<p><strong>دالة التوزيع:</strong></p>
<p style="text-align: center;">F(t) = P(X ≤ t) = 1 - e⁻ᵏᵗ لـ t ≥ 0</p>
<p><strong>الاحتمالات:</strong></p>
<ul>
<li>P(X ≤ t) = 1 - e⁻ᵏᵗ</li>
<li>P(X > t) = e⁻ᵏᵗ</li>
<li>P(a < X < b) = e⁻ᵏᵃ - e⁻ᵏᵇ</li>
</ul>
<p><strong>المعالم:</strong></p>
<ul>
<li><strong>الأمل الرياضي:</strong> E(X) = 1/λ</li>
<li><strong>التباين:</strong> V(X) = 1/λ²</li>
<li><strong>الانحراف المعياري:</strong> σ(X) = 1/λ</li>
<li><strong>الوسيط:</strong> Me = ln(2)/λ</li>
</ul>
</div>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #2980b9; margin-top: 0;">📘 خاصية انعدام الذاكرة</h3>
<p>القانون الأسي هو القانون المستمر الوحيد الذي يحقق:</p>
<p style="text-align: center; font-size: 1.2em; color: #2980b9;"><strong>P(X > s + t | X > s) = P(X > t)</strong></p>
<p><strong>التفسير:</strong> إذا كان X يمثل عمر جهاز، فإن احتمال أن يعمل t ساعات إضافية لا يتعلق بكم عمل سابقاً.</p>
<p><strong>البرهان:</strong></p>
<p>P(X > s+t | X > s) = P(X > s+t) / P(X > s) = e⁻ᵏ⁽ˢ⁺ᵗ⁾ / e⁻ᵏˢ = e⁻ᵏᵗ = P(X > t) ✓</p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 1: عمر مصباح كهربائي</h3>
<p>عمر مصباح (بالآلاف ساعة) يتبع E(0.5)</p>
<p><strong>E(X) = 1/0.5 = 2</strong> (أي 2000 ساعة في المتوسط)</p>
<p><strong>P(X > 3) = e⁻⁰·⁵ˣ³ = e⁻¹·⁵ ≈ 0.2231</strong></p>
<p>أي 22.3% من المصابيح تعيش أكثر من 3000 ساعة</p>
<p><strong>الوسيط:</strong> Me = ln(2)/0.5 ≈ 1.386 (أي 1386 ساعة)</p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 2: وقت الانتظار</h3>
<p>وقت الانتظار في محطة (بالدقائق) يتبع E(0.1)</p>
<p>E(T) = 10 دقائق</p>
<p><strong>P(T < 5) = 1 - e⁻⁰·¹ˣ⁵ = 1 - e⁻⁰·⁵ ≈ 0.3935</strong></p>
<p><strong>P(T > 15) = e⁻⁰·¹ˣ¹⁵ = e⁻¹·⁵ ≈ 0.2231</strong></p>
<p><strong>P(5 < T < 20) = e⁻⁰·⁵ - e⁻² ≈ 0.6065 - 0.1353 = 0.4712</strong></p>
</div>

<div style="background: #fef9e7; border-right: 4px solid #e67e22; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e67e22; margin-top: 0;">💡 مثال 3: تحديد المعامل λ</h3>
<p>إذا علمنا أن P(X > 4) = 0.3، أوجد λ</p>
<p>e⁻⁴ᵏ = 0.3 ⟹ -4λ = ln(0.3) ⟹ λ = -ln(0.3)/4 ≈ <strong>0.301</strong></p>
<p>E(X) = 1/0.301 ≈ 3.32</p>
</div>

<div style="background: #fdedec; border-right: 4px solid #e74c3c; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #e74c3c; margin-top: 0;">⚠️ متى نستخدم القانون الأسي؟</h3>
<ul>
<li>نمذجة أوقات الانتظار بين أحداث عشوائية متتالية</li>
<li>مدة حياة الأجهزة الإلكترونية (بدون تآكل)</li>
<li>الظواهر التي لا تمتلك "ذاكرة"</li>
<li><strong>لا يصلح</strong> للظواهر التي تزداد فيها نسبة العطل مع الزمن (تآكل)</li>
</ul>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h3 style="color: #1abc9c; margin-top: 0;">✏️ تمارين تطبيقية</h3>
<p><strong>التمرين 1:</strong> X ~ E(2). احسب P(X > 1) و P(0.5 < X < 2) و E(X)</p>
<p><strong>التمرين 2:</strong> عمر بطارية يتبع القانون الأسي بمتوسط 3 سنوات. أوجد λ ثم احسب P(X > 5)</p>
<p><strong>التمرين 3:</strong> تحقق عملياً من خاصية انعدام الذاكرة: إذا X ~ E(0.5)، احسب P(X > 7 | X > 3) و P(X > 4) وقارن</p>
<p><strong>التمرين 4:</strong> أوجد الوسيط والربيع الأول والربيع الثالث للقانون الأسي E(λ)</p>
</div>

</div>' WHERE id = 'f346ac47-bd19-47b5-8d2c-0d65d9c4a43e';
