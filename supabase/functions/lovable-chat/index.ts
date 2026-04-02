import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function tryOpenRouter(apiKey: string, messages: any[], stream: boolean) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://academieplus.app",
      "X-Title": "AcademiePlus",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages,
      stream,
    }),
  });
  if (!response.ok) {
    const t = await response.text();
    throw new Error(`OpenRouter ${response.status}: ${t}`);
  }
  return response;
}

async function tryLovableAI(apiKey: string, messages: any[], stream: boolean) {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages,
      stream,
    }),
  });
  if (!response.ok) {
    const t = await response.text();
    throw new Error(`LovableAI ${response.status}: ${t}`);
  }
  return response;
}

async function tryGemini(apiKey: string, messages: any[], stream: boolean) {
  const contents = messages.map((m: any) => ({
    role: m.role === "system" ? "user" : m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:${stream ? "streamGenerateContent" : "generateContent"}?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents }),
  });
  
  if (!response.ok) {
    const t = await response.text();
    throw new Error(`Gemini ${response.status}: ${t}`);
  }
  return response;
}

async function callAIWithFallback(messages: any[], stream: boolean): Promise<{ response: Response; provider: string; isGeminiDirect: boolean }> {
  const openrouterKey = Deno.env.get("OPENROUTER_API_KEY");
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const geminiKey = Deno.env.get("GEMINI_API_KEY");

  if (openrouterKey) {
    try {
      console.log("Trying OpenRouter...");
      const resp = await tryOpenRouter(openrouterKey, messages, stream);
      console.log("OpenRouter succeeded");
      return { response: resp, provider: "openrouter", isGeminiDirect: false };
    } catch (e) {
      console.error("OpenRouter failed:", (e as Error).message);
    }
  }

  if (lovableKey) {
    try {
      console.log("Trying Lovable AI...");
      const resp = await tryLovableAI(lovableKey, messages, stream);
      console.log("Lovable AI succeeded");
      return { response: resp, provider: "lovable", isGeminiDirect: false };
    } catch (e) {
      console.error("Lovable AI failed:", (e as Error).message);
    }
  }

  if (geminiKey) {
    try {
      console.log("Trying Gemini direct...");
      const resp = await tryGemini(geminiKey, messages, false);
      console.log("Gemini direct succeeded");
      return { response: resp, provider: "gemini", isGeminiDirect: true };
    } catch (e) {
      console.error("Gemini direct failed:", (e as Error).message);
    }
  }

  throw new Error("Tous les services IA sont indisponibles. Veuillez réessayer plus tard.");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, subject, schoolLevel, chapterContext } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages array is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const normalizeSubject = (subjectName: string): string => {
      if (!subjectName) return "";
      return subjectName.toLowerCase().trim()
        .replace(/\s+/g, "-")
        .replace(/é/g, "e").replace(/è/g, "e").replace(/ê/g, "e")
        .replace(/à/g, "a").replace(/ç/g, "c");
    };

    const normalizedSubject = normalizeSubject(subject || "");

    // Récupérer le contenu du cours pour Histoire-Géographie
    let courseContent = "";
    if (normalizedSubject === "histoire-geographie") {
      const { data: chunks, error } = await supabase
        .from('course_content_chunks')
        .select('chapter_number, chapter_title, content')
        .eq('subject', 'histoire-geographie')
        .order('chapter_number', { ascending: true });

      if (!error && chunks && chunks.length > 0) {
        courseContent = "\n\n=== CONTENU DU COURS ===\n\n";
        chunks.forEach((chunk: any) => {
          courseContent += `\n## Chapitre ${chunk.chapter_number}: ${chunk.chapter_title}\n\n${chunk.content}\n\n`;
        });
      }
    }

    // === BUILD COURSE MAP for navigation links ===
    let courseMapPrompt = "";
    try {
      // Build query for chapters
      let chaptersQuery = supabase
        .from('chapters')
        .select('id, title, title_ar, school_level, subject, filiere_id')
        .eq('subject', subject === 'mathématiques' || subject === 'math' ? 'math' : normalizedSubject)
        .order('order_index', { ascending: true });

      if (schoolLevel) {
        chaptersQuery = chaptersQuery.eq('school_level', schoolLevel);
      }

      const { data: chaptersData } = await chaptersQuery;

      if (chaptersData && chaptersData.length > 0) {
        const chapterIds = chaptersData.map((c: any) => c.id);
        
        const { data: lessonsData } = await supabase
          .from('lessons')
          .select('id, title, title_ar, chapter_id, content')
          .in('chapter_id', chapterIds)
          .order('order_index', { ascending: true });

        const lessonsByChapter: Record<string, any[]> = {};
        (lessonsData || []).forEach((l: any) => {
          if (!lessonsByChapter[l.chapter_id]) lessonsByChapter[l.chapter_id] = [];
          lessonsByChapter[l.chapter_id].push(l);
        });

        // Determine subject path for URLs
        const subjectPath = subject === 'mathématiques' ? 'math' : normalizedSubject;

        courseMapPrompt = `\n\n=== CARTE DE NAVIGATION DES COURS ===
IMPORTANT : Quand un élève demande où se trouve un cours, une leçon, un sujet ou un concept :
- réponds dans la langue de l'élève
- réponds avec UNE phrase très courte seulement
- n'ajoute ni salutation, ni explication, ni résumé, ni liste, ni conseil
- utilise directement un lien cliquable au format [[NAV:Texte affiché|/cours/${subjectPath}?chapitre=CHAPTER_ID]]
- pour une leçon spécifique, utilise [[NAV:Texte affiché|/cours/${subjectPath}?chapitre=CHAPTER_ID&lecon=LESSON_ID]]
Exemples :
- Français : Voici le lien : [[NAV:Nom du cours|/cours/${subjectPath}?chapitre=CHAPTER_ID]]
- العربية : إليك رابط الدرس: [[NAV:اسم الدرس|/cours/${subjectPath}?chapitre=CHAPTER_ID]]

Voici la liste complète des chapitres et leçons disponibles :\n`;

        for (const ch of chaptersData) {
          const chTitle = ch.title + (ch.title_ar ? ` / ${ch.title_ar}` : '');
          courseMapPrompt += `\n📘 Chapitre: "${chTitle}" (ID: ${ch.id})`;
          courseMapPrompt += `\n   Lien: [[NAV:${ch.title}|/cours/${subjectPath}?chapitre=${ch.id}]]`;
          
          const lessons = lessonsByChapter[ch.id] || [];
          for (const les of lessons) {
            const lesTitle = les.title + (les.title_ar ? ` / ${les.title_ar}` : '');
            courseMapPrompt += `\n   📄 Leçon: "${lesTitle}" (ID: ${les.id})`;
            courseMapPrompt += `\n      Lien: [[NAV:${les.title}|/cours/${subjectPath}?chapitre=${ch.id}&lecon=${les.id}]]`;
            
            // Extract headings from lesson content for deeper navigation
            if (les.content) {
              const headingMatches = les.content.match(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/gi);
              if (headingMatches) {
                const headings = headingMatches
                  .map((h: string) => h.replace(/<[^>]+>/g, '').trim())
                  .filter((h: string) => h.length > 0)
                  .slice(0, 10); // Limit to 10 headings per lesson
                if (headings.length > 0) {
                  courseMapPrompt += `\n      Sections: ${headings.join(', ')}`;
                }
              }
            }
          }
        }

        courseMapPrompt += `\n\nINSTRUCTIONS DE NAVIGATION :
1. Pour toute demande d'emplacement, retourne au moins un lien [[NAV:...]]
2. Si plusieurs résultats sont plausibles, donne au maximum 3 liens
3. Le texte affiché du lien doit être court : seulement le titre du chapitre ou de la leçon
4. Cherche dans les titres ET dans les sections de contenu pour trouver le bon emplacement
5. Si le concept est dans une section d'une leçon, dirige vers cette leçon avec le lien approprié
6. Pour une demande d'emplacement, ne donne aucun texte supplémentaire inutile\n`;
      }
    } catch (err) {
      console.error("Error building course map:", err);
    }

    const subjectPrompts: Record<string, string> = {
      mathematiques: `Tu es un professeur de mathématiques pédagogue et bienveillant. 
RÈGLES IMPORTANTES :
1. Tu ne réponds QU'AUX QUESTIONS DE MATHÉMATIQUES
2. Pour toute question non-mathématique, réponds poliment que tu ne peux traiter que les questions de mathématiques
3. Détecte automatiquement la langue de la question et réponds dans cette MÊME langue
4. Si la question est en arabe, réponds en arabe
5. Si la question est en français, réponds en français
6. N'utilise JAMAIS de syntaxe LaTeX. Écris toutes les formules en texte clair
**FORMATAGE MARKDOWN OBLIGATOIRE** :
- Utilise des **titres** ## pour les sections
- Mets en **gras** les formules et concepts importants
- Utilise des *italiques* pour les astuces
- Utilise des listes à puces et > blockquotes
STRUCTURE : Comprendre → Concepts clés → Résolution → Réponse finale → Conseil → Exercice similaire`,

      anglais: `Tu es un professeur d'anglais expert. Tu ne réponds QU'AUX QUESTIONS D'ANGLAIS. Détecte la langue et réponds dans cette langue.`,
      "physique-chimie": `Tu es un professeur de physique-chimie expert. Tu ne réponds QU'AUX QUESTIONS DE PHYSIQUE ET CHIMIE. Détecte la langue et réponds dans cette langue.`,
      svt: `Tu es un professeur de SVT expert. Tu ne réponds QU'AUX QUESTIONS DE SVT. Détecte la langue et réponds dans cette langue.`,
      "histoire-geographie": `Tu es un professeur d'histoire-géographie expert. Tu ne réponds QU'AUX QUESTIONS D'HISTOIRE ET DE GÉOGRAPHIE. Détecte la langue et réponds dans cette langue.${courseContent}`,
      francais: `Tu es un professeur de français expert. Tu ne réponds QU'AUX QUESTIONS DE LANGUE FRANÇAISE. Détecte la langue et réponds dans cette langue.`,
      philosophie: `Tu es un professeur de philosophie expert. Tu ne réponds QU'AUX QUESTIONS DE PHILOSOPHIE. Détecte la langue et réponds dans cette langue.`,
    };

    let systemPrompt = subjectPrompts[normalizedSubject] ||
      `Tu es un professeur expert et bienveillant. Détecte la langue de la question et réponds dans cette MÊME langue. Sois pédagogue et encourageant.`;

    // Add course navigation map
    systemPrompt += courseMapPrompt;

    // If chapter context is provided, restrict answers to that chapter
    if (chapterContext && chapterContext.title) {
      const chapterRestriction = `

CONTEXTE DU CHAPITRE ACTUEL : "${chapterContext.title}"
${chapterContext.lessonsContent ? `CONTENU DES LEÇONS DU CHAPITRE :\n${chapterContext.lessonsContent}` : ""}

 RÈGLE ABSOLUE : Tu ne dois répondre QU'AUX QUESTIONS qui sont en rapport avec le contenu de ce chapitre ("${chapterContext.title}").
 EXCEPTION : si l'élève demande où trouver un cours, une leçon, un titre ou un concept, tu peux répondre avec un lien de navigation même si ce contenu est hors du chapitre actuel.
Si l'élève pose une question qui n'est PAS liée à ce chapitre, tu dois répondre poliment :
- En français : "Cette question ne fait pas partie du chapitre actuel (${chapterContext.title}). Je ne peux répondre qu'aux questions en rapport avec ce chapitre."
- En arabe : "هذا السؤال خارج نطاق الفصل الحالي (${chapterContext.title}). يمكنني فقط الإجابة على الأسئلة المتعلقة بهذا الفصل."
Utilise la même langue que celle de l'élève pour cette réponse.`;
      systemPrompt += chapterRestriction;
    }

    console.log("Subject:", normalizedSubject, "| Calling AI with fallback chain...");

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    const { response, provider, isGeminiDirect } = await callAIWithFallback(aiMessages, true);
    console.log("AI response from provider:", provider);

    if (isGeminiDirect) {
      const geminiData = await response.json();
      const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "Désolé, je n'ai pas pu générer de réponse.";
      
      const sseData = `data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\ndata: [DONE]\n\n`;
      
      return new Response(sseData, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
      });
    }

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    console.error("Chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
