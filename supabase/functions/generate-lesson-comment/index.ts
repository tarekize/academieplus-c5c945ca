// Generate Arabic personalized AI comment after a study session.
// The AI identifies the student's weak concepts (lacunes) and gives,
// for each one, a short explanation + a simple example + its solution,
// using LaTeX math ($...$ and $$...$$) and Markdown formatting.
import { logTokenUsageAsync, resolveCallerRoleGroup } from "../_shared/tokenLogger.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function fallbackMessage(lessonTitle: string, levelBefore: number, levelAfter: number, correct: number, total: number, _weak: string[]) {
  const acc = total > 0 ? Math.round((correct / total) * 100) : 0;
  const lesson = lessonTitle ? `درس **"${lessonTitle}"**` : 'هذا الدرس';
  const emoji = levelAfter < levelBefore ? '📉' : levelAfter > levelBefore ? '📈' : '📊';
  const obs = levelAfter < levelBefore
    ? `لاحظت أن مستواك يحتاج دعماً في ${lesson}. نسبة النجاح الحالية **${acc}%** والمستوى **${levelAfter}/100**.`
    : levelAfter > levelBefore
      ? `أداء جيّد في ${lesson}! نسبة النجاح الحالية **${acc}%** والمستوى **${levelAfter}/100**.`
      : `أداؤك مستقر في ${lesson}. نسبة النجاح الحالية **${acc}%** والمستوى **${levelAfter}/100**.`;
  return `${emoji} ${obs}\n\n🎯 لمعالجة هذه الـ lacune، اضغط على زر **"بطاقة التطور"**.`;
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

    const geminiKey2 = Deno.env.get('GEMINI_API_KEY_2');
    const fallback = fallbackMessage(lesson_title, level_before, level_after, session_correct, session_total, weak_concepts);

    if (!geminiKey2) {
      return new Response(JSON.stringify({ message: fallback, direction, fallback: true, error: 'API_KEY_MISSING' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `أنت معلّم رياضيات عربي ودود يخاطب طالباً جزائرياً مباشرةً بصيغة "أنت".
مهمتك: كتابة **ملاحظة قصيرة جداً** (سطران أو ثلاثة فقط) باللغة العربية الفصحى البسيطة حول تطوّر الطالب في الدرس.

قواعد إلزامية صارمة:
- **ممنوع منعاً باتاً** إعطاء أمثلة، أو تمارين، أو حلول، أو شرح قواعد، أو خطوات رياضية.
- **ممنوع** ذكر "تجديد" أو أي زر آخر.
- **ممنوع** استعمال LaTeX أو معادلات رياضية.
- النص يجب أن يحتوي فقط على:
  1) سطر يصف وضع الطالب (تراجع/تقدّم/استقرار) مع ذكر اسم الدرس ونسبة النجاح والمستوى. ابدأه برمز تعبيري واحد (📉 إذا تراجع، 📈 إذا تقدّم، 📊 إذا استقر).
  2) سطر يدعو الطالب لمعالجة الـ lacune بالضغط على زر **"بطاقة التطور"**، يبدأ برمز 🎯.
- استخدم Markdown بسيط (**تأكيد** فقط) دون عناوين ولا قوائم.
- النبرة دافئة وقصيرة جداً. لا تتجاوز 3 أسطر إجمالاً.`;

    let situation = '';
    if (direction === 'down') situation = `تراجع مستواه من ${level_before}/100 إلى ${level_after}/100.`;
    else if (direction === 'up') situation = `تقدّم مستواه من ${level_before}/100 إلى ${level_after}/100.`;
    else situation = `مستواه مستقر عند ${level_after}/100.`;

    const userPrompt = `سياق الجلسة:
- الدرس: "${lesson_title}"
- الفصل: "${chapter_title}"
- ${situation}
- نسبة النجاح: ${session_correct}/${session_total} (${accuracy}%)

اكتب الآن **ملاحظة قصيرة فقط** (سطران أو ثلاثة) وفق التعليمات. لا تعطِ أي مثال أو حل أو شرح.`;


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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    resolveCallerRoleGroup(supabaseUrl, serviceRoleKey, req.headers.get('Authorization')).then(({ userId, roleGroup }) => {
      logTokenUsageAsync({ supabaseUrl, serviceRoleKey, userId, roleGroup, functionName: 'generate-lesson-comment', inputText: systemPrompt + '\n' + userPrompt });
    });

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
