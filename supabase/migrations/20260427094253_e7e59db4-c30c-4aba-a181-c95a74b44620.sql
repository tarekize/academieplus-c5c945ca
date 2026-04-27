-- EXERCICES
UPDATE public.chapter_exercises SET hint = E'💡 لاحظ أن البسط $x^2 - 9$ يمكن تحليله على شكل فرق مربعين: $(x-3)(x+3)$. هذا سيسمح بتبسيط الكسر وإزالة عدم التعيين $\\frac{0}{0}$.',
solution = E'## 🎯 الحل المفصل\n\n### 📌 الخطوة 1: تحديد عدم التعيين\n$$\\lim_{x \\to 3} \\frac{x^2 - 9}{x - 3} = \\frac{0}{0} \\text{ (شكل غير معين)}$$\n\n### 📌 الخطوة 2: تحليل البسط (فرق مربعين)\n$$x^2 - 9 = (x-3)(x+3)$$\n\n### 📌 الخطوة 3: التبسيط\n$$\\frac{(x-3)(x+3)}{x-3} = x+3 \\quad (x \\neq 3)$$\n\n### 📌 الخطوة 4: حساب النهاية\n$$\\lim_{x \\to 3} (x+3) = 6$$\n\n### ✅ النتيجة\n$$\\boxed{\\lim_{x \\to 3} \\frac{x^2 - 9}{x - 3} = 6}$$'
WHERE chapter_id='d02d077f-7507-4117-924e-6387790a010b' AND statement = 'Calculer lim(x→3) (x² - 9)/(x - 3).';

UPDATE public.chapter_exercises SET hint = E'💡 عند $x \\to +\\infty$ في كسر متعدد الحدود، اقسم البسط والمقام على أعلى قوة لـ $x$ في المقام، أي $x^3$.',
solution = E'## 🎯 الحل المفصل\n\n### 📌 الخطوة 1: الشكل\n$$\\lim_{x \\to +\\infty} \\frac{2x^3 - x}{x^3 + 1} = \\frac{\\infty}{\\infty}$$\n\n### 📌 الخطوة 2: القسمة على $x^3$\n$$\\frac{2x^3 - x}{x^3 + 1} = \\frac{2 - \\frac{1}{x^2}}{1 + \\frac{1}{x^3}}$$\n\n### 📌 الخطوة 3: حساب النهايات الجزئية\n$\\lim \\frac{1}{x^2} = 0$ و $\\lim \\frac{1}{x^3} = 0$.\n\n### 📌 الخطوة 4: استنتاج\n$$\\lim_{x \\to +\\infty} \\frac{2-0}{1+0} = 2$$\n\n### ✅ النتيجة\n$$\\boxed{= 2}$$\n\n📝 **قاعدة:** نسبة معاملي الحدود ذات الدرجة الأعلى عندما الدرجتان متساويتان.'
WHERE chapter_id='d02d077f-7507-4117-924e-6387790a010b' AND statement = 'Calculer lim(x→+∞) (2x³ - x)/(x³ + 1).';

UPDATE public.chapter_exercises SET hint = E'💡 شكل $\\frac{0}{0}$. حلّل $x^2-1$ كفرق مربعين و $x^3-1$ بـ $(x-1)(x^2+x+1)$.',
solution = E'## 🎯 الحل المفصل\n\n### 📌 الخطوة 1: تحديد الشكل\nبالتعويض: $\\frac{0}{0}$ (غير معين).\n\n### 📌 الخطوة 2: تحليل\n- $x^2 - 1 = (x-1)(x+1)$\n- $x^3 - 1 = (x-1)(x^2 + x + 1)$\n\n### 📌 الخطوة 3: التبسيط\n$$\\frac{x^2-1}{x^3-1} = \\frac{x+1}{x^2+x+1}$$\n\n### 📌 الخطوة 4: حساب النهاية\n$$\\lim_{x \\to 1} \\frac{x+1}{x^2+x+1} = \\frac{2}{3}$$\n\n### ✅ النتيجة\n$$\\boxed{\\frac{2}{3}}$$'
WHERE chapter_id='d02d077f-7507-4117-924e-6387790a010b' AND statement = 'Calculer lim(x→1) (x² - 1)/(x³ - 1).';

