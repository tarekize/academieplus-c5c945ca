import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import { courseService } from '@/services/courseService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Trash2, Sparkles, Loader2, Send, Undo2, FileCode, PenLine, History, Save, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import InlineLessonEditor from '@/components/course/InlineLessonEditor';
import LessonSourceEditor from '@/components/course/LessonSourceEditor';
import { useArabicKeyboardField } from '@/components/course/ArabicKeyboard';
import { TableOfContents } from '@/components/course/TableOfContents';
import { injectHeaderIds } from '@/lib/toc-utils';
import { LessonEditorActivities } from '@/components/course/LessonEditorActivities';
import { logPedagoActivity } from '@/lib/pedagoActivityLog';
import { AdminAssistantPanel } from '@/components/admin/AdminAssistantPanel';
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
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { HtmlWithMath } from "@/components/course/HtmlWithMath";
import LessonMarkdown from "@/components/course/LessonMarkdown";

interface LessonVersion {
  id: string;
  content: string | null;
  created_at: string;
  created_by_name: string;
  status: "pending" | "approved" | "rejected" | "superseded";
  reviewed_by_name: string | null;
  rejection_reason: string | null;
}

interface LatestVersion {
  id: string;
  version_number: number;
  status: "pending" | "approved" | "rejected" | "superseded";
  content: string | null;
  created_by_name: string;
  created_at: string;
  reviewed_by_name: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
}

