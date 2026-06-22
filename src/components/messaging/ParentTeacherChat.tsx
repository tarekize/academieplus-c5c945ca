import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Send, MessagesSquare } from "lucide-react";
import { toast } from "sonner";

interface Participant { id: string; name: string; }
interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface ParentTeacherChatProps {
  studentId: string;
  studentName?: string;
  /** 'teacher' = current user is the teacher; 'parent' = current user is the parent */
  role: "teacher" | "parent";
}

export default function ParentTeacherChat({ studentId, studentName, role }: ParentTeacherChatProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [counterparts, setCounterparts] = useState<Participant[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Resolve who the teacher/parent ids are for the current thread.
  const teacherId = role === "teacher" ? currentUserId : selected;
  const parentId = role === "parent" ? currentUserId : selected;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    supabase.functions
      .invoke("messaging-participants", { body: { studentId } })
      .then(({ data, error }) => {
        if (!active) return;
        if (error || (data as any)?.error) {
          toast.error((data as any)?.error || "Impossible de charger les contacts");
          setLoading(false);
          return;
        }
        const list: Participant[] = role === "teacher" ? (data as any).parents : (data as any).teachers;
        setCounterparts(list || []);
        if ((list || []).length > 0) setSelected(list[0].id);
        setLoading(false);
      });
    return () => { active = false; };
  }, [studentId, role]);

  const loadMessages = useCallback(async () => {
    if (!teacherId || !parentId) { setMessages([]); return; }
    const { data, error } = await (supabase as any)
      .from("teacher_parent_messages")
      .select("id, sender_id, content, created_at")
      .eq("student_id", studentId)
      .eq("teacher_id", teacherId)
      .eq("parent_id", parentId)
      .order("created_at", { ascending: true });
    if (!error) setMessages((data as Message[]) || []);
  }, [teacherId, parentId, studentId]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const handleSend = async () => {
    const text = content.trim();
    if (!text) return;
    if (!teacherId || !parentId) {
      toast.error(role === "teacher" ? "Aucun parent associé à cet élève." : "Aucun enseignant associé.");
      return;
    }
    setSending(true);
    try {
      const { error } = await (supabase as any).from("teacher_parent_messages").insert({
        teacher_id: teacherId,
        parent_id: parentId,
        student_id: studentId,
        sender_id: currentUserId,
        content: text,
      });
      if (error) throw error;
      setContent("");
      await loadMessages();
    } catch (e: any) {
      toast.error(e.message || "Échec de l'envoi");
    } finally {
      setSending(false);
    }
  };

  const counterpartLabel = role === "teacher" ? "Parent" : "Enseignant";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessagesSquare className="h-5 w-5 text-primary" />
          Messagerie {role === "teacher" ? "avec les parents" : "avec l'enseignant"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : counterparts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            {role === "teacher"
              ? "Aucun parent n'est encore lié à cet élève."
              : "Aucun enseignant n'encadre encore cet élève."}
          </p>
        ) : (
          <>
            {counterparts.length > 1 && (
              <Select value={selected} onValueChange={setSelected}>
                <SelectTrigger><SelectValue placeholder={`Choisir un ${counterpartLabel.toLowerCase()}`} /></SelectTrigger>
                <SelectContent>
                  {counterparts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{counterpartLabel} · {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div ref={scrollRef} className="h-64 overflow-y-auto rounded-lg border bg-muted/20 p-3 space-y-2">
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Aucun message. Démarrez la conversation.
                </p>
              ) : (
                messages.map((m) => {
                  const mine = m.sender_id === currentUserId;
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-card border"}`}>
                        <p className="whitespace-pre-wrap break-words">{m.content}</p>
                        <p className={`text-[10px] mt-1 ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {new Date(m.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex gap-2">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Écrire un message…"
                className="min-h-[44px] max-h-32 resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                }}
              />
              <Button onClick={handleSend} disabled={sending || !content.trim()} className="shrink-0">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
