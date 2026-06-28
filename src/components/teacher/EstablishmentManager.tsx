import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, Loader2, Users, BookOpen, Trash2, Copy, School, Plus, HeartHandshake,
} from "lucide-react";
import { toast } from "sonner";
import QRCode from "react-qr-code";
import { getSchoolLevelLabel } from "@/lib/validation";
import CreateClassDialog from "./CreateClassDialog";
import ClassProgressView, { ClassRow } from "./ClassProgressView";
import ClassAnnouncementsManager from "./ClassAnnouncementsManager";
import TeacherStudentNotes from "./TeacherStudentNotes";
import HelpDialog from "./HelpDialog";
import ParentTeacherChat from "@/components/messaging/ParentTeacherChat";
import StudentDashboardContent from "@/components/dashboard/StudentDashboardContent";

interface Establishment { id: string; name: string; type: string | null; ville: string | null; }
interface DetailStudent {
  id: string; first_name: string | null; last_name: string | null;
  email: string | null; school_level: string | null; filiere?: string | null; avatar_url: string | null;
}

const ESTAB_TYPES = [
  { value: "primaire", label: "École primaire" },
  { value: "cem", label: "CEM (Collège)" },
  { value: "lycee", label: "Lycée" },
  { value: "autre", label: "Autre" },
];