export default function LessonEditor() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lesson, setLesson] = useState<{ id: string; title: string; title_ar: string | null; content: string | null; chapter_id: string; subject?: string; school_level?: string; filiere_code?: string } | null>(null);
  const [content, setContent] = useState('');
  // Incrémenté pour forcer une réinitialisation de l'éditeur (chargement, sync distante, annulation)
  const [contentVersion, setContentVersion] = useState(0);
  const [latexMode, setLatexMode] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [latestVersion, setLatestVersion] = useState<LatestVersion | null>(null);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [previewPending, setPreviewPending] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [isActivityActive, setActivityActive] = useState(false);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const { onFocus: onKeyboardFocus, onBlur: onKeyboardBlur } = useArabicKeyboardField();
  const [currentUserName, setCurrentUserName] = useState('');
  const [versions, setVersions] = useState<LessonVersion[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [versionsListOpen, setVersionsListOpen] = useState(false);
  const [viewingVersion, setViewingVersion] = useState<LessonVersion | null>(null);

  const fetchLesson = useCallback(async () => {
    if (!lessonId) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/auth'); return; }

      // Check role
      const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', user.id);
      const userRoles = roles?.map(r => r.role) || [];
      setCanManage(userRoles.includes('admin') || userRoles.includes('pedago'));
      setIsAdmin(userRoles.includes('admin'));

      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', user.id)
        .maybeSingle();
      if (profile) {
        const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
        setCurrentUserName(fullName || profile.email || 'مستخدم');
      }

      const data = await courseService.getLessonById(lessonId);
      if (!data) {
        toast.error('Erreur', { description: 'Leçon introuvable' });
        navigate(-1 as any);
        return;
      }

      // Get chapter_id + chapter info for back navigation
      const { data: lessonRow } = await supabase.from('lessons').select('chapter_id').eq('id', lessonId).maybeSingle();
      const chId = lessonRow?.chapter_id || '';

      let chSubject = '';
      let chSchoolLevel = '';
      let chFiliereCode = '';

      if (chId) {
        const { data: chapterRow } = await supabase
          .from('chapters')
          .select('subject, school_level, filiere_id')
          .eq('id', chId)
          .maybeSingle();

        if (chapterRow) {
          chSubject = chapterRow.subject;
          chSchoolLevel = chapterRow.school_level;

          if (chapterRow.filiere_id) {
            const { data: filiereRow } = await supabase
              .from('filieres')
              .select('code')
              .eq('id', chapterRow.filiere_id)
              .maybeSingle();
            if (filiereRow) {
              chFiliereCode = filiereRow.code;
            }
          }
        }
      }

      setLesson({
        ...data,
        chapter_id: chId,
        subject: chSubject,
        school_level: chSchoolLevel,
        filiere_code: chFiliereCode
      });

      // Colonnes ajoutées par le workflow de validation (pas encore dans les
      // types générés) : brouillon éventuel + dernière version soumise.
      const draft = (data as any).draft_content as string | null;
      setHasDraft(!!draft);
      setContent(draft ?? data.content ?? '');
      setIsDirty(!!draft);
      setContentVersion(v => v + 1);

      const { data: latest } = await supabase
        .from('lesson_versions' as any)
        .select('id, version_number, status, content, created_by_name, created_at, reviewed_by_name, reviewed_at, rejection_reason')
        .eq('lesson_id', lessonId)
        .order('version_number', { ascending: false })
        .limit(1)
        .maybeSingle();
      setLatestVersion((latest as any) || null);
    } catch (err) {
      console.error(err);
      toast.error('Erreur', { description: 'Impossible de charger la leçon' });
    } finally {
      setLoading(false);
    }
  }, [lessonId, navigate]);

  useEffect(() => { fetchLesson(); }, [fetchLesson]);

  // Realtime: auto-refresh when the lesson (contenu, brouillon, statut de
  // validation) change côté serveur — seulement si l'utilisateur n'a pas de
  // modifications locales non enregistrées.
  useEffect(() => {
    if (!lessonId || isDirty) return;
    const channel = supabase
      .channel(`lesson-${lessonId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'lessons', filter: `id=eq.${lessonId}` }, () => {
        fetchLesson();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [lessonId, isDirty, fetchLesson]);

  const handleDiscard = async () => {
    setContent(lesson?.content || '');
    setContentVersion(v => v + 1);
    setIsDirty(false);
    if (hasDraft && lessonId) {
      setHasDraft(false);
      await supabase.rpc('save_lesson_draft' as any, { p_lesson_id: lessonId, p_content: null });
    }
  };

  const handleSaveDraft = async () => {
    if (!lessonId) return;
    setSavingDraft(true);
    try {
      const { error } = await supabase.rpc('save_lesson_draft' as any, { p_lesson_id: lessonId, p_content: content });
      if (error) throw error;
      setHasDraft(true);
      toast.success('Brouillon enregistré', { description: 'Vos modifications sont sauvegardées, pas encore envoyées à l\'administrateur.' });
    } catch (err: any) {
      console.error(err);
      toast.error('Erreur', { description: err.message || 'Impossible d\'enregistrer le brouillon' });
    } finally {
      setSavingDraft(false);
    }
  };

  const handlePublish = async () => {
    if (!lessonId) return;
    setPublishing(true);
    try {
      const { data: version, error } = await supabase
        .rpc('submit_lesson_version' as any, { p_lesson_id: lessonId, p_content: content });
      if (error) throw error;

      setIsDirty(false);
      setHasDraft(false);
      setLatestVersion(version as any);

      if (isAdmin) {
        toast.success('Publié', { description: 'Les modifications ont été envoyées avec succès.' });
        setLesson(prev => prev ? { ...prev, content } : null);
      } else {
        toast.success('Envoyé pour validation', { description: `Version ${(version as any).version_number} envoyée à l'administrateur.` });
      }

      logPedagoActivity({
        action: 'update',
        entityType: 'lesson_content',
        entityId: lessonId,
        entityTitle: lesson?.title,
        chapterId: lesson?.chapter_id,
        subject: lesson?.subject,
        schoolLevel: lesson?.school_level,
      });
    } catch (err: any) {
      console.error(err);
      toast.error('Erreur', { description: err.message || 'Impossible d\'envoyer les modifications' });
    } finally {
      setPublishing(false);
    }
  };

  const handleApprove = async () => {
    if (!latestVersion || latestVersion.status !== 'pending') return;
    setApproving(true);
    try {
      const { error } = await supabase.rpc('approve_lesson_version' as any, { p_version_id: latestVersion.id });
      if (error) throw error;
      toast.success('Validé', { description: 'La nouvelle version est maintenant visible par les élèves.' });
      setPreviewPending(false);
      await fetchLesson();
    } catch (err: any) {
      console.error(err);
      toast.error('Erreur', { description: err.message || 'Impossible de valider la version' });
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!latestVersion || latestVersion.status !== 'pending') return;
    setRejecting(true);
    try {
      const { error } = await supabase.rpc('reject_lesson_version' as any, { p_version_id: latestVersion.id, p_reason: rejectReason || null });
      if (error) throw error;
      toast.success('Refusé', { description: 'Le pédagogue verra le motif du refus.' });
      setRejectDialogOpen(false);
      setRejectReason('');
      setPreviewPending(false);
      await fetchLesson();
    } catch (err: any) {
      console.error(err);
      toast.error('Erreur', { description: err.message || 'Impossible de refuser la version' });
    } finally {
      setRejecting(false);
    }
  };

  const fetchVersions = useCallback(async () => {
    if (!lessonId) return;
    setVersionsLoading(true);
    try {
      const { data, error } = await supabase
        .from('lesson_versions' as any)
        .select('id, content, created_at, created_by_name, status, reviewed_by_name, rejection_reason')
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setVersions((data as any) || []);
    } catch (err) {
      console.error(err);
      toast.error('خطأ', { description: 'تعذر تحميل سجل الإصدارات.' });
    } finally {
      setVersionsLoading(false);
    }
  }, [lessonId]);

  const renderVersionStatusBadge = (status: LessonVersion["status"]) => {
    if (status === "approved") {
      return (
        <Badge className="bg-green-600 hover:bg-green-600 text-white gap-1">
          <CheckCircle2 className="h-3 w-3" /> تم القبول
        </Badge>
      );
    }
    if (status === "rejected") {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" /> مرفوض
        </Badge>
      );
    }
    if (status === "pending") {
      return (
        <Badge className="bg-warning hover:bg-warning text-warning-foreground gap-1">
          <Clock className="h-3 w-3" /> بانتظار المصادقة
        </Badge>
      );
    }
    // superseded : remplacée par un envoi plus récent, sans décision propre
    return <Badge variant="secondary">استُبدلت</Badge>;
  };

  const openVersionsList = () => {
    setVersionsListOpen(true);
    fetchVersions();
  };

  const handleGenerateAI = () => {
    setIsAIPanelOpen(true);
  };

  const toggleLatexMode = () => {
    // En quittant le mode LaTeX, force InlineLessonEditor à repartir du
    // contenu le plus récent (il ne relit jamais `content` en cours d'édition).
    if (latexMode) setContentVersion(v => v + 1);
    setLatexMode(v => !v);
  };

  const handleDelete = async () => {
    // Marquer pour suppression locale - pas encore publié
    setContent('');
    setContentVersion(v => v + 1);
    setIsDirty(true);
    toast('Contenu marqué pour suppression (Brouillon)', { description: 'Cliquez sur "Envoyer les modifications" pour publier la suppression.' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">Leçon introuvable</h2>
        <Button onClick={() => navigate(-1 as any)}>Retour</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pro-shell">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Modern Header / Breadcrumb */}
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg border border-primary/10 mb-6">
          <button
            onClick={() => {
              if (lesson?.subject && lesson?.chapter_id) {
                const params = new URLSearchParams();
                if (lesson.filiere_code) params.append('filiere', lesson.filiere_code);
                const niveauSegment = lesson.school_level ? `/${lesson.school_level}` : '';
                navigate(`/cours/${lesson.subject}${niveauSegment}/chapitres/${lesson.chapter_id}/lecons?${params.toString()}`);
              } else {
                navigate(-1 as any);
              }
            }}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors text-sm font-medium text-foreground/80 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Retourner vers le cours</span>
            <span className="sm:hidden">Retour</span>
          </button>
          <span className="text-muted-foreground/50">/</span>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-foreground truncate">{lesson.title_ar || lesson.title}</h1>
            {lesson.title_ar && <p className="text-xs text-muted-foreground truncate">{lesson.title}</p>}
          </div>
        </div>

        {/* Exercises & Quizzes management for pedago (génération IA intégrée par onglet) */}
        {canManage && lesson.chapter_id && (
          <LessonEditorActivities
            chapterId={lesson.chapter_id}
            lessonId={lesson.id}
            lessonTitle={lesson.title_ar || lesson.title}
            onActiveChange={(isActive) => setActivityActive(isActive)}
            isAdmin={isAdmin}
          />
        )}

        {/* Hide the rest of the page if an activity is active */}
        {!isActivityActive && (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 min-w-0">
              {/* Action bar : collante en haut de l'écran pendant le défilement,
                  pour que les boutons (dont "Envoyer pour validation") restent
                  accessibles même en éditant plus bas dans une longue leçon. */}
              {canManage && (
                <>
                  <div className="sticky top-2 z-20 mb-6 p-2 -m-2 rounded-lg bg-background/95 backdrop-blur-sm border border-border/40 shadow-sm">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button variant="outline" onClick={openVersionsList}>
                        <History className="h-4 w-4 mr-2" />
                        الإصدارات السابقة
                      </Button>
                      <Button variant="outline" onClick={toggleLatexMode}>
                        {latexMode ? <PenLine className="h-4 w-4 mr-2" /> : <FileCode className="h-4 w-4 mr-2" />}
                        {latexMode ? 'Retour à l\'édition directe' : 'Modifier en LaTeX'}
                      </Button>
                      <Button variant="secondary" onClick={handleGenerateAI} disabled={generating}>
                        {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                        {generating ? 'Génération...' : 'Généré avec IA'}
                      </Button>
                      {lesson.content && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer le contenu
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action supprimera tout le contenu de cette leçon. Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>

                    {/* Rangée dédiée : évite que ces boutons ne réorganisent la
                        rangée ci-dessus à chaque fois qu'ils apparaissent/disparaissent. */}
                    {isDirty && (
                      <div className="flex items-center gap-2 flex-wrap mt-2 pt-2 border-t border-border/40">
                        <Button
                          onClick={handlePublish}
                          disabled={publishing || savingDraft}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {publishing ? 'Envoi...' : isAdmin ? 'Envoyer les modifications' : 'Envoyer pour validation'}
                        </Button>
                        <Button variant="outline" onClick={handleSaveDraft} disabled={savingDraft || publishing}>
                          {savingDraft ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                          {savingDraft ? 'Enregistrement...' : 'Enregistrer le brouillon'}
                        </Button>
                        <Button variant="outline" onClick={handleDiscard} disabled={publishing || savingDraft}>
                          <Undo2 className="h-4 w-4 mr-2" />
                          Annuler les modifications
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* État de la version en cours (numéro + statut de validation) */}
                  {latestVersion && (
                    <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
                      <span className="text-muted-foreground">الإصدار {latestVersion.version_number} :</span>
                      {latestVersion.status === 'pending' && (
                        <Badge className="bg-warning hover:bg-warning text-warning-foreground gap-1">
                          <Clock className="h-3 w-3" /> بانتظار المصادقة
                        </Badge>
                      )}
                      {latestVersion.status === 'approved' && (
                        <Badge className="bg-green-600 hover:bg-green-600 text-white gap-1">
                          <CheckCircle2 className="h-3 w-3" /> تم النشر
                        </Badge>
                      )}
                      {latestVersion.status === 'rejected' && (
                        <Badge variant="destructive" className="gap-1">
                          <XCircle className="h-3 w-3" /> مرفوض
                        </Badge>
                      )}
                      {latestVersion.status === 'rejected' && latestVersion.rejection_reason && (
                        <span className="text-muted-foreground">— {latestVersion.rejection_reason}</span>
                      )}
                    </div>
                  )}

                  {/* Panneau de validation admin : une version attend sa décision */}
                  {isAdmin && latestVersion?.status === 'pending' && (
                    <Card className="mb-4 border-red-300 dark:border-red-900 bg-red-50/60 dark:bg-red-950/20">
                      <CardContent className="py-4 flex flex-col gap-3">
                        <p className="text-sm text-red-800 dark:text-red-200">
                          <strong>{latestVersion.created_by_name}</strong> a envoyé une nouvelle version (الإصدار {latestVersion.version_number}) le {new Date(latestVersion.created_at).toLocaleString('ar')}, en attente de validation.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" onClick={() => setPreviewPending(true)}>
                            Voir le contenu proposé
                          </Button>
                          <Button size="sm" onClick={handleApprove} disabled={approving || rejecting} className="bg-green-600 hover:bg-green-700">
                            {approving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                            Valider
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => setRejectDialogOpen(true)} disabled={approving || rejecting}>
                            <XCircle className="h-4 w-4 mr-2" />
                            Refuser
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Indicateur de modifications non publiées */}
                  {isDirty && (
                    <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md text-sm text-yellow-800 dark:text-yellow-200">
                      {hasDraft
                        ? '📝 Brouillon enregistré. Les élèves ne verront ces changements qu\'après validation.'
                        : isAdmin
                          ? '⚠️ Vous avez des modifications non publiées. Les autres utilisateurs ne verront ces changements qu\'après avoir cliqué sur "Envoyer les modifications".'
                          : '⚠️ Vous avez des modifications non envoyées. Elles ne seront visibles par les élèves qu\'après validation par un administrateur.'}
                    </div>
                  )}
                </>
              )}

              {/* Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Contenu du cours</CardTitle>
                </CardHeader>
                <CardContent>
                  {canManage ? (
                    latexMode ? (
                      <LessonSourceEditor
                        content={content}
                        onChange={(value) => { setContent(value); setIsDirty(true); }}
                      />
                    ) : (
                      <InlineLessonEditor
                        content={content}
                        onChange={(html) => { setContent(html); setIsDirty(true); }}
                        onDirty={() => setIsDirty(true)}
                        resetKey={`${lesson.id}-${contentVersion}`}
                        onFocusTarget={onKeyboardFocus}
                        onBlurTarget={onKeyboardBlur}
                      />
                    )
                  ) : content ? (
                    /<\s*(html|body|head|!doctype)/i.test(content) ? (
                      <HtmlWithMath
                        className="lesson-markdown prose prose-sm dark:prose-invert max-w-none"
                        htmlContent={injectHeaderIds(content)}
                      />
                    ) : (
                      <LessonMarkdown content={content} dir="rtl" />
                    )
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>Aucun contenu pour cette leçon.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar TOC */}
            <div className="w-full lg:w-72 shrink-0">
              <TableOfContents htmlContent={content} />
            </div>
          </div>
        )}
      </div>

      <AdminAssistantPanel
        lessonId={lesson.id}
        currentContent={content}
        lessonTitle={lesson.title_ar || lesson.title}
        schoolLevel={lesson.school_level}
        onUpdateContent={(newContent) => {
          setContent(newContent);
          setContentVersion(v => v + 1);
          setIsDirty(true);
        }}
        open={isAIPanelOpen}
        onClose={() => setIsAIPanelOpen(false)}
      />

      {/* Liste des versions précédentes de la leçon */}
      <Dialog open={versionsListOpen} onOpenChange={setVersionsListOpen}>
        <DialogContent className="sm:max-w-[480px] max-h-[80vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>الإصدارات السابقة</DialogTitle>
            <DialogDescription>
              كل إصدار يمثل نسخة من الدرس تم إرسالها للطلاب في وقت معين.
            </DialogDescription>
          </DialogHeader>
          {versionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : versions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              لا توجد إصدارات محفوظة بعد. سيتم إنشاء إصدار جديد عند كل إرسال للتعديلات.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {versions.map((v, idx) => {
                const versionNumber = versions.length - idx;
                return (
                  <button
                    key={v.id}
                    onClick={() => { setViewingVersion(v); setVersionsListOpen(false); }}
                    className="text-right rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="font-medium text-sm">الإصدار {versionNumber}</div>
                      {renderVersionStatusBadge(v.status)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {new Date(v.created_at).toLocaleString('ar')} — {v.created_by_name}
                    </div>
                    {v.status === "rejected" && v.rejection_reason && (
                      <div className="text-xs text-destructive mt-1">— {v.rejection_reason}</div>
                    )}
                    {v.status === "approved" && v.reviewed_by_name && (
                      <div className="text-xs text-muted-foreground mt-0.5">قبِلها: {v.reviewed_by_name}</div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Aperçu en lecture seule d'une version précédente */}
      <Dialog open={!!viewingVersion} onOpenChange={(isOpen) => { if (!isOpen) setViewingVersion(null); }}>
        <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {viewingVersion && `الإصدار ${versions.length - versions.findIndex(v => v.id === viewingVersion.id)}`}
            </DialogTitle>
            <DialogDescription>
              {viewingVersion && `${new Date(viewingVersion.created_at).toLocaleString('ar')} — ${viewingVersion.created_by_name}`}
            </DialogDescription>
          </DialogHeader>
          {viewingVersion?.content ? (
            /<\s*(html|body|head|!doctype)/i.test(viewingVersion.content) ? (
              <HtmlWithMath
                className="lesson-markdown prose prose-sm dark:prose-invert max-w-none"
                htmlContent={injectHeaderIds(viewingVersion.content)}
              />
            ) : (
              <LessonMarkdown content={viewingVersion.content} dir="rtl" />
            )
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">لا يوجد محتوى في هذا الإصدار.</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Aperçu en lecture seule de la version en attente de validation */}
      <Dialog open={previewPending} onOpenChange={setPreviewPending}>
        <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>الإصدار {latestVersion?.version_number} — بانتظار المصادقة</DialogTitle>
            <DialogDescription>
              {latestVersion && `${new Date(latestVersion.created_at).toLocaleString('ar')} — ${latestVersion.created_by_name}`}
            </DialogDescription>
          </DialogHeader>
          {latestVersion?.content ? (
            /<\s*(html|body|head|!doctype)/i.test(latestVersion.content) ? (
              <HtmlWithMath
                className="lesson-markdown prose prose-sm dark:prose-invert max-w-none"
                htmlContent={injectHeaderIds(latestVersion.content)}
              />
            ) : (
              <LessonMarkdown content={latestVersion.content} dir="rtl" />
            )
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">لا يوجد محتوى في هذا الإصدار.</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Motif de refus (optionnel) */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-[480px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>Refuser cette version ?</DialogTitle>
            <DialogDescription>
              Vous pouvez expliquer au pédagogue pourquoi cette modification est refusée (optionnel).
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Motif du refus (optionnel)..."
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)} disabled={rejecting}>Annuler</Button>
            <Button variant="destructive" onClick={handleReject} disabled={rejecting}>
              {rejecting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
              Refuser
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
