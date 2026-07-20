import { useRef, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { sanitizeLessonHtml } from '@/lib/sanitizeHtml';
import { lessonSchema, convertPedagoBlocks } from '@/lib/lessonBlocks';
import { cn } from '@/lib/utils';

interface InlineLessonEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  /** Change cette valeur pour forcer la réinitialisation de l'affichage
   * (changement de leçon, mise à jour distante, annulation), sans quoi la
   * zone éditable ignore les changements de `content` pour ne pas écraser
   * la frappe en cours. */
  resetKey: string | number;
  /** Appelé quand la zone éditable reçoit le focus (ex: pour cibler le clavier arabe virtuel). */
  onFocusTarget?: (el: HTMLDivElement) => void;
}

const isHtmlContent = (s: string) => /<\s*(html|body|head|!doctype|div|section|article|main|h[1-6]|p)\b/i.test((s || '').trim());

const EDITABLE_CLASSES = cn(
  'lesson-markdown prose prose-sm dark:prose-invert max-w-none min-h-[300px] p-4 rounded-lg',
  'border border-transparent hover:border-border focus:border-primary/40 focus:outline-none transition-colors',
);

function InlineLessonEditorInner({
  initialContent,
  onChange,
  placeholder,
  className,
  onFocusTarget,
}: {
  initialContent: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  onFocusTarget?: (el: HTMLDivElement) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isEmpty, setIsEmpty] = useState(!initialContent?.trim());

  // Capturé une seule fois au montage (ou lors d'une réinitialisation via `key`) :
  // on ne relit jamais `content` depuis les props ensuite, pour laisser le
  // navigateur gérer nativement l'édition sans que React n'écrase le DOM en frappe.
  const [frozenHtml] = useState<string | null>(() =>
    isHtmlContent(initialContent) ? sanitizeLessonHtml(convertPedagoBlocks(initialContent)) : null
  );
  const [frozenMarkdown] = useState(() => convertPedagoBlocks(initialContent));

  const commit = useCallback(() => {
    const raw = ref.current?.innerHTML || '';
    setIsEmpty(!ref.current?.textContent?.trim());
    onChange(sanitizeLessonHtml(raw));
  }, [onChange]);

  const handleInput = useCallback(() => {
    setIsEmpty(!ref.current?.textContent?.trim());
  }, []);

  return (
    <div className="relative">
      {isEmpty && (
        <p className="absolute inset-0 p-4 text-muted-foreground italic pointer-events-none">
          {placeholder || 'Cliquez ici pour ajouter le contenu de la leçon...'}
        </p>
      )}
      {frozenHtml !== null ? (
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          dir="rtl"
          lang="ar"
          onFocus={(e) => onFocusTarget?.(e.currentTarget)}
          onBlur={commit}
          onInput={handleInput}
          className={cn(EDITABLE_CLASSES, className)}
          dangerouslySetInnerHTML={{ __html: frozenHtml }}
        />
      ) : (
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          dir="rtl"
          lang="ar"
          onFocus={(e) => onFocusTarget?.(e.currentTarget)}
          onBlur={commit}
          onInput={handleInput}
          className={cn(EDITABLE_CLASSES, className)}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, [rehypeSanitize, lessonSchema]]}>
            {frozenMarkdown}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}

/**
 * Édition directe "click-to-edit" du contenu d'une leçon : le même rendu
 * visuel (tailles de titres, couleurs, structure) qu'en lecture, sans mode
 * "Modifier" séparé — on clique dans le texte et on tape. Les formules
 * $...$ / $$...$$ restent du texte brut éditable (pas du KaTeX déjà rendu,
 * trop fragile à modifier en place) ; elles s'affichent en LaTeX rendu
 * uniquement côté élève.
 */
export default function InlineLessonEditor({ content, onChange, placeholder, className, resetKey, onFocusTarget }: InlineLessonEditorProps) {
  return (
    <InlineLessonEditorInner
      key={resetKey}
      initialContent={content}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      onFocusTarget={onFocusTarget}
    />
  );
}