UPDATE public.chapter_exercises SET hint = E'💡 احسب $\\lim_{x \\to 2} \\frac{x^2-4}{x-2}$ بتحليل البسط، ثم قارن النتيجة مع $f(2)=4$.',
solution = E'## 🎯 الحل المفصل\n\n### 📌 الخطوة 1: حساب النهاية\nلكل $x \\neq 2$:\n$$f(x) = \\frac{(x-2)(x+2)}{x-2} = x+2$$\n$$\\lim_{x \\to 2} f(x) = 4$$\n\n### 📌 الخطوة 2: مقارنة مع $f(2)$\n$f(2) = 4$ (معطى).\n\n### 📌 الخطوة 3: شرط الاستمرارية\n$$\\lim_{x \\to 2} f(x) = f(2) = 4 \\checkmark$$\n\n### ✅ النتيجة\n$$\\boxed{f \\text{ مستمرة عند } x=2}$$'
WHERE chapter_id='d02d077f-7507-4117-924e-6387790a010b' AND statement = 'Étudier la continuité de f(x) = (x²-4)/(x-2) si x≠2, f(2)=4.';

UPDATE public.chapter_exercises SET hint = E'💡 شكل $\\infty - \\infty$. اضرب واقسم بالعبارة المرافقة $\\sqrt{x^2+1}+x$.',
solution = E'## 🎯 الحل المفصل\n\n### 📌 الخطوة 1: الشكل غير معين\n$\\sqrt{x^2+1} - x \\to \\infty - \\infty$.\n\n### 📌 الخطوة 2: المرافق\n$$\\sqrt{x^2+1} - x = \\frac{(x^2+1) - x^2}{\\sqrt{x^2+1}+x} = \\frac{1}{\\sqrt{x^2+1}+x}$$\n\n### 📌 الخطوة 3: النهاية\n$$\\lim_{x \\to +\\infty} \\frac{1}{\\sqrt{x^2+1}+x} = 0$$\n\n### ✅ النتيجة\n$$\\boxed{= 0}$$'
WHERE chapter_id='d02d077f-7507-4117-924e-6387790a010b' AND statement = 'Calculer lim(x→+∞) (√(x²+1) - x).';

UPDATE public.chapter_exercises SET hint = E'💡 استعمل النهاية المرجعية $\\lim_{u \\to 0} \\frac{\\sin u}{u}=1$ مع $\\frac{\\sin(3x)}{x} = 3 \\cdot \\frac{\\sin(3x)}{3x}$.',
solution = E'## 🎯 الحل المفصل\n\n### 📌 الخطوة 1: المشكل\n$f(x) = \\frac{\\sin(3x)}{x}$ غير معرفة عند $x=0$.\n\n### 📌 الخطوة 2: التحويل\n$$\\frac{\\sin(3x)}{x} = 3 \\cdot \\frac{\\sin(3x)}{3x}$$\n\n### 📌 الخطوة 3: النهاية المرجعية\nبوضع $u = 3x$: $\\lim_{u \\to 0} \\frac{\\sin u}{u} = 1$.\n$$\\lim_{x \\to 0} \\frac{\\sin(3x)}{x} = 3$$\n\n### 📌 الخطوة 4: التمديد\n$$\\tilde{f}(x) = \\begin{cases} \\frac{\\sin(3x)}{x} & x \\neq 0 \\\\ 3 & x=0 \\end{cases}$$\n\n### ✅ النتيجة\n$$\\boxed{\\tilde{f}(0) = 3}$$'
WHERE chapter_id='d02d077f-7507-4117-924e-6387790a010b' AND statement = 'Prolonger f(x) = sin(3x)/x par continuité en 0.';

UPDATE public.chapter_exercises SET hint = E'💡 $\\tan x = \\frac{\\sin x}{\\cos x}$ ثم $\\frac{\\tan x}{x} = \\frac{\\sin x}{x} \\cdot \\frac{1}{\\cos x}$.',
solution = E'## 🎯 الحل المفصل\n\n### 📌 الخطوة 1: التحويل\n$$\\frac{\\tan x}{x} = \\frac{\\sin x}{x} \\cdot \\frac{1}{\\cos x}$$\n\n### 📌 الخطوة 2: النهايات الجزئية\n- $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$\n- $\\lim_{x \\to 0} \\frac{1}{\\cos x} = 1$\n\n### 📌 الخطوة 3: الجداء\n$$\\lim_{x \\to 0} \\frac{\\tan x}{x} = 1 \\times 1 = 1$$\n\n### ✅ النتيجة\n$$\\boxed{= 1}$$'
WHERE chapter_id='d02d077f-7507-4117-924e-6387790a010b' AND statement = 'Calculer lim(x→0) tan(x)/x.';

UPDATE public.chapter_exercises SET hint = E'💡 طبّق مبرهنة القيم المتوسطة (TVI): استمرار $f$ على $[1,2]$ + $f(1)f(2)<0$.',
solution = E'## 🎯 الحل المفصل\n\nنعتبر $f(x) = x^3 - x - 1$.\n\n### 📌 الخطوة 1: الاستمرارية\n$f$ كثير حدود ⇒ مستمرة على $[1,2]$.\n\n### 📌 الخطوة 2: القيم على الأطراف\n- $f(1) = -1 < 0$\n- $f(2) = 5 > 0$\n\n### 📌 الخطوة 3: مبرهنة القيم المتوسطة\nبما أن $f$ مستمرة و $f(1) \\cdot f(2) < 0$:\n$$\\exists\\, c \\in ]1,2[ : f(c) = 0$$\n\n### ✅ النتيجة\n$$\\boxed{x^3 - x - 1 = 0 \\text{ تقبل حلاً في } ]1,2[}$$'
WHERE chapter_id='d02d077f-7507-4117-924e-6387790a010b' AND statement = 'Montrer que x³ - x - 1 = 0 a une solution dans [1,2].';

