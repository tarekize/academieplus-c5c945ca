-- =====================================================
-- MISE À JOUR DU CONTENU : Première Année Secondaire — Partie 2 (19 leçons)
-- =====================================================

-- 20. القضايا البسيطة والمركبة (المنطق)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px;">الحكم على القضايا البسيطة والمركبة</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 الهدف:</strong> التمييز بين القضايا الصحيحة والخاطئة واستعمال الروابط المنطقية (و، أو، نفي).
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">القضية والروابط المنطقية</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>القضية:</strong> عبارة يمكن الحكم عليها بالصحة (V) أو الخطأ (F).<br><br>
• <strong>الفصل (أو — ∨):</strong> P ∨ Q صحيحة إذا كانت إحداهما صحيحة على الأقل<br>
• <strong>الوصل (و — ∧):</strong> P ∧ Q صحيحة فقط إذا كانتا معاً صحيحتين<br>
• <strong>النفي (¬P):</strong> نفي P صحيح إذا كانت P خاطئة والعكس
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 P: "4 أولي" (F) ، Q: "4 زوجي" (V)<br>
P ∨ Q = V ، P ∧ Q = F ، ¬P = V
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">القضية الشرطية</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px;">
<strong>P ⟹ Q</strong> (إذا P فإن Q)<br>
خاطئة فقط عندما P صحيحة و Q خاطئة.<br><br>
<strong>التكافؤ:</strong> P ⟺ Q تعني (P ⟹ Q) و (Q ⟹ P) معاً.
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> حدد القيمة الصدقية: "إذا كان x² = 4 فإن x = 2". هل هي صحيحة؟ ما عكسها؟
</div>

</div>' WHERE id = '460e7aa8-3c35-4349-9d84-f682b158529c';


-- 21. البرهان بالاستنتاج وبالخلف
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px;">البرهان بالاستنتاج وبالخلف</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 الهدف:</strong> إتقان طريقتي البرهان المباشر (بالاستنتاج) وغير المباشر (بالخلف).
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">البرهان المباشر (بالاستنتاج)</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
ننطلق من الفرضية (P)، ونستعمل خصائص مثبتة للوصول إلى النتيجة (Q).<br>
P ⟹ Q₁ ⟹ Q₂ ⟹ ... ⟹ Q
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> أثبت أنه إذا كان n زوجياً فإن n² زوجي.<br>
n زوجي ← n = 2k ← n² = 4k² = 2(2k²) ← n² زوجي ✓
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">البرهان بالخلف (par l''absurde)</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
نفترض عكس النتيجة ونصل إلى تناقض.<br>
نريد إثبات P ← نفترض ¬P ← نصل إلى تناقض ← إذاً P صحيحة.
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> أثبت أن √2 غير ناطق.<br>
نفترض √2 = a/b (كسر مبسط) ← 2 = a²/b² ← a² = 2b²<br>
← a² زوجي ← a زوجي ← a = 2k ← 4k² = 2b² ← b² = 2k² ← b زوجي<br>
← a و b كلاهما زوجيان ← الكسر غير مبسط: <strong>تناقض!</strong> ← √2 غير ناطق.
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> أثبت بالخلف أنه لا يوجد عدد صحيح n بحيث n² + 1 = 5n.
</div>

</div>' WHERE id = '12efec88-ee64-4bf2-b8c1-a80c8122f354';


-- 22. التعرف على نمط برهان
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px;">التعرف على نمط برهان وشرحه</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 الهدف:</strong> تحليل برهان مُقدَّم والتعرف على النمط المستعمل وشرح كل خطوة.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">بنية البرهان</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
كل برهان يتكون من:<br>
1. <strong>الفرضيات:</strong> المعطيات المقبولة<br>
2. <strong>الخطوات:</strong> تحويلات منطقية، كل واحدة مبررة<br>
3. <strong>النتيجة:</strong> ما نريد إثباته<br>
4. <strong>المبررات:</strong> خصائص، تعريفات، أو نتائج سابقة
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> "مجموع عددين فرديين هو عدد زوجي":<br>
الفرضية: a = 2p+1 و b = 2q+1 (فرديان)<br>
الخطوة: a+b = 2p+1+2q+1 = 2(p+q+1)<br>
النتيجة: a+b زوجي ✓<br>
<strong>النمط:</strong> برهان مباشر بالاستنتاج
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> اقرأ البرهان التالي وحدد نمطه: "إذا كان n² فردياً فإن n فردي. البرهان: لو كان n زوجياً لكان n² زوجياً وهذا يناقض الفرضية."
</div>

