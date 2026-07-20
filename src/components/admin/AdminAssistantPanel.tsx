import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
    Send, Loader2, Sparkles, Wand2, X, Copy, CheckCheck,
    ArrowLeft, Wand, PencilLine, MessageCircle, ListTree,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import LessonMarkdown from '@/components/course/LessonMarkdown';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface AdminAssistantPanelProps {
    lessonId: string;
    currentContent: string;
    lessonTitle?: string;
    schoolLevel?: string;
    onUpdateContent: (newContent: string) => void;
    open: boolean;
    onClose: () => void;
}

type Step = 'entry' | 'targeted-choice' | 'guided-structure' | 'guided-concepts' | 'guided-style' | 'chat' | 'preview';

type StructureChoice = 'standard' | 'practice' | 'custom';
type ExampleStyle = 'academic' | 'visual' | 'progressive';

const STRUCTURE_OPTIONS: { id: StructureChoice; label: string; description: string }[] = [
    { id: 'standard', label: 'Standard', description: 'Rappels → Théorie & Théorèmes → Applications & Méthodes → Exercices' },
    { id: 'practice', label: "Pratique d'abord", description: "Exemple d'introduction → Formalisation théorique → Exercices" },
    { id: 'custom', label: 'Personnalisée', description: 'Je définis mes sections' },
];

const STYLE_OPTIONS: { id: ExampleStyle; label: string; description: string }[] = [
    { id: 'academic', label: '🎓 Académiques et classiques', description: 'axés sur les examens' },
    { id: 'visual', label: '💡 Visuels ou concrets', description: 'applications concrètes' },
    { id: 'progressive', label: '🚀 Progressifs', description: 'de très facile à difficile' },
];

// Même projet Supabase que src/integrations/supabase/client.ts (fichier généré,
// on évite de le modifier directement). Utilisé uniquement pour le fetch SSE
// manuel ci-dessous (supabase.functions.invoke ne supporte pas le streaming).
const LOVABLE_CHAT_URL = 'https://lfothlxoixayjiytwwqa.supabase.co/functions/v1/lovable-chat';

const CONCEPT_LABELS: Record<string, string> = {
    definition: 'Définition et notations',
    properties: 'Propriétés et théorèmes fondamentaux',
    methodology: 'Méthodologie (changement de variable, etc.)',
    exercises: "Exercices d'application progressifs",
};

function extractDisplayContent(content: string): { isPartial: boolean; originalText: string; newText: string; displayContent: string } {
    const updateRegex = /<update>[\s\S]*?<original>([\s\S]*?)<\/original>[\s\S]*?<new>([\s\S]*?)<\/new>[\s\S]*?<\/update>/i;
    const match = content.match(updateRegex);
    if (match) {
        return { isPartial: true, originalText: match[1].trim(), newText: match[2].trim(), displayContent: content };
    }
    const mdMatch = content.match(/```(?:markdown)?\s*\n([\s\S]*?)```/i);
    return { isPartial: false, originalText: '', newText: '', displayContent: mdMatch?.[1] ? mdMatch[1].trim() : content };
}

/** Résout <update><original>...</original><new>...</new></update> contre `referenceContent`,
 * ou extrait une génération complète (retire un éventuel bloc ```markdown). */
