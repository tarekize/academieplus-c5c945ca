import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Pencil, Trash2, Play, Clock, FileText, BookOpenCheck, Search, Sparkles, Loader2, Share2, GraduationCap, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { AppHeader } from "@/components/layout/AppHeader";
import { cn } from "@/lib/utils";
import ExerciseAnswerBlock from "@/components/course/ExerciseAnswerBlock";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ExamExercise {
  statement: string;
  solution: string;
  answer: string;
}

interface Exam {
  id: string;
  title: string;
  title_ar: string | null;
  description: string | null;
  content: any;
  duration_minutes: number;
  created_at: string;
}

interface ChapterOption {
  id: string;
  title: string;
}

interface AIExerciseRow {
  chapter_id: string;
  statement: string;
  solution: string;
  answer: string;
  generating: boolean;
}

interface TeacherExam {
  id: string;
  title: string | null;
  payload: any;
  difficulty: number | null;
  created_at: string;
  teacher_id: string;
}

const ExamList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const niveau = searchParams.get("niveau") || "";
  const subject = searchParams.get("subject") || "math";
  const trimester = parseInt(searchParams.get("trimester") || "1");
  const { toast } = useToast();
  const { user: authUser } = useAuth();

  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [canManage, setCanManage] = useState(false);
  const [editExam, setEditExam] = useState<Exam | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [viewExam, setViewExam] = useState<Exam | null>(null);
  const [chapters, setChapters] = useState<ChapterOption[]>([]);

  // Source tab: official (pédago/admin) exams vs exams sent by a teacher
  const [source, setSource] = useState<"official" | "teacher">("official");
  const [teacherExams, setTeacherExams] = useState<TeacherExam[]>([]);
  const [loadingTeacherExams, setLoadingTeacherExams] = useState(true);
  const [teacherNames, setTeacherNames] = useState<Record<string, string>>({});
  const [viewTeacherExam, setViewTeacherExam] = useState<TeacherExam | null>(null);

  // Manual form state
  const [formTitle, setFormTitle] = useState("");
  const [formDuration, setFormDuration] = useState(60);
  const [formExercises, setFormExercises] = useState<ExamExercise[]>([
    { statement: "", solution: "", answer: "" },
  ]);
  const [saving, setSaving] = useState(false);

  // AI form state
  const [aiOpen, setAiOpen] = useState(false);
  const [aiTitle, setAiTitle] = useState("");
  const [aiDuration, setAiDuration] = useState(60);
  const [aiCount, setAiCount] = useState(3);
  const [aiRows, setAiRows] = useState<AIExerciseRow[]>([]);
  const [aiSaving, setAiSaving] = useState(false);

  const trimesterLabels: Record<number, string> = {
    1: "اختبارات الفصل الأول",
    2: "اختبارات الفصل الثاني",
    3: "اختبارات الفصل الثالث",
    4: "بكالوريا بيضاء",
    5: "بكالوريا نهائية",
  };

  const trimesterLabelsFr: Record<number, string> = {
    1: "1er Trimestre",
    2: "2ème Trimestre",
    3: "3ème Trimestre",
    4: "Bac Blanc",
    5: "Bac Finale",
  };

  const trimesterColors: Record<number, string> = {
    1: "from-blue-500 to-blue-600",
    2: "from-emerald-500 to-emerald-600",
    3: "from-amber-500 to-orange-500",
    4: "from-violet-500 to-purple-600",
    5: "from-rose-500 to-red-600",
  };

  const fetchExams = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("exams" as any)
      .select("*")
      .eq("school_level", niveau)
      .eq("trimester", trimester)
      .eq("subject", subject)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setExams(data as any[]);
    }
    setLoading(false);
  };

  const fetchChapters = async () => {
    const { data, error } = await supabase
      .from("chapters")
      .select("id, title, title_ar")
      .eq("school_level", niveau as any)
      .eq("subject", subject)
      .order("order_index", { ascending: true });

    if (!error && data) {
      setChapters(
        (data as any[]).map((c) => ({ id: c.id, title: c.title_ar || c.title }))
      );
    }
  };

  const checkRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    const r = roles?.map((x) => x.role) || [];
    setCanManage(r.includes("admin") || r.includes("pedago"));
  };

  const fetchTeacherExams = async () => {
    setLoadingTeacherExams(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setTeacherExams([]); setLoadingTeacherExams(false); return; }

    // Same pattern as MyClassContent: assignments are RLS-scoped to what this user can see.
    const { data: assignments } = await (supabase as any)
      .from("teacher_content_assignments")
      .select("content_id");
    const ids = Array.from(new Set(((assignments as any[]) || []).map((a) => a.content_id)));
    if (ids.length === 0) { setTeacherExams([]); setLoadingTeacherExams(false); return; }

    const { data } = await (supabase as any)
      .from("teacher_content")
      .select("id, title, payload, difficulty, created_at, teacher_id")
      .in("id", ids)
      .eq("content_type", "exam")
      .eq("school_level", niveau)
      .order("created_at", { ascending: false });

    // Each exam is scoped to a trimester (or Bac Blanc/Finale) chosen by the teacher
    // when creating it, so it only shows up on that specific trimester's page.
    const rows = ((data as TeacherExam[]) || []).filter((r) => Number(r.payload?.trimester) === trimester);
    setTeacherExams(rows);
    setLoadingTeacherExams(false);

    const teacherIds = Array.from(new Set(rows.map((r) => r.teacher_id)));
    if (teacherIds.length > 0) {
      const { data: profs } = await supabase.from("profiles").select("id, first_name, last_name").in("id", teacherIds);
      const map: Record<string, string> = {};
      (profs || []).forEach((p: any) => {
        map[p.id] = `${p.first_name || ""} ${p.last_name || ""}`.trim() || "Enseignant";
      });
      setTeacherNames(map);
    }
  };

  useEffect(() => {
    checkRole();
    fetchExams();
    fetchChapters();
    fetchTeacherExams();
  }, [niveau, trimester, subject]);

  const normalizeExercises = (content: any): ExamExercise[] => {
    if (Array.isArray(content)) {
      return content.map((item: any) => ({
        statement: item.statement || item.question || "",
        solution: item.solution || item.explanation || "",
        answer: item.answer || item.correct_answer || item.expected_answer || "",
      }));
    }
    return [{ statement: "", solution: "", answer: "" }];
  };

  const openCreateForm = () => {
    setEditExam(null);
    setFormTitle("");
    setFormDuration(60);
    setFormExercises([{ statement: "", solution: "", answer: "" }]);
    setFormOpen(true);
  };

  const openEditForm = (exam: Exam) => {
    setEditExam(exam);
    setFormTitle(exam.title_ar || exam.title || "");
    setFormDuration(exam.duration_minutes);
    setFormExercises(normalizeExercises(exam.content));
    setFormOpen(true);
  };

  const updateExercise = (index: number, field: keyof ExamExercise, value: string) => {
    setFormExercises((prev) =>
      prev.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex))
    );
  };

  const addExercise = () => {
    setFormExercises((prev) => [...prev, { statement: "", solution: "", answer: "" }]);
  };

  const removeExercise = (index: number) => {
    setFormExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const buildPayload = (title: string, duration: number, exercises: ExamExercise[], userId: string) => ({
    title: title || "اختبار",
    title_ar: title || null,
    description: null,
    content: exercises.filter((e) => e.statement.trim()),
    duration_minutes: duration,
    school_level: niveau,
    trimester,
    subject,
    created_by: userId,
  });

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const validExercises = formExercises.filter((e) => e.statement.trim());
    if (validExercises.length === 0) {
      toast({ title: "خطأ", description: "أضف تمريناً واحداً على الأقل مع الإنشاء", variant: "destructive" });
      return;
    }

    setSaving(true);
    const payload = buildPayload(formTitle, formDuration, validExercises, user.id);

    if (editExam) {
      const { error } = await supabase.from("exams" as any).update(payload as any).eq("id", editExam.id);
      setSaving(false);
      if (error) {
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "تم مشاركة الاختبار بنجاح" });
    } else {
      const { error } = await supabase.from("exams" as any).insert(payload as any);
      setSaving(false);
      if (error) {
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "تم مشاركة الاختبار بنجاح" });
    }

    setFormOpen(false);
    fetchExams();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("exams" as any).delete().eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "تم الحذف بنجاح" });
    fetchExams();
  };

  // ============ AI Dialog ============
  const openAIForm = () => {
    setAiTitle("");
    setAiDuration(60);
    setAiCount(3);
    setAiRows(
      Array.from({ length: 3 }, () => ({ chapter_id: "", statement: "", solution: "", answer: "", generating: false }))
    );
    setAiOpen(true);
  };

  const changeAiCount = (count: number) => {
    setAiCount(count);
    setAiRows((prev) => {
      const next = [...prev];
      if (count > prev.length) {
        for (let i = prev.length; i < count; i++) {
          next.push({ chapter_id: "", statement: "", solution: "", answer: "", generating: false });
        }
      } else {
        next.length = count;
      }
      return next;
    });
  };

  const updateAiRow = (index: number, field: keyof AIExerciseRow, value: any) => {
    setAiRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const generateAiExercise = async (index: number) => {
    const row = aiRows[index];
    if (!row.chapter_id) {
      toast({ title: "خطأ", description: "اختر الفصل أولاً", variant: "destructive" });
      return;
    }
    updateAiRow(index, "generating", true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-exam-exercise", {
        body: { chapter_id: row.chapter_id },
      });
      if (error) throw error;
      const ex = data?.exercise;
      if (!ex?.statement) throw new Error("لم يتم توليد التمرين");
      setAiRows((prev) =>
        prev.map((r, i) =>
          i === index
            ? { ...r, statement: ex.statement, solution: ex.solution || "", answer: ex.answer || "", generating: false }
            : r
        )
      );
    } catch (e: any) {
      updateAiRow(index, "generating", false);
      toast({ title: "Erreur", description: e.message || "فشل التوليد", variant: "destructive" });
    }
  };

  const shareAiExam = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const validExercises = aiRows
      .filter((r) => r.statement.trim())
      .map((r) => ({ statement: r.statement, solution: r.solution, answer: r.answer }));

    if (validExercises.length === 0) {
      toast({ title: "خطأ", description: "ولّد تمريناً واحداً على الأقل", variant: "destructive" });
      return;
    }

    setAiSaving(true);
    const payload = buildPayload(aiTitle, aiDuration, validExercises, user.id);
    const { error } = await supabase.from("exams" as any).insert(payload as any);
    setAiSaving(false);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "تم مشاركة الاختبار بنجاح" });
    setAiOpen(false);
    fetchExams();
  };

  return (
    <div className="min-h-screen student-shell">
      <AppHeader />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        >
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="mb-4 rounded-full gap-2 active:scale-95 transition-transform"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <div className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r ${trimesterColors[trimester] || "from-primary to-primary/70"} text-white shadow-md`}>
              <BookOpenCheck className="h-4 w-4" />
              <span className="text-sm font-medium">{trimesterLabels[trimester]}</span>
              {trimesterLabelsFr[trimester] && (
                <span className="text-white/70 text-xs">— {trimesterLabelsFr[trimester]}</span>
              )}
            </div>
          </div>
          {canManage && (
            <div className="flex flex-wrap items-center gap-2 self-start">
              <Button onClick={openCreateForm} className="gap-2 rounded-full shadow-md active:scale-95 transition-transform">
                <Plus className="h-4 w-4" />
                <span dir="rtl">إضافة اختبار</span>
              </Button>
              <Button
                onClick={openAIForm}
                variant="hero"
                className="gap-2 rounded-full shadow-md active:scale-95 transition-transform"
              >
                <Sparkles className="h-4 w-4" />
                <span dir="rtl">إضافة اختبار عبر الذكاء الاصطناعي</span>
              </Button>
            </div>
          )}
        </motion.div>

        {/* Source tabs: official vs teacher-sent exams — teacher-sent tab is student-only */}
        {!canManage && (
          <div className="mb-6 space-y-2">
            <div className="inline-flex items-center gap-1 rounded-full glass-card p-1">
              <button
                onClick={() => setSource("official")}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all",
                  source === "official" ? "bg-[image:var(--gradient-primary)] text-white shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <BookOpenCheck className="h-4 w-4" />
                <span dir="rtl">رسمي</span>
                <span className="text-xs opacity-60">({exams.length})</span>
              </button>
              <button
                onClick={() => setSource("teacher")}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all",
                  source === "teacher" ? "bg-[image:var(--gradient-primary)] text-white shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <GraduationCap className="h-4 w-4" />
                <span dir="rtl">من الأستاذ</span>
                <span className="text-xs opacity-60">({teacherExams.length})</span>
              </button>
            </div>
            {source === "teacher" && (
              <p className="text-xs text-muted-foreground" dir="rtl">امتحانات أرسلها أساتذتك لهذا المستوى (كل الفصول).</p>
            )}
          </div>
        )}

        {/* Content */}
        {source === "official" ? (
          loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">جاري التحميل...</p>
            </div>
          ) : exams.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mb-5">
                <Search className="h-9 w-9 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1" dir="rtl">لا توجد اختبارات حالياً</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {canManage ? "ابدأ بإضافة اختبار جديد لهذا الفصل" : "لم يتم إضافة اختبارات لهذا الفصل بعد"}
              </p>
              {canManage && (
                <Button onClick={openCreateForm} className="mt-6 gap-2 rounded-xl">
                  <Plus className="h-4 w-4" />
                  إضافة اختبار
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="grid gap-4">
              <AnimatePresence>
                {exams.map((exam, index) => (
                  <motion.div
                    key={exam.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group relative rounded-2xl border bg-card hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    <div className="flex items-center gap-4 p-5 md:p-6">
                      {/* Exam Icon */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${trimesterColors[trimester]} flex items-center justify-center shadow-sm`}>
                        <FileText className="h-5 w-5 text-white" />
                      </div>

                      {/* Exam Info */}
                      <div className="flex-1 min-w-0" dir="rtl">
                        <h3 className="font-semibold text-foreground truncate">
                          {exam.title_ar || exam.title}
                        </h3>
                        {exam.title_ar && exam.title !== exam.title_ar && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{exam.title}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                            <Clock className="h-3 w-3" />
                            {exam.duration_minutes} دقيقة
                          </span>
                          {Array.isArray(exam.content) && (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                              <FileText className="h-3 w-3" />
                              {exam.content.length} تمرين
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {canManage ? (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="rounded-xl h-9 w-9 hover:bg-secondary"
                              onClick={() => openEditForm(exam)}
                              aria-label="Modifier l'examen"
                            >
                              <Pencil className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="rounded-xl h-9 w-9 hover:bg-destructive/10"
                                  aria-label="Supprimer l'examen"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle dir="rtl">تأكيد الحذف</AlertDialogTitle>
                                  <AlertDialogDescription dir="rtl">
                                    هل أنت متأكد من حذف هذا الاختبار؟ لا يمكن التراجع عن هذا الإجراء.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(exam.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    حذف
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        ) : (
                          <Button
                            onClick={() => setViewExam(exam)}
                            className="gap-2 rounded-xl shadow-sm"
                            size="sm"
                          >
                            <Play className="h-3.5 w-3.5" />
                            اجتياز
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )
        ) : loadingTeacherExams ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">جاري التحميل...</p>
          </div>
        ) : teacherExams.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mb-5">
              <GraduationCap className="h-9 w-9 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1" dir="rtl">لا توجد امتحانات من الأستاذ</h3>
            <p className="text-sm text-muted-foreground max-w-sm" dir="rtl">
              لم يرسل أي أستاذ امتحاناً لهذا المستوى بعد.
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {teacherExams.map((exam, index) => {
                const p = exam.payload || {};
                const exercises: { statement: string; solution?: string; answer?: string }[] = Array.isArray(p.exercises) ? p.exercises : [];
                return (
                  <motion.div
                    key={exam.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group relative rounded-2xl border bg-card hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    <div className="flex items-center gap-4 p-5 md:p-6">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-sm">
                        <GraduationCap className="h-5 w-5 text-white" />
                      </div>

                      <div className="flex-1 min-w-0" dir="rtl">
                        <h3 className="font-semibold text-foreground truncate">
                          {p.title || exam.title || "امتحان"}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {teacherNames[exam.teacher_id] || "أستاذ"}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                            <FileText className="h-3 w-3" />
                            {exercises.length} تمرين
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          onClick={() => setViewTeacherExam(exam)}
                          variant="outline"
                          className="gap-2 rounded-xl"
                          size="sm"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          عرض
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog (Manual) */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle dir="rtl">{editExam ? "تعديل الاختبار" : "إضافة اختبار جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground" dir="rtl">عنوان الاختبار</Label>
                <Input className="rounded-xl mt-1" dir="rtl" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="مثال: اختبار الفصل الأول" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground" dir="rtl">المدة (دقيقة)</Label>
                <Input className="rounded-xl mt-1" type="number" value={formDuration} onChange={(e) => setFormDuration(Number(e.target.value))} />
              </div>
            </div>

            <div className="space-y-4">
              {formExercises.map((ex, idx) => (
                <div key={idx} className="rounded-2xl border bg-secondary/30 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold" dir="rtl">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {idx + 1}
                      </span>
                      التمرين {idx + 1}
                    </span>
                    {formExercises.length > 1 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-lg hover:bg-destructive/10"
                        onClick={() => removeExercise(idx)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground" dir="rtl">الإنشاء (نص التمرين)</Label>
                    <Textarea className="rounded-xl mt-1" dir="rtl" rows={3} value={ex.statement} onChange={(e) => updateExercise(idx, "statement", e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground" dir="rtl">الحل</Label>
                    <Textarea className="rounded-xl mt-1" dir="rtl" rows={3} value={ex.solution} onChange={(e) => updateExercise(idx, "solution", e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground" dir="rtl">الإجابة النهائية</Label>
                    <Input className="rounded-xl mt-1" dir="rtl" value={ex.answer} onChange={(e) => updateExercise(idx, "answer", e.target.value)} />
                  </div>
                </div>
              ))}

              <Button variant="outline" onClick={addExercise} className="w-full gap-2 rounded-xl border-dashed">
                <Plus className="h-4 w-4" />
                <span dir="rtl">إضافة تمرين آخر</span>
              </Button>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="rounded-xl">إلغاء</Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={saving} className="rounded-xl gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
              <span dir="rtl">مشاركة الاختبار</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Generation Dialog */}
      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle dir="rtl" className="flex items-center gap-2 justify-end">
              إنشاء اختبار عبر الذكاء الاصطناعي
              <Sparkles className="h-5 w-5 text-primary" />
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <Label className="text-xs text-muted-foreground" dir="rtl">عنوان الاختبار</Label>
                <Input className="rounded-xl mt-1" dir="rtl" value={aiTitle} onChange={(e) => setAiTitle(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground" dir="rtl">المدة (دقيقة)</Label>
                <Input className="rounded-xl mt-1" type="number" value={aiDuration} onChange={(e) => setAiDuration(Number(e.target.value))} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground" dir="rtl">عدد التمارين</Label>
                <Select value={String(aiCount)} onValueChange={(v) => changeAiCount(Number(v))}>
                  <SelectTrigger className="rounded-xl mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              {aiRows.map((row, idx) => (
                <div key={idx} className="rounded-2xl border bg-secondary/30 p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold" dir="rtl">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {idx + 1}
                      </span>
                      التمرين {idx + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <Select value={row.chapter_id} onValueChange={(v) => updateAiRow(idx, "chapter_id", v)}>
                        <SelectTrigger className="rounded-xl min-w-[180px]" dir="rtl">
                          <SelectValue placeholder="اختر الفصل" />
                        </SelectTrigger>
                        <SelectContent>
                          {chapters.map((ch) => (
                            <SelectItem key={ch.id} value={ch.id}>{ch.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        onClick={() => generateAiExercise(idx)}
                        disabled={row.generating || !row.chapter_id}
                        className="rounded-xl gap-1.5 whitespace-nowrap"
                      >
                        {row.generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        توليد
                      </Button>
                    </div>
                  </div>

                  {(row.statement || row.solution || row.answer) && (
                    <div className="space-y-3 pt-1">
                      <div>
                        <Label className="text-xs text-muted-foreground" dir="rtl">الإنشاء (نص التمرين)</Label>
                        <Textarea className="rounded-xl mt-1" dir="rtl" rows={3} value={row.statement} onChange={(e) => updateAiRow(idx, "statement", e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground" dir="rtl">الحل</Label>
                        <Textarea className="rounded-xl mt-1" dir="rtl" rows={3} value={row.solution} onChange={(e) => updateAiRow(idx, "solution", e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground" dir="rtl">الإجابة النهائية</Label>
                        <Input className="rounded-xl mt-1" dir="rtl" value={row.answer} onChange={(e) => updateAiRow(idx, "answer", e.target.value)} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="rounded-xl">إلغاء</Button>
            </DialogClose>
            <Button onClick={shareAiExam} disabled={aiSaving} className="rounded-xl gap-2">
              {aiSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
              <span dir="rtl">مشاركة الاختبار</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Exam Dialog (Student) */}
      <Dialog open={!!viewExam} onOpenChange={(open) => !open && setViewExam(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3" dir="rtl">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${trimesterColors[trimester]} flex items-center justify-center`}>
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle dir="rtl">{viewExam?.title_ar || viewExam?.title}</DialogTitle>
                {viewExam?.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{viewExam.description}</p>
                )}
              </div>
            </div>
          </DialogHeader>
          {viewExam && (
            <div className="space-y-4 mt-2">
              <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-full" dir="rtl">
                <Clock className="h-3 w-3" />
                المدة: {viewExam.duration_minutes} دقيقة
              </div>
              <div className="border-t pt-4 space-y-3">
                {Array.isArray(viewExam.content) ? (
                  viewExam.content.map((item: any, idx: number) => (
                    <div key={idx} className="p-4 bg-secondary/50 rounded-xl border border-border/50">
                      <p className="font-medium text-sm" dir="rtl">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold ml-2">
                          {idx + 1}
                        </span>
                        {item.statement || item.question || JSON.stringify(item)}
                      </p>
                      {item.options && Array.isArray(item.options) && (
                        <div className="space-y-1.5 mt-3 mr-8" dir="rtl">
                          {item.options.map((opt: string, oi: number) => (
                            <div key={oi} className="flex items-center gap-2 text-sm text-muted-foreground bg-card px-3 py-2 rounded-lg">
                              <span className="w-5 h-5 rounded-full border flex items-center justify-center text-xs font-medium">
                                {String.fromCharCode(65 + oi)}
                              </span>
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm" dir="rtl">
                    {typeof viewExam.content === "string" ? viewExam.content : JSON.stringify(viewExam.content)}
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setViewExam(null)}>إغلاق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Teacher Exam Dialog (Student) */}
      <Dialog open={!!viewTeacherExam} onOpenChange={(open) => !open && setViewTeacherExam(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3" dir="rtl">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle dir="rtl">{viewTeacherExam?.payload?.title || viewTeacherExam?.title || "امتحان"}</DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {viewTeacherExam ? (teacherNames[viewTeacherExam.teacher_id] || "أستاذ") : ""}
                </p>
              </div>
            </div>
          </DialogHeader>
          {viewTeacherExam && authUser && (
            <div className="space-y-4 mt-2 divide-y divide-border">
              {(Array.isArray(viewTeacherExam.payload?.exercises) ? viewTeacherExam.payload.exercises : []).map(
                (ex: { statement: string; solution?: string; answer?: string }, idx: number) => (
                  <div key={idx} className={idx > 0 ? "pt-4" : ""} dir="rtl">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">تمرين {idx + 1}</p>
                    <ExerciseAnswerBlock
                      contentId={viewTeacherExam.id}
                      userId={authUser.id}
                      statement={ex.statement}
                      expectedAnswer={ex.answer}
                      solution={ex.solution}
                    />
                  </div>
                )
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setViewTeacherExam(null)}>إغلاق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamList;
