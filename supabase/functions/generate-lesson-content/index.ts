import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { lesson_id } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: lesson } = await supabase.from("lessons").select("title, title_ar, chapter_id").eq("id", lesson_id).single();
    const { data: chapter } = await supabase.from("chapters").select("title_ar, school_level").eq("id", lesson?.chapter_id).single();

    const prompt = `أنت أستاذ رياضيات جزائري. اكتب درس بالتفصيل باللغة العربية (HTML) لدرس: ${lesson?.title_ar || lesson?.title}. استخدم h2 و h3.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an expert Algerian math teacher. Write detailed lessons in Arabic HTML format." },
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
    content = content.replace(/```html\n?/g, "").replace(/```\n?/g, "").trim();

    await supabase.from("lessons").update({ content }).eq("id", lesson_id);

    return new Response(JSON.stringify({ success: true, model_used: "lovable-ai" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message, success: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