export default function EstablishmentManager({ teacherId, onBack }: { teacherId: string; onBack: () => void; }) {
  const [loading, setLoading] = useState(true);
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [activeEstab, setActiveEstab] = useState<string>("");
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [classMembers, setClassMembers] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassRow | null>(null);
  const [detailStudent, setDetailStudent] = useState<DetailStudent | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<string | null>(null);

  // Establishment creation form
  const [creating, setCreating] = useState(false);
  const [estName, setEstName] = useState("");
  const [estType, setEstType] = useState("");
  const [estVille, setEstVille] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchEstablishments = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("establishments" as any)
      .select("id, name, type, ville")
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: true });
    const rows = (data as any as Establishment[]) || [];
    setEstablishments(rows);
    if (rows.length > 0 && !activeEstab) setActiveEstab(rows[0].id);
    setLoading(false);
  }, [teacherId, activeEstab]);

  const fetchClasses = useCallback(async () => {
    const { data } = await supabase
      .from("classes")
      .select("id, name, school_level, filiere, subject, join_code, establishment_id")
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false });
    const all = (data as any[]) || [];
    const rows = (activeEstab ? all.filter((c) => c.establishment_id === activeEstab) : all) as ClassRow[];
    setClasses(rows);
    if (rows.length > 0) {
      const { data: members } = await supabase
        .from("class_students").select("class_id, student_id").in("class_id", rows.map((c) => c.id));
      const memberRows = (members as any[]) || [];
      const studentIds = [...new Set(memberRows.map((m) => m.student_id))];
      let activeIds = new Set<string>();
      if (studentIds.length > 0) {
        const { data: profs } = await supabase.from("profiles").select("id").in("id", studentIds);
        activeIds = new Set((profs as any[] || []).map((p) => p.id));
      }
      const map: Record<string, number> = {};
      for (const m of memberRows) {
        if (activeIds.has(m.student_id)) map[m.class_id] = (map[m.class_id] || 0) + 1;
      }
      setCounts(map);
    }
  }, [teacherId, activeEstab]);

  useEffect(() => { fetchEstablishments(); }, [fetchEstablishments]);
  useEffect(() => { if (activeEstab) fetchClasses(); }, [activeEstab, fetchClasses]);

  const createEstablishment = async () => {
    if (!estName.trim()) { toast.error("Donnez un nom à l'établissement."); return; }
    setCreating(true);
    try {
      const { data, error } = await supabase
        .from("establishments" as any)
        .insert({ teacher_id: teacherId, name: estName.trim(), type: estType || null, ville: estVille.trim() || null })
        .select("id, name, type, ville")
        .single();
      if (error) throw error;
      toast.success("Établissement créé");
      setEstName(""); setEstType(""); setEstVille(""); setShowCreateForm(false);
      const created = data as any as Establishment;
      setEstablishments((prev) => [...prev, created]);
      setActiveEstab(created.id);
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la création");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteClass = async (id: string) => {
    try {
      const { error } = await supabase.from("classes").delete().eq("id", id);
      if (error) throw error;
      fetchClasses();
    } catch {
      toast.error("Impossible de supprimer la classe");
    }
  };

  const openClass = async (c: ClassRow) => {
    setSelectedClass(c);
    const { data } = await supabase.from("class_students").select("student_id").eq("class_id", c.id);
    setClassMembers(((data as any[]) || []).map((m) => m.student_id));
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  // --- Onboarding: no establishment yet ---
  if (establishments.length === 0) {
    return (
      <div className="max-w-lg mx-auto">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 -ml-2 mb-3">
          <ArrowLeft className="h-4 w-4" /> Accueil
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><School className="h-5 w-5 text-primary" /> Créez votre établissement</CardTitle>
            <p className="text-sm text-muted-foreground">Avant de gérer vos classes, créez votre établissement scolaire.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nom de l'établissement *</Label>
              <Input value={estName} onChange={(e) => setEstName(e.target.value)} placeholder="Ex : Lycée El Feth" />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={estType} onValueChange={setEstType}>
                <SelectTrigger><SelectValue placeholder="Type d'établissement" /></SelectTrigger>
                <SelectContent>
                  {ESTAB_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Ville</Label>
              <Input value={estVille} onChange={(e) => setEstVille(e.target.value)} placeholder="Ville (optionnel)" />
            </div>
            <Button onClick={createEstablishment} disabled={creating} className="w-full gap-2">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Créer et continuer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Student detail view ---
  if (detailStudent) {
    const sName = [detailStudent.first_name, detailStudent.last_name].filter(Boolean).join(" ") || "Élève";
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Button variant="ghost" size="sm" onClick={() => setDetailStudent(null)} className="gap-2 -ml-2">
            <ArrowLeft className="h-4 w-4" /> Retour à la classe
          </Button>
          <Button className="gap-2" onClick={() => setHelpOpen(true)}>
            <HeartHandshake className="h-4 w-4" /> Aider l'élève
          </Button>
        </div>
        <StudentDashboardContent
          userId={detailStudent.id}
          profile={{
            first_name: detailStudent.first_name, last_name: detailStudent.last_name,
            avatar_url: detailStudent.avatar_url, school_level: detailStudent.school_level,
            filiere: detailStudent.filiere, email: detailStudent.email,
          }}
          parentView hideActions
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <TeacherStudentNotes studentId={detailStudent.id} classId={selectedClass?.id ?? null} />
          <ParentTeacherChat studentId={detailStudent.id} studentName={sName} role="teacher" />
        </div>
        <HelpDialog
          open={helpOpen} onOpenChange={setHelpOpen} teacherId={teacherId}
          mode="student" schoolLevel={detailStudent.school_level}
          studentId={detailStudent.id} targetName={sName}
        />
      </div>
    );
  }

  // --- Class view ---
  if (selectedClass) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Button variant="ghost" size="sm" onClick={() => setSelectedClass(null)} className="gap-2 -ml-2">
            <ArrowLeft className="h-4 w-4" /> Mes classes
          </Button>
          <Button className="gap-2" onClick={() => setHelpOpen(true)}>
            <HeartHandshake className="h-4 w-4" /> Aider les élèves
          </Button>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" /> {selectedClass.name}
            </h1>
            <p className="text-muted-foreground">
              {getSchoolLevelLabel(selectedClass.school_level || "")}
              {selectedClass.filiere ? ` · ${selectedClass.filiere}` : ""}
            </p>
          </div>
          {selectedClass.join_code && (
            <div className="rounded-xl border bg-muted/40 px-4 py-3">
              <p className="text-xs text-muted-foreground mb-2">Code de la classe</p>
              <div className="flex items-start gap-6 flex-wrap">
                {/* Text code */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-bold tracking-widest">{selectedClass.join_code}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8"
                      onClick={() => { navigator.clipboard.writeText(selectedClass.join_code || ""); toast.success("Code copié"); }}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Partagez-le pour que vos élèves rejoignent la classe.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-1 w-fit text-xs"
                    onClick={async () => {
                      const url = `${window.location.origin}/rejoindre/${selectedClass.join_code}`;
                      try {
                        await navigator.clipboard.writeText(url);
                        toast.success("Lien QR copié");
                      } catch {
                        const el = document.createElement("textarea");
                        el.value = url;
                        el.style.position = "fixed";
                        el.style.opacity = "0";
                        document.body.appendChild(el);
                        el.select();
                        document.execCommand("copy");
                        document.body.removeChild(el);
                        toast.success("Lien QR copié");
                      }
                    }}
                  >
                    <Copy className="h-3 w-3 mr-1" /> Copier le lien QR
                  </Button>
                </div>
                {/* QR code */}
                <div className="flex flex-col items-center gap-1">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <QRCode
                      value={`${window.location.origin}/rejoindre/${selectedClass.join_code}`}
                      size={100}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Scanner pour rejoindre</p>
                </div>
              </div>
            </div>
          )}
        </div>
        <ClassAnnouncementsManager classId={selectedClass.id} />
        <ClassProgressView
          key={selectedClass.id}
          classRow={selectedClass}
          onOpenStudentDetail={(s) => setDetailStudent(s as DetailStudent)}
        />
        <HelpDialog
          open={helpOpen} onOpenChange={setHelpOpen} teacherId={teacherId}
          mode="class" schoolLevel={selectedClass.school_level}
          classId={selectedClass.id} studentIds={classMembers} targetName={selectedClass.name}
        />
      </div>
    );
  }

  // --- Classes list view ---
  const active = establishments.find((e) => e.id === activeEstab);
  return (
    <>
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Accueil
      </Button>

      <div className="flex flex-wrap items-center gap-2">
        {establishments.map((e) => (
          <Button key={e.id} size="sm" variant={e.id === activeEstab ? "default" : "outline"}
            className="gap-2" onClick={() => setActiveEstab(e.id)}>
            <School className="h-4 w-4" /> {e.name}
          </Button>
        ))}
        <Button size="sm" variant="ghost" className="gap-1" onClick={() => setShowCreateForm((s) => !s)}>
          <Plus className="h-4 w-4" /> Établissement
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardContent className="p-4 grid gap-3 sm:grid-cols-4 items-end">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Nom *</Label>
              <Input value={estName} onChange={(e) => setEstName(e.target.value)} placeholder="Nom de l'établissement" />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={estType} onValueChange={setEstType}>
                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  {ESTAB_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={createEstablishment} disabled={creating} className="gap-2">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Ajouter
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Mes classes{active ? ` — ${active.name}` : ""}</h1>
          <p className="text-muted-foreground">Gérez vos classes et suivez la progression de vos élèves.</p>
        </div>
        <CreateClassDialog teacherId={teacherId} establishmentId={activeEstab} onCreated={fetchClasses} />
      </div>

      {classes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center space-y-3">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-semibold">Aucune classe pour le moment</h3>
            <p className="text-muted-foreground">Créez votre première classe pour commencer.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((c) => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{c.name}</CardTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setClassToDelete(c.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{getSchoolLevelLabel(c.school_level || "")}</Badge>
                  {c.filiere && <Badge variant="outline">{c.filiere}</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" /> {counts[c.id] || 0} élève(s)
                </div>
                <Button className="w-full" onClick={() => openClass(c)}>Voir la progression</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>

    <AlertDialog open={!!classToDelete} onOpenChange={(open) => { if (!open) setClassToDelete(null); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer la classe ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. La classe et toutes ses données seront définitivement supprimées.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => { if (classToDelete) { handleDeleteClass(classToDelete); setClassToDelete(null); } }}
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
