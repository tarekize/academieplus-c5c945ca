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
import {
  ArrowLeft, Loader2, Users, BookOpen, Trash2, Copy, School, Plus, HeartHandshake, Lock,
} from "lucide-react";
import TeacherPageHeader from "./TeacherPageHeader";
import { cn } from "@/lib/utils";
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

interface Establishment { id: string; name: string; type: string | null; ville: string | null; establishment_profile_id: string | null; is_active: boolean; }
interface DetailStudent {
  id: string; first_name: string | null; last_name: string | null;
  email: string | null; school_level: string | null; filiere?: string | null; avatar_url: string | null;
}


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
  const [estabToDelete, setEstabToDelete] = useState<string | null>(null);

  // Add establishment by code
  const [creating, setCreating] = useState(false);
  const [estCode, setEstCode] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchEstablishments = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("establishments" as any)
      .select("id, name, type, ville, establishment_profile_id")
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: true });
    let rows = (data as any as Establishment[]) || [];

    // Auto-populate from the establishment linked during signup
    if (rows.length === 0) {
      try {
        const { data: primary } = await supabase.rpc("get_my_primary_establishment" as any);
        const primaryRow = Array.isArray(primary) ? primary[0] : primary;
        if (primaryRow?.establishment_name) {
          if (primaryRow.establishment_id) {
            await supabase.from("teacher_establishments" as any).upsert(
              { teacher_id: teacherId, establishment_id: primaryRow.establishment_id },
              { onConflict: "teacher_id,establishment_id" }
            );
          }
          const { data: created } = await supabase
            .from("establishments" as any)
            .insert({
              teacher_id: teacherId,
              name: primaryRow.establishment_name,
              establishment_profile_id: primaryRow.establishment_id ?? null,
            })
            .select("id, name, type, ville, establishment_profile_id")
            .single();
          if (created) rows = [{ ...(created as any), is_active: true } as Establishment];
        }
      } catch {
        // fail silently — teacher can add via code
      }
    }

    // Self-heal legacy rows created before establishment_profile_id existed:
    // resolve the link by matching the establishment name against the
    // teacher's linked accounts, so the active/inactive check below always
    // has a profile to check against instead of silently defaulting to active.
    const unresolved = rows.filter((r) => !r.establishment_profile_id);
    if (unresolved.length > 0) {
      const { data: links } = await supabase
        .from("teacher_establishments" as any)
        .select("establishment_id")
        .eq("teacher_id", teacherId);
      const estIds = ((links as any[]) || []).map((l) => l.establishment_id);
      if (estIds.length > 0) {
        const { data: linkedProfs } = await supabase
          .from("profiles")
          .select("id, first_name")
          .in("id", estIds);
        const byName = new Map(
          ((linkedProfs as any[]) || []).map((p) => [String(p.first_name || "").trim().toLowerCase(), p.id as string])
        );
        for (const r of unresolved) {
          const matchId = byName.get(r.name.trim().toLowerCase());
          if (matchId) {
            r.establishment_profile_id = matchId;
            supabase.from("establishments" as any).update({ establishment_profile_id: matchId }).eq("id", r.id);
          }
        }
      }
    }

    // Mark establishments whose linked institutional account is deactivated —
    // they stay visible but locked, they are not hidden.
    const linkedIds = rows.map((r) => r.establishment_profile_id).filter(Boolean) as string[];
    let inactiveSet = new Set<string>();
    if (linkedIds.length > 0) {
      const { data: linkedProfiles } = await supabase
        .from("profiles")
        .select("id, is_active")
        .in("id", linkedIds);
      inactiveSet = new Set(
        ((linkedProfiles as any[]) || []).filter((p) => p.is_active === false).map((p) => p.id)
      );
    }
    rows = rows.map((r) => ({
      ...r,
      is_active: !r.establishment_profile_id || !inactiveSet.has(r.establishment_profile_id),
    }));

    setEstablishments(rows);
    if (rows.length > 0 && !activeEstab) setActiveEstab(rows[0].id);
    setLoading(false);
  }, [teacherId, activeEstab]);

  const activeEstablishment = establishments.find((e) => e.id === activeEstab);
  const isActiveLocked = activeEstablishment ? activeEstablishment.is_active === false : false;

  const fetchClasses = useCallback(async () => {
    if (isActiveLocked) { setClasses([]); return; }
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
  }, [teacherId, activeEstab, isActiveLocked]);

  useEffect(() => { fetchEstablishments(); }, [fetchEstablishments]);
  useEffect(() => { if (activeEstab) fetchClasses(); }, [activeEstab, fetchClasses]);

  const addByCode = async () => {
    const code = estCode.trim().toUpperCase();
    if (!code) { toast.error("Entrez un code d'établissement."); return; }
    setCreating(true);
    try {
      const { data: joinResult, error: rpcError } = await supabase
        .rpc("join_establishment_by_code" as any, { p_code: code });
      const result = Array.isArray(joinResult) ? joinResult[0] : joinResult;
      if (rpcError || !result?.establishment_name) {
        toast.error("Code d'établissement invalide.");
        return;
      }
      const { data, error } = await supabase
        .from("establishments" as any)
        .insert({ teacher_id: teacherId, name: result.establishment_name, establishment_profile_id: result.establishment_id })
        .select("id, name, type, ville, establishment_profile_id")
        .single();
      if (error) throw error;
      toast.success("Établissement ajouté");
      setEstCode("");
      setShowCreateForm(false);
      const created = { ...(data as any), is_active: true } as Establishment;
      setEstablishments((prev) => [...prev, created]);
      setActiveEstab(created.id);
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'ajout");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteEstablishment = async (id: string) => {
    try {
      const { error } = await supabase.from("establishments" as any).delete().eq("id", id);
      if (error) throw error;
      const remaining = establishments.filter((e) => e.id !== id);
      setEstablishments(remaining);
      if (activeEstab === id) setActiveEstab(remaining[0]?.id ?? "");
      toast.success("Établissement supprimé");
    } catch {
      toast.error("Impossible de supprimer l'établissement");
    } finally {
      setEstabToDelete(null);
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
    if (isActiveLocked) return;
    setSelectedClass(c);
    const { data } = await supabase.from("class_students").select("student_id").eq("class_id", c.id);
    setClassMembers(((data as any[]) || []).map((m) => m.student_id));
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  // --- Student detail view ---
  if (detailStudent) {
    const sName = [detailStudent.first_name, detailStudent.last_name].filter(Boolean).join(" ") || "Élève";
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Button variant="ghost" size="sm" onClick={() => setDetailStudent(null)} className="gap-2 -ml-2 rounded-xl text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Retour à la classe
          </Button>
          <Button className="gap-2 rounded-xl" onClick={() => setHelpOpen(true)}>
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
          <Button variant="ghost" size="sm" onClick={() => setSelectedClass(null)} className="gap-2 -ml-2 rounded-xl text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Mes classes
          </Button>
          <Button className="gap-2 rounded-xl" onClick={() => setHelpOpen(true)}>
            <HeartHandshake className="h-4 w-4" /> Aider les élèves
          </Button>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{selectedClass.name}</h1>
              <p className="text-muted-foreground">
                {getSchoolLevelLabel(selectedClass.school_level || "")}
                {selectedClass.filiere ? ` · ${selectedClass.filiere}` : ""}
              </p>
            </div>
          </div>
          {selectedClass.join_code && (
            <div className="rounded-2xl border border-border/60 bg-muted/40 px-4 py-3">
              <p className="text-xs text-muted-foreground mb-2">Code de la classe</p>
              <div className="flex items-start gap-6 flex-wrap">
                {/* Text code */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-bold tracking-widest">{selectedClass.join_code}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"
                      onClick={() => { navigator.clipboard.writeText(selectedClass.join_code || ""); toast.success("Code copié"); }}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Partagez-le pour que vos élèves rejoignent la classe.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-1 w-fit text-xs rounded-xl"
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
      <TeacherPageHeader
        icon={School}
        iconClassName="bg-blue-500/10 text-blue-600"
        title={`Mes classes${active ? ` — ${active.name}` : ""}`}
        description="Gérez vos classes et suivez la progression de vos élèves."
        onBack={onBack}
        action={!isActiveLocked && (
          <CreateClassDialog teacherId={teacherId} establishmentId={activeEstab} onCreated={fetchClasses} />
        )}
      />

      <div className="flex flex-wrap items-center gap-2">
        {establishments.map((e) => (
          <div
            key={e.id}
            className={cn(
              "group flex items-center gap-1 rounded-xl pr-1 transition-colors",
              e.id === activeEstab ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted hover:bg-muted/70",
            )}
          >
            <button
              onClick={() => setActiveEstab(e.id)}
              className={cn(
                "flex items-center gap-2 rounded-xl py-2 pl-3.5 pr-2 text-sm font-medium",
                e.is_active === false && "opacity-70",
              )}
            >
              {e.is_active === false ? <Lock className="h-3.5 w-3.5" /> : <School className="h-3.5 w-3.5" />}
              {e.name}
            </button>
            <button
              onClick={() => setEstabToDelete(e.id)}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
                e.id === activeEstab
                  ? "text-primary-foreground/70 hover:bg-white/15 hover:text-primary-foreground"
                  : "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
              )}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <Button size="sm" variant="ghost" className="gap-1.5 rounded-xl text-muted-foreground hover:text-foreground" onClick={() => setShowCreateForm((s) => !s)}>
          <Plus className="h-4 w-4" /> Établissement
        </Button>
      </div>

      {showCreateForm && (
        <Card className="rounded-2xl border-border/50">
          <CardContent className="p-4 flex gap-3 items-center">
            <Input
              value={estCode}
              onChange={(e) => setEstCode(e.target.value.toUpperCase())}
              placeholder="Code d'établissement"
              className="font-mono tracking-widest uppercase flex-1 rounded-xl"
            />
            <Button onClick={addByCode} disabled={creating} className="gap-2 shrink-0 rounded-xl">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Ajouter
            </Button>
          </CardContent>
        </Card>
      )}

      {isActiveLocked ? (
        <Card className="rounded-2xl border-dashed">
          <CardContent className="py-16 text-center space-y-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Établissement désactivé</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              L'accès aux classes de {active?.name || "cet établissement"} est verrouillé car son abonnement est inactif.
              Contactez l'établissement ou l'administration pour le réactiver.
            </p>
          </CardContent>
        </Card>
      ) : classes.length === 0 ? (
        <Card className="rounded-2xl border-dashed">
          <CardContent className="py-16 text-center space-y-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold">Aucune classe pour le moment</h3>
            <p className="text-muted-foreground">Créez votre première classe pour commencer.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((c) => (
            <Card key={c.id} className="rounded-2xl border-border/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card)]">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{c.name}</CardTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => setClassToDelete(c.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="rounded-full">{getSchoolLevelLabel(c.school_level || "")}</Badge>
                  {c.filiere && <Badge variant="outline" className="rounded-full">{c.filiere}</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" /> {counts[c.id] || 0} élève(s)
                </div>
                <Button className="w-full rounded-xl" onClick={() => openClass(c)}>Voir la progression</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>

    <AlertDialog open={!!estabToDelete} onOpenChange={(open) => { if (!open) setEstabToDelete(null); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer l'établissement ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. L'établissement et toutes ses classes associées seront définitivement supprimés.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => { if (estabToDelete) handleDeleteEstablishment(estabToDelete); }}
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

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
