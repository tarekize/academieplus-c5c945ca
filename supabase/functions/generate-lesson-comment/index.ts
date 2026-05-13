// Generate Arabic personalized AI comment after a study session.
// The AI identifies the student's weak concepts (lacunes) and gives,
// for each one, a short explanation + a simple example + its solution,
// using LaTeX math ($...$ and $$...$$) and Markdown formatting.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function fallbackMessage(lessonTitle: string, levelBefore: number, levelAfter: number, correct: number, total: number, weak: string[]) {
  const acc = total > 0 ? Math.round((correct / total) * 100) : 0;
  const lesson = lessonTitle ? `في درس **"${lessonTitle}"**` : 'في هذا الدرس';
  const intro = levelAfter < levelBefore
    ? `📉 لاحظت أنّك واجهت بعض الصعوبات ${lesson}. أجبت على **${correct}/${total}** (${acc}%) وانخفض مستواك من **${levelBefore}** إلى **${levelAfter}** من 100.`
    : levelAfter > levelBefore
      ? `🌟 أحسنت! تقدّم واضح ${lesson}. أجبت على **${correct}/${total}** (${acc}%) وارتفع مستواك من **${levelBefore}** إلى **${levelAfter}** من 100.`
      : `🤖 أداء ثابت ${lesson}. أجبت على **${correct}/${total}** (${acc}%) ومستواك مستقر عند **${levelAfter}** من 100.`;

  const concept = weak[0] || lessonTitle || 'الفكرة الأساسية في الدرس';
  const body = `\n\n### 🎯 معالجة lacune: ${concept}
**القاعدة:** عندما تخطئ في تمرين، لا يكفي معرفة الجواب الصحيح فقط؛ يجب إعادة بناء الطريقة خطوة بخطوة: نحدّد القاعدة، نطبّقها على مثال جديد، ثم نتحقق من النتيجة.

#### مثال جديد) تمرين مشابه
لتكن الدالة $f(x)=3x^2-4x+1$. أوجد دالة أصلية $F$ للدالة $f$ على $\\mathbb{R}$.

**الحل المفصّل:**
1. نبحث عن دالة $F$ بحيث يكون $F'(x)=f(x)$.
2. نستعمل قاعدة الدوال الأصلية: إذا كان $f(x)=ax^n$ فإن دالة أصلية لها هي $\\dfrac{a}{n+1}x^{n+1}$ عندما $n\\neq -1$.
3. إذن دالة أصلية لـ $3x^2$ هي $x^3$ لأن $(x^3)'=3x^2$.
4. ودالة أصلية لـ $-4x$ هي $-2x^2$ لأن $(-2x^2)'=-4x$.
5. ودالة أصلية لـ $1$ هي $x$ لأن $(x)'=1$.
6. نجمع الحدود ونضيف ثابتاً حقيقياً $C$.

**الجواب:** $$F(x)=x^3-2x^2+x+C,\\quad C\\in\\mathbb{R}$$

اضغط **"تجديد"** للحصول على تمارين مكيّفة لمستواك. 💪`;
  return intro + body;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const {
      lesson_title = '',
      chapter_title = '',
      level_before = 0,
      level_after = 0,
      weak_concepts = [],
      strong_concepts = [],
      mistakes = [],
      session_correct = 0,
      session_total = 0,
    } = body;

    const delta = level_after - level_before;
    const direction = delta > 0 ? 'up' : delta < 0 ? 'down' : 'same';
    const accuracy = session_total > 0 ? Math.round((session_correct / session_total) * 100) : 0;

    const lovableKey = Deno.env.get('LOVABLE_API_KEY');
    const geminiKey1 = Deno.env.get('GEMINI_API_KEY');
    const geminiKey2 = Deno.env.get('GEMINI_API_KEY_2');
    const fallback = fallbackMessage(lesson_title, level_before, level_after, session_correct, session_total, weak_concepts);

    if (!lovableKey && !geminiKey1 && !geminiKey2) {
      return new Response(JSON.stringify({ message: fallback, direction, fallback: true, error: 'API_KEY_MISSING' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `أنت معلّم رياضيات عربي ودود يخاطب طالباً جزائرياً مباشرةً بصيغة "أنت".
مهمتك: كتابة تعليق تربوي شخصي باللغة العربية الفصحى البسيطة، يحلّل أداء الطالب ويعالج أخطاءه واحداً واحداً.

اكتب الإجابة بصيغة **Markdown** مع استعمال **LaTeX** للرياضيات:
- استخدم \`$...$\` للصيغ داخل السطر و \`$$...$$\` للصيغ المعروضة.
- استعمل عناوين \`###\`, تأكيد \`**...**\`, وقوائم عند الحاجة.

هيكل الإجابة الإلزامي:
1) فقرة افتتاحية قصيرة (سطران) دافئة، تذكر الدرس والمستوى والنسبة. ابدأها برمز تعبيري واحد فقط.
2) إذا توجد أخطاء (mistakes)، أنشئ قسماً: \`### 🎯 معالجة أخطائك\` ثم **لكلّ خطأ** قسماً مستقلاً يحتوي بالترتيب:
   - عنوان فرعي \`#### الخطأ N) <اسم المفهوم بصياغتك — لا تنسخ السؤال>\`
   - **ما حدث:** سطر يوضح الخطأ (الفكرة الخاطئة) دون توبيخ.
   - **القاعدة:** شرح موجز (2–3 أسطر) للقاعدة الصحيحة، مع LaTeX.
   - **مثال جديد:** **تمرين مشابه** للسؤال الذي أخطأ فيه (لكن **مختلف عنه** بأرقام/دالة جديدة) مكتوب بـ LaTeX.
   - **الحل المفصّل:** خطوات مرقّمة (3 إلى 6 خطوات) واضحة، تشرح *لماذا* كل خطوة، مع LaTeX، وتنتهي بـ \`**الجواب: ...**\`.
3) خاتمة قصيرة (سطر) تدعو الطالب للضغط على زر **"تجديد"** للحصول على تمارين مكيّفة.

قواعد إلزامية:
- لا تنسخ نص السؤال الأصلي حرفياً. اخترع مثالاً جديداً مشابهاً يعالج نفس المفهوم.
- إذا لم توجد أخطاء، استبدل القسم 2 بقسم تشجيع \`### 🌟 ما أتقنته\` يلخّص بنقطتين ما أحسن فيه.
- استعمل رمزاً تعبيرياً واحداً في كل عنوان رئيسي فقط.
- لا تستعمل HTML.
- النبرة إنسانية، تشجيعية، مناسبة لتلميذ.`;

    let situation = '';
    if (direction === 'down') situation = `تراجع مستواه من ${level_before}/100 إلى ${level_after}/100. يحتاج إلى الطمأنة وإلى مراجعة الأساسيات.`;
    else if (direction === 'up') situation = `تقدّم مستواه من ${level_before}/100 إلى ${level_after}/100. يستحق التشجيع.`;
    else situation = `مستواه مستقر عند ${level_after}/100.`;

    type Mistake = { question: string; user_answer: string; correct_answer: string; type?: string };
    const mistakeList = (mistakes as Mistake[]).filter(m => m && m.question).slice(0, 5);
    const strongList = (strong_concepts as string[]).filter(Boolean).slice(0, 5);

    const mistakesBlock = mistakeList.length
      ? mistakeList.map((m, i) => `الخطأ ${i + 1}:
- نوع النشاط: ${m.type || 'quiz'}
- نص السؤال (للسياق فقط، لا تنسخه): ${m.question}
- إجابة الطالب الخاطئة: ${m.user_answer}
- الإجابة الصحيحة: ${m.correct_answer}`).join('\n\n')
      : '— لا توجد أخطاء في هذه الجلسة.';

    const userPrompt = `سياق الجلسة (لا تكرّره حرفياً):
- الدرس: "${lesson_title}"
- الفصل: "${chapter_title}"
- ${situation}
- نسبة النجاح في هذه الجلسة: ${session_correct}/${session_total} (${accuracy}%)

أخطاء الطالب في هذه الجلسة (عالج كل خطأ على حدة بمثال جديد وحلّ مفصّل):
${mistakesBlock}

نقاط القوة الملاحظة (للسياق فقط):
${strongList.length ? strongList.map((s, i) => `${i + 1}. ${s}`).join('\n') : '— لا توجد بعد.'}

اكتب الآن التعليق التربوي الكامل بصيغة Markdown + LaTeX وفق التعليمات أعلاه. تذكّر: مثال جديد + حل مفصّل لكلّ خطأ.`;

    // Try providers in order: Lovable AI → Gemini key 1 → Gemini key 2
    async function tryLovable(): Promise<string | null> {
      if (!lovableKey) return null;
      const r = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${lovableKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.6,
        }),
      });
      if (!r.ok) {
        console.error('Lovable AI failed:', r.status, await r.text());
        return null;
      }
      const d = await r.json();
      return d.choices?.[0]?.message?.content?.trim() || null;
    }

    async function tryGemini(key: string, label: string): Promise<string | null> {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            generationConfig: { temperature: 0.6 },
          }),
        }
      );
      if (!r.ok) {
        console.error(`Gemini ${label} failed:`, r.status, await r.text());
        return null;
      }
      const d = await r.json();
      const text = d.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || '').join('').trim();
      return text || null;
    }

    let message: string | null = await tryLovable();
    if (!message && geminiKey1) message = await tryGemini(geminiKey1, 'KEY_1');
    if (!message && geminiKey2) message = await tryGemini(geminiKey2, 'KEY_2');

    if (!message) {
      return new Response(JSON.stringify({ message: fallback, direction, fallback: true, error: 'ALL_PROVIDERS_FAILED' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message, direction }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Unexpected generate-lesson-comment error:', e);
    return new Response(JSON.stringify({ message: '🤖 تم تحليل عملك. واصل التدريب واضغط "تجديد" للحصول على أسئلة مناسبة لمستواك.', fallback: true, error: String(e) }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
