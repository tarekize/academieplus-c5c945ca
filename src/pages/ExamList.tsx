import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, Pencil, Trash2, Play, Clock, FileText, BookOpen, AlertCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface Exam {
  id: string;
  title: string;
  title_ar: string | null;
  description: string | null;
  content: any;
  duration_minutes: number;
  created_at: string;
}

const ExamList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const niveau = searchParams.get("niveau") || "";
  const subject = searchParams.get("subject") || "math";
  const trimester = parseInt(searchParams.get("trimester") || "1");
  const { toast } = useToast();

  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [canManage, setCanManage] = useState(false);
  const [editExam, setEditExam] = useState<Exam | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [viewExam, setViewExam] = useState<Exam | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formTitleAr, setFormTitleAr] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formDuration, setFormDuration] = useState(60);

  const trimesterLabels: Record<number, string> = {
    1: "اختبارات الفصل الأول",
    2: "اختبارات الفصل الثاني",
    3: "اختبارات الفصل الثالث",
  };

  const trimesterColors: Record<number, { gradient: string; bg: string; badge: string }> = {
    1: { gradient: "from-blue-500 to-cyan-400", bg: "bg-blue-500/10", badge: "bg-blue-500/15 text-blue-600" },
    2: { gradient: "from-violet-500 to-purple-400", bg: "bg-violet-500/10", badge: "bg-violet-500/15 text-violet-600" },
    3: { gradient: "from-amber-500 to-orange-400", bg: "bg-amber-500/10", badge: "bg-amber-500/15 text-amber-600" },
  };

  const colors = trimesterColors[trimester] || trimesterColors[1];

  const fetchExams = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("exams" as any)
      .select("*")
      .eq("school_level", niveau)
      .eq("trimester", trimester)
      .eq("subject", subject)
      .order("created_at", { ascending: false });

    if (!error && data) setExams(data as any[]);
    setLoading(false);
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

  useEffect(() => {
    checkRole();
    fetchExams();
  }, [niveau, trimester, subject]);

  const openCreateForm = () => {
    setEditExam(null);
    setFormTitle("");
    setFormTitleAr("");
    setFormDescription("");
    setFormContent("");
    setFormDuration(60);
    setFormOpen(true);
  };

  const openEditForm = (exam: Exam) => {
    setEditExam(exam);
    setFormTitle(exam.title);
    setFormTitleAr(exam.title_ar || "");
    setFormDescription(exam.description || "");
    setFormContent(typeof exam.content === "string" ? exam.content : JSON.stringify(exam.content, null, 2));
    setFormDuration(exam.duration_minutes);
    setFormOpen(true);
  };

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let contentJson: any;
    try {
      contentJson = JSON.parse(formContent || "[]");
    } catch {
      contentJson = formContent;
    }

    const payload = {
      title: formTitle,
      title_ar: formTitleAr || null,
      description: formDescription || null,
      content: contentJson,
      duration_minutes: formDuration,
      school_level: niveau,
      trimester,
      subject,
      created_by: user.id,
    };

    if (editExam) {
      const { error } = await supabase.from("exams" as any).update(payload as any).eq("id", editExam.id);
      if (error) {
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "تم التعديل بنجاح" });
    } else {
      const { error } = await supabase.from("exams" as any).insert(payload as any);
      if (error) {
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "تمت الإضافة بنجاح" });
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
    setDeleteConfirm(null);
    fetchExams();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b border-border/50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="container mx-auto px-4 py-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" className="gap-2 hover:bg-primary/10" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
              رجوع
            </Button>
            {canManage && (
              <Button className="gap-2 shadow-lg shadow-primary/20" onClick={openCreateForm}>
                <Plus className="h-4 w-4" />
                إضافة اختبار
              </Button>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 flex-row-reverse"
          >
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg`}>
              <FileText className="h-7 w-7 text-white" />
            </div>
            <div className="text-right">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground" dir="rtl">
                {trimesterLabels[trimester]}
              </h1>
              <div className="flex items-center gap-2 justify-end mt-1">
                <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium ${colors.badge}`}>
                  {exams.length} اختبار
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className={`w-12 h-12 rounded-full border-4 border-muted border-t-primary animate-spin`} />
            <p className="text-muted-foreground text-sm">جار التحميل...</p>
          </div>
        ) : exams.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-muted-foreground" dir="rtl">لا توجد اختبارات حالياً</p>
                {canManage && (
                  <Button className="gap-2 mt-2" onClick={openCreateForm}>
                    <Plus className="h-4 w-4" />
                    إضافة اختبار جديد
                  </Button>
                )}
              </CardContent>
            </Card>
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
                  transition={{ delay: index * 0.06 }}
                >
                  <Card className="group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:border-primary/30 overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row md:items-center">
                        {/* Color indicator */}
                        <div className={`hidden md:block w-1.5 self-stretch bg-gradient-to-b ${colors.gradient}`} />

                        {/* Main content */}
                        <div className="flex-1 p-5 md:p-6">
                          <div className="flex items-start justify-between gap-4 flex-row-reverse">
                            <div className="flex-1 text-right">
                              <h3 className="text-lg font-bold text-foreground mb-1" dir="rtl">
                                {exam.title_ar || exam.title}
                              </h3>
                              {exam.title_ar && (
                                <p className="text-sm text-muted-foreground mb-2">{exam.title}</p>
                              )}
                              {exam.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3" dir="rtl">
                                  {exam.description}
                                </p>
                              )}
                              <div className="flex items-center gap-3 justify-end">
                                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Clock className="h-3.5 w-3.5" />
                                  {exam.duration_minutes} دقيقة
                                </span>
                                {Array.isArray(exam.content) && (
                                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <FileText className="h-3.5 w-3.5" />
                                    {exam.content.length} سؤال
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 p-4 md:p-6 md:pl-0 border-t md:border-t-0 md:border-r border-border/50">
                          {canManage ? (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                                onClick={() => openEditForm(exam)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                تعديل
                              </Button>
                              {deleteConfirm === exam.id ? (
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDelete(exam.id)}
                                  >
                                    تأكيد
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setDeleteConfirm(null)}
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-1.5 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                                  onClick={() => setDeleteConfirm(exam.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  حذف
                                </Button>
                              )}
                            </div>
                          ) : (
                            <Button
                              className={`gap-2 bg-gradient-to-r ${colors.gradient} text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border-0`}
                              onClick={() => setViewExam(exam)}
                            >
                              <Play className="h-4 w-4" />
                              اجتياز الاختبار
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle dir="rtl" className="text-xl">
              {editExam ? "تعديل الاختبار" : "إضافة اختبار جديد"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div>
              <Label>Titre (FR)</Label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Ex: Examen de mathématiques" />
            </div>
            <div>
              <Label dir="rtl">العنوان (عربي)</Label>
              <Input dir="rtl" value={formTitleAr} onChange={(e) => setFormTitleAr(e.target.value)} placeholder="مثال: اختبار الرياضيات" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Description de l'examen..." />
            </div>
            <div>
              <Label>Contenu (JSON)</Label>
              <Textarea
                rows={6}
                className="font-mono text-sm"
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder='[{"question": "...", "options": ["A","B","C","D"], "answer": "A"}]'
              />
            </div>
            <div>
              <Label dir="rtl">المدة (دقيقة)</Label>
              <Input type="number" value={formDuration} onChange={(e) => setFormDuration(Number(e.target.value))} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">إلغاء</Button>
            </DialogClose>
            <Button onClick={handleSave} className="gap-2">
              {editExam ? "حفظ التعديلات" : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Exam Dialog (Student) */}
      <Dialog open={!!viewExam} onOpenChange={(open) => !open && setViewExam(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0">
          {/* Exam header */}
          <div className={`p-6 bg-gradient-to-r ${colors.gradient} text-white`}>
            <h2 className="text-xl font-bold" dir="rtl">{viewExam?.title_ar || viewExam?.title}</h2>
            {viewExam?.description && (
              <p className="text-white/80 text-sm mt-1" dir="rtl">{viewExam.description}</p>
            )}
            <div className="flex items-center gap-3 mt-3 justify-end">
              <span className="inline-flex items-center gap-1.5 text-sm text-white/90 bg-white/20 px-3 py-1 rounded-full">
                <Clock className="h-3.5 w-3.5" />
                {viewExam?.duration_minutes} دقيقة
              </span>
              {viewExam && Array.isArray(viewExam.content) && (
                <span className="inline-flex items-center gap-1.5 text-sm text-white/90 bg-white/20 px-3 py-1 rounded-full">
                  <FileText className="h-3.5 w-3.5" />
                  {viewExam.content.length} سؤال
                </span>
              )}
            </div>
          </div>

          {/* Questions */}
          <div className="p-6 space-y-4">
            {viewExam && Array.isArray(viewExam.content) ? (
              viewExam.content.map((item: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl border border-border/60 bg-card hover:border-primary/20 transition-colors">
                  <p className="font-semibold mb-3 text-foreground" dir="rtl">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br ${colors.gradient} text-white text-sm font-bold ml-2`}>
                      {idx + 1}
                    </span>
                    {item.question || item.statement || JSON.stringify(item)}
                  </p>
                  {item.options && Array.isArray(item.options) && (
                    <div className="space-y-2 mr-9" dir="rtl">
                      {item.options.map((opt: string, oi: number) => (
                        <div
                          key={oi}
                          className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                        >
                          <span className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center text-xs font-medium text-muted-foreground">
                            {String.fromCharCode(1571 + oi)}
                          </span>
                          <span className="text-sm">{opt}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : viewExam ? (
              <p className="text-muted-foreground" dir="rtl">
                {typeof viewExam.content === "string" ? viewExam.content : JSON.stringify(viewExam.content)}
              </p>
            ) : null}
          </div>

          <div className="p-4 border-t">
            <Button variant="outline" className="w-full" onClick={() => setViewExam(null)}>
              إغلاق
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamList;
