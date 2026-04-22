import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, Loader2, Sparkles, Wand2, X, Copy, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface AdminAssistantPanelProps {
    lessonId: string;
    currentContent: string;
    onUpdateContent: (newContent: string) => void;
    open: boolean;
    onClose: () => void;
}

export function AdminAssistantPanel({ lessonId, currentContent, onUpdateContent, open, onClose }: AdminAssistantPanelProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();

            // S'assurer que le contenu est envoyé correctement à l'IA même si le backend
            // n'a pas encore été mis à jour avec le mode "editorialMode" en l'injectant dans le prompt
            // Le système prompt côté serveur (editorialMode) gère déjà toutes les règles.
            // On envoie juste la demande brute de l'utilisateur.
            const apiMessages = [...messages, userMessage].map(m => ({ role: m.role, content: m.content }));

            const payload = {
                messages: apiMessages,
                editorialMode: true,
                editorialContext: {
                    currentContent: currentContent || "Leçon vide"
                },
                // Quelques données factices pour tromper le backend de prod s'il l'exige
                subject: "mathématiques",
                schoolLevel: "professeur"
            };

            const response = await fetch("https://lfothlxoixayjiytwwqa.supabase.co/functions/v1/lovable-chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.access_token || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmb3RobHhvaXhheWppeXR3d3FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MDQzNjUsImV4cCI6MjA4NzA4MDM2NX0.Z5uiVCL7jrcYIenOhGyFfXbGULHP30j_E9W390NYS3U"} `
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Erreur lors de la génération avec l'IA");
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = "";
            let buffer = "";

            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || "";

                    for (const line of lines) {
                        const trimmedLine = line.trim();
                        if (trimmedLine.startsWith('data: ')) {
                            const data = trimmedLine.slice(6).trim();
                            if (data === '[DONE]') continue;
                            try {
                                const parsed = JSON.parse(data);
                                const content = parsed.choices?.[0]?.delta?.content || "";
                                assistantMessage += content;

                                setMessages(prev => {
                                    const newMessages = [...prev];
                                    const lastIndex = newMessages.length - 1;
                                    newMessages[lastIndex] = { ...newMessages[lastIndex], content: assistantMessage };
                                    return newMessages;
                                });
                            } catch (e) {
                                // ignore JSON parse errors for incomplete chunks
                            }
                        }
                    }
                }
            }
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Erreur IA",
                description: error.message || "Une erreur est survenue",
                variant: "destructive"
            });
            setMessages(prev => [...prev, { role: 'assistant', content: "Désolé, une erreur technique est survenue. Veuillez réessayer." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = (content: string, index: number) => {
        navigator.clipboard.writeText(content);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
        toast({
            title: "Contenu copié",
            description: "Le texte a été copié dans le presse-papiers."
        });
    };

    const handleApply = (content: string) => {
        let finalContent = content;

        // Tenter de trouver s'il s'agit d'une mise à jour partielle via <update>
        const match = content.match(/<update>[\s\S]*?<original>([\s\S]*?)<\/original>[\s\S]*?<new>([\s\S]*?)<\/new>[\s\S]*?<\/update>/i);
        if (match) {
            const originalText = match[1].trim();
            const newText = match[2].trim();

            if (!currentContent.includes(originalText)) {
                toast({
                    title: "⚠️ Remplacement automatique échoué",
                    description: "Le texte d'origine n'a pas été trouvé exactement. Le texte modifié a été copié, vous pouvez l'insérer manuellement.",
                    variant: "destructive",
                    duration: 5000
                });
                navigator.clipboard.writeText(newText);
                return;
            }

            finalContent = currentContent.replace(originalText, newText);
            toast({
                title: "✅ Partie pertinente mise à jour",
                description: "La partie spécifique a été correctement modifiée dans l'éditeur.",
                duration: 4000
            });
        } else {
            // Remplacement complet, on enlève d'éventuelles balises ```markdown
            const mdMatch = content.match(/```(?:markdown)?\s*\n([\s\S]*?)```/im);
            if (mdMatch && mdMatch[1]) {
                finalContent = mdMatch[1].trim();
            } else {
                finalContent = content.trim();
            }
            toast({
                title: "✅ Nouvelle version appliquée",
                description: "L'ensemble de la leçon a été remplacée.",
                duration: 4000
            });
        }

        onUpdateContent(finalContent);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-background border-l shadow-2xl z-50 flex flex-col transition-transform duration-300">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                <div className="flex items-center gap-2 text-primary font-semibold">
                    <Wand2 className="w-5 h-5" />
                    <span>Assistant Éditoriel IA</span>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                    <X className="w-4 h-4" />
                </Button>
            </div>

            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                {messages.length === 0 ? (
                    <div className="flex flex-col gap-4">
                        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded border border-border/50">
                            <p className="font-semibold mb-2">📋 Contenu actuel de la leçon:</p>
                            <div className="max-h-[200px] overflow-y-auto text-xs whitespace-pre-wrap font-mono bg-background p-2 rounded border border-border/30">
                                {currentContent ? currentContent.substring(0, 500) + (currentContent.length > 500 ? '...' : '') : 'Aucun contenu (leçon vide)'}
                            </div>
                        </div>
                        <div className="text-center text-muted-foreground mt-8">
                            <Sparkles className="w-12 h-12 mb-4 opacity-20 mx-auto" />
                            <p className="text-sm font-medium mb-3">Demandez à l'IA de modifier votre leçon</p>
                            <p className="text-xs space-y-2">
                                <span className="block">Exemples:</span>
                                <span className="block">• "Enrichis la définition 1.1 avec plus d'explications"</span>
                                <span className="block">• "Ajoute un exemple détaillé après la propriété 2.1"</span>
                                <span className="block">• "Crée une section de remarques importantes"</span>
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 pb-4">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} `}>
                                <div className={`max - w - [85 %] rounded - lg p - 3 ${msg.role === 'user'
                                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                                    : 'bg-muted rounded-tl-none border'
                                    } `}>
                                    {msg.role === 'user' ? (
                                        <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                                    ) : (() => {
                                        let isPartial = false;
                                        let originalText = '';
                                        let newText = '';
                                        let displayContent = msg.content;
                                        const updateRegex = /<update>[\s\S]*?<original>([\s\S]*?)<\/original>[\s\S]*?<new>([\s\S]*?)<\/new>[\s\S]*?<\/update>/i;
                                        const match = msg.content.match(updateRegex);

                                        if (match) {
                                            isPartial = true;
                                            originalText = match[1].trim();
                                            newText = match[2].trim();
                                        } else {
                                            const mdMatch = msg.content.match(/```(?:markdown)?\s*\n([\s\S]*?)```/i);
                                            if (mdMatch && mdMatch[1]) {
                                                displayContent = mdMatch[1].trim();
                                            }
                                        }

                                        return (
                                            <div className="text-sm overflow-hidden max-w-none">
                                                {isPartial ? (
                                                    <div className="space-y-3">
                                                        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-2">
                                                            <div className="text-[10px] font-bold uppercase tracking-wide text-destructive/80 mb-1">
                                                                ➖ Partie actuelle (à remplacer)
                                                            </div>
                                                            <div className="prose prose-sm dark:prose-invert max-w-none text-xs opacity-80">
                                                                <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>
                                                                    {originalText}
                                                                </ReactMarkdown>
                                                            </div>
                                                        </div>
                                                        <div className="rounded-md border border-primary/40 bg-primary/5 p-2">
                                                            <div className="text-[10px] font-bold uppercase tracking-wide text-primary mb-1">
                                                                ➕ Nouvelle version proposée
                                                            </div>
                                                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                                                <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>
                                                                    {newText}
                                                                </ReactMarkdown>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                                        <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>
                                                            {displayContent}
                                                        </ReactMarkdown>
                                                    </div>
                                                )}
                                                {msg.content && !isLoading && (
                                                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            className="h-8 text-xs flex-1"
                                                            onClick={() => handleApply(msg.content)}
                                                        >
                                                            ✅ {isPartial ? "Accepter cette modification" : "Appliquer toute la version"}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 text-xs"
                                                            onClick={() => {
                                                                toast({
                                                                    title: "Modification refusée",
                                                                    description: "La proposition a été ignorée."
                                                                });
                                                            }}
                                                        >
                                                            ✖ Refuser
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground"
                                                            onClick={() => handleCopy(msg.content, idx)}
                                                            title="Copier la proposition brute"
                                                        >
                                                            {copiedIndex === idx ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-muted rounded-lg rounded-tl-none p-3 border">
                                    <div className="flex gap-1 items-center h-5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce"></span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </ScrollArea>

            <div className="p-3 border-t bg-background">
                <div className="relative flex items-center">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Ex: Enrichis la section théorique avec un exemple..."
                        className="min-h-[50px] max-h-[150px] resize-none pr-12 focus-visible:ring-1"
                        disabled={isLoading}
                    />
                    <Button
                        size="icon"
                        className="absolute right-2 bottom-2 h-7 w-7"
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                    >
                        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}