function resolveAiContent(aiContent: string, referenceContent: string): { finalContent: string; isPartial: boolean; replaced: boolean } {
    const safeReference = referenceContent || '';
    const match = aiContent.match(/<update>[\s\S]*?<original>([\s\S]*?)<\/original>[\s\S]*?<new>([\s\S]*?)<\/new>[\s\S]*?<\/update>/i);

    if (!match) {
        const mdMatch = aiContent.match(/```(?:markdown)?\s*\n([\s\S]*?)```/im);
        const finalContent = mdMatch?.[1] ? mdMatch[1].trim() : aiContent.trim();
        return { finalContent, isPartial: false, replaced: true };
    }

    const originalText = match[1].trim();
    let newText = match[2].trim();
    const normalize = (s: string) => s.replace(/\s+/g, ' ').trim();

    // Anti-duplication : si <new> recopie le bloc original au début, on le retire.
    if (newText.startsWith(originalText) && newText.length > originalText.length) {
        newText = newText.slice(originalText.length).trimStart();
    } else if (normalize(newText).startsWith(normalize(originalText)) && normalize(newText).length > normalize(originalText).length) {
        const origNorm = normalize(originalText);
        let normPos = 0;
        let cutAt = 0;
        let inSpace = false;
        for (let i = 0; i < newText.length; i++) {
            const ch = newText[i];
            const isWs = /\s/.test(ch);
            if (isWs) {
                if (!inSpace && normPos > 0) { normPos++; inSpace = true; }
            } else {
                normPos++;
                inSpace = false;
            }
            if (normPos >= origNorm.length) { cutAt = i + 1; break; }
        }
        if (cutAt > 0 && normalize(newText.slice(0, cutAt)) === origNorm) {
            newText = newText.slice(cutAt).trimStart();
        }
    }

    if (safeReference.includes(originalText)) {
        return { finalContent: safeReference.replace(originalText, newText), isPartial: true, replaced: true };
    }

    const origNorm = normalize(originalText);
    const curNorm = normalize(safeReference);
    const idx = curNorm.indexOf(origNorm);
    if (idx !== -1) {
        let normPos = 0;
        let startReal = -1;
        let endReal = -1;
        let inSpace = false;
        for (let i = 0; i < safeReference.length; i++) {
            const ch = safeReference[i];
            const isWs = /\s/.test(ch);
            if (isWs) {
                if (!inSpace && normPos > 0) { normPos++; inSpace = true; }
            } else {
                normPos++;
                inSpace = false;
            }
            if (startReal === -1 && normPos >= idx) startReal = i;
            if (startReal !== -1 && normPos >= idx + origNorm.length) { endReal = i + 1; break; }
        }
        if (startReal !== -1 && endReal !== -1) {
            const finalContent = safeReference.slice(0, startReal) + newText + safeReference.slice(endReal);
            return { finalContent, isPartial: true, replaced: true };
        }
    }

    return { finalContent: newText, isPartial: true, replaced: false };
}