UPDATE public.chapter_exercises SET hint = E'💡 ضع $g(x) = f(x)-1$. لاحظ أن $g(0)=0$.',
solution = E'## 🎯 الحل المفصل\n\nنضع $g(x) = e^x - 2x - 1$.\n\n### 📌 الخطوة 1: الاستمرارية\n$g$ مستمرة على $[0,1]$.\n\n### 📌 الخطوة 2: القيم\n- $g(0) = 1 - 0 - 1 = 0$\n- $g(1) = e - 3 \\approx -0.282 < 0$\n\n### 📌 الخطوة 3: ملاحظة\n$g(0)=0 \\Leftrightarrow f(0)=1$. إذن $x=0$ حل.\n\n### ✅ النتيجة\n$$\\boxed{x = 0 \\text{ حل للمعادلة } f(x)=1}$$'
WHERE chapter_id='d02d077f-7507-4117-924e-6387790a010b' AND statement = 'f(x) = eˣ - 2x sur [0,1]. Montrer que f(x)=1 a une solution.';

UPDATE public.chapter_exercises SET hint = E'💡 استعمل تعريف الاستمرارية المنتظمة بالنفي مع متتاليتين $x_n=1/n$ و $y_n=1/(n+1)$.',
solution = E'## 🎯 الحل المفصل\n\n### 📌 الخطوة 1: التذكير\nالاستمرارية المنتظمة:\n$$\\forall \\varepsilon, \\exists \\delta, \\forall x,y: |x-y|<\\delta \\Rightarrow |f(x)-f(y)|<\\varepsilon$$\n\n### 📌 الخطوة 2: متتاليتان مضادتان\n$$x_n = \\frac{1}{n}, \\quad y_n = \\frac{1}{n+1}$$\n\n### 📌 الخطوة 3: $|x_n-y_n| \\to 0$\n$$|x_n-y_n| = \\frac{1}{n(n+1)} \\to 0$$\n\n### 📌 الخطوة 4: $|f(x_n)-f(y_n)|$ لا يقترب من 0\n$$|f(x_n)-f(y_n)| = |n-(n+1)| = 1$$\n\n### ✅ النتيجة\n$$\\boxed{f(x)=1/x \\text{ ليست مستمرة بانتظام على } ]0,1]}$$'
WHERE chapter_id='d02d077f-7507-4117-924e-6387790a010b' AND statement = 'Montrer que f(x) = 1/x n''est pas uniformément continue sur ]0,1].';

-- QUIZZES
UPDATE public.chapter_quizzes SET hint = E'💡 لكل $n>0$: $\\lim_{x \\to +\\infty} \\frac{1}{x^n} = 0$.',
explanation = COALESCE(NULLIF(explanation,''), E'$\\lim_{x \\to +\\infty} \\frac{1}{x} = 0$.')
WHERE chapter_id='d02d077f-7507-4117-924e-6387790a010b' AND question = 'lim(x→+∞) 1/x = ?';

UPDATE public.chapter_quizzes SET hint = E'💡 شكل $\\frac{\\infty}{\\infty}$. اقسم البسط والمقام على $x$.',
explanation = E'$\\lim \\frac{2+1/x}{3-2/x} = \\frac{2}{3}$'
WHERE chapter_id='d02d077f-7507-4117-924e-6387790a010b' AND question = 'lim(x→+∞) (2x+1)/(3x-2) = ?';

UPDATE public.chapter_quizzes SET hint = E'💡 نهاية مرجعية أساسية يجب حفظها.',
explanation = E'$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$ — نهاية مرجعية.'
WHERE chapter_id='d02d077f-7507-4117-924e-6387790a010b' AND question = 'lim(x→0) sin(x)/x = ?';

UPDATE public.chapter_quizzes SET hint = E'💡 استعمل $1-\\cos x = \\frac{\\sin^2 x}{1+\\cos x}$.',
explanation = E'$\\frac{1-\\cos x}{x^2} \\to \\frac{1}{2}$'
WHERE chapter_id='d02d077f-7507-4117-924e-6387790a010b' AND question = 'lim(x→0) (1-cos(x))/x² = ?';

