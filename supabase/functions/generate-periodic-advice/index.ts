// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function callLovableAI(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: "Bearer " + apiKey,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
        }),
    });

    if (!response.ok) {
        const text = await response.text();
        if (response.status === 429) throw new Error("Rate limit exceeded");
        if (response.status === 402) throw new Error("Credits exhausted");
        throw new Error("AI error: " + response.status);
    }

    const result = await response.json();
    return result.choices?.[0]?.message?.content || "";
}

function extractJSON(raw: string): Record<string, unknown> {
    let cleaned = raw;
    cleaned = cleaned.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) cleaned = match[0];
    try {
        return JSON.parse(cleaned);
    } catch {
        return { advice: cleaned };
    }
}

serve(async (req) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
        const body = await req.json();
        const { assessment_data, student_level, days_since_assessment } = body;

        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL") as string;
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;

        if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
        if (!assessment_data || !assessment_data.report) {
            throw new Error("assessment_data with report is required");
        }

        const report = assessment_data.report;
        const score = assessment_data.score;
        const level = report.level_label;
        const weaknesses = report.improvements || [];
        const strengths = report.strengths || [];
        const originalAdvice = report.advice || "";

        const prompt = "You are an expert Algerian math teacher. Generate personalized advice for a student. It has been " + days_since_assessment + " days since their last assessment. Student info: Level: " + level + ", Score: " + score.score + "/" + score.total + ", Strengths: " + strengths.join(", ") + ", Weaknesses: " + weaknesses.join(", ") + ", Original advice: " + originalAdvice + ". Respond with JSON only in this format: {\"advice\": \"...\", \"weaknesses\": [\"...\"]}. Write the advice in Arabic, be encouraging and motivating.";

        const raw = await callLovableAI(
            LOVABLE_API_KEY,
            "You are an expert teacher. Respond with valid JSON only.",
            prompt
        );

        const parsed = extractJSON(raw);

        const advice = parsed.advice || "مرحباً! مرت " + days_since_assessment + " أيام على تقييمك. استمر في العمل الجاد!";
        const adviceWeaknesses = parsed.weaknesses || weaknesses;

        return new Response(
            JSON.stringify({
                advice,
                level,
                weaknesses: adviceWeaknesses,
                generated_at: new Date().toISOString(),
                success: true
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("generate-periodic-advice error:", message);
        return new Response(
            JSON.stringify({ error: message, success: false }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
