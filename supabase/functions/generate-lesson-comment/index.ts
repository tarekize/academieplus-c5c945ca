// Generate Arabic personalized AI comment after a study session
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function fallbackMessage(lessonTitle: string, levelBefore: number, levelAfter: number, correct: number, total: number) {
  const acc = total > 0 ? Math.round((correct / total) * 100) : 0;
  const lesson = lessonTitle ? `في درس "${lessonTitle}"` : 'في هذا الدرس';
  if (levelAfter < levelBefore) {
    return `📉 يبدو أنّك واجهت بعض الصعوبات ${lesson}. أجبت بشكل صحيح على ${correct} من ${total} سؤالاً (${acc}%)، وانخفض مستواك من ${levelBefore} إلى ${levelAfter} من 100.\n\nلا تقلق، هذا جزء طبيعي من التعلم. أنصحك بإعادة قراءة الدرس بتركيز، والتوقف عند الأمثلة المحلولة لفهم الخطوات. ثم اضغط على "تجديد" لتحصل على تمارين أسهل تساعدك على بناء الأساس بثقة. 💪`;
  }
  if (levelAfter > levelBefore) {
    return `🌟 أحسنت! تقدّم واضح ${lesson}. أجبت بشكل صحيح على ${correct} من ${total} سؤالاً (${acc}%)، وارتفع مستواك من ${levelBefore} إلى ${levelAfter} من 100.\n\nاستمر بهذه الوتيرة وحافظ على المراجعة المنتظمة. اضغط على "تجديد" لتجرّب تمارين أكثر تحديًا وتثبّت ما تعلّمته. 🚀`;
  }
  return `🤖 أداء ثابت ${lesson}. أجبت بشكل صحيح على ${correct} من ${total} سؤالاً (${acc}%)، ومستواك مستقر عند ${levelAfter} من 100.\n\nحاول التركيز على الأسئلة التي ترددت فيها، وراجع القاعدة المرتبطة بها. ثم اضغط "تجديد" لتمارين جديدة تساعدك على التقدّم خطوة إضافية. ✨`;
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
    const fallback = fallbackMessage(lesson_title, level_before, level_after, session_correct, session_total);

    if (!apiKey) {
      return new Response(JSON.stringify({ message: fallback, direction, fallback: true, error: 'API_KEY_MISSING' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `أنت معلّم رياضيات عربي ودود، تخاطب طالباً جزائرياً مباشرةً بصيغة "أنت".
مهمتك: كتابة تعليق تربوي قصير (4 إلى 6 أسطر) باللغة العربية الفصحى البسيطة، يشرح للطالب أين هو الآن وكيف يتقدّم في هذا الدرس.

قواعد إلزامية:
- خاطب الطالب مباشرةً (أنت، حاول، أحسنت...).
- ابدأ بجملة تشجيع أو ملاحظة دافئة (حسب تقدّمه أو تراجعه).
- اذكر الأرقام بشكل طبيعي داخل الجملة (المستوى قبل/بعد، نسبة النجاح).
- أعطِ نصيحة عملية واحدة أو اثنتين مرتبطة بالدرس (مثلاً: راجع التعريف، أعد قراءة المثال، انتبه إلى الإشارات...).
- اختم بدعوة لطيفة للضغط على زر "تجديد".
- ممنوع منعاً باتاً: نسخ نصوص الأسئلة، عرض قائمة أسئلة، استعمال HTML أو نقاط (•/-).
- استعمل رمزاً تعبيرياً واحداً في البداية فقط.
- اجعل النبرة إنسانية، ليست آلية ولا تقريراً.`;

    let situation = '';
    if (direction === 'down') situation = `تراجع مستواه من ${level_before}/100 إلى ${level_after}/100. يحتاج إلى الطمأنة وإلى نصيحة لمراجعة الأساسيات.`;
    else if (direction === 'up') situation = `تقدّم مستواه من ${level_before}/100 إلى ${level_after}/100. يستحق التشجيع ودعوته لرفع التحدي.`;
    else situation = `مستواه مستقر عند ${level_after}/100. يحتاج إلى دفعة لمواصلة التقدّم.`;

    const userPrompt = `معلومات الجلسة (لا تذكرها كقائمة، استعملها للسياق فقط):
- اسم الدرس: "${lesson_title}"
- اسم الفصل: "${chapter_title}"
- ${situation}
- نسبة الإجابات الصحيحة في هذه الجلسة: ${session_correct}/${session_total} (${accuracy}%)

اكتب الآن التعليق التربوي الموجّه للطالب وفق القواعد المذكورة في تعليمات النظام. لا تذكر أي نص سؤال.`;

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