UPDATE public.chapter_quizzes SET hint = E'💡 الأسي يتغلب على كثيرات الحدود في $+\\infty$.',
explanation = E'النمو المقارن: $\\lim_{x \\to +\\infty} \\frac{e^x}{x} = +\\infty$.'
WHERE chapter_id='d02d077f-7507-4117-924e-6387790a010b' AND question = 'lim(x→+∞) eˣ/x = ?';

UPDATE public.chapter_quizzes SET hint = E'💡 $\\ln$ غير معرف على 0 ولكن نهايته من اليمين قيمة لانهائية.',
explanation = E'$\\lim_{x \\to 0^+} \\ln(x) = -\\infty$.'
WHERE chapter_id='d02d077f-7507-4117-924e-6387790a010b' AND question = 'lim(x→0⁺) ln(x) = ?';

UPDATE public.chapter_quizzes SET hint = E'💡 الأشكال غير المعينة: $\\frac{0}{0}, \\frac{\\infty}{\\infty}, 0\\times\\infty, \\infty-\\infty$.',
explanation = E'عملية على نهايات لا يمكن استنتاج نتيجتها مباشرة وتتطلب تحويلاً.'
WHERE chapter_id='d02d077f-7507-4117-924e-6387790a010b' AND question = 'Une forme indéterminée est :';

UPDATE public.chapter_quizzes SET hint = E'💡 $+\\infty-\\infty$ شكل غير معين.',
explanation = E'$\\lim(f+g)$ شكل غير معين، يجب الدراسة حالة بحالة.'
WHERE chapter_id='d02d077f-7507-4117-924e-6387790a010b' AND question = 'Si lim f = +∞ et lim g = -∞, alors lim(f+g) :';

UPDATE public.chapter_quizzes SET hint = E'💡 المقارب المائل يقتضي $\\lim[f(x)-(ax+b)]=0$.',
explanation = E'$y=ax+b$ مقارب مائل في $\\pm\\infty$ إذا $\\lim[f(x)-(ax+b)]=0$.'
WHERE chapter_id='d02d077f-7507-4117-924e-6387790a010b' AND question = 'Une asymptote oblique y=ax+b existe si :';

UPDATE public.chapter_quizzes SET hint = E'💡 مبرهنة الحصر: محصورة بين دالتين لهما نفس النهاية.',
explanation = E'إذا $g \\leq f \\leq h$ و $\\lim g = \\lim h = L$، فإن $\\lim f = L$.'
WHERE chapter_id='d02d077f-7507-4117-924e-6387790a010b' AND question = 'Le théorème des gendarmes dit que si g ≤ f ≤ h et lim g = lim h = L alors :';

UPDATE public.chapter_quizzes SET hint = E'💡 كسر كثيري حدود من نفس الدرجة في $+\\infty$ ⇒ نسبة المعاملين الرئيسيين.',
explanation = E'$\\lim_{x \\to +\\infty} \\frac{2x^2-3x+1}{x^2+1} = \\frac{2}{1} = 2$.'
WHERE chapter_id='d02d077f-7507-4117-924e-6387790a010b' AND question LIKE '%2x^2 - 3x + 1%';

UPDATE public.chapter_quizzes SET hint = E'💡 $a$ يجب أن يساوي $\\lim_{x \\to 2} \\frac{x^2-4}{x-2}$.',
explanation = E'لكل $x \\neq 2$: $\\frac{x^2-4}{x-2} = x+2 \\to 4$. إذن $a=4$.'
WHERE chapter_id='d02d077f-7507-4117-924e-6387790a010b' AND question LIKE '%begin{cases}%';

UPDATE public.chapter_quizzes SET hint = E'💡 مبرهنة TVI: استمرار + تغير الإشارة ⇒ وجود جذر.',
explanation = E'بحسب TVI: $\\exists c \\in ]a,b[: f(c)=0$.'
WHERE chapter_id='d02d077f-7507-4117-924e-6387790a010b' AND question LIKE '%مبرهنة القيم المتوسطة%';

UPDATE public.chapter_quizzes SET hint = E'💡 شرط $x^2-4 \\geq 0$ أي $|x| \\geq 2$.',
explanation = E'مجموعة التعريف: $]-\\infty,-2] \\cup [2,+\\infty[$.'
WHERE chapter_id='d02d077f-7507-4117-924e-6387790a010b' AND question LIKE '%sqrt{x^2 - 4}%';

UPDATE public.chapter_quizzes SET hint = E'💡 شكل $\\frac{0}{0}$. حلّل $x^2-1=(x-1)(x+1)$.',
explanation = E'$\\lim_{x \\to 1} \\frac{x-1}{(x-1)(x+1)} = \\frac{1}{2}$.'
WHERE chapter_id='d02d077f-7507-4117-924e-6387790a010b' AND question LIKE '%h(x) = \\frac{x-1}%';