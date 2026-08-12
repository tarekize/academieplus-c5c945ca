import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

type Message = {
  role: "user" | "assistant";
  content: string | any[];
};

// Persiste l'historique d'une conversation avec le chatbot IA dans
// chat_conversations, pour que l'élève retrouve ses échanges précédents.
// user_id vient toujours de la session serveur (auth.getSession()) à
// l'insertion — jamais d'un paramètre — donc pas d'IDOR possible en écriture ;
// les mises à jour ciblent l'id de conversation déjà créé pour cette session.
export function useChatHistory(chapterId?: string | null) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sauvegarde (création ou mise à jour) la conversation : génère un titre
  // depuis le premier message, retire les images base64 (poids) avant stockage.
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
            title = textPart?.text?.slice(0, 100) || "Image envoyée";
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
          // Update existing. Filtre défensif sur user_id : conversationId peut
          // provenir de loadConversation() (liste affichée par ChatBot.tsx) —
          // sans ce filtre, un id de conversation d'un AUTRE utilisateur
          // écraserait ses messages si la policy RLS d'update s'avérait trop
          // permissive.
          await supabase
            .from("chat_conversations")
            .update({
              messages: cleanMessages as any,
              title,
              updated_at: new Date().toISOString(),
            })
            .eq("id", conversationId)
            .eq("user_id", session.user.id);
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

  // Sauvegarde différée de 2s (anti-spam) : appelée à chaque nouveau message
  // du chat, ne déclenche réellement l'écriture en base qu'une fois le
  // flux de réponse IA stabilisé.
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

  // Reprend une conversation existante depuis l'historique (le tableau
  // `messages` est géré par l'appelant — ChatBot.tsx — cette fonction ne fait
  // que retenir l'id pour que les prochaines sauvegardes ciblent la bonne ligne).
  const loadConversation = useCallback(
    (messages: Message[], id: string) => {
      setConversationId(id);
    },
    []
  );

  /** Détache l'état courant de toute conversation existante : la prochaine sauvegarde créera une nouvelle ligne. */
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
