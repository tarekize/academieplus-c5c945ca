// Génère des activités de remédiation ciblées UNIQUEMENT sur les lacunes de l'élève.
// Retourne exactement 3 exercices + 2 quiz, sans monter en compétence :
// le but est de combler les lacunes, pas de pousser vers du plus difficile.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SCHOOL_LEVEL_LABELS: Record<string, string> = {
  "5eme_primaire": "5ème année primaire",
  "1ere_cem": "1ère année CEM",
  "2eme_cem": "2ème année CEM",
  "3eme_cem": "3ème année CEM",
  "4eme_cem": "4ème année CEM (BEM)",
  "premiere": "1ère année secondaire",
  "seconde": "2ème année secondaire",
  "terminale": "3ème année secondaire (BAC)",
};

// Échelle de difficulté : on reste BAS pour combler la lacune (pas de montée en compétence).
function getRemediationDifficulty(level: number): number {
  if (level < 30) return 1;
  if (level < 50) return 2;
  return 2; // plafonné à 2 : remédiation = consolidation, jamais "challenge"
}

function buildPrompt(
  schoolLevel: string,
  level: number,
  lessonTitle: string,
  chapterTitle: string,
  weakConcepts: string[],
  seed: number,
): { system: string; user: string } {
  const levelLabel = SCHOOL_LEVEL_LABELS[schoolLevel] || schoolLevel;
  const diff = getRemediationDifficulty(level);
  const lacunesBlock = weakConcepts.length > 0
    ? weakConcepts.map((c, i) => `${i + 1}. ${c}`).join("\n")
    : `لا توجد لائحة دقيقة، ركّز على المفاهيم الأساسية لدرس "${lessonTitle}".`;

  const system = `أنت معلّم رياضيات جزائري خبير في الدعم والمعالجة (remédiation). مهمتك إنتاج أنشطة تستهدف **فقط** ثغرات الطالب لسدّها، **دون رفع مستوى الصعوبة** (لا تمارين "تحدّي"). أجب حصراً بكائن JSON صالح بدون أي نص أو markdown حوله.`;

  const user = `سياق الطالب:
- المستوى الدراسي: ${levelLabel}
- مستوى الطالب الحالي في الدرس: ${level}/100 → صعوبة مستهدفة ${diff}/5 (سهل، للتثبيت)
- الدرس: "${lessonTitle}"
- الفصل: "${chapterTitle}"

ثغرات الطالب (lacunes) التي يجب معالجتها حصراً:
${lacunesBlock}

التعليمات الإلزامية:
- أنشئ **بالضبط 3 تمارين و 2 أسئلة اختيار من متعدد (quiz)**.
- كل نشاط يجب أن يعالج **ثغرة من الثغرات أعلاه فقط**. ممنوع الخروج عن هذه الثغرات أو إدخال مفاهيم جديدة أصعب.
- **ممنوع رفع الصعوبة**: ابقَ في مستوى ${diff}/5 (تطبيق مباشر، قيم بسيطة، خطوات قصيرة) لأن الهدف هو سدّ الثغرة لا التطوير.
- كل المحتوى باللغة العربية ما عدا الرموز الرياضية.
- صيغة الرياضيات إلزامية: كل التعابير الرياضية بين $...$ (LaTeX/KaTeX). الكسور \\frac{a}{b}، القوى x^{n}، الجذور \\sqrt{x}، الرموز \\infty,\\to,\\leq,\\geq,\\neq,\\pm,\\cdot,\\lim_{x \\to +\\infty}. ممنوع كتابة الرياضيات كنص خام.
- seed التنويع: ${seed}.

أعد كائن JSON بهذا الشكل بالضبط:
{
  "exercises": [
    {
      "title": "عنوان قصير مرتبط بالثغرة",
      "statement": "نص التمرين كامل بالعربية مع LaTeX",
      "expected_answer": "الجواب المنتظر (قيمة أو تعبير قصير)",
      "accepted_answers": ["صيغة مقبولة 1", "صيغة مقبولة 2"],
      "hint": "تلميح قصير بالعربية",
      "solution": "<p><strong>الخطوة 1 :</strong> ...</p><p>$$ ... $$</p><p><strong>الاستنتاج :</strong> $$ ... $$</p>",
      "concept": "اسم الثغرة المستهدفة",
      "difficulty": ${diff}
    }
  ],
  "quizzes": [
    {
      "question": "سؤال مرتبط بالثغرة مع LaTeX",
      "options": ["خيار A", "خيار B", "خيار C", "خيار D"],
      "correct_answer": "الخيار الصحيح (مطابق تماماً لأحد الخيارات)",
      "explanation": "شرح قصير يساعد على فهم الخطأ",
      "concept": "اسم الثغرة المستهدفة",
      "difficulty": ${diff}
    }
  ]
}

تذكير أخير: 3 تمارين + 2 quiz بالضبط، كلها على الثغرات أعلاه فقط، وبصعوبة منخفضة (تثبيت لا تطوير). حل التمارين ("solution") يكون HTML متعدّد الخطوات مع $$...$$.`;

  return { system, user };
}

