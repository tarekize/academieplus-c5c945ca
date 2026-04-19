
-- Refonte du contenu pédagogique : Terminale Sciences Expérimentales
-- Chapitre : النهايات والاستمرارية (Limites & Continuité)
-- Format : Markdown + LaTeX (KaTeX) - rendu professionnel RTL/LTR

-- =========================================================
-- Leçon 1 : نهاية منتهية أو غير منتهية عند ∞+ أو ∞-
-- =========================================================
UPDATE public.lessons SET content = $LESSON$
# درس: النهايات المنتهية واللانهائية عند $+\infty$ و $-\infty$

أهلاً وسهلاً أيها التلميذ الأعزاء في هذا الدرس المهم من مادة الرياضيات. إن فهم **النهايات** هو حجر الزاوية في دراسة الدوال والاستمرارية والاشتقاق. تابعوا معنا بتركيز لتحقيق أقصى استفادة.

---

## 1. مفهوم النهاية المنتهية عند $+\infty$ أو $-\infty$

<div class="lesson-block block-definition">
<div class="lesson-block-title">📘 تعريف 1.1 — النهاية المنتهية عند $+\infty$</div>

نقول إن للدالة $f$ نهاية منتهية تساوي العدد الحقيقي $L$ عند $+\infty$، إذا وفقط إذا، من أجل كل مجال مفتوح يضم $L$، يوجد عدد حقيقي $A$ بحيث: لكل $x \geq A$، فإن $f(x)$ ينتمي إلى هذا المجال. نكتب:
$$\lim_{x \to +\infty} f(x) = L$$

</div>

<div class="lesson-block block-graphic">
<div class="lesson-block-title">📈 التفسير البياني</div>

المنحنى $\mathcal{C}_f$ يقترب من المستقيم الأفقي ذي المعادلة $y = L$ عندما $x \to +\infty$. نقول إن المستقيم $y = L$ هو **مقارب أفقي** للمنحنى $\mathcal{C}_f$ بجوار $+\infty$.

</div>

<div class="lesson-block block-example">
<div class="lesson-block-title">✏️ مثال تطبيقي</div>

لتكن الدالة $f$ المعرفة بـ $f(x) = \dfrac{1}{x} + 2$. احسب $\displaystyle\lim_{x \to +\infty} f(x)$.

**الحل:**

$$\lim_{x \to +\infty} \frac{1}{x} = 0 \quad \text{و} \quad \lim_{x \to +\infty} 2 = 2$$

ومنه بجمع النهايتين:
$$\lim_{x \to +\infty} f(x) = 0 + 2 = 2$$

إذن المستقيم $y = 2$ هو مقارب أفقي للمنحنى $\mathcal{C}_f$ بجوار $+\infty$.

</div>

---

<div class="lesson-block block-definition">
<div class="lesson-block-title">📘 تعريف 1.2 — النهاية المنتهية عند $-\infty$</div>

نقول إن للدالة $f$ نهاية منتهية تساوي $L$ عند $-\infty$ إذا وفقط إذا، من أجل كل مجال مفتوح يضم $L$، يوجد عدد حقيقي $A$ بحيث: لكل $x \leq A$، فإن $f(x)$ ينتمي إلى هذا المجال. نكتب:
$$\lim_{x \to -\infty} f(x) = L$$

</div>

<div class="lesson-block block-graphic">
<div class="lesson-block-title">📈 التفسير البياني</div>

المستقيم $y = L$ هو مقارب أفقي للمنحنى $\mathcal{C}_f$ بجوار $-\infty$.

</div>

<div class="lesson-block block-example">
<div class="lesson-block-title">✏️ مثال تطبيقي</div>

لتكن الدالة $g$ المعرفة بـ $g(x) = \dfrac{3x+1}{x-2}$. احسب $\displaystyle\lim_{x \to -\infty} g(x)$.

**الحل:** نأخذ نسبة أعلى درجة في البسط على أعلى درجة في المقام:
$$\lim_{x \to -\infty} g(x) = \lim_{x \to -\infty} \frac{3x}{x} = 3$$

إذن المستقيم $y = 3$ هو مقارب أفقي للمنحنى $\mathcal{C}_g$ بجوار $-\infty$.

</div>

---

## 2. مفهوم النهاية اللانهائية عند $+\infty$ أو $-\infty$

<div class="lesson-block block-definition">
<div class="lesson-block-title">📘 تعريف 2.1 — النهاية $+\infty$ عند $+\infty$</div>

نقول إن $\displaystyle\lim_{x \to +\infty} f(x) = +\infty$ إذا وفقط إذا، من أجل كل عدد حقيقي $M > 0$ مهما كان كبيراً، يوجد عدد حقيقي $A$ بحيث: لكل $x \geq A$، فإن $f(x) \geq M$.

</div>

<div class="lesson-block block-definition">
<div class="lesson-block-title">📘 تعريف 2.2 — النهاية $-\infty$ عند $+\infty$</div>

$$\lim_{x \to +\infty} f(x) = -\infty \iff \forall M < 0,\; \exists A \in \mathbb{R},\; \forall x \geq A,\; f(x) \leq M$$

</div>

