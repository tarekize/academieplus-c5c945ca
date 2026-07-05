import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MessageCircle, Trash2, Plus, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type Message = {
  role: "user" | "assistant";
  content: string | any[];
};

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
  chapter_id: string | null;
};

interface ChatHistoryProps {
  chapterId?: string | null;
  onSelectConversation: (messages: Message[], conversationId: string) => void;
  onNewConversation: () => void;
  onClose: () => void;
  activeConversationId: string | null;
}

export default function ChatHistory({
  chapterId,
  onSelectConversation,
  onNewConversation,
  onClose,
  activeConversationId,
}: ChatHistoryProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      let query = supabase
        .from("chat_conversations")
        .select("*")
        .eq("user_id", session.user.id)
        .order("updated_at", { ascending: false });

      if (chapterId) {
        query = query.eq("chapter_id", chapterId);
      } else {
        query = query.is("chapter_id", null);
      }

      const { data, error } = await query;
      if (error) throw error;

      setConversations(
        (data || []).map((c: any) => ({
          ...c,
          messages: Array.isArray(c.messages) ? c.messages : [],
        }))
      );
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [chapterId]);

  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await supabase.from("chat_conversations").delete().eq("id", id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        onNewConversation();
      }
    } catch (err) {
      console.error("Error deleting conversation:", err);
    }
  };

  const getPreview = (conv: Conversation): string => {
    const firstUserMsg = conv.messages.find((m) => m.role === "user");
    if (!firstUserMsg) return "Conversation vide";
    const content = firstUserMsg.content;
    if (typeof content === "string") return content.slice(0, 80);
    const textPart = (content as any[]).find((c: any) => c.type === "text");
    return textPart?.text?.slice(0, 80) || "Image envoyée";
  };

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60 shrink-0">
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-xl">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-sm font-bold text-primary flex-1">
          Historique des conversations
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onNewConversation}
          className="text-xs gap-1 text-primary rounded-xl"
        >
          <Plus className="h-3.5 w-3.5" />
          Nouveau
        </Button>
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Chargement...
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-6 text-center">
            <MessageCircle className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">Aucune conversation</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Vos conversations seront sauvegardées ici
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.messages, conv.id)}
                className={cn(
                  "w-full text-left p-3 rounded-xl transition-all group hover:bg-slate-50 dark:hover:bg-slate-900",
                  activeConversationId === conv.id &&
                    "bg-primary/5 border border-primary/10"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                      {getPreview(conv)}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {format(new Date(conv.updated_at), "d MMM yyyy, HH:mm", {
                        locale: fr,
                      })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={(e) => deleteConversation(conv.id, e)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[10px] text-muted-foreground/60">
                    {conv.messages.length} messages
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