</div>' WHERE id = '801dfa3f-6651-4e52-9811-431071a177cb';


-- 23. التمييز بين أنماط البرهان
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px;">التمييز بين أنماط البرهان</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 الهدف:</strong> المقارنة بين أنماط البرهان المختلفة واختيار الأنسب لكل مسألة.
</div>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px;">
<table style="width: 100%; border-collapse: collapse;">
<tr style="background: #2c3e50; color: white;"><th style="border: 1px solid #bdc3c7; padding: 8px;">النمط</th><th style="border: 1px solid #bdc3c7; padding: 8px;">المبدأ</th><th style="border: 1px solid #bdc3c7; padding: 8px;">متى نستعمله</th></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 8px;">مباشر</td><td style="border: 1px solid #bdc3c7; padding: 8px;">P ⟹ Q₁ ⟹ Q</td><td style="border: 1px solid #bdc3c7; padding: 8px;">المسار واضح</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 8px;">بالخلف</td><td style="border: 1px solid #bdc3c7; padding: 8px;">¬Q ⟹ تناقض</td><td style="border: 1px solid #bdc3c7; padding: 8px;">صعب مباشرة (مثل عدم الوجود)</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 8px;">بالمعكوس</td><td style="border: 1px solid #bdc3c7; padding: 8px;">¬Q ⟹ ¬P</td><td style="border: 1px solid #bdc3c7; padding: 8px;">إثبات P ⟹ Q عبر المعكوس</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 8px;">بالمثال المضاد</td><td style="border: 1px solid #bdc3c7; padding: 8px;">إيجاد حالة تنقض</td><td style="border: 1px solid #bdc3c7; padding: 8px;">لإثبات أن قضية خاطئة</td></tr>
</table>
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال مضاد:</strong> "هل كل عدد فردي أولي؟"<br>
مثال مضاد: 9 = 3×3 فردي لكن غير أولي ← <strong>القضية خاطئة</strong>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> أثبت بالمعكوس: "إذا كان n² زوجياً فإن n زوجي".
</div>

</div>' WHERE id = 'ea331e6b-d302-427d-ac24-3d72edd1094d';


-- 24. تقريب نمط برهان من صيغة منطقية
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px;">تقريب نمط برهان من صيغة منطقية</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 الهدف:</strong> ربط كل نمط برهان بصيغته المنطقية المكافئة واستعمال الكتابة الرمزية.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">الصيغ المنطقية</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px;">
• البرهان المباشر: <strong>P ⟹ Q</strong><br>
• البرهان بالمعكوس: <strong>¬Q ⟹ ¬P</strong> (يكافئ P ⟹ Q)<br>
• البرهان بالخلف: <strong>¬P ⟹ تناقض</strong> (لإثبات P)<br>
• المثال المضاد: <strong>∃x, P(x) ∧ ¬Q(x)</strong> (لنقض ∀x, P(x) ⟹ Q(x))
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">المحدّدان (∀ و ∃)</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
• <strong>∀x</strong> (لكل x): القضية صحيحة لجميع القيم<br>
• <strong>∃x</strong> (يوجد x): القضية صحيحة لقيمة واحدة على الأقل<br><br>
نفي ∀x, P(x) هو ∃x, ¬P(x)<br>
نفي ∃x, P(x) هو ∀x, ¬P(x)
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> اكتب نفي القضية: "∀n ∈ ℕ, n² + n زوجي". ثم حدد هل القضية الأصلية صحيحة أم خاطئة.
</div>

</div>' WHERE id = 'e3624ffc-b977-4ca9-9999-058092ac4921';


-- 25. الحساب في المجموعات العددية (TCS)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px;">ممارسة الحساب في المجموعات العددية — جذع مشترك علوم</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 الهدف:</strong> التعمق في الحساب في ℝ مع التركيز على القيمة المطلقة والمجالات والقوى.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">القيمة المطلقة</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px;">
|x| = x إذا x ≥ 0 ، |x| = −x إذا x &lt; 0<br><br>
<strong>خصائص:</strong> |xy| = |x|·|y| ، |x+y| ≤ |x|+|y|<br>
<strong>المسافة:</strong> d(a,b) = |b−a|<br>
<strong>|x−a| &lt; r ⟺ a−r &lt; x &lt; a+r</strong>
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 حلّ: |x − 3| ≤ 2 ⟺ 3−2 ≤ x ≤ 3+2 ⟺ <strong>x ∈ [1, 5]</strong>
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">الترتيب والمجالات</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
• a &lt; b و c &gt; 0 ⟹ ac &lt; bc<br>
• a &lt; b و c &lt; 0 ⟹ ac &gt; bc (ينعكس الترتيب)
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> حلّ: |2x + 1| &gt; 3 ثم مثّل الحل على مستقيم الأعداد.
</div>

