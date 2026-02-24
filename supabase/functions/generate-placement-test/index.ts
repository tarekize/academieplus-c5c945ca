import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PREVIOUS_LEVEL_MAP: Record<string, string> = {
  "1ere_cem": "5eme_primaire",
  "2eme_cem": "1ere_cem",
  "3eme_cem": "2eme_cem",
  "4eme_cem": "3eme_cem",
  "premiere": "4eme_cem",
  "seconde": "premiere",
  "terminale": "seconde",
};

// Appel à l'IA Lovable (même modèle que lovable-chat qui fonctionne)
async function callLovableAI(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    if (response.status === 429) throw new Error("Limite de requêtes dépassée, réessayez plus tard.");
    if (response.status === 402) throw new Error("Crédits épuisés, ajoutez des crédits à votre workspace Lovable.");
    throw new Error(`Lovable AI error: ${response.status} — ${text}`);
  }

  const result = await response.json();
  return result.choices?.[0]?.message?.content || "";
}

// Extraire le JSON de la réponse de l'IA (gère les blocs markdown)
function extractJSON(raw: string): any {
  let cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) cleaned = match[0];
  return JSON.parse(cleaned);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { school_level, action, answers, student_name } = body;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY n'est pas configurée");
    if (!school_level) throw new Error("school_level est requis");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ──────────────────────────────────────────────────
    // ACTION: generate — génère 5 questions QCM
    // ──────────────────────────────────────────────────
    if (action === "generate") {
      const previousLevel = PREVIOUS_LEVEL_MAP[school_level];
      let chaptersContext = "";

      if (school_level === "5eme_primaire") {
        chaptersContext = "برنامج الرياضيات للمستوى الابتدائي (العمليات الأساسية، الأعداد، الهندسة)";
      } else if (previousLevel) {
        const { data: chapters } = await supabase
          .from("chapters")
          .select("title_ar, lessons(title_ar)")
          .eq("school_level", previousLevel)
          .eq("subject", "math");
        if (chapters && chapters.length > 0) {
          chaptersContext = chapters
            .map((ch: any) => `${ch.title_ar}: ${(ch.lessons as any[] || []).map((l: any) => l.title_ar).join("، ")}`)
            .join("\n");
        }
      }

      if (!chaptersContext) {
        chaptersContext = "الرياضيات العامة للمستوى المتوسط والثانوي";
      }

      const prompt = `أنت معلم رياضيات جزائري متمرس.
المهمة: أنشئ 5 أسئلة اختيار من متعدد (QCM) باللغة العربية لتقييم مستوى طالب في مرحلة الانتقال إلى مستوى: ${school_level}.
محتوى البرنامج المرجعي للسنة الماضية:
${chaptersContext}

قواعد:
- كل سؤال يجب أن يكون واضحاً ومحدداً
- 4 خيارات لكل سؤال (خيار واحد صحيح فقط)
- correct_index: رقم الخيار الصحيح (0 إلى 3)
- explanation: تفسير الجواب الصحيح بالعربية

أجب بـ JSON فقط بهذا الشكل الصارم:
{"questions": [{"question": "...", "options": ["...", "...", "...", "..."], "correct_index": 0, "chapter_ref": "...", "explanation": "..."}]}`;

      const raw = await callLovableAI(
        LOVABLE_API_KEY,
        "You are an expert Algerian math teacher. Always respond with valid JSON only. No markdown, no explanation outside the JSON.",
        prompt
      );

      const parsed = extractJSON(raw);

      if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        throw new Error("L'IA n'a pas retourné de questions valides.");
      }

      return new Response(
        JSON.stringify({ questions: parsed.questions, success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ──────────────────────────────────────────────────
    // ACTION: evaluate — analyse les réponses
    // ──────────────────────────────────────────────────
    if (action === "evaluate") {
      if (!answers || !Array.isArray(answers)) {
        throw new Error("Les réponses (answers) sont requises pour l'évaluation.");
      }

      const correctCount = answers.filter((a: any) => a.correct).length;
      const total = answers.length;
      const percentage = Math.round((correctCount / total) * 100);

      const answersText = answers
        .map((a: any, i: number) =>
          `السؤال ${i + 1}: ${a.question}\nالجواب: ${a.selected_index} | صحيح: ${a.correct} | المرجع: ${a.chapter_ref}`
        )
        .join("\n---\n");

      const prompt = `أنت معلم رياضيات جزائري خبير في التقييم.
الطالب${student_name ? ` (${student_name})` : ""} أجاب على ${total} سؤالاً وأصاب في ${correctCount} (${percentage}%).

تفاصيل الإجابات:
${answersText}

أنشئ تقرير تقييم مفصل باللغة العربية.
أجب بـ JSON فقط:
{"level_label": "مستوى ممتاز / جيد جداً / جيد / متوسط / ضعيف", "summary": "ملخص (2-3 جمل)", "strengths": ["..."], "improvements": ["..."], "advice": "نصيحة شخصية"}`;

      const raw = await callLovableAI(
        LOVABLE_API_KEY,
        "You are an expert educational evaluator. Respond with valid JSON only.",
        prompt
      );

      const report = extractJSON(raw);

      return new Response(
        JSON.stringify({ report, score: correctCount, total, success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: `Action non supportée: "${action}"` }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("generate-placement-test error:", message);
    return new Response(
      JSON.stringify({ error: message, success: false }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
