import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import { courseService } from '@/services/courseService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Trash2, Pencil, Eye, Sparkles, Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import LessonSourceEditor from '@/components/course/LessonSourceEditor';
import { TableOfContents } from '@/components/course/TableOfContents';
import { injectHeaderIds } from '@/lib/toc-utils';
import { LessonEditorActivities } from '@/components/course/LessonEditorActivities';
import { GenerateQuizExercisesButton } from '@/components/course/QuizExerciseCRUD';
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
import { Button } from "@/components/ui/button";
import { HtmlWithMath } from "@/components/course/HtmlWithMath";
import LessonMarkdown from "@/components/course/LessonMarkdown";

export default function LessonEditor() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lesson, setLesson] = useState<{ id: string; title: string; title_ar: string | null; content: string | null; chapter_id: string; subject?: string; school_level?: string; filiere_code?: string } | null>(null);
  const [content, setContent] = useState('');
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [canManage, setCanManage] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [isActivityActive, setActivityActive] = useState(false);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);

  const fetchLesson = useCallback(async () => {
    if (!lessonId) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/auth'); return; }

      // Check role
      const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', user.id);
      const userRoles = roles?.map(r => r.role) || [];
      setCanManage(userRoles.includes('admin') || userRoles.includes('pedago'));

      const data = await courseService.getLessonById(lessonId);
      if (!data) {
        toast({ title: 'Erreur', description: 'Leçon introuvable', variant: 'destructive' });
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
      setContent(data.content || '');
    } catch (err) {
      console.error(err);
      toast({ title: 'Erreur', description: 'Impossible de charger la leçon', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [lessonId, navigate, toast]);

  useEffect(() => { fetchLesson(); }, [fetchLesson]);

  // Realtime: auto-refresh when lesson content changes (only if not dirty)
  useEffect(() => {
    if (!lessonId || isDirty) return; // Ne pas mettre à jour si on a des modifications locales
    const channel = supabase
      .channel(`lesson-${lessonId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'lessons', filter: `id=eq.${lessonId}` }, (payload) => {
        const newContent = (payload.new as any).content || '';
        setLesson(prev => prev ? { ...prev, content: newContent } : null);
        if (mode === 'view') {
          setContent(newContent);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [lessonId, mode, isDirty]);

  const handleSave = async () => {
    // Sauvegarde locale uniquement - pas encore publié
    setIsDirty(true);
    toast({ title: 'Brouillon sauvegardé', description: 'Le contenu a été sauvegardé localement. Cliquez sur "Envoyer les modifications" pour publier.' });
    setMode('view');
  };

  const handlePublish = async () => {
    if (!lessonId) return;
    setPublishing(true);
    try {
      const { error } = await supabase.from('lessons').update({ content }).eq('id', lessonId);
      if (error) throw error;
      toast({ title: 'Publié', description: 'Les modifications ont été envoyées avec succès.' });
      setIsDirty(false);
      // Update local state
      setLesson(prev => prev ? { ...prev, content } : null);
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Erreur', description: err.message || 'Impossible de publier', variant: 'destructive' });
    } finally {
      setPublishing(false);
    }
  };

  const handleGenerateAI = () => {
    setIsAIPanelOpen(true);
  };

  const handleDelete = async () => {
    // Marquer pour suppression locale - pas encore publié
    setContent('');
    setIsDirty(true);
    toast({ title: 'Contenu marqué pour suppression (Brouillon)', description: 'Cliquez sur "Envoyer les modifications" pour publier la suppression.' });
    setMode('view');
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
                if (lesson.school_level) params.append('niveau', lesson.school_level); if (lesson.filiere_code) params.append('filiere', lesson.filiere_code); params.append('chapitre', lesson.chapter_id);
                navigate(`/cours/${lesson.subject}?${params.toString()}`);
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

        {/* AI Generation button + Exercises & Quizzes CRUD for pedago */}
        {canManage && lesson.chapter_id && (
          <>
            <div className="flex justify-center mb-4">
              <GenerateQuizExercisesButton chapterId={lesson.chapter_id} lessonId={lesson.id} onGenerated={() => window.location.reload()} />
            </div>
            <LessonEditorActivities
              chapterId={lesson.chapter_id}
              lessonId={lesson.id}
              lessonTitle={lesson.title_ar || lesson.title}
              onActiveChange={(isActive) => setActivityActive(isActive)}
            />
          </>
        )}

        {/* Hide the rest of the page if an activity is active */}
        {!isActivityActive && (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 min-w-0">
              {/* Action bar */}
              {canManage && (
                <>
                  <div className="flex items-center gap-2 mb-6 flex-wrap">
                    {mode === 'view' ? (
                      <>
                        <Button onClick={() => setMode('edit')}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Modifier
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

                        {/* Bouton Envoyer les modifications - Visible si y a des changements */}
                        {isDirty && (
                          <Button
                            onClick={handlePublish}
                            disabled={publishing}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            {publishing ? 'Envoi...' : 'Envoyer les modifications'}
                          </Button>
                        )}
                      </>
                    ) : (
                      <>
                        <Button onClick={handleSave} disabled={saving}>
                          <Save className="h-4 w-4 mr-2" />
                          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                        </Button>
                        <Button variant="outline" onClick={() => { setMode('view'); setContent(lesson.content || ''); }}>
                          <Eye className="h-4 w-4 mr-2" />
                          Annuler
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Indicateur de modifications non publiées */}
                  {isDirty && (
                    <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md text-sm text-yellow-800 dark:text-yellow-200">
                      ⚠️ Vous avez des modifications non publiées. Les autres utilisateurs ne verront ces changements qu'après avoir cliqué sur "Envoyer les modifications".
                    </div>
                  )}
                </>
              )}

              {/* Content */}
              <Card>
                <CardHeader>
                  <CardTitle>{mode === 'edit' ? 'Éditeur de contenu' : 'Contenu du cours'}</CardTitle>
                </CardHeader>
                <CardContent>
                  {mode === 'edit' ? (
                    <LessonSourceEditor content={content} onChange={setContent} editable />
                  ) : (
                    content ? (
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
                        {canManage && (
                          <Button className="mt-4" onClick={() => setMode('edit')}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Ajouter du contenu
                          </Button>
                        )}
                      </div>
                    )
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
        onUpdateContent={(newContent) => {
          setContent(newContent);
          setIsDirty(true);
        }}
        open={isAIPanelOpen}
        onClose={() => setIsAIPanelOpen(false)}
      />
    </div>
  );
}
