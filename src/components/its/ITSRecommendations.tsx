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

interface StudentScoreData {
  id: string;
  current_level: number;
  assessment_data: any;
  advice_seen: boolean | null;
  report_first_shown_at: string | null;
  last_advice_generated_at: string | null;
  periodic_advice: PeriodicAdvice | null;
}

const DISPLAY_SECONDS = 120;
const PERIODIC_ADVICE_INTERVAL = 10 * 24 * 60 * 60 * 1000;

// localStorage keys for persistent countdown
const getReportStartKey = (userId: string) => `its_report_start_${userId}`;
const getReportDoneKey = (userId: string) => `its_report_done_${userId}`;
const getAdviceStartKey = (userId: string) => `its_advice_start_${userId}`;
const getAdviceDoneKey = (userId: string) => `its_advice_done_${userId}`;
const getAdviceGenKey = (userId: string) => `its_advice_gen_${userId}`;

export default function ITSRecommendations() {
  const { user } = useAuth();
  const [learningData, setLearningData] = useState<StudentScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportCountdown, setReportCountdown] = useState<number | null>(null);
  const [adviceCountdown, setAdviceCountdown] = useState<number | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [showAdvice, setShowAdvice] = useState(false);
  const [periodicAdvice, setPeriodicAdvice] = useState<PeriodicAdvice | null>(null);
  const reportTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const adviceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup timers on unmount or logout
  useEffect(() => {
    return () => {
      if (reportTimerRef.current) clearInterval(reportTimerRef.current);
      if (adviceTimerRef.current) clearInterval(adviceTimerRef.current);
    };
  }, []);

  // Hide everything on logout
  useEffect(() => {
    if (!user) {
      setShowReport(false);
      setShowAdvice(false);
      setReportCountdown(null);
      setAdviceCountdown(null);
      if (reportTimerRef.current) clearInterval(reportTimerRef.current);
      if (adviceTimerRef.current) clearInterval(adviceTimerRef.current);
    }
  }, [user]);

  const startCountdown = useCallback((
    storageStartKey: string,
    storageDoneKey: string,
    setShow: (v: boolean) => void,
    setCountdown: (v: number | null) => void,
    timerRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>
  ) => {
    // Already done forever? Don't show.
    if (localStorage.getItem(storageDoneKey) === "done") return;

    // Get or set start timestamp
    let startTs = localStorage.getItem(storageStartKey);
    if (!startTs) {
      startTs = Date.now().toString();
      localStorage.setItem(storageStartKey, startTs);
    }

    const elapsed = Math.floor((Date.now() - parseInt(startTs)) / 1000);
    const remaining = DISPLAY_SECONDS - elapsed;

    if (remaining <= 0) {
      // Time already expired
      localStorage.setItem(storageDoneKey, "done");
      setShow(false);
      setCountdown(null);
      return;
    }

    setShow(true);
    setCountdown(remaining);

    if (timerRef.current) clearInterval(timerRef.current);
    let current = remaining;
    timerRef.current = setInterval(() => {
      current -= 1;
      if (current <= 0) {
        clearInterval(timerRef.current!);
        setShow(false);
        setCountdown(null);
        localStorage.setItem(storageDoneKey, "done");
      } else {
        setCountdown(current);
      }
    }, 1000);
  }, []);

  // Generate periodic advice
  const generatePeriodicAdvice = useCallback(async (scoreRowId: string, assessmentData: AssessmentData, level: string) => {
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
          .from("student_scores")
          .update({
            periodic_advice: newAdvice as any,
            last_advice_generated_at: new Date().toISOString()
          } as any)
          .eq("id", scoreRowId);

        setPeriodicAdvice(newAdvice);
        return newAdvice;
      }
    } catch (err) {
      console.error("Error generating periodic advice:", err);
    }
    return null;
  }, [user]);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const fetchData = async () => {
      try {
        const { data: rawData, error } = await supabase
          .from("student_scores")
          .select("id, current_level, assessment_data, advice_seen, report_first_shown_at, last_advice_generated_at, periodic_advice")
          .eq("user_id", user.id)
          .is("lesson_id", null)
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
            .from("student_scores")
            .update({ report_first_shown_at: reportFirstShownAt } as any)
            .eq("id", data.id);
        }

        const ld: StudentScoreData = {
          id: data.id,
          current_level: data.current_level,
          assessment_data: data.assessment_data,
          advice_seen: data.advice_seen ?? false,
          report_first_shown_at: reportFirstShownAt,
          last_advice_generated_at: data.last_advice_generated_at,
          periodic_advice: data.periodic_advice
        };

        setLearningData(ld);

        const lastGenerated = data.last_advice_generated_at;
        const isFirstConnection = !lastGenerated;
        const shouldGenerateAdvice = !isFirstConnection &&
          (Date.now() - new Date(lastGenerated).getTime()) >= PERIODIC_ADVICE_INTERVAL;

        // --- REPORT: show with persistent countdown (survives refresh) ---
        const reportDoneKey = getReportDoneKey(user.id);
        const reportDone = localStorage.getItem(reportDoneKey) === "done";
        if (!reportDone) {
          startCountdown(
            getReportStartKey(user.id),
            reportDoneKey,
            setShowReport,
            setReportCountdown,
            reportTimerRef
          );
        }

        // --- PERIODIC ADVICE: only after 10 days (NOT first connection) ---
        if (!isFirstConnection && data.periodic_advice) {
          setPeriodicAdvice(data.periodic_advice);
        }

        if (shouldGenerateAdvice) {
          // Reset advice done key so new advice shows
          const adviceGenKey = getAdviceGenKey(user.id);
          const lastShownGen = localStorage.getItem(adviceGenKey);

          const levelLabel = data.assessment_data?.report?.level_label || `Score ${data.current_level}/100`;
          const newAdvice = await generatePeriodicAdvice(data.id, data.assessment_data, levelLabel);

          if (newAdvice) {
            // New advice generated - reset countdown keys so it shows fresh
            if (lastShownGen !== newAdvice.generated_at) {
              localStorage.removeItem(getAdviceStartKey(user.id));
              localStorage.removeItem(getAdviceDoneKey(user.id));
              localStorage.setItem(adviceGenKey, newAdvice.generated_at);
            }
          }
        }

        // Show advice countdown if we have advice and it's not first connection
        if (!isFirstConnection) {
          const adviceDoneKey = getAdviceDoneKey(user.id);
          const adviceDone = localStorage.getItem(adviceDoneKey) === "done";
          const hasAdvice = data.periodic_advice || shouldGenerateAdvice;

          if (hasAdvice && !adviceDone) {
            startCountdown(
              getAdviceStartKey(user.id),
              adviceDoneKey,
              setShowAdvice,
              setAdviceCountdown,
              adviceTimerRef
            );
          }
        }

        // Mark as seen
        if (!data.advice_seen) {
          await supabase.from("student_scores").update({ advice_seen: true }).eq("id", data.id);
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
  }, [user, generatePeriodicAdvice, startCountdown]);

  if (loading || !learningData) return null;

  const assessmentData = learningData.assessment_data as AssessmentData | null;
  if (!assessmentData?.report) return null;

  const { report, score } = assessmentData;

  return (
    <div className="space-y-4">
      {/* AI Report - persistent countdown across refresh */}
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

      {/* Periodic Advice - only after 10 days, NOT on first connection */}
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
