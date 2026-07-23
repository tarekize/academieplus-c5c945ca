import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Cpu, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface UsageRow {
  role_group: string;
  function_name: string;
  estimated_input_tokens: number;
  estimated_output_tokens: number;
  is_estimated: boolean;
  created_at: string;
}

const GROUP_LABELS: Record<string, string> = {
  student: "Élèves",
  teacher: "Enseignants",
  pedago: "Pédago",
  parent: "Parents",
  admin: "Administrateurs",
};

// Nom lisible de chaque IA (function_name technique de l'edge function) pour
// que l'admin voie immédiatement QUELLE IA a été appelée, pas juste un nom de
// fonction technique. Une IA = une fonction = une ligne ici : si une nouvelle
// fonction IA est ajoutée côté backend sans entrée ici, son nom technique
// brut s'affiche quand même (repli dans FUNCTION_LABEL ci-dessous).
const FUNCTION_LABELS: Record<string, string> = {
  "lovable-chat": "💬 Chat IA — Élève (tuteur de maths)",
  "generate-editorial-assistant": "✍️ Assistant éditorial — Enseignant/Pédago",
  "generate-lesson-comment": "📝 Commentaire post-exercice — Élève",
  "generate-adaptive-content": "🎯 Exercices/Quiz adaptatifs — Élève",
  "generate-remediation": "🩹 Remédiation ciblée (lacunes) — Élève",
  "generate-exam-exercise": "📐 Génération d'exercice d'examen — Enseignant",
  "generate-teacher-content": "🧑‍🏫 Contenu pédagogique (exercices/quiz/examen) — Enseignant",
  "generate-parent-report": "👪 Rapport de suivi — Parent",
  "generate-periodic-advice": "📆 Conseils + exercices périodiques — Élève",
  "generate-placement-test": "🧭 Test de positionnement — Élève",
  "generate-lesson-content": "📘 Génération de contenu de leçon — Admin/Pédago",
  "generate-chapter-quizzes": "❓ Quiz de chapitre — Admin/Pédago",
  "generate-chapter-revision": "📋 Fiche de révision de chapitre — Admin/Pédago",
  "bulk-gen-terminale-gemini": "📦 Génération en masse Terminale — Admin",
  "bulk-generate-all-terminale": "📦 Génération en masse Terminale (legacy) — Admin",
  "bulk-generate-lesson-content": "📦 Génération en masse de leçons — Admin",
  "enrich-chapter-lessons": "✨ Enrichissement de leçons — Admin/Pédago",
  "scheduled-parent-reports": "⏰ Rapports parents programmés — Automatique",
};

function functionLabel(name: string): string {
  return FUNCTION_LABELS[name] || name;
}

export default function AdminTokenUsage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<UsageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [functionFilter, setFunctionFilter] = useState<string>("all");

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ai_token_usage" as any)
      .select("role_group, function_name, estimated_input_tokens, estimated_output_tokens, is_estimated, created_at")
      .order("created_at", { ascending: false })
      .limit(5000);
    if (error) {
      console.error("Failed to load AI token usage:", error);
      setLoadError(error.message);
      toast.error("Impossible de charger la consommation IA", { description: error.message });
    } else {
      setLoadError(null);
    }
    setRows((data as any as UsageRow[]) || []);
    setLoading(false);
  };

  // Liste des IA effectivement présentes dans les logs, triée par nom lisible
  // — sert au filtre "Filtrer par IA" du tableau ci-dessous.
  const availableFunctions = useMemo(() => {
    const names = Array.from(new Set(rows.map((r) => r.function_name)));
    return names.sort((a, b) => functionLabel(a).localeCompare(functionLabel(b)));
  }, [rows]);

  const filteredRows = useMemo(
    () => (functionFilter === "all" ? rows : rows.filter((r) => r.function_name === functionFilter)),
    [rows, functionFilter]
  );

  const chartData = Object.keys(GROUP_LABELS).map((group) => {
    const groupRows = rows.filter((r) => r.role_group === group);
    const total = groupRows.reduce((sum, r) => sum + r.estimated_input_tokens + r.estimated_output_tokens, 0);
    return { group: GROUP_LABELS[group], tokens: total };
  });

  const grandTotal = rows.reduce((sum, r) => sum + r.estimated_input_tokens + r.estimated_output_tokens, 0);
  const exactRowsCount = rows.filter((r) => r.is_estimated === false).length;
  const exactPct = rows.length > 0 ? Math.round((exactRowsCount / rows.length) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pro-shell">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Retour
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Cpu className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-extrabold">Consommation IA (tokens)</h1>
                <p className="text-sm text-muted-foreground">
                  {rows.length > 0
                    ? `${exactPct}% des entrées sont un comptage exact (fourni par l'IA), le reste est estimé`
                    : "Usage de tokens par groupe"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {loadError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 text-destructive px-4 py-3 text-sm">
            Échec du chargement des données : {loadError}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <p className="font-display text-2xl font-extrabold">{grandTotal.toLocaleString("fr-FR")}</p>
              <p className="text-xs text-muted-foreground">Total estimé</p>
            </CardContent>
          </Card>
          {Object.keys(GROUP_LABELS).map((group) => {
            const total = rows
              .filter((r) => r.role_group === group)
              .reduce((sum, r) => sum + r.estimated_input_tokens + r.estimated_output_tokens, 0);
            return (
              <Card key={group} className="border-0 shadow-lg">
                <CardContent className="p-4">
                  <p className="font-display text-2xl font-extrabold">{total.toLocaleString("fr-FR")}</p>
                  <p className="text-xs text-muted-foreground">{GROUP_LABELS[group]}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle>Répartition par groupe</CardTitle>
            <CardDescription>
              Les entrées marquées "Exact" viennent du comptage réel renvoyé par l'IA ; les autres sont estimées (caractères / 4)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="group" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tokens" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b bg-muted/30 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Derniers appels IA</CardTitle>
              <CardDescription>
                {functionFilter === "all"
                  ? "200 entrées les plus récentes"
                  : `200 entrées les plus récentes — filtré sur : ${functionLabel(functionFilter)}`}
              </CardDescription>
            </div>
            <Select value={functionFilter} onValueChange={setFunctionFilter}>
              <SelectTrigger className="w-full sm:w-[320px]">
                <SelectValue placeholder="Filtrer par IA" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les IA</SelectItem>
                {availableFunctions.map((name) => (
                  <SelectItem key={name} value={name}>{functionLabel(name)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Date</TableHead>
                  <TableHead>Groupe</TableHead>
                  <TableHead>IA utilisée</TableHead>
                  <TableHead>Précision</TableHead>
                  <TableHead className="text-right">Tokens</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Aucune consommation enregistrée pour le moment.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRows.slice(0, 200).map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{format(new Date(r.created_at), "dd MMM yyyy à HH:mm", { locale: fr })}</TableCell>
                      <TableCell>{GROUP_LABELS[r.role_group] || r.role_group}</TableCell>
                      <TableCell>
                        <div className="text-sm">{functionLabel(r.function_name)}</div>
                        <div className="text-xs text-muted-foreground font-mono">{r.function_name}</div>
                      </TableCell>
                      <TableCell>
                        {r.is_estimated === false ? (
                          <Badge variant="default" className="rounded-full">Exact</Badge>
                        ) : (
                          <Badge variant="secondary" className="rounded-full">Estimé</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {(r.estimated_input_tokens + r.estimated_output_tokens).toLocaleString("fr-FR")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