</div>' WHERE id = 'a6cead03-25ab-4df9-afb2-158e45b3f2bd';


-- 26. الحساب الجبري (TCS)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px;">التحكم في الحساب الجبري — جذع مشترك علوم</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 الهدف:</strong> النشر والتحليل المتقدم مع التركيز على كثيرات الحدود والتحليل بطرق متعددة.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">كثيرات الحدود</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
P(x) = aₙxⁿ + aₙ₋₁xⁿ⁻¹ + ... + a₁x + a₀<br>
• <strong>الدرجة:</strong> أكبر قوة لـ x ذات معامل غير صفري (deg P)<br>
• <strong>الجذر:</strong> قيمة x بحيث P(x) = 0<br>
• <strong>قسمة P على (x−a):</strong> P(x) = (x−a)Q(x) + P(a)
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 P(x) = x³ − 3x² + 2x ← P(0) = 0 ← x عامل<br>
P(x) = x(x² − 3x + 2) = <strong>x(x−1)(x−2)</strong>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> حلّل: P(x) = x³ − 6x² + 11x − 6 (تلميح: P(1)=0)
</div>

</div>' WHERE id = 'b3ec5c71-d53d-4dfb-852e-56ceb7d4a6dd';


-- 27. المعادلات والمتراجحات (TCS)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px;">المعادلات والمتراجحات — جذع مشترك علوم</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 الهدف:</strong> حل معادلات ومتراجحات من الدرجة الأولى والثانية مع القيمة المطلقة.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">معادلة الدرجة الثانية ax² + bx + c = 0</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px;">
<strong>المميز: Δ = b² − 4ac</strong><br>
• Δ &gt; 0: حلّان x₁ = (−b−√Δ)/(2a) و x₂ = (−b+√Δ)/(2a)<br>
• Δ = 0: حل مضاعف x₀ = −b/(2a)<br>
• Δ &lt; 0: لا حل في ℝ
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 حلّ: x² − 5x + 6 = 0 ← Δ = 25−24 = 1 &gt; 0<br>
x₁ = (5−1)/2 = 2 ، x₂ = (5+1)/2 = 3
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">معادلات بالقيمة المطلقة</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
|f(x)| = a (a ≥ 0) ⟺ f(x) = a أو f(x) = −a
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> حلّ: 2x² − 3x − 5 = 0 ثم حلّ: |x² − 4| = 5.
</div>

</div>' WHERE id = 'cc3b97e1-e106-406e-ac3d-dda1aeb6b112';


-- 28. الحاسبة العلمية (TCS)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px;">استخدام الحاسبة العلمية لإجراء حسابات — جذع مشترك علوم</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 الهدف:</strong> توظيف الحاسبة في حسابات متقدمة (قيمة مطلقة، قوى كبيرة، حسابات تقريبية).
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">تطبيقات متقدمة</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
• <strong>حل معادلة الدرجة الثانية:</strong> أحسب Δ = b² − 4ac ثم x₁ و x₂<br>
• <strong>الكتابة العلمية:</strong> 0.00035 = 3.5 × 10⁻⁴ (زر EXP أو ×10ⁿ)<br>
• <strong>التحقق من تخمينات:</strong> هل √(a+b) = √a + √b ؟ جرّب عدة قيم
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> باستعمال الحاسبة، حلّ: 3x² − 7x + 2 = 0 بحساب Δ ثم الجذرين.
</div>

</div>' WHERE id = '6275923a-687d-4f8c-b022-93d722e5e447';


