import { useState, useRef, useEffect, Component, type ReactNode } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
    Send, Loader2, Sparkles, Wand2, X, Copy, CheckCheck,
    ArrowLeft, Wand, PencilLine, MessageCircle, ListTree, Paperclip, FileText,
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

// Forme des messages envoyés à l'IA (Gemini) : soit du texte simple, soit un
// tableau de "parts" mixant texte et fichier joint (image ou PDF, encodés en
// data URL) — même forme que celle déjà consommée par l'edge function
// lovable-chat (toGeminiParts) pour le chatbot élève.
type ContentPart = { type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } };

interface AttachedDocument {
    name: string;
    // 'text' : contenu déjà extrait côté client (Word) ; 'image' | 'pdf' :
    // fichier transmis tel quel à l'IA (vision/document Gemini natif).
    kind: 'text' | 'image' | 'pdf';
    text?: string;
    dataUrl?: string;
}

type DocumentMode = 'present-improve' | 'present-replace' | 'absent-generate' | 'absent-exact';

const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024;

/** Extrait le texte brut d'un fichier Word (.docx) via mammoth, chargé à la
 * demande depuis un CDN ESM — évite d'alourdir le bundle pour un usage
 * ponctuel déclenché par l'utilisateur. Ne supporte pas l'ancien format .doc
 * (binaire, pas pris en charge par mammoth). */
