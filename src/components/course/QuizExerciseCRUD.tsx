import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2, Sparkles, Send, CheckCircle2, XCircle, Clock, FileEdit } from "lucide-react";
import { toast } from "sonner";
import RichContentField from "./RichContentField";
import { extractFunctionErrorMessage } from "@/lib/edgeFunctionError";
import DocumentImportButton from "@/components/DocumentImportButton";
import { GeneratedItem } from "@/lib/teacherContent";
import { ExpandableText } from "@/components/ui/expandable-text";

export type ItemType = "exercise" | "quiz" | "chapter" | "lesson_creation";
export type ItemStatus = "draft" | "pending" | "approved" | "rejected";

/** Badge d'état de validation — rien pour "approved" (état normal, publié). */
export function StatusBadge({ status, rejectionReason }: { status?: string; rejectionReason?: string | null }) {
  const { t } = useTranslation();
  if (!status || status === "approved") return null;
  if (status === "draft") {
    return <Badge variant="secondary" className="gap-1 w-fit"><FileEdit className="h-3 w-3" /> {t("quizExerciseCRUD.statusDraft")}</Badge>;
  }
  if (status === "pending") {
    return <Badge className="bg-warning hover:bg-warning text-warning-foreground gap-1 w-fit"><Clock className="h-3 w-3" /> {t("quizExerciseCRUD.statusPending")}</Badge>;
  }
  return (
    <div className="flex flex-col gap-1 max-w-xs">
      <Badge variant="destructive" className="gap-1 w-fit"><XCircle className="h-3 w-3" /> {t("quizExerciseCRUD.statusRejected")}</Badge>
      {rejectionReason && <ExpandableText text={rejectionReason} className="text-xs text-destructive" />}
    </div>
  );
}

/** Pédago : envoie un item (brouillon ou refusé, corrigé) à l'admin pour validation. */
export function SubmitItemButton({ itemType, itemId, onSubmitted }: { itemType: ItemType; itemId: string; onSubmitted: () => void }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc("submit_chapter_item_for_review" as any, { p_item_type: itemType, p_item_id: itemId });
      if (error) throw error;
      toast.success(t("quizExerciseCRUD.submitSent"));
      onSubmitted();
    } catch (e: any) {
      toast.error(e.message || t("quizExerciseCRUD.submitError"));
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button size="sm" variant="outline" className="gap-1" onClick={handleSubmit} disabled={loading}>
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
      {t("quizExerciseCRUD.submitForReview")}
    </Button>
  );
}

/** Pédago : envoie en une fois tous les brouillons/refusés d'un niveau (exercices ou quiz). */
export function SubmitAllDraftsButton({ itemType, chapterId, lessonId, count, onSubmitted }: {
  itemType: ItemType; chapterId: string; lessonId?: string; count: number; onSubmitted: () => void;
}) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  if (count === 0) return null;
  const handleClick = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("submit_chapter_items_for_review" as any, {
        p_item_type: itemType, p_chapter_id: chapterId, p_lesson_id: lessonId ?? null,
      });
      if (error) throw error;
      toast.success(t("quizExerciseCRUD.submitAllSent", { count: data }));
      onSubmitted();
    } catch (e: any) {
      toast.error(e.message || t("quizExerciseCRUD.submitError"));
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button size="sm" variant="outline" className="gap-1" onClick={handleClick} disabled={loading}>
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
      {t("quizExerciseCRUD.submitAll", { count })}
    </Button>
  );
}

