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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { school_level, action } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    if (action === "generate") {
      const previousLevel = PREVIOUS_LEVEL_MAP[school_level];
      let chaptersContext = "";

      if (school_level === "5eme_primaire") {
        chaptersContext = "برنامج الرياضيات للمستوى الابتدائي";
      } else if (previousLevel) {
        const { data: chapters } = await supabase.from("chapters").select("title_ar, lessons(title_ar)").eq("school_level", previousLevel).eq("subject", "math");
        if (chapters && chapters.length > 0) {
          chaptersContext = chapters.map(ch => `${ch.title_ar}: ${(ch.lessons as any[] || []).map(l => l.title_ar).join("، ")}`).join("\n");
        }
      }

      const prompt = `أنت معلم رياضيات جزائري. أنشئ 5 أسئلة QCM بالعربية لتقييم طالب ينتقل لمستوى ${school_level}.
      أجب بـ JSON فقط: {"questions": [{"question": "...", "options": ["...", "...", "...", "..."], "correct_index": 0, "chapter_ref": "...", "explanation": "..."}]}`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "You are an expert Algerian math teacher. Always respond with valid JSON only." },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) throw new Error("Limite de requêtes dépassée, réessayez plus tard.");
        if (response.status === 402) throw new Error("Crédits épuisés, ajoutez des crédits à votre workspace Lovable.");
        const t = await response.text();
        throw new Error(`AI Gateway error: ${response.status} ${t}`);
      }

      const result = await response.json();
      let content = result.choices?.[0]?.message?.content || "";
      content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);

      return new Response(JSON.stringify({ questions: parsed.questions, success: true, model: "lovable-ai" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ error: "Action non supportée" }), { status: 400, headers: corsHeaders });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message, success: false }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