-- 29. مفهوم الدالة (TCS)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px;">مفهوم الدالة — جذع مشترك علوم</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 الهدف:</strong> إتقان مفهوم الدالة، مجموعة التعريف، وعمليات التركيب على الدوال.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">تحديد مجموعات التعريف</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
• f(x) = P(x)/Q(x) ← Df = {x ∈ ℝ : Q(x) ≠ 0}<br>
• f(x) = √(g(x)) ← Df = {x ∈ ℝ : g(x) ≥ 0}<br>
• f(x) = √(g(x))/h(x) ← Df = {x ∈ ℝ : g(x) ≥ 0 و h(x) ≠ 0}
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 f(x) = √(x²−1)/(x−3) ← x²−1 ≥ 0 و x ≠ 3<br>
Df = ]−∞, −1] ∪ [1, +∞[ \ {3} = ]−∞,−1] ∪ [1,3[ ∪ ]3,+∞[
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">الزوجية والفردية</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px;">
• <strong>دالة زوجية:</strong> f(−x) = f(x) (منحنى متناظر بالنسبة لمحور الترتيب)<br>
• <strong>دالة فردية:</strong> f(−x) = −f(x) (منحنى متناظر بالنسبة للمبدأ)
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> ادرس زوجية/فردية: f(x) = x³ − x ، g(x) = x⁴ + 2x² − 1
</div>

</div>' WHERE id = 'c86206c7-f1b4-4e93-bfba-92749e06fac0';


-- 30. الدوال المرجعية (TCS)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px;">الدوال المرجعية — جذع مشترك علوم</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 الهدف:</strong> دراسة معمّقة للدوال المرجعية وتطبيقاتها في المقارنة والحل.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">ملخص الدوال المرجعية</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px;">
<table style="width: 100%; border-collapse: collapse;">
<tr style="background: #2c3e50; color: white;"><th style="border: 1px solid #bdc3c7; padding: 6px;">الدالة</th><th style="border: 1px solid #bdc3c7; padding: 6px;">Df</th><th style="border: 1px solid #bdc3c7; padding: 6px;">التغيرات</th><th style="border: 1px solid #bdc3c7; padding: 6px;">التناظر</th></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 6px;">x²</td><td style="border: 1px solid #bdc3c7; padding: 6px;">ℝ</td><td style="border: 1px solid #bdc3c7; padding: 6px;">↘ على ]−∞,0] ↗ على [0,+∞[</td><td style="border: 1px solid #bdc3c7; padding: 6px;">زوجية</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 6px;">x³</td><td style="border: 1px solid #bdc3c7; padding: 6px;">ℝ</td><td style="border: 1px solid #bdc3c7; padding: 6px;">↗ على ℝ</td><td style="border: 1px solid #bdc3c7; padding: 6px;">فردية</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 6px;">1/x</td><td style="border: 1px solid #bdc3c7; padding: 6px;">ℝ*</td><td style="border: 1px solid #bdc3c7; padding: 6px;">↘ على كل مجال</td><td style="border: 1px solid #bdc3c7; padding: 6px;">فردية</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 6px;">√x</td><td style="border: 1px solid #bdc3c7; padding: 6px;">[0,+∞[</td><td style="border: 1px solid #bdc3c7; padding: 6px;">↗</td><td style="border: 1px solid #bdc3c7; padding: 6px;">—</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 6px;">|x|</td><td style="border: 1px solid #bdc3c7; padding: 6px;">ℝ</td><td style="border: 1px solid #bdc3c7; padding: 6px;">↘ على ]−∞,0] ↗ على [0,+∞[</td><td style="border: 1px solid #bdc3c7; padding: 6px;">زوجية</td></tr>
</table>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> باستعمال التغيرات، قارن: √7 و √10 ، 1/3.2 و 1/3.5 ، (−3)² و (−2)²
</div>

</div>' WHERE id = '2be21208-7661-4411-ba6f-c237fa61a69f';


-- 31. جداول التغيرات (TCS)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px;">جداول التغيرات والمنحنيات — جذع مشترك علوم</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 الهدف:</strong> إنشاء جدول تغيرات من دراسة دالة وقراءة خصائص من المنحنى.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">إنشاء جدول التغيرات</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>الخطوات:</strong><br>
1. تحديد مجموعة التعريف<br>
2. دراسة إشارة f(x₂)−f(x₁) لتحديد التزايد والتناقص<br>
3. حساب القيم عند الحدود وعند نقاط تغيّر الاتجاه<br>
4. ملء الجدول: x في السطر العلوي، سهام التغير والقيم في السفلي
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 f(x) = −x² + 4x − 3 ← f(x) = −(x−2)² + 1<br>
الدالة متزايدة على ]−∞, 2] من −∞ إلى 1<br>
الدالة متناقصة على [2, +∞[ من 1 إلى −∞<br>
الأقصى: f(2) = 1
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> أنشئ جدول تغيرات f(x) = x² − 6x + 5 ثم حدد الحد الأدنى.
</div>

</div>' WHERE id = '72b2ef0d-2a8a-47bc-9471-7d0667ec574c';


-- 32. مشكلات الدوال (TCS)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px;">حل مشكلات الدوال — جذع مشترك علوم</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 الهدف:</strong> نمذجة وضعيات بدوال وحل معادلات ومتراجحات بيانياً وجبرياً.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">حل بياني لمعادلة f(x) = g(x)</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
فواصل نقاط تقاطع منحنيي f و g هي حلول f(x) = g(x).<br>
f(x) &gt; g(x) ← المنطقة التي يكون فيها منحنى f فوق منحنى g.
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مسألة:</strong> تكلفة إنتاج x وحدة: C(x) = 50 + 3x. سعر البيع: R(x) = 8x.<br>
الربح: P(x) = R(x)−C(x) = 5x − 50.<br>
نقطة التعادل: P(x)=0 ← x = 10 وحدات.<br>
ربح ≥ 0 ← <strong>x ≥ 10</strong>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> مقذوف ارتفاعه h(t) = −4.9t² + 19.6t. متى يكون فوق ارتفاع 15 م؟
</div>

</div>' WHERE id = '61ef36ff-1f68-4368-bb15-c5bd77c3a83c';


-- 33. الحساب الشعاعي (TCS)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px;">الحساب الشعاعي — جذع مشترك علوم</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 الهدف:</strong> إتقان الأشعة وعملياتها في المستوي مع تطبيقات على المعالم.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">التوليفة الخطية</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px;">
<strong>u⃗ و v⃗ متعامدان خطياً</strong> (colinéaires) ⟺ ∃k ∈ ℝ: u⃗ = kv⃗<br>
أي: x₁y₂ − x₂y₁ = 0<br><br>
إذا كان u⃗ و v⃗ غير متعامدين خطياً فهما يشكلان قاعدة للمستوي:<br>
أي شعاع w⃗ = αu⃗ + βv⃗
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">مركز ثقل مثلث</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px;">
مركز ثقل ABC: G((xₐ+x_b+x_c)/3, (yₐ+y_b+y_c)/3)<br>
GA⃗ + GB⃗ + GC⃗ = 0⃗
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> A(1,2)، B(5,4)، C(3,8). حدد مركز ثقل ABC. أثبت أن AG⃗ = (2/3)AM⃗ حيث M منتصف [BC].
</div>

</div>' WHERE id = 'f6a33a1e-658f-4795-8b20-640430875b8c';


-- 34. مسائل الحساب الشعاعي (TCS)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px;">حل مسائل هندسية بالحساب الشعاعي</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 الهدف:</strong> توظيف العلاقات الشعاعية في إثبات خصائص هندسية (استقامية، توازي، تعامد).
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">إثبات الاستقامية</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
A, B, C مستقيمة ⟺ AB⃗ و AC⃗ متعامدان خطياً ⟺ ∃k: AC⃗ = kAB⃗
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">إثبات التوازي والتعامد</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
(AB) // (CD) ⟺ AB⃗ و CD⃗ متعامدان خطياً<br>
(AB) ⊥ (CD) ⟺ AB⃗ · CD⃗ = 0 (الجداء السلمي = 0)
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 A(1,3)، B(4,5)، C(2,−1)، D(5,1)<br>
AB⃗(3,2) ، CD⃗(3,2) ← AB⃗ = CD⃗ ← (AB) // (CD) ✓
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> A(0,1)، B(2,5)، C(3,3). أثبت أن المثلث ABC قائم في C.
</div>

</div>' WHERE id = 'd44429ba-e4bf-4400-9755-4a5c5ddd2591';


-- 35. معادلات المستقيمات (TCS)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px;">معادلات المستقيمات — جذع مشترك علوم</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 الهدف:</strong> تحديد معادلة مستقيم وحل مسائل تتعلق بالمستقيمات تحليلياً.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">صيغ معادلة المستقيم</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px;">
1. <strong>المختصرة:</strong> y = ax + b<br>
2. <strong>العامة:</strong> ax + by + c = 0<br>
3. <strong>المعلمية:</strong> {x = x₀ + αt ، y = y₀ + βt (t ∈ ℝ)<br>
حيث (α, β) إحداثيات شعاع التوجيه.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">المسافة من نقطة إلى مستقيم</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px;">
المسافة من M(x₀, y₀) إلى (D): ax + by + c = 0<br>
<strong>d(M, D) = |ax₀ + by₀ + c|/√(a² + b²)</strong>
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 المسافة من A(1,2) إلى (D): 3x − 4y + 5 = 0<br>
d = |3(1) − 4(2) + 5|/√(9+16) = |3−8+5|/5 = <strong>0</strong> ← A تنتمي إلى (D)
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> المستقيمان (D₁): 2x−y+3=0 و (D₂): 4x−2y−1=0. هل هما متوازيان؟ أحسب المسافة بينهما.
</div>

</div>' WHERE id = '54246cf0-4dcf-40f4-a79e-bd8336ee4b41';


-- 36. قراءة معطيات (TCS)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px;">قراءة معطيات وتنظيمها — جذع مشترك علوم</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 الهدف:</strong> تنظيم سلاسل إحصائية في جداول وقراءة معطيات من مصادر متنوعة.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">أنواع المتغيرات الإحصائية</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
• <strong>متغير نوعي:</strong> اللون، الجنس، المادة المفضلة<br>
• <strong>متغير كمي منفصل:</strong> عدد الإخوة، عدد الكتب<br>
• <strong>متغير كمي مستمر:</strong> الطول، الوزن، العلامة (بفئات)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">جداول التواتر والتكرار المتراكم</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
• <strong>التواتر النسبي:</strong> fᵢ = nᵢ/N (نسبة مئوية)<br>
• <strong>التكرار المتراكم الصاعد:</strong> Nᵢ↑ = Σnⱼ (j ≤ i)<br>
• <strong>التكرار المتراكم النازل:</strong> Nᵢ↓ = N − Nᵢ↑ + nᵢ
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> في مسح لـ 40 أسرة عن عدد الأطفال: 0 طفل (5)، 1 طفل (12)، 2 (15)، 3 (6)، 4 (2). أنشئ جدول التواترات والتكرارات المتراكمة.
</div>

</div>' WHERE id = '1126a865-b8eb-4f8d-9b4f-c53dd65dc3ca';


-- 37. مخططات بيانية (TCS)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px;">المخططات البيانية — جذع مشترك علوم</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 الهدف:</strong> إنشاء وقراءة مخططات بيانية متنوعة لتمثيل سلاسل إحصائية.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">المدرج التكراري (Histogramme)</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
يُستعمل لمتغير كمي مستمر بفئات:<br>
• المحور الأفقي: حدود الفئات<br>
• المحور العمودي: التكرار أو الكثافة<br>
• <strong>إذا الفئات غير متساوية:</strong> الارتفاع = الكثافة = nᵢ/عرض الفئة
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">منحنى التكرار المتراكم</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
نمثل النقاط (حد أعلى للفئة, التكرار المتراكم الصاعد) ونصلها بخطوط مستقيمة.<br>
يسمح بتحديد الوسيط والربيعيات بيانياً.
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> أعمار 50 شخصاً: [10,20[ (8)، [20,30[ (15)، [30,40[ (12)، [40,50[ (10)، [50,60] (5). ارسم المدرج التكراري ومنحنى التكرار المتراكم.
</div>

</div>' WHERE id = '96972e22-1f91-4962-a7a7-de3d8e419a29';


-- 38. مؤشرات الموقع (TCS)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px;">مؤشرات الموقع والتشتت — جذع مشترك علوم</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 الهدف:</strong> حساب مؤشرات الموقع والتشتت لسلاسل إحصائية بفئات.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">المتوسط لسلسلة بفئات</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px;">
<strong>x̄ = Σ(cᵢ × nᵢ)/N</strong><br>
حيث cᵢ = مركز الفئة = (حد أدنى + حد أعلى)/2
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">الوسيط بيانياً</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
الوسيط هو الفاصلة المقابلة لـ N/2 على منحنى التكرار المتراكم.<br>
الربيع الأول Q₁ ← N/4 ، الربيع الثالث Q₃ ← 3N/4<br>
<strong>المدى بين الربيعيات: IQR = Q₃ − Q₁</strong>
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 [0,10[ (5)، [10,20[ (15)، [20,30[ (10). N=30<br>
المتوسط: (5×5 + 15×15 + 25×10)/30 = (25+225+250)/30 ≈ <strong>16.67</strong><br>
الوسيط: N/2=15 → الفئة الوسطية [10,20[ ← Me ≈ 10 + (15−5)/15 × 10 ≈ <strong>16.67</strong>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> أحسب المتوسط والوسيط للسلسلة: [0,4[ (3)، [4,8[ (7)، [8,12[ (10)، [12,16[ (8)، [16,20] (2).
</div>

</div>' WHERE id = '1788f32d-482d-4ee1-a71d-8400de89f394';