/** Admin : accepte (publie aux élèves) ou refuse (motif optionnel) un item en attente. */
export function ReviewActionButtons({ itemType, itemId, onReviewed }: { itemType: ItemType; itemId: string; onReviewed: () => void }) {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const dir = i18n.language === "ar" ? "rtl" : "ltr";

  const approve = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc("approve_chapter_item" as any, { p_item_type: itemType, p_item_id: itemId });
      if (error) throw error;
      toast.success(t("quizExerciseCRUD.approveSuccess"));
      onReviewed();
    } catch (e: any) {
      toast.error(e.message || t("quizExerciseCRUD.approveError"));
    } finally {
      setLoading(false);
    }
  };

  const reject = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc("reject_chapter_item" as any, { p_item_type: itemType, p_item_id: itemId, p_reason: reason.trim() || null });
      if (error) throw error;
      toast.success(t("quizExerciseCRUD.rejectSuccess"));
      setRejectOpen(false);
      setReason("");
      onReviewed();
    } catch (e: any) {
      toast.error(e.message || t("quizExerciseCRUD.rejectError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex gap-1.5">
        <Button size="sm" onClick={approve} disabled={loading} className="gap-1 bg-green-600 hover:bg-green-700">
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
          {t("quizExerciseCRUD.approve")}
        </Button>
        <Button size="sm" variant="destructive" onClick={() => setRejectOpen(true)} disabled={loading} className="gap-1">
          <XCircle className="h-3 w-3" /> {t("quizExerciseCRUD.reject")}
        </Button>
      </div>
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle dir={dir}>{t("quizExerciseCRUD.rejectReasonTitle")}</DialogTitle></DialogHeader>
          <Textarea
            dir={dir}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t("quizExerciseCRUD.rejectReasonPlaceholder")}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>{t("app.cancel")}</Button>
            <Button variant="destructive" onClick={reject} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {t("quizExerciseCRUD.rejectConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---- Quiz CRUD ----
interface QuizFormProps {
  chapterId: string;
  lessonId?: string;
  onSaved: () => void;
  quiz?: { id: string; question: string; options: string[]; correct_answer: string; explanation: string | null; difficulty?: number; hint?: string | null };
}

export function QuizFormDialog({ chapterId, lessonId, onSaved, quiz }: QuizFormProps) {
  const { t, i18n } = useTranslation();
  const dir = i18n.language === "ar" ? "rtl" : "ltr";
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState(quiz?.question || "");
  const [options, setOptions] = useState<string[]>(quiz?.options || ["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(quiz?.correct_answer || "");
  const [explanation, setExplanation] = useState(quiz?.explanation || "");
  const [hint, setHint] = useState(quiz?.hint || "");
  const [difficulty, setDifficulty] = useState(quiz?.difficulty || 1);
  const isEdit = !!quiz;

  const handleSubmit = async () => {
    if (!question.trim() || !correctAnswer.trim()) {
      toast.error(t("quizExerciseCRUD.quiz.validationError"));
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        const { error } = await supabase.from("chapter_quizzes").update({
          question: question.trim(),
          options: options.filter(o => o.trim()),
          correct_answer: correctAnswer.trim(),
          explanation: explanation.trim() || null,
          hint: hint.trim() || null,
          difficulty: difficulty,
        }).eq("id", quiz.id);
        if (error) throw error;
        toast.success(t("quizExerciseCRUD.quiz.updateSuccess"));
      } else {
        const { error } = await supabase.from("chapter_quizzes").insert({
          chapter_id: chapterId,
          lesson_id: lessonId ?? null,
          question: question.trim(),
          options: options.filter(o => o.trim()),
          correct_answer: correctAnswer.trim(),
          explanation: explanation.trim() || null,
          hint: hint.trim() || null,
          difficulty: difficulty,
        });
        if (error) throw error;
        toast.success(t("quizExerciseCRUD.quiz.addSuccess"));
      }
      setOpen(false);
      onSaved();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => {
      setOpen(v);
      if (v && quiz) {
        setQuestion(quiz.question);
        setOptions(quiz.options.length >= 4 ? quiz.options : [...quiz.options, ...Array(4 - quiz.options.length).fill("")]);
        setCorrectAnswer(quiz.correct_answer);
        setExplanation(quiz.explanation || "");
        setHint(quiz.hint || "");
        setDifficulty(quiz.difficulty || 1);
      }
    }}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="h-3 w-3" /></Button>
        ) : (
          <Button variant="outline" size="sm" className="gap-1"><Plus className="h-3 w-3" />{t("quizExerciseCRUD.quiz.newButton")}</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle dir={dir}>{isEdit ? t("quizExerciseCRUD.quiz.editTitle") : t("quizExerciseCRUD.quiz.newTitle")}</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2" dir={dir}>
          <RichContentField label={t("quizExerciseCRUD.quiz.questionLabel")} value={question} onChange={setQuestion} minHeight={120} />
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("quizExerciseCRUD.quiz.optionsLabel")}</label>
            {options.map((opt, i) => (
              <Input key={i} value={opt} onChange={(e) => { const n = [...options]; n[i] = e.target.value; setOptions(n); }}
                placeholder={t("quizExerciseCRUD.quiz.optionPlaceholder", { n: i + 1 })} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">{t("quizExerciseCRUD.quiz.correctAnswerLabel")}</label>
              <Input value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} placeholder={t("quizExerciseCRUD.quiz.correctAnswerPlaceholder")} />
            </div>
            <div>
              <label className="text-sm font-medium">{t("quizExerciseCRUD.quiz.difficultyLabel")}</label>
              <Select value={difficulty.toString()} onValueChange={(v) => setDifficulty(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue placeholder={t("quizExerciseCRUD.quiz.difficultyPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{t("quizExerciseCRUD.quiz.difficulty1")}</SelectItem>
                  <SelectItem value="2">{t("quizExerciseCRUD.quiz.difficulty2")}</SelectItem>
                  <SelectItem value="3">{t("quizExerciseCRUD.quiz.difficulty3")}</SelectItem>
                  <SelectItem value="4">{t("quizExerciseCRUD.quiz.difficulty4")}</SelectItem>
                  <SelectItem value="5">{t("quizExerciseCRUD.quiz.difficulty5")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <RichContentField label={t("quizExerciseCRUD.quiz.explanationLabel")} value={explanation} onChange={setExplanation} minHeight={100} />
          <div>
            <label className="text-sm font-medium">{t("quizExerciseCRUD.quiz.hintLabel")}</label>
            <Textarea value={hint} onChange={(e) => setHint(e.target.value)} placeholder={t("quizExerciseCRUD.quiz.hintPlaceholder")} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>{t("app.cancel")}</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEdit ? t("app.edit") : t("app.add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteQuizButton({ quizId, onDeleted }: { quizId: string; onDeleted: () => void }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from("chapter_quizzes").delete().eq("id", quizId);
      if (error) throw error;
      toast.success(t("quizExerciseCRUD.quiz.deleteSuccess"));
      onDeleted();
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3 w-3" /></Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>{t("quizExerciseCRUD.quiz.deleteConfirmTitle")}</AlertDialogTitle>
          <AlertDialogDescription>{t("quizExerciseCRUD.quiz.deleteConfirmDescription")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("app.cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-destructive text-destructive-foreground">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("app.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ---- Exercise CRUD ----
interface ExerciseFormProps {
  chapterId: string;
  lessonId?: string;
  onSaved: () => void;
  exercise?: { id: string; title: string; statement: string; expected_answer?: string; accepted_answers?: string[]; solution?: string; difficulty?: number; hint?: string | null };
}

export function ExerciseFormDialog({ chapterId, lessonId, onSaved, exercise }: ExerciseFormProps) {
  const { t, i18n } = useTranslation();
  const dir = i18n.language === "ar" ? "rtl" : "ltr";
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(exercise?.title || "");
  const [statement, setStatement] = useState(exercise?.statement || "");
  const [expectedAnswer, setExpectedAnswer] = useState(exercise?.expected_answer || "");
  const [acceptedAnswers, setAcceptedAnswers] = useState(exercise?.accepted_answers?.join(", ") || "");
  const [solution, setSolution] = useState(exercise?.solution || "");
  const [hint, setHint] = useState(exercise?.hint || "");
  const [difficulty, setDifficulty] = useState(exercise?.difficulty || 1);
  const isEdit = !!exercise;

  const handleSubmit = async () => {
    if (!title.trim() || !statement.trim()) {
      toast.error(t("quizExerciseCRUD.exercise.validationError"));
      return;
    }
    setLoading(true);
    try {
      const data = {
        title: title.trim(),
        statement: statement.trim(),
        expected_answer: expectedAnswer.trim(),
        accepted_answers: acceptedAnswers.split(",").map(s => s.trim()).filter(Boolean),
        solution: solution.trim(),
        hint: hint.trim() || null,
        difficulty: difficulty,
      };
      if (isEdit) {
        const { error } = await supabase.from("chapter_exercises").update(data).eq("id", exercise.id);
        if (error) throw error;
        toast.success(t("quizExerciseCRUD.exercise.updateSuccess"));
      } else {
        const { error } = await supabase.from("chapter_exercises").insert({ chapter_id: chapterId, lesson_id: lessonId ?? null, ...data });
        if (error) throw error;
        toast.success(t("quizExerciseCRUD.exercise.addSuccess"));
      }
      setOpen(false);
      onSaved();
    } catch (error: any) { toast.error(error.message); } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => {
      setOpen(v);
      if (v && exercise) {
        setTitle(exercise.title); setStatement(exercise.statement);
        setExpectedAnswer(exercise.expected_answer);
        setAcceptedAnswers(exercise.accepted_answers?.join(", ") || "");
        setSolution(exercise.solution);
        setHint(exercise.hint || "");
        setDifficulty(exercise.difficulty || 1);
      }
    }}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="h-3 w-3" /></Button>
        ) : (
          <Button variant="outline" size="sm" className="gap-1"><Plus className="h-3 w-3" />{t("quizExerciseCRUD.exercise.newButton")}</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle dir={dir}>{isEdit ? t("quizExerciseCRUD.exercise.editTitle") : t("quizExerciseCRUD.exercise.newTitle")}</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2" dir={dir}>
          <div>
            <label className="text-sm font-medium">{t("quizExerciseCRUD.exercise.titleLabel")}</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("quizExerciseCRUD.exercise.titlePlaceholder")} />
          </div>
          <RichContentField label={t("quizExerciseCRUD.exercise.statementLabel")} value={statement} onChange={setStatement} minHeight={120} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">{t("quizExerciseCRUD.exercise.expectedAnswerLabel")}</label>
              <Input value={expectedAnswer} onChange={(e) => setExpectedAnswer(e.target.value)} placeholder={t("quizExerciseCRUD.exercise.expectedAnswerPlaceholder")} />
            </div>
            <div>
              <label className="text-sm font-medium">{t("quizExerciseCRUD.quiz.difficultyLabel")}</label>
              <Select value={difficulty.toString()} onValueChange={(v) => setDifficulty(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue placeholder={t("quizExerciseCRUD.quiz.difficultyPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{t("quizExerciseCRUD.quiz.difficulty1")}</SelectItem>
                  <SelectItem value="2">{t("quizExerciseCRUD.quiz.difficulty2")}</SelectItem>
                  <SelectItem value="3">{t("quizExerciseCRUD.quiz.difficulty3")}</SelectItem>
                  <SelectItem value="4">{t("quizExerciseCRUD.quiz.difficulty4")}</SelectItem>
                  <SelectItem value="5">{t("quizExerciseCRUD.quiz.difficulty5")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">{t("quizExerciseCRUD.exercise.acceptedAnswersLabel")}</label>
            <Input value={acceptedAnswers} onChange={(e) => setAcceptedAnswers(e.target.value)} placeholder={t("quizExerciseCRUD.exercise.acceptedAnswersPlaceholder")} />
          </div>
          <RichContentField label={t("quizExerciseCRUD.exercise.solutionLabel")} value={solution} onChange={setSolution} minHeight={140} />
          <div>
            <label className="text-sm font-medium">{t("quizExerciseCRUD.quiz.hintLabel")}</label>
            <Textarea value={hint} onChange={(e) => setHint(e.target.value)} placeholder={t("quizExerciseCRUD.quiz.hintPlaceholder")} className="min-h-[60px]" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>{t("app.cancel")}</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEdit ? t("app.edit") : t("app.add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteExerciseButton({ exerciseId, onDeleted }: { exerciseId: string; onDeleted: () => void }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from("chapter_exercises").delete().eq("id", exerciseId);
      if (error) throw error;
      toast.success(t("quizExerciseCRUD.exercise.deleteSuccess"));
      onDeleted();
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3 w-3" /></Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>{t("quizExerciseCRUD.exercise.deleteConfirmTitle")}</AlertDialogTitle>
          <AlertDialogDescription>{t("quizExerciseCRUD.exercise.deleteConfirmDescription")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("app.cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-destructive text-destructive-foreground">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("app.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ---- Import from document (extraction IA, pas de génération) ----
/** Insère les items extraits d'un document dans chapter_exercises/chapter_quizzes,
 * même logique de statut que bulk-gen-terminale-gemini : le contenu IA d'un pédago
 * reste en 'draft' (à envoyer pour validation), celui d'un admin est auto-approuvé. */
export function ImportFromDocumentButton({
  chapterId,
  lessonId,
  itemType,
  isAdmin,
  onImported,
}: {
  chapterId: string;
  lessonId: string;
  itemType: ItemType;
  isAdmin: boolean;
  onImported: () => void;
}) {
  const { t } = useTranslation();
  const insertItems = async (items: GeneratedItem[]) => {
    const status = isAdmin ? "approved" : "draft";
    if (itemType === "exercise") {
      const rows = items
        .filter((it) => it.statement?.trim())
        .map((it, i) => ({
          chapter_id: chapterId,
          lesson_id: lessonId,
          title: (it.title || t("quizExerciseCRUD.import.defaultExerciseTitle", { n: i + 1 })).slice(0, 300),
          statement: it.statement || "",
          expected_answer: it.expected_answer || "",
          accepted_answers: [] as string[],
          solution: it.solution || "",
          hint: it.hint || "",
          difficulty: Math.min(5, Math.max(1, it.difficulty || 2)),
          status,
        }));
      if (rows.length === 0) { toast.error(t("quizExerciseCRUD.import.noExercise")); return; }
      const { error } = await supabase.from("chapter_exercises").insert(rows);
      if (error) throw error;
    } else {
      const rows = items
        .filter((it) => it.question?.trim())
        .map((it) => ({
          chapter_id: chapterId,
          lesson_id: lessonId,
          question: it.question || "",
          options: Array.isArray(it.options) ? it.options : [],
          correct_answer: it.correct_answer || "",
          explanation: it.explanation || "",
          hint: it.hint || "",
          difficulty: Math.min(5, Math.max(1, it.difficulty || 2)),
          status,
        }));
      if (rows.length === 0) { toast.error(t("quizExerciseCRUD.import.noQuiz")); return; }
      const { error } = await supabase.from("chapter_quizzes").insert(rows);
      if (error) throw error;
    }
    onImported();
  };

  return (
    <DocumentImportButton
      contentType={itemType}
      label={t("quizExerciseCRUD.import.buttonLabel")}
      onExtracted={(items) => {
        insertItems(items).catch((e: any) => toast.error(e.message || t("quizExerciseCRUD.import.error")));
      }}
    />
  );
}

// ---- Generate with AI button ----
type ContentType = "exercises" | "quizzes";
type Section = "discover" | "understand";

export function GenerateQuizExercisesButton({
  chapterId,
  lessonId,
  onGenerated,
  lockedContentType,
}: {
  chapterId: string;
  lessonId: string;
  onGenerated: () => void;
  /** Si fourni, verrouille le type de contenu généré (sans poser la question) — utilisé quand
   * le bouton est déclenché depuis l'onglet "Exercices" ou l'onglet "QCM". */
  lockedContentType?: ContentType;
}) {
  const { t, i18n } = useTranslation();
  const dir = i18n.language === "ar" ? "rtl" : "ltr";
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [mode, setMode] = useState<"add" | "replace">("add");
  const [sections, setSections] = useState<Section[]>(["discover", "understand"]);
  const [contentTypes, setContentTypes] = useState<ContentType[]>(
    lockedContentType ? [lockedContentType] : ["exercises", "quizzes"]
  );
  const [count, setCount] = useState(10);
  const [difficultyMin, setDifficultyMin] = useState(1);
  const [difficultyMax, setDifficultyMax] = useState(5);

  const toggleSection = (s: Section) => {
    setSections((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };
  const toggleContentType = (type: ContentType) => {
    if (lockedContentType) return;
    setContentTypes((prev) => (prev.includes(type) ? prev.filter((x) => x !== type) : [...prev, type]));
  };

  const handleGenerate = async () => {
    if (sections.length === 0) {
      toast.error(t("quizExerciseCRUD.generate.sectionsRequired"));
      return;
    }
    if (contentTypes.length === 0) {
      toast.error(t("quizExerciseCRUD.generate.typesRequired"));
      return;
    }
    if (difficultyMin > difficultyMax) {
      toast.error(t("quizExerciseCRUD.generate.difficultyRangeError"));
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("bulk-gen-terminale-gemini", {
        body: {
          chapter_id: chapterId,
          lesson_id: lessonId,
          replace: mode === "replace",
          sections,
          content_types: contentTypes,
          count,
          difficulty_min: difficultyMin,
          difficulty_max: difficultyMax,
        },
      });
      if (error) throw new Error(await extractFunctionErrorMessage(error));
      if (data?.success === false) throw new Error(data.error || t("quizExerciseCRUD.generate.genericError"));
      if (data?.error) throw new Error(data.error);
      const quizCount = data?.inserted_quizzes ?? 0;
      const exerciseCount = data?.inserted_exercises ?? 0;
      toast.success(t("quizExerciseCRUD.generate.successMessage", { exercises: exerciseCount, quizzes: quizCount }));
      setOpenDialog(false);
      onGenerated();
    } catch (err: any) {
      toast.error(err.message || t("quizExerciseCRUD.generate.genericError"));
    } finally {
      setLoading(false);
    }
  };

  const typeLabel = lockedContentType === "exercises"
    ? t("quizExerciseCRUD.generate.exercisesOnly")
    : lockedContentType === "quizzes"
      ? t("quizExerciseCRUD.generate.quizzesOnly")
      : null;

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Sparkles className="h-3 w-3" />
          {t("quizExerciseCRUD.generate.buttonLabel")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle dir={dir}>{t("quizExerciseCRUD.generate.dialogTitle")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2" dir={dir}>
          {/* Ajouter / Remplacer */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t("quizExerciseCRUD.generate.modeLabel")}</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className={`p-2.5 border-2 rounded-lg text-sm transition-all ${mode === "add" ? "border-primary bg-primary/5 font-medium" : "border-border hover:border-primary/50"}`}
                onClick={() => setMode("add")}
              >
                {t("quizExerciseCRUD.generate.modeAdd")}
              </button>
              <button
                type="button"
                className={`p-2.5 border-2 rounded-lg text-sm transition-all ${mode === "replace" ? "border-destructive bg-destructive/5 font-medium text-destructive" : "border-border hover:border-destructive/50"}`}
                onClick={() => setMode("replace")}
              >
                {t("quizExerciseCRUD.generate.modeReplace")}
              </button>
            </div>
          </div>

          {/* Emplacement : Découvrir / Comprendre */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t("quizExerciseCRUD.generate.placementLabel")}</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={sections.includes("discover")} onCheckedChange={() => toggleSection("discover")} />
                {t("quizExerciseCRUD.generate.discoverOption")}
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={sections.includes("understand")} onCheckedChange={() => toggleSection("understand")} />
                {t("quizExerciseCRUD.generate.understandOption")}
              </label>
            </div>
            {sections.length === 2 && (
              <p className="text-xs text-muted-foreground">{t("quizExerciseCRUD.generate.bothSectionsHint")}</p>
            )}
          </div>

          {/* Type : Exercices / Quiz */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t("quizExerciseCRUD.generate.typeLabel")}</Label>
            {typeLabel ? (
              <p className="text-sm px-3 py-2 rounded-md bg-muted font-medium">{typeLabel}</p>
            ) : (
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={contentTypes.includes("exercises")} onCheckedChange={() => toggleContentType("exercises")} />
                  {t("quizExerciseCRUD.generate.exercisesOption")}
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={contentTypes.includes("quizzes")} onCheckedChange={() => toggleContentType("quizzes")} />
                  {t("quizExerciseCRUD.generate.quizzesOption")}
                </label>
              </div>
            )}
            {contentTypes.length === 2 && (
              <p className="text-xs text-muted-foreground">{t("quizExerciseCRUD.generate.bothTypesHint")}</p>
            )}
          </div>

          {/* Nombre */}
          <div>
            <Label className="text-sm font-medium">{t("quizExerciseCRUD.generate.countLabel")}</Label>
            <Input
              type="number"
              min={1}
              max={20}
              value={count}
              onChange={(e) => setCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
            />
          </div>

          {/* Niveau min / max */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">{t("quizExerciseCRUD.generate.minDifficultyLabel")}</Label>
              <Select value={difficultyMin.toString()} onValueChange={(v) => setDifficultyMin(parseInt(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">{t("quizExerciseCRUD.generate.maxDifficultyLabel")}</Label>
              <Select value={difficultyMax.toString()} onValueChange={(v) => setDifficultyMax(parseInt(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpenDialog(false)}>{t("app.cancel")}</Button>
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className={mode === "replace" ? "bg-destructive hover:bg-destructive/90" : ""}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("quizExerciseCRUD.generate.generating")}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {t("quizExerciseCRUD.generate.generateButton")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