// Génère UN seul exercice (ou quiz) similaire ciblé sur une lacune précise,
// utilisé quand l'élève se trompe : on lui propose un exercice similaire à refaire.
function buildSinglePrompt(
  kind: "exercise" | "quiz",
  schoolLevel: string,
  level: number,
  lessonTitle: string,
  chapterTitle: string,
  targetConcept: string,
  seed: number,
): { system: string; user: string } {
  const levelLabel = SCHOOL_LEVEL_LABELS[schoolLevel] || schoolLevel;
  const diff = getRemediationDifficulty(level);
  const concept = targetConcept || lessonTitle;

  const system = `أنت معلّم رياضيات جزائري خبير في الدعم والمعالجة (remédiation). الطالب أخطأ في نشاط، فولّد له نشاطاً **مشابهاً** على نفس الثغرة لإعادة المحاولة، **دون رفع الصعوبة**. أجب حصراً بكائن JSON صالح بدون أي نص أو markdown حوله.`;

  const common = `سياق الطالب:
- المستوى الدراسي: ${levelLabel}
- مستوى الطالب الحالي في الدرس: ${level}/100 → صعوبة مستهدفة ${diff}/5 (سهل، للتثبيت)
- الدرس: "${lessonTitle}"
- الفصل: "${chapterTitle}"
- الثغرة المستهدفة: "${concept}"
- seed التنويع: ${seed}

التعليمات الإلزامية:
- النشاط يجب أن يعالج الثغرة "${concept}" فقط، مع قيم/أرقام **مختلفة** عن المحاولة السابقة لكن بنفس المستوى.
- ممنوع رفع الصعوبة (ابقَ في ${diff}/5).
- كل المحتوى باللغة العربية ما عدا الرموز الرياضية.
- صيغة الرياضيات إلزامية بين $...$ (LaTeX/KaTeX): الكسور \\frac{a}{b}، القوى x^{n}، الجذور \\sqrt{x}، الرموز \\infty,\\to,\\leq,\\geq,\\neq,\\pm,\\cdot,\\lim_{x \\to +\\infty}.`;

  if (kind === "exercise") {
    const user = `${common}

أعد كائن JSON بهذا الشكل بالضبط (تمرين واحد فقط):
{
  "exercises": [
    {
      "title": "عنوان قصير مرتبط بالثغرة",
      "statement": "نص التمرين كامل بالعربية مع LaTeX",
      "expected_answer": "الجواب المنتظر (قيمة أو تعبير قصير)",
      "accepted_answers": ["صيغة مقبولة 1", "صيغة مقبولة 2"],
      "hint": "تلميح قصير بالعربية",
      "solution": "<p><strong>الخطوة 1 :</strong> ...</p><p>$$ ... $$</p><p><strong>الاستنتاج :</strong> $$ ... $$</p>",
      "concept": "${concept}",
      "difficulty": ${diff}
    }
  ]
}`;
    return { system, user };
  }

  const user = `${common}

أعد كائن JSON بهذا الشكل بالضبط (سؤال اختيار من متعدد واحد فقط):
{
  "quizzes": [
    {
      "question": "سؤال مرتبط بالثغرة مع LaTeX",
      "options": ["خيار A", "خيار B", "خيار C", "خيار D"],
      "correct_answer": "الخيار الصحيح (مطابق تماماً لأحد الخيارات)",
      "explanation": "شرح قصير يساعد على فهم الخطأ",
      "concept": "${concept}",
      "difficulty": ${diff}
    }
  ]
}`;
  return { system, user };
}

async function callLovableAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.85,
      max_tokens: 4096,
    }),
  });
  if (!response.ok) {
    const errText = await response.text();
    console.error("Lovable AI error:", response.status, errText);
    throw new Error(`Lovable AI failed: ${response.status}`);
  }
  const data = await response.json();
  return data?.choices?.[0]?.message?.content || "";
}

async function callGemini(systemPrompt: string, userPrompt: string, key: string, label: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0.85, topP: 0.95, maxOutputTokens: 4096 },
    }),
  });
  if (!response.ok) {
    const errText = await response.text();
    console.error(`Gemini ${label} error:`, response.status, errText);
    throw new Error(`Gemini ${label} failed: ${response.status}`);
  }
  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const {
      school_level,
      level = 40,
      lesson_title,
      chapter_title,
      weak_concepts = [],
      seed,
    } = body;

    if (!school_level || !lesson_title || !chapter_title) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const weak = (Array.isArray(weak_concepts) ? weak_concepts : [])
      .map((c: unknown) => String(c).trim())
      .filter(Boolean)
      .slice(0, 8);

    const { system, user } = buildPrompt(
      school_level,
      typeof level === "number" ? level : 40,
      lesson_title,
      chapter_title,
      weak,
      typeof seed === "number" ? seed : Math.floor(Math.random() * 1_000_000),
    );

    const geminiKey1 = Deno.env.get("GEMINI_API_KEY");
    const geminiKey2 = Deno.env.get("GEMINI_API_KEY_2");

    let rawContent = "";
    try {
      rawContent = await callLovableAI(system, user);
    } catch (e) {
      console.error("Lovable AI failed, trying Gemini 1...", e);
      try {
        if (!geminiKey1) throw new Error("no key 1");
        rawContent = await callGemini(system, user, geminiKey1, "KEY_1");
      } catch (e2) {
        console.error("Gemini 1 failed, trying Gemini 2...", e2);
        if (!geminiKey2) {
          return new Response(JSON.stringify({ error: "AI providers unavailable" }), {
            status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        rawContent = await callGemini(system, user, geminiKey2, "KEY_2");
      }
    }

    rawContent = rawContent.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();

    const sanitizeJsonEscapes = (s: string) =>
      s.replace(/\\(?!["\\/]|u[0-9a-fA-F]{4})/g, "\\\\");

    let parsed: any;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      try {
        parsed = JSON.parse(sanitizeJsonEscapes(rawContent));
      } catch {
        console.error("Failed to parse AI response:", rawContent.substring(0, 500));
        throw new Error("L'IA a retourné un format invalide.");
      }
    }

    const exercises = Array.isArray(parsed?.exercises) ? parsed.exercises.slice(0, 3) : [];
    const quizzes = Array.isArray(parsed?.quizzes) ? parsed.quizzes.slice(0, 2) : [];

    return new Response(JSON.stringify({ exercises, quizzes }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-remediation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
