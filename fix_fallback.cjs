const fs = require('fs');
let content = fs.readFileSync('supabase/functions/generate-adaptive-content/index.ts', 'utf8');

const regex = /let rawContent = "";\s*\/\/ Provider 1: Gemini\s*try \{\s*console\.log\("Trying Gemini for content generation\.\.\."\);\s*rawContent = await callGemini\(system, user\);\s*\} catch \(e\) \{\s*console\.error\("Gemini failed, trying Groq\.\.\.", e\);\s*\/\/ Provider 2: Groq\s*try \{\s*console\.log\("Trying Groq\.\.\."\);\s*rawContent = await callGroq\(system, user\);\s*\} catch \(e2\) \{\s*console\.error\("Groq failed, trying Cloudflare\.\.\.", e2\);\s*\/\/ Provider 3: Cloudflare\s*try \{\s*console\.log\("Trying Cloudflare\.\.\."\);\s*rawContent = await callCloudflare\(system, user\);\s*\} catch \(e3\) \{\s*console\.error\("All providers failed:", e3\);\s*return new Response\(\s*JSON\.stringify\(\{ error: "Tous les services IA sont actuellement indisponibles\. Veuillez rÃ©essayer plus tard\." \}\),\s*\{ status: 503, headers: \{ \.\.\.corsHeaders, "Content-Type": "application\/json" \} \}\s*\);\s*\}\s*\}\s*\}/;

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

if (!regex.test(content)) {
    console.log("Regex didn't match. Printing what is around block.");
    const match = /let rawContent = "";[\s\S]*?(?=\s+\/\/ Strip markdown)/.exec(content);
    console.log(match ? match[0] : "Nothing matched");
} else {
    content = content.replace(regex, newBlock);
    fs.writeFileSync('supabase/functions/generate-adaptive-content/index.ts', content);
    console.log("Successfully replaced fallback block!");
}
