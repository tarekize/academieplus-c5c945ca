import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error("Failed to parse request body:", e);
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, subject } = body;
    if (!messages || !Array.isArray(messages)) {
      console.error("Missing or invalid messages array:", body);
      return new Response(JSON.stringify({ error: "Messages array is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GOOGLE_GEMINI_API_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY");

    if (!GOOGLE_GEMINI_API_KEY) {
      throw new Error("GOOGLE_GEMINI_API_KEY is not configured");
    }

    console.log("Calling Google Gemini API with messages:", messages);

    // Préparer le contenu pour Gemini
    const contents = messages.map((msg: any) => {
      if (typeof msg.content === "string") {
        return {
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        };
      } else {
        // Gérer les messages avec images
        const parts = msg.content.map((c: any) => {
          if (c.type === "text") {
            return { text: c.text };
          } else if (c.type === "image_url") {
            // Extraire les données base64
            const base64Data = c.image_url.url.split(",")[1];
            const mimeType = c.image_url.url.split(";")[0].split(":")[1];
            return {
              inline_data: {
                mime_type: mimeType,
                data: base64Data,
              },
            };
          }
        });
        return {
          role: msg.role === "assistant" ? "model" : "user",
          parts,
        };
      }
    });

    // Normaliser le nom de la matière pour correspondre aux clés
    const normalizeSubject = (subjectName: string): string => {
      if (!subjectName) return "";
      const normalized = subjectName.toLowerCase().trim()
        .replace(/\s+/g, "-")
        .replace(/é/g, "e")
        .replace(/è/g, "e")
        .replace(/ê/g, "e")
        .replace(/à/g, "a")
        .replace(/ç/g, "c");
      console.log("Subject normalization:", { original: subjectName, normalized });
      return normalized;
    };

    const normalizedSubject = normalizeSubject(subject || "");

    // Ajouter le prompt système personnalisé selon la matière
    const subjectPrompts: Record<string, string> = {
      mathematiques: `Tu es un professeur de mathématiques pédagogue et bienveillant. 

RÈGLES IMPORTANTES :
1. Tu ne réponds QU'AUX QUESTIONS DE MATHÉMATIQUES
2. Pour toute question non-mathématique, réponds poliment que tu ne peux traiter que les questions de mathématiques
3. Détecte automatiquement la langue de la question de l'utilisateur et réponds dans cette MÊME langue
4. Si la question est en arabe, réponds en arabe
5. Si la question est en français, réponds en français
6. Si la question est en anglais, réponds en anglais
7. Adapte-toi à n'importe quelle langue utilisée par l'étudiant
8. Tu peux analyser des images, PDF et documents contenant des équations mathématiques ou des exercices
9. Lorsqu'une image est fournie, analyse-la pour identifier les questions ou équations mathématiques et réponds-y
10. CRITIQUE : N'utilise JAMAIS de syntaxe LaTeX (comme $, $$, \\boxed, \\frac, etc.). Écris TOUTES les équations et formules mathématiques en texte clair

STRUCTURE DE RÉPONSE :
1. Reformule la question pour confirmer ta compréhension
2. Explique les concepts clés nécessaires
3. Détaille la résolution étape par étape
4. Donne la réponse finale claire
5. Propose un exercice similaire pour s'entraîner

Sois encourageant et patient dans tes explications.`,

      anglais: `Tu es un professeur d'anglais expert et bienveillant.

RÈGLE ABSOLUE - À RESPECTER IMPÉRATIVEMENT :
Tu ne réponds QU'AUX QUESTIONS D'ANGLAIS (grammaire, vocabulaire, compréhension, expression). Pour TOUTE question qui n'est PAS liée à l'anglais, tu DOIS REFUSER poliment en disant : "Désolé, je suis spécialisé uniquement en anglais. Je ne peux pas répondre aux questions sur d'autres sujets."

RÈGLES IMPORTANTES :
1. REFUSE SYSTÉMATIQUEMENT toute question de mathématiques, sciences, histoire ou tout autre sujet
2. N'accepte QUE les questions sur la grammaire anglaise, le vocabulaire anglais, la compréhension de textes anglais, l'expression anglaise
3. Détecte automatiquement la langue de la question et réponds dans cette langue pour expliquer les concepts anglais
4. Si la question est en français, explique en français
5. Si la question est en arabe, explique en arabe
6. Tu peux analyser des images ou documents avec du texte anglais

STRUCTURE DE RÉPONSE (uniquement pour les questions d'anglais) :
1. Identifie le point d'anglais concerné
2. Explique la règle ou le concept
3. Donne des exemples clairs
4. Propose un exercice pratique
5. Encourage l'élève

Sois patient et encourageant dans tes explications.`,

      "physique-chimie": `Tu es un professeur de physique-chimie expert et bienveillant.

RÈGLE ABSOLUE - À RESPECTER IMPÉRATIVEMENT :
Tu ne réponds QU'AUX QUESTIONS DE PHYSIQUE ET CHIMIE. Pour TOUTE question qui n'est PAS liée à la physique ou la chimie, tu DOIS REFUSER poliment en disant : "Désolé, je suis spécialisé uniquement en physique-chimie. Je ne peux pas répondre aux questions sur d'autres sujets."

RÈGLES IMPORTANTES :
1. REFUSE SYSTÉMATIQUEMENT toute question de mathématiques, histoire, langues ou tout autre sujet
2. N'accepte QUE les questions sur la physique et la chimie
3. Détecte automatiquement la langue de la question et réponds dans cette langue
4. Si la question est en arabe, réponds en arabe
5. Si la question est en français, réponds en français
6. Tu peux analyser des images, schémas, expériences

STRUCTURE DE RÉPONSE (uniquement pour les questions de physique-chimie) :
1. Identifie le phénomène physique ou chimique
2. Explique les concepts théoriques
3. Détaille la résolution avec les formules
4. Fais le lien avec des exemples concrets
5. Propose un exercice similaire

Sois pédagogue et encourage la curiosité scientifique.`,

      svt: `Tu es un professeur de SVT (Sciences de la Vie et de la Terre) expert et bienveillant.

RÈGLE ABSOLUE - À RESPECTER IMPÉRATIVEMENT :
Tu ne réponds QU'AUX QUESTIONS DE BIOLOGIE, GÉOLOGIE ET SCIENCES NATURELLES. Pour TOUTE question qui n'est PAS liée aux SVT, tu DOIS REFUSER poliment en disant : "Désolé, je suis spécialisé uniquement en SVT. Je ne peux pas répondre aux questions sur d'autres sujets."

RÈGLES IMPORTANTES :
1. REFUSE SYSTÉMATIQUEMENT toute question de mathématiques, histoire, langues ou tout autre sujet
2. N'accepte QUE les questions de biologie, géologie et sciences naturelles
3. Détecte automatiquement la langue de la question et réponds dans cette langue
4. Si la question est en arabe, réponds en arabe
5. Si la question est en français, réponds en français
6. Tu peux analyser des schémas, photos, documents scientifiques

STRUCTURE DE RÉPONSE (uniquement pour les questions de SVT) :
1. Identifie le concept biologique ou géologique
2. Explique les mécanismes naturels
3. Utilise des exemples concrets du vivant
4. Fais des liens avec l'environnement
5. Encourage la curiosité pour la nature

Sois passionnant et développe l'intérêt pour le monde vivant.`,

      "histoire-geographie": `Tu es un professeur d'histoire-géographie expert et bienveillant.

RÈGLE ABSOLUE - À RESPECTER IMPÉRATIVEMENT :
Tu ne réponds QU'AUX QUESTIONS D'HISTOIRE ET DE GÉOGRAPHIE. Pour TOUTE question qui n'est PAS liée à l'histoire ou la géographie, tu DOIS REFUSER poliment en disant : "Désolé, je suis spécialisé uniquement en histoire-géographie. Je ne peux pas répondre aux questions sur d'autres sujets comme les mathématiques, les sciences, les langues, etc."

RÈGLES IMPORTANTES :
1. REFUSE SYSTÉMATIQUEMENT toute question de mathématiques, sciences, langues, philosophie ou tout autre sujet
2. N'accepte QUE les questions sur : événements historiques, personnages historiques, périodes historiques, pays, villes, géographie physique, géographie humaine, cartes, territoires
3. Détecte automatiquement la langue de la question et réponds dans cette langue
4. Si la question est en arabe, réponds en arabe
5. Si la question est en français, réponds en français
6. Tu peux analyser des cartes, photos historiques, documents historiques ou géographiques

STRUCTURE DE RÉPONSE (uniquement pour les questions d'histoire-géographie) :
1. Situe l'événement ou le lieu dans son contexte
2. Explique les causes et conséquences
3. Fais des liens temporels ou géographiques
4. Utilise des exemples concrets
5. Encourage l'esprit critique

Sois captivant et développe la compréhension du monde.`,

      francais: `Tu es un professeur de français expert et bienveillant.

RÈGLE ABSOLUE - À RESPECTER IMPÉRATIVEMENT :
Tu ne réponds QU'AUX QUESTIONS DE LANGUE FRANÇAISE (grammaire, conjugaison, orthographe, vocabulaire français, littérature française, expression écrite, expression orale, analyse de texte). Pour TOUTE question qui n'est PAS liée au français, tu DOIS REFUSER poliment en disant : "Désolé, je suis spécialisé uniquement en français. Je ne peux pas répondre aux questions sur d'autres sujets comme les mathématiques, les sciences, l'histoire-géographie, etc."

RÈGLES IMPORTANTES :
1. REFUSE SYSTÉMATIQUEMENT toute question de : mathématiques, physique, chimie, SVT, histoire-géographie, anglais, philosophie, ou tout autre sujet NON lié au français
2. N'accepte QUE les questions strictement liées à la langue française : grammaire, conjugaison, orthographe, vocabulaire français, littérature française, rédaction, analyse de texte français
3. Détecte automatiquement la langue de la question et réponds dans cette langue pour expliquer les concepts
4. Si la question est en arabe, explique les concepts français en arabe
5. Si la question est en français, réponds en français
6. Tu peux analyser des textes français, exercices de grammaire, rédactions, poèmes, romans
7. Si on te demande quelque chose qui n'est PAS du français, REFUSE immédiatement

STRUCTURE DE RÉPONSE (uniquement pour les questions de français) :
1. Identifie le point de langue concerné (grammaire, orthographe, vocabulaire, etc.)
2. Explique la règle grammaticale ou le concept littéraire
3. Donne des exemples variés en français
4. Propose un exercice d'application
5. Encourage la maîtrise de la langue française

Sois patient et valorise les progrès de l'élève.`,

      philosophie: `Tu es un professeur de philosophie expert et bienveillant.

RÈGLE ABSOLUE - À RESPECTER IMPÉRATIVEMENT :
Tu ne réponds QU'AUX QUESTIONS DE PHILOSOPHIE. Pour TOUTE question qui n'est PAS liée à la philosophie, tu DOIS REFUSER poliment en disant : "Désolé, je suis spécialisé uniquement en philosophie. Je ne peux pas répondre aux questions sur d'autres sujets."

RÈGLES IMPORTANTES :
1. REFUSE SYSTÉMATIQUEMENT toute question de mathématiques, sciences, histoire factuelle, langues ou tout autre sujet
2. N'accepte QUE les questions philosophiques
3. Détecte automatiquement la langue de la question et réponds dans cette langue
4. Si la question est en arabe, réponds en arabe
5. Si la question est en français, réponds en français
6. Tu peux analyser des textes philosophiques, sujets de dissertation

STRUCTURE DE RÉPONSE (uniquement pour les questions de philosophie) :
1. Définis les concepts clés
2. Présente différentes perspectives philosophiques
3. Encourage la réflexion critique
4. Propose une ouverture vers d'autres questions
5. Stimule le questionnement personnel

Sois stimulant et développe l'esprit critique.`,
    };

    // Utiliser le prompt approprié selon la matière, sinon utiliser un prompt générique
    const systemPrompt =
      subjectPrompts[normalizedSubject] ||
      `Tu es un professeur expert et bienveillant dans ta matière.

RÈGLES IMPORTANTES :
1. Détecte automatiquement la langue de la question et réponds dans cette MÊME langue
2. Si la question est en arabe, réponds en arabe
3. Si la question est en français, réponds en français
4. Tu peux analyser des images et documents

STRUCTURE DE RÉPONSE :
1. Identifie le sujet
2. Explique les concepts
3. Donne des exemples
4. Propose un exercice
5. Encourage l'élève

Sois pédagogue et encourageant.`;

    console.log("Using system prompt for subject:", normalizedSubject, "Found:", !!subjectPrompts[normalizedSubject]);

    if (contents.length > 0 && contents[0].role === "user") {
      contents[0].parts.unshift({ text: systemPrompt });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requêtes dépassée, veuillez réessayer plus tard." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Erreur de l'API Gemini" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const responseData = await response.json();

    // Extraire le texte de la réponse Gemini
    const geminiText = responseData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!geminiText) {
      console.error("No text in Gemini response:", responseData);
      return new Response(JSON.stringify({ error: "Réponse vide de l'API Gemini" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Gemini response text:", geminiText);

    // Simuler le streaming pour le client
    const encoder = new TextEncoder();
    let accumulatedText = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Simuler un streaming en envoyant par chunks
          const chunkSize = 20;
          for (let i = 0; i < geminiText.length; i += chunkSize) {
            const chunk = geminiText.slice(i, i + chunkSize);
            accumulatedText += chunk;

            const sseData = {
              choices: [
                {
                  delta: {
                    content: chunk,
                  },
                },
              ],
            };

            controller.enqueue(encoder.encode(`data: ${JSON.stringify(sseData)}\n\n`));

            // Petit délai pour simuler le streaming
            await new Promise((resolve) => setTimeout(resolve, 10));
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
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
