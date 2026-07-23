import { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { uploadLessonImage } from '@/lib/lessonMedia';
import LessonMarkdown from './LessonMarkdown';
import { HtmlWithMath } from './HtmlWithMath';
import {
  Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered,
  Sigma, FunctionSquare, BookMarked, Scale, PenLine,
  Table2, ImagePlus, Minus, Palette, Loader2,
  Columns2, PanelLeft, PanelRight,
} from 'lucide-react';

// Palette de couleurs proposée par le bouton "Couleur" : classes CSS fixes
// (définies dans index.css sous .lesson-markdown, pas des classes Tailwind
// arbitraires — celles-ci ne seraient pas générées par le JIT puisqu'elles
// n'apparaissent dans aucun fichier scanné au build, seulement dans du
// contenu de leçon stocké en base).
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
    <HtmlWithMath className="lesson-markdown prose prose-sm dark:prose-invert max-w-none" htmlContent={content} />
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
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [layout, setLayout] = useState<Layout>('split');
  const [uploadingImage, setUploadingImage] = useState(false);

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

  // Insère un texte fixe à la position du curseur (sans envelopper de sélection).
  const insertAtCursor = useCallback((snippet: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? content.length;
    const end = el.selectionEnd ?? content.length;
    const needsLeadingNewline = start > 0 && content[start - 1] !== '\n';
    const text = `${needsLeadingNewline ? '\n' : ''}${snippet}`;
    const newValue = content.slice(0, start) + text + content.slice(end);
    onChange(newValue);
    requestAnimationFrame(() => {
      el.focus();
      const cursor = start + text.length;
      el.setSelectionRange(cursor, cursor);
    });
  }, [content, onChange]);

  const insertTable = useCallback(() => {
    insertAtCursor('\n| Colonne 1 | Colonne 2 |\n| --- | --- |\n| Valeur 1 | Valeur 2 |\n| Valeur 3 | Valeur 4 |\n');
  }, [insertAtCursor]);

  // Le bouton "Ajouter une image" ouvre le sélecteur de fichiers de
  // l'appareil ; l'upload réel a lieu dans handleImageSelected ci-dessous.
  const insertImage = useCallback(() => {
    imageInputRef.current?.click();
  }, []);

  const handleImageSelected = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadLessonImage(file);
      insertAtCursor(`\n![${file.name}](${url})\n`);
      toast.success('Image ajoutée');
    } catch (error: any) {
      toast.error("Erreur lors de l'import de l'image", { description: error.message });
    } finally {
      setUploadingImage(false);
    }
  }, [insertAtCursor]);

  const insertHorizontalRule = useCallback(() => {
    insertAtCursor('\n---\n');
  }, [insertAtCursor]);

  // Colore la sélection : ne fait rien si rien n'est sélectionné (contrairement à
  // wrapSelection, un texte de remplissage coloré au hasard serait déroutant).
  const applyColor = useCallback((colorClass: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    if (start === end) {
      toast.info('Sélectionnez d\'abord le texte à colorer, puis choisissez une couleur.');
      el.focus();
      return;
    }
    wrapSelection(`<span class="${colorClass}">`, '</span>', '');
  }, [wrapSelection]);

  if (!editable) {
    return <div className="prose prose-sm dark:prose-invert max-w-none">{renderPreview(content)}</div>;
  }

  const ToolBtn = ({ active, onClick, children, title, disabled }: { active?: boolean; onClick: () => void; children: React.ReactNode; title?: string; disabled?: boolean }) => (
    <Button
      type="button"
      variant={active ? 'default' : 'ghost'}
      size="icon"
      className="h-8 w-8 shrink-0"
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
    >
      {children}
    </Button>
  );

  return (
    <div className="border rounded-lg overflow-hidden flex flex-col">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageSelected}
      />
      {/* Barre d'outils */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 bg-muted/50 border-b">
        <ToolBtn onClick={() => wrapSelection('**', '**', 'texte en gras')} title="Gras">
          <Bold className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => wrapSelection('*', '*', 'texte en italique')} title="Italique">
          <Italic className="h-4 w-4" />
        </ToolBtn>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToolBtn onClick={() => wrapSelection('\n# ', '', 'Titre')} title="Titre">
          <Heading1 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => wrapSelection('\n## ', '', 'Sous-titre')} title="Sous-titre">
          <Heading2 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => wrapSelection('\n### ', '', 'Sous-sous-titre')} title="Sous-sous-titre">
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
        <ToolBtn onClick={() => insertBlock('property', 'Énoncé de la propriété...')} title="Bloc Propriété">
          <Scale className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => insertBlock('example', "Énoncé de l'exemple...")} title="Bloc Exemple">
          <PenLine className="h-4 w-4" />
        </ToolBtn>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToolBtn onClick={insertTable} title="Insérer un tableau">
          <Table2 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={insertImage} title="Ajouter une image depuis l'appareil" disabled={uploadingImage}>
          {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
        </ToolBtn>
        <ToolBtn onClick={insertHorizontalRule} title="Ajouter une ligne de séparation">
          <Minus className="h-4 w-4" />
        </ToolBtn>

        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" title="Couleur du texte" aria-label="Couleur du texte">
              <Palette className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <p className="text-xs text-muted-foreground mb-2 px-1">
              Sélectionnez du texte dans l'éditeur, puis choisissez une couleur
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c.className}
                  type="button"
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
