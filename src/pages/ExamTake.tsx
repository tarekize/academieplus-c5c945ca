import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppHeader } from "@/components/layout/AppHeader";
import { Loader2, FileText } from "lucide-react";
import ExamViewer from "@/components/exams/ExamViewer";
import { ExamExercise } from "@/lib/examTypes";
import { ExamProgressState, loadOrCreateExamProgress, resetExamProgress } from "@/lib/examProgress";

interface ExamInfo {
  id: string;
  title: string;
  title_ar: string | null;
  duration_minutes: number;
  content: ExamExercise[];
}

/** Page complète (pas de pop-up) où l'élève compose un examen : une zone de
 * réponse par question, un chrono qui décompte, et un bouton "Soumettre"
 * qui révèle la note à la fin. La progression (chrono + réponses + statut
 * par question) est chargée/sauvegardée via exam_progress, donc quitter puis
 * revenir sur l'examen reprend exactement là où l'élève s'était arrêté. */
export default function ExamTake() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<ExamInfo | null>(null);
  const [progress, setProgress] = useState<ExamProgressState | null>(null);

  useEffect(() => {
    if (!examId || !user) return;
    (async () => {
      setLoading(true);
      const [{ data, error }, progressState] = await Promise.all([
        supabase
          .from("exams" as any)
          .select("id, title, title_ar, duration_minutes, content")
          .eq("id", examId)
          .maybeSingle(),
        loadOrCreateExamProgress(examId, user.id),
      ]);
      if (!error && data) setExam(data as any);
      setProgress(progressState);
      setLoading(false);
    })();
  }, [examId, user]);

  /** "Refaire l'examen" depuis la pop-up de temps écoulé : remet la
   * progression à zéro côté serveur puis remonte ExamViewer (via sa `key`)
   * pour repartir sur un état totalement propre. */
  const handleRestart = async () => {
    if (!examId || !user) return;
    const fresh = await resetExamProgress(examId, user.id);
    setProgress(fresh);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!exam || !progress) {
    return (
      <div className="min-h-screen student-shell">
        <AppHeader title="Examen" titleIcon={FileText} onBack={() => navigate(-1)} />
        <main className="container mx-auto px-4 py-16 text-center text-muted-foreground">Examen introuvable.</main>
      </div>
    );
  }

  const normalizeExercises = (content: any): ExamExercise[] =>
    Array.isArray(content)
      ? content.map((item: any) => ({
          statement: item.statement || item.question || "",
          solution: item.solution || item.explanation || "",
          answer: item.answer || item.correct_answer || item.expected_answer || "",
          sub_questions: Array.isArray(item.sub_questions) && item.sub_questions.length >= 2 ? item.sub_questions : undefined,
        }))
      : [];

  return (
    <div className="min-h-screen student-shell">
      <AppHeader title={exam.title_ar || exam.title} titleIcon={FileText} onBack={() => navigate(-1)} />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <ExamViewer
          key={progress.startedAt}
          mode="student"
          durationMinutes={exam.duration_minutes}
          exercises={normalizeExercises(exam.content)}
          examTitle={exam.title_ar || exam.title}
          examId={exam.id}
          studentId={user?.id}
          startedAt={progress.startedAt}
          initialAnswers={progress.answers}
          initialStatus={progress.status}
          initialSubmitted={progress.submitted}
          onRestart={handleRestart}
        />
      </main>
    </div>
  );
}
