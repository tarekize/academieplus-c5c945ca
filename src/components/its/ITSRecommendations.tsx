import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Sparkles, Target, TrendingUp, CheckCircle, Lightbulb } from "lucide-react";
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

interface LearningStyleData {
  id: string;
  user_id?: string;
  preferred_style?: string;
  visual_score?: number;
  textual_score?: number;
  practical_score?: number;
  assessment_data: any;
  advice_seen: boolean | null;
}

export default function ITSRecommendations() {
  const { user } = useAuth();
  const [learningData, setLearningData] = useState<LearningStyleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from("learning_styles")
          .select("id, preferred_style, visual_score, textual_score, practical_score, assessment_data, advice_seen")
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

        const learningStyleData: LearningStyleData = {
          id: data.id,
          preferred_style: data.preferred_style || "mixed",
          visual_score: data.visual_score || 0,
          textual_score: data.textual_score || 0,
          practical_score: data.practical_score || 0,
          assessment_data: data.assessment_data,
          advice_seen: data.advice_seen ?? false
        };

        setLearningData(learningStyleData);
        setLoading(false);
      } catch (err) {
        console.error("Exception fetching learning data:", err);
      setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Mark advice as seen (must be before conditional returns to respect Rules of Hooks)
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

  // Don't show if loading, no data, or advice already seen
  if (loading || !learningData) {
    return null;
  }

  const assessmentData = learningData.assessment_data as AssessmentData | null;

  if (!assessmentData || !assessmentData.report) {
    return null;
  }

  const { report, score } = assessmentData;

  return (
    <Card className="p-6 border-primary/20 mb-6 bg-gradient-to-r from-primary/5 to-transparent">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground text-lg">تقرير الذكاء الاصطناعي</h3>
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
  );
}