async function extractDocxText(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod: any = await import(/* @vite-ignore */ 'https://esm.sh/mammoth@1.12.0');
    const mammoth = mod.extractRawText ? mod : mod.default;
    const result = await mammoth.extractRawText({ arrayBuffer });
    return (result?.value || '').trim();
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

type Step = 'entry' | 'targeted-choice' | 'guided-structure' | 'guided-concepts' | 'guided-style' | 'chat' | 'preview' | 'document-choice';

type StructureChoice = 'standard' | 'practice' | 'custom';
type ExampleStyle = 'academic' | 'visual' | 'progressive';

const STRUCTURE_OPTIONS: { id: StructureChoice; label: string; description: string }[] = [
    { id: 'standard', label: 'قياسية', description: 'تذكير ← نظرية ومبرهنات ← تطبيقات ومناهج ← تمارين' },
    { id: 'practice', label: 'التطبيق أولاً', description: 'مثال تمهيدي ← صياغة نظرية ← تمارين' },
    { id: 'custom', label: 'مخصصة', description: 'أحدد أقسامي بنفسي' },
];

const STYLE_OPTIONS: { id: ExampleStyle; label: string; description: string }[] = [
    { id: 'academic', label: '🎓 أكاديمية وكلاسيكية', description: 'تركز على الامتحانات' },
    { id: 'visual', label: '💡 بصرية أو ملموسة', description: 'تطبيقات ملموسة' },
    { id: 'progressive', label: '🚀 متدرجة', description: 'من السهل جداً إلى الصعب' },
];

// Même projet Supabase que src/integrations/supabase/client.ts (fichier généré,
// on évite de le modifier directement). Utilisé uniquement pour le fetch SSE
// manuel ci-dessous (supabase.functions.invoke ne supporte pas le streaming).
const LOVABLE_CHAT_URL = 'https://lfothlxoixayjiytwwqa.supabase.co/functions/v1/lovable-chat';

const CONCEPT_LABELS: Record<string, string> = {
    definition: 'التعريف والرموز',
    properties: 'الخصائص والمبرهنات الأساسية',
    methodology: 'المنهجية (تغيير المتغير، إلخ)',
    exercises: 'تمارين تطبيقية متدرجة',
};

/** Confine un éventuel crash de rendu (contenu IA imprévisible : formule ou
 * bloc mal formé) à ce panneau au lieu de faire tomber toute la page — le
 * contenu reste généré et peut toujours être validé même si l'aperçu échoue. */
class LessonPreviewBoundary extends Component<{ children: ReactNode; resetKey: string }, { hasError: boolean }> {
    state = { hasError: false };
    static getDerivedStateFromError() { return { hasError: true }; }
    componentDidCatch(error: Error) {
        console.error("Erreur de rendu de l'aperçu de leçon:", error);
    }
    componentDidUpdate(prevProps: { resetKey: string }) {
        if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
            this.setState({ hasError: false });
        }
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-lg" dir="rtl">
                    ⚠️ تعذر عرض المعاينة (تنسيق غير متوقع)، لكن المحتوى تم إنشاؤه بالفعل. يمكنك مع ذلك اعتماده، أو طلب تصحيح في الحقل المقابل.
                </div>
            );
        }
        return this.props.children;
    }
}

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

    // Choix du flux guidé (leçon vide)
    const [structureChoice, setStructureChoice] = useState<StructureChoice | null>(null);
    const [customSections, setCustomSections] = useState('');
    const [concepts, setConcepts] = useState<Record<string, boolean>>({ definition: true, properties: true, methodology: true, exercises: true });

    // Aperçu post-génération (flux guidé ou "génération complète" en chat libre)
    const [previewContent, setPreviewContent] = useState('');
    const [previewMessages, setPreviewMessages] = useState<Message[]>([]);
    const [previewInput, setPreviewInput] = useState('');
    const [previewLoading, setPreviewLoading] = useState(false);
    // Aperçu texte brut pendant le streaming (pas de rendu Markdown/KaTeX en
    // direct : LessonMarkdown manipule le DOM pour les formules, et le
    // re-rendre à chaque jeton sur du contenu potentiellement mal formé
    // provoque des conflits de réconciliation React qui font planter la page).
    const [streamingProgress, setStreamingProgress] = useState('');
    const previewScrollRef = useRef<HTMLDivElement>(null);

    // Génération à partir d'un document joint (PDF, Word, image)
    const [attachedDoc, setAttachedDoc] = useState<AttachedDocument | null>(null);
    const [docProcessing, setDocProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isEmpty = !currentContent || !currentContent.trim();
    const titleLabel = lessonTitle || 'هذا الدرس';
    const levelLabel = schoolLevel || 'هذا المستوى';

    useEffect(() => {
        if (open) {
            setStep('entry');
            setMessages([]);
            setPreviewContent('');
            setPreviewMessages([]);
            setStructureChoice(null);
            setCustomSections('');
            setConcepts({ definition: true, properties: true, methodology: true, exercises: true });
            setAttachedDoc(null);
            setDocProcessing(false);
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
        apiMessages: { role: string; content: string | ContentPart[] }[],
        referenceContent: string,
        wizard: Record<string, unknown> | null,
        onToken: (full: string) => void,
    ): Promise<string> => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
            throw new Error('انتهت الجلسة، يرجى إعادة تسجيل الدخول.');
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

        if (!response.ok) throw new Error("خطأ أثناء التوليد بواسطة الذكاء الاصطناعي");

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
            toast.error('خطأ في الذكاء الاصطناعي', { description: error.message || 'حدث خطأ ما' });
            setMessages(prev => {
                const next = [...prev];
                next[next.length - 1] = { role: 'assistant', content: 'عذراً، حدث خطأ تقني. يرجى المحاولة مرة أخرى.' };
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
        toast.success('تم نسخ المحتوى', { description: 'تم نسخ النص إلى الحافظة.' });
    };

    const handleApply = (content: string) => {
        const { finalContent, isPartial, replaced } = resolveAiContent(content, currentContent);
        if (isPartial && !replaced) {
            toast.error('⚠️ فشل الاستبدال التلقائي', {
                description: "لم يتم العثور على النص الأصلي. تم نسخ النسخة الجديدة — الصقها يدوياً.",
                duration: 6000,
            });
            navigator.clipboard.writeText(finalContent);
            return;
        }
        toast.success(isPartial ? '✅ تم تحديث الجزء' : '✅ تم تطبيق النسخة الجديدة', {
            description: isPartial ? 'تم تعديل الجزء المستهدف فقط في المحرر.' : 'تم استبدال الدرس بالكامل.',
            duration: 4000,
        });
        onUpdateContent(finalContent || content);
    };

    // --- Flux guidé : génération complète structurée par les choix de l'assistant ---
    const runGuidedGeneration = async (exampleStyle: ExampleStyle) => {
        setStep('preview');
        setPreviewLoading(true);
        setPreviewContent('');
        setStreamingProgress('');

        const structureLabel = structureChoice === 'custom'
            ? (customSections.trim() || 'هيكل مخصص')
            : STRUCTURE_OPTIONS.find(o => o.id === structureChoice)?.description || '';
        const conceptsList = Object.entries(concepts).filter(([, v]) => v).map(([k]) => CONCEPT_LABELS[k]).join(', ') || 'لا توجد نقطة محددة';
        const styleLabel = STYLE_OPTIONS.find(o => o.id === exampleStyle)?.label || '';

        const summary = `أنشئ الدرس الكامل "${titleLabel}" (مستوى ${levelLabel}) مع:
- الهيكل: ${structureLabel}
- النقاط الأساسية المطلوب تضمينها: ${conceptsList}
- أسلوب الأمثلة/التمارين: ${styleLabel}`;

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
                (partial) => setStreamingProgress(partial),
            );
            const { finalContent } = resolveAiContent(full, '');
            setPreviewContent(finalContent || full);
            setPreviewMessages(prev => [...prev, {
                role: 'assistant',
                content: "إليك اقتراح درس منظم لطلابك. خذ وقتك لمراجعته.",
            }]);
        } catch (error: any) {
            console.error(error);
            toast.error('خطأ في الذكاء الاصطناعي', { description: error.message || 'حدث خطأ ما' });
            setStep('guided-style');
        } finally {
            setPreviewLoading(false);
            setStreamingProgress('');
        }
    };

    // --- Document joint (PDF, Word, image) : lecture puis choix du mode ---
    const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (!file) return;

        if (file.size > MAX_DOCUMENT_SIZE) {
            toast.error('الملف كبير جداً', { description: 'الحد الأقصى لحجم الملف هو 20 ميغابايت.' });
            return;
        }

        const lowerName = file.name.toLowerCase();
        const isImage = file.type.startsWith('image/');
        const isPdf = file.type === 'application/pdf';
        const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || lowerName.endsWith('.docx');
        const isOldDoc = file.type === 'application/msword' || lowerName.endsWith('.doc');

        if (isOldDoc) {
            toast.error('صيغة غير مدعومة', { description: 'صيغة .doc القديمة غير مدعومة. يرجى تحويل الملف إلى .docx أو PDF.' });
            return;
        }
        if (!isImage && !isPdf && !isDocx) {
            toast.error('نوع ملف غير مدعوم', { description: 'يمكنك إرفاق PDF أو Word (.docx) أو صورة فقط.' });
            return;
        }

        setDocProcessing(true);
        try {
            if (isDocx) {
                const text = await extractDocxText(file);
                if (!text) throw new Error('لم يتم العثور على نص قابل للقراءة في هذا الملف.');
                setAttachedDoc({ name: file.name, kind: 'text', text });
            } else {
                const dataUrl = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = () => reject(new Error('تعذرت قراءة الملف.'));
                    reader.readAsDataURL(file);
                });
                setAttachedDoc({ name: file.name, kind: isPdf ? 'pdf' : 'image', dataUrl });
            }
            setStep('document-choice');
        } catch (error: any) {
            console.error(error);
            toast.error('خطأ', { description: error.message || 'تعذرت معالجة الملف.' });
        } finally {
            setDocProcessing(false);
        }
    };

    const DOCUMENT_INSTRUCTIONS: Record<DocumentMode, (fileName: string) => string> = {
        'present-improve': (fileName) => `لدي مستند مرفق (${fileName}) يحتوي على محتوى إضافي حول درس "${titleLabel}". حسّن وأثرِ المحتوى الحالي للدرس بالاستناد إلى هذا المستند، مع الحفاظ على الأجزاء الجيدة من المحتوى الحالي وإضافة أو تصحيح ما يقترحه المستند. التزم بتنسيق الدرس المعتاد (::: تعريف، ::: مثال، إلخ) وبصيغة LaTeX للرموز الرياضية.`,
        'present-replace': (fileName) => `لدي مستند مرفق (${fileName}). تجاهل تماماً المحتوى الحالي لدرس "${titleLabel}" وأعد إنشاءه بالاعتماد حصرياً على ما هو موجود في هذا المستند فقط. نظّم المحتوى وفق تنسيق الدرس المعتاد (::: تعريف، ::: مثال، إلخ) وبصيغة LaTeX عند الحاجة، دون إضافة أفكار من عندك غير موجودة في المستند.`,
        'absent-generate': (fileName) => `لا يحتوي درس "${titleLabel}" على أي محتوى بعد. لدي مستند مرفق (${fileName}) كمصدر أساسي. أنشئ الدرس بالاستناد إلى محتوى هذا المستند، مع إدخال تحسينات تربوية من عندك (لا يجب أن يكون مطابقاً 100% للمستند): أعد الصياغة والترتيب لتحسين الوضوح والتدرج، وأضف أمثلة أو توضيحات إذا لزم الأمر، مع احترام تنسيق الدرس المعتاد (::: تعريف، ::: مثال، إلخ) وصيغة LaTeX.`,
        'absent-exact': (fileName) => `لا يحتوي درس "${titleLabel}" على أي محتوى بعد. لدي مستند مرفق (${fileName}). انقل محتوى هذا المستند كما هو تماماً دون أي تغيير في المضمون أو الأسلوب أو حذف أو إضافة أي فكرة، فقط أعد تنسيقه ليتوافق مع بنية الدرس المعتادة (::: تعريف، ::: مثال، إلخ) وصيغة LaTeX للرموز الرياضية إن وجدت.`,
    };

    const runDocumentBasedGeneration = async (mode: DocumentMode) => {
        if (!attachedDoc) return;
        setStep('preview');
        setPreviewLoading(true);
        setPreviewContent('');
        setStreamingProgress('');

        const instruction = DOCUMENT_INSTRUCTIONS[mode](attachedDoc.name);
        setPreviewMessages([{ role: 'user', content: `📎 ${attachedDoc.name}\n\n${instruction}` }]);

        const contentParts: ContentPart[] = attachedDoc.kind === 'text'
            ? [{ type: 'text', text: `${instruction}\n\n--- محتوى المستند المرفق ---\n${attachedDoc.text}` }]
            : [
                { type: 'text', text: instruction },
                { type: 'image_url', image_url: { url: attachedDoc.dataUrl! } },
            ];

        try {
            const full = await streamAi(
                [{ role: 'user', content: contentParts }],
                mode === 'present-improve' ? currentContent : '',
                null,
                (partial) => setStreamingProgress(partial),
            );
            const { finalContent } = resolveAiContent(full, '');
            setPreviewContent(finalContent || full);
            setPreviewMessages(prev => [...prev, {
                role: 'assistant',
                content: 'إليك النتيجة المستندة إلى الملف المرفق. راجعها قبل الاعتماد.',
            }]);
        } catch (error: any) {
            console.error(error);
            toast.error('خطأ في الذكاء الاصطناعي', { description: error.message || 'حدث خطأ ما' });
            setStep('document-choice');
        } finally {
            setPreviewLoading(false);
            setStreamingProgress('');
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
                setPreviewMessages(prev => [...prev, { role: 'assistant', content: "لم أتمكن من العثور على المقطع المحدد للتعديل. هل يمكنك التوضيح أكثر (عنوان القسم، رقم التعريف...) ؟" }]);
            } else {
                setPreviewContent(finalContent);
                setPreviewMessages(prev => [...prev, { role: 'assistant', content: isPartial ? '✅ تم تحديث القسم في المعاينة المقابلة.' : '✅ تمت إعادة إنشاء المعاينة المقابلة.' }]);
            }
        } catch (error: any) {
            console.error(error);
            toast.error('خطأ في الذكاء الاصطناعي', { description: error.message || 'حدث خطأ ما' });
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleValidatePreview = () => {
        onUpdateContent(previewContent);
        toast.success('✅ تم إدراج الدرس', { description: 'تم تطبيق الاقتراح على الدرس.', duration: 4000 });
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

    const cancelAttachedDocument = () => {
        setAttachedDoc(null);
        setStep('entry');
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
                            title="رجوع"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    )}
                    <Wand2 className="w-5 h-5" />
                    <span dir="rtl">المساعد التحريري للذكاء الاصطناعي</span>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                    <X className="w-4 h-4" />
                </Button>
            </div>

            {/* --- Étape d'entrée : détecte leçon vide / non vide --- */}
            {step === 'entry' && (
                <ScrollArea className="flex-1 p-4">
                    <div className="flex flex-col gap-4" dir="rtl">
                        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded border border-border/50">
                            <p className="font-semibold mb-2">📋 محتوى الدرس الحالي:</p>
                            <div className="max-h-[160px] overflow-y-auto text-xs whitespace-pre-wrap font-mono bg-background p-2 rounded border border-border/30" dir="auto">
                                {isEmpty ? 'لا يوجد محتوى (درس فارغ)' : currentContent.substring(0, 500) + (currentContent.length > 500 ? '...' : '')}
                            </div>
                        </div>

                        <div className="rounded-lg border bg-muted/40 p-4 text-sm">
                            {isEmpty ? (
                                <p>
                                    مرحباً! أرى أنك تُعِدّ درس <strong>{titleLabel}</strong> لمستوى <strong>{levelLabel}</strong>. المحتوى فارغ حالياً. كيف تريد المتابعة؟
                                </p>
                            ) : (
                                <p>
                                    مرحباً! درسك <strong>{titleLabel}</strong> لمستوى <strong>{levelLabel}</strong> يحتوي بالفعل على محتوى. ماذا تريد أن تفعل؟
                                </p>
                            )}
                        </div>

                        {isEmpty ? (
                            <div className="flex flex-col gap-2">
                                <Button className="justify-start gap-2 h-auto py-3" onClick={() => setStep('guided-structure')}>
                                    <Wand className="h-4 w-4 shrink-0" />
                                    <span className="text-right flex-1">🪄 إنشاء درس خطوة بخطوة (موجّه)</span>
                                </Button>
                                <Button variant="outline" className="justify-start gap-2 h-auto py-3" onClick={() => setStep('chat')}>
                                    <PencilLine className="h-4 w-4 shrink-0" />
                                    <span className="text-right flex-1">✍️ كتابة طلب حر</span>
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <Button
                                    className="justify-start gap-2 h-auto py-3"
                                    onClick={() => goChatWithPrefill(`أثرِ وأعد هيكلة درس "${titleLabel}" مع تحسين الوضوح والتدرج التربوي وإكمال الأجزاء القصيرة جداً.`)}
                                >
                                    <ListTree className="h-4 w-4 shrink-0" />
                                    <span className="text-right flex-1">📈 إثراء أو إعادة هيكلة الدرس الحالي</span>
                                </Button>
                                <Button variant="outline" className="justify-start gap-2 h-auto py-3" onClick={() => setStep('targeted-choice')}>
                                    <Sparkles className="h-4 w-4 shrink-0" />
                                    <span className="text-right flex-1">🎯 إضافة عنصر محدد (مثال، تمرين، منهجية)</span>
                                </Button>
                                <Button variant="outline" className="justify-start gap-2 h-auto py-3" onClick={() => setStep('chat')}>
                                    <MessageCircle className="h-4 w-4 shrink-0" />
                                    <span className="text-right flex-1">💬 التحدث بحرية مع المساعد</span>
                                </Button>
                            </div>
                        )}

                        <Button
                            variant="ghost"
                            className="justify-center gap-2 h-auto py-3 border border-dashed text-muted-foreground"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={docProcessing}
                        >
                            {docProcessing ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : <Paperclip className="h-4 w-4 shrink-0" />}
                            <span className="text-center flex-1">
                                {docProcessing ? 'جارٍ معالجة الملف...' : '📎 أو أرفق ملفاً (PDF، Word، صورة) لاستخدامه كمصدر'}
                            </span>
                        </Button>
                    </div>
                </ScrollArea>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,image/*"
                onChange={handleFileSelected}
                className="hidden"
            />

            {/* --- Choix du mode d'utilisation du document joint --- */}
            {step === 'document-choice' && attachedDoc && (
                <ScrollArea className="flex-1 p-4">
                    <div className="flex flex-col gap-4" dir="rtl">
                        <div className="rounded-lg border bg-muted/40 p-3 text-sm flex items-center gap-2">
                            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="truncate">{attachedDoc.name}</span>
                        </div>

                        {isEmpty ? (
                            <>
                                <p className="text-sm">الدرس فارغ حالياً. ماذا تريد أن تفعل بهذا المستند؟</p>
                                <div className="flex flex-col gap-2">
                                    <Button className="justify-start gap-2 h-auto py-3" onClick={() => runDocumentBasedGeneration('absent-generate')}>
                                        <Wand className="h-4 w-4 shrink-0" />
                                        <span className="text-right flex-1">🪄 توليد الدرس من هذا المستند مع تحسينات الذكاء الاصطناعي (ليس مطابقاً 100%)</span>
                                    </Button>
                                    <Button variant="outline" className="justify-start gap-2 h-auto py-3" onClick={() => runDocumentBasedGeneration('absent-exact')}>
                                        <ListTree className="h-4 w-4 shrink-0" />
                                        <span className="text-right flex-1">📋 استرجاع محتوى المستند كما هو تماماً، دون أي تغيير</span>
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text-sm">الدرس يحتوي على محتوى بالفعل. ماذا تريد أن تفعل بهذا المستند؟</p>
                                <div className="flex flex-col gap-2">
                                    <Button className="justify-start gap-2 h-auto py-3" onClick={() => runDocumentBasedGeneration('present-improve')}>
                                        <Sparkles className="h-4 w-4 shrink-0" />
                                        <span className="text-right flex-1">📈 تحسين المحتوى الحالي بالاستناد إلى هذا المستند</span>
                                    </Button>
                                    <Button variant="outline" className="justify-start gap-2 h-auto py-3" onClick={() => runDocumentBasedGeneration('present-replace')}>
                                        <ListTree className="h-4 w-4 shrink-0" />
                                        <span className="text-right flex-1">🔄 استبدال كل المحتوى الحالي والاعتماد فقط على هذا المستند</span>
                                    </Button>
                                </div>
                            </>
                        )}

                        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={cancelAttachedDocument}>
                            إلغاء واختيار ملف آخر
                        </Button>
                    </div>
                </ScrollArea>
            )}

            {/* --- Sous-choix de "élément ciblé" --- */}
            {step === 'targeted-choice' && (
                <ScrollArea className="flex-1 p-4">
                    <div className="flex flex-col gap-4" dir="rtl">
                        <p className="text-sm text-muted-foreground">ما نوع العنصر الذي تريد إضافته؟</p>
                        <div className="flex flex-col gap-2">
                            <Button variant="outline" className="justify-start h-auto py-3" onClick={() => goChatWithPrefill('أضف مثالاً مفصلاً حول القسم ')}>
                                ➕ مثال
                            </Button>
                            <Button variant="outline" className="justify-start h-auto py-3" onClick={() => goChatWithPrefill('أضف تمريناً إضافياً حول ')}>
                                📝 تمرين
                            </Button>
                            <Button variant="outline" className="justify-start h-auto py-3" onClick={() => goChatWithPrefill('أضف منهجية/تقنية حل لـ ')}>
                                🔧 منهجية
                            </Button>
                        </div>
                    </div>
                </ScrollArea>
            )}

            {/* --- Étape 1 : structure générale --- */}
            {step === 'guided-structure' && (
                <ScrollArea className="flex-1 p-4">
                    <div className="flex flex-col gap-4" dir="rtl">
                        <p className="text-sm">لدرس حول <strong>{titleLabel}</strong>، ما الهيكل الذي تفضل اعتماده؟</p>
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
                                placeholder="مثال: تذكيرات، تعريفات، أمثلة موجهة، تمارين، خلاصة..."
                                className="min-h-[80px]"
                                dir="auto"
                            />
                        )}
                        <Button
                            className="mt-2"
                            disabled={!structureChoice || (structureChoice === 'custom' && !customSections.trim())}
                            onClick={() => setStep('guided-concepts')}
                        >
                            متابعة
                        </Button>
                    </div>
                </ScrollArea>
            )}

            {/* --- Étape 2 : concepts clés --- */}
            {step === 'guided-concepts' && (
                <ScrollArea className="flex-1 p-4">
                    <div className="flex flex-col gap-4" dir="rtl">
                        <p className="text-sm">وفقاً لمنهج <strong>{levelLabel}</strong>، إليك النقاط الأساسية التي أقترح تضمينها. اختر ما تريد الاحتفاظ به:</p>
                        <div className="flex flex-col gap-3">
                            {Object.entries(CONCEPT_LABELS).map(([key, label]) => (
                                <label key={key} className="flex items-center gap-3 text-sm cursor-pointer">
                                    <Checkbox checked={!!concepts[key]} onCheckedChange={() => toggleConcept(key)} />
                                    <span>{label}</span>
                                </label>
                            ))}
                        </div>
                        <Button className="mt-2" onClick={() => setStep('guided-style')}>
                            متابعة
                        </Button>
                    </div>
                </ScrollArea>
            )}

            {/* --- Étape 3 : style des exemples/exercices --- */}
            {step === 'guided-style' && (
                <ScrollArea className="flex-1 p-4">
                    <div className="flex flex-col gap-4" dir="rtl">
                        <p className="text-sm">ما نوع الأمثلة والتمارين التي تريد دمجها لتوضيح الدرس؟</p>
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
                        {previewLoading ? (
                            <div className="flex flex-col h-full">
                                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-6" dir="rtl">
                                    <Loader2 className="h-4 w-4 animate-spin" /> جارٍ الإنشاء...
                                </div>
                                {/* Texte brut uniquement pendant le streaming : pas de rendu Markdown/KaTeX
                                    en direct sur du contenu potentiellement incomplet (cf. commentaire sur
                                    streamingProgress plus haut). */}
                                {streamingProgress && (
                                    <pre className="flex-1 whitespace-pre-wrap text-xs text-muted-foreground/70 font-mono overflow-hidden" dir="rtl">
                                        {streamingProgress.slice(-1500)}
                                    </pre>
                                )}
                            </div>
                        ) : previewContent ? (
                            <LessonPreviewBoundary resetKey={previewContent}>
                                <LessonMarkdown content={previewContent} dir="rtl" />
                            </LessonPreviewBoundary>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center mt-8" dir="rtl">ستظهر المعاينة هنا...</p>
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
                            <div className="p-3 border-t space-y-2" dir="rtl">
                                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleValidatePreview}>
                                    ✅ اعتماد وإدراج في الدرس
                                </Button>
                                <div className="grid grid-cols-1 gap-1.5">
                                    <Button variant="outline" size="sm" className="h-auto py-2 text-xs justify-start" onClick={() => prefillPreviewInput('➕ أضف مثالاً مفصلاً حول القسم ')}>
                                        ➕ إضافة مثال مفصل حول قسم
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-auto py-2 text-xs justify-start" onClick={() => prefillPreviewInput("🔄 اجعل التمرين ")}>
                                        🔄 جعل تمرين أصعب / أسهل
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-auto py-2 text-xs justify-start" onClick={() => prefillPreviewInput('✏️ عدّل التعريف ')}>
                                        ✏️ تعديل تعريف
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
                                    placeholder="مثال: أضف ملاحظة مهمة بخصوص ترتيب الدوال في التركيب."
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
                            <div className="text-center text-muted-foreground mt-8" dir="rtl">
                                <Sparkles className="w-12 h-12 mb-4 opacity-20 mx-auto" />
                                <p className="text-sm font-medium mb-1">اكتب طلبك للمساعد</p>
                                <p className="text-xs text-muted-foreground">مثال: "أثرِ التعريف 1.1"، "أضف مثالاً بعد الخاصية 2.1"...</p>
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
                                                                    <div className="text-[10px] font-bold uppercase tracking-wide text-destructive/80 mb-1" dir="rtl">➖ الجزء الحالي (سيُستبدل)</div>
                                                                    <div className="prose prose-sm dark:prose-invert max-w-none text-xs opacity-80 text-right" dir="rtl">
                                                                        <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>{originalText}</ReactMarkdown>
                                                                    </div>
                                                                </div>
                                                                <div className="rounded-md border border-primary/40 bg-primary/5 p-2">
                                                                    <div className="text-[10px] font-bold uppercase tracking-wide text-primary mb-1 text-right" dir="rtl">➕ النسخة الجديدة المقترحة</div>
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
                                                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50" dir="rtl">
                                                                <Button variant="default" size="sm" className="h-8 text-xs flex-1" onClick={() => handleApply(msg.content)}>
                                                                    ✅ {isPartial ? 'قبول هذا التعديل' : 'تطبيق النسخة كاملة'}
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-8 text-xs"
                                                                    onClick={() => toast('تم رفض التعديل', { description: 'تم تجاهل الاقتراح.' })}
                                                                >
                                                                    ✖ رفض
                                                                </Button>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleCopy(msg.content, idx)} title="نسخ الاقتراح الخام">
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
                                placeholder="مثال: أثرِ القسم النظري بمثال..."
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
