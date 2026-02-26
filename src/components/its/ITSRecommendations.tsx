import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Sparkles, Target, TrendingUp, CheckCircle, Lightbulb, Clock, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AssessmentData {
  type: string;
  answers: any[];
  report: {
    level_label: string;
    summary: string;
    strengths: string[];
    improvements: string[];
    advice: string;
  };
  score: { score: number; total: number };
}

interface PeriodicAdvice {
  advice: string;
  level: string;
  weaknesses: string[];
  generated_at: string;
}

interface LearningStyleData {
  id: string;
  user_id?: string;
  preferred_style?: string;
  visual_score?: number;
  textual_score?: number;
  practical_score?: number;
  assessment_data: any;
  advice_seen: boolean | null;
  report_first_shown_at: string | null;
  last_advice_generated_at: string | null;
  periodic_advice: PeriodicAdvice | null;
}

// Auto-hide report after 2 minutes (120000 ms)
const REPORT_DISPLAY_DURATION = 120000;
// Generate new advice every 10 days
const PERIODIC_ADVICE_INTERVAL = 10 * 24 * 60 * 60 * 1000;

export default function ITSRecommendations() {
  const { user } = useAuth();
  const [learningData, setLearningData] = useState<LearningStyleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(true);
  const [periodicAdvice, setPeriodicAdvice] = useState<PeriodicAdvice | null>(null);

  // Generate periodic advice using AI
  const generatePeriodicAdvice = useCallback(async (learningId: string, assessmentData: AssessmentData, level: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("generate-periodic-advice", {
        body: {
          assessment_data: assessmentData,
          student_level: level,
          days_since_assessment: 10
        },
      });

      if (error) throw error;

      if (data?.advice) {
        const newAdvice: PeriodicAdvice = {
          advice: data.advice,
          level: level,
          weaknesses: data.weaknesses || [],
          generated_at: new Date().toISOString()
        };

        // Save to database
        await supabase
          .from("learning_styles")
          .update({
            periodic_advice: newAdvice,
            last_advice_generated_at: new Date().toISOString()
          })
          .eq("id", learningId);

        setPeriodicAdvice(newAdvice);
      }
    } catch (err) {
      console.error("Error generating periodic advice:", err);
      // Generate local fallback advice
      generateLocalPeriodicAdvice(learningId, assessmentData, level);
    }
  }, []);

  // Generate local fallback advice (if AI fails)
  const generateLocalPeriodicAdvice = useCallback(async (learningId: string, assessmentData: AssessmentData, level: string) => {
    const report = assessmentData.report;
    const advice = `
مرحباً! لقد مرت 10 أيام على تقييمك. 
${report.improvements && report.improvements.length > 0 ? `ننصحك بالتركيز على: ${report.improvements.join('، ')}` : ' استمر في الممارسة المنتظمة.'}
${report.advice ? `تذكير: ${report.advice}` : ''}
    `.trim();

    const localAdvice: PeriodicAdvice = {
      advice,
      level: level,
      weaknesses: report.improvements || [],
      generated_at: new Date().toISOString()
    };

    await supabase
      .from("learning_styles")
      .update({
        periodic_advice: localAdvice,
        last_advice_generated_at: new Date().toISOString()
      })
      .eq("id", learningId);

    setPeriodicAdvice(localAdvice);
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from("learning_styles")
          .select("id, preferred_style, visual_score, textual_score, practical_score, assessment_data, advice_seen, report_first_shown_at, last_advice_generated_at, periodic_advice")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching learning data:", error);
          setLoading(false);
          return;
        }

        if (!data || !data.assessment_data) {
          setLoading(false);
          return;
        }

        const assessmentData = data.assessment_data as AssessmentData;

        // Check if we need to update report_first_shown_at
        let reportFirstShownAt = data.report_first_shown_at;
        if (!reportFirstShownAt) {
          reportFirstShownAt = new Date().toISOString();
          await supabase
            .from("learning_styles")
            .update({ report_first_shown_at: reportFirstShownAt })
            .eq("id", data.id);
        }

        // Check if it's time to generate periodic advice (every 10 days)
        const lastGenerated = data.last_advice_generated_at;
        const shouldGenerateAdvice = !lastGenerated ||
          (new Date().getTime() - new Date(lastGenerated).getTime()) >= PERIODIC_ADVICE_INTERVAL;

        const learningStyleData: LearningStyleData = {
          id: data.id,
          preferred_style: data.preferred_style || "mixed",
          visual_score: data.visual_score || 0,
          textual_score: data.textual_score || 0,
          practical_score: data.practical_score || 0,
          assessment_data: data.assessment_data,
          advice_seen: data.advice_seen ?? false,
          report_first_shown_at: reportFirstShownAt,
          last_advice_generated_at: data.last_advice_generated_at,
          periodic_advice: data.periodic_advice
        };

        setLearningData(learningStyleData);

        // Set periodic advice if exists
        if (data.periodic_advice) {
          setPeriodicAdvice(data.periodic_advice);
        }

        // Generate new periodic advice if needed
        if (shouldGenerateAdvice) {
          generatePeriodicAdvice(data.id, assessmentData, learningStyleData.preferred_style || "mixed");
        }

        setLoading(false);
      } catch (err) {
        console.error("Exception fetching learning data:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [user, generatePeriodicAdvice]);

  // Auto-hide report after 2 minutes
  useEffect(() => {
    if (!learningData || !learningData.report_first_shown_at) return;

    const firstShown = new Date(learningData.report_first_shown_at).getTime();
    const now = new Date().getTime();
    const elapsed = now - firstShown;

    if (elapsed >= REPORT_DISPLAY_DURATION) {
      setShowReport(false);
      return;
    }

    // Set timeout to hide report after remaining time
    const remainingTime = REPORT_DISPLAY_DURATION - elapsed;
    const timer = setTimeout(() => {
      setShowReport(false);
    }, remainingTime);

    return () => clearTimeout(timer);
  }, [learningData]);

  // Mark advice as seen
  useEffect(() => {
    if (!learningData || learningData.advice_seen === true) return;

    const markAsSeen = async () => {
      await supabase
        .from("learning_styles")
        .update({ advice_seen: true })
        .eq("id", learningData.id);
    };

    const timer = setTimeout(markAsSeen, 3000);
    return () => clearTimeout(timer);
  }, [learningData]);

  // Don't show if loading or no data
  if (loading || !learningData) {
    return null;
  }

  const assessmentData = learningData.assessment_data as AssessmentData | null;

  if (!assessmentData || !assessmentData.report) {
    return null;
  }

  const { report, score } = assessmentData;

  return (
    <div className="space-y-4">
      {/* Main AI Report - Auto-hides after 2 minutes */}
      {showReport && (
        <Card className="p-6 border-primary/20 mb-6 bg-gradient-to-r from-primary/5 to-transparent animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground text-lg">تقرير الذكاء الاصطناعي</h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>يختفي خلال {Math.max(0, Math.ceil((REPORT_DISPLAY_DURATION - (new Date().getTime() - new Date(learningData.report_first_shown_at!).getTime())) / 1000))} ثانية</span>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg p-3 mb-4 border bg-primary/10 border-primary/20">
            <Target className="h-6 w-6 flex-shrink-0 text-primary" />
            <div>
              <p className="font-medium text-primary">مستواك: {report.level_label}</p>
              <p className="text-sm opacity-80">النتيجة: {score.score}/{score.total}</p>
            </div>
          </div>

          {report.summary && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{report.summary}</p>
            </div>
          )}

          {report.strengths && report.strengths.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-green-600 flex items-center gap-2 mb-2 text-sm">
                <CheckCircle className="h-4 w-4" />
                نقاط القوة
              </h4>
              <ul className="space-y-1">
                {report.strengths.map((strength, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.improvements && report.improvements.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-amber-600 flex items-center gap-2 mb-2 text-sm">
                <TrendingUp className="h-4 w-4" />
                نقاط التحسين
              </h4>
              <ul className="space-y-1">
                {report.improvements.map((improvement, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.advice && (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-sm font-medium text-primary flex items-center gap-2 mb-1">
                <Lightbulb className="h-4 w-4" />
                نصيحة شخصية لك
              </p>
              <p className="text-sm text-muted-foreground">{report.advice}</p>
            </div>
          )}
        </Card>
      )}

      {/* Periodic Advice - Shows every 10 days and disappears after 1 minute */}
      {periodicAdvice && showReport && (
        <Card className="p-6 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3 mb-4">
            <RefreshCw className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold text-foreground text-lg">نصيحة جديدة - تحديث كل 10 أيام</h3>
          </div>

          <div className="p-4 rounded-lg bg-amber-100/50 dark:bg-amber-900/20 border border-amber-200">
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
              {periodicAdvice.advice}
            </p>
          </div>

          {periodicAdvice.weaknesses && periodicAdvice.weaknesses.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2 mb-2 text-sm">
                <TrendingUp className="h-4 w-4" />
                النقاط التي تحتاج مراجعة
              </h4>
              <ul className="space-y-1">
                {periodicAdvice.weaknesses.map((weakness, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    {weakness}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {periodicAdvice.generated_at && (
            <p className="text-xs text-muted-foreground mt-4 text-left">
              آخر تحديث: {new Date(periodicAdvice.generated_at).toLocaleDateString('ar-SA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
