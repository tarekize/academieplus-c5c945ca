-- =====================================================
-- MISE À JOUR DU CONTENU : Première Année Secondaire — Partie 1 (19 leçons)
-- =====================================================

-- 1. ممارسة الحساب في مختلف المجموعات العددية (TCL)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px;">ممارسة الحساب في مختلف المجموعات العددية</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 الهدف:</strong> التمكّن من العمليات الحسابية في ℕ و ℤ و ℚ و ℝ مع استعمال القوى والجذور.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">مجموعات الأعداد وعلاقاتها</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px;">
<strong>ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ</strong><br>
<strong>ℕ</strong>: الأعداد الطبيعية {0, 1, 2, ...}<br>
<strong>ℤ</strong>: الأعداد الصحيحة النسبية<br>
<strong>ℚ</strong>: الأعداد الناطقة (a/b حيث b ≠ 0)<br>
<strong>ℝ</strong>: الأعداد الحقيقية (ℚ ∪ الأعداد غير الناطقة مثل √2, π)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">خصائص القوى</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; text-align: center; font-size: 1.1em;">
aⁿ × aᵐ = aⁿ⁺ᵐ &nbsp;|&nbsp; aⁿ / aᵐ = aⁿ⁻ᵐ &nbsp;|&nbsp; (aⁿ)ᵐ = aⁿˣᵐ<br>
(ab)ⁿ = aⁿbⁿ &nbsp;|&nbsp; a⁻ⁿ = 1/aⁿ &nbsp;|&nbsp; a⁰ = 1 (a ≠ 0)
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> بسّط: 2³ × 2⁵ ÷ 2⁴ = 2³⁺⁵⁻⁴ = 2⁴ = <strong>16</strong>
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">المجالات</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
[a, b] مجال مغلق | ]a, b[ مجال مفتوح | [a, +∞[ | ]−∞, b]<br>
<strong>التقاطع:</strong> [1, 5] ∩ [3, 7] = [3, 5]<br>
<strong>الاتحاد:</strong> [1, 5] ∪ [3, 7] = [1, 7]
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> بسّط: (3⁻² × 3⁵)/(3²) ، أحسب: √(48) + √(75) − 2√(27)
</div>

</div>' WHERE id = '0ffbb699-84e7-4fdb-bee1-f9db341c86b4';


-- 2. التحكم في الحساب الجبري (TCL)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px;">التحكم في الحساب الجبري</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 الهدف:</strong> إتقان النشر والتحليل باستعمال المتطابقات الشهيرة، والتعامل مع الكسور الجبرية.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">المتطابقات الشهيرة (التوسّع)</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px; font-size: 1.1em;">
(a + b)² = a² + 2ab + b²<br>
(a − b)² = a² − 2ab + b²<br>
(a + b)(a − b) = a² − b²<br>
<strong>الدرجة الثالثة:</strong><br>
(a + b)³ = a³ + 3a²b + 3ab² + b³<br>
(a − b)³ = a³ − 3a²b + 3ab² − b³<br>
a³ − b³ = (a − b)(a² + ab + b²)<br>
a³ + b³ = (a + b)(a² − ab + b²)
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> حلّل x³ − 8 = x³ − 2³ = (x − 2)(x² + 2x + 4)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">الكسور الجبرية</h3>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 بسّط: (x² − 4)/(x² − 4x + 4) = (x−2)(x+2)/(x−2)² = <strong>(x+2)/(x−2)</strong> بشرط x ≠ 2
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> حلّل ثم بسّط: (x³ + 27)/(x² − 9) ، انشر: (2x − 1)³
</div>

</div>' WHERE id = '5fb40abd-f538-48bd-8f13-aa21b871546a';


-- 3. المعادلات والمتراجحات (TCL)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px;">المعادلات والمتراجحات وحلها</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 الهدف:</strong> ترجمة مسائل إلى معادلات ومتراجحات من الدرجة الأولى والثانية وحلها.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">معادلات الدرجة الأولى بمجهول واحد</h3>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 حلّ: 3(x − 2) + 5 = 2(x + 1) − 4<br>
3x − 6 + 5 = 2x + 2 − 4 → 3x − 1 = 2x − 2 → <strong>x = −1</strong>
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">معادلة الجداء المعدوم</h3>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 حلّ: (x² − 9)(2x + 5) = 0<br>
(x−3)(x+3)(2x+5) = 0 → <strong>x = 3 أو x = −3 أو x = −5/2</strong>
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">المتراجحات وجدول الإشارة</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
لحل متراجحة جداء أو حاصل قسمة، نستعمل جدول الإشارة:<br>
• نحدد جذور كل عامل (متى يتلاشى)<br>
• ندرس إشارة كل عامل في كل مجال<br>
• نحدد إشارة الجداء أو الحاصل
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 حلّ: (x − 1)(x + 3) ≥ 0<br>
الجذور: x = 1 و x = −3<br>
الإشارة: + على ]−∞, −3] ∪ [1, +∞[<br>
<strong>الحل: x ∈ ]−∞, −3] ∪ [1, +∞[</strong>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> حلّ: (2x − 4)(x + 1)/(x − 5) &lt; 0
</div>

</div>' WHERE id = '946642ea-d927-42ca-893c-89519661bcb3';


-- 4. استخدام الحاسبة العلمية (TCL)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px;">استخدام الحاسبة العلمية أو البيانية</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 الهدف:</strong> توظيف الحاسبة العلمية لإجراء حسابات رقمية دقيقة والتحقق من نتائج.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">وظائف الحاسبة العلمية</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
• <strong>الأزرار الأساسية:</strong> +, −, ×, ÷, =, (, )<br>
• <strong>القوى:</strong> xⁿ أو ^ أو x²<br>
• <strong>الجذور:</strong> √ أو ∛<br>
• <strong>الكسور:</strong> a b/c أو Frac<br>
• <strong>الذاكرة:</strong> M+, M−, MR, MC
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">أمثلة تطبيقية</h3>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 لحساب: √(3² + 4²) ← أدخل: √(3^2+4^2) = <strong>5</strong><br>
📝 لحساب: 2⁻³ ← أدخل: 2^(−3) = <strong>0.125</strong><br>
📝 التحقق: هل 3/7 + 2/5 = 29/35 ؟ ← أدخل: 3÷7+2÷5 ← Frac = 29/35 ✓
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> استعمل الحاسبة لإيجاد قيمة مقرّبة لـ: √(7 + √3) ، (1.05)¹⁰
</div>

</div>' WHERE id = 'a753c78f-5f4c-4dc5-bab1-351430ef1841';


-- 5. إدراك مفهوم الدالة (TCL)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px;">إدراك مفهوم الدالة بمختلف الصيغ</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 الهدف:</strong> التعرّف على مفهوم الدالة العددية، مجموعة التعريف، الصورة والنموذج الأصلي.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">تعريف الدالة</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px;">
<strong>الدالة العددية f</strong> هي قاعدة تُرفق بكل عدد x من مجموعة التعريف Df عدداً وحيداً f(x) يسمى <strong>صورة x بالدالة f</strong>.<br><br>
x يسمى <strong>النموذج الأصلي</strong> (antécédent) لـ f(x).
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">مجموعة التعريف Df</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
مجموعة جميع القيم x التي تكون فيها f(x) معرّفة.<br>
• f(x) = √(x−3) ← Df = [3, +∞[ (ما تحت الجذر ≥ 0)<br>
• f(x) = 1/(x−2) ← Df = ℝ \ {2} (المقام ≠ 0)<br>
• f(x) = √(x)/(x−1) ← Df = [0, +∞[ \ {1}
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">صيغ التعبير عن دالة</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
1. <strong>عبارة جبرية:</strong> f(x) = x² + 3x − 1<br>
2. <strong>جدول قيم:</strong> نعطي x والصورة f(x) المقابلة<br>
3. <strong>تمثيل بياني:</strong> منحنى f في مستوٍ منسوب (Cf)
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> حدد مجموعة تعريف: f(x) = (2x+1)/√(4−x²). ثم أحسب f(0) و f(1).
</div>

</div>' WHERE id = '4159f2e9-ae87-46c5-8d7a-ae1276476755';


-- 6. الدوال المرجعية (TCL)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px;">خواص الدوال المرجعية</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 الهدف:</strong> دراسة الدوال المرجعية (التآلفية، المربع، المقلوب، الجذر التربيعي) ومعرفة خواصها.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">الدالة التآلفية f(x) = ax + b</h3>
<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
Df = ℝ • تمثيلها مستقيم • متزايدة إذا a &gt; 0، متناقصة إذا a &lt; 0.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">الدالة المربع f(x) = x²</h3>
<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
Df = ℝ • تمثيلها قطع مكافئ رأسه O • متناقصة على ]−∞, 0] ومتزايدة على [0, +∞[ • زوجية: f(−x) = f(x)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">الدالة المقلوب f(x) = 1/x</h3>
<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
Df = ℝ* • تمثيلها قطع زائد • متناقصة قطعاً على كل من ]−∞, 0[ و ]0, +∞[ • فردية: f(−x) = −f(x)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">الدالة جذر تربيعي f(x) = √x</h3>
<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
Df = [0, +∞[ • متزايدة على مجال تعريفها • f(0) = 0 ، f(1) = 1 ، f(4) = 2
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> قارن بدون حاسبة: (√5)² و 5 ، 1/0.3 و 1/0.7 ، √9 و √16
</div>

</div>' WHERE id = 'c4856ca5-465e-447a-a036-90021f3efd50';


-- 7. جداول التغيرات والمنحنيات (TCL)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px;">قراءة جداول التغيرات والمنحنيات</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 الهدف:</strong> قراءة جدول التغيرات واستنتاج خصائص الدالة من المنحنى البياني.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">جدول التغيرات</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
جدول التغيرات يلخّص سلوك الدالة:<br>
• <strong>↗</strong> الدالة متزايدة (f(x) تزداد عندما x يزداد)<br>
• <strong>↘</strong> الدالة متناقصة<br>
• <strong>النهايات الحدية:</strong> القيم القصوى والدنيا
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">قراءة بيانية</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
من المنحنى نستخرج:<br>
• <strong>مجموعة التعريف:</strong> إسقاط المنحنى على محور الفواصل<br>
• <strong>الصورة:</strong> f(a) = ترتيبة النقطة ذات الفاصلة a<br>
• <strong>النموذج الأصلي:</strong> فواصل نقاط تقاطع المنحنى مع y = k<br>
• <strong>الإشارة:</strong> فوق محور الفواصل f(x) &gt; 0 ، تحته f(x) &lt; 0
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> من جدول تغيرات دالة: متزايدة على [−3, 1] من −5 إلى 4 ، متناقصة على [1, 5] من 4 إلى −2. حدد: أقصى قيمة، إشارة f على [−3, 5].
</div>

</div>' WHERE id = '40abb332-b333-4f1e-bb64-e9ef9dec2069';


-- 8. مشكلات الدوال (TCL)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px;">حل مشكلات تتعلق بالدوال</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 الهدف:</strong> ترجمة مسائل واقعية إلى دوال وحلها جبرياً وبيانياً.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">منهجية حل مسألة بالدوال</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
1. تحليل المسألة وتعيين المتغير x<br>
2. كتابة الدالة f(x) التي تنمذج الوضعية<br>
3. تحديد مجموعة التعريف (الشروط الفيزيائية)<br>
4. دراسة الدالة (تغيرات، قيم حدية)<br>
5. الإجابة عن السؤال المطروح
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مسألة:</strong> مستطيل محيطه 20 سم. عبّر عن مساحته S بدلالة طوله x ثم أوجد الأبعاد التي تجعل المساحة أكبر ما يمكن.<br><br>
العرض = (20−2x)/2 = 10−x ← S(x) = x(10−x) = 10x − x²<br>
Df = ]0, 10[ ← S''(x) = 10 − 2x = 0 ← x = 5<br>
<strong>المربع ذو الضلع 5 سم يعطي أكبر مساحة = 25 سم²</strong>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> كرة قُذفت عمودياً. ارتفاعها: h(t) = −5t² + 20t + 1. أوجد أقصى ارتفاع واللحظة التي تصل فيها.
</div>

</div>' WHERE id = 'cd4b7062-54df-4c81-8fc4-dbcd631ef0d5';


-- 9. توظيف الحاسبة البيانية لمنحنى دالة (TCL)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px;">توظيف الحاسبة البيانية لرسم منحنى دالة</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 الهدف:</strong> استعمال الحاسبة البيانية أو برمجية GeoGebra لرسم منحنيات دوال واستنتاج خصائصها.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">خطوات الرسم على الحاسبة</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
1. أدخل عبارة الدالة في Y= : مثلاً Y1 = X² − 3X + 2<br>
2. اضبط النافذة (WINDOW): Xmin, Xmax, Ymin, Ymax<br>
3. اضغط GRAPH لعرض المنحنى<br>
4. استعمل TRACE للتنقل على المنحنى<br>
5. استعمل ZERO لإيجاد الجذور، MAXIMUM/MINIMUM للنقاط الحدية
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">استعمال GeoGebra</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
• في شريط الإدخال: f(x) = x^2 - 3x + 2<br>
• لإيجاد الجذور: Racine(f) أو Root(f)<br>
• لإيجاد نقطة حدية: Extremum(f)
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> مثّل بيانياً الدالتين f(x) = x² − 4 و g(x) = 2x − 1 ثم حدد نقاط تقاطعهما.
</div>

</div>' WHERE id = '61cacc0e-2a74-4002-8206-3b31749151bd';


-- 10. الحساب الشعاعي في الهندسة التحليلية (TCL)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px;">الحساب الشعاعي في الهندسة التحليلية</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 الهدف:</strong> استعمال الأشعة وإحداثياتها في المستوي المنسوب لحل مسائل هندسية.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">إحداثيات شعاع</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px;">
في معلم (O, i⃗, j⃗): إذا A(xₐ, yₐ) و B(x_b, y_b) فإن:<br>
<strong>AB⃗(x_b − xₐ , y_b − yₐ)</strong><br><br>
u⃗ + v⃗ = (x₁+x₂, y₁+y₂) ، ku⃗ = (kx₁, ky₁)<br>
||u⃗|| = √(x₁² + y₁²)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">المنتصف والمستقيم</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px;">
منتصف [AB]: I((xₐ+x_b)/2, (yₐ+y_b)/2)<br>
المسافة: AB = √((x_b−xₐ)² + (y_b−yₐ)²)<br>
التوازي: AB⃗ // CD⃗ ⟺ x₁y₂ − x₂y₁ = 0
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 A(1,3)، B(5,7). منتصف [AB]: I(3,5) ، AB = √(16+16) = 4√2
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> A(−1,2)، B(3,4)، C(1,−2). أثبت أن ABC مثلث متساوي الساقين. حدد إحداثيات D ليكون ABCD متوازي أضلاع.
</div>

</div>' WHERE id = '563a3279-a45d-495e-a97c-828149814191';


-- 11. معادلات المستقيمات (TCL)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px;">معادلات المستقيمات في المستوى</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 الهدف:</strong> تحديد معادلة مستقيم بصيغ مختلفة ودراسة الأوضاع النسبية لمستقيمين.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">المعادلة المختصرة</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px;">
<strong>y = ax + b</strong> حيث a الميل و b الترتيب عند المبدأ<br>
a = (y_b − yₐ)/(x_b − xₐ)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">المعادلة العامة</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px;">
<strong>ax + by + c = 0</strong><br>
• شعاع توجيه: u⃗(−b, a) ، شعاع ناظمي: n⃗(a, b)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">الأوضاع النسبية</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
(D₁): a₁x + b₁y + c₁ = 0 و (D₂): a₂x + b₂y + c₂ = 0<br>
• <strong>متوازيان:</strong> a₁b₂ − a₂b₁ = 0<br>
• <strong>متقاطعان:</strong> a₁b₂ − a₂b₁ ≠ 0<br>
• <strong>متعامدان:</strong> a₁a₂ + b₁b₂ = 0
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> أوجد معادلة المستقيم المار من A(2,3) والعمودي على (D): 3x − y + 1 = 0.
</div>

</div>' WHERE id = 'eeb1b3a0-42ad-444e-8be0-cf18051cff30';


-- 12. قراءة معطيات وتنظيمها (TCL)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px;">قراءة معطيات وتنظيمها</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 الهدف:</strong> قراءة بيانات من جداول ومخططات مختلفة وتنظيمها لاستخراج معلومات إحصائية.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">السلسلة الإحصائية</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>المفردات:</strong><br>
• <strong>المجتمع:</strong> مجموعة الأفراد المعنيين بالدراسة<br>
• <strong>الميزة (المتغير):</strong> الخاصية المدروسة (كمية أو نوعية)<br>
• <strong>التكرار:</strong> عدد مرات ظهور قيمة nᵢ<br>
• <strong>التواتر:</strong> fᵢ = nᵢ/N (النسبة من المجموع)
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">التكرارات المتراكمة</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>التكرار المتراكم الصاعد:</strong> Nᵢ = n₁ + n₂ + ... + nᵢ<br>
<strong>التواتر المتراكم:</strong> Fᵢ = Nᵢ/N
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> في قسم من 30 تلميذاً: 5 حصلوا على 8، و10 على 12، و8 على 14، و7 على 16. أنشئ جدول التكرارات والتواترات والتكرارات المتراكمة.
</div>

</div>' WHERE id = '5bfa9350-cb7c-49fe-87d2-1719a5e9bd4b';


-- 13. عرض نتائج بمخططات بيانية (TCL)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px;">عرض نتائج على شكل مخططات بيانية</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 الهدف:</strong> تمثيل سلاسل إحصائية بمخططات مناسبة (أعمدة، دائرية، مبيان بالخطوط).
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">أنواع التمثيلات</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
• <strong>المخطط بالأعمدة:</strong> لمتغير كمي منفصل — ارتفاع العمود يمثل التكرار<br>
• <strong>المخطط الدائري:</strong> لمتغير نوعي — الزاوية = التواتر × 360°<br>
• <strong>المدرج التكراري (histogramme):</strong> لمتغير كمي مستمر (فئات)<br>
• <strong>المضلع التكراري:</strong> نصل بين مراكز رؤوس الأعمدة
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> تواتر القيمة = 25% ← الزاوية في المخطط الدائري = 0.25 × 360° = <strong>90°</strong>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> أنشئ مدرج تكراري للفئات: [0,5[ تكراره 4 ، [5,10[ تكراره 8 ، [10,15[ تكراره 12 ، [15,20] تكراره 6.
</div>

</div>' WHERE id = '0d39085b-fd1d-458d-9688-93452af42355';


-- 14. مؤشرات الموقع والتشتت (TCL)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px;">مؤشرات الموقع والتشتت</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 الهدف:</strong> حساب مؤشرات الموقع (المتوسط، الوسيط، المنوال) ومؤشر التشتت (المدى).
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">مؤشرات الموقع</h3>

<div style="background: #f4ecf7; border: 2px solid #8e44ad; padding: 15px; margin: 15px 0; border-radius: 8px;">
<strong>المتوسط الحسابي:</strong> x̄ = Σ(xᵢ × nᵢ)/N<br>
<strong>الوسيط (Me):</strong> القيمة التي تقسم السلسلة المرتبة إلى نصفين متساويين<br>
<strong>المنوال (Mo):</strong> القيمة الأكثر تكراراً<br>
<strong>المدى (e):</strong> أكبر قيمة − أصغر قيمة
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> السلسلة: 3, 5, 5, 7, 8, 9, 12<br>
x̄ = 49/7 = 7 ، Me = 7 (القيمة الوسطى) ، Mo = 5 ، e = 12−3 = 9
</div>

<div style="background: #fdedec; border-right: 4px solid #e74c3c; padding: 15px; margin: 15px 0; border-radius: 6px;">
⚠️ إذا كان N زوجياً: Me = (القيمة N/2 + القيمة N/2+1)/2
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> علامات 12 تلميذاً: 8, 10, 12, 10, 14, 16, 10, 12, 18, 8, 14, 12. أحسب: المتوسط، الوسيط، المنوال، المدى.
</div>

</div>' WHERE id = 'afb5a4b8-3bc3-4be7-83d0-82cd82a4f32b';


-- 15. الحاسبة لمؤشرات إحصائية (TCL)
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px;">توظيف الحاسبة لحساب مؤشرات إحصائية</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 الهدف:</strong> استعمال الحاسبة العلمية أو البيانية لحساب المتوسط والانحراف المعياري.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">خطوات الإدخال على الحاسبة</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>الحاسبة العلمية (Casio fx-991):</strong><br>
1. MODE → STAT → 1-VAR<br>
2. أدخل القيم: قيمة = ثم FREQ إذا مطلوب<br>
3. AC ثم SHIFT + 1 → Var<br>
4. x̄ للمتوسط ، σn للانحراف المعياري
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 <strong>مثال:</strong> البيانات: 10, 12, 15, 18 بتكرارات: 3, 5, 7, 5<br>
على الحاسبة: أدخل (10,3), (12,5), (15,7), (18,5)<br>
النتيجة: x̄ ≈ 14.05 ، σ ≈ 2.65
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> استعمل الحاسبة لتحقق من: أن المتوسط الحسابي للسلسلة 5, 8, 12, 15, 20 يساوي 12.
</div>

</div>' WHERE id = 'a5f6df1b-e850-4101-aa92-33eb7404da75';


-- 16. الحاسبة لبناء تعلّمات
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px;">استخدام الحاسبة العلمية لبناء تعلّمات</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 الهدف:</strong> توظيف الحاسبة كأداة لاكتشاف الخصائص الرياضية والتحقق من التخمينات.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">أنشطة استكشافية</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>نشاط 1 — اكتشاف القوى:</strong><br>
أحسب: 2¹, 2², 2³, ..., 2¹⁰. ماذا تلاحظ عن تطور القيم؟<br><br>
<strong>نشاط 2 — التخمين:</strong><br>
باستعمال الحاسبة، هل العبارة √(a²+b²) = a+b صحيحة؟ جرّب مع a=3, b=4.
</div>

<div style="background: #fdf2e9; border-right: 4px solid #e67e22; padding: 15px; margin: 15px 0; border-radius: 6px;">
📝 √(9+16) = √25 = 5 لكن 3+4 = 7 → <strong>العبارة خاطئة!</strong>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> باستعمال الحاسبة، خمّن قيمة 1+3+5+7+...+99 (مجموع الأعداد الفردية 50 الأولى).
</div>

</div>' WHERE id = '29685a6b-ac27-48e7-9f1b-a6816007d69b';


-- 17. البرمجيات والحاسبة للتجريب
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px;">استخدام البرمجيات والحاسبة للتجريب والتخمين</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 الهدف:</strong> استعمال أدوات رقمية (GeoGebra, Python, Excel) لتجريب خصائص رياضية وصياغة تخمينات.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">GeoGebra للهندسة</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
• إنشاء أشكال هندسية ديناميكية<br>
• تحريك النقاط وملاحظة الخصائص الثابتة<br>
• قياس الزوايا والأطوال والمساحات
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">Excel/Calc لجداول الحساب</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
• إنشاء جداول قيم لدوال<br>
• رسم مخططات بيانية تلقائياً<br>
• استعمال الصيغ: =AVERAGE(), =STDEV(), =MAX(), =MIN()
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> على GeoGebra أنشئ مثلثاً ومنصفاته الثلاثة. ماذا تلاحظ؟ ثم حرّك رؤوس المثلث. هل الملاحظة تبقى صحيحة؟
</div>

</div>' WHERE id = '9e421009-363d-4459-9cfb-93bba70beea2';


-- 18. البرمجيات لمنحنى دالة
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px;">توظيف البرمجيات لرسم منحنيات الدوال</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 الهدف:</strong> استعمال GeoGebra و Desmos لرسم منحنيات دوال واستخراج خصائصها.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">GeoGebra — رسم منحنيات</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
1. في شريط الإدخال: f(x) = x^2 - 4x + 3<br>
2. لإيجاد جذور: Root(f) ← يعطي النقاط x = 1 و x = 3<br>
3. لإيجاد الحد الأدنى: Extremum(f) ← يعطي (2, −1)<br>
4. لرسم دالة ثانية: g(x) = 2x - 1 ثم Intersect(f,g) لنقاط التقاطع
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">Desmos — أداة سهلة عبر الإنترنت</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
• اذهب إلى desmos.com/calculator<br>
• اكتب العبارة مباشرة في الجانب<br>
• أضف منزلقاً (slider) لتغيير معامل وملاحظة تأثيره
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> باستعمال GeoGebra، ارسم f(x) = x² و g(x) = 2x + 3 ثم حدد نقاط تقاطعهما.
</div>

</div>' WHERE id = 'ce5a7877-9404-4781-84d2-0f867a90de3a';


-- 19. البرمجيات لمؤشرات الموقع
UPDATE lessons SET content = '<div dir="rtl" style="font-family: ''Tajawal'', Arial, sans-serif; line-height: 1.8; padding: 20px;">

<h2 style="color: #2980b9; font-size: 1.8em; border-bottom: 3px solid #2980b9; padding-bottom: 8px;">توظيف البرمجيات لحساب مؤشرات الموقع</h2>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<strong>📘 الهدف:</strong> استعمال جداول الحساب (Excel/Calc) لحساب المؤشرات الإحصائية وإنشاء مخططات.
</div>

<h3 style="color: #e67e22; background: #fef9e7; padding: 8px 15px; border-right: 4px solid #e67e22; border-radius: 4px;">الصيغ في Excel/Calc</h3>

<div style="background: #eaf2f8; border-right: 4px solid #2980b9; padding: 15px; margin: 15px 0; border-radius: 6px;">
<table style="width: 100%; border-collapse: collapse;">
<tr style="background: #2c3e50; color: white;"><th style="border: 1px solid #bdc3c7; padding: 8px;">المؤشر</th><th style="border: 1px solid #bdc3c7; padding: 8px;">الصيغة</th></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 8px;">المتوسط</td><td style="border: 1px solid #bdc3c7; padding: 8px;">=AVERAGE(A1:A20)</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 8px;">الوسيط</td><td style="border: 1px solid #bdc3c7; padding: 8px;">=MEDIAN(A1:A20)</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 8px;">المنوال</td><td style="border: 1px solid #bdc3c7; padding: 8px;">=MODE(A1:A20)</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 8px;">الانحراف المعياري</td><td style="border: 1px solid #bdc3c7; padding: 8px;">=STDEV(A1:A20)</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 8px;">أكبر قيمة</td><td style="border: 1px solid #bdc3c7; padding: 8px;">=MAX(A1:A20)</td></tr>
<tr><td style="border: 1px solid #bdc3c7; padding: 8px;">أصغر قيمة</td><td style="border: 1px solid #bdc3c7; padding: 8px;">=MIN(A1:A20)</td></tr>
</table>
</div>

<div style="background: #e8f8f5; border-right: 4px solid #1abc9c; padding: 15px; margin: 15px 0; border-radius: 6px;">
✏️ <strong>تمرين:</strong> أدخل في جدول الحساب علامات 20 تلميذاً وأحسب المتوسط والوسيط وأنشئ مخطط أعمدة.
</div>

</div>' WHERE id = 'ccf6eb40-ce67-4351-9589-5b0c053d8b05';
