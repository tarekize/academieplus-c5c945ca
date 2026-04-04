import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

type Message = {
  role: "user" | "assistant";
  content: string | any[];
};

export function useChatHistory(chapterId?: string | null) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveConversation = useCallback(
    async (messages: Message[]) => {
      if (messages.length === 0) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        // Generate title from first user message
        const firstUserMsg = messages.find((m) => m.role === "user");
        let title = "Nouvelle conversation";
        if (firstUserMsg) {
          const content = firstUserMsg.content;
          if (typeof content === "string") {
            title = content.slice(0, 100);
          } else if (Array.isArray(content)) {
            const textPart = content.find((c: any) => c.type === "text");
            title = textPart?.text?.slice(0, 100) || "Image envoyÃ©e";
          }
        }

        // Strip base64 data from messages before saving to reduce storage
        const cleanMessages = messages.map((m) => {
          if (typeof m.content === "string") return m;
          if (Array.isArray(m.content)) {
            return {
              ...m,
              content: m.content.map((c: any) => {
                if (c.type === "image_url" && c.image_url?.url?.startsWith("data:")) {
                  return { type: "image_url", image_url: { url: "[image]" } };
                }
                return c;
              }),
            };
          }
          return m;
        });

        if (conversationId) {
          // Update existing
          await supabase
            .from("chat_conversations")
            .update({
              messages: cleanMessages as any,
              title,
              updated_at: new Date().toISOString(),
            })
            .eq("id", conversationId);
        } else {
          // Create new
          const { data, error } = await supabase
            .from("chat_conversations")
            .insert({
              user_id: session.user.id,
              chapter_id: chapterId || null,
              title,
              messages: cleanMessages as any,
            })
            .select("id")
            .single();

          if (!error && data) {
            setConversationId(data.id);
          }
        }
      } catch (err) {
        console.error("Error saving conversation:", err);
      }
    },
    [conversationId, chapterId]
  );

  // Debounced save
  const debouncedSave = useCallback(
    (messages: Message[]) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveConversation(messages);
      }, 2000);
    },
    [saveConversation]
  );

  const loadConversation = useCallback(
    (messages: Message[], id: string) => {
      setConversationId(id);
    },
    []
  );

  const newConversation = useCallback(() => {
    setConversationId(null);
  }, []);

  return {
    conversationId,
    setConversationId,
    debouncedSave,
    loadConversation,
    newConversation,
  };
}
