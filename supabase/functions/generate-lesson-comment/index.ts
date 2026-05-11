// Generate Arabic personalized AI comment after a study session
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function fallbackMessage(levelBefore: number, levelAfter: number, correct: number, total: number) {
  const acc = total > 0 ? Math.round((correct / total) * 100) : 0;
  if (levelAfter < levelBefore) {
    return `📉 لاحظت أن مستواك انخفض من ${levelBefore}/100 إلى ${levelAfter}/100.\nأجبت على ${correct} من أصل ${total} (${acc}%).\nراجع الدرس بهدوء ثم اضغط "تجديد" للحصول على تمارين أسهل.`;
  }
  if (levelAfter > levelBefore) {
    return `🌟 ممتاز! مستواك تحسّن من ${levelBefore}/100 إلى ${levelAfter}/100.\nأجبت على ${correct} من أصل ${total} (${acc}%).\nواصل التدريب واضغط "تجديد" لتحديات جديدة.`;
  }
  return `🤖 مستواك مستقر عند ${levelAfter}/100.\nأجبت على ${correct} من أصل ${total} (${acc}%).\nواصل التدريب واضغط "تجديد" لمحتوى جديد.`;
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
      session_correct = 0,
      session_total = 0,
      lesson_link = '',
    } = body;

    const delta = level_after - level_before;
    const direction = delta > 0 ? 'up' : delta < 0 ? 'down' : 'same';
    const accuracy = session_total > 0 ? Math.round((session_correct / session_total) * 100) : 0;

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    const fallback = fallbackMessage(level_before, level_after, session_correct, session_total);

    if (!apiKey) {
      return new Response(JSON.stringify({ message: fallback, direction, fallback: true, error: 'API_KEY_MISSING' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `أنت مساعد تربوي ذكي لطالب جزائري. اكتب تعليقاً تربويّاً قصيراً (3 إلى 5 أسطر) باللغة العربية الفصحى الواضحة، بنبرة لطيفة ومحفّزة.
قواعد إلزامية:
- لا تنسخ نصوص الأسئلة حرفياً ولا تذكرها كقائمة.
- بدلاً من ذلك، استخرج الفكرة العامة (المفاهيم أو المهارات) من الأسئلة المعطاة وعبّر عنها بكلماتك أنت بشكل مختصر.
- اذكر مستوى الطالب بالأرقام (قبل/بعد) ونسبة الإجابات الصحيحة.
- أعطِ نصيحة عملية واحدة محدّدة.
- اختم بدعوة للضغط على زر "تجديد" للحصول على تمارين مناسبة.
- استخدم رمزاً تعبيرياً واحداً أو اثنين فقط في البداية.
- لا تستعمل قوائم نقطية ولا روابط HTML.`;

    const weakList = (weak_concepts as string[]).slice(0, 5).join(' | ') || 'لا شيء محدد';
    const strongList = (strong_concepts as string[]).slice(0, 5).join(' | ') || 'لا شيء محدد';

    let situation = '';
    if (direction === 'down') situation = `انخفض مستواه من ${level_before}/100 إلى ${level_after}/100. يحتاج إلى مراجعة الأساسيات.`;
    else if (direction === 'up') situation = `تحسّن مستواه من ${level_before}/100 إلى ${level_after}/100. أحسن أداءً.`;
    else situation = `مستواه مستقر عند ${level_after}/100.`;

    const userPrompt = `معلومات الجلسة:
- الدرس: "${lesson_title}" — الفصل: "${chapter_title}"
- ${situation}
- نسبة الإجابات الصحيحة: ${session_correct}/${session_total} (${accuracy}%)
- أمثلة من الأسئلة التي أخطأ فيها (للسياق فقط، لا تنسخها): ${weakList}
- أمثلة من الأسئلة التي أجاب عنها بشكل صحيح (للسياق فقط، لا تنسخها): ${strongList}

اكتب الآن التعليق التربوي وفق القواعد المذكورة في تعليمات النظام.`;

    const aiResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
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
