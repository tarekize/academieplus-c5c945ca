import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, X, Mic, MicOff, Lock, Crown, MessageCircle, Image, Bot, Maximize2, Minimize2, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "./ChatMessage";
import { supabase } from "@/integrations/supabase/client";
import { useChatLimits } from "@/hooks/useChatLimits";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import ChatHistory from "./ChatHistory";
import { useChatHistory } from "@/hooks/useChatHistory";
import { shouldHideReform, incrementReformShown, markReformClicked, hasReformMarker } from "@/lib/reformulationPrefs";

type MessageContent = {
  type: "text" | "image_url";
  text?: string;
  image_url?: { url: string };
};

type Message = {
  role: "user" | "assistant";
  content: string | MessageContent[];
};

type ChatBotProps = {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  subject?: string;
  schoolLevel?: string | null;
  chapterId?: string | null;
  chapterContext?: {
    title: string;
    lessonsContent: string;
  } | null;
  allChapters?: { id: string; title: string; lessons: { id: string; title: string }[] }[] | null;
  onNavigate?: (path: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
};

export default function ChatBot({ messages, setMessages, subject = "mathématiques", schoolLevel = null, chapterId = null, chapterContext = null, allChapters = null, onNavigate, isExpanded = false, onToggleExpand }: ChatBotProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; base64: string; type: string }>>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceLang, setVoiceLang] = useState<'fr-FR' | 'ar-SA'>('fr-FR');
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const { conversationId, debouncedSave, loadConversation, newConversation } = useChatHistory(chapterId);

  const {
    hasSubscription,
    canSendMessage,
    canSendImage,
    messagesRemaining,
    imagesRemaining,
    recordMessage,
    recordImage,
    isLoading: limitsLoading,
    FREE_MESSAGE_LIMIT,
    FREE_IMAGE_LIMIT,
  } = useChatLimits();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-save conversation to database
  useEffect(() => {
    if (messages.length > 0) {
      debouncedSave(messages);
    }
  }, [messages, debouncedSave]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check image limit for non-subscribers
    if (!canSendImage) {
      toast({
        title: "Limite d'images atteinte",
        description: `Vous avez utilisé vos ${FREE_IMAGE_LIMIT} images gratuites du jour. Abonnez-vous pour un accès illimité.`,
        variant: "destructive",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const file = files[0];
    const maxSize = 20 * 1024 * 1024;

    if (file.size > maxSize) {
      toast({
        title: "Erreur",
        description: "Le fichier est trop volumineux (max 20MB)",
        variant: "destructive",
      });
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Erreur",
        description: "Type de fichier non supporté. Utilisez des images ou PDF.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setUploadedFiles((prev) => [...prev, { name: file.name, base64, type: file.type }]);
      toast({
        title: "Fichier ajouté",
        description: `${file.name} est prêt à être envoyé`,
      });
    };
    reader.onerror = () => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la lecture du fichier",
        variant: "destructive",
      });
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async (content: string) => {
    if ((!content.trim() && uploadedFiles.length === 0) || isLoading) return;

    // Check message limit
    if (!canSendMessage) {
      toast({
        title: "Limite de messages atteinte",
        description: `Vous avez utilisé vos ${FREE_MESSAGE_LIMIT} messages gratuits du jour. Abonnez-vous pour un accès illimité.`,
        variant: "destructive",
      });
      return;
    }

    // Check image limit if files are attached
    if (uploadedFiles.length > 0 && !canSendImage) {
      toast({
        title: "Limite d'images atteinte",
        description: `Vous avez utilisé vos ${FREE_IMAGE_LIMIT} images gratuites du jour. Abonnez-vous pour un accès illimité.`,
        variant: "destructive",
      });
      return;
    }

    let messageContent: string | MessageContent[];

    if (uploadedFiles.length > 0) {
      messageContent = [
        { type: "text", text: content.trim() || "Analysez ce fichier et répondez aux questions qu'il contient." },
        ...uploadedFiles.map((file) => ({
          type: "image_url" as const,
          image_url: { url: file.base64 },
        })),
      ];
    } else {
      messageContent = content.trim();
    }

    // Record usage BEFORE sending
    recordMessage();
    if (uploadedFiles.length > 0) {
      recordImage(uploadedFiles.length);
    }

    const userMessage: Message = { role: "user", content: messageContent };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue("");
    setUploadedFiles([]);
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch("https://lfothlxoixayjiytwwqa.supabase.co/functions/v1/lovable-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmb3RobHhvaXhheWppeXR3d3FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MDQzNjUsImV4cCI6MjA4NzA4MDM2NX0.Z5uiVCL7jrcYIenOhGyFfXbGULHP30j_E9W390NYS3U"}`
        },
        body: JSON.stringify({
          messages: updatedMessages,
          subject: subject,
          schoolLevel: schoolLevel,
          chapterContext: chapterContext,
          allChapters: allChapters,
          hideReformulation: shouldHideReform(chapterId),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Erreur inconnue" }));
        throw new Error(errorData.error || "Failed to get response");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let assistantMessage = "";
      let buffer = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          if (buffer.trim()) {
            const lines = buffer.split("\n");
            for (const line of lines) {
              await processLine(line, assistantMessage, (newContent) => {
                assistantMessage = newContent;
              });
            }
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          await processLine(line, assistantMessage, (newContent) => {
            assistantMessage = newContent;
          });
        }
      }

      if (buffer.includes("[DONE]")) {
        console.log("Stream completed");
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Erreur",
        description:
          error.message === "Insufficient credits"
            ? "Crédits insuffisants pour utiliser l'IA"
            : error.message === "Rate limit exceeded"
              ? "Limite de taux dépassée, veuillez réessayer plus tard"
              : "Impossible d'envoyer le message. Veuillez réessayer.",
        variant: "destructive",
      });
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const processLine = async (line: string, currentMessage: string, onUpdate: (newMessage: string) => void) => {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine === ":" || trimmedLine.startsWith(":")) {
      return;
    }

    if (trimmedLine === "data: [DONE]") {
      return;
    }

    if (trimmedLine.startsWith("data: ")) {
      const jsonStr = trimmedLine.slice(6).trim();

      if (!jsonStr || jsonStr === "[DONE]") {
        return;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;

        if (content) {
          const newMessage = currentMessage + content;
          onUpdate(newMessage);

          setMessages((prev) => {
            const newMessages = [...prev];
            if (newMessages.length > 0) {
              newMessages[newMessages.length - 1] = {
                role: "assistant",
                content: newMessage,
              };
            }
            return newMessages;
          });
        }
      } catch (error) {
        console.warn("Failed to parse SSE data:", jsonStr, error);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const startRecording = () => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        toast({
          title: "Non supporté",
          description: "Votre navigateur ne supporte pas la reconnaissance vocale",
          variant: "destructive",
        });
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = voiceLang;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
        setInputValue("");
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputValue(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Erreur",
          description: "Erreur lors de la reconnaissance vocale",
          variant: "destructive",
        });
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;

    } catch (error) {
      console.error('Error starting speech recognition:', error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer la reconnaissance vocale",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const showLimitBanner = !hasSubscription && !limitsLoading;
  const isBlocked = !canSendMessage && !hasSubscription;

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-slate-950 border-[3px] border-[#0A2551] rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(10,37,81,0.4)] backdrop-blur-sm relative z-50">
      {/* History Panel */}
      {showHistory && (
        <ChatHistory
          chapterId={chapterId}
          activeConversationId={conversationId}
          onSelectConversation={(msgs, id) => {
            setMessages(msgs as Message[]);
            loadConversation(msgs as Message[], id);
            setShowHistory(false);
          }}
          onNewConversation={() => {
            setMessages([]);
            newConversation();
            setShowHistory(false);
          }}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* Main Chat UI - hidden when history is shown */}
      {!showHistory && (
        <>
          {/* Header */}
          <div className="chatbot-drag-handle border-b border-[#0A2551]/10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-5 py-4 shrink-0 shadow-sm cursor-grab active:cursor-grabbing">
            <div className="flex items-center justify-between">
              <div className="flex flex-col min-w-0 flex-1">
                <h2 className="text-xl font-bold text-[#0A2551] dark:text-blue-400 truncate flex items-center gap-2">
                  <Bot className="h-6 w-6 text-[#0A2551] dark:text-blue-400" />
                  Professeur de {subject}
                </h2>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1 truncate">Assistant IA Interactif</p>
              </div>
              <div className="flex items-center gap-1">
                {/* History button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowHistory(true)}
                  className="h-9 w-9 rounded-xl text-[#0A2551]/60 hover:text-[#0A2551] hover:bg-[#0A2551]/5"
                  title="Historique des conversations"
                >
                  <History className="h-5 w-5" />
                </Button>
                {/* Expand button */}
                {onToggleExpand && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleExpand}
                    className="h-9 w-9 rounded-xl text-[#0A2551]/60 hover:text-[#0A2551] hover:bg-[#0A2551]/5"
                    title={isExpanded ? "Réduire" : "Agrandir"}
                  >
                    {isExpanded ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                  </Button>
                )}
                {hasSubscription && (
                  <div className="flex items-center gap-1.5 bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ml-1">
                    <Crown className="h-3.5 w-3.5" />
                    <span>Premium</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Usage banner for free users */}
          {showLimitBanner && (
            <div className="border-b bg-muted/30 px-4 py-2.5">
              <div className={`flex items-center justify-between gap-3 mx-auto ${isExpanded ? 'max-w-4xl' : 'max-w-3xl'}`}>
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs">
                    <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Messages:</span>
                    <span className={`font-semibold ${messagesRemaining === 0 ? 'text-destructive' : 'text-foreground'}`}>
                      {messagesRemaining}/{FREE_MESSAGE_LIMIT}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Image className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Images:</span>
                    <span className={`font-semibold ${imagesRemaining === 0 ? 'text-destructive' : 'text-foreground'}`}>
                      {imagesRemaining}/{FREE_IMAGE_LIMIT}
                    </span>
                  </div>
                </div>
              </div>
              {/* Progress bars */}
              <div className={`flex gap-4 mt-1.5 mx-auto ${isExpanded ? 'max-w-4xl' : 'max-w-3xl'}`}>
                <Progress
                  value={(messagesRemaining / FREE_MESSAGE_LIMIT) * 100}
                  className="h-1 flex-1"
                />
                <Progress
                  value={(imagesRemaining / FREE_IMAGE_LIMIT) * 100}
                  className="h-1 w-20"
                />
              </div>
            </div>
          )}

          <ScrollArea className="flex-1 p-5">
            <div className={`space-y-6 mx-auto ${isExpanded ? 'max-w-4xl' : 'max-w-xl'}`}>
              {messages.length === 0 ? (
                <div className="text-center py-14 flex flex-col items-center justify-center">
                  <div className="flex items-center justify-center w-20 h-20 rounded-[1.25rem] bg-gradient-to-br from-[#0A2551] to-blue-600 text-white shadow-[0_10px_25px_rgba(10,37,81,0.25)] mb-6 ring-4 ring-white dark:ring-slate-900 border border-[#0A2551]/20">
                    <Bot strokeWidth={1.5} className="w-10 h-10 drop-shadow-md" />
                  </div>
                  <h3 className="text-[1.35rem] font-bold text-[#0A2551] dark:text-blue-300 leading-tight mb-3">
                    Bienvenue dans votre classe virtuelle&nbsp;!
                  </h3>
                  <p className="text-[0.95rem] text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-[320px]">
                    Je suis votre professeur personnel de mathématiques, encadré par votre programme. Posez votre question{chapterContext?.title ? <> sur le chapitre <span className="font-semibold text-[#0A2551] dark:text-blue-300">«&nbsp;{chapterContext.title}&nbsp;»</span></> : ""} en français ou en arabe.
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-2 max-w-[320px] text-[0.7rem] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5">📖 <span>Définition</span></div>
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5">💡 <span>Exemple</span></div>
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5">🔄 <span>Reformulation</span></div>
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5">✏️ <span>Exercice</span></div>
                  </div>
                  {!hasSubscription && !limitsLoading && (
                    <div className="mt-8 flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 px-5 py-2.5 rounded-full text-xs font-semibold shadow-sm">
                      <Crown className="h-4 w-4 text-amber-500" />
                      <span>Version Gratuite : {FREE_MESSAGE_LIMIT} msgs &amp; {FREE_IMAGE_LIMIT} img / jour</span>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <ChatMessage
                      key={index}
                      role={message.role}
                      content={
                        typeof message.content === "string"
                          ? message.content
                          : message.content.find((c) => c.type === "text")?.text || ""
                      }
                      isStreaming={isLoading && index === messages.length - 1 && message.role === "assistant"}
                      onNavigate={onNavigate}
                    />
                  ))}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Blocked overlay when limits reached */}
          {isBlocked && (
            <div className="border-t bg-gradient-to-r from-destructive/5 to-amber-500/5 p-4">
              <div className={`mx-auto text-center space-y-3 ${isExpanded ? 'max-w-4xl' : 'max-w-3xl'}`}>
                <div className="flex items-center justify-center gap-2 text-destructive">
                  <Lock className="h-5 w-5" />
                  <span className="font-semibold">Limite quotidienne atteinte</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Vous avez utilisé tous vos messages gratuits pour aujourd'hui. Abonnez-vous pour profiter d'un accès illimité au chatbot et aux images.
                </p>
                <Button
                  className="gap-2"
                  onClick={() => navigate('/abonnements')}
                >
                  <Crown className="h-4 w-4" />
                  Débloquer l'accès illimité
                </Button>
              </div>
            </div>
          )}

          {/* Input area - hidden when blocked */}
          {!isBlocked && (
            <div className="border-t border-[#0A2551]/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-4 shrink-0 shadow-[0_-10px_40px_-20px_rgba(10,37,81,0.15)] relative z-10 rounded-b-[1.05rem]">
              <div className={`mx-auto space-y-3 ${isExpanded ? 'max-w-4xl' : 'max-w-xl'}`}>
                {uploadedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 px-1">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 bg-[#0A2551]/5 border border-[#0A2551]/10 px-3 py-1.5 rounded-[0.85rem] text-[0.8rem] font-medium text-[#0A2551] dark:text-blue-200">
                        <span className="truncate max-w-[160px]">{file.name}</span>
                        <button
                          onClick={() => removeFile(index)}
                          className="hover:text-red-500 transition-colors p-0.5 rounded-full hover:bg-white"
                          disabled={isLoading}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="flex gap-2.5 items-end relative">
                  <div className="flex flex-1 flex-col justify-end bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl transition-all focus-within:ring-2 focus-within:ring-[#0A2551]/20 focus-within:border-[#0A2551]/40 shadow-sm relative pt-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isLoading}
                    />

                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={`Posez votre question...`}
                      disabled={isLoading || isRecording}
                      className={`flex-1 border-0 ring-0 focus-visible:ring-0 bg-transparent min-h-[48px] px-4 font-medium text-[0.95rem] shadow-none placeholder:text-slate-400 ${isRecording ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}`}
                    />

                    <div className="flex items-center justify-between px-2 pb-2 mt-0.5">
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isLoading || isRecording || (!canSendImage && !hasSubscription)}
                          title={!canSendImage && !hasSubscription ? "Limite d'images atteinte" : "Joindre un fichier"}
                          className="w-10 h-10 rounded-xl text-slate-500 hover:text-[#0A2551] hover:bg-slate-200/50"
                        >
                          <Paperclip strokeWidth={1.5} className="h-5 w-5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setVoiceLang(voiceLang === 'fr-FR' ? 'ar-SA' : 'fr-FR')}
                          disabled={isLoading || isRecording}
                          className="w-10 h-10 rounded-xl text-slate-500 hover:text-[#0A2551] hover:bg-slate-200/50 text-xs font-bold font-mono tracking-tight"
                          title={voiceLang === 'fr-FR' ? 'Français' : 'العربية'}
                        >
                          {voiceLang === 'fr-FR' ? 'FR' : 'AR'}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={isRecording ? stopRecording : startRecording}
                          disabled={isLoading}
                          className={`w-10 h-10 rounded-xl relative hover:bg-slate-200/50 ${isRecording ? 'text-red-500 hover:text-red-600 bg-red-50' : 'text-slate-500 hover:text-[#0A2551]'}`}
                        >
                          {isRecording ? <MicOff strokeWidth={1.5} className="h-5 w-5" /> : <Mic strokeWidth={1.5} className="h-5 w-5" />}

                          {isRecording && (
                            <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-red-50/90 dark:bg-red-900/90 backdrop-blur-sm border border-red-200 dark:border-red-800 px-4 py-2.5 rounded-full shadow-lg">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className="w-1 bg-red-500 rounded-full animate-pulse"
                                  style={{
                                    height: `${10 + Math.random() * 12}px`,
                                    animationDelay: `${i * 0.15}s`,
                                    animationDuration: `${0.4 + Math.random() * 0.4}s`
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || isRecording || (!inputValue.trim() && uploadedFiles.length === 0)}
                    className="w-12 h-12 flex-shrink-0 rounded-[0.9rem] bg-[#0A2551] hover:bg-[#0A2551]/90 text-white shadow-[0_5px_15px_rgba(10,37,81,0.25)] flex items-center justify-center p-0 transition-transform active:scale-95 disabled:hover:scale-100 disabled:opacity-50"
                  >
                    <Send strokeWidth={2} className="h-5 w-5 -ml-0.5" />
                  </Button>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
