import { useRef, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { sanitizeLessonHtml } from '@/lib/sanitizeHtml';
import { lessonSchema, convertPedagoBlocks } from '@/lib/lessonBlocks';
import { cn } from '@/lib/utils';
import {
  Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered,
  Sigma, FunctionSquare, BookMarked, Scale, PenLine,
  Table2, ImagePlus, Minus, Palette,
} from 'lucide-react';

// Même palette que LessonSourceEditor (LaTeX) : classes CSS fixes définies
// dans index.css sous .lesson-markdown, pas du Tailwind arbitraire.
const TEXT_COLORS = [
  { label: 'Rouge', className: 'clr-red', hex: '#dc2626' },
  { label: 'Orange', className: 'clr-orange', hex: '#ea580c' },
  { label: 'Vert', className: 'clr-green', hex: '#16a34a' },
  { label: 'Bleu', className: 'clr-blue', hex: '#2563eb' },
  { label: 'Violet', className: 'clr-purple', hex: '#9333ea' },
  { label: 'Rose', className: 'clr-pink', hex: '#db2777' },
  { label: 'Gris', className: 'clr-gray', hex: '#6b7280' },
  { label: 'Noir', className: 'clr-black', hex: '#111827' },
] as const;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

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
  /** Appelé quand la zone éditable perd le focus (ex: pour masquer le clavier arabe virtuel). */
  onBlurTarget?: () => void;
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
  onBlurTarget,
}: {
  initialContent: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  onFocusTarget?: (el: HTMLDivElement) => void;
  onBlurTarget?: () => void;
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

  // Persiste le HTML actuel du DOM vers le parent, sans les effets de bord
  // liés à un vrai blur (masquage du clavier arabe virtuel) : utilisé après
  // chaque clic sur un bouton de la barre d'outils, où le focus ne quitte
  // jamais réellement l'utilisateur (juste le DOM).
  const persist = useCallback(() => {
    const raw = ref.current?.innerHTML || '';
    setIsEmpty(!ref.current?.textContent?.trim());
    onChange(sanitizeLessonHtml(raw));
  }, [onChange]);

  const commit = useCallback(() => {
    persist();
    onBlurTarget?.();
  }, [persist, onBlurTarget]);

  const handleInput = useCallback(() => {
    setIsEmpty(!ref.current?.textContent?.trim());
  }, []);

  // Insère un fragment HTML à la position du curseur dans la zone éditable
  // (ou à la fin si aucune sélection valide n'y est active), puis replace le
  // curseur juste après et persiste le résultat.
  const insertHtmlAtCursor = useCallback((html: string) => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    let range: Range;
    if (sel && sel.rangeCount > 0 && el.contains(sel.getRangeAt(0).commonAncestorContainer)) {
      range = sel.getRangeAt(0);
    } else {
      range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
    }
    range.deleteContents();
    const fragment = range.createContextualFragment(html);
    const lastNode = fragment.lastChild;
    range.insertNode(fragment);
    if (lastNode) {
      range.setStartAfter(lastNode);
      range.collapse(true);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
    persist();
  }, [persist]);

  // Récupère le texte sélectionné dans la zone éditable (s'il y en a un),
  // pour l'utiliser comme contenu du titre/bloc inséré au lieu du texte par
  // défaut — même logique que wrapSelection côté éditeur LaTeX.
  const getSelectedText = useCallback((): string => {
    const el = ref.current;
    const sel = window.getSelection();
    if (!el || !sel || sel.rangeCount === 0 || sel.isCollapsed) return '';
    if (!el.contains(sel.getRangeAt(0).commonAncestorContainer)) return '';
    return sel.toString();
  }, []);

  const insertHeading = useCallback((level: 1 | 2 | 3, defaultText: string) => {
    const text = escapeHtml(getSelectedText() || defaultText);
    insertHtmlAtCursor(`<h${level}>${text}</h${level}>`);
  }, [getSelectedText, insertHtmlAtCursor]);

  const insertBlock = useCallback((blockClass: string, blockTitle: string, defaultText: string) => {
    const text = escapeHtml(getSelectedText() || defaultText);
    insertHtmlAtCursor(
      `<div class="lesson-block ${blockClass}"><div class="lesson-block-title"><strong>${blockTitle}</strong></div><div class="lesson-block-content"><p>${text}</p></div></div>`
    );
  }, [getSelectedText, insertHtmlAtCursor]);

  const insertLatex = useCallback((display: boolean) => {
    const defaultFormula = display ? '\\int_a^b f(x)\\,dx' : 'x^2';
    const text = escapeHtml(getSelectedText() || defaultFormula);
    insertHtmlAtCursor(display ? `$$${text}$$` : `$${text}$`);
  }, [getSelectedText, insertHtmlAtCursor]);

  const insertTable = useCallback(() => {
    insertHtmlAtCursor(
      '<table><thead><tr><th>Colonne 1</th><th>Colonne 2</th></tr></thead><tbody><tr><td>Valeur 1</td><td>Valeur 2</td></tr><tr><td>Valeur 3</td><td>Valeur 4</td></tr></tbody></table>'
    );
  }, [insertHtmlAtCursor]);

  const insertImage = useCallback(() => {
    insertHtmlAtCursor('<img src="URL_DE_L_IMAGE" alt="Description de l\'image" />');
  }, [insertHtmlAtCursor]);

  const insertHorizontalRule = useCallback(() => {
    insertHtmlAtCursor('<hr />');
  }, [insertHtmlAtCursor]);

  const toggleInlineStyle = useCallback((command: 'bold' | 'italic') => {
    ref.current?.focus();
    document.execCommand(command);
    persist();
  }, [persist]);

  // Colore la sélection en l'encadrant de <span class="clr-...">. Contrairement
  // à document.execCommand('foreColor', ...), on utilise une classe (pas un
  // style inline) : c'est ce que le schéma de sanitization du rendu élève
  // (lessonSchema, rehype-sanitize) autorise sur <span>, un style inline y
  // serait silencieusement retiré à l'affichage.
  const applyColor = useCallback((colorClass: string) => {
    const el = ref.current;
    const sel = window.getSelection();
    if (!el) return;
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed || !el.contains(sel.getRangeAt(0).commonAncestorContainer)) {
      toast.info('Sélectionnez d\'abord le texte à colorer, puis choisissez une couleur.');
      el.focus();
      return;
    }
    const range = sel.getRangeAt(0);
    const span = document.createElement('span');
    span.className = colorClass;
    try {
      range.surroundContents(span);
    } catch {
      // La sélection traverse partiellement plusieurs éléments (surroundContents
      // l'interdit) : on extrait le contenu sélectionné et on le ré-insère
      // enveloppé dans le span, ce qui fonctionne dans tous les cas.
      const fragment = range.extractContents();
      span.appendChild(fragment);
      range.insertNode(span);
    }
    sel.removeAllRanges();
    persist();
  }, [persist]);

  // mousedown avec preventDefault empêche le focus (et donc la sélection en
  // cours dans la zone éditable) de disparaître au moment de cliquer sur un
  // bouton de la barre d'outils — sans ça, le clic arrive après que le
  // navigateur ait déjà retiré le focus de la zone éditable.
  const ToolBtn = ({ onClick, children, title }: { onClick: () => void; children: React.ReactNode; title: string }) => (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-8 w-8 shrink-0"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      aria-label={title}
    >
      {children}
    </Button>
  );

  const toolbar = (
    <div className="flex md:flex-col flex-row flex-wrap md:flex-nowrap items-center gap-0.5 p-1.5 bg-muted/50 border rounded-lg shrink-0 md:self-stretch">
      <ToolBtn onClick={() => toggleInlineStyle('bold')} title="Gras">
        <Bold className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn onClick={() => toggleInlineStyle('italic')} title="Italique">
        <Italic className="h-4 w-4" />
      </ToolBtn>

      <Separator orientation="horizontal" className="hidden md:block w-6 my-1" />
      <Separator orientation="vertical" className="md:hidden h-6 mx-1" />

      <ToolBtn onClick={() => insertHeading(1, 'Titre')} title="Titre">
        <Heading1 className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn onClick={() => insertHeading(2, 'Sous-titre')} title="Sous-titre">
        <Heading2 className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn onClick={() => insertHeading(3, 'Sous-sous-titre')} title="Sous-sous-titre">
        <Heading3 className="h-4 w-4" />
      </ToolBtn>

      <Separator orientation="horizontal" className="hidden md:block w-6 my-1" />
      <Separator orientation="vertical" className="md:hidden h-6 mx-1" />

      <ToolBtn onClick={() => insertHtmlAtCursor('<ul><li>élément</li></ul>')} title="Liste à puces">
        <List className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn onClick={() => insertHtmlAtCursor('<ol><li>élément</li></ol>')} title="Liste numérotée">
        <ListOrdered className="h-4 w-4" />
      </ToolBtn>

      <Separator orientation="horizontal" className="hidden md:block w-6 my-1" />
      <Separator orientation="vertical" className="md:hidden h-6 mx-1" />

      <ToolBtn onClick={() => insertLatex(false)} title="Formule LaTeX en ligne ($...$)">
        <Sigma className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn onClick={() => insertLatex(true)} title="Formule LaTeX en bloc ($$...$$)">
        <FunctionSquare className="h-4 w-4" />
      </ToolBtn>

      <Separator orientation="horizontal" className="hidden md:block w-6 my-1" />
      <Separator orientation="vertical" className="md:hidden h-6 mx-1" />

      <ToolBtn onClick={() => insertBlock('block-definition', 'Définition', 'Énoncé de la définition...')} title="Bloc Définition">
        <BookMarked className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn onClick={() => insertBlock('block-property', 'Propriété', 'Énoncé de la propriété...')} title="Bloc Propriété">
        <Scale className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn onClick={() => insertBlock('block-example', 'Exemple', "Énoncé de l'exemple...")} title="Bloc Exemple">
        <PenLine className="h-4 w-4" />
      </ToolBtn>

      <Separator orientation="horizontal" className="hidden md:block w-6 my-1" />
      <Separator orientation="vertical" className="md:hidden h-6 mx-1" />

      <ToolBtn onClick={insertTable} title="Insérer un tableau">
        <Table2 className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn onClick={insertImage} title="Ajouter une image">
        <ImagePlus className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn onClick={insertHorizontalRule} title="Ajouter une ligne de séparation">
        <Minus className="h-4 w-4" />
      </ToolBtn>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onMouseDown={(e) => e.preventDefault()}
            title="Couleur du texte"
            aria-label="Couleur du texte"
          >
            <Palette className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
          <p className="text-xs text-muted-foreground mb-2 px-1">
            Sélectionnez du texte dans la leçon, puis choisissez une couleur
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {TEXT_COLORS.map((c) => (
              <button
                key={c.className}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyColor(c.className)}
                title={c.label}
                aria-label={`Colorer en ${c.label.toLowerCase()}`}
                className="h-7 w-7 rounded-full border border-border/60 shadow-sm hover:scale-110 transition-transform"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row gap-3" dir="ltr">
      {toolbar}
      <div className="relative flex-1 min-w-0">
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
    </div>
  );
}

/**
 * Édition directe "click-to-edit" du contenu d'une leçon : le même rendu
 * visuel (tailles de titres, couleurs, structure) qu'en lecture, sans mode
 * "Modifier" séparé — on clique dans le texte et on tape. Une barre d'outils
 * à gauche (Titre, blocs Définition/Propriété/Exemple, tableau, image,
 * couleur...) permet d'insérer directement le HTML correspondant sans avoir
 * à connaître la syntaxe, identique à celle de l'éditeur LaTeX
 * (LessonSourceEditor) mais agissant sur le DOM affiché plutôt que sur du
 * texte source. Les formules $...$ / $$...$$ restent du texte brut éditable
 * (pas du KaTeX déjà rendu, trop fragile à modifier en place) ; elles
 * s'affichent en LaTeX rendu uniquement côté élève.
 */
export default function InlineLessonEditor({ content, onChange, placeholder, className, resetKey, onFocusTarget, onBlurTarget }: InlineLessonEditorProps) {
  return (
    <InlineLessonEditorInner
      key={resetKey}
      initialContent={content}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      onFocusTarget={onFocusTarget}
      onBlurTarget={onBlurTarget}
    />
  );
}
