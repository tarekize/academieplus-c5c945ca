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

async function tryModels(prompt: string, apiKey: string) {
  // Liste des modèles du plus probable au moins probable pour le quota gratuit
  const models = ["gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-pro"];
  const errors = [];

  for (const model of models) {
    try {
      console.log(`Tentative avec ${model}...`);
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });

      const data = await resp.json();
      if (resp.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return { text: data.candidates[0].content.parts[0].text, model };
      }

      const msg = data.error?.message || "Erreur inconnue";
      console.warn(`Modèle ${model} échoué: ${msg}`);
      errors.push(`${model}: ${msg}`);
    } catch (e) {
      errors.push(`${model}: ${e.message}`);
    }
  }
  throw new Error(`Tous les modèles ont échoué. Détails: ${errors.join(" | ")}`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { school_level, action } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!GEMINI_API_KEY) throw new Error("Clé AI manquante");

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

      const result = await tryModels(prompt, GEMINI_API_KEY);

      const content = result.text.replace(/```json/g, "").replace(/```/g, "").trim();
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);

      return new Response(JSON.stringify({ questions: parsed.questions, success: true, model: result.model }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ error: "Action non supportée" }), { status: 400, headers: corsHeaders });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message, success: false }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