export function AdminAssistantPanel({ lessonId, currentContent, lessonTitle, schoolLevel, onUpdateContent, open, onClose }: AdminAssistantPanelProps) {
    const [step, setStep] = useState<Step>('entry');
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { toast } = useToast();

    // Choix du flux guidé (leçon vide)
    const [structureChoice, setStructureChoice] = useState<StructureChoice | null>(null);
    const [customSections, setCustomSections] = useState('');
    const [concepts, setConcepts] = useState<Record<string, boolean>>({ definition: true, properties: true, methodology: true, exercises: true });

    // Aperçu post-génération (flux guidé ou "génération complète" en chat libre)
    const [previewContent, setPreviewContent] = useState('');
    const [previewMessages, setPreviewMessages] = useState<Message[]>([]);
    const [previewInput, setPreviewInput] = useState('');
    const [previewLoading, setPreviewLoading] = useState(false);
    const previewScrollRef = useRef<HTMLDivElement>(null);

    const isEmpty = !currentContent || !currentContent.trim();
    const titleLabel = lessonTitle || 'cette leçon';
    const levelLabel = schoolLevel || 'ce niveau';

    useEffect(() => {
        if (open) {
            setStep('entry');
            setMessages([]);
            setPreviewContent('');
            setPreviewMessages([]);
            setStructureChoice(null);
            setCustomSections('');
            setConcepts({ definition: true, properties: true, methodology: true, exercises: true });
        }
    }, [open]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, isLoading, step]);

    useEffect(() => {
        if (previewScrollRef.current) previewScrollRef.current.scrollTop = previewScrollRef.current.scrollHeight;
    }, [previewMessages, previewLoading]);

    // --- Appel générique (streaming SSE) au backend IA ---
    const streamAi = async (
        apiMessages: { role: string; content: string }[],
        referenceContent: string,
        wizard: Record<string, unknown> | null,
        onToken: (full: string) => void,
    ): Promise<string> => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
            throw new Error('Session expirée, merci de vous reconnecter.');
        }

        const payload = {
            messages: apiMessages,
            editorialMode: true,
            editorialContext: {
                currentContent: referenceContent || 'Leçon vide',
                lessonTitle: lessonTitle || '',
                schoolLevel: schoolLevel || '',
                wizard,
            },
            subject: 'mathématiques',
            schoolLevel: 'professeur',
        };

        const response = await fetch(LOVABLE_CHAT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Erreur lors de la génération avec l'IA");

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = '';
        let buffer = '';

        if (reader) {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed.startsWith('data: ')) {
                        const data = trimmed.slice(6).trim();
                        if (data === '[DONE]') continue;
                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices?.[0]?.delta?.content || '';
                            assistantMessage += content;
                            onToken(assistantMessage);
                        } catch { /* chunk JSON incomplet, ignoré */ }
                    }
                }
            }
        }
        return assistantMessage;
    };

    // --- Chat libre (prompt libre / enrichir / élément ciblé / discuter) ---
    const handleSend = async (overrideText?: string) => {
        const text = (overrideText ?? input).trim();
        if (!text || isLoading) return;

        const userMessage: Message = { role: 'user', content: text };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        try {
            const apiMessages = [...messages, userMessage].map(m => ({ role: m.role, content: m.content }));
            await streamAi(apiMessages, currentContent, null, (full) => {
                setMessages(prev => {
                    const next = [...prev];
                    next[next.length - 1] = { ...next[next.length - 1], content: full };
                    return next;
                });
            });
        } catch (error: any) {
            console.error(error);
            toast({ title: 'Erreur IA', description: error.message || 'Une erreur est survenue', variant: 'destructive' });
            setMessages(prev => {
                const next = [...prev];
                next[next.length - 1] = { role: 'assistant', content: 'Désolé, une erreur technique est survenue. Veuillez réessayer.' };
                return next;
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = (content: string, index: number) => {
        navigator.clipboard.writeText(content);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
        toast({ title: 'Contenu copié', description: 'Le texte a été copié dans le presse-papiers.' });
    };

    const handleApply = (content: string) => {
        const { finalContent, isPartial, replaced } = resolveAiContent(content, currentContent);
        if (isPartial && !replaced) {
            toast({
                title: '⚠️ Remplacement automatique échoué',
                description: "Le texte d'origine n'a pas été retrouvé. La nouvelle version a été copiée — collez-la manuellement.",
                variant: 'destructive',
                duration: 6000,
            });
            navigator.clipboard.writeText(finalContent);
            return;
        }
        toast({
            title: isPartial ? '✅ Partie mise à jour' : '✅ Nouvelle version appliquée',
            description: isPartial ? 'Seule la partie ciblée a été modifiée dans l\'éditeur.' : 'L\'ensemble de la leçon a été remplacée.',
            duration: 4000,
        });
        onUpdateContent(finalContent || content);
    };

    // --- Flux guidé : génération complète structurée par les choix de l'assistant ---
    const runGuidedGeneration = async (exampleStyle: ExampleStyle) => {
        setStep('preview');
        setPreviewLoading(true);
        setPreviewContent('');

        const structureLabel = structureChoice === 'custom'
            ? (customSections.trim() || 'Structure personnalisée')
            : STRUCTURE_OPTIONS.find(o => o.id === structureChoice)?.description || '';
        const conceptsList = Object.entries(concepts).filter(([, v]) => v).map(([k]) => CONCEPT_LABELS[k]).join(', ') || 'aucun point particulier';
        const styleLabel = STYLE_OPTIONS.find(o => o.id === exampleStyle)?.label || '';

        const summary = `Génère la leçon complète "${titleLabel}" (niveau ${levelLabel}) avec :
- Structure : ${structureLabel}
- Points clés à inclure : ${conceptsList}
- Style des exemples/exercices : ${styleLabel}`;

        const wizard = {
            structure: structureChoice,
            customSections: structureChoice === 'custom' ? customSections.trim() : undefined,
            concepts: Object.entries(concepts).filter(([, v]) => v).map(([k]) => k),
            exampleStyle,
            lessonTitle: titleLabel,
            schoolLevel: levelLabel,
        };

        setPreviewMessages([{ role: 'user', content: summary }]);

        try {
            const full = await streamAi(
                [{ role: 'user', content: summary }],
                isEmpty ? '' : currentContent,
                wizard,
                (partial) => setPreviewContent(partial),
            );
            const { finalContent } = resolveAiContent(full, '');
            setPreviewContent(finalContent || full);
            setPreviewMessages(prev => [...prev, {
                role: 'assistant',
                content: "Voici une proposition de leçon structurée pour vos élèves. Prenez le temps de la relire.",
            }]);
        } catch (error: any) {
            console.error(error);
            toast({ title: 'Erreur IA', description: error.message || 'Une erreur est survenue', variant: 'destructive' });
            setStep('guided-style');
        } finally {
            setPreviewLoading(false);
        }
    };

    // --- Aperçu : affiner la proposition avant validation ---
    const handlePreviewRefine = async (overrideText?: string) => {
        const text = (overrideText ?? previewInput).trim();
        if (!text || previewLoading) return;

        const userMessage: Message = { role: 'user', content: text };
        setPreviewMessages(prev => [...prev, userMessage]);
        setPreviewInput('');
        setPreviewLoading(true);

        try {
            const full = await streamAi(
                [{ role: 'user', content: text }],
                previewContent,
                null,
                () => { /* pas d'affichage en direct pendant l'affinage : on applique une fois complet */ },
            );
            const { finalContent, isPartial, replaced } = resolveAiContent(full, previewContent);
            if (isPartial && !replaced) {
                setPreviewMessages(prev => [...prev, { role: 'assistant', content: "Je n'ai pas retrouvé le passage exact à modifier. Pouvez-vous préciser davantage (titre de section, numéro de définition...) ?" }]);
            } else {
                setPreviewContent(finalContent);
                setPreviewMessages(prev => [...prev, { role: 'assistant', content: isPartial ? '✅ Section mise à jour dans l\'aperçu ci-contre.' : '✅ Aperçu régénéré ci-contre.' }]);
            }
        } catch (error: any) {
            console.error(error);
            toast({ title: 'Erreur IA', description: error.message || 'Une erreur est survenue', variant: 'destructive' });
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleValidatePreview = () => {
        onUpdateContent(previewContent);
        toast({ title: '✅ Leçon insérée', description: 'La proposition a été appliquée à la leçon.', duration: 4000 });
        onClose();
    };

    const prefillPreviewInput = (text: string) => {
        setPreviewInput(text);
    };

    const toggleConcept = (key: string) => setConcepts(prev => ({ ...prev, [key]: !prev[key] }));

    const goChatWithPrefill = (text: string) => {
        setStep('chat');
        setInput(text);
        setTimeout(() => textareaRef.current?.focus(), 50);
    };

    if (!open) return null;

    return (
        <div className={cn(
            'fixed inset-y-0 right-0 bg-background border-l shadow-2xl z-50 flex flex-col transition-[width] duration-300',
            step === 'preview' ? 'w-full lg:w-[900px]' : 'w-full sm:w-[450px]',
        )}>
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                <div className="flex items-center gap-2 text-primary font-semibold">
                    {step !== 'entry' && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 -ml-1"
                            onClick={() => setStep('entry')}
                            title="Retour"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    )}
                    <Wand2 className="w-5 h-5" />
                    <span>Assistant Éditoriel IA</span>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                    <X className="w-4 h-4" />
                </Button>
            </div>

            {/* --- Étape d'entrée : détecte leçon vide / non vide --- */}
            {step === 'entry' && (
                <ScrollArea className="flex-1 p-4">
                    <div className="flex flex-col gap-4">
                        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded border border-border/50">
                            <p className="font-semibold mb-2">📋 Contenu actuel de la leçon :</p>
                            <div className="max-h-[160px] overflow-y-auto text-xs whitespace-pre-wrap font-mono bg-background p-2 rounded border border-border/30">
                                {isEmpty ? 'Aucun contenu (leçon vide)' : currentContent.substring(0, 500) + (currentContent.length > 500 ? '...' : '')}
                            </div>
                        </div>

                        <div className="rounded-lg border bg-muted/40 p-4 text-sm">
                            {isEmpty ? (
                                <p>
                                    Bonjour ! Je vois que vous préparez la leçon <strong>{titleLabel}</strong> pour le niveau <strong>{levelLabel}</strong>. Le contenu est actuellement vide. Comment souhaitez-vous procéder ?
                                </p>
                            ) : (
                                <p>
                                    Bonjour ! Votre leçon <strong>{titleLabel}</strong> pour le niveau <strong>{levelLabel}</strong> contient déjà du contenu. Que souhaitez-vous faire ?
                                </p>
                            )}
                        </div>

                        {isEmpty ? (
                            <div className="flex flex-col gap-2">
                                <Button className="justify-start gap-2 h-auto py-3" onClick={() => setStep('guided-structure')}>
                                    <Wand className="h-4 w-4 shrink-0" />
                                    <span className="text-right flex-1">🪄 Générer une leçon pas à pas (Guidé)</span>
                                </Button>
                                <Button variant="outline" className="justify-start gap-2 h-auto py-3" onClick={() => setStep('chat')}>
                                    <PencilLine className="h-4 w-4 shrink-0" />
                                    <span className="text-right flex-1">✍️ Saisir un prompt libre</span>
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <Button
                                    className="justify-start gap-2 h-auto py-3"
                                    onClick={() => goChatWithPrefill(`Enrichis et restructure la leçon "${titleLabel}" en améliorant la clarté, la progression pédagogique et en complétant les parties trop courtes.`)}
                                >
                                    <ListTree className="h-4 w-4 shrink-0" />
                                    <span className="text-right flex-1">📈 Enrichir ou restructurer la leçon actuelle</span>
                                </Button>
                                <Button variant="outline" className="justify-start gap-2 h-auto py-3" onClick={() => setStep('targeted-choice')}>
                                    <Sparkles className="h-4 w-4 shrink-0" />
                                    <span className="text-right flex-1">🎯 Ajouter un élément ciblé (Exemple, Exercice, Méthode)</span>
                                </Button>
                                <Button variant="outline" className="justify-start gap-2 h-auto py-3" onClick={() => setStep('chat')}>
                                    <MessageCircle className="h-4 w-4 shrink-0" />
                                    <span className="text-right flex-1">💬 Discuter librement avec l'assistant</span>
                                </Button>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            )}

            {/* --- Sous-choix de "élément ciblé" --- */}
            {step === 'targeted-choice' && (
                <ScrollArea className="flex-1 p-4">
                    <div className="flex flex-col gap-4">
                        <p className="text-sm text-muted-foreground">Quel type d'élément souhaitez-vous ajouter ?</p>
                        <div className="flex flex-col gap-2">
                            <Button variant="outline" className="justify-start h-auto py-3" onClick={() => goChatWithPrefill('Ajoute un exemple détaillé sur la section ')}>
                                ➕ Un exemple
                            </Button>
                            <Button variant="outline" className="justify-start h-auto py-3" onClick={() => goChatWithPrefill('Ajoute un exercice supplémentaire sur ')}>
                                📝 Un exercice
                            </Button>
                            <Button variant="outline" className="justify-start h-auto py-3" onClick={() => goChatWithPrefill('Ajoute une méthode/technique de résolution pour ')}>
                                🔧 Une méthode
                            </Button>
                        </div>
                    </div>
                </ScrollArea>
            )}

            {/* --- Étape 1 : structure générale --- */}
            {step === 'guided-structure' && (
                <ScrollArea className="flex-1 p-4">
                    <div className="flex flex-col gap-4">
                        <p className="text-sm">Pour un cours sur <strong>{titleLabel}</strong>, quelle structure préférez-vous adopter ?</p>
                        <div className="flex flex-col gap-2">
                            {STRUCTURE_OPTIONS.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setStructureChoice(opt.id)}
                                    className={cn(
                                        'text-right rounded-lg border p-3 transition-colors',
                                        structureChoice === opt.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50',
                                    )}
                                >
                                    <div className="font-medium text-sm">{opt.label}</div>
                                    <div className="text-xs text-muted-foreground mt-0.5">{opt.description}</div>
                                </button>
                            ))}
                        </div>
                        {structureChoice === 'custom' && (
                            <Textarea
                                value={customSections}
                                onChange={(e) => setCustomSections(e.target.value)}
                                placeholder="Ex: Rappels, Définitions, Exemples guidés, Exercices, Synthèse..."
                                className="min-h-[80px]"
                                dir="auto"
                            />
                        )}
                        <Button
                            className="mt-2"
                            disabled={!structureChoice || (structureChoice === 'custom' && !customSections.trim())}
                            onClick={() => setStep('guided-concepts')}
                        >
                            Continuer
                        </Button>
                    </div>
                </ScrollArea>
            )}

            {/* --- Étape 2 : concepts clés --- */}
            {step === 'guided-concepts' && (
                <ScrollArea className="flex-1 p-4">
                    <div className="flex flex-col gap-4">
                        <p className="text-sm">D'après le programme de <strong>{levelLabel}</strong>, voici les points clés que je suggère d'inclure. Cochez ceux que vous voulez garder :</p>
                        <div className="flex flex-col gap-3">
                            {Object.entries(CONCEPT_LABELS).map(([key, label]) => (
                                <label key={key} className="flex items-center gap-3 text-sm cursor-pointer">
                                    <Checkbox checked={!!concepts[key]} onCheckedChange={() => toggleConcept(key)} />
                                    <span>{label}</span>
                                </label>
                            ))}
                        </div>
                        <Button className="mt-2" onClick={() => setStep('guided-style')}>
                            Continuer
                        </Button>
                    </div>
                </ScrollArea>
            )}

            {/* --- Étape 3 : style des exemples/exercices --- */}
            {step === 'guided-style' && (
                <ScrollArea className="flex-1 p-4">
                    <div className="flex flex-col gap-4">
                        <p className="text-sm">Quel type d'exemples et d'exercices souhaitez-vous intégrer pour illustrer le cours ?</p>
                        <div className="flex flex-col gap-2">
                            {STYLE_OPTIONS.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => runGuidedGeneration(opt.id)}
                                    className="text-right rounded-lg border border-border hover:border-primary hover:bg-primary/5 p-3 transition-colors"
                                >
                                    <div className="font-medium text-sm">{opt.label}</div>
                                    <div className="text-xs text-muted-foreground mt-0.5">{opt.description}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </ScrollArea>
            )}

            {/* --- Aperçu post-génération : rendu + validation --- */}
            {step === 'preview' && (
                <div className="flex-1 flex flex-col lg:flex-row min-h-0">
                    <div className="flex-1 min-h-[240px] lg:min-h-0 overflow-y-auto border-b lg:border-b-0 lg:border-l p-4 bg-card">
                        {previewLoading && !previewContent ? (
                            <div className="flex items-center justify-center h-full text-muted-foreground gap-2 text-sm">
                                <Loader2 className="h-4 w-4 animate-spin" /> Génération en cours...
                            </div>
                        ) : previewContent ? (
                            <LessonMarkdown content={previewContent} dir="rtl" />
                        ) : (
                            <p className="text-sm text-muted-foreground text-center mt-8">L'aperçu s'affichera ici...</p>
                        )}
                    </div>

                    <div className="w-full lg:w-[380px] shrink-0 flex flex-col min-h-0">
                        <ScrollArea className="flex-1 p-3" ref={previewScrollRef}>
                            <div className="space-y-3">
                                {previewMessages.filter(m => m.role !== 'user' || previewMessages.indexOf(m) !== 0).map((msg, idx) => (
                                    <div key={idx} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                                        <div className={cn(
                                            'max-w-[90%] rounded-lg p-2.5 text-xs',
                                            msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted rounded-tl-none border',
                                        )}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {previewLoading && previewMessages.length > 0 && (
                                    <div className="flex justify-start">
                                        <div className="bg-muted rounded-lg rounded-tl-none p-2.5 border">
                                            <div className="flex gap-1 items-center h-4">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" />
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        {!previewLoading && previewContent && (
                            <div className="p-3 border-t space-y-2">
                                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleValidatePreview}>
                                    ✅ Valider et insérer dans la leçon
                                </Button>
                                <div className="grid grid-cols-1 gap-1.5">
                                    <Button variant="outline" size="sm" className="h-auto py-2 text-xs justify-start" onClick={() => prefillPreviewInput('➕ Ajoute un exemple détaillé sur la section ')}>
                                        ➕ Ajouter un exemple détaillé sur une section
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-auto py-2 text-xs justify-start" onClick={() => prefillPreviewInput("🔄 Rends l'exercice ")}>
                                        🔄 Rendre un exercice plus difficile / plus facile
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-auto py-2 text-xs justify-start" onClick={() => prefillPreviewInput('✏️ Modifie la définition ')}>
                                        ✏️ Modifier une définition
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="p-3 border-t bg-background">
                            <div className="relative flex items-center">
                                <Textarea
                                    value={previewInput}
                                    onChange={(e) => setPreviewInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handlePreviewRefine();
                                        }
                                    }}
                                    placeholder="Ex: Ajoute une remarque importante concernant l'ordre des fonctions pour la composition."
                                    className="min-h-[50px] max-h-[120px] resize-none pr-12 text-sm focus-visible:ring-1"
                                    disabled={previewLoading}
                                    dir="auto"
                                />
                                <Button
                                    size="icon"
                                    className="absolute right-2 bottom-2 h-7 w-7"
                                    onClick={() => handlePreviewRefine()}
                                    disabled={!previewInput.trim() || previewLoading}
                                >
                                    {previewLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Chat libre (prompt libre / enrichir / élément ciblé / discuter) --- */}
            {step === 'chat' && (
                <>
                    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                        {messages.length === 0 ? (
                            <div className="text-center text-muted-foreground mt-8">
                                <Sparkles className="w-12 h-12 mb-4 opacity-20 mx-auto" />
                                <p className="text-sm font-medium mb-1">Écrivez votre demande à l'assistant</p>
                                <p className="text-xs text-muted-foreground">Ex : "Enrichis la définition 1.1", "Ajoute un exemple après la propriété 2.1"...</p>
                            </div>
                        ) : (
                            <div className="space-y-4 pb-4">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                                        <div className={cn(
                                            'max-w-[85%] rounded-lg p-3',
                                            msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted rounded-tl-none border',
                                        )}>
                                            {msg.role === 'user' ? (
                                                <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                                            ) : (() => {
                                                const { isPartial, originalText, newText, displayContent } = extractDisplayContent(msg.content);
                                                return (
                                                    <div className="text-sm overflow-hidden max-w-none">
                                                        {isPartial ? (
                                                            <div className="space-y-3">
                                                                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-2">
                                                                    <div className="text-[10px] font-bold uppercase tracking-wide text-destructive/80 mb-1">➖ Partie actuelle (à remplacer)</div>
                                                                    <div className="prose prose-sm dark:prose-invert max-w-none text-xs opacity-80 text-right" dir="rtl">
                                                                        <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>{originalText}</ReactMarkdown>
                                                                    </div>
                                                                </div>
                                                                <div className="rounded-md border border-primary/40 bg-primary/5 p-2">
                                                                    <div className="text-[10px] font-bold uppercase tracking-wide text-primary mb-1 text-right">➕ Nouvelle version proposée</div>
                                                                    <div className="prose prose-sm dark:prose-invert max-w-none text-right" dir="rtl">
                                                                        <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>{newText}</ReactMarkdown>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="prose prose-sm dark:prose-invert max-w-none text-right" dir="rtl">
                                                                <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>{displayContent}</ReactMarkdown>
                                                            </div>
                                                        )}
                                                        {msg.content && !isLoading && (
                                                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                                                                <Button variant="default" size="sm" className="h-8 text-xs flex-1" onClick={() => handleApply(msg.content)}>
                                                                    ✅ {isPartial ? 'Accepter cette modification' : 'Appliquer toute la version'}
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-8 text-xs"
                                                                    onClick={() => toast({ title: 'Modification refusée', description: 'La proposition a été ignorée.' })}
                                                                >
                                                                    ✖ Refuser
                                                                </Button>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleCopy(msg.content, idx)} title="Copier la proposition brute">
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
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" />
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
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
                                ref={textareaRef}
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
                                dir="auto"
                            />
                            <Button size="icon" className="absolute right-2 bottom-2 h-7 w-7" onClick={() => handleSend()} disabled={!input.trim() || isLoading}>
                                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
