import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Cpu, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface UsageRow {
  role_group: string;
  function_name: string;
  estimated_input_tokens: number;
  estimated_output_tokens: number;
  created_at: string;
}

const GROUP_LABELS: Record<string, string> = {
  student: "Élèves",
  teacher: "Enseignants",
  pedago: "Pédago",
  parent: "Parents",
  admin: "Administrateurs",
};

export default function AdminTokenUsage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<UsageRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("ai_token_usage" as any)
      .select("role_group, function_name, estimated_input_tokens, estimated_output_tokens, created_at")
      .order("created_at", { ascending: false })
      .limit(5000);
    setRows((data as any as UsageRow[]) || []);
    setLoading(false);
  };

  const chartData = Object.keys(GROUP_LABELS).map((group) => {
    const groupRows = rows.filter((r) => r.role_group === group);
    const total = groupRows.reduce((sum, r) => sum + r.estimated_input_tokens + r.estimated_output_tokens, 0);
    return { group: GROUP_LABELS[group], tokens: total };
  });

  const grandTotal = rows.reduce((sum, r) => sum + r.estimated_input_tokens + r.estimated_output_tokens, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
                <h1 className="text-2xl font-bold">Consommation IA (tokens)</h1>
                <p className="text-sm text-muted-foreground">Estimation de l'usage de tokens par groupe (approximation)</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{grandTotal.toLocaleString("fr-FR")}</p>
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
                  <p className="text-2xl font-bold">{total.toLocaleString("fr-FR")}</p>
                  <p className="text-xs text-muted-foreground">{GROUP_LABELS[group]}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle>Répartition par groupe</CardTitle>
            <CardDescription>Estimation approximative (caractères / 4), pas un comptage exact des fournisseurs IA</CardDescription>
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
          <CardHeader className="border-b bg-muted/30">
            <CardTitle>Derniers appels IA</CardTitle>
            <CardDescription>200 entrées les plus récentes</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Date</TableHead>
                  <TableHead>Groupe</TableHead>
                  <TableHead>Fonction</TableHead>
                  <TableHead className="text-right">Tokens estimés</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Aucune consommation enregistrée pour le moment.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.slice(0, 200).map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{format(new Date(r.created_at), "dd MMM yyyy à HH:mm", { locale: fr })}</TableCell>
                      <TableCell>{GROUP_LABELS[r.role_group] || r.role_group}</TableCell>
                      <TableCell className="text-muted-foreground">{r.function_name}</TableCell>
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
