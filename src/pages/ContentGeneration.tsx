import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Sparkles, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const SCHOOL_LEVELS = [
  { value: 'all', label: 'Tous les niveaux' },
  { value: '5eme_primaire', label: '5ème Primaire' },
  { value: '1ere_cem', label: '1ère CEM' },
  { value: '2eme_cem', label: '2ème CEM' },
  { value: '3eme_cem', label: '3ème CEM' },
  { value: '4eme_cem', label: '4ème CEM' },
  { value: 'premiere', label: '1ère Secondaire' },
  { value: 'seconde', label: '2ème Secondaire' },
  { value: 'terminale', label: 'Terminale' },
];

export default function ContentGeneration() {
  const navigate = useNavigate();
  const [level, setLevel] = useState('all');
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState({ total: 0, withContent: 0, remaining: 0 });
  const [log, setLog] = useState<{ id: string; status: string }[]>([]);
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/auth'); return; }
      const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', user.id);
      const r = roles?.map(x => x.role) || [];
      if (!r.includes('admin') && !r.includes('pedago')) { navigate('/dashboard'); return; }
      setCanAccess(true);
    })();
  }, [navigate]);

  const refreshStats = async () => {
    const { count: total } = await supabase.from('lessons').select('id', { count: 'exact', head: true });
    const { count: withContent } = await supabase.from('lessons').select('id', { count: 'exact', head: true }).neq('content', '').not('content', 'is', null);
    setStats({ total: total || 0, withContent: withContent || 0, remaining: (total || 0) - (withContent || 0) });
  };

  useEffect(() => { if (canAccess) refreshStats(); }, [canAccess]);

  const runBatch = async () => {
    setRunning(true);
    try {
      const body: any = { batch_size: 3, offset: 0 };
      if (level !== 'all') body.school_level = level;

      const { data, error } = await supabase.functions.invoke('generate-lesson-content', { body });
      if (error) throw error;

      if (data.processed === 0) {
        toast.success('Terminé', { description: 'Toutes les leçons ont du contenu.' });
      } else {
        setLog(prev => [...data.results, ...prev].slice(0, 50));
        toast.success(`${data.processed} leçon(s) générée(s)`, { description: `${data.remaining} restante(s)` });
      }
      await refreshStats();
    } catch (err: any) {
      toast.error('Erreur', { description: err.message });
    } finally {
      setRunning(false);
    }
  };

  const runAll = async () => {
    setRunning(true);
    let remaining = stats.remaining;
    while (remaining > 0) {
      try {
        const body: any = { batch_size: 3, offset: 0 };
        if (level !== 'all') body.school_level = level;
        const { data, error } = await supabase.functions.invoke('generate-lesson-content', { body });
        if (error) throw error;
        if (data.processed === 0) break;
        setLog(prev => [...data.results, ...prev].slice(0, 100));
        remaining = data.remaining;
        await refreshStats();
      } catch {
        break;
      }
    }
    toast.success('Génération terminée');
    setRunning(false);
  };

  if (!canAccess) return null;

  const pct = stats.total > 0 ? Math.round((stats.withContent / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen pro-shell">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate(-1 as any)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        <h1 className="font-display text-3xl font-extrabold mb-6">Génération de contenu pédagogique</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Progression</CardTitle>
            <CardDescription>{stats.withContent} / {stats.total} leçons avec contenu ({pct}%)</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={pct} className="h-3" />
            <p className="mt-2 text-sm text-muted-foreground">{stats.remaining} leçon(s) restante(s)</p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Générer du contenu</CardTitle>
            <CardDescription>Utilisez l'IA pour générer du contenu en arabe pour les leçons vides</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCHOOL_LEVELS.map(l => (
                  <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-3">
              <Button onClick={runBatch} disabled={running || stats.remaining === 0}>
                {running ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Générer un lot (3)
              </Button>
              <Button variant="secondary" onClick={runAll} disabled={running || stats.remaining === 0}>
                {running ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Générer tout
              </Button>
            </div>
          </CardContent>
        </Card>

        {log.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Journal de génération</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-64 overflow-y-auto text-sm">
                {log.map((entry, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {entry.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                    )}
                    <span className="font-mono text-xs truncate">{entry.id}</span>
                    <span className={entry.status === 'success' ? 'text-green-600' : 'text-destructive'}>{entry.status}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
