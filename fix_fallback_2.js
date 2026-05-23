import fs from 'fs';
let content = fs.readFileSync('supabase/functions/generate-adaptive-content/index.ts', 'utf8');

const regex = /let rawContent = "";[\s\S]*?(?=\s+\/\/ Strip markdown code fences if present)/;

const newBlock = `let rawContent = "";

    try {
      console.log("Trying Lovable AI for content generation...");
      rawContent = await callLovableAI(system, user);
    } catch (e) {
      console.error("Lovable AI failed, trying Gemini (Key 1)...", e);
      try {
        console.log("Trying Gemini (Key 1)...");
        rawContent = await callGemini(system, user);
      } catch (e2) {
        console.error("Gemini (Key 1) failed, trying Gemini (Key 2)...", e2);
        try {
          console.log("Trying Gemini (Key 2)...");
          rawContent = await callGemini2(system, user);
        } catch (e3) {
          console.error("All providers failed:", e3);
          return new Response(
            JSON.stringify({ error: "Tous les services IA sont actuellement indisponibles. Veuillez rÃ©essayer plus tard." }),
            { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }`;

content = content.replace(regex, newBlock);
fs.writeFileSync('supabase/functions/generate-adaptive-content/index.ts', content);
console.log("Replaced!");
