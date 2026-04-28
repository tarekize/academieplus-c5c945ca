-- Populate missing hints for Terminale Sciences "Limites" chapter quizzes (Arabic hints)
UPDATE public.chapter_quizzes cq
SET hint = CASE
  WHEN cq.question ILIKE '%lim(x→+∞) 1/x%' OR cq.question ILIKE '%f(x) = 1/x%' THEN '💡 لكل $n>0$ : $\lim_{x \to +\infty} \frac{1}{x^n} = 0$.'
  WHEN cq.question ILIKE '%(2x+1)/(3x-2)%' THEN '💡 كسر كثيري حدود من نفس الدرجة عند $+\infty$ ⇒ النهاية تساوي نسبة المعاملين الرئيسيين $\frac{a}{c}$.'
  WHEN cq.question ILIKE '%eˣ/x%' OR cq.question ILIKE '%e^x%' THEN '💡 النموّ الأسي أقوى من النموّ كثير الحدود : $\lim_{x \to +\infty} \frac{e^x}{x^n} = +\infty$.'
  WHEN cq.question ILIKE '%(1-cos(x))/x²%' THEN '💡 نهاية مرجعية : $\lim_{x \to 0} \frac{1-\cos x}{x^2} = \frac{1}{2}$.'
  WHEN cq.question ILIKE '%sin(x)/x%' THEN '💡 نهاية مرجعية أساسية : $\lim_{x \to 0} \frac{\sin x}{x} = 1$.'
  WHEN cq.question ILIKE '%ln(x)%' THEN '💡 الدالة $\ln$ تؤول إلى $-\infty$ عند $0^+$ وإلى $+\infty$ عند $+\infty$.'
  WHEN cq.question ILIKE '%lim f = +∞ et lim g = -∞%' THEN '💡 احذر! $(+\infty) + (-\infty)$ شكل غير معيّن (FI) — يجب التحليل أكثر.'
  WHEN cq.question ILIKE '%asymptote oblique%' THEN '💡 المستقيم $y = ax+b$ مقارب مائل ⇔ $\lim_{x\to\pm\infty} [f(x) - (ax+b)] = 0$.'
  WHEN cq.question ILIKE '%forme indéterminée%' THEN '💡 الأشكال غير المعيّنة الأربعة : $\frac{0}{0}$, $\frac{\infty}{\infty}$, $0 \times \infty$, $\infty - \infty$.'
  WHEN cq.question ILIKE '%gendarmes%' THEN '💡 نظرية الحصر (الجاندارم) : إذا كان $g \le f \le h$ و $\lim g = \lim h = L$ فإن $\lim f = L$.'
  WHEN cq.question ILIKE '%x^2%' THEN '💡 الدوال كثيرات الحدود : النهاية في $\pm\infty$ هي نهاية الحد ذو الدرجة الأكبر.'
  WHEN cq.question ILIKE '%الأعداد الصحيحة الموجبة%' OR cq.question ILIKE '%الأعداد الصحيحة السالبة%' THEN '💡 المتتاليات $n$ و $-n$ تؤول إلى $\pm\infty$ بنفس إشارة الاتجاه.'
  ELSE '💡 راجع الخصائص الأساسية للنهايات وقواعد العمليات (الجمع، الجداء، القسمة).'
END
FROM public.chapters c
WHERE cq.chapter_id = c.id
  AND (c.title ILIKE '%limit%' OR c.title ILIKE '%النهاي%')
  AND cq.hint IS NULL;