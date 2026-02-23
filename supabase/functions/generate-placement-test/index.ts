import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mapping: current level → previous level for test
const PREVIOUS_LEVEL_MAP: Record<string, string> = {
  "1ere_cem": "5eme_primaire",
  "2eme_cem": "1ere_cem",
  "3eme_cem": "2eme_cem",
  "4eme_cem": "3eme_cem",
  "premiere": "4eme_cem",
  "seconde": "premiere",
  "terminale": "seconde",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { school_level, action, answers, chapters_info, student_name } = await req.json();

    if (action === "generate") {
      // Get previous level
      const previousLevel = PREVIOUS_LEVEL_MAP[school_level] || school_level;

      // Fetch chapters from previous level
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

      const chaptersRes = await fetch(
        `${supabaseUrl}/rest/v1/chapters?school_level=eq.${previousLevel}&subject=eq.math&select=id,title,title_ar,lessons(title,title_ar)&order=order_index`,
        {
          headers: {
            "apikey": supabaseKey,
            "Authorization": `Bearer ${supabaseKey}`,
          },
        }
      );
      const chapters = await chaptersRes.json();

      if (!chapters || chapters.length === 0) {
        return new Response(JSON.stringify({
          questions: [],
          error: "No chapters found for previous level"
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Build context for AI
      const chaptersContext = chapters.map((ch: any) => {
        const lessonTitles = (ch.lessons || []).map((l: any) => l.title_ar || l.title).join("، ");
        return `${ch.title_ar || ch.title}: ${lessonTitles}`;
      }).join("\n");

      // Generate 5 questions using AI
      const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
      if (!lovableApiKey) {
        throw new Error("LOVABLE_API_KEY not configured");
      }

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${lovableApiKey}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `أنت معلم رياضيات جزائري. أنشئ 5 أسئلة اختيار من متعدد باللغة العربية لتقييم مستوى الطالب بناءً على برنامج السنة السابقة. كل سؤال يجب أن يكون واضحاً ومحدداً.

أجب بصيغة JSON فقط بدون أي نص إضافي:
{
  "questions": [
    {
      "question": "نص السؤال",
      "options": ["الخيار 1", "الخيار 2", "الخيار 3", "الخيار 4"],
      "correct_index": 0,
      "chapter_ref": "اسم الفصل المرجعي",
      "explanation": "شرح الإجابة الصحيحة"
    }
  ]
}`
            },
            {
              role: "user",
              content: `أنشئ 5 أسئلة تقييم لطالب ينتقل من المستوى ${previousLevel} بناءً على الفصول التالية:\n${chaptersContext}`
            }
          ],
          temperature: 0.7,
        }),
      });

      const aiData = await aiResponse.json();
      let content = aiData.choices?.[0]?.message?.content || "";

      // Parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse AI response");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return new Response(JSON.stringify({
        questions: parsed.questions,
        previous_level: previousLevel,
        chapters_used: chapters.map((ch: any) => ({ title: ch.title, title_ar: ch.title_ar })),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "evaluate") {
      // Generate AI evaluation report
      const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
      if (!lovableApiKey) throw new Error("LOVABLE_API_KEY not configured");

      const score = answers.filter((a: any) => a.correct).length;
      const total = answers.length;
      const answersDetail = answers.map((a: any, i: number) =>
        `السؤال ${i + 1}: ${a.correct ? "✓ صحيح" : "✗ خطأ"} - ${a.question} (الفصل: ${a.chapter_ref})`
      ).join("\n");

      // Use student name if provided, otherwise use generic "الطالب"
      const studentName = student_name || "الطالب";

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${lovableApiKey}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `أنت معلم رياضيات جزائري. قدم تقريراً مختصراً وشخصياً عن مستوى الطالب باللغة العربية. كن مشجعاً وبنّاءً. أجب بصيغة JSON:

استخدم اسم الطالب في النصيحة: "${studentName}"

{
  "level_label": "ممتاز/جيد جداً/جيد/متوسط/يحتاج تحسين",
  "summary": "ملخص قصير عن مستوى الطالب",
  "strengths": ["نقطة قوة 1", "نقطة قوة 2"],
  "improvements": ["نقطة تحسين 1", "نقطة تحسين 2"],
  "advice": "نصيحة شخصية للطالب باستخدام اسمه ${studentName}"
}`
            },
            {
              role: "user",
              content: `الطالب ${studentName} في المستوى ${school_level} حصل على ${score}/${total}.\n\nتفاصيل الإجابات:\n${answersDetail}`
            }
          ],
          temperature: 0.7,
        }),
      });

      const aiData = await aiResponse.json();
      let content = aiData.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Failed to parse AI evaluation");

      const report = JSON.parse(jsonMatch[0]);

      return new Response(JSON.stringify({
        score,
        total,
        report,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
