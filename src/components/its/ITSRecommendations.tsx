import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Sparkles, Target, Clock, RefreshCw, Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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
  assessment_data: any;
  advice_seen: boolean | null;
  report_first_shown_at: string | null;
  last_advice_generated_at: string | null;
  periodic_advice: PeriodicAdvice | null;
}

const DISPLAY_SECONDS = 120;
const PERIODIC_ADVICE_INTERVAL = 10 * 24 * 60 * 60 * 1000;

export default function ITSRecommendations() {
  const { user } = useAuth();
  const [learningData, setLearningData] = useState<LearningStyleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportCountdown, setReportCountdown] = useState<number | null>(null);
  const [adviceCountdown, setAdviceCountdown] = useState<number | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [showAdvice, setShowAdvice] = useState(false);
  const [periodicAdvice, setPeriodicAdvice] = useState<PeriodicAdvice | null>(null);
  const reportTimerRef = useRef<NodeJS.Timeout | null>(null);
  const adviceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const reportCountRef = useRef(0);
  const adviceCountRef = useRef(0);

  const startReportCountdown = useCallback((sessionKey: string) => {
    reportCountRef.current = DISPLAY_SECONDS;
    setReportCountdown(DISPLAY_SECONDS);
    setShowReport(true);
    if (reportTimerRef.current) clearInterval(reportTimerRef.current);
    reportTimerRef.current = setInterval(() => {
      reportCountRef.current -= 1;
      if (reportCountRef.current <= 0) {
        clearInterval(reportTimerRef.current!);
        setShowReport(false);
        setReportCountdown(null);
        sessionStorage.setItem(sessionKey, "hidden");
      } else {
        setReportCountdown(reportCountRef.current);
      }
    }, 1000);
  }, []);

  const startAdviceCountdown = useCallback((sessionKey: string) => {
    adviceCountRef.current = DISPLAY_SECONDS;
    setAdviceCountdown(DISPLAY_SECONDS);
    setShowAdvice(true);
    if (adviceTimerRef.current) clearInterval(adviceTimerRef.current);
    adviceTimerRef.current = setInterval(() => {
      adviceCountRef.current -= 1;
      if (adviceCountRef.current <= 0) {
        clearInterval(adviceTimerRef.current!);
        setShowAdvice(false);
        setAdviceCountdown(null);
        sessionStorage.setItem(sessionKey, "hidden");
      } else {
        setAdviceCountdown(adviceCountRef.current);
      }
    }, 1000);
  }, []);

  // Generate periodic advice
  const generatePeriodicAdvice = useCallback(async (learningId: string, assessmentData: AssessmentData, level: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("generate-periodic-advice", {
        body: {
          assessment_data: assessmentData,
          student_level: level,
          days_since_assessment: 10,
          user_id: user?.id
        },
      });

      if (error) throw error;

      if (data?.advice) {
        const newAdvice: PeriodicAdvice = {
          advice: data.advice,
          level,
          weaknesses: data.weaknesses || [],
          generated_at: new Date().toISOString()
        };

        await supabase
          .from("learning_styles")
          .update({
            periodic_advice: newAdvice as any,
            last_advice_generated_at: new Date().toISOString()
          } as any)
          .eq("id", learningId);

        setPeriodicAdvice(newAdvice);
      }
    } catch (err) {
      console.error("Error generating periodic advice:", err);
    }
  }, [user]);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const fetchData = async () => {
      try {
        const { data: rawData, error } = await supabase
          .from("learning_styles")
          .select("id, assessment_data, advice_seen")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error || !rawData || !rawData.assessment_data) {
          setLoading(false);
          return;
        }

        const data = rawData as any;

        // Set report_first_shown_at if not set
        let reportFirstShownAt = data.report_first_shown_at;
        if (!reportFirstShownAt) {
          reportFirstShownAt = new Date().toISOString();
          await supabase
            .from("learning_styles")
            .update({ report_first_shown_at: reportFirstShownAt } as any)
            .eq("id", data.id);
        }

        const ld: LearningStyleData = {
          id: data.id,
          assessment_data: data.assessment_data,
          advice_seen: data.advice_seen ?? false,
          report_first_shown_at: reportFirstShownAt,
          last_advice_generated_at: data.last_advice_generated_at,
          periodic_advice: data.periodic_advice
        };

        setLearningData(ld);

        // --- REPORT: show once per session with 120s countdown ---
        const reportSessionKey = `its_report_shown_${user.id}`;
        const reportAlreadyShown = sessionStorage.getItem(reportSessionKey);
        if (!reportAlreadyShown) {
          startReportCountdown(reportSessionKey);
        }

        // --- PERIODIC ADVICE ---
        const lastGenerated = data.last_advice_generated_at;
        const shouldGenerate = !lastGenerated ||
          (Date.now() - new Date(lastGenerated).getTime()) >= PERIODIC_ADVICE_INTERVAL;

        if (data.periodic_advice) {
          setPeriodicAdvice(data.periodic_advice);
        }

        if (shouldGenerate) {
          await generatePeriodicAdvice(data.id, data.assessment_data, data.preferred_style || "mixed");
        }

        // Show advice once per session
        const adviceSessionKey = `its_advice_shown_${user.id}`;
        const adviceAlreadyShown = sessionStorage.getItem(adviceSessionKey);
        if ((data.periodic_advice || shouldGenerate) && !adviceAlreadyShown) {
          startAdviceCountdown(adviceSessionKey);
        }

        // Mark as seen
        if (!data.advice_seen) {
          await supabase.from("learning_styles").update({ advice_seen: true }).eq("id", data.id);
        }

        setLoading(false);
      } catch (err) {
        console.error("Exception fetching learning data:", err);
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (reportTimerRef.current) clearInterval(reportTimerRef.current);
      if (adviceTimerRef.current) clearInterval(adviceTimerRef.current);
    };
  }, [user, generatePeriodicAdvice, startReportCountdown, startAdviceCountdown]);

  if (loading || !learningData) return null;

  const assessmentData = learningData.assessment_data as AssessmentData | null;
  if (!assessmentData?.report) return null;

  const { report, score } = assessmentData;

  return (
    <div className="space-y-4">
      {/* AI Report - once per session, 120s countdown */}
      {showReport && reportCountdown !== null && (
        <Card className="p-5 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">تقرير الذكاء الاصطناعي</h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono bg-muted px-2 py-1 rounded-full">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">{reportCountdown} ث</span>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg p-3 border bg-primary/10 border-primary/20">
            <Target className="h-5 w-5 flex-shrink-0 text-primary" />
            <div>
              <p className="font-medium text-primary text-sm">مستواك: {report.level_label}</p>
              <p className="text-xs text-muted-foreground">النتيجة: {score.score}/{score.total}</p>
            </div>
          </div>

          {report.advice && (
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{report.advice}</p>
          )}
        </Card>
      )}

      {/* Periodic Advice - once per session, 120s countdown */}
      {showAdvice && adviceCountdown !== null && periodicAdvice && (
        <Card className="p-5 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-amber-600" />
              <h3 className="font-semibold text-foreground">نصيحة جديدة - تحديث كل 10 أيام</h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-full">
              <Clock className="h-3 w-3 text-amber-600" />
              <span className="text-amber-700 dark:text-amber-400">{adviceCountdown} ث</span>
            </div>
          </div>

          <p className="text-sm text-foreground leading-relaxed">{periodicAdvice.advice}</p>

          <div className="mt-3 flex items-center gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
            <Bell className="h-4 w-4 text-primary flex-shrink-0" />
            <p className="text-xs text-primary">تمارين مُعدّة لمستواك متوفرة في الإشعارات</p>
          </div>
        </Card>
      )}
    </div>
  );
}