---

## 3. النهايات المرجعية الواجب حفظها

<div class="lesson-block block-property">
<div class="lesson-block-title">⭐ خواص — النهايات المرجعية</div>

| الدالة | $\displaystyle\lim_{x \to +\infty}$ | $\displaystyle\lim_{x \to -\infty}$ |
|:---:|:---:|:---:|
| $f(x) = x^n$, $n \in \mathbb{N}^*$ | $+\infty$ | $+\infty$ إذا $n$ زوجي، $-\infty$ إذا فردي |
| $f(x) = \dfrac{1}{x^n}$ | $0^+$ | $0$ |
| $f(x) = \sqrt{x}$ | $+\infty$ | غير معرفة |
| $f(x) = \dfrac{1}{\sqrt{x}}$ | $0^+$ | غير معرفة |

</div>

<div class="lesson-block block-remark">
<div class="lesson-block-title">⚠️ ملاحظات مهمة</div>

- نهاية كثير الحدود عند $\pm\infty$ تساوي نهاية حده ذي الدرجة الأعلى.
- نهاية دالة كسرية عند $\pm\infty$ تساوي نهاية حاصل قسمة الحدين ذوي الدرجة الأعلى.
- لا تخلط بين $\dfrac{1}{0^+} = +\infty$ و $\dfrac{1}{0^-} = -\infty$.

</div>

---

## 4. العمليات على النهايات

<div class="lesson-block block-property">
<div class="lesson-block-title">⭐ مجموع نهايتين</div>

| $\displaystyle\lim f$ | $L$ | $L$ | $L$ | $+\infty$ | $-\infty$ | $+\infty$ |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| $\displaystyle\lim g$ | $L'$ | $+\infty$ | $-\infty$ | $+\infty$ | $-\infty$ | $-\infty$ |
| $\displaystyle\lim(f+g)$ | $L+L'$ | $+\infty$ | $-\infty$ | $+\infty$ | $-\infty$ | **F.I.** |

</div>

<div class="lesson-block block-property">
<div class="lesson-block-title">⭐ جداء نهايتين</div>

| $\displaystyle\lim f$ | $L$ | $L \neq 0$ | $0$ |
|:---:|:---:|:---:|:---:|
| $\displaystyle\lim g$ | $L'$ | $\pm\infty$ | $\pm\infty$ |
| $\displaystyle\lim(f \cdot g)$ | $L \cdot L'$ | $\pm\infty$ (قاعدة الإشارة) | **F.I.** |

</div>

<div class="lesson-block block-remark">
<div class="lesson-block-title">⚠️ الحالات غير المحددة (Formes Indéterminées)</div>

الحالات الأربع غير المحددة هي:
$$\infty - \infty, \quad 0 \times \infty, \quad \frac{\infty}{\infty}, \quad \frac{0}{0}$$

في هذه الحالات يجب **رفع عدم التعيين** بالتعميل أو بضرب المرافق أو بأي طريقة جبرية مناسبة.

</div>

---

## 5. تطبيق شامل

<div class="lesson-block block-example">
<div class="lesson-block-title">✏️ مثال شامل</div>

احسب $\displaystyle\lim_{x \to +\infty} \left( \sqrt{x^2 + x} - x \right)$.

**الحل:** هذه حالة غير محددة من الشكل $\infty - \infty$. نضرب ونقسم على المرافق:
$$\sqrt{x^2+x} - x = \frac{(\sqrt{x^2+x} - x)(\sqrt{x^2+x} + x)}{\sqrt{x^2+x} + x} = \frac{x}{\sqrt{x^2+x} + x}$$

نقسم البسط والمقام على $x$ (لـ $x > 0$):
$$= \frac{1}{\sqrt{1 + \tfrac{1}{x}} + 1}$$

وعليه:
$$\lim_{x \to +\infty} \left( \sqrt{x^2+x} - x \right) = \frac{1}{\sqrt{1+0}+1} = \frac{1}{2}$$

</div>

---

## 🎯 خلاصة الدرس

- النهاية المنتهية $\Longleftrightarrow$ مقارب أفقي.
- النهاية اللانهائية $\Longleftrightarrow$ فرع لا نهائي.
- في حالة عدم التعيين: استعمل **التعميل** أو **المرافق** أو **القسمة على أعلى قوة**.
$LESSON$
WHERE id = '5c0b3161-d8ad-4c44-8727-7bc623b86ea9';

-- =========================================================
-- Leçon 2 : نهاية منتهية أو غير منتهية عند عدد حقيقي
-- =========================================================
UPDATE public.lessons SET content = $LESSON$
# درس: النهاية المنتهية واللانهائية عند عدد حقيقي $a$

في هذا الدرس ندرس سلوك الدالة $f$ في جوار نقطة $a \in \mathbb{R}$.

---

## 1. النهاية المنتهية عند نقطة

<div class="lesson-block block-definition">
<div class="lesson-block-title">📘 تعريف 1.1</div>

نقول إن للدالة $f$ نهاية تساوي $L$ عند $a$، إذا وفقط إذا، من أجل كل مجال مفتوح $J$ يضم $L$، يوجد مجال مفتوح $I$ يضم $a$ بحيث: لكل $x \in I \cap D_f$، يكون $f(x) \in J$. نكتب:
$$\lim_{x \to a} f(x) = L$$

