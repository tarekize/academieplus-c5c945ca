import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { HtmlWithMath } from "./HtmlWithMath";
import { cleanMathStatement } from "@/lib/mathStatement";
import { cn } from "@/lib/utils";
import { Users, BookOpen, Pencil, Eye, Lightbulb, CheckCircle2 } from "lucide-react";
import { recordTeacherContentAttempt } from "@/lib/teacherContentAttempt";
import ExerciseAnswerBlock from "./ExerciseAnswerBlock";
import { useTranslatedContent } from "@/hooks/useTranslatedContent";

interface TeacherContentRow {
  id: string;
  content_type: "exercise" | "quiz" | "exam";
  title: string | null;
  payload: any;
  difficulty: number | null;
  created_at: string;
}

interface Props {
  userId: string;
  /** "exercise" => exercises section ; "quiz" => quiz section */
  contentType: "exercise" | "quiz";
}

/** Liste, pour l'élève courant, les exercices/quiz créés par ses enseignants
 * (contenu assigné à sa classe ou directement à lui) — RLS sur
 * teacher_content_assignments garantit qu'il ne voit que ce qui lui est destiné. */
export function MyClassContent({ userId, contentType }: Props) {
  const { t, i18n } = useTranslation();
  const lang: "fr" | "ar" = i18n.language?.startsWith("fr") ? "fr" : "ar";
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<TeacherContentRow[]>([]);
  const [directIds, setDirectIds] = useState<Set<string>>(new Set());
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});
  const [correctIds, setCorrectIds] = useState<Set<string>>(new Set());
  const [showCorrectOnly, setShowCorrectOnly] = useState(false);

  /** Affiche l'indice d'un quiz (une seule fois) et journalise sa consultation. */
  const handleHint = (key: string, contentId: string) => {
    if (showHint[key]) return;
    setShowHint((h) => ({ ...h, [key]: true }));
    recordTeacherContentAttempt(contentId, userId, { hintDelta: 1 });
  };

  /** Révèle/masque la correction d'un quiz enseignant et journalise la
   * tentative (correcte ou non) auprès de l'enseignant. */
  const handleQuizCheck = (it: TeacherContentRow, p: any) => {
    if (revealed[it.id]) { setRevealed((r) => ({ ...r, [it.id]: false })); return; }
    const sel = selected[it.id];
    const correct = sel === p.correct_answer;
    setRevealed((r) => ({ ...r, [it.id]: true }));
    recordTeacherContentAttempt(it.id, userId, {
      attemptDelta: 1,
      errorDelta: correct ? 0 : 1,
      completed: true,
      isCorrect: correct,
      answer: sel || null,
    });
  };

  /** Charge les exercices/quiz assignés à l'élève, en excluant les examens
   * (page dédiée) et en distinguant les assignations directes (mises en avant)
   * des assignations par classe entière. */
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      // RLS limits assignments to mine (direct or via my classes).
      const { data: assignments } = await (supabase as any)
        .from("teacher_content_assignments")
        .select("content_id, student_id");
      const ids = Array.from(new Set((assignments || []).map((a: any) => a.content_id)));
      const direct = new Set<string>(
        (assignments || []).filter((a: any) => a.student_id === userId).map((a: any) => a.content_id)
      );
      if (ids.length === 0) {
        if (active) { setItems([]); setDirectIds(direct); setLoading(false); }
        return;
      }
      // Exams are excluded here: teacher-created exams live on the dedicated
      // exams page (/exams/list), not mixed into the lesson's exercise feed.
      const wanted = contentType === "exercise" ? ["exercise"] : ["quiz"];
      const { data } = await (supabase as any)
        .from("teacher_content")
        .select("id, content_type, title, payload, difficulty, created_at")
        .in("id", ids)
        .in("content_type", wanted)
        .order("created_at", { ascending: false });
      if (!active) return;
      const rows = (data as TeacherContentRow[]) || [];
      // Direct (student-specific) content first.
      rows.sort((a, b) => Number(direct.has(b.id)) - Number(direct.has(a.id)));
      setItems(rows);
      setDirectIds(direct);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [userId, contentType]);

  /** Détermine quels contenus sont déjà répondus correctement (pour la
   * bascule "إجابات صحيحة") — chargé au départ, puis tenu à jour en direct
   * puisque ExerciseAnswerBlock et handleQuizCheck écrivent tous deux dans
   * teacher_content_attempts indépendamment de ce composant. */
  useEffect(() => {
    if (items.length === 0) { setCorrectIds(new Set()); return; }
    let active = true;
    const ids = items.map((it) => it.id);
    (async () => {
      const { data } = await (supabase as any)
        .from("teacher_content_attempts")
        .select("content_id, completed, is_correct")
        .eq("student_id", userId)
        .in("content_id", ids);
      if (!active) return;
      setCorrectIds(new Set((data || []).filter((r: any) => r.completed && r.is_correct === true).map((r: any) => r.content_id)));
    })();
    const channel = supabase
      .channel(`my-class-content-attempts-${userId}-${contentType}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "teacher_content_attempts", filter: `student_id=eq.${userId}` },
        (payload: any) => {
          const row = payload.new;
          if (!row || !ids.includes(row.content_id)) return;
          setCorrectIds((prev) => {
            const next = new Set(prev);
            if (row.completed && row.is_correct === true) next.add(row.content_id);
            else next.delete(row.content_id);
            return next;
          });
        }
      )
      .subscribe();
    return () => { active = false; supabase.removeChannel(channel); };
  }, [items, userId, contentType]);

  if (loading) {
    return (
      <Card className="border-emerald-500/20">
        <CardContent className="p-4 space-y-3">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-lg" />)}
        </CardContent>
      </Card>
    );
  }

  const isQuiz = contentType === "quiz";
  const pendingItems = items.filter((it) => !correctIds.has(it.id));
  const displayedCount = showCorrectOnly ? correctIds.size : pendingItems.length;

  return (
    <Card className="border-emerald-500/20">
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-emerald-600 font-bold">
            <Users className="h-5 w-5" />
            <span>{isQuiz ? t("myClassContent.quizTitle") : t("myClassContent.exercisesTitle")}</span>
          </div>
          <div className="flex items-center gap-2">
            {correctIds.size > 0 && (
              <Button size="sm" variant={showCorrectOnly ? "default" : "outline"}
                onClick={() => setShowCorrectOnly((v) => !v)}
                className={cn("gap-2 rounded-full h-8 px-4 text-xs font-semibold shadow-sm transition-all hover:scale-105",
                  showCorrectOnly ? "bg-green-600 hover:bg-green-700 text-white" : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100")}>
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{showCorrectOnly ? t("lessonActivity.backToExercises") : t("lessonActivity.correctAnswers")}</span>
              </Button>
            )}
            <Badge variant="secondary">{isQuiz ? t("cours.quizCount", { count: displayedCount }) : t("cours.exercisesCount", { count: displayedCount })}</Badge>
          </div>
        </div>

        {showCorrectOnly ? (
          correctIds.size === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {isQuiz ? t("lessonActivity.noCorrectAnswersYet") : t("lessonActivity.noCorrectExercisesYet")}
            </div>
          ) : isQuiz ? (
            <div className="space-y-3">
              {items.filter((it) => correctIds.has(it.id)).map((it) => (
                <CompletedQuizContentCard key={it.id} it={it} lang={lang} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {items.filter((it) => correctIds.has(it.id)).map((it) => (
                <CompletedExerciseContentCard key={it.id} it={it} lang={lang} />
              ))}
            </div>
          )
        ) : pendingItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {isQuiz ? t("myClassContent.noQuizYet") : t("myClassContent.noExercisesYet")}
          </div>
        ) : isQuiz ? (
          <div className="space-y-3">
            {pendingItems.map((it) => (
              <QuizContentCard
                key={it.id}
                it={it}
                direct={directIds.has(it.id)}
                isRevealed={!!revealed[it.id]}
                selectedOption={selected[it.id]}
                hintShown={!!showHint[it.id]}
                lang={lang}
                onSelect={(opt) => setSelected((s) => ({ ...s, [it.id]: opt }))}
                onHint={() => handleHint(it.id, it.id)}
                onCheck={() => handleQuizCheck(it, it.payload || {})}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {pendingItems.map((it) => (
              <ExerciseContentCard key={it.id} it={it} direct={directIds.has(it.id)} lang={lang} userId={userId} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Carte d'un quiz enseignant : sélection d'une option puis révélation de la
 * correction/explication (traduite à la volée selon `lang`). */
function QuizContentCard({
  it, direct, isRevealed, selectedOption, hintShown, lang, onSelect, onHint, onCheck,
}: {
  it: TeacherContentRow;
  direct: boolean;
  isRevealed: boolean;
  selectedOption: string | undefined;
  hintShown: boolean;
  lang: "fr" | "ar";
  onSelect: (opt: string) => void;
  onHint: () => void;
  onCheck: () => void;
}) {
  const { t } = useTranslation();
  const p = it.payload || {};
  const options: string[] = Array.isArray(p.options) ? p.options : [];
  const translationInputs = [p.question || it.title || "", p.hint || "", p.explanation || "", ...options];
  const { translated } = useTranslatedContent(translationInputs, lang);
  const tQuestion = translated[0] || p.question || it.title || "";
  const tHint = translated[1] || p.hint || "";
  const tExplanation = translated[2] || p.explanation || "";
  const tOptions = translated.slice(3, 3 + options.length);

  return (
    <Card className={cn(direct && "border-2 border-red-500 bg-red-500/5")}>
      <CardContent className="p-4 space-y-3">
        {direct && (
          <Badge className="bg-red-600 hover:bg-red-600 text-white">{t("myClassContent.assignedToYou")}</Badge>
        )}
        <div className="flex items-center gap-3">
          <HtmlWithMath htmlContent={cleanMathStatement(tQuestion)} className="flex-1 font-medium" dir={lang === "fr" ? "ltr" : "rtl"} />
          <div className="flex items-center gap-0.5 shrink-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <Pencil key={i} className={cn("h-3.5 w-3.5", i < (it.difficulty || 3) ? "text-amber fill-orange-500/20" : "text-muted-foreground/20")} />
            ))}
          </div>
        </div>
        {options.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {options.map((opt, oIdx) => {
              const isSel = selectedOption === opt;
              const isCorrect = isRevealed && opt === p.correct_answer;
              const isWrong = isRevealed && isSel && opt !== p.correct_answer;
              return (
                // dir selon la langue active de l'UI (et non dir="auto" détecté sur
                // le contenu) + text-start (et non text-end) : text-align:end sous
                // RTL aligne à GAUCHE, pas à droite — une option purement arabe
                // partait donc du mauvais côté. text-start suit toujours le sens de
                // lecture naturel, quelle que soit la langue.
                <Button key={oIdx}
                  variant={isCorrect ? "default" : isWrong ? "destructive" : isSel ? "secondary" : "outline"}
                  className="justify-start text-start"
                  onClick={() => !isRevealed && onSelect(opt)}
                  dir={lang === "fr" ? "ltr" : "rtl"}>
                  <HtmlWithMath htmlContent={cleanMathStatement(tOptions[oIdx] || opt)} className="flex-1 text-start" dir={lang === "fr" ? "ltr" : "rtl"} />
                </Button>
              );
            })}
          </div>
        )}
        {p.hint && hintShown && (
          <div className="text-xs text-amber-700 dark:text-amber-400 bg-yellow-500/5 p-2 rounded" dir={lang === "fr" ? "ltr" : "rtl"}>💡 {tHint}</div>
        )}
        <div className="flex justify-end gap-2">
          {p.hint && !hintShown && (
            <Button size="sm" variant="ghost" onClick={onHint}>
              <Lightbulb className="h-4 w-4 mr-1" /> {t("exercisePlayer.hint")}
            </Button>
          )}
          <Button size="sm" variant="outline" disabled={!selectedOption}
            onClick={onCheck}>
            <Eye className="h-4 w-4 mr-1" /> {isRevealed ? t("exercisePlayer.hide") : t("exercisePlayer.check")}
          </Button>
        </div>
        {isRevealed && p.explanation && (
          <div className="bg-muted/50 p-3 rounded text-sm">
            <p className="font-semibold flex items-center gap-2 mb-1"><BookOpen className="h-4 w-4" /> {t("lessonActivity.explanationLabel")}</p>
            <HtmlWithMath htmlContent={cleanMathStatement(tExplanation)} dir={lang === "fr" ? "ltr" : "rtl"} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Carte d'un exercice enseignant : délègue la saisie/correction de la réponse
 * à ExerciseAnswerBlock (qui journalise la tentative). */
function ExerciseContentCard({ it, direct, lang, userId }: { it: TeacherContentRow; direct: boolean; lang: "fr" | "ar"; userId: string }) {
  const p = it.payload || {};
  const { translated } = useTranslatedContent([p.title || it.title || ""], lang);
  const tTitle = translated[0] || p.title || it.title || "";
  const { t } = useTranslation();

  return (
    <Card className={cn(direct && "border-2 border-red-500 bg-red-500/5")}>
      <CardContent className="p-4 space-y-3">
        {direct && (
          <Badge className="bg-red-600 hover:bg-red-600 text-white">{t("myClassContent.assignedToYou")}</Badge>
        )}
        <div className="flex items-center gap-3">
          <HtmlWithMath htmlContent={cleanMathStatement(tTitle)} className="flex-1 font-semibold" dir={lang === "fr" ? "ltr" : "rtl"} />
          <div className="flex items-center gap-0.5 shrink-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <Pencil key={i} className={cn("h-3.5 w-3.5", i < (it.difficulty || 3) ? "text-amber fill-orange-500/20" : "text-muted-foreground/20")} />
            ))}
          </div>
        </div>

        <ExerciseAnswerBlock
          contentId={it.id}
          userId={userId}
          statement={p.statement}
          expectedAnswer={p.expected_answer}
          solution={p.solution}
          hint={p.hint}
          subQuestions={p.sub_questions}
        />
      </CardContent>
    </Card>
  );
}

/** Carte en lecture seule pour un quiz enseignant déjà répondu correctement
 * (bascule "إجابات صحيحة") — contrairement à CompletedQuizCard du parcours
 * de cours, aucun fetch RPC n'est nécessaire : le payload teacher_content
 * contient déjà la réponse/explication complètes côté client. */
function CompletedQuizContentCard({ it, lang }: { it: TeacherContentRow; lang: "fr" | "ar" }) {
  const { t } = useTranslation();
  const p = it.payload || {};
  const [showAnswer, setShowAnswer] = useState(false);
  const translationInputs = [p.question || it.title || "", p.explanation || ""];
  const { translated } = useTranslatedContent(translationInputs, lang);
  const tQuestion = translated[0] || p.question || it.title || "";
  const tExplanation = translated[1] || p.explanation || "";

  return (
    <Card className="border-green-500/50 bg-green-500/5 transition-all hover:bg-green-500/10">
      <CardContent className="p-4 space-y-2">
        <HtmlWithMath htmlContent={cleanMathStatement(tQuestion)} className="font-medium" dir={lang === "fr" ? "ltr" : "rtl"} />
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="text-sm text-green-600 font-medium">{t("lessonActivity.correctAnswerLabelSimple")}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShowAnswer((v) => !v)}>
          {showAnswer ? t("lessonActivity.hideSolutionSimple") : t("lessonActivity.showSolutionSimple")}
        </Button>
        {showAnswer && (
          <div className="mt-2 space-y-3">
            <div className="p-3 rounded border border-green-200 dark:border-green-700 text-sm bg-green-500/10 text-green-800 dark:text-green-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-medium">{t("lessonActivity.theCorrectAnswerLabel")}</span>
              <HtmlWithMath htmlContent={cleanMathStatement(p.correct_answer || "—")} dir={lang === "fr" ? "ltr" : "rtl"} />
            </div>
            {p.explanation && (
              <div className="bg-white/50 dark:bg-black/20 p-4 rounded border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                <p className="font-semibold mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <BookOpen className="h-4 w-4" /> {t("lessonActivity.explanationLabel")}
                </p>
                <HtmlWithMath htmlContent={cleanMathStatement(tExplanation)} dir={lang === "fr" ? "ltr" : "rtl"} />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Équivalent de CompletedQuizContentCard pour un exercice enseignant déjà
 * réussi. */
function CompletedExerciseContentCard({ it, lang }: { it: TeacherContentRow; lang: "fr" | "ar" }) {
  const { t } = useTranslation();
  const p = it.payload || {};
  const [showSolution, setShowSolution] = useState(false);
  const translationInputs = [p.title || it.title || "", p.expected_answer || "", p.solution || ""];
  const { translated } = useTranslatedContent(translationInputs, lang);
  const tTitle = translated[0] || p.title || it.title || "";
  const tExpectedAnswer = translated[1] || p.expected_answer || "";
  const tSolution = translated[2] || p.solution || "";

  return (
    <Card className="border-green-500/50 bg-green-500/5 transition-all hover:bg-green-500/10">
      <CardContent className="p-4 space-y-2">
        <HtmlWithMath htmlContent={cleanMathStatement(tTitle)} className="font-semibold" dir={lang === "fr" ? "ltr" : "rtl"} />
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="text-sm text-green-600 font-medium">{t("lessonActivity.correctAnswerLabelSimple")}</span>
        </div>
        {(p.expected_answer || p.solution) && (
          <Button variant="ghost" size="sm" onClick={() => setShowSolution((v) => !v)}>
            {showSolution ? t("lessonActivity.hideSolutionSimple") : t("lessonActivity.showSolutionSimple")}
          </Button>
        )}
        {showSolution && (
          <div className="mt-2 space-y-2">
            {p.expected_answer && (
              <p className="text-sm"><span className="font-semibold">{t("exercisePlayer.theAnswerLabel")}</span>{" "}
                <HtmlWithMath htmlContent={cleanMathStatement(tExpectedAnswer)} className="inline" dir={lang === "fr" ? "ltr" : "rtl"} /></p>
            )}
            {p.solution && (
              <div className="bg-white/50 dark:bg-black/20 p-4 rounded border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                <p className="font-semibold mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <BookOpen className="h-4 w-4" /> {t("exercisePlayer.theSolutionLabel")}
                </p>
                <HtmlWithMath htmlContent={cleanMathStatement(tSolution)} dir={lang === "fr" ? "ltr" : "rtl"} />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
