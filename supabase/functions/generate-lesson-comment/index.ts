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

  const body = weak.length === 0
    ? `\n\nواصل التدريب واضغط **"تجديد"** للحصول على تمارين مناسبة لمستواك. 🚀`
    : `\n\n### 🎯 نقاط تحتاج إلى تعزيز\nراجع الأمثلة المحلولة في الدرس ثم اضغط **"تجديد"** للحصول على تمارين مكيّفة لمستواك. 💪`;
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
      wrong_questions = [],
      session_correct = 0,
      session_total = 0,
    } = body;

    const delta = level_after - level_before;
    const direction = delta > 0 ? 'up' : delta < 0 ? 'down' : 'same';
    const accuracy = session_total > 0 ? Math.round((session_correct / session_total) * 100) : 0;

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    const fallback = fallbackMessage(lesson_title, level_before, level_after, session_correct, session_total, weak_concepts);

    if (!apiKey) {
      return new Response(JSON.stringify({ message: fallback, direction, fallback: true, error: 'API_KEY_MISSING' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `أنت معلّم رياضيات عربي ودود يخاطب طالباً جزائرياً مباشرةً بصيغة "أنت".
مهمتك: كتابة تعليق تربوي شخصي باللغة العربية الفصحى البسيطة، يحلّل أداء الطالب ويعالج **كل سؤال أخطأ فيه** بمثال وحلٍّ مفصّل.

اكتب الإجابة بصيغة **Markdown** مع استعمال **LaTeX** للرياضيات:
- استخدم \`$...$\` للصيغ داخل السطر و \`$$...$$\` للصيغ المعروضة.
- استعمل عناوين \`###\`, تأكيد \`**...**\`, وقوائم عند الحاجة.

هيكل الإجابة الإلزامي:
1) فقرة افتتاحية قصيرة (سطران) دافئة، تذكر الدرس والمستوى والنسبة بشكل طبيعي. ابدأها برمز تعبيري واحد فقط.
2) إذا كانت هناك أسئلة أخطأ فيها الطالب (wrong_questions)، اكتب عنواناً: \`### 🎯 تصحيح أخطائك خطوة بخطوة\` ثم **لكل سؤال** قسماً مستقلاً يحتوي:
   - عنوان فرعي \`#### السؤال 1: <إعادة صياغة موجزة للسؤال>\`
   - **سؤالك:** أعد كتابة السؤال بصيغة LaTeX إن أمكن.
   - **إجابتك:** اذكر إجابة الطالب الخاطئة.
   - **الإجابة الصحيحة:** اذكرها بوضوح.
   - **لماذا أخطأت؟** سطر أو سطران يشرحان الخطأ الشائع.
   - **مثال مشابه محلول:** اكتب مثالاً قريباً من السؤال (ليس نفس السؤال) بصيغة LaTeX.
   - **الحل المفصّل:** خطوات مرقّمة (3 إلى 6 خطوات) بـ LaTeX، تنتهي بـ \`**الجواب: ...**\`.
3) خاتمة قصيرة (سطر واحد) تدعو الطالب للضغط على زر **"تجديد"** للحصول على تمارين مكيّفة.

قواعد إلزامية:
- يجب أن تعالج **كل سؤال** من قائمة wrong_questions بدون تجاهل أي واحد.
- استعمل LaTeX حقيقياً، لا تكتب الرياضيات كنص عادي.
- إذا لم يخطئ الطالب في أي سؤال، استبدل القسم 2 بقسم تشجيع \`### 🌟 ما أتقنته\` يلخّص بنقطتين ما أحسن فيه الطالب.
- استعمل رمزاً تعبيرياً واحداً في كل عنوان رئيسي فقط.
- لا تستعمل HTML.
- اجعل النبرة إنسانية، تشجيعية، واضحة، ومناسبة لتلميذ.`;

    let situation = '';
    if (direction === 'down') situation = `تراجع مستواه من ${level_before}/100 إلى ${level_after}/100. يحتاج إلى الطمأنة وإلى مراجعة الأساسيات.`;
    else if (direction === 'up') situation = `تقدّم مستواه من ${level_before}/100 إلى ${level_after}/100. يستحق التشجيع.`;
    else situation = `مستواه مستقر عند ${level_after}/100.`;

    const wrongList = (wrong_questions as Array<{ question?: string; user_answer?: string; correct_answer?: string; explanation?: string; type?: string }>)
      .filter(w => w && w.question).slice(0, 5);
    const strongList = (strong_concepts as string[]).filter(Boolean).slice(0, 5);

    const wrongBlock = wrongList.length
      ? wrongList.map((w, i) => `### السؤال ${i + 1} (${w.type || 'quiz'})
- نص السؤال: ${w.question}
- إجابة الطالب الخاطئة: ${w.user_answer ?? '—'}
- الإجابة الصحيحة: ${w.correct_answer ?? '—'}
- شرح متاح من قاعدة البيانات: ${w.explanation ?? '—'}`).join('\n\n')
      : '— لا توجد أسئلة خاطئة في هذه الجلسة.';

    const userPrompt = `سياق الجلسة (لا تكرّره حرفياً):
- الدرس: "${lesson_title}"
- الفصل: "${chapter_title}"
- ${situation}
- نسبة النجاح في هذه الجلسة: ${session_correct}/${session_total} (${accuracy}%)

الأسئلة التي أخطأ فيها الطالب — يجب أن تعالج كلًا منها بقسم مستقل (سؤالك / إجابتك / الإجابة الصحيحة / لماذا أخطأت / مثال مشابه محلول / الحل المفصّل):
${wrongBlock}

نقاط القوة الملاحظة (للسياق فقط):
${strongList.length ? strongList.map((s, i) => `${i + 1}. ${s}`).join('\n') : '— لا توجد بعد.'}

اكتب الآن التعليق التربوي الكامل بصيغة Markdown + LaTeX وفق التعليمات أعلاه.`;

    const aiResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.6,
      }),
    });

    if (!aiResp.ok) {
      const txt = await aiResp.text();
      console.error('AI comment service error:', aiResp.status, txt);
      return new Response(JSON.stringify({ message: fallback, direction, fallback: true, error: `AI_ERROR_${aiResp.status}` }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await aiResp.json();
    const message = aiData.choices?.[0]?.message?.content?.trim() || fallback;

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