</div>

<div class="lesson-block block-property">
<div class="lesson-block-title">⭐ خاصية</div>

إذا كانت $f$ معرفة في $a$ ولها نهاية $L$ عند $a$، فإن $L = f(a)$.

</div>

<div class="lesson-block block-example">
<div class="lesson-block-title">✏️ مثال</div>

$$\lim_{x \to 2} (x^2 + 3x - 1) = 2^2 + 3 \times 2 - 1 = 9$$

</div>

---

## 2. النهاية اللانهائية عند نقطة

<div class="lesson-block block-definition">
<div class="lesson-block-title">📘 تعريف 2.1</div>

نقول إن $\displaystyle\lim_{x \to a} f(x) = +\infty$ إذا وفقط إذا، من أجل كل عدد حقيقي $M > 0$، يوجد $\alpha > 0$ بحيث:
$$0 < |x - a| < \alpha \implies f(x) > M$$

</div>

<div class="lesson-block block-graphic">
<div class="lesson-block-title">📈 التفسير البياني</div>

المستقيم العمودي ذو المعادلة $x = a$ هو **مقارب عمودي** للمنحنى $\mathcal{C}_f$.

</div>

---

## 3. النهاية على اليمين والنهاية على اليسار

<div class="lesson-block block-definition">
<div class="lesson-block-title">📘 تعريف 3.1</div>

- النهاية على اليمين: $\displaystyle\lim_{\substack{x \to a \\ x > a}} f(x) = \lim_{x \to a^+} f(x)$
- النهاية على اليسار: $\displaystyle\lim_{\substack{x \to a \\ x < a}} f(x) = \lim_{x \to a^-} f(x)$

</div>

<div class="lesson-block block-property">
<div class="lesson-block-title">⭐ خاصية أساسية</div>

للدالة $f$ نهاية عند $a$ إذا وفقط إذا:
$$\lim_{x \to a^+} f(x) = \lim_{x \to a^-} f(x) = L$$

</div>

<div class="lesson-block block-example">
<div class="lesson-block-title">✏️ مثال تطبيقي</div>

ادرس نهاية الدالة $f(x) = \dfrac{1}{x-2}$ عند $a = 2$.

**الحل:**
$$\lim_{x \to 2^+} \frac{1}{x-2} = +\infty \quad ; \quad \lim_{x \to 2^-} \frac{1}{x-2} = -\infty$$

النهايتان مختلفتان، إذن **لا توجد** نهاية للدالة $f$ عند $2$. ومع ذلك، المستقيم $x = 2$ مقارب عمودي للمنحنى $\mathcal{C}_f$.

</div>

---

## 4. رفع عدم التعيين من الشكل $\dfrac{0}{0}$

<div class="lesson-block block-property">
<div class="lesson-block-title">⭐ طرق الرفع</div>

عند الحصول على شكل $\dfrac{0}{0}$ نستعمل إحدى الطرق:

1. **التعميل** ثم الاختزال.
2. **ضرب المرافق** إذا وُجد جذر.
3. استعمال **مبرهنة المشتق** (مفهوم العدد المشتق).

</div>

<div class="lesson-block block-example">
<div class="lesson-block-title">✏️ مثال 1 — التعميل</div>

$$\lim_{x \to 1} \frac{x^2 - 1}{x - 1} = \lim_{x \to 1} \frac{(x-1)(x+1)}{x-1} = \lim_{x \to 1} (x+1) = 2$$

</div>

<div class="lesson-block block-example">
<div class="lesson-block-title">✏️ مثال 2 — المرافق</div>

$$\lim_{x \to 0} \frac{\sqrt{x+1} - 1}{x} = \lim_{x \to 0} \frac{(\sqrt{x+1}-1)(\sqrt{x+1}+1)}{x(\sqrt{x+1}+1)} = \lim_{x \to 0} \frac{1}{\sqrt{x+1}+1} = \frac{1}{2}$$

</div>

<div class="lesson-block block-remark">
<div class="lesson-block-title">⚠️ ملاحظة</div>

عند دراسة نهاية عند $a$، لا يكفي تعويض $x$ بـ $a$ مباشرة إذا كانت الدالة غير معرفة في $a$. يجب دراسة النهايات الجانبية.

</div>
$LESSON$
WHERE id = '83a5488b-7f38-47f6-a59a-0f443b6bc923';

-- =========================================================
-- Leçon 3 : تتمات على النهايات (Compléments sur les limites)
-- =========================================================
UPDATE public.lessons SET content = $LESSON$
# درس: تتمات على النهايات

نُتمم هنا دراسة النهايات بمبرهنات المقارنة والحصر، وهي أدوات قوية لحساب نهايات الدوال المعقدة.

---

## 1. مبرهنات المقارنة

<div class="lesson-block block-property">
<div class="lesson-block-title">⭐ مبرهنة 1.1 — المقارنة نحو $+\infty$</div>

