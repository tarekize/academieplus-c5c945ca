import { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import LessonMarkdown from './LessonMarkdown';
import { HtmlWithMath } from './HtmlWithMath';
import {
  Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered,
  Sigma, FunctionSquare, BookMarked, Lightbulb, PenLine,
  Columns2, PanelLeft, PanelRight,
} from 'lucide-react';

interface LessonSourceEditorProps {
  content: string;
  onChange: (value: string) => void;
  editable?: boolean;
}

type Layout = 'split' | 'source' | 'preview';

const isHtmlContent = (s: string) => /<\s*(html|body|head|!doctype)/i.test(s || '');

function renderPreview(content: string) {
  if (!content) {
    return <p className="text-muted-foreground text-sm italic">L'aperçu s'affichera ici...</p>;
  }
  return isHtmlContent(content) ? (
    <HtmlWithMath className="prose prose-sm dark:prose-invert max-w-none" htmlContent={content} />
  ) : (
    <LessonMarkdown content={content} dir="rtl" />
  );
}

/**
 * Éditeur "façon Overleaf" : source LaTeX/Markdown à gauche, aperçu rendu
 * (mêmes blocs pédagogiques ::: et formules KaTeX que la vue élève) à
 * droite. Complète InlineLessonEditor (édition directe dans le rendu) pour
 * les cas où le pédagogue veut voir/corriger le code source précis
 * (formules LaTeX, blocs ::: definition/example...) plutôt que taper
 * directement dans le texte formaté.
 */
export default function LessonSourceEditor({ content, onChange, editable = true }: LessonSourceEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [layout, setLayout] = useState<Layout>('split');

  // Enveloppe la sélection (ou insère un texte par défaut) avec des marqueurs, puis replace le curseur juste après.
  const wrapSelection = useCallback((before: string, after: string, placeholder: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? content.length;
    const end = el.selectionEnd ?? content.length;
    const selected = content.slice(start, end) || placeholder;
    const newValue = content.slice(0, start) + before + selected + after + content.slice(end);
    onChange(newValue);
    requestAnimationFrame(() => {
      el.focus();
      const cursor = start + before.length + selected.length + after.length;
      el.setSelectionRange(cursor, cursor);
    });
  }, [content, onChange]);

  // Insère un bloc pédagogique ::: type ... ::: (déjà supporté par le rendu markdown)
  const insertBlock = useCallback((type: string, placeholder: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? content.length;
    const end = el.selectionEnd ?? content.length;
    const selected = content.slice(start, end) || placeholder;
    const needsLeadingNewline = start > 0 && content[start - 1] !== '\n';
    const snippet = `${needsLeadingNewline ? '\n' : ''}\n::: ${type}\n${selected}\n:::\n`;
    const newValue = content.slice(0, start) + snippet + content.slice(end);
    onChange(newValue);
    requestAnimationFrame(() => {
      el.focus();
      const cursor = start + snippet.length;
      el.setSelectionRange(cursor, cursor);
    });
  }, [content, onChange]);

  if (!editable) {
    return <div className="prose prose-sm dark:prose-invert max-w-none">{renderPreview(content)}</div>;
  }

  const ToolBtn = ({ active, onClick, children, title }: { active?: boolean; onClick: () => void; children: React.ReactNode; title?: string }) => (
    <Button
      type="button"
      variant={active ? 'default' : 'ghost'}
      size="icon"
      className="h-8 w-8 shrink-0"
      onClick={onClick}
      title={title}
    >
      {children}
    </Button>
  );

  return (
    <div className="border rounded-lg overflow-hidden flex flex-col">
      {/* Barre d'outils */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 bg-muted/50 border-b">
        <ToolBtn onClick={() => wrapSelection('**', '**', 'texte en gras')} title="Gras">
          <Bold className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => wrapSelection('*', '*', 'texte en italique')} title="Italique">
          <Italic className="h-4 w-4" />
        </ToolBtn>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToolBtn onClick={() => wrapSelection('\n# ', '', 'Titre')} title="Titre 1">
          <Heading1 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => wrapSelection('\n## ', '', 'Titre')} title="Titre 2">
          <Heading2 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => wrapSelection('\n### ', '', 'Titre')} title="Titre 3">
          <Heading3 className="h-4 w-4" />
        </ToolBtn>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToolBtn onClick={() => wrapSelection('\n- ', '', 'élément')} title="Liste à puces">
          <List className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => wrapSelection('\n1. ', '', 'élément')} title="Liste numérotée">
          <ListOrdered className="h-4 w-4" />
        </ToolBtn>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToolBtn onClick={() => wrapSelection('$', '$', 'x^2')} title="Formule LaTeX en ligne ($...$)">
          <Sigma className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => wrapSelection('\n$$\n', '\n$$\n', '\\int_a^b f(x)\\,dx')} title="Formule LaTeX en bloc ($$...$$)">
          <FunctionSquare className="h-4 w-4" />
        </ToolBtn>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToolBtn onClick={() => insertBlock('definition', 'Énoncé de la définition...')} title="Bloc Définition">
          <BookMarked className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => insertBlock('theorem', 'Énoncé du théorème...')} title="Bloc Théorème">
          <Lightbulb className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => insertBlock('example', "Énoncé de l'exemple...")} title="Bloc Exemple">
          <PenLine className="h-4 w-4" />
        </ToolBtn>

        {/* Bascule d'affichage */}
        <div className="ml-auto flex items-center gap-0.5">
          <ToolBtn active={layout === 'source'} onClick={() => setLayout('source')} title="Source seule">
            <PanelLeft className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn active={layout === 'split'} onClick={() => setLayout('split')} title="Source + Aperçu">
            <Columns2 className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn active={layout === 'preview'} onClick={() => setLayout('preview')} title="Aperçu seul">
            <PanelRight className="h-4 w-4" />
          </ToolBtn>
        </div>
      </div>

      {/* Zone Source / Aperçu, façon Overleaf */}
      <div className={cn('grid divide-border', layout === 'split' ? 'grid-cols-1 lg:grid-cols-2 lg:divide-x' : 'grid-cols-1')}>
        {layout !== 'preview' && (
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            dir="auto"
            spellCheck={false}
            placeholder={"Écrivez le contenu en Markdown + LaTeX...\n\nExemples :\n**gras**, *italique*, # Titre\nFormule en ligne : $x^2 + y^2 = z^2$\nFormule en bloc :\n$$\\int_a^b f(x)\\,dx$$"}
            className="min-h-[480px] w-full rounded-none border-0 font-mono text-sm resize-none focus-visible:ring-0 focus-visible:ring-offset-0 border-b lg:border-b-0"
          />
        )}
        {layout !== 'source' && (
          <div className="min-h-[480px] p-4 overflow-auto bg-card">
            {renderPreview(content)}
          </div>
        )}
      </div>
    </div>
  );
}
