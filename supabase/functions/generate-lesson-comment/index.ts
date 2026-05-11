// Generate Arabic personalized AI comment after a study session
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function fallbackMessage(levelBefore: number, levelAfter: number, weak: string[], strong: string[]) {
  if (levelAfter < levelBefore) {
    return `📉 لاحظت أن مستواك انخفض من ${levelBefore}/100 إلى ${levelAfter}/100.\nركّز على: ${weak.join('، ') || 'الأساسيات'}.\nراجع الدرس ثم اضغط على زر "تجديد" للحصول على تمارين وأسئلة مناسبة لمستواك.`;
  }
  if (levelAfter > levelBefore) {
    return `🌟 ممتاز! مستواك تحسّن من ${levelBefore}/100 إلى ${levelAfter}/100.\nنقاط قوتك: ${strong.join('، ') || 'تقدم عام'}.\nواصل التدريب واضغط "تجديد" لتحديات جديدة.`;
  }
  return `🤖 مستواك مستقر عند ${levelAfter}/100.\nواصل التدريب وراجع أخطاءك ثم اضغط "تجديد" للحصول على أسئلة مناسبة أكثر.`;
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
      lesson_link = '',
    } = body;

    const delta = level_after - level_before;
    const direction = delta > 0 ? 'up' : delta < 0 ? 'down' : 'same';

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    const fallback = fallbackMessage(level_before, level_after, weak_concepts as string[], strong_concepts as string[]);

    if (!apiKey) {
      return new Response(JSON.stringify({ message: fallback, direction, fallback: true, error: 'API_KEY_MISSING' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `أنت مساعد تربوي ذكي يكتب تعليقات قصيرة باللغة العربية لطالب جزائري. النبرة: لطيفة، محفّزة، إيجابية. استخدم رموز تعبيرية مناسبة. لا تتجاوز 4-5 أسطر.`;

    let userPrompt = '';
    if (direction === 'down') {
      userPrompt = `الطالب يدرس درس "${lesson_title}" في فصل "${chapter_title}". انخفض مستواه من ${level_before}/100 إلى ${level_after}/100.
المفاهيم الضعيفة: ${(weak_concepts as string[]).join('، ') || 'غير محددة'}.
اكتب تعليقاً يحدد نقاط الضعف، ينصح بمراجعة الدرس، ويطلب منه الذهاب إلى صفحة الدرس والنقر على زر "تجديد" للحصول على تمارين ملائمة. أضف الرابط: ${lesson_link}`;
    } else if (direction === 'up') {
      userPrompt = `الطالب يدرس درس "${lesson_title}" في فصل "${chapter_title}". تحسّن مستواه من ${level_before}/100 إلى ${level_after}/100.
نقاط القوة: ${(strong_concepts as string[]).join('، ') || 'تقدم عام'}.
نقاط ضعف متبقية: ${(weak_concepts as string[]).join('، ') || 'لا شيء كبير'}.
اكتب تعليقاً للتهنئة، اذكر نقاط القوة، أشر إلى ما يحتاج تحسيناً، وشجعه على الاستمرار.`;
    } else {
      userPrompt = `الطالب يدرس "${lesson_title}". مستواه مستقر عند ${level_after}/100. اكتب تعليقاً قصيراً يشجعه على المتابعة.`;
    }

    const aiResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
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
    const message = aiData.choices?.[0]?.message?.content?.trim() || 'استمر في التقدم!';

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