ليكن $f$ و $g$ دالتين معرفتين على مجال $[A, +\infty[$. إذا كان:
$$\forall x \geq A,\; f(x) \geq g(x) \quad \text{و} \quad \lim_{x \to +\infty} g(x) = +\infty$$
فإن:
$$\lim_{x \to +\infty} f(x) = +\infty$$

</div>

<div class="lesson-block block-property">
<div class="lesson-block-title">⭐ مبرهنة 1.2 — المقارنة نحو $-\infty$</div>

إذا كان $\forall x \geq A$: $f(x) \leq g(x)$ و $\displaystyle\lim_{x \to +\infty} g(x) = -\infty$ فإن $\displaystyle\lim_{x \to +\infty} f(x) = -\infty$.

</div>

<div class="lesson-block block-example">
<div class="lesson-block-title">✏️ مثال</div>

احسب $\displaystyle\lim_{x \to +\infty} (x + \sin x)$.

**الحل:** بما أن $\sin x \geq -1$ فإن:
$$x + \sin x \geq x - 1$$
وبما أن $\displaystyle\lim_{x \to +\infty} (x-1) = +\infty$، فحسب مبرهنة المقارنة:
$$\lim_{x \to +\infty} (x + \sin x) = +\infty$$

</div>

---

## 2. مبرهنة الحصر (Théorème des Gendarmes)

<div class="lesson-block block-property">
<div class="lesson-block-title">⭐ مبرهنة 2.1 — الحصر</div>

ليكن $f$، $g$ و $h$ ثلاث دوال بحيث، في جوار $+\infty$:
$$g(x) \leq f(x) \leq h(x)$$
وإذا كان $\displaystyle\lim_{x \to +\infty} g(x) = \lim_{x \to +\infty} h(x) = L$ (حيث $L \in \mathbb{R}$)
فإن:
$$\lim_{x \to +\infty} f(x) = L$$

</div>

<div class="lesson-block block-remark">
<div class="lesson-block-title">⚠️ ملاحظة</div>

نفس المبرهنة صالحة عند $-\infty$ وعند نقطة $a \in \mathbb{R}$.

</div>

<div class="lesson-block block-example">
<div class="lesson-block-title">✏️ مثال تطبيقي</div>

احسب $\displaystyle\lim_{x \to +\infty} \dfrac{\sin x}{x}$.

**الحل:** من أجل $x > 0$:
$$-\frac{1}{x} \leq \frac{\sin x}{x} \leq \frac{1}{x}$$

وبما أن $\displaystyle\lim_{x \to +\infty} \frac{1}{x} = \lim_{x \to +\infty} \left(-\frac{1}{x}\right) = 0$، نستنتج بمبرهنة الحصر:
$$\lim_{x \to +\infty} \frac{\sin x}{x} = 0$$

</div>

---

## 3. النهايات والترتيب

<div class="lesson-block block-property">
<div class="lesson-block-title">⭐ خاصية — حفظ الترتيب</div>

إذا كان $f(x) \leq g(x)$ في جوار $a$ (حيث $a \in \mathbb{R} \cup \{\pm\infty\}$) و كان للدالتين نهاية منتهية عند $a$، فإن:
$$\lim_{x \to a} f(x) \leq \lim_{x \to a} g(x)$$

</div>

<div class="lesson-block block-remark">
<div class="lesson-block-title">⚠️ ملاحظة هامة</div>

المتراجحة الصارمة $f(x) < g(x)$ **لا تُحفظ** بالضرورة عند الانتقال إلى النهاية. فمثلاً $\dfrac{1}{x+1} > 0$ لكل $x > 0$ ولكن $\displaystyle\lim_{x \to +\infty} \dfrac{1}{x+1} = 0$.

</div>

---

## 4. الأشكال غير المحددة الكلاسيكية

<div class="lesson-block block-property">
<div class="lesson-block-title">⭐ كثير الحدود ودالة كسرية عند $\pm\infty$</div>

- نهاية كثير حدود = نهاية حده ذي الدرجة الأعلى.
- نهاية دالة كسرية = نهاية خارج الحدين ذوي الأعلى درجة.

</div>

<div class="lesson-block block-example">
<div class="lesson-block-title">✏️ مثال</div>

$$\lim_{x \to +\infty} \frac{2x^3 - x + 5}{x^2 + 1} = \lim_{x \to +\infty} \frac{2x^3}{x^2} = \lim_{x \to +\infty} 2x = +\infty$$

</div>

<div class="lesson-block block-example">
<div class="lesson-block-title">✏️ مثال — رفع $\dfrac{0}{0}$ بالمرافق</div>

$$\lim_{x \to 4} \frac{\sqrt{x} - 2}{x - 4}$$

ضرب البسط والمقام في $\sqrt{x}+2$:
$$= \lim_{x \to 4} \frac{x - 4}{(x-4)(\sqrt{x}+2)} = \lim_{x \to 4} \frac{1}{\sqrt{x}+2} = \frac{1}{4}$$

</div>

---

## 🎯 خلاصة الدرس

| الحالة | الأداة |
|:---:|:---:|
| $\dfrac{\infty}{\infty}$ | القسمة على أعلى قوة |
| $\infty - \infty$ | المرافق / تعميل |
| $\dfrac{0}{0}$ | تعميل / مرافق / مبرهنة المشتق |
| $\sin$، $\cos$ | الحصر |
| متراجحات | المقارنة |
$LESSON$
WHERE id = '46ba81a9-0747-4251-9aa3-5499f6bf8b94';

-- =========================================================
-- Leçon 4 : نهاية دالة مركبة - النهايات بالمقارنة
-- =========================================================
UPDATE public.lessons SET content = $LESSON$
# درس: نهاية دالة مُركَّبة

تُسمح لنا دراسة الدوال المركبة بحساب نهايات الدوال المعقدة عن طريق تجزئتها إلى دوال أبسط.

---

## 1. تذكير بالدالة المركبة

<div class="lesson-block block-definition">
<div class="lesson-block-title">📘 تعريف 1.1</div>

ليكن $u$ دالة معرفة على مجموعة $D_u$، و $v$ دالة معرفة على مجموعة $D_v$، بحيث $u(D_u) \subset D_v$. الدالة المركبة $v \circ u$ معرفة على $D_u$ بـ:
$$(v \circ u)(x) = v\bigl(u(x)\bigr)$$

</div>

<div class="lesson-block block-example">
<div class="lesson-block-title">✏️ مثال</div>

إذا كان $u(x) = x^2 + 1$ و $v(X) = \sqrt{X}$، فإن:
$$(v \circ u)(x) = \sqrt{x^2 + 1}$$

</div>

---

## 2. مبرهنة نهاية الدالة المركبة

<div class="lesson-block block-property">
<div class="lesson-block-title">⭐ مبرهنة 2.1</div>

ليكن $a, b, c \in \mathbb{R} \cup \{-\infty, +\infty\}$. إذا كان:
$$\lim_{x \to a} u(x) = b \quad \text{و} \quad \lim_{X \to b} v(X) = c$$
فإن:
$$\lim_{x \to a} (v \circ u)(x) = \lim_{x \to a} v\bigl(u(x)\bigr) = c$$

</div>

<div class="lesson-block block-remark">
<div class="lesson-block-title">⚠️ ملاحظة منهجية</div>

في الممارسة، نضع $X = u(x)$ ونحسب أولاً $\displaystyle\lim_{x \to a} u(x) = b$، ثم $\displaystyle\lim_{X \to b} v(X)$.

</div>

---

## 3. تطبيقات

<div class="lesson-block block-example">
<div class="lesson-block-title">✏️ مثال 1</div>

احسب $\displaystyle\lim_{x \to +\infty} \sqrt{1 + \dfrac{1}{x}}$.

**الحل:** نضع $X = 1 + \dfrac{1}{x}$، فإن:
$$\lim_{x \to +\infty} X = 1 \quad \text{و} \quad \lim_{X \to 1} \sqrt{X} = 1$$

ومنه:
$$\lim_{x \to +\infty} \sqrt{1 + \frac{1}{x}} = 1$$

</div>

<div class="lesson-block block-example">
<div class="lesson-block-title">✏️ مثال 2</div>

احسب $\displaystyle\lim_{x \to +\infty} \cos\!\left(\dfrac{1}{x}\right)$.

**الحل:** نضع $X = \dfrac{1}{x}$، إذن $\displaystyle\lim_{x \to +\infty} X = 0$ و $\displaystyle\lim_{X \to 0} \cos X = 1$.
$$\lim_{x \to +\infty} \cos\!\left(\frac{1}{x}\right) = 1$$

</div>

---

## 4. النهايات بالمقارنة (تعميق)

<div class="lesson-block block-property">
<div class="lesson-block-title">⭐ تذكير بالمبرهنات</div>

| الفرضية | النتيجة |
|:---:|:---:|
| $f(x) \geq g(x)$ و $\lim g = +\infty$ | $\lim f = +\infty$ |
| $f(x) \leq g(x)$ و $\lim g = -\infty$ | $\lim f = -\infty$ |
| $g \leq f \leq h$ و $\lim g = \lim h = L$ | $\lim f = L$ |

</div>

<div class="lesson-block block-example">
<div class="lesson-block-title">✏️ مثال تطبيقي</div>

ادرس نهاية $f(x) = x^2 + \cos x$ عند $+\infty$.

**الحل:** بما أن $-1 \leq \cos x \leq 1$:
$$x^2 - 1 \leq f(x) \leq x^2 + 1$$
وبما أن $\displaystyle\lim_{x \to +\infty} (x^2 - 1) = +\infty$، فحسب مبرهنة المقارنة:
$$\lim_{x \to +\infty} (x^2 + \cos x) = +\infty$$

</div>

---

## 🎯 خلاصة

- لحساب نهاية دالة مركبة: نضع متغيراً وسيطاً $X = u(x)$.
- المبرهنة: $\displaystyle\lim_{x \to a} v(u(x)) = \lim_{X \to b} v(X)$ حيث $b = \lim_{x \to a} u(x)$.
- المقارنة والحصر أدوات أساسية مع الدوال المثلثية.
$LESSON$
WHERE id = '1598c1c3-05b7-41e5-bb7b-f3d7b401c721';

-- =========================================================
-- Leçon 5 : الاستمرارية (Continuité)
-- =========================================================
UPDATE public.lessons SET content = $LESSON$
# درس: الاستمرارية

الاستمرارية مفهوم أساسي يربط النهايات بقيمة الدالة عند نقطة، وهو شرط ضروري لكثير من المبرهنات الكبرى في التحليل.

---

## 1. الاستمرارية عند نقطة

<div class="lesson-block block-definition">
<div class="lesson-block-title">📘 تعريف 1.1 — الاستمرارية عند $a$</div>

تكون الدالة $f$ مستمرة عند $a$ إذا وفقط إذا تحققت الشروط الثلاثة:

1. $f$ معرفة عند $a$، أي $a \in D_f$.
2. الدالة $f$ تقبل نهاية عند $a$.
3. هذه النهاية تساوي $f(a)$:
$$\lim_{x \to a} f(x) = f(a)$$

</div>

<div class="lesson-block block-property">
<div class="lesson-block-title">⭐ خاصية — الاستمرارية الجانبية</div>

تكون $f$ مستمرة عند $a$ إذا وفقط إذا:
$$\lim_{x \to a^+} f(x) = \lim_{x \to a^-} f(x) = f(a)$$

</div>

<div class="lesson-block block-example">
<div class="lesson-block-title">✏️ مثال</div>

ادرس استمرارية الدالة $f$ المعرفة بـ:
$$f(x) = \begin{cases} x^2 + 1 & \text{إذا } x \neq 1 \\ 2 & \text{إذا } x = 1 \end{cases}$$

**الحل:**
$$\lim_{x \to 1} f(x) = \lim_{x \to 1} (x^2+1) = 2 = f(1)$$

إذن $f$ مستمرة عند $1$.

</div>

---

## 2. الاستمرارية على مجال

<div class="lesson-block block-definition">
<div class="lesson-block-title">📘 تعريف 2.1</div>

تكون $f$ مستمرة على المجال $I$ إذا كانت مستمرة عند كل نقطة من $I$.

</div>

<div class="lesson-block block-property">
<div class="lesson-block-title">⭐ خواص أساسية</div>

- كثيرات الحدود مستمرة على $\mathbb{R}$.
- الدوال الكسرية مستمرة على مجموعة تعريفها.
- الدوال المثلثية $\sin$ و $\cos$ مستمرة على $\mathbb{R}$.
- الدالة $\sqrt{x}$ مستمرة على $[0, +\infty[$.

</div>

---

## 3. عمليات على الدوال المستمرة

<div class="lesson-block block-property">
<div class="lesson-block-title">⭐ مبرهنة 3.1</div>

إذا كانت $f$ و $g$ مستمرتين عند $a$، فإن:

| الدالة | الاستمرارية |
|:---:|:---:|
| $f + g$ | مستمرة عند $a$ |
| $\lambda f$ ($\lambda \in \mathbb{R}$) | مستمرة عند $a$ |
| $f \times g$ | مستمرة عند $a$ |
| $\dfrac{f}{g}$ | مستمرة عند $a$ إذا $g(a) \neq 0$ |
| $\sqrt{f}$ | مستمرة عند $a$ إذا $f(a) \geq 0$ |

</div>

<div class="lesson-block block-property">
<div class="lesson-block-title">⭐ مبرهنة 3.2 — تركيب دالتين مستمرتين</div>

إذا كانت $u$ مستمرة عند $a$ و $v$ مستمرة عند $u(a)$، فإن $v \circ u$ مستمرة عند $a$.

</div>

---

## 4. التمديد بالاستمرارية

<div class="lesson-block block-definition">
<div class="lesson-block-title">📘 تعريف 4.1</div>

إذا كانت $f$ غير معرفة عند $a$ ولكنها تقبل نهاية منتهية $L$ عند $a$، فإن الدالة $\tilde{f}$ المعرفة بـ:
$$\tilde{f}(x) = \begin{cases} f(x) & \text{إذا } x \neq a \\ L & \text{إذا } x = a \end{cases}$$
تُسمى **التمديد بالاستمرارية** للدالة $f$ عند $a$.

</div>

<div class="lesson-block block-example">
<div class="lesson-block-title">✏️ مثال</div>

لتكن $f(x) = \dfrac{x^2 - 4}{x - 2}$، فهي غير معرفة عند $x = 2$. لكن:
$$\lim_{x \to 2} \frac{x^2-4}{x-2} = \lim_{x \to 2} (x+2) = 4$$

التمديد بالاستمرارية هو:
$$\tilde{f}(x) = \begin{cases} \dfrac{x^2-4}{x-2} & \text{إذا } x \neq 2 \\ 4 & \text{إذا } x = 2 \end{cases}$$

</div>

<div class="lesson-block block-remark">
<div class="lesson-block-title">⚠️ ملاحظة</div>

التمديد بالاستمرارية ممكن **فقط** إذا كانت النهاية منتهية (عدد حقيقي). إذا كانت النهاية لا نهائية فلا يمكن التمديد.

</div>

---

## 🎯 خلاصة

- $f$ مستمرة عند $a$ $\iff$ $\displaystyle\lim_{x \to a} f(x) = f(a)$.
- العمليات الجبرية وتركيب الدوال يحفظان الاستمرارية.
- التمديد بالاستمرارية يحول دالة غير معرفة عند نقطة إلى دالة مستمرة، شرط وجود نهاية منتهية.
$LESSON$
WHERE id = '9f06cf42-6be9-40ca-a0ef-b3d590476e40';

-- =========================================================
-- Leçon 6 : مبرهنة القيم المتوسطة (TVI)
-- =========================================================
UPDATE public.lessons SET content = $LESSON$
# درس: مبرهنة القيم المتوسطة (TVI)

مبرهنة القيم المتوسطة من أهم نتائج التحليل في الثانية ثانوي. تُمكّننا من إثبات وجود حلول لمعادلات لا يمكن حلها جبرياً.

---

## 1. المبرهنة الأساسية

<div class="lesson-block block-property">
<div class="lesson-block-title">⭐ مبرهنة 1.1 — مبرهنة القيم المتوسطة</div>

إذا كانت $f$ دالة **مستمرة** على مجال $[a, b]$، فإن من أجل كل عدد حقيقي $k$ محصور بين $f(a)$ و $f(b)$، توجد قيمة $c \in [a, b]$ على الأقل بحيث:
$$f(c) = k$$

</div>

<div class="lesson-block block-graphic">
<div class="lesson-block-title">📈 التفسير البياني</div>

كل مستقيم أفقي $y = k$ حيث $\min(f(a), f(b)) \leq k \leq \max(f(a), f(b))$ يقطع المنحنى $\mathcal{C}_f$ في **نقطة واحدة على الأقل** ذات فاصلة $c \in [a, b]$.

</div>

---

## 2. النتيجة الأساسية (وجود جذور)

<div class="lesson-block block-property">
<div class="lesson-block-title">⭐ نتيجة 2.1</div>

إذا كانت $f$ مستمرة على $[a, b]$ وكان $f(a) \times f(b) < 0$ (أي $f(a)$ و $f(b)$ من إشارتين مختلفتين)، فإن المعادلة $f(x) = 0$ تقبل **حلاً واحداً على الأقل** في المجال $]a, b[$.

</div>

<div class="lesson-block block-property">
<div class="lesson-block-title">⭐ نتيجة 2.2 — الوحدانية</div>

إذا أُضيف الفرض أن $f$ **رتيبة تماماً** على $[a, b]$، فإن الحل يكون **وحيداً**.

</div>

---

## 3. تطبيق

<div class="lesson-block block-example">
<div class="lesson-block-title">✏️ مثال تطبيقي</div>

أثبت أن المعادلة $x^3 + x - 1 = 0$ تقبل حلاً وحيداً في $[0, 1]$.

**الحل:**

نضع $f(x) = x^3 + x - 1$.

1. **الاستمرارية:** $f$ كثير حدود، فهي مستمرة على $\mathbb{R}$، خاصةً على $[0, 1]$.
2. **حساب القيم الطرفية:**
$$f(0) = -1 < 0 \quad ; \quad f(1) = 1 > 0$$
3. **الرتابة:** $f'(x) = 3x^2 + 1 > 0$ لكل $x \in \mathbb{R}$، إذن $f$ متزايدة تماماً على $[0, 1]$.

حسب نتيجة مبرهنة القيم المتوسطة، المعادلة $f(x) = 0$ تقبل **حلاً وحيداً** $\alpha \in ]0, 1[$.

</div>

---

## 4. الحصر بالطريقة التتابعية (Dichotomie)

<div class="lesson-block block-remark">
<div class="lesson-block-title">💡 طريقة التنصيف</div>

لتقريب الحل $\alpha$ بدقة معينة، نستعمل خوارزمية التنصيف:

1. ننطلق من المجال $[a_0, b_0] = [a, b]$.
2. نحسب $m = \dfrac{a_n + b_n}{2}$.
3. - إذا $f(a_n) \times f(m) < 0$: $[a_{n+1}, b_{n+1}] = [a_n, m]$.
   - وإلا: $[a_{n+1}, b_{n+1}] = [m, b_n]$.
4. نواصل حتى تصبح $b_n - a_n < \varepsilon$.

</div>

<div class="lesson-block block-example">
<div class="lesson-block-title">✏️ تطبيق على المعادلة السابقة</div>

| المرحلة | $a_n$ | $b_n$ | $m$ | $f(m)$ |
|:---:|:---:|:---:|:---:|:---:|
| 0 | $0$ | $1$ | $0.5$ | $-0.375$ |
| 1 | $0.5$ | $1$ | $0.75$ | $0.172$ |
| 2 | $0.5$ | $0.75$ | $0.625$ | $-0.131$ |

ومنه: $\alpha \approx 0.68$ بدقة $0.1$.

</div>

---

## 🎯 خلاصة

- TVI تتطلب الاستمرارية فقط (لا تحتاج الاشتقاقية).
- مع الاستمرارية + الرتابة الصارمة $\Rightarrow$ **حل وحيد**.
- التنصيف طريقة عددية لتقريب الحل بأي دقة مطلوبة.
$LESSON$
WHERE id = '0587156b-e405-4501-8704-3b7e1549e28c';

-- =========================================================
-- Leçon 7 : الدوال المستمرة والرتيبة تماما
-- =========================================================
UPDATE public.lessons SET content = $LESSON$
# درس: الدوال المستمرة والرتيبة تماماً

تشكّل الدوال المستمرة والرتيبة فئة مهمة جداً، فهي تقبل دالة عكسية وتسهل دراسة المعادلات.

---

## 1. مبرهنة الدالة العكسية

<div class="lesson-block block-property">
<div class="lesson-block-title">⭐ مبرهنة 1.1 — التقابل</div>

إذا كانت $f$ دالة **مستمرة** و **رتيبة تماماً** على مجال $I$، فإنها تُعرّف **تقابلاً** من $I$ إلى $J = f(I)$. كل عنصر $y \in J$ يقبل سابقاً وحيداً $x \in I$ بحيث $f(x) = y$.

</div>

<div class="lesson-block block-property">
<div class="lesson-block-title">⭐ مبرهنة 1.2 — صورة مجال</div>

| المجال $I$ | الصورة $f(I)$ إذا $f$ متزايدة تماماً | الصورة $f(I)$ إذا $f$ متناقصة تماماً |
|:---:|:---:|:---:|
| $[a, b]$ | $[f(a), f(b)]$ | $[f(b), f(a)]$ |
| $[a, b[$ | $[f(a), \displaystyle\lim_{x \to b^-} f(x)[$ | $]\displaystyle\lim_{x \to b^-} f(x), f(a)]$ |
| $]a, +\infty[$ | $]\displaystyle\lim_{x \to a^+} f(x), \displaystyle\lim_{x \to +\infty} f(x)[$ | عكس الترتيب |

</div>

---

## 2. الدالة العكسية

<div class="lesson-block block-definition">
<div class="lesson-block-title">📘 تعريف 2.1</div>

إذا كانت $f$ تقابلاً من $I$ إلى $J$، فإن **الدالة العكسية** $f^{-1}$ معرفة من $J$ إلى $I$ بـ:
$$f^{-1}(y) = x \iff f(x) = y$$

</div>

<div class="lesson-block block-property">
<div class="lesson-block-title">⭐ خواص الدالة العكسية</div>

- $f^{-1}$ مستمرة على $J$.
- $f^{-1}$ لها نفس اتجاه تغير $f$.
- منحنى $\mathcal{C}_{f^{-1}}$ متناظر مع $\mathcal{C}_f$ بالنسبة للمستقيم $y = x$.
- $(f^{-1} \circ f)(x) = x$ لكل $x \in I$ و $(f \circ f^{-1})(y) = y$ لكل $y \in J$.

</div>

---

## 3. تطبيق

<div class="lesson-block block-example">
<div class="lesson-block-title">✏️ مثال تطبيقي</div>

لتكن $f(x) = x^2$ معرفة على $[0, +\infty[$.

1. $f$ مستمرة (كثير حدود).
2. $f'(x) = 2x \geq 0$ مع تساوي للصفر فقط في $0$، إذن $f$ متزايدة تماماً.
3. $f([0, +\infty[) = [0, +\infty[$.

ومنه $f$ تعرّف تقابلاً من $[0, +\infty[$ إلى $[0, +\infty[$ ودالتها العكسية هي:
$$f^{-1}(y) = \sqrt{y}$$

</div>

---

## 4. حل المعادلات

<div class="lesson-block block-property">
<div class="lesson-block-title">⭐ نتيجة عملية</div>

إذا كانت $f$ مستمرة ورتيبة تماماً على $[a, b]$، فإن المعادلة $f(x) = k$ (حيث $k$ محصور بين $f(a)$ و $f(b)$) تقبل حلاً **وحيداً** في $[a, b]$.

</div>

<div class="lesson-block block-example">
<div class="lesson-block-title">✏️ مثال</div>

أثبت أن المعادلة $\sqrt{x} + x = 2$ تقبل حلاً وحيداً في $[0, 2]$.

**الحل:** نضع $f(x) = \sqrt{x} + x$.

- $f$ مستمرة على $[0, 2]$ (مجموع دالتين مستمرتين).
- $f'(x) = \dfrac{1}{2\sqrt{x}} + 1 > 0$ على $]0, 2]$، إذن $f$ متزايدة تماماً.
- $f(0) = 0 < 2$ و $f(2) = \sqrt{2} + 2 \approx 3.41 > 2$.

حسب المبرهنة، المعادلة تقبل حلاً وحيداً $\alpha \in ]0, 2[$.

</div>

---

## 🎯 خلاصة الدرس

- الاستمرارية + الرتابة الصارمة $\Rightarrow$ تقابل وقابلية للعكس.
- $\mathcal{C}_{f^{-1}}$ متناظر لـ $\mathcal{C}_f$ بالنسبة للقطر $y = x$.
- هذه المبرهنات أساس دراسة الدوال $\ln$، $\exp$ و $\arctan$ في الفصول القادمة.
$LESSON$
WHERE id = 'a993024b-751e-4520-b2d8-a3f958ea41af';
