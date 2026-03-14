import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import { courseService } from '@/services/courseService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Trash2, Pencil, Eye, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import LessonRichEditor from '@/components/course/LessonRichEditor';
import { TableOfContents } from '@/components/course/TableOfContents';
import { injectHeaderIds } from '@/lib/toc-utils';
import { LessonEditorActivities } from '@/components/course/LessonEditorActivities';
import { GenerateQuizExercisesButton } from '@/components/course/QuizExerciseCRUD';
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
import { Button } from '@/components/ui/button';

export default function LessonEditor() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lesson, setLesson] = useState<{ id: string; title: string; title_ar: string | null; content: string | null; chapter_id: string; subject?: string; school_level?: string } | null>(null);
  const [content, setContent] = useState('');
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [canManage, setCanManage] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [isActivityActive, setActivityActive] = useState(false);

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
      if (chId) {
        const { data: chapterRow } = await supabase.from('chapters').select('subject, school_level').eq('id', chId).maybeSingle();
        chSubject = chapterRow?.subject || '';
        chSchoolLevel = chapterRow?.school_level || '';
      }

      setLesson({ ...data, chapter_id: chId, subject: chSubject, school_level: chSchoolLevel });
      setContent(data.content || '');
    } catch (err) {
      console.error(err);
      toast({ title: 'Erreur', description: 'Impossible de charger la leçon', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [lessonId, navigate, toast]);

  useEffect(() => { fetchLesson(); }, [fetchLesson]);

  // Realtime: auto-refresh when lesson content changes
  useEffect(() => {
    if (!lessonId) return;
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
  }, [lessonId, mode]);

  const handleSave = async () => {
    if (!lessonId) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('lessons').update({ content }).eq('id', lessonId);
      if (error) throw error;
      toast({ title: 'Sauvegardé', description: 'Le contenu a été mis à jour avec succès.' });
      setMode('view');
      // Update local state
      setLesson(prev => prev ? { ...prev, content } : null);
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Erreur', description: err.message || 'Impossible de sauvegarder', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!lessonId) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-lesson-content', {
        body: { lesson_id: lessonId }
      });

      if (error) {
        console.error("Erreur technique Supabase:", error);
        throw new Error(`Erreur réseau/auth: ${error.message}`);
      }

      if (data && data.success === false) {
        throw new Error(data.error || 'Erreur lors de la génération');
      }

      await fetchLesson();
      toast({ title: 'Contenu généré', description: 'Le contenu a été généré avec succès.' });
    } catch (err: any) {
      console.error("Détails de l'erreur:", err);
      toast({
        title: 'Erreur',
        description: err.message || 'Impossible de générer le contenu',
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!lessonId) return;
    try {
      const { error } = await supabase.from('lessons').update({ content: null }).eq('id', lessonId);
      if (error) throw error;
      toast({ title: 'Contenu supprimé', description: 'Le contenu de la leçon a été effacé.' });
      setContent('');
      setLesson(prev => prev ? { ...prev, content: null } : null);
      setMode('view');
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Erreur', description: err.message || 'Impossible de supprimer', variant: 'destructive' });
    }
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Modern Header / Breadcrumb */}
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg border border-primary/10 mb-6">
          <button
            onClick={() => {
              if (lesson?.subject && lesson?.school_level && lesson?.chapter_id) {
                navigate(`/cours/${lesson.subject}?niveau=${lesson.school_level}&chapitre=${lesson.chapter_id}`);
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

        {/* Exercises & Quizzes CRUD for pedago - moved to top */}
        {canManage && lesson.chapter_id && (
          <LessonEditorActivities
            chapterId={lesson.chapter_id}
            lessonId={lesson.id}
            lessonTitle={lesson.title_ar || lesson.title}
            onActiveChange={(isActive) => setActivityActive(isActive)}
          />
        )}

        {/* Hide the rest of the page if an activity is active */}
        {!isActivityActive && (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 min-w-0">
              {/* Action bar */}
              {canManage && (
                <div className="flex items-center gap-2 mb-6">
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
              )}

              {/* Content */}
              <Card>
                <CardHeader>
                  <CardTitle>{mode === 'edit' ? 'Éditeur de contenu' : 'Contenu du cours'}</CardTitle>
                </CardHeader>
                <CardContent>
                  {mode === 'edit' ? (
                    <LessonRichEditor content={content} onChange={setContent} editable />
                  ) : (
                    content ? (
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: injectHeaderIds(content) }}
                      />
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
    </div>
  );
}
