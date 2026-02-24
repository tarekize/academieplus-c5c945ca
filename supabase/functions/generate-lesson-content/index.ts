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
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY manquante");

    // ÉTAPE DE DÉBOGAGE : Lister les modèles disponibles pour cette clé
    const listResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
    const listData = await listResp.json();

    if (!listResp.ok) {
      throw new Error(`Impossible de lister les modèles: ${JSON.stringify(listData.error)}`);
    }

    const availableModels = (listData.models || []).map((m: any) => m.name.replace("models/", ""));
    console.log("Modèles détectés:", availableModels);

    // On cherche un modèle flash ou pro dans la liste réelle renvoyée par Google
    const selectedModel = availableModels.find((m: string) => m.includes("2.0-flash") || m.includes("2.5-flash") || m.includes("flash") || m.includes("pro")) || availableModels[0];

    if (!selectedModel) throw new Error("Aucun modèle trouvé pour cette clé.");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: lesson } = await supabase.from("lessons").select("title, title_ar, chapter_id").eq("id", lesson_id).single();
    const { data: chapter } = await supabase.from("chapters").select("title_ar, school_level").eq("id", lesson?.chapter_id).single();

    const prompt = `أنت أستاذ رياضيات جزائري. اكتب درس بالتفصيل باللغة العربية (HTML) لدرس: ${lesson?.title_ar || lesson?.title}. استخدم h2 و h3.`;

    const genResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const result = await genResp.json();

    if (!genResp.ok) {
      throw new Error(`Erreur avec ${selectedModel}: ${result.error?.message || "Inconnue"}. Modèles dispo pour votre clé: ${availableModels.join(', ')}`);
    }

    let content = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    content = content.replace(/```html\n?/g, "").replace(/```\n?/g, "").trim();

    await supabase.from("lessons").update({ content }).eq("id", lesson_id);

    return new Response(JSON.stringify({ success: true, model_used: selectedModel }), { headers: corsHeaders });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message, success: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
